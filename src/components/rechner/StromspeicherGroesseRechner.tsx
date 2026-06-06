import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Speicherpreis-Default Stand 2026 (nutzbare kWh, inkl. Wechselrichter/Installation).
// Quelle: Marktdaten Heimspeicher Deutschland 2026 (~440-800 EUR/kWh). Wir nutzen
// einen runden Mittelwert von 500 EUR/kWh als Voreinstellung – frei anpassbar.
const SPEICHERPREIS_DEFAULT = 500; // EUR pro nutzbare kWh

// Strompreis-Default Stand 2026 (fuer die Einordnung der Wirtschaftlichkeit).
const STROMPREIS_DEFAULT_CT = 32; // ct/kWh

// Entladetiefe (Depth of Discharge) – moderne LiFePO4-Speicher ~90-95 %.
const DOD_DEFAULT = 0.9;

// Typische Haushaltsprofile als Voreinstellungen.
// Verbrauchs-Richtwerte: 1 Person ~1.500 kWh, 2 Personen ~2.500 kWh,
// 3-4 Personen EFH ~4.000-4.500 kWh, 5+ Personen ~6.000 kWh (Stand 2026).
type HaushaltVoreinstellung = {
  name: string;
  icon: string;
  verbrauch: number; // kWh/Jahr
  kwp: number; // PV-Leistung
};

const HAUSHALTE: HaushaltVoreinstellung[] = [
  { name: '1 Person', icon: '🧍', verbrauch: 1800, kwp: 4 },
  { name: '2 Personen', icon: '👫', verbrauch: 2800, kwp: 5 },
  { name: '3–4 Pers. EFH', icon: '👨‍👩‍👧', verbrauch: 4500, kwp: 8 },
  { name: '5+ Personen', icon: '👨‍👩‍👧‍👦', verbrauch: 6000, kwp: 10 },
  { name: 'Großes EFH', icon: '🏡', verbrauch: 7500, kwp: 12 },
  { name: 'Eigene Eingabe', icon: '🔧', verbrauch: 4000, kwp: 6 },
];

export function StromspeicherGroesseRechner() {
  const [profilIndex, setProfilIndex] = useState(2);
  const [verbrauch, setVerbrauch] = useState(HAUSHALTE[2].verbrauch);
  const [kwp, setKwp] = useState(HAUSHALTE[2].kwp);
  const [speicherpreis, setSpeicherpreis] = useState(SPEICHERPREIS_DEFAULT);
  const [strompreisCt, setStrompreisCt] = useState(STROMPREIS_DEFAULT_CT);
  const [dod, setDod] = useState(DOD_DEFAULT);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleProfilWechsel = (index: number) => {
    setProfilIndex(index);
    const h = HAUSHALTE[index];
    setVerbrauch(h.verbrauch);
    setKwp(h.kwp);
  };

  // Verbrauch in Tausend kWh (Basis fuer die Faustformeln).
  const vk = verbrauch / 1000;

  // Empfohlene nutzbare Kapazitaet als MIN aus Verbrauchs- und PV-Deckel.
  const untergrenze = Math.min(vk * 1.0, kwp * 1.0);
  const obergrenze = Math.min(vk * 1.5, kwp * 1.5);

  // Default-Empfehlung: Mittel aus Verbrauchs- und PV-Faustwert, gerundet,
  // praktisch begrenzt auf 3-15 kWh (EFH-Bereich).
  const empfehlungRoh = Math.round((vk * 1.0 + kwp * 1.0) / 2);
  const nutzbar = Math.max(3, Math.min(15, empfehlungRoh));

  // Brutto-Kapazitaet beruecksichtigt die Entladetiefe.
  const sichererDod = dod > 0 ? dod : DOD_DEFAULT;
  const brutto = nutzbar / sichererDod;

  // Verhaeltniszahlen fuer die Autarkie-/Eigenverbrauchs-Naeherung.
  const r_pv = vk > 0 ? kwp / vk : 0;
  const r_sp = vk > 0 ? nutzbar / vk : 0;

  // Naeherungen (an HTW-Simulationstabellen kalibriert) – grobe Orientierung.
  const autarkie = vk > 0
    ? Math.min(0.9, 0.3 + 0.18 * Math.log(1 + r_sp) + 0.22 * Math.log(1 + r_pv))
    : 0;
  const eigenverbrauch = vk > 0
    ? Math.min(0.9, 0.25 + (0.2 * Math.log(1 + r_sp)) / Math.max(1, r_pv))
    : 0;

  // Kosten = Brutto-Kapazitaet x Speicherpreis (pro nutzbare kWh).
  const kosten = brutto * speicherpreis;

  const formatKwh = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatProzent = (v: number) =>
    (v * 100).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Stromspeicher-Rechner" rechnerSlug="stromspeicher-groesse-rechner" />

      {/* Haushalts-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Haushalt auswählen</span>
        <div className="grid grid-cols-3 gap-2">
          {HAUSHALTE.map((h, i) => (
            <button
              key={h.name}
              onClick={() => handleProfilWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                profilIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{h.icon}</span>
              <span className="text-center leading-tight">{h.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Jahresstromverbrauch (kWh/Jahr)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={verbrauch}
              onChange={(e) => setVerbrauch(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kWh</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Steht auf Ihrer Stromrechnung. Richtwert: 1 Person ca. 1.800 kWh, EFH mit 4 Personen ca. 4.500 kWh.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">PV-Anlagenleistung (kWp)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={kwp}
              onChange={(e) => setKwp(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kWp</span>
          </div>
          <span className="text-xs text-gray-400 bg-blue-50 mt-1 block px-2 py-1 rounded">
            Faustregel-Anhalt: rund 1 kWp je 1.000 kWh Jahresverbrauch, beim Einfamilienhaus oft 7–12 kWp.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Speicherpreis (€/kWh nutzbar)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={10}
              value={speicherpreis}
              onChange={(e) => setSpeicherpreis(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Voreinstellung 500 €/kWh inkl. Wechselrichter/Installation. 2026 marktüblich rund 440–800 €/kWh.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Strompreis (ct/kWh)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={strompreisCt}
              onChange={(e) => setStrompreisCt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">ct</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Für die Einordnung der Ersparnis. Voreinstellung 32 ct/kWh.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Entladetiefe / DoD</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0.5}
              max={1}
              step={0.01}
              value={dod}
              onChange={(e) => setDod(Math.min(1, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">×</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Nutzbarer Anteil der Bruttokapazität. Moderne LiFePO4-Speicher: 0,90–0,95.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Empfohlene Speichergröße</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatKwh(nutzbar)}</span>
            <span className="text-xl text-blue-200">kWh nutzbar</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            sinnvoller Bereich {formatKwh(untergrenze)}–{formatKwh(obergrenze)} kWh nutzbar
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Brutto-Kapazität (bei DoD {formatKwh(sichererDod)})</span>
              <span className="text-xl font-bold">{formatKwh(brutto)} kWh</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">geschätzte Investition</span>
              <span className="text-xl font-bold">ca. {formatEuro(kosten)} €</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center">
              <div className="text-2xl font-bold">≈ {formatProzent(autarkie)} %</div>
              <div className="text-blue-100 text-xs mt-1">Autarkiegrad (Näherung)</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center">
              <div className="text-2xl font-bold">≈ {formatProzent(eigenverbrauch)} %</div>
              <div className="text-blue-100 text-xs mt-1">Eigenverbrauch (Näherung)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Empfehlung (nutzbar)</strong> = Mittel aus Verbrauchs- und PV-Faustwert
          </p>
          <p>
            = ({formatKwh(verbrauch)} kWh ÷ 1.000 + {formatKwh(kwp)} kWp) ÷ 2 ≈{' '}
            <strong>{formatKwh(nutzbar)} kWh</strong> (begrenzt auf 3–15 kWh)
          </p>
          <p>
            <strong>Brutto</strong> = nutzbar ÷ DoD = {formatKwh(nutzbar)} ÷ {formatKwh(sichererDod)} ={' '}
            <strong>{formatKwh(brutto)} kWh</strong>
          </p>
          <p>
            <strong>Kosten</strong> = Brutto × Speicherpreis = {formatKwh(brutto)} kWh × {formatEuro(speicherpreis)} € ≈{' '}
            <strong>{formatEuro(kosten)} €</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Dies sind <strong>Orientierungswerte auf Faustformel-Basis</strong>,
          keine Fachplanung. Autarkiegrad und Eigenverbrauchsanteil sind <strong>Näherungen</strong> – die
          exakten Werte hängen vom individuellen Lastprofil ab und werden simulationsbasiert ermittelt (z. B. mit
          dem Unabhängigkeitsrechner der HTW Berlin). Die tatsächliche Auslegung und Wirtschaftlichkeit Ihres
          Speichers sollten Sie über einen Fachbetrieb klären. Keine Renditeversprechen, keine Energieberatung –
          Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default StromspeicherGroesseRechner;
