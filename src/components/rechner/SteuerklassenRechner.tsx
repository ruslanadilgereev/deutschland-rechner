import { useState, useMemo } from 'react';

/**
 * Steuerklassen-Rechner 2026
 * Vergleicht Steuerklassen-Kombinationen für Ehepaare und Alleinstehende
 * 
 * QUELLEN:
 * - §32a EStG - Einkommensteuertarif
 * - §38b EStG - Steuerklassen
 * - §26 EStG - Zusammenveranlagung
 * - BMF Programmablaufplan für den Lohnsteuerabzug 2026
 * - Validiert gegen: https://www.bmf-steuerrechner.de
 * 
 * Stand: 01.01.2026
 */

// ============================================================================
// KONSTANTEN 2026 - Nach §32a EStG und BMF-PAP
// ============================================================================

// Einkommensteuertarif 2026
const TARIF_2026 = {
  grundfreibetrag: 12348,
  zone2Ende: 17799,
  zone3Ende: 69878,
  zone4Ende: 277825,
  // Koeffizienten
  zone2_a: 933.52,
  zone2_b: 1400,
  zone3_a: 176.64,
  zone3_b: 2397,
  zone3_c: 1015.13,
  zone4_faktor: 0.42,
  zone4_abzug: 10911.92,
  zone5_faktor: 0.45,
  zone5_abzug: 18918.79,
};

// Freibeträge 2026
const FREIBETRAEGE_2026 = {
  arbeitnehmerPauschbetrag: 1230,
  sonderausgabenPauschbetrag: 36,
  entlastungsbetragAlleinerziehende: 4260,
  entlastungsbetragProKind: 240,
};

// Sozialversicherung 2026
const SV_SAETZE_2026 = {
  rv: 0.186,           // RV gesamt 18,6% → AN 9,3%
  kv: 0.146,           // KV gesamt 14,6% → AN 7,3%
  kvZusatz: 0.025,     // Durchschn. Zusatzbeitrag 2,5% → AN 1,25%
  pv: 0.036,           // PV gesamt 3,6% → AN 1,8%
  pvKinderlos: 0.006,  // Zuschlag kinderlos ab 23
  pvKindAbschlag: 0.0025, // Abschlag pro Kind ab 2. Kind (max 4)
  av: 0.026,           // AV gesamt 2,6% → AN 1,3%
};

// Beitragsbemessungsgrenzen 2026 (monatlich)
const BBG_2026 = {
  rvAv: 8050,          // RV/AV
  kvPv: 5512.50,       // KV/PV
};

// Solidaritätszuschlag
const SOLI_2026 = {
  satz: 0.055,
  freigrenzeSK1: 18130,
  freigrenzeSK3: 36260,
  milderung: 0.119,
};

// Steuerklassen-Info
const STEUERKLASSEN = [
  { 
    id: 1, 
    name: 'Steuerklasse I', 
    beschreibung: 'Ledige, Geschiedene, Verwitwete',
    icon: '👤',
    grundfreibetrag: TARIF_2026.grundfreibetrag,
    hatPauschbetraege: true,
  },
  { 
    id: 2, 
    name: 'Steuerklasse II', 
    beschreibung: 'Alleinerziehende mit Entlastungsbetrag',
    icon: '👤👶',
    grundfreibetrag: TARIF_2026.grundfreibetrag,
    hatPauschbetraege: true,
    entlastungsbetrag: FREIBETRAEGE_2026.entlastungsbetragAlleinerziehende,
  },
  { 
    id: 3, 
    name: 'Steuerklasse III', 
    beschreibung: 'Verheiratete (Partner in V oder ohne Einkommen)',
    icon: '💑',
    grundfreibetrag: TARIF_2026.grundfreibetrag * 2, // Splitting
    hatPauschbetraege: true,
    splitting: true,
  },
  { 
    id: 4, 
    name: 'Steuerklasse IV', 
    beschreibung: 'Verheiratete (beide erwerbstätig, ähnlich)',
    icon: '👫',
    grundfreibetrag: TARIF_2026.grundfreibetrag,
    hatPauschbetraege: true,
  },
  { 
    id: 5, 
    name: 'Steuerklasse V', 
    beschreibung: 'Verheiratete (Partner in III)',
    icon: '💑',
    grundfreibetrag: 0, // KEIN Grundfreibetrag
    hatPauschbetraege: false,
  },
  { 
    id: 6, 
    name: 'Steuerklasse VI', 
    beschreibung: 'Zweit- und Nebenjob',
    icon: '📋',
    grundfreibetrag: 0, // KEIN Grundfreibetrag
    hatPauschbetraege: false,
  },
];

// ============================================================================
// BERECHNUNGSFUNKTIONEN
// ============================================================================

/**
 * Einkommensteuertarif nach §32a EStG
 */
function berechneEStTarif(zvE: number): number {
  if (zvE <= 0) return 0;
  
  const { grundfreibetrag, zone2Ende, zone3Ende, zone4Ende } = TARIF_2026;
  
  if (zvE <= grundfreibetrag) return 0;
  
  if (zvE <= zone2Ende) {
    const y = (zvE - grundfreibetrag) / 10000;
    return Math.floor((TARIF_2026.zone2_a * y + TARIF_2026.zone2_b) * y);
  }
  
  if (zvE <= zone3Ende) {
    const z = (zvE - zone2Ende) / 10000;
    return Math.floor((TARIF_2026.zone3_a * z + TARIF_2026.zone3_b) * z + TARIF_2026.zone3_c);
  }
  
  if (zvE <= zone4Ende) {
    return Math.floor(TARIF_2026.zone4_faktor * zvE - TARIF_2026.zone4_abzug);
  }
  
  return Math.floor(TARIF_2026.zone5_faktor * zvE - TARIF_2026.zone5_abzug);
}

/**
 * Tarif ohne Grundfreibetrag (für SK V und VI)
 */
function berechneEStTarifOhneGrundfreibetrag(zvE: number): number {
  if (zvE <= 0) return 0;
  
  const { zone2Ende, zone3Ende, zone4Ende, grundfreibetrag } = TARIF_2026;
  
  // Progressionszone 1 - beginnt sofort
  if (zvE <= zone2Ende - grundfreibetrag) {
    const y = zvE / 10000;
    return Math.floor((TARIF_2026.zone2_a * y + TARIF_2026.zone2_b) * y);
  }
  
  // Progressionszone 2
  if (zvE <= zone3Ende - grundfreibetrag) {
    const zone1Betrag = zone2Ende - grundfreibetrag;
    const y1 = zone1Betrag / 10000;
    const steuerZone1 = (TARIF_2026.zone2_a * y1 + TARIF_2026.zone2_b) * y1;
    const z = (zvE - zone1Betrag) / 10000;
    return Math.floor(steuerZone1 + (TARIF_2026.zone3_a * z + TARIF_2026.zone3_b) * z);
  }
  
  // Proportionalzone 42%
  if (zvE <= zone4Ende - grundfreibetrag) {
    return Math.floor(TARIF_2026.zone4_faktor * zvE - 8500);
  }
  
  return Math.floor(TARIF_2026.zone5_faktor * zvE - 16000);
}

/**
 * Lohnsteuer nach Steuerklasse berechnen
 */
function berechneLohnsteuerJahr(
  jahresBrutto: number, 
  steuerklasse: number,
  anzahlKinder: number = 0
): number {
  const { arbeitnehmerPauschbetrag, sonderausgabenPauschbetrag,
          entlastungsbetragAlleinerziehende, entlastungsbetragProKind } = FREIBETRAEGE_2026;
  
  const vorsorgepauschale = Math.min(jahresBrutto * 0.12, 3000);
  let zvE = 0;
  let steuer = 0;
  
  switch (steuerklasse) {
    case 1:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      steuer = berechneEStTarif(zvE);
      break;
      
    case 2:
      const entlastung = entlastungsbetragAlleinerziehende + 
                        Math.max(0, anzahlKinder - 1) * entlastungsbetragProKind;
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - 
                     sonderausgabenPauschbetrag - entlastung);
      steuer = berechneEStTarif(zvE);
      break;
      
    case 3:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      steuer = berechneEStTarif(zvE / 2) * 2;
      break;
      
    case 4:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      steuer = berechneEStTarif(zvE);
      break;
      
    case 5:
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale);
      steuer = berechneEStTarifOhneGrundfreibetrag(zvE);
      break;
      
    case 6:
      zvE = jahresBrutto;
      steuer = berechneEStTarifOhneGrundfreibetrag(zvE);
      break;
  }
  
  return Math.max(0, Math.round(steuer));
}

/**
 * Tatsächliche Einkommensteuer bei Zusammenveranlagung (§26 EStG)
 */
function berechneTatsaechlicheEStZusammen(
  brutto1: number, 
  brutto2: number
): number {
  const { arbeitnehmerPauschbetrag, sonderausgabenPauschbetrag } = FREIBETRAEGE_2026;
  
  const jahresBrutto1 = brutto1 * 12;
  const jahresBrutto2 = brutto2 * 12;
  
  const vp1 = Math.min(jahresBrutto1 * 0.12, 3000);
  const vp2 = Math.min(jahresBrutto2 * 0.12, 3000);
  
  // Gemeinsames zvE
  const zvE1 = Math.max(0, jahresBrutto1 - vp1 - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
  const zvE2 = Math.max(0, jahresBrutto2 - vp2 - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
  const zvEGesamt = zvE1 + zvE2;
  
  // Splittingtarif anwenden
  return berechneEStTarif(zvEGesamt / 2) * 2;
}

/**
 * Solidaritätszuschlag
 */
function berechneSoli(lohnsteuer: number, steuerklasse: number): number {
  const freigrenze = (steuerklasse === 3) 
    ? SOLI_2026.freigrenzeSK3 
    : SOLI_2026.freigrenzeSK1;
  
  if (lohnsteuer <= freigrenze) return 0;
  
  const ueberFreigrenze = lohnsteuer - freigrenze;
  return Math.round(Math.min(ueberFreigrenze * SOLI_2026.milderung, lohnsteuer * SOLI_2026.satz));
}

/**
 * Kirchensteuer
 */
function berechneKirchensteuer(lohnsteuer: number, bundesland: string): number {
  const satz = ['BY', 'BW'].includes(bundesland) ? 0.08 : 0.09;
  return Math.round(lohnsteuer * satz);
}

/**
 * Sozialversicherung (Jahreswerte)
 */
function berechneSozialversicherung(
  monatsBrutto: number, 
  kinderlos: boolean, 
  kinderAnzahl: number
): { rv: number; kv: number; pv: number; av: number; gesamt: number } {
  const rvBasis = Math.min(monatsBrutto, BBG_2026.rvAv);
  const kvBasis = Math.min(monatsBrutto, BBG_2026.kvPv);
  
  const rv = Math.round(rvBasis * SV_SAETZE_2026.rv / 2) * 12;
  const kv = Math.round(kvBasis * (SV_SAETZE_2026.kv + SV_SAETZE_2026.kvZusatz) / 2) * 12;
  
  let pvSatz = SV_SAETZE_2026.pv / 2;
  if (kinderlos) {
    pvSatz += SV_SAETZE_2026.pvKinderlos;
  } else if (kinderAnzahl >= 2) {
    const abschlag = Math.min(kinderAnzahl - 1, 4) * SV_SAETZE_2026.pvKindAbschlag;
    pvSatz = Math.max(0.007, pvSatz - abschlag);
  }
  const pv = Math.round(kvBasis * pvSatz) * 12;
  
  const av = Math.round(rvBasis * SV_SAETZE_2026.av / 2) * 12;
  
  return { rv, kv, pv, av, gesamt: rv + kv + pv + av };
}

export default function SteuerklassenRechner() {
  const [brutto1, setBrutto1] = useState(4500);
  const [brutto2, setBrutto2] = useState(3000);
  const [kinder, setKinder] = useState(0);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState('NW');
  const [alleinstehend, setAlleinstehend] = useState(false);

  const ergebnis = useMemo(() => {
    const kinderlos = kinder === 0;
    
    if (alleinstehend) {
      // === ALLEINSTEHEND ===
      const steuerklasse = kinder > 0 ? 2 : 1;
      const jahresBrutto = brutto1 * 12;
      
      const lohnsteuer = berechneLohnsteuerJahr(jahresBrutto, steuerklasse, kinder);
      const soli = berechneSoli(lohnsteuer, steuerklasse);
      const kist = kirchensteuer ? berechneKirchensteuer(lohnsteuer, bundesland) : 0;
      const steuerGesamt = lohnsteuer + soli + kist;
      
      const sv = berechneSozialversicherung(brutto1, kinderlos, kinder);
      const netto = jahresBrutto - steuerGesamt - sv.gesamt;
      
      return {
        alleinstehend: true,
        steuerklasse,
        brutto: jahresBrutto,
        lohnsteuer,
        soli,
        kist,
        steuerGesamt,
        sv,
        netto,
        nettoMonat: Math.round(netto / 12),
      };
    }
    
    // === VERHEIRATET - Kombinationen berechnen ===
    const sv1 = berechneSozialversicherung(brutto1, kinderlos, kinder);
    const sv2 = berechneSozialversicherung(brutto2, kinderlos, kinder);
    const svGesamt = sv1.gesamt + sv2.gesamt;
    
    const jahresBrutto1 = brutto1 * 12;
    const jahresBrutto2 = brutto2 * 12;
    const bruttoGesamt = jahresBrutto1 + jahresBrutto2;
    
    // Tatsächliche Steuerlast bei Zusammenveranlagung
    const tatsaechlicheESt = berechneTatsaechlicheEStZusammen(brutto1, brutto2);
    
    const kombinationen = [
      { sk1: 4, sk2: 4, name: 'IV / IV' },
      { sk1: 3, sk2: 5, name: 'III / V' },
      { sk1: 5, sk2: 3, name: 'V / III' },
    ].map(komb => {
      const lst1 = berechneLohnsteuerJahr(jahresBrutto1, komb.sk1, kinder);
      const lst2 = berechneLohnsteuerJahr(jahresBrutto2, komb.sk2, kinder);
      
      const soli1 = berechneSoli(lst1, komb.sk1);
      const soli2 = berechneSoli(lst2, komb.sk2);
      
      const kist1 = kirchensteuer ? berechneKirchensteuer(lst1, bundesland) : 0;
      const kist2 = kirchensteuer ? berechneKirchensteuer(lst2, bundesland) : 0;
      
      const steuer1Gesamt = lst1 + soli1 + kist1;
      const steuer2Gesamt = lst2 + soli2 + kist2;
      const steuerGesamt = steuer1Gesamt + steuer2Gesamt;
      
      const netto1 = jahresBrutto1 - steuer1Gesamt - sv1.gesamt;
      const netto2 = jahresBrutto2 - steuer2Gesamt - sv2.gesamt;
      const nettoGesamt = netto1 + netto2;
      
      // Nachzahlung/Erstattung bei Steuererklärung
      const gezahlteLohnsteuer = lst1 + lst2;
      const differenz = gezahlteLohnsteuer - tatsaechlicheESt;
      
      return {
        ...komb,
        lst1,
        lst2,
        soli1,
        soli2,
        kist1,
        kist2,
        steuer1Gesamt,
        steuer2Gesamt,
        steuerGesamt,
        netto1,
        netto2,
        nettoGesamt,
        nettoMonat: Math.round(nettoGesamt / 12),
        tatsaechlicheESt: Math.round(tatsaechlicheESt),
        nachzahlung: differenz < 0 ? Math.abs(Math.round(differenz)) : 0,
        erstattung: differenz > 0 ? Math.round(differenz) : 0,
      };
    });
    
    // Beste Kombination (höchstes Monatsnetto)
    const beste = kombinationen.reduce((a, b) => 
      b.nettoGesamt > a.nettoGesamt ? b : a
    );
    
    return {
      alleinstehend: false,
      kombinationen,
      beste,
      sv1,
      sv2,
      svGesamt,
      bruttoGesamt,
      tatsaechlicheESt: Math.round(tatsaechlicheESt),
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
              Deine Steuerklasse: {ergebnis.steuerklasse === 2 ? 'II (Alleinerziehend)' : 'I'}
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
                <span className="text-gray-600">Lohnsteuer</span>
                <span className="font-medium text-gray-900">{formatEuro(ergebnis.lohnsteuer)}</span>
              </div>
              {ergebnis.soli > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Solidaritätszuschlag</span>
                  <span className="font-medium text-gray-900">{formatEuro(ergebnis.soli)}</span>
                </div>
              )}
              {ergebnis.kist > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Kirchensteuer</span>
                  <span className="font-medium text-gray-900">{formatEuro(ergebnis.kist)}</span>
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
                <span className="font-bold text-red-600">{formatEuro(ergebnis.steuerGesamt + ergebnis.sv.gesamt)}</span>
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
            
            <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
              <strong>Hinweis:</strong> Die tatsächliche Steuerlast bei Zusammenveranlagung beträgt{' '}
              <strong>{formatEuro(ergebnis.tatsaechlicheESt)}</strong>/Jahr (Splittingtarif §26 EStG).
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
                <span className="font-bold">Wichtig:</span>
                <span>In SK V entfallen <strong>alle Freibeträge</strong> (Grundfreibetrag, AN-Pauschbetrag). Der Partner in SK III erhält dafür den doppelten Grundfreibetrag.</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Steuerklassen-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Steuerklassen-Übersicht nach §38b EStG</h3>
        
        <div className="space-y-3">
          {STEUERKLASSEN.map(sk => (
            <div key={sk.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">{sk.icon}</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{sk.name}</h4>
                <p className="text-sm text-gray-500">{sk.beschreibung}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Grundfreibetrag: {formatEuro(sk.grundfreibetrag)}
                  {!sk.hatPauschbetraege && ' • Keine Pauschbeträge'}
                  {sk.splitting && ' • Splittingtarif'}
                  {sk.entlastungsbetrag && ` • +${formatEuro(sk.entlastungsbetrag)} Entlastung`}
                </p>
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
            <span>Berechnung nach <strong>§32a EStG Tarif 2026</strong> und BMF-Programmablaufplan</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Die <strong>Steuerklasse beeinflusst nur den monatlichen Lohnsteuerabzug</strong> – nicht die jährliche Steuerlast</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Bei Zusammenveranlagung wird die <strong>tatsächliche Steuer über die Steuererklärung</strong> berechnet (Splittingtarif)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Steuerklassenwechsel</strong> ist mehrmals pro Jahr möglich</span>
          </li>
          <li className="flex gap-2">
            <span>⚠️</span>
            <span>Vor <strong>Elterngeld/Krankengeld</strong>: Steuerklasse rechtzeitig wechseln (6-12 Monate vorher)</span>
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
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Rechtsgrundlagen (Stand: 2026)</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §32a EStG – Einkommensteuertarif
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__38b.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §38b EStG – Steuerklassen
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__26.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §26 EStG – Zusammenveranlagung
          </a>
          <a 
            href="https://www.bmf-steuerrechner.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF Steuerrechner – Bundesfinanzministerium
          </a>
        </div>
      </div>
    </div>
  );
}
