import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

interface HundesteuerDaten {
  stadt: string;
  ersterhund: number;
  zweiterhund: number;
  listenhund: number;
}

const HUNDESTEUER_DATEN: HundesteuerDaten[] = [
  { stadt: 'Berlin', ersterhund: 120, zweiterhund: 180, listenhund: 600 },
  { stadt: 'Hamburg', ersterhund: 90, zweiterhund: 90, listenhund: 600 },
  { stadt: 'München', ersterhund: 100, zweiterhund: 100, listenhund: 800 },
  { stadt: 'Köln', ersterhund: 156, zweiterhund: 156, listenhund: 912 },
  { stadt: 'Frankfurt am Main', ersterhund: 102, zweiterhund: 180, listenhund: 900 },
  { stadt: 'Stuttgart', ersterhund: 108, zweiterhund: 216, listenhund: 612 },
  { stadt: 'Düsseldorf', ersterhund: 96, zweiterhund: 150, listenhund: 600 },
  { stadt: 'Leipzig', ersterhund: 96, zweiterhund: 96, listenhund: 696 },
  { stadt: 'Dortmund', ersterhund: 156, zweiterhund: 156, listenhund: 612 },
  { stadt: 'Essen', ersterhund: 156, zweiterhund: 156, listenhund: 852 },
  { stadt: 'Bremen', ersterhund: 150, zweiterhund: 150, listenhund: 600 },
  { stadt: 'Dresden', ersterhund: 108, zweiterhund: 108, listenhund: 504 },
  { stadt: 'Hannover', ersterhund: 132, zweiterhund: 192, listenhund: 660 },
  { stadt: 'Nürnberg', ersterhund: 132, zweiterhund: 132, listenhund: 800 },
  { stadt: 'Duisburg', ersterhund: 156, zweiterhund: 156, listenhund: 852 },
  { stadt: 'Bochum', ersterhund: 156, zweiterhund: 156, listenhund: 852 },
  { stadt: 'Wuppertal', ersterhund: 156, zweiterhund: 156, listenhund: 852 },
  { stadt: 'Bielefeld', ersterhund: 132, zweiterhund: 180, listenhund: 600 },
  { stadt: 'Bonn', ersterhund: 180, zweiterhund: 252, listenhund: 1.080 },
  { stadt: 'Münster', ersterhund: 132, zweiterhund: 192, listenhund: 660 },
  { stadt: 'Mannheim', ersterhund: 120, zweiterhund: 120, listenhund: 720 },
  { stadt: 'Karlsruhe', ersterhund: 120, zweiterhund: 120, listenhund: 720 },
  { stadt: 'Augsburg', ersterhund: 84, zweiterhund: 84, listenhund: 420 },
  { stadt: 'Wiesbaden', ersterhund: 102, zweiterhund: 180, listenhund: 900 },
  { stadt: 'Aachen', ersterhund: 132, zweiterhund: 156, listenhund: 660 },
  { stadt: 'Braunschweig', ersterhund: 132, zweiterhund: 192, listenhund: 660 },
  { stadt: 'Kiel', ersterhund: 132, zweiterhund: 162, listenhund: 660 },
  { stadt: 'Freiburg im Breisgau', ersterhund: 120, zweiterhund: 120, listenhund: 720 },
  { stadt: 'Lübeck', ersterhund: 126, zweiterhund: 150, listenhund: 630 },
  { stadt: 'Rostock', ersterhund: 108, zweiterhund: 144, listenhund: 540 },
  { stadt: 'Mainz', ersterhund: 186, zweiterhund: 186, listenhund: 930 },
  { stadt: 'Potsdam', ersterhund: 108, zweiterhund: 144, listenhund: 540 },
  { stadt: 'Saarbrücken', ersterhund: 120, zweiterhund: 192, listenhund: 600 },
].sort((a, b) => a.stadt.localeCompare(b.stadt, 'de'));

type HundeTyp = 'ersterhund' | 'zweiterhund' | 'listenhund';

export default function HundesteuerRechner() {
  const [stadtIndex, setStadtIndex] = useState<number>(0);
  const [hundeTyp, setHundeTyp] = useState<HundeTyp>('ersterhund');

  const ergebnis = useMemo(() => {
    const daten = HUNDESTEUER_DATEN[stadtIndex];
    if (!daten) return null;

    const jaehrlich = daten[hundeTyp];
    const monatlich = jaehrlich / 12;

    return {
      stadt: daten.stadt,
      jaehrlich,
      monatlich,
      ersterhund: daten.ersterhund,
      zweiterhund: daten.zweiterhund,
      listenhund: daten.listenhund,
    };
  }, [stadtIndex, hundeTyp]);

  const formatCurrency = (n: number) =>
    n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  const hundeTypLabels: Record<HundeTyp, string> = {
    ersterhund: 'Erster Hund',
    zweiterhund: 'Zweiter Hund',
    listenhund: 'Listenhund (Kampfhund)',
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">🐕</span>
          Hundesteuer berechnen
        </h2>

        <div className="space-y-6">
          {/* Stadt auswählen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stadt / Gemeinde
            </label>
            <select
              value={stadtIndex}
              onChange={(e) => setStadtIndex(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg bg-white"
            >
              {HUNDESTEUER_DATEN.map((d, i) => (
                <option key={d.stadt} value={i}>
                  {d.stadt}
                </option>
              ))}
            </select>
          </div>

          {/* Hundetyp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Hundekategorie
            </label>
            <div className="grid gap-3">
              {(Object.entries(hundeTypLabels) as [HundeTyp, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setHundeTyp(key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    hundeTyp === key
                      ? key === 'listenhund'
                        ? 'border-red-500 bg-red-50 text-red-800'
                        : 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-gray-200 hover:border-amber-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {key === 'ersterhund' ? '🐕' : key === 'zweiterhund' ? '🐕‍🦺' : '⚠️'}
                    </span>
                    <div>
                      <div className="font-semibold">{label}</div>
                      <div className="text-sm opacity-75">
                        {key === 'ersterhund' && 'Regulärer Steuersatz für den ersten Hund'}
                        {key === 'zweiterhund' && 'Steuersatz für jeden weiteren Hund'}
                        {key === 'listenhund' && 'Erhöhter Steuersatz für als gefährlich eingestufte Rassen'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {ergebnis && (
        <>
          {/* Haupt-Ergebnis */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Hundesteuer in {ergebnis.stadt}
            </h2>

            <div className="text-center mb-6">
              <div className="text-gray-500 text-sm mb-1">Jährliche Hundesteuer</div>
              <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <div className="text-4xl font-bold">{formatCurrency(ergebnis.jaehrlich)}</div>
                <div className="text-amber-100 text-sm mt-1">pro Jahr</div>
              </div>
              <div className="mt-4 flex justify-center items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {formatCurrency(ergebnis.monatlich)}
                  </div>
                  <div className="text-sm text-gray-500">pro Monat</div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {formatCurrency(ergebnis.jaehrlich / 4)}
                  </div>
                  <div className="text-sm text-gray-500">pro Quartal</div>
                </div>
              </div>
            </div>

            {/* Details-Tabelle */}
            <div className="space-y-3">
              <div className={`flex justify-between items-center py-2 border-b border-gray-100 ${hundeTyp === 'ersterhund' ? 'bg-amber-50 -mx-2 px-4 rounded-lg font-bold' : ''}`}>
                <span className="text-gray-600 flex items-center gap-2">
                  🐕 Erster Hund
                  {hundeTyp === 'ersterhund' && <span className="text-xs text-amber-600">← Ihre Auswahl</span>}
                </span>
                <span className="font-medium text-gray-800">{formatCurrency(ergebnis.ersterhund)} / Jahr</span>
              </div>
              <div className={`flex justify-between items-center py-2 border-b border-gray-100 ${hundeTyp === 'zweiterhund' ? 'bg-amber-50 -mx-2 px-4 rounded-lg font-bold' : ''}`}>
                <span className="text-gray-600 flex items-center gap-2">
                  🐕‍🦺 Zweiter Hund
                  {hundeTyp === 'zweiterhund' && <span className="text-xs text-amber-600">← Ihre Auswahl</span>}
                </span>
                <span className="font-medium text-gray-800">{formatCurrency(ergebnis.zweiterhund)} / Jahr</span>
              </div>
              <div className={`flex justify-between items-center py-2 border-b border-gray-100 ${hundeTyp === 'listenhund' ? 'bg-red-50 -mx-2 px-4 rounded-lg font-bold' : ''}`}>
                <span className="text-gray-600 flex items-center gap-2">
                  ⚠️ Listenhund
                  {hundeTyp === 'listenhund' && <span className="text-xs text-red-600">← Ihre Auswahl</span>}
                </span>
                <span className="font-medium text-gray-800">{formatCurrency(ergebnis.listenhund)} / Jahr</span>
              </div>
            </div>
          </div>

          {/* Hinweis */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm text-amber-800 font-medium mb-1">Hinweis zu den Steuersätzen</p>
                <p className="text-sm text-amber-700">
                  Die angegebenen Beträge entsprechen dem Stand 2025/2026 und können sich durch Satzungsänderungen 
                  der Gemeinde jederzeit ändern. Bitte verifizieren Sie die aktuelle Höhe bei Ihrem 
                  zuständigen <strong>Ordnungsamt</strong> oder der <strong>Stadtverwaltung</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Vergleichstabelle Top-Städte */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Vergleich: Hundesteuer in deutschen Großstädten
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Stadt</th>
                    <th className="text-right py-2 px-2">1. Hund</th>
                    <th className="text-right py-2 px-2">2. Hund</th>
                    <th className="text-right py-2 px-2">Listenhund</th>
                  </tr>
                </thead>
                <tbody>
                  {HUNDESTEUER_DATEN.slice(0, 10).map((d) => {
                    const istAktuell = d.stadt === ergebnis.stadt;
                    return (
                      <tr
                        key={d.stadt}
                        className={`border-b border-gray-100 ${istAktuell ? 'bg-amber-50' : ''}`}
                      >
                        <td className="py-2 px-2">
                          <span className={`font-medium ${istAktuell ? 'text-amber-700' : ''}`}>
                            {d.stadt}
                            {istAktuell && <span className="ml-1 text-xs text-amber-500">✓</span>}
                          </span>
                        </td>
                        <td className="text-right py-2 px-2">{formatCurrency(d.ersterhund)}</td>
                        <td className="text-right py-2 px-2">{formatCurrency(d.zweiterhund)}</td>
                        <td className="text-right py-2 px-2 text-red-600">{formatCurrency(d.listenhund)}</td>
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
              Tipps zur Hundesteuer
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-xl">✅</span>
                <p className="text-green-800">
                  <strong>Rechtzeitig anmelden:</strong> Melden Sie Ihren Hund innerhalb von 2 Wochen nach 
                  Anschaffung beim Ordnungsamt an. Die Hundesteuermarke muss der Hund im öffentlichen Raum tragen.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">🏅</span>
                <p className="text-blue-800">
                  <strong>Befreiungen möglich:</strong> Blindenhunde, Rettungshunde, Therapiehunde und 
                  Diensthunde sind in vielen Gemeinden von der Steuer befreit. Informieren Sie sich bei Ihrer 
                  Gemeinde über mögliche Ermäßigungen.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-xl">📋</span>
                <p className="text-purple-800">
                  <strong>Tierheimhunde:</strong> Viele Gemeinden gewähren im ersten Jahr eine Befreiung oder 
                  Ermäßigung für Hunde aus dem Tierheim.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <span className="text-xl">⚠️</span>
                <p className="text-red-800">
                  <strong>Nicht-Anmeldung ist teuer:</strong> Wer seinen Hund nicht anmeldet, riskiert 
                  ein Bußgeld von bis zu 10.000 € sowie die Nachzahlung der Steuer.
                </p>
              </div>
            </div>
          <RechnerFeedback rechnerName="Hundesteuer-Rechner" rechnerSlug="hundesteuer-rechner" />
      </div>
        </>
      )}
    </div>
  );
}
