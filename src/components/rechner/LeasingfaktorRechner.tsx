import { useState } from 'react';

// Leasingfaktor = (monatliche Rate / Bruttolistenpreis) × 100.
// Mit Sonderzahlung: Gesamtkostenfaktor berücksichtigt die auf die Laufzeit
// umgelegte Anzahlung: ((Rate + Sonderzahlung/Laufzeit) / BLP) × 100.
// Bewertungsskala (Privat brutto): <0,5 Top, 0,5–0,7 sehr gut, 0,7–0,9 gut,
// 0,9–1,0 okay, >1,0 teuer. Branchenschnitt ~0,63.
// Quellen: ADAC, Verivox, Sistrix SectorWatch Leasing.

type Bewertung = { text: string; farbe: string };

const bewerte = (faktor: number): Bewertung => {
  if (faktor <= 0) return { text: 'bitte Werte eingeben', farbe: 'text-blue-100' };
  if (faktor < 0.5) return { text: 'Top-Angebot', farbe: 'text-green-200' };
  if (faktor < 0.7) return { text: 'sehr gut', farbe: 'text-green-200' };
  if (faktor < 0.9) return { text: 'gut', farbe: 'text-blue-100' };
  if (faktor <= 1.0) return { text: 'okay', farbe: 'text-yellow-200' };
  return { text: 'eher teuer', farbe: 'text-red-200' };
};

type Angebot = {
  rate: number;
  blp: number;
  sonderzahlung: number;
  laufzeit: number;
};

export function LeasingfaktorRechner() {
  const [angebote, setAngebote] = useState<Angebot[]>([
    { rate: 250, blp: 40000, sonderzahlung: 0, laufzeit: 36 },
  ]);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const updateAngebot = (index: number, feld: keyof Angebot, wert: number) => {
    setAngebote((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [feld]: wert } : a))
    );
  };

  const addAngebot = () => {
    if (angebote.length >= 3) return;
    setAngebote((prev) => [...prev, { rate: 0, blp: 0, sonderzahlung: 0, laufzeit: 36 }]);
  };

  const removeAngebot = (index: number) => {
    setAngebote((prev) => prev.filter((_, i) => i !== index));
  };

  // Reiner Leasingfaktor (ohne Sonderzahlung).
  const faktor = (a: Angebot) => (a.blp > 0 ? (a.rate / a.blp) * 100 : 0);

  // Gesamtkostenfaktor inkl. umgelegter Sonderzahlung.
  const gesamtFaktor = (a: Angebot) => {
    if (a.blp <= 0) return 0;
    const umlage = a.laufzeit > 0 ? a.sonderzahlung / a.laufzeit : 0;
    return ((a.rate + umlage) / a.blp) * 100;
  };

  // Bestes Angebot (niedrigster Gesamtkostenfaktor unter den gültigen).
  const gueltige = angebote
    .map((a, i) => ({ i, gf: gesamtFaktor(a) }))
    .filter((x) => x.gf > 0);
  const bestIndex =
    gueltige.length > 0
      ? gueltige.reduce((min, x) => (x.gf < min.gf ? x : min)).i
      : -1;

  const formatFaktor = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Das erste Angebot dient als „Hauptergebnis“ in der Gradient-Card.
  const haupt = angebote[0];
  const hauptGesamt = gesamtFaktor(haupt);
  const hauptRein = faktor(haupt);
  const hatSonderzahlung = haupt.sonderzahlung > 0;
  const bewertung = bewerte(hatSonderzahlung ? hauptGesamt : hauptRein);

  return (
    <div className="max-w-lg mx-auto">

      {/* Angebote */}
      {angebote.map((a, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-700 font-medium">
              {angebote.length > 1 ? `Angebot ${i + 1}` : 'Leasingangebot'}
            </span>
            {angebote.length > 1 && (
              <button
                onClick={() => removeAngebot(i)}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                entfernen
              </button>
            )}
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Monatliche Leasingrate (€)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={a.rate}
                  onChange={(e) => updateAngebot(i, 'rate', toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium text-sm">Bruttolistenpreis (€)</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={a.blp}
                  onChange={(e) => updateAngebot(i, 'blp', toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Der unverbindliche Neupreis (UVP) des Fahrzeugs inkl. Mehrwertsteuer.
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-gray-700 font-medium text-sm">Sonderzahlung (€)</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={a.sonderzahlung}
                    onChange={(e) => updateAngebot(i, 'sonderzahlung', toNumber(e.target.value))}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                </div>
              </label>
              <label className="block">
                <span className="text-gray-700 font-medium text-sm">Laufzeit (Monate)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={a.laufzeit}
                  onChange={(e) => updateAngebot(i, 'laufzeit', toNumber(e.target.value))}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Faktor je Angebot bei Vergleich */}
          {angebote.length > 1 && (
            <div
              className={`mt-4 rounded-xl p-3 text-sm flex justify-between items-center ${
                bestIndex === i
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-gray-50 text-gray-700'
              }`}
            >
              <span>
                {a.sonderzahlung > 0 ? 'Gesamtkostenfaktor' : 'Leasingfaktor'}
                {bestIndex === i && ' · bestes Angebot ✅'}
              </span>
              <span className="font-bold">
                {formatFaktor(a.sonderzahlung > 0 ? gesamtFaktor(a) : faktor(a))}
              </span>
            </div>
          )}
        </div>
      ))}

      {angebote.length < 3 && (
        <button
          onClick={addAngebot}
          className="w-full mb-6 py-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Weiteres Angebot vergleichen
        </button>
      )}

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          {hatSonderzahlung ? 'Gesamtkostenfaktor' : 'Leasingfaktor'}
          {angebote.length > 1 ? ' (Angebot 1)' : ''}
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {formatFaktor(hatSonderzahlung ? hauptGesamt : hauptRein)}
            </span>
          </div>
          <p className={`text-sm mt-1 font-medium ${bewertung.farbe}`}>{bewertung.text}</p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">reiner Leasingfaktor</span>
              <span className="font-bold">{formatFaktor(hauptRein)}</span>
            </div>
            {hatSonderzahlung && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">mit Sonderzahlung (umgelegt)</span>
                <span className="font-bold">{formatFaktor(hauptGesamt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Leasingfaktor</strong> = (Rate ÷ Bruttolistenpreis) × 100 = ({formatEuro(haupt.rate)}{' '}
            ÷ {formatEuro(haupt.blp)}) × 100 = <strong>{formatFaktor(hauptRein)}</strong>
          </p>
          {hatSonderzahlung && (
            <p>
              <strong>Gesamtkostenfaktor</strong> = ((Rate + Sonderzahlung ÷ Laufzeit) ÷ BLP) × 100 ={' '}
              (({formatEuro(haupt.rate)} + {formatEuro(haupt.sonderzahlung)} ÷ {haupt.laufzeit}) ÷{' '}
              {formatEuro(haupt.blp)}) × 100 = <strong>{formatFaktor(hauptGesamt)}</strong>
            </p>
          )}
          <p className="text-xs text-gray-500">
            Faustregel: unter 0,5 Top · 0,5–0,7 sehr gut · 0,7–0,9 gut · 0,9–1,0 okay · über 1,0 teuer.
            Branchenschnitt rund 0,63.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Bewertungsschwellen sind Markt-Faustregeln, keine festen
          Grenzen. Der Leasingfaktor enthält <strong>keine Nebenkosten</strong> wie Überführung,
          Zulassung, Wartung oder Versicherung – ein niedriger Faktor allein macht ein Angebot nicht
          automatisch günstig. Achten Sie außerdem darauf, Privat-Brutto- und Gewerbe-Netto-Angebote
          nicht zu vermischen. Keine Steuer- oder Anlageberatung, Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default LeasingfaktorRechner;
