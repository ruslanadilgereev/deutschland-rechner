import { useState, useEffect, useCallback } from 'react';
import RechnerFeedback from './RechnerFeedback';

interface BaufinanzierungResult {
  monatlicheRate: number;
  jahresRate: number;
  gesamtZinsen: number;
  gesamtKosten: number;
  restschuldNachZinsbindung: number;
  tilgungsplan: {
    jahr: number;
    zinsAnteil: number;
    tilgungsAnteil: number;
    restschuld: number;
    gezahlteZinsenKumuliert: number;
    getilgtKumuliert: number;
  }[];
  effektiverJahreszins: number;
  tilgungsdauer: number; // Jahre bis vollständige Tilgung
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatCurrencyShort = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
};

export default function BaufinanzierungRechner() {
  // Input State
  const [darlehenssumme, setDarlehenssumme] = useState<number>(300000);
  const [zinssatz, setZinssatz] = useState<number>(3.5);
  const [anfangstilgung, setAnfangstilgung] = useState<number>(2);
  const [zinsbindung, setZinsbindung] = useState<number>(10);
  const [sondertilgungJahr, setSondertilgungJahr] = useState<number>(0);
  
  // Result State
  const [result, setResult] = useState<BaufinanzierungResult | null>(null);
  const [showTilgungsplan, setShowTilgungsplan] = useState(false);
  const [zeigeAlleJahre, setZeigeAlleJahre] = useState(false);

  const berechneBaufinanzierung = useCallback(() => {
    // Annuitätendarlehen: Monatliche Rate = Darlehenssumme × (Zinssatz + Anfangstilgung) / 12 / 100
    // Diese Rate bleibt konstant (Annuität)
    
    const zins = zinssatz / 100;
    const tilgung = anfangstilgung / 100;
    const sondertilgung = sondertilgungJahr;
    
    // Jährliche Annuität (ohne Sondertilgung)
    const jahresAnnuitaet = darlehenssumme * (zins + tilgung);
    const monatlicheRate = jahresAnnuitaet / 12;
    
    // Tilgungsplan erstellen
    const tilgungsplan: BaufinanzierungResult['tilgungsplan'] = [];
    let restschuld = darlehenssumme;
    let gezahlteZinsenKumuliert = 0;
    let getilgtKumuliert = 0;
    let jahr = 0;
    
    // Berechne bis zur vollständigen Tilgung (max 50 Jahre)
    while (restschuld > 0.01 && jahr < 50) {
      jahr++;
      
      // Zinsanteil für dieses Jahr (auf Basis der Restschuld zu Jahresbeginn)
      const zinsAnteil = restschuld * zins;
      
      // Tilgungsanteil = Annuität - Zinsen + Sondertilgung
      let tilgungsAnteil = jahresAnnuitaet - zinsAnteil + sondertilgung;
      
      // Nicht mehr tilgen als Restschuld
      if (tilgungsAnteil > restschuld) {
        tilgungsAnteil = restschuld;
      }
      
      restschuld = Math.max(0, restschuld - tilgungsAnteil);
      gezahlteZinsenKumuliert += zinsAnteil;
      getilgtKumuliert += tilgungsAnteil;
      
      tilgungsplan.push({
        jahr,
        zinsAnteil,
        tilgungsAnteil,
        restschuld,
        gezahlteZinsenKumuliert,
        getilgtKumuliert
      });
    }
    
    // Restschuld nach Zinsbindung
    const restschuldNachZinsbindung = tilgungsplan.find(t => t.jahr === zinsbindung)?.restschuld || 0;
    
    // Gesamtzinsen und Gesamtkosten
    const gesamtZinsen = gezahlteZinsenKumuliert;
    const gesamtKosten = darlehenssumme + gesamtZinsen;
    
    // Effektiver Jahreszins (vereinfachte Näherung)
    // Bei Annuitätendarlehen ohne Nebenkosten entspricht er ungefähr dem Nominalzins
    const effektiverJahreszins = zinssatz;
    
    setResult({
      monatlicheRate,
      jahresRate: jahresAnnuitaet,
      gesamtZinsen,
      gesamtKosten,
      restschuldNachZinsbindung,
      tilgungsplan,
      effektiverJahreszins,
      tilgungsdauer: jahr
    });
  }, [darlehenssumme, zinssatz, anfangstilgung, zinsbindung, sondertilgungJahr]);

  useEffect(() => {
    berechneBaufinanzierung();
  }, [berechneBaufinanzierung]);

  // Anzahl der Jahre für Tilgungsplan-Anzeige
  const angezeigteJahre = zeigeAlleJahre 
    ? result?.tilgungsplan || []
    : (result?.tilgungsplan || []).slice(0, 5);

  return (
    <div className="space-y-6">
      <RechnerFeedback rechnerName="Baufinanzierung-Rechner" rechnerSlug="baufinanzierung-rechner" />

{/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Deine Finanzierungsdaten</h2>
        
        <div className="space-y-4">
          {/* Darlehenssumme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Darlehenssumme *
            </label>
            <div className="relative">
              <input
                type="number"
                value={darlehenssumme || ''}
                onChange={(e) => setDarlehenssumme(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="300000"
                min="10000"
                step="10000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Nettokreditbetrag (Kaufpreis minus Eigenkapital)</p>
          </div>

          {/* Sollzinssatz */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sollzinssatz p.a.: <span className="font-bold text-blue-600">{formatPercent(zinssatz)}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.1"
              value={zinssatz}
              onChange={(e) => setZinssatz(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0,5%</span>
              <span>3,5% (aktuell ~)</span>
              <span>8%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Aktuelle Bauzinsen liegen bei ca. 3-4% (Stand 2025/2026)
            </p>
          </div>

          {/* Anfängliche Tilgung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anfängliche Tilgung p.a.: <span className="font-bold text-blue-600">{formatPercent(anfangstilgung)}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={anfangstilgung}
              onChange={(e) => setAnfangstilgung(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>2-3% (empfohlen)</span>
              <span>10%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Höhere Tilgung = schneller schuldenfrei, aber höhere monatliche Rate
            </p>
          </div>

          {/* Zinsbindung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zinsbindung: <span className="font-bold text-blue-600">{zinsbindung} Jahre</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={zinsbindung}
              onChange={(e) => setZinsbindung(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 Jahre</span>
              <span>10-15 Jahre (üblich)</span>
              <span>30 Jahre</span>
            </div>
          </div>

          {/* Sondertilgung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jährliche Sondertilgung (optional)
            </label>
            <div className="relative">
              <input
                type="number"
                value={sondertilgungJahr || ''}
                onChange={(e) => setSondertilgungJahr(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
                step="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€/Jahr</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Viele Banken erlauben 5-10% Sondertilgung pro Jahr kostenlos
            </p>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {result && (
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium text-blue-100 mb-2">Deine Baufinanzierung</h3>
          
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-1">
              {formatCurrency(result.monatlicheRate)}
            </div>
            <div className="text-blue-200 text-sm">
              monatliche Rate
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{formatCurrencyShort(darlehenssumme)}</div>
              <div className="text-blue-200 text-sm">Darlehenssumme</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{formatCurrencyShort(result.gesamtZinsen)}</div>
              <div className="text-blue-200 text-sm">Gesamtzinsen</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-xl font-bold">{result.tilgungsdauer} Jahre</div>
              <div className="text-blue-200 text-sm">bis schuldenfrei</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-xl font-bold">{formatCurrencyShort(result.gesamtKosten)}</div>
              <div className="text-blue-200 text-sm">Gesamtkosten</div>
            </div>
          </div>

          {/* Restschuld nach Zinsbindung */}
          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-100">Restschuld nach {zinsbindung} Jahren:</span>
              <span className="text-xl font-bold">{formatCurrencyShort(result.restschuldNachZinsbindung)}</span>
            </div>
            <div className="text-blue-200 text-xs mt-1">
              {result.restschuldNachZinsbindung > 0 
                ? `Anschlussfinanzierung erforderlich (${Math.round((result.restschuldNachZinsbindung / darlehenssumme) * 100)}% des ursprünglichen Darlehens)`
                : 'Vollständig getilgt innerhalb der Zinsbindung! 🎉'}
            </div>
          </div>
        </div>
)}

      {/* Visualisierung: Kostenanteile */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Kostenaufteilung</h3>
          
          <div className="space-y-2">
            {/* Tilgung (Darlehenssumme) */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tilgung (Darlehen)</span>
                <span className="font-medium">{formatCurrencyShort(darlehenssumme)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-lg transition-all duration-500"
                  style={{ width: `${(darlehenssumme / result.gesamtKosten) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Zinsen */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Zinsen gesamt</span>
                <span className="font-medium">{formatCurrencyShort(result.gesamtZinsen)}</span>
              </div>
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-lg transition-all duration-500"
                  style={{ width: `${(result.gesamtZinsen / result.gesamtKosten) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Legende */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Tilgung ({Math.round((darlehenssumme / result.gesamtKosten) * 100)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span>Zinsen ({Math.round((result.gesamtZinsen / result.gesamtKosten) * 100)}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tilgungsplan (klappbar) */}
      {result && result.tilgungsplan.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => setShowTilgungsplan(!showTilgungsplan)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-700">📊 Tilgungsplan anzeigen</span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${showTilgungsplan ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showTilgungsplan && (
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Jahr</th>
                    <th className="text-right py-2 font-medium text-gray-600">Zinsen</th>
                    <th className="text-right py-2 font-medium text-gray-600">Tilgung</th>
                    <th className="text-right py-2 font-medium text-gray-600">Restschuld</th>
                  </tr>
                </thead>
                <tbody>
                  {angezeigteJahre.map((tp) => (
                    <tr 
                      key={tp.jahr} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${tp.jahr === zinsbindung ? 'bg-blue-50' : ''}`}
                    >
                      <td className="py-2 font-medium">
                        {tp.jahr}
                        {tp.jahr === zinsbindung && (
                          <span className="ml-2 text-xs text-blue-600">(Zinsbindung endet)</span>
                        )}
                      </td>
                      <td className="text-right py-2 text-amber-600">{formatCurrency(tp.zinsAnteil)}</td>
                      <td className="text-right py-2 text-blue-600">{formatCurrency(tp.tilgungsAnteil)}</td>
                      <td className="text-right py-2 font-medium">{formatCurrency(tp.restschuld)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {result.tilgungsplan.length > 5 && (
                <button
                  onClick={() => setZeigeAlleJahre(!zeigeAlleJahre)}
                  className="mt-4 w-full py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {zeigeAlleJahre 
                    ? `Weniger anzeigen ↑` 
                    : `Alle ${result.tilgungsplan.length} Jahre anzeigen ↓`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Kennzahlen-Box */}
      {result && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">📈 Wichtige Kennzahlen</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-500">Jährliche Rate</div>
              <div className="text-lg font-bold text-gray-800">{formatCurrency(result.jahresRate)}</div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-500">Zins-Tilgungs-Verhältnis</div>
              <div className="text-lg font-bold text-gray-800">
                {formatPercent(zinssatz)} / {formatPercent(anfangstilgung)}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-500">Annuität (Zins + Tilgung)</div>
              <div className="text-lg font-bold text-gray-800">{formatPercent(zinssatz + anfangstilgung)}</div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-500">Ersparnis durch Sondertilgung</div>
              <div className="text-lg font-bold text-gray-800">
                {sondertilgungJahr > 0 
                  ? `ca. ${formatCurrencyShort(sondertilgungJahr * zinsbindung * (zinssatz / 100) * 0.5)}`
                  : '–'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info-Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-800 mb-3">ℹ️ Was ist ein Annuitätendarlehen?</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Gleichbleibende Rate:</strong> Die monatliche Rate bleibt über die Zinsbindung konstant</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Sinkender Zinsanteil:</strong> Mit jeder Zahlung sinkt der Zinsanteil, der Tilgungsanteil steigt</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Zinsbindung:</strong> Der Zinssatz ist nur für die vereinbarte Dauer fest (z.B. 10 Jahre)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Anschlussfinanzierung:</strong> Nach der Zinsbindung wird die Restschuld neu finanziert</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span><strong>Sondertilgung:</strong> Ermöglicht schnellere Entschuldung und spart Zinsen</span>
          </li>
        </ul>
      </div>

      {/* Tipps */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <h3 className="font-semibold text-emerald-800 mb-3">💡 Tipps zur Baufinanzierung</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>Mindestens 2% Tilgung:</strong> Bei niedrigen Zinsen höhere Tilgung wählen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>20% Eigenkapital:</strong> Ideal für günstige Konditionen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>Sondertilgung vereinbaren:</strong> Mindestens 5% p.a. kostenfrei</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>Rate max. 35-40% des Nettos:</strong> Für finanzielle Sicherheit</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>Lange Zinsbindung:</strong> Bei niedrigen Zinsen 15-20 Jahre sichern</span>
          </li>
        </ul>
      </div>

      {/* Warnhinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-semibold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Dieser Rechner dient nur zur <strong>Orientierung</strong> – die Konditionen können abweichen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span><strong>Nebenkosten nicht vergessen:</strong> Grunderwerbsteuer, Notar, Makler (ca. 10-15%)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Der <strong>effektive Jahreszins</strong> der Bank kann durch Bearbeitungsgebühren höher sein</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span><strong>Zinsänderungsrisiko:</strong> Nach der Zinsbindung kann der Zins steigen oder fallen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Keine Anlage- oder Finanzierungsberatung – konsultieren Sie einen <strong>unabhängigen Berater</strong></span>
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
              <div className="font-medium text-gray-800">Verbraucherzentrale</div>
              <div className="text-sm text-gray-600">Unabhängige Baufinanzierungsberatung</div>
              <a 
                href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/bau-und-immobilienfinanzierung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                verbraucherzentrale.de/baufinanzierung →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">🏗️</span>
            <div>
              <div className="font-medium text-gray-800">KfW-Förderung</div>
              <div className="text-sm text-gray-600">Zinsgünstige Darlehen & Zuschüsse</div>
              <a 
                href="https://www.kfw.de/inlandsfoerderung/Privatpersonen/Neubau/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                kfw.de/Neubau →
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-medium text-gray-800">Stiftung Warentest / Finanztest</div>
              <div className="text-sm text-gray-600">Baufinanzierung-Vergleiche & Tests</div>
              <a 
                href="https://www.test.de/thema/baufinanzierung/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                test.de/baufinanzierung →
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
            <a href="https://www.gesetze-im-internet.de/bgb/__489.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              § 489 BGB – Ordentliches Kündigungsrecht (Sonderkündigungsrecht nach 10 Jahren)
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/preisabg/__6.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              § 6 PAngV – Berechnung des effektiven Jahreszinses
            </a>
          </li>
          <li>
            <a href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Bundesbank – Aktuelle Zinssätze
            </a>
          </li>
          <li>
            <a href="https://www.bafin.de/DE/Verbraucher/Finanzwissen/BansichereGeldanlagen/Immobilienfinanzierung/immobilienfinanzierung_node.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              BaFin – Verbraucherinformationen zur Immobilienfinanzierung
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Stand: Januar 2026. Alle Angaben ohne Gewähr. 
          Ergebnisse dienen nur der Orientierung – keine Finanzberatung.
        </p>
      </div>
    </div>
  );
}
