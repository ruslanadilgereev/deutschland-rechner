import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Sollzinsbindung-Vergleich-Rechner
// Vergleicht mehrere Zinsbindungs-Szenarien eines Annuitaetendarlehens nebeneinander
// (z. B. 10 / 15 / 20 Jahre mit je eigenem Sollzins). Berechnet pro Szenario die
// Monatsrate, die in der Bindung gezahlten Zinsen, den getilgten Betrag und die
// Restschuld am Bindungsende.
//
// Grundlage: Standard-Annuitaetenmathematik. Eingaben pro Szenario: Darlehen D,
// Sollzins p (% p.a.), anfaengliche Tilgung t (% p.a.), Zinsbindung n (Jahre).
//   Monatsrate (Annuitaet) A = D × (p + t) / 100 / 12
//   Monatlicher Zins i = p / 1.200
//   Restschuld nach N = 12 × n Monaten (geschlossene Form):
//     RS = D × (1 + i)^N − A × ((1 + i)^N − 1) / i
//   Gezahlte Zinsen in der Bindung = A × N − (D − RS)
//
// Hinweise zu den Default-Zinsen: tagesaktuelle, bonitaetsabhaengige Beispielwerte
// (laengere Bindung = hoeherer Zins, typischer Aufschlag laut vergleich.de / Finanztip).
// KEINE Zinsempfehlung – Werte frei anpassbar.

type Szenario = {
  id: number;
  label: string;
  jahre: number;
  sollzins: number; // % p.a.
};

const FARBEN = ['blue', 'indigo', 'violet'] as const;

const DEFAULT_SZENARIEN: Szenario[] = [
  { id: 1, label: '10 Jahre', jahre: 10, sollzins: 3.4 },
  { id: 2, label: '15 Jahre', jahre: 15, sollzins: 3.7 },
  { id: 3, label: '20 Jahre', jahre: 20, sollzins: 3.9 },
];

type Ergebnis = {
  monatsrate: number;
  zinsen: number;
  tilgung: number;
  restschuld: number;
};

export function SollzinsbindungVergleichRechner() {
  const [darlehen, setDarlehen] = useState(300000);
  const [tilgung, setTilgung] = useState(2); // anfaengliche Tilgung % p.a., gemeinsam fuer alle Szenarien
  const [szenarien, setSzenarien] = useState<Szenario[]>(DEFAULT_SZENARIEN);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value.replace(',', '.'));
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const updateSzenario = (id: number, feld: 'jahre' | 'sollzins', wert: number) => {
    setSzenarien((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              [feld]: wert,
              label: feld === 'jahre' ? `${wert} Jahre` : s.label,
            }
          : s
      )
    );
  };

  // Berechnet ein Szenario nach der geschlossenen Annuitaetenformel.
  const berechne = (s: Szenario): Ergebnis => {
    const D = darlehen;
    const annuitaetProzent = s.sollzins + tilgung; // % p.a.
    const monatsrate = (D * (annuitaetProzent / 100)) / 12;
    const i = s.sollzins / 1200; // monatlicher Zinssatz
    const N = Math.round(s.jahre * 12);

    let restschuld: number;
    if (i === 0) {
      // zinsfreier Sonderfall: reine Tilgung
      restschuld = Math.max(0, D - monatsrate * N);
    } else {
      const faktor = Math.pow(1 + i, N);
      restschuld = D * faktor - monatsrate * ((faktor - 1) / i);
    }
    restschuld = Math.max(0, restschuld);

    const getilgt = D - restschuld;
    const gezahlteRaten = monatsrate * N;
    const zinsen = Math.max(0, gezahlteRaten - getilgt);

    return { monatsrate, zinsen, tilgung: getilgt, restschuld };
  };

  const ergebnisse = szenarien.map(berechne);

  // Referenz fuer den Rechenweg + Hervorhebung: das Szenario mit der niedrigsten
  // Restschuld am jeweiligen Bindungsende (= am weitesten entschuldet).
  const minRestschuldIndex = ergebnisse.reduce(
    (best, e, idx, arr) => (e.restschuld < arr[best].restschuld ? idx : best),
    0
  );

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatEuro2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback
        rechnerName="Sollzinsbindung-Vergleich-Rechner"
        rechnerSlug="sollzinsbindung-vergleich-rechner"
      />

      {/* Gemeinsame Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Darlehenssumme</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={darlehen}
              onChange={(e) => setDarlehen(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Anfängliche Tilgung (% p. a.)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={tilgung}
              onChange={(e) => setTilgung(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Gilt für alle Szenarien gleich, damit nur die Zinsbindung verglichen wird. Höhere
            Tilgung = höhere Rate, aber schnellere Entschuldung.
          </span>
        </label>
      </div>

      {/* Szenario-Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">
          Zinsbindungs-Szenarien (Sollzins steigt typischerweise mit der Bindungsdauer)
        </span>
        <div className="space-y-4">
          {szenarien.map((s, idx) => (
            <div
              key={s.id}
              className={`rounded-xl border p-4 ${
                idx === minRestschuldIndex
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-800">Szenario {idx + 1}</span>
                {idx === minRestschuldIndex && (
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    niedrigste Restschuld
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm text-gray-600">Zinsbindung (Jahre)</span>
                  <div className="mt-1 relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={40}
                      value={s.jahre}
                      onChange={(e) =>
                        updateSzenario(s.id, 'jahre', Math.min(40, Math.round(toNumber(e.target.value))))
                      }
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">J</span>
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm text-gray-600">Sollzins (% p. a.)</span>
                  <div className="mt-1 relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.01}
                      value={s.sollzins}
                      onChange={(e) => updateSzenario(s.id, 'sollzins', toNumber(e.target.value))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ergebnis-Vergleich */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-4">
          Vergleich der Zinsbindungen bei {formatEuro(darlehen)} € Darlehen
        </h3>

        <div className="space-y-3">
          {szenarien.map((s, idx) => {
            const e = ergebnisse[idx];
            return (
              <div key={s.id} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-bold text-lg">
                    {s.jahre} Jahre
                    <span className="text-blue-200 font-normal text-sm ml-2">
                      {formatProzent(s.sollzins)} %
                    </span>
                  </span>
                  <span className="text-xl font-bold">{formatEuro2(e.monatsrate)} €/Mon.</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-blue-100">
                  <div className="flex justify-between">
                    <span>Zinsen in Bindung</span>
                    <span className="font-semibold text-white">{formatEuro(e.zinsen)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>getilgt</span>
                    <span className="font-semibold text-white">{formatEuro(e.tilgung)} €</span>
                  </div>
                  <div className="flex justify-between col-span-2 border-t border-white/20 pt-1 mt-1">
                    <span>Restschuld am Bindungsende</span>
                    <span className="font-bold text-white">{formatEuro(e.restschuld)} €</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-blue-200 text-xs mt-4">
          Restschuld = was nach Ende der Zinsbindung übrig bleibt und zu einem dann unbekannten Zins
          anschlussfinanziert werden muss.
        </p>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            Beispiel Szenario {minRestschuldIndex + 1} ({szenarien[minRestschuldIndex].jahre} Jahre,{' '}
            {formatProzent(szenarien[minRestschuldIndex].sollzins)} % Sollzins):
          </p>
          <p>
            <strong>Monatsrate</strong> = Darlehen × (Sollzins + Tilgung) ÷ 100 ÷ 12
          </p>
          <p>
            = {formatEuro(darlehen)} × ({formatProzent(szenarien[minRestschuldIndex].sollzins)} +{' '}
            {formatProzent(tilgung)}) % ÷ 12 ={' '}
            <strong>{formatEuro2(ergebnisse[minRestschuldIndex].monatsrate)} €</strong>
          </p>
          <p>
            <strong>Restschuld</strong> = D × (1 + i)<sup>N</sup> − Rate × ((1 + i)<sup>N</sup> − 1) ÷ i,
            mit i = Sollzins ÷ 1.200 und N = {szenarien[minRestschuldIndex].jahre} × 12 ={' '}
            {szenarien[minRestschuldIndex].jahre * 12} Monaten
          </p>
          <p>
            = <strong>{formatEuro(ergebnisse[minRestschuldIndex].restschuld)} €</strong> Restschuld,
            davon {formatEuro(ergebnisse[minRestschuldIndex].zinsen)} € Zinsen in der Bindung gezahlt.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Dies ist eine reine Modellrechnung mit den von Ihnen
          eingegebenen Annahmen – keine Finanzberatung und keine Kreditzusage. Eine kürzere
          Zinsbindung hinterlässt eine <strong>höhere Restschuld</strong>, die am Bindungsende zu
          einem <strong>heute unbekannten Anschlusszins</strong> weiterfinanziert werden muss
          (Prolongationsrisiko). Beachten Sie das gesetzliche Sonderkündigungsrecht nach 10 Jahren
          (§ 489 Abs. 1 Nr. 2 BGB). Konkrete Sollzinsen sind tagesaktuell und bonitätsabhängig – die
          Voreinstellungen sind Beispielwerte, keine Empfehlung. Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default SollzinsbindungVergleichRechner;
