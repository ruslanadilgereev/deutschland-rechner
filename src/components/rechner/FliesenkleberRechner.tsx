import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Verbrauch Fliesenkleber je m² nach Zahnung der Kammspachtel (mittelbettiger
// Zementkleber, reines Floating-Verfahren). Richtwerte – herstellerabhängig.
// Quellen: Talu.de, Hausjournal.net (Stand 2026).
type ZahnungOption = {
  zahnung: number; // mm
  verbrauch: number; // kg/m²
  fliesen: string; // typische Fliesengröße
};

const ZAHNUNGEN: ZahnungOption[] = [
  { zahnung: 4, verbrauch: 1.8, fliesen: 'klein (< 10 cm)' },
  { zahnung: 6, verbrauch: 2.5, fliesen: '10–20 cm' },
  { zahnung: 8, verbrauch: 3.5, fliesen: '20–30 cm' },
  { zahnung: 10, verbrauch: 4.5, fliesen: '30–60 cm' },
  { zahnung: 12, verbrauch: 5.5, fliesen: 'Großformat > 60 cm' },
];

// Anmachwasser-Faktor (Richtwert ca. 0,22–0,26 l/kg = ca. 5,5–6,5 l je 25-kg-Sack)
const WASSER_FAKTOR = 0.24; // l je kg Trockenmörtel

// Buttering-Floating-Aufschlag (Grossformat/Aussen): ca. +50–100 % gegenüber
// reinem Floating. Wir nutzen +75 % als Mittelwert.
const BUTTERING_FAKTOR = 1.75;

export function FliesenkleberRechner() {
  const [flaeche, setFlaeche] = useState(10);
  const [zahnungIndex, setZahnungIndex] = useState(1); // 6 mm als Default
  const [buttering, setButtering] = useState(false);
  const [reserveProzent, setReserveProzent] = useState(10);
  const [sackgewicht, setSackgewicht] = useState(25);

  // Optionaler Fugenmörtel-Block
  const [fugeAktiv, setFugeAktiv] = useState(false);
  const [fliesenLaenge, setFliesenLaenge] = useState(30); // cm
  const [fliesenBreite, setFliesenBreite] = useState(30); // cm
  const [fugenbreite, setFugenbreite] = useState(3); // mm
  const [fugentiefe, setFugentiefe] = useState(8); // mm
  const [fugeSackgewicht, setFugeSackgewicht] = useState(5);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungültige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const aktiveZahnung = ZAHNUNGEN[zahnungIndex];
  const verbrauchJeM2Basis = aktiveZahnung.verbrauch;
  const verbrauchJeM2 = buttering
    ? verbrauchJeM2Basis * BUTTERING_FAKTOR
    : verbrauchJeM2Basis;

  // 1) Klebermenge
  const kleberKg = flaeche * verbrauchJeM2;
  const kleberKgInklReserve = kleberKg * (1 + reserveProzent / 100);

  // 2) Sackanzahl (aufrunden)
  const klebersaecke =
    sackgewicht > 0 ? Math.ceil(kleberKgInklReserve / sackgewicht) : 0;

  // 3) Anmachwasser
  const wasserLiter = kleberKgInklReserve * WASSER_FAKTOR;

  // 4) Optionaler Fugenmörtel
  // kg/m² = ((L + B) / (L × B)) × Fugenbreite × Fugentiefe × Dichte
  // L/B in mm, Fugenmaße in mm, Dichte ca. 1,7 kg/dm³
  const FUGEN_DICHTE = 1.7;
  const lMm = fliesenLaenge * 10;
  const bMm = fliesenBreite * 10;
  const fugeKgJeM2 =
    lMm > 0 && bMm > 0
      ? ((lMm + bMm) / (lMm * bMm)) * fugenbreite * fugentiefe * FUGEN_DICHTE
      : 0;
  const fugeKg = fugeKgJeM2 * flaeche;
  const fugeKgInklReserve = fugeKg * 1.1; // +10 % Reserve
  const fugensaecke =
    fugeSackgewicht > 0 ? Math.ceil(fugeKgInklReserve / fugeSackgewicht) : 0;

  const formatKg = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatL = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Fliesenkleber-Rechner" rechnerSlug="fliesenkleber-rechner" />

      {/* Zahnung-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Zahnung der Kammspachtel</span>
        <div className="grid grid-cols-3 gap-2">
          {ZAHNUNGEN.map((z, i) => (
            <button
              key={z.zahnung}
              onClick={() => setZahnungIndex(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                zahnungIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg font-bold">{z.zahnung} mm</span>
              <span className="text-center leading-tight">{z.fliesen}</span>
              <span className="text-center leading-tight text-[11px] opacity-80">
                {formatKg(z.verbrauch)} kg/m²
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Faustregel: je größer die Fliese, desto größer die Zahnung – und desto mehr Kleber je m².
        </p>
      </div>

      {/* Eingaben Kleber */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Zu fliesende Fläche</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={flaeche}
              onChange={(e) => setFlaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Verschnitt-/Reserve-Aufschlag</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={50}
              value={reserveProzent}
              onChange={(e) => setReserveProzent(Math.min(50, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Standard 10 % – deckt Verschnitt, Untergrund-Unebenheiten und Reste ab.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Sackgewicht Fliesenkleber</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={1}
              step={1}
              value={sackgewicht}
              onChange={(e) => setSackgewicht(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kg</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Üblich sind 25-kg-Säcke, im Baumarkt auch 5/10/15 kg.
          </span>
        </label>

        {/* Buttering-Floating */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={buttering}
              onChange={(e) => setButtering(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Buttering-Floating-Verfahren</span>
          </label>
          <span className="text-xs text-gray-400 mt-1 block">
            Bei Großformaten oder im Außenbereich wird Kleber auf Untergrund <em>und</em> Fliesenrückseite
            aufgetragen – Aufschlag ca. +75 %.
          </span>
        </div>
      </div>

      {/* Ergebnis Kleber */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigter Fliesenkleber</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{klebersaecke}</span>
            <span className="text-xl text-blue-200">
              {klebersaecke === 1 ? 'Sack' : 'Säcke'} à {formatKg(sackgewicht)} kg
            </span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            ca. {formatKg(kleberKgInklReserve)} kg Kleber inkl. {reserveProzent} % Reserve
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Kleber ohne Reserve</span>
              <span className="text-xl font-bold">ca. {formatKg(kleberKg)} kg</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Anmachwasser (Richtwert)</span>
              <span className="font-bold">ca. {formatL(wasserLiter)} l</span>
            </div>
          </div>

          {fugeAktiv && fugensaecke > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Fugenmörtel</span>
                <span className="font-bold">
                  {fugensaecke} × {formatKg(fugeSackgewicht)} kg · ca. {formatKg(fugeKgInklReserve)} kg
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optionaler Fugenmörtel-Block */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={fugeAktiv}
            onChange={(e) => setFugeAktiv(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700 font-medium">Fugenmörtel-Bedarf mitberechnen</span>
        </label>

        {fugeAktiv && (
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-gray-600">Fliesenlänge</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={1}
                    value={fliesenLaenge}
                    onChange={(e) => setFliesenLaenge(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                </div>
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Fliesenbreite</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={1}
                    value={fliesenBreite}
                    onChange={(e) => setFliesenBreite(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                </div>
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Fugenbreite</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.5}
                    value={fugenbreite}
                    onChange={(e) => setFugenbreite(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mm</span>
                </div>
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Fugentiefe</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.5}
                    value={fugentiefe}
                    onChange={(e) => setFugentiefe(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mm</span>
                </div>
              </label>
            </div>
            <label className="block">
              <span className="text-sm text-gray-600">Sackgewicht Fugenmörtel</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step={1}
                  value={fugeSackgewicht}
                  onChange={(e) => setFugeSackgewicht(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Fugenmörtel gibt es meist in 5-kg-Eimern/Säcken. Ergebnis inkl. 10 % Reserve.
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Klebermenge</strong> = Fläche × Verbrauch je m²
            {buttering && ' × 1,75 (Buttering-Floating)'}
          </p>
          <p>
            = {formatKg(flaeche)} m² × {formatKg(verbrauchJeM2Basis)} kg/m²
            {buttering && ' × 1,75'} = <strong>ca. {formatKg(kleberKg)} kg</strong>
          </p>
          <p>
            <strong>inkl. {reserveProzent} % Reserve</strong> = {formatKg(kleberKg)} kg ×{' '}
            {(1 + reserveProzent / 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} ={' '}
            <strong>ca. {formatKg(kleberKgInklReserve)} kg</strong>
          </p>
          <p>
            <strong>Säcke</strong> = aufrunden({formatKg(kleberKgInklReserve)} kg ÷ {formatKg(sackgewicht)} kg) ={' '}
            <strong>
              {klebersaecke} {klebersaecke === 1 ? 'Sack' : 'Säcke'}
            </strong>
          </p>
          <p>
            <strong>Anmachwasser</strong> = {formatKg(kleberKgInklReserve)} kg × {WASSER_FAKTOR.toLocaleString('de-DE')} l/kg ={' '}
            <strong>ca. {formatL(wasserLiter)} l</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Verbrauchs- und Wasserwerte sind Hersteller-Richtwerte und
          variieren mit dem Untergrund (Saugfähigkeit), der Fliesenrückseite, dem Bettverfahren und der
          Temperatur. Das Ergebnis ist eine <strong>„ca."-Schätzung</strong> – beachten Sie immer die
          Angaben auf dem konkreten Produkt. Keine Gewähr für den exakten Materialbedarf; im Zweifel
          einen Fachhandwerker konsultieren. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default FliesenkleberRechner;
