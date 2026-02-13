# SEO-Audit: deutschland-rechner.de

**Audit-Datum:** 13. Februar 2026  
**Methodik:** claude-seo Framework  
**Geprüfte Seiten:** Homepage + Top 3 Seiten nach Impressions

---

## 📊 SEO Health Score: 72/100

| Kategorie | Score | Status |
|-----------|-------|--------|
| Technical SEO | 85/100 | ✅ Gut |
| On-Page SEO | 75/100 | ⚠️ Verbesserungswürdig |
| Schema Markup | 80/100 | ✅ Gut |
| Content Quality | 70/100 | ⚠️ Verbesserungswürdig |
| Core Web Vitals | 60/100 | ⚠️ Schätzung (Server-side rendered) |

---

## 1️⃣ TECHNICAL SEO (85/100)

### ✅ Positiv

| Element | Status | Details |
|---------|--------|---------|
| **HTTPS** | ✅ | Vollständig implementiert |
| **HSTS** | ✅ | `max-age=63072000` (2 Jahre) |
| **robots.txt** | ✅ | Vorhanden, korrekt konfiguriert |
| **Sitemap** | ✅ | sitemap-index.xml → sitemap-0.xml (52 URLs) |
| **Canonical Tags** | ✅ | Auf allen Seiten vorhanden |
| **Mobile** | ✅ | Viewport meta tag, responsive |
| **PWA** | ✅ | manifest.json, Service Worker |
| **Host** | ✅ | Vercel (gute Performance) |

### ⚠️ Zu verbessern

| Problem | Priorität | Empfehlung |
|---------|-----------|------------|
| **www/non-www Redirect** | Medium | Redirect von `deutschland-rechner.de` → `www.deutschland-rechner.de` funktioniert ✓ |
| **Security Headers** | Low | Zusätzliche Header empfohlen: X-Content-Type-Options, X-Frame-Options |

### robots.txt Analyse
```
User-agent: *
Allow: /
Sitemap: https://www.deutschland-rechner.de/sitemap-index.xml
```
✅ Korrekt - alle Seiten erlaubt, Sitemap verlinkt

### Sitemap Analyse
- **Format:** XML Sitemap Index
- **URLs:** 52 Seiten indexiert
- **Letzte Änderung:** 2026-02-13
- **Priorität:** 0.8 (alle Seiten gleich)
- **Changefreq:** weekly (alle Seiten gleich)

⚠️ **Empfehlung:** Prioritäten differenzieren (Homepage 1.0, Hauptrechner 0.8, Rest 0.6)

---

## 2️⃣ ON-PAGE SEO (75/100)

### Homepage

| Element | Status | Inhalt |
|---------|--------|--------|
| **Title** | ✅ | "Deutschlandrechner – Alle deutschen Rechner 2026" (47 Zeichen) |
| **Meta Description** | ✅ | "Deutschlandrechner: Kostenlose Online-Rechner für Deutschland 2026..." (144 Zeichen) |
| **H1** | ✅ | "🇩🇪 Deutschlandrechner" |
| **Canonical** | ✅ | `https://www.deutschland-rechner.de/` |
| **OG Tags** | ✅ | Vollständig |
| **Twitter Cards** | ✅ | summary_large_image |

### /arbeitstage-rechner (Top 1: 131 Impressions)

| Element | Status | Inhalt |
|---------|--------|--------|
| **Title** | ✅ | "Arbeitstage-Rechner 2025/2026 – Werktage zwischen zwei Daten berechnen" (70 Zeichen) |
| **Meta Description** | ✅ | "Arbeitstage berechnen: Werktage zwischen zwei Daten zählen..." (177 Zeichen) |
| **H1** | ⚠️ LEER! | H1-Tag vorhanden aber ohne Inhalt (Client-Side Rendering?) |
| **Canonical** | ✅ | Korrekt mit trailing slash |
| **Keywords** | ✅ | Vorhanden (legacy, aber nicht schädlich) |

**🚨 CRITICAL:** H1 ist leer - wird vermutlich per JavaScript gefüllt → Googlebot sieht kein H1!

### /kindergeld-rechner (Top 2: 39 Impressions)

| Element | Status | Inhalt |
|---------|--------|--------|
| **Title** | ✅ | "Kindergeld-Rechner 2026 – Höhe, Antrag & Auszahlung" (52 Zeichen) |
| **Meta Description** | ✅ | "Kindergeld berechnen 2026: 259€ pro Kind pro Monat..." (169 Zeichen) |
| **H1** | ✅ | "Kindergeld-Rechner 2026" |
| **Content** | ✅ | Gut strukturiert mit FAQs |

### /stundenlohn-rechner (Top 3: 23 Impressions)

| Element | Status | Inhalt |
|---------|--------|--------|
| **Title** | ✅ | "Stundenlohn-Rechner 2026 – Gehalt in Stundenlohn umrechnen" (58 Zeichen) |
| **Meta Description** | ✅ | "Stundenlohn Rechner 2026: Berechnen Sie Ihren Stundenlohn..." (148 Zeichen) |
| **H1** | ✅ | "Stundenlohn-Rechner 2026" |
| **Content** | ✅ | Ausführlich mit Beispielrechnungen |

---

## 3️⃣ SCHEMA MARKUP (80/100)

### Homepage Schema

```json
{
  "@type": "WebSite",
  "name": "Deutschlandrechner",
  "url": "https://www.deutschland-rechner.de",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "...?q={search_term_string}"
  }
}
```
✅ **WebSite** mit SearchAction - gut für Sitelinks Searchbox

### Rechner-Seiten Schema (kindergeld-rechner, stundenlohn-rechner)

**Vorhanden:**
1. ✅ **WebSite** (global)
2. ✅ **WebApplication** - korrekt für Online-Rechner
3. ✅ **FAQPage** - gut für Rich Snippets
4. ✅ **HowTo** (nur stundenlohn) - zusätzlicher Rich-Snippet-Potenzial

**Beispiel WebApplication:**
```json
{
  "@type": "WebApplication",
  "name": "Kindergeld-Rechner 2026",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": { "price": "0", "priceCurrency": "EUR" }
}
```

### ❌ Fehlende Schema-Typen

| Schema | Empfehlung | Priorität |
|--------|------------|-----------|
| **Organization** | Fehlt komplett - sollte auf Homepage sein | 🔴 Hoch |
| **BreadcrumbList** | Fehlt - wichtig für Navigation in SERPs | 🔴 Hoch |
| **WebPage** | Nicht auf allen Seiten, nur WebApplication | 🟡 Medium |

### ⚠️ Schema-Probleme

1. **FAQPage auf Finanz-Rechnern:**
   - Nach Google-Richtlinien sollte FAQPage nur für gov/health Seiten verwendet werden
   - **Empfehlung:** FAQPage beibehalten, aber QAPage als Alternative erwägen
   - Da es sich um Finanzrechner handelt (YMYL-Bereich), ist FAQPage akzeptabel

2. **Fehlende author-Details:**
   - `"author": {"@type": "Organization", "name": "Deutschland-Rechner"}`
   - Sollte erweitert werden mit url, logo, sameAs

---

## 4️⃣ CONTENT QUALITÄT (70/100)

### Positiv
- ✅ Aktuelle Daten (2026)
- ✅ Mindestlohn 13,90€ korrekt
- ✅ Kindergeld 259€ korrekt
- ✅ Klare Struktur mit H2/H3
- ✅ Interne Verlinkung vorhanden
- ✅ Informative FAQ-Abschnitte

### Zu verbessern

| Problem | Seite | Empfehlung |
|---------|-------|------------|
| **Dünner Content** | arbeitstage-rechner | Nur ~2.200 Zeichen - mehr Content für Ranking |
| **Keine Quellen** | Alle | Offizielle Quellen verlinken (BZSt, BMAS, etc.) |
| **Kein Datum** | Alle | "Zuletzt aktualisiert" Datum anzeigen |
| **Keine Autoren** | Alle | Für E-E-A-T: Autor/Redaktion nennen |

### E-E-A-T Analyse (YMYL-Bereich!)

| Signal | Status | Empfehlung |
|--------|--------|------------|
| **Expertise** | ⚠️ | Keine Autoren-Infos |
| **Experience** | ⚠️ | Keine Erfahrungsberichte/Reviews |
| **Authority** | ⚠️ | Keine offizielle Quellenangaben |
| **Trust** | ✅ | HTTPS, seriöses Design |

---

## 5️⃣ CORE WEB VITALS (60/100 - Schätzung)

**Hinweis:** Ohne PageSpeed Insights API nur Schätzung möglich.

### Positive Indikatoren
- ✅ Vercel Hosting (Edge CDN)
- ✅ Server-side Rendering (SSR) via Astro
- ✅ Kompakte Seiten (~220KB HTML)
- ✅ CSS inlined/minimiert

### Potenzielle Probleme
- ⚠️ JavaScript für Rechner-Interaktivität
- ⚠️ H1 per JS gefüllt (arbeitstage-rechner)
- ⚠️ OG-Image Laden könnte LCP beeinflussen

---

## 🚨 CRITICAL ISSUES (Sofort beheben!)

### 1. Leeres H1 auf /arbeitstage-rechner
```
<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2"></h1>
```
**Problem:** H1-Tag ist leer im HTML, wird vermutlich per JavaScript gefüllt.  
**Impact:** Google sieht kein H1 → schlechter für Ranking der wichtigsten Seite!  
**Fix:** H1-Inhalt serverseitig rendern

### 2. Fehlendes Organization Schema
**Problem:** Keine Organisation-Daten für Google Knowledge Panel  
**Fix:** Auf Homepage hinzufügen:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Deutschland-Rechner",
  "url": "https://www.deutschland-rechner.de",
  "logo": "https://www.deutschland-rechner.de/logo.png",
  "sameAs": []
}
```

---

## 🔴 HIGH PRIORITY (Innerhalb 1 Woche)

### 3. BreadcrumbList Schema hinzufügen
**Alle Unterseiten sollten Breadcrumbs haben:**
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Start", "item": "https://www.deutschland-rechner.de/"},
    {"@type": "ListItem", "position": 2, "name": "Arbeitstage-Rechner"}
  ]
}
```

### 4. E-E-A-T verbessern
- "Über uns" Seite erstellen
- Redaktionelle Angaben hinzufügen
- Offizielle Quellen verlinken (z.B. BMAS, Familienkasse)
- "Zuletzt aktualisiert" Datum anzeigen

### 5. H1-Konsistenz prüfen
- Alle 52 Seiten auf leere H1s prüfen
- Sicherstellen, dass H1 im initialen HTML ist

---

## 🟡 MEDIUM PRIORITY (Innerhalb 1 Monat)

### 6. Content Expansion für Top-Seiten
- /arbeitstage-rechner: Mehr Content (aktuell nur ~2.200 Zeichen)
- Bundesland-spezifische Unterseiten erstellen
- 2026 Jahresrechner-Landingpages

### 7. Sitemap-Prioritäten optimieren
```xml
<priority>1.0</priority>  <!-- Homepage -->
<priority>0.9</priority>  <!-- Hauptrechner -->
<priority>0.7</priority>  <!-- Nebenrechner -->
```

### 8. Interne Verlinkung verbessern
- Von Arbeitstage-Rechner → Pendlerpauschale-Rechner verlinken
- Thematisch verwandte Rechner verlinken

---

## 🟢 LOW PRIORITY (Nice to have)

### 9. Security Headers erweitern
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

### 10. Performance-Monitoring
- Core Web Vitals in GSC überwachen
- Real User Monitoring (RUM) einrichten

### 11. Lokale SEO (optional)
- Google Business Profile falls relevant
- Lokale Keywords wenn Standort relevant

---

## 📈 Quick Wins

| Aktion | Aufwand | Impact | Priorität |
|--------|---------|--------|-----------|
| H1 auf arbeitstage-rechner fixen | 5 Min | 🔴 Hoch | 1 |
| Organization Schema hinzufügen | 15 Min | 🔴 Hoch | 2 |
| BreadcrumbList Schema hinzufügen | 30 Min | 🟡 Medium | 3 |
| "Zuletzt aktualisiert" Datum | 30 Min | 🟡 Medium | 4 |
| Quellen-Links hinzufügen | 1 Std | 🟡 Medium | 5 |

---

## 📊 GSC-Vergleich

| Seite | Impressions | Klicks | CTR | Position |
|-------|-------------|--------|-----|----------|
| /arbeitstage-rechner | 131 | ? | ? | ? |
| /kindergeld-rechner | 39 | ? | ? | ? |
| /stundenlohn-rechner | 23 | ? | ? | ? |

**Nächste Schritte:**
1. Vollständige GSC-Daten für CTR/Position analysieren
2. Keywords mit hohen Impressions aber niedriger CTR identifizieren
3. Title/Description für diese Keywords optimieren

---

## Zusammenfassung

**Gesamtbewertung: 72/100** - Solide Basis, aber Verbesserungspotenzial

**Top 3 Prioritäten:**
1. 🚨 H1 auf /arbeitstage-rechner reparieren (kritisch für Top-Seite!)
2. 🔴 Organization & BreadcrumbList Schema implementieren
3. 🟡 E-E-A-T Signale verbessern (Quellen, Datum, Autor)

**Stärken:**
- ✅ Technisch solide (HTTPS, Sitemap, Canonicals)
- ✅ Gutes Schema-Markup mit FAQPage & HowTo
- ✅ Aktuelle Inhalte (2026 Daten)
- ✅ Mobile-optimiert

**Schwächen:**
- ❌ Leeres H1 auf wichtiger Seite
- ❌ Fehlende E-E-A-T Signale
- ❌ Fehlendes Organization Schema
- ❌ Keine Breadcrumbs

---

*Audit erstellt am 13.02.2026 mit claude-seo Framework*
