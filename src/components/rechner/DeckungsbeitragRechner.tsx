import { useState, useMemo } from 'react';

// Deckungsbeitrag-Rechner (Kostenrechnung)
// Stück-DB = Verkaufspreis − variable Stückkosten
// Gesamt-DB (DB I) = Stück-DB × Menge; DB-Quote = Stück-DB / Preis
// Break-Even-Menge = Fixkosten / Stück-DB (aufgerundet auf ganze Stück)
// Gewinn = Gesamt-DB − Fixkosten

function rund2(x: number): number {
  return Math.round(x * 100) / 100;
}

function formatEuro(betrag: number, dez = 2): string {
  return betrag.toLocaleString('de-DE', { minimumFractionDigits: dez, maximumFractionDigits: dez }) + ' €';
}

export default function DeckungsbeitragRechner() {
  const [preis, setPreis] = useState(50);
  const [varKosten, setVarKosten] = useState(30);
  const [menge, setMenge] = useState(1000);
  const [fixkosten, setFixkosten] = useState(15000);

  const ergebnis = useMemo(() => {
    const p = Math.max(0, preis || 0);
    const vk = Math.max(0, varKosten || 0);
    const m = Math.max(0, menge || 0);
    const fk = Math.max(0, fixkosten || 0);

    const stueckDB = rund2(p - vk);
    const gesamtDB = rund2(stueckDB * m);
    const umsatz = rund2(p * m);
    const dbQuote = p > 0 ? rund2((stueckDB / p) * 100) : null;
    const breakEven = stueckDB > 0 ? Math.ceil(fk / stueckDB) : null;
    const breakEvenUmsatz = breakEven !== null ? rund2(breakEven * p) : null;
    const gewinn = rund2(gesamtDB - fk);

    return { p, vk, m, fk, stueckDB, gesamtDB, umsatz, dbQuote, breakEven, breakEvenUmsatz, gewinn };
  }, [preis, varKosten, menge, fixkosten]);

  return (
    <div>
      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Preise, Kosten & Menge</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="db-preis" className="block text-sm font-medium text-gray-700 mb-1">
              Verkaufspreis pro Stück (netto, €)
            </label>
            <input
              id="db-preis"
              type="number"
              min="0"
              step="0.5"
              value={preis}
              onChange={(e) => setPreis(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
          </div>
          <div>
            <label htmlFor="db-vk" className="block text-sm font-medium text-gray-700 mb-1">
              Variable Kosten pro Stück (€)
            </label>
            <input
              id="db-vk"
              type="number"
              min="0"
              step="0.5"
              value={varKosten}
              onChange={(e) => setVarKosten(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">Material, Fertigungslohn, Provisionen, Versand …</p>
          </div>
          <div>
            <label htmlFor="db-menge" className="block text-sm font-medium text-gray-700 mb-1">
              Absatzmenge (Stück)
            </label>
            <input
              id="db-menge"
              type="number"
              min="0"
              step="10"
              value={menge}
              onChange={(e) => setMenge(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
          </div>
          <div>
            <label htmlFor="db-fix" className="block text-sm font-medium text-gray-700 mb-1">
              Fixkosten der Periode (€)
            </label>
            <input
              id="db-fix"
              type="number"
              min="0"
              step="500"
              value={fixkosten}
              onChange={(e) => setFixkosten(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-orange-500 text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">Miete, Gehälter, Versicherungen, Abschreibungen …</p>
          </div>
        </div>
      </div>

      {/* Hauptergebnis */}
      <div className={`bg-gradient-to-br ${ergebnis.stueckDB > 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-rose-600'} rounded-2xl shadow-lg p-6 mb-6 text-white`}>
        <p className="text-white/80 text-sm mb-1">Deckungsbeitrag gesamt (DB I)</p>
        <p className="text-5xl font-bold mb-2">{formatEuro(ergebnis.gesamtDB, 0)}</p>
        <p className="text-white/80 text-sm">
          {ergebnis.stueckDB > 0
            ? `Jedes verkaufte Stück trägt ${formatEuro(ergebnis.stueckDB)} zur Deckung der Fixkosten bei (DB-Quote ${ergebnis.dbQuote?.toFixed(1).replace('.', ',')} %). ${ergebnis.gewinn >= 0 ? `Nach Fixkosten bleibt ein Gewinn von ${formatEuro(ergebnis.gewinn, 0)}.` : `Zur Fixkostendeckung fehlen noch ${formatEuro(Math.abs(ergebnis.gewinn), 0)}.`}`
            : 'Achtung: Die variablen Kosten erreichen oder übersteigen den Verkaufspreis – jedes verkaufte Stück vergrößert den Verlust. Preis erhöhen oder Kosten senken.'}
        </p>
      </div>

      {/* Detailtabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Die Rechnung im Detail</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">Umsatz ({ergebnis.m.toLocaleString('de-DE')} × {formatEuro(ergebnis.p)})</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.umsatz, 0)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">− Variable Kosten ({ergebnis.m.toLocaleString('de-DE')} × {formatEuro(ergebnis.vk)})</td>
                <td className="py-2 pl-2 text-right">−{formatEuro(rund2(ergebnis.vk * ergebnis.m), 0)}</td>
              </tr>
              <tr className="border-b border-gray-100 font-medium text-gray-800">
                <td className="py-2 pr-2">= Deckungsbeitrag (DB I)</td>
                <td className="py-2 pl-2 text-right">{formatEuro(ergebnis.gesamtDB, 0)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2">− Fixkosten</td>
                <td className="py-2 pl-2 text-right">−{formatEuro(ergebnis.fk, 0)}</td>
              </tr>
              <tr className={`font-bold ${ergebnis.gewinn >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                <td className="py-3 pr-2">= Betriebsergebnis</td>
                <td className="py-3 pl-2 text-right">{formatEuro(ergebnis.gewinn, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {ergebnis.breakEven !== null && (
          <div className="mt-4 bg-emerald-50 rounded-lg p-4">
            <p className="text-sm text-emerald-800">
              🎯 <strong>Break-Even-Punkt:</strong> Ab <strong>{ergebnis.breakEven.toLocaleString('de-DE')} Stück</strong>
              {' '}({formatEuro(ergebnis.breakEvenUmsatz ?? 0, 0)} Umsatz) sind die Fixkosten gedeckt – jedes
              weitere Stück ist Gewinn.
            </p>
          </div>
        )}

        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <strong>Formeln:</strong> Stück-DB = Preis − variable Stückkosten · DB I = Stück-DB × Menge ·
          DB-Quote = Stück-DB ÷ Preis · Break-Even-Menge = Fixkosten ÷ Stück-DB. In der mehrstufigen
          Rechnung wird der DB I noch um produkt- und bereichsfixe Kosten zum DB II/III verfeinert.
        </div>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <p className="text-xs text-gray-500 mb-4">
          ⚠️ Einstufige Deckungsbeitragsrechnung mit Nettowerten (ohne Umsatzsteuer). Mehrstufige
          DB-Rechnung, Engpasskalkulation und Steuern sind nicht abgebildet. Keine betriebswirtschaftliche
          Beratung.
        </p>
        <h3 className="text-sm font-bold text-gray-800 mb-2">📚 Quellen</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>
            <a href="https://www.existenzgruender.de/DE/Gruendung-vorbereiten/Businessplan/Businessplan-erstellen/inhalt.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              BMWE-Existenzgründungsportal – Kalkulation im Businessplan
            </a>
          </li>
          <li>
            <a href="https://www.gesetze-im-internet.de/hgb/__253.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
              § 253 HGB – Kostenbegriffe im handelsrechtlichen Kontext
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
