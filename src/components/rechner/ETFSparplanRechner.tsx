import { useState, useEffect, useCallback } from 'react';

interface SparplanResult {
  endkapital: number;
  einzahlungen: number;
  zinsen: number;
  steuer: number;
  endkapitalNachSteuer: number;
  zinsenNachSteuer: number;
  jahreswerte: {
    jahr: number;
    einzahlung: number;
    kumulierteEinzahlungen: number;
    wert: number;
    gewinn: number;
  }[];
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
};

export default function ETFSparplanRechner() {
  // Input State
  const [startkapital, setStartkapital] = useState<number>(0);
  const [sparrate, setSparrate] = useState<number>(200);
  const [laufzeit, setLaufzeit] = useState<number>(20);
  const [rendite, setRendite] = useState<number>(7);
  const [sparintervall, setSparintervall] = useState<'monatlich' | 'vierteljährlich' | 'jährlich'>('monatlich');
  const [dynamik, setDynamik] = useState<number>(0);
  const [mitSteuer, setMitSteuer] = useState<boolean>(true);
  const [sparerpauschbetrag, setSparerpauschbetrag] = useState<number>(1000);
  const [teilfreistellung, setTeilfreistellung] = useState<number>(30);
  
  // Result State
  const [result, setResult] = useState<SparplanResult | null>(null);
  const [showBerechnung, setShowBerechnung] = useState(false);

  const berechneETFSparplan = useCallback(() => {
    const jahreswerte: SparplanResult['jahreswerte'] = [];
    
    // Sparintervall in Anzahl pro Jahr umrechnen
    const sparIntervalleFaktor = sparintervall === 'monatlich' ? 12 : 
                                  sparintervall === 'vierteljährlich' ? 4 : 1;
    
    // Rendite pro Sparintervall
    const renditeFaktor = 1 + (rendite / 100);
    const renditeProIntervall = Math.pow(renditeFaktor, 1 / sparIntervalleFaktor) - 1;
    
    let kapital = startkapital;
    let kumulierteEinzahlungen = startkapital;
    let aktuelleRate = sparrate;
    
    for (let jahr = 1; jahr <= laufzeit; jahr++) {
      // Jährliche Einzahlung
      const jahresEinzahlung = aktuelleRate * sparIntervalleFaktor;
      
      // Berechnung mit Sparintervall
      for (let intervall = 0; intervall < sparIntervalleFaktor; intervall++) {
        // Einzahlung am Anfang des Intervalls
        kapital += aktuelleRate;
        kumulierteEinzahlungen += aktuelleRate;
        // Verzinsung
        kapital *= (1 + renditeProIntervall);
      }
      
      jahreswerte.push({
        jahr,
        einzahlung: jahresEinzahlung,
        kumulierteEinzahlungen,
        wert: kapital,
        gewinn: kapital - kumulierteEinzahlungen
      });
      
      // Dynamik anwenden (jährliche Erhöhung der Sparrate)
      if (dynamik > 0) {
        aktuelleRate = aktuelleRate * (1 + dynamik / 100);
      }
    }
    
    const endkapital = kapital;
    const einzahlungen = kumulierteEinzahlungen;
    const zinsen = endkapital - einzahlungen;
    
    // Steuerberechnung
    let steuer = 0;
    let endkapitalNachSteuer = endkapital;
    let zinsenNachSteuer = zinsen;
    
    if (mitSteuer && zinsen > 0) {
      // Teilfreistellung bei Aktienfonds (30% steuerfrei)
      const steuerpflichtigerGewinn = zinsen * (1 - teilfreistellung / 100);
      
      // Sparerpauschbetrag abziehen (angenommen: Freibetrag über Laufzeit nicht genutzt)
      // Vereinfachung: Wir rechnen nur den einmaligen Freibetrag am Ende
      const zuVersteuern = Math.max(0, steuerpflichtigerGewinn - sparerpauschbetrag);
      
      // Abgeltungssteuer 25% + Soli 5,5% = 26,375%
      steuer = zuVersteuern * 0.26375;
      endkapitalNachSteuer = endkapital - steuer;
      zinsenNachSteuer = zinsen - steuer;
    }
    
    setResult({
      endkapital,
      einzahlungen,
      zinsen,
      steuer,
      endkapitalNachSteuer,
      zinsenNachSteuer,
      jahreswerte
    });
  }, [startkapital, sparrate, laufzeit, rendite, sparintervall, dynamik, mitSteuer, sparerpauschbetrag, teilfreistellung]);

  useEffect(() => {
    berechneETFSparplan();
  }, [berechneETFSparplan]);

  // Berechne Rendite-Multiplikator für Visualisierung
  const renditeMultiplikator = result ? result.endkapital / Math.max(result.einzahlungen, 1) : 1;

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Deine Sparplan-Daten</h2>
        
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0"
                min="0"
                step="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Bereits vorhandenes Kapital zu Beginn</p>
          </div>

          {/* Sparrate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sparrate *
            </label>
            <div className="relative">
              <input
                type="number"
                value={sparrate || ''}
                onChange={(e) => setSparrate(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="200"
                min="1"
                step="25"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
          </div>

          {/* Sparintervall */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sparintervall
            </label>
            <select
              value={sparintervall}
              onChange={(e) => setSparintervall(e.target.value as 'monatlich' | 'vierteljährlich' | 'jährlich')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="monatlich">Monatlich</option>
              <option value="vierteljährlich">Vierteljährlich</option>
              <option value="jährlich">Jährlich</option>
            </select>
          </div>

          {/* Laufzeit Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Laufzeit: <span className="font-bold text-emerald-600">{laufzeit} Jahre</span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={laufzeit}
              onChange={(e) => setLaufzeit(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 Jahr</span>
              <span>25 Jahre</span>
              <span>50 Jahre</span>
            </div>
          </div>

          {/* Rendite Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Erwartete Rendite p.a.: <span className="font-bold text-emerald-600">{formatPercent(rendite)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={rendite}
              onChange={(e) => setRendite(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>7% (historisch)</span>
              <span>15%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Der MSCI World erzielte historisch ~7% p.a. nach Inflation
            </p>
          </div>

          {/* Dynamik */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jährliche Dynamik: <span className="font-bold text-emerald-600">{formatPercent(dynamik)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={dynamik}
              onChange={(e) => setDynamik(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Keine</span>
              <span>2% (Inflation)</span>
              <span>10%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Jährliche Erhöhung der Sparrate (z.B. bei Gehaltserhöhungen)
            </p>
          </div>
        </div>

        {/* Steuer-Optionen */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="mitSteuer"
              checked={mitSteuer}
              onChange={(e) => setMitSteuer(e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="mitSteuer" className="text-sm font-medium text-gray-700">
              Steuer einbeziehen (Abgeltungssteuer)
            </label>
          </div>

          {mitSteuer && (
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Sparerpauschbetrag
                </label>
                <select
                  value={sparerpauschbetrag}
                  onChange={(e) => setSparerpauschbetrag(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={1000}>1.000 € (Single)</option>
                  <option value={2000}>2.000 € (Verheiratet)</option>
                  <option value={0}>Nicht genutzt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Teilfreistellung
                </label>
                <select
                  value={teilfreistellung}
                  onChange={(e) => setTeilfreistellung(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={30}>30% (Aktienfonds &gt;50%)</option>
                  <option value={15}>15% (Mischfonds 25-50%)</option>
                  <option value={0}>0% (Andere Fonds)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      {result && (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium text-emerald-100 mb-2">Dein Endergebnis nach {laufzeit} Jahren</h3>
          
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-1">
              {formatCurrency(mitSteuer ? result.endkapitalNachSteuer : result.endkapital)}
            </div>
            <div className="text-emerald-200 text-sm">
              {mitSteuer ? 'nach Steuern' : 'vor Steuern'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{formatCurrency(result.einzahlungen)}</div>
              <div className="text-emerald-200 text-sm">Eingezahlt</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(mitSteuer ? result.zinsenNachSteuer : result.zinsen)}
              </div>
              <div className="text-emerald-200 text-sm">
                Zinsen/Rendite {mitSteuer && '(netto)'}
              </div>
            </div>
          </div>

          {/* Rendite-Multiplikator */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-emerald-100">Dein Geld hat sich</span>
              <span className="text-2xl font-bold">{renditeMultiplikator.toFixed(2)}x</span>
            </div>
            <div className="text-emerald-200 text-sm">
              vermehrt durch den Zinseszinseffekt! 📈
            </div>
          </div>

          {mitSteuer && result.steuer > 0 && (
            <div className="mt-4 text-sm bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex justify-between">
                <span>Abgeltungssteuer + Soli (26,375%)</span>
                <span className="font-medium">−{formatCurrency(result.steuer)}</span>
              </div>
              <div className="text-emerald-200 text-xs mt-1">
                Nach Teilfreistellung ({teilfreistellung}%) und Sparerpauschbetrag ({formatCurrency(sparerpauschbetrag)})
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visualisierung: Balkendiagramm */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vermögensentwicklung</h3>
          
          <div className="space-y-2">
            {/* Einzahlungen */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Einzahlungen</span>
                <span className="font-medium">{formatCurrency(result.einzahlungen)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-lg transition-all duration-500"
                  style={{ width: `${(result.einzahlungen / result.endkapital) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Zinsen/Rendite */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Zinsen/Rendite</span>
                <span className="font-medium">{formatCurrency(result.zinsen)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-lg transition-all duration-500"
                  style={{ width: `${(result.zinsen / result.endkapital) * 100}%` }}
                ></div>
              </div>
            </div>

            {mitSteuer && result.steuer > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Steuer</span>
                  <span className="font-medium text-red-600">−{formatCurrency(result.steuer)}</span>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-red-400 rounded-lg transition-all duration-500"
                    style={{ width: `${(result.steuer / result.endkapital) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Legende */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Einzahlungen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span>Zinsen/Rendite</span>
            </div>
            {mitSteuer && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded"></div>
                <span>Steuer</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Jahresübersicht (klappbar) */}
      {result && result.jahreswerte.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => setShowBerechnung(!showBerechnung)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-700">📊 Jahresübersicht anzeigen</span>
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
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Jahr</th>
                    <th className="text-right py-2 font-medium text-gray-600">Einzahlung</th>
                    <th className="text-right py-2 font-medium text-gray-600">Gesamt eingezahlt</th>
                    <th className="text-right py-2 font-medium text-gray-600">Wert</th>
                    <th className="text-right py-2 font-medium text-gray-600">Gewinn</th>
                  </tr>
                </thead>
                <tbody>
                  {result.jahreswerte.map((jw) => (
                    <tr key={jw.jahr} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 font-medium">{jw.jahr}</td>
                      <td className="text-right py-2">{formatCurrency(jw.einzahlung)}</td>
                      <td className="text-right py-2">{formatCurrency(jw.kumulierteEinzahlungen)}</td>
                      <td className="text-right py-2 font-medium text-emerald-600">{formatCurrency(jw.wert)}</td>
                      <td className="text-right py-2 text-emerald-600">+{formatCurrency(jw.gewinn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info-Box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <h3 className="font-semibold text-emerald-800 mb-3">ℹ️ Was ist ein ETF-Sparplan?</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>ETF</strong> = Exchange Traded Fund, ein börsengehandelter Indexfonds</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span>Mit einem <strong>Sparplan</strong> investierst du regelmäßig automatisch</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span>Der <strong>Zinseszinseffekt</strong> sorgt für exponentielles Wachstum</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>Cost-Average-Effekt:</strong> Du kaufst automatisch günstig bei fallenden Kursen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span>Beliebte ETFs: MSCI World, MSCI ACWI, S&P 500</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-semibold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Die <strong>tatsächliche Rendite</strong> kann stark schwanken (auch negativ!)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Historische Renditen sind <strong>keine Garantie</strong> für die Zukunft</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Kurzfristige Verluste sind <strong>normal</strong> – langfristig denken!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Die <strong>Steuerberechnung</strong> ist vereinfacht (einmaliger Verkauf am Ende)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Keine Anlageberatung – informiere dich selbst oder frage einen Berater</span>
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
              <div className="font-medium text-gray-800">BaFin (Finanzaufsicht)</div>
              <div className="text-sm text-gray-600">Bundesanstalt für Finanzdienstleistungsaufsicht</div>
              <a 
                href="https://www.bafin.de/DE/Verbraucher/verbraucher_node.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline text-sm"
              >
                bafin.de/Verbraucher →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🛡️</span>
            <div>
              <div className="font-medium text-gray-800">Verbraucherzentrale</div>
              <div className="text-sm text-gray-600">Unabhängige Beratung zu Geldanlage</div>
              <a 
                href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/geldanlage" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline text-sm"
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
                href="https://www.finanztip.de/indexfonds-etf/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline text-sm"
              >
                finanztip.de/indexfonds-etf →
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
            <a href="https://www.gesetze-im-internet.de/estg/__20.html" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              § 20 EStG – Einkünfte aus Kapitalvermögen
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/invstg_2018/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              Investmentsteuergesetz (InvStG) – Teilfreistellungen
            </a>
          </li>
          <li>
            <a href="https://www.bafin.de/DE/Verbraucher/verbraucher_node.html" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              BaFin Verbraucherinformationen
            </a>
          </li>
          <li>
            <a href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              Bundesbank – Zinssätze und Renditen
            </a>
          </li>
          <li>
            <a href="https://www.msci.com/documents/10199/178e6643-6ae6-47b9-82be-e1fc565ededb" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              MSCI World Factsheet (historische Performance)
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
