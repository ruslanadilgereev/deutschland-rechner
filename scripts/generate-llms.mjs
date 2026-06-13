import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Generiert public/llms.txt aus der Registry (src/data/rechner.ts), damit AI-Crawler
// (ChatGPT, Perplexity, Claude) das VOLLE Rechner-Inventar sehen statt einer handgepflegten
// Teilliste. Nimmt nur Einträge mit fertig:true UND existierender Seite <id>-rechner.astro
// (vermeidet tote Links). Header/Fakten/Datenquellen sind kuratiert und hier gepflegt.
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const src = readFileSync(join(root, 'src/data/rechner.ts'), 'utf8');

// Anzeigenamen + Reihenfolge der Kategorien (Spiegel von rechner.ts `kategorien`)
const KATEGORIEN = {
  familie: 'Familie & Kinder',
  arbeit: 'Arbeit & Gehalt',
  steuern: 'Steuern & Abgaben',
  soziales: 'Sozialleistungen',
  wohnen: 'Wohnen & Immobilien',
  gesundheit: 'Gesundheit',
  auto: 'Auto & Mobilität',
  finanzen: 'Finanzen & Kredit',
  alltag: 'Alltag & Lifestyle',
};

// rechnerListe-Array isolieren und Einträge zwischen aufeinanderfolgenden `id:`-Ankern parsen
const body = src.slice(src.indexOf('rechnerListe'));
const anchors = [];
const idRe = /\bid:\s*'([^']+)'/g;
let m;
while ((m = idRe.exec(body)) !== null) anchors.push({ id: m[1], index: m.index });

const field = (chunk, key) => {
  const r = new RegExp(`\\b${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`).exec(chunk);
  return r ? r[1].replace(/\\'/g, "'") : '';
};

const rechner = [];
for (let i = 0; i < anchors.length; i++) {
  const chunk = body.slice(anchors[i].index, anchors[i + 1]?.index ?? body.length);
  rechner.push({
    id: anchors[i].id,
    name: field(chunk, 'name'),
    beschreibung: field(chunk, 'beschreibung'),
    kategorie: field(chunk, 'kategorie'),
    fertig: /\bfertig:\s*true/.test(chunk),
  });
}

const BASE = 'https://www.deutschland-rechner.de';
const skipped = [];
const byCat = {};
for (const r of rechner) {
  if (!r.fertig) continue;
  const slug = `${r.id}-rechner`;
  if (!existsSync(join(root, 'src/pages', `${slug}.astro`))) {
    skipped.push(r.id);
    continue;
  }
  (byCat[r.kategorie] ??= []).push({ ...r, slug });
}

const HEADER = `# Deutschlandrechner
> Kostenlose Online-Rechner für Deutschland: Kindergeld, Bürgergeld, Brutto-Netto, Elterngeld, Steuern und mehr. Alle Werte aktuell für 2026.

## Wichtige Fakten 2026 (Deutschland)

- **Kindergeld:** 259€ pro Kind pro Monat (einheitlich seit 2023)
- **Mindestlohn:** 13,90€ pro Stunde (ab 01.01.2026)
- **Grundfreibetrag:** 12.348€ (steuerfrei)
- **Bürgergeld Regelsatz:** 563€ (Alleinstehende)
- **BBG Rentenversicherung:** 101.400€ (bundeseinheitlich)
- **BBG Krankenversicherung:** 69.750€
- **Minijob-Grenze:** 603€ pro Monat
- **Midijob-Grenze:** 603€ - 2.000€ pro Monat
- **Kinderfreibetrag:** 9.756€ pro Kind`;

const FOOTER = `## Datenquellen

- Bundesministerium der Finanzen (BMF)
- Bundesministerium für Arbeit und Soziales (BMAS)
- Bundesagentur für Arbeit
- Düsseldorfer Tabelle (OLG Düsseldorf)
- Kraftfahrt-Bundesamt (KBA), Statistisches Bundesamt (Destatis), Umweltbundesamt

## Kontakt

Website: ${BASE}`;

let out = `${HEADER}\n\n## Rechner\n`;
let count = 0;
for (const [key, label] of Object.entries(KATEGORIEN)) {
  const list = byCat[key];
  if (!list || !list.length) continue;
  out += `\n### ${label}\n`;
  for (const r of list) {
    const desc = r.beschreibung ? `: ${r.beschreibung}` : '';
    out += `- [${r.name}](${BASE}/${r.slug})${desc}\n`;
    count++;
  }
}
out += `\n${FOOTER}\n`;

writeFileSync(join(root, 'public/llms.txt'), out, 'utf8');
console.log(`✓ llms.txt: ${count} Rechner in ${Object.keys(byCat).length} Kategorien`);
if (skipped.length) console.log(`  übersprungen (keine Seite): ${skipped.length} → ${skipped.join(', ')}`);
