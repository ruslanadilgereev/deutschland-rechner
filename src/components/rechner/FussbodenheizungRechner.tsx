import { useState } from 'react';

// Faustwerte Rohrbedarf je Quadratmeter nach Verlegeabstand.
// Quelle: Heizsparer, Haustec, Heliogaia (DIN EN 1264 als Auslegungsrahmen).
// Die Werte enthalten einen kleinen Aufschlag fuer Boegen gegenueber dem
// rein rechnerischen 1 / Verlegeabstand.
type VerlegeOption = {
  label: string;
  abstandCm: number; // Verlegeabstand in cm
  rohrProM2: number; // Meter Rohr je m2 (Faustwert)
  hinweis: string;
};

const VERLEGE_OPTIONEN: VerlegeOption[] = [
  { label: 'VA 10 cm', abstandCm: 10, rohrProM2: 8.8, hinweis: 'Bad, Altbau, hoher Wärmebedarf' },
  { label: 'VA 12,5 cm', abstandCm: 12.5, rohrProM2: 6.8, hinweis: 'Übergangsbereich, Randzonen' },
  { label: 'VA 15 cm', abstandCm: 15, rohrProM2: 5.8, hinweis: 'Wohn- und Schlafraum (Standard)' },
  { label: 'VA 20 cm', abstandCm: 20, rohrProM2: 4.6, hinweis: 'gut gedämmter Neubau, geringe Last' },
];

export function FussbodenheizungRechner() {
  const [flaeche, setFlaeche] = useState(20); // Raumfläche in m2
  const [verlegeIndex, setVerlegeIndex] = useState(2); // Default VA 15 cm
  const [abstandVerteiler, setAbstandVerteiler] = useState(5); // m zum Heizkreisverteiler
  const [maxKreislaenge, setMaxKreislaenge] = useState(100); // max. Heizkreislänge in m

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const option = VERLEGE_OPTIONEN[verlegeIndex];

  // 1) Rohr auf der Heizfläche
  const rohrHeizflaeche = flaeche * option.rohrProM2;

  // 2) Anbindeleitung (Vor- und Rücklauf) zum Verteiler je Heizkreis
  const anbindungProKreis = 2 * abstandVerteiler;

  // 5) Anzahl Heizkreise: zunächst nur die Heizfläche, dann je Kreis Anbindung addieren.
  // Da jeder Kreis zusätzlich die Anbindeleitung trägt, iterieren wir bis die
  // effektive Kreislänge unter dem Maximum liegt.
  const sichereMaxKreis = Math.max(1, maxKreislaenge);
  let heizkreise = 1;
  if (rohrHeizflaeche > 0) {
    heizkreise = Math.max(
      1,
      Math.ceil(rohrHeizflaeche / Math.max(1, sichereMaxKreis - anbindungProKreis))
    );
  }

  const anbindungGesamt = anbindungProKreis * heizkreise;
  const gesamtRohr = rohrHeizflaeche + anbindungGesamt;
  const laengeProKreis = heizkreise > 0 ? gesamtRohr / heizkreise : 0;

  const formatMeter = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  const ueberMax = laengeProKreis > sichereMaxKreis + 0.5;

  return (
    <div className="max-w-lg mx-auto">

      {/* Verlegeabstand-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Verlegeabstand wählen</span>
        <div className="grid grid-cols-2 gap-2">
          {VERLEGE_OPTIONEN.map((v, i) => (
            <button
              key={v.label}
              onClick={() => setVerlegeIndex(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                verlegeIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-base font-bold">{v.label}</span>
              <span className="text-center leading-tight">{v.rohrProM2} m/m²</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">{option.hinweis}</p>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Raumfläche</span>
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
          <span className="text-gray-700 font-medium">Abstand zum Heizkreisverteiler</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={abstandVerteiler}
              onChange={(e) => setAbstandVerteiler(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Für die Anbindeleitung (Vor- und Rücklauf) wird die doppelte Strecke je Heizkreis addiert.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Max. Heizkreislänge</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              step={5}
              value={maxKreislaenge}
              onChange={(e) => setMaxKreislaenge(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Faustwert: 16-mm-Rohr ca. 100 m, 17-mm-Rohr ca. 120 m. Herstellerangaben beachten.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Materialbedarf für diesen Raum</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatMeter(gesamtRohr)}</span>
            <span className="text-xl text-blue-200">m Rohr gesamt</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            inkl. {formatMeter(anbindungGesamt)} m Anbindeleitung
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Anzahl Heizkreise</span>
              <span className="text-xl font-bold">{heizkreise}</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Länge je Heizkreis</span>
              <span className="font-bold">≈ {formatMeter(laengeProKreis)} m</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Rohr auf der Heizfläche</span>
              <span className="font-bold">{formatMeter(rohrHeizflaeche)} m</span>
            </div>
          </div>
        </div>

        {ueberMax && (
          <p className="text-xs text-yellow-200 mt-4">
            ⚠️ Die rechnerische Kreislänge liegt über dem Maximum – prüfen Sie Fläche, Verlegeabstand
            und Verteilerabstand oder teilen Sie den Raum auf weitere Kreise auf.
          </p>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Rohr Heizfläche</strong> = Fläche × Rohr je m² (bei {option.label}:{' '}
            {option.rohrProM2} m/m²)
          </p>
          <p>
            = {formatMeter(flaeche)} m² × {option.rohrProM2} = <strong>{formatMeter(rohrHeizflaeche)} m</strong>
          </p>
          <p>
            <strong>Heizkreise</strong> = aufrunden(Rohr ÷ nutzbare Kreislänge) ={' '}
            <strong>{heizkreise}</strong>
          </p>
          <p>
            <strong>Anbindeleitung</strong> = 2 × {formatMeter(abstandVerteiler)} m × {heizkreise} Kreise ={' '}
            {formatMeter(anbindungGesamt)} m
          </p>
          <p>
            <strong>Gesamtrohr</strong> = {formatMeter(rohrHeizflaeche)} m + {formatMeter(anbindungGesamt)} m ={' '}
            <strong>{formatMeter(gesamtRohr)} m</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Dieser Faustwert-Überschlag dient der Materialplanung und ersetzt
          keine raumweise Heizlastberechnung und hydraulische Auslegung nach DIN EN 1264 durch einen
          Fachplaner oder SHK-Betrieb. Maximale Heizkreislänge und der Verlegeabstand-Toleranzwert
          (1 cm nach DIN EN 1264-4) sind Richtwerte; maßgeblich sind die herstellerspezifischen
          Systemangaben (Rohrdurchmesser, Estrichsystem). Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default FussbodenheizungRechner;
