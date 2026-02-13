import { useState, useMemo } from 'react';

/**
 * SOLIDARITÄTSZUSCHLAG-RECHNER 2025/2026
 * 
 * Berechnung basiert auf:
 * - §3 SolzG 1995 - Bemessungsgrundlage und Freigrenzen
 * - §4 SolzG 1995 - Zuschlagsatz und Milderungszone (11,9%)
 * - Steuerfortentwicklungsgesetz - neue Freigrenzen 2025/2026
 * 
 * Quellen:
 * - https://www.gesetze-im-internet.de/solzg_1995/__3.html
 * - https://www.gesetze-im-internet.de/solzg_1995/__4.html
 * - https://www.bundesfinanzministerium.de/Monatsberichte/Ausgabe/2025/01/Inhalte/Kapitel-2-Fokus/die-wichtigsten-steuerlichen-aenderungen-2025.html
 * - https://www.bmf-steuerrechner.de
 */

// ============================================================================
// OFFIZIELLE WERTE NACH SolzG und Steuerfortentwicklungsgesetz
// ============================================================================

// Freigrenzen gemäß §3 Abs. 3 SolzG (Steuerfortentwicklungsgesetz 2024)
const FREIGRENZEN = {
  2024: { einzeln: 18130, zusammen: 36260 },
  2025: { einzeln: 19950, zusammen: 39900 },
  2026: { einzeln: 20350, zusammen: 40700 },
};

// Zuschlagsatz und Milderungszone gemäß §4 SolzG
const SOLI_SATZ = 0.055; // 5,5%
const MILDERUNGSZONE_SATZ = 0.119; // 11,9%

// Einkommensteuertarif 2026 (§32a EStG)
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

// Kinderfreibetrag 2026 (für zvE-Berechnung)
const KINDERFREIBETRAG_GESAMT = 9756;

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

// ============================================================================
// SOLIDARITÄTSZUSCHLAG BERECHNUNG gemäß §4 SolzG
// ============================================================================
interface SoliBerechnung {
  soli: number;
  zone: 'frei' | 'milderung' | 'voll';
  milderungsFaktor?: number;
}

function berechneSoli(einkommensteuer: number, freigrenze: number): SoliBerechnung {
  if (einkommensteuer <= freigrenze) {
    // Unterhalb Freigrenze: kein Soli
    return { soli: 0, zone: 'frei' };
  }
  
  const unterschied = einkommensteuer - freigrenze;
  const soliFull = einkommensteuer * SOLI_SATZ;
  const soliMilderung = unterschied * MILDERUNGSZONE_SATZ;
  
  if (soliFull <= soliMilderung) {
    // Oberhalb Milderungszone: voller Soli
    return { soli: Math.floor(soliFull * 100) / 100, zone: 'voll' };
  } else {
    // In Milderungszone: reduzierter Soli
    const faktor = (soliMilderung / soliFull) * 100;
    return { 
      soli: Math.floor(soliMilderung * 100) / 100, 
      zone: 'milderung',
      milderungsFaktor: faktor
    };
  }
}

// Berechne Ende der Milderungszone
function berechneMilderungszoneEnde(freigrenze: number): number {
  // 5,5% * ESt = 11,9% * (ESt - Freigrenze)
  // 0.055 * ESt = 0.119 * ESt - 0.119 * Freigrenze
  // 0.119 * Freigrenze = 0.064 * ESt
  // ESt = Freigrenze * 0.119 / 0.064
  return freigrenze * MILDERUNGSZONE_SATZ / (MILDERUNGSZONE_SATZ - SOLI_SATZ);
}

export default function SoliRechner() {
  // Eingabewerte
  const [berechnungsArt, setBerechnungsArt] = useState<'einkommen' | 'steuer'>('einkommen');
  const [jahresBrutto, setJahresBrutto] = useState(80000);
  const [einkommensteuer, setEinkommensteuer] = useState(15000);
  const [verheiratet, setVerheiratet] = useState(false);
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const [jahr, setJahr] = useState<2025 | 2026>(2026);

  const ergebnis = useMemo(() => {
    // Freigrenze für gewähltes Jahr
    const freigrenzen = FREIGRENZEN[jahr];
    const freigrenze = verheiratet ? freigrenzen.zusammen : freigrenzen.einzeln;
    
    let einkommensteuerBetrag: number;
    let zvE: number;
    
    if (berechnungsArt === 'steuer') {
      // Direkte Eingabe der Einkommensteuer
      einkommensteuerBetrag = einkommensteuer;
      zvE = 0; // Nicht bekannt bei direkter Eingabe
    } else {
      // Berechnung aus Bruttoeinkommen
      const werbungskostenPauschale = 1230;
      const sonderausgabenPauschale = 36;
      
      // Kinderfreibeträge
      const kinderfreibetragFaktor = verheiratet ? 1 : 0.5;
      const kinderfreibetragGesamt = anzahlKinder * KINDERFREIBETRAG_GESAMT * kinderfreibetragFaktor;
      
      // zvE berechnen
      zvE = Math.max(0, jahresBrutto - werbungskostenPauschale - sonderausgabenPauschale - kinderfreibetragGesamt);
      
      // Einkommensteuer berechnen
      if (verheiratet) {
        einkommensteuerBetrag = berechneEinkommensteuer(zvE / 2) * 2;
      } else {
        einkommensteuerBetrag = berechneEinkommensteuer(zvE);
      }
    }
    
    // Solidaritätszuschlag berechnen
    const soliErgebnis = berechneSoli(einkommensteuerBetrag, freigrenze);
    
    // Milderungszone-Grenzen
    const milderungszoneEnde = berechneMilderungszoneEnde(freigrenze);
    
    // Steuer ohne Soli zum Vergleich
    const gesamtsteuerOhneSoli = einkommensteuerBetrag;
    const gesamtsteuerMitSoli = einkommensteuerBetrag + soliErgebnis.soli;
    
    // Effektiver Soli-Satz
    const effektiverSoliSatz = einkommensteuerBetrag > 0 
      ? (soliErgebnis.soli / einkommensteuerBetrag) * 100 
      : 0;
    
    // Bei welchem Brutto beginnt der Soli? (Schätzung)
    // Vereinfachte Rückrechnung
    let bruttoSoliStart = 0;
    if (!verheiratet) {
      // Für Singles: ca. 70.000-75.000 € Brutto
      bruttoSoliStart = freigrenze < 20000 ? 68000 : 73000;
    } else {
      // Für Paare: ca. 140.000-150.000 € gemeinsam
      bruttoSoliStart = freigrenze < 40000 ? 136000 : 146000;
    }
    
    return {
      einkommensteuer: einkommensteuerBetrag,
      zvE,
      soli: soliErgebnis.soli,
      soliMonat: soliErgebnis.soli / 12,
      zone: soliErgebnis.zone,
      milderungsFaktor: soliErgebnis.milderungsFaktor,
      freigrenze,
      milderungszoneEnde,
      gesamtsteuerOhneSoli,
      gesamtsteuerMitSoli,
      effektiverSoliSatz,
      bruttoSoliStart,
      vollerSoli: einkommensteuerBetrag * SOLI_SATZ,
      ersparnis: berechnungsArt === 'einkommen' 
        ? (soliErgebnis.zone === 'frei' ? einkommensteuerBetrag * SOLI_SATZ : 0)
        : 0,
    };
  }, [berechnungsArt, jahresBrutto, einkommensteuer, verheiratet, anzahlKinder, jahr]);

  const freigrenzen = FREIGRENZEN[jahr];
  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Jahr */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Steuerjahr</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setJahr(2025)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                jahr === 2025
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              2025
            </button>
            <button
              onClick={() => setJahr(2026)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                jahr === 2026
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              2026
            </button>
          </div>
        </div>

        {/* Berechnungsart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Berechnungsart</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setBerechnungsArt('einkommen')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                berechnungsArt === 'einkommen'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💼 Bruttoeinkommen
            </button>
            <button
              onClick={() => setBerechnungsArt('steuer')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                berechnungsArt === 'steuer'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🧾 Einkommensteuer
            </button>
          </div>
        </div>

        {berechnungsArt === 'einkommen' ? (
          <>
            {/* Jahresbruttoeinkommen */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Jahresbruttoeinkommen</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Gesamtes Bruttoeinkommen (Gehalt, Selbständigkeit, Vermietung etc.)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={jahresBrutto}
                  onChange={(e) => setJahresBrutto(Math.max(0, Number(e.target.value)))}
                  className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none"
                  min="0"
                  max="1000000"
                  step="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Jahr</span>
              </div>
              <input
                type="range"
                value={jahresBrutto}
                onChange={(e) => setJahresBrutto(Number(e.target.value))}
                className="w-full mt-3 accent-yellow-500"
                min="20000"
                max="300000"
                step="1000"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>20.000 €</span>
                <span>150.000 €</span>
                <span>300.000 €</span>
              </div>
            </div>

            {/* Familienstand */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verheiratet}
                  onChange={(e) => setVerheiratet(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-gray-700 font-medium">Verheiratet / Zusammenveranlagung</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-8">
                Freigrenze verdoppelt sich auf {formatEuroRound(freigrenzen.zusammen)}
              </p>
            </div>

            {/* Kinder */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Anzahl Kinder</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Kinderfreibetrag reduziert die Einkommensteuer
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
            </div>
          </>
        ) : (
          <>
            {/* Einkommensteuer direkt */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Festgesetzte Einkommensteuer</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Aus Ihrem Steuerbescheid oder der Steuersimulation
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={einkommensteuer}
                  onChange={(e) => setEinkommensteuer(Math.max(0, Number(e.target.value)))}
                  className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none"
                  min="0"
                  max="500000"
                  step="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Jahr</span>
              </div>
              <input
                type="range"
                value={einkommensteuer}
                onChange={(e) => setEinkommensteuer(Number(e.target.value))}
                className="w-full mt-3 accent-yellow-500"
                min="0"
                max="100000"
                step="500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0 €</span>
                <span>50.000 €</span>
                <span>100.000 €</span>
              </div>
            </div>

            {/* Familienstand bei direkter Eingabe */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verheiratet}
                  onChange={(e) => setVerheiratet(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-gray-700 font-medium">Zusammenveranlagung (Ehepaare)</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-8">
                Beeinflusst die Freigrenze für den Soli
              </p>
            </div>
          </>
        )}
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.zone === 'frei' 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
          : ergebnis.zone === 'milderung'
            ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
            : 'bg-gradient-to-br from-red-500 to-rose-600'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          🇩🇪 Ihr Solidaritätszuschlag {jahr}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.soli)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          <p className="text-white/80 mt-2 text-sm">
            Entspricht <strong>{formatEuro(ergebnis.soliMonat)}</strong> pro Monat
          </p>
        </div>

        {/* Status-Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          ergebnis.zone === 'frei' 
            ? 'bg-white/20' 
            : ergebnis.zone === 'milderung'
              ? 'bg-white/20'
              : 'bg-white/20'
        }`}>
          {ergebnis.zone === 'frei' && (
            <>✅ Kein Soli – unter Freigrenze</>
          )}
          {ergebnis.zone === 'milderung' && (
            <>⚡ Milderungszone – nur {formatProzent(ergebnis.milderungsFaktor || 0)} des vollen Solis</>
          )}
          {ergebnis.zone === 'voll' && (
            <>💰 Voller Soli – 5,5% der Einkommensteuer</>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Einkommensteuer</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.einkommensteuer)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Effektiver Soli-Satz</span>
            <div className="text-xl font-bold">{formatProzent(ergebnis.effektiverSoliSatz)}</div>
          </div>
        </div>
      </div>

      {/* Zonen-Erklärung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Die drei Soli-Zonen {jahr}</h3>
        
        <div className="space-y-3">
          {/* Freie Zone */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            ergebnis.zone === 'frei' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">
                ✅ Freigrenze (kein Soli)
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ergebnis.zone === 'frei' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {ergebnis.zone === 'frei' ? 'Sie sind hier' : ''}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Einkommensteuer bis <strong>{formatEuroRound(ergebnis.freigrenze)}</strong>
              {verheiratet ? ' (Zusammenveranlagung)' : ' (Einzelveranlagung)'}
            </p>
            <p className="text-xs text-green-600 mt-1">
              → Soli = 0 €
            </p>
          </div>

          {/* Milderungszone */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            ergebnis.zone === 'milderung' 
              ? 'border-yellow-500 bg-yellow-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">
                ⚡ Milderungszone (reduzierter Soli)
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ergebnis.zone === 'milderung' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {ergebnis.zone === 'milderung' ? 'Sie sind hier' : ''}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Einkommensteuer von <strong>{formatEuroRound(ergebnis.freigrenze)}</strong> bis <strong>{formatEuroRound(ergebnis.milderungszoneEnde)}</strong>
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              → Soli = max. 11,9% × (ESt − Freigrenze)
            </p>
          </div>

          {/* Volle Zone */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            ergebnis.zone === 'voll' 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">
                💰 Voller Soli (5,5%)
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ergebnis.zone === 'voll' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {ergebnis.zone === 'voll' ? 'Sie sind hier' : ''}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Einkommensteuer über <strong>{formatEuroRound(ergebnis.milderungszoneEnde)}</strong>
            </p>
            <p className="text-xs text-red-600 mt-1">
              → Soli = 5,5% × Einkommensteuer
            </p>
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
          
          {berechnungsArt === 'einkommen' && ergebnis.zvE > 0 && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Jahresbruttoeinkommen</span>
                <span className="font-bold text-gray-900">{formatEuro(jahresBrutto)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Zu versteuerndes Einkommen (geschätzt)</span>
                <span className="font-medium text-gray-900">{formatEuro(ergebnis.zvE)}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">Einkommensteuer (Bemessungsgrundlage)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.einkommensteuer)}</span>
          </div>
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Schritt 2: Prüfung Freigrenze (§3 Abs. 3 SolzG)
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Freigrenze {jahr} ({verheiratet ? 'zusammen' : 'einzeln'})
            </span>
            <span className="font-medium text-gray-900">{formatEuro(ergebnis.freigrenze)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Differenz zur Freigrenze</span>
            <span className={`font-medium ${ergebnis.einkommensteuer > ergebnis.freigrenze ? 'text-red-600' : 'text-green-600'}`}>
              {ergebnis.einkommensteuer > ergebnis.freigrenze 
                ? '+' + formatEuro(ergebnis.einkommensteuer - ergebnis.freigrenze)
                : formatEuro(ergebnis.einkommensteuer - ergebnis.freigrenze)}
            </span>
          </div>
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Schritt 3: Solidaritätszuschlag (§4 SolzG)
          </div>
          
          {ergebnis.zone === 'frei' ? (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Unterhalb Freigrenze</span>
              <span className="font-medium text-green-600">Kein Soli</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Voller Soli (5,5% × ESt)</span>
                <span className="font-medium text-gray-900">{formatEuro(ergebnis.vollerSoli)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Milderungszone (11,9% × Differenz)</span>
                <span className="font-medium text-gray-900">
                  {formatEuro((ergebnis.einkommensteuer - ergebnis.freigrenze) * MILDERUNGSZONE_SATZ)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Angewendete Berechnung</span>
                <span className="font-medium text-gray-900">
                  {ergebnis.zone === 'milderung' ? 'Milderungszone (niedrigerer Wert)' : 'Voller Soli'}
                </span>
              </div>
            </>
          )}
          
          <div className="flex justify-between py-3 bg-yellow-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-yellow-800">Solidaritätszuschlag / Jahr</span>
            <span className="font-bold text-2xl text-yellow-900">{formatEuro(ergebnis.soli)}</span>
          </div>
        </div>
      </div>

      {/* Freigrenzen-Übersicht */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-yellow-800 mb-3">📅 Freigrenzen im Vergleich</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-yellow-200">
                <th className="py-2 text-left font-medium text-yellow-700">Jahr</th>
                <th className="py-2 text-right font-medium text-yellow-700">Einzelveranlagung</th>
                <th className="py-2 text-right font-medium text-yellow-700">Zusammenveranlagung</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-yellow-100">
                <td className="py-2 text-gray-700">2024</td>
                <td className="py-2 text-right">{formatEuroRound(FREIGRENZEN[2024].einzeln)}</td>
                <td className="py-2 text-right">{formatEuroRound(FREIGRENZEN[2024].zusammen)}</td>
              </tr>
              <tr className={`border-b border-yellow-100 ${jahr === 2025 ? 'bg-yellow-100' : ''}`}>
                <td className="py-2 text-gray-700 font-medium">2025</td>
                <td className="py-2 text-right font-medium">{formatEuroRound(FREIGRENZEN[2025].einzeln)}</td>
                <td className="py-2 text-right font-medium">{formatEuroRound(FREIGRENZEN[2025].zusammen)}</td>
              </tr>
              <tr className={`${jahr === 2026 ? 'bg-yellow-100' : ''}`}>
                <td className="py-2 text-gray-700 font-medium">2026</td>
                <td className="py-2 text-right font-medium">{formatEuroRound(FREIGRENZEN[2026].einzeln)}</td>
                <td className="py-2 text-right font-medium">{formatEuroRound(FREIGRENZEN[2026].zusammen)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-yellow-600 mt-3">
          Die Freigrenzen wurden durch das Steuerfortentwicklungsgesetz 2024 deutlich angehoben. 
          Ca. 90% der Steuerzahler zahlen seit 2021 keinen Soli mehr.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert der Solidaritätszuschlag</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Zuschlagsteuer:</strong> Der Soli ist ein Zuschlag auf die Einkommensteuer (Bemessungsgrundlage)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Satz:</strong> 5,5% der Einkommensteuer (§4 SolzG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Freigrenze:</strong> Unterhalb der Freigrenze wird kein Soli erhoben</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Milderungszone:</strong> Soli steigt schrittweise auf max. 11,9% der Differenz zur Freigrenze</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kapitalerträge:</strong> Auf Kapitalerträge (Abgeltungssteuer) wird Soli ohne Freigrenze erhoben</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Körperschaftsteuer:</strong> GmbHs und AGs zahlen Soli auf die Körperschaftsteuer (keine Freigrenze)</span>
          </li>
        </ul>
      </div>

      {/* Wer zahlt noch Soli? */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">💰 Wer zahlt noch Soli?</h3>
        <div className="space-y-4 text-sm">
          <div className="bg-red-50 rounded-xl p-4">
            <p className="font-medium text-red-800 mb-2">Soli zahlen noch:</p>
            <ul className="space-y-1 text-red-700">
              <li>• <strong>Singles</strong> ab ca. 73.000 € Bruttoeinkommen (voller Soli ab ca. 105.000 €)</li>
              <li>• <strong>Paare</strong> (zusammen) ab ca. 146.000 € Bruttoeinkommen</li>
              <li>• <strong>Kapitalanleger</strong> auf alle Kapitalerträge (5,5% auf Abgeltungssteuer)</li>
              <li>• <strong>Unternehmen</strong> (GmbH, AG) auf die Körperschaftsteuer</li>
            </ul>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="font-medium text-green-800 mb-2">Kein Soli mehr für:</p>
            <ul className="space-y-1 text-green-700">
              <li>• Ca. <strong>90% aller Steuerzahler</strong> seit 2021</li>
              <li>• Singles mit Einkommensteuer unter {formatEuroRound(freigrenzen.einzeln)}</li>
              <li>• Paare mit Einkommensteuer unter {formatEuroRound(freigrenzen.zusammen)}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Lohnsteuer:</strong> Der Arbeitgeber berechnet den Soli bereits beim Lohnsteuerabzug</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kapitalerträge:</strong> Banken führen 5,5% Soli auf die Abgeltungssteuer ab (keine Freigrenze!)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Verfassungsmäßigkeit:</strong> Das BVerfG hat den Soli 2020 für verfassungsgemäß erklärt</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Nicht absetzbar:</strong> Der Soli ist keine Sonderausgabe und kann nicht abgesetzt werden</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden & Links</h3>
        <div className="space-y-4">
          <div className="bg-yellow-50 rounded-xl p-4">
            <p className="font-semibold text-yellow-900">Finanzamt</p>
            <p className="text-sm text-yellow-700 mt-1">
              Für die Festsetzung und Erhebung des Solidaritätszuschlags
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📋</span>
              <div>
                <p className="font-medium text-gray-800">ELSTER Online</p>
                <a 
                  href="https://www.elster.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  elster.de →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/solzg_1995/__3.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 3 SolzG 1995 – Bemessungsgrundlage und Freigrenzen
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/solzg_1995/__4.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 4 SolzG 1995 – Zuschlagsatz (5,5% / Milderungszone 11,9%)
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Monatsberichte/Ausgabe/2025/01/Inhalte/Kapitel-2-Fokus/die-wichtigsten-steuerlichen-aenderungen-2025.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Steuerliche Änderungen 2025 (neue Freigrenzen)
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
