import { useState } from 'react';

// Rohdichte je Estrichart (frisch eingebaut, Richtwerte):
// Zementestrich (CT) ≈ 2.100 kg/m³, Calciumsulfat-/Anhydritestrich (CA) ≈ 2.000 kg/m³.
// Quelle: VDZ / Holcim. Mindestdicken schwimmender Estrich nach DIN 18560-2.
type EstrichArt = 'CT' | 'CA';

const ARTEN: { id: EstrichArt; name: string; icon: string; dichte: number; mindestDicke: number }[] = [
  { id: 'CT', name: 'Zementestrich (CT)', icon: '🏗️', dichte: 2100, mindestDicke: 45 },
  { id: 'CA', name: 'Calciumsulfat (CA)', icon: '💧', dichte: 2000, mindestDicke: 40 },
];

type Eingabe = 'flaeche' | 'masse';

export function EstrichRechner() {
  const [eingabe, setEingabe] = useState<Eingabe>('flaeche');
  const [flaeche, setFlaeche] = useState(25);
  const [laenge, setLaenge] = useState(5);
  const [breite, setBreite] = useState(5);
  const [dickeMm, setDickeMm] = useState(50);
  const [artId, setArtId] = useState<EstrichArt>('CT');
  const [sackGewicht, setSackGewicht] = useState(40);
  const [verschnitt, setVerschnitt] = useState(10);

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const art = ARTEN.find((a) => a.id === artId)!;
  const flaecheM2 = eingabe === 'flaeche' ? flaeche : laenge * breite;
  const dickeM = dickeMm / 1000;

  const volumenM3 = flaecheM2 * dickeM;
  const gewichtKg = volumenM3 * art.dichte;
  const gewichtBruttoKg = gewichtKg * (1 + verschnitt / 100);
  const saecke = sackGewicht > 0 ? Math.ceil(gewichtBruttoKg / sackGewicht) : 0;

  // Trocknungsfaustregel: ~7 Tage je cm bei 20 °C / 65 % rF.
  const trocknungTage = (dickeMm / 10) * 7;

  // Warnung bei Unterschreiten der Mindestdicke (schwimmender Estrich)
  const unterMindestdicke = dickeMm > 0 && dickeMm < art.mindestDicke;

  const fmt = (v: number, max = 2) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });

  return (
    <div className="max-w-lg mx-auto">

      {/* Estrichart-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Estrichart</span>
        <div className="grid grid-cols-2 gap-2">
          {ARTEN.map((a) => (
            <button
              key={a.id}
              onClick={() => setArtId(a.id)}
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
              onClick={() => setEingabe('masse')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                eingabe === 'masse'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Länge × Breite
            </button>
          </div>
        </div>

        {eingabe === 'flaeche' ? (
          <label className="block">
            <span className="text-gray-700 font-medium">Fläche</span>
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
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-gray-700 font-medium">Länge</span>
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
              <span className="text-gray-700 font-medium">Breite</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={breite}
                  onChange={(e) => setBreite(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </label>
          </div>
        )}

        <label className="block">
          <span className="text-gray-700 font-medium">Estrichdicke</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={5}
              value={dickeMm}
              onChange={(e) => setDickeMm(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">mm</span>
          </div>
          {unterMindestdicke && (
            <span className="text-xs text-orange-600 mt-1 block">
              ⚠️ Unter der Mindestdicke für schwimmenden {art.id}-Estrich ({art.mindestDicke} mm nach DIN 18560-2).
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Sackgröße</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[25, 40].map((sg) => (
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
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigter Estrich</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(saecke, 0)}</span>
            <span className="text-xl text-blue-200">Säcke à {sackGewicht} kg</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {fmt(flaecheM2)} m² bei {fmt(dickeMm, 0)} mm Dicke
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Volumen</span>
              <span className="text-xl font-bold">{fmt(volumenM3, 3)} m³</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Materialgewicht (inkl. Verschnitt)</span>
              <span className="font-bold">{fmt(gewichtBruttoKg, 0)} kg ({fmt(gewichtBruttoKg / 1000)} t)</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Trocknung (Faustregel)</span>
              <span className="font-bold">ca. {fmt(trocknungTage, 0)} Tage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Volumen</strong> = Fläche × Dicke = {fmt(flaecheM2)} m² × {fmt(dickeM, 3)} m ={' '}
            <strong>{fmt(volumenM3, 3)} m³</strong>
          </p>
          <p>
            <strong>Gewicht</strong> = Volumen × {fmt(art.dichte, 0)} kg/m³ × {fmt(1 + verschnitt / 100)} ={' '}
            <strong>{fmt(gewichtBruttoKg, 0)} kg</strong>
          </p>
          <p>
            <strong>Säcke</strong> = {fmt(gewichtBruttoKg, 0)} kg ÷ {sackGewicht} kg ={' '}
            <strong>{fmt(saecke, 0)} Säcke</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Ergebnis ist eine Näherung für den Materialbedarf und ersetzt
          keine Fachplanung oder Statik. Die Mindestdicken nach DIN 18560-2 sind anwendungs- und
          lastabhängig; maßgeblich sind die Herstellerangaben des konkreten Produkts. Alle Angaben
          ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default EstrichRechner;
