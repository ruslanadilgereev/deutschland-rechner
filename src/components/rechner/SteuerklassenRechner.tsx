import { useState, useMemo } from 'react';

/**
 * STEUERKLASSENRECHNER 2025
 * Vergleicht verschiedene Steuerklassen-Kombinationen für Ehepaare und Alleinstehende
 * 
 * Berechnung basiert auf:
 * - §32a EStG - Einkommensteuertarif (Steuerfortentwicklungsgesetz, BGBl. I 2024, 449)
 * - §38b EStG - Lohnsteuerklassen
 * - §39 EStG - Lohnsteuerabzugsmerkmale
 * - BMF Programmablaufplan 2025
 * 
 * Quellen:
 * - https://www.gesetze-im-internet.de/estg/__32a.html
 * - https://www.gesetze-im-internet.de/estg/__38b.html
 * - https://lsth.bundesfinanzministerium.de/lsth/2025/
 * - https://www.bmf-steuerrechner.de
 * - https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2025
 */

// ============================================================================
// OFFIZIELLE WERTE 2025 (§32a EStG - Steuerfortentwicklungsgesetz)
// ============================================================================
const STEUERJAHR = 2025;

const TARIF_2025 = {
  grundfreibetrag: 12096,      // Zone 1: bis 12.096€ = 0% Steuer
  zone2Start: 12097,           // Zone 2 Start
  zone2Ende: 17443,            // Zone 2 Ende (Progressionszone 1: 14%-24%)
  zone3Start: 17444,           // Zone 3 Start
  zone3Ende: 68480,            // Zone 3 Ende (Progressionszone 2: 24%-42%)
  zone4Start: 68481,           // Zone 4 Start
  zone4Ende: 277825,           // Zone 4 Ende (42% Spitzensteuersatz)
  zone5Start: 277826,          // Zone 5 Start (45% Reichensteuer)
  
  // Koeffizienten für Zone 2: ESt = (a * y + b) * y
  zone2_a: 932.30,
  zone2_b: 1400,
  
  // Koeffizienten für Zone 3: ESt = (a * z + b) * z + c
  zone3_a: 176.64,
  zone3_b: 2397,
  zone3_c: 1015.13,
  
  // Zone 4: ESt = 0.42 * x - c
  zone4_satz: 0.42,
  zone4_abzug: 10911.92,
  
  // Zone 5: ESt = 0.45 * x - c
  zone5_satz: 0.45,
  zone5_abzug: 19246.67,
};

// Alias für den aktuellen Tarif
const TARIF = TARIF_2025;

// ============================================================================
// SOZIALVERSICHERUNG 2025
// ============================================================================
const SV_SAETZE_2025 = {
  rv: 0.186,           // Rentenversicherung 18,6% (AG+AN)
  kv: 0.146,           // Krankenversicherung 14,6% (AG+AN)
  kvZusatz: 0.017,     // Durchschn. Zusatzbeitrag 1,7% (2025)
  pv: 0.034,           // Pflegeversicherung 3,4% (AG+AN)
  pvKinderlos: 0.006,  // Zuschlag kinderlose ab 23: +0,6%
  av: 0.026,           // Arbeitslosenversicherung 2,6% (AG+AN)
};

// Beitragsbemessungsgrenzen 2025 (monatlich)
const BBG_2025 = {
  rvWest: 8050,    // RV/AV West: 8.050€/Monat = 96.600€/Jahr
  rvOst: 8050,     // RV/AV Ost (ab 2025 angeglichen)
  kv: 5512.50,     // KV/PV: 5.512,50€/Monat = 66.150€/Jahr
};

// ============================================================================
// SOLI & KIRCHENSTEUER
// ============================================================================
const SOLI_SATZ = 0.055; // 5,5%
const SOLI_FREIGRENZE_GRUND = 18130;     // Grundtarif
const SOLI_FREIGRENZE_SPLITTING = 36260; // Splittingtarif
const SOLI_MILDERUNGSZONE_FAKTOR = 0.119;

// ============================================================================
// PAUSCHALEN & FREIBETRÄGE 2025
// ============================================================================
const WERBUNGSKOSTENPAUSCHALE = 1230;    // §9a Nr. 1 EStG
const SONDERAUSGABENPAUSCHALE = 36;       // §10c EStG
const ENTLASTUNGSBETRAG_ALLEINERZ = 4260; // §24b EStG
const ENTLASTUNGSBETRAG_WEITERE_KINDER = 240;

// Steuerklassen-Info (§38b EStG)
const STEUERKLASSEN = [
  { 
    id: 1, 
    name: 'Steuerklasse I', 
    beschreibung: 'Ledige, Geschiedene, Verwitwete',
    icon: '👤'
  },
  { 
    id: 2, 
    name: 'Steuerklasse II', 
    beschreibung: 'Alleinerziehende mit Entlastungsbetrag',
    icon: '👤👶'
  },
  { 
    id: 3, 
    name: 'Steuerklasse III', 
    beschreibung: 'Verheiratete (Partner in V oder ohne Einkommen)',
    icon: '💑'
  },
  { 
    id: 4, 
    name: 'Steuerklasse IV', 
    beschreibung: 'Verheiratete (beide erwerbstätig, gleich)',
    icon: '👫'
  },
  { 
    id: 5, 
    name: 'Steuerklasse V', 
    beschreibung: 'Verheiratete (Partner in III)',
    icon: '💑'
  },
  { 
    id: 6, 
    name: 'Steuerklasse VI', 
    beschreibung: 'Zweit- und Nebenjob',
    icon: '📋'
  },
];

/**
 * EINKOMMENSTEUERTARIF nach §32a EStG
 * Exakte Formel aus dem Gesetz für das Steuerjahr 2025
 * 
 * Quelle: https://lsth.bundesfinanzministerium.de/lsth/2025/A-Einkommensteuergesetz/IV-Tarif-31-34b/Paragraf-32a/inhalt.html
 */
function berechneEStTarif(zvE: number): number {
  // Auf volle Euro abrunden (§32a Abs. 1 Satz 1 EStG)
  const x = Math.floor(zvE);
  
  if (x <= 0) return 0;
  
  // Zone 1: Grundfreibetrag (0%)
  if (x <= TARIF.grundfreibetrag) {
    return 0;
  }
  
  // Zone 2: Progressionszone 1 (14% - 24%)
  // y = (zvE - Grundfreibetrag) / 10.000
  // ESt = (932,30 * y + 1.400) * y
  if (x <= TARIF.zone2Ende) {
    const y = (x - TARIF.grundfreibetrag) / 10000;
    return Math.floor((TARIF.zone2_a * y + TARIF.zone2_b) * y);
  }
  
  // Zone 3: Progressionszone 2 (24% - 42%)
  // z = (zvE - 17.443) / 10.000
  // ESt = (176,64 * z + 2.397) * z + 1.015,13
  if (x <= TARIF.zone3Ende) {
    const z = (x - TARIF.zone2Ende) / 10000;
    return Math.floor((TARIF.zone3_a * z + TARIF.zone3_b) * z + TARIF.zone3_c);
  }
  
  // Zone 4: Proportionalzone 1 (42% Spitzensteuersatz)
  // ESt = 0,42 * x - 10.911,92
  if (x <= TARIF.zone4Ende) {
    return Math.floor(TARIF.zone4_satz * x - TARIF.zone4_abzug);
  }
  
  // Zone 5: Proportionalzone 2 (45% Reichensteuer)
  // ESt = 0,45 * x - 19.246,67
  return Math.floor(TARIF.zone5_satz * x - TARIF.zone5_abzug);
}

/**
 * Solidaritätszuschlag nach §3 SolzG
 * Mit Freigrenzen und Milderungszone (seit 2021)
 */
function berechneSoli(lohnsteuer: number, splitting: boolean): number {
  const freigrenze = splitting ? SOLI_FREIGRENZE_SPLITTING : SOLI_FREIGRENZE_GRUND;
  
  if (lohnsteuer <= freigrenze) {
    return 0;
  }
  
  // Milderungszone
  const ueberFreigrenze = lohnsteuer - freigrenze;
  const soliMilderung = ueberFreigrenze * SOLI_MILDERUNGSZONE_FAKTOR;
  const soliVoll = lohnsteuer * SOLI_SATZ;
  
  return Math.round(Math.min(soliMilderung, soliVoll));
}

/**
 * Lohnsteuer nach Steuerklasse berechnen
 * Basiert auf §32a EStG und §38b EStG
 */
function berechneLohnsteuerJahr(
  brutto: number, 
  steuerklasse: number, 
  kinder: number, 
  kirchensteuer: boolean, 
  bundesland: string
): {
  lohnsteuer: number;
  soli: number;
  kirchensteuer: number;
  gesamt: number;
} {
  const jahresBrutto = brutto * 12;
  
  // Freibeträge je Steuerklasse (§38b EStG)
  let grundfreibetrag = TARIF.grundfreibetrag;
  let arbeitnehmerPauschbetrag = WERBUNGSKOSTENPAUSCHALE;
  let sonderausgabenPauschbetrag = SONDERAUSGABENPAUSCHALE;
  let entlastungsbetragAlleinerziehende = 0;
  
  // Vereinfachte Vorsorgepauschale
  const rvBasis = Math.min(jahresBrutto, BBG_2025.rvWest * 12);
  const kvBasis = Math.min(jahresBrutto, BBG_2025.kv * 12);
  const vorsorgePauschale = rvBasis * 0.093 + kvBasis * 0.07;
  
  let useSplitting = false;
  
  switch (steuerklasse) {
    case 1:
      break;
    case 2:
      entlastungsbetragAlleinerziehende = ENTLASTUNGSBETRAG_ALLEINERZ + 
        (kinder > 1 ? (kinder - 1) * ENTLASTUNGSBETRAG_WEITERE_KINDER : 0);
      break;
    case 3:
      useSplitting = true; // Splittingtarif
      break;
    case 4:
      break;
    case 5:
      grundfreibetrag = 0; // Kein Grundfreibetrag
      arbeitnehmerPauschbetrag = 0;
      sonderausgabenPauschbetrag = 0;
      break;
    case 6:
      grundfreibetrag = 0;
      arbeitnehmerPauschbetrag = 0;
      sonderausgabenPauschbetrag = 0;
      break;
  }
  
  // Zu versteuerndes Einkommen
  const abzuege = arbeitnehmerPauschbetrag + sonderausgabenPauschbetrag + 
    vorsorgePauschale + entlastungsbetragAlleinerziehende;
  const zvE = Math.max(0, jahresBrutto - abzuege);
  
  // Steuerberechnung
  let steuer: number;
  
  if (useSplitting) {
    // Splittingtarif: zvE halbieren, Steuer berechnen, verdoppeln
    steuer = berechneEStTarif(zvE / 2) * 2;
  } else if (steuerklasse === 5 || steuerklasse === 6) {
    // Kein Grundfreibetrag
    steuer = berechneEStTarif(zvE);
  } else {
    steuer = berechneEStTarif(zvE);
  }
  
  // Soli
  const soli = berechneSoli(steuer, useSplitting);
  
  // Kirchensteuer (8% in BY/BW, sonst 9%)
  const kirchensteuerSatz = bundesland === 'BY' || bundesland === 'BW' ? 0.08 : 0.09;
  const kirchensteuerBetrag = kirchensteuer ? Math.round(steuer * kirchensteuerSatz) : 0;
  
  return {
    lohnsteuer: Math.round(steuer),
    soli,
    kirchensteuer: kirchensteuerBetrag,
    gesamt: Math.round(steuer) + soli + kirchensteuerBetrag,
  };
}

/**
 * Sozialversicherungsbeiträge berechnen (Arbeitnehmeranteil)
 */
function berechneSozialversicherung(
  brutto: number, 
  kinderlos: boolean, 
  kinderAnzahl: number
): {
  rv: number;
  kv: number;
  pv: number;
  av: number;
  gesamt: number;
} {
  const jahresBrutto = brutto * 12;
  
  // Beitragsbemessungsgrenzen anwenden
  const rvBasis = Math.min(jahresBrutto, BBG_2025.rvWest * 12);
  const kvBasis = Math.min(jahresBrutto, BBG_2025.kv * 12);
  
  // Arbeitnehmeranteile (50%)
  const rv = Math.round(rvBasis * SV_SAETZE_2025.rv / 2);
  const kv = Math.round(kvBasis * (SV_SAETZE_2025.kv + SV_SAETZE_2025.kvZusatz) / 2);
  
  // Pflegeversicherung mit Kinderlosenzuschlag und Kinderabschlag
  let pvSatz = SV_SAETZE_2025.pv / 2; // AN-Anteil
  if (kinderlos) {
    pvSatz += SV_SAETZE_2025.pvKinderlos; // Zuschlag +0,6%
  } else if (kinderAnzahl >= 2) {
    // Abschlag für Kinder ab 2. Kind: 0,25% pro Kind (max bis 5. Kind)
    const abschlag = Math.min(kinderAnzahl - 1, 4) * 0.0025;
    pvSatz = Math.max(0.007, pvSatz - abschlag);
  }
  const pv = Math.round(kvBasis * pvSatz);
  
  const av = Math.round(rvBasis * SV_SAETZE_2025.av / 2);
  
  return {
    rv,
    kv,
    pv,
    av,
    gesamt: rv + kv + pv + av,
  };
}

export default function SteuerklassenRechner() {
  // Partner 1
  const [brutto1, setBrutto1] = useState(4500);
  
  // Partner 2
  const [brutto2, setBrutto2] = useState(3000);
  
  // Gemeinsame Einstellungen
  const [kinder, setKinder] = useState(0);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState('NW');
  const [alleinstehend, setAlleinstehend] = useState(false);

  const ergebnis = useMemo(() => {
    if (alleinstehend) {
      // Einzelperson
      const kinderlos = kinder === 0;
      const steuerklasse = kinder > 0 ? 2 : 1;
      
      const steuer = berechneLohnsteuerJahr(brutto1, steuerklasse, kinder, kirchensteuer, bundesland);
      const sv = berechneSozialversicherung(brutto1, kinderlos, kinder);
      
      const jahresBrutto = brutto1 * 12;
      const jahresNetto = jahresBrutto - steuer.gesamt - sv.gesamt;
      
      return {
        alleinstehend: true,
        steuerklasse,
        brutto: jahresBrutto,
        steuer,
        sv,
        netto: jahresNetto,
        nettoMonat: Math.round(jahresNetto / 12),
      };
    }
    
    // Ehepaare - alle Kombinationen berechnen
    const kinderlos = kinder === 0;
    const sv1 = berechneSozialversicherung(brutto1, kinderlos, kinder);
    const sv2 = berechneSozialversicherung(brutto2, kinderlos, kinder);
    
    const kombinationen = [
      { sk1: 4, sk2: 4, name: 'IV / IV' },
      { sk1: 3, sk2: 5, name: 'III / V' },
      { sk1: 5, sk2: 3, name: 'V / III' },
    ].map(komb => {
      const steuer1 = berechneLohnsteuerJahr(brutto1, komb.sk1, kinder, kirchensteuer, bundesland);
      const steuer2 = berechneLohnsteuerJahr(brutto2, komb.sk2, kinder, kirchensteuer, bundesland);
      
      const jahresBrutto1 = brutto1 * 12;
      const jahresBrutto2 = brutto2 * 12;
      const gesamtBrutto = jahresBrutto1 + jahresBrutto2;
      
      const gesamtSteuer = steuer1.gesamt + steuer2.gesamt;
      const gesamtSV = sv1.gesamt + sv2.gesamt;
      
      const netto1 = jahresBrutto1 - steuer1.gesamt - sv1.gesamt;
      const netto2 = jahresBrutto2 - steuer2.gesamt - sv2.gesamt;
      const gesamtNetto = netto1 + netto2;
      
      return {
        ...komb,
        steuer1,
        steuer2,
        netto1,
        netto2,
        gesamtBrutto,
        gesamtSteuer,
        gesamtSV,
        gesamtNetto,
        nettoMonat: Math.round(gesamtNetto / 12),
      };
    });
    
    // Tatsächliche Einkommensteuer bei Zusammenveranlagung berechnen
    const jahresBrutto1 = brutto1 * 12;
    const jahresBrutto2 = brutto2 * 12;
    const gesamtBrutto = jahresBrutto1 + jahresBrutto2;
    
    // Vereinfachtes zvE für Zusammenveranlagung
    const rvBasis = Math.min(gesamtBrutto, BBG_2025.rvWest * 12 * 2);
    const kvBasis = Math.min(gesamtBrutto, BBG_2025.kv * 12 * 2);
    const vorsorgePauschale = rvBasis * 0.093 + kvBasis * 0.07;
    const abzuege = WERBUNGSKOSTENPAUSCHALE * 2 + SONDERAUSGABENPAUSCHALE * 2 + vorsorgePauschale;
    const zvEGesamt = Math.max(0, gesamtBrutto - abzuege);
    
    // Splittingtarif: zvE halbieren, Steuer berechnen, verdoppeln
    const tatsaechlicheSteuer = berechneEStTarif(zvEGesamt / 2) * 2;
    
    // Beste Kombination finden (höchstes monatliches Netto)
    const beste = kombinationen.reduce((prev, curr) => 
      curr.gesamtNetto > prev.gesamtNetto ? curr : prev
    );
    
    // Nachzahlung/Erstattung berechnen
    const kombinationenMitNachzahlung = kombinationen.map(komb => {
      const gezahlteLohnsteuer = komb.steuer1.lohnsteuer + komb.steuer2.lohnsteuer;
      const differenz = gezahlteLohnsteuer - tatsaechlicheSteuer;
      
      return {
        ...komb,
        tatsaechlicheSteuer: Math.round(tatsaechlicheSteuer),
        nachzahlung: differenz < 0 ? Math.abs(Math.round(differenz)) : 0,
        erstattung: differenz > 0 ? Math.round(differenz) : 0,
      };
    });
    
    return {
      alleinstehend: false,
      kombinationen: kombinationenMitNachzahlung,
      beste: kombinationenMitNachzahlung.find(k => k.name === beste.name)!,
      sv1,
      sv2,
    };
  }, [brutto1, brutto2, kinder, kirchensteuer, bundesland, alleinstehend]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  const bundeslaender = [
    { code: 'BW', name: 'Baden-Württemberg' },
    { code: 'BY', name: 'Bayern' },
    { code: 'BE', name: 'Berlin' },
    { code: 'BB', name: 'Brandenburg' },
    { code: 'HB', name: 'Bremen' },
    { code: 'HH', name: 'Hamburg' },
    { code: 'HE', name: 'Hessen' },
    { code: 'MV', name: 'Mecklenburg-Vorpommern' },
    { code: 'NI', name: 'Niedersachsen' },
    { code: 'NW', name: 'Nordrhein-Westfalen' },
    { code: 'RP', name: 'Rheinland-Pfalz' },
    { code: 'SL', name: 'Saarland' },
    { code: 'SN', name: 'Sachsen' },
    { code: 'ST', name: 'Sachsen-Anhalt' },
    { code: 'SH', name: 'Schleswig-Holstein' },
    { code: 'TH', name: 'Thüringen' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Familienstand */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">👥</span> Familienstand
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setAlleinstehend(true)}
            className={`py-4 px-4 rounded-xl font-medium transition-all flex flex-col items-center gap-2 ${
              alleinstehend
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl">👤</span>
            <span>Alleinstehend</span>
            <span className="text-xs opacity-75">Ledig/Geschieden/Verwitwet</span>
          </button>
          <button
            onClick={() => setAlleinstehend(false)}
            className={`py-4 px-4 rounded-xl font-medium transition-all flex flex-col items-center gap-2 ${
              !alleinstehend
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-2xl">💑</span>
            <span>Verheiratet</span>
            <span className="text-xs opacity-75">Zusammenveranlagung</span>
          </button>
        </div>
      </div>

      {/* Einkommen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💰</span> Monatliches Bruttoeinkommen
        </h3>
        
        <div className="space-y-6">
          {/* Partner 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {alleinstehend ? 'Dein Bruttogehalt' : 'Partner 1 – Bruttogehalt'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={brutto1}
                onChange={(e) => setBrutto1(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                min="0"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
            </div>
            <input
              type="range"
              min="0"
              max="15000"
              step="100"
              value={brutto1}
              onChange={(e) => setBrutto1(Number(e.target.value))}
              className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          
          {/* Partner 2 */}
          {!alleinstehend && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner 2 – Bruttogehalt
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={brutto2}
                  onChange={(e) => setBrutto2(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                  step="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
              </div>
              <input
                type="range"
                min="0"
                max="15000"
                step="100"
                value={brutto2}
                onChange={(e) => setBrutto2(Number(e.target.value))}
                className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Weitere Optionen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">⚙️</span> Weitere Angaben
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kinder
            </label>
            <select
              value={kinder}
              onChange={(e) => setKinder(Number(e.target.value))}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
            >
              {[0, 1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'Kind' : 'Kinder'}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bundesland
            </label>
            <select
              value={bundesland}
              onChange={(e) => setBundesland(e.target.value)}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
            >
              {bundeslaender.map(bl => (
                <option key={bl.code} value={bl.code}>{bl.name}</option>
              ))}
            </select>
          </div>
          
          <div className="col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={kirchensteuer}
                onChange={(e) => setKirchensteuer(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-700">
                Kirchensteuerpflichtig ({bundesland === 'BY' || bundesland === 'BW' ? '8%' : '9%'})
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Ergebnis Alleinstehend */}
      {ergebnis.alleinstehend && 'steuerklasse' in ergebnis && (
        <>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white mb-6">
            <h3 className="text-sm font-medium text-blue-200 mb-1">
              Deine Steuerklasse: {ergebnis.steuerklasse === 2 ? 'II' : 'I'}
            </h3>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatEuro(ergebnis.nettoMonat)}</span>
                <span className="text-blue-200">/Monat</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">Netto nach Steuern & Sozialabgaben</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <span className="text-blue-200 text-xs block">Jahresbrutto</span>
                <span className="text-xl font-bold">{formatEuro(ergebnis.brutto)}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <span className="text-blue-200 text-xs block">Jahresnetto</span>
                <span className="text-xl font-bold">{formatEuro(ergebnis.netto)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📊 Abzüge im Detail (Jahr)</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Lohnsteuer (§32a EStG)</span>
                <span className="font-medium text-gray-900">{formatEuro(ergebnis.steuer.lohnsteuer)}</span>
              </div>
              {ergebnis.steuer.soli > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Solidaritätszuschlag</span>
                  <span className="font-medium text-gray-900">{formatEuro(ergebnis.steuer.soli)}</span>
                </div>
              )}
              {ergebnis.steuer.kirchensteuer > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Kirchensteuer</span>
                  <span className="font-medium text-gray-900">{formatEuro(ergebnis.steuer.kirchensteuer)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Rentenversicherung</span>
                <span className="font-medium text-gray-900">{formatEuro(ergebnis.sv.rv)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Krankenversicherung</span>
                <span className="font-medium text-gray-900">{formatEuro(ergebnis.sv.kv)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Pflegeversicherung</span>
                <span className="font-medium text-gray-900">{formatEuro(ergebnis.sv.pv)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Arbeitslosenversicherung</span>
                <span className="font-medium text-gray-900">{formatEuro(ergebnis.sv.av)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-200 bg-gray-50 -mx-6 px-6 rounded-b-xl">
                <span className="font-bold text-gray-800">Abzüge gesamt</span>
                <span className="font-bold text-red-600">{formatEuro(ergebnis.steuer.gesamt + ergebnis.sv.gesamt)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Ergebnis Verheiratet */}
      {!ergebnis.alleinstehend && 'kombinationen' in ergebnis && (
        <>
          {/* Beste Kombination */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <h3 className="text-sm font-medium text-green-200">Optimale Steuerklassen-Kombination</h3>
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{ergebnis.beste.name}</span>
              </div>
              <p className="text-green-200 text-lg mt-2">
                <span className="font-bold text-white">{formatEuro(ergebnis.beste.nettoMonat)}</span> Netto/Monat
              </p>
            </div>

            {ergebnis.beste.erstattung > 0 && (
              <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                <span className="text-green-100 text-sm block">Erwartete Steuererstattung</span>
                <span className="text-xl font-bold">ca. {formatEuro(ergebnis.beste.erstattung)}</span>
              </div>
            )}
            {ergebnis.beste.nachzahlung > 0 && (
              <div className="bg-red-500/30 rounded-xl p-3 backdrop-blur-sm">
                <span className="text-red-100 text-sm block">⚠️ Erwartete Nachzahlung</span>
                <span className="text-xl font-bold">ca. {formatEuro(ergebnis.beste.nachzahlung)}</span>
              </div>
            )}
          </div>

          {/* Vergleich aller Kombinationen */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📊 Alle Kombinationen im Vergleich</h3>
            
            <div className="space-y-4">
              {ergebnis.kombinationen.map((komb, idx) => {
                const isBeste = komb.name === ergebnis.beste.name;
                
                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border-2 ${
                      isBeste 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          {komb.name}
                          {isBeste && <span className="text-green-600 text-sm">✓ Optimal</span>}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Partner 1: SK {komb.sk1} | Partner 2: SK {komb.sk2}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg text-gray-800">{formatEuro(komb.nettoMonat)}</span>
                        <span className="text-gray-400 text-sm block">/Monat</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Partner 1:</span>
                        <span className="font-medium text-gray-700 ml-1">
                          {formatEuro(Math.round(komb.netto1 / 12))}/M
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Partner 2:</span>
                        <span className="font-medium text-gray-700 ml-1">
                          {formatEuro(Math.round(komb.netto2 / 12))}/M
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
                      <span className="text-gray-500">Bei Steuererklärung:</span>
                      {komb.erstattung > 0 && (
                        <span className="text-green-600 font-medium">
                          ≈ {formatEuro(komb.erstattung)} Erstattung
                        </span>
                      )}
                      {komb.nachzahlung > 0 && (
                        <span className="text-red-600 font-medium">
                          ≈ {formatEuro(komb.nachzahlung)} Nachzahlung
                        </span>
                      )}
                      {komb.erstattung === 0 && komb.nachzahlung === 0 && (
                        <span className="text-gray-500">keine wesentliche Änderung</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Erklärung */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-blue-800 mb-3">💡 Welche Kombination ist die richtige?</h3>
            <div className="space-y-3 text-sm text-blue-700">
              <div className="flex gap-2">
                <span className="font-bold">III / V:</span>
                <span>Wenn ein Partner deutlich mehr verdient. Höheres Monatsnetto für den Besserverdienenden, aber oft Nachzahlung bei Steuererklärung.</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">IV / IV:</span>
                <span>Bei ähnlichem Einkommen. Ausgewogene Verteilung, selten hohe Nachzahlungen oder Erstattungen.</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">IV / IV mit Faktor:</span>
                <span>Optimierte Variante für unterschiedliche Einkommen. Vermeidet Nachzahlungen durch genaue Berechnung.</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Steuerklassen-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Steuerklassen-Übersicht (§38b EStG)</h3>
        
        <div className="space-y-3">
          {STEUERKLASSEN.map(sk => (
            <div key={sk.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">{sk.icon}</span>
              <div>
                <h4 className="font-medium text-gray-800">{sk.name}</h4>
                <p className="text-sm text-gray-500">{sk.beschreibung}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Die <strong>Steuerklasse beeinflusst nur den monatlichen Lohnsteuerabzug</strong> – nicht die jährliche Steuerlast</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Bei Zusammenveranlagung wird die <strong>tatsächliche Steuer über die Steuererklärung</strong> berechnet</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Steuerklassenwechsel</strong> ist mehrmals pro Jahr möglich (seit 2020 unbegrenzt)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Die Steuerklasse <strong>beeinflusst Lohnersatzleistungen</strong> (Elterngeld, Krankengeld, ALG I)</span>
          </li>
          <li className="flex gap-2">
            <span>⚠️</span>
            <span>Vor Elterngeld/Krankengeld: Steuerklasse <strong>rechtzeitig wechseln</strong> (mind. 6-12 Monate vorher)</span>
          </li>
          <li className="flex gap-2">
            <span>ℹ️</span>
            <span>Ab 2030 wird das <strong>Faktorverfahren</strong> für alle Ehepaare Pflicht (Reform geplant)</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörden */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden & Antrag</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Finanzamt</p>
              <p className="text-gray-500">Steuerklassenwechsel beantragen</p>
              <a 
                href="https://www.elster.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Online via ELSTER →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📝</span>
            <div>
              <p className="font-medium text-gray-800">Antrag auf Steuerklassenwechsel</p>
              <p className="text-gray-500">Formular &quot;Erklärung zum Steuerklassenwechsel&quot;</p>
              <a 
                href="https://www.formulare-bfinv.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Formulare-BFinV →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Bürgertelefon BMF</p>
              <p className="text-gray-500">Allgemeine Steuerfragen</p>
              <a 
                href="tel:03018-333-0"
                className="text-blue-600 hover:underline"
              >
                030 18 333-0 →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🧮</span>
            <div>
              <p className="font-medium text-gray-800">Offizieller BMF-Rechner</p>
              <p className="text-gray-500">Exakte Lohnsteuerberechnung</p>
              <a 
                href="https://www.bmf-steuerrechner.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                bmf-steuerrechner.de →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen (Stand: {STEUERJAHR})</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §32a EStG – Einkommensteuertarif – Gesetze im Internet
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__38b.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §38b EStG – Einbehaltung der Lohnsteuer
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__39.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §39 EStG – Lohnsteuerabzugsmerkmale
          </a>
          <a 
            href="https://lsth.bundesfinanzministerium.de/lsth/2025/A-Einkommensteuergesetz/IV-Tarif-31-34b/Paragraf-32a/inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Amtliches Lohnsteuer-Handbuch {STEUERJAHR} – BMF
          </a>
          <a 
            href="https://www.bmf-steuerrechner.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Offizieller Lohnsteuerrechner
          </a>
          <a 
            href="https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2025"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Einkommensteuer-Formeln {STEUERJAHR} – Finanz-Tools.de
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Content/DE/FAQ/Steuern/Lohnsteuer/lohnsteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – FAQ Lohnsteuer & Steuerklassen
          </a>
          <a 
            href="https://www.finanztip.de/steuerklassen/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Finanztip – Steuerklassen-Ratgeber
          </a>
        </div>
      </div>
    </div>
  );
}
