import { useState, useMemo } from 'react';

// Standard Werte
const WOCHEN_PRO_MONAT = 4.33; // 52/12
const WOCHEN_PRO_JAHR = 52;
const VOLLZEIT_STUNDEN_DEFAULT = 40;
const TEILZEIT_STUNDEN_DEFAULT = 20;

// Mindestlohn 2025
const MINDESTLOHN_2025 = 12.82;

// Typische Teilzeit-Modelle
const TEILZEIT_MODELLE = [
  { name: '50% (Halbtags)', stunden: 20 },
  { name: '75%', stunden: 30 },
  { name: '80%', stunden: 32 },
  { name: '87.5%', stunden: 35 },
  { name: '25% (Mini)', stunden: 10 },
];

export default function TeilzeitRechner() {
  // Eingabewerte
  const [vollzeitGehalt, setVollzeitGehalt] = useState(4000);
  const [vollzeitStunden, setVollzeitStunden] = useState(VOLLZEIT_STUNDEN_DEFAULT);
  const [teilzeitStunden, setTeilzeitStunden] = useState(TEILZEIT_STUNDEN_DEFAULT);
  
  // Optionen
  const [mitSonderzahlungen, setMitSonderzahlungen] = useState(false);
  const [urlaubsgeldMonate, setUrlaubsgeldMonate] = useState(0.5);
  const [weihnachtsgeldMonate, setWeihnachtsgeldMonate] = useState(1);

  const ergebnis = useMemo(() => {
    // Arbeitszeitanteil berechnen
    const arbeitszeitAnteil = teilzeitStunden / vollzeitStunden;
    const arbeitszeitProzent = arbeitszeitAnteil * 100;
    
    // Stundenlohn (bleibt gleich bei Vollzeit und Teilzeit)
    const stundenProMonat = vollzeitStunden * WOCHEN_PRO_MONAT;
    const stundenlohn = vollzeitGehalt / stundenProMonat;
    
    // Teilzeit-Gehalt berechnen
    const teilzeitGehaltMonat = vollzeitGehalt * arbeitszeitAnteil;
    const teilzeitGehaltJahr = teilzeitGehaltMonat * 12;
    
    // Vollzeit-Jahresgehalt
    const vollzeitGehaltJahr = vollzeitGehalt * 12;
    
    // Mit Sonderzahlungen
    let vollzeitJahrMitSonder = vollzeitGehaltJahr;
    let teilzeitJahrMitSonder = teilzeitGehaltJahr;
    if (mitSonderzahlungen) {
      vollzeitJahrMitSonder += vollzeitGehalt * urlaubsgeldMonate + vollzeitGehalt * weihnachtsgeldMonate;
      teilzeitJahrMitSonder += teilzeitGehaltMonat * urlaubsgeldMonate + teilzeitGehaltMonat * weihnachtsgeldMonate;
    }
    
    // Differenz berechnen
    const differenzMonat = vollzeitGehalt - teilzeitGehaltMonat;
    const differenzJahr = vollzeitGehaltJahr - teilzeitGehaltJahr;
    const differenzJahrMitSonder = vollzeitJahrMitSonder - teilzeitJahrMitSonder;
    
    // Arbeitsstunden
    const vollzeitStundenMonat = vollzeitStunden * WOCHEN_PRO_MONAT;
    const teilzeitStundenMonat = teilzeitStunden * WOCHEN_PRO_MONAT;
    const vollzeitStundenJahr = vollzeitStunden * WOCHEN_PRO_JAHR;
    const teilzeitStundenJahr = teilzeitStunden * WOCHEN_PRO_JAHR;
    
    // Gesparte Stunden
    const gesparteStundenWoche = vollzeitStunden - teilzeitStunden;
    const gesparteStundenMonat = vollzeitStundenMonat - teilzeitStundenMonat;
    const gesparteStundenJahr = vollzeitStundenJahr - teilzeitStundenJahr;
    
    // Mindestlohn-Check
    const ueberMindestlohn = stundenlohn >= MINDESTLOHN_2025;
    
    return {
      // Arbeitszeitanteil
      arbeitszeitAnteil,
      arbeitszeitProzent,
      
      // Stundenlohn (gleich bei VZ und TZ)
      stundenlohn,
      
      // Gehälter
      vollzeitGehaltMonat: vollzeitGehalt,
      vollzeitGehaltJahr,
      vollzeitJahrMitSonder,
      teilzeitGehaltMonat,
      teilzeitGehaltJahr,
      teilzeitJahrMitSonder,
      
      // Differenzen
      differenzMonat,
      differenzJahr,
      differenzJahrMitSonder,
      
      // Arbeitsstunden
      vollzeitStundenMonat,
      teilzeitStundenMonat,
      vollzeitStundenJahr,
      teilzeitStundenJahr,
      
      // Gesparte Zeit
      gesparteStundenWoche,
      gesparteStundenMonat,
      gesparteStundenJahr,
      gesparteTageJahr: gesparteStundenJahr / 8, // Bei 8h Arbeitstag
      
      // Mindestlohn
      ueberMindestlohn,
    };
  }, [vollzeitGehalt, vollzeitStunden, teilzeitStunden, mitSonderzahlungen, urlaubsgeldMonate, weihnachtsgeldMonate]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRund = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatZahl = (n: number, decimals = 1) => n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + '%';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="text-4xl">⚖️</div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Teilzeit-Gehalt berechnen</h3>
            <p className="text-sm text-gray-600">
              Berechnen Sie Ihr Gehalt bei reduzierter Arbeitszeit. Der Stundenlohn bleibt gleich – 
              nur die Stundenzahl und damit das Gehalt ändern sich proportional.
            </p>
          </div>
        </div>
      </div>

      {/* Vollzeit-Gehalt Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💰 Ihr Vollzeit-Bruttogehalt</h3>
        
        <div className="relative mb-4">
          <input
            type="number"
            value={vollzeitGehalt}
            onChange={(e) => setVollzeitGehalt(Math.max(0, Number(e.target.value)))}
            className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
            min="0"
            max="20000"
            step="100"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€ / Monat</span>
        </div>
        
        <input
          type="range"
          value={vollzeitGehalt}
          onChange={(e) => setVollzeitGehalt(Number(e.target.value))}
          className="w-full accent-purple-500"
          min="1500"
          max="10000"
          step="100"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1.500 €</span>
          <span>10.000 €</span>
        </div>
      </div>

      {/* Arbeitszeit Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">⏰ Arbeitszeiten</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vollzeit-Stunden */}
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Vollzeit (Std./Woche)</span>
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setVollzeitStunden(Math.max(1, vollzeitStunden - 1))}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
              >
                −
              </button>
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-800">{vollzeitStunden}</span>
                <span className="text-gray-500 ml-1 text-sm">h</span>
              </div>
              <button
                onClick={() => setVollzeitStunden(Math.min(60, vollzeitStunden + 1))}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-3">
              {[35, 38.5, 40, 42].map((std) => (
                <button
                  key={std}
                  onClick={() => setVollzeitStunden(std)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    vollzeitStunden === std
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {std}h
                </button>
              ))}
            </div>
          </div>

          {/* Teilzeit-Stunden */}
          <div>
            <label className="block mb-2">
              <span className="text-purple-700 font-medium">Teilzeit (Std./Woche)</span>
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setTeilzeitStunden(Math.max(1, teilzeitStunden - 1))}
                className="w-10 h-10 rounded-xl bg-purple-100 hover:bg-purple-200 text-lg font-bold transition-colors text-purple-700"
              >
                −
              </button>
              <div className="text-center">
                <span className="text-3xl font-bold text-purple-700">{teilzeitStunden}</span>
                <span className="text-purple-500 ml-1 text-sm">h</span>
              </div>
              <button
                onClick={() => setTeilzeitStunden(Math.min(vollzeitStunden - 1, teilzeitStunden + 1))}
                className="w-10 h-10 rounded-xl bg-purple-100 hover:bg-purple-200 text-lg font-bold transition-colors text-purple-700"
              >
                +
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {[10, 15, 20, 25, 30, 32].map((std) => (
                <button
                  key={std}
                  onClick={() => setTeilzeitStunden(std)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    teilzeitStunden === std
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  {std}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Teilzeit-Modelle */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3">💡 Beliebte Teilzeit-Modelle:</p>
          <div className="flex flex-wrap gap-2">
            {TEILZEIT_MODELLE.map((modell) => (
              <button
                key={modell.name}
                onClick={() => setTeilzeitStunden(modell.stunden)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  teilzeitStunden === modell.stunden
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300 text-gray-600'
                }`}
              >
                {modell.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sonderzahlungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={mitSonderzahlungen}
            onChange={(e) => setMitSonderzahlungen(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
          />
          <span className="text-gray-700 font-medium">
            🎁 Urlaubs-/Weihnachtsgeld berücksichtigen
          </span>
        </label>

        {mitSonderzahlungen && (
          <div className="bg-purple-50 rounded-xl p-4 mt-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Urlaubsgeld</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  value={urlaubsgeldMonate}
                  onChange={(e) => setUrlaubsgeldMonate(Number(e.target.value))}
                  className="flex-1 accent-purple-500"
                  min="0"
                  max="1"
                  step="0.25"
                />
                <span className="text-sm font-medium w-28 text-right">
                  {urlaubsgeldMonate === 0 ? 'Kein' : `${urlaubsgeldMonate} Monatsgehalt`}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Weihnachtsgeld</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  value={weihnachtsgeldMonate}
                  onChange={(e) => setWeihnachtsgeldMonate(Number(e.target.value))}
                  className="flex-1 accent-purple-500"
                  min="0"
                  max="2"
                  step="0.25"
                />
                <span className="text-sm font-medium w-28 text-right">
                  {weihnachtsgeldMonate === 0 ? 'Kein' : `${weihnachtsgeldMonate} Monatsgehalt${weihnachtsgeldMonate > 1 ? 'er' : ''}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hauptergebnis */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm">
            <span>📊</span>
            <span>Arbeitszeitanteil: <strong>{formatProzent(ergebnis.arbeitszeitProzent)}</strong></span>
          </div>
        </div>
        
        <h3 className="text-sm font-medium opacity-80 mb-1 text-center">💜 Ihr Teilzeit-Gehalt</h3>
        <div className="flex items-baseline justify-center gap-2 mb-6">
          <span className="text-5xl font-bold">{formatEuroRund(ergebnis.teilzeitGehaltMonat)}</span>
          <span className="text-xl opacity-80">/ Monat</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Jahresgehalt (Teilzeit)</span>
            <div className="text-xl font-bold">{formatEuroRund(ergebnis.teilzeitGehaltJahr)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Stundenlohn (brutto)</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.stundenlohn)}</div>
          </div>
        </div>
        
        {mitSonderzahlungen && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mt-3">
            <span className="text-sm opacity-80">Mit Urlaubs-/Weihnachtsgeld</span>
            <div className="text-xl font-bold">{formatEuroRund(ergebnis.teilzeitJahrMitSonder)} / Jahr</div>
          </div>
        )}
      </div>

      {/* Vergleich Vollzeit vs. Teilzeit */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Vergleich: Vollzeit vs. Teilzeit</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-gray-600 font-medium"></th>
                <th className="text-right py-3 text-gray-600 font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <span>💼</span> Vollzeit
                  </div>
                </th>
                <th className="text-right py-3 text-purple-600 font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <span>💜</span> Teilzeit
                  </div>
                </th>
                <th className="text-right py-3 text-gray-500 font-medium">Differenz</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-600">Stunden/Woche</td>
                <td className="py-3 text-right font-medium">{vollzeitStunden} h</td>
                <td className="py-3 text-right font-medium text-purple-700">{teilzeitStunden} h</td>
                <td className="py-3 text-right text-green-600">-{ergebnis.gesparteStundenWoche} h</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-600">Stunden/Monat</td>
                <td className="py-3 text-right">{formatZahl(ergebnis.vollzeitStundenMonat)} h</td>
                <td className="py-3 text-right text-purple-700">{formatZahl(ergebnis.teilzeitStundenMonat)} h</td>
                <td className="py-3 text-right text-green-600">-{formatZahl(ergebnis.gesparteStundenMonat)} h</td>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="py-3 text-gray-700 font-medium">Gehalt/Monat</td>
                <td className="py-3 text-right font-bold">{formatEuroRund(ergebnis.vollzeitGehaltMonat)}</td>
                <td className="py-3 text-right font-bold text-purple-700">{formatEuroRund(ergebnis.teilzeitGehaltMonat)}</td>
                <td className="py-3 text-right text-red-600 font-medium">-{formatEuroRund(ergebnis.differenzMonat)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-600">Gehalt/Jahr</td>
                <td className="py-3 text-right">{formatEuroRund(ergebnis.vollzeitGehaltJahr)}</td>
                <td className="py-3 text-right text-purple-700">{formatEuroRund(ergebnis.teilzeitGehaltJahr)}</td>
                <td className="py-3 text-right text-red-600">-{formatEuroRund(ergebnis.differenzJahr)}</td>
              </tr>
              {mitSonderzahlungen && (
                <tr className="border-b border-gray-100">
                  <td className="py-3 text-gray-600">Mit Sonderzahlungen</td>
                  <td className="py-3 text-right">{formatEuroRund(ergebnis.vollzeitJahrMitSonder)}</td>
                  <td className="py-3 text-right text-purple-700">{formatEuroRund(ergebnis.teilzeitJahrMitSonder)}</td>
                  <td className="py-3 text-right text-red-600">-{formatEuroRund(ergebnis.differenzJahrMitSonder)}</td>
                </tr>
              )}
              <tr className="bg-purple-50">
                <td className="py-3 text-gray-700 font-medium">Stundenlohn</td>
                <td className="py-3 text-right font-bold">{formatEuro(ergebnis.stundenlohn)}</td>
                <td className="py-3 text-right font-bold text-purple-700">{formatEuro(ergebnis.stundenlohn)}</td>
                <td className="py-3 text-right text-green-600 font-medium">±0,00 €</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            ✓ <strong>Wichtig:</strong> Der Stundenlohn bleibt bei Teilzeit identisch zum Vollzeit-Stundenlohn!
          </p>
        </div>
      </div>

      {/* Gewonnene Freizeit */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-green-200">
        <h3 className="font-bold text-green-800 mb-4">🌴 Gewonnene Freizeit</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{ergebnis.gesparteStundenWoche}</div>
            <div className="text-xs text-gray-500">Stunden/Woche</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{formatZahl(ergebnis.gesparteStundenMonat, 0)}</div>
            <div className="text-xs text-gray-500">Stunden/Monat</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{formatZahl(ergebnis.gesparteStundenJahr, 0)}</div>
            <div className="text-xs text-gray-500">Stunden/Jahr</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{formatZahl(ergebnis.gesparteTageJahr, 0)}</div>
            <div className="text-xs text-gray-500">Arbeitstage/Jahr</div>
          </div>
        </div>
        
        <p className="text-sm text-green-700 mt-4">
          💡 Bei {ergebnis.gesparteStundenWoche} Stunden weniger pro Woche gewinnen Sie 
          <strong> {formatZahl(ergebnis.gesparteTageJahr, 0)} zusätzliche freie Tage </strong> 
          im Jahr (bei 8h Arbeitstag).
        </p>
      </div>

      {/* Kosten pro freie Stunde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💸 Was kostet eine freie Stunde?</h3>
        
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700">Einkommensverzicht pro freie Stunde:</p>
              <p className="text-3xl font-bold text-amber-800 mt-1">
                {formatEuro(ergebnis.stundenlohn)}
              </p>
            </div>
            <div className="text-5xl">⏱️</div>
          </div>
          <p className="text-xs text-amber-600 mt-3">
            = Ihr Brutto-Stundenlohn. Das ist der Betrag, auf den Sie pro zusätzliche freie Stunde verzichten.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">Monatlicher Verzicht für</p>
            <p className="text-lg font-bold text-gray-800">{ergebnis.gesparteStundenWoche}h weniger/Woche</p>
            <p className="text-xl font-bold text-red-600 mt-1">{formatEuroRund(ergebnis.differenzMonat)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">Jährlicher Verzicht für</p>
            <p className="text-lg font-bold text-gray-800">{formatZahl(ergebnis.gesparteTageJahr, 0)} freie Tage</p>
            <p className="text-xl font-bold text-red-600 mt-1">{formatEuroRund(ergebnis.differenzJahr)}</p>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔢 Berechnungsformel</h3>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-center font-mono text-lg text-gray-800 mb-2">
            Teilzeit-Gehalt = Vollzeit-Gehalt × (Teilzeit-Stunden ÷ Vollzeit-Stunden)
          </p>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Ihre Berechnung
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Vollzeit-Gehalt (brutto)</span>
            <span className="font-bold text-gray-900">{formatEuro(vollzeitGehalt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Arbeitszeitanteil</span>
            <span className="text-gray-900">{teilzeitStunden}h ÷ {vollzeitStunden}h = {formatProzent(ergebnis.arbeitszeitProzent)}</span>
          </div>
          <div className="flex justify-between py-3 bg-purple-50 -mx-6 px-6">
            <span className="font-bold text-purple-800">Teilzeit-Gehalt</span>
            <span className="font-bold text-2xl text-purple-900">{formatEuro(ergebnis.teilzeitGehaltMonat)}</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Beispiel:</strong> Bei {formatEuroRund(vollzeitGehalt)} Vollzeit-Gehalt und Wechsel von {vollzeitStunden}h auf {teilzeitStunden}h:
          </p>
          <p className="font-mono text-sm text-blue-800 mt-1">
            {formatEuroRund(vollzeitGehalt)} × {formatProzent(ergebnis.arbeitszeitProzent)} = <strong>{formatEuroRund(ergebnis.teilzeitGehaltMonat)}</strong>
          </p>
        </div>
      </div>

      {/* Mindestlohn-Check */}
      {!ergebnis.ueberMindestlohn && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-red-800 mb-3">⚠️ Achtung: Mindestlohn</h3>
          <p className="text-sm text-red-700">
            Ihr Stundenlohn von <strong>{formatEuro(ergebnis.stundenlohn)}</strong> liegt unter dem gesetzlichen 
            Mindestlohn von <strong>{formatEuro(MINDESTLOHN_2025)}</strong> (2025).
          </p>
        </div>
      )}

      {/* Übersichtstabelle Teilzeit-Modelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Übersicht: Alle Teilzeit-Modelle</h3>
        <p className="text-sm text-gray-600 mb-4">
          Basierend auf Ihrem Vollzeit-Gehalt von {formatEuroRund(vollzeitGehalt)} bei {vollzeitStunden}h/Woche:
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600 font-medium">Modell</th>
                <th className="text-right py-2 text-gray-600 font-medium">Std./Woche</th>
                <th className="text-right py-2 text-gray-600 font-medium">Gehalt/Monat</th>
                <th className="text-right py-2 text-gray-600 font-medium">Gehalt/Jahr</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="py-2 font-medium">💼 Vollzeit (100%)</td>
                <td className="py-2 text-right">{vollzeitStunden}h</td>
                <td className="py-2 text-right font-bold">{formatEuroRund(vollzeitGehalt)}</td>
                <td className="py-2 text-right">{formatEuroRund(vollzeitGehalt * 12)}</td>
              </tr>
              {[90, 80, 75, 50, 25].map((prozent) => {
                const stundenModell = (vollzeitStunden * prozent) / 100;
                const gehaltModell = (vollzeitGehalt * prozent) / 100;
                const isSelected = Math.abs(teilzeitStunden - stundenModell) < 1;
                return (
                  <tr 
                    key={prozent} 
                    className={`border-b border-gray-100 ${isSelected ? 'bg-purple-50' : ''}`}
                  >
                    <td className={`py-2 ${isSelected ? 'text-purple-700 font-medium' : ''}`}>
                      {prozent === 50 ? '⚖️' : prozent === 25 ? '🌱' : '📊'} {prozent}% Teilzeit
                    </td>
                    <td className={`py-2 text-right ${isSelected ? 'text-purple-700' : ''}`}>
                      {formatZahl(stundenModell, 0)}h
                    </td>
                    <td className={`py-2 text-right ${isSelected ? 'font-bold text-purple-700' : ''}`}>
                      {formatEuroRund(gehaltModell)}
                    </td>
                    <td className={`py-2 text-right ${isSelected ? 'text-purple-700' : ''}`}>
                      {formatEuroRund(gehaltModell * 12)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rechtliche Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚖️ Recht auf Teilzeit</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Rechtsanspruch:</strong> Nach §8 TzBfG haben Arbeitnehmer nach 6 Monaten Betriebszugehörigkeit 
            einen Anspruch auf Teilzeit (bei &gt;15 Mitarbeitern)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Brückenteilzeit:</strong> Nach §9a TzBfG können Sie zeitlich begrenzte Teilzeit beantragen 
            (1-5 Jahre) mit Rückkehrrecht zur Vollzeit (bei &gt;45 Mitarbeitern)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Antragsfrist:</strong> 3 Monate vor gewünschtem Beginn schriftlich beim Arbeitgeber beantragen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Sozialversicherung:</strong> Bei Teilzeit bleiben Sie voll sozialversichert (anteilige Beiträge)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Urlaub:</strong> Der Urlaubsanspruch bleibt gleich (bei weniger Arbeitstagen/Woche reduziert sich 
            die Anzahl der Urlaubstage proportional)</span>
          </li>
        </ul>
      </div>

      {/* Tipps */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-3">💡 Tipps zur Teilzeit</h3>
        <ul className="space-y-3 text-sm text-blue-700">
          <li className="flex gap-3">
            <span className="text-xl">📝</span>
            <div>
              <strong>Schriftlich beantragen:</strong> Stellen Sie Ihren Teilzeitantrag immer schriftlich 
              und bewahren Sie eine Kopie auf.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">🏦</span>
            <div>
              <strong>Rentenauswirkung beachten:</strong> Weniger Gehalt = weniger Rentenpunkte. 
              Überlegen Sie ggf. private Altersvorsorge.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">🤝</span>
            <div>
              <strong>Verhandeln:</strong> Manchmal ist auch ein Kompromiss möglich, z.B. 
              Home-Office statt Teilzeit.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">📊</span>
            <div>
              <strong>Steuerklasse prüfen:</strong> Bei Ehepaaren kann ein Wechsel der Steuerklasse 
              das Netto optimieren.
            </div>
          </li>
        </ul>
      </div>

      {/* Behörden & Links */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Informationen & Beratung</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🌐</span>
            <div>
              <p className="font-medium text-gray-800">BMAS Teilzeit</p>
              <a 
                href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Teilzeit-Befristung/teilzeit-befristung.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Informationen zur Teilzeit →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">⚖️</span>
            <div>
              <p className="font-medium text-gray-800">Teilzeit- und Befristungsgesetz</p>
              <a 
                href="https://www.gesetze-im-internet.de/tzbfg/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                TzBfG vollständig →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/tzbfg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Teilzeit- und Befristungsgesetz (TzBfG) – Gesetze im Internet
          </a>
          <a 
            href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Teilzeit-Befristung/teilzeit-befristung.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium für Arbeit und Soziales – Teilzeit
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/milog/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Mindestlohngesetz (MiLoG) – Gesetze im Internet
          </a>
        </div>
      </div>
    </div>
  );
}
