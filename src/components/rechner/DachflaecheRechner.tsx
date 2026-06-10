import { useState } from 'react';

// Dachformen als Voreinstellungen.
// Geometrische Grundlage: Die geneigte Dachfläche ergibt sich für alle hier
// abgebildeten Formen mit einheitlicher Neigung aus
//   A = überdachte Grundfläche × (1 / cos α)
// (Faktor X = 1 / cos α; bei 30° = 1,1547, bei 40° = 1,3054, bei 45° = 1,4142).
// Beim Flachdach entfällt der Neigungsfaktor – die Dachfläche entspricht hier
// näherungsweise der überdachten Grundfläche.
// Quellen: 11880-dachdecker.com, MeinDach, wirdaemmendeinhaus.com (Stand 2026).
type Dachform = {
  id: 'satteldach' | 'pultdach' | 'walmdach' | 'flachdach';
  name: string;
  icon: string;
  geneigt: boolean;
  defaultNeigung: number;
  hinweis: string;
};

const DACHFORMEN: Dachform[] = [
  {
    id: 'satteldach',
    name: 'Satteldach',
    icon: '🏠',
    geneigt: true,
    defaultNeigung: 40,
    hinweis: 'Zwei gleich große Schrägen – Standardform in Deutschland.',
  },
  {
    id: 'pultdach',
    name: 'Pultdach',
    icon: '🏚️',
    geneigt: true,
    defaultNeigung: 15,
    hinweis: 'Eine einzelne geneigte Fläche, oft bei modernen Häusern.',
  },
  {
    id: 'walmdach',
    name: 'Walmdach',
    icon: '🏯',
    geneigt: true,
    defaultNeigung: 35,
    hinweis: 'Vier geneigte Flächen (2 Trapeze + 2 Dreiecke).',
  },
  {
    id: 'flachdach',
    name: 'Flachdach',
    icon: '🏢',
    geneigt: false,
    defaultNeigung: 3,
    hinweis: 'Nahezu waagerecht – Fläche ≈ Grundfläche.',
  },
];

export function DachflaecheRechner() {
  const [formIndex, setFormIndex] = useState(0);
  const [laenge, setLaenge] = useState(10); // Trauflänge in m
  const [breite, setBreite] = useState(8); // Gebäudebreite/-tiefe in m
  const [neigung, setNeigung] = useState(40); // Dachneigung in Grad
  const [ueberstandTraufe, setUeberstandTraufe] = useState(0); // cm
  const [ueberstandOrtgang, setUeberstandOrtgang] = useState(0); // cm
  const [material, setMaterial] = useState(false);
  const [ziegelProQm, setZiegelProQm] = useState(12); // Stück/m²
  const [verschnitt, setVerschnitt] = useState(7); // Prozent

  const form = DACHFORMEN[formIndex];

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleFormWechsel = (index: number) => {
    setFormIndex(index);
    setNeigung(DACHFORMEN[index].defaultNeigung);
  };

  // Überstände von cm in m
  const ueTraufeM = ueberstandTraufe / 100;
  const ueOrtgangM = ueberstandOrtgang / 100;

  // Überdachte Grundfläche (Gebäudegrundriss + beidseitiger Überstand)
  const effLaenge = laenge + 2 * ueOrtgangM; // Trauflänge inkl. Ortgang-Überstand
  const effBreite = breite + 2 * ueTraufeM; // Tiefe inkl. Trauf-Überstand
  const grundflaeche = effLaenge * effBreite;

  // Neigungsfaktor X = 1 / cos α (beim Flachdach 1)
  const faktor = form.geneigt ? 1 / Math.cos((neigung * Math.PI) / 180) : 1;
  const dachflaeche = grundflaeche * faktor;

  // Material-Bedarf
  const verschnittFaktor = 1 + verschnitt / 100;
  const ziegelGesamt = dachflaeche * ziegelProQm * verschnittFaktor;
  const daemmflaeche = dachflaeche * 1.1; // Unterspannbahn / Dämmung inkl. 10 % Verschnitt

  const formatQm = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const formatFaktor = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
  const formatStueck = (v: number) =>
    Math.ceil(v).toLocaleString('de-DE', { maximumFractionDigits: 0 });
  const formatMeter = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Dachform-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Dachform auswählen</span>
        <div className="grid grid-cols-2 gap-2">
          {DACHFORMEN.map((f, i) => (
            <button
              key={f.id}
              onClick={() => handleFormWechsel(i)}
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
          <span className="text-gray-700 font-medium">Gebäudelänge (Trauflänge)</span>
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
          <span className="text-gray-700 font-medium">Gebäudebreite / -tiefe</span>
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

        {form.geneigt && (
          <label className="block">
            <span className="text-gray-700 font-medium">Dachneigung</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={89}
                step={1}
                value={neigung}
                onChange={(e) => setNeigung(Math.min(89, toNumber(e.target.value)))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Typisch: Satteldach 35–45°, Walmdach 30–40°, Pultdach 5–20°. Neigungsfaktor aktuell{' '}
              {formatFaktor(faktor)}.
            </span>
          </label>
        )}

        {/* Dachüberstand */}
        <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-600">Überstand Traufe</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={ueberstandTraufe}
                onChange={(e) => setUeberstandTraufe(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
            </div>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Überstand Ortgang</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={ueberstandOrtgang}
                onChange={(e) => setUeberstandOrtgang(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
            </div>
          </label>
          <p className="col-span-2 text-xs text-gray-400 -mt-1">
            Überstand pro Seite. Standard ca. 30–50 cm; 0 lassen, wenn ohne Dachüberstand gerechnet wird.
          </p>
        </div>

        {/* Material */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={material}
              onChange={(e) => setMaterial(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Ziegel- & Dämmbedarf berechnen</span>
          </label>
          {material && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-gray-600">Ziegel pro m²</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.5}
                    value={ziegelProQm}
                    onChange={(e) => setZiegelProQm(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Stk</span>
                </div>
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Verschnitt</span>
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
                Stück/m² je nach Marke (Biberschwanz ca. 32–36, Frankfurter Pfanne ca. 10–12). Verschnitt
                typisch 5–10 % für Ränder, Grate und Kehlen.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Geneigte Dachfläche ({form.name})</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatQm(dachflaeche)}</span>
            <span className="text-xl text-blue-200">m²</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            überdachte Grundfläche {formatQm(grundflaeche)} m²
            {form.geneigt && <> · Neigungsfaktor {formatFaktor(faktor)}</>}
          </p>
        </div>

        {material && (
          <div className="space-y-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Dachziegel (inkl. {formatQm(verschnitt)} % Verschnitt)</span>
                <span className="text-xl font-bold">{formatStueck(ziegelGesamt)} Stk</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Unterspannbahn / Dämmung (+10 %)</span>
                <span className="font-bold">{formatQm(daemmflaeche)} m²</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Überdachte Grundfläche</strong> = (Länge + 2 × Ortgang) × (Breite + 2 × Traufe)
          </p>
          <p>
            = {formatMeter(effLaenge)} m × {formatMeter(effBreite)} m ={' '}
            <strong>{formatQm(grundflaeche)} m²</strong>
          </p>
          {form.geneigt ? (
            <p>
              <strong>Dachfläche</strong> = Grundfläche × (1 ÷ cos {formatQm(neigung)}°) ={' '}
              {formatQm(grundflaeche)} m² × {formatFaktor(faktor)} ={' '}
              <strong>{formatQm(dachflaeche)} m²</strong>
            </p>
          ) : (
            <p>
              <strong>Dachfläche</strong> ≈ Grundfläche (Flachdach, ohne Neigungsfaktor) ={' '}
              <strong>{formatQm(dachflaeche)} m²</strong>
            </p>
          )}
          {material && (
            <p>
              <strong>Ziegel</strong> = {formatQm(dachflaeche)} m² × {formatQm(ziegelProQm)} Stk/m² × (1 +{' '}
              {formatQm(verschnitt)} %) = <strong>{formatStueck(ziegelGesamt)} Stück</strong>
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Dies ist eine rein geometrische Näherung, keine verbindliche
          Mengenkalkulation. Der tatsächliche Ziegelbedarf hängt von Deckbreite und -länge der gewählten
          Marke, von Graten, Kehlen und Gauben sowie vom realen Verschnitt ab. Statik, Dachaufbau und
          Unterkonstruktion sind nicht berücksichtigt. Gauben, Kehlen und komplexe Dächer erhöhen den
          realen Verschnitt. Keine Fachberatung – Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default DachflaecheRechner;
