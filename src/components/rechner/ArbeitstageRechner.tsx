import { useState, useMemo } from 'react';

// Arbeitstage-Rechner: Zählt Arbeitstage zwischen zwei Daten
// Berücksichtigt Wochenenden und gesetzliche Feiertage nach Bundesland

// Bundesländer
const BUNDESLAENDER: Record<string, string> = {
  BW: 'Baden-Württemberg',
  BY: 'Bayern',
  BE: 'Berlin',
  BB: 'Brandenburg',
  HB: 'Bremen',
  HH: 'Hamburg',
  HE: 'Hessen',
  MV: 'Mecklenburg-Vorpommern',
  NI: 'Niedersachsen',
  NW: 'Nordrhein-Westfalen',
  RP: 'Rheinland-Pfalz',
  SL: 'Saarland',
  SN: 'Sachsen',
  ST: 'Sachsen-Anhalt',
  SH: 'Schleswig-Holstein',
  TH: 'Thüringen',
};

// Berechnet Ostersonntag nach Gauß'scher Osterformel
// Diese Formel ist mathematisch exakt und seit Jahrhunderten validiert
function berechneOstersonntag(jahr: number): Date {
  const a = jahr % 19;
  const b = Math.floor(jahr / 100);
  const c = jahr % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const monat = Math.floor((h + l - 7 * m + 114) / 31);
  const tag = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(jahr, monat - 1, tag);
}

// Berechnet Buß- und Bettag (Mittwoch vor dem 23. November)
function berechneBussUndBettag(jahr: number): Date {
  const nov23 = new Date(jahr, 10, 23); // 23. November
  const wochentag = nov23.getDay();
  // Finde den Mittwoch vor dem 23. November
  const tageZurueck = wochentag >= 3 ? wochentag - 3 : wochentag + 4;
  const bussUndBettag = new Date(jahr, 10, 23 - tageZurueck);
  return bussUndBettag;
}

interface Feiertag {
  name: string;
  datum: Date;
  bundeslaender: string[]; // leer = bundesweit
}

// Generiert alle gesetzlichen Feiertage für ein Jahr
function getFeiertage(jahr: number): Feiertag[] {
  const ostersonntag = berechneOstersonntag(jahr);
  
  // Hilfsfunktion: Tage zu einem Datum addieren
  const addTage = (datum: Date, tage: number): Date => {
    const neuesDatum = new Date(datum);
    neuesDatum.setDate(neuesDatum.getDate() + tage);
    return neuesDatum;
  };
  
  const feiertage: Feiertag[] = [
    // Bundesweite Feiertage
    { name: 'Neujahr', datum: new Date(jahr, 0, 1), bundeslaender: [] },
    { name: 'Karfreitag', datum: addTage(ostersonntag, -2), bundeslaender: [] },
    { name: 'Ostermontag', datum: addTage(ostersonntag, 1), bundeslaender: [] },
    { name: 'Tag der Arbeit', datum: new Date(jahr, 4, 1), bundeslaender: [] },
    { name: 'Christi Himmelfahrt', datum: addTage(ostersonntag, 39), bundeslaender: [] },
    { name: 'Pfingstmontag', datum: addTage(ostersonntag, 50), bundeslaender: [] },
    { name: 'Tag der Deutschen Einheit', datum: new Date(jahr, 9, 3), bundeslaender: [] },
    { name: '1. Weihnachtsfeiertag', datum: new Date(jahr, 11, 25), bundeslaender: [] },
    { name: '2. Weihnachtsfeiertag', datum: new Date(jahr, 11, 26), bundeslaender: [] },
    
    // Regionale Feiertage
    { name: 'Heilige Drei Könige', datum: new Date(jahr, 0, 6), bundeslaender: ['BW', 'BY', 'ST'] },
    { name: 'Internationaler Frauentag', datum: new Date(jahr, 2, 8), bundeslaender: ['BE', 'MV'] },
    { name: 'Fronleichnam', datum: addTage(ostersonntag, 60), bundeslaender: ['BW', 'BY', 'HE', 'NW', 'RP', 'SL'] },
    { name: 'Mariä Himmelfahrt', datum: new Date(jahr, 7, 15), bundeslaender: ['BY', 'SL'] },
    { name: 'Weltkindertag', datum: new Date(jahr, 8, 20), bundeslaender: ['TH'] },
    { name: 'Reformationstag', datum: new Date(jahr, 9, 31), bundeslaender: ['BB', 'HB', 'HH', 'MV', 'NI', 'SN', 'ST', 'SH', 'TH'] },
    { name: 'Allerheiligen', datum: new Date(jahr, 10, 1), bundeslaender: ['BW', 'BY', 'NW', 'RP', 'SL'] },
    { name: 'Buß- und Bettag', datum: berechneBussUndBettag(jahr), bundeslaender: ['SN'] },
  ];
  
  return feiertage;
}

// Prüft ob ein Datum ein Feiertag für ein Bundesland ist
function istFeiertag(datum: Date, feiertage: Feiertag[], bundesland: string): Feiertag | null {
  for (const feiertag of feiertage) {
    if (
      feiertag.datum.getFullYear() === datum.getFullYear() &&
      feiertag.datum.getMonth() === datum.getMonth() &&
      feiertag.datum.getDate() === datum.getDate()
    ) {
      // Bundesweit oder gilt für dieses Bundesland
      if (feiertag.bundeslaender.length === 0 || feiertag.bundeslaender.includes(bundesland)) {
        return feiertag;
      }
    }
  }
  return null;
}

interface Ergebnis {
  kalendertage: number;
  arbeitstage: number;
  wochenendtage: number;
  feiertage: number;
  feiertagsListe: Feiertag[];
  wochen: number;
  monate: number;
}

export default function ArbeitstageRechner() {
  // Aktuelles Datum als Standard
  const heute = new Date();
  const jahresanfang = new Date(heute.getFullYear(), 0, 1);
  const jahresende = new Date(heute.getFullYear(), 11, 31);
  
  const [startDatum, setStartDatum] = useState(jahresanfang.toISOString().split('T')[0]);
  const [endDatum, setEndDatum] = useState(jahresende.toISOString().split('T')[0]);
  const [bundesland, setBundesland] = useState('NW');
  const [samstagIstArbeitstag, setSamstagIstArbeitstag] = useState(false);

  const ergebnis = useMemo<Ergebnis | null>(() => {
    const start = new Date(startDatum);
    const ende = new Date(endDatum);
    
    if (isNaN(start.getTime()) || isNaN(ende.getTime()) || start > ende) {
      return null;
    }
    
    // Feiertage für alle betroffenen Jahre sammeln
    const jahre = new Set<number>();
    for (let d = new Date(start); d <= ende; d.setDate(d.getDate() + 1)) {
      jahre.add(d.getFullYear());
    }
    
    let alleFeiertage: Feiertag[] = [];
    jahre.forEach(j => {
      alleFeiertage = [...alleFeiertage, ...getFeiertage(j)];
    });
    
    let kalendertage = 0;
    let arbeitstage = 0;
    let wochenendtage = 0;
    let feiertagsAnzahl = 0;
    const gefundeneFeiertage: Feiertag[] = [];
    
    // Durchlaufe jeden Tag im Zeitraum
    for (let d = new Date(start); d <= ende; d.setDate(d.getDate() + 1)) {
      kalendertage++;
      const wochentag = d.getDay(); // 0 = Sonntag, 6 = Samstag
      
      // Prüfe auf Wochenende
      const istSonntag = wochentag === 0;
      const istSamstag = wochentag === 6;
      
      if (istSonntag || (istSamstag && !samstagIstArbeitstag)) {
        wochenendtage++;
        continue;
      }
      
      // Prüfe auf Feiertag
      const feiertag = istFeiertag(d, alleFeiertage, bundesland);
      if (feiertag) {
        feiertagsAnzahl++;
        // Füge nur hinzu wenn noch nicht in der Liste (bei Jahreswechsel)
        if (!gefundeneFeiertage.find(f => 
          f.datum.getTime() === feiertag.datum.getTime() && f.name === feiertag.name
        )) {
          gefundeneFeiertage.push(feiertag);
        }
        continue;
      }
      
      arbeitstage++;
    }
    
    // Wochen und Monate berechnen
    const msProTag = 1000 * 60 * 60 * 24;
    const tage = Math.ceil((ende.getTime() - start.getTime()) / msProTag) + 1;
    const wochen = Math.round(tage / 7 * 10) / 10;
    const monate = Math.round(tage / 30.44 * 10) / 10; // Durchschnittliche Monatslänge
    
    // Sortiere Feiertage nach Datum
    gefundeneFeiertage.sort((a, b) => a.datum.getTime() - b.datum.getTime());
    
    return {
      kalendertage,
      arbeitstage,
      wochenendtage,
      feiertage: feiertagsAnzahl,
      feiertagsListe: gefundeneFeiertage,
      wochen,
      monate,
    };
  }, [startDatum, endDatum, bundesland, samstagIstArbeitstag]);

  const formatDatum = (datum: Date): string => {
    return datum.toLocaleDateString('de-DE', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📅 Zeitraum wählen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Von</label>
            <input
              type="date"
              value={startDatum}
              onChange={(e) => setStartDatum(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bis</label>
            <input
              type="date"
              value={endDatum}
              onChange={(e) => setEndDatum(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bundesland</label>
          <select
            value={bundesland}
            onChange={(e) => setBundesland(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(BUNDESLAENDER).map(([kuerzel, name]) => (
              <option key={kuerzel} value={kuerzel}>{name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Für regionale Feiertage (z.B. Fronleichnam, Reformationstag)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="samstag"
            checked={samstagIstArbeitstag}
            onChange={(e) => setSamstagIstArbeitstag(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="samstag" className="text-gray-700">
            Samstag ist Arbeitstag (6-Tage-Woche)
          </label>
        </div>
        
        {/* Schnellauswahl */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Schnellauswahl:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const jetzt = new Date();
                setStartDatum(new Date(jetzt.getFullYear(), 0, 1).toISOString().split('T')[0]);
                setEndDatum(new Date(jetzt.getFullYear(), 11, 31).toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
            >
              Aktuelles Jahr
            </button>
            <button
              onClick={() => {
                const jetzt = new Date();
                setStartDatum(new Date(jetzt.getFullYear(), jetzt.getMonth(), 1).toISOString().split('T')[0]);
                const letzterTag = new Date(jetzt.getFullYear(), jetzt.getMonth() + 1, 0);
                setEndDatum(letzterTag.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
            >
              Aktueller Monat
            </button>
            <button
              onClick={() => {
                const jetzt = new Date();
                // Finde Montag der aktuellen Woche
                const tag = jetzt.getDay();
                const montag = new Date(jetzt);
                montag.setDate(jetzt.getDate() - (tag === 0 ? 6 : tag - 1));
                const freitag = new Date(montag);
                freitag.setDate(montag.getDate() + 4);
                setStartDatum(montag.toISOString().split('T')[0]);
                setEndDatum(freitag.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
            >
              Aktuelle Woche
            </button>
            <button
              onClick={() => {
                const jetzt = new Date();
                setStartDatum(new Date(jetzt.getFullYear() + 1, 0, 1).toISOString().split('T')[0]);
                setEndDatum(new Date(jetzt.getFullYear() + 1, 11, 31).toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
            >
              Nächstes Jahr
            </button>
          </div>
        </div>
      </div>

      {/* Ergebnis Section */}
      {ergebnis && (
        <>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
            <div className="text-center mb-4">
              <p className="text-blue-100 text-sm">Arbeitstage im Zeitraum</p>
              <p className="text-5xl font-bold">{ergebnis.arbeitstage}</p>
              <p className="text-blue-200 text-sm mt-1">
                von {ergebnis.kalendertage} Kalendertagen
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-400">
              <div className="text-center">
                <p className="text-2xl font-bold">{ergebnis.wochenendtage}</p>
                <p className="text-blue-200 text-xs">Wochenend-Tage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{ergebnis.feiertage}</p>
                <p className="text-blue-200 text-xs">Feiertage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{ergebnis.wochen}</p>
                <p className="text-blue-200 text-xs">Wochen</p>
              </div>
            </div>
          </div>
          
          {/* Detaillierte Aufstellung */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">📊 Detaillierte Aufstellung</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Kalendertage gesamt</span>
                <span className="font-semibold text-gray-800">{ergebnis.kalendertage} Tage</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">− Wochenendtage ({samstagIstArbeitstag ? 'nur Sonntage' : 'Sa + So'})</span>
                <span className="font-semibold text-red-600">−{ergebnis.wochenendtage} Tage</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">− Gesetzliche Feiertage ({BUNDESLAENDER[bundesland]})</span>
                <span className="font-semibold text-red-600">−{ergebnis.feiertage} Tage</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-blue-50 -mx-2 px-2 rounded-lg">
                <span className="font-bold text-gray-800">= Arbeitstage</span>
                <span className="font-bold text-blue-600 text-xl">{ergebnis.arbeitstage} Tage</span>
              </div>
            </div>
            
            {/* Zusätzliche Infos */}
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Zeitraum entspricht</p>
                <p className="font-semibold text-gray-800">{ergebnis.wochen} Wochen / {ergebnis.monate} Monate</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Arbeitstage pro Woche ⌀</p>
                <p className="font-semibold text-gray-800">
                  {ergebnis.wochen > 0 ? (ergebnis.arbeitstage / ergebnis.wochen).toFixed(1) : 0} Tage
                </p>
              </div>
            </div>
          </div>
          
          {/* Feiertage im Zeitraum */}
          {ergebnis.feiertagsListe.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                🎉 Feiertage im Zeitraum ({ergebnis.feiertagsListe.length})
              </h3>
              <div className="space-y-2">
                {ergebnis.feiertagsListe.map((feiertag, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-800">{feiertag.name}</span>
                      {feiertag.bundeslaender.length > 0 && (
                        <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                          regional
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600 text-sm">{formatDatum(feiertag.datum)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Fehler bei ungültigem Zeitraum */}
      {!ergebnis && startDatum && endDatum && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <p className="text-red-700 font-medium">
            ⚠️ Bitte wählen Sie einen gültigen Zeitraum (Startdatum vor Enddatum).
          </p>
        </div>
      )}

      {/* Info-Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-2">ℹ️ So funktioniert der Rechner</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Arbeitstage</strong> = Montag bis Freitag (bei 5-Tage-Woche)</li>
          <li>• <strong>Feiertage</strong> werden automatisch abgezogen (nach Bundesland)</li>
          <li>• Feiertage, die auf ein Wochenende fallen, werden nicht doppelt gezählt</li>
          <li>• Für die 6-Tage-Woche aktivieren Sie "Samstag ist Arbeitstag"</li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stellen</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-gray-700">Feiertage</p>
            <p className="text-gray-600">
              Gesetzliche Feiertage werden durch die Feiertagsgesetze der einzelnen Bundesländer geregelt.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Arbeitszeitregelungen</p>
            <p className="text-gray-600">
              Bundesministerium für Arbeit und Soziales (BMAS)
            </p>
            <a 
              href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/arbeitsrecht.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              → www.bmas.de
            </a>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="text-sm text-amber-700 space-y-2">
          <li>• <strong>Mariä Himmelfahrt (15.08.)</strong> gilt in Bayern nur in Gemeinden mit überwiegend katholischer Bevölkerung</li>
          <li>• <strong>Augsburger Friedensfest (08.08.)</strong> gilt nur in der Stadt Augsburg (hier nicht berücksichtigt)</li>
          <li>• <strong>Fronleichnam</strong> gilt in Sachsen und Thüringen nur in bestimmten Gemeinden</li>
          <li>• <strong>Urlaub</strong> und <strong>Krankheitstage</strong> werden hier nicht berücksichtigt</li>
          <li>• Für arbeitsrechtliche Berechnungen konsultieren Sie bitte einen Rechtsanwalt</li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-bold text-gray-700 mb-3">📚 Quellen</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <a 
              href="https://www.bmi.bund.de/DE/themen/verfassung/staatliche-symbole/nationale-feiertage/nationale-feiertage-node.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Bundesministerium des Innern – Nationale Feiertage
            </a>
          </li>
          <li>
            <a 
              href="https://www.schulferien.org/deutschland/feiertage/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Schulferien.org – Feiertage Deutschland
            </a>
          </li>
          <li>
            <a 
              href="https://www.dgb.de/service/ratgeber/feiertage/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Deutscher Gewerkschaftsbund – Feiertage-Übersicht
            </a>
          </li>
          <li>
            <a 
              href="https://www.gesetze-im-internet.de/arbzg/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Arbeitszeitgesetz (ArbZG)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
