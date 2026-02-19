# SEO Audit Report: deutschland-rechner.de

**Datum:** 2026-02-19  
**Auditor:** Claude SEO Agent  
**SEO Health Score:** 87/100

---

## Executive Summary

deutschland-rechner.de hat eine **solide technische SEO-Basis**. Die Site ist gut für AI-Crawler optimiert, hat aktuelle Schema-Markups und eine gepflegte Sitemap. Die wichtigsten Fixes wurden automatisch implementiert und gepusht.

### Score Breakdown

| Kategorie | Score | Max | Details |
|-----------|-------|-----|---------|
| Technical SEO | 23 | 25 | HTTPS ✅, HSTS ✅, Sitemap ✅, robots.txt ✅ |
| Schema Markup | 9 | 10 | Organization, WebSite, WebApplication, Breadcrumbs ✅ |
| AI/GEO Search | 4.5 | 5 | llms.txt ✅, AI Crawler erlaubt ✅ |
| Content Quality | 18 | 20 | Gute Struktur, könnte mehr Tiefe haben |
| On-Page SEO | 17 | 20 | Titles/Descriptions gut, einige 2025→2026 Updates |
| Mobile/UX | 9 | 10 | PWA ✅, Mobile-First ✅ |
| Link Structure | 7 | 10 | Interne Verlinkung gut, externe Backlinks fehlen |

---

## Phase 1: Technical SEO (23/25)

### ✅ robots.txt - EXZELLENT
```
User-agent: *
Allow: /

# AI/LLM Crawlers - ALLE ERLAUBT
User-agent: GPTBot ✅
User-agent: ClaudeBot ✅
User-agent: Claude-Web ✅
User-agent: PerplexityBot ✅
User-agent: Applebot-Extended ✅
User-agent: cohere-ai ✅
User-agent: Bytespider ✅
User-agent: Google-Extended ✅

Sitemap: https://www.deutschland-rechner.de/sitemap-index.xml
```

### ✅ Sitemap - AKTUELL
- **Format:** sitemap-index.xml → sitemap-0.xml
- **Seiten:** 58 URLs
- **lastmod:** 2026-02-19T11:04:12.198Z (heute!)
- **changefreq:** weekly
- **priority:** 0.8

### ✅ Security Headers
- **HTTPS:** ✅ Erzwungen
- **HSTS:** ✅ max-age=63072000 (2 Jahre)
- **Redirect:** 307 non-www → www ✅

### ⚠️ Core Web Vitals
Nicht automatisch geprüft. Empfehlung: PageSpeed Insights prüfen.

---

## Phase 2: Schema Markup (9/10)

### ✅ Vorhandene Schemas

**Layout.astro (alle Seiten):**
```json
✅ Organization Schema
✅ WebSite Schema mit SearchAction
```

**Rechner-Seiten:**
```json
✅ WebApplication Schema (applicationCategory: FinanceApplication)
✅ BreadcrumbList Schema (auf Top-Seiten)
⚠️ FAQPage Schema (deprecated für Rich Results seit Sept 2023, aber nicht schädlich)
```

### ✅ Keine deprecated Schemas
- ❌ HowTo (nicht verwendet - gut!)
- ⚠️ FAQPage wird verwendet, aber schadet nicht

---

## Phase 3: AI/GEO Search (4.5/5)

### ✅ llms.txt - VORHANDEN & OPTIMIERT
```
# Deutschlandrechner
> Kostenlose Online-Rechner für Deutschland...

## Wichtige Fakten 2026 (Deutschland)
- Kindergeld: 259€ pro Kind pro Monat
- Mindestlohn: 13,90€ pro Stunde
- Grundfreibetrag: 12.348€
- Bürgergeld Regelsatz: 563€
...

## Rechner (mit Links & Beschreibungen)
```

### ✅ AI Crawler Status
Alle wichtigen AI-Crawler explizit erlaubt in robots.txt.

### ✅ Strukturelle Lesbarkeit
- H1 → H2 → H3 Hierarchie: ✅
- Fragen-basierte Headings: ✅ (FAQ-Sections)
- Tabellen für Vergleiche: ✅ (z.B. Feiertage-Tabelle)

### ⚠️ Citability Score (Verbesserungspotential)
- Optimale Passagen-Länge: 134-167 Wörter ✅
- Klare Definitionen in ersten 60 Wörtern: Könnte besser sein
- Spezifische Fakten mit Quellen: Teilweise vorhanden

---

## Phase 4: Competitor Intelligence

### Top-3 Seiten nach GSC Impressions (Feb 2026)

| Seite | Impressions | Position | Competitor-Analyse |
|-------|-------------|----------|-------------------|
| arbeitstage-rechner | 302 | 22.8 | Randstad #1, Steuertipps #2 |
| stundenlohn-rechner | 175 | 37.2 | Hohe Konkurrenz |
| einkommensteuer-rechner | 164 | **10.6** | ⭐ Beste Chance! |
| ehegattenunterhalt-rechner | 132 | 51.1 | Wenig Konkurrenz |
| witwenrente-rechner | 125 | 18.6 | ⭐ Bekommt Clicks! |

### Competitor-Vergleich: Arbeitstage-Rechner

**Randstad (Position ~1):**
- Starke Domain Authority (Brand)
- Weniger Content, aber fokussiert
- Keine signifikanten Content-Vorteile

**deutschland-rechner.de:**
- Mehr Content, Feiertage-Tabelle
- Bessere technische SEO
- Fehlt: Domain Authority, Backlinks

### Quick Wins
1. **Einkommensteuer-Rechner** (Pos 10.6) → Mit kleinen Optimierungen auf Top 5 möglich
2. **Witwenrente-Rechner** (Pos 18.6) → Bekommt bereits Clicks, Potential für Top 10

---

## Phase 5: Implementierte Fixes

### ✅ Commit 320d041 (heute gepusht)

**1. Canonical URL Fix (32 Seiten)**
```diff
- "url": "https://deutschland-rechner.de/..."
+ "url": "https://www.deutschland-rechner.de/..."
```

**2. BreadcrumbSchema hinzugefügt (6 Top-Seiten)**
- einkommensteuer-rechner ✅
- witwenrente-rechner ✅
- homeoffice-pauschale-rechner ✅
- ehegattenunterhalt-rechner ✅
- verpflegungsmehraufwand-rechner ✅
- bmi-rechner ✅

**3. Title Updates 2025 → 2026**
- homeoffice-pauschale-rechner ✅
- bmi-rechner ✅

---

## Issue Tracker

### ✅ FIXED (Heute)
| Issue | Severity | Status |
|-------|----------|--------|
| Inkonsistente canonical URLs (www vs non-www) | HIGH | ✅ Fixed |
| BreadcrumbSchema fehlt auf Top-Seiten | HIGH | ✅ Fixed (6 Seiten) |
| Homeoffice-Pauschale zeigt 2025 statt 2026 | MEDIUM | ✅ Fixed |
| BMI-Rechner zeigt 2025 statt 2026 | MEDIUM | ✅ Fixed |

### ⚠️ OPEN (Backlog)
| Issue | Severity | Empfehlung |
|-------|----------|------------|
| BreadcrumbSchema fehlt auf ~14 weiteren Seiten | LOW | Batch-Update |
| Einige Seiten haben 2025/2026 statt 2026 | LOW | Nächstes Jahr relevant |
| FAQPage Schema bringt keine Rich Results mehr | INFO | Lassen, schadet nicht |
| Core Web Vitals nicht geprüft | MEDIUM | PageSpeed Insights nutzen |
| Backlinks fehlen | HIGH | Content Marketing, PR |

---

## Empfehlungen (Priorisiert)

### 🔴 HIGH Priority (Diese Woche)

1. **PageSpeed Insights Check**
   - LCP < 2.5s, INP < 200ms, CLS < 0.1 prüfen
   - Bei Problemen: Bilder optimieren, JS defer

2. **Einkommensteuer-Rechner optimieren**
   - Position 10.6 → Top 5 möglich
   - Mehr Content zu "Einkommensteuer 2026 Änderungen"
   - Tabelle mit Steuersätzen prominent

3. **Witwenrente-Rechner pushen**
   - Position 18.6, bekommt Clicks
   - Query "witwenrente rechner 2026" bei Pos 10.7
   - Mehr spezifische 2026-Fakten hinzufügen

### 🟡 MEDIUM Priority (Diesen Monat)

4. **Content-Tiefe erhöhen**
   - Erste 60 Wörter: Klare Definition + Hauptfakt
   - Mehr Daten-Tabellen für AI Citability
   - Quellen verlinken (BMF, BMAS)

5. **Interne Verlinkung verbessern**
   - Verwandte Rechner prominent verlinken
   - "Ähnliche Rechner" Section auf jeder Seite

### 🟢 LOW Priority (Backlog)

6. **Backlink-Aufbau**
   - PR für "Deutschlandrechner" Brand
   - Gastbeiträge auf Finanz-Blogs
   - Verlinkung von Foren/Communities

7. **Social Signals**
   - Twitter/X Account erstellen
   - LinkedIn für B2B-Reach

---

## Monitoring

### GSC Trends (7 Tage)
- **Impressions:** 1,136 (Ø 162/Tag)
- **Clicks:** 5
- **CTR:** 0.44%
- **Trend:** ↗️ Wachsend

### Nächste Meilensteine
- [ ] 500 Impressions/Tag
- [ ] 10 Clicks/Tag
- [ ] Top-10 für "witwenrente rechner 2026"
- [ ] Top-5 für "einkommensteuer rechner 2026"

---

## Changelog

| Datum | Aktion | Commit |
|-------|--------|--------|
| 2026-02-19 | SEO Audit, URL-Fix, BreadcrumbSchema, Title-Updates | 320d041 |

---

*Generiert von Claude SEO Agent | claude-seo Methodik*
