import { useState, useMemo } from 'react';

const SCHWANGERSCHAFT_TAGE = 280; // 40 Wochen

interface Entwicklung {
  wochen: [number, number];
  groesse: string;
  gewicht: string;
  vergleich: string;
  entwicklung: string;
}

const ENTWICKLUNG: Entwicklung[] = [
  { wochen: [1, 4], groesse: '< 1 mm', gewicht: '< 1 g', vergleich: 'Mohnkorn', entwicklung: 'Einnistung der befruchteten Eizelle' },
  { wochen: [5, 5], groesse: '2 mm', gewicht: '< 1 g', vergleich: 'Sesamkorn', entwicklung: 'Herzschlag beginnt' },
  { wochen: [6, 6], groesse: '5 mm', gewicht: '< 1 g', vergleich: 'Linse', entwicklung: 'Neuralrohr schließt sich' },
  { wochen: [7, 7], groesse: '1 cm', gewicht: '< 1 g', vergleich: 'Blaubeere', entwicklung: 'Arme und Beine erkennbar' },
  { wochen: [8, 8], groesse: '1,5 cm', gewicht: '1 g', vergleich: 'Himbeere', entwicklung: 'Alle wichtigen Organe angelegt' },
  { wochen: [9, 9], groesse: '2,5 cm', gewicht: '2 g', vergleich: 'Olive', entwicklung: 'Fingerabdrücke entwickeln sich' },
  { wochen: [10, 10], groesse: '3 cm', gewicht: '4 g', vergleich: 'Kumquat', entwicklung: 'Geschlecht wird festgelegt' },
  { wochen: [11, 11], groesse: '4 cm', gewicht: '7 g', vergleich: 'Feige', entwicklung: 'Baby kann schlucken' },
  { wochen: [12, 12], groesse: '5 cm', gewicht: '14 g', vergleich: 'Limette', entwicklung: 'Ende 1. Trimester' },
  { wochen: [13, 13], groesse: '7 cm', gewicht: '25 g', vergleich: 'Pfirsich', entwicklung: 'Stimmbänder entwickeln sich' },
  { wochen: [14, 15], groesse: '9 cm', gewicht: '45 g', vergleich: 'Zitrone', entwicklung: 'Baby kann Grimassen schneiden' },
  { wochen: [16, 17], groesse: '12 cm', gewicht: '100 g', vergleich: 'Avocado', entwicklung: 'Geschlecht oft erkennbar' },
  { wochen: [18, 19], groesse: '14 cm', gewicht: '190 g', vergleich: 'Paprika', entwicklung: 'Erste Bewegungen spürbar' },
  { wochen: [20, 21], groesse: '25 cm', gewicht: '300 g', vergleich: 'Banane', entwicklung: 'Halbzeit der Schwangerschaft' },
  { wochen: [22, 23], groesse: '28 cm', gewicht: '430 g', vergleich: 'Kokosnuss', entwicklung: 'Hören ist möglich' },
  { wochen: [24, 25], groesse: '30 cm', gewicht: '600 g', vergleich: 'Maiskolben', entwicklung: 'Überlebensfähig bei Frühgeburt' },
  { wochen: [26, 27], groesse: '35 cm', gewicht: '900 g', vergleich: 'Salatkopf', entwicklung: 'Augen öffnen sich' },
  { wochen: [28, 29], groesse: '37 cm', gewicht: '1100 g', vergleich: 'Aubergine', entwicklung: 'Start 3. Trimester' },
  { wochen: [30, 31], groesse: '40 cm', gewicht: '1500 g', vergleich: 'Kohlkopf', entwicklung: 'Baby trainiert Atmung' },
  { wochen: [32, 33], groesse: '42 cm', gewicht: '1800 g', vergleich: 'Ananas', entwicklung: 'Knochen härten aus' },
  { wochen: [34, 35], groesse: '45 cm', gewicht: '2200 g', vergleich: 'Melone', entwicklung: 'Mutterschutz beginnt (SSW 34)' },
  { wochen: [36, 36], groesse: '47 cm', gewicht: '2700 g', vergleich: 'Honigmelone', entwicklung: 'Lunge fast ausgereift' },
  { wochen: [37, 38], groesse: '49 cm', gewicht: '3100 g', vergleich: 'Kürbis', entwicklung: 'Kein Frühchen mehr ab SSW 37' },
  { wochen: [39, 40], groesse: '51 cm', gewicht: '3400 g', vergleich: 'Wassermelone', entwicklung: 'Geburtsbereit!' },
  { wochen: [41, 42], groesse: '51 cm', gewicht: '3500 g', vergleich: 'Wassermelone', entwicklung: 'Übertragung' },
];

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function diffDays(date1: Date, date2: Date): number {
  return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDatum(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDatumKurz(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getEntwicklung(ssw: number): Entwicklung {
  const match = ENTWICKLUNG.find(e => ssw >= e.wochen[0] && ssw <= e.wochen[1]);
  return match || ENTWICKLUNG[0];
}

export default function SSWRechner() {
  const [berechnungsModus, setBerechnungsModus] = useState<'lmp' | 'ssw'>('lmp');
  
  // Mode 1: LMP (letzte Periode)
  const [lmpDatum, setLmpDatum] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 70); // ~10 Wochen zurück
    return d.toISOString().split('T')[0];
  });
  
  // Mode 2: Bekannte SSW
  const [bekannteSSW, setBekannteSSW] = useState(10);
  const [bekannteTage, setBekannteTage] = useState(0);
  const [sswDatum, setSswDatum] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const ergebnis = useMemo(() => {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    
    let lmp: Date;
    
    if (berechnungsModus === 'lmp') {
      lmp = new Date(lmpDatum);
    } else {
      // Modus: SSW bekannt - rückrechnen
      const sswStichtag = new Date(sswDatum);
      const schwangerschaftstageAmStichtag = bekannteSSW * 7 + bekannteTage;
      lmp = addDays(sswStichtag, -schwangerschaftstageAmStichtag);
    }
    
    // ET berechnen
    const et = addDays(lmp, SCHWANGERSCHAFT_TAGE);
    
    // Aktuelle SSW berechnen
    const schwangerschaftstage = diffDays(lmp, heute);
    const ssw = Math.floor(schwangerschaftstage / 7);
    const tage = schwangerschaftstage % 7;
    
    // Verbleibende Tage
    const verbleibendeTage = diffDays(heute, et);
    
    // Trimester
    let trimester: 1 | 2 | 3;
    let trimesterName: string;
    let trimesterBeschreibung: string;
    if (ssw < 13) {
      trimester = 1;
      trimesterName = 'Erstes Trimester';
      trimesterBeschreibung = 'SSW 1-12 – Alle Organe werden angelegt';
    } else if (ssw < 28) {
      trimester = 2;
      trimesterName = 'Zweites Trimester';
      trimesterBeschreibung = 'SSW 13-27 – Baby wächst und bewegt sich';
    } else {
      trimester = 3;
      trimesterName = 'Drittes Trimester';
      trimesterBeschreibung = 'SSW 28-40 – Endspurt zur Geburt';
    }
    
    // Fortschritt
    const fortschritt = Math.min(100, Math.max(0, (schwangerschaftstage / SCHWANGERSCHAFT_TAGE) * 100));
    
    // Entwicklung
    const entwicklung = getEntwicklung(ssw);
    
    // Wichtige Daten
    const empfaengnis = addDays(lmp, 14);
    const mutterschutzStart = addDays(et, -42); // 6 Wochen vor ET
    const fruehestens = addDays(et, -14);
    const spaetestens = addDays(et, 14);
    
    // Trimester-Daten
    const trimester1Ende = addDays(lmp, 12 * 7);
    const trimester2Ende = addDays(lmp, 27 * 7);
    
    // Ist aktuell schwanger?
    const istSchwanger = schwangerschaftstage >= 0 && schwangerschaftstage <= SCHWANGERSCHAFT_TAGE + 14;
    const istZukunft = schwangerschaftstage < 0;
    
    return {
      lmp,
      et,
      ssw: Math.max(0, ssw),
      tage: tage >= 0 ? tage : 0,
      verbleibendeTage,
      trimester,
      trimesterName,
      trimesterBeschreibung,
      fortschritt,
      schwangerschaftstage,
      entwicklung,
      empfaengnis,
      mutterschutzStart,
      fruehestens,
      spaetestens,
      trimester1Ende,
      trimester2Ende,
      istSchwanger,
      istZukunft,
    };
  }, [berechnungsModus, lmpDatum, bekannteSSW, bekannteTage, sswDatum]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Berechnungsmodus */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wie möchtest du berechnen?</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setBerechnungsModus('lmp')}
              className={`p-4 rounded-xl text-center transition-all ${
                berechnungsModus === 'lmp'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-1">🩸</div>
              <div className="font-bold">Letzte Periode</div>
              <div className="text-xs mt-1 opacity-80">Erster Tag eingeben</div>
            </button>
            <button
              onClick={() => setBerechnungsModus('ssw')}
              className={`p-4 rounded-xl text-center transition-all ${
                berechnungsModus === 'ssw'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-1">📋</div>
              <div className="font-bold">SSW bekannt</div>
              <div className="text-xs mt-1 opacity-80">Vom Arzt / Ultraschall</div>
            </button>
          </div>
        </div>

        {/* Eingabefelder je nach Modus */}
        {berechnungsModus === 'lmp' ? (
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Erster Tag deiner letzten Periode</span>
            </label>
            <input
              type="date"
              value={lmpDatum}
              onChange={(e) => setLmpDatum(e.target.value)}
              className="w-full text-xl font-medium py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Deine aktuelle SSW (vom Arzt)</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-500 block mb-1">Wochen</label>
                  <select
                    value={bekannteSSW}
                    onChange={(e) => setBekannteSSW(Number(e.target.value))}
                    className="w-full text-xl font-medium py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
                  >
                    {Array.from({ length: 43 }, (_, i) => (
                      <option key={i} value={i}>SSW {i}</option>
                    ))}
                  </select>
                </div>
                <span className="text-2xl text-gray-400 mt-6">+</span>
                <div className="w-24">
                  <label className="text-sm text-gray-500 block mb-1">Tage</label>
                  <select
                    value={bekannteTage}
                    onChange={(e) => setBekannteTage(Number(e.target.value))}
                    className="w-full text-xl font-medium py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
                  >
                    {Array.from({ length: 7 }, (_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Datum der SSW-Feststellung</span>
                <span className="text-xs text-gray-500 ml-2">(z.B. Ultraschalltermin)</span>
              </label>
              <input
                type="date"
                value={sswDatum}
                onChange={(e) => setSswDatum(e.target.value)}
                className="w-full text-lg font-medium py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Hauptergebnis: Aktuelle SSW */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-pink-100 mb-1">Aktuelle Schwangerschaftswoche</h3>
        
        {ergebnis.istSchwanger ? (
          <>
            <div className="text-5xl font-bold mb-2">
              SSW {ergebnis.ssw}+{ergebnis.tage}
            </div>
            <p className="text-pink-100 mb-4">
              {ergebnis.schwangerschaftstage}. Schwangerschaftstag
            </p>
            
            {/* Fortschrittsbalken */}
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-pink-100">{ergebnis.trimesterName}</span>
                <span className="font-bold">{Math.round(ergebnis.fortschritt)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${ergebnis.fortschritt}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-pink-200">
                <span>0</span>
                <span className="text-center">{ergebnis.trimesterBeschreibung}</span>
                <span>40</span>
              </div>
            </div>
            
            {ergebnis.verbleibendeTage > 0 && (
              <div className="mt-4 text-center">
                <span className="text-pink-100">Noch </span>
                <span className="text-3xl font-bold">{ergebnis.verbleibendeTage}</span>
                <span className="text-pink-100"> Tage bis zum ET</span>
              </div>
            )}
          </>
        ) : ergebnis.istZukunft ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-pink-100">Das eingegebene Datum liegt in der Zukunft.</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">👶</div>
            <p className="text-pink-100">Der errechnete Geburtstermin ist bereits vorbei.</p>
          </div>
        )}
      </div>

      {/* Errechneter Geburtstermin */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📅</span>
          Errechneter Geburtstermin (ET)
        </h3>
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700 mb-1">
            {formatDatum(ergebnis.et)}
          </p>
          <p className="text-sm text-green-600">
            Geburtszeitraum: {formatDatumKurz(ergebnis.fruehestens)} – {formatDatumKurz(ergebnis.spaetestens)}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          ℹ️ Nur ~4% der Babys kommen am errechneten ET zur Welt
        </p>
      </div>

      {/* Baby-Entwicklung */}
      {ergebnis.istSchwanger && ergebnis.ssw >= 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">
            👶 Dein Baby in SSW {ergebnis.ssw}
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="text-3xl mb-2">📏</div>
              <div className="text-xl font-bold text-pink-600">{ergebnis.entwicklung.groesse}</div>
              <div className="text-xs text-gray-500">Größe</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="text-3xl mb-2">⚖️</div>
              <div className="text-xl font-bold text-pink-600">{ergebnis.entwicklung.gewicht}</div>
              <div className="text-xs text-gray-500">Gewicht</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-4">
              <div className="text-3xl mb-2">🍎</div>
              <div className="text-xl font-bold text-pink-600">{ergebnis.entwicklung.vergleich}</div>
              <div className="text-xs text-gray-500">Größenvergleich</div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-blue-800 text-center">
              <strong>Entwicklung:</strong> {ergebnis.entwicklung.entwicklung}
            </p>
          </div>
        </div>
      )}

      {/* Trimester-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Trimester-Übersicht</h3>
        <div className="space-y-3">
          <div className={`p-4 rounded-xl border-2 ${
            ergebnis.trimester === 1 
              ? 'bg-pink-50 border-pink-400' 
              : ergebnis.ssw >= 13 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ergebnis.ssw >= 13 ? '✅' : ergebnis.trimester === 1 ? '👉' : '⏳'}</span>
                <div>
                  <p className="font-medium">1. Trimester</p>
                  <p className="text-xs text-gray-500">SSW 1-12</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">bis {formatDatumKurz(ergebnis.trimester1Ende)}</span>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border-2 ${
            ergebnis.trimester === 2 
              ? 'bg-pink-50 border-pink-400' 
              : ergebnis.ssw >= 28 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ergebnis.ssw >= 28 ? '✅' : ergebnis.trimester === 2 ? '👉' : '⏳'}</span>
                <div>
                  <p className="font-medium">2. Trimester</p>
                  <p className="text-xs text-gray-500">SSW 13-27</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">bis {formatDatumKurz(ergebnis.trimester2Ende)}</span>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border-2 ${
            ergebnis.trimester === 3 
              ? 'bg-pink-50 border-pink-400' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ergebnis.trimester === 3 ? '👉' : '⏳'}</span>
                <div>
                  <p className="font-medium">3. Trimester</p>
                  <p className="text-xs text-gray-500">SSW 28-40</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">bis {formatDatumKurz(ergebnis.et)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Termine */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Wichtige Termine</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">🩸</span>
              <span className="text-gray-700">Letzte Periode (LMP)</span>
            </div>
            <span className="font-medium">{formatDatumKurz(ergebnis.lmp)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <span className="text-gray-700">Wahrsch. Empfängnis</span>
            </div>
            <span className="font-medium">{formatDatumKurz(ergebnis.empfaengnis)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏠</span>
              <span className="text-purple-700 font-medium">Mutterschutz beginnt</span>
            </div>
            <span className="font-bold text-purple-700">{formatDatumKurz(ergebnis.mutterschutzStart)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-3">
              <span className="text-xl">👶</span>
              <span className="text-green-700 font-medium">Errechneter Geburtstermin</span>
            </div>
            <span className="font-bold text-green-700">{formatDatumKurz(ergebnis.et)}</span>
          </div>
        </div>
      </div>

      {/* Info-Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die SSW-Berechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>SSW-Zählung:</strong> Beginnt am 1. Tag der letzten Periode – nicht ab Empfängnis!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Schreibweise:</strong> „SSW 10+3" bedeutet 10. Woche + 3 Tage (also 73. Schwangerschaftstag)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>40 Wochen:</strong> Eine Schwangerschaft dauert ca. 40 Wochen oder 280 Tage ab LMP</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Ultraschall:</strong> Im 1. Trimester kann der Arzt die SSW per Ultraschall genauer bestimmen</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Nur ein Schätzwert!</p>
              <p className="text-yellow-700">Die Berechnung basiert auf einer durchschnittlichen Zykluslänge von 28 Tagen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">🩺</span>
            <div>
              <p className="font-medium text-blue-800">Ultraschall ist genauer</p>
              <p className="text-blue-700">Im ersten Trimester kann der Arzt die SSW per Scheitel-Steiß-Länge (SSL) genauer bestimmen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-medium text-green-800">Vorsorgeuntersuchungen</p>
              <p className="text-green-700">Bis SSW 32 alle 4 Wochen, danach alle 2 Wochen. Drei Ultraschalluntersuchungen sind im Standard enthalten.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SSW-Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 SSW im Überblick</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-2">SSW</th>
                <th className="text-left py-2 px-2">Größe</th>
                <th className="text-left py-2 px-2">Gewicht</th>
                <th className="text-left py-2 px-2 hidden sm:table-cell">Vergleich</th>
              </tr>
            </thead>
            <tbody>
              {[4, 8, 12, 16, 20, 24, 28, 32, 36, 40].map((woche) => {
                const entw = getEntwicklung(woche);
                const istAktuell = ergebnis.ssw === woche;
                return (
                  <tr 
                    key={woche} 
                    className={`border-b ${istAktuell ? 'bg-pink-50 font-medium' : ''}`}
                  >
                    <td className="py-2 px-2">
                      {woche}
                      {istAktuell && <span className="ml-1 text-pink-500">←</span>}
                    </td>
                    <td className="py-2 px-2">{entw.groesse}</td>
                    <td className="py-2 px-2">{entw.gewicht}</td>
                    <td className="py-2 px-2 hidden sm:table-cell">{entw.vergleich}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.familienplanung.de/schwangerschaft/schwangerschaftswochen-im-ueberblick/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BZgA Familienplanung – Schwangerschaftswochen
          </a>
          <a 
            href="https://www.frauenaerzte-im-netz.de/schwangerschaft-geburt/schwangerschaft/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Frauenärzte im Netz – Schwangerschaft
          </a>
          <a 
            href="https://www.bmfsfj.de/bmfsfj/themen/familie/familienleistungen/mutterschutz"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMFSFJ – Mutterschutz
          </a>
        </div>
      </div>
    </div>
  );
}
