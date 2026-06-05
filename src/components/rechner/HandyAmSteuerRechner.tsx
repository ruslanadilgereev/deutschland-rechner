import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ═══════════════════════════════════════════════════════════════
// Handy am Steuer (§ 23 Abs. 1a StVO), Stand 2026
// Quelle: bussgeldkatalog.org, ADAC, gesetze-im-internet.de
// ═══════════════════════════════════════════════════════════════

interface HandyVerstoss {
  id: string;
  icon: string;
  label: string;
  beschreibung: string;
  bussgeld: number;
  punkte: number;
  fahrverbot: number; // Monate
  aVerstoss: boolean; // relevant für Probezeit
}

const VERSTOESSE: HandyVerstoss[] = [
  {
    id: 'auto',
    icon: '📱',
    label: 'Autofahrer (Standard)',
    beschreibung: 'Handy am Steuer als Autofahrer – ohne weitere Folgen',
    bussgeld: 100,
    punkte: 1,
    fahrverbot: 0,
    aVerstoss: true,
  },
  {
    id: 'gefaehrdung',
    icon: '⚠️',
    label: 'Mit Gefährdung',
    beschreibung: 'Handy am Steuer mit Gefährdung anderer (Beinahe-Unfall)',
    bussgeld: 150,
    punkte: 2,
    fahrverbot: 1,
    aVerstoss: true,
  },
  {
    id: 'sachschaden',
    icon: '💥',
    label: 'Mit Sachschaden',
    beschreibung: 'Handy am Steuer mit verursachtem Sachschaden (Unfall)',
    bussgeld: 200,
    punkte: 2,
    fahrverbot: 1,
    aVerstoss: true,
  },
  {
    id: 'lkw',
    icon: '🚚',
    label: 'LKW / Bus',
    beschreibung: 'Handy am Steuer als Fahrer eines LKW oder Busses',
    bussgeld: 100,
    punkte: 1,
    fahrverbot: 0,
    aVerstoss: true,
  },
  {
    id: 'escooter',
    icon: '🛴',
    label: 'E-Scooter',
    beschreibung: 'Handy während der Fahrt auf einem E-Scooter',
    bussgeld: 100,
    punkte: 1,
    fahrverbot: 0,
    aVerstoss: true,
  },
  {
    id: 'rad',
    icon: '🚴',
    label: 'Radfahrer',
    beschreibung: 'Handy in der Hand während der Fahrt auf dem Fahrrad',
    bussgeld: 55,
    punkte: 0,
    fahrverbot: 0,
    aVerstoss: false,
  },
];

export function HandyAmSteuerRechner() {
  const [verstossId, setVerstossId] = useState<string>('auto');
  const [probezeit, setProbezeit] = useState(false);

  const verstoss = VERSTOESSE.find((v) => v.id === verstossId) || VERSTOESSE[0];

  const ergebnis = useMemo(() => {
    const probezeitFolge = probezeit && verstoss.aVerstoss;
    return {
      bussgeld: verstoss.bussgeld,
      punkte: verstoss.punkte,
      fahrverbot: verstoss.fahrverbot,
      probezeitFolge,
    };
  }, [verstoss, probezeit]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Handy-am-Steuer-Bußgeldrechner" rechnerSlug="handy-am-steuer-rechner" />

      {/* Verstoß-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-3">
          <span className="text-gray-700 font-medium">Wer hat das Handy benutzt?</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {VERSTOESSE.map((v) => (
            <button
              key={v.id}
              onClick={() => setVerstossId(v.id)}
              className={`py-3 px-3 rounded-xl font-medium transition-all text-sm text-left ${
                verstossId === v.id
                  ? v.fahrverbot > 0
                    ? 'bg-red-500 text-white'
                    : 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{v.icon}</span>
              {v.label}
            </button>
          ))}
        </div>

        {/* Probezeit */}
        <div className="mt-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={probezeit}
              onChange={(e) => setProbezeit(e.target.checked)}
              className="w-5 h-5 accent-orange-500"
            />
            <span className="text-sm text-gray-700">
              Fahranfänger in der Probezeit oder unter 21 Jahre
            </span>
          </label>
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
        <h3 className="text-sm font-medium opacity-80 mb-1">🚨 Ihre Strafe</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.bussgeld)}</span>
            <span className="text-xl opacity-80">Bußgeld</span>
          </div>
          <p className="mt-2 opacity-90">{verstoss.beschreibung}</p>
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

        {ergebnis.probezeitFolge && (
          <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm">
              💡 In der Probezeit ist Handy am Steuer ein <strong>A-Verstoß</strong>: Es droht ein
              kostenpflichtiges Aufbauseminar und die Verlängerung der Probezeit von 2 auf 4 Jahre.
            </p>
          </div>
        )}

        {!ergebnis.probezeitFolge && verstoss.id === 'rad' && (
          <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm">
              💡 Auch Radfahrer dürfen das Handy während der Fahrt nicht in die Hand nehmen – das kostet 55 €.
            </p>
          </div>
        )}
      </div>

      {/* So wird gerechnet */}
      <div className="bg-blue-50 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <p className="text-sm text-gray-700">
          Der Rechner ordnet der gewählten Situation den Regelsatz aus dem bundesweiten Bußgeldkatalog
          zu (§ 23 Abs. 1a StVO). Verboten ist jedes Aufnehmen oder Halten eines elektronischen Geräts –
          Handy, Tablet, Navi oder E-Book-Reader – während der Fahrt.
        </p>
        <div className="bg-white rounded-lg p-4 mt-3 text-sm text-gray-700">
          <p className="font-medium mb-1">{verstoss.label}</p>
          <p>
            Regelsatz: <strong>{formatEuro(ergebnis.bussgeld)}</strong>
            {ergebnis.punkte > 0 ? ` + ${ergebnis.punkte} Punkt(e) in Flensburg` : ' + keine Punkte'}
            {ergebnis.fahrverbot > 0 ? ` + ${ergebnis.fahrverbot} Monat Fahrverbot` : ''}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-yellow-800 mb-2">⚠️ Angaben ohne Gewähr</h3>
        <p className="text-sm text-yellow-700">
          Die Werte entsprechen dem bundesweiten Bußgeldkatalog (§ 23 Abs. 1a StVO, Stand 2026). Bei
          einem Unfall mit Personenschaden können zusätzlich strafrechtliche Folgen hinzukommen. Dieser
          Rechner ist ein Richtwert und ersetzt keine Rechtsberatung.
        </p>
      </div>
    </div>
  );
}

export default HandyAmSteuerRechner;
