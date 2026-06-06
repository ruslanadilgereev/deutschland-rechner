import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Spezifische Wärmekapazität von Wasser: c = 4.190 J/(kg·K).
// Umgerechnet in Wattstunden: 4.190 ÷ 3.600 = 1,1639 Wh/(kg·K).
// Mit der Dichte von Wasser ~1 kg/l ergibt das den praktischen Faktor
// 1,163 Wh pro Liter und Kelvin Temperaturunterschied.
// Quelle: Energie-Lexikon (energie-lexikon.info/warmwasser.html).
const WH_PRO_LITER_KELVIN = 1.163; // Wh/(l·K)

// Energiepreis-Default Stand Juni 2026.
// Strom (Durchlauferhitzer/Wärmepumpe gemischt) und Gas liegen je nach
// Erzeuger weit auseinander. Wir nutzen einen runden, neutralen Mittelwert,
// den der Nutzer frei anpassen kann. Gas ~10–12 ct/kWh, Strom ~31–37 ct/kWh.
const ENERGIEPREIS_DEFAULT_CT = 12; // ct/kWh

// Verbrauchstypen: Liter Warmwasser pro Person und Tag (bezogen auf 60 °C
// Speichertemperatur) sowie empfohlene Speicherreserve pro Person.
// Richtwerte nach BauNetz Wissen / Energie-Lexikon (sparsam 20–30 l,
// mittel 40–50 l, hoch 50–70 l pro Person und Tag).
type Verbrauchstyp = {
  name: string;
  icon: string;
  literProPerson: number; // l/Person/Tag bei 60 °C
  speicherProPerson: number; // empfohlene Speicherreserve l/Person
  hinweis: string;
};

const TYPEN: Verbrauchstyp[] = [
  {
    name: 'Sparsam',
    icon: '💧',
    literProPerson: 25,
    speicherProPerson: 30,
    hinweis: 'kurze Duschen, wassersparende Armaturen',
  },
  {
    name: 'Mittel',
    icon: '🚿',
    literProPerson: 45,
    speicherProPerson: 40,
    hinweis: 'normaler Komfort, gelegentlich baden',
  },
  {
    name: 'Hoch',
    icon: '🛁',
    literProPerson: 60,
    speicherProPerson: 50,
    hinweis: 'häufig baden, lange/heiße Duschen',
  },
];

export function WarmwasserbedarfRechner() {
  const [typIndex, setTypIndex] = useState(1); // Default: Mittel
  const [personen, setPersonen] = useState(2);
  const [literProPerson, setLiterProPerson] = useState(TYPEN[1].literProPerson);
  const [speicherTemp, setSpeicherTemp] = useState(60);
  const [kaltwasserTemp, setKaltwasserTemp] = useState(10);
  const [energiepreisCt, setEnergiepreisCt] = useState(ENERGIEPREIS_DEFAULT_CT);
  const [wirkungsgrad, setWirkungsgrad] = useState(90); // % Nutzungsgrad der Anlage

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleTypWechsel = (index: number) => {
    setTypIndex(index);
    setLiterProPerson(TYPEN[index].literProPerson);
  };

  // 1) Täglicher Warmwasserbedarf (Liter pro Tag)
  const literProTag = personen * literProPerson;

  // 2) Temperaturdifferenz (Erwärmung von Kalt- auf Speichertemperatur)
  const deltaT = Math.max(0, speicherTemp - kaltwasserTemp);

  // 3) Energie zur Erwärmung: kWh/Tag = Liter × 1,163 Wh/(l·K) × dT ÷ 1.000
  const kwhProTagNetto = (literProTag * WH_PRO_LITER_KELVIN * deltaT) / 1000;

  // Anlagen-Nutzungsgrad berücksichtigt Bereitschafts- und Leitungsverluste.
  const wirkungsgradFaktor = wirkungsgrad > 0 ? wirkungsgrad / 100 : 1;
  const kwhProTagBrutto = kwhProTagNetto / wirkungsgradFaktor;

  const kwhProJahr = kwhProTagBrutto * 365;

  const preisProKwh = energiepreisCt / 100;
  const kostenProJahr = kwhProJahr * preisProKwh;
  const kostenProMonat = kostenProJahr / 12;

  // 4) Empfohlene Speichergröße: Personenzahl × komfortabhängige Reserve
  const speichergroesse = personen * TYPEN[typIndex].speicherProPerson;

  const formatZahl = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Warmwasserbedarf-Rechner" rechnerSlug="warmwasserbedarf-rechner" />

      {/* Verbrauchstyp-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Verbrauchstyp auswählen</span>
        <div className="grid grid-cols-3 gap-2">
          {TYPEN.map((t, i) => (
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
              <span className="text-[10px] text-gray-400 leading-tight">{t.literProPerson} l/P</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {TYPEN[typIndex].icon} {TYPEN[typIndex].name}: {TYPEN[typIndex].hinweis}.
        </p>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Personen im Haushalt</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={personen}
              onChange={(e) => setPersonen(Math.max(1, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Personen</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Warmwasser pro Person und Tag</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={literProPerson}
              onChange={(e) => setLiterProPerson(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">l/Tag</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Richtwert (60 °C): sparsam 20–30 l, mittel 40–50 l, hoch 50–70 l pro Person.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Speicher-/Zapftemperatur</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={speicherTemp}
              onChange={(e) => setSpeicherTemp(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°C</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Empfehlung: mindestens 60 °C im Speicher (Legionellenschutz, DVGW W 551).
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Kaltwassertemperatur</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={kaltwasserTemp}
              onChange={(e) => setKaltwasserTemp(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">°C</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Leitungswasser hat je nach Jahreszeit etwa 10–12 °C.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Energiepreis (ct/kWh)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={energiepreisCt}
              onChange={(e) => setEnergiepreisCt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">ct</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Gas ca. 10–12 ct/kWh, Strom ca. 31–37 ct/kWh (Stand Juni 2026, frei anpassbar).
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Nutzungsgrad der Anlage</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={1}
              max={100}
              value={wirkungsgrad}
              onChange={(e) => setWirkungsgrad(Math.min(100, Math.max(1, toNumber(e.target.value))))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Bereitschafts- und Leitungsverluste. Gas-Therme ca. 85–95 %, elektrisch nahe 100 %.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Ihr Warmwasserbedarf</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatZahl(literProTag)}</span>
            <span className="text-xl text-blue-200">Liter / Tag</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            bei {personen} {personen === 1 ? 'Person' : 'Personen'} × {formatZahl(literProPerson)} l/Tag
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Energiebedarf</span>
              <span className="text-xl font-bold">{formatZahl(kwhProJahr)} kWh / Jahr</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1 text-blue-200">
              <span>entspricht</span>
              <span>{formatZahl(kwhProTagBrutto)} kWh / Tag</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Energiekosten</span>
              <span className="text-xl font-bold">{formatEuro(kostenProJahr)} € / Jahr</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1 text-blue-200">
              <span>pro Monat</span>
              <span>{formatEuro(kostenProMonat)} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Empfohlene Speichergröße</span>
              <span className="text-xl font-bold">ca. {formatZahl(speichergroesse)} Liter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Warmwasser/Tag</strong> = Personen × Liter pro Person
          </p>
          <p>
            = {personen} × {formatZahl(literProPerson)} l = <strong>{formatZahl(literProTag)} l/Tag</strong>
          </p>
          <p>
            <strong>Energie/Tag</strong> = Liter × 1,163 Wh/(l·K) × Δt ÷ 1.000 ÷ Nutzungsgrad
          </p>
          <p>
            = {formatZahl(literProTag)} × 1,163 × ({formatZahl(speicherTemp)} − {formatZahl(kaltwasserTemp)}) ÷ 1.000 ÷ {formatZahl(wirkungsgradFaktor)} ={' '}
            <strong>{formatZahl(kwhProTagBrutto)} kWh/Tag</strong>
          </p>
          <p>
            <strong>Energie/Jahr</strong> = {formatZahl(kwhProTagBrutto)} × 365 = <strong>{formatZahl(kwhProJahr)} kWh</strong>
          </p>
          <p>
            <strong>Kosten/Jahr</strong> = {formatZahl(kwhProJahr)} kWh × {formatEuro(preisProKwh)} € ={' '}
            <strong>{formatEuro(kostenProJahr)} €</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Ergebnisse sind Richtwerte aus Faustformeln und ersetzen keine
          Fachplanung. Die verbindliche Auslegung von Speicher und Heizleistung erfolgt nach
          <strong> DIN 4708</strong> bzw. <strong>DIN EN 12831-3</strong> durch einen Fachplaner oder
          SHK-Betrieb. Aus Hygienegründen sollte Trinkwarmwasser im Speicher mindestens
          <strong> 60 °C</strong> erreichen (Legionellenschutz nach DVGW W 551). Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default WarmwasserbedarfRechner;
