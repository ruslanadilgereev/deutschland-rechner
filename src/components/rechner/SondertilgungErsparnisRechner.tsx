import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Sondertilgung-Rechner: stellt zwei monatsgenaue Annuitaeten-Tilgungsplaene
// gegenueber – Szenario A "ohne Sondertilgung" und Szenario B "mit Sondertilgung".
// Headline-Ergebnis: Zinsersparnis (Gesamtzinsen A − Gesamtzinsen B) und
// Laufzeitverkuerzung (Laufzeit A − Laufzeit B).
//
// Grundlage: Annuitaetendarlehen mit gleichbleibender Monatsrate, monatliche
// Verzinsung. Pro Monat: Zinsanteil = Restschuld × (Sollzins/100/12),
// Tilgungsanteil = Rate − Zinsanteil, neue Restschuld = alte − Tilgungsanteil.
// Sondertilgungen werden iterativ pro Periode von der Restschuld abgezogen,
// BEVOR im Folgemonat der neue Zins berechnet wird (frueh getilgtes Geld wirkt
// am staerksten).

type EingabeModus = 'tilgung' | 'rate';

interface SimErgebnis {
  laufzeitMonate: number;
  gesamtzinsen: number;
  zuNiedrig: boolean;
}

const MAX_MONATE = 600; // Cap bei 50 Jahren

export function SondertilgungErsparnisRechner() {
  const [kreditsumme, setKreditsumme] = useState(200000);
  const [sollzins, setSollzins] = useState(3.5);
  const [eingabeModus, setEingabeModus] = useState<EingabeModus>('tilgung');
  const [anfangstilgung, setAnfangstilgung] = useState(2.0);
  const [monatsrate, setMonatsrate] = useState(1000);
  const [sonderJaehrlich, setSonderJaehrlich] = useState(5000);
  const [sonderEinmalig, setSonderEinmalig] = useState(0);
  const [sonderEinmaligMonat, setSonderEinmaligMonat] = useState(12);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Effektive Monatsrate je nach Eingabemodus
  const rate = useMemo(() => {
    if (eingabeModus === 'rate') return monatsrate;
    // Jahresannuitaet = Kreditsumme × (Sollzins% + Anfangstilgung%), durch 12
    return (kreditsumme * (sollzins / 100 + anfangstilgung / 100)) / 12;
  }, [eingabeModus, monatsrate, kreditsumme, sollzins, anfangstilgung]);

  // Simuliert einen Tilgungsplan. mitSonder steuert, ob die Sondertilgungen
  // angewendet werden (Szenario B) oder nicht (Szenario A).
  const simulate = (mitSonder: boolean): SimErgebnis => {
    const i = sollzins / 100 / 12;
    let rest = kreditsumme;
    let gesamtzinsen = 0;
    let monat = 0;

    // Rate muss mindestens den ersten Monatszins decken, sonst waechst die Schuld
    if (rate <= kreditsumme * i) {
      return { laufzeitMonate: 0, gesamtzinsen: 0, zuNiedrig: true };
    }

    while (rest > 0.005 && monat < MAX_MONATE) {
      monat++;
      const zins = rest * i;
      let tilgung = rate - zins;
      // Letzte Rate kappen, damit die Restschuld nicht negativ wird
      if (tilgung > rest) tilgung = rest;
      rest = rest - tilgung;
      gesamtzinsen += zins;

      if (mitSonder && rest > 0) {
        let sonder = 0;
        // Jaehrliche Sondertilgung jeweils zum Jahresende (Monat 12, 24, 36 ...)
        if (sonderJaehrlich > 0 && monat % 12 === 0) {
          sonder += sonderJaehrlich;
        }
        // Einmalige Sondertilgung im gewaehlten Monat
        if (sonderEinmalig > 0 && monat === sonderEinmaligMonat) {
          sonder += sonderEinmalig;
        }
        if (sonder > 0) {
          rest = Math.max(0, rest - sonder);
        }
      }
    }

    return { laufzeitMonate: monat, gesamtzinsen, zuNiedrig: false };
  };

  const szenarioA = useMemo(() => simulate(false), [
    kreditsumme,
    sollzins,
    rate,
  ]);
  const szenarioB = useMemo(() => simulate(true), [
    kreditsumme,
    sollzins,
    rate,
    sonderJaehrlich,
    sonderEinmalig,
    sonderEinmaligMonat,
  ]);

  const rateZuNiedrig = szenarioA.zuNiedrig;

  const zinsersparnis = Math.max(0, szenarioA.gesamtzinsen - szenarioB.gesamtzinsen);
  const laufzeitVerkuerzungMonate = Math.max(
    0,
    szenarioA.laufzeitMonate - szenarioB.laufzeitMonate,
  );

  // Banktypische Obergrenze: 5 % der urspruenglichen Darlehenssumme pro Jahr.
  const maxSonderProJahr = kreditsumme * 0.05;
  const ueberschreitetKappung = sonderJaehrlich > maxSonderProJahr + 0.005;

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) +
    ' €';
  const formatEuro2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
    ' €';
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) +
    ' %';

  const monateZuText = (monate: number) => {
    const jahre = Math.floor(monate / 12);
    const restMonate = monate % 12;
    if (jahre === 0) return `${restMonate} Monate`;
    if (restMonate === 0) return `${jahre} Jahre`;
    return `${jahre} Jahre, ${restMonate} Monate`;
  };

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback
        rechnerName="Sondertilgung-Rechner"
        rechnerSlug="sondertilgung-ersparnis-rechner"
      />

      {/* Eingaben Darlehen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Restschuld / Darlehenssumme</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={5000}
              value={kreditsumme}
              onChange={(e) => setKreditsumme(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Sollzins p.a.</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={sollzins}
              onChange={(e) => setSollzins(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </label>

        {/* Eingabemodus: Tilgung% oder feste Rate */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Rate festlegen über</span>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setEingabeModus('tilgung')}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                eingabeModus === 'tilgung'
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Anfangstilgung %
            </button>
            <button
              type="button"
              onClick={() => setEingabeModus('rate')}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                eingabeModus === 'rate'
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Feste Monatsrate
            </button>
          </div>

          {eingabeModus === 'tilgung' ? (
            <label className="block">
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={anfangstilgung}
                  onChange={(e) => setAnfangstilgung(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-28 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  % anfänglich
                </span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Ergibt eine Monatsrate von {formatEuro2(rate)}. Üblich bei Baufinanzierung: 2–3 %.
              </span>
            </label>
          ) : (
            <label className="block">
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={50}
                  value={monatsrate}
                  onChange={(e) => setMonatsrate(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  € / Monat
                </span>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Eingaben Sondertilgung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <span className="text-gray-700 font-semibold block">Ihre geplante Sondertilgung</span>

        <label className="block">
          <span className="text-gray-700 font-medium">Jährliche Sondertilgung</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={500}
              value={sonderJaehrlich}
              onChange={(e) => setSonderJaehrlich(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              € / Jahr
            </span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Wird jeweils zum Jahresende verrechnet. Banktypische Obergrenze: 5 % der
            Darlehenssumme = {formatEuro(maxSonderProJahr)} pro Jahr.
          </span>
        </label>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Einmalige Sondertilgung (optional)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1000}
                value={sonderEinmalig}
                onChange={(e) => setSonderEinmalig(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </label>

          {sonderEinmalig > 0 && (
            <label className="block">
              <span className="text-sm text-gray-600">… im Monat Nr.</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={sonderEinmaligMonat}
                  onChange={(e) =>
                    setSonderEinmaligMonat(Math.max(1, Math.round(toNumber(e.target.value))))
                  }
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Monat
                </span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Je früher, desto größer die Zinsersparnis (Monat 12 = Ende Jahr 1).
              </span>
            </label>
          )}
        </div>

        {ueberschreitetKappung && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-800">
            <strong>Hinweis:</strong> Die jährliche Sondertilgung liegt über der banktypischen
            5-%-Grenze ({formatEuro(maxSonderProJahr)}). Prüfen Sie Ihren Darlehensvertrag – über
            das vereinbarte Recht hinaus kann eine Vorfälligkeitsentschädigung anfallen.
          </div>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Ihre Ersparnis durch Sondertilgung</h3>

        {rateZuNiedrig ? (
          <p className="text-blue-50 mt-2">
            Die Monatsrate deckt nicht einmal die Zinsen. Bitte erhöhen Sie die Rate bzw. die
            Anfangstilgung.
          </p>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{formatEuro(zinsersparnis)}</span>
                <span className="text-xl text-blue-200">weniger Zinsen</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">
                und {monateZuText(laufzeitVerkuerzungMonate)} früher schuldenfrei
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-xs text-blue-100 mb-2 font-medium">
                  Ohne Sondertilgung (Szenario A)
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Laufzeit</span>
                  <span className="font-bold">{monateZuText(szenarioA.laufzeitMonate)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-blue-100">Gesamtzinsen</span>
                  <span className="font-bold">{formatEuro(szenarioA.gesamtzinsen)}</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-xs text-blue-100 mb-2 font-medium">
                  Mit Sondertilgung (Szenario B)
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Laufzeit</span>
                  <span className="font-bold">{monateZuText(szenarioB.laufzeitMonate)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-blue-100">Gesamtzinsen</span>
                  <span className="font-bold">{formatEuro(szenarioB.gesamtzinsen)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            Es werden zwei Tilgungspläne Monat für Monat parallel gerechnet – einmal{' '}
            <strong>ohne</strong> und einmal <strong>mit</strong> Sondertilgung.
          </p>
          <p>
            <strong>Pro Monat:</strong> Zinsanteil = Restschuld × (Sollzins ÷ 12) = Restschuld ×{' '}
            {formatProzent(sollzins / 12)}; Tilgungsanteil = Rate − Zinsanteil.
          </p>
          <p>
            Monatsrate = <strong>{formatEuro2(rate)}</strong>
            {eingabeModus === 'tilgung' &&
              ` (= ${formatEuro(kreditsumme)} × (${formatProzent(sollzins)} + ${formatProzent(
                anfangstilgung,
              )}) ÷ 12)`}
            .
          </p>
          <p>
            Im Szenario B wird die Sondertilgung jeweils zum Jahresende von der Restschuld
            abgezogen, <strong>bevor</strong> der nächste Monatszins berechnet wird – deshalb
            spart früh getilgtes Geld am meisten.
          </p>
          {!rateZuNiedrig && (
            <p className="pt-1 border-t border-blue-100">
              <strong>Ergebnis:</strong> Zinsersparnis = {formatEuro(szenarioA.gesamtzinsen)} −{' '}
              {formatEuro(szenarioB.gesamtzinsen)} ={' '}
              <strong>{formatEuro(zinsersparnis)}</strong>; Laufzeitverkürzung ={' '}
              {szenarioA.laufzeitMonate} − {szenarioB.laufzeitMonate} ={' '}
              <strong>{laufzeitVerkuerzungMonate} Monate</strong>.
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Dies ist eine unverbindliche Modellrechnung, keine
          Finanzierungsberatung. Gerechnet wird mit konstantem Sollzins über die gesamte Laufzeit –
          real ist der Zins nur innerhalb der Zinsbindung garantiert, der Anschlusszins ist unbekannt.
          Sondertilgungen sind nur kostenfrei möglich, soweit im Darlehensvertrag vereinbart
          (banktypisch 5–10 % der Darlehenssumme pro Jahr). Ohne vertragliches Sondertilgungsrecht
          kann eine Vorfälligkeitsentschädigung anfallen. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default SondertilgungErsparnisRechner;
