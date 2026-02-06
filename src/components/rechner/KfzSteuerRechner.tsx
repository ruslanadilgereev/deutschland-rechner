import { useState, useMemo } from 'react';

// CO2-Staffelung nach KraftStG ab 2021
// Jede Stufe definiert: von (exklusiv), bis (inklusive), EUR pro g/km
const CO2_STAFFELUNG = [
  { von: 0, bis: 95, euroProGKm: 0 },
  { von: 95, bis: 115, euroProGKm: 2.00 },
  { von: 115, bis: 135, euroProGKm: 2.20 },
  { von: 135, bis: 155, euroProGKm: 2.50 },
  { von: 155, bis: 175, euroProGKm: 2.90 },
  { von: 175, bis: 195, euroProGKm: 3.40 },
  { von: 195, bis: Infinity, euroProGKm: 4.00 },
];

// Hubraum-Steuersätze
const HUBRAUM_SAETZE = {
  benzin: 2.00, // EUR pro angefangene 100 cm³
  diesel: 9.50, // EUR pro angefangene 100 cm³
};

// Elektroauto-Befreiung
const ELEKTRO_BEFREIUNG_BIS = new Date('2030-12-31');
const ELEKTRO_MAX_BEFREIUNG_JAHRE = 10;

type Kraftstoffart = 'benzin' | 'diesel' | 'elektro' | 'hybrid-benzin' | 'hybrid-diesel';
type Schadstoffklasse = 'euro6' | 'euro5' | 'euro4' | 'euro3' | 'euro2' | 'euro1';

interface BerechnungDetails {
  hubraumSteuer: number;
  hubraumEinheiten: number;
  co2Steuer: number;
  co2Details: { stufe: string; gramm: number; satz: number; betrag: number }[];
  gesamtSteuer: number;
  elektroBefreit: boolean;
  elektroBefreiungBis?: Date;
  monatlicherBetrag: number;
  halbjahresBetrag: number;
}

export default function KfzSteuerRechner() {
  const [hubraum, setHubraum] = useState(1600);
  const [co2, setCo2] = useState(120);
  const [kraftstoff, setKraftstoff] = useState<Kraftstoffart>('benzin');
  const [erstzulassung, setErstzulassung] = useState('2023-01-01');
  const [schadstoffklasse, setSchadstoffklasse] = useState<Schadstoffklasse>('euro6');

  const ergebnis = useMemo((): BerechnungDetails => {
    const zulassungsDatum = new Date(erstzulassung);
    const istElektro = kraftstoff === 'elektro';
    const istHybrid = kraftstoff.startsWith('hybrid');
    const basisKraftstoff = istHybrid ? (kraftstoff === 'hybrid-benzin' ? 'benzin' : 'diesel') : kraftstoff;
    
    // Elektroauto-Befreiung prüfen
    if (istElektro) {
      const befreiungEnde = new Date(zulassungsDatum);
      befreiungEnde.setFullYear(befreiungEnde.getFullYear() + ELEKTRO_MAX_BEFREIUNG_JAHRE);
      const befreiungBis = befreiungEnde < ELEKTRO_BEFREIUNG_BIS ? befreiungEnde : ELEKTRO_BEFREIUNG_BIS;
      const heute = new Date();
      
      if (heute < befreiungBis) {
        return {
          hubraumSteuer: 0,
          hubraumEinheiten: 0,
          co2Steuer: 0,
          co2Details: [],
          gesamtSteuer: 0,
          elektroBefreit: true,
          elektroBefreiungBis: befreiungBis,
          monatlicherBetrag: 0,
          halbjahresBetrag: 0,
        };
      }
    }
    
    // === 1. Hubraum-Steuer berechnen ===
    const hubraumEinheiten = Math.ceil(hubraum / 100);
    const hubraumSatz = HUBRAUM_SAETZE[basisKraftstoff as 'benzin' | 'diesel'] || HUBRAUM_SAETZE.benzin;
    const hubraumSteuer = hubraumEinheiten * hubraumSatz;
    
    // === 2. CO2-Steuer berechnen (nur für Pkw ab 2021) ===
    let co2Steuer = 0;
    const co2Details: { stufe: string; gramm: number; satz: number; betrag: number }[] = [];
    
    // CO2-Staffelung nur für Fahrzeuge mit CO2-Wert
    if (co2 > 0 && !istElektro) {
      let verbleibendeCo2 = co2;
      
      for (const stufe of CO2_STAFFELUNG) {
        if (verbleibendeCo2 <= stufe.von) break;
        
        const inDieserStufe = Math.min(verbleibendeCo2, stufe.bis) - stufe.von;
        if (inDieserStufe > 0 && stufe.euroProGKm > 0) {
          const betrag = inDieserStufe * stufe.euroProGKm;
          co2Steuer += betrag;
          co2Details.push({
            stufe: stufe.bis === Infinity ? `über ${stufe.von} g/km` : `${stufe.von + 1}-${stufe.bis} g/km`,
            gramm: inDieserStufe,
            satz: stufe.euroProGKm,
            betrag,
          });
        }
      }
    }
    
    const gesamtSteuer = Math.round(hubraumSteuer + co2Steuer);
    
    return {
      hubraumSteuer,
      hubraumEinheiten,
      co2Steuer,
      co2Details,
      gesamtSteuer,
      elektroBefreit: false,
      monatlicherBetrag: gesamtSteuer / 12,
      halbjahresBetrag: gesamtSteuer / 2,
    };
  }, [hubraum, co2, kraftstoff, erstzulassung, schadstoffklasse]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  const kraftstoffOptionen: { value: Kraftstoffart; label: string; icon: string }[] = [
    { value: 'benzin', label: 'Benzin', icon: '⛽' },
    { value: 'diesel', label: 'Diesel', icon: '🛢️' },
    { value: 'elektro', label: 'Elektro', icon: '🔋' },
    { value: 'hybrid-benzin', label: 'Hybrid (Benzin)', icon: '🔌' },
    { value: 'hybrid-diesel', label: 'Hybrid (Diesel)', icon: '🔌' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kraftstoffart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Antriebsart</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {kraftstoffOptionen.map((option) => (
              <button
                key={option.value}
                onClick={() => setKraftstoff(option.value)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  kraftstoff === option.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hubraum (nicht bei Elektro) */}
        {kraftstoff !== 'elektro' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Hubraum</span>
              <span className="text-xs text-gray-500 block mt-1">
                Motorvolumen in Kubikzentimeter (cm³)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={hubraum}
                onChange={(e) => setHubraum(Math.max(0, Number(e.target.value)))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                max="8000"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">cm³</span>
            </div>
            <input
              type="range"
              value={hubraum}
              onChange={(e) => setHubraum(Number(e.target.value))}
              className="w-full mt-3 accent-orange-500"
              min="500"
              max="5000"
              step="100"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>500 cm³</span>
              <span>2.500 cm³</span>
              <span>5.000 cm³</span>
            </div>
          </div>
        )}

        {/* CO2-Emissionen (nicht bei Elektro) */}
        {kraftstoff !== 'elektro' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">CO₂-Emissionen</span>
              <span className="text-xs text-gray-500 block mt-1">
                Kombinierter WLTP-Wert laut Fahrzeugschein (Feld V.7)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={co2}
                onChange={(e) => setCo2(Math.max(0, Number(e.target.value)))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                min="0"
                max="400"
                step="1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">g/km</span>
            </div>
            <input
              type="range"
              value={co2}
              onChange={(e) => setCo2(Number(e.target.value))}
              className="w-full mt-3 accent-orange-500"
              min="0"
              max="300"
              step="1"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 g/km</span>
              <span>150 g/km</span>
              <span>300 g/km</span>
            </div>
            {co2 <= 95 && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Keine CO₂-Steuer bis 95 g/km
              </p>
            )}
          </div>
        )}

        {/* Erstzulassung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Erstzulassung</span>
            <span className="text-xs text-gray-500 block mt-1">
              Datum der ersten Zulassung (Feld B im Fahrzeugschein)
            </span>
          </label>
          <input
            type="date"
            value={erstzulassung}
            onChange={(e) => setErstzulassung(e.target.value)}
            className="w-full text-lg font-medium text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
          />
        </div>

        {/* Schnellauswahl Fahrzeugtyp */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Schnellauswahl</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setHubraum(1200); setCo2(105); setKraftstoff('benzin'); }}
              className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
              🚗 Kleinwagen (1.2L Benzin)
            </button>
            <button
              onClick={() => { setHubraum(1600); setCo2(120); setKraftstoff('benzin'); }}
              className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
              🚙 Kompaktwagen (1.6L)
            </button>
            <button
              onClick={() => { setHubraum(2000); setCo2(140); setKraftstoff('diesel'); }}
              className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
              🚐 Mittelklasse (2.0L Diesel)
            </button>
            <button
              onClick={() => { setHubraum(3000); setCo2(200); setKraftstoff('benzin'); }}
              className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
              🏎️ SUV/Sportwagen (3.0L)
            </button>
            <button
              onClick={() => { setKraftstoff('elektro'); }}
              className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
              🔋 Elektroauto
            </button>
            <button
              onClick={() => { setHubraum(1800); setCo2(35); setKraftstoff('hybrid-benzin'); }}
              className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
              🔌 Plug-in-Hybrid
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {ergebnis.elektroBefreit ? (
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">🔋 Elektrofahrzeug</h3>
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">0 €</span>
              <span className="text-xl opacity-80">pro Jahr</span>
            </div>
            <p className="text-green-100 mt-2">
              Ihr Elektrofahrzeug ist von der Kfz-Steuer befreit!
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm">
              <strong>Steuerbefreiung bis:</strong>{' '}
              {ergebnis.elektroBefreiungBis?.toLocaleDateString('de-DE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs text-green-100 mt-2">
              Elektrofahrzeuge sind für max. 10 Jahre ab Erstzulassung, längstens bis 31.12.2030, 
              von der Kfz-Steuer befreit (§ 3d KraftStG).
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">🚗 Ihre Kfz-Steuer</h3>
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuroRound(ergebnis.gesamtSteuer)}</span>
              <span className="text-xl opacity-80">pro Jahr</span>
            </div>
            <p className="text-orange-100 mt-2 text-sm">
              Das sind ca. <strong>{formatEuro(ergebnis.monatlicherBetrag)}</strong> pro Monat
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Hubraum-Steuer</span>
              <div className="text-xl font-bold">{formatEuroRound(ergebnis.hubraumSteuer)}</div>
              <p className="text-xs text-orange-100 mt-1">
                {ergebnis.hubraumEinheiten} × {kraftstoff === 'diesel' || kraftstoff === 'hybrid-diesel' ? '9,50' : '2,00'} €
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">CO₂-Steuer</span>
              <div className="text-xl font-bold">{formatEuroRound(ergebnis.co2Steuer)}</div>
              <p className="text-xs text-orange-100 mt-1">
                {co2 > 95 ? `ab 96 g/km` : 'keine'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Berechnungsdetails (nicht bei Elektro) */}
      {!ergebnis.elektroBefreit && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
          
          <div className="space-y-3 text-sm">
            {/* Hubraum */}
            <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
              Hubraum-Steuer
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Hubraum</span>
              <span className="font-bold text-gray-900">{hubraum.toLocaleString('de-DE')} cm³</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Angefangene 100 cm³</span>
              <span className="text-gray-900">{ergebnis.hubraumEinheiten} Einheiten</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                Steuersatz ({kraftstoff === 'diesel' || kraftstoff === 'hybrid-diesel' ? 'Diesel' : 'Benzin'})
              </span>
              <span className="text-gray-900">
                {kraftstoff === 'diesel' || kraftstoff === 'hybrid-diesel' ? '9,50' : '2,00'} € / 100 cm³
              </span>
            </div>
            <div className="flex justify-between py-2 bg-orange-50 -mx-6 px-6">
              <span className="font-medium text-orange-700">= Hubraum-Steuer</span>
              <span className="font-bold text-orange-900">{formatEuro(ergebnis.hubraumSteuer)}</span>
            </div>
            
            {/* CO2 */}
            <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
              CO₂-Steuer (ab 2021)
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">CO₂-Emissionen</span>
              <span className="font-bold text-gray-900">{co2} g/km</span>
            </div>
            
            {co2 <= 95 ? (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Freibetrag bis 95 g/km</span>
                <span className="text-green-600">✓ keine Steuer</span>
              </div>
            ) : (
              <>
                <div className="text-xs text-gray-500 py-1">
                  Staffelung nach CO₂-Wert:
                </div>
                {ergebnis.co2Details.map((detail, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                    <span className="text-gray-600">
                      {detail.gramm} g × {formatEuro(detail.satz)}
                      <span className="text-xs text-gray-400 ml-1">({detail.stufe})</span>
                    </span>
                    <span className="text-gray-900">{formatEuro(detail.betrag)}</span>
                  </div>
                ))}
              </>
            )}
            
            <div className="flex justify-between py-2 bg-orange-50 -mx-6 px-6">
              <span className="font-medium text-orange-700">= CO₂-Steuer</span>
              <span className="font-bold text-orange-900">{formatEuro(ergebnis.co2Steuer)}</span>
            </div>
            
            {/* Gesamt */}
            <div className="flex justify-between py-3 bg-orange-100 -mx-6 px-6 rounded-b-xl mt-4">
              <span className="font-bold text-orange-800">Kfz-Steuer / Jahr</span>
              <span className="font-bold text-2xl text-orange-900">{formatEuroRound(ergebnis.gesamtSteuer)}</span>
            </div>
          </div>
        </div>
      )}

      {/* CO2-Staffelung Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📈 CO₂-Staffelung 2025</h3>
        <p className="text-sm text-gray-600 mb-4">
          Die CO₂-Komponente wird seit 2021 progressiv berechnet. Je höher der CO₂-Wert, 
          desto mehr zahlen Sie pro Gramm:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 rounded-tl-lg">CO₂-Bereich</th>
                <th className="text-right py-2 px-3 rounded-tr-lg">Steuersatz</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-600">0 – 95 g/km</td>
                <td className="py-2 px-3 text-right text-green-600 font-medium">0,00 €/g</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-600">96 – 115 g/km</td>
                <td className="py-2 px-3 text-right font-medium">2,00 €/g</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-600">116 – 135 g/km</td>
                <td className="py-2 px-3 text-right font-medium">2,20 €/g</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-600">136 – 155 g/km</td>
                <td className="py-2 px-3 text-right font-medium">2,50 €/g</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-600">156 – 175 g/km</td>
                <td className="py-2 px-3 text-right font-medium">2,90 €/g</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-600">176 – 195 g/km</td>
                <td className="py-2 px-3 text-right font-medium">3,40 €/g</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-gray-600 rounded-bl-lg">über 195 g/km</td>
                <td className="py-2 px-3 text-right text-red-600 font-medium rounded-br-lg">4,00 €/g</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Kfz-Steuer</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Hubraum-Komponente:</strong> Benziner 2€, Diesel 9,50€ pro angefangene 100 cm³</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>CO₂-Komponente:</strong> Progressive Staffelung ab 96 g/km (2,00–4,00 €/g)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Elektroautos:</strong> Steuerbefreiung für max. 10 Jahre (bis Ende 2030)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>WLTP-Wert:</strong> CO₂-Wert im Fahrzeugschein (Feld V.7) beachten</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Fälligkeit:</strong> Jährlich im Voraus, Abbuchung per SEPA-Lastschrift</span>
          </li>
        </ul>
      </div>

      {/* Fahrzeugschein Hinweis */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-orange-800 mb-3">📋 Wo finde ich die Daten?</h3>
        <div className="space-y-3 text-sm text-orange-700">
          <p>Alle relevanten Daten stehen in Ihrer <strong>Zulassungsbescheinigung Teil I</strong> (Fahrzeugschein):</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-mono bg-orange-200 px-2 py-0.5 rounded text-xs">Feld P.1</span>
              <span>Hubraum in cm³</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono bg-orange-200 px-2 py-0.5 rounded text-xs">Feld V.7</span>
              <span>CO₂-Emissionen in g/km (kombiniert)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono bg-orange-200 px-2 py-0.5 rounded text-xs">Feld B</span>
              <span>Datum der Erstzulassung</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono bg-orange-200 px-2 py-0.5 rounded text-xs">Feld P.3</span>
              <span>Kraftstoffart / Energiequelle</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Saisonkennzeichen:</strong> Bei eingeschränkter Zulassung wird die Steuer anteilig berechnet</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Oldtimer (H-Kennzeichen):</strong> Pauschale 191,73€ (Pkw) bzw. 46,02€ (Motorräder)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Altfahrzeuge vor 2021:</strong> Andere Berechnung ohne CO₂-Staffelung möglich</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Steuerschuldner:</strong> Der Halter laut Fahrzeugschein ist steuerpflichtig</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Stilllegung:</strong> Bei Außerbetriebsetzung entfällt die Steuerpflicht ab dem Folgetag</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="font-semibold text-orange-900">Hauptzollamt</p>
            <p className="text-sm text-orange-700 mt-1">
              Die Kfz-Steuer wird vom Zoll erhoben. Zuständig ist das Hauptzollamt Ihres Wohnortes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Zoll-Hotline</p>
                <p className="text-gray-600">0800 6888 000 (kostenfrei)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Portal</p>
                <a 
                  href="https://www.zoll.de/DE/Privatpersonen/Kraftfahrzeugsteuer/kraftfahrzeugsteuer_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  zoll.de/Kraftfahrzeugsteuer →
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">💳</span>
            <div>
              <p className="font-medium text-gray-800">Zahlungsweise</p>
              <p className="text-gray-600 mt-1">
                Die Kfz-Steuer wird jährlich im Voraus per <strong>SEPA-Lastschrift</strong> eingezogen. 
                Ein SEPA-Mandat wird bei der Zulassung erteilt.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/kraftstg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Kraftfahrzeugsteuergesetz (KraftStG) – Gesetze im Internet
          </a>
          <a 
            href="https://www.zoll.de/DE/Privatpersonen/Kraftfahrzeugsteuer/kraftfahrzeugsteuer_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Zoll – Kraftfahrzeugsteuer
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Web/DE/Themen/Zoll/Kraftfahrzeugsteuer/kraftfahrzeugsteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – Kfz-Steuer
          </a>
          <a 
            href="https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/kfz-steuer/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Kfz-Steuer berechnen
          </a>
        </div>
      </div>
    </div>
  );
}
