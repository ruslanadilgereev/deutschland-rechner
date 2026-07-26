import { useMemo, useState } from 'react';
import { einkommensteuer2026, soli2026 } from '../../lib/einkommensteuer';

// Werkstudentenprivileg: ordentlich Studierende sind in KV, PV und AV
// versicherungsfrei (§ 6 Abs. 1 Nr. 3 SGB V, § 27 Abs. 4 SGB III);
// nur die Rentenversicherung fällt an (9,3 % AN-Anteil). Voraussetzung
// nach ständiger Praxis: max. 20 Wochenstunden in der Vorlesungszeit.
// Geringfügigkeitsgrenze 2026: Mindestlohn 13,90 € × 130 ÷ 3, auf volle
// Euro aufgerundet = 603 € (§ 8 Abs. 1a SGB IV).
const RV_AN = 0.093;
const MINIJOB_GRENZE = 603;
const MINIJOB_RV_AN = 0.036;
const MONATSFAKTOR = 52 / 12;
const ANP = 1230;
const SA_PAUSCH = 36;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function WerkstudentRechner() {
  const [lohn, setLohn] = useState(15);
  const [stunden, setStunden] = useState(19);

  const e = useMemo(() => {
    const brutto = Math.max(0, lohn || 0) * Math.max(0, stunden || 0) * MONATSFAKTOR;
    const istMinijob = brutto <= MINIJOB_GRENZE;
    const rv = brutto * (istMinijob ? MINIJOB_RV_AN : RV_AN);
    const zvE = Math.max(0, brutto * 12 - ANP - SA_PAUSCH - rv * 12);
    const est = istMinijob ? 0 : einkommensteuer2026(zvE);
    const steuerM = (est + soli2026(est)) / 12;
    return {
      brutto: Math.round(brutto * 100) / 100,
      istMinijob,
      rv: Math.round(rv * 100) / 100,
      steuerM: Math.round(steuerM * 100) / 100,
      netto: Math.round((brutto - rv - steuerM) * 100) / 100,
      ueber20: (stunden || 0) > 20,
    };
  }, [lohn, stunden]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stundenlohn (brutto)</label>
          <div className="relative">
            <input type="number" min={0} step={0.5} value={lohn}
              onChange={(ev) => setLohn(Number(ev.target.value))}
              className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Mindestlohn 2026: 13,90 €</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wochenstunden</label>
          <input type="number" min={1} max={40} step={1} value={stunden}
            onChange={(ev) => setStunden(Number(ev.target.value))}
            className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none" />
          <p className="text-xs text-gray-500 mt-1">Vorlesungszeit: höchstens 20 Stunden</p>
        </div>
      </div>

      {e.ueber20 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 mb-4">
          <strong>Mehr als 20 Wochenstunden:</strong> In der Vorlesungszeit entfällt damit in der
          Regel das Werkstudentenprivileg, der Job wird voll sozialversicherungspflichtig.
          Ausnahmen gelten für Semesterferien sowie Abend- und Wochenendarbeit (befristet).
        </div>
      )}

      <div className="bg-teal-50 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Brutto-Monatslohn ({(Math.max(0, stunden || 0) * MONATSFAKTOR).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Std.)</span>
          <span className="font-medium">{formatEuro(e.brutto)}</span>
        </div>
        {e.istMinijob ? (
          <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-teal-100 pb-2">
            <span>Minijob (bis 603 €): RV-Eigenanteil 3,6 % (Befreiung möglich)</span>
            <span className="font-medium">−{formatEuro(e.rv)}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-sm text-gray-600 py-1">
              <span>Rentenversicherung (9,3 % Arbeitnehmeranteil)</span>
              <span className="font-medium">−{formatEuro(e.rv)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-teal-100 pb-2">
              <span>Lohnsteuer (Näherung Steuerklasse I)</span>
              <span className="font-medium">−{formatEuro(e.steuerM)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Netto im Monat</span>
          <span className="text-2xl font-bold text-teal-700">{formatEuro(e.netto)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Als Werkstudent fallen keine Beiträge zur Kranken-, Pflege- und Arbeitslosenversicherung an
        (§ 6 Abs. 1 Nr. 3 SGB V, § 27 Abs. 4 SGB III); versichert bleiben Sie über die studentische
        oder Familien-Krankenversicherung (eigener Beitrag ggf. separat). Steuer: Jahresnäherung
        Steuerklasse I; bis rund 1.200 € Monatslohn fällt wegen des Grundfreibetrags meist keine
        Lohnsteuer an, zu viel Einbehaltenes holt die Steuererklärung zurück.
      </p>
    </div>
  );
}
