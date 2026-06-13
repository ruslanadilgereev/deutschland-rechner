import { useState, useMemo } from 'react';

// Zylinder-Volumen-Rechner: Volumen (Liter, m³, cm³), Mantel- & Oberfläche eines geraden Kreiszylinders.
// Reine Mathematik – keine externe Datenquelle nötig (wie Kreis-/Prozent-/Dreisatz-Rechner).

type Modus = 'd' | 'r'; // Durchmesser oder Radius
type Einheit = 'cm' | 'm';

const fmt = (n: number) => {
  if (!isFinite(n) || isNaN(n)) return '–';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

// Liter mit bis zu einer Nachkommastelle (Hauptergebnis)
const fmt1 = (n: number) => {
  if (!isFinite(n) || isNaN(n)) return '–';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
};

// Presets setzen nur die Inputfelder (Durchmesser-Modus, Einheit m) – die Komponente rechnet selbst.
const PRESETS: { id: string; label: string; icon: string; durchmesser: number; hoehe: number }[] = [
  { id: 'regentonne', label: 'Regentonne', icon: '🛢️', durchmesser: 0.6, hoehe: 0.9 },
  { id: 'pool', label: 'Pool rund', icon: '🏊', durchmesser: 3.66, hoehe: 1.07 },
  { id: 'puffer', label: 'Pufferspeicher', icon: '🔥', durchmesser: 0.79, hoehe: 1.65 },
  { id: 'aquarium', label: 'Aquarium', icon: '🐟', durchmesser: 0.4, hoehe: 0.5 },
];

export function ZylinderVolumenRechner() {
  const [modus, setModus] = useState<Modus>('d'); // Standard: Durchmesser
  const [einheit, setEinheit] = useState<Einheit>('m');
  const [masz, setMasz] = useState(0.6); // Durchmesser bzw. Radius (je nach Modus)
  const [hoehe, setHoehe] = useState(0.9);

  const ergebnis = useMemo(() => {
    const faktor = einheit === 'cm' ? 0.01 : 1; // Eingabe → Meter
    const eingabe = Math.max(0, masz) * faktor;
    const h = Math.max(0, hoehe) * faktor;
    const r = modus === 'r' ? eingabe : eingabe / 2; // Radius in Metern

    const vM3 = Math.PI * r * r * h; // Volumen in m³
    const liter = vM3 * 1000; // 1 m³ = 1.000 Liter
    const cm3 = vM3 * 1_000_000; // 1 m³ = 1.000.000 cm³
    const mantel = 2 * Math.PI * r * h; // Mantelfläche m²
    const grund = Math.PI * r * r; // Grundfläche (ein Kreis) m²
    const oberflaeche = 2 * Math.PI * r * (r + h); // Gesamtoberfläche m²

    return { r, vM3, liter, cm3, mantel, grund, oberflaeche };
  }, [modus, einheit, masz, hoehe]);

  const applyPreset = (p: typeof PRESETS[number]) => {
    setModus('d');
    setEinheit('m');
    setMasz(p.durchmesser);
    setHoehe(p.hoehe);
  };

  const inputCls =
    'w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Praxis-Presets */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-2">Schnellwahl (typische Richtwerte, „ca.“)</span>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="px-2 py-3 rounded-xl text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              <span className="block text-xl">{p.icon}</span>
              <span className="block text-xs mt-1">{p.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Presets setzen typische Maße als Durchmesser in Metern – Maße bitte selbst nachmessen.
        </p>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Radius / Durchmesser umschalten */}
        <span className="text-gray-700 font-medium block mb-2">Eingabe als</span>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {([
            { id: 'd' as Modus, label: 'Durchmesser (d)' },
            { id: 'r' as Modus, label: 'Radius (r)' },
          ]).map((m) => (
            <button
              key={m.id}
              onClick={() => setModus(m.id)}
              className={`px-1 py-2 text-sm rounded-xl transition-all ${
                modus === m.id
                  ? 'bg-orange-100 text-orange-800 font-medium border-2 border-orange-300'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Einheit cm / m */}
        <span className="text-gray-700 font-medium block mb-2">Einheit (für alle Maße)</span>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {([
            { id: 'cm' as Einheit, label: 'Zentimeter (cm)' },
            { id: 'm' as Einheit, label: 'Meter (m)' },
          ]).map((u) => (
            <button
              key={u.id}
              onClick={() => setEinheit(u.id)}
              className={`px-1 py-2 text-sm rounded-xl transition-all ${
                einheit === u.id
                  ? 'bg-orange-100 text-orange-800 font-medium border-2 border-orange-300'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent'
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">
              {modus === 'd' ? 'Durchmesser' : 'Radius'} ({einheit})
            </span>
            <input
              type="number"
              value={masz}
              onChange={(e) => setMasz(Math.max(0, Number(e.target.value) || 0))}
              className={inputCls + ' mt-1'}
              min="0"
              step="any"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Höhe h ({einheit})</span>
            <input
              type="number"
              value={hoehe}
              onChange={(e) => setHoehe(Math.max(0, Number(e.target.value) || 0))}
              className={inputCls + ' mt-1'}
              min="0"
              step="any"
            />
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🛢️ Volumen des Zylinders</h3>
        <div className="text-5xl font-bold">
          {fmt1(ergebnis.liter)} <span className="text-2xl font-medium opacity-90">Liter</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Volumen (m³)</span>
            <div className="text-2xl font-bold">{fmt(ergebnis.vM3)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Volumen (cm³)</span>
            <div className="text-2xl font-bold">{fmt(ergebnis.cm3)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Mantelfläche (m²)</span>
            <div className="text-2xl font-bold">{fmt(ergebnis.mantel)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Oberfläche gesamt (m²)</span>
            <div className="text-2xl font-bold">{fmt(ergebnis.oberflaeche)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Grundfläche (m²)</span>
            <div className="text-2xl font-bold">{fmt(ergebnis.grund)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Radius (r)</span>
            <div className="text-2xl font-bold">{fmt(ergebnis.r)} m</div>
          </div>
        </div>
        <p className="text-orange-100 text-xs mt-3">
          Rechnet mit π = {Math.PI.toLocaleString('de-DE', { maximumFractionDigits: 5 })} …
        </p>
      </div>

      {/* Hinweis Einheiten */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <p className="text-sm text-blue-800">
          💡 Alle Längen einer Eingabe müssen <strong>dieselbe Einheit</strong> haben. Wählst du
          <strong> Zentimeter</strong>, gib Durchmesser/Radius und Höhe in cm ein; das Volumen wird
          dann nach Metern umgerechnet ausgegeben. Es gilt: <strong>1 m³ = 1.000 Liter = 1.000.000 cm³</strong>
          und <strong>1 Liter = 1.000 cm³ = 1 dm³</strong>.
        </p>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-xs text-gray-500">
        <p className="mb-2">Schätzung – keine Steuer-/Rechtsberatung.</p>
        <p>
          <strong>Grundlage:</strong> Geometrische Standardformeln für den Kreiszylinder
          (V = π·r²·h, Mantelfläche = 2·π·r·h, Oberfläche = 2·π·r·(r+h)) und die Kreiszahl π.
          Reine Mathematik – keine externe Datenquelle. Einheiten gemäß Internationalem
          Einheitensystem (SI):{' '}
          <a
            href="https://www.nist.gov/pml/owm/metric-si/si-units"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-800 underline"
          >
            NIST – SI Units
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default ZylinderVolumenRechner;
