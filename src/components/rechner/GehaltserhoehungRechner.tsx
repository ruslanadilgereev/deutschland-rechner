import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

/**
 * Gehaltserhöhung-Rechner 2026
 *
 * Berechnet, wie viel von einer Bruttogehaltserhöhung netto übrig bleibt
 * (Netto vorher vs. nachher) und die effektive Grenzbelastung.
 *
 * Lohnsteuer nach offiziellem BMF-Programmablaufplan (PAP) 2026.
 * Quelle: https://www.bmf-steuerrechner.de/bl/bl2026/eingabeformbl2026.xhtml
 * Sozialversicherung nach Rechengrößenverordnung 2026 (Bundeskabinett 08.10.2025).
 *
 * Schätzung – keine Steuerberatung. Maßgeblich ist Ihre Gehaltsabrechnung.
 */

// ============================================================================
// PAP 2026 KONSTANTEN - EXAKT NACH BMF
// ============================================================================

const PAP_2026 = {
  BBGRVALV: 101400,
  BBGKVPV: 69750,
  RVSATZAN: 0.093,
  AVSATZAN: 0.013,
  PVSATZAN_BASIS: 0.018,
  PVSATZAN_SACHSEN: 0.023,
  PVSATZAN_KINDERLOS: 0.006,
  PVSATZAN_KINDABSCHLAG: 0.0025,
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

// ============================================================================
// SOZIALVERSICHERUNG 2026
// ============================================================================

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

const STEUERKLASSEN = [
  { wert: 1, label: 'Steuerklasse 1', beschreibung: 'Ledig / Geschieden' },
  { wert: 2, label: 'Steuerklasse 2', beschreibung: 'Alleinerziehend' },
  { wert: 3, label: 'Steuerklasse 3', beschreibung: 'Verheiratet (höheres Einkommen)' },
  { wert: 4, label: 'Steuerklasse 4', beschreibung: 'Verheiratet (gleiches Einkommen)' },
  { wert: 5, label: 'Steuerklasse 5', beschreibung: 'Verheiratet (geringeres Einkommen)' },
  { wert: 6, label: 'Steuerklasse 6', beschreibung: 'Zweitjob / Nebenjob' },
];

const BUNDESLAENDER = [
  { code: 'BW', name: 'Baden-Württemberg' },
  { code: 'BY', name: 'Bayern' },
  { code: 'BE', name: 'Berlin' },
  { code: 'BB', name: 'Brandenburg' },
  { code: 'HB', name: 'Bremen' },
  { code: 'HH', name: 'Hamburg' },
  { code: 'HE', name: 'Hessen' },
  { code: 'MV', name: 'Mecklenburg-Vorpommern' },
  { code: 'NI', name: 'Niedersachsen' },
  { code: 'NW', name: 'Nordrhein-Westfalen' },
  { code: 'RP', name: 'Rheinland-Pfalz' },
  { code: 'SL', name: 'Saarland' },
  { code: 'SN', name: 'Sachsen' },
  { code: 'ST', name: 'Sachsen-Anhalt' },
  { code: 'SH', name: 'Schleswig-Holstein' },
  { code: 'TH', name: 'Thüringen' },
];

function berechneKirchensteuer(lohnsteuerJahr: number, bundesland: string): number {
  const satz = ['BY', 'BW'].includes(bundesland) ? 0.08 : 0.09;
  return Math.round(lohnsteuerJahr * satz);
}

/**
 * Berechnet das Netto-Jahresgehalt für ein gegebenes Bruttojahresgehalt.
 */
function berechneNettoJahr(
  bruttoJahr: number,
  opts: {
    steuerklasse: number;
    kinderlos: boolean;
    kirchensteuer: boolean;
    bundesland: string;
    anzahlKinder: number;
    kvZusatzbeitrag: number;
  }
): number {
  const { steuerklasse, kinderlos, kirchensteuer, bundesland, anzahlKinder, kvZusatzbeitrag } = opts;

  // === SOZIALVERSICHERUNG ===
  const rvBrutto = Math.min(bruttoJahr, BBG_2026.renteArbeitslos);
  const kvBrutto = Math.min(bruttoJahr, BBG_2026.krankenPflege);

  const rv = rvBrutto * SOZIALVERSICHERUNG_2026.rentenversicherung;
  const av = rvBrutto * SOZIALVERSICHERUNG_2026.arbeitslosenversicherung;

  let pvSatz = SOZIALVERSICHERUNG_2026.pflegeversicherung.basis;
  if (kinderlos) {
    pvSatz += SOZIALVERSICHERUNG_2026.pflegeversicherung.kinderlosZuschlag;
  } else if (anzahlKinder > 1) {
    const abschlagKinder = Math.min(4, anzahlKinder - 1);
    pvSatz -= abschlagKinder * SOZIALVERSICHERUNG_2026.pflegeversicherung.kindAbschlag;
  }
  const pv = kvBrutto * pvSatz;

  const kvSatz = SOZIALVERSICHERUNG_2026.krankenversicherung.basis + kvZusatzbeitrag / 100 / 2;
  const kv = kvBrutto * kvSatz;

  const svGesamt = rv + av + pv + kv;

  // === STEUERN - PAP 2026 ===
  const pap = new Lohnsteuer2026({
    stkl: steuerklasse,
    bruttoJahr,
    kvZusatzbeitrag,
    kinderlos,
    sachsen: bundesland === 'SN',
    anzahlKinder,
    zkf: steuerklasse === 2 ? anzahlKinder : 0,
  });
  const steuerErgebnis = pap.berechne();
  const lohnsteuerJahr = steuerErgebnis.lstJahr;
  const soliJahr = steuerErgebnis.solzJahr;
  const kistJahr = kirchensteuer ? berechneKirchensteuer(lohnsteuerJahr, bundesland) : 0;
  const steuernGesamt = lohnsteuerJahr + soliJahr + kistJahr;

  return bruttoJahr - svGesamt - steuernGesamt;
}

export function GehaltserhoehungRechner() {
  const [bruttoMonat, setBruttoMonat] = useState(3500);
  const [erhoehungModus, setErhoehungModus] = useState<'euro' | 'prozent'>('euro');
  const [erhoehungEuro, setErhoehungEuro] = useState(250);
  const [erhoehungProzent, setErhoehungProzent] = useState(5);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [kinderlos, setKinderlos] = useState(true);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState('NW');
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const [kvZusatzbeitrag, setKvZusatzbeitrag] = useState(2.9);

  const ergebnis = useMemo(() => {
    const erhoehungMonat =
      erhoehungModus === 'euro'
        ? erhoehungEuro
        : Math.round((bruttoMonat * erhoehungProzent) / 100);

    const bruttoMonatNeu = bruttoMonat + erhoehungMonat;

    const opts = { steuerklasse, kinderlos, kirchensteuer, bundesland, anzahlKinder, kvZusatzbeitrag };

    const nettoJahrVorher = berechneNettoJahr(bruttoMonat * 12, opts);
    const nettoJahrNachher = berechneNettoJahr(bruttoMonatNeu * 12, opts);

    const nettoMonatVorher = nettoJahrVorher / 12;
    const nettoMonatNachher = nettoJahrNachher / 12;

    const nettoZuwachsMonat = nettoMonatNachher - nettoMonatVorher;
    const nettoZuwachsJahr = nettoJahrNachher - nettoJahrVorher;

    // Grenzbelastung = Anteil der Bruttoerhöhung, der durch Steuern + SV "verloren" geht
    const grenzbelastung =
      erhoehungMonat > 0 ? (1 - nettoZuwachsMonat / erhoehungMonat) * 100 : 0;
    // Netto-Quote = wie viel der Bruttoerhöhung netto ankommt
    const nettoQuote = erhoehungMonat > 0 ? (nettoZuwachsMonat / erhoehungMonat) * 100 : 0;

    return {
      erhoehungMonat,
      bruttoMonatNeu,
      nettoMonatVorher: Math.round(nettoMonatVorher),
      nettoMonatNachher: Math.round(nettoMonatNachher),
      nettoZuwachsMonat: Math.round(nettoZuwachsMonat),
      nettoZuwachsJahr: Math.round(nettoZuwachsJahr),
      grenzbelastung: Math.round(grenzbelastung * 10) / 10,
      nettoQuote: Math.round(nettoQuote * 10) / 10,
    };
  }, [bruttoMonat, erhoehungModus, erhoehungEuro, erhoehungProzent, steuerklasse, kinderlos, kirchensteuer, bundesland, anzahlKinder, kvZusatzbeitrag]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Gehaltserhöhung-Rechner" rechnerSlug="gehaltserhoehung-rechner" />

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Aktuelles Bruttogehalt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Aktuelles Brutto-Monatsgehalt</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttoMonat}
              onChange={(e) => setBruttoMonat(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step={100}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            min="0"
            max="15000"
            step="100"
            value={bruttoMonat}
            onChange={(e) => setBruttoMonat(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>15.000 €</span>
          </div>
        </div>

        {/* Erhöhung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Geplante Gehaltserhöhung (brutto / Monat)</span>
          </label>

          {/* Toggle Euro/Prozent */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setErhoehungModus('euro')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  erhoehungModus === 'euro'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                in Euro
              </button>
              <button
                onClick={() => setErhoehungModus('prozent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  erhoehungModus === 'prozent'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                in Prozent
              </button>
            </div>
          </div>

          {erhoehungModus === 'euro' ? (
            <>
              <div className="relative">
                <input
                  type="number"
                  value={erhoehungEuro}
                  onChange={(e) => setErhoehungEuro(Math.max(0, Number(e.target.value)))}
                  className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                  step={50}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={erhoehungEuro}
                onChange={(e) => setErhoehungEuro(Number(e.target.value))}
                className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0 €</span>
                <span>3.000 €</span>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <input
                  type="number"
                  value={erhoehungProzent}
                  onChange={(e) => setErhoehungProzent(Math.max(0, Number(e.target.value)))}
                  className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                  step={0.5}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={erhoehungProzent}
                onChange={(e) => setErhoehungProzent(Number(e.target.value))}
                className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0 %</span>
                <span>30 %</span>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                = {formatEuro(ergebnis.erhoehungMonat)} mehr brutto / Monat
              </p>
            </>
          )}
        </div>

        {/* Steuerklasse */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Steuerklasse</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STEUERKLASSEN.map((sk) => (
              <button
                key={sk.wert}
                onClick={() => setSteuerklasse(sk.wert)}
                className={`py-3 px-2 rounded-xl font-bold text-lg transition-all ${
                  steuerklasse === sk.wert
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={sk.beschreibung}
              >
                {sk.wert}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {STEUERKLASSEN.find((sk) => sk.wert === steuerklasse)?.beschreibung}
          </p>
        </div>

        {/* Kinder (für SK 2) */}
        {steuerklasse === 2 && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Anzahl Kinder</span>
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setAnzahlKinder(Math.max(1, anzahlKinder - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
              >−</button>
              <span className="text-2xl font-bold w-12 text-center">{anzahlKinder || 1}</span>
              <button
                onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
              >+</button>
            </div>
          </div>
        )}

        {/* Bundesland */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bundesland</span>
            <span className="text-sm text-gray-500 ml-2">(für Kirchensteuer &amp; Pflege-Satz)</span>
          </label>
          <select
            value={bundesland}
            onChange={(e) => setBundesland(e.target.value)}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none bg-white"
          >
            {BUNDESLAENDER.map((bl) => (
              <option key={bl.code} value={bl.code}>{bl.name}</option>
            ))}
          </select>
        </div>

        {/* KV-Zusatzbeitrag */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">KV-Zusatzbeitrag</span>
            <span className="text-sm text-gray-500 ml-2">(Durchschnitt 2026: 2,9 %)</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="4.5"
              step="0.1"
              value={kvZusatzbeitrag}
              onChange={(e) => setKvZusatzbeitrag(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-lg font-bold w-16 text-right">{kvZusatzbeitrag.toFixed(1)} %</span>
          </div>
        </div>

        {/* Optionen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={kinderlos}
              onChange={(e) => setKinderlos(e.target.checked)}
              className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-700">Kinderlos (ab 23)</span>
              <p className="text-xs text-gray-500">+0,6 % Pflegeversicherung</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={kirchensteuer}
              onChange={(e) => setKirchensteuer(e.target.checked)}
              className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-700">Kirchensteuer</span>
              <p className="text-xs text-gray-500">8–9 % der Lohnsteuer</p>
            </div>
          </label>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-green-100 mb-1">Davon bleibt netto übrig</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl sm:text-4xl font-bold">+ {formatEuro(ergebnis.nettoZuwachsMonat)}</span>
            <span className="text-lg text-green-200">netto / Monat</span>
          </div>
          <p className="text-green-100 text-sm mt-1">
            bei + {formatEuro(ergebnis.erhoehungMonat)} brutto / Monat
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-green-100">Netto-Plus pro Jahr</span>
            <span className="text-xl font-bold">+ {formatEuro(ergebnis.nettoZuwachsJahr)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-100">Davon kommt netto an</span>
            <span className="text-lg font-bold">{ergebnis.nettoQuote.toLocaleString('de-DE')} %</span>
          </div>
        </div>
      </div>

      {/* Kernaussage */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-gray-700">
            Von <strong className="text-gray-900">{formatEuro(ergebnis.erhoehungMonat)}</strong> mehr brutto
            bleiben Ihnen <strong className="text-green-700">{formatEuro(ergebnis.nettoZuwachsMonat)}</strong> netto.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Effektive Grenzbelastung: <strong className="text-orange-600">{ergebnis.grenzbelastung.toLocaleString('de-DE')} %</strong> gehen
            an Steuern und Sozialabgaben.
          </p>
        </div>
      </div>

      {/* Vorher / Nachher Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Netto vorher vs. nachher</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Brutto / Monat</span>
            <span className="text-gray-500">{formatEuro(bruttoMonat)} → <strong className="text-gray-900">{formatEuro(ergebnis.bruttoMonatNeu)}</strong></span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Netto / Monat vorher</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.nettoMonatVorher)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Netto / Monat nachher</span>
            <span className="font-bold text-green-700">{formatEuro(ergebnis.nettoMonatNachher)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl">
            <span className="font-bold text-green-800">Netto-Zuwachs / Monat</span>
            <span className="font-bold text-green-600 text-lg">+ {formatEuro(ergebnis.nettoZuwachsMonat)}</span>
          </div>
        </div>
      </div>

      {/* Affiliate-Banner */}
      <aside className="-mt-2 mb-3 text-center">
        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5 leading-tight">
          Anzeige
        </p>
        <a
          href="https://a.partner-versicherung.de/click.php?partner_id=201880&ad_id=591&deep=berufsunfaehigkeitsversicherung&tracking=gehaltserhoehungBuInline"
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="inline-block max-w-full"
        >
          <img
            src="https://a.partner-versicherung.de/view.php?partner_id=201880&ad_id=591"
            width={728}
            height={90}
            alt="Berufsunfähigkeitsversicherung-Vergleich · Tarifcheck"
            loading="lazy"
            className="max-w-full h-auto block mx-auto"
          />
        </a>
      </aside>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Warum bleibt nicht alles übrig?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✅</span>
            <span>Auf den Mehrverdienst fallen <strong>Sozialabgaben</strong> (rund 20–21 % AN-Anteil) und <strong>Lohnsteuer</strong> an – bis zur jeweiligen Beitragsbemessungsgrenze.</span>
          </li>
          <li className="flex gap-2">
            <span>✅</span>
            <span>Der zusätzliche Euro wird mit Ihrem <strong>Grenzsteuersatz</strong> versteuert, nicht mit dem Durchschnittssteuersatz – deshalb ist die Belastung höher als gedacht.</span>
          </li>
          <li className="flex gap-2">
            <span>✅</span>
            <span>Liegt Ihr Gehalt über der <strong>BBG (KV/PV: {formatEuro(BBG_2026.krankenPflege)}/Jahr, RV/AV: {formatEuro(BBG_2026.renteArbeitslos)}/Jahr)</strong>, fallen auf den darüber liegenden Teil keine SV-Beiträge mehr an – die Netto-Quote steigt dann.</span>
          </li>
          <li className="flex gap-2">
            <span>✅</span>
            <span>Berechnung der Lohnsteuer nach dem offiziellen <strong>BMF-Programmablaufplan 2026</strong> (Grundfreibetrag {formatEuro(PAP_2026.GFB)}).</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-sm text-amber-800">
        <p className="font-semibold mb-1">⚠️ Schätzung – keine Steuerberatung</p>
        <p>
          Dieser Rechner liefert eine vereinfachte Schätzung auf Basis der Werte für 2026. Nicht
          berücksichtigt werden u. a. individuelle Freibeträge, geldwerte Vorteile, Einmalzahlungen,
          betriebliche Altersvorsorge oder ein freiwilliger PKV-Beitrag. Maßgeblich ist Ihre persönliche
          Gehaltsabrechnung.
        </p>
      </div>

      {/* Verwandte Rechner (Querverlinkung) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🔗 Passende Rechner</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <a href="/brutto-netto-rechner" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="text-xl">💵</span>
            <p className="font-medium text-gray-800 mt-1">Brutto-Netto-Rechner</p>
            <p className="text-gray-500 text-xs">Komplettes Netto berechnen</p>
          </a>
          <a href="/lohnsteuer-rechner" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="text-xl">🧾</span>
            <p className="font-medium text-gray-800 mt-1">Lohnsteuer-Rechner</p>
            <p className="text-gray-500 text-xs">Lohnsteuer im Detail</p>
          </a>
          <a href="/gehaltsvergleich-rechner" className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="text-xl">📈</span>
            <p className="font-medium text-gray-800 mt-1">Gehaltsvergleich</p>
            <p className="text-gray-500 text-xs">Verdienen Sie genug?</p>
          </a>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Rechtsgrundlagen &amp; Quellen (Stand: 2026)</h4>
        <div className="space-y-1">
          <a
            href="https://www.bmf-steuerrechner.de/bl/bl2026/eingabeformbl2026.xhtml"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Offizieller Lohnsteuerrechner 2026
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §32a EStG – Einkommensteuertarif (Grundfreibetrag 12.348 €)
          </a>
          <a
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2025/25-10-08-bundeskabinett-sv-rechengroessen-vo-2026.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Rechengrößen der Sozialversicherung 2026
          </a>
          <a
            href="https://www.gkv-spitzenverband.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GKV-Spitzenverband – durchschnittlicher Zusatzbeitrag 2026 (2,9 %)
          </a>
        </div>
      </div>
    </div>
  );
}

export default GehaltserhoehungRechner;
