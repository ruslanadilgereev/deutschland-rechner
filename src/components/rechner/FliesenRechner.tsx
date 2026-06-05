import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Fliesenbedarf:
//  Fläche A      = Länge × Breite (m²)
//  Fliesenmaß    = (Breite + Fuge) × (Höhe + Fuge)  -> Fläche inkl. Fuge je Fliese
//  Brutto-Stück  = ceil(A / Fliesenfläche)
//  Mit Verschnitt= ceil(Brutto × (1 + Verschnitt))
//  Kleberbedarf  ≈ 1,6 kg/m² bei 4-mm-Zahnkelle (Richtwert)
// Quellen: blitzrechner.de, sanier.de, hausjournal.net (Stand 2026).

const KLEBER_KG_PRO_M2 = 1.6; // Richtwert, 4-mm-Zahnkelle

type Format = {
  name: string;
  icon: string;
  breite: number; // cm
  hoehe: number; // cm
  proKarton: number; // Stück pro Karton (Richtwert)
};

const FORMATE: Format[] = [
  { name: '30 × 60', icon: '🧱', breite: 30, hoehe: 60, proKarton: 8 },
  { name: '60 × 60', icon: '⬛', breite: 60, hoehe: 60, proKarton: 4 },
  { name: '30 × 30', icon: '🔲', breite: 30, hoehe: 30, proKarton: 11 },
  { name: '20 × 20', icon: '◻️', breite: 20, hoehe: 20, proKarton: 25 },
  { name: '15 × 15', icon: '▫️', breite: 15, hoehe: 15, proKarton: 44 },
  { name: 'Eigenes Maß', icon: '🔧', breite: 45, hoehe: 90, proKarton: 3 },
];

export function FliesenRechner() {
  const [formatIndex, setFormatIndex] = useState(0);
  const [laenge, setLaenge] = useState(4);
  const [breiteRaum, setBreiteRaum] = useState(3);
  const [fliesenBreite, setFliesenBreite] = useState(FORMATE[0].breite);
  const [fliesenHoehe, setFliesenHoehe] = useState(FORMATE[0].hoehe);
  const [fugeMm, setFugeMm] = useState(3);
  const [verschnitt, setVerschnitt] = useState(10);
  const [proKarton, setProKarton] = useState(FORMATE[0].proKarton);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleFormatWechsel = (index: number) => {
    setFormatIndex(index);
    const f = FORMATE[index];
    setFliesenBreite(f.breite);
    setFliesenHoehe(f.hoehe);
    setProKarton(f.proKarton);
  };

  const flaeche = laenge * breiteRaum; // m²
  const fuge = fugeMm / 1000; // mm -> m
  const fliesenflaeche = (fliesenBreite / 100 + fuge) * (fliesenHoehe / 100 + fuge); // m² inkl. Fuge

  const bruttoStueck = fliesenflaeche > 0 ? Math.ceil(flaeche / fliesenflaeche) : 0;
  const gesamtStueck = Math.ceil(bruttoStueck * (1 + verschnitt / 100));
  const kartons = proKarton > 0 ? Math.ceil(gesamtStueck / proKarton) : 0;
  const kleberKg = flaeche * KLEBER_KG_PRO_M2;

  const formatNum = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Fliesen-Rechner" rechnerSlug="fliesen-rechner" />

      {/* Fliesenformat */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Fliesenformat (cm)</span>
        <div className="grid grid-cols-3 gap-2">
          {FORMATE.map((f, i) => (
            <button
              key={f.name}
              onClick={() => handleFormatWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                formatIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-center leading-tight">{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
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
                value={breiteRaum}
                onChange={(e) => setBreiteRaum(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Fliesenbreite</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={fliesenBreite}
                onChange={(e) => setFliesenBreite(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Fliesenhöhe</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={fliesenHoehe}
                onChange={(e) => setFliesenHoehe(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
            </div>
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Fugenbreite</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={fugeMm}
              onChange={(e) => setFugeMm(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">mm</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Verschnitt</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={50}
              value={verschnitt}
              onChange={(e) => setVerschnitt(Math.min(50, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Richtwerte: gerade Verlegung 5–10 %, diagonal oder viele Ecken 15–20 %.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Fliesen pro Karton</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={proKarton}
              onChange={(e) => setProKarton(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Stk</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Steht auf der Verpackung – Richtwert je Format ist vorausgewählt.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Fliesen inkl. Verschnitt</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatNum(gesamtStueck)}</span>
            <span className="text-xl text-blue-200">Fliesen</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {formatNum(flaeche)} m² Fläche
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Ohne Verschnitt</span>
              <span className="text-xl font-bold">{formatNum(bruttoStueck)} Stk</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Kartons (gerundet)</span>
              <span className="font-bold">{formatNum(kartons)} Stk</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Fliesenkleber (≈ 1,6 kg/m²)</span>
              <span className="font-bold">{formatNum(kleberKg)} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Fläche</strong> = {formatNum(laenge)} m × {formatNum(breiteRaum)} m ={' '}
            <strong>{formatNum(flaeche)} m²</strong>
          </p>
          <p>
            <strong>Fliese inkl. Fuge</strong> = ({formatNum(fliesenBreite)} + {formatNum(fugeMm / 10)}) cm
            × ({formatNum(fliesenHoehe)} + {formatNum(fugeMm / 10)}) cm = {formatNum(fliesenflaeche)} m²
          </p>
          <p>
            <strong>Stück (gerundet)</strong> = {formatNum(flaeche)} ÷ {formatNum(fliesenflaeche)} ={' '}
            {formatNum(bruttoStueck)} Stk
          </p>
          <p>
            <strong>+ {formatNum(verschnitt)} % Verschnitt</strong> = <strong>{formatNum(gesamtStueck)} Fliesen</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Alle Werte sind Richtwerte. Der tatsächliche Verschnitt,
          Klebermenge und Fugenbedarf hängen vom Untergrund, der Verlegeart und dem Hersteller ab.
          Die genaue Stückzahl pro Karton steht auf der Verpackung. Es handelt sich um eine
          unverbindliche Schätzung – alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default FliesenRechner;
