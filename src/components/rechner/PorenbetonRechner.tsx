import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Wanddicke bestimmt den Dünnbettmörtel-(Kleber-)Verbrauch:
// Faustwert ~0,8 kg/m² je 100 mm Wanddicke.
const KLEBER_KG_PRO_M2_PRO_100MM = 0.8;

const WANDDICKEN = [11.5, 17.5, 24, 30, 36.5]; // cm

export function PorenbetonRechner() {
  const [wandLaenge, setWandLaenge] = useState(5);
  const [wandHoehe, setWandHoehe] = useState(2.5);
  const [wanddicke, setWanddicke] = useState(24); // cm
  const [steinLaenge, setSteinLaenge] = useState(599); // mm
  const [steinHoehe, setSteinHoehe] = useState(199); // mm
  const [oeffnungen, setOeffnungen] = useState(0);
  const [verschnitt, setVerschnitt] = useState(5);
  const [proPalette, setProPalette] = useState(50);
  const [sackKg, setSackKg] = useState(25);

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Steine pro m² = 1 / (Länge_m × Höhe_m); Plansteine: Rastermaß enthält Dünnbettfuge
  const lM = steinLaenge / 1000;
  const hM = steinHoehe / 1000;
  const steineProM2 = lM > 0 && hM > 0 ? 1 / (lM * hM) : 0;

  const nettoFlaeche = Math.max(0, wandLaenge * wandHoehe - oeffnungen);
  const steineGesamt = Math.ceil(nettoFlaeche * steineProM2 * (1 + verschnitt / 100));
  const paletten = proPalette > 0 ? Math.ceil(steineGesamt / proPalette) : 0;

  // Kleberbedarf: kg/m² = 0,8 × Wanddicke[cm] / 10  (= 0,8 je 100 mm)
  const kleberProM2 = KLEBER_KG_PRO_M2_PRO_100MM * (wanddicke / 10);
  const kleberKg = nettoFlaeche * kleberProM2;
  const kleberSaecke = sackKg > 0 ? Math.ceil(kleberKg / sackKg) : 0;

  const fmt = (v: number, max = 1) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Porenbeton-Rechner" rechnerSlug="porenbeton-rechner" />

      {/* Wandmaße */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Wandlänge</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={wandLaenge}
                onChange={(e) => setWandLaenge(toNumber(e.target.value))}
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
                value={wandHoehe}
                onChange={(e) => setWandHoehe(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Öffnungen (Fenster, Türen)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={oeffnungen}
              onChange={(e) => setOeffnungen(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Wanddicke / Steinbreite</span>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {WANDDICKEN.map((wd) => (
              <button
                key={wd}
                onClick={() => setWanddicke(wd)}
                className={`py-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                  wanddicke === wd
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {fmt(wd)}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">in cm – bestimmt den Kleberbedarf.</span>
        </label>
      </div>

      {/* Steinformat & Optionen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <span className="text-gray-700 font-medium block">Steinformat (Sichtfläche)</span>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-gray-600">Steinlänge</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={steinLaenge}
                onChange={(e) => setSteinLaenge(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">mm</span>
            </div>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Steinhöhe</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={steinHoehe}
                onChange={(e) => setSteinHoehe(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">mm</span>
            </div>
          </label>
        </div>
        <span className="text-xs text-gray-400 block">
          Standard-Ytong-Planstein 599 × 199 mm (Raster 600 × 200 inkl. Dünnbettfuge).
        </span>

        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Verschnitt</span>
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
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Steine / Palette</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={proPalette}
              onChange={(e) => setProPalette(toNumber(e.target.value))}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Klebersack-Größe</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[25, 30].map((sk) => (
              <button
                key={sk}
                onClick={() => setSackKg(sk)}
                className={`py-2 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                  sackKg === sk
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {sk} kg
              </button>
            ))}
          </div>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Porenbetonsteine</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(steineGesamt, 0)}</span>
            <span className="text-xl text-blue-200">Steine</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {fmt(nettoFlaeche)} m² ({fmt(steineProM2)} Steine/m², inkl. {fmt(verschnitt, 0)} %)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Paletten (à {fmt(proPalette, 0)})</span>
              <span className="text-xl font-bold">{fmt(paletten, 0)}</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Dünnbettkleber</span>
              <span className="font-bold">{fmt(kleberKg, 0)} kg · {fmt(kleberSaecke, 0)} Sack ({sackKg} kg)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Steine/m²</strong> = 1 ÷ ({fmt(lM, 3)} m × {fmt(hM, 3)} m) ={' '}
            <strong>{fmt(steineProM2)} Stück/m²</strong>
          </p>
          <p>
            <strong>Gesamt</strong> = ({fmt(wandLaenge)} × {fmt(wandHoehe)} − {fmt(oeffnungen)}) ×{' '}
            {fmt(steineProM2)} × {fmt(1 + verschnitt / 100, 2)} = <strong>{fmt(steineGesamt, 0)} Steine</strong>
          </p>
          <p>
            <strong>Kleber</strong> = {fmt(nettoFlaeche)} m² × {fmt(kleberProM2, 1)} kg/m² ={' '}
            <strong>{fmt(kleberKg, 0)} kg</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Der Rechner liefert nur eine Material-Mengenschätzung
          (Steinzahl, Paletten, Kleber), keine statische Bemessung. Tragwerksplanung, Wandstatik sowie
          U-Wert- und Schallschutznachweis bleiben Fachplanung (Eurocode 6 / DIN EN 1996, GEG für den
          Wärmeschutz). Herstellerspezifische Sondermaße können abweichen. Im Zweifel Fachplaner oder
          Statiker hinzuziehen. Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default PorenbetonRechner;
