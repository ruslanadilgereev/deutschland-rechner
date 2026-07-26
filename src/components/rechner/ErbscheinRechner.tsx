import { useMemo, useState } from 'react';
import { gnotkgTabelleB } from '../../lib/gnotkg';

// Erbschein-Kosten: 1,0-Gebühr für das Verfahren (Nr. 12210 KV GNotKG,
// Tabelle B) + im Regelfall eine weitere Gebühr in gleicher Höhe für die
// Abnahme der eidesstattlichen Versicherung (gesondert erhoben, Anm. 1 zu
// Nr. 12210). Geschäftswert: Nachlasswert beim Erbfall abzüglich der vom
// Erblasser herrührenden Verbindlichkeiten (§ 40 GNotKG).
const QUICK = [25000, 50000, 100000, 250000, 500000];
const TABELLE = [10000, 25000, 50000, 100000, 150000, 250000, 500000, 1000000];

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function ErbscheinRechner() {
  const [aktiva, setAktiva] = useState(150000);
  const [schulden, setSchulden] = useState(0);
  const [mitEV, setMitEV] = useState(true);

  const e = useMemo(() => {
    const wert = Math.max(0, Math.max(0, aktiva || 0) - Math.max(0, schulden || 0));
    const gebuehr = gnotkgTabelleB(wert);
    const gesamt = mitEV ? gebuehr * 2 : gebuehr;
    return { wert, gebuehr, gesamt };
  }, [aktiva, schulden, mitEV]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nachlasswert (Vermögen des Erblassers)</label>
          <div className="relative">
            <input type="number" min={0} step={5000} value={aktiva}
              onChange={(ev) => setAktiva(Number(ev.target.value))}
              className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-600 outline-none" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schulden des Erblassers</label>
          <div className="relative">
            <input type="number" min={0} step={5000} value={schulden}
              onChange={(ev) => setSchulden(Number(ev.target.value))}
              className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-600 outline-none" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK.map((q) => (
          <button key={q} onClick={() => setAktiva(q)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              aktiva === q ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
            }`}>
            {q.toLocaleString('de-DE')} €
          </button>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-gray-700 mb-4">
        <input type="checkbox" checked={mitEV} onChange={(ev) => setMitEV(ev.target.checked)}
          className="w-4 h-4 rounded border-gray-300" />
        mit eidesstattlicher Versicherung (Regelfall)
      </label>

      <div className="bg-amber-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Geschäftswert (Nachlass − Erblasser-Schulden, § 40 GNotKG)</span>
          <span className="font-medium">{e.wert.toLocaleString('de-DE')} €</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Verfahrensgebühr 1,0 (Nr. 12210, Tabelle B)</span>
          <span className="font-medium">{formatEuro(e.gebuehr)}</span>
        </div>
        {mitEV && (
          <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-amber-100 pb-2">
            <span>+ eidesstattliche Versicherung (gesonderte Gebühr)</span>
            <span className="font-medium">{formatEuro(e.gebuehr)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Erbschein-Kosten gesamt</span>
          <span className="text-2xl font-bold text-amber-700">{formatEuro(e.gesamt)}</span>
        </div>
      </div>

      <div className="overflow-x-auto mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="py-2 px-3 rounded-tl-lg">Reiner Nachlasswert</th>
              <th className="py-2 px-3 text-right">Gebühr (1,0)</th>
              <th className="py-2 px-3 text-right rounded-tr-lg">gesamt mit eidesstattl. Versicherung</th>
            </tr>
          </thead>
          <tbody>
            {TABELLE.map((w) => {
              const g = gnotkgTabelleB(w);
              return (
                <tr key={w} className="border-b border-gray-100">
                  <td className="py-2 px-3">{w.toLocaleString('de-DE')} €</td>
                  <td className="py-2 px-3 text-right font-mono">{formatEuro(g)}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">{formatEuro(g * 2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Hinzu kommen geringe Auslagen (Dokumente, Zustellungen). Wird der Antrag früh zurückgenommen,
        ermäßigt sich die Verfahrensgebühr auf 0,3 (höchstens 218 €, Nr. 12211 KV GNotKG).
      </p>
    </div>
  );
}
