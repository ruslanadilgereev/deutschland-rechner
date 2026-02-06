import { useState, useMemo } from 'react';

// Antriebsart für unterschiedliche Besteuerung
type Antriebsart = 'verbrenner' | 'hybrid' | 'elektro';

// 1%-Regelung Faktoren 2025
// - Verbrenner: 1% des Bruttolistenpreises
// - Plug-in-Hybrid (>60km E-Reichweite oder <50g CO2/km): 0,5%
// - Elektro bis 70.000€ BLP: 0,25%
// - Elektro über 70.000€ BLP: 0,5%
const getProzentFaktor = (antrieb: Antriebsart, bruttolistenpreis: number): number => {
  switch (antrieb) {
    case 'elektro':
      return bruttolistenpreis <= 70000 ? 0.25 : 0.5;
    case 'hybrid':
      return 0.5;
    case 'verbrenner':
    default:
      return 1.0;
  }
};

// Faktor für Fahrten Wohnung-Arbeit
const FAKTOR_WOHNUNG_ARBEIT = 0.03; // 0,03% pro km einfache Strecke
const FAKTOR_WOHNUNG_ARBEIT_ELEKTRO_GUENSTIG = 0.0075; // 0,0075% für E-Autos bis 70k
const FAKTOR_WOHNUNG_ARBEIT_ELEKTRO_HYBRID = 0.015; // 0,015% für Hybrid/E-Auto >70k

const getFaktorWohnungArbeit = (antrieb: Antriebsart, bruttolistenpreis: number): number => {
  switch (antrieb) {
    case 'elektro':
      return bruttolistenpreis <= 70000 ? FAKTOR_WOHNUNG_ARBEIT_ELEKTRO_GUENSTIG : FAKTOR_WOHNUNG_ARBEIT_ELEKTRO_HYBRID;
    case 'hybrid':
      return FAKTOR_WOHNUNG_ARBEIT_ELEKTRO_HYBRID;
    case 'verbrenner':
    default:
      return FAKTOR_WOHNUNG_ARBEIT;
  }
};

// Steuersätze
const STEUERSAETZE = [
  { label: '14% (bis ~17.000€)', value: 0.14 },
  { label: '24% (bis ~30.000€)', value: 0.24 },
  { label: '33% (bis ~60.000€)', value: 0.33 },
  { label: '42% (bis ~277.000€)', value: 0.42 },
  { label: '45% (über 277.000€)', value: 0.45 },
];

// Arbeitstage
const ARBEITSTAGE_MONAT = 15; // Pauschale bei 0,03%-Regelung: 15 Tage angenommen
const ARBEITSTAGE_JAHR_DEFAULT = 220;

export default function FirmenwagenRechner() {
  const [bruttolistenpreis, setBruttolistenpreis] = useState(45000);
  const [antrieb, setAntrieb] = useState<Antriebsart>('verbrenner');
  const [entfernungKm, setEntfernungKm] = useState(25);
  const [fahrtenProMonat, setFahrtenProMonat] = useState(20);
  const [steuersatz, setSteuersatz] = useState(0.33);
  const [nutzungPrivat, setNutzungPrivat] = useState(true);
  const [sonderausstattung, setSonderausstattung] = useState(0);
  
  // Für Fahrtenbuch-Vergleich
  const [tatsaechlicheKostenJahr, setTatsaechlicheKostenJahr] = useState(8000);
  const [privatKmAnteil, setPrivatKmAnteil] = useState(30);

  const ergebnis = useMemo(() => {
    const gesamtBLP = bruttolistenpreis + sonderausstattung;
    // BLP wird auf volle 100€ abgerundet
    const blpGerundet = Math.floor(gesamtBLP / 100) * 100;
    
    const prozentFaktor = getProzentFaktor(antrieb, gesamtBLP);
    const faktorWohnungArbeit = getFaktorWohnungArbeit(antrieb, gesamtBLP);
    
    // 1%-Regelung: Geldwerter Vorteil für Privatnutzung
    const geldwerterVorteilPrivat = blpGerundet * (prozentFaktor / 100);
    
    // 0,03%-Regelung: Geldwerter Vorteil für Fahrten Wohnung-Arbeit
    const geldwerterVorteilWohnungArbeit = blpGerundet * (faktorWohnungArbeit / 100) * entfernungKm;
    
    // Einzelbewertung als Alternative (0,002% pro km pro Fahrt)
    // Günstiger wenn <15 Fahrten pro Monat
    const einzelbewertungProFahrt = blpGerundet * (prozentFaktor / 100 / 30) * entfernungKm;
    const einzelbewertungMonat = einzelbewertungProFahrt * fahrtenProMonat;
    
    // Welche Methode ist günstiger?
    const guenstigerWohnungArbeit = einzelbewertungMonat < geldwerterVorteilWohnungArbeit 
      ? 'einzelbewertung' 
      : 'pauschal';
    const ersparnisBeiEinzelbewertung = geldwerterVorteilWohnungArbeit - einzelbewertungMonat;
    
    // Gesamter geldwerter Vorteil pro Monat
    const geldwerterVorteilMonatPauschal = (nutzungPrivat ? geldwerterVorteilPrivat : 0) + geldwerterVorteilWohnungArbeit;
    const geldwerterVorteilMonatOptimal = (nutzungPrivat ? geldwerterVorteilPrivat : 0) + 
      (guenstigerWohnungArbeit === 'einzelbewertung' ? einzelbewertungMonat : geldwerterVorteilWohnungArbeit);
    
    // Steuerbelastung
    const steuerMonatPauschal = geldwerterVorteilMonatPauschal * steuersatz;
    const steuerMonatOptimal = geldwerterVorteilMonatOptimal * steuersatz;
    const steuerJahrPauschal = steuerMonatPauschal * 12;
    const steuerJahrOptimal = steuerMonatOptimal * 12;
    
    // Sozialversicherung (ca. 20% AN-Anteil bis BBG)
    const svAnteil = 0.20;
    const svMonat = geldwerterVorteilMonatOptimal * svAnteil;
    const svJahr = svMonat * 12;
    
    // Gesamtbelastung
    const gesamtbelastungMonat = steuerMonatOptimal + svMonat;
    const gesamtbelastungJahr = steuerJahrOptimal + svJahr;
    
    // Fahrtenbuch-Alternative
    const fahrtenbuchGeldwerterVorteil = (tatsaechlicheKostenJahr * privatKmAnteil) / 100;
    const fahrtenbuchSteuerJahr = fahrtenbuchGeldwerterVorteil * steuersatz;
    const fahrtenbuchGesamt = fahrtenbuchSteuerJahr + (fahrtenbuchGeldwerterVorteil * svAnteil);
    
    // Vergleich: Was ist günstiger?
    const einprozenRegelungGesamt = gesamtbelastungJahr;
    const fahrtenbuchVorteil = einprozenRegelungGesamt - fahrtenbuchGesamt;
    const empfehlung = fahrtenbuchVorteil > 500 ? 'fahrtenbuch' : 
                       fahrtenbuchVorteil < -500 ? '1prozent' : 'gleich';
    
    return {
      // Grunddaten
      blpGerundet,
      prozentFaktor,
      faktorWohnungArbeit: faktorWohnungArbeit * 100,
      
      // Geldwerter Vorteil
      geldwerterVorteilPrivat,
      geldwerterVorteilWohnungArbeit,
      einzelbewertungMonat,
      
      // Optimierung
      guenstigerWohnungArbeit,
      ersparnisBeiEinzelbewertung,
      
      // Gesamtsummen
      geldwerterVorteilMonatPauschal,
      geldwerterVorteilMonatOptimal,
      geldwerterVorteilJahr: geldwerterVorteilMonatOptimal * 12,
      
      // Steuer
      steuerMonatPauschal,
      steuerMonatOptimal,
      steuerJahrPauschal,
      steuerJahrOptimal,
      
      // SV
      svMonat,
      svJahr,
      
      // Gesamt
      gesamtbelastungMonat,
      gesamtbelastungJahr,
      
      // Fahrtenbuch
      fahrtenbuchGeldwerterVorteil,
      fahrtenbuchSteuerJahr,
      fahrtenbuchGesamt,
      fahrtenbuchVorteil,
      empfehlung,
    };
  }, [bruttolistenpreis, antrieb, entfernungKm, fahrtenProMonat, steuersatz, nutzungPrivat, sonderausstattung, tatsaechlicheKostenJahr, privatKmAnteil]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bruttolistenpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bruttolistenpreis (BLP)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Listenpreis inkl. MwSt. zum Zeitpunkt der Erstzulassung
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttolistenpreis}
              onChange={(e) => setBruttolistenpreis(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
              min="0"
              max="500000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
          </div>
          <input
            type="range"
            value={bruttolistenpreis}
            onChange={(e) => setBruttolistenpreis(Number(e.target.value))}
            className="w-full mt-2 accent-blue-500"
            min="10000"
            max="150000"
            step="1000"
          />
        </div>

        {/* Sonderausstattung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Sonderausstattung</span>
            <span className="text-xs text-gray-500 block mt-1">
              Aufpreis für Extras (Navigation, Ledersitze, etc.)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={sonderausstattung}
              onChange={(e) => setSonderausstattung(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              min="0"
              max="100000"
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
          </div>
        </div>

        {/* Antriebsart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Antriebsart</span>
            <span className="text-xs text-gray-500 block mt-1">
              Elektro- & Hybridautos werden steuerlich begünstigt
            </span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setAntrieb('verbrenner')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                antrieb === 'verbrenner'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">⛽</span>
              <span className="block text-sm mt-1">Verbrenner</span>
              <span className="block text-xs opacity-70">1,0%</span>
            </button>
            <button
              onClick={() => setAntrieb('hybrid')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                antrieb === 'hybrid'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">🔋</span>
              <span className="block text-sm mt-1">Plug-in-Hybrid</span>
              <span className="block text-xs opacity-70">0,5%</span>
            </button>
            <button
              onClick={() => setAntrieb('elektro')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                antrieb === 'elektro'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">⚡</span>
              <span className="block text-sm mt-1">Elektro</span>
              <span className="block text-xs opacity-70">{bruttolistenpreis + sonderausstattung <= 70000 ? '0,25%' : '0,5%'}</span>
            </button>
          </div>
          
          {antrieb === 'elektro' && bruttolistenpreis + sonderausstattung > 70000 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              💡 Bei BLP über 70.000€ gilt 0,5% statt 0,25%
            </div>
          )}
        </div>

        {/* Privatnutzung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Private Nutzung?</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setNutzungPrivat(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                nutzungPrivat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ja (1%-Regelung)
            </button>
            <button
              onClick={() => setNutzungPrivat(false)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !nutzungPrivat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nein (nur dienstlich)
            </button>
          </div>
        </div>

        {/* Entfernung Wohnung-Arbeit */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Entfernung Wohnung – Arbeit</span>
            <span className="text-xs text-gray-500 block mt-1">
              Einfache Strecke in Kilometern
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={entfernungKm}
              onChange={(e) => setEntfernungKm(Number(e.target.value))}
              className="w-32 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-lg text-center"
              min="0"
              max="200"
            />
            <span className="text-gray-500">km</span>
            <input
              type="range"
              value={entfernungKm}
              onChange={(e) => setEntfernungKm(Number(e.target.value))}
              className="flex-1 accent-blue-500"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Fahrten pro Monat */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrten zur Arbeit pro Monat</span>
            <span className="text-xs text-gray-500 block mt-1">
              Bei weniger als 15 Fahrten kann Einzelbewertung günstiger sein
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={fahrtenProMonat}
              onChange={(e) => setFahrtenProMonat(Number(e.target.value))}
              className="w-32 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-lg text-center"
              min="0"
              max="30"
            />
            <span className="text-gray-500">Tage</span>
          </div>
          {fahrtenProMonat < 15 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              ✓ Einzelbewertung (0,002% pro km/Fahrt) kann günstiger sein als 0,03%-Pauschale
            </div>
          )}
        </div>

        {/* Steuersatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ihr Grenzsteuersatz</span>
            <span className="text-xs text-gray-500 block mt-1">
              Geschätzter persönlicher Steuersatz
            </span>
          </label>
          <select
            value={steuersatz}
            onChange={(e) => setSteuersatz(Number(e.target.value))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500"
          >
            {STEUERSAETZE.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🚗 Ihre monatliche Belastung (1%-Regelung)</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.gesamtbelastungMonat)}</span>
            <span className="text-xl opacity-80">pro Monat</span>
          </div>
          <p className="text-blue-100 mt-2 text-sm">
            {ergebnis.prozentFaktor}%-Regelung • BLP {formatEuroRound(ergebnis.blpGerundet)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Geldwerter Vorteil</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.geldwerterVorteilMonatOptimal)}</div>
            <span className="text-xs text-blue-200">versteuern Sie</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Steuerlast</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.steuerMonatOptimal)}</div>
            <span className="text-xs text-blue-200">+ SV ~{formatEuroRound(ergebnis.svMonat)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {nutzungPrivat && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-xs opacity-80">Privatnutzung ({ergebnis.prozentFaktor}%)</span>
              <div className="text-lg font-bold">{formatEuroRound(ergebnis.geldwerterVorteilPrivat)}</div>
            </div>
          )}
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-xs opacity-80">Arbeitsweg ({ergebnis.faktorWohnungArbeit.toFixed(3)}%)</span>
            <div className="text-lg font-bold">
              {formatEuroRound(ergebnis.guenstigerWohnungArbeit === 'einzelbewertung' 
                ? ergebnis.einzelbewertungMonat 
                : ergebnis.geldwerterVorteilWohnungArbeit)}
            </div>
          </div>
        </div>
      </div>

      {/* Jahresübersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📅 Jahresübersicht 1%-Regelung</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Bruttolistenpreis (gerundet)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.blpGerundet)}</span>
          </div>
          
          {nutzungPrivat && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                Privatnutzung ({ergebnis.prozentFaktor}% × 12)
              </span>
              <span className="text-gray-900">{formatEuro(ergebnis.geldwerterVorteilPrivat * 12)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Fahrten Wohnung-Arbeit ({entfernungKm} km)
              {ergebnis.guenstigerWohnungArbeit === 'einzelbewertung' && (
                <span className="text-green-600 text-xs block">✓ Einzelbewertung günstiger</span>
              )}
            </span>
            <span className="text-gray-900">
              {formatEuro(
                (ergebnis.guenstigerWohnungArbeit === 'einzelbewertung' 
                  ? ergebnis.einzelbewertungMonat 
                  : ergebnis.geldwerterVorteilWohnungArbeit) * 12
              )}
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 bg-blue-50 -mx-6 px-6">
            <span className="font-medium text-blue-800">Geldwerter Vorteil / Jahr</span>
            <span className="font-bold text-blue-900">{formatEuro(ergebnis.geldwerterVorteilJahr)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Einkommensteuer ({(steuersatz * 100).toFixed(0)}%)</span>
            <span className="text-red-600 font-medium">{formatEuro(ergebnis.steuerJahrOptimal)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Sozialversicherung (~20%)</span>
            <span className="text-red-600 font-medium">{formatEuro(ergebnis.svJahr)}</span>
          </div>
          
          <div className="flex justify-between py-3 bg-red-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-red-800">Ihre Gesamtbelastung / Jahr</span>
            <span className="font-bold text-2xl text-red-900">{formatEuroRound(ergebnis.gesamtbelastungJahr)}</span>
          </div>
        </div>
      </div>

      {/* Optimierungs-Hinweis */}
      {ergebnis.ersparnisBeiEinzelbewertung > 0 && fahrtenProMonat < 15 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-green-800 mb-3">💡 Optimierungs-Tipp: Einzelbewertung</h3>
          <div className="text-sm text-green-700">
            <p className="mb-3">
              Bei nur <strong>{fahrtenProMonat} Fahrten/Monat</strong> zur Arbeit ist die Einzelbewertung 
              günstiger als die 0,03%-Pauschale:
            </p>
            <div className="bg-white/50 rounded-xl p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-green-600">0,03%-Pauschale</span>
                <p className="font-bold text-green-900">{formatEuro(ergebnis.geldwerterVorteilWohnungArbeit)}/Monat</p>
              </div>
              <div>
                <span className="text-xs text-green-600">Einzelbewertung</span>
                <p className="font-bold text-green-900">{formatEuro(ergebnis.einzelbewertungMonat)}/Monat</p>
              </div>
            </div>
            <p className="mt-3 font-medium">
              ✓ Sie sparen: <span className="text-green-900 font-bold">{formatEuro(ergebnis.ersparnisBeiEinzelbewertung * 12)}</span> pro Jahr
            </p>
          </div>
        </div>
      )}

      {/* Fahrtenbuch-Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Alternative: Fahrtenbuch</h3>
        <p className="text-sm text-gray-600 mb-4">
          Mit einem Fahrtenbuch versteuern Sie nur die tatsächliche private Nutzung. 
          Geben Sie die geschätzten Werte ein:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tatsächliche Kosten/Jahr</label>
            <div className="relative">
              <input
                type="number"
                value={tatsaechlicheKostenJahr}
                onChange={(e) => setTatsaechlicheKostenJahr(Number(e.target.value))}
                className="w-full p-3 pr-10 border-2 border-gray-200 rounded-xl"
                min="0"
                step="500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <span className="text-xs text-gray-500">Leasing, Versicherung, Sprit, etc.</span>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Privater Km-Anteil</label>
            <div className="relative">
              <input
                type="number"
                value={privatKmAnteil}
                onChange={(e) => setPrivatKmAnteil(Number(e.target.value))}
                className="w-full p-3 pr-10 border-2 border-gray-200 rounded-xl"
                min="0"
                max="100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <span className="text-xs text-gray-500">inkl. Fahrten Wohnung-Arbeit</span>
          </div>
        </div>
        
        <div className={`p-4 rounded-xl ${
          ergebnis.empfehlung === 'fahrtenbuch' ? 'bg-green-100 border-2 border-green-300' :
          ergebnis.empfehlung === '1prozent' ? 'bg-blue-100 border-2 border-blue-300' :
          'bg-gray-100'
        }`}>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="text-sm text-gray-600">1%-Regelung</span>
              <p className="text-xl font-bold text-gray-900">{formatEuroRound(ergebnis.gesamtbelastungJahr)}/Jahr</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Fahrtenbuch</span>
              <p className="text-xl font-bold text-gray-900">{formatEuroRound(ergebnis.fahrtenbuchGesamt)}/Jahr</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-300 text-center">
            {ergebnis.empfehlung === 'fahrtenbuch' && (
              <p className="text-green-800 font-medium">
                ✓ Fahrtenbuch spart <span className="font-bold">{formatEuroRound(ergebnis.fahrtenbuchVorteil)}</span>/Jahr
              </p>
            )}
            {ergebnis.empfehlung === '1prozent' && (
              <p className="text-blue-800 font-medium">
                ✓ 1%-Regelung spart <span className="font-bold">{formatEuroRound(-ergebnis.fahrtenbuchVorteil)}</span>/Jahr
              </p>
            )}
            {ergebnis.empfehlung === 'gleich' && (
              <p className="text-gray-800 font-medium">
                ≈ Beide Methoden sind etwa gleich
              </p>
            )}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          ⚠️ Fahrtenbuch erfordert lückenlose, zeitnahe Dokumentation aller Fahrten
        </p>
      </div>

      {/* Elektroauto-Vorteil */}
      {antrieb === 'verbrenner' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-emerald-800 mb-3">⚡ Tipp: Elektroauto-Vorteil</h3>
          <div className="text-sm text-emerald-700">
            <p className="mb-3">
              Mit einem <strong>Elektroauto bis 70.000€ BLP</strong> würden Sie nur 0,25% statt 1% versteuern:
            </p>
            <div className="bg-white/50 rounded-xl p-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-emerald-600">Ihr Verbrenner</span>
                <p className="font-bold text-emerald-900">{formatEuro(ergebnis.geldwerterVorteilPrivat)}/Monat</p>
              </div>
              <div>
                <span className="text-xs text-emerald-600">Elektroauto (0,25%)</span>
                <p className="font-bold text-emerald-900">{formatEuro(ergebnis.blpGerundet * 0.0025)}/Monat</p>
              </div>
            </div>
            <p className="mt-3 font-medium">
              Ersparnis: bis zu <span className="text-emerald-900 font-bold">75%</span> weniger geldwerter Vorteil!
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die 1%-Regelung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Grundlage:</strong> Der Bruttolistenpreis (BLP) zum Zeitpunkt der Erstzulassung, auf volle 100€ abgerundet</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Privatnutzung:</strong> 1% des BLP monatlich als geldwerter Vorteil (0,5% bei Hybrid, 0,25% bei E-Auto bis 70k€)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Arbeitsweg:</strong> Zusätzlich 0,03% des BLP pro km einfache Entfernung (pauschal) ODER Einzelbewertung</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Einzelbewertung:</strong> 0,002% pro km pro Fahrt – günstiger bei weniger als 15 Fahrten/Monat</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Versteuerung:</strong> Der geldwerte Vorteil wird zum Bruttolohn addiert und normal versteuert</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Sozialversicherung:</strong> Auch SV-Beiträge fallen auf den geldwerten Vorteil an (bis zur BBG)</span>
          </li>
        </ul>
      </div>

      {/* E-Auto Staffelung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Besteuerung nach Antriebsart 2025</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Antrieb</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Privatnutzung</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Arbeitsweg</th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b border-gray-100 ${antrieb === 'verbrenner' ? 'bg-blue-50' : ''}`}>
                <td className="py-3 px-4 text-gray-600">⛽ Verbrenner</td>
                <td className="py-3 px-4 text-center font-bold">1,0%</td>
                <td className="py-3 px-4 text-center">0,03%/km</td>
              </tr>
              <tr className={`border-b border-gray-100 ${antrieb === 'hybrid' ? 'bg-blue-50' : ''}`}>
                <td className="py-3 px-4 text-gray-600">
                  🔋 Plug-in-Hybrid
                  <span className="text-xs text-gray-400 block">(≥60km E-Reichweite oder ≤50g CO2/km)</span>
                </td>
                <td className="py-3 px-4 text-center font-bold text-green-600">0,5%</td>
                <td className="py-3 px-4 text-center text-green-600">0,015%/km</td>
              </tr>
              <tr className={`border-b border-gray-100 ${antrieb === 'elektro' && bruttolistenpreis + sonderausstattung <= 70000 ? 'bg-blue-50' : ''}`}>
                <td className="py-3 px-4 text-gray-600">
                  ⚡ Elektro bis 70.000€
                </td>
                <td className="py-3 px-4 text-center font-bold text-green-600">0,25%</td>
                <td className="py-3 px-4 text-center text-green-600">0,0075%/km</td>
              </tr>
              <tr className={`${antrieb === 'elektro' && bruttolistenpreis + sonderausstattung > 70000 ? 'bg-blue-50' : ''}`}>
                <td className="py-3 px-4 text-gray-600">⚡ Elektro über 70.000€</td>
                <td className="py-3 px-4 text-center font-bold text-green-600">0,5%</td>
                <td className="py-3 px-4 text-center text-green-600">0,015%/km</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Stand: 2025. Die 70.000€-Grenze für E-Autos wurde Ende 2023 von 60.000€ angehoben.
        </p>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Sonderausstattung:</strong> Alle Extras (Navigation, Ledersitze, etc.) erhöhen den BLP</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Gebrauchtwagen:</strong> Es zählt immer der BLP bei Erstzulassung, nicht der Kaufpreis</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Ladestation:</strong> Kostenlose Stromladung beim Arbeitgeber ist steuerfrei</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Zuzahlung:</strong> Eigene Zuzahlungen (z.B. für Extras) mindern den geldwerten Vorteil</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Fahrtenbuch:</strong> Muss zeitnah, lückenlos und manipulationssicher geführt werden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Wechsel:</strong> Zwischen 1%-Regelung und Fahrtenbuch kann nur zum Jahreswechsel gewechselt werden</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stellen</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Lohnabrechnung durch Arbeitgeber</p>
            <p className="text-sm text-blue-700 mt-1">
              Die 1%-Regelung wird vom Arbeitgeber in der monatlichen Gehaltsabrechnung berücksichtigt. 
              Der geldwerte Vorteil wird zum Bruttolohn addiert.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Ihr Finanzamt</p>
                <p className="text-gray-600">Für Steuerfragen & Fahrtenbuch-Prüfung</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">BMF-Infos</p>
                <a 
                  href="https://www.bundesfinanzministerium.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  bundesfinanzministerium.de →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__6.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 6 EStG – Bewertung von Wirtschaftsgütern
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__8.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 8 EStG – Einnahmen (geldwerter Vorteil)
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Content/DE/BMF_Schreiben/Steuerarten/Lohnsteuer/2023-12-15-steuerliche-behandlung-der-ueberlassung-eines-betrieblichen-kraftfahrzeugs.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF-Schreiben zur steuerlichen Behandlung von Firmenwagen
          </a>
          <a 
            href="https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/firmenfahrzeuge/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Firmenwagen versteuern
          </a>
        </div>
      </div>
    </div>
  );
}
