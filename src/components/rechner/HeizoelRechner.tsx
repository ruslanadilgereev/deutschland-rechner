import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Heizölpreis-Default Stand Juni 2026 (leichtes Heizöl EL, brutto pro Liter).
// Quelle: Statista Monatsdurchschnittswerte / co2online. Der Preis ist volatil –
// der Nutzer kann seinen aktuellen Literpreis jederzeit anpassen.
const HEIZOELPREIS_DEFAULT = 1.1; // €/Liter

// Spezifischer Heizölverbrauch je Gebäudealter/Sanierungsstand (Liter pro m² und Jahr,
// inklusive Warmwasser). Quelle: co2online, heizung.de. Werte sind Richtwerte.
type GebaeudeVoreinstellung = {
  name: string;
  icon: string;
  literProM2: number;
};

const GEBAEUDE: GebaeudeVoreinstellung[] = [
  { name: 'Altbau vor 1977', icon: '🏚️', literProM2: 20 },
  { name: 'Baujahr 1977–2002', icon: '🏠', literProM2: 15 },
  { name: 'Saniert / KfW 70', icon: '🔧', literProM2: 10 },
  { name: 'Neubau / sehr gut gedämmt', icon: '🏡', literProM2: 6 },
];

export function HeizoelRechner() {
  const [gebaeudeIndex, setGebaeudeIndex] = useState(1);
  const [wohnflaeche, setWohnflaeche] = useState(130);
  const [literProM2, setLiterProM2] = useState(GEBAEUDE[1].literProM2);
  const [warmwasser, setWarmwasser] = useState(true);
  const [heizoelpreis, setHeizoelpreis] = useState(HEIZOELPREIS_DEFAULT);
  const [tankvorrat, setTankvorrat] = useState(3000);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleGebaeudeWechsel = (index: number) => {
    setGebaeudeIndex(index);
    setLiterProM2(GEBAEUDE[index].literProM2);
  };

  // Wird das Warmwasser nicht über die Ölheizung erzeugt, entfällt grob der
  // Warmwasser-Anteil – die Heizung allein macht rund 85 % aus.
  const heizungsAnteil = warmwasser ? 1 : 0.85;

  const jahresverbrauch = wohnflaeche * literProM2 * heizungsAnteil; // Liter/Jahr
  const kostenProJahr = jahresverbrauch * heizoelpreis;
  const kostenProMonat = kostenProJahr / 12;

  // 1 Liter Heizöl EL entspricht rund 10 kWh Energiegehalt.
  const energieKwh = jahresverbrauch * 10;

  // Reichweite des aktuellen Tankvorrats in Monaten und empfohlener Bestellzeitpunkt
  // (rund 8 Wochen = 1,85 Monate Puffer vor dem rechnerischen Leerstand).
  const verbrauchProMonat = jahresverbrauch / 12;
  const reichweiteMonate = verbrauchProMonat > 0 ? tankvorrat / verbrauchProMonat : 0;
  const bestellMonate = Math.max(0, reichweiteMonate - 8 / 4.345);

  const fmt0 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmt1 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const fmtEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Heizöl-Verbrauch-Rechner" rechnerSlug="heizoel-rechner" />

      {/* Gebäude-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Gebäudezustand wählen</span>
        <div className="grid grid-cols-2 gap-2">
          {GEBAEUDE.map((g, i) => (
            <button
              key={g.name}
              onClick={() => handleGebaeudeWechsel(i)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                gebaeudeIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{g.icon}</span>
              <span className="text-left leading-tight">{g.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Wohnfläche</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={wohnflaeche}
              onChange={(e) => setWohnflaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Spez. Verbrauch (Liter pro m² und Jahr)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={literProM2}
              onChange={(e) => setLiterProM2(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">l/m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Richtwerte: Altbau ~20, Baujahr 1977–2002 ~15, saniert ~10, Neubau ~6 l/m². Über die Buttons oben voreingestellt.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Heizölpreis</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={heizoelpreis}
              onChange={(e) => setHeizoelpreis(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/l</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Voreinstellung 1,10 €/l (Stand Juni 2026, inkl. CO₂-Abgabe). Der Preis ist stark schwankend.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Aktueller Tankvorrat (für Reichweite)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={tankvorrat}
              onChange={(e) => setTankvorrat(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Liter</span>
          </div>
        </label>

        {/* Warmwasser */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={warmwasser}
              onChange={(e) => setWarmwasser(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Warmwasser wird über die Ölheizung erzeugt</span>
          </label>
          <span className="text-xs text-gray-400 mt-1 block">
            Ohne Warmwasser über Öl rechnet der Rechner nur den Heizungsanteil (rund 85 %).
          </span>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Geschätzter Heizölverbrauch</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt0(jahresverbrauch)}</span>
            <span className="text-xl text-blue-200">Liter / Jahr</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Heizölkosten rund {fmtEuro(kostenProJahr)} € pro Jahr ({fmtEuro(kostenProMonat)} € / Monat)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Energiemenge</span>
              <span className="text-xl font-bold">{fmt0(energieKwh)} kWh</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Reichweite Tankvorrat</span>
              <span className="font-bold">{fmt1(reichweiteMonate)} Monate</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-blue-200">Nachbestellen nach ca.</span>
              <span className="font-bold">{fmt1(bestellMonate)} Monaten</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Verbrauch</strong> = Wohnfläche × spez. Verbrauch{!warmwasser && ' × 0,85'} ={' '}
            {fmt0(wohnflaeche)} m² × {fmt1(literProM2)} l/m²{!warmwasser && ' × 0,85'} ={' '}
            <strong>{fmt0(jahresverbrauch)} l/Jahr</strong>
          </p>
          <p>
            <strong>Kosten</strong> = Liter × Heizölpreis = {fmt0(jahresverbrauch)} l ×{' '}
            {fmtEuro(heizoelpreis)} € = <strong>{fmtEuro(kostenProJahr)} €</strong>
          </p>
          <p>
            <strong>Energie</strong> = Liter × 10 kWh/l = <strong>{fmt0(energieKwh)} kWh</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Dies ist eine Schätzung anhand des spezifischen Verbrauchs pro
          Quadratmeter. Der tatsächliche Verbrauch hängt von Heizverhalten, Witterung und Anlagentechnik
          ab. Der Heizölpreis ist stark schwankend (Voreinstellung Stand Juni 2026). Eine genaue
          Verbrauchsermittlung gelingt nur über Tankquittungen bzw. Zählerstände. Keine Energieberatung,
          Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default HeizoelRechner;
