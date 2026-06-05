import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Umrechnung Leistung kW <-> PS
// Exakte Definition (DIN 66036): 1 PS = 735,49875 W = 0,73549875 kW
// Quelle: https://de.wikipedia.org/wiki/Pferdest%C3%A4rke (PTB / DIN 66036)
const KW_PRO_PS = 0.73549875; // 1 PS in kW (exakt)
const PS_PRO_KW = 1 / KW_PRO_PS; // 1 kW in PS (= 1,35962162...)

type Richtung = 'ps-zu-kw' | 'kw-zu-ps';

// Formatiert eine Zahl deutsch mit bis zu 2 Nachkommastellen, ohne überflüssige Nullen
function fmt(n: number): string {
  if (!isFinite(n)) return '0';
  return n.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function KwPsRechner() {
  const [richtung, setRichtung] = useState<Richtung>('ps-zu-kw');
  const [wert, setWert] = useState('100');

  const eingabe = parseFloat(wert.replace(',', '.'));
  const gueltig = !isNaN(eingabe) && eingabe >= 0;

  const ergebnis = gueltig
    ? richtung === 'ps-zu-kw'
      ? eingabe * KW_PRO_PS
      : eingabe * PS_PRO_KW
    : 0;

  const eingabeEinheit = richtung === 'ps-zu-kw' ? 'PS' : 'kW';
  const ergebnisEinheit = richtung === 'ps-zu-kw' ? 'kW' : 'PS';

  // Gängige Werte für die Umrechnungstabelle (in PS), inkl. zugehöriger kW
  const tabellePs = [50, 75, 100, 150, 200];
  // Gängige Werte für die Umrechnungstabelle (in kW)
  const tabelleKw = [50, 75, 100, 150, 200];

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="kW-PS-Rechner" rechnerSlug="kw-ps-rechner" />

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Richtungs-Umschalter */}
        <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setRichtung('ps-zu-kw')}
            className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
              richtung === 'ps-zu-kw'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            PS → kW
          </button>
          <button
            onClick={() => setRichtung('kw-zu-ps')}
            className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
              richtung === 'kw-zu-ps'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            kW → PS
          </button>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">
            Leistung in {eingabeEinheit}
          </span>
          <div className="mt-2 relative">
            <input
              type="text"
              inputMode="decimal"
              value={wert}
              onChange={(e) => setWert(e.target.value)}
              className="w-full text-2xl font-bold text-gray-800 border-2 border-gray-200 rounded-xl px-4 py-3 pr-16 focus:border-blue-500 focus:outline-none"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">
              {eingabeEinheit}
            </span>
          </div>
        </label>

        {!gueltig && wert.trim() !== '' && (
          <p className="text-sm text-red-500 mt-2">
            Bitte geben Sie einen gültigen Wert ein (z. B. 100).
          </p>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          {gueltig ? `${fmt(eingabe)} ${eingabeEinheit} entsprechen` : 'Ergebnis'}
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{fmt(ergebnis)}</span>
            <span className="text-2xl text-blue-200">{ergebnisEinheit}</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-100">Verwendete Formel</span>
            <span className="font-mono font-semibold">
              {richtung === 'ps-zu-kw'
                ? 'PS × 0,73549875'
                : 'kW × 1,35962'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-100">Faustregel</span>
            <span className="font-semibold">
              {richtung === 'ps-zu-kw' ? 'PS × 3/4' : 'kW × 4/3'}
            </span>
          </div>
        </div>
      </div>

      {/* Umrechnungstabelle */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Umrechnungstabelle gängiger Werte</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* PS -> kW */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
              PS → kW
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th className="text-left font-medium pb-1">PS</th>
                  <th className="text-right font-medium pb-1">kW</th>
                </tr>
              </thead>
              <tbody>
                {tabellePs.map((ps) => (
                  <tr key={ps} className="border-t border-gray-100">
                    <td className="py-1.5 font-medium text-gray-800">{ps}</td>
                    <td className="py-1.5 text-right text-gray-600">
                      {fmt(ps * KW_PRO_PS)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* kW -> PS */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
              kW → PS
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th className="text-left font-medium pb-1">kW</th>
                  <th className="text-right font-medium pb-1">PS</th>
                </tr>
              </thead>
              <tbody>
                {tabelleKw.map((kw) => (
                  <tr key={kw} className="border-t border-gray-100">
                    <td className="py-1.5 font-medium text-gray-800">{kw}</td>
                    <td className="py-1.5 text-right text-gray-600">
                      {fmt(kw * PS_PRO_KW)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ kW oder PS – was gilt?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>1 PS = 0,73549875 kW</strong> (exakt nach DIN 66036)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>1 kW = 1,35962 PS</strong> (Kehrwert)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Das <strong>Kilowatt (kW)</strong> ist in Deutschland seit dem
              <strong> 1. Januar 1978</strong> die einzig gesetzliche Einheit für
              Motorleistung
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              PS darf nur noch <strong>zusätzlich</strong> angegeben werden – die
              kW-Angabe muss im Vordergrund stehen
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Maßgeblich für Zulassung und{' '}
              <a href="/kfz-steuer-rechner" className="text-blue-600 hover:underline">
                Kfz-Steuer
              </a>{' '}
              ist immer der kW-Wert (Feld P.2 im Fahrzeugschein)
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Umrechnung erfolgt mit dem amtlichen Faktor
          und ist rein rechnerisch. Maßgeblich für Behörden, Versicherung und Steuer
          ist immer der im Fahrzeugschein eingetragene kW-Wert. Angaben ohne Gewähr.
        </p>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://de.wikipedia.org/wiki/Pferdest%C3%A4rke"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Wikipedia – Pferdestärke (DIN 66036, Definition & Faktor)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/einhv/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Einheitenverordnung (EinhV) – gesetzliche Einheiten in Deutschland
          </a>
        </div>
      </div>
    </div>
  );
}
