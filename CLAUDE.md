# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Was das ist

**deutschland-rechner.de** – ~269 kostenlose deutsche Online-Rechner (Kindergeld, Brutto-Netto, Kfz-Steuer, Bußgeld, Hausbau-Material …), SEO-/AdSense-/Affiliate-monetarisiert. Astro 5 (statisch) + React 19 Islands + Tailwind 3, deployt auf Vercel. Alle Rechner-Logik läuft **client-seitig** im Browser – es gibt kein SSR, keine API-Routen, keine Datenbank.

## Commands

```bash
npm run dev       # Astro Dev-Server auf http://localhost:4321 (HMR)
npm run build     # → statisches HTML nach dist/ (+ Sitemap)
npm run preview   # gebautes dist/ lokal servieren (was Vercel ausliefert)
```

Deploy passiert automatisch per `git push` (Vercel-Hook). **Pushen/Deployen nur, wenn der User es ausdrücklich verlangt.**

SEO-/Content-Tooling in `scripts/` (Node, außer keyword_ideas.py):

```bash
node scripts/content-audit.mjs        # Wortzahl/H2/FAQ/Trust pro Seite → content-audit-report.txt
node scripts/jsonld-check.mjs         # validiert JSON-LD in dist/ (braucht vorher: npm run build)
node scripts/link-check.mjs           # interne Links gegen vorhandene src/pages-Routen
node scripts/faq-surface.mjs --dry <slug>      # FAQ-<details> aus FAQPage-Schema ableiten
node scripts/guide-crosslinks.mjs --dry        # Ratgeber-Crosslink-Boxen vorschlagen
node scripts/generate-icons.mjs       # PWA-Icons aus public/favicon.svg (Sharp)
```

⚠️ `faq-surface.mjs` und `guide-crosslinks.mjs` **schreiben Quelldateien mit `--apply`** – immer zuerst `--dry`. `jsonld-check.mjs`/`content-audit.mjs` brauchen ein gebautes `dist/`.

## Architektur: Drei-Teile-Konvention pro Rechner

Jeder Rechner ist **genau ein Slug**, der über drei gekoppelte Dateien per Namenskonvention (nicht erzwungen!) verdrahtet ist:

1. **Registry-Eintrag** in `src/data/rechner.ts` → `rechnerListe: Rechner[]` (Single Source of Truth, ~3345 Zeilen, 269 Einträge, aktuell alle `fertig: true`). Die `id` **ist** der URL-Slug-Stamm.
2. **React-Komponente** in `src/components/rechner/<Name>Rechner.tsx` (die eigentliche Rechen-Logik + UI).
3. **Astro-Seite** in `src/pages/<id>-rechner.astro` (SEO-Hülle, bindet die Komponente per `client:load` ein).

```ts
// src/data/rechner.ts
export interface Rechner {
  id: string;            // kebab-case, = URL-Slug-Stamm (/<id>-rechner)
  name: string;          // Anzeigename
  beschreibung: string;
  icon: string;          // Emoji
  kategorie: 'familie' | 'arbeit' | 'steuern' | 'soziales' | 'wohnen'
           | 'gesundheit' | 'auto' | 'finanzen' | 'alltag';   // 9 fixe Kategorien
  fertig: boolean;       // true = sichtbar/verlinkt
  quellen?: string[];    // Primärquellen-URLs (siehe unten – PFLICHT bei rechtlichen Werten)
  seoKeywords?: string;  // kommasepariert, für Cronjob-Priorisierung
}
```

**Kopplung ist nur Konvention:** Stimmt `src/pages/<id>-rechner.astro` nicht mit der `id` überein, gibt es **keinen Build-Fehler**, nur eine 404. Kategorien sind ein hartcodierter Union-Type + `kategorien`-Objekt – neue Kategorie = Interface + Objekt + Rebuild. Reihenfolge/„Beliebtheit" = reine Array-Position (keine Rank-Felder). Verwandte-Rechner-Links sind **inline in den .astro-Seiten**, nicht datengetrieben.

### Anatomie einer Rechner-Seite (`src/pages/*.astro`)

Referenz: `src/pages/bmi-rechner.astro`. Reihenfolge im `<main>`:

1. `<Layout>` (aus `src/layouts/Layout.astro`) – setzt Meta/OG/Twitter, JSON-LD WebSite+Organization, **CMP (Google Funding Choices) + AdSense** (`ca-pub-2882299135087632`), Vercel Analytics, Header/Footer.
2. `<BreadcrumbSchema>` + `<Breadcrumb>` (Schema + sichtbar).
3. Farbiger Header mit „Alle Rechner"-Zurück-Link, Emoji, `<h1>`.
4. Die React-Komponente: `<XYZRechner client:load />`.
5. **Trust-Block (E-E-A-T)**: „Zuletzt aktualisiert am …", **Grundlage**, **Berücksichtigt**, **Nicht berücksichtigt**.
6. SEO-Content (`<h2>`/`<h3>`, Formeln, Rechenbeispiele).
7. „Typische Fehler & Sonderfälle".
8. **Sichtbare FAQ** als `<details>` (nicht nur Schema!).
9. `<script type="application/ld+json">` mit **WebApplication** + **FAQPage** (die FAQ-Fragen müssen 1:1 zur sichtbaren FAQ passen).

### Anatomie einer Rechner-Komponente (`src/components/rechner/*.tsx`)

Referenzen: einfach `BMIRechner.tsx`/`RotlichtverstossRechner.tsx`, komplex `BussgeldRechner.tsx`, `EinkommensteuerRechner.tsx`, `GehaltserhoehungRechner.tsx` (enthält eine `Lohnsteuer2026`-Klasse mit dem vollen PAP-2026-Algorithmus).

- **State nur `useState` (Inputs) + `useMemo` (Ergebnis)** – kein Redux/Zustand/Context. `useMemo`-Dependency-Arrays müssen vollständig sein (sonst stale Ergebnisse).
- Erste Zeile im JSX meist `<RechnerFeedback rechnerName=… rechnerSlug=… />`.
- **Rechen-Konstanten & Lookup-Tabellen hartcodiert inline** als `const` (Bußgeld-Sätze, Steuer-Stufen, WHO-Grenzen …). Es gibt **kein** geteiltes Berechnungs-Utils-Verzeichnis – Updates an Sätzen/Grenzen passieren direkt in der Komponente.
- Zahlenformat dupliziert pro Komponente: `n.toFixed(d).replace('.', ',')` bzw. `toLocaleString('de-DE')`. Locale `de-DE` ist überall hartcodiert.
- Tailwind-Konvention: `max-w-2xl mx-auto` Container, `bg-white rounded-2xl shadow-lg p-6 mb-6` Cards, großes `text-5xl font-bold` Hauptergebnis, severity-Farbverläufe grün→gelb→rot. `focus:ring-0` + `focus:border-orange-500` (custom Fokus – Keyboard-Nav testen).
- Texte deutsch, Variablen englisch (gemischt – Bestand respektieren).
- Disclaimer „Schätzung – keine Steuer-/Rechtsberatung" + **Quellen-Sektion** gehören ans Ende.

### Affiliate-/Tracking-System (entkoppelt von der Registry)

- `src/data/affiliates.ts` = `PROVIDERS` (Check24/Tarifcheck inhouse, WISO/smartsteuer/Taxfix via AWIN) + `VERTICALS` + `PAGE_AFFILIATES` (**keyed by pathname** `/<slug>-rechner`, nicht by Rechner-`id`).
- `src/utils/affiliate.ts` = `buildAffiliateUrl()` + `generateSubid()` (alphanumerische Subid `<pageSlug><Vertical><Slot>`, ≤50 Zeichen – Check24-Constraint).
- `PUBLIC_AWIN_AFFID` kommt aus Env (Vercel), nicht aus dem Code.
- Die Rechner-Registry weiß nichts von Monetarisierung – beide Systeme bewusst getrennt.

## Projekt-Konventionen (wichtig – überschreiben Defaults)

- **PRIMÄRQUELLEN-Disziplin (zentral):** Jeder rechtliche/steuerliche/Bußgeld-/Norm-Wert muss auf eine **amtliche Primärquelle** zurückführbar sein – `gesetze-im-internet.de` (BKatV, StVG, EStG …), KBA, BMF, Destatis, BAFA, KfW, Umweltbundesamt, Bundesnetzagentur, DIN-Normen, IQWiG. **Keine** Sekundärquellen (ADAC, Verivox, blitzrechner, Vergleichsportale, Wikipedia, Hersteller-Blogs) in `quellen[]` oder der Quellen-Sektion. Bei neuen/geänderten Werten: Quelle verifizieren und in `quellen[]` **und** der Komponenten-Quellen-Sektion eintragen. (Siehe Commits `3e232bcb`, `69d99c7a`, `df038cb0`.)
- **Normtext schlägt Behörden-FAQ (Formelstruktur ≠ Beträge):** Eine BMF-/DRV-/Ministeriums-FAQ ist amtlich, nennt aber nur **Beträge** zuverlässig. Die **Struktur** einer Förder-/Steuerregel – was Bemessungsgrundlage ist, was multipliziert wird, was gedeckelt ist, worauf sich ein Höchstbetrag bezieht – steht **nur im Gesetzestext**. Für jede Rechenregel deshalb den Normwortlaut lesen (BGBl. über `recht.bund.de`, Drucksachen über `dserver.bundestag.de`), nicht die Erläuterung. Achtung: `gesetze-im-internet.de` führt **künftige Fassungen oft noch nicht** (Beispiel: §§ 84–86 EStG standen dort im Aug. 2026 noch in der alten Riester-Fassung); und ein Regierungs**entwurf** kann andere Parameter haben als das **beschlossene** Gesetz. (Anlass: Commit `b8dbae2a` – aus der zweideutigen FAQ-Formulierung „für jedes Kind … bis zu einem Eigenbeitrag von 300 Euro" wurde fälschlich „300 € **je Kind** nötig"; § 85 Abs. 1 EStG rechnet die Zulage für *jedes* Kind aus *denselben* Beiträgen.)
- **Extremwert-Test vor dem Ausliefern:** Jede Rechenregel gegen Randfälle prüfen – 0 und ein sehr hoher Wert je Multiplikator (10 Kinder, 0 €, Beitrag am Deckel, Beitrag über dem Deckel). Wenn zwei Regeln zusammen ein absurdes Ergebnis liefern (z. B. „nötiger Eigenbeitrag" übersteigt den geförderten Höchstbeitrag), ist eine davon falsch verstanden – nicht wegdiskutieren, sondern am Normtext klären. Genau dieser Test hat `b8dbae2a` aufgedeckt, und zwar durch einen **Nutzer**, nicht durch uns.
- **QA-Audit-Gate:** Vor dem Ausliefern größerer Rechner-Wellen werden Werte/Beispiele gegen die Primärquelle auditiert (z. B. „51 Rechner, 44 PASS"); Beispiele in der Prosa müssen zur Komponenten-Rechnung passen.
- **AdSense-Härtung:** Jede Rechner-Seite braucht **sichtbares FAQ** (nicht nur Schema) + Trust/E-E-A-T-Block (Aktualisierungsdatum, Grundlage, Berücksichtigt/Nicht berücksichtigt). Dünne Seiten fallen im Content-Audit durch.
- **Commits:** Deutsch, Conventional-Prefix (`feat:`/`fix:`/`refactor:`/`docs:`), Body erklärt das Warum + nennt Quellen-URLs. Footer-Zeile `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Direkt auf `master`** – keine Feature-Branches/PRs für die Maintainer-Arbeit. (Der PR-Flow in `CONTRIBUTING.md` gilt nur für externe Fork-Beiträge.)
- **Multi-Session-Git-Disziplin:** Es kann eine **parallele Session im selben Repo** arbeiten. Niemals breit stagen (`git add -A`/`git add .`). Nur eigene Dateien committen: `git commit -- <pathspec>`. `src/data/rechner.ts` ist der Konflikt-Hotspot (3345-Zeilen-Monolith) – bei gleichzeitigen Registry-Edits das Entanglement-Window abwarten/koordinieren.

## Stolperfallen

- **Statisch only:** kein SSR, keine API-Routen zur Build-Zeit; jede Interaktion ist client-seitiges React mit `client:load`.
- **Slug = Dateiname**, case-sensitive auf dem Linux-Deploy. Sitemap & Registry müssen mit den `.astro`-Dateinamen übereinstimmen.
- `.vercel/` ist auto-generiert und **nicht committen** (steht in `.gitignore`, ebenso `dist/`, `.astro/`, `.claude/`, Audit-Artefakte).
- Capacitor (`android/`, `ios/`, `capacitor.config.ts`, `webDir: dist`) liefert dieselbe statische Site als App – vor Sync immer `npm run build`.
- `astro.config.mjs`: `trailingSlash: 'never'`, `output: 'static'`, Site `https://www.deutschland-rechner.de`. Tailwind scannt nur `src/**/*` – Styles fehlen, wenn eine Datei außerhalb liegt.
- Es gibt keine Daten-Integritäts-Checks: verwaiste Registry-Einträge ohne Seite (oder umgekehrt) bleiben unbemerkt – beim Hinzufügen/Löschen alle drei Teile mitführen. `link-check.mjs` hilft beim Aufspüren.
