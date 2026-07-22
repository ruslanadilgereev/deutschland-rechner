import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Rechtsstand ab 01.07.2025, maßgeblich für 2026) ===
// Alle Konstanten aus amtlichen Primärquellen (gesetze-im-internet.de).

// Gemeinsamer Jahresbetrag Verhinderungs- + Kurzzeitpflege (ab Pflegegrad 2)
// Quelle: § 42a Abs. 1 SGB XI — https://www.gesetze-im-internet.de/sgb_11/__42a.html
const GEMEINSAMER_JAHRESBETRAG = 3539; // EUR je Kalenderjahr, gemeinsam für VP (§39) und KZP (§42)

// Höchstdauer Verhinderungspflege
// Quelle: § 39 Abs. 1 SGB XI — https://www.gesetze-im-internet.de/sgb_11/__39.html
const MAX_WOCHEN_VERHINDERUNGSPFLEGE = 8; // Wochen je Kalenderjahr

// Höchstdauer Kurzzeitpflege
// Quelle: § 42 Abs. 2 SGB XI — https://www.gesetze-im-internet.de/sgb_11/__42.html
const MAX_WOCHEN_KURZZEITPFLEGE = 8; // Wochen je Kalenderjahr

// Pflegegeld-Weiterzahlung während VP/KZP: die Hälfte, je bis zu 8 Wochen/Jahr
// Quelle: § 37 Abs. 2 SGB XI — https://www.gesetze-im-internet.de/sgb_11/__37.html
const PFLEGEGELD_WEITERZAHLUNG_SATZ = 0.5; // 50 % des bisher bezogenen Pflegegeldes

// Entlastungsbetrag (häusliche Pflege), u. a. für Kurzzeitpflege einsetzbar
// Quelle: § 45b Abs. 1 SGB XI — https://www.gesetze-im-internet.de/sgb_11/__45b.html
const ENTLASTUNGSBETRAG_MONAT = 131; // EUR monatlich

export default function VerhinderungspflegeRechner() {
  // Pflegegrad (nur 2–5 haben Anspruch auf den gemeinsamen Jahresbetrag, § 42a Abs. 1)
  const [pflegegrad, setPflegegrad] = useState(3);

  // Monatliches Pflegegeld (§ 37 Abs. 1) — vom Nutzer eingegeben, da abhängig vom Pflegegrad.
  // (Die genauen Euro-Beträge werden hier NICHT hartcodiert; siehe Pflegegeld-Rechner.)
  const [monatlichesPflegegeld, setMonatlichesPflegegeld] = useState(599);

  // Bereits im laufenden Kalenderjahr genutztes Budget
  const [genutztVerhinderungspflege, setGenutztVerhinderungspflege] = useState(0);
  const [genutztKurzzeitpflege, setGenutztKurzzeitpflege] = useState(0);

  // Bereits genutzte Wochen (Dauergrenzen, unabhängig je Leistung)
  const [wochenGenutztVp, setWochenGenutztVp] = useState(0);
  const [wochenGenutztKzp, setWochenGenutztKzp] = useState(0);

  // Entlastungsbetrag zusätzlich einbeziehen (v. a. für Kurzzeitpflege)
  const [entlastungEinbeziehen, setEntlastungEinbeziehen] = useState(false);
  const [entlastungRest, setEntlastungRest] = useState(0);

  const ergebnis = useMemo(() => {
    // === 1. Gemeinsamer Jahresbetrag: Rest berechnen ===
    // verfügbar = 3.539 € − bereits genutzte VP − bereits genutzte KZP (Summe max. 3.539 €)
    const bereitsGenutzt = genutztVerhinderungspflege + genutztKurzzeitpflege;
    const verfuegbaresBudget = Math.max(0, GEMEINSAMER_JAHRESBETRAG - bereitsGenutzt);
    const budgetAusgeschoepft = bereitsGenutzt >= GEMEINSAMER_JAHRESBETRAG;

    // === 2. Entlastungsbetrag (optional, § 45b) hinzurechnen ===
    const entlastungBetrag = entlastungEinbeziehen ? Math.max(0, entlastungRest) : 0;
    const nutzbaresGesamtbudget = verfuegbaresBudget + entlastungBetrag;

    // === 3. Verbleibende Wochen je Leistung (unabhängige 8-Wochen-Grenzen) ===
    const verbleibendeWochenVp = Math.max(0, MAX_WOCHEN_VERHINDERUNGSPFLEGE - wochenGenutztVp);
    const verbleibendeWochenKzp = Math.max(0, MAX_WOCHEN_KURZZEITPFLEGE - wochenGenutztKzp);

    // === 4. Pflegegeld-Weiterzahlung: 50 % während VP/KZP (§ 37 Abs. 2) ===
    const pflegegeldWaehrend = monatlichesPflegegeld * PFLEGEGELD_WEITERZAHLUNG_SATZ;

    return {
      bereitsGenutzt,
      verfuegbaresBudget,
      budgetAusgeschoepft,
      entlastungBetrag,
      nutzbaresGesamtbudget,
      verbleibendeWochenVp,
      verbleibendeWochenKzp,
      pflegegeldWaehrend,
    };
  }, [
    pflegegrad,
    monatlichesPflegegeld,
    genutztVerhinderungspflege,
    genutztKurzzeitpflege,
    wochenGenutztVp,
    wochenGenutztKzp,
    entlastungEinbeziehen,
    entlastungRest,
  ]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Pflegegrad */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Pflegegrad</span>
            <span className="text-xs text-gray-500 block mt-1">
              Erst ab Pflegegrad 2 besteht Anspruch auf den gemeinsamen Jahresbetrag (§ 42a Abs. 1 SGB XI)
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5].map((pg) => (
              <button
                key={pg}
                onClick={() => setPflegegrad(pg)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  pflegegrad === pg
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                PG {pg}
              </button>
            ))}
          </div>
        </div>

        {/* Monatliches Pflegegeld */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliches Pflegegeld (§ 37 Abs. 1 SGB XI)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Ihr Pflegegeld je nach Pflegegrad – der genaue Betrag steht im{' '}
              <a href="/pflegegeld-rechner" className="text-teal-600 hover:underline">
                Pflegegeld-Rechner
              </a>
              . Wer nur Sachleistungen bezieht, trägt 0 € ein.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={monatlichesPflegegeld}
              onChange={(e) => setMonatlichesPflegegeld(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              max="1000"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Bereits genutztes Budget */}
        <h3 className="font-bold text-gray-800 mb-1">Bereits genutzt in diesem Kalenderjahr</h3>
        <p className="text-xs text-gray-500 mb-4">
          Verhinderungs- und Kurzzeitpflege teilen sich <strong>ein</strong> gemeinsames Budget von{' '}
          {formatEuroRound(GEMEINSAMER_JAHRESBETRAG)}. Tragen Sie ein, was Sie in diesem Jahr schon
          abgerufen haben.
        </p>

        {/* Genutzt VP */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bereits genutzte Verhinderungspflege (§ 39)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={genutztVerhinderungspflege}
              onChange={(e) => setGenutztVerhinderungspflege(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              max="3539"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€ / Jahr</span>
          </div>
        </div>

        {/* Genutzt KZP */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bereits genutzte Kurzzeitpflege (§ 42)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={genutztKurzzeitpflege}
              onChange={(e) => setGenutztKurzzeitpflege(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              max="3539"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€ / Jahr</span>
          </div>
        </div>

        {/* Genutzte Wochen */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Genutzte Wochen VP</span>
              <span className="text-xs text-gray-500 block">von {MAX_WOCHEN_VERHINDERUNGSPFLEGE} Wochen</span>
            </label>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setWochenGenutztVp(Math.max(0, wochenGenutztVp - 1))}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-800 w-6 text-center">{wochenGenutztVp}</span>
              <button
                onClick={() => setWochenGenutztVp(Math.min(MAX_WOCHEN_VERHINDERUNGSPFLEGE, wochenGenutztVp + 1))}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Genutzte Wochen KZP</span>
              <span className="text-xs text-gray-500 block">von {MAX_WOCHEN_KURZZEITPFLEGE} Wochen</span>
            </label>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setWochenGenutztKzp(Math.max(0, wochenGenutztKzp - 1))}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-800 w-6 text-center">{wochenGenutztKzp}</span>
              <button
                onClick={() => setWochenGenutztKzp(Math.min(MAX_WOCHEN_KURZZEITPFLEGE, wochenGenutztKzp + 1))}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Entlastungsbetrag */}
        <div className="mb-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={entlastungEinbeziehen}
              onChange={(e) => setEntlastungEinbeziehen(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <div>
              <span className="text-gray-700 font-medium">
                Entlastungsbetrag (§ 45b) zusätzlich einbeziehen
              </span>
              <span className="text-xs text-gray-500 block">
                Bis zu {ENTLASTUNGSBETRAG_MONAT} € / Monat, ansparbar. Ausdrücklich für Kurzzeitpflege
                einsetzbar; für Verhinderungspflege nur über Umwidmung – bitte mit der Pflegekasse klären.
              </span>
            </div>
          </label>
          {entlastungEinbeziehen && (
            <div className="mt-3 relative">
              <label className="block mb-2">
                <span className="text-sm text-gray-700">Angesparter Rest Entlastungsbetrag</span>
              </label>
              <input
                type="number"
                value={entlastungRest}
                onChange={(e) => setEntlastungRest(Math.max(0, Number(e.target.value)))}
                className="w-full text-lg font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
                min="0"
                step="10"
              />
              <span className="absolute right-4 bottom-3 text-gray-400 text-sm">€</span>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🤝 Verfügbares Rest-Budget (gemeinsamer Jahresbetrag)</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.verfuegbaresBudget)}</span>
            <span className="text-xl opacity-80">/ Kalenderjahr</span>
          </div>
          <p className="text-teal-100 mt-2 text-sm">
            von {formatEuroRound(GEMEINSAMER_JAHRESBETRAG)} gemeinsamem Jahresbetrag (Verhinderungs- +
            Kurzzeitpflege), Pflegegrad {pflegegrad}
          </p>
          {ergebnis.budgetAusgeschoepft && (
            <p className="text-amber-100 mt-2 text-sm font-medium">
              ⚠️ Der gemeinsame Jahresbetrag ist für dieses Kalenderjahr bereits ausgeschöpft.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Verbleibende Wochen Verhinderungspflege</span>
            <div className="text-xl font-bold">
              {ergebnis.verbleibendeWochenVp} von {MAX_WOCHEN_VERHINDERUNGSPFLEGE}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Verbleibende Wochen Kurzzeitpflege</span>
            <div className="text-xl font-bold">
              {ergebnis.verbleibendeWochenKzp} von {MAX_WOCHEN_KURZZEITPFLEGE}
            </div>
          </div>
        </div>

        {ergebnis.entlastungBetrag > 0 && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Nutzbares Gesamtbudget inkl. Entlastungsbetrag</span>
              <span className="text-lg font-bold">{formatEuroRound(ergebnis.nutzbaresGesamtbudget)}</span>
            </div>
          </div>
        )}

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Weitergezahltes Pflegegeld während VP/KZP (50 %)</span>
            <span className="text-lg font-bold">{formatEuroRound(ergebnis.pflegegeldWaehrend)} / Monat</span>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Gemeinsamer Jahresbetrag (§ 42a SGB XI)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gemeinsamer Jahresbetrag (ab PG 2)</span>
            <span className="font-bold text-gray-900">{formatEuro(GEMEINSAMER_JAHRESBETRAG)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">− Bereits genutzte Verhinderungspflege</span>
            <span className="text-red-600">−{formatEuro(genutztVerhinderungspflege)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">− Bereits genutzte Kurzzeitpflege</span>
            <span className="text-red-600">−{formatEuro(genutztKurzzeitpflege)}</span>
          </div>
          <div className="flex justify-between py-2 bg-teal-50 -mx-6 px-6">
            <span className="font-medium text-teal-700">= Verfügbares Rest-Budget</span>
            <span className="font-bold text-teal-900">{formatEuro(ergebnis.verfuegbaresBudget)}</span>
          </div>

          {ergebnis.entlastungBetrag > 0 && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">+ Entlastungsbetrag (§ 45b, angespart)</span>
                <span className="text-green-600">+{formatEuro(ergebnis.entlastungBetrag)}</span>
              </div>
              <div className="flex justify-between py-2 bg-teal-50 -mx-6 px-6">
                <span className="font-medium text-teal-700">= Nutzbares Gesamtbudget</span>
                <span className="font-bold text-teal-900">{formatEuro(ergebnis.nutzbaresGesamtbudget)}</span>
              </div>
            </>
          )}

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Pflegegeld-Weiterzahlung (§ 37 Abs. 2 SGB XI)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Monatliches Pflegegeld</span>
            <span className="text-gray-900">{formatEuro(monatlichesPflegegeld)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">× 50 % während VP/KZP (je bis 8 Wochen)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.pflegegeldWaehrend)}</span>
          </div>
        </div>
      </div>

      {/* Info: So funktioniert das gemeinsame Budget */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert das gemeinsame Budget</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Ein gemeinsamer Topf:</strong> Seit 01.07.2025 teilen sich Verhinderungspflege
              (§ 39) und Kurzzeitpflege (§ 42) einen gemeinsamen Jahresbetrag von{' '}
              {formatEuroRound(GEMEINSAMER_JAHRESBETRAG)} (§ 42a). Sie können ihn flexibel aufteilen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Zwei Wochen-Grenzen:</strong> Verhinderungspflege maximal 8 Wochen, Kurzzeitpflege
              maximal 8 Wochen je Kalenderjahr – die Wochen zählen getrennt, das Geld teilen sie sich.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Halbes Pflegegeld läuft weiter:</strong> Während VP oder KZP wird die Hälfte des
              Pflegegeldes je bis zu 8 Wochen weitergezahlt (§ 37 Abs. 2).
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Keine Vorpflegezeit mehr:</strong> Die frühere 6-Monats-Wartezeit für
              Verhinderungspflege ist zum 01.07.2025 entfallen.
            </span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Näherung:</strong> Dieser Rechner bildet die Budget-Obergrenzen ab. Erstattet
              werden nur tatsächlich entstandene, nachgewiesene Kosten – die Pflegekasse entscheidet
              verbindlich.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Pflegegrad 1:</strong> Kein Anspruch auf den gemeinsamen Jahresbetrag – nur der
              Entlastungsbetrag (§ 45b) steht zur Verfügung.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Entlastungsbetrag für Verhinderungspflege:</strong> Ausdrücklich ist § 45b nur
              für Kurzzeitpflege genannt; eine Umwidmung für Verhinderungspflege ist gesondert mit der
              Pflegekasse zu klären.
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <p className="text-sm text-gray-600">
          <strong>Schätzung – keine Rechts- oder Steuerberatung.</strong> Die tatsächliche
          Bewilligung und Höhe der Leistungen legt Ihre Pflegekasse verbindlich fest. Rechtsstand:
          Gemeinsamer Jahresbetrag nach § 42a SGB XI ab 01.07.2025.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_11/__42a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 42a SGB XI – Gemeinsamer Jahresbetrag (3.539 €)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_11/__39.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 39 SGB XI – Verhinderungspflege (8 Wochen)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_11/__42.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 42 SGB XI – Kurzzeitpflege (8 Wochen)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_11/__37.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 37 SGB XI – Pflegegeld & 50 %-Weiterzahlung
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_11/__45b.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 45b SGB XI – Entlastungsbetrag (131 €/Monat)
          </a>
          <a
            href="https://www.bundesgesundheitsministerium.de/presse/pressemitteilungen/das-aendert-sich-zum-1-juli-in-der-pflege"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMG – Gemeinsames Budget ab 1. Juli 2025
          </a>
        </div>
      </div>
    </div>
  );
}
