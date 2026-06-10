import { useState, useMemo } from 'react';

// GmbH-Gesamtsteuerbelastung 2026 – zweistufige Besteuerung
// Stufe 1 (Gesellschaft):
//   Körperschaftsteuer 15 % (§ 23 Abs. 1 KStG)
//   + Solidaritätszuschlag 5,5 % auf die KSt (§ 4 SolzG)
//   + Gewerbesteuer: Steuermesszahl 3,5 % × Hebesatz (§ 11, § 16 GewStG), kein Freibetrag für Kapitalgesellschaften
// Stufe 2 (Gesellschafter, auf die Ausschüttung):
//   Variante A – Abgeltungsteuer (Privatvermögen): 25 % KapSt + 5,5 % Soli = 26,375 % (§ 32d EStG, § 43 EStG)
//     Sparer-Pauschbetrag 1.000 € (ledig) / 2.000 € (zusammenveranlagt) (§ 20 Abs. 9 EStG)
//   Variante B – Teileinkünfteverfahren (Betriebsvermögen, Beteiligung >= 25 % oder >= 1 % + tätig):
//     60 % der Ausschüttung × persönlicher Grenzsteuersatz (§ 3 Nr. 40 EStG, § 32d Abs. 2 Nr. 3 EStG)
// Quellen: KStG, GewStG, § 32d EStG, § 3 Nr. 40 EStG – siehe Quellen-Block unten.

const KOERPERSCHAFTSTEUER = 0.15; // 15 % KSt
const SOLI_SATZ = 0.055; // 5,5 % Soli (auf KSt bzw. KapSt)
const GEWST_MESSZAHL = 0.035; // 3,5 % Steuermesszahl
const ABGELTUNGSTEUER = 0.25; // 25 % Kapitalertragsteuer
const TEV_STEUERPFLICHTIG = 0.6; // 60 % der Ausschüttung sind beim TEV steuerpflichtig
const SPARERPAUSCHBETRAG_LEDIG = 1000;
const SPARERPAUSCHBETRAG_VERHEIRATET = 2000;

type Verfahren = 'abgeltung' | 'tev';

export default function GmbhSteuerGesamtbelastungRechner() {
  // Eingaben
  const [gewinn, setGewinn] = useState(100000); // Gewinn vor Steuern auf GmbH-Ebene
  const [hebesatz, setHebesatz] = useState(409);
  const [ausschuettungsquote, setAusschuettungsquote] = useState(100); // % des Nachsteuergewinns
  const [verfahren, setVerfahren] = useState<Verfahren>('abgeltung');
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42); // für TEV
  const [verheiratet, setVerheiratet] = useState(false);
  const [kirche, setKirche] = useState(false);
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0.09); // 8 % (BY/BW) oder 9 %

  const ergebnis = useMemo(() => {
    // === Stufe 1: Besteuerung auf GmbH-Ebene ===
    const kSt = gewinn * KOERPERSCHAFTSTEUER;
    const soliKSt = kSt * SOLI_SATZ;
    // Gewerbesteuer: kein Freibetrag, Gewerbeertrag = Gewinn (vereinfacht, ohne Hinzurechnungen/Kürzungen)
    const steuermessbetrag = gewinn * GEWST_MESSZAHL;
    const gewerbesteuer = steuermessbetrag * (hebesatz / 100);

    const stufe1Steuer = kSt + soliKSt + gewerbesteuer;
    const gewinnNachSteuer = Math.max(0, gewinn - stufe1Steuer);
    const stufe1SatzProzent = gewinn > 0 ? (stufe1Steuer / gewinn) * 100 : 0;

    // === Ausschüttung ===
    const quote = Math.min(100, Math.max(0, ausschuettungsquote)) / 100;
    const ausschuettungBrutto = gewinnNachSteuer * quote;
    const thesauriert = gewinnNachSteuer - ausschuettungBrutto;

    // === Stufe 2: Besteuerung beim Gesellschafter ===
    let stufe2Steuer = 0;
    let bemessungsgrundlage = 0;
    let sparerpauschbetrag = 0;
    let kirchensteuer = 0;
    let soliStufe2 = 0;

    if (ausschuettungBrutto > 0) {
      if (verfahren === 'abgeltung') {
        // Variante A – Abgeltungsteuer (Privatvermögen)
        sparerpauschbetrag = verheiratet ? SPARERPAUSCHBETRAG_VERHEIRATET : SPARERPAUSCHBETRAG_LEDIG;
        bemessungsgrundlage = Math.max(0, ausschuettungBrutto - sparerpauschbetrag);
        const kapSt = bemessungsgrundlage * ABGELTUNGSTEUER;
        soliStufe2 = kapSt * SOLI_SATZ;
        // Kirchensteuer mindert über Sonderausgabenabzug die KapSt geringfügig – hier vereinfacht additiv
        kirchensteuer = kirche ? kapSt * kirchensteuerSatz : 0;
        stufe2Steuer = kapSt + soliStufe2 + kirchensteuer;
      } else {
        // Variante B – Teileinkünfteverfahren (Betriebsvermögen)
        bemessungsgrundlage = ausschuettungBrutto * TEV_STEUERPFLICHTIG;
        const est = bemessungsgrundlage * (grenzsteuersatz / 100);
        soliStufe2 = 0; // Soli auf ESt nur bei sehr hohen Einkommen – im TEV-Teilbetrag i. d. R. unbeachtlich, hier konservativ 0
        kirchensteuer = kirche ? est * kirchensteuerSatz : 0;
        stufe2Steuer = est + kirchensteuer;
      }
    }

    const nettoBeimGesellschafter = ausschuettungBrutto - stufe2Steuer;

    // === Gesamtbetrachtung ===
    const gesamtSteuer = stufe1Steuer + stufe2Steuer;
    // Gesamtbelastung bezogen auf den ursprünglichen Gewinn vor Steuern
    const gesamtbelastungProzent = gewinn > 0 ? (gesamtSteuer / gewinn) * 100 : 0;
    // Was vom ursprünglichen Gewinn beim Gesellschafter + thesauriert verbleibt
    const verbleibtGesamt = nettoBeimGesellschafter + thesauriert;

    return {
      // Stufe 1
      kSt,
      soliKSt,
      steuermessbetrag,
      gewerbesteuer,
      stufe1Steuer,
      stufe1SatzProzent,
      gewinnNachSteuer,
      // Ausschüttung
      ausschuettungBrutto,
      thesauriert,
      // Stufe 2
      sparerpauschbetrag,
      bemessungsgrundlage,
      soliStufe2,
      kirchensteuer,
      stufe2Steuer,
      nettoBeimGesellschafter,
      // Gesamt
      gesamtSteuer,
      gesamtbelastungProzent,
      verbleibtGesamt,
    };
  }, [gewinn, hebesatz, ausschuettungsquote, verfahren, grenzsteuersatz, verheiratet, kirche, kirchensteuerSatz]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuroExakt = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Gewinn */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gewinn der GmbH (vor Steuern)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jahresgewinn vor Körperschaft- und Gewerbesteuer
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={gewinn}
              onChange={(e) => setGewinn(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={gewinn}
            onChange={(e) => setGewinn(Number(e.target.value))}
            className="w-full mt-3 accent-indigo-500"
            min="0"
            max="500000"
            step="5000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>250.000 €</span>
            <span>500.000 €</span>
          </div>
        </div>

        {/* Hebesatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gewerbesteuer-Hebesatz der Gemeinde</span>
            <span className="text-xs text-gray-500 block mt-1">
              Standortabhängig (mind. 200 %). Bundesweiter Durchschnitt 2024 rund 409 % (Destatis) – bitte den Hebesatz Ihrer Gemeinde eintragen.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={hebesatz}
              onChange={(e) => setHebesatz(Math.max(200, Math.min(900, Number(e.target.value))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="200"
              max="900"
              step="5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">%</span>
          </div>
          <input
            type="range"
            value={hebesatz}
            onChange={(e) => setHebesatz(Number(e.target.value))}
            className="w-full mt-3 accent-indigo-500"
            min="200"
            max="600"
            step="5"
          />
        </div>

        {/* Ausschüttungsquote */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ausschüttungsquote</span>
            <span className="text-xs text-gray-500 block mt-1">
              Anteil des Nachsteuergewinns, der an die Gesellschafter ausgeschüttet wird. Der Rest verbleibt thesauriert in der GmbH.
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={ausschuettungsquote}
              onChange={(e) => setAusschuettungsquote(Number(e.target.value))}
              className="flex-1 accent-indigo-500"
              min="0"
              max="100"
              step="5"
            />
            <span className="text-lg font-bold text-indigo-700 w-16 text-right">{ausschuettungsquote} %</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[0, 50, 100].map((q) => (
              <button
                key={q}
                onClick={() => setAusschuettungsquote(q)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  ausschuettungsquote === q
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {q === 0 ? 'Voll thesaurieren (0 %)' : q === 100 ? 'Voll ausschütten (100 %)' : '50 %'}
              </button>
            ))}
          </div>
        </div>

        {/* Verfahren Stufe 2 */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Besteuerung der Ausschüttung</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wie wird die Gewinnausschüttung beim Gesellschafter besteuert?
            </span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setVerfahren('abgeltung')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                verfahren === 'abgeltung'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧑‍💼</span>
                <div>
                  <div className="font-semibold">Abgeltungsteuer (Privatvermögen)</div>
                  <div className="text-xs opacity-80">25 % + Soli = 26,375 %, Sparer-Pauschbetrag</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setVerfahren('tev')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                verfahren === 'tev'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <div className="font-semibold">Teileinkünfteverfahren (Betriebsvermögen)</div>
                  <div className="text-xs opacity-80">60 % steuerpflichtig × persönl. Grenzsteuersatz</div>
                </div>
              </div>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Das Teileinkünfteverfahren ist auf Antrag möglich, wenn Sie zu mindestens 25 % beteiligt sind oder
            zu mindestens 1 % beteiligt und beruflich für die GmbH tätig sind (§ 32d Abs. 2 Nr. 3 EStG).
          </p>
        </div>

        {/* Grenzsteuersatz – nur TEV */}
        {verfahren === 'tev' && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-xl">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Ihr persönlicher Grenzsteuersatz (ESt)</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={grenzsteuersatz}
                onChange={(e) => setGrenzsteuersatz(Number(e.target.value))}
                className="flex-1 accent-indigo-500"
                min="14"
                max="45"
                step="1"
              />
              <span className="text-lg font-bold text-indigo-800 w-16 text-right">{grenzsteuersatz} %</span>
            </div>
            <p className="text-xs text-indigo-700 mt-2">
              💡 Beim Teileinkünfteverfahren werden 60 % der Ausschüttung mit Ihrem persönlichen
              Einkommensteuersatz belastet (Spitzensteuersatz 42 %, Reichensteuer 45 %).
            </p>
          </div>
        )}

        {/* Persönliche Situation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={verheiratet}
              onChange={(e) => setVerheiratet(e.target.checked)}
              className="w-5 h-5 rounded accent-indigo-500"
            />
            <span className="text-sm text-gray-700">
              Zusammenveranlagt
              {verfahren === 'abgeltung' && (
                <span className="block text-xs text-gray-500">Sparer-Pauschbetrag 2.000 € statt 1.000 €</span>
              )}
            </span>
          </label>
          <div className="p-3 bg-gray-50 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={kirche}
                onChange={(e) => setKirche(e.target.checked)}
                className="w-5 h-5 rounded accent-indigo-500"
              />
              <span className="text-sm text-gray-700">Kirchensteuerpflichtig</span>
            </label>
            {kirche && (
              <select
                value={kirchensteuerSatz}
                onChange={(e) => setKirchensteuerSatz(Number(e.target.value))}
                className="w-full mt-2 py-1.5 px-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500"
              >
                <option value={0.09}>9 % (die meisten Bundesländer)</option>
                <option value={0.08}>8 % (Bayern, Baden-Württemberg)</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏦 Gesamtsteuerbelastung der GmbH</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatProzent(ergebnis.gesamtbelastungProzent)}</span>
            <span className="text-xl opacity-80">vom Gewinn</span>
          </div>
          <p className="text-indigo-100 mt-2 text-sm">
            {formatEuro(ergebnis.gesamtSteuer)} Steuern auf {formatEuro(gewinn)} Gewinn
            {ausschuettungsquote < 100 && ` (bei ${ausschuettungsquote} % Ausschüttung)`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Stufe 1 – Gesellschaft</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.stufe1Steuer)}</div>
            <div className="text-xs opacity-70">{formatProzent(ergebnis.stufe1SatzProzent)} des Gewinns</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Stufe 2 – Gesellschafter</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.stufe2Steuer)}</div>
            <div className="text-xs opacity-70">auf die Ausschüttung</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Netto beim Gesellschafter</span>
            <span className="text-lg font-bold">{formatEuro(ergebnis.nettoBeimGesellschafter)}</span>
          </div>
          {ergebnis.thesauriert > 0 && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20">
              <span className="text-sm opacity-80">Thesauriert in der GmbH</span>
              <span className="text-lg font-bold">{formatEuro(ergebnis.thesauriert)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>

        <div className="space-y-3 text-sm">
          {/* Stufe 1 */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Stufe 1 – Besteuerung auf GmbH-Ebene
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gewinn vor Steuern</span>
            <span className="font-bold text-gray-900">{formatEuro(gewinn)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Körperschaftsteuer (15 %)</span>
            <span>{formatEuroExakt(ergebnis.kSt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Solidaritätszuschlag (5,5 % auf KSt)</span>
            <span>{formatEuroExakt(ergebnis.soliKSt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Gewerbesteuer (3,5 % × {hebesatz} %)</span>
            <span>{formatEuroExakt(ergebnis.gewerbesteuer)}</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">= Gewinn nach Steuern (thesaurierbar)</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.gewinnNachSteuer)}</span>
          </div>
          <p className="text-xs text-gray-500">
            Belastung Stufe 1: {formatProzent(ergebnis.stufe1SatzProzent)} (bei Hebesatz 400 % rund 29,8 %).
          </p>

          {/* Ausschüttung */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Ausschüttung
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Ausschüttung brutto ({ausschuettungsquote} %)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.ausschuettungBrutto)}</span>
          </div>
          {ergebnis.thesauriert > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-gray-500">
              <span>davon thesauriert (in der GmbH belassen)</span>
              <span>{formatEuro(ergebnis.thesauriert)}</span>
            </div>
          )}

          {/* Stufe 2 */}
          {ergebnis.ausschuettungBrutto > 0 && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                Stufe 2 – Besteuerung beim Gesellschafter ({verfahren === 'abgeltung' ? 'Abgeltungsteuer' : 'Teileinkünfteverfahren'})
              </div>

              {verfahren === 'abgeltung' ? (
                <>
                  {ergebnis.sparerpauschbetrag > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                      <span>− Sparer-Pauschbetrag</span>
                      <span>{formatEuro(ergebnis.sparerpauschbetrag)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Steuerpflichtige Ausschüttung</span>
                    <span className="text-gray-900">{formatEuro(ergebnis.bemessungsgrundlage)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
                    <span>− Kapitalertragsteuer (25 %) + Soli (5,5 %)</span>
                    <span>{formatEuroExakt(ergebnis.bemessungsgrundlage * ABGELTUNGSTEUER + ergebnis.soliStufe2)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Steuerpflichtig (60 % der Ausschüttung)</span>
                    <span className="text-gray-900">{formatEuro(ergebnis.bemessungsgrundlage)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
                    <span>− Einkommensteuer ({grenzsteuersatz} % Grenzsteuersatz)</span>
                    <span>{formatEuroExakt(ergebnis.bemessungsgrundlage * (grenzsteuersatz / 100))}</span>
                  </div>
                </>
              )}

              {ergebnis.kirchensteuer > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
                  <span>− Kirchensteuer</span>
                  <span>{formatEuroExakt(ergebnis.kirchensteuer)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 bg-green-50 -mx-6 px-6 rounded-b-xl">
                <span className="font-medium text-green-700">= Netto beim Gesellschafter</span>
                <span className="font-bold text-green-900">{formatEuro(ergebnis.nettoBeimGesellschafter)}</span>
              </div>
            </>
          )}

          {/* Gesamt */}
          <div className="flex justify-between py-3 bg-indigo-100 -mx-6 px-6 mt-2">
            <span className="font-bold text-indigo-800">Gesamtsteuerbelastung</span>
            <div className="text-right">
              <span className="font-bold text-2xl text-indigo-900 block">{formatProzent(ergebnis.gesamtbelastungProzent)}</span>
              <span className="text-xs text-indigo-700">{formatEuro(ergebnis.gesamtSteuer)} Steuern</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hinweis / Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Schätzung ohne Gewähr – ersetzt keine Steuerberatung.</strong> Der Rechner zeigt die
              kombinierte Belastung aus Körperschaft-, Gewerbe- und Anteilseignersteuer in vereinfachter Form.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              Der Gewerbeertrag wird vereinfacht mit dem Gewinn gleichgesetzt – gewerbesteuerliche
              <strong> Hinzurechnungen und Kürzungen</strong> (§ 8, § 9 GewStG) bleiben unberücksichtigt.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              Ein <strong>Geschäftsführergehalt</strong> mindert als Betriebsausgabe den GmbH-Gewinn und wird
              separat als Arbeitslohn versteuert – das ist hier nicht abgebildet.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              Beim Teileinkünfteverfahren wird der Solidaritätszuschlag konservativ mit 0 € angesetzt; je nach
              Gesamteinkommen kann zusätzlich Soli anfallen.
            </span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen (Stand: 2026)</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/kstg_1977/__23.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 23 KStG – Steuersatz Körperschaftsteuer (15 %)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gewstg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Gewerbesteuergesetz (GewStG) – Steuermesszahl & Hebesatz
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__32d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 32d EStG – Gesonderter Steuertarif (Abgeltungsteuer) & Teileinkünfte-Option
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__3.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 3 Nr. 40 EStG – Teileinkünfteverfahren (40 % steuerfrei)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/solzg_1995/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Solidaritätszuschlaggesetz (SolzG)
          </a>
          <a
            href="https://www.bundesfinanzministerium.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium der Finanzen
          </a>
        </div>
      </div>
    </div>
  );
}
