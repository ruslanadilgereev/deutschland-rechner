import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ═══════════════════════════════════════════════════════════════
// PUNKTE IN FLENSBURG – Fahreignungs-Bewertungssystem
// Rechtsgrundlage: § 4 StVG, Fahrerlaubnis-Verordnung (FeV),
//   Kraftfahrt-Bundesamt (KBA), seit 1. Mai 2014.
// Maßnahmenstufen:
//   1–3 Punkte → Vormerkung, keine Maßnahme
//   4–5 Punkte → Stufe 1: Ermahnung
//   6–7 Punkte → Stufe 2: Verwarnung
//   8+ Punkte  → Stufe 3: Entzug der Fahrerlaubnis
// Tilgungsfristen (ab Rechtskraft, jede Tat einzeln, keine Hemmung):
//   1 Punkt = 2,5 Jahre · 2 Punkte = 5 Jahre · 3 Punkte = 10 Jahre
// ═══════════════════════════════════════════════════════════════

interface Eintrag {
  id: number;
  punkte: 1 | 2 | 3;
  datum: string; // ISO-Datum der Rechtskraft (yyyy-mm-dd)
}

// Tilgungsfrist in Jahren je nach Punktwert der einzelnen Tat
const TILGUNG_JAHRE: Record<number, number> = { 1: 2.5, 2: 5, 3: 10 };

let nextId = 4;

// Formatiert ein Date als lokales ISO-Datum (yyyy-mm-dd), ohne den
// Zeitzonen-Versatz von toISOString().
const toLocalIso = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

// Parst ein ISO-Datum (yyyy-mm-dd) zeitzonensicher als lokale Mitternacht.
// new Date('yyyy-mm-dd') würde als UTC interpretiert und kann den Kalendertag
// in negativen Zeitzonen verschieben – darum hier explizit lokal aufbauen.
const parseLokal = (iso: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

// Liefert das ISO-Datum vor `monate` Monaten (für die Voreinstellungen).
const monateZurueck = (monate: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - monate);
  return toLocalIso(d);
};

export function PunkteFlensburgRechner() {
  // Sinnvolle Default-Einträge, damit das Ergebnis sofort ≠ 0 ist. Alle drei
  // liegen nur wenige Monate zurück und sind daher garantiert noch nicht
  // getilgt: 1 + 2 + 1 = 4 aktive Punkte (Stufe 1: Ermahnung), passend zu
  // Beispiel 1 auf der Seite. Relativ berechnet, damit sie nie veralten.
  const [eintraege, setEintraege] = useState<Eintrag[]>([
    { id: 1, punkte: 1, datum: monateZurueck(4) },
    { id: 2, punkte: 2, datum: monateZurueck(10) },
    { id: 3, punkte: 1, datum: monateZurueck(18) },
  ]);
  const [seminar, setSeminar] = useState(false);

  const heute = new Date();

  const addEintrag = () => {
    setEintraege((prev) => [...prev, { id: nextId++, punkte: 1, datum: toLocalIso(heute) }]);
  };

  const removeEintrag = (id: number) => {
    setEintraege((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEintrag = (id: number, patch: Partial<Eintrag>) => {
    setEintraege((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const ergebnis = useMemo(() => {
    // Nur noch nicht getilgte Einträge zählen.
    let aktivePunkte = 0;
    const aktiveEintraege: { eintrag: Eintrag; tilgungAm: Date }[] = [];

    for (const e of eintraege) {
      const start = parseLokal(e.datum);
      if (!start) continue;
      const jahre = TILGUNG_JAHRE[e.punkte];
      const tilgung = new Date(start);
      // 2,5 Jahre = 30 Monate – über Monate addieren, damit Halbjahre passen.
      tilgung.setMonth(tilgung.getMonth() + Math.round(jahre * 12));
      if (tilgung > heute) {
        aktivePunkte += e.punkte;
        aktiveEintraege.push({ eintrag: e, tilgungAm: tilgung });
      }
    }

    // Fahreignungsseminar: −1 Punkt, nur bei Stand 1–5 Punkte, höchstens
    // einmal in 5 Jahren. Wir wenden den Abzug auf den aktiven Stand an,
    // sofern er vor dem Seminar zwischen 1 und 5 lag.
    const seminarMoeglich = aktivePunkte >= 1 && aktivePunkte <= 5;
    const punkteNachSeminar =
      seminar && seminarMoeglich ? Math.max(0, aktivePunkte - 1) : aktivePunkte;

    const punkte = punkteNachSeminar;

    let stufe: string;
    let massnahme: string;
    let schwere: 'gruen' | 'gelb' | 'orange' | 'rot';

    if (punkte <= 3) {
      stufe = 'Vormerkung';
      massnahme = 'Keine Maßnahme. Verstöße werden registriert.';
      schwere = 'gruen';
    } else if (punkte <= 5) {
      stufe = 'Stufe 1: Ermahnung';
      massnahme =
        'Schriftliche Ermahnung. Hinweis auf das freiwillige Fahreignungsseminar (−1 Punkt möglich).';
      schwere = 'gelb';
    } else if (punkte <= 7) {
      stufe = 'Stufe 2: Verwarnung';
      massnahme =
        'Schriftliche Verwarnung mit dem Hinweis, dass bei 8 Punkten die Fahrerlaubnis entzogen wird.';
      schwere = 'orange';
    } else {
      stufe = 'Stufe 3: Entzug der Fahrerlaubnis';
      massnahme =
        'Die Fahrerlaubnis wird entzogen. Sperrfrist mindestens 6 Monate, Neuerteilung erst nach MPU.';
      schwere = 'rot';
    }

    // Nächste Tilgung (frühestes Tilgungsdatum unter den aktiven Einträgen)
    const naechsteTilgung =
      aktiveEintraege.length > 0
        ? aktiveEintraege.reduce((min, x) => (x.tilgungAm < min ? x.tilgungAm : min), aktiveEintraege[0].tilgungAm)
        : null;

    return {
      punkte,
      aktivePunkteVorSeminar: aktivePunkte,
      seminarAngewandt: seminar && seminarMoeglich,
      seminarMoeglich,
      stufe,
      massnahme,
      schwere,
      bisEntzug: Math.max(0, 8 - punkte),
      naechsteTilgung,
    };
  }, [eintraege, seminar]);

  const formatDatum = (d: Date) =>
    d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const schwereKlasse =
    ergebnis.schwere === 'rot'
      ? 'bg-gradient-to-br from-red-600 to-red-800'
      : ergebnis.schwere === 'orange'
      ? 'bg-gradient-to-br from-orange-500 to-red-600'
      : ergebnis.schwere === 'gelb'
      ? 'bg-gradient-to-br from-amber-400 to-orange-500'
      : 'bg-gradient-to-br from-green-500 to-emerald-600';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Punkte-in-Flensburg-Rechner" rechnerSlug="punkte-flensburg-rechner" />

      {/* Einträge */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-700 font-medium">Ihre Punkte-Einträge</span>
          <button
            onClick={addEintrag}
            className="py-2 px-4 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            + Eintrag
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Tragen Sie pro Verstoß die Punkte und das Datum der Rechtskraft ein. Getilgte Einträge
          (1 Punkt nach 2,5 Jahren, 2 Punkte nach 5 Jahren, 3 Punkte nach 10 Jahren) werden automatisch
          herausgerechnet.
        </p>

        <div className="space-y-3">
          {eintraege.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Noch keine Einträge – fügen Sie einen Verstoß hinzu.
            </p>
          )}
          {eintraege.map((e) => (
            <div key={e.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
              <select
                value={e.punkte}
                onChange={(ev) => updateEintrag(e.id, { punkte: Number(ev.target.value) as 1 | 2 | 3 })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value={1}>1 Punkt</option>
                <option value={2}>2 Punkte</option>
                <option value={3}>3 Punkte</option>
              </select>
              <input
                type="date"
                value={e.datum}
                max={toLocalIso(heute)}
                onChange={(ev) => updateEintrag(e.id, { datum: ev.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button
                onClick={() => removeEintrag(e.id)}
                aria-label="Eintrag entfernen"
                className="px-3 py-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Fahreignungsseminar */}
        <div className="border-t border-gray-100 pt-4 mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={seminar}
              onChange={(e) => setSeminar(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-gray-700 font-medium">Fahreignungsseminar absolviert (−1 Punkt)</span>
          </label>
          <span className="text-xs text-gray-400 mt-1 block">
            Nur bei einem Stand von 1 bis 5 Punkten möglich und höchstens einmal in 5 Jahren.
          </span>
        </div>
      </div>

      {/* Ergebnis */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${schwereKlasse}`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">⚖️ Aktueller Punktestand</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold">{ergebnis.punkte}</span>
            <span className="text-xl opacity-80">{ergebnis.punkte === 1 ? 'Punkt' : 'Punkte'}</span>
          </div>
          <p className="mt-2 font-medium">{ergebnis.stufe}</p>
          {ergebnis.seminarAngewandt && (
            <p className="text-sm opacity-80 mt-1">
              inkl. −1 Punkt durch Fahreignungsseminar (vorher {ergebnis.aktivePunkteVorSeminar})
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Bis zum Entzug</span>
            <div className="text-3xl font-bold">
              {ergebnis.punkte >= 8 ? 'Entzug' : `${ergebnis.bisEntzug} Pkt.`}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Nächste Tilgung</span>
            <div className="text-xl font-bold">
              {ergebnis.naechsteTilgung ? formatDatum(ergebnis.naechsteTilgung) : '–'}
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm">💡 {ergebnis.massnahme}</p>
        </div>
      </div>

      {/* Maßnahmenstufen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Maßnahmen nach Punktestand</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-lg font-bold text-green-700 w-16">1–3</span>
            <div>
              <p className="font-medium text-green-800">Vormerkung</p>
              <p className="text-sm text-green-600">Keine Maßnahme</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-lg font-bold text-yellow-700 w-16">4–5</span>
            <div>
              <p className="font-medium text-yellow-800">Ermahnung</p>
              <p className="text-sm text-yellow-600">Hinweis auf freiwilliges Fahreignungsseminar</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-lg font-bold text-orange-700 w-16">6–7</span>
            <div>
              <p className="font-medium text-orange-800">Verwarnung</p>
              <p className="text-sm text-orange-600">Warnung vor Entzug bei 8 Punkten</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
            <span className="text-lg font-bold text-red-700 w-16">8+</span>
            <div>
              <p className="font-medium text-red-800">Entzug der Fahrerlaubnis</p>
              <p className="text-sm text-red-600">Sperrfrist mind. 6 Monate, Neuerteilung nur nach MPU</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Der Rechner bildet das Fahreignungs-Bewertungssystem nach § 4 StVG
          vereinfacht ab. Die verbindliche Auskunft über Ihren Punktestand erteilt das Kraftfahrt-Bundesamt
          (KBA) – die Abfrage ist kostenlos. Tilgungs-Sonderfälle wie die einjährige Überliegefrist sind
          nicht berücksichtigt. Angaben ohne Gewähr und keine Rechtsberatung.
        </p>
      </div>
    </div>
  );
}

export default PunkteFlensburgRechner;
