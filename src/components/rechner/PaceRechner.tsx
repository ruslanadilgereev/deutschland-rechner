import { useState } from 'react';

// Pace-Rechner (Laufen) – reine Mathematik, exakt.
// Pace (min/km)  = Zeit (min) / Strecke (km)
// Geschw. (km/h) = Strecke (km) / Zeit (h) = 60 / Pace(min)
// Zielzeit (min) = Pace (min/km) × Strecke (km)
// Voreingestellte Distanzen inkl. exakter offizieller Marathon-/Halbmarathon-Distanz.

type Modus = 'zeit' | 'pace';

// Distanzen in km. Marathon 42,195 km, Halbmarathon 21,0975 km (offiziell, World Athletics)
const DISTANZEN: { label: string; km: number }[] = [
  { label: '5 km', km: 5 },
  { label: '10 km', km: 10 },
  { label: 'Halbmarathon', km: 21.0975 },
  { label: 'Marathon', km: 42.195 },
  { label: 'Eigene', km: 0 },
];

// Hilfsfunktionen --------------------------------------------------

// Sekunden -> "h:mm:ss" oder "mm:ss"
function formatZeit(sekundenGesamt: number): string {
  if (!isFinite(sekundenGesamt) || sekundenGesamt <= 0) return '–';
  const ganze = Math.round(sekundenGesamt);
  const h = Math.floor(ganze / 3600);
  const m = Math.floor((ganze % 3600) / 60);
  const s = ganze % 60;
  const zwei = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) return `${h}:${zwei(m)}:${zwei(s)}`;
  return `${m}:${zwei(s)}`;
}

// Sekunden pro km -> "m:ss min/km"
function formatPace(sekProKm: number): string {
  if (!isFinite(sekProKm) || sekProKm <= 0) return '–';
  const ganze = Math.round(sekProKm);
  const m = Math.floor(ganze / 60);
  const s = ganze % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatZahl(n: number, stellen = 2): string {
  if (!isFinite(n) || n <= 0) return '–';
  return n.toLocaleString('de-DE', {
    minimumFractionDigits: stellen,
    maximumFractionDigits: stellen,
  });
}

export default function PaceRechner() {
  const [modus, setModus] = useState<Modus>('zeit');

  // Distanz-Auswahl
  const [distanzIndex, setDistanzIndex] = useState(1); // Default: 10 km
  const [eigeneKm, setEigeneKm] = useState('');

  // Modus „Strecke + Zeit -> Pace“
  const [stunden, setStunden] = useState('0');
  const [minuten, setMinuten] = useState('50');
  const [sekunden, setSekunden] = useState('0');

  // Modus „Pace + Strecke -> Zielzeit“
  const [paceMin, setPaceMin] = useState('5');
  const [paceSek, setPaceSek] = useState('0');

  const ausgewaehlt = DISTANZEN[distanzIndex];
  const istEigene = ausgewaehlt.km === 0;
  const km = istEigene ? parseFloat(eigeneKm.replace(',', '.')) || 0 : ausgewaehlt.km;

  // Eingaben parsen
  const zeitSek =
    (parseInt(stunden) || 0) * 3600 +
    (parseInt(minuten) || 0) * 60 +
    (parseInt(sekunden) || 0);

  const paceSekProKm = (parseInt(paceMin) || 0) * 60 + (parseInt(paceSek) || 0);

  // Berechnungen
  const gueltigZeit = km > 0 && zeitSek > 0;
  const gueltigPace = km > 0 && paceSekProKm > 0;

  // Modus 1: Pace + Geschwindigkeit aus Zeit
  const ergPaceSekProKm = gueltigZeit ? zeitSek / km : 0;
  const ergKmh = gueltigZeit ? km / (zeitSek / 3600) : 0;

  // Modus 2: Zielzeit aus Pace
  const ergZielSek = gueltigPace ? paceSekProKm * km : 0;
  const ergZielKmh = gueltigPace ? 3600 / paceSekProKm : 0;

  const inputCls =
    'w-full text-center text-2xl font-bold text-gray-800 border-2 border-gray-200 rounded-xl py-3 focus:border-blue-500 focus:outline-none';
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1 text-center';

  return (
    <div className="max-w-lg mx-auto">

      {/* Modus-Umschalter */}
      <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 flex gap-2">
        <button
          onClick={() => setModus('zeit')}
          className={`flex-1 py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
            modus === 'zeit'
              ? 'bg-blue-500 text-white shadow'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Strecke + Zeit → Pace
        </button>
        <button
          onClick={() => setModus('pace')}
          className={`flex-1 py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
            modus === 'pace'
              ? 'bg-blue-500 text-white shadow'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Pace + Strecke → Zielzeit
        </button>
      </div>

      {/* Distanz-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="block text-gray-700 font-medium mb-3">Distanz</span>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {DISTANZEN.map((d, i) => (
            <button
              key={d.label}
              onClick={() => setDistanzIndex(i)}
              className={`py-2 px-1 rounded-xl text-sm font-medium transition-all ${
                distanzIndex === i
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {istEigene && (
          <label className="block mt-3">
            <span className={labelCls}>Eigene Strecke (km)</span>
            <input
              type="text"
              inputMode="decimal"
              value={eigeneKm}
              onChange={(e) => setEigeneKm(e.target.value)}
              placeholder="z. B. 15"
              className={inputCls}
            />
          </label>
        )}

        {!istEigene && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Gewählte Strecke: <strong>{formatZahl(km, km % 1 === 0 ? 0 : 4)} km</strong>
          </p>
        )}
      </div>

      {/* Eingaben je Modus */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {modus === 'zeit' ? (
          <>
            <span className="block text-gray-700 font-medium mb-3">Gelaufene Zeit</span>
            <div className="grid grid-cols-3 gap-3">
              <label>
                <span className={labelCls}>Stunden</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={stunden}
                  onChange={(e) => setStunden(e.target.value)}
                  className={inputCls}
                />
              </label>
              <label>
                <span className={labelCls}>Minuten</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={minuten}
                  onChange={(e) => setMinuten(e.target.value)}
                  className={inputCls}
                />
              </label>
              <label>
                <span className={labelCls}>Sekunden</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={sekunden}
                  onChange={(e) => setSekunden(e.target.value)}
                  className={inputCls}
                />
              </label>
            </div>
          </>
        ) : (
          <>
            <span className="block text-gray-700 font-medium mb-3">Geplante Pace (pro km)</span>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={labelCls}>Minuten</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={paceMin}
                  onChange={(e) => setPaceMin(e.target.value)}
                  className={inputCls}
                />
              </label>
              <label>
                <span className={labelCls}>Sekunden</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={paceSek}
                  onChange={(e) => setPaceSek(e.target.value)}
                  className={inputCls}
                />
              </label>
            </div>
          </>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        {modus === 'zeit' ? (
          <>
            <h3 className="text-sm font-medium text-blue-100 mb-1">Ihre Pace</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatPace(ergPaceSekProKm)}</span>
                <span className="text-xl text-blue-200">min/km</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm flex justify-between items-center">
                <span className="text-blue-100">Geschwindigkeit</span>
                <span className="text-xl font-bold">
                  {formatZahl(ergKmh)} km/h
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm flex justify-between items-center">
                <span className="text-blue-100">Strecke</span>
                <span className="text-xl font-bold">
                  {formatZahl(km, km % 1 === 0 ? 0 : 4)} km
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-medium text-blue-100 mb-1">Ihre Zielzeit</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatZeit(ergZielSek)}</span>
                <span className="text-xl text-blue-200">h:mm:ss</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm flex justify-between items-center">
                <span className="text-blue-100">Pace</span>
                <span className="text-xl font-bold">
                  {formatPace(paceSekProKm)} min/km
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm flex justify-between items-center">
                <span className="text-blue-100">Geschwindigkeit</span>
                <span className="text-xl font-bold">
                  {formatZahl(ergZielKmh)} km/h
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So rechnet der Pace-Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Pace</strong> = Zeit ÷ Strecke (Ergebnis in min/km)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Geschwindigkeit</strong> = 60 ÷ Pace (Ergebnis in km/h)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Zielzeit</strong> = Pace × Strecke
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Marathon <strong>42,195 km</strong>, Halbmarathon <strong>21,0975 km</strong> (offizielle Distanzen)
            </span>
          </li>
        </ul>
        <p className="text-xs text-gray-400 mt-4">
          Die Berechnung ist reine Mathematik und damit exakt. Ihre tatsächliche Pace hängt von
          Form, Strecke, Wetter und Tagesform ab – dieser Rechner ersetzt keine Trainings- oder
          ärztliche Beratung.
        </p>
      </div>
    </div>
  );
}
