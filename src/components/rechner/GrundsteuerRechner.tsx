import { useState, useMemo } from 'react';

// Bundesländer mit ihren Grundsteuer-Modellen
type Bundesland = typeof BUNDESLAENDER[number]['id'];

const BUNDESLAENDER = [
  { id: 'bw', name: 'Baden-Württemberg', modell: 'bodenwert', hebesatzSchnitt: 478 },
  { id: 'by', name: 'Bayern', modell: 'flaeche', hebesatzSchnitt: 387 },
  { id: 'be', name: 'Berlin', modell: 'bundesmodell', hebesatzSchnitt: 810 },
  { id: 'bb', name: 'Brandenburg', modell: 'bundesmodell', hebesatzSchnitt: 416 },
  { id: 'hb', name: 'Bremen', modell: 'bundesmodell', hebesatzSchnitt: 695 },
  { id: 'hh', name: 'Hamburg', modell: 'flaeche', hebesatzSchnitt: 540 },
  { id: 'he', name: 'Hessen', modell: 'flaeche', hebesatzSchnitt: 492 },
  { id: 'mv', name: 'Mecklenburg-Vorpommern', modell: 'bundesmodell', hebesatzSchnitt: 413 },
  { id: 'ni', name: 'Niedersachsen', modell: 'flaeche', hebesatzSchnitt: 451 },
  { id: 'nw', name: 'Nordrhein-Westfalen', modell: 'bundesmodell', hebesatzSchnitt: 573 },
  { id: 'rp', name: 'Rheinland-Pfalz', modell: 'bundesmodell', hebesatzSchnitt: 420 },
  { id: 'sl', name: 'Saarland', modell: 'bundesmodell', hebesatzSchnitt: 447 },
  { id: 'sn', name: 'Sachsen', modell: 'bundesmodell', hebesatzSchnitt: 527 },
  { id: 'st', name: 'Sachsen-Anhalt', modell: 'bundesmodell', hebesatzSchnitt: 436 },
  { id: 'sh', name: 'Schleswig-Holstein', modell: 'bundesmodell', hebesatzSchnitt: 371 },
  { id: 'th', name: 'Thüringen', modell: 'bundesmodell', hebesatzSchnitt: 422 },
] as const;

// Grundsteuer-Messzahlen (pro 1.000€ Grundsteuerwert)
// Bundesmodell: 0,31‰ für Wohngebäude, 0,34‰ für andere
const MESSZAHLEN = {
  bundesmodell: {
    wohnen: 0.00031, // 0,31‰
    gewerbe: 0.00034, // 0,34‰
  },
  bodenwert: {
    wohnen: 0.00091, // 0,91‰ (BaWü reduziert für Wohngrundstücke)
    gewerbe: 0.00126, // 1,26‰
  },
  flaeche: {
    wohnenProQm: 0.50, // €/qm Wohnfläche
    grundProQm: 0.04, // €/qm Grundstücksfläche
  },
};

// Bodenrichtwerte (Durchschnitt pro Bundesland in €/qm) - nur für Schätzungen
const BODENRICHTWERT_SCHNITT: Record<string, number> = {
  'bw': 210,
  'by': 280,
  'be': 580,
  'bb': 85,
  'hb': 220,
  'hh': 650,
  'he': 190,
  'mv': 55,
  'ni': 95,
  'nw': 180,
  'rp': 120,
  'sl': 90,
  'sn': 95,
  'st': 45,
  'sh': 110,
  'th': 55,
};

// Nutzungsart
type Nutzungsart = 'einfamilienhaus' | 'zweifamilienhaus' | 'eigentumswohnung' | 'mietwohnung' | 'gewerbe' | 'unbebautes_grundstueck';

const NUTZUNGSARTEN = [
  { id: 'einfamilienhaus', name: 'Einfamilienhaus', icon: '🏠' },
  { id: 'zweifamilienhaus', name: 'Zweifamilienhaus', icon: '🏘️' },
  { id: 'eigentumswohnung', name: 'Eigentumswohnung', icon: '🏢' },
  { id: 'mietwohnung', name: 'Mietwohnhaus', icon: '🏗️' },
  { id: 'gewerbe', name: 'Gewerbeimmobilie', icon: '🏭' },
  { id: 'unbebautes_grundstueck', name: 'Unbebautes Grundstück', icon: '🌳' },
] as const;

export default function GrundsteuerRechner() {
  // Eingabewerte
  const [bundesland, setBundesland] = useState<string>('nw');
  const [nutzungsart, setNutzungsart] = useState<Nutzungsart>('einfamilienhaus');
  const [grundstuecksflaeche, setGrundstuecksflaeche] = useState(500);
  const [wohnflaeche, setWohnflaeche] = useState(120);
  const [bodenrichtwert, setBodenrichtwert] = useState(200);
  const [hebesatz, setHebesatz] = useState(500);
  const [baujahr, setBaujahr] = useState(1990);
  const [nutzeSchaetzung, setNutzeSchaetzung] = useState(true);

  // Finde das ausgewählte Bundesland
  const selectedBundesland = BUNDESLAENDER.find(bl => bl.id === bundesland)!;

  // Aktualisiere Schätzwerte bei Bundeslandwechsel
  const handleBundeslandChange = (newBl: string) => {
    setBundesland(newBl);
    const bl = BUNDESLAENDER.find(b => b.id === newBl)!;
    if (nutzeSchaetzung) {
      setBodenrichtwert(BODENRICHTWERT_SCHNITT[newBl] || 150);
      setHebesatz(bl.hebesatzSchnitt);
    }
  };

  const ergebnis = useMemo(() => {
    const istWohnen = nutzungsart !== 'gewerbe';
    const istUnbebaut = nutzungsart === 'unbebautes_grundstueck';
    const modell = selectedBundesland.modell;

    let grundsteuerwert = 0;
    let grundsteuermessbetrag = 0;
    let grundsteuerJahr = 0;
    let berechnungsweg: { label: string; wert: string }[] = [];

    // Berechnung je nach Modell
    if (modell === 'bundesmodell') {
      // Bundesmodell (11 Länder): Ertragswertverfahren
      // Vereinfachte Berechnung: Bodenrichtwert × Fläche + Gebäudewert
      const bodenwert = bodenrichtwert * grundstuecksflaeche;
      
      // Gebäudewert (vereinfacht): Wohnfläche × pauschaler Wert × Altersabschlag
      const altersFaktor = Math.max(0.3, 1 - (2025 - baujahr) * 0.01); // Max 70% Abschlag
      const gebaeudeRohwert = istUnbebaut ? 0 : wohnflaeche * 2000; // Pauschale
      const gebaeudewert = gebaeudeRohwert * altersFaktor;
      
      grundsteuerwert = bodenwert + gebaeudewert;
      
      const messzahl = istWohnen ? MESSZAHLEN.bundesmodell.wohnen : MESSZAHLEN.bundesmodell.gewerbe;
      grundsteuermessbetrag = grundsteuerwert * messzahl;
      grundsteuerJahr = grundsteuermessbetrag * (hebesatz / 100);

      berechnungsweg = [
        { label: 'Bodenwert (Bodenrichtwert × Fläche)', wert: `${bodenrichtwert.toLocaleString('de-DE')} € × ${grundstuecksflaeche} m² = ${bodenwert.toLocaleString('de-DE')} €` },
        ...(istUnbebaut ? [] : [
          { label: `Gebäudewert (vereinfacht, Alter: ${2025 - baujahr} J.)`, wert: `${gebaeudewert.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €` },
        ]),
        { label: 'Grundsteuerwert (Summe)', wert: `${grundsteuerwert.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €` },
        { label: `× Steuermesszahl (${istWohnen ? '0,31‰' : '0,34‰'})`, wert: `= ${grundsteuermessbetrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` },
        { label: `× Hebesatz (${hebesatz}%)`, wert: `= ${grundsteuerJahr.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Jahr` },
      ];
    } 
    else if (modell === 'bodenwert') {
      // Baden-Württemberg: Reines Bodenwertmodell
      grundsteuerwert = bodenrichtwert * grundstuecksflaeche;
      
      const messzahl = istWohnen ? MESSZAHLEN.bodenwert.wohnen : MESSZAHLEN.bodenwert.gewerbe;
      grundsteuermessbetrag = grundsteuerwert * messzahl;
      grundsteuerJahr = grundsteuermessbetrag * (hebesatz / 100);

      berechnungsweg = [
        { label: 'Bodenrichtwert × Grundstücksfläche', wert: `${bodenrichtwert.toLocaleString('de-DE')} € × ${grundstuecksflaeche} m² = ${grundsteuerwert.toLocaleString('de-DE')} €` },
        { label: `× Steuermesszahl (${istWohnen ? '0,91‰' : '1,26‰'})`, wert: `= ${grundsteuermessbetrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` },
        { label: `× Hebesatz (${hebesatz}%)`, wert: `= ${grundsteuerJahr.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Jahr` },
      ];
    } 
    else if (modell === 'flaeche') {
      // Bayern, Hamburg, Hessen, Niedersachsen: Flächenmodell
      const grundAnteil = grundstuecksflaeche * MESSZAHLEN.flaeche.grundProQm;
      const wohnAnteil = istUnbebaut ? 0 : wohnflaeche * MESSZAHLEN.flaeche.wohnenProQm;
      grundsteuermessbetrag = grundAnteil + wohnAnteil;
      grundsteuerJahr = grundsteuermessbetrag * (hebesatz / 100);
      grundsteuerwert = grundsteuermessbetrag * 1000; // Rückrechnung für Anzeige

      berechnungsweg = [
        { label: 'Grundstücksfläche × 0,04 €/m²', wert: `${grundstuecksflaeche} m² × 0,04 € = ${grundAnteil.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €` },
        ...(istUnbebaut ? [] : [
          { label: 'Wohnfläche × 0,50 €/m²', wert: `${wohnflaeche} m² × 0,50 € = ${wohnAnteil.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €` },
        ]),
        { label: 'Grundsteuermessbetrag (Summe)', wert: `${grundsteuermessbetrag.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €` },
        { label: `× Hebesatz (${hebesatz}%)`, wert: `= ${grundsteuerJahr.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / Jahr` },
      ];
    }

    const grundsteuerMonat = grundsteuerJahr / 12;
    const grundsteuerQuartal = grundsteuerJahr / 4;

    // Vergleich alt vs. neu (grobe Schätzung)
    const alteGrundsteuerSchaetzung = grundsteuerJahr * 0.85; // Neue oft ~15% höher

    return {
      modell,
      grundsteuerwert,
      grundsteuermessbetrag,
      grundsteuerJahr,
      grundsteuerMonat,
      grundsteuerQuartal,
      berechnungsweg,
      alteGrundsteuerSchaetzung,
      hebesatz,
      bundesland: selectedBundesland,
    };
  }, [bundesland, nutzungsart, grundstuecksflaeche, wohnflaeche, bodenrichtwert, hebesatz, baujahr, selectedBundesland]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bundesland */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bundesland</span>
            <span className="text-xs text-gray-500 block mt-1">Jedes Land hat ein eigenes Grundsteuer-Modell</span>
          </label>
          <select
            value={bundesland}
            onChange={(e) => handleBundeslandChange(e.target.value)}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-lg focus:border-yellow-500 focus:ring-0 outline-none"
          >
            {BUNDESLAENDER.map((bl) => (
              <option key={bl.id} value={bl.id}>
                {bl.name} ({bl.modell === 'bundesmodell' ? 'Bundesmodell' : bl.modell === 'bodenwert' ? 'Bodenwertmodell' : 'Flächenmodell'})
              </option>
            ))}
          </select>
          <div className="mt-2 p-3 bg-yellow-50 rounded-xl">
            <p className="text-xs text-yellow-800">
              <strong>{selectedBundesland.name}</strong> nutzt das{' '}
              <strong>
                {selectedBundesland.modell === 'bundesmodell' && 'Bundesmodell (Ertragswertverfahren)'}
                {selectedBundesland.modell === 'bodenwert' && 'Bodenwertmodell (nur Grundstückswert)'}
                {selectedBundesland.modell === 'flaeche' && 'Flächenmodell (nur Flächen, nicht Wert)'}
              </strong>
            </p>
          </div>
        </div>

        {/* Nutzungsart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Art der Immobilie</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {NUTZUNGSARTEN.map((art) => (
              <button
                key={art.id}
                onClick={() => setNutzungsart(art.id as Nutzungsart)}
                className={`py-3 px-3 rounded-xl text-sm transition-all flex flex-col items-center gap-1 ${
                  nutzungsart === art.id
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{art.icon}</span>
                <span className="text-xs font-medium text-center">{art.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grundstücksfläche */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Grundstücksfläche</span>
            <span className="text-xs text-gray-500 block mt-1">Aus dem Grundbuchauszug</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={grundstuecksflaeche}
              onChange={(e) => setGrundstuecksflaeche(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none"
              min="0"
              max="10000"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">m²</span>
          </div>
          <input
            type="range"
            value={grundstuecksflaeche}
            onChange={(e) => setGrundstuecksflaeche(Number(e.target.value))}
            className="w-full mt-3 accent-yellow-500"
            min="100"
            max="2000"
            step="10"
          />
        </div>

        {/* Wohnfläche (nur wenn bebaut) */}
        {nutzungsart !== 'unbebautes_grundstueck' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">
                {nutzungsart === 'gewerbe' ? 'Nutzfläche' : 'Wohnfläche'}
              </span>
              <span className="text-xs text-gray-500 block mt-1">Wohn- oder Nutzfläche des Gebäudes</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={wohnflaeche}
                onChange={(e) => setWohnflaeche(Math.max(0, Number(e.target.value)))}
                className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none"
                min="0"
                max="1000"
                step="5"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">m²</span>
            </div>
            <input
              type="range"
              value={wohnflaeche}
              onChange={(e) => setWohnflaeche(Number(e.target.value))}
              className="w-full mt-3 accent-yellow-500"
              min="30"
              max="500"
              step="5"
            />
          </div>
        )}

        {/* Bodenrichtwert (nur bei Bundesmodell und Bodenwertmodell) */}
        {(selectedBundesland.modell === 'bundesmodell' || selectedBundesland.modell === 'bodenwert') && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Bodenrichtwert</span>
              <span className="text-xs text-gray-500 block mt-1">
                <a 
                  href="https://www.bodenrichtwerte-boris.de" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-600 hover:underline"
                >
                  → BORIS Portal aufrufen
                </a>
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={bodenrichtwert}
                onChange={(e) => { setBodenrichtwert(Math.max(0, Number(e.target.value))); setNutzeSchaetzung(false); }}
                className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none"
                min="0"
                max="5000"
                step="10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€/m²</span>
            </div>
            <input
              type="range"
              value={bodenrichtwert}
              onChange={(e) => { setBodenrichtwert(Number(e.target.value)); setNutzeSchaetzung(false); }}
              className="w-full mt-3 accent-yellow-500"
              min="20"
              max="1500"
              step="10"
            />
            {nutzeSchaetzung && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚠️ Durchschnittswert für {selectedBundesland.name}. Ermitteln Sie Ihren genauen Wert im BORIS-Portal.
              </p>
            )}
          </div>
        )}

        {/* Baujahr (nur bei Bundesmodell) */}
        {selectedBundesland.modell === 'bundesmodell' && nutzungsart !== 'unbebautes_grundstueck' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Baujahr des Gebäudes</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={baujahr}
                onChange={(e) => setBaujahr(Math.max(1800, Math.min(2025, Number(e.target.value))))}
                className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none"
                min="1800"
                max="2025"
              />
            </div>
            <input
              type="range"
              value={baujahr}
              onChange={(e) => setBaujahr(Number(e.target.value))}
              className="w-full mt-3 accent-yellow-500"
              min="1900"
              max="2025"
            />
            <p className="text-xs text-gray-500 mt-1">
              Alter: {2025 - baujahr} Jahre (Altersabschlag wird berücksichtigt)
            </p>
          </div>
        )}

        {/* Hebesatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Hebesatz Ihrer Gemeinde</span>
            <span className="text-xs text-gray-500 block mt-1">Fragen Sie Ihre Gemeinde oder schauen Sie auf deren Website</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={hebesatz}
              onChange={(e) => { setHebesatz(Math.max(0, Number(e.target.value))); setNutzeSchaetzung(false); }}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none"
              min="0"
              max="1200"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
          </div>
          <input
            type="range"
            value={hebesatz}
            onChange={(e) => { setHebesatz(Number(e.target.value)); setNutzeSchaetzung(false); }}
            className="w-full mt-3 accent-yellow-500"
            min="200"
            max="900"
            step="10"
          />
          <p className="text-xs text-gray-500 mt-1">
            Durchschnitt in {selectedBundesland.name}: {selectedBundesland.hebesatzSchnitt}%
          </p>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏡 Ihre neue Grundsteuer ab 2025</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.grundsteuerJahr)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          <p className="text-yellow-100 mt-2 text-sm">
            Das sind <strong>{formatEuro(ergebnis.grundsteuerMonat)}</strong> pro Monat bzw.{' '}
            <strong>{formatEuro(ergebnis.grundsteuerQuartal)}</strong> pro Quartal.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro Monat</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.grundsteuerMonat)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro Quartal</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.grundsteuerQuartal)}</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white/10 rounded-xl">
          <p className="text-sm">
            <strong>Modell:</strong>{' '}
            {ergebnis.modell === 'bundesmodell' && 'Bundesmodell (Ertragswert)'}
            {ergebnis.modell === 'bodenwert' && 'Bodenwertmodell (Baden-Württemberg)'}
            {ergebnis.modell === 'flaeche' && 'Flächenmodell'}
          </p>
          <p className="text-sm mt-1">
            <strong>Hebesatz:</strong> {ergebnis.hebesatz}% (Gemeinde-spezifisch)
          </p>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsweg</h3>
        
        <div className="space-y-3 text-sm">
          {ergebnis.berechnungsweg.map((schritt, index) => (
            <div key={index} className={`flex justify-between py-2 ${
              index < ergebnis.berechnungsweg.length - 1 ? 'border-b border-gray-100' : 'bg-yellow-50 -mx-6 px-6 py-3 rounded-b-xl font-bold text-yellow-900'
            }`}>
              <span className="text-gray-600">{schritt.label}</span>
              <span className={index === ergebnis.berechnungsweg.length - 1 ? 'text-yellow-900' : 'text-gray-900'}>
                {schritt.wert}
              </span>
            </div>
          ))}
        </div>

        {ergebnis.modell !== 'flaeche' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              <strong>Grundsteuermessbetrag:</strong> {formatEuro(ergebnis.grundsteuermessbetrag)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Der Grundsteuermessbetrag wird vom Finanzamt im Bescheid festgesetzt.
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die neue Grundsteuer 2025</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Reform ab 2025:</strong> Die neue Grundsteuer gilt bundesweit seit dem 1. Januar 2025</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Drei-Stufen-Berechnung:</strong> Grundsteuerwert × Steuermesszahl × Hebesatz = Grundsteuer</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Unterschiedliche Modelle:</strong> 11 Länder nutzen das Bundesmodell, 5 Länder eigene Modelle</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Aufkommensneutral:</strong> Die Reform soll insgesamt nicht mehr Steuern bringen – aber individuelle Belastungen ändern sich</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Zahlung:</strong> Grundsteuer wird vierteljährlich fällig (15.2., 15.5., 15.8., 15.11.)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Umlagefähig:</strong> Vermieter können die Grundsteuer auf Mieter umlegen (Nebenkosten)</span>
          </li>
        </ul>
      </div>

      {/* Die drei Modelle */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-yellow-800 mb-3">🗺️ Die drei Grundsteuer-Modelle</h3>
        <div className="space-y-4">
          <div className="bg-white/70 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">📊 Bundesmodell (11 Bundesländer)</h4>
            <p className="text-sm text-yellow-800">
              Berechnung nach <strong>Ertragswert</strong>: Bodenrichtwert, Gebäudealter, Wohnfläche und Mietniveau fließen ein.
              Wohngrundstücke haben niedrigere Messzahlen (0,31‰) als Gewerbe (0,34‰).
            </p>
            <p className="text-xs text-yellow-700 mt-2">
              Bundesländer: Berlin, Brandenburg, Bremen, Mecklenburg-Vorpommern, NRW, Rheinland-Pfalz, 
              Saarland, Sachsen, Sachsen-Anhalt, Schleswig-Holstein, Thüringen
            </p>
          </div>
          
          <div className="bg-white/70 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">🌍 Bodenwertmodell (Baden-Württemberg)</h4>
            <p className="text-sm text-yellow-800">
              Nur der <strong>Bodenwert</strong> zählt (Bodenrichtwert × Fläche). Gebäude werden nicht bewertet.
              Einfach, aber benachteiligt Grundstücke in teuren Lagen.
            </p>
          </div>
          
          <div className="bg-white/70 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">📏 Flächenmodell (Bayern, Hamburg, Hessen, Niedersachsen)</h4>
            <p className="text-sm text-yellow-800">
              Berechnung nur nach <strong>Flächen</strong>: Grundstücksfläche × 0,04€ + Wohnfläche × 0,50€.
              Wert und Lage spielen keine Rolle – das ist am "fairsten", aber nicht werteorientiert.
            </p>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Schätzung:</strong> Dies ist eine vereinfachte Berechnung. Der tatsächliche Bescheid vom Finanzamt kann abweichen.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Bodenrichtwert prüfen:</strong> Ihren exakten Bodenrichtwert finden Sie im <a href="https://www.bodenrichtwerte-boris.de" target="_blank" rel="noopener noreferrer" className="underline">BORIS-Portal</a>.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Hebesatz ändern sich:</strong> Viele Gemeinden passen ihre Hebesätze 2025 an – informieren Sie sich bei Ihrer Gemeinde.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Einspruch möglich:</strong> Gegen den Grundsteuerwertbescheid können Sie innerhalb eines Monats Einspruch einlegen.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Grundsteuererklärung:</strong> Die Erklärung musste bis 31.01.2023 abgegeben werden. Wer nicht abgegeben hat, wurde geschätzt.</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden</h3>
        <div className="space-y-4">
          <div className="bg-yellow-50 rounded-xl p-4">
            <p className="font-semibold text-yellow-900">Finanzamt (Grundsteuerwert)</p>
            <p className="text-sm text-yellow-700 mt-1">
              Das Finanzamt am Ort des Grundstücks ermittelt den Grundsteuerwert und 
              erlässt den Grundsteuerwertbescheid sowie den Grundsteuermessbescheid.
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-4">
            <p className="font-semibold text-yellow-900">Gemeinde/Stadtkasse (Grundsteuerbescheid)</p>
            <p className="text-sm text-yellow-700 mt-1">
              Die Gemeinde multipliziert den Messbetrag mit dem Hebesatz und 
              erlässt den endgültigen Grundsteuerbescheid. Hierhin zahlen Sie.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">BORIS-Portal</p>
                <a 
                  href="https://www.bodenrichtwerte-boris.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Bodenrichtwerte abrufen →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📱</span>
              <div>
                <p className="font-medium text-gray-800">ELSTER</p>
                <a 
                  href="https://www.elster.de/eportal/start"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Grundsteuererklärung online →
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Finanzamt-Hotline</p>
              <p className="text-gray-600 mt-1">
                Bei Fragen zum Grundsteuerwertbescheid wenden Sie sich an Ihr zuständiges Finanzamt.
                Telefonnummern finden Sie auf dem Bescheid oder unter{' '}
                <a 
                  href="https://www.bzst.de/DE/Behoerden/Finanzaemter/finanzaemter_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  bzst.de
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/grstg_1973/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Grundsteuergesetz (GrStG) – Gesetze im Internet
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Grundsteuer/grundsteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – Grundsteuer-Reform
          </a>
          <a 
            href="https://www.grundsteuer.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Grundsteuer.de – Offizielle Informationsseite
          </a>
          <a 
            href="https://www.bodenrichtwerte-boris.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BORIS – Bodenrichtwert-Informationssystem
          </a>
        </div>
      </div>
    </div>
  );
}
