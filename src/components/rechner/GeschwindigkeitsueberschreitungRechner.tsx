import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════
// GESCHWINDIGKEITSÜBERSCHREITUNG – Bußgeldkatalog (BKatV)
// Stand 2024/2025/2026. Werte 1:1 aus dem verifizierten BussgeldRechner.
// Quelle: BKatV, ADAC, bussgeldkatalog.org
// ═══════════════════════════════════════════════════════════════

type OrtTyp = 'innerorts' | 'ausserorts';
type FahrzeugTyp = 'pkw' | 'lkw';

interface TempoEintrag {
  bis: number; // obere Grenze der Überschreitung in km/h (inklusive)
  bussgeld: number;
  punkte: number;
  fahrverbot: number; // Monate, 0 = kein Fahrverbot
}

// PKW innerorts
const PKW_INNERORTS: TempoEintrag[] = [
  { bis: 10, bussgeld: 30, punkte: 0, fahrverbot: 0 },
  { bis: 15, bussgeld: 50, punkte: 0, fahrverbot: 0 },
  { bis: 20, bussgeld: 70, punkte: 0, fahrverbot: 0 },
  { bis: 25, bussgeld: 115, punkte: 1, fahrverbot: 0 },
  { bis: 30, bussgeld: 180, punkte: 1, fahrverbot: 0 },
  { bis: 40, bussgeld: 260, punkte: 2, fahrverbot: 1 },
  { bis: 50, bussgeld: 400, punkte: 2, fahrverbot: 1 },
  { bis: 60, bussgeld: 560, punkte: 2, fahrverbot: 2 },
  { bis: 70, bussgeld: 700, punkte: 2, fahrverbot: 3 },
  { bis: Infinity, bussgeld: 800, punkte: 2, fahrverbot: 3 },
];

// PKW außerorts (gilt hier auch für Autobahn)
const PKW_AUSSERORTS: TempoEintrag[] = [
  { bis: 10, bussgeld: 20, punkte: 0, fahrverbot: 0 },
  { bis: 15, bussgeld: 40, punkte: 0, fahrverbot: 0 },
  { bis: 20, bussgeld: 60, punkte: 0, fahrverbot: 0 },
  { bis: 25, bussgeld: 100, punkte: 1, fahrverbot: 0 },
  { bis: 30, bussgeld: 150, punkte: 1, fahrverbot: 0 },
  { bis: 40, bussgeld: 200, punkte: 1, fahrverbot: 0 },
  { bis: 50, bussgeld: 320, punkte: 2, fahrverbot: 1 },
  { bis: 60, bussgeld: 480, punkte: 2, fahrverbot: 1 },
  { bis: 70, bussgeld: 600, punkte: 2, fahrverbot: 2 },
  { bis: Infinity, bussgeld: 700, punkte: 2, fahrverbot: 3 },
];

// LKW (über 3,5 t) innerorts – nach BKatV höhere Sätze
const LKW_INNERORTS: TempoEintrag[] = [
  { bis: 10, bussgeld: 50, punkte: 0, fahrverbot: 0 },
  { bis: 15, bussgeld: 100, punkte: 0, fahrverbot: 0 },
  { bis: 20, bussgeld: 175, punkte: 1, fahrverbot: 0 },
  { bis: 25, bussgeld: 235, punkte: 1, fahrverbot: 0 },
  { bis: 30, bussgeld: 340, punkte: 2, fahrverbot: 1 },
  { bis: 40, bussgeld: 560, punkte: 2, fahrverbot: 1 },
  { bis: 50, bussgeld: 700, punkte: 2, fahrverbot: 2 },
  { bis: 60, bussgeld: 800, punkte: 2, fahrverbot: 3 },
  { bis: Infinity, bussgeld: 875, punkte: 2, fahrverbot: 3 },
];

// LKW (über 3,5 t) außerorts
const LKW_AUSSERORTS: TempoEintrag[] = [
  { bis: 10, bussgeld: 40, punkte: 0, fahrverbot: 0 },
  { bis: 15, bussgeld: 60, punkte: 0, fahrverbot: 0 },
  { bis: 20, bussgeld: 140, punkte: 1, fahrverbot: 0 },
  { bis: 25, bussgeld: 175, punkte: 1, fahrverbot: 0 },
  { bis: 30, bussgeld: 235, punkte: 2, fahrverbot: 0 },
  { bis: 40, bussgeld: 340, punkte: 2, fahrverbot: 1 },
  { bis: 50, bussgeld: 560, punkte: 2, fahrverbot: 1 },
  { bis: 60, bussgeld: 700, punkte: 2, fahrverbot: 2 },
  { bis: Infinity, bussgeld: 800, punkte: 2, fahrverbot: 3 },
];

function tabelleFuer(fahrzeug: FahrzeugTyp, ort: OrtTyp): TempoEintrag[] {
  if (fahrzeug === 'lkw') {
    return ort === 'innerorts' ? LKW_INNERORTS : LKW_AUSSERORTS;
  }
  return ort === 'innerorts' ? PKW_INNERORTS : PKW_AUSSERORTS;
}

export function GeschwindigkeitsueberschreitungRechner() {
  const [fahrzeug, setFahrzeug] = useState<FahrzeugTyp>('pkw');
  const [ort, setOrt] = useState<OrtTyp>('innerorts');
  const [erlaubt, setErlaubt] = useState(50);
  const [gemessen, setGemessen] = useState(75);

  // Eingabe robust in eine Zahl >= 0 umwandeln (leeres/ungültiges Feld = 0).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const ergebnis = useMemo(() => {
    // Toleranzabzug: 3 km/h bei gemessenen bis 100 km/h, sonst 3 % vom Messwert.
    const toleranz = gemessen <= 100 ? 3 : gemessen * 0.03;
    const bereinigt = Math.max(0, gemessen - toleranz);
    const ueberschreitung = Math.max(0, Math.round(bereinigt - erlaubt));

    const tabelle = tabelleFuer(fahrzeug, ort);
    const eintrag =
      tabelle.find((e) => ueberschreitung <= e.bis) || tabelle[tabelle.length - 1];

    // Hinweis zur Fahrverbots-Schwelle bzw. Wiederholungstäter-Regel.
    let hinweis: string | undefined;
    if (fahrzeug === 'pkw') {
      if (ort === 'innerorts') {
        if (ueberschreitung >= 31) hinweis = 'Ab 31 km/h innerorts droht ein Fahrverbot.';
        else if (ueberschreitung >= 26)
          hinweis = 'Bei Wiederholung innerhalb eines Jahres droht auch hier ein Fahrverbot.';
      } else {
        if (ueberschreitung >= 41) hinweis = 'Ab 41 km/h außerorts droht ein Fahrverbot.';
        else if (ueberschreitung >= 26)
          hinweis = 'Bei Wiederholung innerhalb eines Jahres droht auch hier ein Fahrverbot.';
      }
    }

    return {
      toleranz,
      bereinigt,
      ueberschreitung,
      bussgeld: ueberschreitung === 0 ? 0 : eintrag.bussgeld,
      punkte: ueberschreitung === 0 ? 0 : eintrag.punkte,
      fahrverbot: ueberschreitung === 0 ? 0 : eintrag.fahrverbot,
      hinweis,
    };
  }, [fahrzeug, ort, erlaubt, gemessen]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatKmh = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  const tabelleAnzeige = tabelleFuer(fahrzeug, ort);

  // Lesbare Bereichs-Labels für die Übersichtstabelle erzeugen.
  const tabelleZeilen = tabelleAnzeige.map((e, idx) => {
    const vorher = idx === 0 ? 0 : tabelleAnzeige[idx - 1].bis;
    const label =
      e.bis === Infinity ? `über ${vorher}` : idx === 0 ? `bis ${e.bis}` : `${vorher + 1}–${e.bis}`;
    return { ...e, label };
  });

  return (
    <div className="max-w-2xl mx-auto">

      {/* Fahrzeug & Ort */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div>
          <span className="text-gray-700 font-medium block mb-2">Fahrzeug</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'pkw' as FahrzeugTyp, label: 'Pkw / Motorrad', icon: '🚗' },
              { value: 'lkw' as FahrzeugTyp, label: 'Lkw über 3,5 t', icon: '🚚' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFahrzeug(option.value)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  fahrzeug === option.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-gray-700 font-medium block mb-2">Wo war der Verstoß?</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'innerorts' as OrtTyp, label: 'Innerorts', icon: '🏘️' },
              { value: 'ausserorts' as OrtTyp, label: 'Außerorts / Autobahn', icon: '🛣️' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setOrt(option.value)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  ort === option.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Geschwindigkeiten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Erlaubte Geschwindigkeit</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={erlaubt}
              onChange={(e) => setErlaubt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km/h</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Gemessene Geschwindigkeit (Tacho/Blitzer)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={gemessen}
              onChange={(e) => setGemessen(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km/h</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Vom Messwert wird automatisch die übliche Toleranz abgezogen (3 km/h bis 100 km/h,
            sonst 3 %).
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div
        className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
          ergebnis.fahrverbot > 0
            ? 'bg-gradient-to-br from-red-500 to-red-700'
            : ergebnis.punkte > 0
              ? 'bg-gradient-to-br from-orange-500 to-red-600'
              : ergebnis.bussgeld > 0
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                : 'bg-gradient-to-br from-emerald-500 to-green-600'
        }`}
      >
        <h3 className="text-sm font-medium opacity-80 mb-1">🚗 Ihre Strafe</h3>

        {ergebnis.ueberschreitung === 0 ? (
          <div className="mb-2">
            <span className="text-4xl font-bold">Kein Verstoß</span>
            <p className="mt-2 opacity-90">
              Nach Toleranzabzug liegt keine relevante Überschreitung vor.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatEuro(ergebnis.bussgeld)}</span>
                <span className="text-xl opacity-80">Bußgeld</span>
              </div>
              <p className="mt-2 opacity-90">
                {ergebnis.ueberschreitung} km/h zu schnell ·{' '}
                {ort === 'innerorts' ? 'innerorts' : 'außerorts'} ·{' '}
                {fahrzeug === 'pkw' ? 'Pkw' : 'Lkw'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Punkte in Flensburg</span>
                <div className="text-3xl font-bold">{ergebnis.punkte}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Fahrverbot</span>
                <div className="text-3xl font-bold">
                  {ergebnis.fahrverbot > 0 ? `${ergebnis.fahrverbot} Mon.` : 'Nein'}
                </div>
              </div>
            </div>
          </>
        )}

        {ergebnis.hinweis && (
          <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm">💡 {ergebnis.hinweis}</p>
          </div>
        )}
      </div>

      {/* Rechenweg */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-orange-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Toleranzabzug</strong> = {formatKmh(ergebnis.toleranz)} km/h →{' '}
            {formatKmh(gemessen)} − {formatKmh(ergebnis.toleranz)} ={' '}
            <strong>{formatKmh(ergebnis.bereinigt)} km/h</strong> (vorwerfbar)
          </p>
          <p>
            <strong>Überschreitung</strong> = {formatKmh(ergebnis.bereinigt)} − {formatKmh(erlaubt)}{' '}
            = <strong>{ergebnis.ueberschreitung} km/h</strong>
          </p>
          <p>
            Daraus folgt laut Bußgeldkatalog:{' '}
            <strong>
              {formatEuro(ergebnis.bussgeld)}, {ergebnis.punkte} Punkt(e)
              {ergebnis.fahrverbot > 0 ? `, ${ergebnis.fahrverbot} Monat(e) Fahrverbot` : ''}
            </strong>
          </p>
        </div>
      </div>

      {/* Übersichtstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-2">
          📋 Bußgeldkatalog – {fahrzeug === 'pkw' ? 'Pkw' : 'Lkw'},{' '}
          {ort === 'innerorts' ? 'innerorts' : 'außerorts'}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Überschreitung nach Toleranzabzug, in km/h. Stand 2026.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3">Überschreitung</th>
                <th className="text-right py-2 px-3">Bußgeld</th>
                <th className="text-right py-2 px-3">Punkte</th>
                <th className="text-right py-2 px-3">Fahrverbot</th>
              </tr>
            </thead>
            <tbody>
              {tabelleZeilen.map((row) => (
                <tr
                  key={row.label}
                  className={`border-b border-gray-100 ${
                    ergebnis.ueberschreitung > 0 &&
                    ergebnis.bussgeld === row.bussgeld &&
                    ergebnis.punkte === row.punkte &&
                    ergebnis.fahrverbot === row.fahrverbot
                      ? 'bg-orange-50 font-medium'
                      : ''
                  }`}
                >
                  <td className="py-2 px-3 text-gray-600">{row.label} km/h</td>
                  <td className="py-2 px-3 text-right">{row.bussgeld} €</td>
                  <td className="py-2 px-3 text-right">{row.punkte}</td>
                  <td className="py-2 px-3 text-right text-red-600">
                    {row.fahrverbot > 0 ? `${row.fahrverbot} Mon.` : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/bkatv_2013/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bußgeldkatalog-Verordnung (BKatV) – Gesetze im Internet
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Werte beruhen auf dem bundeseinheitlichen Bußgeldkatalog
          (BKatV, Stand 2026). Im Einzelfall können Gefährdung, Sachschaden, Wiederholung oder
          Probezeit zu Abweichungen führen. Keine Rechtsberatung. Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default GeschwindigkeitsueberschreitungRechner;
