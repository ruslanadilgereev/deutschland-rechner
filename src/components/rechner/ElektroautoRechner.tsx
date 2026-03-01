import { useState, useMemo } from 'react';

// Aktuelle Durchschnittswerte 2025/2026
const DEFAULTS = {
  strompreis: 0.35, // €/kWh Haushaltsstrom
  strompreisLadesaeule: 0.55, // €/kWh öffentliche Ladesäule
  benzinpreis: 1.70, // €/l Super E10
  dieselpreis: 1.60, // €/l Diesel
  verbrauchEAuto: 18, // kWh/100km Durchschnitt
  verbrauchBenzin: 7.5, // l/100km
  verbrauchDiesel: 6.5, // l/100km
  kmProJahr: 15000,
  haltedauerJahre: 8,
  kfzSteuerEAuto: 0, // Befreit bis 2030
  kfzSteuerBenzin: 150, // Durchschnitt
  kfzSteuerDiesel: 250, // Höher wegen Dieselsteuer
  versicherungEAuto: 600, // Durchschnitt p.a.
  versicherungVerbrenner: 700, // Durchschnitt p.a.
  wartungEAuto: 300, // Weniger Verschleißteile
  wartungVerbrenner: 600, // Ölwechsel, Bremsen etc.
  kaufpreisEAuto: 40000,
  kaufpreisVerbrenner: 35000,
  foerderungEAuto: 0, // Umweltbonus ausgelaufen 2023
  restwertEAutoPercent: 40, // Restwert nach Haltedauer
  restwertVerbrennerPercent: 35,
};

// E-Auto Fahrzeugtypen
const EAUTO_TYPEN = [
  { name: 'Kleinwagen', verbrauch: 14, beispiel: 'Fiat 500e, Mini Electric', emoji: '🚗' },
  { name: 'Kompaktklasse', verbrauch: 17, beispiel: 'VW ID.3, Tesla Model 3', emoji: '🚙' },
  { name: 'SUV / Mittelklasse', verbrauch: 20, beispiel: 'VW ID.4, Tesla Model Y', emoji: '🚐' },
  { name: 'Oberklasse / Luxus', verbrauch: 24, beispiel: 'Mercedes EQS, BMW iX', emoji: '🏎️' },
  { name: 'Eigener Wert', verbrauch: 0, beispiel: '', emoji: '⚙️' },
];

// Verbrenner Typen
const VERBRENNER_TYPEN = [
  { name: 'Kleinwagen Benzin', verbrauch: 5.5, kraftstoff: 'benzin' as const, beispiel: 'VW Polo, Opel Corsa', emoji: '🚗' },
  { name: 'Kompakt Benzin', verbrauch: 7, kraftstoff: 'benzin' as const, beispiel: 'VW Golf, Opel Astra', emoji: '🚙' },
  { name: 'Mittelklasse Benzin', verbrauch: 8, kraftstoff: 'benzin' as const, beispiel: 'VW Passat, BMW 3er', emoji: '🚘' },
  { name: 'SUV Benzin', verbrauch: 9.5, kraftstoff: 'benzin' as const, beispiel: 'VW Tiguan, BMW X3', emoji: '🚐' },
  { name: 'Kompakt Diesel', verbrauch: 5.5, kraftstoff: 'diesel' as const, beispiel: 'VW Golf TDI, Opel Astra D', emoji: '🚙' },
  { name: 'SUV Diesel', verbrauch: 7.5, kraftstoff: 'diesel' as const, beispiel: 'VW Tiguan TDI, BMW X3 D', emoji: '🚐' },
  { name: 'Eigener Wert', verbrauch: 0, kraftstoff: 'benzin' as const, beispiel: '', emoji: '⚙️' },
];

// CO2-Werte
const CO2_PRO_KWH_STROM = 0.38; // kg CO2 pro kWh (Strommix DE 2024)
const CO2_PRO_LITER_BENZIN = 2.37; // kg CO2 pro Liter
const CO2_PRO_LITER_DIESEL = 2.65; // kg CO2 pro Liter

export default function ElektroautoRechner() {
  // E-Auto Eingaben
  const [eAutoTyp, setEAutoTyp] = useState(1); // Kompaktklasse
  const [eAutoVerbrauchEigen, setEAutoVerbrauchEigen] = useState(18);
  const [strompreis, setStrompreis] = useState(DEFAULTS.strompreis);
  const [anteilHeimladen, setAnteilHeimladen] = useState(70); // % Laden zuhause
  const [strompreisLadesaeule, setStrompreisLadesaeule] = useState(DEFAULTS.strompreisLadesaeule);
  const [kaufpreisEAuto, setKaufpreisEAuto] = useState(DEFAULTS.kaufpreisEAuto);
  
  // Verbrenner Eingaben
  const [verbrennerTyp, setVerbrennerTyp] = useState(1); // Kompakt Benzin
  const [verbrennerVerbrauchEigen, setVerbrennerVerbrauchEigen] = useState(7.5);
  const [kraftstoffTyp, setKraftstoffTyp] = useState<'benzin' | 'diesel'>('benzin');
  const [benzinpreis, setBenzinpreis] = useState(DEFAULTS.benzinpreis);
  const [dieselpreis, setDieselpreis] = useState(DEFAULTS.dieselpreis);
  const [kaufpreisVerbrenner, setKaufpreisVerbrenner] = useState(DEFAULTS.kaufpreisVerbrenner);
  
  // Gemeinsame Eingaben
  const [kmProJahr, setKmProJahr] = useState(DEFAULTS.kmProJahr);
  const [haltedauerJahre, setHaltedauerJahre] = useState(DEFAULTS.haltedauerJahre);

  // Erweiterte Optionen
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [kfzSteuerEAuto, setKfzSteuerEAuto] = useState(DEFAULTS.kfzSteuerEAuto);
  const [kfzSteuerVerbrenner, setKfzSteuerVerbrenner] = useState(DEFAULTS.kfzSteuerBenzin);
  const [versicherungEAuto, setVersicherungEAuto] = useState(DEFAULTS.versicherungEAuto);
  const [versicherungVerbrenner, setVersicherungVerbrenner] = useState(DEFAULTS.versicherungVerbrenner);
  const [wartungEAuto, setWartungEAuto] = useState(DEFAULTS.wartungEAuto);
  const [wartungVerbrenner, setWartungVerbrenner] = useState(DEFAULTS.wartungVerbrenner);
  const [restwertEAutoPercent, setRestwertEAutoPercent] = useState(DEFAULTS.restwertEAutoPercent);
  const [restwertVerbrennerPercent, setRestwertVerbrennerPercent] = useState(DEFAULTS.restwertVerbrennerPercent);

  // Verbrauchswerte
  const verbrauchEAuto = eAutoTyp === 4 ? eAutoVerbrauchEigen : EAUTO_TYPEN[eAutoTyp].verbrauch;
  const verbrauchVerbrenner = verbrennerTyp === 6 ? verbrennerVerbrauchEigen : VERBRENNER_TYPEN[verbrennerTyp].verbrauch;
  const aktiverKraftstoff = verbrennerTyp < 6 ? VERBRENNER_TYPEN[verbrennerTyp].kraftstoff : kraftstoffTyp;
  const kraftstoffpreis = aktiverKraftstoff === 'benzin' ? benzinpreis : dieselpreis;
  
  // Update KFZ-Steuer wenn Kraftstofftyp wechselt
  const handleVerbrennerTypChange = (index: number) => {
    setVerbrennerTyp(index);
    if (index < 6) {
      const neuerTyp = VERBRENNER_TYPEN[index].kraftstoff;
      setKfzSteuerVerbrenner(neuerTyp === 'diesel' ? DEFAULTS.kfzSteuerDiesel : DEFAULTS.kfzSteuerBenzin);
    }
  };

  const ergebnis = useMemo(() => {
    const gesamtKm = kmProJahr * haltedauerJahre;
    
    // === E-AUTO KOSTEN ===
    // Durchschnittlicher Strompreis (Mix aus Heim & öffentlich)
    const avgStrompreis = (strompreis * anteilHeimladen / 100) + (strompreisLadesaeule * (100 - anteilHeimladen) / 100);
    
    // Energiekosten E-Auto
    const verbrauchKWhProJahr = (verbrauchEAuto / 100) * kmProJahr;
    const stromkostenProJahr = verbrauchKWhProJahr * avgStrompreis;
    const stromkostenGesamt = stromkostenProJahr * haltedauerJahre;
    
    // Fixkosten E-Auto
    const fixkostenEAutoProJahr = kfzSteuerEAuto + versicherungEAuto + wartungEAuto;
    const fixkostenEAutoGesamt = fixkostenEAutoProJahr * haltedauerJahre;
    
    // Wertverlust E-Auto
    const restwertEAuto = kaufpreisEAuto * (restwertEAutoPercent / 100);
    const wertverlustEAuto = kaufpreisEAuto - restwertEAuto;
    
    // Gesamtkosten E-Auto
    const gesamtkostenEAuto = wertverlustEAuto + stromkostenGesamt + fixkostenEAutoGesamt;
    const kostenProKmEAuto = gesamtkostenEAuto / gesamtKm;
    const kostenProMonatEAuto = gesamtkostenEAuto / (haltedauerJahre * 12);
    
    // === VERBRENNER KOSTEN ===
    // Kraftstoffkosten
    const verbrauchLiterProJahr = (verbrauchVerbrenner / 100) * kmProJahr;
    const kraftstoffkostenProJahr = verbrauchLiterProJahr * kraftstoffpreis;
    const kraftstoffkostenGesamt = kraftstoffkostenProJahr * haltedauerJahre;
    
    // Fixkosten Verbrenner
    const aktuelleKfzSteuer = aktiverKraftstoff === 'diesel' ? DEFAULTS.kfzSteuerDiesel : kfzSteuerVerbrenner;
    const fixkostenVerbrennerProJahr = aktuelleKfzSteuer + versicherungVerbrenner + wartungVerbrenner;
    const fixkostenVerbrennerGesamt = fixkostenVerbrennerProJahr * haltedauerJahre;
    
    // Wertverlust Verbrenner
    const restwertVerbrenner = kaufpreisVerbrenner * (restwertVerbrennerPercent / 100);
    const wertverlustVerbrenner = kaufpreisVerbrenner - restwertVerbrenner;
    
    // Gesamtkosten Verbrenner
    const gesamtkostenVerbrenner = wertverlustVerbrenner + kraftstoffkostenGesamt + fixkostenVerbrennerGesamt;
    const kostenProKmVerbrenner = gesamtkostenVerbrenner / gesamtKm;
    const kostenProMonatVerbrenner = gesamtkostenVerbrenner / (haltedauerJahre * 12);
    
    // === VERGLEICH ===
    const ersparnis = gesamtkostenVerbrenner - gesamtkostenEAuto;
    const ersparnisProJahr = ersparnis / haltedauerJahre;
    const ersparnisProMonat = ersparnis / (haltedauerJahre * 12);
    const mehrpreisEAuto = kaufpreisEAuto - kaufpreisVerbrenner;
    const amortisationJahre = mehrpreisEAuto > 0 && ersparnisProJahr > 0 
      ? mehrpreisEAuto / (ersparnisProJahr + (mehrpreisEAuto / haltedauerJahre))
      : 0;
    
    // === CO2 BERECHNUNG ===
    const co2EAutoProJahr = verbrauchKWhProJahr * CO2_PRO_KWH_STROM;
    const co2VerbrennerProJahr = verbrauchLiterProJahr * (aktiverKraftstoff === 'benzin' ? CO2_PRO_LITER_BENZIN : CO2_PRO_LITER_DIESEL);
    const co2EAutoGesamt = co2EAutoProJahr * haltedauerJahre;
    const co2VerbrennerGesamt = co2VerbrennerProJahr * haltedauerJahre;
    const co2Ersparnis = co2VerbrennerGesamt - co2EAutoGesamt;
    
    // Energiekosten pro 100km
    const energiekostenPro100kmEAuto = verbrauchEAuto * avgStrompreis;
    const energiekostenPro100kmVerbrenner = verbrauchVerbrenner * kraftstoffpreis;
    
    return {
      gesamtKm,
      // E-Auto
      avgStrompreis,
      verbrauchKWhProJahr,
      stromkostenProJahr,
      stromkostenGesamt,
      fixkostenEAutoProJahr,
      fixkostenEAutoGesamt,
      restwertEAuto,
      wertverlustEAuto,
      gesamtkostenEAuto,
      kostenProKmEAuto,
      kostenProMonatEAuto,
      energiekostenPro100kmEAuto,
      // Verbrenner
      verbrauchLiterProJahr,
      kraftstoffkostenProJahr,
      kraftstoffkostenGesamt,
      fixkostenVerbrennerProJahr,
      fixkostenVerbrennerGesamt,
      restwertVerbrenner,
      wertverlustVerbrenner,
      gesamtkostenVerbrenner,
      kostenProKmVerbrenner,
      kostenProMonatVerbrenner,
      energiekostenPro100kmVerbrenner,
      // Vergleich
      ersparnis,
      ersparnisProJahr,
      ersparnisProMonat,
      mehrpreisEAuto,
      amortisationJahre,
      // CO2
      co2EAutoProJahr,
      co2VerbrennerProJahr,
      co2EAutoGesamt,
      co2VerbrennerGesamt,
      co2Ersparnis,
    };
  }, [
    kmProJahr, haltedauerJahre, verbrauchEAuto, strompreis, anteilHeimladen, strompreisLadesaeule,
    kaufpreisEAuto, kfzSteuerEAuto, versicherungEAuto, wartungEAuto, restwertEAutoPercent,
    verbrauchVerbrenner, kraftstoffpreis, kaufpreisVerbrenner, kfzSteuerVerbrenner,
    versicherungVerbrenner, wartungVerbrenner, restwertVerbrennerPercent, aktiverKraftstoff
  ]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuro2 = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatNumber = (n: number, decimals = 1) => n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  const eAutoGewinner = ergebnis.gesamtkostenEAuto < ergebnis.gesamtkostenVerbrenner;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Schnellvergleich oben */}
      <div className="bg-gradient-to-br from-blue-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-2">⚡ Kostenvergleich über {haltedauerJahre} Jahre / {formatNumber(ergebnis.gesamtKm, 0)} km</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`p-4 rounded-xl ${eAutoGewinner ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔋</span>
              <span className="font-medium">E-Auto</span>
              {eAutoGewinner && <span className="text-xs bg-green-400/80 px-2 py-0.5 rounded-full">Günstiger</span>}
            </div>
            <div className="text-2xl font-bold">{formatEuro(ergebnis.gesamtkostenEAuto)}</div>
            <div className="text-sm opacity-80">{formatEuro(ergebnis.kostenProMonatEAuto)}/Monat</div>
          </div>
          
          <div className={`p-4 rounded-xl ${!eAutoGewinner ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⛽</span>
              <span className="font-medium">Verbrenner</span>
              {!eAutoGewinner && <span className="text-xs bg-green-400/80 px-2 py-0.5 rounded-full">Günstiger</span>}
            </div>
            <div className="text-2xl font-bold">{formatEuro(ergebnis.gesamtkostenVerbrenner)}</div>
            <div className="text-sm opacity-80">{formatEuro(ergebnis.kostenProMonatVerbrenner)}/Monat</div>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span>
              {ergebnis.ersparnis >= 0 
                ? `🎉 E-Auto spart ${formatEuro(Math.abs(ergebnis.ersparnis))}`
                : `💰 Verbrenner spart ${formatEuro(Math.abs(ergebnis.ersparnis))}`
              }
            </span>
            <span className="text-sm opacity-80">
              {formatEuro(Math.abs(ergebnis.ersparnisProMonat))}/Monat
            </span>
          </div>
        </div>
      </div>

      {/* Gemeinsame Parameter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Nutzungsdaten</h3>
        
        {/* Kilometer pro Jahr */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jahresfahrleistung</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wie viele Kilometer fahren Sie pro Jahr?
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kmProJahr}
              onChange={(e) => setKmProJahr(Number(e.target.value))}
              className="w-full p-4 pr-16 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
              min="1000"
              max="100000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">km/Jahr</span>
          </div>
          <input
            type="range"
            value={kmProJahr}
            onChange={(e) => setKmProJahr(Number(e.target.value))}
            className="w-full mt-2 accent-blue-500"
            min="5000"
            max="50000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5.000 km</span>
            <span className="font-medium text-gray-700">{formatNumber(kmProJahr, 0)} km</span>
            <span>50.000 km</span>
          </div>
        </div>

        {/* Haltedauer */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Geplante Haltedauer</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wie lange möchten Sie das Fahrzeug behalten?
            </span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[3, 5, 8, 10, 12].map((jahre) => (
              <button
                key={jahre}
                onClick={() => setHaltedauerJahre(jahre)}
                className={`py-3 px-2 rounded-xl font-medium transition-all text-sm ${
                  haltedauerJahre === jahre
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {jahre} Jahre
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* E-Auto Konfiguration */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔋</span> E-Auto Konfiguration
        </h3>

        {/* E-Auto Typ */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugtyp & Verbrauch</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EAUTO_TYPEN.map((typ, index) => (
              <button
                key={index}
                onClick={() => setEAutoTyp(index)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  eAutoTyp === index
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{typ.emoji}</span>
                <span className="block mt-1">{typ.name}</span>
                {typ.verbrauch > 0 && (
                  <span className="block text-xs opacity-70">{typ.verbrauch} kWh/100km</span>
                )}
              </button>
            ))}
          </div>
          {eAutoTyp === 4 && (
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                value={eAutoVerbrauchEigen}
                onChange={(e) => setEAutoVerbrauchEigen(Number(e.target.value))}
                className="w-32 p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 text-center"
                min="10"
                max="35"
                step="1"
              />
              <span className="text-gray-500">kWh/100km</span>
            </div>
          )}
          {eAutoTyp < 4 && EAUTO_TYPEN[eAutoTyp].beispiel && (
            <p className="text-xs text-gray-500 mt-2">
              z.B. {EAUTO_TYPEN[eAutoTyp].beispiel}
            </p>
          )}
        </div>

        {/* Strompreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Strompreis (zuhause)</span>
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={strompreis}
                onChange={(e) => setStrompreis(Number(e.target.value))}
                className="w-full p-4 pr-16 border-2 border-gray-200 rounded-xl focus:border-emerald-500 text-lg"
                min="0.15"
                max="0.60"
                step="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€/kWh</span>
            </div>
          </div>
          <input
            type="range"
            value={strompreis}
            onChange={(e) => setStrompreis(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
            min="0.20"
            max="0.50"
            step="0.01"
          />
        </div>

        {/* Anteil Heimladen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anteil Laden zuhause: {anteilHeimladen}%</span>
            <span className="text-xs text-gray-500 block mt-1">
              Rest an öffentlicher Ladesäule ({formatEuro2(strompreisLadesaeule)}/kWh)
            </span>
          </label>
          <input
            type="range"
            value={anteilHeimladen}
            onChange={(e) => setAnteilHeimladen(Number(e.target.value))}
            className="w-full accent-emerald-500"
            min="0"
            max="100"
            step="10"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0% (nur öffentlich)</span>
            <span>100% (nur zuhause)</span>
          </div>
          <p className="text-sm text-emerald-600 mt-2">
            → Durchschnittlicher Strompreis: {formatEuro2(ergebnis.avgStrompreis)}/kWh
          </p>
        </div>

        {/* Kaufpreis E-Auto */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kaufpreis E-Auto</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kaufpreisEAuto}
              onChange={(e) => setKaufpreisEAuto(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 text-lg"
              min="15000"
              max="150000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
          </div>
        </div>
      </div>

      {/* Verbrenner Konfiguration */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⛽</span> Verbrenner Konfiguration
        </h3>

        {/* Verbrenner Typ */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugtyp & Verbrauch</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VERBRENNER_TYPEN.map((typ, index) => (
              <button
                key={index}
                onClick={() => handleVerbrennerTypChange(index)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  verbrennerTyp === index
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{typ.emoji}</span>
                <span className="block mt-1 text-xs">{typ.name}</span>
                {typ.verbrauch > 0 && (
                  <span className="block text-xs opacity-70">{typ.verbrauch} l/100km</span>
                )}
              </button>
            ))}
          </div>
          {verbrennerTyp === 6 && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="number"
                value={verbrennerVerbrauchEigen}
                onChange={(e) => setVerbrennerVerbrauchEigen(Number(e.target.value))}
                className="w-32 p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 text-center"
                min="3"
                max="20"
                step="0.5"
              />
              <span className="text-gray-500">l/100km</span>
              <select
                value={kraftstoffTyp}
                onChange={(e) => setKraftstoffTyp(e.target.value as 'benzin' | 'diesel')}
                className="p-3 border-2 border-gray-200 rounded-xl"
              >
                <option value="benzin">Benzin</option>
                <option value="diesel">Diesel</option>
              </select>
            </div>
          )}
          {verbrennerTyp < 6 && VERBRENNER_TYPEN[verbrennerTyp].beispiel && (
            <p className="text-xs text-gray-500 mt-2">
              z.B. {VERBRENNER_TYPEN[verbrennerTyp].beispiel}
            </p>
          )}
        </div>

        {/* Kraftstoffpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">
              {aktiverKraftstoff === 'benzin' ? 'Benzinpreis (Super E10)' : 'Dieselpreis'}
            </span>
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={aktiverKraftstoff === 'benzin' ? benzinpreis : dieselpreis}
                onChange={(e) => {
                  if (aktiverKraftstoff === 'benzin') {
                    setBenzinpreis(Number(e.target.value));
                  } else {
                    setDieselpreis(Number(e.target.value));
                  }
                }}
                className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-orange-500 text-lg"
                min="1.00"
                max="2.50"
                step="0.01"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€/l</span>
            </div>
          </div>
          <input
            type="range"
            value={aktiverKraftstoff === 'benzin' ? benzinpreis : dieselpreis}
            onChange={(e) => {
              if (aktiverKraftstoff === 'benzin') {
                setBenzinpreis(Number(e.target.value));
              } else {
                setDieselpreis(Number(e.target.value));
              }
            }}
            className="w-full mt-2 accent-orange-500"
            min="1.20"
            max="2.30"
            step="0.01"
          />
        </div>

        {/* Kaufpreis Verbrenner */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kaufpreis Verbrenner</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kaufpreisVerbrenner}
              onChange={(e) => setKaufpreisVerbrenner(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-orange-500 text-lg"
              min="10000"
              max="150000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
          </div>
        </div>
      </div>

      {/* Erweiterte Optionen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between font-bold text-gray-800"
        >
          <span className="flex items-center gap-2">
            <span>⚙️</span> Erweiterte Optionen
          </span>
          <span className="text-xl">{showAdvanced ? '−' : '+'}</span>
        </button>
        
        {showAdvanced && (
          <div className="mt-6 space-y-6">
            {/* Kfz-Steuer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Kfz-Steuer E-Auto (€/Jahr)</label>
                <input
                  type="number"
                  value={kfzSteuerEAuto}
                  onChange={(e) => setKfzSteuerEAuto(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  min="0"
                  max="500"
                />
                <p className="text-xs text-gray-500 mt-1">Befreit bis 2030!</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Kfz-Steuer Verbrenner (€/Jahr)</label>
                <input
                  type="number"
                  value={kfzSteuerVerbrenner}
                  onChange={(e) => setKfzSteuerVerbrenner(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  min="0"
                  max="1000"
                />
              </div>
            </div>

            {/* Versicherung */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Versicherung E-Auto (€/Jahr)</label>
                <input
                  type="number"
                  value={versicherungEAuto}
                  onChange={(e) => setVersicherungEAuto(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  min="200"
                  max="2000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Versicherung Verbrenner (€/Jahr)</label>
                <input
                  type="number"
                  value={versicherungVerbrenner}
                  onChange={(e) => setVersicherungVerbrenner(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  min="200"
                  max="2000"
                />
              </div>
            </div>

            {/* Wartung */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Wartung E-Auto (€/Jahr)</label>
                <input
                  type="number"
                  value={wartungEAuto}
                  onChange={(e) => setWartungEAuto(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  min="100"
                  max="1500"
                />
                <p className="text-xs text-gray-500 mt-1">Weniger Verschleißteile</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Wartung Verbrenner (€/Jahr)</label>
                <input
                  type="number"
                  value={wartungVerbrenner}
                  onChange={(e) => setWartungVerbrenner(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  min="100"
                  max="1500"
                />
              </div>
            </div>

            {/* Restwert */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Restwert E-Auto nach {haltedauerJahre}J (%)</label>
                <input
                  type="number"
                  value={restwertEAutoPercent}
                  onChange={(e) => setRestwertEAutoPercent(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  min="10"
                  max="70"
                />
                <p className="text-xs text-gray-500 mt-1">= {formatEuro(kaufpreisEAuto * restwertEAutoPercent / 100)}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Restwert Verbrenner nach {haltedauerJahre}J (%)</label>
                <input
                  type="number"
                  value={restwertVerbrennerPercent}
                  onChange={(e) => setRestwertVerbrennerPercent(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  min="10"
                  max="70"
                />
                <p className="text-xs text-gray-500 mt-1">= {formatEuro(kaufpreisVerbrenner * restwertVerbrennerPercent / 100)}</p>
              </div>
            </div>

            {/* Strompreis öffentliche Ladesäule */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Strompreis öffentliche Ladesäule (€/kWh)</label>
              <input
                type="number"
                value={strompreisLadesaeule}
                onChange={(e) => setStrompreisLadesaeule(Number(e.target.value))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl"
                min="0.30"
                max="1.00"
                step="0.01"
              />
            </div>
          </div>
        )}
      </div>

      {/* Detaillierte Kostenaufstellung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Detaillierte Kostenaufstellung</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Kostenposition</th>
                <th className="text-right py-3 px-4 font-semibold text-emerald-700">🔋 E-Auto</th>
                <th className="text-right py-3 px-4 font-semibold text-orange-700">⛽ Verbrenner</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">Kaufpreis</td>
                <td className="py-3 px-4 text-right font-medium">{formatEuro(kaufpreisEAuto)}</td>
                <td className="py-3 px-4 text-right font-medium">{formatEuro(kaufpreisVerbrenner)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">− Restwert nach {haltedauerJahre}J</td>
                <td className="py-3 px-4 text-right text-green-600">−{formatEuro(ergebnis.restwertEAuto)}</td>
                <td className="py-3 px-4 text-right text-green-600">−{formatEuro(ergebnis.restwertVerbrenner)}</td>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="py-3 px-4 font-medium">= Wertverlust</td>
                <td className="py-3 px-4 text-right font-medium">{formatEuro(ergebnis.wertverlustEAuto)}</td>
                <td className="py-3 px-4 text-right font-medium">{formatEuro(ergebnis.wertverlustVerbrenner)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">
                  Energie ({haltedauerJahre}J)
                  <span className="block text-xs text-gray-400">
                    E-Auto: {formatNumber(ergebnis.verbrauchKWhProJahr * haltedauerJahre, 0)} kWh • 
                    Verbrenner: {formatNumber(ergebnis.verbrauchLiterProJahr * haltedauerJahre, 0)} l
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-medium">{formatEuro(ergebnis.stromkostenGesamt)}</td>
                <td className="py-3 px-4 text-right font-medium">{formatEuro(ergebnis.kraftstoffkostenGesamt)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">Kfz-Steuer ({haltedauerJahre}J)</td>
                <td className="py-3 px-4 text-right">{formatEuro(kfzSteuerEAuto * haltedauerJahre)}</td>
                <td className="py-3 px-4 text-right">{formatEuro(kfzSteuerVerbrenner * haltedauerJahre)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">Versicherung ({haltedauerJahre}J)</td>
                <td className="py-3 px-4 text-right">{formatEuro(versicherungEAuto * haltedauerJahre)}</td>
                <td className="py-3 px-4 text-right">{formatEuro(versicherungVerbrenner * haltedauerJahre)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">Wartung & Reparaturen ({haltedauerJahre}J)</td>
                <td className="py-3 px-4 text-right">{formatEuro(wartungEAuto * haltedauerJahre)}</td>
                <td className="py-3 px-4 text-right">{formatEuro(wartungVerbrenner * haltedauerJahre)}</td>
              </tr>
              <tr className={`${eAutoGewinner ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                <td className="py-4 px-4 font-bold text-gray-800">Gesamtkosten</td>
                <td className={`py-4 px-4 text-right font-bold text-lg ${eAutoGewinner ? 'text-emerald-700' : ''}`}>
                  {formatEuro(ergebnis.gesamtkostenEAuto)}
                </td>
                <td className={`py-4 px-4 text-right font-bold text-lg ${!eAutoGewinner ? 'text-orange-700' : ''}`}>
                  {formatEuro(ergebnis.gesamtkostenVerbrenner)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Kosten pro 100km */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">⚡ Energiekosten pro 100 km</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔋</span>
              <span className="font-medium text-emerald-800">E-Auto</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">{formatEuro2(ergebnis.energiekostenPro100kmEAuto)}</div>
            <p className="text-xs text-emerald-600 mt-1">
              {verbrauchEAuto} kWh × {formatEuro2(ergebnis.avgStrompreis)}
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⛽</span>
              <span className="font-medium text-orange-800">Verbrenner</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">{formatEuro2(ergebnis.energiekostenPro100kmVerbrenner)}</div>
            <p className="text-xs text-orange-600 mt-1">
              {verbrauchVerbrenner} l × {formatEuro2(kraftstoffpreis)}
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">
            💡 <strong>Ersparnis pro 100 km:</strong>{' '}
            {ergebnis.energiekostenPro100kmVerbrenner > ergebnis.energiekostenPro100kmEAuto
              ? `${formatEuro2(ergebnis.energiekostenPro100kmVerbrenner - ergebnis.energiekostenPro100kmEAuto)} mit E-Auto`
              : `${formatEuro2(ergebnis.energiekostenPro100kmEAuto - ergebnis.energiekostenPro100kmVerbrenner)} mit Verbrenner`
            }
          </p>
        </div>
      </div>

      {/* CO2 Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🌱 CO₂-Bilanz ({haltedauerJahre} Jahre)</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-emerald-50 rounded-xl">
            <span className="text-sm text-emerald-700">E-Auto (Strommix DE)</span>
            <p className="text-2xl font-bold text-emerald-800">{formatNumber(ergebnis.co2EAutoGesamt / 1000, 1)} t</p>
            <p className="text-xs text-emerald-600">{formatNumber(ergebnis.co2EAutoProJahr, 0)} kg/Jahr</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl">
            <span className="text-sm text-orange-700">Verbrenner ({aktiverKraftstoff === 'benzin' ? 'Benzin' : 'Diesel'})</span>
            <p className="text-2xl font-bold text-orange-800">{formatNumber(ergebnis.co2VerbrennerGesamt / 1000, 1)} t</p>
            <p className="text-xs text-orange-600">{formatNumber(ergebnis.co2VerbrennerProJahr, 0)} kg/Jahr</p>
          </div>
        </div>
        
        {ergebnis.co2Ersparnis > 0 && (
          <div className="p-4 bg-green-100 rounded-xl">
            <p className="font-medium text-green-800">
              🌍 E-Auto spart <strong>{formatNumber(ergebnis.co2Ersparnis / 1000, 1)} Tonnen CO₂</strong> ein!
            </p>
            <p className="text-xs text-green-600 mt-1">
              Das entspricht etwa {formatNumber(ergebnis.co2Ersparnis / 150, 0)} Bäumen, die {haltedauerJahre} Jahre lang wachsen.
            </p>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-3">
          Berechnung: E-Auto mit dt. Strommix ({formatNumber(CO2_PRO_KWH_STROM * 1000, 0)} g/kWh). 
          Mit eigenem PV-Strom deutlich weniger.
        </p>
      </div>

      {/* Wann lohnt sich ein E-Auto? */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🤔 Wann lohnt sich ein E-Auto?</h3>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex gap-3">
            <span className="text-lg">✅</span>
            <div>
              <strong className="text-gray-800">Hohe Fahrleistung:</strong>
              <p>Je mehr Kilometer, desto mehr sparen Sie beim Strom vs. Benzin/Diesel.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-lg">✅</span>
            <div>
              <strong className="text-gray-800">Laden zuhause möglich:</strong>
              <p>Haushaltsstrom ist deutlich günstiger als öffentliche Ladesäulen.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-lg">✅</span>
            <div>
              <strong className="text-gray-800">Photovoltaik:</strong>
              <p>Mit eigenem Solarstrom (~10 Cent/kWh) wird das E-Auto unschlagbar günstig.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-lg">✅</span>
            <div>
              <strong className="text-gray-800">Lange Haltedauer:</strong>
              <p>Der höhere Kaufpreis amortisiert sich über die niedrigeren Betriebskosten.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-lg">❌</span>
            <div>
              <strong className="text-gray-800">Wenig Fahrleistung:</strong>
              <p>Unter 10.000 km/Jahr dauert die Amortisation sehr lange.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-lg">❌</span>
            <div>
              <strong className="text-gray-800">Nur öffentlich laden:</strong>
              <p>Bei 0,55+ €/kWh schrumpft der Vorteil gegenüber Benzin deutlich.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">💡 Wussten Sie?</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>🔋</span>
            <span><strong>Steuerbefreiung:</strong> E-Autos sind bis 2030 von der Kfz-Steuer befreit!</span>
          </li>
          <li className="flex gap-2">
            <span>🔧</span>
            <span><strong>Wartung:</strong> E-Autos haben 30-50% niedrigere Wartungskosten (kein Ölwechsel, weniger Bremsenverschleiß durch Rekuperation).</span>
          </li>
          <li className="flex gap-2">
            <span>📉</span>
            <span><strong>Restwert:</strong> Der E-Auto-Markt entwickelt sich positiv - gebrauchte E-Autos halten ihren Wert zunehmend besser.</span>
          </li>
          <li className="flex gap-2">
            <span>☀️</span>
            <span><strong>PV-Strom:</strong> Mit eigener Solaranlage sinken die Stromkosten auf 8-12 Cent/kWh!</span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Weiterführende Links</h4>
        <div className="space-y-1">
          <a 
            href="https://www.adac.de/rund-ums-fahrzeug/elektromobilitaet/elektroauto-kostenvergleich/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Elektroauto Kostenvergleich
          </a>
          <a 
            href="https://www.bdew.de/energie/elektromobilitaet/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BDEW – Elektromobilität Strompreise
          </a>
          <a 
            href="https://www.zoll.de/DE/Privatpersonen/Kraftfahrzeugsteuer/kraftfahrzeugsteuer_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Zoll – Kfz-Steuer für Elektrofahrzeuge
          </a>
          <a 
            href="https://www.umweltbundesamt.de/themen/verkehr-laerm/emissionsdaten"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Umweltbundesamt – CO₂-Emissionen
          </a>
        </div>
      </div>
    </div>
  );
}
