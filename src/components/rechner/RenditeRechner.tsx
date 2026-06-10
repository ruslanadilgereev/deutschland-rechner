import { useState } from 'react';

// Rendite-Rechner
// Formeln (kaufmaennische Standardformeln):
//   Gewinn          = Endkapital - Anfangskapital
//   Gesamtrendite   = Gewinn / Anfangskapital x 100
//   Rendite p.a.    = (Endkapital / Anfangskapital)^(1 / Jahre) - 1   (CAGR)
// Quellen: growney Finanzwiki (CAGR-Formel), DeltaValue (CAGR), Volksbanken (Rendite-Definition)

type Eingabe = 'endkapital' | 'gewinn';

export default function RenditeRechner() {
  const [anfangskapital, setAnfangskapital] = useState<number>(10000);
  const [eingabeArt, setEingabeArt] = useState<Eingabe>('endkapital');
  const [endkapital, setEndkapital] = useState<number>(15000);
  const [gewinn, setGewinn] = useState<number>(5000);
  const [jahre, setJahre] = useState<number>(5);
  const [monate, setMonate] = useState<number>(0);
  const [mitEinzahlungen, setMitEinzahlungen] = useState<boolean>(false);

  // Endkapital konsistent aus der gewaehlten Eingabeart ableiten
  const effektivesEndkapital =
    eingabeArt === 'endkapital' ? endkapital : anfangskapital + gewinn;

  const absoluterGewinn = effektivesEndkapital - anfangskapital;

  const gesamtJahre = jahre + monate / 12;

  // Gesamtrendite
  const gesamtrendite =
    anfangskapital > 0 ? (absoluterGewinn / anfangskapital) * 100 : 0;

  // Rendite p.a. (CAGR) - nur sinnvoll bei positivem Anfangskapital & Endkapital und Laufzeit > 0
  const cagrBerechenbar =
    anfangskapital > 0 && effektivesEndkapital > 0 && gesamtJahre > 0;
  const renditePa = cagrBerechenbar
    ? (Math.pow(effektivesEndkapital / anfangskapital, 1 / gesamtJahre) - 1) * 100
    : 0;

  const fmt = (n: number) =>
    n.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fmtPct = (n: number) =>
    n.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const istVerlust = absoluterGewinn < 0;

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Ihre Geldanlage</h2>

        {/* Anfangskapital */}
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Anfangskapital (eingesetzt)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={anfangskapital === 0 ? '' : anfangskapital}
              onChange={(e) => setAnfangskapital(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="z. B. 10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        {/* Umschalter Endkapital / Gewinn */}
        <div className="mb-3 flex rounded-xl bg-gray-100 p-1 text-sm font-medium">
          <button
            onClick={() => setEingabeArt('endkapital')}
            className={`flex-1 rounded-lg py-2 transition-all ${
              eingabeArt === 'endkapital'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Endkapital eingeben
          </button>
          <button
            onClick={() => setEingabeArt('gewinn')}
            className={`flex-1 rounded-lg py-2 transition-all ${
              eingabeArt === 'gewinn'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Gewinn eingeben
          </button>
        </div>

        {eingabeArt === 'endkapital' ? (
          <label className="block mb-5">
            <span className="text-gray-700 font-medium">Endkapital (heutiger Wert)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={endkapital === 0 ? '' : endkapital}
                onChange={(e) => setEndkapital(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="z. B. 15000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </label>
        ) : (
          <label className="block mb-5">
            <span className="text-gray-700 font-medium">Gewinn (Ertrag)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                value={gewinn === 0 ? '' : gewinn}
                onChange={(e) => setGewinn(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="z. B. 5000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <span className="mt-1 block text-xs text-gray-400">
              Negativer Wert für einen Verlust möglich.
            </span>
          </label>
        )}

        {/* Anlagedauer */}
        <span className="text-gray-700 font-medium">Anlagedauer</span>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <label className="block">
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={jahre === 0 ? '' : jahre}
                onChange={(e) => setJahre(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-16 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="5"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Jahre</span>
            </div>
          </label>
          <label className="block">
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={11}
                value={monate === 0 ? '' : monate}
                onChange={(e) =>
                  setMonate(Math.min(11, Math.max(0, parseInt(e.target.value) || 0)))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-20 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Monate</span>
            </div>
          </label>
        </div>

        {/* Optional: laufende Einzahlungen */}
        <label className="mt-4 flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={mitEinzahlungen}
            onChange={(e) => setMitEinzahlungen(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            Ich habe während der Laufzeit <strong>regelmäßig nachgezahlt</strong> (Sparplan)
          </span>
        </label>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Ihre Rendite p.&nbsp;a. (CAGR)</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {cagrBerechenbar ? `${renditePa >= 0 ? '+' : ''}${fmtPct(renditePa)}` : '–'}
            </span>
            <span className="text-xl text-blue-200">% pro Jahr</span>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            durchschnittliche jährliche Rendite (mit Zinseszins)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Gesamtrendite</span>
              <span className="text-xl font-bold">
                {gesamtrendite >= 0 ? '+' : ''}
                {fmtPct(gesamtrendite)} %
              </span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">{istVerlust ? 'Verlust' : 'Gewinn'} absolut</span>
              <span className="text-xl font-bold">
                {absoluterGewinn >= 0 ? '+' : ''}
                {fmt(absoluterGewinn)} €
              </span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Endkapital</span>
              <span className="text-xl font-bold">{fmt(effektivesEndkapital)} €</span>
            </div>
          </div>
        </div>

        {!cagrBerechenbar && (
          <p className="mt-4 text-sm text-blue-100">
            Bitte Anfangskapital, Endkapital und eine Anlagedauer größer 0 eingeben, damit die
            Rendite p.&nbsp;a. berechnet werden kann.
          </p>
        )}
      </div>

      {/* Hinweis Einzahlungen / IRR */}
      {mitEinzahlungen && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
            <span>⚠️</span> Achtung bei laufenden Einzahlungen
          </h3>
          <p className="text-sm text-amber-800">
            Wenn Sie während der Laufzeit nachgezahlt haben, ist die einfache CAGR nicht mehr exakt –
            sie behandelt Ihr gesamtes Endkapital so, als wäre es von Anfang an angelegt gewesen, und
            <strong> überschätzt dadurch die wahre Rendite</strong>. Für solche Fälle ist der
            <strong> interne Zinsfuß (IRR / Geldgewichtete Rendite)</strong> die korrekte Kennzahl,
            der jede Ein- und Auszahlung mit ihrem genauen Datum gewichtet. Nutzen Sie dann besser
            einen <a href="/zinseszins-rechner" className="underline font-medium">Zinseszins-Rechner mit Sparrate</a>
            {' '}oder eine IRR-Funktion (z.&nbsp;B. <code className="bg-amber-100 px-1 rounded">XINTZINSFUSS</code> in Excel).
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So rechnet der Rendite-Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Gesamtrendite</strong> = Gewinn ÷ Anfangskapital × 100</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Rendite p.&nbsp;a. (CAGR)</strong> = (Endkapital ÷ Anfangskapital)
              <sup>1 ÷ Jahre</sup> − 1
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Die CAGR berücksichtigt automatisch den <strong>Zinseszinseffekt</strong></span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Angaben <strong>vor Steuern, Gebühren und Inflation</strong> (Bruttorendite)</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <p className="text-xs text-gray-500">
          <strong>Hinweis:</strong> Alle Berechnungen erfolgen ohne Gewähr und ersetzen keine
          Anlage- oder Steuerberatung. Der Rechner liefert die kaufmännische Standardberechnung der
          Rendite und stellt keine Empfehlung zum Kauf oder Verkauf einer Geldanlage dar. Vergangene
          Renditen sind kein verlässlicher Indikator für die künftige Wertentwicklung.
        </p>
      </div>

    </div>
  );
}
