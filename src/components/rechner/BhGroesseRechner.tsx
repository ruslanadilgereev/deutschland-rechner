import { useState } from 'react';

// BH-Größen-Rechner – deutsche/europäische Größentabelle
//
// Bandgröße: Unterbrustumfang wird auf den nächsten 5er-Schritt gerundet
//   (63–67 → 65, 68–72 → 70, 73–77 → 75, …).
// Cupgröße: Differenz (Brustumfang − Unterbrustumfang) in 2-cm-Schritten
//   (12–13 cm → A, 14–15 cm → B, 16–17 cm → C, …).

// Bandgrößen-Tabelle: [minUnterbrust, maxUnterbrust, Bandgröße]
const BAND_TABELLE: Array<[number, number, number]> = [
  [63, 67, 65],
  [68, 72, 70],
  [73, 77, 75],
  [78, 82, 80],
  [83, 87, 85],
  [88, 92, 90],
  [93, 97, 95],
  [98, 102, 100],
  [103, 107, 105],
  [108, 112, 110],
  [113, 117, 115],
  [118, 122, 120],
  [123, 127, 125],
  [128, 132, 130],
  [133, 137, 135],
];

// Cup-Tabelle: [minDifferenz, maxDifferenz, Cup]
// Differenz = Brustumfang − Unterbrustumfang (in cm)
const CUP_TABELLE: Array<[number, number, string]> = [
  [8, 11, 'AA'],
  [12, 13, 'A'],
  [14, 15, 'B'],
  [16, 17, 'C'],
  [18, 19, 'D'],
  [20, 21, 'E'],
  [22, 23, 'F'],
  [24, 25, 'G'],
  [26, 28, 'H'],
  [29, 30, 'I'],
  [31, 32, 'J'],
  [33, 34, 'K'],
];

function ermittleBand(unterbrust: number): { band: number | null; hinweis?: string } {
  if (unterbrust < 63) return { band: 65, hinweis: 'unter Tabelle' };
  if (unterbrust > 137) return { band: 135, hinweis: 'über Tabelle' };
  for (const [min, max, band] of BAND_TABELLE) {
    if (unterbrust >= min && unterbrust <= max) return { band };
  }
  return { band: null };
}

function ermittleCup(differenz: number): { cup: string | null; hinweis?: string } {
  if (differenz < 8) return { cup: 'AA', hinweis: 'sehr klein' };
  if (differenz > 34) return { cup: 'K', hinweis: 'über Tabelle' };
  for (const [min, max, cup] of CUP_TABELLE) {
    if (differenz >= min && differenz <= max) return { cup };
  }
  return { cup: null };
}

export default function BhGroesseRechner() {
  const [unterbrust, setUnterbrust] = useState('75');
  const [brust, setBrust] = useState('89');

  const u = parseFloat(unterbrust.replace(',', '.'));
  const b = parseFloat(brust.replace(',', '.'));

  const valid =
    !isNaN(u) &&
    !isNaN(b) &&
    u >= 50 &&
    u <= 160 &&
    b >= 60 &&
    b <= 200 &&
    b >= u;

  const differenz = valid ? Math.round(b - u) : 0;
  const bandErgebnis = valid ? ermittleBand(Math.round(u)) : { band: null };
  const cupErgebnis = valid ? ermittleCup(differenz) : { cup: null };

  const bhGroesse =
    valid && bandErgebnis.band && cupErgebnis.cup
      ? `${bandErgebnis.band}${cupErgebnis.cup}`
      : null;

  let fehlermeldung = '';
  if (unterbrust !== '' && brust !== '') {
    if (isNaN(u) || isNaN(b)) {
      fehlermeldung = 'Bitte gültige Zahlen eingeben.';
    } else if (b < u) {
      fehlermeldung = 'Der Brustumfang muss größer sein als der Unterbrustumfang.';
    } else if (u < 50 || u > 160 || b < 60 || b > 200) {
      fehlermeldung = 'Bitte realistische Werte in Zentimetern eingeben.';
    }
  }

  return (
    <div className="max-w-lg mx-auto">

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Unterbrustumfang (cm)</span>
          <span className="block text-xs text-gray-500 mt-0.5">
            Direkt unter der Brust gemessen, straff anliegend
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={50}
            max={160}
            value={unterbrust}
            onChange={(e) => setUnterbrust(e.target.value)}
            className="mt-2 w-full px-4 py-3 text-lg rounded-xl border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none"
            placeholder="z. B. 75"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Brustumfang (cm)</span>
          <span className="block text-xs text-gray-500 mt-0.5">
            An der stärksten Stelle, locker auf Höhe der Brustwarzen
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={60}
            max={200}
            value={brust}
            onChange={(e) => setBrust(e.target.value)}
            className="mt-2 w-full px-4 py-3 text-lg rounded-xl border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none"
            placeholder="z. B. 89"
          />
        </label>

        {fehlermeldung && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg p-3">{fehlermeldung}</p>
        )}
      </div>

      {/* Ergebnis */}
      {valid && bhGroesse && (
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium text-pink-100 mb-1">Ihre BH-Größe (Richtwert)</h3>

          <div className="mb-6">
            <span className="text-6xl font-bold tracking-tight">{bhGroesse}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-pink-100 text-xs mb-1">Bandgröße (Unterbrust)</p>
              <p className="text-2xl font-bold">{bandErgebnis.band}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-pink-100 text-xs mb-1">Cup (Differenz {differenz} cm)</p>
              <p className="text-2xl font-bold">{cupErgebnis.cup}</p>
            </div>
          </div>

          <p className="text-pink-100 text-xs mt-4">
            Richtwert nach europäischer Standardtabelle. Marken können um ein bis zwei Größen
            abweichen – probieren Sie im Zweifel benachbarte Größen an.
          </p>
        </div>
      )}

      {/* So funktioniert's */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Berechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>1.</span>
            <span>
              Der <strong>Unterbrustumfang</strong> wird auf einen 5er-Schritt gerundet und ergibt
              die <strong>Bandgröße</strong> (z. B. 73–77 cm → 75).
            </span>
          </li>
          <li className="flex gap-2">
            <span>2.</span>
            <span>
              Die <strong>Differenz</strong> aus Brust- minus Unterbrustumfang ergibt die{' '}
              <strong>Cupgröße</strong> (12–13 cm → A, 14–15 cm → B, 16–17 cm → C, …).
            </span>
          </li>
          <li className="flex gap-2">
            <span>3.</span>
            <span>
              Beides zusammen ergibt die BH-Größe, z. B. <strong>75B</strong>.
            </span>
          </li>
        </ul>
      </div>

      {/* Mess-Tipps */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Richtig messen</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-pink-50 rounded-xl">
            <span className="text-xl">🩱</span>
            <div>
              <p className="font-medium text-pink-900">Ohne BH oder im dünnen BH messen</p>
              <p className="text-pink-700">
                Ein dick gepolsterter BH verfälscht den Brustumfang.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📏</span>
            <div>
              <p className="font-medium text-blue-900">Maßband waagerecht halten</p>
              <p className="text-blue-700">
                Vorne und hinten auf gleicher Höhe – sonst weichen die Werte ab.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🧍‍♀️</span>
            <div>
              <p className="font-medium text-green-900">Aufrecht und entspannt stehen</p>
              <p className="text-green-700">
                Arme locker hängen lassen, nicht die Luft anhalten.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hinweis */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
        <p className="font-semibold mb-1">⚠️ Nur ein Richtwert – keine Beratung</p>
        <p>
          Die berechnete Größe ist eine Orientierung nach der europäischen Standardtabelle.
          BH-Größen fallen je nach Marke, Schnitt und Modell unterschiedlich aus. Entscheidend ist
          immer der Sitz beim Anprobieren – ohne Gewähr.
        </p>
      </div>
    </div>
  );
}
