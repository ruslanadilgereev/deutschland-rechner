import { useState, useMemo } from 'react';

// Globalstrahlung in kWh/m² pro Jahr nach Region (Durchschnittswerte Deutschland)
const GLOBALSTRAHLUNG_REGIONEN: Record<string, { name: string; strahlung: number }> = {
  'nord': { name: 'Norddeutschland', strahlung: 950 },
  'nordwest': { name: 'Nordwesten', strahlung: 980 },
  'nordost': { name: 'Nordosten', strahlung: 1000 },
  'mitte': { name: 'Mitteldeutschland', strahlung: 1020 },
  'west': { name: 'Westen (NRW)', strahlung: 1000 },
  'ost': { name: 'Osten (Sachsen)', strahlung: 1050 },
  'suedwest': { name: 'Südwesten (BaWü)', strahlung: 1100 },
  'suedost': { name: 'Südosten (Bayern)', strahlung: 1150 },
  'sued': { name: 'Süddeutschland', strahlung: 1120 },
};

// Korrekturfaktoren für Dachausrichtung (0° = Süd, 90° = West/Ost, 180° = Nord)
const AUSRICHTUNG_FAKTOREN: Record<string, { name: string; faktor: number; grad: number }> = {
  'sued': { name: 'Süd (optimal)', faktor: 1.00, grad: 0 },
  'suedwest': { name: 'Südwest', faktor: 0.95, grad: -45 },
  'suedost': { name: 'Südost', faktor: 0.95, grad: 45 },
  'west': { name: 'West', faktor: 0.85, grad: -90 },
  'ost': { name: 'Ost', faktor: 0.85, grad: 90 },
  'nordwest': { name: 'Nordwest', faktor: 0.65, grad: -135 },
  'nordost': { name: 'Nordost', faktor: 0.65, grad: 135 },
  'nord': { name: 'Nord', faktor: 0.55, grad: 180 },
  'flach': { name: 'Flachdach (10°)', faktor: 0.90, grad: 0 },
};

// Korrekturfaktoren für Dachneigung (optimal: 30-35°)
const NEIGUNG_FAKTOREN: Record<string, { name: string; faktor: number; grad: number }> = {
  '0': { name: 'Flach (0-10°)', faktor: 0.88, grad: 5 },
  '15': { name: 'Leicht (15°)', faktor: 0.95, grad: 15 },
  '30': { name: 'Optimal (30°)', faktor: 1.00, grad: 30 },
  '35': { name: 'Optimal (35°)', faktor: 1.00, grad: 35 },
  '45': { name: 'Steil (45°)', faktor: 0.96, grad: 45 },
  '60': { name: 'Sehr steil (60°)', faktor: 0.86, grad: 60 },
  '90': { name: 'Fassade (90°)', faktor: 0.70, grad: 90 },
};

// Einspeisevergütung 2025 (nach EEG) in ct/kWh
const EINSPEISEVERGUETUNG = {
  bis10kWp: 8.03, // ct/kWh für Anlagen ≤10 kWp (Teileinspeisung)
  bis40kWp: 6.95, // ct/kWh für Anlagenteile >10 bis 40 kWp
  volleinspeisung10kWp: 12.73, // Volleinspeisung ≤10 kWp
  volleinspeisung40kWp: 10.68, // Volleinspeisung >10-40 kWp
};

// Durchschnittliche Systemkosten 2025
const SYSTEM_KOSTEN = {
  kleineAnlage: 1400, // €/kWp für <6 kWp
  mittlereAnlage: 1200, // €/kWp für 6-10 kWp
  grosseAnlage: 1100, // €/kWp für >10 kWp
  speicherProKWh: 800, // €/kWh Batteriespeicher
};

// Performance Ratio (Systemwirkungsgrad)
const PERFORMANCE_RATIO = 0.85; // 85% typisch für gute Anlagen

// Degradation (Leistungsabnahme pro Jahr)
const DEGRADATION_PRO_JAHR = 0.005; // 0,5% pro Jahr

export default function PhotovoltaikRechner() {
  // Eingabewerte
  const [anlagengroesse, setAnlagengroesse] = useState(10); // kWp
  const [region, setRegion] = useState('suedwest');
  const [ausrichtung, setAusrichtung] = useState('sued');
  const [neigung, setNeigung] = useState('30');
  const [strompreis, setStrompreis] = useState(32); // ct/kWh
  const [stromverbrauch, setStromverbrauch] = useState(4000); // kWh/Jahr
  const [eigenverbrauchsanteil, setEigenverbrauchsanteil] = useState(30); // %
  const [mitSpeicher, setMitSpeicher] = useState(false);
  const [speichergroesse, setSpeichergroesse] = useState(8); // kWh
  const [einspeisemodell, setEinspeisemodell] = useState<'teileinspeisung' | 'volleinspeisung'>('teileinspeisung');
  const [investitionskosten, setInvestitionskosten] = useState<number | null>(null); // null = automatisch berechnen

  const ergebnis = useMemo(() => {
    // === 1. Jährlicher Ertrag berechnen ===
    const basisStrahlung = GLOBALSTRAHLUNG_REGIONEN[region].strahlung;
    const ausrichtungsFaktor = AUSRICHTUNG_FAKTOREN[ausrichtung].faktor;
    const neigungsFaktor = NEIGUNG_FAKTOREN[neigung].faktor;
    
    // Spezifischer Ertrag in kWh/kWp
    const spezifischerErtrag = basisStrahlung * ausrichtungsFaktor * neigungsFaktor * PERFORMANCE_RATIO;
    
    // Gesamtertrag im ersten Jahr
    const jahresertragJahr1 = anlagengroesse * spezifischerErtrag;
    
    // === 2. Eigenverbrauch berechnen ===
    // Mit Speicher erhöht sich der Eigenverbrauchsanteil
    let effektiverEigenverbrauch = eigenverbrauchsanteil / 100;
    if (mitSpeicher) {
      // Speicher erhöht Eigenverbrauch um ca. 20-30% des Speichers/Verbrauch
      const speicherBonus = Math.min(0.35, (speichergroesse / stromverbrauch) * 2);
      effektiverEigenverbrauch = Math.min(0.85, effektiverEigenverbrauch + speicherBonus);
    }
    
    // Eigenverbrauchte Menge (begrenzt durch Stromverbrauch)
    const maxEigenverbrauchMenge = stromverbrauch;
    const eigenverbrauchMenge = Math.min(jahresertragJahr1 * effektiverEigenverbrauch, maxEigenverbrauchMenge);
    
    // Eingespeiste Menge
    const einspeiseMenge = einspeisemodell === 'volleinspeisung' 
      ? jahresertragJahr1 
      : jahresertragJahr1 - eigenverbrauchMenge;
    
    // === 3. Einspeisevergütung berechnen ===
    let verguetungProKwh: number;
    if (einspeisemodell === 'volleinspeisung') {
      if (anlagengroesse <= 10) {
        verguetungProKwh = EINSPEISEVERGUETUNG.volleinspeisung10kWp;
      } else {
        // Anteilig berechnen
        const anteil10 = 10 / anlagengroesse;
        const anteilRest = (anlagengroesse - 10) / anlagengroesse;
        verguetungProKwh = anteil10 * EINSPEISEVERGUETUNG.volleinspeisung10kWp + 
                          anteilRest * EINSPEISEVERGUETUNG.volleinspeisung40kWp;
      }
    } else {
      if (anlagengroesse <= 10) {
        verguetungProKwh = EINSPEISEVERGUETUNG.bis10kWp;
      } else {
        const anteil10 = 10 / anlagengroesse;
        const anteilRest = (anlagengroesse - 10) / anlagengroesse;
        verguetungProKwh = anteil10 * EINSPEISEVERGUETUNG.bis10kWp + 
                          anteilRest * EINSPEISEVERGUETUNG.bis40kWp;
      }
    }
    
    // === 4. Jährliche Einnahmen/Ersparnisse ===
    // Ersparnis durch Eigenverbrauch
    const ersparnisEigenverbrauch = einspeisemodell === 'volleinspeisung' 
      ? 0 
      : eigenverbrauchMenge * (strompreis / 100);
    
    // Einnahmen durch Einspeisung
    const einnahmenEinspeisung = einspeiseMenge * (verguetungProKwh / 100);
    
    // Gesamte jährliche Einnahmen/Ersparnisse Jahr 1
    const jaehrlicheEinnahmenJahr1 = ersparnisEigenverbrauch + einnahmenEinspeisung;
    
    // === 5. Investitionskosten ===
    let systemKosten: number;
    if (investitionskosten !== null) {
      systemKosten = investitionskosten;
    } else {
      // Automatisch berechnen
      let kostenProKwp: number;
      if (anlagengroesse < 6) {
        kostenProKwp = SYSTEM_KOSTEN.kleineAnlage;
      } else if (anlagengroesse <= 10) {
        kostenProKwp = SYSTEM_KOSTEN.mittlereAnlage;
      } else {
        kostenProKwp = SYSTEM_KOSTEN.grosseAnlage;
      }
      systemKosten = anlagengroesse * kostenProKwp;
      
      if (mitSpeicher) {
        systemKosten += speichergroesse * SYSTEM_KOSTEN.speicherProKWh;
      }
    }
    
    // === 6. Amortisation & Rendite über 20 Jahre ===
    let kumulierteEinnahmen = 0;
    let amortisationJahr: number | null = null;
    const jahresdetails: Array<{
      jahr: number;
      ertrag: number;
      einnahmen: number;
      kumuliert: number;
    }> = [];
    
    for (let jahr = 1; jahr <= 25; jahr++) {
      // Degradation berücksichtigen
      const degradationsFaktor = Math.pow(1 - DEGRADATION_PRO_JAHR, jahr - 1);
      const jahresertrag = jahresertragJahr1 * degradationsFaktor;
      
      // Strompreis-Steigerung (3% pro Jahr angenommen)
      const strompreisJahr = strompreis * Math.pow(1.03, jahr - 1);
      
      let einnahmenJahr: number;
      if (einspeisemodell === 'volleinspeisung') {
        einnahmenJahr = jahresertrag * (verguetungProKwh / 100);
      } else {
        const evMenge = Math.min(jahresertrag * effektiverEigenverbrauch, maxEigenverbrauchMenge);
        const einspMenge = jahresertrag - evMenge;
        einnahmenJahr = evMenge * (strompreisJahr / 100) + einspMenge * (verguetungProKwh / 100);
      }
      
      kumulierteEinnahmen += einnahmenJahr;
      
      if (amortisationJahr === null && kumulierteEinnahmen >= systemKosten) {
        // Genauere Berechnung: interpolieren
        const vormonatKumuliert = kumulierteEinnahmen - einnahmenJahr;
        const restBetrag = systemKosten - vormonatKumuliert;
        const monatlicheEinnahmen = einnahmenJahr / 12;
        const zusatzMonate = restBetrag / monatlicheEinnahmen;
        amortisationJahr = jahr - 1 + zusatzMonate / 12;
      }
      
      if (jahr <= 20) {
        jahresdetails.push({
          jahr,
          ertrag: jahresertrag,
          einnahmen: einnahmenJahr,
          kumuliert: kumulierteEinnahmen,
        });
      }
    }
    
    // Gesamteinnahmen über 20 Jahre
    const gesamtEinnahmen20Jahre = jahresdetails.reduce((sum, j) => sum + j.einnahmen, 0);
    
    // Rendite (einfache jährliche Rendite)
    const rendite = ((gesamtEinnahmen20Jahre - systemKosten) / systemKosten / 20) * 100;
    
    // CO2-Einsparung (ca. 400g CO2/kWh Strommix Deutschland)
    const co2EinsparungProJahr = jahresertragJahr1 * 0.4; // kg CO2
    const co2Einsparung20Jahre = jahresdetails.reduce((sum, j) => sum + j.ertrag * 0.4, 0);
    
    // Autarkiegrad
    const autarkiegrad = einspeisemodell === 'volleinspeisung'
      ? 0
      : (eigenverbrauchMenge / stromverbrauch) * 100;
    
    return {
      // Ertrag
      spezifischerErtrag,
      jahresertragJahr1,
      
      // Eigenverbrauch
      effektiverEigenverbrauch: effektiverEigenverbrauch * 100,
      eigenverbrauchMenge,
      einspeiseMenge,
      autarkiegrad,
      
      // Vergütung
      verguetungProKwh,
      
      // Einnahmen Jahr 1
      ersparnisEigenverbrauch,
      einnahmenEinspeisung,
      jaehrlicheEinnahmenJahr1,
      
      // Investition
      systemKosten,
      
      // 20-Jahres-Berechnung
      amortisationJahr,
      gesamtEinnahmen20Jahre,
      gewinn20Jahre: gesamtEinnahmen20Jahre - systemKosten,
      rendite,
      jahresdetails,
      
      // Umwelt
      co2EinsparungProJahr,
      co2Einsparung20Jahre,
    };
  }, [anlagengroesse, region, ausrichtung, neigung, strompreis, stromverbrauch, 
      eigenverbrauchsanteil, mitSpeicher, speichergroesse, einspeisemodell, investitionskosten]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuroDecimal = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatKwh = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' kWh';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
  const formatJahre = (n: number | null) => n !== null 
    ? n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Jahre'
    : '> 25 Jahre';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Anlagengröße */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anlagengröße (kWp)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Typisch: 5-15 kWp für Einfamilienhäuser
            </span>
          </label>
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={() => setAnlagengroesse(Math.max(1, anlagengroesse - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center min-w-[100px]">
              <span className="text-4xl font-bold text-gray-800">{anlagengroesse}</span>
              <span className="text-gray-500 ml-2">kWp</span>
            </div>
            <button
              onClick={() => setAnlagengroesse(Math.min(30, anlagengroesse + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
          <input
            type="range"
            value={anlagengroesse}
            onChange={(e) => setAnlagengroesse(Number(e.target.value))}
            className="w-full accent-amber-500"
            min="1"
            max="30"
            step="0.5"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 kWp</span>
            <span>15 kWp</span>
            <span>30 kWp</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            ≈ {Math.round(anlagengroesse * 5)} m² Dachfläche benötigt (bei modernen Modulen)
          </p>
        </div>

        {/* Region */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Standort / Region</span>
            <span className="text-xs text-gray-500 block mt-1">
              Sonneneinstrahlung variiert je nach Standort
            </span>
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none text-gray-700"
          >
            {Object.entries(GLOBALSTRAHLUNG_REGIONEN).map(([key, { name, strahlung }]) => (
              <option key={key} value={key}>
                {name} ({strahlung} kWh/m²)
              </option>
            ))}
          </select>
        </div>

        {/* Ausrichtung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Dachausrichtung</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(AUSRICHTUNG_FAKTOREN).map(([key, { name, faktor }]) => (
              <button
                key={key}
                onClick={() => setAusrichtung(key)}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  ausrichtung === key
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {name}
                <span className="block text-xs opacity-70">{Math.round(faktor * 100)}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dachneigung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Dachneigung</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(NEIGUNG_FAKTOREN).map(([key, { name, faktor }]) => (
              <button
                key={key}
                onClick={() => setNeigung(key)}
                className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                  neigung === key
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Stromverbrauch */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jährlicher Stromverbrauch</span>
            <span className="text-xs text-gray-500 block mt-1">
              Typisch: 3.000-5.000 kWh für 2-4 Personen
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={stromverbrauch}
              onChange={(e) => setStromverbrauch(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
              min="0"
              max="30000"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kWh/Jahr</span>
          </div>
          <input
            type="range"
            value={stromverbrauch}
            onChange={(e) => setStromverbrauch(Number(e.target.value))}
            className="w-full mt-3 accent-amber-500"
            min="1000"
            max="15000"
            step="100"
          />
        </div>

        {/* Strompreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Aktueller Strompreis</span>
            <span className="text-xs text-gray-500 block mt-1">
              Durchschnitt 2025: ca. 30-35 ct/kWh
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={strompreis}
              onChange={(e) => setStrompreis(Math.max(0, Number(e.target.value)))}
              className="w-32 text-xl font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
              min="15"
              max="60"
              step="0.5"
            />
            <span className="text-gray-500">ct/kWh</span>
            <input
              type="range"
              value={strompreis}
              onChange={(e) => setStrompreis(Number(e.target.value))}
              className="flex-1 accent-amber-500"
              min="20"
              max="50"
              step="0.5"
            />
          </div>
        </div>

        {/* Einspeisemodell */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Einspeisemodell</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setEinspeisemodell('teileinspeisung')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                einspeisemodell === 'teileinspeisung'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="block">Eigenverbrauch</span>
              <span className="text-xs opacity-80">+ Überschuss einspeisen</span>
            </button>
            <button
              onClick={() => setEinspeisemodell('volleinspeisung')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                einspeisemodell === 'volleinspeisung'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="block">Volleinspeisung</span>
              <span className="text-xs opacity-80">Alles ins Netz</span>
            </button>
          </div>
        </div>

        {/* Eigenverbrauchsanteil (nur bei Teileinspeisung) */}
        {einspeisemodell === 'teileinspeisung' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Eigenverbrauchsanteil (ohne Speicher)</span>
              <span className="text-xs text-gray-500 block mt-1">
                Typisch: 20-35% ohne Speicher, je nach Verbrauchsmuster
              </span>
            </label>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-800">{eigenverbrauchsanteil}%</span>
              <input
                type="range"
                value={eigenverbrauchsanteil}
                onChange={(e) => setEigenverbrauchsanteil(Number(e.target.value))}
                className="flex-1 accent-amber-500"
                min="10"
                max="50"
                step="5"
              />
            </div>
          </div>
        )}

        {/* Batteriespeicher */}
        {einspeisemodell === 'teileinspeisung' && (
          <div className="mb-6">
            <label className="block mb-3">
              <span className="text-gray-700 font-medium">Batteriespeicher</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => setMitSpeicher(false)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  !mitSpeicher
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ohne Speicher
              </button>
              <button
                onClick={() => setMitSpeicher(true)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  mitSpeicher
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Mit Speicher 🔋
              </button>
            </div>
            
            {mitSpeicher && (
              <div className="p-4 bg-amber-50 rounded-xl">
                <label className="block mb-2 text-sm text-amber-800 font-medium">
                  Speicherkapazität (kWh)
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSpeichergroesse(Math.max(2, speichergroesse - 1))}
                    className="w-10 h-10 rounded-xl bg-white hover:bg-amber-100 text-lg font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-amber-800 w-16 text-center">{speichergroesse} kWh</span>
                  <button
                    onClick={() => setSpeichergroesse(Math.min(20, speichergroesse + 1))}
                    className="w-10 h-10 rounded-xl bg-white hover:bg-amber-100 text-lg font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  Empfehlung: ca. 1 kWh pro kWp Anlagenleistung
                </p>
              </div>
            )}
          </div>
        )}

        {/* Investitionskosten (optional manuell) */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Investitionskosten (optional)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Leer lassen für automatische Schätzung
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={investitionskosten ?? ''}
              onChange={(e) => setInvestitionskosten(e.target.value ? Number(e.target.value) : null)}
              placeholder={`ca. ${formatEuro(ergebnis.systemKosten)}`}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
              min="0"
              max="100000"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">☀️ Ihre Photovoltaik-Anlage</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatKwh(ergebnis.jahresertragJahr1)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          <p className="text-amber-100 mt-1 text-sm">
            Erwarteter Jahresertrag ({Math.round(ergebnis.spezifischerErtrag)} kWh/kWp)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Jährliche Einnahmen</span>
            <div className="text-2xl font-bold">{formatEuro(ergebnis.jaehrlicheEinnahmenJahr1)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Amortisation</span>
            <div className="text-2xl font-bold">{formatJahre(ergebnis.amortisationJahr)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Investition</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.systemKosten)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gewinn (20 Jahre)</span>
            <div className="text-xl font-bold text-green-200">+{formatEuro(ergebnis.gewinn20Jahre)}</div>
          </div>
        </div>
      </div>

      {/* Ertragsprognose */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Ertragsübersicht Jahr 1</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Globalstrahlung ({GLOBALSTRAHLUNG_REGIONEN[region].name})</span>
            <span className="text-gray-900">{GLOBALSTRAHLUNG_REGIONEN[region].strahlung} kWh/m²</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Ausrichtungsfaktor ({AUSRICHTUNG_FAKTOREN[ausrichtung].name})</span>
            <span className="text-gray-900">{formatProzent(AUSRICHTUNG_FAKTOREN[ausrichtung].faktor * 100)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Neigungsfaktor ({NEIGUNG_FAKTOREN[neigung].name})</span>
            <span className="text-gray-900">{formatProzent(NEIGUNG_FAKTOREN[neigung].faktor * 100)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Performance Ratio (Systemeffizienz)</span>
            <span className="text-gray-900">{formatProzent(PERFORMANCE_RATIO * 100)}</span>
          </div>
          <div className="flex justify-between py-2 bg-amber-50 -mx-6 px-6">
            <span className="font-medium text-amber-800">= Spezifischer Ertrag</span>
            <span className="font-bold text-amber-900">{Math.round(ergebnis.spezifischerErtrag)} kWh/kWp</span>
          </div>
          <div className="flex justify-between py-3 bg-amber-100 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-amber-800">Jahresertrag ({anlagengroesse} kWp)</span>
            <span className="font-bold text-2xl text-amber-900">{formatKwh(ergebnis.jahresertragJahr1)}</span>
          </div>
        </div>
      </div>

      {/* Wirtschaftlichkeit */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💰 Wirtschaftlichkeit Jahr 1</h3>
        
        <div className="space-y-3 text-sm">
          {einspeisemodell === 'teileinspeisung' && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                Eigenverbrauch
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Eigenverbrauchsanteil {mitSpeicher && '(mit Speicher)'}
                </span>
                <span className="text-gray-900">{formatProzent(ergebnis.effektiverEigenverbrauch)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Selbst verbraucht</span>
                <span className="text-gray-900">{formatKwh(ergebnis.eigenverbrauchMenge)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Autarkiegrad (vom Verbrauch gedeckt)</span>
                <span className="font-medium text-green-600">{formatProzent(ergebnis.autarkiegrad)}</span>
              </div>
              <div className="flex justify-between py-2 bg-green-50 -mx-6 px-6">
                <span className="font-medium text-green-700">
                  = Ersparnis Eigenverbrauch ({strompreis} ct/kWh)
                </span>
                <span className="font-bold text-green-900">{formatEuroDecimal(ergebnis.ersparnisEigenverbrauch)}</span>
              </div>
            </>
          )}
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Einspeisung
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Eingespeiste Menge</span>
            <span className="text-gray-900">{formatKwh(ergebnis.einspeiseMenge)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Einspeisevergütung ({einspeisemodell === 'volleinspeisung' ? 'Volleinspeisung' : 'Teileinspeisung'})
            </span>
            <span className="text-gray-900">{ergebnis.verguetungProKwh.toFixed(2)} ct/kWh</span>
          </div>
          <div className="flex justify-between py-2 bg-blue-50 -mx-6 px-6">
            <span className="font-medium text-blue-700">= Einnahmen Einspeisung</span>
            <span className="font-bold text-blue-900">{formatEuroDecimal(ergebnis.einnahmenEinspeisung)}</span>
          </div>
          
          <div className="flex justify-between py-3 bg-amber-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-amber-800">Jährlicher Gesamtnutzen</span>
            <span className="font-bold text-2xl text-amber-900">{formatEuro(ergebnis.jaehrlicheEinnahmenJahr1)}</span>
          </div>
        </div>
      </div>

      {/* 20-Jahres-Prognose */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 20-Jahres-Prognose</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <span className="text-sm text-gray-500">Investition</span>
            <div className="text-xl font-bold text-gray-800">{formatEuro(ergebnis.systemKosten)}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <span className="text-sm text-green-600">Gesamteinnahmen</span>
            <div className="text-xl font-bold text-green-700">{formatEuro(ergebnis.gesamtEinnahmen20Jahre)}</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <span className="text-sm text-amber-600">Amortisation nach</span>
            <div className="text-xl font-bold text-amber-700">{formatJahre(ergebnis.amortisationJahr)}</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <span className="text-sm text-emerald-600">Nettogewinn</span>
            <div className="text-xl font-bold text-emerald-700">+{formatEuro(ergebnis.gewinn20Jahre)}</div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <span className="text-sm text-blue-600">Durchschnittliche jährliche Rendite</span>
          <div className="text-2xl font-bold text-blue-700">{formatProzent(ergebnis.rendite)}</div>
        </div>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          Annahmen: 0,5% Degradation/Jahr, 3% Strompreissteigerung/Jahr, konstante Einspeisevergütung
        </p>
      </div>

      {/* Umwelt */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-green-800 mb-3">🌱 Umweltbilanz</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <span className="text-sm text-green-600">CO₂-Einsparung pro Jahr</span>
            <div className="text-2xl font-bold text-green-700">{(ergebnis.co2EinsparungProJahr / 1000).toFixed(1)} t</div>
          </div>
          <div className="text-center">
            <span className="text-sm text-green-600">CO₂-Einsparung 20 Jahre</span>
            <div className="text-2xl font-bold text-green-700">{(ergebnis.co2Einsparung20Jahre / 1000).toFixed(1)} t</div>
          </div>
        </div>
        <p className="text-xs text-green-700 mt-3 text-center">
          Basis: 400g CO₂/kWh (deutscher Strommix 2024)
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>☀️</span>
            <span><strong>Ertrag:</strong> Abhängig von Standort (800-1.200 kWh/m²), Ausrichtung und Neigung</span>
          </li>
          <li className="flex gap-2">
            <span>💡</span>
            <span><strong>Eigenverbrauch:</strong> Je mehr selbst verbraucht, desto höher die Rendite (Strompreis {'>'} Einspeisevergütung)</span>
          </li>
          <li className="flex gap-2">
            <span>🔋</span>
            <span><strong>Speicher:</strong> Erhöht Eigenverbrauch um 20-35%, aber längere Amortisation</span>
          </li>
          <li className="flex gap-2">
            <span>📊</span>
            <span><strong>Einspeisevergütung 2025:</strong> {EINSPEISEVERGUETUNG.bis10kWp} ct/kWh (≤10 kWp, Teileinspeisung)</span>
          </li>
          <li className="flex gap-2">
            <span>🏠</span>
            <span><strong>Volleinspeisung:</strong> Höhere Vergütung ({EINSPEISEVERGUETUNG.volleinspeisung10kWp} ct/kWh), aber kein Eigenverbrauchsvorteil</span>
          </li>
          <li className="flex gap-2">
            <span>📉</span>
            <span><strong>Degradation:</strong> Module verlieren ca. 0,5% Leistung pro Jahr</span>
          </li>
        </ul>
      </div>

      {/* Einspeisevergütung Details */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚡ Einspeisevergütung 2025 (EEG)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-amber-700">
                <th className="py-2">Anlagengröße</th>
                <th className="py-2 text-right">Teileinspeisung</th>
                <th className="py-2 text-right">Volleinspeisung</th>
              </tr>
            </thead>
            <tbody className="text-amber-800">
              <tr className="border-t border-amber-200">
                <td className="py-2">bis 10 kWp</td>
                <td className="py-2 text-right font-medium">{EINSPEISEVERGUETUNG.bis10kWp} ct/kWh</td>
                <td className="py-2 text-right font-medium">{EINSPEISEVERGUETUNG.volleinspeisung10kWp} ct/kWh</td>
              </tr>
              <tr className="border-t border-amber-200">
                <td className="py-2">{'>'} 10 bis 40 kWp</td>
                <td className="py-2 text-right font-medium">{EINSPEISEVERGUETUNG.bis40kWp} ct/kWh</td>
                <td className="py-2 text-right font-medium">{EINSPEISEVERGUETUNG.volleinspeisung40kWp} ct/kWh</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-amber-700 mt-3">
          Die Vergütung wird für 20 Jahre ab Inbetriebnahme festgeschrieben. Degression: -1% pro Halbjahr.
        </p>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Verschattung:</strong> Bäume, Schornsteine oder Nachbargebäude können den Ertrag erheblich reduzieren</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Netzbetreiber:</strong> Anmeldung bei Netzbetreiber und im Marktstammdatenregister erforderlich</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Förderungen:</strong> KfW-Kredite und regionale Förderprogramme prüfen (z.B. für Speicher)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Steuern:</strong> Seit 2023 sind PV-Anlagen bis 30 kWp von Einkommensteuer befreit (§ 3 Nr. 72 EStG)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Angebote vergleichen:</strong> Holen Sie mindestens 3 Angebote von verschiedenen Installateuren ein</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Wichtige Anlaufstellen</h3>
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="font-semibold text-amber-900">Marktstammdatenregister</p>
            <p className="text-sm text-amber-700 mt-1">
              Jede PV-Anlage muss hier registriert werden – Pflicht!
            </p>
            <a 
              href="https://www.marktstammdatenregister.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              marktstammdatenregister.de →
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🏦</span>
              <div>
                <p className="font-medium text-gray-800">KfW-Förderung</p>
                <a 
                  href="https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestandsimmobilie/Förderprodukte/Erneuerbare-Energien-Standard-(270)/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs"
                >
                  KfW 270 – Erneuerbare Energien →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Energieberatung</p>
                <a 
                  href="https://www.verbraucherzentrale-energieberatung.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs"
                >
                  Verbraucherzentrale Energieberatung →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">⚡</span>
              <div>
                <p className="font-medium text-gray-800">Netzbetreiber</p>
                <p className="text-xs text-gray-600">Ihren lokalen Netzbetreiber kontaktieren</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Solarkataster</p>
                <p className="text-xs text-gray-600">Viele Bundesländer bieten Online-Solarkataster</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/eeg_2014/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            EEG 2023 – Erneuerbare-Energien-Gesetz
          </a>
          <a 
            href="https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/ErneuerbareEnergien/start.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesnetzagentur – Erneuerbare Energien
          </a>
          <a 
            href="https://www.solarwirtschaft.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesverband Solarwirtschaft (BSW)
          </a>
          <a 
            href="https://re.jrc.ec.europa.eu/pvg_tools/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            EU PVGIS – Photovoltaic Geographical Information System
          </a>
          <a 
            href="https://www.verbraucherzentrale.de/wissen/energie/erneuerbare-energien/photovoltaik-was-bei-der-planung-einer-solaranlage-wichtig-ist-5574"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Photovoltaik Planung
          </a>
        </div>
      </div>
    </div>
  );
}
