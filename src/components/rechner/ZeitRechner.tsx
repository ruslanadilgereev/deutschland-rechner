import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

type Modus = 'addieren' | 'differenz';

interface ZeitEingabe {
  stunden: number;
  minuten: number;
  sekunden: number;
}

const MODI = [
  {
    id: 'addieren' as const,
    icon: '➕',
    title: 'Zeit addieren/subtrahieren',
    subtitle: 'Mehrere Zeitwerte zusammenrechnen',
    beispiel: '2:30 + 1:45 = 4:15',
  },
  {
    id: 'differenz' as const,
    icon: '↔️',
    title: 'Zeitdifferenz berechnen',
    subtitle: 'Zeit zwischen zwei Uhrzeiten',
    beispiel: '08:00 bis 17:30 = 9:30',
  },
];

export default function ZeitRechner() {
  const [modus, setModus] = useState<Modus>('addieren');

  // Modus: Addieren/Subtrahieren
  const [zeitListe, setZeitListe] = useState<{ zeit: ZeitEingabe; operation: '+' | '-' }[]>([
    { zeit: { stunden: 0, minuten: 0, sekunden: 0 }, operation: '+' },
    { zeit: { stunden: 0, minuten: 0, sekunden: 0 }, operation: '+' },
  ]);

  // Modus: Differenz
  const [startZeit, setStartZeit] = useState<ZeitEingabe>({ stunden: 8, minuten: 0, sekunden: 0 });
  const [endZeit, setEndZeit] = useState<ZeitEingabe>({ stunden: 17, minuten: 30, sekunden: 0 });
  const [ueberMitternacht, setUeberMitternacht] = useState(false);

  // Hilfsfunktionen
  const zeitZuSekunden = (zeit: ZeitEingabe): number => {
    return zeit.stunden * 3600 + zeit.minuten * 60 + zeit.sekunden;
  };

  const sekundenZuZeit = (gesamtSekunden: number): { stunden: number; minuten: number; sekunden: number; negativ: boolean } => {
    const negativ = gesamtSekunden < 0;
    const absolutSekunden = Math.abs(gesamtSekunden);
    const stunden = Math.floor(absolutSekunden / 3600);
    const minuten = Math.floor((absolutSekunden % 3600) / 60);
    const sekunden = absolutSekunden % 60;
    return { stunden, minuten, sekunden, negativ };
  };

  const formatZeit = (stunden: number, minuten: number, sekunden: number, mitSekunden = true, negativ = false): string => {
    const prefix = negativ ? '-' : '';
    const h = String(stunden).padStart(2, '0');
    const m = String(minuten).padStart(2, '0');
    const s = String(sekunden).padStart(2, '0');
    return mitSekunden ? `${prefix}${h}:${m}:${s}` : `${prefix}${h}:${m}`;
  };

  // Berechnung: Addition/Subtraktion
  const ergebnisAddition = useMemo(() => {
    let gesamtSekunden = 0;
    const schritte: string[] = [];

    zeitListe.forEach((eintrag, index) => {
      const sekunden = zeitZuSekunden(eintrag.zeit);
      const zeitStr = formatZeit(eintrag.zeit.stunden, eintrag.zeit.minuten, eintrag.zeit.sekunden);

      if (index === 0) {
        gesamtSekunden = sekunden;
        schritte.push(`Startwert: ${zeitStr}`);
      } else {
        if (eintrag.operation === '+') {
          gesamtSekunden += sekunden;
          schritte.push(`+ ${zeitStr}`);
        } else {
          gesamtSekunden -= sekunden;
          schritte.push(`- ${zeitStr}`);
        }
      }
    });

    const ergebnis = sekundenZuZeit(gesamtSekunden);

    return {
      ...ergebnis,
      gesamtSekunden,
      schritte,
    };
  }, [zeitListe]);

  // Berechnung: Differenz
  const ergebnisDifferenz = useMemo(() => {
    let startSekunden = zeitZuSekunden(startZeit);
    let endSekunden = zeitZuSekunden(endZeit);

    // Über Mitternacht: 24 Stunden addieren
    if (ueberMitternacht && endSekunden < startSekunden) {
      endSekunden += 24 * 3600;
    }

    const differenzSekunden = endSekunden - startSekunden;
    const ergebnis = sekundenZuZeit(differenzSekunden);

    // Dezimalstunden berechnen
    const dezimalStunden = differenzSekunden / 3600;

    return {
      ...ergebnis,
      gesamtSekunden: differenzSekunden,
      dezimalStunden,
    };
  }, [startZeit, endZeit, ueberMitternacht]);

  // Zeiteingabe-Komponente
  const ZeitInput = ({
    zeit,
    onChange,
    label,
  }: {
    zeit: ZeitEingabe;
    onChange: (zeit: ZeitEingabe) => void;
    label?: string;
  }) => (
    <div>
      {label && <label className="text-sm text-gray-600 block mb-2">{label}</label>}
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <input
            type="number"
            min="0"
            max="999"
            value={zeit.stunden}
            onChange={(e) => onChange({ ...zeit, stunden: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full px-3 py-3 text-lg font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <span className="text-xs text-gray-400 block text-center mt-1">Std</span>
        </div>
        <span className="text-2xl font-bold text-gray-400 pb-5">:</span>
        <div className="flex-1">
          <input
            type="number"
            min="0"
            max="59"
            value={zeit.minuten}
            onChange={(e) => onChange({ ...zeit, minuten: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
            className="w-full px-3 py-3 text-lg font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <span className="text-xs text-gray-400 block text-center mt-1">Min</span>
        </div>
        <span className="text-2xl font-bold text-gray-400 pb-5">:</span>
        <div className="flex-1">
          <input
            type="number"
            min="0"
            max="59"
            value={zeit.sekunden}
            onChange={(e) => onChange({ ...zeit, sekunden: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
            className="w-full px-3 py-3 text-lg font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <span className="text-xs text-gray-400 block text-center mt-1">Sek</span>
        </div>
      </div>
    </div>
  );

  // Zeile hinzufügen
  const zeileHinzufuegen = () => {
    setZeitListe([...zeitListe, { zeit: { stunden: 0, minuten: 0, sekunden: 0 }, operation: '+' }]);
  };

  // Zeile entfernen
  const zeileEntfernen = (index: number) => {
    if (zeitListe.length > 2) {
      setZeitListe(zeitListe.filter((_, i) => i !== index));
    }
  };

  // Zeit-Operation ändern
  const operationAendern = (index: number, operation: '+' | '-') => {
    const neueZeitListe = [...zeitListe];
    neueZeitListe[index].operation = operation;
    setZeitListe(neueZeitListe);
  };

  // Zeit-Wert ändern
  const zeitAendern = (index: number, zeit: ZeitEingabe) => {
    const neueZeitListe = [...zeitListe];
    neueZeitListe[index].zeit = zeit;
    setZeitListe(neueZeitListe);
  };

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Zeit-Rechner" rechnerSlug="zeit-rechner" />

{/* Modus Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-gray-700 font-medium mb-3">Berechnungsart</label>
        <div className="space-y-3">
          {MODI.map((m) => (
            <button
              key={m.id}
              onClick={() => setModus(m.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                modus === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
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
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    modus === m.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}
                >
                  {modus === m.id && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Eingabefelder: Addition/Subtraktion */}
      {modus === 'addieren' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📝 Zeiten eingeben</h3>

          <div className="space-y-4">
            {zeitListe.map((eintrag, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => operationAendern(index, '+')}
                          className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                            eintrag.operation === '+'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          +
                        </button>
                        <button
                          onClick={() => operationAendern(index, '-')}
                          className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                            eintrag.operation === '-'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          −
                        </button>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-600">
                      {index === 0 ? 'Startwert' : `Zeit ${index + 1}`}
                    </span>
                  </div>
                  {index > 1 && (
                    <button
                      onClick={() => zeileEntfernen(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕ Entfernen
                    </button>
                  )}
                </div>
                <ZeitInput zeit={eintrag.zeit} onChange={(zeit) => zeitAendern(index, zeit)} />
              </div>
            ))}
          </div>

          <button
            onClick={zeileHinzufuegen}
            className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Weitere Zeit hinzufügen</span>
          </button>
        </div>
      )}

      {/* Eingabefelder: Differenz */}
      {modus === 'differenz' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📝 Start- und Endzeit eingeben</h3>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <ZeitInput
                zeit={startZeit}
                onChange={setStartZeit}
                label="🟢 Startzeit (z.B. Arbeitsbeginn)"
              />
            </div>

            <div className="flex justify-center">
              <span className="text-2xl text-gray-400">↓</span>
            </div>

            <div className="p-4 bg-red-50 rounded-xl">
              <ZeitInput
                zeit={endZeit}
                onChange={setEndZeit}
                label="🔴 Endzeit (z.B. Arbeitsende)"
              />
            </div>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={ueberMitternacht}
                onChange={(e) => setUeberMitternacht(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-700">Über Mitternacht</span>
                <p className="text-xs text-gray-500">z.B. 22:00 bis 06:00 (Nachtschicht)</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Ergebnis: Addition */}
      {modus === 'addieren' && (
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium text-blue-100 mb-2">Ergebnis</h3>

          <div className="text-4xl font-bold mb-1">
            {ergebnisAddition.negativ && <span className="text-red-300">−</span>}
            {formatZeit(ergebnisAddition.stunden, ergebnisAddition.minuten, ergebnisAddition.sekunden)}
          </div>
          <div className="text-blue-200 text-sm mb-4">
            {ergebnisAddition.stunden > 0 && `${ergebnisAddition.stunden} Stunden, `}
            {ergebnisAddition.minuten} Minuten, {ergebnisAddition.sekunden} Sekunden
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="space-y-1 text-sm">
              {ergebnisAddition.schritte.map((schritt, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-blue-200">{schritt}</span>
                </div>
              ))}
              <div className="border-t border-white/20 pt-2 mt-2 flex justify-between items-center">
                <span className="font-medium">= Summe</span>
                <span className="text-xl font-bold">
                  {ergebnisAddition.negativ && '−'}
                  {formatZeit(ergebnisAddition.stunden, ergebnisAddition.minuten, ergebnisAddition.sekunden)}
                </span>
              </div>
            </div>
          </div>

          {/* Zusätzliche Umrechnungen */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-blue-200 text-xs">In Dezimalstunden</div>
              <div className="font-bold">
                {(Math.abs(ergebnisAddition.gesamtSekunden) / 3600).toLocaleString('de-DE', {
                  maximumFractionDigits: 2,
                })}{' '}
                h
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-blue-200 text-xs">In Minuten</div>
              <div className="font-bold">
                {Math.round(Math.abs(ergebnisAddition.gesamtSekunden) / 60).toLocaleString('de-DE')} min
              </div>
            </div>
          </div>
        </div>
)}

      {/* Ergebnis: Differenz */}
      {modus === 'differenz' && (
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium text-purple-100 mb-2">Zeitdifferenz</h3>

          <div className="text-4xl font-bold mb-1">
            {ergebnisDifferenz.negativ && <span className="text-red-300">−</span>}
            {formatZeit(ergebnisDifferenz.stunden, ergebnisDifferenz.minuten, ergebnisDifferenz.sekunden)}
          </div>
          <div className="text-purple-200 text-sm mb-4">
            {ergebnisDifferenz.stunden > 0 && `${ergebnisDifferenz.stunden} Stunden, `}
            {ergebnisDifferenz.minuten} Minuten, {ergebnisDifferenz.sekunden} Sekunden
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-200">Von</span>
              <span className="font-semibold">
                {formatZeit(startZeit.stunden, startZeit.minuten, startZeit.sekunden, false)} Uhr
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-200">Bis</span>
              <span className="font-semibold">
                {formatZeit(endZeit.stunden, endZeit.minuten, endZeit.sekunden, false)} Uhr
                {ueberMitternacht && endZeit.stunden < startZeit.stunden && (
                  <span className="text-xs ml-1">(+1 Tag)</span>
                )}
              </span>
            </div>
            {ergebnisDifferenz.negativ && (
              <div className="text-yellow-200 text-xs mt-2">
                ⚠️ Negative Zeit: Endzeit liegt vor Startzeit
              </div>
            )}
          </div>

          {/* Zusätzliche Umrechnungen */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-purple-200 text-xs">Dezimalstunden</div>
              <div className="font-bold">
                {Math.abs(ergebnisDifferenz.dezimalStunden).toLocaleString('de-DE', {
                  maximumFractionDigits: 2,
                })}{' '}
                h
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-purple-200 text-xs">In Minuten</div>
              <div className="font-bold">
                {Math.round(Math.abs(ergebnisDifferenz.gesamtSekunden) / 60).toLocaleString('de-DE')} min
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Umrechnungstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔄 Dezimalstunden-Umrechnung</h3>
        <p className="text-sm text-gray-600 mb-4">
          Für Arbeitszeiterfassung werden oft Dezimalstunden verwendet. Hier die häufigsten Umrechnungen:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Minuten</th>
                <th className="text-center py-2 text-gray-600">Dezimal</th>
                <th className="text-left py-2 text-gray-600 pl-4">Minuten</th>
                <th className="text-center py-2 text-gray-600">Dezimal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                [5, 0.08, 35, 0.58],
                [10, 0.17, 40, 0.67],
                [15, 0.25, 45, 0.75],
                [20, 0.33, 50, 0.83],
                [25, 0.42, 55, 0.92],
                [30, 0.5, 60, 1.0],
              ].map(([min1, dez1, min2, dez2]) => (
                <tr key={min1} className="hover:bg-gray-50">
                  <td className="py-2 font-medium">{min1} min</td>
                  <td className="py-2 text-center text-blue-600">{dez1} h</td>
                  <td className="py-2 font-medium pl-4">{min2} min</td>
                  <td className="py-2 text-center text-blue-600">{dez2} h</td>
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
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">💼</span>
            <div>
              <p className="font-medium text-blue-800">Arbeitszeit berechnen</p>
              <p className="text-blue-700">08:00 bis 17:30 mit 45 Min Pause</p>
              <p className="text-blue-600 text-xs mt-1">→ 9:30 − 0:45 = 8:45 (8,75 Stunden)</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🏃</span>
            <div>
              <p className="font-medium text-green-800">Trainingszeit addieren</p>
              <p className="text-green-700">Laufen 45:30 + Dehnen 15:00</p>
              <p className="text-green-600 text-xs mt-1">→ 1:00:30 Gesamttraining</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">🌙</span>
            <div>
              <p className="font-medium text-purple-800">Nachtschicht</p>
              <p className="text-purple-700">22:00 bis 06:00 (über Mitternacht)</p>
              <p className="text-purple-600 text-xs mt-1">→ 8:00 Stunden Arbeitszeit</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">🎬</span>
            <div>
              <p className="font-medium text-yellow-800">Videoschnitt</p>
              <p className="text-yellow-700">Clip 1: 2:34, Clip 2: 5:12, Clip 3: 3:45</p>
              <p className="text-yellow-600 text-xs mt-1">→ Gesamtlänge: 11:31</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formeln */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📐 Formeln</h3>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Zeit in Sekunden umrechnen:</p>
            <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-xs">
              Sekunden = Stunden × 3600 + Minuten × 60 + Sekunden
            </code>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Dezimalstunden berechnen:</p>
            <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-xs">
              Dezimalstunden = Stunden + (Minuten ÷ 60) + (Sekunden ÷ 3600)
            </code>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Minuten in Dezimal:</p>
            <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-xs">
              15 Minuten = 15 ÷ 60 = 0,25 Stunden
            </code>
          </div>
        </div>
      </div>

      {/* Tipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧠 Tipps zur Zeiterfassung</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">Arbeitszeitgesetz beachten</p>
            <p>Max. 8 Stunden täglich, Verlängerung auf 10 Stunden möglich mit Ausgleich.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">Pausenregelung</p>
            <p>Ab 6 Stunden: 30 Min Pause. Ab 9 Stunden: 45 Min Pause.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">Dezimalstunden für Lohnabrechnung</p>
            <p>Viele Arbeitgeber rechnen in Dezimalstunden (z.B. 7,5h statt 7:30).</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">Ruhezeit</p>
            <p>Mindestens 11 Stunden ununterbrochene Ruhezeit zwischen Arbeitstagen.</p>
          </div>
        </div>
      </div>

      {/* Schnellrechner für Dezimalstunden */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚡ Schnell-Umrechnung</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600 mb-2 font-medium">Vollzeit pro Woche</p>
            <p className="text-2xl font-bold text-blue-700">40:00</p>
            <p className="text-sm text-blue-600">= 40,0 Dezimalstunden</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="text-xs text-green-600 mb-2 font-medium">Halbtags pro Tag</p>
            <p className="text-2xl font-bold text-green-700">04:00</p>
            <p className="text-sm text-green-600">= 4,0 Dezimalstunden</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="text-xs text-purple-600 mb-2 font-medium">Standard-Arbeitstag</p>
            <p className="text-2xl font-bold text-purple-700">08:00</p>
            <p className="text-sm text-purple-600">= 8,0 Dezimalstunden</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="text-xs text-orange-600 mb-2 font-medium">Mit 30 Min Pause</p>
            <p className="text-2xl font-bold text-orange-700">07:30</p>
            <p className="text-sm text-orange-600">= 7,5 Dezimalstunden</p>
          </div>
        </div>
      </div>
{/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Rechtliche Grundlagen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/arbzg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Arbeitszeitgesetz (ArbZG)
          </a>
          <a
            href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Arbeitszeit/arbeitszeit.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMAS – Arbeitszeit
          </a>
          <a
            href="https://www.dgb.de/service/ratgeber/arbeitszeit/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DGB – Ratgeber Arbeitszeit
          </a>
        </div>
      </div>
    </div>
  );
}
