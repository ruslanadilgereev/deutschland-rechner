import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// KfW-Förderrechner (Stand 2026). Drei Programme mit eigener Logik:
//  - KfW 300 "Wohneigentum für Familien" (Neubau): Kredithöhe nach Kinderzahl/QNG,
//    Einkommensgrenze, zinsverbilligt, kein Tilgungszuschuss.
//  - KfW 297/298 "Klimafreundlicher Neubau": Kredit je WE nach Stufe, zinsverbilligt.
//  - KfW 261 "BEG Sanierung": Kredit + gestaffelter Tilgungszuschuss.
// Quelle: kfw.de (Programmseiten + Merkblätter), Stand 03/2026.

type Programm = '300' | '297' | '261';

// Tilgungszuschuss-Staffel KfW 261 nach Effizienzhaus-Stufe.
type EHStufe = { label: string; tz: number };
const EH_STUFEN: EHStufe[] = [
  { label: 'Effizienzhaus 85', tz: 5 },
  { label: 'Effizienzhaus 70', tz: 10 },
  { label: 'Effizienzhaus 55', tz: 15 },
  { label: 'Effizienzhaus 40', tz: 20 },
  { label: 'Denkmal / EH Denkmal', tz: 5 },
];

export function KfwFoerderungHausbauRechner() {
  const [programm, setProgramm] = useState<Programm>('300');
  const [kosten, setKosten] = useState(400000);
  const [kinder, setKinder] = useState(2);
  const [mitQng, setMitQng] = useState(false);
  const [laufzeit, setLaufzeit] = useState(10);
  const [marktzins, setMarktzins] = useState(3.5);
  // KfW 297/298
  const [neubauStufe, setNeubauStufe] = useState<'kfwg' | 'qng'>('kfwg');
  // KfW 261
  const [ehIndex, setEhIndex] = useState(2); // EH55
  const [eeBonus, setEeBonus] = useState(false);
  const [wpbBonus, setWpbBonus] = useState(false);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Programmzins (vorbelegt, je Stufe).
  let programmzins = 1.12;
  if (programm === '297') programmzins = neubauStufe === 'qng' ? 0.6 : 1.0;
  if (programm === '261') programmzins = 2.5;

  // Maximaler Förderkredit je Programm.
  let maxKredit = 0;
  if (programm === '300') {
    const basis = mitQng ? 220000 : 170000;
    maxKredit = Math.min(270000, basis + 5000 * Math.max(0, kinder));
  } else if (programm === '297') {
    maxKredit = neubauStufe === 'qng' ? 150000 : 100000;
  } else {
    maxKredit = 150000;
  }

  const effektiverKredit = Math.min(kosten, maxKredit);

  // Annuität (Monatsrate) per Standardformel.
  const annuitaet = (K: number, zinsPa: number, jahre: number) => {
    const i = zinsPa / 100 / 12;
    const N = jahre * 12;
    if (K <= 0 || N <= 0) return 0;
    if (i === 0) return K / N;
    const q = Math.pow(1 + i, N);
    return (K * (q * i)) / (q - 1);
  };

  const rateKfw = annuitaet(effektiverKredit, programmzins, laufzeit);
  const rateBank = annuitaet(effektiverKredit, marktzins, laufzeit);
  const zinsersparnis = Math.max(0, (rateBank - rateKfw) * laufzeit * 12);

  // Tilgungszuschuss nur bei KfW 261.
  let tzProzent = 0;
  if (programm === '261') {
    tzProzent = EH_STUFEN[ehIndex].tz;
    if (eeBonus) tzProzent += 5; // EE/NH-Klasse
    if (wpbBonus) tzProzent += 10; // Worst Performing Building
  }
  const tilgungszuschuss =
    programm === '261' ? (tzProzent / 100) * effektiverKredit : 0;

  const gesamtvorteil = zinsersparnis + tilgungszuschuss;

  // Einkommensgrenze KfW 300.
  const einkommensgrenze = 90000 + 10000 * Math.max(0, kinder - 1);

  const formatEuro = (v: number) => Math.round(v).toLocaleString('de-DE');
  const formatRate = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const programmName =
    programm === '300'
      ? 'KfW 300 – Wohneigentum für Familien'
      : programm === '297'
        ? 'KfW 297/298 – Klimafreundlicher Neubau'
        : 'KfW 261 – BEG Sanierung';

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="KfW-Förderung-Rechner" rechnerSlug="kfw-foerderung-hausbau-rechner" />

      {/* Programmauswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">KfW-Programm</span>
        <div className="grid grid-cols-1 gap-2">
          {([
            ['300', 'KfW 300 · Familien-Neubau'],
            ['297', 'KfW 297/298 · Klimafreundl. Neubau'],
            ['261', 'KfW 261 · BEG-Sanierung'],
          ] as [Programm, string][]).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setProgramm(p)}
              className={`p-3 rounded-xl border text-sm font-medium text-left transition-all active:scale-95 ${
                programm === p
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Förderfähige Kosten / Investitionssumme</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={kosten}
              onChange={(e) => setKosten(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        {/* KfW 300 Felder */}
        {programm === '300' && (
          <>
            <label className="block">
              <span className="text-gray-700 font-medium">Anzahl Kinder im Haushalt (unter 18)</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={kinder}
                onChange={(e) => setKinder(toNumber(e.target.value))}
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                Einkommensgrenze (zvE, Ø 2 Jahre): {formatEuro(einkommensgrenze)} €. Mind. 1 Kind nötig.
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mitQng}
                onChange={(e) => setMitQng(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium text-sm">
                mit QNG-Siegel (höherer Förderkredit)
              </span>
            </label>
          </>
        )}

        {/* KfW 297 Felder */}
        {programm === '297' && (
          <div>
            <span className="text-gray-700 font-medium block mb-2">Effizienzstufe</span>
            <div className="flex rounded-xl border border-gray-300 overflow-hidden">
              <button
                onClick={() => setNeubauStufe('kfwg')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  neubauStufe === 'kfwg' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                }`}
              >
                KFWG / EH55 (100.000 €)
              </button>
              <button
                onClick={() => setNeubauStufe('qng')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  neubauStufe === 'qng' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                }`}
              >
                mit QNG / EH40 (150.000 €)
              </button>
            </div>
          </div>
        )}

        {/* KfW 261 Felder */}
        {programm === '261' && (
          <>
            <label className="block">
              <span className="text-gray-700 font-medium">Effizienzhaus-Stufe (Sanierung)</span>
              <select
                value={ehIndex}
                onChange={(e) => setEhIndex(Number(e.target.value))}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-xl text-base bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {EH_STUFEN.map((s, i) => (
                  <option key={s.label} value={i}>
                    {s.label} ({s.tz} % Tilgungszuschuss)
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={eeBonus}
                onChange={(e) => setEeBonus(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium text-sm">EE-/NH-Klasse (+5 %-Pkt.)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wpbBonus}
                onChange={(e) => setWpbBonus(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium text-sm">
                Worst Performing Building (+10 %-Pkt.)
              </span>
            </label>
          </>
        )}

        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
          <label className="block">
            <span className="text-xs text-gray-500">Laufzeit / Zinsbindung (Jahre)</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={laufzeit}
              onChange={(e) => setLaufzeit(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Vergleichs-Marktzins (%)</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={marktzins}
                onChange={(e) => setMarktzins(toNumber(e.target.value))}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">{programmName}</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(gesamtvorteil)}</span>
            <span className="text-xl text-blue-200">€ Vorteil</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Förderkredit {formatEuro(effektiverKredit)} € zu {formatProzent(programmzins)} % statt{' '}
            {formatProzent(marktzins)} %
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">KfW-Rate / Monat</span>
              <span className="font-bold">{formatRate(rateKfw)} €</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">Bankrate (Vergleich)</span>
              <span className="font-bold">{formatRate(rateBank)} €</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Zinsersparnis ({formatProzent(laufzeit)} J)</span>
              <span className="font-bold">{formatEuro(zinsersparnis)} €</span>
            </div>
          </div>

          {programm === '261' && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Tilgungszuschuss ({formatProzent(tzProzent)} %)</span>
                <span className="text-xl font-bold">{formatEuro(tilgungszuschuss)} €</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Förderkredit</strong> = min(Kosten, Programmgrenze) = min({formatEuro(kosten)};{' '}
            {formatEuro(maxKredit)}) = <strong>{formatEuro(effektiverKredit)} €</strong>
          </p>
          <p>
            <strong>Zinsersparnis</strong> = (Bankrate − KfW-Rate) × Monate ={' '}
            <strong>{formatEuro(zinsersparnis)} €</strong>
          </p>
          {programm === '261' && (
            <p>
              <strong>Tilgungszuschuss</strong> = {formatProzent(tzProzent)} % × Förderkredit ={' '}
              <strong>{formatEuro(tilgungszuschuss)} €</strong>
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Unverbindliche Schätzung, keine Förder- oder Finanzierungsberatung.
          KfW-Konditionen (Zinssätze, Höchstbeträge, Einkommensgrenzen, Tilgungszuschüsse) ändern sich
          laufend und sind teils haushaltsabhängig gedeckelt – das BEG-Budget 2026 ist begrenzt, eine
          frühzeitige Antragstellung ist ratsam. <strong>Der Antrag muss vor Vorhabenbeginn</strong>{' '}
          über die Hausbank/Finanzierungspartner gestellt werden. Der Effektivzins ist endkunden- und
          bonitätsabhängig. Verbindlich ist allein www.kfw.de bzw. das jeweilige Merkblatt; für
          QNG/EH-Nachweise ist ein Energieeffizienz-Experte nötig. Stand der Konditionen: März 2026.
        </p>
      </div>
    </div>
  );
}

export default KfwFoerderungHausbauRechner;
