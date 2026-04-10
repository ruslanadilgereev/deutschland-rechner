import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

type Rundungsmodus = 'keine' | 'auf50cent' | 'auf1euro';

export default function TrinkgeldRechner() {
  const [rechnungsbetrag, setRechnungsbetrag] = useState<number>(50);
  const [prozent, setProzent] = useState<number>(10);
  const [customProzent, setCustomProzent] = useState<string>('');
  const [rundung, setRundung] = useState<Rundungsmodus>('keine');
  const [teilen, setTeilen] = useState(false);
  const [anzahlPersonen, setAnzahlPersonen] = useState<number>(2);
  const [berechnet, setBerechnet] = useState(false);

  const aktiverProzent = customProzent !== '' ? Number(customProzent) : prozent;

  const ergebnis = useMemo(() => {
    if (!rechnungsbetrag || rechnungsbetrag <= 0 || aktiverProzent < 0 || aktiverProzent > 100) {
      return null;
    }

    let trinkgeld = rechnungsbetrag * (aktiverProzent / 100);
    let gesamt = rechnungsbetrag + trinkgeld;

    // Aufrunden
    if (rundung === 'auf50cent') {
      gesamt = Math.ceil(gesamt * 2) / 2; // auf nächste 0,50 €
      trinkgeld = gesamt - rechnungsbetrag;
    } else if (rundung === 'auf1euro') {
      gesamt = Math.ceil(gesamt); // auf nächsten vollen Euro
      trinkgeld = gesamt - rechnungsbetrag;
    }

    const effektiverProzentsatz = (trinkgeld / rechnungsbetrag) * 100;
    const proPersonGesamt = teilen && anzahlPersonen > 0 ? gesamt / anzahlPersonen : null;
    const proPersonTrinkgeld = teilen && anzahlPersonen > 0 ? trinkgeld / anzahlPersonen : null;

    return {
      rechnungsbetrag,
      trinkgeld,
      gesamt,
      effektiverProzentsatz,
      proPersonGesamt,
      proPersonTrinkgeld,
      anzahlPersonen: teilen ? anzahlPersonen : 1,
      hatTeilung: teilen && anzahlPersonen > 1,
    };
  }, [rechnungsbetrag, aktiverProzent, rundung, teilen, anzahlPersonen]);

  const formatCurrency = (n: number) =>
    n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  const formatPercent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' %';

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  const schnellProzente = [5, 10, 15, 20];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">💶</span>
          Trinkgeld berechnen
        </h2>

        <div className="space-y-6">
          {/* Rechnungsbetrag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechnungsbetrag (€)
            </label>
            <input
              type="number"
              value={rechnungsbetrag}
              onChange={(e) => setRechnungsbetrag(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              placeholder="z.B. 50,00"
              min={0}
              step={0.01}
            />
          </div>

          {/* Trinkgeld in % */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trinkgeld (%)
            </label>
            {/* Schnellauswahl */}
            <div className="flex flex-wrap gap-2 mb-3">
              {schnellProzente.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setProzent(p);
                    setCustomProzent('');
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    customProzent === '' && prozent === p
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
            <input
              type="number"
              value={customProzent}
              onChange={(e) => setCustomProzent(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              placeholder="Eigener Prozentsatz (optional)"
              min={0}
              max={100}
              step={0.5}
            />
          </div>

          {/* Aufrunden */}
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <label className="text-sm font-medium text-emerald-800 mb-3 block">
              🔄 Aufrunden (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {([
                ['keine', 'Nicht aufrunden'],
                ['auf50cent', 'Auf 0,50 €'],
                ['auf1euro', 'Auf 1,00 €'],
              ] as [Rundungsmodus, string][]).map(([wert, label]) => (
                <button
                  key={wert}
                  onClick={() => setRundung(wert)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    rundung === wert
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Rechnung teilen */}
          <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-teal-800">
                👥 Rechnung teilen
              </label>
              <button
                onClick={() => setTeilen(!teilen)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  teilen ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    teilen ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {teilen && (
              <div>
                <label className="block text-xs text-teal-600 mb-1">Anzahl Personen</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAnzahlPersonen(Math.max(2, anzahlPersonen - 1))}
                    className="w-10 h-10 rounded-full bg-white border border-teal-300 text-teal-700 font-bold hover:bg-teal-100 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={anzahlPersonen}
                    onChange={(e) => setAnzahlPersonen(Math.max(2, Number(e.target.value)))}
                    className="w-20 text-center px-2 py-2 rounded-lg border border-teal-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg font-bold"
                    min={2}
                  />
                  <button
                    onClick={() => setAnzahlPersonen(anzahlPersonen + 1)}
                    className="w-10 h-10 rounded-full bg-white border border-teal-300 text-teal-700 font-bold hover:bg-teal-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleBerechnen}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
          >
            💶 Trinkgeld berechnen
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
              <div className="text-gray-500 text-sm mb-1">Gesamtbetrag</div>
              <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <div className="text-4xl font-bold">{formatCurrency(ergebnis.gesamt)}</div>
              </div>
              <div className="mt-4 flex justify-center items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(ergebnis.trinkgeld)}
                  </div>
                  <div className="text-sm text-gray-500">Trinkgeld</div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatPercent(ergebnis.effektiverProzentsatz)}
                  </div>
                  <div className="text-sm text-gray-500">effektiver Satz</div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Rechnungsbetrag</span>
                <span className="font-medium text-gray-800">{formatCurrency(ergebnis.rechnungsbetrag)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Trinkgeld ({formatPercent(ergebnis.effektiverProzentsatz)})
                </span>
                <span className="font-medium text-emerald-600">+ {formatCurrency(ergebnis.trinkgeld)}</span>
              </div>

              <div className="flex justify-between items-center py-3 bg-emerald-50 -mx-2 px-4 rounded-lg">
                <span className="font-bold text-emerald-800">Gesamtbetrag</span>
                <span className="font-bold text-emerald-800 text-xl">{formatCurrency(ergebnis.gesamt)}</span>
              </div>

              {ergebnis.hatTeilung && ergebnis.proPersonGesamt && ergebnis.proPersonTrinkgeld && (
                <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <h3 className="font-semibold text-teal-800 mb-3 flex items-center gap-2">
                    <span>👥</span>
                    Pro Person ({ergebnis.anzahlPersonen} Personen)
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-teal-700">Anteil pro Person</span>
                      <span className="font-bold text-teal-800 text-lg">{formatCurrency(ergebnis.proPersonGesamt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-teal-600 text-sm">davon Trinkgeld</span>
                      <span className="font-medium text-teal-700">{formatCurrency(ergebnis.proPersonTrinkgeld)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trinkgeld-Vergleich */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Trinkgeld-Vergleich
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Was würden Sie bei verschiedenen Prozentsätzen zahlen?
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Prozent</th>
                    <th className="text-right py-2 px-2">Trinkgeld</th>
                    <th className="text-right py-2 px-2">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  {[5, 10, 15, 20, 25].map((p) => {
                    const tg = ergebnis.rechnungsbetrag * (p / 100);
                    const gs = ergebnis.rechnungsbetrag + tg;
                    const istAktuell = Math.abs(p - ergebnis.effektiverProzentsatz) < 0.5;
                    return (
                      <tr
                        key={p}
                        className={`border-b border-gray-100 ${istAktuell ? 'bg-emerald-50' : ''}`}
                      >
                        <td className="py-2 px-2">
                          <span className={`font-medium ${istAktuell ? 'text-emerald-700' : ''}`}>
                            {p}%
                            {istAktuell && <span className="ml-2 text-xs text-emerald-500">← Ihre Wahl</span>}
                          </span>
                        </td>
                        <td className="text-right py-2 px-2 text-emerald-600 font-medium">
                          + {formatCurrency(tg)}
                        </td>
                        <td className="text-right py-2 px-2 font-bold text-gray-800">
                          {formatCurrency(gs)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trinkgeld-Guide */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Trinkgeld-Empfehlungen
            </h2>

            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">🍽️ Restaurant</div>
                    <div className="text-sm opacity-80">Üblich in Deutschland</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">5–10 %</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">🚕 Taxi</div>
                    <div className="text-sm opacity-80">Fahrbetrag aufrunden</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">5–10 %</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">💇 Friseur</div>
                    <div className="text-sm opacity-80">Je nach Zufriedenheit</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">5–15 %</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">🏨 Hotel</div>
                    <div className="text-sm opacity-80">Zimmermädchen, Gepäckträger</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">1–5 €</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">🛵 Lieferdienst</div>
                    <div className="text-sm opacity-80">Pizza, Essen, Pakete</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">1–3 €</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hinweise */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Gut zu wissen
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-xl">✅</span>
                <p className="text-green-800">
                  <strong>Steuerfrei:</strong> Trinkgeld ist für Arbeitnehmer nach §3 Nr. 51 EStG 
                  vollständig steuerfrei – egal wie hoch.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">💳</span>
                <p className="text-blue-800">
                  <strong>Kartenzahlung:</strong> Bei Kartenzahlung sagen Sie dem Personal einfach den 
                  Gesamtbetrag inkl. Trinkgeld oder geben bar dazu.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="text-xl">🌍</span>
                <p className="text-amber-800">
                  <strong>International:</strong> In den USA sind 15–20% üblich, in Japan ist Trinkgeld 
                  verpönt. In Deutschland reichen meist 5–10%.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-xl">💬</span>
                <p className="text-purple-800">
                  <strong>Typisch deutsch:</strong> Sagen Sie „Stimmt so" oder nennen Sie den 
                  aufgerundeten Betrag direkt beim Bezahlen.
                </p>
              </div>
            </div>
          <RechnerFeedback rechnerName="Trinkgeld-Rechner" rechnerSlug="trinkgeld-rechner" />
      </div>
        </>
      )}
    </div>
  );
}
