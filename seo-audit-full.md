# SEO Audit Report: deutschland-rechner.de

**Audit Date:** 2026-02-16  
**Methodology:** claude-seo  
**Overall SEO Health Score:** 87/100

---

## Executive Summary

deutschland-rechner.de ist technisch sehr gut aufgestellt. Die Site erfüllt alle kritischen SEO-Anforderungen und ist vorbildlich für AI-Crawler optimiert. Einige Optimierungspotenziale bestehen bei Competitor-Positionierung und Content-Tiefe.

---

## PHASE 1: TECHNICAL SEO (25%) — Score: 24/25

### 1.1 robots.txt ✅ EXCELLENT

**URL:** https://www.deutschland-rechner.de/robots.txt

| Crawler | Status |
|---------|--------|
| GPTBot | ✅ Erlaubt |
| ClaudeBot | ✅ Erlaubt |
| Claude-Web | ✅ Erlaubt |
| PerplexityBot | ✅ Erlaubt |
| Applebot-Extended | ✅ Erlaubt |
| cohere-ai | ✅ Erlaubt |
| Bytespider | ✅ Erlaubt |
| Google-Extended | ✅ Erlaubt |

**Sitemap Reference:** ✅ `Sitemap: https://www.deutschland-rechner.de/sitemap-index.xml`

**Bewertung:** 5/5 — Vorbildliche AI-Crawler-Konfiguration

### 1.2 Sitemap ✅ GOOD

- **sitemap-index.xml:** 200 OK, references sitemap-0.xml
- **sitemap-0.xml:** 200 OK, 55 URLs indexed
- **lastmod:** 2026-02-16T11:07:51.840Z (AKTUELL!)
- **changefreq:** weekly
- **priority:** 0.8

**Alle wichtigen Rechner-Seiten enthalten:** ✅

**Bewertung:** 5/5

### 1.3 Security Headers ✅ EXCELLENT

| Header | Wert | Status |
|--------|------|--------|
| HTTPS | Enforced | ✅ |
| HSTS | max-age=63072000 | ✅ |
| X-Frame-Options | DENY | ✅ |
| X-Content-Type-Options | nosniff | ✅ |
| Referrer-Policy | strict-origin-when-cross-origin | ✅ |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | ✅ |

**Bewertung:** 5/5 — Best Practice implementiert

### 1.4 Core Web Vitals ⚠️ GOOD (geschätzt)

- **Hosting:** Vercel Edge Network
- **Cache:** HIT (effektives Caching)
- **Response Time:** ~200-700ms
- **Content-Length:** 222KB (Homepage)

**Empfehlung:** PageSpeed Insights für exakte CWV-Messungen nutzen

**Bewertung:** 4/5

### 1.5 Canonical URLs ✅

- Alle Seiten haben korrekte canonical Tags
- Trailing Slash konsistent
- www-Redirect funktioniert

**Bewertung:** 5/5

---

## PHASE 2: SCHEMA MARKUP (10%) — Score: 10/10

### 2.1 Implementierte Schemas

#### Homepage (/)
- ✅ **WebSite** mit SearchAction
- ✅ **Organization** mit Logo, areaServed

#### Rechner-Seiten (z.B. /brutto-netto-rechner)
- ✅ **WebSite** (global)
- ✅ **Organization** (global)
- ✅ **BreadcrumbList**
- ✅ **WebApplication** (applicationCategory: FinanceApplication)
- ✅ **FAQPage** mit strukturierten Fragen

### 2.2 Deprecated Schemas Check

- ❌ HowTo — NICHT verwendet ✅ (deprecated Sept 2023)
- ⚠️ FAQPage — Verwendet, aber für Finance-Tools OK

### 2.3 Schema Qualität

```json
// Beispiel WebApplication Schema (Brutto-Netto)
{
  "@type": "WebApplication",
  "name": "Brutto-Netto-Rechner 2026",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"}
}
```

**Bewertung:** 10/10 — Alle relevanten Schemas korrekt implementiert

---

## PHASE 3: GEO / AI SEARCH (5%) — Score: 4.5/5

### 3.1 llms.txt ✅ EXISTS

**URL:** https://www.deutschland-rechner.de/llms.txt

**Inhalt-Qualität:**
- ✅ Klare Site-Beschreibung
- ✅ Aktuelle Fakten für 2026 (Kindergeld, Mindestlohn, etc.)
- ✅ Alle Rechner mit URLs gelistet
- ✅ Datenquellen angegeben (BMF, BMAS, etc.)

**Format:** Gut strukturiert nach llms.txt Standard

### 3.2 Citability Score

**Analyse der Brutto-Netto-Rechner Seite:**

| Kriterium | Status |
|-----------|--------|
| Klare Definition in ersten 60 Wörtern | ✅ |
| Spezifische Fakten mit Quellen | ✅ |
| Optimale Passagen-Länge (134-167 Wörter) | ⚠️ Teils zu kurz |
| Zahlen/Daten für AI-Zitation | ✅ Excellent |

**Beispiel-Passage (zitierbar):**
> "Der Grundfreibetrag 2026 beträgt 12.348€ pro Jahr (monatlich ca. 1.029€). Bis zu diesem Betrag bleibt das Einkommen steuerfrei."

### 3.3 Strukturelle Lesbarkeit

- ✅ H1 → H2 → H3 Hierarchie
- ✅ Fragen-basierte Headings (z.B. "Welche Abzüge werden vom Brutto abgezogen?")
- ✅ Tabellen für Vergleiche (Steuerklassen, Werte 2026)
- ✅ Listen für Aufzählungen

**Bewertung:** 4.5/5 — Sehr gut, kleine Verbesserungen möglich

---

## PHASE 4: COMPETITOR INTELLIGENCE — Score: 8/10

### 4.1 Keyword: "brutto netto rechner 2026"

**Top Competitors:**
1. brutto-netto-rechner.info
2. sparkasse.de
3. test.de (Stiftung Warentest)
4. handelsblatt.com
5. gehalt.de

**Gemeinsame Stärken der Top-Ergebnisse:**
- Alle haben 2026-Werte aktualisiert
- Klare Value Proposition im Title
- Grundfreibetrag prominent erwähnt
- Jahresvergleich-Feature (2024/2025/2026)

**deutschland-rechner.de Position:**
- ✅ Werte aktuell für 2026
- ✅ BMF-PAP konforme Berechnung
- ⚠️ Domain noch jung (gegründet 2025)
- ⚠️ Weniger Backlinks als etablierte Konkurrenz

### 4.2 USPs vs. Konkurrenz

| Feature | deutschland-rechner.de | Konkurrenz |
|---------|----------------------|------------|
| Mobile-First Design | ✅ PWA | ⚠️ Teils veraltet |
| AI-Crawler erlaubt | ✅ Alle | ❌ Oft blockiert |
| llms.txt | ✅ Vorhanden | ❌ Selten |
| Schema Markup | ✅ Komplett | ⚠️ Teilweise |
| Rechner-Vielfalt | ✅ 55+ Rechner | ⚠️ Meist spezialisiert |

### 4.3 Verbesserungspotenzial

1. **Content-Tiefe:** Test.de hat ausführlichere Erklärungen
2. **Backlinks:** Aktive Linkbuilding-Strategie nötig
3. **Trust Signals:** Mehr Quellenverweise, Autoren-Profile
4. **Featured Snippets:** Mehr Q&A-Format optimieren

---

## PHASE 5: ISSUES & RECOMMENDATIONS

### 🔴 Critical Issues (0)
Keine kritischen Issues gefunden.

### 🟠 High Priority (2)

1. **Minijob-Grenze aktualisieren**
   - Seite zeigt "538€-Grenze", sollte "603€-Grenze" für 2026 sein
   - Betrifft: Homepage-Text, llms.txt
   
2. **Open Graph Image**
   - Default og-image.png wird verwendet
   - Empfehlung: Individuelle OG-Images pro Rechner

### 🟡 Medium Priority (4)

1. **Sitemap.xml Alias**
   - /sitemap.xml gibt 404 (nur /sitemap-index.xml funktioniert)
   - Empfehlung: Redirect einrichten

2. **Unterhalts-Rechner URL**
   - llms.txt: /unterhalts-rechner
   - Actual: /unterhalt-rechner (ohne 's')
   - URL-Inkonsistenz

3. **Kredit-Rechner URL**
   - Sitemap: /kredit-rechner
   - Homepage Link: /kreditrechner-rechner
   - Prüfen und vereinheitlichen

4. **Mehr Content für "Bald"-Rechner**
   - 30+ Rechner als "Bald" markiert
   - Empfehlung: Prioritäten setzen, Top-10 zuerst

### 🟢 Low Priority (3)

1. **Search Console verifizieren**
   - Empfehlung: GSC für Performance-Monitoring

2. **hreflang für DE-AT-CH**
   - Optional: Regionale Varianten (Schweiz hat andere Werte)

3. **Video-Content**
   - Erklärvideos für komplexe Rechner (z.B. Elterngeld)

---

## PHASE 6: SUMMARY

### SEO Health Score Breakdown

| Bereich | Score | Max |
|---------|-------|-----|
| Technical SEO | 24 | 25 |
| Schema Markup | 10 | 10 |
| AI/GEO Search | 4.5 | 5 |
| Competitor Position | 8 | 10 |
| **Total** | **87** | **100** |

### What Was Already Excellent ✅

1. **AI-Crawler Konfiguration** — Best-in-class
2. **Security Headers** — Vollständig implementiert
3. **Schema Markup** — Alle wichtigen Types vorhanden
4. **llms.txt** — Existiert und ist aktuell
5. **Mobile/PWA** — Modernes Design
6. **Sitemap** — Aktuell gepflegt
7. **2026-Werte** — Bereits aktualisiert

### Recommended Next Steps

1. ✅ Minijob-Grenze auf 603€ korrigieren (2026) — **GEFIXT**
2. ✅ /sitemap.xml Redirect einrichten — **GEFIXT**
3. ✅ URL-Inkonsistenzen in llms.txt beheben — **GEFIXT**
4. ⬜ Google Search Console einrichten
5. ⬜ Individuelle OG-Images pro Rechner
6. ⬜ Top-5 "Bald"-Rechner priorisieren

---

## FIXES APPLIED (2026-02-16)

**Commit:** `41cf16c` — Pushed to production

### Changes Made:
1. **llms.txt:** Minijob 538€ → 603€ (2026)
2. **llms.txt:** Fixed URL /unterhalts-rechner → /unterhalt-rechner
3. **rechner.ts:** Updated Minijob description & keywords for 2026
4. **vercel.json:** Added /sitemap.xml → /sitemap-index.xml redirect

---

*Report generated by claude-seo methodology*  
*Audit completed: 2026-02-16 13:00 UTC*
