import { useState, useMemo } from 'react';
import RechnerFeedback from '../RechnerFeedback';

// === OFFIZIELLE WERTE (Stand: Kalenderjahr 2026) ===
// Rechtsgrundlage: § 45 SGB V (Kinderkrankengeld), § 47 SGB V, § 223 SGB V

// Höhe des Kinderkrankengeldes (Angestellte / Nettoarbeitsentgelt)
// § 45 Abs. 2 S. 3 SGB V – https://www.gesetze-im-internet.de/sgb_5/__45.html
const HOEHE_PROZENT_NETTO = 0.90;               // 90 % des ausgefallenen Nettoarbeitsentgelts
const HOEHE_PROZENT_NETTO_EINMALZAHLUNG = 1.00; // 100 %, wenn in den letzten 12 Monaten beitragspflichtige Einmalzahlung (§ 23a SGB IV) bezogen wurde

// Höhe bei Arbeitseinkommen (Selbstständige)
// § 45 Abs. 2 S. 4 SGB V – https://www.gesetze-im-internet.de/sgb_5/__45.html
const HOEHE_PROZENT_ARBEITSEINKOMMEN = 0.70;    // 70 % des regelmäßigen Arbeitseinkommens

// Deckelung: Höchstbetrag pro Kalendertag
// § 45 Abs. 2 S. 3 SGB V i.V.m. § 223 Abs. 3 SGB V
const DECKELUNG_PROZENT_BBG = 0.70;             // 70 % der Beitragsbemessungsgrenze – https://www.gesetze-im-internet.de/sgb_5/__45.html
const BBG_GKV_2026_JAEHRLICH = 69750;           // GKV-Beitragsbemessungsgrenze 2026 in Euro/Jahr – https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514
const BBG_KALENDERTAEGLICH_FAKTOR = 360;        // 1/360 der Jahres-BBG = kalendertäglich – § 223 Abs. 3 SGB V – https://www.gesetze-im-internet.de/sgb_5/__223.html
// = 0,70 × (69.750 € ÷ 360) = 135,625 €/Tag (2026), dargestellt als 135,63 €
const HOECHSTBETRAG_PRO_TAG = DECKELUNG_PROZENT_BBG * (BBG_GKV_2026_JAEHRLICH / BBG_KALENDERTAEGLICH_FAKTOR);

// Anspruchsdauer – Sonderregelung Kalenderjahr 2026 (§ 45 Abs. 2a SGB V)
// https://www.gesetze-im-internet.de/sgb_5/__45.html
const TAGE_2026 = {
  jeKind: 15,          // längstens 15 Arbeitstage je Kind
  jeKindAllein: 30,    // Alleinerziehende: 30 Arbeitstage je Kind
  maxGesamt: 35,       // Jahres-Gesamtmaximum 35 Arbeitstage
  maxGesamtAllein: 70, // Alleinerziehende: 70 Arbeitstage
};

// Anspruchsdauer – Regelfall ohne Sonderregel (ab 2027 wieder maßgeblich, § 45 Abs. 2 SGB V)
const TAGE_REGEL = {
  jeKind: 10,          // längstens 10 Arbeitstage je Kind
  jeKindAllein: 20,    // Alleinerziehende: 20 Arbeitstage je Kind
  maxGesamt: 25,       // Jahres-Gesamtmaximum 25 Arbeitstage
  maxGesamtAllein: 50, // Alleinerziehende: 50 Arbeitstage
};

// Altersgrenze Kind: 12. Lebensjahr noch nicht vollendet (bzw. ohne Grenze bei Behinderung + Hilfebedarf)
// § 45 Abs. 1 S. 1 SGB V – https://www.gesetze-im-internet.de/sgb_5/__45.html

type Erwerbsart = 'angestellt' | 'selbststaendig';

export default function KinderkrankengeldRechner() {
  // Eingabewerte
  const [erwerbsart, setErwerbsart] = useState<Erwerbsart>('angestellt');
  const [monatsentgelt, setMonatsentgelt] = useState(2500);      // Netto-Monatsentgelt (angestellt) bzw. mtl. Arbeitseinkommen (selbstständig)
  const [einmalzahlung, setEinmalzahlung] = useState(false);     // beitragspflichtige Einmalzahlung in den letzten 12 Monaten?
  const [alleinerziehend, setAlleinerziehend] = useState(false);
  const [anzahlKinder, setAnzahlKinder] = useState(1);           // Kinder unter 12 Jahren
  const [jahr2026, setJahr2026] = useState(true);                // 2026-Sonderregel (true) vs. Regelfall ab 2027 (false)
  const [geplanteTage, setGeplanteTage] = useState(5);           // geplante/beantragte Krankheitstage
  const [bereitsGenommen, setBereitsGenommen] = useState(0);     // im Kalenderjahr bereits genommene KKG-Tage

  const ergebnis = useMemo(() => {
    const tage = jahr2026 ? TAGE_2026 : TAGE_REGEL;

    // === 1. Tagessatz-Näherung des ausgefallenen Entgelts ===
    // Hinweis: § 45 SGB V verweist nur teilweise auf die Regelentgelt-Systematik des § 47 SGB V;
    // die exakte Divisor-/Zeitraum-Regel für den kalendertäglichen Netto-Satz ist gesetzlich nicht
    // eindeutig festgelegt. Wir nähern parallel zur BBG-Logik: Monatsentgelt × 12 ÷ 360 = /30.
    const tagesentgelt = monatsentgelt / 30;

    // === 2. Prozentsatz nach Erwerbsart ===
    let prozentsatz: number;
    if (erwerbsart === 'selbststaendig') {
      prozentsatz = HOEHE_PROZENT_ARBEITSEINKOMMEN;                 // 70 %
    } else {
      prozentsatz = einmalzahlung ? HOEHE_PROZENT_NETTO_EINMALZAHLUNG : HOEHE_PROZENT_NETTO; // 100 % oder 90 %
    }

    const kkgProTagUngedeckelt = tagesentgelt * prozentsatz;

    // === 3. Deckelung auf Höchstbetrag pro Tag ===
    const gedeckelt = kkgProTagUngedeckelt > HOECHSTBETRAG_PRO_TAG;
    const kkgProTag = Math.min(kkgProTagUngedeckelt, HOECHSTBETRAG_PRO_TAG);

    // === 4. Anspruchsdauer ===
    const anspruchJeKind = alleinerziehend ? tage.jeKindAllein : tage.jeKind;
    const jahresMaximum = alleinerziehend ? tage.maxGesamtAllein : tage.maxGesamt;
    // Summe der Einzelansprüche, gedeckelt am Jahres-Gesamtmaximum
    const gesamtanspruch = Math.min(anzahlKinder * anspruchJeKind, jahresMaximum);
    const verbleibendGesamt = Math.max(0, gesamtanspruch - bereitsGenommen);
    const anrechenbareTage = Math.min(geplanteTage, verbleibendGesamt);
    const tageUeberLimit = Math.max(0, geplanteTage - verbleibendGesamt);

    // === 5. Gesamtbetrag ===
    const gesamtbetrag = kkgProTag * anrechenbareTage;

    return {
      tagesentgelt,
      prozentsatz,
      kkgProTagUngedeckelt,
      kkgProTag,
      gedeckelt,
      anspruchJeKind,
      jahresMaximum,
      gesamtanspruch,
      verbleibendGesamt,
      anrechenbareTage,
      tageUeberLimit,
      gesamtbetrag,
      hoechstbetrag: HOECHSTBETRAG_PRO_TAG,
    };
  }, [erwerbsart, monatsentgelt, einmalzahlung, alleinerziehend, anzahlKinder, jahr2026, geplanteTage, bereitsGenommen]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Kinderkrankengeld-Rechner" rechnerSlug="kinderkrankengeld" />

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Erwerbsart */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Ihre Erwerbsart</span>
            <span className="text-xs text-gray-500 block mt-1">
              Angestellte: 90 % vom Netto · Selbstständige: 70 % vom Arbeitseinkommen (§ 45 Abs. 2 SGB V)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setErwerbsart('angestellt')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                erwerbsart === 'angestellt'
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Angestellt
            </button>
            <button
              onClick={() => setErwerbsart('selbststaendig')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                erwerbsart === 'selbststaendig'
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Selbstständig
            </button>
          </div>
        </div>

        {/* Monatsentgelt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">
              {erwerbsart === 'angestellt'
                ? 'Netto-Monatsentgelt (ausgefallen)'
                : 'Monatliches Arbeitseinkommen'}
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              {erwerbsart === 'angestellt'
                ? 'Das Netto aus beitragspflichtigem Arbeitsentgelt, das durch die Betreuung ausfällt'
                : 'Regelmäßiges Arbeitseinkommen, soweit es der Beitragsberechnung unterliegt'}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={monatsentgelt}
              onChange={(e) => setMonatsentgelt(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-0 outline-none"
              min="0"
              max="10000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
          </div>
          <input
            type="range"
            value={monatsentgelt}
            onChange={(e) => setMonatsentgelt(Number(e.target.value))}
            className="w-full mt-3 accent-sky-600"
            min="500"
            max="6000"
            step="50"
          />
        </div>

        {/* Einmalzahlung – nur Angestellte */}
        {erwerbsart === 'angestellt' && (
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={einmalzahlung}
                onChange={(e) => setEinmalzahlung(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="text-gray-700 font-medium">Einmalzahlung in den letzten 12 Monaten</span>
                <span className="text-xs text-gray-500 block">
                  Weihnachts-/Urlaubsgeld o.Ä. (beitragspflichtig, § 23a SGB IV) → 100 % statt 90 %
                </span>
              </div>
            </label>
          </div>
        )}

        {/* Alleinerziehend */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={alleinerziehend}
              onChange={(e) => setAlleinerziehend(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Alleinerziehend</span>
              <span className="text-xs text-gray-500 block">
                Verdoppelt die Anspruchstage je Kind und das Jahresmaximum
              </span>
            </div>
          </label>
        </div>

        {/* Anzahl Kinder */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Kinder unter 12 Jahren</span>
            <span className="text-xs text-gray-500 block mt-1">
              Anspruch besteht je Kind, das das 12. Lebensjahr noch nicht vollendet hat (§ 45 Abs. 1 SGB V)
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAnzahlKinder(Math.max(1, anzahlKinder - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{anzahlKinder}</span>
              <span className="text-gray-500 ml-1">{anzahlKinder === 1 ? 'Kind' : 'Kinder'}</span>
            </div>
            <button
              onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Berechnungsjahr */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Berechnungsjahr</span>
            <span className="text-xs text-gray-500 block mt-1">
              2026 gilt die befristete Aufstockung (15/30 · max. 35/70), ab 2027 die Regelwerte (10/20 · max. 25/50)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setJahr2026(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                jahr2026 ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              2026 (Sonderregel)
            </button>
            <button
              onClick={() => setJahr2026(false)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !jahr2026 ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ab 2027 (Regelfall)
            </button>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Geplante Tage */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Geplante Krankheitstage (insgesamt)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Arbeitstage, an denen Sie das kranke Kind betreuen (über alle Kinder)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={geplanteTage}
              onChange={(e) => setGeplanteTage(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-0 outline-none"
              min="0"
              max="70"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Arbeitstage</span>
          </div>
        </div>

        {/* Bereits genommene Tage */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bereits genommene KKG-Tage in {jahr2026 ? '2026' : 'diesem Jahr'}</span>
            <span className="text-xs text-gray-500 block mt-1">
              Kinderkrankengeld-Tage, die Sie in diesem Kalenderjahr schon in Anspruch genommen haben
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bereitsGenommen}
              onChange={(e) => setBereitsGenommen(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-0 outline-none"
              min="0"
              max="70"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">Arbeitstage</span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🤒 Ihr Kinderkrankengeld (Schätzung)</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.gesamtbetrag)}</span>
            <span className="text-xl opacity-80">für {ergebnis.anrechenbareTage} {ergebnis.anrechenbareTage === 1 ? 'Tag' : 'Tage'}</span>
          </div>
          <p className="text-sky-100 mt-2 text-sm">
            {formatEuro(ergebnis.kkgProTag)} pro Ausfalltag
            {ergebnis.gedeckelt && ' (auf den Höchstbetrag begrenzt)'}
            {' '}– vor Abzug der Arbeitnehmer-Beiträge zur Renten-, Arbeitslosen- und Pflegeversicherung
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Kinderkrankengeld pro Tag</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.kkgProTag)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Höchstbetrag pro Tag (2026)</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.hoechstbetrag)}</div>
          </div>
        </div>

        {ergebnis.tageUeberLimit > 0 && (
          <div className="mt-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm">
              ⚠️ {ergebnis.tageUeberLimit} der geplanten Tage liegen über Ihrem verbleibenden Anspruch
              ({ergebnis.verbleibendGesamt} {ergebnis.verbleibendGesamt === 1 ? 'Tag' : 'Tage'}) und
              werden nicht als Kinderkrankengeld gezahlt.
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              {erwerbsart === 'angestellt' ? 'Netto-Monatsentgelt' : 'Monatliches Arbeitseinkommen'}
            </span>
            <span className="font-bold text-gray-900">{formatEuro(monatsentgelt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Tagessatz (Näherung: ÷ 30)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.tagesentgelt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              × {Math.round(ergebnis.prozentsatz * 100)} %
              {erwerbsart === 'angestellt'
                ? (einmalzahlung ? ' (mit Einmalzahlung)' : ' vom Netto')
                : ' vom Arbeitseinkommen'}
            </span>
            <span className="text-gray-900">{formatEuro(ergebnis.kkgProTagUngedeckelt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Höchstbetrag pro Tag (70 % der kalendertägl. BBG)</span>
            <span className={ergebnis.gedeckelt ? 'text-red-600 font-bold' : 'text-gray-400'}>
              {ergebnis.gedeckelt ? '−' : ''}{formatEuro(ergebnis.hoechstbetrag)}
            </span>
          </div>
          <div className="flex justify-between py-2 bg-sky-50 -mx-6 px-6">
            <span className="font-medium text-sky-700">= Kinderkrankengeld pro Tag</span>
            <span className="font-bold text-sky-900">{formatEuro(ergebnis.kkgProTag)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Anspruchsdauer ({jahr2026 ? '2026' : 'Regelfall ab 2027'})
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Anspruch je Kind{alleinerziehend ? ' (alleinerziehend)' : ''}</span>
            <span className="text-gray-900">{ergebnis.anspruchJeKind} Arbeitstage</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gesamtanspruch ({anzahlKinder} × {ergebnis.anspruchJeKind}, max. {ergebnis.jahresMaximum})</span>
            <span className="text-gray-900">{ergebnis.gesamtanspruch} Arbeitstage</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">− bereits genommen</span>
            <span className="text-gray-900">{bereitsGenommen} Arbeitstage</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">= verbleibender Anspruch</span>
            <span className="font-bold text-gray-900">{ergebnis.verbleibendGesamt} Arbeitstage</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Anrechenbare Tage (min. aus geplant/verbleibend)</span>
            <span className="text-gray-900">{ergebnis.anrechenbareTage} Arbeitstage</span>
          </div>
          <div className="flex justify-between py-3 bg-sky-100 -mx-6 px-6 rounded-b-xl mt-2">
            <span className="font-bold text-sky-800">Gesamtbetrag</span>
            <span className="font-bold text-2xl text-sky-900">{formatEuro(ergebnis.gesamtbetrag)}</span>
          </div>
        </div>
      </div>

      {/* Tage-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📅 Anspruchstage {jahr2026 ? '2026' : 'ab 2027'}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Konstellation</th>
                <th className="px-3 py-2 text-right">Je Kind</th>
                <th className="px-3 py-2 text-right">Jahresmaximum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className={!alleinerziehend ? 'bg-sky-50 font-medium' : ''}>
                <td className="px-3 py-2">Elternteil (Paar)</td>
                <td className="px-3 py-2 text-right">{jahr2026 ? TAGE_2026.jeKind : TAGE_REGEL.jeKind} Tage</td>
                <td className="px-3 py-2 text-right">{jahr2026 ? TAGE_2026.maxGesamt : TAGE_REGEL.maxGesamt} Tage</td>
              </tr>
              <tr className={alleinerziehend ? 'bg-sky-50 font-medium' : ''}>
                <td className="px-3 py-2">Alleinerziehend</td>
                <td className="px-3 py-2 text-right">{jahr2026 ? TAGE_2026.jeKindAllein : TAGE_REGEL.jeKindAllein} Tage</td>
                <td className="px-3 py-2 text-right">{jahr2026 ? TAGE_2026.maxGesamtAllein : TAGE_REGEL.maxGesamtAllein} Tage</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Die Tage gelten je Elternteil und je Kalenderjahr. Bei mehreren Kindern summieren sich die
          Ansprüche, jedoch nur bis zum Jahres-Gesamtmaximum.
        </p>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kind mit Behinderung:</strong> Ist das Kind behindert und auf Hilfe angewiesen, gilt keine Altersgrenze von 12 Jahren (§ 45 Abs. 1 SGB V).</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Voraussetzungen:</strong> ärztliches Zeugnis über die Betreuungsbedürftigkeit, gesetzliche Krankenversicherung mit eigenem Krankengeldanspruch und keine andere im Haushalt lebende Person, die das Kind betreuen kann.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Beitragsabzug:</strong> Kinderkrankengeld ist beitragspflichtig zur Renten-, Arbeitslosen- und Pflegeversicherung. Der Arbeitnehmeranteil wird von der Kasse einbehalten – der ausgezahlte Betrag liegt daher etwas unter dem hier angezeigten Bruttowert.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Näherung Tagessatz:</strong> Die Umrechnung des Monatsentgelts auf den kalendertäglichen Netto-Satz ist gesetzlich nicht eindeutig festgelegt; dieser Rechner nähert mit ÷ 30. Verbindlich rechnet Ihre Krankenkasse.</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-xs text-gray-500">
        Dieser Rechner liefert eine unverbindliche <strong>Schätzung – keine Rechts- oder Steuerberatung</strong>.
        Maßgeblich für Anspruch und Höhe ist die Entscheidung Ihrer gesetzlichen Krankenkasse.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_5/__45.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 45 SGB V – Krankengeld bei Erkrankung des Kindes
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_5/__47.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 47 SGB V – Höhe und Berechnung des Krankengeldes
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_5/__223.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 223 SGB V – Beitragspflichtige Einnahmen (kalendertägliche BBG)
          </a>
          <a
            href="https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – Beitragsbemessungsgrenzen 2026
          </a>
        </div>
      </div>
    </div>
  );
}
