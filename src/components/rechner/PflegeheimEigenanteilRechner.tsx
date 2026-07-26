import { useMemo, useState } from 'react';
import ph from '../../data/pflegeheim.json';

// Pflegeheim-Eigenanteil: pflegebedingte Kosten − Pflegekassen-Betrag (§ 43
// SGB XI) = einrichtungseinheitlicher Eigenanteil (EEE); darauf gibt es nach
// Wohndauer den Leistungszuschlag (§ 43c: 15/30/50/75 %). Unterkunft &
// Verpflegung, Investitionskosten und Ausbildungsumlage kommen ungekürzt dazu.
const LEISTUNG = ph.leistungVollstationaer as Record<string, number>;
const ZUSCHLAEGE = ph.zuschlaege;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function PflegeheimEigenanteilRechner() {
  const [grad, setGrad] = useState(3);
  const [pflege, setPflege] = useState(2800);
  const [uv, setUv] = useState(1000);
  const [invest, setInvest] = useState(500);
  const [dauerIdx, setDauerIdx] = useState(0);

  const e = useMemo(() => {
    const kasse = LEISTUNG[String(grad)] ?? 0;
    const pfl = Math.max(0, pflege || 0);
    const eee = Math.max(0, pfl - kasse);
    const zuschlagSatz = grad >= 2 ? ZUSCHLAEGE[dauerIdx].satz : 0;
    const zuschlag = Math.round(eee * zuschlagSatz * 100) / 100;
    const eeeRest = Math.round((eee - zuschlag) * 100) / 100;
    const gesamt = Math.round((eeeRest + Math.max(0, uv || 0) + Math.max(0, invest || 0)) * 100) / 100;
    return { kasse, eee: Math.round(eee * 100) / 100, zuschlagSatz, zuschlag, eeeRest, gesamt };
  }, [grad, pflege, uv, invest, dauerIdx]);

  const feld = (label: string, value: number, set: (n: number) => void, hint?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input type="number" min={0} step={50} value={value}
          onChange={(ev) => set(Number(ev.target.value))}
          className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-emerald-600 outline-none text-center font-bold" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
      </div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pflegegrad</label>
          <select value={grad} onChange={(ev) => setGrad(Number(ev.target.value))}
            className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl focus:border-emerald-600 outline-none text-sm">
            {[1, 2, 3, 4, 5].map((g) => (
              <option key={g} value={g}>Pflegegrad {g} (Kasse: {formatEuro(LEISTUNG[String(g)])}{g === 1 ? ' Zuschuss' : ''})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wohndauer im Heim (§ 43c-Zuschlag)</label>
          <select value={dauerIdx} onChange={(ev) => setDauerIdx(Number(ev.target.value))}
            disabled={grad < 2}
            className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl focus:border-emerald-600 outline-none text-sm disabled:bg-gray-100 disabled:text-gray-400">
            {ZUSCHLAEGE.map((z, i) => (
              <option key={i} value={i}>{z.label} ({Math.round(z.satz * 100)} % Zuschlag)</option>
            ))}
          </select>
          {grad < 2 && <p className="text-xs text-gray-500 mt-1">Zuschlag gibt es nur für Pflegegrade 2-5</p>}
        </div>
      </div>

      <p className="text-sm font-medium text-gray-700 mb-2">Monatliche Entgeltbausteine laut Heimvertrag</p>
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        {feld('Pflegebedingte Kosten', pflege, setPflege, 'inkl. Betreuung und Behandlungspflege')}
        {feld('Unterkunft + Verpflegung', uv, setUv)}
        {feld('Investitionskosten u.ä.', invest, setInvest, 'inkl. Ausbildungsumlage')}
      </div>

      <div className="bg-emerald-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Pflegebedingte Kosten − Pflegekasse ({formatEuro(e.kasse)})</span>
          <span className="font-medium">{formatEuro(e.eee)} Eigenanteil (EEE)</span>
        </div>
        {grad >= 2 && (
          <div className="flex justify-between text-sm text-gray-600 py-1">
            <span>− Leistungszuschlag ({Math.round(e.zuschlagSatz * 100)} % nach § 43c)</span>
            <span className="font-medium">−{formatEuro(e.zuschlag)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-emerald-100 pb-2">
          <span>+ Unterkunft/Verpflegung + Investitionskosten</span>
          <span className="font-medium">{formatEuro(Math.max(0, uv || 0) + Math.max(0, invest || 0))}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Ihr Eigenanteil pro Monat</span>
          <span className="text-2xl font-bold text-emerald-700">{formatEuro(e.gesamt)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Die Entgeltbausteine stehen im Heimvertrag bzw. der monatlichen Rechnung; sie unterscheiden
        sich stark nach Einrichtung und Bundesland, deshalb rechnet dieser Rechner mit Ihren echten
        Beträgen statt mit Durchschnittswerten. Der Leistungszuschlag steigt automatisch mit der
        Wohndauer, die Pflegekasse berücksichtigt dabei auch angebrochene Monate.
      </p>
    </div>
  );
}
