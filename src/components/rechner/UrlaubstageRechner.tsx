import { useState, useMemo } from 'react';

// Urlaubsanspruch-Berechnung nach Bundesurlaubsgesetz (BUrlG)
// Quelle: https://www.gesetze-im-internet.de/burlg/

// Gesetzlicher Mindesturlaub (§ 3 BUrlG)
const GESETZLICHER_MINDESTURLAUB = {
  bei6Tagen: 24, // 24 Werktage bei 6-Tage-Woche
  bei5Tagen: 20, // entspricht 20 Arbeitstagen bei 5-Tage-Woche
};

// Wartezeit für vollen Urlaubsanspruch (§ 4 BUrlG)
const WARTEZEIT_MONATE = 6;

// Monatliche Urlaubsentstehung (§ 5 BUrlG)
// 1/12 des Jahresurlaubs pro vollem Monat

interface Ergebnis {
  jahresurlaub: number;
  urlaubBeiArbeitgeber: number;
  teilurlaub: number;
  anteilMonate: number;
  gesetzlicherAnspruch: number;
  vertraglichBesser: boolean;
  istTeilzeit: boolean;
  vollzeitVergleich: number;
  proMonat: number;
  hinweise: string[];
}

export default function UrlaubstageRechner() {
  // Grunddaten
  const [arbeitstageProWoche, setArbeitstageProWoche] = useState(5);
  const [vertraglicheUrlaubstage, setVertraglicheUrlaubstage] = useState(30);
  
  // Szenario-Auswahl
  const [szenario, setSzenario] = useState<'jahresurlaub' | 'neuer-job' | 'kuendigung' | 'teilzeit'>('jahresurlaub');
  
  // Für Jobwechsel/Kündigung
  const [eintrittMonat, setEintrittMonat] = useState(1);
  const [austrittsMonat, setAustrittsMonat] = useState(12);
  
  // Für Teilzeit-Berechnung
  const [teilzeitTageProWoche, setTeilzeitTageProWoche] = useState(3);
  const [vollzeitUrlaubstage, setVollzeitUrlaubstage] = useState(30);
  
  // Bereits genommener Urlaub
  const [bereitsGenommen, setBereitsGenommen] = useState(0);
  
  // Resturlaub vom Vorjahr
  const [resturlaubVorjahr, setResturlaubVorjahr] = useState(0);

  const ergebnis = useMemo<Ergebnis>(() => {
    const hinweise: string[] = [];
    
    // Gesetzlicher Mindesturlaub berechnen
    const gesetzlicherAnspruch = Math.round((GESETZLICHER_MINDESTURLAUB.bei6Tagen / 6) * arbeitstageProWoche);
    
    // Prüfen ob vertraglicher Urlaub besser als gesetzlicher ist
    const vertraglichBesser = vertraglicheUrlaubstage > gesetzlicherAnspruch;
    
    let jahresurlaub = vertraglicheUrlaubstage;
    let urlaubBeiArbeitgeber = vertraglicheUrlaubstage;
    let teilurlaub = 0;
    let anteilMonate = 12;
    let istTeilzeit = false;
    let vollzeitVergleich = vertraglicheUrlaubstage;
    
    switch (szenario) {
      case 'jahresurlaub': {
        // Einfacher Fall: ganzes Jahr beim gleichen Arbeitgeber
        jahresurlaub = vertraglicheUrlaubstage + resturlaubVorjahr;
        urlaubBeiArbeitgeber = jahresurlaub;
        anteilMonate = 12;
        
        if (resturlaubVorjahr > 0) {
          hinweise.push(`Resturlaub aus dem Vorjahr (${resturlaubVorjahr} Tage) muss bis 31. März genommen werden (§ 7 Abs. 3 BUrlG)`);
        }
        break;
      }
      
      case 'neuer-job': {
        // Neuer Job: Teilurlaubsanspruch berechnen (§ 5 BUrlG)
        const monateImBetrieb = 12 - eintrittMonat + 1;
        anteilMonate = monateImBetrieb;
        
        // Voller Anspruch nur nach 6 Monaten Wartezeit (§ 4 BUrlG)
        if (monateImBetrieb >= WARTEZEIT_MONATE) {
          // Nach Wartezeit: voller Jahresurlaub anteilig
          urlaubBeiArbeitgeber = Math.round((vertraglicheUrlaubstage / 12) * monateImBetrieb * 10) / 10;
          hinweise.push('Nach 6 Monaten Wartezeit besteht voller Urlaubsanspruch');
        } else {
          // Vor Wartezeit: 1/12 pro Monat
          urlaubBeiArbeitgeber = Math.round((vertraglicheUrlaubstage / 12) * monateImBetrieb * 10) / 10;
          teilurlaub = urlaubBeiArbeitgeber;
          hinweise.push('In den ersten 6 Monaten entsteht anteiliger Urlaub (1/12 pro Monat)');
        }
        
        hinweise.push(`Urlaub beim vorherigen Arbeitgeber wird angerechnet (§ 6 BUrlG) – lassen Sie sich eine Urlaubsbescheinigung geben!`);
        break;
      }
      
      case 'kuendigung': {
        // Kündigung während des Jahres
        const monateImBetrieb = austrittsMonat;
        anteilMonate = monateImBetrieb;
        
        // Wichtig: § 5 BUrlG - Bruchteile von mindestens 0,5 werden aufgerundet
        const rohAnspruch = (vertraglicheUrlaubstage / 12) * monateImBetrieb;
        
        // Bei Ausscheiden in der ersten Jahreshälfte: nur anteiliger Anspruch
        // Bei Ausscheiden in der zweiten Jahreshälfte: voller Anspruch wenn mind. 6 Monate im Betrieb
        if (austrittsMonat <= 6) {
          urlaubBeiArbeitgeber = Math.ceil(rohAnspruch * 2) / 2; // Auf 0,5 aufrunden
          hinweise.push('Bei Austritt in der ersten Jahreshälfte: anteiliger Urlaubsanspruch');
        } else {
          // Nach dem 30.06.: voller Jahresurlaubsanspruch
          urlaubBeiArbeitgeber = vertraglicheUrlaubstage;
          hinweise.push('Bei Austritt nach dem 30.06.: Anspruch auf vollen Jahresurlaub');
        }
        
        // Resturlaub addieren
        urlaubBeiArbeitgeber += resturlaubVorjahr;
        
        if (bereitsGenommen > urlaubBeiArbeitgeber) {
          hinweise.push(`⚠️ Sie haben mehr Urlaub genommen als Ihnen zusteht – Rückforderung durch AG möglich`);
        }
        break;
      }
      
      case 'teilzeit': {
        // Teilzeit-Urlaubsberechnung
        istTeilzeit = true;
        vollzeitVergleich = vollzeitUrlaubstage;
        
        // Formel: (Urlaubstage Vollzeit / Arbeitstage Vollzeit) × Arbeitstage Teilzeit
        const vollzeitTage = 5; // Standard Vollzeit
        jahresurlaub = Math.round((vollzeitUrlaubstage / vollzeitTage) * teilzeitTageProWoche);
        urlaubBeiArbeitgeber = jahresurlaub + resturlaubVorjahr;
        
        // Gesetzlicher Anspruch für Teilzeit
        const gesetzlichTeilzeit = Math.round((GESETZLICHER_MINDESTURLAUB.bei5Tagen / vollzeitTage) * teilzeitTageProWoche);
        
        hinweise.push(`Bei ${teilzeitTageProWoche} Arbeitstagen/Woche entspricht ein Urlaubstag einem vollen freien Tag`);
        hinweise.push(`Gesetzlicher Mindesturlaub bei Teilzeit: ${gesetzlichTeilzeit} Tage`);
        
        // Vergleich mit Vollzeit (in Wochen)
        const urlaubsWochenVollzeit = vollzeitUrlaubstage / vollzeitTage;
        const urlaubsWochenTeilzeit = jahresurlaub / teilzeitTageProWoche;
        
        if (Math.abs(urlaubsWochenVollzeit - urlaubsWochenTeilzeit) < 0.1) {
          hinweise.push('✓ Urlaubswochen entsprechen der Vollzeit-Regelung (Gleichbehandlung)');
        }
        break;
      }
    }
    
    // Pro Monat berechnen
    const proMonat = Math.round((vertraglicheUrlaubstage / 12) * 10) / 10;
    
    return {
      jahresurlaub: szenario === 'teilzeit' ? jahresurlaub : vertraglicheUrlaubstage,
      urlaubBeiArbeitgeber,
      teilurlaub,
      anteilMonate,
      gesetzlicherAnspruch,
      vertraglichBesser,
      istTeilzeit,
      vollzeitVergleich,
      proMonat,
      hinweise,
    };
  }, [szenario, arbeitstageProWoche, vertraglicheUrlaubstage, eintrittMonat, austrittsMonat, 
      teilzeitTageProWoche, vollzeitUrlaubstage, bereitsGenommen, resturlaubVorjahr]);

  const formatTage = (n: number) => {
    if (n === 1) return '1 Tag';
    const rounded = Math.round(n * 10) / 10;
    return rounded % 1 === 0 ? `${rounded} Tage` : `${rounded.toFixed(1)} Tage`;
  };

  const monate = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Szenario-Auswahl */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Was möchten Sie berechnen?</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSzenario('jahresurlaub')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                szenario === 'jahresurlaub'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg block">📅</span>
              <span className="text-sm">Jahresurlaub</span>
            </button>
            <button
              onClick={() => setSzenario('neuer-job')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                szenario === 'neuer-job'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg block">🆕</span>
              <span className="text-sm">Neuer Job</span>
            </button>
            <button
              onClick={() => setSzenario('kuendigung')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                szenario === 'kuendigung'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg block">👋</span>
              <span className="text-sm">Kündigung</span>
            </button>
            <button
              onClick={() => setSzenario('teilzeit')}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                szenario === 'teilzeit'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg block">⏰</span>
              <span className="text-sm">Teilzeit</span>
            </button>
          </div>
        </div>

        {/* Basis-Einstellungen */}
        {szenario !== 'teilzeit' && (
          <>
            {/* Arbeitstage pro Woche */}
            <div className="mb-6">
              <label className="block mb-3">
                <span className="text-gray-700 font-medium">Arbeitstage pro Woche</span>
                <span className="text-xs text-gray-500 block mt-1">Wie viele Tage arbeiten Sie?</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[4, 5, 6].map((tage) => (
                  <button
                    key={tage}
                    onClick={() => setArbeitstageProWoche(tage)}
                    className={`py-4 px-4 rounded-xl text-center transition-all ${
                      arbeitstageProWoche === tage
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-2xl font-bold">{tage}</span>
                    <span className="text-xs block mt-1">Tage</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vertragliche Urlaubstage */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Vertragliche Urlaubstage pro Jahr</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Laut Arbeitsvertrag (gesetzl. Minimum: {Math.round((GESETZLICHER_MINDESTURLAUB.bei6Tagen / 6) * arbeitstageProWoche)} Tage)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={vertraglicheUrlaubstage}
                  onChange={(e) => setVertraglicheUrlaubstage(Math.max(0, Number(e.target.value)))}
                  className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                  min="20"
                  max="50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">Tage</span>
              </div>
              <input
                type="range"
                value={vertraglicheUrlaubstage}
                onChange={(e) => setVertraglicheUrlaubstage(Number(e.target.value))}
                className="w-full mt-3 accent-green-500"
                min="20"
                max="40"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>20 (Minimum)</span>
                <span>30 (üblich)</span>
                <span>40</span>
              </div>
            </div>
          </>
        )}

        {/* Szenario-spezifische Felder */}
        {szenario === 'neuer-job' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Eintrittsmonat</span>
              <span className="text-xs text-gray-500 block mt-1">Wann haben Sie angefangen?</span>
            </label>
            <select
              value={eintrittMonat}
              onChange={(e) => setEintrittMonat(Number(e.target.value))}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none bg-white"
            >
              {monate.map((monat, i) => (
                <option key={i} value={i + 1}>{monat}</option>
              ))}
            </select>
          </div>
        )}

        {szenario === 'kuendigung' && (
          <>
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Austrittsmonat</span>
                <span className="text-xs text-gray-500 block mt-1">Wann ist Ihr letzter Arbeitstag?</span>
              </label>
              <select
                value={austrittsMonat}
                onChange={(e) => setAustrittsMonat(Number(e.target.value))}
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none bg-white"
              >
                {monate.map((monat, i) => (
                  <option key={i} value={i + 1}>{monat}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Bereits genommener Urlaub</span>
                <span className="text-xs text-gray-500 block mt-1">Wie viele Tage haben Sie dieses Jahr bereits genommen?</span>
              </label>
              <input
                type="number"
                value={bereitsGenommen}
                onChange={(e) => setBereitsGenommen(Math.max(0, Number(e.target.value)))}
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none text-center text-xl font-bold"
                min="0"
                max="50"
              />
            </div>
          </>
        )}

        {szenario === 'teilzeit' && (
          <>
            <div className="mb-6">
              <label className="block mb-3">
                <span className="text-gray-700 font-medium">Arbeitstage pro Woche (Teilzeit)</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((tage) => (
                  <button
                    key={tage}
                    onClick={() => setTeilzeitTageProWoche(tage)}
                    className={`py-4 px-2 rounded-xl text-center transition-all ${
                      teilzeitTageProWoche === tage
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-xl font-bold">{tage}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Urlaubstage bei Vollzeit (5 Tage/Woche)</span>
                <span className="text-xs text-gray-500 block mt-1">Laut Tarifvertrag/Betriebsvereinbarung</span>
              </label>
              <input
                type="number"
                value={vollzeitUrlaubstage}
                onChange={(e) => setVollzeitUrlaubstage(Math.max(20, Number(e.target.value)))}
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none text-center text-xl font-bold"
                min="20"
                max="40"
              />
            </div>
          </>
        )}

        {/* Resturlaub */}
        {(szenario === 'jahresurlaub' || szenario === 'kuendigung' || szenario === 'teilzeit') && (
          <div className="mb-4">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Resturlaub aus dem Vorjahr</span>
              <span className="text-xs text-gray-500 block mt-1">Übertragener Urlaub (verfällt am 31.03.)</span>
            </label>
            <input
              type="number"
              value={resturlaubVorjahr}
              onChange={(e) => setResturlaubVorjahr(Math.max(0, Number(e.target.value)))}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none text-center text-xl font-bold"
              min="0"
              max="30"
            />
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-green-500 to-emerald-600">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          🏖️ Ihr Urlaubsanspruch {new Date().getFullYear()}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatTage(ergebnis.urlaubBeiArbeitgeber)}</span>
          </div>
          <p className="text-green-100 mt-2 text-sm">
            {szenario === 'teilzeit' 
              ? `Bei ${teilzeitTageProWoche} Arbeitstagen pro Woche`
              : szenario === 'neuer-job'
              ? `Anteiliger Anspruch für ${ergebnis.anteilMonate} Monate`
              : szenario === 'kuendigung'
              ? `Ihr Anspruch bis zum Ausscheiden`
              : `Inklusive ${resturlaubVorjahr} Tage Resturlaub`
            }
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Pro Monat</span>
            <div className="text-xl font-bold">{ergebnis.proMonat} Tage</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesetzl. Min.</span>
            <div className="text-xl font-bold">{ergebnis.gesetzlicherAnspruch} Tage</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Vertraglich</span>
            <div className="text-xl font-bold">{ergebnis.jahresurlaub} Tage</div>
          </div>
        </div>

        {szenario === 'kuendigung' && bereitsGenommen > 0 && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <p className="text-sm">
              <strong>Noch verfügbar:</strong> {formatTage(Math.max(0, ergebnis.urlaubBeiArbeitgeber - bereitsGenommen))}
              <span className="opacity-80"> ({formatTage(bereitsGenommen)} bereits genommen)</span>
            </p>
            {ergebnis.urlaubBeiArbeitgeber - bereitsGenommen > 0 && (
              <p className="text-xs mt-1 opacity-80">
                Resturlaub kann abgebaut werden oder wird ausgezahlt (Urlaubsabgeltung)
              </p>
            )}
          </div>
        )}

        {ergebnis.istTeilzeit && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <p className="text-sm">
              <strong>Urlaubswochen:</strong> {(ergebnis.jahresurlaub / teilzeitTageProWoche).toFixed(1)} Wochen
              <span className="opacity-80"> (wie bei Vollzeit: {(ergebnis.vollzeitVergleich / 5).toFixed(1)} Wochen)</span>
            </p>
          </div>
        )}
      </div>

      {/* Hinweise */}
      {ergebnis.hinweise.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-3">💡 Hinweise zu Ihrer Berechnung</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            {ergebnis.hinweise.map((hinweis, i) => (
              <li key={i} className="flex gap-2">
                <span>•</span>
                <span>{hinweis}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Urlaubsberechnung nach BUrlG
          </div>
          
          {szenario === 'teilzeit' ? (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Vollzeit-Urlaub (5 Tage/Woche)</span>
                <span className="font-bold text-gray-900">{ergebnis.vollzeitVergleich} Tage</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">÷ Vollzeit-Arbeitstage</span>
                <span className="text-gray-900">5 Tage</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">× Ihre Arbeitstage</span>
                <span className="text-gray-900">{teilzeitTageProWoche} Tage</span>
              </div>
              <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
                <span className="font-medium text-gray-700">= Ihr Urlaubsanspruch</span>
                <span className="font-bold text-gray-900">{formatTage(ergebnis.jahresurlaub)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Vertraglicher Jahresurlaub</span>
                <span className="font-bold text-gray-900">{ergebnis.jahresurlaub} Tage</span>
              </div>
              
              {(szenario === 'neuer-job' || szenario === 'kuendigung') && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">÷ 12 Monate</span>
                    <span className="text-gray-900">{ergebnis.proMonat} Tage/Monat</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">× {ergebnis.anteilMonate} Monate im Betrieb</span>
                    <span className="text-gray-900">{formatTage(ergebnis.anteilMonate * ergebnis.proMonat)}</span>
                  </div>
                </>
              )}
              
              {resturlaubVorjahr > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                  <span>+ Resturlaub Vorjahr</span>
                  <span>{formatTage(resturlaubVorjahr)}</span>
                </div>
              )}
              
              {szenario === 'kuendigung' && bereitsGenommen > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
                  <span>− Bereits genommen</span>
                  <span>{formatTage(bereitsGenommen)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-3 bg-green-100 -mx-6 px-6 rounded-b-xl">
                <span className="font-bold text-green-800">= Verfügbarer Urlaub</span>
                <span className="font-bold text-2xl text-green-900">
                  {formatTage(szenario === 'kuendigung' 
                    ? Math.max(0, ergebnis.urlaubBeiArbeitgeber - bereitsGenommen)
                    : ergebnis.urlaubBeiArbeitgeber
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Urlaubsberechnung bei Teilzeit erklärt */}
      {szenario === 'teilzeit' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">🔄 Teilzeit-Urlaubsberechnung erklärt</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Die Formel für Teilzeit-Urlaub stellt sicher, dass Sie genauso viele 
              <strong> Urlaubswochen</strong> bekommen wie Vollzeitkräfte:
            </p>
            <div className="bg-gray-50 p-4 rounded-xl font-mono text-center text-gray-800">
              Teilzeit-Urlaub = (Vollzeit-Urlaub ÷ 5) × Teilzeit-Tage
            </div>
            <p>
              <strong>Beispiel:</strong> Bei 30 Tagen Vollzeit-Urlaub und 3 Arbeitstagen pro Woche:
            </p>
            <p className="bg-green-50 p-3 rounded-lg">
              (30 ÷ 5) × 3 = <strong>18 Urlaubstage</strong> = 6 Wochen Urlaub
            </p>
            <p>
              Sie arbeiten weniger Tage, brauchen aber auch weniger freie Tage für eine volle 
              Urlaubswoche – das Ergebnis ist gleich viel Erholungszeit!
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert das Urlaubsrecht</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Gesetzlicher Mindesturlaub:</strong> 24 Werktage (6-Tage-Woche) bzw. 20 Arbeitstage (5-Tage-Woche) nach § 3 BUrlG</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Wartezeit:</strong> Voller Urlaubsanspruch erst nach 6 Monaten Betriebszugehörigkeit (§ 4 BUrlG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Anteiliger Urlaub:</strong> 1/12 des Jahresurlaubs pro vollem Beschäftigungsmonat (§ 5 BUrlG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Übertragung:</strong> Resturlaub muss bis 31. März des Folgejahres genommen werden (§ 7 Abs. 3 BUrlG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Urlaubsabgeltung:</strong> Nicht genommener Urlaub wird bei Kündigung ausgezahlt (§ 7 Abs. 4 BUrlG)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Gleichbehandlung:</strong> Teilzeitkräfte erhalten anteilig gleich viele Urlaubswochen</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Urlaubsbescheinigung:</strong> Beim Jobwechsel unbedingt eine Urlaubsbescheinigung vom alten Arbeitgeber anfordern!</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Verfall:</strong> Arbeitgeber muss Sie auf drohenden Verfall hinweisen, sonst kann Urlaub nicht verfallen (EuGH)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Krankheit:</strong> Urlaub während Krankheit wird nicht angerechnet, wenn Sie ein Attest haben</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kündigung in Probezeit:</strong> Auch hier besteht anteiliger Urlaubsanspruch (1/12 pro Monat)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Tarifvertrag:</strong> Viele Tarifverträge sehen mehr Urlaub vor als das Gesetz – Ihren Arbeitsvertrag prüfen!</span>
          </li>
        </ul>
      </div>

      {/* Typische Urlaubstage nach Branche */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Übliche Urlaubstage nach Branche</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-600">Branche</th>
                <th className="text-center py-2 px-3 font-medium text-gray-600">Urlaubstage</th>
                <th className="text-center py-2 px-3 font-medium text-gray-600">Quelle</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3">Öffentlicher Dienst (TVöD)</td>
                <td className="text-center py-2 px-3 font-bold">30 Tage</td>
                <td className="text-center py-2 px-3 text-gray-500">Tarifvertrag</td>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="py-2 px-3">Metallindustrie (IG Metall)</td>
                <td className="text-center py-2 px-3 font-bold">30 Tage</td>
                <td className="text-center py-2 px-3 text-gray-500">Tarifvertrag</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3">Chemie-Industrie</td>
                <td className="text-center py-2 px-3 font-bold">30 Tage</td>
                <td className="text-center py-2 px-3 text-gray-500">Tarifvertrag</td>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="py-2 px-3">Banken</td>
                <td className="text-center py-2 px-3 font-bold">30 Tage</td>
                <td className="text-center py-2 px-3 text-gray-500">Tarifvertrag</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3">Einzelhandel</td>
                <td className="text-center py-2 px-3 font-bold">28-36 Tage</td>
                <td className="text-center py-2 px-3 text-gray-500">nach Alter/Betriebszugehörigkeit</td>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="py-2 px-3">Gastronomie</td>
                <td className="text-center py-2 px-3 font-bold">24-30 Tage</td>
                <td className="text-center py-2 px-3 text-gray-500">regional unterschiedlich</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-gray-500">Gesetzliches Minimum</td>
                <td className="text-center py-2 px-3 font-bold text-amber-600">20 Tage</td>
                <td className="text-center py-2 px-3 text-gray-500">BUrlG</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Hilfe bei Problemen</h3>
        <div className="space-y-4">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="font-semibold text-green-900">Arbeitsgericht</p>
            <p className="text-sm text-green-700 mt-1">
              Bei Streitigkeiten über Urlaubsansprüche ist das Arbeitsgericht zuständig. 
              In der ersten Instanz gibt es keinen Anwaltszwang.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Bürgertelefon BMAS</p>
                <a 
                  href="tel:030-221911001"
                  className="text-green-600 hover:underline font-bold"
                >
                  030 221 911 001
                </a>
                <p className="text-gray-500 text-xs mt-1">Arbeitsrecht-Infos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">BMAS Infos</p>
                <a 
                  href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Urlaub/urlaub.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  bmas.de/urlaub →
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">⚖️</span>
            <div>
              <p className="font-medium text-gray-800">Weitere Anlaufstellen</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Gewerkschaft (Rechtsschutz für Mitglieder)</li>
                <li>• Betriebsrat (wenn vorhanden)</li>
                <li>• Verbraucherzentrale (Erstberatung)</li>
                <li>• Fachanwalt für Arbeitsrecht</li>
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
            href="https://www.gesetze-im-internet.de/burlg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-green-600 hover:underline"
          >
            Bundesurlaubsgesetz (BUrlG)
          </a>
          <a 
            href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Urlaub/urlaub.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-green-600 hover:underline"
          >
            BMAS – Urlaub
          </a>
          <a 
            href="https://www.bag-urteil.com/urlaub/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-green-600 hover:underline"
          >
            BAG-Rechtsprechung – Urlaub
          </a>
        </div>
      </div>
    </div>
  );
}
