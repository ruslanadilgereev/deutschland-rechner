import { useState } from 'react';

// =============================================================
// Weihnachtsgeld-Rechner (brutto -> netto), Stand 2026
// =============================================================
// Werte 2026 (Quellen siehe Seite):
// - Beitragsbemessungsgrenze KV/PV: 5.812,50 € / Monat (69.750 €/Jahr)
// - Beitragsbemessungsgrenze RV/AV: 8.450,00 € / Monat (101.400 €/Jahr)
// - Rentenversicherung: 18,6 % gesamt -> AN-Anteil 9,3 %
// - Arbeitslosenversicherung: 2,6 % gesamt -> AN-Anteil 1,3 %
// - Krankenversicherung: 14,6 % allgemein -> AN-Anteil 7,3 % + halber Zusatzbeitrag
// - durchschnittlicher Zusatzbeitrag 2026: 2,9 % (AN-Anteil 1,45 %)
// - Pflegeversicherung: 3,6 % -> AN-Anteil 1,8 % + 0,6 % Kinderlosenzuschlag (allein vom AN)
// - Einkommensteuertarif 2026 (§ 32a EStG), Grundfreibetrag 12.348 €
// Die Netto-Berechnung ist eine vereinfachte Schaetzung (Jahreslohnsteuer-
// Differenzmethode mit Pauschalannahmen) und ersetzt keine Lohnabrechnung.

// SV-Beitragssaetze 2026 (Arbeitnehmeranteile in Prozent)
const RV_AN = 9.3;
const AV_AN = 1.3;
const KV_AN_BASIS = 7.3;
const PV_AN_BASIS = 1.8;
const PV_KINDERLOS_ZUSCHLAG = 0.6;

// Beitragsbemessungsgrenzen 2026 (monatlich, in €)
const BBG_KV_PV_MONAT = 5812.5;
const BBG_RV_AV_MONAT = 8450.0;

// Einkommensteuertarif 2026 (§ 32a EStG) – Grundtabelle
const GRUNDFREIBETRAG = 12348;

function einkommensteuer2026(zvE: number): number {
  const x = Math.floor(zvE);
  if (x <= GRUNDFREIBETRAG) return 0;
  if (x <= 17799) {
    const y = (x - GRUNDFREIBETRAG) / 10000;
    return Math.floor((914.51 * y + 1400) * y);
  }
  if (x <= 69878) {
    const z = (x - 17799) / 10000;
    return Math.floor((173.1 * z + 2397) * z + 1034.87);
  }
  if (x <= 277825) {
    return Math.floor(0.42 * x - 11135.63);
  }
  return Math.floor(0.45 * x - 19470.38);
}

// Pauschaler Steuerklassen-Faktor: bildet grob die Freibetrags-Unterschiede
// der Steuerklassen ab (relativ zur Lohnsteuer in StKl I/IV).
// Stark vereinfacht – nur zur Orientierung.
type Steuerklasse = '1' | '2' | '3' | '4' | '5' | '6';

const STEUERKLASSE_FAKTOR: Record<Steuerklasse, number> = {
  '1': 1.0,
  '2': 0.92, // Alleinerziehenden-Entlastung -> etwas weniger
  '3': 0.45, // Ehegattensplitting-Vorteil -> deutlich weniger
  '4': 1.0,
  '5': 1.85, // hoeherer Abzug
  '6': 2.0, // ohne Freibetraege, hoechster Abzug
};

export default function WeihnachtsgeldRechner() {
  const [monatsbrutto, setMonatsbrutto] = useState(3500);
  const [weihnachtsgeld, setWeihnachtsgeld] = useState(1750);
  const [steuerklasse, setSteuerklasse] = useState<Steuerklasse>('1');
  const [zusatzbeitrag, setZusatzbeitrag] = useState(2.9);
  const [kirche, setKirche] = useState(false);
  const [kinderlos, setKinderlos] = useState(false);

  // ---------------------------------------------------------
  // 1) Sozialversicherung auf das Weihnachtsgeld
  // ---------------------------------------------------------
  // Bereits durch das laufende Monatsgehalt ausgeschoepfte BBG beruecksichtigen:
  // nur der Teil des Weihnachtsgelds unterhalb der (monatlichen) BBG ist beitragspflichtig.
  const kvPvFreiraum = Math.max(0, BBG_KV_PV_MONAT - monatsbrutto);
  const rvAvFreiraum = Math.max(0, BBG_RV_AV_MONAT - monatsbrutto);

  const kvPvBasis = Math.min(weihnachtsgeld, kvPvFreiraum);
  const rvAvBasis = Math.min(weihnachtsgeld, rvAvFreiraum);

  const kvSatz = KV_AN_BASIS + zusatzbeitrag / 2;
  const pvSatz = PV_AN_BASIS + (kinderlos ? PV_KINDERLOS_ZUSCHLAG : 0);

  const kvBetrag = (kvPvBasis * kvSatz) / 100;
  const pvBetrag = (kvPvBasis * pvSatz) / 100;
  const rvBetrag = (rvAvBasis * RV_AN) / 100;
  const avBetrag = (rvAvBasis * AV_AN) / 100;

  const svGesamt = kvBetrag + pvBetrag + rvBetrag + avBetrag;

  // ---------------------------------------------------------
  // 2) Lohnsteuer via Jahreslohnsteuer-Differenzmethode (Schaetzung)
  // ---------------------------------------------------------
  // Vereinfachung: zu versteuerndes Einkommen wird aus dem Bruttojahreslohn
  // ueber pauschale Abschlaege (Arbeitnehmer-Pauschbetrag + grobe Vorsorgepauschale)
  // angenaehert. Steuerklassen-Effekt ueber den Faktor oben.
  const jahresbruttoOhne = monatsbrutto * 12;
  const jahresbruttoMit = jahresbruttoOhne + weihnachtsgeld;

  // grobe Vorsorgepauschale: ~ 11 % des Bruttos (RV-Anteil + KV/PV-Anteil, gedeckelt)
  // + Arbeitnehmer-Pauschbetrag 1.230 €
  const ARBEITNEHMER_PAUSCHBETRAG = 1230;
  const VORSORGE_QUOTE = 0.11;

  function zvEAusBrutto(brutto: number): number {
    const vorsorge = brutto * VORSORGE_QUOTE;
    return Math.max(0, brutto - ARBEITNEHMER_PAUSCHBETRAG - vorsorge);
  }

  const zvEOhne = zvEAusBrutto(jahresbruttoOhne);
  const zvEMit = zvEAusBrutto(jahresbruttoMit);

  const faktor = STEUERKLASSE_FAKTOR[steuerklasse];
  const lohnsteuerOhne = einkommensteuer2026(zvEOhne) * faktor;
  const lohnsteuerMit = einkommensteuer2026(zvEMit) * faktor;

  let lohnsteuerWg = Math.max(0, lohnsteuerMit - lohnsteuerOhne);
  // Lohnsteuer kann den Bruttobezug nicht uebersteigen
  lohnsteuerWg = Math.min(lohnsteuerWg, weihnachtsgeld);

  // Solidaritaetszuschlag entfaellt fuer die allermeisten Arbeitnehmer
  // (Freigrenze sehr hoch) -> in dieser Schaetzung nicht angesetzt.
  const soli = 0;

  // Kirchensteuer (8 % oder 9 %; hier pauschal 9 %) auf die Lohnsteuer des Weihnachtsgelds
  const kirchensteuer = kirche ? lohnsteuerWg * 0.09 : 0;

  const steuerGesamt = lohnsteuerWg + soli + kirchensteuer;

  // ---------------------------------------------------------
  // 3) Netto-Weihnachtsgeld
  // ---------------------------------------------------------
  const abzuegeGesamt = svGesamt + steuerGesamt;
  const netto = Math.max(0, weihnachtsgeld - abzuegeGesamt);
  const abzugsquote = weihnachtsgeld > 0 ? (abzuegeGesamt / weihnachtsgeld) * 100 : 0;

  const fmt = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="space-y-5">
          <label className="block">
            <span className="text-gray-700 font-medium">Weihnachtsgeld (brutto)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                min={0}
                step={50}
                value={weihnachtsgeld}
                onChange={(e) => setWeihnachtsgeld(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { label: '50 %', val: Math.round(monatsbrutto * 0.5) },
                { label: '100 %', val: monatsbrutto },
              ].map((q) => (
                <button
                  key={q.label}
                  onClick={() => setWeihnachtsgeld(q.val)}
                  className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                >
                  {q.label} vom Monatsbrutto
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Monatsbruttogehalt</span>
            <div className="mt-2 relative">
              <input
                type="number"
                min={0}
                step={50}
                value={monatsbrutto}
                onChange={(e) => setMonatsbrutto(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Wird benötigt, um Steuersatz und ausgeschöpfte Beitragsgrenzen zu schätzen.
            </p>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Steuerklasse</span>
            <select
              value={steuerklasse}
              onChange={(e) => setSteuerklasse(e.target.value as Steuerklasse)}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              <option value="1">Steuerklasse I (ledig)</option>
              <option value="2">Steuerklasse II (alleinerziehend)</option>
              <option value="3">Steuerklasse III (verheiratet, Hauptverdiener)</option>
              <option value="4">Steuerklasse IV (verheiratet, beide gleich)</option>
              <option value="5">Steuerklasse V (verheiratet, Nebenverdiener)</option>
              <option value="6">Steuerklasse VI (Nebenjob)</option>
            </select>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">
              Kassenindividueller Zusatzbeitrag (KV)
            </span>
            <div className="mt-2 relative">
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={zusatzbeitrag}
                onChange={(e) => setZusatzbeitrag(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Durchschnitt 2026: 2,9 %. Den genauen Wert nennt Ihre Krankenkasse.
            </p>
          </label>

          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={kinderlos}
                onChange={(e) => setKinderlos(e.target.checked)}
                className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-gray-700">
                Kinderlos &amp; über 23 Jahre{' '}
                <span className="text-gray-400 text-sm">(+0,6 % Pflege-Zuschlag)</span>
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={kirche}
                onChange={(e) => setKirche(e.target.checked)}
                className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-gray-700">
                Kirchensteuerpflichtig{' '}
                <span className="text-gray-400 text-sm">(pauschal 9 %)</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-red-100 mb-1">Ihr Weihnachtsgeld netto (Schätzung)</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(netto)}</span>
            <span className="text-xl text-red-200">€ netto</span>
          </div>
          <p className="text-sm text-red-100 mt-1">
            von {fmt(weihnachtsgeld)} € brutto &middot; Abzugsquote {abzugsquote.toFixed(1)} %
          </p>
        </div>

        <div className="space-y-2">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-red-100">Sozialversicherung</span>
              <span className="font-semibold">− {fmt(svGesamt)} €</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-red-100">Lohnsteuer</span>
              <span className="font-semibold">− {fmt(lohnsteuerWg)} €</span>
            </div>
            {kirche && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-100">Kirchensteuer</span>
                <span className="font-semibold">− {fmt(kirchensteuer)} €</span>
              </div>
            )}
            <div className="border-t border-white/20 pt-2 flex justify-between items-center">
              <span className="text-red-100">Abzüge gesamt</span>
              <span className="text-lg font-bold">− {fmt(abzuegeGesamt)} €</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-red-200 mt-4">
          Grobe Schätzung nach der Jahreslohnsteuer-Differenzmethode mit Pauschalannahmen.
          Der tatsächliche Abzug auf Ihrer Lohnabrechnung kann abweichen.
        </p>
      </div>

      {/* Aufschluesselung SV */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🔍 Aufschlüsselung der Abzüge</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Rentenversicherung (9,3 %)</span>
            <span className="font-medium text-gray-800">− {fmt(rvBetrag)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Arbeitslosenversicherung (1,3 %)</span>
            <span className="font-medium text-gray-800">− {fmt(avBetrag)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Krankenversicherung ({kvSatz.toFixed(2)} %)</span>
            <span className="font-medium text-gray-800">− {fmt(kvBetrag)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pflegeversicherung ({pvSatz.toFixed(1)} %)</span>
            <span className="font-medium text-gray-800">− {fmt(pvBetrag)} €</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-gray-700 font-medium">Lohnsteuer</span>
            <span className="font-medium text-gray-800">− {fmt(lohnsteuerWg)} €</span>
          </div>
          {kirche && (
            <div className="flex justify-between">
              <span className="text-gray-600">Kirchensteuer (9 %)</span>
              <span className="font-medium text-gray-800">− {fmt(kirchensteuer)} €</span>
            </div>
          )}
        </div>
        {(kvPvBasis < weihnachtsgeld || rvAvBasis < weihnachtsgeld) && (
          <div className="mt-4 flex gap-3 p-3 bg-blue-50 rounded-xl text-sm">
            <span className="text-xl">ℹ️</span>
            <p className="text-blue-800">
              Ein Teil Ihres Weihnachtsgelds liegt oberhalb der Beitragsbemessungsgrenze und ist
              daher (teilweise) beitragsfrei in der Sozialversicherung.
            </p>
          </div>
        )}
      </div>

      {/* Hinweis Schaetzung */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">⚠️ Wichtiger Hinweis</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Nur eine Orientierung</p>
              <p className="text-yellow-700">
                Weihnachtsgeld ist ein „sonstiger Bezug“ und wird über die
                Jahreslohnsteuer-Differenzmethode versteuert. Dieser Rechner schätzt das Netto mit
                vereinfachten Pauschalannahmen (Vorsorgepauschale, Steuerklassen-Faktor). Die exakte
                Berechnung hängt von Freibeträgen, weiterem Einkommen und Ihrer Krankenkasse ab.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📋</span>
            <p>
              Ohne Gewähr. Dieser Rechner ersetzt keine steuerliche oder rechtliche Beratung. Die
              verbindliche Abrechnung erstellt Ihr Arbeitgeber bzw. Steuerberater.
            </p>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen (Stand 2026)</h4>
        <div className="space-y-1">
          <a
            href="https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – Beitragsbemessungsgrenzen 2026
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_5/__241.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 241 SGB V – Beitragssatz Krankenversicherung (ergaenzend § 55 SGB XI, § 341 SGB III, § 158 SGB VI)
          </a>
          <a
            href="https://esth.bundesfinanzministerium.de/lsth/2026/A-Einkommensteuergesetz/IV-Tarif-31-34b/Paragraf-32a/inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Einkommensteuertarif § 32a EStG 2026
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__39b.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 39b Abs. 3 EStG – Lohnsteuer auf sonstige Bezuege
          </a>
        </div>
      </div>
    </div>
  );
}
