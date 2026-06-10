import { useState, useMemo } from 'react';

interface Modul {
  id: string;
  name: string;
  note: string;
  ects: number | '';
  unbenotet: boolean;
}

const parseNote = (s: string): number | null => {
  const t = s.trim();
  if (t === '' || /[.,]$/.test(t)) return null; // Zwischenzustand wie "2," gilt als ungültig
  const n = Number(t.replace(',', '.'));
  return !isNaN(n) && n >= 1 && n <= 5 ? n : null;
};

const getPraedikat = (note: number): string => {
  if (note <= 1.5) return 'Sehr gut';
  if (note <= 2.5) return 'Gut';
  if (note <= 3.5) return 'Befriedigend';
  if (note <= 4.0) return 'Ausreichend';
  return 'Nicht bestanden';
};

const getNotenFarbe = (note: number): string => {
  if (note <= 1.5) return 'text-green-600';
  if (note <= 2.5) return 'text-lime-600';
  if (note <= 3.5) return 'text-yellow-600';
  if (note <= 4.0) return 'text-orange-600';
  return 'text-red-600';
};

const getProgressColor = (note: number): string => {
  if (note <= 1.5) return 'bg-green-500';
  if (note <= 2.5) return 'bg-lime-500';
  if (note <= 3.5) return 'bg-yellow-500';
  if (note <= 4.0) return 'bg-orange-500';
  return 'bg-red-500';
};

export default function UniSchnittRechner() {
  const [module, setModule] = useState<Modul[]>([
    { id: '1', name: 'Modul 1', note: '', ects: 5, unbenotet: false },
    { id: '2', name: 'Modul 2', note: '', ects: 5, unbenotet: false },
    { id: '3', name: 'Modul 3', note: '', ects: 5, unbenotet: false },
  ]);
  const [umfangAuswahl, setUmfangAuswahl] = useState<'180' | '210' | '240' | 'custom'>('180');
  const [umfangCustom, setUmfangCustom] = useState<number | ''>(180);
  const [zielNote, setZielNote] = useState('2,0');
  const [restEcts, setRestEcts] = useState<number | ''>('');

  const addModul = () => {
    setModule([
      ...module,
      { id: Date.now().toString(), name: '', note: '', ects: 5, unbenotet: false },
    ]);
  };

  const removeModul = (id: string) => {
    if (module.length > 1) {
      setModule(module.filter((m) => m.id !== id));
    }
  };

  const updateModul = (id: string, field: keyof Modul, value: string | number | boolean) => {
    setModule(
      module.map((m) => {
        if (m.id === id) {
          if (field === 'ects') {
            const numValue = value === '' ? '' : Math.min(60, Math.max(0, Number(value)));
            return { ...m, ects: numValue as number | '' };
          }
          return { ...m, [field]: value };
        }
        return m;
      })
    );
  };

  const ergebnis = useMemo(() => {
    const benotet = module.filter(
      (m) => !m.unbenotet && parseNote(m.note) !== null && m.ects !== '' && m.ects > 0
    );

    if (benotet.length === 0) {
      return null;
    }

    const summeGewichtet = benotet.reduce(
      (sum, m) => sum + (parseNote(m.note) as number) * (m.ects as number),
      0
    );
    const summeEctsBenotet = benotet.reduce((sum, m) => sum + (m.ects as number), 0);
    const schnittExakt = summeGewichtet / summeEctsBenotet;
    const uniNote = Math.floor(schnittExakt * 10 + 1e-9) / 10;

    return {
      schnittExakt,
      uniNote,
      anzahlBenotet: benotet.length,
      summeEctsBenotet,
    };
  }, [module]);

  // ECTS gesamt für den Fortschritt: benotete + unbenotete Module mit gültigen ECTS
  const ectsGesamt = useMemo(() => {
    return module.reduce((sum, m) => {
      if (m.ects === '' || m.ects <= 0) return sum;
      if (m.unbenotet) return sum + m.ects;
      return parseNote(m.note) !== null ? sum + m.ects : sum;
    }, 0);
  }, [module]);

  const zielErgebnis = useMemo(() => {
    const benotet = module.filter(
      (m) => !m.unbenotet && parseNote(m.note) !== null && m.ects !== '' && m.ects > 0
    );
    const S = benotet.reduce(
      (sum, m) => sum + (parseNote(m.note) as number) * (m.ects as number),
      0
    );
    const E = benotet.reduce((sum, m) => sum + (m.ects as number), 0);

    const zielRaw = parseNote(zielNote);
    // Gesamtnoten haben eine Dezimale — präzisere Eingaben (z. B. "2,05") auf die Notenstufe abschneiden
    const ziel = zielRaw === null ? null : Math.floor(zielRaw * 10 + 1e-9) / 10;
    const R = restEcts;
    if (ziel === null || R === '' || R <= 0) return null;

    // gegen Abschneide-Schwelle rechnen: Gesamtnote `ziel` ist erreicht, solange exakter Schnitt < ziel + 0,1
    const xMax = ((ziel + 0.0999) * (E + R) - S) / R;
    const benoetigt = Math.floor(xMax * 100) / 100;

    if (benoetigt < 1.0) return { status: 'unerreichbar' as const, benoetigt };
    if (benoetigt >= 4.0) return { status: 'sicher' as const, benoetigt };
    return { status: 'machbar' as const, benoetigt };
  }, [module, zielNote, restEcts]);

  const umfang = umfangAuswahl === 'custom' ? umfangCustom : Number(umfangAuswahl);
  const umfangGueltig = umfang !== '' && umfang > 0;
  const fortschrittProzent = umfangGueltig ? Math.min(100, (ectsGesamt / (umfang as number)) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Modul-Liste */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📚 Deine Module</h3>

        <div className="space-y-3">
          {module.map((m, index) => {
            const noteParsed = parseNote(m.note);
            const noteKlasse = m.unbenotet
              ? 'border-gray-200 text-gray-400 opacity-40'
              : noteParsed !== null
                ? `border-gray-200 ${getNotenFarbe(noteParsed)}`
                : m.note.trim() !== ''
                  ? 'border-red-400 text-red-600'
                  : 'border-gray-200 text-gray-400';
            const ectsUngueltig = m.ects === '' || m.ects <= 0;
            return (
              <div key={m.id} className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-xl">
                {/* Modul-Nummer + Modulname (auf Mobile eigene Zeile) */}
                <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 min-w-0">
                  <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateModul(m.id, 'name', e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
                    placeholder="Modulname (optional)"
                    aria-label={`Name von Modul ${index + 1}`}
                  />
                </div>

                {/* Note */}
                <input
                  type="text"
                  inputMode="decimal"
                  value={m.note}
                  onChange={(e) => updateModul(m.id, 'note', e.target.value)}
                  disabled={m.unbenotet}
                  className={`w-20 px-2 py-2 border rounded-lg focus:border-indigo-500 focus:outline-none text-sm font-bold text-center ${noteKlasse}`}
                  placeholder="Note"
                  aria-label={`Note von Modul ${index + 1}`}
                />

                {/* ECTS */}
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={m.ects}
                  onChange={(e) => updateModul(m.id, 'ects', e.target.value)}
                  className={`w-20 px-2 py-2 border rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-center ${
                    ectsUngueltig ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="ECTS"
                  aria-label={`ECTS von Modul ${index + 1}`}
                />

                {/* Unbenotet */}
                <label
                  className="flex items-center gap-1 text-xs text-gray-500 shrink-0 cursor-pointer"
                  title="Nur bestanden (z. B. Praktikum): ECTS zählen, Note fließt nicht in den Schnitt"
                >
                  <input
                    type="checkbox"
                    checked={m.unbenotet}
                    onChange={(e) => updateModul(m.id, 'unbenotet', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  unbenotet
                </label>

                {/* Löschen */}
                <button
                  onClick={() => removeModul(m.id)}
                  className={`p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 ${
                    module.length === 1 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                  disabled={module.length === 1}
                  aria-label={`Modul ${index + 1} löschen`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Modul hinzufügen */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={addModul}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            + Modul hinzufügen
          </button>
        </div>
      </div>

      {/* Ergebnis */}
      {ergebnis ? (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium text-indigo-100 mb-4">Dein Uni-Schnitt (exakt)</h3>

          {/* Hauptergebnis */}
          <div className="text-center mb-6">
            <span className="text-6xl font-bold">
              {/* abschneiden statt runden, damit die Anzeige nie über die Abschneidegrenze der Uni-Note springt */}
              {(Math.floor(ergebnis.schnittExakt * 100 + 1e-9) / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="mt-3 text-indigo-100">
              Uni-Note nach Abschneideregel:{' '}
              <strong className="text-white text-xl">
                {ergebnis.uniNote.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </strong>
              <span className="ml-2 inline-block px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold align-middle">
                {getPraedikat(ergebnis.uniNote)}
              </span>
            </div>
          </div>

          {/* Visuelle Skala */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-indigo-200 mb-1">
              <span>5,0</span>
              <span>1,0</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(ergebnis.uniNote)} transition-all duration-500`}
                style={{ width: `${((5 - ergebnis.schnittExakt) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold">{ergebnis.anzahlBenotet.toLocaleString('de-DE')}</div>
              <div className="text-sm text-indigo-200">Benotete Module</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold">{ergebnis.summeEctsBenotet.toLocaleString('de-DE')}</div>
              <div className="text-sm text-indigo-200">Benotete ECTS</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-2xl p-8 text-center mb-6">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-600">Trage mindestens eine Note mit ECTS ein, um deinen Schnitt zu berechnen.</p>
        </div>
      )}

      {/* ECTS-Fortschritt */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 ECTS-Fortschritt</h3>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="text-sm text-gray-600" htmlFor="studienumfang">
            Studienumfang:
          </label>
          <select
            id="studienumfang"
            value={umfangAuswahl}
            onChange={(e) => setUmfangAuswahl(e.target.value as '180' | '210' | '240' | 'custom')}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
          >
            <option value="180">180 ECTS (Bachelor)</option>
            <option value="210">210 ECTS</option>
            <option value="240">240 ECTS</option>
            <option value="custom">Eigener Wert</option>
          </select>
          {umfangAuswahl === 'custom' && (
            <input
              type="number"
              min={1}
              max={600}
              value={umfangCustom}
              onChange={(e) =>
                setUmfangCustom(e.target.value === '' ? '' : Math.min(600, Math.max(0, Number(e.target.value))))
              }
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-center"
              aria-label="Eigener Studienumfang in ECTS"
            />
          )}
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${fortschrittProzent}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {umfangGueltig ? (
            <>
              {ectsGesamt.toLocaleString('de-DE')} von {(umfang as number).toLocaleString('de-DE')} ECTS erfasst
              {' — '}noch {Math.max(0, (umfang as number) - ectsGesamt).toLocaleString('de-DE')} ECTS
            </>
          ) : (
            <>{ectsGesamt.toLocaleString('de-DE')} ECTS erfasst</>
          )}
        </p>
      </div>

      {/* Ziel-Noten-Rechner */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🎯 Wunschnote erreichen</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1" htmlFor="ziel-note">
              Wunsch-Gesamtnote
            </label>
            <input
              id="ziel-note"
              type="text"
              inputMode="decimal"
              value={zielNote}
              onChange={(e) => setZielNote(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:border-indigo-500 focus:outline-none text-sm font-bold text-center ${
                zielNote.trim() !== '' && parseNote(zielNote) === null
                  ? 'border-red-400 text-red-600'
                  : 'border-gray-200'
              }`}
              placeholder="z. B. 2,0"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1" htmlFor="rest-ects">
              Restliche benotete ECTS
            </label>
            <input
              id="rest-ects"
              type="number"
              min={1}
              value={restEcts}
              onChange={(e) => setRestEcts(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-center"
              placeholder="z. B. 60"
            />
          </div>
        </div>

        {zielErgebnis ? (
          zielErgebnis.status === 'machbar' ? (
            <div className="p-4 bg-indigo-50 rounded-xl text-sm text-gray-700">
              Du brauchst in den restlichen {(restEcts as number).toLocaleString('de-DE')} ECTS einen Schnitt von{' '}
              <strong className={`text-lg ${getNotenFarbe(zielErgebnis.benoetigt)}`}>
                {zielErgebnis.benoetigt.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
              {' '}({getPraedikat(zielErgebnis.benoetigt)}).
            </div>
          ) : zielErgebnis.status === 'unerreichbar' ? (
            <div className="p-4 bg-red-50 rounded-xl text-sm text-red-700">
              Selbst mit 1,0 in allen restlichen ECTS nicht erreichbar.
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-xl text-sm text-green-700">
              Schon sicher: Selbst mit 4,0 überall erreichst du dein Ziel.
            </div>
          )
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
            Gib eine Wunschnote (z. B. 2,0) und die restlichen benoteten ECTS ein.
          </div>
        )}
        <p className="text-xs text-gray-500 mt-3">
          Berechnet gegen die Abschneidegrenze: Gesamtnote Z gilt bis exakter Schnitt &lt; Z+0,1. Maßgeblich ist deine Prüfungsordnung.
        </p>
      </div>

      {/* Formel-Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Verwendete Formel</h3>
        <div className="p-4 bg-gray-50 rounded-xl text-sm">
          <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-xs">
            Schnitt = (Note₁×ECTS₁ + Note₂×ECTS₂ + …) ÷ (ECTS₁ + ECTS₂ + …)
          </code>
          <p className="text-xs text-gray-500 mt-2">Zähler und Nenner enthalten nur benotete Module.</p>
        </div>
      </div>

      {/* Tipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">💡 Tipps</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium text-blue-800">Unbenotete Module markieren</p>
              <p className="text-blue-700">Praktika und Kurse, die nur „bestanden“ werden, per Checkbox als unbenotet markieren: Die ECTS zählen für den Fortschritt, verfälschen aber nicht den Schnitt.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">✂️</span>
            <div>
              <p className="font-medium text-green-800">Abschneiden statt Runden</p>
              <p className="text-green-700">Die meisten Prüfungsordnungen streichen alles nach der ersten Dezimalstelle: Ein exakter Schnitt von 2,59 bleibt eine 2,5 – es wird nicht aufgerundet.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-purple-800">5,0 = nicht bestanden</p>
              <p className="text-purple-700">Endgültig nicht bestandene Module gehen laut Prüfungsordnung meist gar nicht in die Gesamtnote ein – am besten gar nicht erst eintragen.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.kmk.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Kultusministerkonferenz (KMK)
          </a>
          <a
            href="https://www.hochschulstart.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            hochschulstart.de – Stiftung für Hochschulzulassung
          </a>
          <p className="text-xs text-gray-500 mt-2">
            Die Berechnung deiner Abschlussnote regelt verbindlich deine Prüfungsordnung.
          </p>
        </div>
      </div>
    </div>
  );
}
