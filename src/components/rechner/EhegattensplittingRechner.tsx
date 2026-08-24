import { useState, useMemo } from 'react';

// Ehegattensplitting 2026 – § 26, § 26b, § 32a Abs. 5 EStG
// Tarifformeln identisch zum EinkommensteuerRechner (§ 32a EStG 2026)
const GRUNDFREIBETRAG_2026 = 12348;

const TARIFZONEN_2026 = {
  zone1Ende: 17799,   // Ende Zone 1 (14-24%)
  zone2Ende: 69878,   // Ende Zone 2 (24-42%)
  zone3Ende: 277825,  // Ende Zone 3 (42%)
  // darüber: 45% Reichensteuer
};

// Roh-Steuerbetrag ohne Rundung nach § 32a Abs. 1 EStG 2026
function steuerRoh(zvE: number): number {
  if (zvE <= GRUNDFREIBETRAG_2026) return 0;
  if (zvE <= TARIFZONEN_2026.zone1Ende) {
    const y = (zvE - GRUNDFREIBETRAG_2026) / 10000;
    return (914.51 * y + 1400) * y;
  }
  if (zvE <= TARIFZONEN_2026.zone2Ende) {
    const z = (zvE - TARIFZONEN_2026.zone1Ende) / 10000;
    return (173.10 * z + 2397) * z + 1034.87;
  }
  if (zvE <= TARIFZONEN_2026.zone3Ende) return 0.42 * zvE - 11135.63;
  return 0.45 * zvE - 19470.38;
}

// Grundtarif: zvE und Steuerbetrag auf volle Euro abgerundet (§ 32a Abs. 1 EStG)
function grundtarif(zvE: number): number {
  return Math.floor(steuerRoh(Math.floor(Math.max(0, zvE))));
}

// Splittingtarif: das Zweifache der Steuer auf das halbe gemeinsame zvE (§ 32a Abs. 5 EStG)
function splittingtarif(zvEGesamt: number): number {
  const zvE = Math.floor(Math.max(0, zvEGesamt));
  return Math.floor(2 * steuerRoh(zvE / 2));
}

// Solidaritätszuschlag (§ 3, § 4 SolzG 1995, Freigrenzen 2026)
function berechneSoli(einkommensteuer: number, zusammen: boolean): number {
  const freigrenze = zusammen ? 40700 : 20350;
  if (einkommensteuer <= freigrenze) return 0;
  return Math.round(Math.min(0.055 * einkommensteuer, 0.119 * (einkommensteuer - freigrenze)));
}

function formatEuro(betrag: number): string {
  return betrag.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';
}

export default function EhegattensplittingRechner() {
  const [zvEPartnerA, setZvEPartnerA] = useState(60000);
  const [zvEPartnerB, setZvEPartnerB] = useState(20000);
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0); // 0, 0.08, 0.09

  const ergebnis = useMemo(() => {
    const a = Math.max(0, zvEPartnerA || 0);
    const b = Math.max(0, zvEPartnerB || 0);
    const gesamt = a + b;

    // Einzelveranlagung: jeder nach Grundtarif, Soli/KiSt je Person
    const estA = grundtarif(a);
    const estB = grundtarif(b);
    const soliA = berechneSoli(estA, false);
    const soliB = berechneSoli(estB, false);
    const kistA = Math.round(estA * kirchensteuerSatz);
    const kistB = Math.round(estB * kirchensteuerSatz);
    const einzelEst = estA + estB;
    const einzelGesamt = einzelEst + soliA + soliB + kistA + kistB;

    // Zusammenveranlagung: Splittingtarif, Soli mit doppelter Freigrenze
    const splittingEst = splittingtarif(gesamt);
    const splittingSoli = berechneSoli(splittingEst, true);
    const splittingKist = Math.round(splittingEst * kirchensteuerSatz);
    const splittingGesamt = splittingEst + splittingSoli + splittingKist;

    const vorteilEst = einzelEst - splittingEst;
    const vorteilGesamt = einzelGesamt - splittingGesamt;

    const satzEinzel = gesamt > 0 ? (einzelEst / gesamt) * 100 : 0;
    const satzSplitting = gesamt > 0 ? (splittingEst / gesamt) * 100 : 0;

    return {
      a, b, gesamt,
      estA, estB, soliA, soliB, kistA, kistB, einzelEst, einzelGesamt,
      splittingEst, splittingSoli, splittingKist, splittingGesamt,
      vorteilEst, vorteilGesamt, satzEinzel, satzSplitting,
    };
  }, [zvEPartnerA, zvEPartnerB, kirchensteuerSatz]);

  return (
    <div>
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Einkommen beider Partner</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="zve-a" className="block text-sm font-medium text-gray-700 mb-1">
              Zu versteuerndes Einkommen Partner A (€/Jahr)
            </label>
            <input
              id="zve-a"
              type="number"
              min="0"
              step="1000"
              value={zvEPartnerA}
              onChange={(e) => setZvEPartnerA(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
          </div>

          <div>
            <label htmlFor="zve-b" className="block text-sm font-medium text-gray-700 mb-1">
              Zu versteuerndes Einkommen Partner B (€/Jahr)
            </label>
            <input
              id="zve-b"
              type="number"
              min="0"
              step="1000"
              value={zvEPartnerB}
              onChange={(e) => setZvEPartnerB(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
          </div>

          <div>
            <label htmlFor="kist" className="block text-sm font-medium text-gray-700 mb-1">
              Kirchensteuer
            </label>
            <select
              id="kist"
              value={kirchensteuerSatz}
              onChange={(e) => setKirchensteuerSatz(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500"
            >
              <option value={0}>Keine Kirchensteuer</option>
              <option value={0.08}>8 % (Bayern, Baden-Württemberg)</option>
              <option value={0.09}>9 % (übrige Bundesländer)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 rounded-lg p-3 text-xs text-blue-800">
          💡 Das <strong>zu versteuernde Einkommen (zvE)</strong> ist das Bruttoeinkommen abzüglich
          Werbungskosten, Vorsorgeaufwendungen und Sonderausgaben – es steht im Steuerbescheid.
          Zur Ermittlung hilft der <a href="/einkommensteuer-rechner" className="underline font-semibold">Einkommensteuer-Rechner</a>.
        </div>
      </div>

      {/* Hauptergebnis */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <p className="text-emerald-100 text-sm mb-1">Ihr Splittingvorteil pro Jahr (inkl. Soli & Kirchensteuer)</p>
        <p className="text-5xl font-bold mb-2">{formatEuro(ergebnis.vorteilGesamt)}</p>
        <p className="text-emerald-100 text-sm">
          {ergebnis.vorteilGesamt > 0
            ? `Die Zusammenveranlagung spart ${formatEuro(ergebnis.vorteilGesamt)} gegenüber zwei Einzelveranlagungen.`
            : 'Bei (nahezu) gleichen Einkommen bringt das Splitting keinen Vorteil – die Zusammenveranlagung kostet aber auch nichts extra.'}
        </p>
      </div>

      {/* Vergleichstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Einzelveranlagung vs. Zusammenveranlagung</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left">
                <th className="py-2 pr-2 font-semibold text-gray-700"></th>
                <th className="py-2 px-2 font-semibold text-gray-700 text-right">Einzelveranlagung</th>
                <th className="py-2 pl-2 font-semibold text-emerald-700 text-right">Zusammenveranlagung</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Einkommensteuer</td>
                <td className="py-2 px-2 text-right">
                  {formatEuro(ergebnis.einzelEst)}
                  <span className="block text-xs text-gray-400">
                    A: {formatEuro(ergebnis.estA)} + B: {formatEuro(ergebnis.estB)}
                  </span>
                </td>
                <td className="py-2 pl-2 text-right font-medium text-gray-800">{formatEuro(ergebnis.splittingEst)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Solidaritätszuschlag</td>
                <td className="py-2 px-2 text-right">{formatEuro(ergebnis.soliA + ergebnis.soliB)}</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.splittingSoli)}</td>
              </tr>
              {kirchensteuerSatz > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-2">Kirchensteuer</td>
                  <td className="py-2 px-2 text-right">{formatEuro(ergebnis.kistA + ergebnis.kistB)}</td>
                  <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.splittingKist)}</td>
                </tr>
              )}
              <tr className="font-bold text-gray-800">
                <td className="py-3 pr-2">Gesamt</td>
                <td className="py-3 px-2 text-right">{formatEuro(ergebnis.einzelGesamt)}</td>
                <td className="py-3 pl-2 text-right text-emerald-700">{formatEuro(ergebnis.splittingGesamt)}</td>
              </tr>
              <tr className="text-xs text-gray-500">
                <td className="py-1 pr-2">Ø-Steuersatz (ESt)</td>
                <td className="py-1 px-2 text-right">{ergebnis.satzEinzel.toFixed(1).replace('.', ',')} %</td>
                <td className="py-1 pl-2 text-right">{ergebnis.satzSplitting.toFixed(1).replace('.', ',')} %</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <strong>So rechnet das Splittingverfahren (§ 32a Abs. 5 EStG):</strong> Das gemeinsame zvE
          ({formatEuro(ergebnis.gesamt)}) wird halbiert ({formatEuro(ergebnis.gesamt / 2)}), darauf die
          Einkommensteuer nach Grundtarif berechnet und das Ergebnis verdoppelt. Bei unterschiedlich hohen
          Einkommen fällt so weniger Steuer an als bei zwei Einzelveranlagungen, weil die Progression
          gebrochen wird.
        </div>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-xs text-gray-500 mb-4">
          ⚠️ Vereinfachte Berechnung der tariflichen Einkommensteuer 2026 – ohne Progressionsvorbehalt,
          Kinderfreibeträge, außerordentliche Einkünfte (Fünftelregelung) und sonstige Besonderheiten.
          Schätzung – keine Steuerberatung. Maßgeblich ist der Steuerbescheid Ihres Finanzamts.
        </p>
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Quellen</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__32a.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 32a EStG – Einkommensteuertarif (Grund- und Splittingtarif)
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__26.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 26 EStG – Veranlagung von Ehegatten
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__26b.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 26b EStG – Zusammenveranlagung
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/solzg_1995/__3.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 3 SolzG 1995 – Freigrenzen Solidaritätszuschlag
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
