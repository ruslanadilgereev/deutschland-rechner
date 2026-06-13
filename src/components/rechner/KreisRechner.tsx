import { useState, useMemo } from 'react';

// Geometrie-Rechner: Kreis (Umfang/Durchmesser/Radius/Fläche bidirektional) + Rechteck/Quadrat/Dreieck.
// Reine Mathematik – keine externe Datenquelle nötig (wie Prozent-/Dreisatz-Rechner).

type Form = 'kreis' | 'rechteck' | 'quadrat' | 'dreieck';
type KreisFeld = 'r' | 'd' | 'u' | 'a'; // Radius, Durchmesser, Umfang, Fläche

const fmt = (n: number) => {
  if (!isFinite(n) || isNaN(n)) return '–';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

export function KreisRechner() {
  const [form, setForm] = useState<Form>('kreis');

  // Kreis: ein bekannter Wert + dessen Typ
  const [kreisWert, setKreisWert] = useState(5);
  const [kreisFeld, setKreisFeld] = useState<KreisFeld>('r');

  // Rechteck
  const [rechtA, setRechtA] = useState(4);
  const [rechtB, setRechtB] = useState(3);
  // Quadrat
  const [quadA, setQuadA] = useState(5);
  // Dreieck (drei Seiten + Höhe für Fläche)
  const [triA, setTriA] = useState(3);
  const [triB, setTriB] = useState(4);
  const [triC, setTriC] = useState(5);
  const [triH, setTriH] = useState(4); // Höhe auf Seite a

  const kreis = useMemo(() => {
    const v = Math.max(0, kreisWert);
    let r = 0;
    if (kreisFeld === 'r') r = v;
    else if (kreisFeld === 'd') r = v / 2;
    else if (kreisFeld === 'u') r = v / (2 * Math.PI);
    else r = Math.sqrt(v / Math.PI); // aus Fläche
    return { r, d: 2 * r, u: 2 * Math.PI * r, a: Math.PI * r * r };
  }, [kreisWert, kreisFeld]);

  const rechteck = useMemo(() => {
    const a = Math.max(0, rechtA), b = Math.max(0, rechtB);
    return { u: 2 * (a + b), a: a * b, diag: Math.sqrt(a * a + b * b) };
  }, [rechtA, rechtB]);

  const quadrat = useMemo(() => {
    const a = Math.max(0, quadA);
    return { u: 4 * a, a: a * a, diag: a * Math.SQRT2 };
  }, [quadA]);

  const dreieck = useMemo(() => {
    const a = Math.max(0, triA), b = Math.max(0, triB), c = Math.max(0, triC);
    const u = a + b + c;
    // Fläche über Heron, falls gültiges Dreieck; sonst über Grundseite a × Höhe
    const s = u / 2;
    const heronArg = s * (s - a) * (s - b) * (s - c);
    const gueltig = a + b > c && a + c > b && b + c > a && a > 0 && b > 0 && c > 0;
    const flaecheHeron = gueltig ? Math.sqrt(heronArg) : NaN;
    const flaecheHoehe = (a * Math.max(0, triH)) / 2;
    return { u, gueltig, flaecheHeron, flaecheHoehe };
  }, [triA, triB, triC, triH]);

  const FORMEN: { id: Form; label: string; icon: string }[] = [
    { id: 'kreis', label: 'Kreis', icon: '⭕' },
    { id: 'rechteck', label: 'Rechteck', icon: '▭' },
    { id: 'quadrat', label: 'Quadrat', icon: '◻' },
    { id: 'dreieck', label: 'Dreieck', icon: '△' },
  ];

  const KREIS_FELDER: { id: KreisFeld; label: string }[] = [
    { id: 'r', label: 'Radius (r)' },
    { id: 'd', label: 'Durchmesser (d)' },
    { id: 'u', label: 'Umfang (U)' },
    { id: 'a', label: 'Fläche (A)' },
  ];

  const inputCls =
    'w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Form-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-2">Welche Form?</span>
        <div className="grid grid-cols-4 gap-2">
          {FORMEN.map((f) => (
            <button
              key={f.id}
              onClick={() => setForm(f.id)}
              className={`px-2 py-3 rounded-xl text-center transition-all ${
                form === f.id ? 'bg-orange-600 text-white font-medium' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="block text-xl">{f.icon}</span>
              <span className="block text-xs mt-1">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KREIS */}
      {form === 'kreis' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Bekannten Wert eingeben</span>
              <span className="text-xs text-gray-500 block mt-1">
                Gib einen Wert ein – Radius, Durchmesser, Umfang oder Fläche – der Rest wird berechnet.
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {KREIS_FELDER.map((kf) => (
                <button
                  key={kf.id}
                  onClick={() => setKreisFeld(kf.id)}
                  className={`px-1 py-2 text-xs rounded-xl transition-all ${
                    kreisFeld === kf.id ? 'bg-orange-100 text-orange-800 font-medium border-2 border-orange-300' : 'bg-gray-50 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  {kf.label}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={kreisWert}
              onChange={(e) => setKreisWert(Math.max(0, Number(e.target.value) || 0))}
              className={inputCls}
              min="0"
              step="1"
            />
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl shadow-lg p-6 text-white mb-6">
            <h3 className="text-sm font-medium opacity-80 mb-3">⭕ Kreis – alle Werte</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-xs opacity-80">Radius (r)</span>
                <div className="text-2xl font-bold">{fmt(kreis.r)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-xs opacity-80">Durchmesser (d = 2r)</span>
                <div className="text-2xl font-bold">{fmt(kreis.d)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-xs opacity-80">Umfang (U = 2·π·r)</span>
                <div className="text-2xl font-bold">{fmt(kreis.u)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-xs opacity-80">Fläche (A = π·r²)</span>
                <div className="text-2xl font-bold">{fmt(kreis.a)}</div>
              </div>
            </div>
            <p className="text-orange-100 text-xs mt-3">Rechnet mit π = {Math.PI.toLocaleString('de-DE', { maximumFractionDigits: 5 })} …</p>
          </div>
        </>
      )}

      {/* RECHTECK */}
      {form === 'rechteck' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Länge a</span>
              <input type="number" value={rechtA} onChange={(e) => setRechtA(Math.max(0, Number(e.target.value) || 0))} className={inputCls + ' mt-1'} min="0" />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Breite b</span>
              <input type="number" value={rechtB} onChange={(e) => setRechtB(Math.max(0, Number(e.target.value) || 0))} className={inputCls + ' mt-1'} min="0" />
            </label>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl shadow-lg p-6 text-white mb-6">
            <h3 className="text-sm font-medium opacity-80 mb-3">▭ Rechteck</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-4"><span className="text-xs opacity-80">Umfang (2·(a+b))</span><div className="text-xl font-bold">{fmt(rechteck.u)}</div></div>
              <div className="bg-white/10 rounded-xl p-4"><span className="text-xs opacity-80">Fläche (a·b)</span><div className="text-xl font-bold">{fmt(rechteck.a)}</div></div>
              <div className="bg-white/10 rounded-xl p-4"><span className="text-xs opacity-80">Diagonale</span><div className="text-xl font-bold">{fmt(rechteck.diag)}</div></div>
            </div>
          </div>
        </>
      )}

      {/* QUADRAT */}
      {form === 'quadrat' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Seitenlänge a</span>
              <input type="number" value={quadA} onChange={(e) => setQuadA(Math.max(0, Number(e.target.value) || 0))} className={inputCls + ' mt-1'} min="0" />
            </label>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl shadow-lg p-6 text-white mb-6">
            <h3 className="text-sm font-medium opacity-80 mb-3">◻ Quadrat</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-4"><span className="text-xs opacity-80">Umfang (4·a)</span><div className="text-xl font-bold">{fmt(quadrat.u)}</div></div>
              <div className="bg-white/10 rounded-xl p-4"><span className="text-xs opacity-80">Fläche (a²)</span><div className="text-xl font-bold">{fmt(quadrat.a)}</div></div>
              <div className="bg-white/10 rounded-xl p-4"><span className="text-xs opacity-80">Diagonale (a·√2)</span><div className="text-xl font-bold">{fmt(quadrat.diag)}</div></div>
            </div>
          </div>
        </>
      )}

      {/* DREIECK */}
      {form === 'dreieck' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <span className="text-gray-700 font-medium text-sm block mb-2">Seiten a, b, c (für Umfang &amp; Fläche nach Heron)</span>
            <div className="grid grid-cols-3 gap-3">
              <input type="number" value={triA} onChange={(e) => setTriA(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" placeholder="a" />
              <input type="number" value={triB} onChange={(e) => setTriB(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" placeholder="b" />
              <input type="number" value={triC} onChange={(e) => setTriC(Math.max(0, Number(e.target.value) || 0))} className={inputCls} min="0" placeholder="c" />
            </div>
            <label className="block mt-4">
              <span className="text-gray-700 font-medium text-sm">Alternativ: Höhe h auf Seite a (für Fläche = a·h/2)</span>
              <input type="number" value={triH} onChange={(e) => setTriH(Math.max(0, Number(e.target.value) || 0))} className={inputCls + ' mt-1'} min="0" />
            </label>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl shadow-lg p-6 text-white mb-6">
            <h3 className="text-sm font-medium opacity-80 mb-3">△ Dreieck</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-4"><span className="text-xs opacity-80">Umfang (a+b+c)</span><div className="text-xl font-bold">{fmt(dreieck.u)}</div></div>
              <div className="bg-white/10 rounded-xl p-4"><span className="text-xs opacity-80">Fläche (Heron)</span><div className="text-xl font-bold">{dreieck.gueltig ? fmt(dreieck.flaecheHeron) : '–'}</div></div>
              <div className="bg-white/10 rounded-xl p-4"><span className="text-xs opacity-80">Fläche (a·h/2)</span><div className="text-xl font-bold">{fmt(dreieck.flaecheHoehe)}</div></div>
            </div>
            {!dreieck.gueltig && (
              <p className="text-orange-100 text-xs mt-3">
                Mit diesen Seitenlängen lässt sich kein gültiges Dreieck bilden (Dreiecksungleichung verletzt) – die Heron-Fläche ist daher nicht definiert.
              </p>
            )}
          </div>
        </>
      )}

      {/* Hinweis Einheiten */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <p className="text-sm text-blue-800">
          💡 Der Rechner ist <strong>einheitenneutral</strong>: Gibst du Längen in cm ein, sind Umfang/Diagonale
          in cm und die Fläche in cm². Bei Eingabe in m entsprechend in m und m². Wichtig ist nur, dass alle
          Längen einer Form dieselbe Einheit haben.
        </p>
      </div>
    </div>
  );
}

export default KreisRechner;
