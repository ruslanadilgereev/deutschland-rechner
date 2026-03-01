import { useState, useMemo } from 'react';

interface LeasingErgebnis {
  monatlicheRate: number;
  gesamtkosten: number;
  zinskosten: number;
  finanzierterBetrag: number;
  effektivzins: number;
  restwertAnteil: number;
  abschreibungProMonat: number;
  zinsanteilProMonat: number;
}

export default function AutoLeasingRechner() {
  const [fahrzeugpreis, setFahrzeugpreis] = useState(35000);
  const [anzahlung, setAnzahlung] = useState(5000);
  const [laufzeit, setLaufzeit] = useState(36);
  const [restwert, setRestwert] = useState(15000);
  const [zinssatz, setZinssatz] = useState(3.9);
  const [berechnungsmodus, setBerechnungsmodus] = useState<'rate' | 'restwert'>('rate');

  const ergebnis = useMemo((): LeasingErgebnis => {
    // Finanzierter Betrag = Fahrzeugpreis - Anzahlung
    const finanzierterBetrag = fahrzeugpreis - anzahlung;
    
    // Abschreibung = (Finanzierter Betrag - Restwert) über Laufzeit
    const abschreibung = finanzierterBetrag - restwert;
    const abschreibungProMonat = abschreibung / laufzeit;
    
    // Zinsberechnung: Durchschnittlich gebundenes Kapital
    // = (Finanzierter Betrag + Restwert) / 2
    const durchschnittlichGebunden = (finanzierterBetrag + restwert) / 2;
    const monatszins = zinssatz / 100 / 12;
    const zinsanteilProMonat = durchschnittlichGebunden * monatszins;
    
    // Monatliche Leasingrate = Abschreibung + Zinsen
    const monatlicheRate = abschreibungProMonat + zinsanteilProMonat;
    
    // Gesamtkosten über die Laufzeit
    const gesamtkosten = monatlicheRate * laufzeit + anzahlung;
    
    // Gesamte Zinskosten
    const zinskosten = zinsanteilProMonat * laufzeit;
    
    // Restwertanteil in Prozent
    const restwertAnteil = (restwert / fahrzeugpreis) * 100;
    
    // Effektivzins (vereinfacht)
    const effektivzins = zinssatz;
    
    return {
      monatlicheRate,
      gesamtkosten,
      zinskosten,
      finanzierterBetrag,
      effektivzins,
      restwertAnteil,
      abschreibungProMonat,
      zinsanteilProMonat,
    };
  }, [fahrzeugpreis, anzahlung, laufzeit, restwert, zinssatz]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => Math.round(n).toLocaleString('de-DE') + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' %';

  // Schnellauswahl für typische Fahrzeuge
  const fahrzeugBeispiele = [
    { name: 'Kleinwagen', icon: '🚗', preis: 20000, restwert: 9000, anzahlung: 2000 },
    { name: 'Kompaktklasse', icon: '🚙', preis: 30000, restwert: 13500, anzahlung: 3000 },
    { name: 'Mittelklasse', icon: '🚘', preis: 45000, restwert: 20000, anzahlung: 5000 },
    { name: 'SUV', icon: '🚐', preis: 55000, restwert: 27500, anzahlung: 7000 },
    { name: 'Premium/Oberklasse', icon: '🏎️', preis: 75000, restwert: 35000, anzahlung: 10000 },
    { name: 'Elektroauto', icon: '🔋', preis: 45000, restwert: 22000, anzahlung: 5000 },
  ];

  const laufzeitOptionen = [
    { monate: 12, label: '12 Monate (1 Jahr)' },
    { monate: 24, label: '24 Monate (2 Jahre)' },
    { monate: 36, label: '36 Monate (3 Jahre)' },
    { monate: 48, label: '48 Monate (4 Jahre)' },
    { monate: 60, label: '60 Monate (5 Jahre)' },
  ];

  // Automatischer Restwert-Vorschlag basierend auf Laufzeit (Faustregel)
  const berechneVorgeschlagenenRestwert = (preis: number, monate: number): number => {
    // Typische Wertverlust-Kurve: ~15% im 1. Jahr, danach ~10% pro Jahr
    const jahre = monate / 12;
    let wert = preis;
    if (jahre >= 1) wert *= 0.85; // 1. Jahr: -15%
    for (let i = 1; i < jahre; i++) {
      wert *= 0.90; // Folgejahre: -10%
    }
    return Math.round(wert / 100) * 100; // Auf 100er runden
  };

  const handleFahrzeugpreisChange = (neuerPreis: number) => {
    setFahrzeugpreis(neuerPreis);
    // Restwert automatisch anpassen (falls gewünscht)
    if (berechnungsmodus === 'rate') {
      const neuerRestwert = berechneVorgeschlagenenRestwert(neuerPreis, laufzeit);
      setRestwert(neuerRestwert);
    }
  };

  const handleLaufzeitChange = (neueLaufzeit: number) => {
    setLaufzeit(neueLaufzeit);
    // Restwert automatisch anpassen
    if (berechnungsmodus === 'rate') {
      const neuerRestwert = berechneVorgeschlagenenRestwert(fahrzeugpreis, neueLaufzeit);
      setRestwert(neuerRestwert);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Fahrzeugpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugpreis (brutto)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Listenpreis inkl. MwSt. und Sonderausstattung
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={fahrzeugpreis}
              onChange={(e) => handleFahrzeugpreisChange(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="200000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={fahrzeugpreis}
            onChange={(e) => handleFahrzeugpreisChange(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="10000"
            max="100000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10.000 €</span>
            <span>55.000 €</span>
            <span>100.000 €</span>
          </div>
        </div>

        {/* Schnellauswahl Fahrzeugtyp */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Schnellauswahl</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {fahrzeugBeispiele.map((beispiel) => (
              <button
                key={beispiel.name}
                onClick={() => {
                  setFahrzeugpreis(beispiel.preis);
                  setAnzahlung(beispiel.anzahlung);
                  setRestwert(beispiel.restwert);
                }}
                className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-orange-100 hover:border-orange-300 transition-colors text-left border border-transparent"
              >
                <span className="mr-1">{beispiel.icon}</span>
                {beispiel.name}
              </button>
            ))}
          </div>
        </div>

        {/* Anzahlung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahlung / Sonderzahlung</span>
            <span className="text-xs text-gray-500 block mt-1">
              Einmalzahlung zu Beginn (optional)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={anzahlung}
              onChange={(e) => setAnzahlung(Math.max(0, Math.min(fahrzeugpreis, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max={fahrzeugpreis}
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
          <input
            type="range"
            value={anzahlung}
            onChange={(e) => setAnzahlung(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max={Math.min(fahrzeugpreis * 0.5, 30000)}
            step="500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>{formatEuroRound(fahrzeugpreis * 0.1)} (10%)</span>
            <span>{formatEuroRound(fahrzeugpreis * 0.2)} (20%)</span>
          </div>
          {anzahlung > 0 && (
            <p className="text-sm text-orange-600 mt-2">
              = {((anzahlung / fahrzeugpreis) * 100).toFixed(1)}% des Fahrzeugpreises
            </p>
          )}
        </div>

        {/* Laufzeit */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Laufzeit</span>
            <span className="text-xs text-gray-500 block mt-1">
              Vertragsdauer in Monaten
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {laufzeitOptionen.map((option) => (
              <button
                key={option.monate}
                onClick={() => handleLaufzeitChange(option.monate)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  laufzeit === option.monate
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <input
              type="number"
              value={laufzeit}
              onChange={(e) => handleLaufzeitChange(Math.max(6, Math.min(84, Number(e.target.value))))}
              className="w-full text-center py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none text-lg"
              min="6"
              max="84"
              step="1"
            />
            <p className="text-xs text-gray-400 text-center mt-1">
              Individuelle Laufzeit (6–84 Monate)
            </p>
          </div>
        </div>

        {/* Restwert */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Restwert (kalkuliert)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Geschätzter Fahrzeugwert am Ende der Laufzeit
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={restwert}
              onChange={(e) => setRestwert(Math.max(0, Math.min(fahrzeugpreis - anzahlung, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max={fahrzeugpreis - anzahlung}
              step="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
          <input
            type="range"
            value={restwert}
            onChange={(e) => setRestwert(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max={fahrzeugpreis * 0.8}
            step="500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>{formatEuroRound(fahrzeugpreis * 0.4)} (40%)</span>
            <span>{formatEuroRound(fahrzeugpreis * 0.8)} (80%)</span>
          </div>
          <p className="text-sm text-orange-600 mt-2">
            = {ergebnis.restwertAnteil.toFixed(1)}% des Neupreises
          </p>
          <button
            onClick={() => setRestwert(berechneVorgeschlagenenRestwert(fahrzeugpreis, laufzeit))}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            💡 Typischen Restwert für {laufzeit} Monate berechnen
          </button>
        </div>

        {/* Zinssatz */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Leasingfaktor / Zinssatz</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jährlicher Zinssatz (effektiv)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={zinssatz}
              onChange={(e) => setZinssatz(Math.max(0, Math.min(20, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              max="20"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
          </div>
          <input
            type="range"
            value={zinssatz}
            onChange={(e) => setZinssatz(Number(e.target.value))}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max="12"
            step="0.1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>6%</span>
            <span>12%</span>
          </div>
          {zinssatz === 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ 0%-Finanzierung (Aktionsangebot)
            </p>
          )}
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🔑 Ihre monatliche Leasingrate</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.monatlicheRate)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          <p className="text-orange-100 mt-2 text-sm">
            über {laufzeit} Monate ({(laufzeit / 12).toFixed(1)} Jahre)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamtkosten</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.gesamtkosten)}</div>
            <p className="text-xs text-orange-100 mt-1">
              inkl. Anzahlung
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Zinskosten</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.zinskosten)}</div>
            <p className="text-xs text-orange-100 mt-1">
              über gesamte Laufzeit
            </p>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Grunddaten
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Fahrzeugpreis (brutto)</span>
            <span className="font-bold text-gray-900">{formatEuroRound(fahrzeugpreis)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">− Anzahlung</span>
            <span className="text-gray-900">− {formatEuroRound(anzahlung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">= Finanzierter Betrag</span>
            <span className="font-bold text-gray-900">{formatEuroRound(ergebnis.finanzierterBetrag)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">− Restwert nach {laufzeit} Monaten</span>
            <span className="text-gray-900">− {formatEuroRound(restwert)}</span>
          </div>
          <div className="flex justify-between py-2 bg-orange-50 -mx-6 px-6">
            <span className="font-medium text-orange-700">= Abzuschreibender Betrag</span>
            <span className="font-bold text-orange-900">{formatEuroRound(ergebnis.finanzierterBetrag - restwert)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Monatliche Rate
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Abschreibung pro Monat</span>
            <span className="text-gray-900">{formatEuro(ergebnis.abschreibungProMonat)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">+ Zinsanteil pro Monat</span>
            <span className="text-gray-900">+ {formatEuro(ergebnis.zinsanteilProMonat)}</span>
          </div>
          <div className="flex justify-between py-2 bg-orange-50 -mx-6 px-6">
            <span className="font-medium text-orange-700">= Monatliche Leasingrate</span>
            <span className="font-bold text-orange-900">{formatEuro(ergebnis.monatlicheRate)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Gesamtübersicht
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Anzahlung</span>
            <span className="text-gray-900">{formatEuroRound(anzahlung)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">+ {laufzeit} Raten à {formatEuro(ergebnis.monatlicheRate)}</span>
            <span className="text-gray-900">+ {formatEuroRound(ergebnis.monatlicheRate * laufzeit)}</span>
          </div>
          <div className="flex justify-between py-3 bg-orange-100 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-orange-800">Gesamtkosten (ohne Restwert)</span>
            <span className="font-bold text-2xl text-orange-900">{formatEuroRound(ergebnis.gesamtkosten)}</span>
          </div>
        </div>
      </div>

      {/* Leasingfaktor */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📈 Leasingfaktor-Check</h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Leasingfaktor</span>
            <span className="text-2xl font-bold text-orange-600">
              {((ergebnis.monatlicheRate / fahrzeugpreis) * 100).toFixed(3)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Der Leasingfaktor = (Rate / Listenpreis) × 100. Ein Wert unter 0,8 ist sehr gut, 
            bis 1,0 gut, darüber eher teuer.
          </p>
          <div className="mt-3">
            {((ergebnis.monatlicheRate / fahrzeugpreis) * 100) < 0.8 ? (
              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                ✓ Sehr guter Leasingfaktor
              </span>
            ) : ((ergebnis.monatlicheRate / fahrzeugpreis) * 100) < 1.0 ? (
              <span className="inline-flex items-center gap-1 text-yellow-600 font-medium">
                ○ Guter Leasingfaktor
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                ✗ Hoher Leasingfaktor – vergleichen Sie Angebote
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Vergleich: Leasing vs. Finanzierung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🔄 Leasing vs. Kauf</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-orange-50 rounded-xl p-4">
            <h4 className="font-semibold text-orange-800 mb-2">🔑 Leasing</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>✓ Geringere monatliche Belastung</li>
              <li>✓ Immer aktuelles Fahrzeug</li>
              <li>✓ Kein Restwertrisiko</li>
              <li>✗ Kein Eigentum am Fahrzeug</li>
              <li>✗ Km-Begrenzung & Rückgabebedingungen</li>
            </ul>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💰 Kauf / Finanzierung</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ Fahrzeug gehört Ihnen</li>
              <li>✓ Keine Km-Begrenzung</li>
              <li>✓ Freie Nutzung & Verkauf</li>
              <li>✗ Höhere monatliche Rate</li>
              <li>✗ Wertverlust-Risiko</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Kostenübersicht nach Laufzeitende */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Nach {laufzeit} Monaten</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Gezahlte Gesamtsumme</span>
            <span className="font-bold text-gray-900">{formatEuroRound(ergebnis.gesamtkosten)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Davon Zinskosten</span>
            <span className="font-bold text-red-600">{formatEuroRound(ergebnis.zinskosten)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Kalkulierter Restwert</span>
            <span className="font-bold text-green-600">{formatEuroRound(restwert)}</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">
              <strong>Rückgabe:</strong> Sie geben das Fahrzeug zurück. Bei einem Restwert von{' '}
              <strong>{formatEuroRound(restwert)}</strong> sollte das Fahrzeug in gutem Zustand sein.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Übernahme:</strong> Sie können das Fahrzeug zum Restwert kaufen 
              (Gesamtkosten dann: {formatEuroRound(ergebnis.gesamtkosten + restwert)}).
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert Autoleasing</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Leasingrate:</strong> Setzt sich aus Abschreibung und Zinsen zusammen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Restwert:</strong> Geschätzter Fahrzeugwert am Vertragsende – je höher, desto niediger die Rate</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Anzahlung:</strong> Senkt die monatliche Rate, erhöht aber die Anfangskosten</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kilometerleasing:</strong> Vereinbarte Km-Grenze – Mehr- oder Minderkilometer werden verrechnet</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Restwertleasing:</strong> Risiko bei Rückgabe, wenn Fahrzeugwert unter Restwert liegt</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kilometer:</strong> Überschreiten Sie die vereinbarte Km-Zahl, werden Mehrkilometer berechnet (oft 10-20 Cent/km)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Rückgabezustand:</strong> Übermäßiger Verschleiß kann zu Nachzahlungen führen</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Vollkasko:</strong> Meist vorgeschrieben – Versicherungskosten einplanen</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>GAP-Deckung:</strong> Bei Totalschaden die Differenz zum Restwert absichern</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Gewerbeleasing:</strong> Für Unternehmen steuerlich absetzbar (Betriebsausgabe)</span>
          </li>
        </ul>
      </div>

      {/* Checkliste */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-orange-800 mb-3">✅ Leasing-Checkliste</h3>
        <div className="space-y-2 text-sm text-orange-700">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="mt-1 accent-orange-500" />
            <span>Leasingfaktor mit anderen Angeboten verglichen?</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="mt-1 accent-orange-500" />
            <span>Kilometerbegrenzung realistisch eingeschätzt?</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="mt-1 accent-orange-500" />
            <span>Zusatzkosten geprüft (Überführung, Zulassung)?</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="mt-1 accent-orange-500" />
            <span>Vollkaskoversicherung eingeplant?</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="mt-1 accent-orange-500" />
            <span>GAP-Deckung / Leasingratenabsicherung?</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="mt-1 accent-orange-500" />
            <span>Rückgabebedingungen gelesen?</span>
          </label>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & weiterführende Informationen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/autofinanzierung/leasing/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Leasing: Vorteile, Nachteile, Tipps
          </a>
          <a 
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/kredit-schulden-insolvenz/autoleasing-14061"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Autoleasing
          </a>
          <a 
            href="https://www.bfh.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzhof – Steuerliche Behandlung von Leasing
          </a>
        </div>
      </div>
    </div>
  );
}
