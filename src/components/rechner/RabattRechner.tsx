import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Beispiel-Staffelrabatte
const STAFFELRABATTE_BEISPIELE = [
  { ab: 50, rabatt: 5 },
  { ab: 100, rabatt: 10 },
  { ab: 200, rabatt: 15 },
  { ab: 500, rabatt: 20 },
];

export default function RabattRechner() {
  const [originalpreis, setOriginalpreis] = useState<number>(99.99);
  const [rabatt1, setRabatt1] = useState<number>(20);
  const [rabatt2, setRabatt2] = useState<number>(0);
  const [berechnet, setBerechnet] = useState(false);
  const [showStaffel, setShowStaffel] = useState(false);

  const ergebnis = useMemo(() => {
    if (!originalpreis || originalpreis <= 0 || rabatt1 < 0 || rabatt1 > 100) {
      return null;
    }

    // Erster Rabatt
    const ersparnis1 = originalpreis * (rabatt1 / 100);
    const preisNachRabatt1 = originalpreis - ersparnis1;
    
    // Zweiter Rabatt (optional, auf reduzierten Preis)
    const ersparnis2 = rabatt2 > 0 ? preisNachRabatt1 * (rabatt2 / 100) : 0;
    const endpreis = preisNachRabatt1 - ersparnis2;
    
    // Gesamtersparnis
    const gesamtErsparnis = originalpreis - endpreis;
    const gesamtRabattProzent = (gesamtErsparnis / originalpreis) * 100;
    
    // Staffelrabatte berechnen
    const staffelErgebnisse = STAFFELRABATTE_BEISPIELE.map(staffel => ({
      ...staffel,
      ersparnis: originalpreis * (staffel.rabatt / 100),
      endpreis: originalpreis * (1 - staffel.rabatt / 100),
    }));
    
    // Umgekehrte Berechnung: Was war der Originalpreis?
    const ursprungspreisBei = (zielpreis: number, rabattProzent: number) => {
      return zielpreis / (1 - rabattProzent / 100);
    };

    return {
      originalpreis,
      rabatt1,
      rabatt2,
      ersparnis1,
      preisNachRabatt1,
      ersparnis2,
      endpreis,
      gesamtErsparnis,
      gesamtRabattProzent,
      staffelErgebnisse,
      hatZweitenRabatt: rabatt2 > 0,
    };
  }, [originalpreis, rabatt1, rabatt2]);

  const formatCurrency = (n: number) => 
    n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  
  const formatPercent = (n: number) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' %';

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  // Schnell-Buttons für häufige Rabatte
  const schnellRabatte = [10, 15, 20, 25, 30, 50];

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Rabatt-Rechner" rechnerSlug="rabatt-rechner" />

{/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">🏷️</span>
          Rabatt berechnen
        </h2>

        <div className="space-y-6">
          {/* Originalpreis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Originalpreis (€)
            </label>
            <input
              type="number"
              value={originalpreis}
              onChange={(e) => setOriginalpreis(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-lg"
              placeholder="z.B. 99,99"
              min={0}
              step={0.01}
            />
          </div>

          {/* Rabatt in % */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rabatt (%)
            </label>
            <input
              type="number"
              value={rabatt1}
              onChange={(e) => setRabatt1(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-lg"
              placeholder="z.B. 20"
              min={0}
              max={100}
              step={0.5}
            />
            {/* Schnellauswahl */}
            <div className="flex flex-wrap gap-2 mt-3">
              {schnellRabatte.map(r => (
                <button
                  key={r}
                  onClick={() => setRabatt1(r)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    rabatt1 === r 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-700'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Zweiter Rabatt (optional) */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-amber-800">
                🎁 Zusätzlicher Rabatt auf reduzierten Preis (optional)
              </label>
            </div>
            <input
              type="number"
              value={rabatt2}
              onChange={(e) => setRabatt2(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="z.B. 10"
              min={0}
              max={100}
              step={0.5}
            />
            <p className="text-xs text-amber-600 mt-2">
              Z.B. 10% Newsletter-Rabatt zusätzlich zum Sale
            </p>
          </div>

          <button
            onClick={handleBerechnen}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
          >
            💰 Rabatt berechnen
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

            {/* Großes Ergebnis */}
            <div className="text-center mb-6">
              <div className="text-gray-500 text-sm mb-1">Neuer Preis</div>
              <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <div className="text-4xl font-bold">{formatCurrency(ergebnis.endpreis)}</div>
              </div>
              <div className="mt-4 flex justify-center items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600">
                    {formatCurrency(ergebnis.gesamtErsparnis)}
                  </div>
                  <div className="text-sm text-gray-500">gespart</div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600">
                    {formatPercent(ergebnis.gesamtRabattProzent)}
                  </div>
                  <div className="text-sm text-gray-500">Gesamtrabatt</div>
                </div>
              </div>
            </div>

            {/* Preis-Vergleich visuell */}
            <div className="relative h-12 bg-gray-100 rounded-xl overflow-hidden mb-4">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-400 to-rose-500 flex items-center justify-end pr-2"
                style={{ width: `${(ergebnis.gesamtErsparnis / ergebnis.originalpreis) * 100}%` }}
              >
                <span className="text-white text-xs font-medium">
                  -{formatPercent(ergebnis.gesamtRabattProzent)}
                </span>
              </div>
              <div 
                className="absolute inset-y-0 bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center"
                style={{ 
                  left: `${(ergebnis.gesamtErsparnis / ergebnis.originalpreis) * 100}%`,
                  width: `${(ergebnis.endpreis / ergebnis.originalpreis) * 100}%` 
                }}
              >
                <span className="text-white text-sm font-bold">
                  {formatCurrency(ergebnis.endpreis)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Originalpreis</span>
                <span className="font-medium text-gray-800">{formatCurrency(ergebnis.originalpreis)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Rabatt ({formatPercent(ergebnis.rabatt1)})
                </span>
                <span className="font-medium text-rose-600">- {formatCurrency(ergebnis.ersparnis1)}</span>
              </div>

              {ergebnis.hatZweitenRabatt && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-amber-50 -mx-2 px-2 rounded">
                    <span className="text-amber-700">Zwischenpreis</span>
                    <span className="font-medium text-amber-800">{formatCurrency(ergebnis.preisNachRabatt1)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      2. Rabatt ({formatPercent(ergebnis.rabatt2)})
                    </span>
                    <span className="font-medium text-rose-600">- {formatCurrency(ergebnis.ersparnis2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center py-3 bg-green-50 -mx-2 px-4 rounded-lg">
                <span className="font-bold text-green-800">Endpreis</span>
                <span className="font-bold text-green-800 text-xl">{formatCurrency(ergebnis.endpreis)}</span>
              </div>
            </div>
          </div>

          {/* Info bei doppeltem Rabatt */}
          {ergebnis.hatZweitenRabatt && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Doppelter Rabatt erklärt
              </h2>
              
              <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                <p className="mb-2">
                  <strong>Achtung:</strong> Zwei Rabatte nacheinander ergeben nicht die Summe der Prozente!
                </p>
                <p>
                  {formatPercent(ergebnis.rabatt1)} + {formatPercent(ergebnis.rabatt2)} = <strong>nicht</strong> {formatPercent(ergebnis.rabatt1 + ergebnis.rabatt2)}, 
                  sondern nur <strong>{formatPercent(ergebnis.gesamtRabattProzent)}</strong> Gesamtrabatt.
                </p>
                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                  <p className="font-mono text-xs">
                    {formatCurrency(ergebnis.originalpreis)} × (1 - {ergebnis.rabatt1}%) × (1 - {ergebnis.rabatt2}%) = {formatCurrency(ergebnis.endpreis)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Staffelrabatt-Tabelle */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <button
              onClick={() => setShowStaffel(!showStaffel)}
              className="w-full flex justify-between items-center"
            >
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Staffelrabatt-Übersicht
              </h2>
              <svg 
                className={`w-6 h-6 text-gray-500 transition-transform ${showStaffel ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showStaffel && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-4">
                  Vergleich: Was würden Sie bei verschiedenen Rabattsätzen sparen?
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 px-2">Rabatt</th>
                        <th className="text-right py-2 px-2">Ersparnis</th>
                        <th className="text-right py-2 px-2">Endpreis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[5, 10, 15, 20, 25, 30, 40, 50].map(r => {
                        const ersparnis = ergebnis.originalpreis * (r / 100);
                        const endpreis = ergebnis.originalpreis - ersparnis;
                        const istAktuell = r === ergebnis.rabatt1;
                        return (
                          <tr 
                            key={r}
                            className={`border-b border-gray-100 ${istAktuell ? 'bg-rose-50' : ''}`}
                          >
                            <td className="py-2 px-2">
                              <span className={`font-medium ${istAktuell ? 'text-rose-700' : ''}`}>
                                {r}%
                                {istAktuell && <span className="ml-2 text-xs text-rose-500">← Ihre Wahl</span>}
                              </span>
                            </td>
                            <td className="text-right py-2 px-2 text-rose-600 font-medium">
                              - {formatCurrency(ersparnis)}
                            </td>
                            <td className="text-right py-2 px-2 font-bold text-green-700">
                              {formatCurrency(endpreis)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Praxis-Beispiele */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛒</span>
              Typische Rabatt-Aktionen
            </h2>

            <div className="grid gap-3">
              <div className="p-3 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">Black Friday</div>
                    <div className="text-sm opacity-80">20-50% auf alles</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-80">Ihr Preis bei 30%</div>
                    <div className="font-bold">{formatCurrency(ergebnis.originalpreis * 0.7)}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">Sommer-Sale</div>
                    <div className="text-sm opacity-80">Bis zu 70% reduziert</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-80">Ihr Preis bei 70%</div>
                    <div className="font-bold">{formatCurrency(ergebnis.originalpreis * 0.3)}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">Newsletter-Rabatt</div>
                    <div className="text-sm opacity-80">Extra 10% für Abonnenten</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-80">Ihr Preis bei 10%</div>
                    <div className="font-bold">{formatCurrency(ergebnis.originalpreis * 0.9)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formel-Box */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📐</span>
              Die Rabatt-Formeln
            </h2>

            <div className="space-y-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Neuer Preis berechnen:</h3>
                <div className="bg-white p-3 rounded border border-gray-200 font-mono text-center">
                  Neuer Preis = Originalpreis × (1 - Rabatt/100)
                </div>
                <p className="mt-2 text-gray-600">
                  Beispiel: {formatCurrency(ergebnis.originalpreis)} × (1 - {ergebnis.rabatt1}/100) = {formatCurrency(ergebnis.preisNachRabatt1)}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Ersparnis berechnen:</h3>
                <div className="bg-white p-3 rounded border border-gray-200 font-mono text-center">
                  Ersparnis = Originalpreis × (Rabatt/100)
                </div>
                <p className="mt-2 text-gray-600">
                  Beispiel: {formatCurrency(ergebnis.originalpreis)} × ({ergebnis.rabatt1}/100) = {formatCurrency(ergebnis.ersparnis1)}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Originalpreis zurückrechnen:</h3>
                <div className="bg-white p-3 rounded border border-gray-200 font-mono text-center">
                  Originalpreis = Rabattpreis ÷ (1 - Rabatt/100)
                </div>
                <p className="mt-2 text-gray-600">
                  Beispiel: {formatCurrency(ergebnis.preisNachRabatt1)} ÷ (1 - {ergebnis.rabatt1}/100) = {formatCurrency(ergebnis.originalpreis)}
                </p>
              </div>
            </div>
          </div>

          {/* Hinweise */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Tipps zum Sparen
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-xl">✅</span>
                <p className="text-green-800">
                  <strong>Preisvergleich:</strong> Nutzen Sie Vergleichsportale, um zu prüfen, ob der 
                  "Originalpreis" wirklich realistisch ist.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">📧</span>
                <p className="text-blue-800">
                  <strong>Newsletter-Rabatte:</strong> Viele Shops bieten 5-15% Extra-Rabatt für 
                  Newsletter-Abonnenten — auch auf Sale-Artikel!
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="text-xl">⚠️</span>
                <p className="text-amber-800">
                  <strong>Vorsicht bei UVP:</strong> Die "Unverbindliche Preisempfehlung" ist oft höher als 
                  der typische Marktpreis. Echte Rabatte beziehen sich auf den tatsächlichen Straßenpreis.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-xl">🗓️</span>
                <p className="text-purple-800">
                  <strong>Beste Rabatt-Zeiten:</strong> Black Friday (November), Winter-Sale (Januar), 
                  Sommer-Sale (Juli/August), Singles Day (11.11.)
                </p>
              </div>
            </div>
</div>
        </>
      )}
    </div>
  );
}
