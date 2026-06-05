import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Kalorienverbrauch nach der MET-Methode
// Formel: kcal = MET × Körpergewicht (kg) × Dauer (h)
// MET-Werte: Compendium of Physical Activities (Ainsworth et al., 2011 / 2024 Adult Compendium)
// 1 MET = 1 kcal pro kg Körpergewicht pro Stunde = Energieumsatz in Ruhe
// Quelle: https://pacompendium.com/ und https://cdn.lmu-klinikum.de (LMU Klinikum MET-Tabelle)

interface Aktivitaet {
  name: string;
  met: number;
  gruppe: string;
}

const AKTIVITAETEN: Aktivitaet[] = [
  // Gehen & Wandern
  { name: 'Gehen, gemütlich (ca. 4 km/h)', met: 2.8, gruppe: 'Gehen & Wandern' },
  { name: 'Gehen, normal (ca. 5 km/h)', met: 3.5, gruppe: 'Gehen & Wandern' },
  { name: 'Gehen, zügig (ca. 6,4 km/h)', met: 5.0, gruppe: 'Gehen & Wandern' },
  { name: 'Walking / Nordic Walking', met: 6.0, gruppe: 'Gehen & Wandern' },
  { name: 'Wandern (Gelände, mittel)', met: 6.0, gruppe: 'Gehen & Wandern' },
  { name: 'Bergwandern (mit Rucksack)', met: 7.8, gruppe: 'Gehen & Wandern' },
  { name: 'Treppensteigen', met: 8.0, gruppe: 'Gehen & Wandern' },
  // Laufen
  { name: 'Joggen, langsam (ca. 8 km/h)', met: 8.0, gruppe: 'Laufen' },
  { name: 'Laufen (ca. 9,7 km/h)', met: 9.8, gruppe: 'Laufen' },
  { name: 'Laufen, zügig (ca. 11,3 km/h)', met: 11.0, gruppe: 'Laufen' },
  { name: 'Laufen, schnell (ca. 12,9 km/h)', met: 11.8, gruppe: 'Laufen' },
  // Radfahren
  { name: 'Radfahren, gemütlich (< 16 km/h)', met: 4.0, gruppe: 'Radfahren' },
  { name: 'Radfahren, moderat (16–19 km/h)', met: 6.8, gruppe: 'Radfahren' },
  { name: 'Radfahren, zügig (19–22 km/h)', met: 8.0, gruppe: 'Radfahren' },
  { name: 'Radfahren, schnell (22–25 km/h)', met: 10.0, gruppe: 'Radfahren' },
  { name: 'Spinning / Indoor-Cycling', met: 8.5, gruppe: 'Radfahren' },
  // Schwimmen & Wassersport
  { name: 'Schwimmen, gemütlich', met: 6.0, gruppe: 'Schwimmen & Wasser' },
  { name: 'Schwimmen, Brust (moderat)', met: 5.3, gruppe: 'Schwimmen & Wasser' },
  { name: 'Schwimmen, Kraul (zügig)', met: 8.3, gruppe: 'Schwimmen & Wasser' },
  { name: 'Aquafitness / Wassergymnastik', met: 5.5, gruppe: 'Schwimmen & Wasser' },
  // Kraft & Fitness
  { name: 'Krafttraining, leicht/moderat', met: 3.5, gruppe: 'Kraft & Fitness' },
  { name: 'Krafttraining, intensiv', met: 6.0, gruppe: 'Kraft & Fitness' },
  { name: 'Zirkeltraining', met: 8.0, gruppe: 'Kraft & Fitness' },
  { name: 'Crosstrainer / Ellipsentrainer', met: 5.0, gruppe: 'Kraft & Fitness' },
  { name: 'Rudergerät, moderat', met: 7.0, gruppe: 'Kraft & Fitness' },
  { name: 'Aerobic (Low Impact)', met: 5.0, gruppe: 'Kraft & Fitness' },
  { name: 'Aerobic (High Impact)', met: 7.3, gruppe: 'Kraft & Fitness' },
  { name: 'Seilspringen', met: 11.0, gruppe: 'Kraft & Fitness' },
  { name: 'Yoga (Hatha)', met: 2.5, gruppe: 'Kraft & Fitness' },
  { name: 'Yoga (Power / Vinyasa)', met: 4.0, gruppe: 'Kraft & Fitness' },
  { name: 'Pilates', met: 3.0, gruppe: 'Kraft & Fitness' },
  { name: 'Dehnen / Stretching', met: 2.3, gruppe: 'Kraft & Fitness' },
  // Ballsport & Spiele
  { name: 'Fußball (Freizeit)', met: 7.0, gruppe: 'Ballsport & Spiele' },
  { name: 'Fußball (Wettkampf)', met: 10.0, gruppe: 'Ballsport & Spiele' },
  { name: 'Basketball (Spiel)', met: 6.5, gruppe: 'Ballsport & Spiele' },
  { name: 'Volleyball (Freizeit)', met: 4.0, gruppe: 'Ballsport & Spiele' },
  { name: 'Tennis (Einzel)', met: 8.0, gruppe: 'Ballsport & Spiele' },
  { name: 'Tennis (Doppel)', met: 6.0, gruppe: 'Ballsport & Spiele' },
  { name: 'Tischtennis', met: 4.0, gruppe: 'Ballsport & Spiele' },
  { name: 'Badminton (Freizeit)', met: 5.5, gruppe: 'Ballsport & Spiele' },
  { name: 'Golf (zu Fuß)', met: 4.8, gruppe: 'Ballsport & Spiele' },
  // Tanzen & Sonstiges
  { name: 'Tanzen (gesellig, langsam)', met: 3.0, gruppe: 'Tanzen & Sonstiges' },
  { name: 'Tanzen (schnell, Zumba)', met: 7.3, gruppe: 'Tanzen & Sonstiges' },
  { name: 'Skifahren (alpin, moderat)', met: 5.3, gruppe: 'Tanzen & Sonstiges' },
  { name: 'Langlauf (moderat)', met: 9.0, gruppe: 'Tanzen & Sonstiges' },
  { name: 'Reiten (Trab)', met: 5.8, gruppe: 'Tanzen & Sonstiges' },
  { name: 'Klettern / Bouldern', met: 8.0, gruppe: 'Tanzen & Sonstiges' },
  { name: 'Kampfsport (z. B. Karate, Judo)', met: 10.3, gruppe: 'Tanzen & Sonstiges' },
  // Alltag & Haushalt
  { name: 'Hausarbeit / Putzen (allgemein)', met: 3.3, gruppe: 'Alltag & Haushalt' },
  { name: 'Staubsaugen', met: 3.3, gruppe: 'Alltag & Haushalt' },
  { name: 'Fenster putzen', met: 3.5, gruppe: 'Alltag & Haushalt' },
  { name: 'Gartenarbeit (allgemein)', met: 4.0, gruppe: 'Alltag & Haushalt' },
  { name: 'Rasen mähen (Handmäher)', met: 5.5, gruppe: 'Alltag & Haushalt' },
  { name: 'Einkaufen / Tragen', met: 3.5, gruppe: 'Alltag & Haushalt' },
];

const GRUPPEN = [
  'Gehen & Wandern',
  'Laufen',
  'Radfahren',
  'Schwimmen & Wasser',
  'Kraft & Fitness',
  'Ballsport & Spiele',
  'Tanzen & Sonstiges',
  'Alltag & Haushalt',
];

export default function KalorienverbrauchRechner() {
  const [aktivitaetName, setAktivitaetName] = useState('Joggen, langsam (ca. 8 km/h)');
  const [gewicht, setGewicht] = useState(75);
  const [dauer, setDauer] = useState(45); // Minuten

  const aktivitaet = AKTIVITAETEN.find((a) => a.name === aktivitaetName) ?? AKTIVITAETEN[0];
  const dauerStunden = dauer / 60;
  const kcal = Math.round(aktivitaet.met * gewicht * dauerStunden);
  // Effektiver Verbrauch über dem Grundumsatz (Netto): MET − 1 (in Ruhe wären es 1 MET)
  const kcalNetto = Math.round(Math.max(0, (aktivitaet.met - 1) * gewicht * dauerStunden));
  const kcalProMinute = dauer > 0 ? (kcal / dauer).toFixed(1) : '0';

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Kalorienverbrauch-Rechner" rechnerSlug="kalorienverbrauch-rechner" />

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-6">
        {/* Aktivität */}
        <label className="block">
          <span className="text-gray-700 font-medium">Aktivität / Sportart</span>
          <select
            value={aktivitaetName}
            onChange={(e) => setAktivitaetName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none bg-white"
          >
            {GRUPPEN.map((gruppe) => (
              <optgroup key={gruppe} label={gruppe}>
                {AKTIVITAETEN.filter((a) => a.gruppe === gruppe).map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} · {a.met.toLocaleString('de-DE')} MET
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        {/* Gewicht */}
        <label className="block">
          <div className="flex justify-between items-baseline">
            <span className="text-gray-700 font-medium">Körpergewicht</span>
            <span className="text-orange-600 font-bold">{gewicht} kg</span>
          </div>
          <input
            type="range"
            min={40}
            max={150}
            step={1}
            value={gewicht}
            onChange={(e) => setGewicht(Number(e.target.value))}
            className="mt-3 w-full accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>40 kg</span>
            <span>150 kg</span>
          </div>
        </label>

        {/* Dauer */}
        <label className="block">
          <div className="flex justify-between items-baseline">
            <span className="text-gray-700 font-medium">Dauer</span>
            <span className="text-orange-600 font-bold">{dauer} Min.</span>
          </div>
          <input
            type="range"
            min={5}
            max={240}
            step={5}
            value={dauer}
            onChange={(e) => setDauer(Number(e.target.value))}
            className="mt-3 w-full accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5 Min.</span>
            <span>4 Std.</span>
          </div>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-orange-100 mb-1">Geschätzter Kalorienverbrauch</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{kcal.toLocaleString('de-DE')}</span>
            <span className="text-xl text-orange-200">kcal</span>
          </div>
          <p className="text-orange-100 text-sm mt-1">
            bei {dauer} Min. {aktivitaet.name}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-orange-100 text-xs mb-1">Pro Minute</p>
            <p className="text-lg font-bold">{kcalProMinute} kcal</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-orange-100 text-xs mb-1">Netto (über Grundumsatz)</p>
            <p className="text-lg font-bold">{kcalNetto.toLocaleString('de-DE')} kcal</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm mt-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-orange-100">MET-Wert dieser Aktivität</span>
            <span className="font-bold">{aktivitaet.met.toLocaleString('de-DE')} MET</span>
          </div>
        </div>
      </div>

      {/* Formel-Erklärung */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 font-mono">
          kcal = MET × Gewicht (kg) × Dauer (h)
        </div>
        <p className="text-sm text-gray-600 mt-3">
          In Ihrem Fall: {aktivitaet.met.toLocaleString('de-DE')} MET × {gewicht} kg ×{' '}
          {dauerStunden.toLocaleString('de-DE', { maximumFractionDigits: 2 })} h ={' '}
          <strong>{kcal.toLocaleString('de-DE')} kcal</strong>
        </p>
        <p className="text-xs text-gray-500 mt-3">
          Ein <strong>MET</strong> (metabolisches Äquivalent) entspricht dem Energieumsatz in völliger
          Ruhe – rund 1 kcal pro Kilogramm Körpergewicht und Stunde. Ein Wert von 8 MET bedeutet also
          den achtfachen Ruheumsatz.
        </p>
      </div>

      {/* YMYL-Disclaimer */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">⚠️</span>
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Hinweis: Schätzwerte ohne medizinische Garantie</p>
            <p>
              Der tatsächliche Kalorienverbrauch hängt stark von Trainingszustand, Alter, Geschlecht,
              Muskelmasse und Intensität ab und kann um 15–25 % von diesem Durchschnittswert abweichen.
              Die Werte ersetzen keine ärztliche oder ernährungswissenschaftliche Beratung. Bei
              Vorerkrankungen oder vor Beginn eines intensiven Trainings halten Sie bitte Rücksprache
              mit Ihrer Ärztin oder Ihrem Arzt.
            </p>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://pacompendium.com/adult-compendium/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            2024 Adult Compendium of Physical Activities – MET-Werte
          </a>
          <a
            href="https://www.dge.de/wissenschaft/referenzwerte/energie/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Gesellschaft für Ernährung (DGE) – Energiebedarf
          </a>
        </div>
      </div>
    </div>
  );
}
