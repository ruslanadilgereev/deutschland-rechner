import { useState } from 'react';

// Hundealter in Menschenjahre – größenabhängige Umrechnung
// Grundlage: Tabelle des American Kennel Club (AKC), basierend auf
// Empfehlungen der American Veterinary Medical Association (AVMA).
// In den ersten Jahren altern alle Hunde ähnlich (1 Jahr ≈ 15, 2 Jahre ≈ 24),
// ab dem 6. Lebensjahr altern größere Hunde deutlich schneller.
// Quelle: https://www.akc.org/expert-advice/health/how-to-calculate-dog-years-to-human-years/

type Groesse = 'klein' | 'mittel' | 'gross' | 'sehrgross';

// Stützstellen je Hundejahr (1–16). Lineare Interpolation für Zwischenwerte.
const TABELLE: Record<Groesse, Record<number, number>> = {
  // bis 9 kg
  klein:    { 1: 15, 2: 24, 3: 28, 4: 32, 5: 36, 6: 40, 7: 44, 8: 48, 9: 52, 10: 56, 11: 60, 12: 64, 13: 68, 14: 72, 15: 76, 16: 80 },
  // 10–22 kg
  mittel:   { 1: 15, 2: 24, 3: 28, 4: 32, 5: 36, 6: 42, 7: 47, 8: 51, 9: 56, 10: 60, 11: 65, 12: 69, 13: 74, 14: 78, 15: 83, 16: 87 },
  // 23–40 kg
  gross:    { 1: 15, 2: 24, 3: 28, 4: 32, 5: 36, 6: 45, 7: 50, 8: 55, 9: 61, 10: 66, 11: 72, 12: 77, 13: 82, 14: 88, 15: 93, 16: 99 },
  // über 40 kg
  sehrgross:{ 1: 15, 2: 24, 3: 28, 4: 31, 5: 35, 6: 49, 7: 56, 8: 64, 9: 71, 10: 79, 11: 86, 12: 93, 13: 100, 14: 107, 15: 114, 16: 121 },
};

const GROESSEN: { id: Groesse; label: string; gewicht: string; icon: string }[] = [
  { id: 'klein', label: 'Klein', gewicht: 'bis 9 kg', icon: '🐶' },
  { id: 'mittel', label: 'Mittel', gewicht: '10–22 kg', icon: '🐕' },
  { id: 'gross', label: 'Groß', gewicht: '23–40 kg', icon: '🐕‍🦺' },
  { id: 'sehrgross', label: 'Sehr groß', gewicht: 'über 40 kg', icon: '🐩' },
];

function menschenjahre(alter: number, groesse: Groesse): number {
  const t = TABELLE[groesse];
  if (alter <= 1) {
    // Welpen: vom ersten Lebensjahr linear hochrechnen
    return Math.round(alter * t[1]);
  }
  if (alter >= 16) {
    // über die Tabelle hinaus konservativ mit dem Schnitt der letzten beiden Jahre fortschreiben
    const proJahr = t[16] - t[15];
    return Math.round(t[16] + (alter - 16) * proJahr);
  }
  const unten = Math.floor(alter);
  const oben = Math.ceil(alter);
  if (unten === oben) return t[unten];
  const anteil = alter - unten;
  return Math.round(t[unten] + (t[oben] - t[unten]) * anteil);
}

function lebensphase(menschen: number): { text: string; farbe: string } {
  if (menschen < 18) return { text: 'Welpe / Junghund', farbe: 'text-amber-200' };
  if (menschen < 30) return { text: 'Junger Erwachsener', farbe: 'text-amber-200' };
  if (menschen < 50) return { text: 'Erwachsen, in den besten Jahren', farbe: 'text-amber-200' };
  if (menschen < 65) return { text: 'Reifer Hund', farbe: 'text-amber-200' };
  return { text: 'Senior', farbe: 'text-amber-200' };
}

export function HundealterRechner() {
  const [alter, setAlter] = useState<number>(3);
  const [groesse, setGroesse] = useState<Groesse>('mittel');

  const menschen = menschenjahre(alter, groesse);
  const phase = lebensphase(menschen);
  const aktiveGroesse = GROESSEN.find((g) => g.id === groesse)!;

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Hundealter */}
        <label className="block mb-6">
          <span className="text-gray-700 font-medium">Alter des Hundes (in Jahren)</span>
          <div className="mt-3 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setAlter(Math.max(0.5, Math.round((alter - 0.5) * 2) / 2))}
              className="w-14 h-14 rounded-full bg-gray-100 text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40"
              disabled={alter <= 0.5}
              aria-label="Alter verringern"
            >
              −
            </button>
            <span className="text-5xl font-bold text-amber-600 w-28 text-center">
              {alter.toLocaleString('de-DE')}
            </span>
            <button
              type="button"
              onClick={() => setAlter(Math.min(25, Math.round((alter + 0.5) * 2) / 2))}
              className="w-14 h-14 rounded-full bg-amber-500 text-2xl font-bold text-white hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-40"
              disabled={alter >= 25}
              aria-label="Alter erhöhen"
            >
              +
            </button>
          </div>
          <input
            type="range"
            min={0.5}
            max={20}
            step={0.5}
            value={Math.min(alter, 20)}
            onChange={(e) => setAlter(parseFloat(e.target.value))}
            className="w-full mt-5 accent-amber-500"
            aria-label="Alter des Hundes"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>6 Monate</span>
            <span>20 Jahre</span>
          </div>
        </label>

        {/* Größenklasse */}
        <div>
          <span className="text-gray-700 font-medium">Größe der Rasse</span>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {GROESSEN.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGroesse(g.id)}
                className={`rounded-xl border-2 p-3 text-left transition-all ${
                  groesse === g.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{g.label}</p>
                    <p className="text-xs text-gray-500">{g.gewicht}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-amber-100 mb-1">
          Ihr Hund in Menschenjahren
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{menschen.toLocaleString('de-DE')}</span>
            <span className="text-xl text-amber-200">Menschenjahre</span>
          </div>
          <p className={`mt-2 text-sm font-medium ${phase.farbe}`}>{phase.text}</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-amber-100">Hundealter</span>
            <span className="font-bold">{alter.toLocaleString('de-DE')} Jahre</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-amber-100">Größenklasse</span>
            <span className="font-bold">
              {aktiveGroesse.label} ({aktiveGroesse.gewicht})
            </span>
          </div>
        </div>
      </div>

      {/* Vergleich aller Größen */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">
          ⚖️ {alter.toLocaleString('de-DE')} Hundejahre nach Größe
        </h3>
        <div className="space-y-2">
          {GROESSEN.map((g) => {
            const wert = menschenjahre(alter, g.id);
            const max = menschenjahre(alter, 'sehrgross') || 1;
            return (
              <div key={g.id} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-gray-600">{g.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      g.id === groesse ? 'bg-amber-500' : 'bg-amber-300'
                    }`}
                    style={{ width: `${Math.max(8, (wert / max) * 100)}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right font-semibold text-gray-800">
                  {wert}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Bis zum 5. Lebensjahr altern alle Hunde nahezu gleich. Erst danach altern
          große und sehr große Rassen spürbar schneller.
        </p>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Umrechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Das <strong>erste Lebensjahr</strong> zählt für alle Hunde etwa{' '}
              <strong>15 Menschenjahre</strong>
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Das <strong>zweite Jahr</strong> bringt rund <strong>9 weitere</strong>{' '}
              Menschenjahre (zusammen ≈ 24)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Ab dem 6. Jahr altern <strong>große Rassen schneller</strong> als kleine –
              je nach Größenklasse 4 bis 9 Menschenjahre pro Hundejahr
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Die alte Faustregel „1 Hundejahr = 7 Menschenjahre“ gilt als{' '}
              <strong>überholt</strong>
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>⚠️ Hinweis:</strong> Diese Umrechnung ist ein anerkannter Richtwert,
          ersetzt aber keine tierärztliche Beurteilung. Das tatsächliche Altern hängt von
          Rasse, Gesundheit, Ernährung und Haltung ab. Alle Angaben ohne Gewähr und ohne
          tierärztliche Beratung.
        </p>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.akc.org/expert-advice/health/how-to-calculate-dog-years-to-human-years/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            American Kennel Club – Dog Years to Human Years Chart
          </a>
          <a
            href="https://www.zooplus.de/magazin/hund/hundehaltung/hundejahre-in-menschenjahren"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            zooplus Magazin – Hundejahre in Menschenjahre umrechnen
          </a>
        </div>
      </div>
    </div>
  );
}

export default HundealterRechner;
