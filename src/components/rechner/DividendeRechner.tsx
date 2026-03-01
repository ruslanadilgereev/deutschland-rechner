import { useState, useMemo } from 'react';

// Abgeltungsteuer 2026 – 25% + 5,5% Soli = 26,375%
const ABGELTUNGSTEUER_SATZ = 0.25;
const SOLI_SATZ = 0.055;
const GESAMT_STEUERSATZ = ABGELTUNGSTEUER_SATZ * (1 + SOLI_SATZ); // 26,375%

// Sparerpauschbetrag 2026
const SPARERPAUSCHBETRAG = {
  single: 1000,
  verheiratet: 2000,
};

// Kirchensteuer-Sätze
const KIRCHENSTEUER_SAETZE = [
  { wert: 0, label: 'Keine Kirchensteuer', faktor: 0 },
  { wert: 0.08, label: '8% (Bayern, Baden-Württemberg)', faktor: 0.08 },
  { wert: 0.09, label: '9% (alle anderen Bundesländer)', faktor: 0.09 },
];

// Quellensteuer nach Land - typische Sätze
const QUELLENSTEUER_LAENDER = [
  { land: 'de', name: '🇩🇪 Deutschland', quellensteuer: 0, anrechenbar: 0, erstattbar: 0 },
  { land: 'us', name: '🇺🇸 USA', quellensteuer: 0.15, anrechenbar: 0.15, erstattbar: 0, hinweis: 'Mit W-8BEN Formular (sonst 30%)' },
  { land: 'ch', name: '🇨🇭 Schweiz', quellensteuer: 0.35, anrechenbar: 0.15, erstattbar: 0.20, hinweis: 'Erstattung über Schweizer Steuerverwaltung' },
  { land: 'fr', name: '🇫🇷 Frankreich', quellensteuer: 0.2533, anrechenbar: 0.15, erstattbar: 0.1033, hinweis: 'Vorabbefreiung möglich' },
  { land: 'nl', name: '🇳🇱 Niederlande', quellensteuer: 0.15, anrechenbar: 0.15, erstattbar: 0 },
  { land: 'gb', name: '🇬🇧 Großbritannien', quellensteuer: 0, anrechenbar: 0, erstattbar: 0, hinweis: 'Keine Quellensteuer auf Dividenden' },
  { land: 'ie', name: '🇮🇪 Irland', quellensteuer: 0, anrechenbar: 0, erstattbar: 0, hinweis: 'Keine Quellensteuer auf Dividenden' },
  { land: 'at', name: '🇦🇹 Österreich', quellensteuer: 0.275, anrechenbar: 0.15, erstattbar: 0.125 },
  { land: 'it', name: '🇮🇹 Italien', quellensteuer: 0.26, anrechenbar: 0.15, erstattbar: 0.11 },
  { land: 'es', name: '🇪🇸 Spanien', quellensteuer: 0.19, anrechenbar: 0.15, erstattbar: 0.04 },
  { land: 'dk', name: '🇩🇰 Dänemark', quellensteuer: 0.27, anrechenbar: 0.15, erstattbar: 0.12 },
  { land: 'no', name: '🇳🇴 Norwegen', quellensteuer: 0.25, anrechenbar: 0.15, erstattbar: 0.10 },
  { land: 'se', name: '🇸🇪 Schweden', quellensteuer: 0.30, anrechenbar: 0.15, erstattbar: 0.15 },
  { land: 'fi', name: '🇫🇮 Finnland', quellensteuer: 0.35, anrechenbar: 0.15, erstattbar: 0.20 },
  { land: 'ca', name: '🇨🇦 Kanada', quellensteuer: 0.15, anrechenbar: 0.15, erstattbar: 0, hinweis: 'Mit DBA-Bescheinigung' },
  { land: 'au', name: '🇦🇺 Australien', quellensteuer: 0, anrechenbar: 0, erstattbar: 0, hinweis: 'Keine Quellensteuer (Franking Credits)' },
  { land: 'custom', name: '✏️ Manuell eingeben', quellensteuer: 0, anrechenbar: 0, erstattbar: 0 },
];

export default function DividendeRechner() {
  // Dividende
  const [bruttoDividende, setBruttoDividende] = useState(1000);
  
  // Land & Quellensteuer
  const [selectedLand, setSelectedLand] = useState('us');
  const [customQuellensteuer, setCustomQuellensteuer] = useState(15);
  const [customAnrechenbar, setCustomAnrechenbar] = useState(15);
  
  // Persönliche Situation
  const [verheiratet, setVerheiratet] = useState(false);
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0);
  const [freistellungsauftrag, setFreistellungsauftrag] = useState(0);
  const [genutzterFreibetrag, setGenutzterFreibetrag] = useState(0);
  
  const sparerpauschbetrag = verheiratet ? SPARERPAUSCHBETRAG.verheiratet : SPARERPAUSCHBETRAG.single;
  const landInfo = QUELLENSTEUER_LAENDER.find(l => l.land === selectedLand) || QUELLENSTEUER_LAENDER[0];
  
  // Bei manueller Eingabe die Custom-Werte verwenden
  const quellensteuerSatz = selectedLand === 'custom' 
    ? customQuellensteuer / 100 
    : landInfo.quellensteuer;
  const anrechenbareQuellensteuerSatz = selectedLand === 'custom'
    ? Math.min(customAnrechenbar / 100, 0.15) // Max 15% anrechenbar
    : landInfo.anrechenbar;
  const erstattbareSatz = selectedLand === 'custom'
    ? Math.max(0, customQuellensteuer / 100 - Math.min(customAnrechenbar / 100, 0.15))
    : landInfo.erstattbar;

  const ergebnis = useMemo(() => {
    // 1. Quellensteuer berechnen
    const quellensteuerBetrag = bruttoDividende * quellensteuerSatz;
    const nachQuellensteuer = bruttoDividende - quellensteuerBetrag;
    
    // 2. Anrechenbare Quellensteuer (max. 15% nach DBA)
    const anrechenbareQuellensteuer = bruttoDividende * anrechenbareQuellensteuerSatz;
    const erstattbareQuellensteuer = quellensteuerBetrag - anrechenbareQuellensteuer;
    
    // 3. Sparerpauschbetrag berechnen
    const verfuegbarerFreibetrag = Math.max(0, sparerpauschbetrag - genutzterFreibetrag);
    const genutzterSparerpauschbetrag = Math.min(verfuegbarerFreibetrag, bruttoDividende);
    const steuerpflichtig = Math.max(0, bruttoDividende - genutzterSparerpauschbetrag);
    
    // 4. Deutsche Abgeltungsteuer berechnen
    // Bei Kirchensteuer: ermäßigter Satz
    let abgeltungsteuer: number;
    let soli: number;
    let kirchensteuer: number;
    
    if (kirchensteuerSatz > 0) {
      // Ermäßigte Abgeltungsteuer bei Kirchensteuer: 25% / (1 + KiSt-Satz)
      const modifizierterSatz = ABGELTUNGSTEUER_SATZ / (1 + kirchensteuerSatz);
      abgeltungsteuer = steuerpflichtig * modifizierterSatz;
      kirchensteuer = abgeltungsteuer * kirchensteuerSatz;
      soli = abgeltungsteuer * SOLI_SATZ;
    } else {
      abgeltungsteuer = steuerpflichtig * ABGELTUNGSTEUER_SATZ;
      soli = abgeltungsteuer * SOLI_SATZ;
      kirchensteuer = 0;
    }
    
    // 5. Anrechnung der Quellensteuer
    // Quellensteuer wird auf deutsche Abgeltungsteuer angerechnet (nicht auf Soli/KiSt)
    const anrechnung = Math.min(anrechenbareQuellensteuer, abgeltungsteuer);
    const effektiveAbgeltungsteuer = abgeltungsteuer - anrechnung;
    
    // 6. Gesamtsteuer
    const deutscheSteuerGesamt = effektiveAbgeltungsteuer + soli + kirchensteuer;
    const steuerGesamt = quellensteuerBetrag + deutscheSteuerGesamt;
    
    // 7. Netto-Dividende
    const nettoDividende = bruttoDividende - steuerGesamt;
    const nettoMitErstattung = nettoDividende + erstattbareQuellensteuer;
    
    // 8. Effektiver Steuersatz
    const effektiverSteuersatz = bruttoDividende > 0 
      ? (steuerGesamt / bruttoDividende) * 100 
      : 0;
    const effektiverSatzMitErstattung = bruttoDividende > 0
      ? ((steuerGesamt - erstattbareQuellensteuer) / bruttoDividende) * 100
      : 0;
    
    // 9. Vergleich: Was wäre ohne Quellensteuer-Anrechnung?
    const ohneAnrechnungSteuer = quellensteuerBetrag + (steuerpflichtig * GESAMT_STEUERSATZ);
    const ersparnisDurchAnrechnung = Math.max(0, ohneAnrechnungSteuer - steuerGesamt);

    return {
      bruttoDividende,
      quellensteuerBetrag: Math.round(quellensteuerBetrag * 100) / 100,
      nachQuellensteuer: Math.round(nachQuellensteuer * 100) / 100,
      anrechenbareQuellensteuer: Math.round(anrechenbareQuellensteuer * 100) / 100,
      erstattbareQuellensteuer: Math.round(erstattbareQuellensteuer * 100) / 100,
      sparerpauschbetrag: genutzterSparerpauschbetrag,
      steuerpflichtig: Math.round(steuerpflichtig * 100) / 100,
      abgeltungsteuer: Math.round(abgeltungsteuer * 100) / 100,
      anrechnung: Math.round(anrechnung * 100) / 100,
      effektiveAbgeltungsteuer: Math.round(effektiveAbgeltungsteuer * 100) / 100,
      soli: Math.round(soli * 100) / 100,
      kirchensteuer: Math.round(kirchensteuer * 100) / 100,
      deutscheSteuerGesamt: Math.round(deutscheSteuerGesamt * 100) / 100,
      steuerGesamt: Math.round(steuerGesamt * 100) / 100,
      nettoDividende: Math.round(nettoDividende * 100) / 100,
      nettoMitErstattung: Math.round(nettoMitErstattung * 100) / 100,
      effektiverSteuersatz,
      effektiverSatzMitErstattung,
      ersparnisDurchAnrechnung: Math.round(ersparnisDurchAnrechnung * 100) / 100,
    };
  }, [
    bruttoDividende, selectedLand, quellensteuerSatz, anrechenbareQuellensteuerSatz,
    erstattbareSatz, verheiratet, kirchensteuerSatz, genutzterFreibetrag, sparerpauschbetrag
  ]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) => n.toFixed(2).replace('.', ',') + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Brutto-Dividende */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💵</span> Brutto-Dividende
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dividende vor Steuern
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttoDividende}
              onChange={(e) => setBruttoDividende(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <input
            type="range"
            min="0"
            max="50000"
            step="100"
            value={bruttoDividende}
            onChange={(e) => setBruttoDividende(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* Herkunftsland */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🌍</span> Quellensteuer Ausland
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Herkunftsland der Dividende
          </label>
          <select
            value={selectedLand}
            onChange={(e) => setSelectedLand(e.target.value)}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none text-lg"
          >
            {QUELLENSTEUER_LAENDER.map((land) => (
              <option key={land.land} value={land.land}>
                {land.name} {land.quellensteuer > 0 ? `(${(land.quellensteuer * 100).toFixed(0)}% Quellensteuer)` : ''}
              </option>
            ))}
          </select>
        </div>
        
        {/* Manuelle Eingabe */}
        {selectedLand === 'custom' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quellensteuer-Satz (%)
              </label>
              <input
                type="number"
                value={customQuellensteuer}
                onChange={(e) => setCustomQuellensteuer(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                min="0"
                max="100"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Davon anrechenbar in DE (max. 15%)
              </label>
              <input
                type="number"
                value={customAnrechenbar}
                onChange={(e) => setCustomAnrechenbar(Math.min(15, Math.max(0, Number(e.target.value))))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                min="0"
                max="15"
                step="0.5"
              />
            </div>
          </div>
        )}
        
        {/* Quellensteuer-Info */}
        {landInfo && quellensteuerSatz > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-blue-600 text-xs block mb-1">Quellensteuer</span>
                <span className="text-lg font-bold text-blue-800">{formatProzent(quellensteuerSatz * 100)}</span>
              </div>
              <div>
                <span className="text-green-600 text-xs block mb-1">Anrechenbar</span>
                <span className="text-lg font-bold text-green-700">{formatProzent(anrechenbareQuellensteuerSatz * 100)}</span>
              </div>
              <div>
                <span className="text-orange-600 text-xs block mb-1">Erstattbar</span>
                <span className="text-lg font-bold text-orange-700">{formatProzent(erstattbareSatz * 100)}</span>
              </div>
            </div>
            {landInfo.hinweis && (
              <p className="text-sm text-blue-700 mt-3 text-center">💡 {landInfo.hinweis}</p>
            )}
          </div>
        )}
      </div>

      {/* Persönliche Situation */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">👤</span> Persönliche Situation
        </h3>
        
        <div className="space-y-4">
          {/* Familienstand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Familienstand</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setVerheiratet(false)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  !verheiratet
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ledig / Einzeln
              </button>
              <button
                onClick={() => setVerheiratet(true)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  verheiratet
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Verheiratet
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kirchensteuer
              </label>
              <select
                value={kirchensteuerSatz}
                onChange={(e) => setKirchensteuerSatz(Number(e.target.value))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              >
                {KIRCHENSTEUER_SAETZE.map((k) => (
                  <option key={k.wert} value={k.wert}>{k.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bereits genutzter Freibetrag
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={genutzterFreibetrag}
                  onChange={(e) => setGenutzterFreibetrag(Math.min(sparerpauschbetrag, Math.max(0, Number(e.target.value))))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                  max={sparerpauschbetrag}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Sparerpauschbetrag: {formatEuro(sparerpauschbetrag)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-green-200 mb-1">Netto-Dividende</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.nettoDividende)}</span>
          </div>
          <p className="text-green-200 text-sm mt-1">
            nach allen Steuern (Effektiver Steuersatz: {formatProzent(ergebnis.effektiverSteuersatz)})
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-green-200 text-xs block">Quellensteuer</span>
            <span className="text-xl font-bold">{formatEuro(ergebnis.quellensteuerBetrag)}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-green-200 text-xs block">Deutsche Steuer</span>
            <span className="text-xl font-bold">{formatEuro(ergebnis.deutscheSteuerGesamt)}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-green-200 text-xs block">Anrechnung</span>
            <span className="text-xl font-bold text-yellow-300">−{formatEuro(ergebnis.anrechnung)}</span>
          </div>
        </div>
        
        {/* Erstattbare Quellensteuer */}
        {ergebnis.erstattbareQuellensteuer > 0 && (
          <div className="mt-4 p-3 bg-white/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-green-100 text-sm">Mit Quellensteuer-Erstattung:</span>
                <p className="text-xs text-green-200 mt-1">
                  {formatEuro(ergebnis.erstattbareQuellensteuer)} erstattbar ({formatProzent(erstattbareSatz * 100)} der Brutto-Dividende)
                </p>
              </div>
              <span className="text-2xl font-bold">{formatEuro(ergebnis.nettoMitErstattung)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Detaillierte Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>
        
        <div className="space-y-3">
          {/* Brutto */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">Brutto-Dividende</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.bruttoDividende)}</span>
          </div>

          {/* Quellensteuer Ausland */}
          {ergebnis.quellensteuerBetrag > 0 && (
            <>
              <div className="flex justify-between items-center text-red-600">
                <span>Quellensteuer Ausland ({formatProzent(quellensteuerSatz * 100)})</span>
                <span>− {formatEuro(ergebnis.quellensteuerBetrag)}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-gray-50 -mx-6 px-6">
                <span className="text-gray-600">Nach Quellensteuer</span>
                <span className="font-medium text-gray-800">{formatEuro(ergebnis.nachQuellensteuer)}</span>
              </div>
            </>
          )}

          {/* Sparerpauschbetrag */}
          {ergebnis.sparerpauschbetrag > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>Sparerpauschbetrag</span>
              <span>− {formatEuro(ergebnis.sparerpauschbetrag)}</span>
            </div>
          )}

          {/* Steuerpflichtiger Betrag */}
          <div className="flex justify-between items-center py-2 border-b border-gray-200 bg-blue-50 -mx-6 px-6">
            <span className="font-bold text-gray-800">Steuerpflichtiger Betrag</span>
            <span className="font-bold text-blue-600">{formatEuro(ergebnis.steuerpflichtig)}</span>
          </div>

          {/* Deutsche Steuern */}
          <div>
            <div className="flex justify-between items-center text-gray-700 font-medium mb-2">
              <span>Deutsche Abgeltungsteuer</span>
              <span>{formatEuro(ergebnis.abgeltungsteuer)}</span>
            </div>
            
            {/* Anrechnung */}
            {ergebnis.anrechnung > 0 && (
              <div className="flex justify-between items-center text-green-600 pl-4 mb-2">
                <span>− Anrechnung Quellensteuer</span>
                <span>− {formatEuro(ergebnis.anrechnung)}</span>
              </div>
            )}
            
            <div className="pl-4 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Effektive Abgeltungsteuer</span>
                <span>{formatEuro(ergebnis.effektiveAbgeltungsteuer)}</span>
              </div>
              <div className="flex justify-between">
                <span>Solidaritätszuschlag (5,5%)</span>
                <span>{formatEuro(ergebnis.soli)}</span>
              </div>
              {ergebnis.kirchensteuer > 0 && (
                <div className="flex justify-between">
                  <span>Kirchensteuer</span>
                  <span>{formatEuro(ergebnis.kirchensteuer)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Gesamtsteuer */}
          <div className="flex justify-between items-center py-2 border-t border-gray-200 text-red-600 font-medium">
            <span>Gesamte Steuerbelastung</span>
            <span>{formatEuro(ergebnis.steuerGesamt)}</span>
          </div>

          {/* Erstattbare Quellensteuer */}
          {ergebnis.erstattbareQuellensteuer > 0 && (
            <div className="flex justify-between items-center text-orange-600">
              <span>Davon erstattbar (im Ausland)</span>
              <span>({formatEuro(ergebnis.erstattbareQuellensteuer)})</span>
            </div>
          )}

          {/* Netto */}
          <div className="flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl">
            <div>
              <span className="font-bold text-green-800 text-lg">Netto-Dividende</span>
              <span className="text-green-600 text-sm block">nach allen Steuern</span>
            </div>
            <span className="font-bold text-green-600 text-2xl">{formatEuro(ergebnis.nettoDividende)}</span>
          </div>
        </div>
      </div>

      {/* Ersparnis durch Anrechnung */}
      {ergebnis.ersparnisDurchAnrechnung > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span> Ersparnis durch Quellensteuer-Anrechnung
          </h3>
          <p className="text-yellow-700">
            Durch die Anrechnung der ausländischen Quellensteuer auf die deutsche Abgeltungsteuer 
            sparst du <strong>{formatEuro(ergebnis.ersparnisDurchAnrechnung)}</strong>!
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            Ohne Anrechnung würdest du sowohl die volle Quellensteuer als auch die volle 
            deutsche Abgeltungsteuer zahlen (Doppelbesteuerung).
          </p>
        </div>
      )}

      {/* So funktioniert's */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📘 So funktioniert die Dividenden-Besteuerung</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex gap-3">
            <span className="text-blue-500 font-bold">1.</span>
            <div>
              <strong className="text-gray-800">Quellensteuer im Ausland</strong>
              <p>Bei ausländischen Dividenden behält das Herkunftsland oft Quellensteuer ein. Die Höhe variiert je nach Land (0% bis 35%).</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-500 font-bold">2.</span>
            <div>
              <strong className="text-gray-800">Deutsche Abgeltungsteuer</strong>
              <p>In Deutschland fallen 25% Abgeltungsteuer + 5,5% Soli (+ ggf. Kirchensteuer) an = <strong>26,375%</strong> (ohne Kirchensteuer).</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-500 font-bold">3.</span>
            <div>
              <strong className="text-gray-800">Anrechnung (max. 15%)</strong>
              <p>Dank Doppelbesteuerungsabkommen (DBA) werden bis zu 15% der ausländischen Quellensteuer auf die deutsche Steuer angerechnet.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-500 font-bold">4.</span>
            <div>
              <strong className="text-gray-800">Erstattung</strong>
              <p>Quellensteuer über 15% kann oft im Ausland zurückgefordert werden (z.B. Schweiz: 20% erstattbar).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hinweise */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>W-8BEN Formular:</strong> Bei US-Aktien unbedingt ausfüllen! Sonst 30% statt 15% Quellensteuer.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Freistellungsauftrag:</strong> Richte bei deiner Bank einen Freistellungsauftrag ein (max. {formatEuro(sparerpauschbetrag)}).
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Vorabpauschale:</strong> Bei thesaurierenden Fonds/ETFs wird ggf. eine Vorabpauschale fällig.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Quellensteuer-Erstattung:</strong> Die Rückforderung im Ausland kann aufwändig sein. Prüfe, ob es sich lohnt.
            </span>
          </li>
          <li className="flex gap-2">
            <span>⚠️</span>
            <span>
              Dieser Rechner dient zur Orientierung. Für die Steuererklärung konsultiere einen Steuerberater.
            </span>
          </li>
        </ul>
      </div>

      {/* Länderübersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 overflow-x-auto">
        <h3 className="font-bold text-gray-800 mb-4">🌍 Quellensteuer-Übersicht nach Land</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-600">Land</th>
              <th className="text-center py-2 font-medium text-gray-600">Quellenst.</th>
              <th className="text-center py-2 font-medium text-gray-600">Anrechenbar</th>
              <th className="text-center py-2 font-medium text-gray-600">Erstattbar</th>
            </tr>
          </thead>
          <tbody>
            {QUELLENSTEUER_LAENDER.filter(l => l.land !== 'custom').map((land) => (
              <tr key={land.land} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2">{land.name}</td>
                <td className="py-2 text-center">{land.quellensteuer > 0 ? `${(land.quellensteuer * 100).toFixed(1)}%` : '—'}</td>
                <td className="py-2 text-center text-green-600">{land.anrechenbar > 0 ? `${(land.anrechenbar * 100).toFixed(1)}%` : '—'}</td>
                <td className="py-2 text-center text-orange-600">{land.erstattbar > 0 ? `${(land.erstattbar * 100).toFixed(1)}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__32d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §32d EStG – Abgeltungsteuer
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__43a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §43a EStG – Kapitalertragsteuer-Abzug
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Internationales_Steuerrecht/Staatenbezogene_Informationen/staatenbezogene_informationen.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Doppelbesteuerungsabkommen (DBA)
          </a>
          <a 
            href="https://www.bzst.de/DE/Privatpersonen/Kapitalertraege/AuslaendischeQuellensteuer/auslaendischequellensteuer_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BZSt – Ausländische Quellensteuer
          </a>
        </div>
      </div>
    </div>
  );
}
