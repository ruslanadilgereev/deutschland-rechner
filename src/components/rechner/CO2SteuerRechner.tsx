import { useState, useMemo } from 'react';

// CO2-Steuer Entwicklung in €/Tonne
// Ab 2026: Preiskorridor 55-65 €/Tonne (Emissionshandel statt Festpreis)
// Quelle: BMUV, Finanztip, BEHG
const CO2_STEUER_ENTWICKLUNG = [
  { jahr: 2021, preis: 25 },
  { jahr: 2022, preis: 30 },
  { jahr: 2023, preis: 30 },
  { jahr: 2024, preis: 45 },
  { jahr: 2025, preis: 55 },
  { jahr: 2026, preis: 55 }, // Mindestpreis im Korridor 55-65 €/Tonne
];

// Kraftstofftypen mit CO2-Emissionen pro Einheit
type Kraftstofftyp = 'benzin' | 'diesel' | 'erdgas' | 'lpg' | 'heizoel' | 'fluessiggas';

interface KraftstoffInfo {
  name: string;
  einheit: string;
  co2ProEinheit: number; // kg CO2 pro Liter/kg/kWh
  emoji: string;
  kategorie: 'kraftstoff' | 'heizung';
  beschreibung: string;
}

const KRAFTSTOFFE: Record<Kraftstofftyp, KraftstoffInfo> = {
  benzin: {
    name: 'Benzin (Super E10)',
    einheit: 'Liter',
    co2ProEinheit: 2.37, // kg CO2 pro Liter
    emoji: '⛽',
    kategorie: 'kraftstoff',
    beschreibung: 'Für PKW mit Ottomotor',
  },
  diesel: {
    name: 'Diesel',
    einheit: 'Liter',
    co2ProEinheit: 2.65, // kg CO2 pro Liter
    emoji: '🛢️',
    kategorie: 'kraftstoff',
    beschreibung: 'Für PKW und LKW',
  },
  erdgas: {
    name: 'Erdgas (CNG)',
    einheit: 'kg',
    co2ProEinheit: 2.79, // kg CO2 pro kg Erdgas
    emoji: '💨',
    kategorie: 'kraftstoff',
    beschreibung: 'Für Erdgas-Fahrzeuge',
  },
  lpg: {
    name: 'Autogas (LPG)',
    einheit: 'Liter',
    co2ProEinheit: 1.64, // kg CO2 pro Liter
    emoji: '🔥',
    kategorie: 'kraftstoff',
    beschreibung: 'Flüssiggas für Fahrzeuge',
  },
  heizoel: {
    name: 'Heizöl',
    einheit: 'Liter',
    co2ProEinheit: 2.66, // kg CO2 pro Liter
    emoji: '🏠',
    kategorie: 'heizung',
    beschreibung: 'Für Ölheizungen',
  },
  fluessiggas: {
    name: 'Flüssiggas (Heizung)',
    einheit: 'Liter',
    co2ProEinheit: 1.64, // kg CO2 pro Liter
    emoji: '🔥',
    kategorie: 'heizung',
    beschreibung: 'Für Gasheizungen',
  },
};

// Durchschnittlicher Jahresverbrauch für Voreinstellung
const DURCHSCHNITTSVERBRAUCH: Record<Kraftstofftyp, number> = {
  benzin: 1200, // Liter pro Jahr (ca. 15.000 km bei 8 l/100km)
  diesel: 1050, // Liter pro Jahr (ca. 15.000 km bei 7 l/100km)
  erdgas: 200, // kg pro Jahr
  lpg: 1500, // Liter pro Jahr (höherer Verbrauch)
  heizoel: 2000, // Liter pro Jahr für Einfamilienhaus
  fluessiggas: 2500, // Liter pro Jahr
};

export default function CO2SteuerRechner() {
  const [kraftstoff, setKraftstoff] = useState<Kraftstofftyp>('benzin');
  const [jahresverbrauch, setJahresverbrauch] = useState(DURCHSCHNITTSVERBRAUCH.benzin);
  const [ausgewähltesJahr, setAusgewähltesJahr] = useState(2026);
  const [zeigeVergleich, setZeigeVergleich] = useState(true);

  // Kraftstoff wechseln und Verbrauch anpassen
  const handleKraftstoffChange = (neuerTyp: Kraftstofftyp) => {
    setKraftstoff(neuerTyp);
    setJahresverbrauch(DURCHSCHNITTSVERBRAUCH[neuerTyp]);
  };

  const ergebnis = useMemo(() => {
    const info = KRAFTSTOFFE[kraftstoff];
    
    // CO2-Ausstoß berechnen
    const co2Gesamt = jahresverbrauch * info.co2ProEinheit; // in kg
    const co2Tonnen = co2Gesamt / 1000;
    
    // CO2-Steuer für verschiedene Jahre berechnen
    const steuerProJahr: Record<number, number> = {};
    const steuerProEinheit: Record<number, number> = {};
    
    CO2_STEUER_ENTWICKLUNG.forEach(({ jahr, preis }) => {
      steuerProJahr[jahr] = co2Tonnen * preis;
      steuerProEinheit[jahr] = (info.co2ProEinheit / 1000) * preis; // € pro Liter/kg
    });
    
    // Aktuelles Jahr
    const aktuelleJahrDaten = CO2_STEUER_ENTWICKLUNG.find(d => d.jahr === ausgewähltesJahr);
    const co2PreisAktuell = aktuelleJahrDaten?.preis || 55;
    const steuerAktuell = co2Tonnen * co2PreisAktuell;
    const steuerProEinheitAktuell = (info.co2ProEinheit / 1000) * co2PreisAktuell;
    
    // Vergleich mit 2021
    const steuer2021 = co2Tonnen * 25;
    const mehrkosten = steuerAktuell - steuer2021;
    const steigerungProzent = ((steuerAktuell / steuer2021) - 1) * 100;
    
    // Monatliche Belastung
    const steuerProMonat = steuerAktuell / 12;
    
    return {
      co2Gesamt,
      co2Tonnen,
      steuerProJahr,
      steuerProEinheit,
      steuerAktuell,
      steuerProEinheitAktuell,
      steuerProMonat,
      co2PreisAktuell,
      steuer2021,
      mehrkosten,
      steigerungProzent,
      info,
    };
  }, [kraftstoff, jahresverbrauch, ausgewähltesJahr]);

  const formatEuro = (n: number) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  
  const formatNumber = (n: number, decimals = 1) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  
  const formatCent = (n: number) => 
    formatNumber(n * 100, 2) + ' Cent';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kraftstoffart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kraftstoff / Brennstoff</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wählen Sie die Art des Kraftstoffs oder Brennstoffs
            </span>
          </label>
          
          {/* Kraftstoffe */}
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Mobilität</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {(Object.entries(KRAFTSTOFFE) as [Kraftstofftyp, KraftstoffInfo][])
              .filter(([, info]) => info.kategorie === 'kraftstoff')
              .map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleKraftstoffChange(key)}
                  className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                    kraftstoff === key
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">{value.emoji}</span>
                  <span className="block mt-1 text-xs">{value.name}</span>
                </button>
              ))}
          </div>
          
          {/* Heizung */}
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Heizung</p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(KRAFTSTOFFE) as [Kraftstofftyp, KraftstoffInfo][])
              .filter(([, info]) => info.kategorie === 'heizung')
              .map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleKraftstoffChange(key)}
                  className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                    kraftstoff === key
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">{value.emoji}</span>
                  <span className="block mt-1 text-xs">{value.name}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Jahresverbrauch */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jahresverbrauch</span>
            <span className="text-xs text-gray-500 block mt-1">
              {ergebnis.info.beschreibung}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={jahresverbrauch}
              onChange={(e) => setJahresverbrauch(Number(e.target.value))}
              className="w-full p-4 pr-20 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-lg"
              min="0"
              max="100000"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              {ergebnis.info.einheit}/Jahr
            </span>
          </div>
          <input
            type="range"
            value={jahresverbrauch}
            onChange={(e) => setJahresverbrauch(Number(e.target.value))}
            className="w-full mt-2 accent-green-500"
            min="100"
            max={DURCHSCHNITTSVERBRAUCH[kraftstoff] * 3}
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Wenig</span>
            <button 
              onClick={() => setJahresverbrauch(DURCHSCHNITTSVERBRAUCH[kraftstoff])}
              className="text-green-600 hover:underline"
            >
              Ø Durchschnitt: {formatNumber(DURCHSCHNITTSVERBRAUCH[kraftstoff], 0)} {ergebnis.info.einheit}
            </button>
            <span>Viel</span>
          </div>
        </div>

        {/* Jahr auswählen */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jahr</span>
            <span className="text-xs text-gray-500 block mt-1">
              CO₂-Preis variiert je nach Jahr
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CO2_STEUER_ENTWICKLUNG.map(({ jahr, preis }) => (
              <button
                key={jahr}
                onClick={() => setAusgewähltesJahr(jahr)}
                className={`py-2 px-4 rounded-xl font-medium transition-all text-sm ${
                  ausgewähltesJahr === jahr
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="block font-bold">{jahr}</span>
                <span className="block text-xs opacity-70">{preis} €/t</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🌱 Ihre CO₂-Steuer {ausgewähltesJahr}</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.steuerAktuell)}</span>
            <span className="text-lg opacity-80">/Jahr</span>
          </div>
          <p className="text-green-100 mt-2 text-sm">
            Bei {formatNumber(jahresverbrauch, 0)} {ergebnis.info.einheit} {ergebnis.info.name}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro Monat</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.steuerProMonat)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro {ergebnis.info.einheit}</span>
            <div className="text-xl font-bold">{formatCent(ergebnis.steuerProEinheitAktuell)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm col-span-2 sm:col-span-1">
            <span className="text-sm opacity-80">CO₂-Ausstoß</span>
            <div className="text-xl font-bold">{formatNumber(ergebnis.co2Tonnen, 2)} t</div>
          </div>
        </div>

        {/* Vergleich mit 2021 */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📈</span>
            <span className="font-medium">Vergleich mit 2021</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="opacity-80">Mehrkosten zu 2021</span>
              <p className="font-bold text-lg text-yellow-300">+{formatEuro(ergebnis.mehrkosten)}</p>
            </div>
            <div>
              <span className="opacity-80">Steigerung</span>
              <p className="font-bold text-lg">+{formatNumber(ergebnis.steigerungProzent, 0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* CO2-Preis Entwicklung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">📊 CO₂-Steuer Entwicklung</h3>
          <button
            onClick={() => setZeigeVergleich(!zeigeVergleich)}
            className="text-sm text-green-600 hover:underline"
          >
            {zeigeVergleich ? 'Verbergen' : 'Anzeigen'}
          </button>
        </div>
        
        {zeigeVergleich && (
          <>
            {/* Balkendiagramm */}
            <div className="space-y-2 mb-4">
              {CO2_STEUER_ENTWICKLUNG.map(({ jahr, preis }) => {
                const steuer = ergebnis.steuerProJahr[jahr] || 0;
                const maxSteuer = Math.max(...Object.values(ergebnis.steuerProJahr));
                const prozent = (steuer / maxSteuer) * 100;
                const istAktuellesJahr = jahr === ausgewähltesJahr;
                
                return (
                  <div key={jahr} className="flex items-center gap-3">
                    <span className={`w-12 text-sm font-medium ${istAktuellesJahr ? 'text-green-600' : 'text-gray-600'}`}>
                      {jahr}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          istAktuellesJahr ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${prozent}%` }}
                      />
                    </div>
                    <span className={`w-20 text-right text-sm font-medium ${istAktuellesJahr ? 'text-green-600' : 'text-gray-600'}`}>
                      {formatEuro(steuer)}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Jahr</th>
                    <th className="text-center py-2 px-3 font-semibold text-gray-700">€/Tonne</th>
                    <th className="text-center py-2 px-3 font-semibold text-gray-700">Cent/{ergebnis.info.einheit}</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Ihre Kosten</th>
                  </tr>
                </thead>
                <tbody>
                  {CO2_STEUER_ENTWICKLUNG.map(({ jahr, preis }) => (
                    <tr 
                      key={jahr} 
                      className={`border-b border-gray-100 ${jahr === ausgewähltesJahr ? 'bg-green-50' : ''}`}
                    >
                      <td className="py-2 px-3 font-medium">{jahr}</td>
                      <td className="py-2 px-3 text-center">{preis} €</td>
                      <td className="py-2 px-3 text-center">{formatCent(ergebnis.steuerProEinheit[jahr])}</td>
                      <td className="py-2 px-3 text-right font-bold">{formatEuro(ergebnis.steuerProJahr[jahr])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Detaillierte Berechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧮 So wird die CO₂-Steuer berechnet</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Jahresverbrauch</span>
            <span className="font-bold text-gray-900">
              {formatNumber(jahresverbrauch, 0)} {ergebnis.info.einheit}
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">CO₂-Ausstoß pro {ergebnis.info.einheit}</span>
            <span className="text-gray-900">{formatNumber(ergebnis.info.co2ProEinheit, 2)} kg</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">CO₂-Ausstoß gesamt</span>
            <span className="text-gray-900">
              {formatNumber(ergebnis.co2Gesamt, 0)} kg = {formatNumber(ergebnis.co2Tonnen, 3)} t
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">CO₂-Preis {ausgewähltesJahr}</span>
            <span className="text-gray-900">{ergebnis.co2PreisAktuell} € pro Tonne</span>
          </div>
          
          <div className="flex justify-between py-3 bg-green-50 -mx-6 px-6 mt-4">
            <span className="font-bold text-green-800">CO₂-Steuer {ausgewähltesJahr}</span>
            <span className="font-bold text-2xl text-green-900">{formatEuro(ergebnis.steuerAktuell)}</span>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600">
            <strong>Formel:</strong> {formatNumber(jahresverbrauch, 0)} {ergebnis.info.einheit} × {formatNumber(ergebnis.info.co2ProEinheit, 2)} kg/
            {ergebnis.info.einheit} ÷ 1000 × {ergebnis.co2PreisAktuell} €/t = {formatEuro(ergebnis.steuerAktuell)}
          </p>
        </div>
      </div>

      {/* Tipps zum Sparen */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💡 So reduzieren Sie Ihre CO₂-Steuer</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          {ergebnis.info.kategorie === 'kraftstoff' ? (
            <>
              <li className="flex gap-2">
                <span>🚗</span>
                <span><strong>Spritsparend fahren:</strong> Vorausschauendes Fahren spart bis zu 20% Kraftstoff</span>
              </li>
              <li className="flex gap-2">
                <span>🚴</span>
                <span><strong>Alternativen nutzen:</strong> Fahrrad, ÖPNV oder Fahrgemeinschaften</span>
              </li>
              <li className="flex gap-2">
                <span>⚡</span>
                <span><strong>E-Auto:</strong> Keine CO₂-Steuer auf Strom für Elektrofahrzeuge</span>
              </li>
              <li className="flex gap-2">
                <span>🏠</span>
                <span><strong>Homeoffice:</strong> Weniger Pendeln = weniger Kraftstoff</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex gap-2">
                <span>🌡️</span>
                <span><strong>Heizung runterdrehen:</strong> 1°C weniger spart ca. 6% Heizenergie</span>
              </li>
              <li className="flex gap-2">
                <span>🏠</span>
                <span><strong>Dämmung verbessern:</strong> Gut gedämmte Häuser brauchen weniger Heizenergie</span>
              </li>
              <li className="flex gap-2">
                <span>♨️</span>
                <span><strong>Wärmepumpe:</strong> Keine CO₂-Steuer auf Strom für Heizung</span>
              </li>
              <li className="flex gap-2">
                <span>☀️</span>
                <span><strong>Solarthermie:</strong> Warmwasser durch Sonnenenergie</span>
              </li>
            </>
          )}
          <li className="flex gap-2">
            <span>📊</span>
            <span><strong>Verbrauch tracken:</strong> Wer seinen Verbrauch kennt, kann gezielt sparen</span>
          </li>
        </ul>
      </div>

      {/* Vergleich verschiedene Kraftstoffe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">⛽ CO₂-Steuer nach Kraftstoffart ({ausgewähltesJahr})</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-3 font-semibold text-gray-700">Kraftstoff</th>
                <th className="text-center py-3 px-3 font-semibold text-gray-700">CO₂/Einheit</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Steuer/Einheit</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(KRAFTSTOFFE) as [Kraftstofftyp, KraftstoffInfo][]).map(([key, info]) => {
                const steuerProEinheit = (info.co2ProEinheit / 1000) * ergebnis.co2PreisAktuell;
                const istAktuell = key === kraftstoff;
                
                return (
                  <tr 
                    key={key} 
                    className={`border-b border-gray-100 ${istAktuell ? 'bg-green-50' : ''}`}
                  >
                    <td className="py-3 px-3">
                      <span className="mr-2">{info.emoji}</span>
                      {info.name}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-600">
                      {formatNumber(info.co2ProEinheit, 2)} kg/{info.einheit}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold ${istAktuell ? 'text-green-600' : ''}`}>
                      {formatCent(steuerProEinheit)}/{info.einheit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">❓ Häufige Fragen zur CO₂-Steuer</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold text-gray-800">Was ist die CO₂-Steuer?</p>
            <p className="text-gray-600 mt-1">
              Die CO₂-Steuer (offiziell: CO₂-Bepreisung) ist eine Abgabe auf fossile Brennstoffe wie 
              Benzin, Diesel, Heizöl und Erdgas. Sie soll Anreize zum Klimaschutz schaffen.
            </p>
          </div>
          
          <div>
            <p className="font-semibold text-gray-800">Wie hoch ist die CO₂-Steuer 2026?</p>
            <p className="text-gray-600 mt-1">
              2026 beträgt der CO₂-Preis 55 Euro pro Tonne CO₂. Das entspricht etwa {formatCent((2.37 / 1000) * 55)} pro Liter Benzin 
              bzw. {formatCent((2.65 / 1000) * 55)} pro Liter Diesel.
            </p>
          </div>
          
          <div>
            <p className="font-semibold text-gray-800">Wer zahlt die CO₂-Steuer?</p>
            <p className="text-gray-600 mt-1">
              Die Steuer wird von den Unternehmen gezahlt, die fossile Brennstoffe in Verkehr bringen. 
              Sie geben die Kosten aber an die Verbraucher weiter – über höhere Sprit- und Heizölpreise.
            </p>
          </div>
          
          <div>
            <p className="font-semibold text-gray-800">Gibt es eine Entlastung?</p>
            <p className="text-gray-600 mt-1">
              Ja, das <strong>Klimageld</strong> soll die Einnahmen pro Kopf an die Bürger zurückgeben. 
              Die Auszahlung ist jedoch noch nicht umgesetzt (Stand 2025). Außerdem wurde die 
              Pendlerpauschale ab dem 21. km auf 38 Cent erhöht.
            </p>
          </div>
          
          <div>
            <p className="font-semibold text-gray-800">Gilt die CO₂-Steuer auch für Strom?</p>
            <p className="text-gray-600 mt-1">
              Nein, für Strom gibt es den EU-Emissionshandel (EU ETS). Die nationale CO₂-Bepreisung 
              gilt nur für Wärme und Verkehr.
            </p>
          </div>
        </div>
      </div>

      {/* Rechtlicher Hinweis */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Rechtliche Grundlage</h3>
        <p className="text-sm text-gray-600">
          Die CO₂-Bepreisung basiert auf dem <strong>Brennstoffemissionshandelsgesetz (BEHG)</strong> 
          vom 12. Dezember 2019 und dessen Änderungen. Die Preise werden über 
          <strong> Emissionszertifikate</strong> umgesetzt, die Unternehmen kaufen müssen.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Links</h4>
        <div className="space-y-1">
          <a 
            href="https://www.bundesregierung.de/breg-de/themen/klimaschutz/co2-bepreisung"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – CO₂-Bepreisung
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/behg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BEHG – Brennstoffemissionshandelsgesetz
          </a>
          <a 
            href="https://www.umweltbundesamt.de/themen/klima-energie/klimaschutz-energiepolitik-in-deutschland/nationaler-emissionshandel"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Umweltbundesamt – Nationaler Emissionshandel
          </a>
          <a 
            href="https://www.dehst.de/DE/Nationaler-Emissionshandel/nationaler-emissionshandel_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DEHSt – Deutsche Emissionshandelsstelle
          </a>
        </div>
      </div>
    </div>
  );
}
