import { useState, useEffect, useCallback } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Historische Inflationsraten Deutschland (Quelle: Statistisches Bundesamt)
const HISTORISCHE_INFLATION: Record<number, number> = {
  1992: 5.0,
  1993: 4.5,
  1994: 2.7,
  1995: 1.7,
  1996: 1.4,
  1997: 1.9,
  1998: 0.9,
  1999: 0.6,
  2000: 1.4,
  2001: 2.0,
  2002: 1.4,
  2003: 1.0,
  2004: 1.7,
  2005: 1.5,
  2006: 1.6,
  2007: 2.3,
  2008: 2.6,
  2009: 0.3,
  2010: 1.1,
  2011: 2.1,
  2012: 2.0,
  2013: 1.5,
  2014: 0.9,
  2015: 0.5,
  2016: 0.5,
  2017: 1.5,
  2018: 1.8,
  2019: 1.4,
  2020: 0.5,
  2021: 3.1,
  2022: 6.9,
  2023: 5.9,
  2024: 2.2,
  2025: 2.2,
};

// Durchschnittliche Inflation für verschiedene Zeiträume
const DURCHSCHNITTE = {
  '10 Jahre (2015-2024)': 2.3,
  '20 Jahre (2005-2024)': 2.0,
  '30 Jahre (1995-2024)': 1.9,
  'EZB-Ziel': 2.0,
  'Aktuell (2025)': 2.2,
};

interface InflationsResult {
  kaufkraftZukunft: number;
  kaufkraftVergangenheit: number;
  wertverlustAbsolut: number;
  wertverlustProzent: number;
  jahreswerte: {
    jahr: number;
    kaufkraft: number;
    verlust: number;
  }[];
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
};

export default function InflationsRechner() {
  // Input State
  const [betrag, setBetrag] = useState<number>(1000);
  const [jahre, setJahre] = useState<number>(10);
  const [inflationsrate, setInflationsrate] = useState<number>(2.0);
  const [modus, setModus] = useState<'zukunft' | 'vergangenheit'>('zukunft');
  const [verwendeHistorisch, setVerwendeHistorisch] = useState<boolean>(false);
  const [startjahr, setStartjahr] = useState<number>(2015);
  
  // Result State
  const [result, setResult] = useState<InflationsResult | null>(null);
  const [showBerechnung, setShowBerechnung] = useState(false);

  const berechneInflation = useCallback(() => {
    const jahreswerte: InflationsResult['jahreswerte'] = [];
    
    if (modus === 'zukunft') {
      // Zukunft: Was ist der Betrag in X Jahren noch wert?
      // Formel: Kaufkraft = Betrag / (1 + Inflation)^Jahre
      let kaufkraft = betrag;
      
      for (let i = 1; i <= jahre; i++) {
        const rate = verwendeHistorisch && HISTORISCHE_INFLATION[2025 + i] 
          ? HISTORISCHE_INFLATION[2025 + i] / 100
          : inflationsrate / 100;
        
        kaufkraft = kaufkraft / (1 + rate);
        
        jahreswerte.push({
          jahr: i,
          kaufkraft: kaufkraft,
          verlust: betrag - kaufkraft
        });
      }
      
      const kaufkraftZukunft = kaufkraft;
      const wertverlustAbsolut = betrag - kaufkraftZukunft;
      const wertverlustProzent = (wertverlustAbsolut / betrag) * 100;
      
      setResult({
        kaufkraftZukunft,
        kaufkraftVergangenheit: 0,
        wertverlustAbsolut,
        wertverlustProzent,
        jahreswerte
      });
    } else {
      // Vergangenheit: Was war der Betrag vor X Jahren wert?
      // Formel: Früherer Wert = Betrag * (1 + Inflation)^Jahre
      let wert = betrag;
      const endJahr = new Date().getFullYear();
      
      for (let i = 1; i <= jahre; i++) {
        const jahrIndex = startjahr + jahre - i;
        const rate = verwendeHistorisch && HISTORISCHE_INFLATION[jahrIndex]
          ? HISTORISCHE_INFLATION[jahrIndex] / 100
          : inflationsrate / 100;
        
        wert = wert * (1 + rate);
        
        jahreswerte.push({
          jahr: startjahr + jahre - i,
          kaufkraft: wert,
          verlust: wert - betrag
        });
      }
      
      // Jahreswerte umkehren für chronologische Darstellung
      jahreswerte.reverse();
      
      const kaufkraftVergangenheit = wert;
      const wertverlustAbsolut = kaufkraftVergangenheit - betrag;
      const wertverlustProzent = (wertverlustAbsolut / kaufkraftVergangenheit) * 100;
      
      setResult({
        kaufkraftZukunft: 0,
        kaufkraftVergangenheit,
        wertverlustAbsolut,
        wertverlustProzent,
        jahreswerte
      });
    }
  }, [betrag, jahre, inflationsrate, modus, verwendeHistorisch, startjahr]);

  useEffect(() => {
    berechneInflation();
  }, [berechneInflation]);

  // Berechne die maximale Balkenbreite für Visualisierung
  const maxKaufkraft = result ? Math.max(betrag, ...result.jahreswerte.map(j => j.kaufkraft)) : betrag;

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ihre Eingaben</h2>
        
        <div className="space-y-4">
          {/* Modus-Auswahl */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Was möchten Sie berechnen?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModus('zukunft')}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  modus === 'zukunft'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📉 Kaufkraft in der Zukunft
              </button>
              <button
                onClick={() => setModus('vergangenheit')}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  modus === 'vergangenheit'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📈 Wert in der Vergangenheit
              </button>
            </div>
          </div>

          {/* Betrag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {modus === 'zukunft' ? 'Betrag heute' : 'Heutiger Wert'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={betrag || ''}
                onChange={(e) => setBetrag(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="1000"
                min="0"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
          </div>

          {/* Jahre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {modus === 'zukunft' ? 'Zeithorizont (Jahre)' : 'Jahre zurück'}
            </label>
            <input
              type="range"
              value={jahre}
              onChange={(e) => setJahre(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              min="1"
              max="50"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>1 Jahr</span>
              <span className="font-semibold text-orange-600">{jahre} Jahre</span>
              <span>50 Jahre</span>
            </div>
          </div>

          {/* Historische Daten verwenden */}
          {modus === 'vergangenheit' && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="historisch"
                checked={verwendeHistorisch}
                onChange={(e) => setVerwendeHistorisch(e.target.checked)}
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
              <label htmlFor="historisch" className="text-sm text-gray-700">
                Historische Inflationsraten verwenden (1992-2025)
              </label>
            </div>
          )}

          {/* Startjahr für Vergangenheit */}
          {modus === 'vergangenheit' && verwendeHistorisch && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Startjahr
              </label>
              <select
                value={startjahr}
                onChange={(e) => setStartjahr(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {Object.keys(HISTORISCHE_INFLATION)
                  .map(Number)
                  .filter(y => y <= 2025 - jahre)
                  .map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
              </select>
            </div>
          )}

          {/* Inflationsrate */}
          {(!verwendeHistorisch || modus === 'zukunft') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jährliche Inflationsrate
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={inflationsrate}
                  onChange={(e) => setInflationsrate(Math.max(0, Math.min(20, Number(e.target.value))))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="2.0"
                  min="0"
                  max="20"
                  step="0.1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              
              {/* Schnellauswahl */}
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(DURCHSCHNITTE).map(([label, rate]) => (
                  <button
                    key={label}
                    onClick={() => setInflationsrate(rate)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      inflationsrate === rate
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}: {rate}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ergebnisbereich */}
      {result && (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📊</span>
            Ergebnis
          </h2>
          
          {modus === 'zukunft' ? (
            <div className="space-y-4">
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-sm opacity-90">Kaufkraft in {jahre} Jahren</div>
                <div className="text-3xl font-bold">{formatCurrency(result.kaufkraftZukunft)}</div>
                <div className="text-sm opacity-90 mt-1">
                  (von {formatCurrency(betrag)} heute)
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm opacity-90">Wertverlust</div>
                  <div className="text-2xl font-bold">{formatCurrency(result.wertverlustAbsolut)}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm opacity-90">Kaufkraftverlust</div>
                  <div className="text-2xl font-bold">{formatPercent(result.wertverlustProzent)}</div>
                </div>
              </div>
              
              <div className="text-sm bg-white/10 rounded-lg p-3">
                💡 <strong>Das bedeutet:</strong> {formatCurrency(betrag)} heute haben in {jahre} Jahren 
                nur noch die Kaufkraft von {formatCurrency(result.kaufkraftZukunft)}.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-sm opacity-90">
                  {formatCurrency(betrag)} heute entsprechen
                </div>
                <div className="text-3xl font-bold">{formatCurrency(result.kaufkraftVergangenheit)}</div>
                <div className="text-sm opacity-90 mt-1">
                  vor {jahre} Jahren ({verwendeHistorisch ? startjahr : new Date().getFullYear() - jahre})
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm opacity-90">Preissteigerung</div>
                  <div className="text-2xl font-bold">{formatCurrency(result.wertverlustAbsolut)}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm opacity-90">Inflation gesamt</div>
                  <div className="text-2xl font-bold">{formatPercent(result.wertverlustProzent)}</div>
                </div>
              </div>
              
              <div className="text-sm bg-white/10 rounded-lg p-3">
                💡 <strong>Das bedeutet:</strong> Was heute {formatCurrency(betrag)} kostet, 
                hätte vor {jahre} Jahren nur {formatCurrency(betrag)} gekostet, 
                wäre aber {formatCurrency(result.kaufkraftVergangenheit)} wert gewesen.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grafik: Kaufkraftverlust über Zeit */}
      {result && result.jahreswerte.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {modus === 'zukunft' ? '📉 Kaufkraftverlust über Zeit' : '📈 Wertentwicklung (rückwärts)'}
          </h3>
          
          <div className="space-y-2">
            {/* Ausgangswert */}
            <div className="flex items-center gap-3">
              <div className="w-16 text-sm text-gray-600 text-right">
                {modus === 'zukunft' ? 'Heute' : 'Heute'}
              </div>
              <div className="flex-1 h-8 bg-orange-500 rounded-r-lg flex items-center justify-end pr-2">
                <span className="text-white text-sm font-medium">{formatCurrency(betrag)}</span>
              </div>
            </div>
            
            {/* Jahreswerte (nur ausgewählte anzeigen) */}
            {result.jahreswerte
              .filter((_, i, arr) => {
                // Bei vielen Jahren nur jeden x-ten anzeigen
                const step = Math.ceil(arr.length / 10);
                return i % step === step - 1 || i === arr.length - 1;
              })
              .map((jw, index) => {
                const width = (jw.kaufkraft / maxKaufkraft) * 100;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {modus === 'zukunft' ? `+${jw.jahr} J.` : jw.jahr}
                    </div>
                    <div 
                      className="h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-r-lg flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-white text-sm font-medium whitespace-nowrap">
                        {formatCurrency(jw.kaufkraft)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <button
          onClick={() => setShowBerechnung(!showBerechnung)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-gray-800">🧮 Berechnungsweg</h3>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${showBerechnung ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showBerechnung && (
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-2">Formel:</p>
              {modus === 'zukunft' ? (
                <>
                  <p className="font-mono bg-white p-2 rounded">
                    Kaufkraft = Betrag ÷ (1 + Inflationsrate)^Jahre
                  </p>
                  <p className="mt-2">
                    Kaufkraft = {formatCurrency(betrag)} ÷ (1 + {inflationsrate}%)^{jahre}
                  </p>
                  <p>
                    Kaufkraft = {formatCurrency(betrag)} ÷ {(Math.pow(1 + inflationsrate/100, jahre)).toFixed(4)}
                  </p>
                  <p className="font-semibold text-orange-600">
                    Kaufkraft = {result ? formatCurrency(result.kaufkraftZukunft) : '-'}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono bg-white p-2 rounded">
                    Früherer Wert = Heutiger Betrag × (1 + Inflationsrate)^Jahre
                  </p>
                  <p className="mt-2">
                    Früherer Wert = {formatCurrency(betrag)} × (1 + {inflationsrate}%)^{jahre}
                  </p>
                  <p>
                    Früherer Wert = {formatCurrency(betrag)} × {(Math.pow(1 + inflationsrate/100, jahre)).toFixed(4)}
                  </p>
                  <p className="font-semibold text-orange-600">
                    Früherer Wert = {result ? formatCurrency(result.kaufkraftVergangenheit) : '-'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Historische Inflationsraten */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Historische Inflationsraten Deutschland</h3>
        
        <div className="overflow-x-auto">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 text-sm">
            {Object.entries(HISTORISCHE_INFLATION)
              .sort(([a], [b]) => Number(b) - Number(a))
              .slice(0, 16)
              .map(([year, rate]) => (
                <div 
                  key={year}
                  className={`p-2 rounded-lg text-center ${
                    rate >= 5 ? 'bg-red-100 text-red-700' :
                    rate >= 3 ? 'bg-orange-100 text-orange-700' :
                    rate >= 2 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}
                >
                  <div className="font-semibold">{year}</div>
                  <div>{rate}%</div>
                </div>
              ))}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Quelle: Statistisches Bundesamt (Destatis). Inflationsrate = Veränderung des Verbraucherpreisindex zum Vorjahr.
        </p>
      </div>

      {/* Quick Facts */}
      <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Wussten Sie schon?</h3>
        
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-xl">📉</span>
            <p>
              <strong>Bei 2% Inflation</strong> verliert Ihr Geld in 35 Jahren die Hälfte seiner Kaufkraft.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🏦</span>
            <p>
              <strong>Die EZB</strong> strebt eine Inflationsrate von knapp unter 2% an – das ist das offizielle Ziel.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">📈</span>
            <p>
              <strong>2022 war extrem:</strong> Mit 6,9% hatte Deutschland die höchste Inflation seit 1973.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">💶</span>
            <p>
              <strong>100 DM von 1990</strong> entsprechen heute etwa 95€ – aber mit der Kaufkraft von nur ~50€!
            </p>
          </div>
        </div>
      <RechnerFeedback rechnerName="Inflationsrechner" rechnerSlug="inflations-rechner" />
      </div>
    </div>
  );
}
