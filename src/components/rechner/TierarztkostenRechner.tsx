import { useMemo, useState } from 'react';
import got from '../../data/got.json';

// Tierarztkosten nach GOT 2022: einfacher Gebührensatz × Satz (1-3, im Notdienst
// 2-4 plus 50 € Notdienstgebühr, §§ 2 und 4 GOT). Sätze sind netto; auf der
// Rechnung kommen 19 % USt sowie Arzneimittel/Material hinzu (§ 7 GOT).
const POSITIONEN = got.positionen;
const SATZ = got.satz;
const UST = 0.19;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function TierarztkostenRechner() {
  const [posIdx, setPosIdx] = useState(0);
  const [notdienst, setNotdienst] = useState(false);
  const [satz, setSatz] = useState(1.0);

  const minSatz = notdienst ? SATZ.notdienstMin : SATZ.regelMin;
  const maxSatz = notdienst ? SATZ.notdienstMax : SATZ.regelMax;
  const effektiverSatz = Math.min(Math.max(satz, minSatz), maxSatz);

  const ergebnis = useMemo(() => {
    const pos = POSITIONEN[posIdx];
    const gebuehr = Math.round(pos.gebuehr * effektiverSatz * 100) / 100;
    const notdienstgebuehr = notdienst ? SATZ.notdienstgebuehr : 0;
    const netto = gebuehr + notdienstgebuehr;
    const brutto = Math.round(netto * (1 + UST) * 100) / 100;
    return { pos, gebuehr, notdienstgebuehr, netto, brutto };
  }, [posIdx, effektiverSatz, notdienst]);

  const presets = notdienst ? [2.0, 3.0, 4.0] : [1.0, 2.0, 3.0];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Leistung (GOT-Position, Kleintiere)</label>
        <select
          value={posIdx}
          onChange={(e) => setPosIdx(Number(e.target.value))}
          className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 outline-none text-sm"
        >
          {POSITIONEN.map((p, i) => (
            <option key={p.nr} value={i}>Nr. {p.nr}: {p.label} ({formatEuro(p.gebuehr)})</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gebührensatz (Faktor)</label>
          <div className="flex gap-2">
            {presets.map((f) => (
              <button
                key={f}
                onClick={() => setSatz(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  Math.abs(effektiverSatz - f) < 1e-9 ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-100'
                }`}
              >
                {f.toLocaleString('de-DE', { minimumFractionDigits: 1 })}
              </button>
            ))}
            <input
              type="number"
              step={0.1}
              min={minSatz}
              max={maxSatz}
              value={satz}
              onChange={(e) => setSatz(Number(e.target.value) || minSatz)}
              className="w-20 py-2 px-2 border-2 border-gray-200 rounded-xl focus:border-rose-500 outline-none text-sm text-center"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Erlaubt: {minSatz.toLocaleString('de-DE', { minimumFractionDigits: 1 })}- bis {maxSatz.toLocaleString('de-DE', { minimumFractionDigits: 1 })}-fach{notdienst ? ' (Notdienst, § 4 GOT)' : ' (§ 2 GOT)'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notdienst?</label>
          <button
            onClick={() => { setNotdienst(!notdienst); setSatz(notdienst ? 1.0 : 2.0); }}
            className={`w-full py-2 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
              notdienst ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300'
            }`}
          >
            {notdienst ? 'Ja: Nacht / Wochenende / Feiertag' : 'Nein: reguläre Sprechzeit'}
          </button>
          <p className="text-xs text-gray-500 mt-1">Nacht 18-8 Uhr, Wochenende Fr 18 Uhr bis Mo 8 Uhr, Feiertage</p>
        </div>
      </div>

      <div className="bg-rose-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Nr. {ergebnis.pos.nr} × {effektiverSatz.toLocaleString('de-DE', { minimumFractionDigits: 1 })}-facher Satz</span>
          <span className="font-medium">{formatEuro(ergebnis.gebuehr)}</span>
        </div>
        {notdienst && (
          <div className="flex justify-between text-sm text-gray-600 py-1">
            <span>+ Notdienstgebühr (§ 4 GOT, einmal je Besuch)</span>
            <span className="font-medium">{formatEuro(ergebnis.notdienstgebuehr)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-rose-100 pb-2">
          <span>+ 19 % Umsatzsteuer</span>
          <span className="font-medium">{formatEuro(ergebnis.brutto - ergebnis.netto)}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Kosten dieser Leistung (brutto)</span>
          <span className="text-2xl font-bold text-rose-700">{formatEuro(ergebnis.brutto)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Zusätzlich berechnet die Praxis Arzneimittel, verbrauchtes Material und Auslagen (§ 7 GOT).
        OP-Positionen wie Kastrationen enthalten keine Narkose und keine Nachsorge; die Gesamtrechnung
        liegt daher höher als die einzelne GOT-Position.
      </p>
    </div>
  );
}
