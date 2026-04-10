import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

export default function AlterRechner() {
  const [geburtsdatum, setGeburtsdatum] = useState<string>('');
  const [berechnet, setBerechnet] = useState(false);

  const ergebnis = useMemo(() => {
    if (!geburtsdatum) {
      return null;
    }

    const geburt = new Date(geburtsdatum);
    const heute = new Date();
    
    // Validierung
    if (isNaN(geburt.getTime()) || geburt > heute) {
      return null;
    }

    // Exaktes Alter berechnen
    let jahre = heute.getFullYear() - geburt.getFullYear();
    let monate = heute.getMonth() - geburt.getMonth();
    let tage = heute.getDate() - geburt.getDate();

    // Tage korrigieren
    if (tage < 0) {
      monate--;
      // Tage des Vormonats ermitteln
      const vormonat = new Date(heute.getFullYear(), heute.getMonth(), 0);
      tage += vormonat.getDate();
    }

    // Monate korrigieren
    if (monate < 0) {
      jahre--;
      monate += 12;
    }

    // Gesamte Tage seit Geburt
    const gesamtTage = Math.floor((heute.getTime() - geburt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Gesamte Wochen
    const gesamtWochen = Math.floor(gesamtTage / 7);
    
    // Gesamte Monate (approximiert)
    const gesamtMonate = jahre * 12 + monate;
    
    // Gesamte Stunden
    const gesamtStunden = gesamtTage * 24;
    
    // Gesamte Minuten
    const gesamtMinuten = gesamtStunden * 60;

    // Nächster Geburtstag berechnen
    const naechsterGeburtstag = new Date(heute.getFullYear(), geburt.getMonth(), geburt.getDate());
    
    // Wenn der Geburtstag dieses Jahr schon war, nächstes Jahr nehmen
    if (naechsterGeburtstag <= heute) {
      naechsterGeburtstag.setFullYear(heute.getFullYear() + 1);
    }
    
    const tageBisGeburtstag = Math.ceil((naechsterGeburtstag.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24));
    
    // Wochentag der Geburt
    const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const geburtsWochentag = wochentage[geburt.getDay()];
    
    // Wochentag des nächsten Geburtstags
    const naechsterGeburtstagWochentag = wochentage[naechsterGeburtstag.getDay()];
    
    // Sternzeichen berechnen
    const sternzeichen = berechneSternzeichen(geburt.getMonth() + 1, geburt.getDate());
    
    // Chinesisches Tierkreiszeichen
    const chinesischesZeichen = berechneChinesischesZeichen(geburt.getFullYear());
    
    // Generation ermitteln
    const generation = ermittleGeneration(geburt.getFullYear());
    
    // Ist heute Geburtstag?
    const istHeute = heute.getMonth() === geburt.getMonth() && heute.getDate() === geburt.getDate();

    return {
      jahre,
      monate,
      tage,
      gesamtTage,
      gesamtWochen,
      gesamtMonate,
      gesamtStunden,
      gesamtMinuten,
      tageBisGeburtstag,
      naechsterGeburtstag,
      naechsterGeburtstagWochentag,
      geburtsWochentag,
      sternzeichen,
      chinesischesZeichen,
      generation,
      istHeute,
      geburtsdatum: geburt,
    };
  }, [geburtsdatum]);

  const berechneSternzeichen = (monat: number, tag: number): { name: string; symbol: string; datum: string } => {
    const zeichen = [
      { name: 'Steinbock', symbol: '♑', start: [1, 1], end: [1, 19] },
      { name: 'Wassermann', symbol: '♒', start: [1, 20], end: [2, 18] },
      { name: 'Fische', symbol: '♓', start: [2, 19], end: [3, 20] },
      { name: 'Widder', symbol: '♈', start: [3, 21], end: [4, 19] },
      { name: 'Stier', symbol: '♉', start: [4, 20], end: [5, 20] },
      { name: 'Zwillinge', symbol: '♊', start: [5, 21], end: [6, 20] },
      { name: 'Krebs', symbol: '♋', start: [6, 21], end: [7, 22] },
      { name: 'Löwe', symbol: '♌', start: [7, 23], end: [8, 22] },
      { name: 'Jungfrau', symbol: '♍', start: [8, 23], end: [9, 22] },
      { name: 'Waage', symbol: '♎', start: [9, 23], end: [10, 22] },
      { name: 'Skorpion', symbol: '♏', start: [10, 23], end: [11, 21] },
      { name: 'Schütze', symbol: '♐', start: [11, 22], end: [12, 21] },
      { name: 'Steinbock', symbol: '♑', start: [12, 22], end: [12, 31] },
    ];

    for (const z of zeichen) {
      const [startMonat, startTag] = z.start;
      const [endMonat, endTag] = z.end;
      
      if (monat === startMonat && tag >= startTag) {
        return { name: z.name, symbol: z.symbol, datum: `${startTag}.${startMonat}. – ${endTag}.${endMonat}.` };
      }
      if (monat === endMonat && tag <= endTag) {
        return { name: z.name, symbol: z.symbol, datum: `${startTag}.${startMonat}. – ${endTag}.${endMonat}.` };
      }
    }
    
    return { name: 'Steinbock', symbol: '♑', datum: '22.12. – 19.1.' };
  };

  const berechneChinesischesZeichen = (jahr: number): { name: string; symbol: string } => {
    const zeichen = [
      { name: 'Ratte', symbol: '🐀' },
      { name: 'Büffel', symbol: '🐂' },
      { name: 'Tiger', symbol: '🐅' },
      { name: 'Hase', symbol: '🐇' },
      { name: 'Drache', symbol: '🐉' },
      { name: 'Schlange', symbol: '🐍' },
      { name: 'Pferd', symbol: '🐎' },
      { name: 'Ziege', symbol: '🐐' },
      { name: 'Affe', symbol: '🐒' },
      { name: 'Hahn', symbol: '🐓' },
      { name: 'Hund', symbol: '🐕' },
      { name: 'Schwein', symbol: '🐖' },
    ];
    
    // 1900 war das Jahr der Ratte
    const index = (jahr - 1900) % 12;
    return zeichen[index >= 0 ? index : index + 12];
  };

  const ermittleGeneration = (jahr: number): { name: string; zeitraum: string } => {
    if (jahr >= 2013) return { name: 'Generation Alpha', zeitraum: '2013 – heute' };
    if (jahr >= 1997) return { name: 'Generation Z', zeitraum: '1997 – 2012' };
    if (jahr >= 1981) return { name: 'Millennials (Gen Y)', zeitraum: '1981 – 1996' };
    if (jahr >= 1965) return { name: 'Generation X', zeitraum: '1965 – 1980' };
    if (jahr >= 1946) return { name: 'Baby Boomer', zeitraum: '1946 – 1964' };
    if (jahr >= 1928) return { name: 'Stille Generation', zeitraum: '1928 – 1945' };
    return { name: 'Greatest Generation', zeitraum: 'vor 1928' };
  };

  const formatNumber = (n: number) => n.toLocaleString('de-DE');
  
  const formatDatum = (datum: Date) => {
    return datum.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  // Prozent des aktuellen Lebensjahres
  const getJahresfortschritt = () => {
    if (!ergebnis) return 0;
    const monateTage = ergebnis.monate * 30 + ergebnis.tage;
    return Math.round((monateTage / 365) * 100);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">🎂</span>
          Geburtsdatum eingeben
        </h2>

        <div className="space-y-6">
          {/* Geburtsdatum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geburtsdatum
            </label>
            <input
              type="date"
              value={geburtsdatum}
              onChange={(e) => {
                setGeburtsdatum(e.target.value);
                setBerechnet(false);
              }}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>

          <button
            onClick={handleBerechnen}
            disabled={!geburtsdatum}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            🎂 Alter berechnen
          </button>
        </div>
      </div>

      {/* Ergebnis */}
      {berechnet && ergebnis && (
        <div className="space-y-6 animate-in fade-in duration-500">
          
          {/* Geburtstag heute? */}
          {ergebnis.istHeute && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg p-6 text-center">
              <div className="text-6xl mb-4">🎉🎂🎈</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Herzlichen Glückwunsch!
              </h3>
              <p className="text-white/90 text-lg">
                Heute ist dein Geburtstag! Du wirst {ergebnis.jahre} Jahre alt!
              </p>
            </div>
          )}

          {/* Hauptergebnis */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 opacity-90">Dein exaktes Alter</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-4xl font-bold">{ergebnis.jahre}</div>
                <div className="text-sm opacity-80">Jahre</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-4xl font-bold">{ergebnis.monate}</div>
                <div className="text-sm opacity-80">Monate</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-4xl font-bold">{ergebnis.tage}</div>
                <div className="text-sm opacity-80">Tage</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg opacity-90">
                Du wurdest am <span className="font-semibold">{ergebnis.geburtsWochentag}</span> geboren
              </p>
              <p className="text-sm opacity-75 mt-1">
                {formatDatum(ergebnis.geburtsdatum)}
              </p>
            </div>
          </div>

          {/* Nächster Geburtstag */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎈</span>
              Nächster Geburtstag
            </h3>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {ergebnis.tageBisGeburtstag === 0 ? 'Heute!' : `${ergebnis.tageBisGeburtstag} Tage`}
                </div>
                <p className="text-gray-600 text-sm">
                  {ergebnis.naechsterGeburtstagWochentag}, {ergebnis.naechsterGeburtstag.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="text-5xl">
                {ergebnis.tageBisGeburtstag <= 7 ? '🎉' : ergebnis.tageBisGeburtstag <= 30 ? '🎈' : '📅'}
              </div>
            </div>

            {/* Countdown-Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Fortschritt im {ergebnis.jahre + 1}. Lebensjahr</span>
                <span>{getJahresfortschritt()}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${getJahresfortschritt()}%` }}
                />
              </div>
            </div>
          </div>

          {/* Statistiken */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              Dein Leben in Zahlen
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-800">{formatNumber(ergebnis.gesamtTage)}</div>
                <div className="text-sm text-gray-500">Tage gelebt</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-800">{formatNumber(ergebnis.gesamtWochen)}</div>
                <div className="text-sm text-gray-500">Wochen gelebt</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-800">{formatNumber(ergebnis.gesamtMonate)}</div>
                <div className="text-sm text-gray-500">Monate gelebt</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-800">{formatNumber(ergebnis.gesamtStunden)}</div>
                <div className="text-sm text-gray-500">Stunden gelebt</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-800">
                  {formatNumber(ergebnis.gesamtMinuten)} Minuten
                </div>
                <div className="text-sm text-blue-600">
                  So viele Minuten lebst du bereits auf dieser Erde!
                </div>
              </div>
            </div>
          </div>

          {/* Sternzeichen & mehr */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>✨</span>
              Deine Zeichen
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sternzeichen */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{ergebnis.sternzeichen.symbol}</span>
                  <div>
                    <div className="font-bold text-gray-800">{ergebnis.sternzeichen.name}</div>
                    <div className="text-sm text-gray-500">Sternzeichen</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{ergebnis.sternzeichen.datum}</p>
              </div>

              {/* Chinesisches Zeichen */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{ergebnis.chinesischesZeichen.symbol}</span>
                  <div>
                    <div className="font-bold text-gray-800">{ergebnis.chinesischesZeichen.name}</div>
                    <div className="text-sm text-gray-500">Chinesisches Tierzeichen</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generation */}
            <div className="mt-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">👥</span>
                <div>
                  <div className="font-bold text-gray-800">{ergebnis.generation.name}</div>
                  <div className="text-sm text-gray-500">Generation ({ergebnis.generation.zeitraum})</div>
                </div>
              </div>
            </div>
          </div>

          {/* Meilensteine */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎯</span>
              Kommende Meilensteine
            </h3>
            
            <div className="space-y-3">
              {[10000, 15000, 20000, 25000, 30000].map((tage) => {
                const istErreicht = ergebnis.gesamtTage >= tage;
                const tageBis = tage - ergebnis.gesamtTage;
                const datum = new Date(ergebnis.geburtsdatum.getTime() + tage * 24 * 60 * 60 * 1000);
                
                if (istErreicht || tageBis > 20000) return null;
                
                return (
                  <div key={tage} className={`flex items-center justify-between p-3 rounded-lg ${istErreicht ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{istErreicht ? '✅' : '⏳'}</span>
                      <div>
                        <div className="font-medium text-gray-800">
                          {formatNumber(tage)} Tage
                        </div>
                        <div className="text-sm text-gray-500">
                          {datum.toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </div>
                    {!istErreicht && (
                      <div className="text-right">
                        <div className="font-bold text-blue-600">in {formatNumber(tageBis)} Tagen</div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Runde Geburtstage */}
              {[30, 40, 50, 60, 70, 80, 90, 100].map((alter) => {
                if (ergebnis.jahre >= alter) return null;
                const jahreB = alter - ergebnis.jahre;
                if (jahreB > 50) return null;
                
                const geburtstagDatum = new Date(ergebnis.geburtsdatum);
                geburtstagDatum.setFullYear(geburtstagDatum.getFullYear() + alter);
                
                return (
                  <div key={alter} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎂</span>
                      <div>
                        <div className="font-medium text-gray-800">
                          {alter}. Geburtstag
                        </div>
                        <div className="text-sm text-gray-500">
                          {geburtstagDatum.toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-600">in {jahreB} {jahreB === 1 ? 'Jahr' : 'Jahren'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hinweis */}
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <div>
                <strong>Hinweis:</strong> Die Berechnung basiert auf dem aktuellen Datum. 
                Das exakte Alter kann je nach Uhrzeit der Geburt um wenige Stunden abweichen.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Info Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Wie wird das genaue Alter berechnet?
        </h2>
        <div className="prose prose-sm text-gray-600 space-y-4">
          <p>
            Unser Alter-Rechner berechnet dein <strong>exaktes Alter in Jahren, Monaten und Tagen</strong>. 
            Anders als bei einer einfachen Jahresberechnung berücksichtigen wir dabei auch den genauen 
            Geburtstag und den aktuellen Tag.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mt-4">Was wird berechnet?</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Exaktes Alter:</strong> Jahre, Monate und Tage seit deiner Geburt</li>
            <li><strong>Tage bis zum nächsten Geburtstag:</strong> Wie lange musst du noch warten?</li>
            <li><strong>Gesamtstatistiken:</strong> Tage, Wochen, Monate, Stunden und Minuten</li>
            <li><strong>Sternzeichen:</strong> Westliches und chinesisches Tierkreiszeichen</li>
            <li><strong>Generation:</strong> Zu welcher Generation gehörst du?</li>
            <li><strong>Meilensteine:</strong> Kommende runde Geburtstage und besondere Tage</li>
          </ul>
          <h3 className="text-lg font-semibold text-gray-800 mt-4">Häufige Fragen</h3>
          <p>
            <strong>Wie alt bin ich in Tagen?</strong> Gib einfach dein Geburtsdatum ein und erhalte 
            sofort die Anzahl der Tage, die du bereits gelebt hast.
          </p>
          <p>
            <strong>Wann ist mein nächster Geburtstag?</strong> Der Rechner zeigt dir automatisch, 
            wie viele Tage es noch bis zu deinem nächsten Geburtstag sind und an welchem Wochentag er fällt.
          </p>
        </div>
      <RechnerFeedback rechnerName="Alter-Rechner" rechnerSlug="alter-rechner" />
      </div>
    </div>
  );
}
