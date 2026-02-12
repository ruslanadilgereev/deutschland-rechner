import { useState, useMemo } from 'react';

/**
 * KIRCHENSTEUERRECHNER 2025/2026
 * 
 * Berechnung basiert auf:
 * - §51a EStG - Kirchensteuer als Zuschlag zur Einkommensteuer
 * - Landeskirchensteuergesetze der Bundesländer
 * - BMF Programmablaufplan für maschinelle Lohnsteuerberechnung
 * 
 * Quellen:
 * - https://www.gesetze-im-internet.de/estg/__51a.html
 * - https://www.lohn-info.de/kirchensteuer.html
 * - https://www.kirchenfinanzen.de/kirchensteuer/kappung.html
 * - https://www.bmf-steuerrechner.de
 */

// ============================================================================
// OFFIZIELLE WERTE 2026 (§32a EStG - Steuerfortentwicklungsgesetz)
// ============================================================================
const STEUERJAHR = 2026;

// Einkommensteuertarif 2026
const TARIF_2026 = {
  grundfreibetrag: 12348,
  zone2Ende: 17799,
  zone3Ende: 69878,
  zone4Ende: 277825,
  zone2_a: 914.51,
  zone2_b: 1400,
  zone3_a: 173.10,
  zone3_b: 2397,
  zone3_c: 1034.87,
  zone4_satz: 0.42,
  zone4_abzug: 11135.63,
  zone5_satz: 0.45,
  zone5_abzug: 19470.38,
};

// Kinderfreibetrag 2026 (§32 Abs. 6 EStG)
// 6.828€ Kinderfreibetrag + 2.928€ BEA = 9.756€ gesamt
const KINDERFREIBETRAG_GESAMT = 9756;

// ============================================================================
// KIRCHENSTEUERSÄTZE NACH BUNDESLAND (Landeskirchensteuergesetze)
// ============================================================================
interface KirchensteuerInfo {
  satz: number;
  kappungEvang: number | null;
  kappungKath: number | null;
  kappungAutomatisch: boolean;
  pauschalSatz: number;
}

const KIRCHENSTEUER_DATEN: Record<string, KirchensteuerInfo> = {
  'Baden-Württemberg': {
    satz: 0.08,
    kappungEvang: 0.035, // evang. Baden: 3,5%, evang. Württ.: 2,75%
    kappungKath: 0.035,
    kappungAutomatisch: false, // auf Antrag
    pauschalSatz: 0.045,
  },
  'Bayern': {
    satz: 0.08,
    kappungEvang: null, // keine Kappung in Bayern!
    kappungKath: null,
    kappungAutomatisch: false,
    pauschalSatz: 0.07,
  },
  'Berlin': {
    satz: 0.09,
    kappungEvang: 0.03,
    kappungKath: 0.03,
    kappungAutomatisch: true,
    pauschalSatz: 0.05,
  },
  'Brandenburg': {
    satz: 0.09,
    kappungEvang: 0.03,
    kappungKath: 0.03,
    kappungAutomatisch: true,
    pauschalSatz: 0.05,
  },
  'Bremen': {
    satz: 0.09,
    kappungEvang: 0.035,
    kappungKath: 0.035,
    kappungAutomatisch: true,
    pauschalSatz: 0.07,
  },
  'Hamburg': {
    satz: 0.09,
    kappungEvang: 0.03,
    kappungKath: 0.03,
    kappungAutomatisch: true,
    pauschalSatz: 0.04,
  },
  'Hessen': {
    satz: 0.09,
    kappungEvang: 0.035,
    kappungKath: 0.04,
    kappungAutomatisch: false, // auf Antrag
    pauschalSatz: 0.07,
  },
  'Mecklenburg-Vorpommern': {
    satz: 0.09,
    kappungEvang: 0.03,
    kappungKath: 0.03,
    kappungAutomatisch: true,
    pauschalSatz: 0.05,
  },
  'Niedersachsen': {
    satz: 0.09,
    kappungEvang: 0.035,
    kappungKath: 0.035,
    kappungAutomatisch: true,
    pauschalSatz: 0.06,
  },
  'Nordrhein-Westfalen': {
    satz: 0.09,
    kappungEvang: 0.035,
    kappungKath: 0.04,
    kappungAutomatisch: false, // auf Antrag
    pauschalSatz: 0.07,
  },
  'Rheinland-Pfalz': {
    satz: 0.09,
    kappungEvang: 0.035,
    kappungKath: 0.04,
    kappungAutomatisch: false, // auf Antrag
    pauschalSatz: 0.07,
  },
  'Saarland': {
    satz: 0.09,
    kappungEvang: 0.035,
    kappungKath: 0.04,
    kappungAutomatisch: false, // auf Antrag
    pauschalSatz: 0.07,
  },
  'Sachsen': {
    satz: 0.09,
    kappungEvang: 0.035,
    kappungKath: 0.035,
    kappungAutomatisch: true,
    pauschalSatz: 0.05,
  },
  'Sachsen-Anhalt': {
    satz: 0.09,
    kappungEvang: 0.035,
    kappungKath: 0.035,
    kappungAutomatisch: true,
    pauschalSatz: 0.05,
  },
  'Schleswig-Holstein': {
    satz: 0.09,
    kappungEvang: 0.03,
    kappungKath: 0.03,
    kappungAutomatisch: true,
    pauschalSatz: 0.06,
  },
  'Thüringen': {
    satz: 0.09,
    kappungEvang: 0.035,
    kappungKath: 0.035,
    kappungAutomatisch: true,
    pauschalSatz: 0.05,
  },
};

// ============================================================================
// EINKOMMENSTEUERTARIF nach §32a EStG
// ============================================================================
function berechneEinkommensteuer(zvE: number): number {
  const x = Math.floor(zvE);
  if (x <= 0) return 0;
  
  if (x <= TARIF_2026.grundfreibetrag) return 0;
  
  if (x <= TARIF_2026.zone2Ende) {
    const y = (x - TARIF_2026.grundfreibetrag) / 10000;
    return Math.floor((TARIF_2026.zone2_a * y + TARIF_2026.zone2_b) * y);
  }
  
  if (x <= TARIF_2026.zone3Ende) {
    const z = (x - TARIF_2026.zone2Ende) / 10000;
    return Math.floor((TARIF_2026.zone3_a * z + TARIF_2026.zone3_b) * z + TARIF_2026.zone3_c);
  }
  
  if (x <= TARIF_2026.zone4Ende) {
    return Math.floor(TARIF_2026.zone4_satz * x - TARIF_2026.zone4_abzug);
  }
  
  return Math.floor(TARIF_2026.zone5_satz * x - TARIF_2026.zone5_abzug);
}

/**
 * Berechnet den Grenzsteuersatz für ein gegebenes zvE
 */
function berechneGrenzsteuersatz(zvE: number): number {
  if (zvE <= TARIF_2026.grundfreibetrag) return 0;
  if (zvE <= TARIF_2026.zone2Ende) {
    const anteil = (zvE - TARIF_2026.grundfreibetrag) / (TARIF_2026.zone2Ende - TARIF_2026.grundfreibetrag);
    return 14 + anteil * 10;
  }
  if (zvE <= TARIF_2026.zone3Ende) {
    const anteil = (zvE - TARIF_2026.zone2Ende) / (TARIF_2026.zone3Ende - TARIF_2026.zone2Ende);
    return 24 + anteil * 18;
  }
  if (zvE <= TARIF_2026.zone4Ende) return 42;
  return 45;
}

export default function KirchensteuerRechner() {
  // Eingabewerte
  const [jahresBrutto, setJahresBrutto] = useState(50000);
  const [bundesland, setBundesland] = useState('Nordrhein-Westfalen');
  const [konfession, setKonfession] = useState<'evangelisch' | 'katholisch'>('evangelisch');
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const [verheiratet, setVerheiratet] = useState(false);
  const [kappungAnwenden, setKappungAnwenden] = useState(true);

  const ergebnis = useMemo(() => {
    const daten = KIRCHENSTEUER_DATEN[bundesland];
    
    // === 1. Zu versteuerndes Einkommen berechnen (vereinfacht) ===
    // Vereinfachte Berechnung ohne detaillierte Vorsorgepauschale
    const werbungskostenPauschale = 1230;
    const sonderausgabenPauschale = 36;
    
    // Kinderfreibeträge für Kirchensteuer-Berechnung
    const kinderfreibetragFaktor = verheiratet ? 1 : 0.5;
    const kinderfreibetragGesamt = anzahlKinder * KINDERFREIBETRAG_GESAMT * kinderfreibetragFaktor;
    
    // zvE berechnen
    let zvE = jahresBrutto - werbungskostenPauschale - sonderausgabenPauschale;
    
    // Kinderfreibeträge reduzieren die Bemessungsgrundlage für Kirchensteuer
    const zvEFuerKirchensteuer = Math.max(0, zvE - kinderfreibetragGesamt);
    
    zvE = Math.max(0, zvE);
    
    // === 2. Einkommensteuer berechnen ===
    let einkommensteuer: number;
    let einkommensteuerFuerKiSt: number;
    
    if (verheiratet) {
      // Splittingtarif
      einkommensteuer = berechneEinkommensteuer(zvE / 2) * 2;
      einkommensteuerFuerKiSt = berechneEinkommensteuer(zvEFuerKirchensteuer / 2) * 2;
    } else {
      // Grundtarif
      einkommensteuer = berechneEinkommensteuer(zvE);
      einkommensteuerFuerKiSt = berechneEinkommensteuer(zvEFuerKirchensteuer);
    }
    
    // === 3. Kirchensteuer ohne Kappung berechnen ===
    const kirchensteuerSatz = daten.satz;
    const kirchensteuerOhneKappung = Math.floor(einkommensteuerFuerKiSt * kirchensteuerSatz * 100) / 100;
    
    // === 4. Kappung berechnen (falls anwendbar) ===
    const kappungsSatz = konfession === 'evangelisch' ? daten.kappungEvang : daten.kappungKath;
    let kirchensteuerMitKappung = kirchensteuerOhneKappung;
    let kappungGreift = false;
    let ersparnisDurchKappung = 0;
    
    if (kappungsSatz !== null && kappungAnwenden) {
      // Kappung: Max. X% des zvE
      const maxKirchensteuer = Math.floor(zvEFuerKirchensteuer * kappungsSatz * 100) / 100;
      if (kirchensteuerOhneKappung > maxKirchensteuer) {
        kirchensteuerMitKappung = maxKirchensteuer;
        kappungGreift = true;
        ersparnisDurchKappung = kirchensteuerOhneKappung - maxKirchensteuer;
      }
    }
    
    const kirchensteuerFinal = kappungAnwenden ? kirchensteuerMitKappung : kirchensteuerOhneKappung;
    
    // === 5. Monatliche Werte ===
    const kirchensteuerMonat = kirchensteuerFinal / 12;
    
    // === 6. Effektive Kirchensteuer-Belastung ===
    const effektiverSatz = zvE > 0 ? (kirchensteuerFinal / zvE) * 100 : 0;
    const grenzsteuersatz = berechneGrenzsteuersatz(verheiratet ? zvE / 2 : zvE);
    
    // === 7. Steuerersparnis durch Absetzbarkeit ===
    // Kirchensteuer ist als Sonderausgabe absetzbar (§10 Abs. 1 Nr. 4 EStG)
    const steuerersparnisRate = grenzsteuersatz / 100;
    const steuerersparnisDurchAbzug = Math.round(kirchensteuerFinal * steuerersparnisRate);
    const nettoKirchensteuer = kirchensteuerFinal - steuerersparnisDurchAbzug;
    
    return {
      jahresBrutto,
      zvE,
      zvEFuerKirchensteuer,
      kinderfreibetragGesamt,
      einkommensteuer,
      einkommensteuerFuerKiSt,
      kirchensteuerSatz,
      kappungsSatz,
      kirchensteuerOhneKappung,
      kirchensteuerMitKappung,
      kirchensteuerFinal,
      kirchensteuerMonat,
      kappungGreift,
      ersparnisDurchKappung,
      effektiverSatz,
      grenzsteuersatz,
      steuerersparnisDurchAbzug,
      nettoKirchensteuer,
      kappungAutomatisch: daten.kappungAutomatisch,
      pauschalSatz: daten.pauschalSatz,
    };
  }, [jahresBrutto, bundesland, konfession, anzahlKinder, verheiratet, kappungAnwenden]);

  const daten = KIRCHENSTEUER_DATEN[bundesland];
  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
  const formatProzentExakt = (n: number) => (n * 100).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Jahresbruttoeinkommen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jahresbruttoeinkommen</span>
            <span className="text-xs text-gray-500 block mt-1">
              Gesamtes Bruttoeinkommen vor Steuern und Abgaben
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={jahresBrutto}
              onChange={(e) => setJahresBrutto(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="500000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Jahr</span>
          </div>
          <input
            type="range"
            value={jahresBrutto}
            onChange={(e) => setJahresBrutto(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="15000"
            max="200000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>15.000 €</span>
            <span>100.000 €</span>
            <span>200.000 €</span>
          </div>
        </div>

        {/* Bundesland */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bundesland</span>
            <span className="text-xs text-gray-500 block mt-1">
              Kirchensteuersatz: 8% (BY, BW) oder 9% (andere)
            </span>
          </label>
          <select
            value={bundesland}
            onChange={(e) => setBundesland(e.target.value)}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none text-gray-700"
          >
            {Object.keys(KIRCHENSTEUER_DATEN).map((land) => (
              <option key={land} value={land}>
                {land} ({(KIRCHENSTEUER_DATEN[land].satz * 100).toFixed(0)}%)
              </option>
            ))}
          </select>
        </div>

        {/* Konfession */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Konfession</span>
            <span className="text-xs text-gray-500 block mt-1">
              Relevant für Kappungsgrenze (in einigen Bundesländern unterschiedlich)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setKonfession('evangelisch')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                konfession === 'evangelisch'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⛪ Evangelisch
            </button>
            <button
              onClick={() => setKonfession('katholisch')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                konfession === 'katholisch'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ✝️ Katholisch
            </button>
          </div>
        </div>

        {/* Familienstand */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={verheiratet}
              onChange={(e) => setVerheiratet(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
            />
            <span className="text-gray-700 font-medium">Verheiratet / eingetragene Lebenspartnerschaft</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-8">
            Splittingtarif wird angewendet
          </p>
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahl Kinder</span>
            <span className="text-xs text-gray-500 block mt-1">
              Kinderfreibetrag reduziert Kirchensteuer-Bemessungsgrundlage
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAnzahlKinder(Math.max(0, anzahlKinder - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center w-20">
              <span className="text-4xl font-bold text-gray-800">{anzahlKinder}</span>
            </div>
            <button
              onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
          {anzahlKinder > 0 && (
            <p className="text-sm text-purple-600 text-center mt-2">
              Kinderfreibetrag: {formatEuro(ergebnis.kinderfreibetragGesamt)}
            </p>
          )}
        </div>

        {/* Kappung */}
        {daten.kappungEvang !== null && (
          <div className="mb-6 bg-purple-50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={kappungAnwenden}
                onChange={(e) => setKappungAnwenden(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-gray-700 font-medium">Kappung berücksichtigen</span>
            </label>
            <p className="text-xs text-purple-700 mt-2 ml-8">
              {daten.kappungAutomatisch ? (
                <>✓ In {bundesland} erfolgt die Kappung automatisch von Amts wegen</>
              ) : (
                <>⚠️ In {bundesland} muss die Kappung beantragt werden</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">⛪ Ihre jährliche Kirchensteuer</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.kirchensteuerFinal)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          <p className="text-purple-100 mt-2 text-sm">
            Entspricht <strong>{formatEuro(ergebnis.kirchensteuerMonat)}</strong> pro Monat
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Kirchensteuersatz</span>
            <div className="text-xl font-bold">{(ergebnis.kirchensteuerSatz * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Effektiver Satz</span>
            <div className="text-xl font-bold">{formatProzent(ergebnis.effektiverSatz)}</div>
          </div>
        </div>

        {ergebnis.kappungGreift && (
          <div className="bg-green-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <div>
                <span className="font-medium">Kappung greift!</span>
                <p className="text-sm text-green-100">
                  Ersparnis: {formatEuro(ergebnis.ersparnisDurchKappung)} durch Kappung auf {formatProzentExakt(ergebnis.kappungsSatz!)} des zvE
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Absetzbarkeit */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💡 Steuerersparnis durch Absetzbarkeit</h3>
        <p className="text-sm text-gray-600 mb-4">
          Kirchensteuer ist als <strong>Sonderausgabe</strong> vollständig von der Steuer absetzbar (§10 Abs. 1 Nr. 4 EStG).
        </p>
        
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Gezahlte Kirchensteuer</span>
            <span className="font-medium">{formatEuro(ergebnis.kirchensteuerFinal)}</span>
          </div>
          <div className="flex justify-between items-center mb-2 text-green-700">
            <span>− Steuerersparnis (~{formatProzent(ergebnis.grenzsteuersatz)} Grenzsteuersatz)</span>
            <span className="font-medium">−{formatEuro(ergebnis.steuerersparnisDurchAbzug)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-green-200">
            <span className="font-bold text-gray-800">= Effektive Netto-Belastung</span>
            <span className="font-bold text-xl text-green-700">{formatEuro(ergebnis.nettoKirchensteuer)}</span>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Schritt 1: Bemessungsgrundlage
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Jahresbruttoeinkommen</span>
            <span className="font-bold text-gray-900">{formatEuro(jahresBrutto)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Werbungskostenpauschale</span>
            <span>−1.230,00 €</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Sonderausgabenpauschale</span>
            <span>−36,00 €</span>
          </div>
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= Zu versteuerndes Einkommen (zvE)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.zvE)}</span>
          </div>
          
          {anzahlKinder > 0 && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                <span>− Kinderfreibetrag ({anzahlKinder} Kind{anzahlKinder > 1 ? 'er' : ''})</span>
                <span>−{formatEuro(ergebnis.kinderfreibetragGesamt)}</span>
              </div>
              <div className="flex justify-between py-2 bg-purple-50 -mx-6 px-6">
                <span className="font-medium text-purple-700">= zvE für Kirchensteuer</span>
                <span className="font-bold text-purple-900">{formatEuro(ergebnis.zvEFuerKirchensteuer)}</span>
              </div>
            </>
          )}
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Schritt 2: Einkommensteuer
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Einkommensteuer {verheiratet && '(Splittingtarif)'}
            </span>
            <span className="font-medium text-gray-900">{formatEuro(ergebnis.einkommensteuerFuerKiSt)}</span>
          </div>
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Schritt 3: Kirchensteuer
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Kirchensteuer ({(ergebnis.kirchensteuerSatz * 100).toFixed(0)}% der ESt)
            </span>
            <span className="font-medium text-gray-900">{formatEuro(ergebnis.kirchensteuerOhneKappung)}</span>
          </div>
          
          {ergebnis.kappungsSatz !== null && kappungAnwenden && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                Kappungsgrenze ({formatProzentExakt(ergebnis.kappungsSatz)} vom zvE)
              </span>
              <span className={`font-medium ${ergebnis.kappungGreift ? 'text-green-600' : 'text-gray-400'}`}>
                max. {formatEuro(ergebnis.zvEFuerKirchensteuer * ergebnis.kappungsSatz)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between py-3 bg-purple-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-purple-800">Kirchensteuer / Jahr</span>
            <span className="font-bold text-2xl text-purple-900">{formatEuro(ergebnis.kirchensteuerFinal)}</span>
          </div>
        </div>
      </div>

      {/* Bundesland-Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-purple-800 mb-3">📍 Kirchensteuer in {bundesland}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-xl p-4">
            <p className="text-gray-500">Steuersatz</p>
            <p className="text-2xl font-bold text-purple-700">{(daten.satz * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-gray-500">Pauschalsteuersatz</p>
            <p className="text-2xl font-bold text-purple-700">{(daten.pauschalSatz * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-xl p-4 col-span-2">
            <p className="text-gray-500 mb-1">Kappungsgrenze</p>
            {daten.kappungEvang === null ? (
              <p className="text-red-600 font-medium">Keine Kappung in Bayern</p>
            ) : (
              <>
                <p className="font-medium text-purple-700">
                  Evangelisch: {(daten.kappungEvang * 100).toFixed(2)}% • Katholisch: {(daten.kappungKath! * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {daten.kappungAutomatisch ? '✓ Automatisch von Amts wegen' : '⚠️ Nur auf Antrag'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Kirchensteuer</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Zuschlagsteuer:</strong> Die Kirchensteuer ist ein Zuschlag auf die Einkommensteuer (§51a EStG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Steuersätze:</strong> 8% in Bayern und Baden-Württemberg, 9% in allen anderen Bundesländern</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kinderfreibetrag:</strong> Reduziert die Bemessungsgrundlage – auch wenn Kindergeld gezahlt wird</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kappung:</strong> Begrenzt die Kirchensteuer auf 2,75-4% des zvE (je nach Bundesland/Konfession)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Absetzbar:</strong> Kirchensteuer ist als Sonderausgabe voll von der Steuer absetzbar</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Staatlicher Einzug:</strong> Der Arbeitgeber führt die Kirchensteuer zusammen mit der Lohnsteuer ab</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kappung beantragen:</strong> In BW, Hessen, NRW, RLP und Saarland müssen Sie die Kappung beim Finanzamt beantragen</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kirchenaustritt:</strong> Beendet die Kirchensteuerpflicht ab dem Folgemonat nach Austritt</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kapitalerträge:</strong> Auf Kapitalerträge wird zusätzlich 8/9% Kirchensteuer auf die Abgeltungssteuer erhoben</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Vereinfachte Berechnung:</strong> Die tatsächliche Steuer kann durch Werbungskosten, Sonderausgaben etc. abweichen</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Finanzamt</p>
            <p className="text-sm text-purple-700 mt-1">
              Für die Erhebung der Kirchensteuer und Anträge auf Kappung
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Kirchensteuer-Info</p>
                <a 
                  href="https://www.kirchenfinanzen.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  kirchenfinanzen.de →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🧮</span>
              <div>
                <p className="font-medium text-gray-800">BMF Steuerrechner</p>
                <a 
                  href="https://www.bmf-steuerrechner.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  bmf-steuerrechner.de →
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Kappung beantragen</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Formloser Antrag beim Finanzamt</li>
                <li>• Oder über die Steuererklärung</li>
                <li>• In manchen Bundesländern automatisch</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__51a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 51a EStG – Festsetzung und Erhebung von Zuschlagsteuern
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__10.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 10 EStG – Sonderausgaben (Absetzbarkeit Kirchensteuer)
          </a>
          <a 
            href="https://www.lohn-info.de/kirchensteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Kirchensteuer beim Lohnsteuerabzugsverfahren – lohn-info.de
          </a>
          <a 
            href="https://www.kirchenfinanzen.de/kirchensteuer/kappung.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Kappung der Kirchensteuer – kirchenfinanzen.de
          </a>
          <a 
            href="https://www.bmf-steuerrechner.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF Steuerrechner – Bundesfinanzministerium
          </a>
        </div>
      </div>
    </div>
  );
}
