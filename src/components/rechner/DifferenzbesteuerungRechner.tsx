import { useState, useMemo } from 'react';

// Differenzbesteuerung nach § 25a UStG (Stand 2026)
// Die Umsatzsteuer wird ausschließlich aus der MARGE herausgerechnet, nicht aus dem vollen Verkaufspreis.
// Marge = Verkaufspreis (VK) − Einkaufspreis (EK)
// Enthaltene USt = Marge × 19/119
// Netto-Marge (Rohgewinn vor sonstigen Kosten) = Marge − USt
// KEIN ermäßigter Steuersatz von 7 % bei der Differenzbesteuerung.
// Quelle: https://www.gesetze-im-internet.de/ustg_1980/__25a.html
const UST_SATZ = 0.19;
const UST_HERAUSRECHNEN = 19 / 119; // ≈ 0,159664

export default function DifferenzbesteuerungRechner() {
  const [einkaufspreis, setEinkaufspreis] = useState(2000);
  const [verkaufspreis, setVerkaufspreis] = useState(3000);

  const ergebnis = useMemo(() => {
    // === 1. Marge (Differenz) ermitteln ===
    const margeRoh = verkaufspreis - einkaufspreis;
    // Negative Marge: bei Verlust fällt keine Umsatzsteuer an (Bemessungsgrundlage = 0)
    const istVerlust = margeRoh < 0;
    const marge = Math.max(0, margeRoh);

    // === 2. Enthaltene Umsatzsteuer aus der Marge herausrechnen (19/119) ===
    const enthalteneUst = marge * UST_HERAUSRECHNEN;

    // === 3. Netto-Marge (Rohgewinn vor sonstigen Kosten) ===
    const nettoMarge = marge - enthalteneUst;

    // === 4. Vergleich: Regelbesteuerung (USt aus vollem VK, nur informativ) ===
    const ustRegelbesteuerung = verkaufspreis * UST_HERAUSRECHNEN;
    const ustErsparnis = ustRegelbesteuerung - enthalteneUst;

    return {
      einkaufspreis,
      verkaufspreis,
      margeRoh,
      marge,
      istVerlust,
      enthalteneUst,
      nettoMarge,
      ustRegelbesteuerung,
      ustErsparnis,
    };
  }, [einkaufspreis, verkaufspreis]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Einkaufspreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Einkaufspreis (EK)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Preis, zu dem Sie den Gegenstand eingekauft haben (ohne offenen Vorsteuerausweis)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={einkaufspreis}
              onChange={(e) => setEinkaufspreis(Math.max(0, Number(e.target.value) || 0))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={einkaufspreis}
            onChange={(e) => setEinkaufspreis(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="0"
            max="20000"
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>10.000 €</span>
            <span>20.000 €</span>
          </div>
        </div>

        {/* Verkaufspreis */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Verkaufspreis (VK)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Preis, zu dem Sie den Gegenstand verkaufen (Endpreis an den Kunden)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={verkaufspreis}
              onChange={(e) => setVerkaufspreis(Math.max(0, Number(e.target.value) || 0))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={verkaufspreis}
            onChange={(e) => setVerkaufspreis(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="0"
            max="20000"
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>10.000 €</span>
            <span>20.000 €</span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🔄 Abzuführende Umsatzsteuer (aus der Marge)</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.enthalteneUst)}</span>
          </div>
          <p className="text-emerald-100 mt-2 text-sm">
            19 % herausgerechnet aus einer Marge von {formatEuro(ergebnis.marge)}
          </p>
        </div>

        {ergebnis.istVerlust && (
          <div className="bg-white/15 rounded-xl p-3 mb-4 text-sm">
            ⚠️ Verkaufspreis liegt unter dem Einkaufspreis: Die Marge ist negativ, daher fällt
            keine Umsatzsteuer an (Bemessungsgrundlage 0 €). Ein Verlust mindert nicht die Marge
            anderer Verkäufe (Einzeldifferenz).
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Marge (Differenz)</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.marge)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Netto-Marge (vor Kosten)</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.nettoMarge)}</div>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            1. Marge ermitteln
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Verkaufspreis (VK)</span>
            <span className="font-bold text-gray-900">{formatEuro(verkaufspreis)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-emerald-600">
            <span>− Einkaufspreis (EK)</span>
            <span>{formatEuro(einkaufspreis)}</span>
          </div>
          <div className="flex justify-between py-2 bg-emerald-50 -mx-6 px-6">
            <span className="font-medium text-emerald-700">= Marge (Differenz)</span>
            <span className="font-bold text-emerald-900">{formatEuro(ergebnis.marge)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            2. Umsatzsteuer aus der Marge herausrechnen
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Marge × 19 / 119</span>
            <span className="text-gray-900">{formatEuro(ergebnis.marge)} × 19/119</span>
          </div>
          <div className="flex justify-between py-2 bg-emerald-100 -mx-6 px-6">
            <span className="font-bold text-emerald-800">= Enthaltene Umsatzsteuer (19 %)</span>
            <span className="font-bold text-2xl text-emerald-900">{formatEuro(ergebnis.enthalteneUst)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            3. Netto-Marge (Rohgewinn vor sonstigen Kosten)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Marge − enthaltene Umsatzsteuer</span>
            <span className="text-gray-900">
              {formatEuro(ergebnis.marge)} − {formatEuro(ergebnis.enthalteneUst)}
            </span>
          </div>
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6 rounded-b-xl">
            <span className="font-medium text-gray-700">= Netto-Marge</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.nettoMarge)}</span>
          </div>
        </div>

        {ergebnis.marge > 0 && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl text-sm text-emerald-800">
            💡 <strong>Vergleich zur Regelbesteuerung:</strong> Bei normaler Besteuerung müssten
            Sie die Umsatzsteuer aus dem vollen Verkaufspreis abführen, also{' '}
            {formatEuro(ergebnis.ustRegelbesteuerung)}. Durch die Differenzbesteuerung führen Sie
            nur {formatEuro(ergebnis.enthalteneUst)} ab – eine Differenz von{' '}
            {formatEuro(ergebnis.ustErsparnis)}. Dafür dürfen Sie aus dem Einkauf aber keine
            Vorsteuer ziehen.
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Differenzbesteuerung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Nur die Marge zählt:</strong> Die Umsatzsteuer wird ausschließlich aus
            der Differenz zwischen Verkaufs- und Einkaufspreis berechnet, nicht aus dem vollen
            Verkaufspreis.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Immer 19 %:</strong> Auch wenn die Ware selbst dem ermäßigten Satz
            unterläge – bei der Differenzbesteuerung gilt stets der Regelsteuersatz von 19 %.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kein Vorsteuerabzug:</strong> Aus dem Einkauf darf keine Vorsteuer
            gezogen werden – die Ware wird ohne ausgewiesene Umsatzsteuer eingekauft.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kein USt-Ausweis in der Rechnung:</strong> In der Verkaufsrechnung darf
            die Umsatzsteuer nicht offen ausgewiesen werden; es ist auf die Sonderregelung
            hinzuweisen.</span>
          </li>
        </ul>
      </div>

      {/* Wer & Wofür */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">👥 Für wen gilt § 25a UStG?</h3>
        <div className="space-y-3 text-sm text-emerald-700">
          <p>Die Differenzbesteuerung gilt für <strong>Wiederverkäufer</strong> (gewerbliche
          Händler), die bewegliche körperliche Gegenstände einkaufen und wiederverkaufen –
          typischerweise:</p>
          <ul className="space-y-1 pl-4">
            <li>• Gebrauchtwagenhändler</li>
            <li>• Antiquitäten- und Kunsthändler</li>
            <li>• An- und Verkauf, Second-Hand-Läden, Trödel</li>
            <li>• Händler für gebrauchte Elektronik, Möbel, Sammlerstücke</li>
          </ul>
          <div className="bg-white/50 rounded-xl p-4 mt-3">
            <p className="font-semibold text-emerald-800 mb-2">Voraussetzung:</p>
            <p>Der Gegenstand wurde <strong>ohne Vorsteuerabzug</strong> eingekauft – z. B. von
            Privatpersonen, Kleinunternehmern oder anderen Differenzbesteuerern.</p>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise & Sonderfälle</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Pauschalmarge bei Kleinbeträgen:</strong> Liegt der Einkaufspreis bei
            höchstens 500 €, darf die Marge pauschal mit der Gesamtdifferenz ermittelt werden. Diesen
            Sonderfall bildet der Rechner nicht ab.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Gesamtdifferenz:</strong> Für bestimmte Gegenstände kann die Marge über
            alle Käufe und Verkäufe eines Zeitraums gebildet werden (Gesamtdifferenzbesteuerung) –
            ebenfalls nicht abgebildet.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>EU-Fälle & innergemeinschaftliche Lieferungen:</strong> Bei
            grenzüberschreitenden Sachverhalten gelten besondere Regeln. Bitte den Steuerberater
            einbeziehen.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Verzicht möglich:</strong> Der Händler kann pro Gegenstand statt der
            Differenzbesteuerung die Regelbesteuerung wählen – das kann bei B2B-Verkäufen mit
            vorsteuerabzugsberechtigten Kunden günstiger sein.</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 text-sm text-gray-600">
        <p>
          <strong>Hinweis:</strong> Dieser Rechner liefert eine Schätzung ohne Gewähr und ersetzt
          keine Steuerberatung. Die konkrete steuerliche Behandlung hängt vom Einzelfall ab. Für
          eine verbindliche Auskunft wenden Sie sich bitte an Ihr Finanzamt oder einen
          Steuerberater.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/ustg_1980/__25a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 25a UStG – Differenzbesteuerung (Gesetze im Internet)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/ustg_1980/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Umsatzsteuergesetz (UStG) – Gesetze im Internet
          </a>
          <a
            href="https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Umsatzsteuer/umsatzsteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – Umsatzsteuer
          </a>
        </div>
      </div>
    </div>
  );
}
