import { useState, useMemo } from 'react';

// Quadrat-Rechner: A = a², U = 4·a, Diagonale d = a·√2
// Eingabe wahlweise über Seite, Fläche, Umfang oder Diagonale –
// alle übrigen Größen werden zurückgerechnet.

type Gegeben = 'seite' | 'flaeche' | 'umfang' | 'diagonale';

function rund(x: number, dez = 2): number {
  const f = 10 ** dez;
  return Math.round(x * f) / f;
}

function formatZahl(x: number, dez = 2): string {
  return x.toLocaleString('de-DE', { maximumFractionDigits: dez });
}

export default function QuadratRechner() {
  const [gegeben, setGegeben] = useState<Gegeben>('seite');
  const [wert, setWert] = useState(5);

  const ergebnis = useMemo(() => {
    const w = Math.max(0, wert || 0);
    if (w <= 0) return { fehler: 'Der Wert muss größer als 0 sein.' };

    let a: number;
    if (gegeben === 'seite') a = w;
    else if (gegeben === 'flaeche') a = Math.sqrt(w);
    else if (gegeben === 'umfang') a = w / 4;
    else a = w / Math.SQRT2;

    return {
      a: rund(a),
      A: rund(a * a),
      U: rund(4 * a),
      d: rund(a * Math.SQRT2),
    };
  }, [gegeben, wert]);

  const optionen: { key: Gegeben; label: string }[] = [
    { key: 'seite', label: 'Seite a' },
    { key: 'flaeche', label: 'Fläche A' },
    { key: 'umfang', label: 'Umfang U' },
    { key: 'diagonale', label: 'Diagonale d' },
  ];

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Welcher Wert ist bekannt?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {optionen.map((o) => (
            <button key={o.key} type="button" onClick={() => setGegeben(o.key)} className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${gegeben === o.key ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="q-wert" className="block text-sm font-medium text-gray-700 mb-1">
            {optionen.find((o) => o.key === gegeben)?.label}
          </label>
          <input
            id="q-wert"
            type="number"
            min="0"
            step="0.1"
            value={wert}
            onChange={(e) => setWert(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
          />
          <p className="text-xs text-gray-400 mt-1">Einheit frei wählbar – Fläche in der Einheit zum Quadrat.</p>
        </div>
      </div>

      {'fehler' in ergebnis ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-amber-800 text-sm">⚠️ {ergebnis.fehler}</div>
      ) : (
        <div className="bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <p className="text-fuchsia-100 text-sm mb-1">Quadrat mit Seite a = {formatZahl(ergebnis.a)}</p>
          <p className="text-5xl font-bold mb-2">A = {formatZahl(ergebnis.A)}</p>
          <p className="text-fuchsia-100 text-sm">
            Umfang: <strong>{formatZahl(ergebnis.U)}</strong> · Diagonale: <strong>{formatZahl(ergebnis.d)}</strong>
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Formeln</h3>
        <ul className="text-xs text-gray-600 space-y-1 font-mono">
          <li>Fläche: A = a²  (Rückweg: a = √A)</li>
          <li>Umfang: U = 4 · a  (Rückweg: a = U ÷ 4)</li>
          <li>Diagonale: d = a · √2  (Rückweg: a = d ÷ √2)</li>
        </ul>
      </div>
    </div>
  );
}
