import { useState } from 'react';

// Pflastersplitt-Bettung: ~75 kg/m² bei 5 cm Dicke (Rohdichte ≈ 1.500 kg/m³).
// Daraus folgt 15 kg pro m² und cm Bettungsdicke.
const SPLITT_KG_PRO_M2_CM = 15;

// Schotter-Tragschicht: Auflockerungsfaktor 1,3 (Verdichtung berücksichtigen).
const SCHOTTER_AUFLOCKERUNG = 1.3;

// Empfohlene Tragschichtdicke je Nutzung (Mittelwerte der üblichen Spannen).
type Nutzung = {
  id: string;
  name: string;
  icon: string;
  tragschichtCm: number;
};

const NUTZUNGEN: Nutzung[] = [
  { id: 'gehweg', name: 'Gehweg / Terrasse', icon: '🚶', tragschichtCm: 40 },
  { id: 'pkw', name: 'PKW-Einfahrt', icon: '🚗', tragschichtCm: 55 },
  { id: 'schwer', name: 'Schwerlast', icon: '🚚', tragschichtCm: 90 },
];

// Verlegemuster bestimmt den Verschnitt.
type Muster = { id: string; name: string; verschnitt: number };
const MUSTER: Muster[] = [
  { id: 'reihe', name: 'Reihenverband', verschnitt: 5 },
  { id: 'diagonal', name: 'Diagonal / Fischgrät', verschnitt: 9 },
];

export function PflastersteineRechner() {
  const [eingabe, setEingabe] = useState<'flaeche' | 'masse'>('masse');
  const [flaeche, setFlaeche] = useState(20);
  const [laenge, setLaenge] = useState(5);
  const [breite, setBreite] = useState(4);
  const [steinLaenge, setSteinLaenge] = useState(20); // cm
  const [steinBreite, setSteinBreite] = useState(10); // cm
  const [fugeMm, setFugeMm] = useState(4);
  const [musterId, setMusterId] = useState('reihe');
  const [bettungCm, setBettungCm] = useState(4);
  const [nutzungId, setNutzungId] = useState('pkw');

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const muster = MUSTER.find((m) => m.id === musterId)!;
  const nutzung = NUTZUNGEN.find((n) => n.id === nutzungId)!;

  const flaecheM2 = eingabe === 'flaeche' ? flaeche : laenge * breite;

  // Steine pro m²: Maße in mm, Fläche 1 m² = 1.000.000 mm²
  const steinLmm = steinLaenge * 10;
  const steinBmm = steinBreite * 10;
  const nennerMm2 = (steinLmm + fugeMm) * (steinBmm + fugeMm);
  const steineProM2 = nennerMm2 > 0 ? 1000000 / nennerMm2 : 0;
  const steineGesamt = Math.ceil(flaecheM2 * steineProM2 * (1 + muster.verschnitt / 100));

  // Splitt-Bettung in kg
  const splittKg = flaecheM2 * bettungCm * SPLITT_KG_PRO_M2_CM;

  // Schotter-Tragschicht in m³ (inkl. Auflockerung)
  const schotterM3 = flaecheM2 * (nutzung.tragschichtCm / 100) * SCHOTTER_AUFLOCKERUNG;

  const fmt = (v: number, max = 1) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });

  return (
    <div className="max-w-lg mx-auto">

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {/* Eingabeart-Umschalter */}
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

        {/* Steinformat */}
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Steinlänge</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={steinLaenge}
                onChange={(e) => setSteinLaenge(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Steinbreite</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={steinBreite}
                onChange={(e) => setSteinBreite(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
            </div>
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Fugenbreite</span>
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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">mm</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Übliche Fuge 3–5 mm.</span>
        </label>

        {/* Verlegemuster */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Verlegemuster</span>
          <div className="grid grid-cols-2 gap-2">
            {MUSTER.map((m) => (
              <button
                key={m.id}
                onClick={() => setMusterId(m.id)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                  musterId === m.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {m.name}
                <span className="block text-xs font-normal opacity-70">+{m.verschnitt} % Verschnitt</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bettungsdicke */}
        <label className="block">
          <span className="text-gray-700 font-medium">Splitt-Bettung</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={bettungCm}
              onChange={(e) => setBettungCm(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Übliche Bettung 3–5 cm.</span>
        </label>

        {/* Nutzung / Tragschicht */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Nutzung (Tragschichtdicke)</span>
          <div className="grid grid-cols-3 gap-2">
            {NUTZUNGEN.map((n) => (
              <button
                key={n.id}
                onClick={() => setNutzungId(n.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                  nutzungId === n.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{n.icon}</span>
                <span className="text-center leading-tight">{n.name}</span>
                <span className="text-[10px] opacity-70">{n.tragschichtCm} cm</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Pflastersteine</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(steineGesamt, 0)}</span>
            <span className="text-xl text-blue-200">Steine</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {fmt(flaecheM2)} m² ({fmt(steineProM2)} Steine/m², {muster.name})
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Pflastersplitt ({fmt(bettungCm, 0)} cm)</span>
              <span className="font-bold">ca. {fmt(splittKg, 0)} kg ({fmt(splittKg / 1000, 2)} t)</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Schotter-Tragschicht ({nutzung.tragschichtCm} cm)</span>
              <span className="font-bold">ca. {fmt(schotterM3, 1)} m³</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Steine/m²</strong> = 1.000.000 ÷ ((L + Fuge) × (B + Fuge)) = 1.000.000 ÷ (({steinLmm} +{' '}
            {fmt(fugeMm, 0)}) × ({steinBmm} + {fmt(fugeMm, 0)})) = <strong>{fmt(steineProM2)} Steine/m²</strong>
          </p>
          <p>
            <strong>Gesamt</strong> = {fmt(flaecheM2)} m² × {fmt(steineProM2)} × {fmt(1 + muster.verschnitt / 100, 2)} ={' '}
            <strong>{fmt(steineGesamt, 0)} Steine</strong>
          </p>
          <p>
            <strong>Splitt</strong> = {fmt(flaecheM2)} × {fmt(bettungCm, 0)} cm × 15 kg ={' '}
            <strong>{fmt(splittKg, 0)} kg</strong>; <strong>Schotter</strong> = Fläche × {nutzung.tragschichtCm} cm × 1,3.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Werte sind GaLaBau-Richtwerte für die Materialbestellung. Die
          nötige Tragschicht- und Frostschutzdicke hängt von Untergrund und Nutzung ab (DIN 18318,
          FLL, ZTV Wegebau). Bei tragender oder befahrener Fläche im Zweifel einen Fachbetrieb
          hinzuziehen. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default PflastersteineRechner;
