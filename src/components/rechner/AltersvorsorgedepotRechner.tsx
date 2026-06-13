import { useState, useMemo } from 'react';

// === Förderparameter Altersvorsorgedepot (Stand Juni 2026, BMF/Bundesregierung) ===
// Grundzulage (gestaffelt, anteilig pro eingezahltem Euro)
const GRUNDZULAGE_STUFE1_GRENZE = 360;      // Euro Eigenbeitrag
const GRUNDZULAGE_STUFE1_QUOTE = 0.50;      // 50 Cent pro Euro bis 360 €
const GRUNDZULAGE_STUFE2_GRENZE = 1800;     // Euro Eigenbeitrag (gefördert insgesamt)
const GRUNDZULAGE_STUFE2_QUOTE = 0.25;      // 25 Cent pro Euro von 360,01 € bis 1.800 €
const GRUNDZULAGE_MAX = 540;                // Euro/Jahr (= 180 + 360)

// Kinderzulage (pro Kind)
const KINDERZULAGE_GRENZE_PRO_KIND = 300;   // Euro Eigenbeitrag pro Kind
const KINDERZULAGE_QUOTE = 1.0;             // 1 € Zulage pro eingezahltem Euro (bis 300 €)
const KINDERZULAGE_MAX_PRO_KIND = 300;      // Euro/Kind/Jahr

// Berufseinsteigerbonus (einmalig)
const BERUFSEINSTEIGERBONUS = 200;          // Euro einmalig, wenn Vertrag vor dem 25. Geburtstag

// Mindesteigenbeitrag für Förderung
const MINDEST_EIGENBEITRAG = 120;           // Euro/Jahr

// Förder-/Einzahl-Höchstbeitrag
const FOERDER_HOECHSTBEITRAG = 1800;        // Euro/Jahr gefördert
const EINZAHL_HOECHSTBEITRAG = 6840;        // Euro/Jahr max. Einzahlung (darüber keine Förderung)

interface DepotResult {
  grundzulage: number;
  kinderzulage: number;
  bonus: number;
  jahresZulage: number;        // Grundzulage + Kinderzulage (ohne einmaligen Bonus)
  jahresSumme: number;         // Eigenbeitrag + jährliche Zulagen
  foerderquote: number;        // (jahresZulage / Eigenbeitrag) * 100
  eingezahlt: number;          // Summe Eigenbeiträge über Laufzeit
  zulagenSumme: number;        // Summe staatlicher Zulagen (inkl. Bonus)
  investiertesKapital: number; // eingezahlt + zulagenSumme
  endkapital: number;
  rendite: number;             // reiner Zinsertrag
  jahreswerte: {
    jahr: number;
    eigenbeitrag: number;
    zulage: number;
    gesamtEingezahlt: number;
    wert: number;
  }[];
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
};

export default function AltersvorsorgedepotRechner() {
  // Input State
  const [eigenbeitrag, setEigenbeitrag] = useState<number>(1800);
  const [kinder, setKinder] = useState<number>(0);
  const [laufzeit, setLaufzeit] = useState<number>(30);
  const [rendite, setRendite] = useState<number>(6);
  const [berufseinsteiger, setBerufseinsteiger] = useState<boolean>(false);
  const [showBerechnung, setShowBerechnung] = useState(false);

  const result = useMemo<DepotResult>(() => {
    const E = Math.min(Math.max(0, eigenbeitrag), EINZAHL_HOECHSTBEITRAG);
    const K = Math.max(0, Math.floor(kinder));
    const J = Math.max(1, Math.floor(laufzeit));
    const r = Math.max(0, rendite);

    // 1) Grundzulage pro Jahr (gestaffelt, anteilig)
    let grundzulage = 0;
    if (E >= MINDEST_EIGENBEITRAG) {
      const e = Math.min(E, FOERDER_HOECHSTBEITRAG);
      const stufe1 = Math.min(e, GRUNDZULAGE_STUFE1_GRENZE) * GRUNDZULAGE_STUFE1_QUOTE;
      const stufe2 = Math.max(0, Math.min(e, GRUNDZULAGE_STUFE2_GRENZE) - GRUNDZULAGE_STUFE1_GRENZE) * GRUNDZULAGE_STUFE2_QUOTE;
      grundzulage = Math.min(stufe1 + stufe2, GRUNDZULAGE_MAX);
    }

    // 2) Kinderzulage pro Jahr (1 € je Euro bis 300 €/Kind, aus demselben Eigenbeitrag)
    let kinderzulage = 0;
    if (K > 0 && E >= MINDEST_EIGENBEITRAG) {
      const eigenbeitragFuerKinder = Math.min(E, K * KINDERZULAGE_GRENZE_PRO_KIND);
      kinderzulage = Math.min(eigenbeitragFuerKinder * KINDERZULAGE_QUOTE, K * KINDERZULAGE_MAX_PRO_KIND);
    }

    // 3) Berufseinsteigerbonus (einmalig, nur in Jahr 1)
    const bonus = berufseinsteiger ? BERUFSEINSTEIGERBONUS : 0;

    const jahresZulage = grundzulage + kinderzulage;
    const jahresSumme = E + jahresZulage;
    const foerderquote = E > 0 ? (jahresZulage / E) * 100 : 0;

    // 5) Endkapital mit Zinseszins (Einzahlung zu Jahresbeginn, Verzinsung am Jahresende)
    const jahreswerte: DepotResult['jahreswerte'] = [];
    let kapital = 0;
    let eingezahlt = 0;
    let zulagenSumme = 0;

    for (let t = 1; t <= J; t++) {
      const bonusT = t === 1 ? bonus : 0;
      const zulageT = jahresZulage + bonusT;
      kapital += E + zulageT;
      eingezahlt += E;
      zulagenSumme += zulageT;
      kapital *= (1 + r / 100);

      jahreswerte.push({
        jahr: t,
        eigenbeitrag: E,
        zulage: zulageT,
        gesamtEingezahlt: eingezahlt + zulagenSumme,
        wert: kapital,
      });
    }

    const endkapital = kapital;
    const investiertesKapital = eingezahlt + zulagenSumme;
    const renditeBetrag = endkapital - investiertesKapital;

    return {
      grundzulage,
      kinderzulage,
      bonus,
      jahresZulage,
      jahresSumme,
      foerderquote,
      eingezahlt,
      zulagenSumme,
      investiertesKapital,
      endkapital,
      rendite: renditeBetrag,
      jahreswerte,
    };
  }, [eigenbeitrag, kinder, laufzeit, rendite, berufseinsteiger]);

  const unterMindestbeitrag = eigenbeitrag > 0 && eigenbeitrag < MINDEST_EIGENBEITRAG;

  return (
    <div className="space-y-6">

      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Deine Daten zum Altersvorsorgedepot</h2>

        <div className="space-y-4">
          {/* Eigenbeitrag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jährlicher Eigenbeitrag *
            </label>
            <div className="relative">
              <input
                type="number"
                value={eigenbeitrag || ''}
                onChange={(e) => setEigenbeitrag(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-orange-500"
                placeholder="1800"
                min="0"
                step="60"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Gefördert werden bis zu 1.800 € pro Jahr. Mindestens 120 € für die Förderung nötig.
            </p>
            {unterMindestbeitrag && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ Unter dem Mindesteigenbeitrag von 120 €/Jahr gibt es keine staatliche Zulage.
              </p>
            )}
          </div>

          {/* Kinder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anzahl zulageberechtigter Kinder
            </label>
            <input
              type="number"
              value={kinder || ''}
              onChange={(e) => setKinder(Math.max(0, Math.floor(Number(e.target.value))))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-orange-500"
              placeholder="0"
              min="0"
              step="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Volle Kinderzulage (300 €/Kind) ab 300 € Eigenbeitrag je Kind und Jahr.
            </p>
          </div>

          {/* Laufzeit Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anlagedauer: <span className="font-bold text-orange-600">{laufzeit} Jahre</span>
            </label>
            <input
              type="range"
              min="1"
              max="45"
              value={laufzeit}
              onChange={(e) => setLaufzeit(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 Jahr</span>
              <span>25 Jahre</span>
              <span>45 Jahre</span>
            </div>
          </div>

          {/* Rendite Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Erwartete Rendite p.a.: <span className="font-bold text-orange-600">{formatPercent(rendite)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={rendite}
              onChange={(e) => setRendite(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 %</span>
              <span>6 %</span>
              <span>10 %</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Die Rendite hängt vom gewählten Depot ab und kann schwanken (auch negativ).
            </p>
          </div>

          {/* Berufseinsteigerbonus */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="berufseinsteiger"
                checked={berufseinsteiger}
                onChange={(e) => setBerufseinsteiger(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-orange-600 border-gray-300 rounded focus:ring-0 focus:border-orange-500"
              />
              <label htmlFor="berufseinsteiger" className="text-sm font-medium text-gray-700">
                Berufseinsteigerbonus (Vertrag vor dem 25. Geburtstag)
                <span className="block text-xs font-normal text-gray-500 mt-0.5">
                  Einmalig 200 € zusätzlich – wird nur im ersten Jahr gutgeschrieben.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-lg font-medium text-orange-100 mb-2">Voraussichtliches Endkapital nach {laufzeit} Jahren</h3>

        <div className="text-center py-4">
          <div className="text-5xl font-bold mb-1">
            {formatCurrency(result.endkapital)}
          </div>
          <div className="text-orange-200 text-sm">
            inkl. staatlicher Zulagen und Zinseszins
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{formatCurrency(result.eingezahlt)}</div>
            <div className="text-orange-200 text-sm">Dein Eigenbeitrag</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{formatCurrency(result.zulagenSumme)}</div>
            <div className="text-orange-200 text-sm">Staatliche Zulagen</div>
          </div>
        </div>

        {/* Förderquote */}
        <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-orange-100">Förderquote (Zulage je Euro Eigenbeitrag)</span>
            <span className="text-2xl font-bold">{formatPercent(result.foerderquote)}</span>
          </div>
          <div className="text-orange-200 text-sm">
            Der Staat legt {formatPercent(result.foerderquote)} auf deinen jährlichen Eigenbeitrag drauf.
          </div>
        </div>
      </div>

      {/* Aufschlüsselung der jährlichen Zulagen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Deine jährlichen Zulagen</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Grundzulage (50 % bis 360 €, 25 % bis 1.800 €)</span>
            <span className="font-semibold text-gray-800">{formatCurrency(result.grundzulage)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Kinderzulage ({kinder} {kinder === 1 ? 'Kind' : 'Kinder'})</span>
            <span className="font-semibold text-gray-800">{formatCurrency(result.kinderzulage)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Zulage pro Jahr (Grund + Kinder)</span>
            <span className="font-semibold text-orange-600">{formatCurrency(result.jahresZulage)}</span>
          </div>
          {result.bonus > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Berufseinsteigerbonus (einmalig)</span>
              <span className="font-semibold text-gray-800">{formatCurrency(result.bonus)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Geförderte Jahressumme (Eigenbeitrag + Zulage/Jahr)</span>
            <span className="font-semibold text-gray-800">{formatCurrency(result.jahresSumme)}</span>
          </div>
        </div>
      </div>

      {/* Visualisierung: Balkendiagramm */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Woraus besteht dein Endkapital?</h3>

        <div className="space-y-2">
          {/* Eigenbeitrag */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Eigenbeitrag</span>
              <span className="font-medium">{formatCurrency(result.eingezahlt)}</span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-lg transition-all duration-500"
                style={{ width: `${(result.eingezahlt / Math.max(result.endkapital, 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Staatliche Zulagen */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Staatliche Zulagen</span>
              <span className="font-medium">{formatCurrency(result.zulagenSumme)}</span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-lg transition-all duration-500"
                style={{ width: `${(result.zulagenSumme / Math.max(result.endkapital, 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Rendite */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Rendite (Zinseszins)</span>
              <span className="font-medium">{formatCurrency(result.rendite)}</span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-lg transition-all duration-500"
                style={{ width: `${(Math.max(0, result.rendite) / Math.max(result.endkapital, 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Legende */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Eigenbeitrag</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Staatliche Zulagen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span>Rendite</span>
          </div>
        </div>
      </div>

      {/* Jahresübersicht (klappbar) */}
      {result.jahreswerte.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <button
            onClick={() => setShowBerechnung(!showBerechnung)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-700">📊 Jahresübersicht anzeigen</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${showBerechnung ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showBerechnung && (
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Jahr</th>
                    <th className="text-right py-2 font-medium text-gray-600">Eigenbeitrag</th>
                    <th className="text-right py-2 font-medium text-gray-600">Zulage</th>
                    <th className="text-right py-2 font-medium text-gray-600">Gesamt eingezahlt</th>
                    <th className="text-right py-2 font-medium text-gray-600">Wert</th>
                  </tr>
                </thead>
                <tbody>
                  {result.jahreswerte.map((jw) => (
                    <tr key={jw.jahr} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 font-medium">{jw.jahr}</td>
                      <td className="text-right py-2">{formatCurrency(jw.eigenbeitrag)}</td>
                      <td className="text-right py-2 text-orange-600">+{formatCurrency(jw.zulage)}</td>
                      <td className="text-right py-2">{formatCurrency(jw.gesamtEingezahlt)}</td>
                      <td className="text-right py-2 font-medium text-emerald-600">{formatCurrency(jw.wert)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info-Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-orange-800 mb-3">ℹ️ Was ist das Altersvorsorgedepot?</h3>
        <ul className="space-y-2 text-sm text-orange-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Das <strong>Altersvorsorgedepot</strong> ist die neue staatlich geförderte private Altersvorsorge und ersetzt die Riester-Rente.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Der Bundesrat hat die Reform am <strong>8. Mai 2026</strong> beschlossen; Produkte sind ab dem <strong>1. Januar 2027</strong> verfügbar.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Es gibt eine <strong>gestaffelte Grundzulage</strong> (50 Cent je Euro bis 360 €, danach 25 Cent bis 1.800 €) – maximal <strong>540 €/Jahr</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Für jedes Kind gibt es <strong>1 € je gespartem Euro bis 300 €</strong> – also bis zu <strong>300 € Kinderzulage</strong> pro Kind und Jahr.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>Wer vor dem 25. Geburtstag startet, erhält einmalig einen <strong>Berufseinsteigerbonus von 200 €</strong>.</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Produkte sind erst <strong>ab dem 1. Januar 2027</strong> erhältlich – die Berechnung beruht auf den beschlossenen Förderparametern.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Die <strong>tatsächliche Rendite</strong> hängt vom Depot ab und kann schwanken (auch negativ!).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span><strong>Produktkosten und Gebühren</strong> sind nicht berücksichtigt und mindern das Ergebnis.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Die <strong>nachgelagerte Besteuerung</strong> in der Auszahlphase ist nicht eingerechnet.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Keine Steuer- oder Anlageberatung – Ergebnisse dienen nur der Orientierung.</span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
        <p className="text-xs text-gray-500">
          <strong>Schätzung – keine Steuer- oder Anlageberatung.</strong> Das geförderte Altersvorsorgedepot
          ist für Verbraucher erst ab dem 1. Januar 2027 verfügbar; die Berechnung basiert auf den im Mai 2026
          beschlossenen Förderparametern (BMF/Bundesregierung). Tatsächliche Renditen können schwanken (auch
          negativ). Produktkosten, individuelle Steuersituation und die nachgelagerte Besteuerung in der
          Auszahlphase sind nicht berücksichtigt. Angaben ohne Gewähr.
        </p>
      </div>

      {/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">📚 Quellen & Rechtliche Grundlagen</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            <a href="https://www.bundesfinanzministerium.de/Content/DE/FAQ/reform-der-privaten-altersvorsorge.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              BMF – FAQ: Reform der geförderten privaten Altersvorsorge
            </a>
          </li>
          <li>
            <a href="https://www.bundesregierung.de/breg-de/aktuelles/reform-private-altersvorsorge-2400072" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              Bundesregierung – Reform der privaten Altersvorsorge
            </a>
          </li>
          <li>
            <a href="https://www.bundesfinanzministerium.de/Monatsberichte/Ausgabe/2026/01/Inhalte/Kapitel-2-Analysen/2-2-neustart-fuer-die-private-altersvorsorge.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              BMF-Monatsbericht – Neustart für die private Altersvorsorge
            </a>
          </li>
          <li>
            <a href="https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2026/260508-bundesrat-reform-private-altersvorsorge.html" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              Deutsche Rentenversicherung – Bundesrat beschließt Reform (08.05.2026)
            </a>
          </li>
          <li>
            <a href="https://www.bundestag.de/dokumente/textarchiv/2026/kw13-de-altersvorsorge-1156798" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              Deutscher Bundestag – Textarchiv zur privaten Altersvorsorge
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Stand: Juni 2026. Alle Angaben ohne Gewähr. Keine Steuer- oder Anlageberatung – Ergebnisse dienen nur der Orientierung.
        </p>
      </div>
    </div>
  );
}
