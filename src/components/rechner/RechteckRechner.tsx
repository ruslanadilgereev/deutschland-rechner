import { useState, useMemo } from 'react';

// Rechteck-Rechner: A = a·b, U = 2·(a+b), Diagonale d = √(a²+b²)
// Rückrechnung der fehlenden Seite aus Fläche oder Umfang.

type Modus = 'seiten' | 'flaeche' | 'umfang';

function rund(x: number, dez = 2): number {
  const f = 10 ** dez;
  return Math.round(x * f) / f;
}

function formatZahl(x: number, dez = 2): string {
  return x.toLocaleString('de-DE', { maximumFractionDigits: dez });
}

export default function RechteckRechner() {
  const [modus, setModus] = useState<Modus>('seiten');
  const [seiteA, setSeiteA] = useState(4);
  const [seiteB, setSeiteB] = useState(6);
  const [flaeche, setFlaeche] = useState(24);
  const [umfang, setUmfang] = useState(20);

  const ergebnis = useMemo(() => {
    const a = Math.max(0, seiteA || 0);

    let b: number | null = null;
    if (modus === 'seiten') b = Math.max(0, seiteB || 0);
    else if (modus === 'flaeche') b = a > 0 && flaeche > 0 ? (flaeche || 0) / a : null;
    else b = umfang > 0 && a > 0 ? (umfang || 0) / 2 - a : null;

    if (a <= 0 || b === null || b <= 0) {
      return { fehler: modus === 'umfang'
        ? 'Keine gültige Lösung – der Umfang muss größer als 2 × Seite a sein.'
        : 'Beide Werte müssen größer als 0 sein.' };
    }

    return {
      a, b: rund(b),
      A: rund(a * b),
      U: rund(2 * (a + b)),
      d: rund(Math.sqrt(a * a + b * b)),
    };
  }, [modus, seiteA, seiteB, flaeche, umfang]);

  const inputKlasse = 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg';

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
          <button type="button" onClick={() => setModus('seiten')} className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${modus === 'seiten' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Beide Seiten
          </button>
          <button type="button" onClick={() => setModus('flaeche')} className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${modus === 'flaeche' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Fläche + Seite a
          </button>
          <button type="button" onClick={() => setModus('umfang')} className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${modus === 'umfang' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Umfang + Seite a
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="r-a" className="block text-sm font-medium text-gray-700 mb-1">Seite a</label>
            <input id="r-a" type="number" min="0" step="0.1" value={seiteA} onChange={(e) => setSeiteA(Number(e.target.value))} className={inputKlasse} />
          </div>
          {modus === 'seiten' && (
            <div>
              <label htmlFor="r-b" className="block text-sm font-medium text-gray-700 mb-1">Seite b</label>
              <input id="r-b" type="number" min="0" step="0.1" value={seiteB} onChange={(e) => setSeiteB(Number(e.target.value))} className={inputKlasse} />
            </div>
          )}
          {modus === 'flaeche' && (
            <div>
              <label htmlFor="r-A" className="block text-sm font-medium text-gray-700 mb-1">Fläche A</label>
              <input id="r-A" type="number" min="0" step="0.5" value={flaeche} onChange={(e) => setFlaeche(Number(e.target.value))} className={inputKlasse} />
            </div>
          )}
          {modus === 'umfang' && (
            <div>
              <label htmlFor="r-U" className="block text-sm font-medium text-gray-700 mb-1">Umfang U</label>
              <input id="r-U" type="number" min="0" step="0.5" value={umfang} onChange={(e) => setUmfang(Number(e.target.value))} className={inputKlasse} />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-3">Einheit frei wählbar – Fläche in der Einheit zum Quadrat.</p>
      </div>

      {'fehler' in ergebnis ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-amber-800 text-sm">⚠️ {ergebnis.fehler}</div>
      ) : (
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <p className="text-cyan-100 text-sm mb-1">Rechteck {formatZahl(ergebnis.a)} × {formatZahl(ergebnis.b)}</p>
          <p className="text-5xl font-bold mb-2">A = {formatZahl(ergebnis.A)}</p>
          <p className="text-cyan-100 text-sm">
            Umfang: <strong>{formatZahl(ergebnis.U)}</strong> · Diagonale: <strong>{formatZahl(ergebnis.d)}</strong>
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Formeln</h3>
        <ul className="text-xs text-gray-600 space-y-1 font-mono">
          <li>Fläche: A = a · b</li>
          <li>Umfang: U = 2 · (a + b)</li>
          <li>Diagonale: d = √(a² + b²)</li>
        </ul>
      </div>
    </div>
  );
}
