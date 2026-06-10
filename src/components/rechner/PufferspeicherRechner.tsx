import { useState } from 'react';

// Konstante zur Umrechnung Energie -> Wasservolumen.
// Speichervolumen V [Liter] = Q [kWh] x 1000 / (c x dT), mit der spezifischen
// Waermekapazitaet von Wasser c = 1,163 Wh/(kg.K). 1000 / 1,163 = 859,85 ~ 860.
// Der gerundete Wert 860 ist in der Heiztechnik der etablierte Faustfaktor.
const ENERGIE_FAKTOR = 860;

// 1. BImSchV: Festbrennstoffkessel (Scheitholz/Holzvergaser) benoetigen einen
// Pufferspeicher mit mindestens 55 Litern je kW Nennwaermeleistung.
const BIMSCHV_MIN_L_PRO_KW = 55;

// Gaengige Standard-Speichergroessen in Litern (Handelsware).
const STANDARD_GROESSEN = [200, 300, 500, 800, 1000, 1500, 2000];

type Anlagentyp = {
  key: string;
  name: string;
  icon: string;
  // Faustwert-Default und plausible Spanne in l/kW
  faustDefault: number;
  faustMin: number;
  faustMax: number;
  // Default-Werte fuer den Energie-Modus
  dtDefault: number; // nutzbare Temperaturdifferenz in K
  zeitDefault: number; // Ueberbrueckungs-/Pufferzeit in h
  // gesetzliche Mindestgroesse (nur Festbrennstoff)
  bimschv: boolean;
  hinweis: string;
};

const ANLAGEN: Anlagentyp[] = [
  {
    key: 'waermepumpe',
    name: 'Wärmepumpe',
    icon: '🌡️',
    faustDefault: 20,
    faustMin: 12,
    faustMax: 35,
    dtDefault: 15,
    zeitDefault: 2,
    bimschv: false,
    hinweis:
      'Richtwert 12–35 l/kW (DIN EN 15450), VDI 4645 empfiehlt rund 20 l/kW. Der Energie-Modus eignet sich, um z. B. eine EVU-Sperrzeit zu überbrücken.',
  },
  {
    key: 'holzvergaser',
    name: 'Holzvergaser / Scheitholz',
    icon: '🪵',
    faustDefault: 55,
    faustMin: 50,
    faustMax: 100,
    dtDefault: 50,
    zeitDefault: 1.5,
    bimschv: true,
    hinweis:
      'Gesetzlich mind. 55 l/kW Nennwärmeleistung (1. BImSchV), Praxis eher 50–100 l/kW. Faustregel auch: 12 Liter je Liter Brennstoff-Füllraum.',
  },
  {
    key: 'pellet',
    name: 'Pelletkessel',
    icon: '🔥',
    faustDefault: 30,
    faustMin: 20,
    faustMax: 50,
    dtDefault: 25,
    zeitDefault: 1,
    bimschv: false,
    hinweis:
      'Pelletkessel modulieren, daher kleinere Puffer als bei Scheitholz. Richtwert rund 20–50 l/kW; ein Puffer reduziert Takten und schont den Kessel.',
  },
  {
    key: 'solar',
    name: 'Solarthermie',
    icon: '☀️',
    faustDefault: 60,
    faustMin: 50,
    faustMax: 80,
    dtDefault: 40,
    zeitDefault: 4,
    bimschv: false,
    hinweis:
      'Richtwert 50–80 l/kW bzw. rund 60–80 l je m² Kollektorfläche. Solarspeicher dienen vor allem als Tagesspeicher für den Ertrag.',
  },
];

export function PufferspeicherRechner() {
  const [anlageIndex, setAnlageIndex] = useState(0);
  const [modus, setModus] = useState<'faustwert' | 'energie'>('faustwert');
  const [leistung, setLeistung] = useState(8); // kW
  const [faustwert, setFaustwert] = useState(ANLAGEN[0].faustDefault); // l/kW
  const [zeit, setZeit] = useState(ANLAGEN[0].zeitDefault); // h
  const [dt, setDt] = useState(ANLAGEN[0].dtDefault); // K

  const anlage = ANLAGEN[anlageIndex];

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleAnlageWechsel = (index: number) => {
    setAnlageIndex(index);
    const a = ANLAGEN[index];
    setFaustwert(a.faustDefault);
    setZeit(a.zeitDefault);
    setDt(a.dtDefault);
  };

  // Faustwert-Modus: V = Leistung x Richtwert (l/kW)
  const volumenFaust = leistung * faustwert;

  // Energie-Modus: Q = Leistung x Zeit; V = Q x 860 / dT
  const energieKwh = leistung * zeit;
  const volumenEnergie = dt > 0 ? (energieKwh * ENERGIE_FAKTOR) / dt : 0;

  const rohVolumen = modus === 'faustwert' ? volumenFaust : volumenEnergie;

  // Gesetzliche Mindestgroesse bei Festbrennstoff (1. BImSchV)
  const bimschvMin = anlage.bimschv ? leistung * BIMSCHV_MIN_L_PRO_KW : 0;

  // Massgebliches Volumen: das groessere aus berechnetem Wert und gesetzlichem Minimum
  const empfohlenesVolumen = Math.max(rohVolumen, bimschvMin);
  const bimschvMassgeblich = anlage.bimschv && bimschvMin > rohVolumen;

  // Naechste handelsuebliche Standardgroesse (aufrunden)
  const naechsteGroesse =
    STANDARD_GROESSEN.find((g) => g >= empfohlenesVolumen) ??
    STANDARD_GROESSEN[STANDARD_GROESSEN.length - 1];

  // Plausibilitaets-Spanne (immer auf Basis der Faustwert-Richtwerte)
  const spanneMin = leistung * anlage.faustMin;
  const spanneMax = leistung * anlage.faustMax;

  const formatL = (v: number) =>
    Math.round(v).toLocaleString('de-DE');
  const formatNum = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Anlagentyp-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Anlagentyp auswählen</span>
        <div className="grid grid-cols-2 gap-2">
          {ANLAGEN.map((a, i) => (
            <button
              key={a.key}
              onClick={() => handleAnlageWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                anlageIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-center leading-tight">{a.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">{anlage.hinweis}</p>
      </div>

      {/* Modus-Umschalter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Berechnungsmodus</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setModus('faustwert')}
            className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
              modus === 'faustwert'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Faustwert (l/kW)
          </button>
          <button
            onClick={() => setModus('energie')}
            className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
              modus === 'energie'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Energie (exakt)
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {modus === 'faustwert'
            ? 'Schnelle Überschlagsrechnung: Volumen = Leistung × Richtwert in Litern pro kW.'
            : 'Genaue Auslegung: Volumen = Heizleistung × Pufferzeit × 860 ÷ Temperaturdifferenz.'}
        </p>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Heiz-/Kesselleistung (kW)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={leistung}
              onChange={(e) => setLeistung(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kW</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Bei Wärmepumpen die Heizleistung, bei Kesseln die Nennwärmeleistung.
          </span>
        </label>

        {modus === 'faustwert' ? (
          <label className="block">
            <span className="text-gray-700 font-medium">Richtwert (Liter pro kW)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={faustwert}
                onChange={(e) => setFaustwert(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">l/kW</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Voreinstellung {formatNum(anlage.faustDefault)} l/kW – plausibel sind {anlage.faustMin}–{anlage.faustMax} l/kW.
            </span>
          </label>
        ) : (
          <>
            <label className="block">
              <span className="text-gray-700 font-medium">Überbrückungs-/Pufferzeit (Stunden)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={zeit}
                  onChange={(e) => setZeit(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">h</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Wie lange soll der Speicher die Heizung versorgen (z. B. EVU-Sperrzeit, ein Abbrand)?
              </span>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Nutzbare Temperaturdifferenz Δt (K)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={dt}
                  onChange={(e) => setDt(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">K</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Spreizung zwischen oben und unten im Speicher: typ. 15–25 K (Wärmepumpe), 40–60 K (Scheitholz).
              </span>
            </label>
          </>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Empfohlenes Puffervolumen</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatL(empfohlenesVolumen)}</span>
            <span className="text-xl text-blue-200">Liter</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            nächste Standardgröße: {formatL(naechsteGroesse)} Liter
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Plausible Spanne ({anlage.faustMin}–{anlage.faustMax} l/kW)</span>
              <span className="font-bold">
                {formatL(spanneMin)}–{formatL(spanneMax)} l
              </span>
            </div>
          </div>

          {modus === 'energie' && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">gespeicherte Energie</span>
                <span className="font-bold">{formatNum(energieKwh)} kWh</span>
              </div>
            </div>
          )}

          {anlage.bimschv && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">gesetzl. Minimum (1. BImSchV, 55 l/kW)</span>
                <span className="font-bold">{formatL(bimschvMin)} l</span>
              </div>
            </div>
          )}
        </div>

        {bimschvMassgeblich && (
          <p className="text-blue-100 text-xs mt-4 bg-white/10 rounded-lg p-3">
            ⚖️ Hier ist das gesetzliche Minimum nach 1. BImSchV (55 l/kW) maßgeblich – es liegt
            über dem rechnerischen Wert.
          </p>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          {modus === 'faustwert' ? (
            <>
              <p>
                <strong>Volumen</strong> = Leistung × Richtwert
              </p>
              <p>
                = {formatNum(leistung)} kW × {formatNum(faustwert)} l/kW ={' '}
                <strong>{formatL(volumenFaust)} Liter</strong>
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Energie</strong> = Leistung × Zeit = {formatNum(leistung)} kW × {formatNum(zeit)} h ={' '}
                <strong>{formatNum(energieKwh)} kWh</strong>
              </p>
              <p>
                <strong>Volumen</strong> = Energie × 860 ÷ Δt = {formatNum(energieKwh)} × 860 ÷ {formatNum(dt)} K ={' '}
                <strong>{formatL(volumenEnergie)} Liter</strong>
              </p>
            </>
          )}
          {bimschvMassgeblich && (
            <p>
              <strong>Gesetzl. Minimum</strong> = {formatNum(leistung)} kW × 55 l/kW ={' '}
              <strong>{formatL(bimschvMin)} Liter</strong> (maßgeblich)
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Ergebnis ist eine überschlägige Auslegungshilfe. Die
          verbindliche Dimensionierung – inklusive hydraulischer Einbindung, Regelung und
          Speichertechnologie – muss durch einen Heizungsfachbetrieb erfolgen. Bei
          Festbrennstoffkesseln ist die Mindestgröße nach 1. BImSchV (Richtwert 55 l/kW)
          gesetzlich vorgeschrieben. Keine Gewähr für Förder- oder Normkonformität im Einzelfall.
        </p>
      </div>
    </div>
  );
}

export default PufferspeicherRechner;
