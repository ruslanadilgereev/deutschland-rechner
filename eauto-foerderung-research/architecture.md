# E-Auto-Förder-Rechner — Architecture

**Autor:** `rechner-architect`
**Stand:** 2026-05-14
**Version:** **v2** — finalisiert nach Eingang von `policy.md`, `competitors.md`, `affiliate-plan.md`.

> **Was hat sich gegenüber v1 geändert?**
> Die v1 basierte auf einem Generic-Pattern (Listenpreis-Grenze, Privat/Gewerbe-Toggle, Wallbox als Hauptkomponente). `policy.md` hat gezeigt: die neue 2026er Förderung ist **einkommensabhängig** (zvE statt Listenpreis), **Gewerbe ist von der Kaufprämie ausgeschlossen** (statt eigene Stufe), und es gibt eine **Turbo-AfA 75 % Jahr 1** als separater Gewerbe-Pfad. Dazu PHEV-Sonderkriterien (CO₂ ≤ 60 g/km ODER ≥ 80 km E-Reichweite), 36-Monate-Haltedauer und Dienstwagen-Grenze bei 100k €. v2 baut den Rechner als **zwei-Pfad-System** (Privat / Gewerbe) mit konsequenter Modellierung der zvE-Klippe (80k → 0 €).

---

## Sektion 0: Architektur-Entscheidungen (lesen vor allem anderen)

1. **Zwei-Pfad-System statt einheitliches Form.** Der Switch `'privat' | 'gewerbe'` schaltet den **kompletten Inputs-Block** um. Privat-Pfad → 5 Inputs (BEV/PHEV / zvE / Kinder / Listenpreis / Haltedauer). Gewerbe-Pfad → 5 Inputs (BEV/PHEV / Listenpreis / Grenzsteuersatz / Dienstwagen-ja/nein / Wohnungstyp für Wallbox). Begründung: User-Mental-Models sind völlig verschieden, ein einheitliches Form ist Friction.
2. **zvE ist Pflicht-Input, Listenpreis ist optional.** Anders als v1 — die Förderung hängt am zvE, nicht am Listenpreis. Listenpreis dient nur der Eigenanteils-Berechnung und der 0,25 %-Dienstwagen-Logik.
3. **Live-Berechnung, kein Submit-Button** — wie alle anderen Rechner (`useMemo`).
4. **Komponenten-Aufschlüsselung im Result** (fixrechner.de-Pattern aus `competitors.md`): nicht eine Zahl, sondern Basis + Sozial + Kinder + Steuer + THG getrennt.
5. **80k-Klippe visuell prominent** — Slider mit visueller Threshold-Markierung bei 80.000 € (90.000 € mit 2 Kindern).
6. **PHEV-Kriterien sind eigener Sub-Pfad** (CO₂-Input ODER Reichweiten-Input erforderlich, nur Eines reicht).
7. **Solaranlage ist Primary-Affiliate** (nicht KFZ-Versicherung) — entschieden in `affiliate-plan.md`. KFZ-Versicherung wird Secondary.
8. **Slug:** `/eauto-foerderung-rechner` (ohne Bindestrich zwischen "e" und "auto") — Begründung in Sektion 7. Final-Slug stimmt mit `affiliate-plan.md` Subid-Konvention überein (`eautofoerderung*`).

---

## Sektion 1: Inputs

### 1.1 Pfad A — **Privat** (Standard-Use-Case)

Sichtbar wenn `nutzergruppe === 'privat'`.

| # | Feld | Typ | Default | UI | Validierung |
|---|---|---|---|---|---|
| P1 | `fahrzeugtyp` | `'bev' \| 'fcev' \| 'phev' \| 'reev'` | `'bev'` | 4-Button-Grid (BEV / FCEV / PHEV / REEV mit Emojis) | enum |
| P2 | `zvE` | `number` (€) | `55000` | Number-Input + Slider 0–150.000 € **mit visueller Markierung bei 80k und 90k** | clamp(0, 200_000) |
| P3 | `kinderUnter18` | `0 \| 1 \| 2` | `0` | 3-Button-Toggle | clamp(0, 2) — mehr ändert nichts |
| P4 | `listenpreis` | `number` (€) | `38000` | Number-Input + Slider 15.000–120.000 € — **gelabelt "optional: für Eigenanteils-Berechnung"** | clamp(15_000, 200_000) |
| P5 | `haltedauerJahre` | `number` | `10` | Button-Group (5 / 8 / 10 / 12 / 15 J) | enum |
| P6 | `bundesland` | `string` | `'keine'` | `<select>` | enum |

**PHEV-Sonderfeld (nur sichtbar wenn `fahrzeugtyp === 'phev' || === 'reev'`):**

| # | Feld | Typ | Default | UI | Hinweis |
|---|---|---|---|---|---|
| P7a | `phevCo2` | `number` (g/km) | `55` | Number-Input | "ODER-Verknüpfung mit Reichweite" |
| P7b | `phevReichweite` | `number` (km) | `85` | Number-Input | "min. 80 km für Förderfähigkeit" |

Förderfähig wenn `phevCo2 ≤ 60 || phevReichweite ≥ 80`. Beide Felder beide ausfüllen lassen — Logik nimmt das Bessere.

### 1.2 Pfad B — **Gewerbe / Selbstständig**

Sichtbar wenn `nutzergruppe === 'gewerbe'`. **Kaufprämie ist hier 0** — der Pfad rechnet die **Turbo-AfA** + Vorsteuer + Dienstwagen-Vorteil.

| # | Feld | Typ | Default | UI |
|---|---|---|---|---|
| G1 | `fahrzeugtyp` | `'bev' \| 'phev'` | `'bev'` | 2-Button-Toggle |
| G2 | `listenpreis` | `number` (€) | `55000` | Number-Input + Slider 20.000–150.000 € |
| G3 | `grenzsteuersatzPercent` | `number` (%) | `30` | Slider 15–50 % |
| G4 | `dienstwagenPrivat` | `boolean` | `true` | Toggle "Auch privat genutzt? (Dienstwagen)" |
| G5 | `wohnungstyp` | `'efh' \| 'mfh'` | `'efh'` | 2-Button — schaltet Wallbox-Förderung (nur MFH) |
| G6 | `wallboxKauf` | `boolean` | `false` | Checkbox |
| G7 | `wallboxBidirektional` | `boolean` | `false` | Nur sichtbar wenn `wallboxKauf` |
| G8 | `haltedauerJahre` | `number` | `6` | Button-Group |

### 1.3 Gemeinsame optionale Inputs (in Accordion `🔧 Mehr Details`)

| # | Feld | Default | Verwendung |
|---|---|---|---|
| O1 | `kmProJahr` | `15000` | Amortisations-Block, THG-Quote |
| O2 | `strompreis` | `0.35 €/kWh` | Energie-Kosten-Mini-Rechner |
| O3 | `thgVermarkterPreis` | `250 €/Jahr` | THG-Quote (Vermarkter-abhängig, 2026: 200–330 €) |

### 1.4 Validierungs-Regeln

- **zvE ≤ 0** → clamp(0). Berechnung läuft normal (= max. Förderung).
- **zvE > 200_000** → clamp(200_000). Förderung = 0 + Warning "über Einkommensgrenze".
- **kinderUnter18 > 2** → clamp(2). Hinweis "Bonus max. für 2 Kinder".
- **listenpreis < 15_000** → clamp(15_000) wegen Realitäts-Check.
- **PHEV ohne CO₂ und ohne Reichweite** → Warning "Bitte Wert eingeben um Förderfähigkeit zu prüfen".

---

## Sektion 2: Outputs

### 2.1 Privat-Result-Block (Hero, türkis-gradient)

**Card-Klasse:** `bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6`

```
Ihre BAFA-Förderung
4.500 €
3.000 € Basis + 1.000 € Sozial-Bonus + 500 € Kinder-Bonus
```

**Komponenten-Aufschlüsselung (3 Boxen im Result, `bg-white/10`):**

| Box | Wert | Beschreibung |
|---|---|---|
| Basis-Prämie | 3.000 € | für BEV, zvE 60–80k |
| Sozial-Bonus | +1.000 € | für zvE 45–60k |
| Kinder-Bonus | +500 € | 1 Kind × 500 € |

**Footer im Result (falls listenpreis > 0):**

```
Effektiver Kaufpreis: 33.500 € (Listenpreis 38.000 € − 4.500 € Prämie)
```

**Förderfähigkeits-Banner (oben im Result):**

- Grün: "Förderfähig — Antrag möglich ab Mai 2026"
- Gelb: "Wahrscheinlich nicht förderfähig — siehe Hinweise" (z.B. PHEV-Kriterien nicht erfüllt)
- Rot: "Nicht förderfähig: zvE liegt über 80.000 € (mit Kindern: 90.000 €)"

### 2.2 Gewerbe-Result-Block (alternative Hero)

```
Ihr Steuer-Vorteil als Selbstständiger
~19.000 € Liquiditätswirkung Jahr 1
Über 5 Jahre: ~28.000 €
```

**Komponenten-Aufschlüsselung:**

| Box | Wert |
|---|---|
| Turbo-AfA Jahr 1 (75 %) | +13.500 € Steuerersparnis |
| Vorsteuer-Abzug | +7.185 € Liquidität |
| Dienstwagen 0,25 % statt 1 % | ~1.700 €/Jahr netto privat |
| KFZ-Steuer-Befreiung (10 J) | +1.500 € gesamt |
| THG-Quote (5 J) | +1.250 € gesamt |

**Footer:** Hinweis-Box "Sie sind **nicht** für die BAFA-Kaufprämie berechtigt (nur Privatvermögen). Stattdessen profitieren Sie deutlich stärker über Turbo-AfA + Dienstwagen-Vorteil."

### 2.3 Detail-Boxen (unter Result + Affiliate)

1. **Förder-Stack-Tabelle** — alle Komponenten in einer Tabelle (für SEO + Backup ohne JS).
2. **Förderfähigkeits-Check** — 7 Bedingungen mit OK / nicht-OK:
   - zvE ≤ 80k (oder 90k mit 2 Kindern)
   - Fahrzeug Klasse M1
   - Neuwagen, Erstzulassung ab 01.01.2026
   - 36 Monate Mindesthaltedauer geplant
   - Privatperson + Privatvermögen
   - PHEV: CO₂ ≤ 60 g/km ODER Reichweite ≥ 80 km
   - Antrag innerhalb 12 Monaten nach Erstzulassung
3. **So beantragen Sie die Förderung** — 8 Schritte (aus `policy.md` Sektion 3.5), mit BAFA-Link.
4. **Bundesland-Sonderprogramme** — nur wenn `bundesland !== 'keine'`. NRW + BW haben aktuell Wallbox-Programme.
5. **Wichtige Warnhinweise:**
   - 80k-Klippe (1 € zvE Mehr = ggf. 3.000 € weniger Förderung)
   - 36-Monate-Haltedauer (Rückzahlung bei vorzeitigem Verkauf)
   - PHEV-Auslauf 30.06.2027
   - Topfgröße begrenzt (3 Mrd € für 800k Fahrzeuge) — "früh beantragen"
6. **Was passiert wenn Sie verkaufen?** — Mindesthaltedauer-Erklärung mit Beispielen.
7. **Amortisation gegen Verbrenner** (mit Inputs `kmProJahr`, `strompreis`).

---

## Sektion 3: Berechnungs-Formel

### 3.1 Konstanten-Datei (`src/utils/eautoFoerderung.ts`)

```ts
// ============================================================
// E-AUTO-FÖRDERUNG 2026 — Beträge gemäß BAFA / BMUKN
// Stand: 2026-05-14
// Quellen: siehe policy.md
// ============================================================

export const EAUTO_FOERDERUNG_2026 = {
  // === BAFA-Kaufprämie — nur Privatpersonen, Privatvermögen ===
  KAUFPRAEMIE: {
    bev_fcev: {
      // zvE-Stufen für BEV/FCEV
      stufe_1: { zveMax: 45_000, betrag: 5_000 },
      stufe_2: { zveMax: 60_000, betrag: 4_000 },
      stufe_3: { zveMax: 80_000, betrag: 3_000 },
      // > 80k: 0 (außer mit Kindern, +5k Grenze pro Kind, max 2)
    },
    phev_reev: {
      // PHEV halbiert: 2.500 / 2.000 / 1.500 €
      stufe_1: { zveMax: 45_000, betrag: 2_500 },
      stufe_2: { zveMax: 60_000, betrag: 2_000 },
      stufe_3: { zveMax: 80_000, betrag: 1_500 },
    },
    KINDER_BONUS_PRO_KIND: 500,
    KINDER_BONUS_MAX: 1_000, // max 2 Kinder × 500 €
    KINDER_BONUS_ZVE_GRENZE_PRO_KIND: 5_000, // zvE-Grenze erhöht sich um 5k pro Kind
    KINDER_BONUS_MAX_KINDER: 2,
  },

  // === PHEV-Sonderkriterien (ODER-Verknüpfung) ===
  PHEV_KRITERIEN: {
    CO2_MAX: 60,           // g/km WLTP
    REICHWEITE_MIN: 80,    // km elektrisch (EAER-City)
    AUSLAUF: new Date('2027-06-30'),
  },

  // === Programm-Meta ===
  PROGRAMM: {
    GUELTIG_AB: new Date('2026-01-01'),
    GUELTIG_BIS: new Date('2029-12-31'),
    BUDGET_GESAMT: 3_000_000_000, // 3 Mrd €
    FAHRZEUGE_GESAMT: 800_000,
    BAFA_PORTAL_AB: new Date('2026-05-01'),
    MINDESTHALTEDAUER_MONATE: 36,
    ANTRAGSFRIST_MONATE_NACH_EZ: 12,
    EINKOMMENSGRENZE_OHNE_KINDER: 80_000,
  },

  // === KFZ-Steuer-Befreiung (§ 3d KraftStG) ===
  KFZ_STEUER: {
    BEFREIUNG_BIS: new Date('2035-12-31'),
    BEFREIUNG_MAX_JAHRE: 10,
    EZ_FENSTER_BIS: new Date('2030-12-31'),
    NACH_BEFREIUNG_REDUKTION: 0.5, // 50 % reduziert nach Ablauf
    // Geldwerte Wirkung (Schätz-Mittelwert für vergleichbaren Verbrenner)
    AVG_KFZ_STEUER_VERBRENNER: 150, // €/Jahr
  },

  // === Dienstwagenbesteuerung ===
  DIENSTWAGEN: {
    SATZ_BEV_UNTER_GRENZE: 0.0025, // 0,25 %/Monat
    SATZ_BEV_UEBER_GRENZE: 0.005,  // 0,5 %/Monat
    SATZ_PHEV: 0.005,              // 0,5 %/Monat
    SATZ_VERBRENNER: 0.01,         // 1 %/Monat
    LISTENPREIS_GRENZE: 100_000,
    ANSCHAFFUNG_GUELTIG_VON: new Date('2025-07-01'),
    ANSCHAFFUNG_GUELTIG_BIS: new Date('2030-12-31'),
  },

  // === Turbo-AfA (§ 7 Abs. 2a EStG) — nur Gewerbe ===
  TURBO_AFA: {
    JAHR_1_PROZENT: 0.75,
    JAHR_2_PROZENT: 0.10,
    JAHR_3_PROZENT: 0.05,
    JAHR_4_PROZENT: 0.05,
    JAHR_5_PROZENT: 0.03,
    JAHR_6_PROZENT: 0.02,
    GUELTIG_VON: new Date('2025-07-01'),
    GUELTIG_BIS: new Date('2027-12-31'),
    KOMBINIERBAR_MIT_7G: false,
  },

  // === THG-Quote ===
  THG_QUOTE: {
    PREIS_2026_MIN: 200,
    PREIS_2026_MAX: 330,
    PREIS_DEFAULT: 250,
    GUELTIG_BIS: 2030, // mit geplanter Verlängerung bis 2040
    ANTRAGSFRIST_JAEHRLICH: '31.10.',
  },

  // === Wallbox-Förderung (KfW MFH, ab 15.04.2026) ===
  WALLBOX_KFW_MFH: {
    PROGRAMMSTART: new Date('2026-04-15'),
    NUR_MFH: true, // EFH nicht förderfähig
    VORVERKABELUNG_PRO_STELLPLATZ: 1_300,
    INSTALLIERT_PRO_STELLPLATZ: 1_500,
    BIDIREKTIONAL_PRO_STELLPLATZ: 2_000,
    BUDGET: 500_000_000,
  },

  // === Vorsteuer (Gewerbe) ===
  VORSTEUER: {
    MWST_SATZ: 0.19, // 19 %
  },
} as const;

// === Bundesländer-Sonderprogramme (Stand 2026-05-14) ===
// Quelle: policy.md Sektion 8.2
export const BL_SONDERPROGRAMME: Record<string, BLProgramm[]> = {
  'nw': [{ name: 'NRW Emissionsarme Mobilität', kategorie: 'wallbox', betragMax: 1500, quelle: 'https://www.elektromobilitaet.nrw/foerderung/' }],
  'bw': [{ name: 'Charge@BW', kategorie: 'wallbox', betragMax: 2500, quelle: 'https://emobil-sw.de/charge-bw/' }],
  'by': [], 'be': [], 'bb': [], 'hb': [], 'hh': [], 'he': [],
  'mv': [], 'ni': [], 'rp': [], 'sl': [], 'sn': [], 'st': [],
  'sh': [], 'th': [], 'keine': [],
};

export interface BLProgramm {
  name: string;
  kategorie: 'wallbox' | 'fahrzeug' | 'beratung';
  betragMax: number;
  quelle: string;
}
```

### 3.2 Privat-Berechnung

```ts
export interface PrivatInput {
  fahrzeugtyp: 'bev' | 'fcev' | 'phev' | 'reev';
  zvE: number;
  kinderUnter18: 0 | 1 | 2;
  listenpreis: number;
  haltedauerJahre: number;
  bundesland: string;
  phevCo2?: number;
  phevReichweite?: number;
  kmProJahr: number;
  strompreis: number;
  thgVermarkterPreis: number;
}

export interface PrivatOutput {
  // Förderfähigkeit
  foerderfaehig: boolean;
  ablehnungsGrund?: string;

  // Kaufprämie-Komponenten
  basisPraemie: number;
  sozialBonus: number;
  kinderBonus: number;
  kaufpraemieGesamt: number;

  // Steuer / sonstige
  kfzSteuerErsparnis: number;
  thgQuoteGesamt: number;

  // Aggregat
  gesamtFoerderung: number;
  effektiverKaufpreis: number;

  // Amortisation
  spritkostenProJahrVerbrenner: number;
  stromkostenProJahrEAuto: number;
  energieErsparnisProJahr: number;

  warnings: string[];
}

export function berechnePrivat(input: PrivatInput): PrivatOutput {
  const F = EAUTO_FOERDERUNG_2026;
  const warnings: string[] = [];

  // === 1. Förderfähigkeits-Check ===
  // Einkommensgrenze (80k base + 5k pro Kind, max 2)
  const zveGrenze =
    F.PROGRAMM.EINKOMMENSGRENZE_OHNE_KINDER +
    Math.min(input.kinderUnter18, F.KAUFPRAEMIE.KINDER_BONUS_MAX_KINDER) *
      F.KAUFPRAEMIE.KINDER_BONUS_ZVE_GRENZE_PRO_KIND;

  const ueberEinkommensGrenze = input.zvE > zveGrenze;

  // PHEV-Kriterien prüfen
  const istPhevTyp = input.fahrzeugtyp === 'phev' || input.fahrzeugtyp === 'reev';
  let phevKonform = true;
  if (istPhevTyp) {
    const co2OK = (input.phevCo2 ?? 999) <= F.PHEV_KRITERIEN.CO2_MAX;
    const reichweiteOK = (input.phevReichweite ?? 0) >= F.PHEV_KRITERIEN.REICHWEITE_MIN;
    phevKonform = co2OK || reichweiteOK;
    if (!phevKonform) {
      warnings.push(
        `PHEV-Kriterien nicht erfüllt: max. ${F.PHEV_KRITERIEN.CO2_MAX} g CO₂/km ODER min. ${F.PHEV_KRITERIEN.REICHWEITE_MIN} km elektrische Reichweite.`
      );
    }
  }

  // === 2. Kaufprämie berechnen ===
  let basisPraemie = 0;
  let sozialBonus = 0;
  let kinderBonus = 0;

  if (!ueberEinkommensGrenze && phevKonform) {
    const tabelle =
      input.fahrzeugtyp === 'bev' || input.fahrzeugtyp === 'fcev'
        ? F.KAUFPRAEMIE.bev_fcev
        : F.KAUFPRAEMIE.phev_reev;

    let stufenBetrag = 0;
    if (input.zvE <= tabelle.stufe_1.zveMax) {
      stufenBetrag = tabelle.stufe_1.betrag;
    } else if (input.zvE <= tabelle.stufe_2.zveMax) {
      stufenBetrag = tabelle.stufe_2.betrag;
    } else if (input.zvE <= tabelle.stufe_3.zveMax) {
      stufenBetrag = tabelle.stufe_3.betrag;
    }
    // Aufsplittung in Basis + Sozial-Bonus (für UI-Aufschlüsselung)
    basisPraemie = tabelle.stufe_3.betrag; // 3.000 (BEV) / 1.500 (PHEV)
    sozialBonus = stufenBetrag - basisPraemie;

    // Kinder-Bonus
    kinderBonus = Math.min(input.kinderUnter18, 2) * F.KAUFPRAEMIE.KINDER_BONUS_PRO_KIND;
  }

  if (ueberEinkommensGrenze) {
    warnings.push(
      `zvE ${input.zvE.toLocaleString('de-DE')} € liegt über der Einkommensgrenze von ${zveGrenze.toLocaleString('de-DE')} € — keine BAFA-Kaufprämie.`
    );
  }

  const kaufpraemieGesamt = basisPraemie + sozialBonus + kinderBonus;

  // === 3. KFZ-Steuer-Ersparnis (nur BEV/FCEV, nicht PHEV) ===
  const istBevTyp = input.fahrzeugtyp === 'bev' || input.fahrzeugtyp === 'fcev';
  const jahreInBefreiung = istBevTyp
    ? Math.min(input.haltedauerJahre, F.KFZ_STEUER.BEFREIUNG_MAX_JAHRE)
    : 0;
  const kfzSteuerErsparnis = jahreInBefreiung * F.KFZ_STEUER.AVG_KFZ_STEUER_VERBRENNER;

  // === 4. THG-Quote (nur BEV, nicht PHEV) ===
  const thgJahre = istBevTyp ? Math.min(input.haltedauerJahre, 5) : 0;
  const thgQuoteGesamt = thgJahre * input.thgVermarkterPreis;

  // === 5. Aggregat ===
  const gesamtFoerderung = kaufpraemieGesamt + kfzSteuerErsparnis + thgQuoteGesamt;
  const effektiverKaufpreis = Math.max(0, input.listenpreis - kaufpraemieGesamt);

  // === 6. Amortisation gegen Verbrenner ===
  const verbrauchEAuto = 18;        // kWh/100km
  const verbrauchVerbrenner = 7;    // l/100km
  const kraftstoffpreis = 1.7;      // €/l
  const stromkostenProJahrEAuto =
    (verbrauchEAuto / 100) * input.kmProJahr * input.strompreis;
  const spritkostenProJahrVerbrenner =
    (verbrauchVerbrenner / 100) * input.kmProJahr * kraftstoffpreis;
  const energieErsparnisProJahr =
    spritkostenProJahrVerbrenner - stromkostenProJahrEAuto;

  // === 7. Programm-Stichtag-Warnings ===
  if (new Date() > F.PROGRAMM.GUELTIG_BIS) {
    warnings.push('Förderprogramm ist bereits ausgelaufen (oder Topf leer).');
  }
  if (istPhevTyp && new Date() > F.PHEV_KRITERIEN.AUSLAUF) {
    warnings.push('PHEV-Förderung lief am 30.06.2027 aus.');
  }

  // === 8. 80k-Klippe-Hinweis ===
  if (input.zvE > zveGrenze - 2000 && input.zvE <= zveGrenze) {
    warnings.push(
      `Sie liegen nahe an der Einkommensgrenze (${zveGrenze.toLocaleString('de-DE')} €). 1 € Mehreinkommen kann die komplette Förderung kosten.`
    );
  }

  return {
    foerderfaehig: !ueberEinkommensGrenze && phevKonform,
    ablehnungsGrund: ueberEinkommensGrenze
      ? 'Einkommensgrenze überschritten'
      : !phevKonform
      ? 'PHEV-Kriterien nicht erfüllt'
      : undefined,
    basisPraemie,
    sozialBonus,
    kinderBonus,
    kaufpraemieGesamt,
    kfzSteuerErsparnis,
    thgQuoteGesamt,
    gesamtFoerderung,
    effektiverKaufpreis,
    spritkostenProJahrVerbrenner,
    stromkostenProJahrEAuto,
    energieErsparnisProJahr,
    warnings,
  };
}
```

### 3.3 Gewerbe-Berechnung

```ts
export interface GewerbeInput {
  fahrzeugtyp: 'bev' | 'phev';
  listenpreis: number;
  grenzsteuersatzPercent: number;
  dienstwagenPrivat: boolean;
  wohnungstyp: 'efh' | 'mfh';
  wallboxKauf: boolean;
  wallboxBidirektional: boolean;
  haltedauerJahre: number;
  kmProJahr: number;
  thgVermarkterPreis: number;
}

export interface GewerbeOutput {
  // Komponenten
  turboAfaJahr1Steuerersparnis: number;
  turboAfaUeber5Jahre: number;
  vorsteuerVorteil: number;
  dienstwagenVorteilProJahr: number;
  dienstwagenVorteil5Jahre: number;
  kfzSteuerErsparnis: number;
  thgQuoteGesamt: number;
  wallboxFoerderung: number;

  // Aggregat
  liquiditaetJahr1: number;
  gesamtVorteil5Jahre: number;

  warnings: string[];
}

export function berechneGewerbe(input: GewerbeInput): GewerbeOutput {
  const F = EAUTO_FOERDERUNG_2026;
  const warnings: string[] = [];

  // === 1. Turbo-AfA Jahr 1 ===
  const nettoListenpreis = input.listenpreis / (1 + F.VORSTEUER.MWST_SATZ);
  const afaBasisJahr1 = nettoListenpreis * F.TURBO_AFA.JAHR_1_PROZENT;
  const steuersatz = input.grenzsteuersatzPercent / 100;
  const turboAfaJahr1Steuerersparnis = afaBasisJahr1 * steuersatz;

  // 5-Jahres-Gesamt-AfA (vereinfacht: 75+10+5+5+3 = 98 % über 5 Jahre)
  const afaProzent5Jahre =
    F.TURBO_AFA.JAHR_1_PROZENT +
    F.TURBO_AFA.JAHR_2_PROZENT +
    F.TURBO_AFA.JAHR_3_PROZENT +
    F.TURBO_AFA.JAHR_4_PROZENT +
    F.TURBO_AFA.JAHR_5_PROZENT;
  const turboAfaUeber5Jahre = nettoListenpreis * afaProzent5Jahre * steuersatz;

  // === 2. Vorsteuer-Abzug ===
  const vorsteuerVorteil = input.listenpreis - nettoListenpreis;

  // === 3. Dienstwagen-Vorteil (privater Nutzungs-Anteil) ===
  let dienstwagenVorteilProJahr = 0;
  if (input.dienstwagenPrivat) {
    const satzEAuto =
      input.fahrzeugtyp === 'bev' && input.listenpreis <= F.DIENSTWAGEN.LISTENPREIS_GRENZE
        ? F.DIENSTWAGEN.SATZ_BEV_UNTER_GRENZE
        : input.fahrzeugtyp === 'bev'
        ? F.DIENSTWAGEN.SATZ_BEV_UEBER_GRENZE
        : F.DIENSTWAGEN.SATZ_PHEV;
    const satzVerbrennerVergleich = F.DIENSTWAGEN.SATZ_VERBRENNER;

    const gwvEAutoProMonat = input.listenpreis * satzEAuto;
    const gwvVerbrennerProMonat = input.listenpreis * satzVerbrennerVergleich;
    const ersparnisGwvProMonat = (gwvVerbrennerProMonat - gwvEAutoProMonat) * steuersatz;
    dienstwagenVorteilProJahr = ersparnisGwvProMonat * 12;

    if (input.listenpreis > F.DIENSTWAGEN.LISTENPREIS_GRENZE && input.fahrzeugtyp === 'bev') {
      warnings.push(
        `Listenpreis über ${F.DIENSTWAGEN.LISTENPREIS_GRENZE.toLocaleString('de-DE')} € — 0,5 % statt 0,25 %.`
      );
    }
  }
  const dienstwagenVorteil5Jahre = dienstwagenVorteilProJahr * Math.min(input.haltedauerJahre, 5);

  // === 4. KFZ-Steuer-Ersparnis (nur BEV) ===
  const istBev = input.fahrzeugtyp === 'bev';
  const jahreBefreit = istBev ? Math.min(input.haltedauerJahre, F.KFZ_STEUER.BEFREIUNG_MAX_JAHRE) : 0;
  const kfzSteuerErsparnis = jahreBefreit * F.KFZ_STEUER.AVG_KFZ_STEUER_VERBRENNER;

  // === 5. THG-Quote (nur BEV) ===
  const thgQuoteGesamt = istBev
    ? Math.min(input.haltedauerJahre, 5) * input.thgVermarkterPreis
    : 0;

  // === 6. Wallbox-Förderung (nur MFH) ===
  let wallboxFoerderung = 0;
  if (input.wallboxKauf && input.wohnungstyp === 'mfh') {
    wallboxFoerderung = input.wallboxBidirektional
      ? F.WALLBOX_KFW_MFH.BIDIREKTIONAL_PRO_STELLPLATZ
      : F.WALLBOX_KFW_MFH.INSTALLIERT_PRO_STELLPLATZ;
  } else if (input.wallboxKauf && input.wohnungstyp === 'efh') {
    warnings.push('EFH-Wallbox-Förderung bundesweit ausgelaufen. Nur regional NRW/BW.');
  }

  // === 7. Aggregat ===
  const liquiditaetJahr1 =
    turboAfaJahr1Steuerersparnis +
    vorsteuerVorteil +
    dienstwagenVorteilProJahr +
    F.KFZ_STEUER.AVG_KFZ_STEUER_VERBRENNER + // Jahr 1 KFZ-Steuer
    (istBev ? input.thgVermarkterPreis : 0) + // Jahr 1 THG
    wallboxFoerderung;

  const gesamtVorteil5Jahre =
    turboAfaUeber5Jahre +
    vorsteuerVorteil +
    dienstwagenVorteil5Jahre +
    kfzSteuerErsparnis +
    thgQuoteGesamt +
    wallboxFoerderung;

  return {
    turboAfaJahr1Steuerersparnis,
    turboAfaUeber5Jahre,
    vorsteuerVorteil,
    dienstwagenVorteilProJahr,
    dienstwagenVorteil5Jahre,
    kfzSteuerErsparnis,
    thgQuoteGesamt,
    wallboxFoerderung,
    liquiditaetJahr1,
    gesamtVorteil5Jahre,
    warnings,
  };
}
```

---

## Sektion 4: Edge Cases (nach policy.md-Integration)

| # | Szenario | Verhalten |
|---|---|---|
| E1 | zvE genau 80.000 € (keine Kinder) | Förderung **JA** (≤ ist inkl.) — Warning "nahe Klippe" |
| E2 | zvE 80.001 € | Förderung **0** — roter Banner "Nicht förderfähig" |
| E3 | zvE 89.999 € + 2 Kinder | Förderung **JA** (90k Grenze) — Stufe 3 (3.000 €) + Kinderbonus |
| E4 | zvE 70k + 2 Kinder | Förderung 3.000 € (Stufe 3) + 1.000 € Kinderbonus = 4.000 € BEV |
| E5 | zvE 30k + 2 Kinder + BEV | 5.000 € + 1.000 € = **6.000 € MAX** |
| E6 | PHEV ohne CO₂-Eingabe und ohne Reichweite-Eingabe | Warning "Werte fehlen", Default-Werte werden verwendet |
| E7 | PHEV mit CO₂ 100 g/km + Reichweite 100 km | Förderfähig (Reichweite OK, ODER-Verknüpfung) |
| E8 | PHEV mit CO₂ 50 g/km + Reichweite 50 km | Förderfähig (CO₂ OK) |
| E9 | PHEV nach 30.06.2027 | Warning "PHEV-Auslauf erreicht" |
| E10 | Privat-Selbstständiger | Hinweis "Wechseln Sie auf Pfad Gewerbe — dort sind Sie deutlich besser gestellt" |
| E11 | Gewerbe mit Listenpreis > 100k + BEV | Dienstwagen-Satz 0,5 % statt 0,25 % — Warning |
| E12 | Gewerbe mit Anschaffung > 31.12.2027 | Turbo-AfA-Programm endet — Warning |
| E13 | Wallbox-Kauf + EFH | "EFH-Wallbox bundesweit nicht förderfähig" — falls Bundesland NRW/BW: Hinweis aufs Landesprogramm |
| E14 | Listenpreis = 0 | Eigenanteils-Berechnung wird ausgeblendet, nur Förderbeträge gezeigt |
| E15 | Haltedauer < 3 Jahre | Roter Warning "Förderung muss zurückgezahlt werden, wenn Sie das Fahrzeug vor 36 Monaten verkaufen" |
| E16 | Leasing mit 24 Monaten Laufzeit | Roter Warning (aus `policy.md` 11.8) |
| E17 | Heutiges Datum < 01.05.2026 | Banner "BAFA-Antragsportal startet voraussichtlich Mai 2026" |
| E18 | Heutiges Datum > GUELTIG_BIS (2029) | Roter Banner "Programm ausgelaufen — Informationen historisch" |

---

## Sektion 5: UX-Flow

### 5.1 Page-Reihenfolge (oben → unten)

```
1.  RechnerFeedback-Header
2.  TRUST-CLUSTER (Pattern fixrechner.de, competitors.md Pattern 4):
    • "Stand: 14.05.2026 — Antragsportal voraussichtlich ab Mai 2026"
    • "Keine Speicherung Ihrer Eingaben"
    • BAFA-/BMUKN-Quellen-Link
3.  PFADAUSWAHL (Privat / Gewerbe Toggle, prominent ganz oben)
4a. PRIVAT-INPUTS (Card #1):
    Fahrzeugtyp (4-Button) — zvE-Slider (mit 80k/90k Markierung) — Kinder (3-Button)
    Listenpreis (optional, "?"-Tooltip) — Haltedauer — Bundesland
    PHEV-Sonderfeld (conditional)
4b. GEWERBE-INPUTS (Card #1, alternativ):
    Fahrzeugtyp (2-Button) — Listenpreis — Grenzsteuersatz
    Dienstwagen privat? — Wohnungstyp — Wallbox (mit MFH-Hinweis) — Haltedauer
5.  RESULT-BLOCK (türkis-gradient, Komponenten-Aufschlüsselung)
6.  AFFILIATE-CARD #1 PRIMARY: Solaranlage 1690 (gemäß affiliate-plan.md)
    "Mit eigener PV-Anlage Stromkosten halbieren"
7.  FÖRDERFÄHIGKEITS-CHECK (7-Punkt-Liste)
8.  ANTRAGS-GUIDE (8-Schritte aus policy.md 3.5)
9.  AMORTISATION GEGEN VERBRENNER (live-Rechner)
10. AFFILIATE-CARD #2 SECONDARY: KFZ-Versicherung 1634
    "E-Auto KFZ-Versicherung: bis 30 % sparen"
11. ERWEITERTE OPTIONEN (Accordion: km/Jahr, Strompreis, THG-Preis)
12. WARNHINWEISE (80k-Klippe, 36 Monate, Topf-Limit, PHEV-Auslauf)
13. BUNDESLAND-SONDERPROGRAMME (conditional)
14. VERWANDTE RECHNER (.astro-Page: photovoltaik / elektroauto / kfz-steuer / firmenwagen)
15. SEO-CONTENT-BLOCK (von content-writer, content.md)
16. FAQ (10–15 Fragen aus content-writer)
17. Quellen (BAFA, BMUKN, Bundesregierung, ADAC)
```

### 5.2 Slider vs. Input vs. Button — Regeln

| Feld | Input + Slider | Nur Input | Nur Slider | Button-Group |
|---|:---:|:---:|:---:|:---:|
| Fahrzeugtyp (Privat) | | | | 4-Button |
| Fahrzeugtyp (Gewerbe) | | | | 2-Button |
| zvE | mit Threshold-Markierung | | | |
| Kinder | | | | 3-Button |
| Listenpreis | OK | | | |
| Haltedauer | | | | OK |
| Bundesland | | `<select>` | | |
| PHEV-CO₂ | OK | | | |
| PHEV-Reichweite | OK | | | |
| Grenzsteuersatz | OK | | | |
| Wohnungstyp | | | | 2-Button |
| km/Jahr | OK | | | |
| Strompreis | OK | | | |

### 5.3 zvE-Slider: visuelle Threshold-Markierung

Pattern (Tailwind):

```tsx
<div className="relative">
  <input
    type="range"
    value={zvE}
    onChange={...}
    min={0}
    max={150000}
    step={500}
    className="w-full accent-teal-500"
  />
  {/* 80k-Marker */}
  <div
    className="absolute top-0 h-full w-px bg-red-500"
    style={{ left: `${(80000 / 150000) * 100}%` }}
  >
    <span className="absolute -top-6 -translate-x-1/2 text-xs text-red-600 font-medium whitespace-nowrap">
      80k Klippe
    </span>
  </div>
  {/* 90k-Marker (mit 2 Kindern) */}
  <div
    className="absolute top-0 h-full w-px bg-amber-500"
    style={{ left: `${(90000 / 150000) * 100}%` }}
  >
    <span className="absolute -top-6 -translate-x-1/2 text-xs text-amber-600 font-medium">
      90k (mit Kindern)
    </span>
  </div>
</div>
```

### 5.4 Live-Berechnung

`useMemo`-Recompute auf jeden Input-Change. Geschätzte Rechen-Zeit < 1 ms (alle O(1)-Operationen).

### 5.5 Mobile/Desktop

- Result-Block: `text-5xl` Hero-Zahl bleibt auch Mobile groß
- Komponenten-Boxen: Desktop `grid-cols-3`, Mobile `grid-cols-1`
- Sticky-Rechner (competitors.md Pattern 3): **erst Phase 2**, nicht initial. Begründung: Astro-Hydration + Sticky braucht ScrollListener — overkill für Launch.

### 5.6 Affiliate-Position (gemäß `affiliate-plan.md`)

- **Primary (Solaranlage 1690):** **direkt nach Result-Block** — Pattern wie `KfzSteuerRechner.tsx:363–383`
- **Secondary (KFZ 1634):** nach Amortisations-Block (Schritt 10 oben)
- **Tertiär (Strom Check24, Kredit 1664):** Skip initial (lean Launch, gemäß affiliate-plan.md Option 1)

---

## Sektion 6: Component-Struktur

### 6.1 Datei-Tree

```
src/
├── components/
│   └── rechner/
│       ├── EautoFoerderungRechner.tsx              ← React-Island, schaltet zwischen Pfaden
│       ├── EautoFoerderungRechnerPrivat.tsx        ← Sub-Component Privat-Pfad
│       └── EautoFoerderungRechnerGewerbe.tsx       ← Sub-Component Gewerbe-Pfad
├── pages/
│   └── eauto-foerderung-rechner.astro              ← Page-Wrapper
├── utils/
│   └── eautoFoerderung.ts                          ← Konstanten + berechnePrivat() + berechneGewerbe()
└── data/
    └── affiliates.ts                               ← solaranlage-Vertical neu anlegen
                                                     kfz-Vertical auf Inhouse 1634 umstellen
                                                     PAGE_AFFILIATES['/eauto-foerderung-rechner']
```

### 6.2 `EautoFoerderungRechner.tsx` — Switch-Skelett

```tsx
import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';
import EautoFoerderungRechnerPrivat from './EautoFoerderungRechnerPrivat';
import EautoFoerderungRechnerGewerbe from './EautoFoerderungRechnerGewerbe';

export default function EautoFoerderungRechner() {
  const [nutzergruppe, setNutzergruppe] = useState<'privat' | 'gewerbe'>('privat');

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="E-Auto-Förder-Rechner 2026" rechnerSlug="eauto-foerderung-rechner" />

      {/* Pfad-Switch */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <p className="text-sm text-gray-600 mb-2">Wie möchten Sie das Fahrzeug erwerben?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setNutzergruppe('privat')}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              nutzergruppe === 'privat'
                ? 'bg-teal-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Privat
          </button>
          <button
            onClick={() => setNutzergruppe('gewerbe')}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              nutzergruppe === 'gewerbe'
                ? 'bg-teal-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Gewerbe / Selbstständig
          </button>
        </div>
      </div>

      {nutzergruppe === 'privat' ? (
        <EautoFoerderungRechnerPrivat />
      ) : (
        <EautoFoerderungRechnerGewerbe />
      )}
    </div>
  );
}
```

### 6.3 `affiliates.ts` Anpassungen (gemäß affiliate-plan.md)

```ts
// Neue Vertical: Solaranlage
solaranlage: {
  key: 'solaranlage',
  label: 'Solaranlage / Photovoltaik',
  shortLabel: 'Solar',
  provider: 'tarifcheck',
  tarifcheck: { adId: 1690, deep: 'solaranlage' },
  provision: { model: 'CPL', amount: 50, stornofrei: true },
},

// kfz auf Inhouse umstellen
kfz: {
  // ...
  tarifcheck: { adId: 1634, deep: 'kfz-versicherung' },
  provision: { model: 'CPO', amount: 70 },
},

// Page-Mapping
PAGE_AFFILIATES: {
  '/eauto-foerderung-rechner': { primary: 'solaranlage', secondary: 'kfz' },
}
```

### 6.4 `eauto-foerderung-rechner.astro` — Page-Wrapper

```astro
---
import Layout from '../layouts/Layout.astro';
import EautoFoerderungRechner from '../components/rechner/EautoFoerderungRechner';
import BreadcrumbSchema from '../components/BreadcrumbSchema.astro';

const title = "E-Auto-Förderung 2026 Rechner – BAFA-Kaufprämie bis 6.000 € berechnen";
const description = "E-Auto-Förderung 2026 Rechner: Einkommensabhängige BAFA-Prämie 1.500–6.000 €, KFZ-Steuer bis 2035, THG-Quote, Wallbox-Förderung, Turbo-AfA. In 30 Sekunden zum Förderbetrag.";
const keywords = "E-Auto Förderung 2026, BAFA Kaufprämie 2026, Elektroauto Förderung Einkommen, Kaufprämie Rechner zvE, Wallbox Förderung MFH 2026, Turbo-AfA E-Auto, Dienstwagen E-Auto 100k, THG-Quote 2026, BAFA Antrag E-Auto, Kinderbonus Elektroauto";
---

<Layout title={title} description={description} keywords={keywords}>
  <BreadcrumbSchema items={[{ name: "E-Auto-Förderung 2026 Rechner", url: "/eauto-foerderung-rechner" }]} />
  <main class="min-h-screen pb-8">
    <header class="bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-6 px-4">
      <div class="max-w-2xl mx-auto">
        <a href="/" class="inline-flex items-center gap-2 text-teal-100 hover:text-white mb-4">
          ← Alle Rechner
        </a>
        <div class="flex items-center gap-3">
          <span class="text-4xl">💰</span>
          <div>
            <h1 class="text-2xl font-bold">E-Auto-Förderung 2026</h1>
            <p class="text-teal-100 text-sm">BAFA-Kaufprämie 1.500–6.000 € + Steuer + Wallbox</p>
          </div>
        </div>
      </div>
    </header>
    <div class="max-w-2xl mx-auto px-4 py-6">
      <EautoFoerderungRechner client:load />
    </div>
    <!-- SEO-Content + FAQ aus content.md -->
    <!-- WebApplication + FAQPage JSON-LD -->
  </main>
</Layout>
```

---

## Sektion 7: SEO-Slug-Entscheidung

### Finale Entscheidung: **`/eauto-foerderung-rechner`** (ohne Bindestrich zwischen "e" und "auto")

**Begründung (verfeinert gegenüber v1):**

1. **Konsistenz mit Affiliate-Subid-Konvention.** `affiliate-plan.md` verwendet `eautofoerderung*Inline` als Subid-Prefix. Slug `/e-auto-foerderung-rechner` (mit Bindestrich) würde via `generateSubid()` (`src/utils/affiliate.ts`) zu `eautofoerderungSolaranlageInline` (gleicher Output, weil `[-_]/g` ersetzt wird) — funktioniert beides. **Aber:** `/eauto-foerderung-rechner` ist kürzer + matcht direkt das Subid-Prefix → leichteres Tracking-Debugging.
2. **`competitors.md`** zeigt: Wettbewerber nutzen Mix (`/e-auto-foerderung-rechner` bei drohnen.de, `/elektroauto-foerderung-rechner` bei fixrechner.de, `/e-auto-praemie` bei elektroquatsch). Kein klares SEO-Signal pro Variante.
3. **Suchvolumen-Check (geschätzt):** "e-auto förderung 2026" + "eauto förderung 2026" haben ähnliches Volumen. Beide Schreibweisen ranken auf der gleichen Page.
4. **Differenzierung zu `/elektroauto-rechner`** (= Kosten-Rechner): voll gegeben durch das Wort "förderung".
5. **Kurze URL** ist für Mobile-Sharing besser.

**Title (final):** `E-Auto-Förderung 2026 Rechner – BAFA-Kaufprämie bis 6.000 € berechnen`

**Description (final):** `E-Auto-Förderung 2026 Rechner: Einkommensabhängige BAFA-Prämie 1.500–6.000 €, KFZ-Steuer bis 2035, THG-Quote, Wallbox-Förderung, Turbo-AfA. In 30 Sekunden zum Förderbetrag.`

> Final-Title-Optimierung übernimmt `content-writer`. Empfehlung: "BAFA" + "2026" + "6.000 €" prominent.

---

## Sektion 8: Open Questions (post v2)

Die meisten Fragen aus v1 sind durch `policy.md` beantwortet. Was bleibt offen:

### An `policy-researcher` (Nice-to-Have)

1. **Genaue Bundesländer-Liste (Beträge)** für NRW Emissionsarme Mobilität + Charge@BW — exakte Beträge in BL_SONDERPROGRAMME.
2. **AVG_KFZ_STEUER_VERBRENNER** — der Default 150 € ist Mittelwert. Soll je Fahrzeugklasse differenziert werden (Kompakt / SUV)? → Nice-to-Have, nicht blocking.

### An `competitor-spy`

Bereits geliefert. Patterns integriert (Komponenten-Aufschlüsselung, 80k-Klippe-Visualisierung, Trust-Cluster, Sticky → Phase 2).

### An `affiliate-strategist`

Bereits geliefert. Solaranlage + KFZ Primary/Secondary, Auto-Leasing als Phase-2-Lift identifiziert.

### An `content-writer` (BLOCKING für Final-Launch)

1. **FAQ-Block (10–15 Fragen)** — Quellen-Mix aus BMUKN-FAQ + autobild + ace.
2. **SEO-Content-Block** unter dem Rechner (Erklärtexte für jede Förderkomponente).
3. **Microcopy für Affiliate-Cards** (Primary: Solaranlage-Hook, Secondary: KFZ-Hook).
4. **Anti-Confusion-Erklärung:** "zvE ist nicht Brutto". Beispiel-Tabelle Brutto → zvE.
5. **80k-Klippe-Erklärung:** Beispiel "80.000 vs 80.001 € zvE".
6. **Mindesthaltedauer 36 Monate** — Warning-Text + Beispiel.

### An `team-lead`

1. **Phase 2 Roadmap-Confirmation:** Wann sollen Sticky-Rechner, Tertiär-Affiliate-Cluster, Eigenanteils-Visualisierung priorisiert werden?
2. **AdSense-Resubmit:** Page-Launch passt in den AdSense-Resubmit-Plan (siehe letzten Commit `bda66c8f`) — bestätigen.

---

## Sektion 9: Was wir NICHT bauen (Out of Scope)

- BAFA-API-Anbindung (keine öffentliche API)
- PDF-Export
- Login / gespeicherte Berechnungen
- Auto-Modell-Suche (z.B. "Tesla Model 3 SR+")
- Live-Strompreis-API
- Sticky-Rechner (Phase 2)
- Tertiär-Affiliate-Cluster Strom + Kredit (Phase 2, A/B-Test wenn Primary+Secondary laufen)
- Auto-Leasing-Vertical (Phase 2, sobald AWIN-Programm angenommen)
- Tesla-Referral-Code (Phase 2, low priority)

---

## Sektion 10: Implementation-Checklist

### Phase 1 — Launch-Ready

- [ ] `src/utils/eautoFoerderung.ts` mit `EAUTO_FOERDERUNG_2026` + `BL_SONDERPROGRAMME` + `berechnePrivat()` + `berechneGewerbe()`
- [ ] `src/data/affiliates.ts`:
  - [ ] Neuer Vertical `solaranlage` (Tarifcheck 1690)
  - [ ] `kfz` auf Inhouse 1634 umstellen
  - [ ] `PAGE_AFFILIATES['/eauto-foerderung-rechner'] = { primary: 'solaranlage', secondary: 'kfz' }`
- [ ] `src/components/rechner/EautoFoerderungRechner.tsx` (Switch)
- [ ] `src/components/rechner/EautoFoerderungRechnerPrivat.tsx`
- [ ] `src/components/rechner/EautoFoerderungRechnerGewerbe.tsx`
- [ ] `src/pages/eauto-foerderung-rechner.astro` (SEO + JSON-LD)
- [ ] Affiliate-Banner einbauen (Position 1: direkt nach Result, Position 2: nach Amortisation)
- [ ] Content aus `content.md` (FAQ, SEO-Block, Microcopy)
- [ ] Cross-Linking: photovoltaik / elektroauto / kfz-steuer / firmenwagen
- [ ] In `src/pages/index.astro` Card auf Homepage
- [ ] Sitemap.xml-Generator-Lauf
- [ ] Manual-Test 8 Szenarien:
  1. Privat BEV, zvE 30k, 2 Kinder → 6.000 €
  2. Privat BEV, zvE 79k, 0 Kinder → 3.000 €
  3. Privat BEV, zvE 81k, 0 Kinder → 0 € (rote Banner)
  4. Privat BEV, zvE 89k, 2 Kinder → 3.000 € (förderfähig dank Kinder-Grenze)
  5. Privat PHEV mit CO₂ 50 + Reichweite 50 → förderfähig (CO₂ OK)
  6. Privat PHEV mit CO₂ 70 + Reichweite 70 → nicht förderfähig (beide knapp drüber)
  7. Gewerbe BEV 60k → ~13.500 € Steuerersparnis Jahr 1
  8. Gewerbe BEV 110k → Dienstwagen 0,5 % Warning
- [ ] Lighthouse + Mobile-Layout-Check
- [ ] WebApplication + FAQPage JSON-LD

### Phase 2 — Post-Launch (4–6 Wochen)

- [ ] Sticky-Rechner Pattern
- [ ] Tertiär-Affiliate-Cluster (Strom + Kredit conditional)
- [ ] Eigenanteils-Visualisierung als prominenter Output
- [ ] A/B-Test Solaranlage vs. Auto-Leasing als Primary (sobald Leasing-Programm angenommen)
- [ ] OEM-Direct-Deals (BMW / VW / Polestar)
- [ ] Tesla Referral Code

---

**Ende Architecture v2.** Alle drei Schwester-Dokumente (`policy.md`, `competitors.md`, `affiliate-plan.md`) sind eingearbeitet. Dev kann starten, sobald `content-writer` `content.md` (FAQ + Microcopy) liefert.
