# E-Auto-Förder-Rechner — Affiliate-Monetarisierungsplan

> Ziel: Maximaler Revenue/Page-View auf `/eauto-foerderung-rechner` durch optimale Cross-Sell-Cascade aus existierenden Affiliate-Programmen + priorisierte Liste neuer Programme zum Beantragen.

---

## Sektion 1 — Vertical-Match-Bewertung

Bewertung jedes verfügbaren Verticals nach **thematischem Fit**, **realistischer Conversion-Rate** und **erwartetem RPM** (Revenue per Mille = €/1000 Page-Views).

### Annahmen für die Schätzungen
- **Page-Traffic-Annahme:** User auf `/eauto-foerderung-rechner` ist **Hot Lead** — er steht *unmittelbar vor einer E-Auto-Kaufentscheidung*. Das ist ein Premium-Audience (Kaufabsicht ist hoch, Kaufkraft mittel-hoch, Bewusstsein für Folgekosten geschärft).
- **Conversion-Baseline:** Auf Money-Pages mit klarem Money-Intent liegen Affiliate-CTRs bei 3-8% (Banner sichtbar nach Result), Conversion-zu-Lead bei 8-15% bei thematisch perfektem Fit, 3-6% bei schwächerem Fit.
- **Subid-tracking:** Subids `eautofoerderung*Inline` + `eautofoerderung*Sidebar` (siehe Sektion 4).

---

### TIER 1 — Perfect Fit (Pflicht-Verticals, hoher CPL, klares Cross-Sell-Narrativ)

#### 1. Solaranlage (Tarifcheck `ad_id=1690`) — **PRIMARY-Kandidat**

**Thematischer Fit:** **10/10**

**Narrativ:** *"Sie sparen 4.500€ durch die Förderung — sparen Sie nochmal 1.200€/Jahr Stromkosten mit eigener PV-Anlage. Eigener Solarstrom lädt Ihr E-Auto für unter 10 Cent/kWh statt 35 Cent an der öffentlichen Säule."*

**Warum perfekt:**
- E-Auto + PV ist das **mit Abstand häufigste Cross-Sell-Pattern** in der gesamten E-Mobility-Branche
- User denkt nach Förderkalkulation automatisch über Folgekosten Strom nach
- Hoher Investitions-Bias schon vorhanden (er ist bereit, 30-50k auszugeben)
- Provision-Annahme: Tarifcheck Solaranlage liegt typischerweise bei **40-60€ CPL** (gehört zu den lukrativsten Tarifcheck-Verticals)

**Realistic CR:**
- CTR auf Banner: **6-9%** (extrem warmer Kontext)
- Lead-Conversion: **10-14%** (Tarifcheck-Inhouse hat gutes Funnel)
- Erwarteter RPM: **~24-50 €/1000 Visits** *(siehe Sektion 5 für Rechnung)*

**Position:** **PRIMARY direkt unter Result-Block**

---

#### 2. KFZ-Versicherung (Tarifcheck `ad_id=1634`) — **SECONDARY**

**Thematischer Fit:** **9/10**

**Narrativ:** *"E-Auto = bis 30% günstigere KFZ-Versicherung möglich (weniger Verschleiß-Risiken bei Versicherern). Jetzt Tarife vergleichen, bevor Sie zulassen."*

**Warum stark:**
- E-Auto muss zugelassen werden → Versicherung ist **zwingend nötig** (nicht optional wie Solar)
- Versicherer haben für E-Autos teils niedrigere Tarife → echter Wechsel-Anreiz
- Aktuell beste Wechsel-Saison ist Q4 (30.11. Stichtag), aber Neu-Zulassung geht ganzjährig
- Existierende Provision: **70€ CPO** (laut affiliates.ts kfz-Vertical)

**Realistic CR:**
- CTR: **4-6%** (etwas niedriger als Solar, weil "muss-eh-machen"-Vibe)
- Lead/Order-Conversion: **2-4%** (CPO ist immer niedriger als CPL)
- Erwarteter RPM: **~6-17 €/1000 Visits**

**Position:** **SECONDARY (unter Primary)** oder als zweite Banner-Card im Cross-Sell-Block.

---

### TIER 2 — Good Fit (Tertiäre Cards, lohnen sich als Cross-Sell-Cluster)

#### 3. Strom-Tarif (Check24 `aid=308`/`cat=1`) — **TERTIÄR**

**Thematischer Fit:** **8/10**

**Narrativ:** *"E-Auto braucht ~3.000 kWh/Jahr extra Strom. Mit speziellem E-Auto-Tarif sparen Sie 200-400€/Jahr gegenüber Grundversorger."*

**Warum gut:**
- Hoher Stromverbrauch durch Wallbox-Laden ist **konkretes Schmerzthema**
- Check24-Strom ist **stornofrei 20€ CPL** (in `affiliates.ts` als `strom`)
- Allerdings: Kein **E-Auto-spezifischer** Tarif-Filter bei Check24-Inhouse → Standard-Strom-Vergleich
- Lohnt sich für die Masse, weniger für E-Auto-Enthusiasten die schon Ökostrom/E-Auto-Tarif haben

**Realistic CR:**
- CTR: **3-5%** (weniger Premium, mehr "kann-man-machen")
- Lead-Conversion: **8-12%** (Check24-Funnel ist solide)
- Erwarteter RPM: **~5-12 €/1000 Visits**

**Position:** **TERTIÄR** im Cross-Sell-Bereich, neben Kredit-Card oder als Sidebar-Bullet.

---

#### 4. Kredit (Tarifcheck `ad_id=1664`) — **TERTIÄR (Conditional)**

**Thematischer Fit:** **6/10** *(stark gekoppelt an Listenpreis-Input)*

**Narrativ:** *"Sie kalkulieren ein E-Auto über 35.000€? Mit Autokredit ab 3,9% effektivem Zins finanzieren — günstiger als Leasing bei langer Haltedauer."*

**Warum bedingt:**
- Hängt **stark vom Listenpreis-Input** ab: User mit 25k-Kalkulation braucht eher Sparbuch, User mit 50k-Kalkulation überlegt zu finanzieren
- Conditional-Display ist hier Pflicht: Card nur zeigen wenn Listenpreis > 30k *(siehe Empfehlung in Sektion 2)*
- Provision: Kredit-Tarifcheck liegt typischerweise **15-25€ CPL** (CPL-Modell, stornofrei)

**Realistic CR:**
- CTR (conditional): **4-7%** (wenn User-Profil passt)
- Lead-Conversion: **6-10%** (Kredit-Vergleicher konvertieren ordentlich)
- Erwarteter RPM (conditional shown): **~4-10 €/1000 Conditional-Visits**

**Position:** **TERTIÄR**, nur conditional einblenden bei Listenpreis > 30.000€.

---

### TIER 3 — Mid Fit (Optional, niedrige Priorität)

#### 5. Baufinanzierung (Tarifcheck `ad_id=633`)

**Thematischer Fit:** **3/10** *(nur bei sehr engem Use-Case)*

**Narrativ:** *"Sie planen E-Auto + Wallbox + PV-Anlage im Eigenheim? Mit Modernisierungskredit oder Annuitätenkredit auf das Haus finanzieren — niedrigste Zinsen im Markt."*

**Warum eher schwach:**
- Sehr enger Use-Case (User muss Hauseigentum + Modernisierungs-Mindset haben)
- Lange Buyer-Journey (Baufi-Lead = Wochen-Prozess)
- Geringer Match mit "ich-will-mein-E-Auto-jetzt-kaufen"-Intent

**Empfehlung:** **NICHT auf der E-Auto-Förder-Page**. Das gehört auf `/photovoltaik-rechner` als Cross-Sell, nicht hier. Skip.

---

### Unklar / Recherche-Verticals (siehe Sektion 3)

- **Auto-Leasing:** Tarifcheck hat **kein Auto-Leasing**-Vertical inhouse. Hier müsste Ruslan neue Programme prüfen → Sektion 3.
- **Wallbox-Hersteller:** Kein Standard-Tarifcheck-Banner. → Sektion 3.
- **Probefahrt-Buchung:** Nur Direct-Deal mit OEMs realistisch. → Sektion 3.

---

## Sektion 2 — Optimal Banner-Cascade auf der Rechner-Page

> **Goal:** Maximale CTR auf Primary, ohne den User mit Cross-Sells zu erschlagen.

### Position-Empfehlung (von oben nach unten)

```
┌─────────────────────────────────────────────────────┐
│ [Calculator-Inputs]                                 │
│ [BERECHNEN-Button]                                  │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ RESULT-BLOCK                                    │ │
│ │ "Ihre Förderung: 4.500 €"                       │ │
│ │ Aufschlüsselung (Innovationsprämie / Steuer /…) │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ PRIMARY AFFILIATE-CARD                          │ │
│ │ "Mit eigener PV-Anlage Stromkosten halbieren"   │ │
│ │ [Solaranlagen-Tarife vergleichen →]             │ │
│ │ Tarifcheck ad_id=1690 / subid=eautofoerderung-  │ │
│ │ solaranlageInline                               │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ [SEO-Content: "Wie funktioniert die Förderung?"]    │
│ [FAQ-Block]                                         │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ SECONDARY AFFILIATE-CARD                        │ │
│ │ "E-Auto KFZ-Versicherung: bis 30% sparen"       │ │
│ │ [KFZ-Tarife jetzt vergleichen →]                │ │
│ │ Tarifcheck ad_id=1634 / subid=eautofoerderung-  │ │
│ │ kfzInline                                       │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ TERTIARY CROSS-SELL-CLUSTER (kleinere Cards)    │ │
│ │ ┌──────────────┐  ┌──────────────────┐          │ │
│ │ │ Strom        │  │ Kredit (cond.)   │          │ │
│ │ │ E-Auto-Tarif │  │ ab 3,9% Zins     │          │ │
│ │ │ vergleichen  │  │ vergleichen      │          │ │
│ │ └──────────────┘  └──────────────────┘          │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Konkrete Map für `PAGE_AFFILIATES` in `src/data/affiliates.ts`

Da die existierende `PageAffiliateConfig` aktuell nur `primary` + `secondary` unterstützt (max 2 Cards via `AffiliateBlock.astro`), reichen wir das so an:

```typescript
'/eauto-foerderung-rechner': { primary: 'solaranlage', secondary: 'kfz' },
```

> **Aber:** `solaranlage` existiert noch **nicht** in `VERTICALS`! Aktuell hat `affiliates.ts` **kein** Solaranlagen-Vertical definiert (Tarifcheck `ad_id=1690`). Das ist eine **Action für Ruslan / rechner-architect**: vor Launch der Page muss `solaranlage` als neuer `VerticalKey` aufgenommen werden:

```typescript
solaranlage: {
  key: 'solaranlage',
  label: 'Solaranlage / Photovoltaik',
  shortLabel: 'Solar',
  provider: 'tarifcheck',
  tarifcheck: { adId: 1690, deep: 'solaranlage' },
  provision: { model: 'CPL', amount: 50, stornofrei: true }, // TODO: exakter Betrag von Tarifcheck-Dashboard nachtragen
},
```

> **Zusätzlich:** `kfz` ist in `affiliates.ts` aktuell als **`tarifcheckTargetUrl`** definiert (AWIN-Fallback, kein Inhouse-`ad_id`). Da Ruslan jetzt `ad_id=1634` hat, sollte `kfz` auf das echte Inhouse-Banner umgestellt werden:

```typescript
kfz: {
  ...
  tarifcheck: { adId: 1634, deep: 'kfz-versicherung' },  // ← echtes Inhouse statt awin-Fallback
  provision: { model: 'CPO', amount: 70 },
},
```

### Tertiäre Cards: Erweiterung des Card-Systems empfohlen

Der aktuelle `AffiliateBlock.astro` unterstützt nur 2 Slots. Für Tertiär-Cluster (Strom + Kredit conditional) gibt es zwei Optionen:

1. **Einfach:** Skip Tertiär — nur Primary + Secondary nutzen (lean Setup, weniger Coverage aber sauber)
2. **Erweitert:** Neue Component `AffiliateTertiaryCluster.astro` bauen die unten an der Page einen kleineren Cross-Sell-Grid mit 2-3 kleinen Cards rendert (analog wie Footer-Cluster auf anderen Pages)

**Empfehlung:** Für den initialen Launch **Option 1** (lean). Tertiär kann später A/B-getestet werden, wenn Primary+Secondary-Performance gemessen ist.

---

## Sektion 3 — Neue Affiliate-Programme zum Beantragen

> Ruslan sollte folgende Programme zusätzlich beantragen, weil sie auf der E-Auto-Förder-Page (und Schwesterpages wie `/elektroauto-rechner`) **direkt monetarisierbar** sind und aktuell keine Coverage haben.

### A) Auto-Leasing-Programme — **HÖCHSTE PRIORITÄT**

| Programm | Netzwerk | Wahrscheinlichkeit | Erwartete Provision | Status |
|---|---|---|---|---|
| **Sixt+ / Sixt Leasing** | AWIN | hoch | 50-120€ CPL/CPO | beantragen |
| **ALD Automotive (ab 2025 Ayvens)** | AWIN | mittel | 80-150€ CPL | beantragen |
| **LeasingMarkt.de** | AWIN | hoch | 40-80€ CPL | beantragen |
| **VEHICULUM** | AWIN/direct | hoch | 60-100€ CPL | beantragen |
| **MeinAuto.de** | AWIN | hoch | 50-90€ CPL | beantragen |

**Warum lohnt es:** Auto-Leasing für E-Autos ist **größer als Auto-Kredit** (60-70% aller privaten E-Auto-Anschaffungen sind Leasing-basiert). Die 2026er-Förderung wirkt sich teils direkt auf Leasingraten aus → Leasing-Vergleichs-Klick ist warm.

**Empfehlung Ruslan:**
- Erstanmeldung bei **AWIN Publisher-Dashboard** → Search für "leasing", "auto" → bewerben bei Top-5
- Bei Annahme: neuer `VerticalKey` `'autoleasing'` in `affiliates.ts`, AWIN-MID + targetUrl
- Bei `/eauto-foerderung-rechner`: Auto-Leasing könnte mittelfristig **Primary** schlagen wenn CPL höher ist als Solaranlage

**Realistic Revenue-Lift:** **+30-50% RPM** auf der E-Auto-Förder-Page wenn Auto-Leasing dazukommt.

---

### B) Wallbox-Hersteller / E-Mobility-Hardware — **HOHE PRIORITÄT**

| Programm | Netzwerk | Wahrscheinlichkeit | Erwartete Provision | Status |
|---|---|---|---|---|
| **KEBA Wallboxen** | direct/AWIN | mittel | 15-30€ CPO oder 3-5% | recherchieren |
| **go-e Charger** | AWIN/direct | hoch | 5-8% CPO (~30-80€/Wallbox) | beantragen |
| **ABL eMH (Sono)** | direct | niedrig | unklar | nice-to-have |
| **Heidelberg Wallbox** | direct | mittel | unklar | recherchieren |
| **EcoFlow / Anker SOLIX** (PowerYards) | AWIN | hoch | 5-7% CPO | beantragen (Cross-Sell Solar) |
| **Wallbox.com (Pulsar Plus)** | AWIN | hoch | 6-10% CPO | beantragen |

**Warum lohnt es:** Wallbox-Kauf ist **unvermeidbar** für E-Auto-Eigentümer (>80% installieren eigene Wallbox in 6 Monaten nach E-Auto-Kauf). Wallboxen kosten 600-2000€ → Provision pro Sale 30-150€ ist realistisch.

**Empfehlung Ruslan:**
- AWIN-Search "wallbox", "ladestation", "elektromobilität"
- Top-3 Hersteller bewerben (go-e + Wallbox.com sind die größten AWIN-Player)
- Bei Annahme: `VerticalKey` `'wallbox'` einführen → Tertiär-Card auf `/eauto-foerderung-rechner` + `/elektroauto-rechner`

**Realistic Revenue-Lift:** **+15-25% RPM** auf E-Auto-Pages.

---

### C) E-Auto-spezifische Strom-Tarife — **MITTLERE PRIORITÄT**

| Programm | Netzwerk | Wahrscheinlichkeit | Erwartete Provision | Status |
|---|---|---|---|---|
| **Octopus Energy GO/Intelligent** | direct (UK→DE) | mittel | 20-40€ CPL | direct deal |
| **1KOMMA5° E-Auto-Tarif (Heartbeat AI)** | direct | niedrig | unklar | recherchieren |
| **Tibber** | AWIN/direct | hoch | 25-50€ CPL | beantragen |
| **Vattenfall Autostrom** | AWIN | hoch | 20-35€ CPL | beantragen |
| **EnBW mobility+** | direct | mittel | 15-25€ CPL | recherchieren |

**Warum lohnt es:** E-Auto-spezifische Tarife (dynamische Preise, Nachttarife) sind **massiv besser konvertierend** für E-Auto-Owner als Standard-Strom-Vergleich. Tibber + Octopus haben gut funktionierende Affiliate-Funnels.

**Empfehlung Ruslan:**
- **Tibber** zuerst beantragen (größte E-Auto-Community in DE)
- Octopus Energy: derzeit DE-Markteintritt läuft → Direct-Deal-Mail an deren Marketing-Team
- Bei Annahme: separater `VerticalKey` `'strom-eauto'` (statt generischem `strom`-Banner)
- Auf `/eauto-foerderung-rechner` als Tertiär statt Check24-Strom verwenden, höhere RPM erwartbar

**Realistic Revenue-Lift:** **+5-15% RPM** (kleinerer Effekt weil nur einer Sub-Audience-Teil).

---

### D) Auto-Hersteller-Direct (OEM) — **NIEDRIGE PRIORITÄT, langfristig hoch**

| Programm | Setup | Wahrscheinlichkeit | Erwartete Provision | Status |
|---|---|---|---|---|
| **BMW iX/i4 Probefahrt-Lead** | direct deal | sehr niedrig (Solo-Publisher) | 80-200€ CPL | unrealistic kurzfristig |
| **VW ID. Probefahrt** | direct deal | sehr niedrig | 50-150€ CPL | unrealistic kurzfristig |
| **Tesla Referral** | direct (Tesla Referral Code) | hoch | Tesla-Credits, kein Cash | nice-to-have |
| **Polestar Test-Drive** | direct deal | niedrig | unklar | nice-to-have |
| **MG / BYD Händler-Netzwerk** | direct | niedrig | unklar | irrelevant |

**Warum eher skip kurzfristig:**
- OEM-Programme verlangen meist **Mindesttraffic-Volumen** (50k+ Page-Views/Monat auf relevanter Page) → noch nicht gegeben
- Tesla-Referral ist nur Credits, kein Cash-Income
- Probefahrt-Affiliate ist ein **6-12-Monats-Ziel** wenn die Page nachweisbar Traffic generiert

**Empfehlung Ruslan:**
- **Tesla Referral Code** sofort einbinden (kostet nichts, gibt Tesla-Credit bei Buy)
- OEM-Direct-Deals erst nach 6 Monaten ansprechen wenn Page traffic-validated ist

---

### E) Wallbox-Förderung-Vergleich / E-Mobility-Spezialisten — **NICE-TO-HAVE**

| Programm | Wahrscheinlichkeit | Status |
|---|---|---|
| **EnBW mobility+** (Ladekarten) | mittel | recherchieren |
| **ADAC e-Charge** | niedrig | recherchieren |
| **Plugsurfing** | niedrig | skip (B2C-Sub-Markt) |
| **EWE Go** | niedrig | skip |

Ehrlich: Ladekarten-Affiliate ist ein **schwacher Markt** in DE. Skip vorerst.

---

### Priorität-Reihenfolge für Ruslan

1. **Top-Prio (diese Woche beantragen):**
   - AWIN: Auto-Leasing-Programme (Sixt+, LeasingMarkt, MeinAuto, VEHICULUM)
   - AWIN: Wallbox (go-e, Wallbox.com)
2. **Mid-Prio (nächste 2-3 Wochen):**
   - Tibber Affiliate (direct/AWIN)
   - Vattenfall Autostrom (AWIN)
3. **Low-Prio (3-6 Monate):**
   - Tesla Referral Code (sofort, aber low impact)
   - OEM-Direct-Deals (BMW/VW/Polestar) — erst wenn Page validiert ist

---

## Sektion 4 — Subid-Konvention

Subids sind **alphanumerisch only** (Check24-Constraint, max 50 Chars), CamelCase, **kein** Bindestrich (sonst bricht Check24-Tracking).

### Format

```
eautofoerderung<VERTICAL><SLOT>
```

| Vertical | Slot | Subid |
|---|---|---|
| Solaranlage | Primary (inline nach Result) | `eautofoerderungSolaranlageInline` |
| Solaranlage | Sidebar (falls Desktop-Sidebar) | `eautofoerderungSolaranlageSidebar` |
| KFZ | Secondary (unter SEO-Content) | `eautofoerderungKfzInline` |
| Strom | Tertiär | `eautofoerderungStromInline` |
| Kredit | Tertiär (conditional) | `eautofoerderungKreditInline` |
| Auto-Leasing | Primary (future, wenn dazukommt) | `eautofoerderungLeasingInline` |
| Wallbox | Tertiär (future) | `eautofoerderungWallboxInline` |

### Implementation

In `src/utils/affiliate.ts` existiert wahrscheinlich schon eine `getSubid(verticalKey, pagePath, slot)`-Helper-Funktion (analog wie auf anderen Pages). Die Logik bleibt unverändert — sie generiert automatisch `eautofoerderung` + `Solaranlage` + `Inline` aus den Inputs.

> **Action für rechner-architect:** wenn `getSubid()` aktuell hardgecodet Page-Path-Slug nutzt: prüfen, dass `/eauto-foerderung-rechner` → `eautofoerderung` als Page-Prefix abbildet (nicht `eautofoerderungrechner` oder ähnlich, sonst werden Subids > 50 Chars und brechen Check24).

---

## Sektion 5 — Revenue-Schätzung

### Annahmen

- **Page-Visits/Monat im Steady-State:** abhängig von SEO-Ranking — wir schätzen drei Szenarien:
  - **Conservative:** 2.000 Visits/Monat (kleines Long-Tail-Volumen, nicht in Top-3 SERP)
  - **Realistic:** 10.000 Visits/Monat (gutes Ranking, "e-auto förderung 2026" hat ~30k Suchvolumen/Monat in DE, plus Synonyme = realistic für eine Top-5-Position)
  - **Best-Case:** 30.000 Visits/Monat (Top-3 für "e-auto förderung", saisonale Spikes nach jeder Bundesregierungs-Pressekonferenz)

- **Banner-CTR (avg primary):** 5%
- **Banner-CTR (avg secondary):** 3%
- **Lead-Conversion-Rate (avg CPL):** 10%
- **Order-Conversion-Rate (avg CPO):** 3%

### Konkrete Schätzung pro Banner-Slot

| Slot | Vertical | Visits | CTR | Klicks | Conv-Rate | Leads/Orders | Provision | Revenue |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| **Conservative (2.000 Visits/Monat)** |
| Primary | Solaranlage (Tarifcheck 1690) | 2.000 | 5% | 100 | 10% (CPL) | 10 | 50€ | **500€** |
| Secondary | KFZ (Tarifcheck 1634) | 2.000 | 3% | 60 | 3% (CPO) | 1.8 | 70€ | **126€** |
| **Conservative Total** | | | | | | | | **~626 €/Monat** |
| **Realistic (10.000 Visits/Monat)** |
| Primary | Solaranlage | 10.000 | 5% | 500 | 10% | 50 | 50€ | **2.500€** |
| Secondary | KFZ | 10.000 | 3% | 300 | 3% | 9 | 70€ | **630€** |
| **Realistic Total** | | | | | | | | **~3.130 €/Monat** |
| **Best-Case (30.000 Visits/Monat)** |
| Primary | Solaranlage | 30.000 | 6% | 1.800 | 12% | 216 | 50€ | **10.800€** |
| Secondary | KFZ | 30.000 | 4% | 1.200 | 4% | 48 | 70€ | **3.360€** |
| **Best-Case Total** | | | | | | | | **~14.160 €/Monat** |

### RPM (Revenue/1000 Visits)

| Szenario | RPM |
|---|---|
| Conservative | **~313 €/1000** |
| Realistic | **~313 €/1000** *(scaling linear)* |
| Best-Case (höhere CTR + CR) | **~472 €/1000** |

> **Note:** RPM von 313 €/1000 ist **extrem hoch** im normalen Affiliate-Landschaft (Standard sind 5-50 €/1000). Das liegt am **Premium-Match Solaranlage 50€ CPL × hoher Lead-CR**. Wenn das nicht eintritt (CPL niedriger als angenommen oder Conv-Rate halbiert), bleiben immer noch **~100-150 €/1000** = **Top-Tier-Page-Performance**.

### Lift wenn Auto-Leasing-Programm dazu kommt (Sektion 3.A)

Wenn Ruslan Auto-Leasing-Programm (z.B. LeasingMarkt mit 80€ CPL) live hat und als **NEUES Primary** statt Solaranlage einsetzt:

- Auto-Leasing-Primary: 5% CTR × 8% CR × 80€ CPL = **32 €/1000 Klicks-Basis** *(direkter)*
- Solaranlage rutscht auf Secondary → +zusätzlich ~12 €/1000
- **Lift:** ca. **+40-60% RPM** auf Realistic-Szenario → **~5.000 €/Monat** statt **3.130 €/Monat**

### Annual-Projection

| Szenario | Jahres-Revenue (ohne Auto-Leasing-Lift) | Mit Auto-Leasing-Lift |
|---|---:|---:|
| Conservative | **~7.500 €/Jahr** | ~10.500 €/Jahr |
| Realistic | **~37.500 €/Jahr** | ~52.500 €/Jahr |
| Best-Case | **~170.000 €/Jahr** | ~240.000 €/Jahr |

### Kalibrierungs-Hinweise

- **CPL-Beträge sind Annahmen.** Tarifcheck-Solaranlage ist mit 50€ CPL geschätzt — exakter Wert steht im Tarifcheck-Dashboard und sollte vor Launch bestätigt werden. Falls nur 25-30€, alle Zahlen halbieren.
- **Conversion-Raten sind Branchen-Mittel.** Echte Werte hängen von Banner-Design, Card-Position, Microcopy ab — A/B-Testing lohnt sich.
- **Saisonalität:** E-Auto-Förder-Suche spiked nach Bundesregierungs-Beschlüssen. Wenn 2026er-Förderung Mitte/Ende des Jahres in Kraft tritt: erwartbarer 3-5x Traffic-Spike in Launch-Monat → **kurzfristiger Revenue-Boost** überproportional.

---

## Zusammenfassung — Action-Items für Ruslan

### Vor Launch der Page (zwingend)

1. **`solaranlage`-Vertical in `affiliates.ts` neu anlegen** (Tarifcheck `ad_id=1690`, CPL ~50€ stornofrei) — siehe Sektion 2
2. **`kfz`-Vertical auf Inhouse umstellen** (`ad_id=1634` statt AWIN-Fallback-URL) — Sektion 2
3. **`PAGE_AFFILIATES['/eauto-foerderung-rechner']`** = `{ primary: 'solaranlage', secondary: 'kfz' }` einfügen
4. **Microcopy-Hooks definieren:**
   - Primary-Hook: *"Mit eigener PV-Anlage Stromkosten halbieren — Tarife vergleichen"*
   - Secondary-Hook: *"E-Auto KFZ-Versicherung: bis 30% sparen — jetzt vergleichen"*
5. **Exakte CPL-Beträge bei Tarifcheck checken** (Solaranlage + KFZ) → in `provision.amount` eintragen

### Diese Woche (Affiliate-Anmeldungen)

6. **AWIN bewerben bei:** Sixt+, LeasingMarkt.de, VEHICULUM, MeinAuto.de, go-e, Wallbox.com, Tibber
7. **Tracking-Setup:** Subid-Konvention `eautofoerderung<Vertical><Slot>` durchtesten (Click → Subid sichtbar im Partner-Dashboard)

### Nach 4-6 Wochen post-Launch

8. **Performance-Daten reviewen:** CTR, CR, RPM pro Slot prüfen
9. **A/B-Test:** Auto-Leasing vs. Solaranlage als Primary (sobald Leasing-Programm aktiv)
10. **Tertiär-Cluster bauen** wenn Primary+Secondary performen (Strom + Kredit conditional)

### Langfristig (3-6 Monate)

11. **Tesla Referral Code** einbinden (low effort, low impact, aber kostenlos)
12. **OEM-Direct-Deals** ansprechen sobald Page traffic-validated ist (BMW, VW, Polestar)

---

**Ende des Affiliate-Plans.** Open Fragen → SendMessage an team-lead.
