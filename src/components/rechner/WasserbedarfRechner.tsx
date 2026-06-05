import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ════════════════════════════════════════════════════════════════
// Wasserbedarf-Rechner
// Grundlage: DGE-Referenzwerte für die Wasserzufuhr (D-A-CH)
// Quelle: https://www.dge.de/wissenschaft/referenzwerte/wasser/
//
// Faustformel ml pro kg Körpergewicht und Tag (Gesamtwasserzufuhr,
// daraus rund 50-60 % über Getränke):
//   - Kinder/Jugendliche: bis ~40 ml/kg
//   - Erwachsene 19-50 Jahre: ~35 ml/kg
//   - Senioren ab 51/65 Jahre: ~30 ml/kg
// Die DGE nennt als Orientierung für Erwachsene rund 1,5 l über
// Getränke pro Tag. Wir rechnen den Getränkeanteil als ca. 55 %
// der Gesamtwasserzufuhr, da der Rest aus fester Nahrung und
// Oxidationswasser stammt.
// ════════════════════════════════════════════════════════════════

// ml Gesamtwasserzufuhr pro kg Körpergewicht und Tag nach Altersgruppe
const ML_PRO_KG: { minAlter: number; maxAlter: number; mlProKg: number; label: string }[] = [
  { minAlter: 0, maxAlter: 14, mlProKg: 40, label: 'Kinder' },
  { minAlter: 15, maxAlter: 18, mlProKg: 40, label: 'Jugendliche' },
  { minAlter: 19, maxAlter: 50, mlProKg: 35, label: 'Erwachsene (19–50 Jahre)' },
  { minAlter: 51, maxAlter: 120, mlProKg: 30, label: 'ab 51 Jahren' },
];

// Anteil der Gesamtwasserzufuhr, der über Getränke gedeckt werden soll
const GETRAENKE_ANTEIL = 0.55;

// Aktivitätsstufen – Zuschlag pro Stunde intensiver Bewegung (ml)
const AKTIVITAET = {
  keine: { label: 'Kein Sport', proStunde: 0 },
  leicht: { label: 'Leicht (Spaziergang, Alltag)', proStunde: 300 },
  mittel: { label: 'Moderat (Joggen, Radfahren)', proStunde: 500 },
  intensiv: { label: 'Intensiv (Kraft-/Ausdauersport)', proStunde: 750 },
} as const;

type AktivitaetKey = keyof typeof AKTIVITAET;

// Wetter-Zuschlag (auf den Getränkeanteil)
const WETTER = {
  normal: { label: 'Normal (bis 25 °C)', faktor: 1.0, zuschlag: 0 },
  warm: { label: 'Warm (25–30 °C)', faktor: 1.0, zuschlag: 500 },
  heiss: { label: 'Heiß (über 30 °C)', faktor: 1.0, zuschlag: 1000 },
} as const;

type WetterKey = keyof typeof WETTER;

export default function WasserbedarfRechner() {
  const [gewicht, setGewicht] = useState<number>(70);
  const [alter, setAlter] = useState<number>(35);
  const [aktivitaet, setAktivitaet] = useState<AktivitaetKey>('keine');
  const [sportStunden, setSportStunden] = useState<number>(1);
  const [wetter, setWetter] = useState<WetterKey>('normal');

  const ergebnis = useMemo(() => {
    if (!gewicht || gewicht < 20 || gewicht > 250 || alter < 0 || alter > 120) {
      return null;
    }

    const gruppe =
      ML_PRO_KG.find((g) => alter >= g.minAlter && alter <= g.maxAlter) ||
      ML_PRO_KG[ML_PRO_KG.length - 1];

    // Gesamtwasserzufuhr (Getränke + feste Nahrung + Oxidationswasser)
    const gesamtwasserBasis = gewicht * gruppe.mlProKg;

    // Getränke-Grundbedarf (ca. 55 % der Gesamtwasserzufuhr)
    const getraenkeBasis = gesamtwasserBasis * GETRAENKE_ANTEIL;

    // Sport-Zuschlag
    const sport = AKTIVITAET[aktivitaet];
    const sportZuschlag =
      aktivitaet === 'keine' ? 0 : sport.proStunde * Math.max(0, sportStunden);

    // Wetter-Zuschlag
    const wetterZuschlag = WETTER[wetter].zuschlag;

    // Empfohlene Trinkmenge über Getränke (ml)
    const trinkmengeMl = getraenkeBasis + sportZuschlag + wetterZuschlag;

    return {
      gruppeLabel: gruppe.label,
      mlProKg: gruppe.mlProKg,
      gesamtwasserBasis: Math.round(gesamtwasserBasis),
      getraenkeBasis: Math.round(getraenkeBasis),
      sportZuschlag,
      wetterZuschlag,
      trinkmengeMl: Math.round(trinkmengeMl),
      trinkmengeLiter: trinkmengeMl / 1000,
      glaeser: Math.round(trinkmengeMl / 250), // Gläser à 250 ml
    };
  }, [gewicht, alter, aktivitaet, sportStunden, wetter]);

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Wasserbedarf-Rechner" rechnerSlug="wasserbedarf-rechner" />

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-6">
        {/* Gewicht */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-700 font-medium" htmlFor="gewicht">
              Körpergewicht
            </label>
            <span className="text-blue-600 font-bold text-lg">{gewicht} kg</span>
          </div>
          <input
            id="gewicht"
            type="range"
            min={20}
            max={150}
            step={1}
            value={gewicht}
            onChange={(e) => setGewicht(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>20 kg</span>
            <span>150 kg</span>
          </div>
        </div>

        {/* Alter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-700 font-medium" htmlFor="alter">
              Alter
            </label>
            <span className="text-blue-600 font-bold text-lg">{alter} Jahre</span>
          </div>
          <input
            id="alter"
            type="range"
            min={1}
            max={100}
            step={1}
            value={alter}
            onChange={(e) => setAlter(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 Jahr</span>
            <span>100 Jahre</span>
          </div>
        </div>

        {/* Aktivität */}
        <div>
          <span className="block text-gray-700 font-medium mb-2">Sportliche Aktivität</span>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(AKTIVITAET) as AktivitaetKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAktivitaet(key)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                  aktivitaet === key
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {AKTIVITAET[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Sportdauer (nur wenn Sport gewählt) */}
        {aktivitaet !== 'keine' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-700 font-medium" htmlFor="sport">
                Sportdauer pro Tag
              </label>
              <span className="text-blue-600 font-bold text-lg">
                {sportStunden} {sportStunden === 1 ? 'Stunde' : 'Stunden'}
              </span>
            </div>
            <input
              id="sport"
              type="range"
              min={0}
              max={4}
              step={0.5}
              value={sportStunden}
              onChange={(e) => setSportStunden(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 h</span>
              <span>4 h</span>
            </div>
          </div>
        )}

        {/* Wetter */}
        <div>
          <span className="block text-gray-700 font-medium mb-2">Wetter / Temperatur</span>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(WETTER) as WetterKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setWetter(key)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                  wetter === key
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {WETTER[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {ergebnis ? (
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium text-blue-100 mb-1">Ihre empfohlene Trinkmenge</h3>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">
                {ergebnis.trinkmengeLiter.toLocaleString('de-DE', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
              <span className="text-xl text-blue-100">Liter / Tag</span>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              entspricht etwa {ergebnis.glaeser} Gläsern à 250 ml
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-100">Grundbedarf über Getränke</span>
              <span className="font-medium">
                {(ergebnis.getraenkeBasis / 1000).toLocaleString('de-DE', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{' '}
                l
              </span>
            </div>
            {ergebnis.sportZuschlag > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-100">Zuschlag Sport</span>
                <span className="font-medium">
                  + {(ergebnis.sportZuschlag / 1000).toLocaleString('de-DE', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{' '}
                  l
                </span>
              </div>
            )}
            {ergebnis.wetterZuschlag > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-100">Zuschlag Hitze</span>
                <span className="font-medium">
                  + {(ergebnis.wetterZuschlag / 1000).toLocaleString('de-DE', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{' '}
                  l
                </span>
              </div>
            )}
            <div className="border-t border-white/20 pt-2 flex justify-between">
              <span className="text-blue-100">Gesamtwasserzufuhr (inkl. Nahrung)</span>
              <span className="font-medium">
                ~{' '}
                {(ergebnis.gesamtwasserBasis / 1000).toLocaleString('de-DE', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{' '}
                l
              </span>
            </div>
          </div>

          <p className="text-xs text-blue-100 mt-3">
            Berechnung: {ergebnis.mlProKg} ml pro kg Körpergewicht ({ergebnis.gruppeLabel}),
            davon rund 55 % über Getränke, plus Zuschläge.
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-yellow-800 text-sm">
          Bitte geben Sie ein realistisches Körpergewicht (20–250 kg) und Alter (0–120 Jahre) ein.
        </div>
      )}

      {/* YMYL-Disclaimer */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">⚕️</span>
          <div className="text-sm text-red-800">
            <p className="font-semibold mb-1">Wichtiger Gesundheitshinweis</p>
            <p className="mb-2">
              Dieser Rechner liefert eine grobe Orientierung und ersetzt{' '}
              <strong>keine ärztliche Beratung</strong>. Der tatsächliche Flüssigkeitsbedarf
              hängt von vielen weiteren Faktoren ab (Erkrankungen, Medikamente, Fieber,
              Schwangerschaft, Stillzeit).
            </p>
            <p>
              <strong>Vorsicht bei Herz- oder Nierenerkrankungen:</strong> Hier kann eine
              ärztlich verordnete Trinkmengen-Begrenzung gelten. Auch zu viel Trinken kann
              in seltenen Fällen gefährlich sein (Hyponatriämie). Sprechen Sie im Zweifel mit
              Ihrer Ärztin oder Ihrem Arzt.
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">💡 So funktioniert die Berechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Faustformel der DGE/D-A-CH: rund <strong>30–40 ml pro kg Körpergewicht</strong>{' '}
              Gesamtwasserzufuhr pro Tag (altersabhängig).
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Etwa <strong>die Hälfte</strong> davon nehmen Sie über feste Nahrung auf – der Rest
              (ca. 1,5 l bei Erwachsenen) sollte über Getränke kommen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Bei <strong>Sport</strong> kommen je nach Intensität 0,3–0,75 l pro Stunde dazu,
              bei <strong>Hitze</strong> 0,5–1,0 l zusätzlich.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Wasser, ungesüßte Tees und stark verdünnte Saftschorlen sind ideal – Kaffee zählt
              in Maßen ebenfalls mit.
            </span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.dge.de/wissenschaft/referenzwerte/wasser/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DGE – Referenzwerte für die Wasserzufuhr
          </a>
          <a
            href="https://www.dge.de/gesunde-ernaehrung/faq/wie-viel-sollte-man-trinken/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DGE – Wie viel sollte man trinken?
          </a>
        </div>
      </div>
    </div>
  );
}
