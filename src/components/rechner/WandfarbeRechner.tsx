import { useState } from 'react';

// Farbbedarf:
//  Brutto-Wandfläche = (Länge + Breite) × 2 × Raumhöhe  (ganzer Raum)
//                      bzw. Länge × Höhe (Einzelwand)
//  Netto = Brutto − Türen (≈ 1,8 m²/Stk) − Fenster (≈ 1,7 m²/Stk)
//  Liter = (Netto / Ergiebigkeit) × Anstriche × (1 + Reserve)
//  Ergiebigkeit Default 7 m²/l (DIN EN 13300, Spanne 6–8).
// Quellen: duefa.de, derendo.com, toom.de (Stand 2026).

const TUER_M2 = 1.8;
const FENSTER_M2 = 1.7;

export function WandfarbeRechner() {
  const [einzelwand, setEinzelwand] = useState(false);
  const [laenge, setLaenge] = useState(5);
  const [breite, setBreite] = useState(4);
  const [hoehe, setHoehe] = useState(2.5);
  const [tueren, setTueren] = useState(1);
  const [fenster, setFenster] = useState(1);
  const [anstriche, setAnstriche] = useState(2);
  const [ergiebigkeit, setErgiebigkeit] = useState(7);
  const [reserve, setReserve] = useState(10);
  const [eimer, setEimer] = useState(10); // l
  const [eimerpreis, setEimerpreis] = useState(45); // € pro Eimer

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const brutto = einzelwand ? laenge * hoehe : (laenge + breite) * 2 * hoehe;
  const abzug = tueren * TUER_M2 + fenster * FENSTER_M2;
  const netto = Math.max(0, brutto - abzug);

  const liter = ergiebigkeit > 0 ? (netto / ergiebigkeit) * anstriche * (1 + reserve / 100) : 0;
  const eimerAnzahl = eimer > 0 ? Math.ceil(liter / eimer) : 0;
  const kosten = eimerAnzahl * eimerpreis;

  const formatNum = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Modus */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Was möchten Sie streichen?</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setEinzelwand(false)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              !einzelwand
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">🏠</span>
            <span className="text-center leading-tight">Ganzer Raum (4 Wände)</span>
          </button>
          <button
            onClick={() => setEinzelwand(true)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              einzelwand
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">🧱</span>
            <span className="text-center leading-tight">Einzelne Wand</span>
          </button>
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">{einzelwand ? 'Wandlänge' : 'Raumlänge'}</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={laenge}
                onChange={(e) => setLaenge(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
          {!einzelwand && (
            <label className="block">
              <span className="text-gray-700 font-medium">Raumbreite</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={breite}
                  onChange={(e) => setBreite(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </label>
          )}
          <label className="block">
            <span className="text-gray-700 font-medium">{einzelwand ? 'Wandhöhe' : 'Raumhöhe'}</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.05}
                value={hoehe}
                onChange={(e) => setHoehe(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Türen (Abzug)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={tueren}
                onChange={(e) => setTueren(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Stk</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Fenster (Abzug)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={fenster}
                onChange={(e) => setFenster(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Stk</span>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Anstriche</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={anstriche}
                onChange={(e) => setAnstriche(Math.max(1, toNumber(e.target.value)))}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">×</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Ergiebigkeit</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={ergiebigkeit}
                onChange={(e) => setErgiebigkeit(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²/l</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">Spanne 6–8 m²/l (DIN EN 13300)</span>
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Reserve</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={reserve}
              onChange={(e) => setReserve(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </label>

        {/* Kosten-Option */}
        <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Eimergröße</span>
            <select
              value={eimer}
              onChange={(e) => setEimer(Number(e.target.value))}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={2.5}>2,5 l</option>
              <option value={5}>5 l</option>
              <option value={10}>10 l</option>
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Preis je Eimer</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={eimerpreis}
                onChange={(e) => setEimerpreis(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Farbmenge</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatNum(liter)}</span>
            <span className="text-xl text-blue-200">Liter</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {formatNum(netto)} m² Wandfläche · {formatNum(anstriche)} Anstriche
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Eimer à {formatNum(eimer)} l</span>
              <span className="text-xl font-bold">{formatNum(eimerAnzahl)} Stk</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Geschätzte Kosten</span>
              <span className="font-bold">{formatEuro(kosten)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Brutto-Wandfläche</strong> ={' '}
            {einzelwand
              ? `${formatNum(laenge)} × ${formatNum(hoehe)}`
              : `(${formatNum(laenge)} + ${formatNum(breite)}) × 2 × ${formatNum(hoehe)}`}{' '}
            = {formatNum(brutto)} m²
          </p>
          <p>
            <strong>− Türen/Fenster</strong> = {formatNum(tueren)} × 1,8 + {formatNum(fenster)} × 1,7 ={' '}
            {formatNum(abzug)} m² → netto <strong>{formatNum(netto)} m²</strong>
          </p>
          <p>
            <strong>Liter</strong> = ({formatNum(netto)} ÷ {formatNum(ergiebigkeit)}) × {formatNum(anstriche)}{' '}
            × (1 + {formatNum(reserve)} %) = <strong>{formatNum(liter)} l</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Der Verbrauch hängt stark von Untergrund, Saugfähigkeit und
          Deckkraftklasse ab. Stark saugende, dunkle oder unbehandelte Wände brauchen mehr Farbe und
          oft einen zusätzlichen Anstrich oder Grundierung. Maßgeblich ist die Ergiebigkeitsangabe auf
          dem Eimer. Planen Sie immer eine Reserve ein. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default WandfarbeRechner;
