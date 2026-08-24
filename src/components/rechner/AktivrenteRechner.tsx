import { useState, useMemo } from 'react';

// Aktivrente – § 3 Nr. 21 EStG n.F. (Aktivrentengesetz, seit 01.01.2026):
// Arbeitslohn aus sozialversicherungspflichtiger Beschäftigung nach Erreichen
// der Regelaltersgrenze bleibt bis 2.000 €/Monat steuerfrei. Der Freibetrag
// unterliegt nicht dem Progressionsvorbehalt. KV/PV-Beiträge fallen auf den
// vollen Lohn an; RV- und ALV-Beiträge entfallen für den Arbeitnehmer nach
// der Regelaltersgrenze.
const FREIBETRAG_JAHR = 24000;      // 2.000 €/Monat × 12
const AN_PAUSCHBETRAG = 1230;       // § 9a S. 1 Nr. 1a EStG

// Einkommensteuertarif 2026 (§ 32a EStG) – identisch zu den übrigen Steuer-Rechnern
const GRUNDFREIBETRAG_2026 = 12348;
const TARIFZONEN_2026 = { zone1Ende: 17799, zone2Ende: 69878, zone3Ende: 277825 };

// Sozialversicherung 2026 (identisch zum GehaltserhoehungRechner)
const SV_2026 = {
  kvBasis: 0.073,           // AN-Anteil allgemeiner Beitragssatz
  pvBasis: 0.018,           // AN-Anteil Pflegeversicherung
  pvKinderlosZuschlag: 0.006,
  bbgKrankenPflege: 69750,  // Beitragsbemessungsgrenze KV/PV
};

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

function tarifSteuer(zvE: number, zusammen: boolean): number {
  const z = Math.floor(Math.max(0, zvE));
  if (zusammen) return Math.floor(2 * steuerRoh(z / 2));
  return Math.floor(steuerRoh(z));
}

function berechneSoli(einkommensteuer: number, zusammen: boolean): number {
  const freigrenze = zusammen ? 40700 : 20350;
  if (einkommensteuer <= freigrenze) return 0;
  return Math.round(Math.min(0.055 * einkommensteuer, 0.119 * (einkommensteuer - freigrenze)));
}

function formatEuro(betrag: number): string {
  return betrag.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';
}

export default function AktivrenteRechner() {
  const [bruttoMonat, setBruttoMonat] = useState(2000);
  const [uebrigesZvE, setUebrigesZvE] = useState(15000);
  const [zusammen, setZusammen] = useState(false);
  const [kinderlos, setKinderlos] = useState(false);
  const [kvZusatzbeitrag, setKvZusatzbeitrag] = useState(2.9);

  const ergebnis = useMemo(() => {
    const lohnJahr = Math.max(0, bruttoMonat || 0) * 12;
    const zvERest = Math.max(0, uebrigesZvE || 0);

    // Aktivrente-Freibetrag: bis 24.000 €/Jahr steuerfrei
    const steuerfrei = Math.min(lohnJahr, FREIBETRAG_JAHR);
    const stpflLohnMit = Math.max(0, lohnJahr - steuerfrei);

    // zvE-Vergleich (AN-Pauschbetrag nur auf steuerpflichtigen Arbeitslohn)
    const zvEMit = zvERest + Math.max(0, stpflLohnMit - AN_PAUSCHBETRAG);
    const zvEOhne = zvERest + Math.max(0, lohnJahr - AN_PAUSCHBETRAG);

    const estMit = tarifSteuer(zvEMit, zusammen);
    const estOhne = tarifSteuer(zvEOhne, zusammen);
    const soliMit = berechneSoli(estMit, zusammen);
    const soliOhne = berechneSoli(estOhne, zusammen);
    const ersparnis = (estOhne + soliOhne) - (estMit + soliMit);

    // KV/PV auf den vollen Lohn (auch den steuerfreien Teil), bis zur BBG.
    // RV/ALV entfallen für Arbeitnehmer nach der Regelaltersgrenze.
    const svBasis = Math.min(lohnJahr, SV_2026.bbgKrankenPflege);
    const kvSatz = SV_2026.kvBasis + (kvZusatzbeitrag || 0) / 100 / 2;
    const pvSatz = SV_2026.pvBasis + (kinderlos ? SV_2026.pvKinderlosZuschlag : 0);
    const kv = Math.round(svBasis * kvSatz);
    const pv = Math.round(svBasis * pvSatz);

    // Steuer, die der Job (mit Aktivrente) zusätzlich auslöst
    const estNurRest = tarifSteuer(zvERest, zusammen);
    const steuerAufJob = (estMit + soliMit) - (estNurRest + berechneSoli(estNurRest, zusammen));
    const nettoZuwachs = lohnJahr - kv - pv - Math.max(0, steuerAufJob);

    return {
      lohnJahr, steuerfrei, stpflLohnMit, zvEMit, zvEOhne,
      estMit, estOhne, soliMit, soliOhne, ersparnis,
      kv, pv, nettoZuwachs, steuerAufJob: Math.max(0, steuerAufJob),
    };
  }, [bruttoMonat, uebrigesZvE, zusammen, kinderlos, kvZusatzbeitrag]);

  return (
    <div>
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Ihr Zuverdienst nach der Regelaltersgrenze</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="ar-brutto" className="block text-sm font-medium text-gray-700 mb-1">
              Monatsbrutto aus der Beschäftigung (€)
            </label>
            <input
              id="ar-brutto"
              type="number"
              min="0"
              step="100"
              value={bruttoMonat}
              onChange={(e) => setBruttoMonat(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">
              Sozialversicherungspflichtige Beschäftigung (kein Minijob) nach Erreichen der Regelaltersgrenze.
            </p>
          </div>

          <div>
            <label htmlFor="ar-zve" className="block text-sm font-medium text-gray-700 mb-1">
              Übriges zu versteuerndes Einkommen (€/Jahr)
            </label>
            <input
              id="ar-zve"
              type="number"
              min="0"
              step="1000"
              value={uebrigesZvE}
              onChange={(e) => setUebrigesZvE(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">
              Vor allem der steuerpflichtige Teil Ihrer Rente – zu ermitteln mit dem{' '}
              <a href="/rentensteuer-rechner" className="text-amber-600 underline">Rentensteuer-Rechner</a>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer ${!zusammen ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
              <input type="radio" name="ar-veranlagung" checked={!zusammen} onChange={() => setZusammen(false)} className="accent-orange-500" />
              <span className="text-sm font-medium text-gray-700">Einzelveranlagung</span>
            </label>
            <label className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer ${zusammen ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
              <input type="radio" name="ar-veranlagung" checked={zusammen} onChange={() => setZusammen(true)} className="accent-orange-500" />
              <span className="text-sm font-medium text-gray-700">Zusammenveranlagung</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={kinderlos}
                onChange={(e) => setKinderlos(e.target.checked)}
                className="accent-orange-500"
              />
              <span>Kinderlos (PV-Zuschlag 0,6 %)</span>
            </label>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <label htmlFor="ar-kvz" className="whitespace-nowrap">KV-Zusatzbeitrag</label>
              <input
                id="ar-kvz"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={kvZusatzbeitrag}
                onChange={(e) => setKvZusatzbeitrag(Number(e.target.value))}
                className="w-20 px-2 py-1 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-orange-500 text-right"
              />
              <span>%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hauptergebnis */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <p className="text-amber-100 text-sm mb-1">Ihre Steuerersparnis durch die Aktivrente pro Jahr</p>
        <p className="text-5xl font-bold mb-2">{formatEuro(ergebnis.ersparnis)}</p>
        <p className="text-amber-100 text-sm">
          {ergebnis.steuerfrei > 0
            ? `${formatEuro(ergebnis.steuerfrei)} Ihres Jahreslohns (${formatEuro(ergebnis.lohnJahr)}) bleiben steuerfrei. Vom Zuverdienst bleiben nach KV/PV-Beiträgen und Steuer etwa ${formatEuro(ergebnis.nettoZuwachs)} netto übrig.`
            : 'Geben Sie ein Monatsbrutto ein, um Ihre Ersparnis zu berechnen.'}
        </p>
      </div>

      {/* Vergleichstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Mit vs. ohne Aktivrente-Freibetrag</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left">
                <th className="py-2 pr-2 font-semibold text-gray-700"></th>
                <th className="py-2 px-2 font-semibold text-gray-700 text-right">ohne Aktivrente</th>
                <th className="py-2 pl-2 font-semibold text-amber-700 text-right">mit Aktivrente</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Steuerfreier Arbeitslohn</td>
                <td className="py-2 px-2 text-right">0 €</td>
                <td className="py-2 pl-2 text-right font-medium text-gray-800">{formatEuro(ergebnis.steuerfrei)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Zu versteuerndes Einkommen</td>
                <td className="py-2 px-2 text-right">{formatEuro(ergebnis.zvEOhne)}</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.zvEMit)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Einkommensteuer</td>
                <td className="py-2 px-2 text-right">{formatEuro(ergebnis.estOhne)}</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.estMit)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Solidaritätszuschlag</td>
                <td className="py-2 px-2 text-right">{formatEuro(ergebnis.soliOhne)}</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.soliMit)}</td>
              </tr>
              <tr className="font-bold text-gray-800">
                <td className="py-3 pr-2">Ersparnis</td>
                <td className="py-3 px-2 text-right"></td>
                <td className="py-3 pl-2 text-right text-amber-700">{formatEuro(ergebnis.ersparnis)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 overflow-x-auto">
          <h3 className="text-sm font-bold text-gray-800 mb-2">Abgaben auf den Zuverdienst (mit Aktivrente)</h3>
          <table className="w-full text-sm">
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Krankenversicherung (AN-Anteil, {(SV_2026.kvBasis * 100 + kvZusatzbeitrag / 2).toFixed(2).replace('.', ',')} %)</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.kv)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Pflegeversicherung ({((SV_2026.pvBasis + (kinderlos ? SV_2026.pvKinderlosZuschlag : 0)) * 100).toFixed(1).replace('.', ',')} %)</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.pv)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Renten-/Arbeitslosenversicherung</td>
                <td className="py-2 pl-2 text-right">0 € (nach Regelaltersgrenze befreit)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Steuer auf den Job (über Freibetrag)</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.steuerAufJob)}</td>
              </tr>
              <tr className="font-bold text-gray-800">
                <td className="py-3 pr-2">Netto-Zuwachs durchs Arbeiten</td>
                <td className="py-3 pl-2 text-right text-amber-700">{formatEuro(ergebnis.nettoZuwachs)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <strong>Wichtig:</strong> Der Aktivrente-Freibetrag ist ein Lohnsteuer-Freibetrag ohne
          Progressionsvorbehalt – der steuerfreie Teil erhöht also nicht den Steuersatz auf Ihre Rente.
          KV- und PV-Beiträge fallen trotzdem auf den vollen Lohn an, RV- und ALV-Beiträge entfallen
          für Arbeitnehmer nach der Regelaltersgrenze.
        </div>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-xs text-gray-500 mb-4">
          ⚠️ Vereinfachte Jahresrechnung mit dem Einkommensteuertarif 2026 – ohne Vorsorgeaufwands-Abzug
          (wirkt in beiden Szenarien ähnlich), Kirchensteuer, Altersentlastungsbetrag und
          Arbeitgeberbeiträge. Freiwillige RV-Beiträge (Opt-in) nicht berücksichtigt.
          Schätzung – keine Steuer- oder Rentenberatung.
        </p>
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Quellen</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__3.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 3 Nr. 21 EStG – Steuerfreiheit der Aktivrente (i. d. F. des Aktivrentengesetzes)
            </a>
          </li>
          <li>
            <a href="https://www.recht.bund.de/" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Aktivrentengesetz – Verkündung im Bundesgesetzblatt (recht.bund.de)
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/sgb_6/__5.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 5 Abs. 4 SGB VI – Rentenversicherungsfreiheit nach der Regelaltersgrenze
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__32a.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 32a EStG – Einkommensteuertarif 2026
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
