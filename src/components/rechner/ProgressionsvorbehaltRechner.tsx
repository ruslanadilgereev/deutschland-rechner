import { useState, useMemo } from 'react';

// Progressionsvorbehalt – § 32b EStG, Einkommensteuertarif 2026 (§ 32a EStG)
// Tarifformeln identisch zum EinkommensteuerRechner / EhegattensplittingRechner
const GRUNDFREIBETRAG_2026 = 12348;
const ARBEITNEHMER_PAUSCHBETRAG = 1230; // § 9a S. 1 Nr. 1a EStG

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

// Grundtarif bzw. Splittingtarif, zvE und Steuerbetrag auf volle Euro abgerundet
function tarifSteuer(zvE: number, zusammen: boolean): number {
  const z = Math.floor(Math.max(0, zvE));
  if (zusammen) return Math.floor(2 * steuerRoh(z / 2));
  return Math.floor(steuerRoh(z));
}

// § 32b EStG: besonderer Steuersatz aus dem um die Lohnersatzleistungen
// erhöhten zvE; Satz auf 4 Dezimalstellen abgerundet (H 32b EStH), auf das
// tatsächliche zvE angewendet, Ergebnis abgerundet.
function steuerMitProgressionsvorbehalt(zvE: number, pvEinkuenfte: number, zusammen: boolean): { steuer: number; satz: number } {
  const z = Math.floor(Math.max(0, zvE));
  const p = Math.max(0, Math.floor(pvEinkuenfte));
  if (p <= 0) {
    const normal = tarifSteuer(z, zusammen);
    return { steuer: normal, satz: z > 0 ? (normal / z) * 100 : 0 };
  }
  const fiktiv = z + p;
  const steuerFiktiv = tarifSteuer(fiktiv, zusammen);
  const satz = Math.floor((steuerFiktiv / fiktiv) * 1e6) / 1e6; // 4 Dezimalstellen in %
  return { steuer: Math.floor(z * satz), satz: satz * 100 };
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

export default function ProgressionsvorbehaltRechner() {
  const [zvE, setZvE] = useState(40000);
  const [lohnersatz, setLohnersatz] = useState(10000);
  const [zusammen, setZusammen] = useState(false);
  const [arbeitslohnBezogen, setArbeitslohnBezogen] = useState(true);
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0);

  const ergebnis = useMemo(() => {
    const z = Math.max(0, zvE || 0);
    const leistungBrutto = Math.max(0, lohnersatz || 0);

    // § 32b Abs. 2 Nr. 1 EStG: Leistungen um den Arbeitnehmer-Pauschbetrag
    // mindern, soweit er nicht bereits beim Arbeitslohn verbraucht ist
    const pvEinkuenfte = arbeitslohnBezogen
      ? leistungBrutto
      : Math.max(0, leistungBrutto - ARBEITNEHMER_PAUSCHBETRAG);

    const steuerOhne = tarifSteuer(z, zusammen);
    const { steuer: steuerMit, satz: besondererSatz } = steuerMitProgressionsvorbehalt(z, pvEinkuenfte, zusammen);

    const soliOhne = berechneSoli(steuerOhne, zusammen);
    const soliMit = berechneSoli(steuerMit, zusammen);
    const kistOhne = Math.round(steuerOhne * kirchensteuerSatz);
    const kistMit = Math.round(steuerMit * kirchensteuerSatz);

    const mehrEst = steuerMit - steuerOhne;
    const mehrGesamt = (steuerMit + soliMit + kistMit) - (steuerOhne + soliOhne + kistOhne);

    const normalerSatz = z > 0 ? (steuerOhne / z) * 100 : 0;
    const effektivAufLeistung = leistungBrutto > 0 ? (mehrGesamt / leistungBrutto) * 100 : 0;
    const erklaerungspflicht = leistungBrutto > 410; // § 46 Abs. 2 Nr. 1 EStG

    return {
      z, leistungBrutto, pvEinkuenfte,
      steuerOhne, steuerMit, mehrEst, mehrGesamt,
      soliOhne, soliMit, kistOhne, kistMit,
      besondererSatz, normalerSatz, effektivAufLeistung, erklaerungspflicht,
    };
  }, [zvE, lohnersatz, zusammen, arbeitslohnBezogen, kirchensteuerSatz]);

  return (
    <div>
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Einkommen & Lohnersatzleistung</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="pv-zve" className="block text-sm font-medium text-gray-700 mb-1">
              Zu versteuerndes Einkommen ohne Lohnersatz (€/Jahr)
            </label>
            <input
              id="pv-zve"
              type="number"
              min="0"
              step="1000"
              value={zvE}
              onChange={(e) => setZvE(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">
              Bei Zusammenveranlagung: gemeinsames zvE beider Partner (steht im Steuerbescheid).
            </p>
          </div>

          <div>
            <label htmlFor="pv-leistung" className="block text-sm font-medium text-gray-700 mb-1">
              Lohnersatzleistungen im Jahr (€)
            </label>
            <input
              id="pv-leistung"
              type="number"
              min="0"
              step="500"
              value={lohnersatz}
              onChange={(e) => setLohnersatz(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">
              Elterngeld, Krankengeld, ALG I, Kurzarbeitergeld, Mutterschaftsgeld, Übergangsgeld …
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer ${!zusammen ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
              <input type="radio" name="veranlagung" checked={!zusammen} onChange={() => setZusammen(false)} className="accent-orange-500" />
              <span className="text-sm font-medium text-gray-700">Einzelveranlagung</span>
            </label>
            <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer ${zusammen ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
              <input type="radio" name="veranlagung" checked={zusammen} onChange={() => setZusammen(true)} className="accent-orange-500" />
              <span className="text-sm font-medium text-gray-700">Zusammenveranlagung</span>
            </label>
          </div>

          <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={arbeitslohnBezogen}
              onChange={(e) => setArbeitslohnBezogen(e.target.checked)}
              className="mt-0.5 accent-orange-500"
            />
            <span>
              Im selben Jahr auch Arbeitslohn bezogen
              <span className="block text-xs text-gray-400">
                Falls nein (z. B. ganzjährig krank), mindert der Arbeitnehmer-Pauschbetrag
                (1.230 €) die Lohnersatzleistung – § 32b Abs. 2 Nr. 1 EStG.
              </span>
            </span>
          </label>

          <div>
            <label htmlFor="pv-kist" className="block text-sm font-medium text-gray-700 mb-1">
              Kirchensteuer
            </label>
            <select
              id="pv-kist"
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
      </div>

      {/* Hauptergebnis */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <p className="text-orange-100 text-sm mb-1">Steuer-Mehrbelastung durch den Progressionsvorbehalt</p>
        <p className="text-5xl font-bold mb-2">{formatEuro(ergebnis.mehrGesamt)}</p>
        <p className="text-orange-100 text-sm">
          {ergebnis.mehrGesamt > 0
            ? `So viel mehr Steuer fällt durch ${formatEuro(ergebnis.leistungBrutto)} Lohnersatzleistung an – das entspricht ${ergebnis.effektivAufLeistung.toFixed(1).replace('.', ',')} % der Leistung. Diesen Betrag als Rücklage einplanen.`
            : 'Keine Mehrbelastung: Ohne weiteres zu versteuerndes Einkommen bleibt die Lohnersatzleistung steuerfrei – der Progressionsvorbehalt läuft ins Leere.'}
        </p>
      </div>

      {/* Detailtabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Mit vs. ohne Progressionsvorbehalt</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left">
                <th className="py-2 pr-2 font-semibold text-gray-700"></th>
                <th className="py-2 px-2 font-semibold text-gray-700 text-right">ohne PV</th>
                <th className="py-2 pl-2 font-semibold text-orange-700 text-right">mit PV</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Steuersatz auf das zvE</td>
                <td className="py-2 px-2 text-right">{ergebnis.normalerSatz.toFixed(2).replace('.', ',')} %</td>
                <td className="py-2 pl-2 text-right font-medium text-gray-800">{ergebnis.besondererSatz.toFixed(2).replace('.', ',')} %</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Einkommensteuer</td>
                <td className="py-2 px-2 text-right">{formatEuro(ergebnis.steuerOhne)}</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.steuerMit)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Solidaritätszuschlag</td>
                <td className="py-2 px-2 text-right">{formatEuro(ergebnis.soliOhne)}</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.soliMit)}</td>
              </tr>
              {kirchensteuerSatz > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-2">Kirchensteuer</td>
                  <td className="py-2 px-2 text-right">{formatEuro(ergebnis.kistOhne)}</td>
                  <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.kistMit)}</td>
                </tr>
              )}
              <tr className="font-bold text-gray-800">
                <td className="py-3 pr-2">Mehrbelastung gesamt</td>
                <td className="py-3 px-2 text-right"></td>
                <td className="py-3 pl-2 text-right text-orange-700">{formatEuro(ergebnis.mehrGesamt)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {ergebnis.erklaerungspflicht && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            📋 <strong>Pflicht zur Steuererklärung:</strong> Lohnersatzleistungen über 410 € im Jahr
            lösen eine Pflichtveranlagung aus (§ 46 Abs. 2 Nr. 1 EStG). Das Finanzamt erfährt die
            Beträge automatisch von der auszahlenden Stelle.
          </div>
        )}

        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <strong>So rechnet der Progressionsvorbehalt (§ 32b EStG):</strong> Die steuerfreie Leistung
          ({formatEuro(ergebnis.pvEinkuenfte)}{!arbeitslohnBezogen && ergebnis.leistungBrutto > 0 ? ' nach Abzug des Arbeitnehmer-Pauschbetrags' : ''})
          wird dem zvE fiktiv zugerechnet. Aus dem fiktiven Einkommen ergibt sich der besondere
          Steuersatz von {ergebnis.besondererSatz.toFixed(2).replace('.', ',')} % – und dieser höhere Satz
          wird auf das tatsächliche zvE von {formatEuro(ergebnis.z)} angewendet.
        </div>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-xs text-gray-500 mb-4">
          ⚠️ Vereinfachte Berechnung mit dem Einkommensteuertarif 2026 – ohne Kinderfreibeträge,
          außerordentliche Einkünfte, negative Progressionseinkünfte und weitere Besonderheiten.
          Der besondere Steuersatz wird wie in der Verwaltungspraxis auf vier Dezimalstellen
          abgerundet. Schätzung – keine Steuerberatung. Maßgeblich ist der Steuerbescheid.
        </p>
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Quellen</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__32b.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 32b EStG – Progressionsvorbehalt
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__32a.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 32a EStG – Einkommensteuertarif 2026
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__46.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 46 EStG – Pflichtveranlagung ab 410 € Lohnersatzleistungen
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
