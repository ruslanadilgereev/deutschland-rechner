// jsonld-check.mjs - validiert alle JSON-LD-Bloecke im dist. ASCII-only Output.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(d) {
  let o = [];
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) o = o.concat(walk(p));
    else if (e.endsWith('.html')) o.push(p);
  }
  return o;
}

const files = walk('dist');
let total = 0, bad = 0, faqPages = 0, articlePages = 0;
const errs = [];
const reScript = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;

for (const f of files) {
  const html = readFileSync(f, 'utf8');
  let m;
  while ((m = reScript.exec(html)) !== null) {
    total++;
    try {
      const o = JSON.parse(m[1].trim());
      const arr = Array.isArray(o) ? o : [o];
      if (arr.some(x => x && x['@type'] === 'FAQPage')) faqPages++;
      if (arr.some(x => x && x['@type'] === 'Article')) articlePages++;
    } catch (e) {
      bad++;
      const rel = f.split(/[\\/]/).slice(-2).join('/');
      if (errs.length < 20) errs.push(rel + ': ' + e.message.slice(0, 70));
    }
  }
}

console.log('HTML-Dateien:', files.length);
console.log('JSON-LD Bloecke total:', total);
console.log('FAQPage-Schemas:', faqPages);
console.log('Article-Schemas:', articlePages);
console.log('INVALIDE JSON-LD:', bad);
for (const e of errs) console.log('  [BAD]', e);
if (bad === 0) console.log('[OK] alle JSON-LD valide');
