import { useMemo, useState } from 'react';
import { einkommensteuer2026, soli2026 } from '../../lib/einkommensteuer';
import kv from '../../data/freiwillige-kv.json';

// Netto-Stundenlohn (Näherung Steuerklasse I/IV): Brutto-Stundenlohn →
// Monatsbrutto (× Wochenstunden × 52/12) → Arbeitnehmer-SV-Anteile
// (RV 9,3 %, AV 1,3 %, KV 7,3 % + halber Zusatzbeitrag, PV 1,8 % ggf.
// + 0,6 % Kinderlos) → Jahres-ESt nach § 32a 2026 + Soli + KiSt.
const BBG_KV = kv.bbgKvMonat;      // 5.812,50 (SVBezGrV 2026)
const BBG_RV = 8450;               // RV/AV 2026 (Repo-konsistent, SVBezGrV 2026)
const ANP = 1230;                  // Arbeitnehmer-Pauschbetrag
const SA_PAUSCH = 36;
const MONATSFAKTOR = 52 / 12;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function netto(stundenlohn: number, wochenstunden: number, kinderlos: boolean, zusatz: number, kist: number) {
  const monatsbrutto = stundenlohn * wochenstunden * MONATSFAKTOR;
  const bemKv = Math.min(monatsbrutto, BBG_KV);
  const bemRv = Math.min(monatsbrutto, BBG_RV);
  const kvM = bemKv * (0.073 + zusatz / 200);
  const pvM = bemKv * (0.018 + (kinderlos ? 0.006 : 0));
  const rvM = bemRv * 0.093;
  const avM = bemRv * 0.013;
  const svM = kvM + pvM + rvM + avM;
  const zvE = Math.max(0, monatsbrutto * 12 - ANP - SA_PAUSCH - (kvM + pvM + rvM) * 12);
  const est = einkommensteuer2026(zvE);
  const steuerM = (est + soli2026(est) + est * kist / 100) / 12;
  const nettoM = monatsbrutto - svM - steuerM;
  return {
    monatsbrutto,
    svM,
    steuerM,
    nettoM,
    nettoStunde: nettoM / (wochenstunden * MONATSFAKTOR),
  };
}

const TABELLE = [13.90, 15, 18, 20, 25, 30];

export default function StundenlohnNettoRechner() {
  const [lohn, setLohn] = useState(20);
  const [stunden, setStunden] = useState(40);
  const [kinderlos, setKinderlos] = useState(false);
  const [zusatz, setZusatz] = useState(kv.kv.zusatzbeitragDurchschnitt * 100);
  const [kist, setKist] = useState(0);

  const e = useMemo(
    () => netto(Math.max(0, lohn || 0), Math.min(Math.max(1, stunden || 40), 60), kinderlos, Math.max(0, zusatz), kist),
    [lohn, stunden, kinderlos, zusatz, kist]
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brutto-Stundenlohn</label>
          <div className="relative">
            <input type="number" min={0} step={0.5} value={lohn}
              onChange={(ev) => setLohn(Number(ev.target.value))}
              className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-center font-bold" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wochenstunden</label>
          <input type="number" min={1} max={60} step={1} value={stunden}
            onChange={(ev) => setStunden(Number(ev.target.value))}
            className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-center font-bold" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zusatzbeitrag (%)</label>
          <input type="number" min={0} max={5} step={0.1} value={zusatz}
            onChange={(ev) => setZusatz(Number(ev.target.value))}
            className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-center" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kirchensteuer</label>
          <select value={kist} onChange={(ev) => setKist(Number(ev.target.value))}
            className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm">
            <option value={0}>keine</option>
            <option value={8}>8 %</option>
            <option value={9}>9 %</option>
          </select>
        </div>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-gray-700 mb-4">
        <input type="checkbox" checked={kinderlos} onChange={(ev) => setKinderlos(ev.target.checked)}
          className="w-4 h-4 rounded border-gray-300" />
        kinderlos und 23 Jahre oder älter (+0,6 % Pflegeversicherung)
      </label>

      <div className="bg-blue-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Brutto-Monatslohn ({(stunden * MONATSFAKTOR).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Std.)</span>
          <span className="font-medium">{formatEuro(e.monatsbrutto)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>− Sozialversicherung (AN-Anteil)</span>
          <span className="font-medium">{formatEuro(e.svM)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-blue-100 pb-2">
          <span>− Lohn-/Einkommensteuer inkl. Soli/KiSt (Näherung)</span>
          <span className="font-medium">{formatEuro(e.steuerM)}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Netto-Monatslohn</span>
          <span className="font-bold text-gray-800">{formatEuro(e.nettoM)}</span>
        </div>
        <div className="flex justify-between pt-1 items-center">
          <span className="font-semibold text-gray-800">Netto-Stundenlohn</span>
          <span className="text-2xl font-bold text-blue-700">{formatEuro(e.nettoStunde)}</span>
        </div>
      </div>

      <div className="overflow-x-auto mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="py-2 px-3 rounded-tl-lg">Brutto/Stunde</th>
              <th className="py-2 px-3 text-right">Netto/Stunde</th>
              <th className="py-2 px-3 text-right rounded-tr-lg">Netto/Monat</th>
            </tr>
          </thead>
          <tbody>
            {TABELLE.map((b) => {
              const r = netto(b, stunden, kinderlos, zusatz, kist);
              return (
                <tr key={b} className="border-b border-gray-100">
                  <td className="py-2 px-3">{formatEuro(b)}{b === 13.90 ? ' (Mindestlohn 2026)' : ''}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">{formatEuro(r.nettoStunde)}</td>
                  <td className="py-2 px-3 text-right font-mono">{formatEuro(r.nettoM)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Jahressteuer-Näherung für Steuerklasse I bzw. IV ohne Kinderfreibeträge und Freibeträge
        (Sozialversicherung: RV 9,3 %, AV 1,3 %, KV 7,3 % + halber Zusatzbeitrag, PV 1,8 %
        zzgl. ggf. Kinderlosenzuschlag; ohne Sachsen-Sonderregel). Den centgenauen Lohnsteuerabzug
        für alle Steuerklassen liefert der <a href="/brutto-netto-rechner" className="text-blue-600 underline">Brutto-Netto-Rechner</a>.
      </p>
    </div>
  );
}
