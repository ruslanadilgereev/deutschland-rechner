import { useState } from 'react';

// Schüttdichten (lose, t/m³) je Material – Richtwerte, editierbar.
type Material = { id: string; name: string; icon: string; rho: number };
const MATERIALIEN: Material[] = [
  { id: 'kies', name: 'Kies', icon: '🪨', rho: 1.6 },
  { id: 'schotter', name: 'Schotter', icon: '🧱', rho: 1.8 },
  { id: 'splitt', name: 'Splitt', icon: '⚫', rho: 1.45 },
  { id: 'sand', name: 'Sand', icon: '🏖️', rho: 1.55 },
];

export function SchotterKiesRechner() {
  const [matId, setMatId] = useState('schotter');
  const [rho, setRho] = useState(1.8);
  const [eingabe, setEingabe] = useState<'masse' | 'flaeche'>('masse');
  const [flaeche, setFlaeche] = useState(20);
  const [laenge, setLaenge] = useState(5);
  const [breite, setBreite] = useState(4);
  const [dickeCm, setDickeCm] = useState(20);
  const [zuschlag, setZuschlag] = useState(6);
  const [bigBagT, setBigBagT] = useState(1.0);
  const [lkwT, setLkwT] = useState(5);

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleMat = (id: string) => {
    setMatId(id);
    setRho(MATERIALIEN.find((m) => m.id === id)!.rho);
  };

  const flaecheM2 = eingabe === 'flaeche' ? flaeche : laenge * breite;
  const volumen = flaecheM2 * (dickeCm / 100);
  const volumenBestellt = volumen * (1 + zuschlag / 100);
  const masseT = volumenBestellt * rho;
  const bigBags = bigBagT > 0 ? Math.ceil(masseT / bigBagT) : 0;
  const lkw = lkwT > 0 ? Math.ceil(masseT / lkwT) : 0;

  const fmt = (v: number, max = 2) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });

  return (
    <div className="max-w-lg mx-auto">

      {/* Material */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Material</span>
        <div className="grid grid-cols-4 gap-2">
          {MATERIALIEN.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMat(m.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                matId === m.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-center leading-tight">{m.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Schüttdichte gewählt: {fmt(rho, 2)} t/m³ (editierbar unten).</p>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div>
          <span className="text-gray-700 font-medium block mb-2">Fläche angeben als</span>
          <div className="grid grid-cols-2 gap-2">
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
          <span className="text-gray-700 font-medium">Schichtdicke</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={dickeCm}
              onChange={(e) => setDickeCm(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Schüttdichte</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.05}
                value={rho}
                onChange={(e) => setRho(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">t/m³</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Zuschlag</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={30}
                step={1}
                value={zuschlag}
                onChange={(e) => setZuschlag(Math.min(30, toNumber(e.target.value)))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </label>
        </div>
        <span className="text-xs text-gray-400 block">
          Verdichtungszuschlag für Tragschichten ca. 6 %. Schüttdichte je Gestein/Körnung anpassbar.
        </span>

        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
          <label className="block">
            <span className="text-gray-700 font-medium">BigBag-Größe</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[0.5, 1.0].map((b) => (
                <button
                  key={b}
                  onClick={() => setBigBagT(b)}
                  className={`py-2 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                    bigBagT === b
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {fmt(b, 1)} t
                </button>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">LKW-Nutzlast</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={lkwT}
                onChange={(e) => setLkwT(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">t</span>
            </div>
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Menge</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(masseT)}</span>
            <span className="text-xl text-blue-200">Tonnen</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            entspricht {fmt(volumenBestellt)} m³ (inkl. {fmt(zuschlag, 0)} % Zuschlag)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">BigBags à {fmt(bigBagT, 1)} t</span>
              <span className="font-bold">{fmt(bigBags, 0)} Stück</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">LKW-Fuhren à {fmt(lkwT, 0)} t</span>
              <span className="font-bold">{fmt(lkw, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Volumen</strong> = {fmt(flaecheM2)} m² × {fmt(dickeCm / 100, 2)} m ={' '}
            {fmt(volumen)} m³; <strong>+ {fmt(zuschlag, 0)} %</strong> = {fmt(volumenBestellt)} m³
          </p>
          <p>
            <strong>Masse</strong> = {fmt(volumenBestellt)} m³ × {fmt(rho, 2)} t/m³ ={' '}
            <strong>{fmt(masseT)} t</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Schüttdichten sind Richtwerte und variieren je nach Gestein,
          Körnung und Feuchte – das tatsächliche Liefergewicht erfragen Sie am besten beim Händler.
          Für befahrbare Tragschichten (Einfahrt) ist ggf. ein Fachbetrieb für den richtigen Aufbau
          nötig. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default SchotterKiesRechner;
