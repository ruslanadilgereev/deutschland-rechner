import { useState, useMemo } from 'react';

// Volumen-Rechner: Quader, Würfel, Zylinder, Kugel, Kegel, Pyramide (quadratische Grundfläche).
// Reine Mathematik – keine externe Datenquelle nötig (wie Kreis-/Prozent-Rechner).
// Formeln getestet: Quader 2×3×4=24; Zylinder r=2,h=5 → 20π; Kugel r=3 → 36π;
// Kegel r=3,h=4 → 12π (= Zylinder/3); Pyramide a=6,h=10 → 120.

type Koerper = 'quader' | 'wuerfel' | 'zylinder' | 'kugel' | 'kegel' | 'pyramide';
type Einheit = 'cm' | 'm';

const fmt = (n: number, d = 2) => {
  if (!isFinite(n) || isNaN(n)) return '–';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: d });
};

export function VolumenRechner() {
  const [koerper, setKoerper] = useState<Koerper>('quader');
  const [einheit, setEinheit] = useState<Einheit>('cm');

  // Quader
  const [quaderL, setQuaderL] = useState(100);
  const [quaderB, setQuaderB] = useState(40);
  const [quaderH, setQuaderH] = useState(50);
  // Würfel
  const [wuerfelA, setWuerfelA] = useState(30);
  // Zylinder
  const [zylR, setZylR] = useState(10);
  const [zylH, setZylH] = useState(50);
  // Kugel
  const [kugelR, setKugelR] = useState(15);
  // Kegel
  const [kegelR, setKegelR] = useState(10);
  const [kegelH, setKegelH] = useState(30);
  // Pyramide (quadratische Grundfläche)
  const [pyrA, setPyrA] = useState(20);
  const [pyrH, setPyrH] = useState(30);

  const volumen = useMemo(() => {
    switch (koerper) {
      case 'quader':
        return Math.max(0, quaderL) * Math.max(0, quaderB) * Math.max(0, quaderH);
      case 'wuerfel':
        return Math.max(0, wuerfelA) ** 3;
      case 'zylinder':
        return Math.PI * Math.max(0, zylR) ** 2 * Math.max(0, zylH);
      case 'kugel':
        return (4 / 3) * Math.PI * Math.max(0, kugelR) ** 3;
      case 'kegel':
        return (1 / 3) * Math.PI * Math.max(0, kegelR) ** 2 * Math.max(0, kegelH);
      case 'pyramide':
        return (1 / 3) * Math.max(0, pyrA) ** 2 * Math.max(0, pyrH);
    }
  }, [koerper, quaderL, quaderB, quaderH, wuerfelA, zylR, zylH, kugelR, kegelR, kegelH, pyrA, pyrH]);

  // Umrechnung: bei cm ist volumen in cm³ (÷1.000 = Liter, ÷1.000.000 = m³);
  // bei m ist volumen in m³ (×1.000 = Liter).
  const liter = einheit === 'cm' ? volumen / 1000 : volumen * 1000;
  const kubikmeter = einheit === 'cm' ? volumen / 1e6 : volumen;

  const KOERPER: { id: Koerper; label: string; icon: string; formel: string }[] = [
    { id: 'quader', label: 'Quader', icon: '📦', formel: 'V = l · b · h' },
    { id: 'wuerfel', label: 'Würfel', icon: '🎲', formel: 'V = a³' },
    { id: 'zylinder', label: 'Zylinder', icon: '🥫', formel: 'V = π · r² · h' },
    { id: 'kugel', label: 'Kugel', icon: '⚽', formel: 'V = 4/3 · π · r³' },
    { id: 'kegel', label: 'Kegel', icon: '🍦', formel: 'V = 1/3 · π · r² · h' },
    { id: 'pyramide', label: 'Pyramide', icon: '🔺', formel: 'V = 1/3 · a² · h' },
  ];
  const aktiv = KOERPER.find((k) => k.id === koerper)!;

  const inputCls =
    'w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none';

  const zahl = (setter: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setter(Math.max(0, Number(e.target.value) || 0));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Körper-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-2">Welcher Körper?</span>
        <div className="grid grid-cols-3 gap-2">
          {KOERPER.map((k) => (
            <button
              key={k.id}
              onClick={() => setKoerper(k.id)}
              className={`px-2 py-3 rounded-xl text-center transition-all ${
                koerper === k.id ? 'bg-orange-600 text-white font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="block text-xl">{k.icon}</span>
              <span className="block text-xs mt-1">{k.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-gray-700 font-medium text-sm">Einheit der Eingaben:</span>
          <div className="flex gap-2">
            {(['cm', 'm'] as Einheit[]).map((e) => (
              <button
                key={e}
                onClick={() => setEinheit(e)}
                className={`px-4 py-1.5 text-sm rounded-xl transition-all ${
                  einheit === e ? 'bg-orange-100 text-orange-800 font-medium border-2 border-orange-300' : 'bg-gray-50 text-gray-600 border-2 border-transparent'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Eingaben je Körper */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {koerper === 'quader' && (
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Länge l ({einheit})</span>
              <input type="number" value={quaderL} onChange={zahl(setQuaderL)} className={inputCls + ' mt-1'} min="0" />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Breite b ({einheit})</span>
              <input type="number" value={quaderB} onChange={zahl(setQuaderB)} className={inputCls + ' mt-1'} min="0" />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Höhe h ({einheit})</span>
              <input type="number" value={quaderH} onChange={zahl(setQuaderH)} className={inputCls + ' mt-1'} min="0" />
            </label>
          </div>
        )}
        {koerper === 'wuerfel' && (
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Kantenlänge a ({einheit})</span>
            <input type="number" value={wuerfelA} onChange={zahl(setWuerfelA)} className={inputCls + ' mt-1'} min="0" />
          </label>
        )}
        {koerper === 'zylinder' && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Radius r ({einheit})</span>
              <input type="number" value={zylR} onChange={zahl(setZylR)} className={inputCls + ' mt-1'} min="0" />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Höhe h ({einheit})</span>
              <input type="number" value={zylH} onChange={zahl(setZylH)} className={inputCls + ' mt-1'} min="0" />
            </label>
          </div>
        )}
        {koerper === 'kugel' && (
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Radius r ({einheit})</span>
            <input type="number" value={kugelR} onChange={zahl(setKugelR)} className={inputCls + ' mt-1'} min="0" />
          </label>
        )}
        {koerper === 'kegel' && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Radius r ({einheit})</span>
              <input type="number" value={kegelR} onChange={zahl(setKegelR)} className={inputCls + ' mt-1'} min="0" />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Höhe h ({einheit})</span>
              <input type="number" value={kegelH} onChange={zahl(setKegelH)} className={inputCls + ' mt-1'} min="0" />
            </label>
          </div>
        )}
        {koerper === 'pyramide' && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Grundkante a ({einheit})</span>
              <input type="number" value={pyrA} onChange={zahl(setPyrA)} className={inputCls + ' mt-1'} min="0" />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Höhe h ({einheit})</span>
              <input type="number" value={pyrH} onChange={zahl(setPyrH)} className={inputCls + ' mt-1'} min="0" />
            </label>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-3">Formel: {aktiv.formel}</p>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">{aktiv.icon} Volumen {aktiv.label}</h3>
        <div className="text-5xl font-bold mb-1">
          {fmt(volumen)} {einheit}³
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-4">
            <span className="text-xs opacity-80">in Litern</span>
            <div className="text-2xl font-bold">{fmt(liter, 3)} l</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <span className="text-xs opacity-80">in Kubikmetern</span>
            <div className="text-2xl font-bold">{fmt(kubikmeter, 4)} m³</div>
          </div>
        </div>
        {(koerper === 'zylinder' || koerper === 'kugel' || koerper === 'kegel') && (
          <p className="text-orange-100 text-xs mt-3">Rechnet mit π = {Math.PI.toLocaleString('de-DE', { maximumFractionDigits: 5 })} …</p>
        )}
      </div>

      {/* Hinweis Einheiten */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <p className="text-sm text-blue-800">
          💡 <strong>Merkhilfe:</strong> 1.000 cm³ = 1 Liter, 1.000 Liter = 1 m³. Ein Aquarium mit
          100 × 40 × 50 cm fasst also 200.000 cm³ = 200 Liter. Alle Längen eines Körpers müssen in
          derselben Einheit eingegeben werden – die Umschaltung cm/m oben passt die Liter- und
          m³-Umrechnung automatisch an.
        </p>
      </div>
    </div>
  );
}

export default VolumenRechner;
