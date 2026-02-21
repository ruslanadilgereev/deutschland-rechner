# SEO Audit: deutschland-rechner.de
**Datum:** 2026-02-21  
**Methodik:** claude-seo  
**Status:** ✅ Completed

---

## 📊 SEO Health Score: 87/100

| Kategorie | Gewicht | Score | Punkte |
|-----------|---------|-------|--------|
| Technical SEO | 25% | 92/100 | 23.0 |
| Schema Markup | 10% | 95/100 | 9.5 |
| AI/GEO Search | 5% | 95/100 | 4.75 |
| Content Quality | 30% | 85/100 | 25.5 |
| Authority/Links | 30% | 80/100 | 24.0 |
| **GESAMT** | 100% | | **86.75 → 87** |

---

## Phase 1: Technical SEO (23/25 Punkte)

### ✅ robots.txt - EXCELLENT
```
# AI Crawler Status:
GPTBot: ✅ Erlaubt
ClaudeBot: ✅ Erlaubt
Claude-Web: ✅ Erlaubt
PerplexityBot: ✅ Erlaubt
Applebot-Extended: ✅ Erlaubt
cohere-ai: ✅ Erlaubt
Bytespider: ✅ Erlaubt
Google-Extended: ✅ Erlaubt
Sitemap: ✅ Referenziert
llms.txt: ✅ Erwähnt
```

### ✅ Sitemap - EXCELLENT
- **Format:** sitemap-index.xml → sitemap-0.xml
- **URLs:** 61 indexierte Seiten
- **lastmod:** 2026-02-21T11:06:23.917Z (heute aktualisiert!)
- **changefreq:** weekly
- **priority:** 0.8

### ✅ Security Headers - GOOD
| Header | Status | Wert |
|--------|--------|------|
| HTTPS | ✅ | Aktiv |
| HSTS | ✅ | max-age=63072000 (2 Jahre) |
| X-Frame-Options | ✅ | DENY |
| X-Content-Type-Options | ✅ | nosniff |
| Content-Security-Policy | ⚠️ | FEHLT |

### ⚠️ Core Web Vitals
- **Status:** Nicht direkt messbar (PageSpeed API Limit)
- **Empfehlung:** Prüfung über PageSpeed Insights manuell

---

## Phase 2: Schema Markup (9.5/10 Punkte)

### Homepage Schemas ✅
```json
✅ Organization (name, url, logo, foundingDate, areaServed)
✅ WebSite (name, url, SearchAction)
```

### Calculator Page Schemas ✅ EXCELLENT
Am Beispiel /kindergeld-rechner:
```json
✅ Organization
✅ WebSite
✅ BreadcrumbList (Startseite → Kindergeld-Rechner)
✅ WebApplication (FinanceApplication, price=0)
⚠️ FAQPage (6 Questions - siehe Hinweis)
```

### ⚠️ FAQPage Schema Hinweis
FAQPage wurde im Sept 2023 für die meisten Websites deprecated. 
**ABER:** Für Regierungsleistungen/Sozialleistungen (Kindergeld, Bürgergeld) könnte es noch akzeptabel sein, da es sich um öffentliche Informationen handelt.

**Empfehlung:** Beobachten - bei Problemen entfernen.

---

## Phase 3: AI/GEO Search (4.75/5 Punkte)

### ✅ llms.txt - EXCELLENT
Vollständig implementiert mit:
- Wichtige Fakten 2026 (Kindergeld, Mindestlohn, Grundfreibetrag, etc.)
- Alle 30+ Rechner mit URLs und Kurzbeschreibungen
- Datenquellen (BMF, BMAS, BA, OLG Düsseldorf)
- Kontaktinformationen

### ✅ Citability Score - GOOD
- **Erste 60 Wörter:** Enthält klare Definition + Kernfunktion
- **Fakten:** Spezifisch mit Zahlen (259€, 2026, etc.)
- **Passagen-Länge:** Gut strukturiert

### ✅ Strukturelle Lesbarkeit
- H1 → H2 → H3 Hierarchie: ✅
- Fragen-basierte Headings: ✅ ("Wer hat Anspruch?", "Bis wann?")
- Spezifische Zahlen: ✅

---

## Phase 4: Competitor Intelligence

### Keyword: "kindergeld rechner 2026"
**deutschland-rechner.de Position:** ❌ NICHT in Top 5

| Rang | Domain | Stärken |
|------|--------|---------|
| 1 | kindergeld.org | Exact-Match-Domain, Authority |
| 2 | einfach-elterngeld.de | Nischen-Authority, viele Backlinks |
| 3 | smart-rechner.de | Established Domain, breites Portfolio |
| 4 | finanz.de | High DA, breites Themenspektrum |
| 5 | kinderzuschlag.org | Exact-Match für verwandtes Keyword |

### Competitor-Analyse: Was haben alle gemeinsam?
1. **Domain Authority:** Alle haben etablierte Domains (>2 Jahre)
2. **Internal Linking:** Starke Vernetzung zwischen verwandten Themen
3. **Content Depth:** Längere Artikel mit mehr Details
4. **Backlink Profile:** Mehr externe Verlinkungen

### Wo sind wir schwächer?
1. **Domain Age:** deutschland-rechner.de ist neu (2025)
2. **Backlinks:** Weniger externe Verlinkungen
3. **Content Length:** Artikel könnten ausführlicher sein

---

## 🔴 CRITICAL Issues (0)
Keine kritischen Issues gefunden.

## 🟠 HIGH Priority Issues (2)

### 1. Nicht in Top-Rankings für Hauptkeywords
- **Problem:** Trotz guter On-Page SEO keine Top-5 Rankings
- **Ursache:** Neue Domain, fehlende Backlinks
- **Fix:** Link-Building Strategie, Content Marketing

### 2. Content-Security-Policy fehlt
- **Problem:** CSP Header nicht gesetzt
- **Impact:** Security Rating, kein direkter SEO-Impact
- **Fix:** CSP Header im Hosting/Vercel konfigurieren

## 🟡 MEDIUM Priority Issues (3)

### 3. FAQPage Schema auf Nicht-Gov Seiten
- **Problem:** FAQPage deprecated außer für Gov/Health
- **Empfehlung:** Monitoring - bei Problemen entfernen

### 4. Mehr Internal Linking
- **Problem:** Rechner könnten besser untereinander verlinkt sein
- **Beispiel:** Kindergeld → Kinderfreibetrag → Elterngeld Verknüpfungen

### 5. Content Expansion
- **Problem:** Artikel kürzer als Top-Konkurrenten
- **Empfehlung:** 2000-3000 Wörter pro Hauptrechner-Seite

---

## ✅ Was bereits gut ist

1. **AI Crawler:** Alle wichtigen AI-Bots erlaubt
2. **llms.txt:** Vollständig und aktuell
3. **Schema Markup:** WebApplication, BreadcrumbList, Organization
4. **Security:** HSTS, X-Frame-Options, X-Content-Type-Options
5. **Sitemap:** Aktuell, alle Seiten indexiert
6. **Content Quality:** Aktuelle Zahlen für 2026
7. **Mobile-First:** Next.js PWA-Setup

---

## 📋 Action Items

### Sofort (diese Woche)
- [ ] CSP Header hinzufügen
- [ ] Internal Linking zwischen verwandten Rechnern verbessern

### Kurzfristig (1 Monat)
- [ ] Top 10 Rechner-Seiten auf 2000+ Wörter erweitern
- [ ] Backlink-Outreach starten (Finanzblogs, Verbraucherportale)

### Mittelfristig (3 Monate)
- [ ] Guest Posts auf relevanten Seiten
- [ ] PR für neue Features (Pressemitteilungen)
- [ ] Social Media Präsenz aufbauen

---

## Technische Details

### Getestete URLs
- https://www.deutschland-rechner.de/
- https://www.deutschland-rechner.de/robots.txt
- https://www.deutschland-rechner.de/sitemap-index.xml
- https://www.deutschland-rechner.de/sitemap-0.xml
- https://www.deutschland-rechner.de/llms.txt
- https://www.deutschland-rechner.de/kindergeld-rechner
- https://www.deutschland-rechner.de/brutto-netto-rechner

### Schema Types gefunden
- Organization ✅
- WebSite ✅
- BreadcrumbList ✅
- WebApplication ✅
- FAQPage ⚠️

### Indexierte Seiten (61)
<details>
<summary>Vollständige Liste</summary>

1. /abfindung-rechner/
2. /arbeitslosengeld-rechner/
3. /arbeitstage-rechner/
4. /bafoeg-rechner/
5. /bmi-rechner/
6. /brutto-netto-rechner/
7. /buergergeld-rechner/
8. /ehegattenunterhalt-rechner/
9. /einkommensteuer-rechner/
10. /eisprung-rechner/
11. /elterngeld-rechner/
12. /elternzeit-rechner/
13. /erbschaftsteuer-rechner/
14. /etf-sparplan-rechner/
15. /firmenwagen-rechner/
16. /geburtstermin-rechner/
17. /gewerbesteuer-rechner/
18. /grunderwerbsteuer-rechner/
19. /grundsteuer-rechner/
20. /grundumsatz-rechner/
21. /handwerkerkosten-rechner/
22. /homeoffice-pauschale-rechner/
23. /kapitalertragsteuer-rechner/
24. /kfz-steuer-rechner/
25. /kindergeld-rechner/
26. /kinderzuschlag-rechner/
27. /kirchensteuer-rechner/
28. /krankengeld-rechner/
29. /krankenkassenbeitrag-rechner/
30. /kredit-rechner/
31. /kurzarbeitergeld-rechner/
32. /lohnsteuer-rechner/
33. /mehrwertsteuer-rechner/
34. /midijob-rechner/
35. /mietkaution-rechner/
36. /mindestlohn-rechner/
37. /minijob-rechner/
38. /mutterschutz-rechner/
39. /nachtschicht-rechner/
40. /notarkosten-rechner/
41. /pendlerpauschale-rechner/
42. /pflegegeld-rechner/
43. /photovoltaik-rechner/
44. /promille-rechner/
45. /renten-rechner/
46. /rentensteuer-rechner/
47. /riester-rechner/
48. /rundfunkbeitrag-rechner/
49. /scheidungskosten-rechner/
50. /schenkungsteuer-rechner/
51. /soli-rechner/
52. /steuerklassen-rechner/
53. /stundenlohn-rechner/
54. /unterhalts-rechner/
55. /urlaubstage-rechner/
56. /verpflegungsmehraufwand-rechner/
57. /witwenrente-rechner/
58. /wohngeld-rechner/
59. /zinseszins-rechner/
60. /zuzahlung-rechner/
61. / (Homepage)

</details>

---

*Audit durchgeführt mit claude-seo Methodik am 2026-02-21*
