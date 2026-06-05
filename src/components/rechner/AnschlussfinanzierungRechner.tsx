import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Annuitätendarlehen auf die Restschuld am Ende der Erstzinsbindung.
// Monatsrate = Restschuld * (Sollzins + Anfangstilgung) / 100 / 12.
// Restschuld nach n Monaten: R_n = K*(1+i)^n - Rate*((1+i)^n - 1)/i, i = Zins/12.
// Quelle: Finanztip, Verbraucherzentrale.

export function AnschlussfinanzierungRechner() {
  const [restschuld, setRestschuld] = useState(180000);
  const [neuerZins, setNeuerZins] = useState(3.9);
  const [tilgung, setTilgung] = useState(3);
  const [zinsbindung, setZinsbindung] = useState(10);
  const [alteRate, setAlteRate] = useState(0);
  const [sondertilgung, setSondertilgung] = useState(0);
  const [forwardMonate, setForwardMonate] = useState(0);
  const [forwardAufschlag, setForwardAufschlag] = useState(0.02);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Forward-Aufschlag (Vorlaufmonate * Aufschlag/Monat) wird auf den Sollzins
  // addiert, wenn die Anschlussfinanzierung als Forward-Darlehen Jahre im
  // Voraus abgeschlossen wird.
  const forwardZuschlag = forwardMonate * forwardAufschlag;
  const effektiverZins = neuerZins + forwardZuschlag;

  // Monatsrate per Annuitäts-Faustformel.
  const monatsrate = (restschuld * (effektiverZins + tilgung)) / 100 / 12;

  // Restschuldverlauf über die neue Zinsbindung, mit jährlicher Sondertilgung.
  const berechneRestschuld = () => {
    const i = effektiverZins / 100 / 12;
    let rs = restschuld;
    let gezahlteZinsen = 0;
    let gezahlteRaten = 0;
    let geleisteteSonder = 0;
    const monate = Math.round(zinsbindung * 12);
    for (let m = 1; m <= monate && rs > 0; m++) {
      const zinsAnteil = rs * i;
      let tilgAnteil = monatsrate - zinsAnteil;
      if (tilgAnteil > rs) tilgAnteil = rs;
      rs -= tilgAnteil;
      gezahlteZinsen += zinsAnteil;
      gezahlteRaten += zinsAnteil + tilgAnteil;
      // Sondertilgung am Jahresende (nach jedem 12. Monat)
      if (sondertilgung > 0 && m % 12 === 0 && rs > 0) {
        const s = Math.min(sondertilgung, rs);
        rs -= s;
        geleisteteSonder += s;
      }
    }
    return { rs: Math.max(0, rs), gezahlteZinsen, gezahlteRaten, geleisteteSonder };
  };

  const ergebnis = berechneRestschuld();
  const getilgt = restschuld - ergebnis.rs;

  // Alt-vs-Neu-Vergleich (optional).
  const rateDifferenz = alteRate > 0 ? monatsrate - alteRate : 0;

  const formatEuro = (v: number) => Math.round(v).toLocaleString('de-DE');
  const formatRate = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 3 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Anschlussfinanzierung-Rechner" rechnerSlug="anschlussfinanzierung-rechner" />

      {/* Eckdaten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Restschuld am Ende der Zinsbindung</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={restschuld}
              onChange={(e) => setRestschuld(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-gray-500">neuer Sollzins p.a.</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={neuerZins}
                onChange={(e) => setNeuerZins(toNumber(e.target.value))}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">neue Anfangstilgung p.a.</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={tilgung}
                onChange={(e) => setTilgung(toNumber(e.target.value))}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-gray-500">neue Zinsbindung (Jahre)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={zinsbindung}
              onChange={(e) => setZinsbindung(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">jährl. Sondertilgung (€)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={sondertilgung}
              onChange={(e) => setSondertilgung(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-gray-500">bisherige Monatsrate (€, optional für Vergleich)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={alteRate}
            onChange={(e) => setAlteRate(toNumber(e.target.value))}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </label>
      </div>

      {/* Forward-Option */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Forward-Darlehen (optional)</span>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-gray-500">Vorlaufzeit (Monate)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={forwardMonate}
              onChange={(e) => setForwardMonate(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Aufschlag pro Monat (%-Pkt.)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.001}
              value={forwardAufschlag}
              onChange={(e) => setForwardAufschlag(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          0 Vorlaufmonate = sofortige Anschlussfinanzierung. Der Aufschlag (typ. 0,01–0,03 %-Pkt./Monat)
          erhöht den Sollzins, wenn Sie sich den Zins Jahre im Voraus sichern.
        </p>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Neue Monatsrate</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatRate(monatsrate)}</span>
            <span className="text-xl text-blue-200">€ / Monat</span>
          </div>
          {alteRate > 0 && (
            <p className="text-blue-200 text-sm mt-1">
              {rateDifferenz > 0 ? '+' : '−'}
              {formatRate(Math.abs(rateDifferenz))} € gegenüber bisher ({formatEuro(alteRate)} €)
            </p>
          )}
          {forwardMonate > 0 && (
            <p className="text-blue-200 text-sm mt-1">
              inkl. Forward-Aufschlag {formatProzent(forwardZuschlag)} %-Pkt. → effektiv{' '}
              {formatProzent(effektiverZins)} %
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">Restschuld nach {formatProzent(zinsbindung)} Jahren</span>
              <span className="font-bold">{formatEuro(ergebnis.rs)} €</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">in dieser Zeit getilgt</span>
              <span className="font-bold">{formatEuro(getilgt)} €</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">gezahlte Zinsen</span>
              <span className="font-bold">{formatEuro(ergebnis.gezahlteZinsen)} €</span>
            </div>
          </div>
          {ergebnis.geleisteteSonder > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">davon Sondertilgungen</span>
                <span className="font-bold">{formatEuro(ergebnis.geleisteteSonder)} €</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Monatsrate</strong> = Restschuld × (Sollzins + Tilgung) ÷ 12 ={' '}
            {formatEuro(restschuld)} € × {formatProzent(effektiverZins + tilgung)} % ÷ 12 ={' '}
            <strong>{formatRate(monatsrate)} €</strong>
          </p>
          <p>
            <strong>Restschuld</strong> nach {formatProzent(zinsbindung)} Jahren (mit
            {sondertilgung > 0 ? '' : ' optionaler'} Sondertilgung) ={' '}
            <strong>{formatEuro(ergebnis.rs)} €</strong>
          </p>
          <p className="text-xs text-gray-500">
            Hinweis: Die Zinsbindung ist keine Volltilgung – am Ende bleibt meist eine Restschuld, die
            erneut finanziert werden muss.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Unverbindliche Schätzung, kein Finanzberatungs- oder
          Vermittlungsangebot. Gerechnet wird mit einem konstanten Sollzins über die neue Zinsbindung;
          am Ende der Bindung bleibt in der Regel eine Restschuld, die zu einem dann unbekannten Zins
          weiterfinanziert wird. Sondertilgungen und Tilgungssatzwechsel sind nur im vertraglich
          vereinbarten Rahmen möglich. Der Forward-Aufschlag ist eine grobe Heuristik – echte
          Konditionen sind bonitäts-, beleihungs- und tagesabhängig. Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default AnschlussfinanzierungRechner;
