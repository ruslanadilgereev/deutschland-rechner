import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ════════════════════════════════════════════════════════════════════
// Wegzugsteuer-Rechner nach § 6 AStG (Stand 2026)
// Fiktive Veräußerung von Anteilen i. S. d. § 17 EStG bei Wegzug.
// Teileinkünfteverfahren (§ 3 Nr. 40 EStG): 60 % des Gewinns steuerpflichtig.
// Tarif: § 32a EStG 2026 (1:1 aus EinkommensteuerSelbststaendigeRechner.tsx)
//        + 5,5 % Solidaritätszuschlag mit Freigrenze.
// YMYL – ersetzt keine Steuerberatung.
// ════════════════════════════════════════════════════════════════════

// §32a EStG 2026 – Grundfreibetrag und Tarifzonen (Stand 2026)
// 1:1 übernommen aus EinkommensteuerSelbststaendigeRechner.tsx
const GRUNDFREIBETRAG_2026 = 12348; // Zone 0: bis 12.348 € steuerfrei
const ZONE1_ENDE = 17799; // Zone 1: 12.349 – 17.799 €
const ZONE2_ENDE = 69878; // Zone 2: 17.800 – 69.878 €
const ZONE3_ENDE = 277825; // Zone 3: 69.879 – 277.825 €
// Zone 4: ab 277.826 €

// Solidaritätszuschlag 2026 – Freigrenze (steigt mit Grundfreibetrag)
const SOLI_FREIGRENZE_EINZEL = 20350; // 2026 (Einzelveranlagung)
const SOLI_SATZ = 0.055; // 5,5 %
const SOLI_MILDERUNG = 0.119; // 11,9 % Milderungszone (Überleitung)

// Teileinkünfteverfahren § 3 Nr. 40 EStG: nur 60 % des Gewinns steuerpflichtig
const TEV_ANTEIL = 0.6;

// Stundung § 6 Abs. 4 AStG: 7 gleiche zinslose Jahresraten
const RATEN_ANZAHL = 7;

// Berechnung Einkommensteuer nach §32a EStG 2026
// 1:1 übernommen aus EinkommensteuerSelbststaendigeRechner.tsx (Grundtarif)
function berechneEinkommensteuer(zvE: number): number {
  const x = Math.floor(zvE); // §32a: auf vollen Euro abgerundet

  if (x <= 0) return 0;

  let steuer = 0;
  if (x <= GRUNDFREIBETRAG_2026) {
    steuer = 0;
  } else if (x <= ZONE1_ENDE) {
    // Zone 1: 14 % – 24 % progressiv
    const y = (x - GRUNDFREIBETRAG_2026) / 10000;
    steuer = (914.51 * y + 1400) * y;
  } else if (x <= ZONE2_ENDE) {
    // Zone 2: 24 % – 42 % progressiv
    const z = (x - ZONE1_ENDE) / 10000;
    steuer = (173.10 * z + 2397) * z + 1034.87;
  } else if (x <= ZONE3_ENDE) {
    // Zone 3: 42 % Spitzensteuersatz
    steuer = 0.42 * x - 11135.63;
  } else {
    // Zone 4: 45 % Reichensteuer
    steuer = 0.45 * x - 19470.38;
  }

  // §32a EStG: Steuerbetrag auf vollen Euro abrunden
  return Math.floor(steuer);
}

// Solidaritätszuschlag 2026 mit Freigrenze und Milderungszone
// 1:1-Logik aus EinkommensteuerSelbststaendigeRechner.tsx (Einzelveranlagung)
function berechneSoli(einkommensteuer: number): number {
  const freigrenze = SOLI_FREIGRENZE_EINZEL;
  if (einkommensteuer <= freigrenze) return 0;
  const milderung = SOLI_MILDERUNG * (einkommensteuer - freigrenze);
  const voll = SOLI_SATZ * einkommensteuer;
  return Math.round(Math.min(voll, milderung) * 100) / 100;
}

export function WegzugsteuerRechner() {
  // Eingaben
  const [gemeinerWert, setGemeinerWert] = useState(800000); // gemeiner Wert der Anteile
  const [anschaffungskosten, setAnschaffungskosten] = useState(50000); // Anschaffungskosten
  const [uebrigesZvE, setUebrigesZvE] = useState(0); // übriges zu versteuerndes Einkommen (Progression)

  const ergebnis = useMemo(() => {
    const gw = Math.max(0, gemeinerWert);
    const ak = Math.max(0, anschaffungskosten);
    const zvEUebrig = Math.max(0, uebrigesZvE);

    // 1. Fiktiver Veräußerungsgewinn (§ 6 AStG i. V. m. § 17 EStG)
    const gewinn = Math.max(0, gw - ak);

    // 2. Teileinkünfteverfahren § 3 Nr. 40 EStG: 60 % steuerpflichtig, 40 % steuerfrei
    const steuerpflichtigerGewinn = gewinn * TEV_ANTEIL;
    const steuerfreierAnteil = gewinn * (1 - TEV_ANTEIL);

    // 3. Wegzugsteuer-ESt = ESt(zvE + 60%×Gewinn) − ESt(zvE)
    //    (Differenzmethode: der fiktive Gewinn liegt "oben drauf" auf dem übrigen zvE)
    const estOhne = berechneEinkommensteuer(zvEUebrig);
    const estMit = berechneEinkommensteuer(zvEUebrig + steuerpflichtigerGewinn);
    const wegzugEst = Math.max(0, estMit - estOhne);

    // 4. Soli auf den ESt-Mehrbetrag (Differenz der Soli-Beträge, Freigrenze beachtet)
    const soliOhne = berechneSoli(estOhne);
    const soliMit = berechneSoli(estMit);
    const wegzugSoli = Math.max(0, soliMit - soliOhne);

    // 5. Wegzugsteuer gesamt
    const wegzugsteuerGesamt = wegzugEst + wegzugSoli;

    // 6. Effektiver Satz auf den Bruttogewinn (vor TEV)
    const effektiverSatz = gewinn > 0 ? (wegzugsteuerGesamt / gewinn) * 100 : 0;

    // 7. 7-Jahres-Rate (zinslose Stundung § 6 Abs. 4 AStG)
    const jahresrate = wegzugsteuerGesamt / RATEN_ANZAHL;

    return {
      gw,
      ak,
      zvEUebrig,
      gewinn,
      steuerpflichtigerGewinn,
      steuerfreierAnteil,
      estOhne,
      estMit,
      wegzugEst,
      soliOhne,
      soliMit,
      wegzugSoli,
      wegzugsteuerGesamt,
      effektiverSatz,
      jahresrate,
    };
  }, [gemeinerWert, anschaffungskosten, uebrigesZvE]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Wegzugsteuer-Rechner" rechnerSlug="wegzugsteuer-rechner" />

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">✈️</span> Ihre Angaben zur Beteiligung
        </h3>

        {/* Gemeiner Wert */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gemeiner Wert der Anteile</span>
            <span className="text-xs text-gray-500 block mt-1">
              Verkehrswert der Beteiligung im Zeitpunkt des Wegzugs (fiktiver Veräußerungspreis)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={gemeinerWert}
              onChange={(e) => setGemeinerWert(Math.max(0, Number(e.target.value) || 0))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(gemeinerWert, 5000000)}
            onChange={(e) => setGemeinerWert(Number(e.target.value) || 0)}
            className="w-full mt-3 accent-indigo-500"
            min="0"
            max="5000000"
            step="50000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>2,5 Mio €</span>
            <span>5 Mio €</span>
          </div>
        </div>

        {/* Anschaffungskosten */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anschaffungskosten der Anteile</span>
            <span className="text-xs text-gray-500 block mt-1">
              Ursprünglich eingezahltes Kapital bzw. Kaufpreis der Beteiligung (z. B. Stammeinlage)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={anschaffungskosten}
              onChange={(e) => setAnschaffungskosten(Math.max(0, Number(e.target.value) || 0))}
              className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>

        {/* Übriges zvE */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Übriges zu versteuerndes Einkommen</span>
            <span className="text-xs text-gray-500 block mt-1">
              Sonstiges zvE im Wegzugsjahr (für die Progression). Lassen Sie 0 stehen, wenn kein
              weiteres Einkommen anfällt – dann startet der Tarif von unten.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={uebrigesZvE}
              onChange={(e) => setUebrigesZvE(Math.max(0, Number(e.target.value) || 0))}
              className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">✈️ Wegzugsteuer nach § 6 AStG (2026)</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.wegzugsteuerGesamt)}</span>
            <span className="text-xl opacity-80">gesamt</span>
          </div>
          <p className="text-indigo-100 mt-2 text-sm">
            Effektiv {formatProzent(ergebnis.effektiverSatz)} auf den fiktiven Veräußerungsgewinn von{' '}
            {formatEuroRound(ergebnis.gewinn)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Einkommensteuer-Mehrbetrag</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.wegzugEst)}</div>
            <span className="text-xs opacity-70">§ 32a EStG</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Solidaritätszuschlag</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.wegzugSoli)}</div>
            <span className="text-xs opacity-70">5,5 % der ESt</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">7-Jahres-Rate</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.jahresrate)}</div>
            <span className="text-xs opacity-70">zinslos / Jahr</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Steuerpflichtig (60 % Teileinkünfteverfahren)</span>
            <span className="text-lg font-bold">{formatEuroRound(ergebnis.steuerpflichtigerGewinn)}</span>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          {/* Gewinn */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            1. Fiktiver Veräußerungsgewinn (§ 6 AStG i. V. m. § 17 EStG)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gemeiner Wert der Anteile</span>
            <span className="text-gray-900">{formatEuro(ergebnis.gw)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>− Anschaffungskosten</span>
            <span>{formatEuro(ergebnis.ak)}</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">= Veräußerungsgewinn</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.gewinn)}</span>
          </div>

          {/* TEV */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            2. Teileinkünfteverfahren (§ 3 Nr. 40 EStG)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>40 % steuerfrei</span>
            <span>{formatEuro(ergebnis.steuerfreierAnteil)}</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">= 60 % steuerpflichtiger Gewinn</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.steuerpflichtigerGewinn)}</span>
          </div>

          {/* ESt-Differenz */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            3. Einkommensteuer-Mehrbetrag (§ 32a EStG 2026, Grundtarif)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">ESt auf zvE + 60 % Gewinn</span>
            <span className="text-gray-900">{formatEuro(ergebnis.estMit)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>− ESt auf übriges zvE ({formatEuroRound(ergebnis.zvEUebrig)})</span>
            <span>{formatEuro(ergebnis.estOhne)}</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">= Einkommensteuer auf den Wegzug</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.wegzugEst)}</span>
          </div>

          {/* Soli */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            4. Solidaritätszuschlag (§ 4 SolZG, 5,5 % – Freigrenze beachtet)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">5,5 % auf den ESt-Mehrbetrag</span>
            <span className="text-gray-900">{formatEuro(ergebnis.wegzugSoli)}</span>
          </div>

          {/* Summe */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            5. Wegzugsteuer gesamt
          </div>
          <div className="flex justify-between py-2 bg-indigo-100 -mx-6 px-6">
            <span className="font-bold text-indigo-800">Einkommensteuer + Soli</span>
            <span className="font-bold text-2xl text-indigo-900">{formatEuro(ergebnis.wegzugsteuerGesamt)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Effektiver Satz auf den Bruttogewinn</span>
            <span className="font-bold text-gray-900">{formatProzent(ergebnis.effektiverSatz)}</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-indigo-200 mt-2">
            <span className="font-medium text-gray-700">Zinslose Jahresrate (÷ 7, § 6 Abs. 4 AStG)</span>
            <span className="font-bold text-indigo-700">{formatEuro(ergebnis.jahresrate)}</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-indigo-50 rounded-xl text-sm text-indigo-800">
          💡 Auf Antrag wird die Wegzugsteuer in <strong>7 gleichen, zinslosen Jahresraten</strong>{' '}
          gestundet (§ 6 Abs. 4 AStG, seit dem ATAD-Umsetzungsgesetz einheitlich für EU- und
          Drittstaaten-Fälle) – in der Regel gegen Sicherheitsleistung. Eine echte Freigrenze auf
          den Gewinn gibt es nicht; allein die 1-%-Beteiligungsschwelle des § 17 EStG ist relevant.
        </div>
      </div>

      {/* Info / Tatbestand */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wann greift die Wegzugsteuer?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Persönlicher Tatbestand:</strong> natürliche Person, die in den letzten 12 Jahren
              mindestens <strong>7 Jahre</strong> in Deutschland unbeschränkt steuerpflichtig war.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Beteiligung:</strong> Anteile an einer Kapitalgesellschaft i. S. d. § 17 EStG –
              also eine Beteiligung von <strong>mindestens 1 %</strong> innerhalb der letzten 5 Jahre.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Auslöser:</strong> Beendigung der unbeschränkten Steuerpflicht (Wegzug ins
              Ausland) – aber auch Schenkung/Erbschaft an im Ausland Ansässige oder Einlage in ein
              ausländisches Betriebsvermögen.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Rechtsfolge:</strong> fiktive Veräußerung zum gemeinen Wert – obwohl gar nicht
              verkauft wurde, wird der Wertzuwachs versteuert (60 % nach Teileinkünfteverfahren).
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Rückkehrerregelung (§ 6 Abs. 3 AStG):</strong> Bei Rückkehr binnen{' '}
              <strong>7 Jahren</strong> (auf Antrag verlängerbar um +5 auf maximal 12 Jahre) entfällt
              die Steuer rückwirkend – sofern die Anteile gehalten und keine schädlichen
              Ausschüttungen vorgenommen wurden.
            </span>
          </li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
          <span>⚠️</span> Wichtiger Hinweis
        </h3>
        <p className="text-sm text-amber-700">
          Die Wegzugsteuer (§ 6 AStG) zählt zu den komplexesten Bereichen des deutschen Steuerrechts.
          Dieser Rechner liefert eine <strong>vereinfachte Schätzung ohne Gewähr</strong> und{' '}
          <strong>ersetzt in keinem Fall eine individuelle Steuerberatung</strong>. Nicht
          berücksichtigt werden insbesondere: Regelungen aus Doppelbesteuerungsabkommen (DBA), ein
          möglicher Step-up der Anschaffungskosten im Zuzugsstaat, Verlustverrechnung, ein abweichender
          gemeiner Wert nach dem vereinfachten Ertragswertverfahren, Sicherheitsleistungen sowie die ab
          2026 verschärften Melde- und Mitwirkungspflichten und die Ausweitung auf Investmentfonds-Anteile.
          Vor jedem Wegzug mit relevanter Beteiligung ist eine Beratung durch einen Steuerberater oder
          Fachanwalt für Steuerrecht zwingend erforderlich.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
          Quellen &amp; Rechtsgrundlagen (Stand: 2026)
        </h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/astg/__6.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 6 AStG – Besteuerung des Vermögenszuwachses (Wegzugsbesteuerung)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__17.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 17 EStG – Veräußerung von Anteilen an Kapitalgesellschaften (≥ 1 %)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__3.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 3 Nr. 40 EStG – Teileinkünfteverfahren (40 % steuerfrei)
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 32a EStG – Einkommensteuertarif 2026
          </a>
          <a
            href="https://www.gesetze-im-internet.de/solzg_1995/__4.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 4 SolZG – Solidaritätszuschlag (5,5 %)
          </a>
        </div>
      </div>
    </div>
  );
}

export default WegzugsteuerRechner;
