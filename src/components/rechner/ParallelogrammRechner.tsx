import { useState, useMemo } from 'react';

// Parallelogramm-Rechner: A = g·h (Höhe auf die Grundseite), U = 2·(g+b)
// Plausibilität: Die Höhe kann den Schenkel nicht übertreffen (h = b·sin α ≤ b);
// h = b ist der Rechteck-Grenzfall.

function rund(x: number, dez = 2): number {
  const f = 10 ** dez;
  return Math.round(x * f) / f;
}

function formatZahl(x: number, dez = 2): string {
  return x.toLocaleString('de-DE', { maximumFractionDigits: dez });
}

export default function ParallelogrammRechner() {
  const [grundseite, setGrundseite] = useState(6);
  const [schenkel, setSchenkel] = useState(4);
  const [hoehe, setHoehe] = useState(3);

  const ergebnis = useMemo(() => {
    const g = Math.max(0, grundseite || 0);
    const b = Math.max(0, schenkel || 0);
    const h = Math.max(0, hoehe || 0);

    if (g <= 0 || b <= 0 || h <= 0) return { fehler: 'Alle Werte müssen größer als 0 sein.' };
    if (h > b) return { fehler: 'Die Höhe kann nicht länger sein als der Schenkel b – sie entsteht aus b × sin(α) und ist höchstens gleich b (Rechteck-Grenzfall).' };

    return {
      A: rund(g * h),
      U: rund(2 * (g + b)),
      istRechteck: h === b,
    };
  }, [grundseite, schenkel, hoehe]);

  const inputKlasse = 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg';

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Maße des Parallelogramms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="p-g" className="block text-sm font-medium text-gray-700 mb-1">Grundseite g</label>
            <input id="p-g" type="number" min="0" step="0.1" value={grundseite} onChange={(e) => setGrundseite(Number(e.target.value))} className={inputKlasse} />
          </div>
          <div>
            <label htmlFor="p-b" className="block text-sm font-medium text-gray-700 mb-1">Schenkel b</label>
            <input id="p-b" type="number" min="0" step="0.1" value={schenkel} onChange={(e) => setSchenkel(Number(e.target.value))} className={inputKlasse} />
          </div>
          <div>
            <label htmlFor="p-h" className="block text-sm font-medium text-gray-700 mb-1">Höhe h (auf g)</label>
            <input id="p-h" type="number" min="0" step="0.1" value={hoehe} onChange={(e) => setHoehe(Number(e.target.value))} className={inputKlasse} />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          h ist der senkrechte Abstand der beiden Grundseiten – nicht der Schenkel. Einheit frei wählbar.
        </p>
      </div>

      {'fehler' in ergebnis ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-amber-800 text-sm">⚠️ {ergebnis.fehler}</div>
      ) : (
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <p className="text-teal-100 text-sm mb-1">Flächeninhalt des Parallelogramms</p>
          <p className="text-5xl font-bold mb-2">A = {formatZahl(ergebnis.A)}</p>
          <p className="text-teal-100 text-sm">
            Umfang: <strong>{formatZahl(ergebnis.U)}</strong>
            {ergebnis.istRechteck && ' · Sonderfall: h = b, das Parallelogramm ist ein Rechteck'}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Formeln</h3>
        <ul className="text-xs text-gray-600 space-y-1 font-mono">
          <li>Fläche: A = g · h  (Grundseite × Höhe)</li>
          <li>Umfang: U = 2 · (g + b)</li>
          <li>Höhe aus Fläche: h = A ÷ g</li>
        </ul>
      </div>
    </div>
  );
}
