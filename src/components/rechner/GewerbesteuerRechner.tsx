import { useState, useMemo } from 'react';

// Gewerbesteuer-Konstanten 2025/2026
const STEUERMESSZAHL = 0.035; // 3,5% Steuermesszahl
const FREIBETRAG_PERSONENGESELLSCHAFT = 24500; // Freibetrag für Einzelunternehmer/Personengesellschaften
const FREIBETRAG_KAPITALGESELLSCHAFT = 0; // Kein Freibetrag für Kapitalgesellschaften
const ANRECHNUNGSFAKTOR = 4.0; // Faktor für Anrechnung auf ESt (max. 4-facher Hebesatz)

// Typische Hebesätze nach Gemeindegröße
const HEBESATZ_PRESETS = [
  { name: 'München', satz: 490 },
  { name: 'Frankfurt', satz: 460 },
  { name: 'Hamburg', satz: 470 },
  { name: 'Berlin', satz: 410 },
  { name: 'Köln', satz: 475 },
  { name: 'Düsseldorf', satz: 440 },
  { name: 'Stuttgart', satz: 420 },
  { name: 'Monheim', satz: 250 },
  { name: 'Zossen', satz: 200 },
  { name: 'Durchschnitt', satz: 435 },
];

type Rechtsform = 'einzelunternehmer' | 'personengesellschaft' | 'kapitalgesellschaft';

export default function GewerbesteuerRechner() {
  // Eingabewerte
  const [gewinn, setGewinn] = useState(100000);
  const [rechtsform, setRechtsform] = useState<Rechtsform>('einzelunternehmer');
  const [hebesatz, setHebesatz] = useState(400);
  const [hinzurechnungen, setHinzurechnungen] = useState(0);
  const [kuerzungen, setKuerzungen] = useState(0);
  const [istEinkommensteuerPflichtig, setIstEinkommensteuerPflichtig] = useState(true);
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(35); // Für ESt-Anrechnung

  const ergebnis = useMemo(() => {
    // === 1. Gewerbeertrag ermitteln ===
    // Gewinn aus Gewerbebetrieb
    // + Hinzurechnungen (z.B. Zinsen, Mieten)
    // - Kürzungen (z.B. Grundbesitz)
    const gewerbeertragVorFreibetrag = gewinn + hinzurechnungen - kuerzungen;

    // === 2. Freibetrag abziehen ===
    const freibetrag = rechtsform === 'kapitalgesellschaft' 
      ? FREIBETRAG_KAPITALGESELLSCHAFT 
      : FREIBETRAG_PERSONENGESELLSCHAFT;
    
    const gewerbeertrag = Math.max(0, gewerbeertragVorFreibetrag - freibetrag);
    const hatFreibetragGenutzt = gewerbeertragVorFreibetrag > 0 && gewerbeertragVorFreibetrag > freibetrag;

    // === 3. Abrundung auf volle 100 € ===
    const gewerbeertragGerundet = Math.floor(gewerbeertrag / 100) * 100;

    // === 4. Steuermessbetrag berechnen ===
    const steuermessbetrag = gewerbeertragGerundet * STEUERMESSZAHL;

    // === 5. Gewerbesteuer berechnen ===
    const gewerbesteuer = steuermessbetrag * (hebesatz / 100);

    // === 6. Anrechnung auf Einkommensteuer (nur für Nicht-Kapitalgesellschaften) ===
    let estAnrechnung = 0;
    let estAnrechnungMax = 0;
    let effektiveGewerbesteuer = gewerbesteuer;
    
    if (rechtsform !== 'kapitalgesellschaft' && istEinkommensteuerPflichtig) {
      // Anrechnung: max. 4-faches des Steuermessbetrags auf ESt
      estAnrechnungMax = steuermessbetrag * ANRECHNUNGSFAKTOR;
      
      // Effektive Anrechnung ist begrenzt durch die tatsächliche ESt
      const theoretischeEst = gewinn * (grenzsteuersatz / 100);
      estAnrechnung = Math.min(estAnrechnungMax, gewerbesteuer, theoretischeEst);
      
      effektiveGewerbesteuer = gewerbesteuer - estAnrechnung;
    }

    // === 7. Effektiver Steuersatz ===
    const effektiverSteuersatz = gewinn > 0 ? (effektiveGewerbesteuer / gewinn) * 100 : 0;
    const nominalerSteuersatz = gewinn > 0 ? (gewerbesteuer / gewinn) * 100 : 0;

    // === 8. Hebesatz-Schwelle für volle Anrechnung ===
    // Bei Hebesatz von 400% wird die GewSt voll angerechnet
    // Darüber bleibt Belastung, darunter "Überschuss"
    const hebesatzSchwelle = ANRECHNUNGSFAKTOR * 100; // = 400%

    // === 9. Vergleich: Niedrigster vs. höchster Hebesatz ===
    const minHebesatz = 200;
    const maxHebesatz = 900;
    const gewerbesteuerMin = steuermessbetrag * (minHebesatz / 100);
    const gewerbesteuerMax = steuermessbetrag * (maxHebesatz / 100);
    const ersparnisPotenzial = gewerbesteuerMax - gewerbesteuerMin;

    return {
      // Eingangswerte
      gewinn,
      hinzurechnungen,
      kuerzungen,
      hebesatz,
      rechtsform,
      
      // Berechnung
      gewerbeertragVorFreibetrag,
      freibetrag,
      gewerbeertrag,
      gewerbeertragGerundet,
      hatFreibetragGenutzt,
      
      // Steuermessbetrag
      steuermesszahl: STEUERMESSZAHL,
      steuermessbetrag,
      
      // Gewerbesteuer
      gewerbesteuer,
      
      // ESt-Anrechnung
      estAnrechnung,
      estAnrechnungMax,
      effektiveGewerbesteuer,
      hebesatzSchwelle,
      
      // Steuersätze
      effektiverSteuersatz,
      nominalerSteuersatz,
      
      // Vergleich
      gewerbesteuerMin,
      gewerbesteuerMax,
      ersparnisPotenzial,
    };
  }, [gewinn, rechtsform, hebesatz, hinzurechnungen, kuerzungen, istEinkommensteuerPflichtig, grenzsteuersatz]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Rechtsform */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Rechtsform</span>
            <span className="text-xs text-gray-500 block mt-1">
              Bestimmt Freibetrag und ESt-Anrechnung
            </span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setRechtsform('einzelunternehmer')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                rechtsform === 'einzelunternehmer'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <div className="font-semibold">Einzelunternehmer</div>
                  <div className="text-xs opacity-80">Freibetrag 24.500 €, ESt-Anrechnung</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setRechtsform('personengesellschaft')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                rechtsform === 'personengesellschaft'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <div className="font-semibold">Personengesellschaft</div>
                  <div className="text-xs opacity-80">GbR, OHG, KG – Freibetrag 24.500 €</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setRechtsform('kapitalgesellschaft')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                rechtsform === 'kapitalgesellschaft'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <div className="font-semibold">Kapitalgesellschaft</div>
                  <div className="text-xs opacity-80">GmbH, UG, AG – kein Freibetrag, keine ESt-Anrechnung</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Gewinn */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Gewinn aus Gewerbebetrieb</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jahresgewinn vor Gewerbesteuer
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={gewinn}
              onChange={(e) => setGewinn(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
              min="0"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={gewinn}
            onChange={(e) => setGewinn(Number(e.target.value))}
            className="w-full mt-3 accent-amber-500"
            min="0"
            max="500000"
            step="5000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>250.000 €</span>
            <span>500.000 €</span>
          </div>
        </div>

        {/* Hebesatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Hebesatz der Gemeinde</span>
            <span className="text-xs text-gray-500 block mt-1">
              Der Hebesatz variiert je nach Gemeinde (mind. 200%)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={hebesatz}
              onChange={(e) => setHebesatz(Math.max(200, Math.min(900, Number(e.target.value))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
              min="200"
              max="900"
              step="5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">%</span>
          </div>
          <input
            type="range"
            value={hebesatz}
            onChange={(e) => setHebesatz(Number(e.target.value))}
            className="w-full mt-3 accent-amber-500"
            min="200"
            max="600"
            step="5"
          />
          
          {/* Hebesatz-Presets */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Schnellauswahl:</p>
            <div className="flex flex-wrap gap-2">
              {HEBESATZ_PRESETS.slice(0, 6).map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setHebesatz(preset.satz)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    hebesatz === preset.satz
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.name} ({preset.satz}%)
                </button>
              ))}
            </div>
          </div>
          
          {hebesatz < 400 && (
            <p className="text-sm text-green-600 mt-2">
              ✅ Niedriger Hebesatz! Gewerbesteuer wird bei Personenunternehmen voll auf ESt angerechnet.
            </p>
          )}
          {hebesatz > 400 && rechtsform !== 'kapitalgesellschaft' && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Hebesatz über 400%: Gewerbesteuer wird nur teilweise auf ESt angerechnet.
            </p>
          )}
        </div>

        {/* Erweiterte Optionen */}
        <details className="mb-6">
          <summary className="cursor-pointer text-amber-600 font-medium text-sm hover:text-amber-700">
            Erweiterte Optionen (Hinzurechnungen/Kürzungen)
          </summary>
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-xl">
            {/* Hinzurechnungen */}
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium text-sm">Hinzurechnungen</span>
                <span className="text-xs text-gray-500 block mt-1">
                  z.B. 25% der Miet-/Pachtzinsen, 25% der Zinsen über 200.000 € Freibetrag
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={hinzurechnungen}
                  onChange={(e) => setHinzurechnungen(Math.max(0, Number(e.target.value)))}
                  className="w-full text-lg font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
                  min="0"
                  step="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>
            
            {/* Kürzungen */}
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium text-sm">Kürzungen</span>
                <span className="text-xs text-gray-500 block mt-1">
                  z.B. 1,2% des Einheitswerts von Grundbesitz
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={kuerzungen}
                  onChange={(e) => setKuerzungen(Math.max(0, Number(e.target.value)))}
                  className="w-full text-lg font-bold text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none"
                  min="0"
                  step="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>
          </div>
        </details>

        {/* ESt-Anrechnung (nur für Nicht-Kapitalgesellschaften) */}
        {rechtsform !== 'kapitalgesellschaft' && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl">
            <label className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                checked={istEinkommensteuerPflichtig}
                onChange={(e) => setIstEinkommensteuerPflichtig(e.target.checked)}
                className="w-5 h-5 rounded accent-amber-500"
              />
              <span className="text-gray-700 font-medium">ESt-Anrechnung berücksichtigen</span>
            </label>
            
            {istEinkommensteuerPflichtig && (
              <div>
                <label className="block mb-2">
                  <span className="text-gray-700 text-sm">Ihr persönlicher Grenzsteuersatz (ESt)</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    value={grenzsteuersatz}
                    onChange={(e) => setGrenzsteuersatz(Number(e.target.value))}
                    className="flex-1 accent-amber-500"
                    min="14"
                    max="45"
                    step="1"
                  />
                  <span className="text-lg font-bold text-amber-800 w-16 text-right">{grenzsteuersatz}%</span>
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  💡 Der Grenzsteuersatz bestimmt, wie viel ESt durch die Anrechnung gespart wird
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🏛️ Ihre Gewerbesteuer</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.gewerbesteuer)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          <p className="text-amber-100 mt-2 text-sm">
            Bei {hebesatz}% Hebesatz und {formatEuroRound(ergebnis.gewerbeertrag)} Gewerbeertrag
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Steuermessbetrag</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.steuermessbetrag)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Effektiver Steuersatz</span>
            <div className="text-xl font-bold">{formatProzent(ergebnis.nominalerSteuersatz)}</div>
          </div>
        </div>

        {rechtsform !== 'kapitalgesellschaft' && istEinkommensteuerPflichtig && ergebnis.estAnrechnung > 0 && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Nach ESt-Anrechnung (effektiv)</span>
              <span className="text-lg font-bold">{formatEuroRound(ergebnis.effektiveGewerbesteuer)}</span>
            </div>
            <p className="text-xs text-amber-100 mt-1">
              {formatEuroRound(ergebnis.estAnrechnung)} werden auf Ihre Einkommensteuer angerechnet
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          {/* Gewerbeertrag */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            1. Gewerbeertrag ermitteln
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gewinn aus Gewerbebetrieb</span>
            <span className="font-bold text-gray-900">{formatEuro(gewinn)}</span>
          </div>
          {hinzurechnungen > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-amber-600">
              <span>+ Hinzurechnungen</span>
              <span>{formatEuro(hinzurechnungen)}</span>
            </div>
          )}
          {kuerzungen > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− Kürzungen</span>
              <span>{formatEuro(kuerzungen)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">= Gewerbeertrag vor Freibetrag</span>
            <span className="text-gray-900">{formatEuro(ergebnis.gewerbeertragVorFreibetrag)}</span>
          </div>
          
          {ergebnis.freibetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− Freibetrag ({rechtsform === 'einzelunternehmer' ? 'Einzelunternehmer' : 'Personengesellschaft'})</span>
              <span>{formatEuro(ergebnis.freibetrag)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 bg-amber-50 -mx-6 px-6">
            <span className="font-medium text-amber-700">= Gewerbeertrag (gerundet)</span>
            <span className="font-bold text-amber-900">{formatEuro(ergebnis.gewerbeertragGerundet)}</span>
          </div>
          
          {/* Steuermessbetrag */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            2. Steuermessbetrag berechnen
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Gewerbeertrag × 3,5% (Steuermesszahl)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.gewerbeertragGerundet)} × 3,5%</span>
          </div>
          <div className="flex justify-between py-2 bg-amber-50 -mx-6 px-6">
            <span className="font-medium text-amber-700">= Steuermessbetrag</span>
            <span className="font-bold text-amber-900">{formatEuro(ergebnis.steuermessbetrag)}</span>
          </div>
          
          {/* Gewerbesteuer */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            3. Gewerbesteuer berechnen
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Steuermessbetrag × {hebesatz}% (Hebesatz)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.steuermessbetrag)} × {hebesatz}%</span>
          </div>
          <div className="flex justify-between py-2 bg-amber-100 -mx-6 px-6">
            <span className="font-bold text-amber-800">= Gewerbesteuer</span>
            <span className="font-bold text-2xl text-amber-900">{formatEuro(ergebnis.gewerbesteuer)}</span>
          </div>
          
          {/* ESt-Anrechnung */}
          {rechtsform !== 'kapitalgesellschaft' && istEinkommensteuerPflichtig && ergebnis.estAnrechnung > 0 && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                4. ESt-Anrechnung (§ 35 EStG)
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Max. anrechenbar (4 × Messbetrag)</span>
                <span className="text-gray-900">{formatEuro(ergebnis.estAnrechnungMax)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                <span>− Tatsächliche Anrechnung auf ESt</span>
                <span>{formatEuro(ergebnis.estAnrechnung)}</span>
              </div>
              <div className="flex justify-between py-2 bg-green-50 -mx-6 px-6 rounded-b-xl">
                <span className="font-medium text-green-700">= Effektive Gewerbesteuer-Belastung</span>
                <span className="font-bold text-green-900">{formatEuro(ergebnis.effektiveGewerbesteuer)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hebesatz-Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📍 Hebesatz-Vergleich</h3>
        
        <div className="space-y-3">
          {HEBESATZ_PRESETS.map((preset) => {
            const gewStBeiPreset = ergebnis.steuermessbetrag * (preset.satz / 100);
            const differenz = gewStBeiPreset - ergebnis.gewerbesteuer;
            const isAktuell = preset.satz === hebesatz;
            
            return (
              <div 
                key={preset.name}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isAktuell ? 'bg-amber-100 border-2 border-amber-300' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isAktuell ? 'text-amber-800' : 'text-gray-600'}`}>
                    {preset.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isAktuell ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {preset.satz}%
                  </span>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${isAktuell ? 'text-amber-900' : 'text-gray-800'}`}>
                    {formatEuroRound(gewStBeiPreset)}
                  </div>
                  {!isAktuell && (
                    <div className={`text-xs ${differenz > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {differenz > 0 ? '+' : ''}{formatEuroRound(differenz)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-4 bg-amber-50 rounded-xl">
          <p className="text-sm text-amber-800">
            💡 <strong>Einsparpotenzial:</strong> Zwischen dem niedrigsten (200%) und höchsten (900%) 
            Hebesatz liegt eine Differenz von {formatEuroRound(ergebnis.ersparnisPotenzial)} bei Ihrem Gewerbeertrag.
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Gewerbesteuer</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Steuermesszahl 3,5%:</strong> Der Gewerbeertrag wird mit 3,5% multipliziert</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Hebesatz:</strong> Die Gemeinde bestimmt den Hebesatz (mind. 200%)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Freibetrag 24.500 €:</strong> Nur für Einzelunternehmer und Personengesellschaften</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>ESt-Anrechnung:</strong> Max. das 4-fache des Steuermessbetrags wird auf die ESt angerechnet</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Betriebsausgabe:</strong> Die Gewerbesteuer ist keine Betriebsausgabe mehr (seit 2008)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Vorauszahlungen:</strong> Quartalsweise zum 15.02., 15.05., 15.08. und 15.11.</span>
          </li>
        </ul>
      </div>

      {/* Wer muss zahlen */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">👥 Wer muss Gewerbesteuer zahlen?</h3>
        <div className="space-y-3 text-sm text-amber-700">
          <p><strong>Gewerbesteuerpflichtig</strong> sind alle gewerblichen Unternehmen:</p>
          <ul className="space-y-1 pl-4">
            <li>• Einzelunternehmer mit Gewerbebetrieb</li>
            <li>• Personengesellschaften (GbR, OHG, KG)</li>
            <li>• Kapitalgesellschaften (GmbH, UG, AG)</li>
          </ul>
          <div className="bg-white/50 rounded-xl p-4 mt-3">
            <h4 className="font-semibold text-amber-800 mb-2">✅ Keine Gewerbesteuer zahlen:</h4>
            <ul className="space-y-1">
              <li>• Freiberufler (Ärzte, Anwälte, Architekten, etc.)</li>
              <li>• Land- und Forstwirte</li>
              <li>• Vermögensverwaltende Tätigkeiten</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Standortwahl:</strong> Der Hebesatz kann je nach Gemeinde stark variieren – Standortwahl kann tausende Euro sparen</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Hinzurechnungen beachten:</strong> Auch Zinsen, Mieten und Pachten werden teilweise hinzugerechnet</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>GmbH vs. Einzelunternehmen:</strong> GmbHs haben keinen Freibetrag, dafür Körperschaftsteuer von 15%</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Zerlegung:</strong> Bei mehreren Betriebsstätten wird die Gewerbesteuer auf die Gemeinden verteilt</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Gewerbesteuererklärung:</strong> Muss jährlich bis zum 31. Juli des Folgejahres abgegeben werden</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden</h3>
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="font-semibold text-amber-900">Finanzamt & Gemeinde</p>
            <p className="text-sm text-amber-700 mt-1">
              Das Finanzamt setzt den Steuermessbetrag fest, die Gemeinde erhebt die Gewerbesteuer.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Finanzamt-Hotline</p>
                <p className="text-gray-600">Ihr zuständiges Finanzamt</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">ELSTER Online</p>
                <a 
                  href="https://www.elster.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  elster.de →
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Benötigte Unterlagen</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Gewinnermittlung (EÜR oder Bilanz)</li>
                <li>• Gewerbesteuererklärung (Formular GewSt 1 A)</li>
                <li>• Ggf. Anlage für Hinzurechnungen/Kürzungen</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/gewstg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Gewerbesteuergesetz (GewStG) – Gesetze im Internet
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__35.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 35 EStG – Steuerermäßigung bei Einkünften aus Gewerbebetrieb
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Gewerbesteuer/gewerbesteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – Gewerbesteuer
          </a>
          <a 
            href="https://www.ihk.de/themen/steuern/gewerbesteuer"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            IHK – Informationen zur Gewerbesteuer
          </a>
          <a 
            href="https://www.destatis.de/DE/Themen/Staat/Steuern/Gewerbesteuer/_inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Statistisches Bundesamt – Gewerbesteuerstatistik
          </a>
        </div>
      </div>
    </div>
  );
}
