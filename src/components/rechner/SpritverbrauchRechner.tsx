import { useState, useMemo } from 'react';

// Durchschnittsverbrauch nach Fahrzeugtyp (für Einordnung)
const VERBRAUCH_REFERENZ = {
  kleinwagen: { name: 'Kleinwagen', benzin: { min: 4.5, max: 6.0 }, diesel: { min: 4.0, max: 5.5 } },
  kompakt: { name: 'Kompaktklasse', benzin: { min: 5.5, max: 7.5 }, diesel: { min: 4.5, max: 6.5 } },
  mittelklasse: { name: 'Mittelklasse', benzin: { min: 6.5, max: 8.5 }, diesel: { min: 5.0, max: 7.0 } },
  oberklasse: { name: 'Oberklasse/SUV', benzin: { min: 8.0, max: 12.0 }, diesel: { min: 6.5, max: 9.0 } },
  sportwagen: { name: 'Sportwagen', benzin: { min: 10.0, max: 16.0 }, diesel: { min: 8.0, max: 12.0 } },
};

// Verbrauchsunterschiede Stadt vs. Autobahn
const FAHRMODUS = {
  stadt: { name: 'Stadtverkehr', faktor: 1.3, emoji: '🏙️' },
  gemischt: { name: 'Gemischt', faktor: 1.0, emoji: '🛣️' },
  autobahn: { name: 'Autobahn', faktor: 0.85, emoji: '🛤️' },
};

type FahrmodusKey = keyof typeof FAHRMODUS;
type FahrzeugKey = keyof typeof VERBRAUCH_REFERENZ;
type KraftstoffKey = 'benzin' | 'diesel';

export default function SpritverbrauchRechner() {
  // Eingaben
  const [getankteLiter, setGetankteLiter] = useState(45);
  const [gefahreneKm, setGefahreneKm] = useState(600);
  const [kraftstoff, setKraftstoff] = useState<KraftstoffKey>('benzin');
  const [fahrzeugtyp, setFahrzeugtyp] = useState<FahrzeugKey>('kompakt');
  const [herstellerAngabe, setHerstellerAngabe] = useState(6.5);
  const [hatHerstellerAngabe, setHatHerstellerAngabe] = useState(false);
  const [fahrmodus, setFahrmodus] = useState<FahrmodusKey>('gemischt');
  
  // Berechnung
  const ergebnis = useMemo(() => {
    if (gefahreneKm <= 0 || getankteLiter <= 0) {
      return null;
    }
    
    // Hauptberechnung: (Liter / km) * 100
    const verbrauchPro100km = (getankteLiter / gefahreneKm) * 100;
    
    // Kosten pro km bei verschiedenen Spritpreisen
    const spritpreise = kraftstoff === 'benzin' 
      ? { guenstig: 1.55, durchschnitt: 1.70, teuer: 1.85 }
      : { guenstig: 1.45, durchschnitt: 1.60, teuer: 1.75 };
    
    const kostenPro100km = {
      guenstig: verbrauchPro100km * spritpreise.guenstig,
      durchschnitt: verbrauchPro100km * spritpreise.durchschnitt,
      teuer: verbrauchPro100km * spritpreise.teuer,
    };
    
    const kostenProKm = kostenPro100km.durchschnitt / 100;
    
    // Jahreskosten bei verschiedenen Fahrleistungen
    const jahresfahrleistungen = [10000, 15000, 20000, 30000];
    const jahreskosten = jahresfahrleistungen.map(km => ({
      km,
      kosten: (km / 100) * verbrauchPro100km * spritpreise.durchschnitt,
    }));
    
    // Einordnung (sparsam/normal/viel)
    const referenz = VERBRAUCH_REFERENZ[fahrzeugtyp][kraftstoff];
    const referenzMitte = (referenz.min + referenz.max) / 2;
    
    let einordnung: 'sparsam' | 'normal' | 'viel';
    let einordnungText: string;
    let einordnungFarbe: string;
    
    if (verbrauchPro100km < referenz.min) {
      einordnung = 'sparsam';
      einordnungText = 'Sehr sparsam';
      einordnungFarbe = 'text-green-600 bg-green-100';
    } else if (verbrauchPro100km <= referenz.max) {
      if (verbrauchPro100km <= referenzMitte) {
        einordnung = 'sparsam';
        einordnungText = 'Sparsam';
        einordnungFarbe = 'text-green-600 bg-green-100';
      } else {
        einordnung = 'normal';
        einordnungText = 'Normal';
        einordnungFarbe = 'text-amber-600 bg-amber-100';
      }
    } else {
      einordnung = 'viel';
      einordnungText = 'Erhöht';
      einordnungFarbe = 'text-red-600 bg-red-100';
    }
    
    // Vergleich mit Herstellerangabe
    let herstellerVergleich = null;
    if (hatHerstellerAngabe && herstellerAngabe > 0) {
      const differenz = verbrauchPro100km - herstellerAngabe;
      const differenzProzent = (differenz / herstellerAngabe) * 100;
      herstellerVergleich = {
        differenz,
        differenzProzent,
        mehrverbrauch: differenz > 0,
      };
    }
    
    // Geschätzter Verbrauch bei anderen Fahrmodi
    const geschaetzteVerbraeuche = Object.entries(FAHRMODUS).map(([key, modus]) => ({
      key,
      name: modus.name,
      emoji: modus.emoji,
      verbrauch: verbrauchPro100km * modus.faktor / FAHRMODUS[fahrmodus].faktor,
    }));
    
    // CO2-Berechnung
    const co2ProLiter = kraftstoff === 'benzin' ? 2.37 : 2.65; // kg CO2 pro Liter
    const co2Pro100km = verbrauchPro100km * co2ProLiter;
    const co2ProKm = co2Pro100km / 100;
    
    // Reichweite bei vollem Tank (typische Tankgrößen)
    const tankGroessen = kraftstoff === 'benzin' 
      ? { klein: 40, mittel: 50, gross: 65 }
      : { klein: 50, mittel: 60, gross: 80 };
    
    const reichweiten = {
      klein: (tankGroessen.klein / verbrauchPro100km) * 100,
      mittel: (tankGroessen.mittel / verbrauchPro100km) * 100,
      gross: (tankGroessen.gross / verbrauchPro100km) * 100,
    };
    
    return {
      verbrauchPro100km,
      kostenPro100km,
      kostenProKm,
      jahreskosten,
      einordnung,
      einordnungText,
      einordnungFarbe,
      herstellerVergleich,
      referenz,
      geschaetzteVerbraeuche,
      co2Pro100km,
      co2ProKm,
      reichweiten,
    };
  }, [getankteLiter, gefahreneKm, kraftstoff, fahrzeugtyp, herstellerAngabe, hatHerstellerAngabe, fahrmodus]);

  const formatNumber = (n: number, decimals = 1) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  
  const formatEuro = (n: number) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Ihre Tankdaten eingeben
        </h2>
        
        {/* Getankte Liter */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Getankte Liter</span>
            <span className="text-xs text-gray-500 block mt-1">
              Menge beim letzten Volltanken
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={getankteLiter}
              onChange={(e) => setGetankteLiter(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-lg"
              min="1"
              max="200"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Liter</span>
          </div>
          <input
            type="range"
            value={getankteLiter}
            onChange={(e) => setGetankteLiter(Number(e.target.value))}
            className="w-full mt-2 accent-amber-500"
            min="5"
            max="100"
            step="1"
          />
        </div>

        {/* Gefahrene Kilometer */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gefahrene Kilometer</span>
            <span className="text-xs text-gray-500 block mt-1">
              Seit dem letzten Volltanken
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={gefahreneKm}
              onChange={(e) => setGefahreneKm(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-lg"
              min="1"
              max="3000"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">km</span>
          </div>
          <input
            type="range"
            value={gefahreneKm}
            onChange={(e) => setGefahreneKm(Number(e.target.value))}
            className="w-full mt-2 accent-amber-500"
            min="50"
            max="1500"
            step="10"
          />
        </div>

        {/* Kraftstoffart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kraftstoffart</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setKraftstoff('benzin')}
              className={`py-4 px-4 rounded-xl font-medium transition-all ${
                kraftstoff === 'benzin'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">⛽</span>
              <span className="block mt-1">Benzin</span>
            </button>
            <button
              onClick={() => setKraftstoff('diesel')}
              className={`py-4 px-4 rounded-xl font-medium transition-all ${
                kraftstoff === 'diesel'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">🛢️</span>
              <span className="block mt-1">Diesel</span>
            </button>
          </div>
        </div>

        {/* Fahrzeugtyp */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugtyp</span>
            <span className="text-xs text-gray-500 block mt-1">
              Für Einordnung Ihres Verbrauchs
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.entries(VERBRAUCH_REFERENZ) as [FahrzeugKey, typeof VERBRAUCH_REFERENZ.kleinwagen][]).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setFahrzeugtyp(key)}
                className={`py-3 px-2 rounded-xl font-medium transition-all text-sm ${
                  fahrzeugtyp === key
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {value.name}
              </button>
            ))}
          </div>
        </div>

        {/* Fahrmodus */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Überwiegender Fahrmodus</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(FAHRMODUS) as [FahrmodusKey, typeof FAHRMODUS.stadt][]).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setFahrmodus(key)}
                className={`py-3 px-2 rounded-xl font-medium transition-all text-sm ${
                  fahrmodus === key
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{value.emoji}</span>
                <span className="block mt-1">{value.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Herstellerangabe (optional) */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <label className="text-gray-700 font-medium">
              Mit Herstellerangabe vergleichen
            </label>
            <button
              onClick={() => setHatHerstellerAngabe(!hatHerstellerAngabe)}
              className={`w-12 h-6 rounded-full transition-all ${
                hatHerstellerAngabe ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                hatHerstellerAngabe ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          {hatHerstellerAngabe && (
            <div className="mt-3">
              <label className="text-sm text-gray-600 block mb-2">
                Herstellerangabe (WLTP/NEFZ)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={herstellerAngabe}
                  onChange={(e) => setHerstellerAngabe(Number(e.target.value))}
                  className="w-32 p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 text-center"
                  min="1"
                  max="30"
                  step="0.1"
                />
                <span className="text-gray-500">l/100km</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {ergebnis && (
        <>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6">
            <h3 className="text-sm font-medium opacity-80 mb-1">⛽ Ihr Spritverbrauch</h3>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold">{formatNumber(ergebnis.verbrauchPro100km, 2)}</span>
                <span className="text-xl opacity-80">l/100km</span>
              </div>
              <p className="text-amber-100 mt-2 text-sm">
                {formatNumber(getankteLiter, 1)} Liter für {formatNumber(gefahreneKm, 0)} km
              </p>
            </div>

            {/* Einordnung */}
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${ergebnis.einordnungFarbe}`}>
              {ergebnis.einordnungText} für {VERBRAUCH_REFERENZ[fahrzeugtyp].name}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Kosten pro km</span>
                <div className="text-xl font-bold">{formatNumber(ergebnis.kostenProKm * 100, 1)} Cent</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">CO₂ pro 100km</span>
                <div className="text-xl font-bold">{formatNumber(ergebnis.co2Pro100km, 1)} kg</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm col-span-2 sm:col-span-1">
                <span className="text-sm opacity-80">Referenzbereich</span>
                <div className="text-xl font-bold">
                  {ergebnis.referenz.min} – {ergebnis.referenz.max} l
                </div>
              </div>
            </div>
          </div>

          {/* Herstellervergleich */}
          {ergebnis.herstellerVergleich && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span>
                Vergleich mit Herstellerangabe
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Herstellerangabe</div>
                  <div className="text-2xl font-bold text-gray-800">{formatNumber(herstellerAngabe, 1)} l/100km</div>
                </div>
                <div className="text-3xl">→</div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Ihr Verbrauch</div>
                  <div className="text-2xl font-bold text-gray-800">{formatNumber(ergebnis.verbrauchPro100km, 1)} l/100km</div>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${
                ergebnis.herstellerVergleich.mehrverbrauch 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                {ergebnis.herstellerVergleich.mehrverbrauch ? (
                  <p className="text-red-800">
                    <span className="font-bold">📈 {formatNumber(Math.abs(ergebnis.herstellerVergleich.differenzProzent))}% mehr</span> als vom Hersteller angegeben 
                    ({formatNumber(Math.abs(ergebnis.herstellerVergleich.differenz), 2)} l/100km Mehrverbrauch)
                  </p>
                ) : (
                  <p className="text-green-800">
                    <span className="font-bold">📉 {formatNumber(Math.abs(ergebnis.herstellerVergleich.differenzProzent))}% weniger</span> als vom Hersteller angegeben 
                    ({formatNumber(Math.abs(ergebnis.herstellerVergleich.differenz), 2)} l/100km weniger)
                  </p>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                10-20% Mehrverbrauch gegenüber WLTP-Werten sind im Alltag normal. 
                Bei mehr als 25% Abweichung könnte ein technisches Problem vorliegen.
              </p>
            </div>
          )}

          {/* Geschätzte Verbräuche bei anderen Fahrmodi */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">🛣️ Geschätzte Verbräuche nach Fahrmodus</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {ergebnis.geschaetzteVerbraeuche.map((modus) => (
                <div 
                  key={modus.key}
                  className={`p-4 rounded-xl text-center ${
                    modus.key === fahrmodus 
                      ? 'bg-amber-100 border-2 border-amber-300' 
                      : 'bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{modus.emoji}</span>
                  <p className="text-sm text-gray-600 mt-1">{modus.name}</p>
                  <p className="font-bold text-lg">{formatNumber(modus.verbrauch, 1)} l</p>
                  {modus.key === fahrmodus && (
                    <span className="text-xs text-amber-600">Ihr Wert</span>
                  )}
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              Schätzwerte basierend auf durchschnittlichen Verbrauchsunterschieden. 
              Stadtverkehr: +30%, Autobahn: -15% gegenüber gemischtem Betrieb.
            </p>
          </div>

          {/* Kosten */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">💶 Kosten bei Ihrem Verbrauch</h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Kosten pro 100 km</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <div className="text-xs text-green-600">Günstig (1,55€/l)</div>
                  <div className="font-bold text-green-800">{formatEuro(ergebnis.kostenPro100km.guenstig)}</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-center">
                  <div className="text-xs text-amber-600">Durchschnitt</div>
                  <div className="font-bold text-amber-800">{formatEuro(ergebnis.kostenPro100km.durchschnitt)}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-center">
                  <div className="text-xs text-red-600">Teuer (1,85€/l)</div>
                  <div className="font-bold text-red-800">{formatEuro(ergebnis.kostenPro100km.teuer)}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Geschätzte Jahreskosten (nur Sprit)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ergebnis.jahreskosten.map((jk) => (
                  <div key={jk.km} className="p-3 bg-gray-50 rounded-xl text-center">
                    <div className="text-xs text-gray-500">{(jk.km / 1000).toFixed(0)}k km/Jahr</div>
                    <div className="font-bold text-gray-800">{formatEuro(jk.kosten)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reichweite */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📏 Geschätzte Reichweite pro Tankfüllung</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="text-sm text-gray-600">Kleiner Tank</div>
                <div className="text-xs text-gray-400">{kraftstoff === 'benzin' ? '40' : '50'} Liter</div>
                <div className="font-bold text-xl mt-1">{formatNumber(ergebnis.reichweiten.klein, 0)} km</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl text-center border-2 border-amber-200">
                <div className="text-sm text-amber-700">Mittlerer Tank</div>
                <div className="text-xs text-amber-500">{kraftstoff === 'benzin' ? '50' : '60'} Liter</div>
                <div className="font-bold text-xl mt-1 text-amber-800">{formatNumber(ergebnis.reichweiten.mittel, 0)} km</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="text-sm text-gray-600">Großer Tank</div>
                <div className="text-xs text-gray-400">{kraftstoff === 'benzin' ? '65' : '80'} Liter</div>
                <div className="font-bold text-xl mt-1">{formatNumber(ergebnis.reichweiten.gross, 0)} km</div>
              </div>
            </div>
          </div>

          {/* Formel-Erklärung */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
            
            <div className="bg-amber-50 p-4 rounded-xl mb-4">
              <p className="font-mono text-center text-amber-800 font-bold text-lg">
                (Getankte Liter ÷ Gefahrene km) × 100 = l/100km
              </p>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Ihre Rechnung:</strong> ({formatNumber(getankteLiter, 1)} l ÷ {formatNumber(gefahreneKm, 0)} km) × 100 = <strong>{formatNumber(ergebnis.verbrauchPro100km, 2)} l/100km</strong>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Diese Methode (Volltanken-zu-Volltanken) ist die genaueste Art, den realen Verbrauch zu ermitteln.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Anleitung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📝 So ermitteln Sie Ihren echten Verbrauch</h3>
        
        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">1</span>
            <span>Tanken Sie Ihr Auto <strong>komplett voll</strong> (bis der Zapfhahn abschaltet)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">2</span>
            <span><strong>Setzen Sie den Tageskilometerzähler</strong> auf Null oder notieren Sie den aktuellen Kilometerstand</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">3</span>
            <span>Fahren Sie normal, bis der Tank fast leer ist (mindestens <strong>200 km</strong> für ein genaues Ergebnis)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">4</span>
            <span>Tanken Sie wieder <strong>komplett voll</strong> und notieren Sie die <strong>getankten Liter</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">5</span>
            <span>Lesen Sie die <strong>gefahrenen Kilometer</strong> ab und geben Sie beides oben ein</span>
          </li>
        </ol>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <p className="text-blue-800 text-sm">
            💡 <strong>Tipp:</strong> Wiederholen Sie die Messung mehrmals und bilden Sie den Durchschnitt 
            für einen noch genaueren Wert. Berücksichtigen Sie verschiedene Jahreszeiten und Streckenprofile.
          </p>
        </div>
      </div>

      {/* Spartipps */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💡 Tipps für weniger Verbrauch</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>🚗</span>
            <span><strong>Gleichmäßig fahren:</strong> Vorausschauend Gas geben und bremsen spart bis zu 20%</span>
          </li>
          <li className="flex gap-2">
            <span>⬆️</span>
            <span><strong>Früh hochschalten:</strong> Bei 2.000 U/min (Benzin) bzw. 1.500 U/min (Diesel) in den nächsten Gang</span>
          </li>
          <li className="flex gap-2">
            <span>🚙</span>
            <span><strong>Motor-aus:</strong> Bei Wartezeiten über 20 Sekunden Motor abstellen</span>
          </li>
          <li className="flex gap-2">
            <span>⚖️</span>
            <span><strong>Reifendruck:</strong> Alle 2 Wochen prüfen – 0,5 bar zu wenig = 5% Mehrverbrauch</span>
          </li>
          <li className="flex gap-2">
            <span>🧳</span>
            <span><strong>Ballast raus:</strong> Unnötiges Gewicht im Kofferraum entfernen</span>
          </li>
          <li className="flex gap-2">
            <span>🌀</span>
            <span><strong>Klimaanlage:</strong> Erhöht den Verbrauch um 0,5-1 l/100km – sparsam nutzen</span>
          </li>
        </ul>
      </div>

      {/* Link zum Spritkosten-Rechner */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🔗 Weiterführende Rechner</h3>
        <a 
          href="/spritkosten-rechner" 
          className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all"
        >
          <span className="text-2xl">⛽</span>
          <div>
            <span className="font-semibold text-green-800">Spritkosten-Rechner</span>
            <p className="text-sm text-green-600">Berechnen Sie die Benzinkosten für Ihre nächste Fahrt</p>
          </div>
          <span className="ml-auto text-green-600">→</span>
        </a>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Referenzen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/autokosten/spritverbrauch-berechnen/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Spritverbrauch richtig berechnen
          </a>
          <a 
            href="https://www.spritmonitor.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Spritmonitor – Verbrauchsdatenbank
          </a>
          <a 
            href="https://www.umweltbundesamt.de/daten/verkehr/kraftstoffe"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Umweltbundesamt – Kraftstoffdaten & CO₂
          </a>
        </div>
      </div>
    </div>
  );
}
