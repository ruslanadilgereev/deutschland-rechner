import { useState } from 'react';

// Verlegeart bestimmt den Verschnitt-Zuschlag. Quelle: casando, sanier.de.
type Verlegeart = {
  name: string;
  icon: string;
  verschnitt: number; // Prozent
};

const VERLEGEARTEN: Verlegeart[] = [
  { name: 'Gerade / schwimmend', icon: '➡️', verschnitt: 6 },
  { name: 'Diagonal / Muster', icon: '↗️', verschnitt: 12 },
];

export function VinylbodenRechner() {
  const [flaeche, setFlaeche] = useState(25);
  const [verlegeIndex, setVerlegeIndex] = useState(0);
  const [verschnitt, setVerschnitt] = useState(VERLEGEARTEN[0].verschnitt);
  const [paketInhalt, setPaketInhalt] = useState(2.2);
  const [materialpreis, setMaterialpreis] = useState(25);
  const [verlegekosten, setVerlegekosten] = useState(0);
  const [trittschall, setTrittschall] = useState(false);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleVerlegeWechsel = (index: number) => {
    setVerlegeIndex(index);
    setVerschnitt(VERLEGEARTEN[index].verschnitt);
  };

  // Materialbedarf inkl. Verschnitt; Pakete aufrunden; tatsächlich bestellte Fläche.
  const materialbedarf = flaeche * (1 + verschnitt / 100);
  const pakete = paketInhalt > 0 ? Math.ceil(materialbedarf / paketInhalt) : 0;
  const bestellteFlaeche = pakete * paketInhalt;

  // Materialkosten auf Basis der bestellten (vollen) Pakete.
  const materialkosten = bestellteFlaeche * materialpreis;
  // Verlegekosten Handwerker auf Basis der Nutzfläche.
  const verlegeGesamt = flaeche * verlegekosten;
  // Trittschalldämmung auf Basis der Nutzfläche.
  const trittschallM2 = trittschall ? flaeche : 0;

  const fmt0 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmt2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const fmtEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Verlegeart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Verlegeart wählen</span>
        <div className="grid grid-cols-2 gap-2">
          {VERLEGEARTEN.map((v, i) => (
            <button
              key={v.name}
              onClick={() => handleVerlegeWechsel(i)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                verlegeIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{v.icon}</span>
              <span className="text-left leading-tight">{v.name} · +{v.verschnitt} %</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Raumfläche (gesamt)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={flaeche}
              onChange={(e) => setFlaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Bei mehreren Räumen die Flächen (Länge × Breite) addieren und als Summe eintragen.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Verschnitt-Zuschlag</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={30}
              step={1}
              value={verschnitt}
              onChange={(e) => setVerschnitt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Richtwert: gerade/schwimmend 5–8 %, diagonal/Muster/viele Ecken 10–15 %.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">m² pro Paket</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={paketInhalt}
              onChange={(e) => setPaketInhalt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Produktangabe – Klick-Vinyl typisch 2,0–2,6 m² pro Paket.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Materialpreis pro m² (optional)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={materialpreis}
              onChange={(e) => setMaterialpreis(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Klick-Vinyl rund 5–50 €/m², hochwertiges SPC/Rigid am oberen Ende.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Verlegekosten Handwerker pro m² (optional)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={verlegekosten}
              onChange={(e) => setVerlegekosten(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            0 = Selbstverlegung. Richtwert Klick schwimmend ~15–30 €/m², Klebevinyl ~20–35 €/m².
          </span>
        </label>

        {/* Trittschall */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={trittschall}
              onChange={(e) => setTrittschall(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Trittschalldämmung einrechnen</span>
          </label>
          <span className="text-xs text-gray-400 mt-1 block">
            Menge entspricht der Raumfläche (Bahnen/Platten je nach Produkt).
          </span>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigter Vinylboden</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{pakete}</span>
            <span className="text-xl text-blue-200">Pakete</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            = {fmt2(bestellteFlaeche)} m² gekauft (Bedarf inkl. Verschnitt {fmt2(materialbedarf)} m²)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Materialbedarf</span>
              <span className="text-xl font-bold">{fmt2(materialbedarf)} m²</span>
            </div>
          </div>

          {materialpreis > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Materialkosten (bestellte m²)</span>
                <span className="font-bold">{fmtEuro(materialkosten)} €</span>
              </div>
            </div>
          )}

          {verlegekosten > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Verlegekosten (Nutzfläche)</span>
                <span className="font-bold">{fmtEuro(verlegeGesamt)} €</span>
              </div>
            </div>
          )}

          {trittschall && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Trittschalldämmung</span>
                <span className="font-bold">{fmt2(trittschallM2)} m²</span>
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
            <strong>Bedarf</strong> = Fläche × (1 + {fmt0(verschnitt)} %) = {fmt2(flaeche)} × {fmt2(1 + verschnitt / 100)} ={' '}
            <strong>{fmt2(materialbedarf)} m²</strong>
          </p>
          <p>
            <strong>Pakete</strong> = aufrunden({fmt2(materialbedarf)} ÷ {fmt2(paketInhalt)}) ={' '}
            <strong>{pakete} Pakete</strong> ({fmt2(bestellteFlaeche)} m²)
          </p>
          {materialpreis > 0 && (
            <p>
              <strong>Material</strong> = {fmt2(bestellteFlaeche)} m² × {fmtEuro(materialpreis)} € ={' '}
              <strong>{fmtEuro(materialkosten)} €</strong>
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Unverbindliche Schätzung. Paketgrößen und Verschnitt sind produkt- und
          raumabhängig; das Ergebnis ersetzt kein genaues Aufmaß und keine Fachberatung. Die Kostenangaben
          sind Richtwerte (Stand 2026) und können regional abweichen. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default VinylbodenRechner;
