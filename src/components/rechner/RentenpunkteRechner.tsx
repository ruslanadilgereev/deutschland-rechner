import { useState } from 'react';

// Rentenpunkte / Entgeltpunkte 2026
// Quelle: Deutsche Rentenversicherung – Sozialversicherungsrechengrößen 2026,
// Rentenanpassung 2026 (Renten steigen zum 1. Juli 2026 um 4,24 %)
const DURCHSCHNITTSENTGELT_2026 = 51944; // € vorläufiges Durchschnittsentgelt 2026 (1 EP)
const RENTENWERT_AKTUELL = 40.79; // € pro Entgeltpunkt (seit 1. Juli 2025)
const RENTENWERT_AB_JULI_2026 = 42.52; // € pro Entgeltpunkt (ab 1. Juli 2026, +4,24 %)
const BBG_RV_2026 = 101400; // € Beitragsbemessungsgrenze Rente 2026 (bundeseinheitlich)
const MAX_EP_PRO_JAHR = BBG_RV_2026 / DURCHSCHNITTSENTGELT_2026; // ≈ 1,9521 EP

export default function RentenpunkteRechner() {
  const [bruttoJahr, setBruttoJahr] = useState(50000);
  const [jahre, setJahre] = useState(35);

  // Beitragspflichtiges Entgelt ist auf die BBG gedeckelt
  const beitragspflichtigesEntgelt = Math.min(bruttoJahr, BBG_RV_2026);
  const epProJahrRoh = beitragspflichtigesEntgelt / DURCHSCHNITTSENTGELT_2026;
  const epProJahr = Math.min(epProJahrRoh, MAX_EP_PRO_JAHR);
  const istGedeckelt = bruttoJahr > BBG_RV_2026;

  const epGesamt = epProJahr * jahre;
  const monatsRenteHeute = epGesamt * RENTENWERT_AKTUELL;
  const monatsRenteAbJuli2026 = epGesamt * RENTENWERT_AB_JULI_2026;
  const jahresRenteHeute = monatsRenteHeute * 12;

  const fmt = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtEP = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-6">
          <span className="text-gray-700 font-medium">Aktuelles Bruttojahresgehalt</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={bruttoJahr}
              onChange={(e) => setBruttoJahr(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 pr-12 text-2xl font-bold text-gray-800 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-medium">€</span>
          </div>
          <input
            type="range"
            min={0}
            max={120000}
            step={1000}
            value={Math.min(bruttoJahr, 120000)}
            onChange={(e) => setBruttoJahr(Number(e.target.value))}
            className="w-full mt-4 accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>120.000 €</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Beitragsjahre (optional, für Hochrechnung)</span>
          <div className="mt-3 flex items-center justify-center gap-6">
            <button
              onClick={() => setJahre(Math.max(1, jahre - 1))}
              className="w-12 h-12 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
              disabled={jahre <= 1}
              aria-label="Ein Jahr weniger"
            >
              −
            </button>
            <span className="text-4xl font-bold text-blue-600 w-20 text-center">{jahre}</span>
            <button
              onClick={() => setJahre(Math.min(50, jahre + 1))}
              className="w-12 h-12 rounded-full bg-blue-500 text-2xl font-bold text-white hover:bg-blue-600 active:scale-95 transition-all"
              aria-label="Ein Jahr mehr"
            >
              +
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Annahme: gleichbleibendes Gehaltsniveau über alle Jahre
          </p>
        </label>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-emerald-100 mb-1">Ihre Entgeltpunkte pro Jahr</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmtEP(epProJahr)}</span>
            <span className="text-xl text-emerald-200">EP / Jahr</span>
          </div>
          {istGedeckelt && (
            <p className="text-xs text-emerald-100 mt-1">
              Gedeckelt auf max. {fmtEP(MAX_EP_PRO_JAHR)} EP (Beitragsbemessungsgrenze 101.400 €)
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-emerald-100">Entgeltpunkte nach {jahre} Jahren</span>
              <span className="text-xl font-bold">{fmtEP(epGesamt)} EP</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-emerald-100">Monatsrente (Rentenwert heute)</span>
              <span className="text-xl font-bold">{fmt(monatsRenteHeute)} €</span>
            </div>
            <p className="text-xs text-emerald-200 mt-1">brutto, vor Steuern &amp; Kranken-/Pflegeversicherung</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-emerald-100">Monatsrente ab Juli 2026</span>
              <span className="text-xl font-bold">{fmt(monatsRenteAbJuli2026)} €</span>
            </div>
            <p className="text-xs text-emerald-200 mt-1">mit Rentenwert 42,52 € (+4,24 %)</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-emerald-100">Jahresrente (Rentenwert heute)</span>
              <span className="text-xl font-bold">{fmt(jahresRenteHeute)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formel-Hinweis */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Entgeltpunkte/Jahr</strong> = Bruttojahresgehalt ÷ Durchschnittsentgelt
          </p>
          <p className="font-mono text-xs text-gray-600">
            {beitragspflichtigesEntgelt.toLocaleString('de-DE')} € ÷ {DURCHSCHNITTSENTGELT_2026.toLocaleString('de-DE')} € = {fmtEP(epProJahr)} EP
          </p>
          <hr className="border-gray-200" />
          <p>
            <strong>Monatsrente</strong> = Entgeltpunkte × aktueller Rentenwert
          </p>
          <p className="font-mono text-xs text-gray-600">
            {fmtEP(epGesamt)} EP × {fmt(RENTENWERT_AKTUELL)} € = {fmt(monatsRenteHeute)} €
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Aktuelle Werte 2026</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Durchschnittsentgelt 2026:</strong> 51.944 € (vorläufig) – wer so viel verdient, bekommt genau 1,0 Entgeltpunkt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Aktueller Rentenwert:</strong> 40,79 € pro Entgeltpunkt (seit 1. Juli 2025)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Ab 1. Juli 2026:</strong> 42,52 € pro Entgeltpunkt (Rentenanpassung +4,24 %)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Maximal pro Jahr:</strong> ca. 1,9521 Entgeltpunkte (Beitragsbemessungsgrenze 101.400 € / 8.450 € im Monat)</span>
          </li>
        </ul>
      </div>

      {/* Wichtiger Hinweis */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Vereinfachte Hochrechnung</p>
              <p className="text-yellow-700">
                Der Rechner unterstellt ein gleichbleibendes Gehaltsniveau und nutzt den heutigen Rentenwert.
                Ihre tatsächliche Rente hängt von Ihrer gesamten Erwerbsbiografie und künftigen Rentenanpassungen ab.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">💶</span>
            <div>
              <p className="font-medium text-blue-800">Brutto-Rente</p>
              <p className="text-blue-700">
                Das Ergebnis ist die Brutto-Rente. Davon gehen noch Beiträge zur Kranken- und
                Pflegeversicherung sowie ggf. Steuern ab.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium text-green-800">Echte Werte in Ihrer Renteninformation</p>
              <p className="text-green-700">
                Ihren bereits erreichten Entgeltpunkte-Stand finden Sie in der jährlichen
                Renteninformation der Deutschen Rentenversicherung.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2026/260305-rentenanpassung-2026.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Rentenanpassung 2026 (+4,24 %)
          </a>
          <a
            href="https://www.deutsche-rentenversicherung.de/SharedDocs/Glossareintraege/DE/E/entgeltpunkte.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Entgeltpunkte (Glossar)
          </a>
          <a
            href="https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – Beitragsbemessungsgrenzen 2026
          </a>
        </div>
      </div>
    </div>
  );
}
