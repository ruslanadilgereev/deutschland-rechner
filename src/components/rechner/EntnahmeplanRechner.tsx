import { useState } from 'react';

// Entnahmeplan / Kapitalverzehr (FIRE)
// Logik: monatliche Entnahme aus verzinstem Restkapital.
// Restkapital wird jeden Monat verzinst (i = Rendite p.a. / 12), danach Entnahme abgezogen.
// 4-%-Regel: Trinity-Studie (Cooley, Hubbard, Walz, 1998) – 4 % des Startkapitals pro Jahr.
// Quellen: zinsen-berechnen.de, finanztip.de, guidingdata.com (Trinity-Studie)

function formatEuro(n: number): string {
  return n.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function EntnahmeplanRechner() {
  const [startkapital, setStartkapital] = useState(500000);
  const [rendite, setRendite] = useState(5);
  const [entnahme, setEntnahme] = useState(2000);

  const monatszins = rendite / 100 / 12;

  // --- Dauer berechnen: Wie lange reicht das Kapital? ---
  // Simulation Monat für Monat (verzinstes Restkapital, dann Entnahme)
  let kapital = startkapital;
  let monate = 0;
  const maxMonate = 1200; // 100 Jahre Deckel
  const verlauf: { jahr: number; rest: number }[] = [];

  // Reicht die Verzinsung dauerhaft (ewige Entnahme)?
  const jaehrlicheZinsen = startkapital * (rendite / 100);
  const jaehrlicheEntnahme = entnahme * 12;
  const ewig = jaehrlicheZinsen >= jaehrlicheEntnahme && rendite > 0;

  if (!ewig) {
    while (kapital > 0 && monate < maxMonate) {
      kapital = kapital * (1 + monatszins) - entnahme;
      monate++;
      if (monate % 12 === 0) {
        verlauf.push({ jahr: monate / 12, rest: Math.max(0, kapital) });
      }
    }
  } else {
    // Verlauf bei ewiger Entnahme: Kapital bleibt stabil/wächst – nur grob zeigen
    let k = startkapital;
    for (let m = 1; m <= 360; m++) {
      k = k * (1 + monatszins) - entnahme;
      if (m % 12 === 0) verlauf.push({ jahr: m / 12, rest: Math.max(0, k) });
    }
  }

  const jahre = Math.floor(monate / 12);
  const restMonate = monate % 12;

  // --- 4-%-Regel: max. nachhaltige Entnahme nach Trinity-Studie ---
  const vierProzentJahr = startkapital * 0.04;
  const vierProzentMonat = vierProzentJahr / 12;
  // konservativere 3,5-%-Variante (für Deutschland/höhere Steuerlast oft empfohlen)
  const dreiKommaFuenfMonat = (startkapital * 0.035) / 12;

  // Maximaler Restkapital-Wert für die Balkenhöhe
  const maxRest = Math.max(startkapital, ...verlauf.map((v) => v.rest), 1);

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Ihre Eckdaten</h2>

        {/* Startkapital */}
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Startkapital</span>
          <div className="mt-1 relative">
            <input
              type="number"
              min={0}
              step={10000}
              value={startkapital}
              onChange={(e) => setStartkapital(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>

        {/* Rendite */}
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Erwartete Rendite pro Jahr</span>
          <div className="mt-1 relative">
            <input
              type="number"
              min={0}
              max={15}
              step={0.5}
              value={rendite}
              onChange={(e) => setRendite(Math.max(0, Math.min(15, Number(e.target.value))))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            Realistisch für ein breit gestreutes Aktien-Depot: ca. 5–7 % vor Inflation
          </span>
        </label>

        {/* Entnahme pro Monat */}
        <label className="block">
          <span className="text-gray-700 font-medium">Entnahme pro Monat</span>
          <div className="mt-1 relative">
            <input
              type="number"
              min={0}
              step={100}
              value={entnahme}
              onChange={(e) => setEntnahme(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </label>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-emerald-100 mb-1">So lange reicht Ihr Kapital</h3>

        <div className="mb-6">
          {ewig ? (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">unbegrenzt</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-4xl font-bold">{jahre}</span>
              <span className="text-xl text-emerald-100">
                {jahre === 1 ? 'Jahr' : 'Jahre'}
              </span>
              {restMonate > 0 && (
                <>
                  <span className="text-4xl font-bold">{restMonate}</span>
                  <span className="text-xl text-emerald-100">
                    {restMonate === 1 ? 'Monat' : 'Monate'}
                  </span>
                </>
              )}
            </div>
          )}
          {ewig && (
            <p className="text-sm text-emerald-100 mt-2">
              Die jährlichen Erträge ({formatEuro(jaehrlicheZinsen)} €) decken Ihre Entnahme
              ({formatEuro(jaehrlicheEntnahme)} €) vollständig – das Kapital bleibt erhalten oder wächst.
            </p>
          )}
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-emerald-100">Entnahme pro Monat</span>
            <span className="font-bold">{formatEuro(entnahme)} €</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-100">Entnahme pro Jahr</span>
            <span className="font-bold">{formatEuro(jaehrlicheEntnahme)} €</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-100">Entnahmequote (Jahr 1)</span>
            <span className="font-bold">
              {startkapital > 0
                ? ((jaehrlicheEntnahme / startkapital) * 100).toLocaleString('de-DE', {
                    maximumFractionDigits: 1,
                  })
                : '0'}{' '}
              %
            </span>
          </div>
        </div>
      </div>

      {/* 4-%-Regel Box */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Was die 4-%-Regel erlauben würde</h3>
        <p className="text-sm text-gray-600 mb-4">
          Nach der bekannten 4-%-Regel (Trinity-Studie) gilt eine Jahresentnahme von 4 % des
          Startkapitals als Faustwert, der ein Depot über rund 30 Jahre selten aufzehrt:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-xs text-emerald-700 uppercase font-semibold">4-%-Regel</p>
            <p className="text-2xl font-bold text-emerald-700">{formatEuro(vierProzentMonat)} €</p>
            <p className="text-xs text-emerald-600">pro Monat ({formatEuro(vierProzentJahr)} € / Jahr)</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-700 uppercase font-semibold">Konservativ (3,5 %)</p>
            <p className="text-2xl font-bold text-blue-700">{formatEuro(dreiKommaFuenfMonat)} €</p>
            <p className="text-xs text-blue-600">pro Monat – vorsichtiger Puffer</p>
          </div>
        </div>
        {entnahme > vierProzentMonat + 1 && startkapital > 0 && (
          <div className="mt-3 flex gap-2 p-3 bg-yellow-50 rounded-xl text-sm text-yellow-800">
            <span>⚠️</span>
            <span>
              Ihre Entnahme liegt über der 4-%-Marke. Das kann gut gehen – erhöht aber das Risiko,
              dass das Kapital schneller aufgebraucht ist, besonders bei schwachen Börsenjahren zu Beginn.
            </span>
          </div>
        )}
      </div>

      {/* Restkapital-Verlauf */}
      {verlauf.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 mb-1">📉 Restkapital-Verlauf</h3>
          <p className="text-xs text-gray-500 mb-4">
            {ewig
              ? 'Entwicklung über die ersten 30 Jahre (Kapital bleibt stabil)'
              : 'So schmilzt Ihr Kapital ab (jeweils zum Jahresende)'}
          </p>
          <div className="space-y-2">
            {verlauf
              .filter((_, idx) => verlauf.length <= 12 || idx % Math.ceil(verlauf.length / 12) === 0 || idx === verlauf.length - 1)
              .map((v) => (
                <div key={v.jahr} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 shrink-0">Jahr {v.jahr}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(2, (v.rest / maxRest) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-24 text-right shrink-0">
                    {formatEuro(v.rest)} €
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Inflations-Hinweis */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wichtig zu wissen</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>📈</span>
            <span>
              <strong>Inflation berücksichtigen:</strong> Rechnen Sie eher mit der{' '}
              <em>realen</em> Rendite (Rendite minus ca. 2 % Inflation). 2.000 € sind in 20 Jahren
              deutlich weniger wert als heute.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🎢</span>
            <span>
              <strong>Renditereihenfolge-Risiko:</strong> Fällt die Börse direkt zu Beginn der
              Entnahme, kann das Kapital trotz guter Durchschnittsrendite früher aufgebraucht sein.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🧾</span>
            <span>
              <strong>Steuern:</strong> Auf Kursgewinne fällt Abgeltungsteuer an – die
              Netto-Entnahme ist niedriger als hier dargestellt.
            </span>
          </li>
          <li className="flex gap-2">
            <span>📊</span>
            <span>
              Dieser Rechner nutzt eine <strong>konstante nominale Entnahme</strong> und eine feste
              Durchschnittsrendite – die Realität schwankt.
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <strong>⚠️ Keine Anlageberatung:</strong> Diese Berechnung dient nur zur Orientierung und
        ersetzt keine individuelle Finanz- oder Anlageberatung. Alle Angaben ohne Gewähr.
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.finanztip.de/rechner/entnahmerechner/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Finanztip – Entnahmerechner & Methodik
          </a>
          <a
            href="https://www.zinsen-berechnen.de/entnahmeplan.php"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            zinsen-berechnen.de – Entnahmeplan aus verzinstem Kapital
          </a>
          <a
            href="https://guidingdata.com/trinity-studie-4-prozent-regel/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GuidingData – Trinity-Studie & 4-Prozent-Regel
          </a>
        </div>
      </div>
    </div>
  );
}
