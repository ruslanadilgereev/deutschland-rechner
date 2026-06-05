import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Grunderwerbsteuersätze je Bundesland (Stand 2026).
// Quelle: Statistisches Bundesamt / Finanzverwaltungen der Länder.
type Bundesland = { name: string; grest: number };
const BUNDESLAENDER: Bundesland[] = [
  { name: 'Baden-Württemberg', grest: 5.0 },
  { name: 'Bayern', grest: 3.5 },
  { name: 'Berlin', grest: 6.0 },
  { name: 'Brandenburg', grest: 6.5 },
  { name: 'Bremen', grest: 5.0 },
  { name: 'Hamburg', grest: 5.5 },
  { name: 'Hessen', grest: 6.0 },
  { name: 'Mecklenburg-Vorpommern', grest: 6.0 },
  { name: 'Niedersachsen', grest: 5.0 },
  { name: 'Nordrhein-Westfalen', grest: 6.5 },
  { name: 'Rheinland-Pfalz', grest: 5.0 },
  { name: 'Saarland', grest: 6.5 },
  { name: 'Sachsen', grest: 5.5 },
  { name: 'Sachsen-Anhalt', grest: 5.0 },
  { name: 'Schleswig-Holstein', grest: 6.5 },
  { name: 'Thüringen', grest: 5.0 },
];

// Notar- und Grundbuchkosten zusammen als Faustwert ~2,0 % des Kaufpreises.
const NOTAR_GRUNDBUCH_QUOTE = 2.0;

export function WieVielHausRechner() {
  const [netto, setNetto] = useState(4000);
  const [quote, setQuote] = useState(35);
  const [eigenkapital, setEigenkapital] = useState(80000);
  const [sollzins, setSollzins] = useState(3.8);
  const [tilgung, setTilgung] = useState(2.0);
  const [blIndex, setBlIndex] = useState(9); // Nordrhein-Westfalen
  const [maklerProzent, setMaklerProzent] = useState(3.57);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Schritt 1: tragbare Monatsrate.
  const rateMax = netto * (quote / 100);

  // Schritt 2: Darlehenshöhe per Annuitäten-Faustformel.
  // darlehen = (rate * 12) / (sollzins + anfangstilgung), als Dezimalwerte.
  const zinsTilgung = (sollzins + tilgung) / 100;
  const darlehen = zinsTilgung > 0 ? (rateMax * 12) / zinsTilgung : 0;

  // Schritt 3: Gesamtkapital.
  const gesamtkapital = darlehen + eigenkapital;

  // Schritt 4: Kaufnebenkosten herausrechnen.
  const grest = BUNDESLAENDER[blIndex].grest;
  const nebenkostenQuote = (grest + NOTAR_GRUNDBUCH_QUOTE + maklerProzent) / 100;
  const maxKaufpreis =
    nebenkostenQuote >= 0 ? gesamtkapital / (1 + nebenkostenQuote) : 0;
  const nebenkostenEuro = maxKaufpreis * nebenkostenQuote;

  // Empfohlenes Eigenkapital: Nebenkosten + 10–20 % des Kaufpreises.
  const ekEmpfohlenMin = nebenkostenEuro + maxKaufpreis * 0.1;
  const ekEmpfohlenMax = nebenkostenEuro + maxKaufpreis * 0.2;

  const formatEuro = (v: number) =>
    Math.round(v).toLocaleString('de-DE');
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Wie viel Haus kann ich mir leisten" rechnerSlug="wie-viel-haus-rechner" />

      {/* Einkommen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Monatliches Nettohaushaltseinkommen</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={netto}
              onChange={(e) => setNetto(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">
            Anteil fürs Wohnen (tragbare Rate): {formatProzent(quote)} %
          </span>
          <input
            type="range"
            min={30}
            max={40}
            step={1}
            value={quote}
            onChange={(e) => setQuote(toNumber(e.target.value))}
            className="mt-3 w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>30 % (vorsichtig)</span>
            <span>40 % (sportlich)</span>
          </div>
          <span className="text-sm text-gray-500 mt-1 block">
            Tragbare Monatsrate: <strong>{formatEuro(rateMax)} €</strong>
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Verfügbares Eigenkapital</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={eigenkapital}
              onChange={(e) => setEigenkapital(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>
      </div>

      {/* Finanzierung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <span className="text-gray-700 font-medium block">Finanzierungsannahmen</span>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-gray-500">Sollzins p.a.</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={sollzins}
                onChange={(e) => setSollzins(toNumber(e.target.value))}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Anfangstilgung p.a.</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={tilgung}
                onChange={(e) => setTilgung(toNumber(e.target.value))}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-gray-500">Bundesland (Grunderwerbsteuer)</span>
          <select
            value={blIndex}
            onChange={(e) => setBlIndex(Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {BUNDESLAENDER.map((b, i) => (
              <option key={b.name} value={i}>
                {b.name} ({formatProzent(b.grest)} %)
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-gray-500">Maklerprovision (Käuferanteil)</span>
          <div className="mt-1 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={maklerProzent}
              onChange={(e) => setMaklerProzent(toNumber(e.target.value))}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Ohne Makler 0 eintragen. Üblich sind 3,57 % inkl. MwSt. (hälftige Teilung).
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Maximaler Kaufpreis</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(maxKaufpreis)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            bei {formatEuro(rateMax)} € Monatsrate und {formatEuro(eigenkapital)} € Eigenkapital
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">max. Darlehen</span>
              <span className="font-bold">{formatEuro(darlehen)} €</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">Kaufnebenkosten ({formatProzent(nebenkostenQuote * 100)} %)</span>
              <span className="font-bold">{formatEuro(nebenkostenEuro)} €</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Gesamtkapital (Darlehen + EK)</span>
              <span className="font-bold">{formatEuro(gesamtkapital)} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">empfohlenes Eigenkapital</span>
              <span className="font-bold">
                {formatEuro(ekEmpfohlenMin)}–{formatEuro(ekEmpfohlenMax)} €
              </span>
            </div>
            <p className="text-blue-200 text-xs mt-1">
              Nebenkosten + 10–20 % des Kaufpreises aus eigener Tasche
            </p>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Rate</strong> = Netto × Quote = {formatEuro(netto)} € × {formatProzent(quote)} % ={' '}
            <strong>{formatEuro(rateMax)} €</strong>
          </p>
          <p>
            <strong>Darlehen</strong> = (Rate × 12) ÷ (Sollzins + Tilgung) = ({formatEuro(rateMax)} × 12) ÷{' '}
            {formatProzent(sollzins + tilgung)} % = <strong>{formatEuro(darlehen)} €</strong>
          </p>
          <p>
            <strong>max. Kaufpreis</strong> = (Darlehen + EK) ÷ (1 + Nebenkostenquote) ={' '}
            {formatEuro(gesamtkapital)} € ÷{' '}
            {(1 + nebenkostenQuote).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}{' '}
            = <strong>{formatEuro(maxKaufpreis)} €</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Ergebnis ist eine unverbindliche Orientierung auf Basis
          gängiger Faustregeln (Rate ≈ 30–40 % des Nettos, Nebenkostenquoten je Bundesland) und{' '}
          <strong>keine Finanzierungszusage oder Kreditberatung</strong>. Die tatsächliche
          Darlehenshöhe hängt von Bonität (SCHUFA), Beleihungsauslauf, Bankrichtlinien und dem
          aktuellen Zinsmarkt ab. Banken finanzieren Kaufnebenkosten meist nicht mit – Ihr
          Eigenkapital sollte mindestens die Nebenkosten plus 10–20 % des Kaufpreises decken. Angaben
          ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default WieVielHausRechner;
