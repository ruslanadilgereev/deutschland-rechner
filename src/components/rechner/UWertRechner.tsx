import { useState } from 'react';

// Wärmeübergangswiderstände Rsi/Rse nach DIN EN ISO 6946 je nach Bauteil
// und Richtung des Wärmestroms. GEG-Höchstwert (Anlage 7) zum Abgleich.
type Bauteil = {
  id: string;
  name: string;
  icon: string;
  rsi: number;
  rse: number;
  gegMax: number; // W/(m²K)
};

const BAUTEILE: Bauteil[] = [
  { id: 'wand', name: 'Außenwand', icon: '🧱', rsi: 0.13, rse: 0.04, gegMax: 0.24 },
  { id: 'dach', name: 'Steildach', icon: '🏠', rsi: 0.10, rse: 0.04, gegMax: 0.24 },
  { id: 'decke', name: 'Oberste Geschossdecke', icon: '⬆️', rsi: 0.10, rse: 0.04, gegMax: 0.24 },
  { id: 'keller', name: 'Kellerdecke / Boden', icon: '⬇️', rsi: 0.17, rse: 0.00, gegMax: 0.30 },
];

// Gängige Baustoffe mit Wärmeleitfähigkeit λ in W/(m·K) (Richtwerte).
const MATERIALIEN: { name: string; lambda: number }[] = [
  { name: 'Mineralwolle (WLG 035)', lambda: 0.035 },
  { name: 'EPS / Styropor (WLG 035)', lambda: 0.035 },
  { name: 'PUR/PIR-Hartschaum', lambda: 0.024 },
  { name: 'Holzfaserdämmung', lambda: 0.040 },
  { name: 'Vollziegel-Mauerwerk', lambda: 0.68 },
  { name: 'Hochlochziegel', lambda: 0.16 },
  { name: 'Kalksandstein', lambda: 0.99 },
  { name: 'Porenbeton', lambda: 0.11 },
  { name: 'Stahlbeton', lambda: 2.30 },
  { name: 'Gipsputz (innen)', lambda: 0.51 },
  { name: 'Kalkzementputz (außen)', lambda: 0.87 },
  { name: 'Eigener Wert', lambda: 0.040 },
];

type Schicht = { id: number; name: string; dickeCm: number; lambda: number };

let nextId = 5;

export function UWertRechner() {
  const [bauteilId, setBauteilId] = useState('wand');
  const [schichten, setSchichten] = useState<Schicht[]>([
    { id: 1, name: 'Gipsputz (innen)', dickeCm: 1.5, lambda: 0.51 },
    { id: 2, name: 'Vollziegel-Mauerwerk', dickeCm: 24, lambda: 0.68 },
    { id: 3, name: 'Mineralwolle (WLG 035)', dickeCm: 12, lambda: 0.035 },
    { id: 4, name: 'Kalkzementputz (außen)', dickeCm: 2, lambda: 0.87 },
  ]);

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const bauteil = BAUTEILE.find((b) => b.id === bauteilId)!;

  const updateSchicht = (id: number, patch: Partial<Schicht>) =>
    setSchichten((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addSchicht = () =>
    setSchichten((prev) => [
      ...prev,
      { id: nextId++, name: 'Eigener Wert', dickeCm: 5, lambda: 0.04 },
    ]);

  const removeSchicht = (id: number) =>
    setSchichten((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));

  // R je Schicht = d[m] / λ ; Summe + Rsi + Rse = R_T ; U = 1/R_T
  const summeR = schichten.reduce(
    (sum, s) => sum + (s.lambda > 0 ? s.dickeCm / 100 / s.lambda : 0),
    0
  );
  const rT = bauteil.rsi + summeR + bauteil.rse;
  const uWert = rT > 0 ? 1 / rT : 0;
  const gegOk = uWert <= bauteil.gegMax;

  const fmt = (v: number, max = 2) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });
  const fmt3 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 3 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Bauteil-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Bauteil</span>
        <div className="grid grid-cols-2 gap-2">
          {BAUTEILE.map((b) => (
            <button
              key={b.id}
              onClick={() => setBauteilId(b.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                bauteilId === b.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{b.icon}</span>
              <span className="text-left leading-tight">{b.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Rsi {fmt(bauteil.rsi, 2)} · Rse {fmt(bauteil.rse, 2)} m²K/W · GEG-Höchstwert {fmt(bauteil.gegMax, 2)} W/(m²K)
        </p>
      </div>

      {/* Schichten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-4">
        <span className="text-gray-700 font-medium block">Schichtaufbau (innen → außen)</span>
        {schichten.map((s, i) => (
          <div key={s.id} className="border border-gray-200 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Schicht {i + 1}</span>
              <button
                onClick={() => removeSchicht(s.id)}
                className="text-xs text-red-500 hover:text-red-700"
                aria-label="Schicht entfernen"
              >
                Entfernen
              </button>
            </div>
            <select
              value={MATERIALIEN.some((m) => m.name === s.name) ? s.name : 'Eigener Wert'}
              onChange={(e) => {
                const mat = MATERIALIEN.find((m) => m.name === e.target.value)!;
                updateSchicht(s.id, { name: mat.name, lambda: mat.lambda });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {MATERIALIEN.map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs text-gray-500">Dicke</span>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.5}
                    value={s.dickeCm}
                    onChange={(e) => updateSchicht(s.id, { dickeCm: toNumber(e.target.value) })}
                    className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                </div>
              </label>
              <label className="block">
                <span className="text-xs text-gray-500">λ (W/m·K)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.001}
                  value={s.lambda}
                  onChange={(e) => updateSchicht(s.id, { lambda: toNumber(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>
            </div>
            <p className="text-xs text-gray-400">
              R = {fmt(s.dickeCm)} cm ÷ {fmt3(s.lambda)} = {fmt3(s.lambda > 0 ? s.dickeCm / 100 / s.lambda : 0)} m²K/W
            </p>
          </div>
        ))}
        <button
          onClick={addSchicht}
          className="w-full py-2 rounded-xl border border-dashed border-blue-300 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
        >
          + Schicht hinzufügen
        </button>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">U-Wert des Bauteils</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt3(uWert)}</span>
            <span className="text-xl text-blue-200">W/(m²K)</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Wärmedurchgangswiderstand R_T = {fmt3(rT)} m²K/W
          </p>
        </div>

        <div
          className={`rounded-xl p-4 ${gegOk ? 'bg-green-400/20' : 'bg-red-400/20'} backdrop-blur-sm`}
        >
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-50">GEG-Höchstwert {bauteil.name}</span>
            <span className="font-bold">
              {gegOk ? '✓ erfüllt' : '✗ überschritten'} ({fmt(bauteil.gegMax, 2)})
            </span>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>R_T</strong> = Rsi + Σ(d ÷ λ) + Rse = {fmt(bauteil.rsi, 2)} + {fmt3(summeR)} +{' '}
            {fmt(bauteil.rse, 2)} = <strong>{fmt3(rT)} m²K/W</strong>
          </p>
          <p>
            <strong>U</strong> = 1 ÷ R_T = 1 ÷ {fmt3(rT)} = <strong>{fmt3(uWert)} W/(m²K)</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Ergebnis ist eine überschlägige Orientierung nach
          DIN EN ISO 6946. Die verwendeten λ-Werte sind Richtwerte, keine Bemessungswerte nach
          DIN 4108-4. Wärmebrücken, Befestiger und inhomogene Schichten sind nicht berücksichtigt.
          Der amtliche GEG-Nachweis muss durch einen Energieberater/Fachplaner erfolgen. Angaben
          ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default UWertRechner;
