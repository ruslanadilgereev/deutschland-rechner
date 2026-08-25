import { useState, useMemo } from 'react';

// Urlaubsabgeltung – § 7 Abs. 4 BUrlG: Nicht genommener Urlaub ist bei
// Beendigung des Arbeitsverhältnisses abzugelten. Berechnung nach dem
// Referenzprinzip des § 11 BUrlG: Tagessatz = Verdienst der letzten
// 13 Wochen ÷ Arbeitstage in 13 Wochen = (Monatsbrutto × 3) ÷ (13 × Tage/Woche).

function rund2(x: number): number {
  return Math.round(x * 100) / 100;
}

function formatEuro(betrag: number): string {
  return betrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export default function UrlaubsabgeltungRechner() {
  const [monatsbrutto, setMonatsbrutto] = useState(3900);
  const [tageProWoche, setTageProWoche] = useState(5);
  const [resttage, setResttage] = useState(10);

  const ergebnis = useMemo(() => {
    const b = Math.max(0, monatsbrutto || 0);
    const t = Math.min(6, Math.max(1, Math.round(tageProWoche || 5)));
    const rt = Math.max(0, resttage || 0);

    const arbeitstage13Wochen = 13 * t;
    const tagessatz = rund2((b * 3) / arbeitstage13Wochen);
    const abgeltung = rund2(tagessatz * rt);

    return { b, t, rt, arbeitstage13Wochen, tagessatz, abgeltung };
  }, [monatsbrutto, tageProWoche, resttage]);

  return (
    <div>
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Ihre Angaben</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="ua-brutto" className="block text-sm font-medium text-gray-700 mb-1">
              Monatsbrutto (€)
            </label>
            <input
              id="ua-brutto"
              type="number"
              min="0"
              step="100"
              value={monatsbrutto}
              onChange={(e) => setMonatsbrutto(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">Ohne einmalige Zahlungen wie Weihnachtsgeld.</p>
          </div>
          <div>
            <label htmlFor="ua-tage" className="block text-sm font-medium text-gray-700 mb-1">
              Arbeitstage pro Woche
            </label>
            <select
              id="ua-tage"
              value={tageProWoche}
              onChange={(e) => setTageProWoche(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500"
            >
              {[1, 2, 3, 4, 5, 6].map((t) => (
                <option key={t} value={t}>{t} {t === 1 ? 'Tag' : 'Tage'}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ua-rest" className="block text-sm font-medium text-gray-700 mb-1">
              Offene Urlaubstage
            </label>
            <input
              id="ua-rest"
              type="number"
              min="0"
              step="0.5"
              value={resttage}
              onChange={(e) => setResttage(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">Auch halbe Tage möglich.</p>
          </div>
        </div>
      </div>

      {/* Hauptergebnis */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
        <p className="text-orange-100 text-sm mb-1">Ihre Urlaubsabgeltung (brutto)</p>
        <p className="text-5xl font-bold mb-2">{formatEuro(ergebnis.abgeltung)}</p>
        <p className="text-orange-100 text-sm">
          {ergebnis.rt > 0
            ? `${ergebnis.rt.toLocaleString('de-DE')} offene Urlaubstage × ${formatEuro(ergebnis.tagessatz)} pro Tag. Die Abgeltung ist steuer- und sozialversicherungspflichtig – netto kommt entsprechend weniger an.`
            : 'Geben Sie Ihre offenen Urlaubstage ein.'}
        </p>
      </div>

      {/* Rechenweg */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">So wird gerechnet (§ 7 Abs. 4, § 11 BUrlG)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Verdienst der letzten 13 Wochen (Monatsbrutto × 3)</td>
                <td className="py-2 pl-2 text-right">{formatEuro(rund2(ergebnis.b * 3))}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">÷ Arbeitstage in 13 Wochen (13 × {ergebnis.t})</td>
                <td className="py-2 pl-2 text-right">{ergebnis.arbeitstage13Wochen} Tage</td>
              </tr>
              <tr className="border-b border-gray-100 font-medium text-gray-800">
                <td className="py-2 pr-2">= Urlaubsentgelt pro Tag</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.tagessatz)}</td>
              </tr>
              <tr className="font-bold text-gray-800">
                <td className="py-3 pr-2">× {ergebnis.rt.toLocaleString('de-DE')} offene Tage = Abgeltung</td>
                <td className="py-3 pl-2 text-right text-orange-600">{formatEuro(ergebnis.abgeltung)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <strong>Referenzprinzip:</strong> Maßgeblich ist der durchschnittliche Verdienst der letzten
          13 Wochen vor dem Ende des Arbeitsverhältnisses (ohne Überstunden). Bei schwankendem Lohn
          den Durchschnitt der letzten drei Monate als Monatsbrutto eingeben.
        </div>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-xs text-gray-500 mb-4">
          ⚠️ Bruttowert nach der 13-Wochen-Referenzmethode. Nicht berücksichtigt: Überstundenvergütung,
          Provisionen mit Sonderregeln, tarifliche Abweichungen, Steuer- und SV-Abzüge auf die
          Abgeltung. Schätzung – keine Rechtsberatung.
        </p>
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Quellen</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>
            <a href="https://www.gesetze-im-internet.de/burlg/__7.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 7 Abs. 4 BUrlG – Abgeltung bei Beendigung des Arbeitsverhältnisses
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/burlg/__11.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 11 BUrlG – Urlaubsentgelt (13-Wochen-Referenz)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
