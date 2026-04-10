import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

/**
 * Steuererstattungs-Rechner 2026
 * 
 * Schätzt die erwartete Steuererstattung basierend auf:
 * - Werbungskosten über Pauschbetrag
 * - Fahrtkosten (Entfernungspauschale)
 * - Homeoffice-Pauschale
 * - Sonderausgaben
 * 
 * Quellen:
 * - Destatis: Durchschnittliche Erstattung 1.172 € (2023)
 * - BMF: Werbungskostenpauschale 1.230 € (2024-2026)
 * - Entfernungspauschale 2026: 0,38 €/km ab km 1
 * - Homeoffice-Pauschale: 6 €/Tag, max 1.260 €/Jahr
 */

// ============================================================================
// KONSTANTEN 2026
// ============================================================================

const PAUSCHBETRAEGE_2026 = {
  werbungskosten: 1230,        // Arbeitnehmer-Pauschbetrag
  sonderausgaben: 36,          // Sonderausgaben-Pauschbetrag
  entfernungProKm: 0.38,       // 38 Cent/km ab km 1 (2026 vereinheitlicht!)
  homeofficeProTag: 6,         // Euro pro Homeoffice-Tag
  homeofficeMaxTage: 210,      // Maximum Homeoffice-Tage
  homeofficeMax: 1260,         // Maximum Homeoffice-Pauschale
  arbeitstageJahr: 230,        // Typische Arbeitstage
};

const GRUNDFREIBETRAG_2026 = 12348;

// Steuertarif 2026 Zonen
const TARIFZONEN_2026 = {
  zone1Ende: 17799,
  zone2Ende: 69878,
  zone3Ende: 277825,
};

// Steuerklassen-Infos
const STEUERKLASSEN = [
  { value: 1, label: 'Steuerklasse I', beschreibung: 'Ledig, geschieden, verwitwet' },
  { value: 2, label: 'Steuerklasse II', beschreibung: 'Alleinerziehend' },
  { value: 3, label: 'Steuerklasse III', beschreibung: 'Verheiratet, Partner SK V' },
  { value: 4, label: 'Steuerklasse IV', beschreibung: 'Verheiratet, beide erwerbstätig' },
  { value: 5, label: 'Steuerklasse V', beschreibung: 'Verheiratet, Partner SK III' },
  { value: 6, label: 'Steuerklasse VI', beschreibung: 'Zweitjob / Nebenjob' },
];

// ============================================================================
// BERECHNUNGSFUNKTIONEN
// ============================================================================

// Einkommensteuer nach §32a EStG 2026
function berechneEinkommensteuer(zvE: number, verheiratet: boolean): number {
  const faktor = verheiratet ? 2 : 1;
  const zvEHalb = zvE / faktor;
  
  if (zvEHalb <= 0) return 0;
  
  let steuer = 0;
  
  if (zvEHalb <= GRUNDFREIBETRAG_2026) {
    steuer = 0;
  } else if (zvEHalb <= TARIFZONEN_2026.zone1Ende) {
    const y = (zvEHalb - GRUNDFREIBETRAG_2026) / 10000;
    steuer = (914.51 * y + 1400) * y;
  } else if (zvEHalb <= TARIFZONEN_2026.zone2Ende) {
    const z = (zvEHalb - TARIFZONEN_2026.zone1Ende) / 10000;
    steuer = (173.10 * z + 2397) * z + 1034.87;
  } else if (zvEHalb <= TARIFZONEN_2026.zone3Ende) {
    steuer = 0.42 * zvEHalb - 11135.63;
  } else {
    steuer = 0.45 * zvEHalb - 19470.38;
  }
  
  return Math.round(steuer * faktor);
}

// Grenzsteuersatz ermitteln
function berechneGrenzsteuersatz(zvE: number, verheiratet: boolean): number {
  const faktor = verheiratet ? 2 : 1;
  const zvEHalb = zvE / faktor;
  
  if (zvEHalb <= GRUNDFREIBETRAG_2026) return 0;
  if (zvEHalb <= TARIFZONEN_2026.zone1Ende) {
    const y = (zvEHalb - GRUNDFREIBETRAG_2026) / 10000;
    return (2 * 914.51 * y + 1400) / 100;
  }
  if (zvEHalb <= TARIFZONEN_2026.zone2Ende) {
    const z = (zvEHalb - TARIFZONEN_2026.zone1Ende) / 10000;
    return (2 * 173.10 * z + 2397) / 100;
  }
  if (zvEHalb <= TARIFZONEN_2026.zone3Ende) return 42;
  return 45;
}

// Geschätztes zvE aus Bruttojahresgehalt (vereinfacht)
function schaetzeZvE(brutto: number, steuerklasse: number): number {
  // Vereinfachte Schätzung: Brutto - Sozialabgaben - Pauschbeträge
  // Sozialabgaben ca. 20% vom Brutto (AN-Anteil)
  const sozialabgaben = brutto * 0.20;
  
  // Vorsorgeaufwendungen (vereinfacht)
  const vorsorgePauschale = Math.min(sozialabgaben * 0.8, 25000);
  
  // zvE = Brutto - Werbungskosten-Pauschale - Vorsorge
  let zvE = brutto - PAUSCHBETRAEGE_2026.werbungskosten - vorsorgePauschale;
  
  // Entlastungsbetrag Alleinerziehende (SK 2)
  if (steuerklasse === 2) {
    zvE -= 4260;
  }
  
  return Math.max(0, zvE);
}

// ============================================================================
// HAUPTKOMPONENTE
// ============================================================================

export default function SteuererstattungRechner() {
  // Eingabefelder
  const [bruttoJahr, setBruttoJahr] = useState<string>('45000');
  const [steuerklasse, setSteuerklasse] = useState<number>(1);
  const [entfernung, setEntfernung] = useState<string>('25');
  const [arbeitstage, setArbeitstage] = useState<string>('220');
  const [homeofficeTage, setHomeofficeTage] = useState<string>('100');
  const [sonstigeWerbungskosten, setSonstigeWerbungskosten] = useState<string>('0');
  const [sonderausgaben, setSonderausgaben] = useState<string>('0');
  const [hatKinder, setHatKinder] = useState<boolean>(false);
  
  // Berechnung
  const ergebnis = useMemo(() => {
    const brutto = parseFloat(bruttoJahr) || 0;
    const km = parseFloat(entfernung) || 0;
    const tageArbeit = Math.min(parseFloat(arbeitstage) || 0, 230);
    const tageHomeoffice = Math.min(parseFloat(homeofficeTage) || 0, PAUSCHBETRAEGE_2026.homeofficeMaxTage);
    const sonstigeWK = parseFloat(sonstigeWerbungskosten) || 0;
    const sonderausgabenBetrag = parseFloat(sonderausgaben) || 0;
    
    // Tage im Büro (für Fahrtkosten)
    const tageBuero = Math.max(0, tageArbeit - tageHomeoffice);
    
    // 1. Fahrtkosten (Entfernungspauschale)
    // 2026: 0,38 € pro km ab dem ersten Kilometer, max 4.500 € für Fernpendler ohne PKW
    const fahrtkosten = tageBuero * km * PAUSCHBETRAEGE_2026.entfernungProKm;
    
    // 2. Homeoffice-Pauschale
    const homeofficePauschale = Math.min(
      tageHomeoffice * PAUSCHBETRAEGE_2026.homeofficeProTag,
      PAUSCHBETRAEGE_2026.homeofficeMax
    );
    
    // 3. Gesamte Werbungskosten
    const gesamtWerbungskosten = fahrtkosten + homeofficePauschale + sonstigeWK;
    
    // 4. Werbungskosten über Pauschbetrag
    const werbungskostenUeberPauschale = Math.max(0, 
      gesamtWerbungskosten - PAUSCHBETRAEGE_2026.werbungskosten
    );
    
    // 5. Sonderausgaben über Pauschbetrag
    const sonderausgabenUeberPauschale = Math.max(0,
      sonderausgabenBetrag - PAUSCHBETRAEGE_2026.sonderausgaben
    );
    
    // 6. Gesamter zusätzlicher Abzug
    const zusaetzlicherAbzug = werbungskostenUeberPauschale + sonderausgabenUeberPauschale;
    
    // 7. zvE schätzen
    const istVerheiratet = [3, 4, 5].includes(steuerklasse);
    const zvE = schaetzeZvE(brutto, steuerklasse);
    
    // 8. Grenzsteuersatz ermitteln
    const grenzsteuersatz = berechneGrenzsteuersatz(zvE, istVerheiratet);
    
    // 9. Geschätzte Erstattung
    // Erstattung = zusätzlicher Abzug * (Grenzsteuersatz + Soli)
    const effektiverSteuersatz = grenzsteuersatz * 1.055; // inkl. 5,5% Soli
    const geschaetzteErstattung = Math.round(zusaetzlicherAbzug * (effektiverSteuersatz / 100));
    
    // Erstattungsgründe sammeln
    const gruende: { grund: string; betrag: number; erklaerung: string }[] = [];
    
    if (fahrtkosten > 0) {
      const fahrtkostenErsparnis = Math.min(fahrtkosten, werbungskostenUeberPauschale) * (effektiverSteuersatz / 100);
      gruende.push({
        grund: 'Fahrtkosten',
        betrag: Math.round(fahrtkosten),
        erklaerung: `${tageBuero} Tage × ${km} km × 0,38 €`
      });
    }
    
    if (homeofficePauschale > 0) {
      gruende.push({
        grund: 'Homeoffice-Pauschale',
        betrag: Math.round(homeofficePauschale),
        erklaerung: `${tageHomeoffice} Tage × 6 €`
      });
    }
    
    if (sonstigeWK > 0) {
      gruende.push({
        grund: 'Sonstige Werbungskosten',
        betrag: sonstigeWK,
        erklaerung: 'Arbeitsmittel, Fortbildung etc.'
      });
    }
    
    if (sonderausgabenUeberPauschale > 0) {
      gruende.push({
        grund: 'Sonderausgaben',
        betrag: sonderausgabenBetrag,
        erklaerung: 'Spenden, Versicherungen etc.'
      });
    }
    
    // Bewertung der Erstattung
    let bewertung: 'gering' | 'durchschnitt' | 'gut' | 'sehrgut';
    let bewertungText: string;
    
    if (geschaetzteErstattung < 300) {
      bewertung = 'gering';
      bewertungText = 'Geringe Erstattung - evtl. lohnt sich die Steuererklärung trotzdem!';
    } else if (geschaetzteErstattung < 800) {
      bewertung = 'durchschnitt';
      bewertungText = 'Solide Erstattung - Steuererklärung lohnt sich!';
    } else if (geschaetzteErstattung < 1500) {
      bewertung = 'gut';
      bewertungText = 'Gute Erstattung - über dem Durchschnitt von 1.172 €!';
    } else {
      bewertung = 'sehrgut';
      bewertungText = 'Sehr gute Erstattung - Sie haben viel absetzbar!';
    }
    
    return {
      brutto,
      gesamtWerbungskosten: Math.round(gesamtWerbungskosten),
      werbungskostenUeberPauschale: Math.round(werbungskostenUeberPauschale),
      fahrtkosten: Math.round(fahrtkosten),
      homeofficePauschale: Math.round(homeofficePauschale),
      sonderausgabenUeberPauschale: Math.round(sonderausgabenUeberPauschale),
      zusaetzlicherAbzug: Math.round(zusaetzlicherAbzug),
      grenzsteuersatz: Math.round(grenzsteuersatz * 10) / 10,
      geschaetzteErstattung,
      gruende,
      bewertung,
      bewertungText,
      zvE: Math.round(zvE),
    };
  }, [bruttoJahr, steuerklasse, entfernung, arbeitstage, homeofficeTage, sonstigeWerbungskosten, sonderausgaben, hatKinder]);

  // Formatierung
  const formatEuro = (betrag: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(betrag);
  };

  const getBewertungFarbe = (bewertung: string) => {
    switch (bewertung) {
      case 'gering': return 'text-yellow-600 bg-yellow-50';
      case 'durchschnitt': return 'text-blue-600 bg-blue-50';
      case 'gut': return 'text-green-600 bg-green-50';
      case 'sehrgut': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Ihre Angaben
        </h2>
        
        <div className="grid gap-4">
          {/* Bruttojahresgehalt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bruttojahresgehalt
            </label>
            <div className="relative">
              <input
                type="number"
                value={bruttoJahr}
                onChange={(e) => setBruttoJahr(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="45000"
                min="0"
                step="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
          </div>
          
          {/* Steuerklasse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Steuerklasse
            </label>
            <select
              value={steuerklasse}
              onChange={(e) => setSteuerklasse(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
            >
              {STEUERKLASSEN.map((sk) => (
                <option key={sk.value} value={sk.value}>
                  {sk.label} – {sk.beschreibung}
                </option>
              ))}
            </select>
          </div>
          
          {/* Arbeitstage & Homeoffice */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arbeitstage/Jahr
              </label>
              <input
                type="number"
                value={arbeitstage}
                onChange={(e) => setArbeitstage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="220"
                min="0"
                max="260"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                davon Homeoffice
              </label>
              <input
                type="number"
                value={homeofficeTage}
                onChange={(e) => setHomeofficeTage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="100"
                min="0"
                max="210"
              />
            </div>
          </div>
          
          {/* Entfernung Arbeit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entfernung zur Arbeit (einfache Strecke)
            </label>
            <div className="relative">
              <input
                type="number"
                value={entfernung}
                onChange={(e) => setEntfernung(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="25"
                min="0"
                max="200"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">km</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              2026: 0,38 € pro km ab dem ersten Kilometer
            </p>
          </div>
          
          {/* Sonstige Werbungskosten */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sonstige Werbungskosten
            </label>
            <div className="relative">
              <input
                type="number"
                value={sonstigeWerbungskosten}
                onChange={(e) => setSonstigeWerbungskosten(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              z.B. Arbeitsmittel, Fortbildung, Fachliteratur, Berufskleidung
            </p>
          </div>
          
          {/* Sonderausgaben */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sonderausgaben (über Pauschale)
            </label>
            <div className="relative">
              <input
                type="number"
                value={sonderausgaben}
                onChange={(e) => setSonderausgaben(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              z.B. Spenden, Kirchensteuer, Riester-Beiträge, Handwerkerleistungen
            </p>
          </div>
        </div>
      </div>
      
      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          Geschätzte Erstattung
        </h2>
        
        <div className="text-center py-4">
          <div className="text-5xl font-bold mb-2">
            {formatEuro(ergebnis.geschaetzteErstattung)}
          </div>
          <p className="text-green-100 text-sm">
            ca. {formatEuro(Math.round(ergebnis.geschaetzteErstattung / 12))} pro Monat
          </p>
        </div>
        
        <div className={`rounded-xl p-3 mt-4 ${getBewertungFarbe(ergebnis.bewertung)}`}>
          <p className="text-sm font-medium text-center">
            {ergebnis.bewertungText}
          </p>
        </div>
      </div>
      
      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Aufschlüsselung
        </h2>
        
        <div className="space-y-4">
          {/* Werbungskosten-Zusammenfassung */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-700 mb-3">Werbungskosten</h3>
            
            <div className="space-y-2 text-sm">
              {ergebnis.fahrtkosten > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">🚗 Fahrtkosten</span>
                  <span className="font-medium">{formatEuro(ergebnis.fahrtkosten)}</span>
                </div>
              )}
              {ergebnis.homeofficePauschale > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">🏠 Homeoffice-Pauschale</span>
                  <span className="font-medium">{formatEuro(ergebnis.homeofficePauschale)}</span>
                </div>
              )}
              {(parseFloat(sonstigeWerbungskosten) || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">📁 Sonstige</span>
                  <span className="font-medium">{formatEuro(parseFloat(sonstigeWerbungskosten) || 0)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Gesamt Werbungskosten</span>
                <span>{formatEuro(ergebnis.gesamtWerbungskosten)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>./. Pauschbetrag</span>
                <span>−{formatEuro(PAUSCHBETRAEGE_2026.werbungskosten)}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>= Zusätzlich absetzbar</span>
                <span>{formatEuro(ergebnis.werbungskostenUeberPauschale)}</span>
              </div>
            </div>
          </div>
          
          {/* Steuerberechnung */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-medium text-blue-800 mb-3">Steuereffekt</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Zusätzlicher Abzug gesamt</span>
                <span className="font-medium text-blue-800">{formatEuro(ergebnis.zusaetzlicherAbzug)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Ihr Grenzsteuersatz</span>
                <span className="font-medium text-blue-800">{ergebnis.grenzsteuersatz}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">+ Solidaritätszuschlag</span>
                <span className="font-medium text-blue-800">5,5%</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold text-blue-800">
                <span>≈ Erstattung</span>
                <span>{formatEuro(ergebnis.geschaetzteErstattung)}</span>
              </div>
            </div>
          </div>
          
          {/* Info-Box zum Durchschnitt */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">📈</span>
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">
                  Zum Vergleich: Durchschnittliche Erstattung
                </p>
                <p className="text-yellow-700">
                  Laut Statistischem Bundesamt erhalten Deutsche im Schnitt <strong>1.172 €</strong> zurück. 
                  86% aller Steuerpflichtigen bekommen eine Erstattung!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Tipps für mehr Erstattung
        </h2>
        
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">🧾</span>
            <div>
              <p className="font-medium text-gray-800">Belege sammeln</p>
              <p className="text-sm text-gray-600">
                Arbeitsmittel über 952 € (brutto) über 3 Jahre abschreiben. Kleinere Anschaffungen sofort absetzen.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">📚</span>
            <div>
              <p className="font-medium text-gray-800">Fortbildungskosten</p>
              <p className="text-sm text-gray-600">
                Kurse, Seminare, Fachliteratur – voll absetzbar wenn berufsbezogen.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">🏠</span>
            <div>
              <p className="font-medium text-gray-800">Handwerkerleistungen</p>
              <p className="text-sm text-gray-600">
                20% der Arbeitskosten absetzbar, max. 1.200 € Steuerersparnis pro Jahr.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">🏥</span>
            <div>
              <p className="font-medium text-gray-800">Außergewöhnliche Belastungen</p>
              <p className="text-sm text-gray-600">
                Krankheitskosten, Pflegekosten – über der zumutbaren Eigenbelastung absetzbar.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="text-sm">
            <p className="font-semibold text-red-800 mb-1">
              Wichtiger Hinweis
            </p>
            <p className="text-red-700">
              Diese Berechnung ist eine <strong>vereinfachte Schätzung</strong> und ersetzt keine professionelle 
              Steuerberatung. Die tatsächliche Erstattung kann abweichen und hängt von vielen individuellen 
              Faktoren ab. Nutzen Sie ELSTER oder einen Steuerberater für die verbindliche Steuererklärung.
            </p>
          </div>
        </div>
      <RechnerFeedback rechnerName="Steuererstattung-Rechner 2025 & 2026" rechnerSlug="steuererstattung-rechner" />
      </div>
    </div>
  );
}
