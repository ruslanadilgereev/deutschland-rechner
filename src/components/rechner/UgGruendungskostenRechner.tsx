import { useState, useMemo } from 'react';

/**
 * GNotKG Anlage 2 (Tabelle B), 1,0-Gebühr ("einfache Gebühr").
 * Kreuzgeprüft (buzer.de + bestehende NotarkostenRechner.tsx):
 * 500→15, 10.000→75, 50.000→165, 200.000→435, 500.000→935,
 * 1.000.000→1.735, 3.000.000→4.935. Gründung GGW 30.000 → 125 €.
 */
function gnotkgEinfacheGebuehr(geschaeftswert: number): number {
  if (geschaeftswert <= 0) return 0;
  let gebuehr = 15;
  let rest = geschaeftswert - 500;
  if (rest <= 0) return gebuehr;
  const s1 = Math.min(rest, 1500); gebuehr += Math.ceil(s1 / 500) * 4; rest -= 1500; if (rest <= 0) return gebuehr;
  const s2 = Math.min(rest, 8000); gebuehr += Math.ceil(s2 / 1000) * 6; rest -= 8000; if (rest <= 0) return gebuehr;
  const s3 = Math.min(rest, 15000); gebuehr += Math.ceil(s3 / 3000) * 8; rest -= 15000; if (rest <= 0) return gebuehr;
  const s4 = Math.min(rest, 25000); gebuehr += Math.ceil(s4 / 5000) * 10; rest -= 25000; if (rest <= 0) return gebuehr;
  const s5 = Math.min(rest, 150000); gebuehr += Math.ceil(s5 / 15000) * 27; rest -= 150000; if (rest <= 0) return gebuehr;
  const s6 = Math.min(rest, 300000); gebuehr += Math.ceil(s6 / 30000) * 50; rest -= 300000; if (rest <= 0) return gebuehr;
  const s7 = Math.min(rest, 4500000); gebuehr += Math.ceil(s7 / 50000) * 80; rest -= 4500000; if (rest <= 0) return gebuehr;
  const s8 = Math.min(rest, 5000000); gebuehr += Math.ceil(s8 / 200000) * 130; rest -= 5000000; if (rest <= 0) return gebuehr;
  const s9 = Math.min(rest, 10000000); gebuehr += Math.ceil(s9 / 250000) * 150; rest -= 10000000; if (rest <= 0) return gebuehr;
  const s10 = Math.min(rest, 10000000); gebuehr += Math.ceil(s10 / 500000) * 280; rest -= 10000000; if (rest <= 0) return gebuehr;
  gebuehr += Math.ceil(rest / 1000000) * 120;
  return gebuehr;
}

// Handelsregister: UG ist immer Bargründung (Sacheinlagen ausgeschlossen)
// → HRegGebV Nr. 2100 = 225,00 € (bundeseinheitlich, kein Einpersonen-/Mehrpersonen-Unterschied)
const HREG_GEBUEHR = 225;
const UST_SATZ = 0.19;
const STAMMKAPITAL_GMBH_GRENZE = 25000; // Schwelle für Umwandlung in reguläre GmbH (§ 5a Abs. 5 GmbHG)

type Gruendungsart = 'muster' | 'individuell';

export function UgGruendungskostenRechner() {
  const [stammkapital, setStammkapital] = useState(1000);
  const [art, setArt] = useState<Gruendungsart>('muster');
  const [einpersonen, setEinpersonen] = useState(true);

  const ergebnis = useMemo(() => {
    const sk = Math.max(1, stammkapital);

    // Geschäftswert für die Beurkundung:
    // - Musterprotokoll: GGW = Stammkapital (keine 30.000-€-Mindestgrenze)
    // - individuell: GGW = max(Stammkapital, 30.000) (§ 107 GNotKG, Bargründung mind. 30.000)
    const ggwBeurkundung = art === 'muster' ? sk : Math.max(sk, 30000);
    const einfacheGebuehr = gnotkgEinfacheGebuehr(ggwBeurkundung);

    // Beurkundung Gesellschaftsvertrag (KV 21100/21200)
    // - Musterprotokoll: 1,0-Gebühr; Mindestgebühr KV 21201/21200: 60 € (Einpersonen) bzw. 120 €
    // - individuell: 2,0-Gebühr, mindestens 120 €
    let beurkundung: number;
    let beurkundungFaktor: number;
    if (art === 'muster') {
      beurkundungFaktor = 1.0;
      const minBeurk = einpersonen ? 60 : 120;
      beurkundung = Math.max(einfacheGebuehr * 1.0, minBeurk);
    } else {
      beurkundungFaktor = 2.0;
      beurkundung = Math.max(einfacheGebuehr * 2.0, 120);
    }

    // Vollzug/Betreuung (KV 22110/22200): 0,5-Gebühr nur bei individueller Gründung
    // (beim einfachen Musterprotokoll i. d. R. nicht gesondert)
    const vollzug = art === 'individuell' ? Math.max(einfacheGebuehr * 0.5, 30) : 0;

    // Beglaubigung HR-Anmeldung (KV 21201): 0,5-Gebühr, min 30 €, max 70 €
    const hrAnmeldung = Math.min(Math.max(einfacheGebuehr * 0.5, 30), 70);

    // XML-Strukturdaten elektronisches Handelsregister (KV 22114): Festgebühr
    const xmlGebuehr = art === 'muster' ? 20 : 25;

    const notarNetto = beurkundung + vollzug + hrAnmeldung + xmlGebuehr;

    // Auslagen (Post-/Telekommunikations- & Dokumentenpauschale, KV 32000 ff.):
    // vereinfacht 20 % der Gebühren, gedeckelt auf 20 €
    const auslagen = Math.min(notarNetto * 0.20, 20);

    const ust = (notarNetto + auslagen) * UST_SATZ;
    const notarBrutto = notarNetto + auslagen + ust;

    const gesamt = notarBrutto + HREG_GEBUEHR;

    // Hinweis zur Volleinzahlung
    const volleinzahlung = sk;

    return {
      sk,
      ggwBeurkundung,
      einfacheGebuehr,
      beurkundung,
      beurkundungFaktor,
      vollzug,
      hrAnmeldung,
      xmlGebuehr,
      notarNetto,
      auslagen,
      ust,
      notarBrutto,
      hreg: HREG_GEBUEHR,
      gesamt,
      volleinzahlung,
    };
  }, [stammkapital, art, einpersonen]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  // Vergleichsstaffel (für Tabelle, jeweils Einpersonen-Musterprotokoll-Annahme der Funktion)
  const staffel = [1, 500, 1000, 5000, 10000, 12500, 25000];

  function gesamtFuer(sk: number, a: Gruendungsart, einP: boolean): number {
    const ggw = a === 'muster' ? sk : Math.max(sk, 30000);
    const eg = gnotkgEinfacheGebuehr(ggw);
    let beurk: number;
    if (a === 'muster') {
      beurk = Math.max(eg * 1.0, einP ? 60 : 120);
    } else {
      beurk = Math.max(eg * 2.0, 120);
    }
    const voll = a === 'individuell' ? Math.max(eg * 0.5, 30) : 0;
    const hr = Math.min(Math.max(eg * 0.5, 30), 70);
    const xml = a === 'muster' ? 20 : 25;
    const netto = beurk + voll + hr + xml;
    const ausl = Math.min(netto * 0.20, 20);
    const brutto = netto + ausl + netto * 0 + (netto + ausl) * UST_SATZ;
    return brutto + HREG_GEBUEHR;
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Stammkapital */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Stammkapital der UG</span>
            <span className="text-xs text-gray-500 block mt-1">
              Ab 1 € möglich (§ 5a GmbHG). Es muss vor der Anmeldung <strong>vollständig</strong> in bar
              eingezahlt werden – Sacheinlagen sind bei der UG ausgeschlossen.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={stammkapital}
              onChange={(e) => setStammkapital(Math.max(1, Number(e.target.value) || 0))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="1"
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(stammkapital, 25000)}
            onChange={(e) => setStammkapital(Number(e.target.value) || 1)}
            className="w-full mt-3 accent-indigo-500"
            min="1"
            max="25000"
            step="500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 €</span>
            <span>12.500 €</span>
            <span>25.000 €</span>
          </div>
        </div>

        {/* Gründungsart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gründungsart</span>
            <span className="text-xs text-gray-500 block mt-1">
              Das Musterprotokoll ist günstiger, aber nur bis 3 Gesellschafter und 1 Geschäftsführer
              ohne individuelle Regelungen möglich.
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setArt('muster')}
              className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                art === 'muster'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              Musterprotokoll
              <span className={`block text-xs font-normal mt-1 ${art === 'muster' ? 'text-indigo-100' : 'text-gray-400'}`}>
                max. 3 GS + 1 GF · 1,0-Gebühr
              </span>
            </button>
            <button
              type="button"
              onClick={() => setArt('individuell')}
              className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                art === 'individuell'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              Individueller Vertrag
              <span className={`block text-xs font-normal mt-1 ${art === 'individuell' ? 'text-indigo-100' : 'text-gray-400'}`}>
                Mindestwert 30.000 € · 2,0-Gebühr
              </span>
            </button>
          </div>
        </div>

        {/* Gesellschafterzahl (nur bei Musterprotokoll relevant für Mindestgebühr) */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gesellschafter</span>
            <span className="text-xs text-gray-500 block mt-1">
              Bei einer Ein-Personen-UG gilt beim Musterprotokoll die niedrigere Mindestgebühr von 60 €.
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEinpersonen(true)}
              className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                einpersonen
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              Ein-Personen-UG
            </button>
            <button
              type="button"
              onClick={() => setEinpersonen(false)}
              className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                !einpersonen
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              Mehrere Gesellschafter
            </button>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏢 Gründungskosten Ihrer UG (haftungsbeschränkt)</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.gesamt)}</span>
            <span className="text-xl opacity-80">gesamt</span>
          </div>
          <p className="text-indigo-100 mt-2 text-sm">
            {art === 'muster' ? 'Musterprotokoll' : 'Individueller Gesellschaftsvertrag'} ·{' '}
            {einpersonen ? 'Ein-Personen-UG' : 'mehrere Gesellschafter'} · Stammkapital{' '}
            {formatEuroRound(ergebnis.sk)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Notarkosten (brutto)</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.notarBrutto)}</div>
            <span className="text-xs opacity-70">netto {formatEuroRound(ergebnis.notarNetto)} + 19 % USt</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Handelsregister</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.hreg)}</div>
            <span className="text-xs opacity-70">HRegGebV Nr. 2100</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">+ einzuzahlendes Stammkapital (kein „Kostenposten“)</span>
            <span className="text-lg font-bold">{formatEuroRound(ergebnis.volleinzahlung)}</span>
          </div>
          <p className="text-xs opacity-70 mt-1">
            Bleibt Vermögen der UG, ist aber vor der Anmeldung vollständig einzuzahlen.
          </p>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            1. Notar – Geschäftswert &amp; einfache Gebühr (GNotKG Tabelle B)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Geschäftswert{' '}
              {art === 'muster'
                ? '(= Stammkapital)'
                : '(= max. aus Stammkapital und 30.000 €, § 107 GNotKG)'}
            </span>
            <span className="text-gray-900">{formatEuroRound(ergebnis.ggwBeurkundung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Einfache Gebühr (1,0) auf diesen Wert</span>
            <span className="text-gray-900">{formatEuro(ergebnis.einfacheGebuehr)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            2. Notarpositionen (netto)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Beurkundung Gesellschaftsvertrag ({ergebnis.beurkundungFaktor.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}-Gebühr
              {art === 'muster' ? `, min. ${einpersonen ? '60' : '120'} €` : ', min. 120 €'})
            </span>
            <span className="text-gray-900">{formatEuro(ergebnis.beurkundung)}</span>
          </div>
          {ergebnis.vollzug > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Vollzug / Betreuung (0,5-Gebühr)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.vollzug)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Beglaubigung HR-Anmeldung (0,5-Gebühr, 30–70 €)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.hrAnmeldung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">XML-Strukturdaten elektron. Handelsregister</span>
            <span className="text-gray-900">{formatEuro(ergebnis.xmlGebuehr)}</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">= Notarkosten netto</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.notarNetto)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            3. Auslagen &amp; Umsatzsteuer
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">+ Auslagen (Post-/Dokumentenpauschale)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.auslagen)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">+ 19 % Umsatzsteuer</span>
            <span className="text-gray-900">{formatEuro(ergebnis.ust)}</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">= Notarkosten brutto</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.notarBrutto)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            4. Handelsregister (Amtsgericht, ohne USt)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Ersteintragung Bargründung (HRegGebV Nr. 2100)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.hreg)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            5. Summe der Gründungskosten
          </div>
          <div className="flex justify-between py-2 bg-indigo-100 -mx-6 px-6">
            <span className="font-bold text-indigo-800">Notar brutto + Handelsregister</span>
            <span className="font-bold text-2xl text-indigo-900">{formatEuro(ergebnis.gesamt)}</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-indigo-50 rounded-xl text-sm text-indigo-800">
          💡 Das <strong>Stammkapital ist kein Kostenposten</strong>: Es bleibt Vermögen der UG, muss aber
          vor der Anmeldung zum Handelsregister vollständig in bar auf das Geschäftskonto eingezahlt werden
          (§ 5a Abs. 2 GmbHG). Hinzu kommen oft eine Gewerbeanmeldung (15–60 €) sowie laufende Kosten für
          Buchhaltung und Steuerberatung.
        </div>
      </div>

      {/* Kosten-Staffel */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📍 Gründungskosten je Stammkapital ({art === 'muster' ? 'Musterprotokoll' : 'individueller Vertrag'})</h3>
        <p className="text-sm text-gray-500 mb-4">
          Notar (brutto) + Handelsregister (225 €) bei {einpersonen ? 'Ein-Personen-UG' : 'mehreren Gesellschaftern'}.
          Beim Musterprotokoll ändern sich die Kosten erst spürbar, wenn der Geschäftswert die Mindestgebühr übersteigt.
        </p>
        <div className="space-y-2">
          {staffel.map((sk) => {
            const total = gesamtFuer(sk, art, einpersonen);
            const isAktuell = sk === ergebnis.sk;
            return (
              <div
                key={sk}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isAktuell ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-gray-50'
                }`}
              >
                <span className={`text-sm font-medium ${isAktuell ? 'text-indigo-800' : 'text-gray-600'}`}>
                  Stammkapital {formatEuroRound(sk)}
                </span>
                <span className={`font-bold ${isAktuell ? 'text-indigo-900' : 'text-gray-800'}`}>
                  {formatEuroRound(total)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wichtige UG-Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Das Wichtigste zur UG (haftungsbeschränkt)</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Volleinzahlung (100 %):</strong> Das Stammkapital muss vor der Anmeldung vollständig in bar eingezahlt sein (§ 5a Abs. 2 GmbHG) – anders als bei der GmbH, wo die Hälfte reicht.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Keine Sacheinlagen:</strong> Bei der UG sind Sacheinlagen ausgeschlossen. Das Stammkapital kommt immer als Geld aufs Konto.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Rücklagepflicht 25 %:</strong> Die UG muss jährlich ein Viertel des Jahresüberschusses in eine gesetzliche Rücklage einstellen, bis 25.000 € erreicht sind (§ 5a Abs. 3 GmbHG).</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Firmenzusatz Pflicht:</strong> Die Firma muss „UG (haftungsbeschränkt)“ oder „Unternehmergesellschaft (haftungsbeschränkt)“ enthalten.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Umwandlung möglich:</strong> Ist die Rücklage auf 25.000 € angewachsen, kann die UG in eine reguläre GmbH umgewandelt werden (§ 5a Abs. 5 GmbHG).</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-2">⚠️ Wichtiger Hinweis</h3>
        <p className="text-sm text-amber-700">
          Dieser Rechner liefert eine <strong>Schätzung ohne Gewähr</strong> der gesetzlichen Notar- und
          Handelsregistergebühren (GNotKG, HRegGebV; Stand 2026) und <strong>ersetzt keine
          Rechts- oder Steuerberatung</strong>. Die tatsächlichen Notarkosten können je nach Aufwand,
          Anzahl der Beteiligten, zusätzlichen Vollmachten, Geschäftsführerbestellung oder Auslagen
          abweichen. Auslagen und XML-Strukturdaten sind hier pauschal angesetzt. Für eine verbindliche
          Kostennote wenden Sie sich an Ihren Notar.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/gmbhg/__5a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 5a GmbHG – Unternehmergesellschaft (Stammkapital ab 1 €, Volleinzahlung, Rücklagepflicht)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gnotkg/anlage_2.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GNotKG Anlage 2 – Gebührentabelle B (Notargebühren)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gnotkg/__107.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 107 GNotKG – Geschäftswert bei Gründung (Mindestwert 30.000 €)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/hreggebv/anlage.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            HRegGebV – Handelsregistergebührenverordnung (Nr. 2100: 225 €)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gmbhg/__2.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 2 GmbHG – Musterprotokoll (max. 3 Gesellschafter + 1 Geschäftsführer)
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Stand: 2026 (HRegGebV i. d. F. vom 30.04.2025) · Alle Angaben ohne Gewähr
        </p>
      </div>
    </div>
  );
}

export default UgGruendungskostenRechner;
