import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Korrekturfaktor für den Abrollumfang: Unter Last walkt der Reifen ein,
// dadurch ist der dynamische Abrollumfang etwas kleiner als der rein
// geometrische Umfang. Faustwert ca. 0,97 (≈ 3 % weniger).
// Quelle: rechneronline.de/reifen-check, autozeitung.de
const ABROLL_FAKTOR = 0.97;

// Gängige Reifengrößen als Voreinstellungen für den schnellen Vergleich.
type ReifenVoreinstellung = {
  label: string;
  breite: number;
  quer: number;
  zoll: number;
};

const PRESETS: ReifenVoreinstellung[] = [
  { label: '195/65 R15', breite: 195, quer: 65, zoll: 15 },
  { label: '205/55 R16', breite: 205, quer: 55, zoll: 16 },
  { label: '225/45 R17', breite: 225, quer: 45, zoll: 17 },
  { label: '225/40 R18', breite: 225, quer: 40, zoll: 18 },
  { label: '235/35 R19', breite: 235, quer: 35, zoll: 19 },
];

export function ReifengroesseRechner() {
  // Reifen alt (Serie)
  const [breiteAlt, setBreiteAlt] = useState(205);
  const [querAlt, setQuerAlt] = useState(55);
  const [zollAlt, setZollAlt] = useState(16);
  // Reifen neu (geplant)
  const [breiteNeu, setBreiteNeu] = useState(225);
  const [querNeu, setQuerNeu] = useState(45);
  const [zollNeu, setZollNeu] = useState(17);
  // Tachoanzeige für die Tachoabweichung
  const [tacho, setTacho] = useState(100);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Geometrie eines Reifens berechnen.
  const reifenMasse = (breite: number, quer: number, zoll: number) => {
    const flankeMm = (breite * quer) / 100; // Höhe der Reifenflanke in mm
    const felgeMm = zoll * 25.4; // Felgendurchmesser in mm
    const durchmesserMm = felgeMm + 2 * flankeMm; // Gesamtdurchmesser
    const umfangMm = durchmesserMm * Math.PI; // geometrischer Umfang
    const abrollMm = umfangMm * ABROLL_FAKTOR; // dynamischer Abrollumfang
    return { flankeMm, durchmesserMm, umfangMm, abrollMm };
  };

  const alt = reifenMasse(breiteAlt, querAlt, zollAlt);
  const neu = reifenMasse(breiteNeu, querNeu, zollNeu);

  // Abweichung des Durchmessers neu gegenüber alt in Prozent.
  const abweichungProzent =
    alt.durchmesserMm > 0
      ? ((neu.durchmesserMm - alt.durchmesserMm) / alt.durchmesserMm) * 100
      : 0;

  // Tachoabweichung: Der Tacho ist auf den Serienreifen geeicht. Ein größerer
  // Reifen dreht langsamer, legt pro Umdrehung mehr Strecke zurück → man fährt
  // real schneller, als der Tacho anzeigt. Reale Geschwindigkeit skaliert mit
  // dem Verhältnis der Durchmesser.
  const realGeschwindigkeit =
    alt.durchmesserMm > 0 ? tacho * (neu.durchmesserMm / alt.durchmesserMm) : 0;
  const geschwDifferenz = realGeschwindigkeit - tacho;

  const formatMm = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatCm = (v: number) =>
    (v / 10).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const formatProzent = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  const formatKmh = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  // Bewertung der Abweichung für die Ampel-Logik.
  const absAbw = Math.abs(abweichungProzent);
  const istUnkritisch = absAbw <= 2;

  const presetAktiv = (p: ReifenVoreinstellung, b: number, q: number, z: number) =>
    p.breite === b && p.quer === q && p.zoll === z;

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Reifengrößen-Rechner" rechnerSlug="reifengroesse-rechner" />

      {/* Reifen alt */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">
          Reifen alt (Serienbereifung)
        </span>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={`alt-${p.label}`}
              onClick={() => {
                setBreiteAlt(p.breite);
                setQuerAlt(p.quer);
                setZollAlt(p.zoll);
              }}
              className={`p-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                presetAktiv(p, breiteAlt, querAlt, zollAlt)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs text-gray-500">Breite (mm)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={breiteAlt}
              onChange={(e) => setBreiteAlt(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Querschnitt (%)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={querAlt}
              onChange={(e) => setQuerAlt(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Zoll (R)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={zollAlt}
              onChange={(e) => setZollAlt(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Reifen neu */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">
          Reifen neu (geplante Größe)
        </span>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={`neu-${p.label}`}
              onClick={() => {
                setBreiteNeu(p.breite);
                setQuerNeu(p.quer);
                setZollNeu(p.zoll);
              }}
              className={`p-2 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                presetAktiv(p, breiteNeu, querNeu, zollNeu)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs text-gray-500">Breite (mm)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={breiteNeu}
              onChange={(e) => setBreiteNeu(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Querschnitt (%)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={querNeu}
              onChange={(e) => setQuerNeu(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Zoll (R)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={zollNeu}
              onChange={(e) => setZollNeu(toNumber(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>

        <label className="block mt-5 border-t border-gray-100 pt-4">
          <span className="text-gray-700 font-medium">Tachoanzeige (km/h)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={tacho}
              onChange={(e) => setTacho(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km/h</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Anzeige, wenn das Auto noch die alte Größe „erwartet“ – zeigt die reale Geschwindigkeit mit dem neuen Reifen.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Vergleich alt ↔ neu</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {abweichungProzent >= 0 ? '+' : '−'}
              {formatProzent(absAbw)}
            </span>
            <span className="text-xl text-blue-200">% Durchmesser</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            {istUnkritisch
              ? 'innerhalb der üblichen ±2 %-Toleranz'
              : 'über ±2 % – kritisch, Freigabe/Eintragung prüfen'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">Durchmesser</span>
              <span className="font-bold">
                {formatMm(alt.durchmesserMm)} → {formatMm(neu.durchmesserMm)} mm
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-blue-100">Umfang</span>
              <span className="font-bold">
                {formatCm(alt.umfangMm)} → {formatCm(neu.umfangMm)} cm
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Abrollumfang (≈)</span>
              <span className="font-bold">
                {formatCm(alt.abrollMm)} → {formatCm(neu.abrollMm)} cm
              </span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Real bei Tacho {formatKmh(tacho)} km/h</span>
              <span className="text-xl font-bold">{formatKmh(realGeschwindigkeit)} km/h</span>
            </div>
            <p className="text-blue-200 text-xs mt-1">
              {Math.abs(geschwDifferenz) < 0.05
                ? 'keine Abweichung'
                : geschwDifferenz > 0
                  ? `Sie fahren ca. ${formatKmh(Math.abs(geschwDifferenz))} km/h schneller als angezeigt`
                  : `Sie fahren ca. ${formatKmh(Math.abs(geschwDifferenz))} km/h langsamer als angezeigt`}
            </p>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Reifen-Ø</strong> = Zoll × 25,4 + 2 × (Breite × Querschnitt ÷ 100)
          </p>
          <p>
            neu = {zollNeu} × 25,4 + 2 × ({breiteNeu} × {querNeu} ÷ 100) ={' '}
            <strong>{formatMm(neu.durchmesserMm)} mm</strong>
          </p>
          <p>
            <strong>Abweichung</strong> = (Ø<sub>neu</sub> − Ø<sub>alt</sub>) ÷ Ø<sub>alt</sub> × 100 ={' '}
            <strong>
              {abweichungProzent >= 0 ? '+' : '−'}
              {formatProzent(absAbw)} %
            </strong>
          </p>
          <p>
            <strong>Real</strong> = Tacho × Ø<sub>neu</sub> ÷ Ø<sub>alt</sub> = {formatKmh(tacho)} ×{' '}
            {formatMm(neu.durchmesserMm)} ÷ {formatMm(alt.durchmesserMm)} ={' '}
            <strong>{formatKmh(realGeschwindigkeit)} km/h</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Werte sind ein technischer Richtwert und{' '}
          <strong>kein Zulassungsnachweis</strong>. Verbindlich sind die in Ihrem Fahrzeugschein bzw.
          der CoC-Bescheinigung eingetragenen Größen (Ziffern 32 und 50) und die Reifenfreigaben des
          Herstellers. Nicht eingetragene Größen können den TÜV-/DEKRA-Eintrag erfordern; das Fahren
          ohne Zulassung kostet ein Bußgeld (ca. 50–90 €) und kann den Versicherungsschutz gefährden.
          Der Abrollumfang ist eine Näherung (Faktor ≈ 0,97). Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default ReifengroesseRechner;
