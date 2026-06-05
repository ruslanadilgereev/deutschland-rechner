import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// === Investitionsabzugsbetrag § 7g EStG – Konstanten (Stand 2026) ===
// Quelle: https://www.gesetze-im-internet.de/estg/__7g.html
const MAX_IAB_QUOTE = 50;          // bis zu 50 % der voraussichtlichen AHK
const GEWINNGRENZE = 200000;       // Gewinngrenze 200.000 € im Abzugsjahr
const HOECHSTGRENZE = 200000;      // Summen-Höchstgrenze je Betrieb (lfd. Jahr + 3 Vorjahre)
const INVESTITIONSZEITRAUM = 3;    // Investitionszeitraum 3 Jahre
const SONDERABSCHREIBUNG_QUOTE = 40; // § 7g Abs. 5 EStG: bis 40 % Sonderabschreibung
// Verzinsung bei Rückgängigmachung nach § 233a i. V. m. § 238 AO:
// seit 01.01.2019 0,15 % je Monat = 1,8 % p. a. (Stand 2026)
const ZINSSATZ_AO = 1.8;

export default function InvestitionsabzugsbetragRechner() {
  // Eingabewerte
  const [ahk, setAhk] = useState(50000);            // voraussichtliche Anschaffungs-/Herstellungskosten
  const [iabQuote, setIabQuote] = useState(50);     // gewählte IAB-Quote (max. 50 %)
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(42); // persönlicher Grenzsteuersatz
  const [betriebsgewinn, setBetriebsgewinn] = useState(120000); // Gewinn im Abzugsjahr (vor IAB)

  const ergebnis = useMemo(() => {
    // === 1. IAB-Betrag ermitteln ===
    const quote = Math.min(iabQuote, MAX_IAB_QUOTE);
    const iabRoh = ahk * (quote / 100);

    // === 2. Summen-Höchstgrenze 200.000 € je Betrieb ===
    const iabBetrag = Math.min(iabRoh, HOECHSTGRENZE);
    const hoechstgrenzeAktiv = iabRoh > HOECHSTGRENZE;

    // === 3. Gewinngrenze prüfen (Voraussetzung: Gewinn <= 200.000 €) ===
    // Maßgeblich ist der Gewinn ohne Berücksichtigung des IAB.
    const gewinngrenzeEingehalten = betriebsgewinn <= GEWINNGRENZE;

    // === 4. Steuerstundung = IAB × Grenzsteuersatz ===
    const steuerstundung = iabBetrag * (grenzsteuersatz / 100);

    // === 5. Sonderabschreibung § 7g Abs. 5 (zusätzlich, im Anschaffungsjahr / verteilt) ===
    // Bemessungsgrundlage = AHK abzgl. der gewinnmindernden Hinzurechnung des IAB
    const restbuchwert = Math.max(0, ahk - iabBetrag);
    const sonderabschreibung = restbuchwert * (SONDERABSCHREIBUNG_QUOTE / 100);
    const stundungSonderafa = sonderabschreibung * (grenzsteuersatz / 100);

    // === 6. Liquiditätsvorteil gesamt im Abzugsjahr ===
    const liquiditaetsvorteilGesamt = steuerstundung + stundungSonderafa;

    return {
      quote,
      iabBetrag,
      hoechstgrenzeAktiv,
      gewinngrenzeEingehalten,
      betriebsgewinn,
      steuerstundung,
      restbuchwert,
      sonderabschreibung,
      stundungSonderafa,
      liquiditaetsvorteilGesamt,
    };
  }, [ahk, iabQuote, grenzsteuersatz, betriebsgewinn]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Investitionsabzugsbetrag-Rechner (§ 7g)" rechnerSlug="investitionsabzugsbetrag-rechner" />

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Voraussichtliche AHK */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Voraussichtliche Anschaffungs-/Herstellungskosten</span>
            <span className="text-xs text-gray-500 block mt-1">
              Geplante Netto-Investition in ein bewegliches Wirtschaftsgut (z.&nbsp;B. Maschine, Fahrzeug, EDV)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={ahk}
              onChange={(e) => setAhk(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={ahk}
            onChange={(e) => setAhk(Number(e.target.value))}
            className="w-full mt-3 accent-amber-500"
            min="0"
            max="200000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>100.000 €</span>
            <span>200.000 €</span>
          </div>
        </div>

        {/* IAB-Quote */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">IAB-Quote (Anteil der AHK)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Sie können bis zu 50&nbsp;% der voraussichtlichen Kosten vorab abziehen
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={iabQuote}
              onChange={(e) => setIabQuote(Number(e.target.value))}
              className="flex-1 accent-amber-500"
              min="1"
              max="50"
              step="1"
            />
            <span className="text-2xl font-bold text-amber-800 w-20 text-right">{iabQuote} %</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Maximal zulässig sind 50&nbsp;% (§ 7g Abs. 1 EStG). Sie dürfen auch weniger ansetzen.
          </p>
        </div>

        {/* Grenzsteuersatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ihr persönlicher Grenzsteuersatz</span>
            <span className="text-xs text-gray-500 block mt-1">
              Der Satz, mit dem Ihr nächster Euro Gewinn versteuert wird (Einkommen- oder Körperschaftsteuer)
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={grenzsteuersatz}
              onChange={(e) => setGrenzsteuersatz(Number(e.target.value))}
              className="flex-1 accent-amber-500"
              min="14"
              max="45"
              step="1"
            />
            <span className="text-2xl font-bold text-amber-800 w-20 text-right">{grenzsteuersatz} %</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Hinweis: Default 42&nbsp;% (Spitzensteuersatz ohne Reichensteuer). Bitte an Ihre Situation anpassen –
            GmbHs rechnen meist mit ca. 30&nbsp;% (KSt + GewSt).
          </p>
        </div>

        {/* Betriebsgewinn (Gewinngrenze) */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gewinn im Abzugsjahr (vor IAB)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Voraussetzung für den IAB: Der Gewinn darf höchstens 200.000&nbsp;€ betragen
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={betriebsgewinn}
              onChange={(e) => setBetriebsgewinn(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          {!ergebnis.gewinngrenzeEingehalten && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Gewinn über 200.000&nbsp;€: In diesem Jahr ist <strong>kein</strong> Investitionsabzugsbetrag zulässig (§ 7g Abs. 1 Satz 2 Nr. 1 EStG).
            </p>
          )}
          {ergebnis.gewinngrenzeEingehalten && (
            <p className="text-sm text-green-600 mt-2">
              ✅ Gewinngrenze von 200.000&nbsp;€ eingehalten – der IAB ist grundsätzlich zulässig.
            </p>
          )}
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🛠️ Ihr Investitionsabzugsbetrag</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">
              {ergebnis.gewinngrenzeEingehalten ? formatEuroRound(ergebnis.iabBetrag) : '0 €'}
            </span>
          </div>
          <p className="text-amber-100 mt-2 text-sm">
            {ergebnis.quote}&nbsp;% von {formatEuroRound(ahk)} voraussichtlichen Anschaffungskosten – vorab gewinnmindernd
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Steuerstundung (IAB)</span>
            <div className="text-xl font-bold">
              {ergebnis.gewinngrenzeEingehalten ? formatEuroRound(ergebnis.steuerstundung) : '0 €'}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">+ Stundung Sonder-AfA</span>
            <div className="text-xl font-bold">
              {ergebnis.gewinngrenzeEingehalten ? formatEuroRound(ergebnis.stundungSonderafa) : '0 €'}
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Liquiditätsvorteil im Abzugsjahr (gesamt)</span>
            <span className="text-lg font-bold">
              {ergebnis.gewinngrenzeEingehalten ? formatEuroRound(ergebnis.liquiditaetsvorteilGesamt) : '0 €'}
            </span>
          </div>
        </div>
      </div>

      {/* WICHTIGSTER Hinweis: Stundung, nicht Ersparnis */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
          <span className="text-xl">⚠️</span> Wichtig: Steuerstundung – keine endgültige Ersparnis
        </h3>
        <p className="text-sm text-red-700">
          Der Investitionsabzugsbetrag spart <strong>keine</strong> Steuern dauerhaft. Er verschiebt die
          Steuerlast nur in die Zukunft (Liquiditäts- und Zinsvorteil). Im Jahr der tatsächlichen Anschaffung
          wird der IAB dem Gewinn wieder <strong>hinzugerechnet</strong> und im Gegenzug von den Anschaffungskosten
          abgezogen – die Abschreibungsbasis sinkt entsprechend. Über die gesamte Nutzungsdauer ergibt sich
          dieselbe Gesamtsteuer, nur zeitlich nach vorne verlagert.
        </p>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          {/* IAB */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            1. Investitionsabzugsbetrag
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Voraussichtliche AHK</span>
            <span className="font-bold text-gray-900">{formatEuro(ahk)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">× IAB-Quote ({ergebnis.quote}&nbsp;%)</span>
            <span className="text-gray-900">{formatEuro(ahk)} × {ergebnis.quote}&nbsp;%</span>
          </div>
          {ergebnis.hoechstgrenzeAktiv && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-amber-600">
              <span>Begrenzt auf Höchstgrenze je Betrieb</span>
              <span>{formatEuro(HOECHSTGRENZE)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 bg-amber-100 -mx-6 px-6">
            <span className="font-bold text-amber-800">= Investitionsabzugsbetrag</span>
            <span className="font-bold text-2xl text-amber-900">{formatEuro(ergebnis.iabBetrag)}</span>
          </div>

          {/* Steuerstundung */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            2. Steuerstundung im Abzugsjahr
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">IAB × Grenzsteuersatz ({grenzsteuersatz}&nbsp;%)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.iabBetrag)} × {grenzsteuersatz}&nbsp;%</span>
          </div>
          <div className="flex justify-between py-2 bg-amber-50 -mx-6 px-6">
            <span className="font-medium text-amber-700">= gestundete Steuer (IAB)</span>
            <span className="font-bold text-amber-900">{formatEuro(ergebnis.steuerstundung)}</span>
          </div>

          {/* Sonderabschreibung */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            3. Sonderabschreibung § 7g Abs. 5 (im Anschaffungsjahr, zusätzlich)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Restbuchwert nach IAB-Hinzurechnung</span>
            <span className="text-gray-900">{formatEuro(ergebnis.restbuchwert)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">× Sonder-AfA-Satz (bis 40&nbsp;%)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.restbuchwert)} × 40&nbsp;%</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">= mögliche Sonderabschreibung</span>
            <span className="text-gray-900">{formatEuro(ergebnis.sonderabschreibung)}</span>
          </div>
          <div className="flex justify-between py-2 bg-amber-50 -mx-6 px-6">
            <span className="font-medium text-amber-700">= zusätzliche Stundung Sonder-AfA</span>
            <span className="font-bold text-amber-900">{formatEuro(ergebnis.stundungSonderafa)}</span>
          </div>

          {/* Gesamt */}
          <div className="flex justify-between py-2 bg-green-50 -mx-6 px-6 rounded-b-xl mt-2">
            <span className="font-bold text-green-700">= Liquiditätsvorteil im Abzugsjahr</span>
            <span className="font-bold text-green-900">{formatEuro(ergebnis.liquiditaetsvorteilGesamt)}</span>
          </div>
        </div>

        {!ergebnis.gewinngrenzeEingehalten && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl text-sm text-red-700">
            Hinweis: Da der Gewinn über 200.000&nbsp;€ liegt, ist in diesem Jahr kein IAB möglich. Die
            obigen Beträge zeigen nur, was <em>theoretisch</em> bei eingehaltener Gewinngrenze gälte.
          </div>
        )}
      </div>

      {/* Sonderabschreibung Hinweis */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">💡 IAB und Sonderabschreibung kombinieren</h3>
        <p className="text-sm text-amber-700 mb-3">
          Der IAB (§ 7g Abs. 1) und die Sonderabschreibung (§ 7g Abs. 5) lassen sich kombinieren und sorgen
          gemeinsam für den größten Vorzieh-Effekt:
        </p>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>IAB (bis 50&nbsp;%):</strong> Schon <em>vor</em> der Anschaffung gewinnmindernd – bis zu drei Jahre im Voraus.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Sonder-AfA (bis 40&nbsp;%):</strong> Im Anschaffungsjahr und den vier Folgejahren frei verteilbar – zusätzlich zur normalen AfA.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Voraussetzung Sonder-AfA:</strong> Betriebliche Nutzung zu mindestens 90&nbsp;% im Anschaffungs- und Folgejahr.</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise / Rückgängigmachung */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Rückgängigmachung bei Nicht-Investition</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>3-Jahres-Frist:</strong> Die Investition muss innerhalb von drei Jahren nach dem Abzugsjahr erfolgen (§ 7g Abs. 3 EStG).</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Keine Investition:</strong> Wird nicht investiert, wird der IAB rückwirkend im Abzugsjahr aufgelöst – die Steuer für dieses Jahr fällt nachträglich an.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Verzinsung:</strong> Die Steuernachzahlung wird nach § 233a i.&nbsp;V.&nbsp;m. § 238 AO verzinst – aktuell {ZINSSATZ_AO.toLocaleString('de-DE')}&nbsp;% p.&nbsp;a. (0,15&nbsp;% je Monat, Stand 2026).</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Folge:</strong> Aus dem Liquiditätsvorteil kann bei Nicht-Investition ein Zinsnachteil werden.</span>
          </li>
        </ul>
      </div>

      {/* Pflicht-Disclaimer */}
      <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5 mb-6">
        <p className="text-sm text-gray-600">
          <strong>Hinweis:</strong> Dieser Rechner liefert eine Schätzung ohne Gewähr und ersetzt keine
          Steuerberatung. Die tatsächliche steuerliche Wirkung hängt von Ihrer individuellen Situation,
          der Rechtsform und dem Veranlagungsfall ab. Für eine verbindliche Beurteilung wenden Sie sich
          bitte an einen Steuerberater oder Ihr Finanzamt.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/estg/__7g.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 7g EStG – Investitionsabzugsbeträge und Sonderabschreibungen (Gesetze im Internet)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/ao_1977/__233a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 233a AO – Verzinsung von Steuernachforderungen und -erstattungen
          </a>
          <a
            href="https://www.gesetze-im-internet.de/ao_1977/__238.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 238 AO – Höhe und Berechnung der Zinsen (1,8&nbsp;% p.&nbsp;a. seit 2019)
          </a>
          <a
            href="https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/steuern.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – Steuern
          </a>
        </div>
      </div>
    </div>
  );
}
