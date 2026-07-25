import { useMemo, useState } from 'react';
import gkg from '../../data/gkg-gebuehren.json';

// Gerichtskosten des Mahnbescheids: 0,5-Gebühr nach Nr. 1100 KV GKG,
// mindestens 38,00 € (Stand KostBRÄG 2025). Wertgebühr nach § 34 GKG,
// Formel gegen die amtliche Anlage 2 verifiziert (siehe gkg-gebuehren.json).
const GRUND = gkg.grundgebuehr;
const STUFEN = gkg.stufen;
const MAHN = gkg.mahnverfahren;

// Volle Wertgebühr (1,0) nach § 34 Abs. 1 GKG
export function streitwertGebuehr(streitwert: number): number {
  let gebuehr = GRUND.gebuehr;
  let untere = GRUND.bisStreitwert;
  for (const stufe of STUFEN) {
    if (streitwert <= untere) break;
    const obere = stufe.bisStreitwert ?? Infinity;
    const anteil = Math.min(streitwert, obere) - untere;
    gebuehr += Math.ceil(anteil / stufe.schritt) * stufe.erhoehung;
    untere = obere;
  }
  return Math.round(gebuehr * 100) / 100;
}

function mahnbescheidKosten(streitwert: number) {
  const volleGebuehr = streitwertGebuehr(streitwert);
  const halbeGebuehr = Math.round(volleGebuehr * MAHN.satz * 100) / 100;
  const kosten = Math.max(halbeGebuehr, MAHN.mindestgebuehr);
  return { volleGebuehr, halbeGebuehr, kosten, mindestGreift: halbeGebuehr < MAHN.mindestgebuehr };
}

const QUICK = [500, 1000, 2500, 5000, 10000];
const BEISPIELE = [500, 1000, 1500, 2000, 3000, 5000, 10000, 25000, 50000];

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function MahnbescheidRechner() {
  const [forderung, setForderung] = useState(2500);

  const ergebnis = useMemo(() => mahnbescheidKosten(Math.max(1, forderung || 0)), [forderung]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Höhe Ihrer Forderung (Hauptforderung, ohne Zinsen und Mahnkosten)
      </label>
      <div className="relative mb-3">
        <input
          type="number"
          min={1}
          step={100}
          value={forderung}
          onChange={(e) => setForderung(Number(e.target.value))}
          className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 outline-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => setForderung(q)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              forderung === q ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
            }`}
          >
            {q.toLocaleString('de-DE')} €
          </button>
        ))}
      </div>

      <div className="bg-amber-50 rounded-xl p-5 mb-4">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Volle Wertgebühr nach § 34 GKG (1,0)</span>
          <span className="font-medium">{formatEuro(ergebnis.volleGebuehr)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-amber-100 pb-2">
          <span>Davon 0,5-Gebühr (Nr. 1100 KV GKG)</span>
          <span className="font-medium">{formatEuro(ergebnis.halbeGebuehr)}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Gerichtskosten Mahnbescheid</span>
          <span className="text-2xl font-bold text-amber-700">{formatEuro(ergebnis.kosten)}</span>
        </div>
        {ergebnis.mindestGreift && (
          <p className="text-xs text-gray-500 mt-2">
            Die 0,5-Gebühr liegt unter der Mindestgebühr; es gilt der Mindestbetrag von {formatEuro(MAHN.mindestgebuehr)}.
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="py-2 px-3 rounded-tl-lg">Forderung bis</th>
              <th className="py-2 px-3 text-right rounded-tr-lg">Kosten Mahnbescheid</th>
            </tr>
          </thead>
          <tbody>
            {BEISPIELE.map((b) => (
              <tr key={b} className={`border-b border-gray-100 ${forderung === b ? 'bg-amber-50' : ''}`}>
                <td className="py-2 px-3">{b.toLocaleString('de-DE')} €</td>
                <td className="py-2 px-3 text-right font-mono font-bold">{formatEuro(mahnbescheidKosten(b).kosten)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Gerichtsgebühr nach Nr. 1100 KV GKG (0,5-Gebühr, mindestens {formatEuro(MAHN.mindestgebuehr)}), Gebührentabelle
        i.d.F. des KostBRÄG 2025. Zusätzliche Zustellkosten fallen beim Mahnbescheid regelmäßig nicht an.
      </p>
    </div>
  );
}
