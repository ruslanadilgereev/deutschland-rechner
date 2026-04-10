import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Grunderwerbsteuer nach Bundesland (Stand 2024/2025)
interface Bundesland {
  id: string;
  name: string;
  grunderwerbsteuer: number; // in Prozent
  maklerKaeuferAnteil: number; // üblicher Käuferanteil in Prozent
}

const BUNDESLAENDER: Bundesland[] = [
  { id: 'bw', name: 'Baden-Württemberg', grunderwerbsteuer: 5.0, maklerKaeuferAnteil: 3.57 },
  { id: 'by', name: 'Bayern', grunderwerbsteuer: 3.5, maklerKaeuferAnteil: 3.57 },
  { id: 'be', name: 'Berlin', grunderwerbsteuer: 6.0, maklerKaeuferAnteil: 3.57 },
  { id: 'bb', name: 'Brandenburg', grunderwerbsteuer: 6.5, maklerKaeuferAnteil: 3.57 },
  { id: 'hb', name: 'Bremen', grunderwerbsteuer: 5.5, maklerKaeuferAnteil: 2.975 },
  { id: 'hh', name: 'Hamburg', grunderwerbsteuer: 5.5, maklerKaeuferAnteil: 3.125 },
  { id: 'he', name: 'Hessen', grunderwerbsteuer: 6.0, maklerKaeuferAnteil: 2.975 },
  { id: 'mv', name: 'Mecklenburg-Vorpommern', grunderwerbsteuer: 6.0, maklerKaeuferAnteil: 2.975 },
  { id: 'ni', name: 'Niedersachsen', grunderwerbsteuer: 5.0, maklerKaeuferAnteil: 3.57 },
  { id: 'nw', name: 'Nordrhein-Westfalen', grunderwerbsteuer: 6.5, maklerKaeuferAnteil: 3.57 },
  { id: 'rp', name: 'Rheinland-Pfalz', grunderwerbsteuer: 5.0, maklerKaeuferAnteil: 3.57 },
  { id: 'sl', name: 'Saarland', grunderwerbsteuer: 6.5, maklerKaeuferAnteil: 3.57 },
  { id: 'sn', name: 'Sachsen', grunderwerbsteuer: 5.5, maklerKaeuferAnteil: 3.57 },
  { id: 'st', name: 'Sachsen-Anhalt', grunderwerbsteuer: 5.0, maklerKaeuferAnteil: 3.57 },
  { id: 'sh', name: 'Schleswig-Holstein', grunderwerbsteuer: 6.5, maklerKaeuferAnteil: 3.57 },
  { id: 'th', name: 'Thüringen', grunderwerbsteuer: 5.0, maklerKaeuferAnteil: 3.57 },
];

// Notarkosten ca. 1,5% des Kaufpreises
function berechneNotarkosten(kaufpreis: number): number {
  return Math.round(kaufpreis * 0.015);
}

// Grundbuchkosten ca. 0,5% des Kaufpreises
function berechneGrundbuchkosten(kaufpreis: number): number {
  return Math.round(kaufpreis * 0.005);
}

export default function EigenkapitalRechner() {
  // Eingabewerte
  const [kaufpreis, setKaufpreis] = useState(350000);
  const [bundeslandId, setBundeslandId] = useState('by');
  const [mitMakler, setMitMakler] = useState(true);
  const [vorhandenesEigenkapital, setVorhandenesEigenkapital] = useState(70000);
  const [eigenkapitalZiel, setEigenkapitalZiel] = useState<20 | 25 | 30>(20);

  const ergebnis = useMemo(() => {
    const bundesland = BUNDESLAENDER.find(b => b.id === bundeslandId)!;
    
    // Nebenkosten berechnen
    const grunderwerbsteuer = Math.round(kaufpreis * (bundesland.grunderwerbsteuer / 100));
    const notarkosten = berechneNotarkosten(kaufpreis);
    const grundbuchkosten = berechneGrundbuchkosten(kaufpreis);
    const maklerkosten = mitMakler ? Math.round(kaufpreis * (bundesland.maklerKaeuferAnteil / 100)) : 0;
    
    const gesamtNebenkosten = grunderwerbsteuer + notarkosten + grundbuchkosten + maklerkosten;
    const nebenkostenProzent = (gesamtNebenkosten / kaufpreis) * 100;
    
    // Gesamtkosten
    const gesamtkosten = kaufpreis + gesamtNebenkosten;
    
    // Empfohlenes Eigenkapital (20%, 25%, 30% vom Kaufpreis + volle Nebenkosten)
    const eigenkapitalKaufpreis20 = Math.round(kaufpreis * 0.20);
    const eigenkapitalKaufpreis25 = Math.round(kaufpreis * 0.25);
    const eigenkapitalKaufpreis30 = Math.round(kaufpreis * 0.30);
    
    const empfohlen20 = eigenkapitalKaufpreis20 + gesamtNebenkosten;
    const empfohlen25 = eigenkapitalKaufpreis25 + gesamtNebenkosten;
    const empfohlen30 = eigenkapitalKaufpreis30 + gesamtNebenkosten;
    
    // Minimum: Nur Nebenkosten (100%-Finanzierung)
    const minimum = gesamtNebenkosten;
    
    // Ideal: 30% + Nebenkosten (günstigere Zinsen)
    const ideal = empfohlen30;
    
    // Gewähltes Ziel basierend auf Slider
    const empfohlenGewählt = eigenkapitalZiel === 20 ? empfohlen20 : eigenkapitalZiel === 25 ? empfohlen25 : empfohlen30;
    
    // Finanzierungsberechnung basierend auf vorhandenem Eigenkapital
    const eigenkapitalFuerKaufpreis = Math.max(0, vorhandenesEigenkapital - gesamtNebenkosten);
    const finanzierungsbedarf = kaufpreis - eigenkapitalFuerKaufpreis;
    const beleihungsauslauf = (finanzierungsbedarf / kaufpreis) * 100;
    
    // Differenz zum Ziel
    const differenzZumZiel = empfohlenGewählt - vorhandenesEigenkapital;
    const zielErreicht = differenzZumZiel <= 0;
    
    // Bewertung des Eigenkapitals
    let bewertung: 'kritisch' | 'ausreichend' | 'gut' | 'optimal';
    let bewertungText: string;
    let bewertungEmoji: string;
    
    if (vorhandenesEigenkapital < minimum) {
      bewertung = 'kritisch';
      bewertungText = 'Nicht ausreichend für Nebenkosten';
      bewertungEmoji = '🔴';
    } else if (vorhandenesEigenkapital < empfohlen20) {
      bewertung = 'ausreichend';
      bewertungText = 'Reicht für 100%-Finanzierung (ohne Nebenkosten)';
      bewertungEmoji = '🟡';
    } else if (vorhandenesEigenkapital < empfohlen30) {
      bewertung = 'gut';
      bewertungText = 'Gute Eigenkapitalquote, günstigere Zinsen möglich';
      bewertungEmoji = '🟢';
    } else {
      bewertung = 'optimal';
      bewertungText = 'Optimale Eigenkapitalquote (30%+), beste Konditionen';
      bewertungEmoji = '💚';
    }
    
    return {
      kaufpreis,
      bundesland,
      
      // Nebenkosten
      grunderwerbsteuer,
      notarkosten,
      grundbuchkosten,
      maklerkosten,
      gesamtNebenkosten,
      nebenkostenProzent,
      
      // Gesamtkosten
      gesamtkosten,
      
      // Eigenkapital-Empfehlungen
      minimum,
      empfohlen20,
      empfohlen25,
      empfohlen30,
      ideal,
      empfohlenGewählt,
      
      // Vorhandenes Eigenkapital
      vorhandenesEigenkapital,
      eigenkapitalFuerKaufpreis,
      finanzierungsbedarf,
      beleihungsauslauf,
      
      // Differenz & Bewertung
      differenzZumZiel,
      zielErreicht,
      bewertung,
      bewertungText,
      bewertungEmoji,
    };
  }, [kaufpreis, bundeslandId, mitMakler, vorhandenesEigenkapital, eigenkapitalZiel]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  // Farbgebung basierend auf Bewertung
  const getBewertungColor = () => {
    switch (ergebnis.bewertung) {
      case 'kritisch': return 'from-red-500 to-rose-600';
      case 'ausreichend': return 'from-amber-500 to-orange-600';
      case 'gut': return 'from-green-500 to-emerald-600';
      case 'optimal': return 'from-emerald-500 to-teal-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kaufpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kaufpreis der Immobilie</span>
            <span className="text-xs text-gray-500 block mt-1">Haus, Wohnung oder Grundstück</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kaufpreis}
              onChange={(e) => setKaufpreis(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(kaufpreis, 1000000)}
            onChange={(e) => setKaufpreis(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
            min="50000"
            max="1000000"
            step="10000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50.000 €</span>
            <span>500.000 €</span>
            <span>1 Mio €</span>
          </div>
        </div>

        {/* Bundesland */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Bundesland</span>
            <span className="text-xs text-gray-500 block mt-1">Bestimmt die Grunderwerbsteuer (3,5% - 6,5%)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BUNDESLAENDER.map((bl) => (
              <button
                key={bl.id}
                onClick={() => setBundeslandId(bl.id)}
                className={`py-2 px-3 rounded-lg text-sm transition-all ${
                  bundeslandId === bl.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-medium block truncate">{bl.name}</span>
                <span className={`text-xs ${bundeslandId === bl.id ? 'text-blue-100' : 'text-gray-400'}`}>
                  {formatProzent(bl.grunderwerbsteuer)} GrESt
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Makler */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={mitMakler}
              onChange={(e) => setMitMakler(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-gray-800 font-medium">🤝 Kauf über Makler</span>
              <span className="text-xs text-gray-500 block">
                Käuferanteil ca. {formatProzent(BUNDESLAENDER.find(b => b.id === bundeslandId)?.maklerKaeuferAnteil || 3.57)}
              </span>
            </div>
          </label>
        </div>

        {/* Vorhandenes Eigenkapital */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">💰 Ihr vorhandenes Eigenkapital</span>
            <span className="text-xs text-gray-500 block mt-1">Ersparnisse, Bausparvertrag, Schenkungen etc.</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={vorhandenesEigenkapital}
              onChange={(e) => setVorhandenesEigenkapital(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="5000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
          <input
            type="range"
            value={Math.min(vorhandenesEigenkapital, kaufpreis)}
            onChange={(e) => setVorhandenesEigenkapital(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="0"
            max={kaufpreis}
            step="5000"
          />
        </div>

        {/* Eigenkapital-Ziel */}
        <div className="mb-4">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">🎯 Eigenkapital-Ziel</span>
            <span className="text-xs text-gray-500 block mt-1">Empfohlen: 20-30% vom Kaufpreis + Nebenkosten</span>
          </label>
          <div className="flex gap-2">
            {[20, 25, 30].map((prozent) => (
              <button
                key={prozent}
                onClick={() => setEigenkapitalZiel(prozent as 20 | 25 | 30)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  eigenkapitalZiel === prozent
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg block">{prozent}%</span>
                <span className={`text-xs ${eigenkapitalZiel === prozent ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {prozent === 20 ? 'Minimum' : prozent === 25 ? 'Empfohlen' : 'Optimal'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br ${getBewertungColor()}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{ergebnis.bewertungEmoji}</span>
          <div>
            <h3 className="font-bold text-lg">Eigenkapital-Bewertung</h3>
            <p className="text-white/80 text-sm">{ergebnis.bewertungText}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Empfohlen ({eigenkapitalZiel}% + NK)</span>
            <div className="text-2xl font-bold">{formatEuro(ergebnis.empfohlenGewählt)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Vorhanden</span>
            <div className="text-2xl font-bold">{formatEuro(ergebnis.vorhandenesEigenkapital)}</div>
          </div>
        </div>
        
        {!ergebnis.zielErreicht ? (
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <span className="text-sm opacity-80">Es fehlen noch</span>
            <div className="text-3xl font-bold">{formatEuro(ergebnis.differenzZumZiel)}</div>
            <span className="text-sm opacity-80">zum {eigenkapitalZiel}%-Ziel</span>
          </div>
        ) : (
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <span className="text-lg">✅ Ziel erreicht!</span>
            <div className="text-sm opacity-80 mt-1">
              {formatEuro(Math.abs(ergebnis.differenzZumZiel))} über dem {eigenkapitalZiel}%-Ziel
            </div>
          </div>
        )}
      </div>

      {/* Eigenkapital-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Empfohlenes Eigenkapital</h3>
        
        {/* Visuelle Skala */}
        <div className="mb-6">
          <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
            {/* Zonen */}
            <div className="absolute inset-y-0 left-0 bg-red-200" style={{ width: `${(ergebnis.minimum / ergebnis.ideal) * 100}%` }} />
            <div className="absolute inset-y-0 bg-amber-200" style={{ left: `${(ergebnis.minimum / ergebnis.ideal) * 100}%`, width: `${((ergebnis.empfohlen20 - ergebnis.minimum) / ergebnis.ideal) * 100}%` }} />
            <div className="absolute inset-y-0 bg-green-200" style={{ left: `${(ergebnis.empfohlen20 / ergebnis.ideal) * 100}%`, width: `${((ergebnis.empfohlen30 - ergebnis.empfohlen20) / ergebnis.ideal) * 100}%` }} />
            <div className="absolute inset-y-0 right-0 bg-emerald-200" style={{ width: `${((ergebnis.ideal - ergebnis.empfohlen30) / ergebnis.ideal) * 100}%` }} />
            
            {/* Marker für vorhandenes Eigenkapital */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-blue-600 shadow-lg z-10"
              style={{ 
                left: `${Math.min(100, (ergebnis.vorhandenesEigenkapital / ergebnis.ideal) * 100)}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                Ihr EK
              </div>
            </div>
          </div>
          
          {/* Beschriftung */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0 €</span>
            <span>NK ({formatEuro(ergebnis.minimum)})</span>
            <span>20% + NK</span>
            <span>30% + NK</span>
          </div>
        </div>
        
        {/* Tabelle */}
        <div className="space-y-3">
          <div className={`flex justify-between p-3 rounded-xl ${ergebnis.vorhandenesEigenkapital >= ergebnis.minimum ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div>
              <span className="font-medium text-gray-800">Minimum (nur Nebenkosten)</span>
              <span className="text-xs text-gray-500 block">100%-Finanzierung, keine Puffer</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg">{formatEuro(ergebnis.minimum)}</span>
              {ergebnis.vorhandenesEigenkapital >= ergebnis.minimum && <span className="text-green-600 ml-2">✓</span>}
            </div>
          </div>
          
          <div className={`flex justify-between p-3 rounded-xl ${ergebnis.vorhandenesEigenkapital >= ergebnis.empfohlen20 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div>
              <span className="font-medium text-gray-800">20% + Nebenkosten</span>
              <span className="text-xs text-gray-500 block">Solide Basis, 80%-Finanzierung</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg">{formatEuro(ergebnis.empfohlen20)}</span>
              {ergebnis.vorhandenesEigenkapital >= ergebnis.empfohlen20 && <span className="text-green-600 ml-2">✓</span>}
            </div>
          </div>
          
          <div className={`flex justify-between p-3 rounded-xl ${ergebnis.vorhandenesEigenkapital >= ergebnis.empfohlen25 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div>
              <span className="font-medium text-gray-800">25% + Nebenkosten</span>
              <span className="text-xs text-gray-500 block">Gute Konditionen, 75%-Finanzierung</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg">{formatEuro(ergebnis.empfohlen25)}</span>
              {ergebnis.vorhandenesEigenkapital >= ergebnis.empfohlen25 && <span className="text-green-600 ml-2">✓</span>}
            </div>
          </div>
          
          <div className={`flex justify-between p-3 rounded-xl ${ergebnis.vorhandenesEigenkapital >= ergebnis.empfohlen30 ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div>
              <span className="font-medium text-gray-800">30% + Nebenkosten</span>
              <span className="text-xs text-gray-500 block">Beste Zinsen, 70%-Finanzierung</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg">{formatEuro(ergebnis.empfohlen30)}</span>
              {ergebnis.vorhandenesEigenkapital >= ergebnis.empfohlen30 && <span className="text-emerald-600 ml-2">✓</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Nebenkosten-Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💸 Kaufnebenkosten in {ergebnis.bundesland.name}</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <div>
              <span className="text-gray-800 font-medium">Grunderwerbsteuer</span>
              <span className="text-xs text-gray-500 block">{formatProzent(ergebnis.bundesland.grunderwerbsteuer)}</span>
            </div>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.grunderwerbsteuer)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <div>
              <span className="text-gray-800 font-medium">Notarkosten</span>
              <span className="text-xs text-gray-500 block">ca. 1,5%</span>
            </div>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.notarkosten)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <div>
              <span className="text-gray-800 font-medium">Grundbuchkosten</span>
              <span className="text-xs text-gray-500 block">ca. 0,5%</span>
            </div>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.grundbuchkosten)}</span>
          </div>
          
          {mitMakler && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <div>
                <span className="text-gray-800 font-medium">Maklerprovision (Käuferanteil)</span>
                <span className="text-xs text-gray-500 block">{formatProzent(ergebnis.bundesland.maklerKaeuferAnteil)}</span>
              </div>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.maklerkosten)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-3 bg-blue-50 -mx-6 px-6 rounded-b-xl">
            <div>
              <span className="font-bold text-blue-800">Gesamte Nebenkosten</span>
              <span className="text-xs text-blue-600 block">{formatProzent(ergebnis.nebenkostenProzent)} vom Kaufpreis</span>
            </div>
            <span className="font-bold text-2xl text-blue-900">{formatEuro(ergebnis.gesamtNebenkosten)}</span>
          </div>
        </div>
      </div>

      {/* Finanzierungsübersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🏦 Ihre Finanzierungssituation</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <span className="text-sm text-emerald-600 block mb-1">Eigenkapital für Kaufpreis</span>
            <span className="text-2xl font-bold text-emerald-800">{formatEuro(ergebnis.eigenkapitalFuerKaufpreis)}</span>
            <span className="text-xs text-emerald-600 block mt-1">nach Abzug der Nebenkosten</span>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <span className="text-sm text-blue-600 block mb-1">Finanzierungsbedarf</span>
            <span className="text-2xl font-bold text-blue-800">{formatEuro(ergebnis.finanzierungsbedarf)}</span>
            <span className="text-xs text-blue-600 block mt-1">benötigter Kredit</span>
          </div>
        </div>
        
        {/* Beleihungsauslauf */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Beleihungsauslauf</span>
            <span className="font-bold text-gray-800">{formatProzent(ergebnis.beleihungsauslauf)}</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                ergebnis.beleihungsauslauf <= 60 ? 'bg-emerald-500' :
                ergebnis.beleihungsauslauf <= 80 ? 'bg-green-500' :
                ergebnis.beleihungsauslauf <= 90 ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, ergebnis.beleihungsauslauf)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>60% (Top-Zins)</span>
            <span>80%</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {ergebnis.beleihungsauslauf <= 60 && '🌟 Sehr niedriger Beleihungsauslauf – Sie erhalten die besten Zinskonditionen!'}
            {ergebnis.beleihungsauslauf > 60 && ergebnis.beleihungsauslauf <= 80 && '✅ Guter Beleihungsauslauf – günstige Zinsen möglich.'}
            {ergebnis.beleihungsauslauf > 80 && ergebnis.beleihungsauslauf <= 90 && '⚠️ Erhöhter Beleihungsauslauf – Zinsaufschläge wahrscheinlich.'}
            {ergebnis.beleihungsauslauf > 90 && '❌ Sehr hoher Beleihungsauslauf – deutlich höhere Zinsen, schwierige Finanzierung.'}
          </p>
        </div>
      </div>

      {/* Warum Eigenkapital wichtig ist */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💡 Warum ist Eigenkapital so wichtig?</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>📉</span>
            <span><strong>Niedrigere Zinsen:</strong> Je mehr Eigenkapital, desto günstiger der Zinssatz. Ab 60% Beleihungsauslauf gibt's die besten Konditionen.</span>
          </li>
          <li className="flex gap-2">
            <span>💰</span>
            <span><strong>Geringere Monatsrate:</strong> Weniger Kredit = weniger Zinsen = niedrigere monatliche Belastung.</span>
          </li>
          <li className="flex gap-2">
            <span>🛡️</span>
            <span><strong>Sicherheitspuffer:</strong> Bei Wertschwankungen am Immobilienmarkt bleiben Sie auf der sicheren Seite.</span>
          </li>
          <li className="flex gap-2">
            <span>✅</span>
            <span><strong>Bessere Chancen:</strong> Banken vergeben Kredite lieber an Käufer mit solidem Eigenkapital.</span>
          </li>
        </ul>
      </div>

      {/* Tipps zum Eigenkapital aufbauen */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">🎯 Tipps zum Eigenkapital-Aufbau</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>💳</span>
            <span><strong>Sparplan:</strong> Regelmäßig sparen, z.B. 500 €/Monat = 6.000 €/Jahr</span>
          </li>
          <li className="flex gap-2">
            <span>🏠</span>
            <span><strong>Bausparvertrag:</strong> Staatliche Förderung + sichere Zinsen für später</span>
          </li>
          <li className="flex gap-2">
            <span>👨‍👩‍👧</span>
            <span><strong>Schenkung/Erbschaft:</strong> Freibeträge nutzen (400.000 € von Eltern)</span>
          </li>
          <li className="flex gap-2">
            <span>📈</span>
            <span><strong>Sonderzahlungen:</strong> Boni, Urlaubsgeld, Steuerrückerstattung einplanen</span>
          </li>
          <li className="flex gap-2">
            <span>🔧</span>
            <span><strong>Eigenleistung:</strong> Handwerkliche Arbeiten selbst übernehmen (bis 15% möglich)</span>
          </li>
        </ul>
      </div>

      {/* Faustregeln */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📏 Faustregeln für Eigenkapital</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-800 mb-2">Die 20-30-Regel:</h4>
            <p>
              Experten empfehlen <strong>20-30% des Kaufpreises</strong> als Eigenkapital, 
              <strong>plus die gesamten Kaufnebenkosten</strong> (ca. 10-15% je nach Bundesland).
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-800 mb-2">Nebenkosten immer aus Eigenkapital:</h4>
            <p>
              Banken finanzieren in der Regel <strong>keine Kaufnebenkosten</strong>. 
              Diese müssen Sie aus eigener Tasche bezahlen.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-800 mb-2">100%-Finanzierung = Risiko:</h4>
            <p>
              Eine Vollfinanzierung ist möglich, aber teuer: 
              Rechnen Sie mit <strong>0,3-0,8% höheren Zinsen</strong> als bei 80%-Finanzierung.
            </p>
          </div>
        </div>
      </div>

      {/* Zinsstaffel */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Beispiel: Zinsaufschläge nach Beleihungsauslauf</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-600">Beleihungsauslauf</th>
                <th className="text-center py-2 px-3 font-medium text-gray-600">Zinsaufschlag*</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Eigenkapital bei {formatEuro(kaufpreis)}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-emerald-50">
                <td className="py-2 px-3 font-medium text-emerald-700">bis 60%</td>
                <td className="py-2 px-3 text-center text-emerald-600">± 0,00%</td>
                <td className="py-2 px-3 text-right">{formatEuro(Math.round(kaufpreis * 0.4) + ergebnis.gesamtNebenkosten)}</td>
              </tr>
              <tr className="bg-green-50">
                <td className="py-2 px-3 font-medium text-green-700">60-80%</td>
                <td className="py-2 px-3 text-center text-green-600">+ 0,10-0,20%</td>
                <td className="py-2 px-3 text-right">{formatEuro(Math.round(kaufpreis * 0.2) + ergebnis.gesamtNebenkosten)}</td>
              </tr>
              <tr className="bg-amber-50">
                <td className="py-2 px-3 font-medium text-amber-700">80-90%</td>
                <td className="py-2 px-3 text-center text-amber-600">+ 0,30-0,50%</td>
                <td className="py-2 px-3 text-right">{formatEuro(Math.round(kaufpreis * 0.1) + ergebnis.gesamtNebenkosten)}</td>
              </tr>
              <tr className="bg-red-50">
                <td className="py-2 px-3 font-medium text-red-700">über 90%</td>
                <td className="py-2 px-3 text-center text-red-600">+ 0,50-0,80%</td>
                <td className="py-2 px-3 text-right">{formatEuro(ergebnis.gesamtNebenkosten)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * Zinsaufschläge sind Richtwerte und variieren je nach Bank und Bonität. Stand: 2025
        </p>
      </div>

      {/* Hinweis */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Reserve einplanen:</strong> Nach dem Kauf sollten noch 3-6 Monatsgehälter als Notgroschen übrig bleiben.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Zusätzliche Kosten:</strong> Umzug, Renovierung, Möbel – planen Sie einen Puffer von 10.000-20.000 € ein.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Keine Altersvorsorge opfern:</strong> Riester/Rürup nicht komplett auflösen für den Hauskauf.</span>
          </li>
        </ul>
      </div>

            <RechnerFeedback rechnerName="Eigenkapital-Rechner 2025 & 2026" rechnerSlug="eigenkapital-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Informationen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/bau-und-immobilienfinanzierung"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Baufinanzierung
          </a>
          <a 
            href="https://www.kfw.de/inlandsfoerderung/Privatpersonen/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            KfW – Förderung für Privatpersonen
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – Grunderwerbsteuer
          </a>
        </div>
      </div>
    </div>
  );
}
