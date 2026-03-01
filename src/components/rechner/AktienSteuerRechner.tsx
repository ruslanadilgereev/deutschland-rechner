import { useState, useMemo } from 'react';

/**
 * AKTIEN-STEUER-RECHNER 2026
 * 
 * Berechnet die Steuer auf Aktiengewinne (Veräußerungsgewinne) nach:
 * - §20 Abs. 2 EStG – Einkünfte aus der Veräußerung von Kapitalanlagen
 * - §32d EStG – Gesonderter Steuertarif für Einkünfte aus Kapitalvermögen
 * - §43a EStG – Bemessung der Kapitalertragsteuer
 * - Sparerpauschbetrag: 1.000€ (ledig) / 2.000€ (verheiratet)
 * 
 * Steuersätze 2026:
 * - Abgeltungsteuer: 25%
 * - Solidaritätszuschlag: 5,5% auf die Abgeltungsteuer
 * - Kirchensteuer: 8% (BY, BW) oder 9% (andere) – optional
 * 
 * Quellen:
 * - https://www.gesetze-im-internet.de/estg/__20.html
 * - https://www.gesetze-im-internet.de/estg/__32d.html
 * - https://www.gesetze-im-internet.de/estg/__43a.html
 * - https://www.bundesfinanzministerium.de
 */

// ============================================================================
// STEUERPARAMETER 2026
// ============================================================================

const ABGELTUNGSTEUER_SATZ = 0.25; // 25%
const SOLI_SATZ = 0.055; // 5,5% auf die Abgeltungsteuer

// Sparerpauschbetrag 2026 (§20 Abs. 9 EStG)
const SPARERPAUSCHBETRAG = {
  single: 1000,
  verheiratet: 2000,
};

// Kirchensteuer-Sätze nach Bundesland
const KIRCHENSTEUER_OPTIONEN = [
  { id: 'keine', label: 'Keine Kirchensteuer', satz: 0 },
  { id: '8', label: '8% (Bayern, Baden-Württemberg)', satz: 0.08 },
  { id: '9', label: '9% (alle anderen Bundesländer)', satz: 0.09 },
];

// ============================================================================
// KOMPONENTE
// ============================================================================

export default function AktienSteuerRechner() {
  // Eingaben für Aktienverkauf
  const [kaufpreis, setKaufpreis] = useState(5000);
  const [verkaufspreis, setVerkaufspreis] = useState(8000);
  const [kaufgebuehren, setKaufgebuehren] = useState(10);
  const [verkaufsgebuehren, setVerkaufsgebuehren] = useState(10);
  
  // Verluste aus anderen Aktienverkäufen (Verlusttopf)
  const [aktienverluste, setAktienverluste] = useState(0);
  
  // Bereits genutzter Sparerpauschbetrag
  const [genutzterPauschbetrag, setGenutzterPauschbetrag] = useState(0);
  
  // Persönliche Situation
  const [verheiratet, setVerheiratet] = useState(false);
  const [kirchensteuer, setKirchensteuer] = useState('keine');
  
  // Günstigerprüfung
  const [guenstigerpruefung, setGuenstigerpruefung] = useState(false);
  const [persoenlichSteuersatz, setPersoenlichSteuersatz] = useState(20);

  // Berechneter Sparerpauschbetrag
  const sparerpauschbetrag = verheiratet ? SPARERPAUSCHBETRAG.verheiratet : SPARERPAUSCHBETRAG.single;
  const verfuegbarerPauschbetrag = Math.max(0, sparerpauschbetrag - genutzterPauschbetrag);
  
  // Kirchensteuersatz
  const kirchensteuerSatz = KIRCHENSTEUER_OPTIONEN.find(k => k.id === kirchensteuer)?.satz || 0;

  const ergebnis = useMemo(() => {
    // 1. Gewinn/Verlust berechnen
    // Anschaffungskosten = Kaufpreis + Kaufgebühren
    const anschaffungskosten = kaufpreis + kaufgebuehren;
    // Veräußerungserlös = Verkaufspreis - Verkaufsgebühren
    const veraeusserungserloesNetto = verkaufspreis - verkaufsgebuehren;
    // Bruttogewinn vor Steuern
    const bruttogewinn = veraeusserungserloesNetto - anschaffungskosten;
    
    // Falls Verlust: keine Steuer
    if (bruttogewinn <= 0) {
      return {
        anschaffungskosten,
        veraeusserungserloesNetto,
        bruttogewinn,
        verlustverrechnung: 0,
        nachVerlust: 0,
        sparerpauschbetrag: 0,
        zuVersteuern: 0,
        abgeltungsteuer: 0,
        soli: 0,
        kirchensteuerBetrag: 0,
        steuerGesamt: 0,
        nettogewinn: bruttogewinn,
        effektiverSteuersatz: 0,
        istVerlust: bruttogewinn < 0,
        verlustVortragen: Math.abs(bruttogewinn),
      };
    }
    
    // 2. Verlustverrechnung (nur Aktienverluste mit Aktiengewinnen)
    // §20 Abs. 6 Satz 5 EStG: Aktien-Verluste nur mit Aktien-Gewinnen verrechenbar
    const verlustverrechnung = Math.min(aktienverluste, bruttogewinn);
    const nachVerlust = bruttogewinn - verlustverrechnung;
    
    // 3. Sparerpauschbetrag anwenden
    const genutzterPausch = Math.min(verfuegbarerPauschbetrag, nachVerlust);
    const zuVersteuern = Math.max(0, nachVerlust - genutzterPausch);
    
    // 4. Steuerberechnung
    let abgeltungsteuer: number;
    let soli: number;
    let kirchensteuerBetrag: number;
    
    if (guenstigerpruefung && persoenlichSteuersatz < 25) {
      // Günstigerprüfung: Persönlicher Steuersatz statt 25%
      abgeltungsteuer = zuVersteuern * (persoenlichSteuersatz / 100);
      soli = abgeltungsteuer * SOLI_SATZ;
      kirchensteuerBetrag = kirchensteuerSatz > 0 ? abgeltungsteuer * kirchensteuerSatz : 0;
    } else {
      // Standard: Abgeltungsteuer 25%
      if (kirchensteuerSatz > 0) {
        // Bei Kirchensteuer: ermäßigter Satz durch Kirchensteuer-Abzug
        // Formel: 25% / (1 + Kirchensteuersatz)
        const modifizierterSatz = ABGELTUNGSTEUER_SATZ / (1 + kirchensteuerSatz);
        abgeltungsteuer = zuVersteuern * modifizierterSatz;
        kirchensteuerBetrag = abgeltungsteuer * kirchensteuerSatz;
      } else {
        abgeltungsteuer = zuVersteuern * ABGELTUNGSTEUER_SATZ;
        kirchensteuerBetrag = 0;
      }
      soli = abgeltungsteuer * SOLI_SATZ;
    }
    
    // Runden auf 2 Dezimalstellen
    abgeltungsteuer = Math.round(abgeltungsteuer * 100) / 100;
    soli = Math.round(soli * 100) / 100;
    kirchensteuerBetrag = Math.round(kirchensteuerBetrag * 100) / 100;
    
    const steuerGesamt = abgeltungsteuer + soli + kirchensteuerBetrag;
    
    // 5. Nettogewinn
    const nettogewinn = bruttogewinn - steuerGesamt;
    
    // 6. Effektiver Steuersatz (bezogen auf Bruttogewinn)
    const effektiverSteuersatz = bruttogewinn > 0 ? (steuerGesamt / bruttogewinn) * 100 : 0;
    
    return {
      anschaffungskosten,
      veraeusserungserloesNetto,
      bruttogewinn,
      verlustverrechnung,
      nachVerlust,
      sparerpauschbetrag: genutzterPausch,
      zuVersteuern,
      abgeltungsteuer,
      soli,
      kirchensteuerBetrag,
      steuerGesamt,
      nettogewinn: Math.round(nettogewinn * 100) / 100,
      effektiverSteuersatz,
      istVerlust: false,
      verlustVortragen: 0,
    };
  }, [
    kaufpreis, verkaufspreis, kaufgebuehren, verkaufsgebuehren,
    aktienverluste, verfuegbarerPauschbetrag, kirchensteuerSatz,
    guenstigerpruefung, persoenlichSteuersatz
  ]);

  // Formatierungsfunktionen
  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Aktienverkauf eingeben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📈</span> Aktienverkauf
        </h3>
        
        <div className="space-y-4">
          {/* Kaufpreis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kaufpreis (Anschaffungskosten)
            </label>
            <div className="relative">
              <input
                type="number"
                value={kaufpreis}
                onChange={(e) => setKaufpreis(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                min="0"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <input
              type="range"
              value={kaufpreis}
              onChange={(e) => setKaufpreis(Number(e.target.value))}
              className="w-full mt-2 accent-green-500"
              min="0"
              max="100000"
              step="500"
            />
          </div>
          
          {/* Verkaufspreis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verkaufspreis (Veräußerungserlös)
            </label>
            <div className="relative">
              <input
                type="number"
                value={verkaufspreis}
                onChange={(e) => setVerkaufspreis(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                min="0"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <input
              type="range"
              value={verkaufspreis}
              onChange={(e) => setVerkaufspreis(Number(e.target.value))}
              className="w-full mt-2 accent-green-500"
              min="0"
              max="100000"
              step="500"
            />
          </div>
          
          {/* Gebühren */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kaufgebühren (Ordergebühr)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={kaufgebuehren}
                  onChange={(e) => setKaufgebuehren(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                  min="0"
                  step="1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verkaufsgebühren
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={verkaufsgebuehren}
                  onChange={(e) => setVerkaufsgebuehren(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                  min="0"
                  step="1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
          </div>
          
          {/* Quick-Gewinn-Anzeige */}
          <div className={`p-4 rounded-xl ${
            ergebnis.bruttogewinn > 0 
              ? 'bg-green-50 border border-green-200' 
              : ergebnis.bruttogewinn < 0 
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`font-medium ${
                ergebnis.bruttogewinn > 0 ? 'text-green-700' : ergebnis.bruttogewinn < 0 ? 'text-red-700' : 'text-gray-700'
              }`}>
                {ergebnis.bruttogewinn > 0 ? '📈 Kursgewinn' : ergebnis.bruttogewinn < 0 ? '📉 Kursverlust' : 'Kein Gewinn/Verlust'}
              </span>
              <span className={`text-xl font-bold ${
                ergebnis.bruttogewinn > 0 ? 'text-green-600' : ergebnis.bruttogewinn < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {ergebnis.bruttogewinn >= 0 ? '+' : ''}{formatEuro(ergebnis.bruttogewinn)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Rendite: {kaufpreis > 0 ? ((ergebnis.bruttogewinn / kaufpreis) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Verlustverrechnung & Sparerpauschbetrag */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span> Freibeträge & Verluste
        </h3>
        
        <div className="space-y-4">
          {/* Familienstand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Familienstand</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setVerheiratet(false)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  !verheiratet
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ledig (1.000€ Freibetrag)
              </button>
              <button
                onClick={() => setVerheiratet(true)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  verheiratet
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Verheiratet (2.000€ Freibetrag)
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Genutzter Sparerpauschbetrag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bereits genutzter Pauschbetrag
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={genutzterPauschbetrag}
                  onChange={(e) => setGenutzterPauschbetrag(Math.min(sparerpauschbetrag, Math.max(0, Number(e.target.value))))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                  min="0"
                  max={sparerpauschbetrag}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Verfügbar: {formatEuro(verfuegbarerPauschbetrag)} von {formatEuro(sparerpauschbetrag)}
              </p>
            </div>
            
            {/* Aktienverluste */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aktienverluste (Verlusttopf)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={aktienverluste}
                  onChange={(e) => setAktienverluste(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Nur Aktien-Verluste möglich!
              </p>
            </div>
          </div>
          
          {/* Info zur Verlustverrechnung */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <strong>⚠️ Aktien-Verlustverrechnung:</strong> Verluste aus Aktienverkäufen können nur mit Gewinnen 
            aus Aktienverkäufen verrechnet werden – nicht mit Zinsen, Dividenden oder Fondsgewinnen (§20 Abs. 6 Satz 5 EStG).
          </div>
        </div>
      </div>

      {/* Kirchensteuer & Günstigerprüfung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">⛪</span> Kirchensteuer & Optionen
        </h3>
        
        <div className="space-y-4">
          {/* Kirchensteuer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kirchensteuerpflicht</label>
            <div className="space-y-2">
              {KIRCHENSTEUER_OPTIONEN.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    kirchensteuer === option.id
                      ? 'bg-green-50 border-2 border-green-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="kirchensteuer"
                    value={option.id}
                    checked={kirchensteuer === option.id}
                    onChange={() => setKirchensteuer(option.id)}
                    className="w-4 h-4 text-green-500 focus:ring-green-500"
                  />
                  <span className={`font-medium ${kirchensteuer === option.id ? 'text-green-700' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Günstigerprüfung */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={guenstigerpruefung}
                onChange={(e) => setGuenstigerpruefung(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-blue-400 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-blue-800">Günstigerprüfung (§32d Abs. 6 EStG)</span>
                <p className="text-sm text-blue-600 mt-1">
                  Falls dein persönlicher Einkommensteuersatz unter 25% liegt, 
                  kannst du diesen statt der Abgeltungsteuer beantragen.
                </p>
              </div>
            </label>
            
            {guenstigerpruefung && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Dein persönlicher Grenzsteuersatz (ca.)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="45"
                    step="1"
                    value={persoenlichSteuersatz}
                    onChange={(e) => setPersoenlichSteuersatz(Number(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="w-16 text-center font-bold text-blue-800 bg-blue-100 py-1 rounded-lg">
                    {persoenlichSteuersatz}%
                  </span>
                </div>
                {persoenlichSteuersatz < 25 ? (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    ✅ Günstigerprüfung lohnt sich! Du sparst {(25 - persoenlichSteuersatz).toFixed(0)} Prozentpunkte.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    Die Abgeltungsteuer (25%) ist günstiger – kein Antrag nötig.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ergebnis-Box */}
      {ergebnis.istVerlust ? (
        // Verlust-Anzeige
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">📉 Verlust – Keine Steuer</h3>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuro(ergebnis.verlustVortragen)}</span>
            </div>
            <p className="text-red-100 mt-2">
              Verlust zum Vortragen in den Aktienverlust-Topf
            </p>
          </div>
          
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-white/90">
              💡 Dieser Verlust kann mit zukünftigen <strong>Aktiengewinnen</strong> verrechnet werden 
              und reduziert dann deine Steuerlast.
            </p>
          </div>
        </div>
      ) : (
        // Gewinn-Anzeige
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">📈 Steuer auf Aktiengewinn</h3>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuro(ergebnis.steuerGesamt)}</span>
            </div>
            <p className="text-green-100 mt-2">
              Abgeltungsteuer inkl. Soli{ergebnis.kirchensteuerBetrag > 0 ? ' & Kirchensteuer' : ''}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-green-200 text-xs block">Bruttogewinn</span>
              <span className="text-xl font-bold">{formatEuro(ergebnis.bruttogewinn)}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-green-200 text-xs block">Nettogewinn</span>
              <span className="text-xl font-bold">{formatEuro(ergebnis.nettogewinn)}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm sm:col-span-1 col-span-2">
              <span className="text-green-200 text-xs block">Effektiver Steuersatz</span>
              <span className="text-xl font-bold">{formatProzent(ergebnis.effektiverSteuersatz)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Detaillierte Berechnung */}
      {!ergebnis.istVerlust && ergebnis.bruttogewinn > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
          
          <div className="space-y-3 text-sm">
            {/* Verkauf */}
            <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
              Schritt 1: Gewinnermittlung
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Verkaufspreis</span>
              <span className="font-medium text-gray-900">{formatEuro(verkaufspreis)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">./. Verkaufsgebühren</span>
              <span className="text-red-600">− {formatEuro(verkaufsgebuehren)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 bg-gray-50 -mx-6 px-6">
              <span className="text-gray-600">= Veräußerungserlös (netto)</span>
              <span className="font-medium text-gray-900">{formatEuro(ergebnis.veraeusserungserloesNetto)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">./. Kaufpreis + Kaufgebühren</span>
              <span className="text-red-600">− {formatEuro(ergebnis.anschaffungskosten)}</span>
            </div>
            <div className="flex justify-between py-2 bg-green-50 -mx-6 px-6">
              <span className="font-medium text-green-800">= Bruttogewinn</span>
              <span className="font-bold text-green-600">{formatEuro(ergebnis.bruttogewinn)}</span>
            </div>
            
            {/* Abzüge */}
            <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
              Schritt 2: Freibeträge anwenden
            </div>
            
            {ergebnis.verlustverrechnung > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">./. Verlustverrechnung</span>
                <span className="text-orange-600">− {formatEuro(ergebnis.verlustverrechnung)}</span>
              </div>
            )}
            
            {ergebnis.sparerpauschbetrag > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">./. Sparerpauschbetrag</span>
                <span className="text-green-600">− {formatEuro(ergebnis.sparerpauschbetrag)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 bg-blue-50 -mx-6 px-6">
              <span className="font-medium text-blue-800">= Zu versteuern</span>
              <span className="font-bold text-blue-600">{formatEuro(ergebnis.zuVersteuern)}</span>
            </div>
            
            {/* Steuerberechnung */}
            <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
              Schritt 3: Steuerberechnung
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">
                {guenstigerpruefung && persoenlichSteuersatz < 25 
                  ? `Einkommensteuer (${persoenlichSteuersatz}%)`
                  : kirchensteuerSatz > 0 
                    ? `Abgeltungsteuer (ermäßigt: ${(ABGELTUNGSTEUER_SATZ / (1 + kirchensteuerSatz) * 100).toFixed(2)}%)`
                    : 'Abgeltungsteuer (25%)'
                }
              </span>
              <span className="font-medium text-gray-900">{formatEuro(ergebnis.abgeltungsteuer)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">+ Solidaritätszuschlag (5,5%)</span>
              <span className="font-medium text-gray-900">{formatEuro(ergebnis.soli)}</span>
            </div>
            {ergebnis.kirchensteuerBetrag > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">+ Kirchensteuer ({(kirchensteuerSatz * 100).toFixed(0)}%)</span>
                <span className="font-medium text-gray-900">{formatEuro(ergebnis.kirchensteuerBetrag)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-3 bg-red-50 -mx-6 px-6 border-t-2 border-red-200">
              <span className="font-bold text-red-800">= Steuer gesamt</span>
              <span className="font-bold text-red-600 text-xl">{formatEuro(ergebnis.steuerGesamt)}</span>
            </div>
            
            <div className="flex justify-between py-3 bg-green-100 -mx-6 px-6 rounded-b-2xl">
              <span className="font-bold text-green-800">Nettogewinn (nach Steuern)</span>
              <span className="font-bold text-green-600 text-xl">{formatEuro(ergebnis.nettogewinn)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Steuerübersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💡 So funktioniert die Aktiensteuer</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <span className="text-3xl font-bold text-blue-600">25%</span>
              <p className="text-sm text-blue-700 mt-1">Abgeltungsteuer</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl text-center">
              <span className="text-3xl font-bold text-yellow-600">+ 5,5%</span>
              <p className="text-sm text-yellow-700 mt-1">Soli (auf AbgSt)</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <span className="text-3xl font-bold text-purple-600">+ 8-9%</span>
              <p className="text-sm text-purple-700 mt-1">Kirchensteuer (opt.)</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p className="flex gap-2">
              <span>✓</span>
              <span><strong>Sparerpauschbetrag:</strong> {formatEuro(SPARERPAUSCHBETRAG.single)} (ledig) / {formatEuro(SPARERPAUSCHBETRAG.verheiratet)} (verheiratet) bleiben steuerfrei</span>
            </p>
            <p className="flex gap-2">
              <span>✓</span>
              <span><strong>Effektiver Steuersatz:</strong> ca. 26,375% (ohne KiSt) oder ca. 27,8-28% (mit KiSt)</span>
            </p>
            <p className="flex gap-2">
              <span>✓</span>
              <span><strong>Freistellungsauftrag:</strong> Bei deiner Bank erteilen, um Pauschbetrag automatisch zu nutzen</span>
            </p>
            <p className="flex gap-2">
              <span>✓</span>
              <span><strong>FIFO-Prinzip:</strong> Zuerst gekaufte Aktien werden zuerst verkauft</span>
            </p>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Altbestand vor 2009:</strong> Aktien, die vor dem 1.1.2009 gekauft wurden, sind beim Verkauf steuerfrei (Bestandsschutz)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Aktien vs. Fonds:</strong> Für Aktienfonds gilt die Teilfreistellung (30% steuerfrei) – nutze dafür unseren Kapitalertragsteuer-Rechner</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Verlustverrechnung:</strong> Aktienverluste können nur mit Aktiengewinnen verrechnet werden (seit 2009)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Steuerbescheinigung:</strong> Deine Bank erstellt eine Jahressteuerbescheinigung für die Steuererklärung</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Ausländische Aktien:</strong> Quellensteuer kann unter bestimmten Voraussetzungen angerechnet werden</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörden */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stellen & Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🏦</span>
            <div>
              <p className="font-medium text-gray-800">Depotbank / Broker</p>
              <p className="text-sm text-gray-500">Freistellungsauftrag & Steuerbescheinigung</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">ELSTER Online</p>
              <a 
                href="https://www.elster.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Anlage KAP ausfüllen →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🧮</span>
            <div>
              <p className="font-medium text-gray-800">BMF Steuerrechner</p>
              <a 
                href="https://www.bmf-steuerrechner.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                bmf-steuerrechner.de →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Finanzamt</p>
              <p className="text-sm text-gray-500">Bei komplexen Fragen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__20.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §20 EStG – Einkünfte aus Kapitalvermögen
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__32d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §32d EStG – Gesonderter Steuertarif (Abgeltungsteuer)
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__43a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §43a EStG – Bemessung der Kapitalertragsteuer
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Content/DE/FAQ/Steuern/Kapitalertragsteuer/kapitalertragsteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – FAQ zur Kapitalertragsteuer
          </a>
          <a 
            href="https://www.bzst.de/DE/Privatpersonen/Kapitalertraege/kapitalertraege_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BZSt – Kapitalerträge & Abzugsteuer
          </a>
        </div>
      </div>
    </div>
  );
}
