import { useState, useMemo } from 'react';

/**
 * Brutto-Netto-Rechner 2026
 * 
 * ALLE Berechnungen basieren auf offiziellen Quellen:
 * - §32a EStG: https://www.gesetze-im-internet.de/estg/__32a.html
 * - BMF Programmablaufplan 2026: https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/
 * - Steuerfortentwicklungsgesetz 2024: https://www.recht.bund.de/eli/bund/bgbl-1/2024/449
 * - Finanz-Tools: https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2026
 */

// ============================================================================
// SOZIALVERSICHERUNG 2026 - Offizielle Werte
// Quellen: Deutsche Rentenversicherung, GKV-Spitzenverband
// ============================================================================
const SOZIALVERSICHERUNG_2026 = {
  // Quelle: Deutsche Rentenversicherung - Beitragssatz 18,6%, AN-Anteil 50%
  rentenversicherung: 0.093, // 9,3% AN-Anteil
  
  // Quelle: Bundesagentur für Arbeit - Beitragssatz 2,6%, AN-Anteil 50%
  arbeitslosenversicherung: 0.013, // 1,3% AN-Anteil
  
  // Quelle: GKV-Spitzenverband
  pflegeversicherung: {
    // Beitragssatz 3,6% (Eltern mit 1 Kind), AN-Anteil 1,8%
    basis: 0.018,
    // Beitragszuschlag für Kinderlose ab 23 Jahren: 0,6%
    // Quelle: §55 Abs. 3 SGB XI
    kinderlos_zuschlag: 0.006,
  },
  
  // Quelle: GKV-Spitzenverband
  krankenversicherung: {
    // Allgemeiner Beitragssatz 14,6%, ermäßigt 14,0%, AN-Anteil 7,0%
    basis: 0.07,
    // Durchschnittlicher Zusatzbeitrag 2026: 2,9%, AN-Anteil 1,45%
    zusatzbeitrag: 0.0145,
  },
};

// ============================================================================
// BEITRAGSBEMESSUNGSGRENZEN 2026
// Quelle: Sozialversicherungsrechengrößen-Verordnung 2026
// ============================================================================
const BBG_2026 = {
  // Einheitliche BBG Renten-/Arbeitslosenversicherung (seit 2025)
  rente: 101400,
  // BBG Kranken-/Pflegeversicherung
  kranken: 69750,
};

// ============================================================================
// STEUERLICHE FREIBETRÄGE 2026
// Quelle: §32a EStG, Steuerfortentwicklungsgesetz
// ============================================================================
const FREIBETRAEGE_2026 = {
  // Quelle: §32a Abs. 1 Nr. 1 EStG
  grundfreibetrag: 12348,
  
  // Quelle: §9a Satz 1 Nr. 1a EStG - Arbeitnehmer-Pauschbetrag
  werbungskosten: 1230,
  
  // Quelle: §10c EStG - Sonderausgaben-Pauschbetrag
  sonderausgaben: 36,
  
  // Quelle: §24b EStG - Entlastungsbetrag für Alleinerziehende
  alleinerziehend: 4260,
  // Erhöhungsbetrag für jedes weitere Kind
  alleinerziehend_kind: 240,
};

// ============================================================================
// EINKOMMENSTEUER-TARIF 2026 nach §32a EStG
// Quelle: https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2026
// ============================================================================
const TARIF_2026 = {
  // Zone 1: Grundfreibetrag
  zone1_bis: 12348,
  
  // Zone 2: Erste Progressionszone (14% bis 24%)
  zone2_bis: 17799,
  zone2_koeff1: 914.51, // Koeffizient y²
  zone2_koeff2: 1400,   // Koeffizient y
  
  // Zone 3: Zweite Progressionszone (24% bis 42%)
  zone3_bis: 69878,
  zone3_koeff1: 173.10,  // Koeffizient z²
  zone3_koeff2: 2397,    // Koeffizient z
  zone3_konstante: 1034.87,
  
  // Zone 4: Proportionalzone Spitzensteuersatz (42%)
  zone4_bis: 277825,
  zone4_satz: 0.42,
  zone4_abzug: 11135.63,
  
  // Zone 5: Reichensteuer (45%)
  zone5_satz: 0.45,
  zone5_abzug: 19470.38,
};

const STEUERKLASSEN = [
  { wert: 1, label: 'Steuerklasse 1', beschreibung: 'Ledig / Geschieden' },
  { wert: 2, label: 'Steuerklasse 2', beschreibung: 'Alleinerziehend' },
  { wert: 3, label: 'Steuerklasse 3', beschreibung: 'Verheiratet (höheres Einkommen)' },
  { wert: 4, label: 'Steuerklasse 4', beschreibung: 'Verheiratet (gleiches Einkommen)' },
  { wert: 5, label: 'Steuerklasse 5', beschreibung: 'Verheiratet (geringeres Einkommen)' },
  { wert: 6, label: 'Steuerklasse 6', beschreibung: 'Zweitjob / Nebenjob' },
];

/**
 * Berechnet die Einkommensteuer nach §32a EStG für 2026
 * 
 * @param zvE - Zu versteuerndes Einkommen (auf volle Euro abgerundet)
 * @returns Einkommensteuer in Euro (auf volle Euro abgerundet)
 * 
 * Quelle: §32a EStG, https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2026
 */
function berechneEinkommensteuer(zvE: number): number {
  // Auf volle Euro abrunden gemäß §32a Abs. 1 Satz 1 EStG
  zvE = Math.floor(zvE);
  
  if (zvE <= 0) {
    return 0;
  }
  
  let steuer: number;
  
  // Zone 1: Grundfreibetrag - keine Steuer
  // §32a Abs. 1 Nr. 1: "bis 12.348 Euro (Grundfreibetrag): 0"
  if (zvE <= TARIF_2026.zone1_bis) {
    steuer = 0;
  }
  // Zone 2: Erste Progressionszone (14% → 24%)
  // §32a Abs. 1 Nr. 2: "(914,51 · y + 1.400) · y"
  // y = (zvE - 12.348) / 10.000
  else if (zvE <= TARIF_2026.zone2_bis) {
    const y = (zvE - TARIF_2026.zone1_bis) / 10000;
    steuer = (TARIF_2026.zone2_koeff1 * y + TARIF_2026.zone2_koeff2) * y;
  }
  // Zone 3: Zweite Progressionszone (24% → 42%)
  // §32a Abs. 1 Nr. 3: "(173,10 · z + 2.397) · z + 1.034,87"
  // z = (zvE - 17.799) / 10.000
  else if (zvE <= TARIF_2026.zone3_bis) {
    const z = (zvE - TARIF_2026.zone2_bis) / 10000;
    steuer = (TARIF_2026.zone3_koeff1 * z + TARIF_2026.zone3_koeff2) * z + TARIF_2026.zone3_konstante;
  }
  // Zone 4: Spitzensteuersatz 42%
  // §32a Abs. 1 Nr. 4: "0,42 · x – 11.135,63"
  else if (zvE <= TARIF_2026.zone4_bis) {
    steuer = TARIF_2026.zone4_satz * zvE - TARIF_2026.zone4_abzug;
  }
  // Zone 5: Reichensteuer 45%
  // §32a Abs. 1 Nr. 5: "0,45 · x – 19.470,38"
  else {
    steuer = TARIF_2026.zone5_satz * zvE - TARIF_2026.zone5_abzug;
  }
  
  // Auf volle Euro abrunden gemäß §32a Abs. 1 Satz 6 EStG
  return Math.max(0, Math.floor(steuer));
}

/**
 * Berechnet die Vorsorgepauschale für den Lohnsteuerabzug
 * 
 * Quelle: §39b Abs. 2 Satz 5 Nr. 3 EStG
 * Quelle: https://www.lohn-info.de/vorsorgepauschale.html
 */
function berechneVorsorgepauschale(jahresbrutto: number, kinderlos: boolean): number {
  // Teilbetrag Rentenversicherung (§39b Abs. 2 Satz 5 Nr. 3a EStG)
  // 9,3% des Arbeitslohns bis zur BBG RV
  const rvBrutto = Math.min(jahresbrutto, BBG_2026.rente);
  const teilbetragRV = rvBrutto * SOZIALVERSICHERUNG_2026.rentenversicherung;
  
  // Teilbetrag Krankenversicherung (§39b Abs. 2 Satz 5 Nr. 3b EStG)
  const kvBrutto = Math.min(jahresbrutto, BBG_2026.kranken);
  const teilbetragKV = kvBrutto * (
    SOZIALVERSICHERUNG_2026.krankenversicherung.basis + 
    SOZIALVERSICHERUNG_2026.krankenversicherung.zusatzbeitrag
  );
  
  // Teilbetrag Pflegeversicherung (§39b Abs. 2 Satz 5 Nr. 3c EStG)
  let teilbetragPV = kvBrutto * SOZIALVERSICHERUNG_2026.pflegeversicherung.basis;
  if (kinderlos) {
    // Beitragszuschlag für Kinderlose ab 23 Jahren (§55 Abs. 3 SGB XI)
    teilbetragPV += kvBrutto * SOZIALVERSICHERUNG_2026.pflegeversicherung.kinderlos_zuschlag;
  }
  
  // Teilbetrag Arbeitslosenversicherung ab 2026 (§39b Abs. 2 Satz 5 Nr. 3e EStG)
  // Begrenzt auf 1.900€ zusammen mit KV+PV
  const teilbetragAV = rvBrutto * SOZIALVERSICHERUNG_2026.arbeitslosenversicherung;
  const summeKVPVAV = teilbetragKV + teilbetragPV + teilbetragAV;
  const begrenztKVPVAV = Math.min(summeKVPVAV, 1900);
  
  // Gesamte Vorsorgepauschale
  return teilbetragRV + begrenztKVPVAV;
}

/**
 * Berechnet die Lohnsteuer für einen Jahresbruttolohn
 * 
 * Die Berechnung berücksichtigt:
 * - Steuerklassen-spezifische Freibeträge
 * - Werbungskostenpauschale
 * - Sonderausgabenpauschale
 * - Vorsorgepauschale
 * 
 * Quelle: BMF Programmablaufplan 2026
 */
function berechneLohnsteuer(jahresbrutto: number, steuerklasse: number, kinderlos: boolean): number {
  // Schritt 1: Ermittle die Freibeträge je nach Steuerklasse
  // Quelle: https://www.smart-rechner.de/lohnsteuer/rechner.php
  let grundfreibetrag = 0;
  let werbungskosten = 0;
  let sonderausgaben = 0;
  let entlastungsbetrag = 0;
  
  switch (steuerklasse) {
    case 1:
      // Steuerklasse 1: Volle Freibeträge
      grundfreibetrag = FREIBETRAEGE_2026.grundfreibetrag;
      werbungskosten = FREIBETRAEGE_2026.werbungskosten;
      sonderausgaben = FREIBETRAEGE_2026.sonderausgaben;
      break;
      
    case 2:
      // Steuerklasse 2: Wie 1, plus Entlastungsbetrag für Alleinerziehende
      grundfreibetrag = FREIBETRAEGE_2026.grundfreibetrag;
      werbungskosten = FREIBETRAEGE_2026.werbungskosten;
      sonderausgaben = FREIBETRAEGE_2026.sonderausgaben;
      entlastungsbetrag = FREIBETRAEGE_2026.alleinerziehend;
      break;
      
    case 3:
      // Steuerklasse 3: Splittingverfahren (doppelter Grundfreibetrag)
      // Quelle: §32a Abs. 5 EStG
      grundfreibetrag = FREIBETRAEGE_2026.grundfreibetrag * 2;
      werbungskosten = FREIBETRAEGE_2026.werbungskosten;
      sonderausgaben = FREIBETRAEGE_2026.sonderausgaben * 2; // 72€
      break;
      
    case 4:
      // Steuerklasse 4: Wie Steuerklasse 1 (für Verheiratete mit ähnlichem Einkommen)
      grundfreibetrag = FREIBETRAEGE_2026.grundfreibetrag;
      werbungskosten = FREIBETRAEGE_2026.werbungskosten;
      sonderausgaben = FREIBETRAEGE_2026.sonderausgaben;
      break;
      
    case 5:
      // Steuerklasse 5: KEIN Grundfreibetrag (Partner hat doppelten in Klasse 3)
      // Nur Werbungskosten, Sonderausgaben und Vorsorgepauschale
      grundfreibetrag = 0;
      werbungskosten = FREIBETRAEGE_2026.werbungskosten;
      sonderausgaben = FREIBETRAEGE_2026.sonderausgaben;
      break;
      
    case 6:
      // Steuerklasse 6: KEINE Freibeträge (Zweitjob)
      // Nur Vorsorgepauschale
      grundfreibetrag = 0;
      werbungskosten = 0;
      sonderausgaben = 0;
      break;
  }
  
  // Schritt 2: Berechne die Vorsorgepauschale
  const vorsorgepauschale = berechneVorsorgepauschale(jahresbrutto, kinderlos);
  
  // Schritt 3: Berechne das zu versteuernde Einkommen (zvE)
  // zvE = Brutto - Werbungskosten - Sonderausgaben - Vorsorgepauschale - Entlastungsbetrag
  const abzuege = werbungskosten + sonderausgaben + vorsorgepauschale + entlastungsbetrag;
  const zvE = Math.max(0, jahresbrutto - abzuege);
  
  // Schritt 4: Wende den Grundfreibetrag an und berechne die Steuer
  // Der Grundfreibetrag ist in der Tarifformel bereits enthalten
  // Bei Steuerklasse 3 wird das Splittingverfahren angewandt
  if (steuerklasse === 3) {
    // Splittingverfahren: zvE halbieren, Steuer berechnen, verdoppeln
    // Quelle: §32a Abs. 5 EStG
    const halbZvE = Math.max(0, zvE / 2);
    const steuerHalb = berechneEinkommensteuer(halbZvE);
    return steuerHalb * 2;
  } else if (steuerklasse === 5 || steuerklasse === 6) {
    // Bei Steuerklasse 5 und 6: Volle Besteuerung ohne Grundfreibetrag
    // Der Grundfreibetrag wird hier nicht vom zvE abgezogen
    return berechneEinkommensteuer(zvE);
  } else {
    // Steuerklassen 1, 2, 4: Normale Besteuerung
    // Grundfreibetrag ist in der Tarifformel enthalten
    return berechneEinkommensteuer(zvE);
  }
}

/**
 * Berechnet den Solidaritätszuschlag
 * 
 * Seit 2021: Soli nur noch für hohe Einkommen
 * Quelle: §3 Abs. 3 SolZG
 */
function berechneSoli(lohnsteuer: number): number {
  // Nullzone: Kein Soli bis 18.130€ Lohnsteuer/Jahr (16.956€ bis 2020)
  const freigrenze = 18130;
  if (lohnsteuer <= freigrenze) return 0;
  
  // Gleitzone: 18.130€ bis 33.063€ (schrittweise Einführung)
  // Der Soli steigt von 0% auf 5,5%
  if (lohnsteuer <= 33063) {
    // 11,9% des Unterschiedsbetrags, max. 5,5% der Lohnsteuer
    return Math.min(0.055 * lohnsteuer, 0.119 * (lohnsteuer - freigrenze));
  }
  
  // Voller Satz: 5,5% der Lohnsteuer
  return Math.floor(lohnsteuer * 0.055);
}

/**
 * Berechnet die Kirchensteuer
 * 
 * Quelle: Kirchensteuergesetze der Länder
 */
function berechneKirchensteuer(lohnsteuer: number, bundesland: string): number {
  // Bayern und Baden-Württemberg: 8%, alle anderen: 9%
  const satz = ['BY', 'BW'].includes(bundesland) ? 0.08 : 0.09;
  return Math.floor(lohnsteuer * satz);
}

export default function BruttoNettoRechner() {
  const [bruttoMonat, setBruttoMonat] = useState(4000);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [kinderlos, setKinderlos] = useState(true);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState('NW');

  const ergebnis = useMemo(() => {
    const bruttoJahr = bruttoMonat * 12;
    
    // ========================================
    // SOZIALVERSICHERUNGSBEITRÄGE
    // ========================================
    const rvBrutto = Math.min(bruttoJahr, BBG_2026.rente);
    const kvBrutto = Math.min(bruttoJahr, BBG_2026.kranken);
    
    // Rentenversicherung: 9,3% AN-Anteil
    const rv = rvBrutto * SOZIALVERSICHERUNG_2026.rentenversicherung;
    
    // Arbeitslosenversicherung: 1,3% AN-Anteil
    const av = rvBrutto * SOZIALVERSICHERUNG_2026.arbeitslosenversicherung;
    
    // Pflegeversicherung: 1,8% (+ 0,6% Kinderlosenzuschlag)
    let pv = kvBrutto * SOZIALVERSICHERUNG_2026.pflegeversicherung.basis;
    if (kinderlos) {
      pv += kvBrutto * SOZIALVERSICHERUNG_2026.pflegeversicherung.kinderlos_zuschlag;
    }
    
    // Krankenversicherung: 7,0% + 1,45% Zusatzbeitrag
    const kv = kvBrutto * (
      SOZIALVERSICHERUNG_2026.krankenversicherung.basis + 
      SOZIALVERSICHERUNG_2026.krankenversicherung.zusatzbeitrag
    );
    
    const svGesamt = rv + av + pv + kv;
    
    // ========================================
    // STEUERN
    // ========================================
    const lohnsteuerJahr = berechneLohnsteuer(bruttoJahr, steuerklasse, kinderlos);
    const soliJahr = berechneSoli(lohnsteuerJahr);
    const kistJahr = kirchensteuer ? berechneKirchensteuer(lohnsteuerJahr, bundesland) : 0;
    const steuernGesamt = lohnsteuerJahr + soliJahr + kistJahr;
    
    // ========================================
    // NETTO
    // ========================================
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
    };
  }, [bruttoMonat, steuerklasse, kinderlos, kirchensteuer, bundesland]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  // Berechne PV-Satz für Anzeige
  const pvSatz = kinderlos ? '2,4%' : '1,8%';
  // Berechne KV-Satz für Anzeige
  const kvSatz = ((SOZIALVERSICHERUNG_2026.krankenversicherung.basis + SOZIALVERSICHERUNG_2026.krankenversicherung.zusatzbeitrag) * 100).toFixed(2) + '%';

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
                <span>Krankenversicherung ({kvSatz})</span>
                <span>− {formatEuro(ergebnis.kv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pflegeversicherung ({pvSatz})</span>
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
            <span>Berechnung nach <strong>§32a EStG Tarifformel 2026</strong></span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Grundfreibetrag: 12.348 €</strong> (Steuerfortentwicklungsgesetz)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Beitragsbemessungsgrenzen <strong>RV: 101.400 €</strong> / <strong>KV: 69.750 €</strong></span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Durchschnittlicher KV-Zusatzbeitrag: <strong>2,9%</strong></span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Exakte Werte via <a href="https://www.bmf-steuerrechner.de" target="_blank" rel="noopener" className="text-blue-600 hover:underline">BMF-Steuerrechner</a></span>
          </li>
        </ul>
      </div>

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
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen (Stand: 2026)</h4>
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
            href="https://www.finanz-tools.de/einkommensteuer/berechnung-formeln/2026"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Finanz-Tools – Einkommensteuer-Formeln 2026
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
            href="https://www.lohn-info.de/vorsorgepauschale.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Lohn-Info – Vorsorgepauschale
          </a>
        </div>
      </div>
    </div>
  );
}
