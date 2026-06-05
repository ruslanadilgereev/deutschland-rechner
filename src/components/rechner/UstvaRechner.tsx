import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Umsatzsteuer-Voranmeldung (Stand: 2026)
// Steuersätze: § 12 UStG – Regelsatz 19 %, ermäßigter Satz 7 %
// Abgaberhythmus nach Vorjahres-Zahllast: § 18 Abs. 2 UStG
//   > 9.000 € -> monatlich | 2.000-9.000 € -> vierteljährlich | <= 2.000 € -> nur Jahreserklärung
// Die 9.000-€-Grenze gilt seit 1.1.2025 (Viertes Bürokratieentlastungsgesetz, BEG IV).
// Quelle: § 18 UStG, ELSTER, BMF
const UST_19 = 0.19;
const UST_7 = 0.07;

function eur(n: number): string {
  return n.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseNum(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export function UstvaRechner() {
  const [umsatz19, setUmsatz19] = useState('10000');
  const [umsatz7, setUmsatz7] = useState('0');
  const [vorsteuer, setVorsteuer] = useState('1200');

  const netto19 = parseNum(umsatz19);
  const netto7 = parseNum(umsatz7);
  const vst = parseNum(vorsteuer);

  const ust19 = netto19 * UST_19;
  const ust7 = netto7 * UST_7;
  const ustGesamt = ust19 + ust7;

  const zahllast = ustGesamt - vst;
  const istErstattung = zahllast < 0;

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Umsatzsteuer-Voranmeldung-Rechner" rechnerSlug="ustva-rechner" />

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Ihre Angaben (Nettobeträge)</h2>

        <label className="block mb-4">
          <span className="text-gray-700 font-medium text-sm">Umsätze zu 19 % (netto)</span>
          <div className="mt-1 relative">
            <input
              type="text"
              inputMode="decimal"
              value={umsatz19}
              onChange={(e) => setUmsatz19(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0,00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            enthaltene Umsatzsteuer: {eur(ust19)} €
          </span>
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 font-medium text-sm">Umsätze zu 7 % (netto)</span>
          <div className="mt-1 relative">
            <input
              type="text"
              inputMode="decimal"
              value={umsatz7}
              onChange={(e) => setUmsatz7(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0,00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            enthaltene Umsatzsteuer: {eur(ust7)} €
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium text-sm">Gezahlte Vorsteuer</span>
          <div className="mt-1 relative">
            <input
              type="text"
              inputMode="decimal"
              value={vorsteuer}
              onChange={(e) => setVorsteuer(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0,00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            Vorsteuer aus Eingangsrechnungen Ihrer Lieferanten und Dienstleister
          </span>
        </label>
      </div>

      {/* Result Section */}
      <div
        className={`rounded-2xl shadow-lg p-6 text-white ${
          istErstattung
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}
      >
        <h3 className="text-sm font-medium text-white/80 mb-1">
          {istErstattung ? 'Ihr Erstattungsanspruch' : 'Ihre Zahllast ans Finanzamt'}
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{eur(Math.abs(zahllast))}</span>
            <span className="text-xl text-white/70">€</span>
          </div>
          <p className="text-sm text-white/70 mt-1">
            {istErstattung
              ? 'Das Finanzamt erstattet Ihnen diesen Betrag (Vorsteuerüberhang).'
              : 'Diesen Betrag überweisen Sie ans Finanzamt.'}
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Umsatzsteuer (19 %)</span>
            <span className="font-medium">{eur(ust19)} €</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Umsatzsteuer (7 %)</span>
            <span className="font-medium">{eur(ust7)} €</span>
          </div>
          <div className="flex justify-between items-center border-t border-white/20 pt-2">
            <span className="text-white/80">Umsatzsteuer gesamt</span>
            <span className="font-medium">{eur(ustGesamt)} €</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">− abziehbare Vorsteuer</span>
            <span className="font-medium">{eur(vst)} €</span>
          </div>
          <div className="flex justify-between items-center border-t border-white/20 pt-2 font-bold">
            <span>{istErstattung ? 'Erstattung' : 'Zahllast'}</span>
            <span>
              {istErstattung ? '−' : ''}
              {eur(Math.abs(zahllast))} €
            </span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Berechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Zahllast = vereinnahmte Umsatzsteuer − gezahlte Vorsteuer</strong>
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Regelsteuersatz <strong>19 %</strong>, ermäßigter Satz <strong>7 %</strong> (§ 12 UStG)
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Ein negatives Ergebnis bedeutet einen <strong>Vorsteuerüberhang</strong> – das Finanzamt
              erstattet die Differenz
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Abgabe ausschließlich elektronisch über <strong>ELSTER</strong> (§ 18 Abs. 1 UStG)
            </span>
          </li>
        </ul>
      </div>

      {/* Abgaberhythmus */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📅 Wie oft müssen Sie abgeben?</h3>
        <p className="text-sm text-gray-600 mb-3">
          Der Voranmeldungszeitraum richtet sich nach der Umsatzsteuer-Zahllast des <strong>Vorjahres</strong>{' '}
          (§ 18 Abs. 2 UStG):
        </p>
        <div className="space-y-3 text-sm">
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="font-semibold text-blue-900">Mehr als 9.000 € Vorjahres-Zahllast</p>
            <p className="text-blue-700">→ monatliche Voranmeldung</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="font-semibold text-blue-900">2.000 € bis 9.000 € Vorjahres-Zahllast</p>
            <p className="text-blue-700">→ vierteljährliche Voranmeldung</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="font-semibold text-blue-900">Bis 2.000 € Vorjahres-Zahllast</p>
            <p className="text-blue-700">
              → das Finanzamt kann von der Voranmeldung befreien; dann genügt die Jahreserklärung
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Die 9.000-€-Grenze gilt seit dem 1.1.2025 (Viertes Bürokratieentlastungsgesetz, BEG IV);
          zuvor lag sie bei 7.500 €.
        </p>
      </div>

      {/* Frist & Dauerfristverlängerung */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">⏰ Frist & Dauerfristverlängerung</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">📌</span>
            <div>
              <p className="font-medium text-yellow-800">Frist: 10. des Folgemonats</p>
              <p className="text-yellow-700">
                Die Voranmeldung muss bis zum 10. Tag nach Ablauf des Voranmeldungszeitraums beim
                Finanzamt sein. Fällt der 10. auf Wochenende oder Feiertag, verschiebt sich die Frist
                auf den nächsten Werktag.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🗓️</span>
            <div>
              <p className="font-medium text-green-800">Dauerfristverlängerung: +1 Monat</p>
              <p className="text-green-700">
                Auf Antrag über ELSTER verlängert sich die Frist dauerhaft um einen Monat.
                Monatszahler leisten dafür einmal jährlich eine Sondervorauszahlung von{' '}
                <strong>1/11</strong> der Vorjahres-Zahllast (Anmeldung und Zahlung bis 10. Februar).
                Vierteljahreszahler zahlen keine Sondervorauszahlung.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <div className="flex gap-2">
          <span className="text-lg">⚠️</span>
          <p>
            <strong>Hinweis:</strong> Dieser Rechner liefert eine vereinfachte Schätzung der Zahllast
            und ersetzt keine Steuerberatung. Sonderfälle wie innergemeinschaftliche Erwerbe,
            Reverse-Charge (§ 13b UStG), Einfuhrumsatzsteuer, steuerfreie Umsätze oder die
            Kleinunternehmerregelung (§ 19 UStG) sind nicht berücksichtigt. Alle Angaben ohne Gewähr.
          </p>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/ustg_1980/__18.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 18 UStG – Besteuerungsverfahren (gesetze-im-internet.de)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/ustg_1980/__12.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 12 UStG – Steuersätze (19 % / 7 %)
          </a>
          <a
            href="https://www.elster.de/eportal/helpGlobal?themaGlobal=help_ustva"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ELSTER – Umsatzsteuer-Voranmeldung
          </a>
        </div>
      </div>
    </div>
  );
}

export default UstvaRechner;
