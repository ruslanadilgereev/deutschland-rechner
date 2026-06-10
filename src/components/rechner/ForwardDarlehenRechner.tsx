import { useState } from 'react';

// Voreinstellungen Stand Juni 2026.
// Forward-Aufschlag pro Monat: typisch 0,01–0,03 %-Punkte je Vorlaufmonat
// (Finanztip, LBS). Wir nutzen 0,02 %-Punkte als gerundeten Mittelwert.
// Aktueller Sollzins für eine 10-jährige Anschlussfinanzierung: ca. 3,5 %
// (Richtwert, tagesabhängig). Alle Werte sind frei anpassbar.
const AUFSCHLAG_DEFAULT = 0.02; // %-Punkte pro Vorlaufmonat
const SOLLZINS_DEFAULT = 3.5; // % p.a.

// Häufige Vorlaufzeiten als Schnellauswahl (in Monaten).
type VorlaufVoreinstellung = {
  name: string;
  icon: string;
  monate: number;
};

const VORLAUFZEITEN: VorlaufVoreinstellung[] = [
  { name: '12 Monate', icon: '🗓️', monate: 12 },
  { name: '24 Monate', icon: '📅', monate: 24 },
  { name: '36 Monate', icon: '📆', monate: 36 },
  { name: '48 Monate', icon: '⏳', monate: 48 },
  { name: '60 Monate', icon: '🕰️', monate: 60 },
  { name: 'Eigene', icon: '🔧', monate: 18 },
];

export function ForwardDarlehenRechner() {
  const [vorlaufIndex, setVorlaufIndex] = useState(1);
  const [restschuld, setRestschuld] = useState(200000);
  const [sollzins, setSollzins] = useState(SOLLZINS_DEFAULT);
  const [vorlaufMonate, setVorlaufMonate] = useState(VORLAUFZEITEN[1].monate);
  const [aufschlagProMonat, setAufschlagProMonat] = useState(AUFSCHLAG_DEFAULT);
  const [tilgung, setTilgung] = useState(2);
  const [zinsbindung, setZinsbindung] = useState(10);
  const [erwarteterZins, setErwarteterZins] = useState(4.2);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleVorlaufWechsel = (index: number) => {
    setVorlaufIndex(index);
    setVorlaufMonate(VORLAUFZEITEN[index].monate);
  };

  // Forward-Aufschlag insgesamt (Prozentpunkte)
  const aufschlagGesamt = aufschlagProMonat * vorlaufMonate;

  // Effektiver Forward-Sollzins
  const forwardZins = sollzins + aufschlagGesamt;

  // Anfängliche Forward-Monatsrate (Annuität = Zins + Tilgung)
  const monatsrate = restschuld * ((forwardZins + tilgung) / 100) / 12;

  // Restschuld am Ende der neuen Zinsbindung (Annuitätenverlauf)
  const monateGesamt = Math.round(zinsbindung * 12);
  const zinsMonat = forwardZins / 100 / 12;
  let rest = restschuld;
  let gezahlteZinsen = 0;
  for (let m = 0; m < monateGesamt && rest > 0; m++) {
    const zinsanteil = rest * zinsMonat;
    let tilgungsanteil = monatsrate - zinsanteil;
    if (tilgungsanteil > rest) tilgungsanteil = rest;
    gezahlteZinsen += zinsanteil;
    rest = Math.max(0, rest - tilgungsanteil);
  }
  const restschuldEnde = rest;

  // Break-even: Forward lohnt, wenn der erwartete spätere Marktzins über
  // dem effektiven Forward-Zins liegt. Zinsdifferenz auf die Restschuld
  // bezogen ergibt eine grobe Mehr-/Minderkosten-Schätzung im ersten Jahr.
  const zinsdifferenz = erwarteterZins - forwardZins;
  const vorteilProJahr = (zinsdifferenz / 100) * restschuld;
  const forwardLohntSich = zinsdifferenz > 0;

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatEuroKurz = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Vorlaufzeit-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Vorlaufzeit bis Forward-Beginn</span>
        <div className="grid grid-cols-3 gap-2">
          {VORLAUFZEITEN.map((v, i) => (
            <button
              key={v.name}
              onClick={() => handleVorlaufWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                vorlaufIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{v.icon}</span>
              <span className="text-center leading-tight">{v.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Restschuld bei Ablauf der Zinsbindung</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={restschuld}
              onChange={(e) => setRestschuld(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Aktueller Sollzins (% p.a.)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={15}
              step={0.01}
              value={sollzins}
              onChange={(e) => setSollzins(Math.min(15, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Heutiger Sollzins für die neue Zinsbindung – der Forward-Aufschlag kommt obendrauf.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Vorlaufzeit (Monate)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={66}
              value={vorlaufMonate}
              onChange={(e) => {
                setVorlaufIndex(5);
                setVorlaufMonate(Math.min(66, toNumber(e.target.value)));
              }}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Monate</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Zeit bis zum Auslaufen der aktuellen Zinsbindung – meist bis zu 60–66 Monate möglich.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Forward-Aufschlag pro Monat (%-Punkte)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.001}
              value={aufschlagProMonat}
              onChange={(e) => setAufschlagProMonat(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%-Pkt.</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Typisch 0,01–0,03 %-Punkte je Vorlaufmonat; viele Banken berechnen die ersten ~12 Monate 0 %.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Anfängliche Tilgung (% p.a.)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={10}
              step={0.1}
              value={tilgung}
              onChange={(e) => setTilgung(Math.min(10, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Neue Zinsbindung (Jahre)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={30}
              value={zinsbindung}
              onChange={(e) => setZinsbindung(Math.min(30, Math.max(1, toNumber(e.target.value))))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Jahre</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Erwarteter späterer Marktzins (% p.a.)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={15}
              step={0.01}
              value={erwarteterZins}
              onChange={(e) => setErwarteterZins(Math.min(15, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Nur für den Break-even-Vergleich: Ihre Annahme, wie hoch der Sollzins bei Forward-Beginn wäre.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Ihr Forward-Darlehen</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatProzent(forwardZins)} %</span>
            <span className="text-xl text-blue-200">Forward-Sollzins</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            aktueller Sollzins {formatProzent(sollzins)} % + {formatProzent(aufschlagGesamt)} %-Punkte Aufschlag
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Monatsrate (Zins + Tilgung)</span>
              <span className="text-xl font-bold">{formatEuro(monatsrate)} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Restschuld nach {zinsbindung} Jahren</span>
              <span className="font-bold">{formatEuroKurz(restschuldEnde)} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">
                {forwardLohntSich ? 'Vorteil ggü. erwartetem Zins' : 'Nachteil ggü. erwartetem Zins'}
              </span>
              <span className={`font-bold ${forwardLohntSich ? 'text-green-200' : 'text-red-200'}`}>
                {forwardLohntSich ? '+' : ''}{formatEuro(vorteilProJahr)} € / Jahr
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-blue-50">
          {forwardLohntSich
            ? `Liegt der spätere Marktzins wie angenommen bei ${formatProzent(erwarteterZins)} %, sichern Sie sich mit dem Forward-Darlehen den günstigeren Zins.`
            : `Liegt der spätere Marktzins wie angenommen bei ${formatProzent(erwarteterZins)} %, wäre Abwarten bei dieser Annahme günstiger als der Forward-Abschluss.`}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Forward-Aufschlag gesamt</strong> = Aufschlag/Monat × Vorlaufmonate
          </p>
          <p>
            = {formatProzent(aufschlagProMonat)} × {vorlaufMonate} ={' '}
            <strong>{formatProzent(aufschlagGesamt)} %-Punkte</strong>
          </p>
          <p>
            <strong>Forward-Sollzins</strong> = aktueller Sollzins + Aufschlag = {formatProzent(sollzins)} % +{' '}
            {formatProzent(aufschlagGesamt)} % = <strong>{formatProzent(forwardZins)} %</strong>
          </p>
          <p>
            <strong>Monatsrate</strong> = Restschuld × (Forward-Sollzins + Tilgung) ÷ 100 ÷ 12
          </p>
          <p>
            = {formatEuroKurz(restschuld)} € × ({formatProzent(forwardZins)} + {formatProzent(tilgung)}) ÷ 100 ÷ 12 ={' '}
            <strong>{formatEuro(monatsrate)} €</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Dies ist eine unverbindliche Beispielrechnung und keine Finanz- oder
          Anlageberatung. Tatsächliche Forward-Aufschläge und Sollzinsen sind bonitäts-, beleihungs- und
          tagesabhängig und variieren stark je Bank – der Aufschlag ist häufig gestaffelt, die ersten rund
          12 Monate teils 0 %. Die Break-even-Bewertung beruht auf einer Annahme über den künftigen
          Marktzins, der nicht prognostizierbar ist. Keine Gewähr für Aktualität und Richtigkeit; konkrete
          Konditionen beim Kreditgeber einholen.
        </p>
      </div>
    </div>
  );
}

export default ForwardDarlehenRechner;
