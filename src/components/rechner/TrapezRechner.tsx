import { useState, useMemo } from 'react';

// Trapez-Rechner: A = (a+c)/2 · h (a, c = parallele Seiten), Mittellinie
// m = (a+c)/2; Umfang optional aus allen vier Seiten U = a+b+c+d.

function rund(x: number, dez = 2): number {
  const f = 10 ** dez;
  return Math.round(x * f) / f;
}

function formatZahl(x: number, dez = 2): string {
  return x.toLocaleString('de-DE', { maximumFractionDigits: dez });
}

export default function TrapezRechner() {
  const [seiteA, setSeiteA] = useState(8);
  const [seiteC, setSeiteC] = useState(4);
  const [hoehe, setHoehe] = useState(3);
  const [seiteB, setSeiteB] = useState(3.5);
  const [seiteD, setSeiteD] = useState(3.5);

  const ergebnis = useMemo(() => {
    const a = Math.max(0, seiteA || 0);
    const c = Math.max(0, seiteC || 0);
    const h = Math.max(0, hoehe || 0);
    const b = Math.max(0, seiteB || 0);
    const d = Math.max(0, seiteD || 0);

    if (a <= 0 || c <= 0 || h <= 0) return { fehler: 'Beide parallele Seiten und die Höhe müssen größer als 0 sein.' };

    return {
      A: rund(((a + c) / 2) * h),
      m: rund((a + c) / 2),
      U: b > 0 && d > 0 ? rund(a + b + c + d) : null,
      istParallelogramm: a === c,
    };
  }, [seiteA, seiteC, hoehe, seiteB, seiteD]);

  const inputKlasse = 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg';

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Maße des Trapezes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="t-a" className="block text-sm font-medium text-gray-700 mb-1">Parallelseite a (unten)</label>
            <input id="t-a" type="number" min="0" step="0.1" value={seiteA} onChange={(e) => setSeiteA(Number(e.target.value))} className={inputKlasse} />
          </div>
          <div>
            <label htmlFor="t-c" className="block text-sm font-medium text-gray-700 mb-1">Parallelseite c (oben)</label>
            <input id="t-c" type="number" min="0" step="0.1" value={seiteC} onChange={(e) => setSeiteC(Number(e.target.value))} className={inputKlasse} />
          </div>
          <div>
            <label htmlFor="t-h" className="block text-sm font-medium text-gray-700 mb-1">Höhe h</label>
            <input id="t-h" type="number" min="0" step="0.1" value={hoehe} onChange={(e) => setHoehe(Number(e.target.value))} className={inputKlasse} />
          </div>
        </div>

        <details className="mt-4">
          <summary className="text-sm text-gray-600 cursor-pointer font-medium">+ Schenkel b und d für den Umfang (optional)</summary>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label htmlFor="t-b" className="block text-sm font-medium text-gray-700 mb-1">Schenkel b</label>
              <input id="t-b" type="number" min="0" step="0.1" value={seiteB} onChange={(e) => setSeiteB(Number(e.target.value))} className={inputKlasse} />
            </div>
            <div>
              <label htmlFor="t-d" className="block text-sm font-medium text-gray-700 mb-1">Schenkel d</label>
              <input id="t-d" type="number" min="0" step="0.1" value={seiteD} onChange={(e) => setSeiteD(Number(e.target.value))} className={inputKlasse} />
            </div>
          </div>
        </details>
        <p className="text-xs text-gray-400 mt-3">a und c sind die beiden parallelen Seiten, h ihr senkrechter Abstand.</p>
      </div>

      {'fehler' in ergebnis ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-amber-800 text-sm">⚠️ {ergebnis.fehler}</div>
      ) : (
        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <p className="text-rose-100 text-sm mb-1">Flächeninhalt des Trapezes</p>
          <p className="text-5xl font-bold mb-2">A = {formatZahl(ergebnis.A)}</p>
          <p className="text-rose-100 text-sm">
            Mittellinie m: <strong>{formatZahl(ergebnis.m)}</strong>
            {ergebnis.U !== null && <> · Umfang: <strong>{formatZahl(ergebnis.U)}</strong></>}
            {ergebnis.istParallelogramm && ' · Sonderfall: a = c, das Trapez ist ein Parallelogramm'}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Formeln</h3>
        <ul className="text-xs text-gray-600 space-y-1 font-mono">
          <li>Fläche: A = (a + c) ÷ 2 × h</li>
          <li>Mittellinie: m = (a + c) ÷ 2</li>
          <li>Umfang: U = a + b + c + d</li>
        </ul>
      </div>
    </div>
  );
}
