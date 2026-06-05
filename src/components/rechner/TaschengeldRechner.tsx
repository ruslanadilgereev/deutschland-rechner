import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Taschengeldtabelle nach DJI (Deutsches Jugendinstitut) / Jugendamt-Empfehlung
// Stand: zuletzt aktualisiert September 2024/2025 (DJI-Expertise)
// Quelle: https://www.dji.de/themen/jugend/taschengeld.html
// Bis einschließlich 9 Jahre: wöchentliche Auszahlung. Ab 10 Jahren: monatlich.
type Empfehlung = {
  von: number; // unterer Betrag der Spanne
  bis: number; // oberer Betrag der Spanne
  intervall: 'woche' | 'monat';
};

// Schlüssel = Alter des Kindes in Jahren (1–18)
const TABELLE: Record<number, Empfehlung> = {
  1: { von: 0, bis: 0, intervall: 'woche' },
  2: { von: 0, bis: 0, intervall: 'woche' },
  3: { von: 0, bis: 0, intervall: 'woche' },
  4: { von: 1, bis: 2, intervall: 'woche' },
  5: { von: 1, bis: 2, intervall: 'woche' },
  6: { von: 2, bis: 3, intervall: 'woche' },
  7: { von: 2, bis: 3, intervall: 'woche' },
  8: { von: 3, bis: 4, intervall: 'woche' },
  9: { von: 3, bis: 4, intervall: 'woche' },
  10: { von: 15, bis: 25, intervall: 'monat' },
  11: { von: 15, bis: 25, intervall: 'monat' },
  12: { von: 20, bis: 30, intervall: 'monat' },
  13: { von: 20, bis: 30, intervall: 'monat' },
  14: { von: 25, bis: 45, intervall: 'monat' },
  15: { von: 25, bis: 45, intervall: 'monat' },
  16: { von: 40, bis: 60, intervall: 'monat' },
  17: { von: 40, bis: 60, intervall: 'monat' },
  18: { von: 55, bis: 75, intervall: 'monat' },
};

function formatEuro(betrag: number): string {
  // ganze Beträge ohne Nachkommastellen, sonst mit Komma
  return Number.isInteger(betrag)
    ? betrag.toLocaleString('de-DE')
    : betrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TaschengeldRechner() {
  const [alter, setAlter] = useState(10);

  const empfehlung = TABELLE[alter];
  const istWoche = empfehlung.intervall === 'woche';
  const intervallLabel = istWoche ? 'Woche' : 'Monat';
  const mitte = (empfehlung.von + empfehlung.bis) / 2;
  const keinTaschengeld = empfehlung.von === 0 && empfehlung.bis === 0;

  // Hochrechnung auf Monat und Jahr (für Vergleichbarkeit)
  const proMonat = istWoche ? mitte * (52 / 12) : mitte;
  const proJahr = istWoche ? mitte * 52 : mitte * 12;

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Taschengeld-Rechner" rechnerSlug="taschengeld-rechner" />

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-2">
          <span className="text-gray-700 font-medium">Alter des Kindes</span>
        </label>
        <div className="mt-3 flex items-center justify-center gap-6">
          <button
            onClick={() => setAlter(Math.max(1, alter - 1))}
            className="w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40"
            disabled={alter <= 1}
            aria-label="Alter verringern"
          >
            −
          </button>
          <div className="text-center w-28">
            <span className="text-5xl font-bold text-amber-600">{alter}</span>
            <span className="block text-sm text-gray-500 mt-1">{alter === 1 ? 'Jahr' : 'Jahre'}</span>
          </div>
          <button
            onClick={() => setAlter(Math.min(18, alter + 1))}
            className="w-14 h-14 rounded-full bg-amber-500 text-2xl font-bold text-white hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-40"
            disabled={alter >= 18}
            aria-label="Alter erhöhen"
          >
            +
          </button>
        </div>

        {/* Slider zusätzlich */}
        <input
          type="range"
          min={1}
          max={18}
          value={alter}
          onChange={(e) => setAlter(Number(e.target.value))}
          className="w-full mt-6 accent-amber-500"
          aria-label="Alter per Schieberegler wählen"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 Jahr</span>
          <span>18 Jahre</span>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-amber-100 mb-1">
          Empfohlenes Taschengeld mit {alter} {alter === 1 ? 'Jahr' : 'Jahren'}
        </h3>

        {keinTaschengeld ? (
          <div className="mt-2">
            <p className="text-2xl font-bold">Noch kein Taschengeld</p>
            <p className="text-amber-100 text-sm mt-2">
              Für Kinder unter 4 Jahren sieht die DJI-Empfehlung noch kein regelmäßiges Taschengeld vor –
              das Konzept von Geld wird in diesem Alter noch nicht verstanden.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {formatEuro(empfehlung.von)}–{formatEuro(empfehlung.bis)}
                </span>
                <span className="text-xl text-amber-200">€ / {intervallLabel}</span>
              </div>
              <p className="text-amber-100 text-sm mt-1">
                Richtwert (Mitte der Spanne): <strong>{formatEuro(mitte)} € / {intervallLabel}</strong>
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-amber-100">Auszahlung</span>
                <span className="font-bold">{istWoche ? 'wöchentlich' : 'monatlich'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-100">Umgerechnet pro Monat</span>
                <span className="font-bold">~{formatEuro(Math.round(proMonat))} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-100">Umgerechnet pro Jahr</span>
                <span className="font-bold">~{formatEuro(Math.round(proJahr))} €</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Die Werte sind <strong>Empfehlungen des Deutschen Jugendinstituts (DJI)</strong> – es gibt kein Gesetz, das die Höhe vorschreibt.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Bis einschließlich <strong>9 Jahre wöchentlich</strong> auszahlen, <strong>ab 10 Jahren monatlich</strong> – so lernen Kinder, ihr Geld einzuteilen.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Taschengeld <strong>regelmäßig und pünktlich</strong> zahlen – unabhängig vom Verhalten oder von Noten.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Die Spanne gibt Spielraum: Passen Sie den Betrag an Familieneinkommen, Wohnort und Reife des Kindes an.</span>
          </li>
        </ul>
      </div>

      {/* Tipps */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">💡 Tipps für die Praxis</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-amber-50 rounded-xl">
            <span className="text-xl">🗓️</span>
            <div>
              <p className="font-medium text-amber-800">Fester Termin</p>
              <p className="text-amber-700">Zahlen Sie immer am selben Wochentag bzw. Monatsersten – Verlässlichkeit ist wichtiger als die genaue Höhe.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🧠</span>
            <div>
              <p className="font-medium text-green-800">Fehler erlauben</p>
              <p className="text-green-700">Wenn das Geld vorzeitig aufgebraucht ist: nicht aufstocken. Aus leeren Kassen lernt man am meisten.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📒</span>
            <div>
              <p className="font-medium text-blue-800">Budgetgeld ab ~14</p>
              <p className="text-blue-700">Ältere Jugendliche können zusätzlich ein „Budgetgeld“ für Kleidung oder Schulsachen bekommen – das übt eigenständiges Planen.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.dji.de/themen/jugend/taschengeld.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsches Jugendinstitut (DJI) – Taschengeld-Empfehlungen
          </a>
          <a
            href="https://www.mystipendium.de/geld/taschengeld"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            myStipendium – Taschengeldtabelle nach DJI
          </a>
        </div>
      </div>
    </div>
  );
}
