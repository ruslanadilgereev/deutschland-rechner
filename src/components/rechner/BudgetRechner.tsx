import { useState, useEffect, useCallback } from 'react';

interface BudgetResult {
  beduerfnisse: number;
  wuensche: number;
  sparen: number;
}

interface KategoriePosten {
  name: string;
  icon: string;
  empfohlen: number; // Prozent vom jeweiligen Budget
}

const BEDUERFNISSE_KATEGORIEN: KategoriePosten[] = [
  { name: 'Miete & Nebenkosten', icon: '🏠', empfohlen: 50 },
  { name: 'Lebensmittel', icon: '🛒', empfohlen: 20 },
  { name: 'Versicherungen', icon: '🛡️', empfohlen: 10 },
  { name: 'Mobilität', icon: '🚗', empfohlen: 10 },
  { name: 'Internet & Handy', icon: '📱', empfohlen: 5 },
  { name: 'Sonstiges', icon: '📦', empfohlen: 5 },
];

const WUENSCHE_KATEGORIEN: KategoriePosten[] = [
  { name: 'Freizeit & Hobbys', icon: '🎮', empfohlen: 30 },
  { name: 'Restaurant & Café', icon: '🍽️', empfohlen: 20 },
  { name: 'Shopping & Kleidung', icon: '👕', empfohlen: 20 },
  { name: 'Streaming & Abos', icon: '📺', empfohlen: 10 },
  { name: 'Urlaub', icon: '✈️', empfohlen: 15 },
  { name: 'Sonstiges', icon: '🎁', empfohlen: 5 },
];

const SPAREN_KATEGORIEN: KategoriePosten[] = [
  { name: 'Notgroschen', icon: '🏦', empfohlen: 30 },
  { name: 'ETF-Sparplan', icon: '📈', empfohlen: 40 },
  { name: 'Altersvorsorge', icon: '👴', empfohlen: 20 },
  { name: 'Rücklagen (Auto, Urlaub)', icon: '🎯', empfohlen: 10 },
];

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' %';
};

export default function BudgetRechner() {
  // Input State
  const [nettoeinkommen, setNettoeinkommen] = useState<number>(2500);
  const [beduerfnisseAnteil, setBeduerfnisseAnteil] = useState<number>(50);
  const [wuenscheAnteil, setWuenscheAnteil] = useState<number>(30);
  const [sparenAnteil, setSparenAnteil] = useState<number>(20);
  
  // Result State
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTipps, setShowTipps] = useState(false);

  // Berechnung
  const berechne = useCallback(() => {
    const beduerfnisse = (nettoeinkommen * beduerfnisseAnteil) / 100;
    const wuensche = (nettoeinkommen * wuenscheAnteil) / 100;
    const sparen = (nettoeinkommen * sparenAnteil) / 100;
    
    setResult({
      beduerfnisse,
      wuensche,
      sparen,
    });
  }, [nettoeinkommen, beduerfnisseAnteil, wuenscheAnteil, sparenAnteil]);

  useEffect(() => {
    berechne();
  }, [berechne]);

  // Gesamtanteil berechnen
  const gesamtAnteil = beduerfnisseAnteil + wuenscheAnteil + sparenAnteil;

  // Schnellauswahl-Presets
  const presets = [
    { name: '50-30-20 (Standard)', beduerfnisse: 50, wuensche: 30, sparen: 20 },
    { name: '50-20-30 (Sparfokus)', beduerfnisse: 50, wuensche: 20, sparen: 30 },
    { name: '60-30-10 (Hohe Kosten)', beduerfnisse: 60, wuensche: 30, sparen: 10 },
    { name: '40-30-30 (Niedrige Fixkosten)', beduerfnisse: 40, wuensche: 30, sparen: 30 },
  ];

  // Beispiel-Einkommen für Vergleich
  const beispielEinkommen = [1500, 2000, 2500, 3000, 4000, 5000];

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Deine Budget-Daten</h2>
        
        <div className="space-y-4">
          {/* Nettoeinkommen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monatliches Nettoeinkommen *
            </label>
            <div className="relative">
              <input
                type="number"
                value={nettoeinkommen || ''}
                onChange={(e) => setNettoeinkommen(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="2500"
                min="0"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Dein Gehalt nach Abzug von Steuern und Sozialabgaben</p>
          </div>

          {/* Schnellauswahl */}
          <div className="flex flex-wrap gap-2">
            {beispielEinkommen.map((betrag) => (
              <button
                key={betrag}
                onClick={() => setNettoeinkommen(betrag)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  nettoeinkommen === betrag
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                }`}
              >
                {betrag.toLocaleString('de-DE')} €
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Budget-Aufteilung */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Budget-Aufteilung anpassen</h2>
        
        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-6">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setBeduerfnisseAnteil(preset.beduerfnisse);
                setWuenscheAnteil(preset.wuensche);
                setSparenAnteil(preset.sparen);
              }}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                beduerfnisseAnteil === preset.beduerfnisse && 
                wuenscheAnteil === preset.wuensche && 
                sparenAnteil === preset.sparen
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* Bedürfnisse Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🏠 Bedürfnisse: <span className="font-bold text-blue-600">{formatPercent(beduerfnisseAnteil)}</span>
              {result && <span className="text-gray-500 ml-2">= {formatCurrency(result.beduerfnisse)}</span>}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={beduerfnisseAnteil}
              onChange={(e) => setBeduerfnisseAnteil(Number(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Miete, Lebensmittel, Versicherungen, Mobilität</p>
          </div>

          {/* Wünsche Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🎉 Wünsche: <span className="font-bold text-purple-600">{formatPercent(wuenscheAnteil)}</span>
              {result && <span className="text-gray-500 ml-2">= {formatCurrency(result.wuensche)}</span>}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={wuenscheAnteil}
              onChange={(e) => setWuenscheAnteil(Number(e.target.value))}
              className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Freizeit, Restaurant, Shopping, Streaming</p>
          </div>

          {/* Sparen Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              💰 Sparen: <span className="font-bold text-emerald-600">{formatPercent(sparenAnteil)}</span>
              {result && <span className="text-gray-500 ml-2">= {formatCurrency(result.sparen)}</span>}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={sparenAnteil}
              onChange={(e) => setSparenAnteil(Number(e.target.value))}
              className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">Notgroschen, ETF-Sparplan, Altersvorsorge</p>
          </div>

          {/* Warnung bei falscher Aufteilung */}
          {gesamtAnteil !== 100 && (
            <div className={`p-3 rounded-lg ${gesamtAnteil > 100 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm ${gesamtAnteil > 100 ? 'text-red-700' : 'text-yellow-700'}`}>
                ⚠️ Die Summe der Anteile beträgt <strong>{formatPercent(gesamtAnteil)}</strong> statt 100%.
                {gesamtAnteil > 100 && ' Du gibst mehr aus, als du verdienst!'}
                {gesamtAnteil < 100 && ` Dir fehlen noch ${formatPercent(100 - gesamtAnteil)} zur Verteilung.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      {result && (
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium text-amber-100 mb-2">Dein Monatsbudget</h3>
          
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-1">
              {formatCurrency(nettoeinkommen)}
            </div>
            <div className="text-amber-200 text-sm">
              Nettoeinkommen pro Monat
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🏠</div>
              <div className="text-xl font-bold">{formatCurrency(result.beduerfnisse)}</div>
              <div className="text-amber-200 text-sm">Bedürfnisse</div>
              <div className="text-amber-100 text-xs">{formatPercent(beduerfnisseAnteil)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">🎉</div>
              <div className="text-xl font-bold">{formatCurrency(result.wuensche)}</div>
              <div className="text-amber-200 text-sm">Wünsche</div>
              <div className="text-amber-100 text-xs">{formatPercent(wuenscheAnteil)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-xl font-bold">{formatCurrency(result.sparen)}</div>
              <div className="text-amber-200 text-sm">Sparen</div>
              <div className="text-amber-100 text-xs">{formatPercent(sparenAnteil)}</div>
            </div>
          </div>

          {/* Visualisierung als Balken */}
          <div className="mt-6">
            <div className="h-6 rounded-full overflow-hidden flex">
              <div 
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${beduerfnisseAnteil}%` }}
              ></div>
              <div 
                className="bg-purple-500 transition-all duration-500"
                style={{ width: `${wuenscheAnteil}%` }}
              ></div>
              <div 
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${sparenAnteil}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-amber-200">
              <span>🏠 Bedürfnisse</span>
              <span>🎉 Wünsche</span>
              <span>💰 Sparen</span>
            </div>
          </div>
        </div>
      )}

      {/* Detail-Aufschlüsselung */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 flex items-center justify-between bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <span className="font-medium text-amber-800">📊 Detaillierte Aufschlüsselung anzeigen</span>
            <svg 
              className={`w-5 h-5 text-amber-600 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDetails && (
            <div className="p-6 space-y-6">
              {/* Bedürfnisse Details */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">🏠</span>
                  Bedürfnisse ({formatCurrency(result.beduerfnisse)})
                </h4>
                <div className="space-y-2">
                  {BEDUERFNISSE_KATEGORIEN.map((kat) => {
                    const betrag = (result.beduerfnisse * kat.empfohlen) / 100;
                    return (
                      <div key={kat.name} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{kat.icon}</span>
                          <span className="text-gray-700">{kat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-gray-800">{formatCurrency(betrag)}</span>
                          <span className="text-gray-500 text-sm ml-2">({kat.empfohlen}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wünsche Details */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">🎉</span>
                  Wünsche ({formatCurrency(result.wuensche)})
                </h4>
                <div className="space-y-2">
                  {WUENSCHE_KATEGORIEN.map((kat) => {
                    const betrag = (result.wuensche * kat.empfohlen) / 100;
                    return (
                      <div key={kat.name} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{kat.icon}</span>
                          <span className="text-gray-700">{kat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-gray-800">{formatCurrency(betrag)}</span>
                          <span className="text-gray-500 text-sm ml-2">({kat.empfohlen}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sparen Details */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">💰</span>
                  Sparen ({formatCurrency(result.sparen)})
                </h4>
                <div className="space-y-2">
                  {SPAREN_KATEGORIEN.map((kat) => {
                    const betrag = (result.sparen * kat.empfohlen) / 100;
                    return (
                      <div key={kat.name} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{kat.icon}</span>
                          <span className="text-gray-700">{kat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-gray-800">{formatCurrency(betrag)}</span>
                          <span className="text-gray-500 text-sm ml-2">({kat.empfohlen}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vergleichstabelle verschiedene Einkommen */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📊 Beispiel: 50-30-20 bei verschiedenen Einkommen
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-600">Netto</th>
                <th className="text-right py-2 font-medium text-blue-600">🏠 Bedürfnisse</th>
                <th className="text-right py-2 font-medium text-purple-600">🎉 Wünsche</th>
                <th className="text-right py-2 font-medium text-emerald-600">💰 Sparen</th>
              </tr>
            </thead>
            <tbody>
              {beispielEinkommen.map((einkommen) => (
                <tr 
                  key={einkommen} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${einkommen === nettoeinkommen ? 'bg-amber-50' : ''}`}
                >
                  <td className="py-3 font-medium">{einkommen.toLocaleString('de-DE')} €</td>
                  <td className="text-right py-3 text-blue-600">{formatCurrency(einkommen * 0.5)}</td>
                  <td className="text-right py-3 text-purple-600">{formatCurrency(einkommen * 0.3)}</td>
                  <td className="text-right py-3 text-emerald-600">{formatCurrency(einkommen * 0.2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          💡 Bei niedrigerem Einkommen kann es sinnvoll sein, den Bedürfnisse-Anteil zu erhöhen (z.B. 60-25-15).
        </p>
      </div>

      {/* 50-30-20 Regel erklärt */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-semibold text-amber-800 mb-3">💡 Was ist die 50-30-20-Regel?</h3>
        <div className="space-y-3 text-sm text-amber-700">
          <p>
            Die <strong>50-30-20-Regel</strong> ist eine einfache Budgetformel, die 2005 von der 
            US-Senatorin <strong>Elizabeth Warren</strong> populär gemacht wurde.
          </p>
          
          <div className="grid gap-3">
            <div className="bg-white/50 rounded-lg p-4">
              <div className="font-medium text-blue-700 mb-1">🏠 50% Bedürfnisse (Needs)</div>
              <p className="text-amber-600">
                Unvermeidbare Ausgaben: Miete, Nebenkosten, Lebensmittel, Versicherungen, 
                Gesundheit, Mobilität, Telefon & Internet.
              </p>
            </div>
            
            <div className="bg-white/50 rounded-lg p-4">
              <div className="font-medium text-purple-700 mb-1">🎉 30% Wünsche (Wants)</div>
              <p className="text-amber-600">
                Alles, was das Leben angenehmer macht: Restaurant, Streaming, Shopping, 
                Hobbys, Urlaub, Fitness, Konzerte.
              </p>
            </div>
            
            <div className="bg-white/50 rounded-lg p-4">
              <div className="font-medium text-emerald-700 mb-1">💰 20% Sparen (Savings)</div>
              <p className="text-amber-600">
                Für die Zukunft: Notgroschen, Altersvorsorge, ETF-Sparplan, Schuldenabbau, 
                Rücklagen für größere Anschaffungen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tipps */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => setShowTipps(!showTipps)}
          className="w-full px-6 py-4 flex items-center justify-between bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          <span className="font-medium text-emerald-800">💰 Budget-Tipps für Einsteiger</span>
          <svg 
            className={`w-5 h-5 text-emerald-600 transition-transform ${showTipps ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showTipps && (
          <div className="p-6">
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span><strong>Notgroschen first:</strong> Mindestens 3 Monatsgehälter auf einem Tagesgeldkonto für Notfälle.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span><strong>Automatisieren:</strong> Richte Daueraufträge ein, damit Sparen automatisch passiert.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span><strong>Separate Konten:</strong> Ein Konto für Fixkosten, eins für Freizeit, eins zum Sparen.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span><strong>Schulden zuerst:</strong> Teure Schulden (Dispo, Kreditkarte) sollten vor dem Sparen getilgt werden.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span><strong>Anpassen erlaubt:</strong> Die 50-30-20-Regel ist ein Richtwert – passe sie an deine Situation an.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span><strong>Tracking hilft:</strong> Nutze ein Haushaltsbuch oder eine App, um deine Ausgaben zu verfolgen.</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Wann die Regel anpassen? */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">⚖️ Wann sollte ich die Regel anpassen?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span><strong>Hohe Miete (z.B. München):</strong> 60-25-15 kann realistischer sein.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span><strong>Schulden abbauen:</strong> Reduziere "Wünsche" und erhöhe "Sparen" für schnellere Tilgung.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span><strong>Hohes Einkommen:</strong> Du kannst mehr sparen (z.B. 40-30-30).</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span><strong>Berufseinsteiger:</strong> Starte mit weniger Sparen und steigere dich langsam.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span><strong>Familie mit Kindern:</strong> "Bedürfnisse" werden naturgemäß höher ausfallen.</span>
          </div>
        </div>
      </div>

      {/* Jährliche Übersicht */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Hochrechnung aufs Jahr</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-800">{formatCurrency(nettoeinkommen * 12)}</div>
              <div className="text-sm text-gray-500">Jahres-Netto</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(result.beduerfnisse * 12)}</div>
              <div className="text-sm text-gray-500">🏠 Bedürfnisse/Jahr</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(result.wuensche * 12)}</div>
              <div className="text-sm text-gray-500">🎉 Wünsche/Jahr</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(result.sparen * 12)}</div>
              <div className="text-sm text-gray-500">💰 Sparen/Jahr</div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-4 p-3 bg-emerald-50 rounded-lg">
            🎯 Mit <strong>{formatCurrency(result.sparen * 12)}</strong> pro Jahr baust du in 10 Jahren 
            (ohne Zinsen) ein Vermögen von <strong>{formatCurrency(result.sparen * 12 * 10)}</strong> auf!
          </p>
        </div>
      )}

      {/* Anlaufstellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">📞 Wichtige Anlaufstellen</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🛡️</span>
            <div>
              <div className="font-medium text-gray-800">Verbraucherzentrale – Budgetberatung</div>
              <div className="text-sm text-gray-600">Kostenlose Beratung zu Haushaltsgeld & Schulden</div>
              <a 
                href="https://www.verbraucherzentrale.de/beratung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-600 hover:underline text-sm"
              >
                verbraucherzentrale.de/beratung →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-medium text-gray-800">Finanztip – Budget & Sparen</div>
              <div className="text-sm text-gray-600">Gemeinnützige Finanzbildung</div>
              <a 
                href="https://www.finanztip.de/haushaltsbuch/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-600 hover:underline text-sm"
              >
                finanztip.de/haushaltsbuch →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🏦</span>
            <div>
              <div className="font-medium text-gray-800">Sparkasse – Budgetplaner</div>
              <div className="text-sm text-gray-600">Haushaltsbuch & Finanzplanung</div>
              <a 
                href="https://www.sparkasse.de/pk/ratgeber/finanzen-im-griff/haushaltsbuch.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-600 hover:underline text-sm"
              >
                sparkasse.de/haushaltsbuch →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">📚 Quellen & Weiterlesen</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            <a href="https://en.wikipedia.org/wiki/Elizabeth_Warren" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              Elizabeth Warren – "All Your Worth: The Ultimate Lifetime Money Plan" (2005)
            </a>
          </li>
          <li>
            <a href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/kredit-schulden-insolvenz/haushaltsbuch-einnahmen-und-ausgaben-im-blick-44954" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              Verbraucherzentrale – Haushaltsbuch führen
            </a>
          </li>
          <li>
            <a href="https://www.finanztip.de/sparen/" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              Finanztip – Richtig Sparen
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Stand: Januar 2025. Alle Angaben ohne Gewähr. 
          Die 50-30-20-Regel ist ein Richtwert – individuelle Anpassungen sind empfohlen.
        </p>
      </div>
    </div>
  );
}
