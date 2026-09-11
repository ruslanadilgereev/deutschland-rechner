import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: September 2026) ===

// Vollrente = 2/3 des Jahresarbeitsverdienstes (JAV); Teilrente = MdE-Prozentsatz der Vollrente
// Quelle: § 56 Abs. 3 SGB VII – https://www.gesetze-im-internet.de/sgb_7/__56.html
const VOLLRENTE_FAKTOR = 2 / 3;

// Rentenanspruch ab MdE 20 % (über die 26. Woche hinaus); Stützrente: mehrere Versicherungsfälle
// mit je mind. 10 % ergeben zusammen 20 % – § 56 Abs. 1 SGB VII
const MDE_MINDESTGRENZE = 20;
const MDE_STUETZRENTE_JE_FALL = 10;

// Schwerverletztenzulage: +10 % bei MdE ≥ 50 %, keine Erwerbstätigkeit mehr möglich,
// kein Anspruch auf Rente aus der gesetzlichen Rentenversicherung – § 57 SGB VII
const SCHWERVERLETZTEN_ZULAGE = 0.10;

// Bezugsgröße 2026: 47.460 €/Jahr – § 1 SVBezGrV 2026
const BEZUGSGROESSE_JAHR = 47460;

// Höchst-JAV: das Zweifache der Bezugsgröße, Satzung der BG kann mehr vorsehen – § 85 Abs. 2 SGB VII
const HOECHST_JAV_GESETZ = 2 * BEZUGSGROESSE_JAHR; // 94.920 €

// Mindest-JAV in % der Bezugsgröße nach Alter zum Unfallzeitpunkt – § 85 Abs. 1 u. 1a SGB VII
function mindestJavProzent(alter: number): number {
  if (alter < 6) return 0.25;
  if (alter < 15) return 1 / 3;
  if (alter < 18) return 0.40;
  if (alter >= 25 && alter < 30) return 0.75;
  return 0.60;
}

// Abfindung auf Antrag möglich bei MdE unter 40 % – § 76 Abs. 1 SGB VII
const MDE_ABFINDUNG_GRENZE = 40;

const MDE_STUFEN = [20, 30, 40, 50, 60, 70, 80, 90, 100];

const fmtEuro = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtEuroRund = (n: number) =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function UnfallrenteRechner() {
  const [jahresverdienst, setJahresverdienst] = useState(42000);
  const [alter, setAlter] = useState(40);
  const [hoechstJav, setHoechstJav] = useState(HOECHST_JAV_GESETZ);
  const [mde, setMde] = useState(30);
  const [weitererFall, setWeitererFall] = useState(false);
  const [schwerverletzt, setSchwerverletzt] = useState(false);

  const ergebnis = useMemo(() => {
    // === 1. JAV nach unten (Mindest-JAV) und oben (Höchst-JAV) begrenzen (§ 85 SGB VII) ===
    const mindestProzent = mindestJavProzent(alter);
    const mindestJav = BEZUGSGROESSE_JAHR * mindestProzent;
    const obergrenze = Math.max(hoechstJav, HOECHST_JAV_GESETZ);
    const javRoh = Math.max(0, jahresverdienst);
    const jav = Math.min(Math.max(javRoh, mindestJav), obergrenze);
    const mindestGreift = javRoh < mindestJav;
    const hoechstGreift = javRoh > obergrenze;

    // === 2. Vollrente (§ 56 Abs. 3 Satz 1) ===
    const vollrenteJahr = jav * VOLLRENTE_FAKTOR;

    // === 3. Anspruch dem Grunde nach (§ 56 Abs. 1) ===
    const mdeGueltig = Math.min(100, Math.max(0, mde));
    const anspruch = mdeGueltig >= MDE_MINDESTGRENZE || (weitererFall && mdeGueltig >= MDE_STUETZRENTE_JE_FALL);

    // === 4. Teilrente (§ 56 Abs. 3 Satz 2) und Zulage (§ 57) ===
    const teilrenteJahr = anspruch ? vollrenteJahr * (mdeGueltig / 100) : 0;
    const zulageMoeglich = mdeGueltig >= 50;
    const zulageJahr = zulageMoeglich && schwerverletzt ? teilrenteJahr * SCHWERVERLETZTEN_ZULAGE : 0;
    const renteJahr = teilrenteJahr + zulageJahr;

    return {
      jav,
      javRoh,
      mindestJav,
      mindestProzent,
      obergrenze,
      mindestGreift,
      hoechstGreift,
      vollrenteJahr,
      vollrenteMonat: vollrenteJahr / 12,
      anspruch,
      mdeGueltig,
      teilrenteJahr,
      teilrenteMonat: teilrenteJahr / 12,
      zulageMoeglich,
      zulageMonat: zulageJahr / 12,
      renteJahr,
      renteMonat: renteJahr / 12,
      abfindungMoeglich: anspruch && mdeGueltig < MDE_ABFINDUNG_GRENZE,
    };
  }, [jahresverdienst, alter, hoechstJav, mde, weitererFall, schwerverletzt]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* JAV */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bruttoverdienst der 12 Monate vor dem Unfallmonat</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jahresarbeitsverdienst (JAV): alle Arbeitsentgelte und Arbeitseinkommen inkl. Weihnachts-/Urlaubsgeld
              (§ 82 Abs. 1 SGB VII). Steht im Rentenbescheid der Berufsgenossenschaft.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={jahresverdienst}
              onChange={(e) => setJahresverdienst(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="300000"
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Jahr</span>
          </div>
          <input
            type="range"
            value={jahresverdienst}
            onChange={(e) => setJahresverdienst(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="10000"
            max="120000"
            step="500"
          />
        </div>

        {/* MdE */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Minderung der Erwerbsfähigkeit (MdE)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Aus dem Bescheid der Berufsgenossenschaft übernehmen – oder als Szenario durchspielen
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={mde}
              onChange={(e) => setMde(Math.max(0, Math.min(100, Math.round(Number(e.target.value)))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="100"
              step="5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">%</span>
          </div>
          <input
            type="range"
            value={mde}
            onChange={(e) => setMde(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max="100"
            step="5"
          />
          {ergebnis.mdeGueltig < MDE_MINDESTGRENZE && (
            <label className="flex items-start gap-3 cursor-pointer mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <input
                type="checkbox"
                checked={weitererFall}
                onChange={(e) => setWeitererFall(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-orange-500"
              />
              <span className="text-sm text-gray-700">
                Ich habe einen <strong>weiteren anerkannten Versicherungsfall</strong> (Arbeitsunfall, Berufskrankheit,
                Wehrdienst-/Dienstbeschädigung) mit mindestens 10 % MdE, sodass beide zusammen 20 % erreichen (Stützrente)
              </span>
            </label>
          )}
        </div>

        {/* Alter */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Alter zum Zeitpunkt des Unfalls</span>
            <span className="text-xs text-gray-500 block mt-1">Bestimmt den Mindest-Jahresarbeitsverdienst (§ 85 SGB VII)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={alter}
              onChange={(e) => setAlter(Math.max(0, Math.min(99, Math.round(Number(e.target.value)))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="99"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">Jahre</span>
          </div>
        </div>

        {/* Höchst-JAV */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Höchst-Jahresarbeitsverdienst Ihrer Berufsgenossenschaft</span>
            <span className="text-xs text-gray-500 block mt-1">
              Gesetzlich mindestens das Zweifache der Bezugsgröße = 94.920 € (2026). Viele BG-Satzungen setzen
              höhere Grenzen – Wert aus der Satzung Ihrer BG eintragen.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={hoechstJav}
              onChange={(e) => setHoechstJav(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="500000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€/Jahr</span>
          </div>
        </div>

        {/* Schwerverletztenzulage */}
        <div className={`border-t border-gray-100 pt-5 ${ergebnis.zulageMoeglich ? '' : 'opacity-50'}`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={schwerverletzt && ergebnis.zulageMoeglich}
              disabled={!ergebnis.zulageMoeglich}
              onChange={(e) => setSchwerverletzt(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-orange-500"
            />
            <span className="text-sm text-gray-700">
              <strong>Schwerverletztenzulage (+10 %):</strong> MdE mindestens 50 %, ich kann infolge des Versicherungsfalls
              keiner Erwerbstätigkeit mehr nachgehen und habe keinen Anspruch auf eine Rente der gesetzlichen
              Rentenversicherung (§ 57 SGB VII)
              {!ergebnis.zulageMoeglich && <span className="block text-xs text-gray-500 mt-1">Erst ab 50 % MdE möglich</span>}
            </span>
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      {ergebnis.anspruch ? (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">🩹 Ihre Unfallrente der Berufsgenossenschaft</h3>
          <div className="mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-5xl font-bold">{fmtEuro(ergebnis.renteMonat)}</span>
              <span className="text-xl opacity-80">pro Monat</span>
            </div>
            <p className="text-orange-100 mt-2 text-sm">
              Teilrente bei {ergebnis.mdeGueltig} % MdE = {ergebnis.mdeGueltig} % der Vollrente
              {ergebnis.zulageMonat > 0 && ', inklusive 10 % Schwerverletztenzulage'} – steuerfrei nach § 3 Nr. 1 Buchst. a EStG
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Rente pro Jahr</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.renteJahr)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Vollrente (100 % MdE)</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.vollrenteMonat)}/Monat</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Maßgeblicher JAV</span>
              <div className="text-xl font-bold">{fmtEuro(ergebnis.jav)}</div>
            </div>
            {ergebnis.zulageMonat > 0 ? (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">davon Schwerverletztenzulage</span>
                <div className="text-xl font-bold">{fmtEuro(ergebnis.zulageMonat)}/Monat</div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Teilrente ohne Zulage</span>
                <div className="text-xl font-bold">{fmtEuro(ergebnis.teilrenteMonat)}/Monat</div>
              </div>
            )}
          </div>

          {(ergebnis.mindestGreift || ergebnis.hoechstGreift) && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-3 text-sm">
              {ergebnis.mindestGreift && (
                <p>
                  ⬆️ Ihr Verdienst liegt unter dem Mindest-JAV. Gerechnet wird mit{' '}
                  <strong>{fmtEuro(ergebnis.mindestJav)}</strong> ({(ergebnis.mindestProzent * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} %
                  der Bezugsgröße für Ihr Alter, § 85 Abs. 1/1a SGB VII).
                </p>
              )}
              {ergebnis.hoechstGreift && (
                <p>
                  ⬇️ Ihr Verdienst übersteigt den Höchst-JAV. Gerechnet wird mit <strong>{fmtEuro(ergebnis.obergrenze)}</strong> (§ 85 Abs. 2 SGB VII).
                </p>
              )}
            </div>
          )}

          {ergebnis.abfindungMoeglich && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-sm">
              💡 Bei einer MdE unter 40 % können Sie die Rente auf Antrag mit dem Kapitalwert abfinden lassen
              (§ 76 SGB VII) – nur sinnvoll, wenn keine Verschlechterung zu erwarten ist.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">⚠️ Keine Unfallrente bei {ergebnis.mdeGueltig} % MdE</h3>
          <p className="text-sm text-amber-800">
            Eine Rente der gesetzlichen Unfallversicherung setzt voraus, dass die Erwerbsfähigkeit über die 26. Woche
            nach dem Versicherungsfall hinaus um <strong>wenigstens 20 %</strong> gemindert ist (§ 56 Abs. 1 Satz 1 SGB VII).
            Ausnahme: Mehrere Versicherungsfälle mit je mindestens 10 % MdE, die zusammen 20 % erreichen (Stützrente) –
            dann setzen Sie oben den Haken. Zum Vergleich: Bei 20 % MdE wären es {fmtEuro(ergebnis.vollrenteMonat * 0.2)} im Monat.
          </p>
        </div>
      )}

      {/* Rechenweg */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 So wird gerechnet</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">Jahresarbeitsverdienst (eingegeben)</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.javRoh)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">Mindest-JAV ({(ergebnis.mindestProzent * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % von 47.460 €) / Höchst-JAV</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.mindestJav)} / {fmtEuro(ergebnis.obergrenze)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">= Maßgeblicher JAV</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.jav)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">× 2/3 = Vollrente pro Jahr (§ 56 Abs. 3)</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.vollrenteJahr)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
            <span className="text-gray-600">× {ergebnis.mdeGueltig} % MdE = Teilrente pro Jahr</span>
            <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.teilrenteJahr)}</span>
          </div>
          {ergebnis.zulageMonat > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 gap-4">
              <span className="text-gray-600">+ 10 % Schwerverletztenzulage (§ 57)</span>
              <span className="font-medium text-gray-800 text-right">{fmtEuro(ergebnis.zulageMonat * 12)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 gap-4">
            <span className="text-gray-600">÷ 12 = Monatsrente</span>
            <span className="font-bold text-orange-700 text-right">{fmtEuro(ergebnis.renteMonat)}</span>
          </div>
        </div>
      </div>

      {/* MdE-Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">📋 Rentenhöhe nach MdE – Vergleichstabelle</h3>
        <p className="text-xs text-gray-500 mb-4">Für Ihren maßgeblichen JAV von {fmtEuro(ergebnis.jav)}, ohne Schwerverletztenzulage</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 pr-2 font-semibold text-gray-700">MdE</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Rente/Monat</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Rente/Jahr</th>
                <th className="text-right py-2 pl-2 font-semibold text-gray-700">Abfindung möglich</th>
              </tr>
            </thead>
            <tbody>
              {MDE_STUFEN.map((stufe) => {
                const jahr = ergebnis.vollrenteJahr * (stufe / 100);
                const aktiv = stufe === ergebnis.mdeGueltig;
                return (
                  <tr key={stufe} className={`border-b border-gray-100 ${aktiv ? 'bg-orange-50' : ''}`}>
                    <td className={`py-2 pr-2 ${aktiv ? 'font-bold text-orange-700' : 'font-medium text-gray-800'}`}>{stufe} %</td>
                    <td className={`py-2 px-2 text-right ${aktiv ? 'font-bold text-orange-700' : 'text-gray-700'}`}>{fmtEuro(jahr / 12)}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{fmtEuroRund(jahr)}</td>
                    <td className="py-2 pl-2 text-right text-gray-500">{stufe < MDE_ABFINDUNG_GRENZE ? 'ja (§ 76)' : 'nein'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Gut zu wissen</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2"><span>•</span><span><strong>Beginn:</strong> Die Rente wird ab dem Tag gezahlt, der auf das Ende des Verletztengeldes folgt – oder ab dem Tag nach dem Unfall, wenn kein Verletztengeld gezahlt wurde (§ 72 SGB VII).</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Vorläufig, dann dauerhaft:</strong> In den ersten drei Jahren wird die Rente als vorläufige Entschädigung festgesetzt und die MdE kann jederzeit neu bewertet werden. Spätestens nach drei Jahren wird sie zur Rente auf unbestimmte Zeit (§ 62 SGB VII).</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Jährliche Anpassung:</strong> Zum 1. Juli steigt die Unfallrente um denselben Prozentsatz wie die gesetzlichen Renten (§ 95 SGB VII) – 2026 um 4,24 %.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Steuerfrei, aber anrechenbar:</strong> Unfallrenten sind nach § 3 Nr. 1 Buchst. a EStG steuerfrei. Trifft sie mit einer Erwerbsminderungs- oder Altersrente zusammen, wird die gesetzliche Rente nach § 93 SGB VI gekürzt, soweit beide zusammen 70 % des JAV übersteigen.</span></li>
          <li className="flex gap-2"><span>•</span><span><strong>Unabhängig vom Job:</strong> Die Unfallrente wird auch gezahlt, wenn Sie weiter voll arbeiten – sie entschädigt die abstrakte Minderung der Erwerbsfähigkeit, nicht den konkreten Verdienstausfall.</span></li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Dieser Rechner bildet die Grundformel der §§ 56, 57, 82 und 85 SGB VII ab. Die MdE
        stellt ausschließlich der Unfallversicherungsträger anhand ärztlicher Gutachten fest – der Rechner leitet keine
        MdE aus Diagnosen ab und verspricht keine Bewilligung. Nicht abgebildet: Sonderregeln zum JAV bei
        Berufsanfängern, Ausbildung, Neufestsetzung nach Altersstufen (§§ 87, 90 SGB VII), Hinterbliebenenrenten,
        Anrechnung auf andere Renten. Keine Rechtsberatung.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/sgb_7/__56.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 56 SGB VII – Voraussetzungen und Höhe des Rentenanspruchs (MdE 20 %, Vollrente 2/3 JAV, Teilrente)
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_7/__57.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 57 SGB VII – Erhöhung der Rente bei Schwerverletzten (+10 %)
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_7/__82.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 82 SGB VII – Regelberechnung des Jahresarbeitsverdienstes
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_7/__85.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 85 SGB VII – Mindest- und Höchstjahresarbeitsverdienst
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_7/__76.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 76 SGB VII – Abfindung bei MdE unter 40 %
          </a>
          <a href="https://www.gesetze-im-internet.de/svbezgrv_2026/BJNR1160A0025.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            SV-Rechengrößen-Verordnung 2026 – Bezugsgröße 47.460 €/Jahr
          </a>
          <a href="https://www.dguv.de/de/reha_leistung/geldleistungen/rente/rentenhoehe/index.jsp" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            DGUV – Höhe der Rente (Erläuterung der Berufsgenossenschaften)
          </a>
        </div>
      </div>
    </div>
  );
}
