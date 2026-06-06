import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Heizlast-Faustwerte (W pro m3 Raumvolumen) je nach Daemmstandard.
// NICHT normgenau - nur grobe Orientierung. Eine verbindliche Heizlast-
// berechnung erfolgt nach DIN EN 12831 durch eine Fachkraft.
// Quelle-Orientierung: gaengige Heizungs-Ratgeber (Bosch Home Comfort,
// heizung.de): Altbau unsaniert ca. 50 W/m3, teilsaniert ca. 40 W/m3,
// Neubau/KfW ca. 30 W/m3.
type DaemmStandard = {
  name: string;
  icon: string;
  wattProM3: number;
};

const DAEMM_STANDARDS: DaemmStandard[] = [
  { name: 'Altbau (unsaniert)', icon: '🧱', wattProM3: 50 },
  { name: 'Teilsaniert', icon: '🏚️', wattProM3: 40 },
  { name: 'Neubau / KfW', icon: '🏡', wattProM3: 30 },
];

export function RaumhoeheVolumenRechner() {
  // Grundmasse in Metern
  const [laenge, setLaenge] = useState(5);
  const [breite, setBreite] = useState(4);
  const [hoehe, setHoehe] = useState(2.5);

  // Dachschraege: zweite (niedrigste) Hoehe
  const [dachschraege, setDachschraege] = useState(false);
  const [hoeheMin, setHoeheMin] = useState(1.2);

  // Tuer-/Fensterflaeche fuer Wandflaechen-Ableitung
  const [oeffnungen, setOeffnungen] = useState(0);

  // Heizlast-Faustwert
  const [daemmIndex, setDaemmIndex] = useState(0);

  // Lueftung: Luftwechselrate pro Stunde
  const [luftwechsel, setLuftwechsel] = useState(0.5);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value.replace(',', '.'));
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Mittlere Raumhoehe: bei Dachschraege Mittelwert aus hoch + niedrig.
  const hoeheMittel = dachschraege ? (hoehe + hoeheMin) / 2 : hoehe;

  const grundflaeche = laenge * breite;
  const volumen = grundflaeche * hoeheMittel;
  const liter = volumen * 1000;

  // Wandflaeche = Umfang x mittlere Raumhoehe - Tuer-/Fensterflaechen
  const umfang = 2 * (laenge + breite);
  const wandflaecheBrutto = umfang * hoeheMittel;
  const wandflaeche = Math.max(0, wandflaecheBrutto - oeffnungen);

  // Heizlast-Faustwert (W) und kW
  const wattProM3 = DAEMM_STANDARDS[daemmIndex].wattProM3;
  const heizlastW = volumen * wattProM3;
  const heizlastKw = heizlastW / 1000;

  // Lueftungs-Luftvolumenstrom (m3/h)
  const luftstrom = volumen * luftwechsel;

  const formatM3 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const formatGanz = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatKw = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Raumvolumen-Rechner (m³)" rechnerSlug="raumhoehe-volumen-rechner" />

      {/* Grundmasse */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <span className="text-gray-700 font-medium block">Maße des Raums (in Metern)</span>

        <label className="block">
          <span className="text-gray-700 font-medium">Länge</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={laenge}
              onChange={(e) => setLaenge(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Breite</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={breite}
              onChange={(e) => setBreite(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">
            {dachschraege ? 'Höhe an der höchsten Stelle' : 'Raumhöhe / Deckenhöhe'}
          </span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={hoehe}
              onChange={(e) => setHoehe(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
          </div>
        </label>

        {/* Dachschraege */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={dachschraege}
              onChange={(e) => setDachschraege(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Raum mit Dachschräge</span>
          </label>
          {dachschraege && (
            <label className="block mt-3">
              <span className="text-sm text-gray-600">Höhe an der niedrigsten Stelle (Kniestock)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={hoeheMin}
                  onChange={(e) => setHoeheMin(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Bei einer durchgehenden Schräge rechnen wir mit der mittleren Raumhöhe
                ({formatM3(hoeheMittel)} m).
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Raumvolumen</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatM3(volumen)}</span>
            <span className="text-xl text-blue-200">m³</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            entspricht {formatGanz(liter)} Liter Luftraum
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Grundfläche</span>
              <span className="text-xl font-bold">{formatM3(grundflaeche)} m²</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Wandfläche (Umfang × Höhe)</span>
              <span className="text-xl font-bold">{formatM3(wandflaeche)} m²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Optionale Ableitungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 space-y-5">
        <span className="text-gray-700 font-medium block">Optionale Ableitungen</span>

        <label className="block">
          <span className="text-gray-700 font-medium">Fläche von Türen & Fenstern (für Wandfläche)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={oeffnungen}
              onChange={(e) => setOeffnungen(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Wird von der berechneten Wandfläche abgezogen. Eine Standardtür misst ca. 1,8 m², ein
            Fenster ca. 1,5 m².
          </span>
        </label>

        {/* Daemmstandard fuer Heizlast-Faustwert */}
        <div className="border-t border-gray-100 pt-4">
          <span className="text-gray-700 font-medium block mb-3">Dämmstandard (für Heizlast-Faustwert)</span>
          <div className="grid grid-cols-3 gap-2">
            {DAEMM_STANDARDS.map((d, i) => (
              <button
                key={d.name}
                onClick={() => setDaemmIndex(i)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                  daemmIndex === i
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{d.icon}</span>
                <span className="text-center leading-tight">{d.name}</span>
                <span className="text-[10px] text-gray-400">{d.wattProM3} W/m³</span>
              </button>
            ))}
          </div>
        </div>

        {/* Luftwechselrate */}
        <label className="block border-t border-gray-100 pt-4">
          <span className="text-gray-700 font-medium">Luftwechselrate (für Lüftungsbedarf)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={luftwechsel}
              onChange={(e) => setLuftwechsel(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">/ h</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Wohnräume typisch 0,5–1,0 pro Stunde. Gibt an, wie oft die Raumluft je Stunde komplett
            ausgetauscht wird.
          </span>
        </label>
      </div>

      {/* Sekundaer-Ergebnisse */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
        <h3 className="font-bold text-gray-800 mb-3">Abgeleitete Richtwerte</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
            <span className="text-gray-600">Heizlast-Faustwert ({wattProM3} W/m³)</span>
            <span className="font-bold text-gray-800">
              {formatGanz(heizlastW)} W ≈ {formatKw(heizlastKw)} kW
            </span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
            <span className="text-gray-600">Frischluftbedarf ({formatM3(luftwechsel)}/h)</span>
            <span className="font-bold text-gray-800">{formatM3(luftstrom)} m³/h</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Heizlast und Luftvolumenstrom sind unverbindliche Faustwerte zur Orientierung – keine
          normgerechte Auslegung.
        </p>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Volumen</strong> = Länge × Breite × {dachschraege ? 'mittlere Höhe' : 'Raumhöhe'}
          </p>
          <p>
            = {formatM3(laenge)} m × {formatM3(breite)} m × {formatM3(hoeheMittel)} m ={' '}
            <strong>{formatM3(volumen)} m³</strong>
          </p>
          {dachschraege && (
            <p>
              mittlere Höhe = ({formatM3(hoehe)} m + {formatM3(hoeheMin)} m) ÷ 2 ={' '}
              {formatM3(hoeheMittel)} m
            </p>
          )}
          <p>
            <strong>Wandfläche</strong> = 2 × (Länge + Breite) × Höhe − Öffnungen = {formatM3(umfang)} m
            × {formatM3(hoeheMittel)} m − {formatM3(oeffnungen)} m² ={' '}
            <strong>{formatM3(wandflaeche)} m²</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Der Heizlast-Wert (W/m³) und der Lüftungs-Luftvolumenstrom sind
          nur grobe Faustwerte zur Orientierung. Eine verbindliche Heizlastberechnung muss nach
          <strong> DIN EN 12831</strong>, eine Lüftungsplanung nach <strong>DIN 1946-6</strong> durch
          eine Fachkraft erfolgen – die Auslegung von Heizung und Lüftung ist sicherheits- und
          kostenrelevant. Die Wandfläche ist ein rechnerischer Richtwert ohne Abzug von Nischen oder
          Schrägen-Sonderflächen. Reines Raumvolumen ist keine Wohnflächenermittlung nach WoFlV. Alle
          Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default RaumhoeheVolumenRechner;
