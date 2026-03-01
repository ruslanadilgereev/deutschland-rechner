import { useState, useMemo } from 'react';

// Kraftstofftypen mit aktuellen Durchschnittspreisen 2025/2026
type Kraftstofftyp = 'benzin' | 'diesel' | 'superplus' | 'lpg';

const KRAFTSTOFF_PREISE: Record<Kraftstofftyp, { name: string; preis: number; einheit: string; co2ProLiter: number }> = {
  benzin: { name: 'Super E10', preis: 1.70, einheit: '€/l', co2ProLiter: 2.37 },
  superplus: { name: 'Super E5 / Plus', preis: 1.82, einheit: '€/l', co2ProLiter: 2.37 },
  diesel: { name: 'Diesel', preis: 1.60, einheit: '€/l', co2ProLiter: 2.65 },
  lpg: { name: 'Autogas (LPG)', preis: 0.75, einheit: '€/l', co2ProLiter: 1.64 },
};

// Fahrzeugtypen mit Durchschnittsverbrauch
const FAHRZEUGTYPEN = [
  { name: 'Kleinwagen', verbrauch: 5.5, emoji: '🚗' },
  { name: 'Kompaktklasse', verbrauch: 6.5, emoji: '🚙' },
  { name: 'Mittelklasse', verbrauch: 7.5, emoji: '🚘' },
  { name: 'Oberklasse/SUV', verbrauch: 9.0, emoji: '🚐' },
  { name: 'Sportwagen', verbrauch: 11.0, emoji: '🏎️' },
  { name: 'Eigener Wert', verbrauch: 0, emoji: '⚙️' },
];

// CO2-Steuer pro Tonne (2025: 55€, 2026: 65€)
const CO2_STEUER_PRO_TONNE_2025 = 55;
const CO2_STEUER_PRO_TONNE_2026 = 65;

// Bahnpreise für Vergleich (Durchschnitt pro 100km)
const BAHN_PREIS_PRO_100KM = 15; // ca. Durchschnitt mit Sparpreis
const FERNBUS_PREIS_PRO_100KM = 8; // ca. FlixBus-Niveau

export default function SpritkostenRechner() {
  const [streckeKm, setStreckeKm] = useState(500);
  const [hinUndZurueck, setHinUndZurueck] = useState(false);
  const [kraftstoff, setKraftstoff] = useState<Kraftstofftyp>('benzin');
  const [verbrauchType, setVerbrauchType] = useState(2); // Index für Mittelklasse
  const [verbrauchEigen, setVerbrauchEigen] = useState(7);
  const [spritpreis, setSpritpreis] = useState(KRAFTSTOFF_PREISE.benzin.preis);
  const [anzahlMitfahrer, setAnzahlMitfahrer] = useState(1);
  const [verwendeAktuellenPreis, setVerwendeAktuellenPreis] = useState(true);

  // Verbrauch je nach Typ
  const verbrauch = verbrauchType === 5 ? verbrauchEigen : FAHRZEUGTYPEN[verbrauchType].verbrauch;

  // Kraftstoffpreis aktualisieren wenn Typ wechselt
  const handleKraftstoffChange = (neuerTyp: Kraftstofftyp) => {
    setKraftstoff(neuerTyp);
    if (verwendeAktuellenPreis) {
      setSpritpreis(KRAFTSTOFF_PREISE[neuerTyp].preis);
    }
  };

  const ergebnis = useMemo(() => {
    const effektiveStrecke = hinUndZurueck ? streckeKm * 2 : streckeKm;
    
    // Grundberechnung: Strecke / 100 * Verbrauch * Preis
    const verbrauchGesamt = (effektiveStrecke / 100) * verbrauch;
    const kostenGesamt = verbrauchGesamt * spritpreis;
    const kostenProKm = kostenGesamt / effektiveStrecke;
    const kostenProPerson = kostenGesamt / anzahlMitfahrer;
    
    // CO2-Berechnung
    const co2ProLiter = KRAFTSTOFF_PREISE[kraftstoff].co2ProLiter;
    const co2Gesamt = verbrauchGesamt * co2ProLiter; // in kg
    const co2ProKm = co2Gesamt / effektiveStrecke * 1000; // in g/km
    
    // CO2-Steueranteil im Preis (geschätzt)
    const co2SteuerAnteil2025 = (co2ProLiter * CO2_STEUER_PRO_TONNE_2025 / 1000); // €/Liter
    const co2SteuerAnteil2026 = (co2ProLiter * CO2_STEUER_PRO_TONNE_2026 / 1000);
    const co2SteuerGesamt = verbrauchGesamt * co2SteuerAnteil2025;
    
    // Vergleich mit ÖPNV
    const bahnKosten = (effektiveStrecke / 100) * BAHN_PREIS_PRO_100KM;
    const fernbusKosten = (effektiveStrecke / 100) * FERNBUS_PREIS_PRO_100KM;
    
    // Auto günstiger ab wie vielen Personen?
    const personenFuerBahnvorteil = Math.ceil(kostenGesamt / bahnKosten);
    
    return {
      effektiveStrecke,
      verbrauchGesamt,
      kostenGesamt,
      kostenProKm,
      kostenProPerson,
      co2Gesamt,
      co2ProKm,
      co2SteuerAnteil2025,
      co2SteuerAnteil2026,
      co2SteuerGesamt,
      bahnKosten,
      fernbusKosten,
      personenFuerBahnvorteil,
    };
  }, [streckeKm, hinUndZurueck, verbrauch, spritpreis, kraftstoff, anzahlMitfahrer]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatNumber = (n: number, decimals = 1) => n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Strecke */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrstrecke</span>
            <span className="text-xs text-gray-500 block mt-1">
              Entfernung in Kilometern
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={streckeKm}
              onChange={(e) => setStreckeKm(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-lg"
              min="1"
              max="10000"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">km</span>
          </div>
          <input
            type="range"
            value={streckeKm}
            onChange={(e) => setStreckeKm(Number(e.target.value))}
            className="w-full mt-2 accent-green-500"
            min="10"
            max="2000"
            step="10"
          />
        </div>

        {/* Hin und Zurück Toggle */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setHinUndZurueck(false)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !hinUndZurueck
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">➡️</span>
              <span className="block text-sm mt-1">Einfache Fahrt</span>
            </button>
            <button
              onClick={() => setHinUndZurueck(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                hinUndZurueck
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">↔️</span>
              <span className="block text-sm mt-1">Hin & Zurück</span>
            </button>
          </div>
          {hinUndZurueck && (
            <p className="text-sm text-green-600 mt-2 text-center">
              Gesamtstrecke: {formatNumber(streckeKm * 2, 0)} km
            </p>
          )}
        </div>

        {/* Kraftstoffart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kraftstoffart</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.entries(KRAFTSTOFF_PREISE) as [Kraftstofftyp, typeof KRAFTSTOFF_PREISE.benzin][]).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleKraftstoffChange(key)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  kraftstoff === key
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">
                  {key === 'benzin' ? '⛽' : key === 'diesel' ? '🛢️' : key === 'lpg' ? '💨' : '⛽'}
                </span>
                <span className="block mt-1">{value.name}</span>
                <span className="block text-xs opacity-70">{formatEuro(value.preis)}/l</span>
              </button>
            ))}
          </div>
        </div>

        {/* Verbrauch (Fahrzeugtyp) */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugtyp / Verbrauch</span>
            <span className="text-xs text-gray-500 block mt-1">
              Durchschnittsverbrauch in l/100km
            </span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {FAHRZEUGTYPEN.map((typ, index) => (
              <button
                key={index}
                onClick={() => setVerbrauchType(index)}
                className={`py-2 px-2 rounded-xl font-medium transition-all text-xs ${
                  verbrauchType === index
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{typ.emoji}</span>
                <span className="block mt-1">{typ.name}</span>
                {typ.verbrauch > 0 && (
                  <span className="block text-xs opacity-70">{typ.verbrauch}l</span>
                )}
              </button>
            ))}
          </div>
          
          {verbrauchType === 5 && (
            <div className="mt-3">
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={verbrauchEigen}
                  onChange={(e) => setVerbrauchEigen(Number(e.target.value))}
                  className="w-32 p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 text-center"
                  min="1"
                  max="30"
                  step="0.5"
                />
                <span className="text-gray-500">l/100km</span>
              </div>
            </div>
          )}
        </div>

        {/* Spritpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Spritpreis</span>
            <span className="text-xs text-gray-500 block mt-1">
              Aktueller Preis pro Liter
            </span>
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={spritpreis}
                onChange={(e) => {
                  setSpritpreis(Number(e.target.value));
                  setVerwendeAktuellenPreis(false);
                }}
                className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-green-500 text-lg"
                min="0.50"
                max="3.00"
                step="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€/l</span>
            </div>
            <button
              onClick={() => {
                setSpritpreis(KRAFTSTOFF_PREISE[kraftstoff].preis);
                setVerwendeAktuellenPreis(true);
              }}
              className="px-4 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-all"
              title="Durchschnittspreis 2025/2026 verwenden"
            >
              🔄 Ø-Preis
            </button>
          </div>
          <input
            type="range"
            value={spritpreis}
            onChange={(e) => {
              setSpritpreis(Number(e.target.value));
              setVerwendeAktuellenPreis(false);
            }}
            className="w-full mt-2 accent-green-500"
            min="1.00"
            max="2.50"
            step="0.01"
          />
        </div>

        {/* Anzahl Mitfahrer */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahl Personen im Auto</span>
            <span className="text-xs text-gray-500 block mt-1">
              Für Berechnung der Kosten pro Person
            </span>
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-xl">
              <button
                onClick={() => setAnzahlMitfahrer(Math.max(1, anzahlMitfahrer - 1))}
                className="px-4 py-3 text-xl font-bold text-gray-600 hover:bg-gray-200 rounded-l-xl transition-all"
              >
                −
              </button>
              <span className="px-6 py-3 text-xl font-bold text-gray-800">{anzahlMitfahrer}</span>
              <button
                onClick={() => setAnzahlMitfahrer(Math.min(9, anzahlMitfahrer + 1))}
                className="px-4 py-3 text-xl font-bold text-gray-600 hover:bg-gray-200 rounded-r-xl transition-all"
              >
                +
              </button>
            </div>
            <span className="text-gray-500">{anzahlMitfahrer === 1 ? 'Person' : 'Personen'}</span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">⛽ Ihre Spritkosten</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.kostenGesamt)}</span>
          </div>
          <p className="text-green-100 mt-2 text-sm">
            {formatNumber(ergebnis.effektiveStrecke, 0)} km • {formatNumber(ergebnis.verbrauchGesamt, 1)} Liter {KRAFTSTOFF_PREISE[kraftstoff].name}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro Kilometer</span>
            <div className="text-xl font-bold">{formatNumber(ergebnis.kostenProKm * 100, 1)} Cent</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Verbrauch</span>
            <div className="text-xl font-bold">{formatNumber(ergebnis.verbrauchGesamt, 1)} l</div>
          </div>
          {anzahlMitfahrer > 1 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm col-span-2 sm:col-span-1">
              <span className="text-sm opacity-80">Pro Person</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.kostenProPerson)}</div>
            </div>
          )}
        </div>

        {/* CO2 Info */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🌱</span>
            <span className="font-medium">CO₂-Ausstoß dieser Fahrt</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="opacity-80">Gesamt</span>
              <p className="font-bold text-lg">{formatNumber(ergebnis.co2Gesamt, 1)} kg</p>
            </div>
            <div>
              <span className="opacity-80">Pro Kilometer</span>
              <p className="font-bold text-lg">{formatNumber(ergebnis.co2ProKm, 0)} g/km</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kostenaufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Kostenaufschlüsselung</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Strecke</span>
            <span className="font-bold text-gray-900">
              {formatNumber(streckeKm, 0)} km {hinUndZurueck ? '× 2' : ''} = {formatNumber(ergebnis.effektiveStrecke, 0)} km
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Verbrauch ({formatNumber(verbrauch, 1)} l/100km)</span>
            <span className="text-gray-900">{formatNumber(ergebnis.verbrauchGesamt, 2)} Liter</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Spritpreis ({KRAFTSTOFF_PREISE[kraftstoff].name})</span>
            <span className="text-gray-900">{formatEuro(spritpreis)} / Liter</span>
          </div>
          
          <div className="flex justify-between py-3 bg-green-50 -mx-6 px-6 mt-4">
            <span className="font-bold text-green-800">Spritkosten gesamt</span>
            <span className="font-bold text-2xl text-green-900">{formatEuro(ergebnis.kostenGesamt)}</span>
          </div>
          
          {anzahlMitfahrer > 1 && (
            <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
              <span className="text-gray-600">÷ {anzahlMitfahrer} Personen</span>
              <span className="font-bold text-green-700">{formatEuro(ergebnis.kostenProPerson)} pro Person</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600">
            <strong>Formel:</strong> {formatNumber(ergebnis.effektiveStrecke, 0)} km ÷ 100 × {formatNumber(verbrauch, 1)} l/100km × {formatEuro(spritpreis)}/l = {formatEuro(ergebnis.kostenGesamt)}
          </p>
        </div>
      </div>

      {/* Vergleich mit Alternativen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🚆 Vergleich mit Bahn & Bus</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className={`p-4 rounded-xl text-center ${
            ergebnis.kostenProPerson <= ergebnis.bahnKosten / anzahlMitfahrer 
              ? 'bg-green-100 border-2 border-green-300' 
              : 'bg-gray-50'
          }`}>
            <span className="text-2xl">🚗</span>
            <p className="text-sm text-gray-600 mt-1">Auto</p>
            <p className="font-bold text-lg">{formatEuro(ergebnis.kostenProPerson)}</p>
            <p className="text-xs text-gray-500">pro Person</p>
          </div>
          
          <div className={`p-4 rounded-xl text-center ${
            ergebnis.bahnKosten < ergebnis.kostenProPerson 
              ? 'bg-blue-100 border-2 border-blue-300' 
              : 'bg-gray-50'
          }`}>
            <span className="text-2xl">🚆</span>
            <p className="text-sm text-gray-600 mt-1">Bahn (Ø)</p>
            <p className="font-bold text-lg">{formatEuro(ergebnis.bahnKosten)}</p>
            <p className="text-xs text-gray-500">pro Person</p>
          </div>
          
          <div className={`p-4 rounded-xl text-center ${
            ergebnis.fernbusKosten < ergebnis.kostenProPerson 
              ? 'bg-purple-100 border-2 border-purple-300' 
              : 'bg-gray-50'
          }`}>
            <span className="text-2xl">🚌</span>
            <p className="text-sm text-gray-600 mt-1">Fernbus</p>
            <p className="font-bold text-lg">{formatEuro(ergebnis.fernbusKosten)}</p>
            <p className="text-xs text-gray-500">pro Person</p>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
          {anzahlMitfahrer === 1 ? (
            <>
              💡 <strong>Tipp:</strong> Ab {ergebnis.personenFuerBahnvorteil} Personen im Auto ist die Fahrt pro Kopf günstiger als die Bahn!
            </>
          ) : ergebnis.kostenProPerson < ergebnis.bahnKosten ? (
            <>
              ✓ <strong>Gute Wahl:</strong> Mit {anzahlMitfahrer} Personen ist das Auto {formatEuro(ergebnis.bahnKosten - ergebnis.kostenProPerson)} pro Person günstiger als die Bahn.
            </>
          ) : (
            <>
              💡 <strong>Hinweis:</strong> Die Bahn wäre {formatEuro(ergebnis.kostenProPerson - ergebnis.bahnKosten)} pro Person günstiger.
            </>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Bahnpreise: Durchschnitt mit Sparpreis (~15€/100km). Fernbus: ca. 8€/100km (FlixBus-Niveau). 
          Auto: nur Spritkosten, ohne Verschleiß, Versicherung, Wartung.
        </p>
      </div>

      {/* CO2-Steuer Info */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🌱 CO₂-Steuer im Spritpreis</h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Im Spritpreis ist die CO₂-Steuer bereits enthalten. So viel zahlen Sie für diese Fahrt:
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-amber-50 rounded-xl">
            <span className="text-sm text-amber-700">2025: 55€/Tonne</span>
            <p className="font-bold text-lg text-amber-900">
              {formatEuro(ergebnis.verbrauchGesamt * ergebnis.co2SteuerAnteil2025)}
            </p>
            <p className="text-xs text-amber-600">
              ca. {formatNumber(ergebnis.co2SteuerAnteil2025 * 100, 1)} Cent/Liter
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl">
            <span className="text-sm text-orange-700">2026: 65€/Tonne</span>
            <p className="font-bold text-lg text-orange-900">
              {formatEuro(ergebnis.verbrauchGesamt * ergebnis.co2SteuerAnteil2026)}
            </p>
            <p className="text-xs text-orange-600">
              ca. {formatNumber(ergebnis.co2SteuerAnteil2026 * 100, 1)} Cent/Liter
            </p>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>
            <strong>CO₂-Steuer-Entwicklung:</strong> 2021: 25€ → 2022: 30€ → 2023: 30€ → 2024: 45€ → 2025: 55€ → 2026: 65€/Tonne
          </p>
        </div>
      </div>

      {/* Streckenbeispiele */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📍 Beliebte Strecken</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { von: 'Berlin', nach: 'München', km: 585 },
            { von: 'Hamburg', nach: 'Frankfurt', km: 490 },
            { von: 'Köln', nach: 'Berlin', km: 575 },
            { von: 'München', nach: 'Stuttgart', km: 230 },
            { von: 'Frankfurt', nach: 'Düsseldorf', km: 230 },
            { von: 'Hamburg', nach: 'Berlin', km: 290 },
          ].map((strecke, i) => (
            <button
              key={i}
              onClick={() => setStreckeKm(strecke.km)}
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left"
            >
              <span className="text-sm text-gray-700">
                {strecke.von} → {strecke.nach}
              </span>
              <span className="text-sm font-medium text-green-600">{strecke.km} km</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So berechnen Sie Ihre Spritkosten</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Formel:</strong> (Strecke ÷ 100) × Verbrauch × Spritpreis = Kosten</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Beispiel:</strong> 500 km ÷ 100 × 7 l × 1,70 € = 59,50 €</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Verbrauch:</strong> Finden Sie Ihren realen Verbrauch im Bordcomputer oder durch Tanken-Methode</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Vollkosten:</strong> Für echte Kosten pro km addieren Sie ca. 20-30 Cent für Verschleiß, Versicherung & Wartung</span>
          </li>
        </ul>
      </div>

      {/* Spartipps */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💡 Spartipps für weniger Spritkosten</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>🚗</span>
            <span><strong>Vorausschauend fahren:</strong> Gleichmäßiges Tempo spart bis zu 20% Sprit</span>
          </li>
          <li className="flex gap-2">
            <span>⚖️</span>
            <span><strong>Reifendruck prüfen:</strong> 0,5 bar zu wenig = 5% mehr Verbrauch</span>
          </li>
          <li className="flex gap-2">
            <span>🕐</span>
            <span><strong>Günstig tanken:</strong> Abends (18-20 Uhr) ist Sprit oft 5-10 Cent billiger</span>
          </li>
          <li className="flex gap-2">
            <span>🧳</span>
            <span><strong>Ballast entfernen:</strong> 100 kg Zusatzgewicht = 0,5 l mehr Verbrauch</span>
          </li>
          <li className="flex gap-2">
            <span>🌀</span>
            <span><strong>Klimaanlage sparsam:</strong> Bis 25°C Fenster öffnen, darüber AC nutzen</span>
          </li>
          <li className="flex gap-2">
            <span>👥</span>
            <span><strong>Fahrgemeinschaften:</strong> Kosten teilen = alle sparen</span>
          </li>
        </ul>
      </div>

      {/* Aktuelle Preise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">⛽ Aktuelle Durchschnittspreise 2025/2026</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kraftstoff</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Ø-Preis</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">CO₂/Liter</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(KRAFTSTOFF_PREISE) as [Kraftstofftyp, typeof KRAFTSTOFF_PREISE.benzin][]).map(([key, value]) => (
                <tr key={key} className={`border-b border-gray-100 ${kraftstoff === key ? 'bg-green-50' : ''}`}>
                  <td className="py-3 px-4 text-gray-600">{value.name}</td>
                  <td className="py-3 px-4 text-center font-bold">{formatEuro(value.preis)}</td>
                  <td className="py-3 px-4 text-center text-gray-500">{value.co2ProLiter} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Durchschnittspreise Deutschland. Tagesaktuelle Preise schwanken je nach Region und Uhrzeit.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Links</h4>
        <div className="space-y-1">
          <a 
            href="https://www.adac.de/verkehr/tanken-kraftstoff-antrieb/tipps-zum-tanken/aktuelle-kraftstoffpreise/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Aktuelle Kraftstoffpreise
          </a>
          <a 
            href="https://www.spritrechner.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Spritrechner.de – Benzinpreise vergleichen
          </a>
          <a 
            href="https://www.umweltbundesamt.de/daten/klima/treibhausgas-emissionen-in-deutschland"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Umweltbundesamt – CO₂-Emissionen
          </a>
          <a 
            href="https://www.bundesregierung.de/breg-de/themen/klimaschutz/co2-bepreisung"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – CO₂-Bepreisung
          </a>
        </div>
      </div>
    </div>
  );
}
