import { useMemo, useState } from 'react';
import gv from '../../data/gv-kosten.json';

// Gerichtsvollzieherkosten nach GvKostG (Anlage zu § 9, Kostenverzeichnis):
// Gebühr der Amtshandlung + Auslagenpauschale Nr. 716 (20 % der Gebühren,
// mind. 3 €, max. 10 €) + Wegegeld Nr. 711 (Stufen nach Luftlinien-Entfernung).
const HANDLUNGEN = gv.amtshandlungen;
const PAUSCHALE = gv.auslagenpauschale;
const WEGEGELD = gv.wegegeld;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function GerichtsvollzieherRechner() {
  const [handlungIdx, setHandlungIdx] = useState(2); // Default: Vermögensauskunft
  const [wegegeldIdx, setWegegeldIdx] = useState(1); // Default: Stufe 1 (bis 10 km)

  const ergebnis = useMemo(() => {
    const handlung = HANDLUNGEN[handlungIdx];
    const gebuehr = handlung.gebuehr;
    const pauschale = Math.min(Math.max(gebuehr * PAUSCHALE.satz, PAUSCHALE.min), PAUSCHALE.max);
    // wegegeldIdx 0 = ohne Wegegeld (z.B. Zustellung per Post, Nr. 102)
    const wegegeld = wegegeldIdx === 0 ? 0 : WEGEGELD[wegegeldIdx - 1].betrag;
    return { handlung, gebuehr, pauschale, wegegeld, summe: gebuehr + pauschale + wegegeld };
  }, [handlungIdx, wegegeldIdx]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amtshandlung</label>
          <select
            value={handlungIdx}
            onChange={(e) => setHandlungIdx(Number(e.target.value))}
            className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm"
          >
            {HANDLUNGEN.map((h, i) => (
              <option key={h.kvNr} value={i}>{h.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Anfahrt (Luftlinie, für Wegegeld)</label>
          <select
            value={wegegeldIdx}
            onChange={(e) => setWegegeldIdx(Number(e.target.value))}
            className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 outline-none text-sm"
          >
            <option value={0}>Ohne Wegegeld (z.B. Zustellung per Post)</option>
            <option value={1}>bis 10 km</option>
            <option value={2}>über 10 bis 20 km</option>
            <option value={3}>über 20 bis 30 km</option>
            <option value={4}>über 30 bis 40 km</option>
            <option value={5}>über 40 km</option>
          </select>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Gebühr Nr. {ergebnis.handlung.kvNr} KV GvKostG</span>
          <span className="font-medium">{formatEuro(ergebnis.gebuehr)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>+ Auslagenpauschale (Nr. 716: 20 %, mind. 3 €, max. 10 €)</span>
          <span className="font-medium">{formatEuro(ergebnis.pauschale)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-emerald-100 pb-2">
          <span>+ Wegegeld (Nr. 711)</span>
          <span className="font-medium">{formatEuro(ergebnis.wegegeld)}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Kosten der Amtshandlung</span>
          <span className="text-2xl font-bold text-emerald-700">{formatEuro(ergebnis.summe)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Zusätzlich können im Einzelfall weitere Positionen anfallen, z.B. ein Zeitzuschlag bei
        ungewöhnlich langen Amtshandlungen (Nr. 500 KV) oder Dokumentenpauschalen. Bei einem
        kombinierten Vollstreckungsauftrag fallen die Gebühren mehrerer Amtshandlungen nebeneinander an.
      </p>
    </div>
  );
}
