import { useState, useMemo } from 'react';

// Hardcodierte Wechselkurse (EUR als Basis) - Stand: März 2025
// Hinweis: Nur Richtwerte, aktuelle Kurse bei der EZB prüfen
const WAEHRUNGEN = [
  { code: 'USD', name: 'US-Dollar', symbol: '$', kurs: 1.08, flagge: '🇺🇸' },
  { code: 'GBP', name: 'Britisches Pfund', symbol: '£', kurs: 0.84, flagge: '🇬🇧' },
  { code: 'CHF', name: 'Schweizer Franken', symbol: 'CHF', kurs: 0.95, flagge: '🇨🇭' },
  { code: 'JPY', name: 'Japanischer Yen', symbol: '¥', kurs: 162.50, flagge: '🇯🇵' },
  { code: 'PLN', name: 'Polnischer Złoty', symbol: 'zł', kurs: 4.18, flagge: '🇵🇱' },
  { code: 'CZK', name: 'Tschechische Krone', symbol: 'Kč', kurs: 25.10, flagge: '🇨🇿' },
  { code: 'SEK', name: 'Schwedische Krone', symbol: 'kr', kurs: 11.20, flagge: '🇸🇪' },
  { code: 'NOK', name: 'Norwegische Krone', symbol: 'kr', kurs: 11.80, flagge: '🇳🇴' },
  { code: 'DKK', name: 'Dänische Krone', symbol: 'kr', kurs: 7.46, flagge: '🇩🇰' },
];

type Richtung = 'eur-zu-fremd' | 'fremd-zu-eur';

export default function WaehrungsRechner() {
  const [betrag, setBetrag] = useState(100);
  const [waehrung, setWaehrung] = useState('USD');
  const [richtung, setRichtung] = useState<Richtung>('eur-zu-fremd');

  const aktuelleWaehrung = WAEHRUNGEN.find(w => w.code === waehrung)!;

  const ergebnis = useMemo(() => {
    if (richtung === 'eur-zu-fremd') {
      // EUR → Fremdwährung
      const eurBetrag = betrag;
      const fremdBetrag = eurBetrag * aktuelleWaehrung.kurs;
      return { eurBetrag, fremdBetrag };
    } else {
      // Fremdwährung → EUR
      const fremdBetrag = betrag;
      const eurBetrag = fremdBetrag / aktuelleWaehrung.kurs;
      return { eurBetrag, fremdBetrag };
    }
  }, [betrag, aktuelleWaehrung, richtung]);

  const formatBetrag = (n: number, waehrungCode?: string) => {
    const config: Intl.NumberFormatOptions = { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    };
    
    if (waehrungCode === 'JPY') {
      // Yen ohne Dezimalstellen
      config.minimumFractionDigits = 0;
      config.maximumFractionDigits = 0;
    }
    
    return n.toLocaleString('de-DE', config);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Hinweis-Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-medium text-amber-800">Richtwerte – keine Echtzeitkurse</p>
            <p className="text-sm text-amber-700 mt-1">
              Die angezeigten Kurse sind Näherungswerte. Für aktuelle Wechselkurse besuche die{' '}
              <a 
                href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.de.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-900 underline font-medium hover:text-amber-700"
              >
                Europäische Zentralbank (EZB) →
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Richtung wählen */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3">Umrechnungsrichtung</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRichtung('eur-zu-fremd')}
              className={`p-4 rounded-xl border-2 transition-all ${
                richtung === 'eur-zu-fremd'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🇪🇺 → {aktuelleWaehrung.flagge}</div>
              <div className="text-sm font-semibold">EUR → {waehrung}</div>
              <div className="text-xs mt-1 opacity-75">Euro in {aktuelleWaehrung.name}</div>
            </button>
            <button
              onClick={() => setRichtung('fremd-zu-eur')}
              className={`p-4 rounded-xl border-2 transition-all ${
                richtung === 'fremd-zu-eur'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{aktuelleWaehrung.flagge} → 🇪🇺</div>
              <div className="text-sm font-semibold">{waehrung} → EUR</div>
              <div className="text-xs mt-1 opacity-75">{aktuelleWaehrung.name} in Euro</div>
            </button>
          </div>
        </div>

        {/* Betrag eingeben */}
        <label className="block mb-6">
          <span className="text-gray-700 font-medium">
            Betrag in {richtung === 'eur-zu-fremd' ? 'Euro (EUR)' : `${aktuelleWaehrung.name} (${waehrung})`}
          </span>
          <div className="mt-2 relative">
            <input
              type="number"
              value={betrag}
              onChange={(e) => setBetrag(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              step="0.01"
              min="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              {richtung === 'eur-zu-fremd' ? '€' : aktuelleWaehrung.symbol}
            </span>
          </div>
        </label>

        {/* Währung wählen */}
        <div className="mb-2">
          <label className="block text-gray-700 font-medium mb-3">Zielwährung</label>
          <div className="grid grid-cols-3 gap-2">
            {WAEHRUNGEN.map((w) => (
              <button
                key={w.code}
                onClick={() => setWaehrung(w.code)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  waehrung === w.code
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl">{w.flagge}</div>
                <div className={`text-sm font-bold ${waehrung === w.code ? 'text-emerald-700' : 'text-gray-800'}`}>
                  {w.code}
                </div>
                <div className="text-xs text-gray-500 truncate">{w.symbol}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-emerald-100 mb-4">Ergebnis</h3>
        
        {/* Hauptergebnis */}
        <div className="mb-4">
          <div className="text-emerald-100 text-sm mb-1">
            {richtung === 'eur-zu-fremd' 
              ? `${formatBetrag(ergebnis.eurBetrag)} € entsprechen`
              : `${formatBetrag(ergebnis.fremdBetrag, waehrung)} ${aktuelleWaehrung.symbol} entsprechen`
            }
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {richtung === 'eur-zu-fremd'
                ? `${formatBetrag(ergebnis.fremdBetrag, waehrung)} ${aktuelleWaehrung.symbol}`
                : `${formatBetrag(ergebnis.eurBetrag)} €`
              }
            </span>
          </div>
        </div>

        {/* Wechselkurs-Info */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-emerald-100">Verwendeter Kurs</span>
            <span className="font-semibold">1 EUR = {formatBetrag(aktuelleWaehrung.kurs, waehrung)} {waehrung}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-100">Umgekehrter Kurs</span>
            <span className="font-semibold">1 {waehrung} = {(1 / aktuelleWaehrung.kurs).toFixed(4)} EUR</span>
          </div>
        </div>
      </div>

      {/* Übersicht aller Kurse */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Alle Wechselkurse (1 EUR =)</h3>
        <div className="space-y-2">
          {WAEHRUNGEN.map((w) => (
            <div 
              key={w.code}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                waehrung === w.code ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{w.flagge}</span>
                <div>
                  <span className="font-medium text-gray-800">{w.code}</span>
                  <span className="text-gray-500 ml-2 text-sm">{w.name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold ${waehrung === w.code ? 'text-emerald-600' : 'text-gray-800'}`}>
                  {formatBetrag(w.kurs, w.code)}
                </span>
                <span className="text-gray-500 ml-1 text-sm">{w.symbol}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schnellrechner */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚡ Schnellübersicht EUR → {waehrung}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Euro</th>
                <th className="text-right py-2 text-gray-600">{aktuelleWaehrung.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[10, 50, 100, 500, 1000].map((eur) => (
                <tr key={eur} className="hover:bg-gray-50">
                  <td className="py-2 font-medium">{eur.toLocaleString('de-DE')} €</td>
                  <td className="py-2 text-right font-semibold text-emerald-600">
                    {formatBetrag(eur * aktuelleWaehrung.kurs, waehrung)} {aktuelleWaehrung.symbol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formel-Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Verwendete Formeln</h3>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">EUR → Fremdwährung:</p>
            <code className="block bg-gray-100 p-2 rounded text-gray-800 font-mono text-xs">
              Fremdwährung = EUR × Wechselkurs<br/>
              {betrag} EUR × {aktuelleWaehrung.kurs} = {formatBetrag(betrag * aktuelleWaehrung.kurs, waehrung)} {waehrung}
            </code>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Fremdwährung → EUR:</p>
            <code className="block bg-gray-100 p-2 rounded text-gray-800 font-mono text-xs">
              EUR = Fremdwährung ÷ Wechselkurs<br/>
              {betrag} {waehrung} ÷ {aktuelleWaehrung.kurs} = {formatBetrag(betrag / aktuelleWaehrung.kurs)} EUR
            </code>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wissenswertes zu Wechselkursen</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="font-semibold text-blue-800 mb-2">🏦 Europäische Zentralbank (EZB)</p>
            <p className="text-blue-700">
              Die EZB veröffentlicht täglich Referenzkurse für über 30 Währungen. 
              Diese Kurse werden weltweit als neutrale Orientierung verwendet.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="font-semibold text-green-800 mb-2">💳 Bankgebühren beachten</p>
            <p className="text-green-700">
              Banken und Wechselstuben nutzen eigene Kurse mit Aufschlag. 
              Beim Geldwechsel oder Kartenzahlung im Ausland können zusätzliche Gebühren anfallen.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-semibold text-purple-800 mb-2">📈 Kursschwankungen</p>
            <p className="text-purple-700">
              Wechselkurse ändern sich ständig basierend auf Angebot und Nachfrage, 
              Wirtschaftsdaten, Zinsentscheidungen und politischen Ereignissen.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl">
            <p className="font-semibold text-yellow-800 mb-2">🇪🇺 Euro-Fixkurse</p>
            <p className="text-yellow-700">
              Die Dänische Krone (DKK) ist durch den ERM II an den Euro gebunden 
              und schwankt nur minimal (7,46 ± 2,25%).
            </p>
          </div>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Offizielle Wechselkurs-Quellen</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Europäische Zentralbank (EZB)</p>
            <p className="text-sm text-blue-700 mt-1">Tägliche Referenzkurse für alle wichtigen Währungen</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">EZB Wechselkurse</p>
                <a 
                  href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.de.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  ecb.europa.eu →
                </a>
                <p className="text-xs text-gray-500 mt-1">Offizielle Referenzkurse</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🏦</span>
              <div>
                <p className="font-medium text-gray-800">Deutsche Bundesbank</p>
                <a 
                  href="https://www.bundesbank.de/de/statistiken/wechselkurse" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  bundesbank.de →
                </a>
                <p className="text-xs text-gray-500 mt-1">Historische Kurse</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tipps für Reisende */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">✈️ Tipps für Reisende</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">💳</span>
            <div>
              <p className="font-medium text-green-800">Kartenzahlung bevorzugen</p>
              <p className="text-green-700">Viele Banken bieten kostenlose Auslandszahlungen an – oft günstiger als Bargeld wechseln.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">🏧</span>
            <div>
              <p className="font-medium text-blue-800">Geldautomaten nutzen</p>
              <p className="text-blue-700">Im Ausland Geld abheben ist oft günstiger als Wechselstuben am Flughafen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">"DCC" ablehnen</p>
              <p className="text-yellow-700">Bei "Dynamic Currency Conversion" in EUR zahlen? Immer ablehnen – der Kurs ist meist schlechter!</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">📱</span>
            <div>
              <p className="font-medium text-purple-800">Kurs vorher prüfen</p>
              <p className="text-purple-700">Vergleiche den angebotenen Kurs mit dem EZB-Referenzkurs, um Abzocke zu vermeiden.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.de.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            EZB – Euro-Referenzkurse
          </a>
          <a 
            href="https://www.bundesbank.de/de/statistiken/wechselkurse"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Bundesbank – Wechselkurse
          </a>
          <p className="text-xs text-gray-500 mt-2 italic">
            Die angezeigten Kurse sind Richtwerte und können von den aktuellen Marktkursen abweichen.
          </p>
        </div>
      </div>
    </div>
  );
}
