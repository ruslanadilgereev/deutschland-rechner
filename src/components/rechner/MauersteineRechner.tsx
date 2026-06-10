import { useState } from 'react';

// Standard-Steinformate nach DIN 105 / DIN 4172 (oktametrische Maßordnung).
// Maße in Millimetern: Länge × Breite × Höhe. Maßgeblich für die
// Ansichtsfläche im Läuferverband sind Länge und Höhe + Mörtelfuge.
type Format = {
  id: string;
  name: string;
  icon: string;
  laenge: number; // mm
  hoehe: number; // mm
};

const FORMATE: Format[] = [
  { id: 'DF', name: 'DF (240×52)', icon: '▬', laenge: 240, hoehe: 52 },
  { id: 'NF', name: 'NF (240×71)', icon: '🧱', laenge: 240, hoehe: 71 },
  { id: '2DF', name: '2DF (240×113)', icon: '🟫', laenge: 240, hoehe: 113 },
  { id: 'eigene', name: 'Eigenes Maß', icon: '🔧', laenge: 240, hoehe: 71 },
];

export function MauersteineRechner() {
  const [formatId, setFormatId] = useState('NF');
  const [eigeneLaenge, setEigeneLaenge] = useState(240);
  const [eigeneHoehe, setEigeneHoehe] = useState(71);
  const [wandLaenge, setWandLaenge] = useState(5);
  const [wandHoehe, setWandHoehe] = useState(2.5);
  const [aussparungen, setAussparungen] = useState(0);
  const [fugeMm, setFugeMm] = useState(10);
  const [verschnitt, setVerschnitt] = useState(7);
  const [preisAktiv, setPreisAktiv] = useState(false);
  const [preisProStein, setPreisProStein] = useState(0.8);

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const format = FORMATE.find((f) => f.id === formatId)!;
  const steinLaengeMm = formatId === 'eigene' ? eigeneLaenge : format.laenge;
  const steinHoeheMm = formatId === 'eigene' ? eigeneHoehe : format.hoehe;

  // Steine pro m² = 1 / ((L + Fuge) × (H + Fuge)), alles in Metern
  const lPlusFugeM = (steinLaengeMm + fugeMm) / 1000;
  const hPlusFugeM = (steinHoeheMm + fugeMm) / 1000;
  const steineProM2 =
    lPlusFugeM > 0 && hPlusFugeM > 0 ? 1 / (lPlusFugeM * hPlusFugeM) : 0;

  const wandflaeche = Math.max(0, wandLaenge * wandHoehe - aussparungen);
  const steineGesamt = Math.ceil(wandflaeche * steineProM2 * (1 + verschnitt / 100));

  // Mörtel-Richtwert (Normalmörtel, 24-cm-Wand): ~35 L/m² Wandfläche.
  const moertelLiter = wandflaeche * 35;

  const kosten = steineGesamt * preisProStein;

  const fmt = (v: number, max = 1) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });
  const fmtEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Format-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Steinformat</span>
        <div className="grid grid-cols-2 gap-2">
          {FORMATE.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormatId(f.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                formatId === f.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{f.icon}</span>
              <span className="text-left leading-tight">{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {formatId === 'eigene' && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-gray-700 font-medium">Steinlänge</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={eigeneLaenge}
                  onChange={(e) => setEigeneLaenge(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">mm</span>
              </div>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Steinhöhe</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={eigeneHoehe}
                  onChange={(e) => setEigeneHoehe(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">mm</span>
              </div>
            </label>
          </div>
        )}

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
          <span className="text-gray-700 font-medium">Aussparungen (Fenster, Türen)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={aussparungen}
              onChange={(e) => setAussparungen(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Fugendicke</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={fugeMm}
                onChange={(e) => setFugeMm(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">mm</span>
            </div>
          </label>
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
        </div>
        <span className="text-xs text-gray-400 block">
          Standard-Fuge 10 mm (DIN 4172). Verschnitt 5 % einfache Mauer, 10 % Sichtmauerwerk.
        </span>

        {/* Optionaler Preis */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preisAktiv}
              onChange={(e) => setPreisAktiv(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Materialkosten berechnen</span>
          </label>
          {preisAktiv && (
            <label className="block mt-3">
              <span className="text-sm text-gray-600">Preis pro Stein</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.05}
                  value={preisProStein}
                  onChange={(e) => setPreisProStein(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Mauersteine</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(steineGesamt, 0)}</span>
            <span className="text-xl text-blue-200">Steine</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {fmt(wandflaeche)} m² Wandfläche (inkl. {fmt(verschnitt, 0)} % Verschnitt)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Steine pro m²</span>
              <span className="text-xl font-bold">{fmt(steineProM2)} Stück</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Mörtel-Richtwert (24-cm-Wand)</span>
              <span className="font-bold">ca. {fmt(moertelLiter, 0)} Liter</span>
            </div>
          </div>
          {preisAktiv && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Materialkosten (Steine)</span>
                <span className="text-xl font-bold">{fmtEuro(kosten)} €</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Steine/m²</strong> = 1 ÷ ((L + Fuge) × (H + Fuge)) = 1 ÷ (({steinLaengeMm} + {fmt(fugeMm, 0)}) ×{' '}
            ({steinHoeheMm} + {fmt(fugeMm, 0)}) mm²) = <strong>{fmt(steineProM2)} Stück/m²</strong>
          </p>
          <p>
            <strong>Wandfläche</strong> = {fmt(wandLaenge)} × {fmt(wandHoehe)} − {fmt(aussparungen)} ={' '}
            <strong>{fmt(wandflaeche)} m²</strong>
          </p>
          <p>
            <strong>Gesamt</strong> = {fmt(wandflaeche)} × {fmt(steineProM2)} × {fmt(1 + verschnitt / 100, 2)} ={' '}
            <strong>{fmt(steineGesamt, 0)} Steine</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Ergebnis ist eine Bedarfsschätzung für die Materialbestellung
          und ersetzt keine statische Bemessung. Herstellerspezifische Steinmaße, Verbände und der
          tatsächliche Verschnitt können abweichen; der Mörtelbedarf gilt als Richtwert für eine
          24-cm-Wand. Im Zweifel Fachplanung hinzuziehen. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default MauersteineRechner;
