import { useState } from 'react';

// Voraussichtliche Erwachsenen-Körpergröße eines Kindes
// Methode: Genetische Zielgröße (Mittelelterngröße / Zielgrößen-Methode)
//   Mittelelterngröße = (Größe Vater + Größe Mutter) / 2
//   Jungen  = Mittelelterngröße + 6,5 cm
//   Mädchen = Mittelelterngröße − 6,5 cm
//   Streubereich (genetischer Zielgrößenbereich): ± 8,5 cm
// Quellen:
//   - PTA-Forum (Govi-Verlag): genetische Zielgröße ± 8,5 cm
//   - PEZZ Kinderhormonzentrum: Rechner familiäre Größe
//   - AMBOSS: Kleinwuchs / Zielgröße
const SEX_OFFSET_CM = 6.5; // +6,5 cm Jungen, −6,5 cm Mädchen
const SPREAD_CM = 8.5; // ± 8,5 cm genetischer Zielgrößenbereich

type Geschlecht = 'junge' | 'maedchen';

export default function KoerpergroesseKindRechner() {
  const [geschlecht, setGeschlecht] = useState<Geschlecht>('junge');
  const [groesseMutter, setGroesseMutter] = useState(168);
  const [groesseVater, setGroesseVater] = useState(180);

  const mittelelterngroesse = (groesseMutter + groesseVater) / 2;
  const prognose =
    geschlecht === 'junge'
      ? mittelelterngroesse + SEX_OFFSET_CM
      : mittelelterngroesse - SEX_OFFSET_CM;
  const untergrenze = prognose - SPREAD_CM;
  const obergrenze = prognose + SPREAD_CM;

  const fmt = (cm: number) => cm.toLocaleString('de-DE', { maximumFractionDigits: 1 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Geschlecht */}
        <label className="block mb-6">
          <span className="text-gray-700 font-medium">Geschlecht des Kindes</span>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGeschlecht('junge')}
              className={`py-3 rounded-xl text-lg font-semibold transition-all active:scale-95 ${
                geschlecht === 'junge'
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👦 Junge
            </button>
            <button
              type="button"
              onClick={() => setGeschlecht('maedchen')}
              className={`py-3 rounded-xl text-lg font-semibold transition-all active:scale-95 ${
                geschlecht === 'maedchen'
                  ? 'bg-pink-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👧 Mädchen
            </button>
          </div>
        </label>

        {/* Größe Mutter */}
        <label className="block mb-6">
          <div className="flex justify-between items-baseline">
            <span className="text-gray-700 font-medium">Größe der Mutter</span>
            <span className="text-blue-600 font-bold">{fmt(groesseMutter)} cm</span>
          </div>
          <input
            type="range"
            min={140}
            max={200}
            step={1}
            value={groesseMutter}
            onChange={(e) => setGroesseMutter(Number(e.target.value))}
            className="mt-3 w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>140 cm</span>
            <span>200 cm</span>
          </div>
        </label>

        {/* Größe Vater */}
        <label className="block">
          <div className="flex justify-between items-baseline">
            <span className="text-gray-700 font-medium">Größe des Vaters</span>
            <span className="text-blue-600 font-bold">{fmt(groesseVater)} cm</span>
          </div>
          <input
            type="range"
            min={150}
            max={210}
            step={1}
            value={groesseVater}
            onChange={(e) => setGroesseVater(Number(e.target.value))}
            className="mt-3 w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>150 cm</span>
            <span>210 cm</span>
          </div>
        </label>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          Voraussichtliche Erwachsenen-Größe
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{fmt(prognose)}</span>
            <span className="text-xl text-blue-200">cm</span>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            genetische Zielgröße (Mittelwert)
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-blue-100">Wahrscheinliche Spanne</span>
            <span className="text-xl font-bold">
              {fmt(untergrenze)} – {fmt(obergrenze)} cm
            </span>
          </div>
          <p className="text-xs text-blue-200 mt-2">
            Genetischer Zielgrößenbereich: Zielgröße ± 8,5 cm
          </p>
        </div>
      </div>

      {/* So wird gerechnet */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So wird gerechnet</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>1️⃣</span>
            <span>
              <strong>Mittelelterngröße</strong> = (Größe Mutter + Größe Vater) ÷ 2 ={' '}
              <strong>{fmt(mittelelterngroesse)} cm</strong>
            </span>
          </li>
          <li className="flex gap-2">
            <span>2️⃣</span>
            <span>
              {geschlecht === 'junge' ? (
                <>Für Jungen: <strong>+ 6,5 cm</strong> auf die Mittelelterngröße</>
              ) : (
                <>Für Mädchen: <strong>− 6,5 cm</strong> von der Mittelelterngröße</>
              )}
            </span>
          </li>
          <li className="flex gap-2">
            <span>3️⃣</span>
            <span>
              <strong>± 8,5 cm</strong> Streubereich für die natürliche Schwankung
            </span>
          </li>
        </ul>
      </div>

      {/* Wichtiger Hinweis (YMYL) */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">⚠️ Wichtiger Hinweis</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">📏</span>
            <div>
              <p className="font-medium text-yellow-800">Nur eine grobe Schätzung</p>
              <p className="text-yellow-700">
                Die Zielgrößen-Methode liefert eine statistische Orientierung, keine exakte
                Vorhersage. Die tatsächliche Größe kann auch außerhalb der Spanne liegen.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">🧬</span>
            <div>
              <p className="font-medium text-blue-800">Viele Faktoren wirken mit</p>
              <p className="text-blue-700">
                Neben den Genen beeinflussen Ernährung, Hormone, Erkrankungen, Schlaf und der
                Zeitpunkt der Pubertät das Wachstum.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">👩‍⚕️</span>
            <div>
              <p className="font-medium text-green-800">Kein Ersatz für ärztlichen Rat</p>
              <p className="text-green-700">
                Bei Sorgen um das Wachstum ist die Kinderärztin oder der Kinderarzt die richtige
                Anlaufstelle – dort wird die Größe in Perzentilenkurven eingeordnet und bei Bedarf
                das Knochenalter bestimmt.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
