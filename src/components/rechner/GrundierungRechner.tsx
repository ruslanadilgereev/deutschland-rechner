import { useState } from 'react';

// Grundierungs-/Tiefengrund-Bedarf:
//  Brutto-Fläche = (Länge + Breite) × 2 × Höhe (ganzer Raum) bzw. Direkteingabe (Einzelfläche)
//  Netto = Brutto − Türen (≈ 1,8 m²/Stk) − Fenster (≈ 1,7 m²/Stk)  (nur im Raum-Modus)
//  Gebrauchsfertige Menge [l] = (Netto ÷ Reichweite) × Anstriche × (1 + Reserve)
//  Benötigtes Konzentrat [l] = Gebrauchsmenge ÷ (1 + Verdünnungsteil)
//  Reichweite richtet sich nach Saugfähigkeit/Verdünnung:
//    stark saugend ~4 m²/l (~250 ml/m²), normal ~9 m²/l (~110 ml/m²),
//    schwach saugend / verdünnt ~15 m²/l (~65 ml/m²).
// Quellen: SAKRET, Baumit, toom – technische Merkblätter Tiefengrund (Stand 2026).

const TUER_M2 = 1.8;
const FENSTER_M2 = 1.7;

// Saugfähigkeits-Voreinstellungen setzen die Reichweite in m²/l.
type UntergrundVoreinstellung = {
  name: string;
  icon: string;
  reichweite: number; // m²/l
};

const UNTERGRUENDE: UntergrundVoreinstellung[] = [
  { name: 'Stark saugend (Gips, Porenbeton)', icon: '🧱', reichweite: 4 },
  { name: 'Normal saugend (Putz, Beton)', icon: '🏠', reichweite: 9 },
  { name: 'Schwach saugend / verdünnt', icon: '💧', reichweite: 15 },
  { name: 'Eigene Eingabe', icon: '🔧', reichweite: 8 },
];

export function GrundierungRechner() {
  const [einzelflaeche, setEinzelflaeche] = useState(false);
  const [untergrundIndex, setUntergrundIndex] = useState(1);
  const [laenge, setLaenge] = useState(5);
  const [breite, setBreite] = useState(4);
  const [hoehe, setHoehe] = useState(2.5);
  const [flaecheDirekt, setFlaecheDirekt] = useState(30);
  const [tueren, setTueren] = useState(1);
  const [fenster, setFenster] = useState(1);
  const [anstriche, setAnstriche] = useState(1);
  const [reichweite, setReichweite] = useState(UNTERGRUENDE[1].reichweite);
  const [reserve, setReserve] = useState(5);
  const [verduennung, setVerduennung] = useState(0); // Verdünnungsteil: 0 = gebrauchsfertig, 1 = 1:1, 3 = 1:3
  const [gebinde, setGebinde] = useState(5); // l

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleUntergrundWechsel = (index: number) => {
    setUntergrundIndex(index);
    setReichweite(UNTERGRUENDE[index].reichweite);
  };

  const brutto = einzelflaeche ? flaecheDirekt : (laenge + breite) * 2 * hoehe;
  const abzug = einzelflaeche ? 0 : tueren * TUER_M2 + fenster * FENSTER_M2;
  const netto = Math.max(0, brutto - abzug);

  // Gebrauchsfertige (streichfertige) Menge
  const gebrauchsmenge =
    reichweite > 0 ? (netto / reichweite) * anstriche * (1 + reserve / 100) : 0;

  // Benötigtes Konzentrat (bei gebrauchsfertig = Gebrauchsmenge)
  const konzentrat = gebrauchsmenge / (1 + verduennung);

  const gebindeAnzahl = gebinde > 0 ? Math.ceil(konzentrat / gebinde) : 0;
  const mlProM2 = netto > 0 ? (gebrauchsmenge / netto) * 1000 : 0;

  const formatNum = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Untergrund-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Untergrund / Saugfähigkeit</span>
        <div className="grid grid-cols-2 gap-2">
          {UNTERGRUENDE.map((u, i) => (
            <button
              key={u.name}
              onClick={() => handleUntergrundWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                untergrundIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{u.icon}</span>
              <span className="text-center leading-tight">{u.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modus */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Fläche bestimmen</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setEinzelflaeche(false)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              !einzelflaeche
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">📐</span>
            <span className="text-center leading-tight">Raum aus Maßen (4 Wände)</span>
          </button>
          <button
            onClick={() => setEinzelflaeche(true)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              einzelflaeche
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">🟦</span>
            <span className="text-center leading-tight">Fläche direkt in m²</span>
          </button>
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {einzelflaeche ? (
          <label className="block">
            <span className="text-gray-700 font-medium">Zu grundierende Fläche</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={flaecheDirekt}
                onChange={(e) => setFlaecheDirekt(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²</span>
            </div>
          </label>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-gray-700 font-medium">Raumlänge</span>
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
              <label className="block">
                <span className="text-gray-700 font-medium">Raumhöhe</span>
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
          </>
        )}

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
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">×</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Reichweite</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={reichweite}
                onChange={(e) => setReichweite(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²/l</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">Je saugfähiger der Untergrund, desto geringer die Reichweite.</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Verdünnung (Konzentrat)</span>
            <select
              value={verduennung}
              onChange={(e) => setVerduennung(Number(e.target.value))}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>gebrauchsfertig</option>
              <option value={1}>1:1 verdünnen</option>
              <option value={3}>1:3 verdünnen</option>
            </select>
          </label>
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
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Gebindegröße zum Aufrunden</span>
          <select
            value={gebinde}
            onChange={(e) => setGebinde(Number(e.target.value))}
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1}>1 l</option>
            <option value={5}>5 l</option>
            <option value={10}>10 l</option>
          </select>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          {verduennung > 0 ? 'Benötigtes Konzentrat' : 'Benötigte Grundierung'}
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatNum(konzentrat)}</span>
            <span className="text-xl text-blue-200">Liter</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {formatNum(netto)} m² · {formatNum(anstriche)} Anstrich(e)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Gebinde à {formatNum(gebinde)} l</span>
              <span className="text-xl font-bold">{formatNum(gebindeAnzahl)} Stk</span>
            </div>
          </div>

          {verduennung > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">streichfertige Menge (verdünnt)</span>
                <span className="font-bold">{formatNum(gebrauchsmenge)} l</span>
              </div>
            </div>
          )}

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Verbrauch je m²</span>
              <span className="font-bold">≈ {formatNum(mlProM2)} ml/m²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Fläche</strong> ={' '}
            {einzelflaeche
              ? `${formatNum(flaecheDirekt)} m² (direkt)`
              : `(${formatNum(laenge)} + ${formatNum(breite)}) × 2 × ${formatNum(hoehe)} − ${formatNum(tueren)} × 1,8 − ${formatNum(fenster)} × 1,7`}{' '}
            = <strong>{formatNum(netto)} m²</strong>
          </p>
          <p>
            <strong>Streichfertige Menge</strong> = ({formatNum(netto)} ÷ {formatNum(reichweite)}) ×{' '}
            {formatNum(anstriche)} × (1 + {formatNum(reserve)} %) ={' '}
            <strong>{formatNum(gebrauchsmenge)} l</strong>
          </p>
          <p>
            <strong>Konzentrat</strong> = {formatNum(gebrauchsmenge)} ÷ (1 + {formatNum(verduennung)}) ={' '}
            <strong>{formatNum(konzentrat)} l</strong> → aufgerundet{' '}
            <strong>{formatNum(gebindeAnzahl)} × {formatNum(gebinde)} l</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Der Verbrauch von Grundierung und Tiefengrund sind Erfahrungs- bzw.
          Richtwerte und hängen stark von Untergrund, Saugfähigkeit, Werkzeug und Verarbeitung ab. Stark
          saugende, sandende oder unbehandelte Flächen brauchen deutlich mehr Material und oft einen
          zweiten Auftrag. Maßgeblich ist die Verbrauchsangabe des Herstellers auf dem Gebinde. Planen Sie
          immer eine Reserve ein. Alle Angaben ohne Gewähr – keine Bau- oder Verarbeitungsberatung.
        </p>
      </div>
    </div>
  );
}

export default GrundierungRechner;
