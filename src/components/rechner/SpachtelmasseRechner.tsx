import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Spezifischer Verbrauch je Produkttyp in kg/m² pro Millimeter Schichtdicke.
// Default-Presets nach gängigen Herstellerangaben (Knauf, Hausjournal, Stand 2026).
// Werte sind Richtwerte – maßgeblich ist immer die Verpackung des konkreten Produkts.
type ProduktVoreinstellung = {
  name: string;
  icon: string;
  verbrauch: number; // kg/m² pro mm
  schichtdicke: number; // mm (typischer Startwert)
  gaenge: number;
  sackgewicht: number; // kg
  wasser: number; // l/kg Anmischverhältnis
};

const PRODUKTE: ProduktVoreinstellung[] = [
  { name: 'Gips-Flächenspachtel (Q3/Q4)', icon: '🧱', verbrauch: 1.0, schichtdicke: 1, gaenge: 1, sackgewicht: 20, wasser: 0.4 },
  { name: 'Polymer-/Fertigspachtel', icon: '🪣', verbrauch: 0.7, schichtdicke: 1, gaenge: 2, sackgewicht: 5, wasser: 0.4 },
  { name: 'Zement-Bodenausgleich', icon: '🟫', verbrauch: 1.5, schichtdicke: 5, gaenge: 1, sackgewicht: 25, wasser: 0.4 },
  { name: 'Eigener Wert (Verpackung)', icon: '🔧', verbrauch: 1.0, schichtdicke: 1, gaenge: 1, sackgewicht: 20, wasser: 0.4 },
];

export function SpachtelmasseRechner() {
  const [produktIndex, setProduktIndex] = useState(0);
  const [flaeche, setFlaeche] = useState(30);
  const [verbrauch, setVerbrauch] = useState(PRODUKTE[0].verbrauch);
  const [schichtdicke, setSchichtdicke] = useState(PRODUKTE[0].schichtdicke);
  const [gaenge, setGaenge] = useState(PRODUKTE[0].gaenge);
  const [sackgewicht, setSackgewicht] = useState(PRODUKTE[0].sackgewicht);
  const [verschnitt, setVerschnitt] = useState(10);
  const [wasser, setWasser] = useState(PRODUKTE[0].wasser);
  const [preisProSack, setPreisProSack] = useState(0);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleProduktWechsel = (index: number) => {
    setProduktIndex(index);
    const p = PRODUKTE[index];
    setVerbrauch(p.verbrauch);
    setSchichtdicke(p.schichtdicke);
    setGaenge(p.gaenge);
    setSackgewicht(p.sackgewicht);
    setWasser(p.wasser);
  };

  // Netto-Materialbedarf (kg) = Fläche × Verbrauch × Schichtdicke × Spachtelgänge
  const materialNetto = flaeche * verbrauch * schichtdicke * gaenge;

  // Mit Verschnitt-/Sicherheitszuschlag
  const materialBrutto = materialNetto * (1 + verschnitt / 100);

  // Anzahl Säcke (immer aufrunden, weil man keine halben Säcke kauft)
  const saecke = sackgewicht > 0 ? Math.ceil(materialBrutto / sackgewicht) : 0;

  // Wasserbedarf zum Anmischen – bezogen auf das tatsächlich verarbeitete
  // Netto-Material (Verschnitt ist Puffer, kein verarbeitetes Material).
  const wasserBedarf = materialNetto * wasser;

  // Optionale Kostenschätzung
  const kosten = saecke * preisProSack;

  const formatKg = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatLiter = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatZahl = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Spachtelmasse-Rechner" rechnerSlug="spachtelmasse-rechner" />

      {/* Produkt-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Produkttyp auswählen</span>
        <div className="grid grid-cols-2 gap-2">
          {PRODUKTE.map((p, i) => (
            <button
              key={p.name}
              onClick={() => handleProduktWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                produktIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-center leading-tight">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Zu spachtelnde Fläche</span>
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
          <span className="text-xs text-gray-400 mt-1 block">
            Wand- und Deckenfläche, ggf. abzüglich Fenster und Türen.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Verbrauch (kg/m² pro mm)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={verbrauch}
              onChange={(e) => setVerbrauch(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kg/m²/mm</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Gipsspachtel ca. 1,0 · Polymer 0,6–0,8 · Zement-Ausgleich ca. 1,5 – exakter Wert steht auf der Verpackung.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Schichtdicke</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={schichtdicke}
              onChange={(e) => setSchichtdicke(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">mm</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Flächenspachtelung Q3/Q4 ≈ 1 mm · Bodenausgleich je nach Unebenheit 2–30 mm.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Anzahl Spachtelgänge</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={5}
              step={1}
              value={gaenge}
              onChange={(e) => setGaenge(Math.max(1, Math.min(5, Math.round(toNumber(e.target.value)))))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Gänge</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Sackgewicht</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={sackgewicht}
              onChange={(e) => setSackgewicht(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kg</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Übliche Gebinde: 5 kg, 20 kg oder 25 kg.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Verschnitt-/Sicherheitszuschlag</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={50}
              step={1}
              value={verschnitt}
              onChange={(e) => setVerschnitt(Math.min(50, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Empfohlen rund 10 % als Puffer für Reste, Anmischverluste und Nacharbeiten.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Anmischwasser (l/kg)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.05}
              value={wasser}
              onChange={(e) => setWasser(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">l/kg</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Herstellerangabe, typisch 0,3–0,5 l/kg. Voreinstellung 0,4 l/kg.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Preis je Sack (optional)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={preisProSack}
              onChange={(e) => setPreisProSack(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Für eine grobe Kostenschätzung – leer lassen, wenn nicht benötigt.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Spachtelmasse</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatKg(materialBrutto)}</span>
            <span className="text-xl text-blue-200">kg inkl. Verschnitt</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            entspricht {saecke} {saecke === 1 ? 'Sack' : 'Säcken'} à {formatKg(sackgewicht)} kg
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Reiner Materialbedarf</span>
              <span className="text-xl font-bold">{formatKg(materialNetto)} kg</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Anmischwasser (ca.)</span>
              <span className="font-bold">{formatLiter(wasserBedarf)} l</span>
            </div>
          </div>

          {preisProSack > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Materialkosten (ca.)</span>
                <span className="font-bold">{formatEuro(kosten)} €</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Material</strong> = Fläche × Verbrauch × Schichtdicke × Spachtelgänge
          </p>
          <p>
            = {formatZahl(flaeche)} m² × {formatZahl(verbrauch)} × {formatZahl(schichtdicke)} mm ×{' '}
            {gaenge} = <strong>{formatKg(materialNetto)} kg</strong>
          </p>
          <p>
            <strong>+ {formatZahl(verschnitt)} % Verschnitt</strong> = {formatKg(materialBrutto)} kg →{' '}
            aufgerundet <strong>{saecke} {saecke === 1 ? 'Sack' : 'Säcke'}</strong> à {formatKg(sackgewicht)} kg
          </p>
          <p>
            <strong>Wasser</strong> = {formatKg(materialNetto)} kg × {formatZahl(wasser)} l/kg ={' '}
            <strong>{formatLiter(wasserBedarf)} l</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Verbrauchs- und Anmischwerte sind produktabhängig – maßgeblich
          sind immer die Herstellerangaben auf der Verpackung. Der Rechner liefert nur einen Richtwert
          inkl. Verschnittpuffer, keine verbindliche Mengenzusage. Bei stark unebenem Untergrund oder
          mehreren Aufträgen kann der reale Bedarf abweichen. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default SpachtelmasseRechner;
