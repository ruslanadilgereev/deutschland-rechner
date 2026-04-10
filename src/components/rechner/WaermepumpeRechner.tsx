import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// BAFA-Förderung 2026 (Bundesförderung für effiziente Gebäude)
// Quelle: BAFA, KfW, BMWi
const FOERDERUNG = {
  grundfoerderung: 30, // 30% Basisförderung
  klimabonus: 20, // 20% Klimageschwindigkeitsbonus (bis Ende 2028)
  einkommensbonus: 30, // 30% für Haushalte unter 40.000€ Einkommen
  effizienzbonus: 5, // 5% für natürliche Kältemittel
  maxFoerderung: 70, // Maximal 70% Förderung
  maxKosten: 30000, // Förderfähige Kosten max. 30.000€ für erstes Wohngebäude
};

// Heizungssysteme für Vergleich
// Quellen: BDEW, Heizspiegel 2025, Verivox (Stand 2026)
const HEIZSYSTEME = {
  waermepumpe: {
    name: 'Wärmepumpe',
    icon: '💚',
    strompreis: 32, // ct/kWh (Wärmepumpentarif)
    co2: 380, // g/kWh Strom (deutscher Mix)
    anschaffung: 25000, // €
    wartung: 200, // €/Jahr
    lebensdauer: 20, // Jahre
  },
  gas: {
    name: 'Gasheizung',
    icon: '🔵',
    preis: 12, // ct/kWh inkl. CO2-Steuer
    co2: 201, // g/kWh
    anschaffung: 12000, // €
    wartung: 300, // €/Jahr
    lebensdauer: 20,
  },
  oel: {
    name: 'Ölheizung',
    icon: '🟤',
    preis: 11, // ct/kWh inkl. CO2-Steuer
    co2: 266, // g/kWh
    anschaffung: 14000, // €
    wartung: 350, // €/Jahr
    lebensdauer: 20,
  },
};

// Gebäudetypen mit Wärmebedarf in kWh/m²/Jahr
const GEBAEUDETYPEN = {
  unsaniert: { kwhProQm: 180, label: 'Unsanierter Altbau (vor 1978)', cop: 2.8 },
  teilsaniert: { kwhProQm: 130, label: 'Teilsaniert (1979-2001)', cop: 3.2 },
  saniert: { kwhProQm: 100, label: 'Saniert/Neubau (ab 2002)', cop: 3.8 },
  effizienzhaus: { kwhProQm: 60, label: 'Effizienzhaus/Passivhaus', cop: 4.5 },
};

type GebaeudetypKey = keyof typeof GEBAEUDETYPEN;

// Wärmepumpentypen
const WAERMEPUMPENTYPEN = {
  luftWasser: { name: 'Luft-Wasser', copFaktor: 1, beschreibung: 'Günstig, einfache Installation', anschaffung: 22000 },
  erdwaerme: { name: 'Sole-Wasser (Erdwärme)', copFaktor: 1.25, beschreibung: 'Höhere Effizienz, teurer', anschaffung: 35000 },
  grundwasser: { name: 'Wasser-Wasser', copFaktor: 1.3, beschreibung: 'Beste Effizienz, Genehmigung nötig', anschaffung: 28000 },
};

type WaermepumpeKey = keyof typeof WAERMEPUMPENTYPEN;

export default function WaermepumpeRechner() {
  // Eingabewerte
  const [wohnflaeche, setWohnflaeche] = useState(120);
  const [gebaeudetyp, setGebaeudetyp] = useState<GebaeudetypKey>('teilsaniert');
  const [waermepumpentyp, setWaermepumpentyp] = useState<WaermepumpeKey>('luftWasser');
  const [cop, setCop] = useState(3.5);
  const [strompreis, setStrompreis] = useState(32);
  const [gaspreis, setGaspreis] = useState(12);
  const [oelpreis, setOelpreis] = useState(11);
  
  // Förderung
  const [hatKlimabonus, setHatKlimabonus] = useState(true);
  const [hatEinkommensbonus, setHatEinkommensbonus] = useState(false);
  const [hatEffizienzbonus, setHatEffizienzbonus] = useState(false);
  
  // COP automatisch anpassen bei Änderung von Gebäude/Wärmepumpentyp
  const handleGebaeudetypChange = (key: GebaeudetypKey) => {
    setGebaeudetyp(key);
    const baseCop = GEBAEUDETYPEN[key].cop;
    const wpFaktor = WAERMEPUMPENTYPEN[waermepumpentyp].copFaktor;
    setCop(Math.round(baseCop * wpFaktor * 10) / 10);
  };
  
  const handleWaermepumpenChange = (key: WaermepumpeKey) => {
    setWaermepumpentyp(key);
    const baseCop = GEBAEUDETYPEN[gebaeudetyp].cop;
    const wpFaktor = WAERMEPUMPENTYPEN[key].copFaktor;
    setCop(Math.round(baseCop * wpFaktor * 10) / 10);
  };

  const ergebnis = useMemo(() => {
    // Wärmebedarf berechnen
    const kwhProQm = GEBAEUDETYPEN[gebaeudetyp].kwhProQm;
    const waermebedarf = wohnflaeche * kwhProQm;
    
    // Stromverbrauch Wärmepumpe (Wärmebedarf / COP)
    const stromverbrauchWP = waermebedarf / cop;
    
    // Jährliche Kosten Wärmepumpe
    const stromkostenWP = stromverbrauchWP * (strompreis / 100);
    const wartungWP = HEIZSYSTEME.waermepumpe.wartung;
    const jahresKostenWP = stromkostenWP + wartungWP;
    
    // Jährliche Kosten Gas (mit Wirkungsgrad 90%)
    const gasverbrauch = waermebedarf / 0.9;
    const gaskostenJahr = gasverbrauch * (gaspreis / 100);
    const wartungGas = HEIZSYSTEME.gas.wartung;
    const jahresKostenGas = gaskostenJahr + wartungGas;
    
    // Jährliche Kosten Öl (mit Wirkungsgrad 85%)
    const oelverbrauch = waermebedarf / 0.85;
    const oelkostenJahr = oelverbrauch * (oelpreis / 100);
    const wartungOel = HEIZSYSTEME.oel.wartung;
    const jahresKostenOel = oelkostenJahr + wartungOel;
    
    // Ersparnis pro Jahr
    const ersparnisVsGas = jahresKostenGas - jahresKostenWP;
    const ersparnisVsOel = jahresKostenOel - jahresKostenWP;
    
    // CO2-Emissionen
    const co2WP = (stromverbrauchWP * HEIZSYSTEME.waermepumpe.co2) / 1000;
    const co2Gas = (gasverbrauch * HEIZSYSTEME.gas.co2) / 1000;
    const co2Oel = (oelverbrauch * HEIZSYSTEME.oel.co2) / 1000;
    
    // CO2-Ersparnis
    const co2ErsparnisMittel = ((co2Gas + co2Oel) / 2) - co2WP;
    
    // Förderung berechnen
    let foerdersatz = FOERDERUNG.grundfoerderung;
    if (hatKlimabonus) foerdersatz += FOERDERUNG.klimabonus;
    if (hatEinkommensbonus) foerdersatz += FOERDERUNG.einkommensbonus;
    if (hatEffizienzbonus) foerdersatz += FOERDERUNG.effizienzbonus;
    foerdersatz = Math.min(foerdersatz, FOERDERUNG.maxFoerderung);
    
    const anschaffungBrutto = WAERMEPUMPENTYPEN[waermepumpentyp].anschaffung;
    const foerderfaehigeKosten = Math.min(anschaffungBrutto, FOERDERUNG.maxKosten);
    const foerderbetrag = foerderfaehigeKosten * (foerdersatz / 100);
    const eigenanteil = anschaffungBrutto - foerderbetrag;
    
    // Amortisation (vereinfacht, ohne Zinsen)
    // Mehrkosten vs Gas
    const mehrkostenVsGas = eigenanteil - HEIZSYSTEME.gas.anschaffung;
    const amortisationGas = ersparnisVsGas > 0 
      ? Math.ceil(mehrkostenVsGas / ersparnisVsGas)
      : 999;
    
    // Mehrkosten vs Öl  
    const mehrkostenVsOel = eigenanteil - HEIZSYSTEME.oel.anschaffung;
    const amortisationOel = ersparnisVsOel > 0
      ? Math.ceil(mehrkostenVsOel / ersparnisVsOel)
      : 999;
    
    // Gesamtkosten über 20 Jahre
    const gesamtWP20 = eigenanteil + (jahresKostenWP * 20);
    const gesamtGas20 = HEIZSYSTEME.gas.anschaffung + (jahresKostenGas * 20);
    const gesamtOel20 = HEIZSYSTEME.oel.anschaffung + (jahresKostenOel * 20);
    
    return {
      waermebedarf: Math.round(waermebedarf),
      stromverbrauchWP: Math.round(stromverbrauchWP),
      stromkostenWP: Math.round(stromkostenWP),
      jahresKostenWP: Math.round(jahresKostenWP),
      monatskostenWP: Math.round(jahresKostenWP / 12),
      
      gasverbrauch: Math.round(gasverbrauch),
      jahresKostenGas: Math.round(jahresKostenGas),
      monatskostenGas: Math.round(jahresKostenGas / 12),
      
      oelverbrauch: Math.round(oelverbrauch),
      jahresKostenOel: Math.round(jahresKostenOel),
      monatskostenOel: Math.round(jahresKostenOel / 12),
      
      ersparnisVsGas: Math.round(ersparnisVsGas),
      ersparnisVsOel: Math.round(ersparnisVsOel),
      
      co2WP: Math.round(co2WP),
      co2Gas: Math.round(co2Gas),
      co2Oel: Math.round(co2Oel),
      co2ErsparnisMittel: Math.round(co2ErsparnisMittel),
      
      foerdersatz,
      anschaffungBrutto,
      foerderbetrag: Math.round(foerderbetrag),
      eigenanteil: Math.round(eigenanteil),
      
      amortisationGas: Math.min(amortisationGas, 99),
      amortisationOel: Math.min(amortisationOel, 99),
      
      gesamtWP20: Math.round(gesamtWP20),
      gesamtGas20: Math.round(gesamtGas20),
      gesamtOel20: Math.round(gesamtOel20),
      
      ersparnis20VsGas: Math.round(gesamtGas20 - gesamtWP20),
      ersparnis20VsOel: Math.round(gesamtOel20 - gesamtWP20),
    };
  }, [wohnflaeche, gebaeudetyp, waermepumpentyp, cop, strompreis, gaspreis, oelpreis, hatKlimabonus, hatEinkommensbonus, hatEffizienzbonus]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatKwh = (n: number) => n.toLocaleString('de-DE') + ' kWh';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Wärmepumpe-Rechner 2025 & 2026" rechnerSlug="waermepumpe-rechner" />

{/* Eingabe-Bereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        
        {/* Wohnfläche */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wohnfläche</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={wohnflaeche}
              onChange={(e) => setWohnflaeche(Math.max(20, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
              min="20"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">m²</span>
          </div>
          <input
            type="range"
            min="40"
            max="400"
            step="10"
            value={wohnflaeche}
            onChange={(e) => setWohnflaeche(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>40 m²</span>
            <span>400 m²</span>
          </div>
        </div>

        {/* Gebäudetyp */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gebäudetyp / Dämmstandard</span>
          </label>
          <div className="space-y-2">
            {Object.entries(GEBAEUDETYPEN).map(([key, g]) => (
              <button
                key={key}
                onClick={() => handleGebaeudetypChange(key as GebaeudetypKey)}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors text-left ${
                  gebaeudetyp === key
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{g.label}</span>
                  <span className={`text-sm ${gebaeudetyp === key ? 'text-green-100' : 'text-gray-500'}`}>
                    ~{g.kwhProQm} kWh/m²
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Wärmepumpentyp */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Art der Wärmepumpe</span>
          </label>
          <div className="space-y-2">
            {Object.entries(WAERMEPUMPENTYPEN).map(([key, wp]) => (
              <button
                key={key}
                onClick={() => handleWaermepumpenChange(key as WaermepumpeKey)}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors text-left ${
                  waermepumpentyp === key
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{wp.name}</span>
                    <p className={`text-sm ${waermepumpentyp === key ? 'text-green-100' : 'text-gray-500'}`}>
                      {wp.beschreibung}
                    </p>
                  </div>
                  <span className={`text-sm ${waermepumpentyp === key ? 'text-green-100' : 'text-gray-500'}`}>
                    ~{formatEuro(wp.anschaffung)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* COP / JAZ */}
        <div className="mb-6">
          <label className="flex justify-between mb-1">
            <span className="text-gray-700 font-medium">Jahresarbeitszahl (JAZ/COP)</span>
            <span className="font-bold text-green-600">{cop}</span>
          </label>
          <input
            type="range"
            min="2"
            max="6"
            step="0.1"
            value={cop}
            onChange={(e) => setCop(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2.0 (niedrig)</span>
            <span>3.5 (Ø)</span>
            <span>6.0 (sehr gut)</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            💡 Die JAZ gibt an, wie viel Wärme aus 1 kWh Strom erzeugt wird. Bei JAZ {cop} werden aus 1 kWh Strom {cop} kWh Wärme.
          </p>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Energiepreise */}
        <h3 className="font-medium text-gray-700 mb-4">⚡ Energiepreise</h3>
        
        {/* Strompreis */}
        <div className="mb-4">
          <label className="flex justify-between mb-1">
            <span className="text-gray-600">Strompreis (Wärmepumpentarif)</span>
            <span className="font-bold text-green-600">{strompreis} ct/kWh</span>
          </label>
          <input
            type="range"
            min="20"
            max="50"
            step="1"
            value={strompreis}
            onChange={(e) => setStrompreis(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>20 ct</span>
            <span>Ø 32 ct</span>
            <span>50 ct</span>
          </div>
        </div>

        {/* Gaspreis */}
        <div className="mb-4">
          <label className="flex justify-between mb-1">
            <span className="text-gray-600">Gaspreis (zum Vergleich)</span>
            <span className="font-bold text-blue-600">{gaspreis} ct/kWh</span>
          </label>
          <input
            type="range"
            min="6"
            max="20"
            step="0.5"
            value={gaspreis}
            onChange={(e) => setGaspreis(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>6 ct</span>
            <span>Ø 12 ct</span>
            <span>20 ct</span>
          </div>
        </div>

        {/* Ölpreis */}
        <div className="mb-6">
          <label className="flex justify-between mb-1">
            <span className="text-gray-600">Heizölpreis (zum Vergleich)</span>
            <span className="font-bold text-amber-700">{oelpreis} ct/kWh</span>
          </label>
          <input
            type="range"
            min="6"
            max="20"
            step="0.5"
            value={oelpreis}
            onChange={(e) => setOelpreis(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>6 ct</span>
            <span>Ø 11 ct</span>
            <span>20 ct</span>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* BAFA-Förderung */}
        <h3 className="font-medium text-gray-700 mb-4">🏛️ BAFA-Förderung 2026</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
            <div>
              <span className="font-medium text-green-800">Grundförderung</span>
              <p className="text-sm text-green-600">Für jede Wärmepumpe</p>
            </div>
            <span className="font-bold text-green-700">30%</span>
          </div>
          
          <div 
            onClick={() => setHatKlimabonus(!hatKlimabonus)}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
              hatKlimabonus ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hatKlimabonus}
                onChange={() => setHatKlimabonus(!hatKlimabonus)}
                className="w-5 h-5 rounded text-green-500 focus:ring-green-500"
              />
              <div>
                <span className={`font-medium ${hatKlimabonus ? 'text-green-800' : 'text-gray-600'}`}>
                  Klimageschwindigkeitsbonus
                </span>
                <p className={`text-sm ${hatKlimabonus ? 'text-green-600' : 'text-gray-500'}`}>
                  Alte Heizung ≥20 Jahre oder Öl/Gas/Kohle (bis Ende 2028)
                </p>
              </div>
            </div>
            <span className={`font-bold ${hatKlimabonus ? 'text-green-700' : 'text-gray-400'}`}>+20%</span>
          </div>
          
          <div 
            onClick={() => setHatEinkommensbonus(!hatEinkommensbonus)}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
              hatEinkommensbonus ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hatEinkommensbonus}
                onChange={() => setHatEinkommensbonus(!hatEinkommensbonus)}
                className="w-5 h-5 rounded text-green-500 focus:ring-green-500"
              />
              <div>
                <span className={`font-medium ${hatEinkommensbonus ? 'text-green-800' : 'text-gray-600'}`}>
                  Einkommensbonus
                </span>
                <p className={`text-sm ${hatEinkommensbonus ? 'text-green-600' : 'text-gray-500'}`}>
                  Haushaltseinkommen unter 40.000 €/Jahr
                </p>
              </div>
            </div>
            <span className={`font-bold ${hatEinkommensbonus ? 'text-green-700' : 'text-gray-400'}`}>+30%</span>
          </div>
          
          <div 
            onClick={() => setHatEffizienzbonus(!hatEffizienzbonus)}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
              hatEffizienzbonus ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hatEffizienzbonus}
                onChange={() => setHatEffizienzbonus(!hatEffizienzbonus)}
                className="w-5 h-5 rounded text-green-500 focus:ring-green-500"
              />
              <div>
                <span className={`font-medium ${hatEffizienzbonus ? 'text-green-800' : 'text-gray-600'}`}>
                  Effizienzbonus
                </span>
                <p className={`text-sm ${hatEffizienzbonus ? 'text-green-600' : 'text-gray-500'}`}>
                  Wärmepumpe mit natürlichem Kältemittel (z.B. Propan)
                </p>
              </div>
            </div>
            <span className={`font-bold ${hatEffizienzbonus ? 'text-green-700' : 'text-gray-400'}`}>+5%</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-100 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="font-medium text-green-800">Ihr Fördersatz:</span>
            <span className="text-2xl font-bold text-green-700">{ergebnis.foerdersatz}%</span>
          </div>
          {ergebnis.foerdersatz >= 70 && (
            <p className="text-sm text-green-600 mt-1">✓ Maximalförderung erreicht!</p>
          )}
        </div>
      </div>

      {/* Ergebnis-Box: Wärmepumpe */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-green-100 mb-1">💚 Ihre Wärmepumpe</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatEuro(ergebnis.jahresKostenWP)}</span>
            <span className="text-green-200 text-xl">/Jahr</span>
          </div>
          <p className="text-green-100 mt-2">
            ≈ <strong>{formatEuro(ergebnis.monatskostenWP)}</strong> pro Monat
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-green-100">
            <span>Wärmebedarf</span>
            <span className="font-medium">{formatKwh(ergebnis.waermebedarf)}</span>
          </div>
          <div className="flex justify-between text-green-100">
            <span>Stromverbrauch (JAZ {cop})</span>
            <span className="font-medium">{formatKwh(ergebnis.stromverbrauchWP)}</span>
          </div>
          <div className="flex justify-between text-green-100">
            <span>Stromkosten ({strompreis} ct × {formatKwh(ergebnis.stromverbrauchWP)})</span>
            <span className="font-medium">{formatEuro(ergebnis.stromkostenWP)}</span>
          </div>
          <div className="flex justify-between text-green-100">
            <span>Wartung</span>
            <span className="font-medium">{formatEuro(HEIZSYSTEME.waermepumpe.wartung)}</span>
          </div>
          <hr className="border-white/20" />
          <div className="flex justify-between text-white font-bold">
            <span>Betriebskosten/Jahr</span>
            <span>{formatEuro(ergebnis.jahresKostenWP)}</span>
          </div>
        </div>
      </div>
{/* Vergleich mit Gas/Öl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Vergleich: Wärmepumpe vs. Gas vs. Öl</h3>
        
        <div className="space-y-4">
          {/* Wärmepumpe */}
          <div className="p-4 bg-green-50 border-2 border-green-500 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💚</span>
                <span className="font-bold text-green-700">Wärmepumpe</span>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                  Empfohlen
                </span>
              </div>
              <span className="font-bold text-xl text-green-700">{formatEuro(ergebnis.jahresKostenWP)}/Jahr</span>
            </div>
            <div className="text-sm text-green-600">
              {formatKwh(ergebnis.stromverbrauchWP)} Strom • {ergebnis.co2WP} kg CO₂/Jahr
            </div>
          </div>

          {/* Gasheizung */}
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔵</span>
                <span className="font-bold text-blue-700">Gasheizung</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-xl text-blue-700">{formatEuro(ergebnis.jahresKostenGas)}/Jahr</span>
                {ergebnis.ersparnisVsGas > 0 && (
                  <p className="text-sm text-green-600 font-medium">+{formatEuro(ergebnis.ersparnisVsGas)} teurer</p>
                )}
                {ergebnis.ersparnisVsGas < 0 && (
                  <p className="text-sm text-red-600 font-medium">{formatEuro(ergebnis.ersparnisVsGas)} günstiger</p>
                )}
              </div>
            </div>
            <div className="text-sm text-blue-600">
              {formatKwh(ergebnis.gasverbrauch)} Gas • {ergebnis.co2Gas} kg CO₂/Jahr
            </div>
          </div>

          {/* Ölheizung */}
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🟤</span>
                <span className="font-bold text-amber-700">Ölheizung</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-xl text-amber-700">{formatEuro(ergebnis.jahresKostenOel)}/Jahr</span>
                {ergebnis.ersparnisVsOel > 0 && (
                  <p className="text-sm text-green-600 font-medium">+{formatEuro(ergebnis.ersparnisVsOel)} teurer</p>
                )}
                {ergebnis.ersparnisVsOel < 0 && (
                  <p className="text-sm text-red-600 font-medium">{formatEuro(ergebnis.ersparnisVsOel)} günstiger</p>
                )}
              </div>
            </div>
            <div className="text-sm text-amber-600">
              {formatKwh(ergebnis.oelverbrauch)} Öl • {ergebnis.co2Oel} kg CO₂/Jahr
            </div>
          </div>
        </div>

        {/* Jährliche Ersparnis */}
        {(ergebnis.ersparnisVsGas > 0 || ergebnis.ersparnisVsOel > 0) && (
          <div className="mt-4 p-4 bg-green-100 rounded-xl">
            <h4 className="font-medium text-green-800 mb-2">💰 Ihre jährliche Ersparnis mit Wärmepumpe:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">{formatEuro(Math.max(0, ergebnis.ersparnisVsGas))}</p>
                <p className="text-sm text-green-600">vs. Gas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">{formatEuro(Math.max(0, ergebnis.ersparnisVsOel))}</p>
                <p className="text-sm text-green-600">vs. Öl</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Anschaffungskosten & Förderung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🏛️ Anschaffungskosten & BAFA-Förderung</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Kosten {WAERMEPUMPENTYPEN[waermepumpentyp].name}</span>
            <span className="font-medium">{formatEuro(ergebnis.anschaffungBrutto)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>BAFA-Förderung ({ergebnis.foerdersatz}%)</span>
            <span className="font-medium">- {formatEuro(ergebnis.foerderbetrag)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg">
            <span className="text-gray-800">Ihr Eigenanteil</span>
            <span className="text-green-700">{formatEuro(ergebnis.eigenanteil)}</span>
          </div>
        </div>

        {/* Amortisation */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-3xl font-bold text-gray-800">
              {ergebnis.amortisationGas > 30 ? '30+' : ergebnis.amortisationGas}
            </p>
            <p className="text-sm text-gray-500">Jahre Amortisation</p>
            <p className="text-xs text-gray-400">vs. neue Gasheizung</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-3xl font-bold text-gray-800">
              {ergebnis.amortisationOel > 30 ? '30+' : ergebnis.amortisationOel}
            </p>
            <p className="text-sm text-gray-500">Jahre Amortisation</p>
            <p className="text-xs text-gray-400">vs. neue Ölheizung</p>
          </div>
        </div>
      </div>

      {/* 20-Jahres-Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 Gesamtkosten über 20 Jahre</h3>
        <p className="text-sm text-gray-500 mb-4">
          Inkl. Anschaffung, Betriebskosten und Wartung
        </p>
        
        <div className="space-y-4">
          {/* Wärmepumpe */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-700">💚 Wärmepumpe</span>
              <span className="font-bold text-green-700">{formatEuro(ergebnis.gesamtWP20)}</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(ergebnis.gesamtWP20 / Math.max(ergebnis.gesamtWP20, ergebnis.gesamtGas20, ergebnis.gesamtOel20)) * 100}%` }}
              />
            </div>
          </div>

          {/* Gasheizung */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-700">🔵 Gasheizung</span>
              <span className="font-bold text-blue-700">{formatEuro(ergebnis.gesamtGas20)}</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(ergebnis.gesamtGas20 / Math.max(ergebnis.gesamtWP20, ergebnis.gesamtGas20, ergebnis.gesamtOel20)) * 100}%` }}
              />
            </div>
          </div>

          {/* Ölheizung */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-700">🟤 Ölheizung</span>
              <span className="font-bold text-amber-700">{formatEuro(ergebnis.gesamtOel20)}</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(ergebnis.gesamtOel20 / Math.max(ergebnis.gesamtWP20, ergebnis.gesamtGas20, ergebnis.gesamtOel20)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Ersparnis über 20 Jahre */}
        {(ergebnis.ersparnis20VsGas > 0 || ergebnis.ersparnis20VsOel > 0) && (
          <div className="mt-6 p-4 bg-green-100 rounded-xl">
            <h4 className="font-medium text-green-800 mb-2">💰 Ihre Ersparnis über 20 Jahre:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">{formatEuro(Math.max(0, ergebnis.ersparnis20VsGas))}</p>
                <p className="text-sm text-green-600">vs. Gasheizung</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">{formatEuro(Math.max(0, ergebnis.ersparnis20VsOel))}</p>
                <p className="text-sm text-green-600">vs. Ölheizung</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CO2-Ersparnis */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🌍 CO₂-Bilanz</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <span className="text-2xl">💚</span>
            <p className="text-2xl font-bold text-green-700">{ergebnis.co2WP}</p>
            <p className="text-xs text-green-600">kg CO₂/Jahr</p>
            <p className="text-xs text-gray-500">Wärmepumpe</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <span className="text-2xl">🔵</span>
            <p className="text-2xl font-bold text-blue-700">{ergebnis.co2Gas}</p>
            <p className="text-xs text-blue-600">kg CO₂/Jahr</p>
            <p className="text-xs text-gray-500">Gas</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-xl">
            <span className="text-2xl">🟤</span>
            <p className="text-2xl font-bold text-amber-700">{ergebnis.co2Oel}</p>
            <p className="text-xs text-amber-600">kg CO₂/Jahr</p>
            <p className="text-xs text-gray-500">Öl</p>
          </div>
        </div>

        {ergebnis.co2ErsparnisMittel > 0 && (
          <div className="p-4 bg-green-100 rounded-xl text-center">
            <p className="text-sm text-green-600">Mit der Wärmepumpe sparen Sie jährlich ca.</p>
            <p className="text-3xl font-bold text-green-700">{ergebnis.co2ErsparnisMittel} kg CO₂</p>
            <p className="text-sm text-green-600">
              Das entspricht {Math.round(ergebnis.co2ErsparnisMittel / 140)} Autofahrten München-Hamburg 🚗
            </p>
          </div>
        )}
      </div>

      {/* Info-Box */}
      <div className="bg-amber-50 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-amber-900 mb-2">ℹ️ Gut zu wissen</h3>
        <ul className="text-sm text-amber-800 space-y-2">
          <li>
            <strong>BAFA-Förderung 2026:</strong> Die Grundförderung beträgt 30%, mit Boni bis zu 70%. 
            Förderfähig sind maximal 30.000 € für das erste Wohngebäude.
          </li>
          <li>
            <strong>Klimageschwindigkeitsbonus:</strong> +20% wenn Sie eine alte Heizung (≥20 Jahre) 
            oder fossile Heizung (Öl, Gas, Kohle) ersetzen. Gilt bis Ende 2028.
          </li>
          <li>
            <strong>JAZ/COP:</strong> Die Jahresarbeitszahl gibt an, wie effizient die Wärmepumpe arbeitet.
            Bei JAZ 3,5 werden aus 1 kWh Strom 3,5 kWh Wärme – daher die niedrigen Betriebskosten.
          </li>
          <li>
            <strong>CO₂-Steuer:</strong> Der CO₂-Preis steigt 2026 auf 55 €/t und verteuert Gas/Öl weiter.
            Wärmepumpen sind davon nicht betroffen.
          </li>
          <li>
            <strong>Wärmepumpentarif:</strong> Viele Energieversorger bieten günstigere Stromtarife 
            für Wärmepumpen (ca. 25-35 ct/kWh statt 35-42 ct/kWh Haushaltsstrom).
          </li>
        </ul>
</div>
    </div>
  );
}
