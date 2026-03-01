import { useState, useMemo } from 'react';

// §23 EStG – Private Veräußerungsgeschäfte (Kryptowährungen)
// Freigrenze erhöht auf 1.000€ ab 2024
const FREIGRENZE = 1000;

// Einkommensteuer-Tarif 2026 (vereinfacht nach §32a EStG)
const GRUNDFREIBETRAG = 12096; // 2026

function berechneEinkommensteuer(zvE: number): number {
  if (zvE <= GRUNDFREIBETRAG) return 0;
  
  // Vereinfachte Berechnung nach §32a EStG 2026
  if (zvE <= 17005) {
    const y = (zvE - GRUNDFREIBETRAG) / 10000;
    return Math.round((922.98 * y + 1400) * y);
  } else if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000;
    return Math.round((181.19 * z + 2397) * z + 1025.38);
  } else if (zvE <= 277825) {
    return Math.round(0.42 * zvE - 10636.31);
  } else {
    return Math.round(0.45 * zvE - 18971.21);
  }
}

function berechneGrenzsteuersatz(zvE: number): number {
  if (zvE <= GRUNDFREIBETRAG) return 0;
  if (zvE <= 17005) return 14 + ((zvE - GRUNDFREIBETRAG) / (17005 - GRUNDFREIBETRAG)) * (24 - 14);
  if (zvE <= 66760) return 24 + ((zvE - 17005) / (66760 - 17005)) * (42 - 24);
  if (zvE <= 277825) return 42;
  return 45;
}

// Krypto-Transaktionen
interface KryptoTransaktion {
  id: string;
  coin: string;
  kaufpreis: number;
  verkaufspreis: number;
  haltedauer: 'unter1Jahr' | 'ueber1Jahr';
}

const KRYPTO_COINS = [
  { id: 'btc', label: 'Bitcoin (BTC)', icon: '₿' },
  { id: 'eth', label: 'Ethereum (ETH)', icon: 'Ξ' },
  { id: 'sol', label: 'Solana (SOL)', icon: '◎' },
  { id: 'xrp', label: 'Ripple (XRP)', icon: '✕' },
  { id: 'ada', label: 'Cardano (ADA)', icon: '₳' },
  { id: 'doge', label: 'Dogecoin (DOGE)', icon: 'Ð' },
  { id: 'andere', label: 'Andere Coins', icon: '🪙' },
];

const DEFAULT_TRANSAKTION: KryptoTransaktion = {
  id: crypto.randomUUID?.() || Math.random().toString(36),
  coin: 'btc',
  kaufpreis: 5000,
  verkaufspreis: 8000,
  haltedauer: 'unter1Jahr',
};

export default function KryptoSteuerRechner() {
  // Transaktionen
  const [transaktionen, setTransaktionen] = useState<KryptoTransaktion[]>([
    { ...DEFAULT_TRANSAKTION },
  ]);
  
  // Verluste aus Vorjahren
  const [verlustVortrag, setVerlustVortrag] = useState(0);
  
  // Zu versteuerndes Einkommen (für Grenzsteuersatz)
  const [zuVersteuerndesEinkommen, setZuVersteuerndesEinkommen] = useState(45000);
  
  // Kirchensteuer
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0);
  
  // Steuerklasse
  const [steuerklasse, setSteuerklasse] = useState<'single' | 'verheiratet'>('single');

  // Transaktion hinzufügen
  const addTransaktion = () => {
    setTransaktionen([
      ...transaktionen,
      {
        id: crypto.randomUUID?.() || Math.random().toString(36),
        coin: 'btc',
        kaufpreis: 1000,
        verkaufspreis: 1500,
        haltedauer: 'unter1Jahr',
      },
    ]);
  };

  // Transaktion entfernen
  const removeTransaktion = (id: string) => {
    if (transaktionen.length > 1) {
      setTransaktionen(transaktionen.filter(t => t.id !== id));
    }
  };

  // Transaktion aktualisieren
  const updateTransaktion = (id: string, field: keyof KryptoTransaktion, value: string | number) => {
    setTransaktionen(transaktionen.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  // Berechnung
  const ergebnis = useMemo(() => {
    // 1. Berechne Gewinne/Verluste pro Transaktion
    const transaktionenMitGewinn = transaktionen.map(t => {
      const gewinn = t.verkaufspreis - t.kaufpreis;
      const steuerpflichtig = t.haltedauer === 'unter1Jahr';
      return {
        ...t,
        gewinn,
        steuerpflichtig,
        steuerfreierGewinn: steuerpflichtig ? 0 : gewinn,
      };
    });

    // 2. Summiere
    const gesamtGewinnSteuerpflichtig = transaktionenMitGewinn
      .filter(t => t.steuerpflichtig && t.gewinn > 0)
      .reduce((sum, t) => sum + t.gewinn, 0);
    
    const gesamtVerlustSteuerpflichtig = transaktionenMitGewinn
      .filter(t => t.steuerpflichtig && t.gewinn < 0)
      .reduce((sum, t) => sum + Math.abs(t.gewinn), 0);
    
    const steuerfreierGewinn = transaktionenMitGewinn
      .filter(t => !t.steuerpflichtig && t.gewinn > 0)
      .reduce((sum, t) => sum + t.gewinn, 0);
    
    const steuerfreierVerlust = transaktionenMitGewinn
      .filter(t => !t.steuerpflichtig && t.gewinn < 0)
      .reduce((sum, t) => sum + Math.abs(t.gewinn), 0);

    // 3. Verlustverrechnung
    const verfuegbarerVerlust = gesamtVerlustSteuerpflichtig + verlustVortrag;
    const nachVerlustverrechnung = Math.max(0, gesamtGewinnSteuerpflichtig - verfuegbarerVerlust);
    const genutzterVerlust = Math.min(verfuegbarerVerlust, gesamtGewinnSteuerpflichtig);
    const verbleibenederVerlustVortrag = Math.max(0, verfuegbarerVerlust - gesamtGewinnSteuerpflichtig);

    // 4. Freigrenze prüfen (§23 EStG)
    // WICHTIG: Freigrenze = wenn überschritten, wird ALLES besteuert (nicht nur der Überschuss!)
    const unterFreigrenze = nachVerlustverrechnung <= FREIGRENZE;
    const zuVersteuernderGewinn = unterFreigrenze ? 0 : nachVerlustverrechnung;

    // 5. Steuerberechnung mit persönlichem Steuersatz
    // Krypto wird zum zu versteuernden Einkommen addiert und Grenzsteuersatz angewendet
    const zvEOhneKrypto = zuVersteuerndesEinkommen;
    const zvEMitKrypto = zvEOhneKrypto + zuVersteuernderGewinn;
    
    const steuerOhneKrypto = berechneEinkommensteuer(zvEOhneKrypto);
    const steuerMitKrypto = berechneEinkommensteuer(zvEMitKrypto);
    
    // Steuer auf Krypto = Differenz
    const einkommensteuerKrypto = steuerMitKrypto - steuerOhneKrypto;
    
    // Grenzsteuersatz (für Anzeige)
    const grenzsteuersatz = berechneGrenzsteuersatz(zvEMitKrypto);
    
    // Effektiver Steuersatz auf Krypto
    const effektiverSteuersatz = zuVersteuernderGewinn > 0 
      ? (einkommensteuerKrypto / zuVersteuernderGewinn) * 100 
      : 0;
    
    // Solidaritätszuschlag (5,5% auf ESt wenn > Freigrenze)
    // Soli-Freigrenze 2026: 19.950€ (Singles) / 39.900€ (Verheiratete)
    const soliFreibetrag = steuerklasse === 'single' ? 19950 : 39900;
    let soli = 0;
    if (steuerMitKrypto > soliFreibetrag) {
      // Milderungszone zwischen Freigrenze und +631€
      const ueberFreigrenze = steuerMitKrypto - soliFreibetrag;
      if (ueberFreigrenze > 631) {
        soli = Math.round(einkommensteuerKrypto * 0.055);
      } else {
        // Gleitende Zone: max 11,9% des Differenzbetrags
        soli = Math.min(
          Math.round(einkommensteuerKrypto * 0.055),
          Math.round(ueberFreigrenze * 0.119)
        );
      }
    }
    
    // Kirchensteuer
    const kirchensteuer = Math.round(einkommensteuerKrypto * kirchensteuerSatz);
    
    // Gesamtsteuer auf Krypto
    const steuerGesamt = einkommensteuerKrypto + soli + kirchensteuer;
    
    // Netto-Gewinn
    const gesamtGewinnBrutto = gesamtGewinnSteuerpflichtig + steuerfreierGewinn;
    const nettoGewinn = gesamtGewinnBrutto - steuerGesamt;

    return {
      transaktionen: transaktionenMitGewinn,
      gesamtGewinnSteuerpflichtig,
      gesamtVerlustSteuerpflichtig,
      steuerfreierGewinn,
      steuerfreierVerlust,
      genutzterVerlust,
      nachVerlustverrechnung,
      verbleibenederVerlustVortrag,
      unterFreigrenze,
      zuVersteuernderGewinn,
      grenzsteuersatz,
      effektiverSteuersatz,
      einkommensteuerKrypto,
      soli,
      kirchensteuer,
      steuerGesamt,
      gesamtGewinnBrutto,
      nettoGewinn,
      zvEMitKrypto,
    };
  }, [transaktionen, verlustVortrag, zuVersteuerndesEinkommen, kirchensteuerSatz, steuerklasse]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatProzent = (n: number) => n.toFixed(1).replace('.', ',') + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Transaktionen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">₿</span> Krypto-Verkäufe eingeben
        </h3>
        
        <div className="space-y-4">
          {transaktionen.map((t, index) => {
            const coin = KRYPTO_COINS.find(c => c.id === t.coin) || KRYPTO_COINS[0];
            const gewinn = t.verkaufspreis - t.kaufpreis;
            
            return (
              <div 
                key={t.id} 
                className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    <span className="text-xl">{coin.icon}</span>
                    Transaktion {index + 1}
                  </span>
                  {transaktionen.length > 1 && (
                    <button
                      onClick={() => removeTransaktion(t.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕ Entfernen
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Kryptowährung</label>
                    <select
                      value={t.coin}
                      onChange={(e) => updateTransaktion(t.id, 'coin', e.target.value)}
                      className="w-full py-2 px-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 outline-none text-sm"
                    >
                      {KRYPTO_COINS.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Haltedauer</label>
                    <select
                      value={t.haltedauer}
                      onChange={(e) => updateTransaktion(t.id, 'haltedauer', e.target.value)}
                      className={`w-full py-2 px-3 border-2 rounded-lg focus:ring-0 outline-none text-sm ${
                        t.haltedauer === 'ueber1Jahr' 
                          ? 'border-green-300 bg-green-50 text-green-700' 
                          : 'border-gray-200'
                      }`}
                    >
                      <option value="unter1Jahr">Unter 1 Jahr (steuerpflichtig)</option>
                      <option value="ueber1Jahr">Über 1 Jahr (steuerfrei!)</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Kaufpreis (Anschaffung)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={t.kaufpreis}
                        onChange={(e) => updateTransaktion(t.id, 'kaufpreis', Math.max(0, Number(e.target.value)))}
                        className="w-full py-2 px-3 pr-8 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 outline-none text-sm"
                        min="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Verkaufspreis (Erlös)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={t.verkaufspreis}
                        onChange={(e) => updateTransaktion(t.id, 'verkaufspreis', Math.max(0, Number(e.target.value)))}
                        className="w-full py-2 px-3 pr-8 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-0 outline-none text-sm"
                        min="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                    </div>
                  </div>
                </div>
                
                {/* Gewinn/Verlust Anzeige */}
                <div className={`mt-3 p-2 rounded-lg text-sm text-center ${
                  gewinn > 0 
                    ? t.haltedauer === 'ueber1Jahr' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                    : gewinn < 0 
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {gewinn > 0 ? (
                    t.haltedauer === 'ueber1Jahr' 
                      ? `✓ ${formatEuro(gewinn)} Gewinn – STEUERFREI!`
                      : `${formatEuro(gewinn)} Gewinn (steuerpflichtig)`
                  ) : gewinn < 0 ? (
                    `${formatEuro(gewinn)} Verlust (verrechenbar)`
                  ) : (
                    'Kein Gewinn/Verlust'
                  )}
                </div>
              </div>
            );
          })}
          
          <button
            onClick={addTransaktion}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> Weitere Transaktion hinzufügen
          </button>
        </div>
      </div>

      {/* Verlustverrechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📉</span> Verlustverrechnung
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Verlustvortrag aus Vorjahren
          </label>
          <div className="relative">
            <input
              type="number"
              value={verlustVortrag}
              onChange={(e) => setVerlustVortrag(Math.max(0, Number(e.target.value)))}
              className="w-full py-2 px-3 pr-8 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Noch nicht verrechnete Krypto-Verluste aus früheren Jahren
          </p>
        </div>
      </div>

      {/* Persönliche Situation */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">👤</span> Steuerliche Situation
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Familienstand</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSteuerklasse('single')}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  steuerklasse === 'single'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ledig / Einzeln
              </button>
              <button
                onClick={() => setSteuerklasse('verheiratet')}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  steuerklasse === 'verheiratet'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Verheiratet (Splitting)
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zu versteuerndes Einkommen (ohne Krypto)
            </label>
            <div className="relative">
              <input
                type="number"
                value={zuVersteuerndesEinkommen}
                onChange={(e) => setZuVersteuerndesEinkommen(Math.max(0, Number(e.target.value)))}
                className="w-full text-lg font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                step="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="1000"
              value={zuVersteuerndesEinkommen}
              onChange={(e) => setZuVersteuerndesEinkommen(Number(e.target.value))}
              className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dein Einkommen (Gehalt, Rente etc.) nach Abzug von Werbungskosten & Sonderausgaben
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kirchensteuer</label>
            <select
              value={kirchensteuerSatz}
              onChange={(e) => setKirchensteuerSatz(Number(e.target.value))}
              className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
            >
              <option value={0}>Keine Kirchensteuer</option>
              <option value={0.08}>8% (Bayern, Baden-Württemberg)</option>
              <option value={0.09}>9% (alle anderen Bundesländer)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {ergebnis.unterFreigrenze && ergebnis.nachVerlustverrechnung > 0 ? (
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <div className="text-center">
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="text-2xl font-bold mb-2">Unter der Freigrenze!</h3>
            <p className="text-green-100 mb-4">
              Dein steuerpflichtiger Gewinn von {formatEuro(ergebnis.nachVerlustverrechnung)} liegt unter der 
              Freigrenze von {formatEuro(FREIGRENZE)} – <strong>keine Steuern!</strong>
            </p>
            <div className="bg-white/20 rounded-xl p-4">
              <span className="text-sm text-green-100">Dein Netto-Gewinn</span>
              <span className="text-4xl font-bold block">{formatEuro(ergebnis.gesamtGewinnBrutto)}</span>
            </div>
          </div>
          
          {ergebnis.steuerfreierGewinn > 0 && (
            <div className="mt-4 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-green-100 text-sm">
                Davon {formatEuro(ergebnis.steuerfreierGewinn)} steuerfrei durch Haltefrist &gt;1 Jahr
              </p>
            </div>
          )}
        </div>
      ) : ergebnis.gesamtGewinnBrutto <= 0 ? (
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <div className="text-center">
            <span className="text-6xl mb-4 block">📉</span>
            <h3 className="text-2xl font-bold mb-2">Kein steuerpflichtiger Gewinn</h3>
            <p className="text-gray-200 mb-4">
              {ergebnis.verbleibenederVerlustVortrag > 0 
                ? `Du hast ${formatEuro(ergebnis.verbleibenederVerlustVortrag)} Verlust, den du in Folgejahre vortragen kannst.`
                : 'Keine Steuern, da kein Gewinn erzielt wurde.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium text-orange-200 mb-1">Krypto-Steuer (§23 EStG)</h3>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuro(ergebnis.steuerGesamt)}</span>
            </div>
            <p className="text-orange-200 text-sm mt-1">
              Steuer auf {formatEuro(ergebnis.zuVersteuernderGewinn)} steuerpflichtigen Gewinn
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-orange-200 text-xs block">Grenzsteuersatz</span>
              <span className="text-xl font-bold">{formatProzent(ergebnis.grenzsteuersatz)}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-orange-200 text-xs block">Effektiver Satz</span>
              <span className="text-xl font-bold">{formatProzent(ergebnis.effektiverSteuersatz)}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-orange-200 text-xs block">Netto-Gewinn</span>
              <span className="text-xl font-bold text-green-300">{formatEuro(ergebnis.nettoGewinn)}</span>
            </div>
          </div>
          
          {ergebnis.steuerfreierGewinn > 0 && (
            <div className="mt-4 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-orange-100 text-sm">
                🎁 Zusätzlich {formatEuro(ergebnis.steuerfreierGewinn)} steuerfrei durch Haltefrist &gt;1 Jahr
              </p>
            </div>
          )}
        </div>
      )}

      {/* Berechnung im Detail */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>
        
        <div className="space-y-3">
          {/* Gewinne nach Haltefrist */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Gewinne (Haltefrist unter 1 Jahr)</span>
            <span className="font-bold text-orange-600">{formatEuro(ergebnis.gesamtGewinnSteuerpflichtig)}</span>
          </div>
          
          {ergebnis.steuerfreierGewinn > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-green-600">
              <span>Gewinne (über 1 Jahr) → steuerfrei</span>
              <span className="font-bold">{formatEuro(ergebnis.steuerfreierGewinn)}</span>
            </div>
          )}
          
          {/* Verlustverrechnung */}
          {ergebnis.genutzterVerlust > 0 && (
            <div className="flex justify-between items-center text-blue-600">
              <span>Verlustverrechnung</span>
              <span>− {formatEuro(ergebnis.genutzterVerlust)}</span>
            </div>
          )}
          
          {/* Nach Verlustverrechnung */}
          <div className="flex justify-between items-center py-2 bg-gray-50 -mx-6 px-6">
            <span className="text-gray-600">Nach Verlustverrechnung</span>
            <span className="font-medium text-gray-800">{formatEuro(ergebnis.nachVerlustverrechnung)}</span>
          </div>
          
          {/* Freigrenze-Check */}
          <div className={`p-3 rounded-lg ${
            ergebnis.unterFreigrenze 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{ergebnis.unterFreigrenze ? '✅' : '⚠️'}</span>
              <div>
                <p className={`font-medium ${ergebnis.unterFreigrenze ? 'text-green-700' : 'text-orange-700'}`}>
                  Freigrenze: {formatEuro(FREIGRENZE)}
                </p>
                <p className={`text-sm ${ergebnis.unterFreigrenze ? 'text-green-600' : 'text-orange-600'}`}>
                  {ergebnis.unterFreigrenze 
                    ? 'Gewinn liegt unter Freigrenze – keine Steuer!' 
                    : 'Gewinn überschreitet Freigrenze – gesamter Betrag wird besteuert!'
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Zu versteuern */}
          <div className="flex justify-between items-center py-2 border-b border-gray-200 bg-orange-50 -mx-6 px-6">
            <span className="font-bold text-gray-800">Zu versteuernder Gewinn</span>
            <span className="font-bold text-orange-600">{formatEuro(ergebnis.zuVersteuernderGewinn)}</span>
          </div>
          
          {/* Steuerberechnung */}
          {ergebnis.zuVersteuernderGewinn > 0 && (
            <>
              <div>
                <div className="flex justify-between items-center text-red-600 font-medium mb-2">
                  <span>Steuern (persönlicher Steuersatz)</span>
                  <span>{formatEuro(ergebnis.steuerGesamt)}</span>
                </div>
                <div className="pl-4 space-y-1 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Einkommensteuer (Grenzsteuersatz {formatProzent(ergebnis.grenzsteuersatz)})</span>
                    <span>{formatEuro(ergebnis.einkommensteuerKrypto)}</span>
                  </div>
                  {ergebnis.soli > 0 && (
                    <div className="flex justify-between">
                      <span>Solidaritätszuschlag</span>
                      <span>{formatEuro(ergebnis.soli)}</span>
                    </div>
                  )}
                  {ergebnis.kirchensteuer > 0 && (
                    <div className="flex justify-between">
                      <span>Kirchensteuer</span>
                      <span>{formatEuro(ergebnis.kirchensteuer)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Netto-Ergebnis */}
          <div className="flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl">
            <div>
              <span className="font-bold text-green-800 text-lg">Netto-Gewinn</span>
              <span className="text-green-600 text-sm block">nach Steuern</span>
            </div>
            <span className="font-bold text-green-600 text-2xl">{formatEuro(ergebnis.nettoGewinn)}</span>
          </div>
          
          {/* Verlustvortrag */}
          {ergebnis.verbleibenederVerlustVortrag > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>💡 Verlustvortrag für Folgejahre:</strong> {formatEuro(ergebnis.verbleibenederVerlustVortrag)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* §23 EStG Info */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span className="text-xl">⚖️</span> §23 EStG – Krypto-Besteuerung in Deutschland
        </h3>
        <ul className="space-y-3 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>🎯</span>
            <span>
              <strong>Haltefrist 1 Jahr:</strong> Gewinne aus Krypto-Verkäufen nach über 1 Jahr Haltedauer sind komplett steuerfrei!
            </span>
          </li>
          <li className="flex gap-2">
            <span>💰</span>
            <span>
              <strong>Freigrenze {formatEuro(FREIGRENZE)}:</strong> Gewinne unter der Freigrenze sind steuerfrei. Aber Achtung: Überschreitest du die Grenze, wird der <u>gesamte</u> Gewinn besteuert!
            </span>
          </li>
          <li className="flex gap-2">
            <span>📊</span>
            <span>
              <strong>Persönlicher Steuersatz:</strong> Krypto wird NICHT mit 25% Abgeltungsteuer besteuert, sondern mit deinem persönlichen Einkommensteuersatz (14-45%)!
            </span>
          </li>
          <li className="flex gap-2">
            <span>📉</span>
            <span>
              <strong>Verlustverrechnung:</strong> Krypto-Verluste können nur mit Krypto-Gewinnen (und anderen privaten Veräußerungsgeschäften) verrechnet werden – nicht mit Gehalt oder Kapitalerträgen!
            </span>
          </li>
          <li className="flex gap-2">
            <span>📋</span>
            <span>
              <strong>FIFO-Prinzip:</strong> Bei Verkäufen gilt standardmäßig "First In, First Out" – die zuerst gekauften Coins werden zuerst verkauft.
            </span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Dokumentation:</strong> Führe genaue Aufzeichnungen über alle Käufe, Verkäufe und die Haltedauer. Das Finanzamt kann Nachweise verlangen!
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Steuererklärung:</strong> Krypto-Gewinne müssen in der Anlage SO (Sonstige Einkünfte) deklariert werden.
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Staking & Lending:</strong> Diese Einnahmen können die Haltefrist auf 10 Jahre verlängern (umstritten – Steuerberater fragen!).
            </span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>
              <strong>Mining:</strong> Mining-Erlöse sind gewerbliche Einkünfte und werden anders behandelt.
            </span>
          </li>
          <li className="flex gap-2">
            <span>⚠️</span>
            <span>
              Dieser Rechner dient zur Orientierung – für die Steuererklärung konsultiere einen Steuerberater!
            </span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörden */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden & Anlaufstellen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Finanzamt</p>
              <p className="text-gray-500">Anlage SO zur Steuererklärung</p>
              <a 
                href="https://www.elster.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                ELSTER Online →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Bürgertelefon BMF</p>
              <p className="text-gray-500">Fragen zu Krypto-Steuern</p>
              <a 
                href="tel:03018-333-0"
                className="text-orange-600 hover:underline"
              >
                030 18 333-0 →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">💼</span>
            <div>
              <p className="font-medium text-gray-800">Steuerberater</p>
              <p className="text-gray-500">Komplexe Krypto-Fälle</p>
              <a 
                href="https://www.bstbk.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                Steuerberaterkammer →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📚</span>
            <div>
              <p className="font-medium text-gray-800">BMF-Schreiben Krypto</p>
              <p className="text-gray-500">Offizielle Richtlinien</p>
              <a 
                href="https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Einkommensteuer/2022-05-09-einzelfragen-zur-ertragsteuerrechtlichen-behandlung-von-virtuellen-waehrungen-und-von-sonstigen-token.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                BMF-Schreiben 2022 →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__23.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-orange-600 hover:underline"
          >
            §23 EStG – Private Veräußerungsgeschäfte
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__22.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-orange-600 hover:underline"
          >
            §22 EStG – Sonstige Einkünfte
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-orange-600 hover:underline"
          >
            §32a EStG – Einkommensteuertarif
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Einkommensteuer/2022-05-09-einzelfragen-zur-ertragsteuerrechtlichen-behandlung-von-virtuellen-waehrungen-und-von-sonstigen-token.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-orange-600 hover:underline"
          >
            BMF-Schreiben zur Besteuerung von Kryptowährungen (2022)
          </a>
        </div>
      </div>
    </div>
  );
}
