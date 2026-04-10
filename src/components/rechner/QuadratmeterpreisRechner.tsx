import { useState, useEffect, useCallback } from 'react';
import RechnerFeedback from './RechnerFeedback';

interface QuadratmeterpreisResult {
  preisProQm: number;
  einordnung: 'sehr günstig' | 'günstig' | 'normal' | 'teuer' | 'sehr teuer';
  prozentVomDurchschnitt: number;
  vergleichsstadt: string;
}

interface StadtPreis {
  name: string;
  wohnung: number;  // €/m² Eigentumswohnung
  haus: number;     // €/m² Haus
  miete: number;    // €/m² Miete
}

// Aktuelle Durchschnittspreise 2025/2026 (Quelle: Engel & Völkers, Statista)
const stadtPreise: StadtPreis[] = [
  { name: 'München', wohnung: 9179, haus: 8283, miete: 21.90 },
  { name: 'Frankfurt am Main', wohnung: 6440, haus: 5917, miete: 17.50 },
  { name: 'Hamburg', wohnung: 6397, haus: 5633, miete: 16.80 },
  { name: 'Berlin', wohnung: 5387, haus: 5308, miete: 15.50 },
  { name: 'Düsseldorf', wohnung: 5237, haus: 5806, miete: 14.90 },
  { name: 'Köln', wohnung: 5164, haus: 4924, miete: 14.50 },
  { name: 'Stuttgart', wohnung: 4895, haus: 5511, miete: 16.20 },
  { name: 'Nürnberg', wohnung: 4480, haus: 4255, miete: 13.80 },
  { name: 'Hannover', wohnung: 3450, haus: 4167, miete: 12.50 },
  { name: 'Dresden', wohnung: 3367, haus: 3550, miete: 10.80 },
  { name: 'Leipzig', wohnung: 3221, haus: 3668, miete: 9.90 },
  { name: 'Essen', wohnung: 2944, haus: 3702, miete: 10.20 },
  { name: 'Bremen', wohnung: 2807, haus: 2735, miete: 11.50 },
  { name: 'Dortmund', wohnung: 2725, haus: 3481, miete: 10.00 },
  { name: 'Duisburg', wohnung: 2058, haus: 3081, miete: 8.50 },
];

// Deutschlandweite Durchschnitte
const deutschlandDurchschnitt = {
  wohnung: 4251,
  haus: 3007,
  miete: 12.50,
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatCurrencyShort = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
};

export default function QuadratmeterpreisRechner() {
  // Input State
  const [kaufpreis, setKaufpreis] = useState<number>(350000);
  const [wohnflaeche, setWohnflaeche] = useState<number>(85);
  const [immobilientyp, setImmobilientyp] = useState<'wohnung' | 'haus'>('wohnung');
  
  // Result State
  const [result, setResult] = useState<QuadratmeterpreisResult | null>(null);

  const berechneQuadratmeterpreis = useCallback(() => {
    if (wohnflaeche <= 0 || kaufpreis <= 0) {
      setResult(null);
      return;
    }

    const preisProQm = kaufpreis / wohnflaeche;
    const durchschnitt = immobilientyp === 'wohnung' 
      ? deutschlandDurchschnitt.wohnung 
      : deutschlandDurchschnitt.haus;
    
    const prozentVomDurchschnitt = (preisProQm / durchschnitt) * 100;
    
    // Einordnung basierend auf Prozent vom Durchschnitt
    let einordnung: QuadratmeterpreisResult['einordnung'];
    if (prozentVomDurchschnitt < 60) {
      einordnung = 'sehr günstig';
    } else if (prozentVomDurchschnitt < 85) {
      einordnung = 'günstig';
    } else if (prozentVomDurchschnitt < 115) {
      einordnung = 'normal';
    } else if (prozentVomDurchschnitt < 150) {
      einordnung = 'teuer';
    } else {
      einordnung = 'sehr teuer';
    }
    
    // Finde ähnliche Stadt
    const stadtPreiseTyp = stadtPreise.map(s => ({
      name: s.name,
      preis: immobilientyp === 'wohnung' ? s.wohnung : s.haus
    })).sort((a, b) => Math.abs(a.preis - preisProQm) - Math.abs(b.preis - preisProQm));
    
    const vergleichsstadt = stadtPreiseTyp[0]?.name || 'Deutschland';

    setResult({
      preisProQm,
      einordnung,
      prozentVomDurchschnitt,
      vergleichsstadt
    });
  }, [kaufpreis, wohnflaeche, immobilientyp]);

  useEffect(() => {
    berechneQuadratmeterpreis();
  }, [berechneQuadratmeterpreis]);

  const getEinordnungColor = (einordnung: string): string => {
    switch (einordnung) {
      case 'sehr günstig': return 'text-green-600 bg-green-100';
      case 'günstig': return 'text-green-500 bg-green-50';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'teuer': return 'text-orange-500 bg-orange-100';
      case 'sehr teuer': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEinordnungEmoji = (einordnung: string): string => {
    switch (einordnung) {
      case 'sehr günstig': return '🎉';
      case 'günstig': return '👍';
      case 'normal': return '📊';
      case 'teuer': return '💰';
      case 'sehr teuer': return '🏷️';
      default: return '📊';
    }
  };

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>📐</span> Ihre Immobiliendaten
        </h2>
        
        <div className="space-y-4">
          {/* Immobilientyp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Immobilientyp
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImmobilientyp('wohnung')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  immobilientyp === 'wohnung'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">🏢</span>
                <span className="ml-2 font-medium">Wohnung</span>
              </button>
              <button
                type="button"
                onClick={() => setImmobilientyp('haus')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  immobilientyp === 'haus'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">🏠</span>
                <span className="ml-2 font-medium">Haus</span>
              </button>
            </div>
          </div>

          {/* Kaufpreis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kaufpreis (€)
            </label>
            <input
              type="number"
              value={kaufpreis}
              onChange={(e) => setKaufpreis(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="z.B. 350000"
              min="0"
              step="1000"
            />
            <input
              type="range"
              value={kaufpreis}
              onChange={(e) => setKaufpreis(Number(e.target.value))}
              className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="50000"
              max="2000000"
              step="10000"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50.000 €</span>
              <span>2.000.000 €</span>
            </div>
          </div>

          {/* Wohnfläche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wohnfläche (m²)
            </label>
            <input
              type="number"
              value={wohnflaeche}
              onChange={(e) => setWohnflaeche(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="z.B. 85"
              min="1"
              step="1"
            />
            <input
              type="range"
              value={wohnflaeche}
              onChange={(e) => setWohnflaeche(Number(e.target.value))}
              className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              min="20"
              max="300"
              step="5"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>20 m²</span>
              <span>300 m²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {result && (
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Ihr Quadratmeterpreis
          </h2>
          
          <div className="text-center py-4">
            <div className="text-5xl font-bold mb-2">
              {formatCurrencyShort(Math.round(result.preisProQm))}
            </div>
            <div className="text-blue-100 text-lg">pro Quadratmeter</div>
          </div>

          <div className="mt-4 p-4 bg-white/10 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-blue-100">Einordnung:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEinordnungColor(result.einordnung)}`}>
                {getEinordnungEmoji(result.einordnung)} {result.einordnung}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-blue-100">vs. Ø Deutschland:</span>
              <span className={`font-semibold ${result.prozentVomDurchschnitt > 100 ? 'text-orange-300' : 'text-green-300'}`}>
                {result.prozentVomDurchschnitt > 100 ? '+' : ''}{(result.prozentVomDurchschnitt - 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-blue-100">Vergleichbar mit:</span>
              <span className="font-semibold">{result.vergleichsstadt}</span>
            </div>
          </div>
        </div>
      )}

      {/* Vergleich Kauf vs. Miete */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>⚖️</span> Kauf vs. Miete
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <div className="text-sm text-gray-600 mb-1">Kaufpreis/m²</div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrencyShort(Math.round(result.preisProQm))}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <div className="text-sm text-gray-600 mb-1">Ø Miete/m²</div>
              <div className="text-xl font-bold text-green-600">
                {deutschlandDurchschnitt.miete.toFixed(2)} €
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-sm text-gray-600 mb-2">
              <strong>Kaufpreis-Miete-Verhältnis:</strong>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {(result.preisProQm / deutschlandDurchschnitt.miete / 12).toFixed(1)} Jahre
            </div>
            <div className="text-sm text-gray-500 mt-1">
              So viele Jahre Miete entsprechen dem Kaufpreis
            </div>
            <div className="mt-3 text-sm">
              {(result.preisProQm / deutschlandDurchschnitt.miete / 12) < 25 ? (
                <span className="text-green-600">✅ Unter 25 Jahren – Kauf kann sich lohnen</span>
              ) : (result.preisProQm / deutschlandDurchschnitt.miete / 12) < 30 ? (
                <span className="text-yellow-600">⚠️ 25-30 Jahre – genau prüfen</span>
              ) : (
                <span className="text-red-600">❌ Über 30 Jahren – Mieten evtl. günstiger</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vergleichstabelle Großstädte */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>🏙️</span> Quadratmeterpreise in deutschen Großstädten
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Stadt</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Wohnung</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Haus</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Miete</th>
              </tr>
            </thead>
            <tbody>
              {stadtPreise.map((stadt, index) => (
                <tr 
                  key={stadt.name} 
                  className={`border-b border-gray-100 ${
                    result && stadt.name === result.vergleichsstadt 
                      ? 'bg-blue-50' 
                      : index % 2 === 0 ? 'bg-gray-50' : ''
                  }`}
                >
                  <td className="py-2 px-2 font-medium text-gray-800">
                    {stadt.name}
                    {result && stadt.name === result.vergleichsstadt && (
                      <span className="ml-1 text-blue-500">←</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-600">
                    {formatCurrencyShort(stadt.wohnung)}/m²
                  </td>
                  <td className="py-2 px-2 text-right text-gray-600">
                    {formatCurrencyShort(stadt.haus)}/m²
                  </td>
                  <td className="py-2 px-2 text-right text-gray-600">
                    {stadt.miete.toFixed(2)} €/m²
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
                <td className="py-3 px-2 text-gray-800">Ø Deutschland</td>
                <td className="py-3 px-2 text-right text-gray-800">
                  {formatCurrencyShort(deutschlandDurchschnitt.wohnung)}/m²
                </td>
                <td className="py-3 px-2 text-right text-gray-800">
                  {formatCurrencyShort(deutschlandDurchschnitt.haus)}/m²
                </td>
                <td className="py-3 px-2 text-right text-gray-800">
                  {deutschlandDurchschnitt.miete.toFixed(2)} €/m²
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Quelle: Engel & Völkers, Statista | Stand: Januar 2026
        </p>
      </div>

      {/* Formel-Info */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>📝</span> So berechnet sich der Quadratmeterpreis
        </h2>
        
        <div className="p-4 bg-gray-50 rounded-xl font-mono text-center text-gray-700">
          Quadratmeterpreis = Kaufpreis ÷ Wohnfläche
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <div className="text-sm text-gray-600 mb-2">Ihre Berechnung:</div>
            <div className="font-mono text-blue-800">
              {formatCurrencyShort(kaufpreis)} ÷ {wohnflaeche} m² = <strong>{formatCurrency(result.preisProQm)}/m²</strong>
            </div>
          </div>
        )}
      <RechnerFeedback rechnerName="Quadratmeterpreis-Rechner" rechnerSlug="quadratmeterpreis-rechner" />
      </div>
    </div>
  );
}
