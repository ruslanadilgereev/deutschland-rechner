import { useMemo, useState } from 'react';
import { einkommensteuer2026, soli2026 } from '../../lib/einkommensteuer';
import vfb from '../../data/versorgungsfreibetrag.json';
import kv from '../../data/freiwillige-kv.json';

// Netto-Pension: Brutto-Versorgungsbezug abzüglich Einkommensteuer
// (Versorgungsfreibetrag + Zuschlag nach § 19 Abs. 2 EStG, 102 € Werbungs-
// kosten-Pauschbetrag, 36 € Sonderausgaben-Pauschbetrag, Basis-KV/PV als
// Vorsorgeaufwand) und Kranken-/Pflegeversicherung. Jahresrechnung, /12.
const KOHORTEN = vfb.kohorten as Record<string, { prozent: number; hoechstbetrag: number; zuschlag: number }>;
const JAHRE = Object.keys(KOHORTEN).sort();
const WK_PAUSCHBETRAG = 102;
const SA_PAUSCHBETRAG = 36;

function formatEuro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function PensionNettoRechner() {
  const [brutto, setBrutto] = useState(3500);
  const [beginn, setBeginn] = useState('2026');
  const [pkv, setPkv] = useState(false);
  const [pkvPraemie, setPkvPraemie] = useState(300);
  const [zusatz, setZusatz] = useState(kv.kv.zusatzbeitragDurchschnitt * 100);
  const [kinderlos, setKinderlos] = useState(false);
  const [kirchensteuer, setKirchensteuer] = useState(0);

  const e = useMemo(() => {
    const m = Math.max(0, brutto || 0);
    const jahr = m * 12;
    const k = KOHORTEN[beginn];
    const freibetrag = Math.min(jahr * k.prozent / 100, k.hoechstbetrag) + k.zuschlag;

    let kvMonat = 0, pvMonat = 0, vorsorgeJahr = 0;
    if (pkv) {
      vorsorgeJahr = Math.max(0, pkvPraemie || 0) * 12;
    } else {
      const bemessung = Math.min(m, kv.bbgKvMonat);
      kvMonat = Math.round(bemessung * (kv.kv.allgemein + Math.max(0, zusatz) / 100) * 100) / 100;
      pvMonat = Math.round(bemessung * (kv.pv.satz + (kinderlos ? kv.pv.kinderlosZuschlag : 0)) * 100) / 100;
      vorsorgeJahr = (kvMonat + pvMonat) * 12;
    }

    const zvE = Math.max(0, jahr - freibetrag - WK_PAUSCHBETRAG - SA_PAUSCHBETRAG - vorsorgeJahr);
    const est = einkommensteuer2026(zvE);
    const soli = soli2026(est);
    const kist = Math.round(est * kirchensteuer) / 100;
    const steuerMonat = Math.round((est + soli + kist) / 12 * 100) / 100;
    const abzuegeVersicherung = pkv ? Math.max(0, pkvPraemie || 0) : kvMonat + pvMonat;
    const netto = Math.round((m - steuerMonat - abzuegeVersicherung) * 100) / 100;

    return { jahr, freibetrag, zvE, est, soli, kist, steuerMonat, kvMonat, pvMonat, abzuegeVersicherung, netto };
  }, [brutto, beginn, pkv, pkvPraemie, zusatz, kinderlos, kirchensteuer]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brutto-Pension / Monat</label>
          <div className="relative">
            <input type="number" min={0} step={100} value={brutto}
              onChange={(ev) => setBrutto(Number(ev.target.value))}
              className="w-full text-xl font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-stone-500 outline-none" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ruhestandsbeginn (Jahr)</label>
          <select value={beginn} onChange={(ev) => setBeginn(ev.target.value)}
            className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl focus:border-stone-500 outline-none text-sm">
            {JAHRE.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-1">Bestimmt den Versorgungsfreibetrag</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kirchensteuer</label>
          <select value={kirchensteuer} onChange={(ev) => setKirchensteuer(Number(ev.target.value))}
            className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl focus:border-stone-500 outline-none text-sm">
            <option value={0}>keine</option>
            <option value={8}>8 % (BY, BW)</option>
            <option value={9}>9 % (übrige Länder)</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Krankenversicherung</label>
          <button onClick={() => setPkv(!pkv)}
            className={`w-full py-2 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
              pkv ? 'bg-stone-600 border-stone-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-stone-400'
            }`}>
            {pkv ? 'PKV + Beihilfe' : 'Freiwillig gesetzlich (GKV)'}
          </button>
        </div>
        {pkv ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PKV-Prämie / Monat</label>
            <div className="relative">
              <input type="number" min={0} step={10} value={pkvPraemie}
                onChange={(ev) => setPkvPraemie(Number(ev.target.value))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-stone-500 outline-none text-center" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zusatzbeitrag (%)</label>
              <input type="number" min={0} max={5} step={0.1} value={zusatz}
                onChange={(ev) => setZusatz(Number(ev.target.value))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-stone-500 outline-none text-center" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kinderlos (ab 23)?</label>
              <button onClick={() => setKinderlos(!kinderlos)}
                className={`w-full py-2 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                  kinderlos ? 'bg-stone-600 border-stone-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-stone-400'
                }`}>
                {kinderlos ? 'Ja (+0,6 % PV)' : 'Nein'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="bg-stone-100 rounded-xl p-5">
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Versorgungsfreibetrag + Zuschlag (Kohorte {beginn})</span>
          <span className="font-medium">{formatEuro(e.freibetrag)} / Jahr</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Zu versteuerndes Einkommen (nach Pauschbeträgen + Vorsorge)</span>
          <span className="font-medium">{formatEuro(e.zvE)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1">
          <span>Steuern/Monat (ESt {formatEuro(e.est)}{e.soli > 0 ? ' + Soli' : ''}{e.kist > 0 ? ' + KiSt' : ''} p.a.)</span>
          <span className="font-medium">−{formatEuro(e.steuerMonat)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-stone-200 pb-2">
          <span>{pkv ? 'PKV-Prämie' : `KV (${formatEuro(e.kvMonat)}) + PV (${formatEuro(e.pvMonat)})`}</span>
          <span className="font-medium">−{formatEuro(e.abzuegeVersicherung)}</span>
        </div>
        <div className="flex justify-between pt-2 items-center">
          <span className="font-semibold text-gray-800">Netto-Pension / Monat</span>
          <span className="text-2xl font-bold text-stone-800">{formatEuro(e.netto)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Jahressteuer-Näherung (Einzelveranlagung, keine weiteren Einkünfte, Basisbeiträge voll als
        Vorsorgeaufwand angesetzt); der Lohnsteuerabzug der Versorgungsstelle kann monatlich leicht
        abweichen. Bei PKV ist steuerlich nur der Basistarif-Anteil der Prämie abziehbar, hier
        vereinfachend voll angesetzt.
      </p>
    </div>
  );
}
