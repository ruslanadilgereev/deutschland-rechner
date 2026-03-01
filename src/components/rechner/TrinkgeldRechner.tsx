import { useState, useMemo } from 'react';

// Trinkgeld-Prozentsätze mit Beschreibung
const TRINKGELD_STUFEN = [
  { prozent: 5, label: '5%', beschreibung: 'Minimal', bewertung: 'Service war okay' },
  { prozent: 10, label: '10%', beschreibung: 'Standard', bewertung: 'Guter Service' },
  { prozent: 15, label: '15%', beschreibung: 'Großzügig', bewertung: 'Sehr guter Service' },
  { prozent: 20, label: '20%', beschreibung: 'Hervorragend', bewertung: 'Exzellenter Service' },
];

// Service-Qualität Optionen
const SERVICE_QUALITAET = [
  { wert: 'schlecht', label: '😐 Okay', empfohlen: 5, beschreibung: 'Service war in Ordnung' },
  { wert: 'gut', label: '🙂 Gut', empfohlen: 10, beschreibung: 'Freundlich & aufmerksam' },
  { wert: 'sehr-gut', label: '😊 Sehr gut', empfohlen: 15, beschreibung: 'Besonders zuvorkommend' },
  { wert: 'exzellent', label: '🤩 Exzellent', empfohlen: 20, beschreibung: 'Außergewöhnlicher Service' },
];

// Trinkgeld-Empfehlungen nach Branche
const BRANCHEN_TIPPS = [
  { branche: 'Restaurant', emoji: '🍽️', empfehlung: '5-10%', hinweis: 'In Deutschland üblich, aber freiwillig' },
  { branche: 'Café/Bar', emoji: '☕', empfehlung: '5-10%', hinweis: 'Aufrunden oder kleine Beträge' },
  { branche: 'Lieferdienst', emoji: '🛵', empfehlung: '1-3 €', hinweis: 'Besonders bei schlechtem Wetter' },
  { branche: 'Taxi', emoji: '🚕', empfehlung: '5-10%', hinweis: 'Aufrunden ist üblich' },
  { branche: 'Friseur', emoji: '💇', empfehlung: '5-15%', hinweis: 'Je nach Zufriedenheit' },
  { branche: 'Hotel', emoji: '🏨', empfehlung: '1-5 €', hinweis: 'Pro Tag für Zimmermädchen' },
];

export default function TrinkgeldRechner() {
  const [rechnungsbetrag, setRechnungsbetrag] = useState(50);
  const [serviceQualitaet, setServiceQualitaet] = useState('gut');
  const [aufrundenAufVolleEuro, setAufrundenAufVolleEuro] = useState(false);
  const [ausgewaehlterProzent, setAusgewaehlterProzent] = useState<number | null>(null);

  const ergebnisse = useMemo(() => {
    const empfohlenerService = SERVICE_QUALITAET.find(s => s.wert === serviceQualitaet);
    const empfohlenProzent = empfohlenerService?.empfohlen || 10;

    return TRINKGELD_STUFEN.map((stufe) => {
      const trinkgeld = rechnungsbetrag * (stufe.prozent / 100);
      let gesamt = rechnungsbetrag + trinkgeld;
      
      let aufgerundet = false;
      let originalGesamt = gesamt;
      
      if (aufrundenAufVolleEuro) {
        gesamt = Math.ceil(gesamt);
        aufgerundet = gesamt !== originalGesamt;
      }
      
      const effektiverTrinkgeldBetrag = gesamt - rechnungsbetrag;
      const effektiverProzent = (effektiverTrinkgeldBetrag / rechnungsbetrag) * 100;

      return {
        ...stufe,
        trinkgeld: effektiverTrinkgeldBetrag,
        gesamt,
        istEmpfohlen: stufe.prozent === empfohlenProzent,
        aufgerundet,
        originalTrinkgeld: trinkgeld,
        effektiverProzent,
      };
    });
  }, [rechnungsbetrag, serviceQualitaet, aufrundenAufVolleEuro]);

  const empfohlenerService = SERVICE_QUALITAET.find(s => s.wert === serviceQualitaet);
  const empfohlenesErgebnis = ergebnisse.find(e => e.istEmpfohlen);
  const ausgewaehltesErgebnis = ausgewaehlterProzent !== null 
    ? ergebnisse.find(e => e.prozent === ausgewaehlterProzent) 
    : empfohlenesErgebnis;

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }) + ' €';

  return (
    <div className="max-w-lg mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Rechnungsbetrag */}
        <label className="block mb-6">
          <span className="text-gray-700 font-medium">Rechnungsbetrag (€)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              value={rechnungsbetrag}
              onChange={(e) => {
                setRechnungsbetrag(Math.max(0, parseFloat(e.target.value) || 0));
                setAusgewaehlterProzent(null);
              }}
              className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              step="0.01"
              min="0"
              placeholder="50,00"
            />
          </div>
          <div className="flex justify-center gap-2 mt-2">
            {[20, 50, 100, 150].map((betrag) => (
              <button
                key={betrag}
                onClick={() => {
                  setRechnungsbetrag(betrag);
                  setAusgewaehlterProzent(null);
                }}
                className={`px-3 py-1 text-sm rounded-lg transition-all ${
                  rechnungsbetrag === betrag
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {betrag} €
              </button>
            ))}
          </div>
        </label>

        {/* Service-Qualität */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3">Wie war der Service?</label>
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_QUALITAET.map((service) => (
              <button
                key={service.wert}
                onClick={() => {
                  setServiceQualitaet(service.wert);
                  setAusgewaehlterProzent(null);
                }}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  serviceQualitaet === service.wert
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">{service.label}</div>
                <div className={`text-xs ${serviceQualitaet === service.wert ? 'text-indigo-600' : 'text-gray-500'}`}>
                  → {service.empfohlen}% empfohlen
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Aufrunden Option */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <span className="font-medium text-gray-700">Auf volle Euro aufrunden</span>
            <p className="text-xs text-gray-500 mt-1">Praktisch beim Bezahlen mit Bargeld</p>
          </div>
          <button
            onClick={() => setAufrundenAufVolleEuro(!aufrundenAufVolleEuro)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              aufrundenAufVolleEuro ? 'bg-indigo-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                aufrundenAufVolleEuro ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Empfohlenes Ergebnis */}
      {ausgewaehltesErgebnis && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-indigo-100">
              {ausgewaehlterProzent !== null ? 'Gewähltes Trinkgeld' : '✨ Empfohlenes Trinkgeld'}
            </h3>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {ausgewaehltesErgebnis.label} {ausgewaehltesErgebnis.beschreibung}
            </span>
          </div>
          
          {/* Trinkgeld */}
          <div className="mb-4">
            <div className="text-indigo-100 text-sm mb-1">Trinkgeld</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {formatEuro(ausgewaehltesErgebnis.trinkgeld)}
              </span>
              {ausgewaehltesErgebnis.aufgerundet && aufrundenAufVolleEuro && (
                <span className="text-indigo-200 text-sm">
                  (aufgerundet)
                </span>
              )}
            </div>
          </div>

          {/* Gesamtbetrag */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-indigo-100">Rechnung</span>
              <span className="font-semibold">{formatEuro(rechnungsbetrag)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-indigo-100">+ Trinkgeld ({ausgewaehltesErgebnis.effektiverProzent.toFixed(1)}%)</span>
              <span className="font-semibold">{formatEuro(ausgewaehltesErgebnis.trinkgeld)}</span>
            </div>
            <div className="border-t border-white/20 pt-2 flex justify-between items-center">
              <span className="text-indigo-100 font-medium">= Gesamt zu zahlen</span>
              <span className="text-2xl font-bold">{formatEuro(ausgewaehltesErgebnis.gesamt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Alle Trinkgeld-Optionen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💶 Alle Trinkgeld-Optionen</h3>
        <div className="space-y-3">
          {ergebnisse.map((ergebnis) => (
            <button
              key={ergebnis.prozent}
              onClick={() => setAusgewaehlterProzent(ergebnis.prozent)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                (ausgewaehlterProzent === ergebnis.prozent) || (ausgewaehlterProzent === null && ergebnis.istEmpfohlen)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${
                    (ausgewaehlterProzent === ergebnis.prozent) || (ausgewaehlterProzent === null && ergebnis.istEmpfohlen)
                      ? 'text-indigo-600'
                      : 'text-gray-700'
                  }`}>
                    {ergebnis.label}
                  </span>
                  <div>
                    <span className={`text-sm font-medium ${
                      (ausgewaehlterProzent === ergebnis.prozent) || (ausgewaehlterProzent === null && ergebnis.istEmpfohlen)
                        ? 'text-indigo-700'
                        : 'text-gray-600'
                    }`}>
                      {ergebnis.beschreibung}
                    </span>
                    {ergebnis.istEmpfohlen && ausgewaehlterProzent === null && (
                      <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                        Empfohlen
                      </span>
                    )}
                    <p className="text-xs text-gray-500">{ergebnis.bewertung}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    (ausgewaehlterProzent === ergebnis.prozent) || (ausgewaehlterProzent === null && ergebnis.istEmpfohlen)
                      ? 'text-indigo-600'
                      : 'text-gray-800'
                  }`}>
                    {formatEuro(ergebnis.trinkgeld)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Gesamt: {formatEuro(ergebnis.gesamt)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Branchen-Tipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Trinkgeld nach Branche</h3>
        <div className="grid grid-cols-2 gap-3">
          {BRANCHEN_TIPPS.map((branche) => (
            <div key={branche.branche} className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{branche.emoji}</span>
                <span className="font-medium text-gray-800">{branche.branche}</span>
              </div>
              <div className="text-indigo-600 font-bold">{branche.empfehlung}</div>
              <p className="text-xs text-gray-500 mt-1">{branche.hinweis}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Schnellrechner */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">⚡ Schnellübersicht</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Rechnung</th>
                <th className="text-right py-2 text-gray-600">5%</th>
                <th className="text-right py-2 text-gray-600">10%</th>
                <th className="text-right py-2 text-gray-600">15%</th>
                <th className="text-right py-2 text-gray-600">20%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[20, 30, 50, 75, 100].map((betrag) => (
                <tr key={betrag} className="hover:bg-gray-50">
                  <td className="py-2 font-medium">{betrag} €</td>
                  <td className="py-2 text-right text-gray-600">{(betrag * 0.05).toFixed(2)} €</td>
                  <td className="py-2 text-right text-gray-600">{(betrag * 0.10).toFixed(2)} €</td>
                  <td className="py-2 text-right text-gray-600">{(betrag * 0.15).toFixed(2)} €</td>
                  <td className="py-2 text-right font-semibold text-indigo-600">{(betrag * 0.20).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Trinkgeld in Deutschland</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="font-semibold text-green-800 mb-2">✅ Trinkgeld ist freiwillig</p>
            <p className="text-green-700">
              In Deutschland gibt es keine Pflicht zum Trinkgeld. Der Service ist bereits 
              im Preis enthalten. Trinkgeld ist eine persönliche Anerkennung für guten Service.
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="font-semibold text-blue-800 mb-2">💰 Übliche Höhe</p>
            <p className="text-blue-700">
              5-10% sind in Deutschland üblich. Bei sehr gutem Service oder in gehobenen 
              Restaurants werden auch 15% gegeben. Mehr als 15% ist eher selten.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl">
            <p className="font-semibold text-yellow-800 mb-2">🗣️ Wie gibt man Trinkgeld?</p>
            <ul className="text-yellow-700 space-y-1">
              <li>• <strong>„Stimmt so"</strong> – Kellner behält das Wechselgeld</li>
              <li>• <strong>„Machen Sie 50"</strong> – Aufrunden auf gewünschten Betrag</li>
              <li>• Bei Kartenzahlung: Betrag vor dem Bezahlen nennen</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-semibold text-purple-800 mb-2">🌍 Unterschied zu anderen Ländern</p>
            <p className="text-purple-700">
              In den USA sind 15-25% üblich (Grundgehalt niedriger). In Deutschland 
              verdienen Servicekräfte einen festen Lohn, daher ist Trinkgeld hier 
              ein Bonus, keine Notwendigkeit.
            </p>
          </div>
        </div>
      </div>

      {/* Steuerliche Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Gut zu wissen</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-gray-800">Trinkgeld ist steuerfrei</p>
              <p className="text-gray-600">Für Arbeitnehmer ist Trinkgeld nach §3 Nr. 51 EStG steuerfrei, wenn es direkt vom Gast an den Mitarbeiter gegeben wird.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">💳</span>
            <div>
              <p className="font-medium text-gray-800">Kartenzahlung</p>
              <p className="text-gray-600">Bei Kartenzahlung Trinkgeld vorher ansagen oder bar geben. So kommt es direkt beim Personal an.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🧾</span>
            <div>
              <p className="font-medium text-gray-800">Trinkgeld auf der Rechnung</p>
              <p className="text-gray-600">In manchen Ländern wird Trinkgeld automatisch aufgeschlagen. In Deutschland ist das unüblich.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__3.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §3 Nr. 51 EStG – Steuerfreies Trinkgeld
          </a>
          <a 
            href="https://www.verbraucherzentrale.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Trinkgeld-Empfehlungen
          </a>
          <a 
            href="https://www.dehoga-bundesverband.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DEHOGA Bundesverband – Gastronomie Deutschland
          </a>
        </div>
      </div>
    </div>
  );
}
