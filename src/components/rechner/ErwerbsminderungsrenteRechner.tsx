import { useState, useMemo } from 'react';

// ============================================================================
// Erwerbsminderungsrente Berechnungsgrundlagen 2026
// ============================================================================
// Rechtsgrundlage: SGB VI (Sechstes Buch Sozialgesetzbuch)
// - § 43 SGB VI: Rente wegen Erwerbsminderung
// - § 59 SGB VI: Zurechnungszeit
// - § 77 SGB VI: Zugangsfaktor
// - § 96a SGB VI: Hinzuverdienstgrenzen
//
// Quelle: https://www.deutsche-rentenversicherung.de
// Quelle: https://www.gesetze-im-internet.de/sgb_6/
// ============================================================================

// Aktueller Rentenwert (gültig 1.7.2025 - 30.6.2026)
const RENTENWERT = 40.79;

// Durchschnittsentgelt 2026 für Entgeltpunkte-Berechnung
// Quelle: Deutsche Rentenversicherung
const DURCHSCHNITTSENTGELT_2026 = 50493; // vorläufig

// Historische Durchschnittsentgelte für Entgeltpunkte-Schätzung
const DURCHSCHNITTSENTGELTE: Record<number, number> = {
  2000: 28007, 2001: 28231, 2002: 28626, 2003: 28938, 2004: 29060,
  2005: 29202, 2006: 29494, 2007: 29951, 2008: 30625, 2009: 30506,
  2010: 31144, 2011: 32100, 2012: 33002, 2013: 33659, 2014: 34514,
  2015: 35363, 2016: 36267, 2017: 37103, 2018: 38212, 2019: 39301,
  2020: 40551, 2021: 41541, 2022: 42053, 2023: 43142, 2024: 45358,
  2025: 48570, 2026: 50493,
};

// Beitragsbemessungsgrenze RV 2026 (bundesweit einheitlich)
const BBG_RV_2026 = 8050 * 12; // 96.600 €/Jahr

// Rentenartfaktoren
const RENTENARTFAKTOR = {
  voll: 1.0,    // Volle Erwerbsminderungsrente
  teilweise: 0.5 // Teilweise Erwerbsminderungsrente
};

// Zurechnungszeit-Endpunkte (schrittweise Erhöhung bis 2031)
// § 253a SGB VI - Anhebung der Altersgrenze für die Zurechnungszeit
const ZURECHNUNGSZEIT_ENDE: Record<number, { jahre: number; monate: number }> = {
  2020: { jahre: 65, monate: 9 },
  2021: { jahre: 65, monate: 10 },
  2022: { jahre: 65, monate: 11 },
  2023: { jahre: 66, monate: 0 },
  2024: { jahre: 66, monate: 1 },
  2025: { jahre: 66, monate: 2 },
  2026: { jahre: 66, monate: 3 },
  2027: { jahre: 66, monate: 5 },
  2028: { jahre: 66, monate: 7 },
  2029: { jahre: 66, monate: 9 },
  2030: { jahre: 66, monate: 11 },
  2031: { jahre: 67, monate: 0 },
};

// Abschlagsfreie Altersgrenze für EM-Rente (ebenfalls schrittweise erhöht)
const ABSCHLAGSFREIES_ALTER: Record<number, { jahre: number; monate: number }> = {
  2024: { jahre: 64, monate: 6 },
  2025: { jahre: 64, monate: 8 },
  2026: { jahre: 64, monate: 10 },
  2027: { jahre: 65, monate: 0 },
  2028: { jahre: 65, monate: 2 },
  2029: { jahre: 65, monate: 4 },
  2030: { jahre: 65, monate: 6 },
  2031: { jahre: 65, monate: 8 },
  2032: { jahre: 65, monate: 10 },
  2033: { jahre: 66, monate: 0 },
};

// Hinzuverdienstgrenzen 2026 (§ 96a SGB VI)
// Bei voller EM: 3/8 der monatlichen Bezugsgröße × 14
// Bezugsgröße 2026: 3.955€/Monat
// Volle EM: 3/8 × 3.955 × 14 = 20.763,75€/Jahr
// Quelle: Deutsche Rentenversicherung, Änderungen zum 1.1.2026
const HINZUVERDIENSTGRENZE_VOLL_2026 = 20763.75; // Euro pro Jahr
const HINZUVERDIENSTGRENZE_VOLL_MONAT = Math.round(HINZUVERDIENSTGRENZE_VOLL_2026 / 12);

// Sozialabgaben auf EM-Rente (Rentner zahlen halben Beitrag)
const ABZUEGE_RENTE = {
  krankenversicherung: 0.073,  // 7,3% (halber allg. Beitragssatz)
  zusatzbeitrag_kv: 0.0145,   // 1,45% durchschnittlicher Zusatzbeitrag
  pflegeversicherung: 0.018,  // 1,8% mit Kindern
  pflegeversicherung_kinderlos: 0.024, // 2,4% ohne Kinder
};

type EMTyp = 'voll' | 'teilweise';

interface Eingaben {
  geburtsjahr: number;
  geburtsmonat: number;
  berufseinstiegsalter: number;
  aktuelles_alter: number;
  monatsbrutto: number;
  em_typ: EMTyp;
  hat_kinder: boolean;
}

interface Berechnung {
  entgeltpunkte_bisher: number;
  entgeltpunkte_zurechnungszeit: number;
  entgeltpunkte_gesamt: number;
  zugangsfaktor: number;
  abschlag_prozent: number;
  rentenartfaktor: number;
  bruttorente: number;
  nettorente: number;
  abzuege: {
    krankenversicherung: number;
    pflegeversicherung: number;
    gesamt: number;
  };
  hinzuverdienstgrenze_jahr: number;
  hinzuverdienstgrenze_monat: number;
  zurechnungszeit_monate: number;
}

// Entgeltpunkte-Schätzung basierend auf Brutto und Beschäftigungsjahren
function schaetzeEntgeltpunkte(
  monatsbrutto: number,
  berufseinstiegsalter: number,
  aktuelles_alter: number
): number {
  const beschaeftigungsjahre = Math.max(0, aktuelles_alter - berufseinstiegsalter);
  const jahresbrutto = monatsbrutto * 12;
  
  // Durchschnittlichen EP pro Jahr berechnen (mit BBG-Deckelung)
  const gedeckeltes_brutto = Math.min(jahresbrutto, BBG_RV_2026);
  const ep_pro_jahr = gedeckeltes_brutto / DURCHSCHNITTSENTGELT_2026;
  
  return beschaeftigungsjahre * ep_pro_jahr;
}

// Zurechnungszeit in Monaten berechnen
function berechneZurechnungszeit(aktuelles_alter: number, jahr: number): number {
  const ende = ZURECHNUNGSZEIT_ENDE[jahr] || ZURECHNUNGSZEIT_ENDE[2031];
  const ende_in_monaten = ende.jahre * 12 + ende.monate;
  const aktuelles_alter_in_monaten = aktuelles_alter * 12;
  
  return Math.max(0, ende_in_monaten - aktuelles_alter_in_monaten);
}

// Abschlag berechnen (max. 10,8%)
function berechneAbschlag(aktuelles_alter: number, jahr: number): number {
  const grenze = ABSCHLAGSFREIES_ALTER[jahr] || ABSCHLAGSFREIES_ALTER[2033];
  const grenze_in_monaten = grenze.jahre * 12 + grenze.monate;
  const aktuelles_alter_in_monaten = aktuelles_alter * 12;
  
  const monate_vor_grenze = Math.max(0, grenze_in_monaten - aktuelles_alter_in_monaten);
  
  // 0,3% pro Monat, max. 10,8% (36 Monate)
  const abschlag = Math.min(10.8, monate_vor_grenze * 0.3);
  return abschlag;
}

// Hinzuverdienstgrenze für teilweise EM berechnen
// Bei teilweiser EM: Höhere Grenze basierend auf individuellem Einkommen
// Mindest-Hinzuverdienstgrenze = 2x volle EM-Grenze (Quelle: rentenfuchs.info, DRV)
function berechneHinzuverdienstgrenzeTeilweise(monatsbrutto: number): number {
  // Individuelle Berechnung: höchster EP-Wert der letzten 15 Jahre × Bezugsgröße × 9,72
  // Vereinfachung: höchstes Einkommen der letzten 15 Jahre × 0,81
  const jahresbrutto = monatsbrutto * 12;
  // Mindestens das Doppelte der vollen EM-Grenze (= 41.527,50 € in 2026)
  return Math.max(HINZUVERDIENSTGRENZE_VOLL_2026 * 2, jahresbrutto * 0.81);
}

function berechneEM(eingaben: Eingaben): Berechnung {
  const {
    aktuelles_alter,
    berufseinstiegsalter,
    monatsbrutto,
    em_typ,
    hat_kinder,
  } = eingaben;
  
  const jahr = 2026;
  
  // 1. Entgeltpunkte aus bisheriger Erwerbstätigkeit
  const entgeltpunkte_bisher = schaetzeEntgeltpunkte(
    monatsbrutto,
    berufseinstiegsalter,
    aktuelles_alter
  );
  
  // 2. Zurechnungszeit (fiktive Entgeltpunkte bis zur Regelaltersgrenze)
  const zurechnungszeit_monate = berechneZurechnungszeit(aktuelles_alter, jahr);
  
  // Durchschnittliche EP pro Jahr aus bisheriger Zeit
  const beschaeftigungsjahre = Math.max(1, aktuelles_alter - berufseinstiegsalter);
  const durchschnitt_ep_pro_jahr = entgeltpunkte_bisher / beschaeftigungsjahre;
  
  // Entgeltpunkte für Zurechnungszeit (zum gleichen Durchschnitt)
  const entgeltpunkte_zurechnungszeit = (zurechnungszeit_monate / 12) * durchschnitt_ep_pro_jahr;
  
  const entgeltpunkte_gesamt = entgeltpunkte_bisher + entgeltpunkte_zurechnungszeit;
  
  // 3. Abschlag und Zugangsfaktor
  const abschlag_prozent = berechneAbschlag(aktuelles_alter, jahr);
  const zugangsfaktor = 1 - (abschlag_prozent / 100);
  
  // 4. Rentenartfaktor
  const rentenartfaktor = RENTENARTFAKTOR[em_typ];
  
  // 5. Bruttorente berechnen
  const bruttorente = entgeltpunkte_gesamt * zugangsfaktor * rentenartfaktor * RENTENWERT;
  
  // 6. Abzüge berechnen (KV + PV)
  const kv_abzug = bruttorente * (ABZUEGE_RENTE.krankenversicherung + ABZUEGE_RENTE.zusatzbeitrag_kv);
  const pv_abzug = bruttorente * (hat_kinder ? ABZUEGE_RENTE.pflegeversicherung : ABZUEGE_RENTE.pflegeversicherung_kinderlos);
  const abzuege_gesamt = kv_abzug + pv_abzug;
  
  // 7. Nettorente
  const nettorente = bruttorente - abzuege_gesamt;
  
  // 8. Hinzuverdienstgrenzen
  const hinzuverdienstgrenze_jahr = em_typ === 'voll' 
    ? HINZUVERDIENSTGRENZE_VOLL_2026 
    : berechneHinzuverdienstgrenzeTeilweise(monatsbrutto);
  
  return {
    entgeltpunkte_bisher: Math.round(entgeltpunkte_bisher * 100) / 100,
    entgeltpunkte_zurechnungszeit: Math.round(entgeltpunkte_zurechnungszeit * 100) / 100,
    entgeltpunkte_gesamt: Math.round(entgeltpunkte_gesamt * 100) / 100,
    zugangsfaktor: Math.round(zugangsfaktor * 1000) / 1000,
    abschlag_prozent: Math.round(abschlag_prozent * 10) / 10,
    rentenartfaktor,
    bruttorente: Math.round(bruttorente * 100) / 100,
    nettorente: Math.round(nettorente * 100) / 100,
    abzuege: {
      krankenversicherung: Math.round(kv_abzug * 100) / 100,
      pflegeversicherung: Math.round(pv_abzug * 100) / 100,
      gesamt: Math.round(abzuege_gesamt * 100) / 100,
    },
    hinzuverdienstgrenze_jahr: Math.round(hinzuverdienstgrenze_jahr),
    hinzuverdienstgrenze_monat: Math.round(hinzuverdienstgrenze_jahr / 12),
    zurechnungszeit_monate,
  };
}

export default function ErwerbsminderungsrenteRechner() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [geburtsjahr, setGeburtsjahr] = useState(1980);
  const [geburtsmonat, setGeburtsmonat] = useState(1);
  const [berufseinstiegsalter, setBerufseinstiegsalter] = useState(20);
  const [monatsbrutto, setMonatsbrutto] = useState(3500);
  const [emTyp, setEmTyp] = useState<EMTyp>('voll');
  const [hatKinder, setHatKinder] = useState(true);
  const [showResults, setShowResults] = useState(false);
  
  const aktuelles_alter = currentYear - geburtsjahr;
  
  const ergebnis = useMemo(() => {
    if (!showResults) return null;
    
    return berechneEM({
      geburtsjahr,
      geburtsmonat,
      berufseinstiegsalter,
      aktuelles_alter,
      monatsbrutto,
      em_typ: emTyp,
      hat_kinder: hatKinder,
    });
  }, [showResults, geburtsjahr, geburtsmonat, berufseinstiegsalter, aktuelles_alter, monatsbrutto, emTyp, hatKinder]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Eingabeformular */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Persönliche Daten */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">👤</span>
              Persönliche Daten
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geburtsjahr
                </label>
                <select
                  value={geburtsjahr}
                  onChange={(e) => {
                    setGeburtsjahr(parseInt(e.target.value));
                    setShowResults(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 50 }, (_, i) => currentYear - 65 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geburtsmonat
                </label>
                <select
                  value={geburtsmonat}
                  onChange={(e) => {
                    setGeburtsmonat(parseInt(e.target.value));
                    setShowResults(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1, 1).toLocaleString('de-DE', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-3 text-sm text-gray-500">
              Aktuelles Alter: <strong>{aktuelles_alter} Jahre</strong>
            </div>
          </div>
          
          {/* Berufliche Situation */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">💼</span>
              Berufliche Situation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alter bei Berufseinstieg
                </label>
                <select
                  value={berufseinstiegsalter}
                  onChange={(e) => {
                    setBerufseinstiegsalter(parseInt(e.target.value));
                    setShowResults(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 15).map(age => (
                    <option key={age} value={age}>{age} Jahre</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Ab diesem Alter waren Sie rentenversicherungspflichtig beschäftigt
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktuelles Monatsbrutto
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={monatsbrutto}
                    onChange={(e) => {
                      setMonatsbrutto(parseInt(e.target.value) || 0);
                      setShowResults(false);
                    }}
                    min={0}
                    max={15000}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Dient zur Schätzung Ihrer Entgeltpunkte
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
              <strong>Hinweis:</strong> Wenn Sie Ihre genauen Entgeltpunkte kennen (z.B. aus der Renteninformation), 
              können diese für eine präzisere Berechnung verwendet werden.
            </div>
          </div>
          
          {/* Art der Erwerbsminderung */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🏥</span>
              Art der Erwerbsminderung
            </h3>
            
            <div className="space-y-3">
              <label 
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  emTyp === 'voll' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="em_typ"
                  value="voll"
                  checked={emTyp === 'voll'}
                  onChange={() => {
                    setEmTyp('voll');
                    setShowResults(false);
                  }}
                  className="mt-1"
                />
                <div>
                  <span className="font-semibold text-gray-800">Volle Erwerbsminderung</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Sie können weniger als 3 Stunden täglich arbeiten (auf dem allgemeinen Arbeitsmarkt)
                  </p>
                </div>
              </label>
              
              <label 
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  emTyp === 'teilweise' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="em_typ"
                  value="teilweise"
                  checked={emTyp === 'teilweise'}
                  onChange={() => {
                    setEmTyp('teilweise');
                    setShowResults(false);
                  }}
                  className="mt-1"
                />
                <div>
                  <span className="font-semibold text-gray-800">Teilweise Erwerbsminderung</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Sie können 3 bis unter 6 Stunden täglich arbeiten (auf dem allgemeinen Arbeitsmarkt)
                  </p>
                </div>
              </label>
            </div>
          </div>
          
          {/* Familienstatus */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">👨‍👩‍👧</span>
              Familienstatus
            </h3>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hatKinder}
                onChange={(e) => {
                  setHatKinder(e.target.checked);
                  setShowResults(false);
                }}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Ich habe Kinder</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Kinderlose zahlen einen höheren Pflegeversicherungsbeitrag (2,4% statt 1,8%)
            </p>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Erwerbsminderungsrente berechnen
          </button>
        </form>
      </div>
      
      {/* Ergebnisse */}
      {ergebnis && (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Ihre geschätzte Erwerbsminderungsrente
          </h3>
          
          {/* Hauptergebnis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-6">
              <p className="text-blue-100 text-sm">Bruttorente monatlich</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(ergebnis.bruttorente)}</p>
              <p className="text-blue-200 text-sm mt-2">
                {emTyp === 'voll' ? 'Volle' : 'Teilweise'} Erwerbsminderungsrente
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl p-6">
              <p className="text-emerald-100 text-sm">Nettorente monatlich</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(ergebnis.nettorente)}</p>
              <p className="text-emerald-200 text-sm mt-2">
                Nach Abzug KV + PV ({formatCurrency(ergebnis.abzuege.gesamt)})
              </p>
            </div>
          </div>
          
          {/* Berechnungsdetails */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-gray-800 mb-4">📐 Berechnungsdetails</h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Entgeltpunkte (bisher erworben)</span>
                <span className="font-medium">{ergebnis.entgeltpunkte_bisher.toFixed(2)} EP</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">
                  Entgeltpunkte (Zurechnungszeit: {Math.round(ergebnis.zurechnungszeit_monate / 12)} Jahre)
                </span>
                <span className="font-medium">+ {ergebnis.entgeltpunkte_zurechnungszeit.toFixed(2)} EP</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Entgeltpunkte gesamt</span>
                <span className="font-bold text-blue-600">{ergebnis.entgeltpunkte_gesamt.toFixed(2)} EP</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Rentenartfaktor</span>
                <span className="font-medium">× {ergebnis.rentenartfaktor.toFixed(1)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">
                  Zugangsfaktor 
                  {ergebnis.abschlag_prozent > 0 && (
                    <span className="text-amber-600"> (Abschlag: {ergebnis.abschlag_prozent}%)</span>
                  )}
                </span>
                <span className="font-medium">× {ergebnis.zugangsfaktor.toFixed(3)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Aktueller Rentenwert (2026)</span>
                <span className="font-medium">× {RENTENWERT.toFixed(2)} €</span>
              </div>
              
              <div className="bg-blue-100 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-800 font-mono">
                  {ergebnis.entgeltpunkte_gesamt.toFixed(2)} EP × {ergebnis.zugangsfaktor.toFixed(3)} × {ergebnis.rentenartfaktor.toFixed(1)} × {RENTENWERT.toFixed(2)} € = <strong>{formatCurrency(ergebnis.bruttorente)}</strong>
                </p>
              </div>
            </div>
          </div>
          
          {/* Abzüge */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-gray-800 mb-4">💸 Abzüge von der Bruttorente</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Krankenversicherung (7,3% + 1,45% Zusatzbeitrag)</span>
                <span className="font-medium text-red-600">- {formatCurrency(ergebnis.abzuege.krankenversicherung)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Pflegeversicherung ({hatKinder ? '1,8%' : '2,4%'})</span>
                <span className="font-medium text-red-600">- {formatCurrency(ergebnis.abzuege.pflegeversicherung)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700 font-medium">Abzüge gesamt</span>
                <span className="font-bold text-red-600">- {formatCurrency(ergebnis.abzuege.gesamt)}</span>
              </div>
            </div>
          </div>
          
          {/* Hinzuverdienstgrenze */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <span>💰</span>
              Hinzuverdienstgrenze 2026
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-amber-700">Pro Jahr</p>
                <p className="text-xl font-bold text-amber-900">{formatCurrency(ergebnis.hinzuverdienstgrenze_jahr)}</p>
              </div>
              <div>
                <p className="text-amber-700">Pro Monat (∅)</p>
                <p className="text-xl font-bold text-amber-900">{formatCurrency(ergebnis.hinzuverdienstgrenze_monat)}</p>
              </div>
            </div>
            
            <p className="text-xs text-amber-700 mt-3">
              {emTyp === 'voll' 
                ? 'Bei voller EM-Rente gilt eine einheitliche Grenze. Wird diese überschritten, wird die Rente anteilig gekürzt.'
                : 'Bei teilweiser EM-Rente ist die Hinzuverdienstgrenze individuell höher, da Sie weiterhin teilweise arbeiten können.'
              }
            </p>
          </div>
          
          {/* Abschlag-Warnung */}
          {ergebnis.abschlag_prozent > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                <span>⚠️</span>
                Abschlag bei vorzeitigem Bezug
              </h4>
              <p className="text-sm text-orange-700">
                Da Sie vor dem Erreichen der abschlagsfreien Altersgrenze (64 Jahre und 10 Monate in 2026) 
                in Erwerbsminderungsrente gehen, wird ein Abschlag von <strong>{ergebnis.abschlag_prozent}%</strong> angewendet. 
                Dieser Abschlag gilt dauerhaft – auch wenn die EM-Rente später in eine Altersrente umgewandelt wird.
              </p>
            </div>
          )}
          
          {/* Zurechnungszeit-Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <span>ℹ️</span>
              Was ist die Zurechnungszeit?
            </h4>
            <p className="text-sm text-blue-700">
              Die Zurechnungszeit füllt die "Lücke" zwischen dem Eintritt der Erwerbsminderung und dem regulären 
              Rentenalter. Sie werden so gestellt, als hätten Sie bis zum Alter von 66 Jahren und 3 Monaten (2026) 
              weitergearbeitet. Ab 2031 endet die Zurechnungszeit einheitlich bei 67 Jahren.
            </p>
          </div>
        </div>
      )}
      
      {/* Informationsboxen */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-4">📚 Wichtige Informationen zur EM-Rente</h3>
        
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Volle EM-Rente:</strong> Bei weniger als 3 Stunden täglicher Arbeitsfähigkeit</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Teilweise EM-Rente:</strong> Bei 3 bis unter 6 Stunden täglicher Arbeitsfähigkeit</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Voraussetzungen:</strong> Mindestens 5 Jahre Wartezeit + 3 Jahre Pflichtbeiträge in den letzten 5 Jahren</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Befristung:</strong> EM-Renten werden meist befristet gewährt (max. 3 Jahre, Verlängerung möglich)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Arbeitsmarktlage:</strong> Bei voller EM und fehlender Teilzeitstelle erhalten Sie auch bei 3-6h Arbeitsfähigkeit die volle EM-Rente</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Umwandlung:</strong> Mit Erreichen der Regelaltersgrenze wird die EM-Rente automatisch zur Altersrente</span>
          </li>
        </ul>
      </div>
      
      {/* Warnhinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Schätzung:</strong> Dieser Rechner liefert eine Orientierung. Die tatsächliche Rente kann abweichen.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Entgeltpunkte:</strong> Ihre genauen Entgeltpunkte finden Sie in Ihrer Renteninformation der DRV.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Grundsicherung:</strong> Bei sehr niedriger EM-Rente können Sie ergänzend Grundsicherung beantragen.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Beratung:</strong> Lassen Sie sich von der Deutschen Rentenversicherung persönlich beraten!</span>
          </li>
        </ul>
      </div>
      
      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-4">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Deutsche Rentenversicherung</p>
            <p className="text-sm text-blue-700 mt-1">
              Die DRV ist zuständig für alle Fragen zur Erwerbsminderungsrente. Sie können 
              eine kostenlose Beratung in Anspruch nehmen.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Service-Hotline</p>
                <a 
                  href="tel:08001000480"
                  className="text-blue-600 hover:underline font-bold"
                >
                  0800 1000 480 0
                </a>
                <p className="text-gray-500 text-xs mt-1">Kostenfrei</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Informationen</p>
                <a 
                  href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Rentenarten-und-Leistungen/Erwerbsminderungsrente/Erwerbsminderungsrente.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  deutsche-rentenversicherung.de →
                </a>
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
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Rentenarten-und-Leistungen/Erwerbsminderungsrente/Erwerbsminderungsrente.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Erwerbsminderungsrente
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_6/__43.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 43 SGB VI – Rente wegen Erwerbsminderung
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_6/__59.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 59 SGB VI – Zurechnungszeit
          </a>
          <a 
            href="https://www.bundesregierung.de/breg-de/aktuelles/faq-erwerbsminderungsrenten-2266870"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – FAQ Erwerbsminderungsrenten
          </a>
        </div>
      </div>
    </div>
  );
}
