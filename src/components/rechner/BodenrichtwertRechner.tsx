import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Bodenwert nach Bodenwertverfahren (ImmoWertV 2021):
//   Bodenwert = Bodenrichtwert (€/m²) × Fläche (m²) × Produkt der Korrekturfaktoren
// Faktoren (multiplikativ, jeweils transparent ausgewiesen):
//   - Tiefe (Umrechnungskoeffizient § 12 ImmoWertV, regional; Default 1)
//   - Größe/GFZ-Abweichung (Default 1)
//   - Eckgrundstück / Lagezuschlag oder -abschlag
//   - Erschließungszustand (baureif ebf = 1; sonst Abschlag)
//   - Stichtags-/Indexkorrektur
// Quellen: ImmoWertV 2021, § 12 ImmoWertV, BORIS-D.

type Erschliessung = {
  name: string;
  faktor: number;
};

const ERSCHLIESSUNG: Erschliessung[] = [
  { name: 'Baureif (erschließungsbeitragsfrei)', faktor: 1.0 },
  { name: 'Baureif, Beitrag noch zahlbar (ebp)', faktor: 0.92 },
  { name: 'Rohbauland', faktor: 0.5 },
  { name: 'Bauerwartungsland', faktor: 0.25 },
];

export function BodenrichtwertRechner() {
  const [brw, setBrw] = useState(430); // €/m²
  const [flaeche, setFlaeche] = useState(600); // m²
  const [tiefeFaktor, setTiefeFaktor] = useState(1.0);
  const [groesseFaktor, setGroesseFaktor] = useState(1.0);
  const [lageFaktor, setLageFaktor] = useState(1.0);
  const [erschlIndex, setErschlIndex] = useState(0);
  const [indexFaktor, setIndexFaktor] = useState(1.0);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const erschlFaktor = ERSCHLIESSUNG[erschlIndex].faktor;
  const basiswert = brw * flaeche;
  const faktorProdukt = tiefeFaktor * groesseFaktor * lageFaktor * erschlFaktor * indexFaktor;
  const bodenwert = basiswert * faktorProdukt;

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatFaktor = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Bodenrichtwert-Rechner" rechnerSlug="bodenrichtwert-rechner" />

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Bodenrichtwert (aus BORIS)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={brw}
              onChange={(e) => setBrw(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Kostenlos abrufbar über das amtliche Portal BORIS-D Ihres Bundeslandes.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Grundstücksfläche</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={flaeche}
              onChange={(e) => setFlaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Erschließungszustand</span>
          <select
            value={erschlIndex}
            onChange={(e) => setErschlIndex(Number(e.target.value))}
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {ERSCHLIESSUNG.map((e, i) => (
              <option key={e.name} value={i}>
                {e.name} (×{formatFaktor(e.faktor)})
              </option>
            ))}
          </select>
        </label>

        {/* Korrekturfaktoren */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <p className="text-sm font-medium text-gray-600">
            Korrekturfaktoren (optional, Standard 1,00 = keine Anpassung)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-gray-600">Tiefe (§ 12)</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={tiefeFaktor}
                onChange={(e) => setTiefeFaktor(toNumber(e.target.value))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Größe / GFZ</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={groesseFaktor}
                onChange={(e) => setGroesseFaktor(toNumber(e.target.value))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Lage / Ecke</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={lageFaktor}
                onChange={(e) => setLageFaktor(toNumber(e.target.value))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Stichtag / Index</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={indexFaktor}
                onChange={(e) => setIndexFaktor(toNumber(e.target.value))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Orientierungs-Bodenwert</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(bodenwert)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            {formatEuro(brw)} €/m² × {formatEuro(flaeche)} m² × {formatFaktor(faktorProdukt)}
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Basiswert (BRW × Fläche)</span>
              <span className="text-xl font-bold">{formatEuro(basiswert)} €</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Korrekturfaktor gesamt</span>
              <span className="font-bold">× {formatFaktor(faktorProdukt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Basiswert</strong> = {formatEuro(brw)} €/m² × {formatEuro(flaeche)} m² ={' '}
            <strong>{formatEuro(basiswert)} €</strong>
          </p>
          <p>
            <strong>Faktoren</strong> = {formatFaktor(tiefeFaktor)} × {formatFaktor(groesseFaktor)} ×{' '}
            {formatFaktor(lageFaktor)} × {formatFaktor(erschlFaktor)} (Erschließung) ×{' '}
            {formatFaktor(indexFaktor)} = {formatFaktor(faktorProdukt)}
          </p>
          <p>
            <strong>Bodenwert</strong> = {formatEuro(basiswert)} € × {formatFaktor(faktorProdukt)} ={' '}
            <strong>{formatEuro(bodenwert)} €</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Das Ergebnis ist eine <strong>Orientierung auf Basis
          amtlicher Bodenrichtwerte</strong> und <strong>kein Verkehrswertgutachten</strong> und keine
          Rechts- oder Steuerberatung. Bodenrichtwerte sind Durchschnittswerte einer Zone, nicht der
          Wert des konkreten Grundstücks. Umrechnungskoeffizienten (§ 12 ImmoWertV) und
          Erschließungsabschläge sind regionsspezifisch (Daten des Gutachterausschusses) und hier nur
          als Näherung abgebildet. Für rechtsverbindliche Bewertungen (Erbschaft, Schenkung, Scheidung,
          Gericht, Beleihung) ist ein Gutachten erforderlich. Für die steuerliche Bedarfsbewertung gilt
          ein vereinfachtes Schema (BRW × Fläche). Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default BodenrichtwertRechner;
