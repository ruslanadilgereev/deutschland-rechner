import { useState, useMemo } from 'react';

interface JahresWert {
  jahr: number;
  einzahlung: number;
  zinsen: number;
  endwert: number;
  kumulierteEinzahlungen: number;
  kumulierteZinsen: number;
}

export default function ZinseszinsRechner() {
  // Eingabewerte
  const [startkapital, setStartkapital] = useState(10000);
  const [zinssatz, setZinssatz] = useState(5);
  const [laufzeit, setLaufzeit] = useState(10);
  const [sparrate, setSparrate] = useState(200);
  const [sparintervall, setSparintervall] = useState<'monatlich' | 'jaehrlich'>('monatlich');
  const [zinseszins, setZinseszins] = useState(true);
  const [zeigeTabelle, setZeigeTabelle] = useState(false);

  const ergebnis = useMemo(() => {
    const P = startkapital; // Startkapital
    const r = zinssatz / 100; // Jährlicher Zinssatz
    const n = laufzeit; // Jahre
    const S = sparrate; // Sparrate
    
    // Zinseszins-Berechnung mit regelmäßigen Einzahlungen
    // Endwert = P * (1 + r)^n + S * ((1 + r)^n - 1) / r * (1 + r)^(1/12 oder 0)
    
    const jahreswerte: JahresWert[] = [];
    let aktuellerWert = P;
    let kumulierteEinzahlungen = P;
    let kumulierteZinsen = 0;
    
    // Monatlicher oder jährlicher Zinsfaktor
    const sparratenProJahr = sparintervall === 'monatlich' ? 12 : 1;
    const einzahlungProJahr = S * sparratenProJahr;
    
    for (let jahr = 1; jahr <= n; jahr++) {
      let zinsenImJahr = 0;
      
      if (sparintervall === 'monatlich') {
        // Monatliche Berechnung für präzisere Ergebnisse
        for (let monat = 1; monat <= 12; monat++) {
          // Zuerst Sparrate hinzufügen
          aktuellerWert += S;
          kumulierteEinzahlungen += S;
          
          // Dann Zinsen auf aktuellen Wert berechnen
          if (zinseszins) {
            const monatsZins = aktuellerWert * (r / 12);
            zinsenImJahr += monatsZins;
            aktuellerWert += monatsZins;
          }
        }
        // Bei einfachem Zins: Zinsen am Jahresende auf Startkapital
        if (!zinseszins) {
          zinsenImJahr = P * r;
          aktuellerWert = kumulierteEinzahlungen + (P * r * jahr);
        }
      } else {
        // Jährliche Einzahlung
        aktuellerWert += S;
        kumulierteEinzahlungen += S;
        
        if (zinseszins) {
          zinsenImJahr = aktuellerWert * r;
          aktuellerWert += zinsenImJahr;
        } else {
          zinsenImJahr = P * r;
          aktuellerWert = kumulierteEinzahlungen + (P * r * jahr);
        }
      }
      
      kumulierteZinsen += zinsenImJahr;
      
      jahreswerte.push({
        jahr,
        einzahlung: einzahlungProJahr,
        zinsen: zinsenImJahr,
        endwert: aktuellerWert,
        kumulierteEinzahlungen,
        kumulierteZinsen,
      });
    }
    
    const endwert = aktuellerWert;
    const gesamtEinzahlungen = kumulierteEinzahlungen;
    const gesamtZinsen = kumulierteZinsen;
    
    // Verdopplungszeit (Rule of 72)
    const verdopplungszeit = r > 0 ? 72 / (r * 100) : Infinity;
    
    // Effektive Rendite (CAGR)
    const cagr = gesamtEinzahlungen > 0 
      ? (Math.pow(endwert / startkapital, 1 / n) - 1) * 100 
      : 0;
    
    return {
      startkapital: P,
      zinssatz,
      laufzeit: n,
      sparrate: S,
      sparintervall,
      endwert,
      gesamtEinzahlungen,
      gesamtZinsen,
      verdopplungszeit,
      cagr,
      jahreswerte,
      gewinnProzent: gesamtEinzahlungen > 0 
        ? ((endwert - gesamtEinzahlungen) / gesamtEinzahlungen) * 100 
        : 0,
    };
  }, [startkapital, zinssatz, laufzeit, sparrate, sparintervall, zinseszins]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuroExact = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  const formatJahre = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Jahre';

  // Für Balkendiagramm
  const einzahlungsAnteil = (ergebnis.gesamtEinzahlungen / ergebnis.endwert) * 100;
  const zinsenAnteil = 100 - einzahlungsAnteil;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        
        {/* Zinseszins Toggle */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Berechnungsmethode</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setZinseszins(true)}
              className={`py-4 px-4 rounded-xl transition-all ${
                zinseszins
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">📈 Zinseszins</span>
              <span className="text-xs opacity-80">Zinsen werden mitverzinst</span>
            </button>
            <button
              onClick={() => setZinseszins(false)}
              className={`py-4 px-4 rounded-xl transition-all ${
                !zinseszins
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">➡️ Einfacher Zins</span>
              <span className="text-xs opacity-80">Nur Zinsen auf Startkapital</span>
            </button>
          </div>
        </div>

        {/* Startkapital */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Startkapital (Anfangsbetrag)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={startkapital}
              onChange={(e) => setStartkapital(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              max="1000000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={startkapital}
            onChange={(e) => setStartkapital(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="0"
            max="100000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>50.000 €</span>
            <span>100.000 €</span>
          </div>
        </div>

        {/* Zinssatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jährlicher Zinssatz</span>
            <span className="text-xs text-gray-500 block mt-1">Erwartete Rendite pro Jahr</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={zinssatz}
              onChange={(e) => setZinssatz(Math.max(0, Math.min(30, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              max="30"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
          </div>
          <input
            type="range"
            value={zinssatz}
            onChange={(e) => setZinssatz(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="0"
            max="15"
            step="0.25"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>7,5%</span>
            <span>15%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            💡 Tagesgeld: 2-3% | Anleihen: 3-5% | ETFs: 5-8% | Aktien: 7-10%
          </p>
        </div>

        {/* Laufzeit */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anlagedauer</span>
          </label>
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={() => setLaufzeit(Math.max(1, laufzeit - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-gray-800">{laufzeit}</div>
              <div className="text-sm text-gray-500">Jahre</div>
            </div>
            <button
              onClick={() => setLaufzeit(Math.min(50, laufzeit + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
          <input
            type="range"
            value={laufzeit}
            onChange={(e) => setLaufzeit(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
            min="1"
            max="50"
            step="1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 Jahr</span>
            <span>25 Jahre</span>
            <span>50 Jahre</span>
          </div>
        </div>

        {/* Sparrate */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Regelmäßige Sparrate</span>
            <span className="text-xs text-gray-500 block mt-1">Zusätzliche Einzahlungen</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={sparrate}
              onChange={(e) => setSparrate(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              max="10000"
              step="25"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
          <input
            type="range"
            value={sparrate}
            onChange={(e) => setSparrate(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="0"
            max="2000"
            step="25"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>1.000 €</span>
            <span>2.000 €</span>
          </div>
        </div>

        {/* Sparintervall */}
        <div className="mb-2">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Sparintervall</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSparintervall('monatlich')}
              className={`py-3 px-4 rounded-xl transition-all ${
                sparintervall === 'monatlich'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold">📅 Monatlich</span>
            </button>
            <button
              onClick={() => setSparintervall('jaehrlich')}
              className={`py-3 px-4 rounded-xl transition-all ${
                sparintervall === 'jaehrlich'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold">📆 Jährlich</span>
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">💰 Endvermögen nach {laufzeit} Jahren</h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.endwert)}</span>
          </div>
          <p className="text-emerald-100 mt-2 text-sm">
            📈 Gewinn: <strong>{formatEuro(ergebnis.gesamtZinsen)}</strong> ({formatProzent(ergebnis.gewinnProzent)})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Einzahlungen gesamt</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.gesamtEinzahlungen)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Zinsen/Rendite</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.gesamtZinsen)}</div>
          </div>
        </div>

        {/* Balkendiagramm Einzahlungen vs. Zinsen */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between text-sm mb-2">
            <span>Einzahlungen: {formatEuro(ergebnis.gesamtEinzahlungen)}</span>
            <span>Zinsen: {formatEuro(ergebnis.gesamtZinsen)}</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden bg-white/20 flex">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${einzahlungsAnteil}%` }}
            ></div>
            <div
              className="bg-green-300 h-full transition-all duration-500"
              style={{ width: `${zinsenAnteil}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1 opacity-70">
            <span>{einzahlungsAnteil.toFixed(1)}% Einzahlungen</span>
            <span>{zinsenAnteil.toFixed(1)}% Zinsen</span>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Startkapital</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.startkapital)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Jährlicher Zinssatz</span>
            <span className="text-gray-900">{formatProzent(ergebnis.zinssatz)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Anlagedauer</span>
            <span className="text-gray-900">{ergebnis.laufzeit} Jahre</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Sparrate ({sparintervall})</span>
            <span className="text-gray-900">{formatEuro(ergebnis.sparrate)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Berechnungsmethode</span>
            <span className="text-gray-900">{zinseszins ? 'Zinseszins' : 'Einfacher Zins'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gesamte Einzahlungen</span>
            <span className="text-gray-900">{formatEuroExact(ergebnis.gesamtEinzahlungen)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>Gesamte Zinsen/Rendite</span>
            <span className="font-bold">{formatEuroExact(ergebnis.gesamtZinsen)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Verdopplungszeit (72er-Regel)</span>
            <span className="text-gray-900">ca. {formatJahre(ergebnis.verdopplungszeit)}</span>
          </div>
          <div className="flex justify-between py-3 bg-emerald-50 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-emerald-800">Endvermögen</span>
            <span className="font-bold text-2xl text-emerald-900">
              {formatEuroExact(ergebnis.endwert)}
            </span>
          </div>
        </div>
      </div>

      {/* Jahresübersicht */}
      {ergebnis.jahreswerte.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">📅 Vermögensentwicklung</h3>
            <button
              onClick={() => setZeigeTabelle(!zeigeTabelle)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                zeigeTabelle
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {zeigeTabelle ? '▲ Ausblenden' : '▼ Tabelle anzeigen'}
            </button>
          </div>

          {zeigeTabelle && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 text-gray-600">Jahr</th>
                    <th className="text-right py-2 text-gray-600">Einzahlung</th>
                    <th className="text-right py-2 text-gray-600">Zinsen</th>
                    <th className="text-right py-2 text-gray-600">Endwert</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="py-2 font-medium">Start</td>
                    <td className="text-right py-2">{formatEuro(startkapital)}</td>
                    <td className="text-right py-2 text-green-600">–</td>
                    <td className="text-right py-2 font-medium">{formatEuro(startkapital)}</td>
                  </tr>
                  {ergebnis.jahreswerte.map((zeile) => (
                    <tr key={zeile.jahr} className="border-b border-gray-100">
                      <td className="py-2 font-medium">{zeile.jahr}</td>
                      <td className="text-right py-2">{formatEuro(zeile.einzahlung)}</td>
                      <td className="text-right py-2 text-green-600">{formatEuro(zeile.zinsen)}</td>
                      <td className="text-right py-2 font-medium">{formatEuro(zeile.endwert)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 font-bold">
                    <td className="py-2">Gesamt</td>
                    <td className="text-right py-2">{formatEuro(ergebnis.gesamtEinzahlungen)}</td>
                    <td className="text-right py-2 text-green-600">{formatEuro(ergebnis.gesamtZinsen)}</td>
                    <td className="text-right py-2">{formatEuro(ergebnis.endwert)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Was ist der Zinseszins-Effekt?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>📈</span>
            <span>
              <strong>Zinseszins:</strong> Ihre Zinsen werden mitverzinst. Das Kapital wächst exponentiell – 
              der Effekt wird über längere Zeiträume immer stärker.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🧮</span>
            <span>
              <strong>Formel:</strong> Endkapital = Startkapital × (1 + Zinssatz)^Jahre. Bei 5% Zinsen 
              verdoppelt sich Ihr Geld in ca. 14 Jahren.
            </span>
          </li>
          <li className="flex gap-2">
            <span>⏱️</span>
            <span>
              <strong>72er-Regel:</strong> Teilen Sie 72 durch den Zinssatz, um die Verdopplungszeit 
              zu berechnen. Bei 6% Zinsen: 72 ÷ 6 = 12 Jahre.
            </span>
          </li>
          <li className="flex gap-2">
            <span>💡</span>
            <span>
              <strong>Zeitfaktor:</strong> Der wichtigste Faktor ist die Zeit. Je früher Sie anfangen 
              zu sparen, desto mehr profitieren Sie vom Zinseszins-Effekt.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🎯</span>
            <span>
              <strong>Cost-Average-Effekt:</strong> Regelmäßige Sparraten glätten Kursschwankungen 
              und reduzieren das Risiko bei Aktien/ETFs.
            </span>
          </li>
        </ul>
      </div>

      {/* Beispielrechnungen */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💡 Beispiele für den Zinseszins-Effekt</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>10.000€ bei 5% über 30 Jahre:</strong> Ohne Zinseszins: 25.000€. 
              Mit Zinseszins: 43.219€ – fast das Doppelte!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>200€/Monat bei 7% über 30 Jahre:</strong> Einzahlungen: 72.000€. 
              Endwert: ca. 243.000€ – über 170.000€ Zinsen!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Früh anfangen lohnt sich:</strong> Mit 25 Jahren 200€/Monat bei 7% 
              bis 65 = 525.000€. Ab 35 Jahren: nur 262.000€.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>ETF-Sparplan:</strong> Der MSCI World erzielte historisch ca. 7-8% p.a. 
              Ein ETF-Sparplan nutzt den Zinseszins optimal.
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
              <strong>Keine Garantie:</strong> Die Berechnung zeigt theoretische Werte. Tatsächliche 
              Renditen bei Aktien/ETFs schwanken stark.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Inflation beachten:</strong> Bei 2% Inflation verliert Ihr Geld jährlich 
              an Kaufkraft. Reale Rendite = Nominalrendite - Inflation.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Steuern:</strong> Kapitalerträge unterliegen der Abgeltungssteuer (25% + Soli). 
              Sparerpauschbetrag: 1.000€/Person (2.000€ für Paare).
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Kosten beachten:</strong> Depotgebühren und Fondskosten (TER) reduzieren 
              Ihre tatsächliche Rendite. Günstige ETFs haben oft nur 0,1-0,2% TER.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Risiko vs. Rendite:</strong> Höhere Renditen bedeuten höheres Risiko. 
              Diversifizieren Sie Ihr Portfolio!
            </span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde / Verbraucherschutz */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Informationen & Beratung</h3>
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="font-semibold text-emerald-900">Unabhängige Finanzberatung</p>
            <p className="text-sm text-emerald-700 mt-1">
              Die Verbraucherzentralen bieten kostengünstige, unabhängige Finanzberatung an.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Verbraucherzentrale</p>
                <a
                  href="https://www.verbraucherzentrale.de/geldanlage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Geldanlage-Tipps →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">BaFin</p>
                <a
                  href="https://www.bafin.de/DE/Verbraucher/verbraucher_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Verbraucher-Infos →
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-medium text-gray-800">Steuern auf Kapitalerträge</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Abgeltungssteuer: 25% auf Zinsen, Dividenden, Kursgewinne</li>
                <li>• Solidaritätszuschlag: 5,5% auf die Abgeltungssteuer</li>
                <li>• Sparerpauschbetrag: 1.000€/Jahr (2.000€ für Ehepaare)</li>
                <li>• Freistellungsauftrag einrichten, um Pauschbetrag zu nutzen</li>
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
            href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesbank – Aktuelle Zinssätze und Renditen
          </a>
          <a
            href="https://www.gesetze-im-internet.de/estg/__20.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            EStG § 20 – Kapitalerträge
          </a>
          <a
            href="https://www.bafin.de/DE/Verbraucher/verbraucher_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BaFin – Verbraucherinformationen
          </a>
          <a
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/geldanlage"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Geldanlage
          </a>
          <a
            href="https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Verbraucherpreisindex/_inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Statistisches Bundesamt – Verbraucherpreisindex/Inflation
          </a>
        </div>
      </div>
    </div>
  );
}
