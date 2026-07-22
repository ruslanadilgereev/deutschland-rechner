import { useState, useMemo } from 'react';

// === OFFIZIELLE WERTE 2026 (Stand: ab 01.01.2026) ===
// Elternunterhalt nach § 1601, § 1603 BGB i.V.m. § 94 Abs. 1a SGB XII,
// konkretisiert durch Düsseldorfer Tabelle 2026 (Anm. D.I) und
// Unterhaltsrechtliche Leitlinien NRW 2026 (OLG Düsseldorf).

// 100.000-EUR-Jahreseinkommensgrenze (Angehörigen-Entlastungsgesetz)
// Rückgriff des Sozialhilfeträgers auf das Kind erst ab jährl. Gesamteinkommen > 100.000 €.
// Quelle: § 94 Abs. 1a SGB XII — https://www.gesetze-im-internet.de/sgb_12/__94.html
// (Gesamteinkommen i.S.d. § 16 SGB IV — https://www.gesetze-im-internet.de/sgb_4/__16.html;
//  steuerliches Gesamtbruttoeinkommen, Leitlinien NRW 2026 Nr. 19)
const JAHRESEINKOMMENSGRENZE = 100000; // EUR brutto/Jahr

// Angemessener Selbstbehalt gegenüber Eltern: mindestens 2.650 €/Monat (inkl. 1.000 € Warmmiete).
// Quelle: Düsseldorfer Tabelle 2026, Anm. D.I —
//   https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/DT_2026.pdf
// (identisch Leitlinien NRW 2026 Nr. 21.3.3)
const SELBSTBEHALT_MIN = 2650; // EUR/Monat

// Von dem über 2.650 € hinausgehenden bereinigten Einkommen bleiben zusätzlich 70 % anrechnungsfrei
// → nur 30 % des übersteigenden Einkommens sind einsetzbar.
// Quelle: Leitlinien NRW 2026 Nr. 21.3.3 —
//   https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/Leitlinien-NRW-2026.pdf
const FREIBETRAG_UEBERSCHUSS = 0.70; // 70 % anrechnungsfrei
const EINSATZQUOTE = 1 - FREIBETRAG_UEBERSCHUSS; // 30 % einsetzbar

// Angemessener Mindestbedarf des mit dem Kind zusammenlebenden Ehegatten: 2.120 €/Monat (inkl. 800 € Warmmiete).
// Quelle: Düsseldorfer Tabelle 2026, Anm. D.I (identisch Leitlinien NRW 2026 Nr. 22.3)
const EHEGATTEN_MINDESTBEDARF = 2120; // EUR/Monat

// Familienmindestbedarf = 2.650 € + 2.120 € = 4.770 €/Monat (inkl. 1.800 € Unterkunft/Heizung).
// Quelle: Leitlinien NRW 2026 Nr. 22.3 —
//   https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/Leitlinien-NRW-2026.pdf
const FAMILIENMINDESTBEDARF = SELBSTBEHALT_MIN + EHEGATTEN_MINDESTBEDARF; // 4.770 €

// Sekundäre (zusätzliche private) Altersvorsorge: bei Elternunterhalt bis 5 % des Bruttoeinkommens abziehbar.
// Quelle: Leitlinien NRW 2026 Nr. 10.1.2 Abs. 3 —
//   https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/Leitlinien-NRW-2026.pdf
const ALTERSVORSORGE_MAX_QUOTE = 0.05; // 5 % des Bruttoeinkommens

export default function ElternunterhaltRechner() {
  // Gate-Eingabe
  const [bruttoJahr, setBruttoJahr] = useState(120000);

  // Einkommen & bereinigende Abzüge des Kindes (monatlich)
  const [nettoMonat, setNettoMonat] = useState(3500);
  const [berufsAufwand, setBerufsAufwand] = useState(0);
  const [altersvorsorge, setAltersvorsorge] = useState(0);
  const [schulden, setSchulden] = useState(0);

  // Verheiratetes Kind (Näherung)
  const [verheiratet, setVerheiratet] = useState(false);
  const [ehegattenNetto, setEhegattenNetto] = useState(0);

  // Bedarf des Elternteils
  const [bedarf, setBedarf] = useState(800);

  const ergebnis = useMemo(() => {
    // === SCHRITT 0: Gate (§ 94 Abs. 1a SGB XII) ===
    const rueckgriffMoeglich = bruttoJahr > JAHRESEINKOMMENSGRENZE;

    // Sekundäre Altersvorsorge nur bis 5 % des Bruttoeinkommens abziehbar (Leitlinien NRW 2026 Nr. 10.1.2)
    const bruttoMonat = bruttoJahr / 12;
    const altersvorsorgeMax = bruttoMonat * ALTERSVORSORGE_MAX_QUOTE;
    const altersvorsorgeAbzug = Math.min(altersvorsorge, altersvorsorgeMax);
    const altersvorsorgeGekappt = altersvorsorge > altersvorsorgeMax;

    // === SCHRITT 1: Bereinigtes Nettoeinkommen des Kindes (Leitlinien NRW 2026 Nr. 10) ===
    const bereinigt = Math.max(
      0,
      nettoMonat - berufsAufwand - altersvorsorgeAbzug - schulden,
    );

    // === SCHRITT 2/3: Anrechnungsfreier Betrag / Selbstbehalt ===
    // Alleinstehend: Selbstbehalt 2.650 € + 70 % des übersteigenden Einkommens.
    // Verheiratet (Näherung): Familienmindestbedarf 4.770 € auf das gemeinsame bereinigte Einkommen,
    //   ebenfalls + 70 % des übersteigenden Betrags anrechnungsfrei.
    const massgebendesEinkommen = verheiratet ? bereinigt + ehegattenNetto : bereinigt;
    const selbstbehalt = verheiratet ? FAMILIENMINDESTBEDARF : SELBSTBEHALT_MIN;

    const ueberSelbstbehalt = Math.max(0, massgebendesEinkommen - selbstbehalt);
    const anrechnungsfreierUeberschuss = ueberSelbstbehalt * FREIBETRAG_UEBERSCHUSS; // 70 %
    const anrechnungsfreiGesamt = selbstbehalt + anrechnungsfreierUeberschuss;

    // === Einsetzbares Einkommen = 30 % des über dem Selbstbehalt liegenden Einkommens ===
    const einsetzbaresEinkommen = ueberSelbstbehalt * EINSATZQUOTE;

    // === SCHRITT 4: Elternunterhalt = min(einsetzbares Einkommen; ungedeckter Bedarf) ===
    const elternunterhalt = rueckgriffMoeglich
      ? Math.min(einsetzbaresEinkommen, bedarf)
      : 0;

    // begrenzender Faktor für die Anzeige
    const begrenztDurchBedarf =
      rueckgriffMoeglich && bedarf < einsetzbaresEinkommen;

    return {
      rueckgriffMoeglich,
      bruttoMonat,
      altersvorsorgeMax,
      altersvorsorgeAbzug,
      altersvorsorgeGekappt,
      bereinigt,
      massgebendesEinkommen,
      selbstbehalt,
      ueberSelbstbehalt,
      anrechnungsfreierUeberschuss,
      anrechnungsfreiGesamt,
      einsetzbaresEinkommen,
      elternunterhalt,
      begrenztDurchBedarf,
    };
  }, [bruttoJahr, nettoMonat, berufsAufwand, altersvorsorge, schulden, verheiratet, ehegattenNetto, bedarf]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingabe-Bereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Gate: Bruttojahreseinkommen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ihr Bruttojahreseinkommen</span>
            <span className="text-xs text-gray-500 block mt-1">
              Steuerliches Gesamtbruttoeinkommen (§ 16 SGB IV). Erst über 100.000 € kann der
              Sozialhilfeträger auf Sie zurückgreifen.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttoJahr}
              onChange={(e) => setBruttoJahr(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="500000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Jahr</span>
          </div>
          <input
            type="range"
            value={bruttoJahr}
            onChange={(e) => setBruttoJahr(Number(e.target.value))}
            className="w-full mt-3 accent-rose-500"
            min="20000"
            max="250000"
            step="1000"
          />
          <div className={`mt-3 p-3 rounded-xl text-sm font-medium ${
            ergebnis.rueckgriffMoeglich ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'
          }`}>
            {ergebnis.rueckgriffMoeglich ? (
              <>⚠️ Über 100.000 € – ein Rückgriff auf Sie ist grundsätzlich möglich. Weiter unten wird der Betrag berechnet.</>
            ) : (
              <>✅ Bis 100.000 € – <strong>kein Elternunterhalt</strong>. Der Unterhaltsanspruch geht nicht auf den Sozialhilfeträger über (§ 94 Abs. 1a SGB XII).</>
            )}
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Bereinigtes Einkommen */}
        <h3 className="font-bold text-gray-800 mb-4">💶 Ihr bereinigtes Einkommen (monatlich)</h3>

        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliches Nettoeinkommen</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={nettoMonat}
              onChange={(e) => setNettoMonat(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="20000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          <input
            type="range"
            value={nettoMonat}
            onChange={(e) => setNettoMonat(Number(e.target.value))}
            className="w-full mt-2 accent-rose-500"
            min="0"
            max="10000"
            step="50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Berufsbedingte Aufwendungen</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={berufsAufwand}
                onChange={(e) => setBerufsAufwand(Math.max(0, Number(e.target.value)))}
                className="w-full text-lg font-bold text-center py-3 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Zusätzliche Altersvorsorge</span>
              <span className="text-xs text-gray-500 block">max. 5 % vom Brutto</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={altersvorsorge}
                onChange={(e) => setAltersvorsorge(Math.max(0, Number(e.target.value)))}
                className="w-full text-lg font-bold text-center py-3 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium text-sm">Berücksichtigungsfähige Schulden / Verbindlichkeiten</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={schulden}
              onChange={(e) => setSchulden(Math.max(0, Number(e.target.value)))}
              className="w-full text-lg font-bold text-center py-3 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/Monat</span>
          </div>
        </div>

        {ergebnis.altersvorsorgeGekappt && (
          <p className="text-xs text-amber-600 mt-2">
            ⚠️ Zusätzliche Altersvorsorge nur bis {formatEuro(ergebnis.altersvorsorgeMax)} (5 % vom Brutto) abziehbar – der Rest wird nicht berücksichtigt.
          </p>
        )}

        <hr className="my-6 border-gray-200" />

        {/* Verheiratet */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={verheiratet}
              onChange={(e) => setVerheiratet(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Ich bin verheiratet (zusammenlebend)</span>
              <span className="text-xs text-gray-500 block">
                Näherung: Familienmindestbedarf 4.770 € statt 2.650 € Selbstbehalt
              </span>
            </div>
          </label>
          {verheiratet && (
            <div className="mt-3 p-4 bg-rose-50 rounded-xl">
              <label className="block mb-2">
                <span className="text-sm text-rose-700 font-medium">Nettoeinkommen des Ehegatten</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={ehegattenNetto}
                  onChange={(e) => setEhegattenNetto(Math.max(0, Number(e.target.value)))}
                  className="w-full text-lg font-bold text-center py-3 px-3 border-2 border-rose-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none bg-white"
                  min="0"
                  step="50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/Monat</span>
              </div>
              <p className="text-xs text-rose-600 mt-2">
                Hinweis: Die Behandlung des Ehegatteneinkommens ist einzelfallabhängig (Halbteilungsgrundsatz).
                Diese Berechnung ist eine <strong>Näherung</strong> und ersetzt keine Einzelfallprüfung.
              </p>
            </div>
          )}
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Bedarf des Elternteils */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ungedeckter Bedarf des Elternteils</span>
            <span className="text-xs text-gray-500 block mt-1">
              z. B. Heim-/Pflegekosten nach Abzug von Rente, Pflegeversicherung, eigenem Vermögen und
              vorrangiger Grundsicherung. Konkret darzulegen.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bedarf}
              onChange={(e) => setBedarf(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="10000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          <input
            type="range"
            value={bedarf}
            onChange={(e) => setBedarf(Number(e.target.value))}
            className="w-full mt-2 accent-rose-500"
            min="0"
            max="4000"
            step="50"
          />
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">👵 Voraussichtlicher Elternunterhalt</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.elternunterhalt)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          <p className="text-rose-100 mt-2 text-sm">
            {!ergebnis.rueckgriffMoeglich ? (
              <>Bruttojahreseinkommen bis 100.000 € – <strong>keine Zahlungspflicht</strong> (§ 94 Abs. 1a SGB XII).</>
            ) : ergebnis.elternunterhalt <= 0 ? (
              <>Ihr bereinigtes Einkommen liegt innerhalb des Selbstbehalts – kein einsetzbares Einkommen.</>
            ) : ergebnis.begrenztDurchBedarf ? (
              <>Begrenzt durch den konkreten Bedarf des Elternteils ({formatEuroRound(bedarf)}).</>
            ) : (
              <>Entspricht 30 % Ihres Einkommens über dem Selbstbehalt von {formatEuroRound(ergebnis.selbstbehalt)}.</>
            )}
          </p>
        </div>

        {ergebnis.rueckgriffMoeglich && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Einsetzbares Einkommen</span>
              <div className="text-xl font-bold">{formatEuroRound(ergebnis.einsetzbaresEinkommen)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Anrechnungsfrei</span>
              <div className="text-xl font-bold">{formatEuroRound(ergebnis.anrechnungsfreiGesamt)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      {ergebnis.rueckgriffMoeglich && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
          <div className="space-y-3 text-sm">
            <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
              Bereinigtes Einkommen (Leitlinien NRW 2026 Nr. 10)
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Nettoeinkommen</span>
              <span className="font-bold text-gray-900">{formatEuro(nettoMonat)}</span>
            </div>
            {berufsAufwand > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
                <span>− Berufsbedingte Aufwendungen</span>
                <span>{formatEuro(berufsAufwand)}</span>
              </div>
            )}
            {ergebnis.altersvorsorgeAbzug > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
                <span>− Zusätzliche Altersvorsorge (max. 5 % Brutto)</span>
                <span>{formatEuro(ergebnis.altersvorsorgeAbzug)}</span>
              </div>
            )}
            {schulden > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
                <span>− Schulden / Verbindlichkeiten</span>
                <span>{formatEuro(schulden)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 bg-rose-50 -mx-6 px-6">
              <span className="font-medium text-rose-700">= Bereinigtes Einkommen</span>
              <span className="font-bold text-rose-900">{formatEuro(ergebnis.bereinigt)}</span>
            </div>

            {verheiratet && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">+ Ehegatteneinkommen (Näherung)</span>
                <span className="text-gray-900">{formatEuro(ehegattenNetto)}</span>
              </div>
            )}

            <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
              Selbstbehalt & Freibetrag (DT 2026 Anm. D.I / Leitlinien Nr. 21.3.3)
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                {verheiratet ? 'Familienmindestbedarf' : 'Selbstbehalt'}
              </span>
              <span className="text-green-600 font-bold">{formatEuro(ergebnis.selbstbehalt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Einkommen über Selbstbehalt</span>
              <span className="text-gray-900">{formatEuro(ergebnis.ueberSelbstbehalt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Davon 70 % zusätzlich anrechnungsfrei</span>
              <span className="text-green-600 font-bold">{formatEuro(ergebnis.anrechnungsfreierUeberschuss)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">= Einsetzbares Einkommen (30 %)</span>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.einsetzbaresEinkommen)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Ungedeckter Bedarf des Elternteils</span>
              <span className="text-gray-900">{formatEuro(bedarf)}</span>
            </div>
            <div className="flex justify-between py-3 bg-rose-100 -mx-6 px-6 rounded-b-xl mt-4">
              <span className="font-bold text-rose-800">Elternunterhalt (min. aus beiden)</span>
              <span className="font-bold text-2xl text-rose-900">{formatEuro(ergebnis.elternunterhalt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* So funktioniert es */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So wird der Elternunterhalt ermittelt</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>1.</span>
            <span><strong>100.000-€-Gate:</strong> Nur bei Bruttojahreseinkommen über 100.000 € greift der Sozialhilfeträger überhaupt zu (§ 94 Abs. 1a SGB XII).</span>
          </li>
          <li className="flex gap-2">
            <span>2.</span>
            <span><strong>Bereinigtes Einkommen:</strong> Vom Netto werden u. a. berufsbedingte Aufwendungen, Schulden und zusätzliche Altersvorsorge (bis 5 % Brutto) abgezogen.</span>
          </li>
          <li className="flex gap-2">
            <span>3.</span>
            <span><strong>Selbstbehalt:</strong> {formatEuroRound(SELBSTBEHALT_MIN)} bleiben in jedem Fall frei; von allem darüber zusätzlich 70 %.</span>
          </li>
          <li className="flex gap-2">
            <span>4.</span>
            <span><strong>Einsetzbar:</strong> Nur 30 % des über {formatEuroRound(SELBSTBEHALT_MIN)} liegenden bereinigten Einkommens – gedeckelt durch den konkreten Bedarf des Elternteils.</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-2">⚠️ Wichtiger Hinweis</h3>
        <p className="text-sm text-amber-700">
          Diese Berechnung ist eine <strong>Schätzung – keine Rechts- oder Steuerberatung</strong>. Der
          Katalog der abziehbaren Positionen, die Behandlung von Ehegatteneinkommen und der Einsatz von
          Vermögen (Schonvermögen) sind einzelfallabhängig und werden hier vereinfacht bzw. als Näherung
          dargestellt. Vorrangig sind Leistungen der Grundsicherung (§§ 41–43 SGB XII). Verbindliche
          Auskünfte erteilen der Sozialhilfeträger sowie eine Rechtsberatung im Familienrecht.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen (amtlich)</h4>
        <div className="space-y-1">
          <a href="https://www.gesetze-im-internet.de/bgb/__1601.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 1601 BGB – Unterhaltsverpflichtete
          </a>
          <a href="https://www.gesetze-im-internet.de/bgb/__1603.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 1603 BGB – Leistungsfähigkeit / angemessener Selbstbehalt
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_12/__94.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 94 Abs. 1a SGB XII – 100.000-Euro-Jahreseinkommensgrenze
          </a>
          <a href="https://www.gesetze-im-internet.de/sgb_4/__16.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            § 16 SGB IV – Gesamteinkommen
          </a>
          <a href="https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/DT_2026.pdf" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Düsseldorfer Tabelle 2026, Anm. D.I (Selbstbehalt 2.650 € + 70 %)
          </a>
          <a href="https://www.olg-duesseldorf.nrw.de/infos/Duesseldorfer_Tabelle/Tabelle-2026/Leitlinien-NRW-2026.pdf" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
            Unterhaltsrechtliche Leitlinien NRW 2026 (Nr. 10, 19, 21.3.3, 22.3)
          </a>
        </div>
      </div>
    </div>
  );
}
