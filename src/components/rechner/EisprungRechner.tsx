import { useState, useMemo } from 'react';

interface FruchtbarkeitTag {
  datum: Date;
  typ: 'unfruchtbar' | 'fruchtbar' | 'hochfruchtbar' | 'eisprung' | 'periode';
  tag: number;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDatum(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDatumKurz(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDatumMitWochentag(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getDate() === d2.getDate() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getFullYear() === d2.getFullYear();
}

const WOCHENTAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export default function EisprungRechner() {
  const [letzteRegel, setLetzteRegel] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14); // Default: vor 2 Wochen
    return d.toISOString().split('T')[0];
  });
  const [zyklusLaenge, setZyklusLaenge] = useState(28);
  const [lutealPhase, setLutealPhase] = useState(14);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [kalenderMonat, setKalenderMonat] = useState(() => new Date());

  const ergebnis = useMemo(() => {
    const lmp = new Date(letzteRegel);
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    
    // Eisprung = Zykluslänge - Lutealphase (normalerweise 14 Tage)
    const eisprungTag = zyklusLaenge - lutealPhase;
    const eisprungDatum = addDays(lmp, eisprungTag);
    
    // Fruchtbares Fenster: 5 Tage vor Eisprung bis 1 Tag danach
    const fruchtbarStart = addDays(eisprungDatum, -5);
    const fruchtbarEnde = addDays(eisprungDatum, 1);
    
    // Hochfruchtbare Tage: 2 Tage vor bis Eisprung
    const hochfruchtbarStart = addDays(eisprungDatum, -2);
    const hochfruchtbarEnde = eisprungDatum;
    
    // Nächste Periode
    const naechstePeriode = addDays(lmp, zyklusLaenge);
    
    // Periode dauert ca. 5 Tage
    const periodeEnde = addDays(lmp, 5);
    
    // Berechne Zyklustag
    const heute2 = new Date();
    heute2.setHours(0, 0, 0, 0);
    const lmp2 = new Date(letzteRegel);
    lmp2.setHours(0, 0, 0, 0);
    const msSinceStart = heute2.getTime() - lmp2.getTime();
    const tageSeitStart = Math.floor(msSinceStart / (1000 * 60 * 60 * 24));
    const zyklusTag = tageSeitStart >= 0 ? (tageSeitStart % zyklusLaenge) + 1 : 1;
    
    // Tage bis Eisprung
    const tageBisEisprung = Math.ceil((eisprungDatum.getTime() - heute2.getTime()) / (1000 * 60 * 60 * 24));
    
    // Status ermitteln
    let status: 'periode' | 'unfruchtbar' | 'fruchtbar' | 'hochfruchtbar' | 'eisprung' | 'luteal';
    let statusText: string;
    let statusColor: string;
    
    if (zyklusTag <= 5) {
      status = 'periode';
      statusText = 'Periode';
      statusColor = 'bg-red-500';
    } else if (zyklusTag > eisprungTag) {
      status = 'luteal';
      statusText = 'Lutealphase (nach Eisprung)';
      statusColor = 'bg-gray-400';
    } else if (zyklusTag === eisprungTag) {
      status = 'eisprung';
      statusText = 'EISPRUNG HEUTE!';
      statusColor = 'bg-pink-600';
    } else if (zyklusTag >= eisprungTag - 2) {
      status = 'hochfruchtbar';
      statusText = 'Hochfruchtbar';
      statusColor = 'bg-green-500';
    } else if (zyklusTag >= eisprungTag - 5) {
      status = 'fruchtbar';
      statusText = 'Fruchtbar';
      statusColor = 'bg-green-400';
    } else {
      status = 'unfruchtbar';
      statusText = 'Geringere Fruchtbarkeit';
      statusColor = 'bg-gray-300';
    }
    
    // Chance auf Schwangerschaft
    let schwangerschaftsChance = 0;
    if (status === 'eisprung') schwangerschaftsChance = 25;
    else if (status === 'hochfruchtbar') schwangerschaftsChance = 20;
    else if (status === 'fruchtbar') schwangerschaftsChance = 10;
    else schwangerschaftsChance = 1;
    
    // Generiere Kalender für mehrere Zyklen
    const kalender: FruchtbarkeitTag[] = [];
    for (let zyklus = -1; zyklus <= 2; zyklus++) {
      const zyklusStart = addDays(lmp, zyklus * zyklusLaenge);
      const zyklusEisprung = addDays(zyklusStart, eisprungTag);
      
      for (let tag = 0; tag < zyklusLaenge; tag++) {
        const datum = addDays(zyklusStart, tag);
        let typ: FruchtbarkeitTag['typ'] = 'unfruchtbar';
        
        if (tag < 5) {
          typ = 'periode';
        } else if (tag === eisprungTag) {
          typ = 'eisprung';
        } else if (tag >= eisprungTag - 2 && tag < eisprungTag) {
          typ = 'hochfruchtbar';
        } else if (tag >= eisprungTag - 5 && tag <= eisprungTag + 1) {
          typ = 'fruchtbar';
        }
        
        kalender.push({ datum, typ, tag: tag + 1 });
      }
    }
    
    return {
      eisprungDatum,
      fruchtbarStart,
      fruchtbarEnde,
      hochfruchtbarStart,
      naechstePeriode,
      periodeEnde,
      zyklusTag,
      tageBisEisprung,
      status,
      statusText,
      statusColor,
      schwangerschaftsChance,
      kalender,
      eisprungTag,
    };
  }, [letzteRegel, zyklusLaenge, lutealPhase]);

  // Kalender-Rendering für einen Monat
  const renderKalender = () => {
    const ersterTag = new Date(kalenderMonat.getFullYear(), kalenderMonat.getMonth(), 1);
    const letzterTag = new Date(kalenderMonat.getFullYear(), kalenderMonat.getMonth() + 1, 0);
    const startWochentag = ersterTag.getDay();
    
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    
    const tage: (FruchtbarkeitTag | null)[] = [];
    
    // Leere Tage am Anfang
    for (let i = 0; i < startWochentag; i++) {
      tage.push(null);
    }
    
    // Tage des Monats
    for (let tag = 1; tag <= letzterTag.getDate(); tag++) {
      const datum = new Date(kalenderMonat.getFullYear(), kalenderMonat.getMonth(), tag);
      const kalenderTag = ergebnis.kalender.find(k => isSameDay(k.datum, datum));
      
      if (kalenderTag) {
        tage.push(kalenderTag);
      } else {
        tage.push({ datum, typ: 'unfruchtbar', tag: 0 });
      }
    }
    
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setKalenderMonat(new Date(kalenderMonat.getFullYear(), kalenderMonat.getMonth() - 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-bold text-gray-800">
            {MONATE[kalenderMonat.getMonth()]} {kalenderMonat.getFullYear()}
          </h3>
          <button
            onClick={() => setKalenderMonat(new Date(kalenderMonat.getFullYear(), kalenderMonat.getMonth() + 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Wochentage */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WOCHENTAGE.map(tag => (
            <div key={tag} className="text-center text-xs font-medium text-gray-500 py-1">
              {tag}
            </div>
          ))}
        </div>
        
        {/* Kalender-Tage */}
        <div className="grid grid-cols-7 gap-1">
          {tage.map((tag, idx) => {
            if (!tag) {
              return <div key={idx} className="aspect-square" />;
            }
            
            const istHeute = isSameDay(tag.datum, heute);
            
            let bgColor = 'bg-gray-50 text-gray-600';
            let border = '';
            
            switch (tag.typ) {
              case 'periode':
                bgColor = 'bg-red-100 text-red-700';
                break;
              case 'eisprung':
                bgColor = 'bg-pink-500 text-white font-bold';
                break;
              case 'hochfruchtbar':
                bgColor = 'bg-green-400 text-white';
                break;
              case 'fruchtbar':
                bgColor = 'bg-green-200 text-green-800';
                break;
            }
            
            if (istHeute) {
              border = 'ring-2 ring-blue-500 ring-offset-1';
            }
            
            return (
              <div
                key={idx}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm ${bgColor} ${border} transition-all`}
                title={`${formatDatumKurz(tag.datum)} - ${tag.typ}`}
              >
                <span>{tag.datum.getDate()}</span>
                {tag.typ === 'eisprung' && <span className="text-xs">🥚</span>}
              </div>
            );
          })}
        </div>
        
        {/* Legende */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
            <span>Periode</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-200 border border-green-300"></div>
            <span>Fruchtbar</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-400"></div>
            <span>Hochfruchtbar</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-pink-500"></div>
            <span>Eisprung</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-50 ring-2 ring-blue-500"></div>
            <span>Heute</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Letzte Regelblutung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Erster Tag der letzten Periode</span>
          </label>
          <input
            type="date"
            value={letzteRegel}
            onChange={(e) => setLetzteRegel(e.target.value)}
            className="w-full text-xl font-medium py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
          />
        </div>

        {/* Zykluslänge */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Durchschnittliche Zykluslänge</span>
            <span className="text-xs text-gray-500 ml-2">(21-35 Tage normal)</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="21"
              max="35"
              value={zyklusLaenge}
              onChange={(e) => setZyklusLaenge(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <span className="text-xl font-bold text-pink-600 w-24 text-center">
              {zyklusLaenge} Tage
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            <span>21</span>
            <span>28</span>
            <span>35</span>
          </div>
        </div>

        {/* Erweiterte Einstellungen */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1"
        >
          <span>{showAdvanced ? '▼' : '▶'}</span>
          Erweiterte Einstellungen
        </button>
        
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Lutealphase</span>
              <span className="text-xs text-gray-500 ml-2">(Phase nach Eisprung bis Periode)</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="16"
                value={lutealPhase}
                onChange={(e) => setLutealPhase(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <span className="text-xl font-bold text-pink-600 w-24 text-center">
                {lutealPhase} Tage
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Standard: 14 Tage. Die Lutealphase ist bei den meisten Frauen relativ konstant.
            </p>
          </div>
        )}
      </div>

      {/* Aktueller Status */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${ergebnis.statusColor.replace('bg-', 'bg-gradient-to-br from-')} to-pink-600`}>
        <div className="text-sm font-medium text-white/80 mb-1">Aktueller Status</div>
        <div className="text-3xl font-bold mb-4">{ergebnis.statusText}</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-white/80 text-sm">Zyklustag</div>
            <div className="text-3xl font-bold">{ergebnis.zyklusTag}</div>
            <div className="text-white/70 text-xs">von {zyklusLaenge}</div>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-white/80 text-sm">Chance auf Schwangerschaft</div>
            <div className="text-3xl font-bold">{ergebnis.schwangerschaftsChance}%</div>
            <div className="text-white/70 text-xs">pro Zyklus</div>
          </div>
        </div>
        
        {ergebnis.tageBisEisprung > 0 && ergebnis.tageBisEisprung <= 14 && (
          <div className="mt-4 text-center">
            <span className="text-white/80">Noch </span>
            <span className="text-3xl font-bold">{ergebnis.tageBisEisprung}</span>
            <span className="text-white/80"> {ergebnis.tageBisEisprung === 1 ? 'Tag' : 'Tage'} bis zum Eisprung</span>
          </div>
        )}
      </div>

      {/* Wichtige Termine */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📅 Dein Zyklus</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">🩸</span>
              <span className="text-gray-700">Letzte Periode</span>
            </div>
            <span className="font-medium">{formatDatumKurz(new Date(letzteRegel))}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">💚</span>
              <span className="text-gray-700">Fruchtbares Fenster</span>
            </div>
            <span className="font-medium text-green-700">
              {formatDatumKurz(ergebnis.fruchtbarStart)} - {formatDatumKurz(ergebnis.fruchtbarEnde)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-pink-100 rounded-xl border-2 border-pink-300">
            <div className="flex items-center gap-3">
              <span className="text-xl">🥚</span>
              <span className="text-pink-800 font-medium">Eisprung</span>
            </div>
            <span className="font-bold text-pink-700">{formatDatum(ergebnis.eisprungDatum)}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">📅</span>
              <span className="text-gray-700">Nächste Periode</span>
            </div>
            <span className="font-medium text-red-600">{formatDatum(ergebnis.naechstePeriode)}</span>
          </div>
        </div>
      </div>

      {/* Kalender */}
      {renderKalender()}

      {/* Fruchtbare Tage im Detail */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🌸 Fruchtbare Tage im Detail</h3>
        
        <div className="space-y-2">
          {Array.from({ length: 7 }, (_, i) => {
            const tag = addDays(ergebnis.fruchtbarStart, i);
            const istEisprung = i === 5; // 5 Tage nach fruchtbar Start
            const istHochfruchtbar = i >= 3 && i <= 5;
            
            let bgColor = 'bg-green-50';
            let label = 'Fruchtbar';
            let icon = '💚';
            let chance = '5-10%';
            
            if (istEisprung) {
              bgColor = 'bg-pink-100';
              label = 'EISPRUNG';
              icon = '🥚';
              chance = '25-30%';
            } else if (istHochfruchtbar) {
              bgColor = 'bg-green-100';
              label = 'Hochfruchtbar';
              icon = '💚💚';
              chance = '15-25%';
            }
            
            if (i === 6) {
              label = 'Eizelle stirbt ab';
              icon = '⚪';
              chance = '5%';
              bgColor = 'bg-gray-100';
            }
            
            return (
              <div key={i} className={`flex items-center justify-between p-3 ${bgColor} rounded-xl`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <span className="font-medium">{formatDatumMitWochentag(tag)}</span>
                    <span className="text-sm text-gray-600 ml-2">{label}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-600">~{chance}</span>
              </div>
            );
          })}
        </div>
        
        <p className="text-xs text-gray-500 mt-3 p-3 bg-yellow-50 rounded-xl">
          ⚠️ Die Wahrscheinlichkeiten sind Durchschnittswerte. Die tatsächliche Empfängniswahrscheinlichkeit 
          hängt von vielen Faktoren ab (Alter, Gesundheit, Spermienqualität etc.).
        </p>
      </div>

      {/* Tipps zur Familienplanung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💡 Tipps zur Familienplanung</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-2">🤰 Bei Kinderwunsch</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Regelmäßiger Sex während des fruchtbaren Fensters (alle 1-2 Tage)</li>
              <li>• Die besten Tage: 2 Tage vor bis zum Eisprung</li>
              <li>• Spermien überleben bis zu 5 Tage – früh starten lohnt sich!</li>
              <li>• Nach 12 Monaten ohne Erfolg: Gynäkologen aufsuchen</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">🛡️ Zur Verhütung (NFP)</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Kalender-Methode allein ist NICHT sicher zur Verhütung!</li>
              <li>• Für zuverlässige NFP: Kombination mit Temperaturmessung + Zervixschleim</li>
              <li>• Pearl-Index der Kalender-Methode: 9-20 (unsicher)</li>
              <li>• Symptothermale Methode (korrekt angewendet): 0,4-1,8</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Zeichen des Eisprungs */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔍 Zeichen des Eisprungs erkennen</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-pink-50 rounded-xl">
            <div className="text-2xl mb-2">🌡️</div>
            <h4 className="font-semibold text-pink-800">Basaltemperatur</h4>
            <p className="text-sm text-pink-700 mt-1">
              Steigt nach dem Eisprung um 0,2-0,5°C an. Morgens vor dem Aufstehen messen!
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl mb-2">💧</div>
            <h4 className="font-semibold text-purple-800">Zervixschleim</h4>
            <p className="text-sm text-purple-700 mt-1">
              Wird glasig, spinnbar wie rohes Eiweiß. Zeigt höchste Fruchtbarkeit an.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-blue-800">Mittelschmerz</h4>
            <p className="text-sm text-blue-700 mt-1">
              Leichtes Ziehen im Unterleib, oft einseitig. Nicht alle Frauen spüren ihn.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-green-800">LH-Tests</h4>
            <p className="text-sm text-green-700 mt-1">
              Ovulationstests zeigen LH-Anstieg 24-36h vor Eisprung. Sehr zuverlässig!
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Berechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Eisprung:</strong> Findet typischerweise 14 Tage vor der nächsten Periode statt (Lutealphase)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Fruchtbares Fenster:</strong> 5 Tage vor bis 1 Tag nach dem Eisprung (Spermien leben bis 5 Tage)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Eizelle:</strong> Lebt nur 12-24 Stunden nach dem Eisprung</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Zyklusvariation:</strong> Ein regelmäßiger Zyklus macht die Berechnung genauer</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Stellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Beratung & Unterstützung</h3>
        <div className="space-y-4">
          <div className="bg-pink-50 rounded-xl p-4">
            <p className="font-semibold text-pink-900">Gynäkologe / Kinderwunschzentrum</p>
            <p className="text-sm text-pink-700 mt-1">
              Für medizinische Beratung bei Kinderwunsch oder zur Zyklusüberwachung per Ultraschall.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">pro familia</p>
                <p className="text-gray-600">Sexualberatung & Familienplanung</p>
                <a 
                  href="https://www.profamilia.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  profamilia.de →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🏥</span>
              <div>
                <p className="font-medium text-gray-800">BZgA Familienplanung</p>
                <p className="text-gray-600">Bundeszentrale für gesundheitliche Aufklärung</p>
                <a 
                  href="https://www.familienplanung.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  familienplanung.de →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Keine Verhütungsmethode!</p>
              <p className="text-yellow-700">
                Dieser Rechner eignet sich NICHT als alleinige Verhütungsmethode. Der Pearl-Index der Kalendermethode 
                liegt bei 9-20 – das bedeutet, 9-20 von 100 Frauen werden pro Jahr schwanger.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📊</span>
            <div>
              <p className="font-medium text-blue-800">Schätzung, kein Fakt</p>
              <p className="text-blue-700">
                Der Eisprung kann von Zyklus zu Zyklus variieren. Stress, Krankheit, Reisen – all das beeinflusst den Zyklus.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">🧪</span>
            <div>
              <p className="font-medium text-green-800">Genauer mit Ovulationstests</p>
              <p className="text-green-700">
                LH-Tests aus der Apotheke zeigen den Eisprung 24-36 Stunden vorher an. Kombiniert mit Basaltemperatur 
                und Zervixschleim-Beobachtung wird die Vorhersage deutlich genauer.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">👩‍⚕️</span>
            <div>
              <p className="font-medium text-purple-800">Bei Kinderwunsch</p>
              <p className="text-purple-700">
                Nach 12 Monaten regelmäßigem Sex ohne Schwangerschaft (6 Monate ab 35 Jahren): Gynäkologen oder 
                Kinderwunschzentrum aufsuchen.
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
            href="https://www.familienplanung.de/verhuetung/verhuetungsmethoden/natuerliche-methoden/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BZgA Familienplanung – Natürliche Methoden
          </a>
          <a 
            href="https://www.frauenaerzte-im-netz.de/familienplanung-verhuetung/natuerliche-familienplanung/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Frauenärzte im Netz – Natürliche Familienplanung
          </a>
          <a 
            href="https://www.profamilia.de/themen/verhuetung"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            pro familia – Verhütung
          </a>
          <a 
            href="https://www.awmf.org/leitlinien/detail/ll/015-015.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            AWMF – Leitlinie Fertilitätsstörungen
          </a>
        </div>
      </div>
    </div>
  );
}
