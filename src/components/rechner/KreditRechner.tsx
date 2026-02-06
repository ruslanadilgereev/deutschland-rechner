import { useState, useMemo } from 'react';

// Tilgungsplan-Zeile
interface TilgungsPlanZeile {
  jahr: number;
  restschuld: number;
  zinsen: number;
  tilgung: number;
  rate: number;
}

export default function KreditRechner() {
  // Eingabewerte
  const [kreditsumme, setKreditsumme] = useState(10000);
  const [zinssatz, setZinssatz] = useState(6.5);
  const [laufzeitMonate, setLaufzeitMonate] = useState(48);
  const [zeigeTilgungsplan, setZeigeTilgungsplan] = useState(false);
  const [kreditart, setKreditart] = useState<'raten' | 'endfaellig'>('raten');

  const ergebnis = useMemo(() => {
    const P = kreditsumme; // Kreditsumme (Principal)
    const r = zinssatz / 100 / 12; // Monatlicher Zinssatz
    const n = laufzeitMonate; // Anzahl Monate
    const laufzeitJahre = n / 12;

    if (kreditart === 'endfaellig') {
      // Endfälliges Darlehen: Nur Zinsen während der Laufzeit, Tilgung am Ende
      const zinsenMonatlich = P * r;
      const zinsenGesamt = zinsenMonatlich * n;
      const gesamtbetrag = P + zinsenGesamt;
      const effektivzins = zinssatz; // Bei endfälligem Kredit gleich

      return {
        monatsrate: zinsenMonatlich,
        schlussrate: P,
        gesamtzinsen: zinsenGesamt,
        gesamtbetrag,
        kreditsumme: P,
        zinssatz,
        effektivzins,
        laufzeitMonate: n,
        laufzeitJahre,
        tilgungsplan: [] as TilgungsPlanZeile[],
        kreditart: 'endfaellig' as const,
      };
    }

    // === Annuitätendarlehen (Ratenkredit) ===
    // Formel: A = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    let monatsrate: number;
    if (r === 0) {
      monatsrate = P / n;
    } else {
      const faktor = Math.pow(1 + r, n);
      monatsrate = P * (r * faktor) / (faktor - 1);
    }

    const gesamtbetrag = monatsrate * n;
    const gesamtzinsen = gesamtbetrag - P;

    // Effektivzins (vereinfacht - bei monatlicher Rate ca. gleich Nominalzins)
    // Genauere Berechnung würde unterjährige Verzinsung berücksichtigen
    const effektivzins = Math.pow(1 + r, 12) - 1;

    // === Tilgungsplan erstellen (jährlich) ===
    const tilgungsplan: TilgungsPlanZeile[] = [];
    let restschuld = P;

    for (let jahr = 1; jahr <= Math.ceil(n / 12); jahr++) {
      const monateImJahr = Math.min(12, n - (jahr - 1) * 12);
      let zinsenJahr = 0;
      let tilgungJahr = 0;

      for (let monat = 0; monat < monateImJahr; monat++) {
        const zinsenMonat = restschuld * r;
        const tilgungMonat = monatsrate - zinsenMonat;
        zinsenJahr += zinsenMonat;
        tilgungJahr += tilgungMonat;
        restschuld = Math.max(0, restschuld - tilgungMonat);
      }

      tilgungsplan.push({
        jahr,
        restschuld: Math.max(0, restschuld),
        zinsen: zinsenJahr,
        tilgung: tilgungJahr,
        rate: monatsrate * monateImJahr,
      });
    }

    return {
      monatsrate,
      schlussrate: 0,
      gesamtzinsen,
      gesamtbetrag,
      kreditsumme: P,
      zinssatz,
      effektivzins: effektivzins * 100,
      laufzeitMonate: n,
      laufzeitJahre,
      tilgungsplan,
      kreditart: 'raten' as const,
    };
  }, [kreditsumme, zinssatz, laufzeitMonate, kreditart]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuroExact = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  // Balkendiagramm für Zins vs Tilgung
  const zinsenAnteil = (ergebnis.gesamtzinsen / ergebnis.gesamtbetrag) * 100;
  const tilgungAnteil = 100 - zinsenAnteil;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kreditart */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Kreditart</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setKreditart('raten')}
              className={`py-4 px-4 rounded-xl transition-all ${
                kreditart === 'raten'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">📊 Ratenkredit</span>
              <span className="text-xs opacity-80">Gleichbleibende Monatsrate</span>
            </button>
            <button
              onClick={() => setKreditart('endfaellig')}
              className={`py-4 px-4 rounded-xl transition-all ${
                kreditart === 'endfaellig'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">🎯 Endfällig</span>
              <span className="text-xs opacity-80">Tilgung am Laufzeitende</span>
            </button>
          </div>
        </div>

        {/* Kreditsumme */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kreditsumme (Nettodarlehensbetrag)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kreditsumme}
              onChange={(e) => setKreditsumme(Math.max(500, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="500"
              max="100000"
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={kreditsumme}
            onChange={(e) => setKreditsumme(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="1000"
            max="50000"
            step="500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1.000 €</span>
            <span>25.000 €</span>
            <span>50.000 €</span>
          </div>
        </div>

        {/* Zinssatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Sollzinssatz (p.a.)</span>
            <span className="text-xs text-gray-500 block mt-1">Gebundener Sollzinssatz pro Jahr</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={zinssatz}
              onChange={(e) => setZinssatz(Math.max(0, Math.min(25, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              max="25"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
          </div>
          <input
            type="range"
            value={zinssatz}
            onChange={(e) => setZinssatz(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="0"
            max="15"
            step="0.1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>7,5%</span>
            <span>15%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            💡 Typischer Ratenkredit: 4-10% | Dispokredit: 10-15%
          </p>
        </div>

        {/* Laufzeit */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Laufzeit</span>
          </label>
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={() => setLaufzeitMonate(Math.max(6, laufzeitMonate - 6))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-gray-800">{laufzeitMonate}</div>
              <div className="text-sm text-gray-500">
                Monate ({(laufzeitMonate / 12).toFixed(1)} Jahre)
              </div>
            </div>
            <button
              onClick={() => setLaufzeitMonate(Math.min(120, laufzeitMonate + 6))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
          <input
            type="range"
            value={laufzeitMonate}
            onChange={(e) => setLaufzeitMonate(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
            min="6"
            max="120"
            step="6"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>6 Mo.</span>
            <span>5 Jahre</span>
            <span>10 Jahre</span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">💳 Ihre Monatsrate</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroExact(ergebnis.monatsrate)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          {kreditart === 'endfaellig' && (
            <p className="text-emerald-100 mt-2 text-sm">
              ⚠️ Schlussrate am Ende: <strong>{formatEuro(ergebnis.schlussrate)}</strong>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamtbetrag</span>
            <div className="text-xl font-bold">{formatEuroExact(ergebnis.gesamtbetrag)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Zinskosten</span>
            <div className="text-xl font-bold">{formatEuroExact(ergebnis.gesamtzinsen)}</div>
          </div>
        </div>

        {/* Balkendiagramm Zinsen vs. Tilgung */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between text-sm mb-2">
            <span>Tilgung: {formatEuro(ergebnis.kreditsumme)}</span>
            <span>Zinsen: {formatEuro(ergebnis.gesamtzinsen)}</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden bg-white/20 flex">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${tilgungAnteil}%` }}
            ></div>
            <div
              className="bg-red-400 h-full transition-all duration-500"
              style={{ width: `${zinsenAnteil}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1 opacity-70">
            <span>{tilgungAnteil.toFixed(1)}% Tilgung</span>
            <span>{zinsenAnteil.toFixed(1)}% Zinsen</span>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Nettodarlehensbetrag</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.kreditsumme)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Sollzinssatz (p.a.)</span>
            <span className="text-gray-900">{formatProzent(ergebnis.zinssatz)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Effektiver Jahreszins (ca.)</span>
            <span className="font-medium text-emerald-700">{formatProzent(ergebnis.effektivzins)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Laufzeit</span>
            <span className="text-gray-900">
              {ergebnis.laufzeitMonate} Monate ({ergebnis.laufzeitJahre.toFixed(1)} Jahre)
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Anzahl Raten</span>
            <span className="text-gray-900">{ergebnis.laufzeitMonate}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Monatliche Rate</span>
            <span className="font-bold text-gray-900">{formatEuroExact(ergebnis.monatsrate)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>Gesamte Zinskosten</span>
            <span className="font-bold">{formatEuroExact(ergebnis.gesamtzinsen)}</span>
          </div>
          <div className="flex justify-between py-3 bg-emerald-50 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-emerald-800">Gesamtrückzahlung</span>
            <span className="font-bold text-2xl text-emerald-900">
              {formatEuroExact(ergebnis.gesamtbetrag)}
            </span>
          </div>
        </div>
      </div>

      {/* Tilgungsplan */}
      {kreditart === 'raten' && ergebnis.tilgungsplan.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">📅 Tilgungsplan (jährlich)</h3>
            <button
              onClick={() => setZeigeTilgungsplan(!zeigeTilgungsplan)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                zeigeTilgungsplan
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {zeigeTilgungsplan ? '▲ Ausblenden' : '▼ Anzeigen'}
            </button>
          </div>

          {zeigeTilgungsplan && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 text-gray-600">Jahr</th>
                    <th className="text-right py-2 text-gray-600">Rate (Jahr)</th>
                    <th className="text-right py-2 text-gray-600">Zinsen</th>
                    <th className="text-right py-2 text-gray-600">Tilgung</th>
                    <th className="text-right py-2 text-gray-600">Restschuld</th>
                  </tr>
                </thead>
                <tbody>
                  {ergebnis.tilgungsplan.map((zeile) => (
                    <tr key={zeile.jahr} className="border-b border-gray-100">
                      <td className="py-2 font-medium">{zeile.jahr}</td>
                      <td className="text-right py-2">{formatEuroExact(zeile.rate)}</td>
                      <td className="text-right py-2 text-red-600">{formatEuroExact(zeile.zinsen)}</td>
                      <td className="text-right py-2 text-emerald-600">
                        {formatEuroExact(zeile.tilgung)}
                      </td>
                      <td className="text-right py-2 font-medium">
                        {formatEuroExact(zeile.restschuld)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-2">Gesamt</td>
                    <td className="text-right py-2">{formatEuroExact(ergebnis.gesamtbetrag)}</td>
                    <td className="text-right py-2 text-red-600">
                      {formatEuroExact(ergebnis.gesamtzinsen)}
                    </td>
                    <td className="text-right py-2 text-emerald-600">
                      {formatEuroExact(ergebnis.kreditsumme)}
                    </td>
                    <td className="text-right py-2">0,00 €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Kreditarten im Überblick</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>📊</span>
            <span>
              <strong>Ratenkredit (Annuitätendarlehen):</strong> Gleichbleibende monatliche Rate aus
              Zins und Tilgung. Der Zinsanteil sinkt, der Tilgungsanteil steigt.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🎯</span>
            <span>
              <strong>Endfälliges Darlehen:</strong> Während der Laufzeit zahlen Sie nur Zinsen. Die
              gesamte Kreditsumme wird am Ende fällig.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🚗</span>
            <span>
              <strong>Autokredit:</strong> Zweckgebundener Kredit für Fahrzeuge, oft mit günstigeren
              Zinsen als Ratenkredit.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🏠</span>
            <span>
              <strong>Immobilienkredit:</strong> Langfristiges Darlehen für Hauskauf/Bau mit
              Grundschuldsicherung. Deutlich niedrigere Zinsen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🏧</span>
            <span>
              <strong>Dispokredit:</strong> Überziehungskredit auf dem Girokonto. Flexibel, aber sehr
              teuer (10-15% Zinsen).
            </span>
          </li>
        </ul>
      </div>

      {/* Sondertilgung Info */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💡 Tipps zum Geld sparen</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Sondertilgung:</strong> Viele Kredite erlauben kostenlose Sondertilgungen (oft
              5-10% pro Jahr). Nutzen Sie diese, um Zinsen zu sparen!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Kürzere Laufzeit:</strong> Je kürzer die Laufzeit, desto weniger Zinsen zahlen
              Sie – aber die Monatsrate steigt.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Vergleichen:</strong> Holen Sie mehrere Angebote ein. Schon 0,5% weniger Zinsen
              sparen bei 10.000€ über 5 Jahre ca. 150€.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Dispo ablösen:</strong> Ersetzen Sie teure Dispokredite durch günstigere
              Ratenkredite – das spart oft 5-10% Zinsen!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>14-Tage Widerruf:</strong> Bei Verbraucherkrediten haben Sie 14 Tage
              Widerrufsrecht ohne Angabe von Gründen.
            </span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Effektivzins beachten:</strong> Der effektive Jahreszins enthält alle Kosten
              und ist der wichtigste Vergleichswert.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Bonitätsabhängig:</strong> Die angezeigten Zinsen sind Beispielwerte. Ihr
              persönlicher Zinssatz hängt von Ihrer Bonität ab.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Nebenkosten:</strong> Bei manchen Krediten kommen Bearbeitungsgebühren,
              Kontoführungsgebühren oder Restschuldversicherungen hinzu.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Restschuldversicherung:</strong> Oft nicht nötig und sehr teuer. Prüfen Sie
              Alternativen wie Risikolebensversicherung.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Tragfähigkeit prüfen:</strong> Die Monatsrate sollte max. 30-40% Ihres
              verfügbaren Nettoeinkommens betragen.
            </span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde / Verbraucherschutz */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Verbraucherschutz & Beratung</h3>
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="font-semibold text-emerald-900">Verbraucherzentrale</p>
            <p className="text-sm text-emerald-700 mt-1">
              Die Verbraucherzentralen bieten unabhängige Beratung zu Krediten und
              Finanzierungen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Schuldnerberatung</p>
                <a
                  href="https://www.meine-schulden.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Kostenlose Schuldnerberatung →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">BaFin</p>
                <a
                  href="https://www.bafin.de/DE/Verbraucher/verbraucher_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Verbraucher-Infos der BaFin →
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-gray-800">Kreditrechte nach § 491 BGB</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• 14-Tage Widerrufsrecht bei Verbraucherkrediten</li>
                <li>• Recht auf vorzeitige Rückzahlung (Vorfälligkeitsentschädigung max. 1%)</li>
                <li>• Transparenzpflicht: Alle Kosten müssen offengelegt werden</li>
                <li>• Verbot von Koppelgeschäften (z.B. Zwangs-Versicherungen)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/bgb/__488.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BGB § 488 – Darlehensvertrag
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bgb/__491.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BGB § 491 – Verbraucherdarlehensvertrag
          </a>
          <a
            href="https://www.bafin.de/DE/Verbraucher/verbraucher_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BaFin – Verbraucherinformationen Kredite
          </a>
          <a
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/kredit"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Kredit & Finanzierung
          </a>
          <a
            href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesbank – Aktuelle Zinssätze
          </a>
        </div>
      </div>
    </div>
  );
}
