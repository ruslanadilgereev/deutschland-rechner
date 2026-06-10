import { useState } from 'react';

// Verbrauchs-Richtwerte je Putzart in kg pro m² und mm Schichtdicke.
// Quelle: DIN 18550, hausgarten.net. Gips-/Maschinenputz ist leichter,
// Zement-/Außenputz schwerer. Werte sind Faustwerte – Produkt maßgeblich.
type Putzart = {
  id: string;
  name: string;
  icon: string;
  verbrauch: number; // kg/m²/mm
  dickeDefault: number; // mm
};

const PUTZARTEN: Putzart[] = [
  { id: 'gips', name: 'Gips-/Maschinenputz', icon: '🩶', verbrauch: 0.9, dickeDefault: 10 },
  { id: 'kalk', name: 'Kalk-/Kalkzementputz', icon: '🪣', verbrauch: 1.5, dickeDefault: 15 },
  { id: 'zement', name: 'Zement-/Außenputz', icon: '🧱', verbrauch: 1.6, dickeDefault: 20 },
];

type Eingabe = 'flaeche' | 'raum';

export function PutzRechner() {
  const [artId, setArtId] = useState('kalk');
  const [eingabe, setEingabe] = useState<Eingabe>('flaeche');
  const [flaeche, setFlaeche] = useState(30);
  const [laenge, setLaenge] = useState(5);
  const [hoehe, setHoehe] = useState(2.5);
  const [abzug, setAbzug] = useState(0);
  const [dickeMm, setDickeMm] = useState(15);
  const [sackGewicht, setSackGewicht] = useState(40);
  const [verschnitt, setVerschnitt] = useState(10);

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const art = PUTZARTEN.find((a) => a.id === artId)!;

  const handleArtWechsel = (id: string) => {
    setArtId(id);
    const a = PUTZARTEN.find((p) => p.id === id)!;
    setDickeMm(a.dickeDefault);
  };

  const flaecheM2 =
    eingabe === 'flaeche' ? flaeche : Math.max(0, laenge * hoehe - abzug);

  const mengeKg = flaecheM2 * dickeMm * art.verbrauch * (1 + verschnitt / 100);
  const saecke = sackGewicht > 0 ? Math.ceil(mengeKg / sackGewicht) : 0;

  const fmt = (v: number, max = 1) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });

  return (
    <div className="max-w-lg mx-auto">

      {/* Putzart-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Putzart</span>
        <div className="grid grid-cols-3 gap-2">
          {PUTZARTEN.map((a) => (
            <button
              key={a.id}
              onClick={() => handleArtWechsel(a.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                artId === a.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-center leading-tight">{a.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Verbrauch: {fmt(art.verbrauch, 2)} kg/m² je mm Schichtdicke.
        </p>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {/* Eingabeart-Umschalter */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Fläche angeben als</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setEingabe('flaeche')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                eingabe === 'flaeche'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Fläche in m²
            </button>
            <button
              onClick={() => setEingabe('raum')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                eingabe === 'raum'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Länge × Höhe
            </button>
          </div>
        </div>

        {eingabe === 'flaeche' ? (
          <label className="block">
            <span className="text-gray-700 font-medium">Putzfläche</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={flaeche}
                onChange={(e) => setFlaeche(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
            </div>
          </label>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-gray-700 font-medium">Wandlänge</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.1}
                    value={laenge}
                    onChange={(e) => setLaenge(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">m</span>
                </div>
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium">Wandhöhe</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.1}
                    value={hoehe}
                    onChange={(e) => setHoehe(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">m</span>
                </div>
              </label>
            </div>
            <label className="block">
              <span className="text-gray-700 font-medium">Abzug für Fenster, Türen</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={abzug}
                  onChange={(e) => setAbzug(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
            </label>
          </>
        )}

        <label className="block">
          <span className="text-gray-700 font-medium">Schichtdicke</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={dickeMm}
              onChange={(e) => setDickeMm(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">mm</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Innenputz typisch 10–15 mm, Außen-Unterputz ≥ 20 mm (DIN 18550).
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Sackgröße</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[25, 30, 40].map((sg) => (
              <button
                key={sg}
                onClick={() => setSackGewicht(sg)}
                className={`py-2 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                  sackGewicht === sg
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {sg} kg
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Verschnitt / Reserve</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={30}
              step={1}
              value={verschnitt}
              onChange={(e) => setVerschnitt(Math.min(30, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Empfehlung ca. 10 % für Unebenheiten und Reste.</span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigter Putz</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(saecke, 0)}</span>
            <span className="text-xl text-blue-200">Säcke à {sackGewicht} kg</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {fmt(flaecheM2)} m² bei {fmt(dickeMm, 0)} mm Schichtdicke
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Putzmenge (inkl. Verschnitt)</span>
              <span className="text-xl font-bold">{fmt(mengeKg, 0)} kg</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Verbrauch pro m²</span>
              <span className="font-bold">{fmt(dickeMm * art.verbrauch, 1)} kg/m²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Menge</strong> = Fläche × Dicke × Verbrauch × (1 + Verschnitt)
          </p>
          <p>
            = {fmt(flaecheM2)} m² × {fmt(dickeMm, 0)} mm × {fmt(art.verbrauch, 2)} kg ×{' '}
            {fmt(1 + verschnitt / 100, 2)} = <strong>{fmt(mengeKg, 0)} kg</strong>
          </p>
          <p>
            <strong>Säcke</strong> = {fmt(mengeKg, 0)} kg ÷ {sackGewicht} kg ={' '}
            <strong>{fmt(saecke, 0)} Säcke</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Verbrauchswerte sind Faustformeln nach DIN 18550. Der reale
          Verbrauch hängt stark vom Untergrund (Saugfähigkeit), der Wandebenheit und dem konkreten
          Produkt ab; maßgeblich sind die Herstellerangaben. Alle Angaben ohne Gewähr, keine
          Bauberatung.
        </p>
      </div>
    </div>
  );
}

export default PutzRechner;
