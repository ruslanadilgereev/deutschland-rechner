import { useState } from 'react';

// Restschuld-Rechner – Annuitätendarlehen mit monatlicher Verzinsung.
// Quellen: Finanzfluss (Restschuld-Formel), Schuldnerberatung.de, baufi24 (Stand 2026).
// Modell: konstanter Sollzins, idealisierte Annuität, optionale jährliche Sondertilgung.

type RatenModus = 'tilgung' | 'rate';

// Häufige Konstellationen als Voreinstellungen (Baufinanzierung & Konsumkredit).
type Voreinstellung = {
  name: string;
  icon: string;
  darlehen: number;
  sollzins: number;
  tilgung: number;
  zinsbindung: number;
};

const PRESETS: Voreinstellung[] = [
  { name: 'Baufi 300k', icon: '🏠', darlehen: 300000, sollzins: 3.5, tilgung: 2, zinsbindung: 10 },
  { name: 'Baufi 400k', icon: '🏡', darlehen: 400000, sollzins: 3.8, tilgung: 2, zinsbindung: 15 },
  { name: 'Wohnung 200k', icon: '🏢', darlehen: 200000, sollzins: 3.5, tilgung: 3, zinsbindung: 10 },
  { name: 'Konsumkredit', icon: '💳', darlehen: 20000, sollzins: 7, tilgung: 10, zinsbindung: 5 },
  { name: 'Eigene Eingabe', icon: '🔧', darlehen: 250000, sollzins: 3.5, tilgung: 2, zinsbindung: 12 },
];

export function RestschuldRechner() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [darlehen, setDarlehen] = useState(PRESETS[0].darlehen);
  const [sollzins, setSollzins] = useState(PRESETS[0].sollzins);
  const [ratenModus, setRatenModus] = useState<RatenModus>('tilgung');
  const [tilgung, setTilgung] = useState(PRESETS[0].tilgung);
  const [festeRate, setFesteRate] = useState(1375);
  const [zinsbindung, setZinsbindung] = useState(PRESETS[0].zinsbindung);
  const [sondertilgung, setSondertilgung] = useState(0);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungültige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handlePresetWechsel = (index: number) => {
    setPresetIndex(index);
    const p = PRESETS[index];
    setDarlehen(p.darlehen);
    setSollzins(p.sollzins);
    setTilgung(p.tilgung);
    setZinsbindung(p.zinsbindung);
    setRatenModus('tilgung');
  };

  // Monatszins (Dezimal)
  const i = sollzins / 100 / 12;

  // Monatsrate: entweder aus anfänglicher Tilgung abgeleitet oder fest eingegeben.
  const rateAusTilgung = (darlehen * ((sollzins + tilgung) / 100)) / 12;
  const rate = ratenModus === 'tilgung' ? rateAusTilgung : festeRate;

  // Laufzeit bis Stichtag = Zinsbindung in Monaten.
  const k = Math.round(zinsbindung * 12);

  // Monatsweise Simulation (deckt Sondertilgung sauber ab; ohne Sondertilgung
  // identisch zur geschlossenen Annuitätenformel R_k = D·(1+i)^k − Rate·((1+i)^k−1)/i).
  let restschuld = darlehen;
  let gezahlteZinsen = 0;
  let summeSonder = 0;
  let abbezahltImMonat = 0; // Monat, in dem die Restschuld 0 erreicht (0 = nicht erreicht)

  for (let m = 1; m <= k; m++) {
    const zinsAnteil = restschuld * i;
    let tilgAnteil = rate - zinsAnteil;
    // Letzte Rate kappen, damit nicht über 0 hinaus getilgt wird.
    if (tilgAnteil > restschuld) tilgAnteil = restschuld;
    if (tilgAnteil < 0) tilgAnteil = 0; // Rate deckt nicht einmal die Zinsen
    restschuld -= tilgAnteil;
    gezahlteZinsen += zinsAnteil;
    if (restschuld <= 0 && abbezahltImMonat === 0) abbezahltImMonat = m;
    // Sondertilgung nach jedem vollen Jahr (vor Weiterverzinsung im Folgemonat).
    if (sondertilgung > 0 && m % 12 === 0 && restschuld > 0) {
      const angewandt = Math.min(sondertilgung, restschuld);
      restschuld -= angewandt;
      summeSonder += angewandt;
      if (restschuld <= 0 && abbezahltImMonat === 0) abbezahltImMonat = m;
    }
  }

  if (restschuld < 0) restschuld = 0;
  const getilgt = darlehen - restschuld;
  const rateDecktZinsenNicht = rate <= darlehen * i;

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatEuro0 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Beispiel auswählen</span>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => handlePresetWechsel(idx)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                presetIndex === idx
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-center leading-tight">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Darlehensbetrag</span>
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
          <span className="text-gray-700 font-medium">Sollzins p.a.</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={sollzins}
              onChange={(e) => setSollzins(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </label>

        {/* Raten-Modus */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Monatsrate festlegen über</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRatenModus('tilgung')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                ratenModus === 'tilgung'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              anfängliche Tilgung %
            </button>
            <button
              onClick={() => setRatenModus('rate')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                ratenModus === 'rate'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              feste Monatsrate €
            </button>
          </div>
        </div>

        {ratenModus === 'tilgung' ? (
          <label className="block">
            <span className="text-gray-700 font-medium">Anfängliche Tilgung p.a.</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={tilgung}
                onChange={(e) => setTilgung(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Daraus ergibt sich die Monatsrate: {formatEuro(rateAusTilgung)} €
            </span>
          </label>
        ) : (
          <label className="block">
            <span className="text-gray-700 font-medium">Feste Monatsrate</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={festeRate}
                onChange={(e) => setFesteRate(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Zins im 1. Monat: {formatEuro(darlehen * i)} € – die Rate muss höher liegen, sonst sinkt die Restschuld nie.
            </span>
          </label>
        )}

        <label className="block">
          <span className="text-gray-700 font-medium">Zinsbindung / Laufzeit bis Stichtag</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={40}
              step={1}
              value={zinsbindung}
              onChange={(e) => setZinsbindung(Math.min(40, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Jahre</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Restschuld zum Ende dieses Zeitraums ({k} Monate) – z. B. zur Anschlussfinanzierung.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Jährliche Sondertilgung (optional)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={sondertilgung}
              onChange={(e) => setSondertilgung(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Wird am Ende jedes vollen Jahres zusätzlich auf die Restschuld angerechnet.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          Restschuld nach {zinsbindung} Jahren
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(restschuld)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            verbleibende Schuld zum Ende der Zinsbindung
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">bereits getilgt</span>
              <span className="text-xl font-bold">{formatEuro(getilgt)} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">gezahlte Zinsen bis Stichtag</span>
              <span className="font-bold">{formatEuro(gezahlteZinsen)} €</span>
            </div>
          </div>

          {summeSonder > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">davon durch Sondertilgung</span>
                <span className="font-bold">{formatEuro(summeSonder)} €</span>
              </div>
            </div>
          )}

          {abbezahltImMonat > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">vollständig getilgt nach</span>
                <span className="font-bold">
                  {Math.floor(abbezahltImMonat / 12)} J. {abbezahltImMonat % 12} Mon.
                </span>
              </div>
            </div>
          )}
        </div>

        {rateDecktZinsenNicht && (
          <p className="text-yellow-200 text-xs mt-4">
            ⚠️ Die Monatsrate deckt nicht einmal die Zinsen – so wird das Darlehen nie getilgt.
            Bitte Rate oder Tilgung erhöhen.
          </p>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Monatszins i</strong> = Sollzins ÷ 12 = {sollzins} % ÷ 12 ={' '}
            {(i * 100).toLocaleString('de-DE', { maximumFractionDigits: 4 })} %
          </p>
          <p>
            <strong>Monatsrate</strong> ={' '}
            {ratenModus === 'tilgung'
              ? `Darlehen × (Sollzins + Tilgung) ÷ 12 = ${formatEuro0(darlehen)} € × ${(
                  (sollzins + tilgung) /
                  100
                ).toLocaleString('de-DE', { maximumFractionDigits: 4 })} ÷ 12`
              : 'fest vorgegeben'}{' '}
            = <strong>{formatEuro(rate)} €</strong>
          </p>
          <p>
            <strong>Restschuld</strong> = Darlehen × (1 + i)<sup>k</sup> − Rate × ((1 + i)
            <sup>k</sup> − 1) ÷ i
            {summeSonder > 0 && ' (abzüglich Sondertilgungen)'}
          </p>
          <p>
            mit k = {zinsbindung} × 12 = {k} Monaten ={' '}
            <strong>{formatEuro(restschuld)} €</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Dies ist eine vereinfachte Modellrechnung (konstanter Sollzins,
          idealisiertes Annuitätenmodell, monatliche Tilgungsverrechnung) – <strong>ohne</strong>{' '}
          Gebühren, Disagio, Bereitstellungszinsen oder Restschuldversicherung. Reale Banken rechnen
          die Tilgung je nach Vertrag täglich, monatlich oder jährlich an, wodurch die Restschuld leicht
          abweichen kann. Das Ergebnis ist unverbindlich und ersetzt keine Finanzierungsberatung –
          keine Anlage- oder Finanzierungsberatung, Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default RestschuldRechner;
