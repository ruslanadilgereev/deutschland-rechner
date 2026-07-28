import { useState, useMemo } from 'react';

// === OFFIZIELLE WERTE (Stand: Juli 2026) ===

// Aktueller Rentenwert: 42,52 € pro Entgeltpunkt und Monat, bundeseinheitlich ab 01.07.2026
// Quelle: § 1 RWBestV 2026 – https://www.gesetze-im-internet.de/rwbestv_2026/__1.html
const RENTENWERT_2026 = 42.52;

// Rentenartfaktor für Renten wegen Alters: 1,0
// Quelle: § 67 Nr. 1 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__67.html
const RENTENARTFAKTOR_ALTERSRENTE = 1.0;

// Untergrenze der Teilrente: mindestens 10 % der Vollrente (Gesetzeswortlaut)
// Quelle: § 42 Abs. 1 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__42.html
const TEILRENTE_MIN_PROZENT = 10;

// Obergrenze der Teilrente: höchstens 99,99 % der Vollrente.
// ACHTUNG: Diese Obergrenze steht NICHT im Gesetzeswortlaut des § 42 SGB VI –
// sie ist amtliche Verwaltungspraxis der Deutschen Rentenversicherung.
// Quelle: DRV-FAQ Teilrente – https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Wissenswertes-zur-Rente/FAQs/Rente/Hinzuverdienst_und_Einkommensanrechnung/09_teilrente.html
const TEILRENTE_MAX_PROZENT = 99.99;

// Hinzuverdienst: Die Hinzuverdienstgrenzen für Altersrenten sind seit dem
// 01.01.2023 aufgehoben – der Hinzuverdienst kürzt die Rente NICHT (rein informativ).
// Quelle: DRV-FAQ – https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Wissenswertes-zur-Rente/FAQs/Rente/Hinzuverdienst_und_Einkommensanrechnung/aenderungen_hinzuverdienst_liste.html

// Rentenformel: Monatsrente = persönliche Entgeltpunkte (mit Zugangsfaktor)
// × Rentenartfaktor × aktueller Rentenwert
// Quelle: § 64 SGB VI – https://www.gesetze-im-internet.de/sgb_6/__64.html

export default function TeilrenteRechner() {
  // Eingabemodus: Vollrente direkt eingeben oder aus Entgeltpunkten berechnen
  const [modus, setModus] = useState<'rente' | 'punkte'>('rente');

  // Vollrente direkt (brutto, €/Monat)
  const [vollrenteEingabe, setVollrenteEingabe] = useState(1600);

  // Persönliche Entgeltpunkte (bereits inkl. Zugangsfaktor, § 64 SGB VI)
  const [entgeltpunkte, setEntgeltpunkte] = useState(40);

  // Gewählter Teilrenten-Prozentsatz (10 bis 99,99 %)
  const [prozent, setProzent] = useState(50);

  // Optionaler Brutto-Hinzuverdienst – rein informativ, KEINE Anrechnung
  const [hinzuverdienst, setHinzuverdienst] = useState(0);

  const ergebnis = useMemo(() => {
    // === 1. Vollrente bestimmen ===
    // Entweder direkte Eingabe oder Rentenformel nach § 64 SGB VI:
    // Entgeltpunkte × Rentenartfaktor 1,0 × 42,52 € (§ 67 SGB VI, § 1 RWBestV 2026)
    const vollrente =
      modus === 'punkte'
        ? entgeltpunkte * RENTENARTFAKTOR_ALTERSRENTE * RENTENWERT_2026
        : vollrenteEingabe;

    // === 2. Prozentsatz auf zulässige Spanne begrenzen ===
    // 10 % Untergrenze (§ 42 Abs. 1 SGB VI), 99,99 % Obergrenze (DRV-Verwaltungspraxis)
    const prozentWirksam = Math.min(
      TEILRENTE_MAX_PROZENT,
      Math.max(TEILRENTE_MIN_PROZENT, prozent)
    );
    const prozentUnterMinimum = prozent < TEILRENTE_MIN_PROZENT;

    // === 3. Teilrente berechnen ===
    const teilrente = (vollrente * prozentWirksam) / 100;

    // === 4. Nicht in Anspruch genommener Anteil ===
    const restProzent = 100 - prozentWirksam;
    const restBetrag = vollrente - teilrente;

    // === 5. Gesamteinkommen (Teilrente + Hinzuverdienst, brutto) ===
    // Seit 01.01.2023 KEINE Hinzuverdienstgrenze bei Altersrenten – keine Kürzung.
    const gesamteinkommen = teilrente + hinzuverdienst;

    return {
      vollrente,
      prozentWirksam,
      prozentUnterMinimum,
      teilrente,
      restProzent,
      restBetrag,
      gesamteinkommen,
    };
  }, [modus, vollrenteEingabe, entgeltpunkte, prozent, hinzuverdienst]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' %';

  const schnellwahl = [10, 30, 50, 70, 99.99];

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Eingabemodus */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Wie möchten Sie Ihre Vollrente angeben?</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setModus('rente')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                modus === 'rente'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Vollrente direkt
            </button>
            <button
              onClick={() => setModus('punkte')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                modus === 'punkte'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Aus Entgeltpunkten
            </button>
          </div>
        </div>

        {modus === 'rente' ? (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Ihre Vollrente (brutto)</span>
              <span className="text-xs text-gray-500 block mt-1">
                Die monatliche Altersrente in voller Höhe – steht in Ihrer Renteninformation
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={vollrenteEingabe}
                onChange={(e) => setVollrenteEingabe(Math.max(0, Number(e.target.value)))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
                min="0"
                max="5000"
                step="50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
            </div>
            <input
              type="range"
              value={vollrenteEingabe}
              onChange={(e) => setVollrenteEingabe(Number(e.target.value))}
              className="w-full mt-3 accent-amber-500"
              min="500"
              max="4000"
              step="50"
            />
          </div>
        ) : (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Persönliche Entgeltpunkte</span>
              <span className="text-xs text-gray-500 block mt-1">
                Bereits inkl. Zugangsfaktor (§ 64 SGB VI) – Vollrente = Entgeltpunkte × 1,0 × 42,52 €
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={entgeltpunkte}
                onChange={(e) => setEntgeltpunkte(Math.max(0, Number(e.target.value)))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
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
              className="w-full mt-3 accent-amber-500"
              min="5"
              max="80"
              step="0.5"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Vollrente: {entgeltpunkte.toLocaleString('de-DE')} Punkte × 1,0 × 42,52 € ={' '}
              <strong>{formatEuro(entgeltpunkte * RENTENARTFAKTOR_ALTERSRENTE * RENTENWERT_2026)}</strong>
            </p>
          </div>
        )}

        {/* Teilrenten-Prozentsatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Teilrenten-Prozentsatz</span>
            <span className="text-xs text-gray-500 block mt-1">
              Frei wählbar von {formatProzent(TEILRENTE_MIN_PROZENT)} (§ 42 SGB VI) bis {formatProzent(TEILRENTE_MAX_PROZENT)} (DRV)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={prozent}
              onChange={(e) =>
                setProzent(Math.min(TEILRENTE_MAX_PROZENT, Math.max(0, Number(e.target.value))))
              }
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
              min="10"
              max="99.99"
              step="0.01"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">%</span>
          </div>
          <input
            type="range"
            value={Math.min(TEILRENTE_MAX_PROZENT, Math.max(TEILRENTE_MIN_PROZENT, prozent))}
            onChange={(e) => setProzent(Number(e.target.value))}
            className="w-full mt-3 accent-amber-500"
            min="10"
            max="99.99"
            step="0.01"
          />
          {ergebnis.prozentUnterMinimum && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              ⚠️ Die Teilrente muss mindestens 10 % der Vollrente betragen (§ 42 Abs. 1 SGB VI) –
              gerechnet wird mit {formatProzent(ergebnis.prozentWirksam)}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {schnellwahl.map((p) => (
              <button
                key={p}
                onClick={() => setProzent(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  prozent === p
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {formatProzent(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Hinzuverdienst (informativ) */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Hinzuverdienst (brutto, optional)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Seit 01.01.2023 ohne Grenze – der Verdienst kürzt Ihre Altersrente nicht
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={hinzuverdienst}
              onChange={(e) => setHinzuverdienst(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
              min="0"
              max="10000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          <input
            type="range"
            value={hinzuverdienst}
            onChange={(e) => setHinzuverdienst(Number(e.target.value))}
            className="w-full mt-2 accent-amber-500"
            min="0"
            max="6000"
            step="50"
          />
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">⏳ Ihre Teilrente</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.teilrente)}</span>
            <span className="text-xl opacity-80">brutto / Monat</span>
          </div>
          <p className="text-amber-100 mt-2 text-sm">
            {formatProzent(ergebnis.prozentWirksam)} Ihrer Vollrente von {formatEuro(ergebnis.vollrente)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Nicht in Anspruch genommen</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.restBetrag)}</div>
            <span className="text-xs opacity-80">= {formatProzent(ergebnis.restProzent)} der Vollrente</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamteinkommen brutto</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.gesamteinkommen)}</div>
            <span className="text-xs opacity-80">Teilrente + Hinzuverdienst</span>
          </div>
        </div>

        {hinzuverdienst > 0 && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm">
              ✓ Ihr Hinzuverdienst von {formatEuroRound(hinzuverdienst)} kürzt die Rente <strong>nicht</strong> –
              die Hinzuverdienstgrenzen für Altersrenten sind seit dem 01.01.2023 aufgehoben.
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        <div className="space-y-3 text-sm">
          {modus === 'punkte' && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                Rentenformel (§ 64 SGB VI)
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Persönliche Entgeltpunkte</span>
                <span className="font-bold text-gray-900">{entgeltpunkte.toLocaleString('de-DE')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">× Rentenartfaktor Altersrente (§ 67 SGB VI)</span>
                <span className="text-gray-900">1,0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">× Aktueller Rentenwert (ab 01.07.2026)</span>
                <span className="text-gray-900">{formatEuro(RENTENWERT_2026)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-2 bg-amber-50 -mx-6 px-6">
            <span className="font-medium text-amber-700">= Vollrente (brutto)</span>
            <span className="font-bold text-amber-900">{formatEuro(ergebnis.vollrente)}</span>
          </div>
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Teilrente (§ 42 SGB VI)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gewählter Prozentsatz</span>
            <span className="font-bold text-amber-600">{formatProzent(ergebnis.prozentWirksam)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Teilrente = {formatProzent(ergebnis.prozentWirksam)} × {formatEuro(ergebnis.vollrente)}</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.teilrente)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Nicht in Anspruch genommener Anteil ({formatProzent(ergebnis.restProzent)})</span>
            <span className="text-gray-900">{formatEuro(ergebnis.restBetrag)}</span>
          </div>
          {hinzuverdienst > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">+ Hinzuverdienst (keine Anrechnung)</span>
              <span className="text-gray-900">{formatEuro(hinzuverdienst)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-amber-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-amber-800">Gesamteinkommen brutto / Monat</span>
            <span className="font-bold text-2xl text-amber-900">{formatEuro(ergebnis.gesamteinkommen)}</span>
          </div>
        </div>
      </div>

      {/* Info: So funktioniert die Teilrente */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Teilrente</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Freie Wahl:</strong> Sie bestimmen selbst, welchen Anteil Ihrer Altersrente Sie beziehen – mindestens 10 % (§ 42 Abs. 1 SGB VI), höchstens 99,99 % (DRV-Verwaltungspraxis).</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kein Hinzuverdienst-Limit:</strong> Seit dem 01.01.2023 sind die Hinzuverdienstgrenzen bei Altersrenten aufgehoben – Sie können neben Voll- oder Teilrente unbegrenzt verdienen.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Rentenformel:</strong> Die Vollrente ergibt sich aus persönlichen Entgeltpunkten × Rentenartfaktor 1,0 × aktuellem Rentenwert von 42,52 € (ab 01.07.2026).</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Restanteil:</strong> Der nicht in Anspruch genommene Teil Ihrer Rente verfällt nicht – Sie beziehen nur einen kleineren Anteil, solange die Teilrente läuft.</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Bruttowerte:</strong> Der Rechner zeigt Bruttobeträge. Kranken- und Pflegeversicherungsbeiträge sowie ggf. Steuern gehen von der Teilrente noch ab und sind hier nicht berücksichtigt.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>99,99 %-Obergrenze:</strong> Sie steht nicht im Gesetzestext des § 42 SGB VI, sondern ist amtliche Verwaltungspraxis der Deutschen Rentenversicherung (DRV-FAQ).</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Schrittweite:</strong> Welche Nachkommastellen beim Prozentsatz im Antrag zulässig sind, ist amtlich nicht spezifiziert – belegt ist nur die Spanne 10 bis 99,99 %.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Folgewirkungen:</strong> Auswirkungen der Teilrente auf Abschläge, spätere Zuschläge oder die Sozialversicherung (z. B. bei pflegenden Angehörigen) berechnet dieser Rechner nicht – dazu berät die Deutsche Rentenversicherung (0800 1000 4800).</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Antrag:</strong> Die Teilrente (und jede Änderung des Prozentsatzes) müssen Sie bei der Deutschen Rentenversicherung beantragen.</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-xs text-gray-500">
        Dieser Rechner liefert eine unverbindliche Schätzung auf Basis der amtlichen Werte
        (Stand Juli 2026) und ersetzt keine Renten-, Steuer- oder Rechtsberatung. Verbindliche
        Auskünfte zu Ihrer Rente erteilt ausschließlich die Deutsche Rentenversicherung.
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/sgb_6/__42.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 42 SGB VI – Vollrente und Teilrente (mindestens 10 %)
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
            § 67 SGB VI – Rentenartfaktor (Altersrente: 1,0)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/rwbestv_2026/__1.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 1 RWBestV 2026 – Aktueller Rentenwert 42,52 € ab 01.07.2026
          </a>
          <a
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Wissenswertes-zur-Rente/FAQs/Rente/Hinzuverdienst_und_Einkommensanrechnung/09_teilrente.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DRV-FAQ – Teilrente: mindestens 10 %, höchstens 99,99 % der Vollrente
          </a>
          <a
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Wissenswertes-zur-Rente/FAQs/Rente/Hinzuverdienst_und_Einkommensanrechnung/aenderungen_hinzuverdienst_liste.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DRV-FAQ – Hinzuverdienstgrenzen bei Altersrenten seit 01.01.2023 aufgehoben
          </a>
        </div>
      </div>
    </div>
  );
}
