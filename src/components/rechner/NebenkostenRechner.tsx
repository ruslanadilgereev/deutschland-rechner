import { useState, useMemo } from 'react';

/**
 * Nebenkosten-Rechner 2026
 * 
 * Berechnung der voraussichtlichen Miet-Nebenkosten (Betriebskosten)
 * basierend auf der Betriebskostenverordnung (BetrKV) §2
 * 
 * Datenquellen:
 * - Betriebskostenverordnung (BetrKV) §2: Umlagefähige Betriebskosten
 * - Deutscher Mieterbund: Betriebskostenspiegel 2024 (aktuellste Daten)
 * - Heizspiegelkampagne: Heizkosten nach Energieträger
 * 
 * Quellen:
 * - https://www.gesetze-im-internet.de/betrkv/
 * - https://www.mieterbund.de
 * - https://www.heizspiegel.de
 */

// ============================================================================
// BETRIEBSKOSTENSPIEGEL - DURCHSCHNITTSWERTE PRO M² UND MONAT
// ============================================================================
// Basierend auf Betriebskostenspiegel 2024 (Daten aus 2022/2023)
// Durchschnittliche Kosten für Deutschland

interface Kostenkategorie {
  id: string;
  name: string;
  beschreibung: string;
  durchschnitt: number;      // €/m²/Monat (Bundesdurchschnitt)
  minimum: number;           // untere Grenze
  maximum: number;           // obere Grenze
  betrKVNr: string;          // Referenz zu BetrKV §2 Nr.
  verbrauchsabhaengig: boolean; // Abhängig von Personenzahl/Verbrauch
  heizungsabhaengig?: boolean;  // Abhängig von Heizungsart
  wohnungsSpezifisch?: boolean; // Nicht in allen Wohnungen vorhanden
}

const BETRIEBSKOSTEN_KATEGORIEN: Kostenkategorie[] = [
  {
    id: 'grundsteuer',
    name: 'Grundsteuer',
    beschreibung: 'Kommunale Grundsteuer B auf das Grundstück',
    durchschnitt: 0.21,
    minimum: 0.10,
    maximum: 0.40,
    betrKVNr: '1',
    verbrauchsabhaengig: false,
  },
  {
    id: 'wasserversorgung',
    name: 'Wasserversorgung',
    beschreibung: 'Kaltwasser inkl. Grundgebühren, Wasserzähler, Eichkosten',
    durchschnitt: 0.26,
    minimum: 0.15,
    maximum: 0.45,
    betrKVNr: '2',
    verbrauchsabhaengig: true,
  },
  {
    id: 'abwasser',
    name: 'Entwässerung',
    beschreibung: 'Abwasser, Kanalgebühren, Niederschlagswasser',
    durchschnitt: 0.24,
    minimum: 0.12,
    maximum: 0.40,
    betrKVNr: '3',
    verbrauchsabhaengig: true,
  },
  {
    id: 'heizung',
    name: 'Heizung',
    beschreibung: 'Zentrale Heizungsanlage inkl. Brennstoff, Wartung, Abrechnung',
    durchschnitt: 1.10,
    minimum: 0.60,
    maximum: 1.80,
    betrKVNr: '4',
    verbrauchsabhaengig: true,
    heizungsabhaengig: true,
  },
  {
    id: 'warmwasser',
    name: 'Warmwasser',
    beschreibung: 'Zentrale Warmwasserbereitung',
    durchschnitt: 0.30,
    minimum: 0.15,
    maximum: 0.50,
    betrKVNr: '5',
    verbrauchsabhaengig: true,
    heizungsabhaengig: true,
  },
  {
    id: 'aufzug',
    name: 'Aufzug',
    beschreibung: 'Betrieb, Wartung, Prüfung des Personenaufzugs',
    durchschnitt: 0.18,
    minimum: 0.08,
    maximum: 0.35,
    betrKVNr: '7',
    verbrauchsabhaengig: false,
    wohnungsSpezifisch: true,
  },
  {
    id: 'strassenreinigung',
    name: 'Straßenreinigung',
    beschreibung: 'Öffentliche und private Straßenreinigung',
    durchschnitt: 0.06,
    minimum: 0.02,
    maximum: 0.15,
    betrKVNr: '8a',
    verbrauchsabhaengig: false,
  },
  {
    id: 'muellabfuhr',
    name: 'Müllabfuhr',
    beschreibung: 'Müllbeseitigung, Bioabfall, Sperrmüll',
    durchschnitt: 0.22,
    minimum: 0.12,
    maximum: 0.40,
    betrKVNr: '8b',
    verbrauchsabhaengig: true,
  },
  {
    id: 'gebaeudereinigung',
    name: 'Gebäudereinigung',
    beschreibung: 'Reinigung Treppenhaus, Flure, Keller',
    durchschnitt: 0.19,
    minimum: 0.08,
    maximum: 0.35,
    betrKVNr: '9',
    verbrauchsabhaengig: false,
  },
  {
    id: 'gartenpflege',
    name: 'Gartenpflege',
    beschreibung: 'Pflege von Grünanlagen, Rasen, Spielplätzen',
    durchschnitt: 0.11,
    minimum: 0.03,
    maximum: 0.25,
    betrKVNr: '10',
    verbrauchsabhaengig: false,
    wohnungsSpezifisch: true,
  },
  {
    id: 'beleuchtung',
    name: 'Allgemeinstrom',
    beschreibung: 'Beleuchtung Treppenhaus, Flure, Außenbereich',
    durchschnitt: 0.06,
    minimum: 0.03,
    maximum: 0.12,
    betrKVNr: '11',
    verbrauchsabhaengig: false,
  },
  {
    id: 'schornstein',
    name: 'Schornsteinreinigung',
    beschreibung: 'Schornsteinfeger, Abgasmessung',
    durchschnitt: 0.04,
    minimum: 0.02,
    maximum: 0.08,
    betrKVNr: '12',
    verbrauchsabhaengig: false,
  },
  {
    id: 'versicherungen',
    name: 'Versicherungen',
    beschreibung: 'Gebäude-, Haftpflicht-, Glasversicherung',
    durchschnitt: 0.18,
    minimum: 0.10,
    maximum: 0.35,
    betrKVNr: '13',
    verbrauchsabhaengig: false,
  },
  {
    id: 'hauswart',
    name: 'Hauswart',
    beschreibung: 'Hausmeister für kleinere Instandhaltungsarbeiten',
    durchschnitt: 0.23,
    minimum: 0.10,
    maximum: 0.45,
    betrKVNr: '14',
    verbrauchsabhaengig: false,
    wohnungsSpezifisch: true,
  },
  {
    id: 'sonstige',
    name: 'Sonstige Betriebskosten',
    beschreibung: 'Dachrinnenreinigung, Rauchwarnmelder, etc.',
    durchschnitt: 0.05,
    minimum: 0.00,
    maximum: 0.15,
    betrKVNr: '17',
    verbrauchsabhaengig: false,
  },
];

// Durchschnitt gesamt nach Betriebskostenspiegel: ca. 2.88€/m²/Monat (ohne Heizung: ~1.50€)
const DURCHSCHNITT_GESAMT_KALT = 1.50;
const DURCHSCHNITT_GESAMT_WARM = 2.88;

// ============================================================================
// HEIZKOSTEN-FAKTOREN NACH ENERGIETRÄGER
// ============================================================================
// Basierend auf Heizspiegel 2024 - Kosten pro m² und Jahr

interface HeizungsartInfo {
  id: string;
  name: string;
  faktor: number;           // Multiplikator gegenüber Durchschnitt
  kostenProQmJahr: number;  // Durchschnittliche Heizkosten €/m²/Jahr
  warmwasserAnteil: number; // Anteil Warmwasser am Gesamtverbrauch
  beschreibung: string;
}

const HEIZUNGSARTEN: HeizungsartInfo[] = [
  {
    id: 'gas',
    name: 'Erdgas',
    faktor: 0.95,
    kostenProQmJahr: 13.50,
    warmwasserAnteil: 0.18,
    beschreibung: 'Verbreitetste Heizungsart, moderate Kosten',
  },
  {
    id: 'fernwaerme',
    name: 'Fernwärme',
    faktor: 1.10,
    kostenProQmJahr: 15.60,
    warmwasserAnteil: 0.20,
    beschreibung: 'Zentrale Wärmeversorgung, höhere Grundkosten',
  },
  {
    id: 'oel',
    name: 'Heizöl',
    faktor: 1.05,
    kostenProQmJahr: 14.80,
    warmwasserAnteil: 0.18,
    beschreibung: 'Preisstark schwankend, CO₂-Abgabe steigend',
  },
  {
    id: 'waermepumpe',
    name: 'Wärmepumpe',
    faktor: 0.70,
    kostenProQmJahr: 10.00,
    warmwasserAnteil: 0.22,
    beschreibung: 'Effizient, abhängig vom Strompreis',
  },
  {
    id: 'pellets',
    name: 'Holzpellets',
    faktor: 0.85,
    kostenProQmJahr: 12.00,
    warmwasserAnteil: 0.18,
    beschreibung: 'Nachwachsender Rohstoff, Preis zuletzt gestiegen',
  },
];

// ============================================================================
// REGIONALE FAKTOREN
// ============================================================================
// Betriebskosten variieren stark nach Region

interface RegionInfo {
  id: string;
  name: string;
  faktor: number;       // Multiplikator auf Gesamtkosten
  heizfaktor: number;   // Zusätzlicher Faktor für Heizkosten (Klima)
}

const REGIONEN: RegionInfo[] = [
  { id: 'berlin', name: 'Berlin', faktor: 1.05, heizfaktor: 1.0 },
  { id: 'hamburg', name: 'Hamburg', faktor: 1.08, heizfaktor: 1.02 },
  { id: 'muenchen', name: 'München', faktor: 1.15, heizfaktor: 1.05 },
  { id: 'koeln', name: 'Köln/Düsseldorf', faktor: 1.05, heizfaktor: 0.95 },
  { id: 'frankfurt', name: 'Frankfurt/Rhein-Main', faktor: 1.08, heizfaktor: 0.98 },
  { id: 'stuttgart', name: 'Stuttgart', faktor: 1.10, heizfaktor: 1.0 },
  { id: 'ruhrgebiet', name: 'Ruhrgebiet', faktor: 0.95, heizfaktor: 0.98 },
  { id: 'hannover', name: 'Hannover/Niedersachsen', faktor: 0.98, heizfaktor: 1.02 },
  { id: 'sachsen', name: 'Sachsen/Sachsen-Anhalt', faktor: 0.90, heizfaktor: 1.05 },
  { id: 'bayern_land', name: 'Bayern (ländlich)', faktor: 0.95, heizfaktor: 1.08 },
  { id: 'nrw_land', name: 'NRW (ländlich)', faktor: 0.92, heizfaktor: 0.98 },
  { id: 'andere', name: 'Andere/Durchschnitt', faktor: 1.00, heizfaktor: 1.00 },
];

// ============================================================================
// WOHNUNGSEIGENSCHAFTEN
// ============================================================================

interface WohnungsOptions {
  hatAufzug: boolean;
  hatGarten: boolean;
  hatHauswart: boolean;
  baujahr: 'vor1978' | '1978-2001' | 'nach2001';
}

// Energieverbrauch-Faktoren nach Baujahr
const BAUJAHR_FAKTOREN = {
  'vor1978': 1.25,    // Altbau ohne Dämmung
  '1978-2001': 1.0,   // Erste Wärmeschutzverordnung
  'nach2001': 0.75,   // Moderne EnEV-Standards
};

// ============================================================================
// BERECHNUNGSFUNKTIONEN
// ============================================================================

interface BerechnungsEingabe {
  wohnflaeche: number;
  personenzahl: number;
  heizungsart: string;
  region: string;
  optionen: WohnungsOptions;
}

interface KostenPosition {
  kategorie: Kostenkategorie;
  kostenProQm: number;
  kostenGesamt: number;
  kommentar?: string;
}

interface BerechnungsErgebnis {
  positionen: KostenPosition[];
  summeKalt: number;
  summeWarm: number;
  summeGesamt: number;
  proQmMonat: number;
  proQmJahr: number;
  hinweise: string[];
}

function berechneNebenkosten(eingabe: BerechnungsEingabe): BerechnungsErgebnis {
  const heizung = HEIZUNGSARTEN.find(h => h.id === eingabe.heizungsart) || HEIZUNGSARTEN[0];
  const region = REGIONEN.find(r => r.id === eingabe.region) || REGIONEN[REGIONEN.length - 1];
  const baujahFaktor = BAUJAHR_FAKTOREN[eingabe.optionen.baujahr];
  
  // Verbrauchsfaktor basierend auf Personenzahl (mehr Personen = mehr Verbrauch)
  // Aber: Skaleneffekte (nicht linear)
  const verbrauchsFaktor = 1 + (eingabe.personenzahl - 2) * 0.08;
  
  const positionen: KostenPosition[] = [];
  const hinweise: string[] = [];
  
  let summeKalt = 0;
  let summeWarm = 0;
  
  for (const kategorie of BETRIEBSKOSTEN_KATEGORIEN) {
    // Prüfe optionale Kategorien
    if (kategorie.id === 'aufzug' && !eingabe.optionen.hatAufzug) continue;
    if (kategorie.id === 'gartenpflege' && !eingabe.optionen.hatGarten) continue;
    if (kategorie.id === 'hauswart' && !eingabe.optionen.hatHauswart) continue;
    
    let kostenProQm = kategorie.durchschnitt;
    
    // Regionaler Faktor
    kostenProQm *= region.faktor;
    
    // Verbrauchsabhängige Kosten
    if (kategorie.verbrauchsabhaengig) {
      kostenProQm *= verbrauchsFaktor;
    }
    
    // Heizungs-/Warmwasserkosten
    if (kategorie.heizungsabhaengig) {
      if (kategorie.id === 'heizung') {
        // Heizkosten pro m² und Monat aus Jahreswerten
        kostenProQm = (heizung.kostenProQmJahr * (1 - heizung.warmwasserAnteil)) / 12;
        kostenProQm *= region.heizfaktor;
        kostenProQm *= baujahFaktor;
      } else if (kategorie.id === 'warmwasser') {
        kostenProQm = (heizung.kostenProQmJahr * heizung.warmwasserAnteil) / 12;
        kostenProQm *= verbrauchsFaktor;
      }
    }
    
    const kostenGesamt = kostenProQm * eingabe.wohnflaeche;
    
    positionen.push({
      kategorie,
      kostenProQm,
      kostenGesamt,
    });
    
    // Summen
    if (kategorie.id === 'heizung' || kategorie.id === 'warmwasser') {
      summeWarm += kostenGesamt;
    } else {
      summeKalt += kostenGesamt;
    }
  }
  
  const summeGesamt = summeKalt + summeWarm;
  const proQmMonat = summeGesamt / eingabe.wohnflaeche;
  const proQmJahr = proQmMonat * 12;
  
  // Hinweise generieren
  if (proQmMonat > 3.50) {
    hinweise.push('Ihre geschätzten Nebenkosten liegen über dem Durchschnitt. Prüfen Sie bei der Abrechnung insbesondere die Heizkosten.');
  }
  if (proQmMonat < 2.00) {
    hinweise.push('Ihre geschätzten Nebenkosten liegen unter dem Durchschnitt. Vermutlich sind nicht alle Kostenarten enthalten.');
  }
  if (eingabe.optionen.baujahr === 'vor1978') {
    hinweise.push('Altbauten haben oft höhere Heizkosten. Energetische Sanierung kann die Kosten deutlich senken.');
  }
  if (heizung.id === 'oel') {
    hinweise.push('Die CO₂-Abgabe auf Heizöl steigt jährlich. 2026 beträgt sie 55€/Tonne CO₂.');
  }
  
  return {
    positionen,
    summeKalt,
    summeWarm,
    summeGesamt,
    proQmMonat,
    proQmJahr,
    hinweise,
  };
}

// ============================================================================
// REACT COMPONENT
// ============================================================================

export default function NebenkostenRechner() {
  // Eingabewerte
  const [wohnflaeche, setWohnflaeche] = useState<number>(65);
  const [personenzahl, setPersonenzahl] = useState<number>(2);
  const [heizungsart, setHeizungsart] = useState<string>('gas');
  const [region, setRegion] = useState<string>('andere');
  const [hatAufzug, setHatAufzug] = useState<boolean>(false);
  const [hatGarten, setHatGarten] = useState<boolean>(true);
  const [hatHauswart, setHatHauswart] = useState<boolean>(true);
  const [baujahr, setBaujahr] = useState<'vor1978' | '1978-2001' | 'nach2001'>('1978-2001');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
  // Berechnung
  const ergebnis = useMemo(() => {
    if (wohnflaeche <= 0) return null;
    
    return berechneNebenkosten({
      wohnflaeche,
      personenzahl,
      heizungsart,
      region,
      optionen: {
        hatAufzug,
        hatGarten,
        hatHauswart,
        baujahr,
      },
    });
  }, [wohnflaeche, personenzahl, heizungsart, region, hatAufzug, hatGarten, hatHauswart, baujahr]);
  
  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Ihre Wohnung
        </h2>
        
        <div className="space-y-5">
          {/* Wohnfläche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wohnfläche (m²)
            </label>
            <input
              type="number"
              value={wohnflaeche}
              onChange={(e) => setWohnflaeche(Math.max(10, Math.min(500, Number(e.target.value))))}
              min={10}
              max={500}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
            />
          </div>
          
          {/* Personenzahl */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anzahl Personen im Haushalt
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setPersonenzahl(n)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    personenzahl === n
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {n}{n === 5 ? '+' : ''}
                </button>
              ))}
            </div>
          </div>
          
          {/* Heizungsart */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heizungsart
            </label>
            <select
              value={heizungsart}
              onChange={(e) => setHeizungsart(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {HEIZUNGSARTEN.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {HEIZUNGSARTEN.find(h => h.id === heizungsart)?.beschreibung}
            </p>
          </div>
          
          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {REGIONEN.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Baujahr */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Baujahr des Gebäudes
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'vor1978', label: 'Vor 1978', desc: 'Altbau' },
                { id: '1978-2001', label: '1978-2001', desc: 'Standard' },
                { id: 'nach2001', label: 'Nach 2001', desc: 'Modern' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBaujahr(b.id as typeof baujahr)}
                  className={`py-3 px-2 rounded-xl transition-all ${
                    baujahr === b.id
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium">{b.label}</div>
                  <div className="text-xs opacity-75">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Optionen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ausstattung (optional vorhanden)
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={hatAufzug}
                  onChange={(e) => setHatAufzug(e.target.checked)}
                  className="w-5 h-5 text-purple-500 rounded"
                />
                <span>🛗 Aufzug vorhanden</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={hatGarten}
                  onChange={(e) => setHatGarten(e.target.checked)}
                  className="w-5 h-5 text-purple-500 rounded"
                />
                <span>🌳 Garten/Grünanlage</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={hatHauswart}
                  onChange={(e) => setHatHauswart(e.target.checked)}
                  className="w-5 h-5 text-purple-500 rounded"
                />
                <span>🔧 Hauswart/Hausmeister</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ergebnis */}
      {ergebnis && (
        <>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Geschätzte Nebenkosten
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-sm opacity-90">Pro Monat</div>
                <div className="text-3xl font-bold">{formatEuro(ergebnis.summeGesamt)}</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-sm opacity-90">Pro Jahr</div>
                <div className="text-3xl font-bold">{formatEuro(ergebnis.summeGesamt * 12)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs opacity-75">Kalte Nebenkosten</div>
                <div className="text-xl font-semibold">{formatEuro(ergebnis.summeKalt)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs opacity-75">Warme Nebenkosten</div>
                <div className="text-xl font-semibold">{formatEuro(ergebnis.summeWarm)}</div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-3">
              <div className="text-xs opacity-75">Pro Quadratmeter/Monat</div>
              <div className="text-xl font-semibold">{formatEuro(ergebnis.proQmMonat)}/m²</div>
              <div className="text-xs opacity-75 mt-1">
                Bundesdurchschnitt: ca. 2,88€/m² (mit Heizung)
              </div>
            </div>
          </div>
          
          {/* Aufschlüsselung */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-left"
            >
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Aufschlüsselung nach Kostenarten
              </h2>
              <span className="text-2xl">{showDetails ? '▲' : '▼'}</span>
            </button>
            
            {showDetails && (
              <div className="mt-4 space-y-2">
                {ergebnis.positionen.map((pos) => (
                  <div
                    key={pos.kategorie.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <div className="font-medium text-gray-800">{pos.kategorie.name}</div>
                      <div className="text-xs text-gray-500">
                        BetrKV §2 Nr. {pos.kategorie.betrKVNr} • {formatEuro(pos.kostenProQm)}/m²
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">{formatEuro(pos.kostenGesamt)}</div>
                      <div className="text-xs text-gray-500">/Monat</div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>Gesamt</span>
                    <span>{formatEuro(ergebnis.summeGesamt)}/Monat</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Hinweise */}
          {ergebnis.hinweise.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Hinweise
              </h2>
              <ul className="space-y-2">
                {ergebnis.hinweise.map((hinweis, i) => (
                  <li key={i} className="text-amber-700 text-sm flex gap-2">
                    <span>•</span>
                    <span>{hinweis}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Nicht umlagefähige Kosten */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Nicht umlagefähige Kosten
            </h2>
            <p className="text-red-700 text-sm mb-3">
              Folgende Kosten dürfen laut BetrKV <strong>nicht</strong> auf Mieter umgelegt werden:
            </p>
            <ul className="space-y-1 text-red-700 text-sm">
              <li>• <strong>Verwaltungskosten</strong> (Hausverwaltung, Kontoführung)</li>
              <li>• <strong>Instandhaltungskosten</strong> (Reparaturen, Sanierung)</li>
              <li>• <strong>Instandsetzungskosten</strong> (Erneuerung von Bauteilen)</li>
              <li>• <strong>Rücklagen</strong> für Instandhaltung</li>
              <li>• <strong>Leerstandskosten</strong> (leerstehende Wohnungen)</li>
            </ul>
          </div>
        </>
      )}
      
      {/* Info-Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">ℹ️</span>
          Was sind Nebenkosten?
        </h2>
        <div className="text-blue-700 text-sm space-y-3">
          <p>
            <strong>Nebenkosten</strong> (oder Betriebskosten) sind die laufenden Kosten, die dem 
            Vermieter durch den Betrieb des Gebäudes entstehen und die er auf die Mieter umlegen darf.
          </p>
          <p>
            Die <strong>Betriebskostenverordnung (BetrKV)</strong> regelt in §2 abschließend, welche 
            17 Kostenarten umlagefähig sind. Nur diese dürfen in der Betriebskostenabrechnung erscheinen.
          </p>
          <p>
            Man unterscheidet zwischen <strong>kalten Nebenkosten</strong> (alle außer Heizung/Warmwasser) 
            und <strong>warmen Nebenkosten</strong> (Heizung und Warmwasser), die zusammen die 
            "zweite Miete" bilden.
          </p>
        </div>
      </div>
    </div>
  );
}
