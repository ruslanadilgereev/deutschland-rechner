import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Spezifische Heizlast je Dämmstandard (Watt pro m²). Richtwerte für die
// überschlägige Flächen-Methode. Quelle: Bosch / Viessmann Heizungsratgeber.
// ACHTUNG: ersetzt keine raumweise Heizlastberechnung nach DIN EN 12831.
type DaemmVoreinstellung = {
  name: string;
  icon: string;
  wattProM2: number;
};

const DAEMMSTANDARDS: DaemmVoreinstellung[] = [
  { name: 'Unsanierter Altbau', icon: '🏚️', wattProM2: 150 },
  { name: 'Teilsaniert', icon: '🧱', wattProM2: 100 },
  { name: 'Saniert', icon: '🔧', wattProM2: 70 },
  { name: 'Neubau (GEG)', icon: '🏡', wattProM2: 45 },
  { name: 'KfW-Effizienz / Passiv', icon: '🌿', wattProM2: 25 },
];

export function HeizlastRechner() {
  const [daemmIndex, setDaemmIndex] = useState(2);
  const [wohnflaeche, setWohnflaeche] = useState(130);
  const [wattProM2, setWattProM2] = useState(DAEMMSTANDARDS[2].wattProM2);
  const [personen, setPersonen] = useState(0);
  const [sperrzeit, setSperrzeit] = useState(false);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleDaemmWechsel = (index: number) => {
    setDaemmIndex(index);
    setWattProM2(DAEMMSTANDARDS[index].wattProM2);
  };

  // Grundlast aus Fläche × spezifischer Heizlast (Umrechnung W → kW).
  const grundlastKw = (wohnflaeche * wattProM2) / 1000;

  // Optionaler Warmwasser-Aufschlag: rund 0,2 kW pro Person.
  const warmwasserKw = personen * 0.2;

  // Optionaler EVU-Sperrzeiten-Aufschlag bei Wärmepumpe: rund +15 %.
  const zwischensumme = grundlastKw + warmwasserKw;
  const sperrzeitAufschlagKw = sperrzeit ? zwischensumme * 0.15 : 0;

  const heizlastKw = zwischensumme + sperrzeitAufschlagKw;

  const fmt1 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const fmt2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const fmt0 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Heizlast-Rechner" rechnerSlug="heizlast-rechner" />

      {/* YMYL-Warnhinweis prominent oben */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 text-sm text-orange-800">
        <p>
          <strong>⚠️ Nur überschlägiger Orientierungswert.</strong> Die vereinfachte Flächen-Methode ist
          nach GEG für die vorgeschriebene Heizlastberechnung <strong>nicht zulässig</strong>. Verbindlich
          ist die raumweise Berechnung nach <strong>DIN EN 12831</strong> durch eine Fachkraft.
        </p>
      </div>

      {/* Dämmstandard-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Dämmstandard wählen</span>
        <div className="grid grid-cols-2 gap-2">
          {DAEMMSTANDARDS.map((d, i) => (
            <button
              key={d.name}
              onClick={() => handleDaemmWechsel(i)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                daemmIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{d.icon}</span>
              <span className="text-left leading-tight">{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Beheizte Wohnfläche</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={wohnflaeche}
              onChange={(e) => setWohnflaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Spezifische Heizlast</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              value={wattProM2}
              onChange={(e) => setWattProM2(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">W/m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Richtwerte: Altbau ~120–180, teilsaniert ~100, saniert ~60–80, Neubau ~40–50, Passivhaus ~15–30 W/m².
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Personen im Haushalt (Warmwasser-Aufschlag)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={personen}
              onChange={(e) => setPersonen(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Personen</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Optional: rund 0,2 kW pro Person für die Warmwasserbereitung. 0 = ohne Aufschlag.
          </span>
        </label>

        {/* Sperrzeit */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sperrzeit}
              onChange={(e) => setSperrzeit(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">EVU-Sperrzeit-Aufschlag (Wärmepumpe)</span>
          </label>
          <span className="text-xs text-gray-400 mt-1 block">
            Bei Wärmepumpen mit Netzsperrzeiten wird die Leistung um rund 15 % erhöht, um die Sperrzeiten auszugleichen.
          </span>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Überschlägige Heizlast</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt1(heizlastKw)}</span>
            <span className="text-xl text-blue-200">kW</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            grobe Orientierung – verbindlich ist DIN EN 12831
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Grundlast (Fläche × W/m²)</span>
              <span className="text-xl font-bold">{fmt1(grundlastKw)} kW</span>
            </div>
          </div>

          {(personen > 0 || sperrzeit) && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-1">
              {personen > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">+ Warmwasser ({fmt0(personen)} Pers.)</span>
                  <span className="font-bold">{fmt2(warmwasserKw)} kW</span>
                </div>
              )}
              {sperrzeit && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">+ Sperrzeit-Aufschlag (15 %)</span>
                  <span className="font-bold">{fmt2(sperrzeitAufschlagKw)} kW</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Grundlast</strong> = Wohnfläche × spez. Heizlast ÷ 1.000 = {fmt0(wohnflaeche)} m² ×{' '}
            {fmt0(wattProM2)} W/m² ÷ 1.000 = <strong>{fmt1(grundlastKw)} kW</strong>
          </p>
          {personen > 0 && (
            <p>
              <strong>Warmwasser</strong> = {fmt0(personen)} × 0,2 kW = <strong>{fmt2(warmwasserKw)} kW</strong>
            </p>
          )}
          {sperrzeit && (
            <p>
              <strong>Sperrzeit</strong> = ({fmt2(zwischensumme)} kW) × 15 % ={' '}
              <strong>{fmt2(sperrzeitAufschlagKw)} kW</strong>
            </p>
          )}
          <p>
            <strong>Heizlast</strong> = <strong>{fmt1(heizlastKw)} kW</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer (YMYL) */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Dieser Rechner liefert ausschließlich einen
          <strong> überschlägigen Orientierungswert</strong> nach der vereinfachten Flächen-Methode. Diese
          ist nach dem Gebäudeenergiegesetz (GEG) für die vorgeschriebene Heizlastberechnung
          <strong> unzulässig</strong>. Verbindlich ist allein die raumweise Berechnung nach
          <strong> DIN EN 12831</strong> durch eine Fachkraft bzw. einen Energieberater. Eine
          Fehldimensionierung – etwa bei Wärmepumpe und Förderung – kann teuer werden. Angaben ohne
          Gewähr, keine Energieberatung.
        </p>
      </div>
    </div>
  );
}

export default HeizlastRechner;
