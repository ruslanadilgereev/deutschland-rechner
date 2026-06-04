// link-check.mjs - prueft interne Links gegen vorhandene Seiten/Routen. ASCII-only Output.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'src/pages';

// Alle existierenden Routen aus src/pages (rekursiv, .astro)
function collectRoutes(dir, prefix = '') {
  const routes = new Set();
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      for (const r of collectRoutes(p, prefix + '/' + e)) routes.add(r);
    } else if (e.endsWith('.astro')) {
      const name = e.replace(/\.astro$/, '');
      if (name === 'index') routes.add(prefix === '' ? '/' : prefix);
      else if (name === '404') {/* skip */}
      else routes.add((prefix + '/' + name));
    }
  }
  return routes;
}

const routes = collectRoutes(SRC);
routes.add('/'); // sicher
const known = new Set([...routes]);

// alle .astro/.tsx Dateien sammeln
function allFiles(dir) {
  let out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out = out.concat(allFiles(p));
    else if (e.endsWith('.astro') || e.endsWith('.tsx')) out.push(p);
  }
  return out;
}

const files = allFiles('src');
const broken = {};
const hrefRe = /href=["'`](\/[a-zA-Z0-9\-_/]*)["'`]/g;

for (const f of files) {
  const s = readFileSync(f, 'utf8');
  let m;
  while ((m = hrefRe.exec(s)) !== null) {
    let href = m[1];
    if (href === '/') continue;
    href = href.replace(/\/$/, ''); // trailing slash weg
    // Anker/Query strippen schon durch Regex (nur [\w-/])
    if (!known.has(href)) {
      (broken[href] ||= new Set()).add(f.replace(/\\/g, '/'));
    }
  }
}

const entries = Object.entries(broken).sort((a, b) => b[1].size - a[1].size);
console.log('=== INTERNAL LINK CHECK ===');
console.log('Routen erkannt:', known.size);
console.log('Kaputte interne Link-Ziele:', entries.length);
for (const [href, set] of entries) {
  console.log(`\n[BROKEN] ${href}  (${set.size}x)`);
  console.log('  ' + [...set].slice(0, 8).join('\n  '));
}
if (entries.length === 0) console.log('\n[OK] keine kaputten internen Links gefunden.');
