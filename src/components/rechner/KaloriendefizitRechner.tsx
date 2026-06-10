import { useState } from 'react';

// Kaloriendefizit-Rechner
// Grundumsatz (BMR) nach Mifflin-St-Jeor (1990):
//   Mann:  10 * kg + 6,25 * cm - 5 * Alter + 5
//   Frau:  10 * kg + 6,25 * cm - 5 * Alter - 161
// Gesamtumsatz (TDEE) = BMR * PAL
// 1 kg Körperfett entspricht ca. 7700 kcal gespeicherter Energie
// Quellen:
//   https://www.dge.de/gesunde-ernaehrung/faq/energiezufuhr/
//   https://eatsmarter.de/ernaehrung/ernaehrungsmythen/kilo-fett-7000-kalorien
const KCAL_PRO_KG_FETT = 7700;
const MIN_KCAL_FRAU = 1200;
const MIN_KCAL_MANN = 1500;

type Geschlecht = 'mann' | 'frau';

interface PalOption {
  wert: number;
  label: string;
  beschreibung: string;
}

const PAL_OPTIONEN: PalOption[] = [
  { wert: 1.2, label: 'Sitzend / kaum Bewegung', beschreibung: 'Bürojob, fast kein Sport, viel Sitzen' },
  { wert: 1.4, label: 'Leicht aktiv', beschreibung: 'Sitzende Tätigkeit, gelegentlich Spaziergänge' },
  { wert: 1.55, label: 'Mäßig aktiv', beschreibung: 'Büro + 2–3× Sport pro Woche' },
  { wert: 1.7, label: 'Aktiv', beschreibung: 'Stehende Arbeit oder fast tägliches Training' },
  { wert: 1.9, label: 'Sehr aktiv', beschreibung: 'Körperliche Arbeit oder Leistungssport' },
];

const TEMPO_OPTIONEN = [
  { wert: 0.25, label: 'Langsam', beschreibung: '0,25 kg / Woche' },
  { wert: 0.5, label: 'Moderat', beschreibung: '0,5 kg / Woche' },
  { wert: 0.75, label: 'Ambitioniert', beschreibung: '0,75 kg / Woche' },
];

export default function KaloriendefizitRechner() {
  const [geschlecht, setGeschlecht] = useState<Geschlecht>('frau');
  const [alter, setAlter] = useState(30);
  const [groesse, setGroesse] = useState(170);
  const [gewicht, setGewicht] = useState(80);
  const [zielgewicht, setZielgewicht] = useState(70);
  const [pal, setPal] = useState(1.4);
  const [tempo, setTempo] = useState(0.5);

  // Grundumsatz (BMR) nach Mifflin-St-Jeor
  const bmr =
    10 * gewicht +
    6.25 * groesse -
    5 * alter +
    (geschlecht === 'mann' ? 5 : -161);

  // Gesamtumsatz (TDEE)
  const tdee = bmr * pal;

  // Tägliches Defizit aus dem gewählten Tempo
  const taeglichesDefizit = (tempo * KCAL_PRO_KG_FETT) / 7;

  // Empfohlene Kalorien pro Tag (gerundet auf 10)
  const empfohlenRoh = tdee - taeglichesDefizit;
  const minKcal = geschlecht === 'mann' ? MIN_KCAL_MANN : MIN_KCAL_FRAU;
  const unterGrenze = empfohlenRoh < minKcal;
  const empfohlen = Math.round(Math.max(empfohlenRoh, minKcal) / 10) * 10;

  // Tatsächliches Defizit nach Anwendung der Untergrenze
  const tatsaechlichesDefizit = Math.max(0, Math.round(tdee - empfohlen));

  // Abzunehmende Kilo & geschätzte Dauer
  const abzunehmen = Math.max(0, gewicht - zielgewicht);
  const istZielErreicht = abzunehmen <= 0;
  // Dauer auf Basis des tatsächlichen (ggf. gekappten) Defizits
  const kgProWocheEffektiv =
    tatsaechlichesDefizit > 0 ? (tatsaechlichesDefizit * 7) / KCAL_PRO_KG_FETT : 0;
  const dauerWochen =
    kgProWocheEffektiv > 0 ? Math.ceil(abzunehmen / kgProWocheEffektiv) : 0;
  const dauerMonate = dauerWochen > 0 ? (dauerWochen / 4.345).toFixed(1) : '0';

  const fmt = (n: number) => Math.round(n).toLocaleString('de-DE');

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Geschlecht */}
        <div className="mb-5">
          <span className="text-gray-700 font-medium block mb-2">Geschlecht</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGeschlecht('frau')}
              className={`py-3 rounded-xl font-medium transition-all ${
                geschlecht === 'frau'
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Frau
            </button>
            <button
              onClick={() => setGeschlecht('mann')}
              className={`py-3 rounded-xl font-medium transition-all ${
                geschlecht === 'mann'
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mann
            </button>
          </div>
        </div>

        {/* Alter */}
        <label className="block mb-5">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-gray-700 font-medium">Alter</span>
            <span className="text-blue-600 font-bold">{alter} Jahre</span>
          </div>
          <input
            type="range"
            min={16}
            max={90}
            value={alter}
            onChange={(e) => setAlter(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </label>

        {/* Größe */}
        <label className="block mb-5">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-gray-700 font-medium">Größe</span>
            <span className="text-blue-600 font-bold">{groesse} cm</span>
          </div>
          <input
            type="range"
            min={140}
            max={210}
            value={groesse}
            onChange={(e) => setGroesse(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </label>

        {/* Gewicht */}
        <label className="block mb-5">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-gray-700 font-medium">Aktuelles Gewicht</span>
            <span className="text-blue-600 font-bold">{gewicht} kg</span>
          </div>
          <input
            type="range"
            min={40}
            max={180}
            value={gewicht}
            onChange={(e) => {
              const v = Number(e.target.value);
              setGewicht(v);
              if (zielgewicht > v) setZielgewicht(v);
            }}
            className="w-full accent-blue-500"
          />
        </label>

        {/* Zielgewicht */}
        <label className="block mb-5">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-gray-700 font-medium">Zielgewicht</span>
            <span className="text-blue-600 font-bold">{zielgewicht} kg</span>
          </div>
          <input
            type="range"
            min={40}
            max={gewicht}
            value={zielgewicht}
            onChange={(e) => setZielgewicht(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </label>

        {/* Aktivität (PAL) */}
        <div className="mb-5">
          <span className="text-gray-700 font-medium block mb-2">Aktivitätslevel</span>
          <div className="space-y-2">
            {PAL_OPTIONEN.map((opt) => (
              <button
                key={opt.wert}
                onClick={() => setPal(opt.wert)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${
                  pal === opt.wert
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-gray-50 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{opt.label}</span>
                  <span className="text-xs font-mono text-gray-500">PAL {opt.wert.toLocaleString('de-DE')}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{opt.beschreibung}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tempo */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Abnehm-Tempo</span>
          <div className="grid grid-cols-3 gap-2">
            {TEMPO_OPTIONEN.map((opt) => (
              <button
                key={opt.wert}
                onClick={() => setTempo(opt.wert)}
                className={`px-2 py-3 rounded-xl text-center transition-all border ${
                  tempo === opt.wert
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-gray-50 border-transparent hover:bg-gray-100'
                }`}
              >
                <span className="block font-medium text-gray-800 text-sm">{opt.label}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{opt.beschreibung}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-emerald-100 mb-1">Empfohlene Kalorienzufuhr zum Abnehmen</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(empfohlen)}</span>
            <span className="text-xl text-emerald-100">kcal / Tag</span>
          </div>
          <p className="text-emerald-100 text-sm mt-1">
            bei einem Defizit von {fmt(tatsaechlichesDefizit)} kcal/Tag
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-emerald-100 text-xs mb-1">Grundumsatz (BMR)</p>
            <p className="text-lg font-bold">{fmt(bmr)} kcal</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-emerald-100 text-xs mb-1">Gesamtumsatz (TDEE)</p>
            <p className="text-lg font-bold">{fmt(tdee)} kcal</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          {istZielErreicht ? (
            <p className="text-sm">
              Ihr Zielgewicht entspricht Ihrem aktuellen Gewicht – es ist kein Defizit nötig.
              Wählen Sie ein niedrigeres Zielgewicht, um eine Dauer zu sehen.
            </p>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-emerald-100">
                Bis {zielgewicht} kg (−{fmt(abzunehmen)} kg)
              </span>
              <span className="text-lg font-bold">
                ca. {dauerWochen} Wochen <span className="text-sm font-normal text-emerald-100">(~{dauerMonate} Monate)</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Warnung Untergrenze */}
      {unterGrenze && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex gap-3">
            <span className="text-xl">⚠️</span>
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Defizit gekappt – zu niedrige Zufuhr</p>
              <p>
                Mit diesem Tempo läge Ihre Zufuhr rechnerisch unter {fmt(minKcal)} kcal
                ({geschlecht === 'mann' ? 'Männer' : 'Frauen'}). Solche extremen Defizite fördern
                Muskelabbau und den Jo-Jo-Effekt. Der Wert wurde deshalb auf {fmt(minKcal)} kcal
                begrenzt – wählen Sie besser ein langsameres Tempo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* YMYL-Disclaimer */}
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex gap-3">
          <span className="text-xl">🩺</span>
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Kein Ersatz für ärztliche Beratung</p>
            <p>
              Dieser Rechner liefert eine grobe Orientierung auf Basis von Standardformeln und
              ersetzt keine ärztliche oder ernährungsberaterische Beratung. Bei Vorerkrankungen,
              in Schwangerschaft und Stillzeit, bei Essstörungen oder vor einer stärkeren Umstellung
              sprechen Sie bitte mit Ihrem Arzt.
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Berechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>1️⃣</span>
            <span>
              <strong>Grundumsatz (BMR)</strong> nach der Mifflin-St-Jeor-Formel – die Kalorien,
              die Ihr Körper in völliger Ruhe verbraucht.
            </span>
          </li>
          <li className="flex gap-2">
            <span>2️⃣</span>
            <span>
              <strong>Gesamtumsatz (TDEE)</strong> = Grundumsatz × Aktivitätsfaktor (PAL) – inklusive
              Alltag und Sport.
            </span>
          </li>
          <li className="flex gap-2">
            <span>3️⃣</span>
            <span>
              <strong>Defizit</strong>: 1 kg Körperfett ≈ 7.700 kcal. 0,5 kg/Woche entsprechen also
              rund 550 kcal weniger pro Tag.
            </span>
          </li>
          <li className="flex gap-2">
            <span>4️⃣</span>
            <span>
              <strong>Empfohlene Zufuhr</strong> = Gesamtumsatz − tägliches Defizit, nie unter der
              Sicherheitsgrenze.
            </span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.dge.de/gesunde-ernaehrung/faq/energiezufuhr/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Gesellschaft für Ernährung (DGE) – Energiezufuhr & PAL-Werte
          </a>
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/2305711/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Mifflin MD et al. (1990) – A new predictive equation for resting energy expenditure (PubMed)
          </a>
        </div>
      </div>
    </div>
  );
}
