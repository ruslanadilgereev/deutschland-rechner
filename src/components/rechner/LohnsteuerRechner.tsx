import { useState, useMemo } from 'react';

// Lohnsteuer-Werte 2026 (basierend auf EStG §32a und Lohnsteuertarif)
const GRUNDFREIBETRAG_2026 = 12096; // Erhöht für 2026
const SPITZENSTEUERSATZ_GRENZE = 68480; // Beginn 42%
const REICHENSTEUERSATZ_GRENZE = 277826; // Beginn 45%

// Lohnsteuer-Konstanten 2026
const LOHNSTEUER_PARAMS_2026 = {
  zone2Start: 12097,
  zone2End: 17443,
  zone3Start: 17444,
  zone3End: 68480,
  zone4Start: 68481,
  zone4End: 277826,
  zone5Start: 277827,
};

// Solidaritätszuschlag
const SOLI_SATZ = 0.055; // 5,5%
const SOLI_FREIGRENZE_MONAT_SK1 = 1628.33; // Ca. 19.540€/Jahr (Freigrenze 2026)
const SOLI_FREIGRENZE_MONAT_SK3 = 3072.50; // Ca. 36.870€/Jahr

// Kirchensteuer nach Bundesland
const KIRCHENSTEUER_SAETZE: Record<string, number> = {
  'Baden-Württemberg': 0.08,
  'Bayern': 0.08,
  'Berlin': 0.09,
  'Brandenburg': 0.09,
  'Bremen': 0.09,
  'Hamburg': 0.09,
  'Hessen': 0.09,
  'Mecklenburg-Vorpommern': 0.09,
  'Niedersachsen': 0.09,
  'Nordrhein-Westfalen': 0.09,
  'Rheinland-Pfalz': 0.09,
  'Saarland': 0.09,
  'Sachsen': 0.09,
  'Sachsen-Anhalt': 0.09,
  'Schleswig-Holstein': 0.09,
  'Thüringen': 0.09,
};

// Steuerklassen-Beschreibungen
const STEUERKLASSEN_INFO = {
  1: { name: 'Steuerklasse I', beschreibung: 'Ledige, Geschiedene, Verwitwete' },
  2: { name: 'Steuerklasse II', beschreibung: 'Alleinerziehende mit Kind(ern)' },
  3: { name: 'Steuerklasse III', beschreibung: 'Verheiratete (Alleinverdiener/Mehrverdiener)' },
  4: { name: 'Steuerklasse IV', beschreibung: 'Verheiratete (beide verdienen ähnlich)' },
  5: { name: 'Steuerklasse V', beschreibung: 'Verheiratete (Geringverdiener-Partner zu III)' },
  6: { name: 'Steuerklasse VI', beschreibung: 'Zweit- oder Nebenjob' },
};

// Kinderfreibeträge 2026 (jährlich, pro Kind)
const KINDERFREIBETRAG_2026 = 6672; // inkl. BEA-Freibetrag
const KINDERFREIBETRAG_MONAT = KINDERFREIBETRAG_2026 / 12;

// Vorsorgepauschale-Berechnung (vereinfacht für 2026)
function berechneVorsorgepauschale(brutto: number, steuerklasse: number): number {
  // Vereinfachte Berechnung - in der Realität komplexer
  const rvAnteil = Math.min(brutto * 0.093, 7850 * 0.093); // RV-Beitrag (AG-Anteil simuliert)
  const kvAnteil = Math.min(brutto * 0.07, 5512.50 * 0.07); // KV-Basisanteil
  return rvAnteil + kvAnteil;
}

// Lohnsteuer-Berechnung nach Einkommensteuer-Tarif 2026
function berechneLohnsteuerJahr(zvE: number): number {
  if (zvE <= 0) return 0;
  
  const z = zvE; // zu versteuerndes Einkommen
  
  // Zone 1: Grundfreibetrag (0%)
  if (z <= GRUNDFREIBETRAG_2026) {
    return 0;
  }
  
  // Zone 2: Progressionszone 1 (14-24%)
  if (z <= LOHNSTEUER_PARAMS_2026.zone2End) {
    const y = (z - GRUNDFREIBETRAG_2026) / 10000;
    return Math.floor((979.18 * y + 1400) * y);
  }
  
  // Zone 3: Progressionszone 2 (24-42%)
  if (z <= LOHNSTEUER_PARAMS_2026.zone3End) {
    const y = (z - LOHNSTEUER_PARAMS_2026.zone2End) / 10000;
    return Math.floor((192.59 * y + 2397) * y + 966.53);
  }
  
  // Zone 4: Proportionalzone 1 (42%)
  if (z <= LOHNSTEUER_PARAMS_2026.zone4End) {
    return Math.floor(0.42 * z - 10636.31);
  }
  
  // Zone 5: Proportionalzone 2 (45%)
  return Math.floor(0.45 * z - 18971.21);
}

export default function LohnsteuerRechner() {
  // Eingabewerte
  const [bruttolohn, setBruttolohn] = useState(4000);
  const [steuerklasse, setSteuerklasse] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [bundesland, setBundesland] = useState('Nordrhein-Westfalen');
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const [zeitraum, setZeitraum] = useState<'monat' | 'jahr'>('monat');
  const [rentenversicherung, setRentenversicherung] = useState(true);
  const [krankenversicherung, setKrankenversicherung] = useState(true);

  const ergebnis = useMemo(() => {
    // Jahres-Brutto berechnen
    const jahresBrutto = bruttolohn * 12;
    
    // === 1. Zu versteuerndes Einkommen (zvE) berechnen ===
    // Vorsorgepauschale (vereinfacht)
    const vorsorgepauschaleMonat = berechneVorsorgepauschale(bruttolohn, steuerklasse);
    const vorsorgepauschaleJahr = vorsorgepauschaleMonat * 12;
    
    // Werbungskostenpauschale
    const werbungskosten = 1230; // 2026
    
    // Sonderausgabenpauschale
    const sonderausgaben = 36;
    
    // Kinderfreibetrag (bei Steuerklasse 1, 2, 3, 4 relevant für Berechnung)
    const kinderfreibetragJahr = anzahlKinder * KINDERFREIBETRAG_2026 * 
      (steuerklasse === 3 || steuerklasse === 4 ? 1 : 0.5);
    
    // Entlastungsbetrag Alleinerziehende (Steuerklasse 2)
    const entlastungsbetrag = steuerklasse === 2 ? 4260 + (anzahlKinder > 1 ? (anzahlKinder - 1) * 240 : 0) : 0;
    
    // zvE berechnen (vereinfacht)
    let zvE = jahresBrutto - vorsorgepauschaleJahr - werbungskosten - sonderausgaben;
    
    // Für SK 2: Entlastungsbetrag abziehen
    if (steuerklasse === 2) {
      zvE -= entlastungsbetrag;
    }
    
    // Für SK 3: Doppelter Grundfreibetrag wird im Tarif berücksichtigt
    // Für SK 5/6: Kein Grundfreibetrag
    
    zvE = Math.max(0, zvE);
    
    // === 2. Lohnsteuer berechnen ===
    let lohnsteuerJahr = berechneLohnsteuerJahr(zvE);
    
    // Steuerklassen-Anpassungen
    if (steuerklasse === 3) {
      // Splittingtarif: zvE halbieren, Steuer verdoppeln
      const zvEHalb = zvE / 2;
      lohnsteuerJahr = berechneLohnsteuerJahr(zvEHalb) * 2;
    } else if (steuerklasse === 5) {
      // Steuerklasse V: Höhere Besteuerung (Partner hat SK 3)
      // Vereinfacht: Zusätzlicher Zuschlag
      lohnsteuerJahr = lohnsteuerJahr * 1.25;
    } else if (steuerklasse === 6) {
      // Steuerklasse VI: Kein Grundfreibetrag
      lohnsteuerJahr = berechneLohnsteuerJahr(jahresBrutto - vorsorgepauschaleJahr);
    }
    
    lohnsteuerJahr = Math.max(0, Math.round(lohnsteuerJahr));
    const lohnsteuerMonat = lohnsteuerJahr / 12;
    
    // === 3. Solidaritätszuschlag berechnen ===
    // Freigrenze prüfen
    const soliFreigrenze = steuerklasse === 3 ? SOLI_FREIGRENZE_MONAT_SK3 * 12 : SOLI_FREIGRENZE_MONAT_SK1 * 12;
    let soliJahr = 0;
    
    if (lohnsteuerJahr > soliFreigrenze) {
      // Milderungszone: 11,9% auf den Betrag über der Freigrenze, max. 5,5% der Lohnsteuer
      const ueberFreigrenze = lohnsteuerJahr - soliFreigrenze;
      const soliMilderung = ueberFreigrenze * 0.119;
      const soliVoll = lohnsteuerJahr * SOLI_SATZ;
      soliJahr = Math.min(soliMilderung, soliVoll);
    }
    soliJahr = Math.round(soliJahr * 100) / 100;
    const soliMonat = soliJahr / 12;
    
    // === 4. Kirchensteuer berechnen ===
    const kirchensteuerSatz = kirchensteuer ? KIRCHENSTEUER_SAETZE[bundesland] || 0.09 : 0;
    const kirchensteuerJahr = Math.round(lohnsteuerJahr * kirchensteuerSatz);
    const kirchensteuerMonat = kirchensteuerJahr / 12;
    
    // === 5. Gesamte Lohnsteuerabzüge ===
    const gesamtSteuerJahr = lohnsteuerJahr + soliJahr + kirchensteuerJahr;
    const gesamtSteuerMonat = gesamtSteuerJahr / 12;
    
    // === 6. Grenzsteuersatz berechnen ===
    // Marginaler Steuersatz für nächsten verdienten Euro
    let grenzsteuersatz = 0;
    if (zvE <= GRUNDFREIBETRAG_2026) {
      grenzsteuersatz = 0;
    } else if (zvE <= LOHNSTEUER_PARAMS_2026.zone2End) {
      // Zone 2: 14-24%
      grenzsteuersatz = 14 + ((zvE - GRUNDFREIBETRAG_2026) / (LOHNSTEUER_PARAMS_2026.zone2End - GRUNDFREIBETRAG_2026)) * 10;
    } else if (zvE <= LOHNSTEUER_PARAMS_2026.zone3End) {
      // Zone 3: 24-42%
      grenzsteuersatz = 24 + ((zvE - LOHNSTEUER_PARAMS_2026.zone2End) / (LOHNSTEUER_PARAMS_2026.zone3End - LOHNSTEUER_PARAMS_2026.zone2End)) * 18;
    } else if (zvE <= LOHNSTEUER_PARAMS_2026.zone4End) {
      grenzsteuersatz = 42;
    } else {
      grenzsteuersatz = 45;
    }
    
    // Durchschnittssteuersatz
    const durchschnittssteuersatz = jahresBrutto > 0 ? (lohnsteuerJahr / jahresBrutto) * 100 : 0;
    
    // === 7. Steuerersparnis durch Kinder (Vergleich) ===
    const lohnsteuerOhneKinder = steuerklasse === 3 
      ? berechneLohnsteuerJahr(zvE / 2 + kinderfreibetragJahr / 2) * 2
      : berechneLohnsteuerJahr(zvE + kinderfreibetragJahr);
    const steuerersparnisKinder = Math.max(0, lohnsteuerOhneKinder - lohnsteuerJahr);
    
    return {
      // Eingangswerte
      bruttolohn,
      jahresBrutto,
      steuerklasse,
      
      // Abzüge vor Steuer
      vorsorgepauschaleMonat,
      vorsorgepauschaleJahr,
      werbungskosten,
      sonderausgaben,
      entlastungsbetrag,
      kinderfreibetragJahr,
      
      // Zu versteuerndes Einkommen
      zvE,
      
      // Lohnsteuer
      lohnsteuerMonat,
      lohnsteuerJahr,
      
      // Soli
      soliMonat,
      soliJahr,
      soliFreigrenze,
      
      // Kirchensteuer
      kirchensteuerMonat,
      kirchensteuerJahr,
      kirchensteuerSatz,
      
      // Gesamt
      gesamtSteuerMonat,
      gesamtSteuerJahr,
      
      // Steuersätze
      grenzsteuersatz,
      durchschnittssteuersatz,
      
      // Extras
      steuerersparnisKinder,
    };
  }, [bruttolohn, steuerklasse, bundesland, kirchensteuer, anzahlKinder]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bruttolohn */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatlicher Bruttolohn</span>
            <span className="text-xs text-gray-500 block mt-1">
              Regelmäßiges Arbeitsentgelt vor Steuern und Abgaben
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttolohn}
              onChange={(e) => setBruttolohn(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none"
              min="0"
              max="30000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={bruttolohn}
            onChange={(e) => setBruttolohn(Number(e.target.value))}
            className="w-full mt-3 accent-yellow-500"
            min="1000"
            max="12000"
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1.000 €</span>
            <span>6.500 €</span>
            <span>12.000 €</span>
          </div>
        </div>

        {/* Steuerklasse */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Steuerklasse</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <button
                key={sk}
                onClick={() => setSteuerklasse(sk as 1 | 2 | 3 | 4 | 5 | 6)}
                className={`py-3 px-2 rounded-xl font-bold text-lg transition-all ${
                  steuerklasse === sk
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sk}
              </button>
            ))}
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 mt-2">
            <p className="text-sm text-yellow-800">
              <strong>{STEUERKLASSEN_INFO[steuerklasse].name}:</strong> {STEUERKLASSEN_INFO[steuerklasse].beschreibung}
            </p>
          </div>
        </div>

        {/* Bundesland */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bundesland</span>
            <span className="text-xs text-gray-500 block mt-1">
              Relevant für Kirchensteuer-Satz (8% oder 9%)
            </span>
          </label>
          <select
            value={bundesland}
            onChange={(e) => setBundesland(e.target.value)}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 outline-none text-gray-700"
          >
            {Object.keys(KIRCHENSTEUER_SAETZE).map((land) => (
              <option key={land} value={land}>{land}</option>
            ))}
          </select>
        </div>

        {/* Kirchensteuer */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={kirchensteuer}
              onChange={(e) => setKirchensteuer(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
            />
            <span className="text-gray-700 font-medium">Kirchensteuerpflichtig</span>
            {kirchensteuer && (
              <span className="text-sm text-gray-500">
                ({(KIRCHENSTEUER_SAETZE[bundesland] * 100).toFixed(0)}% von der Lohnsteuer)
              </span>
            )}
          </label>
        </div>

        {/* Kinder (bei SK 1-4) */}
        {(steuerklasse <= 4) && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Anzahl Kinder</span>
              <span className="text-xs text-gray-500 block mt-1">
                Kinderfreibetrag: {formatEuro(KINDERFREIBETRAG_2026)} pro Kind/Jahr
              </span>
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setAnzahlKinder(Math.max(0, anzahlKinder - 1))}
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
              >
                −
              </button>
              <div className="text-center w-20">
                <span className="text-4xl font-bold text-gray-800">{anzahlKinder}</span>
              </div>
              <button
                onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
                className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🧾 Ihre monatliche Lohnsteuer</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.lohnsteuerMonat)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          <p className="text-yellow-100 mt-2 text-sm">
            Entspricht <strong>{formatEuroRound(ergebnis.lohnsteuerJahr)}</strong> pro Jahr
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">+ Soli</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.soliMonat)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">+ Kirchensteuer</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.kirchensteuerMonat)}</div>
          </div>
        </div>

        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium">Gesamte Steuerabzüge</span>
            <span className="text-2xl font-bold">{formatEuroRound(ergebnis.gesamtSteuerMonat)}</span>
          </div>
          <p className="text-xs text-yellow-100 mt-1">
            Pro Jahr: {formatEuroRound(ergebnis.gesamtSteuerJahr)} • Steuerklasse {steuerklasse}
          </p>
        </div>
      </div>

      {/* Steuersätze */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Ihre Steuersätze</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{formatProzent(ergebnis.grenzsteuersatz)}</div>
            <p className="text-sm text-gray-600 mt-1">Grenzsteuersatz</p>
            <p className="text-xs text-gray-400">Steuer auf nächsten Euro</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">{formatProzent(ergebnis.durchschnittssteuersatz)}</div>
            <p className="text-sm text-gray-600 mt-1">Durchschnittssteuersatz</p>
            <p className="text-xs text-gray-400">Anteil am Brutto</p>
          </div>
        </div>

        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
            style={{ width: `${Math.min(ergebnis.grenzsteuersatz / 45 * 100, 100)}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium">
            <span className="text-white drop-shadow">0%</span>
            <span className="text-white drop-shadow">14%</span>
            <span className="text-white drop-shadow">42%</span>
            <span className="text-gray-600">45%</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Ihr Grenzsteuersatz im Einkommensteuer-Tarif 2026
        </p>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          {/* Brutto */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Ausgangswerte
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Monatlicher Bruttolohn</span>
            <span className="font-bold text-gray-900">{formatEuro(bruttolohn)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Jahres-Brutto (×12)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.jahresBrutto)}</span>
          </div>
          
          {/* Abzüge */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Abzüge vor Besteuerung (jährlich)
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Vorsorgepauschale</span>
            <span>{formatEuro(ergebnis.vorsorgepauschaleJahr)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Werbungskostenpauschale</span>
            <span>{formatEuro(ergebnis.werbungskosten)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Sonderausgabenpauschale</span>
            <span>{formatEuro(ergebnis.sonderausgaben)}</span>
          </div>
          {steuerklasse === 2 && ergebnis.entlastungsbetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− Entlastungsbetrag Alleinerziehende</span>
              <span>{formatEuro(ergebnis.entlastungsbetrag)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= Zu versteuerndes Einkommen (zvE)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.zvE)}</span>
          </div>
          
          {/* Steuerberechnung */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Steuerberechnung (jährlich)
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Lohnsteuer 
              <span className="text-xs text-gray-400 ml-1">(Tarif §32a EStG)</span>
            </span>
            <span className="font-bold text-yellow-600">{formatEuro(ergebnis.lohnsteuerJahr)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              + Solidaritätszuschlag 
              <span className="text-xs text-gray-400 ml-1">(5,5%)</span>
            </span>
            <span className={ergebnis.soliJahr > 0 ? 'text-gray-900' : 'text-green-600'}>
              {ergebnis.soliJahr > 0 ? formatEuro(ergebnis.soliJahr) : '0,00 € (unter Freigrenze)'}
            </span>
          </div>
          {kirchensteuer && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                + Kirchensteuer 
                <span className="text-xs text-gray-400 ml-1">({(ergebnis.kirchensteuerSatz * 100).toFixed(0)}%)</span>
              </span>
              <span className="text-gray-900">{formatEuro(ergebnis.kirchensteuerJahr)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-3 bg-yellow-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-yellow-800">Gesamte Steuerabzüge / Jahr</span>
            <span className="font-bold text-2xl text-yellow-900">{formatEuro(ergebnis.gesamtSteuerJahr)}</span>
          </div>
          <div className="flex justify-between py-2 -mx-6 px-6">
            <span className="text-gray-600">Gesamte Steuerabzüge / Monat (÷12)</span>
            <span className="font-bold text-yellow-700">{formatEuro(ergebnis.gesamtSteuerMonat)}</span>
          </div>
        </div>
      </div>

      {/* Steuerklassen-Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔄 Steuerklassen im Vergleich</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase">
                <th className="pb-2">SK</th>
                <th className="pb-2">Für wen</th>
                <th className="pb-2 text-right">Lohnsteuer/Monat*</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5, 6].map((sk) => {
                // Vereinfachte Berechnung für Vergleich
                const factor = sk === 3 ? 0.5 : sk === 5 ? 1.5 : sk === 6 ? 1.3 : 1;
                const vergleichSteuer = ergebnis.lohnsteuerMonat * factor * (sk === steuerklasse ? 1 : 1);
                return (
                  <tr key={sk} className={steuerklasse === sk ? 'bg-yellow-50' : ''}>
                    <td className="py-2 font-bold">
                      {sk}
                      {steuerklasse === sk && <span className="ml-1 text-yellow-500">●</span>}
                    </td>
                    <td className="py-2 text-gray-600">{STEUERKLASSEN_INFO[sk as keyof typeof STEUERKLASSEN_INFO].beschreibung}</td>
                    <td className="py-2 text-right font-medium">
                      {steuerklasse === sk ? formatEuro(ergebnis.lohnsteuerMonat) : '–'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          *Exakte Berechnung nur für gewählte Steuerklasse. Wechsel Sie die SK oben für genaue Werte.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Lohnsteuer</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Quellensteuer:</strong> Lohnsteuer wird direkt vom Arbeitgeber einbehalten und ans Finanzamt abgeführt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Vorauszahlung:</strong> Die Lohnsteuer ist eine Vorauszahlung auf Ihre Einkommensteuer</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Progressiver Tarif:</strong> Je höher das Einkommen, desto höher der Steuersatz (14-45%)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Grundfreibetrag 2026:</strong> {formatEuro(GRUNDFREIBETRAG_2026)} bleiben steuerfrei</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Steuerklasse:</strong> Beeinflusst die monatliche Lohnsteuer, nicht die jährliche Steuerlast</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Steuererklärung:</strong> Über- oder Unterzahlungen werden mit der Jahressteuererklärung ausgeglichen</span>
          </li>
        </ul>
      </div>

      {/* Steuerklassen erklärt */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-yellow-800 mb-3">📚 Die 6 Steuerklassen erklärt</h3>
        <div className="space-y-3 text-sm text-yellow-700">
          <div className="bg-white/50 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-800">Steuerklasse I</h4>
            <p>Für Ledige, Geschiedene und Verwitwete ohne Kinder. Standard-Steuerklasse mit einem Grundfreibetrag.</p>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-800">Steuerklasse II</h4>
            <p>Für Alleinerziehende mit mindestens einem Kind im Haushalt. Zusätzlicher Entlastungsbetrag von {formatEuro(4260)}.</p>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-800">Steuerklasse III</h4>
            <p>Für Verheiratete: Der Partner mit dem höheren Einkommen. Doppelter Grundfreibetrag, niedrigste Abzüge.</p>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-800">Steuerklasse IV</h4>
            <p>Für Verheiratete mit ähnlichem Einkommen. Beide haben einen Grundfreibetrag. Alternativ: IV/IV mit Faktor.</p>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-800">Steuerklasse V</h4>
            <p>Für den Geringverdiener in einer III/V-Kombination. Kein Grundfreibetrag, höchste monatliche Abzüge.</p>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-800">Steuerklasse VI</h4>
            <p>Für Zweit- und Nebenjobs. Kein Grundfreibetrag, höchste Besteuerung. Pflicht ab dem zweiten Arbeitsverhältnis.</p>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Vereinfachte Berechnung:</strong> Die tatsächliche Lohnsteuer kann durch Freibeträge, Zusatzeinkünfte etc. abweichen</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Soli-Freigrenze:</strong> Seit 2021 zahlen ca. 90% der Steuerzahler keinen Soli mehr</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Steuerklassenwahl:</strong> Ehepaare können zwischen III/V und IV/IV wählen – am Jahresende gleicht sich's aus</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kinderfreibetrag vs. Kindergeld:</strong> Das Finanzamt prüft automatisch, was günstiger ist</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Steuererklärung:</strong> Oft lohnt sich eine Steuererklärung – Durchschnitt: ca. 1.000 € Erstattung</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-yellow-50 rounded-xl p-4">
            <p className="font-semibold text-yellow-900">Finanzamt</p>
            <p className="text-sm text-yellow-700 mt-1">
              Für Steuerklassenwechsel, Freibeträge und Steuererklärung ist Ihr örtliches Finanzamt zuständig.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Antrag</p>
                <a 
                  href="https://www.elster.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  ELSTER – Steuerportal →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Finanzamt-Hotline</p>
                <a 
                  href="https://www.bzst.de/DE/Service/Kontakt/kontakt_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  BZSt-Kontakt →
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Steuerklassenwechsel beantragen</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Formular: „Antrag auf Steuerklassenwechsel"</li>
                <li>• Online über ELSTER oder beim Finanzamt</li>
                <li>• Ehepaare: Einmal pro Jahr möglich (Ausnahme: Trennungsjahr)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 32a EStG – Einkommensteuertarif – Gesetze im Internet
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__38b.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 38b EStG – Lohnsteuerklassen – Gesetze im Internet
          </a>
          <a 
            href="https://www.bmf-steuerrechner.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF Steuerrechner – Bundesfinanzministerium
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/programmablaufplan.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Programmablaufplan Lohnsteuer – BMF
          </a>
          <a 
            href="https://www.elster.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ELSTER – Elektronische Steuererklärung
          </a>
        </div>
      </div>
    </div>
  );
}
