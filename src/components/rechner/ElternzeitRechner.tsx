import { useState, useMemo } from 'react';

// Elternzeit 2026 - Quellen: BMFSFJ, BEEG
const ELTERNZEIT_2026 = {
  maxMonateGesamt: 36,           // Max. 36 Monate pro Elternteil
  maxMonateVorDrittemGeburtstag: 24, // 24 Monate müssen vor dem 3. Geburtstag genommen werden
  maxMonateNachDrittemGeburtstag: 12, // 12 Monate können zwischen 3. und 8. Geburtstag genommen werden
  maxTeilzeitStunden: 32,        // Max. 32 Stunden/Woche Teilzeit während Elternzeit (seit Sept 2021)
  minTeilzeitBetrieb: 15,        // Betrieb muss mind. 15 Mitarbeiter haben für Teilzeit-Anspruch
  kuendigungsschutzVorher: 8,    // Wochen Kündigungsschutz vor Beginn (ab 8 Wochen vor Beginn)
  kuendigungsschutzVorher3Plus: 14, // Wochen bei Elternzeit ab 3. Geburtstag
  anmeldefristWochen: 7,         // Anmeldung mind. 7 Wochen vor Beginn (vor 3. Geburtstag)
  anmeldefristWochen3Plus: 13,   // Anmeldung mind. 13 Wochen vor Beginn (ab 3. Geburtstag)
};

interface ElternzeitPeriode {
  von: Date;
  bis: Date;
  monate: number;
  phase: 'vor3' | 'nach3';
}

interface Elternteil {
  id: 'mutter' | 'vater' | 'partner';
  label: string;
  perioden: ElternzeitPeriode[];
  monateGesamt: number;
  monateVor3: number;
  monateNach3: number;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function monthsBetween(start: Date, end: Date): number {
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, months);
}

export default function ElternzeitRechner() {
  const [geburtsdatum, setGeburtsdatum] = useState('');
  const [mutterMonate, setMutterMonate] = useState(12);
  const [vaterMonate, setVaterMonate] = useState(2);
  const [teilzeit, setTeilzeit] = useState(false);
  const [teilzeitStunden, setTeilzeitStunden] = useState(20);
  const [gleichzeitig, setGleichzeitig] = useState(false);
  const [mutterNach3, setMutterNach3] = useState(0);
  const [vaterNach3, setVaterNach3] = useState(0);
  const [mutterschutzEnde, setMutterschutzEnde] = useState(true); // Elternzeit direkt nach Mutterschutz

  const berechnung = useMemo(() => {
    if (!geburtsdatum) return null;

    const geburt = new Date(geburtsdatum);
    const dritterGeburtstag = addMonths(geburt, 36);
    const achterGeburtstag = addMonths(geburt, 96);
    
    // Mutterschutz endet 8 Wochen nach Geburt
    const mutterschutzEndeDate = new Date(geburt);
    mutterschutzEndeDate.setDate(mutterschutzEndeDate.getDate() + 56); // 8 Wochen

    // Berechne Mutter-Elternzeit
    const mutterStart = mutterschutzEnde ? mutterschutzEndeDate : geburt;
    const mutterEndeVor3 = addMonths(mutterStart, mutterMonate);
    const mutterEndeNach3 = mutterNach3 > 0 ? addMonths(dritterGeburtstag, mutterNach3) : null;

    // Berechne Vater-Elternzeit
    const vaterStart = geburt; // Vater kann ab Geburt beginnen
    const vaterEndeVor3 = addMonths(vaterStart, vaterMonate);
    const vaterEndeNach3 = vaterNach3 > 0 ? addMonths(dritterGeburtstag, vaterNach3) : null;

    // Anmeldefristen berechnen
    const anmeldungMutterSpätestens = new Date(mutterStart);
    anmeldungMutterSpätestens.setDate(anmeldungMutterSpätestens.getDate() - (ELTERNZEIT_2026.anmeldefristWochen * 7));
    
    const anmeldungVaterSpätestens = new Date(vaterStart);
    anmeldungVaterSpätestens.setDate(anmeldungVaterSpätestens.getDate() - (ELTERNZEIT_2026.anmeldefristWochen * 7));

    // Kündigungsschutz beginnt
    const kuendigungsschutzMutter = new Date(mutterStart);
    kuendigungsschutzMutter.setDate(kuendigungsschutzMutter.getDate() - (ELTERNZEIT_2026.kuendigungsschutzVorher * 7));
    
    const kuendigungsschutzVater = new Date(vaterStart);
    kuendigungsschutzVater.setDate(kuendigungsschutzVater.getDate() - (ELTERNZEIT_2026.kuendigungsschutzVorher * 7));

    // Restliche Monate berechnen
    const mutterGenutzt = mutterMonate + mutterNach3;
    const vaterGenutzt = vaterMonate + vaterNach3;
    const mutterRest = ELTERNZEIT_2026.maxMonateGesamt - mutterGenutzt;
    const vaterRest = ELTERNZEIT_2026.maxMonateGesamt - vaterGenutzt;

    // Warnungen
    const warnungen: string[] = [];
    
    if (mutterMonate > ELTERNZEIT_2026.maxMonateVorDrittemGeburtstag) {
      warnungen.push('Die Mutter plant mehr als 24 Monate vor dem 3. Geburtstag – nur 24 Monate sind in diesem Zeitraum möglich.');
    }
    if (vaterMonate > ELTERNZEIT_2026.maxMonateVorDrittemGeburtstag) {
      warnungen.push('Der Vater plant mehr als 24 Monate vor dem 3. Geburtstag – nur 24 Monate sind in diesem Zeitraum möglich.');
    }
    if (mutterNach3 > ELTERNZEIT_2026.maxMonateNachDrittemGeburtstag) {
      warnungen.push('Die Mutter plant mehr als 12 Monate nach dem 3. Geburtstag – nur 12 Monate sind übertragbar.');
    }
    if (vaterNach3 > ELTERNZEIT_2026.maxMonateNachDrittemGeburtstag) {
      warnungen.push('Der Vater plant mehr als 12 Monate nach dem 3. Geburtstag – nur 12 Monate sind übertragbar.');
    }
    if (mutterGenutzt > ELTERNZEIT_2026.maxMonateGesamt) {
      warnungen.push(`Die Mutter überschreitet die maximalen 36 Monate Elternzeit.`);
    }
    if (vaterGenutzt > ELTERNZEIT_2026.maxMonateGesamt) {
      warnungen.push(`Der Vater überschreitet die maximalen 36 Monate Elternzeit.`);
    }

    // Tipps
    const tipps: string[] = [];
    if (gleichzeitig) {
      tipps.push('Bei gleichzeitiger Elternzeit können beide Eltern parallel Elterngeld beziehen (z.B. beide in Teilzeit).');
    }
    if (mutterRest > 0 || vaterRest > 0) {
      tipps.push(`Nicht genutzte Elternzeit verfällt! Mutter: ${mutterRest} Monate, Vater: ${vaterRest} Monate noch verfügbar.`);
    }
    if (teilzeit && teilzeitStunden > ELTERNZEIT_2026.maxTeilzeitStunden) {
      tipps.push(`Während Elternzeit sind maximal ${ELTERNZEIT_2026.maxTeilzeitStunden} Stunden/Woche erlaubt.`);
    }

    return {
      geburt,
      dritterGeburtstag,
      achterGeburtstag,
      mutterschutzEndeDate,
      mutter: {
        start: mutterStart,
        endeVor3: mutterEndeVor3,
        endeNach3: mutterEndeNach3,
        monateVor3: mutterMonate,
        monateNach3: mutterNach3,
        monateGesamt: mutterGenutzt,
        rest: mutterRest,
        anmeldung: anmeldungMutterSpätestens,
        kuendigungsschutz: kuendigungsschutzMutter,
      },
      vater: {
        start: vaterStart,
        endeVor3: vaterEndeVor3,
        endeNach3: vaterEndeNach3,
        monateVor3: vaterMonate,
        monateNach3: vaterNach3,
        monateGesamt: vaterGenutzt,
        rest: vaterRest,
        anmeldung: anmeldungVaterSpätestens,
        kuendigungsschutz: kuendigungsschutzVater,
      },
      familieGesamt: mutterGenutzt + vaterGenutzt,
      warnungen,
      tipps,
    };
  }, [geburtsdatum, mutterMonate, vaterMonate, mutterNach3, vaterNach3, teilzeit, teilzeitStunden, gleichzeitig, mutterschutzEnde]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Geburtsdatum */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Geburtsdatum des Kindes</span>
            <span className="text-xs text-gray-500 ml-2">(oder errechneter Termin)</span>
          </label>
          <input
            type="date"
            value={geburtsdatum}
            onChange={(e) => setGeburtsdatum(e.target.value)}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none text-lg"
          />
        </div>

        {/* Mutterschutz-Option */}
        <div className="mb-6">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={mutterschutzEnde}
              onChange={(e) => setMutterschutzEnde(e.target.checked)}
              className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
            />
            <div>
              <span className="font-medium text-gray-700">Elternzeit direkt nach Mutterschutz</span>
              <span className="text-xs text-gray-500 block">Startet 8 Wochen nach der Geburt</span>
            </div>
          </label>
        </div>

        {/* Elternzeit Mutter */}
        <div className="mb-6 p-4 bg-pink-50 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">👩</span>
            <span className="text-gray-700 font-medium">Elternzeit Mutter</span>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">
              Monate vor dem 3. Geburtstag <span className="text-pink-600 font-medium">({mutterMonate} Monate)</span>
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={mutterMonate}
              onChange={(e) => setMutterMonate(Number(e.target.value))}
              className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>12</span>
              <span>24 (max)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Monate nach dem 3. Geburtstag <span className="text-pink-600 font-medium">({mutterNach3} Monate)</span>
            </label>
            <input
              type="range"
              min="0"
              max="12"
              value={mutterNach3}
              onChange={(e) => setMutterNach3(Number(e.target.value))}
              className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>6</span>
              <span>12 (max)</span>
            </div>
          </div>
        </div>

        {/* Elternzeit Vater */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">👨</span>
            <span className="text-gray-700 font-medium">Elternzeit Vater / Partner:in</span>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">
              Monate vor dem 3. Geburtstag <span className="text-blue-600 font-medium">({vaterMonate} Monate)</span>
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={vaterMonate}
              onChange={(e) => setVaterMonate(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>12</span>
              <span>24 (max)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Monate nach dem 3. Geburtstag <span className="text-blue-600 font-medium">({vaterNach3} Monate)</span>
            </label>
            <input
              type="range"
              min="0"
              max="12"
              value={vaterNach3}
              onChange={(e) => setVaterNach3(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>6</span>
              <span>12 (max)</span>
            </div>
          </div>
        </div>

        {/* Optionen */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={gleichzeitig}
              onChange={(e) => setGleichzeitig(e.target.checked)}
              className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
            />
            <div>
              <span className="font-medium text-gray-700">Gleichzeitige Elternzeit</span>
              <span className="text-xs text-gray-500 block">Beide Eltern nehmen zur gleichen Zeit Elternzeit</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={teilzeit}
              onChange={(e) => setTeilzeit(e.target.checked)}
              className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
            />
            <div>
              <span className="font-medium text-gray-700">Teilzeit während Elternzeit</span>
              <span className="text-xs text-gray-500 block">Max. 32 Stunden/Woche arbeiten</span>
            </div>
          </label>

          {teilzeit && (
            <div className="pl-8">
              <label className="block text-sm text-gray-600 mb-2">
                Gewünschte Wochenstunden <span className="text-gray-800 font-medium">({teilzeitStunden}h/Woche)</span>
              </label>
              <input
                type="range"
                min="0"
                max="32"
                value={teilzeitStunden}
                onChange={(e) => setTeilzeitStunden(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0h</span>
                <span>15h</span>
                <span>32h (max)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      {berechnung && (
        <>
          {/* Hauptergebnis */}
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white mb-6">
            <h3 className="text-sm font-medium text-pink-100 mb-1">Elternzeit gesamt</h3>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {berechnung.familieGesamt}
                </span>
                <span className="text-xl text-pink-200">Monate</span>
              </div>
              <p className="text-pink-100 mt-2">
                für beide Elternteile zusammen
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-pink-100 text-sm">👩 Mutter</div>
                <div className="text-xl font-bold">{berechnung.mutter.monateGesamt} Monate</div>
                <div className="text-pink-200 text-xs">
                  {berechnung.mutter.monateVor3} vor + {berechnung.mutter.monateNach3} nach 3. Geburtstag
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-pink-100 text-sm">👨 Vater</div>
                <div className="text-xl font-bold">{berechnung.vater.monateGesamt} Monate</div>
                <div className="text-pink-200 text-xs">
                  {berechnung.vater.monateVor3} vor + {berechnung.vater.monateNach3} nach 3. Geburtstag
                </div>
              </div>
            </div>
          </div>

          {/* Warnungen */}
          {berechnung.warnungen.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
              <h4 className="text-red-800 font-bold flex items-center gap-2 mb-2">
                <span>⚠️</span> Achtung
              </h4>
              <ul className="space-y-1">
                {berechnung.warnungen.map((w, i) => (
                  <li key={i} className="text-red-700 text-sm">{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Zeitplan */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📅 Dein Elternzeit-Zeitplan</h3>
            
            {/* Wichtige Daten */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Geburt</span>
                  <span className="font-bold text-gray-800">{formatDate(berechnung.geburt)}</span>
                </div>
              </div>
              <div className="p-4 bg-pink-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mutterschutz endet</span>
                  <span className="font-bold text-pink-800">{formatDate(berechnung.mutterschutzEndeDate)}</span>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">3. Geburtstag</span>
                  <span className="font-bold text-yellow-800">{formatDate(berechnung.dritterGeburtstag)}</span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">8. Geburtstag (Ende Anspruch)</span>
                  <span className="font-bold text-purple-800">{formatDate(berechnung.achterGeburtstag)}</span>
                </div>
              </div>
            </div>

            {/* Mutter Timeline */}
            <div className="mb-6">
              <h4 className="font-medium text-pink-700 mb-3 flex items-center gap-2">
                <span>👩</span> Elternzeit Mutter
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                  <span>Beginn Elternzeit</span>
                  <span className="font-medium">{formatDate(berechnung.mutter.start)}</span>
                </div>
                <div className="flex justify-between p-3 bg-pink-50 rounded-lg">
                  <span>Ende (vor 3. Geburtstag)</span>
                  <span className="font-medium">{formatDate(berechnung.mutter.endeVor3)}</span>
                </div>
                {berechnung.mutter.endeNach3 && (
                  <div className="flex justify-between p-3 bg-pink-100 rounded-lg">
                    <span>Ende (nach 3. Geburtstag)</span>
                    <span className="font-medium">{formatDate(berechnung.mutter.endeNach3)}</span>
                  </div>
                )}
                <div className="flex justify-between p-3 bg-green-50 rounded-lg text-green-800">
                  <span>Kündigungsschutz ab</span>
                  <span className="font-medium">{formatDate(berechnung.mutter.kuendigungsschutz)}</span>
                </div>
                <div className="flex justify-between p-3 bg-orange-50 rounded-lg text-orange-800">
                  <span>Anmeldung spätestens</span>
                  <span className="font-medium">{formatDate(berechnung.mutter.anmeldung)}</span>
                </div>
              </div>
            </div>

            {/* Vater Timeline */}
            {(berechnung.vater.monateVor3 > 0 || berechnung.vater.monateNach3 > 0) && (
              <div>
                <h4 className="font-medium text-blue-700 mb-3 flex items-center gap-2">
                  <span>👨</span> Elternzeit Vater
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span>Beginn Elternzeit</span>
                    <span className="font-medium">{formatDate(berechnung.vater.start)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span>Ende (vor 3. Geburtstag)</span>
                    <span className="font-medium">{formatDate(berechnung.vater.endeVor3)}</span>
                  </div>
                  {berechnung.vater.endeNach3 && (
                    <div className="flex justify-between p-3 bg-blue-100 rounded-lg">
                      <span>Ende (nach 3. Geburtstag)</span>
                      <span className="font-medium">{formatDate(berechnung.vater.endeNach3)}</span>
                    </div>
                  )}
                  <div className="flex justify-between p-3 bg-green-50 rounded-lg text-green-800">
                    <span>Kündigungsschutz ab</span>
                    <span className="font-medium">{formatDate(berechnung.vater.kuendigungsschutz)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-orange-50 rounded-lg text-orange-800">
                    <span>Anmeldung spätestens</span>
                    <span className="font-medium">{formatDate(berechnung.vater.anmeldung)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Restliche Elternzeit */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📊 Verfügbare Elternzeit</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">👩 Mutter</p>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 transition-all duration-300"
                    style={{ width: `${(berechnung.mutter.monateGesamt / 36) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {berechnung.mutter.monateGesamt}/36 Monate genutzt • <span className="text-pink-600 font-medium">{berechnung.mutter.rest} noch verfügbar</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">👨 Vater</p>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(berechnung.vater.monateGesamt / 36) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {berechnung.vater.monateGesamt}/36 Monate genutzt • <span className="text-blue-600 font-medium">{berechnung.vater.rest} noch verfügbar</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tipps */}
          {berechnung.tipps.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
              <h4 className="text-blue-800 font-bold flex items-center gap-2 mb-2">
                <span>💡</span> Tipps
              </h4>
              <ul className="space-y-1">
                {berechnung.tipps.map((t, i) => (
                  <li key={i} className="text-blue-700 text-sm">{t}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert Elternzeit</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>36 Monate</strong> pro Elternteil stehen zur Verfügung (insgesamt 72 Monate für beide)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>24 Monate</strong> müssen vor dem 3. Geburtstag genommen werden</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>12 Monate</strong> können zwischen dem 3. und 8. Geburtstag übertragen werden</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Teilzeit</strong> bis zu 32 Stunden/Woche während der Elternzeit möglich</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kündigungsschutz</strong> ab 8 Wochen vor Beginn der Elternzeit</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Anmeldung</strong> mindestens 7 Wochen vor Beginn beim Arbeitgeber</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Anmeldung & Zuständigkeit</h3>
        <div className="space-y-4">
          <div className="bg-pink-50 rounded-xl p-4">
            <p className="font-semibold text-pink-900">Elternzeit beantragen bei:</p>
            <p className="text-sm text-pink-700 mt-2">
              Die Elternzeit muss <strong>schriftlich beim Arbeitgeber</strong> angemeldet werden – nicht bei einer Behörde.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📝</span>
              <div>
                <p className="font-medium text-gray-800">Schriftliche Anmeldung</p>
                <p className="text-gray-600">7 Wochen vor Beginn beim Arbeitgeber</p>
                <p className="text-xs text-gray-500 mt-1">Mit Unterschrift, kein E-Mail!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Familienportal</p>
                <a 
                  href="https://familienportal.de/familienportal/familienleistungen/elternzeit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Offizielle Infos →
                </a>
                <p className="text-xs text-gray-500 mt-1">Alle Details zur Elternzeit</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Servicetelefon Familie</p>
              <p className="text-gray-600">030 201 791 30</p>
              <p className="text-xs text-gray-500">Mo-Do 9-18 Uhr</p>
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
              <p className="font-medium text-yellow-800">Schriftform erforderlich!</p>
              <p className="text-yellow-700">Die Anmeldung muss schriftlich mit Unterschrift erfolgen. E-Mail oder Fax genügen nicht.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium text-blue-800">Verbindliche Festlegung</p>
              <p className="text-blue-700">Die ersten 24 Monate müssen verbindlich festgelegt werden. Änderungen nur mit Zustimmung des Arbeitgebers.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">💼</span>
            <div>
              <p className="font-medium text-green-800">Teilzeitarbeit möglich</p>
              <p className="text-green-700">Während der Elternzeit dürfen Sie bis zu 32 Stunden pro Woche arbeiten (bei Betrieben ab 15 Mitarbeitern).</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">🛡️</span>
            <div>
              <p className="font-medium text-purple-800">Kündigungsschutz</p>
              <p className="text-purple-700">Beginnt 8 Wochen vor der Elternzeit und endet mit der Elternzeit. Kündigung nur mit Zustimmung der Aufsichtsbehörde möglich.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-xl">👶</span>
            <div>
              <p className="font-medium text-orange-800">Elternzeit ≠ Elterngeld</p>
              <p className="text-orange-700">Elternzeit ist die Freistellung vom Job. Elterngeld ist die finanzielle Leistung. Beides muss separat beantragt werden!</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-red-50 rounded-xl">
            <span className="text-xl">⏰</span>
            <div>
              <p className="font-medium text-red-800">Nicht genutzte Elternzeit verfällt!</p>
              <p className="text-red-700">Elternzeit kann nicht auf Geschwister übertragen werden und verfällt nach dem 8. Geburtstag des Kindes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkliste */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">✅ Checkliste Elternzeit</h3>
        <div className="space-y-2 text-sm">
          {[
            'Elternzeit-Zeitraum festlegen (wann, wie lange)',
            'Anmeldung schriftlich vorbereiten',
            'Mind. 7 Wochen vorher beim Arbeitgeber einreichen',
            'Kopie für eigene Unterlagen behalten',
            'Empfangsbestätigung vom Arbeitgeber einholen',
            'Elterngeld separat bei der Elterngeldstelle beantragen',
            'Krankenversicherung während Elternzeit klären',
            'Ggf. Teilzeit während Elternzeit beantragen',
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input type="checkbox" className="w-4 h-4 text-pink-500 rounded" />
              <span className="text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://familienportal.de/familienportal/familienleistungen/elternzeit"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Familienportal – Elternzeit
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/beeg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundeselterngeld- und Elternzeitgesetz (BEEG)
          </a>
          <a 
            href="https://www.bmfsfj.de/bmfsfj/themen/familie/familienleistungen/elternzeit"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMFSFJ – Elternzeit
          </a>
          <a 
            href="https://www.arbeitsagentur.de/familie-und-kinder/elternzeit"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesagentur für Arbeit – Elternzeit
          </a>
        </div>
      </div>
    </div>
  );
}
