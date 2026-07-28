import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: Juli 2026) ===
// Rechtsgrundlage: §§ 56–68, 86 SGB III i.V.m. §§ 11–13, 21, 23, 25 BAföG

// Bedarf Lebensunterhalt bei Berufsausbildung außerhalb des Elternhaushalts
// Quelle: § 61 Abs. 1 SGB III i.V.m. § 13 Abs. 1 Nr. 1 BAföG – https://www.gesetze-im-internet.de/baf_g/__13.html
const GRUNDBEDARF_AUSBILDUNG = 442; // €/Monat
// Quelle: § 61 Abs. 1 SGB III i.V.m. § 13 Abs. 2 Nr. 2 BAföG – https://www.gesetze-im-internet.de/baf_g/__13.html
const UNTERKUNFTSBEDARF = 380; // €/Monat (nicht bei den Eltern wohnend)

// Wohnheim/Internat mit voller Verpflegung: vereinbarte Entgelte + Pauschale für sonstige Bedürfnisse
// Quelle: § 61 Abs. 2 / § 62 Abs. 3 SGB III – https://www.gesetze-im-internet.de/sgb_3/__61.html
const WOHNHEIM_PAUSCHALE = 115; // €/Monat

// Bedarf bei berufsvorbereitenden Bildungsmaßnahmen (BvB)
// Quelle: § 62 Abs. 1 SGB III i.V.m. § 12 Abs. 1 Nr. 1 BAföG – https://www.gesetze-im-internet.de/baf_g/__12.html
const BVB_BEDARF_ELTERN = 276; // €/Monat (im Elternhaushalt)
// Quelle: § 62 Abs. 2 SGB III i.V.m. § 12 Abs. 2 Nr. 1 BAföG – https://www.gesetze-im-internet.de/baf_g/__12.html
const BVB_BEDARF_AUSWAERTS = 666; // €/Monat (außerhalb des Elternhaushalts)

// Sonstige Aufwendungen
// Quelle: § 64 Abs. 1 SGB III (nur Berufsausbildung) – https://www.gesetze-im-internet.de/sgb_3/__64.html
const ARBEITSKLEIDUNG_PAUSCHALE = 16; // €/Monat
// Quelle: § 64 Abs. 3 SGB III – https://www.gesetze-im-internet.de/sgb_3/__64.html
const KINDERBETREUUNG_JE_KIND = 160; // €/Monat je aufsichtsbedürftigem Kind

// Deckel für Pendelfahrten: Betrag nach § 86 SGB III (420 € Unterbringung + 168 € Verpflegung)
// Quelle: § 63 Abs. 3 S. 3 i.V.m. § 86 SGB III – https://www.gesetze-im-internet.de/sgb_3/__86.html
const PENDELFAHRTEN_DECKEL = 588; // €/Monat

// Einkommensanrechnung Azubi
// Sozialpauschale für Auszubildende: 22,3 %, max. 17.200 €/Jahr
// Quelle: § 21 Abs. 2 S. 1 Nr. 1 BAföG (via § 67 Abs. 2 SGB III) – https://www.gesetze-im-internet.de/baf_g/__21.html
const SOZIALPAUSCHALE_AZUBI = 0.223;
const SOZIALPAUSCHALE_MAX_MONAT = 17200 / 12; // ≈ 1.433,33 €/Monat

// Freibetrag von der Ausbildungsvergütung
// Quelle: § 67 Abs. 2 Nr. 3 SGB III – https://www.gesetze-im-internet.de/sgb_3/__67.html
const FREIBETRAG_VERGUETUNG = 85; // €/Monat

// Freibetrag vom sonstigen Einkommen des Azubis (ab 01.01.2026: 389 €)
// Quelle: Bekanntmachung v. 18.11.2025, BGBl. 2025 I Nr. 279, i.V.m. § 23 Abs. 1 S. 1 Nr. 1 BAföG
// https://www.recht.bund.de/bgbl/1/2025/279/VO.html
const FREIBETRAG_SONSTIGES_EINKOMMEN = 389; // €/Monat

// Freibeträge für Ehegatte/Kinder des Azubis (mindern anrechenbares Azubi-Einkommen)
// Quelle: § 23 Abs. 1 S. 1 Nr. 2 und 3 BAföG (via § 67 Abs. 2 SGB III) – https://www.gesetze-im-internet.de/baf_g/__23.html
const FREIBETRAG_EHEGATTE_DES_AZUBI = 850; // €/Monat
const FREIBETRAG_KIND_DES_AZUBI = 770; // €/Monat je Kind

// Freibeträge vom Eltern-/Ehegatteneinkommen
// Quelle: § 25 Abs. 1 BAföG (via § 67 Abs. 2 SGB III) – https://www.gesetze-im-internet.de/baf_g/__25.html
const ELTERN_FREIBETRAG_VERHEIRATET = 2540; // €/Monat (verheiratete, zusammenlebende Eltern)
const ELTERN_FREIBETRAG_EINZELN = 1690; // €/Monat (Elternteil sonst / Ehegatte des Azubis)
// Zusatzfreibetrag der Eltern bei BAB (Ausbildungsstätte nicht in angemessener Zeit erreichbar)
// Quelle: § 67 Abs. 2 Nr. 3 SGB III – https://www.gesetze-im-internet.de/sgb_3/__67.html
const ELTERN_ZUSATZFREIBETRAG_BAB = 901; // €/Monat
// Erhöhung je weiteres unterhaltsberechtigtes Kind (nicht in förderfähiger Ausbildung)
// Quelle: § 25 Abs. 3 S. 1 Nr. 2 BAföG – https://www.gesetze-im-internet.de/baf_g/__25.html
const FREIBETRAG_WEITERES_KIND = 770; // €/Monat je Kind

// Vom übersteigenden Einkommen bleiben zusätzlich anrechnungsfrei: 50 % + 5 % je Kind
// Quelle: § 25 Abs. 4 BAföG – https://www.gesetze-im-internet.de/baf_g/__25.html
const UEBERSCHUSS_FREI_BASIS = 0.5;
const UEBERSCHUSS_FREI_JE_KIND = 0.05;

type Ausbildungsart = 'ausbildung' | 'bvb';
type Wohnsituation = 'wohnung' | 'wohnheim' | 'eltern';

export default function BerufsausbildungsbeihilfeRechner() {
  // Art der Maßnahme & Wohnsituation
  const [ausbildungsart, setAusbildungsart] = useState<Ausbildungsart>('ausbildung');
  const [wohnsituation, setWohnsituation] = useState<Wohnsituation>('wohnung');
  const [wohnheimEntgelt, setWohnheimEntgelt] = useState(400);

  // Einkommen Azubi
  const [verguetung, setVerguetung] = useState(900);
  const [sonstigesEinkommen, setSonstigesEinkommen] = useState(0);

  // Fahrkosten
  const [fahrkosten, setFahrkosten] = useState(80);
  const [heimfahrtKosten, setHeimfahrtKosten] = useState(0);

  // Familie des Azubis
  const [istVerheiratet, setIstVerheiratet] = useState(false);
  const [einkommenEhegatte, setEinkommenEhegatte] = useState(0);
  const [anzahlKinder, setAnzahlKinder] = useState(0);

  // Eltern
  const [elternVerheiratet, setElternVerheiratet] = useState(true);
  const [einkommenEltern, setEinkommenEltern] = useState(3200);
  const [weitereKinder, setWeitereKinder] = useState(0);
  const [geschwisterInFoerderung, setGeschwisterInFoerderung] = useState(0);

  const istBvB = ausbildungsart === 'bvb';

  const ergebnis = useMemo(() => {
    // === 1. Bedarf für den Lebensunterhalt (§§ 61, 62 SGB III) ===
    let lebensunterhalt: number;
    let lebensunterhaltLabel: string;
    if (wohnsituation === 'wohnheim') {
      lebensunterhalt = wohnheimEntgelt + WOHNHEIM_PAUSCHALE;
      lebensunterhaltLabel = `Wohnheim-Entgelt + ${WOHNHEIM_PAUSCHALE} € Pauschale`;
    } else if (istBvB) {
      if (wohnsituation === 'eltern') {
        lebensunterhalt = BVB_BEDARF_ELTERN;
        lebensunterhaltLabel = 'BvB-Bedarf im Elternhaushalt (§ 62 Abs. 1 SGB III)';
      } else {
        lebensunterhalt = BVB_BEDARF_AUSWAERTS;
        lebensunterhaltLabel = 'BvB-Bedarf außerhalb des Elternhaushalts (§ 62 Abs. 2 SGB III)';
      }
    } else {
      lebensunterhalt = GRUNDBEDARF_AUSBILDUNG + UNTERKUNFTSBEDARF;
      lebensunterhaltLabel = `Grundbedarf ${GRUNDBEDARF_AUSBILDUNG} € + Unterkunft ${UNTERKUNFTSBEDARF} €`;
    }

    // === 2. Fahrkosten (§ 63 SGB III) ===
    const pendelAngesetzt = Math.min(fahrkosten, PENDELFAHRTEN_DECKEL);
    const pendelGedeckelt = fahrkosten > PENDELFAHRTEN_DECKEL;
    const fahrkostenGesamt = pendelAngesetzt + heimfahrtKosten;

    // === 3. Sonstige Aufwendungen (§ 64 SGB III) ===
    const arbeitskleidung = istBvB ? 0 : ARBEITSKLEIDUNG_PAUSCHALE;
    const kinderbetreuung = anzahlKinder * KINDERBETREUUNG_JE_KIND;

    // === 4. Gesamtbedarf ===
    const gesamtbedarf = lebensunterhalt + fahrkostenGesamt + arbeitskleidung + kinderbetreuung;

    // === 5. Einkommensanrechnung (§ 67 SGB III) – entfällt bei BvB (§ 67 Abs. 4) ===
    // 5a. Ausbildungsvergütung des Azubis
    const sozialAbzug = Math.min(verguetung * SOZIALPAUSCHALE_AZUBI, SOZIALPAUSCHALE_MAX_MONAT);
    const anrechnungVerguetung = istBvB
      ? 0
      : Math.max(0, verguetung - sozialAbzug - FREIBETRAG_VERGUETUNG);

    // 5b. Sonstiges Einkommen des Azubis (Näherung: Netto-Eingabe, Freibeträge § 23 Abs. 1 BAföG)
    const freibetragSonstiges =
      FREIBETRAG_SONSTIGES_EINKOMMEN +
      (istVerheiratet ? FREIBETRAG_EHEGATTE_DES_AZUBI : 0) +
      anzahlKinder * FREIBETRAG_KIND_DES_AZUBI;
    const anrechnungSonstiges = istBvB
      ? 0
      : Math.max(0, sonstigesEinkommen - freibetragSonstiges);

    // 5c. Ehegatte/Lebenspartner des Azubis (§ 25 Abs. 1 Nr. 2, Abs. 3, Abs. 4 BAföG)
    const ehegatteFreibetrag =
      ELTERN_FREIBETRAG_EINZELN + anzahlKinder * FREIBETRAG_WEITERES_KIND;
    const ehegatteUeberschuss = Math.max(0, einkommenEhegatte - ehegatteFreibetrag);
    const ehegatteFreiQuote = Math.min(
      1,
      UEBERSCHUSS_FREI_BASIS + anzahlKinder * UEBERSCHUSS_FREI_JE_KIND
    );
    const anrechnungEhegatte =
      istBvB || !istVerheiratet ? 0 : ehegatteUeberschuss * (1 - ehegatteFreiQuote);

    // 5d. Eltern (§ 25 BAföG + 901 € Zusatzfreibetrag nach § 67 Abs. 2 Nr. 3 SGB III)
    const elternFreibetrag =
      (elternVerheiratet ? ELTERN_FREIBETRAG_VERHEIRATET : ELTERN_FREIBETRAG_EINZELN) +
      ELTERN_ZUSATZFREIBETRAG_BAB +
      weitereKinder * FREIBETRAG_WEITERES_KIND;
    const elternUeberschuss = Math.max(0, einkommenEltern - elternFreibetrag);
    const elternFreiQuote = Math.min(
      1,
      UEBERSCHUSS_FREI_BASIS + weitereKinder * UEBERSCHUSS_FREI_JE_KIND
    );
    const anrechnungElternGesamt = elternUeberschuss * (1 - elternFreiQuote);
    // Aufteilung auf mehrere geförderte Kinder zu gleichen Teilen (§ 11 Abs. 4 BAföG)
    const anrechnungEltern = istBvB
      ? 0
      : anrechnungElternGesamt / (1 + geschwisterInFoerderung);

    const gesamtAnrechnung =
      anrechnungVerguetung + anrechnungSonstiges + anrechnungEhegatte + anrechnungEltern;

    // === 6. BAB = Gesamtbedarf − anzurechnendes Einkommen (min. 0) ===
    const bab = Math.max(0, gesamtbedarf - gesamtAnrechnung);

    return {
      lebensunterhalt,
      lebensunterhaltLabel,
      pendelAngesetzt,
      pendelGedeckelt,
      fahrkostenGesamt,
      arbeitskleidung,
      kinderbetreuung,
      gesamtbedarf,
      sozialAbzug,
      anrechnungVerguetung,
      freibetragSonstiges,
      anrechnungSonstiges,
      ehegatteFreibetrag,
      anrechnungEhegatte,
      elternFreibetrag,
      elternUeberschuss,
      elternFreiQuote,
      anrechnungElternGesamt,
      anrechnungEltern,
      gesamtAnrechnung,
      bab,
    };
  }, [
    ausbildungsart,
    wohnsituation,
    wohnheimEntgelt,
    verguetung,
    sonstigesEinkommen,
    fahrkosten,
    heimfahrtKosten,
    istVerheiratet,
    einkommenEhegatte,
    anzahlKinder,
    elternVerheiratet,
    einkommenEltern,
    weitereKinder,
    geschwisterInFoerderung,
    istBvB,
  ]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Ausbildungsart */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Art der Maßnahme</span>
            <span className="text-xs text-gray-500 block mt-1">
              Betriebliche/außerbetriebliche Ausbildung oder berufsvorbereitende Bildungsmaßnahme (BvB)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setAusbildungsart('ausbildung');
                if (wohnsituation === 'eltern') setWohnsituation('wohnung');
              }}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !istBvB ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Berufsausbildung
            </button>
            <button
              onClick={() => setAusbildungsart('bvb')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                istBvB ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              BvB-Maßnahme
            </button>
          </div>
          {istBvB && (
            <p className="text-xs text-cyan-700 mt-2 bg-cyan-50 rounded-lg p-2">
              ✓ Bei BvB wird <strong>kein Einkommen angerechnet</strong> (§ 67 Abs. 4 SGB III) –
              der BAB-Betrag entspricht dem Gesamtbedarf.
            </p>
          )}
        </div>

        {/* Wohnsituation */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Wohnsituation</span>
            <span className="text-xs text-gray-500 block mt-1">
              {istBvB
                ? 'Bei BvB gibt es BAB auch im Elternhaushalt'
                : 'BAB bei Berufsausbildung gibt es nur außerhalb des Elternhaushalts (§ 60 SGB III)'}
            </span>
          </label>
          <div className={`grid ${istBvB ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
            {istBvB && (
              <button
                onClick={() => setWohnsituation('eltern')}
                className={`py-3 px-2 rounded-xl font-medium text-sm transition-all ${
                  wohnsituation === 'eltern'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Bei den Eltern
              </button>
            )}
            <button
              onClick={() => setWohnsituation('wohnung')}
              className={`py-3 px-2 rounded-xl font-medium text-sm transition-all ${
                wohnsituation === 'wohnung'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Eigene Wohnung
            </button>
            <button
              onClick={() => setWohnsituation('wohnheim')}
              className={`py-3 px-2 rounded-xl font-medium text-sm transition-all ${
                wohnsituation === 'wohnheim'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Wohnheim/Internat
            </button>
          </div>
          {wohnsituation === 'wohnheim' && (
            <div className="mt-3 p-4 bg-cyan-50 rounded-xl">
              <label className="block mb-2">
                <span className="text-sm text-cyan-700 font-medium">
                  Vereinbartes Entgelt für Unterbringung + Verpflegung
                </span>
                <span className="text-xs text-cyan-600 block">
                  Dazu kommen {WOHNHEIM_PAUSCHALE} € Pauschale für sonstige Bedürfnisse (§ 61 Abs. 2 SGB III)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={wohnheimEntgelt}
                  onChange={(e) => setWohnheimEntgelt(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none bg-white"
                  min="0"
                  max="2000"
                  step="10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
              </div>
            </div>
          )}
        </div>

        {/* Ausbildungsvergütung – nur bei Berufsausbildung */}
        {!istBvB && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Ausbildungsvergütung (brutto)</span>
              <span className="text-xs text-gray-500 block mt-1">
                Wird nach Abzug der Sozialpauschale (22,3 %) und 85 € Freibetrag angerechnet
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={verguetung}
                onChange={(e) => setVerguetung(Math.max(0, Number(e.target.value)))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none"
                min="0"
                max="2500"
                step="10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
            </div>
            <input
              type="range"
              value={verguetung}
              onChange={(e) => setVerguetung(Number(e.target.value))}
              className="w-full mt-3 accent-cyan-500"
              min="0"
              max="1800"
              step="10"
            />
          </div>
        )}

        {/* Fahrkosten */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrkosten für Pendelfahrten</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wohnung ↔ Ausbildungsstätte/Berufsschule, ÖPNV günstigste Klasse (§ 63 SGB III), max. {PENDELFAHRTEN_DECKEL} €
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={fahrkosten}
              onChange={(e) => setFahrkosten(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none"
              min="0"
              max="800"
              step="5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          {ergebnis.pendelGedeckelt && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Pendelfahrten werden nur bis {PENDELFAHRTEN_DECKEL} €/Monat berücksichtigt (§ 63 Abs. 3 i.V.m. § 86 SGB III)
            </p>
          )}
        </div>

        {/* Familienheimfahrt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Familienheimfahrt (optional)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Bei auswärtiger Unterbringung: eine Heimfahrt pro Monat (§ 63 Abs. 1 Nr. 2 SGB III)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={heimfahrtKosten}
              onChange={(e) => setHeimfahrtKosten(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none"
              min="0"
              max="500"
              step="5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>

        {/* Eigene Kinder */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Eigene Kinder (mit Betreuungsbedarf)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Je Kind {KINDERBETREUUNG_JE_KIND} € Kinderbetreuungspauschale (§ 64 Abs. 3 SGB III)
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAnzahlKinder(Math.max(0, anzahlKinder - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{anzahlKinder}</span>
              <span className="text-gray-500 ml-1">{anzahlKinder === 1 ? 'Kind' : 'Kinder'}</span>
            </div>
            <button
              onClick={() => setAnzahlKinder(Math.min(6, anzahlKinder + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {!istBvB && (
          <>
            <hr className="my-6 border-gray-200" />
            <h3 className="font-bold text-gray-800 mb-4">💰 Weiteres Einkommen (Anrechnung § 67 SGB III)</h3>

            {/* Sonstiges Einkommen Azubi */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Sonstiges eigenes Einkommen (netto)</span>
                <span className="text-xs text-gray-500 block mt-1">
                  z. B. Nebenjob oder Waisenrente – Freibetrag {FREIBETRAG_SONSTIGES_EINKOMMEN} €/Monat (ab 01.01.2026)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={sonstigesEinkommen}
                  onChange={(e) => setSonstigesEinkommen(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none"
                  min="0"
                  max="3000"
                  step="10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
              </div>
            </div>

            {/* Verheiratet */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={istVerheiratet}
                  onChange={(e) => setIstVerheiratet(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">Verheiratet / eingetragene Lebenspartnerschaft</span>
                  <span className="text-xs text-gray-500 block">
                    Dann wird das Einkommen des Ehegatten vor dem der Eltern angerechnet (§ 67 Abs. 1 SGB III)
                  </span>
                </div>
              </label>
              {istVerheiratet && (
                <div className="mt-3 p-4 bg-cyan-50 rounded-xl">
                  <label className="block mb-2">
                    <span className="text-sm text-cyan-700 font-medium">Einkommen des Ehegatten (BAföG-Begriff)</span>
                    <span className="text-xs text-cyan-600 block">
                      Freibetrag {formatEuroRound(ergebnis.ehegatteFreibetrag)}/Monat (§ 25 Abs. 1 Nr. 2 BAföG)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={einkommenEhegatte}
                      onChange={(e) => setEinkommenEhegatte(Math.max(0, Number(e.target.value)))}
                      className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none bg-white"
                      min="0"
                      max="10000"
                      step="50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
                  </div>
                </div>
              )}
            </div>

            <hr className="my-6 border-gray-200" />
            <h3 className="font-bold text-gray-800 mb-4">👨‍👩‍👧 Einkommen der Eltern</h3>

            {/* Eltern verheiratet */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setElternVerheiratet(true)}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                    elternVerheiratet
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Eltern verheiratet, zusammenlebend
                </button>
                <button
                  onClick={() => setElternVerheiratet(false)}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                    !elternVerheiratet
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Ein Elternteil / getrennt
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Freibetrag: {elternVerheiratet ? '2.540 €' : '1.690 €'} (§ 25 Abs. 1 BAföG)
                + 901 € BAB-Zusatzfreibetrag (§ 67 Abs. 2 Nr. 3 SGB III)
              </p>
            </div>

            {/* Einkommen Eltern */}
            <div className="mb-4">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Monatliches Einkommen der Eltern</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Nach BAföG-Einkommensbegriff (§ 21 BAföG): positive Einkünfte minus Steuern und Sozialpauschale,
                  i. d. R. aus dem vorletzten Kalenderjahr
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={einkommenEltern}
                  onChange={(e) => setEinkommenEltern(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none"
                  min="0"
                  max="15000"
                  step="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
              </div>
              <input
                type="range"
                value={einkommenEltern}
                onChange={(e) => setEinkommenEltern(Number(e.target.value))}
                className="w-full mt-2 accent-cyan-500"
                min="0"
                max="8000"
                step="100"
              />
            </div>

            {/* Weitere Kinder der Eltern */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium text-sm">Weitere unterhaltsberechtigte Kinder</span>
                <span className="text-xs text-gray-500 block">
                  Nicht in förderfähiger Ausbildung: +770 € Freibetrag je Kind (§ 25 Abs. 3 BAföG)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeitereKinder(Math.max(0, weitereKinder - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  −
                </button>
                <span className="text-xl font-bold text-gray-800 w-8 text-center">{weitereKinder}</span>
                <button
                  onClick={() => setWeitereKinder(Math.min(8, weitereKinder + 1))}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Geschwister in Förderung */}
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium text-sm">Geschwister in geförderter Ausbildung</span>
                <span className="text-xs text-gray-500 block">
                  BAföG/BAB-gefördert: Elterneinkommen wird zu gleichen Teilen aufgeteilt (§ 11 Abs. 4 BAföG)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGeschwisterInFoerderung(Math.max(0, geschwisterInFoerderung - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  −
                </button>
                <span className="text-xl font-bold text-gray-800 w-8 text-center">{geschwisterInFoerderung}</span>
                <button
                  onClick={() => setGeschwisterInFoerderung(Math.min(6, geschwisterInFoerderung + 1))}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🎓 Ihre Berufsausbildungsbeihilfe (Schätzung)</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.bab)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          <p className="text-cyan-100 mt-2 text-sm">
            {istBvB
              ? 'BvB-Maßnahme: keine Einkommensanrechnung – BAB = Gesamtbedarf'
              : ergebnis.bab > 0
                ? 'Gesamtbedarf minus anzurechnendes Einkommen (§§ 56, 67 SGB III)'
                : 'Das anzurechnende Einkommen übersteigt den Gesamtbedarf – voraussichtlich kein BAB-Anspruch'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamtbedarf</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.gesamtbedarf)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">
              {ergebnis.gesamtAnrechnung > 0 ? 'Anzurechnendes Einkommen' : 'Keine Anrechnung'}
            </span>
            <div className="text-xl font-bold">
              {ergebnis.gesamtAnrechnung > 0 ? '−' + formatEuroRound(ergebnis.gesamtAnrechnung) : '✓'}
            </div>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Gesamtbedarf (§§ 61–64 SGB III)
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Lebensunterhalt ({ergebnis.lebensunterhaltLabel})</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.lebensunterhalt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Fahrkosten (Pendelfahrten{ergebnis.pendelGedeckelt ? `, gedeckelt auf ${PENDELFAHRTEN_DECKEL} €` : ''}
              {heimfahrtKosten > 0 ? ' + Familienheimfahrt' : ''})
            </span>
            <span className="text-gray-900">{formatEuro(ergebnis.fahrkostenGesamt)}</span>
          </div>
          {!istBvB && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Arbeitskleidungspauschale (§ 64 Abs. 1 SGB III)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.arbeitskleidung)}</span>
            </div>
          )}
          {anzahlKinder > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                Kinderbetreuung ({anzahlKinder} × {KINDERBETREUUNG_JE_KIND} €, § 64 Abs. 3 SGB III)
              </span>
              <span className="text-gray-900">{formatEuro(ergebnis.kinderbetreuung)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 bg-cyan-50 -mx-6 px-6">
            <span className="font-medium text-cyan-700">= Gesamtbedarf</span>
            <span className="font-bold text-cyan-900">{formatEuro(ergebnis.gesamtbedarf)}</span>
          </div>

          {!istBvB && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                Einkommensanrechnung (§ 67 SGB III)
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Ausbildungsvergütung brutto</span>
                <span className="text-gray-900">{formatEuro(verguetung)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">− Sozialpauschale 22,3 % (§ 21 Abs. 2 BAföG)</span>
                <span className="text-green-600">−{formatEuro(ergebnis.sozialAbzug)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">− Freibetrag Vergütung (§ 67 Abs. 2 Nr. 3 SGB III)</span>
                <span className="text-green-600">−{formatEuro(FREIBETRAG_VERGUETUNG)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">= Anrechnung aus Vergütung</span>
                <span className="font-bold text-gray-900">{formatEuro(ergebnis.anrechnungVerguetung)}</span>
              </div>

              {sonstigesEinkommen > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">
                    Sonstiges Einkommen (Freibetrag {formatEuroRound(ergebnis.freibetragSonstiges)})
                  </span>
                  <span className="text-gray-900">{formatEuro(ergebnis.anrechnungSonstiges)}</span>
                </div>
              )}
              {istVerheiratet && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">
                    Anrechnung Ehegatte (Freibetrag {formatEuroRound(ergebnis.ehegatteFreibetrag)})
                  </span>
                  <span className="text-gray-900">{formatEuro(ergebnis.anrechnungEhegatte)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Anrechnung Eltern (Freibetrag {formatEuroRound(ergebnis.elternFreibetrag)}
                  {geschwisterInFoerderung > 0 ? `, geteilt durch ${1 + geschwisterInFoerderung}` : ''})
                </span>
                <span className="text-gray-900">{formatEuro(ergebnis.anrechnungEltern)}</span>
              </div>
              <div className="flex justify-between py-2 bg-red-50 -mx-6 px-6">
                <span className="font-medium text-red-700">= Anzurechnendes Einkommen gesamt</span>
                <span className="font-bold text-red-900">−{formatEuro(ergebnis.gesamtAnrechnung)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between py-3 bg-cyan-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-cyan-800">Berufsausbildungsbeihilfe / Monat</span>
            <span className="font-bold text-2xl text-cyan-900">{formatEuro(ergebnis.bab)}</span>
          </div>
        </div>
      </div>

      {/* Info: So funktioniert BAB */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So wird die BAB berechnet</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Bedarf Lebensunterhalt:</strong> {GRUNDBEDARF_AUSBILDUNG} € Grundbedarf +{' '}
              {UNTERKUNFTSBEDARF} € Unterkunft = 822 €/Monat bei eigener Wohnung (§ 61 SGB III i.V.m. § 13 BAföG)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>+ Fahrkosten:</strong> Pendelfahrten (max. {PENDELFAHRTEN_DECKEL} €) und eine
              Familienheimfahrt pro Monat (§ 63 SGB III)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>+ Pauschalen:</strong> {ARBEITSKLEIDUNG_PAUSCHALE} € Arbeitskleidung,{' '}
              {KINDERBETREUUNG_JE_KIND} € je Kind für Betreuung (§ 64 SGB III)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>− Einkommen:</strong> Ausbildungsvergütung (nach 22,3 % Sozialpauschale und 85 € Freibetrag),
              dann Ehegatten- und Elterneinkommen über den Freibeträgen (§ 67 SGB III)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Bei BvB:</strong> keine Einkommensanrechnung (§ 67 Abs. 4 SGB III)
            </span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise / Näherungen */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise & Vereinfachungen</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Schätzung, keine Rechtsberatung:</strong> Verbindlich rechnet nur die Agentur für Arbeit
              (amtlicher BAB-Rechner: babrechner.arbeitsagentur.de). Dieser Rechner ist ein unabhängiges Angebot.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Elterneinkommen (Näherung):</strong> Maßgeblich ist das Einkommen nach BAföG-Begriff,
              i. d. R. aus dem vorletzten Kalenderjahr (§ 24 BAföG entsprechend) – geben Sie hier das bereits um
              Steuern/Sozialpauschale bereinigte Monatseinkommen ein.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Waisenrente:</strong> Von Waisenrenten bleiben nach § 23 Abs. 4 Nr. 1 BAföG 190 €/Monat
              anrechnungsfrei – dieser Rechner nutzt vereinfachend den allgemeinen Freibetrag von 389 €.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Kindergeld:</strong> Die Behandlung des Kindergelds und die amtliche Rundung des
              Auszahlbetrags sind nicht mit Primärquelle belegt und hier nicht abgebildet.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Ausbildung im Elternbetrieb:</strong> Dann ist mindestens die tarifliche bzw. ortsübliche
              Bruttovergütung anzusetzen (§ 67 Abs. 3 SGB III).
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Vorausleistung:</strong> Zahlen die Eltern den angerechneten Unterhalt nicht, kann BAB
              vorausgeleistet werden (§ 68 SGB III).
            </span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-cyan-50 rounded-xl p-4">
            <p className="font-semibold text-cyan-900">Agentur für Arbeit</p>
            <p className="text-sm text-cyan-700 mt-1">
              Die Berufsausbildungsbeihilfe wird bei der örtlichen Agentur für Arbeit beantragt –
              am besten schon vor Beginn der Ausbildung, denn rückwirkend wird höchstens ab dem
              Monat der Antragstellung gezahlt.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">🌐</span>
            <div>
              <p className="font-medium text-gray-800">Offizielle Informationen & amtlicher Rechner</p>
              <a
                href="https://www.arbeitsagentur.de/bildung/ausbildung/berufsausbildungsbeihilfe-bab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                arbeitsagentur.de – Berufsausbildungsbeihilfe (BAB) →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-xs text-gray-500">
        <strong>Hinweis:</strong> Dieser BAB-Rechner liefert eine unverbindliche Schätzung auf Basis der
        gesetzlichen Bedarfssätze und Freibeträge (Stand: Juli 2026) und ersetzt keine Rechtsberatung.
        Die tatsächliche Höhe der Berufsausbildungsbeihilfe hängt von der individuellen Einkommensermittlung
        (§ 24 BAföG entsprechend), den Fachlichen Weisungen der Bundesagentur für Arbeit und Ihrem konkreten
        Einzelfall ab. Verbindliche Auskünfte erteilt nur die Agentur für Arbeit.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_3/__56.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 56 SGB III – Berufsausbildungsbeihilfe (Anspruch)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_3/__61.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 61 SGB III – Bedarf für den Lebensunterhalt bei Berufsausbildung
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_3/__62.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 62 SGB III – Bedarf bei berufsvorbereitenden Bildungsmaßnahmen
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_3/__63.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 63 SGB III – Fahrkosten
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_3/__64.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 64 SGB III – Sonstige Aufwendungen
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_3/__67.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 67 SGB III – Einkommensanrechnung
          </a>
          <a
            href="https://www.gesetze-im-internet.de/baf_g/__13.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 13 BAföG – Bedarfssätze (442 € + 380 €)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/baf_g/__25.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 25 BAföG – Freibeträge vom Einkommen der Eltern und des Ehegatten
          </a>
          <a
            href="https://www.recht.bund.de/bgbl/1/2025/279/VO.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BGBl. 2025 I Nr. 279 – Freibetrag 389 € ab 01.01.2026
          </a>
          <a
            href="https://www.arbeitsagentur.de/bildung/ausbildung/berufsausbildungsbeihilfe-bab"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesagentur für Arbeit – Berufsausbildungsbeihilfe (BAB)
          </a>
        </div>
      </div>
    </div>
  );
}
