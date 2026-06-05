import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ─────────────────────────────────────────────────────────────
// Kleingewerbe-Steuer-Rechner – Stand 2026
// Quellen:
//  - § 32a EStG (Einkommensteuertarif 2026): https://www.gesetze-im-internet.de/estg/__32a.html
//    Amtliche Werte 2026 (LStH 2026): Grundfreibetrag 12.348 €
//  - § 11 GewStG (Steuermesszahl 3,5 %, Freibetrag 24.500 €): https://www.gesetze-im-internet.de/gewstg/__11.html
//  - § 35 EStG (Anrechnung GewSt auf ESt, 4-facher Messbetrag): https://www.gesetze-im-internet.de/estg/__35.html
//  - Solidaritätszuschlag 2026 (Freigrenze 20.350 € / 40.700 €): https://www.gesetze-im-internet.de/solzg_1995/
// ─────────────────────────────────────────────────────────────

// Einkommensteuer nach § 32a EStG (Grundtarif), Veranlagungszeitraum 2026
function einkommensteuerGrundtarif(zvE: number): number {
  const x = Math.floor(zvE); // auf vollen Euro abgerundet
  if (x <= 12348) return 0;
  if (x <= 17799) {
    const y = (x - 12348) / 10000;
    return (914.51 * y + 1400) * y;
  }
  if (x <= 69878) {
    const z = (x - 17799) / 10000;
    return (173.1 * z + 2397) * z + 1034.87;
  }
  if (x <= 277825) {
    return 0.42 * x - 11135.63;
  }
  return 0.45 * x - 19470.38;
}

// Einkommensteuer mit Splitting (verheiratet, Zusammenveranlagung)
function einkommensteuer(zvE: number, verheiratet: boolean): number {
  if (verheiratet) {
    return 2 * einkommensteuerGrundtarif(zvE / 2);
  }
  return einkommensteuerGrundtarif(zvE);
}

// Solidaritätszuschlag 2026 inkl. Milderungszone
function soli(estBetrag: number, verheiratet: boolean): number {
  const freigrenze = verheiratet ? 40700 : 20350;
  if (estBetrag <= freigrenze) return 0;
  const voll = estBetrag * 0.055;
  const milderung = (estBetrag - freigrenze) * 0.119;
  return Math.min(voll, milderung);
}

export function KleingewerbeSteuerRechner() {
  const [gewinn, setGewinn] = useState(40000);
  const [verheiratet, setVerheiratet] = useState(false);
  const [hebesatz, setHebesatz] = useState(400);
  const [kirche, setKirche] = useState<'keine' | '8' | '9'>('keine');

  // ── Gewerbesteuer ──────────────────────────────────────────
  // Bemessungsgrundlage = Gewinn − Freibetrag 24.500 € (für Einzelunternehmer/Personengesellschaften)
  // Gewerbeertrag wird auf volle 100 € abgerundet (§ 11 Abs. 1 S. 3 GewStG)
  const gewerbeertrag = Math.max(0, Math.floor(Math.max(0, gewinn - 24500) / 100) * 100);
  const messbetrag = gewerbeertrag * 0.035; // Steuermesszahl 3,5 %
  const gewerbesteuer = messbetrag * (hebesatz / 100);

  // ── Einkommensteuer (vor Anrechnung) ───────────────────────
  // Vereinfachung: zu versteuerndes Einkommen = Gewinn (keine weiteren Abzüge)
  const estVorAnrechnung = einkommensteuer(gewinn, verheiratet);

  // ── Anrechnung der GewSt auf die ESt (§ 35 EStG) ───────────
  // Anrechnung = min( 4 × Messbetrag , tatsächlich gezahlte Gewerbesteuer , Einkommensteuer )
  const anrechnungTheoretisch = Math.min(4 * messbetrag, gewerbesteuer);
  const anrechnung = Math.min(anrechnungTheoretisch, estVorAnrechnung);
  const estNachAnrechnung = Math.max(0, estVorAnrechnung - anrechnung);

  // ── Solidaritätszuschlag (auf die festgesetzte ESt) ────────
  const soliBetrag = soli(estNachAnrechnung, verheiratet);

  // ── Kirchensteuer (Bemessung: festgesetzte ESt) ────────────
  const kirchensteuersatz = kirche === 'keine' ? 0 : Number(kirche) / 100;
  const kirchensteuer = estNachAnrechnung * kirchensteuersatz;

  // ── Gesamt ─────────────────────────────────────────────────
  const gesamt = gewerbesteuer + estNachAnrechnung + soliBetrag + kirchensteuer;
  const nettoNachSteuer = gewinn - gesamt;
  const durchschnittssatz = gewinn > 0 ? (gesamt / gewinn) * 100 : 0;

  const fmt = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtProz = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Kleingewerbe-Steuer-Rechner" rechnerSlug="kleingewerbe-steuer-rechner" />

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-6">
        {/* Jahresgewinn */}
        <label className="block">
          <span className="text-gray-700 font-medium">Jahresgewinn (vor Steuern)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              min={0}
              step={1000}
              value={gewinn}
              onChange={(e) => setGewinn(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg font-semibold text-gray-800 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Gewinn = Einnahmen − Betriebsausgaben (vereinfacht als zu versteuerndes Einkommen angesetzt)
          </p>
        </label>

        {/* Familienstand */}
        <div>
          <span className="text-gray-700 font-medium">Veranlagung</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => setVerheiratet(false)}
              className={`py-3 rounded-xl font-medium transition-all ${
                !verheiratet ? 'bg-yellow-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ledig (Grundtarif)
            </button>
            <button
              onClick={() => setVerheiratet(true)}
              className={`py-3 rounded-xl font-medium transition-all ${
                verheiratet ? 'bg-yellow-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Verheiratet (Splitting)
            </button>
          </div>
        </div>

        {/* Hebesatz */}
        <label className="block">
          <span className="text-gray-700 font-medium">Gewerbesteuer-Hebesatz Ihrer Gemeinde</span>
          <div className="mt-2 relative">
            <input
              type="number"
              min={200}
              step={10}
              value={hebesatz}
              onChange={(e) => setHebesatz(Math.max(200, Number(e.target.value)))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg font-semibold text-gray-800 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Bundesweiter Schnitt rund 400 %. Mindestens 200 %, in Großstädten teils über 500 %.
          </p>
        </label>

        {/* Kirchensteuer */}
        <div>
          <span className="text-gray-700 font-medium">Kirchensteuer</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              onClick={() => setKirche('keine')}
              className={`py-3 rounded-xl font-medium transition-all text-sm ${
                kirche === 'keine' ? 'bg-yellow-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Keine
            </button>
            <button
              onClick={() => setKirche('8')}
              className={`py-3 rounded-xl font-medium transition-all text-sm ${
                kirche === '8' ? 'bg-yellow-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              8 % (BY/BW)
            </button>
            <button
              onClick={() => setKirche('9')}
              className={`py-3 rounded-xl font-medium transition-all text-sm ${
                kirche === '9' ? 'bg-yellow-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              9 % (übrige)
            </button>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-yellow-100 mb-1">Gesamte Steuerlast (geschätzt)</h3>
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(gesamt)}</span>
            <span className="text-xl text-yellow-100">€ / Jahr</span>
          </div>
          <p className="text-yellow-100 text-sm mt-1">
            Durchschnittliche Belastung: {fmtProz(durchschnittssatz)} % des Gewinns
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-yellow-100">Gewerbesteuer</span>
            <span className="font-semibold">{fmt(gewerbesteuer)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-100">Einkommensteuer (nach Anrechnung)</span>
            <span className="font-semibold">{fmt(estNachAnrechnung)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-100">Solidaritätszuschlag</span>
            <span className="font-semibold">{fmt(soliBetrag)} €</span>
          </div>
          {kirche !== 'keine' && (
            <div className="flex justify-between">
              <span className="text-yellow-100">Kirchensteuer</span>
              <span className="font-semibold">{fmt(kirchensteuer)} €</span>
            </div>
          )}
          <div className="border-t border-white/20 pt-2 flex justify-between">
            <span className="text-yellow-100 font-medium">Netto nach Steuern</span>
            <span className="font-bold">{fmt(nettoNachSteuer)} €</span>
          </div>
        </div>
      </div>

      {/* Detail-Aufschlüsselung */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-gray-800 mb-2">Gewerbesteuer</p>
            <ul className="space-y-1">
              <li>Gewinn − Freibetrag 24.500 € = Gewerbeertrag <strong>{fmt(gewerbeertrag)} €</strong></li>
              <li>× Steuermesszahl 3,5 % = Messbetrag <strong>{fmt(messbetrag)} €</strong></li>
              <li>× Hebesatz {hebesatz} % = Gewerbesteuer <strong>{fmt(gewerbesteuer)} €</strong></li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-gray-800 mb-2">Einkommensteuer & Anrechnung (§ 35 EStG)</p>
            <ul className="space-y-1">
              <li>Einkommensteuer auf {fmt(gewinn)} € = <strong>{fmt(estVorAnrechnung)} €</strong></li>
              <li>− Anrechnung GewSt (max. 4 × Messbetrag) = <strong>−{fmt(anrechnung)} €</strong></li>
              <li>= festgesetzte Einkommensteuer <strong>{fmt(estNachAnrechnung)} €</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wichtiger Hinweis Kleinunternehmer vs. Kleingewerbe */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">⚠️ Kleingewerbe ist nicht Kleinunternehmer</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">🏪</span>
            <div>
              <p className="font-medium text-blue-900">Kleingewerbe = Rechtsform-Frage</p>
              <p className="text-blue-700">
                Kein im Handelsregister eingetragenes Gewerbe, keine kaufmännische Buchführungspflicht.
                Betrifft die Art des Betriebs.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🧾</span>
            <div>
              <p className="font-medium text-green-900">Kleinunternehmer (§ 19 UStG) = Umsatzsteuer-Frage</p>
              <p className="text-green-700">
                Wer unter den Umsatzgrenzen bleibt, weist keine Umsatzsteuer aus. Das ist unabhängig
                vom Kleingewerbe und betrifft nur die Umsatzsteuer – nicht diese Berechnung.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Diese Berechnung ist eine vereinfachte Schätzung ohne Gewähr und
          ersetzt keine steuerliche Beratung. Sonderausgaben, Vorsorgeaufwendungen, Verlustvorträge,
          weitere Einkünfte und Freibeträge bleiben unberücksichtigt. Für eine verbindliche Berechnung
          wenden Sie sich an einen Steuerberater oder das Finanzamt.
        </p>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 32a EStG – Einkommensteuertarif (Werte 2026)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gewstg/__11.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 11 GewStG – Steuermesszahl & Freibetrag
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__35.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 35 EStG – Anrechnung der Gewerbesteuer
          </a>
        </div>
      </div>
    </div>
  );
}

export default KleingewerbeSteuerRechner;
