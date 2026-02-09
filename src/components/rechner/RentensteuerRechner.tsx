import { useState, useMemo } from 'react';

// === OFFIZIELLE WERTE 2026 ===
// Quelle: §22 Nr. 1a EStG, §32a EStG, BMF-Steuerrechner

// Grundfreibetrag 2026 (§32a EStG)
const GRUNDFREIBETRAG_2026 = 12348;
const GRUNDFREIBETRAG_VERHEIRATET_2026 = 24696;

// Werbungskostenpauschale für Renteneinkünfte (§9a EStG)
const WERBUNGSKOSTEN_PAUSCHALE_RENTE = 102;

// Sonderausgaben-Pauschbetrag (§10c EStG)
const SONDERAUSGABEN_PAUSCHBETRAG = 36;
const SONDERAUSGABEN_PAUSCHBETRAG_VERHEIRATET = 72;

// Kranken-/Pflegeversicherung auf Rente (ca. AN-Anteil)
const KV_BEITRAG = 0.073; // 7,3% + Zusatzbeitrag
const KV_ZUSATZBEITRAG = 0.019; // Durchschnitt ~1,9%
const PV_BEITRAG = 0.018; // 1,8% AN-Anteil (2024/2025)
const PV_ZUSCHLAG_KINDERLOS = 0.006; // +0,6% für Kinderlose ab 23

// Steuertarif 2026 Zonen (§32a EStG)
const TARIFZONEN_2026 = {
  zone1Ende: 17799,   // Ende Zone 1 (14-24%)
  zone2Ende: 69878,   // Ende Zone 2 (24-42%)
  zone3Ende: 277825,  // Ende Zone 3 (42%)
  // darüber: 45% Reichensteuer
};

// Besteuerungsanteil nach Jahr des Rentenbeginns (§22 Nr. 1a EStG)
// Der Rentenfreibetrag wird im ersten vollen Jahr der Rente festgeschrieben
const BESTEUERUNGSANTEIL_TABELLE: { [jahr: number]: number } = {
  2005: 50, // und früher
  2006: 52,
  2007: 54,
  2008: 56,
  2009: 58,
  2010: 60,
  2011: 62,
  2012: 64,
  2013: 66,
  2014: 68,
  2015: 70,
  2016: 72,
  2017: 74,
  2018: 76,
  2019: 78,
  2020: 80,
  2021: 81,
  2022: 82,
  2023: 82.5,
  2024: 83,
  2025: 83.5,
  2026: 84,
  2027: 84.5,
  2028: 85,
  2029: 85.5,
  2030: 86,
  2031: 86.5,
  2032: 87,
  2033: 87.5,
  2034: 88,
  2035: 88.5,
  2036: 89,
  2037: 89.5,
  2038: 90,
  2039: 90.5,
  2040: 91,
  2041: 91.5,
  2042: 92,
  2043: 92.5,
  2044: 93,
  2045: 93.5,
  2046: 94,
  2047: 94.5,
  2048: 95,
  2049: 95.5,
  2050: 96,
  2051: 96.5,
  2052: 97,
  2053: 97.5,
  2054: 98,
  2055: 98.5,
  2056: 99,
  2057: 99.5,
  2058: 100,
};

// Funktion: Besteuerungsanteil ermitteln
function getBesteuerungsanteil(jahrRentenbeginn: number): number {
  if (jahrRentenbeginn <= 2005) return 50;
  if (jahrRentenbeginn >= 2058) return 100;
  return BESTEUERUNGSANTEIL_TABELLE[jahrRentenbeginn] || 100;
}

// Funktion: Einkommensteuer nach §32a EStG 2026
function berechneEinkommensteuer(zvE: number, verheiratet: boolean): number {
  const faktor = verheiratet ? 2 : 1;
  const zvEHalb = zvE / faktor;
  
  if (zvEHalb <= 0) return 0;
  
  let steuer = 0;
  
  if (zvEHalb <= GRUNDFREIBETRAG_2026) {
    steuer = 0;
  } else if (zvEHalb <= TARIFZONEN_2026.zone1Ende) {
    // Zone 1: 14-24% progressiv
    const y = (zvEHalb - GRUNDFREIBETRAG_2026) / 10000;
    steuer = (914.51 * y + 1400) * y;
  } else if (zvEHalb <= TARIFZONEN_2026.zone2Ende) {
    // Zone 2: 24-42% progressiv
    const z = (zvEHalb - TARIFZONEN_2026.zone1Ende) / 10000;
    steuer = (173.10 * z + 2397) * z + 1034.87;
  } else if (zvEHalb <= TARIFZONEN_2026.zone3Ende) {
    // Zone 3: 42% Spitzensteuersatz
    steuer = 0.42 * zvEHalb - 11135.63;
  } else {
    // Zone 4: 45% Reichensteuer
    steuer = 0.45 * zvEHalb - 19470.38;
  }
  
  return Math.round(steuer * faktor);
}

// Funktion: Solidaritätszuschlag
function berechneSoli(einkommensteuer: number, verheiratet: boolean): number {
  const freigrenze = verheiratet ? 36260 : 18130;
  const milderungszone = verheiratet ? 66126 : 33063;
  
  if (einkommensteuer <= freigrenze) return 0;
  if (einkommensteuer <= milderungszone) {
    return Math.round(Math.min(0.055 * einkommensteuer, 0.119 * (einkommensteuer - freigrenze)));
  }
  return Math.round(einkommensteuer * 0.055);
}

// Funktion: Kirchensteuer
function berechneKirchensteuer(einkommensteuer: number, satz: number): number {
  return Math.round(einkommensteuer * satz);
}

// Funktion: Grenzsteuersatz
function berechneGrenzsteuersatz(zvE: number, verheiratet: boolean): number {
  const faktor = verheiratet ? 2 : 1;
  const zvEHalb = zvE / faktor;
  
  if (zvEHalb <= GRUNDFREIBETRAG_2026) return 0;
  if (zvEHalb <= TARIFZONEN_2026.zone1Ende) {
    const y = (zvEHalb - GRUNDFREIBETRAG_2026) / 10000;
    return Math.min(24, 14 + (2 * 914.51 * y + 1400) / 100);
  }
  if (zvEHalb <= TARIFZONEN_2026.zone2Ende) {
    const z = (zvEHalb - TARIFZONEN_2026.zone1Ende) / 10000;
    return Math.min(42, 24 + (2 * 173.10 * z + 2397) / 100);
  }
  if (zvEHalb <= TARIFZONEN_2026.zone3Ende) return 42;
  return 45;
}

export default function RentensteuerRechner() {
  // Eingaben
  const [monatlicheRente, setMonatlicheRente] = useState(1500);
  const [jahrRentenbeginn, setJahrRentenbeginn] = useState(2026);
  const [hatPrivateRente, setHatPrivateRente] = useState(false);
  const [privateRente, setPrivateRente] = useState(0);
  const [ertragsanteilAlter, setErtragsanteilAlter] = useState(65);
  const [hatBetriebsrente, setHatBetriebsrente] = useState(false);
  const [betriebsrente, setBetriebsrente] = useState(0);
  const [hatAndereEinkuenfte, setHatAndereEinkuenfte] = useState(false);
  const [andereEinkuenfte, setAndereEinkuenfte] = useState(0);
  
  // Persönliches
  const [verheiratet, setVerheiratet] = useState(false);
  const [partnerEinkommen, setPartnerEinkommen] = useState(0);
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0);
  const [hatKinder, setHatKinder] = useState(false);
  const [alter, setAlter] = useState(67);
  
  // Zusätzliche Abzüge
  const [krankheitskosten, setKrankheitskosten] = useState(0);
  const [pflegekosten, setPflegekosten] = useState(0);
  const [spenden, setSpenden] = useState(0);

  const ergebnis = useMemo(() => {
    // === 1. Gesetzliche Rente: Besteuerungsanteil ===
    const besteuerungsanteil = getBesteuerungsanteil(jahrRentenbeginn);
    const rentenfreibetragProzent = 100 - besteuerungsanteil;
    
    const jahresrenteBrutto = monatlicheRente * 12;
    const steuerpflichtigerTeil = jahresrenteBrutto * (besteuerungsanteil / 100);
    const rentenfreibetrag = jahresrenteBrutto * (rentenfreibetragProzent / 100);
    
    // === 2. Private Leibrente: Ertragsanteil ===
    // Ertragsanteil hängt vom Alter bei Rentenbeginn ab (§22 Nr. 1a bb EStG)
    const ertragsanteilTabelle: { [alter: number]: number } = {
      60: 22, 61: 22, 62: 21, 63: 20, 64: 19, 65: 18, 66: 18, 67: 17,
      68: 16, 69: 15, 70: 15, 71: 14, 72: 13, 73: 13, 74: 12, 75: 11,
      76: 11, 77: 10, 78: 9, 79: 9, 80: 8, 81: 8, 82: 7, 83: 7, 84: 6,
      85: 6, 86: 5, 87: 5, 88: 4, 89: 4, 90: 3, 91: 3, 92: 2, 93: 2, 94: 1
    };
    
    const ertragsanteil = ertragsanteilTabelle[ertragsanteilAlter] || 18;
    const privateRenteJahr = hatPrivateRente ? privateRente * 12 : 0;
    const steuerpflichtigePrivateRente = privateRenteJahr * (ertragsanteil / 100);
    
    // === 3. Betriebsrente: voll steuerpflichtig (wenn aus Entgeltumwandlung) ===
    const betriebsrenteJahr = hatBetriebsrente ? betriebsrente * 12 : 0;
    
    // === 4. Gesamteinkünfte ===
    const einkuenfteGesRente = steuerpflichtigerTeil;
    const einkuenftePriRente = steuerpflichtigePrivateRente;
    const einkuenfteBetriebsrente = betriebsrenteJahr;
    const sonstigeEinkuenfte = hatAndereEinkuenfte ? andereEinkuenfte : 0;
    
    // Partner bei Zusammenveranlagung
    const partnerJahreseinkommen = verheiratet ? partnerEinkommen * 12 : 0;
    
    const gesamteinkuenfte = einkuenfteGesRente + einkuenftePriRente + 
                             einkuenfteBetriebsrente + sonstigeEinkuenfte +
                             partnerJahreseinkommen;
    
    // === 5. Abzüge ===
    // Werbungskosten-Pauschbetrag für Rentner (§9a EStG)
    const werbungskostenPauschbetrag = WERBUNGSKOSTEN_PAUSCHALE_RENTE;
    
    // Sonderausgaben-Pauschbetrag
    const sonderausgabenPauschbetrag = verheiratet 
      ? SONDERAUSGABEN_PAUSCHBETRAG_VERHEIRATET 
      : SONDERAUSGABEN_PAUSCHBETRAG;
    
    // Sonderausgaben: Spenden (bis 20% des Gesamtbetrags der Einkünfte)
    const spendenAbzug = Math.min(spenden, gesamteinkuenfte * 0.2);
    
    // Außergewöhnliche Belastungen (mit zumutbarer Belastung)
    // Vereinfacht: Wir ignorieren die zumutbare Belastung hier
    const agBelastungen = krankheitskosten + pflegekosten;
    
    // Kranken-/Pflegeversicherung als Sonderausgaben
    // Beiträge auf die gesetzliche Rente (Basisbeiträge KV+PV)
    const kvAnteil = jahresrenteBrutto * (KV_BEITRAG + KV_ZUSATZBEITRAG);
    let pvAnteil = jahresrenteBrutto * PV_BEITRAG;
    if (!hatKinder && alter >= 23) {
      pvAnteil += jahresrenteBrutto * PV_ZUSCHLAG_KINDERLOS;
    }
    const svBeitraegeJahr = kvAnteil + pvAnteil;
    
    // Vorsorgeaufwendungen sind abzugsfähig
    const vorsorgeabzug = svBeitraegeJahr;
    
    // === 6. Zu versteuerndes Einkommen (zvE) ===
    const abzuegeGesamt = werbungskostenPauschbetrag + sonderausgabenPauschbetrag +
                          spendenAbzug + vorsorgeabzug + agBelastungen;
    
    const zvE = Math.max(0, gesamteinkuenfte - abzuegeGesamt);
    
    // === 7. Steuerberechnung ===
    const grundfreibetrag = verheiratet ? GRUNDFREIBETRAG_VERHEIRATET_2026 : GRUNDFREIBETRAG_2026;
    
    const einkommensteuer = berechneEinkommensteuer(zvE, verheiratet);
    const soli = berechneSoli(einkommensteuer, verheiratet);
    const kirchensteuer = berechneKirchensteuer(einkommensteuer, kirchensteuerSatz);
    
    const steuernGesamt = einkommensteuer + soli + kirchensteuer;
    
    // === 8. Steuersätze ===
    const durchschnittssteuersatz = zvE > 0 ? (einkommensteuer / zvE) * 100 : 0;
    const grenzsteuersatz = berechneGrenzsteuersatz(zvE, verheiratet);
    
    // === 9. Monatliche Beträge ===
    const steuerMonatlich = steuernGesamt / 12;
    const kvMonatlich = kvAnteil / 12;
    const pvMonatlich = pvAnteil / 12;
    
    // === 10. Netto-Rente ===
    // Nur auf die gesetzliche Rente bezogen
    const abzuegeAufRenteMonatlich = (svBeitraegeJahr / 12) + steuerMonatlich;
    const nettoRenteMonatlich = monatlicheRente - (svBeitraegeJahr / 12) - steuerMonatlich;
    
    // Gesamtes monatliches Einkommen nach Steuern
    const bruttoGesamtMonatlich = jahresrenteBrutto / 12 + privateRenteJahr / 12 + 
                                   betriebsrenteJahr / 12 + sonstigeEinkuenfte / 12 +
                                   partnerJahreseinkommen / 12;
    const nettoGesamtMonatlich = bruttoGesamtMonatlich - steuerMonatlich - (svBeitraegeJahr / 12);
    
    // === 11. Muss Steuererklärung abgegeben werden? ===
    const pflichtVeranlagung = zvE > grundfreibetrag || 
                               kirchensteuerSatz > 0 || 
                               hatAndereEinkuenfte ||
                               (verheiratet && partnerEinkommen > 0);
    
    return {
      // Gesetzliche Rente
      jahresrenteBrutto,
      besteuerungsanteil,
      rentenfreibetragProzent,
      rentenfreibetrag,
      steuerpflichtigerTeil,
      
      // Private Rente
      privateRenteJahr,
      ertragsanteil,
      steuerpflichtigePrivateRente,
      
      // Betriebsrente
      betriebsrenteJahr,
      
      // Einkünfte
      gesamteinkuenfte,
      sonstigeEinkuenfte,
      partnerJahreseinkommen,
      
      // Abzüge
      werbungskostenPauschbetrag,
      sonderausgabenPauschbetrag,
      spendenAbzug,
      vorsorgeabzug,
      agBelastungen,
      abzuegeGesamt,
      
      // Steuer
      zvE,
      grundfreibetrag,
      einkommensteuer,
      soli,
      kirchensteuer,
      steuernGesamt,
      
      // Steuersätze
      durchschnittssteuersatz,
      grenzsteuersatz,
      
      // Monatlich
      steuerMonatlich,
      kvMonatlich,
      pvMonatlich,
      svBeitraegeJahr,
      nettoRenteMonatlich,
      bruttoGesamtMonatlich,
      nettoGesamtMonatlich,
      
      // Pflicht
      pflichtVeranlagung,
      
      // Konstanten
      monatlicheRente,
      jahrRentenbeginn,
    };
  }, [monatlicheRente, jahrRentenbeginn, hatPrivateRente, privateRente, ertragsanteilAlter,
      hatBetriebsrente, betriebsrente, hatAndereEinkuenfte, andereEinkuenfte,
      verheiratet, partnerEinkommen, kirchensteuerSatz, hatKinder, alter,
      krankheitskosten, pflegekosten, spenden]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  // Besteuerungsanteil-Tabelle für Anzeige
  const tabelle = [
    { jahr: 2020, anteil: 80 },
    { jahr: 2021, anteil: 81 },
    { jahr: 2022, anteil: 82 },
    { jahr: 2023, anteil: 82.5 },
    { jahr: 2024, anteil: 83 },
    { jahr: 2025, anteil: 83.5 },
    { jahr: 2026, anteil: 84 },
    { jahr: 2027, anteil: 84.5 },
    { jahr: 2028, anteil: 85 },
    { jahr: 2029, anteil: 85.5 },
    { jahr: 2030, anteil: 86 },
    { jahr: 2035, anteil: 88.5 },
    { jahr: 2040, anteil: 91 },
    { jahr: 2050, anteil: 96 },
    { jahr: 2058, anteil: 100 },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Gesetzliche Rente */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliche Brutto-Rente (gesetzlich)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Ihre gesetzliche Altersrente vor Abzügen
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={monatlicheRente}
              onChange={(e) => setMonatlicheRente(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              max="5000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
          </div>
          <input
            type="range"
            value={monatlicheRente}
            onChange={(e) => setMonatlicheRente(Number(e.target.value))}
            className="w-full mt-3 accent-teal-500"
            min="500"
            max="3500"
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>500 €</span>
            <span>Ø 1.543 €</span>
            <span>3.500 €</span>
          </div>
        </div>

        {/* Jahr des Rentenbeginns */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jahr des Rentenbeginns</span>
            <span className="text-xs text-gray-500 block mt-1">
              Bestimmt den steuerpflichtigen Anteil Ihrer Rente
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setJahrRentenbeginn(Math.max(2005, jahrRentenbeginn - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center min-w-[100px]">
              <span className="text-3xl font-bold text-gray-800">{jahrRentenbeginn}</span>
            </div>
            <button
              onClick={() => setJahrRentenbeginn(Math.min(2058, jahrRentenbeginn + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
          <div className="mt-3 text-center">
            <span className={`inline-block px-4 py-2 rounded-lg font-medium ${
              ergebnis.besteuerungsanteil < 85 ? 'bg-green-100 text-green-800' :
              ergebnis.besteuerungsanteil < 95 ? 'bg-amber-100 text-amber-800' :
              'bg-red-100 text-red-800'
            }`}>
              Besteuerungsanteil: {ergebnis.besteuerungsanteil}% 
              <span className="text-sm font-normal ml-1">(Freibetrag: {ergebnis.rentenfreibetragProzent}%)</span>
            </span>
          </div>
        </div>

        {/* Veranlagung */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Veranlagungsart</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setVerheiratet(false); setPartnerEinkommen(0); }}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !verheiratet
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Einzelveranlagung
            </button>
            <button
              onClick={() => setVerheiratet(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                verheiratet
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Zusammenveranlagung
            </button>
          </div>
        </div>

        {/* Partner-Einkommen bei Zusammenveranlagung */}
        {verheiratet && (
          <div className="mb-6 p-4 bg-teal-50 rounded-xl">
            <label className="block mb-2">
              <span className="text-teal-700 font-medium">Einkommen des Partners (monatlich)</span>
              <span className="text-xs text-teal-600 block mt-1">
                Rente oder andere Einkünfte des Ehepartners
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={partnerEinkommen}
                onChange={(e) => setPartnerEinkommen(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none bg-white"
                min="0"
                step="50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
            </div>
          </div>
        )}

        {/* Kirchensteuer */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Kirchensteuer</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { wert: 0, label: 'Keine' },
              { wert: 0.08, label: '8% (BY/BW)' },
              { wert: 0.09, label: '9% (Rest)' },
            ].map((option) => (
              <button
                key={option.wert}
                onClick={() => setKirchensteuerSatz(option.wert)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  kirchensteuerSatz === option.wert
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hatKinder}
              onChange={(e) => setHatKinder(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Ich habe Kinder</span>
              <span className="text-xs text-gray-500 block">
                Ohne Kinder: +0,6% höherer PV-Beitrag ab 23 Jahren
              </span>
            </div>
          </label>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Weitere Renten */}
        <h3 className="font-bold text-gray-800 mb-4">📋 Weitere Renteneinkünfte</h3>

        {/* Private Rente */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={hatPrivateRente}
              onChange={(e) => setHatPrivateRente(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <span className="text-gray-700 font-medium">Private Leibrente</span>
          </label>
          
          {hatPrivateRente && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="relative">
                <input
                  type="number"
                  value={privateRente}
                  onChange={(e) => setPrivateRente(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
                  min="0"
                  step="25"
                  placeholder="Monatliche private Rente"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Alter bei Rentenbeginn (für Ertragsanteil):
                </label>
                <select
                  value={ertragsanteilAlter}
                  onChange={(e) => setErtragsanteilAlter(Number(e.target.value))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-teal-500"
                >
                  {[60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 75, 80, 85].map(a => (
                    <option key={a} value={a}>{a} Jahre</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Ertragsanteil bei {ertragsanteilAlter} Jahren: {ergebnis.ertragsanteil}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Betriebsrente */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={hatBetriebsrente}
              onChange={(e) => setHatBetriebsrente(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Betriebsrente / Riester-Rente</span>
              <span className="text-xs text-gray-500 block">Voll steuerpflichtig (nachgelagerte Besteuerung)</span>
            </div>
          </label>
          
          {hatBetriebsrente && (
            <div className="relative">
              <input
                type="number"
                value={betriebsrente}
                onChange={(e) => setBetriebsrente(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
                min="0"
                step="25"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
            </div>
          )}
        </div>

        {/* Andere Einkünfte */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={hatAndereEinkuenfte}
              onChange={(e) => setHatAndereEinkuenfte(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Weitere Einkünfte</span>
              <span className="text-xs text-gray-500 block">Vermietung, Kapitalerträge, etc. (jährlich)</span>
            </div>
          </label>
          
          {hatAndereEinkuenfte && (
            <div className="relative">
              <input
                type="number"
                value={andereEinkuenfte}
                onChange={(e) => setAndereEinkuenfte(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
                min="0"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Jahr</span>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">💰 Ihre Steuerbelastung</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.steuernGesamt)}</span>
            <span className="text-xl opacity-80">pro Jahr</span>
          </div>
          <p className="text-teal-100 mt-2">
            = {formatEuro(ergebnis.steuerMonatlich)} pro Monat
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Durchschnittssteuersatz</span>
            <div className="text-xl font-bold">{formatProzent(ergebnis.durchschnittssteuersatz)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Grenzsteuersatz</span>
            <div className="text-xl font-bold">{formatProzent(ergebnis.grenzsteuersatz)}</div>
          </div>
        </div>

        {ergebnis.zvE <= ergebnis.grundfreibetrag && (
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-lg font-bold">🎉 Keine Steuern!</span>
            <p className="text-sm opacity-90 mt-1">
              Ihr zu versteuerndes Einkommen liegt unter dem Grundfreibetrag von {formatEuroRound(ergebnis.grundfreibetrag)}
            </p>
          </div>
        )}
      </div>

      {/* Netto-Rente */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 Von Brutto zu Netto</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Brutto-Rente (gesetzlich)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.monatlicheRente)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Krankenversicherung (ca. {((KV_BEITRAG + KV_ZUSATZBEITRAG) * 100).toFixed(1)}%)</span>
            <span>{formatEuro(ergebnis.kvMonatlich)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Pflegeversicherung ({!hatKinder && alter >= 23 ? '2,4%' : '1,8%'})</span>
            <span>{formatEuro(ergebnis.pvMonatlich)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Einkommensteuer + Soli {kirchensteuerSatz > 0 ? '+ KiSt' : ''}</span>
            <span>{formatEuro(ergebnis.steuerMonatlich)}</span>
          </div>
          
          <div className="flex justify-between py-3 bg-teal-100 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-teal-800">= Netto-Rente</span>
            <span className="font-bold text-2xl text-teal-900">{formatEuro(ergebnis.nettoRenteMonatlich)}</span>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Steuerberechnung im Detail</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Einkünfte
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gesetzliche Rente (Brutto/Jahr)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.jahresrenteBrutto)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Davon steuerpflichtig ({ergebnis.besteuerungsanteil}%)
            </span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.steuerpflichtigerTeil)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>Steuerfrei (Rentenfreibetrag {ergebnis.rentenfreibetragProzent}%)</span>
            <span>{formatEuro(ergebnis.rentenfreibetrag)}</span>
          </div>
          
          {hatPrivateRente && privateRente > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                Private Rente ({ergebnis.ertragsanteil}% Ertragsanteil)
              </span>
              <span className="text-gray-900">+ {formatEuro(ergebnis.steuerpflichtigePrivateRente)}</span>
            </div>
          )}
          
          {hatBetriebsrente && betriebsrente > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Betriebsrente (100% steuerpflichtig)</span>
              <span className="text-gray-900">+ {formatEuro(ergebnis.betriebsrenteJahr)}</span>
            </div>
          )}
          
          {ergebnis.sonstigeEinkuenfte > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Weitere Einkünfte</span>
              <span className="text-gray-900">+ {formatEuro(ergebnis.sonstigeEinkuenfte)}</span>
            </div>
          )}
          
          {ergebnis.partnerJahreseinkommen > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Partner-Einkommen</span>
              <span className="text-gray-900">+ {formatEuro(ergebnis.partnerJahreseinkommen)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= Summe Einkünfte</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.gesamteinkuenfte)}</span>
          </div>
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Abzüge
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>− Werbungskosten-Pauschbetrag</span>
            <span>{formatEuro(ergebnis.werbungskostenPauschbetrag)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>− Sonderausgaben-Pauschbetrag</span>
            <span>{formatEuro(ergebnis.sonderausgabenPauschbetrag)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>− Vorsorgeaufwendungen (KV/PV)</span>
            <span>{formatEuro(ergebnis.vorsorgeabzug)}</span>
          </div>
          
          {ergebnis.spendenAbzug > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− Spenden</span>
              <span>{formatEuro(ergebnis.spendenAbzug)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 bg-teal-50 -mx-6 px-6">
            <span className="font-medium text-teal-700">= Zu versteuerndes Einkommen</span>
            <span className="font-bold text-teal-900">{formatEuro(ergebnis.zvE)}</span>
          </div>
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Steuerberechnung
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Grundfreibetrag {verheiratet ? '(zusammen)' : ''}</span>
            <span className="text-green-600">steuerfrei: {formatEuro(ergebnis.grundfreibetrag)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Einkommensteuer</span>
            <span className="text-gray-900">{formatEuro(ergebnis.einkommensteuer)}</span>
          </div>
          
          {ergebnis.soli > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">+ Solidaritätszuschlag (5,5%)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.soli)}</span>
            </div>
          )}
          
          {ergebnis.kirchensteuer > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">+ Kirchensteuer ({(kirchensteuerSatz * 100).toFixed(0)}%)</span>
              <span className="text-gray-900">{formatEuro(ergebnis.kirchensteuer)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-3 bg-red-50 -mx-6 px-6">
            <span className="font-bold text-red-800">= Steuern gesamt (Jahr)</span>
            <span className="font-bold text-2xl text-red-900">{formatEuro(ergebnis.steuernGesamt)}</span>
          </div>
        </div>
      </div>

      {/* Besteuerungsanteil Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📅 Besteuerungsanteil nach Rentenbeginn</h3>
        <p className="text-sm text-gray-600 mb-4">
          Der Rentenfreibetrag wird im Jahr des Rentenbeginns festgelegt und bleibt als €-Betrag lebenslang gleich.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Rentenbeginn</th>
                <th className="px-3 py-2 text-right">Steuerpflichtig</th>
                <th className="px-3 py-2 text-right">Steuerfrei</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tabelle.map((row) => (
                <tr key={row.jahr} className={row.jahr === jahrRentenbeginn ? 'bg-teal-50 font-bold' : ''}>
                  <td className="px-3 py-2">{row.jahr}{row.jahr === 2058 && '+'}</td>
                  <td className="px-3 py-2 text-right">{row.anteil}%</td>
                  <td className="px-3 py-2 text-right text-green-600">{100 - row.anteil}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Steuererklärung Pflicht */}
      <div className={`rounded-2xl shadow-lg p-6 mb-6 ${
        ergebnis.pflichtVeranlagung ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'
      }`}>
        <h3 className={`font-bold mb-3 ${
          ergebnis.pflichtVeranlagung ? 'text-amber-800' : 'text-green-800'
        }`}>
          📋 Muss ich eine Steuererklärung abgeben?
        </h3>
        
        {ergebnis.pflichtVeranlagung ? (
          <div className="text-amber-700">
            <p className="font-medium mb-2">⚠️ Ja, wahrscheinlich Pflicht zur Steuererklärung:</p>
            <ul className="space-y-1 text-sm">
              {ergebnis.zvE > ergebnis.grundfreibetrag && (
                <li>• Zu versteuerndes Einkommen über Grundfreibetrag</li>
              )}
              {kirchensteuerSatz > 0 && (
                <li>• Kirchensteuerpflicht</li>
              )}
              {hatAndereEinkuenfte && (
                <li>• Weitere Einkünfte vorhanden</li>
              )}
              {verheiratet && partnerEinkommen > 0 && (
                <li>• Zusammenveranlagung mit Partnereinkommen</li>
              )}
            </ul>
          </div>
        ) : (
          <div className="text-green-700">
            <p className="font-medium">✅ Wahrscheinlich keine Pflicht</p>
            <p className="text-sm mt-1">
              Ihr zu versteuerndes Einkommen liegt unter dem Grundfreibetrag.
              Eine freiwillige Abgabe kann sich aber lohnen!
            </p>
          </div>
        )}
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Rentenfreibetrag:</strong> Wird im ersten vollen Rentenjahr festgelegt und gilt lebenslang als fester €-Betrag</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Rentenerhöhungen:</strong> Werden zu 100% steuerpflichtig (kein zusätzlicher Freibetrag)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Doppelbesteuerung:</strong> Der BFH prüft aktuell, ob eine unzulässige Doppelbesteuerung vorliegt</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Altersentlastungsbetrag:</strong> Für Rentner ab 64 Jahren gibt es zusätzliche Entlastungen (hier nicht berücksichtigt)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Zumutbare Belastung:</strong> Bei außergewöhnlichen Belastungen wird ein Eigenanteil abgezogen (vereinfacht dargestellt)</span>
          </li>
        </ul>
      </div>

      {/* So funktioniert's */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Rentenbesteuerung</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">1</span>
            <div>
              <p className="font-medium text-gray-800">Besteuerungsanteil nach Rentenbeginn</p>
              <p>Je später der Rentenbeginn, desto höher der steuerpflichtige Anteil (2026: 84%)</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">2</span>
            <div>
              <p className="font-medium text-gray-800">Rentenfreibetrag bleibt konstant</p>
              <p>Der steuerfreie Teil wird im ersten Jahr berechnet und gilt lebenslang in €</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">3</span>
            <div>
              <p className="font-medium text-gray-800">Grundfreibetrag beachten</p>
              <p>2026: {formatEuroRound(GRUNDFREIBETRAG_2026)} (Single) / {formatEuroRound(GRUNDFREIBETRAG_VERHEIRATET_2026)} (Verheiratet) bleiben steuerfrei</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">4</span>
            <div>
              <p className="font-medium text-gray-800">Vollständige Besteuerung ab 2058</p>
              <p>Wer 2058 oder später in Rente geht, muss 100% der Rente versteuern</p>
            </div>
          </div>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden</h3>
        <div className="space-y-4">
          <div className="bg-teal-50 rounded-xl p-4">
            <p className="font-semibold text-teal-900">Finanzamt</p>
            <p className="text-sm text-teal-700 mt-1">
              Die Steuererklärung wird beim örtlichen Finanzamt eingereicht.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">ELSTER Online</p>
                <a 
                  href="https://www.elster.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  elster.de →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🧮</span>
              <div>
                <p className="font-medium text-gray-800">BMF Steuerrechner</p>
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
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Anlage R der Steuererklärung</p>
              <p className="text-gray-600 mt-1">
                Renten werden in der Anlage R erklärt. Für Alterseinkünfte gibt es in einigen 
                Bundesländern auch die vereinfachte Erklärung für Rentner.
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
            href="https://www.gesetze-im-internet.de/estg/__22.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 22 EStG – Arten der sonstigen Einkünfte (Rentenbesteuerung)
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 32a EStG – Einkommensteuer-Tarif 2026
          </a>
          <a 
            href="https://www.bmf-steuerrechner.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF Steuerrechner – Offizieller Rechner des Bundesfinanzministeriums
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – Informationen zur Rentenbesteuerung
          </a>
        </div>
      </div>
    </div>
  );
}
