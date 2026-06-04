// faq-surface.mjs
// Macht FAQPage-JSON-LD sichtbar: erzeugt aus dem bereits existierenden Schema-Q&A
// einen sichtbaren <details>-FAQ-Block (Gold-Standard-Markup) und fuegt ihn vor </main> ein.
// KEINE neuen Fakten - nur Sichtbarmachen vorhandener Antworten. ASCII-only Output.
//
// Usage:
//   node scripts/faq-surface.mjs --dry rentabilitaets-rechner   (Vorschau eine Seite)
//   node scripts/faq-surface.mjs --dry                          (Vorschau Counts alle)
//   node scripts/faq-surface.mjs --apply                        (schreibt alle Kandidaten)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const SRC = 'src/pages';
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const APPLY = args.includes('--apply');
const ONLY = args.find(a => !a.startsWith('--'));

const data = JSON.parse(readFileSync('scripts/content-audit-data.json', 'utf8'));
let candidates = data.filter(r => r.isCalc && r.hasFaqSchema && r.details === 0);
if (ONLY) candidates = candidates.filter(r => r.slug === ONLY);

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

function extractFaq(distHtml) {
  const scripts = [...distHtml.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of scripts) {
    let obj;
    try { obj = JSON.parse(m[1].trim()); } catch { continue; }
    const arr = Array.isArray(obj) ? obj : [obj];
    for (const o of arr) {
      if (o && o['@type'] === 'FAQPage' && Array.isArray(o.mainEntity)) {
        return o.mainEntity
          .map(q => ({
            q: (q.name || '').trim(),
            a: (q.acceptedAnswer && q.acceptedAnswer.text || '').trim(),
          }))
          .filter(x => x.q && x.a);
      }
    }
  }
  return null;
}

function buildBlock(faqs) {
  const items = faqs.map(({ q, a }) => `          <details class="border border-gray-200 rounded-lg">
            <summary class="p-4 cursor-pointer font-medium text-gray-800 hover:bg-gray-50">${htmlEscape(q)}</summary>
            <div class="px-4 pb-4 text-sm text-gray-600">
              <p>${htmlEscape(a)}</p>
            </div>
          </details>`).join('\n');
  return `
    <!-- FAQ Section (sichtbar) - aus FAQ-Schema sichtbar gemacht -->
    <div class="max-w-2xl mx-auto px-4 mt-6">
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">&#10067; Häufig gestellte Fragen</h2>
        <div class="space-y-4">
${items}
        </div>
      </div>
    </div>
`;
}

let applied = 0, skipped = 0, errors = 0;
const log = [];

for (const r of candidates) {
  const slug = r.slug;
  const distPath = join(DIST, slug, 'index.html');
  const srcPath = join(SRC, slug + '.astro');
  if (!existsSync(distPath)) { log.push(`[SKIP] ${slug}: no dist html`); skipped++; continue; }
  if (!existsSync(srcPath)) { log.push(`[SKIP] ${slug}: no src`); skipped++; continue; }

  const distHtml = readFileSync(distPath, 'utf8');
  const faqs = extractFaq(distHtml);
  if (!faqs || faqs.length === 0) { log.push(`[SKIP] ${slug}: no FAQ in schema`); skipped++; continue; }

  let src = readFileSync(srcPath, 'utf8');

  // Guard 1: schon einen sichtbar-gemachten Block? -> skip
  if (src.includes('FAQ Section (sichtbar)')) { log.push(`[SKIP] ${slug}: already has visible FAQ marker`); skipped++; continue; }

  // Guard 2: erscheint die erste Frage bereits sichtbar im Body (ohne Script-Bloecke)? -> skip
  // Achtung: Schemas sind selbstschliessende <script .../> Tags -> beide Formen strippen.
  const bodyNoScripts = src
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[\s\S]*?\/>/gi, '');
  const firstQProbe = faqs[0].q.slice(0, 30);
  if (firstQProbe && bodyNoScripts.includes(firstQProbe)) { log.push(`[SKIP] ${slug}: question already visible in body`); skipped++; continue; }

  // Injektion vor dem letzten </main>
  const idx = src.lastIndexOf('</main>');
  if (idx === -1) { log.push(`[ERR ] ${slug}: no </main>`); errors++; continue; }

  const block = buildBlock(faqs);
  const newSrc = src.slice(0, idx) + block + '  ' + src.slice(idx);

  if (DRY && ONLY) {
    console.log(`=== DRY ${slug} (${faqs.length} Q) ===`);
    console.log(block);
  }
  log.push(`[${APPLY ? 'WRITE' : 'WOULD'}] ${slug}: +${faqs.length} FAQ`);
  if (APPLY) { writeFileSync(srcPath, newSrc); applied++; }
}

console.log('\n--- SUMMARY ---');
console.log(log.join('\n'));
console.log(`\nKandidaten: ${candidates.length} | applied/would: ${APPLY ? applied : log.filter(l=>l.startsWith('[WOULD')).length} | skipped: ${skipped} | errors: ${errors}`);
