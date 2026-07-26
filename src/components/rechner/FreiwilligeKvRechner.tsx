import { useMemo, useState } from 'react';
import kv from '../../data/freiwillige-kv.json';

// Freiwillige GKV (v.a. Selbstständige): Beitrag = Bemessungsgrundlage ×
// (KV-Satz + Zusatzbeitrag + PV-Satz). Bemessungsgrundlage ist das gesamte
// Einkommen, mindestens Bezugsgröße/3 (§ 240 Abs. 4 SGB V), höchstens die
// Beitragsbemessungsgrenze. Freiwillig Versicherte tragen den Beitrag allein.
const MIN_BEMESSUNG = Math.round(kv.bezugsgroesseMonat / 90 * 30 * 100) / 100; // 1.318,33
const MAX_BEMESSUNG = kv.bbgKvMonat;

const KINDER_OPTIONEN = [
  { label: 'Kinderlos (23 Jahre oder älter)', pv: kv.pv.satz + kv.pv.kinderlosZuschlag },
  { label: '1 Kind', pv: kv.pv.satz },
  { label: '2 Kinder (unter 25)', pv: kv.pv.satz - 1 * kv.pv.abschlagJeKindAbZweitem },
  { label: '3 Kinder (unter 25)', pv: kv.pv.satz - 2 * kv.pv.abschlagJeKindAbZweitem },
  { label: '4 Kinder (unter 25)', pv: kv.pv.satz - 3 * kv.pv.abschlagJeKindAbZweitem },
  { label: '5 oder mehr Kinder (unter 25)', pv: kv.pv.satz - 4 * kv.pv.abschlagJeKindAbZweitem },
];

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
function formatProzent(n: number) {
  return (n * 100).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' %';
}

export default function FreiwilligeKvRechner() {
  const [einkommen, setEinkommen] = useState(3000);
  const [mitKrankengeld, setMitKrankengeld] = useState(false);
  const [zusatzProzent, setZusatzProzent] = useState(kv.kv.zusatzbeitragDurchschnitt * 100);
  const [kinderIdx, setKinderIdx] = useState(0);

  const e = useMemo(() => {
    const roh = Math.max(0, einkommen || 0);
    const bemessung = Math.min(Math.max(roh, MIN_BEMESSUNG), MAX_BEMESSUNG);
    const kvSatz = (mitKrankengeld ? kv.kv.allgemein : kv.kv.ermaessigt) + Math.max(0, zusatzProzent) / 100;
    const pvSatz = KINDER_OPTIONEN[kinderIdx].pv;
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const kvBeitrag = r2(bemessung * kvSatz);
    const pvBeitrag = r2(bemessung * pvSatz);
    return {
      bemessung,
      kvSatz,
      pvSatz,
      kvBeitrag,
      pvBeitrag,
      gesamt: r2(kvBeitrag + pvBeitrag),
      mindestGreift: roh < MIN_BEMESSUNG,
      gedeckelt: roh > MAX_BEMESSUNG,
    };
  }, [einkommen, mitKrankengeld, zusatzProzent, kinderIdx]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monatliche Einnahmen (gesamt, vor Steuern)</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={100}
              value={einkommen}
              onChange={(ev) => setEinkommen(Number(ev.target.value))}
              className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-lime-600 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Zählt alles: Gewinn, Mieten, Kapitalerträge, Renten (§ 240 SGB V)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Krankengeld-Anspruch?</label>
          <button
            onClick={() => setMitKrankengeld(!mitKrankengeld)}
            className={`w-full py-2 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
              mitKrankengeld ? 'bg-lime-600 border-lime-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-lime-400'
            }`}
          >
            {mitKrankengeld ? 'Ja: mit Krankengeld (14,6 %)' : 'Nein: ohne Krankengeld (14,0 %)'}
          </button>
          <p className="text-xs text-gray-500 mt-1">Selbstständige ohne Wahlerklärung: ermäßigter Satz</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zusatzbeitrag Ihrer Kasse (%)</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={zusatzProzent}
            onChange={(ev) => setZusatzProzent(Number(ev.target.value))}
            className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-lime-600 outline-none text-center"
          />
          <p className="text-xs text-gray-500 mt-1">Voreingestellt: Durchschnitt 2026 (2,9 %)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kinder (Pflegeversicherung, § 55 SGB XI)</label>
          <select
            value={kinderIdx}
            onChange={(ev) => setKinderIdx(Number(ev.target.value))}
            className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl focus:border-lime-600 outline-none text-sm"
          >
            {KINDER_OPTIONEN.map((o, i) => (
              <option key={i} value={i}>{o.label} ({formatProzent(o.pv)})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-lime-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Beitragspflichtige Einnahmen (Bemessungsgrundlage)</span>
          <span className="font-medium">{formatEuro(e.bemessung)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Krankenversicherung ({formatProzent(e.kvSatz)})</span>
          <span className="font-medium">{formatEuro(e.kvBeitrag)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-lime-100 pb-2">
          <span>Pflegeversicherung ({formatProzent(e.pvSatz)})</span>
          <span className="font-medium">{formatEuro(e.pvBeitrag)}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Monatsbeitrag gesamt</span>
          <span className="text-2xl font-bold text-lime-700">{formatEuro(e.gesamt)}</span>
        </div>
      </div>

      {e.mindestGreift && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mt-4">
          <strong>Mindestbemessung greift:</strong> Auch bei geringeren oder keinen Einnahmen rechnet
          die Kasse mindestens mit {formatEuro(MIN_BEMESSUNG)} (ein Drittel der monatlichen
          Bezugsgröße 2026, § 240 Abs. 4 SGB V). Ein niedrigerer Beitrag ist nur über
          Familienversicherung oder Bürgergeld-Bezug möglich.
        </div>
      )}
      {e.gedeckelt && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 mt-4">
          Einnahmen über der Beitragsbemessungsgrenze ({formatEuro(MAX_BEMESSUNG)}) bleiben
          beitragsfrei; Sie zahlen den Höchstbeitrag.
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        Freiwillig Versicherte tragen den Beitrag allein (kein Arbeitgeberanteil).
        Hauptberuflich Selbstständige: Beiträge werden zunächst nach dem letzten
        Einkommensteuerbescheid festgesetzt und nachträglich spitz abgerechnet.
      </p>
    </div>
  );
}
