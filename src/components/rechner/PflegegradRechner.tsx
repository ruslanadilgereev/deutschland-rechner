import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// NBA (Neues Begutachtungsassessment) - Vereinfachter Pflegegrad-Rechner
// Quellen: MDK, BMG, SGB XI

// Gewichtung der Module
const MODULE_GEWICHTUNG = {
  mobilitaet: 0.10,                    // 10%
  kognitivVerhalten: 0.15,             // 15% (höherer von beiden)
  selbstversorgung: 0.40,              // 40%
  krankheit: 0.20,                     // 20%
  alltag: 0.15,                        // 15%
};

// Pflegegrad-Grenzen (gewichtete Gesamtpunkte)
const PFLEGEGRAD_GRENZEN = [
  { min: 0, max: 12.49, grad: 0, name: 'Kein Pflegegrad' },
  { min: 12.5, max: 26.99, grad: 1, name: 'Pflegegrad 1' },
  { min: 27, max: 47.49, grad: 2, name: 'Pflegegrad 2' },
  { min: 47.5, max: 69.99, grad: 3, name: 'Pflegegrad 3' },
  { min: 70, max: 89.99, grad: 4, name: 'Pflegegrad 4' },
  { min: 90, max: 100, grad: 5, name: 'Pflegegrad 5' },
];

// Pflegegeld 2025/2026
const PFLEGEGELD = {
  0: { geld: 0, sachleistung: 0 },
  1: { geld: 0, sachleistung: 0 },
  2: { geld: 347, sachleistung: 796 },
  3: { geld: 599, sachleistung: 1497 },
  4: { geld: 800, sachleistung: 1859 },
  5: { geld: 990, sachleistung: 2299 },
};

// Modul-Fragen (vereinfacht)
interface Frage {
  id: string;
  text: string;
  optionen: { label: string; punkte: number }[];
}

const MODUL_FRAGEN: Record<string, { name: string; icon: string; fragen: Frage[] }> = {
  mobilitaet: {
    name: 'Mobilität',
    icon: '🚶',
    fragen: [
      {
        id: 'positionswechsel',
        text: 'Positionswechsel im Bett (z.B. Umdrehen)',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'sitzen',
        text: 'Halten einer stabilen Sitzposition',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'aufstehen',
        text: 'Umsetzen (z.B. aus dem Bett in den Rollstuhl)',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'fortbewegen',
        text: 'Fortbewegen innerhalb der Wohnung',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'treppen',
        text: 'Treppensteigen',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
    ],
  },
  kognitiv: {
    name: 'Kognitive Fähigkeiten',
    icon: '🧠',
    fragen: [
      {
        id: 'erkennen',
        text: 'Erkennen von Personen aus dem näheren Umfeld',
        optionen: [
          { label: 'Fähigkeit vorhanden', punkte: 0 },
          { label: 'Fähigkeit größtenteils vorhanden', punkte: 1 },
          { label: 'Fähigkeit in geringem Maße vorhanden', punkte: 2 },
          { label: 'Fähigkeit nicht vorhanden', punkte: 3 },
        ],
      },
      {
        id: 'orientierung',
        text: 'Örtliche und zeitliche Orientierung',
        optionen: [
          { label: 'Fähigkeit vorhanden', punkte: 0 },
          { label: 'Fähigkeit größtenteils vorhanden', punkte: 1 },
          { label: 'Fähigkeit in geringem Maße vorhanden', punkte: 2 },
          { label: 'Fähigkeit nicht vorhanden', punkte: 3 },
        ],
      },
      {
        id: 'entscheidungen',
        text: 'Treffen von Entscheidungen im Alltag',
        optionen: [
          { label: 'Fähigkeit vorhanden', punkte: 0 },
          { label: 'Fähigkeit größtenteils vorhanden', punkte: 1 },
          { label: 'Fähigkeit in geringem Maße vorhanden', punkte: 2 },
          { label: 'Fähigkeit nicht vorhanden', punkte: 3 },
        ],
      },
      {
        id: 'verstehen',
        text: 'Verstehen von Sachverhalten und Informationen',
        optionen: [
          { label: 'Fähigkeit vorhanden', punkte: 0 },
          { label: 'Fähigkeit größtenteils vorhanden', punkte: 1 },
          { label: 'Fähigkeit in geringem Maße vorhanden', punkte: 2 },
          { label: 'Fähigkeit nicht vorhanden', punkte: 3 },
        ],
      },
      {
        id: 'risiken',
        text: 'Erkennen von Risiken und Gefahren',
        optionen: [
          { label: 'Fähigkeit vorhanden', punkte: 0 },
          { label: 'Fähigkeit größtenteils vorhanden', punkte: 1 },
          { label: 'Fähigkeit in geringem Maße vorhanden', punkte: 2 },
          { label: 'Fähigkeit nicht vorhanden', punkte: 3 },
        ],
      },
    ],
  },
  verhalten: {
    name: 'Verhaltensweisen & psychische Probleme',
    icon: '😟',
    fragen: [
      {
        id: 'unruhe',
        text: 'Motorisch geprägte Verhaltensauffälligkeiten (Unruhe, Weglaufen)',
        optionen: [
          { label: 'Nie oder sehr selten', punkte: 0 },
          { label: 'Selten (1-3x pro Monat)', punkte: 1 },
          { label: 'Häufig (mehrmals wöchentlich)', punkte: 3 },
          { label: 'Täglich', punkte: 5 },
        ],
      },
      {
        id: 'nacht',
        text: 'Nächtliche Unruhe',
        optionen: [
          { label: 'Nie oder sehr selten', punkte: 0 },
          { label: 'Selten (1-3x pro Monat)', punkte: 1 },
          { label: 'Häufig (mehrmals wöchentlich)', punkte: 3 },
          { label: 'Täglich', punkte: 5 },
        ],
      },
      {
        id: 'aggression',
        text: 'Selbstschädigendes oder autoaggressives Verhalten',
        optionen: [
          { label: 'Nie oder sehr selten', punkte: 0 },
          { label: 'Selten (1-3x pro Monat)', punkte: 1 },
          { label: 'Häufig (mehrmals wöchentlich)', punkte: 3 },
          { label: 'Täglich', punkte: 5 },
        ],
      },
      {
        id: 'beschaedigung',
        text: 'Beschädigen von Gegenständen',
        optionen: [
          { label: 'Nie oder sehr selten', punkte: 0 },
          { label: 'Selten (1-3x pro Monat)', punkte: 1 },
          { label: 'Häufig (mehrmals wöchentlich)', punkte: 3 },
          { label: 'Täglich', punkte: 5 },
        ],
      },
      {
        id: 'andere',
        text: 'Physisch aggressives Verhalten gegenüber anderen',
        optionen: [
          { label: 'Nie oder sehr selten', punkte: 0 },
          { label: 'Selten (1-3x pro Monat)', punkte: 1 },
          { label: 'Häufig (mehrmals wöchentlich)', punkte: 3 },
          { label: 'Täglich', punkte: 5 },
        ],
      },
      {
        id: 'wahn',
        text: 'Wahnvorstellungen, Sinnestäuschungen',
        optionen: [
          { label: 'Nie oder sehr selten', punkte: 0 },
          { label: 'Selten (1-3x pro Monat)', punkte: 1 },
          { label: 'Häufig (mehrmals wöchentlich)', punkte: 3 },
          { label: 'Täglich', punkte: 5 },
        ],
      },
      {
        id: 'aengste',
        text: 'Ängste',
        optionen: [
          { label: 'Nie oder sehr selten', punkte: 0 },
          { label: 'Selten (1-3x pro Monat)', punkte: 1 },
          { label: 'Häufig (mehrmals wöchentlich)', punkte: 3 },
          { label: 'Täglich', punkte: 5 },
        ],
      },
    ],
  },
  selbstversorgung: {
    name: 'Selbstversorgung',
    icon: '🛁',
    fragen: [
      {
        id: 'waschen_vorne',
        text: 'Waschen des vorderen Oberkörpers',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'koerperpflege',
        text: 'Körperpflege im Bereich des Kopfes (Kämmen, Zähneputzen, Rasieren)',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'waschen_intim',
        text: 'Waschen des Intimbereichs',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'duschen',
        text: 'Duschen oder Baden (inkl. Haare waschen)',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'ankleiden_oben',
        text: 'An- und Auskleiden des Oberkörpers',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'ankleiden_unten',
        text: 'An- und Auskleiden des Unterkörpers',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'essen',
        text: 'Essen (mundgerechte Nahrung aufnehmen)',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 6 },
        ],
      },
      {
        id: 'trinken',
        text: 'Trinken (Getränk zum Mund führen)',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'toilette',
        text: 'Benutzen einer Toilette oder eines Toilettenstuhls',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'harnkontrolle',
        text: 'Bewältigung der Folgen einer Harninkontinenz / Umgang mit Katheter',
        optionen: [
          { label: 'Selbstständig / kein Problem', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'stuhlkontrolle',
        text: 'Bewältigung der Folgen einer Stuhlinkontinenz / Umgang mit Stoma',
        optionen: [
          { label: 'Selbstständig / kein Problem', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
    ],
  },
  krankheit: {
    name: 'Krankheits- & therapiebedingte Anforderungen',
    icon: '💊',
    fragen: [
      {
        id: 'medikamente',
        text: 'Medikamenteneinnahme (inkl. Richten und Kontrolle)',
        optionen: [
          { label: 'Entfällt / selbstständig', punkte: 0 },
          { label: 'Täglich 1x Hilfe nötig', punkte: 1 },
          { label: 'Täglich 2-3x Hilfe nötig', punkte: 2 },
          { label: 'Täglich mehrfach Hilfe nötig', punkte: 3 },
        ],
      },
      {
        id: 'injektionen',
        text: 'Injektionen (z.B. Insulin)',
        optionen: [
          { label: 'Entfällt / selbstständig', punkte: 0 },
          { label: 'Täglich 1x Hilfe nötig', punkte: 1 },
          { label: 'Täglich 2-3x Hilfe nötig', punkte: 2 },
          { label: 'Täglich mehrfach Hilfe nötig', punkte: 3 },
        ],
      },
      {
        id: 'verbandswechsel',
        text: 'Verbandswechsel und Wundversorgung',
        optionen: [
          { label: 'Entfällt / selbstständig', punkte: 0 },
          { label: '1-3x wöchentlich Hilfe nötig', punkte: 1 },
          { label: '4-7x wöchentlich Hilfe nötig', punkte: 2 },
          { label: 'Mehrmals täglich Hilfe nötig', punkte: 3 },
        ],
      },
      {
        id: 'arztbesuche',
        text: 'Arztbesuche (Begleitung notwendig)',
        optionen: [
          { label: 'Keine Begleitung notwendig', punkte: 0 },
          { label: '1-2x monatlich', punkte: 1 },
          { label: '3-4x monatlich', punkte: 2 },
          { label: 'Mehrmals wöchentlich', punkte: 3 },
        ],
      },
      {
        id: 'therapien',
        text: 'Therapien zuhause (Krankengymnastik, Logopädie etc.)',
        optionen: [
          { label: 'Entfällt / selbstständig', punkte: 0 },
          { label: '1x wöchentlich', punkte: 1 },
          { label: '2-3x wöchentlich', punkte: 2 },
          { label: 'Täglich', punkte: 3 },
        ],
      },
    ],
  },
  alltag: {
    name: 'Gestaltung des Alltagslebens',
    icon: '🏠',
    fragen: [
      {
        id: 'tagesablauf',
        text: 'Gestaltung des Tagesablaufs und Anpassung an Veränderungen',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'ruhen',
        text: 'Ruhen und Schlafen',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'beschaeftigen',
        text: 'Sichbeschäftigen',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'zukunft',
        text: 'Vornehmen von in die Zukunft gerichteten Planungen',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'kontakte',
        text: 'Interaktion mit Personen im direkten Kontakt',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
      {
        id: 'kontaktpflege',
        text: 'Kontaktpflege zu Personen außerhalb des direkten Umfelds',
        optionen: [
          { label: 'Selbstständig', punkte: 0 },
          { label: 'Überwiegend selbstständig', punkte: 1 },
          { label: 'Überwiegend unselbstständig', punkte: 2 },
          { label: 'Unselbstständig', punkte: 3 },
        ],
      },
    ],
  },
};

// Umrechnung Rohwerte in gewichtete Punkte
function modulPunkteZuGewichtet(modulName: string, rohpunkte: number): number {
  // NBA-Umrechnungstabellen (vereinfacht)
  const tabellen: Record<string, number[]> = {
    mobilitaet: [0, 2.5, 5, 7.5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], // 0-15 Rohpunkte
    kognitiv: [0, 3.75, 7.5, 11.25, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
    verhalten: [0, 3.75, 7.5, 11.25, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
    selbstversorgung: [0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40],
    krankheit: [0, 5, 10, 15, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
    alltag: [0, 3.75, 7.5, 11.25, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
  };
  
  const tabelle = tabellen[modulName];
  if (!tabelle) return 0;
  
  const index = Math.min(Math.floor(rohpunkte), tabelle.length - 1);
  return tabelle[index];
}

type Antworten = Record<string, Record<string, number>>;

function berechnePflegegrad(antworten: Antworten): {
  gesamtpunkte: number;
  pflegegrad: number;
  pflegegradName: string;
  modulPunkte: Record<string, { roh: number; gewichtet: number }>;
  kognitivVerhaltenMax: number;
  pflegegeld: number;
  sachleistung: number;
} {
  const modulPunkte: Record<string, { roh: number; gewichtet: number }> = {};
  
  // Berechne Rohpunkte für jedes Modul
  for (const [modulKey, modul] of Object.entries(MODUL_FRAGEN)) {
    const modulAntworten = antworten[modulKey] || {};
    let rohPunkte = 0;
    
    for (const frage of modul.fragen) {
      rohPunkte += modulAntworten[frage.id] || 0;
    }
    
    const gewichtet = modulPunkteZuGewichtet(modulKey, rohPunkte);
    modulPunkte[modulKey] = { roh: rohPunkte, gewichtet };
  }
  
  // Modul 2+3: Nur der höhere Wert zählt!
  const kognitivGewichtet = modulPunkte.kognitiv?.gewichtet || 0;
  const verhaltenGewichtet = modulPunkte.verhalten?.gewichtet || 0;
  const kognitivVerhaltenMax = Math.max(kognitivGewichtet, verhaltenGewichtet);
  
  // Gesamtpunkte berechnen (Module 1, 2/3, 4, 5, 6)
  const gesamtpunkte = 
    (modulPunkte.mobilitaet?.gewichtet || 0) +
    kognitivVerhaltenMax +
    (modulPunkte.selbstversorgung?.gewichtet || 0) +
    (modulPunkte.krankheit?.gewichtet || 0) +
    (modulPunkte.alltag?.gewichtet || 0);
  
  // Pflegegrad bestimmen
  let pflegegrad = 0;
  let pflegegradName = 'Kein Pflegegrad';
  
  for (const grenze of PFLEGEGRAD_GRENZEN) {
    if (gesamtpunkte >= grenze.min && gesamtpunkte <= grenze.max) {
      pflegegrad = grenze.grad;
      pflegegradName = grenze.name;
      break;
    }
  }
  
  const leistungen = PFLEGEGELD[pflegegrad as keyof typeof PFLEGEGELD] || { geld: 0, sachleistung: 0 };
  
  return {
    gesamtpunkte,
    pflegegrad,
    pflegegradName,
    modulPunkte,
    kognitivVerhaltenMax,
    pflegegeld: leistungen.geld,
    sachleistung: leistungen.sachleistung,
  };
}

export default function PflegegradRechner() {
  const [currentModul, setCurrentModul] = useState(0);
  const [antworten, setAntworten] = useState<Antworten>({});
  const [showResult, setShowResult] = useState(false);
  
  const moduleKeys = Object.keys(MODUL_FRAGEN);
  const currentModulKey = moduleKeys[currentModul];
  const currentModulData = MODUL_FRAGEN[currentModulKey];
  
  const ergebnis = useMemo(() => berechnePflegegrad(antworten), [antworten]);
  
  const handleAntwort = (frageId: string, punkte: number) => {
    setAntworten(prev => ({
      ...prev,
      [currentModulKey]: {
        ...prev[currentModulKey],
        [frageId]: punkte,
      },
    }));
  };
  
  const nextModul = () => {
    if (currentModul < moduleKeys.length - 1) {
      setCurrentModul(currentModul + 1);
    } else {
      setShowResult(true);
    }
  };
  
  const prevModul = () => {
    if (currentModul > 0) {
      setCurrentModul(currentModul - 1);
    }
  };
  
  const resetTest = () => {
    setAntworten({});
    setCurrentModul(0);
    setShowResult(false);
  };
  
  const getProgress = () => {
    let answered = 0;
    let total = 0;
    
    for (const [key, modul] of Object.entries(MODUL_FRAGEN)) {
      total += modul.fragen.length;
      if (antworten[key]) {
        answered += Object.keys(antworten[key]).length;
      }
    }
    
    return { answered, total, percent: Math.round((answered / total) * 100) };
  };
  
  const progress = getProgress();
  const currentModulAnswered = Object.keys(antworten[currentModulKey] || {}).length;
  const currentModulTotal = currentModulData?.fragen.length || 0;
  
  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  
  // Ergebnisanzeige
  if (showResult) {
    const gradColors: Record<number, string> = {
      0: 'from-gray-400 to-gray-500',
      1: 'from-blue-400 to-blue-500',
      2: 'from-green-400 to-green-500',
      3: 'from-yellow-400 to-orange-500',
      4: 'from-orange-400 to-red-500',
      5: 'from-red-500 to-red-700',
    };
    
    return (
      <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Pflegegrad-Rechner 2025 & 2026" rechnerSlug="pflegegrad-rechner" />

{/* Ergebnis */}
        <div className={`rounded-2xl shadow-lg p-6 mb-6 text-white bg-gradient-to-br ${gradColors[ergebnis.pflegegrad]}`}>
          <div className="text-center mb-4">
            <p className="text-sm opacity-90 mb-2">Ihr geschätzter Pflegegrad</p>
            <p className="text-6xl font-bold mb-2">
              {ergebnis.pflegegrad === 0 ? '—' : ergebnis.pflegegrad}
            </p>
            <p className="text-xl opacity-90">{ergebnis.pflegegradName}</p>
          </div>
          
          <div className="bg-white/20 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Gesamtpunkte</span>
              <span className="text-2xl font-bold">{ergebnis.gesamtpunkte.toFixed(1)} / 100</span>
            </div>
            <div className="mt-2 bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all"
                style={{ width: `${ergebnis.gesamtpunkte}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-sm opacity-75">Pflegegeld</p>
              <p className="text-2xl font-bold">{formatEuro(ergebnis.pflegegeld)}</p>
              <p className="text-xs opacity-75">pro Monat</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-sm opacity-75">Sachleistungen</p>
              <p className="text-2xl font-bold">{formatEuro(ergebnis.sachleistung)}</p>
              <p className="text-xs opacity-75">pro Monat</p>
            </div>
          </div>
        </div>
        
        {/* Modul-Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Auswertung nach Modulen</h3>
          
          <div className="space-y-3">
            {moduleKeys.map((key) => {
              const modul = MODUL_FRAGEN[key];
              const punkte = ergebnis.modulPunkte[key];
              const isKognitiv = key === 'kognitiv';
              const isVerhalten = key === 'verhalten';
              const isUsedKognitiv = (isKognitiv || isVerhalten) && 
                ((isKognitiv && punkte.gewichtet >= (ergebnis.modulPunkte.verhalten?.gewichtet || 0)) ||
                 (isVerhalten && punkte.gewichtet > (ergebnis.modulPunkte.kognitiv?.gewichtet || 0)));
              
              return (
                <div 
                  key={key} 
                  className={`p-4 rounded-xl ${
                    (isKognitiv || isVerhalten) && !isUsedKognitiv
                      ? 'bg-gray-50 opacity-60'
                      : 'bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{modul.icon}</span>
                      <span className="font-medium text-gray-800">{modul.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-700">
                        {punkte?.gewichtet.toFixed(1) || '0'}
                      </span>
                      <span className="text-sm text-gray-500"> / {
                        key === 'mobilitaet' ? '10' :
                        key === 'selbstversorgung' ? '40' :
                        key === 'krankheit' ? '20' : '15'
                      }</span>
                    </div>
                  </div>
                  {(isKognitiv || isVerhalten) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {isUsedKognitiv 
                        ? '✓ Dieser Wert wird gezählt (höherer von Modul 2+3)'
                        : '○ Niedrigerer Wert - wird nicht gezählt'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            💡 Bei Modul 2 (Kognitive Fähigkeiten) und Modul 3 (Verhaltensweisen) 
            zählt nur der höhere Wert für die Gesamtbewertung.
          </p>
        </div>
        
        {/* Pflegegeld-Tabelle */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">💶 Pflegegeld-Tabelle 2025/2026</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Pflegegrad</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Punkte</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Pflegegeld</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Sachleistungen</th>
                </tr>
              </thead>
              <tbody>
                {PFLEGEGRAD_GRENZEN.map((grenze) => (
                  <tr 
                    key={grenze.grad}
                    className={`border-b border-gray-100 ${
                      ergebnis.pflegegrad === grenze.grad ? 'bg-blue-50 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4">{grenze.name}</td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {grenze.min.toFixed(1)} – {grenze.max.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {PFLEGEGELD[grenze.grad as keyof typeof PFLEGEGELD].geld === 0 
                        ? '—' 
                        : formatEuro(PFLEGEGELD[grenze.grad as keyof typeof PFLEGEGELD].geld)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {PFLEGEGELD[grenze.grad as keyof typeof PFLEGEGELD].sachleistung === 0 
                        ? '—' 
                        : formatEuro(PFLEGEGELD[grenze.grad as keyof typeof PFLEGEGELD].sachleistung)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Hinweise */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
          <ul className="space-y-2 text-sm text-amber-700">
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>Selbsttest:</strong> Dies ist eine vereinfachte Selbsteinschätzung. 
                Die offizielle Begutachtung durch den MD (Medizinischen Dienst) kann abweichen.</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>Antrag stellen:</strong> Der Pflegegrad muss bei der Pflegekasse 
                beantragt werden. Diese beauftragt dann eine Begutachtung.</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>Vorbereitung:</strong> Führen Sie ein Pflegetagebuch und dokumentieren 
                Sie den tatsächlichen Hilfebedarf für die Begutachtung.</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>Widerspruch:</strong> Bei zu niedrigem Pflegegrad kann innerhalb 
                eines Monats Widerspruch eingelegt werden.</span>
            </li>
          </ul>
        </div>
        
        {/* Aktionen */}
        <div className="flex gap-3">
          <button
            onClick={resetTest}
            className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            🔄 Test wiederholen
          </button>
          <a
            href="/pflegegeld-rechner"
            className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-center"
          >
            💶 Zum Pflegegeld-Rechner
          </a>
        </div>
      </div>
    );
  }
  
  // Fragebogen
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Modul {currentModul + 1} von {moduleKeys.length}
          </span>
          <span className="text-sm text-gray-500">
            {progress.answered} / {progress.total} Fragen ({progress.percent}%)
          </span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 rounded-full h-2 transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        
        {/* Module Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
          {moduleKeys.map((key, idx) => {
            const modul = MODUL_FRAGEN[key];
            const isActive = idx === currentModul;
            const isCompleted = antworten[key] && 
              Object.keys(antworten[key]).length === modul.fragen.length;
            
            return (
              <button
                key={key}
                onClick={() => setCurrentModul(idx)}
                className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {modul.icon} {modul.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Modul Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{currentModulData.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-blue-900">
              Modul {currentModul + 1}: {currentModulData.name}
            </h2>
            <p className="text-sm text-blue-700">
              Beantworten Sie alle Fragen zur Einschätzung des Hilfebedarfs
            </p>
          </div>
        </div>
      </div>
      
      {/* Fragen */}
      <div className="space-y-4 mb-6">
        {currentModulData.fragen.map((frage, idx) => {
          const currentAnswer = antworten[currentModulKey]?.[frage.id];
          
          return (
            <div key={frage.id} className="bg-white rounded-2xl shadow-lg p-5">
              <p className="font-medium text-gray-800 mb-3">
                <span className="text-blue-500 mr-2">{idx + 1}.</span>
                {frage.text}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {frage.optionen.map((option, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleAntwort(frage.id, option.punkte)}
                    className={`p-3 rounded-xl text-left text-sm transition-all ${
                      currentAnswer === option.punkte
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        currentAnswer === option.punkte
                          ? 'border-white bg-white'
                          : 'border-gray-300'
                      }`}>
                        {currentAnswer === option.punkte && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        )}
                      </span>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Navigation */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={prevModul}
          disabled={currentModul === 0}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            currentModul === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ← Zurück
        </button>
        
        <button
          onClick={nextModul}
          className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
            currentModulAnswered === currentModulTotal
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-100 text-blue-600'
          }`}
        >
          {currentModul === moduleKeys.length - 1 
            ? `🎯 Auswertung anzeigen`
            : `Weiter: ${MODUL_FRAGEN[moduleKeys[currentModul + 1]]?.name} →`
          }
        </button>
      </div>
      
      {/* Schnellübersicht */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Aktuelle Zwischenbewertung
          </span>
          <span className="text-lg font-bold text-blue-600">
            {ergebnis.gesamtpunkte.toFixed(1)} Punkte
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Geschätzter Pflegegrad: <strong>{ergebnis.pflegegradName}</strong>
        </p>
</div>
    </div>
  );
}
