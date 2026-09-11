import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===
// Lohnsteuer: BMF-Programmablaufplan 2026 (Klasse Lohnsteuer2026, identisch mit Brutto-Netto-Rechner dieser Seite).
// Sozialversicherung 2026: RV 9,3 %, AV 1,3 %, KV 7,3 % + halber Zusatzbeitrag (Ø 2,9 %), PV 1,8 % (+0,6 kinderlos, −0,25 je Kind ab 2.),
// BBG RV/AV 101.400 €, KV/PV 69.750 € (Sozialversicherungs-Rechengrößenverordnung 2026).
// Kindergeld 2026: 259 € je Kind (§ 66 EStG / § 6 BKGG).
// Kinderzuschlag (§ 6a BKGG, Merkblatt Familienkasse Stand Juli 2026): Höchstbetrag 297 €, Mindestbrutto 900 € Paare / 600 € Alleinerziehende,
// Elternbedarf = Regelbedarf Eltern + Elternanteil an den Wohnkosten (Tabelle 12. Existenzminimumbericht), Erwerbseinkommen über dem
// Elternbedarf mindert den Gesamtkinderzuschlag zu 45 %; Anspruch nur, wenn mit Wohngeld + KiZ keine Hilfebedürftigkeit besteht
// (erweiterter Zugang: höchstens 100 € Lücke bei Erwerbstätigenfreibetrag ≥ 100 €, Abs. 1a).
// Grundsicherung/Bürgergeld (SGB II): Regelbedarfe 2026 (Nullrunde) 563 / 506 / 471 / 390 / 357 €; Mehrbedarf Alleinerziehende
// § 21 Abs. 3 (36 % bzw. 12 % je Kind, max. 60 %); Erwerbstätigenfreibeträge § 11b Abs. 2/3: 100 € + 20 % (100–520) + 30 % (520–1.000)
// + 10 % (1.000–1.200, mit minderjährigem Kind 1.500).
// Wohngeld (WoGG, Fassung BGBl. 2024 I Nr. 314, gültig 2025/2026): § 16 Pauschalabzug je 10 % für Steuern, KV/PV, RV; § 17 Nr. 3
// Alleinerziehendenfreibetrag 1.320 €/Jahr; Werbungskostenpauschale 1.230 €; § 12 Höchstbeträge Anlage 1 + Heizkosten (Abs. 6) +
// Klimakomponente (Abs. 7); § 19 Formel 1,15 · (M − (a + b·M + c·Y) · Y) mit Anlage 2 (2025) und Mindestwerten Anlage 3; § 21 mind. 10 €.
// Kindergeld und Kinderzuschlag zählen beim Wohngeld nicht als Einkommen (§ 14 Abs. 2 WoGG).

const KINDERGELD = 259;
const KIZ_MAX = 297;
const KIZ_MINDESTBRUTTO = { paar: 900, allein: 600 };
// Elternanteil an den Wohnkosten in % (Merkblatt Kinderzuschlag, Tabelle nach Kinderzahl 1–5)
const KIZ_WOHNANTEIL = { allein: [77, 63, 53, 46, 40], paar: [83, 71, 62, 55, 50] };
const REGELBEDARF = { allein: 563, paarJe: 506, kind14: 471, kind6: 390, kind0: 357 };

const WOGG_HOECHST: Record<string, number[]> = {
  I: [361, 437, 521, 608, 694], II: [408, 493, 587, 686, 782], III: [456, 551, 657, 766, 875], IV: [511, 619, 737, 858, 982],
  V: [562, 680, 809, 946, 1080], VI: [615, 745, 887, 1035, 1183], VII: [677, 820, 975, 1139, 1302],
};
const WOGG_MEHR: Record<string, number> = { I: 82, II: 94, III: 106, IV: 119, V: 129, VI: 149, VII: 163 };
const WOGG_HEIZ = [110.40, 142.60, 170.20, 197.80, 225.40]; const WOGG_HEIZ_MEHR = 27.60;
const WOGG_KLIMA = [19.20, 24.80, 29.60, 34.40, 39.20]; const WOGG_KLIMA_MEHR = 4.80;
const WOGG_ABC = [
  { a: 4.000e-2, b: 4.797e-4, c: 4.080e-5 }, { a: 3.000e-2, b: 3.571e-4, c: 3.040e-5 }, { a: 2.000e-2, b: 2.917e-4, c: 2.450e-5 },
  { a: 1.000e-2, b: 2.163e-4, c: 1.760e-5 }, { a: 0, b: 1.907e-4, c: 1.720e-5 }, { a: -1.000e-2, b: 1.722e-4, c: 1.660e-5 },
  { a: -2.000e-2, b: 1.592e-4, c: 1.650e-5 }, { a: -3.000e-2, b: 1.583e-4, c: 1.650e-5 }, { a: -4.000e-2, b: 1.376e-4, c: 1.660e-5 },
  { a: -6.000e-2, b: 1.249e-4, c: 1.660e-5 }, { a: -9.000e-2, b: 1.141e-4, c: 1.960e-5 }, { a: -1.200e-1, b: 1.107e-4, c: 2.210e-5 },
];
const WOGG_MIN_M = [54, 67, 79, 92, 103, 103, 115, 128, 140, 152, 187, 298];
const WOGG_MIN_Y = [396, 679, 906, 1132, 1358, 1585, 1811, 2037, 2264, 2490, 2717, 2943];
const WOGG_WERBUNGSKOSTEN = 1230;
const WOGG_ALLEINERZIEHEND = 1320;

const PAP_2026 = {
  BBGRVALV: 101400,
  BBGKVPV: 69750,
  RVSATZAN: 0.093,
  AVSATZAN: 0.013,
  PVSATZAN_BASIS: 0.018,
  PVSATZAN_SACHSEN: 0.023,
  PVSATZAN_KINDERLOS: 0.006,
  PVSATZAN_KINDABSCHLAG: 0.0025,
  // Ermäßigter Beitragssatz § 243 SGB V (14,0 %) / 2 – so schreibt es
  // § 39b Abs. 2 S. 5 Nr. 3 Buchst. b EStG für die Vorsorgepauschale vor.
  // NICHT der allgemeine Satz nach § 241 SGB V (14,6 % → 0,073), der nur
  // für den tatsächlichen SV-Abzug gilt.
  KVSATZAN_BASIS: 0.07,
  GFB: 12348,
  ZONE2_KOEFF1: 914.51,
  ZONE2_KOEFF2: 1400,
  ZONE3_KOEFF1: 173.10,
  ZONE3_KOEFF2: 2397,
  ZONE3_KONST: 1034.87,
  ZONE4_SATZ: 0.42,
  ZONE4_ABZUG: 11135.63,
  ZONE5_SATZ: 0.45,
  ZONE5_ABZUG: 19470.38,
  W1STKL5: 14071,
  W2STKL5: 34939,
  W3STKL5: 222260,
  ANP_MAX: 1230,
  SAP: 36,
  EFA: 4260,
  KFB_VOLL: 9756,
  KFB_HALB: 4878,
  VSPHB_MAX: 1900,
  SOLZFREI: 20350,
  SOLZ_SATZ: 0.055,
  SOLZ_MILDERUNG: 0.119,
};

// ============================================================================
// PAP 2026 KLASSE - EXAKTE IMPLEMENTIERUNG (vereinfacht für reguläre Löhne)
// ============================================================================

class Lohnsteuer2026 {
  private STKL: number;
  private RE4: number;
  private KRV: number;
  private PKV: number;
  private KVZ: number;
  private PVZ: number;
  private PVS: number;
  private PVA: number;
  private ZKF: number;
  private R: number;
  private ALV: number = 0;
  private PKPV: number = 0;

  private ZRE4J: number = 0;
  private ZRE4: number = 0;
  private ZRE4VP: number = 0;
  private ZVBEZJ: number = 0;
  private ZVBEZ: number = 0;
  private FVB: number = 0;
  private FVBZ: number = 0;
  private ALTE: number = 0;
  private JLFREIB: number = 0;
  private JLHINZU: number = 0;
  private KZTAB: number = 1;
  private ANP: number = 0;
  private SAP: number = 0;
  private EFA: number = 0;
  private KFB: number = 0;
  private ZTABFB: number = 0;
  private VSP: number = 0;
  private VSPR: number = 0;
  private VSPKVPV: number = 0;
  private VSPALV: number = 0;
  private VSPHB: number = 0;
  private VSPN: number = 0;
  private ZVE: number = 0;
  private X: number = 0;
  private ST: number = 0;
  private LSTJAHR: number = 0;
  private JBMG: number = 0;
  private SOLZJ: number = 0;
  private BK: number = 0;
  private KVSATZAN: number = 0;
  private PVSATZAN: number = 0;

  public LSTLZZ: number = 0;
  public SOLZLZZ: number = 0;

  constructor(params: {
    stkl: number;
    bruttoJahr: number;
    kvZusatzbeitrag: number;
    kinderlos: boolean;
    sachsen?: boolean;
    anzahlKinder?: number;
    rvPflichtig?: boolean;
    avPflichtig?: boolean;
    gkv?: boolean;
    kirchensteuer?: boolean;
    zkf?: number;
  }) {
    this.STKL = params.stkl;
    this.RE4 = Math.round(params.bruttoJahr * 100);
    this.KRV = params.rvPflichtig === false ? 1 : 0;
    this.ALV = params.avPflichtig === false ? 1 : 0;
    this.PKV = params.gkv === false ? 1 : 0;
    this.KVZ = params.kvZusatzbeitrag;
    this.PVZ = params.kinderlos ? 1 : 0;
    this.PVS = params.sachsen ? 1 : 0;
    this.PVA = Math.min(4, Math.max(0, (params.anzahlKinder || 0) - 1));
    this.ZKF = params.zkf || 0;
    this.R = params.kirchensteuer ? 1 : 0;
  }

  public berechne(): { lstJahr: number; solzJahr: number; bkJahr: number } {
    this.MPARA();
    this.MRE4JL();
    this.MRE4ABZ();
    this.MBERECH();
    return {
      lstJahr: Math.floor(this.LSTLZZ / 100),
      solzJahr: Math.floor(this.SOLZLZZ / 100),
      bkJahr: Math.floor(this.BK / 100),
    };
  }

  private MPARA(): void {
    this.KVSATZAN = this.KVZ / 2 / 100 + PAP_2026.KVSATZAN_BASIS;
    this.PVSATZAN = this.PVS === 1 ? PAP_2026.PVSATZAN_SACHSEN : PAP_2026.PVSATZAN_BASIS;
    if (this.PVZ === 1) {
      this.PVSATZAN += PAP_2026.PVSATZAN_KINDERLOS;
    } else {
      this.PVSATZAN -= this.PVA * PAP_2026.PVSATZAN_KINDABSCHLAG;
    }
  }

  private MRE4JL(): void {
    this.ZRE4J = Math.floor((this.RE4 / 100) * 100) / 100;
    this.ZVBEZJ = 0;
    this.JLFREIB = 0;
    this.JLHINZU = 0;
  }

  private MRE4ABZ(): void {
    this.ZRE4 = Math.floor((this.ZRE4J - this.FVB - this.ALTE - this.JLFREIB + this.JLHINZU) * 100) / 100;
    if (this.ZRE4 < 0) this.ZRE4 = 0;
    this.ZRE4VP = this.ZRE4J;
    this.ZVBEZ = Math.floor((this.ZVBEZJ - this.FVB) * 100) / 100;
    if (this.ZVBEZ < 0) this.ZVBEZ = 0;
  }

  private MBERECH(): void {
    this.MZTABFB();
    this.MLSTJAHR();
    this.LSTJAHR = Math.floor(this.ST);
    this.UPLSTLZZ();
    if (this.ZKF > 0) {
      this.ZTABFB += this.KFB;
      this.MRE4ABZ();
      this.MLSTJAHR();
      this.JBMG = Math.floor(this.ST);
    } else {
      this.JBMG = this.LSTJAHR;
    }
    this.MSOLZ();
  }

  private MZTABFB(): void {
    this.ANP = 0;
    this.EFA = 0;
    if (this.STKL < 6) {
      if (this.ZRE4 > this.ZVBEZ) {
        const diff = this.ZRE4 - this.ZVBEZ;
        this.ANP = diff < PAP_2026.ANP_MAX ? Math.ceil(diff) : PAP_2026.ANP_MAX;
      }
    }
    this.KZTAB = 1;
    this.SAP = 0;
    this.KFB = 0;
    switch (this.STKL) {
      case 1:
        this.SAP = PAP_2026.SAP;
        this.KFB = Math.floor(this.ZKF * PAP_2026.KFB_VOLL);
        break;
      case 2:
        this.EFA = PAP_2026.EFA;
        this.SAP = PAP_2026.SAP;
        this.KFB = Math.floor(this.ZKF * PAP_2026.KFB_VOLL);
        break;
      case 3:
        this.KZTAB = 2;
        this.SAP = PAP_2026.SAP;
        this.KFB = Math.floor(this.ZKF * PAP_2026.KFB_VOLL);
        break;
      case 4:
        this.SAP = PAP_2026.SAP;
        this.KFB = Math.floor(this.ZKF * PAP_2026.KFB_HALB);
        break;
      case 5:
        this.SAP = PAP_2026.SAP;
        this.KFB = 0;
        break;
      case 6:
        this.KFB = 0;
        break;
    }
    this.ZTABFB = Math.floor((this.EFA + this.ANP + this.SAP + this.FVBZ) * 100) / 100;
  }

  private MLSTJAHR(): void {
    this.UPEVP();
    this.ZVE = this.ZRE4 - this.ZTABFB - this.VSP;
    this.UPMLST();
  }

  private UPMLST(): void {
    if (this.ZVE < 1) {
      this.ZVE = 0;
      this.X = 0;
    } else {
      this.X = Math.floor(this.ZVE / this.KZTAB);
    }
    if (this.STKL < 5) {
      this.UPTAB26();
    } else {
      this.MST5_6();
    }
  }

  private UPEVP(): void {
    if (this.KRV === 1) {
      this.VSPR = 0;
    } else {
      const zre4vpr = Math.min(this.ZRE4VP, PAP_2026.BBGRVALV);
      this.VSPR = Math.floor(zre4vpr * PAP_2026.RVSATZAN * 100) / 100;
    }
    this.MVSPKVPV();
    if (this.ALV !== 1 && this.STKL !== 6) {
      this.MVSPHB();
    }
  }

  private MVSPKVPV(): void {
    const zre4vpr = Math.min(this.ZRE4VP, PAP_2026.BBGKVPV);
    if (this.PKV > 0) {
      this.VSPKVPV = this.STKL === 6 ? 0 : Math.floor((this.PKPV * 12) / 100 * 100) / 100;
    } else {
      this.VSPKVPV = Math.floor(zre4vpr * (this.KVSATZAN + this.PVSATZAN) * 100) / 100;
    }
    this.VSP = Math.ceil(this.VSPKVPV + this.VSPR);
  }

  private MVSPHB(): void {
    const zre4vpr = Math.min(this.ZRE4VP, PAP_2026.BBGRVALV);
    this.VSPALV = Math.floor(PAP_2026.AVSATZAN * zre4vpr * 100) / 100;
    this.VSPHB = Math.floor((this.VSPALV + this.VSPKVPV) * 100) / 100;
    if (this.VSPHB > PAP_2026.VSPHB_MAX) this.VSPHB = PAP_2026.VSPHB_MAX;
    this.VSPN = Math.ceil(this.VSPR + this.VSPHB);
    if (this.VSPN > this.VSP) this.VSP = this.VSPN;
  }

  private MST5_6(): void {
    const zzx = this.X;
    if (zzx > PAP_2026.W2STKL5) {
      this.UP5_6(PAP_2026.W2STKL5);
      if (zzx > PAP_2026.W3STKL5) {
        this.ST = Math.floor(this.ST + (PAP_2026.W3STKL5 - PAP_2026.W2STKL5) * 0.42);
        this.ST = Math.floor(this.ST + (zzx - PAP_2026.W3STKL5) * 0.45);
      } else {
        this.ST = Math.floor(this.ST + (zzx - PAP_2026.W2STKL5) * 0.42);
      }
    } else {
      this.UP5_6(zzx);
      if (zzx > PAP_2026.W1STKL5) {
        const vergl = this.ST;
        this.UP5_6(PAP_2026.W1STKL5);
        const hoch = Math.floor(this.ST + (zzx - PAP_2026.W1STKL5) * 0.42);
        this.ST = Math.min(hoch, vergl);
      }
    }
  }

  private UP5_6(zx: number): void {
    this.X = Math.floor(zx * 1.25);
    this.UPTAB26();
    const st1 = this.ST;
    this.X = Math.floor(zx * 0.75);
    this.UPTAB26();
    const st2 = this.ST;
    const diff = (st1 - st2) * 2;
    const mist = Math.floor(zx * 0.14);
    this.ST = Math.max(diff, mist);
  }

  private UPTAB26(): void {
    const { GFB, ZONE2_KOEFF1, ZONE2_KOEFF2, ZONE3_KOEFF1, ZONE3_KOEFF2, ZONE3_KONST,
            ZONE4_SATZ, ZONE4_ABZUG, ZONE5_SATZ, ZONE5_ABZUG } = PAP_2026;
    if (this.X < GFB + 1) {
      this.ST = 0;
    } else if (this.X < 17800) {
      const y = Math.floor((this.X - GFB) / 10000 * 1000000) / 1000000;
      let rw = y * ZONE2_KOEFF1;
      rw = rw + ZONE2_KOEFF2;
      this.ST = Math.floor(rw * y);
    } else if (this.X < 69879) {
      const y = Math.floor((this.X - 17799) / 10000 * 1000000) / 1000000;
      let rw = y * ZONE3_KOEFF1;
      rw = rw + ZONE3_KOEFF2;
      rw = rw * y;
      this.ST = Math.floor(rw + ZONE3_KONST);
    } else if (this.X < 277826) {
      this.ST = Math.floor(this.X * ZONE4_SATZ - ZONE4_ABZUG);
    } else {
      this.ST = Math.floor(this.X * ZONE5_SATZ - ZONE5_ABZUG);
    }
    this.ST = this.ST * this.KZTAB;
  }

  private UPLSTLZZ(): void {
    this.LSTLZZ = this.LSTJAHR * 100;
  }

  private MSOLZ(): void {
    const solzfrei = PAP_2026.SOLZFREI * this.KZTAB;
    if (this.JBMG > solzfrei) {
      this.SOLZJ = Math.floor(this.JBMG * PAP_2026.SOLZ_SATZ * 100) / 100;
      const solzmin = Math.floor((this.JBMG - solzfrei) * PAP_2026.SOLZ_MILDERUNG * 100) / 100;
      if (solzmin < this.SOLZJ) this.SOLZJ = solzmin;
      this.SOLZLZZ = Math.floor(this.SOLZJ * 100);
    } else {
      this.SOLZLZZ = 0;
    }
    this.BK = this.R > 0 ? this.JBMG * 100 : 0;
  }
}
const SOZIALVERSICHERUNG_2026 = {
  rentenversicherung: 0.093,
  arbeitslosenversicherung: 0.013,
  pflegeversicherung: {
    basis: 0.018,
    kinderlosZuschlag: 0.006,
    kindAbschlag: 0.0025,
  },
  krankenversicherung: {
    basis: 0.073,
  },
};

const BBG_2026 = {
  renteArbeitslos: 101400,
  krankenPflege: 69750,
};


const KV_ZUSATZ = 2.9;

function nettoMonat(bruttoMonat: number, stkl: number, kinder: number): number {
  if (bruttoMonat <= 0) return 0;
  const bruttoJahr = bruttoMonat * 12;
  const kinderlos = kinder === 0;
  const rvBrutto = Math.min(bruttoJahr, BBG_2026.renteArbeitslos);
  const kvBrutto = Math.min(bruttoJahr, BBG_2026.krankenPflege);
  let pvSatz = SOZIALVERSICHERUNG_2026.pflegeversicherung.basis;
  if (kinderlos) pvSatz += SOZIALVERSICHERUNG_2026.pflegeversicherung.kinderlosZuschlag;
  else if (kinder > 1) pvSatz -= Math.min(4, kinder - 1) * SOZIALVERSICHERUNG_2026.pflegeversicherung.kindAbschlag;
  const sv = rvBrutto * (SOZIALVERSICHERUNG_2026.rentenversicherung + SOZIALVERSICHERUNG_2026.arbeitslosenversicherung)
    + kvBrutto * (pvSatz + SOZIALVERSICHERUNG_2026.krankenversicherung.basis + KV_ZUSATZ / 100 / 2);
  const pap = new Lohnsteuer2026({ stkl, bruttoJahr, kvZusatzbeitrag: KV_ZUSATZ, kinderlos, anzahlKinder: kinder, zkf: stkl <= 4 ? kinder : 0 });
  const st = pap.berechne();
  return (bruttoJahr - sv - st.lstJahr - st.solzJahr) / 12;
}

// § 11b Abs. 2 und 3 SGB II: Grundfreibetrag 100 € + 20 % / 30 % / 10 %
function freibetrag11b(bruttoMonat: number, mitKind: boolean): number {
  if (bruttoMonat <= 0) return 0;
  const cap = mitKind ? 1500 : 1200;
  let f = Math.min(100, bruttoMonat);
  f += 0.2 * Math.max(0, Math.min(bruttoMonat, 520) - 100);
  f += 0.3 * Math.max(0, Math.min(bruttoMonat, 1000) - 520);
  f += 0.1 * Math.max(0, Math.min(bruttoMonat, cap) - 1000);
  return f;
}

// Wohngeld nach § 19 WoGG mit Anlagen 1–3 (Fassung 2025)
function wohngeld(bruttos: number[], personen: number, mietstufe: string, warmmiete: number, alleinerziehend: boolean): number {
  const n = Math.min(12, Math.max(1, personen));
  let jahresEinkommen = 0;
  for (const b of bruttos) if (b > 0) jahresEinkommen += Math.max(0, b * 12 - WOGG_WERBUNGSKOSTEN) * 0.7; // § 16: 3 × 10 %
  if (alleinerziehend) jahresEinkommen -= WOGG_ALLEINERZIEHEND;
  let Y = Math.max(0, jahresEinkommen) / 12;
  const idx = Math.min(4, n - 1);
  const hoechst = (n <= 5 ? WOGG_HOECHST[mietstufe][idx] : WOGG_HOECHST[mietstufe][4] + (n - 5) * WOGG_MEHR[mietstufe])
    + (n <= 5 ? WOGG_HEIZ[idx] : WOGG_HEIZ[4] + (n - 5) * WOGG_HEIZ_MEHR)
    + (n <= 5 ? WOGG_KLIMA[idx] : WOGG_KLIMA[4] + (n - 5) * WOGG_KLIMA_MEHR);
  let M = Math.min(warmmiete, hoechst);
  M = Math.max(M, WOGG_MIN_M[n - 1]);
  Y = Math.max(Y, WOGG_MIN_Y[n - 1]);
  const { a, b, c } = WOGG_ABC[n - 1];
  const z4 = 1.15 * (M - (a + b * M + c * Y) * Y);
  let wg = Math.round(z4);
  wg = Math.min(wg, Math.round(M));
  return wg < 10 ? 0 : wg;
}

interface Haushalt { paar: boolean; stklA: number; bruttoB: number; k0: number; k6: number; k14: number; warmmiete: number; mietstufe: string; kita: number }

function rechne(bruttoA: number, h: Haushalt) {
  const kinder = h.k0 + h.k6 + h.k14;
  const allein = !h.paar;
  const stklA = allein ? (kinder > 0 ? 2 : 1) : h.stklA;
  const stklB = h.paar ? 8 - h.stklA : 1;
  const nettoA = nettoMonat(bruttoA, stklA, kinder);
  const nettoB = h.paar ? nettoMonat(h.bruttoB, stklB, kinder) : 0;
  const netto = nettoA + nettoB;
  const kindergeld = kinder * KINDERGELD;
  const personen = (h.paar ? 2 : 1) + kinder;
  const bruttoGesamt = bruttoA + (h.paar ? h.bruttoB : 0);

  // Bedarf nach SGB II
  const regelEltern = allein ? REGELBEDARF.allein : REGELBEDARF.paarJe * 2;
  let mehrbedarf = 0;
  if (allein && kinder > 0) {
    const s1 = (h.k0 > 0 || (kinder >= 2 && kinder <= 3 && h.k14 === 0)) ? 0.36 : 0; // Kind unter 7 bzw. 2–3 Kinder unter 16 (vereinfacht über Altersgruppen)
    const s2 = Math.min(0.6, 0.12 * kinder);
    mehrbedarf = REGELBEDARF.allein * Math.max(s1, s2);
  }
  const regelKinder = h.k0 * REGELBEDARF.kind0 + h.k6 * REGELBEDARF.kind6 + h.k14 * REGELBEDARF.kind14;
  const bedarf = regelEltern + mehrbedarf + regelKinder + h.warmmiete;

  // Bereinigtes Einkommen (SGB II / KiZ): Netto minus Erwerbstätigenfreibetrag
  const freiA = freibetrag11b(bruttoA, kinder > 0);
  const freiB = h.paar ? freibetrag11b(h.bruttoB, kinder > 0) : 0;
  const bereinigt = Math.max(0, nettoA - freiA) + Math.max(0, nettoB - freiB);

  // Wohngeld
  const wg = wohngeld(h.paar ? [bruttoA, h.bruttoB] : [bruttoA], personen, h.mietstufe, h.warmmiete, allein && kinder > 0);

  // Kinderzuschlag § 6a BKGG
  let kiz = 0;
  let kizGrund = '';
  if (kinder > 0) {
    const mindest = allein ? KIZ_MINDESTBRUTTO.allein : KIZ_MINDESTBRUTTO.paar;
    if (bruttoGesamt < mindest) { kizGrund = 'Mindesteinkommen von ' + mindest + ' € brutto nicht erreicht'; }
    else {
      const anteil = (allein ? KIZ_WOHNANTEIL.allein : KIZ_WOHNANTEIL.paar)[Math.min(5, kinder) - 1] / 100;
      const elternbedarf = regelEltern + mehrbedarf + h.warmmiete * anteil;
      const ueberschuss = Math.max(0, bereinigt - elternbedarf);
      kiz = Math.max(0, kinder * KIZ_MAX - 0.45 * ueberschuss);
      const gesamt = bereinigt + kindergeld + wg + kiz;
      if (gesamt < bedarf) {
        if (bedarf - gesamt <= 100 && freiA + freiB >= 100) kizGrund = 'erweiterter Zugang (Lücke ≤ 100 €)';
        else { kiz = 0; kizGrund = 'Bedarf auch mit Wohngeld und KiZ nicht gedeckt'; }
      } else if (kiz === 0) kizGrund = 'Elterneinkommen zu hoch (45 %-Anrechnung)';
    }
  }

  // Grundsicherung (Bürgergeld) als Alternative, wenn Wohngeld + KiZ nicht reichen
  let wgFinal = wg, kizFinal = kiz, buergergeld = 0;
  const mitWgKiz = bereinigt + kindergeld + wg + kiz;
  if (mitWgKiz < bedarf && !(kinder > 0 && kizGrund.startsWith('erweiterter'))) {
    buergergeld = Math.max(0, bedarf - bereinigt - kindergeld);
    if (buergergeld > 0) { wgFinal = 0; kizFinal = 0; }
  }
  const transfers = wgFinal + kizFinal + buergergeld;
  const verfuegbar = netto + kindergeld + transfers - h.kita;
  return { bruttoA, nettoA, nettoB, netto, kindergeld, bedarf, bereinigt, wg: wgFinal, kiz: kizFinal, kizGrund, buergergeld, transfers, verfuegbar, stklA, stklB, freiA };
}

const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtPct = (n: number) => (n * 100).toFixed(0) + ' %';

// Hilfskomponenten auf Modulebene, damit Inputs beim Tippen nicht neu gemountet werden (Fokusverlust)
const btn = (aktiv: boolean) => 'py-2 px-2 rounded-xl font-medium transition-all text-sm ' + (aktiv ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200');
const inputCls = 'w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none';
const Zahl = ({ label, value, set, step = 100 }: { label: string; value: number; set: (n: number) => void; step?: number }) => (
  <div><label className="block mb-1 text-sm text-gray-700 font-medium">{label}</label><div className="relative"><input type="number" value={value} onChange={(e) => set(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" step={step} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span></div></div>
);
const Zaehler = ({ label, value, set }: { label: string; value: number; set: (n: number) => void }) => (
  <div><span className="text-gray-700 font-medium block mb-2 text-sm">{label}</span><div className="grid grid-cols-4 gap-1">{[0, 1, 2, 3].map((n) => <button key={n} onClick={() => set(n)} className={btn(value === n)}>{n}</button>)}</div></div>
);

export default function MehrArbeitenRechner() {
  const [paar, setPaar] = useState(true);
  const [stklA, setStklA] = useState(5);
  const [bruttoA, setBruttoA] = useState(1600);
  const [bruttoNeu, setBruttoNeu] = useState(2400);
  const [bruttoB, setBruttoB] = useState(3200);
  const [k0, setK0] = useState(1);
  const [k6, setK6] = useState(1);
  const [k14, setK14] = useState(0);
  const [warmmiete, setWarmmiete] = useState(1100);
  const [mietstufe, setMietstufe] = useState('IV');
  const [kita, setKita] = useState(0);
  const [kitaNeu, setKitaNeu] = useState(0);

  const h: Haushalt = { paar, stklA, bruttoB, k0, k6, k14, warmmiete, mietstufe, kita };
  const alt = useMemo(() => rechne(bruttoA, h), [bruttoA, paar, stklA, bruttoB, k0, k6, k14, warmmiete, mietstufe, kita]);
  const neu = useMemo(() => rechne(bruttoNeu, { ...h, kita: kitaNeu }), [bruttoNeu, paar, stklA, bruttoB, k0, k6, k14, warmmiete, mietstufe, kitaNeu]);
  const kurve = useMemo(() => {
    const max = Math.max(bruttoA, bruttoNeu, 3000);
    const schritt = max > 4000 ? 500 : 250;
    const ende = Math.ceil(max / schritt) * schritt + schritt;
    const rows: ReturnType<typeof rechne>[] = [];
    for (let b = 0; b <= ende; b += schritt) rows.push(rechne(b, h));
    return rows.map((r, i) => ({ ...r, grenz: i === 0 ? 0 : 1 - (r.verfuegbar - rows[i - 1].verfuegbar) / schritt }));
  }, [bruttoA, bruttoNeu, paar, stklA, bruttoB, k0, k6, k14, warmmiete, mietstufe, kita]);

  const dBrutto = neu.bruttoA - alt.bruttoA;
  const dVerf = neu.verfuegbar - alt.verfuegbar;
  const grenz = dBrutto !== 0 ? 1 - dVerf / dBrutto : 0;
  const lohnt = dVerf > 0;
  const kinder = k0 + k6 + k14;


  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">1. Ihr Haushalt</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div><span className="text-gray-700 font-medium block mb-2 text-sm">Familienform</span><div className="grid grid-cols-2 gap-1"><button onClick={() => setPaar(true)} className={btn(paar)}>Paar</button><button onClick={() => setPaar(false)} className={btn(!paar)}>Alleinerziehend / allein</button></div></div>
          {paar && <div><span className="text-gray-700 font-medium block mb-2 text-sm">Ihre Steuerklasse (Partner erhält die Gegenklasse)</span><div className="grid grid-cols-3 gap-1">{[3, 4, 5].map((n) => <button key={n} onClick={() => setStklA(n)} className={btn(stklA === n)}>{n} / {8 - n}</button>)}</div></div>}
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Zaehler label="Kinder 0–5 Jahre" value={k0} set={setK0} />
          <Zaehler label="Kinder 6–13 Jahre" value={k6} set={setK6} />
          <Zaehler label="Kinder 14–17 Jahre" value={k14} set={setK14} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">2. Einkommen und Wohnen (monatlich)</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Zahl label="Ihr Brutto heute (z. B. Teilzeit)" value={bruttoA} set={setBruttoA} />
          <Zahl label="Ihr Brutto nach Aufstockung" value={bruttoNeu} set={setBruttoNeu} />
          {paar && <Zahl label="Brutto des Partners (bleibt gleich)" value={bruttoB} set={setBruttoB} />}
          <Zahl label="Warmmiete (Kaltmiete + Nebenkosten + Heizung)" value={warmmiete} set={setWarmmiete} step={50} />
          <div><span className="text-gray-700 font-medium block mb-2 text-sm">Mietenstufe der Gemeinde (Wohngeld)</span><div className="grid grid-cols-7 gap-1">{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].map((m) => <button key={m} onClick={() => setMietstufe(m)} className={btn(mietstufe === m)}>{m}</button>)}</div></div>
          <div className="grid grid-cols-2 gap-2">
            <Zahl label="Kita-/Betreuungskosten heute" value={kita} set={setKita} step={25} />
            <Zahl label="Betreuungskosten nach Aufstockung" value={kitaNeu} set={setKitaNeu} step={25} />
          </div>
        </div>
      </div>

      <div className={'bg-gradient-to-br ' + (lohnt ? 'from-violet-600 to-indigo-700' : 'from-red-500 to-rose-700') + ' rounded-2xl shadow-lg p-6 text-white mb-6'}>
        <h3 className="text-sm font-medium opacity-80 mb-1">💼 {fmt(dBrutto)} mehr brutto bringen der Familie</h3>
        <div className="mb-4">
          <div className="text-4xl sm:text-5xl font-bold">{dVerf >= 0 ? '+' : ''}{fmt(dVerf)} / Monat</div>
          <p className="mt-2 text-sm opacity-90">
            {dBrutto > 0 ? 'Von jedem zusätzlichen Euro brutto bleiben ' + fmtPct(1 - grenz) + ' übrig, ' + fmtPct(grenz) + ' gehen an Steuern, Sozialabgaben, wegfallende Leistungen und Betreuungskosten.' : 'Geben Sie ein höheres Brutto nach Aufstockung ein.'}
            {' '}Verfügbares Einkommen heute {fmt(alt.verfuegbar)}, danach {fmt(neu.verfuegbar)}.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Netto-Plus</span><div className="text-xl font-bold">{fmt(neu.netto - alt.netto)}</div></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Leistungen</span><div className="text-xl font-bold">{neu.transfers - alt.transfers >= 0 ? '+' : ''}{fmt(neu.transfers - alt.transfers)}</div></div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"><span className="text-sm opacity-80">Betreuung</span><div className="text-xl font-bold">{kitaNeu - kita > 0 ? '−' : ''}{fmt(Math.abs(kitaNeu - kita))}</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧮 Haushaltsrechnung im Vergleich</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b-2 border-gray-200"><th className="text-left py-2 font-semibold text-gray-700">Position</th><th className="text-right py-2 font-semibold text-gray-700">heute</th><th className="text-right py-2 font-semibold text-gray-700">danach</th></tr></thead>
          <tbody className="text-gray-700">
            <tr className="border-b border-gray-100"><td className="py-2">Ihr Netto (Steuerklasse {alt.stklA})</td><td className="text-right">{fmt(alt.nettoA)}</td><td className="text-right">{fmt(neu.nettoA)}</td></tr>
            {paar && <tr className="border-b border-gray-100"><td className="py-2">Netto Partner (Steuerklasse {alt.stklB})</td><td className="text-right">{fmt(alt.nettoB)}</td><td className="text-right">{fmt(neu.nettoB)}</td></tr>}
            <tr className="border-b border-gray-100"><td className="py-2">Kindergeld ({kinder} × 259 €)</td><td className="text-right">{fmt(alt.kindergeld)}</td><td className="text-right">{fmt(neu.kindergeld)}</td></tr>
            <tr className="border-b border-gray-100"><td className="py-2">Wohngeld</td><td className="text-right">{fmt(alt.wg)}</td><td className="text-right">{fmt(neu.wg)}</td></tr>
            <tr className="border-b border-gray-100"><td className="py-2">Kinderzuschlag{alt.kizGrund && alt.kiz === 0 ? <span className="block text-xs text-gray-400">{alt.kizGrund}</span> : null}</td><td className="text-right">{fmt(alt.kiz)}</td><td className="text-right">{fmt(neu.kiz)}</td></tr>
            <tr className="border-b border-gray-100"><td className="py-2">Grundsicherung (aufstockend)</td><td className="text-right">{fmt(alt.buergergeld)}</td><td className="text-right">{fmt(neu.buergergeld)}</td></tr>
            <tr className="border-b border-gray-100"><td className="py-2">− Betreuungskosten</td><td className="text-right">− {fmt(kita)}</td><td className="text-right">− {fmt(kitaNeu)}</td></tr>
            <tr className="font-bold text-violet-800"><td className="py-2">= Verfügbar</td><td className="text-right">{fmt(alt.verfuegbar)}</td><td className="text-right">{fmt(neu.verfuegbar)}</td></tr>
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-3">SGB-II-Bedarf des Haushalts: {fmt(alt.bedarf)} (Regelbedarfe{!paar && kinder > 0 ? ' + Mehrbedarf Alleinerziehende' : ''} + Warmmiete). Bereinigtes Einkommen heute {fmt(alt.bereinigt)}, danach {fmt(neu.bereinigt)}.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">📈 Was von jedem Schritt mehr Brutto bleibt</h3>
        <p className="text-xs text-gray-500 mb-4">Ihr Brutto in Schritten, Partnereinkommen und Betreuungskosten wie heute. „Bleibt“ = Anteil des zusätzlichen Bruttos, der im verfügbaren Einkommen ankommt.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b-2 border-gray-200"><th className="text-left py-2 font-semibold text-gray-700">Brutto</th><th className="text-right py-2 font-semibold text-gray-700">Netto</th><th className="text-right py-2 font-semibold text-gray-700">Leistungen</th><th className="text-right py-2 font-semibold text-gray-700">Verfügbar</th><th className="text-right py-2 font-semibold text-gray-700">Bleibt</th></tr></thead>
            <tbody>
              {kurve.map((r, i) => (
                <tr key={r.bruttoA} className={'border-b border-gray-100 ' + (r.bruttoA === bruttoA || r.bruttoA === bruttoNeu ? 'bg-violet-50 font-bold text-violet-800' : 'text-gray-700')}>
                  <td className="py-1.5">{fmt(r.bruttoA)}</td><td className="py-1.5 text-right">{fmt(r.netto)}</td><td className="py-1.5 text-right">{fmt(r.transfers)}</td><td className="py-1.5 text-right">{fmt(r.verfuegbar)}</td>
                  <td className={'py-1.5 text-right ' + (i === 0 ? '' : r.grenz > 0.8 ? 'text-red-600 font-semibold' : r.grenz > 0.6 ? 'text-amber-600' : 'text-green-700')}>{i === 0 ? '–' : fmtPct(1 - r.grenz)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Modellrechnung, keine Rechts- oder Steuerberatung. Lohnsteuer nach PAP 2026 ohne Kirchensteuer, Freibeträge und
        Sonderzahlungen; Sozialabgaben mit durchschnittlichem Zusatzbeitrag 2,9 %. Wohngeld und Kinderzuschlag folgen den gesetzlichen Formeln, aber ohne
        Vermögensprüfung, Unterhalt, Elterngeld, Kindeseinkommen, Mehrbedarfe (außer Alleinerziehende) und Sonderfälle; Warmmiete gilt als angemessen.
        Die Grundsicherung wird als reine Aufstockung gerechnet. Die Behörden rechnen mit Durchschnittseinkommen der letzten sechs Monate und
        Bewilligungszeiträumen; die tatsächlichen Beträge können abweichen. Wechselwirkungen mit Kita-Gebührenstaffeln, Beitragsfreiheit bei
        Leistungsbezug und BuT-Leistungen sind nur über die Betreuungskosten-Felder abbildbar.
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.bmf-steuerrechner.de/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">BMF – Programmablaufplan Lohnsteuer 2026</a>
          <a href="https://www.gesetze-im-internet.de/bkgg_1996/__6a.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 6a BKGG – Kinderzuschlag: Mindesteinkommen, Höchstbetrag, 45-%-Anrechnung, erweiterter Zugang</a>
          <a href="https://www.arbeitsagentur.de/datei/kiz2-merkblattkinderzuschlag_ba034485.pdf" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">Familienkasse – Merkblatt Kinderzuschlag (Stand Juli 2026): 297 €, Regelbedarfe, Elternanteil Wohnkosten</a>
          <a href="https://www.gesetze-im-internet.de/sgb_2/__11b.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 11b SGB II – Absetzbeträge und Erwerbstätigenfreibeträge (100 € / 20 % / 30 % / 10 %)</a>
          <a href="https://www.gesetze-im-internet.de/sgb_2/__21.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 21 Abs. 3 SGB II – Mehrbedarf für Alleinerziehende</a>
          <a href="https://www.gesetze-im-internet.de/wogg/__19.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§ 19 WoGG mit Anlagen 1–3 (Fassung 2025) – Wohngeldformel, Höchstbeträge, Koeffizienten</a>
          <a href="https://www.gesetze-im-internet.de/wogg/__16.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">§§ 16, 17 WoGG – Pauschalabzüge je 10 % und Freibeträge</a>
        </div>
      </div>
    </div>
  );
}
