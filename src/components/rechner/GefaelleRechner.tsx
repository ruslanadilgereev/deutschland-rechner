import { useState, useMemo } from 'react';

// Berechnungsmodus: aus Höhe + Länge das Gefälle herleiten, oder ein bereits
// bekanntes Gefälle (Prozent bzw. Grad) in die jeweils anderen Größen umrechnen.
type Modus = 'masse' | 'prozent' | 'grad';

// Anwendungs-Richtwerte als Schnellauswahl (Gefälle in Prozent).
// Orientierungswerte aus DIN-Normen / Flachdachrichtlinie – keine verbindlichen Vorgaben.
type Preset = {
  name: string;
  icon: string;
  prozent: number;
  hinweis: string;
};

const PRESETS: Preset[] = [
  { name: 'Abwasser Grundleitung', icon: '🚰', prozent: 0.5, hinweis: 'belüftet, ca. 0,5 %' },
  { name: 'Abwasser Anschluss', icon: '🚽', prozent: 1, hinweis: 'unbelüftet, ca. 1 %' },
  { name: 'Terrasse / Balkon', icon: '🏗️', prozent: 2, hinweis: 'Abdichtung, min. 2 %' },
  { name: 'Rampe barrierefrei', icon: '♿', prozent: 6, hinweis: 'max. 6 %' },
];

export function GefaelleRechner() {
  const [modus, setModus] = useState<Modus>('masse');

  // Eingaben für den Maße-Modus (Höhenunterschied und horizontale Strecke, gleiche Einheit).
  const [hoehe, setHoehe] = useState(0.5);
  const [laenge, setLaenge] = useState(10);

  // Eingaben für die Umrechnung eines bereits bekannten Gefälles.
  const [prozentInput, setProzentInput] = useState(2);
  const [gradInput, setGradInput] = useState(2);

  // Optionale Strecke für die Modi prozent/grad, um den nötigen Höhenunterschied zu zeigen.
  const [streckeInput, setStreckeInput] = useState(10);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Alle abgeleiteten Werte gebündelt in useMemo (vollständiges Dependency-Array).
  const erg = useMemo(() => {
    // Grundgröße ist immer das Gefälle in Prozent – daraus folgt der Rest.
    let prozent = 0;
    if (modus === 'masse') {
      prozent = laenge > 0 ? (hoehe / laenge) * 100 : 0;
    } else if (modus === 'prozent') {
      prozent = prozentInput;
    } else {
      // aus Grad: Prozent = tan(Grad) × 100
      const rad = (Math.min(89.9, gradInput) * Math.PI) / 180;
      prozent = Math.tan(rad) * 100;
    }

    const grad = (Math.atan(prozent / 100) * 180) / Math.PI;
    const promille = prozent * 10;
    const cmProM = prozent; // 1 % = 1 cm/m
    const n = prozent > 0 ? 100 / prozent : 0; // Verhältnis 1 : n

    // Geneigte Strecke (Hypotenuse) nur im Maße-Modus aus konkreten Längen.
    const geneigt = modus === 'masse' ? Math.sqrt(hoehe * hoehe + laenge * laenge) : 0;

    // Benötigter Höhenunterschied bei gegebener Strecke (Modi prozent/grad).
    const noetigeHoehe = streckeInput * (prozent / 100);

    return { prozent, grad, promille, cmProM, n, geneigt, noetigeHoehe };
  }, [modus, hoehe, laenge, prozentInput, gradInput, streckeInput]);

  const setPreset = (p: number) => {
    setModus('prozent');
    setProzentInput(p);
  };

  const fmt1 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const fmt2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Modus-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Was ist bekannt?</span>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: 'masse', label: 'Höhe + Länge' },
            { key: 'prozent', label: 'Gefälle in %' },
            { key: 'grad', label: 'Gefälle in Grad' },
          ] as { key: Modus; label: string }[]).map((m) => (
            <button
              key={m.key}
              onClick={() => setModus(m.key)}
              className={`p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                modus === m.key
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
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
              <span className="text-gray-700 font-medium">Höhenunterschied (Fall)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  value={hoehe}
                  onChange={(e) => setHoehe(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Horizontale Strecke (Länge)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={laenge}
                  onChange={(e) => setLaenge(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Beide Maße in derselben Einheit – ob Meter oder Zentimeter spielt für Prozent und Grad keine Rolle.
              </span>
            </label>
          </>
        )}

        {modus === 'prozent' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPreset(p.prozent)}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-medium transition-all active:scale-95"
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-left leading-tight">{p.name} · {p.hinweis}</span>
                </button>
              ))}
            </div>
            <label className="block">
              <span className="text-gray-700 font-medium">Gefälle in Prozent</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={prozentInput}
                  onChange={(e) => setProzentInput(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                100 % entsprechen 45° (gleicher Fall wie Strecke), nicht 90°.
              </span>
            </label>
          </>
        )}

        {modus === 'grad' && (
          <label className="block">
            <span className="text-gray-700 font-medium">Gefälle in Grad</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={89.9}
                step={0.5}
                value={gradInput}
                onChange={(e) => setGradInput(Math.min(89.9, toNumber(e.target.value)))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°</span>
            </div>
          </label>
        )}

        {(modus === 'prozent' || modus === 'grad') && (
          <label className="block">
            <span className="text-gray-700 font-medium">Strecke (optional, für nötigen Fall)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={streckeInput}
                onChange={(e) => setStreckeInput(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Praktisch fürs Rohrverlegen: zeigt, wie viel die Leitung auf dieser Strecke fallen muss.
            </span>
          </label>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-emerald-100 mb-1">Ihr Gefälle</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{fmt2(erg.prozent)}</span>
            <span className="text-xl text-emerald-200">%</span>
          </div>
          <p className="text-emerald-200 text-sm mt-1">
            entspricht {fmt2(erg.grad)}° · {fmt1(erg.promille)} ‰ · {fmt2(erg.cmProM)} cm/m
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-emerald-100">Verhältnis</span>
              <span className="text-xl font-bold">
                {erg.n > 0 ? <>1 : {fmt1(erg.n)}</> : '–'}
              </span>
            </div>
          </div>

          {modus === 'masse' && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-emerald-100">Geneigte Strecke (Hypotenuse)</span>
                <span className="text-xl font-bold">{fmt2(erg.geneigt)} m</span>
              </div>
            </div>
          )}

          {(modus === 'prozent' || modus === 'grad') && streckeInput > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-100">
                  Nötiger Fall auf {fmt1(streckeInput)} m
                </span>
                <span className="font-bold">
                  {fmt2(erg.noetigeHoehe)} m ({fmt1(erg.noetigeHoehe * 100)} cm)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-emerald-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          {modus === 'masse' ? (
            <>
              <p>
                <strong>Prozent</strong> = Höhe ÷ Länge × 100 = {fmt2(hoehe)} ÷ {fmt2(laenge)} × 100 ={' '}
                <strong>{fmt2(erg.prozent)} %</strong>
              </p>
              <p>
                <strong>Grad</strong> = arctan(Höhe ÷ Länge) = arctan({fmt2(hoehe)} ÷ {fmt2(laenge)}) ={' '}
                <strong>{fmt2(erg.grad)}°</strong>
              </p>
              <p>
                <strong>Geneigte Strecke</strong> = √(Höhe² + Länge²) = √({fmt2(hoehe)}² + {fmt2(laenge)}²) ={' '}
                <strong>{fmt2(erg.geneigt)} m</strong>
              </p>
            </>
          ) : modus === 'prozent' ? (
            <>
              <p>
                <strong>Grad</strong> = arctan(Prozent ÷ 100) = arctan({fmt2(erg.prozent)} ÷ 100) ={' '}
                <strong>{fmt2(erg.grad)}°</strong>
              </p>
              <p>
                <strong>Promille</strong> = Prozent × 10 = <strong>{fmt1(erg.promille)} ‰</strong> ·{' '}
                <strong>cm/m</strong> = Prozent = <strong>{fmt2(erg.cmProM)} cm/m</strong>
              </p>
              <p>
                <strong>Verhältnis</strong> = 1 : (100 ÷ Prozent) ={' '}
                <strong>{erg.n > 0 ? <>1 : {fmt1(erg.n)}</> : '–'}</strong>
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Prozent</strong> = tan(Grad) × 100 = tan({fmt1(gradInput)}°) × 100 ={' '}
                <strong>{fmt2(erg.prozent)} %</strong>
              </p>
              <p>
                <strong>Promille</strong> = Prozent × 10 = <strong>{fmt1(erg.promille)} ‰</strong> ·{' '}
                <strong>cm/m</strong> = <strong>{fmt2(erg.cmProM)} cm/m</strong>
              </p>
              <p>
                <strong>Verhältnis</strong> = 1 : (1 ÷ tan(Grad)) ={' '}
                <strong>{erg.n > 0 ? <>1 : {fmt1(erg.n)}</> : '–'}</strong>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Schätzung – keine Steuer-/Rechtsberatung.</strong> Die trigonometrische Umrechnung
          ist exakt; die genannten Anwendungs-Richtwerte (Abwasser, Rampe, Terrasse) sind
          Orientierungswerte aus DIN-Normen und ersetzen keine Fachplanung. DIN-Normen sind
          kostenpflichtig. Angaben ohne Gewähr.
        </p>
        <p className="mt-2">
          <strong>Quellen (Orientierung):</strong>{' '}
          <a href="https://www.din.de/resource/blob/317400/7fa74bc54be7df3261da9c8ce87b1fd0/faq-din-1986-100-data.pdf" target="_blank" rel="noopener" className="underline">DIN 1986-100 (FAQ)</a>,{' '}
          <a href="https://nullbarriere.de/din18040-1-rampen.htm" target="_blank" rel="noopener" className="underline">DIN 18040-1 Rampen</a>,{' '}
          <a href="https://din18040.de/rampen.htm" target="_blank" rel="noopener" className="underline">DIN 18040 Rampen</a>.
        </p>
      </div>
    </div>
  );
}

export default GefaelleRechner;
