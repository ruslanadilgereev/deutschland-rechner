import { useState, useMemo } from 'react';

// Rentenlücke-Rechner 2025/2026
// Quellen: Deutsche Rentenversicherung, Stiftung Warentest, BMAS

const DEFAULTS = {
  rentenniveauNetto: 48,           // % des Durchschnittsnettos (Eckrente)
  bedarfsQuote: 80,                // % des letzten Nettos als Bedarf im Alter
  inflation: 2.0,                  // % jährliche Inflation
  renditeVorRente: 5.0,            // % Rendite in Ansparphase (konservativ)
  renditeInRente: 3.0,             // % Rendite in Entnahmephase
  lebenserwartungMann: 82,         // Jahre (2024, Destatis)
  lebenserwartungFrau: 85,         // Jahre (2024, Destatis)
};

interface RentenlueckeResult {
  monatlicheLuecke: number;
  monatlicheLueckeInflationsbereinigt: number;
  jahresluecke: number;
  benoetigtesKapitalVerzehr: number;
  benoetigtesKapitalEwig: number;
  sparrateVerzehr: number;
  sparrateEwig: number;
  rentendauerJahre: number;
  gewuenschteRente: number;
  gesetzlicheRenteReal: number;
  sparzeitJahre: number;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
};

export default function RentenlueckeRechner() {
  // Input State
  const [alter, setAlter] = useState<number>(35);
  const [rentenalter, setRentenalter] = useState<number>(67);
  const [nettoEinkommen, setNettoEinkommen] = useState<number>(3000);
  const [gesetzlicheRente, setGesetzlicheRente] = useState<number>(1400);
  const [bedarfsQuote, setBedarfsQuote] = useState<number>(80);
  const [geschlecht, setGeschlecht] = useState<'mann' | 'frau'>('mann');
  const [inflationBeruecksichtigen, setInflationBeruecksichtigen] = useState<boolean>(true);
  const [renditeAnsparphase, setRenditeAnsparphase] = useState<number>(5);
  const [renditeEntnahmephase, setRenditeEntnahmephase] = useState<number>(3);
  const [entnahmeStrategie, setEntnahmeStrategie] = useState<'verzehr' | 'ewig'>('verzehr');
  
  // Detail-Ansicht
  const [showDetails, setShowDetails] = useState(false);

  const result = useMemo<RentenlueckeResult | null>(() => {
    if (alter >= rentenalter || nettoEinkommen <= 0) return null;

    const sparzeitJahre = rentenalter - alter;
    const lebenserwartung = geschlecht === 'mann' ? DEFAULTS.lebenserwartungMann : DEFAULTS.lebenserwartungFrau;
    const rentendauerJahre = Math.max(lebenserwartung - rentenalter, 10);
    
    // Gewünschte Rente = Bedarf im Alter
    const gewuenschteRente = nettoEinkommen * (bedarfsQuote / 100);
    
    // Monatliche Lücke (nominal heute)
    const monatlicheLueckeHeute = Math.max(0, gewuenschteRente - gesetzlicheRente);
    
    // Inflationsbereinigung: Was ist die Lücke in Kaufkraft bei Renteneintritt wert?
    const inflationsRate = inflationBeruecksichtigen ? DEFAULTS.inflation / 100 : 0;
    const inflationsFaktor = Math.pow(1 + inflationsRate, sparzeitJahre);
    
    // Die Lücke in zukünftigen Euro (was man tatsächlich braucht)
    const monatlicheLueckeInflationsbereinigt = monatlicheLueckeHeute * inflationsFaktor;
    const jahresluecke = monatlicheLueckeInflationsbereinigt * 12;

    // Benötigtes Kapital bei Kapitalverzehr (Entnahme mit Zins)
    // Barwert einer nachschüssigen Rente
    const r = renditeEntnahmephase / 100;
    const n = rentendauerJahre;
    let benoetigtesKapitalVerzehr: number;
    
    if (r === 0) {
      benoetigtesKapitalVerzehr = jahresluecke * n;
    } else {
      // Rentenbarwertfaktor
      const barwertfaktor = (1 - Math.pow(1 + r, -n)) / r;
      benoetigtesKapitalVerzehr = jahresluecke * barwertfaktor;
    }

    // Benötigtes Kapital bei ewiger Rente (nur Zinsen entnehmen)
    const benoetigtesKapitalEwig = r > 0 ? jahresluecke / r : jahresluecke * 100;

    // Notwendige Sparrate berechnen (Endwert einer vorschüssigen Sparrate)
    const rSpar = renditeAnsparphase / 100 / 12; // monatliche Rendite
    const nSpar = sparzeitJahre * 12; // Monate
    
    let sparrateVerzehr: number;
    let sparrateEwig: number;

    if (rSpar === 0) {
      sparrateVerzehr = benoetigtesKapitalVerzehr / nSpar;
      sparrateEwig = benoetigtesKapitalEwig / nSpar;
    } else {
      // Endwertfaktor vorschüssig: ((1+r)^n - 1) / r * (1+r)
      const endwertfaktor = ((Math.pow(1 + rSpar, nSpar) - 1) / rSpar) * (1 + rSpar);
      sparrateVerzehr = benoetigtesKapitalVerzehr / endwertfaktor;
      sparrateEwig = benoetigtesKapitalEwig / endwertfaktor;
    }

    return {
      monatlicheLuecke: monatlicheLueckeHeute,
      monatlicheLueckeInflationsbereinigt,
      jahresluecke,
      benoetigtesKapitalVerzehr,
      benoetigtesKapitalEwig,
      sparrateVerzehr,
      sparrateEwig,
      rentendauerJahre,
      gewuenschteRente,
      gesetzlicheRenteReal: gesetzlicheRente,
      sparzeitJahre,
    };
  }, [alter, rentenalter, nettoEinkommen, gesetzlicheRente, bedarfsQuote, geschlecht, inflationBeruecksichtigen, renditeAnsparphase, renditeEntnahmephase]);

  const hatLuecke = result && result.monatlicheLuecke > 0;
  const selectedKapital = entnahmeStrategie === 'verzehr' ? result?.benoetigtesKapitalVerzehr : result?.benoetigtesKapitalEwig;
  const selectedSparrate = entnahmeStrategie === 'verzehr' ? result?.sparrateVerzehr : result?.sparrateEwig;

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Deine Daten</h2>
        
        <div className="space-y-4">
          {/* Geschlecht */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geschlecht
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="geschlecht"
                  checked={geschlecht === 'mann'}
                  onChange={() => setGeschlecht('mann')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">Mann</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="geschlecht"
                  checked={geschlecht === 'frau'}
                  onChange={() => setGeschlecht('frau')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">Frau</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Für Lebenserwartung: Männer Ø {DEFAULTS.lebenserwartungMann} J., Frauen Ø {DEFAULTS.lebenserwartungFrau} J.
            </p>
          </div>

          {/* Aktuelles Alter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aktuelles Alter: <span className="font-bold text-indigo-600">{alter} Jahre</span>
            </label>
            <input
              type="range"
              min="18"
              max="66"
              value={alter}
              onChange={(e) => setAlter(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>18</span>
              <span>40</span>
              <span>66</span>
            </div>
          </div>

          {/* Gewünschtes Rentenalter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gewünschtes Rentenalter: <span className="font-bold text-indigo-600">{rentenalter} Jahre</span>
            </label>
            <input
              type="range"
              min={Math.max(alter + 1, 60)}
              max="70"
              value={rentenalter}
              onChange={(e) => setRentenalter(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>60</span>
              <span>67 (Regel)</span>
              <span>70</span>
            </div>
          </div>

          {/* Aktuelles Nettoeinkommen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aktuelles Nettoeinkommen (monatlich) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={nettoEinkommen || ''}
                onChange={(e) => setNettoEinkommen(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="3000"
                min="0"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
          </div>

          {/* Erwartete gesetzliche Rente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Erwartete gesetzliche Rente (netto) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={gesetzlicheRente || ''}
                onChange={(e) => setGesetzlicheRente(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1400"
                min="0"
                step="50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Finden Sie Ihre Werte im jährlichen Rentenbescheid oder nutzen Sie unseren{' '}
              <a href="/renten-rechner" className="text-indigo-600 hover:underline">Rentenrechner</a>
            </p>
          </div>

          {/* Bedarf im Alter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gewünschter Lebensstandard: <span className="font-bold text-indigo-600">{bedarfsQuote}%</span> des Nettos
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={bedarfsQuote}
              onChange={(e) => setBedarfsQuote(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50% (minimal)</span>
              <span>80% (empfohlen)</span>
              <span>100%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Faustregel: 70-80% reichen meist, da Kosten wie Pendeln oder Sparen wegfallen
            </p>
          </div>
        </div>

        {/* Erweiterte Optionen */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Erweiterte Einstellungen
          </button>
          
          {showDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              {/* Inflation */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="inflation"
                  checked={inflationBeruecksichtigen}
                  onChange={(e) => setInflationBeruecksichtigen(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="inflation" className="text-sm text-gray-700">
                  Inflation berücksichtigen ({DEFAULTS.inflation}% p.a.)
                </label>
              </div>

              {/* Entnahmestrategie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entnahmestrategie in der Rente
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="strategie"
                      checked={entnahmeStrategie === 'verzehr'}
                      onChange={() => setEntnahmeStrategie('verzehr')}
                      className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-sm font-medium">Kapitalverzehr</div>
                      <div className="text-xs text-gray-500">Kapital + Zinsen werden aufgebraucht (bis Lebensende)</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-lg hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="strategie"
                      checked={entnahmeStrategie === 'ewig'}
                      onChange={() => setEntnahmeStrategie('ewig')}
                      className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-sm font-medium">Ewige Rente</div>
                      <div className="text-xs text-gray-500">Nur Zinsen entnehmen, Kapital bleibt erhalten (z.B. für Erben)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Rendite Ansparphase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rendite Ansparphase: <span className="font-bold">{formatPercent(renditeAnsparphase)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={renditeAnsparphase}
                  onChange={(e) => setRenditeAnsparphase(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Erwartete Rendite während des Sparens (ETF-Sparplan: ~5-7%)</p>
              </div>

              {/* Rendite Entnahmephase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rendite Entnahmephase: <span className="font-bold">{formatPercent(renditeEntnahmephase)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.5"
                  value={renditeEntnahmephase}
                  onChange={(e) => setRenditeEntnahmephase(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Rendite im Ruhestand (konservativer angelegt: ~2-4%)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      {result && (
        <>
          {/* Hauptergebnis */}
          <div className={`rounded-2xl shadow-lg p-6 text-white ${
            hatLuecke 
              ? 'bg-gradient-to-br from-orange-500 to-red-600' 
              : 'bg-gradient-to-br from-green-500 to-emerald-600'
          }`}>
            <h3 className="text-lg font-medium opacity-90 mb-2">
              {hatLuecke ? '⚠️ Deine monatliche Rentenlücke' : '✅ Keine Rentenlücke!'}
            </h3>
            
            {hatLuecke ? (
              <>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold mb-2">
                    {formatCurrency(result.monatlicheLuecke)}
                  </div>
                  <div className="opacity-80 text-sm">
                    pro Monat in heutiger Kaufkraft
                  </div>
                  {inflationBeruecksichtigen && (
                    <div className="text-sm mt-2 opacity-90">
                      ≈ {formatCurrency(result.monatlicheLueckeInflationsbereinigt)} bei Renteneintritt (inkl. Inflation)
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                    <div className="text-xl font-bold">{formatCurrency(result.gewuenschteRente)}</div>
                    <div className="opacity-80 text-sm">Gewünschte Rente</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                    <div className="text-xl font-bold">{formatCurrency(result.gesetzlicheRenteReal)}</div>
                    <div className="opacity-80 text-sm">Gesetzliche Rente</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-2xl font-semibold mb-2">
                  Deine gesetzliche Rente deckt deinen Bedarf!
                </div>
                <div className="opacity-90">
                  {formatCurrency(gesetzlicheRente)} ≥ {formatCurrency(result.gewuenschteRente)} Bedarf
                </div>
              </div>
            )}
          </div>

          {/* Lösungsvorschlag */}
          {hatLuecke && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                💡 So schließt du die Lücke
              </h3>

              {/* Tabs für Strategie */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setEntnahmeStrategie('verzehr')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    entnahmeStrategie === 'verzehr'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Kapitalverzehr
                </button>
                <button
                  onClick={() => setEntnahmeStrategie('ewig')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    entnahmeStrategie === 'ewig'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Ewige Rente
                </button>
              </div>

              <div className="space-y-4">
                {/* Benötigtes Kapital */}
                <div className="bg-indigo-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-indigo-600 font-medium">Benötigtes Kapital</div>
                      <div className="text-xs text-indigo-500">bei Renteneintritt</div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-700">
                      {formatCurrency(selectedKapital || 0)}
                    </div>
                  </div>
                </div>

                {/* Notwendige Sparrate */}
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-green-600 font-medium">Notwendige Sparrate</div>
                      <div className="text-xs text-green-500">monatlich ab heute</div>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(selectedSparrate || 0)}
                    </div>
                  </div>
                </div>

                {/* Info zur gewählten Strategie */}
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {entnahmeStrategie === 'verzehr' ? (
                    <>
                      <strong>Kapitalverzehr:</strong> Das Kapital reicht für {result.rentendauerJahre} Jahre 
                      (bis ca. {geschlecht === 'mann' ? DEFAULTS.lebenserwartungMann : DEFAULTS.lebenserwartungFrau} Jahre).
                      Kapital und Zinsen werden vollständig aufgebraucht.
                    </>
                  ) : (
                    <>
                      <strong>Ewige Rente:</strong> Das Kapital bleibt erhalten, du lebst nur von den Zinsen.
                      Ideal, wenn du Vermögen vererben möchtest.
                    </>
                  )}
                </div>
              </div>

              {/* Vergleichstabelle */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-600">Strategie</th>
                      <th className="text-right py-2 font-medium text-gray-600">Kapital nötig</th>
                      <th className="text-right py-2 font-medium text-gray-600">Sparrate/Monat</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={`border-b ${entnahmeStrategie === 'verzehr' ? 'bg-indigo-50' : ''}`}>
                      <td className="py-2">Kapitalverzehr ({result.rentendauerJahre} J.)</td>
                      <td className="text-right py-2">{formatCurrency(result.benoetigtesKapitalVerzehr)}</td>
                      <td className="text-right py-2 font-medium">{formatCurrency(result.sparrateVerzehr)}</td>
                    </tr>
                    <tr className={entnahmeStrategie === 'ewig' ? 'bg-indigo-50' : ''}>
                      <td className="py-2">Ewige Rente</td>
                      <td className="text-right py-2">{formatCurrency(result.benoetigtesKapitalEwig)}</td>
                      <td className="text-right py-2 font-medium">{formatCurrency(result.sparrateEwig)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Visualisierung */}
          {hatLuecke && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Deine Rentensituation</h3>
              
              <div className="space-y-4">
                {/* Gewünschte Rente */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Gewünschte Rente ({bedarfsQuote}%)</span>
                    <span className="font-medium">{formatCurrency(result.gewuenschteRente)}</span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${(result.gesetzlicheRenteReal / result.gewuenschteRente) * 100}%` }}
                    ></div>
                    <div 
                      className="h-full bg-orange-400"
                      style={{ width: `${(result.monatlicheLuecke / result.gewuenschteRente) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Legende */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Gesetzliche Rente ({formatCurrency(result.gesetzlicheRenteReal)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-400 rounded"></div>
                    <span>Rentenlücke ({formatCurrency(result.monatlicheLuecke)})</span>
                  </div>
                </div>
              </div>

              {/* Zeitstrahl */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Dein Zeitplan</h4>
                <div className="relative">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <div className="text-center">
                      <div className="font-medium text-indigo-600">Heute</div>
                      <div>{alter} Jahre</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-indigo-600">↓ {result.sparzeitJahre} Jahre sparen</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">Rente</div>
                      <div>{rentenalter} Jahre</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Info-Box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
        <h3 className="font-semibold text-indigo-800 mb-3">ℹ️ Was ist die Rentenlücke?</h3>
        <ul className="space-y-2 text-sm text-indigo-700">
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Die <strong>Rentenlücke</strong> ist die Differenz zwischen deinem Bedarf im Alter und der gesetzlichen Rente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Das aktuelle <strong>Rentenniveau</strong> liegt bei ca. 48% des Durchschnittslohns (Standardrente nach 45 Jahren)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Experten empfehlen <strong>70-80% des letzten Nettos</strong> als Bedarf im Alter</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>Die Lücke lässt sich durch <strong>private Vorsorge</strong> schließen: ETF-Sparplan, Riester, bAV, Immobilien</span>
          </li>
        </ul>
      </div>

      {/* Vorsorge-Optionen */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">🎯 So kannst du vorsorgen</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl">
            <span className="text-2xl">📈</span>
            <div>
              <div className="font-medium text-gray-800">ETF-Sparplan</div>
              <div className="text-sm text-gray-600">
                Flexibel, günstig, gute Rendite. Historisch ~7% p.a. Ideal für langfristigen Vermögensaufbau.
              </div>
              <a 
                href="/etf-sparplan-rechner" 
                className="text-emerald-600 hover:underline text-sm inline-flex items-center gap-1 mt-1"
              >
                → ETF-Sparplan-Rechner
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
            <span className="text-2xl">🏛️</span>
            <div>
              <div className="font-medium text-gray-800">Riester-Rente</div>
              <div className="text-sm text-gray-600">
                Staatliche Zulagen + Steuervorteile. Besonders für Familien & Geringverdiener interessant.
              </div>
              <a 
                href="/riester-rechner" 
                className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1 mt-1"
              >
                → Riester-Rechner
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
            <span className="text-2xl">🏢</span>
            <div>
              <div className="font-medium text-gray-800">Betriebliche Altersvorsorge (bAV)</div>
              <div className="text-sm text-gray-600">
                Arbeitgeber beteiligt sich oft. Steuer- und Sozialabgabenersparnis in der Ansparphase.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
            <span className="text-2xl">🏠</span>
            <div>
              <div className="font-medium text-gray-800">Immobilien</div>
              <div className="text-sm text-gray-600">
                Mietfreies Wohnen im Alter senkt den Bedarf. Mieteinnahmen als zusätzliche Rente.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-semibold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Die Berechnung ist eine <strong>vereinfachte Schätzung</strong> – die tatsächliche Situation kann abweichen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span><strong>Inflation & Rendite</strong> können stark schwanken – planen Sie konservativ</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Die <strong>Lebenserwartung</strong> ist ein Durchschnitt – individuelle Gesundheit berücksichtigen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span><strong>Keine Anlageberatung</strong> – für individuelle Planung einen Finanzberater konsultieren</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Steuern auf Kapitalerträge und ggf. Rentenbesteuerung sind <strong>nicht berücksichtigt</strong></span>
          </li>
        </ul>
      </div>

      {/* Zuständige Stellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">📞 Wichtige Anlaufstellen</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🏦</span>
            <div>
              <div className="font-medium text-gray-800">Deutsche Rentenversicherung</div>
              <div className="text-sm text-gray-600">Kostenlose Beratung zur gesetzlichen Rente</div>
              <a 
                href="https://www.deutsche-rentenversicherung.de/DRV/DE/Home/home_node.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline text-sm"
              >
                deutsche-rentenversicherung.de →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🛡️</span>
            <div>
              <div className="font-medium text-gray-800">Verbraucherzentrale</div>
              <div className="text-sm text-gray-600">Unabhängige Altersvorsorge-Beratung</div>
              <a 
                href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/altersvorsorge" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline text-sm"
              >
                verbraucherzentrale.de/altersvorsorge →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-medium text-gray-800">Stiftung Warentest / Finanztest</div>
              <div className="text-sm text-gray-600">Unabhängige Tests zu Altersvorsorge-Produkten</div>
              <a 
                href="https://www.test.de/thema/altersvorsorge/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline text-sm"
              >
                test.de/altersvorsorge →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">📚 Quellen & Rechtliche Grundlagen</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            <a href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Kurz-vor-und-in-der-Rente/Wie-hoch-ist-meine-Rente/wie-hoch-ist-meine-rente.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Deutsche Rentenversicherung – Rentenberechnung
            </a>
          </li>
          <li>
            <a href="https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Sterbefaelle-Lebenserwartung/_inhalt.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Statistisches Bundesamt – Lebenserwartung
            </a>
          </li>
          <li>
            <a href="https://www.bmas.de/DE/Soziales/Rente-und-Altersvorsorge/rente-und-altersvorsorge.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              BMAS – Rente und Altersvorsorge
            </a>
          </li>
          <li>
            <a href="https://www.test.de/Rentenpunkte-berechnen-So-hoch-ist-Ihre-Rente-5903655-0/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Stiftung Warentest – Rentenpunkte berechnen
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Stand: Januar 2025. Alle Angaben ohne Gewähr. 
          Keine Anlageberatung – Ergebnisse dienen nur der Orientierung.
        </p>
      </div>
    </div>
  );
}
