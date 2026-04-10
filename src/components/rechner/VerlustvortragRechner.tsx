import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Verlustvortrag nach §10d EStG
// Bis 1 Mio € = 100% verrechenbar
// Über 1 Mio € = normalerweise nur 70% verrechenbar (Mindestbesteuerung)
// ABER: Wachstumschancengesetz (27.03.2024): Für VZ 2024-2027 auf 70% erhöht!
const VERLUSTVORTRAG_GRENZE = 1000000;
const VERRECHNUNG_UEBER_GRENZE = 0.70; // 70% für VZ 2024-2027 per Wachstumschancengesetz

// Veranlagungsarten
const VERANLAGUNGSARTEN = [
  { wert: 'single', label: 'Einzelveranlagung', grenze: 1000000 },
  { wert: 'zusammen', label: 'Zusammenveranlagung', grenze: 2000000 },
];

interface BerechnungsErgebnis {
  // Eingaben
  zvE: number;
  verlustvortrag: number;
  verheiratet: boolean;
  
  // Berechnung
  grenze: number;
  verrechenbarbis1Mio: number;
  verrechenbarueber1Mio: number;
  verrechenbarGesamt: number;
  nichtVerrechenbar: number;
  restlicherVerlustvortrag: number;
  
  // Ergebnis
  zvENachVerrechnung: number;
  steuerersparnis: number;
}

// Einkommensteuer 2026 – nach §32a EStG (vereinfacht)
function berechneEinkommensteuer(zvE: number, verheiratet: boolean): number {
  const GRUNDFREIBETRAG = 12348;
  const faktor = verheiratet ? 2 : 1;
  const zvEHalb = zvE / faktor;
  
  if (zvEHalb <= 0) return 0;
  
  let steuer = 0;
  
  if (zvEHalb <= GRUNDFREIBETRAG) {
    steuer = 0;
  } else if (zvEHalb <= 17799) {
    const y = (zvEHalb - GRUNDFREIBETRAG) / 10000;
    steuer = (914.51 * y + 1400) * y;
  } else if (zvEHalb <= 69878) {
    const z = (zvEHalb - 17799) / 10000;
    steuer = (173.10 * z + 2397) * z + 1034.87;
  } else if (zvEHalb <= 277825) {
    steuer = 0.42 * zvEHalb - 11135.63;
  } else {
    steuer = 0.45 * zvEHalb - 19470.38;
  }
  
  return Math.round(steuer * faktor);
}

function berechneVerlustvortrag(
  zvE: number,
  verlustvortrag: number,
  verheiratet: boolean
): BerechnungsErgebnis {
  // Grenze verdoppelt sich bei Zusammenveranlagung
  const grenze = verheiratet ? VERLUSTVORTRAG_GRENZE * 2 : VERLUSTVORTRAG_GRENZE;
  
  // Verrechenbarer Betrag bis zur Grenze (100%)
  const verrechenbarbis1Mio = Math.min(zvE, grenze, verlustvortrag);
  
  // Restliches zvE und restlicher Verlustvortrag nach 100%-Verrechnung
  const zvENach100 = zvE - verrechenbarbis1Mio;
  const verlustNach100 = verlustvortrag - verrechenbarbis1Mio;
  
  // Über der Grenze: maximal 70% des übersteigenden zvE verrechenbar
  let verrechenbarueber1Mio = 0;
  if (zvENach100 > 0 && verlustNach100 > 0) {
    const maxVerrechenbar60 = zvENach100 * VERRECHNUNG_UEBER_GRENZE;
    verrechenbarueber1Mio = Math.min(maxVerrechenbar60, verlustNach100);
  }
  
  const verrechenbarGesamt = verrechenbarbis1Mio + verrechenbarueber1Mio;
  const nichtVerrechenbar = Math.max(0, verlustvortrag - verrechenbarGesamt);
  const restlicherVerlustvortrag = nichtVerrechenbar;
  
  const zvENachVerrechnung = zvE - verrechenbarGesamt;
  
  // Steuerersparnis berechnen
  const steuerOhne = berechneEinkommensteuer(zvE, verheiratet);
  const steuerMit = berechneEinkommensteuer(zvENachVerrechnung, verheiratet);
  const steuerersparnis = steuerOhne - steuerMit;
  
  return {
    zvE,
    verlustvortrag,
    verheiratet,
    grenze,
    verrechenbarbis1Mio,
    verrechenbarueber1Mio,
    verrechenbarGesamt,
    nichtVerrechenbar,
    restlicherVerlustvortrag,
    zvENachVerrechnung,
    steuerersparnis,
  };
}

export default function VerlustvortragRechner() {
  const [zvE, setZvE] = useState(150000);
  const [verlustvortrag, setVerlustvortrag] = useState(80000);
  const [veranlagung, setVeranlagung] = useState<'single' | 'zusammen'>('single');
  
  const ergebnis = useMemo(() => {
    return berechneVerlustvortrag(zvE, verlustvortrag, veranlagung === 'zusammen');
  }, [zvE, verlustvortrag, veranlagung]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatProzent = (n: number) => n.toFixed(1).replace('.', ',') + ' %';

  // Beispiele für verschiedene Szenarien
  const beispiele = [
    { name: 'Kleiner Verlust', zvE: 80000, verlust: 30000 },
    { name: 'Mittlerer Verlust', zvE: 150000, verlust: 80000 },
    { name: 'Über Grenze', zvE: 2000000, verlust: 1500000 },
    { name: 'Hoher Verlust', zvE: 500000, verlust: 2000000 },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Verlustvortrag-Rechner 2025 & 2026" rechnerSlug="verlustvortrag-rechner" />

{/* Eingabe: Zu versteuerndes Einkommen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💰</span> Zu versteuerndes Einkommen (zvE)
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Einkommen im aktuellen Jahr
            </label>
            <div className="relative">
              <input
                type="number"
                value={zvE}
                onChange={(e) => setZvE(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                min="0"
                step="10000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000000"
              step="10000"
              value={zvE}
              onChange={(e) => setZvE(Number(e.target.value))}
              className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Das zu versteuernde Einkommen nach Abzug aller Werbungskosten und Sonderausgaben
            </p>
          </div>
        </div>
      </div>

      {/* Eingabe: Verlustvortrag */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📉</span> Verlustvortrag aus Vorjahren
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Festgestellter Verlustvortrag
            </label>
            <div className="relative">
              <input
                type="number"
                value={verlustvortrag}
                onChange={(e) => setVerlustvortrag(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 outline-none"
                min="0"
                step="10000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000000"
              step="10000"
              value={verlustvortrag}
              onChange={(e) => setVerlustvortrag(Number(e.target.value))}
              className="w-full mt-2 h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Der vom Finanzamt festgestellte Verlustvortrag aus den Vorjahren (Bescheid nach §10d Abs. 4 EStG)
            </p>
          </div>
        </div>
      </div>

      {/* Veranlagungsart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">👤</span> Veranlagungsart
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {VERANLAGUNGSARTEN.map((v) => (
            <button
              key={v.wert}
              onClick={() => setVeranlagung(v.wert as 'single' | 'zusammen')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                veranlagung === v.wert
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="block">{v.label}</span>
              <span className="text-xs opacity-75">Grenze: {formatEuro(v.grenze)}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Bei Zusammenveranlagung verdoppelt sich die Grenze für die volle Verlustverrechnung auf 2 Mio. €
        </p>
      </div>

      {/* Schnellwahl Beispiele */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">📋 Beispielszenarien:</p>
        <div className="flex flex-wrap gap-2">
          {beispiele.map((b) => (
            <button
              key={b.name}
              onClick={() => {
                setZvE(b.zvE);
                setVerlustvortrag(b.verlust);
              }}
              className="px-3 py-1.5 bg-white text-sm rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-green-200 mb-1">Verrechenbar im aktuellen Jahr</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.verrechenbarGesamt)}</span>
          </div>
          <p className="text-green-200 text-sm mt-1">
            von {formatEuro(verlustvortrag)} Verlustvortrag
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-green-200 text-xs block">Steuerersparnis</span>
            <span className="text-xl font-bold">{formatEuro(ergebnis.steuerersparnis)}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-green-200 text-xs block">zvE nach Verrechnung</span>
            <span className="text-xl font-bold">{formatEuro(ergebnis.zvENachVerrechnung)}</span>
          </div>
        </div>
      </div>
{/* Restlicher Verlustvortrag */}
      {ergebnis.restlicherVerlustvortrag > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
            <span className="text-xl">📋</span> Verbleibender Verlustvortrag
          </h3>
          <p className="text-3xl font-bold text-orange-600 mb-2">
            {formatEuro(ergebnis.restlicherVerlustvortrag)}
          </p>
          <p className="text-sm text-orange-700">
            Dieser Betrag wird ins nächste Jahr vorgetragen und kann dort mit zukünftigen 
            Einkünften verrechnet werden.
          </p>
        </div>
      )}

      {/* Detaillierte Berechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>
        
        <div className="space-y-4">
          {/* Ausgangswerte */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Zu versteuerndes Einkommen</span>
            <span className="font-bold text-gray-900">{formatEuro(zvE)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Verlustvortrag aus Vorjahren</span>
            <span className="font-bold text-red-600">− {formatEuro(verlustvortrag)}</span>
          </div>

          {/* Verrechnung bis 1 Mio */}
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-green-800">
                Bis {formatEuro(ergebnis.grenze)} (100% verrechenbar)
              </span>
              <span className="font-bold text-green-600">
                − {formatEuro(ergebnis.verrechenbarbis1Mio)}
              </span>
            </div>
            <p className="text-xs text-green-600">
              Verluste bis zur Grenze werden vollständig mit dem Einkommen verrechnet.
            </p>
          </div>

          {/* Verrechnung über 1 Mio */}
          {ergebnis.verrechenbarueber1Mio > 0 && (
            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-yellow-800">
                  Über {formatEuro(ergebnis.grenze)} (70% verrechenbar)
                </span>
                <span className="font-bold text-yellow-600">
                  − {formatEuro(ergebnis.verrechenbarueber1Mio)}
                </span>
              </div>
              <p className="text-xs text-yellow-600">
                Bei Einkommen über der Grenze können nur 70% des übersteigenden Betrags 
                mit Verlusten verrechnet werden (Mindestbesteuerung).
              </p>
            </div>
          )}

          {/* Nicht verrechenbar */}
          {ergebnis.nichtVerrechenbar > 0 && (
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-orange-800">
                  Nicht verrechenbar (Vortrag ins Folgejahr)
                </span>
                <span className="font-bold text-orange-600">
                  {formatEuro(ergebnis.nichtVerrechenbar)}
                </span>
              </div>
              <p className="text-xs text-orange-600">
                Dieser Teil des Verlustvortrags kann im aktuellen Jahr nicht genutzt werden 
                und wird automatisch ins nächste Jahr vorgetragen.
              </p>
            </div>
          )}

          {/* Ergebnis */}
          <div className="flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl">
            <div>
              <span className="font-bold text-green-800 text-lg">zvE nach Verlustverrechnung</span>
            </div>
            <span className="font-bold text-green-600 text-xl">{formatEuro(ergebnis.zvENachVerrechnung)}</span>
          </div>
        </div>
      </div>

      {/* Visualisierung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 Visualisierung</h3>
        
        <div className="space-y-4">
          {/* Balken: Einkommen */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Einkommen</span>
              <span className="font-medium">{formatEuro(zvE)}</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Balken: Verrechnung */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Verrechnet</span>
              <span className="font-medium text-green-600">− {formatEuro(ergebnis.verrechenbarGesamt)}</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (ergebnis.verrechenbarGesamt / zvE) * 100)}%` }}
              />
            </div>
          </div>

          {/* Balken: Verbleibend */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Verbleibendes zvE</span>
              <span className="font-medium">{formatEuro(ergebnis.zvENachVerrechnung)}</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${(ergebnis.zvENachVerrechnung / zvE) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Formel & Erklärung */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">📐 Berechnungsformel nach §10d EStG</h3>
        
        <div className="bg-white rounded-xl p-4 mb-4 font-mono text-sm">
          <p className="mb-2">
            <span className="text-blue-600">// Schritt 1: Bis zur Grenze (100%)</span>
          </p>
          <p className="mb-2">
            verrechenbar_1 = min(zvE, {formatEuro(ergebnis.grenze)}, Verlustvortrag)
          </p>
          <p className="mb-2">
            <span className="text-blue-600">// Schritt 2: Über der Grenze (60%)</span>
          </p>
          <p className="mb-2">
            restZvE = zvE − verrechenbar_1
          </p>
          <p className="mb-2">
            verrechenbar_2 = min(restZvE × 70%, restlicher_Verlustvortrag)
          </p>
          <p className="mb-2">
            <span className="text-blue-600">// Ergebnis</span>
          </p>
          <p>
            zvE_neu = zvE − verrechenbar_1 − verrechenbar_2
          </p>
        </div>

        <p className="text-sm text-blue-700">
          Die <strong>Mindestbesteuerung</strong> nach §10d Abs. 2 EStG stellt sicher, dass bei sehr 
          hohen Einkommen mindestens 30% des Betrags über 1 Mio. € (bzw. 2 Mio. € bei Zusammenveranlagung) 
          der Besteuerung unterliegen.
        </p>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Verlustfeststellung:</strong> Der Verlustvortrag muss vom Finanzamt 
            gesondert festgestellt werden (Bescheid nach §10d Abs. 4 EStG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Grenze 2026:</strong> 1 Mio. € (Single) / 2 Mio. € (Zusammenveranlagung)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mindestbesteuerung:</strong> Über der Grenze nur 70% verrechenbar 
            (30% unterliegen der Mindestbesteuerung, VZ 2024-2027)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Vortrag:</strong> Nicht verrechnete Verluste werden unbegrenzt 
            in die Folgejahre vorgetragen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Verlustrücktrag:</strong> Alternativ können Verluste auch ins Vorjahr 
            zurückgetragen werden (max. 1 Mio. € / 2 Mio. €)</span>
          </li>
          <li className="flex gap-2">
            <span>⚠️</span>
            <span><strong>Besonderheiten:</strong> Für Kapitalverluste, Verluste aus privaten 
            Veräußerungsgeschäften und Verluste aus Termingeschäften gelten Sonderregeln</span>
          </li>
        </ul>
      </div>

      {/* Typische Verlustquellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Typische Verlustquellen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🏠</span>
            <p className="font-medium text-gray-800 mt-1">Vermietung & Verpachtung</p>
            <p className="text-xs text-gray-500">Renovierung, Leerstand, AfA</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">💼</span>
            <p className="font-medium text-gray-800 mt-1">Selbstständigkeit</p>
            <p className="text-xs text-gray-500">Anlaufverluste, Investitionen</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🏢</span>
            <p className="font-medium text-gray-800 mt-1">Gewerbebetrieb</p>
            <p className="text-xs text-gray-500">Geschäftliche Verluste</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🌾</span>
            <p className="font-medium text-gray-800 mt-1">Land- & Forstwirtschaft</p>
            <p className="text-xs text-gray-500">Ernteausfälle, Investitionen</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          <strong>Achtung:</strong> Verluste aus Kapitalvermögen und privaten Veräußerungsgeschäften 
          können nur mit entsprechenden Gewinnen verrechnet werden (keine Verrechnung mit anderen Einkünften).
        </p>
      </div>

      {/* Zuständige Behörden */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Finanzamt</p>
              <p className="text-gray-500">Verlustfeststellung & Steuererklärung</p>
              <a 
                href="https://www.elster.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ELSTER Online →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">⚖️</span>
            <div>
              <p className="font-medium text-gray-800">Steuerberater</p>
              <p className="text-gray-500">Optimierung & komplexe Fälle</p>
              <a 
                href="https://www.bstbk.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Steuerberaterkammer →
              </a>
            </div>
          </div>
        </div>
      </div>
{/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__10d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §10d EStG – Verlustabzug
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium der Finanzen
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__2.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §2 EStG – Umfang der Besteuerung
          </a>
        </div>
      </div>
    </div>
  );
}
