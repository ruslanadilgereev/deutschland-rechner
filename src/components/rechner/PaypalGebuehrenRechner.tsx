import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// PayPal-Gebühren Deutschland
// Quelle: https://www.paypal.com/de/business/paypal-business-fees (zuletzt aktualisiert 30. April 2026)
//
// Waren & Dienstleistungen (gewerblich):
//   national:        2,49 % + 0,35 € Festgebühr
//   international Aufschlag auf den Prozentsatz:
//     EWR:        +0,00 %  -> 2,49 %
//     UK:         +1,29 %  -> 3,78 %
//     Rest Welt:  +2,99 %  -> 5,48 %
//   Festgebühr bleibt jeweils 0,35 €
//
// Freunde & Familie (privat):
//   national mit Guthaben/Bankkonto: kostenlos
//   national mit Kreditkarte:        +2,9 % Funding-Gebühr
//   international:                    5,00 % (min 0,99 € / max 3,99 €)

const FESTGEBUEHR = 0.35; // € (Waren & Dienstleistungen)
const PROZENT_WD = 2.49; // % national, Waren & Dienstleistungen
const AUFSCHLAG_UK = 1.29; // % zusätzlich
const AUFSCHLAG_WELT = 2.99; // % zusätzlich

const FF_KREDITKARTE = 2.9; // % Funding-Gebühr national mit Kreditkarte
const FF_INTL_PROZENT = 5.0; // % international Freunde & Familie
const FF_INTL_MIN = 0.99; // €
const FF_INTL_MAX = 3.99; // €

type Modus = 'empfaenger' | 'rueckwaerts';
type Region = 'national' | 'ewr' | 'uk' | 'welt';
type Art = 'waren' | 'ff-guthaben' | 'ff-kreditkarte';

function euro(n: number): string {
  return n.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Liefert { prozent, fest } für die jeweilige Kombination.
// fest = nur Festbetrag in € (bei Waren & Dienstleistungen 0,35 €, sonst 0)
function gebuehrenmodell(art: Art, region: Region): { prozent: number; fest: number } {
  if (art === 'waren') {
    let prozent = PROZENT_WD;
    if (region === 'uk') prozent += AUFSCHLAG_UK;
    else if (region === 'welt') prozent += AUFSCHLAG_WELT;
    // ewr: +0, national: +0
    return { prozent, fest: FESTGEBUEHR };
  }
  // Freunde & Familie
  if (region === 'national') {
    if (art === 'ff-kreditkarte') return { prozent: FF_KREDITKARTE, fest: 0 };
    return { prozent: 0, fest: 0 }; // Guthaben/Bankkonto national = kostenlos
  }
  // international (ewr/uk/welt) -> 5 % mit min/max, unabhängig von der Zahlungsquelle
  return { prozent: FF_INTL_PROZENT, fest: 0 };
}

function istIntlFF(art: Art, region: Region): boolean {
  return art !== 'waren' && region !== 'national';
}

export default function PaypalGebuehrenRechner() {
  const [modus, setModus] = useState<Modus>('empfaenger');
  const [betrag, setBetrag] = useState('100');
  const [art, setArt] = useState<Art>('waren');
  const [region, setRegion] = useState<Region>('national');

  const eingabe = parseFloat(betrag.replace(',', '.')) || 0;
  const { prozent, fest } = gebuehrenmodell(art, region);
  const intlFF = istIntlFF(art, region);

  // ---- Modus 1: Empfänger -> Betrag wird gesendet, Gebühr wird abgezogen ----
  let gebuehrEmpf = (eingabe * prozent) / 100 + fest;
  if (intlFF) {
    // 5 % mit min 0,99 / max 3,99
    gebuehrEmpf = Math.min(Math.max(gebuehrEmpf, FF_INTL_MIN), FF_INTL_MAX);
  }
  if (eingabe <= 0) gebuehrEmpf = 0;
  const auszahlung = Math.max(0, eingabe - gebuehrEmpf);

  // ---- Modus 2: Rückwärts -> gewünschter Netto-Betrag soll ankommen ----
  // Gesucht: Bruttobetrag X, sodass X - Gebühr(X) = netto
  // Bei linearer Gebühr ohne min/max: X = (netto + fest) / (1 - prozent/100)
  let bruttoNoetig = 0;
  let gebuehrRueck = 0;
  if (eingabe > 0) {
    if (prozent === 0) {
      bruttoNoetig = eingabe + fest;
      gebuehrRueck = fest;
    } else if (intlFF) {
      // Iterativ, weil min/max die Linearität bricht
      bruttoNoetig = (eingabe + fest) / (1 - prozent / 100);
      let g = (bruttoNoetig * prozent) / 100;
      g = Math.min(Math.max(g, FF_INTL_MIN), FF_INTL_MAX);
      // Wenn Gebühr durch min/max gedeckelt wurde, Brutto neu = netto + Gebühr
      bruttoNoetig = eingabe + g;
      g = (bruttoNoetig * prozent) / 100;
      g = Math.min(Math.max(g, FF_INTL_MIN), FF_INTL_MAX);
      bruttoNoetig = eingabe + g;
      gebuehrRueck = bruttoNoetig - eingabe;
    } else {
      bruttoNoetig = (eingabe + fest) / (1 - prozent / 100);
      gebuehrRueck = bruttoNoetig - eingabe;
    }
  }

  const effektiverSatzEmpf = eingabe > 0 ? (gebuehrEmpf / eingabe) * 100 : 0;

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="PayPal-Gebühren-Rechner" rechnerSlug="paypal-gebuehren-rechner" />

      {/* Modus-Umschalter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setModus('empfaenger')}
            className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all ${
              modus === 'empfaenger'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Was bleibt übrig?
          </button>
          <button
            onClick={() => setModus('rueckwaerts')}
            className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all ${
              modus === 'rueckwaerts'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Wie viel senden lassen?
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          {modus === 'empfaenger'
            ? 'Sie erhalten einen Betrag – wie viel kommt nach PayPal-Gebühr bei Ihnen an?'
            : 'Sie wollen einen bestimmten Netto-Betrag erhalten – wie viel muss der Sender überweisen?'}
        </p>

        {/* Betrag */}
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">
            {modus === 'empfaenger' ? 'Gesendeter Betrag' : 'Gewünschter Netto-Betrag (soll ankommen)'}
          </span>
          <div className="mt-2 relative">
            <input
              type="text"
              inputMode="decimal"
              value={betrag}
              onChange={(e) => setBetrag(e.target.value.replace(/[^0-9.,]/g, ''))}
              className="w-full text-2xl font-bold text-gray-800 border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none"
              placeholder="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
              €
            </span>
          </div>
        </label>

        {/* Transaktionsart */}
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Transaktionsart</span>
          <select
            value={art}
            onChange={(e) => setArt(e.target.value as Art)}
            className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="waren">Waren &amp; Dienstleistungen (gewerblich, mit Käuferschutz)</option>
            <option value="ff-guthaben">Freunde &amp; Familie – Guthaben / Bankkonto</option>
            <option value="ff-kreditkarte">Freunde &amp; Familie – mit Kreditkarte</option>
          </select>
        </label>

        {/* Region */}
        <label className="block">
          <span className="text-gray-700 font-medium">Region</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className="mt-2 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="national">National (innerhalb Deutschlands)</option>
            <option value="ewr">International – EWR (EU/EWR-Land)</option>
            <option value="uk">International – Vereinigtes Königreich</option>
            <option value="welt">International – restliche Welt</option>
          </select>
        </label>

        {art === 'ff-guthaben' && region === 'national' && (
          <p className="mt-4 text-xs text-green-700 bg-green-50 rounded-lg p-3">
            Hinweis: Zahlungen an Freunde &amp; Familie im Inland mit PayPal-Guthaben oder Bankkonto sind
            kostenlos – es fallen keine Gebühren an.
          </p>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        {modus === 'empfaenger' ? (
          <>
            <h3 className="text-sm font-medium text-blue-100 mb-1">Das kommt bei Ihnen an</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{euro(auszahlung)}</span>
                <span className="text-xl text-blue-200">€</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Gesendeter Betrag</span>
                  <span className="font-bold">{euro(eingabe)} €</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">PayPal-Gebühr</span>
                  <span className="text-xl font-bold">− {euro(gebuehrEmpf)} €</span>
                </div>
                <div className="text-xs text-blue-200 mt-1">
                  {gebuehrEmpf > 0
                    ? `entspricht ${euro(effektiverSatzEmpf)} % des Betrags`
                    : 'gebührenfrei'}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-medium text-blue-100 mb-1">So viel muss der Sender überweisen</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{euro(bruttoNoetig)}</span>
                <span className="text-xl text-blue-200">€</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Soll bei Ihnen ankommen</span>
                  <span className="font-bold">{euro(eingabe)} €</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">+ PayPal-Gebühr</span>
                  <span className="text-xl font-bold">{euro(gebuehrRueck)} €</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-4 text-xs text-blue-200">
          Tarif: {prozent.toLocaleString('de-DE', { maximumFractionDigits: 2 })} %
          {fest > 0 ? ` + ${euro(fest)} € Festgebühr` : ''}
          {intlFF ? ` (min. ${euro(FF_INTL_MIN)} € / max. ${euro(FF_INTL_MAX)} €)` : ''}
        </div>
      </div>

      {/* Tarif-Übersicht */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📊 Aktuelle PayPal-Gebühren (Deutschland)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-2 font-medium">Art</th>
                <th className="py-2 px-2 font-medium">National</th>
                <th className="py-2 pl-2 font-medium">International</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2 font-medium">Waren &amp; Dienstl.</td>
                <td className="py-2 px-2">2,49 % + 0,35 €</td>
                <td className="py-2 pl-2">+0 % (EWR) bis +2,99 % (Welt)</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 pr-2 font-medium">F&amp;F (Guthaben/Bank)</td>
                <td className="py-2 px-2 text-green-700">kostenlos</td>
                <td className="py-2 pl-2">5 % (0,99–3,99 €)</td>
              </tr>
              <tr>
                <td className="py-2 pr-2 font-medium">F&amp;F (Kreditkarte)</td>
                <td className="py-2 px-2">2,9 %</td>
                <td className="py-2 pl-2">5 % (0,99–3,99 €)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Stand: PayPal-Gebührenseite, zuletzt aktualisiert am 30. April 2026. Bei
          Währungsumrechnung kommen zusätzlich 3 % über dem Basiswechselkurs hinzu (hier nicht
          einberechnet).
        </p>
      </div>

      {/* So funktioniert's */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Die Gebühr trägt immer der <strong>Empfänger</strong> – PayPal zieht sie vom gesendeten
              Betrag ab.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Käuferschutz</strong> gibt es nur bei „Waren &amp; Dienstleistungen", nicht bei
              „Freunde &amp; Familie".
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Mit dem Modus <strong>„Wie viel senden lassen?"</strong> berechnen Sie den
              Brutto-Betrag, damit nach Abzug der Gebühr Ihr Wunschbetrag ankommt.
            </span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.paypal.com/de/business/paypal-business-fees"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            PayPal – Händler- und Verkäufergebühren (Waren &amp; Dienstleistungen)
          </a>
          <a
            href="https://www.paypal.com/de/digital-wallet/paypal-consumer-fees"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            PayPal – Verbrauchergebühren (Geld senden, Freunde &amp; Familie)
          </a>
        </div>
      </div>
    </div>
  );
}
