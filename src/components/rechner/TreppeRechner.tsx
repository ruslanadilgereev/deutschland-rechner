import { useState, useMemo } from 'react';

// Berechnungsmodus: entweder eine gewünschte Steigungshöhe vorgeben (daraus
// folgt die Stufenzahl) oder die Stufenzahl direkt festlegen.
type Modus = 'steigung' | 'stufen';

// DIN-18065-Hauptmaße als Orientierung (DIN kostenpflichtig, daher Richtwerte).
// Steigungshöhe s und Auftritt a in cm, Mindestlaufbreite in cm.
const DIN_TYPEN = [
  {
    name: 'Notwendige Treppe (Gebäude mit mehr als 2 Wohnungen)',
    sMin: 14.0,
    sMax: 19.0,
    aMin: 26.0,
    aMax: 37.0,
    breite: 100,
  },
  {
    name: 'Wohngebäude bis 2 Wohnungen / Treppen innerhalb von Wohnungen',
    sMin: 14.0,
    sMax: 20.0,
    aMin: 23.0,
    aMax: 37.0,
    breite: 80,
  },
] as const;

// Standard-Annahme für den s-Bereichs-Check: Wohngebäude bis 2 Wohnungen.
const STANDARD_S_MIN = 14.0;
const STANDARD_S_MAX = 20.0;

export function TreppeRechner() {
  const [modus, setModus] = useState<Modus>('steigung');

  // Geschosshöhe (Rohbau) in cm.
  const [geschosshoehe, setGeschosshoehe] = useState(280);
  // Gewünschte Steigungshöhe (Modus "steigung").
  const [wunschSteigung, setWunschSteigung] = useState(18);
  // Stufenzahl direkt (Modus "stufen").
  const [stufenInput, setStufenInput] = useState(16);
  // Auftritt optional – leer (0) → aus Schrittmaßregel 63 − 2·s.
  const [auftrittInput, setAuftrittInput] = useState(0);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Alle abgeleiteten Werte gebündelt in useMemo (vollständiges Dependency-Array).
  const erg = useMemo(() => {
    // Stufenzahl bestimmen: gerundet aus Steigung oder direkt vorgegeben (min. 1).
    let n: number;
    if (modus === 'steigung') {
      n = wunschSteigung > 0 ? Math.round(geschosshoehe / wunschSteigung) : 0;
    } else {
      n = Math.round(stufenInput);
    }
    n = Math.max(1, n);

    // Exakte Steigungshöhe: n Steigungen verteilen die Geschosshöhe gleichmäßig.
    const s = geschosshoehe / n;

    // Auftritt: vorgegeben oder aus Schrittmaßregel (Idealschrittmaß 63 cm).
    const a = auftrittInput > 0 ? auftrittInput : Math.max(0, 63 - 2 * s);

    // Die drei Maßregeln.
    const schrittmass = 2 * s + a; // Schrittmaßregel 2s + a
    const sicherheit = s + a; // Sicherheitsregel s + a
    const bequemlichkeit = a - s; // Bequemlichkeitsregel a − s

    // Steigungswinkel in Grad.
    const winkel = a > 0 ? (Math.atan(s / a) * 180) / Math.PI : 0;

    // Horizontale Grundrissprojektion: (n − 1) Auftritte, weil die oberste
    // Stufe = Austrittsebene/Podest keinen weiteren Auftritt projiziert.
    const lauflaenge = (n - 1) * a;

    // Schräge Lauflinienlänge (Hypotenuse aus Geschosshöhe und Lauflänge).
    const schraege = Math.sqrt(geschosshoehe * geschosshoehe + lauflaenge * lauflaenge);

    // Ampel Schrittmaßregel: grün 59–65, gelb 57–67, sonst rot.
    let smStatus: 'gruen' | 'gelb' | 'rot';
    if (schrittmass >= 59 && schrittmass <= 65) smStatus = 'gruen';
    else if (schrittmass >= 57 && schrittmass <= 67) smStatus = 'gelb';
    else smStatus = 'rot';

    // Sicherheitsregel: Ziel 46, Toleranz 44–48.
    const sichOk = sicherheit >= 44 && sicherheit <= 48;
    // Bequemlichkeitsregel: Ziel 12, Toleranz 10–14.
    const bequemOk = bequemlichkeit >= 10 && bequemlichkeit <= 14;

    // DIN-Bereichs-Check für die exakte Steigungshöhe (Standard: Wohngebäude bis 2 Wohnungen).
    const sImDinBereich = s >= STANDARD_S_MIN && s <= STANDARD_S_MAX;

    return {
      n,
      s,
      a,
      schrittmass,
      sicherheit,
      bequemlichkeit,
      winkel,
      lauflaenge,
      schraege,
      smStatus,
      sichOk,
      bequemOk,
      sImDinBereich,
    };
  }, [modus, geschosshoehe, wunschSteigung, stufenInput, auftrittInput]);

  const fmt1 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const fmt0 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Farbverlauf des Hauptergebnisses je nach Ampel.
  const gradient =
    erg.smStatus === 'gruen'
      ? 'from-emerald-500 to-teal-600'
      : erg.smStatus === 'gelb'
        ? 'from-amber-500 to-orange-600'
        : 'from-red-500 to-rose-600';
  const accentLight =
    erg.smStatus === 'gruen'
      ? 'text-emerald-100'
      : erg.smStatus === 'gelb'
        ? 'text-amber-100'
        : 'text-red-100';
  const accentLighter =
    erg.smStatus === 'gruen'
      ? 'text-emerald-200'
      : erg.smStatus === 'gelb'
        ? 'text-amber-200'
        : 'text-red-200';
  const smLabel =
    erg.smStatus === 'gruen'
      ? 'ideal (59–65 cm)'
      : erg.smStatus === 'gelb'
        ? 'grenzwertig (57–67 cm)'
        : 'ungünstig (außerhalb 57–67 cm)';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Modus-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Was möchtest du vorgeben?</span>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'steigung', label: 'Steigung vorgeben' },
            { key: 'stufen', label: 'Stufenzahl vorgeben' },
          ] as { key: Modus; label: string }[]).map((m) => (
            <button
              key={m.key}
              onClick={() => setModus(m.key)}
              className={`p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                modus === m.key
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Geschosshöhe (Rohbau)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={geschosshoehe}
              onChange={(e) => setGeschosshoehe(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Fertighöhe von Oberkante Fertigfußboden unten bis Oberkante Fertigfußboden oben.
          </span>
        </label>

        {modus === 'steigung' && (
          <label className="block">
            <span className="text-gray-700 font-medium">Gewünschte Steigungshöhe</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={wunschSteigung}
                onChange={(e) => setWunschSteigung(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Die Stufenzahl wird gerundet; die tatsächliche Steigung kann leicht abweichen.
            </span>
          </label>
        )}

        {modus === 'stufen' && (
          <label className="block">
            <span className="text-gray-700 font-medium">Stufenzahl</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={stufenInput}
                onChange={(e) => setStufenInput(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Stufen</span>
            </div>
          </label>
        )}

        <label className="block">
          <span className="text-gray-700 font-medium">Auftritt (optional)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={auftrittInput || ''}
              onChange={(e) => setAuftrittInput(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-0 focus:border-orange-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Leer lassen → Auftritt wird aus der Schrittmaßregel berechnet (63 − 2·s).
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-lg p-6 text-white`}>
        <h3 className={`text-sm font-medium ${accentLight} mb-1`}>Schrittmaß (2·s + a)</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{fmt1(erg.schrittmass)}</span>
            <span className={`text-xl ${accentLighter}`}>cm</span>
          </div>
          <p className={`${accentLighter} text-sm mt-1`}>{smLabel}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className={`text-xs ${accentLight} mb-1`}>Stufenzahl</div>
            <div className="text-2xl font-bold">{fmt0(erg.n)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className={`text-xs ${accentLight} mb-1`}>Steigungshöhe s</div>
            <div className="text-2xl font-bold">{fmt1(erg.s)} cm</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className={`text-xs ${accentLight} mb-1`}>Auftritt a</div>
            <div className="text-2xl font-bold">{fmt1(erg.a)} cm</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className={`text-xs ${accentLight} mb-1`}>Steigungswinkel</div>
            <div className="text-2xl font-bold">{fmt1(erg.winkel)}°</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className={accentLight}>Sicherheitsregel (s + a)</span>
              <span className="text-lg font-bold">
                {fmt1(erg.sicherheit)} cm {erg.sichOk ? '✓' : '⚠'}
              </span>
            </div>
            <p className={`${accentLighter} text-xs mt-1`}>Zielwert 46 cm · Toleranz 44–48 cm</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className={accentLight}>Bequemlichkeitsregel (a − s)</span>
              <span className="text-lg font-bold">
                {fmt1(erg.bequemlichkeit)} cm {erg.bequemOk ? '✓' : '⚠'}
              </span>
            </div>
            <p className={`${accentLighter} text-xs mt-1`}>Zielwert 12 cm · Toleranz 10–14 cm</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className={accentLight}>Lauflänge (Grundriss)</span>
              <span className="text-lg font-bold">{fmt1(erg.lauflaenge)} cm</span>
            </div>
            <p className={`${accentLighter} text-xs mt-1`}>
              Schräge Lauflinie ≈ {fmt1(erg.schraege)} cm
            </p>
          </div>
        </div>
      </div>

      {/* DIN-Bereichs-Hinweis */}
      <div
        className={`mt-6 p-4 rounded-xl text-sm border ${
          erg.sImDinBereich
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}
      >
        {erg.sImDinBereich ? (
          <p>
            <strong>Steigungshöhe {fmt1(erg.s)} cm im DIN-Bereich.</strong> Für Wohngebäude bis 2
            Wohnungen liegt die zulässige Steigungshöhe bei 14,0–20,0 cm – dein Wert passt
            (Orientierung nach DIN 18065).
          </p>
        ) : (
          <p>
            <strong>Achtung: Steigungshöhe {fmt1(erg.s)} cm außerhalb 14,0–20,0 cm.</strong> Für
            Wohngebäude bis 2 Wohnungen empfiehlt die DIN 18065 (Orientierung) 14,0–20,0 cm. Passe
            Geschosshöhe oder Stufenzahl an.
          </p>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-emerald-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Stufenzahl n</strong> ={' '}
            {modus === 'steigung' ? (
              <>
                round(Geschosshöhe ÷ Steigung) = round({fmt0(geschosshoehe)} ÷ {fmt1(wunschSteigung)}){' '}
                = <strong>{fmt0(erg.n)}</strong>
              </>
            ) : (
              <>
                vorgegeben = <strong>{fmt0(erg.n)}</strong>
              </>
            )}
          </p>
          <p>
            <strong>Steigungshöhe s</strong> = Geschosshöhe ÷ n = {fmt0(geschosshoehe)} ÷ {fmt0(erg.n)}{' '}
            = <strong>{fmt1(erg.s)} cm</strong>
          </p>
          <p>
            <strong>Auftritt a</strong> ={' '}
            {auftrittInput > 0 ? (
              <>
                vorgegeben = <strong>{fmt1(erg.a)} cm</strong>
              </>
            ) : (
              <>
                63 − 2·s = 63 − 2·{fmt1(erg.s)} = <strong>{fmt1(erg.a)} cm</strong>
              </>
            )}
          </p>
          <p>
            <strong>Schrittmaß</strong> = 2·s + a = 2·{fmt1(erg.s)} + {fmt1(erg.a)} ={' '}
            <strong>{fmt1(erg.schrittmass)} cm</strong>
          </p>
          <p>
            <strong>Steigungswinkel</strong> = arctan(s ÷ a) = arctan({fmt1(erg.s)} ÷ {fmt1(erg.a)}){' '}
            = <strong>{fmt1(erg.winkel)}°</strong>
          </p>
          <p>
            <strong>Lauflänge</strong> = (n − 1)·a = ({fmt0(erg.n)} − 1)·{fmt1(erg.a)} ={' '}
            <strong>{fmt1(erg.lauflaenge)} cm</strong>
          </p>
        </div>
      </div>

      {/* DIN-Hauptmaße-Tabelle */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📏 DIN-18065-Hauptmaße (Orientierung)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Treppentyp</th>
                <th className="px-3 py-2 text-left">Steigung s</th>
                <th className="px-3 py-2 text-left">Auftritt a</th>
                <th className="px-3 py-2 text-left">Laufbreite</th>
              </tr>
            </thead>
            <tbody>
              {DIN_TYPEN.map((t) => (
                <tr key={t.name} className="border-b align-top">
                  <td className="px-3 py-2">{t.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {fmt1(t.sMin)}–{fmt1(t.sMax)} cm
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {fmt1(t.aMin)}–{fmt1(t.aMax)} cm
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">min. {fmt0(t.breite)} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Die Maße müssen exakt eingehalten werden – es gibt <strong>keinen Toleranzbereich</strong> bei
          den Grenzwerten der Hauptmaße. Aufeinanderfolgende Stufen dürfen um max. 5 mm in
          Steigung/Auftritt voneinander abweichen, dürfen die Grenzwerte aber nie über- oder
          unterschreiten.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Schätzung – keine Steuer-/Rechtsberatung.</strong> Die trigonometrische
          Treppenberechnung (Stufenzahl, Steigung, Auftritt, Schrittmaß, Winkel, Lauflänge) ist
          mathematisch exakt. Die genannten Maßregeln und Grenzwerte orientieren sich an der DIN 18065
          (Gebäudetreppen) und dienen als Orientierung – sie ersetzen keine Fachplanung. Die DIN-Norm
          selbst ist kostenpflichtig und wird hier nicht im Wortlaut wiedergegeben. Verbindlich sind die
          jeweilige Landesbauordnung und die Norm im Original. Angaben ohne Gewähr.
        </p>
        <p className="mt-2">
          <strong>Quellen (Orientierung):</strong>{' '}
          <a
            href="https://www.tuvsud.com/de-de/indust-re/bautechnik-info/allgemeine-bautechnik/treppen-bruestungen-gelaender/din-18065"
            target="_blank"
            rel="noopener"
            className="underline"
          >
            TÜV SÜD – DIN 18065
          </a>
          ,{' '}
          <a
            href="https://www.normenportal-barrierefreiheit.de/resource/blob/1253920/03ba5bd33b4c0d9592d3d776b1919701/90716-006-din-18065-data.pdf"
            target="_blank"
            rel="noopener"
            className="underline"
          >
            Normenportal Barrierefreiheit – DIN 18065
          </a>
          ,{' '}
          <a
            href="https://www.baunetzwissen.de/treppen/fachwissen/planungsgrundlagen/steigungsverhaeltnis-167510"
            target="_blank"
            rel="noopener"
            className="underline"
          >
            Steigungsverhältnis (Planungsgrundlagen)
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default TreppeRechner;
