import { useState } from 'react';

// =============================================================================
// TVöD-VKA Entgelttabelle – gültig ab 01.05.2026 (Laufzeit bis 31.03.2027)
// Quelle: oeffentlicher-dienst.info / oeffentlichen-dienst.de (Tarifeinigung
// VKA, +2,8 % ab Mai 2026). Monatliche Bruttobeträge in Euro, Stufen 1–6.
// null = Stufe in dieser Entgeltgruppe nicht besetzt.
// =============================================================================
type Entgeltgruppe = {
  label: string;
  stufen: (number | null)[]; // [Stufe 1..6]
};

const TVOED_VKA_2026: Entgeltgruppe[] = [
  { label: 'E 15', stufen: [5827.86, 6208.96, 6634.05, 7214.39, 7811.37, 8204.11] },
  { label: 'E 14', stufen: [5298.27, 5643.35, 6094.01, 6594.12, 7151.57, 7551.78] },
  { label: 'E 13', stufen: [4901.11, 5279.32, 5709.87, 6177.31, 6727.38, 7025.87] },
  { label: 'E 12', stufen: [4415.70, 4850.91, 5359.50, 5923.82, 6586.00, 6900.18] },
  { label: 'E 11', stufen: [4269.64, 4669.92, 5046.03, 5454.10, 6012.56, 6326.77] },
  { label: 'E 10', stufen: [4124.53, 4438.16, 4794.69, 5181.37, 5611.95, 5753.35] },
  { label: 'E 9c', stufen: [4010.72, 4290.50, 4594.76, 4922.61, 5275.05, 5527.70] },
  { label: 'E 9b', stufen: [3779.84, 4039.01, 4203.56, 4690.55, 4979.11, 5313.37] },
  { label: 'E 9a', stufen: [3658.61, 3877.94, 4097.67, 4586.77, 4697.43, 4979.97] },
  { label: 'E 8', stufen: [3486.40, 3697.29, 3843.36, 3992.40, 4153.50, 4230.97] },
  { label: 'E 7', stufen: [3294.98, 3537.94, 3682.69, 3828.76, 3969.05, 4045.24] },
  { label: 'E 6', stufen: [3240.30, 3440.25, 3580.46, 3719.22, 3855.50, 3926.20] },
  { label: 'E 5', stufen: [3124.08, 3318.04, 3449.05, 3587.78, 3716.70, 3783.33] },
  { label: 'E 4', stufen: [2994.17, 3190.45, 3355.14, 3457.66, 3560.17, 3620.20] },
  { label: 'E 3', stufen: [2953.13, 3164.20, 3215.57, 3332.99, 3421.10, 3501.81] },
  { label: 'E 2', stufen: [2767.54, 2975.32, 3027.12, 3101.04, 3263.52, 3433.49] },
  { label: 'E 1', stufen: [null, 2534.55, 2568.83, 2611.69, 2651.64, 2754.50] },
];

// =============================================================================
// Sozialversicherung & Steuer 2026 (vereinfachte Netto-Schätzung)
// =============================================================================
// Beitragsbemessungsgrenzen 2026 (monatlich)
const BBG_KV = 5812.5;   // Kranken- & Pflegeversicherung (69.750 €/Jahr)
const BBG_RV = 8450.0;   // Renten- & Arbeitslosenversicherung

// Arbeitnehmer-Anteile (allgemeine Beitragssätze 2026)
const SATZ_RV = 0.093;   // Rentenversicherung 18,6 % → AN 9,3 %
const SATZ_ALV = 0.013;  // Arbeitslosenversicherung 2,6 % → AN 1,3 %
const SATZ_KV_BASIS = 0.073; // allg. KV 14,6 % → AN 7,3 %
// Zusatzbeitrag KV: durchschnittlich 2,9 % (2026), hälftig getragen → 1,45 %
// Pflegeversicherung 2026: 3,6 % (AN-Anteil 1,8 %), Kinderlosen-Zuschlag +0,6 %

// Grundfreibetrag 2026
const GRUNDFREIBETRAG = 12348;

// Einkommensteuer 2026 – amtliche Tarifformel (§ 32a EStG, Werte 2026).
// Eckwerte und Konstanten laut BMF-Lohnsteuer-Handbuch 2026:
// Grundfreibetrag 12.348 €, Zone-1-Grenze 17.799 €, Zone-2-Grenze 69.878 €.
function einkommensteuer2026(zvE: number): number {
  const x = Math.floor(zvE);
  if (x <= GRUNDFREIBETRAG) return 0;
  if (x <= 17799) {
    const y = (x - GRUNDFREIBETRAG) / 10000;
    return Math.floor((914.51 * y + 1400) * y);
  }
  if (x <= 69878) {
    const z = (x - 17799) / 10000;
    return Math.floor((173.10 * z + 2397) * z + 1034.87);
  }
  if (x <= 277825) {
    return Math.floor(0.42 * x - 11135.63);
  }
  return Math.floor(0.45 * x - 19470.38);
}

type Steuerklasse = 1 | 2 | 3 | 4 | 5 | 6;

export default function TvoedRechner() {
  const [gruppeIdx, setGruppeIdx] = useState(12); // E 5 (mittlere Gruppe als Default)
  const [stufeIdx, setStufeIdx] = useState(2);    // Stufe 3
  const [steuerklasse, setSteuerklasse] = useState<Steuerklasse>(1);
  const [zusatzbeitrag, setZusatzbeitrag] = useState(2.9); // KV-Zusatzbeitrag in %
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [kinderlos, setKinderlos] = useState(true); // PV-Zuschlag ab 23 ohne Kind

  const gruppe = TVOED_VKA_2026[gruppeIdx];
  const brutto = gruppe.stufen[stufeIdx];

  // Verfügbare Stufen der gewählten Gruppe (für Auswahl-Disabling)
  const stufenVerfuegbar = gruppe.stufen.map((s) => s !== null);

  // ---- Netto-Schätzung -------------------------------------------------------
  let netto: number | null = null;
  let svGesamt = 0;
  let lohnsteuer = 0;
  let kirche = 0;
  let soli = 0;
  let pvSatz = 0;
  let kvSatzGesamt = 0;

  if (brutto !== null) {
    const kvBasis = Math.min(brutto, BBG_KV);
    const rvBasis = Math.min(brutto, BBG_RV);

    // Pflegeversicherung AN-Anteil: 1,8 % + ggf. 0,6 % Kinderlosen-Zuschlag
    const pvAn = kinderlos ? 0.024 : 0.018;
    pvSatz = pvAn;
    // KV AN-Anteil: 7,3 % + halber Zusatzbeitrag
    const kvAn = SATZ_KV_BASIS + zusatzbeitrag / 100 / 2;
    kvSatzGesamt = kvAn;

    const rv = rvBasis * SATZ_RV;
    const alv = rvBasis * SATZ_ALV;
    const kv = kvBasis * kvAn;
    const pv = kvBasis * pvAn;
    svGesamt = rv + alv + kv + pv;

    // Vorsorgepauschale (vereinfacht): tatsächliche AN-SV-Beiträge mindern das
    // zu versteuernde Einkommen näherungsweise. Wir setzen die SV-Beiträge
    // (gedeckelt) als Abzug an – grobe Annäherung an die Lohnsteuerberechnung.
    const jahresbrutto = brutto * 12;
    const vorsorge = svGesamt * 12;
    const arbeitnehmerpauschbetrag = 1230;
    const sonderausgabenpausch = 36;

    // Steuerklassen-Faktor: vereinfachte Annäherung über Splitting bei III/V.
    // I/II/IV ≈ Grundtarif. III ≈ Splitting (geringere Steuer), V ≈ höhere Steuer.
    const zvE = Math.max(
      0,
      jahresbrutto - vorsorge - arbeitnehmerpauschbetrag - sonderausgabenpausch
    );

    let estJahr: number;
    if (steuerklasse === 3) {
      // Splitting näherungsweise: Steuer auf halbes zvE × 2
      estJahr = 2 * einkommensteuer2026(zvE / 2);
    } else if (steuerklasse === 5) {
      // Klasse V: deutlich höhere Belastung – vereinfachter Aufschlag
      estJahr = einkommensteuer2026(zvE) * 1.18;
    } else {
      estJahr = einkommensteuer2026(zvE);
    }

    lohnsteuer = estJahr / 12;

    // Solidaritätszuschlag: 5,5 % der LSt, faktisch nur über Freigrenze relevant.
    // Freigrenze 2026 (jährlich, Einzelveranlagung) ~ 20.350 € LSt → Soli erst
    // bei sehr hohen Einkommen. Vereinfacht: nur ab Jahres-LSt > 20.350 €.
    const soliFreigrenze = steuerklasse === 3 ? 40700 : 20350;
    if (estJahr > soliFreigrenze) {
      soli = (estJahr * 0.055) / 12;
    }

    // Kirchensteuer 9 % der Lohnsteuer (8 % in BY/BW – wir nehmen 9 % als Default)
    if (kirchensteuer) {
      kirche = (estJahr * 0.09) / 12;
    }

    netto = brutto - svGesamt - lohnsteuer - soli - kirche;
  }

  const fmt = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Hinweis zum Tarifstand */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <span className="text-lg mt-0.5">⚠️</span>
          <p>
            <strong>Tarifstand: TVöD-VKA ab 1. Mai 2026 (+2,8 %)</strong> – Werte ohne Gewähr.
            Die Netto-Schätzung ist eine grobe Näherung; die{' '}
            <strong>betriebliche Zusatzversorgung (VBL/ZVK) ist nicht enthalten</strong>.
          </p>
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {/* Entgeltgruppe */}
        <label className="block">
          <span className="text-gray-700 font-medium">Entgeltgruppe</span>
          <select
            value={gruppeIdx}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setGruppeIdx(idx);
              // Falls aktuelle Stufe in neuer Gruppe nicht existiert → erste gültige
              if (TVOED_VKA_2026[idx].stufen[stufeIdx] === null) {
                const erste = TVOED_VKA_2026[idx].stufen.findIndex((s) => s !== null);
                setStufeIdx(erste === -1 ? 1 : erste);
              }
            }}
            className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {TVOED_VKA_2026.map((g, i) => (
              <option key={g.label} value={i}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        {/* Stufe */}
        <label className="block">
          <span className="text-gray-700 font-medium">Erfahrungsstufe</span>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => stufenVerfuegbar[i] && setStufeIdx(i)}
                disabled={!stufenVerfuegbar[i]}
                className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                  stufeIdx === i
                    ? 'bg-blue-600 text-white'
                    : stufenVerfuegbar[i]
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </label>

        {/* Steuerklasse */}
        <label className="block">
          <span className="text-gray-700 font-medium">Steuerklasse</span>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {([1, 2, 3, 4, 5, 6] as Steuerklasse[]).map((sk) => (
              <button
                key={sk}
                onClick={() => setSteuerklasse(sk)}
                className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                  steuerklasse === sk
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sk === 1 ? 'I' : sk === 2 ? 'II' : sk === 3 ? 'III' : sk === 4 ? 'IV' : sk === 5 ? 'V' : 'VI'}
              </button>
            ))}
          </div>
        </label>

        {/* KV-Zusatzbeitrag */}
        <label className="block">
          <span className="text-gray-700 font-medium">
            KV-Zusatzbeitrag: <span className="text-blue-600">{zusatzbeitrag.toFixed(1)} %</span>
          </span>
          <input
            type="range"
            min={0}
            max={4}
            step={0.1}
            value={zusatzbeitrag}
            onChange={(e) => setZusatzbeitrag(Number(e.target.value))}
            className="mt-2 w-full accent-blue-600"
          />
          <span className="text-xs text-gray-400">Durchschnitt 2026: 2,9 %</span>
        </label>

        {/* Toggles */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between bg-gray-50 rounded-xl p-3 cursor-pointer">
            <span className="text-gray-700 text-sm font-medium">Kirchensteuer (9 %)</span>
            <input
              type="checkbox"
              checked={kirchensteuer}
              onChange={(e) => setKirchensteuer(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </label>
          <label className="flex items-center justify-between bg-gray-50 rounded-xl p-3 cursor-pointer">
            <span className="text-gray-700 text-sm font-medium">
              Kinderlos (ab 23 J., PV-Zuschlag +0,6 %)
            </span>
            <input
              type="checkbox"
              checked={kinderlos}
              onChange={(e) => setKinderlos(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          {gruppe.label}, Stufe {stufeIdx + 1} – Monatsbrutto
        </h3>
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{brutto !== null ? fmt(brutto) : '–'}</span>
            <span className="text-xl text-blue-200">€ / Monat</span>
          </div>
          {brutto !== null && (
            <p className="text-blue-200 text-sm mt-1">
              entspricht {fmt(brutto * 12)} € im Jahr (ohne Jahressonderzahlung)
            </p>
          )}
        </div>

        {netto !== null && brutto !== null && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-100">Sozialabgaben (AN-Anteil)</span>
              <span className="font-medium">− {fmt(svGesamt)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Lohnsteuer</span>
              <span className="font-medium">− {fmt(lohnsteuer)} €</span>
            </div>
            {soli > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-100">Solidaritätszuschlag</span>
                <span className="font-medium">− {fmt(soli)} €</span>
              </div>
            )}
            {kirche > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-100">Kirchensteuer</span>
                <span className="font-medium">− {fmt(kirche)} €</span>
              </div>
            )}
            <div className="border-t border-white/20 pt-2 flex justify-between items-baseline">
              <span className="text-blue-100 font-semibold">Netto (Schätzung)</span>
              <span className="text-2xl font-bold">≈ {fmt(netto)} €</span>
            </div>
          </div>
        )}
        <p className="text-xs text-blue-200 mt-3">
          Netto = grobe Schätzung (Steuerklasse {steuerklasse === 1 ? 'I' : steuerklasse === 2 ? 'II' : steuerklasse === 3 ? 'III' : steuerklasse === 4 ? 'IV' : steuerklasse === 5 ? 'V' : 'VI'},
          SV 2026). VBL/Zusatzversorgung, Zulagen und Freibeträge sind nicht berücksichtigt.
        </p>
      </div>

      {/* Info */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert der Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Das <strong>Monatsbrutto</strong> stammt direkt aus der amtlichen TVöD-VKA-Tabelle
              (Kommunen) mit Stand <strong>ab 1. Mai 2026</strong>.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Die <strong>Erfahrungsstufe</strong> (1–6) richtet sich nach der Zeit in der jeweiligen
              Entgeltgruppe – sie steigt automatisch mit den Berufsjahren.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Die <strong>Netto-Schätzung</strong> berücksichtigt Renten-, Arbeitslosen-, Kranken-
              und Pflegeversicherung (Sätze 2026) sowie eine vereinfachte Lohnsteuer.
            </span>
          </li>
          <li className="flex gap-2">
            <span>⚠️</span>
            <span>
              <strong>Nicht enthalten:</strong> Zusatzversorgung (VBL/ZVK), Jahressonderzahlung,
              Zulagen, Kinderfreibeträge und individuelle Freibeträge.
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtiger Hinweis</h3>
        <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl text-sm">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-medium text-yellow-800">Angaben ohne Gewähr</p>
            <p className="text-yellow-700">
              Dieser Rechner liefert eine unverbindliche Orientierung und ersetzt keine
              verbindliche Gehaltsabrechnung oder steuerliche Beratung. Maßgeblich sind die
              offiziellen Tariftabellen und Ihre persönliche Lohnabrechnung.
            </p>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://oeffentlicher-dienst.info/c/t/rechner/tvoed/vka?id=tvoed-vka-2026&matrix=1"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Öffentlicher-Dienst.info – TVöD-VKA Entgelttabelle 2026
          </a>
          <a
            href="https://www.oeffentlichen-dienst.de/entgelttabelle/vka/a/4410-vka-2026.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Oeffentlichen-Dienst.de – TVöD-VKA 01.05.2026–31.03.2027
          </a>
          <a
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2025/25-10-08-bundeskabinett-sv-rechengroessen-vo-2026.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Sozialversicherungs-Rechengrößen 2026
          </a>
        </div>
      </div>
    </div>
  );
}
