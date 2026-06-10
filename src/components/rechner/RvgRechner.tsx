import { useState } from 'react';

// =============================================================================
// RVG-Gebührentabelle (Anlage 2 zu § 13 Abs. 1 RVG) – Stand 2026
// Werte nach KostBRÄG 2025 (in Kraft seit 1. Juni 2025), unverändert für 2026.
// Quelle: https://www.gesetze-im-internet.de/rvg/anlage_2.html
// Jeder Eintrag: [Gegenstandswert bis ... EUR, 1,0-Gebühr in EUR]
// =============================================================================
const RVG_TABELLE: [number, number][] = [
  [500, 51.5],
  [1000, 93.0],
  [1500, 134.5],
  [2000, 176.0],
  [3000, 235.5],
  [4000, 295.0],
  [5000, 354.5],
  [6000, 414.0],
  [7000, 473.5],
  [8000, 533.0],
  [9000, 592.5],
  [10000, 652.0],
  [13000, 707.0],
  [16000, 762.0],
  [19000, 817.0],
  [22000, 872.0],
  [25000, 927.0],
  [30000, 1013.0],
  [35000, 1099.0],
  [40000, 1185.0],
  [45000, 1271.0],
  [50000, 1357.0],
  [65000, 1456.5],
  [80000, 1556.0],
  [95000, 1655.5],
  [110000, 1755.0],
  [125000, 1854.5],
  [140000, 1954.0],
  [155000, 2053.5],
  [170000, 2153.0],
  [185000, 2252.5],
  [200000, 2352.0],
  [230000, 2492.0],
  [260000, 2632.0],
  [290000, 2772.0],
  [320000, 2912.0],
  [350000, 3052.0],
  [380000, 3192.0],
  [410000, 3332.0],
  [440000, 3472.0],
  [470000, 3612.0],
  [500000, 3752.0],
];

// =============================================================================
// GKG-Gebührentabelle (Anlage 2 zu § 34 GKG) – Stand 2026 (für Gerichtskosten)
// Quelle: https://www.gesetze-im-internet.de/gkg_2004/anlage_2.html
// =============================================================================
const GKG_TABELLE: [number, number][] = [
  [500, 40.0],
  [1000, 61.0],
  [1500, 82.0],
  [2000, 103.0],
  [3000, 125.5],
  [4000, 148.0],
  [5000, 170.5],
  [6000, 193.0],
  [7000, 215.5],
  [8000, 238.0],
  [9000, 260.5],
  [10000, 283.0],
  [13000, 313.5],
  [16000, 344.0],
  [19000, 374.5],
  [22000, 405.0],
  [25000, 435.5],
  [30000, 476.0],
  [35000, 516.5],
  [40000, 557.0],
  [45000, 597.5],
  [50000, 638.0],
];

const AUSLAGENPAUSCHALE = 20; // Nr. 7002 VV RVG: 20 % der Gebühren, max. 20 EUR
const UST_SATZ = 0.19; // 19 % Umsatzsteuer (Nr. 7008 VV RVG)

// 1,0-Gebühr nach RVG für einen Gegenstandswert ermitteln (mit Fortschreibung
// für Werte über 50.000 EUR bzw. über 500.000 EUR nach § 13 Abs. 1 RVG).
function rvgEinfacheGebuehr(wert: number): number {
  if (wert <= 0) return 0;
  for (const [grenze, gebuehr] of RVG_TABELLE) {
    if (wert <= grenze) return gebuehr;
  }
  // > 500.000 EUR: je angefangene 50.000 EUR + 175,00 EUR auf 3.752,00 EUR
  const ueber = wert - 500000;
  const schritte = Math.ceil(ueber / 50000);
  return 3752.0 + schritte * 175.0;
}

// 1,0-Gebühr nach GKG für einen Streitwert ermitteln. Fortschreibung nach
// § 34 Abs. 1 GKG ab 50.000 EUR (Basis 638,00 EUR):
//   50.000 – 200.000 EUR: je angefangene 15.000 EUR + 140,00 EUR
//   200.000 – 500.000 EUR: je angefangene 30.000 EUR + 210,00 EUR
//   über 500.000 EUR:      je angefangene 50.000 EUR + 210,00 EUR
function gkgEinfacheGebuehr(wert: number): number {
  if (wert <= 0) return 0;
  for (const [grenze, gebuehr] of GKG_TABELLE) {
    if (wert <= grenze) return gebuehr;
  }
  // Bereich 50.000 – 200.000 EUR
  let gebuehr = 638.0;
  if (wert <= 200000) {
    return gebuehr + Math.ceil((wert - 50000) / 15000) * 140.0;
  }
  // Wert von 50.000 auf 200.000 EUR (= 10 Schritte à 15.000) hochrechnen
  gebuehr += 10 * 140.0; // = 2.038,00 EUR bei 200.000 EUR
  // Bereich 200.000 – 500.000 EUR
  if (wert <= 500000) {
    return gebuehr + Math.ceil((wert - 200000) / 30000) * 210.0;
  }
  // Wert von 200.000 auf 500.000 EUR (= 10 Schritte à 30.000) hochrechnen
  gebuehr += 10 * 210.0; // = 4.138,00 EUR bei 500.000 EUR
  // Bereich über 500.000 EUR
  return gebuehr + Math.ceil((wert - 500000) / 50000) * 210.0;
}

const eur = (n: number) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

export default function RvgRechner() {
  const [streitwertInput, setStreitwertInput] = useState('5000');
  const [mitGericht, setMitGericht] = useState(false);

  const streitwert = Math.max(0, parseFloat(streitwertInput.replace(',', '.')) || 0);
  const einfacheGebuehr = rvgEinfacheGebuehr(streitwert);

  // --- Außergerichtliche Tätigkeit ---
  // Geschäftsgebühr 1,3 (Nr. 2300 VV RVG)
  const geschaeftsgebuehr = einfacheGebuehr * 1.3;
  const auslagenAuss = Math.min(geschaeftsgebuehr * 0.2, AUSLAGENPAUSCHALE);
  const nettoAuss = geschaeftsgebuehr + auslagenAuss;
  const ustAuss = nettoAuss * UST_SATZ;
  const bruttoAuss = nettoAuss + ustAuss;

  // --- Gerichtliches Verfahren (1. Instanz, optional) ---
  // Verfahrensgebühr 1,3 (Nr. 3100 VV RVG) + Terminsgebühr 1,2 (Nr. 3104 VV RVG)
  // Anrechnung der Geschäftsgebühr: 1/2, höchstens 0,75 (Vorbem. 3 Abs. 4 VV RVG)
  const verfahrensgebuehr = einfacheGebuehr * 1.3;
  const terminsgebuehr = einfacheGebuehr * 1.2;
  const anrechnungSatz = Math.min(1.3 / 2, 0.75); // = 0,65
  const anrechnung = einfacheGebuehr * anrechnungSatz;
  const gerichtGebuehren = verfahrensgebuehr + terminsgebuehr - anrechnung;
  const auslagenGericht = Math.min(gerichtGebuehren * 0.2, AUSLAGENPAUSCHALE);
  const nettoGericht = gerichtGebuehren + auslagenGericht;
  const ustGericht = nettoGericht * UST_SATZ;
  const bruttoGericht = nettoGericht + ustGericht;

  // Gerichtskosten: 3,0-Verfahrensgebühr (Nr. 1210 KV GKG), umsatzsteuerfrei
  const gerichtskosten = gkgEinfacheGebuehr(streitwert) * 3.0;

  // Gesamtsumme der Anwaltskosten (eigener Anwalt)
  const anwaltskostenGesamt = mitGericht ? bruttoAuss + bruttoGericht : bruttoAuss;

  return (
    <div className="max-w-lg mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-5">
          <span className="text-gray-700 font-medium">Gegenstandswert / Streitwert</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={streitwertInput}
              onChange={(e) => setStreitwertInput(e.target.value)}
              className="w-full text-2xl font-bold text-gray-800 border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 focus:outline-none"
              placeholder="z. B. 5000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 font-medium">
              €
            </span>
          </div>
          <span className="text-xs text-gray-500 mt-2 block">
            Der Wert, um den gestritten wird (z. B. die geforderte Geldsumme).
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer select-none bg-gray-50 rounded-xl p-4">
          <input
            type="checkbox"
            checked={mitGericht}
            onChange={(e) => setMitGericht(e.target.checked)}
            className="w-5 h-5 accent-blue-600"
          />
          <span className="text-gray-700">
            <span className="font-medium">Gerichtliches Verfahren einbeziehen</span>
            <span className="block text-xs text-gray-500">
              Klage in 1. Instanz: Verfahrens- + Terminsgebühr + Gerichtskosten
            </span>
          </span>
        </label>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          {mitGericht ? 'Geschätzte Anwaltskosten (außergerichtlich + Gericht)' : 'Geschätzte außergerichtliche Anwaltskosten'}
        </h3>

        <div className="mb-5">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{eur(anwaltskostenGesamt)}</span>
          </div>
          <p className="text-xs text-blue-200 mt-1">inkl. 19 % USt. – Schätzung, ohne Gewähr</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-100">1,0-Gebühr (Wertgebühr)</span>
            <span className="font-medium">{eur(einfacheGebuehr)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-100">Geschäftsgebühr 1,3 (Nr. 2300)</span>
            <span className="font-medium">{eur(geschaeftsgebuehr)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-100">Auslagenpauschale (Nr. 7002)</span>
            <span className="font-medium">{eur(auslagenAuss)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-100">+ 19 % USt.</span>
            <span className="font-medium">{eur(ustAuss)}</span>
          </div>
          <div className="flex justify-between border-t border-white/20 pt-2 mt-1">
            <span className="text-blue-50 font-semibold">Außergerichtlich gesamt</span>
            <span className="font-bold">{eur(bruttoAuss)}</span>
          </div>
        </div>

        {mitGericht && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2 text-sm mt-4">
            <p className="text-blue-100 font-semibold mb-1">Gerichtliches Verfahren (1. Instanz)</p>
            <div className="flex justify-between">
              <span className="text-blue-100">Verfahrensgebühr 1,3 (Nr. 3100)</span>
              <span className="font-medium">{eur(verfahrensgebuehr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Terminsgebühr 1,2 (Nr. 3104)</span>
              <span className="font-medium">{eur(terminsgebuehr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">− Anrechnung Geschäftsgebühr</span>
              <span className="font-medium">−{eur(anrechnung)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Auslagen + 19 % USt.</span>
              <span className="font-medium">{eur(auslagenGericht + ustGericht)}</span>
            </div>
            <div className="flex justify-between border-t border-white/20 pt-2 mt-1">
              <span className="text-blue-50 font-semibold">Anwalt (Gericht) gesamt</span>
              <span className="font-bold">{eur(bruttoGericht)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-blue-100">Gerichtskosten (3,0, ohne USt.)</span>
              <span className="font-medium">{eur(gerichtskosten)}</span>
            </div>
            <div className="bg-white/10 rounded-lg p-3 mt-2 text-xs text-blue-100">
              Hinzu kämen ggf. die Kosten des gegnerischen Anwalts. Wer den Prozess
              verliert, trägt in der Regel alle Kosten (§ 91 ZPO).
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So rechnet der RVG-Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Aus dem <strong>Gegenstandswert</strong> wird über die Tabelle der{' '}
              <strong>Anlage 2 zu § 13 RVG</strong> die 1,0-Gebühr abgeleitet.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Außergerichtlich fällt die <strong>Geschäftsgebühr 1,3</strong> (Nr. 2300 VV RVG)
              an – der praxisübliche Regelsatz.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Plus <strong>Auslagenpauschale</strong> (20 % der Gebühr, max. 20 €, Nr. 7002)
              und <strong>19 % Umsatzsteuer</strong> (Nr. 7008).
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              Im Gerichtsverfahren kommen <strong>Verfahrensgebühr 1,3</strong> und{' '}
              <strong>Terminsgebühr 1,2</strong> hinzu; die Geschäftsgebühr wird
              hälftig (max. 0,75) angerechnet.
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <h3 className="font-bold text-yellow-800 mb-2">⚠️ Wichtiger Hinweis – ohne Gewähr</h3>
        <p className="text-sm text-yellow-800">
          Dieser Rechner liefert eine <strong>unverbindliche Schätzung</strong> der typischen
          Anwaltskosten nach RVG. Die tatsächlichen Kosten hängen vom Einzelfall ab
          (Gebührenrahmen, Rechtsgebiet, individuelle Vergütungsvereinbarung). Die Berechnung
          <strong> ersetzt keine Rechtsberatung</strong> und keine verbindliche Kostennote
          Ihres Anwalts. Alle Angaben ohne Gewähr.
        </p>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/rvg/anlage_2.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            RVG Anlage 2 (zu § 13 Abs. 1) – Gebührentabelle (gesetze-im-internet.de)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/rvg/__13.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 13 RVG – Wertgebühren (gesetze-im-internet.de)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/gkg_2004/anlage_2.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GKG Anlage 2 (zu § 34) – Gerichtskostentabelle (gesetze-im-internet.de)
          </a>
        </div>
      </div>
    </div>
  );
}
