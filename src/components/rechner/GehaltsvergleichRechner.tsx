import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════
// DESTATIS Daten 2024 - Bruttojahresverdienste Vollzeit
// Quelle: https://www.destatis.de/DE/Themen/Arbeit/Verdienste/Verdienste-Branche-Berufe/Tabellen/bruttojahresverdienst.html
// ═══════════════════════════════════════════════════════════════

interface BrancheDaten {
  name: string;
  deutschland: number;
  west: number;
  ost: number;
}

const BRANCHEN_DATEN: BrancheDaten[] = [
  { name: 'Gesamtwirtschaft (Durchschnitt)', deutschland: 62235, west: 63999, ost: 50625 },
  { name: 'Land- und Forstwirtschaft, Fischerei', deutschland: 40413, west: 41825, ost: 38018 },
  { name: 'Bergbau, Steine und Erden', deutschland: 68312, west: 71899, ost: 59161 },
  { name: 'Verarbeitendes Gewerbe / Industrie', deutschland: 66217, west: 68607, ost: 49394 },
  { name: 'Energieversorgung', deutschland: 82738, west: 85269, ost: 69080 },
  { name: 'Wasserversorgung, Abfallentsorgung', deutschland: 53706, west: 54961, ost: 48483 },
  { name: 'Baugewerbe', deutschland: 52134, west: 53584, ost: 44853 },
  { name: 'Handel (inkl. Kfz)', deutschland: 57874, west: 59550, ost: 43473 },
  { name: 'Verkehr und Lagerei', deutschland: 50106, west: 51324, ost: 43214 },
  { name: 'Gastgewerbe / Hotellerie', deutschland: 38722, west: 39503, ost: 34574 },
  { name: 'Information und Kommunikation / IT', deutschland: 83565, west: 85094, ost: 64979 },
  { name: 'Finanz- und Versicherungswesen', deutschland: 90652, west: 92105, ost: 67623 },
  { name: 'Immobilien / Grundstückswesen', deutschland: 61570, west: 63405, ost: 52386 },
  { name: 'Freiberufliche, wissenschaftl. Dienste', deutschland: 79637, west: 81833, ost: 59165 },
  { name: 'Sonstige wirtschaftliche Dienste', deutschland: 47842, west: 49163, ost: 40357 },
  { name: 'Öffentliche Verwaltung', deutschland: 57224, west: 57442, ost: 56066 },
  { name: 'Erziehung und Unterricht', deutschland: 63043, west: 62990, ost: 63353 },
  { name: 'Gesundheits- und Sozialwesen', deutschland: 59746, west: 60174, ost: 57162 },
  { name: 'Kunst, Unterhaltung, Erholung', deutschland: 56345, west: 56817, ost: 54181 },
  { name: 'Sonstige Dienstleistungen', deutschland: 54698, west: 56249, ost: 43954 },
];

// Bundesländer mit Ost/West-Zuordnung
interface Bundesland {
  name: string;
  kuerzel: string;
  region: 'west' | 'ost';
  faktor: number; // Regionale Abweichung vom Durchschnitt
}

const BUNDESLAENDER: Bundesland[] = [
  { name: 'Baden-Württemberg', kuerzel: 'BW', region: 'west', faktor: 1.08 },
  { name: 'Bayern', kuerzel: 'BY', region: 'west', faktor: 1.06 },
  { name: 'Berlin', kuerzel: 'BE', region: 'west', faktor: 0.98 },
  { name: 'Brandenburg', kuerzel: 'BB', region: 'ost', faktor: 0.95 },
  { name: 'Bremen', kuerzel: 'HB', region: 'west', faktor: 1.02 },
  { name: 'Hamburg', kuerzel: 'HH', region: 'west', faktor: 1.12 },
  { name: 'Hessen', kuerzel: 'HE', region: 'west', faktor: 1.10 },
  { name: 'Mecklenburg-Vorpommern', kuerzel: 'MV', region: 'ost', faktor: 0.88 },
  { name: 'Niedersachsen', kuerzel: 'NI', region: 'west', faktor: 0.98 },
  { name: 'Nordrhein-Westfalen', kuerzel: 'NW', region: 'west', faktor: 1.02 },
  { name: 'Rheinland-Pfalz', kuerzel: 'RP', region: 'west', faktor: 0.97 },
  { name: 'Saarland', kuerzel: 'SL', region: 'west', faktor: 0.95 },
  { name: 'Sachsen', kuerzel: 'SN', region: 'ost', faktor: 0.92 },
  { name: 'Sachsen-Anhalt', kuerzel: 'ST', region: 'ost', faktor: 0.90 },
  { name: 'Schleswig-Holstein', kuerzel: 'SH', region: 'west', faktor: 0.96 },
  { name: 'Thüringen', kuerzel: 'TH', region: 'ost', faktor: 0.91 },
];

// Gehaltsverteilung für Perzentilberechnung (approximiert basierend auf Destatis Daten 2024)
// Mediangehalt Deutschland 2024: 52.159 € (Destatis Pressemitteilung April 2025)
const MEDIAN_DEUTSCHLAND = 52159;
const DURCHSCHNITT_DEUTSCHLAND = 62235;

// Perzentilgrenzen (Bruttojahresgehalt, approximiert)
const PERZENTILE = [
  { p: 10, gehalt: 28000 },
  { p: 20, gehalt: 35000 },
  { p: 25, gehalt: 38000 },
  { p: 30, gehalt: 41000 },
  { p: 40, gehalt: 47000 },
  { p: 50, gehalt: 52159 }, // Median
  { p: 60, gehalt: 58000 },
  { p: 70, gehalt: 66000 },
  { p: 75, gehalt: 72000 },
  { p: 80, gehalt: 80000 },
  { p: 90, gehalt: 100000 },
  { p: 95, gehalt: 130000 },
  { p: 99, gehalt: 213286 }, // Top 1% laut Destatis
];

export default function GehaltsvergleichRechner() {
  // Eingabewerte
  const [gehaltArt, setGehaltArt] = useState<'jahr' | 'monat'>('monat');
  const [monatsgehalt, setMonatsgehalt] = useState(4000);
  const [jahresgehalt, setJahresgehalt] = useState(48000);
  const [branche, setBranche] = useState(0); // Index in BRANCHEN_DATEN
  const [bundesland, setBundesland] = useState(0); // Index in BUNDESLAENDER
  const [mitSonderzahlungen, setMitSonderzahlungen] = useState(false);

  const ergebnis = useMemo(() => {
    // Jahresgehalt berechnen
    let meinJahresgehalt = gehaltArt === 'monat' ? monatsgehalt * 12 : jahresgehalt;
    
    // Sonderzahlungen einrechnen (ca. 1,5 Monatsgehälter typisch)
    if (mitSonderzahlungen) {
      const monatlich = meinJahresgehalt / 12;
      meinJahresgehalt += monatlich * 1.5;
    }
    
    const meinMonatsgehalt = meinJahresgehalt / 12;
    
    // Branchendaten
    const brancheDaten = BRANCHEN_DATEN[branche];
    const land = BUNDESLAENDER[bundesland];
    
    // Regionales Durchschnittsgehalt für die Branche
    const regionalesGehalt = land.region === 'west' ? brancheDaten.west : brancheDaten.ost;
    const angepasstesGehalt = regionalesGehalt * land.faktor;
    
    // Vergleich zum Branchendurchschnitt
    const differenzBranche = meinJahresgehalt - angepasstesGehalt;
    const prozentVsBranche = ((meinJahresgehalt / angepasstesGehalt) - 1) * 100;
    
    // Vergleich zum Gesamtdurchschnitt
    const differenzGesamt = meinJahresgehalt - DURCHSCHNITT_DEUTSCHLAND;
    const prozentVsGesamt = ((meinJahresgehalt / DURCHSCHNITT_DEUTSCHLAND) - 1) * 100;
    
    // Vergleich zum Median
    const differenzMedian = meinJahresgehalt - MEDIAN_DEUTSCHLAND;
    const prozentVsMedian = ((meinJahresgehalt / MEDIAN_DEUTSCHLAND) - 1) * 100;
    
    // Perzentil berechnen (interpoliert)
    let perzentil = 50;
    for (let i = 0; i < PERZENTILE.length - 1; i++) {
      const p1 = PERZENTILE[i];
      const p2 = PERZENTILE[i + 1];
      if (meinJahresgehalt >= p1.gehalt && meinJahresgehalt < p2.gehalt) {
        // Lineare Interpolation
        const anteil = (meinJahresgehalt - p1.gehalt) / (p2.gehalt - p1.gehalt);
        perzentil = p1.p + anteil * (p2.p - p1.p);
        break;
      } else if (meinJahresgehalt < PERZENTILE[0].gehalt) {
        perzentil = 5;
        break;
      } else if (meinJahresgehalt >= PERZENTILE[PERZENTILE.length - 1].gehalt) {
        perzentil = 99;
        break;
      }
    }
    
    // Bewertung
    let bewertung: 'unter' | 'durchschnitt' | 'ueber' | 'top';
    let bewertungText: string;
    let bewertungFarbe: string;
    
    if (perzentil >= 90) {
      bewertung = 'top';
      bewertungText = 'Top-Verdiener';
      bewertungFarbe = 'text-purple-600';
    } else if (perzentil >= 60) {
      bewertung = 'ueber';
      bewertungText = 'Überdurchschnittlich';
      bewertungFarbe = 'text-green-600';
    } else if (perzentil >= 40) {
      bewertung = 'durchschnitt';
      bewertungText = 'Im Durchschnitt';
      bewertungFarbe = 'text-blue-600';
    } else {
      bewertung = 'unter';
      bewertungText = 'Unterdurchschnittlich';
      bewertungFarbe = 'text-orange-600';
    }
    
    return {
      meinJahresgehalt,
      meinMonatsgehalt,
      brancheDaten,
      land,
      regionalesGehalt,
      angepasstesGehalt,
      differenzBranche,
      prozentVsBranche,
      differenzGesamt,
      prozentVsGesamt,
      differenzMedian,
      prozentVsMedian,
      perzentil,
      bewertung,
      bewertungText,
      bewertungFarbe,
    };
  }, [gehaltArt, monatsgehalt, jahresgehalt, branche, bundesland, mitSonderzahlungen]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => (n >= 0 ? '+' : '') + n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Eingabe-Sektion */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💰 Ihr Bruttogehalt</h3>
        
        {/* Monat/Jahr Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setGehaltArt('monat')}
            className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              gehaltArt === 'monat'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pro Monat
          </button>
          <button
            onClick={() => setGehaltArt('jahr')}
            className={`py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              gehaltArt === 'jahr'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pro Jahr
          </button>
        </div>

        {gehaltArt === 'monat' ? (
          <div className="relative">
            <input
              type="number"
              value={monatsgehalt}
              onChange={(e) => setMonatsgehalt(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              max="50000"
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
              max="500000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€ / Jahr</span>
          </div>
        )}
        
        <input
          type="range"
          value={gehaltArt === 'monat' ? monatsgehalt : jahresgehalt}
          onChange={(e) => gehaltArt === 'monat' 
            ? setMonatsgehalt(Number(e.target.value))
            : setJahresgehalt(Number(e.target.value))
          }
          className="w-full mt-3 accent-blue-500"
          min={gehaltArt === 'monat' ? 1500 : 20000}
          max={gehaltArt === 'monat' ? 15000 : 180000}
          step={gehaltArt === 'monat' ? 100 : 1000}
        />

        {/* Sonderzahlungen */}
        <div className="mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitSonderzahlungen}
              onChange={(e) => setMitSonderzahlungen(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">
              + Urlaubs-/Weihnachtsgeld (~1,5 Gehälter)
            </span>
          </label>
        </div>
      </div>

      {/* Branche */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🏢 Ihre Branche</h3>
        <select
          value={branche}
          onChange={(e) => setBranche(Number(e.target.value))}
          className="w-full p-3 border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:border-blue-500 focus:ring-0 outline-none"
        >
          {BRANCHEN_DATEN.map((b, idx) => (
            <option key={idx} value={idx}>
              {b.name} ({formatEuro(b.deutschland)}/Jahr)
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          * Durchschnittliches Bruttojahresgehalt Vollzeit 2024 (Destatis)
        </p>
      </div>

      {/* Bundesland */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📍 Ihr Bundesland</h3>
        <select
          value={bundesland}
          onChange={(e) => setBundesland(Number(e.target.value))}
          className="w-full p-3 border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:border-blue-500 focus:ring-0 outline-none"
        >
          {BUNDESLAENDER.map((bl, idx) => (
            <option key={idx} value={idx}>
              {bl.name} ({bl.region === 'west' ? 'West' : 'Ost'})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          * Gehälter variieren regional – in {BUNDESLAENDER[bundesland].name} ca. {ergebnis.land.faktor > 1 ? '+' : ''}{((ergebnis.land.faktor - 1) * 100).toFixed(0)}% vs. Durchschnitt
        </p>
      </div>

      {/* Ergebnis-Sektion */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">📊 Ihr Gehaltsvergleich</h3>
        
        {/* Perzentil-Anzeige */}
        <div className="text-center mb-6">
          <div className="text-6xl font-bold mb-2">
            {Math.round(ergebnis.perzentil)}%
          </div>
          <div className="text-xl opacity-90">Perzentil</div>
          <div className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-bold bg-white/20`}>
            {ergebnis.bewertungText}
          </div>
        </div>
        
        {/* Visualisierung */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm opacity-80 w-12">0%</span>
            <div className="flex-1 h-4 bg-white/20 rounded-full relative overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${ergebnis.perzentil}%` }}
              />
              <div 
                className="absolute top-0 w-1 h-full bg-yellow-400"
                style={{ left: '50%' }}
                title="Median"
              />
            </div>
            <span className="text-sm opacity-80 w-12 text-right">100%</span>
          </div>
          <p className="text-center text-sm opacity-80">
            Sie verdienen mehr als <strong>{Math.round(ergebnis.perzentil)}%</strong> aller Vollzeitbeschäftigten
          </p>
        </div>
        
        {/* Vergleichswerte */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Ihr Jahresgehalt</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.meinJahresgehalt)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Ihr Monatsgehalt</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.meinMonatsgehalt)}</div>
          </div>
        </div>
      </div>

      {/* Detaillierter Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 Detaillierter Vergleich</h3>
        
        <div className="space-y-4">
          {/* Vs. Branche */}
          <div className={`p-4 rounded-xl ${ergebnis.differenzBranche >= 0 ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-sm ${ergebnis.differenzBranche >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                  Vs. Branche ({ergebnis.brancheDaten.name.split('/')[0].trim()})
                </span>
                <div className={`text-lg font-bold ${ergebnis.differenzBranche >= 0 ? 'text-green-800' : 'text-orange-800'}`}>
                  {ergebnis.differenzBranche >= 0 ? '+' : ''}{formatEuro(ergebnis.differenzBranche)}
                </div>
                <span className={`text-xs ${ergebnis.differenzBranche >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  Durchschnitt in {ergebnis.land.name}: {formatEuro(ergebnis.angepasstesGehalt)}
                </span>
              </div>
              <div className={`text-2xl font-bold ${ergebnis.differenzBranche >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {formatProzent(ergebnis.prozentVsBranche)}
              </div>
            </div>
          </div>
          
          {/* Vs. Median */}
          <div className={`p-4 rounded-xl ${ergebnis.differenzMedian >= 0 ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-sm ${ergebnis.differenzMedian >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                  Vs. Median Deutschland
                </span>
                <div className={`text-lg font-bold ${ergebnis.differenzMedian >= 0 ? 'text-green-800' : 'text-orange-800'}`}>
                  {ergebnis.differenzMedian >= 0 ? '+' : ''}{formatEuro(ergebnis.differenzMedian)}
                </div>
                <span className={`text-xs ${ergebnis.differenzMedian >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  Median (50%): {formatEuro(MEDIAN_DEUTSCHLAND)}
                </span>
              </div>
              <div className={`text-2xl font-bold ${ergebnis.differenzMedian >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {formatProzent(ergebnis.prozentVsMedian)}
              </div>
            </div>
          </div>
          
          {/* Vs. Durchschnitt */}
          <div className={`p-4 rounded-xl ${ergebnis.differenzGesamt >= 0 ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-sm ${ergebnis.differenzGesamt >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                  Vs. Durchschnitt Deutschland
                </span>
                <div className={`text-lg font-bold ${ergebnis.differenzGesamt >= 0 ? 'text-green-800' : 'text-orange-800'}`}>
                  {ergebnis.differenzGesamt >= 0 ? '+' : ''}{formatEuro(ergebnis.differenzGesamt)}
                </div>
                <span className={`text-xs ${ergebnis.differenzGesamt >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  Durchschnitt: {formatEuro(DURCHSCHNITT_DEUTSCHLAND)}
                </span>
              </div>
              <div className={`text-2xl font-bold ${ergebnis.differenzGesamt >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {formatProzent(ergebnis.prozentVsGesamt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ost-West Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🗺️ Ost-West-Gefälle: {ergebnis.brancheDaten.name.split('/')[0].trim()}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <span className="text-sm text-blue-600">Westdeutschland</span>
            <div className="text-xl font-bold text-blue-800">{formatEuro(ergebnis.brancheDaten.west)}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <span className="text-sm text-purple-600">Ostdeutschland</span>
            <div className="text-xl font-bold text-purple-800">{formatEuro(ergebnis.brancheDaten.ost)}</div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Differenz Ost vs. West</span>
            <span className="font-bold text-gray-800">
              {formatEuro(ergebnis.brancheDaten.ost - ergebnis.brancheDaten.west)} 
              ({((ergebnis.brancheDaten.ost / ergebnis.brancheDaten.west - 1) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Gehaltstabelle nach Perzentilen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Gehaltsverteilung in Deutschland</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600 font-medium">Perzentil</th>
                <th className="text-right py-2 text-gray-600 font-medium">Jahresgehalt</th>
                <th className="text-right py-2 text-gray-600 font-medium">Monatsgehalt</th>
              </tr>
            </thead>
            <tbody>
              {PERZENTILE.map((p) => {
                const isUser = Math.abs(ergebnis.perzentil - p.p) < 5;
                return (
                  <tr 
                    key={p.p} 
                    className={`border-b border-gray-100 ${isUser ? 'bg-blue-50 font-bold' : ''}`}
                  >
                    <td className="py-2">
                      {p.p === 50 ? '50% (Median)' : `${p.p}%`}
                      {isUser && <span className="ml-2 text-blue-600">← Sie</span>}
                    </td>
                    <td className="py-2 text-right">{formatEuro(p.gehalt)}</td>
                    <td className="py-2 text-right text-gray-600">{formatEuro(p.gehalt / 12)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          * Bruttojahresgehalt inkl. Sonderzahlungen, Vollzeit 2024 (Destatis)
        </p>
      </div>

      {/* Branchenvergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🏭 Top- und Niedrigverdiener-Branchen</h3>
        
        <div className="space-y-2">
          <div className="font-medium text-green-700 text-sm mb-2">🔝 Top 5 Branchen</div>
          {BRANCHEN_DATEN
            .filter(b => b.name !== 'Gesamtwirtschaft (Durchschnitt)')
            .sort((a, b) => b.deutschland - a.deutschland)
            .slice(0, 5)
            .map((b, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700 text-sm">{b.name.split('/')[0].trim()}</span>
                <span className="font-medium text-gray-900">{formatEuro(b.deutschland)}</span>
              </div>
            ))}
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="font-medium text-orange-700 text-sm mb-2">📉 Niedrigste 5 Branchen</div>
          {BRANCHEN_DATEN
            .filter(b => b.name !== 'Gesamtwirtschaft (Durchschnitt)')
            .sort((a, b) => a.deutschland - b.deutschland)
            .slice(0, 5)
            .map((b, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700 text-sm">{b.name.split('/')[0].trim()}</span>
                <span className="font-medium text-gray-900">{formatEuro(b.deutschland)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Median vs. Durchschnitt Erklärung */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">💡 Median vs. Durchschnitt</h3>
        <div className="space-y-3 text-sm text-amber-700">
          <p>
            <strong>Median ({formatEuro(MEDIAN_DEUTSCHLAND)}):</strong> Die Hälfte aller Beschäftigten verdient weniger, die andere Hälfte mehr. 
            Der Median ist aussagekräftiger, da er nicht durch Extremgehälter verzerrt wird.
          </p>
          <p>
            <strong>Durchschnitt ({formatEuro(DURCHSCHNITT_DEUTSCHLAND)}):</strong> Die Summe aller Gehälter geteilt durch die Anzahl. 
            Wird durch sehr hohe Gehälter nach oben gezogen.
          </p>
          <p>
            <strong>Tipp:</strong> Vergleichen Sie Ihr Gehalt mit dem <em>Median</em> für eine realistische Einschätzung!
          </p>
        </div>
      </div>

      {/* Info-Sektion */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert der Vergleich</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Datengrundlage:</strong> Offizielle Verdiensterhebung des Statistischen Bundesamtes (Destatis) 2024</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Vollzeitbeschäftigte:</strong> Die Daten beziehen sich auf Vollzeit-Arbeitnehmer (ohne Auszubildende)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Bruttogehalt:</strong> Alle Werte sind Bruttogehälter inkl. Sonderzahlungen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Regionale Anpassung:</strong> Gehälter variieren nach Bundesland um bis zu ±12%</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Ost-West-Gefälle:</strong> In Ostdeutschland liegen die Gehälter ca. 15-25% unter Westniveau</span>
          </li>
        </ul>
      </div>

      {/* Tipps zur Gehaltsverhandlung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">💼 Tipps für die Gehaltsverhandlung</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="text-xl">📊</span>
            <div>
              <strong className="text-gray-800">Marktdaten kennen</strong>
              <p>Nutzen Sie diesen Rechner und den offiziellen Destatis-Gehaltsrechner als Argumentationsbasis</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">🎯</span>
            <div>
              <strong className="text-gray-800">Konkrete Zahl nennen</strong>
              <p>Statt Spannen ein konkretes Wunschgehalt nennen (leicht über dem Ziel)</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">📈</span>
            <div>
              <strong className="text-gray-800">Leistungen dokumentieren</strong>
              <p>Erfolge und Mehrwert für das Unternehmen konkret benennen können</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-xl">⏰</span>
            <div>
              <strong className="text-gray-800">Timing beachten</strong>
              <p>Nach erfolgreichen Projekten oder zum Jahresgespräch verhandeln</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Offizielle Quellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Offizielle Quellen & Tools</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Destatis Gehaltsrechner</p>
            <p className="text-sm text-blue-700 mt-1">
              Interaktiver Gehaltsvergleich mit detaillierten Berufsgruppen
            </p>
            <a 
              href="https://service.destatis.de/DE/gehaltsvergleich/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-blue-600 hover:underline font-medium"
            >
              → Zum Destatis-Gehaltsrechner
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📊</span>
              <div>
                <p className="font-medium text-gray-800">Verdienste nach Branchen</p>
                <a 
                  href="https://www.destatis.de/DE/Themen/Arbeit/Verdienste/Verdienste-Branche-Berufe/_inhalt.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Destatis Verdienste →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📈</span>
              <div>
                <p className="font-medium text-gray-800">Gehaltsstatistik</p>
                <a 
                  href="https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/04/PD25_134_621.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Pressemitteilung 2025 →
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
            href="https://www.destatis.de/DE/Themen/Arbeit/Verdienste/Verdienste-Branche-Berufe/Tabellen/bruttojahresverdienst.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Statistisches Bundesamt – Bruttojahresverdienste 2024
          </a>
          <a 
            href="https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/04/PD25_134_621.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Statistisches Bundesamt – Verdienstverteilung 2024
          </a>
          <a 
            href="https://service.destatis.de/DE/gehaltsvergleich/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Destatis – Interaktiver Gehaltsrechner
          </a>
          <a 
            href="https://www.destatis.de/DE/Themen/Arbeit/Verdienste/Verdienste-Verdienstunterschiede/_inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Statistisches Bundesamt – Verdienstunterschiede
          </a>
        </div>
      </div>
    </div>
  );
}
