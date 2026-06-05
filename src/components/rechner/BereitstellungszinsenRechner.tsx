import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Bereitstellungszinsen fallen auf den noch nicht abgerufenen Teil des Darlehens
// an, nach Ablauf der bereitstellungsfreien Zeit. Standard: 0,25 %/Monat (= 3 %/Jahr),
// KfW 0,15 %/Monat. Ein Abruf reduziert die offene Summe ab dem Folgemonat
// (die Auszahlung erfolgt typischerweise zum Monatsende).
// Quelle: Finanztip, Sparkasse, Verivox.

type Phase = { betrag: number; monat: number };

export function BereitstellungszinsenRechner() {
  const [darlehen, setDarlehen] = useState(300000);
  const [satzMonat, setSatzMonat] = useState(0.25);
  const [freieMonate, setFreieMonate] = useState(6);
  const [phasen, setPhasen] = useState<Phase[]>([
    { betrag: 90000, monat: 6 },
    { betrag: 120000, monat: 12 },
    { betrag: 90000, monat: 18 },
  ]);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const updatePhase = (index: number, feld: keyof Phase, wert: number) => {
    setPhasen((prev) => prev.map((p, i) => (i === index ? { ...p, [feld]: wert } : p)));
  };

  const addPhase = () => {
    if (phasen.length >= 5) return;
    setPhasen((prev) => [...prev, { betrag: 0, monat: 0 }]);
  };

  const removePhase = (index: number) => {
    setPhasen((prev) => prev.filter((_, i) => i !== index));
  };

  // Summe der geplanten Abrufe (Hinweis, falls != Darlehen).
  const summeAbrufe = phasen.reduce((s, p) => s + p.betrag, 0);

  // Letzter Abrufmonat = Ende des Betrachtungszeitraums.
  const letzterMonat = phasen.reduce((max, p) => Math.max(max, p.monat), 0);

  // Bereitstellungszinsen monatsweise: auf die offene Summe nach freier Zeit.
  const berechne = () => {
    let total = 0;
    const verlauf: { monat: number; offen: number; zins: number }[] = [];
    for (let m = 1; m <= letzterMonat; m++) {
      // Abruf reduziert die offene Summe erst ab dem Folgemonat.
      const abgerufen = phasen.reduce((s, p) => (p.monat < m ? s + p.betrag : s), 0);
      const offen = Math.max(0, darlehen - abgerufen);
      let zins = 0;
      if (m > freieMonate && offen > 0) {
        zins = (offen * satzMonat) / 100;
        total += zins;
      }
      verlauf.push({ monat: m, offen, zins });
    }
    return { total, verlauf };
  };

  const { total } = berechne();
  const satzJahr = satzMonat * 12;

  const formatEuro = (v: number) => Math.round(v).toLocaleString('de-DE');
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Bereitstellungszinsen-Rechner" rechnerSlug="bereitstellungszinsen-rechner" />

      {/* Eckdaten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Darlehenssumme (gesamt)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={darlehen}
              onChange={(e) => setDarlehen(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-gray-500">Bereitstellungszins / Monat</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={satzMonat}
                onChange={(e) => setSatzMonat(toNumber(e.target.value))}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">= {formatProzent(satzJahr)} % p.a.</span>
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">bereitstellungsfreie Zeit (Monate)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={freieMonate}
              onChange={(e) => setFreieMonate(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSatzMonat(0.25)}
            className="flex-1 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100"
          >
            Standard 0,25 %/Monat
          </button>
          <button
            onClick={() => setSatzMonat(0.15)}
            className="flex-1 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100"
          >
            KfW 0,15 %/Monat
          </button>
        </div>
      </div>

      {/* Abrufplan */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Abruf-Zeitplan (Bauphasen)</span>
        <div className="space-y-3">
          {phasen.map((p, i) => (
            <div key={i} className="flex items-end gap-2">
              <label className="flex-1">
                <span className="text-xs text-gray-500">Teilbetrag (€)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={p.betrag}
                  onChange={(e) => updatePhase(i, 'betrag', toNumber(e.target.value))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>
              <label className="w-24">
                <span className="text-xs text-gray-500">in Monat</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={p.monat}
                  onChange={(e) => updatePhase(i, 'monat', toNumber(e.target.value))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>
              {phasen.length > 1 && (
                <button
                  onClick={() => removePhase(i)}
                  className="mb-1 px-2 py-2 text-red-500 hover:text-red-700 text-sm"
                  aria-label="Phase entfernen"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {phasen.length < 5 && (
          <button
            onClick={addPhase}
            className="mt-3 w-full py-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            + Bauphase hinzufügen
          </button>
        )}
        {summeAbrufe !== darlehen && (
          <p className="text-xs text-orange-600 mt-2">
            Hinweis: Summe der Abrufe ({formatEuro(summeAbrufe)} €) weicht von der Darlehenssumme
            ({formatEuro(darlehen)} €) ab.
          </p>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Bereitstellungszinsen gesamt</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(total)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            bei {formatProzent(satzMonat)} %/Monat und {freieMonate} Monaten bereitstellungsfrei
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-blue-100">letzter Abruf in Monat</span>
            <span className="font-bold">{letzterMonat}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-100">geplante Abrufe gesamt</span>
            <span className="font-bold">{formatEuro(summeAbrufe)} €</span>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            Pro Monat nach der bereitstellungsfreien Zeit: <strong>Zins</strong> = noch offene Summe ×{' '}
            {formatProzent(satzMonat)} %
          </p>
          <p>
            Jeder Abruf reduziert die offene Summe ab dem Folgemonat. Über alle Monate aufsummiert
            ergeben sich <strong>{formatEuro(total)} €</strong> Bereitstellungszinsen.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Unverbindliche Schätzung. Bereitstellungszinssatz und
          bereitstellungsfreie Zeit sind <strong>nicht gesetzlich geregelt</strong>, sondern frei
          verhandelbar und je Bank/Vertrag unterschiedlich – passen Sie die Werte an Ihren Vertrag an.
          Banken nutzen teils unterschiedliche Tageszählungen (360 vs. 365 Tage); hier wird monatlich
          pauschal gerechnet (Standard 0,25 %/Monat). Die tatsächliche Höhe steht in Ihrem
          Darlehensvertrag. Keine Finanz- oder Steuerberatung, Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default BereitstellungszinsenRechner;
