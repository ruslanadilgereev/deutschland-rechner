import { useState, useMemo } from 'react';

// Kündigungsfrist-Rechner: gesetzliche Frist nach § 622 BGB.
// Grundfrist (Abs. 1): 4 Wochen (= 28 Tage) zum 15. oder zum Ende eines Kalendermonats.
// Verlängerte Fristen (Abs. 2): nur Arbeitgeber-Kündigung, gestaffelt nach Betriebszugehörigkeit,
// jeweils zum Ende eines Kalendermonats. Fristberechnung nach §§ 187–188 BGB.
// Hinweis: Die 25-Jahre-Klausel (§ 622 Abs. 2 Satz 2 BGB) ist nach EuGH Kücükdeveci
// (C-555/07) nicht mehr anwendbar – die volle Betriebszugehörigkeit ab Eintritt zählt.

type Kuendigender = 'arbeitgeber' | 'arbeitnehmer';

interface Ergebnis {
  eintritt: Date;
  zugang: Date;
  betriebsjahre: number;        // vollendete Jahre der Betriebszugehörigkeit bei Zugang
  fristText: string;            // z. B. "4 Wochen zum 15. oder Monatsende" / "2 Monate zum Monatsende"
  fristGrundlage: string;       // § 622 Abs. 1 / Abs. 2 BGB
  beendigung: Date;             // frühestmögliches Beendigungsdatum
  istGrundfrist: boolean;
}

const GRUNDFRIST_TAGE = 28; // § 622 Abs. 1 BGB: "vier Wochen" = 28 Tage

// § 622 Abs. 2 BGB: verlängerte Fristen nur bei Arbeitgeber-Kündigung (zum Monatsende).
// Schwelle = Betriebszugehörigkeit in Jahren, monate = Kündigungsfrist in Monaten.
const STAFFEL: { jahre: number; monate: number }[] = [
  { jahre: 20, monate: 7 },
  { jahre: 15, monate: 6 },
  { jahre: 12, monate: 5 },
  { jahre: 10, monate: 4 },
  { jahre: 8, monate: 3 },
  { jahre: 5, monate: 2 },
  { jahre: 2, monate: 1 },
];

export default function KuendigungsfristRechner() {
  const heute = new Date();
  const [eintrittsdatum, setEintrittsdatum] = useState('2020-01-01');
  const [zugangsdatum, setZugangsdatum] = useState(heute.toISOString().split('T')[0]);
  const [kuendigender, setKuendigender] = useState<Kuendigender>('arbeitgeber');

  const ergebnis = useMemo<Ergebnis | null>(() => {
    const eintritt = new Date(eintrittsdatum);
    const zugang = new Date(zugangsdatum);
    if (isNaN(eintritt.getTime()) || isNaN(zugang.getTime())) {
      return null;
    }
    if (zugang.getTime() < eintritt.getTime()) {
      return null;
    }

    // UTC-sicher rechnen, um Tagesverschiebungen durch Zeitzonen zu vermeiden.
    const eY = eintritt.getUTCFullYear();
    const eM = eintritt.getUTCMonth();
    const eD = eintritt.getUTCDate();
    const zY = zugang.getUTCFullYear();
    const zM = zugang.getUTCMonth();
    const zD = zugang.getUTCDate();

    // Vollendete Jahre der Betriebszugehörigkeit im Zeitpunkt des Zugangs.
    let betriebsjahre = zY - eY;
    if (zM < eM || (zM === eM && zD < eD)) {
      betriebsjahre -= 1;
    }
    if (betriebsjahre < 0) betriebsjahre = 0;

    // Letzter Tag eines Kalendermonats (UTC).
    const monatsLetzter = (y: number, m: number): Date =>
      new Date(Date.UTC(y, m + 1, 0));

    // Bestimmen, ob die verlängerte Monatsfrist (Abs. 2) greift.
    let monateAbs2 = 0;
    if (kuendigender === 'arbeitgeber') {
      for (const stufe of STAFFEL) {
        if (betriebsjahre >= stufe.jahre) {
          monateAbs2 = stufe.monate;
          break;
        }
      }
    }

    let beendigung: Date;
    let fristText: string;
    let fristGrundlage: string;
    let istGrundfrist: boolean;

    if (monateAbs2 > 0) {
      // § 622 Abs. 2 BGB: X Monate zum Ende eines Kalendermonats.
      // Frühestes Beendigungsdatum = Ende des Kalendermonats, der mindestens
      // X volle Monate (ab Zugang, § 187/188 BGB) nach dem Zugang liegt.
      // Stichtag = Zugang + X Monate (gleichnamiger Tag), § 188 Abs. 2 BGB.
      const stichtag = new Date(Date.UTC(zY, zM + monateAbs2, zD));
      // Frühestes zulässiges Monatsende, das >= Stichtag liegt.
      let kandidat = monatsLetzter(stichtag.getUTCFullYear(), stichtag.getUTCMonth());
      if (kandidat.getTime() < stichtag.getTime()) {
        kandidat = monatsLetzter(stichtag.getUTCFullYear(), stichtag.getUTCMonth() + 1);
      }
      beendigung = kandidat;
      fristText = `${monateAbs2} ${monateAbs2 === 1 ? 'Monat' : 'Monate'} zum Monatsende`;
      fristGrundlage = '§ 622 Abs. 2 BGB';
      istGrundfrist = false;
    } else {
      // Grundfrist § 622 Abs. 1 BGB: 4 Wochen (28 Tage) zum 15. oder zum Monatsende.
      // Fristbeginn am Folgetag des Zugangs (§ 187 Abs. 1 BGB); frühestes Ende der
      // 28-Tage-Frist = Zugang + 28 Tage (§ 188 Abs. 1 BGB). Beendigung = der nächste
      // 15. oder Monatsletzte, der >= (Zugang + 28 Tage) liegt.
      const fruehestens = new Date(Date.UTC(zY, zM, zD + GRUNDFRIST_TAGE));
      const fY = fruehestens.getUTCFullYear();
      const fM = fruehestens.getUTCMonth();
      const fD = fruehestens.getUTCDate();

      const fuenfzehnter = new Date(Date.UTC(fY, fM, 15));
      const letzter = monatsLetzter(fY, fM);

      const kandidaten: Date[] = [];
      if (fD <= 15) kandidaten.push(fuenfzehnter);
      kandidaten.push(letzter);
      // Falls beide vor dem frühesten Termin liegen (fD > Monatslänge ist unmöglich),
      // greift der 15. des Folgemonats.
      let gewaehlt = kandidaten.find((d) => d.getTime() >= fruehestens.getTime());
      if (!gewaehlt) {
        gewaehlt = new Date(Date.UTC(fY, fM + 1, 15));
      }
      beendigung = gewaehlt;
      fristText = '4 Wochen zum 15. oder zum Monatsende';
      fristGrundlage = '§ 622 Abs. 1 BGB';
      istGrundfrist = true;
    }

    return {
      eintritt,
      zugang,
      betriebsjahre,
      fristText,
      fristGrundlage,
      beendigung,
      istGrundfrist,
    };
  }, [eintrittsdatum, zugangsdatum, kuendigender]);

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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📄 Daten eingeben</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Wer kündigt?</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setKuendigender('arbeitgeber')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                kuendigender === 'arbeitgeber'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              Arbeitgeber kündigt
            </button>
            <button
              type="button"
              onClick={() => setKuendigender('arbeitnehmer')}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                kuendigender === 'arbeitnehmer'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              Arbeitnehmer kündigt
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Die verlängerten Fristen nach Betriebszugehörigkeit (§ 622 Abs. 2 BGB) gelten gesetzlich
            nur für die <strong>Arbeitgeber-Kündigung</strong>. Der Arbeitnehmer kündigt grundsätzlich
            mit der 4-Wochen-Grundfrist.
          </p>
        </div>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Zugang der Kündigung (Datum)</label>
          <input
            type="date"
            value={zugangsdatum}
            onChange={(e) => setZugangsdatum(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            Maßgeblich ist der <strong>Zugang</strong> der Kündigung beim Empfänger, nicht das Absenden.
          </p>
        </div>
      </div>

      {/* Ergebnis Section */}
      {ergebnis && (
        <>
          {/* Hero-Card: frühestmögliches Beendigungsdatum */}
          <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-orange-500 to-amber-600">
            <div className="text-center mb-4">
              <p className="text-sm text-orange-100">Frühestmögliches Ende des Arbeitsverhältnisses</p>
              <p className="text-4xl sm:text-5xl font-bold mt-1">
                {formatDatumKurz(ergebnis.beendigung)}
              </p>
              <p className="text-sm mt-2 text-orange-200">
                {formatDatumLang(ergebnis.beendigung)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-orange-400">
              <div className="text-center">
                <p className="text-2xl font-bold">{ergebnis.fristText}</p>
                <p className="text-xs text-orange-200">Maßgebliche Kündigungsfrist ({ergebnis.fristGrundlage})</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{ergebnis.betriebsjahre} {ergebnis.betriebsjahre === 1 ? 'Jahr' : 'Jahre'}</p>
                <p className="text-xs text-orange-200">Betriebszugehörigkeit bei Zugang</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatDatumKurz(ergebnis.zugang)}</p>
                <p className="text-xs text-orange-200">Zugang der Kündigung</p>
              </div>
            </div>
          </div>

          {/* Detaillierte Aufstellung */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">📊 Detaillierte Aufstellung</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Kündigung durch</span>
                <span className="font-semibold text-gray-800">
                  {kuendigender === 'arbeitgeber' ? 'Arbeitgeber' : 'Arbeitnehmer'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Eintrittsdatum</span>
                <span className="font-semibold text-gray-800 text-right">{formatDatumLang(ergebnis.eintritt)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Zugang der Kündigung</span>
                <span className="font-semibold text-gray-800 text-right">{formatDatumLang(ergebnis.zugang)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Betriebszugehörigkeit bei Zugang</span>
                <span className="font-semibold text-gray-800">
                  {ergebnis.betriebsjahre} {ergebnis.betriebsjahre === 1 ? 'Jahr' : 'Jahre'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Maßgebliche Frist</span>
                <span className="font-semibold text-gray-800 text-right">
                  {ergebnis.fristText} ({ergebnis.fristGrundlage})
                </span>
              </div>
              <div className="flex justify-between items-center py-2 bg-orange-50 -mx-2 px-2 rounded-lg">
                <span className="font-bold text-gray-800">Frühestmögliches Ende</span>
                <span className="font-bold text-orange-600 text-lg text-right">{formatDatumLang(ergebnis.beendigung)}</span>
              </div>
            </div>
          </div>

          {/* Hinweis zur Frist */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-blue-800 mb-2">ℹ️ Welche Frist gilt?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Grundfrist (§ 622 Abs. 1 BGB):</strong> 4 Wochen (= 28 Tage) zum 15. oder zum Ende eines Kalendermonats – gilt für beide Seiten.</li>
              <li>• <strong>Verlängerte Fristen (§ 622 Abs. 2 BGB):</strong> nur bei <strong>Arbeitgeber-Kündigung</strong>, gestaffelt nach Betriebszugehörigkeit (1 bis 7 Monate), jeweils zum Ende eines Kalendermonats.</li>
              <li>• Während einer vereinbarten <strong>Probezeit</strong> gilt die verkürzte 2-Wochen-Frist (§ 622 Abs. 3 BGB) – siehe <a href="/probezeit-rechner" className="underline font-medium">Probezeit-Rechner</a>.</li>
            </ul>
          </div>

          {/* Hinweis Sonderfälle */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-amber-800 mb-3">⚠️ Hinweise</h3>
            <ul className="text-sm text-amber-700 space-y-2">
              <li>• <strong>25-Jahre-Klausel nicht angewendet:</strong> Die in § 622 Abs. 2 Satz 2 BGB noch enthaltene Regelung, wonach Zeiten vor dem 25. Lebensjahr nicht mitzählen, ist nach dem EuGH-Urteil Kücükdeveci (C-555/07, 19.01.2010) wegen Altersdiskriminierung nicht mehr anwendbar. Dieser Rechner zählt die <strong>volle Betriebszugehörigkeit ab Eintritt</strong>.</li>
              <li>• <strong>Abweichende Fristen</strong> können sich aus Tarif- oder Arbeitsvertrag ergeben; eine einzelvertraglich für den Arbeitnehmer vereinbarte längere Frist darf die des Arbeitgebers nicht übersteigen (§ 622 Abs. 6 BGB).</li>
              <li>• <strong>Sonderkündigungsschutz</strong> (Schwangerschaft, Schwerbehinderung, Betriebsrat, Elternzeit) und die <strong>außerordentliche Kündigung</strong> aus wichtigem Grund (§ 626 BGB) bleiben unberücksichtigt.</li>
            </ul>
          </div>
        </>
      )}

      {/* Fehler bei ungültigem Datum */}
      {!ergebnis && (eintrittsdatum || zugangsdatum) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <p className="text-red-700 font-medium">
            ⚠️ Bitte geben Sie ein gültiges Eintritts- und Zugangsdatum ein. Der Zugang der Kündigung darf nicht vor dem Eintritt liegen.
          </p>
        </div>
      )}

      {/* Disclaimer + Quellen */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <p className="text-sm text-gray-600 mb-3">
          <strong>Hinweis:</strong> Schätzung – keine Steuer-/Rechtsberatung. Die Berechnung folgt § 622 BGB
          (Grundfrist 4 Wochen zum 15. oder Monatsende; verlängerte Fristen nach Betriebszugehörigkeit nur bei
          Arbeitgeber-Kündigung, § 622 Abs. 2; Probezeit 2 Wochen, § 622 Abs. 3) sowie den Fristregeln der
          §§ 187–188 BGB. Die in § 622 Abs. 2 Satz 2 BGB noch enthaltene 25-Jahre-Klausel ist nach dem
          EuGH-Urteil Kücükdeveci (C-555/07, 19.01.2010) wegen Altersdiskriminierung nicht mehr anwendbar und
          wird nicht berücksichtigt – es zählt die volle Betriebszugehörigkeit ab Eintritt. Abweichende
          (auch längere) Fristen können sich aus Tarif- oder Arbeitsvertrag ergeben. Sonderkündigungsschutz
          und die außerordentliche Kündigung aus wichtigem Grund (§ 626 BGB) bleiben unberücksichtigt.
          Maßgeblich ist der Zugang der Kündigung, nicht das Absenden. Im Zweifel anwaltliche Beratung einholen.
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
          <li>
            • EuGH, Urteil Kücükdeveci (C-555/07, 19.01.2010) –{' '}
            <a href="https://curia.europa.eu/juris/document/document.jsf?docid=72658&doclang=de" target="_blank" rel="noopener" className="text-orange-600 hover:underline">
              curia.europa.eu
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
