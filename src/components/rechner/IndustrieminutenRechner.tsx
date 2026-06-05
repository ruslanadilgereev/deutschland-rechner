import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Industrieminuten / Industriezeit (Dezimalzeit)
// 1 Stunde = 100 Industrieminuten | 1 Industrieminute = 1/100 Stunde = 36 Sekunden = 0,6 Normalminuten
// Quelle: https://de.wikipedia.org/wiki/Industrieminute
type Richtung = 'normal-zu-industrie' | 'industrie-zu-normal';

// Hilfsfunktion: Zahl mit deutschem Komma formatieren (max. 4 Nachkommastellen, ohne Nullen am Ende)
function deNum(value: number, maxFractionDigits = 4): string {
  if (!isFinite(value)) return '0';
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  });
}

export default function IndustrieminutenRechner() {
  const [richtung, setRichtung] = useState<Richtung>('normal-zu-industrie');

  // Normale Zeit -> Industriezeit
  const [stunden, setStunden] = useState('8');
  const [minuten, setMinuten] = useState('45');

  // Industriezeit -> Normale Zeit
  const [industrieStunden, setIndustrieStunden] = useState('8,75');

  // --- Berechnung: normale Zeit -> Industriezeit ---
  const std = parseInt(stunden || '0', 10) || 0;
  const min = parseInt(minuten || '0', 10) || 0;
  const minClamped = Math.min(Math.max(min, 0), 59);
  const stdClamped = Math.max(std, 0);

  const dezimalStunden = stdClamped + minClamped / 60; // z. B. 8,75
  const industrieMinutenGesamt = dezimalStunden * 100; // z. B. 875

  // --- Berechnung: Industriezeit -> normale Zeit ---
  const istInput = parseFloat((industrieStunden || '0').replace(',', '.')) || 0;
  const istClamped = Math.max(istInput, 0);
  const ganzeStunden = Math.floor(istClamped);
  const restNormalMinutenRaw = (istClamped - ganzeStunden) * 60; // Dezimalstunde * 60 = Normalminuten
  const restNormalMinuten = Math.round(restNormalMinutenRaw);
  // Rundung kann 60 ergeben -> auf nächste Stunde übertragen
  let normStunden = ganzeStunden;
  let normMinuten = restNormalMinuten;
  if (normMinuten >= 60) {
    normStunden += 1;
    normMinuten -= 60;
  }
  const istIndustrieMinuten = istClamped * 100; // Industriestunden -> Industrieminuten

  // Umrechnungstabelle (Normalminuten -> Industrieminuten)
  const tabelle = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((m) => ({
    normal: m,
    industrie: Math.round((m / 60) * 100 * 100) / 100, // auf 2 NK gerundet
  }));

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Industrieminuten-Rechner" rechnerSlug="industrieminuten-rechner" />

      {/* Richtungs-Umschalter */}
      <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setRichtung('normal-zu-industrie')}
            className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
              richtung === 'normal-zu-industrie'
                ? 'bg-blue-500 text-white shadow'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Normalzeit → Industriezeit
          </button>
          <button
            onClick={() => setRichtung('industrie-zu-normal')}
            className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
              richtung === 'industrie-zu-normal'
                ? 'bg-blue-500 text-white shadow'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Industriezeit → Normalzeit
          </button>
        </div>
      </div>

      {/* Eingabe + Ergebnis: Normalzeit -> Industriezeit */}
      {richtung === 'normal-zu-industrie' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <span className="text-gray-700 font-medium block mb-4">Normale Zeit (Stunden : Minuten)</span>
            <div className="flex items-end gap-3">
              <label className="flex-1">
                <span className="text-xs text-gray-500 block mb-1">Stunden</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={stunden}
                  onChange={(e) => setStunden(e.target.value)}
                  className="w-full text-3xl font-bold text-blue-600 border-2 border-gray-200 rounded-xl px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
                />
              </label>
              <span className="text-3xl font-bold text-gray-400 pb-3">:</span>
              <label className="flex-1">
                <span className="text-xs text-gray-500 block mb-1">Minuten (0–59)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  value={minuten}
                  onChange={(e) => setMinuten(e.target.value)}
                  className="w-full text-3xl font-bold text-blue-600 border-2 border-gray-200 rounded-xl px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
                />
              </label>
            </div>
            {min > 59 && (
              <p className="text-xs text-amber-600 mt-2">Minuten über 59 werden auf 59 begrenzt – tragen Sie Überträge bei den Stunden ein.</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium text-blue-100 mb-1">In Industriezeit</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{deNum(dezimalStunden, 4)}</span>
                <span className="text-xl text-blue-200">Industriestunden</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Industrieminuten gesamt</span>
                <span className="text-xl font-bold">{deNum(industrieMinutenGesamt, 2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Eingegebene Zeit</span>
                <span className="font-bold">
                  {stdClamped} h {minClamped.toString().padStart(2, '0')} min
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Eingabe + Ergebnis: Industriezeit -> Normalzeit */}
      {richtung === 'industrie-zu-normal' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <label className="block">
              <span className="text-gray-700 font-medium block mb-4">Industriezeit (Dezimalstunden, z. B. 8,75)</span>
              <input
                type="text"
                inputMode="decimal"
                value={industrieStunden}
                onChange={(e) => setIndustrieStunden(e.target.value)}
                className="w-full text-3xl font-bold text-blue-600 border-2 border-gray-200 rounded-xl px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
              />
              <span className="text-xs text-gray-500 block mt-2">
                Komma oder Punkt als Trennzeichen möglich. Entspricht {deNum(istIndustrieMinuten, 2)} Industrieminuten.
              </span>
            </label>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-medium text-blue-100 mb-1">In normaler Zeit</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {normStunden}:{normMinuten.toString().padStart(2, '0')}
                </span>
                <span className="text-xl text-blue-200">h:min</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Ausgeschrieben</span>
                <span className="font-bold">
                  {normStunden} Std. {normMinuten} Min.
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Industrieminuten</span>
                <span className="font-bold">{deNum(istIndustrieMinuten, 2)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Umrechnungstabelle */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Umrechnungstabelle (Minuten → Industrieminuten)</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left font-semibold px-4 py-2">Normale Minuten</th>
                <th className="text-right font-semibold px-4 py-2">Industrieminuten</th>
              </tr>
            </thead>
            <tbody>
              {tabelle.map((row, i) => (
                <tr key={row.normal} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-2 text-gray-700">{row.normal} min</td>
                  <td className="px-4 py-2 text-right font-medium text-blue-600">
                    {deNum(row.industrie, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          30 Minuten = 50 Industrieminuten, 15 Minuten = 25 Industrieminuten, 60 Minuten = 100 Industrieminuten (1 Industriestunde).
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Umrechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Eine Stunde wird in <strong>100 Industrieminuten</strong> geteilt (statt 60).</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>1 Industrieminute = <strong>1/100 Stunde = 36 Sekunden = 0,6 normale Minuten</strong>.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Normalzeit → Industriezeit: <strong>Stunden + Minuten ÷ 60</strong>. Beispiel: 8:45 → 8 + 45÷60 = 8,75.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Industriezeit → Normalzeit: <strong>Nachkommastellen × 60</strong>. Beispiel: 8,75 → 0,75 × 60 = 45 Minuten.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Genutzt für <strong>Zeiterfassung, Stundenzettel und Lohnabrechnung</strong>, weil Dezimalwerte sich leicht multiplizieren lassen.</span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://de.wikipedia.org/wiki/Industrieminute"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Wikipedia – Industrieminute (Definition, 36 Sekunden, Formel)
          </a>
          <a
            href="https://www.personio.com/hr-lexicon/hours-to-decimal-calculator/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Personio HR-Lexikon – Industrieminuten umrechnen
          </a>
          <a
            href="https://www.hrworks.de/lexikon/industrieminuten/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            HRworks Lexikon – Industrieminuten berechnen
          </a>
        </div>
      </div>
    </div>
  );
}
