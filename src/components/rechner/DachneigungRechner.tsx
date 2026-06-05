import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Berechnungsmodus: aus Höhe + Länge die Neigung herleiten, oder eine bereits
// bekannte Neigung (Grad bzw. Prozent) in die jeweils anderen Größen umrechnen.
type Modus = 'masse' | 'grad' | 'prozent';

// Häufige Dachtypen als Voreinstellung (typische Neigung in Grad).
// Quelle: ZVDH-Fachregeln / Dachlexikon (Nelskamp). Werte sind Richtwerte.
type DachVoreinstellung = {
  name: string;
  icon: string;
  grad: number;
};

const DACHTYPEN: DachVoreinstellung[] = [
  { name: 'Flachdach', icon: '🏢', grad: 5 },
  { name: 'Pultdach', icon: '🏬', grad: 15 },
  { name: 'Satteldach flach', icon: '🏠', grad: 30 },
  { name: 'Satteldach steil', icon: '⛪', grad: 45 },
];

export function DachneigungRechner() {
  const [modus, setModus] = useState<Modus>('masse');

  // Eingaben für den Maße-Modus (Grundlänge / Run und Höhe / Rise, gleiche Einheit).
  const [laenge, setLaenge] = useState(4);
  const [hoehe, setHoehe] = useState(2);
  const [dachbreite, setDachbreite] = useState(8);

  // Eingaben für die Umrechnung einer bereits bekannten Neigung.
  const [gradInput, setGradInput] = useState(30);
  const [prozentInput, setProzentInput] = useState(50);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Ermittelt den Neigungswinkel in Grad je nach gewähltem Modus.
  let grad = 0;
  if (modus === 'masse') {
    grad = laenge > 0 ? (Math.atan(hoehe / laenge) * 180) / Math.PI : 0;
  } else if (modus === 'grad') {
    grad = Math.min(89.9, gradInput);
  } else {
    grad = (Math.atan(prozentInput / 100) * 180) / Math.PI;
  }

  const rad = (grad * Math.PI) / 180;
  const prozent = Math.tan(rad) * 100;
  const verhaeltnisX = Math.tan(rad) * 12; // x in der Schreibweise x:12

  // Sparrenlänge nur im Maße-Modus aus den konkreten Längen berechenbar.
  const sparrenlaenge =
    modus === 'masse' ? Math.sqrt(hoehe * hoehe + laenge * laenge) : 0;
  // Geneigte Dachfläche einer Dachhälfte (Sparrenlänge × Dachbreite).
  const dachflaeche = modus === 'masse' ? sparrenlaenge * dachbreite : 0;

  // Einordnung der Neigung nach gängiger Dachdecker-Klassifizierung.
  let kategorie = 'Steildach';
  if (grad < 10) kategorie = 'Flachdach';
  else if (grad < 22) kategorie = 'flach geneigtes Dach';

  const setDachtyp = (g: number) => {
    setModus('grad');
    setGradInput(g);
  };

  const fmt1 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const fmt2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Dachneigungs-Rechner" rechnerSlug="dachneigung-rechner" />

      {/* Modus-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Was ist bekannt?</span>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: 'masse', label: 'Höhe + Länge' },
            { key: 'grad', label: 'Neigung in Grad' },
            { key: 'prozent', label: 'Neigung in %' },
          ] as { key: Modus; label: string }[]).map((m) => (
            <button
              key={m.key}
              onClick={() => setModus(m.key)}
              className={`p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                modus === m.key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {modus === 'masse' && (
          <>
            <label className="block">
              <span className="text-gray-700 font-medium">Grundlänge (waagerecht)</span>
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
              <span className="text-gray-700 font-medium">Höhe (senkrechter Anstieg)</span>
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
              <span className="text-xs text-gray-400 mt-1 block">
                Beide Maße in derselben Einheit – ob Meter oder Zentimeter spielt für Grad und Prozent keine Rolle.
              </span>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Dachbreite (optional, für Dachfläche)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={dachbreite}
                  onChange={(e) => setDachbreite(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </label>
          </>
        )}

        {modus === 'grad' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {DACHTYPEN.map((d) => (
                <button
                  key={d.name}
                  onClick={() => setDachtyp(d.grad)}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-medium transition-all active:scale-95"
                >
                  <span className="text-xl">{d.icon}</span>
                  <span className="text-left leading-tight">{d.name} · {d.grad}°</span>
                </button>
              ))}
            </div>
            <label className="block">
              <span className="text-gray-700 font-medium">Neigung in Grad</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={89.9}
                  step={0.5}
                  value={gradInput}
                  onChange={(e) => setGradInput(Math.min(89.9, toNumber(e.target.value)))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°</span>
              </div>
            </label>
          </>
        )}

        {modus === 'prozent' && (
          <label className="block">
            <span className="text-gray-700 font-medium">Neigung in Prozent</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={prozentInput}
                onChange={(e) => setProzentInput(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              100 % entsprechen 45° (gleiche Höhe wie Länge), nicht 90°.
            </span>
          </label>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Ihre Dachneigung</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt1(grad)}</span>
            <span className="text-xl text-blue-200">Grad</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            entspricht {fmt1(prozent)} % Gefälle · Einordnung: {kategorie}
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Verhältnis (x : 12)</span>
              <span className="text-xl font-bold">{fmt1(verhaeltnisX)} : 12</span>
            </div>
          </div>

          {modus === 'masse' && (
            <>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Sparrenlänge (Dachschräge)</span>
                  <span className="text-xl font-bold">{fmt2(sparrenlaenge)} m</span>
                </div>
              </div>
              {dachbreite > 0 && (
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-100">Dachfläche (eine Hälfte)</span>
                    <span className="font-bold">{fmt2(dachflaeche)} m²</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          {modus === 'masse' ? (
            <>
              <p>
                <strong>Grad</strong> = arctan(Höhe ÷ Länge) = arctan({fmt2(hoehe)} ÷ {fmt2(laenge)}) ={' '}
                <strong>{fmt1(grad)}°</strong>
              </p>
              <p>
                <strong>Prozent</strong> = Höhe ÷ Länge × 100 = {fmt2(hoehe)} ÷ {fmt2(laenge)} × 100 ={' '}
                <strong>{fmt1(prozent)} %</strong>
              </p>
              <p>
                <strong>Sparrenlänge</strong> = √(Höhe² + Länge²) = √({fmt2(hoehe)}² + {fmt2(laenge)}²) ={' '}
                <strong>{fmt2(sparrenlaenge)} m</strong>
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Prozent</strong> = tan(Grad) × 100 = tan({fmt1(grad)}°) × 100 ={' '}
                <strong>{fmt1(prozent)} %</strong>
              </p>
              <p>
                <strong>Verhältnis</strong> = tan(Grad) × 12 = <strong>{fmt1(verhaeltnisX)} : 12</strong>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die trigonometrische Umrechnung ist exakt. Die genannten Mindest- und
          Regeldachneigungen sind jedoch Richtwerte aus der Dachdecker-Fachregel (ZVDH) und ersetzen keine
          Statik- oder Dachdeckerberatung. Die verbindliche Mindestneigung hängt von Eindeckung, Dachaufbau
          und Herstellervorgaben ab. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default DachneigungRechner;
