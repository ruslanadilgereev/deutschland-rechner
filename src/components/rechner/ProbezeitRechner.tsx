import { useState, useMemo } from 'react';

// Probezeit-Rechner: Ende der Probezeit, verkürzte 2-Wochen-Kündigungsfrist (§ 622 Abs. 3 BGB)
// und Übergang zur gesetzlichen Grundkündigungsfrist (§ 622 Abs. 1 BGB).

interface Ergebnis {
  eintritt: Date;
  probezeitEnde: Date;       // letzter Tag der Probezeit (taggenau)
  spaetesterZugang: Date;    // letzter Tag, an dem eine Probezeit-Kündigung noch zugehen muss
  arbeitsverhaeltnisEnde: Date; // bei Zugang am letzten Probezeit-Tag: + 14 Tage
  grundfristAb: Date;        // ab diesem Tag gilt die 4-Wochen-Grundfrist
  probezeitMonate: number;
}

const PROBEZEIT_FRIST_TAGE = 14; // § 622 Abs. 3 BGB: verkürzte Frist = 2 Wochen
const MAX_PROBEZEIT_MONATE = 6;  // § 622 Abs. 3 BGB: längstens 6 Monate

export default function ProbezeitRechner() {
  const heute = new Date();
  const [eintrittsdatum, setEintrittsdatum] = useState(heute.toISOString().split('T')[0]);
  const [probezeitMonate, setProbezeitMonate] = useState(6);

  const ergebnis = useMemo<Ergebnis | null>(() => {
    const eintritt = new Date(eintrittsdatum);
    if (isNaN(eintritt.getTime())) {
      return null;
    }

    // UTC-sicher rechnen, um Tagesverschiebungen durch Zeitzonen zu vermeiden.
    const e = eintritt;
    const ende = new Date(Date.UTC(
      e.getUTCFullYear(),
      e.getUTCMonth() + probezeitMonate,
      e.getUTCDate()
    ));
    ende.setUTCDate(ende.getUTCDate() - 1); // letzter Tag der Probezeit

    // Spätester Zugang einer Probezeit-Kündigung = letzter Tag der Probezeit.
    const spaetesterZugang = new Date(ende.getTime());

    // Bei Zugang am letzten Probezeit-Tag: Frist beginnt am Folgetag (§ 187 Abs. 1 BGB),
    // endet nach 14 Tagen (§ 188 Abs. 1 BGB).
    const arbeitsverhaeltnisEnde = new Date(ende.getTime());
    arbeitsverhaeltnisEnde.setUTCDate(arbeitsverhaeltnisEnde.getUTCDate() + PROBEZEIT_FRIST_TAGE);

    // Ab dem Tag nach Probezeitende gilt die gesetzliche Grundfrist (§ 622 Abs. 1 BGB).
    const grundfristAb = new Date(ende.getTime());
    grundfristAb.setUTCDate(grundfristAb.getUTCDate() + 1);

    return {
      eintritt,
      probezeitEnde: ende,
      spaetesterZugang,
      arbeitsverhaeltnisEnde,
      grundfristAb,
      probezeitMonate,
    };
  }, [eintrittsdatum, probezeitMonate]);

  const formatDatumLang = (datum: Date): string =>
    datum.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

  const formatDatumKurz = (datum: Date): string =>
    datum.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Daten eingeben</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Eintrittsdatum (Beginn des Arbeitsverhältnisses)</label>
          <input
            type="date"
            value={eintrittsdatum}
            onChange={(e) => setEintrittsdatum(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vereinbarte Probezeit (max. 6 Monate)
          </label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setProbezeitMonate(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  probezeitMonate === m
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {m} {m === 1 ? 'Monat' : 'Monate'}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Eine Probezeit darf nach § 622 Abs. 3 BGB höchstens {MAX_PROBEZEIT_MONATE} Monate dauern.
          </p>
        </div>
      </div>

      {/* Ergebnis Section */}
      {ergebnis && (
        <>
          {/* Hero-Card: Probezeit-Ende */}
          <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-orange-500 to-amber-600">
            <div className="text-center mb-4">
              <p className="text-sm text-orange-100">Ende der Probezeit (letzter Tag)</p>
              <p className="text-4xl sm:text-5xl font-bold mt-1">
                {formatDatumKurz(ergebnis.probezeitEnde)}
              </p>
              <p className="text-sm mt-2 text-orange-200">
                {formatDatumLang(ergebnis.probezeitEnde)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-orange-400">
              <div className="text-center">
                <p className="text-2xl font-bold">2 Wochen</p>
                <p className="text-xs text-orange-200">Kündigungsfrist in der Probezeit (§ 622 Abs. 3 BGB)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatDatumKurz(ergebnis.spaetesterZugang)}</p>
                <p className="text-xs text-orange-200">Spätester Zugang einer Probezeit-Kündigung</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatDatumKurz(ergebnis.grundfristAb)}</p>
                <p className="text-xs text-orange-200">Ab hier gilt die Grundfrist (4 Wochen)</p>
              </div>
            </div>
          </div>

          {/* Detaillierte Aufstellung */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">📊 Detaillierte Aufstellung</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Eintrittsdatum</span>
                <span className="font-semibold text-gray-800">{formatDatumLang(ergebnis.eintritt)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Vereinbarte Probezeit</span>
                <span className="font-semibold text-gray-800">
                  {ergebnis.probezeitMonate} {ergebnis.probezeitMonate === 1 ? 'Monat' : 'Monate'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 bg-orange-50 -mx-2 px-2 rounded-lg">
                <span className="font-bold text-gray-800">Ende der Probezeit</span>
                <span className="font-bold text-orange-600 text-lg text-right">{formatDatumLang(ergebnis.probezeitEnde)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Spätester Zugang einer Kündigung mit 2-Wochen-Frist</span>
                <span className="font-semibold text-gray-800 text-right">{formatDatumLang(ergebnis.spaetesterZugang)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Bei Zugang am letzten Probezeit-Tag endet das Arbeitsverhältnis</span>
                <span className="font-semibold text-gray-800 text-right">{formatDatumLang(ergebnis.arbeitsverhaeltnisEnde)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Ab hier gilt die Grundfrist (4 Wochen zum 15./Monatsende)</span>
                <span className="font-semibold text-gray-800 text-right">{formatDatumLang(ergebnis.grundfristAb)}</span>
              </div>
            </div>
          </div>

          {/* Hinweis zur Probezeit-Kündigung */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-blue-800 mb-2">ℹ️ Während der Probezeit kündigen</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Während der Probezeit gilt für beide Seiten eine verkürzte Kündigungsfrist von <strong>2 Wochen</strong> (§ 622 Abs. 3 BGB) – ohne festen Kündigungstermin.</li>
              <li>• Die Kündigung muss spätestens am letzten Tag der Probezeit <strong>zugehen</strong>; die 2-Wochen-Frist darf danach noch in die feste Anstellung hineinlaufen.</li>
              <li>• Ab dem Tag nach Probezeitende gilt die gesetzliche <strong>Grundkündigungsfrist von 4 Wochen zum 15. oder zum Ende eines Kalendermonats</strong> (§ 622 Abs. 1 BGB).</li>
            </ul>
          </div>

          {/* Hinweis Sonderfälle */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-amber-800 mb-3">⚠️ Hinweise</h3>
            <ul className="text-sm text-amber-700 space-y-2">
              <li>• <strong>Monatsende-Fälle:</strong> Beginnt das Arbeitsverhältnis am Monatsletzten (z. B. 31.08.), kann sich das gerechnete Probezeit-Ende durch die unterschiedliche Monatslänge verschieben – das Ergebnis ist eine Schätzung.</li>
              <li>• <strong>Abweichende Fristen</strong> können sich aus Tarif- oder Arbeitsvertrag ergeben (kürzere Probezeit als 6 Monate ist zulässig).</li>
              <li>• <strong>Längere Kündigungsfristen</strong> nach Betriebszugehörigkeit (§ 622 Abs. 2 BGB) bildet dieser Rechner nicht ab – sie greifen erst mit zunehmender Beschäftigungsdauer.</li>
            </ul>
          </div>
        </>
      )}

      {/* Fehler bei ungültigem Datum */}
      {!ergebnis && eintrittsdatum && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <p className="text-red-700 font-medium">
            ⚠️ Bitte geben Sie ein gültiges Eintrittsdatum ein.
          </p>
        </div>
      )}

      {/* Disclaimer + Quellen */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <p className="text-sm text-gray-600 mb-3">
          <strong>Hinweis:</strong> Schätzung – keine Steuer-/Rechtsberatung. Die Berechnung folgt § 622 BGB
          (Grundfrist 4 Wochen zum 15./Monatsende; während der Probezeit verkürzte Frist von 2 Wochen,
          Probezeit höchstens 6 Monate) und den Fristregeln der §§ 187–188 BGB. Abweichende Fristen können
          sich aus Tarif- oder Arbeitsvertrag ergeben. Sonderkündigungsschutz (z. B. bei Schwerbehinderung,
          Schwangerschaft, Betriebsratsmitgliedschaft) und die außerordentliche Kündigung aus wichtigem Grund
          (§ 626 BGB) bleiben unberücksichtigt. Nicht zu verwechseln mit der Führerschein-Probezeit nach StVG.
          Im Zweifel anwaltliche Beratung einholen.
        </p>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Quellen</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • § 622 BGB (Kündigungsfristen) –{' '}
            <a href="https://www.gesetze-im-internet.de/bgb/__622.html" target="_blank" rel="noopener" className="text-orange-600 hover:underline">
              gesetze-im-internet.de
            </a>
          </li>
          <li>
            • § 187 BGB (Fristbeginn) –{' '}
            <a href="https://www.gesetze-im-internet.de/bgb/__187.html" target="_blank" rel="noopener" className="text-orange-600 hover:underline">
              gesetze-im-internet.de
            </a>
          </li>
          <li>
            • § 188 BGB (Fristende) –{' '}
            <a href="https://www.gesetze-im-internet.de/bgb/__188.html" target="_blank" rel="noopener" className="text-orange-600 hover:underline">
              gesetze-im-internet.de
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
