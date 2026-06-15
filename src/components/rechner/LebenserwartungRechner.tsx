import { useState, useMemo } from 'react';

// Destatis GENERATIONENSTERBETAFEL (Kohortensterbetafel) für Deutschland, Geburtsjahrgänge 1923–2023.
// Fernere Lebenserwartung (ex) nach Alter und Geschlecht. Anders als die Periodensterbetafel (Momentaufnahme
// eines Kalenderjahres) berücksichtigt die Generationentafel den künftigen Rückgang der Sterblichkeit und
// unterschätzt die Lebenserwartung daher nicht systematisch.
// Werte als "Diagonale": für das aktuelle Alter x (Bezugsjahr 2026) wird der Geburtsjahrgang 2026−x verwendet
// (gekappt auf den jüngsten verfügbaren Jahrgang 2023).
// Quelle: Statistisches Bundesamt, Statistischer Bericht "Kohortensterbetafeln für Deutschland 1923–2023" (12621).
// VARIANTE 1 = konservativ (Sterblichkeitsrückgang endet 2070). VARIANTE 2 = anhaltender Rückgang (optimistisch).

// Variante 1 (konservativ) — Basis der Schätzung
const LEBENSERWARTUNG_MAENNER: Record<number, number> = {
  0: 80.8, 1: 80.0, 5: 76.0, 10: 71.0, 15: 66.0, 20: 60.9, 25: 55.9, 30: 50.9,
  35: 45.9, 40: 40.9, 45: 36.0, 50: 31.2, 55: 26.6, 60: 22.2, 65: 18.3,
  70: 14.6, 75: 11.3, 80: 8.3, 85: 5.7, 90: 3.7, 95: 2.5, 100: 1.8
};

const LEBENSERWARTUNG_FRAUEN: Record<number, number> = {
  0: 85.3, 1: 84.5, 5: 80.6, 10: 75.5, 15: 70.5, 20: 65.5, 25: 60.5, 30: 55.5,
  35: 50.5, 40: 45.5, 45: 40.5, 50: 35.6, 55: 30.7, 60: 26.0, 65: 21.6,
  70: 17.4, 75: 13.5, 80: 9.9, 85: 6.7, 90: 4.4, 95: 2.8, 100: 2.0
};

// Variante 2 (optimistisch, anhaltender Sterblichkeitsrückgang) — oberes Szenario des Spektrums
const LEBENSERWARTUNG_MAENNER_V2: Record<number, number> = {
  0: 89.8, 1: 89.0, 5: 84.8, 10: 79.1, 15: 73.4, 20: 67.7, 25: 62.1, 30: 56.4,
  35: 50.8, 40: 45.2, 45: 39.7, 50: 34.3, 55: 29.1, 60: 24.2, 65: 19.8,
  70: 15.7, 75: 12.0, 80: 8.7, 85: 5.9, 90: 3.8, 95: 2.5, 100: 1.8
};

const LEBENSERWARTUNG_FRAUEN_V2: Record<number, number> = {
  0: 92.8, 1: 92.0, 5: 87.9, 10: 82.4, 15: 76.8, 20: 71.3, 25: 65.8, 30: 60.3,
  35: 54.7, 40: 49.2, 45: 43.8, 50: 38.4, 55: 33.1, 60: 28.0, 65: 23.2,
  70: 18.6, 75: 14.3, 80: 10.4, 85: 7.0, 90: 4.5, 95: 2.9, 100: 2.0
};

// Interpolation der Lebenserwartung für jedes Alter
function interpoliereLebenswartung(alter: number, tabelle: Record<number, number>): number {
  const alterKeys = Object.keys(tabelle).map(Number).sort((a, b) => a - b);
  
  if (alter <= alterKeys[0]) return tabelle[alterKeys[0]];
  if (alter >= alterKeys[alterKeys.length - 1]) return tabelle[alterKeys[alterKeys.length - 1]];
  
  let lower = alterKeys[0];
  let upper = alterKeys[alterKeys.length - 1];
  
  for (let i = 0; i < alterKeys.length - 1; i++) {
    if (alter >= alterKeys[i] && alter < alterKeys[i + 1]) {
      lower = alterKeys[i];
      upper = alterKeys[i + 1];
      break;
    }
  }
  
  const ratio = (alter - lower) / (upper - lower);
  return tabelle[lower] + ratio * (tabelle[upper] - tabelle[lower]);
}

// Lebensstil-Faktoren und ihre Auswirkungen (in Jahren)
// Basierend auf epidemiologischen Studien und Meta-Analysen
const LEBENSSTIL_FAKTOREN = {
  rauchen: {
    nie: { jahre: 0, label: 'Nie geraucht' },
    ehemalig: { jahre: -2.5, label: 'Ehemaliger Raucher' },
    leicht: { jahre: -5, label: '1-10 Zigaretten/Tag' },
    mittel: { jahre: -7, label: '11-20 Zigaretten/Tag' },
    stark: { jahre: -10, label: 'Über 20 Zigaretten/Tag' },
  },
  sport: {
    kein: { jahre: -3, label: 'Kein Sport' },
    gelegentlich: { jahre: 0, label: '1-2× pro Woche' },
    regelmaessig: { jahre: 2, label: '3-4× pro Woche' },
    intensiv: { jahre: 3, label: '5+× pro Woche' },
  },
  bmi: {
    untergewicht: { jahre: -2, label: 'Untergewicht (< 18,5)' },
    normal: { jahre: 0, label: 'Normalgewicht (18,5-25)' },
    uebergewicht: { jahre: -1.5, label: 'Übergewicht (25-30)' },
    adipositas1: { jahre: -3, label: 'Adipositas I (30-35)' },
    adipositas2: { jahre: -5, label: 'Adipositas II/III (> 35)' },
  },
  alkohol: {
    kein: { jahre: 0, label: 'Kein Alkohol' },
    moderat: { jahre: 0.5, label: 'Moderat (≤1 Glas/Tag)' },
    erhoht: { jahre: -2, label: 'Erhöht (2-3 Gläser/Tag)' },
    stark: { jahre: -5, label: 'Stark (> 3 Gläser/Tag)' },
  },
  ernaehrung: {
    ungesund: { jahre: -3, label: 'Unausgewogen (viel Fast Food)' },
    durchschnitt: { jahre: 0, label: 'Durchschnittlich' },
    gesund: { jahre: 2, label: 'Gesund (viel Obst/Gemüse)' },
    mediterran: { jahre: 3, label: 'Mediterrane Ernährung' },
  },
  stress: {
    hoch: { jahre: -2, label: 'Dauerhaft hoher Stress' },
    mittel: { jahre: -0.5, label: 'Mittlerer Stress' },
    niedrig: { jahre: 0, label: 'Wenig Stress' },
    gut: { jahre: 1, label: 'Gute Work-Life-Balance' },
  },
  schlaf: {
    wenig: { jahre: -2, label: 'Weniger als 6 Stunden' },
    kurz: { jahre: -0.5, label: '6-7 Stunden' },
    optimal: { jahre: 0, label: '7-8 Stunden' },
    lang: { jahre: -0.5, label: 'Mehr als 9 Stunden' },
  },
  sozial: {
    isoliert: { jahre: -3, label: 'Sozial isoliert' },
    wenig: { jahre: -1, label: 'Wenige Kontakte' },
    normal: { jahre: 0, label: 'Normale Kontakte' },
    aktiv: { jahre: 2, label: 'Sehr aktives Sozialleben' },
  },
};

type RauchenKey = keyof typeof LEBENSSTIL_FAKTOREN.rauchen;
type SportKey = keyof typeof LEBENSSTIL_FAKTOREN.sport;
type BmiKey = keyof typeof LEBENSSTIL_FAKTOREN.bmi;
type AlkoholKey = keyof typeof LEBENSSTIL_FAKTOREN.alkohol;
type ErnaehrungKey = keyof typeof LEBENSSTIL_FAKTOREN.ernaehrung;
type StressKey = keyof typeof LEBENSSTIL_FAKTOREN.stress;
type SchlafKey = keyof typeof LEBENSSTIL_FAKTOREN.schlaf;
type SozialKey = keyof typeof LEBENSSTIL_FAKTOREN.sozial;

export default function LebenserwartungRechner() {
  const [alter, setAlter] = useState<number>(35);
  const [geschlecht, setGeschlecht] = useState<'mann' | 'frau'>('mann');
  const [rauchen, setRauchen] = useState<RauchenKey>('nie');
  const [sport, setSport] = useState<SportKey>('gelegentlich');
  const [bmi, setBmi] = useState<BmiKey>('normal');
  const [alkohol, setAlkohol] = useState<AlkoholKey>('moderat');
  const [ernaehrung, setErnaehrung] = useState<ErnaehrungKey>('durchschnitt');
  const [stress, setStress] = useState<StressKey>('mittel');
  const [schlaf, setSchlaf] = useState<SchlafKey>('optimal');
  const [sozial, setSozial] = useState<SozialKey>('normal');
  const [berechnet, setBerechnet] = useState(false);

  const ergebnis = useMemo(() => {
    if (alter < 0 || alter > 110) return null;

    // Basis-Lebenserwartung aus der Generationensterbetafel (Variante 1, konservativ)
    const tabelle = geschlecht === 'mann' ? LEBENSERWARTUNG_MAENNER : LEBENSERWARTUNG_FRAUEN;
    const basisErwartung = interpoliereLebenswartung(alter, tabelle);
    // Variante 2 (optimistisch) als oberes Szenario
    const tabelleV2 = geschlecht === 'mann' ? LEBENSERWARTUNG_MAENNER_V2 : LEBENSERWARTUNG_FRAUEN_V2;
    const basisErwartungV2 = interpoliereLebenswartung(alter, tabelleV2);
    
    // Lebensstil-Anpassungen berechnen
    const anpassungen = [
      { name: 'Rauchen', wert: LEBENSSTIL_FAKTOREN.rauchen[rauchen].jahre, label: LEBENSSTIL_FAKTOREN.rauchen[rauchen].label },
      { name: 'Sport', wert: LEBENSSTIL_FAKTOREN.sport[sport].jahre, label: LEBENSSTIL_FAKTOREN.sport[sport].label },
      { name: 'BMI', wert: LEBENSSTIL_FAKTOREN.bmi[bmi].jahre, label: LEBENSSTIL_FAKTOREN.bmi[bmi].label },
      { name: 'Alkohol', wert: LEBENSSTIL_FAKTOREN.alkohol[alkohol].jahre, label: LEBENSSTIL_FAKTOREN.alkohol[alkohol].label },
      { name: 'Ernährung', wert: LEBENSSTIL_FAKTOREN.ernaehrung[ernaehrung].jahre, label: LEBENSSTIL_FAKTOREN.ernaehrung[ernaehrung].label },
      { name: 'Stress', wert: LEBENSSTIL_FAKTOREN.stress[stress].jahre, label: LEBENSSTIL_FAKTOREN.stress[stress].label },
      { name: 'Schlaf', wert: LEBENSSTIL_FAKTOREN.schlaf[schlaf].jahre, label: LEBENSSTIL_FAKTOREN.schlaf[schlaf].label },
      { name: 'Soziale Kontakte', wert: LEBENSSTIL_FAKTOREN.sozial[sozial].jahre, label: LEBENSSTIL_FAKTOREN.sozial[sozial].label },
    ];
    
    const gesamtAnpassung = anpassungen.reduce((sum, a) => sum + a.wert, 0);
    
    // Angepasste Lebenserwartung (mit Ober- und Untergrenzen)
    const verbleibendeJahre = Math.max(0, basisErwartung + gesamtAnpassung);
    const geschaetztesAlter = Math.min(120, alter + verbleibendeJahre);

    // Optimistisches Szenario (Variante 2): gleiche Lebensstil-Anpassung auf die höhere Basis
    const verbleibendeJahreV2 = Math.max(0, basisErwartungV2 + gesamtAnpassung);
    const geschaetztesAlterV2 = Math.min(120, alter + verbleibendeJahreV2);

    // Vergleich mit dem statistischen Mittel (Generationensterbetafel V1, Lebenserwartung bei Geburt)
    const durchschnittErwartung = geschlecht === 'mann' ? 80.8 : 85.3;
    const differenzZuDurchschnitt = geschaetztesAlter - durchschnittErwartung;
    
    // Positive und negative Faktoren trennen
    const positiveFaktoren = anpassungen.filter(a => a.wert > 0);
    const negativeFaktoren = anpassungen.filter(a => a.wert < 0);
    const neutraleFaktoren = anpassungen.filter(a => a.wert === 0);
    
    return {
      basisErwartung,
      verbleibendeJahre,
      geschaetztesAlter,
      basisErwartungV2,
      verbleibendeJahreV2,
      geschaetztesAlterV2,
      gesamtAnpassung,
      anpassungen,
      positiveFaktoren,
      negativeFaktoren,
      neutraleFaktoren,
      durchschnittErwartung,
      differenzZuDurchschnitt,
    };
  }, [alter, geschlecht, rauchen, sport, bmi, alkohol, ernaehrung, stress, schlaf, sozial]);

  const formatNumber = (n: number, decimals = 1) => n.toFixed(decimals).replace('.', ',');
  const formatVorzeichen = (n: number) => (n >= 0 ? '+' : '') + formatNumber(n);

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  return (
    <div className="max-w-2xl mx-auto">

{/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Ihre Daten eingeben
        </h2>

        <div className="space-y-6">
          {/* Alter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aktuelles Alter (Jahre)
            </label>
            <input
              type="number"
              value={alter}
              onChange={(e) => setAlter(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              min={0}
              max={110}
            />
          </div>

          {/* Geschlecht */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geschlecht
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setGeschlecht('mann')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  geschlecht === 'mann'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mr-2">👨</span>
                Mann
              </button>
              <button
                onClick={() => setGeschlecht('frau')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  geschlecht === 'frau'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mr-2">👩</span>
                Frau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lebensstil-Faktoren */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">🏃</span>
          Lebensstil-Faktoren
        </h2>

        <div className="space-y-5">
          {/* Rauchen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🚬 Rauchen
            </label>
            <select
              value={rauchen}
              onChange={(e) => setRauchen(e.target.value as RauchenKey)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.entries(LEBENSSTIL_FAKTOREN.rauchen).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* Sport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏋️ Körperliche Aktivität
            </label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value as SportKey)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.entries(LEBENSSTIL_FAKTOREN.sport).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* BMI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚖️ Körpergewicht (BMI-Kategorie)
            </label>
            <select
              value={bmi}
              onChange={(e) => setBmi(e.target.value as BmiKey)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.entries(LEBENSSTIL_FAKTOREN.bmi).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* Alkohol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🍷 Alkoholkonsum
            </label>
            <select
              value={alkohol}
              onChange={(e) => setAlkohol(e.target.value as AlkoholKey)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.entries(LEBENSSTIL_FAKTOREN.alkohol).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* Ernährung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🥗 Ernährung
            </label>
            <select
              value={ernaehrung}
              onChange={(e) => setErnaehrung(e.target.value as ErnaehrungKey)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.entries(LEBENSSTIL_FAKTOREN.ernaehrung).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* Stress */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              😰 Stresslevel
            </label>
            <select
              value={stress}
              onChange={(e) => setStress(e.target.value as StressKey)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.entries(LEBENSSTIL_FAKTOREN.stress).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* Schlaf */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              😴 Durchschnittliche Schlafdauer
            </label>
            <select
              value={schlaf}
              onChange={(e) => setSchlaf(e.target.value as SchlafKey)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.entries(LEBENSSTIL_FAKTOREN.schlaf).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          {/* Soziale Kontakte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👥 Soziale Kontakte
            </label>
            <select
              value={sozial}
              onChange={(e) => setSozial(e.target.value as SozialKey)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {Object.entries(LEBENSSTIL_FAKTOREN.sozial).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleBerechnen}
          className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
        >
          Lebenserwartung berechnen
        </button>
      </div>

      {/* Ergebnis */}
      {berechnet && ergebnis && (
        <>
          {/* Haupt-Ergebnis */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Ihre geschätzte Lebenserwartung
            </h2>

            <div className="text-center mb-6">
              <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <div className="text-5xl font-bold">{formatNumber(ergebnis.geschaetztesAlter, 0)} Jahre</div>
                <div className="text-sm opacity-90">Geschätztes Lebensalter (Generationentafel, Variante 1)</div>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Optimistisches Szenario (Variante 2, anhaltender Sterblichkeitsrückgang):{' '}
                <strong className="text-gray-700">{formatNumber(ergebnis.geschaetztesAlterV2, 0)} Jahre</strong>.
                Destatis stellt beide Varianten als Spektrum dar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{formatNumber(ergebnis.verbleibendeJahre)}</div>
                <div className="text-sm text-blue-600">Verbleibende Jahre</div>
              </div>
              <div className={`rounded-xl p-4 text-center ${
                ergebnis.differenzZuDurchschnitt >= 0 ? 'bg-green-50' : 'bg-amber-50'
              }`}>
                <div className={`text-3xl font-bold ${
                  ergebnis.differenzZuDurchschnitt >= 0 ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {formatVorzeichen(ergebnis.differenzZuDurchschnitt)}
                </div>
                <div className={`text-sm ${
                  ergebnis.differenzZuDurchschnitt >= 0 ? 'text-green-600' : 'text-amber-600'
                }`}>vs. Durchschnitt ({formatNumber(ergebnis.durchschnittErwartung, 1)})</div>
              </div>
            </div>

            {/* Lebensstil-Einfluss */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Generationentafel-Basis (Alter {alter}, V1)</span>
                <span className="font-semibold text-gray-800">{formatNumber(ergebnis.basisErwartung)} Jahre</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lebensstil-Anpassung</span>
                <span className={`font-semibold ${
                  ergebnis.gesamtAnpassung >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatVorzeichen(ergebnis.gesamtAnpassung)} Jahre
                </span>
              </div>
            </div>
          </div>

          {/* Detailanalyse */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Einfluss Ihrer Lebensstil-Faktoren
            </h2>

            <div className="space-y-4">
              {/* Positive Faktoren */}
              {ergebnis.positiveFaktoren.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                    <span>✅</span> Positive Faktoren
                  </h3>
                  <div className="space-y-2">
                    {ergebnis.positiveFaktoren.map((f) => (
                      <div key={f.name} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <span className="font-medium text-green-800">{f.name}</span>
                          <span className="text-sm text-green-600 ml-2">({f.label})</span>
                        </div>
                        <span className="font-bold text-green-700">+{formatNumber(f.wert)} Jahre</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Negative Faktoren */}
              {ergebnis.negativeFaktoren.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
                    <span>⚠️</span> Negative Faktoren
                  </h3>
                  <div className="space-y-2">
                    {ergebnis.negativeFaktoren.map((f) => (
                      <div key={f.name} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <span className="font-medium text-red-800">{f.name}</span>
                          <span className="text-sm text-red-600 ml-2">({f.label})</span>
                        </div>
                        <span className="font-bold text-red-700">{formatNumber(f.wert)} Jahre</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Neutrale Faktoren */}
              {ergebnis.neutraleFaktoren.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <span>➖</span> Neutrale Faktoren
                  </h3>
                  <div className="space-y-2">
                    {ergebnis.neutraleFaktoren.map((f) => (
                      <div key={f.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-700">{f.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({f.label})</span>
                        </div>
                        <span className="font-bold text-gray-600">±0</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verbesserungspotenzial */}
          {ergebnis.negativeFaktoren.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Verbesserungspotenzial
              </h2>

              <div className="space-y-4">
                {ergebnis.negativeFaktoren.slice(0, 3).map((f) => {
                  let tipp = '';
                  switch (f.name) {
                    case 'Rauchen':
                      tipp = 'Ein Rauchstopp verbessert Ihre Lebenserwartung bereits nach wenigen Jahren deutlich.';
                      break;
                    case 'Sport':
                      tipp = 'Bereits 150 Minuten moderate Bewegung pro Woche können Ihr Leben verlängern.';
                      break;
                    case 'BMI':
                      tipp = 'Eine moderate Gewichtsreduktion durch ausgewogene Ernährung kann helfen.';
                      break;
                    case 'Alkohol':
                      tipp = 'Eine Reduktion des Alkoholkonsums senkt viele Gesundheitsrisiken.';
                      break;
                    case 'Ernährung':
                      tipp = 'Mehr Obst, Gemüse und Vollkornprodukte können Ihre Gesundheit verbessern.';
                      break;
                    case 'Stress':
                      tipp = 'Entspannungstechniken wie Meditation oder Yoga können Stress reduzieren.';
                      break;
                    case 'Schlaf':
                      tipp = 'Verbessern Sie Ihre Schlafhygiene für 7-8 Stunden erholsamen Schlaf.';
                      break;
                    case 'Soziale Kontakte':
                      tipp = 'Pflegen Sie Freundschaften – soziale Bindungen fördern die Gesundheit.';
                      break;
                  }
                  return (
                    <div key={f.name} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="font-semibold text-amber-800 mb-1">{f.name}: {f.label}</div>
                      <p className="text-sm text-amber-700">{tipp}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Statistik-Kontext */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📉</span>
              Statistischer Kontext (Deutschland)
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-700">80,8</div>
                  <div className="text-sm text-blue-600">Männer (Geburt, Generationentafel V1)</div>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-pink-700">85,3</div>
                  <div className="text-sm text-pink-600">Frauen (Geburt, Generationentafel V1)</div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Diese Werte stammen aus der <strong>Generationensterbetafel</strong> (Kohorte) und liegen
                  rund 2 Jahre über den oft zitierten Periodenwerten (78,3 / 83,2), weil die Generationentafel
                  den künftigen Rückgang der Sterblichkeit einrechnet. Im optimistischen Szenario (Variante 2)
                  erreichen heute Geborene sogar rund 90 (Männer) bzw. 93 Jahre (Frauen). Frauen leben im
                  Schnitt etwa 5 Jahre länger als Männer; Ihr Lebensstil kann diese Werte um mehrere Jahre
                  verschieben.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              Wichtiger Hinweis
            </h2>

            <div className="space-y-3 text-sm text-amber-700">
              <p>
                <strong>Dieser Rechner liefert eine statistische Schätzung</strong> basierend auf 
                Durchschnittswerten und epidemiologischen Studien. Er kann keine individuellen 
                Gesundheitszustände, genetische Faktoren oder unvorhergesehene Ereignisse berücksichtigen.
              </p>
              <p>
                Die angegebenen Lebensstil-Faktoren basieren auf wissenschaftlichen Meta-Analysen, 
                stellen aber vereinfachte Durchschnittswerte dar. Die tatsächliche Auswirkung auf 
                Ihre persönliche Lebenserwartung kann stark variieren.
              </p>
              <p>
                <strong>Dieser Rechner ersetzt keine ärztliche Beratung.</strong> Für individuelle 
                Gesundheitsfragen wenden Sie sich bitte an Ihren Arzt oder Ihre Ärztin.
              </p>
            </div>
          </div>

          {/* Methodik */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔬</span>
              Methodik
            </h2>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Datengrundlage</h3>
                <p>
                  Die Basis-Lebenserwartung stammt aus der <strong>Generationensterbetafel
                  (Kohortensterbetafel) des Statistischen Bundesamts (Destatis)</strong>, Geburtsjahrgänge
                  1923–2023. Anders als eine <em>Periodensterbetafel</em> – die nur die Sterblichkeit eines
                  einzelnen Kalenderjahres als Momentaufnahme abbildet und die Lebenserwartung dadurch
                  systematisch unterschätzt – rechnet die Generationentafel den künftigen Rückgang der
                  Sterblichkeit (Trend) mit ein. Für Ihr aktuelles Alter <em>x</em> verwenden wir den
                  zugehörigen Geburtsjahrgang (Bezugsjahr 2026, also Jahrgang 2026−<em>x</em>). Grundlage ist
                  die konservative <strong>Variante 1</strong>; die optimistische Variante 2 wird als oberes
                  Szenario ausgewiesen.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Lebensstil-Anpassungen</h3>
                <p>
                  Die Anpassungsfaktoren basieren auf epidemiologischen Studien und Meta-Analysen 
                  zu Risikofaktoren wie Rauchen, körperliche Aktivität, Ernährung und sozialen Faktoren. 
                  Die Werte sind vereinfachte Durchschnitte aus verschiedenen Publikationen.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Einschränkungen</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Genetische Faktoren werden nicht berücksichtigt</li>
                  <li>Bestehende Erkrankungen fließen nicht ein</li>
                  <li>Wechselwirkungen zwischen Faktoren werden vereinfacht</li>
                  <li>Sozioökonomische Unterschiede werden nicht erfasst</li>
                </ul>
              </div>
            </div>
          </div>
{/* Quellen */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Quellen
            </h2>

            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Sterbefaelle-Lebenserwartung/kohortensterbetafeln.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Statistisches Bundesamt – Generationensterbetafeln (Kohorte) 1923–2023
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Sterbefaelle-Lebenserwartung/_inhalt.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Statistisches Bundesamt – Sterbetafeln & Lebenserwartung
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.rki.de/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Robert Koch-Institut – Lebenserwartung in Deutschland
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.who.int/data/gho/data/themes/mortality-and-global-health-estimates/ghe-life-expectancy-and-healthy-life-expectancy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  WHO – Global Health Observatory: Life Expectancy
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://pubmed.ncbi.nlm.nih.gov/29712712/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  The Lancet – Impact of lifestyle factors on life expectancy
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
