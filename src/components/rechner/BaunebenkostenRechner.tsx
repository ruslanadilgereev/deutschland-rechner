import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Baunebenkosten nach DIN 276 (Kostengruppe 700) – Default-Anteile bezogen auf
// die reinen Baukosten (KG 300 Bauwerk-Baukonstruktion + KG 400 Technische
// Anlagen). Quellen: Bauprofessor (KG 700), gripsware.de (DIN 276 KG 700),
// HOAI.de (anrechenbare Kosten / Honorarzonen). Werte sind belastbare
// Richtwerte – der Nutzer kann jeden Posten anpassen.
//
// WICHTIG: Finanzierungskosten gehoeren seit DIN 276:2018 NICHT mehr in KG 700,
// sondern in die eigene KG 800 – sie werden hier bewusst NICHT eingerechnet.

const ARCHITEKT_DEFAULT_PROZENT = 12; // HOAI 2021, Honorarzone III, Default 10–15 %
const STATIKER_DEFAULT_PROZENT = 1.5; // Tragwerksplanung 1,5–2 %
const GENEHMIGUNG_DEFAULT_PROZENT = 0.35; // Baugenehmigung 0,2–0,5 %
const VERMESSUNG_DEFAULT_EUR = 2000; // 1.500–3.000 € pauschal
const BODENGUTACHTEN_DEFAULT_EUR = 1000; // 500–1.500 € pauschal
const HAUSANSCHLUSS_DEFAULT_EUR = 13000; // 10.000–16.000 € (Strom/Wasser/Abwasser/Gas/Telekom)
const VERSICHERUNG_DEFAULT_EUR = 1000; // Bauherrenhaftpflicht + Bauleistung + Feuerrohbau, 500–1.500 €

const BAUKOSTEN_DEFAULT_EUR = 350000;

type Szenario = {
  name: string;
  icon: string;
  baukosten: number;
};

const SZENARIEN: Szenario[] = [
  { name: 'Reihenhaus', icon: '🏘️', baukosten: 280000 },
  { name: 'Einfamilienhaus', icon: '🏡', baukosten: 350000 },
  { name: 'Großes Haus', icon: '🏠', baukosten: 500000 },
];

export function BaunebenkostenRechner() {
  const [baukosten, setBaukosten] = useState(BAUKOSTEN_DEFAULT_EUR);
  const [architektProzent, setArchitektProzent] = useState(ARCHITEKT_DEFAULT_PROZENT);
  const [statikerProzent, setStatikerProzent] = useState(STATIKER_DEFAULT_PROZENT);
  const [genehmigungProzent, setGenehmigungProzent] = useState(GENEHMIGUNG_DEFAULT_PROZENT);
  const [vermessungEuro, setVermessungEuro] = useState(VERMESSUNG_DEFAULT_EUR);
  const [bodengutachtenEuro, setBodengutachtenEuro] = useState(BODENGUTACHTEN_DEFAULT_EUR);
  const [hausanschlussEuro, setHausanschlussEuro] = useState(HAUSANSCHLUSS_DEFAULT_EUR);
  const [versicherungEuro, setVersicherungEuro] = useState(VERSICHERUNG_DEFAULT_EUR);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const setSzenario = (s: Szenario) => {
    setBaukosten(s.baukosten);
  };

  // Prozent-Posten (auf Baukosten KG 300+400 bezogen)
  const architektEuro = baukosten * (architektProzent / 100);
  const statikerEuro = baukosten * (statikerProzent / 100);
  const genehmigungEuro = baukosten * (genehmigungProzent / 100);

  // Pauschal-Posten
  const summe =
    architektEuro +
    statikerEuro +
    genehmigungEuro +
    vermessungEuro +
    bodengutachtenEuro +
    hausanschlussEuro +
    versicherungEuro;

  const anteilProzent = baukosten > 0 ? (summe / baukosten) * 100 : 0;
  const gesamtBausumme = baukosten + summe;

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  type Posten = { label: string; betrag: number; hint: string };
  const posten: Posten[] = [
    { label: 'Architekt / Ingenieur (HOAI)', betrag: architektEuro, hint: `${formatProzent(architektProzent)} % der Baukosten` },
    { label: 'Statiker / Tragwerksplanung', betrag: statikerEuro, hint: `${formatProzent(statikerProzent)} % der Baukosten` },
    { label: 'Baugenehmigung / Gebühren', betrag: genehmigungEuro, hint: `${formatProzent(genehmigungProzent)} % der Baukosten` },
    { label: 'Vermessung', betrag: vermessungEuro, hint: 'Pauschale' },
    { label: 'Bodengutachten', betrag: bodengutachtenEuro, hint: 'Pauschale' },
    { label: 'Hausanschluss / Erschließung', betrag: hausanschlussEuro, hint: 'Pauschale' },
    { label: 'Bauversicherungen', betrag: versicherungEuro, hint: 'Pauschale' },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Baunebenkosten-Rechner" rechnerSlug="baunebenkosten-rechner" />

      {/* Szenario-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Typische Bauvorhaben</span>
        <div className="grid grid-cols-3 gap-2">
          {SZENARIEN.map((s) => (
            <button
              key={s.name}
              onClick={() => setSzenario(s)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                baukosten === s.baukosten
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-center leading-tight">{s.name}</span>
              <span className="text-[10px] text-gray-400">{formatEuro(s.baukosten)} €</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingabe: Baukosten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block">
          <span className="text-gray-700 font-medium">Reine Baukosten (KG 300 + 400)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={baukosten}
              onChange={(e) => setBaukosten(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Kosten für Rohbau, Ausbau und Technik – ohne Grundstück und ohne Baunebenkosten.
          </span>
        </label>
      </div>

      {/* Eingabe: einzelne Posten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <span className="text-gray-700 font-medium block">Nebenkosten-Posten (anpassbar)</span>

        <label className="block">
          <span className="text-sm text-gray-600">Architekt / Ingenieur (HOAI) in %</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={architektProzent}
              onChange={(e) => setArchitektProzent(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Honorarzone III, Default 12 % (üblich 10–15 %) → {formatEuro(architektEuro)} €
          </span>
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Statiker / Tragwerksplanung in %</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={statikerProzent}
              onChange={(e) => setStatikerProzent(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Default 1,5 % (üblich 1,5–2 %) → {formatEuro(statikerEuro)} €
          </span>
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Baugenehmigung / Gebühren in %</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.05}
              value={genehmigungProzent}
              onChange={(e) => setGenehmigungProzent(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Default 0,35 % (je Bundesland 0,2–0,5 %) → {formatEuro(genehmigungEuro)} €
          </span>
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Vermessung (Pauschale)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={vermessungEuro}
              onChange={(e) => setVermessungEuro(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Üblich 1.500–3.000 €</span>
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Bodengutachten (Pauschale)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={bodengutachtenEuro}
              onChange={(e) => setBodengutachtenEuro(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">Üblich 500–1.500 €</span>
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Hausanschluss / Erschließung (Pauschale)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              value={hausanschlussEuro}
              onChange={(e) => setHausanschlussEuro(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Strom, Wasser, Abwasser, Gas, Telekom – üblich 10.000–16.000 €. Bei unerschlossenem Grundstück deutlich höher.
          </span>
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Bauversicherungen (Pauschale)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={versicherungEuro}
              onChange={(e) => setVersicherungEuro(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Bauherrenhaftpflicht + Bauleistung + Feuerrohbau, üblich 500–1.500 €
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Baunebenkosten (DIN 276 KG 700)</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(summe)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            entspricht {formatProzent(anteilProzent)} % der Baukosten
          </p>
        </div>

        <div className="space-y-2">
          {posten.map((p) => (
            <div key={p.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-blue-50 text-sm">{p.label}</span>
                  <span className="block text-[11px] text-blue-200">{p.hint}</span>
                </div>
                <span className="font-bold whitespace-nowrap">{formatEuro(p.betrag)} €</span>
              </div>
            </div>
          ))}

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm mt-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-50">Baukosten + Nebenkosten</span>
              <span className="text-xl font-bold">{formatEuro(gesamtBausumme)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Prozent-Posten</strong> = Baukosten × Anteil:
          </p>
          <p>
            Architekt = {formatEuro(baukosten)} € × {formatProzent(architektProzent)} % ={' '}
            <strong>{formatEuro(architektEuro)} €</strong>; Statiker = {formatProzent(statikerProzent)} % ={' '}
            <strong>{formatEuro(statikerEuro)} €</strong>; Genehmigung = {formatProzent(genehmigungProzent)} % ={' '}
            <strong>{formatEuro(genehmigungEuro)} €</strong>
          </p>
          <p>
            <strong>Pauschalen</strong> = {formatEuro(vermessungEuro)} € + {formatEuro(bodengutachtenEuro)} € +{' '}
            {formatEuro(hausanschlussEuro)} € + {formatEuro(versicherungEuro)} €
          </p>
          <p>
            <strong>Summe Baunebenkosten</strong> = <strong>{formatEuro(summe)} €</strong> ({formatProzent(anteilProzent)} %
            der Baukosten)
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Werte sind Richt- und Schätzwerte. Das HOAI-Honorar hängt von
          Honorarzone, anrechenbaren Kosten und individueller Vereinbarung ab; Genehmigungsgebühren
          variieren je Bundesland und Gemeinde; Erschließungskosten sind stark grundstücksabhängig
          (erschlossen/unerschlossen). <strong>Finanzierungsnebenkosten</strong> (z. B.
          Bereitstellungszinsen) sind seit DIN 276:2018 NICHT Teil der Kostengruppe 700 (eigene KG 800)
          und hier bewusst nicht enthalten. Keine Rechts-, Steuer- oder Bauberatung, kein Anspruch auf
          Vollständigkeit. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default BaunebenkostenRechner;
