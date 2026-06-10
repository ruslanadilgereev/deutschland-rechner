import { useState, useMemo } from 'react';

// ════════════════════════════════════════════════════════════════════
// Einkommensteuer-Rechner für Selbstständige & Freiberufler 2026
// Tarif nach §32a EStG 2026, Soli mit Freigrenze 2026, Vorauszahlung §37 EStG
// Quellen: §32a EStG, §37 EStG, BMF (Stand 2026)
// ════════════════════════════════════════════════════════════════════

// §32a EStG 2026 – Grundfreibetrag und Tarifzonen (Stand 2026)
const GRUNDFREIBETRAG_2026 = 12348; // Zone 0: bis 12.348 € steuerfrei
const ZONE1_ENDE = 17799; // Zone 1: 12.349 – 17.799 €
const ZONE2_ENDE = 69878; // Zone 2: 17.800 – 69.878 €
const ZONE3_ENDE = 277825; // Zone 3: 69.879 – 277.825 €
// Zone 4: ab 277.826 €

// Solidaritätszuschlag 2026 – Freigrenze (steigt mit Grundfreibetrag)
// Soli fällt erst an, wenn die ESt diese Grenze überschreitet
const SOLI_FREIGRENZE_EINZEL = 20350; // 2026 (2025 waren es 19.950 €)
const SOLI_FREIGRENZE_ZUSAMMEN = 40700; // 2026 (2025 waren es 39.900 €)
const SOLI_SATZ = 0.055; // 5,5 %
const SOLI_MILDERUNG = 0.119; // 11,9 % Milderungszone (Überleitung)

// Vorauszahlung §37 EStG – Festsetzungsgrenzen
const VORAUSZAHLUNG_MIN_JAHR = 400; // ab 400 €/Jahr werden Vorauszahlungen festgesetzt
const VORAUSZAHLUNG_MIN_QUARTAL = 100; // und mindestens 100 €/Quartal

// Berechnung Einkommensteuer nach §32a EStG 2026
// verheiratet => Splittingtarif (zvE halbieren, Steuer berechnen, verdoppeln)
function berechneEinkommensteuer(zvE: number, verheiratet: boolean): number {
  const faktor = verheiratet ? 2 : 1;
  const x = Math.floor(zvE / faktor); // §32a: auf vollen Euro abgerundet

  if (x <= 0) return 0;

  let steuer = 0;
  if (x <= GRUNDFREIBETRAG_2026) {
    steuer = 0;
  } else if (x <= ZONE1_ENDE) {
    // Zone 1: 14 % – 24 % progressiv
    const y = (x - GRUNDFREIBETRAG_2026) / 10000;
    steuer = (914.51 * y + 1400) * y;
  } else if (x <= ZONE2_ENDE) {
    // Zone 2: 24 % – 42 % progressiv
    const z = (x - ZONE1_ENDE) / 10000;
    steuer = (173.10 * z + 2397) * z + 1034.87;
  } else if (x <= ZONE3_ENDE) {
    // Zone 3: 42 % Spitzensteuersatz
    steuer = 0.42 * x - 11135.63;
  } else {
    // Zone 4: 45 % Reichensteuer
    steuer = 0.45 * x - 19470.38;
  }

  // §32a EStG: Steuerbetrag auf vollen Euro abrunden
  return Math.floor(steuer) * faktor;
}

// Grenzsteuersatz – Ableitung des Tarifs an der Stelle zvE
function berechneGrenzsteuersatz(zvE: number, verheiratet: boolean): number {
  const faktor = verheiratet ? 2 : 1;
  const x = zvE / faktor;

  if (x <= GRUNDFREIBETRAG_2026) return 0;
  if (x <= ZONE1_ENDE) {
    // Grenzsteuersatz = Ableitung des Tarifs (Zone 1)
    const y = (x - GRUNDFREIBETRAG_2026) / 10000;
    return Math.min(24, (2 * 914.51 * y + 1400) / 100);
  }
  if (x <= ZONE2_ENDE) {
    // Grenzsteuersatz = Ableitung des Tarifs (Zone 2)
    const z = (x - ZONE1_ENDE) / 10000;
    return Math.min(42, (2 * 173.10 * z + 2397) / 100);
  }
  if (x <= ZONE3_ENDE) return 42;
  return 45;
}

// Solidaritätszuschlag 2026 mit Freigrenze und Milderungszone
function berechneSoli(einkommensteuer: number, verheiratet: boolean): number {
  const freigrenze = verheiratet ? SOLI_FREIGRENZE_ZUSAMMEN : SOLI_FREIGRENZE_EINZEL;
  if (einkommensteuer <= freigrenze) return 0;
  // Milderungszone: Soli max. 11,9 % der Differenz zur Freigrenze,
  // gedeckelt durch 5,5 % der ESt
  const milderung = SOLI_MILDERUNG * (einkommensteuer - freigrenze);
  const voll = SOLI_SATZ * einkommensteuer;
  return Math.round(Math.min(voll, milderung) * 100) / 100;
}

// Kirchensteuer (8 % oder 9 % der ESt)
function berechneKirchensteuer(einkommensteuer: number, satz: number): number {
  return Math.round(einkommensteuer * satz * 100) / 100;
}

export function EinkommensteuerSelbststaendigeRechner() {
  // Eingaben
  const [gewinn, setGewinn] = useState(45000); // Jahresgewinn (Einkünfte aus selbst. Arbeit / Gewerbebetrieb)
  const [vorsorge, setVorsorge] = useState(0); // abziehbare Vorsorgeaufwendungen (Sonderausgaben)
  const [verheiratet, setVerheiratet] = useState(false);
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0);

  // Optionale grobe Sozialversicherung (reine EUR-Eingaben, keine ESt-Wirkung außer als Info)
  const [kvPkv, setKvPkv] = useState(0); // KV freiwillig / PKV pro Monat
  const [rvFreiwillig, setRvFreiwillig] = useState(0); // RV freiwillig pro Monat

  const ergebnis = useMemo(() => {
    // 1. Zu versteuerndes Einkommen (vereinfacht): Gewinn − abziehbare Vorsorge
    const zvE = Math.max(0, gewinn - vorsorge);

    // 2. Einkommensteuer nach §32a EStG 2026
    const einkommensteuer = berechneEinkommensteuer(zvE, verheiratet);

    // 3. Solidaritätszuschlag 2026 (Freigrenze + Milderungszone)
    const soli = berechneSoli(einkommensteuer, verheiratet);
    const soliFreigrenze = verheiratet ? SOLI_FREIGRENZE_ZUSAMMEN : SOLI_FREIGRENZE_EINZEL;

    // 4. Kirchensteuer
    const kirchensteuer = berechneKirchensteuer(einkommensteuer, kirchensteuerSatz);

    // 5. Gesamte Jahressteuer (ESt + Soli + KiSt)
    const steuerGesamt = einkommensteuer + soli + kirchensteuer;

    // 6. Steuersätze
    const grenzsteuersatz = berechneGrenzsteuersatz(zvE, verheiratet);
    const durchschnittssteuersatz = zvE > 0 ? (einkommensteuer / zvE) * 100 : 0;

    // 7. Vorauszahlungen §37 EStG – pro Quartal (10.03 / 10.06 / 10.09 / 10.12)
    // Bemessung: festgesetzte Jahres-ESt (zzgl. Soli/KiSt) / 4
    const vorauszahlungBasis = einkommensteuer + soli + kirchensteuer;
    const quartalsRate = Math.round((vorauszahlungBasis / 4) * 100) / 100;

    // Festsetzungsregel §37 Abs. 5 EStG: mind. 400 €/Jahr UND mind. 100 €/Quartal
    const vorauszahlungWirdFestgesetzt =
      vorauszahlungBasis >= VORAUSZAHLUNG_MIN_JAHR &&
      quartalsRate >= VORAUSZAHLUNG_MIN_QUARTAL;

    // 8. Grobe Sozialversicherung (optional, nur Information)
    const svMonat = kvPkv + rvFreiwillig;
    const svJahr = svMonat * 12;

    // 9. Übrig nach Steuern (vor SV) und nach Steuern + SV
    const nachSteuern = gewinn - steuerGesamt;
    const nachSteuernUndSv = nachSteuern - svJahr;

    return {
      zvE,
      einkommensteuer,
      soli,
      soliFreigrenze,
      kirchensteuer,
      steuerGesamt,
      grenzsteuersatz,
      durchschnittssteuersatz,
      quartalsRate,
      vorauszahlungBasis,
      vorauszahlungWirdFestgesetzt,
      svMonat,
      svJahr,
      nachSteuern,
      nachSteuernUndSv,
      monatlichNachSteuern: Math.round(nachSteuern / 12),
    };
  }, [gewinn, vorsorge, verheiratet, kirchensteuerSatz, kvPkv, rvFreiwillig]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuro2 = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) => n.toFixed(1).replace('.', ',') + ' %';

  const quartale = [
    { datum: '10. März', label: '1. Quartal' },
    { datum: '10. Juni', label: '2. Quartal' },
    { datum: '10. September', label: '3. Quartal' },
    { datum: '10. Dezember', label: '4. Quartal' },
  ];

  return (
    <div className="max-w-2xl mx-auto">

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🧑‍💼</span> Ihre Angaben (Jahreswerte)
        </h3>

        {/* Jahresgewinn */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jahresgewinn</span>
            <span className="text-xs text-gray-500 block mt-1">
              Gewinn aus selbstständiger/freiberuflicher Tätigkeit (Einnahmen − Betriebsausgaben)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={gewinn}
              onChange={(e) => setGewinn(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={gewinn}
            onChange={(e) => setGewinn(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
            min="0"
            max="200000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>100.000 €</span>
            <span>200.000 €</span>
          </div>
        </div>

        {/* Vorsorge / Sonderausgaben */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Abziehbare Vorsorgeaufwendungen</span>
            <span className="text-xs text-gray-500 block mt-1">
              Abziehbarer Anteil aus Kranken-, Pflege- und Rentenversicherung sowie Rürup/Riester (Sonderausgaben)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={vorsorge}
              onChange={(e) => setVorsorge(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>

        {/* Veranlagung + Kirchensteuer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Veranlagung</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setVerheiratet(false)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  !verheiratet
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Einzeln
              </button>
              <button
                onClick={() => setVerheiratet(true)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  verheiratet
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Verheiratet
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Verheiratet = Splittingtarif</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kirchensteuer</label>
            <select
              value={kirchensteuerSatz}
              onChange={(e) => setKirchensteuerSatz(Number(e.target.value))}
              className="w-full py-3 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
            >
              <option value={0}>Keine</option>
              <option value={0.08}>8 % (Bayern, Baden-Württemberg)</option>
              <option value={0.09}>9 % (übrige Bundesländer)</option>
            </select>
          </div>
        </div>

        {/* Optional: grobe Sozialversicherung */}
        <details className="mt-6">
          <summary className="cursor-pointer text-blue-600 font-medium text-sm hover:text-blue-700">
            Optional: monatliche Sozialversicherung (grobe Übersicht)
          </summary>
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">
              Rein informativ – diese Beiträge mindern nicht automatisch die Einkommensteuer. Der
              abziehbare Anteil gehört oben in die Vorsorgeaufwendungen.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kranken-/Pflegeversicherung (freiwillig/PKV)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={kvPkv}
                    onChange={(e) => setKvPkv(Math.max(0, Number(e.target.value)))}
                    className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                    min="0"
                    step="10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/Mon.</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rentenversicherung (freiwillig)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={rvFreiwillig}
                    onChange={(e) => setRvFreiwillig(Math.max(0, Number(e.target.value)))}
                    className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                    min="0"
                    step="10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/Mon.</span>
                </div>
              </div>
            </div>
            {ergebnis.svJahr > 0 && (
              <p className="text-sm text-gray-600">
                Sozialversicherung gesamt: <strong>{formatEuro(ergebnis.svMonat)}/Monat</strong> ={' '}
                <strong>{formatEuro(ergebnis.svJahr)}/Jahr</strong>
              </p>
            )}
          </div>
        </details>
      </div>

      {/* Ergebnis: Quartals-Vorauszahlung im Fokus */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-blue-200 mb-1">
          📅 Vorauszahlung pro Quartal (§ 37 EStG)
        </h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro2(ergebnis.quartalsRate)}</span>
            <span className="text-xl text-blue-200">/ Quartal</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            zu zahlen am 10. März, 10. Juni, 10. September und 10. Dezember
          </p>
        </div>

        {!ergebnis.vorauszahlungWirdFestgesetzt && ergebnis.vorauszahlungBasis > 0 && (
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm mb-4 text-sm">
            ⚠️ Unter den Grenzen des § 37 Abs. 5 EStG (mind. 400 €/Jahr und 100 €/Quartal) – das
            Finanzamt setzt in der Regel <strong>keine</strong> Vorauszahlung fest. Die Steuer wird
            dann erst mit dem Steuerbescheid fällig.
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-blue-200 text-xs block">Jahres-ESt</span>
            <span className="text-lg font-bold">{formatEuro(ergebnis.einkommensteuer)}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-blue-200 text-xs block">Grenzsteuersatz</span>
            <span className="text-lg font-bold">{formatProzent(ergebnis.grenzsteuersatz)}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-blue-200 text-xs block">Durchschnitt</span>
            <span className="text-lg font-bold">{formatProzent(ergebnis.durchschnittssteuersatz)}</span>
          </div>
        </div>
      </div>

      {/* Quartals-Plan */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🗓️ Ihre Quartalstermine 2026</h3>
        <div className="grid grid-cols-2 gap-3">
          {quartale.map((q) => (
            <div key={q.label} className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500">{q.label}</div>
              <div className="font-semibold text-gray-800">{q.datum}</div>
              <div className="text-blue-600 font-bold mt-1">
                {ergebnis.vorauszahlungWirdFestgesetzt ? formatEuro2(ergebnis.quartalsRate) : '–'}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Fällt ein Termin auf ein Wochenende oder einen Feiertag, verschiebt er sich auf den
          nächsten Werktag.
        </p>
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Jahresgewinn</span>
            <span className="font-bold text-gray-900">{formatEuro(gewinn)}</span>
          </div>
          {vorsorge > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− abziehbare Vorsorgeaufwendungen</span>
              <span>{formatEuro(vorsorge)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= Zu versteuerndes Einkommen (zvE)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.zvE)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-3">
            Steuer nach § 32a EStG 2026 {verheiratet ? '(Splittingtarif)' : '(Grundtarif)'}
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Einkommensteuer</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.einkommensteuer)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Solidaritätszuschlag
              {ergebnis.soli === 0 && (
                <span className="text-xs text-green-600 block">
                  Freigrenze {formatEuro(ergebnis.soliFreigrenze)} ESt nicht überschritten
                </span>
              )}
            </span>
            <span className="font-bold text-gray-900">{formatEuro2(ergebnis.soli)}</span>
          </div>
          {ergebnis.kirchensteuer > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Kirchensteuer</span>
              <span className="font-bold text-gray-900">{formatEuro2(ergebnis.kirchensteuer)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 bg-blue-50 -mx-6 px-6">
            <span className="font-bold text-blue-800">= Steuer gesamt (Jahr)</span>
            <span className="font-bold text-blue-900">{formatEuro2(ergebnis.steuerGesamt)}</span>
          </div>

          <div className="flex justify-between py-2 border-t-2 border-blue-200 mt-2">
            <span className="font-medium text-gray-700">Quartals-Vorauszahlung (÷ 4)</span>
            <span className="font-bold text-blue-700">{formatEuro2(ergebnis.quartalsRate)}</span>
          </div>

          <div className="flex justify-between py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl mt-2">
            <div>
              <span className="font-bold text-green-800">Nach Steuern</span>
              <span className="text-green-600 text-xs block">(vor Sozialversicherung)</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-green-700 block">{formatEuro(ergebnis.nachSteuern)}</span>
              <span className="text-green-500 text-xs">{formatEuro(ergebnis.monatlichNachSteuern)}/Monat</span>
            </div>
          </div>

          {ergebnis.svJahr > 0 && (
            <div className="flex justify-between py-2 text-gray-600">
              <span>Nach Steuern und Sozialversicherung</span>
              <span className="font-bold">{formatEuro(ergebnis.nachSteuernUndSv)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Abgrenzung / USP */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">💡 Was dieser Rechner anders macht</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>✅</span>
            <span>
              <strong>Fokus Vorauszahlung:</strong> Selbstständige zahlen ihre Steuer quartalsweise im
              Voraus – hier sehen Sie die Quartalsrate sofort.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✅</span>
            <span>
              <strong>Kein Lohnsteuerabzug:</strong> Anders als bei Angestellten wird nichts vom Gehalt
              einbehalten – Sie müssen selbst zurücklegen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✅</span>
            <span>
              <strong>Soli-Freigrenze 2026:</strong> Der Solidaritätszuschlag fällt erst ab{' '}
              {formatEuro(SOLI_FREIGRENZE_EINZEL)} (Einzel) bzw. {formatEuro(SOLI_FREIGRENZE_ZUSAMMEN)}{' '}
              (Zusammen­veranlagung) Einkommensteuer an.
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
          <span>⚠️</span> Wichtiger Hinweis
        </h3>
        <p className="text-sm text-amber-700">
          Diese Berechnung ist eine <strong>Schätzung ohne Gewähr</strong> und ersetzt keine
          Steuerberatung. Sie berücksichtigt den Grundtarif/Splittingtarif nach § 32a EStG 2026, den
          Solidaritätszuschlag und optional die Kirchensteuer. Nicht abgebildet werden u. a.
          Verlustverrechnung, Progressionsvorbehalt, Teileinkünfteverfahren, individuelle
          Höchstbeträge bei Vorsorgeaufwendungen sowie die Anrechnung der Gewerbesteuer (§ 35 EStG)
          bei gewerblichen Einkünften. Maßgeblich ist allein der Bescheid Ihres Finanzamts.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
          Quellen & Rechtsgrundlagen (Stand: 2026)
        </h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 32a EStG – Einkommensteuertarif
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__37.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 37 EStG – Einkommensteuer-Vorauszahlung
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
            Bundesministerium der Finanzen (BMF)
          </a>
          <a
            href="https://www.bmf-steuerrechner.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Offizieller Steuerrechner
          </a>
        </div>
      </div>
    </div>
  );
}

export default EinkommensteuerSelbststaendigeRechner;
