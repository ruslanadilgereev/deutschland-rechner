# Lebenslagen-Rechner-Welle — Design & Bau-Spec

**Datum:** 2026-07-22
**Ziel:** Neue Seiten im „Witwenrente-Klasse"-Format bauen — tiefe, gesetzlich fundierte Lebenslagen-Rechner mit echtem Suchvolumen. Maximaler SEO-Traffic + Monetarisierung.
**Scope-Entscheidung des Auftraggebers:** 100 % — alle validierten Kandidaten bauen (kein Pilot), plus Optimize-Prizes.

---

## 1. Ausgangslage (datenbelegt)

- Bestand: **292 Rechner**, breite Abdeckung → der *Commodity*-Rechner-Raum ist **gesättigt** (von 332 „unabgedeckten" Rechner-Keywords sind praktisch alle nur Schreibvarianten bestehender Rechner). Das ist das gefühlte „Limit".
- Die lokalen Altdaten (`.kwtmp/kw2_all.json`, 1.313 KWs) wurden **rund um Bestandsrechner** geseedet → kennen die neuen Lebenslagen-Themen gar nicht.
- **Methode:** 24 Lebenslagen-Cluster (Sozial/Recht/Vorsorge/Familie/Gesundheit) kuratiert → 126 Keywords in **einem** `get_keyword_metrics`-Batch mit echten DE-Zahlen hydriert (Volumen · Keyword-Difficulty · CPC · Intent · Markt DE/locationCode 2276).
- **Ergebnis:** Der Lebenslagen-Raum ist weit offen — mehrere Cluster sind groß und trotzdem auf **KD 0–14 rankbar**.

## 2. Was „Witwenrente-Klasse" bedeutet (Definition of Done)

Referenz: `src/pages/witwenrente-rechner.astro` + `src/components/rechner/WitwenrenteRechner.tsx`. Jede neue Seite MUSS die 9-Teile-Anatomie aus `CLAUDE.md` erfüllen:

1. Echter, **client-seitiger React-Rechner** mit nicht-trivialer Logik (kein Ein-Formel-Ding).
2. Trust/E-E-A-T-Block: „Zuletzt aktualisiert", **Grundlage / Berücksichtigt / Nicht berücksichtigt**.
3. SEO-Content: **10+ H3-Abschnitte**, Formeln, mind. **1 Schritt-für-Schritt-Rechenbeispiel als Tabelle**.
4. **„Typische Fehler & Sonderfälle"**-Block.
5. **Sichtbare FAQ** (`<details>`, ≥7 Fragen) — 1:1 deckungsgleich mit FAQPage-Schema.
6. JSON-LD: **WebApplication + FAQPage**.
7. **Primärquellen** in `quellen[]` **und** in der Komponenten-Quellen-Sektion (amtliche Norm, keine Sekundärquellen).
8. `VerwandteRechner` + Inline-Crosslinks zu thematisch nahen Bestandsrechnern.
9. Drei-Teile-Konvention: Registry-Eintrag (`src/data/rechner.ts`) + Komponente + `.astro`-Seite, `id` = Slug-Stamm.

## 3. Primärquellen-Gate (nicht verhandelbar)

Jeder rechtliche/steuerliche Wert im Rechner MUSS am Bau gegen die **amtliche Primärquelle** verifiziert werden (gesetze-im-internet.de, BMF, Destatis, DRV-Werte, BeamtVG, BewG-Anlagen, VersMedV). Alle im Folgenden genannten Zahlen sind **Baustands-Annahmen** und mit `⚠️ 2026 verifizieren` markiert — im Zweifel **flaggen statt shippen** (Policy aus `.kwtmp/newcalc_workflow.js`). Falsche Gesetzeszahlen = SEO-/AdSense-/Haftungsrisiko.

---

## 4. Track A — Neue Seiten (12 Rechner)

Reihenfolge = Bau-Priorität (Cluster-Volumen × Rankbarkeit × Fit). Volumen = Summe des Keyword-Clusters/Monat, DE.

### A1 · Verhinderungspflege / Kurzzeitpflege-Rechner
- **Slug:** `verhinderungspflege` · **Kategorie:** gesundheit · **Cluster:** ~107.000/Mon · **KD:** 7–14 🟢 · **CPC:** ~1 €
- **Primärquelle:** §§ 39, 42, 45b SGB XI (+ Pflegeunterstützungs-/-entlastungsgesetz, **Entlastungsbudget ab 01.07.2025** ⚠️ 2026-Regel verifizieren).
- **Rechenlogik:** Budget Verhinderungspflege (§39) + Kurzzeitpflege (§42), gegenseitige Aufstockung, ab 07/2025 ggf. **Gemeinsamer Jahresbetrag (Entlastungsbudget)**; +Entlastungsbetrag 125 €/Mon (§45b); weitergezahltes Pflegegeld (50 %) während Verhinderungspflege.
- **Inputs:** Pflegegrad, Tage/Wochen, Angehörige vs. professionell, Pflegegeld-Höhe. **Output:** erstattungsfähiger Betrag, Restbudget, weitergezahltes Pflegegeld.
- **Monetarisierung:** Pflegezusatz-/AdSense · **Crosslinks:** Pflegegeld, Pflegegrad, Krankengeld.

### A2 · Unterhaltsvorschuss-Rechner
- **Slug:** `unterhaltsvorschuss` · **Kategorie:** familie · **Cluster:** ~42.000/Mon · **KD:** 5 (2026-Var.)–32 🟢 · **CPC:** ~0,8 €
- **Primärquelle:** Unterhaltsvorschussgesetz (UhVorschG/UVG).
- **Rechenlogik:** UV = Mindestunterhalt (Düsseldorfer Tab., 1. Einkommensgruppe, Altersstufe) − **volles Kindergeld**. 3 Altersstufen (0–5/6–11/12–17). ⚠️ Mindestunterhalt & Kindergeld 2026 verifizieren. Anspruch bis 12. Lj. bedingungslos, 12–17 mit Bedingungen.
- **Inputs:** Kindalter, Zahlungen des anderen Elternteils. **Output:** monatl. UV je Kind.
- **Monetarisierung:** AdSense (Alleinerziehende) · **Crosslinks:** Unterhalt, Kindergeld, Elterngeld.
- **Abgrenzung:** ≠ bestehender Unterhalts-Rechner (staatlicher Vorschuss, andere Logik).

### A3 · Grad-der-Behinderung (GdB) + Behindertenpauschbetrag-Rechner
- **Slug:** `grad-der-behinderung` · **Kategorie:** soziales · **Cluster:** ~51.000/Mon (GdB ~29k + Pauschbetrag ~22k) · **KD:** GdB 19 / Pauschbetrag 5 🟢 · **CPC:** ~1,2 €
- **Primärquelle:** VersMedV (Versorgungsmedizin-Verordnung, Anlage „Versorgungsmedizinische Grundsätze") + § 33b EStG.
- **Rechenlogik:** **Gesamt-GdB aus Einzel-GdB** (NICHT additiv — höchster Einzel-GdB, dann Erhöhung nach Wechselwirkung; Näherungs-Integration mit klarem Hinweis „Behörde entscheidet verbindlich"). Behindertenpauschbetrag nach GdB-Tabelle (⚠️ 2026-Beträge §33b, GdB 20→…→100, Merkzeichen Bl/TBl/H). Merkzeichen → Nachteilsausgleiche.
- **Inputs:** Liste Einzel-GdB + Merkzeichen. **Output:** geschätzter Gesamt-GdB, Pauschbetrag, Vorteilsliste.
- **Monetarisierung:** AdSense · **Crosslinks:** Steuererstattung, Einkommensteuer, Kfz-Steuer (Befreiung).

### A4 · Grundsicherung im Alter-Rechner
- **Slug:** `grundsicherung-im-alter` · **Kategorie:** soziales · **Cluster:** ~21.000/Mon · **KD:** 6–19 🟢 · **CPC:** ~1,4 €
- **Primärquelle:** §§ 41 ff. SGB XII, Regelbedarfsstufen (⚠️ 2026-Regelsatz verifizieren, Stufe 1 ~563 €).
- **Rechenlogik:** Regelbedarf + angemessene KdU (Miete+Heizung) + Mehrbedarfe − anrechenbares Einkommen (Rente etc. minus Freibeträge) → Anspruch. Engine ~ Bürgergeld-Rechner (wiederverwendbar).
- **Inputs:** Rente/Einkommen, Miete/Heizung, Partner, Mehrbedarf. **Output:** monatl. Grundsicherung.
- **Monetarisierung:** AdSense · **Crosslinks:** Bürgergeld, Wohngeld, Rente, Rentenlücke.

### A5 · Waisenrente / Halbwaisenrente-Rechner
- **Slug:** `waisenrente` · **Kategorie:** soziales · **Cluster:** ~21.000/Mon · **KD:** 0 🟢 · **CPC:** niedrig
- **Primärquelle:** § 48 SGB VI (+ aktueller Rentenwert **42,52 €**, konsistent mit Witwenrente).
- **Rechenlogik:** Halbwaise = 10 % + Zuschlag, Vollwaise = 20 % + Zuschlag der Versichertenrente; Zuschlag über Entgeltpunkte × Rentenwert. Bis 18, bis 27 in Ausbildung. ⚠️ Einkommensanrechnung Waisen 2026-Stand verifizieren.
- **Inputs:** Versichertenrente/EP des Verstorbenen, halb/voll, Alter/Ausbildung. **Output:** monatl. Waisenrente.
- **Monetarisierung:** AdSense · **Crosslinks:** **Witwenrente** (Zwilling!), Rente, Rentenpunkte. Reuse Rentenwert-Konstante.

### A6 · Nießbrauch(wert)-Rechner
- **Slug:** `niessbrauch` · **Kategorie:** finanzen · **Cluster:** ~18.000/Mon · **KD:** 5 🟢 · **CPC:** ~1–2,5 €
- **Primärquelle:** §§ 14–16 BewG (+ Anlage 9 Vervielfältiger / BMF-Sterbetafel, Anlage 9a für Zeitrenten).
- **Rechenlogik:** Kapitalwert = Jahreswert × Vervielfältiger. Jahreswert = jährl. Nutzung (z. B. Netto-Kaltmiete), gedeckelt auf Verkehrswert/18,6 (§16). Vervielfältiger nach Alter/Geschlecht (lebenslang) bzw. Laufzeit (Zeitnießbrauch). ⚠️ aktuelle BMF-Vervielfältiger 2026 verifizieren.
- **Inputs:** Jahreswert, Alter/Geschlecht ODER Laufzeit. **Output:** Kapitalwert (für Schenkung-/Erbschaftsteuer, Immo).
- **Monetarisierung:** Immo/Steuer-Affiliate · **Crosslinks:** Schenkungsteuer, Erbschaftsteuer, Ertragswertverfahren.

### A7 · Kinderkrankengeld-Rechner
- **Slug:** `kinderkrankengeld` · **Kategorie:** familie · **Cluster:** ~17.000/Mon · **KD:** 14–22 🟡 · **CPC:** ~1 €
- **Primärquelle:** § 45 SGB V.
- **Rechenlogik:** = 90 % des ausgefallenen Netto-Arbeitsentgelts (Deckel BBG-basiert). Kinderkrankentage 2026 (⚠️ verifizieren: Standard 15/Kind/Elternteil, max 35; Alleinerziehende 30/70).
- **Inputs:** Brutto/Netto, Kinderzahl, Tage. **Output:** Kinderkrankengeld/Tag + gesamt, Resttage.
- **Monetarisierung:** AdSense · **Crosslinks:** Krankengeld, Elterngeld, Brutto-Netto.

### A8 · Versorgungsausgleich-Rechner
- **Slug:** `versorgungsausgleich` · **Kategorie:** familie · **Cluster:** ~14.000/Mon · **KD:** 12 🟢 · **CPC:** 2,8–7,3 € 💰
- **Primärquelle:** VersAusglG.
- **Rechenlogik:** Ehezeitanteile der Anrechte beider Partner → interne Teilung 50/50; Ausgleichswert = ½ (Ehezeitanteil A − Ehezeitanteil B), gesetzl. Rente in Entgeltpunkten. Vereinfachte Modellrechnung mit Hinweis auf verbindliche Familiengericht-Berechnung.
- **Inputs:** EP/Anrechte je Partner in der Ehezeit. **Output:** Ausgleich in EP/€.
- **Monetarisierung:** Anwalt/Legal-Affiliate (hohe CPC) · **Crosslinks:** Scheidungskosten, Zugewinnausgleich, Rente.

### A9 · Pflichtteil-Rechner (Erbrecht)
- **Slug:** `pflichtteil` · **Kategorie:** finanzen · **Cluster:** ~7.000/Mon · **KD:** 1 🟢 · **CPC:** ~1 €
- **Primärquelle:** § 2303 BGB (+ §§ 2325 ff. Pflichtteilsergänzung, §§ 1931/1371 gesetzl. Erbteil + Güterstand).
- **Rechenlogik:** Pflichtteil = ½ × gesetzl. Erbteil × Nachlasswert. Gesetzl. Erbteil abhängig von Konstellation (Ehegatte + Kinder, Güterstand ZGG +¼). + Pflichtteilsergänzung für Schenkungen <10 J. (Abschmelzung 1/10 pro Jahr).
- **Inputs:** Verwandtschaft, Zahl Miterben, Güterstand, Nachlasswert, Schenkungen. **Output:** Pflichtteilsquote + € .
- **Monetarisierung:** Anwalt/Legal-Affiliate · **Crosslinks:** Erbschaftsteuer, Schenkungsteuer, Nießbrauch.

### A10 · Elternunterhalt-Rechner
- **Slug:** `elternunterhalt` · **Kategorie:** familie · **Cluster:** ~7.000/Mon · **KD:** 0 🟢 · **CPC:** ~0,3 €
- **Primärquelle:** §§ 1601 ff. BGB + Angehörigen-Entlastungsgesetz (§ 94 Abs. 1a SGB XII).
- **Rechenlogik:** Haftung erst ab **Brutto-Jahreseinkommen > 100.000 €** des Kindes. Darüber: aus bereinigtem Netto − Selbstbehalt (⚠️ 2026-Wert, ~2.650 €+) → 50 % des Übersteigenden.
- **Inputs:** Bruttojahreseinkommen, Netto, Familienstand. **Output:** monatl. Elternunterhalt (0 bei <100k).
- **Monetarisierung:** AdSense/Pflege · **Crosslinks:** Pflegekosten/Eigenanteil, Grundsicherung im Alter, Unterhalt.

### A11 · Beamtenpension / Ruhegehalt-Rechner
- **Slug:** `beamtenpension` · **Kategorie:** soziales · **Cluster:** ~6.000/Mon · **KD:** 0–4 🟢 · **CPC:** ~1,7–3,5 €
- **Primärquelle:** §§ 4 ff., 14 BeamtVG.
- **Rechenlogik:** Ruhegehalt = Ruhegehaltssatz × ruhegehaltfähige Dienstbezüge. Satz = 1,79375 %/Dienstjahr, max **71,75 %**. − Versorgungsabschlag bei vorzeitigem Ruhestand (0,3 %/Monat, max 10,8 %). Mindestversorgung.
- **Inputs:** Dienstjahre, letzte Bezüge, Ruhestandsalter. **Output:** Pension brutto.
- **Monetarisierung:** Vorsorge-Affiliate · **Crosslinks:** Rente, Rentensteuer, Pensionskasse.

### A12 · Zugewinnausgleich-Rechner
- **Slug:** `zugewinnausgleich` · **Kategorie:** familie · **Cluster:** ~5.000/Mon · **KD:** 0 🟢 · **CPC:** ~1 €
- **Primärquelle:** §§ 1373–1378 BGB.
- **Rechenlogik:** Zugewinn = Endvermögen − (indexiertes) Anfangsvermögen je Partner. Ausgleichsforderung = ½ (höherer − niedrigerer Zugewinn). Kappung auf Vermögen.
- **Inputs:** Anfangs-/Endvermögen je Partner (+ Heirats-/Trennungsdatum für Index). **Output:** Ausgleichsforderung.
- **Monetarisierung:** Anwalt/Legal-Affiliate · **Crosslinks:** Versorgungsausgleich, Scheidungskosten.

---

## 5. Track B — Optimize-Prizes (Bestand vertiefen, KEIN neuer Slug)

Größter Traffic-Hebel des ganzen Projekts — Keywords, die Bestandsseiten **bereits berechnen**, aber nicht targeten.

| Keyword | Vol/Mon | KD | Bestandsseite | Aktion |
|---|---:|---|---|---|
| **düsseldorfer tabelle 2026** | 165.000 | 0 🟢 | Unterhalts-Rechner | Title/H1/Intro/FAQ auf „Düsseldorfer Tabelle 2026" retargeten, volle Tabelle einbetten, Alias |
| **düsseldorfer tabelle** | 90.500 | 40 | Unterhalts-Rechner | s. o. (gleiche Seite) |
| **mutterschaftsgeld** | 22.200 | 29 | **Mutterschutz-Rechner** (rechnet es bereits) | Money-Rechnung + Keyword sichtbar machen, FAQ, evtl. Alias |
| **trennungsunterhalt** | 8.100 | 0 🟢 | Ehegattenunterhalt-Rechner (deckt es) | Trennungsunterhalt-Modus/-Sektion + Keyword-Targeting |
| **erwerbsminderungsrente höhe** | 9.900 | 9 | EM-Renten-Rechner | „Höhe"-Abschnitt + Keyword |
| rentenabschlag / flexirente-hinzuverdienst | ~11.000 | 0–18 | Frührente / Renteneintrittsalter | In Bestandsseiten als Abschnitt einfügen |

## 6. Ausgesiebt (bewusst NICHT bauen)

- **Krankentagegeld · Sterbegeld(versicherung) · Pflegetagegeld/Pflegezusatz** — hohe CPC, aber *privatvertraglich* → **verletzt Primärquellen-Disziplin** (keine amtliche Norm). Nur als Affiliate-Content denkbar, nicht als Gesetzes-Rechner. Ausnahme: gesetzliches Beamten-Sterbegeld (BeamtVG) wäre baubar, aber niedriges Volumen → deferred.

## 7. Zukünftige Wellen (Kandidaten, noch nicht vermessen)

Blindengeld/Landesblindengeld, Rentensplitting, Erbengemeinschaft-Auseinandersetzung, Bürgergeld-Mehrbedarf, Aufstiegs-BAföG, Kinderzuschlag-Vertiefung. → Bei Bedarf via gleicher Methode (1 Batch `get_keyword_metrics`) nachmessen.

## 8. Ausführungsplan

- **Bau pro Rechner:** Primärquelle verifizieren → 3 Dateien (Komponente + `.astro` + Registry) → Build-Gate (`npm run build`) → Content-/JSON-LD-Check → Commit `git commit -- <pathspec>` (Deutsch, Conventional-Prefix, Quellen-URLs im Body, Co-Author-Footer).
- **Kein `git add -A`.** `src/data/rechner.ts` ist Konflikt-Hotspot (Multi-Session-Disziplin).
- **Kein Push / Deploy** ohne ausdrückliche Ansage.
- **Wellen-Schnitt:** A1–A5 (größte Cluster) → A6–A9 → A10–A12 → Track B. Nach jeder Welle Build + Sichtprüfung.
- **Definition of Done je Seite:** Abschnitt 2 vollständig erfüllt, alle Zahlen quellenverifiziert.
