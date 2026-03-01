import { useState, useMemo } from 'react';

// Top 20 deutsche Großstädte mit Koordinaten (für Luftlinienberechnung)
interface Stadt {
  name: string;
  lat: number;
  lon: number;
  einwohner: string;
  bundesland: string;
}

const STAEDTE: Stadt[] = [
  { name: 'Berlin', lat: 52.52, lon: 13.405, einwohner: '3,7 Mio', bundesland: 'Berlin' },
  { name: 'Hamburg', lat: 53.5511, lon: 9.9937, einwohner: '1,9 Mio', bundesland: 'Hamburg' },
  { name: 'München', lat: 48.1351, lon: 11.582, einwohner: '1,5 Mio', bundesland: 'Bayern' },
  { name: 'Köln', lat: 50.9375, lon: 6.9603, einwohner: '1,1 Mio', bundesland: 'NRW' },
  { name: 'Frankfurt am Main', lat: 50.1109, lon: 8.6821, einwohner: '760.000', bundesland: 'Hessen' },
  { name: 'Stuttgart', lat: 48.7758, lon: 9.1829, einwohner: '630.000', bundesland: 'Baden-Württemberg' },
  { name: 'Düsseldorf', lat: 51.2277, lon: 6.7735, einwohner: '620.000', bundesland: 'NRW' },
  { name: 'Leipzig', lat: 51.3397, lon: 12.3731, einwohner: '600.000', bundesland: 'Sachsen' },
  { name: 'Dortmund', lat: 51.5136, lon: 7.4653, einwohner: '590.000', bundesland: 'NRW' },
  { name: 'Essen', lat: 51.4556, lon: 7.0116, einwohner: '580.000', bundesland: 'NRW' },
  { name: 'Bremen', lat: 53.0793, lon: 8.8017, einwohner: '570.000', bundesland: 'Bremen' },
  { name: 'Dresden', lat: 51.0504, lon: 13.7373, einwohner: '560.000', bundesland: 'Sachsen' },
  { name: 'Hannover', lat: 52.3759, lon: 9.732, einwohner: '540.000', bundesland: 'Niedersachsen' },
  { name: 'Nürnberg', lat: 49.4521, lon: 11.0767, einwohner: '520.000', bundesland: 'Bayern' },
  { name: 'Duisburg', lat: 51.4344, lon: 6.7623, einwohner: '500.000', bundesland: 'NRW' },
  { name: 'Bochum', lat: 51.4818, lon: 7.2162, einwohner: '360.000', bundesland: 'NRW' },
  { name: 'Wuppertal', lat: 51.2562, lon: 7.1508, einwohner: '355.000', bundesland: 'NRW' },
  { name: 'Bielefeld', lat: 52.0302, lon: 8.5325, einwohner: '335.000', bundesland: 'NRW' },
  { name: 'Bonn', lat: 50.7374, lon: 7.0982, einwohner: '330.000', bundesland: 'NRW' },
  { name: 'Münster', lat: 51.9607, lon: 7.6261, einwohner: '315.000', bundesland: 'NRW' },
];

// Haversine-Formel für Luftlinienberechnung
function berechneEntfernungKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Erdradius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Faktor für geschätzte Fahrtstrecke (Straße ist länger als Luftlinie)
const STRASSENFAKTOR = 1.3;

// Durchschnittsgeschwindigkeiten für verschiedene Entfernungen
function berechneGeschwindigkeit(entfernungKm: number): number {
  // Kürzere Strecken = mehr Stadtverkehr = langsamer
  if (entfernungKm < 50) return 50; // Stadt/Umland
  if (entfernungKm < 150) return 70; // Überland/Autobahn gemischt
  if (entfernungKm < 300) return 90; // Überwiegend Autobahn
  return 100; // Lange Autobahnetappen
}

export default function EntfernungRechner() {
  const [stadtVon, setStadtVon] = useState(0); // Index Berlin
  const [stadtNach, setStadtNach] = useState(2); // Index München
  const [hinUndZurueck, setHinUndZurueck] = useState(false);

  const ergebnis = useMemo(() => {
    const von = STAEDTE[stadtVon];
    const nach = STAEDTE[stadtNach];
    
    // Gleiche Stadt ausgewählt
    if (stadtVon === stadtNach) {
      return {
        luftlinie: 0,
        strassenentfernung: 0,
        fahrzeitMin: 0,
        geschwindigkeit: 0,
        von,
        nach,
      };
    }
    
    // Luftlinie berechnen
    const luftlinie = berechneEntfernungKm(von.lat, von.lon, nach.lat, nach.lon);
    
    // Geschätzte Straßenentfernung
    const strassenentfernung = luftlinie * STRASSENFAKTOR;
    
    // Geschwindigkeit basierend auf Entfernung
    const geschwindigkeit = berechneGeschwindigkeit(strassenentfernung);
    
    // Fahrzeit berechnen (+ 15 Min Puffer für Verkehr)
    const fahrzeitMin = (strassenentfernung / geschwindigkeit) * 60 + 15;
    
    return {
      luftlinie: hinUndZurueck ? luftlinie * 2 : luftlinie,
      strassenentfernung: hinUndZurueck ? strassenentfernung * 2 : strassenentfernung,
      fahrzeitMin: hinUndZurueck ? fahrzeitMin * 2 : fahrzeitMin,
      geschwindigkeit,
      von,
      nach,
    };
  }, [stadtVon, stadtNach, hinUndZurueck]);

  const formatNumber = (n: number, decimals = 0) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const formatZeit = (minuten: number) => {
    const stunden = Math.floor(minuten / 60);
    const min = Math.round(minuten % 60);
    if (stunden === 0) return `${min} Min`;
    if (min === 0) return `${stunden} Std`;
    return `${stunden} Std ${min} Min`;
  };

  // Tausche Städte
  const tauscheStaedte = () => {
    const temp = stadtVon;
    setStadtVon(stadtNach);
    setStadtNach(temp);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Von Stadt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">🅰️ Von (Startort)</span>
          </label>
          <select
            value={stadtVon}
            onChange={(e) => setStadtVon(Number(e.target.value))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg bg-white"
          >
            {STAEDTE.map((stadt, index) => (
              <option key={index} value={index}>
                {stadt.name} ({stadt.bundesland})
              </option>
            ))}
          </select>
        </div>

        {/* Tauschen Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={tauscheStaedte}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
            title="Start und Ziel tauschen"
          >
            <span className="text-2xl">🔄</span>
          </button>
        </div>

        {/* Nach Stadt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">🅱️ Nach (Zielort)</span>
          </label>
          <select
            value={stadtNach}
            onChange={(e) => setStadtNach(Number(e.target.value))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg bg-white"
          >
            {STAEDTE.map((stadt, index) => (
              <option key={index} value={index}>
                {stadt.name} ({stadt.bundesland})
              </option>
            ))}
          </select>
        </div>

        {/* Hin und Zurück Toggle */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setHinUndZurueck(false)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !hinUndZurueck
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">➡️</span>
              <span className="block text-sm mt-1">Einfache Strecke</span>
            </button>
            <button
              onClick={() => setHinUndZurueck(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                hinUndZurueck
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">↔️</span>
              <span className="block text-sm mt-1">Hin & Zurück</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gleiche Stadt Warnung */}
      {stadtVon === stadtNach && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-amber-800">Gleiche Stadt ausgewählt</p>
              <p className="text-sm text-amber-700">Bitte wählen Sie zwei verschiedene Städte aus.</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Section */}
      {stadtVon !== stadtNach && (
        <>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
            <h3 className="text-sm font-medium opacity-80 mb-1">
              📍 {ergebnis.von.name} → {ergebnis.nach.name}
              {hinUndZurueck && ' (Hin & Zurück)'}
            </h3>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatNumber(ergebnis.luftlinie)}</span>
                <span className="text-2xl opacity-80">km</span>
              </div>
              <p className="text-blue-100 mt-1 text-sm">Luftlinie</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">🚗 Straßenentfernung (ca.)</span>
                <div className="text-xl font-bold">{formatNumber(ergebnis.strassenentfernung)} km</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">⏱️ Fahrzeit (ca.)</span>
                <div className="text-xl font-bold">{formatZeit(ergebnis.fahrzeitMin)}</div>
              </div>
            </div>
          </div>

          {/* Detaillierte Infos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📊 Details zur Strecke</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Startort</span>
                <span className="font-bold text-gray-900">{ergebnis.von.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Zielort</span>
                <span className="font-bold text-gray-900">{ergebnis.nach.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Luftlinie</span>
                <span className="text-gray-900">{formatNumber(ergebnis.luftlinie)} km</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Straßenentfernung (geschätzt)</span>
                <span className="text-gray-900">{formatNumber(ergebnis.strassenentfernung)} km</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Ø Geschwindigkeit (Annahme)</span>
                <span className="text-gray-900">{formatNumber(ergebnis.geschwindigkeit)} km/h</span>
              </div>
              <div className="flex justify-between py-3 bg-blue-50 -mx-6 px-6 mt-4">
                <span className="font-bold text-blue-800">Geschätzte Fahrzeit</span>
                <span className="font-bold text-xl text-blue-900">{formatZeit(ergebnis.fahrzeitMin)}</span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600">
                <strong>Hinweis:</strong> Straßenentfernung ≈ Luftlinie × {STRASSENFAKTOR} (Umwegfaktor). 
                Die tatsächliche Fahrzeit hängt von Verkehr, Baustellen und Routenwahl ab.
              </p>
            </div>
          </div>

          {/* Vergleich der Verkehrsmittel */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">🚆 Reisezeiten im Vergleich</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl">🚗</span>
                <p className="text-sm text-gray-600 mt-1">Auto</p>
                <p className="font-bold text-lg">{formatZeit(ergebnis.fahrzeitMin)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl">🚆</span>
                <p className="text-sm text-gray-600 mt-1">ICE/IC</p>
                <p className="font-bold text-lg">{formatZeit(ergebnis.strassenentfernung / 150 * 60 + 30)}</p>
                <p className="text-xs text-gray-500">ca. 150 km/h Ø</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl">🚌</span>
                <p className="text-sm text-gray-600 mt-1">Fernbus</p>
                <p className="font-bold text-lg">{formatZeit(ergebnis.strassenentfernung / 70 * 60 + 20)}</p>
                <p className="text-xs text-gray-500">ca. 70 km/h Ø</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl">✈️</span>
                <p className="text-sm text-gray-600 mt-1">Flug*</p>
                <p className="font-bold text-lg">
                  {ergebnis.luftlinie / (hinUndZurueck ? 2 : 1) > 400 
                    ? formatZeit(ergebnis.luftlinie / (hinUndZurueck ? 2 : 1) / 700 * 60 + 120)
                    : '–'}
                </p>
                <p className="text-xs text-gray-500">{ergebnis.luftlinie / (hinUndZurueck ? 2 : 1) > 400 ? 'inkl. 2h Flughafen' : 'nicht sinnvoll'}</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              * Flug lohnt sich meist erst ab ca. 400 km Luftlinie. Zeiten sind Richtwerte.
            </p>
          </div>

          {/* Städte-Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">🏙️ Städte-Informationen</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-bold text-blue-800">{ergebnis.von.name}</h4>
                <div className="text-sm text-blue-700 mt-2 space-y-1">
                  <p>👥 Einwohner: {ergebnis.von.einwohner}</p>
                  <p>📍 Bundesland: {ergebnis.von.bundesland}</p>
                  <p>🌐 Koordinaten: {ergebnis.von.lat.toFixed(4)}°N, {ergebnis.von.lon.toFixed(4)}°O</p>
                </div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl">
                <h4 className="font-bold text-indigo-800">{ergebnis.nach.name}</h4>
                <div className="text-sm text-indigo-700 mt-2 space-y-1">
                  <p>👥 Einwohner: {ergebnis.nach.einwohner}</p>
                  <p>📍 Bundesland: {ergebnis.nach.bundesland}</p>
                  <p>🌐 Koordinaten: {ergebnis.nach.lat.toFixed(4)}°N, {ergebnis.nach.lon.toFixed(4)}°O</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Beliebte Strecken */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📍 Beliebte Verbindungen</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { von: 0, nach: 2, name: 'Berlin → München' }, // Berlin → München
            { von: 1, nach: 4, name: 'Hamburg → Frankfurt' }, // Hamburg → Frankfurt
            { von: 3, nach: 0, name: 'Köln → Berlin' }, // Köln → Berlin
            { von: 2, nach: 5, name: 'München → Stuttgart' }, // München → Stuttgart
            { von: 4, nach: 6, name: 'Frankfurt → Düsseldorf' }, // Frankfurt → Düsseldorf
            { von: 1, nach: 0, name: 'Hamburg → Berlin' }, // Hamburg → Berlin
          ].map((strecke, i) => {
            const dist = berechneEntfernungKm(
              STAEDTE[strecke.von].lat, STAEDTE[strecke.von].lon,
              STAEDTE[strecke.nach].lat, STAEDTE[strecke.nach].lon
            );
            return (
              <button
                key={i}
                onClick={() => { setStadtVon(strecke.von); setStadtNach(strecke.nach); }}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left"
              >
                <span className="text-sm text-gray-700">{strecke.name}</span>
                <span className="text-sm font-medium text-blue-600">{formatNumber(dist)} km</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Entfernungstabelle der größten Städte */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📏 Entfernungstabelle (Luftlinie in km)</h3>
        
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-2 font-semibold text-gray-700 sticky left-0 bg-gray-50">Stadt</th>
                {STAEDTE.slice(0, 8).map((stadt) => (
                  <th key={stadt.name} className="text-center py-2 px-1 font-semibold text-gray-700 whitespace-nowrap">
                    {stadt.name.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAEDTE.slice(0, 8).map((stadtVon, i) => (
                <tr key={stadtVon.name} className="border-b border-gray-100">
                  <td className="py-2 px-2 font-medium text-gray-600 sticky left-0 bg-white">
                    {stadtVon.name.substring(0, 6)}
                  </td>
                  {STAEDTE.slice(0, 8).map((stadtNach, j) => {
                    const dist = i === j ? '–' : formatNumber(berechneEntfernungKm(
                      stadtVon.lat, stadtVon.lon, stadtNach.lat, stadtNach.lon
                    ));
                    return (
                      <td 
                        key={stadtNach.name} 
                        className={`text-center py-2 px-1 ${i === j ? 'bg-gray-100' : 'cursor-pointer hover:bg-blue-50'}`}
                        onClick={() => { if (i !== j) { setStadtVon(i); setStadtNach(j); }}}
                      >
                        {dist}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          Klicken Sie auf eine Zelle, um die Entfernung zu berechnen.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert der Entfernungsrechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Luftlinie:</strong> Kürzeste Distanz zwischen zwei Punkten (Großkreisentfernung)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Straßenentfernung:</strong> Ca. 30% länger als Luftlinie (Umwegfaktor)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Fahrzeit:</strong> Geschätzt mit 70-100 km/h je nach Entfernung + Pufferzeit</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Haversine-Formel:</strong> Mathematische Berechnung unter Berücksichtigung der Erdkrümmung</span>
          </li>
        </ul>
      </div>

      {/* Tipps */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">💡 Tipps zur Reiseplanung</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>🚗</span>
            <span><strong>Auto:</strong> Planen Sie Pausen ein – alle 2 Stunden ca. 15 Min</span>
          </li>
          <li className="flex gap-2">
            <span>🚆</span>
            <span><strong>Bahn:</strong> ICE ist auf Strecken ab 200 km oft zeitlich konkurrenzfähig</span>
          </li>
          <li className="flex gap-2">
            <span>⛽</span>
            <span><strong>Sprit:</strong> Für Kosten nutzen Sie unseren <a href="/rechner/spritkosten" className="underline">Spritkosten-Rechner</a></span>
          </li>
          <li className="flex gap-2">
            <span>🗺️</span>
            <span><strong>Navigation:</strong> Für exakte Routen empfehlen wir Google Maps oder HERE</span>
          </li>
        </ul>
      </div>

      {/* Formel-Erklärung */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Haversine-Formel</h3>
        <p className="text-sm text-gray-600 mb-3">
          Die Luftlinienentfernung wird mit der Haversine-Formel berechnet, die die Erdkrümmung berücksichtigt:
        </p>
        <div className="bg-white p-4 rounded-xl font-mono text-xs text-gray-700 overflow-x-auto">
          a = sin²(Δφ/2) + cos φ₁ · cos φ₂ · sin²(Δλ/2)<br />
          c = 2 · atan2(√a, √(1−a))<br />
          d = R · c
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Dabei ist R = 6.371 km (Erdradius), φ = Breitengrad, λ = Längengrad
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Links</h4>
        <div className="space-y-1">
          <a 
            href="https://www.google.de/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Google Maps – Routenplanung
          </a>
          <a 
            href="https://www.bahn.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Bahn – Verbindungen
          </a>
          <a 
            href="https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Bevoelkerungsstand/_inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Statistisches Bundesamt – Einwohnerzahlen
          </a>
        </div>
      </div>
    </div>
  );
}
