#!/usr/bin/env node
/**
 * URLs bei IndexNow (Bing, Yandex, …) und der Google Indexing API anmelden.
 *
 * Aufruf:
 *   node scripts/submit-indexing.mjs wbs-rechner erbbaurecht-rechner   # einzelne Slugs
 *   node scripts/submit-indexing.mjs --since <git-ref>                  # alle seit <ref> neu angelegten src/pages/*.astro
 *   node scripts/submit-indexing.mjs --all                              # alle URLs aus der Live-Sitemap (max. 200/Tag Google)
 *   … --dry-run                                                          # nur anzeigen
 *   … --no-google                                                        # nur IndexNow
 *
 * Google: Service-Account-JSON über GCP_SA_FILE (Pfad) oder GCP_SA_B64 (Base64). Der Service-Account muss in der
 * Search Console als Inhaber von deutschland-rechner.de eingetragen sein. Quota: 200 URLs/Tag. Keine Abhängigkeit
 * auf googleapis – der JWT wird mit node:crypto signiert.
 *
 * IndexNow-Key liegt unter public/<KEY>.txt (Commit ea0d151d).
 */
import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';

const SITE_URL = 'https://www.deutschland-rechner.de';
const HOST = 'www.deutschland-rechner.de';
const INDEXNOW_KEY = 'a8f3e9b2c4d6071e5f9a1b3c7d8e2f40';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const noGoogle = args.includes('--no-google');
const allMode = args.includes('--all');
const sinceIdx = args.indexOf('--since');
const sinceRef = sinceIdx >= 0 ? args[sinceIdx + 1] : null;
const slugs = args.filter((a, i) => !a.startsWith('--') && i !== sinceIdx + 1);

async function fetchSitemapUrls() {
  const idx = await (await fetch(`${SITE_URL}/sitemap-index.xml`)).text();
  const children = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = [];
  for (const c of children) {
    const xml = await (await fetch(c)).text();
    urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  }
  return urls;
}

let urls;
if (allMode) {
  urls = await fetchSitemapUrls();
} else if (sinceRef) {
  const out = execSync(`git diff --name-status --diff-filter=A ${sinceRef}..HEAD -- src/pages`, { encoding: 'utf8' });
  urls = out.split('\n').filter(Boolean).map((l) => l.split(/\s+/)[1]).filter((f) => f?.endsWith('.astro') && !f.includes('['))
    .map((f) => `${SITE_URL}/${f.replace(/^src\/pages\//, '').replace(/\.astro$/, '').replace(/\/index$/, '')}`);
} else if (slugs.length) {
  urls = slugs.map((s) => `${SITE_URL}/${s.replace(/^\/+|\/+$/g, '')}`);
} else {
  console.error('Keine URLs. Slugs angeben, --since <ref> oder --all.');
  process.exit(1);
}
if (urls.length > 200) { console.log(`⚠️  ${urls.length} URLs > 200/Tag Google-Quota, nur die ersten 200.`); urls = urls.slice(0, 200); }

console.log(`📋 ${urls.length} URLs:\n${urls.map((u) => '   ' + u).join('\n')}\n`);
if (dryRun) { console.log('🏃 Dry-Run, nichts gesendet.'); process.exit(0); }

// Vorab prüfen, dass die Seiten live sind (sonst meldet man 404s an)
const missing = [];
for (const u of urls) { const r = await fetch(u, { method: 'HEAD' }); if (!r.ok) missing.push(`${u} → ${r.status}`); }
if (missing.length) { console.log(`❌ Nicht erreichbar, Abbruch:\n${missing.map((m) => '   ' + m).join('\n')}`); process.exit(1); }
console.log('✅ Alle URLs liefern 200.\n');

// ── IndexNow ─────────────────────────────────────────────────────────────────
console.log('🔵 IndexNow');
const body = JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList: urls });
for (const ep of ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow', 'https://yandex.com/indexnow']) {
  try {
    const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body });
    console.log(`   ${r.ok ? '✅' : '⚠️ '} ${new URL(ep).hostname}: HTTP ${r.status}`);
  } catch (e) { console.log(`   ❌ ${ep}: ${e.message}`); }
}

// ── Google Indexing API ──────────────────────────────────────────────────────
if (noGoogle) { console.log('\n🟡 Google übersprungen (--no-google)'); process.exit(0); }
let sa = null;
if (process.env.GCP_SA_B64) sa = JSON.parse(Buffer.from(process.env.GCP_SA_B64, 'base64').toString('utf8'));
else if (process.env.GCP_SA_FILE) sa = JSON.parse(await readFile(process.env.GCP_SA_FILE, 'utf8'));
if (!sa) { console.log('\n🟡 Google übersprungen: GCP_SA_FILE oder GCP_SA_B64 setzen.'); process.exit(0); }

async function accessToken(scope) {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error(`Token-Fehler: ${JSON.stringify(j)}`);
  return j.access_token;
}

console.log(`\n🔴 Google Indexing API (${sa.client_email})`);
const token = await accessToken('https://www.googleapis.com/auth/indexing');
let ok = 0, failed = 0;
for (const url of urls) {
  const r = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  const j = await r.json().catch(() => ({}));
  if (r.ok) { ok++; console.log(`   ✅ ${url}`); }
  else {
    failed++;
    console.log(`   ⚠️  ${url}: ${r.status} ${j.error?.message || ''}`);
    if (r.status === 429 || r.status === 403) { console.log('   🛑 Abbruch (Quota/Berechtigung)'); break; }
  }
  await new Promise((res) => setTimeout(res, 600));
}
console.log(`\n   Google: ${ok} ok, ${failed} fehlgeschlagen`);
