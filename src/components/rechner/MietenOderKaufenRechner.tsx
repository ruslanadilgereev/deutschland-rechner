import { useState, useEffect, useCallback } from 'react';
import RechnerFeedback from './RechnerFeedback';

interface JahresWert {
  jahr: number;
  vermoegenKauf: number;
  vermoegenMiete: number;
  differenz: number;
  immobilienwert: number;
  restschuld: number;
  eigenkapitalKauf: number;
  depotMiete: number;
}

interface Ergebnis {
  jahresWerte: JahresWert[];
  breakEvenJahr: number | null;
  endvermoegenKauf: number;
  endvermoegenMiete: number;
  vorteil: 'kaufen' | 'mieten' | 'gleich';
  vorteilBetrag: number;
  gesamtKostenKauf: number;
  gesamtKostenMiete: number;
  kaufnebenkosten: number;
  monatlicheRate: number;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
};

const formatPercent = (value: number): string => {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
};

export default function MietenOderKaufenRechner() {
  // Inputs - Immobilie
  const [kaufpreis, setKaufpreis] = useState<number>(400000);
  const [eigenkapital, setEigenkapital] = useState<number>(80000);
  const [zinssatz, setZinssatz] = useState<number>(3.5);
  const [tilgung, setTilgung] = useState<number>(2);
  const [kaufnebenkostenProzent, setKaufnebenkostenProzent] = useState<number>(12);
  
  // Inputs - Miete
  const [mieteKalt, setMieteKalt] = useState<number>(1200);
  const [nebenkosten, setNebenkosten] = useState<number>(200);
  
  // Inputs - Annahmen
  const [anlagehorizont, setAnlagehorizont] = useState<number>(20);
  const [wertsteigerung, setWertsteigerung] = useState<number>(2);
  const [mietsteigerung, setMietsteigerung] = useState<number>(2);
  const [instandhaltung, setInstandhaltung] = useState<number>(1.5);
  const [renditeAlternativ, setRenditeAlternativ] = useState<number>(6);
  
  // Ergebnis
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAnnahmen, setShowAnnahmen] = useState(false);

  const berechne = useCallback(() => {
    const jahresWerte: JahresWert[] = [];
    
    // Kaufnebenkosten (Grunderwerbsteuer, Notar, Makler)
    const kaufnebenkosten = kaufpreis * (kaufnebenkostenProzent / 100);
    const gesamtKaufpreis = kaufpreis + kaufnebenkosten;
    
    // Darlehenssumme
    const darlehen = gesamtKaufpreis - eigenkapital;
    
    // Monatliche Rate (Annuität)
    const jahreszins = zinssatz / 100;
    const jahresrate = darlehen * (jahreszins + tilgung / 100);
    const monatlicheRate = jahresrate / 12;
    
    // Monatliche Kosten als Eigentümer (ohne Tilgung - die ist Vermögensaufbau)
    // Anfängliche Instandhaltungskosten pro Jahr
    const instandhaltungJahr = kaufpreis * (instandhaltung / 100);
    
    // Tracking-Variablen
    let restschuld = darlehen;
    let immobilienwert = kaufpreis;
    let depotMiete = eigenkapital; // Mieter legt EK an
    let aktuelleMiete = mieteKalt;
    let kreditLaufzeit = 0;
    
    // Kosten-Tracking
    let gesamtKostenKauf = kaufnebenkosten;
    let gesamtKostenMiete = 0;
    
    let breakEvenJahr: number | null = null;
    
    for (let jahr = 1; jahr <= anlagehorizont; jahr++) {
      // === KAUFEN ===
      
      // Wertsteigerung der Immobilie
      immobilienwert *= (1 + wertsteigerung / 100);
      
      // Tilgung und Zinsen für dieses Jahr
      if (restschuld > 0) {
        const zinsenJahr = restschuld * jahreszins;
        const tilgungJahr = Math.min(jahresrate - zinsenJahr, restschuld);
        restschuld = Math.max(0, restschuld - tilgungJahr);
        kreditLaufzeit = jahr;
        
        gesamtKostenKauf += zinsenJahr; // Zinsen sind Kosten
      }
      
      // Instandhaltungskosten (steigen mit Immobilienwert)
      const aktuelleInstandhaltung = immobilienwert * (instandhaltung / 100);
      gesamtKostenKauf += aktuelleInstandhaltung;
      
      // Eigenkapital beim Kaufen = Immobilienwert - Restschuld
      const eigenkapitalKauf = immobilienwert - restschuld;
      
      // === MIETEN ===
      
      // Monatliche Kosten als Mieter
      const jahresMiete = aktuelleMiete * 12;
      gesamtKostenMiete += jahresMiete;
      
      // Differenz zwischen Kreditrate und Miete
      // Wenn Kreditrate > Miete, kann Mieter die Differenz zusätzlich sparen
      // Wenn Miete > Kreditrate, muss Käufer mehr zahlen (schon in Rate enthalten)
      
      // Käufer zahlt: Rate + Instandhaltung + Nebenkosten (ähnlich wie Mieter)
      // Mieter zahlt: Miete + Nebenkosten
      // Für Vergleichbarkeit: Beide zahlen gleiche Nebenkosten, ignorieren wir diese
      
      const monatlicheKostenKauf = monatlicheRate + aktuelleInstandhaltung / 12;
      const monatlicheKostenMiete = aktuelleMiete;
      
      // Wenn Mieter günstiger wohnt, kann er die Ersparnis anlegen
      const monatlicheErsparnis = Math.max(0, monatlicheKostenKauf - monatlicheKostenMiete);
      const jahresErsparnis = monatlicheErsparnis * 12;
      
      // Depot wächst durch Rendite + ggf. zusätzliche Sparrate
      depotMiete = depotMiete * (1 + renditeAlternativ / 100) + jahresErsparnis;
      
      // Mietsteigerung für nächstes Jahr
      aktuelleMiete *= (1 + mietsteigerung / 100);
      
      // Vermögen berechnen
      const vermoegenKauf = eigenkapitalKauf;
      const vermoegenMiete = depotMiete;
      const differenz = vermoegenKauf - vermoegenMiete;
      
      // Break-even prüfen
      if (breakEvenJahr === null && differenz > 0) {
        breakEvenJahr = jahr;
      }
      
      jahresWerte.push({
        jahr,
        vermoegenKauf,
        vermoegenMiete,
        differenz,
        immobilienwert,
        restschuld,
        eigenkapitalKauf,
        depotMiete
      });
    }
    
    const endvermoegenKauf = jahresWerte[jahresWerte.length - 1]?.vermoegenKauf || 0;
    const endvermoegenMiete = jahresWerte[jahresWerte.length - 1]?.vermoegenMiete || 0;
    const vorteilBetrag = Math.abs(endvermoegenKauf - endvermoegenMiete);
    
    let vorteil: 'kaufen' | 'mieten' | 'gleich';
    if (endvermoegenKauf > endvermoegenMiete * 1.01) {
      vorteil = 'kaufen';
    } else if (endvermoegenMiete > endvermoegenKauf * 1.01) {
      vorteil = 'mieten';
    } else {
      vorteil = 'gleich';
    }
    
    setErgebnis({
      jahresWerte,
      breakEvenJahr,
      endvermoegenKauf,
      endvermoegenMiete,
      vorteil,
      vorteilBetrag,
      gesamtKostenKauf,
      gesamtKostenMiete,
      kaufnebenkosten,
      monatlicheRate
    });
  }, [kaufpreis, eigenkapital, zinssatz, tilgung, kaufnebenkostenProzent, mieteKalt, nebenkosten, anlagehorizont, wertsteigerung, mietsteigerung, instandhaltung, renditeAlternativ]);

  useEffect(() => {
    berechne();
  }, [berechne]);

  // Max-Wert für Grafik
  const maxVermögen = ergebnis ? Math.max(
    ...ergebnis.jahresWerte.map(j => Math.max(j.vermoegenKauf, j.vermoegenMiete))
  ) : 0;

  return (
    <div className="space-y-6">
      <RechnerFeedback rechnerName="Mieten oder Kaufen Rechner" rechnerSlug="mieten-oder-kaufen-rechner" />

{/* Eingabebereich - Immobilie */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🏠 Immobilie kaufen</h2>
        
        <div className="space-y-4">
          {/* Kaufpreis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kaufpreis der Immobilie
            </label>
            <div className="relative">
              <input
                type="number"
                value={kaufpreis || ''}
                onChange={(e) => setKaufpreis(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="400000"
                min="0"
                step="10000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
          </div>

          {/* Eigenkapital */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eigenkapital
            </label>
            <div className="relative">
              <input
                type="number"
                value={eigenkapital || ''}
                onChange={(e) => setEigenkapital(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="80000"
                min="0"
                step="5000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {eigenkapital > 0 && kaufpreis > 0 && (
                <>Eigenkapitalquote: {((eigenkapital / kaufpreis) * 100).toFixed(1)}%</>
              )}
            </p>
          </div>

          {/* Kaufnebenkosten */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kaufnebenkosten: <span className="font-bold text-emerald-600">{formatPercent(kaufnebenkostenProzent)}</span>
            </label>
            <input
              type="range"
              min="8"
              max="16"
              step="0.5"
              value={kaufnebenkostenProzent}
              onChange={(e) => setKaufnebenkostenProzent(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>8% (ohne Makler)</span>
              <span>16% (mit Makler)</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              = {formatCurrency(kaufpreis * kaufnebenkostenProzent / 100)} (Grunderwerbsteuer + Notar + ggf. Makler)
            </p>
          </div>

          {/* Zinssatz */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zinssatz p.a.: <span className="font-bold text-emerald-600">{formatPercent(zinssatz)}</span>
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="0.1"
              value={zinssatz}
              onChange={(e) => setZinssatz(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>4% (aktuell)</span>
              <span>8%</span>
            </div>
          </div>

          {/* Tilgung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anfängliche Tilgung: <span className="font-bold text-emerald-600">{formatPercent(tilgung)}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={tilgung}
              onChange={(e) => setTilgung(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>2-3% (empfohlen)</span>
              <span>5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Eingabebereich - Miete */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🏢 Zur Miete wohnen</h2>
        
        <div className="space-y-4">
          {/* Kaltmiete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kaltmiete (vergleichbare Wohnung)
            </label>
            <div className="relative">
              <input
                type="number"
                value={mieteKalt || ''}
                onChange={(e) => setMieteKalt(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="1200"
                min="0"
                step="50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€/Monat</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Kaufpreis/Miete-Verhältnis: {mieteKalt > 0 ? (kaufpreis / (mieteKalt * 12)).toFixed(1) : '-'}x Jahresmiete
              {mieteKalt > 0 && kaufpreis / (mieteKalt * 12) > 25 && ' (teuer!)'}
              {mieteKalt > 0 && kaufpreis / (mieteKalt * 12) < 20 && ' (günstig!)'}
            </p>
          </div>
        </div>
      </div>

      {/* Erweiterte Annahmen (klappbar) */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <button
          onClick={() => setShowAnnahmen(!showAnnahmen)}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-700">⚙️ Erweiterte Annahmen</span>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${showAnnahmen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showAnnahmen && (
          <div className="p-6 space-y-4">
            {/* Anlagehorizont */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anlagehorizont: <span className="font-bold text-emerald-600">{anlagehorizont} Jahre</span>
              </label>
              <input
                type="range"
                min="5"
                max="40"
                value={anlagehorizont}
                onChange={(e) => setAnlagehorizont(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 Jahre</span>
                <span>20 Jahre</span>
                <span>40 Jahre</span>
              </div>
            </div>

            {/* Wertsteigerung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wertsteigerung Immobilie p.a.: <span className="font-bold text-emerald-600">{formatPercent(wertsteigerung)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={wertsteigerung}
                onChange={(e) => setWertsteigerung(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>2% (historisch)</span>
                <span>5%</span>
              </div>
            </div>

            {/* Mietsteigerung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mietsteigerung p.a.: <span className="font-bold text-emerald-600">{formatPercent(mietsteigerung)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={mietsteigerung}
                onChange={(e) => setMietsteigerung(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>2% (historisch)</span>
                <span>5%</span>
              </div>
            </div>

            {/* Instandhaltung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instandhaltungskosten p.a.: <span className="font-bold text-emerald-600">{formatPercent(instandhaltung)}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={instandhaltung}
                onChange={(e) => setInstandhaltung(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0,5%</span>
                <span>1,5% (Neubau)</span>
                <span>3% (Altbau)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                = {formatCurrency(kaufpreis * instandhaltung / 100)} pro Jahr
              </p>
            </div>

            {/* Alternative Rendite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rendite alternative Geldanlage: <span className="font-bold text-emerald-600">{formatPercent(renditeAlternativ)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={renditeAlternativ}
                onChange={(e) => setRenditeAlternativ(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0% (Sparbuch)</span>
                <span>6% (ETF)</span>
                <span>10%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Als Mieter legst du das Eigenkapital alternativ an
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Ergebnis */}
      {ergebnis && (
        <div className={`rounded-2xl shadow-lg p-6 text-white ${
          ergebnis.vorteil === 'kaufen' 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : ergebnis.vorteil === 'mieten'
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
            : 'bg-gradient-to-br from-gray-500 to-gray-600'
        }`}>
          <h3 className="text-lg font-medium opacity-90 mb-2">
            Ergebnis nach {anlagehorizont} Jahren
          </h3>
          
          <div className="text-center py-4">
            <div className="text-2xl font-bold mb-2">
              {ergebnis.vorteil === 'kaufen' && '🏠 Kaufen ist besser!'}
              {ergebnis.vorteil === 'mieten' && '🏢 Mieten ist besser!'}
              {ergebnis.vorteil === 'gleich' && '⚖️ Ungefähr gleich!'}
            </div>
            <div className="text-4xl font-bold">
              {ergebnis.vorteil !== 'gleich' && (
                <>+{formatCurrency(ergebnis.vorteilBetrag)}</>
              )}
            </div>
            <div className="opacity-80 text-sm mt-1">
              {ergebnis.vorteil === 'kaufen' && 'mehr Vermögen durch Kaufen'}
              {ergebnis.vorteil === 'mieten' && 'mehr Vermögen durch Mieten'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{formatCurrency(ergebnis.endvermoegenKauf)}</div>
              <div className="opacity-80 text-sm">Vermögen bei Kauf</div>
              <div className="opacity-60 text-xs mt-1">
                (Immobilienwert − Restschuld)
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{formatCurrency(ergebnis.endvermoegenMiete)}</div>
              <div className="opacity-80 text-sm">Vermögen bei Miete</div>
              <div className="opacity-60 text-xs mt-1">
                (Depot mit Eigenkapital)
              </div>
            </div>
          </div>

          {ergebnis.breakEvenJahr && (
            <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <span className="opacity-80">Break-even erreicht nach</span>
              <span className="text-2xl font-bold ml-2">{ergebnis.breakEvenJahr} Jahren</span>
            </div>
          )}

          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span>Monatliche Kreditrate:</span>
              <span className="font-medium">{formatCurrency(ergebnis.monatlicheRate)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>Kaufnebenkosten (einmalig):</span>
              <span className="font-medium">{formatCurrency(ergebnis.kaufnebenkosten)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Vermögenskurven-Grafik */}
      {ergebnis && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Vermögensentwicklung</h3>
          
          {/* Einfaches Balkendiagramm */}
          <div className="relative h-64 flex items-end gap-1">
            {ergebnis.jahresWerte.filter((_, i) => 
              // Bei langen Zeiträumen nur jeden x-ten Wert zeigen
              anlagehorizont <= 20 || i % Math.ceil(anlagehorizont / 20) === 0 || i === anlagehorizont - 1
            ).map((jw, index) => {
              const heightKauf = (jw.vermoegenKauf / maxVermögen) * 100;
              const heightMiete = (jw.vermoegenMiete / maxVermögen) * 100;
              
              return (
                <div key={jw.jahr} className="flex-1 flex flex-col items-center gap-1" title={`Jahr ${jw.jahr}`}>
                  <div className="flex gap-0.5 items-end h-52 w-full">
                    <div 
                      className="flex-1 bg-emerald-500 rounded-t transition-all duration-300"
                      style={{ height: `${heightKauf}%` }}
                    ></div>
                    <div 
                      className="flex-1 bg-blue-500 rounded-t transition-all duration-300"
                      style={{ height: `${heightMiete}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 -rotate-45 origin-top-left mt-2">
                    {jw.jahr}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legende */}
          <div className="flex justify-center gap-6 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span>Kaufen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Mieten</span>
            </div>
          </div>

          {/* Vermögensverlauf-Tabelle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2"
          >
            <span>Details anzeigen</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDetails && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Jahr</th>
                    <th className="text-right py-2 font-medium text-gray-600">Immobilienwert</th>
                    <th className="text-right py-2 font-medium text-gray-600">Restschuld</th>
                    <th className="text-right py-2 font-medium text-emerald-600">Vermögen Kauf</th>
                    <th className="text-right py-2 font-medium text-blue-600">Vermögen Miete</th>
                    <th className="text-right py-2 font-medium text-gray-600">Differenz</th>
                  </tr>
                </thead>
                <tbody>
                  {ergebnis.jahresWerte.filter((_, i) => 
                    i === 0 || i === 4 || i === 9 || i === 14 || i === 19 || i === anlagehorizont - 1 || i % 5 === 4
                  ).map((jw) => (
                    <tr key={jw.jahr} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 font-medium">{jw.jahr}</td>
                      <td className="text-right py-2">{formatCurrency(jw.immobilienwert)}</td>
                      <td className="text-right py-2 text-red-600">{formatCurrency(jw.restschuld)}</td>
                      <td className="text-right py-2 font-medium text-emerald-600">{formatCurrency(jw.vermoegenKauf)}</td>
                      <td className="text-right py-2 font-medium text-blue-600">{formatCurrency(jw.vermoegenMiete)}</td>
                      <td className={`text-right py-2 font-medium ${jw.differenz > 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {jw.differenz > 0 ? '+' : ''}{formatCurrency(jw.differenz)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Annahmen dokumentiert */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <h3 className="font-semibold text-emerald-800 mb-3">📋 Berechnungsgrundlagen</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>Kaufnebenkosten:</strong> Grunderwerbsteuer (3,5-6,5%), Notar (~1,5%), ggf. Makler (3-7%)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>Opportunitätskosten:</strong> Als Mieter wird das Eigenkapital am Aktienmarkt angelegt</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>Instandhaltung:</strong> Typisch 1-2% des Immobilienwerts pro Jahr (peterssche Formel)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>Spareffekt:</strong> Ist die Miete günstiger als die Kreditrate, wird die Differenz zusätzlich angelegt</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            <span><strong>Vereinfachungen:</strong> Steuern auf Kapitalerträge nicht berücksichtigt (wirken auf beide Seiten)</span>
          </li>
        </ul>
      </div>

      {/* Sensitivitätshinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-semibold text-amber-800 mb-3">⚠️ Das Ergebnis reagiert stark auf...</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">📊</span>
            <span><strong>Alternative Rendite:</strong> Je höher die ETF-Rendite, desto besser schneidet Mieten ab</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">🏠</span>
            <span><strong>Wertsteigerung:</strong> In Boom-Regionen steigen Immobilien stärker, Kaufen wird attraktiver</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">⏰</span>
            <span><strong>Anlagehorizont:</strong> Je länger, desto eher lohnt sich Kaufen (Kaufnebenkosten amortisieren sich)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">💰</span>
            <span><strong>Kaufpreis/Miete-Verhältnis:</strong> Über 25x Jahresmiete = tendenziell zu teuer zum Kaufen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">📈</span>
            <span><strong>Zinsniveau:</strong> Hohe Zinsen machen Kaufen teurer und Mieten attraktiver</span>
          </li>
        </ul>
        <p className="text-xs text-amber-600 mt-3">
          💡 Tipp: Variiere die Parameter und beobachte, wie sich das Ergebnis ändert!
        </p>
      </div>

      {/* Was nicht berücksichtigt wird */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">🚫 Nicht berücksichtigt (schwer quantifizierbar)</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span><strong>Flexibilität:</strong> Mieter können leichter umziehen (Jobwechsel, Familie)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span><strong>Sicherheit:</strong> Eigentum schützt vor Kündigung und Mieterhöhungen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span><strong>Gestaltungsfreiheit:</strong> Im Eigentum kann man frei renovieren</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span><strong>Mietausfallrisiko:</strong> Bei Eigentum keine Mietkosten (relevant für Altersvorsorge)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span><strong>Emotionaler Wert:</strong> "Das eigene Heim" hat für viele einen nicht-monetären Wert</span>
          </li>
        </ul>
      </div>

      {/* Weitere Rechner */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">🔗 Verwandte Rechner</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a 
            href="/kredit-rechner" 
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl">💳</span>
            <div>
              <div className="font-medium text-gray-800">Kredit-Rechner</div>
              <div className="text-sm text-gray-600">Kreditrate & Tilgungsplan</div>
            </div>
          </a>
          <a 
            href="/grunderwerbsteuer-rechner" 
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl">🏛️</span>
            <div>
              <div className="font-medium text-gray-800">Grunderwerbsteuer</div>
              <div className="text-sm text-gray-600">Je nach Bundesland</div>
            </div>
          </a>
          <a 
            href="/notarkosten-rechner" 
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl">📝</span>
            <div>
              <div className="font-medium text-gray-800">Notarkosten-Rechner</div>
              <div className="text-sm text-gray-600">Notar & Grundbuch</div>
            </div>
          </a>
          <a 
            href="/etf-sparplan-rechner" 
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-medium text-gray-800">ETF-Sparplan-Rechner</div>
              <div className="text-sm text-gray-600">Alternative Geldanlage</div>
            </div>
          </a>
        </div>
      </div>
{/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-700 mb-3">📚 Quellen & Methodik</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            <a href="https://www.immobilienscout24.de/wissen/kaufen/mieten-kaufen-rechner.html" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              ImmobilienScout24 – Mieten oder Kaufen?
            </a>
          </li>
          <li>
            <a href="https://www.finanztip.de/baufinanzierung/mieten-oder-kaufen/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              Finanztip – Mieten oder Kaufen Rechner
            </a>
          </li>
          <li>
            <a href="https://de.wikipedia.org/wiki/Peterssche_Formel" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              Wikipedia – Peterssche Formel (Instandhaltungskosten)
            </a>
          </li>
          <li>
            <a href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
              Bundesbank – Aktuelle Zinssätze
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Stand: Januar 2025. Alle Angaben ohne Gewähr. 
          Keine Finanzberatung – Ergebnisse dienen nur der Orientierung.
        </p>
      </div>
    </div>
  );
}
