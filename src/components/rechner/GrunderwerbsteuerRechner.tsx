import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Grunderwerbsteuer-Sätze nach Bundesland (Stand 2026)
// Letzte Änderung: Bremen von 5,0% auf 5,5% erhöht (01.07.2025)
const BUNDESLAENDER = [
  { kuerzel: 'BW', name: 'Baden-Württemberg', satz: 5.0 },
  { kuerzel: 'BY', name: 'Bayern', satz: 3.5 },
  { kuerzel: 'BE', name: 'Berlin', satz: 6.0 },
  { kuerzel: 'BB', name: 'Brandenburg', satz: 6.5 },
  { kuerzel: 'HB', name: 'Bremen', satz: 5.5 },  // Erhöht von 5,0% am 01.07.2025
  { kuerzel: 'HH', name: 'Hamburg', satz: 5.5 },
  { kuerzel: 'HE', name: 'Hessen', satz: 6.0 },
  { kuerzel: 'MV', name: 'Mecklenburg-Vorpommern', satz: 6.0 },
  { kuerzel: 'NI', name: 'Niedersachsen', satz: 5.0 },
  { kuerzel: 'NW', name: 'Nordrhein-Westfalen', satz: 6.5 },
  { kuerzel: 'RP', name: 'Rheinland-Pfalz', satz: 5.0 },
  { kuerzel: 'SL', name: 'Saarland', satz: 6.5 },
  { kuerzel: 'SN', name: 'Sachsen', satz: 5.5 },
  { kuerzel: 'ST', name: 'Sachsen-Anhalt', satz: 5.0 },
  { kuerzel: 'SH', name: 'Schleswig-Holstein', satz: 6.5 },
  { kuerzel: 'TH', name: 'Thüringen', satz: 5.0 },
];

export default function GrunderwerbsteuerRechner() {
  const [kaufpreis, setKaufpreis] = useState(350000);
  const [bundesland, setBundesland] = useState('BY');

  const ergebnis = useMemo(() => {
    const land = BUNDESLAENDER.find(bl => bl.kuerzel === bundesland)!;
    const steuer = Math.round(kaufpreis * (land.satz / 100));
    
    return {
      land,
      steuer,
      kaufpreis,
    };
  }, [kaufpreis, bundesland]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  // Sortiere nach Steuersatz für Vergleich
  const sortiert = [...BUNDESLAENDER].sort((a, b) => a.satz - b.satz);
  const guenstigster = sortiert[0];
  const teuerster = sortiert[sortiert.length - 1];

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Grunderwerbsteuer-Rechner 2025 & 2026" rechnerSlug="grunderwerbsteuer-rechner" />

{/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kaufpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kaufpreis der Immobilie</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kaufpreis}
              onChange={(e) => setKaufpreis(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            min="50000"
            max="1500000"
            step="10000"
            value={kaufpreis}
            onChange={(e) => setKaufpreis(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50.000 €</span>
            <span>1.500.000 €</span>
          </div>
        </div>

        {/* Bundesland */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bundesland</span>
          </label>
          <select
            value={bundesland}
            onChange={(e) => setBundesland(e.target.value)}
            className="w-full text-lg py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none bg-white"
          >
            {BUNDESLAENDER.map((bl) => (
              <option key={bl.kuerzel} value={bl.kuerzel}>
                {bl.name} ({bl.satz}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-yellow-100 mb-1">Grunderwerbsteuer in {ergebnis.land.name}</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.steuer)}</span>
          </div>
          <p className="text-yellow-100 mt-2">
            = {ergebnis.land.satz}% von {formatEuro(kaufpreis)}
          </p>
        </div>
      </div>
{/* Vergleich alle Bundesländer */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🗺️ Vergleich aller Bundesländer</h3>
        
        <div className="space-y-2">
          {sortiert.map((bl) => {
            const steuer = Math.round(kaufpreis * (bl.satz / 100));
            const istAktuell = bl.kuerzel === bundesland;
            const differenz = steuer - ergebnis.steuer;
            
            return (
              <div 
                key={bl.kuerzel}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  istAktuell 
                    ? 'bg-yellow-50 border-2 border-yellow-300' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-12 text-center font-bold text-sm rounded-lg py-1 ${
                    bl.satz === guenstigster.satz 
                      ? 'bg-green-100 text-green-700'
                      : bl.satz === teuerster.satz
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {bl.satz}%
                  </span>
                  <span className={`font-medium ${istAktuell ? 'text-yellow-800' : 'text-gray-700'}`}>
                    {bl.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${istAktuell ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {formatEuro(steuer)}
                  </span>
                  {!istAktuell && differenz !== 0 && (
                    <span className={`text-xs ml-2 ${differenz > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {differenz > 0 ? '+' : ''}{formatEuro(differenz)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-xl text-sm">
          <p className="text-green-800">
            <strong>💡 Tipp:</strong> In {guenstigster.name} zahlst du nur {guenstigster.satz}% – 
            bei {formatEuro(kaufpreis)} sind das {formatEuro(Math.round(kaufpreis * guenstigster.satz / 100))} 
            (Ersparnis vs. {teuerster.name}: {formatEuro(Math.round(kaufpreis * (teuerster.satz - guenstigster.satz) / 100))})
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Einmalige Steuer</strong> beim Kauf einer Immobilie oder eines Grundstücks</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Steuersatz variiert nach <strong>Bundesland</strong> (3,5% – 6,5%)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Berechnung auf <strong>Kaufpreis oder Verkehrswert</strong> (bei Schenkung)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Zahlung fällig nach Erhalt des <strong>Steuerbescheids</strong></span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-yellow-50 rounded-xl p-4">
            <p className="font-semibold text-yellow-900">Finanzamt am Standort der Immobilie</p>
            <p className="text-sm text-yellow-700 mt-1">Nicht dein Wohnort-Finanzamt, sondern wo die Immobilie liegt!</p>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium text-gray-800">Ablauf</p>
              <ol className="text-gray-600 mt-1 list-decimal list-inside space-y-1">
                <li>Notar meldet den Kauf ans Finanzamt</li>
                <li>Finanzamt sendet Steuerbescheid (ca. 2-8 Wochen)</li>
                <li>Zahlung innerhalb 4 Wochen</li>
                <li>Unbedenklichkeitsbescheinigung für Grundbucheintrag</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Förderprogramme für Erstkäufer */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">💰 Förderprogramme für Erstkäufer</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">🏠</span>
            <div>
              <p className="font-medium text-blue-800">Hessengeld (seit März 2024)</p>
              <p className="text-blue-700">Erstkäufer in Hessen können bis zu <strong>10.000 € pro Erwachsenen</strong> und <strong>5.000 € pro Kind</strong> zurückbekommen – max. die gezahlte Grunderwerbsteuer. Auszahlung in 10 Jahresraten.</p>
              <a 
                href="https://finanzen.hessen.de/initiativen/hessengeld"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mt-1 inline-block"
              >
                → Antrag stellen
              </a>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🌲</span>
            <div>
              <p className="font-medium text-green-800">Thüringen: Niedrigster Steuersatz in Ostdeutschland</p>
              <p className="text-green-700">Seit 1. Januar 2024 gilt in Thüringen nur noch <strong>5,0% Grunderwerbsteuer</strong> (gesenkt von 6,5%) – der niedrigste Satz aller ostdeutschen Bundesländer.</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            ⚠️ NRW.Zuschuss Wohneigentum ist seit Ende 2024 eingestellt.
          </p>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Keine Grundbucheintragung ohne Zahlung!</p>
              <p className="text-yellow-700">Das Eigentum geht erst mit der Unbedenklichkeitsbescheinigung auf dich über.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium text-green-800">Ausnahmen möglich</p>
              <p className="text-green-700">Erbschaft, Schenkung an Verwandte 1. Grades, Erwerb unter 2.500 € sind steuerfrei.</p>
            </div>
          </div>
        </div>
      </div>
{/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Grundsteuer_Grunderwerbsteuer/Grundsteuer_Grunderwerbsteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – Grundsteuer & Grunderwerbsteuer
          </a>
          <a 
            href="https://www.finanztip.de/grunderwerbsteuer/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Finanztip – Grunderwerbsteuer Ratgeber (Stand: Feb 2026)
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/grestg_1983/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Grunderwerbsteuergesetz (GrEStG) – Gesetze im Internet
          </a>
          <a 
            href="https://de.wikipedia.org/wiki/Grunderwerbsteuer_(Deutschland)"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Wikipedia – Grunderwerbsteuer (Deutschland)
          </a>
        </div>
      </div>
    </div>
  );
}
