import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Standard-Tilgungssaetze, die nebeneinander verglichen werden.
// Klassische Faustregel-Spanne in der Baufinanzierung: 1 % (Minimum vieler Banken)
// bis 4 % (schnelle Entschuldung). Frei anpassbar.
const TILGUNG_DEFAULTS = [1, 2, 3, 4];

// Voreinstellungen so gewaehlt, dass das Ergebnis beim ersten Render bereits
// aussagekraeftig ist (typische Baufinanzierung 2026).
const DARLEHEN_DEFAULT = 300000; // EUR
const SOLLZINS_DEFAULT = 3.5; // % p.a.
const ZINSBINDUNG_DEFAULT = 10; // Jahre

export function TilgungssatzVergleichRechner() {
  const [darlehen, setDarlehen] = useState(DARLEHEN_DEFAULT);
  const [sollzins, setSollzins] = useState(SOLLZINS_DEFAULT);
  const [zinsbindung, setZinsbindung] = useState(ZINSBINDUNG_DEFAULT);
  const [tilgungssaetze, setTilgungssaetze] = useState<number[]>(TILGUNG_DEFAULTS);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const setTilgung = (index: number, value: number) => {
    setTilgungssaetze((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const i = sollzins / 100 / 12; // Monatszins (Dezimal)
  const nZb = Math.round(zinsbindung * 12); // Monate bis Zinsbindungsende

  type Ergebnis = {
    tilgung: number;
    monatsrate: number;
    restschuldBindung: number;
    volltilgungMonate: number;
    gesamtzins: number;
    tilgtSich: boolean;
  };

  const berechne = (tilgungProzent: number): Ergebnis => {
    const annuitaetJahr = darlehen * ((sollzins + tilgungProzent) / 100);
    const monatsrate = annuitaetJahr / 12;

    // Sonderfall: ohne Zins (i = 0) oder ohne Darlehen
    if (darlehen <= 0) {
      return { tilgung: tilgungProzent, monatsrate: 0, restschuldBindung: 0, volltilgungMonate: 0, gesamtzins: 0, tilgtSich: true };
    }
    if (i <= 0) {
      const monate = monatsrate > 0 ? Math.ceil(darlehen / monatsrate) : 0;
      const restBindung = Math.max(0, darlehen - monatsrate * nZb);
      return { tilgung: tilgungProzent, monatsrate, restschuldBindung: restBindung, volltilgungMonate: monate, gesamtzins: 0, tilgtSich: monatsrate > 0 };
    }

    // Tilgt sich das Darlehen ueberhaupt? Nur wenn die Rate groesser ist als
    // der anfaengliche Zinsanteil (sonst waechst die Restschuld).
    const tilgtSich = monatsrate > darlehen * i;

    // Restschuld am Zinsbindungsende (geschlossene Formel)
    const q = Math.pow(1 + i, nZb);
    const restschuldBindung = Math.max(0, darlehen * q - monatsrate * ((q - 1) / i));

    if (!tilgtSich) {
      return { tilgung: tilgungProzent, monatsrate, restschuldBindung, volltilgungMonate: Infinity, gesamtzins: Infinity, tilgtSich: false };
    }

    // Zeit bis Volltilgung in Monaten (geschlossene Formel, aufgerundet)
    const volltilgungMonate = Math.ceil(
      Math.log(monatsrate / (monatsrate - darlehen * i)) / Math.log(1 + i)
    );

    // Gesamtzinslast: alle vollen Raten + gekappte Schlussrate minus Darlehen.
    // Iterativ, damit die letzte Rate die Restschuld exakt auf 0 bringt.
    let restschuld = darlehen;
    let gezahlt = 0;
    for (let m = 0; m < volltilgungMonate; m++) {
      const zins = restschuld * i;
      let rate = monatsrate;
      if (restschuld + zins < monatsrate) {
        rate = restschuld + zins; // gekappte Schlussrate
      }
      gezahlt += rate;
      restschuld = restschuld + zins - rate;
      if (restschuld < 0) restschuld = 0;
    }
    const gesamtzins = gezahlt - darlehen;

    return { tilgung: tilgungProzent, monatsrate, restschuldBindung, volltilgungMonate, gesamtzins, tilgtSich: true };
  };

  const ergebnisse = tilgungssaetze.map(berechne);

  const formatEuro0 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatEuro2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatZeit = (monate: number) => {
    if (!Number.isFinite(monate)) return 'tilgt nicht';
    const jahre = Math.floor(monate / 12);
    const restMonate = monate % 12;
    if (jahre === 0) return `${restMonate} Mon.`;
    if (restMonate === 0) return `${jahre} J.`;
    return `${jahre} J. ${restMonate} M.`;
  };

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Tilgungssatz-Vergleich-Rechner" rechnerSlug="tilgungssatz-vergleich-rechner" />

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Darlehensbetrag</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={darlehen}
              onChange={(e) => setDarlehen(toNumber(e.target.value))}
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

        <label className="block">
          <span className="text-gray-700 font-medium">Zinsbindung</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={40}
              value={zinsbindung}
              onChange={(e) => setZinsbindung(Math.min(40, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Jahre</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Bestimmt, wann die ausgewiesene Restschuld berechnet wird (üblich: 10, 15 oder 20 Jahre).
          </span>
        </label>

        {/* Zu vergleichende Tilgungssaetze */}
        <div className="border-t border-gray-100 pt-4">
          <span className="text-gray-700 font-medium block mb-3">Zu vergleichende Tilgungssätze</span>
          <div className="grid grid-cols-4 gap-2">
            {tilgungssaetze.map((t, idx) => (
              <label key={idx} className="block">
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.5}
                    value={t}
                    onChange={(e) => setTilgung(idx, toNumber(e.target.value))}
                    className="w-full px-2 py-2 pr-6 border border-gray-300 rounded-lg text-center text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </label>
            ))}
          </div>
          <span className="text-xs text-gray-400 mt-2 block">
            Anfangstilgung im ersten Jahr. Standard: 1 / 2 / 3 / 4 % – jeder Wert ist frei änderbar.
          </span>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-4">
          Vergleich der Tilgungssätze bei {formatEuro0(darlehen)} € · {formatEuro2(sollzins)} % Sollzins
        </h3>

        <div className="space-y-3">
          {ergebnisse.map((e, idx) => (
            <div key={idx} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-bold text-lg">{formatEuro2(e.tilgung)} % Tilgung</span>
                <span className="text-xl font-bold">{formatEuro2(e.monatsrate)} €<span className="text-sm text-blue-200">/Monat</span></span>
              </div>
              {e.tilgtSich ? (
                <div className="grid grid-cols-3 gap-2 text-xs text-blue-100">
                  <div>
                    <div className="text-blue-200">Restschuld nach {zinsbindung} J.</div>
                    <div className="font-semibold text-white text-sm">{formatEuro0(e.restschuldBindung)} €</div>
                  </div>
                  <div>
                    <div className="text-blue-200">Volltilgung in</div>
                    <div className="font-semibold text-white text-sm">{formatZeit(e.volltilgungMonate)}</div>
                  </div>
                  <div>
                    <div className="text-blue-200">Zinsen gesamt</div>
                    <div className="font-semibold text-white text-sm">{formatEuro0(e.gesamtzins)} €</div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-yellow-200">
                  Rate deckt nicht einmal die Zinsen – das Darlehen tilgt sich nicht. Tilgungssatz erhöhen.
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="text-blue-200 text-xs mt-4">
          Volltilgung &amp; Gesamtzinsen unter der Annahme, dass der heutige Sollzins über die gesamte Laufzeit gilt.
        </p>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Monatsrate</strong> = Darlehen × (Sollzins % + Tilgung %) ÷ 12
          </p>
          {ergebnisse[0] && (
            <p>
              Bei {formatEuro2(ergebnisse[0].tilgung)} %: {formatEuro0(darlehen)} × ({formatEuro2(sollzins)} % + {formatEuro2(ergebnisse[0].tilgung)} %) ÷ 12 ={' '}
              <strong>{formatEuro2(ergebnisse[0].monatsrate)} €</strong>
            </p>
          )}
          <p>
            <strong>Restschuld</strong> = Darlehen × (1 + i)<sup>n</sup> − Rate × ((1 + i)<sup>n</sup> − 1) ÷ i,
            mit i = Sollzins ÷ 12 = {formatEuro2(i * 100)} % pro Monat und n = {nZb} Monaten.
          </p>
          <p>
            Je höher die Tilgung, desto höher die Rate – aber desto schneller sinkt die Restschuld und
            desto weniger Zinsen zahlen Sie insgesamt.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Unverbindliche Orientierung, keine Finanz- oder Anlageberatung. Der
          Rechner nimmt an, dass der heutige Sollzins über die <strong>gesamte Laufzeit</strong> konstant
          bleibt. Tatsächlich endet die Zinsbindung nach 10, 15 oder 20 Jahren und es folgt eine
          Anschlussfinanzierung zu dann unbekanntem Zins. Volltilgungsdauer und Gesamtzinslast sind daher
          Modellwerte. Keine Gewähr für Rechenergebnisse – Konditionen variieren je Bank und Bonität.
        </p>
      </div>
    </div>
  );
}

export default TilgungssatzVergleichRechner;
