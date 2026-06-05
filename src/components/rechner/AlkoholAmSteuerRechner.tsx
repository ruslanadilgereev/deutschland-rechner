import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ═══════════════════════════════════════════════════════════════
// ALKOHOL AM STEUER – Folgen nach Promille (BAK)
// Rechtsgrundlagen:
//   § 24a StVG  – 0,5-Promille-Grenze (Ordnungswidrigkeit)
//   § 316 StGB  – Trunkenheit im Verkehr (ab 1,1 ‰ absolute Fahruntüchtigkeit)
//   § 315c StGB – Gefährdung des Straßenverkehrs (relative Fahruntüchtigkeit ab 0,3 ‰)
//   § 24c StVG  – Alkoholverbot in Probezeit und unter 21 Jahren (0,0 ‰)
// Werte: bussgeldkatalog.org, ADAC, gesetze-im-internet.de (Stand Juni 2026)
// ═══════════════════════════════════════════════════════════════

type FahrerTyp = 'normal' | 'probe_u21' | 'radfahrer';

interface AlkoholErgebnis {
  // Anzeige
  bussgeld: number | null; // null = keine Geldbuße (stattdessen Straftat/Geldstrafe)
  punkte: number;
  fahrverbotMonate: number; // bei OWi
  einstufung: string; // Kurztitel der Rechtsfolge
  istStraftat: boolean;
  entzug: boolean; // Entzug der Fahrerlaubnis (Straftat)
  mpu: boolean;
  beschreibung: string;
  hinweis?: string;
  schwere: 'frei' | 'owi' | 'straftat'; // steuert Farbe
}

export function AlkoholAmSteuerRechner() {
  const [promille, setPromille] = useState(0.5);
  const [fahrerTyp, setFahrerTyp] = useState<FahrerTyp>('normal');
  const [ausfall, setAusfall] = useState(false); // Ausfallerscheinungen / Unfall / Schlangenlinien
  const [verstossNr, setVerstossNr] = useState<1 | 2 | 3>(1); // Wiederholung bei 0,5-OWi

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um.
  const toNumber = (value: string) => {
    const n = Number(value.replace(',', '.'));
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const ergebnis = useMemo((): AlkoholErgebnis => {
    // ── Sonderfall Fahrradfahrer ───────────────────────────────
    // Für Radfahrer gilt die absolute Fahruntüchtigkeit erst ab 1,6 ‰.
    // Darunter ist Radfahren mit Alkohol nur bei Ausfallerscheinungen
    // strafbar (relative Fahruntüchtigkeit). Keine 0,5-OWi-Grenze.
    if (fahrerTyp === 'radfahrer') {
      if (promille >= 1.6) {
        return {
          bussgeld: null,
          punkte: 3,
          fahrverbotMonate: 0,
          einstufung: 'Straftat (absolute Fahruntüchtigkeit auf dem Rad)',
          istStraftat: true,
          entzug: false, // Fahrerlaubnis fürs Auto kann separat entzogen werden
          mpu: true,
          beschreibung: `${promille.toLocaleString('de-DE')} ‰ als Radfahrer`,
          hinweis:
            'Ab 1,6 ‰ ist Radfahren eine Straftat (§ 316 StGB): Geldstrafe, 3 Punkte und in der Regel eine MPU. Auch die Auto-Fahrerlaubnis kann entzogen werden.',
          schwere: 'straftat',
        };
      }
      if (ausfall && promille >= 0.3) {
        return {
          bussgeld: null,
          punkte: 3,
          fahrverbotMonate: 0,
          einstufung: 'Straftat (relative Fahruntüchtigkeit)',
          istStraftat: true,
          entzug: false,
          mpu: false,
          beschreibung: `${promille.toLocaleString('de-DE')} ‰ als Radfahrer mit Ausfallerscheinungen`,
          hinweis:
            'Mit Ausfallerscheinungen (z. B. Schlangenlinien, Sturz) kann Radfahren schon ab 0,3 ‰ als Straftat gewertet werden.',
          schwere: 'straftat',
        };
      }
      return {
        bussgeld: 0,
        punkte: 0,
        fahrverbotMonate: 0,
        einstufung: 'Ohne Folge (für Radfahrer)',
        istStraftat: false,
        entzug: false,
        mpu: false,
        beschreibung: `${promille.toLocaleString('de-DE')} ‰ als Radfahrer`,
        hinweis:
          'Für Radfahrer gibt es keine 0,5-Promille-Grenze. Strafbar wird es erst ab 1,6 ‰ – oder darunter bei Ausfallerscheinungen.',
        schwere: 'frei',
      };
    }

    // ── Absolute Fahruntüchtigkeit ab 1,1 ‰ (Kraftfahrzeug) ────
    if (promille >= 1.1) {
      return {
        bussgeld: null,
        punkte: 3,
        fahrverbotMonate: 0,
        einstufung: 'Straftat (absolute Fahruntüchtigkeit)',
        istStraftat: true,
        entzug: true,
        mpu: promille >= 1.6,
        beschreibung: `${promille.toLocaleString('de-DE')} ‰ am Steuer`,
        hinweis:
          promille >= 1.6
            ? 'Ab 1,6 ‰ ist zusätzlich eine MPU („Idiotentest“) Voraussetzung für die Wiedererteilung des Führerscheins.'
            : 'Ab 1,1 ‰ liegt eine Straftat nach § 316 StGB vor: Geldstrafe oder Freiheitsstrafe, Entzug der Fahrerlaubnis und mindestens 6 Monate Sperrfrist.',
        schwere: 'straftat',
      };
    }

    // ── Relative Fahruntüchtigkeit ab 0,3 ‰ mit Ausfall ───────
    // Mit alkoholbedingten Ausfallerscheinungen oder Unfall wird es
    // schon ab 0,3 ‰ zur Straftat (§ 316 / § 315c StGB).
    if (ausfall && promille >= 0.3) {
      return {
        bussgeld: null,
        punkte: 3,
        fahrverbotMonate: 0,
        einstufung: 'Straftat (relative Fahruntüchtigkeit)',
        istStraftat: true,
        entzug: true,
        mpu: false,
        beschreibung: `${promille.toLocaleString('de-DE')} ‰ mit Ausfallerscheinungen`,
        hinweis:
          'Mit Ausfallerscheinungen (Schlangenlinien, Unfall, deutliche Fahrfehler) gilt schon ab 0,3 ‰ relative Fahruntüchtigkeit: Straftat mit 3 Punkten und Entzug der Fahrerlaubnis.',
        schwere: 'straftat',
      };
    }

    // ── Alkoholverbot in Probezeit / unter 21 (§ 24c StVG) ────
    // 0,0-Grenze. Bereits ein messbarer Wert ist eine OWi.
    if (fahrerTyp === 'probe_u21' && promille > 0) {
      return {
        bussgeld: 250,
        punkte: 1,
        fahrverbotMonate: 0,
        einstufung: 'Ordnungswidrigkeit (0,0-Promille-Verstoß)',
        istStraftat: false,
        entzug: false,
        mpu: false,
        beschreibung: `${promille.toLocaleString('de-DE')} ‰ in der Probezeit / unter 21`,
        hinweis:
          'In der Probezeit und unter 21 Jahren gilt 0,0 ‰. Folge: 250 € Bußgeld, 1 Punkt, Aufbauseminar und Verlängerung der Probezeit auf 4 Jahre.',
        schwere: 'owi',
      };
    }

    // ── 0,5- bis 1,09-Promille-Grenze (§ 24a StVG, OWi) ───────
    if (promille >= 0.5) {
      const owi = [
        { bussgeld: 500, fahrverbotMonate: 1 }, // 1. Verstoß
        { bussgeld: 1000, fahrverbotMonate: 3 }, // 2. Verstoß
        { bussgeld: 1500, fahrverbotMonate: 3 }, // 3. Verstoß
      ][verstossNr - 1];
      return {
        bussgeld: owi.bussgeld,
        punkte: 2,
        fahrverbotMonate: owi.fahrverbotMonate,
        einstufung: 'Ordnungswidrigkeit nach § 24a StVG',
        istStraftat: false,
        entzug: false,
        mpu: false,
        beschreibung: `${promille.toLocaleString('de-DE')} ‰ am Steuer (${verstossNr}. Verstoß)`,
        hinweis:
          verstossNr === 1
            ? 'Erster Verstoß: 500 € Bußgeld, 2 Punkte, 1 Monat Fahrverbot.'
            : `Wiederholungsfall: ${owi.bussgeld} € Bußgeld, 2 Punkte, ${owi.fahrverbotMonate} Monate Fahrverbot.`,
        schwere: 'owi',
      };
    }

    // ── 0,0 bis 0,49 ‰ ohne Auffälligkeit ─────────────────────
    return {
      bussgeld: 0,
      punkte: 0,
      fahrverbotMonate: 0,
      einstufung: 'Straffrei',
      istStraftat: false,
      entzug: false,
      mpu: false,
      beschreibung: `${promille.toLocaleString('de-DE')} ‰ am Steuer`,
      hinweis:
        'Unter 0,5 ‰ bleibt das Fahren für erfahrene Fahrer ohne Ausfallerscheinungen straffrei. In Probezeit und unter 21 gilt jedoch 0,0 ‰.',
      schwere: 'frei',
    };
  }, [promille, fahrerTyp, ausfall, verstossNr]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  const fahrerOptionen: { value: FahrerTyp; label: string; icon: string }[] = [
    { value: 'normal', label: 'Auto, über 21 & außerhalb Probezeit', icon: '🚗' },
    { value: 'probe_u21', label: 'Probezeit oder unter 21', icon: '🔰' },
    { value: 'radfahrer', label: 'Fahrradfahrer', icon: '🚴' },
  ];

  // Promille-Stufen für die Schnellauswahl
  const stufen = [0.0, 0.3, 0.5, 0.8, 1.1, 1.6];

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Alkohol-am-Steuer-Rechner" rechnerSlug="alkohol-am-steuer-rechner" />

      {/* Fahrer-Typ */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-2">
          <span className="text-gray-700 font-medium">Wer fährt?</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {fahrerOptionen.map((option) => (
            <button
              key={option.value}
              onClick={() => setFahrerTyp(option.value)}
              className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                fahrerTyp === option.value
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

      {/* Promille-Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Blutalkoholkonzentration (Promille)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Den eigenen Wert schätzen Sie mit dem{' '}
              <a href="/promille-rechner" className="text-blue-600 hover:underline">
                Promille-Rechner
              </a>
              .
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              step={0.1}
              value={promille}
              onChange={(e) => setPromille(Math.min(5, toNumber(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">‰</span>
          </div>
          <input
            type="range"
            value={promille}
            onChange={(e) => setPromille(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max="2"
            step="0.1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0,0 ‰</span>
            <span>1,0 ‰</span>
            <span>2,0 ‰</span>
          </div>
        </div>

        {/* Schnellauswahl */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Schnellauswahl</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {stufen.map((p) => (
              <button
                key={p}
                onClick={() => setPromille(p)}
                className={`py-2 px-3 rounded-xl text-sm transition-all ${
                  promille === p
                    ? 'bg-orange-100 text-orange-700 font-medium'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.toLocaleString('de-DE', { minimumFractionDigits: 1 })} ‰
              </button>
            ))}
          </div>
        </div>

        {/* Ausfallerscheinungen */}
        <div className="mb-4 border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ausfall}
              onChange={(e) => setAusfall(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-gray-700 font-medium">
              Ausfallerscheinungen / Unfall (z. B. Schlangenlinien)
            </span>
          </label>
          <span className="text-xs text-gray-400 mt-1 block">
            Mit alkoholbedingten Fahrfehlern wird es schon ab 0,3 ‰ zur Straftat (relative
            Fahruntüchtigkeit).
          </span>
        </div>

        {/* Wiederholung bei 0,5-OWi (nur relevant im OWi-Bereich, Auto) */}
        {fahrerTyp === 'normal' && !ausfall && promille >= 0.5 && promille < 1.1 && (
          <div className="border-t border-gray-100 pt-4">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Der wievielte Verstoß ist es?</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map((nr) => (
                <button
                  key={nr}
                  onClick={() => setVerstossNr(nr)}
                  className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                    verstossNr === nr
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {nr}. Mal
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ergebnis */}
      <div
        className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
          ergebnis.schwere === 'straftat'
            ? 'bg-gradient-to-br from-red-600 to-red-800'
            : ergebnis.schwere === 'owi'
            ? 'bg-gradient-to-br from-orange-500 to-red-600'
            : 'bg-gradient-to-br from-green-500 to-emerald-600'
        }`}
      >
        <h3 className="text-sm font-medium opacity-80 mb-1">🍺 Rechtsfolge</h3>
        <div className="mb-4">
          {ergebnis.istStraftat ? (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">Straftat</span>
              <span className="text-lg opacity-80">+ Entzug</span>
            </div>
          ) : ergebnis.bussgeld && ergebnis.bussgeld > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuro(ergebnis.bussgeld)}</span>
              <span className="text-xl opacity-80">Bußgeld</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{ergebnis.einstufung}</span>
            </div>
          )}
          <p className="mt-2 opacity-90">{ergebnis.beschreibung}</p>
          {!ergebnis.istStraftat && ergebnis.bussgeld !== 0 && (
            <p className="text-sm opacity-80 mt-1">{ergebnis.einstufung}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Punkte</span>
            <div className="text-3xl font-bold">{ergebnis.punkte}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">{ergebnis.istStraftat ? 'Fahrerlaubnis' : 'Fahrverbot'}</span>
            <div className="text-2xl font-bold">
              {ergebnis.istStraftat
                ? ergebnis.entzug
                  ? 'Entzug'
                  : '–'
                : ergebnis.fahrverbotMonate > 0
                ? `${ergebnis.fahrverbotMonate} Mon.`
                : 'Nein'}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">MPU</span>
            <div className="text-2xl font-bold">{ergebnis.mpu ? 'Ja' : 'Nein'}</div>
          </div>
        </div>

        {ergebnis.hinweis && (
          <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm">💡 {ergebnis.hinweis}</p>
          </div>
        )}
      </div>

      {/* Promillegrenzen-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Die wichtigsten Promillegrenzen</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-lg font-bold text-blue-700 w-14">0,0 ‰</span>
            <div>
              <p className="font-medium text-blue-800">Probezeit & unter 21</p>
              <p className="text-sm text-blue-600">Absolutes Alkoholverbot (§ 24c StVG)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-lg font-bold text-yellow-700 w-14">0,3 ‰</span>
            <div>
              <p className="font-medium text-yellow-800">Relative Fahruntüchtigkeit</p>
              <p className="text-sm text-yellow-600">Straftat bei Ausfallerscheinungen oder Unfall</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-lg font-bold text-orange-700 w-14">0,5 ‰</span>
            <div>
              <p className="font-medium text-orange-800">Ordnungswidrigkeit (§ 24a StVG)</p>
              <p className="text-sm text-orange-600">500 € / 2 Punkte / 1 Monat Fahrverbot</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
            <span className="text-lg font-bold text-red-700 w-14">1,1 ‰</span>
            <div>
              <p className="font-medium text-red-800">Absolute Fahruntüchtigkeit</p>
              <p className="text-sm text-red-600">Straftat (§ 316 StGB): Entzug + Sperrfrist</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-100 rounded-xl">
            <span className="text-lg font-bold text-red-800 w-14">1,6 ‰</span>
            <div>
              <p className="font-medium text-red-900">MPU-Grenze</p>
              <p className="text-sm text-red-700">Zusätzlich MPU für die Wiedererteilung nötig</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Dieser Rechner zeigt die regelmäßigen Rechtsfolgen nach Bußgeldkatalog
          und StGB. Die konkrete Geld- oder Freiheitsstrafe bei einer Straftat legt das Gericht im Einzelfall
          fest. Angaben ohne Gewähr und keine Rechtsberatung. Fahren Sie im Zweifel nie unter Alkoholeinfluss.
        </p>
      </div>
    </div>
  );
}

export default AlkoholAmSteuerRechner;
