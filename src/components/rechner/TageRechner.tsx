import { useState, useMemo } from 'react';

// Tage-Rechner: Berechnet Tage, Wochen und Monate zwischen zwei Daten

interface Ergebnis {
  tage: number;
  wochen: number;
  wochenRest: number;
  monate: number;
  monateRest: number;
  jahre: number;
  jahreRest: number;
  wochentageStart: string;
  wochentageEnde: string;
}

const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export default function TageRechner() {
  // Heute als Standard für Startdatum
  const heute = new Date();
  const inEinemMonat = new Date(heute);
  inEinemMonat.setMonth(inEinemMonat.getMonth() + 1);
  
  const [startDatum, setStartDatum] = useState(heute.toISOString().split('T')[0]);
  const [endDatum, setEndDatum] = useState(inEinemMonat.toISOString().split('T')[0]);
  const [endDatumEinschliessen, setEndDatumEinschliessen] = useState(true);

  const ergebnis = useMemo<Ergebnis | null>(() => {
    const start = new Date(startDatum);
    const ende = new Date(endDatum);
    
    if (isNaN(start.getTime()) || isNaN(ende.getTime())) {
      return null;
    }
    
    // Tage berechnen
    const msProTag = 1000 * 60 * 60 * 24;
    let tage = Math.floor((ende.getTime() - start.getTime()) / msProTag);
    
    // Wenn Enddatum eingeschlossen werden soll, +1 Tag
    if (endDatumEinschliessen) {
      tage += 1;
    }
    
    // Negative Werte erlauben (Enddatum vor Startdatum)
    const isNegativ = tage < 0;
    const absoluteTage = Math.abs(tage);
    
    // Wochen und Rest
    const wochen = Math.floor(absoluteTage / 7);
    const wochenRest = absoluteTage % 7;
    
    // Monate und Rest (approximiert mit 30.44 Tagen pro Monat)
    const monate = Math.floor(absoluteTage / 30.44);
    const monateRest = Math.round(absoluteTage % 30.44);
    
    // Jahre und Rest
    const jahre = Math.floor(absoluteTage / 365.25);
    const jahreRest = Math.round(absoluteTage % 365.25);
    
    return {
      tage: isNegativ ? -absoluteTage : absoluteTage,
      wochen: isNegativ ? -wochen : wochen,
      wochenRest,
      monate: isNegativ ? -monate : monate,
      monateRest,
      jahre: isNegativ ? -jahre : jahre,
      jahreRest,
      wochentageStart: WOCHENTAGE[start.getDay()],
      wochentageEnde: WOCHENTAGE[ende.getDay()],
    };
  }, [startDatum, endDatum, endDatumEinschliessen]);

  const formatDatum = (datumStr: string): string => {
    const datum = new Date(datumStr);
    return datum.toLocaleDateString('de-DE', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  };

  const tauschenDaten = () => {
    const temp = startDatum;
    setStartDatum(endDatum);
    setEndDatum(temp);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📅 Daten eingeben</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
            <input
              type="date"
              value={startDatum}
              onChange={(e) => setStartDatum(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {ergebnis && (
              <p className="text-xs text-gray-500 mt-1">{ergebnis.wochentageStart}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enddatum</label>
            <input
              type="date"
              value={endDatum}
              onChange={(e) => setEndDatum(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {ergebnis && (
              <p className="text-xs text-gray-500 mt-1">{ergebnis.wochentageEnde}</p>
            )}
          </div>
        </div>
        
        {/* Daten tauschen Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={tauschenDaten}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-2"
          >
            <span>⇄</span> Daten tauschen
          </button>
        </div>
        
        {/* Option: Enddatum einschließen */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            id="einschliessen"
            checked={endDatumEinschliessen}
            onChange={(e) => setEndDatumEinschliessen(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="einschliessen" className="text-gray-700">
            Enddatum einschließen (z.B. für Urlaubstage)
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {endDatumEinschliessen 
            ? '✓ Das Enddatum wird mitgezählt (z.B. 01.01. bis 03.01. = 3 Tage)'
            : '✗ Das Enddatum wird nicht mitgezählt (z.B. 01.01. bis 03.01. = 2 Tage)'}
        </p>
        
        {/* Schnellauswahl */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Schnellauswahl:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const jetzt = new Date();
                setStartDatum(jetzt.toISOString().split('T')[0]);
                const silvester = new Date(jetzt.getFullYear(), 11, 31);
                setEndDatum(silvester.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
            >
              Bis Jahresende
            </button>
            <button
              onClick={() => {
                const jetzt = new Date();
                setStartDatum(jetzt.toISOString().split('T')[0]);
                const in30Tagen = new Date(jetzt);
                in30Tagen.setDate(in30Tagen.getDate() + 30);
                setEndDatum(in30Tagen.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
            >
              Nächste 30 Tage
            </button>
            <button
              onClick={() => {
                const jetzt = new Date();
                setStartDatum(jetzt.toISOString().split('T')[0]);
                const in90Tagen = new Date(jetzt);
                in90Tagen.setDate(in90Tagen.getDate() + 90);
                setEndDatum(in90Tagen.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
            >
              Nächste 90 Tage
            </button>
            <button
              onClick={() => {
                const jetzt = new Date();
                setStartDatum(jetzt.toISOString().split('T')[0]);
                const inEinemJahr = new Date(jetzt);
                inEinemJahr.setFullYear(inEinemJahr.getFullYear() + 1);
                setEndDatum(inEinemJahr.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
            >
              Nächstes Jahr
            </button>
            <button
              onClick={() => {
                const jetzt = new Date();
                const weihnachten = new Date(jetzt.getFullYear(), 11, 24);
                if (weihnachten < jetzt) {
                  weihnachten.setFullYear(weihnachten.getFullYear() + 1);
                }
                setStartDatum(jetzt.toISOString().split('T')[0]);
                setEndDatum(weihnachten.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
            >
              Bis Weihnachten 🎄
            </button>
          </div>
        </div>
      </div>

      {/* Ergebnis Section */}
      {ergebnis && (
        <>
          <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
            ergebnis.tage >= 0 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
              : 'bg-gradient-to-br from-orange-500 to-red-600'
          }`}>
            <div className="text-center mb-4">
              <p className={`text-sm ${ergebnis.tage >= 0 ? 'text-blue-100' : 'text-orange-100'}`}>
                {ergebnis.tage >= 0 ? 'Tage zwischen den Daten' : 'Tage in der Vergangenheit'}
              </p>
              <p className="text-6xl font-bold">
                {Math.abs(ergebnis.tage)}
              </p>
              <p className={`text-sm mt-2 ${ergebnis.tage >= 0 ? 'text-blue-200' : 'text-orange-200'}`}>
                {ergebnis.tage === 1 ? 'Tag' : 'Tage'}
                {endDatumEinschliessen ? ' (inkl. Enddatum)' : ' (exkl. Enddatum)'}
              </p>
            </div>
            
            <div className={`grid grid-cols-3 gap-4 mt-4 pt-4 border-t ${
              ergebnis.tage >= 0 ? 'border-blue-400' : 'border-orange-400'
            }`}>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.abs(ergebnis.wochen)}</p>
                <p className={`text-xs ${ergebnis.tage >= 0 ? 'text-blue-200' : 'text-orange-200'}`}>
                  {Math.abs(ergebnis.wochen) === 1 ? 'Woche' : 'Wochen'}
                  {ergebnis.wochenRest > 0 && ` + ${ergebnis.wochenRest} Tage`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.abs(ergebnis.monate)}</p>
                <p className={`text-xs ${ergebnis.tage >= 0 ? 'text-blue-200' : 'text-orange-200'}`}>
                  {Math.abs(ergebnis.monate) === 1 ? 'Monat' : 'Monate'}
                  {ergebnis.monateRest > 0 && ` + ${ergebnis.monateRest} Tage`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.abs(ergebnis.jahre)}</p>
                <p className={`text-xs ${ergebnis.tage >= 0 ? 'text-blue-200' : 'text-orange-200'}`}>
                  {Math.abs(ergebnis.jahre) === 1 ? 'Jahr' : 'Jahre'}
                  {ergebnis.jahreRest > 0 && ` + ${ergebnis.jahreRest} Tage`}
                </p>
              </div>
            </div>
          </div>
          
          {/* Detaillierte Aufstellung */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">📊 Detaillierte Aufstellung</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Startdatum</span>
                <span className="font-semibold text-gray-800">{formatDatum(startDatum)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Enddatum</span>
                <span className="font-semibold text-gray-800">{formatDatum(endDatum)}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-blue-50 -mx-2 px-2 rounded-lg">
                <span className="font-bold text-gray-800">Differenz</span>
                <span className="font-bold text-blue-600 text-xl">
                  {Math.abs(ergebnis.tage)} {Math.abs(ergebnis.tage) === 1 ? 'Tag' : 'Tage'}
                </span>
              </div>
            </div>
            
            {/* Umrechnungen */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Umrechnungen:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">In Stunden</p>
                  <p className="font-semibold text-gray-800">{(Math.abs(ergebnis.tage) * 24).toLocaleString('de-DE')} h</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">In Minuten</p>
                  <p className="font-semibold text-gray-800">{(Math.abs(ergebnis.tage) * 24 * 60).toLocaleString('de-DE')} min</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">In Sekunden</p>
                  <p className="font-semibold text-gray-800">{(Math.abs(ergebnis.tage) * 24 * 60 * 60).toLocaleString('de-DE')} s</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500">Arbeitswochen (5 Tage)</p>
                  <p className="font-semibold text-gray-800">{(Math.abs(ergebnis.tage) / 5).toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Spezielle Zeiträume */}
          {ergebnis.tage > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">🎯 Typische Zeiträume</h3>
              <div className="space-y-2 text-sm">
                {ergebnis.tage >= 7 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Volle Wochen</span>
                    <span className="font-medium text-gray-800">{Math.floor(ergebnis.tage / 7)}</span>
                  </div>
                )}
                {ergebnis.tage >= 14 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Zweiwochenzeiträume</span>
                    <span className="font-medium text-gray-800">{Math.floor(ergebnis.tage / 14)}</span>
                  </div>
                )}
                {ergebnis.tage >= 30 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Volle Monate (30 Tage)</span>
                    <span className="font-medium text-gray-800">{Math.floor(ergebnis.tage / 30)}</span>
                  </div>
                )}
                {ergebnis.tage >= 91 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Quartale (91 Tage)</span>
                    <span className="font-medium text-gray-800">{Math.floor(ergebnis.tage / 91)}</span>
                  </div>
                )}
                {ergebnis.tage >= 182 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Halbjahre (182 Tage)</span>
                    <span className="font-medium text-gray-800">{Math.floor(ergebnis.tage / 182)}</span>
                  </div>
                )}
                {ergebnis.tage >= 365 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Volle Jahre (365 Tage)</span>
                    <span className="font-medium text-gray-800">{Math.floor(ergebnis.tage / 365)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Fehler bei ungültigem Datum */}
      {!ergebnis && startDatum && endDatum && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <p className="text-red-700 font-medium">
            ⚠️ Bitte geben Sie gültige Daten ein.
          </p>
        </div>
      )}

      {/* Info-Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-2">ℹ️ So funktioniert der Rechner</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Tage dazwischen:</strong> Einfache Differenz zwischen zwei Daten</li>
          <li>• <strong>Enddatum einschließen:</strong> Für Urlaubszählungen, bei denen Start- und Endtag beide zählen</li>
          <li>• <strong>Wochen:</strong> Tage geteilt durch 7</li>
          <li>• <strong>Monate:</strong> Approximiert mit durchschnittlich 30,44 Tagen pro Monat</li>
          <li>• <strong>Jahre:</strong> Berechnet mit 365,25 Tagen (inkl. Schaltjahre)</li>
        </ul>
      </div>

      {/* Anwendungsbeispiele */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">💡 Typische Anwendungen</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• <strong>Urlaubsplanung:</strong> Wie viele Tage dauert mein Urlaub?</li>
          <li>• <strong>Countdown:</strong> Wie viele Tage bis zu einem Event?</li>
          <li>• <strong>Fristen:</strong> Wie viele Tage verbleiben bis zur Deadline?</li>
          <li>• <strong>Alter berechnen:</strong> Wie alt ist etwas in Tagen?</li>
          <li>• <strong>Projektplanung:</strong> Zeitraum zwischen Meilensteinen</li>
          <li>• <strong>Schwangerschaft:</strong> Tage seit Empfängnis (ca. 280 Tage gesamt)</li>
        </ul>
      </div>

      {/* Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Hinweise</h3>
        <ul className="text-sm text-amber-700 space-y-2">
          <li>• <strong>Monats- und Jahresberechnung:</strong> Die Werte sind Näherungen, da Monate unterschiedlich lang sind</li>
          <li>• <strong>Schaltjahre:</strong> Bei Jahresberechnungen wird ein Durchschnitt von 365,25 Tagen verwendet</li>
          <li>• <strong>Negative Werte:</strong> Wenn das Enddatum vor dem Startdatum liegt, wird die Differenz als negativ angezeigt</li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-bold text-gray-700 mb-3">📚 Weitere Informationen</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <a 
              href="https://de.wikipedia.org/wiki/Zeitspanne"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Wikipedia – Zeitspanne
            </a>
          </li>
          <li>
            <a 
              href="https://de.wikipedia.org/wiki/Schaltjahr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Wikipedia – Schaltjahr
            </a>
          </li>
          <li>
            <a 
              href="https://de.wikipedia.org/wiki/Gregorianischer_Kalender"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Wikipedia – Gregorianischer Kalender
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
