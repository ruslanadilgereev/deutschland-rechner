import { useState, useMemo } from 'react';

// Unternehmensbewertung-Rechner – vereinfachtes Ertragswertverfahren
// (gemeiner Wert für Erbschaft-/Schenkungsteuer, §§ 199–203 BewG):
//   0. Korrigiertes Betriebsergebnis je Jahr = Gewinn + Ertragsteueraufwand − kalkul. Unternehmerlohn (vereinfacht, § 202 Abs. 1)
//   1. Durchschnittsertrag = (BE_Jahr1 + BE_Jahr2 + BE_Jahr3) / 3                 (§ 201 Abs. 2)
//   2. Jahresertrag        = Durchschnittsertrag × 0,70 (30 % Pauschalabschlag)   (§ 202 Abs. 3, NUR bei positivem Ergebnis)
//   3. Ertragswert         = Jahresertrag × 13,75 (Kapitalisierungsfaktor)        (§ 203 Abs. 1)
//   4. Mindestwert         = Substanzwert (darf nicht unterschritten werden)      (§ 11 Abs. 2 Satz 3)
//   → maßgeblicher Wert    = max(Ertragswert, Substanzwert)
//
// HARTE FIX-KONSTANTEN (amtlich):
//   Kapitalisierungsfaktor 13,75 – § 203 Abs. 1 BewG (gesetzlich fix, gilt für alle Stichtage ab 01.01.2016).
//   Pauschalabschlag 30 % (Multiplikator 0,70) – § 202 Abs. 3 BewG, nur bei positivem Betriebsergebnis.
//   Divisor 3 – § 201 Abs. 2 BewG (letzte drei abgelaufene Wirtschaftsjahre).
// Quellen: §§ 199, 200, 201, 202, 203, 11 BewG (gesetze-im-internet.de).

const KAP_FAKTOR = 13.75;          // § 203 Abs. 1 BewG – fix
const ERTRAGSTEUER_ABSCHLAG = 0.30; // § 202 Abs. 3 BewG – 30 % → Multiplikator 0,70

export default function UnternehmensbewertungRechner() {
  // Eingabewerte (Default-Beispiel: Ertragswert 1.058.750 €)
  const [gewinn1, setGewinn1] = useState(100000);
  const [gewinn2, setGewinn2] = useState(120000);
  const [gewinn3, setGewinn3] = useState(110000);
  // Globale Korrekturen (auf alle drei Jahre angewandt, vereinfacht – § 202 Abs. 1)
  const [ertragsteuer, setErtragsteuer] = useState(0);     // Hinzurechnung (+)
  const [unternehmerlohn, setUnternehmerlohn] = useState(0); // Abzug (−)
  // Substanzwert als Mindestwert (§ 11 Abs. 2 Satz 3), optional
  const [substanzwert, setSubstanzwert] = useState(0);

  const ergebnis = useMemo(() => {
    // 0. Korrigierte Betriebsergebnisse je Jahr (vereinfacht, § 202 Abs. 1)
    const be1 = gewinn1 + ertragsteuer - unternehmerlohn;
    const be2 = gewinn2 + ertragsteuer - unternehmerlohn;
    const be3 = gewinn3 + ertragsteuer - unternehmerlohn;

    // 1. Durchschnittsertrag (§ 201 Abs. 2)
    const durchschnittsertrag = (be1 + be2 + be3) / 3;

    // 2. Jahresertrag – 30 % Pauschalabschlag NUR bei positivem Betriebsergebnis (§ 202 Abs. 3)
    const positiv = durchschnittsertrag > 0;
    const jahresertrag = positiv
      ? durchschnittsertrag * (1 - ERTRAGSTEUER_ABSCHLAG)
      : durchschnittsertrag;

    // 3. Ertragswert (§ 203 Abs. 1)
    const ertragswert = jahresertrag * KAP_FAKTOR;

    // 4. Maßgeblicher Wert – Substanzwert als Mindestwert (§ 11 Abs. 2 Satz 3)
    const massgeblich = Math.max(ertragswert, substanzwert);

    // Hinweis-Flags
    const substanzwertMassgeblich = substanzwert > ertragswert;
    const negativesErgebnis = durchschnittsertrag <= 0;

    return {
      be1,
      be2,
      be3,
      durchschnittsertrag,
      positiv,
      jahresertrag,
      ertragswert,
      massgeblich,
      substanzwertMassgeblich,
      negativesErgebnis,
    };
  }, [gewinn1, gewinn2, gewinn3, ertragsteuer, unternehmerlohn, substanzwert]);

  const formatEuro = (n: number) => Math.round(n).toLocaleString('de-DE') + ' €';
  const formatFaktor = (n: number) => n.toFixed(2).replace('.', ',');

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Ihr Unternehmen</h2>

        {/* Betriebsergebnisse der letzten 3 Jahre */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Betriebsergebnis (Gewinn) der letzten 3 Wirtschaftsjahre</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jahresüberschuss / Gewinn der drei vor dem Bewertungsstichtag abgelaufenen Wirtschaftsjahre (§ 201 Abs. 2 BewG)
            </span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="relative">
              <input
                type="number"
                value={gewinn1 === 0 ? '' : gewinn1}
                onChange={(e) => setGewinn1(Math.max(0, Number(e.target.value)))}
                className="w-full py-3 px-3 pr-7 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="10000"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              <span className="text-xs text-gray-500 block mt-1 text-center">Jahr 1</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={gewinn2 === 0 ? '' : gewinn2}
                onChange={(e) => setGewinn2(Math.max(0, Number(e.target.value)))}
                className="w-full py-3 px-3 pr-7 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="10000"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              <span className="text-xs text-gray-500 block mt-1 text-center">Jahr 2</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={gewinn3 === 0 ? '' : gewinn3}
                onChange={(e) => setGewinn3(Math.max(0, Number(e.target.value)))}
                className="w-full py-3 px-3 pr-7 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="10000"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              <span className="text-xs text-gray-500 block mt-1 text-center">Jahr 3</span>
            </div>
          </div>
        </div>

        {/* Korrekturen § 202 Abs. 1 */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">+ Ertragsteueraufwand p.&nbsp;a.</span>
            <span className="text-xs text-gray-500 block mt-1 mb-2">Hinzurechnung KSt/GewSt (§ 202 Abs. 1 Nr. 1)</span>
            <div className="relative">
              <input
                type="number"
                value={ertragsteuer === 0 ? '' : ertragsteuer}
                onChange={(e) => setErtragsteuer(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-4 pr-9 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="1000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">− Unternehmerlohn p.&nbsp;a.</span>
            <span className="text-xs text-gray-500 block mt-1 mb-2">kalkulatorisch (§ 202 Abs. 1 Nr. 2)</span>
            <div className="relative">
              <input
                type="number"
                value={unternehmerlohn === 0 ? '' : unternehmerlohn}
                onChange={(e) => setUnternehmerlohn(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-4 pr-9 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="1000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          </label>
        </div>
        <p className="text-xs text-gray-500 mb-6">
          Korrektur wird auf alle drei Jahre angewandt. Korrigierte Betriebsergebnisse:{' '}
          <strong>{formatEuro(ergebnis.be1)}</strong> / <strong>{formatEuro(ergebnis.be2)}</strong> /{' '}
          <strong>{formatEuro(ergebnis.be3)}</strong>
        </p>

        {/* Substanzwert (Mindestwert) */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Substanzwert (optional, Mindestwert)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Summe der gemeinen Werte der Wirtschaftsgüter abzüglich Schulden – darf nicht unterschritten werden (§ 11 Abs. 2 Satz 3 BewG). 0 = ohne.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={substanzwert === 0 ? '' : substanzwert}
              onChange={(e) => setSubstanzwert(Math.max(0, Number(e.target.value)))}
              className="w-full py-3 px-4 pr-10 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="50000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-indigo-500 to-blue-600">
        <h3 className="text-sm font-medium opacity-80 mb-1">💼 Unternehmenswert (vereinfachtes Ertragswertverfahren)</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.massgeblich)}</span>
          </div>
          <p className="text-white/80 mt-2 text-sm">
            Ertragswert <strong>{formatEuro(ergebnis.ertragswert)}</strong>
            {ergebnis.substanzwertMassgeblich && (
              <> – aber Substanzwert <strong>{formatEuro(substanzwert)}</strong> ist Mindestwert (§ 11 Abs. 2 Satz 3)</>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Durchschnittsertrag</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.durchschnittsertrag)}</div>
            <span className="text-xs opacity-70">§ 201, ÷ 3 Jahre</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Jahresertrag</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.jahresertrag)}</div>
            <span className="text-xs opacity-70">{ergebnis.positiv ? 'nach 30 % Abschlag (§ 202)' : 'ohne Abschlag (negativ)'}</span>
          </div>
        </div>

        {ergebnis.substanzwertMassgeblich && (
          <p className="text-xs text-white/90 mt-4 bg-white/10 rounded-lg p-3">
            ⚠️ Der Substanzwert ({formatEuro(substanzwert)}) übersteigt den Ertragswert ({formatEuro(ergebnis.ertragswert)}).
            Nach § 11 Abs. 2 Satz 3 BewG ist der Substanzwert als Mindestwert maßgeblich.
          </p>
        )}
        {ergebnis.negativesErgebnis && (
          <p className="text-xs text-white/90 mt-4 bg-white/10 rounded-lg p-3">
            ⚠️ Der Durchschnittsertrag ist nicht positiv – der 30 %-Pauschalabschlag (§ 202 Abs. 3 BewG) wird nicht
            angewandt. Ein negativer Ertragswert ist kein verwertbares Bewertungsergebnis; hier ist der Substanzwert
            anzusetzen.
          </p>
        )}
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 So setzt sich der Unternehmenswert zusammen</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700">Korrigierte Betriebsergebnisse (3 Jahre)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.be1 + ergebnis.be2 + ergebnis.be3)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700 font-medium">= Durchschnittsertrag (÷ 3, § 201)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.durchschnittsertrag)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>{ergebnis.positiv ? '× 0,70 (30 % Pauschalabschlag, § 202 Abs. 3)' : 'kein Abschlag (Ergebnis nicht positiv, § 202 Abs. 3)'}</span>
            <span>{formatEuro(ergebnis.jahresertrag)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700 font-medium">= Jahresertrag</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.jahresertrag)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>× Kapitalisierungsfaktor {formatFaktor(KAP_FAKTOR)} (§ 203 Abs. 1)</span>
            <span>{formatEuro(ergebnis.ertragswert)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700 font-medium">= Ertragswert</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.ertragswert)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>Substanzwert (Mindestwert, § 11 Abs. 2 Satz 3)</span>
            <span>{formatEuro(substanzwert)}</span>
          </div>
          <div className="flex justify-between py-4 bg-orange-50 -mx-6 px-6 rounded-b-xl mt-2">
            <span className="font-bold text-orange-800">Maßgeblicher Wert (max.)</span>
            <span className="font-bold text-xl text-orange-900">{formatEuro(ergebnis.massgeblich)}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So rechnet der Unternehmensbewertung-Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Durchschnittsertrag</strong> = Summe der korrigierten Betriebsergebnisse der letzten 3 Wirtschaftsjahre ÷ 3 (§ 201 Abs. 2)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Jahresertrag</strong> = Durchschnittsertrag × 0,70 (30 % Pauschalabschlag für Ertragsteuern, § 202 Abs. 3) – nur bei positivem Betriebsergebnis</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Ertragswert</strong> = Jahresertrag × 13,75 (gesetzlich fixer Kapitalisierungsfaktor, § 203 Abs. 1)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mindestwert</strong>: Der Substanzwert darf nicht unterschritten werden – maßgeblich ist max(Ertragswert, Substanzwert) (§ 11 Abs. 2 Satz 3)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Korrekturen</strong> (vereinfacht): Gewinn + Ertragsteueraufwand − kalkulatorischer Unternehmerlohn (§ 202 Abs. 1)</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
        <p className="text-xs text-gray-500">
          <strong>Schätzung – keine Steuer-/Rechtsberatung.</strong> Dieser Rechner bildet ausschließlich das
          vereinfachte Ertragswertverfahren des Finanzamts nach §§ 199–203 BewG ab, das der Bewertung von
          Anteilen/Betriebsvermögen für Erbschaft- und Schenkungsteuerzwecke dient (§ 11 Abs. 2 BewG). Es ist KEINE
          allgemeine/marktnahe Unternehmensbewertung: Verfahren wie IDW S1, Discounted-Cash-Flow (DCF) oder
          EBIT-/Umsatz-Multiplikatoren liefern regelmäßig deutlich abweichende Werte und werden hier NICHT abgebildet.
          Der gesetzlich fixe Kapitalisierungsfaktor 13,75 (§ 203) entspricht einer rechnerischen Kapitalverzinsung von
          ca. 7,3 % und kann in Niedrig-/Hochzinsphasen marktfern sein. Das Finanzamt darf das Ergebnis verwerfen, wenn
          es zu offensichtlich unzutreffenden Ergebnissen führt (§ 199 BewG). Der Substanzwert (Summe der gemeinen
          Werte der Wirtschaftsgüter abzüglich Schulden) darf als Mindestwert nicht unterschritten werden (§ 11 Abs. 2
          Satz 3 BewG). Nicht abgebildet: detaillierte Hinzurechnungen/Kürzungen nach § 202 Abs. 1, separat
          anzusetzendes nicht betriebsnotwendiges Vermögen, Beteiligungen und junges Betriebsvermögen (§ 200 Abs. 2–4),
          Branchen-/Größenzuschläge. Für eine verbindliche Bewertung sind Steuerberater/Wirtschaftsprüfer und ggf. ein
          Gutachten erforderlich. Alle Angaben ohne Gewähr.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/bewg/__199.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 199 BewG – Anwendung des vereinfachten Ertragswertverfahrens
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bewg/__200.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 200 BewG – Vereinfachtes Ertragswertverfahren
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bewg/__201.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 201 BewG – Ermittlung des Jahresertrags
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bewg/__202.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 202 BewG – Betriebsergebnis
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bewg/__203.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 203 BewG – Kapitalisierungsfaktor
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bewg/__11.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 11 BewG – Wertpapiere und Anteile (Substanzwert als Mindestwert)
          </a>
        </div>
      </div>
    </div>
  );
}
