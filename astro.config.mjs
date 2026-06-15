import { execSync } from 'node:child_process';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Per-Seite lastmod aus der Git-History (echtes Aenderungsdatum statt Build-Zeit).
// Best-effort: bei flacher History/fehlendem Git bleibt lastmod fuer die Seite leer –
// besser als ein falsches "alle = jetzt", das Google als Signal entwertet.
function gitLastmodMap() {
  const map = {};
  try {
    const out = execSync(
      'git log --no-merges --date=iso-strict --format=%x01%cI --name-only -- src/pages',
      { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 },
    );
    let cur = null;
    for (const line of out.split('\n')) {
      if (line[0] === '\x01') { cur = line.slice(1).trim(); continue; }
      const m = line.match(/^src\/pages\/(.+)\.astro$/);
      if (m && cur) {
        const k = m[1] === 'index' ? '' : m[1].replace(/\/index$/, '');
        if (!(k in map)) map[k] = cur; // erstes Vorkommen = neuestes Commit
      }
    }
  } catch {}
  return map;
}
const LASTMOD = gitLastmodMap();

export default defineConfig({
  site: 'https://www.deutschland-rechner.de',
  trailingSlash: 'never',
  integrations: [
    react(), 
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.8,
      serialize(item) {
        const p = new URL(item.url).pathname.replace(/^\/|\/$/g, '');
        const d = LASTMOD[p];
        if (d) item.lastmod = d;
        return item;
      },
    }),
  ],
  output: 'static',
  // CSS inline in den <head> statt als render-blocking <link> – verhindert das
  // kurze Aufblitzen von ungestyltem HTML (FOUC) beim ersten Paint, weil keine
  // externe CSS-Ressource mehr abgewartet werden muss.
  build: { inlineStylesheets: 'always' },
});
