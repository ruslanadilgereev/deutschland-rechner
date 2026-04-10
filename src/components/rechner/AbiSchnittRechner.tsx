import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

interface Kurs {
  id: string;
  name: string;
  punkte: number | '';
  typ: 'grundkurs' | 'leistungskurs';
  halbjahr: 1 | 2 | 3 | 4;
}

interface Pruefung {
  id: string;
  name: string;
  punkte: number | '';
  typ: 'schriftlich' | 'muendlich';
  nummer: 1 | 2 | 3 | 4 | 5;
}

// Punkte zu Note Umrechnung (0-15 Punkte → 1.0-6.0)
const punkteZuNote = (punkte: number): number => {
  if (punkte >= 15) return 1.0;
  if (punkte >= 14) return 1.0;
  if (punkte >= 13) return 1.3;
  if (punkte >= 12) return 1.7;
  if (punkte >= 11) return 2.0;
  if (punkte >= 10) return 2.3;
  if (punkte >= 9) return 2.7;
  if (punkte >= 8) return 3.0;
  if (punkte >= 7) return 3.3;
  if (punkte >= 6) return 3.7;
  if (punkte >= 5) return 4.0;
  if (punkte >= 4) return 4.3;
  if (punkte >= 3) return 4.7;
  if (punkte >= 2) return 5.0;
  if (punkte >= 1) return 5.3;
  return 6.0;
};

// Formel für Abi-Durchschnitt aus Gesamtpunktzahl
const gesamtpunkteZuNote = (punkte: number, maxPunkte: number): number => {
  // Offizielle Formel: N = 17/3 - (P × 17) / (3 × Pmax)
  const note = (17 / 3) - (punkte * 17) / (3 * maxPunkte);
  return Math.max(1.0, Math.min(4.0, Math.round(note * 10) / 10));
};

// NC-Grenzen für beliebte Studiengänge (Durchschnittswerte)
const NC_GRENZEN = [
  { studiengang: 'Medizin', nc: 1.0, info: 'Sehr streng, zusätzlich TMS & Auswahlgespräche' },
  { studiengang: 'Zahnmedizin', nc: 1.2, info: 'Ähnlich streng wie Medizin' },
  { studiengang: 'Tiermedizin', nc: 1.3, info: 'Wenige Studienplätze bundesweit' },
  { studiengang: 'Pharmazie', nc: 1.5, info: 'Variiert stark nach Uni' },
  { studiengang: 'Psychologie', nc: 1.4, info: 'Sehr beliebt, hoher NC' },
  { studiengang: 'Rechtswissenschaft', nc: 1.8, info: 'An Top-Unis strenger' },
  { studiengang: 'BWL', nc: 2.0, info: 'Abhängig von Hochschule' },
  { studiengang: 'Lehramt (Grundschule)', nc: 2.2, info: 'Variiert nach Bundesland' },
  { studiengang: 'Informatik', nc: 2.5, info: 'Oft zulassungsfrei' },
  { studiengang: 'Ingenieurwissenschaften', nc: 'frei', info: 'Meist zulassungsfrei' },
];

// Punkte-Tabelle
const PUNKTE_TABELLE = [
  { punkte: 15, note: '1+', wert: 0.7 },
  { punkte: 14, note: '1', wert: 1.0 },
  { punkte: 13, note: '1-', wert: 1.3 },
  { punkte: 12, note: '2+', wert: 1.7 },
  { punkte: 11, note: '2', wert: 2.0 },
  { punkte: 10, note: '2-', wert: 2.3 },
  { punkte: 9, note: '3+', wert: 2.7 },
  { punkte: 8, note: '3', wert: 3.0 },
  { punkte: 7, note: '3-', wert: 3.3 },
  { punkte: 6, note: '4+', wert: 3.7 },
  { punkte: 5, note: '4', wert: 4.0 },
  { punkte: 4, note: '4-', wert: 4.3 },
  { punkte: 3, note: '5+', wert: 4.7 },
  { punkte: 2, note: '5', wert: 5.0 },
  { punkte: 1, note: '5-', wert: 5.3 },
  { punkte: 0, note: '6', wert: 6.0 },
];

const FAECHER_VORSCHLAEGE = [
  'Deutsch', 'Mathematik', 'Englisch', 'Französisch', 'Spanisch', 'Latein',
  'Physik', 'Chemie', 'Biologie', 'Geschichte', 'Geographie', 'Politik/SoWi',
  'Kunst', 'Musik', 'Sport', 'Religion/Ethik', 'Informatik', 'Philosophie',
];

type Modus = 'schnell' | 'detail' | 'tabelle';

export default function AbiSchnittRechner() {
  const [modus, setModus] = useState<Modus>('schnell');
  
  // Schnellrechner State
  const [schnellPunkte, setSchnellPunkte] = useState<number | ''>('');
  const [schnellMaxPunkte, setSchnellMaxPunkte] = useState<number>(900);
  
  // Detail-Rechner State
  const [kurse, setKurse] = useState<Kurs[]>([
    { id: '1', name: 'LK 1', punkte: '', typ: 'leistungskurs', halbjahr: 1 },
    { id: '2', name: 'LK 2', punkte: '', typ: 'leistungskurs', halbjahr: 1 },
  ]);
  const [pruefungen, setPruefungen] = useState<Pruefung[]>([
    { id: 'p1', name: 'LK 1 (schriftlich)', punkte: '', typ: 'schriftlich', nummer: 1 },
    { id: 'p2', name: 'LK 2 (schriftlich)', punkte: '', typ: 'schriftlich', nummer: 2 },
    { id: 'p3', name: 'GK (schriftlich)', punkte: '', typ: 'schriftlich', nummer: 3 },
    { id: 'p4', name: 'GK (mündlich)', punkte: '', typ: 'muendlich', nummer: 4 },
    { id: 'p5', name: 'Präsentation/mündl.', punkte: '', typ: 'muendlich', nummer: 5 },
  ]);
  
  // Tabellen-Konverter State
  const [einzelPunkte, setEinzelPunkte] = useState<number | ''>('');

  // Schnellrechner Ergebnis
  const schnellErgebnis = useMemo(() => {
    if (schnellPunkte === '' || schnellPunkte < 300) return null;
    const note = gesamtpunkteZuNote(schnellPunkte, schnellMaxPunkte);
    return { punkte: schnellPunkte, note };
  }, [schnellPunkte, schnellMaxPunkte]);

  // Detail-Rechner Ergebnis
  const detailErgebnis = useMemo(() => {
    const gueltigeKurse = kurse.filter(k => k.punkte !== '' && k.punkte >= 0 && k.punkte <= 15);
    const gueltigePruefungen = pruefungen.filter(p => p.punkte !== '' && p.punkte >= 0 && p.punkte <= 15);
    
    if (gueltigeKurse.length === 0 && gueltigePruefungen.length === 0) return null;
    
    // Kurspunkte (LK zählen doppelt)
    let kursPunkte = 0;
    gueltigeKurse.forEach(k => {
      const faktor = k.typ === 'leistungskurs' ? 2 : 1;
      kursPunkte += (k.punkte as number) * faktor;
    });
    
    // Prüfungspunkte (4-fach oder 5-fach gewertet je nach Bundesland)
    let pruefungsPunkte = 0;
    gueltigePruefungen.forEach(p => {
      pruefungsPunkte += (p.punkte as number) * 4; // Standard: 4-fach
    });
    
    const gesamtPunkte = kursPunkte + pruefungsPunkte;
    
    // Maximalpunkte berechnen (vereinfacht)
    const maxKursPunkte = gueltigeKurse.reduce((sum, k) => {
      const faktor = k.typ === 'leistungskurs' ? 2 : 1;
      return sum + 15 * faktor;
    }, 0);
    const maxPruefungsPunkte = gueltigePruefungen.length * 15 * 4;
    const maxPunkte = maxKursPunkte + maxPruefungsPunkte;
    
    if (maxPunkte === 0) return null;
    
    const note = gesamtpunkteZuNote(gesamtPunkte, maxPunkte);
    
    return {
      kursPunkte,
      pruefungsPunkte,
      gesamtPunkte,
      maxPunkte,
      note,
      anzahlKurse: gueltigeKurse.length,
      anzahlPruefungen: gueltigePruefungen.length,
    };
  }, [kurse, pruefungen]);

  // Einzelpunkte-Konvertierung
  const einzelErgebnis = useMemo(() => {
    if (einzelPunkte === '' || einzelPunkte < 0 || einzelPunkte > 15) return null;
    const eintrag = PUNKTE_TABELLE.find(e => e.punkte === einzelPunkte);
    return eintrag || null;
  }, [einzelPunkte]);

  // Hilfsfunktionen
  const addKurs = () => {
    setKurse([
      ...kurse,
      {
        id: Date.now().toString(),
        name: `Kurs ${kurse.length + 1}`,
        punkte: '',
        typ: 'grundkurs',
        halbjahr: 1,
      },
    ]);
  };

  const removeKurs = (id: string) => {
    if (kurse.length > 1) {
      setKurse(kurse.filter(k => k.id !== id));
    }
  };

  const updateKurs = (id: string, field: keyof Kurs, value: string | number) => {
    setKurse(kurse.map(k => {
      if (k.id === id) {
        if (field === 'punkte') {
          const numValue = value === '' ? '' : Math.min(15, Math.max(0, Number(value)));
          return { ...k, punkte: numValue };
        }
        return { ...k, [field]: value };
      }
      return k;
    }));
  };

  const updatePruefung = (id: string, field: keyof Pruefung, value: string | number) => {
    setPruefungen(pruefungen.map(p => {
      if (p.id === id) {
        if (field === 'punkte') {
          const numValue = value === '' ? '' : Math.min(15, Math.max(0, Number(value)));
          return { ...p, punkte: numValue };
        }
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const getNoteFarbe = (note: number): string => {
    if (note <= 1.5) return 'text-green-600';
    if (note <= 2.0) return 'text-lime-600';
    if (note <= 2.5) return 'text-yellow-600';
    if (note <= 3.0) return 'text-orange-500';
    if (note <= 3.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getNoteBgFarbe = (note: number): string => {
    if (note <= 1.5) return 'bg-green-500';
    if (note <= 2.0) return 'bg-lime-500';
    if (note <= 2.5) return 'bg-yellow-500';
    if (note <= 3.0) return 'bg-orange-400';
    if (note <= 3.5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPunkteFarbe = (punkte: number): string => {
    if (punkte >= 13) return 'bg-green-500';
    if (punkte >= 10) return 'bg-lime-500';
    if (punkte >= 7) return 'bg-yellow-500';
    if (punkte >= 5) return 'bg-orange-500';
    if (punkte >= 1) return 'bg-red-500';
    return 'bg-red-700';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Modus-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setModus('schnell')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              modus === 'schnell'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⚡ Schnellrechner
          </button>
          <button
            onClick={() => setModus('detail')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              modus === 'detail'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📊 Detailrechner
          </button>
          <button
            onClick={() => setModus('tabelle')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              modus === 'tabelle'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📋 Punkte-Tabelle
          </button>
        </div>
      </div>

      {/* Schnellrechner */}
      {modus === 'schnell' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">⚡ Schnelle Abi-Berechnung</h3>
            <p className="text-sm text-gray-500 mb-6">
              Gib deine erreichte Gesamtpunktzahl ein, um deinen Abi-Schnitt zu berechnen.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deine erreichte Punktzahl
                </label>
                <input
                  type="number"
                  value={schnellPunkte}
                  onChange={(e) => setSchnellPunkte(e.target.value === '' ? '' : Number(e.target.value))}
                  min={300}
                  max={900}
                  placeholder="z.B. 680"
                  className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Minimum: 300 Punkte (bestanden) • Maximum: {schnellMaxPunkte} Punkte
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximal erreichbare Punktzahl
                </label>
                <select
                  value={schnellMaxPunkte}
                  onChange={(e) => setSchnellMaxPunkte(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                >
                  <option value={900}>900 Punkte (Standard)</option>
                  <option value={840}>840 Punkte</option>
                  <option value={660}>660 Punkte (Berufliches Gymnasium)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schnellrechner Ergebnis */}
          {schnellErgebnis ? (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
              <h3 className="text-sm font-medium text-indigo-100 mb-4">Dein Abitur-Durchschnitt</h3>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-7xl font-bold">
                    {schnellErgebnis.note.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </span>
                </div>
                <div className="mt-3 text-indigo-200">
                  {schnellErgebnis.punkte} von {schnellMaxPunkte} Punkten ({((schnellErgebnis.punkte / schnellMaxPunkte) * 100).toFixed(1)}%)
                </div>
              </div>

              {/* Visuelle Skala */}
              <div className="relative mb-4">
                <div className="flex justify-between text-xs text-indigo-200 mb-1">
                  <span>1,0 (super!)</span>
                  <span>4,0 (bestanden)</span>
                </div>
                <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getNoteBgFarbe(schnellErgebnis.note)} transition-all duration-500`}
                    style={{ width: `${((4 - schnellErgebnis.note) / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Bewertung */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center">
                {schnellErgebnis.note <= 1.2 && (
                  <>
                    <div className="text-2xl mb-1">🏆</div>
                    <p className="font-medium">Herausragend! Fast alle Türen stehen dir offen.</p>
                  </>
                )}
                {schnellErgebnis.note > 1.2 && schnellErgebnis.note <= 1.5 && (
                  <>
                    <div className="text-2xl mb-1">🌟</div>
                    <p className="font-medium">Sehr gut! Top-Leistung mit vielen Möglichkeiten.</p>
                  </>
                )}
                {schnellErgebnis.note > 1.5 && schnellErgebnis.note <= 2.0 && (
                  <>
                    <div className="text-2xl mb-1">👏</div>
                    <p className="font-medium">Gut! Solide Basis für viele Studiengänge.</p>
                  </>
                )}
                {schnellErgebnis.note > 2.0 && schnellErgebnis.note <= 2.5 && (
                  <>
                    <div className="text-2xl mb-1">👍</div>
                    <p className="font-medium">Befriedigend. Viele Studiengänge sind offen.</p>
                  </>
                )}
                {schnellErgebnis.note > 2.5 && schnellErgebnis.note <= 3.0 && (
                  <>
                    <div className="text-2xl mb-1">✓</div>
                    <p className="font-medium">Geschafft! Fokus auf zulassungsfreie Studiengänge.</p>
                  </>
                )}
                {schnellErgebnis.note > 3.0 && (
                  <>
                    <div className="text-2xl mb-1">📝</div>
                    <p className="font-medium">Bestanden. Informiere dich über Wartesemester & Alternativen.</p>
                  </>
                )}
              </div>
            </div>
          ) : schnellPunkte !== '' && schnellPunkte < 300 ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <p className="font-bold text-red-800">Mindestens 300 Punkte erforderlich</p>
                  <p className="text-sm text-red-600">Mit weniger als 300 Punkten gilt das Abitur als nicht bestanden.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-2xl p-8 text-center mb-6">
              <div className="text-4xl mb-3">🎓</div>
              <p className="text-gray-600">Gib deine Punktzahl ein, um deinen Abi-Schnitt zu berechnen.</p>
            </div>
          )}
        </>
      )}

      {/* Detailrechner */}
      {modus === 'detail' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">📚 Kurse der Qualifikationsphase</h3>
            <p className="text-sm text-gray-500 mb-4">
              Trage deine Kurse und Punkte ein. Leistungskurse (LK) zählen doppelt.
            </p>
            
            <div className="space-y-3">
              {kurse.map((kurs, index) => (
                <div key={kurs.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full shrink-0">
                    {index + 1}
                  </span>
                  
                  <input
                    type="text"
                    value={kurs.name}
                    onChange={(e) => updateKurs(kurs.id, 'name', e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="Fachname"
                  />
                  
                  <select
                    value={kurs.typ}
                    onChange={(e) => updateKurs(kurs.id, 'typ', e.target.value)}
                    className={`w-20 px-2 py-2 border rounded-lg text-xs font-bold focus:outline-none ${
                      kurs.typ === 'leistungskurs' 
                        ? 'border-purple-300 bg-purple-50 text-purple-700' 
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <option value="grundkurs">GK</option>
                    <option value="leistungskurs">LK ×2</option>
                  </select>
                  
                  <select
                    value={kurs.punkte}
                    onChange={(e) => updateKurs(kurs.id, 'punkte', e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm font-bold text-center focus:outline-none ${
                      kurs.punkte !== '' ? getNoteFarbe(punkteZuNote(kurs.punkte)) : 'text-gray-400'
                    }`}
                  >
                    <option value="">Pkt</option>
                    {Array.from({ length: 16 }, (_, i) => 15 - i).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => removeKurs(kurs.id)}
                    className={`p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors ${
                      kurse.length === 1 ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
                    disabled={kurse.length === 1}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {FAECHER_VORSCHLAEGE.filter(f => !kurse.find(k => k.name === f)).slice(0, 6).map(fach => (
                <button
                  key={fach}
                  onClick={() => {
                    setKurse([...kurse, {
                      id: Date.now().toString(),
                      name: fach,
                      punkte: '',
                      typ: 'grundkurs',
                      halbjahr: 1,
                    }]);
                  }}
                  className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  + {fach}
                </button>
              ))}
              <button
                onClick={addKurs}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                + Weiterer Kurs
              </button>
            </div>
          </div>

          {/* Abiturprüfungen */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">✍️ Abiturprüfungen</h3>
            <p className="text-sm text-gray-500 mb-4">
              5 Prüfungen, jede zählt 4-fach. (Je nach Bundesland können Regeln variieren.)
            </p>
            
            <div className="space-y-3">
              {pruefungen.map((pruefung) => (
                <div key={pruefung.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <span className={`w-8 h-8 flex items-center justify-center text-white text-xs font-bold rounded-full shrink-0 ${
                    pruefung.typ === 'schriftlich' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    P{pruefung.nummer}
                  </span>
                  
                  <input
                    type="text"
                    value={pruefung.name}
                    onChange={(e) => updatePruefung(pruefung.id, 'name', e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="Prüfungsfach"
                  />
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                    pruefung.typ === 'schriftlich' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {pruefung.typ === 'schriftlich' ? '📝 schr.' : '🗣️ mdl.'}
                  </span>
                  
                  <select
                    value={pruefung.punkte}
                    onChange={(e) => updatePruefung(pruefung.id, 'punkte', e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm font-bold text-center focus:outline-none ${
                      pruefung.punkte !== '' ? getNoteFarbe(punkteZuNote(pruefung.punkte)) : 'text-gray-400'
                    }`}
                  >
                    <option value="">Pkt</option>
                    {Array.from({ length: 16 }, (_, i) => 15 - i).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  
                  <span className="text-xs text-gray-400 w-8 text-right">×4</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Ergebnis */}
          {detailErgebnis ? (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
              <h3 className="text-sm font-medium text-indigo-100 mb-4">Zwischenergebnis</h3>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-6xl font-bold">
                    {detailErgebnis.note.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                  <div className="text-xl font-bold">{detailErgebnis.kursPunkte}</div>
                  <div className="text-xs text-indigo-200">Kurspunkte ({detailErgebnis.anzahlKurse} Kurse)</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                  <div className="text-xl font-bold">{detailErgebnis.pruefungsPunkte}</div>
                  <div className="text-xs text-indigo-200">Prüfungspunkte ({detailErgebnis.anzahlPruefungen}×4)</div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold">{detailErgebnis.gesamtPunkte} / {detailErgebnis.maxPunkte}</div>
                <div className="text-sm text-indigo-200">Gesamtpunkte</div>
              </div>
              
              <p className="text-xs text-indigo-200 mt-4 text-center">
                ℹ️ Dies ist eine Schätzung. Die genaue Berechnung variiert je nach Bundesland.
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-2xl p-8 text-center mb-6">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-gray-600">Trage Kurse und Prüfungen ein, um deinen Schnitt zu berechnen.</p>
            </div>
          )}
        </>
      )}

      {/* Tabellen-Modus */}
      {modus === 'tabelle' && (
        <>
          {/* Einzelpunkt-Konverter */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">🔢 Punkte → Note Umrechnung</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Punkte (0-15)</label>
                <input
                  type="number"
                  value={einzelPunkte}
                  onChange={(e) => setEinzelPunkte(e.target.value === '' ? '' : Math.min(15, Math.max(0, Number(e.target.value))))}
                  min={0}
                  max={15}
                  placeholder="z.B. 12"
                  className="w-full px-4 py-3 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>
              
              <div className="text-3xl text-gray-400">=</div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <div className={`w-full px-4 py-3 text-xl font-bold text-center border-2 rounded-xl ${
                  einzelErgebnis ? `border-gray-200 ${getNoteFarbe(einzelErgebnis.wert)}` : 'border-gray-100 text-gray-300'
                }`}>
                  {einzelErgebnis ? einzelErgebnis.note : '—'}
                </div>
              </div>
            </div>
            
            {einzelErgebnis && (
              <div className={`p-3 rounded-xl text-center ${getPunkteFarbe(einzelErgebnis.punkte)} text-white`}>
                <span className="font-medium">{einzelErgebnis.punkte} Punkte = Note {einzelErgebnis.note} (≈ {einzelErgebnis.wert.toFixed(1)})</span>
              </div>
            )}
          </div>

          {/* Vollständige Tabelle */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📋 Vollständige Punkte-Tabelle</h3>
            
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Punkte</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">Note</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">Notenwert</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Bewertung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PUNKTE_TABELLE.map((eintrag) => (
                    <tr 
                      key={eintrag.punkte} 
                      className={`hover:bg-gray-50 ${einzelPunkte === eintrag.punkte ? 'bg-indigo-50' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className={`inline-flex w-10 h-10 ${getPunkteFarbe(eintrag.punkte)} rounded-lg items-center justify-center text-white font-bold`}>
                          {eintrag.punkte}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-lg">{eintrag.note}</td>
                      <td className={`py-3 px-4 text-center font-medium ${getNoteFarbe(eintrag.wert)}`}>
                        {eintrag.wert.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {eintrag.punkte >= 13 && 'sehr gut'}
                        {eintrag.punkte >= 10 && eintrag.punkte < 13 && 'gut'}
                        {eintrag.punkte >= 7 && eintrag.punkte < 10 && 'befriedigend'}
                        {eintrag.punkte >= 4 && eintrag.punkte < 7 && 'ausreichend'}
                        {eintrag.punkte >= 1 && eintrag.punkte < 4 && 'mangelhaft'}
                        {eintrag.punkte === 0 && 'ungenügend'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* NC-Check */}
      {(schnellErgebnis || detailErgebnis) && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">🎯 NC-Check: Was kannst du studieren?</h3>
          
          <div className="space-y-2">
            {NC_GRENZEN.map((studium) => {
              const note = schnellErgebnis?.note || detailErgebnis?.note || 4.0;
              const erfuellt = studium.nc === 'frei' || (typeof studium.nc === 'number' && note <= studium.nc);
              
              return (
                <div 
                  key={studium.studiengang}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    erfuellt ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-lg ${
                    erfuellt ? 'bg-green-500 text-white' : 'bg-gray-200'
                  }`}>
                    {erfuellt ? '✓' : '×'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${erfuellt ? 'text-green-800' : 'text-gray-500'}`}>
                        {studium.studiengang}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        studium.nc === 'frei'
                          ? 'bg-blue-100 text-blue-700'
                          : erfuellt
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                      }`}>
                        {studium.nc === 'frei' ? 'zulassungsfrei' : `NC ~${studium.nc}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{studium.info}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            ⚠️ NC-Werte sind Durchschnittswerte und schwanken je nach Uni, Semester und Bewerberzahl. 
            Viele Studiengänge berücksichtigen auch Wartesemester, Tests und Auswahlgespräche.
          </p>
        </div>
      )}

      {/* Formel-Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Offizielle Formel</h3>
        
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Abiturnote aus Gesamtpunkten:</p>
            <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-xs">
              N = 17/3 − (P × 17) / (3 × Pmax)
            </code>
            <p className="text-xs text-gray-500 mt-2">
              N = Note • P = erreichte Punkte • Pmax = maximale Punkte (meist 900)
            </p>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-xl">
            <p className="font-semibold text-indigo-700 mb-2">Beispielrechnung (680 von 900 Punkten):</p>
            <code className="block bg-indigo-100 p-3 rounded text-indigo-800 font-mono text-xs">
              N = 17/3 − (680 × 17) / (3 × 900) = 5,67 − 4,28 = <strong>1,4</strong>
            </code>
          </div>
        </div>
      </div>

      {/* Tipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">💡 Wichtige Infos zum Abitur</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Mindestanforderungen</p>
              <p className="text-yellow-700">Mindestens 300 Punkte und keine 0-Punkte-Kurse im Pflichtbereich. In Prüfungen mindestens 100 Punkte (bei 4-facher Wertung: 25 Punkte brutto).</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📊</span>
            <div>
              <p className="font-medium text-blue-800">Bundeslandabhängig</p>
              <p className="text-blue-700">Die genauen Regeln (Anzahl einzubringender Kurse, Gewichtung) variieren je nach Bundesland. Dieser Rechner bietet eine Orientierung.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🎓</span>
            <div>
              <p className="font-medium text-green-800">Leistungskurse</p>
              <p className="text-green-700">Deine LK-Kurse zählen doppelt (8 statt 4 Halbjahresergebnisse). Wähle LKs in Fächern, die dir liegen!</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">📈</span>
            <div>
              <p className="font-medium text-purple-800">Prüfungen zählen 4-fach</p>
              <p className="text-purple-700">Die 5 Abiturprüfungen werden 4-fach gewertet und machen ca. 1/3 der Gesamtnote aus – hier lohnt sich gute Vorbereitung besonders!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schnellübersicht Punkte → Note */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚡ Punkte → Abi-Schnitt Schnellübersicht</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { punkte: 900, note: 1.0 },
            { punkte: 823, note: 1.5 },
            { punkte: 746, note: 2.0 },
            { punkte: 669, note: 2.5 },
            { punkte: 592, note: 3.0 },
            { punkte: 515, note: 3.5 },
            { punkte: 438, note: 3.9 },
            { punkte: 300, note: 4.0 },
          ].map((beispiel) => (
            <div key={beispiel.punkte} className="p-3 bg-gray-50 rounded-xl text-center">
              <div className="text-sm text-gray-500 mb-1">
                {beispiel.punkte} Pkt.
              </div>
              <div className={`text-xl font-bold ${getNoteFarbe(beispiel.note)}`}>
                {beispiel.note.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">Bei 900 maximal erreichbaren Punkten</p>
      </div>

            <RechnerFeedback rechnerName="Abitur-Schnitt-Rechner 2025/2026" rechnerSlug="abi-schnitt-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.kmk.org/themen/allgemeinbildende-schulen/unterricht/gymnasiale-oberstufe.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            KMK – Vereinbarung zur Gestaltung der gymnasialen Oberstufe
          </a>
          <a
            href="https://www.hochschulstart.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            hochschulstart.de – Zulassungsverfahren & NC
          </a>
          <p className="text-xs text-gray-500 mt-2">
            Hinweis: Abiturregelungen können je nach Bundesland variieren. Für verbindliche Informationen wende dich an deine Schule oder das zuständige Kultusministerium.
          </p>
        </div>
      </div>
    </div>
  );
}
