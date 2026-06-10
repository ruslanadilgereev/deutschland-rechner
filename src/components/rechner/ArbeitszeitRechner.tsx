import { useState } from 'react';

// Arbeitszeit-Rechner – Netto-Arbeitszeit nach ArbZG
// Quelle: § 4 ArbZG (Ruhepausen), § 3 ArbZG (Höchstarbeitszeit)
// https://www.gesetze-im-internet.de/arbzg/__4.html

// Pflicht-Pausen nach § 4 ArbZG (in Minuten):
// > 6 h bis 9 h Arbeitszeit -> mind. 30 min
// > 9 h Arbeitszeit         -> mind. 45 min
const PAUSE_AB_6H = 30;
const PAUSE_AB_9H = 45;

// Höchstarbeitszeit nach § 3 ArbZG: 8 h werktäglich, verlängerbar auf 10 h
const HOECHSTARBEITSZEIT_MIN = 10 * 60;

// Wandelt "hh:mm" in Minuten seit 00:00 um. Gibt null bei ungültiger Eingabe.
function parseTime(value: string): number | null {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

// Formatiert Minuten als "h Std. m Min."
function formatHM(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? '−' : '';
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h} Std. ${m} Min.`;
}

// Formatiert Minuten als Dezimalstunden (z. B. 462 -> "7,70")
function formatDecimal(totalMinutes: number): string {
  return (totalMinutes / 60).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ArbeitszeitRechner() {
  const [beginn, setBeginn] = useState('08:00');
  const [ende, setEnde] = useState('17:00');
  const [pause, setPause] = useState('30');
  const [sollAktiv, setSollAktiv] = useState(false);
  const [soll, setSoll] = useState('8');

  const beginnMin = parseTime(beginn);
  const endeMin = parseTime(ende);
  const pauseMin = Math.max(0, parseInt(pause || '0', 10) || 0);

  const eingabeOk = beginnMin !== null && endeMin !== null;

  // Über-Mitternacht-Schichten unterstützen: Ende vor Beginn -> + 24 h
  let bruttoMin = 0;
  if (eingabeOk) {
    bruttoMin = endeMin - beginnMin;
    if (bruttoMin < 0) bruttoMin += 24 * 60;
  }

  const nettoMin = Math.max(0, bruttoMin - pauseMin);

  // Pflicht-Pause nach § 4 ArbZG bestimmt sich nach der NETTO-Arbeitszeit
  let pflichtPause = 0;
  if (nettoMin > 9 * 60) pflichtPause = PAUSE_AB_9H;
  else if (nettoMin > 6 * 60) pflichtPause = PAUSE_AB_6H;

  const pauseZuKurz = eingabeOk && pflichtPause > 0 && pauseMin < pflichtPause;
  const ueberHoechstgrenze = eingabeOk && nettoMin > HOECHSTARBEITSZEIT_MIN;

  // Soll-/Ist-Vergleich (Über-/Unterstunden)
  const sollMin = Math.round((parseFloat((soll || '0').replace(',', '.')) || 0) * 60);
  const saldoMin = nettoMin - sollMin;

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Beginn</span>
            <input
              type="time"
              value={beginn}
              onChange={(e) => setBeginn(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Ende</span>
            <input
              type="time"
              value={ende}
              onChange={(e) => setEnde(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </label>
        </div>

        <label className="block mt-4">
          <span className="text-gray-700 font-medium">Pause (Minuten)</span>
          <input
            type="number"
            min={0}
            step={5}
            inputMode="numeric"
            value={pause}
            onChange={(e) => setPause(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </label>

        <label className="flex items-center gap-3 mt-5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sollAktiv}
            onChange={(e) => setSollAktiv(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-200"
          />
          <span className="text-gray-700 font-medium">Sollarbeitszeit vergleichen (Über-/Unterstunden)</span>
        </label>

        {sollAktiv && (
          <label className="block mt-4">
            <span className="text-gray-700 font-medium">Sollarbeitszeit (Stunden)</span>
            <input
              type="number"
              min={0}
              step={0.25}
              inputMode="decimal"
              value={soll}
              onChange={(e) => setSoll(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </label>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Ihre Netto-Arbeitszeit</h3>

        {eingabeOk ? (
          <>
            <div className="mb-6">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-bold">{formatHM(nettoMin)}</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">
                entspricht <strong>{formatDecimal(nettoMin)}</strong> Dezimalstunden
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Anwesenheit (brutto)</span>
                <span className="font-semibold">{formatHM(bruttoMin)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">− Pause</span>
                <span className="font-semibold">{pauseMin} Min.</span>
              </div>
              {sollAktiv && (
                <div className="flex justify-between items-center border-t border-white/20 pt-2 mt-2">
                  <span className="text-blue-100">
                    {saldoMin >= 0 ? 'Überstunden' : 'Unterstunden'}
                  </span>
                  <span className="font-bold text-lg">
                    {saldoMin >= 0 ? '+' : ''}{formatHM(saldoMin)}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-blue-100 py-4">Bitte gültige Uhrzeiten im Format hh:mm eingeben.</p>
        )}
      </div>

      {/* Hinweise zu Pflicht-Pausen */}
      {eingabeOk && (
        <div className="mt-6 space-y-3">
          {pauseZuKurz && (
            <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-800">Pause zu kurz nach § 4 ArbZG</p>
                <p className="text-yellow-700">
                  Bei einer Arbeitszeit von {formatHM(nettoMin)} schreibt das Arbeitszeitgesetz
                  mindestens <strong>{pflichtPause} Minuten</strong> Pause vor. Sie haben nur{' '}
                  {pauseMin} Minuten eingetragen.
                </p>
              </div>
            </div>
          )}

          {!pauseZuKurz && pflichtPause > 0 && (
            <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-semibold text-green-800">Pausen-Vorgabe erfüllt</p>
                <p className="text-green-700">
                  Bei {formatHM(nettoMin)} Arbeit sind mindestens {pflichtPause} Minuten Pause
                  vorgeschrieben – Ihre {pauseMin} Minuten reichen aus.
                </p>
              </div>
            </div>
          )}

          {ueberHoechstgrenze && (
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
              <span className="text-xl">🚫</span>
              <div>
                <p className="font-semibold text-red-800">Über der Höchstarbeitszeit</p>
                <p className="text-red-700">
                  Die werktägliche Arbeitszeit darf nach § 3 ArbZG 8 Stunden, im Ausnahmefall 10
                  Stunden, nicht überschreiten. Ihre Netto-Arbeitszeit liegt mit {formatHM(nettoMin)}{' '}
                  darüber.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So rechnet der Arbeitszeit-Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Netto-Arbeitszeit</strong> = Ende − Beginn − Pause</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Pflicht-Pause: <strong>30 Min.</strong> ab mehr als 6 Std., <strong>45 Min.</strong> ab mehr als 9 Std. (§ 4 ArbZG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Pausen sind in Abschnitten von je mindestens <strong>15 Minuten</strong> aufteilbar</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Endet die Schicht nach Mitternacht (Ende vor Beginn), wird automatisch über den Tageswechsel gerechnet</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Höchstarbeitszeit: <strong>8 Std.</strong>, ausnahmsweise <strong>10 Std.</strong> pro Werktag (§ 3 ArbZG)</span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/arbzg/__4.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 4 ArbZG – Ruhepausen (Gesetze im Internet)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/arbzg/__3.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 3 ArbZG – Arbeitszeit der Arbeitnehmer (Gesetze im Internet)
          </a>
        </div>
      </div>
    </div>
  );
}
