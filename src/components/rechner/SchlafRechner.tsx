import { useState } from 'react';

// Drei Modi: Aufstehzeit bekannt (wann ins Bett?), Zubettgehzeit bekannt
// (wann aufstehen?) oder "jetzt ins Bett" (aktuelle Uhrzeit als Start).
type Modus = 'aufstehen' | 'zubett' | 'jetzt';

// Ein vollständiger Schlafzyklus dauert im Schnitt 90 Minuten. Ziel sind
// 5–6 volle Zyklen (7,5–9 h), 4 Zyklen (6 h) gelten als Minimum.
const ZYKLEN_OPTIONEN = [6, 5, 4];

export function SchlafRechner() {
  const [modus, setModus] = useState<Modus>('aufstehen');
  const [uhrzeit, setUhrzeit] = useState('07:00');
  const [latenz, setLatenz] = useState(15);
  const [zyklusdauer, setZyklusdauer] = useState(90);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Wandelt "HH:MM" in Minuten seit Mitternacht um (robust gegen leere Eingabe).
  const parseUhrzeit = (s: string): number => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(s);
    if (!m) return 0;
    const h = Math.min(23, Math.max(0, Number(m[1])));
    const min = Math.min(59, Math.max(0, Number(m[2])));
    return h * 60 + min;
  };

  // Wandelt Minuten (auch negativ oder > 1440) modulo 24 h in "HH:MM" um.
  const formatMinuten = (minuten: number): string => {
    const m = ((Math.round(minuten) % 1440) + 1440) % 1440;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

  // Stellt die aktuelle Uhrzeit ein (nur im "jetzt"-Modus, läuft im Browser).
  const jetztSetzen = () => {
    const now = new Date();
    setUhrzeit(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
  };

  const basisMinuten = parseUhrzeit(uhrzeit);
  const dauer = zyklusdauer > 0 ? zyklusdauer : 90;

  // Erzeugt für jede Zyklenzahl eine Ergebniszeile.
  type Ergebnis = { zyklen: number; zeit: string; stunden: number };

  const ergebnisse: Ergebnis[] = ZYKLEN_OPTIONEN.map((zyklen) => {
    const schlafMinuten = zyklen * dauer;
    let zielMinuten: number;

    if (modus === 'aufstehen') {
      // Aufstehzeit bekannt → wann ins Bett gehen?
      // Zubett = Aufwachzeit − Schlafdauer − Einschlaf-Latenz
      zielMinuten = basisMinuten - schlafMinuten - latenz;
    } else {
      // Zubettgehzeit ("zubett") oder aktuelle Zeit ("jetzt") bekannt → wann aufstehen?
      // Aufwach = Startzeit + Einschlaf-Latenz + Schlafdauer
      zielMinuten = basisMinuten + latenz + schlafMinuten;
    }

    return {
      zyklen,
      zeit: formatMinuten(zielMinuten),
      stunden: schlafMinuten / 60,
    };
  });

  const fmtStunden = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  const ergebnisTitel =
    modus === 'aufstehen' ? 'Diese Zeiten sollten Sie ins Bett gehen' : 'Zu diesen Zeiten sollten Sie aufwachen';

  return (
    <div className="max-w-lg mx-auto">

      {/* Modus-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Was möchten Sie wissen?</span>
        <div className="grid grid-cols-1 gap-2">
          {([
            { key: 'aufstehen', label: '⏰ Ich muss um … aufstehen', sub: 'Wann sollte ich ins Bett?' },
            { key: 'zubett', label: '🛏️ Ich gehe um … ins Bett', sub: 'Wann sollte ich aufwachen?' },
            { key: 'jetzt', label: '😴 Ich gehe jetzt ins Bett', sub: 'Wann sollte ich aufwachen?' },
          ] as { key: Modus; label: string; sub: string }[]).map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setModus(m.key);
                if (m.key === 'jetzt') jetztSetzen();
              }}
              className={`text-left p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                modus === m.key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="block">{m.label}</span>
              <span className="block text-xs text-gray-400 mt-0.5">{m.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {modus !== 'jetzt' && (
          <label className="block">
            <span className="text-gray-700 font-medium">
              {modus === 'aufstehen' ? 'Gewünschte Aufstehzeit' : 'Geplante Zubettgehzeit'}
            </span>
            <div className="mt-2">
              <input
                type="time"
                value={uhrzeit}
                onChange={(e) => setUhrzeit(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </label>
        )}

        {modus === 'jetzt' && (
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700">
            <p className="mb-2">
              Als Startzeit wird die <strong>aktuelle Uhrzeit</strong> verwendet ({uhrzeit} Uhr).
            </p>
            <button
              onClick={jetztSetzen}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all"
            >
              Aktuelle Uhrzeit aktualisieren
            </button>
          </div>
        )}

        <label className="block">
          <span className="text-gray-700 font-medium">Einschlafzeit (Latenz)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              step={5}
              value={latenz}
              onChange={(e) => setLatenz(Math.min(60, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Min.</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Zeit, die Sie zum Einschlafen brauchen. Durchschnitt rund 15 Minuten (10–20).
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Dauer eines Schlafzyklus</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="numeric"
              min={60}
              max={120}
              step={5}
              value={zyklusdauer}
              onChange={(e) => setZyklusdauer(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Min.</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Durchschnitt 90 Minuten. Individuell schwankt die Zyklusdauer zwischen 80 und 110 Minuten.
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-4">{ergebnisTitel}</h3>

        <div className="space-y-3">
          {ergebnisse.map((e) => {
            // 5–6 Zyklen sind ideal und werden hervorgehoben.
            const ideal = e.zyklen >= 5;
            return (
              <div
                key={e.zyklen}
                className={`rounded-xl p-4 backdrop-blur-sm ${
                  ideal ? 'bg-white/25 ring-2 ring-white/60' : 'bg-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold">{e.zeit} Uhr</span>
                    {ideal && <span className="ml-2 text-xs bg-white/30 px-2 py-0.5 rounded-full">empfohlen</span>}
                  </div>
                  <div className="text-right text-sm text-blue-100">
                    <div>{e.zyklen} Zyklen</div>
                    <div>{fmtStunden(e.stunden)} h Schlaf</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-blue-200 text-xs mt-4">
          {modus === 'aufstehen'
            ? `Berechnet, damit Sie am Ende eines vollständigen Zyklus aufwachen (Aufstehzeit ${uhrzeit} Uhr).`
            : 'Wachen Sie am Ende eines vollständigen Zyklus auf, fühlen Sie sich erholter als mitten in einer Tiefschlafphase.'}
        </p>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          {modus === 'aufstehen' ? (
            <p>
              <strong>Zubettgehzeit</strong> = Aufstehzeit − (Zyklen × {dauer} Min) − {latenz} Min Einschlafzeit.
              Beispiel 6 Zyklen: {uhrzeit} − {6 * dauer} Min − {latenz} Min = <strong>{ergebnisse[0].zeit} Uhr</strong>.
            </p>
          ) : (
            <p>
              <strong>Aufwachzeit</strong> = Startzeit + {latenz} Min Einschlafzeit + (Zyklen × {dauer} Min).
              Beispiel 6 Zyklen: {uhrzeit} + {latenz} Min + {6 * dauer} Min = <strong>{ergebnisse[0].zeit} Uhr</strong>.
            </p>
          )}
          <p>Zeiten über Mitternacht werden korrekt umgerechnet (modulo 24 Stunden).</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Berechnung beruht auf der durchschnittlichen Zyklusdauer von rund
          90 Minuten. Tatsächlich schwanken Zyklusdauer (80–110 Minuten) und individueller Schlafbedarf von
          Mensch zu Mensch. Der Rechner ersetzt keine ärztliche Beratung – bei anhaltenden Schlafproblemen
          wenden Sie sich an Ärztin, Arzt oder eine Schlafmedizinerin. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default SchlafRechner;
