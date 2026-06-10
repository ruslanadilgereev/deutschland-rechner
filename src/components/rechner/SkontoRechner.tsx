import { useState } from 'react';

// Skonto – kaufmännische Standardformel
// Skontobetrag = Rechnungsbetrag × Skontosatz
// Zahlbetrag   = Rechnungsbetrag − Skontobetrag
// Effektiver Jahreszins des Lieferantenkredits = Skontosatz / (Zahlungsziel − Skontofrist) × 360
// Quelle: impulse.de, lexware.de, controllingportal.de

const EUR = (n: number) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PCT = (n: number) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function SkontoRechner() {
  const [betrag, setBetrag] = useState(1190);
  const [skontoProzent, setSkontoProzent] = useState(2);
  const [zahlungsziel, setZahlungsziel] = useState(30);
  const [skontofrist, setSkontofrist] = useState(10);

  // Vergleichszinssatz für den Bankkredit (Kontokorrent / Dispo)
  const [kreditzins, setKreditzins] = useState(9);

  const skontoBetrag = betrag * (skontoProzent / 100);
  const zahlbetrag = betrag - skontoBetrag;

  const kreditzeitraum = zahlungsziel - skontofrist;
  const gueltigerZeitraum = kreditzeitraum > 0;

  // Effektiver Jahreszins des Lieferantenkredits (360-Tage-Konvention)
  const effektivzins = gueltigerZeitraum
    ? (skontoProzent / kreditzeitraum) * 360
    : 0;

  const lohntSich = gueltigerZeitraum && effektivzins > kreditzins;

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="space-y-5">
          <label className="block">
            <span className="text-gray-700 font-medium">Rechnungsbetrag</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={betrag}
                onChange={(e) => setBetrag(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Brutto oder netto – das Ergebnis ist anteilig identisch
            </span>
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">Skontosatz</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step={0.1}
                value={skontoProzent}
                onChange={(e) =>
                  setSkontoProzent(Math.min(100, Math.max(0, Number(e.target.value))))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">Üblich sind 1–3 %</span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700 font-medium">Skontofrist</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={skontofrist}
                  onChange={(e) => setSkontofrist(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-14 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Tage
                </span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Zahlung mit Skonto</span>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Zahlungsziel</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={zahlungsziel}
                  onChange={(e) => setZahlungsziel(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-14 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Tage
                </span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Zahlung ohne Skonto</span>
            </label>
          </div>

          <label className="block">
            <span className="text-gray-700 font-medium">Vergleichszins (Bankkredit / Dispo)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={kreditzins}
                onChange={(e) => setKreditzins(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Zinssatz, zu dem Sie sich Geld leihen könnten
            </span>
          </label>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Ihr Zahlbetrag mit Skonto</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{EUR(zahlbetrag)}</span>
            <span className="text-xl text-blue-200">€</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Sie sparen (Skontobetrag)</span>
              <span className="text-xl font-bold">{EUR(skontoBetrag)} €</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Effektiver Jahreszins</span>
              <span className="text-xl font-bold">
                {gueltigerZeitraum ? `${PCT(effektivzins)} %` : '–'}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              des Lieferantenkredits (360-Tage-Basis)
            </p>
          </div>
        </div>
      </div>

      {/* Bewertung */}
      {gueltigerZeitraum ? (
        <div
          className={`mt-6 rounded-2xl shadow-lg p-6 ${
            lohntSich ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-2xl">{lohntSich ? '✅' : '🤔'}</span>
            {lohntSich ? 'Skonto ziehen lohnt sich' : 'Genau prüfen'}
          </h3>
          {lohntSich ? (
            <p className="text-sm text-gray-700">
              Der effektive Jahreszins des Lieferantenkredits ({PCT(effektivzins)} %) liegt
              <strong> über</strong> Ihrem Vergleichszins von {PCT(kreditzins)} %. Es ist günstiger,
              früh zu zahlen – notfalls sogar über den Dispo finanziert. Wer auf das Skonto
              verzichtet, „bezahlt“ den Lieferantenkredit mit {PCT(effektivzins)} % pro Jahr.
            </p>
          ) : (
            <p className="text-sm text-gray-700">
              Der effektive Jahreszins ({PCT(effektivzins)} %) liegt
              <strong> unter</strong> Ihrem Vergleichszins von {PCT(kreditzins)} %. Hier kann es
              sinnvoll sein, das volle Zahlungsziel auszunutzen und das Geld anderweitig einzusetzen.
              Solche Konstellationen sind aber selten – meist liegt der Skonto-Effektivzins deutlich
              höher als jeder Kredit.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl shadow-lg p-6 bg-red-50 border border-red-200">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Eingaben prüfen
          </h3>
          <p className="text-sm text-gray-700">
            Das Zahlungsziel muss <strong>größer</strong> als die Skontofrist sein, sonst gibt es
            keinen Kreditzeitraum, für den sich ein Jahreszins berechnen lässt.
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So rechnet der Skonto-Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Skontobetrag</strong> = Rechnungsbetrag × Skontosatz
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Zahlbetrag</strong> = Rechnungsbetrag − Skontobetrag
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Effektiver Jahreszins</strong> = Skontosatz ÷ (Zahlungsziel − Skontofrist) × 360
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Wer das Skonto nicht zieht, gewährt dem Lieferanten faktisch einen teuren Kredit – der
              Effektivzins liegt fast immer weit über dem Bankzins.
            </span>
          </li>
        </ul>
      </div>

      {/* Brutto/Netto-Hinweis */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧾 Brutto oder netto?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-blue-800">Beide Wege führen zum gleichen Ergebnis</p>
              <p className="text-blue-700">
                Sie können den Skontosatz vom Netto- oder vom Bruttobetrag abziehen – prozentual ist
                das Ergebnis identisch. Im B2B wird buchhalterisch meist vom Nettobetrag gerechnet, in
                der Praxis oft direkt vom Bruttobetrag.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Umsatzsteuer korrigieren</p>
              <p className="text-yellow-700">
                Bei Skontoabzug ändert sich auch die Bemessungsgrundlage für die{' '}
                <a
                  href="/mehrwertsteuer-rechner"
                  className="underline hover:text-yellow-900"
                >
                  Umsatzsteuer
                </a>
                . Lieferant und Kunde müssen Vorsteuer bzw. Umsatzsteuer entsprechend anpassen (§ 17
                UStG).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
