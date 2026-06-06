import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Sparren-Rechner: Geometrie + Mengen (laufende Meter und Holzvolumen) für
// Sparrendächer (Satteldach / Pultdach).
//
// Geometrische Grundlage (Pythagoras / Trigonometrie):
//   Lauf         = Gebäudebreite B ÷ 2 (halbe Spannweite, Traufe → First)
//   Sparrenlänge L (Schräge, ohne Überstand) = Lauf ÷ cos(α) = √(Lauf² + Höhe²)
//   Sparrenlänge inkl. Überstand            = L + Ü (Ü auf der Schräge gemessen)
//   Stück je Dachfläche = abrunden(Gebäudelänge ÷ Sparrenabstand a) + 1
//   Anzahl gesamt       = Stück je Fläche × Dachflächen (Satteldach 2, Pultdach 1)
//   Laufende Meter      = Anzahl × Sparrenlänge
//   Holzvolumen [m³]    = Anzahl × Sparrenlänge × (Breite_QS × Höhe_QS) in m
//   Verschnitt          = Aufschlag in % auf lfm und m³ (Zuschnitt/Abbund)
//
// Querschnitt-Richtwerte (NUR Orientierung, KEINE Statik) für C24, Schneelast-
// zone 2, Sparrenabstand a ≤ 0,70 m:
//   Spannweite ≤ 4,5 m → 8/18 cm, ≤ 5,5 m → 8/20 cm, ≤ 6,5 m → 10/22 cm.
// Quellen: energie-experten.org (Dachsparren-Ratgeber), dachdecker.com
// (Sparrenabstand berechnen), Eurocode 5 / DIN EN 1995-1-1 (Holzbau-Norm).
type Dachform = {
  id: 'satteldach' | 'pultdach';
  name: string;
  icon: string;
  flaechen: number;
  hinweis: string;
};

const DACHFORMEN: Dachform[] = [
  {
    id: 'satteldach',
    name: 'Satteldach',
    icon: '🏠',
    flaechen: 2,
    hinweis: 'Zwei gleich große Dachflächen – Standardform. Sparren auf beiden Seiten.',
  },
  {
    id: 'pultdach',
    name: 'Pultdach',
    icon: '🏚️',
    flaechen: 1,
    hinweis: 'Eine einzelne geneigte Fläche – häufig bei Carport, Gartenhaus, Anbau.',
  },
];

export function BauholzSparrenRechner() {
  const [formIndex, setFormIndex] = useState(0);
  const [breite, setBreite] = useState(8); // Gebäudebreite B (Traufe → Traufe) in m
  const [laenge, setLaenge] = useState(10); // Gebäudelänge in m
  const [neigung, setNeigung] = useState(30); // Dachneigung α in Grad
  const [abstand, setAbstand] = useState(0.7); // Sparrenabstand a in m
  const [ueberstand, setUeberstand] = useState(0.5); // Dachüberstand auf der Schräge in m
  const [breiteQs, setBreiteQs] = useState(8); // Sparren-Querschnitt Breite in cm
  const [hoeheQs, setHoeheQs] = useState(20); // Sparren-Querschnitt Höhe in cm
  const [verschnitt, setVerschnitt] = useState(7); // Verschnittzuschlag in Prozent

  const form = DACHFORMEN[formIndex];

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Geometrie
  const lauf = breite / 2; // halbe Spannweite
  const cosA = Math.cos((neigung * Math.PI) / 180);
  const hoehe = lauf * Math.tan((neigung * Math.PI) / 180); // Firsthöhe über Auflager
  const sparrenSchraege = cosA > 0 ? lauf / cosA : lauf; // Sparrenlänge ohne Überstand
  const sparrenLaenge = sparrenSchraege + ueberstand; // inkl. Dachüberstand

  // Stückzahl
  const stueckJeFlaeche = abstand > 0 ? Math.floor(laenge / abstand) + 1 : 0;
  const anzahl = stueckJeFlaeche * form.flaechen;

  // Mengen
  const verschnittFaktor = 1 + verschnitt / 100;
  const lfm = anzahl * sparrenLaenge;
  const lfmGesamt = lfm * verschnittFaktor;
  const qsFlaeche = (breiteQs / 100) * (hoeheQs / 100); // Querschnittsfläche in m²
  const volumen = anzahl * sparrenLaenge * qsFlaeche;
  const volumenGesamt = volumen * verschnittFaktor;

  // Querschnitt-Richtwert nach Spannweite (Lauf), nur Orientierung
  const richtQuerschnitt =
    lauf <= 4.5 ? '8/18 cm' : lauf <= 5.5 ? '8/20 cm' : lauf <= 6.5 ? '10/22 cm' : 'Statiker nötig';

  const formatMeter = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const formatM3 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  const formatGrad = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Sparren-Rechner" rechnerSlug="bauholz-sparren-rechner" />

      {/* Dachform-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Dachform auswählen</span>
        <div className="grid grid-cols-2 gap-2">
          {DACHFORMEN.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setFormIndex(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                formIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-center leading-tight">{f.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">{form.hinweis}</p>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Gebäudebreite (Traufe zu Traufe)</span>
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
          <span className="text-xs text-gray-400 mt-1 block">
            Beim Satteldach die volle Breite – der Rechner halbiert sie zur Spannweite je Dachseite.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Gebäudelänge (entlang der Traufe)</span>
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
          <span className="text-gray-700 font-medium">Dachneigung</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={80}
              step={1}
              value={neigung}
              onChange={(e) => setNeigung(Math.min(80, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Typisch: Satteldach 30–45°, Pultdach/Carport 5–20°. Firsthöhe über dem Auflager aktuell{' '}
            {formatMeter(hoehe)} m.
          </span>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-600">Sparrenabstand</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.05}
                value={abstand}
                onChange={(e) => setAbstand(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m</span>
            </div>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Dachüberstand (Schräge)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.05}
                value={ueberstand}
                onChange={(e) => setUeberstand(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m</span>
            </div>
          </label>
          <p className="col-span-2 text-xs text-gray-400 -mt-1">
            Sparrenabstand typisch 0,60–0,90 m (Default 0,70 m). Überstand pro Sparren auf der Schräge
            gemessen; 0 lassen, wenn ohne Überstand gerechnet wird.
          </p>
        </div>

        {/* Querschnitt */}
        <div className="border-t border-gray-100 pt-4">
          <span className="text-gray-700 font-medium block mb-2">Sparren-Querschnitt (Breite × Höhe)</span>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-600">Breite</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={breiteQs}
                  onChange={(e) => setBreiteQs(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
              </div>
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Höhe</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={hoeheQs}
                  onChange={(e) => setHoeheQs(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
              </div>
            </label>
            <label className="block col-span-2">
              <span className="text-sm text-gray-600">Verschnittzuschlag</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={1}
                  value={verschnitt}
                  onChange={(e) => setVerschnitt(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </label>
            <span className="col-span-2 text-xs text-gray-400 -mt-1 block">
              Default 8/20 cm. Richtwert nach Spannweite ({formatMeter(lauf)} m je Dachseite):{' '}
              <strong>{richtQuerschnitt}</strong> – unverbindliche Orientierung, kein statischer Nachweis.
              Verschnitt typisch 5–10 % für Zuschnitt und Abbund.
            </span>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Sparren ({form.name})</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{anzahl}</span>
            <span className="text-xl text-blue-200">Sparren</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            je {formatMeter(sparrenLaenge)} m Länge (inkl. {formatMeter(ueberstand)} m Überstand)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Laufende Meter (inkl. {formatProzent(verschnitt)} % Verschnitt)</span>
              <span className="text-xl font-bold">{formatMeter(lfmGesamt)} m</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Holzvolumen (inkl. Verschnitt)</span>
              <span className="font-bold">{formatM3(volumenGesamt)} m³</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Sparrenlänge</strong> = (Breite ÷ 2) ÷ cos(α) + Überstand
          </p>
          <p>
            = ({formatMeter(breite)} ÷ 2) ÷ cos({formatGrad(neigung)}°) + {formatMeter(ueberstand)} ={' '}
            <strong>{formatMeter(sparrenLaenge)} m</strong>
          </p>
          <p>
            <strong>Anzahl</strong> = (abrunden({formatMeter(laenge)} ÷ {formatMeter(abstand)}) + 1) ×{' '}
            {form.flaechen} {form.flaechen === 2 ? 'Dachflächen' : 'Dachfläche'} = <strong>{anzahl} Sparren</strong>
          </p>
          <p>
            <strong>Laufende Meter</strong> = {anzahl} × {formatMeter(sparrenLaenge)} m × (1 +{' '}
            {formatProzent(verschnitt)} %) = <strong>{formatMeter(lfmGesamt)} m</strong>
          </p>
          <p>
            <strong>Holzvolumen</strong> = lfm × ({formatMeter(breiteQs)} cm × {formatMeter(hoeheQs)} cm) ={' '}
            <strong>{formatM3(volumenGesamt)} m³</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis (statikrelevant):</strong> Die Ergebnisse dienen der groben Mengen-
          und Kostenplanung. Die <strong>tragende Dimensionierung von Sparren muss durch einen Statiker
          bzw. Tragwerksplaner nach Eurocode 5 (DIN EN 1995-1-1) erfolgen</strong>. Der nötige
          Querschnitt hängt von Schneelastzone, Wind- und Eigenlast, Festigkeitsklasse (z. B. C24) und
          Spannweite ab. Die angezeigten Querschnitt-Richtwerte sind eine unverbindliche Orientierung,
          kein statischer Nachweis. Angaben ohne Gewähr – keine Fachberatung.
        </p>
      </div>
    </div>
  );
}

export default BauholzSparrenRechner;
