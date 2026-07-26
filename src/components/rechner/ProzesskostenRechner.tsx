import { useMemo, useState } from 'react';
import { streitwertGebuehr } from '../../lib/gkg';
import { anwaltskostenErsteInstanz } from '../../lib/rvg';

// Prozesskosten 1. Instanz im Zivilprozess:
// Gerichtskosten (3,0-Gebühr nach GKG; bei Vergleich ermäßigt auf 1,0, KV 1211)
// + Anwaltsvergütung nach RVG je Seite. Wer verliert, trägt alles (§ 91 ZPO);
// beim Vergleich gilt im Zweifel Kostenaufhebung (§ 98 ZPO).
const QUICK = [1000, 2500, 5000, 10000, 25000, 50000];

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function ProzesskostenRechner() {
  const [streitwert, setStreitwert] = useState(5000);

  const e = useMemo(() => {
    const w = Math.max(1, streitwert || 0);
    const gkWert = streitwertGebuehr(w);
    const gerichtUrteil = Math.round(gkWert * 300) / 100;
    const gerichtVergleich = gkWert;
    const anwaltUrteil = anwaltskostenErsteInstanz(w, false);
    const anwaltVergleich = anwaltskostenErsteInstanz(w, true);
    const risikoUrteil = Math.round((gerichtUrteil + 2 * anwaltUrteil.brutto) * 100) / 100;
    const eigenVergleich = Math.round((anwaltVergleich.brutto + gerichtVergleich / 2) * 100) / 100;
    return { gerichtUrteil, gerichtVergleich, anwaltUrteil, anwaltVergleich, risikoUrteil, eigenVergleich };
  }, [streitwert]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">Streitwert</label>
      <div className="relative mb-2">
        <input
          type="number"
          min={1}
          step={500}
          value={streitwert}
          onChange={(ev) => setStreitwert(Number(ev.target.value))}
          className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-slate-600 outline-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => setStreitwert(q)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              streitwert === q ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-slate-200'
            }`}
          >
            {q.toLocaleString('de-DE')} €
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-xl p-5">
          <h3 className="font-bold text-gray-800 mb-2">Streitig bis zum Urteil: Risiko bei Niederlage</h3>
          <div className="flex justify-between text-sm text-gray-600 py-1">
            <span>Gerichtskosten (3,0-Gebühr, GKG)</span>
            <span className="font-medium">{formatEuro(e.gerichtUrteil)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 py-1">
            <span>Eigener Anwalt (1,3 + 1,2, inkl. USt)</span>
            <span className="font-medium">{formatEuro(e.anwaltUrteil.brutto)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-slate-200 pb-2">
            <span>Gegnerischer Anwalt (zu erstatten, § 91 ZPO)</span>
            <span className="font-medium">{formatEuro(e.anwaltUrteil.brutto)}</span>
          </div>
          <div className="flex justify-between pt-2 items-center">
            <span className="font-semibold text-gray-800">Gesamtrisiko 1. Instanz</span>
            <span className="text-xl font-bold text-slate-800">{formatEuro(e.risikoUrteil)}</span>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-xl p-5">
          <h3 className="font-bold text-gray-800 mb-2">Gerichtlicher Vergleich: typische Eigenbelastung</h3>
          <div className="flex justify-between text-sm text-gray-600 py-1">
            <span>Eigener Anwalt (1,3 + 1,2 + 1,0 Einigung, inkl. USt)</span>
            <span className="font-medium">{formatEuro(e.anwaltVergleich.brutto)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-emerald-200 pb-2">
            <span>Hälfte der Gerichtskosten (ermäßigt auf 1,0)</span>
            <span className="font-medium">{formatEuro(Math.round(e.gerichtVergleich * 50) / 100)}</span>
          </div>
          <div className="flex justify-between pt-2 items-center">
            <span className="font-semibold text-gray-800">Eigene Kosten bei Kostenaufhebung</span>
            <span className="text-xl font-bold text-emerald-700">{formatEuro(e.eigenVergleich)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Aufschlüsselung eigener Anwalt (streitig): Verfahrensgebühr {formatEuro(e.anwaltUrteil.verfahrensgebuehr)} +
        Terminsgebühr {formatEuro(e.anwaltUrteil.terminsgebuehr)} + Auslagenpauschale {formatEuro(e.anwaltUrteil.auslagenpauschale)} +
        USt {formatEuro(e.anwaltUrteil.umsatzsteuer)}. Nicht enthalten: Gerichtsauslagen (z.B. Sachverständige),
        Reisekosten, außergerichtliche Vorarbeit. Gewinnen Sie, erstattet die Gegenseite Ihre notwendigen Kosten.
      </div>
    </div>
  );
}
