import { useState, useMemo } from 'react';

// Typische Arbeitstage und Stunden
const ARBEITSTAGE_PRO_WOCHE_DEFAULT = 5;
const STUNDEN_PRO_WOCHE_DEFAULT = 40;
const WOCHEN_PRO_JAHR = 52;
const URLAUBSTAGE_DEFAULT = 30;
const FEIERTAGE_DEFAULT = 10;

// Mindestlohn 2025
const MINDESTLOHN_2025 = 12.82;
// Mindestlohn 2026 (geplant)
const MINDESTLOHN_2026 = 12.82; // Noch nicht festgelegt

export default function StundenlohnRechner() {
  // Berechnungsrichtung
  const [richtung, setRichtung] = useState<'gehaltZuStunde' | 'stundeZuGehalt'>('gehaltZuStunde');
  
  // Eingabewerte für Gehalt → Stundenlohn
  const [monatsgehalt, setMonatsgehalt] = useState(3500);
  const [jahresgehalt, setJahresgehalt] = useState(42000);
  const [eingabeart, setEingabeart] = useState<'monat' | 'jahr'>('monat');
  
  // Eingabewerte für Stundenlohn → Gehalt
  const [stundenlohn, setStundenlohn] = useState(20);
  
  // Arbeitszeitmodell
  const [stundenProWoche, setStundenProWoche] = useState(STUNDEN_PRO_WOCHE_DEFAULT);
  const [urlaubstage, setUrlaubstage] = useState(URLAUBSTAGE_DEFAULT);
  const [feiertage, setFeiertage] = useState(FEIERTAGE_DEFAULT);
  
  // Berücksichtigung von Urlaubs-/Weihnachtsgeld
  const [mitSonderzahlungen, setMitSonderzahlungen] = useState(false);
  const [urlaubsgeldMonate, setUrlaubsgeldMonate] = useState(0.5); // Halbes Monatsgehalt
  const [weihnachtsgeldMonate, setWeihnachtsgeldMonate] = useState(1); // Volles Monatsgehalt

  const ergebnis = useMemo(() => {
    // === Arbeitszeit-Berechnung ===
    const arbeitsTageProWoche = 5; // Standard Mo-Fr
    const arbeitsTageProJahr = (WOCHEN_PRO_JAHR * arbeitsTageProWoche) - urlaubstage - feiertage;
    const arbeitsStundenProTag = stundenProWoche / arbeitsTageProWoche;
    const arbeitsStundenProMonat = (stundenProWoche * WOCHEN_PRO_JAHR) / 12;
    const arbeitsStundenProJahr = stundenProWoche * WOCHEN_PRO_JAHR;
    const effektiveArbeitsstundenProJahr = arbeitsTageProJahr * arbeitsStundenProTag;
    
    if (richtung === 'gehaltZuStunde') {
      // === Gehalt → Stundenlohn ===
      const basisJahresgehalt = eingabeart === 'monat' ? monatsgehalt * 12 : jahresgehalt;
      const basisMonatsgehalt = eingabeart === 'monat' ? monatsgehalt : jahresgehalt / 12;
      
      // Sonderzahlungen einrechnen
      let gesamtJahresgehalt = basisJahresgehalt;
      if (mitSonderzahlungen) {
        gesamtJahresgehalt += basisMonatsgehalt * urlaubsgeldMonate;
        gesamtJahresgehalt += basisMonatsgehalt * weihnachtsgeldMonate;
      }
      
      // Stundenlohn berechnen (verschiedene Methoden)
      const stundenlohnBrutto = basisMonatsgehalt / arbeitsStundenProMonat;
      const stundenlohnMitSonderzahlungen = gesamtJahresgehalt / arbeitsStundenProJahr;
      const stundenlohnEffektiv = gesamtJahresgehalt / effektiveArbeitsstundenProJahr;
      
      // Vergleich zum Mindestlohn
      const ueberMindestlohn = stundenlohnBrutto >= MINDESTLOHN_2025;
      const differenzZumMindestlohn = stundenlohnBrutto - MINDESTLOHN_2025;
      const prozentUeberMindestlohn = ((stundenlohnBrutto / MINDESTLOHN_2025) - 1) * 100;
      
      return {
        richtung,
        // Eingabe
        basisMonatsgehalt,
        basisJahresgehalt,
        gesamtJahresgehalt,
        // Arbeitszeit
        arbeitsStundenProMonat,
        arbeitsStundenProJahr,
        arbeitsTageProJahr,
        effektiveArbeitsstundenProJahr,
        // Ergebnis
        stundenlohnBrutto,
        stundenlohnMitSonderzahlungen,
        stundenlohnEffektiv,
        // Mindestlohn-Vergleich
        ueberMindestlohn,
        differenzZumMindestlohn,
        prozentUeberMindestlohn,
        // Für Anzeige
        tageslohn: stundenlohnBrutto * arbeitsStundenProTag,
        wochenlohn: stundenlohnBrutto * stundenProWoche,
      };
    } else {
      // === Stundenlohn → Gehalt ===
      const monatsgehaltAusStunde = stundenlohn * arbeitsStundenProMonat;
      const jahresgehaltAusStunde = stundenlohn * arbeitsStundenProJahr;
      
      // Mit Sonderzahlungen
      let gesamtJahresgehalt = jahresgehaltAusStunde;
      if (mitSonderzahlungen) {
        gesamtJahresgehalt += monatsgehaltAusStunde * urlaubsgeldMonate;
        gesamtJahresgehalt += monatsgehaltAusStunde * weihnachtsgeldMonate;
      }
      
      // Vergleich zum Mindestlohn
      const ueberMindestlohn = stundenlohn >= MINDESTLOHN_2025;
      const differenzZumMindestlohn = stundenlohn - MINDESTLOHN_2025;
      const prozentUeberMindestlohn = ((stundenlohn / MINDESTLOHN_2025) - 1) * 100;
      
      return {
        richtung,
        // Eingabe
        stundenlohnEingabe: stundenlohn,
        // Arbeitszeit
        arbeitsStundenProMonat,
        arbeitsStundenProJahr,
        arbeitsTageProJahr,
        effektiveArbeitsstundenProJahr,
        // Ergebnis
        monatsgehaltAusStunde,
        jahresgehaltAusStunde,
        gesamtJahresgehalt,
        // Mindestlohn-Vergleich
        ueberMindestlohn,
        differenzZumMindestlohn,
        prozentUeberMindestlohn,
        // Für Anzeige
        tageslohn: stundenlohn * (stundenProWoche / 5),
        wochenlohn: stundenlohn * stundenProWoche,
      };
    }
  }, [richtung, monatsgehalt, jahresgehalt, eingabeart, stundenlohn, stundenProWoche, urlaubstage, feiertage, mitSonderzahlungen, urlaubsgeldMonate, weihnachtsgeldMonate]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRund = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatZahl = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const formatProzent = (n: number) => (n >= 0 ? '+' : '') + n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Richtungswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Was möchten Sie berechnen?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setRichtung('gehaltZuStunde')}
            className={`p-4 rounded-xl border-2 transition-all ${
              richtung === 'gehaltZuStunde'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">💰 → ⏱️</div>
            <div className="font-semibold text-gray-800">Gehalt → Stundenlohn</div>
            <div className="text-xs text-gray-500 mt-1">
              Ich kenne mein Monatsgehalt
            </div>
          </button>
          <button
            onClick={() => setRichtung('stundeZuGehalt')}
            className={`p-4 rounded-xl border-2 transition-all ${
              richtung === 'stundeZuGehalt'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">⏱️ → 💰</div>
            <div className="font-semibold text-gray-800">Stundenlohn → Gehalt</div>
            <div className="text-xs text-gray-500 mt-1">
              Ich kenne meinen Stundenlohn
            </div>
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {richtung === 'gehaltZuStunde' ? (
          <>
            {/* Gehalt-Eingabe */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Ihr Bruttogehalt</span>
              </label>
              
              {/* Monat/Jahr Toggle */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setEingabeart('monat')}
                  className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                    eingabeart === 'monat'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pro Monat
                </button>
                <button
                  onClick={() => setEingabeart('jahr')}
                  className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                    eingabeart === 'jahr'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pro Jahr
                </button>
              </div>

              {eingabeart === 'monat' ? (
                <div className="relative">
                  <input
                    type="number"
                    value={monatsgehalt}
                    onChange={(e) => setMonatsgehalt(Math.max(0, Number(e.target.value)))}
                    className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                    min="0"
                    max="20000"
                    step="100"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€ / Monat</span>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    value={jahresgehalt}
                    onChange={(e) => setJahresgehalt(Math.max(0, Number(e.target.value)))}
                    className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                    min="0"
                    max="200000"
                    step="1000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€ / Jahr</span>
                </div>
              )}
              
              <input
                type="range"
                value={eingabeart === 'monat' ? monatsgehalt : jahresgehalt}
                onChange={(e) => eingabeart === 'monat' 
                  ? setMonatsgehalt(Number(e.target.value))
                  : setJahresgehalt(Number(e.target.value))
                }
                className="w-full mt-3 accent-blue-500"
                min={eingabeart === 'monat' ? 1000 : 12000}
                max={eingabeart === 'monat' ? 10000 : 120000}
                step={eingabeart === 'monat' ? 100 : 1000}
              />
            </div>
          </>
        ) : (
          <>
            {/* Stundenlohn-Eingabe */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Ihr Stundenlohn (brutto)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={stundenlohn}
                  onChange={(e) => setStundenlohn(Math.max(0, Number(e.target.value)))}
                  className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                  max="200"
                  step="0.5"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€ / Std.</span>
              </div>
              <input
                type="range"
                value={stundenlohn}
                onChange={(e) => setStundenlohn(Number(e.target.value))}
                className="w-full mt-3 accent-blue-500"
                min="10"
                max="100"
                step="0.5"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10 €</span>
                <span>Mindestlohn: {formatEuro(MINDESTLOHN_2025)}</span>
                <span>100 €</span>
              </div>
            </div>
          </>
        )}

        {/* Arbeitszeit */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wochenarbeitszeit</span>
          </label>
          <div className="flex items-center justify-center gap-4 mb-2">
            <button
              onClick={() => setStundenProWoche(Math.max(1, stundenProWoche - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{stundenProWoche}</span>
              <span className="text-gray-500 ml-2">Std./Woche</span>
            </div>
            <button
              onClick={() => setStundenProWoche(Math.min(60, stundenProWoche + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-2">
            {[20, 30, 35, 38.5, 40].map((std) => (
              <button
                key={std}
                onClick={() => setStundenProWoche(std)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  stundenProWoche === std
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {std}h
              </button>
            ))}
          </div>
        </div>

        {/* Urlaubs- und Feiertage */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Urlaubstage/Jahr</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUrlaubstage(Math.max(20, urlaubstage - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-800 w-12 text-center">{urlaubstage}</span>
              <button
                onClick={() => setUrlaubstage(Math.min(40, urlaubstage + 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Feiertage/Jahr</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFeiertage(Math.max(9, feiertage - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-800 w-12 text-center">{feiertage}</span>
              <button
                onClick={() => setFeiertage(Math.min(14, feiertage + 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          * Feiertage variieren nach Bundesland: Bayern 13, Berlin 9, NRW 11
        </p>

        {/* Sonderzahlungen */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitSonderzahlungen}
              onChange={(e) => setMitSonderzahlungen(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">
              Urlaubs-/Weihnachtsgeld berücksichtigen
            </span>
          </label>
        </div>

        {mitSonderzahlungen && (
          <div className="bg-blue-50 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Urlaubsgeld</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  value={urlaubsgeldMonate}
                  onChange={(e) => setUrlaubsgeldMonate(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                  min="0"
                  max="1"
                  step="0.25"
                />
                <span className="text-sm font-medium w-24 text-right">
                  {urlaubsgeldMonate === 0 ? 'Kein' : `${urlaubsgeldMonate} Monatsgehalt${urlaubsgeldMonate > 1 ? 'er' : ''}`}
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
                  className="flex-1 accent-blue-500"
                  min="0"
                  max="2"
                  step="0.25"
                />
                <span className="text-sm font-medium w-24 text-right">
                  {weihnachtsgeldMonate === 0 ? 'Kein' : `${weihnachtsgeldMonate} Monatsgehalt${weihnachtsgeldMonate > 1 ? 'er' : ''}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        {richtung === 'gehaltZuStunde' ? (
          <>
            <h3 className="text-sm font-medium opacity-80 mb-1">⏱️ Ihr Stundenlohn (brutto)</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-bold">{formatEuro(ergebnis.stundenlohnBrutto as number)}</span>
              <span className="text-xl opacity-80">/ Stunde</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Tageslohn (brutto)</span>
                <div className="text-xl font-bold">{formatEuro(ergebnis.tageslohn)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Wochenlohn (brutto)</span>
                <div className="text-xl font-bold">{formatEuro(ergebnis.wochenlohn)}</div>
              </div>
            </div>

            {mitSonderzahlungen && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-4">
                <span className="text-sm opacity-80">Mit Sonderzahlungen</span>
                <div className="text-xl font-bold">{formatEuro(ergebnis.stundenlohnMitSonderzahlungen as number)}</div>
                <span className="text-xs opacity-70">Jahresgehalt inkl. Urlaubs-/Weihnachtsgeld ÷ Jahresstunden</span>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-sm font-medium opacity-80 mb-1">💰 Ihr Bruttogehalt</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-bold">{formatEuroRund(ergebnis.monatsgehaltAusStunde as number)}</span>
              <span className="text-xl opacity-80">/ Monat</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Jahresgehalt</span>
                <div className="text-xl font-bold">{formatEuroRund(ergebnis.jahresgehaltAusStunde as number)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Wochenlohn</span>
                <div className="text-xl font-bold">{formatEuro(ergebnis.wochenlohn)}</div>
              </div>
            </div>

            {mitSonderzahlungen && (
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Mit Urlaubs-/Weihnachtsgeld</span>
                <div className="text-xl font-bold">{formatEuroRund(ergebnis.gesamtJahresgehalt as number)} / Jahr</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mindestlohn-Vergleich */}
      <div className={`rounded-2xl shadow-lg p-6 mb-6 ${
        ergebnis.ueberMindestlohn 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <h3 className={`font-bold mb-3 ${ergebnis.ueberMindestlohn ? 'text-green-800' : 'text-red-800'}`}>
          {ergebnis.ueberMindestlohn ? '✅' : '⚠️'} Mindestlohn-Vergleich 2025
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${ergebnis.ueberMindestlohn ? 'text-green-700' : 'text-red-700'}`}>
              Gesetzlicher Mindestlohn: <strong>{formatEuro(MINDESTLOHN_2025)}</strong>
            </p>
            <p className={`text-sm mt-1 ${ergebnis.ueberMindestlohn ? 'text-green-700' : 'text-red-700'}`}>
              {richtung === 'gehaltZuStunde' 
                ? `Ihr Stundenlohn: ${formatEuro(ergebnis.stundenlohnBrutto as number)}`
                : `Ihr Stundenlohn: ${formatEuro(stundenlohn)}`
              }
            </p>
          </div>
          <div className={`text-2xl font-bold ${ergebnis.ueberMindestlohn ? 'text-green-600' : 'text-red-600'}`}>
            {formatProzent(ergebnis.prozentUeberMindestlohn)}
          </div>
        </div>
        {!ergebnis.ueberMindestlohn && (
          <p className="text-sm text-red-700 mt-3 font-medium">
            ⚠️ Achtung: Ihr Stundenlohn liegt unter dem gesetzlichen Mindestlohn!
          </p>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Arbeitszeit-Grundlage
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Wochenarbeitszeit</span>
            <span className="font-bold text-gray-900">{stundenProWoche} Stunden</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Arbeitsstunden / Monat</span>
            <span className="text-gray-900">{formatZahl(ergebnis.arbeitsStundenProMonat)} Stunden</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Arbeitsstunden / Jahr</span>
            <span className="text-gray-900">{formatZahl(ergebnis.arbeitsStundenProJahr)} Stunden</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Effektive Arbeitstage / Jahr</span>
            <span className="text-gray-900">{ergebnis.arbeitsTageProJahr} Tage</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-gray-400 text-xs">
            <span>(= 52 Wochen × 5 Tage − {urlaubstage} Urlaub − {feiertage} Feiertage)</span>
          </div>

          {richtung === 'gehaltZuStunde' ? (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                Stundenlohn-Berechnung
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Monatsgehalt (brutto)</span>
                <span className="font-bold text-gray-900">{formatEuro(ergebnis.basisMonatsgehalt as number)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">÷ Monatsstunden ({formatZahl(ergebnis.arbeitsStundenProMonat)})</span>
                <span className="text-gray-600">= Stundenlohn</span>
              </div>
              <div className="flex justify-between py-3 bg-blue-50 -mx-6 px-6">
                <span className="font-bold text-blue-800">Stundenlohn (brutto)</span>
                <span className="font-bold text-2xl text-blue-900">{formatEuro(ergebnis.stundenlohnBrutto as number)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                Gehalts-Berechnung
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Stundenlohn</span>
                <span className="font-bold text-gray-900">{formatEuro(stundenlohn)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">× Monatsstunden ({formatZahl(ergebnis.arbeitsStundenProMonat)})</span>
                <span className="text-gray-600">= Monatsgehalt</span>
              </div>
              <div className="flex justify-between py-3 bg-blue-50 -mx-6 px-6">
                <span className="font-bold text-blue-800">Monatsgehalt (brutto)</span>
                <span className="font-bold text-2xl text-blue-900">{formatEuro(ergebnis.monatsgehaltAusStunde as number)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Formel-Erklärung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔢 Formel: Stundenlohn berechnen</h3>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-center font-mono text-lg text-gray-800 mb-2">
            Stundenlohn = Monatsgehalt ÷ (Wochenstunden × 4,33)
          </p>
          <p className="text-center text-xs text-gray-500">
            4,33 = durchschnittliche Wochen pro Monat (52 ÷ 12)
          </p>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>Beispiel:</strong> Bei einem Monatsgehalt von 3.500 € brutto und 40 Wochenstunden:
          </p>
          <p className="font-mono bg-blue-50 p-3 rounded-lg">
            3.500 € ÷ (40 × 4,33) = 3.500 € ÷ 173,2 = <strong>20,21 € / Stunde</strong>
          </p>
        </div>
      </div>

      {/* Vergleichstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Stundenlohn-Übersicht (bei 40h/Woche)</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600 font-medium">Monatsgehalt</th>
                <th className="text-right py-2 text-gray-600 font-medium">Stundenlohn</th>
                <th className="text-right py-2 text-gray-600 font-medium">Jahresgehalt</th>
              </tr>
            </thead>
            <tbody>
              {[2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000].map((gehalt) => {
                const stunde = gehalt / (40 * 4.33);
                const unterMindestlohn = stunde < MINDESTLOHN_2025;
                return (
                  <tr 
                    key={gehalt} 
                    className={`border-b border-gray-100 ${
                      Math.abs(gehalt - (richtung === 'gehaltZuStunde' 
                        ? (eingabeart === 'monat' ? monatsgehalt : jahresgehalt / 12) 
                        : (ergebnis.monatsgehaltAusStunde as number))) < 200 
                        ? 'bg-blue-50' 
                        : ''
                    }`}
                  >
                    <td className="py-2">{formatEuroRund(gehalt)}</td>
                    <td className={`py-2 text-right font-medium ${unterMindestlohn ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatEuro(stunde)}
                    </td>
                    <td className="py-2 text-right text-gray-600">{formatEuroRund(gehalt * 12)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * Werte unter {formatEuro(MINDESTLOHN_2025)} liegen unter dem gesetzlichen Mindestlohn
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wissenswertes zum Stundenlohn</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mindestlohn 2025:</strong> Der gesetzliche Mindestlohn beträgt {formatEuro(MINDESTLOHN_2025)} pro Stunde</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Durchschnitt:</strong> Bei 40h/Woche gibt es ca. 173,3 Arbeitsstunden pro Monat</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Sonderzahlungen:</strong> Urlaubs- und Weihnachtsgeld erhöhen den effektiven Stundenlohn</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Teilzeit:</strong> Der Stundenlohn ist unabhängig von der Wochenarbeitszeit</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Brutto vs. Netto:</strong> Der berechnete Stundenlohn ist der Brutto-Wert vor Abzügen</span>
          </li>
        </ul>
      </div>

      {/* Mindestlohn-Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Mindestlohn in Deutschland 2025</h3>
        <div className="space-y-2 text-sm text-amber-700">
          <p>
            Der <strong>gesetzliche Mindestlohn</strong> beträgt seit 1. Januar 2025 <strong>{formatEuro(MINDESTLOHN_2025)}</strong> pro Stunde.
          </p>
          <p>Das entspricht bei einer 40-Stunden-Woche:</p>
          <ul className="space-y-1 pl-4">
            <li>• <strong>{formatEuro(MINDESTLOHN_2025 * 40)}</strong> pro Woche</li>
            <li>• <strong>{formatEuro(MINDESTLOHN_2025 * 173.33)}</strong> pro Monat</li>
            <li>• <strong>{formatEuroRund(MINDESTLOHN_2025 * 2080)}</strong> pro Jahr</li>
          </ul>
          <p className="mt-3">
            <strong>Ausnahmen:</strong> Auszubildende, Praktikanten unter bestimmten Bedingungen, 
            Langzeitarbeitslose in den ersten 6 Monaten.
          </p>
        </div>
      </div>

      {/* Wann Stundenlohn wichtig ist */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📌 Wann ist der Stundenlohn wichtig?</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="text-xl">🤝</span>
            <div>
              <strong className="text-gray-800">Gehaltsverhandlung</strong>
              <p>Vergleichen Sie Ihren Stundenlohn mit Branchenstandards</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">⏰</span>
            <div>
              <strong className="text-gray-800">Überstunden-Abrechnung</strong>
              <p>Basis für Überstundenvergütung und Zuschläge</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">📊</span>
            <div>
              <strong className="text-gray-800">Jobangebote vergleichen</strong>
              <p>Vergleichen Sie Angebote mit unterschiedlichen Wochenstunden</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">🏠</span>
            <div>
              <strong className="text-gray-800">Nebenjob/Freelancing</strong>
              <p>Setzen Sie Ihren fairen Stundensatz fest</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Informationen & Beratung</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Mindestlohn-Hotline</p>
            <p className="text-sm text-blue-700 mt-1">
              Für Fragen zum gesetzlichen Mindestlohn:
            </p>
            <p className="text-lg font-bold text-blue-900 mt-2">030 60 28 00 28</p>
            <p className="text-xs text-blue-600">
              Montag bis Donnerstag 8-20 Uhr, kostenfrei
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Mindestlohn-Info</p>
                <a 
                  href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Mindestlohn/mindestlohn.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  BMAS Mindestlohn →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">⚖️</span>
              <div>
                <p className="font-medium text-gray-800">Zoll – Kontrolle</p>
                <a 
                  href="https://www.zoll.de/DE/Fachthemen/Arbeit/Mindestlohn/mindestlohn_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Zoll Mindestlohn →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/milog/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Mindestlohngesetz (MiLoG) – Gesetze im Internet
          </a>
          <a 
            href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Mindestlohn/mindestlohn.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium für Arbeit und Soziales – Mindestlohn
          </a>
          <a 
            href="https://www.bundesregierung.de/breg-de/aktuelles/mindestlohn-2025"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – Mindestlohn 2025
          </a>
          <a 
            href="https://www.destatis.de/DE/Themen/Arbeit/Verdienste/Verdienste-Verdienstunterschiede/_inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Statistisches Bundesamt – Verdienste
          </a>
        </div>
      </div>
    </div>
  );
}
