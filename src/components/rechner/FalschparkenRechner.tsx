import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ═══════════════════════════════════════════════════════════════
// Bußgeldkatalog Halten & Parken (§ 12 StVO), Stand seit 9.11.2021
// Quelle: bussgeldkatalog.org, ADAC, gesetze-im-internet.de (BKatV)
// ═══════════════════════════════════════════════════════════════

interface ParkVerstoss {
  id: string;
  icon: string;
  label: string;
  beschreibung: string;
  bussgeld: number;
  punkte: number;
  abschleppen: boolean;
  hinweis?: string;
}

// Verstoß-Katalog (jeweils der typische, häufig genannte Regelfall)
const VERSTOESSE: ParkVerstoss[] = [
  {
    id: 'parkschein',
    icon: '🎫',
    label: 'Ohne/abgelaufener Parkschein',
    beschreibung: 'Parkschein oder Parkscheibe fehlt bzw. ist abgelaufen',
    bussgeld: 20,
    punkte: 0,
    abschleppen: false,
    hinweis: 'Je nach Überziehung: bis 30 Min 20 €, bis 1 Std 25 €, bis 2 Std 30 €, bis 3 Std 35 €, über 3 Std 40 €.',
  },
  {
    id: 'unzulaessig',
    icon: '🚫',
    label: 'Unzulässig geparkt',
    beschreibung: 'An einer Stelle geparkt, an der das Parken verboten ist',
    bussgeld: 25,
    punkte: 0,
    abschleppen: false,
    hinweis: 'Mit Behinderung anderer 40 €, länger als 1 Stunde 40 €, mit Behinderung über 1 Std 50 €.',
  },
  {
    id: 'halteverbot',
    icon: '⛔',
    label: 'Im Halteverbot geparkt',
    beschreibung: 'Im absoluten oder eingeschränkten Halteverbot geparkt',
    bussgeld: 25,
    punkte: 0,
    abschleppen: true,
    hinweis: 'Nur kurz gehalten 20 €. Mit Behinderung oder über 1 Stunde 40 €. Abschleppen bei Behinderung möglich.',
  },
  {
    id: 'gehweg',
    icon: '🚶',
    label: 'Auf dem Gehweg geparkt',
    beschreibung: 'Auf Geh- oder Radweg geparkt',
    bussgeld: 55,
    punkte: 0,
    abschleppen: true,
    hinweis: 'Mit Behinderung 70 €, über 1 Stunde 70 €, über 1 Std + Behinderung 80 €. In schweren Fällen 1 Punkt.',
  },
  {
    id: 'zweitereihe',
    icon: '↔️',
    label: 'In zweiter Reihe geparkt',
    beschreibung: 'Verbotswidrig in zweiter Reihe abgestellt',
    bussgeld: 55,
    punkte: 0,
    abschleppen: true,
    hinweis: 'Mit Behinderung 85 € + 1 Punkt, länger als 1 Stunde 85 € + 1 Punkt.',
  },
  {
    id: 'behindertenparkplatz',
    icon: '♿',
    label: 'Behindertenparkplatz',
    beschreibung: 'Unberechtigt auf einem Schwerbehindertenparkplatz geparkt',
    bussgeld: 55,
    punkte: 0,
    abschleppen: true,
    hinweis: 'Ohne gültigen blauen Parkausweis. Abschleppen ist der Regelfall.',
  },
  {
    id: 'ladeplatz',
    icon: '🔌',
    label: 'E-Auto-Ladeplatz',
    beschreibung: 'Unberechtigt (oder ohne zu laden) auf einem Ladeplatz geparkt',
    bussgeld: 55,
    punkte: 0,
    abschleppen: true,
    hinweis: 'Gilt auch, wenn ein E-Auto dort steht, aber nicht lädt. Abschleppen möglich.',
  },
  {
    id: 'feuerwehrzufahrt',
    icon: '🚒',
    label: 'Feuerwehrzufahrt',
    beschreibung: 'Vor einer Feuerwehrzufahrt geparkt',
    bussgeld: 55,
    punkte: 0,
    abschleppen: true,
    hinweis: 'Mit Behinderung von Einsatzfahrzeugen 100 € + 1 Punkt. Abschleppen ist die Regel.',
  },
  {
    id: 'engstelle',
    icon: '🛑',
    label: 'Enge/unübersichtliche Stelle',
    beschreibung: 'An engen Stellen, in scharfen Kurven oder mit Behinderung von Rettungsfahrzeugen',
    bussgeld: 100,
    punkte: 1,
    abschleppen: true,
    hinweis: 'Behinderung von Rettungs- oder Einsatzfahrzeugen: 100 € + 1 Punkt.',
  },
  {
    id: 'autobahn',
    icon: '🛣️',
    label: 'Autobahn/Kraftfahrstraße',
    beschreibung: 'Verbotswidrig auf der Autobahn oder Kraftfahrstraße geparkt',
    bussgeld: 70,
    punkte: 1,
    abschleppen: true,
    hinweis: 'Parken auf der Autobahn ist generell verboten – auch auf dem Seitenstreifen (außer im Notfall).',
  },
];

function toNumber(value: string, fallback = 0): number {
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function FalschparkenRechner() {
  const [verstossId, setVerstossId] = useState<string>('halteverbot');
  const [mitBehinderung, setMitBehinderung] = useState(false);
  const [ueberEineStunde, setUeberEineStunde] = useState(false);
  const [abschleppkosten, setAbschleppkosten] = useState('150');

  const verstoss = VERSTOESSE.find((v) => v.id === verstossId) || VERSTOESSE[0];

  const ergebnis = useMemo(() => {
    let bussgeld = verstoss.bussgeld;
    let punkte = verstoss.punkte;

    // Erschwerende Umstände grob nach Bußgeldkatalog abbilden
    if (verstoss.id === 'unzulaessig') {
      if (mitBehinderung && ueberEineStunde) bussgeld = 50;
      else if (mitBehinderung) bussgeld = 40;
      else if (ueberEineStunde) bussgeld = 40;
    } else if (verstoss.id === 'halteverbot') {
      if (mitBehinderung || ueberEineStunde) bussgeld = 40;
    } else if (verstoss.id === 'gehweg') {
      if (mitBehinderung && ueberEineStunde) bussgeld = 80;
      else if (mitBehinderung || ueberEineStunde) bussgeld = 70;
    } else if (verstoss.id === 'zweitereihe') {
      if (mitBehinderung || ueberEineStunde) {
        bussgeld = 85;
        punkte = 1;
      }
    } else if (verstoss.id === 'feuerwehrzufahrt') {
      if (mitBehinderung) {
        bussgeld = 100;
        punkte = 1;
      }
    }

    return { bussgeld, punkte };
  }, [verstoss, mitBehinderung, ueberEineStunde]);

  const abschlepp = toNumber(abschleppkosten, 0);
  const gesamt = ergebnis.bussgeld + (verstoss.abschleppen ? abschlepp : 0);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  // Zeige Zusatzschalter nur bei Verstößen, bei denen sie etwas bewirken
  const zeigeBehinderung = ['unzulaessig', 'halteverbot', 'gehweg', 'zweitereihe', 'feuerwehrzufahrt'].includes(verstoss.id);
  const zeigeDauer = ['unzulaessig', 'halteverbot', 'gehweg', 'zweitereihe'].includes(verstoss.id);

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Falschparken-Bußgeldrechner" rechnerSlug="falschparken-rechner" />

      {/* Verstoß-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-3">
          <span className="text-gray-700 font-medium">Art des Parkverstoßes</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {VERSTOESSE.map((v) => (
            <button
              key={v.id}
              onClick={() => setVerstossId(v.id)}
              className={`py-3 px-3 rounded-xl font-medium transition-all text-sm text-left ${
                verstossId === v.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{v.icon}</span>
              {v.label}
            </button>
          ))}
        </div>

        {/* Zusatz-Optionen */}
        {(zeigeBehinderung || zeigeDauer) && (
          <div className="mt-5 space-y-3">
            {zeigeBehinderung && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mitBehinderung}
                  onChange={(e) => setMitBehinderung(e.target.checked)}
                  className="w-5 h-5 accent-orange-500"
                />
                <span className="text-sm text-gray-700">Mit Behinderung anderer Verkehrsteilnehmer</span>
              </label>
            )}
            {zeigeDauer && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ueberEineStunde}
                  onChange={(e) => setUeberEineStunde(e.target.checked)}
                  className="w-5 h-5 accent-orange-500"
                />
                <span className="text-sm text-gray-700">Länger als 1 Stunde geparkt</span>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Abschleppkosten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-2">
          <span className="text-gray-700 font-medium">Abschleppkosten (optional)</span>
          <span className="text-xs text-gray-500 block mt-1">
            Wird nur addiert, wenn beim gewählten Verstoß ein Abschleppen droht. Üblich sind je nach Stadt 100–300 €.
          </span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={abschleppkosten}
            onChange={(e) => setAbschleppkosten(e.target.value)}
            className="w-full text-2xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
            min="0"
            max="500"
            step="10"
            disabled={!verstoss.abschleppen}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
        </div>
        {!verstoss.abschleppen && (
          <p className="text-xs text-gray-400 mt-2">
            Bei diesem Verstoß ist Abschleppen unüblich – die Kosten werden nicht addiert.
          </p>
        )}
      </div>

      {/* Ergebnis */}
      <div
        className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
          ergebnis.punkte > 0
            ? 'bg-gradient-to-br from-orange-500 to-red-600'
            : 'bg-gradient-to-br from-yellow-500 to-orange-500'
        }`}
      >
        <h3 className="text-sm font-medium opacity-80 mb-1">🅿️ Ihr Strafzettel</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.bussgeld)}</span>
            <span className="text-xl opacity-80">{ergebnis.bussgeld <= 55 ? 'Verwarnungsgeld' : 'Bußgeld'}</span>
          </div>
          <p className="mt-2 opacity-90">{verstoss.beschreibung}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Punkte in Flensburg</span>
            <div className="text-3xl font-bold">{ergebnis.punkte}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Abschleppen?</span>
            <div className="text-3xl font-bold">{verstoss.abschleppen ? 'Möglich' : 'Nein'}</div>
          </div>
        </div>

        {verstoss.abschleppen && abschlepp > 0 && (
          <div className="mt-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Verwarnungs-/Bußgeld</span>
              <span>{formatEuro(ergebnis.bussgeld)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="opacity-80">+ Abschleppkosten</span>
              <span>{formatEuro(abschlepp)}</span>
            </div>
            <div className="flex justify-between font-bold mt-2 pt-2 border-t border-white/20">
              <span>Mögliche Gesamtkosten</span>
              <span>{formatEuro(gesamt)}</span>
            </div>
          </div>
        )}

        {verstoss.hinweis && (
          <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm">💡 {verstoss.hinweis}</p>
          </div>
        )}
      </div>

      {/* So wird gerechnet */}
      <div className="bg-blue-50 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <p className="text-sm text-gray-700">
          Der Rechner ordnet dem gewählten Verstoß den Regelsatz aus dem bundesweit einheitlichen
          Bußgeldkatalog für Halten und Parken (§ 12 StVO) zu. Erschwerende Umstände wie eine
          Behinderung anderer oder eine Parkdauer über einer Stunde erhöhen den Satz nach Katalog.
        </p>
        <div className="bg-white rounded-lg p-4 mt-3 text-sm text-gray-700">
          <p className="font-medium mb-1">{verstoss.label}</p>
          <p>
            Regelsatz: <strong>{formatEuro(ergebnis.bussgeld)}</strong>
            {ergebnis.punkte > 0 ? ` + ${ergebnis.punkte} Punkt(e) in Flensburg` : ''}
            {verstoss.abschleppen && abschlepp > 0 ? ` + ${formatEuro(abschlepp)} Abschleppen = ${formatEuro(gesamt)}` : ''}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-yellow-800 mb-2">⚠️ Angaben ohne Gewähr</h3>
        <p className="text-sm text-yellow-700">
          Die Werte entsprechen dem bundesweiten Bußgeldkatalog für Halten und Parken (Stand seit
          9. November 2021). Im konkreten Bescheid kommen oft Verwaltungsgebühren und Auslagen hinzu;
          Abschleppkosten variieren stark je nach Stadt und Abschleppunternehmen. Dieser Rechner ist
          ein Richtwert und ersetzt keine Rechtsberatung.
        </p>
      </div>
    </div>
  );
}

export default FalschparkenRechner;
