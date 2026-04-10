import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

type Modus = 'gewinn' | 'endwert';

const BENCHMARKS = [
  { name: 'DAX (Ø 30 Jahre)', rendite: 7.5, color: 'bg-blue-100 text-blue-800' },
  { name: 'MSCI World (Ø 30 Jahre)', rendite: 8.0, color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Tagesgeld (aktuell)', rendite: 3.0, color: 'bg-green-100 text-green-800' },
  { name: 'Festgeld 1 Jahr', rendite: 3.5, color: 'bg-emerald-100 text-emerald-800' },
  { name: 'Inflation (Ø)', rendite: 2.0, color: 'bg-amber-100 text-amber-800' },
  { name: 'Immobilien (Ø)', rendite: 4.5, color: 'bg-purple-100 text-purple-800' },
];

export default function RentabilitaetRechner() {
  const [investition, setInvestition] = useState<number>(10000);
  const [modus, setModus] = useState<Modus>('gewinn');
  const [gewinn, setGewinn] = useState<number>(2500);
  const [endwert, setEndwert] = useState<number>(12500);
  const [laufzeit, setLaufzeit] = useState<number>(1);
  const [jaehrlicheEinnahmen, setJaehrlicheEinnahmen] = useState<number>(0);
  const [eigenkapital, setEigenkapital] = useState<number>(0);
  const [berechnet, setBerechnet] = useState(false);

  const ergebnis = useMemo(() => {
    if (!investition || investition <= 0) return null;

    // Gewinn berechnen je nach Modus
    const effektiverGewinn = modus === 'gewinn' ? gewinn : (endwert - investition);
    
    // ROI = Gewinn / Investition
    const roi = (effektiverGewinn / investition) * 100;

    // Annualisierter ROI (CAGR)
    let roiPA: number | null = null;
    if (laufzeit && laufzeit > 0) {
      const gesamtfaktor = 1 + effektiverGewinn / investition;
      if (gesamtfaktor > 0) {
        roiPA = (Math.pow(gesamtfaktor, 1 / laufzeit) - 1) * 100;
      }
    }

    // Kapitalrendite (Gesamtkapitalrendite)
    const kapitalrendite = roi;

    // Eigenkapitalrendite (wenn EK angegeben)
    let eigenkapitalrendite: number | null = null;
    if (eigenkapital > 0 && eigenkapital <= investition) {
      eigenkapitalrendite = (effektiverGewinn / eigenkapital) * 100;
    }

    // Amortisationszeit
    let amortisation: number | null = null;
    if (jaehrlicheEinnahmen > 0) {
      amortisation = investition / jaehrlicheEinnahmen;
    }

    // Effektiver Endwert
    const effektiverEndwert = modus === 'endwert' ? endwert : (investition + gewinn);

    // Verdopplungszeit (bei positivem ROI p.a.)
    let verdopplungszeit: number | null = null;
    if (roiPA && roiPA > 0) {
      verdopplungszeit = Math.log(2) / Math.log(1 + roiPA / 100);
    }

    return {
      effektiverGewinn,
      roi,
      roiPA,
      kapitalrendite,
      eigenkapitalrendite,
      amortisation,
      effektiverEndwert,
      verdopplungszeit,
      istPositiv: roi >= 0,
    };
  }, [investition, modus, gewinn, endwert, laufzeit, jaehrlicheEinnahmen, eigenkapital]);

  const formatCurrency = (n: number) =>
    n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  const formatPercent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  const formatJahre = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Jahre';

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          Rentabilität berechnen
        </h2>

        <div className="space-y-6">
          {/* Investitionssumme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investitionssumme (€)
            </label>
            <input
              type="number"
              value={investition}
              onChange={(e) => setInvestition(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
              placeholder="z.B. 10.000"
              min={0}
              step={100}
            />
          </div>

          {/* Modus-Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Berechnungsmodus
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setModus('gewinn')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  modus === 'gewinn'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                💰 Gewinn eingeben
              </button>
              <button
                onClick={() => setModus('endwert')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  modus === 'endwert'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                🏦 Endwert eingeben
              </button>
            </div>
          </div>

          {/* Gewinn oder Endwert */}
          {modus === 'gewinn' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gewinn / Erlös (€)
              </label>
              <input
                type="number"
                value={gewinn}
                onChange={(e) => setGewinn(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                placeholder="z.B. 2.500"
                step={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                Nettogewinn nach Abzug aller Kosten. Negative Werte möglich (Verlust).
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endwert / Rückfluss (€)
              </label>
              <input
                type="number"
                value={endwert}
                onChange={(e) => setEndwert(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                placeholder="z.B. 12.500"
                min={0}
                step={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                Gesamtwert am Ende der Investition (inkl. Anfangskapital).
              </p>
            </div>
          )}

          {/* Laufzeit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Laufzeit (Jahre)
            </label>
            <input
              type="number"
              value={laufzeit}
              onChange={(e) => setLaufzeit(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
              placeholder="z.B. 5"
              min={0.1}
              step={0.5}
            />
            <p className="text-xs text-gray-500 mt-1">
              Für die Berechnung der annualisierten Rendite (CAGR / ROI p.a.)
            </p>
          </div>

          {/* Erweiterte Optionen */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="text-sm font-semibold text-purple-800 mb-3">
              ⚙️ Erweiterte Optionen (optional)
            </h3>

            <div className="space-y-4">
              {/* Jährliche Einnahmen für Amortisation */}
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">
                  Jährliche Einnahmen (€) – für Amortisationszeit
                </label>
                <input
                  type="number"
                  value={jaehrlicheEinnahmen || ''}
                  onChange={(e) => setJaehrlicheEinnahmen(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="z.B. 2.000"
                  min={0}
                  step={100}
                />
              </div>

              {/* Eigenkapital */}
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">
                  Eigenkapital (€) – für Eigenkapitalrendite
                </label>
                <input
                  type="number"
                  value={eigenkapital || ''}
                  onChange={(e) => setEigenkapital(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="z.B. 5.000"
                  min={0}
                  step={100}
                />
                <p className="text-xs text-purple-600 mt-1">
                  Bei Fremdfinanzierung: nur Ihr eingesetztes Kapital (Leverage-Effekt).
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleBerechnen}
            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl"
          >
            📈 Rentabilität berechnen
          </button>
        </div>
      </div>

      {/* Ergebnis */}
      {berechnet && ergebnis && (
        <>
          {/* Haupt-Ergebnis */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Ihr Ergebnis
            </h2>

            {/* ROI Großanzeige */}
            <div className="text-center mb-6">
              <div className="text-gray-500 text-sm mb-1">Return on Investment (ROI)</div>
              <div className={`inline-block px-8 py-4 rounded-2xl ${
                ergebnis.istPositiv
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-red-500 to-rose-500'
              } text-white`}>
                <div className="text-4xl font-bold">
                  {ergebnis.roi >= 0 ? '+' : ''}{formatPercent(ergebnis.roi)}
                </div>
              </div>
              {ergebnis.roiPA !== null && (
                <div className="mt-3">
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                    ergebnis.roiPA >= 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    📅 {ergebnis.roiPA >= 0 ? '+' : ''}{formatPercent(ergebnis.roiPA)} p.a. (annualisiert)
                  </span>
                </div>
              )}
            </div>

            {/* Gewinn/Verlust + Endwert */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`text-center p-4 rounded-xl ${ergebnis.istPositiv ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-sm text-gray-500 mb-1">
                  {ergebnis.istPositiv ? 'Gewinn' : 'Verlust'}
                </div>
                <div className={`text-2xl font-bold ${ergebnis.istPositiv ? 'text-green-700' : 'text-red-700'}`}>
                  {ergebnis.effektiverGewinn >= 0 ? '+' : ''}{formatCurrency(ergebnis.effektiverGewinn)}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-purple-50">
                <div className="text-sm text-gray-500 mb-1">Endwert</div>
                <div className="text-2xl font-bold text-purple-700">
                  {formatCurrency(ergebnis.effektiverEndwert)}
                </div>
              </div>
            </div>

            {/* Detail-Tabelle */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Investitionssumme</span>
                <span className="font-medium text-gray-800">{formatCurrency(investition)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  {ergebnis.istPositiv ? 'Gewinn' : 'Verlust'}
                </span>
                <span className={`font-medium ${ergebnis.istPositiv ? 'text-green-600' : 'text-red-600'}`}>
                  {ergebnis.effektiverGewinn >= 0 ? '+' : ''}{formatCurrency(ergebnis.effektiverGewinn)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Gesamtkapitalrendite (ROI)</span>
                <span className={`font-bold ${ergebnis.istPositiv ? 'text-green-600' : 'text-red-600'}`}>
                  {ergebnis.roi >= 0 ? '+' : ''}{formatPercent(ergebnis.roi)}
                </span>
              </div>
              {ergebnis.roiPA !== null && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Rendite p.a. (CAGR)</span>
                  <span className={`font-bold ${(ergebnis.roiPA ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(ergebnis.roiPA ?? 0) >= 0 ? '+' : ''}{formatPercent(ergebnis.roiPA ?? 0)}
                  </span>
                </div>
              )}
              {ergebnis.eigenkapitalrendite !== null && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Eigenkapitalrendite</span>
                  <span className={`font-bold ${(ergebnis.eigenkapitalrendite ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(ergebnis.eigenkapitalrendite ?? 0) >= 0 ? '+' : ''}{formatPercent(ergebnis.eigenkapitalrendite ?? 0)}
                  </span>
                </div>
              )}
              {ergebnis.amortisation !== null && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Amortisationszeit</span>
                  <span className="font-bold text-purple-700">
                    {formatJahre(ergebnis.amortisation ?? 0)}
                  </span>
                </div>
              )}
              {ergebnis.verdopplungszeit !== null && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Verdopplungszeit (72er-Regel)</span>
                  <span className="font-medium text-gray-800">
                    ≈ {formatJahre(ergebnis.verdopplungszeit ?? 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 bg-purple-50 -mx-2 px-4 rounded-lg">
                <span className="font-bold text-purple-800">Endwert</span>
                <span className="font-bold text-purple-800 text-xl">{formatCurrency(ergebnis.effektiverEndwert)}</span>
              </div>
            </div>
          </div>

          {/* Visueller ROI-Vergleich */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Vergleich: Ihre Rendite vs. Benchmarks
            </h2>

            <div className="space-y-3">
              {/* Eigenes Ergebnis */}
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-purple-700">🎯 Ihre Rendite p.a.</span>
                  <span className={`text-sm font-bold ${
                    (ergebnis.roiPA ?? ergebnis.roi) >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatPercent(ergebnis.roiPA ?? ergebnis.roi)}
                  </span>
                </div>
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (ergebnis.roiPA ?? ergebnis.roi) >= 0
                        ? 'bg-gradient-to-r from-purple-500 to-violet-500'
                        : 'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                    style={{
                      width: `${Math.min(Math.max(Math.abs(ergebnis.roiPA ?? ergebnis.roi) / 15 * 100, 2), 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Benchmarks */}
              {BENCHMARKS.map((b) => (
                <div key={b.name} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{b.name}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatPercent(b.rendite)}
                    </span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-300 rounded-full"
                      style={{ width: `${Math.min(b.rendite / 15 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {ergebnis.roiPA !== null && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                (ergebnis.roiPA ?? 0) > 7.5
                  ? 'bg-green-50 text-green-800'
                  : (ergebnis.roiPA ?? 0) > 2
                    ? 'bg-blue-50 text-blue-800'
                    : 'bg-amber-50 text-amber-800'
              }`}>
                {(ergebnis.roiPA ?? 0) > 7.5
                  ? '🚀 Ihre Rendite liegt über dem langfristigen DAX-Durchschnitt – eine überdurchschnittliche Investition!'
                  : (ergebnis.roiPA ?? 0) > 2
                    ? '✅ Ihre Rendite liegt über der Inflationsrate – Ihre Kaufkraft wächst real.'
                    : (ergebnis.roiPA ?? 0) > 0
                      ? '⚠️ Ihre Rendite liegt unter der Inflationsrate – real verlieren Sie Kaufkraft.'
                      : '❌ Diese Investition ist defizitär – Sie machen Verlust.'}
              </div>
            )}
          </div>

          {/* Formel-Box */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📐</span>
              Ihre Berechnung im Detail
            </h2>

            <div className="space-y-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">ROI-Formel:</h3>
                <div className="bg-white p-3 rounded border border-gray-200 font-mono text-center">
                  ROI = (Gewinn ÷ Investition) × 100
                </div>
                <p className="mt-2 text-gray-600">
                  = ({formatCurrency(ergebnis.effektiverGewinn)} ÷ {formatCurrency(investition)}) × 100 = <strong>{formatPercent(ergebnis.roi)}</strong>
                </p>
              </div>

              {ergebnis.roiPA !== null && laufzeit > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">CAGR (annualisierte Rendite):</h3>
                  <div className="bg-white p-3 rounded border border-gray-200 font-mono text-center text-xs">
                    CAGR = ((Endwert ÷ Anfangswert)^(1÷Jahre) - 1) × 100
                  </div>
                  <p className="mt-2 text-gray-600">
                    = (({formatCurrency(ergebnis.effektiverEndwert)} ÷ {formatCurrency(investition)})^(1÷{laufzeit}) - 1) × 100 = <strong>{formatPercent(ergebnis.roiPA ?? 0)}</strong>
                  </p>
                </div>
              )}

              {ergebnis.eigenkapitalrendite !== null && eigenkapital > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Eigenkapitalrendite (Leverage):</h3>
                  <div className="bg-white p-3 rounded border border-gray-200 font-mono text-center">
                    EK-Rendite = (Gewinn ÷ Eigenkapital) × 100
                  </div>
                  <p className="mt-2 text-gray-600">
                    = ({formatCurrency(ergebnis.effektiverGewinn)} ÷ {formatCurrency(eigenkapital)}) × 100 = <strong>{formatPercent(ergebnis.eigenkapitalrendite ?? 0)}</strong>
                  </p>
                  {eigenkapital < investition && (
                    <p className="mt-2 text-purple-600">
                      💡 Durch Fremdfinanzierung von {formatCurrency(investition - eigenkapital)} steigt Ihre EK-Rendite von {formatPercent(ergebnis.roi)} auf {formatPercent(ergebnis.eigenkapitalrendite ?? 0)} (Leverage-Effekt).
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hinweise */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Tipps zur Rentabilitätsberechnung
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-xl">✅</span>
                <p className="text-green-800">
                  <strong>Alle Kosten einrechnen:</strong> Berücksichtigen Sie Nebenkosten,
                  Steuern, Inflation und Opportunitätskosten für ein realistisches Bild.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">📅</span>
                <p className="text-blue-800">
                  <strong>ROI p.a. vergleichen:</strong> Nur die annualisierte Rendite (CAGR) macht
                  Investitionen mit unterschiedlicher Laufzeit vergleichbar.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="text-xl">⚠️</span>
                <p className="text-amber-800">
                  <strong>Risiko beachten:</strong> Höhere Rendite bedeutet meist höheres Risiko.
                  Vergleichen Sie risikoadjustiert (Sharpe Ratio).
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-xl">🏠</span>
                <p className="text-purple-800">
                  <strong>Eigenkapitalrendite:</strong> Durch Fremdfinanzierung (z.B. Immobilienkredit)
                  kann die EK-Rendite deutlich über der Gesamtrendite liegen – aber das Risiko steigt.
                </p>
              </div>
            </div>
          <RechnerFeedback rechnerName="Rentabilitäts-Rechner" rechnerSlug="rentabilitaets-rechner" />
      </div>
        </>
      )}
    </div>
  );
}
