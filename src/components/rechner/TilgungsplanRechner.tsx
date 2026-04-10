import { useState, useMemo, useRef } from 'react';
import RechnerFeedback from './RechnerFeedback';

interface TilgungsZeile {
  monat: number;
  jahr: number;
  monatImJahr: number;
  restschuldAnfang: number;
  zinsanteil: number;
  tilgungsanteil: number;
  sondertilgung: number;
  rate: number;
  restschuldEnde: number;
}

interface JahresZeile {
  jahr: number;
  restschuldAnfang: number;
  zinsenGesamt: number;
  tilgungGesamt: number;
  sondertilgungGesamt: number;
  ratenGesamt: number;
  restschuldEnde: number;
}

type EingabeModus = 'rate' | 'tilgung';

export default function TilgungsplanRechner() {
  // Eingabewerte
  const [kreditsumme, setKreditsumme] = useState(200000);
  const [zinssatz, setZinssatz] = useState(4.0);
  const [eingabeModus, setEingabeModus] = useState<EingabeModus>('rate');
  const [monatsrate, setMonatsrate] = useState(1000);
  const [anfangstilgung, setAnfangstilgung] = useState(2.0);
  const [sondertilgungJaehrlich, setSondertilgungJaehrlich] = useState(0);
  const [zinsbindung, setZinsbindung] = useState(10);
  const [ansicht, setAnsicht] = useState<'jahr' | 'monat'>('jahr');
  const [zeigeDetails, setZeigeDetails] = useState(true);
  
  const tableRef = useRef<HTMLDivElement>(null);

  const ergebnis = useMemo(() => {
    const K = kreditsumme;
    const pJahr = zinssatz / 100;
    const pMonat = pJahr / 12;
    
    // Rate berechnen je nach Modus
    let rate: number;
    if (eingabeModus === 'rate') {
      rate = monatsrate;
    } else {
      // Anfängliche Tilgung% gegeben → Rate berechnen
      // Jahresannuität = Kreditsumme × (Zinssatz + Tilgungssatz)
      const jahresAnnuitaet = K * (pJahr + anfangstilgung / 100);
      rate = jahresAnnuitaet / 12;
    }
    
    // Mindestrate prüfen (muss mindestens Zinsen decken)
    const minRate = K * pMonat;
    if (rate <= minRate) {
      return {
        error: true,
        errorMessage: `Rate zu niedrig! Mindestens ${(minRate + 1).toFixed(2)}€ nötig, um Zinsen zu decken.`,
        monatsrate: rate,
        gesamtzinsen: 0,
        gesamttilgung: 0,
        gesamtsondertilgung: 0,
        gesamtbetrag: 0,
        laufzeitMonate: 0,
        laufzeitJahre: 0,
        tilgungsplan: [] as TilgungsZeile[],
        jahresplan: [] as JahresZeile[],
        restschuldNachZinsbindung: 0,
        getilgtNachZinsbindung: 0,
      };
    }
    
    // Tilgungsplan monatlich berechnen
    const tilgungsplan: TilgungsZeile[] = [];
    let restschuld = K;
    let gesamtzinsen = 0;
    let gesamttilgung = 0;
    let gesamtsondertilgung = 0;
    let monat = 0;
    const maxMonate = 600; // Max 50 Jahre
    
    while (restschuld > 0.01 && monat < maxMonate) {
      monat++;
      const jahr = Math.ceil(monat / 12);
      const monatImJahr = ((monat - 1) % 12) + 1;
      
      const restschuldAnfang = restschuld;
      const zinsanteil = restschuld * pMonat;
      
      // Normale Tilgung
      let tilgungsanteil = rate - zinsanteil;
      
      // Sondertilgung im Dezember (Monat 12)
      let sondertilgung = 0;
      if (monatImJahr === 12 && sondertilgungJaehrlich > 0) {
        sondertilgung = Math.min(sondertilgungJaehrlich, restschuld - tilgungsanteil);
        sondertilgung = Math.max(0, sondertilgung);
      }
      
      // Letzte Rate anpassen
      const verbleibendeSchuld = restschuld - tilgungsanteil - sondertilgung;
      if (verbleibendeSchuld < 0) {
        tilgungsanteil = restschuld - sondertilgung;
        if (tilgungsanteil < 0) {
          sondertilgung = restschuld;
          tilgungsanteil = 0;
        }
      }
      
      const aktuelleRate = zinsanteil + tilgungsanteil;
      restschuld = Math.max(0, restschuld - tilgungsanteil - sondertilgung);
      
      gesamtzinsen += zinsanteil;
      gesamttilgung += tilgungsanteil;
      gesamtsondertilgung += sondertilgung;
      
      tilgungsplan.push({
        monat,
        jahr,
        monatImJahr,
        restschuldAnfang,
        zinsanteil,
        tilgungsanteil,
        sondertilgung,
        rate: aktuelleRate,
        restschuldEnde: restschuld,
      });
    }
    
    // Jahresplan aggregieren
    const jahresplan: JahresZeile[] = [];
    const jahreMax = Math.ceil(monat / 12);
    
    for (let j = 1; j <= jahreMax; j++) {
      const monateImJahr = tilgungsplan.filter(z => z.jahr === j);
      if (monateImJahr.length === 0) continue;
      
      jahresplan.push({
        jahr: j,
        restschuldAnfang: monateImJahr[0].restschuldAnfang,
        zinsenGesamt: monateImJahr.reduce((s, z) => s + z.zinsanteil, 0),
        tilgungGesamt: monateImJahr.reduce((s, z) => s + z.tilgungsanteil, 0),
        sondertilgungGesamt: monateImJahr.reduce((s, z) => s + z.sondertilgung, 0),
        ratenGesamt: monateImJahr.reduce((s, z) => s + z.rate + z.sondertilgung, 0),
        restschuldEnde: monateImJahr[monateImJahr.length - 1].restschuldEnde,
      });
    }
    
    // Restschuld nach Zinsbindung
    const zinsbindungMonate = zinsbindung * 12;
    const zeileNachZinsbindung = tilgungsplan.find(z => z.monat === zinsbindungMonate);
    const restschuldNachZinsbindung = zeileNachZinsbindung?.restschuldEnde ?? 
      (tilgungsplan.length >= zinsbindungMonate ? tilgungsplan[zinsbindungMonate - 1]?.restschuldEnde : restschuld);
    
    const getilgtBisZinsbindung = tilgungsplan
      .filter(z => z.monat <= zinsbindungMonate)
      .reduce((s, z) => s + z.tilgungsanteil + z.sondertilgung, 0);
    
    return {
      error: false,
      errorMessage: '',
      monatsrate: rate,
      gesamtzinsen,
      gesamttilgung,
      gesamtsondertilgung,
      gesamtbetrag: gesamtzinsen + gesamttilgung + gesamtsondertilgung,
      laufzeitMonate: monat,
      laufzeitJahre: monat / 12,
      tilgungsplan,
      jahresplan,
      restschuldNachZinsbindung: restschuldNachZinsbindung ?? 0,
      getilgtNachZinsbindung: getilgtBisZinsbindung,
    };
  }, [kreditsumme, zinssatz, eingabeModus, monatsrate, anfangstilgung, sondertilgungJaehrlich, zinsbindung]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  
  const formatEuroKurz = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
    
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  // CSV Export
  const exportCSV = () => {
    const headers = ansicht === 'jahr' 
      ? ['Jahr', 'Restschuld Anfang', 'Zinsen', 'Tilgung', 'Sondertilgung', 'Gesamt', 'Restschuld Ende']
      : ['Monat', 'Jahr', 'Restschuld Anfang', 'Zinsen', 'Tilgung', 'Sondertilgung', 'Rate', 'Restschuld Ende'];
    
    const rows = ansicht === 'jahr'
      ? ergebnis.jahresplan.map(z => [
          z.jahr,
          z.restschuldAnfang.toFixed(2),
          z.zinsenGesamt.toFixed(2),
          z.tilgungGesamt.toFixed(2),
          z.sondertilgungGesamt.toFixed(2),
          z.ratenGesamt.toFixed(2),
          z.restschuldEnde.toFixed(2),
        ])
      : ergebnis.tilgungsplan.map(z => [
          z.monat,
          z.jahr,
          z.restschuldAnfang.toFixed(2),
          z.zinsanteil.toFixed(2),
          z.tilgungsanteil.toFixed(2),
          z.sondertilgung.toFixed(2),
          z.rate.toFixed(2),
          z.restschuldEnde.toFixed(2),
        ]);
    
    const csvContent = [
      `Tilgungsplan - ${formatEuroKurz(kreditsumme)} @ ${zinssatz}%`,
      `Monatsrate: ${formatEuro(ergebnis.monatsrate)}`,
      `Laufzeit: ${ergebnis.laufzeitJahre.toFixed(1)} Jahre`,
      '',
      headers.join(';'),
      ...rows.map(r => r.join(';')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tilgungsplan_${kreditsumme}_${zinssatz}p.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Balkendiagramm für Zins vs Tilgung
  const zinsenAnteil = ergebnis.gesamtbetrag > 0 
    ? (ergebnis.gesamtzinsen / ergebnis.gesamtbetrag) * 100 
    : 0;
  const tilgungAnteil = 100 - zinsenAnteil;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kreditsumme */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Darlehenssumme</span>
            <span className="text-xs text-gray-500 block mt-1">Nettokreditbetrag ohne Nebenkosten</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kreditsumme}
              onChange={(e) => setKreditsumme(Math.max(10000, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="10000"
              max="2000000"
              step="5000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={kreditsumme}
            onChange={(e) => setKreditsumme(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="50000"
            max="1000000"
            step="10000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50.000 €</span>
            <span>500.000 €</span>
            <span>1.000.000 €</span>
          </div>
        </div>

        {/* Zinssatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Sollzinssatz (p.a.)</span>
            <span className="text-xs text-gray-500 block mt-1">Gebundener Sollzinssatz pro Jahr</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={zinssatz}
              onChange={(e) => setZinssatz(Math.max(0, Math.min(15, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              max="15"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
          </div>
          <input
            type="range"
            value={zinssatz}
            onChange={(e) => setZinssatz(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="1"
            max="8"
            step="0.1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1%</span>
            <span>4%</span>
            <span>8%</span>
          </div>
        </div>

        {/* Eingabemodus: Rate oder Tilgung% */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Berechnung nach</span>
          </label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setEingabeModus('rate')}
              className={`py-3 px-4 rounded-xl transition-all ${
                eingabeModus === 'rate'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">💶 Monatsrate</span>
              <span className="text-xs opacity-80">Feste Rate eingeben</span>
            </button>
            <button
              onClick={() => setEingabeModus('tilgung')}
              className={`py-3 px-4 rounded-xl transition-all ${
                eingabeModus === 'tilgung'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">📊 Tilgung %</span>
              <span className="text-xs opacity-80">Anfängliche Tilgung</span>
            </button>
          </div>

          {eingabeModus === 'rate' ? (
            <div className="relative">
              <input
                type="number"
                value={monatsrate}
                onChange={(e) => setMonatsrate(Math.max(100, Number(e.target.value)))}
                className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                min="100"
                max="20000"
                step="50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
            </div>
          ) : (
            <div className="relative">
              <input
                type="number"
                value={anfangstilgung}
                onChange={(e) => setAnfangstilgung(Math.max(0.5, Math.min(10, Number(e.target.value))))}
                className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                min="0.5"
                max="10"
                step="0.1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">% anfänglich</span>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            💡 {eingabeModus === 'rate' 
              ? 'Tipp: Bei Baufinanzierung üblich sind 800-1.500€/Monat'
              : 'Tipp: Mind. 2% anfängliche Tilgung empfohlen'}
          </p>
        </div>

        {/* Sondertilgung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jährliche Sondertilgung</span>
            <span className="text-xs text-gray-500 block mt-1">Optional: Extra-Tilgung pro Jahr (z.B. aus Bonus)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={sondertilgungJaehrlich}
              onChange={(e) => setSondertilgungJaehrlich(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              max="100000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Jahr</span>
          </div>
          <input
            type="range"
            value={sondertilgungJaehrlich}
            onChange={(e) => setSondertilgungJaehrlich(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="0"
            max="20000"
            step="1000"
          />
        </div>

        {/* Zinsbindung */}
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Zinsbindung</span>
            <span className="text-xs text-gray-500 block mt-1">Für Anschlussfinanzierung-Planung</span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setZinsbindung(Math.max(5, zinsbindung - 5))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center px-4">
              <div className="text-3xl font-bold text-gray-800">{zinsbindung}</div>
              <div className="text-sm text-gray-500">Jahre</div>
            </div>
            <button
              onClick={() => setZinsbindung(Math.min(30, zinsbindung + 5))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {ergebnis.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-6">
          <strong>⚠️ Fehler:</strong> {ergebnis.errorMessage}
        </div>
      )}

      {/* Result Section */}
      {!ergebnis.error && (
        <>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
            <h3 className="text-sm font-medium opacity-80 mb-1">💳 Ihre Monatsrate</h3>

            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatEuro(ergebnis.monatsrate)}</span>
                <span className="text-xl opacity-80">/ Monat</span>
              </div>
              <p className="text-emerald-100 mt-2 text-sm">
                Laufzeit: <strong>{ergebnis.laufzeitJahre.toFixed(1)} Jahre</strong> ({ergebnis.laufzeitMonate} Monate)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Gesamtkosten</span>
                <div className="text-xl font-bold">{formatEuroKurz(ergebnis.gesamtbetrag)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Davon Zinsen</span>
                <div className="text-xl font-bold text-red-200">{formatEuroKurz(ergebnis.gesamtzinsen)}</div>
              </div>
            </div>

            {/* Balkendiagramm Zinsen vs. Tilgung */}
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between text-sm mb-2">
                <span>Tilgung: {formatEuroKurz(kreditsumme)}</span>
                <span>Zinsen: {formatEuroKurz(ergebnis.gesamtzinsen)}</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden bg-white/20 flex">
                <div
                  className="bg-white h-full transition-all duration-500"
                  style={{ width: `${tilgungAnteil}%` }}
                ></div>
                <div
                  className="bg-red-400 h-full transition-all duration-500"
                  style={{ width: `${zinsenAnteil}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1 opacity-70">
                <span>{tilgungAnteil.toFixed(1)}% Tilgung</span>
                <span>{zinsenAnteil.toFixed(1)}% Zinsen</span>
              </div>
            </div>
          </div>

          {/* Zinsbindung Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-amber-800 mb-3">📅 Nach {zinsbindung} Jahren Zinsbindung</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-amber-700">Restschuld</span>
                <div className="text-2xl font-bold text-amber-900">
                  {formatEuroKurz(ergebnis.restschuldNachZinsbindung)}
                </div>
              </div>
              <div>
                <span className="text-sm text-amber-700">Bereits getilgt</span>
                <div className="text-2xl font-bold text-emerald-700">
                  {formatEuroKurz(ergebnis.getilgtNachZinsbindung)}
                </div>
              </div>
            </div>
            <p className="text-sm text-amber-700 mt-3">
              💡 Nach der Zinsbindung muss die Restschuld zu neuen Konditionen refinanziert werden.
            </p>
          </div>

          {/* Tilgungsplan */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6" ref={tableRef}>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <h3 className="font-bold text-gray-800">📊 Tilgungsplan</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setAnsicht('jahr')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    ansicht === 'jahr'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Jährlich
                </button>
                <button
                  onClick={() => setAnsicht('monat')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    ansicht === 'monat'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Monatlich
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setZeigeDetails(!zeigeDetails)}
                className="px-3 py-1 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                {zeigeDetails ? '▲ Ausblenden' : '▼ Anzeigen'}
              </button>
              <button
                onClick={exportCSV}
                className="px-3 py-1 rounded-lg text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                📥 CSV Export
              </button>
            </div>

            {zeigeDetails && (
              <div className="overflow-x-auto">
                {ansicht === 'jahr' ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 text-gray-600">Jahr</th>
                        <th className="text-right py-2 text-gray-600">Restschuld<br/>Anfang</th>
                        <th className="text-right py-2 text-gray-600">Zinsen</th>
                        <th className="text-right py-2 text-gray-600">Tilgung</th>
                        {sondertilgungJaehrlich > 0 && (
                          <th className="text-right py-2 text-gray-600">Sonder</th>
                        )}
                        <th className="text-right py-2 text-gray-600">Restschuld<br/>Ende</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ergebnis.jahresplan.map((zeile) => (
                        <tr 
                          key={zeile.jahr} 
                          className={`border-b border-gray-100 ${zeile.jahr === zinsbindung ? 'bg-amber-50' : ''}`}
                        >
                          <td className="py-2 font-medium">
                            {zeile.jahr}
                            {zeile.jahr === zinsbindung && <span className="text-amber-600 ml-1">*</span>}
                          </td>
                          <td className="text-right py-2">{formatEuroKurz(zeile.restschuldAnfang)}</td>
                          <td className="text-right py-2 text-red-600">{formatEuroKurz(zeile.zinsenGesamt)}</td>
                          <td className="text-right py-2 text-emerald-600">{formatEuroKurz(zeile.tilgungGesamt)}</td>
                          {sondertilgungJaehrlich > 0 && (
                            <td className="text-right py-2 text-blue-600">{formatEuroKurz(zeile.sondertilgungGesamt)}</td>
                          )}
                          <td className="text-right py-2 font-medium">{formatEuroKurz(zeile.restschuldEnde)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-bold">
                        <td className="py-2">Gesamt</td>
                        <td className="text-right py-2">{formatEuroKurz(kreditsumme)}</td>
                        <td className="text-right py-2 text-red-600">{formatEuroKurz(ergebnis.gesamtzinsen)}</td>
                        <td className="text-right py-2 text-emerald-600">{formatEuroKurz(ergebnis.gesamttilgung)}</td>
                        {sondertilgungJaehrlich > 0 && (
                          <td className="text-right py-2 text-blue-600">{formatEuroKurz(ergebnis.gesamtsondertilgung)}</td>
                        )}
                        <td className="text-right py-2">0 €</td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-2 text-gray-600">M</th>
                          <th className="text-right py-2 text-gray-600">Restschuld</th>
                          <th className="text-right py-2 text-gray-600">Zinsen</th>
                          <th className="text-right py-2 text-gray-600">Tilgung</th>
                          <th className="text-right py-2 text-gray-600">Rest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ergebnis.tilgungsplan.map((zeile) => (
                          <tr 
                            key={zeile.monat} 
                            className={`border-b border-gray-100 ${zeile.monat === zinsbindung * 12 ? 'bg-amber-50' : ''}`}
                          >
                            <td className="py-1">
                              {zeile.monat}
                              {zeile.monatImJahr === 1 && <span className="text-gray-400 ml-1">(J{zeile.jahr})</span>}
                            </td>
                            <td className="text-right py-1">{formatEuroKurz(zeile.restschuldAnfang)}</td>
                            <td className="text-right py-1 text-red-600">{formatEuro(zeile.zinsanteil)}</td>
                            <td className="text-right py-1 text-emerald-600">
                              {formatEuro(zeile.tilgungsanteil)}
                              {zeile.sondertilgung > 0 && (
                                <span className="text-blue-600 ml-1">(+{formatEuroKurz(zeile.sondertilgung)})</span>
                              )}
                            </td>
                            <td className="text-right py-1 font-medium">{formatEuroKurz(zeile.restschuldEnde)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {ansicht === 'jahr' && zinsbindung <= ergebnis.laufzeitJahre && (
              <p className="text-xs text-amber-600 mt-2">* Ende der Zinsbindung</p>
            )}
          </div>

          {/* Berechnungsdetails */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📋 Zusammenfassung</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Darlehenssumme</span>
                <span className="font-bold text-gray-900">{formatEuroKurz(kreditsumme)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Sollzinssatz (p.a.)</span>
                <span className="text-gray-900">{formatProzent(zinssatz)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Monatliche Rate</span>
                <span className="font-bold text-gray-900">{formatEuro(ergebnis.monatsrate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Anfängliche Tilgung</span>
                <span className="text-gray-900">
                  {formatProzent((ergebnis.monatsrate * 12 - kreditsumme * zinssatz / 100) / kreditsumme * 100)}
                </span>
              </div>
              {sondertilgungJaehrlich > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Sondertilgung/Jahr</span>
                  <span className="text-blue-700">{formatEuroKurz(sondertilgungJaehrlich)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Gesamtlaufzeit</span>
                <span className="text-gray-900">
                  {ergebnis.laufzeitJahre.toFixed(1)} Jahre ({ergebnis.laufzeitMonate} Monate)
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
                <span>Gesamte Zinskosten</span>
                <span className="font-bold">{formatEuro(ergebnis.gesamtzinsen)}</span>
              </div>
              <div className="flex justify-between py-3 bg-emerald-50 -mx-6 px-6 rounded-b-xl">
                <span className="font-bold text-emerald-800">Gesamtrückzahlung</span>
                <span className="font-bold text-2xl text-emerald-900">
                  {formatEuroKurz(ergebnis.gesamtbetrag)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Info Section: Wie funktioniert ein Annuitätendarlehen? */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wie funktioniert ein Annuitätendarlehen?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>📊</span>
            <span>
              <strong>Konstante Rate:</strong> Die monatliche Rate (Annuität) bleibt über die gesamte
              Zinsbindung gleich – bestehend aus Zins- und Tilgungsanteil.
            </span>
          </li>
          <li className="flex gap-2">
            <span>📉</span>
            <span>
              <strong>Zinsanteil sinkt:</strong> Mit jeder Rate wird ein Teil der Schuld getilgt. 
              Da die Restschuld sinkt, werden auch die Zinsen weniger.
            </span>
          </li>
          <li className="flex gap-2">
            <span>📈</span>
            <span>
              <strong>Tilgung steigt:</strong> Der "gesparte" Zinsanteil fließt automatisch in 
              höhere Tilgung – die Rate bleibt aber gleich.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🔄</span>
            <span>
              <strong>Zinsbindung:</strong> Der Zinssatz ist nur für die vereinbarte Zeit fest. 
              Danach muss neu verhandelt werden (Anschlussfinanzierung).
            </span>
          </li>
        </ul>
      </div>

      {/* Tipps zur Baufinanzierung */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💡 Tipps zur Baufinanzierung</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Mind. 2% Tilgung:</strong> Bei niedrigen Zinsen ist eine höhere Tilgung wichtig,
              sonst dauert die Rückzahlung sehr lange.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Sondertilgung vereinbaren:</strong> Vertraglich 5-10% jährliche Sondertilgung 
              sichern – oft kostenlos. Spart viel Geld!
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Eigenkapital:</strong> Mind. 20% Eigenkapital sind ideal. Damit bekommen Sie 
              bessere Zinsen und sparen die Risikoaufschläge.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Nebenkosten beachten:</strong> Kaufnebenkosten (Grunderwerbsteuer, Notar, Makler)
              betragen ca. 10-15% und sollten aus Eigenkapital bezahlt werden.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Lange Zinsbindung bei niedrigen Zinsen:</strong> Bei günstigen Zinsen lohnt sich
              eine Bindung von 15-20 Jahren für Planungssicherheit.
            </span>
          </li>
        </ul>
      </div>

      {/* Formel-Erklärung */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 Die Annuitätenformel</h3>
        <div className="text-sm text-gray-600 space-y-3">
          <p>Die <strong>monatliche Rate</strong> bei einem Annuitätendarlehen berechnet sich:</p>
          <div className="bg-white p-4 rounded-xl font-mono text-center">
            Rate = K × (i × (1+i)ⁿ) / ((1+i)ⁿ - 1)
          </div>
          <ul className="space-y-1 mt-3">
            <li><strong>K</strong> = Kreditsumme</li>
            <li><strong>i</strong> = Monatszins (Jahreszins ÷ 12)</li>
            <li><strong>n</strong> = Anzahl der Monate</li>
          </ul>
          <p className="mt-3">
            <strong>Pro Monat:</strong><br/>
            Zinsanteil = Restschuld × Monatszins<br/>
            Tilgungsanteil = Rate − Zinsanteil<br/>
            Neue Restschuld = Alte Restschuld − Tilgungsanteil
          </p>
        </div>
      </div>

            <RechnerFeedback rechnerName="Tilgungsplan-Rechner" rechnerSlug="tilgungsplan-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/bgb/__488.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BGB § 488 – Darlehensvertrag
          </a>
          <a
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/bau-und-immobilienfinanzierung"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Baufinanzierung
          </a>
          <a
            href="https://www.interhyp.de/ratgeber/was-muss-ich-wissen/tilgung/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Interhyp – Tilgung bei der Baufinanzierung
          </a>
        </div>
      </div>
    </div>
  );
}
