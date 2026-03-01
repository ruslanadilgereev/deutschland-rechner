import { useState, useMemo } from 'react';

interface Fach {
  id: string;
  name: string;
  note: number | '';
  gewichtung: number;
}

const STANDARD_FAECHER = [
  'Mathematik',
  'Deutsch',
  'Englisch',
  'Physik',
  'Chemie',
  'Biologie',
  'Geschichte',
  'Geographie',
  'Politik',
  'Musik',
  'Kunst',
  'Sport',
  'Religion/Ethik',
  'Informatik',
  'Französisch',
  'Spanisch',
  'Latein',
  'Wirtschaft',
  'Philosophie',
  'Anderes Fach',
];

const NOTEN_BEDEUTUNG = [
  { note: 1, text: 'sehr gut', punkte: '15-13', farbe: 'bg-green-500' },
  { note: 2, text: 'gut', punkte: '12-10', farbe: 'bg-lime-500' },
  { note: 3, text: 'befriedigend', punkte: '9-7', farbe: 'bg-yellow-500' },
  { note: 4, text: 'ausreichend', punkte: '6-4', farbe: 'bg-orange-500' },
  { note: 5, text: 'mangelhaft', punkte: '3-1', farbe: 'bg-red-500' },
  { note: 6, text: 'ungenügend', punkte: '0', farbe: 'bg-red-700' },
];

export default function NotendurchschnittRechner() {
  const [faecher, setFaecher] = useState<Fach[]>([
    { id: '1', name: 'Mathematik', note: '', gewichtung: 1 },
    { id: '2', name: 'Deutsch', note: '', gewichtung: 1 },
    { id: '3', name: 'Englisch', note: '', gewichtung: 1 },
  ]);
  const [mitGewichtung, setMitGewichtung] = useState(false);
  const [neuesFach, setNeuesFach] = useState('');

  const addFach = (name?: string) => {
    const fachName = name || neuesFach.trim() || 'Neues Fach';
    setFaecher([
      ...faecher,
      {
        id: Date.now().toString(),
        name: fachName,
        note: '',
        gewichtung: 1,
      },
    ]);
    setNeuesFach('');
  };

  const removeFach = (id: string) => {
    if (faecher.length > 1) {
      setFaecher(faecher.filter((f) => f.id !== id));
    }
  };

  const updateFach = (id: string, field: keyof Fach, value: string | number) => {
    setFaecher(
      faecher.map((f) => {
        if (f.id === id) {
          if (field === 'note') {
            const numValue = value === '' ? '' : Math.min(6, Math.max(1, Number(value)));
            return { ...f, note: numValue };
          }
          if (field === 'gewichtung') {
            return { ...f, gewichtung: Math.max(0.5, Math.min(5, Number(value))) };
          }
          return { ...f, [field]: value };
        }
        return f;
      })
    );
  };

  const ergebnis = useMemo(() => {
    const faecherMitNote = faecher.filter((f) => f.note !== '' && f.note >= 1 && f.note <= 6);
    
    if (faecherMitNote.length === 0) {
      return null;
    }

    if (mitGewichtung) {
      const summeGewichtet = faecherMitNote.reduce(
        (sum, f) => sum + (f.note as number) * f.gewichtung,
        0
      );
      const summeGewichtung = faecherMitNote.reduce((sum, f) => sum + f.gewichtung, 0);
      const durchschnitt = summeGewichtet / summeGewichtung;
      
      return {
        durchschnitt,
        anzahlFaecher: faecherMitNote.length,
        summeGewichtung,
        notenVerteilung: getNotenVerteilung(faecherMitNote),
      };
    } else {
      const summe = faecherMitNote.reduce((sum, f) => sum + (f.note as number), 0);
      const durchschnitt = summe / faecherMitNote.length;
      
      return {
        durchschnitt,
        anzahlFaecher: faecherMitNote.length,
        summeGewichtung: faecherMitNote.length,
        notenVerteilung: getNotenVerteilung(faecherMitNote),
      };
    }
  }, [faecher, mitGewichtung]);

  const getNotenVerteilung = (faecherMitNote: Fach[]) => {
    const verteilung: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    faecherMitNote.forEach((f) => {
      const noteGerundet = Math.round(f.note as number);
      verteilung[noteGerundet]++;
    });
    return verteilung;
  };

  const getNoteBewertung = (note: number) => {
    const gerundet = Math.round(note);
    return NOTEN_BEDEUTUNG.find((n) => n.note === gerundet) || NOTEN_BEDEUTUNG[2];
  };

  const getNotenFarbe = (note: number) => {
    if (note <= 1.5) return 'text-green-600';
    if (note <= 2.5) return 'text-lime-600';
    if (note <= 3.5) return 'text-yellow-600';
    if (note <= 4.5) return 'text-orange-600';
    if (note <= 5.5) return 'text-red-500';
    return 'text-red-700';
  };

  const getProgressColor = (note: number) => {
    if (note <= 1.5) return 'bg-green-500';
    if (note <= 2.5) return 'bg-lime-500';
    if (note <= 3.5) return 'bg-yellow-500';
    if (note <= 4.5) return 'bg-orange-500';
    if (note <= 5.5) return 'bg-red-500';
    return 'bg-red-700';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Gewichtungs-Toggle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">Gewichtung verwenden?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Aktivieren, wenn Fächer unterschiedlich stark zählen (z.B. Hauptfächer × 2)
            </p>
          </div>
          <button
            onClick={() => setMitGewichtung(!mitGewichtung)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
              mitGewichtung ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                mitGewichtung ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Fächer-Liste */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📚 Deine Fächer & Noten</h3>
        
        <div className="space-y-3">
          {faecher.map((fach, index) => (
            <div
              key={fach.id}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl group"
            >
              {/* Fach-Nummer */}
              <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full">
                {index + 1}
              </span>

              {/* Fachname */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={fach.name}
                  onChange={(e) => updateFach(fach.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
                  placeholder="Fachname"
                />
              </div>

              {/* Note */}
              <div className="w-20">
                <select
                  value={fach.note}
                  onChange={(e) => updateFach(fach.id, 'note', e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm font-bold text-center ${
                    fach.note !== '' ? getNotenFarbe(fach.note as number) : 'text-gray-400'
                  }`}
                >
                  <option value="">Note</option>
                  <option value="1">1</option>
                  <option value="1.3">1,3</option>
                  <option value="1.7">1,7</option>
                  <option value="2">2</option>
                  <option value="2.3">2,3</option>
                  <option value="2.7">2,7</option>
                  <option value="3">3</option>
                  <option value="3.3">3,3</option>
                  <option value="3.7">3,7</option>
                  <option value="4">4</option>
                  <option value="4.3">4,3</option>
                  <option value="4.7">4,7</option>
                  <option value="5">5</option>
                  <option value="5.3">5,3</option>
                  <option value="5.7">5,7</option>
                  <option value="6">6</option>
                </select>
              </div>

              {/* Gewichtung */}
              {mitGewichtung && (
                <div className="w-20">
                  <select
                    value={fach.gewichtung}
                    onChange={(e) => updateFach(fach.id, 'gewichtung', Number(e.target.value))}
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-center"
                  >
                    <option value="0.5">×0,5</option>
                    <option value="1">×1</option>
                    <option value="1.5">×1,5</option>
                    <option value="2">×2</option>
                    <option value="2.5">×2,5</option>
                    <option value="3">×3</option>
                  </select>
                </div>
              )}

              {/* Löschen */}
              <button
                onClick={() => removeFach(fach.id)}
                className={`p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ${
                  faecher.length === 1 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                disabled={faecher.length === 1}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Fach hinzufügen */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-3">Fach hinzufügen:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {STANDARD_FAECHER.filter((f) => !faecher.find((fach) => fach.name === f))
              .slice(0, 8)
              .map((fach) => (
                <button
                  key={fach}
                  onClick={() => addFach(fach)}
                  className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  + {fach}
                </button>
              ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={neuesFach}
              onChange={(e) => setNeuesFach(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && neuesFach.trim() && addFach()}
              placeholder="Eigenes Fach eingeben..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={() => addFach()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {ergebnis ? (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium text-indigo-100 mb-4">Dein Notendurchschnitt</h3>
          
          {/* Hauptergebnis */}
          <div className="text-center mb-6">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-6xl font-bold">
                {ergebnis.durchschnitt.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2 text-indigo-200">
              {getNoteBewertung(ergebnis.durchschnitt).text}
            </div>
          </div>

          {/* Visuelle Skala */}
          <div className="relative mb-6">
            <div className="flex justify-between text-xs text-indigo-200 mb-1">
              <span>1,0</span>
              <span>6,0</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(ergebnis.durchschnitt)} transition-all duration-500`}
                style={{ width: `${((6 - ergebnis.durchschnitt) / 5) * 100}%` }}
              />
            </div>
            {/* Marker */}
            <div
              className="absolute -bottom-1 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-x-1/2 border-2 border-indigo-600"
              style={{ left: `${((ergebnis.durchschnitt - 1) / 5) * 100}%` }}
            />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold">{ergebnis.anzahlFaecher}</div>
              <div className="text-sm text-indigo-200">Fächer bewertet</div>
            </div>
            {mitGewichtung && (
              <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold">{ergebnis.summeGewichtung.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                <div className="text-sm text-indigo-200">Gewichtungssumme</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-2xl p-8 text-center mb-6">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-600">Trage mindestens eine Note ein, um den Durchschnitt zu berechnen.</p>
        </div>
      )}

      {/* Notenverteilung */}
      {ergebnis && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Notenverteilung</h3>
          <div className="space-y-2">
            {NOTEN_BEDEUTUNG.map((info) => {
              const anzahl = ergebnis.notenVerteilung[info.note] || 0;
              const prozent = (anzahl / ergebnis.anzahlFaecher) * 100;
              return (
                <div key={info.note} className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${info.farbe} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                    {info.note}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{info.text}</span>
                      <span className="font-medium">{anzahl}×</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${info.farbe} transition-all duration-500`}
                        style={{ width: `${prozent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formel-Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Verwendete Formeln</h3>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Einfacher Durchschnitt:</p>
            <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-xs">
              Durchschnitt = (Note₁ + Note₂ + ... + Noteₙ) ÷ n
            </code>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Gewichteter Durchschnitt:</p>
            <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-xs">
              Durchschnitt = (Note₁×G₁ + Note₂×G₂ + ...) ÷ (G₁ + G₂ + ...)
            </code>
            <p className="text-xs text-gray-500 mt-2">G = Gewichtungsfaktor des Fachs</p>
          </div>
        </div>
      </div>

      {/* Noten-Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Deutsches Notensystem</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Note</th>
                <th className="text-left py-2 text-gray-600">Bewertung</th>
                <th className="text-center py-2 text-gray-600">Oberstufe</th>
                <th className="text-center py-2 text-gray-600">Prozent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {NOTEN_BEDEUTUNG.map((info) => (
                <tr key={info.note} className="hover:bg-gray-50">
                  <td className="py-3">
                    <span className={`inline-flex w-8 h-8 ${info.farbe} rounded-lg items-center justify-center text-white font-bold`}>
                      {info.note}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-gray-800">{info.text}</td>
                  <td className="py-3 text-center text-gray-600">{info.punkte} Punkte</td>
                  <td className="py-3 text-center text-gray-600">
                    {info.note === 1 && '≥ 92%'}
                    {info.note === 2 && '81-91%'}
                    {info.note === 3 && '67-80%'}
                    {info.note === 4 && '50-66%'}
                    {info.note === 5 && '30-49%'}
                    {info.note === 6 && '< 30%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">💡 Tipps zum Notendurchschnitt</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🎓</span>
            <div>
              <p className="font-medium text-green-800">Versetzung gefährdet?</p>
              <p className="text-green-700">Eine 5 kann durch eine 3 ausgeglichen werden, eine 6 nur durch zwei Zweien. Bei zwei Fünfen ist die Versetzung gefährdet.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📊</span>
            <div>
              <p className="font-medium text-blue-800">Hauptfächer zählen mehr</p>
              <p className="text-blue-700">Aktiviere die Gewichtung und setze Deutsch, Mathe und Fremdsprachen auf ×2 für einen realistischeren Durchschnitt.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">🎯</span>
            <div>
              <p className="font-medium text-purple-800">Ziel: Abitur-Durchschnitt</p>
              <p className="text-purple-700">Für beliebte Studiengänge brauchst du oft einen NC unter 2,0. Medizin liegt bei ca. 1,0-1,2.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schnellübersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚡ Durchschnitt-Beispiele</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { noten: [1, 1, 2], schnitt: 1.33 },
            { noten: [1, 2, 2], schnitt: 1.67 },
            { noten: [2, 2, 2], schnitt: 2.0 },
            { noten: [2, 2, 3], schnitt: 2.33 },
            { noten: [2, 3, 3], schnitt: 2.67 },
            { noten: [3, 3, 3], schnitt: 3.0 },
          ].map((beispiel, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-xl text-center">
              <div className="text-xs text-gray-500 mb-1">
                {beispiel.noten.join(' + ')}
              </div>
              <div className={`text-lg font-bold ${getNotenFarbe(beispiel.schnitt)}`}>
                ⌀ {beispiel.schnitt.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.kmk.org/themen/allgemeinbildende-schulen/unterrichtsfaecher/mathematik-naturwissenschaften-informatik.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Kultusministerkonferenz – Notensystem
          </a>
          <a
            href="https://www.schulministerium.nrw/schule-bildung/recht/schulrecht"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Schulministerium NRW – Leistungsbewertung
          </a>
          <p className="text-xs text-gray-500 mt-2">
            Hinweis: Die genauen Prozentgrenzen können je nach Bundesland und Schule variieren.
          </p>
        </div>
      </div>
    </div>
  );
}
