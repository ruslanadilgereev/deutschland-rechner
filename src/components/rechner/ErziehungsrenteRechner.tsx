import { useState, useMemo } from 'react';

// === VERIFIZIERTE WERTE (Stand: Juli 2026) ===

// Aktueller Rentenwert ab 01.07.2026: 42,52 € pro Entgeltpunkt
// Quelle: § 1 RWBestV 2026 – https://www.gesetze-im-internet.de/rwbestv_2026/__1.html
const RENTENWERT_2026 = 42.52;

// Rentenartfaktor Erziehungsrente = 1,0 (wie Altersrente)
// Quelle: § 67 Nr. 4 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__67.html
const RENTENARTFAKTOR_ERZIEHUNGSRENTE = 1.0;

// Einkommensanrechnung: Freibetrag = 26,4 × aktueller Rentenwert,
// Erhöhung um 5,6 × Rentenwert je waisenrentenberechtigtem Kind,
// Anrechnung von 40 % des übersteigenden Einkommens
// Quelle: § 97 Abs. 2 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__97.html
const FREIBETRAG_FAKTOR = 26.4;
const FREIBETRAG_KIND_FAKTOR = 5.6;
const ANRECHNUNGSSATZ = 0.40;

// Abgeleitete Freibeträge (26,4 × 42,52 = 1.122,53 € / 5,6 × 42,52 = 238,11 €)
const FREIBETRAG_BASIS = RENTENWERT_2026 * FREIBETRAG_FAKTOR; // 1.122,53 €
const FREIBETRAG_PRO_KIND = RENTENWERT_2026 * FREIBETRAG_KIND_FAKTOR; // 238,11 €

// === NÄHERUNGEN (nicht per Primärquelle verifiziert) ===
// Pauschale Netto-Ermittlung des anzurechnenden Einkommens nach § 18a/§ 18b SGB IV:
// üblich sind pauschal 40 % Abzug vom Brutto-Arbeitsentgelt bzw. 14 % von einer
// eigenen Rente (Bezug ab 2011). Diese Pauschalsätze sind hier NICHT per
// Primärquelle verifiziert – sie werden als Näherung analog zum
// Witwenrente-Rechner verwendet.
const PAUSCHALABZUG_ARBEITSEINKOMMEN = 0.40; // Näherung (§ 18b SGB IV)
const PAUSCHALABZUG_RENTE = 0.14; // Näherung (§ 18b SGB IV, Rentenbezug ab 2011)

export default function ErziehungsrenteRechner() {
  // Eingaben: eigene Rentenanwartschaft
  const [entgeltpunkte, setEntgeltpunkte] = useState(30);
  const [zugangsfaktor, setZugangsfaktor] = useState(1.0);

  // Eigenes Einkommen (für Einkommensanrechnung nach § 97 SGB VI)
  const [arbeitseinkommen, setArbeitseinkommen] = useState(0);
  const [eigeneRente, setEigeneRente] = useState(0);

  // Waisenrentenberechtigte Kinder (erhöhen den Freibetrag)
  const [anzahlKinder, setAnzahlKinder] = useState(1);

  // Anspruchsvoraussetzungen nach § 47 Abs. 1 SGB VI
  const [scheidungNach1977, setScheidungNach1977] = useState(true);
  const [exVerstorben, setExVerstorben] = useState(true);
  const [kindInErziehung, setKindInErziehung] = useState(true);
  const [nichtWiederGeheiratet, setNichtWiederGeheiratet] = useState(true);
  const [wartezeitErfuellt, setWartezeitErfuellt] = useState(true);
  const [unterRegelaltersgrenze, setUnterRegelaltersgrenze] = useState(true);

  const ergebnis = useMemo(() => {
    // === 1. Anspruchsprüfung (§ 47 Abs. 1 SGB VI) ===
    const anspruch =
      scheidungNach1977 &&
      exVerstorben &&
      kindInErziehung &&
      nichtWiederGeheiratet &&
      wartezeitErfuellt &&
      unterRegelaltersgrenze;

    // === 2. Brutto-Erziehungsrente (§ 64 SGB VI) ===
    // Monatsbetrag = persönliche Entgeltpunkte × Zugangsfaktor × Rentenartfaktor × aktueller Rentenwert
    const bruttoRente =
      entgeltpunkte * zugangsfaktor * RENTENARTFAKTOR_ERZIEHUNGSRENTE * RENTENWERT_2026;

    // === 3. Einkommensanrechnung (§ 97 SGB VI) ===
    // 3a. Freibetrag: 26,4 × Rentenwert + 5,6 × Rentenwert je waisenrentenberechtigtem Kind
    const freibetrag = FREIBETRAG_BASIS + anzahlKinder * FREIBETRAG_PRO_KIND;

    // 3b. Anrechenbares Netto (pauschale Näherung nach § 18b SGB IV, s. o.)
    const nettoArbeitseinkommen = arbeitseinkommen * (1 - PAUSCHALABZUG_ARBEITSEINKOMMEN);
    const nettoEigeneRente = eigeneRente * (1 - PAUSCHALABZUG_RENTE);
    const anrechenbaresNetto = nettoArbeitseinkommen + nettoEigeneRente;

    // 3c. Anrechnung: 40 % des den Freibetrag übersteigenden Einkommens
    const uebersteigenderBetrag = Math.max(0, anrechenbaresNetto - freibetrag);
    const anrechnungsbetrag = uebersteigenderBetrag * ANRECHNUNGSSATZ;

    // === 4. Zahlbetrag ===
    const zahlbetrag = Math.max(0, bruttoRente - anrechnungsbetrag);

    return {
      anspruch,
      bruttoRente,
      freibetrag,
      nettoArbeitseinkommen,
      nettoEigeneRente,
      anrechenbaresNetto,
      uebersteigenderBetrag,
      anrechnungsbetrag,
      zahlbetrag,
    };
  }, [
    entgeltpunkte, zugangsfaktor, arbeitseinkommen, eigeneRente, anzahlKinder,
    scheidungNach1977, exVerstorben, kindInErziehung, nichtWiederGeheiratet,
    wartezeitErfuellt, unterRegelaltersgrenze,
  ]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  const voraussetzungen = [
    {
      erfuellt: scheidungNach1977,
      setter: setScheidungNach1977,
      titel: 'Ehe nach dem 30.06.1977 geschieden',
      detail: '§ 47 Abs. 1 Nr. 1 SGB VI – Scheidung nach dem Stichtag 30. Juni 1977',
    },
    {
      erfuellt: exVerstorben,
      setter: setExVerstorben,
      titel: 'Geschiedener Ehegatte ist verstorben',
      detail: '§ 47 Abs. 1 Nr. 1 SGB VI',
    },
    {
      erfuellt: kindInErziehung,
      setter: setKindInErziehung,
      titel: 'Erziehung eines Kindes unter 18',
      detail: 'Eigenes Kind oder Kind des Geschiedenen; ohne Altersgrenze bei Behinderung (§ 47 Abs. 1 Nr. 2 i.V.m. § 46 Abs. 2 SGB VI)',
    },
    {
      erfuellt: nichtWiederGeheiratet,
      setter: setNichtWiederGeheiratet,
      titel: 'Nicht wieder geheiratet',
      detail: '§ 47 Abs. 1 Nr. 3 SGB VI',
    },
    {
      erfuellt: wartezeitErfuellt,
      setter: setWartezeitErfuellt,
      titel: 'Allgemeine Wartezeit (5 Jahre) erfüllt',
      detail: 'Eigene Wartezeit bis zum Tod des Geschiedenen erfüllt (§ 47 Abs. 1 Nr. 4 i.V.m. § 50 Abs. 1 SGB VI)',
    },
    {
      erfuellt: unterRegelaltersgrenze,
      setter: setUnterRegelaltersgrenze,
      titel: 'Regelaltersgrenze noch nicht erreicht',
      detail: 'Anspruch besteht nur bis zur Regelaltersgrenze (§ 47 Abs. 1 SGB VI)',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Entgeltpunkte */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ihre persönlichen Entgeltpunkte</span>
            <span className="text-xs text-gray-500 block mt-1">
              Die Erziehungsrente wird aus Ihrer EIGENEN Versicherung berechnet – nicht aus der des Verstorbenen. Die Punkte stehen in Ihrer Renteninformation.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={entgeltpunkte}
              onChange={(e) => setEntgeltpunkte(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="100"
              step="0.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">Punkte</span>
          </div>
          <input
            type="range"
            value={entgeltpunkte}
            onChange={(e) => setEntgeltpunkte(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="0"
            max="80"
            step="0.5"
          />
        </div>

        {/* Zugangsfaktor */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Zugangsfaktor</span>
            <span className="text-xs text-gray-500 block mt-1">
              Ohne Abschläge: 1,0. Mögliche Abschläge nach § 77 SGB VI sind hier nicht im Detail abgebildet (Näherung – bei Bedarf manuell eintragen, z.&nbsp;B. 0,892).
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={zugangsfaktor}
              onChange={(e) => setZugangsfaktor(Math.min(1, Math.max(0.7, Number(e.target.value))))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0.7"
              max="1"
              step="0.001"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Eigenes Einkommen */}
        <h3 className="font-bold text-gray-800 mb-1">💰 Ihr eigenes Einkommen</h3>
        <p className="text-xs text-gray-500 mb-4">
          Wird nach § 97 SGB VI auf die Erziehungsrente angerechnet, soweit es den Freibetrag übersteigt.
        </p>

        {/* Arbeitseinkommen */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Arbeitseinkommen (brutto)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={arbeitseinkommen}
              onChange={(e) => setArbeitseinkommen(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="10000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          <input
            type="range"
            value={arbeitseinkommen}
            onChange={(e) => setArbeitseinkommen(Number(e.target.value))}
            className="w-full mt-2 accent-purple-500"
            min="0"
            max="6000"
            step="50"
          />
        </div>

        {/* Eigene Rente */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Eigene weitere Rente (brutto)</span>
            <span className="text-xs text-gray-500 block mt-1">
              z.&nbsp;B. Erwerbsminderungsrente – falls vorhanden
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={eigeneRente}
              onChange={(e) => setEigeneRente(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="4000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Waisenrentenberechtigte Kinder</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jedes Kind mit Anspruch auf Waisenrente erhöht den Freibetrag um {formatEuro(FREIBETRAG_PRO_KIND)}
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
              onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Voraussetzungen */}
        <h3 className="font-bold text-gray-800 mb-1">✅ Anspruchsvoraussetzungen (§ 47 SGB VI)</h3>
        <p className="text-xs text-gray-500 mb-4">
          Alle Voraussetzungen müssen gleichzeitig erfüllt sein.
        </p>
        <div className="space-y-3">
          {voraussetzungen.map((v) => (
            <label key={v.titel} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={v.erfuellt}
                onChange={(e) => v.setter(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <div>
                <span className="text-gray-700 font-medium">{v.titel}</span>
                <span className="text-xs text-gray-500 block">{v.detail}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">👩‍👧 Ihre Erziehungsrente</h3>

        {ergebnis.anspruch ? (
          <>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatEuroRound(ergebnis.zahlbetrag)}</span>
                <span className="text-xl opacity-80">/ Monat</span>
              </div>
              <p className="text-purple-100 mt-2 text-sm">
                Zahlbetrag vor Kranken-/Pflegeversicherung und Steuern
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Brutto-Erziehungsrente</span>
                <div className="text-xl font-bold">{formatEuroRound(ergebnis.bruttoRente)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">
                  {ergebnis.anrechnungsbetrag > 0 ? 'Einkommensanrechnung' : 'Keine Anrechnung'}
                </span>
                <div className="text-xl font-bold">
                  {ergebnis.anrechnungsbetrag > 0
                    ? '−' + formatEuroRound(ergebnis.anrechnungsbetrag)
                    : '✓'}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mb-2">
            <div className="text-3xl font-bold mb-2">Kein Anspruch</div>
            <p className="text-purple-100 text-sm">
              Nach Ihren Angaben sind nicht alle Voraussetzungen des § 47 Abs. 1 SGB VI erfüllt.
              Prüfen Sie die Checkliste oben – alle sechs Punkte müssen zutreffen.
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Rentenformel (§ 64 SGB VI)
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Persönliche Entgeltpunkte</span>
            <span className="font-bold text-gray-900">{entgeltpunkte.toLocaleString('de-DE')}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">× Zugangsfaktor</span>
            <span className="font-bold text-gray-900">{zugangsfaktor.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">× Rentenartfaktor Erziehungsrente (§ 67 Nr. 4 SGB VI)</span>
            <span className="font-bold text-gray-900">1,0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">× Aktueller Rentenwert (ab 01.07.2026)</span>
            <span className="font-bold text-gray-900">{formatEuro(RENTENWERT_2026)}</span>
          </div>
          <div className="flex justify-between py-2 bg-purple-50 -mx-6 px-6">
            <span className="font-medium text-purple-700">= Brutto-Erziehungsrente</span>
            <span className="font-bold text-purple-900">{formatEuro(ergebnis.bruttoRente)}</span>
          </div>

          {(arbeitseinkommen > 0 || eigeneRente > 0) && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                Einkommensanrechnung (§ 97 SGB VI)
              </div>

              {arbeitseinkommen > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Arbeitseinkommen (nach pauschal 40 % Abzug, Näherung)</span>
                  <span className="text-gray-900">{formatEuro(ergebnis.nettoArbeitseinkommen)}</span>
                </div>
              )}
              {eigeneRente > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Eigene Rente (nach pauschal 14 % Abzug, Näherung)</span>
                  <span className="text-gray-900">{formatEuro(ergebnis.nettoEigeneRente)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">= Anrechenbares Netto</span>
                <span className="font-bold text-gray-900">{formatEuro(ergebnis.anrechenbaresNetto)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Freibetrag (26,4 × {formatEuro(RENTENWERT_2026)}
                  {anzahlKinder > 0 && ` + ${anzahlKinder} × ${formatEuro(FREIBETRAG_PRO_KIND)}`})
                </span>
                <span className="text-green-600 font-bold">−{formatEuro(ergebnis.freibetrag)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">= Übersteigender Betrag</span>
                <span className={ergebnis.uebersteigenderBetrag > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                  {formatEuro(ergebnis.uebersteigenderBetrag)}
                </span>
              </div>
              {ergebnis.uebersteigenderBetrag > 0 && (
                <div className="flex justify-between py-2 bg-red-50 -mx-6 px-6">
                  <span className="font-medium text-red-700">Anrechnung (40 %)</span>
                  <span className="font-bold text-red-900">−{formatEuro(ergebnis.anrechnungsbetrag)}</span>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between py-3 bg-purple-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-purple-800">Zahlbetrag Erziehungsrente</span>
            <span className="font-bold text-2xl text-purple-900">
              {ergebnis.anspruch ? formatEuro(ergebnis.zahlbetrag) : '0,00 €'}
            </span>
          </div>
        </div>
      </div>

      {/* Info: Einkommensanrechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Einkommensanrechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Freibetrag:</strong> 26,4 × aktueller Rentenwert = {formatEuro(FREIBETRAG_BASIS)} (ab Juli 2026, § 97 Abs. 2 SGB VI)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>+ Kinderzuschlag:</strong> {formatEuro(FREIBETRAG_PRO_KIND)} je waisenrentenberechtigtem Kind (5,6 × Rentenwert)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Netto-Ermittlung:</strong> Vom Brutto werden pauschal 40 % (Arbeit) bzw. 14 % (Rente) abgezogen – Pauschalsätze nach § 18a/§ 18b SGB IV, hier als Näherung</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Anrechnung:</strong> 40 % des Betrags über dem Freibetrag kürzen die Erziehungsrente</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Eigene Versicherung:</strong> Die Erziehungsrente wird aus Ihren eigenen Entgeltpunkten berechnet – nicht aus der Rente des verstorbenen Ex-Partners</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Befristung:</strong> Der Anspruch endet spätestens mit Erreichen der Regelaltersgrenze – und wenn kein Kind unter 18 mehr erzogen wird (Ausnahme: Kind mit Behinderung)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Wiederheirat:</strong> Bei erneuter Heirat entfällt der Anspruch (§ 47 Abs. 1 Nr. 3 SGB VI)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Zurechnungszeit:</strong> Bei der echten Rentenberechnung können Zurechnungszeiten (§ 59 SGB VI) die Entgeltpunkte erhöhen – hier nicht abgebildet</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Netto:</strong> Vom Zahlbetrag gehen noch Kranken- und Pflegeversicherungsbeiträge sowie ggf. Steuern ab – hier nicht berechnet</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Deutsche Rentenversicherung</p>
            <p className="text-sm text-purple-700 mt-1">
              Die Erziehungsrente wird bei der Deutschen Rentenversicherung beantragt.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Hotline</p>
                <p className="text-gray-600">0800 1000 4800 (kostenlos)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Antrag</p>
                <a
                  href="https://www.deutsche-rentenversicherung.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  deutsche-rentenversicherung.de →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
        <p className="text-xs text-gray-500">
          <strong>Hinweis:</strong> Dieser Rechner liefert eine unverbindliche Schätzung und ersetzt
          keine Renten-, Steuer- oder Rechtsberatung. Die pauschale Netto-Ermittlung des
          anzurechnenden Einkommens und der Zugangsfaktor sind Näherungen; Zurechnungszeiten
          (§ 59 SGB VI), KV-/PV-Beiträge und Steuern sind nicht berücksichtigt. Verbindliche
          Auskünfte erteilt nur die Deutsche Rentenversicherung.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__47.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 47 SGB VI – Erziehungsrente (Anspruchsvoraussetzungen)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__64.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 64 SGB VI – Rentenformel
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__67.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 67 SGB VI – Rentenartfaktor (Nr. 4: Erziehungsrente 1,0)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__97.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 97 SGB VI – Einkommensanrechnung
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__46.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 46 SGB VI – Kindererziehung (Verweis aus § 47)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__50.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 50 SGB VI – Allgemeine Wartezeit (5 Jahre)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/rwbestv_2026/__1.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 1 RWBestV 2026 – Aktueller Rentenwert 42,52 € (ab 01.07.2026)
          </a>
        </div>
      </div>
    </div>
  );
}
