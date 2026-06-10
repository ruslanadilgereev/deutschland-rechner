import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════
// ABSTANDSVERSTOSS – Bußgeldkatalog (BKatV)
// Stand 2024/2025/2026. Werte 1:1 aus dem verifizierten BussgeldRechner.
// Abstand wird als Anteil des halben Tachos (= Mindestabstand) bewertet.
// Quelle: BKatV, ADAC
// ═══════════════════════════════════════════════════════════════

interface AbstandEintrag {
  anteil: string; // Beschreibung des Bruchteils des halben Tachos
  von: number; // untere Grenze (exklusiv) als Anteil 0..1
  bis: number; // obere Grenze (inklusiv) als Anteil 0..1
  bussgeld: number;
  punkte: number;
  fahrverbot: number;
}

// Tempo > 80 km/h
const ABSTAND_80: AbstandEintrag[] = [
  { anteil: '5/10 bis 4/10', von: 0.4, bis: 0.5, bussgeld: 75, punkte: 1, fahrverbot: 0 },
  { anteil: '4/10 bis 3/10', von: 0.3, bis: 0.4, bussgeld: 100, punkte: 1, fahrverbot: 0 },
  { anteil: '3/10 bis 2/10', von: 0.2, bis: 0.3, bussgeld: 160, punkte: 1, fahrverbot: 0 },
  { anteil: '2/10 bis 1/10', von: 0.1, bis: 0.2, bussgeld: 240, punkte: 1, fahrverbot: 0 },
  { anteil: 'weniger als 1/10', von: 0, bis: 0.1, bussgeld: 320, punkte: 1, fahrverbot: 0 },
];

// Tempo > 100 km/h
const ABSTAND_100: AbstandEintrag[] = [
  { anteil: '5/10 bis 4/10', von: 0.4, bis: 0.5, bussgeld: 75, punkte: 1, fahrverbot: 0 },
  { anteil: '4/10 bis 3/10', von: 0.3, bis: 0.4, bussgeld: 100, punkte: 1, fahrverbot: 0 },
  { anteil: '3/10 bis 2/10', von: 0.2, bis: 0.3, bussgeld: 160, punkte: 2, fahrverbot: 1 },
  { anteil: '2/10 bis 1/10', von: 0.1, bis: 0.2, bussgeld: 240, punkte: 2, fahrverbot: 2 },
  { anteil: 'weniger als 1/10', von: 0, bis: 0.1, bussgeld: 320, punkte: 2, fahrverbot: 3 },
];

// Tempo > 130 km/h
const ABSTAND_130: AbstandEintrag[] = [
  { anteil: '5/10 bis 4/10', von: 0.4, bis: 0.5, bussgeld: 100, punkte: 1, fahrverbot: 0 },
  { anteil: '4/10 bis 3/10', von: 0.3, bis: 0.4, bussgeld: 180, punkte: 1, fahrverbot: 0 },
  { anteil: '3/10 bis 2/10', von: 0.2, bis: 0.3, bussgeld: 240, punkte: 2, fahrverbot: 1 },
  { anteil: '2/10 bis 1/10', von: 0.1, bis: 0.2, bussgeld: 320, punkte: 2, fahrverbot: 2 },
  { anteil: 'weniger als 1/10', von: 0, bis: 0.1, bussgeld: 400, punkte: 2, fahrverbot: 3 },
];

function tabelleFuerTempo(tempo: number): { tabelle: AbstandEintrag[]; label: string } {
  if (tempo >= 130) return { tabelle: ABSTAND_130, label: 'über 130 km/h' };
  if (tempo >= 100) return { tabelle: ABSTAND_100, label: 'über 100 km/h' };
  return { tabelle: ABSTAND_80, label: 'über 80 km/h' };
}

export function AbstandsverstossRechner() {
  const [tempo, setTempo] = useState(120);
  const [abstand, setAbstand] = useState(15); // gefahrener Abstand in Metern

  // Eingabe robust in eine Zahl >= 0 umwandeln (leeres/ungültiges Feld = 0).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const ergebnis = useMemo(() => {
    // Mindestabstand nach Faustregel "halber Tacho" (in Metern).
    const halberTacho = tempo / 2;
    // Anteil des gefahrenen Abstands am Mindestabstand (gedeckelt auf 1).
    const anteil = halberTacho > 0 ? Math.min(1, abstand / halberTacho) : 1;

    // Unter 80 km/h: nur Verwarngeld, keine Punkte (analog Bestandsrechner).
    if (tempo < 80) {
      return {
        unter80: true,
        halberTacho,
        anteil,
        tempoLabel: 'unter 80 km/h',
        bussgeld: 25,
        punkte: 0,
        fahrverbot: 0,
        eintrag: null as AbstandEintrag | null,
      };
    }

    const { tabelle, label } = tabelleFuerTempo(tempo);
    const eintrag =
      tabelle.find((e) => anteil > e.von && anteil <= e.bis) || tabelle[tabelle.length - 1];

    return {
      unter80: false,
      halberTacho,
      anteil,
      tempoLabel: label,
      bussgeld: eintrag.bussgeld,
      punkte: eintrag.punkte,
      fahrverbot: eintrag.fahrverbot,
      eintrag,
    };
  }, [tempo, abstand]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatM = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const anteilProzent = Math.round(ergebnis.anteil * 100);

  const aktiveTabelle = ergebnis.unter80 ? null : tabelleFuerTempo(tempo).tabelle;

  return (
    <div className="max-w-2xl mx-auto">

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-6">
        {/* Geschwindigkeit */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gefahrene Geschwindigkeit</span>
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={tempo}
              onChange={(e) => setTempo(toNumber(e.target.value))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              km/h
            </span>
          </div>
          <input
            type="range"
            value={Math.min(200, tempo)}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min={30}
            max={200}
            step={5}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>30 km/h</span>
            <span>120 km/h</span>
            <span>200 km/h</span>
          </div>
        </div>

        {/* Abstand */}
        <div className="border-t border-gray-100 pt-5">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Eingehaltener Abstand</span>
            <span className="text-xs text-gray-500 block mt-1">
              Mindestabstand nach Faustregel „halber Tacho“: {formatM(ergebnis.halberTacho)} m
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={abstand}
              onChange={(e) => setAbstand(toNumber(e.target.value))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">m</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 mt-3 text-center text-sm text-gray-600">
            Das entspricht <strong className="text-orange-600">{anteilProzent} %</strong> des
            Mindestabstands.
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div
        className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
          ergebnis.fahrverbot > 0
            ? 'bg-gradient-to-br from-red-500 to-red-700'
            : ergebnis.punkte > 0
              ? 'bg-gradient-to-br from-orange-500 to-red-600'
              : 'bg-gradient-to-br from-yellow-500 to-orange-500'
        }`}
      >
        <h3 className="text-sm font-medium opacity-80 mb-1">📏 Abstandsverstoß – Ihre Strafe</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.bussgeld)}</span>
            <span className="text-xl opacity-80">Bußgeld</span>
          </div>
          <p className="mt-2 opacity-90">
            {ergebnis.unter80
              ? `Abstandsverstoß bei ${formatM(tempo)} km/h (Verwarngeld)`
              : `Abstand ${ergebnis.eintrag?.anteil} des halben Tachos · ${ergebnis.tempoLabel}`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Punkte in Flensburg</span>
            <div className="text-3xl font-bold">{ergebnis.punkte}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Fahrverbot</span>
            <div className="text-3xl font-bold">
              {ergebnis.fahrverbot > 0 ? `${ergebnis.fahrverbot} Mon.` : 'Nein'}
            </div>
          </div>
        </div>

        {ergebnis.unter80 ? (
          <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm">
              💡 Geahndet wird ein zu geringer Abstand als Ordnungswidrigkeit mit Punkten erst ab
              mehr als 80 km/h. Darunter gilt in der Regel nur ein Verwarngeld.
            </p>
          </div>
        ) : (
          ergebnis.fahrverbot > 0 && (
            <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm">
                💡 Bei hoher Geschwindigkeit und sehr geringem Abstand droht zusätzlich ein
                Fahrverbot von bis zu 3 Monaten.
              </p>
            </div>
          )
        )}
      </div>

      {/* Rechenweg */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-orange-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Mindestabstand</strong> = Geschwindigkeit ÷ 2 = {formatM(tempo)} ÷ 2 ={' '}
            <strong>{formatM(ergebnis.halberTacho)} m</strong> (halber Tacho)
          </p>
          <p>
            <strong>Anteil</strong> = gefahrener Abstand ÷ Mindestabstand = {formatM(abstand)} ÷{' '}
            {formatM(ergebnis.halberTacho)} = <strong>{anteilProzent} %</strong>
          </p>
          <p>
            Einstufung:{' '}
            <strong>
              {formatEuro(ergebnis.bussgeld)}, {ergebnis.punkte} Punkt(e)
              {ergebnis.fahrverbot > 0 ? `, ${ergebnis.fahrverbot} Monat(e) Fahrverbot` : ''}
            </strong>
          </p>
        </div>
      </div>

      {/* Übersichtstabelle */}
      {aktiveTabelle && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-2">
            📋 Bußgeldkatalog Abstand – {ergebnis.tempoLabel}
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Anteil des eingehaltenen Abstands am halben Tacho. Stand 2026.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-3">Abstand (Anteil ½ Tacho)</th>
                  <th className="text-right py-2 px-3">Bußgeld</th>
                  <th className="text-right py-2 px-3">Punkte</th>
                  <th className="text-right py-2 px-3">Fahrverbot</th>
                </tr>
              </thead>
              <tbody>
                {aktiveTabelle.map((row) => (
                  <tr
                    key={row.anteil}
                    className={`border-b border-gray-100 ${
                      ergebnis.eintrag?.anteil === row.anteil ? 'bg-orange-50 font-medium' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-gray-600">{row.anteil}</td>
                    <td className="py-2 px-3 text-right">{row.bussgeld} €</td>
                    <td className="py-2 px-3 text-right">{row.punkte}</td>
                    <td className="py-2 px-3 text-right text-red-600">
                      {row.fahrverbot > 0 ? `${row.fahrverbot} Mon.` : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/bkatv_2013/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bußgeldkatalog-Verordnung (BKatV) – Gesetze im Internet
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Bewertung folgt dem bundeseinheitlichen Bußgeldkatalog
          (BKatV, Stand 2026). Maßgeblich ist der von der Polizei gemessene Abstand; die
          Halber-Tacho-Regel dient hier nur als Orientierung. Keine Rechtsberatung. Angaben ohne
          Gewähr.
        </p>
      </div>
    </div>
  );
}

export default AbstandsverstossRechner;
