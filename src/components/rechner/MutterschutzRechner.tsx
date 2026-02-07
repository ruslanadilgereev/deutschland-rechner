import { useState, useMemo } from 'react';

/**
 * Mutterschutz & Mutterschaftsgeld 2025/2026 - EXAKTE offizielle Berechnung
 * 
 * Rechtsgrundlagen:
 * - Mutterschutzgesetz (MuSchG) - Schutzfristen
 * - § 19 MuSchG - Mutterschaftsgeld
 * - § 20 MuSchG - Zuschuss zum Mutterschaftsgeld
 * - § 24i SGB V - Mutterschaftsgeld der Krankenkasse
 * 
 * Quellen:
 * - BMFSFJ: https://www.bmfsfj.de/bmfsfj/themen/familie/familienleistungen/mutterschutz
 * - Bundesamt für Soziale Sicherung: https://www.bundesamtsozialesicherung.de/de/mutterschaftsgeld/
 * - Familienportal: https://familienportal.de/familienportal/familienleistungen/mutterschaftsleistungen
 * - TK Firmenkunden: https://www.tk.de/firmenkunden/versicherung/versicherung-faq/mutterschaftsgeld/
 * 
 * Berechnungsmethode (§ 20 MuSchG, § 24i SGB V):
 * 1. Kalendertägliches Netto = (Nettolohn der letzten 3 Monate) / 90 Tage
 * 2. Krankenkasse zahlt max. 13€/Tag (bei GKV-Versicherten)
 * 3. Arbeitgeber zahlt Differenz: Kalendertägliches Netto - 13€
 * 
 * Bei PKV/Familienversicherten:
 * - Bundesamt zahlt einmalig max. 210€ (§ 19 Abs. 2 MuSchG)
 * - Arbeitgeber zahlt: Kalendertägliches Netto - 13€ (fiktiver Kassensatz)
 */
const MUTTERSCHUTZ_2026 = {
  kassenMax: 13,           // Max. 13€/Tag von Krankenkasse (§ 24i Abs. 2 SGB V)
  bundesamtMax: 210,       // Max. 210€ einmalig vom Bundesamt (§ 19 Abs. 2 MuSchG)
  schutzfristVor: 6,       // 6 Wochen vor Geburt (§ 3 Abs. 1 MuSchG)
  schutzfristNach: 8,      // 8 Wochen nach Geburt (§ 3 Abs. 2 MuSchG)
  schutzfristNachFrueh: 12, // 12 Wochen bei Früh-/Mehrlingsgeburt (§ 3 Abs. 2 Satz 2 MuSchG)
  tageProWoche: 7,         // Kalendertage (nicht Arbeitstage!)
};

type Versicherungsart = 'gkv' | 'pkv' | 'keine' | 'mini';

function berechneMutterschutz(
  bruttoMonat: number,
  nettoMonat: number,
  versicherung: Versicherungsart,
  fruehgeburt: boolean,
  mehrlinge: boolean,
  behinderung: boolean
): {
  tageVor: number;
  tageNach: number;
  tageGesamt: number;
  mutterschaftsgeldTag: number;
  mutterschaftsgeldGesamt: number;
  arbeitgeberZuschussTag: number;
  arbeitgeberZuschussGesamt: number;
  gesamtAuszahlung: number;
  kalenderwochen: number;
  nettoTag: number;
  berechnung: {
    label: string;
    wert: string;
    details?: string;
  }[];
} {
  // Schutzfristen berechnen
  const tageVor = MUTTERSCHUTZ_2026.schutzfristVor * MUTTERSCHUTZ_2026.tageProWoche; // 42 Tage
  let tageNach = MUTTERSCHUTZ_2026.schutzfristNach * MUTTERSCHUTZ_2026.tageProWoche; // 56 Tage
  
  // Verlängerte Schutzfrist bei Früh-/Mehrlingsgeburt oder Kind mit Behinderung
  if (fruehgeburt || mehrlinge || behinderung) {
    tageNach = MUTTERSCHUTZ_2026.schutzfristNachFrueh * MUTTERSCHUTZ_2026.tageProWoche; // 84 Tage
  }
  
  // Bei Frühgeburt: Verlorene Tage vor Geburt werden nachgeholt
  // (vereinfacht: wir nehmen volle Fristen an)
  
  const tageGesamt = tageVor + tageNach;
  const kalenderwochen = tageGesamt / 7;
  
  // Netto pro Tag (Durchschnitt der letzten 3 Monate)
  const nettoTag = Math.round((nettoMonat * 3 / 90) * 100) / 100;
  
  let mutterschaftsgeldTag = 0;
  let arbeitgeberZuschussTag = 0;
  
  const berechnung: { label: string; wert: string; details?: string }[] = [];
  
  if (versicherung === 'gkv') {
    // GKV-Versicherte: Max. 13€/Tag von der Krankenkasse + Arbeitgeberzuschuss
    mutterschaftsgeldTag = Math.min(MUTTERSCHUTZ_2026.kassenMax, nettoTag);
    arbeitgeberZuschussTag = Math.max(0, nettoTag - mutterschaftsgeldTag);
    
    berechnung.push({
      label: 'Netto-Tagessatz (Ø 3 Monate)',
      wert: `${nettoTag.toFixed(2)} €`,
      details: `${nettoMonat} € × 3 ÷ 90 Tage`,
    });
    berechnung.push({
      label: 'Mutterschaftsgeld (Krankenkasse)',
      wert: `${mutterschaftsgeldTag.toFixed(2)} €/Tag`,
      details: `Max. 13 €/Tag`,
    });
    berechnung.push({
      label: 'Arbeitgeberzuschuss',
      wert: `${arbeitgeberZuschussTag.toFixed(2)} €/Tag`,
      details: `${nettoTag.toFixed(2)} € − ${mutterschaftsgeldTag.toFixed(2)} €`,
    });
  } else if (versicherung === 'pkv' || versicherung === 'keine') {
    // PKV oder nicht versichert: Max. 210€ gesamt vom Bundesamt + voller Arbeitgeberzuschuss
    const bundesamtGesamt = MUTTERSCHUTZ_2026.bundesamtMax;
    mutterschaftsgeldTag = bundesamtGesamt / tageGesamt;
    arbeitgeberZuschussTag = Math.max(0, nettoTag - MUTTERSCHUTZ_2026.kassenMax);
    
    berechnung.push({
      label: 'Netto-Tagessatz (Ø 3 Monate)',
      wert: `${nettoTag.toFixed(2)} €`,
      details: `${nettoMonat} € × 3 ÷ 90 Tage`,
    });
    berechnung.push({
      label: 'Mutterschaftsgeld (Bundesamt)',
      wert: `210 € einmalig`,
      details: `Max. 210 € gesamt (nicht pro Tag)`,
    });
    berechnung.push({
      label: 'Arbeitgeberzuschuss',
      wert: `${arbeitgeberZuschussTag.toFixed(2)} €/Tag`,
      details: `${nettoTag.toFixed(2)} € − 13 € (fiktiver Kassensatz)`,
    });
  } else if (versicherung === 'mini') {
    // Minijob: Nur Mutterschaftsgeld vom Bundesamt
    mutterschaftsgeldTag = MUTTERSCHUTZ_2026.bundesamtMax / tageGesamt;
    arbeitgeberZuschussTag = 0;
    
    berechnung.push({
      label: 'Mutterschaftsgeld (Bundesamt)',
      wert: `210 € einmalig`,
      details: `Kein Arbeitgeberzuschuss bei Minijob`,
    });
  }
  
  const mutterschaftsgeldGesamt = versicherung === 'gkv' 
    ? mutterschaftsgeldTag * tageGesamt 
    : (versicherung === 'mini' ? MUTTERSCHUTZ_2026.bundesamtMax : MUTTERSCHUTZ_2026.bundesamtMax);
    
  const arbeitgeberZuschussGesamt = arbeitgeberZuschussTag * tageGesamt;
  
  // Für PKV: Bundesamt zahlt nur 210€ einmalig
  const gesamtAuszahlung = versicherung === 'gkv'
    ? mutterschaftsgeldGesamt + arbeitgeberZuschussGesamt
    : (versicherung === 'mini' ? MUTTERSCHUTZ_2026.bundesamtMax : MUTTERSCHUTZ_2026.bundesamtMax + arbeitgeberZuschussGesamt);
  
  berechnung.push({
    label: 'Schutzfrist gesamt',
    wert: `${tageGesamt} Tage (${kalenderwochen} Wochen)`,
    details: `${tageVor} vor + ${tageNach} nach der Geburt`,
  });
  berechnung.push({
    label: 'Gesamtauszahlung',
    wert: `${Math.round(gesamtAuszahlung).toLocaleString('de-DE')} €`,
    details: versicherung === 'gkv' 
      ? `(${mutterschaftsgeldTag.toFixed(2)} + ${arbeitgeberZuschussTag.toFixed(2)}) × ${tageGesamt} Tage`
      : `210 € + ${arbeitgeberZuschussGesamt.toLocaleString('de-DE')} €`,
  });
  
  return {
    tageVor,
    tageNach,
    tageGesamt,
    mutterschaftsgeldTag: versicherung === 'gkv' ? mutterschaftsgeldTag : MUTTERSCHUTZ_2026.bundesamtMax / tageGesamt,
    mutterschaftsgeldGesamt: versicherung === 'gkv' ? mutterschaftsgeldGesamt : MUTTERSCHUTZ_2026.bundesamtMax,
    arbeitgeberZuschussTag,
    arbeitgeberZuschussGesamt,
    gesamtAuszahlung,
    kalenderwochen,
    nettoTag,
    berechnung,
  };
}

export default function MutterschutzRechner() {
  const [bruttoMonat, setBruttoMonat] = useState(3500);
  const [nettoMonat, setNettoMonat] = useState(2300);
  const [versicherung, setVersicherung] = useState<Versicherungsart>('gkv');
  const [fruehgeburt, setFruehgeburt] = useState(false);
  const [mehrlinge, setMehrlinge] = useState(false);
  const [behinderung, setBehinderung] = useState(false);
  const [geburtstermin, setGeburtstermin] = useState('');

  const ergebnis = useMemo(() => {
    return berechneMutterschutz(bruttoMonat, nettoMonat, versicherung, fruehgeburt, mehrlinge, behinderung);
  }, [bruttoMonat, nettoMonat, versicherung, fruehgeburt, mehrlinge, behinderung]);

  // Berechne Schutzfrist-Daten wenn Geburtstermin angegeben
  const fristen = useMemo(() => {
    if (!geburtstermin) return null;
    const termin = new Date(geburtstermin);
    const startMutterschutz = new Date(termin);
    startMutterschutz.setDate(termin.getDate() - ergebnis.tageVor);
    const endeMutterschutz = new Date(termin);
    endeMutterschutz.setDate(termin.getDate() + ergebnis.tageNach);
    
    return {
      start: startMutterschutz.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      termin: termin.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      ende: endeMutterschutz.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    };
  }, [geburtstermin, ergebnis.tageVor, ergebnis.tageNach]);

  const formatEuro = (n: number) => Math.round(n).toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Netto-Einkommen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Dein Netto-Einkommen</span>
            <span className="text-xs text-gray-500 ml-2">(Durchschnitt der letzten 3 Monate)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={nettoMonat}
              onChange={(e) => setNettoMonat(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={nettoMonat}
            onChange={(e) => setNettoMonat(Number(e.target.value))}
            className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>

        {/* Versicherungsart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Krankenversicherung</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'gkv', label: 'Gesetzlich (GKV)', desc: 'Pflicht- oder freiwillig versichert' },
              { id: 'pkv', label: 'Privat (PKV)', desc: 'Privat krankenversichert' },
              { id: 'mini', label: 'Minijob', desc: 'Geringfügig beschäftigt' },
              { id: 'keine', label: 'Familienversichert', desc: 'Ohne eigene KV' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setVersicherung(v.id as Versicherungsart)}
                className={`p-4 rounded-xl text-left transition-all ${
                  versicherung === v.id
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="font-bold">{v.label}</div>
                <div className={`text-xs mt-1 ${versicherung === v.id ? 'text-pink-100' : 'text-gray-500'}`}>{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Geburtstermin (optional) */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Errechneter Geburtstermin</span>
            <span className="text-xs text-gray-500 ml-2">(optional)</span>
          </label>
          <input
            type="date"
            value={geburtstermin}
            onChange={(e) => setGeburtstermin(e.target.value)}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
          />
        </div>

        {/* Besondere Umstände */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Besondere Umstände</span>
            <span className="text-xs text-gray-500 ml-2">(verlängern die Schutzfrist auf 12 Wochen)</span>
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={fruehgeburt}
                onChange={(e) => setFruehgeburt(e.target.checked)}
                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
              />
              <div>
                <span className="font-medium text-gray-700">Frühgeburt</span>
                <span className="text-xs text-gray-500 ml-2">vor der 37. SSW</span>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={mehrlinge}
                onChange={(e) => setMehrlinge(e.target.checked)}
                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
              />
              <div>
                <span className="font-medium text-gray-700">Mehrlinge</span>
                <span className="text-xs text-gray-500 ml-2">Zwillinge, Drillinge etc.</span>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={behinderung}
                onChange={(e) => setBehinderung(e.target.checked)}
                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
              />
              <div>
                <span className="font-medium text-gray-700">Kind mit Behinderung</span>
                <span className="text-xs text-gray-500 ml-2">Feststellung innerhalb von 8 Wochen</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-pink-100 mb-1">Dein Mutterschaftsgeld</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">
              {formatEuro(ergebnis.gesamtAuszahlung)}
            </span>
            <span className="text-xl text-pink-200">gesamt</span>
          </div>
          <p className="text-pink-100 mt-2">
            für {ergebnis.kalenderwochen} Wochen Mutterschutz ({ergebnis.tageGesamt} Tage)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-pink-100 text-sm">Von der Krankenkasse</div>
            <div className="text-xl font-bold">{formatEuro(ergebnis.mutterschaftsgeldGesamt)}</div>
            {versicherung === 'gkv' && (
              <div className="text-pink-200 text-xs">{ergebnis.mutterschaftsgeldTag.toFixed(2)} €/Tag × {ergebnis.tageGesamt}</div>
            )}
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-pink-100 text-sm">Arbeitgeberzuschuss</div>
            <div className="text-xl font-bold">{formatEuro(ergebnis.arbeitgeberZuschussGesamt)}</div>
            <div className="text-pink-200 text-xs">{ergebnis.arbeitgeberZuschussTag.toFixed(2)} €/Tag × {ergebnis.tageGesamt}</div>
          </div>
        </div>
      </div>

      {/* Fristen-Übersicht */}
      {fristen && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📅 Deine Mutterschutzfristen</h3>
          <div className="relative">
            {/* Timeline */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="w-4 h-4 bg-pink-500 rounded-full mx-auto mb-2"></div>
                <div className="text-sm font-bold text-gray-800">Beginn</div>
                <div className="text-xs text-gray-600">{fristen.start}</div>
              </div>
              <div className="flex-1 h-2 bg-pink-200 mx-4 relative">
                <div className="absolute inset-y-0 left-0 w-[43%] bg-pink-300"></div>
                <div className="absolute inset-y-0 right-0 w-[57%] bg-pink-500"></div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-rose-600 rounded-full mx-auto mb-2"></div>
                <div className="text-sm font-bold text-gray-800">Geburt</div>
                <div className="text-xs text-gray-600">{fristen.termin}</div>
              </div>
              <div className="flex-1 h-2 bg-pink-500 mx-4"></div>
              <div className="text-center">
                <div className="w-4 h-4 bg-pink-500 rounded-full mx-auto mb-2"></div>
                <div className="text-sm font-bold text-gray-800">Ende</div>
                <div className="text-xs text-gray-600">{fristen.ende}</div>
              </div>
            </div>
            
            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-pink-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">{ergebnis.tageVor / 7} Wochen</div>
                <div className="text-sm text-pink-800">vor der Geburt</div>
                <div className="text-xs text-pink-600 mt-1">Ab {fristen.start}</div>
              </div>
              <div className="bg-rose-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-rose-600">{ergebnis.tageNach / 7} Wochen</div>
                <div className="text-sm text-rose-800">nach der Geburt</div>
                <div className="text-xs text-rose-600 mt-1">Bis {fristen.ende}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        <div className="space-y-3">
          {ergebnis.berechnung.map((item, i) => (
            <div key={i} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-800">{item.label}</p>
                {item.details && <p className="text-xs text-gray-500">{item.details}</p>}
              </div>
              <span className="font-bold text-gray-900 whitespace-nowrap ml-4">{item.wert}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert Mutterschutz</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>6 Wochen vor</strong> der Geburt beginnt der Mutterschutz (freiwillig weiterarbeiten möglich)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>8 Wochen nach</strong> der Geburt gilt absolutes Beschäftigungsverbot</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>12 Wochen nach</strong> der Geburt bei Früh-/Mehrlingsgeburten oder Kind mit Behinderung</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>100% Nettolohn</strong> durch Mutterschaftsgeld + Arbeitgeberzuschuss</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Max. 13 €/Tag</strong> zahlt die Krankenkasse, den Rest der Arbeitgeber</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stellen</h3>
        <div className="space-y-4">
          <div className="bg-pink-50 rounded-xl p-4">
            <p className="font-semibold text-pink-900">Mutterschaftsgeld beantragen bei:</p>
            <ul className="text-sm text-pink-700 mt-2 space-y-1">
              <li>• <strong>GKV-Versicherte:</strong> Bei deiner Krankenkasse</li>
              <li>• <strong>PKV/Familienversicherte:</strong> Bundesamt für Soziale Sicherung</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">GKV-Versicherte</p>
                <p className="text-gray-600">Antrag bei deiner Krankenkasse</p>
                <p className="text-xs text-gray-500 mt-1">Mit ärztlicher Bescheinigung über den Geburtstermin</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🏛️</span>
              <div>
                <p className="font-medium text-gray-800">Bundesamt für Soziale Sicherung</p>
                <a 
                  href="https://www.bundesamtsozialesicherung.de/de/mutterschaftsgeld/ueberblick/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Online beantragen →
                </a>
                <p className="text-xs text-gray-500 mt-1">Für PKV-Versicherte & Familienversicherte</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Bürgertelefon Bundesamt</p>
              <p className="text-gray-600">0228 619-1888</p>
              <p className="text-xs text-gray-500">Mo-Do 9-15 Uhr, Fr 9-12 Uhr</p>
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
              <p className="font-medium text-yellow-800">Rechtzeitig beantragen!</p>
              <p className="text-yellow-700">Mutterschaftsgeld sollte ca. 7 Wochen vor dem Geburtstermin beantragt werden.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium text-blue-800">Benötigte Unterlagen</p>
              <p className="text-blue-700">Ärztliche Bescheinigung über den voraussichtlichen Entbindungstermin, nach der Geburt: Geburtsurkunde.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">💼</span>
            <div>
              <p className="font-medium text-green-800">Arbeitgeberzuschuss automatisch</p>
              <p className="text-green-700">Der Arbeitgeber zahlt den Zuschuss automatisch mit der Gehaltsabrechnung – kein Extra-Antrag nötig.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">🛡️</span>
            <div>
              <p className="font-medium text-purple-800">Kündigungsschutz</p>
              <p className="text-purple-700">Während der Schwangerschaft und bis 4 Monate nach der Entbindung besteht besonderer Kündigungsschutz.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-xl">⏰</span>
            <div>
              <p className="font-medium text-orange-800">Vor Geburt freiwillig arbeiten</p>
              <p className="text-orange-700">In den 6 Wochen vor der Geburt darfst du auf eigenen Wunsch weiterarbeiten. Das Beschäftigungsverbot nach der Geburt ist jedoch absolut.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.bmfsfj.de/bmfsfj/themen/familie/familienleistungen/mutterschutz"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMFSFJ – Mutterschutzgesetz
          </a>
          <a 
            href="https://www.bundesamtsozialesicherung.de/de/mutterschaftsgeld/ueberblick/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesamt für Soziale Sicherung – Mutterschaftsgeld
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/muschg_2018/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Mutterschutzgesetz (MuSchG)
          </a>
          <a 
            href="https://familienportal.de/familienportal/familienleistungen/mutterschaftsleistungen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Familienportal – Mutterschaftsleistungen
          </a>
        </div>
      </div>
    </div>
  );
}
