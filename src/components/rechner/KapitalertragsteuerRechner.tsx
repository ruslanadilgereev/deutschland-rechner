import { useState, useMemo } from 'react';

// Kapitalertragsteuer 2026 – Abgeltungsteuer + Soli + Kirchensteuer
const ABGELTUNGSTEUER_SATZ = 0.25; // 25% Abgeltungsteuer
const SOLI_SATZ = 0.055; // 5,5% auf die Abgeltungsteuer

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

// Asset-Typen mit Steuerregeln
const ASSET_TYPEN = [
  { 
    id: 'aktien', 
    label: 'Aktien / ETFs / Fonds', 
    icon: '📈',
    beschreibung: '25% Abgeltungsteuer auf Gewinne',
    steuerpflichtig: true,
    teilfreistellung: 0, // Für Direktanlage keine Teilfreistellung
  },
  { 
    id: 'aktienfonds', 
    label: 'Aktienfonds (mind. 51% Aktien)', 
    icon: '📊',
    beschreibung: '30% Teilfreistellung auf Gewinne',
    steuerpflichtig: true,
    teilfreistellung: 0.30,
  },
  { 
    id: 'mischfonds', 
    label: 'Mischfonds (mind. 25% Aktien)', 
    icon: '📉',
    beschreibung: '15% Teilfreistellung auf Gewinne',
    steuerpflichtig: true,
    teilfreistellung: 0.15,
  },
  { 
    id: 'immofonds', 
    label: 'Immobilienfonds (offen)', 
    icon: '🏠',
    beschreibung: '60% Teilfreistellung auf Gewinne',
    steuerpflichtig: true,
    teilfreistellung: 0.60,
  },
  { 
    id: 'anleihen', 
    label: 'Anleihen / Zinsen', 
    icon: '📄',
    beschreibung: '25% Abgeltungsteuer auf Erträge',
    steuerpflichtig: true,
    teilfreistellung: 0,
  },
  { 
    id: 'dividenden', 
    label: 'Dividenden (deutsche Aktien)', 
    icon: '💰',
    beschreibung: '25% Abgeltungsteuer auf Dividenden',
    steuerpflichtig: true,
    teilfreistellung: 0,
  },
  { 
    id: 'krypto', 
    label: 'Kryptowährungen', 
    icon: '₿',
    beschreibung: 'Steuerfrei nach 1 Jahr Haltefrist',
    steuerpflichtig: true,
    teilfreistellung: 0,
    krypto: true,
  },
];

export default function KapitalertragsteuerRechner() {
  // Kapitalerträge
  const [bruttoGewinn, setBruttoGewinn] = useState(5000);
  const [verluste, setVerluste] = useState(0);
  const [bereitsBezahlt, setBereitsBezahlt] = useState(0);
  
  // Asset-Typ
  const [assetTyp, setAssetTyp] = useState('aktien');
  
  // Bei Krypto: Haltefrist
  const [haltefristUeber1Jahr, setHaltefristUeber1Jahr] = useState(false);
  
  // Persönliche Situation
  const [verheiratet, setVerheiratet] = useState(false);
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0);
  const [freistellungsauftrag, setFreistellungsauftrag] = useState(0);
  const [guenstigerpruefung, setGuenstigerpruefung] = useState(false);
  const [persoenlichSteuer, setPersoenlichSteuer] = useState(25);
  
  const selectedAsset = ASSET_TYPEN.find(a => a.id === assetTyp) || ASSET_TYPEN[0];
  const sparerpauschbetrag = verheiratet ? SPARERPAUSCHBETRAG.verheiratet : SPARERPAUSCHBETRAG.single;
  
  const ergebnis = useMemo(() => {
    // Krypto-Sonderfall: Nach 1 Jahr steuerfrei
    if (selectedAsset.krypto && haltefristUeber1Jahr) {
      return {
        bruttoGewinn,
        teilfreistellung: 0,
        steuerpflichtiger: bruttoGewinn,
        verlustverrechnung: 0,
        nachVerlust: bruttoGewinn,
        sparerpauschbetrag: 0,
        zuVersteuern: 0,
        abgeltungsteuer: 0,
        soli: 0,
        kirchensteuer: 0,
        steuerGesamt: 0,
        bereitsGezahlt: 0,
        nachzahlung: 0,
        nettoGewinn: bruttoGewinn,
        effektiverSteuersatz: 0,
        kryptoSteuerfrei: true,
      };
    }
    
    // 1. Teilfreistellung anwenden (für Fonds)
    const teilfreistellungBetrag = bruttoGewinn * selectedAsset.teilfreistellung;
    const nachTeilfreistellung = bruttoGewinn - teilfreistellungBetrag;
    
    // 2. Verlustverrechnung
    // Aktien-Verluste nur mit Aktien-Gewinnen verrechenbar
    const verlustverrechnung = Math.min(verluste, nachTeilfreistellung);
    const nachVerlust = Math.max(0, nachTeilfreistellung - verlustverrechnung);
    
    // 3. Sparerpauschbetrag (abzgl. bereits genutztem Freistellungsauftrag)
    const verfuegbarerFreibetrag = Math.max(0, sparerpauschbetrag - freistellungsauftrag);
    const genutzterFreibetrag = Math.min(verfuegbarerFreibetrag, nachVerlust);
    const zuVersteuern = Math.max(0, nachVerlust - genutzterFreibetrag);
    
    // 4. Steuerberechnung
    let abgeltungsteuer: number;
    let soli: number;
    let kirchensteuer: number;
    
    if (guenstigerpruefung && persoenlichSteuer < 25) {
      // Günstigerprüfung: Persönlicher Steuersatz anwenden
      abgeltungsteuer = Math.round(zuVersteuern * (persoenlichSteuer / 100));
      soli = Math.round(abgeltungsteuer * SOLI_SATZ);
      kirchensteuer = Math.round(abgeltungsteuer * kirchensteuerSatz);
    } else {
      // Standard: Abgeltungsteuer
      // Bei Kirchensteuer: Modifizierter Steuersatz
      if (kirchensteuerSatz > 0) {
        // Ermäßigte Abgeltungsteuer: 25% / (1 + Kirchensteuersatz)
        const modifizierterSatz = ABGELTUNGSTEUER_SATZ / (1 + kirchensteuerSatz);
        abgeltungsteuer = Math.round(zuVersteuern * modifizierterSatz);
        kirchensteuer = Math.round(abgeltungsteuer * kirchensteuerSatz);
      } else {
        abgeltungsteuer = Math.round(zuVersteuern * ABGELTUNGSTEUER_SATZ);
        kirchensteuer = 0;
      }
      soli = Math.round(abgeltungsteuer * SOLI_SATZ);
    }
    
    const steuerGesamt = abgeltungsteuer + soli + kirchensteuer;
    
    // 5. Bereits gezahlte Steuer (z.B. Quellensteuer)
    const nachzahlung = Math.max(0, steuerGesamt - bereitsBezahlt);
    const erstattung = Math.max(0, bereitsBezahlt - steuerGesamt);
    
    // 6. Netto-Gewinn
    const nettoGewinn = bruttoGewinn - steuerGesamt;
    
    // 7. Effektiver Steuersatz
    const effektiverSteuersatz = bruttoGewinn > 0 ? (steuerGesamt / bruttoGewinn) * 100 : 0;
    
    return {
      bruttoGewinn,
      teilfreistellung: Math.round(teilfreistellungBetrag),
      steuerpflichtiger: Math.round(nachTeilfreistellung),
      verlustverrechnung: Math.round(verlustverrechnung),
      nachVerlust: Math.round(nachVerlust),
      sparerpauschbetrag: Math.round(genutzterFreibetrag),
      zuVersteuern: Math.round(zuVersteuern),
      abgeltungsteuer,
      soli,
      kirchensteuer,
      steuerGesamt,
      bereitsGezahlt: bereitsBezahlt,
      nachzahlung,
      erstattung,
      nettoGewinn: Math.round(nettoGewinn),
      effektiverSteuersatz,
      kryptoSteuerfrei: false,
    };
  }, [
    bruttoGewinn, verluste, bereitsBezahlt, assetTyp, selectedAsset,
    haltefristUeber1Jahr, verheiratet, kirchensteuerSatz,
    freistellungsauftrag, guenstigerpruefung, persoenlichSteuer, sparerpauschbetrag
  ]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatProzent = (n: number) => n.toFixed(2).replace('.', ',') + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Asset-Typ */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span> Art der Kapitalerträge
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ASSET_TYPEN.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setAssetTyp(asset.id)}
              className={`flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
                assetTyp === asset.id
                  ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">{asset.icon}</span>
              <div>
                <p className="font-medium">{asset.label}</p>
                <p className={`text-xs mt-1 ${assetTyp === asset.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {asset.beschreibung}
                </p>
              </div>
            </button>
          ))}
        </div>
        
        {/* Krypto Haltefrist */}
        {selectedAsset.krypto && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={haltefristUeber1Jahr}
                onChange={(e) => setHaltefristUeber1Jahr(e.target.checked)}
                className="w-5 h-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
              />
              <div>
                <span className="font-medium text-yellow-800">Haltefrist über 1 Jahr</span>
                <p className="text-sm text-yellow-600">
                  Krypto-Gewinne sind nach 1 Jahr Haltefrist komplett steuerfrei!
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Kapitalerträge */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💰</span> Kapitalerträge eingeben
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brutto-Gewinn (vor Steuern)
            </label>
            <div className="relative">
              <input
                type="number"
                value={bruttoGewinn}
                onChange={(e) => setBruttoGewinn(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                min="0"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="500"
              value={bruttoGewinn}
              onChange={(e) => setBruttoGewinn(Number(e.target.value))}
              className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verluste zur Verrechnung
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={verluste}
                  onChange={(e) => setVerluste(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Verlusttopf aus Vorjahren</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bereits einbehaltene Steuer
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bereitsBezahlt}
                  onChange={(e) => setBereitsBezahlt(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Z.B. von Bank einbehalten</p>
            </div>
          </div>
        </div>
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
                Freistellungsauftrag (genutzt)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={freistellungsauftrag}
                  onChange={(e) => setFreistellungsauftrag(Math.min(sparerpauschbetrag, Math.max(0, Number(e.target.value))))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                  max={sparerpauschbetrag}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Max. {formatEuro(sparerpauschbetrag)} Sparerpauschbetrag
              </p>
            </div>
          </div>
          
          {/* Günstigerprüfung */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={guenstigerpruefung}
                onChange={(e) => setGuenstigerpruefung(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-blue-400 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-blue-800">Günstigerprüfung beantragen</span>
                <p className="text-sm text-blue-600 mt-1">
                  Falls dein persönlicher Steuersatz unter 25% liegt, kannst du den niedrigeren Satz beantragen
                </p>
              </div>
            </label>
            
            {guenstigerpruefung && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Dein persönlicher Steuersatz (ca.)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="45"
                    step="1"
                    value={persoenlichSteuer}
                    onChange={(e) => setPersoenlichSteuer(Number(e.target.value))}
                    className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="w-16 text-center font-bold text-blue-800">{persoenlichSteuer}%</span>
                </div>
                {persoenlichSteuer < 25 ? (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Günstigerprüfung lohnt sich! Du sparst {formatProzent(25 - persoenlichSteuer)} Steuern.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    Die Abgeltungsteuer (25%) ist günstiger. Kein Antrag nötig.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {ergebnis.kryptoSteuerfrei ? (
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <div className="text-center">
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="text-2xl font-bold mb-2">Steuerfrei!</h3>
            <p className="text-green-100 mb-4">
              Dein Krypto-Gewinn von {formatEuro(bruttoGewinn)} ist nach über 1 Jahr Haltefrist komplett steuerfrei.
            </p>
            <div className="bg-white/20 rounded-xl p-4">
              <span className="text-sm text-green-100">Dein Netto-Gewinn</span>
              <span className="text-4xl font-bold block">{formatEuro(bruttoGewinn)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium text-blue-200 mb-1">Kapitalertragsteuer</h3>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuro(ergebnis.steuerGesamt)}</span>
            </div>
            <p className="text-blue-200 text-sm mt-1">Gesamtsteuer auf Kapitalerträge</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-blue-200 text-xs block">Effektiver Satz</span>
              <span className="text-xl font-bold">{formatProzent(ergebnis.effektiverSteuersatz)}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-blue-200 text-xs block">Netto-Gewinn</span>
              <span className="text-xl font-bold">{formatEuro(ergebnis.nettoGewinn)}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-blue-200 text-xs block">
                {ergebnis.nachzahlung > 0 ? 'Nachzahlung' : 'Erstattung'}
              </span>
              <span className={`text-xl font-bold ${ergebnis.nachzahlung > 0 ? 'text-yellow-300' : 'text-green-300'}`}>
                {formatEuro(ergebnis.nachzahlung > 0 ? ergebnis.nachzahlung : ergebnis.erstattung || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Aufschlüsselung */}
      {!ergebnis.kryptoSteuerfrei && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>
          
          <div className="space-y-3">
            {/* Brutto */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-700">Brutto-Kapitalertrag</span>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.bruttoGewinn)}</span>
            </div>

            {/* Teilfreistellung */}
            {ergebnis.teilfreistellung > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Teilfreistellung ({Math.round(selectedAsset.teilfreistellung * 100)}%)</span>
                <span>− {formatEuro(ergebnis.teilfreistellung)}</span>
              </div>
            )}

            {/* Steuerpflichtiger Ertrag */}
            {ergebnis.teilfreistellung > 0 && (
              <div className="flex justify-between items-center py-2 bg-gray-50 -mx-6 px-6">
                <span className="text-gray-600">Steuerpflichtiger Ertrag</span>
                <span className="font-medium text-gray-800">{formatEuro(ergebnis.steuerpflichtiger)}</span>
              </div>
            )}

            {/* Verlustverrechnung */}
            {ergebnis.verlustverrechnung > 0 && (
              <div className="flex justify-between items-center text-orange-600">
                <span>Verlustverrechnung</span>
                <span>− {formatEuro(ergebnis.verlustverrechnung)}</span>
              </div>
            )}

            {/* Sparerpauschbetrag */}
            {ergebnis.sparerpauschbetrag > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Sparerpauschbetrag</span>
                <span>− {formatEuro(ergebnis.sparerpauschbetrag)}</span>
              </div>
            )}

            {/* Zu versteuern */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200 bg-blue-50 -mx-6 px-6">
              <span className="font-bold text-gray-800">Zu versteuern</span>
              <span className="font-bold text-blue-600">{formatEuro(ergebnis.zuVersteuern)}</span>
            </div>

            {/* Steuern */}
            <div>
              <div className="flex justify-between items-center text-red-600 font-medium mb-2">
                <span>Steuern</span>
                <span>{formatEuro(ergebnis.steuerGesamt)}</span>
              </div>
              <div className="pl-4 space-y-1 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>
                    {guenstigerpruefung && persoenlichSteuer < 25 
                      ? `Einkommensteuer (${persoenlichSteuer}%)`
                      : 'Abgeltungsteuer (25%)'}
                  </span>
                  <span>{formatEuro(ergebnis.abgeltungsteuer)}</span>
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

            {/* Bereits gezahlt */}
            {bereitsBezahlt > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Bereits einbehalten/gezahlt</span>
                <span>− {formatEuro(bereitsBezahlt)}</span>
              </div>
            )}

            {/* Ergebnis */}
            <div className="flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl">
              <div>
                <span className="font-bold text-green-800 text-lg">Netto-Gewinn</span>
                <span className="text-green-600 text-sm block">nach Steuern</span>
              </div>
              <span className="font-bold text-green-600 text-2xl">{formatEuro(ergebnis.nettoGewinn)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Steuerübersicht */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">💡 So funktioniert die Kapitalertragsteuer</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>📈</span>
            <span><strong>Abgeltungsteuer</strong>: Pauschale 25% auf alle Kapitalerträge</span>
          </li>
          <li className="flex gap-2">
            <span>➕</span>
            <span><strong>Solidaritätszuschlag</strong>: 5,5% auf die Abgeltungsteuer</span>
          </li>
          <li className="flex gap-2">
            <span>⛪</span>
            <span><strong>Kirchensteuer</strong>: Falls Mitglied, zusätzlich 8-9%</span>
          </li>
          <li className="flex gap-2">
            <span>🎁</span>
            <span>
              <strong>Sparerpauschbetrag</strong>: {formatEuro(SPARERPAUSCHBETRAG.single)} (Ledig) / {formatEuro(SPARERPAUSCHBETRAG.verheiratet)} (Verheiratet) steuerfrei
            </span>
          </li>
          <li className="flex gap-2">
            <span>📊</span>
            <span>
              <strong>Teilfreistellung</strong>: Aktienfonds 30%, Mischfonds 15%, Immofonds 60% steuerfrei
            </span>
          </li>
          <li className="flex gap-2">
            <span>₿</span>
            <span>
              <strong>Krypto-Sonderregel</strong>: Nach 1 Jahr Haltefrist komplett steuerfrei!
            </span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Freistellungsauftrag</strong>: Erteile deiner Bank einen Freistellungsauftrag bis {formatEuro(sparerpauschbetrag)}, um Steuern zu sparen
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Verlustverrechnung</strong>: Aktien-Verluste können nur mit Aktien-Gewinnen verrechnet werden
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Günstigerprüfung</strong>: Bei niedrigem Einkommen kann der persönliche Steuersatz günstiger sein
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Quellensteuer</strong>: Ausländische Dividenden können anrechenbar sein (max. 15%)
            </span>
          </li>
          <li className="flex gap-2">
            <span>⚠️</span>
            <span>
              Dieser Rechner dient zur Orientierung – für die Steuererklärung konsultiere einen Steuerberater
            </span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörden */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden & Anlaufstellen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Finanzamt</p>
              <p className="text-gray-500">Anlage KAP zur Steuererklärung</p>
              <a 
                href="https://www.elster.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ELSTER Online →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🏦</span>
            <div>
              <p className="font-medium text-gray-800">Depotbank</p>
              <p className="text-gray-500">Freistellungsauftrag erteilen</p>
              <p className="text-gray-400 text-xs">Bei deiner Bank/Broker</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Bürgertelefon BMF</p>
              <p className="text-gray-500">Fragen zur Abgeltungsteuer</p>
              <a 
                href="tel:03018-333-0"
                className="text-blue-600 hover:underline"
              >
                030 18 333-0 →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">💼</span>
            <div>
              <p className="font-medium text-gray-800">Steuerberater</p>
              <p className="text-gray-500">Komplexe Sachverhalte</p>
              <a 
                href="https://www.bstbk.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Steuerberaterkammer →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__20.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §20 EStG – Einkünfte aus Kapitalvermögen
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__32d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §32d EStG – Abgeltungsteuer
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/invstg_2018/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            InvStG – Investmentsteuergesetz (Teilfreistellung)
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Content/DE/FAQ/Steuern/Kapitalertragsteuer/kapitalertragsteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – FAQ zur Kapitalertragsteuer
          </a>
          <a 
            href="https://www.bzst.de/DE/Privatpersonen/Kapitalertraege/kapitalertraege_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BZSt – Kapitalerträge & Kirchensteuer
          </a>
        </div>
      </div>
    </div>
  );
}
