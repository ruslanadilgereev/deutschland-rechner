import { useState } from 'react';

// Fahrschul-Faustformeln (ADAC):
//   Reaktionsweg = (v/10) × Reaktionszeit-Faktor (Standard 3 für 1 s)
//   Bremsweg normal = (v/10)²
//   Bremsweg Gefahrenbremsung = (v/10)² / 2
// v in km/h. Die Faustformel für den Reaktionsweg unterstellt rund 1 Sekunde
// Reaktionszeit; (v/10) × 3 entspricht der bei 1 s zurückgelegten Strecke.
// Quelle: ADAC.

type GeschwPreset = { label: string; v: number };
const PRESETS: GeschwPreset[] = [
  { label: '30', v: 30 },
  { label: '50', v: 50 },
  { label: '70', v: 70 },
  { label: '100', v: 100 },
  { label: '130', v: 130 },
];

export function BremswegRechner() {
  const [tempo, setTempo] = useState(50);
  const [gefahr, setGefahr] = useState(false);
  const [reaktionszeit, setReaktionszeit] = useState(1);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const v10 = tempo / 10;

  // Reaktionsweg: Faustformel (v/10)×3 gilt für 1 s. Bei abweichender
  // Reaktionszeit skalieren wir den Faktor 3 proportional (3 × Reaktionszeit).
  const reaktionsweg = v10 * 3 * reaktionszeit;

  // Bremsweg: normal (v/10)², bei Gefahren-/Vollbremsung halbiert.
  const bremswegNormal = v10 * v10;
  const bremsweg = gefahr ? bremswegNormal / 2 : bremswegNormal;

  const anhalteweg = reaktionsweg + bremsweg;

  const formatM = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Geschwindigkeit */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Geschwindigkeit (km/h)</span>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setTempo(p.v)}
              className={`p-2 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                tempo === p.v
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label className="block">
          <span className="text-xs text-gray-500">eigene Geschwindigkeit (km/h)</span>
          <div className="mt-1 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={tempo}
              onChange={(e) => setTempo(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km/h</span>
          </div>
        </label>
      </div>

      {/* Optionen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div>
          <span className="text-gray-700 font-medium block mb-2">Bremsmodus</span>
          <div className="flex rounded-xl border border-gray-300 overflow-hidden">
            <button
              onClick={() => setGefahr(false)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                !gefahr ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              Normale Bremsung
            </button>
            <button
              onClick={() => setGefahr(true)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                gefahr ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              Gefahrenbremsung
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Bei der Gefahren- bzw. Vollbremsung halbiert sich der Bremsweg gegenüber der normalen
            Faustformel.
          </p>
        </div>

        <label className="block border-t border-gray-100 pt-4">
          <span className="text-gray-700 font-medium">Reaktionszeit (Sekunden)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={reaktionszeit}
              onChange={(e) => setReaktionszeit(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">s</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Faustformel rechnet mit 1 Sekunde. Müdigkeit, Ablenkung oder Alkohol verlängern die
            Reaktionszeit deutlich.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          Anhalteweg bei {formatM(tempo)} km/h
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatM(anhalteweg)}</span>
            <span className="text-xl text-blue-200">Meter</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            {gefahr ? 'Gefahrenbremsung' : 'normale Bremsung'} · Reaktionszeit{' '}
            {formatM(reaktionszeit)} s
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">Reaktionsweg</span>
              <span className="font-bold">{formatM(reaktionsweg)} m</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Bremsweg</span>
              <span className="font-bold">{formatM(bremsweg)} m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Reaktionsweg</strong> = (v ÷ 10) × 3 × Reaktionszeit = ({formatM(tempo)} ÷ 10) × 3
            × {formatM(reaktionszeit)} = <strong>{formatM(reaktionsweg)} m</strong>
          </p>
          <p>
            <strong>Bremsweg</strong> = (v ÷ 10)²{gefahr ? ' ÷ 2' : ''} = ({formatM(tempo)} ÷ 10)²
            {gefahr ? ' ÷ 2' : ''} = <strong>{formatM(bremsweg)} m</strong>
          </p>
          <p>
            <strong>Anhalteweg</strong> = Reaktionsweg + Bremsweg = {formatM(reaktionsweg)} +{' '}
            {formatM(bremsweg)} = <strong>{formatM(anhalteweg)} m</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Faustformeln gelten nur unter Idealbedingungen (trockene
          Fahrbahn, gute Reifen, konzentrierter Fahrer). Bei Nässe, Schnee, abgefahrenen Reifen,
          Beladung, Müdigkeit oder Alkohol verlängert sich der Anhalteweg teils erheblich. Die Werte
          sind ein Richtwert für Fahrschule und Eigenkontrolle, keine Rechtsberatung. Angaben ohne
          Gewähr.
        </p>
      </div>
    </div>
  );
}

export default BremswegRechner;
