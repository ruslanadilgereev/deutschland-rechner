import { useState } from 'react';

// Kleinunternehmerregelung § 19 UStG – Stand seit 01.01.2025 (Reform durch JStG 2024)
// Quelle: § 19 UStG / BMF-Schreiben vom 18.03.2025
const GRENZE_VORJAHR = 25000; // € Gesamtumsatz Vorjahr (netto), vorher 22.000 €
const GRENZE_LAUFEND = 100000; // € Gesamtumsatz laufendes Jahr (netto), vorher 50.000 € (Prognose)

function formatEuro(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function KleinunternehmerRechner() {
  const [vorjahr, setVorjahr] = useState<string>('18000');
  const [laufend, setLaufend] = useState<string>('30000');
  const [istNeugruendung, setIstNeugruendung] = useState(false);

  const vorjahrNum = parseFloat(vorjahr.replace(',', '.')) || 0;
  const laufendNum = parseFloat(laufend.replace(',', '.')) || 0;

  // Vorjahresprüfung entfällt bei Neugründung (kein Vorjahr vorhanden)
  const vorjahrUeberschritten = !istNeugruendung && vorjahrNum > GRENZE_VORJAHR;
  const laufendUeberschritten = laufendNum > GRENZE_LAUFEND;

  // Im Gründungsjahr gilt für den laufenden Umsatz die 25.000-€-Grenze
  // (die obere 100.000-€-Grenze wird zusätzlich oben über laufendUeberschritten erfasst).
  const gruendungUeberschritten = istNeugruendung && laufendNum > GRENZE_VORJAHR;

  const istKleinunternehmer = !vorjahrUeberschritten && !laufendUeberschritten && !gruendungUeberschritten;

  // Grund der Ablehnung bestimmen
  let ablehnungsGrund = '';
  if (laufendUeberschritten) {
    ablehnungsGrund = 'laufend';
  } else if (gruendungUeberschritten) {
    ablehnungsGrund = 'gruendung';
  } else if (vorjahrUeberschritten) {
    ablehnungsGrund = 'vorjahr';
  }

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Ihre Umsätze</h2>

        {/* Neugründung Toggle */}
        <label className="flex items-center gap-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={istNeugruendung}
            onChange={(e) => setIstNeugruendung(e.target.checked)}
            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Ich gründe <strong>dieses Jahr neu</strong> (kein Vorjahresumsatz)
          </span>
        </label>

        {!istNeugruendung && (
          <label className="block mb-5">
            <span className="text-gray-700 font-medium">Gesamtumsatz Vorjahr (netto)</span>
            <div className="mt-2 relative">
              <input
                type="text"
                inputMode="decimal"
                value={vorjahr}
                onChange={(e) => setVorjahr(e.target.value.replace(/[^0-9.,]/g, ''))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z. B. 18000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">Grenze: höchstens {formatEuro(GRENZE_VORJAHR)} €</span>
          </label>
        )}

        <label className="block">
          <span className="text-gray-700 font-medium">Erwarteter Umsatz laufendes Jahr (netto)</span>
          <div className="mt-2 relative">
            <input
              type="text"
              inputMode="decimal"
              value={laufend}
              onChange={(e) => setLaufend(e.target.value.replace(/[^0-9.,]/g, ''))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="z. B. 30000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            Grenze: höchstens {formatEuro(istNeugruendung ? GRENZE_VORJAHR : GRENZE_LAUFEND)} €
            {istNeugruendung && ' (Gründungsjahr)'}
          </span>
        </label>
      </div>

      {/* Result Section */}
      <div
        className={`rounded-2xl shadow-lg p-6 text-white ${
          istKleinunternehmer
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-orange-500 to-red-600'
        }`}
      >
        <h3 className="text-sm font-medium text-white/80 mb-1">Ihr Ergebnis</h3>

        <div className="mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{istKleinunternehmer ? '✅' : '⚠️'}</span>
            <div>
              <div className="text-2xl font-bold">
                {istKleinunternehmer ? 'Kleinunternehmer möglich' : 'Kein Kleinunternehmer'}
              </div>
              <div className="text-sm text-white/80">
                {istKleinunternehmer
                  ? 'Sie können die Kleinunternehmerregelung nutzen'
                  : 'Die Regelbesteuerung greift'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-sm space-y-2">
          {istKleinunternehmer ? (
            <>
              <p>
                Beide Umsatzgrenzen werden eingehalten. Sie können nach
                <strong> § 19 UStG</strong> als Kleinunternehmer auftreten:
              </p>
              <ul className="space-y-1 mt-2">
                <li className="flex gap-2"><span>•</span><span><strong>Keine Umsatzsteuer</strong> auf Ihren Rechnungen ausweisen</span></li>
                <li className="flex gap-2"><span>•</span><span><strong>Kein Vorsteuerabzug</strong> aus Eingangsrechnungen</span></li>
                <li className="flex gap-2"><span>•</span><span>Hinweis auf der Rechnung: „Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.“</span></li>
                <li className="flex gap-2"><span>•</span><span>Keine Umsatzsteuer-Voranmeldung nötig</span></li>
              </ul>
            </>
          ) : (
            <>
              {ablehnungsGrund === 'laufend' && (
                <p>
                  Ihr erwarteter Umsatz von <strong>{formatEuro(laufendNum)} €</strong> überschreitet die
                  obere Grenze von {formatEuro(GRENZE_LAUFEND)} € im laufenden Jahr. Seit 2025 endet die
                  Kleinunternehmer-Eigenschaft <strong>sofort</strong> ab dem Umsatz, mit dem die Grenze
                  überschritten wird (Fallbeil-Effekt). Ab diesem Umsatz gilt die Regelbesteuerung.
                </p>
              )}
              {ablehnungsGrund === 'gruendung' && (
                <p>
                  Im <strong>Gründungsjahr</strong> darf Ihr Umsatz {formatEuro(GRENZE_VORJAHR)} € nicht
                  überschreiten. Mit erwarteten <strong>{formatEuro(laufendNum)} €</strong> liegen Sie
                  darüber – ab dem Umsatz, der die Grenze überschreitet, gilt die Regelbesteuerung. Die
                  bis dahin erzielten Umsätze bleiben steuerfrei.
                </p>
              )}
              {ablehnungsGrund === 'vorjahr' && (
                <p>
                  Ihr Vorjahresumsatz von <strong>{formatEuro(vorjahrNum)} €</strong> liegt über der Grenze
                  von {formatEuro(GRENZE_VORJAHR)} €. Damit sind Sie im laufenden Jahr
                  <strong> kein Kleinunternehmer</strong> mehr – Sie müssen Umsatzsteuer ausweisen,
                  können aber auch Vorsteuer abziehen.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Grenzen-Übersicht */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📊 Ihre Werte im Check</h3>
        <div className="space-y-3 text-sm">
          {!istNeugruendung && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="font-medium text-gray-800">Vorjahr</p>
                <p className="text-xs text-gray-500">Grenze {formatEuro(GRENZE_VORJAHR)} €</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{formatEuro(vorjahrNum)} €</p>
                <p className={`text-xs font-medium ${vorjahrUeberschritten ? 'text-red-600' : 'text-green-600'}`}>
                  {vorjahrUeberschritten ? 'überschritten' : 'eingehalten'}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
            <div>
              <p className="font-medium text-gray-800">{istNeugruendung ? 'Gründungsjahr' : 'Laufendes Jahr'}</p>
              <p className="text-xs text-gray-500">Grenze {formatEuro(istNeugruendung ? GRENZE_VORJAHR : GRENZE_LAUFEND)} €</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{formatEuro(laufendNum)} €</p>
              <p className={`text-xs font-medium ${(laufendUeberschritten || gruendungUeberschritten) ? 'text-red-600' : 'text-green-600'}`}>
                {(laufendUeberschritten || gruendungUeberschritten) ? 'überschritten' : 'eingehalten'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Prüfung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Der <strong>Vorjahresumsatz</strong> darf höchstens {formatEuro(GRENZE_VORJAHR)} € betragen (seit 2025, vorher 22.000 €).</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Der Umsatz im <strong>laufenden Jahr</strong> darf {formatEuro(GRENZE_LAUFEND)} € nicht überschreiten (vorher 50.000 € als Prognose).</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Beide Grenzen werden seit 2025 <strong>netto</strong> betrachtet (vorher brutto).</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Beim Überschreiten der oberen Grenze endet die Kleinunternehmer-Eigenschaft <strong>sofort</strong>.</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <div className="flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <p>
            <strong>Hinweis:</strong> Dieser Rechner liefert eine erste Orientierung ohne Gewähr und
            ersetzt keine Steuerberatung. Sonderfälle (z. B. innergemeinschaftliche Umsätze, steuerfreie
            Umsätze, Geschäftsveräußerung) bleiben unberücksichtigt. Im Zweifel wenden Sie sich an Ihr
            Finanzamt oder eine Steuerberaterin bzw. einen Steuerberater.
          </p>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/ustg_1980/__19.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 19 UStG – Besteuerung der Kleinunternehmer (gesetze-im-internet.de)
          </a>
          <a
            href="https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-03-18-sonderregelung-kleinunternehmer.pdf?__blob=publicationFile&v=3"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF-Schreiben vom 18.03.2025 – Sonderregelung für Kleinunternehmer
          </a>
        </div>
      </div>
    </div>
  );
}
