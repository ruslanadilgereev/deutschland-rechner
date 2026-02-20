# SEO Audit Report: deutschland-rechner.de

**Datum:** 2026-02-20  
**Auditor:** Claude SEO Agent  
**SEO Health Score:** 92/100 ⬆️ (+5)

---

## Executive Summary

deutschland-rechner.de ist **hervorragend für SEO und AI-Suche optimiert**. Alle technischen Grundlagen sind perfekt, Schema-Markup ist komplett, und die Site ist AI-Crawler-freundlich. Heute wurde llms.txt für URL-Konsistenz gefixt.

### Score Breakdown

| Kategorie | Score | Max | Details |
|-----------|-------|-----|---------|
| Technical SEO | **25** | 25 | HTTPS ✅, HSTS ✅, alle Security Headers ✅, Sitemap ✅ |
| Schema Markup | **10** | 10 | Organization, WebSite, WebApplication, Breadcrumbs ✅ |
| AI/GEO Search | **5** | 5 | llms.txt ✅, AI Crawler erlaubt ✅, URL-Fix heute |
| Content Quality | 18 | 20 | Gute Struktur, 2026-Daten aktuell |
| On-Page SEO | 17 | 20 | Titles/Descriptions gut optimiert |
| Mobile/UX | 10 | 10 | PWA ✅, Mobile-First ✅, schnelle Ladezeit |
| Link Structure | 7 | 10 | Interne Verlinkung gut, externe Backlinks fehlen |

---

## Phase 1: Technical SEO (25/25) ✅ PERFEKT

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
- **Seiten:** 60 URLs
- **lastmod:** 2026-02-20T11:03:27.705Z (heute!)
- **changefreq:** weekly
- **priority:** 0.8

### ✅ Security Headers - ALLE VORHANDEN
```
strict-transport-security: max-age=63072000 ✅
x-content-type-options: nosniff ✅
x-frame-options: DENY ✅
referrer-policy: strict-origin-when-cross-origin ✅
permissions-policy: camera=(), microphone=(), geolocation=() ✅
```

### ✅ Core Web Vitals (geschätzt)
- **LCP:** < 2.5s (Vercel Edge, optimierter Build)
- **CLS:** < 0.1 (Keine Layout Shifts)
- **INP:** < 200ms (React Client-Side)

---

## Phase 2: Schema Markup (10/10) ✅ PERFEKT

### ✅ Vorhandene Schemas

**Layout.astro (alle Seiten):**
```json
✅ Organization Schema (mit Logo, areaServed: Germany)
✅ WebSite Schema mit SearchAction
```

**Rechner-Seiten (z.B. brutto-netto-rechner):**
```json
✅ BreadcrumbList Schema
✅ WebApplication Schema (applicationCategory: FinanceApplication)
✅ FAQPage Schema (6 Fragen)
```

### ✅ Keine deprecated Schemas
- ❌ HowTo (nicht verwendet - richtig!)
- ℹ️ FAQPage wird verwendet (kein Rich Result mehr, aber schadet nicht)

---

## Phase 3: AI/GEO Search (5/5) ✅ PERFEKT

### ✅ llms.txt - VORHANDEN & OPTIMIERT
```markdown
# Deutschlandrechner
> Kostenlose Online-Rechner für Deutschland...

## Wichtige Fakten 2026 (Deutschland)
- Kindergeld: 259€ pro Kind pro Monat
- Mindestlohn: 13,90€ pro Stunde
- Grundfreibetrag: 12.348€
- Bürgergeld Regelsatz: 563€
- BBG Rentenversicherung: 101.400€
...

## Rechner (27 Links mit Beschreibungen)
```

### ✅ AI Crawler Status
Alle wichtigen AI-Crawler explizit erlaubt in robots.txt:
- GPTBot (OpenAI) ✅
- ClaudeBot (Anthropic) ✅
- PerplexityBot ✅
- Applebot-Extended ✅
- Google-Extended ✅

### ✅ Strukturelle Lesbarkeit
- H1 → H2 → H3 Hierarchie: ✅
- Fragen-basierte Headings: ✅
- Tabellen für Vergleiche: ✅
- Klare Definitionen in ersten 60 Wörtern: ✅

---

## Phase 4: GSC Performance (aktuell)

### Top-Seiten nach Position (Feb 2026)

| Seite | Position | Impressions | Status |
|-------|----------|-------------|--------|
| homeoffice-pauschale-rechner | **6.3** | 10 | 🥇 Top 10! |
| witwenrente-rechner | **8.9** | 29 | 🥇 Top 10! |
| einkommensteuer-rechner | **10.3** | 195 | 🥈 Knapp Top 10 |
| arbeitstage-rechner | 17.1 | 101 | Potenzial |
| stundenlohn-rechner | 35.0 | 198 | Optimierung nötig |
| ehegattenunterhalt-rechner | 52.5 | 164 | Long-tail |

### Meilensteine erreicht
- ✅ Erste Impressions: 8. Feb 2026
- ✅ Erster Click: 9. Feb 2026  
- ✅ 100 Impressions/Tag: 10. Feb 2026
- ✅ 3 Clicks an einem Tag: 11. Feb 2026
- ✅ Top-10 Position: Homeoffice (6.3), Witwenrente (8.9)

### Clicks
- bmi-rechner: 2 Clicks (Position ~67)
- "bmi rechner": 1 Click
- "bmi-rechner frauen ab 60": 1 Click

---

## Phase 5: Implementierte Fixes (heute)

### ✅ Commit heute: llms.txt URL-Konsistenz

**Problem:** URLs in llms.txt verwendeten `deutschland-rechner.de` statt `www.deutschland-rechner.de`

**Fix:** Alle 27 Rechner-URLs auf www. aktualisiert:
```diff
- https://deutschland-rechner.de/brutto-netto-rechner
+ https://www.deutschland-rechner.de/brutto-netto-rechner
```

---

## Issue Tracker

### ✅ FIXED (Komplett)

| Issue | Severity | Status |
|-------|----------|--------|
| Inkonsistente canonical URLs | HIGH | ✅ Fixed (Feb 19) |
| BreadcrumbSchema fehlte | HIGH | ✅ Fixed (Feb 19) |
| llms.txt URLs ohne www | MEDIUM | ✅ Fixed (heute) |
| Stundenlohn-Rechner 2025→2026 | CRITICAL | ✅ Fixed (Feb 13) |
| Security Headers fehlten | HIGH | ✅ Vorhanden |

### ℹ️ BACKLOG (Optional)

| Issue | Severity | Empfehlung |
|-------|----------|------------|
| Backlinks fehlen | HIGH | Content Marketing, PR |
| FAQPage Schema bringt keine Rich Results | INFO | Lassen, schadet nicht |
| Content-Tiefe erhöhen | LOW | Mehr Tabellen, Quellen |

---

## Empfehlungen (Priorisiert)

### 🔴 HIGH Priority

1. **Einkommensteuer-Rechner pushen**
   - Position 10.3 → Top 5 möglich
   - Mehr Content zu "Steuertarif 2026 Änderungen"
   - Tabelle mit Grenzsteuersätzen

2. **Witwenrente-Rechner optimieren**  
   - Position 8.9 - bereits Top 10!
   - Mehr spezifische 2026-Fakten
   - Große/kleine Witwenrente differenzieren

### 🟡 MEDIUM Priority

3. **Backlink-Aufbau**
   - PR für "Deutschlandrechner" Brand
   - Gastbeiträge auf Finanz-Blogs
   - Reddit/Forum-Verlinkungen

4. **Arbeitstage-Rechner verbessern**
   - Position 17.1, hohe Impressions (101)
   - Mehr Steuererklärung-Fokus (bereits gefixt)

### 🟢 LOW Priority

5. **Social Media**
   - Twitter/X Account
   - LinkedIn für B2B

---

## Monitoring

### GSC Trends (letzte 13 Tage)
- **Gesamte Impressions:** ~1,349
- **Clicks:** 6
- **CTR:** 0.44%
- **Trend:** ↗️ Wachsend

### Nächste Meilensteine
- [ ] 500 Impressions/Tag
- [ ] 10 Clicks/Tag
- [ ] Top-5 für "einkommensteuer rechner 2026"
- [ ] Erster Backlink

---

## Changelog

| Datum | Aktion | Commit |
|-------|--------|--------|
| 2026-02-20 | llms.txt URL-Fix (www Konsistenz) | Heute |
| 2026-02-19 | SEO Audit, canonical-Fix, BreadcrumbSchema | 320d041 |
| 2026-02-13 | Stundenlohn 2026 Update, Arbeitstage Steuer-Fokus | 1ca2db2 |

---

*Generiert von Claude SEO Agent | claude-seo Methodik*
