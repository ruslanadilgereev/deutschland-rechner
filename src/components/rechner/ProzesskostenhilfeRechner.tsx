import { useMemo, useState } from 'react';
import pkh from '../../data/pkh-freibetraege.json';

// PKH-Prüfung nach § 115 ZPO: einzusetzendes Einkommen (eE) =
// Nettoeinkommen − Freibeträge (PKHB 2026) − Wohnkosten.
// Monatsrate = eE/2 (abgerundet); unter 10 € ratenfrei; über 600 € eE:
// 300 € + voller Überschuss; höchstens 48 Monatsraten.
const F = pkh.freibetraege;
const R = pkh.raten;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function ProzesskostenhilfeRechner() {
  const [netto, setNetto] = useState(1900);
  const [erwerb, setErwerb] = useState(true);
  const [partner, setPartner] = useState(false);
  const [k06, setK06] = useState(0);
  const [k714, setK714] = useState(0);
  const [k1518, setK1518] = useState(0);
  const [kErw, setKErw] = useState(0);
  const [miete, setMiete] = useState(450);

  const e = useMemo(() => {
    const einkommen = Math.max(0, netto || 0);
    const abzuege =
      F.partei +
      (erwerb ? F.erwerbstaetigkeit : 0) +
      (partner ? F.ehegatte : 0) +
      Math.max(0, k06) * F.unterhaltBis6 +
      Math.max(0, k714) * F.unterhalt7bis14 +
      Math.max(0, k1518) * F.unterhalt15bis18 +
      Math.max(0, kErw) * F.unterhaltErwachsen +
      Math.max(0, miete || 0);
    const eE = Math.max(0, einkommen - abzuege);
    let rate = Math.floor(eE / 2);
    if (eE > R.knick) rate = R.rateAbKnick + (eE - R.knick);
    if (rate < R.grenzeKeineRate) rate = 0;
    return { abzuege, eE, rate, maxGesamt: rate * R.maxRaten };
  }, [netto, erwerb, partner, k06, k714, k1518, kErw, miete]);

  const zaehler = (label: string, value: number, set: (n: number) => void) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select value={value} onChange={(ev) => set(Number(ev.target.value))}
        className="w-full py-2 px-2 border-2 border-gray-200 rounded-xl focus:border-fuchsia-500 outline-none text-sm text-center">
        {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monatliches Nettoeinkommen</label>
          <div className="relative">
            <input type="number" min={0} step={50} value={netto}
              onChange={(ev) => setNetto(Number(ev.target.value))}
              className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-fuchsia-500 outline-none text-center font-bold" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Alle Einkünfte inkl. Kindergeld, Renten, Unterhalt</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Warmmiete / Wohnkosten</label>
          <div className="relative">
            <input type="number" min={0} step={25} value={miete}
              onChange={(ev) => setMiete(Number(ev.target.value))}
              className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-fuchsia-500 outline-none text-center font-bold" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-end">
          <button onClick={() => setErwerb(!erwerb)}
            className={`py-2 px-3 rounded-xl text-xs font-medium border-2 transition-colors ${
              erwerb ? 'bg-fuchsia-600 border-fuchsia-600 text-white' : 'bg-white border-gray-200 text-gray-600'
            }`}>
            {erwerb ? '✓ erwerbstätig (+282 € Freibetrag)' : 'nicht erwerbstätig'}
          </button>
          <button onClick={() => setPartner(!partner)}
            className={`py-2 px-3 rounded-xl text-xs font-medium border-2 transition-colors ${
              partner ? 'bg-fuchsia-600 border-fuchsia-600 text-white' : 'bg-white border-gray-200 text-gray-600'
            }`}>
            {partner ? '✓ Ehe-/Lebenspartner (+619 €)' : 'ohne Partner'}
          </button>
        </div>
      </div>

      <p className="text-sm font-medium text-gray-700 mb-2">Unterhaltsberechtigte Kinder / Personen im Haushalt</p>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {zaehler('bis 6 J. (393 €)', k06, setK06)}
        {zaehler('7-14 J. (429 €)', k714, setK714)}
        {zaehler('15-18 J. (518 €)', k1518, setK1518)}
        {zaehler('erwachsen (496 €)', kErw, setKErw)}
      </div>

      <div className="bg-fuchsia-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Freibeträge + Wohnkosten gesamt</span>
          <span className="font-medium">−{formatEuro(e.abzuege)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-fuchsia-100 pb-2">
          <span>Einzusetzendes Einkommen (§ 115 ZPO)</span>
          <span className="font-medium">{formatEuro(e.eE)}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">
            {e.rate === 0 ? 'Voraussichtlich ratenfreie PKH' : 'Voraussichtliche Monatsrate'}
          </span>
          <span className={`text-2xl font-bold ${e.rate === 0 ? 'text-green-700' : 'text-fuchsia-700'}`}>
            {e.rate === 0 ? '0 €' : formatEuro(e.rate)}
          </span>
        </div>
        {e.rate > 0 && (
          <p className="text-sm text-gray-600 text-right mt-1">
            höchstens 48 Raten = maximal {formatEuro(e.maxGesamt)} (nie mehr als die tatsächlichen Kosten)
          </p>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Überschlagsrechnung mit den Bundes-Freibeträgen der PKHB 2026; in München und Umgebung gelten
        leicht höhere Beträge. Eigenes Einkommen von Unterhaltsberechtigten mindert deren Freibetrag;
        zumutbares Vermögen ist zusätzlich einzusetzen (§ 115 Abs. 3 ZPO). Maßgeblich ist die
        Entscheidung des Gerichts.
      </p>
    </div>
  );
}
