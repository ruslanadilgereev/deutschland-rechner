// E-Auto-Förderung 2026 — Konstanten + Berechnungs-Logic
// Quelle: BAFA-Richtlinie 2026, §3d KraftStG, §6/§7 EStG, §37a BImSchG, KfW-Richtlinie 442
// Stand: Mai 2026

export const EAUTO_FOERDERUNG_2026 = {
  // BAFA-Kaufprämie (nur Privat)
  kaufpraemie: {
    bev: {
      tier1: { zvEMax: 45_000, betrag: 5_000 },
      tier2: { zvEMax: 60_000, betrag: 4_000 },
      tier3: { zvEMax: 80_000, betrag: 3_000 },
    },
    phev: {
      tier1: { zvEMax: 45_000, betrag: 2_500 },
      tier2: { zvEMax: 60_000, betrag: 2_000 },
      tier3: { zvEMax: 80_000, betrag: 1_500 },
    },
    kinderBonusProKind: 500, // max 2 Kinder
    maxKinder: 2,
    zvEGrenzeMitKindern: 90_000,
    haltedauerMonate: 36,
    phevAuslauf: '2027-06-30',
    portalStart: '2026-05-15',
  },

  // KFZ-Steuer (§3d KraftStG)
  kfzSteuerBefreiung: {
    jahreFrei: 10,
    durchschnittsErsparnisProJahr: 150, // bei typischem E-Auto 1500-2500kg
    gilticBis: '2035-12-31',
    erstzulassungBis: '2030-12-31',
  },

  // THG-Quote 2026
  thgQuote: {
    minProJahr: 200,
    maxProJahr: 330,
    schaetzwertProJahr: 250,
  },

  // Dienstwagen-Regelung (§6 Abs.1 Nr.4 EStG)
  dienstwagen: {
    bevSatz: 0.0025, // 0,25%
    phevSatz: 0.005, // 0,5%
    verbrennerSatz: 0.01, // 1,0%
    blpGrenze: 100_000, // bis 100k bleibt 0,25% bei BEV
  },

  // Turbo-AfA Jahr 1 (§7 Abs.2a EStG, nur Gewerbe)
  turboAfa: {
    jahr1Anteil: 0.75, // 75% im Jahr 1
    durchschnittlSteuersatzGewerbe: 0.30,
    erstzulassungBis: '2027-12-31',
  },

  // Wallbox-Förderung 2026
  wallbox: {
    mfhVorverkabelung: 1_300,
    mfhStandard: 1_500,
    mfhBidirektional: 2_000,
    nrwMax: 1_500,
    bwMax: 2_500,
  },
} as const;

// ─── Typen ────────────────────────────────────────────────────────────

export type Fahrzeugtyp = 'bev' | 'phev';
export type Nutzungsart = 'privat' | 'gewerbe';
export type Wohnungstyp = 'efh' | 'mfh' | 'mieter';
export type Bundesland = 'nrw' | 'bw' | 'sonstige';

export interface EautoInput {
  fahrzeugtyp: Fahrzeugtyp;
  zvE: number;
  kinder: 0 | 1 | 2;
  nutzungsart: Nutzungsart;
  listenpreis: number; // BLP für Dienstwagen + Vorsteuer
  wohnungstyp?: Wohnungstyp;
  bundesland?: Bundesland;
  istDienstwagen?: boolean;
  grenzsteuersatz?: number; // 0-0.45
  jahresfahrleistungKm?: number;
}

export interface EautoErgebnis {
  kaufpraemie: number;
  kaufpraemieDetail: {
    basisBetrag: number;
    kinderBonus: number;
    tier: string;
    foerderfaehig: boolean;
    klippeWarnung: string | null;
  };
  kfzSteuerErsparnis: number; // 10 Jahre Total
  kfzSteuerProJahr: number;
  thgQuoteFuenfJahre: number;
  thgProJahr: number;
  dienstwagenVorteilProJahr: number;
  turboAfaJahr1: number;
  wallboxFoerderung: number;
  gesamtFoerderpaket: number;
  effektiverKaufpreis: number;
  spritersparnisProJahr: number; // E-Auto vs Verbrenner
  spritersparnis10Jahre: number;
}

// ─── Berechnungs-Logic ────────────────────────────────────────────────

function berechneKaufpraemie(input: EautoInput): EautoErgebnis['kaufpraemieDetail'] & { betrag: number } {
  const { fahrzeugtyp, zvE, kinder, nutzungsart } = input;
  const config = EAUTO_FOERDERUNG_2026.kaufpraemie;

  // Gewerbe ausgeschlossen
  if (nutzungsart === 'gewerbe') {
    return {
      betrag: 0,
      basisBetrag: 0,
      kinderBonus: 0,
      tier: 'Gewerbe',
      foerderfaehig: false,
      klippeWarnung: 'Gewerbliche Halter sind von der BAFA-Kaufprämie ausgeschlossen. Stattdessen lohnt sich die Turbo-AfA (§7 Abs.2a EStG) mit 75% Abschreibung im ersten Jahr.',
    };
  }

  // Einkommensgrenze: 80k ohne Kinder, 90k mit 2 Kindern
  const effGrenze = 80_000 + Math.min(kinder, 2) * 5_000;
  if (zvE > effGrenze) {
    return {
      betrag: 0,
      basisBetrag: 0,
      kinderBonus: 0,
      tier: 'über Einkommensgrenze',
      foerderfaehig: false,
      klippeWarnung: `Mit ${kinder} Kindern liegt die Förder-Obergrenze bei ${effGrenze.toLocaleString('de-DE')}€ zvE. Ihr Einkommen liegt darüber — keine BAFA-Kaufprämie. Steuervorteile (KFZ-Steuer, THG-Quote) gelten weiterhin.`,
    };
  }

  // Tier-Lookup
  const tabelle = fahrzeugtyp === 'bev' ? config.bev : config.phev;
  let basisBetrag = 0;
  let tier = '';
  if (zvE <= tabelle.tier1.zvEMax) {
    basisBetrag = tabelle.tier1.betrag;
    tier = `bis ${tabelle.tier1.zvEMax.toLocaleString('de-DE')}€ zvE`;
  } else if (zvE <= tabelle.tier2.zvEMax) {
    basisBetrag = tabelle.tier2.betrag;
    tier = `${tabelle.tier1.zvEMax + 1}–${tabelle.tier2.zvEMax.toLocaleString('de-DE')}€ zvE`;
  } else {
    basisBetrag = tabelle.tier3.betrag;
    tier = `${tabelle.tier2.zvEMax + 1}–${tabelle.tier3.zvEMax.toLocaleString('de-DE')}€ zvE`;
  }

  const kinderBonus = Math.min(kinder, config.maxKinder) * config.kinderBonusProKind;
  const betrag = basisBetrag + kinderBonus;

  // Klippe-Warnung wenn nah an Grenze
  let klippeWarnung: string | null = null;
  if (zvE >= effGrenze - 2_000 && zvE <= effGrenze) {
    klippeWarnung = `Knapp unter der ${effGrenze.toLocaleString('de-DE')}€-Klippe — bei höherem Einkommen fällt die Kaufprämie komplett auf 0€.`;
  } else if (zvE >= tabelle.tier1.zvEMax - 2_000 && zvE <= tabelle.tier1.zvEMax) {
    klippeWarnung = `Knapp unter der ${tabelle.tier1.zvEMax.toLocaleString('de-DE')}€-Tier-Grenze — bei höherem Einkommen sinkt die Prämie um 1.000€.`;
  }

  return { betrag, basisBetrag, kinderBonus, tier, foerderfaehig: true, klippeWarnung };
}

function berechneKfzSteuer(input: EautoInput) {
  const { fahrzeugtyp } = input;
  if (fahrzeugtyp !== 'bev') return { jahre10: 0, proJahr: 0 };
  const proJahr = EAUTO_FOERDERUNG_2026.kfzSteuerBefreiung.durchschnittsErsparnisProJahr;
  return { jahre10: proJahr * 10, proJahr };
}

function berechneThgQuote(input: EautoInput) {
  if (input.fahrzeugtyp !== 'bev') return { fuenfJahre: 0, proJahr: 0 };
  const proJahr = EAUTO_FOERDERUNG_2026.thgQuote.schaetzwertProJahr;
  return { fuenfJahre: proJahr * 5, proJahr };
}

function berechneDienstwagenVorteil(input: EautoInput): number {
  if (!input.istDienstwagen || input.nutzungsart !== 'gewerbe') return 0;
  const { listenpreis, fahrzeugtyp, grenzsteuersatz = 0.35 } = input;
  const cfg = EAUTO_FOERDERUNG_2026.dienstwagen;
  const eautoSatz = fahrzeugtyp === 'bev' && listenpreis <= cfg.blpGrenze ? cfg.bevSatz : cfg.phevSatz;
  const eautoGwVorteil = listenpreis * eautoSatz * 12;
  const verbrennerGwVorteil = listenpreis * cfg.verbrennerSatz * 12;
  const ersparnisGw = verbrennerGwVorteil - eautoGwVorteil;
  return Math.round(ersparnisGw * grenzsteuersatz); // jährliche Netto-Ersparnis
}

function berechneTurboAfa(input: EautoInput): number {
  if (input.nutzungsart !== 'gewerbe') return 0;
  const cfg = EAUTO_FOERDERUNG_2026.turboAfa;
  return Math.round(input.listenpreis * cfg.jahr1Anteil * cfg.durchschnittlSteuersatzGewerbe);
}

function berechneWallbox(input: EautoInput): number {
  const { wohnungstyp, bundesland } = input;
  if (wohnungstyp === 'mfh') return EAUTO_FOERDERUNG_2026.wallbox.mfhStandard;
  if (bundesland === 'nrw') return EAUTO_FOERDERUNG_2026.wallbox.nrwMax;
  if (bundesland === 'bw') return EAUTO_FOERDERUNG_2026.wallbox.bwMax;
  return 0;
}

function berechneSpritersparnis(input: EautoInput) {
  const km = input.jahresfahrleistungKm ?? 13_500;
  // Vereinfacht: E-Auto ~6€/100km, Verbrenner ~11€/100km → 5€/100km Ersparnis
  const proJahr = Math.round((km / 100) * 5);
  return { proJahr, jahre10: proJahr * 10 };
}

export function berechneFoerderung(input: EautoInput): EautoErgebnis {
  const kp = berechneKaufpraemie(input);
  const kfz = berechneKfzSteuer(input);
  const thg = berechneThgQuote(input);
  const dienstwagen = berechneDienstwagenVorteil(input);
  const turboAfa = berechneTurboAfa(input);
  const wallbox = berechneWallbox(input);
  const sprit = berechneSpritersparnis(input);

  const gesamtFoerderpaket = kp.betrag + kfz.jahre10 + thg.fuenfJahre + dienstwagen + turboAfa + wallbox;
  const effektiverKaufpreis = Math.max(0, input.listenpreis - kp.betrag - turboAfa);

  return {
    kaufpraemie: kp.betrag,
    kaufpraemieDetail: {
      basisBetrag: kp.basisBetrag,
      kinderBonus: kp.kinderBonus,
      tier: kp.tier,
      foerderfaehig: kp.foerderfaehig,
      klippeWarnung: kp.klippeWarnung,
    },
    kfzSteuerErsparnis: kfz.jahre10,
    kfzSteuerProJahr: kfz.proJahr,
    thgQuoteFuenfJahre: thg.fuenfJahre,
    thgProJahr: thg.proJahr,
    dienstwagenVorteilProJahr: dienstwagen,
    turboAfaJahr1: turboAfa,
    wallboxFoerderung: wallbox,
    gesamtFoerderpaket,
    effektiverKaufpreis,
    spritersparnisProJahr: sprit.proJahr,
    spritersparnis10Jahre: sprit.jahre10,
  };
}
