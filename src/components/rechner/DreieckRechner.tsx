import { useState, useMemo } from 'react';

// Dreieck-Rechner: Fläche, Umfang, Winkel und Höhen
// Drei Seiten: Heron-Formel A=√(s(s−a)(s−b)(s−c)) mit s=(a+b+c)/2,
// Winkel über den Kosinussatz, Höhen über h=2A/Seite.
// Grundseite × Höhe: A = g·h/2. Rechtwinklig: A = Kathete1·Kathete2/2,
// Hypotenuse über Pythagoras.

type Modus = 'seiten' | 'grundseite' | 'rechtwinklig';

function rund(x: number, dez = 2): number {
  const f = 10 ** dez;
  return Math.round(x * f) / f;
}

function gueltig(a: number, b: number, c: number): boolean {
  return a > 0 && b > 0 && c > 0 && a + b > c && a + c > b && b + c > a;
}

function formatZahl(x: number, dez = 2): string {
  return x.toLocaleString('de-DE', { maximumFractionDigits: dez });
}

export default function DreieckRechner() {
  const [modus, setModus] = useState<Modus>('seiten');
  const [seiteA, setSeiteA] = useState(3);
  const [seiteB, setSeiteB] = useState(4);
  const [seiteC, setSeiteC] = useState(5);
  const [grundseite, setGrundseite] = useState(6);
  const [hoehe, setHoehe] = useState(4);
  const [kathete1, setKathete1] = useState(3);
  const [kathete2, setKathete2] = useState(4);

  const ergebnis = useMemo(() => {
    if (modus === 'seiten') {
      const a = Math.max(0, seiteA || 0);
      const b = Math.max(0, seiteB || 0);
      const c = Math.max(0, seiteC || 0);
      if (!gueltig(a, b, c)) return { fehler: 'Die Seiten erfüllen die Dreiecksungleichung nicht – jede Seite muss kürzer sein als die Summe der beiden anderen.' };

      const s = (a + b + c) / 2;
      const flaeche = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      const cosA = Math.min(1, Math.max(-1, (b * b + c * c - a * a) / (2 * b * c)));
      const cosB = Math.min(1, Math.max(-1, (a * a + c * c - b * b) / (2 * a * c)));
      const alpha = (Math.acos(cosA) * 180) / Math.PI;
      const beta = (Math.acos(cosB) * 180) / Math.PI;

      return {
        flaeche: rund(flaeche),
        umfang: rund(a + b + c),
        winkel: { alpha: rund(alpha, 1), beta: rund(beta, 1), gamma: rund(180 - alpha - beta, 1) },
        hoehen: { ha: rund((2 * flaeche) / a), hb: rund((2 * flaeche) / b), hc: rund((2 * flaeche) / c) },
      };
    }

    if (modus === 'grundseite') {
      const g = Math.max(0, grundseite || 0);
      const h = Math.max(0, hoehe || 0);
      if (g <= 0 || h <= 0) return { fehler: 'Grundseite und Höhe müssen größer als 0 sein.' };
      return { flaeche: rund((g * h) / 2) };
    }

    const k1 = Math.max(0, kathete1 || 0);
    const k2 = Math.max(0, kathete2 || 0);
    if (k1 <= 0 || k2 <= 0) return { fehler: 'Beide Katheten müssen größer als 0 sein.' };
    const hyp = Math.sqrt(k1 * k1 + k2 * k2);
    return {
      flaeche: rund((k1 * k2) / 2),
      hypotenuse: rund(hyp),
      umfang: rund(k1 + k2 + hyp),
    };
  }, [modus, seiteA, seiteB, seiteC, grundseite, hoehe, kathete1, kathete2]);

  const inputKlasse = 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg';

  return (
    <div>
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
          <button type="button" onClick={() => setModus('seiten')} className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${modus === 'seiten' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Drei Seiten (a, b, c)
          </button>
          <button type="button" onClick={() => setModus('grundseite')} className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${modus === 'grundseite' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Grundseite + Höhe
          </button>
          <button type="button" onClick={() => setModus('rechtwinklig')} className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${modus === 'rechtwinklig' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Rechtwinklig (Katheten)
          </button>
        </div>

        {modus === 'seiten' && (
          <div className="grid grid-cols-3 gap-3">
            {([['a', seiteA, setSeiteA], ['b', seiteB, setSeiteB], ['c', seiteC, setSeiteC]] as const).map(([name, wert, setter]) => (
              <div key={name}>
                <label htmlFor={`d-${name}`} className="block text-sm font-medium text-gray-700 mb-1">Seite {name}</label>
                <input id={`d-${name}`} type="number" min="0" step="0.1" value={wert} onChange={(e) => setter(Number(e.target.value))} className={inputKlasse} />
              </div>
            ))}
          </div>
        )}

        {modus === 'grundseite' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="d-g" className="block text-sm font-medium text-gray-700 mb-1">Grundseite g</label>
              <input id="d-g" type="number" min="0" step="0.1" value={grundseite} onChange={(e) => setGrundseite(Number(e.target.value))} className={inputKlasse} />
            </div>
            <div>
              <label htmlFor="d-h" className="block text-sm font-medium text-gray-700 mb-1">Höhe h (auf g)</label>
              <input id="d-h" type="number" min="0" step="0.1" value={hoehe} onChange={(e) => setHoehe(Number(e.target.value))} className={inputKlasse} />
            </div>
          </div>
        )}

        {modus === 'rechtwinklig' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="d-k1" className="block text-sm font-medium text-gray-700 mb-1">Kathete a</label>
              <input id="d-k1" type="number" min="0" step="0.1" value={kathete1} onChange={(e) => setKathete1(Number(e.target.value))} className={inputKlasse} />
            </div>
            <div>
              <label htmlFor="d-k2" className="block text-sm font-medium text-gray-700 mb-1">Kathete b</label>
              <input id="d-k2" type="number" min="0" step="0.1" value={kathete2} onChange={(e) => setKathete2(Number(e.target.value))} className={inputKlasse} />
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          Einheit frei wählbar (cm, m, km …) – Fläche ergibt sich in der Einheit zum Quadrat.
        </p>
      </div>

      {/* Ergebnis */}
      {'fehler' in ergebnis ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-amber-800 text-sm">
          ⚠️ {ergebnis.fehler}
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
            <p className="text-violet-100 text-sm mb-1">Flächeninhalt des Dreiecks</p>
            <p className="text-5xl font-bold mb-2">{formatZahl(ergebnis.flaeche ?? 0)}</p>
            <p className="text-violet-100 text-sm">
              {modus === 'seiten' && `Umfang: ${formatZahl(ergebnis.umfang ?? 0)} · berechnet mit der Heron-Formel`}
              {modus === 'grundseite' && 'Formel: Fläche = Grundseite × Höhe ÷ 2'}
              {modus === 'rechtwinklig' && `Hypotenuse: ${formatZahl(ergebnis.hypotenuse ?? 0)} · Umfang: ${formatZahl(ergebnis.umfang ?? 0)}`}
            </p>
          </div>

          {modus === 'seiten' && ergebnis.winkel && ergebnis.hoehen && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Winkel & Höhen</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100">
                      <td className="py-2 pr-2">Winkel α (gegenüber a) / β (gegenüber b) / γ (gegenüber c)</td>
                      <td className="py-2 pl-2 text-right font-medium text-gray-800">
                        {formatZahl(ergebnis.winkel.alpha, 1)}° / {formatZahl(ergebnis.winkel.beta, 1)}° / {formatZahl(ergebnis.winkel.gamma, 1)}°
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-2">Höhen h<sub>a</sub> / h<sub>b</sub> / h<sub>c</sub></td>
                      <td className="py-2 pl-2 text-right font-medium text-gray-800">
                        {formatZahl(ergebnis.hoehen.ha)} / {formatZahl(ergebnis.hoehen.hb)} / {formatZahl(ergebnis.hoehen.hc)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Winkel über den Kosinussatz, Höhen über h = 2 × Fläche ÷ Seite. Winkelsumme stets 180°.
              </p>
            </div>
          )}
        </>
      )}

      {/* Quellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-xs text-gray-500 mb-4">
          ℹ️ Reine Geometrie-Rechenhilfe – Ergebnisse kaufmännisch auf zwei Dezimalstellen gerundet
          (Winkel auf eine).
        </p>
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Formeln</h3>
        <ul className="text-xs text-gray-600 space-y-1 font-mono">
          <li>Heron: A = √(s·(s−a)·(s−b)·(s−c)), s = (a+b+c)/2</li>
          <li>Grundseite: A = g · h / 2</li>
          <li>Kosinussatz: cos α = (b² + c² − a²) / (2·b·c)</li>
          <li>Pythagoras: c = √(a² + b²)</li>
        </ul>
      </div>
    </div>
  );
}
