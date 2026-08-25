import { useState, useMemo } from 'react';

// Notenschlüssel-Rechner
// IHK-Schlüssel: bundeseinheitliche 100-Punkte-Skala der IHK-Abschluss- und
// Fortbildungsprüfungen (Musterprüfungsordnung DIHK): 92-100 → 1, 81-<92 → 2,
// 67-<81 → 3, 50-<67 → 4, 30-<50 → 5, 0-<30 → 6.
// Linearer Schul-Schlüssel: oberhalb des Sockels (Note 4) linear bis Note 1,
// darunter linear bis Note 6. Kein bundeseinheitlicher Schul-Schlüssel –
// die Lehrkraft bzw. das Land legt ihn fest.

const IHK_STUFEN = [
  { note: 1, wort: 'sehr gut', vonProzent: 92 },
  { note: 2, wort: 'gut', vonProzent: 81 },
  { note: 3, wort: 'befriedigend', vonProzent: 67 },
  { note: 4, wort: 'ausreichend', vonProzent: 50 },
  { note: 5, wort: 'mangelhaft', vonProzent: 30 },
  { note: 6, wort: 'ungenügend', vonProzent: 0 },
];

function ihkNote(punkte: number, max: number): number | null {
  if (max <= 0) return null;
  const p = (Math.max(0, Math.min(punkte, max)) / max) * 100;
  if (p >= 92) return 1;
  if (p >= 81) return 2;
  if (p >= 67) return 3;
  if (p >= 50) return 4;
  if (p >= 30) return 5;
  return 6;
}

function linearNote(punkte: number, max: number, sockelProzent: number): number | null {
  if (max <= 0) return null;
  const sockel = Math.min(99, Math.max(1, sockelProzent));
  const p = (Math.max(0, Math.min(punkte, max)) / max) * 100;
  let note;
  if (p >= sockel) note = 1 + (3 * (100 - p)) / (100 - sockel);
  else note = 4 + (2 * (sockel - p)) / sockel;
  return Math.round(note * 10) / 10;
}

// Mindestpunkte für eine Notenstufe, auf halbe Punkte aufgerundet
function minPunkteFuerNote(note: number, max: number, sockelProzent: number): number {
  const sockel = Math.min(99, Math.max(1, sockelProzent));
  let p;
  if (note <= 4) p = 100 - ((note - 1) / 3) * (100 - sockel);
  else p = sockel - ((note - 4) / 2) * sockel;
  return Math.ceil((p / 100) * max * 2 - 1e-9) / 2; // Epsilon gegen FP-Artefakte
}

function formatPunkte(p: number): string {
  return p.toLocaleString('de-DE', { maximumFractionDigits: 1 });
}

const NOTEN_WORTE: Record<number, string> = {
  1: 'sehr gut', 2: 'gut', 3: 'befriedigend', 4: 'ausreichend', 5: 'mangelhaft', 6: 'ungenügend',
};

export default function NotenschluesselRechner() {
  const [modus, setModus] = useState<'ihk' | 'linear'>('ihk');
  const [maxPunkte, setMaxPunkte] = useState(100);
  const [erreicht, setErreicht] = useState(75);
  const [sockel, setSockel] = useState(50);

  const ergebnis = useMemo(() => {
    const max = Math.max(0, maxPunkte || 0);
    const pkt = Math.max(0, erreicht || 0);
    const prozent = max > 0 ? (Math.min(pkt, max) / max) * 100 : 0;

    if (modus === 'ihk') {
      const note = ihkNote(pkt, max);
      // IHK-Tabelle für das eingegebene Maximum: "ab X Punkten Note Y"
      const tabelle = IHK_STUFEN.map((s) => ({
        note: s.note,
        wort: s.wort,
        abPunkte: Math.ceil((s.vonProzent / 100) * max * 2 - 1e-9) / 2,
        abProzent: s.vonProzent,
      }));
      return { note, prozent, tabelle, max };
    }

    const note = linearNote(pkt, max, sockel);
    const stufen = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];
    const tabelle = stufen.map((n) => ({
      note: n,
      wort: Number.isInteger(n) ? NOTEN_WORTE[n] : '',
      abPunkte: minPunkteFuerNote(n, max, sockel),
      abProzent: null as number | null,
    }));
    return { note, prozent, tabelle, max };
  }, [modus, maxPunkte, erreicht, sockel]);

  const noteAnzeige =
    ergebnis.note === null
      ? '–'
      : modus === 'ihk'
        ? String(ergebnis.note)
        : ergebnis.note.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div>
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => setModus('ihk')}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${modus === 'ihk' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            IHK-Notenschlüssel
          </button>
          <button
            type="button"
            onClick={() => setModus('linear')}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${modus === 'linear' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Linearer Schlüssel (Schule)
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ns-max" className="block text-sm font-medium text-gray-700 mb-1">
                Maximale Punktzahl
              </label>
              <input
                id="ns-max"
                type="number"
                min="1"
                step="1"
                value={maxPunkte}
                onChange={(e) => setMaxPunkte(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
              />
            </div>
            <div>
              <label htmlFor="ns-erreicht" className="block text-sm font-medium text-gray-700 mb-1">
                Erreichte Punkte
              </label>
              <input
                id="ns-erreicht"
                type="number"
                min="0"
                step="0.5"
                value={erreicht}
                onChange={(e) => setErreicht(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
              />
            </div>
          </div>

          {modus === 'linear' && (
            <div>
              <label htmlFor="ns-sockel" className="block text-sm font-medium text-gray-700 mb-1">
                Note 4 ab … % der Punkte (Sockel)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="ns-sockel"
                  type="range"
                  min="30"
                  max="70"
                  step="1"
                  value={sockel}
                  onChange={(e) => setSockel(Number(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <span className="text-lg font-bold w-16 text-right">{sockel} %</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Üblich sind 45–60 %. Ab dem Sockel verläuft die Skala linear bis Note 1, darunter bis Note 6.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hauptergebnis */}
      <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <p className="text-indigo-100 text-sm mb-1">
          {modus === 'ihk' ? 'IHK-Note' : 'Note (linearer Schlüssel)'} bei {formatPunkte(Math.max(0, erreicht || 0))} von {formatPunkte(Math.max(0, maxPunkte || 0))} Punkten
        </p>
        <p className="text-5xl font-bold mb-2">
          {noteAnzeige}
          {ergebnis.note !== null && Number.isInteger(ergebnis.note) && (
            <span className="text-2xl font-normal text-indigo-100 ml-3">({NOTEN_WORTE[ergebnis.note]})</span>
          )}
        </p>
        <p className="text-indigo-100 text-sm">
          Das entspricht {ergebnis.prozent.toFixed(1).replace('.', ',')} % der Punkte.
        </p>
      </div>

      {/* Punkte-Noten-Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {modus === 'ihk' ? `IHK-Notenschlüssel für ${formatPunkte(ergebnis.max)} Punkte` : `Punkte-Noten-Tabelle für ${formatPunkte(ergebnis.max)} Punkte (Sockel ${Math.min(99, Math.max(1, sockel))} %)`}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-50 text-left">
                <th className="py-2 px-3 font-semibold text-gray-700">Note</th>
                <th className="py-2 px-3 font-semibold text-gray-700"></th>
                <th className="py-2 px-3 font-semibold text-gray-700 text-right">ab Punkte</th>
                {modus === 'ihk' && <th className="py-2 px-3 font-semibold text-gray-700 text-right">ab %</th>}
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {ergebnis.tabelle.map((zeile) => (
                <tr key={zeile.note} className={`border-b border-gray-100 ${ergebnis.note !== null && zeile.note === Math.ceil(ergebnis.note) && Number.isInteger(zeile.note) ? '' : ''}`}>
                  <td className="py-2 px-3 font-medium text-gray-800">
                    {Number.isInteger(zeile.note) ? zeile.note : zeile.note.toLocaleString('de-DE', { minimumFractionDigits: 1 })}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-400">{zeile.wort}</td>
                  <td className="py-2 px-3 text-right">{formatPunkte(zeile.abPunkte)}</td>
                  {modus === 'ihk' && <td className="py-2 px-3 text-right">{zeile.abProzent} %</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          {modus === 'ihk' ? (
            <>
              <strong>IHK-Schlüssel:</strong> Die 100-Punkte-Skala gilt bundeseinheitlich für
              IHK-Abschluss- und Fortbildungsprüfungen – in NRW, Bayern und allen anderen Ländern
              identisch. „Bestanden" heißt mindestens 50 Punkte (Note 4).
            </>
          ) : (
            <>
              <strong>Linearer Schlüssel:</strong> Punktegrenzen auf halbe Punkte aufgerundet. Einen
              bundeseinheitlichen Schul-Notenschlüssel gibt es nicht – Vorgaben machen Land, Schule oder
              Fachkonferenz; die Tabelle dient als Rechenhilfe.
            </>
          )}
        </div>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-xs text-gray-500 mb-4">
          ⚠️ Rechenhilfe ohne Gewähr – maßgeblich sind die Prüfungsordnung bzw. die Vorgaben der
          Schule oder Kammer.
        </p>
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Quellen</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>
            <a href="https://www.dihk.de/de/themen-und-positionen/fachkraefte/aus-und-weiterbildung/pruefungen" target="_blank" rel="noopener noreferrer" className="hover:underline">
              DIHK – IHK-Prüfungen (Musterprüfungsordnung mit 100-Punkte-Schlüssel)
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/bbig_2005/__37.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 37 BBiG – Abschlussprüfung (Rechtsgrundlage der Kammerprüfungen)
            </a>
          </li>
          <li>
            <a href="https://www.kmk.org/themen/allgemeinbildende-schulen.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              KMK – Länderhoheit bei schulischer Leistungsbewertung
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
