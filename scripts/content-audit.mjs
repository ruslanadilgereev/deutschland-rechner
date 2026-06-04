// content-audit.mjs - misst echten gerenderten Editorial-Content pro Seite (ASCII-only Output)
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const SRC_PAGES = 'src/pages';

// Hub/Legal-Seiten die KEINE Rechner sind (separate Bewertung)
const NON_CALC = new Set([
  'index','404','impressum','datenschutz','kontakt','ueber-uns','werbehinweise','mitmachen',
  'gesundheit','alltag-lifestyle','auto-mobilitaet','finanzen-kredit','arbeit-gehalt',
  'familie-kinder','sozialleistungen','wohnen-immobilien','steuern-abgaben',
]);

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMain(html) {
  const m = html.match(/<main[\s\S]*?<\/main>/i);
  return m ? m[0] : html;
}

// Liste der Rechner-Slugs aus src/pages
const slugs = readdirSync(SRC_PAGES)
  .filter(f => f.endsWith('.astro'))
  .map(f => f.replace('.astro',''));

const rows = [];
for (const slug of slugs) {
  const indexPath = join(DIST, slug, 'index.html');
  let html;
  try { html = readFileSync(indexPath, 'utf8'); }
  catch {
    // index.astro -> dist/index.html
    try { html = readFileSync(join(DIST, slug + '.html'), 'utf8'); }
    catch { try { html = readFileSync(join(DIST,'index.html'),'utf8'); } catch { continue; } }
  }
  const mainHtml = extractMain(html);
  const text = stripTags(mainHtml);
  const words = text ? text.split(' ').length : 0;

  // Struktur-Signale
  const h2 = (mainHtml.match(/<h2/gi) || []).length;
  const h3 = (mainHtml.match(/<h3/gi) || []).length;
  const details = (mainHtml.match(/<details/gi) || []).length; // sichtbares FAQ/Akkordeon
  const hasFaqSchema = /"@type"\s*:\s*"FAQPage"|FAQPage/.test(html);
  const hasVisibleFaq = details > 0 || /Häufig|Haufig|FAQ|Fragen/i.test(mainHtml);
  const hasTrust = /Zuletzt aktualisiert|Geprüft|Geprueft|Quelle|Stand:/i.test(mainHtml);
  const hasVerwandte = /Verwandte Rechner|Ähnliche Rechner/i.test(mainHtml);
  const hasFehler = /Typische Fehler|Häufige Fehler|Haufige Fehler|Sonderfäll|Sonderfall/i.test(mainHtml);
  const hasWebApp = /WebApplication/.test(html);

  rows.push({ slug, words, h2, h3, details, hasFaqSchema, hasVisibleFaq, hasTrust, hasVerwandte, hasFehler, hasWebApp,
    isCalc: !NON_CALC.has(slug) });
}

rows.sort((a,b) => a.words - b.words);

// Report
const calc = rows.filter(r => r.isCalc);
const faqMismatch = calc.filter(r => r.hasFaqSchema && r.details === 0); // Schema-FAQ aber kein sichtbares <details>
const noTrust = calc.filter(r => !r.hasTrust);
const noFehler = calc.filter(r => !r.hasFehler);
const thin = calc.filter(r => r.words < 450);
const veryThin = calc.filter(r => r.words < 300);

function line(r){
  return `${String(r.words).padStart(4)}w  h2:${r.h2} h3:${r.h3} det:${r.details}  ` +
    `${r.hasFaqSchema?'FAQ-S':'     '} ${r.details>0?'FAQ-V':'     '} ` +
    `${r.hasTrust?'TRUST':'     '} ${r.hasFehler?'FEHL':'    '}  ${r.slug}`;
}

let out = '';
out += `=== CONTENT AUDIT (rendered <main> text) ===\n`;
out += `Calc-Seiten: ${calc.length}\n`;
out += `Median Woerter: ${calc.map(r=>r.words).sort((a,b)=>a-b)[Math.floor(calc.length/2)]}\n`;
out += `\n--- ALLE CALC-SEITEN nach Wortzahl (aufsteigend) ---\n`;
out += calc.map(line).join('\n');
out += `\n\n--- FAQ-MISMATCH (Schema-FAQ ohne sichtbares <details>): ${faqMismatch.length} ---\n`;
out += faqMismatch.map(r=>r.slug).join(', ');
out += `\n\n--- OHNE TRUST-BLOCK: ${noTrust.length} ---\n`;
out += noTrust.map(r=>r.slug).join(', ');
out += `\n\n--- OHNE 'Typische Fehler': ${noFehler.length} ---\n`;
out += noFehler.map(r=>r.slug).join(', ');
out += `\n\n--- THIN (<450w): ${thin.length} ---\n`;
out += thin.map(r=>`${r.words}w ${r.slug}`).join('\n');
out += `\n\n--- VERY THIN (<300w): ${veryThin.length} ---\n`;
out += veryThin.map(r=>`${r.words}w ${r.slug}`).join('\n');

writeFileSync('scripts/content-audit-report.txt', out);
writeFileSync('scripts/content-audit-data.json', JSON.stringify(rows, null, 2));
console.log(out.slice(0, 200));
console.log('\n[OK] Report -> scripts/content-audit-report.txt');
console.log('[OK] Data   -> scripts/content-audit-data.json');
