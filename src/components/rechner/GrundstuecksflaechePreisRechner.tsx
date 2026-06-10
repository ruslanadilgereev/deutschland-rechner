import { useState } from 'react';

// Grundstückspreis-Rechner:
//   Gesamtpreis     = Fläche × Preis/m²
//   Rückrechnung    = Gesamtpreis / Fläche  (Preis/m²)
//   Hochrechnung    = Wunschfläche × Preis/m²
//   Bodenwert (BORIS) = Bodenrichtwert × Fläche (Vergleichswert)
// Quellen: BORIS-D, Finanztip Bodenrichtwert, § 127 BauGB (Stand 2026).

export function GrundstuecksflaechePreisRechner() {
  const [flaeche, setFlaeche] = useState(600);
  const [preisProM2, setPreisProM2] = useState(400);
  const [wunschflaeche, setWunschflaeche] = useState(800);
  const [bodenrichtwert, setBodenrichtwert] = useState(430);
  const [erschlPreis, setErschlPreis] = useState(0); // €/m² zusätzlich falls unerschlossen

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const gesamtpreis = flaeche * preisProM2;
  const gesamtMitErschl = gesamtpreis + flaeche * erschlPreis;
  const hochrechnung = wunschflaeche * preisProM2;
  const bodenwert = bodenrichtwert * flaeche;
  const abweichung = bodenwert > 0 ? ((gesamtpreis - bodenwert) / bodenwert) * 100 : 0;

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatNum = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
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
            <span className="text-gray-700 font-medium">Preis pro m²</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={preisProM2}
                onChange={(e) => setPreisProM2(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/m²</span>
            </div>
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Wunschgröße (Hochrechnung)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={wunschflaeche}
              onChange={(e) => setWunschflaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²</span>
          </div>
        </label>

        <div className="border-t border-gray-100 pt-4 space-y-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Bodenrichtwert (BORIS, Vergleich)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={bodenrichtwert}
                onChange={(e) => setBodenrichtwert(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/m²</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Erschließungskosten (falls separat)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={erschlPreis}
                onChange={(e) => setErschlPreis(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/m²</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Bei unerschlossenem Bauland 30–100 €/m² getrennt ausweisen statt einrechnen.
            </span>
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Gesamtpreis des Grundstücks</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(gesamtpreis)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            {formatEuro(flaeche)} m² × {formatEuro(preisProM2)} €/m²
          </p>
        </div>

        <div className="space-y-3">
          {erschlPreis > 0 && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">inkl. Erschließung</span>
                <span className="text-xl font-bold">{formatEuro(gesamtMitErschl)} €</span>
              </div>
            </div>
          )}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Hochrechnung {formatEuro(wunschflaeche)} m²</span>
              <span className="font-bold">{formatEuro(hochrechnung)} €</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Bodenwert (BORIS)</span>
              <span className="font-bold">
                {formatEuro(bodenwert)} € ({abweichung >= 0 ? '+' : ''}{formatNum(abweichung)} %)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Gesamtpreis</strong> = {formatEuro(flaeche)} m² × {formatEuro(preisProM2)} €/m² ={' '}
            <strong>{formatEuro(gesamtpreis)} €</strong>
          </p>
          <p>
            <strong>Hochrechnung</strong> = {formatEuro(wunschflaeche)} m² × {formatEuro(preisProM2)} €/m² ={' '}
            {formatEuro(hochrechnung)} €
          </p>
          <p>
            <strong>Bodenwert</strong> = {formatEuro(bodenrichtwert)} €/m² × {formatEuro(flaeche)} m² ={' '}
            {formatEuro(bodenwert)} €
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Tool liefert überschlägige Werte und ersetzt kein Wertgutachten
          nach ImmoWertV durch einen Gutachterausschuss oder Sachverständigen. Bodenrichtwerte sind
          Durchschnittswerte einer Zone und nicht der Verkehrswert des konkreten Grundstücks. Prüfen Sie
          regionale Werte über das offizielle Portal BORIS. Erschließungskosten und Grunderwerbsteuer
          sind gesondert zu berücksichtigen. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default GrundstuecksflaechePreisRechner;
