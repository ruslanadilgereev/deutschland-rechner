import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ═══════════════════════════════════════════════════════════════
// ROTLICHTVERSTOSS – Bußgeldkatalog (BKatV)
// Stand 2024/2025/2026. Werte 1:1 aus dem verifizierten BussgeldRechner.
// Quelle: BKatV, ADAC
// ═══════════════════════════════════════════════════════════════

type Dauer = 'unter1Sek' | 'uber1Sek';
type Folgen = 'keine' | 'gefaehrdung' | 'sachschaden';

interface RotlichtEintrag {
  bussgeld: number;
  punkte: number;
  fahrverbot: number;
  beschreibung: string;
}

const ROTLICHT: Record<string, RotlichtEintrag> = {
  unter1Sek: { bussgeld: 90, punkte: 1, fahrverbot: 0, beschreibung: 'Einfacher Rotlichtverstoß (unter 1 Sek.)' },
  uber1Sek: { bussgeld: 200, punkte: 2, fahrverbot: 1, beschreibung: 'Qualifizierter Rotlichtverstoß (über 1 Sek.)' },
  unter1SekGefaehrdung: { bussgeld: 200, punkte: 2, fahrverbot: 1, beschreibung: 'Rotlichtverstoß mit Gefährdung' },
  uber1SekGefaehrdung: { bussgeld: 320, punkte: 2, fahrverbot: 1, beschreibung: 'Qualifizierter Rotlichtverstoß mit Gefährdung' },
  unter1SekSachschaden: { bussgeld: 240, punkte: 2, fahrverbot: 1, beschreibung: 'Rotlichtverstoß mit Sachschaden' },
  uber1SekSachschaden: { bussgeld: 360, punkte: 2, fahrverbot: 1, beschreibung: 'Qualifizierter Rotlichtverstoß mit Sachschaden' },
};

function keyFuer(dauer: Dauer, folgen: Folgen): string {
  if (folgen === 'keine') return dauer;
  if (folgen === 'gefaehrdung')
    return dauer === 'unter1Sek' ? 'unter1SekGefaehrdung' : 'uber1SekGefaehrdung';
  return dauer === 'unter1Sek' ? 'unter1SekSachschaden' : 'uber1SekSachschaden';
}

export function RotlichtverstossRechner() {
  const [dauer, setDauer] = useState<Dauer>('unter1Sek');
  const [folgen, setFolgen] = useState<Folgen>('keine');

  const ergebnis = useMemo(() => {
    const eintrag = ROTLICHT[keyFuer(dauer, folgen)];
    const hinweis =
      dauer === 'uber1Sek'
        ? 'Ein qualifizierter Rotlichtverstoß (Ampel länger als 1 Sekunde rot) führt immer zu 2 Punkten und Fahrverbot.'
        : folgen === 'keine'
          ? 'Faustregel: War die Ampel beim Überfahren bereits länger als 1 Sekunde rot, gilt der qualifizierte Verstoß.'
          : undefined;
    return { ...eintrag, hinweis };
  }, [dauer, folgen]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback
        rechnerName="Rotlichtverstoß-Rechner"
        rechnerSlug="rotlichtverstoss-rechner"
      />

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Rotphase */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wie lange war die Ampel rot?</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDauer('unter1Sek')}
              className={`py-4 px-4 rounded-xl font-medium transition-all ${
                dauer === 'unter1Sek'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-1">⏱️</div>
              <div>Unter 1 Sekunde</div>
              <div className="text-xs mt-1 opacity-75">Einfacher Rotlichtverstoß</div>
            </button>
            <button
              onClick={() => setDauer('uber1Sek')}
              className={`py-4 px-4 rounded-xl font-medium transition-all ${
                dauer === 'uber1Sek'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-2xl mb-1">⚠️</div>
              <div>Über 1 Sekunde</div>
              <div className="text-xs mt-1 opacity-75">Qualifizierter Verstoß!</div>
            </button>
          </div>
        </div>

        {/* Folgen */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kam es zu Folgen?</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'keine' as Folgen, label: 'Keine', icon: '✓' },
              { value: 'gefaehrdung' as Folgen, label: 'Gefährdung', icon: '⚡' },
              { value: 'sachschaden' as Folgen, label: 'Sachschaden', icon: '💥' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFolgen(option.value)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  folgen === option.value
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

      {/* Ergebnis */}
      <div
        className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
          ergebnis.fahrverbot > 0
            ? 'bg-gradient-to-br from-red-500 to-red-700'
            : ergebnis.punkte > 0
              ? 'bg-gradient-to-br from-orange-500 to-red-600'
              : 'bg-gradient-to-br from-yellow-500 to-orange-500'
        }`}
      >
        <h3 className="text-sm font-medium opacity-80 mb-1">🚦 Rotlichtverstoß – Ihre Strafe</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.bussgeld)}</span>
            <span className="text-xl opacity-80">Bußgeld</span>
          </div>
          <p className="mt-2 opacity-90">{ergebnis.beschreibung}</p>
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

        {ergebnis.hinweis && (
          <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm">💡 {ergebnis.hinweis}</p>
          </div>
        )}
      </div>

      {/* Einfach vs. qualifiziert */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⏱️ Einfacher vs. qualifizierter Rotlichtverstoß</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🟢</span>
            <div>
              <p className="font-medium text-gray-800">Einfacher Rotlichtverstoß (unter 1 Sek.)</p>
              <p>
                Die Ampel war beim Überfahren noch keine Sekunde rot. Folge: 90 € und 1 Punkt, kein
                Fahrverbot.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
            <span className="text-xl">🔴</span>
            <div>
              <p className="font-medium text-gray-800">Qualifizierter Rotlichtverstoß (über 1 Sek.)</p>
              <p>
                Die Ampel war bereits länger als eine Sekunde rot. Folge: 200 €, 2 Punkte und 1 Monat
                Fahrverbot – auch ohne Gefährdung.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Übersichtstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-2">📋 Bußgeldkatalog Rotlicht</h3>
        <p className="text-xs text-gray-500 mb-4">Stand 2026.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3">Verstoß</th>
                <th className="text-right py-2 px-3">Bußgeld</th>
                <th className="text-right py-2 px-3">Punkte</th>
                <th className="text-right py-2 px-3">Fahrverbot</th>
              </tr>
            </thead>
            <tbody>
              {[
                ROTLICHT.unter1Sek,
                ROTLICHT.unter1SekGefaehrdung,
                ROTLICHT.unter1SekSachschaden,
                ROTLICHT.uber1Sek,
                ROTLICHT.uber1SekGefaehrdung,
                ROTLICHT.uber1SekSachschaden,
              ].map((row) => (
                <tr
                  key={row.beschreibung}
                  className={`border-b border-gray-100 ${
                    ergebnis.beschreibung === row.beschreibung ? 'bg-orange-50 font-medium' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-gray-600">{row.beschreibung}</td>
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
          <a
            href="https://www.adac.de/verkehr/recht/bussgeld-punkte/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Bußgeldkatalog & Punkte
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Werte beruhen auf dem bundeseinheitlichen Bußgeldkatalog
          (BKatV, Stand 2026). Ob ein einfacher oder qualifizierter Verstoß vorliegt, entscheidet im
          Zweifel das Gericht anhand der Rotphasen-Dauer. Keine Rechtsberatung. Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default RotlichtverstossRechner;
