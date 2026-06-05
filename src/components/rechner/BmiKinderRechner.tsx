import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ════════════════════════════════════════════════════════════════════
// BMI-Perzentile für Kinder & Jugendliche (2–18 Jahre)
// Referenz: Kromeyer-Hauschild et al., Arbeitsgemeinschaft Adipositas
// im Kindes- und Jugendalter (AGA) / Deutsche Adipositas-Gesellschaft.
// Quelle der Perzentilkurven (P3, P10, P90, P97):
// https://adipositas-gesellschaft.de/wp-content/uploads/2020/09/bmiref.pdf
// Werte in kg/m², abgelesen je ganzem Lebensjahr. Zwischen den Jahren
// wird linear interpoliert. Klassifikation laut AGA-Leitlinie:
//   < P3   = starkes Untergewicht
//   P3–P10 = Untergewicht
//   P10–P90 = Normalgewicht
//   P90–P97 = Übergewicht
//   > P97  = Adipositas
// ════════════════════════════════════════════════════════════════════

type Cutoffs = { p3: number; p10: number; p90: number; p97: number };

// Jungen – BMI-Grenzwerte (kg/m²) je Alter (Jahre)
const JUNGEN: Record<number, Cutoffs> = {
  2: { p3: 14.7, p10: 15.2, p90: 18.2, p97: 19.0 },
  3: { p3: 14.3, p10: 14.9, p90: 17.9, p97: 18.7 },
  4: { p3: 14.0, p10: 14.6, p90: 17.6, p97: 18.5 },
  5: { p3: 13.8, p10: 14.4, p90: 17.6, p97: 18.6 },
  6: { p3: 13.7, p10: 14.3, p90: 17.9, p97: 19.0 },
  7: { p3: 13.7, p10: 14.4, p90: 18.4, p97: 19.7 },
  8: { p3: 13.8, p10: 14.5, p90: 19.1, p97: 20.6 },
  9: { p3: 14.0, p10: 14.8, p90: 19.9, p97: 21.6 },
  10: { p3: 14.3, p10: 15.2, p90: 20.8, p97: 22.6 },
  11: { p3: 14.7, p10: 15.6, p90: 21.7, p97: 23.7 },
  12: { p3: 15.1, p10: 16.1, p90: 22.6, p97: 24.7 },
  13: { p3: 15.6, p10: 16.7, p90: 23.4, p97: 25.6 },
  14: { p3: 16.2, p10: 17.3, p90: 24.2, p97: 26.4 },
  15: { p3: 16.7, p10: 17.9, p90: 24.9, p97: 27.1 },
  16: { p3: 17.2, p10: 18.4, p90: 25.4, p97: 27.7 },
  17: { p3: 17.6, p10: 18.8, p90: 25.8, p97: 28.3 },
  18: { p3: 17.9, p10: 19.1, p90: 26.2, p97: 28.9 },
};

// Mädchen – BMI-Grenzwerte (kg/m²) je Alter (Jahre)
const MAEDCHEN: Record<number, Cutoffs> = {
  2: { p3: 14.3, p10: 14.9, p90: 18.1, p97: 18.9 },
  3: { p3: 13.9, p10: 14.5, p90: 17.8, p97: 18.6 },
  4: { p3: 13.5, p10: 14.2, p90: 17.6, p97: 18.5 },
  5: { p3: 13.3, p10: 14.0, p90: 17.7, p97: 18.7 },
  6: { p3: 13.2, p10: 13.9, p90: 18.0, p97: 19.2 },
  7: { p3: 13.3, p10: 14.0, p90: 18.5, p97: 19.9 },
  8: { p3: 13.4, p10: 14.2, p90: 19.2, p97: 20.8 },
  9: { p3: 13.7, p10: 14.5, p90: 20.0, p97: 21.8 },
  10: { p3: 14.0, p10: 14.9, p90: 20.9, p97: 22.9 },
  11: { p3: 14.5, p10: 15.4, p90: 21.8, p97: 23.9 },
  12: { p3: 15.0, p10: 16.0, p90: 22.7, p97: 24.9 },
  13: { p3: 15.6, p10: 16.6, p90: 23.5, p97: 25.8 },
  14: { p3: 16.1, p10: 17.2, p90: 24.2, p97: 26.6 },
  15: { p3: 16.6, p10: 17.7, p90: 24.8, p97: 27.2 },
  16: { p3: 17.0, p10: 18.1, p90: 25.2, p97: 27.7 },
  17: { p3: 17.3, p10: 18.5, p90: 25.6, p97: 28.2 },
  18: { p3: 17.5, p10: 18.8, p90: 25.9, p97: 28.6 },
};

// Lineare Interpolation der Grenzwerte zwischen zwei ganzen Lebensjahren
function cutoffsFuerAlter(tabelle: Record<number, Cutoffs>, alter: number): Cutoffs {
  const untergrenze = Math.max(2, Math.min(18, Math.floor(alter)));
  const obergrenze = Math.min(18, untergrenze + 1);
  const u = tabelle[untergrenze];
  const o = tabelle[obergrenze];
  if (untergrenze === obergrenze) return u;
  const anteil = Math.max(0, Math.min(1, alter - untergrenze));
  return {
    p3: u.p3 + (o.p3 - u.p3) * anteil,
    p10: u.p10 + (o.p10 - u.p10) * anteil,
    p90: u.p90 + (o.p90 - u.p90) * anteil,
    p97: u.p97 + (o.p97 - u.p97) * anteil,
  };
}

type Kategorie = {
  label: string;
  kurz: string;
  farbe: string;
  bg: string;
  text: string;
  beschreibung: string;
};

function klassifiziere(bmi: number, c: Cutoffs): Kategorie {
  if (bmi < c.p3) {
    return {
      label: 'Starkes Untergewicht',
      kurz: 'unter P3',
      farbe: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      beschreibung:
        'Der BMI liegt unter dem 3. Perzentil. Das deutet auf deutliches Untergewicht hin. Bitte lassen Sie das von einer Kinderärztin oder einem Kinderarzt abklären.',
    };
  }
  if (bmi < c.p10) {
    return {
      label: 'Untergewicht',
      kurz: 'P3 – P10',
      farbe: 'from-sky-500 to-blue-600',
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      beschreibung:
        'Der BMI liegt zwischen dem 3. und 10. Perzentil. Das gilt als leichtes Untergewicht. Häufig ist das unbedenklich, eine kinderärztliche Einordnung ist trotzdem sinnvoll.',
    };
  }
  if (bmi <= c.p90) {
    return {
      label: 'Normalgewicht',
      kurz: 'P10 – P90',
      farbe: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
      text: 'text-green-800',
      beschreibung:
        'Der BMI liegt im Normalbereich zwischen dem 10. und 90. Perzentil. Das Gewicht passt für dieses Alter und Geschlecht zur Körpergröße.',
    };
  }
  if (bmi <= c.p97) {
    return {
      label: 'Übergewicht',
      kurz: 'P90 – P97',
      farbe: 'from-orange-500 to-amber-600',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      beschreibung:
        'Der BMI liegt zwischen dem 90. und 97. Perzentil. Das gilt als Übergewicht. Sprechen Sie das bei der nächsten Vorsorgeuntersuchung (U/J) an.',
    };
  }
  return {
    label: 'Adipositas',
    kurz: 'über P97',
    farbe: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    text: 'text-red-800',
    beschreibung:
      'Der BMI liegt über dem 97. Perzentil. Das gilt als Adipositas (starkes Übergewicht). Eine kinderärztliche Abklärung und Begleitung wird empfohlen.',
  };
}

export function BmiKinderRechner() {
  const [alterJahre, setAlterJahre] = useState('10');
  const [alterMonate, setAlterMonate] = useState('0');
  const [geschlecht, setGeschlecht] = useState<'junge' | 'maedchen'>('junge');
  const [groesse, setGroesse] = useState('140');
  const [gewicht, setGewicht] = useState('33');

  const jahre = parseFloat(alterJahre.replace(',', '.'));
  const monate = parseFloat(alterMonate.replace(',', '.'));
  const groesseM = parseFloat(groesse.replace(',', '.')) / 100;
  const gewichtKg = parseFloat(gewicht.replace(',', '.'));

  const alterDezimal =
    (isNaN(jahre) ? 0 : jahre) + (isNaN(monate) ? 0 : monate) / 12;

  const eingabenOk =
    !isNaN(alterDezimal) &&
    alterDezimal >= 2 &&
    alterDezimal <= 18 &&
    !isNaN(groesseM) &&
    groesseM > 0.4 &&
    groesseM < 2.2 &&
    !isNaN(gewichtKg) &&
    gewichtKg > 5 &&
    gewichtKg < 200;

  const bmi = eingabenOk ? gewichtKg / (groesseM * groesseM) : null;
  const tabelle = geschlecht === 'junge' ? JUNGEN : MAEDCHEN;
  const cutoffs = eingabenOk ? cutoffsFuerAlter(tabelle, alterDezimal) : null;
  const kategorie = bmi !== null && cutoffs ? klassifiziere(bmi, cutoffs) : null;

  const altersHinweis =
    !isNaN(alterDezimal) && (alterDezimal < 2 || alterDezimal > 18);

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="BMI-Rechner für Kinder" rechnerSlug="bmi-kinder-rechner" />

      {/* YMYL-Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <span className="text-lg mt-0.5">⚕️</span>
          <p>
            <strong>Wichtiger Hinweis:</strong> Dieser Rechner liefert nur einen ersten Anhaltspunkt und
            ersetzt keine ärztliche Untersuchung. Wachstum und Körperbau von Kindern sind sehr
            unterschiedlich. Eine verlässliche Einordnung kann nur Ihre Kinderärztin oder Ihr Kinderarzt geben.
          </p>
        </div>
      </div>

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {/* Geschlecht */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Geschlecht des Kindes</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGeschlecht('junge')}
              className={`py-3 rounded-xl font-medium transition-all ${
                geschlecht === 'junge'
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👦 Junge
            </button>
            <button
              type="button"
              onClick={() => setGeschlecht('maedchen')}
              className={`py-3 rounded-xl font-medium transition-all ${
                geschlecht === 'maedchen'
                  ? 'bg-pink-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👧 Mädchen
            </button>
          </div>
        </div>

        {/* Alter */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Alter</span>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-gray-500">Jahre</span>
              <input
                type="number"
                inputMode="numeric"
                min={2}
                max={18}
                value={alterJahre}
                onChange={(e) => setAlterJahre(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500">Monate</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={11}
                value={alterMonate}
                onChange={(e) => setAlterMonate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-1">Gültig für 2 bis 18 Jahre</p>
        </div>

        {/* Größe & Gewicht */}
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium block mb-1">Größe</span>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={groesse}
                onChange={(e) => setGroesse(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium block mb-1">Gewicht</span>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={gewicht}
                onChange={(e) => setGewicht(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
            </div>
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      {bmi !== null && kategorie && cutoffs ? (
        <div className={`bg-gradient-to-br ${kategorie.farbe} rounded-2xl shadow-lg p-6 text-white`}>
          <h3 className="text-sm font-medium text-white/80 mb-1">BMI Ihres Kindes</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-bold">{bmi.toFixed(1).replace('.', ',')}</span>
            <span className="text-lg text-white/80">kg/m²</span>
          </div>
          <div className="inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-semibold backdrop-blur-sm mb-4">
            {kategorie.label} ({kategorie.kurz})
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/80">Untergewicht ab unter</span>
              <span className="font-medium">{cutoffs.p10.toFixed(1).replace('.', ',')} kg/m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Übergewicht ab über</span>
              <span className="font-medium">{cutoffs.p90.toFixed(1).replace('.', ',')} kg/m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Adipositas ab über</span>
              <span className="font-medium">{cutoffs.p97.toFixed(1).replace('.', ',')} kg/m²</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500">
          {altersHinweis ? (
            <p>
              Dieser Rechner gilt für Kinder und Jugendliche von <strong>2 bis 18 Jahren</strong>.
              Für Erwachsene nutzen Sie bitte den{' '}
              <a href="/bmi-rechner" className="text-blue-600 underline">BMI-Rechner</a>.
            </p>
          ) : (
            <p>Bitte geben Sie Alter, Geschlecht, Größe und Gewicht ein, um den BMI zu berechnen.</p>
          )}
        </div>
      )}

      {/* Einordnung */}
      {kategorie && (
        <div className={`mt-6 ${kategorie.bg} rounded-2xl p-5`}>
          <p className={`text-sm ${kategorie.text}`}>{kategorie.beschreibung}</p>
        </div>
      )}

      {/* Erklärung */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert der Kinder-BMI</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Berechnet wird der <strong>BMI = Gewicht ÷ (Größe × Größe)</strong> in kg/m².</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Bei Kindern wird der BMI <strong>nicht</strong> nach festen Erwachsenen-Grenzen bewertet,
              sondern über <strong>alters- und geschlechtsspezifische Perzentile</strong>.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Grundlage sind die <strong>Referenzwerte nach Kromeyer-Hauschild</strong> (AGA-Leitlinie).</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Ein Perzentil von 75 bedeutet: 75 % der gleichaltrigen Kinder gleichen Geschlechts haben einen
              niedrigeren BMI.
            </span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://adipositas-gesellschaft.de/wp-content/uploads/2020/09/bmiref.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Adipositas-Gesellschaft (AGA) – BMI-Perzentilkurven nach Kromeyer-Hauschild
          </a>
          <a
            href="https://adipositas-gesellschaft.de/ueber-adipositas/adipositas-im-kindes-jugendalter/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            AGA – Definition Adipositas im Kindes- & Jugendalter
          </a>
          <a
            href="https://adipositas-gesellschaft.de/aga/bmi4kids/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            AGA – BMI4Kids (Klassifikation P3/P10/P90/P97)
          </a>
        </div>
      </div>
    </div>
  );
}

export default BmiKinderRechner;
