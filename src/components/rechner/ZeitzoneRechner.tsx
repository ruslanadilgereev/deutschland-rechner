import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

interface Zeitzone {
  id: string;
  name: string;
  kurzname: string;
  offset: number; // Offset zu UTC in Minuten
  sommerzeit: boolean;
  region: string;
  emoji: string;
}

const ZEITZONEN: Zeitzone[] = [
  // Europa
  { id: 'CET', name: 'Mitteleuropäische Zeit', kurzname: 'MEZ', offset: 60, sommerzeit: true, region: 'Europa', emoji: '🇩🇪' },
  { id: 'WET', name: 'Westeuropäische Zeit', kurzname: 'WEZ', offset: 0, sommerzeit: true, region: 'Europa', emoji: '🇵🇹' },
  { id: 'EET', name: 'Osteuropäische Zeit', kurzname: 'OEZ', offset: 120, sommerzeit: true, region: 'Europa', emoji: '🇬🇷' },
  { id: 'GMT', name: 'Greenwich Mean Time', kurzname: 'GMT', offset: 0, sommerzeit: false, region: 'Europa', emoji: '🇬🇧' },
  { id: 'BST', name: 'British Summer Time', kurzname: 'BST', offset: 60, sommerzeit: false, region: 'Europa', emoji: '🇬🇧' },
  { id: 'MSK', name: 'Moskauer Zeit', kurzname: 'MSK', offset: 180, sommerzeit: false, region: 'Europa', emoji: '🇷🇺' },
  
  // Amerika
  { id: 'EST', name: 'Eastern Standard Time', kurzname: 'EST', offset: -300, sommerzeit: true, region: 'Amerika', emoji: '🇺🇸' },
  { id: 'CST', name: 'Central Standard Time', kurzname: 'CST', offset: -360, sommerzeit: true, region: 'Amerika', emoji: '🇺🇸' },
  { id: 'MST', name: 'Mountain Standard Time', kurzname: 'MST', offset: -420, sommerzeit: true, region: 'Amerika', emoji: '🇺🇸' },
  { id: 'PST', name: 'Pacific Standard Time', kurzname: 'PST', offset: -480, sommerzeit: true, region: 'Amerika', emoji: '🇺🇸' },
  { id: 'AKST', name: 'Alaska Standard Time', kurzname: 'AKST', offset: -540, sommerzeit: true, region: 'Amerika', emoji: '🇺🇸' },
  { id: 'HST', name: 'Hawaii Standard Time', kurzname: 'HST', offset: -600, sommerzeit: false, region: 'Amerika', emoji: '🇺🇸' },
  { id: 'BRT', name: 'Brasília-Zeit', kurzname: 'BRT', offset: -180, sommerzeit: false, region: 'Amerika', emoji: '🇧🇷' },
  { id: 'ART', name: 'Argentinische Zeit', kurzname: 'ART', offset: -180, sommerzeit: false, region: 'Amerika', emoji: '🇦🇷' },
  
  // Asien
  { id: 'JST', name: 'Japan Standard Time', kurzname: 'JST', offset: 540, sommerzeit: false, region: 'Asien', emoji: '🇯🇵' },
  { id: 'CST_CHINA', name: 'China Standard Time', kurzname: 'CST', offset: 480, sommerzeit: false, region: 'Asien', emoji: '🇨🇳' },
  { id: 'KST', name: 'Korea Standard Time', kurzname: 'KST', offset: 540, sommerzeit: false, region: 'Asien', emoji: '🇰🇷' },
  { id: 'IST', name: 'India Standard Time', kurzname: 'IST', offset: 330, sommerzeit: false, region: 'Asien', emoji: '🇮🇳' },
  { id: 'ICT', name: 'Indochina Zeit', kurzname: 'ICT', offset: 420, sommerzeit: false, region: 'Asien', emoji: '🇹🇭' },
  { id: 'SGT', name: 'Singapore Time', kurzname: 'SGT', offset: 480, sommerzeit: false, region: 'Asien', emoji: '🇸🇬' },
  { id: 'HKT', name: 'Hong Kong Time', kurzname: 'HKT', offset: 480, sommerzeit: false, region: 'Asien', emoji: '🇭🇰' },
  { id: 'GST', name: 'Gulf Standard Time', kurzname: 'GST', offset: 240, sommerzeit: false, region: 'Asien', emoji: '🇦🇪' },
  { id: 'TRT', name: 'Türkei-Zeit', kurzname: 'TRT', offset: 180, sommerzeit: false, region: 'Asien', emoji: '🇹🇷' },
  
  // Ozeanien
  { id: 'AEST', name: 'Australian Eastern Standard Time', kurzname: 'AEST', offset: 600, sommerzeit: true, region: 'Ozeanien', emoji: '🇦🇺' },
  { id: 'ACST', name: 'Australian Central Standard Time', kurzname: 'ACST', offset: 570, sommerzeit: true, region: 'Ozeanien', emoji: '🇦🇺' },
  { id: 'AWST', name: 'Australian Western Standard Time', kurzname: 'AWST', offset: 480, sommerzeit: false, region: 'Ozeanien', emoji: '🇦🇺' },
  { id: 'NZST', name: 'New Zealand Standard Time', kurzname: 'NZST', offset: 720, sommerzeit: true, region: 'Ozeanien', emoji: '🇳🇿' },
  
  // Afrika
  { id: 'CAT', name: 'Central Africa Time', kurzname: 'CAT', offset: 120, sommerzeit: false, region: 'Afrika', emoji: '🌍' },
  { id: 'EAT', name: 'East Africa Time', kurzname: 'EAT', offset: 180, sommerzeit: false, region: 'Afrika', emoji: '🌍' },
  { id: 'WAT', name: 'West Africa Time', kurzname: 'WAT', offset: 60, sommerzeit: false, region: 'Afrika', emoji: '🌍' },
  { id: 'SAST', name: 'South Africa Standard Time', kurzname: 'SAST', offset: 120, sommerzeit: false, region: 'Afrika', emoji: '🇿🇦' },
  
  // UTC
  { id: 'UTC', name: 'Coordinated Universal Time', kurzname: 'UTC', offset: 0, sommerzeit: false, region: 'Global', emoji: '🌐' },
];

const REGIONEN = ['Europa', 'Amerika', 'Asien', 'Ozeanien', 'Afrika', 'Global'];

// Prüfen ob aktuell Sommerzeit gilt (vereinfachte Prüfung für mitteleuropäische Regeln)
const istSommerzeit = (datum: Date): boolean => {
  const monat = datum.getMonth(); // 0-11
  const tag = datum.getDate();
  const wochentag = datum.getDay(); // 0 = Sonntag
  
  // Sommerzeit: letzter Sonntag im März bis letzter Sonntag im Oktober
  if (monat < 2 || monat > 9) return false; // Nov-Feb: keine Sommerzeit
  if (monat > 2 && monat < 9) return true; // Apr-Sep: immer Sommerzeit
  
  // März: prüfe ob nach letztem Sonntag
  if (monat === 2) {
    const letzterSonntag = 31 - ((new Date(datum.getFullYear(), 2, 31).getDay() + 7) % 7);
    return tag > letzterSonntag || (tag === letzterSonntag && datum.getHours() >= 2);
  }
  
  // Oktober: prüfe ob vor letztem Sonntag
  if (monat === 9) {
    const letzterSonntag = 31 - ((new Date(datum.getFullYear(), 9, 31).getDay() + 7) % 7);
    return tag < letzterSonntag || (tag === letzterSonntag && datum.getHours() < 3);
  }
  
  return false;
};

const formatOffset = (offset: number): string => {
  const vorzeichen = offset >= 0 ? '+' : '-';
  const stunden = Math.floor(Math.abs(offset) / 60);
  const minuten = Math.abs(offset) % 60;
  return `UTC${vorzeichen}${stunden}${minuten > 0 ? `:${minuten.toString().padStart(2, '0')}` : ''}`;
};

const formatZeit = (stunden: number, minuten: number): string => {
  // Normalisiere negative oder überlaufende Werte
  let h = stunden;
  let m = minuten;
  
  while (m < 0) {
    m += 60;
    h -= 1;
  }
  while (m >= 60) {
    m -= 60;
    h += 1;
  }
  while (h < 0) {
    h += 24;
  }
  while (h >= 24) {
    h -= 24;
  }
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export default function ZeitzoneRechner() {
  const [stunden, setStunden] = useState<number>(12);
  const [minuten, setMinuten] = useState<number>(0);
  const [ausgangszone, setAusgangszone] = useState<string>('CET');
  const [zielzone, setZielzone] = useState<string>('EST');
  const [sommerzeitAktiv, setSommerzeitAktiv] = useState<boolean>(istSommerzeit(new Date()));
  
  // Aktuelle Uhrzeit laden
  const aktuelleZeitLaden = () => {
    const jetzt = new Date();
    setStunden(jetzt.getHours());
    setMinuten(jetzt.getMinutes());
    setSommerzeitAktiv(istSommerzeit(jetzt));
  };
  
  const ausgangsZeitzone = ZEITZONEN.find(z => z.id === ausgangszone)!;
  const zielZeitzone = ZEITZONEN.find(z => z.id === zielzone)!;
  
  // Berechnung
  const ergebnis = useMemo(() => {
    // Berechne effektiven Offset mit Sommerzeit
    let ausgangsOffset = ausgangsZeitzone.offset;
    let zielOffset = zielZeitzone.offset;
    
    if (sommerzeitAktiv) {
      if (ausgangsZeitzone.sommerzeit) ausgangsOffset += 60;
      if (zielZeitzone.sommerzeit) zielOffset += 60;
    }
    
    // Berechne Zeitdifferenz in Minuten
    const differenzMinuten = zielOffset - ausgangsOffset;
    
    // Konvertiere Ausgangszeit zu Zielzeit
    const ausgangsMinutenGesamt = stunden * 60 + minuten;
    const zielMinutenGesamt = ausgangsMinutenGesamt + differenzMinuten;
    
    // Berechne Tagesverschiebung
    let tagesverschiebung = 0;
    let normalisiertMinuten = zielMinutenGesamt;
    
    while (normalisiertMinuten < 0) {
      normalisiertMinuten += 24 * 60;
      tagesverschiebung -= 1;
    }
    while (normalisiertMinuten >= 24 * 60) {
      normalisiertMinuten -= 24 * 60;
      tagesverschiebung += 1;
    }
    
    const zielStunden = Math.floor(normalisiertMinuten / 60);
    const zielMinuten = normalisiertMinuten % 60;
    
    // Differenz formatieren
    const diffStunden = Math.floor(Math.abs(differenzMinuten) / 60);
    const diffMin = Math.abs(differenzMinuten) % 60;
    const diffVorzeichen = differenzMinuten >= 0 ? '+' : '-';
    
    return {
      zielStunden,
      zielMinuten,
      tagesverschiebung,
      differenzMinuten,
      differenzFormatiert: `${diffVorzeichen}${diffStunden}${diffMin > 0 ? `:${diffMin.toString().padStart(2, '0')}` : ''} Std`,
      ausgangsOffset,
      zielOffset,
    };
  }, [stunden, minuten, ausgangszone, zielzone, sommerzeitAktiv, ausgangsZeitzone, zielZeitzone]);
  
  // Beliebte Zeitzonen-Paare
  const beliebtePaare = [
    { von: 'CET', nach: 'EST', label: 'Berlin → New York' },
    { von: 'CET', nach: 'PST', label: 'Berlin → Los Angeles' },
    { von: 'CET', nach: 'JST', label: 'Berlin → Tokio' },
    { von: 'CET', nach: 'GMT', label: 'Berlin → London' },
    { von: 'CET', nach: 'CST_CHINA', label: 'Berlin → Peking' },
    { von: 'CET', nach: 'IST', label: 'Berlin → Mumbai' },
  ];
  
  // Weltzeituhr: Alle Zeitzonen zur aktuellen Zeit
  const weltzeituhr = useMemo(() => {
    let ausgangsOffset = ausgangsZeitzone.offset;
    if (sommerzeitAktiv && ausgangsZeitzone.sommerzeit) ausgangsOffset += 60;
    
    return ZEITZONEN.filter(z => z.id !== ausgangszone).slice(0, 8).map(zone => {
      let zielOffset = zone.offset;
      if (sommerzeitAktiv && zone.sommerzeit) zielOffset += 60;
      
      const differenzMinuten = zielOffset - ausgangsOffset;
      const zielMinutenGesamt = (stunden * 60 + minuten + differenzMinuten + 24 * 60) % (24 * 60);
      const zielStunden = Math.floor(zielMinutenGesamt / 60);
      const zielMinuten = zielMinutenGesamt % 60;
      
      return {
        ...zone,
        zeit: formatZeit(zielStunden, zielMinuten),
        istTag: zielStunden >= 6 && zielStunden < 20,
      };
    });
  }, [stunden, minuten, ausgangszone, sommerzeitAktiv, ausgangsZeitzone]);

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Zeitzonen-Rechner" rechnerSlug="zeitzone-rechner" />

{/* Schnellauswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚡ Schnellauswahl</h3>
        <div className="flex flex-wrap gap-2">
          {beliebtePaare.map((paar) => (
            <button
              key={`${paar.von}-${paar.nach}`}
              onClick={() => {
                setAusgangszone(paar.von);
                setZielzone(paar.nach);
              }}
              className={`px-3 py-2 text-sm rounded-lg transition-all ${
                ausgangszone === paar.von && zielzone === paar.nach
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {paar.label}
            </button>
          ))}
        </div>
      </div>

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📝 Zeit eingeben</h3>
        
        {/* Uhrzeit */}
        <div className="mb-6">
          <label className="text-sm text-gray-600 block mb-2">Uhrzeit</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="number"
                min="0"
                max="23"
                value={stunden}
                onChange={(e) => setStunden(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-20 px-4 py-3 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
              <span className="text-3xl font-bold text-gray-400">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={minuten}
                onChange={(e) => setMinuten(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-20 px-4 py-3 text-xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={aktuelleZeitLaden}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-all flex items-center gap-2"
            >
              <span>🕐</span>
              <span className="text-sm">Jetzt</span>
            </button>
          </div>
        </div>
        
        {/* Ausgangszone */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 block mb-2">
            🟢 Ausgangs-Zeitzone
          </label>
          <select
            value={ausgangszone}
            onChange={(e) => setAusgangszone(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
          >
            {REGIONEN.map(region => (
              <optgroup key={region} label={region}>
                {ZEITZONEN.filter(z => z.region === region).map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.emoji} {zone.kurzname} – {zone.name} ({formatOffset(zone.offset)})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        
        {/* Tausch-Button */}
        <div className="flex justify-center my-2">
          <button
            onClick={() => {
              const temp = ausgangszone;
              setAusgangszone(zielzone);
              setZielzone(temp);
            }}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
            title="Zeitzonen tauschen"
          >
            <span className="text-xl">⇅</span>
          </button>
        </div>
        
        {/* Zielzone */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 block mb-2">
            🔴 Ziel-Zeitzone
          </label>
          <select
            value={zielzone}
            onChange={(e) => setZielzone(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
          >
            {REGIONEN.map(region => (
              <optgroup key={region} label={region}>
                {ZEITZONEN.filter(z => z.region === region).map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.emoji} {zone.kurzname} – {zone.name} ({formatOffset(zone.offset)})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        
        {/* Sommerzeit Toggle */}
        <label className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={sommerzeitAktiv}
            onChange={(e) => setSommerzeitAktiv(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
          />
          <div>
            <span className="font-medium text-gray-700">☀️ Sommerzeit berücksichtigen</span>
            <p className="text-xs text-gray-500">
              {sommerzeitAktiv 
                ? 'Sommerzeit ist aktiv (+1 Stunde für betroffene Zeitzonen)'
                : 'Winterzeit/Normalzeit ist aktiv'}
            </p>
          </div>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Ausgangszeit */}
          <div className="text-center">
            <div className="text-blue-200 text-sm mb-1">{ausgangsZeitzone.emoji} {ausgangsZeitzone.kurzname}</div>
            <div className="text-3xl font-bold">
              {formatZeit(stunden, minuten)}
            </div>
            <div className="text-blue-200 text-xs mt-1">
              {formatOffset(ergebnis.ausgangsOffset)}
            </div>
          </div>
          
          {/* Pfeil & Differenz */}
          <div className="text-center">
            <div className="text-4xl mb-1">→</div>
            <div className="text-sm bg-white/20 rounded-lg px-3 py-1 inline-block">
              {ergebnis.differenzFormatiert}
            </div>
          </div>
          
          {/* Zielzeit */}
          <div className="text-center">
            <div className="text-blue-200 text-sm mb-1">{zielZeitzone.emoji} {zielZeitzone.kurzname}</div>
            <div className="text-3xl font-bold">
              {formatZeit(ergebnis.zielStunden, ergebnis.zielMinuten)}
            </div>
            <div className="text-blue-200 text-xs mt-1">
              {formatOffset(ergebnis.zielOffset)}
              {ergebnis.tagesverschiebung !== 0 && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded">
                  {ergebnis.tagesverschiebung > 0 ? '+' : ''}{ergebnis.tagesverschiebung} Tag{Math.abs(ergebnis.tagesverschiebung) !== 1 ? 'e' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Detail-Info */}
        <div className="mt-6 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-200">Ausgangszone:</span>
              <p className="font-medium">{ausgangsZeitzone.name}</p>
            </div>
            <div>
              <span className="text-blue-200">Zielzone:</span>
              <p className="font-medium">{zielZeitzone.name}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 text-center">
            <span className="text-blue-200">Wenn es in </span>
            <span className="font-medium">{ausgangsZeitzone.kurzname}</span>
            <span className="text-blue-200"> </span>
            <span className="font-bold">{formatZeit(stunden, minuten)} Uhr</span>
            <span className="text-blue-200"> ist, ist es in </span>
            <span className="font-medium">{zielZeitzone.kurzname}</span>
            <span className="text-blue-200"> </span>
            <span className="font-bold">{formatZeit(ergebnis.zielStunden, ergebnis.zielMinuten)} Uhr</span>
            {ergebnis.tagesverschiebung !== 0 && (
              <span className="text-yellow-200">
                {' '}({ergebnis.tagesverschiebung > 0 ? 'nächster' : 'vorheriger'} Tag)
              </span>
            )}
          </div>
        </div>
      </div>
{/* Weltzeituhr */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🌍 Weltzeituhr</h3>
        <p className="text-sm text-gray-600 mb-4">
          Wenn es {formatZeit(stunden, minuten)} Uhr in {ausgangsZeitzone.kurzname} ist:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {weltzeituhr.map(zone => (
            <div
              key={zone.id}
              className={`p-3 rounded-xl text-center ${
                zone.istTag ? 'bg-yellow-50' : 'bg-indigo-50'
              }`}
            >
              <div className="text-2xl mb-1">{zone.istTag ? '☀️' : '🌙'}</div>
              <div className="text-lg font-bold text-gray-800">{zone.zeit}</div>
              <div className="text-xs text-gray-600">{zone.emoji} {zone.kurzname}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hinweis Sommerzeit */}
      <div className="bg-yellow-50 rounded-2xl p-6 mb-6 border-2 border-yellow-200">
        <h3 className="font-bold text-yellow-800 mb-2">☀️ Hinweis zur Sommer-/Winterzeit</h3>
        <div className="space-y-2 text-sm text-yellow-700">
          <p>
            <strong>Sommerzeit (MESZ/CEST):</strong> Letzter Sonntag im März bis letzter Sonntag im Oktober. 
            Uhren werden um 1 Stunde vorgestellt.
          </p>
          <p>
            <strong>Winterzeit (MEZ/CET):</strong> Letzter Sonntag im Oktober bis letzter Sonntag im März. 
            Dies ist die "Normalzeit".
          </p>
          <p className="mt-3 p-2 bg-yellow-100 rounded-lg">
            <strong>⚠️ Wichtig:</strong> Nicht alle Länder wechseln gleichzeitig oder überhaupt zur Sommerzeit. 
            Japan, China und viele andere Länder haben keine Sommerzeitumstellung. 
            Die USA wechseln zu anderen Terminen als Europa.
          </p>
        </div>
      </div>

      {/* Wichtige Zeitzonen Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Wichtige Zeitzonen im Überblick</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-2">Zone</th>
                <th className="text-left py-2 px-2">Name</th>
                <th className="text-center py-2 px-2">UTC-Offset</th>
                <th className="text-center py-2 px-2">Sommerzeit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ZEITZONEN.filter(z => ['CET', 'GMT', 'EST', 'PST', 'JST', 'CST_CHINA', 'IST', 'AEST', 'UTC'].includes(z.id)).map(zone => (
                <tr key={zone.id} className="hover:bg-gray-50">
                  <td className="py-2 px-2">
                    <span className="font-medium">{zone.emoji} {zone.kurzname}</span>
                  </td>
                  <td className="py-2 px-2 text-gray-600">{zone.name}</td>
                  <td className="py-2 px-2 text-center">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-mono">
                      {formatOffset(zone.offset)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    {zone.sommerzeit ? (
                      <span className="text-green-600">✓ Ja</span>
                    ) : (
                      <span className="text-gray-400">✗ Nein</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Praktische Tipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💡 Praktische Tipps</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-blue-800">Geschäftliche Anrufe</p>
              <p className="text-blue-700">
                Für Anrufe nach USA (Ostküste): Vormittags 14-18 Uhr MEZ ist dort 8-12 Uhr. 
                Westküste: 18-22 Uhr MEZ entspricht 9-13 Uhr PST.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🎮</span>
            <div>
              <p className="font-medium text-green-800">Gaming mit Freunden</p>
              <p className="text-green-700">
                Für Spielsessions mit Japan: 12 Uhr MEZ = 20 Uhr JST (gleicher Tag). 
                Für Australien: Abends spielen, dann ist es dort Morgen.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">✈️</span>
            <div>
              <p className="font-medium text-purple-800">Jetlag vermeiden</p>
              <p className="text-purple-700">
                Faustregel: 1 Tag Anpassung pro Stunde Zeitverschiebung. 
                Nach Osten fliegen = Jetlag stärker als nach Westen.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-medium text-orange-800">Internationale Meetings</p>
              <p className="text-orange-700">
                Für Teams über mehrere Zeitzonen: 15-17 Uhr MEZ ist oft ideal – 
                USA gerade wach, Asien noch nicht zu spät.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Merkregel */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧠 Einfache Merkregeln</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">🇺🇸 USA von Deutschland:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>New York:</strong> −6 Stunden</li>
              <li>• <strong>Chicago:</strong> −7 Stunden</li>
              <li>• <strong>Denver:</strong> −8 Stunden</li>
              <li>• <strong>Los Angeles:</strong> −9 Stunden</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">🌏 Asien von Deutschland:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Dubai:</strong> +3 Stunden</li>
              <li>• <strong>Mumbai:</strong> +4,5 Stunden</li>
              <li>• <strong>Bangkok:</strong> +6 Stunden</li>
              <li>• <strong>Tokio:</strong> +8 Stunden</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          * Angaben für Winterzeit (MEZ). Bei Sommerzeit (MESZ) ggf. 1 Stunde weniger Unterschied.
        </p>
      </div>

      {/* Datumsgrenze */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🗓️ Datumsgrenze verstehen</h3>
        <div className="p-4 bg-indigo-50 rounded-xl">
          <p className="text-sm text-indigo-700 mb-3">
            Die internationale Datumsgrenze verläuft ungefähr entlang des 180. Längengrades im Pazifik. 
            Überquert man sie von West nach Ost, springt das Datum einen Tag zurück. 
            Von Ost nach West springt es einen Tag vor.
          </p>
          <div className="flex items-center justify-center gap-4 text-center">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-500">Samoa</p>
              <p className="font-bold text-indigo-700">UTC+13</p>
            </div>
            <span className="text-2xl">🌏</span>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-500">Hawaii</p>
              <p className="font-bold text-indigo-700">UTC−10</p>
            </div>
          </div>
          <p className="text-xs text-indigo-600 mt-3 text-center">
            Zwischen diesen beiden Orten liegen 23 Stunden Unterschied!
          </p>
        </div>
      </div>
{/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & weiterführende Infos</h4>
        <div className="space-y-1">
          <a
            href="https://www.timeanddate.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            timeanddate.de – Zeitzonen-Datenbank
          </a>
          <a
            href="https://www.ptb.de/cms/ptb/fachabteilungen/abt4/fb-44/ag-441/gesetzliche-zeit.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            PTB – Physikalisch-Technische Bundesanstalt (gesetzliche Zeit)
          </a>
          <a
            href="https://www.iana.org/time-zones"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            IANA Time Zone Database
          </a>
        </div>
      </div>
    </div>
  );
}
