import { useState, useMemo } from 'react';

interface ZinsJahr {
  jahr: number;
  zinssatz: number;
}

// Historische Zinssätze für Spareinlagen mit 3-monatiger Kündigungsfrist
// Quelle: Deutsche Bundesbank
const historischeZinsen: ZinsJahr[] = [
  { jahr: 2024, zinssatz: 0.5 },
  { jahr: 2023, zinssatz: 0.4 },
  { jahr: 2022, zinssatz: 0.1 },
  { jahr: 2021, zinssatz: 0.01 },
  { jahr: 2020, zinssatz: 0.01 },
  { jahr: 2019, zinssatz: 0.05 },
  { jahr: 2018, zinssatz: 0.05 },
  { jahr: 2017, zinssatz: 0.05 },
  { jahr: 2016, zinssatz: 0.1 },
  { jahr: 2015, zinssatz: 0.2 },
  { jahr: 2014, zinssatz: 0.3 },
  { jahr: 2013, zinssatz: 0.4 },
  { jahr: 2012, zinssatz: 0.5 },
  { jahr: 2011, zinssatz: 0.7 },
  { jahr: 2010, zinssatz: 0.8 },
];

export default function MietkautionRechner() {
  // Eingabewerte
  const [kaltmiete, setKaltmiete] = useState(750);
  const [kautionMonate, setKautionMonate] = useState(3);
  const [mietbeginn, setMietbeginn] = useState(() => {
    const heute = new Date();
    return `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [mietende, setMietende] = useState('');
  const [zinssatz, setZinssatz] = useState(0.5);
  const [verwendeHistorisch, setVerwendeHistorisch] = useState(false);
  const [ratenzahlung, setRatenzahlung] = useState(false);

  const ergebnis = useMemo(() => {
    // Maximale Kaution nach §551 BGB: 3 Monats-Kaltmieten
    const maxKaution = kaltmiete * 3;
    const tatsaechlicheKaution = Math.min(kaltmiete * kautionMonate, maxKaution);
    
    // Ratenzahlung nach §551 Abs. 2 BGB
    const raten = ratenzahlung ? [
      { nr: 1, betrag: Math.ceil(tatsaechlicheKaution / 3 * 100) / 100 },
      { nr: 2, betrag: Math.ceil(tatsaechlicheKaution / 3 * 100) / 100 },
      { nr: 3, betrag: tatsaechlicheKaution - 2 * Math.ceil(tatsaechlicheKaution / 3 * 100) / 100 },
    ] : [];

    // Berechne Mietdauer
    const startDatum = new Date(mietbeginn);
    const endDatum = mietende ? new Date(mietende) : new Date();
    
    const diffMs = endDatum.getTime() - startDatum.getTime();
    const diffMonate = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44)));
    const diffJahre = diffMonate / 12;

    // Zinsberechnung mit Zinseszins
    let kapital = tatsaechlicheKaution;
    let gesamtZinsen = 0;
    const zinsentwicklung: { jahr: number; zinsen: number; kapital: number; zinssatz: number }[] = [];

    if (diffMonate > 0) {
      const startJahr = startDatum.getFullYear();
      const endJahr = endDatum.getFullYear();

      for (let jahr = startJahr; jahr <= endJahr; jahr++) {
        // Bestimme Zinssatz für dieses Jahr
        let jahresZins = zinssatz;
        if (verwendeHistorisch) {
          const historisch = historischeZinsen.find(z => z.jahr === jahr);
          jahresZins = historisch ? historisch.zinssatz : zinssatz;
        }

        // Wie viele Monate in diesem Jahr?
        const startMonat = jahr === startJahr ? startDatum.getMonth() : 0;
        const endMonat = jahr === endJahr ? endDatum.getMonth() : 11;
        const monateImJahr = endMonat - startMonat + 1;

        // Monatliche Verzinsung
        const monatszins = jahresZins / 100 / 12;
        const faktor = Math.pow(1 + monatszins, monateImJahr);
        const zinsenJahr = kapital * (faktor - 1);
        
        gesamtZinsen += zinsenJahr;
        kapital += zinsenJahr;

        zinsentwicklung.push({
          jahr,
          zinsen: zinsenJahr,
          kapital,
          zinssatz: jahresZins,
        });
      }
    }

    const gesamtRueckzahlung = tatsaechlicheKaution + gesamtZinsen;

    return {
      kaltmiete,
      maxKaution,
      tatsaechlicheKaution,
      kautionMonate: Math.min(kautionMonate, 3),
      raten,
      mietdauerMonate: diffMonate,
      mietdauerJahre: diffJahre,
      zinssatz,
      gesamtZinsen,
      gesamtRueckzahlung,
      zinsentwicklung,
      startDatum,
      endDatum: mietende ? endDatum : null,
    };
  }, [kaltmiete, kautionMonate, mietbeginn, mietende, zinssatz, verwendeHistorisch, ratenzahlung]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  const formatDatum = (d: Date) =>
    d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kaltmiete */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliche Kaltmiete (ohne Nebenkosten)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kaltmiete}
              onChange={(e) => setKaltmiete(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="5000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={kaltmiete}
            onChange={(e) => setKaltmiete(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="200"
            max="3000"
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>200 €</span>
            <span>1.500 €</span>
            <span>3.000 €</span>
          </div>
        </div>

        {/* Anzahl Monatsmieten als Kaution */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kaution in Monatsmieten</span>
            <span className="text-xs text-gray-500 block mt-1">Maximal 3 Kaltmieten nach §551 BGB</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((monate) => (
              <button
                key={monate}
                onClick={() => setKautionMonate(monate)}
                className={`py-4 px-4 rounded-xl transition-all ${
                  kautionMonate === monate
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-bold text-2xl block">{monate}</span>
                <span className="text-xs opacity-80">Monat{monate > 1 ? 'e' : ''}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ratenzahlung */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ratenzahlung}
              onChange={(e) => setRatenzahlung(e.target.checked)}
              className="w-5 h-5 rounded text-purple-500 focus:ring-purple-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Ratenzahlung (§551 Abs. 2 BGB)</span>
              <span className="text-xs text-gray-500 block">Kaution in 3 Raten zahlen</span>
            </div>
          </label>
        </div>

        {/* Mietbeginn */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Mietbeginn</span>
          </label>
          <input
            type="month"
            value={mietbeginn.slice(0, 7)}
            onChange={(e) => setMietbeginn(e.target.value + '-01')}
            className="w-full text-lg py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
          />
        </div>

        {/* Mietende (optional) */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Mietende (optional)</span>
            <span className="text-xs text-gray-500 block">Leer lassen für aktuelle Berechnung</span>
          </label>
          <input
            type="month"
            value={mietende ? mietende.slice(0, 7) : ''}
            onChange={(e) => setMietende(e.target.value ? e.target.value + '-01' : '')}
            className="w-full text-lg py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
          />
        </div>

        {/* Zinssatz */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">Zinssatz (p.a.)</span>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={verwendeHistorisch}
                onChange={(e) => setVerwendeHistorisch(e.target.checked)}
                className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500"
              />
              <span className="text-gray-600">Historische Zinsen</span>
            </label>
          </div>
          {!verwendeHistorisch ? (
            <>
              <div className="relative">
                <input
                  type="number"
                  value={zinssatz}
                  onChange={(e) => setZinssatz(Math.max(0, Math.min(5, Number(e.target.value))))}
                  className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                  min="0"
                  max="5"
                  step="0.01"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
              </div>
              <input
                type="range"
                value={zinssatz}
                onChange={(e) => setZinssatz(Number(e.target.value))}
                className="w-full mt-3 accent-purple-500"
                min="0"
                max="3"
                step="0.1"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Aktueller Durchschnitt 2024/2025: ca. 0,5% p.a.
              </p>
            </>
          ) : (
            <div className="bg-purple-50 rounded-xl p-4 text-sm">
              <p className="text-purple-800">
                📊 Historische Zinsen werden automatisch nach Jahr angewendet (Bundesbank-Daten).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🔐 Ihre Mietkaution</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.tatsaechlicheKaution)}</span>
          </div>
          <p className="text-purple-100 mt-1 text-sm">
            {ergebnis.kautionMonate} × {formatEuro(kaltmiete)} Kaltmiete
          </p>
        </div>

        {ratenzahlung && ergebnis.raten.length > 0 && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-4">
            <p className="text-sm font-medium mb-2">📅 Ratenzahlung nach §551 Abs. 2 BGB:</p>
            <div className="grid grid-cols-3 gap-2">
              {ergebnis.raten.map((rate) => (
                <div key={rate.nr} className="text-center">
                  <span className="text-xs opacity-70">Rate {rate.nr}</span>
                  <div className="font-bold">{formatEuro(rate.betrag)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Mietdauer</span>
            <div className="text-xl font-bold">
              {ergebnis.mietdauerMonate} Monate
            </div>
            <span className="text-xs opacity-70">
              ({ergebnis.mietdauerJahre.toFixed(1)} Jahre)
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Zinserträge</span>
            <div className="text-xl font-bold text-green-300">
              +{formatEuro(ergebnis.gesamtZinsen)}
            </div>
          </div>
        </div>

        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium">Rückzahlung bei Auszug:</span>
            <span className="text-2xl font-bold">{formatEuro(ergebnis.gesamtRueckzahlung)}</span>
          </div>
          <p className="text-xs opacity-70 mt-1">
            Kaution {formatEuro(ergebnis.tatsaechlicheKaution)} + Zinsen {formatEuro(ergebnis.gesamtZinsen)}
          </p>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Monatliche Kaltmiete</span>
            <span className="font-bold text-gray-900">{formatEuro(kaltmiete)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Maximale Kaution (§551 BGB)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.maxKaution)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Vereinbarte Kaution</span>
            <span className="font-bold text-purple-700">{formatEuro(ergebnis.tatsaechlicheKaution)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Mietbeginn</span>
            <span className="text-gray-900">{formatDatum(ergebnis.startDatum)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">{ergebnis.endDatum ? 'Mietende' : 'Berechnet bis'}</span>
            <span className="text-gray-900">
              {ergebnis.endDatum ? formatDatum(ergebnis.endDatum) : formatDatum(new Date())}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Mietdauer</span>
            <span className="text-gray-900">{ergebnis.mietdauerMonate} Monate</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Zinssatz (p.a.)</span>
            <span className="text-gray-900">
              {verwendeHistorisch ? 'Historisch (variabel)' : formatProzent(zinssatz)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>Aufgelaufene Zinsen</span>
            <span className="font-bold">+{formatEuro(ergebnis.gesamtZinsen)}</span>
          </div>
          <div className="flex justify-between py-3 bg-purple-50 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-purple-800">Gesamtrückzahlung</span>
            <span className="font-bold text-2xl text-purple-900">
              {formatEuro(ergebnis.gesamtRueckzahlung)}
            </span>
          </div>
        </div>
      </div>

      {/* Zinsentwicklung */}
      {ergebnis.zinsentwicklung.length > 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📈 Zinsentwicklung nach Jahren</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 text-gray-600">Jahr</th>
                  <th className="text-right py-2 text-gray-600">Zinssatz</th>
                  <th className="text-right py-2 text-gray-600">Zinsen</th>
                  <th className="text-right py-2 text-gray-600">Kapital</th>
                </tr>
              </thead>
              <tbody>
                {ergebnis.zinsentwicklung.map((zeile) => (
                  <tr key={zeile.jahr} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{zeile.jahr}</td>
                    <td className="text-right py-2">{formatProzent(zeile.zinssatz)}</td>
                    <td className="text-right py-2 text-green-600">+{formatEuro(zeile.zinsen)}</td>
                    <td className="text-right py-2 font-medium">{formatEuro(zeile.kapital)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gesetzliche Regelungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚖️ Gesetzliche Regelungen (§551 BGB)</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>📏</span>
            <span>
              <strong>Höchstgrenze:</strong> Maximal 3 Monats-Kaltmieten (ohne Nebenkosten).
              Eine höhere Kaution ist unwirksam.
            </span>
          </li>
          <li className="flex gap-2">
            <span>📅</span>
            <span>
              <strong>Ratenzahlung:</strong> Sie dürfen die Kaution in 3 gleichen Monatsraten
              zahlen. Die erste Rate ist zu Beginn des Mietverhältnisses fällig.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🏦</span>
            <span>
              <strong>Anlage:</strong> Der Vermieter muss die Kaution getrennt von seinem
              Vermögen bei einem Kreditinstitut anlegen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>💰</span>
            <span>
              <strong>Verzinsung:</strong> Die Kaution muss zum üblichen Zinssatz für
              Spareinlagen mit 3-monatiger Kündigungsfrist verzinst werden.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✅</span>
            <span>
              <strong>Zinsen gehören Ihnen:</strong> Die Zinsen stehen dem Mieter zu und
              erhöhen die Sicherheit.
            </span>
          </li>
        </ul>
      </div>

      {/* Rückzahlung */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-purple-800 mb-3">💡 Rückzahlung der Kaution</h3>
        <ul className="space-y-2 text-sm text-purple-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Frist:</strong> Der Vermieter hat nach Mietende eine "angemessene
              Prüfungsfrist" – in der Regel 3-6 Monate, maximal 12 Monate (BGH-Rechtsprechung).
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Abrechnung:</strong> Der Vermieter darf nur berechtigte Forderungen
              (offene Miete, Nebenkostenabrechnung, Schäden) von der Kaution abziehen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Zinsen:</strong> Bei Rückzahlung erhalten Sie die Kaution <em>inklusive</em>
              aller aufgelaufenen Zinsen und Zinseszinsen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Verjährung:</strong> Ihr Anspruch auf Rückzahlung verjährt nach 3 Jahren
              (ab Kenntnis des Anspruchs).
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Tipp:</strong> Dokumentieren Sie den Zustand der Wohnung bei Ein- und Auszug
              mit Fotos und Übergabeprotokoll!
            </span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Keine Verrechnung:</strong> Sie dürfen die letzte Miete nicht einfach
              mit der Kaution "verrechnen" – das ist ein Kündigungsgrund!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Kautionskonto:</strong> Fragen Sie Ihren Vermieter nach dem Nachweis
              der korrekten Anlage auf einem separaten Konto.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Insolvenz:</strong> Bei Insolvenz des Vermieters ist Ihre Kaution
              geschützt, wenn sie ordnungsgemäß angelegt wurde.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Alternativen:</strong> Statt Barkaution sind auch Mietkautionsbürgschaften
              oder Bankbürgschaften möglich.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Niedrigzinsphase:</strong> In der aktuellen Niedrigzinsphase sind die
              Zinserträge minimal – aber sie gehören trotzdem Ihnen!
            </span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde / Beratung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Beratung & Hilfe</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Mieterverein</p>
            <p className="text-sm text-purple-700 mt-1">
              Bei Streitigkeiten um die Kaution hilft Ihr örtlicher Mieterverein mit
              Rechtsberatung und ggf. Rechtsschutz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Deutscher Mieterbund</p>
                <a
                  href="https://www.mieterbund.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  www.mieterbund.de →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Verbraucherzentrale</p>
                <a
                  href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/wohnen-und-mieten"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Mietrecht-Ratgeber →
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-gray-800">Ihre Rechte nach §551 BGB</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Kaution max. 3 Monats-Kaltmieten</li>
                <li>• Ratenzahlung in 3 Monatsraten möglich</li>
                <li>• Getrennte Anlage vom Vermieter-Vermögen</li>
                <li>• Verzinsung mit Zinsen für Spareinlagen (3 Mo. Kündigungsfrist)</li>
                <li>• Zinsen gehören dem Mieter</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/bgb/__551.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §551 BGB – Begrenzung und Anlage von Mietsicherheiten
          </a>
          <a
            href="https://dejure.org/gesetze/BGB/551.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            dejure.org – §551 BGB mit Kommentierung
          </a>
          <a
            href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Bundesbank – Zinssätze Spareinlagen
          </a>
          <a
            href="https://www.mieterbund.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutscher Mieterbund – Mietrecht-Infos
          </a>
          <a
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/wohnen-und-mieten"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Wohnen & Mieten
          </a>
        </div>
      </div>
    </div>
  );
}
