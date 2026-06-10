import { useState } from 'react';

// Innentüren-Kosten:
//   Stückpreis je Tür = Türblatt + Zarge + Beschlag/Drückergarnitur + Montage
//                       (+ optionale Nebenkosten je Tür: Demontage/Entsorgung/Anfahrt)
//   Position je Türtyp = Anzahl × Stückpreis
//   Gesamtkosten       = Summe aller Positionen
//
// Richtwerte (Normmaß Türhöhe 198,5 cm nach DIN 18101):
//   Türblatt CPL/weiß 70–100 €, furniert 300–450 €, Massivholz 400–650 €, Glaseinsatz ab 130 €
//   Zarge Standard/Stahl 20–80 €, Holz-/Designzarge 150–300 €
//   Drücker-/Beschlaggarnitur 20–80 €, Montage je Tür 50–150 €
//   Demontage/Entsorgung/Anfahrt 50–200 € je Tür
//   Aufpreis raumhoch (>211 cm) bzw. Sondermaß typ. +30–80 % auf das Türblatt
// Quellen: DIN 18101 (Türen-Albrecht), energie-experten.org, tischler-schreiner.org (Stand 2026).

// Türtyp-Voreinstellungen: Türblatt-Mittelpreis (€) als Richtwert je Ausführung.
type Tuertyp = {
  name: string;
  icon: string;
  tuerblatt: number; // € je Türblatt (Mittelwert der Spanne)
};

const TUERTYPEN: Tuertyp[] = [
  { name: 'CPL/weiß', icon: '🚪', tuerblatt: 90 },
  { name: 'Furniert', icon: '🪵', tuerblatt: 375 },
  { name: 'Massivholz', icon: '🌳', tuerblatt: 525 },
  { name: 'Glaseinsatz', icon: '🪟', tuerblatt: 160 },
  { name: 'Eigene Eingabe', icon: '🔧', tuerblatt: 200 },
];

export function InnentuerenRechner() {
  const [typIndex, setTypIndex] = useState(0);
  const [anzahl, setAnzahl] = useState(5);
  const [tuerblatt, setTuerblatt] = useState(TUERTYPEN[0].tuerblatt);
  const [zarge, setZarge] = useState(50);
  const [beschlag, setBeschlag] = useState(40);
  const [montage, setMontage] = useState(100);
  const [raumhoch, setRaumhoch] = useState(false);
  const [aufpreisProzent, setAufpreisProzent] = useState(50);
  const [nebenkostenAktiv, setNebenkostenAktiv] = useState(false);
  const [nebenkostenProTuer, setNebenkostenProTuer] = useState(80);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleTypWechsel = (index: number) => {
    setTypIndex(index);
    setTuerblatt(TUERTYPEN[index].tuerblatt);
  };

  // Türblatt ggf. mit Sondermaß-/Raumhoch-Aufpreis
  const tuerblattEffektiv = raumhoch
    ? tuerblatt * (1 + aufpreisProzent / 100)
    : tuerblatt;

  const nebenkosten = nebenkostenAktiv ? nebenkostenProTuer : 0;

  // Stückpreis je Tür
  const stueckpreis =
    tuerblattEffektiv + zarge + beschlag + montage + nebenkosten;

  // Gesamtkosten
  const gesamt = anzahl * stueckpreis;

  // Aufschlüsselung über alle Türen
  const summeTuerblatt = anzahl * tuerblattEffektiv;
  const summeZarge = anzahl * zarge;
  const summeBeschlag = anzahl * beschlag;
  const summeMontage = anzahl * montage;
  const summeNebenkosten = anzahl * nebenkosten;

  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Türtyp-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Türtyp / Ausführung</span>
        <div className="grid grid-cols-3 gap-2">
          {TUERTYPEN.map((t, i) => (
            <button
              key={t.name}
              onClick={() => handleTypWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                typIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="text-center leading-tight">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Anzahl Türen</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={anzahl}
              onChange={(e) => setAnzahl(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Stück</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Türblatt (Preis je Tür)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={10}
              value={tuerblatt}
              onChange={(e) => setTuerblatt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Richtwerte: CPL/weiß 70–100 €, furniert 300–450 €, Massivholz 400–650 €, Glas ab 130 €.
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Zarge (je Tür)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={10}
                value={zarge}
                onChange={(e) => setZarge(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Drücker/Beschlag</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={5}
                value={beschlag}
                onChange={(e) => setBeschlag(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Montage (je Tür)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={10}
              value={montage}
              onChange={(e) => setMontage(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Richtwert Montage je Innentür durch den Fachbetrieb: 50–150 €. 0 € = Eigenmontage.
          </span>
        </label>

        {/* Raumhoch / Sondermaß */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={raumhoch}
              onChange={(e) => setRaumhoch(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Raumhoch / Sondermaß (Aufpreis Türblatt)</span>
          </label>
          {raumhoch && (
            <label className="block mt-3">
              <span className="text-sm text-gray-600">Aufpreis auf das Türblatt</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={200}
                  step={5}
                  value={aufpreisProzent}
                  onChange={(e) => setAufpreisProzent(Math.min(200, toNumber(e.target.value)))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Türhöhe über 211 cm oder Sondermaß: typischer Aufpreis 30–80 % auf das Türblatt.
              </span>
            </label>
          )}
        </div>

        {/* Nebenkosten */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={nebenkostenAktiv}
              onChange={(e) => setNebenkostenAktiv(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Nebenkosten je Tür berücksichtigen</span>
          </label>
          {nebenkostenAktiv && (
            <label className="block mt-3">
              <span className="text-sm text-gray-600">
                Demontage/Entsorgung Alttür + Anfahrt + Material je Tür
              </span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={10}
                  value={nebenkostenProTuer}
                  onChange={(e) => setNebenkostenProTuer(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Richtwert je Tür: 50–200 € (Altür-Demontage, Entsorgung, anteilige Anfahrt, Kleinmaterial).
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Geschätzte Gesamtkosten</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(gesamt)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {formatEuro(anzahl)} {anzahl === 1 ? 'Tür' : 'Türen'} · {formatEuro(stueckpreis)} € je Tür
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Türblätter</span>
              <span className="font-bold">{formatEuro(summeTuerblatt)} €</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Zargen</span>
              <span className="font-bold">{formatEuro(summeZarge)} €</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Drücker/Beschlag</span>
              <span className="font-bold">{formatEuro(summeBeschlag)} €</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Montage</span>
              <span className="font-bold">{formatEuro(summeMontage)} €</span>
            </div>
          </div>
          {nebenkostenAktiv && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Nebenkosten</span>
                <span className="font-bold">{formatEuro(summeNebenkosten)} €</span>
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
            <strong>Stückpreis je Tür</strong> = Türblatt + Zarge + Beschlag + Montage
            {nebenkostenAktiv && ' + Nebenkosten'}
          </p>
          <p>
            = {formatEuro(tuerblattEffektiv)}
            {raumhoch && ` (inkl. ${formatEuro(aufpreisProzent)} % Aufpreis)`} + {formatEuro(zarge)} +{' '}
            {formatEuro(beschlag)} + {formatEuro(montage)}
            {nebenkostenAktiv && ` + ${formatEuro(nebenkosten)}`} ={' '}
            <strong>{formatEuro(stueckpreis)} €</strong>
          </p>
          <p>
            <strong>Gesamtkosten</strong> = {formatEuro(anzahl)} {anzahl === 1 ? 'Tür' : 'Türen'} ×{' '}
            {formatEuro(stueckpreis)} € = <strong>{formatEuro(gesamt)} €</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Dieser Rechner liefert eine <strong>unverbindliche
          Orientierung</strong>. Regionale Preise, Materialqualität und Handwerker-Angebote
          variieren stark – holen Sie für eine belastbare Kalkulation immer mehrere konkrete
          Angebote ein. Die DIN 18101 dient hier nur als Maß-/Normgrundlage, es erfolgt keine
          Statik- oder Sicherheitsberechnung. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default InnentuerenRechner;
