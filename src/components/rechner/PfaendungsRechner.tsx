import { useMemo, useState } from 'react';
import pf from '../../data/pfaendung-2026.json';

// Datenbasis: Pfändungsfreigrenzenbekanntmachung 2026 (BGBl. 2026 I Nr. 80), § 850c ZPO,
// gültig ab 01.07.2026. Formel nach § 850c Abs. 1-3; die amtlichen Tabellen arbeiten in
// 10-Euro-Stufen, daher können Tabellenwerte um wenige Euro abweichen.
const M = pf.monatlich;
const ANTEILE = pf.pfaendbarerAnteilVomMehrbetrag as Record<string, number>;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function PfaendungsRechner() {
  const [netto, setNetto] = useState(2500);
  const [unterhalt, setUnterhalt] = useState(0);

  const ergebnis = useMemo(() => {
    const personen = Math.min(Math.max(unterhalt, 0), 5);
    const freibetrag = M.grundbetrag
      + (personen >= 1 ? M.erhoehungErstePerson : 0)
      + Math.max(0, personen - 1) * M.erhoehungWeiterePerson;
    const anteil = ANTEILE[String(personen)];
    let pfaendbar = 0;
    if (netto > freibetrag) {
      const bisObergrenze = Math.min(netto, M.obergrenzeVollPfaendbar);
      pfaendbar = (bisObergrenze - freibetrag) * anteil;
      if (netto > M.obergrenzeVollPfaendbar) {
        pfaendbar += netto - M.obergrenzeVollPfaendbar;
      }
    }
    pfaendbar = Math.max(0, Math.round(pfaendbar * 100) / 100);
    return { freibetrag, pfaendbar, bleibt: netto - pfaendbar, personen };
  }, [netto, unterhalt]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Netto-Einkommen pro Monat</label>
          <input type="number" min="0" step="50" value={netto}
            onChange={(e) => setNetto(Math.max(0, Number(e.target.value)))}
            className="w-full text-xl font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none" />
          <input type="range" min="500" max="6000" step="50" value={Math.min(netto, 6000)}
            onChange={(e) => setNetto(Number(e.target.value))} className="w-full mt-2 accent-red-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unterhaltspflichtige Personen</label>
          <select value={unterhalt} onChange={(e) => setUnterhalt(Number(e.target.value))}
            className="w-full text-xl text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none">
            {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 5 ? "5 oder mehr" : n}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-2">Ehe-/Lebenspartner und Kinder, denen Sie gesetzlich Unterhalt leisten.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500">Ihr Pfändungsfreibetrag</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{formatEuro(ergebnis.freibetrag)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500">Pfändbar pro Monat</p>
          <p className="text-xl font-bold text-red-600 mt-1">{formatEuro(ergebnis.pfaendbar)}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500">Bleibt Ihnen</p>
          <p className="text-xl font-bold text-green-700 mt-1">{formatEuro(ergebnis.bleibt)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Berechnung nach § 850c ZPO mit den Werten ab 01.07.2026: Grundfreibetrag {formatEuro(M.grundbetrag)},
        +{formatEuro(M.erhoehungErstePerson)} für die erste und +{formatEuro(M.erhoehungWeiterePerson)} für jede
        weitere unterhaltsberechtigte Person (max. 5). Vom Mehrbetrag sind bei {ergebnis.personen} Unterhaltspflichten
        {' '}{Math.round(ANTEILE[String(ergebnis.personen)] * 100)} % pfändbar; Einkommen über {formatEuro(M.obergrenzeVollPfaendbar)}
        {' '}ist voll pfändbar. Die amtliche Tabelle rechnet in 10-€-Stufen – Ihr exakter Tabellenwert kann daher
        minimal abweichen. Quelle: {pf.meta.quelle}.
      </p>
    </div>
  );
}
