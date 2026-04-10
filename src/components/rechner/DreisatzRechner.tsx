import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

type Proportionalitaet = 'direkt' | 'indirekt';

const PROPORTIONALITAETEN = [
  {
    id: 'direkt' as const,
    icon: '📈',
    title: 'Direkter Dreisatz',
    subtitle: 'Je mehr, desto mehr',
    beispiel: '3 Äpfel kosten 6€ → 5 Äpfel kosten ?€',
    erklaerung: 'Beide Größen ändern sich in dieselbe Richtung'
  },
  {
    id: 'indirekt' as const,
    icon: '📉',
    title: 'Indirekter Dreisatz',
    subtitle: 'Je mehr, desto weniger',
    beispiel: '4 Arbeiter brauchen 6 Tage → 8 Arbeiter brauchen ?',
    erklaerung: 'Die Größen ändern sich gegenläufig'
  }
];

export default function DreisatzRechner() {
  const [proportionalitaet, setProportionalitaet] = useState<Proportionalitaet>('direkt');
  
  // Bekannte Werte
  const [mengeA, setMengeA] = useState(3);
  const [wertA, setWertA] = useState(6);
  
  // Gesuchter Wert
  const [mengeB, setMengeB] = useState(5);
  
  // Einheiten (optional)
  const [einheitMenge, setEinheitMenge] = useState('Stück');
  const [einheitWert, setEinheitWert] = useState('€');

  const ergebnis = useMemo(() => {
    if (mengeA === 0) {
      return {
        wertB: 0,
        fehler: 'Division durch 0 nicht möglich',
        schritte: []
      };
    }

    let wertB: number;
    let schritte: { text: string; rechnung: string; ergebnis?: string }[] = [];

    if (proportionalitaet === 'direkt') {
      // Direkter Dreisatz: wertB = (wertA / mengeA) * mengeB
      const wertProEinheit = wertA / mengeA;
      wertB = wertProEinheit * mengeB;
      
      schritte = [
        {
          text: '1. Gegeben:',
          rechnung: `${mengeA} ${einheitMenge} entsprechen ${wertA} ${einheitWert}`
        },
        {
          text: '2. Berechne den Wert für 1 Einheit:',
          rechnung: `${wertA} ${einheitWert} ÷ ${mengeA} ${einheitMenge}`,
          ergebnis: `= ${wertProEinheit.toLocaleString('de-DE', { maximumFractionDigits: 4 })} ${einheitWert} pro ${einheitMenge}`
        },
        {
          text: `3. Multipliziere mit der gesuchten Menge (${mengeB}):`,
          rechnung: `${wertProEinheit.toLocaleString('de-DE', { maximumFractionDigits: 4 })} ${einheitWert} × ${mengeB}`,
          ergebnis: `= ${wertB.toLocaleString('de-DE', { maximumFractionDigits: 4 })} ${einheitWert}`
        }
      ];
    } else {
      // Indirekter Dreisatz: wertB = (mengeA * wertA) / mengeB
      if (mengeB === 0) {
        return {
          wertB: 0,
          fehler: 'Division durch 0 nicht möglich',
          schritte: []
        };
      }
      
      const produkt = mengeA * wertA;
      wertB = produkt / mengeB;
      
      schritte = [
        {
          text: '1. Gegeben:',
          rechnung: `${mengeA} ${einheitMenge} benötigen ${wertA} ${einheitWert}`
        },
        {
          text: '2. Berechne das Gesamtprodukt (konstante Größe):',
          rechnung: `${mengeA} × ${wertA}`,
          ergebnis: `= ${produkt.toLocaleString('de-DE', { maximumFractionDigits: 4 })}`
        },
        {
          text: `3. Teile durch die neue Menge (${mengeB}):`,
          rechnung: `${produkt.toLocaleString('de-DE', { maximumFractionDigits: 4 })} ÷ ${mengeB}`,
          ergebnis: `= ${wertB.toLocaleString('de-DE', { maximumFractionDigits: 4 })} ${einheitWert}`
        }
      ];
    }

    return {
      wertB,
      fehler: null,
      schritte
    };
  }, [proportionalitaet, mengeA, wertA, mengeB, einheitMenge, einheitWert]);

  const formatNumber = (n: number, decimals = 2) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: decimals });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Dreisatz-Rechner" rechnerSlug="dreisatz-rechner" />

{/* Proportionalität Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-gray-700 font-medium mb-3">Art des Dreisatzes</label>
        <div className="space-y-3">
          {PROPORTIONALITAETEN.map((p) => (
            <button
              key={p.id}
              onClick={() => setProportionalitaet(p.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                proportionalitaet === p.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1">
                  <div className={`font-semibold ${proportionalitaet === p.id ? 'text-blue-700' : 'text-gray-800'}`}>
                    {p.title}
                  </div>
                  <div className="text-sm text-gray-500">{p.subtitle}</div>
                  <div className="text-xs text-gray-400 mt-1">Beispiel: {p.beispiel}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  proportionalitaet === p.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {proportionalitaet === p.id && (
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

      {/* Eingabefelder */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📝 Werte eingeben</h3>
        
        {/* Einheiten */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Einheit Menge</label>
            <input
              type="text"
              value={einheitMenge}
              onChange={(e) => setEinheitMenge(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="z.B. Stück, kg, Arbeiter"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Einheit Wert</label>
            <input
              type="text"
              value={einheitWert}
              onChange={(e) => setEinheitWert(e.target.value)}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="z.B. €, Tage, Stunden"
            />
          </div>
        </div>

        {/* Bekanntes Verhältnis */}
        <div className="p-4 bg-gray-50 rounded-xl mb-4">
          <p className="text-sm font-medium text-gray-600 mb-3">✅ Bekanntes Verhältnis:</p>
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Menge A</label>
              <div className="relative">
                <input
                  type="number"
                  value={mengeA}
                  onChange={(e) => setMengeA(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-3 text-lg font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  step="any"
                />
                <span className="absolute right-2 bottom-1 text-xs text-gray-400">{einheitMenge}</span>
              </div>
            </div>
            <div className="text-center text-2xl text-gray-400 pb-3">
              {proportionalitaet === 'direkt' ? '↔' : '⟷'}
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Wert A</label>
              <div className="relative">
                <input
                  type="number"
                  value={wertA}
                  onChange={(e) => setWertA(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-3 text-lg font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  step="any"
                />
                <span className="absolute right-2 bottom-1 text-xs text-gray-400">{einheitWert}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gesuchter Wert */}
        <div className="p-4 bg-blue-50 rounded-xl">
          <p className="text-sm font-medium text-blue-600 mb-3">❓ Gesucht:</p>
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-xs text-blue-500 block mb-1">Menge B</label>
              <div className="relative">
                <input
                  type="number"
                  value={mengeB}
                  onChange={(e) => setMengeB(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-3 text-lg font-bold text-center border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                  step="any"
                />
                <span className="absolute right-2 bottom-1 text-xs text-blue-400">{einheitMenge}</span>
              </div>
            </div>
            <div className="text-center text-2xl text-blue-400 pb-3">
              {proportionalitaet === 'direkt' ? '↔' : '⟷'}
            </div>
            <div>
              <label className="text-xs text-blue-500 block mb-1">Wert B = ?</label>
              <div className="w-full px-3 py-3 text-lg font-bold text-center border-2 border-blue-300 rounded-xl bg-blue-100 text-blue-700">
                {ergebnis.fehler ? '?' : formatNumber(ergebnis.wertB || 0, 4)}
                <span className="text-xs ml-1 font-normal">{einheitWert}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Darstellung als Satz */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600 text-center">
          <span className="font-medium">Wenn {mengeA} {einheitMenge}</span>
          <span className="mx-1">{proportionalitaet === 'direkt' ? 'entsprechen' : 'benötigen'}</span>
          <span className="font-medium">{wertA} {einheitWert}</span>
          <span className="mx-1">, dann</span>
          <span className="font-medium">{proportionalitaet === 'direkt' ? 'entsprechen' : 'benötigen'} {mengeB} {einheitMenge}</span>
          <span className="mx-1">=</span>
          <span className="font-bold text-blue-600">? {einheitWert}</span>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-blue-100 mb-2">Ergebnis</h3>
        
        {ergebnis.fehler ? (
          <div className="text-2xl font-bold text-red-200">{ergebnis.fehler}</div>
        ) : (
          <>
            <div className="text-4xl font-bold mb-3">
              {formatNumber(ergebnis.wertB || 0, 4)} {einheitWert}
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Bekannt</span>
                <span className="font-semibold">{mengeA} {einheitMenge} → {wertA} {einheitWert}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-100">Gesucht</span>
                <span className="font-semibold">{mengeB} {einheitMenge} → ?</span>
              </div>
              <div className="border-t border-white/20 pt-2 flex justify-between items-center">
                <span className="text-blue-100 font-medium">= Ergebnis</span>
                <span className="text-xl font-bold">{formatNumber(ergebnis.wertB || 0, 4)} {einheitWert}</span>
              </div>
            </div>
          </>
        )}
      </div>
{/* Schritt-für-Schritt Lösung */}
      {!ergebnis.fehler && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📐 Schritt-für-Schritt Lösung</h3>
          
          <div className="space-y-4">
            {ergebnis.schritte.map((schritt, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-xl">
                <p className="font-semibold text-blue-800 mb-2">{schritt.text}</p>
                <code className="block bg-blue-100 p-3 rounded text-blue-900 font-mono text-sm">
                  {schritt.rechnung}
                </code>
                {schritt.ergebnis && (
                  <p className="mt-2 text-blue-700 font-medium">
                    {schritt.ergebnis}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Formel-Box */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">🔢 Verwendete Formel:</p>
            {proportionalitaet === 'direkt' ? (
              <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-sm">
                Wert B = (Wert A ÷ Menge A) × Menge B
              </code>
            ) : (
              <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-sm">
                Wert B = (Menge A × Wert A) ÷ Menge B
              </code>
            )}
          </div>
        </div>
      )}

      {/* Erklärung Proportionalität */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📚 Wann welcher Dreisatz?</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="font-semibold text-green-800 mb-2">📈 Direkter Dreisatz (proportional)</p>
            <p className="text-green-700 text-sm mb-2">
              <strong>Regel:</strong> Je mehr A, desto mehr B. Beide Werte steigen oder fallen gemeinsam.
            </p>
            <div className="text-green-600 text-xs space-y-1">
              <p>• 3 Äpfel kosten 6€ → 6 Äpfel kosten 12€</p>
              <p>• 2 Stunden = 100 km → 4 Stunden = 200 km</p>
              <p>• 5 Liter Farbe für 20 m² → 10 Liter für 40 m²</p>
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="font-semibold text-orange-800 mb-2">📉 Indirekter Dreisatz (antiproportional)</p>
            <p className="text-orange-700 text-sm mb-2">
              <strong>Regel:</strong> Je mehr A, desto weniger B. Ein Wert steigt, der andere fällt.
            </p>
            <div className="text-orange-600 text-xs space-y-1">
              <p>• 4 Arbeiter brauchen 6 Tage → 8 Arbeiter brauchen 3 Tage</p>
              <p>• Mit 60 km/h dauert es 2h → Mit 120 km/h dauert es 1h</p>
              <p>• 3 Pumpen brauchen 8h → 6 Pumpen brauchen 4h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Praktische Beispiele */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💡 Praktische Anwendungen</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🛒</span>
            <div>
              <p className="font-medium text-green-800">Einkaufen</p>
              <p className="text-green-700">5 Brötchen kosten 2,50€ – was kosten 12 Brötchen?</p>
              <p className="text-green-600 text-xs mt-1">→ Direkter Dreisatz: (2,50 ÷ 5) × 12 = 6€</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">🚗</span>
            <div>
              <p className="font-medium text-blue-800">Reisen</p>
              <p className="text-blue-700">300 km brauchen 25 Liter Benzin – wie viel für 450 km?</p>
              <p className="text-blue-600 text-xs mt-1">→ Direkter Dreisatz: (25 ÷ 300) × 450 = 37,5 Liter</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">🏗️</span>
            <div>
              <p className="font-medium text-yellow-800">Arbeit</p>
              <p className="text-yellow-700">6 Arbeiter schaffen ein Projekt in 10 Tagen – wie lange mit 15?</p>
              <p className="text-yellow-600 text-xs mt-1">→ Indirekter Dreisatz: (6 × 10) ÷ 15 = 4 Tage</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">🍳</span>
            <div>
              <p className="font-medium text-purple-800">Kochen</p>
              <p className="text-purple-700">Rezept für 4 Personen braucht 200g Mehl – wie viel für 6?</p>
              <p className="text-purple-600 text-xs mt-1">→ Direkter Dreisatz: (200 ÷ 4) × 6 = 300g</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-red-50 rounded-xl">
            <span className="text-xl">🏊</span>
            <div>
              <p className="font-medium text-red-800">Pool befüllen</p>
              <p className="text-red-700">2 Schläuche brauchen 6 Stunden – wie lange 3 Schläuche?</p>
              <p className="text-red-600 text-xs mt-1">→ Indirekter Dreisatz: (2 × 6) ÷ 3 = 4 Stunden</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧠 Tipps für den Dreisatz</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">1. Frage dich: Verhältnis oder Gegenläufig?</p>
            <p>Wenn mehr von A zu mehr von B führt → Direkter Dreisatz</p>
            <p>Wenn mehr von A zu weniger von B führt → Indirekter Dreisatz</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">2. Schreibe die bekannten Werte untereinander</p>
            <p>A → B (bekannt) | X → ? (gesucht)</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">3. Einheiten beachten</p>
            <p>Gleiche Einheiten müssen zusammenpassen (z.B. € zu €, kg zu kg)</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">4. Ergebnis prüfen</p>
            <p>Ist das Ergebnis logisch? Mehr Ware = höherer Preis, mehr Arbeiter = kürzere Zeit?</p>
          </div>
        </div>
      </div>

      {/* Schnellbeispiele */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚡ Typische Dreisatz-Situationen</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Situation</th>
                <th className="text-center py-2 text-gray-600">Art</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { situation: 'Preis nach Menge', art: 'Direkt', emoji: '💰' },
                { situation: 'Strecke nach Zeit', art: 'Direkt', emoji: '🚗' },
                { situation: 'Verbrauch nach Strecke', art: 'Direkt', emoji: '⛽' },
                { situation: 'Arbeiter → Dauer', art: 'Indirekt', emoji: '👷' },
                { situation: 'Geschwindigkeit → Zeit', art: 'Indirekt', emoji: '⏱️' },
                { situation: 'Wasserhähne → Füllzeit', art: 'Indirekt', emoji: '🚿' },
                { situation: 'Rezeptmengen', art: 'Direkt', emoji: '🍳' },
                { situation: 'Maschinenanzahl → Dauer', art: 'Indirekt', emoji: '🏭' },
              ].map((row) => (
                <tr key={row.situation} className="hover:bg-gray-50">
                  <td className="py-2 font-medium">
                    <span className="mr-2">{row.emoji}</span>
                    {row.situation}
                  </td>
                  <td className={`py-2 text-center font-semibold ${row.art === 'Direkt' ? 'text-green-600' : 'text-orange-600'}`}>
                    {row.art}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            href="https://www.frustfrei-lernen.de/mathematik/dreisatz.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Frustfrei-Lernen – Dreisatz
          </a>
          <a 
            href="https://www.mathe-lexikon.at/arithmetik/verhaeltnisse-proportionen/dreisatz.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Mathe-Lexikon – Dreisatz erklärt
          </a>
        </div>
      </div>
    </div>
  );
}
