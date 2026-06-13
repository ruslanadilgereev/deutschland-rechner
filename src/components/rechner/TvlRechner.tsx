import { useState } from 'react';

// =============================================================================
// TV-L Entgelttabelle (Allgemeiner Teil, Anlage B) – gültig 01.04.2026–28.02.2027
// Tarifabschluss TdL 14.02.2026: +2,8 %, mind. +100 € Sockel ab 01.04.2026.
// Verifiziert: amtliche TdL-Basistabelle 01.02.2025 + Sockelregel → cent-genau.
// Gilt für alle Länder AUSSER Hessen (TV-H). E 15Ü/E 13Ü NICHT enthalten.
// Monatliche Bruttobeträge in Euro, Stufen 1–6. null = Stufe nicht besetzt.
// =============================================================================
type Entgeltgruppe = {
  label: string;
  stufen: (number | null)[]; // [Stufe 1..6]
};

const TVL_2026: Entgeltgruppe[] = [
  { label: 'E 15', stufen: [5658.38, 6067.30, 6283.38, 7050.89, 7632.07, 7854.52] },
  { label: 'E 14', stufen: [5143.59, 5515.90, 5821.41, 6283.38, 6991.23, 7194.48] },
  { label: 'E 13', stufen: [4759.37, 5106.09, 5366.89, 5873.56, 6573.97, 6764.69] },
  { label: 'E 12', stufen: [4310.90, 4599.41, 5210.41, 5746.90, 6439.85, 6626.54] },
  { label: 'E 11', stufen: [4178.35, 4444.86, 4748.43, 5210.41, 5881.02, 6050.95] },
  { label: 'E 10', stufen: [4038.42, 4299.95, 4599.41, 4904.89, 5486.13, 5644.20] },
  { label: 'E 9b', stufen: [3620.10, 3870.81, 4035.07, 4488.99, 4875.10, 5014.87] },
  { label: 'E 9a', stufen: [3620.10, 3870.81, 3925.58, 4035.07, 4488.99, 4615.76] },
  { label: 'E 8', stufen: [3419.52, 3659.02, 3795.52, 3925.58, 4069.31, 4158.27] },
  { label: 'E 7', stufen: [3235.83, 3469.72, 3645.69, 3781.85, 3891.36, 3987.16] },
  { label: 'E 6', stufen: [3186.57, 3418.08, 3547.20, 3679.20, 3768.15, 3863.96] },
  { label: 'E 5', stufen: [3073.97, 3301.87, 3430.99, 3553.66, 3652.34, 3720.25] },
  { label: 'E 4', stufen: [2949.24, 3179.22, 3340.61, 3430.99, 3521.39, 3579.47] },
  { label: 'E 3', stufen: [2915.57, 3140.47, 3205.03, 3308.32, 3392.25, 3463.27] },
  { label: 'E 2', stufen: [2742.84, 2953.24, 3017.80, 3082.36, 3230.84, 3385.81] },
  { label: 'E 1', stufen: [null, 2534.49, 2565.06, 2601.78, 2638.51, 2730.30] },
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

export default function TvlRechner() {
  const [gruppeIdx, setGruppeIdx] = useState(11); // E 5 (mittlere Gruppe als Default)
  const [stufeIdx, setStufeIdx] = useState(2);    // Stufe 3
  const [steuerklasse, setSteuerklasse] = useState<Steuerklasse>(1);
  const [zusatzbeitrag, setZusatzbeitrag] = useState(2.9); // KV-Zusatzbeitrag in %
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [kinderlos, setKinderlos] = useState(true); // PV-Zuschlag ab 23 ohne Kind

  const gruppe = TVL_2026[gruppeIdx];
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
            <strong>Tarifstand: TV-L ab 1. April 2026 (+2,8 %, mind. +100 €)</strong> – Werte ohne Gewähr.
            Der TV-L gilt für die Länder <strong>außer Hessen</strong> (dort gilt der eigene TV-H).
            Die Netto-Schätzung ist eine grobe Näherung; die{' '}
            <strong>betriebliche Zusatzversorgung (VBL) ist nicht enthalten</strong>.
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
              if (TVL_2026[idx].stufen[stufeIdx] === null) {
                const erste = TVL_2026[idx].stufen.findIndex((s) => s !== null);
                setStufeIdx(erste === -1 ? 1 : erste);
              }
            }}
            className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            {TVL_2026.map((g, i) => (
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
            <span className="text-5xl font-bold">{brutto !== null ? fmt(brutto) : '–'}</span>
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
              Das <strong>Monatsbrutto</strong> stammt direkt aus der amtlichen TV-L-Entgelttabelle
              (Anlage B) der Länder mit Stand <strong>ab 1. April 2026</strong>.
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
              <strong>Nicht enthalten:</strong> Zusatzversorgung (VBL), Jahressonderzahlung,
              Zulagen, die Überleitungsgruppen E 2Ü/E 13Ü/E 15Ü sowie individuelle Freibeträge.
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
            <p className="font-medium text-yellow-800">Schätzung – keine Steuer- oder Rechtsberatung</p>
            <p className="text-yellow-700">
              Angaben ohne Gewähr. Maßgeblich sind die amtlichen TV-L-Tariftabellen der TdL und Ihre
              persönliche Lohnabrechnung. Der TV-L gilt für die Beschäftigten der Bundesländer mit
              Ausnahme von Hessen (dort gilt der eigene TV-H). Die Netto-Schätzung ist eine
              vereinfachte Näherung; die betriebliche Zusatzversorgung (VBL) ist nicht enthalten, Ihr
              tatsächliches Netto liegt daher etwas niedriger. Die Überleitungsgruppen
              E 2Ü/E 13Ü/E 15Ü sowie Jahressonderzahlung, Zulagen und individuelle Freibeträge sind
              nicht abgebildet.
            </p>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.tdl-online.de/tarifvertraege/tv-l"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            TdL – Tarifgemeinschaft deutscher Länder: TV-L (Entgelttabellen)
          </a>
          <a
            href="https://www.tdl-online.de/fileadmin/downloads/TV-L/TV-L_Anlagen/TV-L_Anlage_B_g%C3%BCltig_ab_01.02.2025.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            TdL – TV-L Anlage B (amtliche Basistabelle, gültig ab 01.02.2025)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 32a EStG – Einkommensteuertarif (gesetze-im-internet.de)
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
