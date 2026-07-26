import { useMemo, useState } from 'react';

// Urlaubsentgelt nach § 11 BUrlG: Durchschnittsverdienst der letzten
// 13 Wochen vor Urlaubsbeginn, ohne Überstundenvergütung.
// Je Urlaubstag: Referenzverdienst / (13 × Arbeitstage pro Woche).
function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function UrlaubsentgeltRechner() {
  const [modus, setModus] = useState<'fest' | 'schwankend'>('fest');
  const [stundenlohn, setStundenlohn] = useState(18);
  const [wochenstunden, setWochenstunden] = useState(40);
  const [summe13, setSumme13] = useState(9360);
  const [tageProWoche, setTageProWoche] = useState(5);
  const [urlaubstage, setUrlaubstage] = useState(10);

  const e = useMemo(() => {
    const tpw = Math.min(Math.max(1, tageProWoche || 5), 6);
    const referenz = modus === 'fest'
      ? Math.max(0, stundenlohn || 0) * Math.max(0, wochenstunden || 0) * 13
      : Math.max(0, summe13 || 0);
    const proTag = Math.round(referenz / (13 * tpw) * 100) / 100;
    const gesamt = Math.round(proTag * Math.max(0, urlaubstage || 0) * 100) / 100;
    return { referenz, proTag, gesamt, tpw };
  }, [modus, stundenlohn, wochenstunden, summe13, tageProWoche, urlaubstage]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setModus('fest')}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
            modus === 'fest' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'
          }`}>
          Fester Stundenlohn
        </button>
        <button onClick={() => setModus('schwankend')}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
            modus === 'schwankend' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'
          }`}>
          Schwankender Verdienst
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        {modus === 'fest' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stundenlohn (brutto)</label>
              <div className="relative">
                <input type="number" min={0} step={0.5} value={stundenlohn}
                  onChange={(ev) => setStundenlohn(Number(ev.target.value))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 outline-none text-center font-bold" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wochenstunden</label>
              <input type="number" min={1} max={60} step={1} value={wochenstunden}
                onChange={(ev) => setWochenstunden(Number(ev.target.value))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 outline-none text-center font-bold" />
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bruttoverdienst der letzten 13 Wochen (ohne Überstundenvergütung)</label>
            <div className="relative">
              <input type="number" min={0} step={100} value={summe13}
                onChange={(ev) => setSumme13(Number(ev.target.value))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 outline-none text-center font-bold" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">13 Wochen = rund 3 Monatsabrechnungen; Zuschläge und Provisionen zählen mit</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Arbeitstage pro Woche</label>
          <select value={tageProWoche} onChange={(ev) => setTageProWoche(Number(ev.target.value))}
            className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 outline-none text-sm">
            {[1, 2, 3, 4, 5, 6].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Urlaubstage</label>
        <input type="number" min={1} max={60} step={1} value={urlaubstage}
          onChange={(ev) => setUrlaubstage(Number(ev.target.value))}
          className="w-32 py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 outline-none text-center font-bold" />
      </div>

      <div className="bg-amber-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Referenzverdienst (13 Wochen, ohne Überstunden)</span>
          <span className="font-medium">{formatEuro(e.referenz)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-amber-100 pb-2">
          <span>÷ {13 * e.tpw} Arbeitstage = Urlaubsentgelt je Urlaubstag</span>
          <span className="font-medium">{formatEuro(e.proTag)}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Urlaubsentgelt für {urlaubstage} Tage (brutto)</span>
          <span className="text-2xl font-bold text-amber-700">{formatEuro(e.gesamt)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Nach § 11 BUrlG bleiben Überstundenvergütungen außen vor; Kürzungen durch Kurzarbeit,
        Arbeitsausfälle oder unverschuldete Fehlzeiten im Referenzzeitraum werden herausgerechnet
        (es zählt der Verdienst, der ohne sie angefallen wäre). Dauerhafte Gehaltserhöhungen gelten
        ab sofort. Das Urlaubsentgelt ist vor Urlaubsantritt auszuzahlen.
      </p>
    </div>
  );
}
