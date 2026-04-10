import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

const DEFAULT_PROZENTE = { beduerfnisse: 50, wuensche: 30, sparen: 20 };

export default function BudgetRechner() {
  const [nettoeinkommen, setNettoeinkommen] = useState<number>(2500);
  const [berechnet, setBerechnet] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [beduerfnisseProzent, setBeduerfnisseProzent] = useState(50);
  const [wuenscheProzent, setWuenscheProzent] = useState(30);
  const [sparenProzent, setSparenProzent] = useState(20);

  const prozentSumme = beduerfnisseProzent + wuenscheProzent + sparenProzent;

  const ergebnis = useMemo(() => {
    if (!nettoeinkommen || nettoeinkommen <= 0) return null;

    const bP = customMode ? beduerfnisseProzent : DEFAULT_PROZENTE.beduerfnisse;
    const wP = customMode ? wuenscheProzent : DEFAULT_PROZENTE.wuensche;
    const sP = customMode ? sparenProzent : DEFAULT_PROZENTE.sparen;

    const beduerfnisse = nettoeinkommen * (bP / 100);
    const wuensche = nettoeinkommen * (wP / 100);
    const sparen = nettoeinkommen * (sP / 100);

    return {
      beduerfnisse,
      wuensche,
      sparen,
      beduerfnisseProzent: bP,
      wuenscheProzent: wP,
      sparenProzent: sP,
      jahresSparen: sparen * 12,
      jahresWuensche: wuensche * 12,
      jahresBeduerfnisse: beduerfnisse * 12,
    };
  }, [nettoeinkommen, customMode, beduerfnisseProzent, wuenscheProzent, sparenProzent]);

  const formatCurrency = (n: number) =>
    n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  // Schnell-Buttons für typische Einkommen
  const schnellEinkommen = [1500, 2000, 2500, 3000, 3500, 4000, 5000];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Budget berechnen
        </h2>

        <div className="space-y-6">
          {/* Nettoeinkommen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monatliches Nettoeinkommen (€)
            </label>
            <input
              type="number"
              value={nettoeinkommen}
              onChange={(e) => setNettoeinkommen(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="z.B. 2.500"
              min={0}
              step={100}
            />
            {/* Schnellauswahl */}
            <div className="flex flex-wrap gap-2 mt-3">
              {schnellEinkommen.map((e) => (
                <button
                  key={e}
                  onClick={() => setNettoeinkommen(e)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    nettoeinkommen === e
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                >
                  {e.toLocaleString('de-DE')} €
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prozente Toggle */}
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-indigo-800">
                ⚙️ Eigene Aufteilung verwenden
              </label>
              <button
                onClick={() => {
                  if (!customMode) {
                    setBeduerfnisseProzent(50);
                    setWuenscheProzent(30);
                    setSparenProzent(20);
                  }
                  setCustomMode(!customMode);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  customMode ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    customMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {customMode && (
              <div className="space-y-3 mt-4">
                <div>
                  <label className="text-sm text-indigo-700">Grundbedürfnisse (%)</label>
                  <input
                    type="number"
                    value={beduerfnisseProzent}
                    onChange={(e) => setBeduerfnisseProzent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                <div>
                  <label className="text-sm text-indigo-700">Wünsche (%)</label>
                  <input
                    type="number"
                    value={wuenscheProzent}
                    onChange={(e) => setWuenscheProzent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                <div>
                  <label className="text-sm text-indigo-700">Sparen & Schulden (%)</label>
                  <input
                    type="number"
                    value={sparenProzent}
                    onChange={(e) => setSparenProzent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                {prozentSumme !== 100 && (
                  <p className={`text-sm font-medium ${prozentSumme > 100 ? 'text-red-600' : 'text-amber-600'}`}>
                    ⚠️ Summe: {prozentSumme}% (sollte 100% ergeben)
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleBerechnen}
            disabled={customMode && prozentSumme !== 100}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📊 Budget berechnen
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
              Ihre Budgetaufteilung
            </h2>

            {/* Großes Einkommen */}
            <div className="text-center mb-6">
              <div className="text-gray-500 text-sm mb-1">Monatliches Nettoeinkommen</div>
              <div className="text-3xl font-bold text-gray-800">{formatCurrency(nettoeinkommen)}</div>
            </div>

            {/* Visuelle Balken */}
            <div className="relative h-12 rounded-xl overflow-hidden mb-6 flex">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center"
                style={{ width: `${ergebnis.beduerfnisseProzent}%` }}
              >
                <span className="text-white text-xs font-bold">{ergebnis.beduerfnisseProzent}%</span>
              </div>
              <div
                className="bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center"
                style={{ width: `${ergebnis.wuenscheProzent}%` }}
              >
                <span className="text-white text-xs font-bold">{ergebnis.wuenscheProzent}%</span>
              </div>
              <div
                className="bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center"
                style={{ width: `${ergebnis.sparenProzent}%` }}
              >
                <span className="text-white text-xs font-bold">{ergebnis.sparenProzent}%</span>
              </div>
            </div>

            {/* Drei Karten */}
            <div className="grid gap-4">
              {/* Grundbedürfnisse */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏠</span>
                    <div>
                      <div className="font-bold text-blue-800">Grundbedürfnisse</div>
                      <div className="text-xs text-blue-600">{ergebnis.beduerfnisseProzent}% – Miete, Lebensmittel, Versicherungen</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-700">{formatCurrency(ergebnis.beduerfnisse)}</div>
                    <div className="text-xs text-blue-500">pro Monat</div>
                  </div>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${ergebnis.beduerfnisseProzent}%` }}></div>
                </div>
              </div>

              {/* Wünsche */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <div className="font-bold text-purple-800">Wünsche</div>
                      <div className="text-xs text-purple-600">{ergebnis.wuenscheProzent}% – Freizeit, Hobbys, Essen gehen</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-700">{formatCurrency(ergebnis.wuensche)}</div>
                    <div className="text-xs text-purple-500">pro Monat</div>
                  </div>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${ergebnis.wuenscheProzent}%` }}></div>
                </div>
              </div>

              {/* Sparen & Schulden */}
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <div>
                      <div className="font-bold text-green-800">Sparen & Schulden</div>
                      <div className="text-xs text-green-600">{ergebnis.sparenProzent}% – Notgroschen, Investitionen, Tilgung</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-700">{formatCurrency(ergebnis.sparen)}</div>
                    <div className="text-xs text-green-500">pro Monat</div>
                  </div>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${ergebnis.sparenProzent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Jahresübersicht */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📅</span>
              Jahresübersicht
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">🏠 Grundbedürfnisse / Jahr</span>
                <span className="font-medium text-blue-700">{formatCurrency(ergebnis.jahresBeduerfnisse)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">🎉 Wünsche / Jahr</span>
                <span className="font-medium text-purple-700">{formatCurrency(ergebnis.jahresWuensche)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-50 -mx-2 px-4 rounded-lg">
                <span className="font-bold text-green-800">💰 Sparen / Jahr</span>
                <span className="font-bold text-green-800 text-xl">{formatCurrency(ergebnis.jahresSparen)}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <strong>💡 Tipp:</strong> Bei {formatCurrency(ergebnis.sparen)} monatlichem Sparen haben Sie in 5 Jahren {formatCurrency(ergebnis.sparen * 60)} angespart – ohne Zinsen! Mit einem ETF-Sparplan (Ø 7% p.a.) könnten es ca. {formatCurrency(ergebnis.sparen * 60 * 1.19)} sein.
            </div>
          </div>

          {/* Beispiel-Aufschlüsselung */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Beispiel-Aufteilung
            </h2>

            <div className="space-y-4">
              {/* Grundbedürfnisse Details */}
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">🏠 Grundbedürfnisse ({formatCurrency(ergebnis.beduerfnisse)})</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded">Warmmiete: ~{formatCurrency(ergebnis.beduerfnisse * 0.55)}</div>
                  <div className="p-2 bg-gray-50 rounded">Lebensmittel: ~{formatCurrency(ergebnis.beduerfnisse * 0.25)}</div>
                  <div className="p-2 bg-gray-50 rounded">Versicherungen: ~{formatCurrency(ergebnis.beduerfnisse * 0.10)}</div>
                  <div className="p-2 bg-gray-50 rounded">Transport: ~{formatCurrency(ergebnis.beduerfnisse * 0.10)}</div>
                </div>
              </div>

              {/* Wünsche Details */}
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">🎉 Wünsche ({formatCurrency(ergebnis.wuensche)})</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded">Freizeit: ~{formatCurrency(ergebnis.wuensche * 0.30)}</div>
                  <div className="p-2 bg-gray-50 rounded">Essen gehen: ~{formatCurrency(ergebnis.wuensche * 0.25)}</div>
                  <div className="p-2 bg-gray-50 rounded">Shopping: ~{formatCurrency(ergebnis.wuensche * 0.25)}</div>
                  <div className="p-2 bg-gray-50 rounded">Hobbys: ~{formatCurrency(ergebnis.wuensche * 0.20)}</div>
                </div>
              </div>

              {/* Sparen Details */}
              <div>
                <h3 className="font-semibold text-green-800 mb-2">💰 Sparen & Schulden ({formatCurrency(ergebnis.sparen)})</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded">Notgroschen: ~{formatCurrency(ergebnis.sparen * 0.30)}</div>
                  <div className="p-2 bg-gray-50 rounded">ETF-Sparplan: ~{formatCurrency(ergebnis.sparen * 0.40)}</div>
                  <div className="p-2 bg-gray-50 rounded">Altersvorsorge: ~{formatCurrency(ergebnis.sparen * 0.20)}</div>
                  <div className="p-2 bg-gray-50 rounded">Tilgung: ~{formatCurrency(ergebnis.sparen * 0.10)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Vergleichstabelle */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Vergleich: Verschiedene Einkommen
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Netto</th>
                    <th className="text-right py-2 px-2">Bedürfnisse</th>
                    <th className="text-right py-2 px-2">Wünsche</th>
                    <th className="text-right py-2 px-2">Sparen</th>
                  </tr>
                </thead>
                <tbody>
                  {[1500, 2000, 2500, 3000, 3500, 4000, 5000].map((eink) => {
                    const istAktuell = eink === nettoeinkommen;
                    const bP = customMode ? beduerfnisseProzent : 50;
                    const wP = customMode ? wuenscheProzent : 30;
                    const sP = customMode ? sparenProzent : 20;
                    return (
                      <tr
                        key={eink}
                        className={`border-b border-gray-100 ${istAktuell ? 'bg-blue-50' : ''}`}
                      >
                        <td className="py-2 px-2">
                          <span className={`font-medium ${istAktuell ? 'text-blue-700' : ''}`}>
                            {formatCurrency(eink)}
                            {istAktuell && <span className="ml-1 text-xs text-blue-500">← Sie</span>}
                          </span>
                        </td>
                        <td className="text-right py-2 px-2 text-blue-600">{formatCurrency(eink * bP / 100)}</td>
                        <td className="text-right py-2 px-2 text-purple-600">{formatCurrency(eink * wP / 100)}</td>
                        <td className="text-right py-2 px-2 text-green-600 font-medium">{formatCurrency(eink * sP / 100)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tipps */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Budget-Tipps für Deutschland
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">🏠</span>
                <p className="text-blue-800">
                  <strong>Mietregel:</strong> Die Warmmiete sollte max. 30-33% des Nettoeinkommens betragen. Bei {formatCurrency(nettoeinkommen)} wären das max. {formatCurrency(nettoeinkommen * 0.33)}.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-xl">🏦</span>
                <p className="text-green-800">
                  <strong>Notgroschen:</strong> 3-6 Netto-Monatsgehälter auf einem Tagesgeldkonto anlegen. Für Sie: {formatCurrency(nettoeinkommen * 3)} bis {formatCurrency(nettoeinkommen * 6)}.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-xl">📊</span>
                <p className="text-purple-800">
                  <strong>ETF-Sparplan:</strong> Langfristig in günstige ETFs investieren (z.B. MSCI World). Viele Neobroker bieten kostenlose Sparpläne ab 1 € an.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="text-xl">📱</span>
                <p className="text-amber-800">
                  <strong>Haushaltsbuch:</strong> Nutzen Sie Apps wie Finanzguru, MoneyMoney oder ein einfaches Excel-Sheet. Die Verbraucherzentrale bietet kostenlose Vorlagen an.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                <span className="text-xl">🎯</span>
                <p className="text-indigo-800">
                  <strong>Arbeitnehmersparzulage:</strong> Nutzen Sie vermögenswirksame Leistungen (VL) – bis zu 40 € monatlich vom Arbeitgeber geschenkt!
                </p>
              </div>
            </div>
          <RechnerFeedback rechnerName="Budget-Rechner" rechnerSlug="budget-rechner" />
      </div>
        </>
      )}
    </div>
  );
}
