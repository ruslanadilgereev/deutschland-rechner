// guide-crosslinks.mjs - fuegt auf passenden Rechner-Seiten einen Ratgeber-Querverweis ein.
// Deterministisch, additiv, vor letztem </main>. ASCII-only Konsolen-Output.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'src/pages';
const APPLY = process.argv.includes('--apply');

const GUIDE_TITLES = {
  'steuerklasse-wechseln': 'Steuerklasse wechseln 2026: Antrag, Fristen & Kombination',
  'brutto-netto-verstehen': 'Vom Brutto zum Netto 2026: Alle Abgaben erklärt',
  'minijob-midijob': 'Minijob & Midijob 2026: Grenzen, Beiträge, Netto',
  'elterngeld-beantragen': 'Elterngeld 2026 beantragen: Höhe, Antrag & Tricks',
  'buergergeld-anspruch': 'Bürgergeld 2026: Anspruch & Regelsätze einfach erklärt',
  'hauskauf-nebenkosten': 'Kaufnebenkosten beim Hauskauf 2026 richtig einplanen',
  'rente-mit-63-65-67': 'Rente mit 63, 65 oder 67: Was für dich gilt',
};

// Rechner-Slug -> primaerer Ratgeber
const MAP = {
  'steuerklassen-rechner': 'steuerklasse-wechseln',
  'steuerklassenwechsel-rechner': 'steuerklasse-wechseln',
  'brutto-netto-rechner': 'brutto-netto-verstehen',
  'lohnsteuer-rechner': 'brutto-netto-verstehen',
  'einkommensteuer-rechner': 'brutto-netto-verstehen',
  'krankenkassenbeitrag-rechner': 'brutto-netto-verstehen',
  'soli-rechner': 'brutto-netto-verstehen',
  'minijob-rechner': 'minijob-midijob',
  'midijob-rechner': 'minijob-midijob',
  'stundenlohn-rechner': 'minijob-midijob',
  'elterngeld-rechner': 'elterngeld-beantragen',
  'elternzeit-rechner': 'elterngeld-beantragen',
  'mutterschutz-rechner': 'elterngeld-beantragen',
  'kindergeld-rechner': 'elterngeld-beantragen',
  'buergergeld-rechner': 'buergergeld-anspruch',
  'wohngeld-rechner': 'buergergeld-anspruch',
  'kinderzuschlag-rechner': 'buergergeld-anspruch',
  'kaufnebenkosten-rechner': 'hauskauf-nebenkosten',
  'grunderwerbsteuer-rechner': 'hauskauf-nebenkosten',
  'notarkosten-rechner': 'hauskauf-nebenkosten',
  'maklerkosten-rechner': 'hauskauf-nebenkosten',
  'baufinanzierung-rechner': 'hauskauf-nebenkosten',
  'renten-rechner': 'rente-mit-63-65-67',
  'rentenluecke-rechner': 'rente-mit-63-65-67',
  'fruehrente-rechner': 'rente-mit-63-65-67',
  'rentensteuer-rechner': 'rente-mit-63-65-67',
};

function box(guideSlug) {
  const t = GUIDE_TITLES[guideSlug];
  return `
    <!-- Ratgeber-Querverweis -->
    <div class="max-w-2xl mx-auto px-4 mt-6">
      <a href="/ratgeber/${guideSlug}" class="block bg-indigo-50 border border-indigo-200 rounded-2xl p-5 hover:bg-indigo-100 transition-colors">
        <span class="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Passender Ratgeber</span>
        <p class="font-semibold text-gray-900 mt-1">📖 ${t}</p>
        <p class="text-sm text-gray-600 mt-1">Hintergrund, Fristen und ein durchgerechnetes Beispiel zum Thema – Schritt für Schritt erklärt.</p>
        <span class="inline-block mt-2 text-sm font-medium text-indigo-600">Zum Ratgeber &rarr;</span>
      </a>
    </div>
`;
}

let applied = 0, skipped = 0, errors = 0;
const log = [];
for (const [calc, guide] of Object.entries(MAP)) {
  const p = join(SRC, calc + '.astro');
  if (!existsSync(p)) { log.push(`[SKIP] ${calc}: keine Datei`); skipped++; continue; }
  let src = readFileSync(p, 'utf8');
  if (src.includes('Ratgeber-Querverweis') || src.includes(`/ratgeber/${guide}`)) {
    log.push(`[SKIP] ${calc}: bereits verlinkt`); skipped++; continue;
  }
  const idx = src.lastIndexOf('</main>');
  if (idx === -1) { log.push(`[ERR ] ${calc}: kein </main>`); errors++; continue; }
  const out = src.slice(0, idx) + box(guide) + '  ' + src.slice(idx);
  log.push(`[${APPLY ? 'WRITE' : 'WOULD'}] ${calc} -> ${guide}`);
  if (APPLY) { writeFileSync(p, out); applied++; }
}
console.log(log.join('\n'));
console.log(`\nMapped: ${Object.keys(MAP).length} | applied/would: ${APPLY ? applied : log.filter(l=>l.startsWith('[WOULD')).length} | skipped: ${skipped} | errors: ${errors}`);
