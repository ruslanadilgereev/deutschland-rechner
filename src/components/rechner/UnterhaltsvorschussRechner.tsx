import { useState, useMemo } from 'react';

// === OFFIZIELLE WERTE 2026 (gültig ab 01.01.2026) ===
// Unterhaltsvorschuss = Mindestunterhalt der Altersstufe (§ 1 MinUhV)
// MINUS volles Kindergeld für ein erstes Kind (§ 66 Abs. 1 EStG).
// Rechtsgrundlage: § 2 Abs. 1 i.V.m. Abs. 2 UhVorschG.

// Mindestunterhalt minderjähriger Kinder je Altersstufe, ab 01.01.2026
// Quelle: § 1 MinUhV – https://www.gesetze-im-internet.de/minuhv/__1.html
const MINDESTUNTERHALT_STUFE1 = 486; // 0–5 Jahre (§ 1 Nr. 1 MinUhV)
const MINDESTUNTERHALT_STUFE2 = 558; // 6–11 Jahre (§ 1 Nr. 2 MinUhV)
const MINDESTUNTERHALT_STUFE3 = 653; // 12–17 Jahre (§ 1 Nr. 3 MinUhV)

// Volles Kindergeld für ein erstes Kind, ab 01.01.2026
// Quelle: § 66 Abs. 1 EStG – https://www.gesetze-im-internet.de/estg/__66.html
// Datum amtlich bestätigt durch BMF (Anstieg um 4 € auf 259 € zum 01.01.2026)
const KINDERGELD_2026 = 259;

// Abgeleitete UV-Zahlbeträge 2026 (§ 2 Abs. 1 i.V.m. Abs. 2 UhVorschG)
// 486−259=227 (0–5) · 558−259=299 (6–11) · 653−259=394 (12–17)
// Quelle Rechenregel: § 2 UhVorschG – https://www.gesetze-im-internet.de/uhvorschg/__2.html

interface Altersstufe {
  key: 1 | 2 | 3;
  label: string;
  spanne: string;
  mindestunterhalt: number;
  uv: number;
}

const ALTERSSTUFEN: Altersstufe[] = [
  { key: 1, label: '1. Altersstufe', spanne: '0–5 Jahre', mindestunterhalt: MINDESTUNTERHALT_STUFE1, uv: MINDESTUNTERHALT_STUFE1 - KINDERGELD_2026 },
  { key: 2, label: '2. Altersstufe', spanne: '6–11 Jahre', mindestunterhalt: MINDESTUNTERHALT_STUFE2, uv: MINDESTUNTERHALT_STUFE2 - KINDERGELD_2026 },
  { key: 3, label: '3. Altersstufe', spanne: '12–17 Jahre', mindestunterhalt: MINDESTUNTERHALT_STUFE3, uv: MINDESTUNTERHALT_STUFE3 - KINDERGELD_2026 },
];

function stufeFuerAlter(alter: number): Altersstufe {
  if (alter <= 5) return ALTERSSTUFEN[0];
  if (alter <= 11) return ALTERSSTUFEN[1];
  return ALTERSSTUFEN[2];
}

export default function UnterhaltsvorschussRechner() {
  const [alter, setAlter] = useState(4);
  const [anzahlKinder, setAnzahlKinder] = useState(1);

  const ergebnis = useMemo(() => {
    const stufe = stufeFuerAlter(alter);
    const mindestunterhalt = stufe.mindestunterhalt;
    const uvProKind = mindestunterhalt - KINDERGELD_2026;
    const uvGesamt = uvProKind * anzahlKinder;

    return {
      stufe,
      mindestunterhalt,
      kindergeld: KINDERGELD_2026,
      uvProKind,
      uvGesamt,
      anzahlKinder,
      abGrenze12: alter >= 12,
    };
  }, [alter, anzahlKinder]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Alter des Kindes */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Alter des Kindes</span>
            <span className="text-xs text-gray-500 block mt-1">
              Das Alter bestimmt die Altersstufe und damit die Höhe des Unterhaltsvorschusses
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAlter(Math.max(0, alter - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
              aria-label="Alter verringern"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{alter}</span>
              <span className="text-gray-500 ml-1">{alter === 1 ? 'Jahr' : 'Jahre'}</span>
            </div>
            <button
              onClick={() => setAlter(Math.min(17, alter + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
              aria-label="Alter erhöhen"
            >
              +
            </button>
          </div>
          <input
            type="range"
            value={alter}
            onChange={(e) => setAlter(Number(e.target.value))}
            className="w-full mt-4 accent-pink-500"
            min="0"
            max="17"
            step="1"
          />
          <div className="mt-3 text-center">
            <span className="inline-block bg-pink-50 text-pink-700 text-sm font-medium px-3 py-1 rounded-full">
              {ergebnis.stufe.label} · {ergebnis.stufe.spanne}
            </span>
          </div>
        </div>

        {/* Anzahl Kinder */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahl Kinder in dieser Altersstufe</span>
            <span className="text-xs text-gray-500 block mt-1">
              Für Kinder in anderen Altersstufen bitte separat rechnen – jedes Kind hat einen eigenen Anspruch
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAnzahlKinder(Math.max(1, anzahlKinder - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
              aria-label="Anzahl verringern"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{anzahlKinder}</span>
              <span className="text-gray-500 ml-1">{anzahlKinder === 1 ? 'Kind' : 'Kinder'}</span>
            </div>
            <button
              onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
              aria-label="Anzahl erhöhen"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">👧 Ihr Unterhaltsvorschuss (2026)</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.uvGesamt)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          <p className="text-pink-100 mt-2 text-sm">
            {ergebnis.anzahlKinder > 1 ? (
              <>
                {ergebnis.anzahlKinder} × {formatEuroRound(ergebnis.uvProKind)} –{' '}
                {ergebnis.stufe.label} ({ergebnis.stufe.spanne})
              </>
            ) : (
              <>
                {ergebnis.stufe.label} ({ergebnis.stufe.spanne}) – Mindestunterhalt abzüglich
                Kindergeld
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Mindestunterhalt</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.mindestunterhalt)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">− Kindergeld</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.kindergeld)}</div>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Mindestunterhalt {ergebnis.stufe.spanne} (§ 1 MinUhV)
            </span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.mindestunterhalt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">− Volles Kindergeld (§ 66 EStG)</span>
            <span className="text-green-600 font-bold">−{formatEuro(ergebnis.kindergeld)}</span>
          </div>
          <div className="flex justify-between py-2 bg-pink-50 -mx-6 px-6">
            <span className="font-medium text-pink-700">= Unterhaltsvorschuss je Kind</span>
            <span className="font-bold text-pink-900">{formatEuro(ergebnis.uvProKind)}</span>
          </div>
          {ergebnis.anzahlKinder > 1 && (
            <div className="flex justify-between py-3 bg-pink-100 -mx-6 px-6 rounded-b-xl mt-2">
              <span className="font-bold text-pink-800">
                × {ergebnis.anzahlKinder} Kinder = Gesamt
              </span>
              <span className="font-bold text-2xl text-pink-900">
                {formatEuro(ergebnis.uvGesamt)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Altersstufen-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📅 Unterhaltsvorschuss 2026 nach Altersstufe</h3>
        <p className="text-sm text-gray-600 mb-4">
          Alle Beträge gelten ab dem 1. Januar 2026 (Mindestunterhalt minus volles Kindergeld von{' '}
          {formatEuroRound(KINDERGELD_2026)}):
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 border border-gray-200">Altersstufe</th>
                <th className="text-right p-2 border border-gray-200">Mindestunterhalt</th>
                <th className="text-right p-2 border border-gray-200">− Kindergeld</th>
                <th className="text-right p-2 border border-gray-200">= Vorschuss</th>
              </tr>
            </thead>
            <tbody>
              {ALTERSSTUFEN.map((s) => (
                <tr
                  key={s.key}
                  className={s.key === ergebnis.stufe.key ? 'bg-pink-50 font-semibold' : ''}
                >
                  <td className="p-2 border border-gray-200">{s.spanne}</td>
                  <td className="text-right p-2 border border-gray-200">
                    {formatEuroRound(s.mindestunterhalt)}
                  </td>
                  <td className="text-right p-2 border border-gray-200">
                    −{formatEuroRound(KINDERGELD_2026)}
                  </td>
                  <td className="text-right p-2 border border-gray-200 text-pink-700">
                    {formatEuroRound(s.uv)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Volle Kindergeldanrechnung:</strong> Beim Unterhaltsvorschuss wird das{' '}
              <strong>volle</strong> Kindergeld ({formatEuroRound(KINDERGELD_2026)}) abgezogen – nicht
              nur das halbe wie beim Barunterhalt nach der Düsseldorfer Tabelle.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Kinder ab 12 Jahren:</strong> Für die 3. Altersstufe gelten zusätzliche
              Voraussetzungen (u. a. darf das Kind keine bzw. nur geringe eigene Leistungen wie
              Bürgergeld beziehen, oder der betreuende Elternteil erzielt ein Mindesteinkommen). Der
              hier gezeigte Betrag ist die reine Höhe nach der Altersstufe – der konkrete Anspruch ab
              12 Jahren wird vom Jugendamt geprüft.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Anrechnung eigener Zahlungen:</strong> Zahlt der andere Elternteil bereits
              Unterhalt oder bezieht das Kind Waisenrente, mindert das den Vorschuss. Solche
              Zuflüsse sind in diesem Rechner nicht berücksichtigt.
            </span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stelle</h3>
        <div className="bg-pink-50 rounded-xl p-4 text-sm">
          <p className="font-semibold text-pink-900">Jugendamt / Unterhaltsvorschusskasse</p>
          <p className="text-pink-700 mt-1">
            Den Unterhaltsvorschuss beantragen Sie beim Jugendamt Ihrer Stadt oder Ihres Landkreises.
            Dort wird der konkrete Anspruch – insbesondere die zusätzlichen Voraussetzungen ab 12
            Jahren und die Anrechnung anderer Zahlungen – verbindlich geprüft.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <p className="text-sm text-gray-600">
          <strong>Hinweis:</strong> Diese Berechnung ist eine unverbindliche Schätzung und ersetzt
          keine Rechts- oder Steuerberatung. Maßgeblich ist die Entscheidung der zuständigen
          Unterhaltsvorschusskasse beim Jugendamt.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/uhvorschg/__2.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 2 UhVorschG – Umfang der Unterhaltsleistung (Rechenregel)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/minuhv/__1.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 1 MinUhV – Mindestunterhalt (486 / 558 / 653 € ab 2026)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__66.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 66 Abs. 1 EStG – Kindergeld (259 € ab 2026)
          </a>
          <a
            href="https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/das-aendert-sich-2026.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Steuerliche Änderungen 2026 (Kindergeld 259 €)
          </a>
          <a
            href="https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/index.php"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            OLG Düsseldorf – Düsseldorfer Tabelle 2026 (Kontext)
          </a>
        </div>
      </div>
    </div>
  );
}
