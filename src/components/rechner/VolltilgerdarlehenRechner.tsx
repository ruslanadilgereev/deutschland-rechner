import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Volltilgerdarlehen = Annuitätendarlehen mit Sollzinsbindung = Laufzeit,
// sodass die Restschuld am Laufzeitende exakt 0 ist.
// Monatliche Annuität: A = K0 * (q^N * (q-1)) / (q^N - 1), q = 1 + i, i = Zins/12, N = Jahre*12.
// Quelle: zinsen-berechnen.de, Interhyp, Verbraucherzentrale.

export function VolltilgerdarlehenRechner() {
  const [darlehen, setDarlehen] = useState(300000);
  const [sollzins, setSollzins] = useState(3.7);
  const [laufzeit, setLaufzeit] = useState(20);
  const [zinsrabatt, setZinsrabatt] = useState(0);
  const [vglTilgung, setVglTilgung] = useState(2);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Effektiver Zins beim Volltilger (oft mit kleinem Rabatt).
  const zinsVoll = Math.max(0, sollzins - zinsrabatt);

  // Annuität (Monatsrate) für die Volltilgung.
  const annuitaet = (K: number, zinsPa: number, jahre: number) => {
    const i = zinsPa / 100 / 12;
    const N = jahre * 12;
    if (K <= 0 || N <= 0) return 0;
    if (i === 0) return K / N;
    const q = Math.pow(1 + i, N);
    return (K * (q * i)) / (q - 1);
  };

  const rate = annuitaet(darlehen, zinsVoll, laufzeit);
  const monate = laufzeit * 12;

  // Anfänglicher Tilgungssatz p.a.
  const ersterZins = (darlehen * zinsVoll) / 100 / 12;
  const ersteTilgung = rate - ersterZins;
  const anfTilgungssatz = darlehen > 0 ? ((ersteTilgung * 12) / darlehen) * 100 : 0;

  // Gesamtzinsen über die Laufzeit.
  const gesamtzinsen = rate * monate - darlehen;

  // Vergleich Standarddarlehen: gleiche Laufzeit, niedrigere Anfangstilgung,
  // gleicher (ungerabatteter) Sollzins → Restschuld > 0 am Bindungsende.
  const vglRate = (darlehen * (sollzins + vglTilgung)) / 100 / 12;
  const vglRestschuld = () => {
    const i = sollzins / 100 / 12;
    const q = Math.pow(1 + i, monate);
    return Math.max(0, darlehen * q - vglRate * (q - 1) / i);
  };
  const restschuldStandard = vglRestschuld();

  const formatEuro = (v: number) => Math.round(v).toLocaleString('de-DE');
  const formatRate = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Volltilgerdarlehen-Rechner" rechnerSlug="volltilgerdarlehen-rechner" />

      {/* Eckdaten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Darlehenssumme</span>
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

        <label className="block">
          <span className="text-gray-700 font-medium">Gebundener Sollzins p.a.</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={sollzins}
              onChange={(e) => setSollzins(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">
            Laufzeit / Zinsbindung: {formatProzent(laufzeit)} Jahre
          </span>
          <input
            type="range"
            min={10}
            max={40}
            step={1}
            value={laufzeit}
            onChange={(e) => setLaufzeit(toNumber(e.target.value))}
            className="mt-3 w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10 Jahre</span>
            <span>40 Jahre</span>
          </div>
        </label>

        <label className="block">
          <span className="text-xs text-gray-500">Zinsrabatt für Volltilger (%-Punkte, optional)</span>
          <div className="mt-1 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.05}
              value={zinsrabatt}
              onChange={(e) => setZinsrabatt(toNumber(e.target.value))}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Volltilger erhalten oft 0,05–0,2 %-Punkte Rabatt. Effektiver Zins: {formatProzent(zinsVoll)} %
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          Monatsrate für Volltilgung in {formatProzent(laufzeit)} Jahren
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatRate(rate)}</span>
            <span className="text-xl text-blue-200">€ / Monat</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            anfängliche Tilgung {formatProzent(anfTilgungssatz)} % p.a. · Restschuld am Ende: 0 €
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">Gesamtzinsen über die Laufzeit</span>
              <span className="font-bold">{formatEuro(gesamtzinsen)} €</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Gesamtkosten (Zins + Tilgung)</span>
              <span className="font-bold">{formatEuro(rate * monate)} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-sm mb-2">
              Vergleich: Standarddarlehen mit {formatProzent(vglTilgung)} % Tilgung, gleiche Laufzeit
            </p>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-blue-100">Rate Standard</span>
              <span className="font-bold">{formatRate(vglRate)} €</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Restschuld nach {formatProzent(laufzeit)} J</span>
              <span className="font-bold">{formatEuro(restschuldStandard)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vergleichs-Tilgung */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <label className="block">
          <span className="text-sm text-gray-600">Vergleichs-Tilgung Standarddarlehen (%)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={vglTilgung}
            onChange={(e) => setVglTilgung(toNumber(e.target.value))}
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-xs text-gray-400 mt-1 block">
            So sehen Sie, wie viel Restschuld bei einem normalen Darlehen mit niedrigerer Tilgung
            übrig bliebe.
          </span>
        </label>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Rate</strong> = K × (q<sup>N</sup> × (q−1)) ÷ (q<sup>N</sup> − 1), q = 1 + Zins ÷ 12,
            N = {formatProzent(laufzeit)} × 12 = {monate} Monate
          </p>
          <p>
            = {formatEuro(darlehen)} € bei {formatProzent(zinsVoll)} % auf {monate} Monate ={' '}
            <strong>{formatRate(rate)} € / Monat</strong>
          </p>
          <p>
            <strong>anf. Tilgung</strong> = (Rate − Zins<sub>1</sub>) × 12 ÷ K ={' '}
            <strong>{formatProzent(anfTilgungssatz)} %</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Unverbindliche Orientierungsrechnung, keine Finanz- oder
          Kreditberatung. Die berechnete Annuität ist eine mathematische Näherung auf Basis einer
          konstanten Monatsrate und nomineller Sollzinsverzinsung – sie entspricht nicht dem
          PAngV-Effektivzins. Tatsächliche Konditionen, Effektivzins, Bereitstellungszinsen, der
          Zinsrabatt und die maximale Volltilger-Laufzeit variieren je Bank. Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default VolltilgerdarlehenRechner;
