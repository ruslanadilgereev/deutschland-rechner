import { useState, useMemo } from 'react';

// === OFFIZIELLE WERTE 2026 ===
// Behindertenpauschbetrag nach § 33b Abs. 3 EStG (Beträge seit VZ 2021 unverändert fortgeltend).
// Gesamt-GdB-Bildung nach VersMedV, Anlage zu § 2 (Versorgungsmedizinische Grundsätze), Teil A Nr. 3.

// Behindertenpauschbetrag-Staffel nach GdB-Stufe (Mindest-GdB → EUR/Jahr)
// Quelle: § 33b Abs. 3 Satz 2 EStG — https://www.gesetze-im-internet.de/estg/__33b.html
const PAUSCHBETRAG_STAFFEL: { gdb: number; betrag: number }[] = [
  { gdb: 20, betrag: 384 },   // § 33b Abs. 3 Satz 2 EStG
  { gdb: 30, betrag: 620 },   // § 33b Abs. 3 Satz 2 EStG
  { gdb: 40, betrag: 860 },   // § 33b Abs. 3 Satz 2 EStG
  { gdb: 50, betrag: 1140 },  // § 33b Abs. 3 Satz 2 EStG
  { gdb: 60, betrag: 1440 },  // § 33b Abs. 3 Satz 2 EStG
  { gdb: 70, betrag: 1780 },  // § 33b Abs. 3 Satz 2 EStG
  { gdb: 80, betrag: 2120 },  // § 33b Abs. 3 Satz 2 EStG
  { gdb: 90, betrag: 2460 },  // § 33b Abs. 3 Satz 2 EStG
  { gdb: 100, betrag: 2840 }, // § 33b Abs. 3 Satz 2 EStG
];

// Erhöhter Pauschbetrag für Hilflose (Merkzeichen H), Blinde (Bl) und Taubblinde (TBl).
// In diesem Fall ist die Staffel nach Satz 2 NICHT zusätzlich anwendbar.
// Quelle: § 33b Abs. 3 Satz 3 EStG — https://www.gesetze-im-internet.de/estg/__33b.html
const PAUSCHBETRAG_HILFLOS_BLIND_TAUBBLIND = 7400;

// Auswählbare Einzel-GdB-Werte (in Zehnerschritten, wie amtlich vergeben)
const GDB_OPTIONEN = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function GradDerBehinderungRechner() {
  // Liste der Einzel-GdB-Werte (jeweils 10–100 in Zehnerschritten)
  const [einzelGdb, setEinzelGdb] = useState<number[]>([50, 30]);

  // Merkzeichen-Flags (§ 33b Abs. 3 Satz 3 EStG)
  const [merkzeichenH, setMerkzeichenH] = useState(false);   // H = hilflos
  const [merkzeichenBl, setMerkzeichenBl] = useState(false); // Bl = blind
  const [merkzeichenTBl, setMerkzeichenTBl] = useState(false); // TBl = taubblind

  const ergebnis = useMemo(() => {
    // Nur gesetzte Werte, absteigend sortiert
    const werte = [...einzelGdb].filter((v) => v > 0).sort((a, b) => b - a);

    // === STUFE A: Gesamt-GdB als NÄHERUNG (VersMedV Teil A Nr. 3) ===
    // WICHTIG: Addition und Mittelung sind ausdrücklich unzulässig (Nr. 3.2).
    // Der Gesamt-GdB ist eine ärztlich-gutachterliche Gesamtschau — ein Rechner
    // kann nur eine unverbindliche Orientierung/Spanne liefern.
    const hoechsterEinzelGdb = werte.length > 0 ? werte[0] : 0; // Ausgangswert (Nr. 3.2)

    // Untergrenze = höchster Einzel-GdB (weitere Störungen erhöhen NICHT zwingend).
    // Näherung (Punktwert): weitere Störungen mit GdB ≥ 30 verstärken i.d.R. wesentlich
    //   (Erhöhung um mind. 10, Nr. 3.2); GdB 10 erhöht i.d.R. nicht (Nr. 3.5);
    //   GdB 20 führt vielfach NICHT zu wesentlicher Zunahme (Nr. 3.5).
    // Obere Orientierung: auch jede weitere Störung mit GdB ≥ 20 könnte um 10 erhöhen.
    let naeherung = hoechsterEinzelGdb;
    let obereOrientierung = hoechsterEinzelGdb;
    for (let i = 1; i < werte.length; i++) {
      const v = werte[i];
      if (v >= 30) naeherung = Math.min(100, naeherung + 10);
      if (v >= 20) obereOrientierung = Math.min(100, obereOrientierung + 10);
    }
    // Gesamt-GdB wird stets in Zehnerschritten gebildet, Maximum 100.
    const gesamtGdbNaeherung = Math.min(100, Math.round(naeherung / 10) * 10);
    const gesamtGdbUnten = hoechsterEinzelGdb;
    const gesamtGdbOben = Math.min(100, Math.round(obereOrientierung / 10) * 10);
    const istSpanne = gesamtGdbOben > gesamtGdbUnten;

    // === STUFE B: Behindertenpauschbetrag (§ 33b Abs. 3 EStG) ===
    const erhoehterFall = merkzeichenH || merkzeichenBl || merkzeichenTBl;

    // Pauschbetrag auf Basis des (geschätzten) Gesamt-GdB — Staffel nach Satz 2.
    let pauschbetragStaffel = 0;
    for (const stufe of PAUSCHBETRAG_STAFFEL) {
      if (gesamtGdbNaeherung >= stufe.gdb) pauschbetragStaffel = stufe.betrag;
    }

    // Bei H/Bl/TBl: 7.400 € statt (nicht zusätzlich) der Staffel.
    const pauschbetrag = erhoehterFall
      ? PAUSCHBETRAG_HILFLOS_BLIND_TAUBBLIND
      : pauschbetragStaffel;

    const hatPauschbetrag = pauschbetrag > 0;

    // Merkzeichen-Text
    const merkzeichenListe: string[] = [];
    if (merkzeichenH) merkzeichenListe.push('H (hilflos)');
    if (merkzeichenBl) merkzeichenListe.push('Bl (blind)');
    if (merkzeichenTBl) merkzeichenListe.push('TBl (taubblind)');

    return {
      werte,
      hoechsterEinzelGdb,
      gesamtGdbNaeherung,
      gesamtGdbUnten,
      gesamtGdbOben,
      istSpanne,
      erhoehterFall,
      merkzeichenListe,
      pauschbetragStaffel,
      pauschbetrag,
      hatPauschbetrag,
    };
  }, [einzelGdb, merkzeichenH, merkzeichenBl, merkzeichenTBl]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  const setGdbAt = (index: number, value: number) => {
    setEinzelGdb((prev) => prev.map((v, i) => (i === index ? value : v)));
  };
  const addGdb = () => setEinzelGdb((prev) => (prev.length >= 8 ? prev : [...prev, 20]));
  const removeGdb = (index: number) =>
    setEinzelGdb((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section: Einzel-GdB */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-1">Einzel-GdB Ihrer Gesundheitsstörungen</h3>
        <p className="text-xs text-gray-500 mb-4">
          Tragen Sie für jede festgestellte Funktionsbeeinträchtigung den Einzel-GdB
          (10–100, in Zehnerschritten) ein. Der Gesamt-GdB wird daraus nur näherungsweise
          geschätzt – verbindlich entscheidet das Versorgungsamt.
        </p>

        <div className="space-y-3">
          {einzelGdb.map((wert, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-28 flex-shrink-0">
                Störung {index + 1}
              </span>
              <select
                value={wert}
                onChange={(e) => setGdbAt(index, Number(e.target.value))}
                className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:border-blue-500 focus:ring-0 outline-none bg-white"
              >
                {GDB_OPTIONEN.map((opt) => (
                  <option key={opt} value={opt}>
                    GdB {opt}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeGdb(index)}
                disabled={einzelGdb.length <= 1}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold text-gray-600 transition-colors flex-shrink-0"
                aria-label="Störung entfernen"
              >
                −
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addGdb}
          disabled={einzelGdb.length >= 8}
          className="mt-4 w-full py-3 rounded-xl bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-blue-700 font-medium transition-colors"
        >
          + Weitere Gesundheitsstörung hinzufügen
        </button>

        <hr className="my-6 border-gray-200" />

        {/* Merkzeichen */}
        <h3 className="font-bold text-gray-800 mb-1">Merkzeichen im Schwerbehindertenausweis</h3>
        <p className="text-xs text-gray-500 mb-4">
          Bei den Merkzeichen H, Bl oder TBl gilt ein erhöhter Pauschbetrag von 7.400 € –
          die GdB-Staffel wird dann nicht zusätzlich gewährt (§ 33b Abs. 3 Satz 3 EStG).
        </p>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={merkzeichenH}
              onChange={(e) => setMerkzeichenH(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Merkzeichen H (hilflos)</span>
              <span className="text-xs text-gray-500 block">
                Dauernder Bedarf fremder Hilfe für häufig wiederkehrende Alltagsverrichtungen
                (§ 33b Abs. 3 Satz 4 EStG)
              </span>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={merkzeichenBl}
              onChange={(e) => setMerkzeichenBl(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Merkzeichen Bl (blind)</span>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={merkzeichenTBl}
              onChange={(e) => setMerkzeichenTBl(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Merkzeichen TBl (taubblind)</span>
            </div>
          </label>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">♿ Geschätzter Gesamt-GdB</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{ergebnis.gesamtGdbNaeherung}</span>
            <span className="text-xl opacity-80">GdB (Näherung)</span>
          </div>
          <p className="text-blue-100 mt-2 text-sm">
            {ergebnis.istSpanne ? (
              <>Orientierungsspanne: <strong>{ergebnis.gesamtGdbUnten} bis {ergebnis.gesamtGdbOben}</strong> –
              der höchste Einzel-GdB ({ergebnis.hoechsterEinzelGdb}) ist der Mindestwert.</>
            ) : (
              <>Entspricht dem höchsten Einzel-GdB ({ergebnis.hoechsterEinzelGdb}).</>
            )}
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-sm opacity-80">
              {ergebnis.erhoehterFall ? 'Erhöhter Pauschbetrag (H/Bl/TBl)' : 'Behindertenpauschbetrag'}
            </span>
            <span className="text-3xl font-bold">
              {ergebnis.hatPauschbetrag ? formatEuro(ergebnis.pauschbetrag) : '0 €'}
            </span>
          </div>
          <p className="text-blue-100 mt-1 text-xs">
            {ergebnis.hatPauschbetrag
              ? 'pro Jahr, § 33b Abs. 3 EStG'
              : 'Unter GdB 20 besteht kein Anspruch auf den Behindertenpauschbetrag.'}
          </p>
        </div>

        {ergebnis.erhoehterFall && (
          <p className="text-blue-100 mt-3 text-xs">
            Merkzeichen berücksichtigt: {ergebnis.merkzeichenListe.join(', ')} → 7.400 € statt
            der GdB-Staffel (nicht zusätzlich, § 33b Abs. 3 Satz 3 EStG).
          </p>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Gesamt-GdB (Näherung nach VersMedV Teil A Nr. 3)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Eingegebene Einzel-GdB</span>
            <span className="font-bold text-gray-900">
              {ergebnis.werte.length > 0 ? ergebnis.werte.join(', ') : '–'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Ausgangswert = höchster Einzel-GdB</span>
            <span className="font-bold text-gray-900">{ergebnis.hoechsterEinzelGdb}</span>
          </div>
          <div className="flex justify-between py-2 bg-blue-50 -mx-6 px-6">
            <span className="font-medium text-blue-700">≈ Gesamt-GdB (unverbindliche Schätzung)</span>
            <span className="font-bold text-blue-900">
              {ergebnis.istSpanne
                ? `${ergebnis.gesamtGdbUnten}–${ergebnis.gesamtGdbOben}`
                : ergebnis.gesamtGdbNaeherung}
            </span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Behindertenpauschbetrag (§ 33b Abs. 3 EStG)
          </div>
          {ergebnis.erhoehterFall ? (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Merkzeichen {ergebnis.merkzeichenListe.join(', ')} → erhöhter Pauschbetrag</span>
              <span className="font-bold text-gray-900">{formatEuro(PAUSCHBETRAG_HILFLOS_BLIND_TAUBBLIND)}</span>
            </div>
          ) : (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Pauschbetrag zu GdB {ergebnis.gesamtGdbNaeherung} (Staffel Satz 2)</span>
              <span className="font-bold text-gray-900">
                {ergebnis.pauschbetragStaffel > 0 ? formatEuro(ergebnis.pauschbetragStaffel) : 'kein Anspruch'}
              </span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-blue-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-blue-800">Pauschbetrag pro Jahr</span>
            <span className="font-bold text-2xl text-blue-900">
              {ergebnis.hatPauschbetrag ? formatEuro(ergebnis.pauschbetrag) : '0 €'}
            </span>
          </div>
        </div>
      </div>

      {/* Pauschbetrag-Staffel Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Behindertenpauschbetrag nach GdB (§ 33b EStG)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Grad der Behinderung</th>
                <th className="px-3 py-2 text-right">Pauschbetrag / Jahr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PAUSCHBETRAG_STAFFEL.map((stufe) => (
                <tr
                  key={stufe.gdb}
                  className={
                    !ergebnis.erhoehterFall && ergebnis.gesamtGdbNaeherung === stufe.gdb
                      ? 'bg-blue-50 font-bold'
                      : ''
                  }
                >
                  <td className="px-3 py-2">GdB {stufe.gdb}</td>
                  <td className="px-3 py-2 text-right">{formatEuro(stufe.betrag)}</td>
                </tr>
              ))}
              <tr className={ergebnis.erhoehterFall ? 'bg-blue-50 font-bold' : ''}>
                <td className="px-3 py-2">Merkzeichen H, Bl oder TBl</td>
                <td className="px-3 py-2 text-right">{formatEuro(PAUSCHBETRAG_HILFLOS_BLIND_TAUBBLIND)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Unter GdB 20 besteht kein Anspruch. Bei H/Bl/TBl gilt der Betrag von 7.400 € –
          die Staffel wird dann nicht zusätzlich gewährt.
        </p>
      </div>

      {/* Wichtiger Hinweis: Versorgungsamt entscheidet */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Der Gesamt-GdB ist eine Schätzung</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Keine Formel:</strong> Der Gesamt-GdB darf nach der Versorgungsmedizin-Verordnung
              (Teil A Nr. 3.2) <strong>nicht durch Addition oder Mittelung</strong> der Einzel-GdB
              gebildet werden.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Gutachterliche Gesamtschau:</strong> Maßgeblich sind die wechselseitigen
              Beziehungen der Beeinträchtigungen – dieser Rechner liefert daher nur eine grobe
              Orientierung.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Verbindlich entscheidet das Versorgungsamt</strong> auf Antrag (Feststellung nach
              SGB IX). Der tatsächliche Gesamt-GdB kann von dieser Schätzung abweichen.
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer + Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 mb-3">
          <strong>Hinweis:</strong> Dieser Rechner liefert eine unverbindliche Schätzung und ersetzt
          keine Rechts- oder Steuerberatung. Der Gesamt-GdB wird verbindlich vom Versorgungsamt
          festgestellt; der Behindertenpauschbetrag wird im Rahmen der Einkommensteuererklärung geltend
          gemacht. Alle Angaben ohne Gewähr.
        </p>
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/estg/__33b.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 33b EStG – Pauschbeträge für Menschen mit Behinderungen
          </a>
          <a
            href="https://www.gesetze-im-internet.de/versmedv/anlage.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            VersMedV, Anlage zu § 2 – Versorgungsmedizinische Grundsätze (Teil A Nr. 3)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/versmedv/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Versorgungsmedizin-Verordnung (VersMedV) – Übersicht
          </a>
        </div>
      </div>
    </div>
  );
}
