import { useState, useMemo } from 'react';

export default function GeburtstagRechner() {
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

    // Alter berechnen
    let alter = heute.getFullYear() - geburt.getFullYear();
    if (
      heute.getMonth() < geburt.getMonth() ||
      (heute.getMonth() === geburt.getMonth() && heute.getDate() < geburt.getDate())
    ) {
      alter--;
    }

    // Wochentag der Geburt
    const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const geburtsWochentag = wochentage[geburt.getDay()];
    
    // Sternzeichen berechnen
    const sternzeichen = berechneSternzeichen(geburt.getMonth() + 1, geburt.getDate());
    
    // Chinesisches Tierkreiszeichen (inkl. Element)
    const chinesischesZeichen = berechneChinesischesZeichen(geburt.getFullYear());

    // Nächster Geburtstag berechnen
    const naechsterGeburtstag = new Date(heute.getFullYear(), geburt.getMonth(), geburt.getDate());
    
    // Wenn der Geburtstag dieses Jahr schon war, nächstes Jahr nehmen
    if (naechsterGeburtstag <= heute) {
      naechsterGeburtstag.setFullYear(heute.getFullYear() + 1);
    }
    
    const tageBisGeburtstag = Math.ceil((naechsterGeburtstag.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24));
    const naechsterGeburtstagWochentag = wochentage[naechsterGeburtstag.getDay()];
    const wirdAlter = alter + (tageBisGeburtstag > 0 ? 1 : 0);
    
    // Ist heute Geburtstag?
    const istHeute = heute.getMonth() === geburt.getMonth() && heute.getDate() === geburt.getDate();

    // Geburtstage gelebt (inklusive Geburt als Tag 0)
    const geburtstageGefeiert = alter;
    
    // Berühmte Personen mit gleichem Geburtstag
    const beruehmtePersonen = getBeruehmtePersonen(geburt.getMonth() + 1, geburt.getDate());
    
    // Geburtsstein
    const geburtsstein = getGeburtsstein(geburt.getMonth() + 1);
    
    // Geburtsblume
    const geburtsblume = getGeburtsblume(geburt.getMonth() + 1);
    
    // Jahreszeit der Geburt
    const jahreszeit = getJahreszeit(geburt.getMonth() + 1);
    
    // Schnapszahl-Geburtstage (11, 22, 33, 44, etc.)
    const naechsteSchnapszahl = berechneNaechsteSchnapszahl(alter);
    
    // Besondere Geburtstage
    const besondereGeburtstage = berechneBesondereGeburtstage(geburt, alter);
    
    // Statistik: An welchem Wochentag fiel jeder Geburtstag
    const geburtstagsWochentage = berechneAlleGeburtstage(geburt, alter);

    return {
      alter,
      geburtsWochentag,
      sternzeichen,
      chinesischesZeichen,
      tageBisGeburtstag,
      naechsterGeburtstag,
      naechsterGeburtstagWochentag,
      wirdAlter,
      istHeute,
      geburtstageGefeiert,
      beruehmtePersonen,
      geburtsstein,
      geburtsblume,
      jahreszeit,
      naechsteSchnapszahl,
      besondereGeburtstage,
      geburtstagsWochentage,
      geburtsdatum: geburt,
    };
  }, [geburtsdatum]);

  const berechneSternzeichen = (monat: number, tag: number): { name: string; symbol: string; datum: string; element: string; eigenschaften: string[] } => {
    const zeichen = [
      { name: 'Steinbock', symbol: '♑', start: [1, 1], end: [1, 19], element: 'Erde', eigenschaften: ['ehrgeizig', 'diszipliniert', 'verantwortungsvoll'] },
      { name: 'Wassermann', symbol: '♒', start: [1, 20], end: [2, 18], element: 'Luft', eigenschaften: ['unabhängig', 'originell', 'humanitär'] },
      { name: 'Fische', symbol: '♓', start: [2, 19], end: [3, 20], element: 'Wasser', eigenschaften: ['einfühlsam', 'kreativ', 'intuitiv'] },
      { name: 'Widder', symbol: '♈', start: [3, 21], end: [4, 19], element: 'Feuer', eigenschaften: ['mutig', 'energisch', 'direkt'] },
      { name: 'Stier', symbol: '♉', start: [4, 20], end: [5, 20], element: 'Erde', eigenschaften: ['zuverlässig', 'geduldig', 'praktisch'] },
      { name: 'Zwillinge', symbol: '♊', start: [5, 21], end: [6, 20], element: 'Luft', eigenschaften: ['vielseitig', 'kommunikativ', 'neugierig'] },
      { name: 'Krebs', symbol: '♋', start: [6, 21], end: [7, 22], element: 'Wasser', eigenschaften: ['fürsorglich', 'emotional', 'loyal'] },
      { name: 'Löwe', symbol: '♌', start: [7, 23], end: [8, 22], element: 'Feuer', eigenschaften: ['selbstbewusst', 'großzügig', 'kreativ'] },
      { name: 'Jungfrau', symbol: '♍', start: [8, 23], end: [9, 22], element: 'Erde', eigenschaften: ['analytisch', 'hilfsbereit', 'präzise'] },
      { name: 'Waage', symbol: '♎', start: [9, 23], end: [10, 22], element: 'Luft', eigenschaften: ['diplomatisch', 'fair', 'harmoniebedürftig'] },
      { name: 'Skorpion', symbol: '♏', start: [10, 23], end: [11, 21], element: 'Wasser', eigenschaften: ['leidenschaftlich', 'entschlossen', 'tiefgründig'] },
      { name: 'Schütze', symbol: '♐', start: [11, 22], end: [12, 21], element: 'Feuer', eigenschaften: ['optimistisch', 'abenteuerlustig', 'ehrlich'] },
      { name: 'Steinbock', symbol: '♑', start: [12, 22], end: [12, 31], element: 'Erde', eigenschaften: ['ehrgeizig', 'diszipliniert', 'verantwortungsvoll'] },
    ];

    for (const z of zeichen) {
      const [startMonat, startTag] = z.start;
      const [endMonat, endTag] = z.end;
      
      if (monat === startMonat && tag >= startTag) {
        return { name: z.name, symbol: z.symbol, datum: `${startTag}.${startMonat}. – ${endTag}.${endMonat}.`, element: z.element, eigenschaften: z.eigenschaften };
      }
      if (monat === endMonat && tag <= endTag) {
        return { name: z.name, symbol: z.symbol, datum: `${startTag}.${startMonat}. – ${endTag}.${endMonat}.`, element: z.element, eigenschaften: z.eigenschaften };
      }
    }
    
    return { name: 'Steinbock', symbol: '♑', datum: '22.12. – 19.1.', element: 'Erde', eigenschaften: ['ehrgeizig', 'diszipliniert', 'verantwortungsvoll'] };
  };

  const berechneChinesischesZeichen = (jahr: number): { name: string; symbol: string; element: string; elementSymbol: string; eigenschaften: string[] } => {
    const tiere = [
      { name: 'Ratte', symbol: '🐀', eigenschaften: ['klug', 'anpassungsfähig', 'charmant'] },
      { name: 'Büffel', symbol: '🐂', eigenschaften: ['fleißig', 'zuverlässig', 'stark'] },
      { name: 'Tiger', symbol: '🐅', eigenschaften: ['mutig', 'wettbewerbsorientiert', 'selbstbewusst'] },
      { name: 'Hase', symbol: '🐇', eigenschaften: ['sanft', 'elegant', 'wachsam'] },
      { name: 'Drache', symbol: '🐉', eigenschaften: ['energisch', 'furchtlos', 'großzügig'] },
      { name: 'Schlange', symbol: '🐍', eigenschaften: ['weise', 'geheimnisvoll', 'intuitiv'] },
      { name: 'Pferd', symbol: '🐎', eigenschaften: ['aktiv', 'lebhaft', 'unabhängig'] },
      { name: 'Ziege', symbol: '🐐', eigenschaften: ['kreativ', 'friedlich', 'fürsorglich'] },
      { name: 'Affe', symbol: '🐒', eigenschaften: ['witzig', 'neugierig', 'clever'] },
      { name: 'Hahn', symbol: '🐓', eigenschaften: ['pünktlich', 'ehrlich', 'fleißig'] },
      { name: 'Hund', symbol: '🐕', eigenschaften: ['loyal', 'ehrlich', 'hilfsbereit'] },
      { name: 'Schwein', symbol: '🐖', eigenschaften: ['großzügig', 'ehrlich', 'optimistisch'] },
    ];
    
    const elemente = [
      { name: 'Holz', symbol: '🌳' },
      { name: 'Feuer', symbol: '🔥' },
      { name: 'Erde', symbol: '🌍' },
      { name: 'Metall', symbol: '⚙️' },
      { name: 'Wasser', symbol: '💧' },
    ];
    
    // 1900 war das Jahr der Metall-Ratte
    const tierIndex = (jahr - 1900) % 12;
    const elementIndex = Math.floor(((jahr - 1900) % 10) / 2);
    
    const tier = tiere[tierIndex >= 0 ? tierIndex : tierIndex + 12];
    const element = elemente[elementIndex >= 0 ? elementIndex : elementIndex + 5];
    
    return {
      name: tier.name,
      symbol: tier.symbol,
      element: element.name,
      elementSymbol: element.symbol,
      eigenschaften: tier.eigenschaften,
    };
  };

  const getBeruehmtePersonen = (monat: number, tag: number): string[] => {
    // Einige berühmte Personen nach Geburtsdatum
    const personen: Record<string, string[]> = {
      '1-1': ['Wolfgang Joop', 'Frauke Ludowig'],
      '1-8': ['Elvis Presley', 'Stephen Hawking'],
      '1-27': ['Wolfgang Amadeus Mozart', 'Donna Reed'],
      '2-12': ['Abraham Lincoln', 'Charles Darwin'],
      '2-14': ['Michael Bloomberg', 'Rob Thomas'],
      '3-14': ['Albert Einstein', 'Billy Crystal'],
      '3-21': ['Johann Sebastian Bach', 'Gary Oldman'],
      '4-23': ['William Shakespeare', 'Max Planck'],
      '5-4': ['Audrey Hepburn', 'Thomas Hitzlsperger'],
      '6-21': ['Prinz William', 'Lana Del Rey'],
      '7-4': ['Eva Green', 'Thomas Jefferson (US)'],
      '8-4': ['Barack Obama', 'Meghan Markle'],
      '8-28': ['Johann Wolfgang von Goethe', 'Shania Twain'],
      '9-22': ['Michael Faraday', 'Andrea Bocelli'],
      '10-9': ['John Lennon', 'Guillermo del Toro'],
      '10-31': ['Martin Luther', 'Peter Jackson'],
      '11-10': ['Martin Luther (Geburtstag)', 'Neil Gaiman'],
      '12-25': ['Isaac Newton', 'Helena Christensen'],
    };
    
    return personen[`${monat}-${tag}`] || [];
  };

  const getGeburtsstein = (monat: number): { name: string; symbol: string; bedeutung: string } => {
    const steine: Record<number, { name: string; symbol: string; bedeutung: string }> = {
      1: { name: 'Granat', symbol: '🔴', bedeutung: 'Schutz & Stärke' },
      2: { name: 'Amethyst', symbol: '💜', bedeutung: 'Weisheit & Ruhe' },
      3: { name: 'Aquamarin', symbol: '💎', bedeutung: 'Mut & Klarheit' },
      4: { name: 'Diamant', symbol: '💍', bedeutung: 'Ewige Liebe' },
      5: { name: 'Smaragd', symbol: '💚', bedeutung: 'Hoffnung & Wachstum' },
      6: { name: 'Perle', symbol: '🤍', bedeutung: 'Reinheit & Treue' },
      7: { name: 'Rubin', symbol: '❤️', bedeutung: 'Leidenschaft & Energie' },
      8: { name: 'Peridot', symbol: '💛', bedeutung: 'Glück & Wohlstand' },
      9: { name: 'Saphir', symbol: '💙', bedeutung: 'Wahrheit & Weisheit' },
      10: { name: 'Opal', symbol: '🌈', bedeutung: 'Kreativität & Inspiration' },
      11: { name: 'Topas', symbol: '🧡', bedeutung: 'Freundschaft & Kraft' },
      12: { name: 'Türkis', symbol: '🩵', bedeutung: 'Schutz & Heilung' },
    };
    return steine[monat];
  };

  const getGeburtsblume = (monat: number): { name: string; symbol: string; bedeutung: string } => {
    const blumen: Record<number, { name: string; symbol: string; bedeutung: string }> = {
      1: { name: 'Nelke', symbol: '🌸', bedeutung: 'Liebe & Faszination' },
      2: { name: 'Veilchen', symbol: '💜', bedeutung: 'Bescheidenheit & Treue' },
      3: { name: 'Narzisse', symbol: '🌼', bedeutung: 'Neubeginn & Hoffnung' },
      4: { name: 'Gänseblümchen', symbol: '🌼', bedeutung: 'Unschuld & Reinheit' },
      5: { name: 'Maiglöckchen', symbol: '🤍', bedeutung: 'Süße & Demut' },
      6: { name: 'Rose', symbol: '🌹', bedeutung: 'Liebe & Leidenschaft' },
      7: { name: 'Rittersporn', symbol: '💙', bedeutung: 'Würde & Anmut' },
      8: { name: 'Gladiole', symbol: '🌺', bedeutung: 'Stärke & Integrität' },
      9: { name: 'Aster', symbol: '💜', bedeutung: 'Weisheit & Tapferkeit' },
      10: { name: 'Ringelblume', symbol: '🧡', bedeutung: 'Wärme & Kreativität' },
      11: { name: 'Chrysantheme', symbol: '🌸', bedeutung: 'Freude & Optimismus' },
      12: { name: 'Weihnachtsstern', symbol: '❤️', bedeutung: 'Gute Wünsche & Erfolg' },
    };
    return blumen[monat];
  };

  const getJahreszeit = (monat: number): { name: string; symbol: string } => {
    if (monat >= 3 && monat <= 5) return { name: 'Frühling', symbol: '🌷' };
    if (monat >= 6 && monat <= 8) return { name: 'Sommer', symbol: '☀️' };
    if (monat >= 9 && monat <= 11) return { name: 'Herbst', symbol: '🍂' };
    return { name: 'Winter', symbol: '❄️' };
  };

  const berechneNaechsteSchnapszahl = (alter: number): number | null => {
    const schnapszahlen = [11, 22, 33, 44, 55, 66, 77, 88, 99];
    for (const sz of schnapszahlen) {
      if (sz > alter) return sz;
    }
    return null;
  };

  const berechneBesondereGeburtstage = (geburt: Date, alter: number): Array<{ alter: number; datum: Date; beschreibung: string }> => {
    const besondere = [];
    const meilensteine = [
      { alter: 18, beschreibung: 'Volljährigkeit' },
      { alter: 21, beschreibung: 'Volle Mündigkeit (US-Tradition)' },
      { alter: 30, beschreibung: '30. Geburtstag – neues Jahrzehnt' },
      { alter: 40, beschreibung: '40. Geburtstag – Lebensmitte' },
      { alter: 50, beschreibung: '50. Geburtstag – Goldenes Jubiläum' },
      { alter: 60, beschreibung: '60. Geburtstag – Diamantenes Alter' },
      { alter: 65, beschreibung: 'Rentenalter' },
      { alter: 70, beschreibung: '70. Geburtstag' },
      { alter: 80, beschreibung: '80. Geburtstag' },
      { alter: 90, beschreibung: '90. Geburtstag' },
      { alter: 100, beschreibung: 'Jahrhundertgeburtstag!' },
    ];

    for (const m of meilensteine) {
      if (m.alter > alter && m.alter <= alter + 50) {
        const datum = new Date(geburt);
        datum.setFullYear(geburt.getFullYear() + m.alter);
        besondere.push({ alter: m.alter, datum, beschreibung: m.beschreibung });
      }
    }
    return besondere.slice(0, 5);
  };

  const berechneAlleGeburtstage = (geburt: Date, alter: number): Record<string, number> => {
    const wochentage: Record<string, number> = {
      'Montag': 0,
      'Dienstag': 0,
      'Mittwoch': 0,
      'Donnerstag': 0,
      'Freitag': 0,
      'Samstag': 0,
      'Sonntag': 0,
    };
    
    const tage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    
    for (let i = 0; i <= alter; i++) {
      const datum = new Date(geburt.getFullYear() + i, geburt.getMonth(), geburt.getDate());
      const tag = tage[datum.getDay()];
      wochentage[tag]++;
    }
    
    return wochentage;
  };

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

  // Meistgefeieter Wochentag
  const getMeisterWochentag = () => {
    if (!ergebnis) return null;
    const wt = ergebnis.geburtstagsWochentage;
    let max = 0;
    let meister = '';
    for (const [tag, count] of Object.entries(wt)) {
      if (count > max) {
        max = count;
        meister = tag;
      }
    }
    return { tag: meister, count: max };
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">🎉</span>
          Geburtsdatum eingeben
        </h2>

        <div className="space-y-6">
          {/* Geburtsdatum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dein Geburtsdatum
            </label>
            <input
              type="date"
              value={geburtsdatum}
              onChange={(e) => {
                setGeburtsdatum(e.target.value);
                setBerechnet(false);
              }}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-lg"
            />
          </div>

          <button
            onClick={handleBerechnen}
            disabled={!geburtsdatum}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            🎂 Geburtstag analysieren
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
                Heute ist dein Geburtstag! Du wirst {ergebnis.alter} Jahre alt!
              </p>
            </div>
          )}

          {/* Hauptergebnis: Wochentag der Geburt */}
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 opacity-90">Du wurdest geboren an einem...</h3>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">{ergebnis.geburtsWochentag}</div>
              <p className="text-lg opacity-90">
                {formatDatum(ergebnis.geburtsdatum)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-3xl font-bold">{ergebnis.alter}</div>
                <div className="text-sm opacity-80">Jahre alt</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-3xl font-bold">{ergebnis.geburtstageGefeiert}</div>
                <div className="text-sm opacity-80">Geburtstage gefeiert</div>
              </div>
            </div>
          </div>

          {/* Sternzeichen & Chinesisches Zeichen */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>✨</span>
              Deine Tierkreiszeichen
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Westliches Sternzeichen */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{ergebnis.sternzeichen.symbol}</span>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{ergebnis.sternzeichen.name}</div>
                    <div className="text-sm text-gray-500">Sternzeichen</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">{ergebnis.sternzeichen.datum}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">Element:</span>
                  <span className="px-2 py-1 bg-white rounded-full text-sm">{ergebnis.sternzeichen.element}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ergebnis.sternzeichen.eigenschaften.map((e, i) => (
                    <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chinesisches Zeichen */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{ergebnis.chinesischesZeichen.symbol}</span>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{ergebnis.chinesischesZeichen.name}</div>
                    <div className="text-sm text-gray-500">Chinesisches Tierzeichen</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">Element:</span>
                  <span className="px-2 py-1 bg-white rounded-full text-sm">
                    {ergebnis.chinesischesZeichen.elementSymbol} {ergebnis.chinesischesZeichen.element}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ergebnis.chinesischesZeichen.eigenschaften.map((e, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Nächster Geburtstag */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎈</span>
              Dein nächster Geburtstag
            </h3>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-bold text-pink-600">
                  {ergebnis.tageBisGeburtstag === 0 ? 'Heute!' : `${ergebnis.tageBisGeburtstag} Tage`}
                </div>
                <p className="text-gray-600 mt-1">
                  {ergebnis.naechsterGeburtstagWochentag}, {ergebnis.naechsterGeburtstag.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Du wirst <span className="font-bold text-pink-600">{ergebnis.wirdAlter}</span> Jahre alt
                </p>
              </div>
              <div className="text-6xl">
                {ergebnis.tageBisGeburtstag === 0 ? '🎂' : ergebnis.tageBisGeburtstag <= 7 ? '🎉' : ergebnis.tageBisGeburtstag <= 30 ? '🎈' : '📅'}
              </div>
            </div>

            {/* Countdown-Bar */}
            {ergebnis.tageBisGeburtstag > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Noch {ergebnis.tageBisGeburtstag} Tage</span>
                  <span>{Math.round((365 - ergebnis.tageBisGeburtstag) / 365 * 100)}% des Jahres vergangen</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((365 - ergebnis.tageBisGeburtstag) / 365 * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fun Facts */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎯</span>
              Geburtstags-Fun-Facts
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Geburtsstein */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{ergebnis.geburtsstein.symbol}</span>
                  <span className="font-bold text-gray-800">{ergebnis.geburtsstein.name}</span>
                </div>
                <div className="text-xs text-gray-500">Geburtsstein</div>
                <div className="text-sm text-gray-600 mt-1">{ergebnis.geburtsstein.bedeutung}</div>
              </div>

              {/* Geburtsblume */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{ergebnis.geburtsblume.symbol}</span>
                  <span className="font-bold text-gray-800">{ergebnis.geburtsblume.name}</span>
                </div>
                <div className="text-xs text-gray-500">Geburtsblume</div>
                <div className="text-sm text-gray-600 mt-1">{ergebnis.geburtsblume.bedeutung}</div>
              </div>
            </div>

            {/* Jahreszeit */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{ergebnis.jahreszeit.symbol}</span>
                <div>
                  <div className="font-bold text-gray-800">Geboren im {ergebnis.jahreszeit.name}</div>
                  <div className="text-sm text-gray-500">Deine Geburts-Jahreszeit</div>
                </div>
              </div>
            </div>

            {/* Wochentag-Statistik */}
            {getMeisterWochentag() && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  <div>
                    <div className="font-bold text-gray-800">
                      Meist gefeierter Wochentag: {getMeisterWochentag()?.tag}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getMeisterWochentag()?.count}x an einem {getMeisterWochentag()?.tag} Geburtstag gefeiert
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nächste Schnapszahl */}
            {ergebnis.naechsteSchnapszahl && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎰</span>
                  <div>
                    <div className="font-bold text-gray-800">
                      Nächster Schnapszahl-Geburtstag: {ergebnis.naechsteSchnapszahl}
                    </div>
                    <div className="text-sm text-gray-500">
                      In {ergebnis.naechsteSchnapszahl - ergebnis.alter} Jahren
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Berühmte Personen */}
          {ergebnis.beruehmtePersonen.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>⭐</span>
                Berühmte Geburtstagszwillinge
              </h3>
              <div className="space-y-2">
                {ergebnis.beruehmtePersonen.map((person, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="text-xl">🎂</span>
                    <span className="text-gray-800">{person}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Besondere Geburtstage */}
          {ergebnis.besondereGeburtstage.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🌟</span>
                Kommende Meilenstein-Geburtstage
              </h3>
              <div className="space-y-3">
                {ergebnis.besondereGeburtstage.map((bg, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎂</span>
                      <div>
                        <div className="font-bold text-gray-800">{bg.alter}. Geburtstag</div>
                        <div className="text-sm text-gray-500">{bg.beschreibung}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-pink-600">
                        {bg.datum.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500">
                        in {bg.alter - ergebnis.alter} Jahren
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wochentag-Verteilung */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📈</span>
              Deine Geburtstags-Wochentage
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              An welchen Wochentagen hattest du bisher Geburtstag?
            </p>
            <div className="space-y-2">
              {Object.entries(ergebnis.geburtstagsWochentage).map(([tag, count]) => {
                const maxCount = Math.max(...Object.values(ergebnis.geburtstagsWochentage));
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={tag} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-600">{tag}</div>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-8 text-sm font-bold text-gray-700">{count}×</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hinweis */}
          <div className="bg-pink-50 rounded-xl p-4 text-sm text-pink-800">
            <div className="flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <div>
                <strong>Hinweis:</strong> Die Sternzeichen und chinesischen Tierkreiszeichen dienen 
                der Unterhaltung. Die Eigenschaften basieren auf traditionellen Zuschreibungen.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Info Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Was verrät dein Geburtsdatum?
        </h2>
        <div className="prose prose-sm text-gray-600 space-y-4">
          <p>
            Unser <strong>Geburtstags-Rechner</strong> analysiert dein Geburtsdatum und verrät dir 
            spannende Fakten über deinen Geburtstag: An welchem <strong>Wochentag</strong> du geboren 
            wurdest, dein <strong>Sternzeichen</strong>, dein <strong>chinesisches Tierkreiszeichen</strong> 
            und vieles mehr!
          </p>
          
          <h3 className="text-lg font-semibold text-gray-800 mt-4">Was wird berechnet?</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Wochentag der Geburt:</strong> Montag, Dienstag, Mittwoch...?</li>
            <li><strong>Sternzeichen:</strong> Widder bis Fische mit Element & Eigenschaften</li>
            <li><strong>Chinesisches Tierkreiszeichen:</strong> Das Jahr des Drachen, der Ratte usw.</li>
            <li><strong>Nächster Geburtstag:</strong> Countdown in Tagen</li>
            <li><strong>Geburtstage gelebt:</strong> Wie oft hast du schon gefeiert?</li>
            <li><strong>Geburtsstein & Geburtsblume:</strong> Traditionelle Symbole deines Geburtsmonats</li>
            <li><strong>Berühmte Geburtstagszwillinge:</strong> Wer hat am gleichen Tag Geburtstag?</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 mt-4">Wochentag der Geburt</h3>
          <p>
            Der Wochentag deiner Geburt hat in vielen Kulturen eine besondere Bedeutung. 
            Ein altes englisches Kinderlied schreibt jedem Wochentag bestimmte Eigenschaften zu:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Montag:</strong> „Monday's child is fair of face" – schönes Gesicht</li>
            <li><strong>Dienstag:</strong> „Tuesday's child is full of grace" – voller Anmut</li>
            <li><strong>Mittwoch:</strong> „Wednesday's child is full of woe" – voller Sorgen</li>
            <li><strong>Donnerstag:</strong> „Thursday's child has far to go" – weite Reisen</li>
            <li><strong>Freitag:</strong> „Friday's child is loving and giving" – liebevoll</li>
            <li><strong>Samstag:</strong> „Saturday's child works hard for a living" – fleißig</li>
            <li><strong>Sonntag:</strong> „Sunday's child is bonny and blithe" – fröhlich</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 mt-4">Chinesisches Horoskop</h3>
          <p>
            Das chinesische Tierkreiszeichen basiert auf einem 12-Jahres-Zyklus. Jedes Jahr wird 
            einem von 12 Tieren zugeordnet: Ratte, Büffel, Tiger, Hase, Drache, Schlange, Pferd, 
            Ziege, Affe, Hahn, Hund und Schwein. Zusätzlich gibt es fünf Elemente (Holz, Feuer, 
            Erde, Metall, Wasser), die einen 60-Jahres-Zyklus bilden.
          </p>
        </div>
      </div>
    </div>
  );
}
