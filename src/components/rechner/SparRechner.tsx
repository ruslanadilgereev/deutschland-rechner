import { useState, useEffect, useCallback } from 'react';

interface SparResult {
  endkapital: number;
  einzahlungen: number;
  zinsen: number;
  jahreswerte: {
    jahr: number;
    einzahlung: number;
    kumulierteEinzahlungen: number;
    wert: number;
    zinsenGesamt: number;
  }[];
}

interface VergleichsWert {
  name: string;
  zinssatz: number;
  endkapital: number;
  zinsen: number;
  color: string;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatCurrencyShort = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + ' Mio. €';
  }
  if (value >= 10000) {
    return (value / 1000).toFixed(1) + ' Tsd. €';
  }
  return formatCurrency(value);
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
};

// Berechnung für Sparplan mit monatlicher Einzahlung und Zinseszins
const berechneSparplan = (
  startkapital: number,
  monatlicheRate: number,
  zinssatzPA: number,
  laufzeitJahre: number
): SparResult => {
  const jahreswerte: SparResult['jahreswerte'] = [];
  const monatszins = zinssatzPA / 100 / 12;
  
  let kapital = startkapital;
  let kumulierteEinzahlungen = startkapital;
  
  for (let jahr = 1; jahr <= laufzeitJahre; jahr++) {
    // 12 Monate mit Einzahlung am Anfang und Verzinsung
    for (let monat = 0; monat < 12; monat++) {
      kapital += monatlicheRate; // Einzahlung
      kumulierteEinzahlungen += monatlicheRate;
      kapital *= (1 + monatszins); // Verzinsung
    }
    
    jahreswerte.push({
      jahr,
      einzahlung: monatlicheRate * 12,
      kumulierteEinzahlungen,
      wert: kapital,
      zinsenGesamt: kapital - kumulierteEinzahlungen
    });
  }
  
  return {
    endkapital: kapital,
    einzahlungen: kumulierteEinzahlungen,
    zinsen: kapital - kumulierteEinzahlungen,
    jahreswerte
  };
};

export default function SparRechner() {
  // Input State
  const [startkapital, setStartkapital] = useState<number>(0);
  const [sparrate, setSparrate] = useState<number>(100);
  const [laufzeit, setLaufzeit] = useState<number>(20);
  const [zinssatz, setZinssatz] = useState<number>(5);
  
  // Result State
  const [result, setResult] = useState<SparResult | null>(null);
  const [vergleich, setVergleich] = useState<VergleichsWert[]>([]);
  const [showJahresuebersicht, setShowJahresuebersicht] = useState(false);
  const [showVergleichstabelle, setShowVergleichstabelle] = useState(false);

  const berechne = useCallback(() => {
    // Hauptberechnung
    const hauptResult = berechneSparplan(startkapital, sparrate, zinssatz, laufzeit);
    setResult(hauptResult);
    
    // Vergleichsberechnung für verschiedene Anlageformen
    const vergleichsWerte: VergleichsWert[] = [
      { name: 'Sparbuch (0,5%)', zinssatz: 0.5, endkapital: 0, zinsen: 0, color: 'bg-gray-400' },
      { name: 'Tagesgeld (3%)', zinssatz: 3, endkapital: 0, zinsen: 0, color: 'bg-blue-400' },
      { name: 'Festgeld (3,5%)', zinssatz: 3.5, endkapital: 0, zinsen: 0, color: 'bg-indigo-400' },
      { name: 'Anleihen (5%)', zinssatz: 5, endkapital: 0, zinsen: 0, color: 'bg-purple-400' },
      { name: 'ETF-Sparplan (7%)', zinssatz: 7, endkapital: 0, zinsen: 0, color: 'bg-emerald-500' },
    ];
    
    vergleichsWerte.forEach(v => {
      const res = berechneSparplan(startkapital, sparrate, v.zinssatz, laufzeit);
      v.endkapital = res.endkapital;
      v.zinsen = res.zinsen;
    });
    
    setVergleich(vergleichsWerte);
  }, [startkapital, sparrate, zinssatz, laufzeit]);

  useEffect(() => {
    berechne();
  }, [berechne]);

  // Für Balkendiagramm: max Wert ermitteln
  const maxVergleich = vergleich.length > 0 ? Math.max(...vergleich.map(v => v.endkapital)) : 1;

  // Berechne Beispiel: 100€/Monat über verschiedene Zeiträume
  const beispielVergleich = [
    { jahre: 10, ...berechneSparplan(0, 100, 5, 10) },
    { jahre: 20, ...berechneSparplan(0, 100, 5, 20) },
    { jahre: 30, ...berechneSparplan(0, 100, 5, 30) },
    { jahre: 40, ...berechneSparplan(0, 100, 5, 40) },
  ];

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Deine Spar-Daten</h2>
        
        <div className="space-y-4">
          {/* Startkapital */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Startkapital (optional)
            </label>
            <div className="relative">
              <input
                type="number"
                value={startkapital || ''}
                onChange={(e) => setStartkapital(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="0"
                min="0"
                step="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Bereits vorhandenes Kapital zu Beginn</p>
          </div>

          {/* Monatliche Sparrate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monatliche Sparrate *
            </label>
            <div className="relative">
              <input
                type="number"
                value={sparrate || ''}
                onChange={(e) => setSparrate(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="100"
                min="1"
                step="25"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
          </div>

          {/* Laufzeit Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Laufzeit: <span className="font-bold text-amber-600">{laufzeit} Jahre</span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={laufzeit}
              onChange={(e) => setLaufzeit(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 Jahr</span>
              <span>25 Jahre</span>
              <span>50 Jahre</span>
            </div>
          </div>

          {/* Zinssatz Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zinssatz p.a.: <span className="font-bold text-amber-600">{formatPercent(zinssatz)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={zinssatz}
              onChange={(e) => setZinssatz(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>Tagesgeld ~3%</span>
              <span>ETF ~7%</span>
              <span>12%</span>
            </div>
          </div>

          {/* Schnellauswahl Zinssätze */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setZinssatz(0.5)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                zinssatz === 0.5 
                  ? 'bg-amber-500 text-white border-amber-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
              }`}
            >
              Sparbuch (0,5%)
            </button>
            <button
              onClick={() => setZinssatz(3)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                zinssatz === 3 
                  ? 'bg-amber-500 text-white border-amber-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
              }`}
            >
              Tagesgeld (3%)
            </button>
            <button
              onClick={() => setZinssatz(3.5)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                zinssatz === 3.5 
                  ? 'bg-amber-500 text-white border-amber-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
              }`}
            >
              Festgeld (3,5%)
            </button>
            <button
              onClick={() => setZinssatz(7)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                zinssatz === 7 
                  ? 'bg-amber-500 text-white border-amber-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
              }`}
            >
              ETF (7%)
            </button>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {result && (
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium text-amber-100 mb-2">Dein Vermögen nach {laufzeit} Jahren</h3>
          
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-1">
              {formatCurrency(result.endkapital)}
            </div>
            <div className="text-amber-200 text-sm">
              bei {formatPercent(zinssatz)} Zinsen p.a.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{formatCurrency(result.einzahlungen)}</div>
              <div className="text-amber-200 text-sm">Eingezahlt</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{formatCurrency(result.zinsen)}</div>
              <div className="text-amber-200 text-sm">Zinsen (Zinseszins)</div>
            </div>
          </div>

          {/* Zinseszins-Effekt visualisieren */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-100">Zinseszins-Effekt</span>
              <span className="text-xl font-bold">
                {result.einzahlungen > 0 ? ((result.zinsen / result.einzahlungen) * 100).toFixed(0) : 0}% Bonus
              </span>
            </div>
            <p className="text-amber-200 text-sm">
              Du bekommst <strong>{formatCurrency(result.zinsen)}</strong> geschenkt – nur fürs Abwarten! 🎁
            </p>
          </div>
        </div>
      )}

      {/* Vermögensentwicklung Balken */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vermögensaufbau über die Zeit</h3>
          
          <div className="space-y-2">
            {/* Einzahlungen */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">💰 Eingezahlt</span>
                <span className="font-medium">{formatCurrency(result.einzahlungen)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-lg transition-all duration-500"
                  style={{ width: `${(result.einzahlungen / result.endkapital) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Zinsen */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">✨ Zinsen durch Zinseszins</span>
                <span className="font-medium text-amber-600">{formatCurrency(result.zinsen)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-lg transition-all duration-500"
                  style={{ width: `${(result.zinsen / result.endkapital) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Legende */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Dein eingezahltes Geld</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span>Zinsen & Zinseszinsen</span>
            </div>
          </div>
        </div>
      )}

      {/* Vergleich Anlageformen */}
      {vergleich.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Vergleich: {formatCurrency(sparrate)}/Monat über {laufzeit} Jahre
          </h3>
          
          <div className="space-y-3">
            {vergleich.map((v, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{v.name}</span>
                  <span className="font-bold">{formatCurrencyShort(v.endkapital)}</span>
                </div>
                <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                  <div 
                    className={`h-full ${v.color} rounded-lg transition-all duration-500`}
                    style={{ width: `${(v.endkapital / maxVergleich) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  davon {formatCurrency(v.zinsen)} Zinsen
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            💡 Je höher der Zinssatz, desto stärker wirkt der Zinseszins-Effekt über lange Zeiträume.
          </p>
        </div>
      )}

      {/* Beispiel-Vergleichstabelle: 100€/Monat */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => setShowVergleichstabelle(!showVergleichstabelle)}
          className="w-full px-6 py-4 flex items-center justify-between bg-amber-50 hover:bg-amber-100 transition-colors"
        >
          <span className="font-medium text-amber-800">📊 Beispiel: 100 €/Monat bei 5% Zinsen</span>
          <svg 
            className={`w-5 h-5 text-amber-600 transition-transform ${showVergleichstabelle ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showVergleichstabelle && (
          <div className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">Laufzeit</th>
                  <th className="text-right py-2 font-medium text-gray-600">Eingezahlt</th>
                  <th className="text-right py-2 font-medium text-gray-600">Endkapital</th>
                  <th className="text-right py-2 font-medium text-gray-600">Zinsen</th>
                </tr>
              </thead>
              <tbody>
                {beispielVergleich.map((b) => (
                  <tr key={b.jahre} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium">{b.jahre} Jahre</td>
                    <td className="text-right py-3">{formatCurrency(b.einzahlungen)}</td>
                    <td className="text-right py-3 font-bold text-amber-600">{formatCurrency(b.endkapital)}</td>
                    <td className="text-right py-3 text-emerald-600">+{formatCurrency(b.zinsen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-4">
              📈 Beachte: Nach 40 Jahren sind die Zinsen höher als die Einzahlungen – das ist der Zinseszins!
            </p>
          </div>
        )}
      </div>

      {/* Jahresübersicht (klappbar) */}
      {result && result.jahreswerte.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => setShowJahresuebersicht(!showJahresuebersicht)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-700">📅 Jahresübersicht anzeigen</span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${showJahresuebersicht ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showJahresuebersicht && (
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Jahr</th>
                    <th className="text-right py-2 font-medium text-gray-600">Einzahlung</th>
                    <th className="text-right py-2 font-medium text-gray-600">Ges. eingezahlt</th>
                    <th className="text-right py-2 font-medium text-gray-600">Vermögen</th>
                    <th className="text-right py-2 font-medium text-gray-600">Zinsen ges.</th>
                  </tr>
                </thead>
                <tbody>
                  {result.jahreswerte.map((jw) => (
                    <tr key={jw.jahr} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 font-medium">{jw.jahr}</td>
                      <td className="text-right py-2">{formatCurrency(jw.einzahlung)}</td>
                      <td className="text-right py-2">{formatCurrency(jw.kumulierteEinzahlungen)}</td>
                      <td className="text-right py-2 font-medium text-amber-600">{formatCurrency(jw.wert)}</td>
                      <td className="text-right py-2 text-emerald-600">+{formatCurrency(jw.zinsenGesamt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Zinseszins erklärt */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-semibold text-amber-800 mb-3">💡 Was ist der Zinseszins-Effekt?</h3>
        <div className="space-y-3 text-sm text-amber-700">
          <p>
            <strong>Zinseszins</strong> bedeutet: Du bekommst nicht nur Zinsen auf dein eingezahltes Geld, 
            sondern auch <strong>Zinsen auf bereits erhaltene Zinsen</strong>.
          </p>
          <div className="bg-white/50 rounded-lg p-4">
            <p className="font-medium mb-2">Beispiel:</p>
            <ul className="space-y-1">
              <li>• Jahr 1: 1.000 € × 5% = <strong>50 € Zinsen</strong> → 1.050 €</li>
              <li>• Jahr 2: 1.050 € × 5% = <strong>52,50 € Zinsen</strong> → 1.102,50 €</li>
              <li>• Jahr 3: 1.102,50 € × 5% = <strong>55,13 € Zinsen</strong> → 1.157,63 €</li>
            </ul>
            <p className="mt-2 text-xs">Die Zinsen wachsen jedes Jahr, weil die Basis größer wird!</p>
          </div>
          <p>
            <strong>72er-Regel:</strong> Teile 72 durch den Zinssatz, um zu wissen, wann sich dein Geld verdoppelt. 
            Bei 6% Zinsen: 72 ÷ 6 = <strong>12 Jahre</strong> bis zur Verdopplung.
          </p>
        </div>
      </div>

      {/* Tipps zum Sparen */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <h3 className="font-semibold text-emerald-800 mb-3">💰 Spar-Tipps für Einsteiger</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span><strong>Früh anfangen:</strong> Zeit ist wichtiger als die Höhe der Sparrate</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span><strong>Regelmäßig sparen:</strong> Ein Dauerauftrag macht Sparen automatisch</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span><strong>10-20% vom Netto:</strong> Eine Faustregel für die optimale Sparquote</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span><strong>Notgroschen first:</strong> Erst 3 Monatsgehälter auf Tagesgeld, dann investieren</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span><strong>Diversifizieren:</strong> Nicht alles auf eine Karte setzen</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>Zinsen auf Kapitalerträge unterliegen der <strong>Abgeltungssteuer</strong> (26,375%)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span><strong>Sparerpauschbetrag:</strong> 1.000 € (Single) / 2.000 € (Verheiratete) sind steuerfrei</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>Bei ETFs/Aktien kann der Wert <strong>schwanken</strong> – auch Verluste sind möglich</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>Die <strong>Inflation</strong> (ca. 2%) reduziert die reale Rendite</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>Keine Anlageberatung – dieser Rechner dient nur zur <strong>Orientierung</strong></span>
          </li>
        </ul>
      </div>

      {/* Anlaufstellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">📞 Wichtige Anlaufstellen</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🛡️</span>
            <div>
              <div className="font-medium text-gray-800">Verbraucherzentrale</div>
              <div className="text-sm text-gray-600">Unabhängige Beratung zu Geldanlage & Sparen</div>
              <a 
                href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/geldanlage" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-600 hover:underline text-sm"
              >
                verbraucherzentrale.de/geldanlage →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-medium text-gray-800">Finanztip</div>
              <div className="text-sm text-gray-600">Gemeinnützige Finanzbildung</div>
              <a 
                href="https://www.finanztip.de/sparen/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-600 hover:underline text-sm"
              >
                finanztip.de/sparen →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🏦</span>
            <div>
              <div className="font-medium text-gray-800">Bundesbank – Zinssätze</div>
              <div className="text-sm text-gray-600">Aktuelle Zinsinformationen</div>
              <a 
                href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-600 hover:underline text-sm"
              >
                bundesbank.de/zinssaetze →
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
            <a href="https://www.gesetze-im-internet.de/estg/__20.html" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              § 20 EStG – Einkünfte aus Kapitalvermögen
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/estg/__32d.html" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              § 32d EStG – Abgeltungssteuer (25%)
            </a>
          </li>
          <li>
            <a href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              Bundesbank – Aktuelle Zinssätze
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Stand: Januar 2026. Alle Angaben ohne Gewähr. 
          Keine Anlageberatung – Ergebnisse dienen nur der Orientierung.
        </p>
      </div>
    </div>
  );
}
