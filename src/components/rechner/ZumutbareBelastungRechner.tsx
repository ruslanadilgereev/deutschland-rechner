import { useState, useMemo } from 'react';

// Zumutbare Belastung – § 33 Abs. 3 EStG
// Stufenweise Berechnung nach BFH-Urteil VI R 75/14 vom 19.01.2017:
// Nur der Teil des Gesamtbetrags der Einkünfte, der eine Stufengrenze
// übersteigt, wird mit dem höheren Prozentsatz belastet.
const STUFE1 = 15340;
const STUFE2 = 51130;

// Grenzsteuersatz-Schätzung: Tarif 2026 (§ 32a EStG), identisch zum EinkommensteuerRechner
const GRUNDFREIBETRAG_2026 = 12348;
const TARIFZONEN_2026 = { zone1Ende: 17799, zone2Ende: 69878, zone3Ende: 277825 };

function saetze(kinder: number, zusammen: boolean): [number, number, number] {
  if (kinder >= 3) return [0.01, 0.01, 0.02];
  if (kinder >= 1) return [0.02, 0.03, 0.04];
  return zusammen ? [0.04, 0.05, 0.06] : [0.05, 0.06, 0.07];
}

// Zumutbare Belastung, stufenweise, auf volle Euro abgerundet
function zumutbareBelastung(gde: number, kinder: number, zusammen: boolean): number {
  const g = Math.max(0, gde);
  const [s1, s2, s3] = saetze(kinder, zusammen);
  let zb = Math.min(g, STUFE1) * s1;
  if (g > STUFE1) zb += (Math.min(g, STUFE2) - STUFE1) * s2;
  if (g > STUFE2) zb += (g - STUFE2) * s3;
  return Math.floor(zb);
}

// Grenzsteuersatz 2026 (vereinfacht: GdE ≈ zvE) für die Ersparnis-Schätzung
function grenzsteuersatz(zvE: number, zusammen: boolean): number {
  const zvEHalb = Math.max(0, zvE) / (zusammen ? 2 : 1);
  if (zvEHalb <= GRUNDFREIBETRAG_2026) return 0;
  if (zvEHalb <= TARIFZONEN_2026.zone1Ende) {
    const y = (zvEHalb - GRUNDFREIBETRAG_2026) / 10000;
    return Math.min(24, (2 * 914.51 * y + 1400) / 100);
  }
  if (zvEHalb <= TARIFZONEN_2026.zone2Ende) {
    const z = (zvEHalb - TARIFZONEN_2026.zone1Ende) / 10000;
    return Math.min(42, (2 * 173.10 * z + 2397) / 100);
  }
  if (zvEHalb <= TARIFZONEN_2026.zone3Ende) return 42;
  return 45;
}

function formatEuro(betrag: number): string {
  return betrag.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';
}

export default function ZumutbareBelastungRechner() {
  const [gde, setGde] = useState(45000);
  const [agb, setAgb] = useState(4000);
  const [kinder, setKinder] = useState(0);
  const [zusammen, setZusammen] = useState(false);

  const ergebnis = useMemo(() => {
    const g = Math.max(0, gde || 0);
    const kosten = Math.max(0, agb || 0);
    const k = Math.max(0, Math.floor(kinder || 0));

    const zb = zumutbareBelastung(g, k, zusammen);
    const abzugsfaehig = Math.max(0, Math.floor(kosten) - zb);
    const satz = grenzsteuersatz(g, zusammen);
    const ersparnis = Math.round(abzugsfaehig * (satz / 100));
    const [s1, s2, s3] = saetze(k, zusammen);

    // Stufen-Zerlegung für die Anzeige
    const teil1 = Math.min(g, STUFE1) * s1;
    const teil2 = g > STUFE1 ? (Math.min(g, STUFE2) - STUFE1) * s2 : 0;
    const teil3 = g > STUFE2 ? (g - STUFE2) * s3 : 0;

    return { g, kosten, zb, abzugsfaehig, satz, ersparnis, s1, s2, s3, teil1, teil2, teil3 };
  }, [gde, agb, kinder, zusammen]);

  return (
    <div>
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Ihre Angaben</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="zb-gde" className="block text-sm font-medium text-gray-700 mb-1">
              Gesamtbetrag der Einkünfte (€/Jahr)
            </label>
            <input
              id="zb-gde"
              type="number"
              min="0"
              step="1000"
              value={gde}
              onChange={(e) => setGde(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">
              Steht im Steuerbescheid – Summe aller Einkünfte vor Sonderausgaben und außergewöhnlichen
              Belastungen. Bei Zusammenveranlagung: beide Partner zusammen.
            </p>
          </div>

          <div>
            <label htmlFor="zb-agb" className="block text-sm font-medium text-gray-700 mb-1">
              Außergewöhnliche Belastungen im Jahr (€)
            </label>
            <input
              id="zb-agb"
              type="number"
              min="0"
              step="100"
              value={agb}
              onChange={(e) => setAgb(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">
              Krankheitskosten, Zahnersatz, Brille, Pflege- und Heimkosten, Kur, Beerdigung …
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer ${!zusammen ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
              <input type="radio" name="zb-veranlagung" checked={!zusammen} onChange={() => setZusammen(false)} className="accent-orange-500" />
              <span className="text-sm font-medium text-gray-700">Einzelveranlagung</span>
            </label>
            <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer ${zusammen ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
              <input type="radio" name="zb-veranlagung" checked={zusammen} onChange={() => setZusammen(true)} className="accent-orange-500" />
              <span className="text-sm font-medium text-gray-700">Zusammenveranlagung</span>
            </label>
          </div>

          <div>
            <label htmlFor="zb-kinder" className="block text-sm font-medium text-gray-700 mb-1">
              Kinder (mit Kindergeld-/Freibetragsanspruch)
            </label>
            <select
              id="zb-kinder"
              value={kinder}
              onChange={(e) => setKinder(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500"
            >
              <option value={0}>Keine Kinder</option>
              <option value={1}>1 Kind</option>
              <option value={2}>2 Kinder</option>
              <option value={3}>3 oder mehr Kinder</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hauptergebnis */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <p className="text-teal-100 text-sm mb-1">Steuerlich absetzbar (über der zumutbaren Belastung)</p>
        <p className="text-5xl font-bold mb-2">{formatEuro(ergebnis.abzugsfaehig)}</p>
        <p className="text-teal-100 text-sm">
          {ergebnis.abzugsfaehig > 0
            ? `Ihre zumutbare Belastung beträgt ${formatEuro(ergebnis.zb)}. Von ${formatEuro(ergebnis.kosten)} Kosten wirken ${formatEuro(ergebnis.abzugsfaehig)} steuermindernd – das spart bei Ihrem Grenzsteuersatz von ${ergebnis.satz.toFixed(0)} % etwa ${formatEuro(ergebnis.ersparnis)} Steuern.`
            : `Ihre Kosten (${formatEuro(ergebnis.kosten)}) liegen unter der zumutbaren Belastung von ${formatEuro(ergebnis.zb)} – steuerlich wirkt sich davon nichts aus. Tipp: Planbare Kosten (Zahnersatz, Brille) in einem Jahr bündeln.`}
        </p>
      </div>

      {/* Stufen-Rechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">So wird Ihre zumutbare Belastung berechnet</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left">
                <th className="py-2 pr-2 font-semibold text-gray-700">Stufe (GdE-Anteil)</th>
                <th className="py-2 px-2 font-semibold text-gray-700 text-right">Satz</th>
                <th className="py-2 pl-2 font-semibold text-gray-700 text-right">Betrag</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">bis 15.340 €</td>
                <td className="py-2 px-2 text-right">{(ergebnis.s1 * 100).toFixed(0)} %</td>
                <td className="py-2 pl-2 text-right">{ergebnis.teil1.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">15.340 € bis 51.130 €</td>
                <td className="py-2 px-2 text-right">{(ergebnis.s2 * 100).toFixed(0)} %</td>
                <td className="py-2 pl-2 text-right">{ergebnis.teil2.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">über 51.130 €</td>
                <td className="py-2 px-2 text-right">{(ergebnis.s3 * 100).toFixed(0)} %</td>
                <td className="py-2 pl-2 text-right">{ergebnis.teil3.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
              </tr>
              <tr className="font-bold text-gray-800">
                <td className="py-3 pr-2">Zumutbare Belastung (abgerundet)</td>
                <td className="py-3 px-2"></td>
                <td className="py-3 pl-2 text-right text-teal-700">{formatEuro(ergebnis.zb)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <strong>Stufenweise seit dem BFH-Urteil VI R 75/14 (2017):</strong> Nur der Teil des
          Gesamtbetrags der Einkünfte, der eine Stufengrenze übersteigt, wird mit dem höheren
          Prozentsatz belastet – nicht mehr der gesamte Betrag. Das macht die zumutbare Belastung
          niedriger und den absetzbaren Anteil höher als nach der alten Methode.
        </div>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-xs text-gray-500 mb-4">
          ⚠️ Vereinfachte Berechnung – die Steuerersparnis wird mit dem Grenzsteuersatz 2026 auf Basis
          GdE ≈ zvE geschätzt. Pauschbeträge (z. B. Behinderten-Pauschbetrag) und besondere
          außergewöhnliche Belastungen nach § 33a/§ 33b EStG folgen eigenen Regeln ohne zumutbare
          Belastung. Schätzung – keine Steuerberatung.
        </p>
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Quellen</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__33.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 33 EStG – Außergewöhnliche Belastungen (Abs. 3: zumutbare Belastung)
            </a>
          </li>
          <li>
            <a href="https://www.bundesfinanzhof.de/de/entscheidung/entscheidungen-online/detail/STRE201710063/" target="_blank" rel="noopener noreferrer" className="hover:underline">
              BFH, Urteil vom 19.01.2017 – VI R 75/14 (stufenweise Berechnung)
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__32a.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 32a EStG – Einkommensteuertarif 2026 (Grenzsteuersatz-Schätzung)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
