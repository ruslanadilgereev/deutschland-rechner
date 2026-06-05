import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ── Werte 2026 ───────────────────────────────────────────────────────────────
// Quelle: count.tax / VLH / Bundesfinanzministerium (Steuerfortentwicklungsgesetz)
const KINDERFREIBETRAG_SAECHLICH = 6828; // € pro Kind/Jahr (beide Eltern, 3.414 € je Elternteil)
const BEA_FREIBETRAG = 2928; // € pro Kind/Jahr (beide Eltern, 1.464 € je Elternteil)
const KINDERFREIBETRAG_GESAMT = KINDERFREIBETRAG_SAECHLICH + BEA_FREIBETRAG; // 9.756 €
const KINDERGELD_PRO_MONAT = 259; // € pro Kind/Monat (2026)
const KINDERGELD_PRO_JAHR = KINDERGELD_PRO_MONAT * 12; // 3.108 €

// ── Einkommensteuertarif 2026 nach §32a EStG ──────────────────────────────────
// Quelle: Bundesfinanzministerium, Lohnsteuer-Handbuch 2026
function einkommensteuer2026(zvE: number): number {
  const x = Math.floor(zvE);
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

// Tarifliche Einkommensteuer inkl. Ehegatten-Splitting (§32a Abs. 5 EStG)
function tariflicheSteuer(zvE: number, verheiratet: boolean): number {
  const basis = Math.max(0, zvE);
  if (verheiratet) {
    return 2 * einkommensteuer2026(basis / 2);
  }
  return einkommensteuer2026(basis);
}

export default function KinderfreibetragRechner() {
  const [zveInput, setZveInput] = useState('80000');
  const [anzahlKinder, setAnzahlKinder] = useState(1);
  const [verheiratet, setVerheiratet] = useState(true);

  const zvE = Math.max(0, parseFloat(zveInput.replace(/\./g, '').replace(',', '.')) || 0);

  // Gesamter Kinderfreibetrag (beide Eltern) für alle Kinder
  const freibetragGesamt = KINDERFREIBETRAG_GESAMT * anzahlKinder;

  // Steuer mit und ohne Kinderfreibetrag
  const steuerOhneFreibetrag = tariflicheSteuer(zvE, verheiratet);
  const steuerMitFreibetrag = tariflicheSteuer(zvE - freibetragGesamt, verheiratet);

  // Steuerersparnis durch Kinderfreibetrag (vereinfacht, ohne Soli/KiSt)
  const steuerersparnis = Math.max(0, steuerOhneFreibetrag - steuerMitFreibetrag);

  // Kindergeld pro Jahr für alle Kinder
  const kindergeldJahr = KINDERGELD_PRO_JAHR * anzahlKinder;

  const freibetragGuenstiger = steuerersparnis > kindergeldJahr;
  const differenz = Math.abs(steuerersparnis - kindergeldJahr);

  const fmtEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Kinderfreibetrag-Rechner 2026" rechnerSlug="kinderfreibetrag-rechner" />

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-6">
          <span className="text-gray-700 font-medium">Zu versteuerndes Einkommen (Jahr)</span>
          <div className="mt-2 relative">
            <input
              type="text"
              inputMode="numeric"
              value={zveInput}
              onChange={(e) => setZveInput(e.target.value)}
              className="w-full px-4 py-3 pr-10 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="z. B. 80000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            Gemeinsames zu versteuerndes Einkommen (bei Verheirateten)
          </span>
        </label>

        <div className="mb-6">
          <span className="text-gray-700 font-medium">Veranlagung</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              onClick={() => setVerheiratet(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                verheiratet
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Verheiratet
            </button>
            <button
              onClick={() => setVerheiratet(false)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !verheiratet
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Alleinstehend
            </button>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            Bei „Verheiratet" wird das Ehegatten-Splitting (§32a Abs. 5 EStG) angewendet.
          </span>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Anzahl Kinder</span>
          <div className="mt-3 flex items-center justify-center gap-6">
            <button
              onClick={() => setAnzahlKinder(Math.max(1, anzahlKinder - 1))}
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40"
              disabled={anzahlKinder <= 1}
            >
              −
            </button>
            <span className="text-5xl font-bold text-blue-600 w-20 text-center">
              {anzahlKinder}
            </span>
            <button
              onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
              className="w-14 h-14 rounded-full bg-blue-500 text-2xl font-bold text-white hover:bg-blue-600 active:scale-95 transition-all"
            >
              +
            </button>
          </div>
        </label>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Günstigerprüfung – Ergebnis</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {freibetragGuenstiger ? 'Kinderfreibetrag' : 'Kindergeld'}
            </span>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            ist für Sie {differenz > 0 ? (
              <>günstiger – um <strong>{fmtEuro(differenz)} € pro Jahr</strong></>
            ) : (
              <>gleichwertig</>
            )}
          </p>
        </div>

        <div className="space-y-3">
          <div
            className={`rounded-xl p-4 backdrop-blur-sm ${
              freibetragGuenstiger ? 'bg-white/25 ring-2 ring-white/60' : 'bg-white/10'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-blue-50">Steuerersparnis durch Kinderfreibetrag</span>
              <span className="text-xl font-bold">{fmtEuro(steuerersparnis)} €</span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Freibetrag gesamt: {fmtEuro(freibetragGesamt)} € (alle Kinder, beide Eltern)
            </p>
          </div>

          <div
            className={`rounded-xl p-4 backdrop-blur-sm ${
              !freibetragGuenstiger ? 'bg-white/25 ring-2 ring-white/60' : 'bg-white/10'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-blue-50">Kindergeld im Jahr</span>
              <span className="text-xl font-bold">{fmtEuro(kindergeldJahr)} €</span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              {anzahlKinder} {anzahlKinder === 1 ? 'Kind' : 'Kinder'} × 259 € × 12 Monate
            </p>
          </div>
        </div>

        <p className="text-xs text-blue-200 mt-4">
          Hinweis: Das Finanzamt führt die Günstigerprüfung automatisch durch. Wirkt der
          Freibetrag, wird das bereits gezahlte Kindergeld mit der Steuer verrechnet.
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Günstigerprüfung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Kinderfreibetrag 2026:</strong> 9.756 € pro Kind und Jahr (6.828 € sächlicher
              Freibetrag + 2.928 € BEA-Freibetrag, jeweils für beide Eltern)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Kindergeld 2026:</strong> 259 € pro Kind und Monat, also 3.108 € im Jahr
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Das Finanzamt vergleicht automatisch beides und gewährt die <strong>für Sie günstigere
              Variante</strong> – Sie müssen nichts wählen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Der Freibetrag lohnt sich erst bei <strong>höherem Einkommen</strong> (oft ab ca. 85.000 €
              zu versteuerndem Einkommen für ein Kind bei Verheirateten).
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
        <div className="flex gap-3">
          <span className="text-xl">⚠️</span>
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Vereinfachte Berechnung – ohne Gewähr</p>
            <p>
              Dieser Rechner nutzt den Grundtarif §32a EStG 2026 (inkl. Splitting) und vergleicht
              die reine Tarif-Steuerersparnis mit dem Jahres-Kindergeld. <strong>Nicht berücksichtigt</strong>
              {' '}werden Solidaritätszuschlag, Kirchensteuer, weitere Freibeträge sowie individuelle
              Besonderheiten. Die Ergebnisse ersetzen keine Steuerberatung. Maßgeblich ist allein
              die Berechnung Ihres Finanzamts.
            </p>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://esth.bundesfinanzministerium.de/lsth/2026/A-Einkommensteuergesetz/IV-Tarif-31-34b/Paragraf-32a/inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – §32a EStG Einkommensteuertarif 2026
          </a>
          <a
            href="https://www.vlh.de/wissen-service/steuer-abc/wie-funktioniert-das-mit-dem-kinderfreibetrag.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            VLH – Kinderfreibetrag 2025/2026 & Günstigerprüfung
          </a>
          <a
            href="https://www.arbeitsagentur.de/familie-und-kinder/infos-rund-um-kindergeld/kindergeld-anspruch-hoehe-dauer"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesagentur für Arbeit – Kindergeld 2026 (259 €)
          </a>
        </div>
      </div>
    </div>
  );
}
