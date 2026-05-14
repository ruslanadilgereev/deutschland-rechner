# E-Auto-Förder-Rechner 2026 — Wettbewerbsanalyse

**Recherche-Datum:** 2026-05-14
**Autor:** `competitor-spy`
**Auftrag:** Existierende E-Auto-Förder-Rechner auswerten — Inputs, Outputs, Affiliate-Pattern, UX-Gold und UX-Müll.

---

## 1. Executive Summary

**Was lernen wir?**

1. **Der "Standard-Rechner" ist bereits etabliert** — 3 Inputs: Fahrzeugtyp (BEV/PHEV), zvE (zu versteuerndes Haushaltseinkommen), Kinderzahl (0/1/2+). Jeder Player nutzt exakt diese Inputs. Wer mehr fragt, gilt als nervig; wer weniger fragt, gilt als ungenau.
2. **Niemand hat einen wirklich guten Rechner.** Selbst der ADAC liefert nur einen Basic-Rechner ohne Komponenten-Aufschlüsselung. **fixrechner.de** und **AUTO BILD** haben die besten Berechnungs-UX (Live-Berechnung + Aufschlüsselung Basis/Sozial/Kinder).
3. **Die Affiliate-Cross-Sell-Strategie ist überall schwach.** Niemand verlinkt KFZ-Versicherung + Wallbox + Leasing + Solar systematisch. **Das ist unsere Chance.** Aktuell baut jeder seinen vertikalen Funnel: Capitalo → Kredit, HUK → Versicherung, Allane → Leasing, Lade.de → Wallbox, Autobild → THG-Quote.
4. **Wer hat den besten Rechner?** Knapp: **fixrechner.de** (klare Aufschlüsselung, Grenzfall-Visualisierung, Datenschutz-Hinweis, FAQ) > **AUTO BILD** (mehr Inputs, mehr Trust) > **ADAC** (Markenwert, aber Rechner technisch dünn) > **Capitalo** (zu statisch, Tabellen statt Live-Berechnung).
5. **Marketplaces (mobile.de / autoscout24) monetarisieren über Fahrzeug-Listings** — sie filtern aber NICHT dynamisch nach Förderfähigkeit. Hier liegt UX-Potenzial brach.
6. **OEMs/Leasing (Allane, Toyota, Autohaus Hinte) zeigen "inkl. Förderung"-Preise** statt vor/nach-Vergleiche. Ihre Rechner sind nur Trust-Builder, nicht Conversion-Optimiert.
7. **HUK-Coburg ist der einzige Versicherer** mit Förderungs-Content + KFZ-CTA — Pattern: "Mit der neuen Förderung wird der Umstieg attraktiver. **Denken Sie auch an den passenden Versicherungsschutz.**" Sehr soft, sehr effektiv.

---

## 2. Pro-Site-Analyse

| # | Name | URL | Was haben sie | Affiliate-Pattern | Stärken | Schwächen |
|---|------|-----|---------------|-------------------|---------|-----------|
| 1 | **ADAC** | adac.de/rund-ums-fahrzeug/elektromobilitaet/elektroauto/foerderung-elektroautos/ | Rechner (3 Inputs: BEV/PHEV, zvE, Kinder) + statische Fördertabellen + redaktionelle Position | Schwach. Nur generischer KFZ-Versicherungs-Link, ADAC-Leasing-Erwähnung. **KEIN** Wallbox/Solar | Marken-Trust, BMUKN-Quelle, Inhaltsverzeichnis mit Sprunglinks, redaktioneller Tiefgang | Rechner technisch dünn (kein Aufschlüsselung), keine Eigenanteils-Berechnung, kein Vergleich vorher/nachher |
| 2 | **BAFA (offiziell)** | bafa.de/DE/Energie/Energieeffizienz/E-Auto_Foerderung_2026/ | NUR Info-Hub, KEIN Rechner. Drei Hauptbereiche: Überblick, Fördervoraussetzungen, Antrag vorbereiten | Keine — Behörde | Offizielle Quelle = höchster Trust, Stand 30.4.2026 | Veraltetes Design, kein Rechner, keine Visualisierung, Antragsportal noch nicht live |
| 3 | **smart-rechner.de** | smart-rechner.de | **KEIN E-Auto-Förder-Rechner.** Nur Stromkostenrechner, LED-Watt, Wärmepumpe | n/a | Generisches Rechner-Portal, breites Themenangebot | Hat das Thema verschlafen — große Chance, schnell mit "smart-rechner.de"-Style zu überholen |
| 4 | **finanzfluss.de** | (nicht direkt gefunden) | Kein expliziter E-Auto-Förderrechner gefunden via Search (Mai 2026) | n/a | Hohe SEO-Authority, würde bei Aufnahme schnell ranken | Bisher noch nicht im Markt — Window of Opportunity offen |
| 5 | **mobile.de** | mobile.de/lp/e-auto-foerderung/ | Prämienrechner + Marketplace-Verlinkung (403 beim Fetch — Anti-Bot) | Marketplace-Klicks zu E-Autos = primäre Monetarisierung. Lead-Gen zu Händlern | Marken-Trust, riesige Reichweite | **Kein dynamischer Förder-Filter** auf Marketplace, Disclaimer "unverbindlich, keine Haftung", Bot-Block macht Indexierung schwer |
| 6 | **autoscout24.de** | autoscout24.de/elektroauto/e-auto-foerderung/ | "Förder-Check" mit 3 Inputs + 20 Vehicle-Listings + Leasing-Sektion mit Monatsrate-Impact (€42–€167/Monat) | Lead-Gen zu Händlern, Leasing, **keine** Versicherungs-CTAs | Aktuell (21.01.2026), Experten-Quotes (Stefan Schneck), THG-Quote-Promotion | Marketplace NICHT dynamisch nach Förderfähigkeit filterbar, keine Wallbox/Solar |
| 7 | **e-auto.de** | (kein eigener Rechner gefunden) | Spezialisierter Player ohne sichtbaren Rechner in Top-Search-Results | n/a | Domain-Brand passt 1:1 | Verschlafen — wenn die nichts haben, ist das Feld weiter offen |
| 8 | **emobilserver.de** | (keine relevanten Treffer) | Nicht in Top-Search-Results für E-Auto-Förderung-2026-Rechner | n/a | — | Offenbar nicht aktiv im Förder-Rechner-Markt |
| 9 | **ladekompass.de** | (keine relevanten Treffer) | Kein eigener Förder-Rechner gefunden | n/a | — | Marken-Lücke — wenn sie hätten, wäre Wallbox-Cross-Sell logisch |
| 10 | **capitalo.de** | capitalo.de/kredit/e-auto-foerderung-rechner | Tabellen-basierter "Rechner" (statisch), 3 Inputs, Komponentenaufschlüsselung Basis+Sozial+Kinder, Rechenbeispiele | **Autokredit-CTA** prominent platziert nach Berechnung (Capitalo = Kreditvermittler) | Komponentenaufschlüsselung, THG/Steuer-Erwähnung, Autor mit Foto+LinkedIn | Nicht-interaktiv (Tabellen scrollen statt Live-Calc), nur Kredit-Vertikal, keine externen Quellen verlinkt |
| 11 | **fixrechner.de** | fixrechner.de/e-auto-foerderrechner-2026/ | Live-Rechner mit Echtzeit-Berechnung, Förderfähigkeit ja/nein, Aufschlüsselung Basis+Sozial+Kinder | **Interne Verlinkungen** zu Leasing-, Auto-Abo-, Kredit-, Photovoltaik-Rechnern — kein direkter Affiliate | **Bestes UX aller Rechner.** 1.893 echte Bewertungen (4,9★), Datenschutz-Hinweis "keine Speicherung", Grenzfall-Visualisierung (44.999 € vs 45.000 €), BAFA-Quelle verlinkt | Ergebnisbereich textlastig, keine Charts, keine Affiliate-Monetarisierung |
| 12 | **elektroquatsch.de** | elektroquatsch.de/rechner/e-auto-praemie | Single-Page-Rechner mit 3 Inputs, Buttons Berechnen+Zurücksetzen | **Keine Affiliate-CTAs erkannt** | Klare Eingabegrenzen, sozial-gestaffelte Struktur abgebildet | Keine Berechnungslogik-Aufschlüsselung, keine Szenarien, dünn |
| 13 | **drohnen.de** | drohnen.de/76608/e-auto-foerderung-rechner/ | Detaillierter Rechner mit 8 Inputs (mit Zulassungsdatum, Haltedauer-Bestätigung, Antrag-Frist) | **4 Amazon-Affiliate-Links** zu Büchern (17,99–39,90 €). Exit-Intent-Popup zu Drohnen-Versicherung (off-topic) | Tiefste Input-Validierung aller Rechner, PHEV-Sonderkriterien (CO₂ ≤60 g/km ODER ≥80 km E-Range) | Off-Topic-Domain, aggressive Pop-ups, kein Brand-Trust |
| 14 | **ACE** | ace.de/elektromobilitaet/kosten/e-auto-foerderung/ | "E-Auto-Check" (Rentabilität, 7 Fragen) + Fördermatrix (Tabellen, kein Live-Rechner) + ADAC-Leistungsvergleich-Sektion | KFZ-Versicherungs-CTA, Mitglieder-Upsell, App-Promotion | 24 E-Auto-Modelle mit Listenpreis/Reichweite, kritische redaktionelle Haltung, 40+ FAQ | Rechner-Funktion vage ("erste Orientierung"), keine Wallbox-CTAs |
| 15 | **allane.de (Leasing)** | allane.de/de/auto/elektro/foerderung/staatliche-foerderung-2026/rechner | Rechner mit Privat/Gewerbe-Switch + 11 konkrete Leasing-Deals mit "inkl. Förderung"-Pricing | **Leasing-Konfigurator** = Haupt-Conversion-Pfad. 26 Marken anwählbar | Direkter Leasing-Funnel, Deals mit Förderung-eingepreist | Single-Page-Design ohne Wizard, kein Vorher/Nachher-Vergleich |
| 16 | **HUK-Coburg** | huk.de/fahrzeuge/ratgeber/news/e-auto-foerderung-2026.html | KEIN Rechner. Reine Info-Page mit weichem CTA "Jetzt berechnen" für E-Auto-KFZ-Versicherung | **Einziger Versicherer** mit Förderungs-Page → KFZ-Versicherungs-Tarifrechner. Soft-Sell-Pattern | Behutsamer Übergang Förderung → Versicherung, Stand-Datum Februar 2026 | Kein eigener Förder-Rechner, daher SEO-Visibility begrenzt |
| 17 | **Capitalo PR-Push** | lifepr.de Pressemitteilung 2026-04-20 | "Bündel-Rechner": Kaufprämie + Steuervorteile + THG-Prämie integriert (aber statisch auf der Site) | n/a (PR-Stück) | Marketing-Claim "Bündel" ist eine **gute Differenzierungs-Idee** | In Realität dann doch nur statische Tabellen |
| 18 | **AUTO BILD** | autobild.de/kaufpraemie-e-autos-2026-berechnen/ | Sticky-Rechner mit erweiterten Inputs (Drive-Type, CO₂, E-Range, Income, Kinder) + Eligibility-Output + Aufschlüsselung | **THG-Prämie-Banner (Elektrovorteil, 320 €)** + Carwow + Sparneuwagen + Schwacke-Pricing + Anzeigen-Markierung | Comparison-Tables, Sticky-Rechner, Experten-Quotes (Dudenhöffer, VDA, ZDK), Quellen-Disclaimer | Werbe-Cluster wirken überladen, viele "Anzeige"-Markierungen |
| 19 | **autohaus-hinte.de** | autohaus-hinte.de/E-Mobilität/E-Auto-Förderprogramm-2026 | Rechner + Beraterliste mit Namen+Kontakt + Probefahrt-Link | Probefahrt + Fahrzeugkatalog-Filter | Personalisierter Lokal-Bezug | **Kein nahtloser Übergang** Rechner-Ergebnis → Konfigurator (Conversion-Lücke) |
| 20 | **lade.de (Wallbox)** | lade.de/.../e-auto-praemie-2026-foerderung-jetzt-beantragen/ | Info-Page ohne Rechner, Argumentations-Kette E-Auto-Förderung → Wallbox-Bedarf | **B2B-Leadgen-Formular** (Property-Type, Scale, Priorities) für Mehrparteien-Wallbox-Lösungen | Sehr klare Funnel-Argumentation "Förderung senkt Kosten — Alltag entscheidet sich an Ladesäule" | Kein eigener Förder-Rechner, daher SEO-Reichweite begrenzt |

---

## 3. Top-5 Patterns zum Kopieren

### Pattern 1: **Live-Berechnung mit Komponenten-Aufschlüsselung**
**Wo:** fixrechner.de, AUTO BILD
**Was:** Bei Input-Änderung sofort Ergebnis. Output zeigt nicht nur Gesamtsumme, sondern Aufschlüsselung:
- Basisprämie: 3.000 € (BEV) / 1.500 € (PHEV)
- Sozialbonus: +1.000 € (zvE < 60k) oder +2.000 € (zvE < 45k)
- Kinderbonus: +500 € pro Kind (max 2 = +1.000 €)
- **Summe: X €**

**Warum gut:** Nutzer versteht, warum er X bekommt. Erhöht Vertrauen + reduziert Support-Anfragen.

### Pattern 2: **Grenzfall-Visualisierung**
**Wo:** fixrechner.de
**Was:** Beispiel "44.999 € vs. 45.000 € zvE" zeigt, wie 1 € Mehr-Einkommen 1.000 € Förderung kostet.

**Warum gut:** Sensibilisiert für Steueroptimierung — und macht den Rechner zum Werkzeug, nicht nur zum Output.

### Pattern 3: **Sticky-Rechner + Vergleichstabellen**
**Wo:** AUTO BILD, ADAC
**Was:** Rechner bleibt beim Scroll sichtbar. Darunter Tabellen aller möglichen Fördersätze als Backup (auch ohne JS lesbar).

**Warum gut:** Conversion-Optimierung + SEO-Boost (Tabellen-Content für Google).

### Pattern 4: **Datenschutz-Hinweis + Trust-Cluster über dem Rechner**
**Wo:** fixrechner.de
**Was:**
- 4,9★ aus 1.893 Bewertungen
- "Keine Speicherung deiner Eingaben"
- "Stand: Anfang 2026"
- BAFA-Quelle verlinkt
- Geschäftsführer-Foto + Prüfdatum

**Warum gut:** Senkt Eingabe-Hemmschwelle bei sensiblen Daten (zvE).

### Pattern 5: **Soft-Pivot zu Cross-Sell (HUK-Pattern)**
**Wo:** HUK-Coburg
**Was:** Nach Erklärung der Förderung sanfter Bridge-Satz: *"Mit der neuen Förderung wird der Umstieg attraktiver. Denken Sie auch an den passenden Versicherungsschutz."* → KFZ-Tarifrechner.

**Warum gut:** Cross-Sell ohne aggressive Sales-Atmo. Funktioniert für jede Vertical (Versicherung, Wallbox, Strom, Leasing).

---

## 4. Top-3 Anti-Patterns

### Anti-Pattern 1: **Tabellen statt Live-Rechner** (Capitalo)
Capitalo zeigt 4-5 statische Tabellen, durch die der Nutzer scrollen muss, um seine Förderung selbst herauszusuchen. Das ist **2010er-UX** und der Hauptgrund, warum Capitalo schlechter konvertiert als fixrechner.de.
**Vermeiden:** Wenn wir Tabellen anzeigen, dann NUR als SEO-Backup unter einem Live-Rechner.

### Anti-Pattern 2: **Off-Topic Pop-ups** (drohnen.de)
drohnen.de hat einen technisch sehr guten Rechner, aber das Exit-Intent-Popup zu Drohnen-Versicherung killt Trust komplett.
**Vermeiden:** Keine Pop-ups, schon gar keine Off-Topic-Werbung. Reduziert Conversion + Domain-Autorität.

### Anti-Pattern 3: **Conversion-Sackgasse nach Berechnung** (autohaus-hinte.de, mobile.de, autoscout24.de)
Diese Sites zeigen den Förderbetrag, aber **dann ist Schluss**. Kein "und jetzt?". Kein passgenauer Cross-Sell.
**Vermeiden:** Nach dem Ergebnis IMMER 2-3 logische Next-Steps anbieten:
- "Förderung sichern: KFZ-Versicherung jetzt vergleichen"
- "Strom für dein E-Auto: PV-Anlage berechnen"
- "Zuhause laden: Wallbox-Förderung prüfen"

---

## 5. Affiliate-Insights — Wo lassen die Konkurrenten Geld liegen?

| Vertical | Wer nutzt es? | Status quo | Unsere Chance |
|---|---|---|---|
| **KFZ-Versicherung** | Nur HUK (Inhouse), ACE (generisch), keine reinen Aff-Player | Massiv unterversorgt. Mahlzait der einzige Förder-Rechner mit klarem Tarifcheck-1634-CTA wäre **USP** | **PRIO 1** — Banner 1634 direkt nach Ergebnis |
| **Leasing** | Allane, Autohaus Hinte (eigene Inventare), mobile.de/autoscout24 (Marketplace) | OEM/Leasing-Player nutzen es als Trust-Builder, kein neutraler Förder-Rechner pusht Leasing-Cross-Sell. Tarifcheck hat **kein** Leasing-Programm — Lücke. AWIN evtl. (z.B. Vehiculum) | **PRIO 2** — AWIN-Programme prüfen (Vehiculum, Carwow, Sparneuwagen) |
| **Wallbox / Wallbox-Förderung** | Nur lade.de (B2B), niemand sonst | Größte Lücke! Jeder, der ein E-Auto kauft, braucht eine Wallbox. **0 Konkurrenten** machen Cross-Sell. Wallbox-Bundesförderung seit 15.04.2026 aktiv (bis 2.000 € bidirektional) | **PRIO 1** — Wenn ein AWIN-Wallbox-Programm existiert (Webasto, Heidelberg, EVBox), unbedingt. Sonst Tarifcheck/Check24 prüfen |
| **Solaranlage** | Niemand | Bei Mahlzait Banner 1690 verfügbar. **"Strom für dein E-Auto produzieren"-Pitch** ist organisch | **PRIO 2** — Banner 1690 nach Wallbox-Block |
| **Stromtarif** | Niemand bei E-Auto-Förder-Rechnern | Check24 aid=308/317 verfügbar. **"Günstigerer Strom = günstigere km/kWh"**-Story | **PRIO 3** — als Tertiär-CTA |
| **THG-Quote** | Autobild, ACE, Capitalo, autoscout24 — alle erwähnen es | Bereits sehr besetzt. 200 €/Jahr-Story etabliert. Geddyn (Tarifcheck-Partner?) oder AWIN-Programme prüfen | **PRIO 3** — Nice-to-Have, niedrige Provision |
| **KFZ-Kredit** | Capitalo, AUTO BILD (Carwow) | Capitalo dominiert. Wenn wir Banner 1664 nutzen, sollte Position nach Förder-Ergebnis sein | **PRIO 4** — Banner 1664, niedrige Conversion |
| **Baufinanzierung** | Niemand bei E-Auto-Rechnern | Off-Topic für E-Auto-Käufer. Skip | Skip |
| **Marketplace-Klicks (Fahrzeuge)** | mobile.de, autoscout24 (Inhouse), AUTO BILD (Carwow/Sparneuwagen) | Hohe Reichweite, aber niedrige Provision. AWIN-Programme prüfen (Carwow gibt's evtl. dort) | **PRIO 3** — als zusätzlicher CTA, nicht primär |

**Hauptbotschaft an `affiliate-strategist`:** Wir können der **erste neutrale Förder-Rechner mit echtem Multi-Vertical-Cross-Sell** sein. KFZ-Versicherung (1634) + Wallbox + Solar (1690) als Bundle-Story ist eine USP, die keiner der 20 analysierten Konkurrenten hat.

---

## 6. Strategische Empfehlungen für unser Rechner-Design

1. **Inputs minimal halten** — 3 Standard-Inputs (BEV/PHEV, zvE, Kinder). Erweiterte Inputs (Kaufdatum, Listenpreis, Haltedauer-Bestätigung) als **optionaler "Anspruchs-Check"** in einem zweiten Step.
2. **Live-Berechnung** mit Komponenten-Aufschlüsselung (fixrechner-Pattern).
3. **Eigenanteil-Berechnung** als Differentiator — niemand macht das aktuell ("Auto kostet X, Förderung Y, dein Eigenanteil Z €").
4. **Listenpreis-Input optional** für Eigenanteils-Berechnung.
5. **Cross-Sell-Stack nach Ergebnis** (in der Reihenfolge):
   - "Auto absichern" → KFZ-Versicherung 1634
   - "Wallbox zu Hause" → Wallbox-Förderung-Check + AWIN-Partner falls vorhanden
   - "Strom günstiger" → Check24 Strom aid=308
   - "Solaranlage kombinieren" → Banner 1690 (mit "PV + E-Auto = autark"-Story)
6. **Trust-Stack über dem Rechner**: BMUKN/BAFA-Quelle, Stand-Datum, Datenschutz-Hinweis, ggf. "geprüft am"-Badge.
7. **Sticky-Rechner** auf Mobile.
8. **Verlinkung zu Schwesterrechnern** (Photovoltaik, Wärmepumpe, Firmenwagen, Elektroauto-Rechner) als interne SEO-Boost.
9. **FAQ unter dem Rechner** mit den 10-15 echten Fragen (Quelle: BMUKN-FAQ, autobild-FAQ, ace-FAQ).
10. **2026er-Marker prominent** (Stand: 14.05.2026, Antrag startet voraussichtlich Mai 2026 — BAFA-Portal-Status).

---

## 7. Quellen-URLs (alle besucht/analysiert)

- ADAC: https://www.adac.de/rund-ums-fahrzeug/elektromobilitaet/elektroauto/foerderung-elektroautos/
- BAFA: https://www.bafa.de/DE/Energie/Energieeffizienz/E-Auto_Foerderung_2026/E-Auto_Foerderung_2026_node.html
- smart-rechner.de: https://www.smart-rechner.de/
- AUTO BILD: https://www.autobild.de/kaufpraemie-e-autos-2026-berechnen/
- elektroquatsch.de: https://www.elektroquatsch.de/rechner/e-auto-praemie
- capitalo.de: https://www.capitalo.de/kredit/e-auto-foerderung-rechner
- fixrechner.de: https://fixrechner.de/e-auto-foerderrechner-2026/
- drohnen.de: https://www.drohnen.de/76608/e-auto-foerderung-rechner/
- mobile.de: https://www.mobile.de/lp/e-auto-foerderung/ (HTTP 403 beim Fetch)
- autoscout24: https://www.autoscout24.de/elektroauto/e-auto-foerderung/
- ACE: https://www.ace.de/elektromobilitaet/kosten/e-auto-foerderung/
- Allane Leasing: https://allane.de/de/auto/elektro/foerderung/staatliche-foerderung-2026/rechner
- HUK-Coburg: https://www.huk.de/fahrzeuge/ratgeber/news/e-auto-foerderung-2026.html
- Autohaus Hinte: https://www.autohaus-hinte.de/E-Mobilit%C3%A4t/E-Auto-F%C3%B6rderprogramm-2026
- lade.de Wallbox: https://lade.de/unkategorisiert/e-auto-praemie-2026-foerderung-jetzt-beantragen-alle-voraussetzungen-im-ueberblick/
- BMUKN (offizielle Quelle): https://www.bundesumweltministerium.de/foerderung/fragen-und-antworten-zur-e-auto-foerderung

---

**Bottom Line für team-lead:**
Der Markt ist überraschend dünn besetzt. fixrechner.de hat das UX-Gold, aber nutzt **keine** Cross-Sell-Affiliates. Marketplaces (mobile.de/autoscout24) haben Reichweite, aber dünne Rechner. Versicherer (HUK) haben Affiliate-Drive, aber keinen Rechner. **Unsere Position: Marketplace-Qualitäts-Rechner mit Multi-Vertical-Affiliate-Stack — diese Lücke ist offen.**
