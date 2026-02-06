import { useState, useMemo } from 'react';

// Widmark-Formel Konstanten
const WIDMARK = {
  maennlich: 0.68,  // Reduktionsfaktor Männer
  weiblich: 0.55,   // Reduktionsfaktor Frauen
  alkoholDichte: 0.8, // g/ml Ethanol
  abbauRate: 0.15,  // Promille pro Stunde (Durchschnitt: 0.1-0.2)
  abbauRateMin: 0.1,
  abbauRateMax: 0.2,
  resorptionsdefizit: 0.2, // 10-30% des Alkohols wird nicht resorbiert
};

// Gesetzliche Grenzen Deutschland
const GRENZEN = {
  fahranfaenger: 0.0,      // Null-Promille für Fahranfänger
  grenze: 0.5,             // Allgemeine Grenze
  strafbar: 1.1,           // Absolute Fahruntüchtigkeit
  fahrlassig: 1.6,         // Grobe Fahrlässigkeit, MPU droht
};

// Typische Getränke mit Alkoholgehalt
interface Getraenk {
  id: string;
  name: string;
  icon: string;
  menge: number;        // ml
  alkoholgehalt: number; // Vol-%
  beliebt?: boolean;
}

const GETRAENKE: Getraenk[] = [
  { id: 'bier', name: 'Bier (0,5l)', icon: '🍺', menge: 500, alkoholgehalt: 5.0, beliebt: true },
  { id: 'bier_klein', name: 'Bier (0,33l)', icon: '🍺', menge: 330, alkoholgehalt: 5.0 },
  { id: 'bier_mass', name: 'Maß Bier (1l)', icon: '🍻', menge: 1000, alkoholgehalt: 5.0 },
  { id: 'weizen', name: 'Weizenbier (0,5l)', icon: '🍺', menge: 500, alkoholgehalt: 5.4 },
  { id: 'pils', name: 'Pils (0,5l)', icon: '🍺', menge: 500, alkoholgehalt: 4.8 },
  { id: 'wein_rot', name: 'Rotwein (0,2l)', icon: '🍷', menge: 200, alkoholgehalt: 13.0, beliebt: true },
  { id: 'wein_weiss', name: 'Weißwein (0,2l)', icon: '🥂', menge: 200, alkoholgehalt: 11.5 },
  { id: 'wein_flasche', name: 'Weinflasche (0,75l)', icon: '🍷', menge: 750, alkoholgehalt: 13.0 },
  { id: 'sekt', name: 'Sekt/Prosecco (0,1l)', icon: '🥂', menge: 100, alkoholgehalt: 11.0, beliebt: true },
  { id: 'schnaps', name: 'Schnaps/Shot (2cl)', icon: '🥃', menge: 20, alkoholgehalt: 40.0, beliebt: true },
  { id: 'schnaps_doppelt', name: 'Doppelter (4cl)', icon: '🥃', menge: 40, alkoholgehalt: 40.0 },
  { id: 'whisky', name: 'Whisky (4cl)', icon: '🥃', menge: 40, alkoholgehalt: 40.0 },
  { id: 'vodka', name: 'Wodka (2cl)', icon: '🥃', menge: 20, alkoholgehalt: 40.0 },
  { id: 'longdrink', name: 'Longdrink/Cocktail', icon: '🍹', menge: 300, alkoholgehalt: 8.0 },
  { id: 'aperol', name: 'Aperol Spritz', icon: '🍹', menge: 200, alkoholgehalt: 8.0 },
  { id: 'hugo', name: 'Hugo', icon: '🍹', menge: 200, alkoholgehalt: 6.5 },
  { id: 'radler', name: 'Radler (0,5l)', icon: '🍺', menge: 500, alkoholgehalt: 2.5 },
  { id: 'alster', name: 'Alster (0,5l)', icon: '🍺', menge: 500, alkoholgehalt: 2.5 },
  { id: 'likoer', name: 'Likör (2cl)', icon: '🍸', menge: 20, alkoholgehalt: 25.0 },
  { id: 'jaegermeister', name: 'Jägermeister (2cl)', icon: '🍸', menge: 20, alkoholgehalt: 35.0 },
];

type Geschlecht = 'maennlich' | 'weiblich';

interface KonsumierteGetraenke {
  [key: string]: number;
}

export default function PromilleRechner() {
  const [geschlecht, setGeschlecht] = useState<Geschlecht>('maennlich');
  const [gewicht, setGewicht] = useState(80);
  const [getraenke, setGetraenke] = useState<KonsumierteGetraenke>({});
  const [zeitSeitBeginn, setZeitSeitBeginn] = useState(2); // Stunden seit Trinkbeginn
  const [magenStatus, setMagenStatus] = useState<'nuchtern' | 'voll'>('voll');
  const [showAllGetraenke, setShowAllGetraenke] = useState(false);

  const ergebnis = useMemo(() => {
    // Berechne gesamten Alkohol in Gramm
    let gesamtAlkoholGramm = 0;
    
    Object.entries(getraenke).forEach(([id, anzahl]) => {
      if (anzahl > 0) {
        const getraenk = GETRAENKE.find(g => g.id === id);
        if (getraenk) {
          // Alkoholmenge = Volumen × Alkoholgehalt × Dichte
          const alkoholMl = getraenk.menge * (getraenk.alkoholgehalt / 100);
          const alkoholGramm = alkoholMl * WIDMARK.alkoholDichte;
          gesamtAlkoholGramm += alkoholGramm * anzahl;
        }
      }
    });

    // Reduktionsfaktor basierend auf Geschlecht
    const reduktionsfaktor = geschlecht === 'maennlich' ? WIDMARK.maennlich : WIDMARK.weiblich;

    // Resorptionsdefizit berücksichtigen (weniger bei leerem Magen)
    const resorption = magenStatus === 'nuchtern' ? 0.9 : (1 - WIDMARK.resorptionsdefizit);
    const resorbierterAlkohol = gesamtAlkoholGramm * resorption;

    // Widmark-Formel: BAK = A / (r × m)
    const bakMaximal = (resorbierterAlkohol / (reduktionsfaktor * gewicht));

    // Abbau über Zeit
    const abgebaut = zeitSeitBeginn * WIDMARK.abbauRate;
    const abgebautMin = zeitSeitBeginn * WIDMARK.abbauRateMin;
    const abgebautMax = zeitSeitBeginn * WIDMARK.abbauRateMax;

    // Aktueller BAK (kann nicht negativ werden)
    const bakAktuell = Math.max(0, bakMaximal - abgebaut);
    const bakAktuellMin = Math.max(0, bakMaximal - abgebautMax); // Worst case
    const bakAktuellMax = Math.max(0, bakMaximal - abgebautMin); // Best case

    // Zeit bis nüchtern (0,0 Promille)
    const stundenBisNuechtern = bakAktuell > 0 ? bakAktuell / WIDMARK.abbauRate : 0;
    const stundenBisNuechternMin = bakAktuellMin > 0 ? bakAktuellMin / WIDMARK.abbauRateMax : 0;
    const stundenBisNuechternMax = bakAktuellMax > 0 ? bakAktuellMax / WIDMARK.abbauRateMin : 0;

    // Zeit bis 0,5 Promille (Fahrgrenze)
    const promilleBis05 = bakAktuell - 0.5;
    const stundenBis05 = promilleBis05 > 0 ? promilleBis05 / WIDMARK.abbauRate : 0;

    // Kalorien aus Alkohol (7 kcal pro Gramm)
    const kalorien = Math.round(gesamtAlkoholGramm * 7);

    // Einschätzung
    let status: 'nuechtern' | 'leicht' | 'mittel' | 'stark' | 'gefaehrlich';
    let statusText: string;
    let statusColor: string;

    if (bakAktuell < 0.3) {
      status = 'nuechtern';
      statusText = 'Nüchtern / kaum merkbar';
      statusColor = 'green';
    } else if (bakAktuell < 0.5) {
      status = 'leicht';
      statusText = 'Leicht angetrunken';
      statusColor = 'yellow';
    } else if (bakAktuell < 1.0) {
      status = 'mittel';
      statusText = 'Deutlich alkoholisiert';
      statusColor = 'orange';
    } else if (bakAktuell < 2.0) {
      status = 'stark';
      statusText = 'Stark alkoholisiert';
      statusColor = 'red';
    } else {
      status = 'gefaehrlich';
      statusText = 'Gefährlicher Rausch!';
      statusColor = 'red';
    }

    // Rechtliche Einschätzung
    let fahrerlaubnis: 'erlaubt' | 'ordnungswidrigkeit' | 'straftat';
    let fahrerlaubnisText: string;

    if (bakAktuell < 0.5) {
      fahrerlaubnis = 'erlaubt';
      fahrerlaubnisText = 'Autofahren erlaubt (außer Fahranfänger)';
    } else if (bakAktuell < 1.1) {
      fahrerlaubnis = 'ordnungswidrigkeit';
      fahrerlaubnisText = 'Ordnungswidrigkeit! Bußgeld, Punkte, Fahrverbot drohen';
    } else {
      fahrerlaubnis = 'straftat';
      fahrerlaubnisText = 'Straftat! Führerscheinentzug, MPU erforderlich';
    }

    return {
      gesamtAlkoholGramm: Math.round(gesamtAlkoholGramm * 10) / 10,
      bakMaximal: Math.round(bakMaximal * 100) / 100,
      bakAktuell: Math.round(bakAktuell * 100) / 100,
      bakAktuellMin: Math.round(bakAktuellMin * 100) / 100,
      bakAktuellMax: Math.round(bakAktuellMax * 100) / 100,
      abgebaut: Math.round(abgebaut * 100) / 100,
      stundenBisNuechtern: Math.round(stundenBisNuechternMax * 10) / 10, // Konservativ
      stundenBis05: Math.round(stundenBis05 * 10) / 10,
      kalorien,
      status,
      statusText,
      statusColor,
      fahrerlaubnis,
      fahrerlaubnisText,
      anzahlGetraenke: Object.values(getraenke).reduce((a, b) => a + b, 0),
    };
  }, [geschlecht, gewicht, getraenke, zeitSeitBeginn, magenStatus]);

  const addGetraenk = (id: string) => {
    setGetraenke(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const removeGetraenk = (id: string) => {
    setGetraenke(prev => {
      const newValue = (prev[id] || 0) - 1;
      if (newValue <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newValue };
    });
  };

  const resetGetraenke = () => {
    setGetraenke({});
  };

  const formatPromille = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ‰';
  const formatZeit = (stunden: number) => {
    if (stunden < 1) return `${Math.round(stunden * 60)} Minuten`;
    const h = Math.floor(stunden);
    const m = Math.round((stunden - h) * 60);
    return m > 0 ? `${h} Std. ${m} Min.` : `${h} Stunden`;
  };

  const visibleGetraenke = showAllGetraenke ? GETRAENKE : GETRAENKE.filter(g => g.beliebt);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Warnung */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-bold text-red-800">Nur eine Schätzung!</h4>
            <p className="text-sm text-red-700 mt-1">
              Dieser Rechner liefert nur eine <strong>ungefähre Schätzung</strong>. Der tatsächliche 
              Blutalkoholgehalt hängt von vielen individuellen Faktoren ab. Im Zweifel: 
              <strong> Nicht fahren!</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Geschlecht */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Geschlecht</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGeschlecht('maennlich')}
              className={`p-4 rounded-xl text-center transition-all ${
                geschlecht === 'maennlich'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">👨</span>
              <div className="font-bold mt-1">Männlich</div>
              <div className="text-xs mt-1 opacity-80">Reduktionsfaktor: 0,68</div>
            </button>
            <button
              onClick={() => setGeschlecht('weiblich')}
              className={`p-4 rounded-xl text-center transition-all ${
                geschlecht === 'weiblich'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">👩</span>
              <div className="font-bold mt-1">Weiblich</div>
              <div className="text-xs mt-1 opacity-80">Reduktionsfaktor: 0,55</div>
            </button>
          </div>
        </div>

        {/* Körpergewicht */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Körpergewicht</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={gewicht}
              onChange={(e) => setGewicht(Math.max(40, Math.min(200, Number(e.target.value))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="40"
              max="200"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">kg</span>
          </div>
          <input
            type="range"
            value={gewicht}
            onChange={(e) => setGewicht(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
            min="40"
            max="150"
            step="1"
          />
        </div>

        {/* Magenstatus */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Mageninhalt</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMagenStatus('nuchtern')}
              className={`p-4 rounded-xl text-center transition-all ${
                magenStatus === 'nuchtern'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">🫙</span>
              <div className="font-bold mt-1">Nüchtern</div>
              <div className="text-xs mt-1 opacity-80">Schnellere Aufnahme</div>
            </button>
            <button
              onClick={() => setMagenStatus('voll')}
              className={`p-4 rounded-xl text-center transition-all ${
                magenStatus === 'voll'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">🍽️</span>
              <div className="font-bold mt-1">Gegessen</div>
              <div className="text-xs mt-1 opacity-80">Langsamere Aufnahme</div>
            </button>
          </div>
        </div>

        {/* Zeit seit Trinkbeginn */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Zeit seit dem ersten Getränk</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setZeitSeitBeginn(Math.max(0, zeitSeitBeginn - 0.5))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-gray-800">{zeitSeitBeginn}</span>
              <span className="text-gray-500 ml-2">Stunden</span>
            </div>
            <button
              onClick={() => setZeitSeitBeginn(Math.min(24, zeitSeitBeginn + 0.5))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              +
            </button>
          </div>
          <input
            type="range"
            value={zeitSeitBeginn}
            onChange={(e) => setZeitSeitBeginn(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
            min="0"
            max="12"
            step="0.5"
          />
        </div>
      </div>

      {/* Getränke Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">🍺 Was hast du getrunken?</h3>
          {ergebnis.anzahlGetraenke > 0 && (
            <button
              onClick={resetGetraenke}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Alle löschen
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {visibleGetraenke.map((g) => (
            <div 
              key={g.id}
              className={`relative rounded-xl p-3 text-center transition-all ${
                getraenke[g.id] > 0
                  ? 'bg-blue-50 border-2 border-blue-300'
                  : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
              }`}
            >
              <div className="text-2xl mb-1">{g.icon}</div>
              <div className="text-xs font-medium text-gray-700 leading-tight">{g.name}</div>
              <div className="text-[10px] text-gray-400">{g.alkoholgehalt}% Vol.</div>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  onClick={() => removeGetraenk(g.id)}
                  className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 text-lg font-bold disabled:opacity-30"
                  disabled={!getraenke[g.id]}
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-lg">
                  {getraenke[g.id] || 0}
                </span>
                <button
                  onClick={() => addGetraenk(g.id)}
                  className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAllGetraenke(!showAllGetraenke)}
          className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showAllGetraenke ? '← Weniger anzeigen' : `Mehr Getränke anzeigen (${GETRAENKE.length - visibleGetraenke.length} weitere) →`}
        </button>

        {ergebnis.anzahlGetraenke > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Alkohol konsumiert:</span>
              <span className="font-bold">{ergebnis.gesamtAlkoholGramm} g reiner Alkohol</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Kalorien aus Alkohol:</span>
              <span className="font-medium">{ergebnis.kalorien} kcal</span>
            </div>
          </div>
        )}
      </div>

      {/* Ergebnis */}
      {ergebnis.anzahlGetraenke > 0 && (
        <>
          {/* Haupt-Ergebnis */}
          <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
            ergebnis.bakAktuell < 0.3 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
            ergebnis.bakAktuell < 0.5 ? 'bg-gradient-to-br from-yellow-500 to-amber-600' :
            ergebnis.bakAktuell < 1.1 ? 'bg-gradient-to-br from-orange-500 to-red-500' :
            'bg-gradient-to-br from-red-600 to-red-800'
          }`}>
            <h3 className="text-sm font-medium opacity-80 mb-1">🩸 Geschätzter Blutalkohol</h3>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatPromille(ergebnis.bakAktuell)}</span>
              </div>
              <p className="text-lg mt-2 opacity-90">{ergebnis.statusText}</p>
              
              {ergebnis.bakAktuellMin !== ergebnis.bakAktuellMax && (
                <p className="text-sm mt-1 opacity-70">
                  Bereich: {formatPromille(ergebnis.bakAktuellMin)} – {formatPromille(ergebnis.bakAktuellMax)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Maximaler Wert</span>
                <div className="text-xl font-bold">{formatPromille(ergebnis.bakMaximal)}</div>
                <span className="text-xs opacity-60">direkt nach Trinken</span>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Bereits abgebaut</span>
                <div className="text-xl font-bold">{formatPromille(ergebnis.abgebaut)}</div>
                <span className="text-xs opacity-60">in {zeitSeitBeginn} Std.</span>
              </div>
            </div>
          </div>

          {/* Rechtliche Einschätzung */}
          <div className={`rounded-2xl p-6 mb-6 ${
            ergebnis.fahrerlaubnis === 'erlaubt' ? 'bg-green-50 border border-green-200' :
            ergebnis.fahrerlaubnis === 'ordnungswidrigkeit' ? 'bg-orange-50 border border-orange-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-bold mb-3 flex items-center gap-2 ${
              ergebnis.fahrerlaubnis === 'erlaubt' ? 'text-green-800' :
              ergebnis.fahrerlaubnis === 'ordnungswidrigkeit' ? 'text-orange-800' :
              'text-red-800'
            }`}>
              <span className="text-xl">
                {ergebnis.fahrerlaubnis === 'erlaubt' ? '✅' : ergebnis.fahrerlaubnis === 'ordnungswidrigkeit' ? '⚠️' : '🚫'}
              </span>
              Autofahren?
            </h3>
            <p className={`font-medium ${
              ergebnis.fahrerlaubnis === 'erlaubt' ? 'text-green-700' :
              ergebnis.fahrerlaubnis === 'ordnungswidrigkeit' ? 'text-orange-700' :
              'text-red-700'
            }`}>
              {ergebnis.fahrerlaubnisText}
            </p>
            
            {ergebnis.bakAktuell > 0 && (
              <div className="mt-4 space-y-2 text-sm">
                {ergebnis.bakAktuell >= 0.5 && ergebnis.stundenBis05 > 0 && (
                  <div className={`flex justify-between ${
                    ergebnis.fahrerlaubnis === 'erlaubt' ? 'text-green-600' :
                    ergebnis.fahrerlaubnis === 'ordnungswidrigkeit' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    <span>Zeit bis unter 0,5‰:</span>
                    <span className="font-bold">ca. {formatZeit(ergebnis.stundenBis05)}</span>
                  </div>
                )}
                <div className={`flex justify-between ${
                  ergebnis.fahrerlaubnis === 'erlaubt' ? 'text-green-600' :
                  ergebnis.fahrerlaubnis === 'ordnungswidrigkeit' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  <span>Zeit bis 0,0‰ (nüchtern):</span>
                  <span className="font-bold">ca. {formatZeit(ergebnis.stundenBisNuechtern)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Promille-Skala */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📊 Promille-Skala</h3>
            
            <div className="relative h-8 rounded-full overflow-hidden bg-gray-200 mb-4">
              {/* Farbige Bereiche */}
              <div className="absolute inset-y-0 left-0 w-[20%] bg-green-400" /> {/* 0-0.5 */}
              <div className="absolute inset-y-0 left-[20%] w-[20%] bg-yellow-400" /> {/* 0.5-1.0 */}
              <div className="absolute inset-y-0 left-[40%] w-[24%] bg-orange-400" /> {/* 1.0-1.6 */}
              <div className="absolute inset-y-0 left-[64%] w-[36%] bg-red-400" /> {/* 1.6+ */}
              
              {/* Marker für aktuellen Wert */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-gray-800 shadow-lg transition-all duration-300"
                style={{ left: `${Math.min(ergebnis.bakAktuell / 2.5 * 100, 100)}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold bg-gray-800 text-white px-2 py-1 rounded">
                  {formatPromille(ergebnis.bakAktuell)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>0‰</span>
              <span className="text-yellow-600 font-medium">0,5‰</span>
              <span className="text-orange-600 font-medium">1,1‰</span>
              <span className="text-red-600 font-medium">1,6‰</span>
              <span>2,5‰+</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-gray-600">Unter 0,5‰: Legal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-gray-600">0,5-1,0‰: Ordnungswidrigkeit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span className="text-gray-600">1,1-1,6‰: Straftat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-gray-600">Über 1,6‰: MPU erforderlich</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Promille-Grenzen in Deutschland</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
              <span className="text-2xl">🚗</span>
              <div className="text-sm">
                <p className="font-semibold text-red-800">0,0 ‰ – Fahranfänger & unter 21</p>
                <p className="text-red-700">Während der Probezeit gilt absolutes Alkoholverbot am Steuer.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
              <span className="text-2xl">⚠️</span>
              <div className="text-sm">
                <p className="font-semibold text-yellow-800">Ab 0,5 ‰ – Ordnungswidrigkeit</p>
                <p className="text-yellow-700">500€ Bußgeld, 2 Punkte, 1 Monat Fahrverbot. Bei Wiederholung höhere Strafen.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
              <span className="text-2xl">🚨</span>
              <div className="text-sm">
                <p className="font-semibold text-orange-800">Ab 1,1 ‰ – Straftat</p>
                <p className="text-orange-700">Absolute Fahruntüchtigkeit. Führerscheinentzug, Geldstrafe oder Freiheitsstrafe.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-red-100 rounded-xl">
              <span className="text-2xl">🔴</span>
              <div className="text-sm">
                <p className="font-semibold text-red-900">Ab 1,6 ‰ – MPU erforderlich</p>
                <p className="text-red-800">Medizinisch-Psychologische Untersuchung ("Idiotentest") ist Pflicht für Wiedererteilung.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auswirkungen */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">🧠 Typische Auswirkungen nach Promille</h3>
        <div className="space-y-3 text-sm text-blue-700">
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-white/50 rounded-xl p-3">
              <span className="font-semibold">0,3 ‰:</span> Leichte Enthemmung, vermindertes Sehvermögen
            </div>
            <div className="bg-white/50 rounded-xl p-3">
              <span className="font-semibold">0,5 ‰:</span> Konzentrationsschwäche, erhöhte Risikobereitschaft
            </div>
            <div className="bg-white/50 rounded-xl p-3">
              <span className="font-semibold">0,8 ‰:</span> Deutlich verlängerte Reaktionszeit, Tunnelblick
            </div>
            <div className="bg-white/50 rounded-xl p-3">
              <span className="font-semibold">1,0 ‰:</span> Gleichgewichtsstörungen, starke Enthemmung
            </div>
            <div className="bg-white/50 rounded-xl p-3">
              <span className="font-semibold">2,0 ‰:</span> Starke Orientierungsstörung, Übelkeit
            </div>
            <div className="bg-white/50 rounded-xl p-3">
              <span className="font-semibold">3,0 ‰+:</span> Lebensgefahr! Koma, Atemstillstand möglich
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Individuelle Faktoren:</strong> Alter, Medikamente, Müdigkeit, Gewöhnung beeinflussen die Wirkung stark</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kein Freibrief:</strong> Auch unter 0,5‰ kann bei Ausfallerscheinungen eine Strafe drohen</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Restalkohol am Morgen:</strong> Der Abbau dauert länger als oft gedacht – Vorsicht beim Autofahren!</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>"Nüchtern werden":</strong> Kaffee, Duschen oder frische Luft beschleunigen den Abbau NICHT</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Fahrrad:</strong> Auch beim Radfahren gelten Promillegrenzen (ab 1,6‰ Straftat)</span>
          </li>
        </ul>
      </div>

      {/* Widmark-Formel */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Widmark-Formel</h3>
        <div className="bg-gray-50 rounded-xl p-4 font-mono text-center text-lg mb-4">
          BAK = (A × 0,8) ÷ (r × Körpergewicht)
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li><strong>A</strong> = Alkoholmenge in ml</li>
          <li><strong>0,8</strong> = Dichte von Alkohol (g/ml)</li>
          <li><strong>r</strong> = Reduktionsfaktor (Männer: 0,68 / Frauen: 0,55)</li>
          <li><strong>Abbaurate:</strong> ca. 0,1–0,2 ‰ pro Stunde (Durchschnitt: 0,15‰)</li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden & Hilfe</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Bundeszentrale für gesundheitliche Aufklärung (BZgA)</p>
            <p className="text-sm text-blue-700 mt-1">Informationen zu Alkohol und Suchtprävention</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Kenn dein Limit</p>
                <a 
                  href="https://www.kenn-dein-limit.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  kenn-dein-limit.de →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Sucht-Hotline</p>
                <a href="tel:01805313031" className="text-blue-600 hover:underline font-mono">01805 - 31 30 31</a>
                <p className="text-xs text-gray-500">(14 ct/Min.)</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">🚨</span>
            <div>
              <p className="font-medium text-gray-800">Im Notfall</p>
              <p className="text-gray-600">Notruf <strong>112</strong> – Bei Bewusstlosigkeit oder Atemnot durch Alkohol sofort anrufen!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.bzga.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundeszentrale für gesundheitliche Aufklärung (BZgA)
          </a>
          <a 
            href="https://www.adac.de/verkehr/recht/verkehrsvorschriften-deutschland/promillegrenze/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Promillegrenzen in Deutschland
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/stvg/__24a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §24a StVG – 0,5-Promille-Grenze
          </a>
        </div>
      </div>
    </div>
  );
}
