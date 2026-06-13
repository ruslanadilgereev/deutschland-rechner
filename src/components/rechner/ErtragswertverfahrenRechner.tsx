import { useState, useMemo } from 'react';

// Ertragswertverfahren-Rechner
// Allgemeines Ertragswertverfahren nach ImmoWertV 2022 (§§ 27, 28, 31, 32, 34):
//   1. Reinertrag           = Jahresrohertrag − Bewirtschaftungskosten            (§ 31 Abs. 1)
//   2. Bodenwertverzinsung  = Bodenwert × (Liegenschaftszins / 100)               (§ 28)
//   3. Gebäudereinertrag    = Reinertrag − Bodenwertverzinsung                     (§ 28)
//   4. Vervielfältiger V    = (1 − (1 + p)^(−n)) / p   mit p = LZ/100, n = RND     (§ 34 Abs. 2)
//   5. Gebäudeertragswert   = Gebäudereinertrag × V                                (§ 28)
//   6. Ertragswert          = Gebäudeertragswert + Bodenwert                       (§ 28)
//
// § 34 Abs. 2 ImmoWertV: jährlich nachschüssiger Rentenbarwertfaktor
//   [(1+p)^n − 1] / [p · (1+p)^n] ≡ (1 − (1+p)^(−n)) / p (algebraisch identisch).
// Der Liegenschaftszinssatz (§ 21, § 33 ImmoWertV) wird vom Gutachterausschuss
// aus der Kaufpreissammlung abgeleitet und ist als Eingabewert objektbezogen zu übernehmen.
// Quellen: §§ 27, 28, 31, 32, 21, 33, 34 ImmoWertV 2022.

export default function ErtragswertverfahrenRechner() {
  // Eingabewerte (Default-Beispiel: Ertragswert ca. 536.000 €)
  const [jahresrohertrag, setJahresrohertrag] = useState(30000);
  const [bewirtschaftungskosten, setBewirtschaftungskosten] = useState(5000);
  const [bodenwert, setBodenwert] = useState(200000);
  const [liegenschaftszins, setLiegenschaftszins] = useState(4.0);
  const [restnutzungsdauer, setRestnutzungsdauer] = useState(40);

  const ergebnis = useMemo(() => {
    const p = liegenschaftszins / 100;
    const n = restnutzungsdauer;

    // 1. Reinertrag (§ 31 Abs. 1)
    const reinertrag = jahresrohertrag - bewirtschaftungskosten;

    // 2. Bodenwertverzinsung (§ 28 – derselbe Liegenschaftszins)
    const bodenwertverzinsung = bodenwert * p;

    // 3. Gebäudereinertrag (§ 28)
    const gebaeudereinertrag = reinertrag - bodenwertverzinsung;

    // 4. Vervielfältiger / Barwertfaktor (§ 34 Abs. 2); Sonderfall p = 0 → V = n
    const vervielfaeltiger = p > 0 ? (1 - Math.pow(1 + p, -n)) / p : n;

    // 5. Gebäudeertragswert (§ 28 – Kapitalisierung über die Restnutzungsdauer)
    const gebaeudeertragswert = gebaeudereinertrag * vervielfaeltiger;

    // 6. Ertragswert (§ 28)
    const ertragswert = gebaeudeertragswert + bodenwert;

    // Hinweis-Flags
    const negativerGebaeudeanteil = gebaeudereinertrag <= 0;

    return {
      reinertrag,
      bodenwertverzinsung,
      gebaeudereinertrag,
      vervielfaeltiger,
      gebaeudeertragswert,
      ertragswert,
      negativerGebaeudeanteil,
    };
  }, [jahresrohertrag, bewirtschaftungskosten, bodenwert, liegenschaftszins, restnutzungsdauer]);

  const formatEuro = (n: number) =>
    Math.round(n).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toFixed(1).replace('.', ',') + ' %';
  const formatFaktor = (n: number) => n.toFixed(2).replace('.', ',');

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Ihre Immobilie</h2>

        {/* Jahresrohertrag */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jahresrohertrag (Jahresnettokaltmiete)</span>
            <span className="text-xs text-gray-500 block mt-1">marktüblich erzielbare Mieteinnahmen pro Jahr, ohne Betriebskosten (§ 31 Abs. 2 ImmoWertV)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={jahresrohertrag === 0 ? '' : jahresrohertrag}
              onChange={(e) => setJahresrohertrag(Math.max(0, Number(e.target.value)))}
              className="w-full py-3 px-4 pr-16 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/Jahr</span>
          </div>
        </div>

        {/* Bewirtschaftungskosten */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bewirtschaftungskosten</span>
            <span className="text-xs text-gray-500 block mt-1">
              pro Jahr (§ 32 ImmoWertV 2022): Verwaltung, Instandhaltung, Mietausfallwagnis, nicht umlagefähige Betriebskosten
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bewirtschaftungskosten === 0 ? '' : bewirtschaftungskosten}
              onChange={(e) => setBewirtschaftungskosten(Math.max(0, Number(e.target.value)))}
              className="w-full py-3 px-4 pr-16 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/Jahr</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Reinertrag (Rohertrag − Bewirtschaftungskosten): <strong>{formatEuro(ergebnis.reinertrag)}</strong>
          </p>
        </div>

        {/* Bodenwert */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bodenwert des Grundstücks</span>
            <span className="text-xs text-gray-500 block mt-1">Bodenrichtwert × Grundstücksfläche (§ 16 ImmoWertV)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bodenwert === 0 ? '' : bodenwert}
              onChange={(e) => setBodenwert(Math.max(0, Number(e.target.value)))}
              className="w-full py-3 px-4 pr-10 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>

        {/* Liegenschaftszins + Restnutzungsdauer */}
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Liegenschaftszinssatz</span>
            <span className="text-xs text-gray-500 block mt-1 mb-2">vom Gutachterausschuss (§ 21, § 33)</span>
            <div className="relative">
              <input
                type="number"
                value={liegenschaftszins}
                onChange={(e) => setLiegenschaftszins(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-4 pr-9 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Restnutzungsdauer</span>
            <span className="text-xs text-gray-500 block mt-1 mb-2">der baulichen Anlagen</span>
            <div className="relative">
              <input
                type="number"
                value={restnutzungsdauer === 0 ? '' : restnutzungsdauer}
                onChange={(e) => setRestnutzungsdauer(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-4 pr-14 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Jahre</span>
            </div>
          </label>
        </div>
      </div>

      {/* Result Section */}
      <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-emerald-500 to-teal-600">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏢 Ertragswert der Immobilie</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.ertragswert)}</span>
          </div>
          <p className="text-white/80 mt-2 text-sm">
            Gebäudeertragswert <strong>{formatEuro(ergebnis.gebaeudeertragswert)}</strong> + Bodenwert <strong>{formatEuro(bodenwert)}</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gebäudereinertrag</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.gebaeudereinertrag)}</div>
            <span className="text-xs opacity-70">pro Jahr</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Vervielfältiger (V)</span>
            <div className="text-xl font-bold">{formatFaktor(ergebnis.vervielfaeltiger)}</div>
            <span className="text-xs opacity-70">Barwertfaktor § 34</span>
          </div>
        </div>

        {ergebnis.negativerGebaeudeanteil && (
          <p className="text-xs text-white/90 mt-4 bg-white/10 rounded-lg p-3">
            ⚠️ Die Bodenwertverzinsung übersteigt den Reinertrag – der Gebäudeertragswert ist negativ. Der
            Ertragswert liegt damit unter dem Bodenwert. Bitte Eingaben (Liegenschaftszins, Bodenwert, Miete) prüfen.
          </p>
        )}
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 So setzt sich der Ertragswert zusammen</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700">Jahresrohertrag</span>
            <span className="font-bold text-gray-900">{formatEuro(jahresrohertrag)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>− Bewirtschaftungskosten (§ 32)</span>
            <span>{formatEuro(bewirtschaftungskosten)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700 font-medium">= Reinertrag (§ 31)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.reinertrag)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>− Bodenwertverzinsung ({formatProzent(liegenschaftszins)} auf {formatEuro(bodenwert)})</span>
            <span>{formatEuro(ergebnis.bodenwertverzinsung)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700 font-medium">= Gebäudereinertrag (§ 28)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.gebaeudereinertrag)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>× Vervielfältiger V ({formatProzent(liegenschaftszins)}, {restnutzungsdauer} Jahre, § 34)</span>
            <span>{formatFaktor(ergebnis.vervielfaeltiger)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-700 font-medium">= Gebäudeertragswert</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.gebaeudeertragswert)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100 text-gray-600">
            <span>+ Bodenwert</span>
            <span>{formatEuro(bodenwert)}</span>
          </div>
          <div className="flex justify-between py-4 bg-orange-50 -mx-6 px-6 rounded-b-xl mt-2">
            <span className="font-bold text-orange-800">Ertragswert (§ 28)</span>
            <span className="font-bold text-xl text-orange-900">{formatEuro(ergebnis.ertragswert)}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So rechnet der Ertragswertverfahren-Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Reinertrag</strong> = Jahresrohertrag − Bewirtschaftungskosten (§ 31 Abs. 1)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Bodenwertverzinsung</strong> = Bodenwert × Liegenschaftszins (§ 28)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Gebäudereinertrag</strong> = Reinertrag − Bodenwertverzinsung (§ 28)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Vervielfältiger V</strong> = (1 − (1 + p)<sup>−n</sup>) ÷ p, mit p = Liegenschaftszins und n = Restnutzungsdauer (§ 34 Abs. 2)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Ertragswert</strong> = Gebäudereinertrag × V + Bodenwert (§ 28)</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
        <p className="text-xs text-gray-500">
          <strong>Hinweis:</strong> Schätzung – keine Steuer-, Rechts- oder Wertgutachten-Beratung. Dieser Rechner
          bildet das allgemeine Ertragswertverfahren nach §§ 27, 28, 31, 32, 34 ImmoWertV 2022 vereinfacht ab und
          ersetzt KEIN Verkehrswertgutachten i.&nbsp;S.&nbsp;d. § 194 BauGB durch einen öffentlich bestellten und
          vereidigten Sachverständigen bzw. den Gutachterausschuss. Der Liegenschaftszinssatz wird vom örtlichen
          Gutachterausschuss für Grundstückswerte aus der Kaufpreissammlung abgeleitet und in den
          Grundstücksmarktberichten veröffentlicht – er ist als Eingabewert objektbezogen zu übernehmen (keine fixe
          Annahme). Nicht berücksichtigt sind die Marktanpassung des vorläufigen Ertragswerts (§ 7, § 27 Abs. 3
          ImmoWertV), besondere objektspezifische Grundstücksmerkmale, das vereinfachte und periodische
          Ertragswertverfahren sowie alternative Verfahren (Vergleichswert-, Sachwertverfahren).
          Bewirtschaftungskosten (§ 32 ImmoWertV) und Restnutzungsdauer müssen objektbezogen geschätzt werden.
          Alle Angaben ohne Gewähr.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/immowertv_2022/__27.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 27 ImmoWertV 2022 – Ermittlung des Ertragswerts
          </a>
          <a
            href="https://www.gesetze-im-internet.de/immowertv_2022/__28.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 28 ImmoWertV 2022 – Allgemeines Ertragswertverfahren
          </a>
          <a
            href="https://www.gesetze-im-internet.de/immowertv_2022/__31.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 31 ImmoWertV 2022 – Reinertrag und Rohertrag
          </a>
          <a
            href="https://www.gesetze-im-internet.de/immowertv_2022/__32.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 32 ImmoWertV 2022 – Bewirtschaftungskosten
          </a>
          <a
            href="https://www.gesetze-im-internet.de/immowertv_2022/__21.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 21 ImmoWertV 2022 – Liegenschaftszinssätze
          </a>
          <a
            href="https://www.gesetze-im-internet.de/immowertv_2022/__33.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 33 ImmoWertV 2022 – Objektspezifisch angepasster Liegenschaftszinssatz
          </a>
          <a
            href="https://www.gesetze-im-internet.de/immowertv_2022/__34.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 34 ImmoWertV 2022 – Barwertfaktoren (Vervielfältiger)
          </a>
        </div>
      </div>
    </div>
  );
}
