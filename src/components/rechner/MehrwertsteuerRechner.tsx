import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// MwSt-Sätze in Deutschland
const MWST_SAETZE = [
  { wert: 19, label: '19% Regelsteuersatz', beispiele: 'Elektronik, Kleidung, Möbel, Autos, Dienstleistungen' },
  { wert: 7, label: '7% ermäßigter Satz', beispiele: 'Lebensmittel, Bücher, Zeitungen, ÖPNV, Hotels' },
  { wert: 0, label: '0% steuerfrei', beispiele: 'Exporte, innergemeinschaftliche Lieferungen, medizinische Leistungen' },
];

type Richtung = 'netto-zu-brutto' | 'brutto-zu-netto';

export default function MehrwertsteuerRechner() {
  const [betrag, setBetrag] = useState(100);
  const [mwstSatz, setMwstSatz] = useState(19);
  const [richtung, setRichtung] = useState<Richtung>('netto-zu-brutto');

  const ergebnis = useMemo(() => {
    const satzDecimal = mwstSatz / 100;
    
    if (richtung === 'netto-zu-brutto') {
      // Netto → Brutto (MwSt aufschlagen)
      const netto = betrag;
      const mwstBetrag = netto * satzDecimal;
      const brutto = netto + mwstBetrag;
      return { netto, brutto, mwstBetrag };
    } else {
      // Brutto → Netto (MwSt herausrechnen)
      const brutto = betrag;
      const netto = brutto / (1 + satzDecimal);
      const mwstBetrag = brutto - netto;
      return { netto, brutto, mwstBetrag };
    }
  }, [betrag, mwstSatz, richtung]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }) + ' €';

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Mehrwertsteuer-Rechner" rechnerSlug="mehrwertsteuer-rechner" />

{/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Richtung wählen */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3">Berechnungsrichtung</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRichtung('netto-zu-brutto')}
              className={`p-4 rounded-xl border-2 transition-all ${
                richtung === 'netto-zu-brutto'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">➕</div>
              <div className="text-sm font-semibold">Netto → Brutto</div>
              <div className="text-xs mt-1 opacity-75">MwSt aufschlagen</div>
            </button>
            <button
              onClick={() => setRichtung('brutto-zu-netto')}
              className={`p-4 rounded-xl border-2 transition-all ${
                richtung === 'brutto-zu-netto'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">➖</div>
              <div className="text-sm font-semibold">Brutto → Netto</div>
              <div className="text-xs mt-1 opacity-75">MwSt herausrechnen</div>
            </button>
          </div>
        </div>

        {/* Betrag eingeben */}
        <label className="block mb-6">
          <span className="text-gray-700 font-medium">
            {richtung === 'netto-zu-brutto' ? 'Nettobetrag' : 'Bruttobetrag'} (€)
          </span>
          <div className="mt-2 relative">
            <input
              type="number"
              value={betrag}
              onChange={(e) => setBetrag(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
              step="0.01"
              min="0"
            />
          </div>
        </label>

        {/* MwSt-Satz wählen */}
        <div className="mb-2">
          <label className="block text-gray-700 font-medium mb-3">MwSt-Satz</label>
          <div className="space-y-2">
            {MWST_SAETZE.map((satz) => (
              <button
                key={satz.wert}
                onClick={() => setMwstSatz(satz.wert)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  mwstSatz === satz.wert
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`font-bold ${mwstSatz === satz.wert ? 'text-yellow-700' : 'text-gray-800'}`}>
                      {satz.label}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{satz.beispiele}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    mwstSatz === satz.wert
                      ? 'border-yellow-500 bg-yellow-500'
                      : 'border-gray-300'
                  }`}>
                    {mwstSatz === satz.wert && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-yellow-100 mb-4">Ergebnis</h3>
        
        {/* Hauptergebnis */}
        <div className="mb-4">
          <div className="text-yellow-100 text-sm mb-1">
            {richtung === 'netto-zu-brutto' ? 'Bruttobetrag' : 'Nettobetrag'}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {formatEuro(richtung === 'netto-zu-brutto' ? ergebnis.brutto : ergebnis.netto)}
            </span>
          </div>
        </div>

        {/* Aufschlüsselung */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-yellow-100">Nettobetrag</span>
            <span className="font-semibold">{formatEuro(ergebnis.netto)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-yellow-100">+ {mwstSatz}% MwSt</span>
            <span className="font-semibold">{formatEuro(ergebnis.mwstBetrag)}</span>
          </div>
          <div className="border-t border-white/20 pt-3 flex justify-between items-center">
            <span className="text-yellow-100 font-medium">= Bruttobetrag</span>
            <span className="text-xl font-bold">{formatEuro(ergebnis.brutto)}</span>
          </div>
        </div>
      </div>
{/* Formel-Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Verwendete Formeln</h3>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Netto → Brutto (MwSt aufschlagen):</p>
            <code className="block bg-gray-100 p-2 rounded text-gray-800 font-mono text-xs">
              Brutto = Netto × (1 + MwSt-Satz)<br/>
              Brutto = Netto × 1,{mwstSatz.toString().padStart(2, '0')}
            </code>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Brutto → Netto (MwSt herausrechnen):</p>
            <code className="block bg-gray-100 p-2 rounded text-gray-800 font-mono text-xs">
              Netto = Brutto ÷ (1 + MwSt-Satz)<br/>
              Netto = Brutto ÷ 1,{mwstSatz.toString().padStart(2, '0')}
            </code>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wann gilt welcher Steuersatz?</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="p-4 bg-yellow-50 rounded-xl">
            <p className="font-semibold text-yellow-800 mb-2">19% Regelsteuersatz</p>
            <ul className="space-y-1 text-yellow-700">
              <li>• Elektronik, Computer, Smartphones</li>
              <li>• Kleidung, Schuhe, Accessoires</li>
              <li>• Möbel, Haushaltsgeräte</li>
              <li>• Autos, Fahrräder</li>
              <li>• Handwerker- & Dienstleistungen</li>
              <li>• Restaurantbesuche (Speisen vor Ort)</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="font-semibold text-green-800 mb-2">7% ermäßigter Satz</p>
            <ul className="space-y-1 text-green-700">
              <li>• Lebensmittel (außer Getränke & Luxus)</li>
              <li>• Bücher, Zeitungen, Zeitschriften</li>
              <li>• Öffentlicher Nahverkehr (bis 50 km)</li>
              <li>• Hotelübernachtungen</li>
              <li>• Kulturveranstaltungen, Kino</li>
              <li>• Speisen zum Mitnehmen</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="font-semibold text-blue-800 mb-2">0% Steuerbefreit</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Exporte außerhalb der EU</li>
              <li>• Innergemeinschaftliche Lieferungen</li>
              <li>• Medizinische Heilbehandlungen</li>
              <li>• Bankdienstleistungen</li>
              <li>• Versicherungsleistungen</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Finanzamt</p>
            <p className="text-sm text-blue-700 mt-1">Die Umsatzsteuer wird an das zuständige Finanzamt abgeführt.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Steuer-Hotline</p>
                <p className="text-gray-600">Wende dich an dein lokales Finanzamt</p>
                <p className="text-xs text-gray-500 mt-1">Kontakt auf Steuerbescheid</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">ELSTER Online</p>
                <a 
                  href="https://www.elster.de" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  elster.de →
                </a>
                <p className="text-xs text-gray-500 mt-1">Umsatzsteuer-Voranmeldung</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-yellow-800">MwSt = Umsatzsteuer</p>
              <p className="text-yellow-700">Mehrwertsteuer (MwSt) und Umsatzsteuer (USt) sind dasselbe – umgangssprachlich wird oft MwSt verwendet.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🧾</span>
            <div>
              <p className="font-medium text-green-800">Vorsteuerabzug für Unternehmer</p>
              <p className="text-green-700">Als Unternehmer kannst du die gezahlte MwSt als Vorsteuer vom Finanzamt zurückholen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">🏪</span>
            <div>
              <p className="font-medium text-blue-800">Kleinunternehmerregelung</p>
              <p className="text-blue-700">Bei Vorjahresumsatz unter 25.000 € (laufendes Jahr unter 100.000 €) kannst du dich von der USt befreien lassen (§19 UStG).</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">🇪🇺</span>
            <div>
              <p className="font-medium text-purple-800">EU-Handel beachten</p>
              <p className="text-purple-700">Bei Geschäften innerhalb der EU gelten besondere Regeln (Reverse-Charge, OSS).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schnellrechner Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚡ Schnellübersicht (19% MwSt)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Netto</th>
                <th className="text-right py-2 text-gray-600">+ MwSt</th>
                <th className="text-right py-2 text-gray-600">= Brutto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[10, 50, 100, 500, 1000].map((netto) => (
                <tr key={netto} className="hover:bg-gray-50">
                  <td className="py-2 font-medium">{netto.toLocaleString('de-DE')} €</td>
                  <td className="py-2 text-right text-gray-600">{(netto * 0.19).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</td>
                  <td className="py-2 text-right font-semibold text-yellow-600">{(netto * 1.19).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
{/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/ustg_1980/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Umsatzsteuergesetz (UStG) – Gesetze im Internet
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Umsatzsteuer/umsatzsteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – Umsatzsteuer
          </a>
          <a 
            href="https://www.ihk.de/themen/steuern/umsatzsteuer"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            IHK – Umsatzsteuer für Unternehmen
          </a>
        </div>
      </div>
    </div>
  );
}
