import { useState } from 'react';

// Der Beleihungsauslauf (engl. Loan-to-Value, LTV) ist die zentrale Kennzahl
// der Baufinanzierung: Darlehenssumme im Verhältnis zum Beleihungswert.
//
// Beleihungswert = Kaufpreis × (1 − Sicherheitsabschlag).
// Der Sicherheitsabschlag ist laut Beleihungswertermittlungsverordnung (BelWertV)
// die Differenz zwischen Markt-/Kaufpreis und dem dauerhaft erzielbaren Wert.
// In der Banken-Praxis liegt er typischerweise bei 10–20 %; 10 % ist ein
// gängiger, eher konservativer Default. Quelle: BelWertV, Verivox, Check24.
const SICHERHEITSABSCHLAG_DEFAULT = 10; // Prozent

// Typische Konstellationen als Voreinstellungen (Kaufpreis / Eigenkapital).
// Reine Richtwerte zur schnellen Orientierung – frei anpassbar.
type Szenario = {
  name: string;
  icon: string;
  kaufpreis: number;
  eigenkapital: number;
  nebenkostenProzent: number;
};

const SZENARIEN: Szenario[] = [
  { name: '20 % Eigenkapital', icon: '🏠', kaufpreis: 400000, eigenkapital: 80000, nebenkostenProzent: 0 },
  { name: 'Nur Nebenkosten', icon: '🔑', kaufpreis: 400000, eigenkapital: 40000, nebenkostenProzent: 10 },
  { name: 'Vollfinanzierung', icon: '💯', kaufpreis: 400000, eigenkapital: 0, nebenkostenProzent: 0 },
  { name: 'Solide (30 %)', icon: '🛡️', kaufpreis: 400000, eigenkapital: 120000, nebenkostenProzent: 0 },
  { name: 'Eigene Eingabe', icon: '🔧', kaufpreis: 350000, eigenkapital: 70000, nebenkostenProzent: 0 },
];

type Stufe = {
  label: string;
  bereich: string;
  farbe: string;
  text: string;
};

// Ordnet den Beleihungsauslauf einer Zinskondition-Stufe zu.
// Die Stufen 60 / 80 / 90 / 100 % sind banküblich; die beschriebenen
// Zinsaufschläge sind illustrativ und markt-/bankabhängig.
function ermittleStufe(auslauf: number): Stufe {
  if (auslauf <= 60) {
    return {
      label: 'Bestkondition (Realkredit)',
      bereich: 'bis 60 %',
      farbe: 'bg-green-500',
      text: 'Bis 60 % Beleihungsauslauf gilt das Darlehen als „Realkredit“ – das niedrigste Risiko für die Bank und damit in der Regel der beste Zinssatz.',
    };
  }
  if (auslauf <= 80) {
    return {
      label: 'Gute Kondition',
      bereich: 'über 60 bis 80 %',
      farbe: 'bg-lime-500',
      text: 'Zwischen 60 und 80 % zahlen Sie meist nur einen leichten Zinsaufschlag. Das ist der klassische Bereich solide finanzierter Immobilienkäufe.',
    };
  }
  if (auslauf <= 90) {
    return {
      label: 'Erhöhter Aufschlag',
      bereich: 'über 80 bis 90 %',
      farbe: 'bg-amber-500',
      text: 'Über 80 % steigt das Risiko für die Bank spürbar – mit einem deutlicheren Zinsaufschlag. Viele Banken finanzieren hier noch ohne Probleme.',
    };
  }
  if (auslauf <= 100) {
    return {
      label: 'Vollfinanzierung',
      bereich: 'über 90 bis 100 %',
      farbe: 'bg-orange-500',
      text: 'Bei 90 bis 100 % spricht man von einer Vollfinanzierung (Kaufpreis komplett finanziert). Der Zinsaufschlag ist hoch und nicht jede Bank macht das mit.',
    };
  }
  return {
    label: 'Über 100 % (inkl. Nebenkosten)',
    bereich: 'über 100 %',
    farbe: 'bg-red-500',
    text: 'Über 100 % wird auch ein Teil der Kaufnebenkosten mitfinanziert (110-%-Finanzierung). Das gelingt nur bei sehr guter Bonität und zum höchsten Zinssatz.',
  };
}

export function BeleihungsauslaufRechner() {
  const [szenarioIndex, setSzenarioIndex] = useState(0);
  const [kaufpreis, setKaufpreis] = useState(SZENARIEN[0].kaufpreis);
  const [eigenkapital, setEigenkapital] = useState(SZENARIEN[0].eigenkapital);
  const [nebenkostenProzent, setNebenkostenProzent] = useState(SZENARIEN[0].nebenkostenProzent);
  const [mitAbschlag, setMitAbschlag] = useState(false);
  const [sicherheitsabschlag, setSicherheitsabschlag] = useState(SICHERHEITSABSCHLAG_DEFAULT);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleSzenarioWechsel = (index: number) => {
    setSzenarioIndex(index);
    const s = SZENARIEN[index];
    setKaufpreis(s.kaufpreis);
    setEigenkapital(s.eigenkapital);
    setNebenkostenProzent(s.nebenkostenProzent);
  };

  // Kaufnebenkosten (Grunderwerbsteuer, Notar, Grundbuch, ggf. Makler).
  const nebenkosten = kaufpreis * (nebenkostenProzent / 100);

  // Darlehenssumme = Kaufpreis + Kaufnebenkosten − Eigenkapital (mind. 0).
  const darlehenssumme = Math.max(0, kaufpreis + nebenkosten - eigenkapital);

  // Beleihungswert = Kaufpreis × (1 − Sicherheitsabschlag), wenn aktiviert.
  // Ohne Abschlag wird der Kaufpreis selbst als Bezugsgröße verwendet
  // (vereinfachte Variante = Darlehen / Kaufpreis).
  const abschlagFaktor = mitAbschlag ? Math.min(0.5, sicherheitsabschlag / 100) : 0;
  const beleihungswert = kaufpreis * (1 - abschlagFaktor);

  // Beleihungsauslauf (LTV) = Darlehenssumme / Beleihungswert × 100.
  const beleihungsauslauf = beleihungswert > 0 ? (darlehenssumme / beleihungswert) * 100 : 0;

  const stufe = ermittleStufe(beleihungsauslauf);

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  // Breite des Fortschrittsbalkens (bei > 100 % auf 100 % gedeckelt).
  const balkenBreite = Math.min(100, beleihungsauslauf);

  return (
    <div className="max-w-lg mx-auto">

      {/* Szenario-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Typische Konstellation wählen</span>
        <div className="grid grid-cols-3 gap-2">
          {SZENARIEN.map((s, i) => (
            <button
              key={s.name}
              onClick={() => handleSzenarioWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                szenarioIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-center leading-tight">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Kaufpreis (bzw. Verkehrswert)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={kaufpreis}
              onChange={(e) => setKaufpreis(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Eigenkapital</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={eigenkapital}
              onChange={(e) => setEigenkapital(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Kaufnebenkosten</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={20}
              step={0.5}
              value={nebenkostenProzent}
              onChange={(e) => setNebenkostenProzent(Math.min(20, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Grunderwerbsteuer, Notar, Grundbuch und ggf. Makler. Üblich 9–15 % vom Kaufpreis ={' '}
            {formatEuro(nebenkosten)} €. Auf 0 stellen, wenn die Nebenkosten aus Eigenkapital gezahlt werden.
          </span>
        </label>

        {/* Sicherheitsabschlag */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitAbschlag}
              onChange={(e) => setMitAbschlag(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Sicherheitsabschlag berücksichtigen (Beleihungswert)</span>
          </label>
          {mitAbschlag && (
            <label className="block mt-3">
              <span className="text-sm text-gray-600">Sicherheitsabschlag vom Kaufpreis</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={20}
                  step={1}
                  value={sicherheitsabschlag}
                  onChange={(e) => setSicherheitsabschlag(Math.min(20, toNumber(e.target.value)))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Laut BelWertV mindestens 10 %, banküblich 10–20 %. Beleihungswert dann ={' '}
                {formatEuro(beleihungswert)} €.
              </span>
            </label>
          )}
          {!mitAbschlag && (
            <span className="text-xs text-gray-400 mt-2 block">
              Ohne Abschlag wird vereinfacht der Kaufpreis als Bezugsgröße genutzt (Darlehen ÷ Kaufpreis).
            </span>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Ihr Beleihungsauslauf (LTV)</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatProzent(beleihungsauslauf)}</span>
            <span className="text-xl text-blue-200">%</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">Zinskondition-Stufe: {stufe.label}</p>
        </div>

        {/* Balken */}
        <div className="mb-6">
          <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
            <div className={`h-3 rounded-full ${stufe.farbe}`} style={{ width: `${balkenBreite}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-blue-200 mt-1">
            <span>0 %</span>
            <span>60 %</span>
            <span>80 %</span>
            <span>100 %</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Darlehenssumme</span>
              <span className="text-xl font-bold">{formatEuro(darlehenssumme)} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">{mitAbschlag ? 'Beleihungswert' : 'Bezugsgröße (Kaufpreis)'}</span>
              <span className="font-bold">{formatEuro(beleihungswert)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Darlehenssumme</strong> = Kaufpreis + Kaufnebenkosten − Eigenkapital
          </p>
          <p>
            = {formatEuro(kaufpreis)} € + {formatEuro(nebenkosten)} € − {formatEuro(eigenkapital)} € ={' '}
            <strong>{formatEuro(darlehenssumme)} €</strong>
          </p>
          <p>
            <strong>{mitAbschlag ? 'Beleihungswert' : 'Bezugsgröße'}</strong>{' '}
            {mitAbschlag
              ? `= Kaufpreis × (1 − ${formatProzent(sicherheitsabschlag)} %) = ${formatEuro(beleihungswert)} €`
              : `= Kaufpreis = ${formatEuro(beleihungswert)} €`}
          </p>
          <p>
            <strong>Beleihungsauslauf</strong> = Darlehen ÷ {mitAbschlag ? 'Beleihungswert' : 'Kaufpreis'} × 100
          </p>
          <p>
            = {formatEuro(darlehenssumme)} ÷ {formatEuro(beleihungswert)} × 100 ={' '}
            <strong>{formatProzent(beleihungsauslauf)} %</strong>
          </p>
          <p className="text-gray-600">{stufe.text}</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Dieser Rechner bietet eine unverbindliche Orientierung und ist keine
          Finanz- oder Kreditberatung. Den maßgeblichen <strong>Beleihungswert</strong> ermittelt jede Bank
          individuell nach der Beleihungswertermittlungsverordnung (BelWertV); der real angesetzte
          Sicherheitsabschlag kann von der hier vereinfacht gewählten Annahme abweichen. Die genannten
          Zinsaufschläge je Stufe sind bank- und marktabhängig und nur illustrativ. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default BeleihungsauslaufRechner;
