import { useState, useMemo } from 'react';

type Berechnungsart = 'endvermoegen' | 'sparrate' | 'laufzeit';

interface JahresWert {
  jahr: number;
  einzahlung: number;
  zinsen: number;
  endwert: number;
  kumulierteEinzahlungen: number;
  kumulierteZinsen: number;
}

export default function SparRechner() {
  // Berechnungsart
  const [berechnungsart, setBerechnungsart] = useState<Berechnungsart>('endvermoegen');
  
  // Eingabewerte
  const [startkapital, setStartkapital] = useState(0);
  const [sparrate, setSparrate] = useState(200);
  const [zinssatz, setZinssatz] = useState(4);
  const [laufzeit, setLaufzeit] = useState(10);
  const [zielBetrag, setZielBetrag] = useState(50000);
  const [sparintervall, setSparintervall] = useState<'monatlich' | 'jaehrlich'>('monatlich');
  const [zeigeTabelle, setZeigeTabelle] = useState(false);

  const ergebnis = useMemo(() => {
    const P = startkapital;
    const r = zinssatz / 100;
    const monatlicheRate = sparintervall === 'monatlich' ? sparrate : sparrate / 12;
    
    // 1. Endvermögen berechnen (bei gegebener Sparrate und Laufzeit)
    if (berechnungsart === 'endvermoegen') {
      const jahreswerte: JahresWert[] = [];
      let aktuellerWert = P;
      let kumulierteEinzahlungen = P;
      let kumulierteZinsen = 0;
      
      const einzahlungProJahr = sparintervall === 'monatlich' ? sparrate * 12 : sparrate;
      
      for (let jahr = 1; jahr <= laufzeit; jahr++) {
        let zinsenImJahr = 0;
        
        if (sparintervall === 'monatlich') {
          for (let monat = 1; monat <= 12; monat++) {
            aktuellerWert += sparrate;
            kumulierteEinzahlungen += sparrate;
            const monatsZins = aktuellerWert * (r / 12);
            zinsenImJahr += monatsZins;
            aktuellerWert += monatsZins;
          }
        } else {
          aktuellerWert += sparrate;
          kumulierteEinzahlungen += sparrate;
          zinsenImJahr = aktuellerWert * r;
          aktuellerWert += zinsenImJahr;
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
      
      return {
        type: 'endvermoegen' as const,
        endwert: aktuellerWert,
        gesamtEinzahlungen: kumulierteEinzahlungen,
        gesamtZinsen: kumulierteZinsen,
        sparrate,
        laufzeit,
        jahreswerte,
      };
    }
    
    // 2. Benötigte Sparrate berechnen (bei gegebenem Ziel und Laufzeit)
    if (berechnungsart === 'sparrate') {
      // Formel: S = (FV - P*(1+r)^n) * r / ((1+r)^n - 1)
      // Bei monatlicher Verzinsung: rm = r/12
      
      const n = laufzeit;
      const rMonatlich = r / 12;
      const anzahlMonate = n * 12;
      
      // Endwert des Startkapitals
      const startkapitalEndwert = P * Math.pow(1 + rMonatlich, anzahlMonate);
      
      // Benötigte Summe aus Sparraten
      const benoetigtAusRaten = zielBetrag - startkapitalEndwert;
      
      let benoetigteSparrate: number;
      
      if (r === 0) {
        benoetigteSparrate = benoetigtAusRaten / anzahlMonate;
      } else {
        // Annuität-Formel umgestellt: S = (FV - P*(1+r)^n) * r / ((1+r)^n - 1)
        const faktor = (Math.pow(1 + rMonatlich, anzahlMonate) - 1) / rMonatlich;
        benoetigteSparrate = benoetigtAusRaten / faktor;
      }
      
      // Validierung
      if (benoetigteSparrate < 0) {
        benoetigteSparrate = 0; // Startkapital reicht bereits
      }
      
      const gesamtEinzahlungen = P + (benoetigteSparrate * anzahlMonate);
      const gesamtZinsen = zielBetrag - gesamtEinzahlungen;
      
      return {
        type: 'sparrate' as const,
        benoetigteSparrate: sparintervall === 'monatlich' ? benoetigteSparrate : benoetigteSparrate * 12,
        zielBetrag,
        laufzeit,
        gesamtEinzahlungen,
        gesamtZinsen,
        startkapitalReicht: benoetigteSparrate <= 0,
      };
    }
    
    // 3. Benötigte Laufzeit berechnen (bei gegebener Sparrate und Ziel)
    if (berechnungsart === 'laufzeit') {
      const S = sparintervall === 'monatlich' ? sparrate : sparrate / 12;
      const rMonatlich = r / 12;
      
      if (S <= 0 && P <= 0) {
        return {
          type: 'laufzeit' as const,
          benoetigteMonate: Infinity,
          benoetigteJahre: Infinity,
          zielBetrag,
          gesamtEinzahlungen: 0,
          gesamtZinsen: 0,
          nichtErreichbar: true,
        };
      }
      
      let monate = 0;
      let aktuellerWert = P;
      const maxMonate = 100 * 12; // Max 100 Jahre
      
      while (aktuellerWert < zielBetrag && monate < maxMonate) {
        aktuellerWert += S;
        if (r > 0) {
          aktuellerWert *= (1 + rMonatlich);
        }
        monate++;
      }
      
      const gesamtEinzahlungen = P + (S * monate);
      const gesamtZinsen = aktuellerWert - gesamtEinzahlungen;
      
      return {
        type: 'laufzeit' as const,
        benoetigteMonate: monate,
        benoetigteJahre: monate / 12,
        zielBetrag,
        endwert: aktuellerWert,
        gesamtEinzahlungen,
        gesamtZinsen,
        nichtErreichbar: monate >= maxMonate,
      };
    }
    
    return null;
  }, [berechnungsart, startkapital, sparrate, zinssatz, laufzeit, zielBetrag, sparintervall]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuroExact = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  // Berechnungsart-Beschreibung
  const berechnungsarten = [
    { id: 'endvermoegen' as const, name: '💰 Endvermögen', desc: 'Wie viel habe ich am Ende?' },
    { id: 'sparrate' as const, name: '📊 Sparrate', desc: 'Wie viel muss ich sparen?' },
    { id: 'laufzeit' as const, name: '⏱️ Laufzeit', desc: 'Wie lange dauert es?' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Berechnungsart-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">Was möchten Sie berechnen?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {berechnungsarten.map((art) => (
            <button
              key={art.id}
              onClick={() => setBerechnungsart(art.id)}
              className={`py-4 px-4 rounded-xl transition-all text-left ${
                berechnungsart === art.id
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">{art.name}</span>
              <span className="text-xs opacity-80">{art.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        
        {/* Startkapital */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Startkapital (bereits vorhanden)</span>
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
            max="50000"
            step="1000"
          />
        </div>

        {/* Zinssatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Erwarteter Zinssatz p.a.</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={zinssatz}
              onChange={(e) => setZinssatz(Math.max(0, Math.min(20, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              max="20"
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
            max="10"
            step="0.25"
          />
          <p className="text-sm text-gray-500 mt-2">
            💡 Tagesgeld: 2-3% | Festgeld: 3-4% | ETFs: 5-8%
          </p>
        </div>

        {/* Sparintervall */}
        <div className="mb-6">
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

        {/* Sparrate - nur wenn nicht berechnet */}
        {berechnungsart !== 'sparrate' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">
                Sparrate ({sparintervall === 'monatlich' ? 'pro Monat' : 'pro Jahr'})
              </span>
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
              max={sparintervall === 'monatlich' ? 2000 : 24000}
              step={sparintervall === 'monatlich' ? 25 : 500}
            />
          </div>
        )}

        {/* Laufzeit - nur wenn nicht berechnet */}
        {berechnungsart !== 'laufzeit' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Spardauer</span>
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
              max="40"
              step="1"
            />
          </div>
        )}

        {/* Zielbetrag - nur bei Sparrate und Laufzeit Berechnung */}
        {(berechnungsart === 'sparrate' || berechnungsart === 'laufzeit') && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">🎯 Sparziel (Zielbetrag)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={zielBetrag}
                onChange={(e) => setZielBetrag(Math.max(1000, Number(e.target.value)))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-emerald-300 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none bg-emerald-50"
                min="1000"
                max="1000000"
                step="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
            </div>
            <input
              type="range"
              value={zielBetrag}
              onChange={(e) => setZielBetrag(Number(e.target.value))}
              className="w-full mt-3 accent-emerald-500"
              min="5000"
              max="200000"
              step="5000"
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              {[10000, 25000, 50000, 100000].map((betrag) => (
                <button
                  key={betrag}
                  onClick={() => setZielBetrag(betrag)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    zielBetrag === betrag
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {formatEuro(betrag)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result Section */}
      {ergebnis && ergebnis.type === 'endvermoegen' && (
        <>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
            <h3 className="text-sm font-medium opacity-80 mb-1">💰 Ihr Endvermögen nach {laufzeit} Jahren</h3>

            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatEuro(ergebnis.endwert)}</span>
              </div>
              <p className="text-emerald-100 mt-2 text-sm">
                📈 Zinsen: <strong>{formatEuro(ergebnis.gesamtZinsen)}</strong> ({(ergebnis.gesamtZinsen / ergebnis.gesamtEinzahlungen * 100).toFixed(1)}% Rendite)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Einzahlungen gesamt</span>
                <div className="text-xl font-bold">{formatEuro(ergebnis.gesamtEinzahlungen)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Zinsen verdient</span>
                <div className="text-xl font-bold">{formatEuro(ergebnis.gesamtZinsen)}</div>
              </div>
            </div>

            {/* Balkendiagramm */}
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between text-sm mb-2">
                <span>Einzahlungen</span>
                <span>Zinsen</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden bg-white/20 flex">
                <div
                  className="bg-white h-full transition-all duration-500"
                  style={{ width: `${(ergebnis.gesamtEinzahlungen / ergebnis.endwert) * 100}%` }}
                ></div>
                <div
                  className="bg-green-300 h-full transition-all duration-500"
                  style={{ width: `${(ergebnis.gesamtZinsen / ergebnis.endwert) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1 opacity-70">
                <span>{((ergebnis.gesamtEinzahlungen / ergebnis.endwert) * 100).toFixed(1)}%</span>
                <span>{((ergebnis.gesamtZinsen / ergebnis.endwert) * 100).toFixed(1)}%</span>
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
                        <th className="text-right py-2 text-gray-600">Eingezahlt</th>
                        <th className="text-right py-2 text-gray-600">Zinsen</th>
                        <th className="text-right py-2 text-gray-600">Vermögen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {startkapital > 0 && (
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <td className="py-2 font-medium">Start</td>
                          <td className="text-right py-2">{formatEuro(startkapital)}</td>
                          <td className="text-right py-2 text-green-600">–</td>
                          <td className="text-right py-2 font-medium">{formatEuro(startkapital)}</td>
                        </tr>
                      )}
                      {ergebnis.jahreswerte.map((zeile) => (
                        <tr key={zeile.jahr} className="border-b border-gray-100">
                          <td className="py-2 font-medium">{zeile.jahr}</td>
                          <td className="text-right py-2">{formatEuro(zeile.kumulierteEinzahlungen)}</td>
                          <td className="text-right py-2 text-green-600">{formatEuro(zeile.kumulierteZinsen)}</td>
                          <td className="text-right py-2 font-medium">{formatEuro(zeile.endwert)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {ergebnis && ergebnis.type === 'sparrate' && (
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">📊 Benötigte Sparrate</h3>

          {ergebnis.startkapitalReicht ? (
            <div>
              <p className="text-2xl font-bold mb-2">🎉 Ihr Startkapital reicht bereits!</p>
              <p className="text-blue-100">
                Mit {formatEuro(startkapital)} und {formatProzent(zinssatz)} Zinsen erreichen Sie {formatEuro(zielBetrag)} in {laufzeit} Jahren ohne zusätzliches Sparen.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{formatEuro(ergebnis.benoetigteSparrate)}</span>
                  <span className="text-xl opacity-80">/{sparintervall === 'monatlich' ? 'Monat' : 'Jahr'}</span>
                </div>
                <p className="text-blue-100 mt-2 text-sm">
                  um in {laufzeit} Jahren <strong>{formatEuro(zielBetrag)}</strong> zu erreichen
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <span className="text-sm opacity-80">Gesamte Einzahlungen</span>
                  <div className="text-xl font-bold">{formatEuro(ergebnis.gesamtEinzahlungen)}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <span className="text-sm opacity-80">Davon Zinsen</span>
                  <div className="text-xl font-bold">{formatEuro(ergebnis.gesamtZinsen)}</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {ergebnis && ergebnis.type === 'laufzeit' && (
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">⏱️ Benötigte Zeit</h3>

          {ergebnis.nichtErreichbar ? (
            <div>
              <p className="text-2xl font-bold mb-2">⚠️ Ziel nicht erreichbar</p>
              <p className="text-purple-100">
                Mit dieser Sparrate und diesem Zinssatz würde es über 100 Jahre dauern.
                Erhöhen Sie die Sparrate oder den Zinssatz.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{ergebnis.benoetigteJahre.toFixed(1)}</span>
                  <span className="text-xl opacity-80">Jahre</span>
                </div>
                <p className="text-purple-100 mt-1 text-sm">
                  ({ergebnis.benoetigteMonate} Monate)
                </p>
                <p className="text-purple-100 mt-2 text-sm">
                  um <strong>{formatEuro(zielBetrag)}</strong> zu erreichen
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <span className="text-sm opacity-80">Gesamte Einzahlungen</span>
                  <div className="text-xl font-bold">{formatEuro(ergebnis.gesamtEinzahlungen)}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <span className="text-sm opacity-80">Davon Zinsen</span>
                  <div className="text-xl font-bold">{formatEuro(ergebnis.gesamtZinsen)}</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Ihre Eingaben</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Startkapital</span>
            <span className="font-bold text-gray-900">{formatEuro(startkapital)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Zinssatz</span>
            <span className="text-gray-900">{formatProzent(zinssatz)}</span>
          </div>
          {berechnungsart !== 'sparrate' && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Sparrate ({sparintervall})</span>
              <span className="text-gray-900">{formatEuro(sparrate)}</span>
            </div>
          )}
          {berechnungsart !== 'laufzeit' && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Spardauer</span>
              <span className="text-gray-900">{laufzeit} Jahre</span>
            </div>
          )}
          {(berechnungsart === 'sparrate' || berechnungsart === 'laufzeit') && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Sparziel</span>
              <span className="font-bold text-emerald-600">{formatEuro(zielBetrag)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sparziele-Beispiele */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">🎯 Beliebte Sparziele</h3>
        <ul className="space-y-3 text-sm text-emerald-700">
          <li className="flex gap-3 items-start">
            <span className="text-xl">🚗</span>
            <div>
              <strong>Neues Auto:</strong> 15.000-30.000€
              <p className="text-emerald-600 text-xs">Bei 250€/Monat & 3% Zinsen: ~5 Jahre für 17.000€</p>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-xl">🏠</span>
            <div>
              <strong>Eigenkapital Immobilie:</strong> 50.000-100.000€
              <p className="text-emerald-600 text-xs">Bei 500€/Monat & 5% Zinsen: ~8 Jahre für 60.000€</p>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-xl">✈️</span>
            <div>
              <strong>Weltreise:</strong> 10.000-20.000€
              <p className="text-emerald-600 text-xs">Bei 300€/Monat & 2% Zinsen: ~3 Jahre für 11.000€</p>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-xl">🎓</span>
            <div>
              <strong>Bildung/Weiterbildung:</strong> 5.000-15.000€
              <p className="text-emerald-600 text-xs">Bei 200€/Monat & 3% Zinsen: ~2 Jahre für 5.000€</p>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="text-xl">👴</span>
            <div>
              <strong>Altersvorsorge:</strong> 100.000-500.000€
              <p className="text-emerald-600 text-xs">Bei 400€/Monat & 6% ETF: ~25 Jahre für 280.000€</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Spartipps</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>💰</span>
            <span>
              <strong>50-30-20 Regel:</strong> 50% für Fixkosten, 30% für Wünsche, 20% zum Sparen. 
              Bei 3.000€ netto sind das 600€/Monat.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🏦</span>
            <span>
              <strong>Dauerauftrag einrichten:</strong> Automatisches Sparen am Monatsanfang – 
              so vergessen Sie es nicht!
            </span>
          </li>
          <li className="flex gap-2">
            <span>📊</span>
            <span>
              <strong>Tagesgeld vs. ETF:</strong> Kurzfristig (&lt;3 Jahre) → Tagesgeld. 
              Langfristig (&gt;10 Jahre) → ETF-Sparplan für höhere Rendite.
            </span>
          </li>
          <li className="flex gap-2">
            <span>🎯</span>
            <span>
              <strong>Konkretes Ziel setzen:</strong> Mit einem klaren Sparziel bleiben Sie 
              motiviert. Visualisieren Sie Ihr Ziel!
            </span>
          </li>
          <li className="flex gap-2">
            <span>⚡</span>
            <span>
              <strong>Notgroschen zuerst:</strong> Bevor Sie für langfristige Ziele sparen, 
              legen Sie 3-6 Monatsgehälter als Notgroschen zurück.
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
              <strong>Inflation beachten:</strong> Bei 2% Inflation verliert Ihr Geld jährlich 
              an Kaufkraft. Realrendite = Nominalrendite - Inflation.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Steuern:</strong> Auf Zinsen fallen 25% Abgeltungssteuer an. 
              Sparerpauschbetrag: 1.000€/Jahr (2.000€ für Paare).
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>ETF-Schwankungen:</strong> Bei ETFs/Aktien sind die angegebenen Renditen 
              langfristige Durchschnitte – kurzfristig kann es starke Schwankungen geben.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Einlagensicherung:</strong> Bei Tagesgeld/Festgeld sind bis zu 100.000€ 
              pro Bank durch die Einlagensicherung geschützt.
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
                  Spartipps & Geldanlage →
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
              <p className="font-medium text-gray-800">Einlagensicherung prüfen</p>
              <a
                href="https://www.einlagensicherung.de/banken-check/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Banken-Check bei der Einlagensicherung →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/geldanlage"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Geldanlage & Sparen
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
            href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesbank – Aktuelle Zinssätze
          </a>
          <a
            href="https://www.einlagensicherung.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Einlagensicherung – Schutz für Sparguthaben
          </a>
        </div>
      </div>
    </div>
  );
}
