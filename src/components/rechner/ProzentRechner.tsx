import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

type Modus = 'prozentwert' | 'prozentsatz' | 'veraenderung';

const MODI = [
  {
    id: 'prozentwert' as const,
    icon: '🎯',
    title: 'Prozentwert berechnen',
    subtitle: 'X% von Y = ?',
    beispiel: '15% von 200 = 30'
  },
  {
    id: 'prozentsatz' as const,
    icon: '📊',
    title: 'Prozentsatz berechnen',
    subtitle: 'X ist wieviel % von Y?',
    beispiel: '30 ist 15% von 200'
  },
  {
    id: 'veraenderung' as const,
    icon: '📈',
    title: 'Prozentuale Veränderung',
    subtitle: 'Von X auf Y = wieviel %?',
    beispiel: 'Von 100 auf 120 = +20%'
  }
];

export default function ProzentRechner() {
  const [modus, setModus] = useState<Modus>('prozentwert');
  
  // Prozentwert: X% von Y
  const [prozent, setProzent] = useState(15);
  const [grundwert, setGrundwert] = useState(200);
  
  // Prozentsatz: X ist wieviel % von Y
  const [teil, setTeil] = useState(30);
  const [ganzes, setGanzes] = useState(200);
  
  // Veränderung: Von X auf Y
  const [alterWert, setAlterWert] = useState(100);
  const [neuerWert, setNeuerWert] = useState(120);

  const ergebnis = useMemo(() => {
    if (modus === 'prozentwert') {
      // Prozentwert = (Prozentsatz / 100) × Grundwert
      const prozentwert = (prozent / 100) * grundwert;
      return {
        prozentwert,
        formel: `${prozent}% von ${grundwert} = ${prozentwert.toLocaleString('de-DE', { maximumFractionDigits: 4 })}`
      };
    } else if (modus === 'prozentsatz') {
      // Prozentsatz = (Teil / Ganzes) × 100
      if (ganzes === 0) return { prozentsatz: 0, formel: 'Division durch 0 nicht möglich' };
      const prozentsatz = (teil / ganzes) * 100;
      return {
        prozentsatz,
        formel: `${teil} ist ${prozentsatz.toLocaleString('de-DE', { maximumFractionDigits: 4 })}% von ${ganzes}`
      };
    } else {
      // Prozentuale Veränderung = ((Neuer Wert - Alter Wert) / Alter Wert) × 100
      if (alterWert === 0) return { veraenderung: 0, formel: 'Division durch 0 nicht möglich' };
      const differenz = neuerWert - alterWert;
      const veraenderung = (differenz / alterWert) * 100;
      const vorzeichen = veraenderung >= 0 ? '+' : '';
      return {
        veraenderung,
        differenz,
        formel: `Von ${alterWert} auf ${neuerWert} = ${vorzeichen}${veraenderung.toLocaleString('de-DE', { maximumFractionDigits: 4 })}%`
      };
    }
  }, [modus, prozent, grundwert, teil, ganzes, alterWert, neuerWert]);

  const formatNumber = (n: number, decimals = 2) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Prozent-Rechner" rechnerSlug="prozent-rechner" />

{/* Modus Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-gray-700 font-medium mb-3">Was möchtest du berechnen?</label>
        <div className="space-y-3">
          {MODI.map((m) => (
            <button
              key={m.id}
              onClick={() => setModus(m.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                modus === m.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.icon}</span>
                <div className="flex-1">
                  <div className={`font-semibold ${modus === m.id ? 'text-blue-700' : 'text-gray-800'}`}>
                    {m.title}
                  </div>
                  <div className="text-sm text-gray-500">{m.subtitle}</div>
                  <div className="text-xs text-gray-400 mt-1">Beispiel: {m.beispiel}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  modus === m.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {modus === m.id && (
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

      {/* Eingabefelder je nach Modus */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Werte eingeben</h3>
        
        {modus === 'prozentwert' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 items-end">
              <label className="col-span-1">
                <span className="text-sm text-gray-600 block mb-1">Prozentsatz</span>
                <div className="relative">
                  <input
                    type="number"
                    value={prozent}
                    onChange={(e) => setProzent(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    step="0.01"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
              </label>
              <div className="text-center text-2xl text-gray-400 pb-3">von</div>
              <label className="col-span-1">
                <span className="text-sm text-gray-600 block mb-1">Grundwert</span>
                <input
                  type="number"
                  value={grundwert}
                  onChange={(e) => setGrundwert(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  step="0.01"
                />
              </label>
            </div>
            <div className="text-center text-gray-500 text-sm">
              {prozent}% von {grundwert} = ?
            </div>
          </div>
        )}

        {modus === 'prozentsatz' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 items-end">
              <label className="col-span-1">
                <span className="text-sm text-gray-600 block mb-1">Teil/Anteil</span>
                <input
                  type="number"
                  value={teil}
                  onChange={(e) => setTeil(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  step="0.01"
                />
              </label>
              <div className="text-center text-2xl text-gray-400 pb-3">ist ? % von</div>
              <label className="col-span-1">
                <span className="text-sm text-gray-600 block mb-1">Gesamtwert</span>
                <input
                  type="number"
                  value={ganzes}
                  onChange={(e) => setGanzes(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  step="0.01"
                />
              </label>
            </div>
            <div className="text-center text-gray-500 text-sm">
              {teil} ist wieviel % von {ganzes}?
            </div>
          </div>
        )}

        {modus === 'veraenderung' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 items-end">
              <label className="col-span-1">
                <span className="text-sm text-gray-600 block mb-1">Alter Wert</span>
                <input
                  type="number"
                  value={alterWert}
                  onChange={(e) => setAlterWert(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  step="0.01"
                />
              </label>
              <div className="text-center text-2xl text-gray-400 pb-3">→</div>
              <label className="col-span-1">
                <span className="text-sm text-gray-600 block mb-1">Neuer Wert</span>
                <input
                  type="number"
                  value={neuerWert}
                  onChange={(e) => setNeuerWert(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  step="0.01"
                />
              </label>
            </div>
            <div className="text-center text-gray-500 text-sm">
              Von {alterWert} auf {neuerWert} = wieviel %?
            </div>
          </div>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-blue-100 mb-2">Ergebnis</h3>
        
        {modus === 'prozentwert' && (
          <>
            <div className="text-4xl font-bold mb-3">
              {formatNumber(ergebnis.prozentwert || 0)}
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Prozentsatz</span>
                <span className="font-semibold">{prozent}%</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Grundwert</span>
                <span className="font-semibold">{formatNumber(grundwert)}</span>
              </div>
              <div className="border-t border-white/20 pt-2 flex justify-between items-center">
                <span className="text-blue-100 font-medium">= Prozentwert</span>
                <span className="text-xl font-bold">{formatNumber(ergebnis.prozentwert || 0)}</span>
              </div>
            </div>
          </>
        )}

        {modus === 'prozentsatz' && (
          <>
            <div className="text-4xl font-bold mb-3">
              {formatNumber(ergebnis.prozentsatz || 0)} %
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Teil/Anteil</span>
                <span className="font-semibold">{formatNumber(teil)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Gesamtwert</span>
                <span className="font-semibold">{formatNumber(ganzes)}</span>
              </div>
              <div className="border-t border-white/20 pt-2 flex justify-between items-center">
                <span className="text-blue-100 font-medium">= Prozentsatz</span>
                <span className="text-xl font-bold">{formatNumber(ergebnis.prozentsatz || 0)}%</span>
              </div>
            </div>
          </>
        )}

        {modus === 'veraenderung' && (
          <>
            <div className={`text-4xl font-bold mb-3 ${(ergebnis.veraenderung || 0) >= 0 ? '' : 'text-red-200'}`}>
              {(ergebnis.veraenderung || 0) >= 0 ? '+' : ''}{formatNumber(ergebnis.veraenderung || 0)} %
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Alter Wert</span>
                <span className="font-semibold">{formatNumber(alterWert)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Neuer Wert</span>
                <span className="font-semibold">{formatNumber(neuerWert)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Differenz</span>
                <span className="font-semibold">
                  {(ergebnis.differenz || 0) >= 0 ? '+' : ''}{formatNumber(ergebnis.differenz || 0)}
                </span>
              </div>
              <div className="border-t border-white/20 pt-2 flex justify-between items-center">
                <span className="text-blue-100 font-medium">= Veränderung</span>
                <span className="text-xl font-bold">
                  {(ergebnis.veraenderung || 0) >= 0 ? '+' : ''}{formatNumber(ergebnis.veraenderung || 0)}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>
{/* Formel-Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Verwendete Formel</h3>
        <div className="space-y-4 text-sm">
          {modus === 'prozentwert' && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="font-semibold text-blue-800 mb-2">Prozentwert berechnen:</p>
              <code className="block bg-blue-100 p-3 rounded text-blue-900 font-mono text-sm">
                Prozentwert = Grundwert × (Prozentsatz ÷ 100)
              </code>
              <p className="mt-3 text-blue-700">
                <strong>Beispiel:</strong> {grundwert} × ({prozent} ÷ 100) = {formatNumber(ergebnis.prozentwert || 0)}
              </p>
            </div>
          )}
          {modus === 'prozentsatz' && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="font-semibold text-blue-800 mb-2">Prozentsatz berechnen:</p>
              <code className="block bg-blue-100 p-3 rounded text-blue-900 font-mono text-sm">
                Prozentsatz = (Teil ÷ Gesamtwert) × 100
              </code>
              <p className="mt-3 text-blue-700">
                <strong>Beispiel:</strong> ({teil} ÷ {ganzes}) × 100 = {formatNumber(ergebnis.prozentsatz || 0)}%
              </p>
            </div>
          )}
          {modus === 'veraenderung' && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="font-semibold text-blue-800 mb-2">Prozentuale Veränderung berechnen:</p>
              <code className="block bg-blue-100 p-3 rounded text-blue-900 font-mono text-sm">
                Veränderung = ((Neu - Alt) ÷ Alt) × 100
              </code>
              <p className="mt-3 text-blue-700">
                <strong>Beispiel:</strong> (({neuerWert} - {alterWert}) ÷ {alterWert}) × 100 = {(ergebnis.veraenderung || 0) >= 0 ? '+' : ''}{formatNumber(ergebnis.veraenderung || 0)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Erklärungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📚 Grundbegriffe der Prozentrechnung</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="font-semibold text-blue-800 mb-1">Grundwert (G)</p>
            <p className="text-blue-700">
              Der Ausgangswert, von dem aus gerechnet wird. Das "Ganze" oder 100%.
            </p>
            <p className="text-blue-600 text-xs mt-1">Beispiel: Eine Klasse hat 25 Schüler → Grundwert = 25</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="font-semibold text-green-800 mb-1">Prozentwert (W)</p>
            <p className="text-green-700">
              Der Anteil vom Grundwert. Das Ergebnis der Prozentrechnung.
            </p>
            <p className="text-green-600 text-xs mt-1">Beispiel: 20% der 25 Schüler = 5 Schüler → Prozentwert = 5</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl">
            <p className="font-semibold text-yellow-800 mb-1">Prozentsatz (p)</p>
            <p className="text-yellow-700">
              Der Anteil in Prozent ausgedrückt (mit %-Zeichen).
            </p>
            <p className="text-yellow-600 text-xs mt-1">Beispiel: 5 von 25 Schülern = 20% → Prozentsatz = 20%</p>
          </div>
        </div>
      </div>

      {/* Schnellrechner */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚡ Häufige Prozente auf einen Blick</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Prozent</th>
                <th className="text-right py-2 text-gray-600">als Bruch</th>
                <th className="text-right py-2 text-gray-600">als Dezimalzahl</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { p: 10, bruch: '1/10', dez: '0,10' },
                { p: 20, bruch: '1/5', dez: '0,20' },
                { p: 25, bruch: '1/4', dez: '0,25' },
                { p: 33.33, bruch: '1/3', dez: '0,33' },
                { p: 50, bruch: '1/2', dez: '0,50' },
                { p: 75, bruch: '3/4', dez: '0,75' },
                { p: 100, bruch: '1/1', dez: '1,00' },
              ].map((row) => (
                <tr key={row.p} className="hover:bg-gray-50">
                  <td className="py-2 font-medium">{row.p}%</td>
                  <td className="py-2 text-right text-gray-600">{row.bruch}</td>
                  <td className="py-2 text-right font-semibold text-blue-600">{row.dez}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Praktische Beispiele */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💡 Praktische Anwendungen</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🛒</span>
            <div>
              <p className="font-medium text-green-800">Rabatte berechnen</p>
              <p className="text-green-700">Artikel kostet 80 € mit 20% Rabatt: 80 × 0,20 = 16 € Ersparnis → Endpreis: 64 €</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">💰</span>
            <div>
              <p className="font-medium text-blue-800">Trinkgeld berechnen</p>
              <p className="text-blue-700">Rechnung 45 € mit 10% Trinkgeld: 45 × 0,10 = 4,50 € Trinkgeld</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">📈</span>
            <div>
              <p className="font-medium text-yellow-800">Zinsen verstehen</p>
              <p className="text-yellow-700">1.000 € mit 3% Zinsen p.a.: 1.000 × 0,03 = 30 € Zinsen pro Jahr</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">📊</span>
            <div>
              <p className="font-medium text-purple-800">Preisänderungen</p>
              <p className="text-purple-700">Miete steigt von 800 € auf 850 €: (50 ÷ 800) × 100 = 6,25% Erhöhung</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-red-50 rounded-xl">
            <span className="text-xl">🎓</span>
            <div>
              <p className="font-medium text-red-800">Noten & Tests</p>
              <p className="text-red-700">42 von 50 Punkten: (42 ÷ 50) × 100 = 84% richtig</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kopfrechnen-Tipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧠 Tipps fürs Kopfrechnen</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">10% berechnen:</p>
            <p>Einfach Komma um eine Stelle verschieben. 10% von 250 = 25</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">5% berechnen:</p>
            <p>10% ausrechnen und halbieren. 5% von 250 = 12,50</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">25% berechnen:</p>
            <p>Durch 4 teilen. 25% von 200 = 50</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">1% berechnen:</p>
            <p>Durch 100 teilen. 1% von 250 = 2,50</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">Komplexe Prozente:</p>
            <p>15% = 10% + 5%, also 15% von 200 = 20 + 10 = 30</p>
          </div>
        </div>
      </div>
{/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Nützliche Ressourcen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.mathematik.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Mathematiker-Vereinigung
          </a>
          <a 
            href="https://www.frustfrei-lernen.de/mathematik/prozentrechnung.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Frustfrei-Lernen – Prozentrechnung
          </a>
        </div>
      </div>
    </div>
  );
}
