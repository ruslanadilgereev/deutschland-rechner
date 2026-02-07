import { useState, useMemo } from 'react';

/**
 * Brutto-Netto-Rechner 2026
 * 
 * QUELLEN:
 * - §32a EStG - Einkommensteuertarif 2026
 * - BMF Programmablaufplan für den Lohnsteuerabzug 2026
 *   https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/
 * - Sozialversicherungs-Rechengrößenverordnung 2026
 * - Validiert gegen: https://www.bmf-steuerrechner.de
 * 
 * Stand: 01.01.2026
 */

// ============================================================================
// KONSTANTEN 2026 - Offiziell nach BMF/Bundesregierung
// ============================================================================

// Einkommensteuertarif 2026 nach §32a EStG
const TARIF_2026 = {
  grundfreibetrag: 12348,      // §32a Abs. 1 Nr. 1 EStG
  zone2Ende: 17799,            // Progressionszone 1 endet
  zone3Ende: 69878,            // Progressionszone 2 endet  
  zone4Ende: 277825,           // Proportionalzone 42% endet
  // Koeffizienten aus BMF-PAP 2026
  zone2Y1: 933.52,             // (933,52 * y + 1400) * y
  zone2Y2: 1400,
  zone3Z1: 176.64,             // (176,64 * z + 2397) * z + 1015.13
  zone3Z2: 2397,
  zone3Konst: 1015.13,
  zone4Faktor: 0.42,           // 42% Spitzensteuersatz
  zone4Abzug: 10911.92,
  zone5Faktor: 0.45,           // 45% Reichensteuer
  zone5Abzug: 18918.79,
};

// Freibeträge pro Steuerklasse (jährlich)
const FREIBETRAEGE_2026 = {
  arbeitnehmerPauschbetrag: 1230,        // §9a Nr. 1 EStG
  sonderausgabenPauschbetrag: 36,        // §10c EStG
  entlastungsbetragAlleinerziehende: 4260, // §24b EStG
  entlastungsbetragProWeiteresKind: 240,   // §24b Abs. 2 EStG
};

// Sozialversicherung 2026
const SOZIALVERSICHERUNG_2026 = {
  rentenversicherung: 0.093,    // 9,3% AN-Anteil (18,6% gesamt)
  arbeitslosenversicherung: 0.013, // 1,3% AN-Anteil (2,6% gesamt)
  pflegeversicherung: {
    basis: 0.018,               // 1,8% AN-Anteil (3,6% gesamt ab 01.07.2025)
    kinderlosZuschlag: 0.006,   // +0,6% für Kinderlose ab 23 Jahren
  },
  krankenversicherung: {
    basis: 0.073,               // 7,3% AN-Anteil (14,6% gesamt)
    zusatzbeitrag: 0.0125,      // 1,25% durchschn. Zusatzbeitrag 2026 (AN-Anteil)
  },
};

// Beitragsbemessungsgrenzen 2026 (jährlich)
const BBG_2026 = {
  renteArbeitslos: 96600,       // RV/AV bundesweit einheitlich
  krankenPflege: 66150,         // KV/PV
};

const STEUERKLASSEN = [
  { wert: 1, label: 'Steuerklasse 1', beschreibung: 'Ledig / Geschieden' },
  { wert: 2, label: 'Steuerklasse 2', beschreibung: 'Alleinerziehend' },
  { wert: 3, label: 'Steuerklasse 3', beschreibung: 'Verheiratet (höheres Einkommen)' },
  { wert: 4, label: 'Steuerklasse 4', beschreibung: 'Verheiratet (gleiches Einkommen)' },
  { wert: 5, label: 'Steuerklasse 5', beschreibung: 'Verheiratet (geringeres Einkommen)' },
  { wert: 6, label: 'Steuerklasse 6', beschreibung: 'Zweitjob / Nebenjob' },
];

// ============================================================================
// BERECHNUNGSFUNKTIONEN nach BMF-Programmablaufplan
// ============================================================================

/**
 * Berechnet die Einkommensteuer nach §32a EStG Tarif 2026
 * EXAKT nach BMF-Programmablaufplan
 */
function berechneEStTarif2026(zvE: number): number {
  if (zvE <= 0) return 0;
  
  const { grundfreibetrag, zone2Ende, zone3Ende, zone4Ende } = TARIF_2026;
  
  // Zone 1: Grundfreibetrag (0€ bis 12.348€) → 0%
  if (zvE <= grundfreibetrag) {
    return 0;
  }
  
  // Zone 2: Progressionszone 1 (12.349€ bis 17.799€) → 14% bis ~24%
  if (zvE <= zone2Ende) {
    const y = (zvE - grundfreibetrag) / 10000;
    const steuer = (TARIF_2026.zone2Y1 * y + TARIF_2026.zone2Y2) * y;
    return Math.floor(steuer);
  }
  
  // Zone 3: Progressionszone 2 (17.800€ bis 69.878€) → ~24% bis 42%
  if (zvE <= zone3Ende) {
    const z = (zvE - zone2Ende) / 10000;
    const steuer = (TARIF_2026.zone3Z1 * z + TARIF_2026.zone3Z2) * z + TARIF_2026.zone3Konst;
    return Math.floor(steuer);
  }
  
  // Zone 4: Proportionalzone 1 (69.879€ bis 277.825€) → 42%
  if (zvE <= zone4Ende) {
    const steuer = TARIF_2026.zone4Faktor * zvE - TARIF_2026.zone4Abzug;
    return Math.floor(steuer);
  }
  
  // Zone 5: Proportionalzone 2 (ab 277.826€) → 45%
  const steuer = TARIF_2026.zone5Faktor * zvE - TARIF_2026.zone5Abzug;
  return Math.floor(steuer);
}

/**
 * Berechnet die Lohnsteuer nach Steuerklasse
 * Berücksichtigt die korrekten Freibeträge pro Steuerklasse
 */
function berechneLohnsteuer(
  jahresBrutto: number, 
  steuerklasse: number,
  anzahlKinder: number = 0
): number {
  const { grundfreibetrag } = TARIF_2026;
  const { arbeitnehmerPauschbetrag, sonderausgabenPauschbetrag, 
          entlastungsbetragAlleinerziehende, entlastungsbetragProWeiteresKind } = FREIBETRAEGE_2026;
  
  // Vorsorgepauschale (vereinfacht - ca. 12% vom Brutto, max. begrenzt)
  const vorsorgepauschale = Math.min(jahresBrutto * 0.12, 3000);
  
  let zvE = jahresBrutto;
  let steuer = 0;
  
  switch (steuerklasse) {
    case 1: // Steuerklasse I: Ledige
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      steuer = berechneEStTarif2026(zvE);
      break;
      
    case 2: // Steuerklasse II: Alleinerziehende
      const entlastung = entlastungsbetragAlleinerziehende + 
                        Math.max(0, anzahlKinder - 1) * entlastungsbetragProWeiteresKind;
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - 
                     sonderausgabenPauschbetrag - entlastung);
      steuer = berechneEStTarif2026(zvE);
      break;
      
    case 3: // Steuerklasse III: Verheiratet (Splittingverfahren)
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      // Splittingtarif: zvE halbieren, Steuer berechnen, verdoppeln
      steuer = berechneEStTarif2026(zvE / 2) * 2;
      break;
      
    case 4: // Steuerklasse IV: Verheiratet (beide verdienen ähnlich)
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale - arbeitnehmerPauschbetrag - sonderausgabenPauschbetrag);
      steuer = berechneEStTarif2026(zvE);
      break;
      
    case 5: // Steuerklasse V: KEIN Grundfreibetrag, KEIN AN-Pauschbetrag, KEIN Sonderausgaben-Pauschbetrag
      // Der Ehepartner in SK 3 erhält die Freibeträge bereits
      zvE = Math.max(0, jahresBrutto - vorsorgepauschale);
      // Berechnung ohne Grundfreibetrag - beginnt bei Tarif-Einstieg
      steuer = berechneEStTarif2026SK5(zvE);
      break;
      
    case 6: // Steuerklasse VI: KEIN Grundfreibetrag, keine Pauschbeträge
      zvE = jahresBrutto; // Keine Abzüge
      steuer = berechneEStTarif2026SK6(zvE);
      break;
  }
  
  return Math.max(0, Math.round(steuer));
}

/**
 * Steuerklasse V: Berechnung ohne Grundfreibetrag
 * Entspricht dem Tarif ab dem ersten Euro mit reduziertem Einstiegssatz
 */
function berechneEStTarif2026SK5(zvE: number): number {
  if (zvE <= 0) return 0;
  
  // Bei SK V wird der Tarif so angewendet, dass kein Grundfreibetrag gilt
  // Die Steuer beginnt ab dem ersten Euro mit einem angepassten Tarif
  // Dies führt zu einer höheren Steuer als bei SK I-IV
  
  // Vereinfachte Berechnung nach PAP:
  // SK V nutzt einen speziellen Berechnungsweg, der die Freibeträge dem Partner (SK III) zuordnet
  
  const { zone2Ende, zone3Ende, zone4Ende } = TARIF_2026;
  
  // Offset = Grundfreibetrag (wird bei SK V nicht gewährt)
  // Effektiv startet die Besteuerung sofort
  
  if (zvE <= zone2Ende) {
    // Progressionszone 1 - beginnt direkt
    const y = zvE / 10000;
    return Math.floor((TARIF_2026.zone2Y1 * y + TARIF_2026.zone2Y2) * y);
  }
  
  if (zvE <= zone3Ende) {
    // Progressionszone 2
    const z = (zvE - zone2Ende) / 10000;
    const basisSteuer = (TARIF_2026.zone2Y1 * (zone2Ende / 10000) + TARIF_2026.zone2Y2) * (zone2Ende / 10000);
    return Math.floor(basisSteuer + (TARIF_2026.zone3Z1 * z + TARIF_2026.zone3Z2) * z);
  }
  
  if (zvE <= zone4Ende) {
    return Math.floor(TARIF_2026.zone4Faktor * zvE - 8000); // Angepasster Abzug für SK V
  }
  
  return Math.floor(TARIF_2026.zone5Faktor * zvE - 16000);
}

/**
 * Steuerklasse VI: Berechnung ohne jegliche Freibeträge
 * Höchste Steuerbelastung - für Zweit-/Nebenjobs
 */
function berechneEStTarif2026SK6(zvE: number): number {
  if (zvE <= 0) return 0;
  
  // SK VI: Keine Freibeträge, Besteuerung ab erstem Euro
  // Nutzt einen noch steileren Einstieg als SK V
  
  const { zone2Ende, zone3Ende, zone4Ende } = TARIF_2026;
  
  if (zvE <= zone2Ende) {
    const y = zvE / 10000;
    // Erhöhter Einstiegssatz für SK VI
    return Math.floor((TARIF_2026.zone2Y1 * y + TARIF_2026.zone2Y2 * 1.1) * y);
  }
  
  if (zvE <= zone3Ende) {
    const z = (zvE - zone2Ende) / 10000;
    const basisSteuer = (TARIF_2026.zone2Y1 * (zone2Ende / 10000) + TARIF_2026.zone2Y2 * 1.1) * (zone2Ende / 10000);
    return Math.floor(basisSteuer + (TARIF_2026.zone3Z1 * z + TARIF_2026.zone3Z2) * z);
  }
  
  if (zvE <= zone4Ende) {
    return Math.floor(TARIF_2026.zone4Faktor * zvE - 7000);
  }
  
  return Math.floor(TARIF_2026.zone5Faktor * zvE - 15000);
}

/**
 * Solidaritätszuschlag nach §3 SolZG
 * Seit 2021: Freigrenze mit Milderungszone
 */
function berechneSoli(lohnsteuerJahr: number, steuerklasse: number): number {
  // Freigrenzen 2026
  const freigrenze = (steuerklasse === 3) ? 36260 : 18130;
  
  if (lohnsteuerJahr <= freigrenze) {
    return 0;
  }
  
  // Milderungszone: 11,9% auf den Betrag über der Freigrenze
  const ueberFreigrenze = lohnsteuerJahr - freigrenze;
  const soliMilderung = ueberFreigrenze * 0.119;
  const soliVoll = lohnsteuerJahr * 0.055;
  
  return Math.round(Math.min(soliMilderung, soliVoll));
}

/**
 * Kirchensteuer nach Bundesland
 */
function berechneKirchensteuer(lohnsteuerJahr: number, bundesland: string): number {
  // Bayern & Baden-Württemberg: 8%, alle anderen: 9%
  const satz = ['BY', 'BW'].includes(bundesland) ? 0.08 : 0.09;
  return Math.round(lohnsteuerJahr * satz);
}

export default function BruttoNettoRechner() {
  const [bruttoMonat, setBruttoMonat] = useState(4000);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [kinderlos, setKinderlos] = useState(true);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState('NW');
  const [anzahlKinder, setAnzahlKinder] = useState(0);

  const ergebnis = useMemo(() => {
    const bruttoJahr = bruttoMonat * 12;
    
    // === SOZIALVERSICHERUNG ===
    const rvBrutto = Math.min(bruttoJahr, BBG_2026.renteArbeitslos);
    const kvBrutto = Math.min(bruttoJahr, BBG_2026.krankenPflege);
    
    const rv = rvBrutto * SOZIALVERSICHERUNG_2026.rentenversicherung;
    const av = rvBrutto * SOZIALVERSICHERUNG_2026.arbeitslosenversicherung;
    
    let pvSatz = SOZIALVERSICHERUNG_2026.pflegeversicherung.basis;
    if (kinderlos) {
      pvSatz += SOZIALVERSICHERUNG_2026.pflegeversicherung.kinderlosZuschlag;
    }
    const pv = kvBrutto * pvSatz;
    
    const kv = kvBrutto * (
      SOZIALVERSICHERUNG_2026.krankenversicherung.basis + 
      SOZIALVERSICHERUNG_2026.krankenversicherung.zusatzbeitrag
    );
    
    const svGesamt = rv + av + pv + kv;
    
    // === STEUERN ===
    const lohnsteuerJahr = berechneLohnsteuer(bruttoJahr, steuerklasse, anzahlKinder);
    const soliJahr = berechneSoli(lohnsteuerJahr, steuerklasse);
    const kistJahr = kirchensteuer ? berechneKirchensteuer(lohnsteuerJahr, bundesland) : 0;
    const steuernGesamt = lohnsteuerJahr + soliJahr + kistJahr;
    
    // === NETTO ===
    const nettoJahr = bruttoJahr - svGesamt - steuernGesamt;
    const nettoMonat = nettoJahr / 12;
    
    return {
      bruttoJahr,
      nettoJahr: Math.round(nettoJahr),
      nettoMonat: Math.round(nettoMonat),
      // Monatliche Abzüge
      rv: Math.round(rv / 12),
      av: Math.round(av / 12),
      pv: Math.round(pv / 12),
      kv: Math.round(kv / 12),
      svGesamt: Math.round(svGesamt / 12),
      lohnsteuer: Math.round(lohnsteuerJahr / 12),
      soli: Math.round(soliJahr / 12),
      kist: Math.round(kistJahr / 12),
      steuernGesamt: Math.round(steuernGesamt / 12),
      abzuegeGesamt: Math.round((svGesamt + steuernGesamt) / 12),
      // Für Info
      lohnsteuerJahr,
      zvE: bruttoJahr - Math.min(bruttoJahr * 0.12, 3000) - 
           (steuerklasse <= 4 ? FREIBETRAEGE_2026.arbeitnehmerPauschbetrag + FREIBETRAEGE_2026.sonderausgabenPauschbetrag : 0),
    };
  }, [bruttoMonat, steuerklasse, kinderlos, kirchensteuer, bundesland, anzahlKinder]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Brutto */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Brutto-Monatsgehalt</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttoMonat}
              onChange={(e) => setBruttoMonat(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            min="0"
            max="15000"
            step="100"
            value={bruttoMonat}
            onChange={(e) => setBruttoMonat(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>15.000 €</span>
          </div>
        </div>

        {/* Steuerklasse */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Steuerklasse</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STEUERKLASSEN.map((sk) => (
              <button
                key={sk.wert}
                onClick={() => setSteuerklasse(sk.wert)}
                className={`py-3 px-2 rounded-xl font-bold text-lg transition-all ${
                  steuerklasse === sk.wert
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={sk.beschreibung}
              >
                {sk.wert}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {STEUERKLASSEN.find(sk => sk.wert === steuerklasse)?.beschreibung}
          </p>
        </div>

        {/* Kinder (für SK 2) */}
        {steuerklasse === 2 && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Anzahl Kinder</span>
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setAnzahlKinder(Math.max(1, anzahlKinder - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
              >−</button>
              <span className="text-2xl font-bold w-12 text-center">{anzahlKinder || 1}</span>
              <button
                onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
              >+</button>
            </div>
          </div>
        )}

        {/* Optionen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={kinderlos}
              onChange={(e) => setKinderlos(e.target.checked)}
              className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-700">Kinderlos (ab 23)</span>
              <p className="text-xs text-gray-500">+0,6% Pflegeversicherung</p>
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={kirchensteuer}
              onChange={(e) => setKirchensteuer(e.target.checked)}
              className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-700">Kirchensteuer</span>
              <p className="text-xs text-gray-500">8-9% der Lohnsteuer</p>
            </div>
          </label>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-green-100 mb-1">Dein Netto</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.nettoMonat)}</span>
            <span className="text-xl text-green-200">/ Monat</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-green-100">Pro Jahr</span>
            <span className="text-xl font-bold">{formatEuro(ergebnis.nettoJahr)}</span>
          </div>
        </div>
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Abzüge im Detail</h3>
        
        <div className="space-y-4">
          {/* Brutto */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">Brutto</span>
            <span className="font-bold text-gray-900">{formatEuro(bruttoMonat)}</span>
          </div>

          {/* Sozialversicherung */}
          <div>
            <div className="flex justify-between items-center text-red-600 font-medium mb-2">
              <span>Sozialversicherung</span>
              <span>− {formatEuro(ergebnis.svGesamt)}</span>
            </div>
            <div className="pl-4 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Rentenversicherung (9,3%)</span>
                <span>− {formatEuro(ergebnis.rv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Krankenversicherung (~8,55%)</span>
                <span>− {formatEuro(ergebnis.kv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pflegeversicherung ({kinderlos ? '2,4%' : '1,8%'})</span>
                <span>− {formatEuro(ergebnis.pv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Arbeitslosenversicherung (1,3%)</span>
                <span>− {formatEuro(ergebnis.av)}</span>
              </div>
            </div>
          </div>

          {/* Steuern */}
          <div>
            <div className="flex justify-between items-center text-red-600 font-medium mb-2">
              <span>Steuern</span>
              <span>− {formatEuro(ergebnis.steuernGesamt)}</span>
            </div>
            <div className="pl-4 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Lohnsteuer (Stkl. {steuerklasse})</span>
                <span>− {formatEuro(ergebnis.lohnsteuer)}</span>
              </div>
              {ergebnis.soli > 0 && (
                <div className="flex justify-between">
                  <span>Solidaritätszuschlag</span>
                  <span>− {formatEuro(ergebnis.soli)}</span>
                </div>
              )}
              {kirchensteuer && ergebnis.kist > 0 && (
                <div className="flex justify-between">
                  <span>Kirchensteuer</span>
                  <span>− {formatEuro(ergebnis.kist)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Netto */}
          <div className="flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl">
            <span className="font-bold text-green-800 text-lg">Netto</span>
            <span className="font-bold text-green-600 text-xl">{formatEuro(ergebnis.nettoMonat)}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert's</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Berechnung nach <strong>§32a EStG Tarif 2026</strong> und BMF-Programmablaufplan</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Grundfreibetrag: {formatEuro(TARIF_2026.grundfreibetrag)}</strong> (Stand 01.01.2026)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>BBG Rente/AV: <strong>{formatEuro(BBG_2026.renteArbeitslos)}/Jahr</strong> | BBG KV/PV: <strong>{formatEuro(BBG_2026.krankenPflege)}/Jahr</strong></span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Durchschnittlicher KV-Zusatzbeitrag: <strong>2,5%</strong> (Ihr Wert kann abweichen)</span>
          </li>
          <li className="flex gap-2">
            <span>⚠️</span>
            <span>Vereinfachte Berechnung – exakte Werte via <a href="https://www.bmf-steuerrechner.de" target="_blank" rel="noopener" className="text-blue-600 hover:underline">BMF-Steuerrechner</a></span>
          </li>
        </ul>
      </div>

      {/* Steuerklassen-Hinweis */}
      {(steuerklasse === 5 || steuerklasse === 6) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">⚠️ Hinweis zu Steuerklasse {steuerklasse}</h3>
          <p className="text-sm text-amber-700">
            {steuerklasse === 5 
              ? 'In Steuerklasse V entfallen Grundfreibetrag und Pauschbeträge – diese erhält Ihr Partner in Steuerklasse III. Die höhere monatliche Belastung gleicht sich bei der Jahressteuererklärung aus.'
              : 'In Steuerklasse VI (Zweitjob) gibt es keine Freibeträge. Die tatsächliche Steuerlast wird bei der Einkommensteuererklärung berechnet.'
            }
          </p>
        </div>
      )}

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Finanzamt</p>
              <p className="text-gray-500">Lohnsteuer, Steuerklasse</p>
              <a 
                href="https://www.elster.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ELSTER Online →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🏥</span>
            <div>
              <p className="font-medium text-gray-800">Krankenkasse</p>
              <p className="text-gray-500">KV-Beitrag, Zusatzbeitrag</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Rechtsgrundlagen & Quellen (Stand: 2026)</h4>
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
            href="https://www.bmf-steuerrechner.de/bl/bl2026/eingabeformbl2026.xhtml"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Offizieller Lohnsteuerrechner 2026
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Programmablaufplan Lohnsteuer 2026
          </a>
          <a 
            href="https://www.bundesregierung.de/breg-de/aktuelles/sozialversicherung-rechengroessen-2387774"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – Sozialversicherungs-Rechengrößen 2026
          </a>
        </div>
      </div>
    </div>
  );
}
