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

// Handelsregister-Gerichtsgebühren (HRegGebV, bundeseinheitlich, ohne USt)
const HREG_BAR = 225; // Nr. 2100: Ersteintragung Bargründung
const HREG_SACH = 360; // Nr. 2101: Ersteintragung mit mind. einer Sacheinlage
const UST_SATZ = 0.19;
const STAMMKAPITAL_MIN = 25000; // § 5 GmbHG: Mindeststammkapital
const MINDESTEINZAHLUNG = 12500; // § 7 Abs. 2 GmbHG: mind. die Hälfte des Mindeststammkapitals

type Gruendungsart = 'muster' | 'individuell';
type Einlageart = 'bar' | 'sach';

export function GmbhGruendungskostenRechner() {
  const [stammkapital, setStammkapital] = useState(25000);
  const [art, setArt] = useState<Gruendungsart>('muster');
  const [einlage, setEinlage] = useState<Einlageart>('bar');

  // Sachgründung ist im Musterprotokoll nicht zulässig (§ 2 Abs. 1a GmbHG).
  // Wird Sachgründung gewählt, gilt automatisch der individuelle Vertrag.
  const effektiveArt: Gruendungsart = einlage === 'sach' ? 'individuell' : art;

  const ergebnis = useMemo(() => {
    const sk = Math.max(STAMMKAPITAL_MIN, stammkapital);

    // Geschäftswert für die Beurkundung:
    // - Musterprotokoll: GGW = Stammkapital (keine 30.000-€-Mindestgrenze)
    // - individuell: GGW = max(Stammkapital, 30.000) (§ 107 GNotKG, Bargründung mind. 30.000)
    const ggwBeurkundung = effektiveArt === 'muster' ? sk : Math.max(sk, 30000);
    const einfacheGebuehr = gnotkgEinfacheGebuehr(ggwBeurkundung);

    // Beurkundung Gesellschaftsvertrag (KV 21100):
    // - Musterprotokoll: 1,0-Gebühr
    // - individuell: 2,0-Gebühr, mindestens 120 €
    let beurkundung: number;
    let beurkundungFaktor: number;
    if (effektiveArt === 'muster') {
      beurkundungFaktor = 1.0;
      beurkundung = Math.max(einfacheGebuehr * 1.0, 60);
    } else {
      beurkundungFaktor = 2.0;
      beurkundung = Math.max(einfacheGebuehr * 2.0, 120);
    }

    // Vollzug (KV 22110) und Betreuung (KV 22200): je 0,5-Gebühr – nur bei
    // individueller Gründung; beim einfachen Musterprotokoll entfallen sie weitgehend.
    const vollzug = effektiveArt === 'individuell' ? Math.max(einfacheGebuehr * 0.5, 30) : 0;
    const betreuung = effektiveArt === 'individuell' ? Math.max(einfacheGebuehr * 0.5, 30) : 0;

    // Beglaubigung HR-Anmeldung (KV 21201): 0,5-Gebühr, min 30 €, max 70 €
    const hrAnmeldung = Math.min(Math.max(einfacheGebuehr * 0.5, 30), 70);

    // XML-Strukturdaten elektronisches Handelsregister (KV 22114): Festgebühr
    const xmlGebuehr = effektiveArt === 'muster' ? 23 : 25;

    const notarNetto = beurkundung + vollzug + betreuung + hrAnmeldung + xmlGebuehr;

    // Auslagen (Post-/Telekommunikations- & Dokumentenpauschale, KV 32000 ff.):
    // vereinfacht 20 % der Gebühren, gedeckelt auf 32 €
    const auslagen = Math.min(notarNetto * 0.20, 32);

    const ust = (notarNetto + auslagen) * UST_SATZ;
    const notarBrutto = notarNetto + auslagen + ust;

    // Handelsregister-Gerichtsgebühr (keine USt)
    const hreg = einlage === 'sach' ? HREG_SACH : HREG_BAR;

    const gesamt = notarBrutto + hreg;

    // Mindesteinzahlung bei Bargründung: mind. 12.500 € (§ 7 Abs. 2 GmbHG),
    // bei Sachgründung muss die Sacheinlage vollständig erbracht werden.
    const mindesteinzahlung = einlage === 'sach' ? sk : Math.max(MINDESTEINZAHLUNG, sk / 2);

    return {
      sk,
      ggwBeurkundung,
      einfacheGebuehr,
      beurkundung,
      beurkundungFaktor,
      vollzug,
      betreuung,
      hrAnmeldung,
      xmlGebuehr,
      notarNetto,
      auslagen,
      ust,
      notarBrutto,
      hreg,
      gesamt,
      mindesteinzahlung,
    };
  }, [stammkapital, art, einlage, effektiveArt]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  // Vergleichsstaffel der Notar-Brutto + Handelsregister je Stammkapital
  const staffel = [25000, 30000, 50000, 75000, 100000];

  function gesamtFuer(sk: number, a: Gruendungsart, e: Einlageart): number {
    const eff: Gruendungsart = e === 'sach' ? 'individuell' : a;
    const ggw = eff === 'muster' ? sk : Math.max(sk, 30000);
    const eg = gnotkgEinfacheGebuehr(ggw);
    let beurk: number;
    if (eff === 'muster') {
      beurk = Math.max(eg * 1.0, 60);
    } else {
      beurk = Math.max(eg * 2.0, 120);
    }
    const voll = eff === 'individuell' ? Math.max(eg * 0.5, 30) : 0;
    const betr = eff === 'individuell' ? Math.max(eg * 0.5, 30) : 0;
    const hr = Math.min(Math.max(eg * 0.5, 30), 70);
    const xml = eff === 'muster' ? 23 : 25;
    const netto = beurk + voll + betr + hr + xml;
    const ausl = Math.min(netto * 0.20, 32);
    const brutto = netto + ausl + (netto + ausl) * UST_SATZ;
    const hreg = e === 'sach' ? HREG_SACH : HREG_BAR;
    return brutto + hreg;
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Stammkapital */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Stammkapital der GmbH</span>
            <span className="text-xs text-gray-500 block mt-1">
              Mindestens 25.000 € (§ 5 GmbHG). Das Stammkapital ist <strong>kein Kostenposten</strong> –
              es bleibt Vermögen der GmbH. Bei der Bargründung müssen vor der Anmeldung mindestens
              12.500 € eingezahlt sein (§ 7 Abs. 2 GmbHG).
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={stammkapital}
              onChange={(e) => setStammkapital(Math.max(25000, Number(e.target.value) || 0))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="25000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(stammkapital, 100000)}
            onChange={(e) => setStammkapital(Number(e.target.value) || 25000)}
            className="w-full mt-3 accent-indigo-500"
            min="25000"
            max="100000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>25.000 €</span>
            <span>62.500 €</span>
            <span>100.000 €</span>
          </div>
        </div>

        {/* Gründungsart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gründungsart</span>
            <span className="text-xs text-gray-500 block mt-1">
              Das Musterprotokoll ist günstiger, aber nur bis 3 Gesellschafter und 1 Geschäftsführer
              ohne individuelle Regelungen möglich (§ 2 Abs. 1a GmbHG). Bei einer Sachgründung ist
              immer der individuelle Vertrag erforderlich.
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setArt('muster')}
              disabled={einlage === 'sach'}
              className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                effektiveArt === 'muster'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : einlage === 'sach'
                  ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              Musterprotokoll
              <span className={`block text-xs font-normal mt-1 ${effektiveArt === 'muster' ? 'text-indigo-100' : 'text-gray-400'}`}>
                max. 3 GS + 1 GF · 1,0-Gebühr
              </span>
            </button>
            <button
              type="button"
              onClick={() => setArt('individuell')}
              className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                effektiveArt === 'individuell'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              Individueller Vertrag
              <span className={`block text-xs font-normal mt-1 ${effektiveArt === 'individuell' ? 'text-indigo-100' : 'text-gray-400'}`}>
                Mindestwert 30.000 € · 2,0-Gebühr
              </span>
            </button>
          </div>
        </div>

        {/* Einlageart */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Art der Einlage</span>
            <span className="text-xs text-gray-500 block mt-1">
              Bei der Bargründung wird das Stammkapital in Geld erbracht. Bei einer Sachgründung
              (z. B. Maschinen, Fahrzeuge) ist ein Sachgründungsbericht nötig und die
              Handelsregistergebühr höher.
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEinlage('bar')}
              className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                einlage === 'bar'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              Bargründung
              <span className={`block text-xs font-normal mt-1 ${einlage === 'bar' ? 'text-indigo-100' : 'text-gray-400'}`}>
                Handelsregister 225 €
              </span>
            </button>
            <button
              type="button"
              onClick={() => setEinlage('sach')}
              className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                einlage === 'sach'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              Sachgründung
              <span className={`block text-xs font-normal mt-1 ${einlage === 'sach' ? 'text-indigo-100' : 'text-gray-400'}`}>
                Handelsregister 360 €
              </span>
            </button>
          </div>
          {einlage === 'sach' && (
            <p className="text-xs text-amber-700 mt-2">
              ⚠️ Bei der Sachgründung ist das Musterprotokoll ausgeschlossen – es gilt automatisch der
              individuelle Gesellschaftsvertrag.
            </p>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏢 Gründungskosten Ihrer GmbH</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.gesamt)}</span>
            <span className="text-xl opacity-80">gesamt</span>
          </div>
          <p className="text-indigo-100 mt-2 text-sm">
            {effektiveArt === 'muster' ? 'Musterprotokoll' : 'Individueller Gesellschaftsvertrag'} ·{' '}
            {einlage === 'sach' ? 'Sachgründung' : 'Bargründung'} · Stammkapital{' '}
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
            <span className="text-xs opacity-70">HRegGebV Nr. {einlage === 'sach' ? '2101' : '2100'}</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">+ einzuzahlendes Stammkapital (kein „Kostenposten“)</span>
            <span className="text-lg font-bold">{formatEuroRound(ergebnis.mindesteinzahlung)}</span>
          </div>
          <p className="text-xs opacity-70 mt-1">
            {einlage === 'sach'
              ? 'Sacheinlagen müssen vollständig erbracht werden. Bleibt Vermögen der GmbH.'
              : 'Mindesteinzahlung bei der Anmeldung (§ 7 Abs. 2 GmbHG). Bleibt Vermögen der GmbH.'}
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
              {effektiveArt === 'muster'
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
              {effektiveArt === 'muster' ? ', min. 60 €' : ', min. 120 €'})
            </span>
            <span className="text-gray-900">{formatEuro(ergebnis.beurkundung)}</span>
          </div>
          {ergebnis.vollzug > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Vollzug der Gründung (0,5-Gebühr)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.vollzug)}</span>
            </div>
          )}
          {ergebnis.betreuung > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Betreuungstätigkeit (0,5-Gebühr)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.betreuung)}</span>
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
            <span className="text-gray-600">
              Ersteintragung {einlage === 'sach' ? 'mit Sacheinlage (HRegGebV Nr. 2101)' : 'Bargründung (HRegGebV Nr. 2100)'}
            </span>
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
          💡 Das <strong>Stammkapital ist kein Kostenposten</strong>: Es bleibt Vermögen der GmbH. Bei der
          Bargründung müssen vor der Anmeldung zum Handelsregister mindestens 12.500 € auf das
          Geschäftskonto eingezahlt werden (§ 7 Abs. 2 GmbHG). Hinzu kommen oft eine Gewerbeanmeldung
          (20–60 €) sowie laufende Kosten für Buchhaltung und Steuerberatung.
        </div>
      </div>

      {/* Kosten-Staffel */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📍 Gründungskosten je Stammkapital ({effektiveArt === 'muster' ? 'Musterprotokoll' : 'individueller Vertrag'})</h3>
        <p className="text-sm text-gray-500 mb-4">
          Notar (brutto) + Handelsregister ({einlage === 'sach' ? '360 €' : '225 €'}) bei{' '}
          {einlage === 'sach' ? 'Sachgründung' : 'Bargründung'}. Mit steigendem Stammkapital wächst der
          Geschäftswert und damit die Notargebühr.
        </p>
        <div className="space-y-2">
          {staffel.map((sk) => {
            const total = gesamtFuer(sk, art, einlage);
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

      {/* Wichtige GmbH-Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Das Wichtigste zur GmbH-Gründung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mindeststammkapital 25.000 €:</strong> Die GmbH muss ein Stammkapital von mindestens 25.000 € haben (§ 5 GmbHG). Das Kapital bleibt Vermögen der Gesellschaft – es ist kein „verbrauchter“ Kostenposten.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mindesteinzahlung 12.500 €:</strong> Bei der Bargründung muss vor der Anmeldung je Anteil mindestens ein Viertel und insgesamt mindestens die Hälfte des Mindeststammkapitals (12.500 €) eingezahlt sein (§ 7 Abs. 2 GmbHG).</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Musterprotokoll spart Notarkosten:</strong> Statt einer 2,0-Gebühr fällt nur eine 1,0-Gebühr an, zulässig bis 3 Gesellschafter und 1 Geschäftsführer ohne individuelle Regelungen (§ 2 Abs. 1a GmbHG).</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Sachgründung teurer:</strong> Bei Sacheinlagen ist ein Sachgründungsbericht nötig, das Musterprotokoll ist ausgeschlossen und die Handelsregistergebühr steigt von 225 € auf 360 € (HRegGebV Nr. 2101).</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Alternative UG:</strong> Wer mit weniger Kapital starten will, kann eine UG (haftungsbeschränkt) ab 1 € gründen (§ 5a GmbHG) und sie später in eine GmbH umwandeln.</span>
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
          Anzahl der Beteiligten, zusätzlichen Vollmachten, gesonderter Geschäftsführerbestellung oder
          Auslagen abweichen. Auslagen und XML-Strukturdaten sind hier pauschal angesetzt. Für eine
          verbindliche Kostennote wenden Sie sich an Ihren Notar.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/gmbhg/__5.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 5 GmbHG – Stammkapital (Mindeststammkapital 25.000 €)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gmbhg/__7.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 7 GmbHG – Anmeldung (Mindesteinzahlung 12.500 € bei Bargründung)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gmbhg/__2.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 2 GmbHG – Form des Gesellschaftsvertrags &amp; Musterprotokoll (max. 3 GS + 1 GF)
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
            HRegGebV – Handelsregistergebührenverordnung (Nr. 2100: 225 €, Nr. 2101: 360 €)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gmbhg/__5a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 5a GmbHG – Unternehmergesellschaft (UG als Alternative ab 1 €)
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Stand: 2026 (HRegGebV i. d. F. vom 30.04.2025) · Alle Angaben ohne Gewähr
        </p>
      </div>
    </div>
  );
}

export default GmbhGruendungskostenRechner;
