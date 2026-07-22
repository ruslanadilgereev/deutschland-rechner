import { useState, useMemo } from 'react';

// === RECHTSGRUNDLAGE: Zugewinngemeinschaft, §§ 1373–1378 BGB ===
// Der Zugewinnausgleich ist rein formelbasiert – es gibt KEINE amtlichen
// EUR-Betraege, Freibetraege, Tarife oder Indexwerte. Gerechnet wird nur
// mit den vom Nutzer eingegebenen Vermoegenswerten.

// Ausgleichsforderung = Haelfte des Ueberschusses des hoeheren ueber den
// niedrigeren Zugewinn.
// Quelle: § 1378 Abs. 1 BGB – https://www.gesetze-im-internet.de/bgb/__1378.html
const HAELFTE_FAKTOR = 0.5; // "die Haelfte des Ueberschusses" (§ 1378 Abs. 1)

export default function ZugewinnausgleichRechner() {
  // Ehegatte A ("Sie")
  const [anfangA, setAnfangA] = useState(20000);
  const [erwerbA, setErwerbA] = useState(0); // privilegierter Erwerb (Erbschaft/Schenkung, § 1374 Abs. 2)
  const [endA, setEndA] = useState(150000);
  const [minderungA, setMinderungA] = useState(0); // illoyale Vermoegensminderung (§ 1375 Abs. 2)

  // Ehegatte B ("Partner/in")
  const [anfangB, setAnfangB] = useState(10000);
  const [erwerbB, setErwerbB] = useState(0);
  const [endB, setEndB] = useState(50000);
  const [minderungB, setMinderungB] = useState(0);

  // Optionale Eingaben (illoyale Minderungen, § 1375 Abs. 2)
  const [zeigeMinderungen, setZeigeMinderungen] = useState(false);

  const ergebnis = useMemo(() => {
    // === 1. Anfangs- und Endvermoegen je Ehegatte zusammensetzen ===
    // Anfangsvermoegen = Nettovermoegen bei Eheschliessung (§ 1374 Abs. 1, kann
    // negativ sein, § 1374 Abs. 3) + privilegierter Erwerb (§ 1374 Abs. 2).
    const anfangsvermoegenA = anfangA + erwerbA;
    const anfangsvermoegenB = anfangB + erwerbB;

    // Endvermoegen = Nettovermoegen bei Beendigung (§ 1375 Abs. 1)
    // + Hinzurechnungen illoyaler Minderungen (§ 1375 Abs. 2).
    const endvermoegenA = endA + minderungA;
    const endvermoegenB = endB + minderungB;

    // === 2. Zugewinn je Ehegatte ===
    // Zugewinn = Betrag, um den das Endvermoegen das Anfangsvermoegen uebersteigt.
    // -> nie negativ (§ 1373 BGB, "uebersteigt").
    const zugewinnA = Math.max(0, endvermoegenA - anfangsvermoegenA);
    const zugewinnB = Math.max(0, endvermoegenB - anfangsvermoegenB);

    // === 3. Ausgleichsforderung (vor Kappung) ===
    // Haelfte des Ueberschusses des hoeheren ueber den niedrigeren Zugewinn (§ 1378 Abs. 1).
    const ueberschuss = Math.abs(zugewinnA - zugewinnB);
    const forderungVorKappung = ueberschuss * HAELFTE_FAKTOR;

    // Schuldner ist der Ehegatte mit dem hoeheren Zugewinn.
    let schuldner: 'A' | 'B' | null = null;
    if (zugewinnA > zugewinnB) schuldner = 'A';
    else if (zugewinnB > zugewinnA) schuldner = 'B';

    // === 4. Kappung (§ 1378 Abs. 2) ===
    // Obergrenze = vorhandenes Nettoendvermoegen des Schuldners (Satz 1),
    // erhoeht um dessen nach § 1375 Abs. 2 hinzugerechnete Betraege (Satz 2).
    let kappungsgrenze = Infinity;
    if (schuldner === 'A') kappungsgrenze = Math.max(0, endA) + minderungA;
    else if (schuldner === 'B') kappungsgrenze = Math.max(0, endB) + minderungB;

    // Endgueltige Ausgleichsforderung.
    const forderung = Math.max(0, Math.min(forderungVorKappung, kappungsgrenze));
    const gekappt = forderungVorKappung > kappungsgrenze && schuldner !== null;

    return {
      anfangsvermoegenA,
      anfangsvermoegenB,
      endvermoegenA,
      endvermoegenB,
      zugewinnA,
      zugewinnB,
      ueberschuss,
      forderungVorKappung,
      forderung,
      schuldner,
      kappungsgrenze,
      gekappt,
    };
  }, [anfangA, erwerbA, endA, minderungA, anfangB, erwerbB, endB, minderungB]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €';

  const glaeubiger = ergebnis.schuldner === 'A' ? 'B' : ergebnis.schuldner === 'B' ? 'A' : null;
  const nameA = 'Ehegatte A (Sie)';
  const nameB = 'Ehegatte B (Partner/in)';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Vermögenswerte eingeben</h2>
        <p className="text-xs text-gray-500 mb-5">
          Jeweils das <strong>Nettovermögen</strong> (nach Abzug der Schulden). Anfangsvermögen kann
          negativ sein (§ 1374 Abs. 3 BGB).
        </p>

        {/* Ehegatte A */}
        <div className="mb-6 p-4 bg-fuchsia-50 rounded-xl">
          <h3 className="font-bold text-fuchsia-800 mb-3">👤 {nameA}</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Anfangsvermögen (bei Eheschließung)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={anfangA}
                  onChange={(e) => setAnfangA(Number(e.target.value))}
                  className="w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  step="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                + Erbschaft / Schenkung während der Ehe
                <span className="block text-xs text-gray-500 font-normal">
                  Wird dem Anfangsvermögen zugerechnet (§ 1374 Abs. 2 BGB) und mindert so den Zugewinn.
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={erwerbA}
                  onChange={(e) => setErwerbA(Math.max(0, Number(e.target.value)))}
                  className="w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  min="0"
                  step="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Endvermögen (bei Zustellung des Scheidungsantrags)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={endA}
                  onChange={(e) => setEndA(Number(e.target.value))}
                  className="w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  step="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>

            {zeigeMinderungen && (
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  + Illoyale Vermögensminderung
                  <span className="block text-xs text-gray-500 font-normal">
                    Verschwendung, benachteiligende Schenkung o. Ä. (§ 1375 Abs. 2 BGB)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={minderungA}
                    onChange={(e) => setMinderungA(Math.max(0, Number(e.target.value)))}
                    className="w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                    min="0"
                    step="1000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between text-sm border-t border-fuchsia-200 pt-3">
            <span className="text-fuchsia-700 font-medium">Zugewinn {nameA}</span>
            <span className="font-bold text-fuchsia-900">{formatEuro(ergebnis.zugewinnA)}</span>
          </div>
        </div>

        {/* Ehegatte B */}
        <div className="mb-4 p-4 bg-pink-50 rounded-xl">
          <h3 className="font-bold text-pink-800 mb-3">👤 {nameB}</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Anfangsvermögen (bei Eheschließung)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={anfangB}
                  onChange={(e) => setAnfangB(Number(e.target.value))}
                  className="w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  step="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                + Erbschaft / Schenkung während der Ehe
                <span className="block text-xs text-gray-500 font-normal">
                  Wird dem Anfangsvermögen zugerechnet (§ 1374 Abs. 2 BGB) und mindert so den Zugewinn.
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={erwerbB}
                  onChange={(e) => setErwerbB(Math.max(0, Number(e.target.value)))}
                  className="w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  min="0"
                  step="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                Endvermögen (bei Zustellung des Scheidungsantrags)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={endB}
                  onChange={(e) => setEndB(Number(e.target.value))}
                  className="w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  step="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>

            {zeigeMinderungen && (
              <div>
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  + Illoyale Vermögensminderung
                  <span className="block text-xs text-gray-500 font-normal">
                    Verschwendung, benachteiligende Schenkung o. Ä. (§ 1375 Abs. 2 BGB)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={minderungB}
                    onChange={(e) => setMinderungB(Math.max(0, Number(e.target.value)))}
                    className="w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                    min="0"
                    step="1000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between text-sm border-t border-pink-200 pt-3">
            <span className="text-pink-700 font-medium">Zugewinn {nameB}</span>
            <span className="font-bold text-pink-900">{formatEuro(ergebnis.zugewinnB)}</span>
          </div>
        </div>

        {/* Toggle illoyale Minderungen */}
        <label className="flex items-center gap-3 cursor-pointer mt-2">
          <input
            type="checkbox"
            checked={zeigeMinderungen}
            onChange={(e) => setZeigeMinderungen(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-fuchsia-500 focus:ring-fuchsia-500"
          />
          <span className="text-sm text-gray-600">
            Illoyale Vermögensminderungen berücksichtigen (§ 1375 Abs. 2 BGB)
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">💍 Ausgleichsforderung</h3>
        {ergebnis.schuldner === null ? (
          <div className="mb-2">
            <div className="text-5xl font-bold">{formatEuro(0)}</div>
            <p className="text-pink-100 mt-2 text-sm">
              Beide Ehegatten haben denselben Zugewinn – es besteht kein Ausgleichsanspruch.
            </p>
          </div>
        ) : (
          <div className="mb-2">
            <div className="text-5xl font-bold">{formatEuro(ergebnis.forderung)}</div>
            <p className="text-pink-100 mt-2 text-sm">
              <strong>{ergebnis.schuldner === 'A' ? nameA : nameB}</strong> zahlt an{' '}
              <strong>{glaeubiger === 'A' ? nameA : nameB}</strong>.
            </p>
            {ergebnis.gekappt && (
              <p className="text-pink-50 mt-2 text-sm bg-white/10 rounded-lg px-3 py-2">
                ⚠️ Gekappt auf das vorhandene Nettoendvermögen des Schuldners von{' '}
                {formatEuro(ergebnis.kappungsgrenze)} (§ 1378 Abs. 2 BGB). Rechnerisch wären es{' '}
                {formatEuro(ergebnis.forderungVorKappung)} gewesen.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-3 gap-2 font-medium text-gray-500 text-xs uppercase tracking-wide pb-1 border-b border-gray-200">
            <span></span>
            <span className="text-right">{nameA}</span>
            <span className="text-right">{nameB}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1">
            <span className="text-gray-600">Anfangsvermögen (+ Erbschaft/Schenkung)</span>
            <span className="text-right text-gray-900">{formatEuro(ergebnis.anfangsvermoegenA)}</span>
            <span className="text-right text-gray-900">{formatEuro(ergebnis.anfangsvermoegenB)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1">
            <span className="text-gray-600">Endvermögen{zeigeMinderungen ? ' (+ Hinzurechnungen)' : ''}</span>
            <span className="text-right text-gray-900">{formatEuro(ergebnis.endvermoegenA)}</span>
            <span className="text-right text-gray-900">{formatEuro(ergebnis.endvermoegenB)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-2 bg-gray-50 -mx-6 px-6 font-medium">
            <span className="text-gray-700">= Zugewinn</span>
            <span className="text-right text-gray-900 font-bold">{formatEuro(ergebnis.zugewinnA)}</span>
            <span className="text-right text-gray-900 font-bold">{formatEuro(ergebnis.zugewinnB)}</span>
          </div>

          <div className="pt-3 space-y-2">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Überschuss (höherer − niedrigerer Zugewinn)</span>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.ueberschuss)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">Hälfte des Überschusses (§ 1378 Abs. 1)</span>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.forderungVorKappung)}</span>
            </div>
            {ergebnis.schuldner !== null && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">
                  Kappungsgrenze: Nettoendvermögen {ergebnis.schuldner === 'A' ? nameA : nameB} (§ 1378 Abs. 2)
                </span>
                <span className="text-gray-900">
                  {ergebnis.kappungsgrenze === Infinity ? '–' : formatEuro(ergebnis.kappungsgrenze)}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 bg-fuchsia-100 -mx-6 px-6 rounded-b-xl mt-2">
              <span className="font-bold text-fuchsia-800">= Ausgleichsforderung</span>
              <span className="font-bold text-2xl text-fuchsia-900">{formatEuro(ergebnis.forderung)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* So funktioniert die Berechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So wird der Zugewinnausgleich berechnet</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>1.</span>
            <span>
              <strong>Zugewinn je Ehegatte</strong> = Endvermögen − Anfangsvermögen (nie negativ, § 1373 BGB).
            </span>
          </li>
          <li className="flex gap-2">
            <span>2.</span>
            <span>
              <strong>Erbschaften und Schenkungen</strong> werden dem Anfangsvermögen zugerechnet und
              mindern so den Zugewinn (§ 1374 Abs. 2 BGB).
            </span>
          </li>
          <li className="flex gap-2">
            <span>3.</span>
            <span>
              Wer den <strong>höheren Zugewinn</strong> hat, zahlt die <strong>Hälfte des Überschusses</strong>{' '}
              an den anderen (§ 1378 Abs. 1 BGB).
            </span>
          </li>
          <li className="flex gap-2">
            <span>4.</span>
            <span>
              Die Forderung ist auf das <strong>vorhandene Nettoendvermögen</strong> des Schuldners
              begrenzt (Kappung, § 1378 Abs. 2 BGB).
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Hinweis:</strong> Dieser Rechner liefert eine unverbindliche <strong>Schätzung</strong>{' '}
          und ersetzt keine Rechts- oder Steuerberatung. Bewertungsfragen (z. B. Verkehrswert von
          Immobilien oder Unternehmen), die von der Rechtsprechung anerkannte{' '}
          <strong>Kaufkraftbereinigung des Anfangsvermögens</strong> (Indexierung) sowie Sonderfälle sind
          nicht abgebildet. Verbindliche Auskünfte erteilt eine Fachanwältin oder ein Fachanwalt für
          Familienrecht.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/bgb/__1373.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 1373 BGB – Zugewinn
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bgb/__1374.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 1374 BGB – Anfangsvermögen
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bgb/__1375.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 1375 BGB – Endvermögen
          </a>
          <a
            href="https://www.gesetze-im-internet.de/bgb/__1378.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 1378 BGB – Ausgleichsforderung
          </a>
        </div>
      </div>
    </div>
  );
}
