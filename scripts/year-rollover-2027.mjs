#!/usr/bin/env node
/**
 * Jahres-Rollover 2026 → 2027 für Seiten OHNE rechtliche Jahreswerte (Material-, Bau-, Gesundheits-, Alltagsrechner).
 * Die Liste steht in scripts/year-rollover-2027.json (Kategorie B aus seo-operation-2027.md). Ersetzt die Jahreszahl nur in
 * `const title`, `const description`, `const keywords` und `<h1>` – nicht im Fließtext, nicht in Komponenten.
 *
 *   node scripts/year-rollover-2027.mjs            # Dry-Run: zeigt, was sich ändern würde
 *   node scripts/year-rollover-2027.mjs --apply    # schreibt die Dateien
 *   node scripts/year-rollover-2027.mjs --apply --date "5. Januar 2027"   # setzt zusätzlich „Zuletzt aktualisiert"
 *
 * Danach: npm run build, node scripts/jsonld-check.mjs, node scripts/link-check.mjs, Commit nur dieser Dateien.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const di = process.argv.indexOf('--date');
const DATE = di >= 0 ? process.argv[di + 1] : null;
const slugs = JSON.parse(readFileSync(new URL('./year-rollover-2027.json', import.meta.url), 'utf8'));

const RE = [
  /(const title = (["']))([^"']*)(\2;)/,
  /(const description = (["']))([^"']*)(\2;)/,
  /(const keywords = (["']))([^"']*)(\2;)/,
  /(<h1[^>]*>)([^<]*)(<\/h1>)/,
];
const DATE_RE = /(Zuletzt aktualisiert(?: am)?:?\s*(?:<\/strong>\s*)?)((?:\d{1,2}\.\s?)?(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s?2026|\d{2}\.\d{2}\.2026)/;

let changed = 0;
for (const slug of slugs) {
  const file = `src/pages/${slug}.astro`;
  if (!existsSync(file)) { console.log(`❌ fehlt: ${file}`); continue; }
  const orig = readFileSync(file, 'utf8');
  let s = orig;
  const diff = [];
  for (const re of RE) {
    s = s.replace(re, (m, a, _q, mid, z) => {
      if (!/2026/.test(mid)) return m;
      const neu = mid.replace(/2026\/2027|2026 & 2027|2026/g, '2027');
      diff.push(`${mid.slice(0, 60)} → ${neu.slice(0, 60)}`);
      return `${a}${neu}${z}`;
    });
  }
  if (DATE && DATE_RE.test(s)) s = s.replace(DATE_RE, `$1${DATE}`);
  if (s === orig) { console.log(`– ${slug}: nichts zu tun`); continue; }
  changed++;
  console.log(`${APPLY ? '✅' : '👀'} ${slug}\n   ${diff.join('\n   ')}`);
  if (APPLY) writeFileSync(file, s);
}
console.log(`\n${changed} Seiten ${APPLY ? 'geändert' : 'würden geändert (--apply zum Schreiben)'}.`);
