import { useMemo, useState } from 'react';
import { streitwertGebuehr } from '../../lib/gkg';

// Gerichtskosten im Zivilprozess: Wertgebühr nach § 34 GKG × Gebührensatz
// des Verfahrens (Anlage 1 KV GKG). Alle Sätze amtlich belegt:
// 1100 (0,5, mind. 38 €), 1210 (3,0), 1211 (Ermäßigung 1,0),
// 1220 (4,0), 1221 (1,0), 1230 (5,0).
const SZENARIEN = [
  { kvNr: '1100', label: 'Mahnverfahren (Mahnbescheid)', satz: 0.5, min: 38 },
  { kvNr: '1210', label: 'Klage, 1. Instanz (Regelfall)', satz: 3.0, min: 0 },
  { kvNr: '1211', label: 'Klage, 1. Instanz mit früher Erledigung (Rücknahme, Anerkenntnis, Vergleich)', satz: 1.0, min: 0 },
  { kvNr: '1220', label: 'Berufung (2. Instanz)', satz: 4.0, min: 0 },
  { kvNr: '1221', label: 'Berufung, zurückgenommen vor Begründungseingang', satz: 1.0, min: 0 },
  { kvNr: '1230', label: 'Revision (BGH)', satz: 5.0, min: 0 },
];

const QUICK = [1000, 5000, 10000, 25000, 50000];
const TABELLE = [500, 1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000, 50000, 100000];

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function kosten(streitwert: number, szenarioIdx: number) {
  const s = SZENARIEN[szenarioIdx];
  const wertgebuehr = streitwertGebuehr(streitwert);
  const betrag = Math.max(Math.round(wertgebuehr * s.satz * 100) / 100, s.min);
  return { wertgebuehr, betrag, s };
}

export default function GerichtskostenRechner() {
  const [streitwert, setStreitwert] = useState(5000);
  const [szenarioIdx, setSzenarioIdx] = useState(1);

  const ergebnis = useMemo(() => kosten(Math.max(1, streitwert || 0), szenarioIdx), [streitwert, szenarioIdx]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Streitwert (Höhe der Forderung)</label>
          <div className="relative mb-2">
            <input
              type="number"
              min={1}
              step={500}
              value={streitwert}
              onChange={(e) => setStreitwert(Number(e.target.value))}
              className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => setStreitwert(q)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  streitwert === q ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-100'
                }`}
              >
                {q.toLocaleString('de-DE')} €
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Verfahren</label>
          <select
            value={szenarioIdx}
            onChange={(e) => setSzenarioIdx(Number(e.target.value))}
            className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none text-sm"
          >
            {SZENARIEN.map((s, i) => (
              <option key={s.kvNr} value={i}>{s.label} ({s.satz.toLocaleString('de-DE', { minimumFractionDigits: 1 })}-fach)</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Wertgebühr nach § 34 GKG (1,0)</span>
          <span className="font-medium">{formatEuro(ergebnis.wertgebuehr)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-indigo-100 pb-2">
          <span>× Gebührensatz {ergebnis.s.satz.toLocaleString('de-DE', { minimumFractionDigits: 1 })} (Nr. {ergebnis.s.kvNr} KV GKG)</span>
          <span className="font-medium">{ergebnis.s.min > 0 ? `mind. ${formatEuro(ergebnis.s.min)}` : ''}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Gerichtskosten</span>
          <span className="text-2xl font-bold text-indigo-700">{formatEuro(ergebnis.betrag)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Nur Gerichtsgebühren; Auslagen (z.B. Sachverständige, Zeugen) und Anwaltskosten kommen hinzu.
        Bei Klageerhebung ist die 3,0-Gebühr als Vorschuss fällig; die Klage wird erst nach Zahlung
        zugestellt (§ 12 GKG).
      </p>

      <div className="overflow-x-auto mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="py-2 px-3 rounded-tl-lg">Streitwert</th>
              <th className="py-2 px-3 text-right">Wertgebühr (1,0)</th>
              <th className="py-2 px-3 text-right rounded-tr-lg">Klage 1. Instanz (3,0)</th>
            </tr>
          </thead>
          <tbody>
            {TABELLE.map((w) => {
              const g = streitwertGebuehr(w);
              return (
                <tr key={w} className={`border-b border-gray-100 ${streitwert === w ? 'bg-indigo-50' : ''}`}>
                  <td className="py-2 px-3">{w.toLocaleString('de-DE')} €</td>
                  <td className="py-2 px-3 text-right font-mono">{formatEuro(g)}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">{formatEuro(Math.round(g * 300) / 100)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
