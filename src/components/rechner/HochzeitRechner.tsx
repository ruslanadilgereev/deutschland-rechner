import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Deutsche Durchschnittswerte für Hochzeitskosten
// Quellen: Statista, Hochzeitsportal24, diverse Hochzeitsplaner-Studien
interface KategorieKosten {
  id: string;
  name: string;
  icon: string;
  beschreibung: string;
  basisKosten: number; // Grundkosten unabhängig von Gästen
  proGast: number; // Kosten pro Gast
  optional: boolean;
}

const locationTypen = [
  { id: 'restaurant', name: 'Restaurant', faktor: 0.7 },
  { id: 'eventlocation', name: 'Eventlocation', faktor: 1.0 },
  { id: 'schloss', name: 'Schloss / Herrenhaus', faktor: 1.5 },
  { id: 'scheune', name: 'Scheune / Landhaus', faktor: 0.9 },
  { id: 'hotel', name: 'Hotel', faktor: 1.2 },
  { id: 'strand', name: 'Strand / Outdoor', faktor: 1.3 },
] as const;

const cateringLevel = [
  { id: 'einfach', name: 'Einfach (Buffet)', proGast: 45, beschreibung: 'Kaltes & warmes Buffet' },
  { id: 'gehoben', name: 'Gehoben (3-Gänge)', proGast: 75, beschreibung: '3-Gänge-Menü serviert' },
  { id: 'exklusiv', name: 'Exklusiv (5-Gänge)', proGast: 120, beschreibung: '5-Gänge-Menü mit Weinbegleitung' },
  { id: 'premium', name: 'Premium (Flying Buffet + Menü)', proGast: 180, beschreibung: 'Kombination aus allem' },
] as const;

const getraenkeLevel = [
  { id: 'standard', name: 'Standard', proGast: 25, beschreibung: 'Softdrinks, Bier, Hauswein' },
  { id: 'gehoben', name: 'Gehoben', proGast: 45, beschreibung: '+ Sekt, Cocktails' },
  { id: 'premium', name: 'Premium (Flatrate)', proGast: 65, beschreibung: 'All-inclusive mit Spirituosen' },
] as const;

// Basis-Kategorien mit deutschen Durchschnittswerten
const kategorien: KategorieKosten[] = [
  {
    id: 'location',
    name: 'Location-Miete',
    icon: '🏰',
    beschreibung: 'Miete für die Hochzeitslocation',
    basisKosten: 2500,
    proGast: 5,
    optional: false,
  },
  {
    id: 'fotograf',
    name: 'Fotograf',
    icon: '📸',
    beschreibung: 'Professionelle Hochzeitsfotografie',
    basisKosten: 2200,
    proGast: 0,
    optional: false,
  },
  {
    id: 'videograf',
    name: 'Videograf',
    icon: '🎬',
    beschreibung: 'Hochzeitsvideo',
    basisKosten: 1800,
    proGast: 0,
    optional: true,
  },
  {
    id: 'dj',
    name: 'DJ / Musik',
    icon: '🎵',
    beschreibung: 'DJ für Party & Zeremonie',
    basisKosten: 800,
    proGast: 0,
    optional: false,
  },
  {
    id: 'band',
    name: 'Live-Band',
    icon: '🎸',
    beschreibung: 'Live-Musik statt/zusätzlich DJ',
    basisKosten: 2500,
    proGast: 0,
    optional: true,
  },
  {
    id: 'brautkleid',
    name: 'Brautkleid & Accessoires',
    icon: '👰',
    beschreibung: 'Kleid, Schleier, Schuhe',
    basisKosten: 1500,
    proGast: 0,
    optional: false,
  },
  {
    id: 'anzug',
    name: 'Anzug / Bräutigam',
    icon: '🤵',
    beschreibung: 'Anzug, Schuhe, Accessoires',
    basisKosten: 600,
    proGast: 0,
    optional: false,
  },
  {
    id: 'ringe',
    name: 'Eheringe',
    icon: '💍',
    beschreibung: 'Trauringe für beide',
    basisKosten: 1200,
    proGast: 0,
    optional: false,
  },
  {
    id: 'blumen',
    name: 'Blumen & Deko',
    icon: '💐',
    beschreibung: 'Brautstrauß, Tischdeko, Kirchenschmuck',
    basisKosten: 800,
    proGast: 8,
    optional: false,
  },
  {
    id: 'torte',
    name: 'Hochzeitstorte',
    icon: '🎂',
    beschreibung: 'Mehrstöckige Torte',
    basisKosten: 150,
    proGast: 6,
    optional: false,
  },
  {
    id: 'papeterie',
    name: 'Papeterie',
    icon: '💌',
    beschreibung: 'Einladungen, Menükarten, Dankeskarten',
    basisKosten: 200,
    proGast: 4,
    optional: false,
  },
  {
    id: 'makeup',
    name: 'Make-up & Frisur',
    icon: '💄',
    beschreibung: 'Styling für die Braut',
    basisKosten: 450,
    proGast: 0,
    optional: false,
  },
  {
    id: 'auto',
    name: 'Hochzeitsauto',
    icon: '🚗',
    beschreibung: 'Oldtimer, Limousine o.ä.',
    basisKosten: 400,
    proGast: 0,
    optional: true,
  },
  {
    id: 'standesamt',
    name: 'Standesamt',
    icon: '📜',
    beschreibung: 'Gebühren & Dokumente',
    basisKosten: 150,
    proGast: 0,
    optional: false,
  },
  {
    id: 'kirche',
    name: 'Kirchliche Trauung',
    icon: '⛪',
    beschreibung: 'Kirche, Organist, Sänger',
    basisKosten: 350,
    proGast: 0,
    optional: true,
  },
  {
    id: 'freiertrauredner',
    name: 'Freier Trauredner',
    icon: '🎤',
    beschreibung: 'Individuelle freie Trauung',
    basisKosten: 900,
    proGast: 0,
    optional: true,
  },
  {
    id: 'gaeste_geschenke',
    name: 'Gastgeschenke',
    icon: '🎁',
    beschreibung: 'Kleine Aufmerksamkeiten für Gäste',
    basisKosten: 0,
    proGast: 5,
    optional: true,
  },
  {
    id: 'fotobox',
    name: 'Fotobox',
    icon: '📷',
    beschreibung: 'Selfie-Station mit Requisiten',
    basisKosten: 450,
    proGast: 0,
    optional: true,
  },
  {
    id: 'feuerwerk',
    name: 'Feuerwerk',
    icon: '🎆',
    beschreibung: 'Professionelles Feuerwerk',
    basisKosten: 800,
    proGast: 0,
    optional: true,
  },
  {
    id: 'kinderbetreuung',
    name: 'Kinderbetreuung',
    icon: '👶',
    beschreibung: 'Betreuung während der Feier',
    basisKosten: 300,
    proGast: 0,
    optional: true,
  },
  {
    id: 'uebernachtung',
    name: 'Übernachtung Brautpaar',
    icon: '🛏️',
    beschreibung: 'Suite für die Hochzeitsnacht',
    basisKosten: 250,
    proGast: 0,
    optional: true,
  },
  {
    id: 'shuttle',
    name: 'Shuttle-Service',
    icon: '🚌',
    beschreibung: 'Transport für Gäste',
    basisKosten: 400,
    proGast: 3,
    optional: true,
  },
  {
    id: 'sonstiges',
    name: 'Puffer / Sonstiges',
    icon: '📋',
    beschreibung: 'Unvorhergesehenes (10% empfohlen)',
    basisKosten: 0,
    proGast: 0,
    optional: true,
  },
];

export default function HochzeitRechner() {
  // Grundeinstellungen
  const [gaeste, setGaeste] = useState(60);
  const [locationType, setLocationType] = useState('eventlocation');
  const [catering, setCatering] = useState('gehoben');
  const [getraenke, setGetraenke] = useState('gehoben');
  
  // Ausgewählte Kategorien
  const [ausgewaehlteKategorien, setAusgewaehlteKategorien] = useState<string[]>(
    kategorien.filter(k => !k.optional).map(k => k.id)
  );
  
  // Individuelle Kostenüberschreibungen
  const [kostenOverrides, setKostenOverrides] = useState<Record<string, number>>({});
  
  // Puffer-Prozent
  const [pufferProzent, setPufferProzent] = useState(10);
  
  // Zeige Details
  const [zeigeDetails, setZeigeDetails] = useState(false);

  const ergebnis = useMemo(() => {
    const locationInfo = locationTypen.find(l => l.id === locationType);
    const cateringInfo = cateringLevel.find(c => c.id === catering);
    const getraenkeInfo = getraenkeLevel.find(g => g.id === getraenke);
    
    const locationFaktor = locationInfo?.faktor || 1.0;
    const cateringProGast = cateringInfo?.proGast || 75;
    const getraenkeProGast = getraenkeInfo?.proGast || 45;
    
    // Berechne Kosten pro Kategorie
    const kategorieKosten = kategorien.map(kat => {
      const istAusgewaehlt = ausgewaehlteKategorien.includes(kat.id);
      
      if (!istAusgewaehlt) {
        return { ...kat, kosten: 0, istAusgewaehlt: false };
      }
      
      // Überschriebene Kosten?
      if (kostenOverrides[kat.id] !== undefined) {
        return { ...kat, kosten: kostenOverrides[kat.id], istAusgewaehlt: true };
      }
      
      // Location bekommt Faktor
      let basisKosten = kat.basisKosten;
      if (kat.id === 'location') {
        basisKosten = kat.basisKosten * locationFaktor;
      }
      
      const kosten = basisKosten + (kat.proGast * gaeste);
      return { ...kat, kosten, istAusgewaehlt: true };
    });
    
    // Catering & Getränke separat
    const cateringKosten = cateringProGast * gaeste;
    const getraenkeKosten = getraenkeProGast * gaeste;
    
    // Summe aller Kategorien
    const kategorienSumme = kategorieKosten
      .filter(k => k.istAusgewaehlt && k.id !== 'sonstiges')
      .reduce((sum, k) => sum + k.kosten, 0);
    
    // Zwischensumme ohne Puffer
    const zwischensumme = kategorienSumme + cateringKosten + getraenkeKosten;
    
    // Puffer
    const puffer = zwischensumme * (pufferProzent / 100);
    
    // Gesamtkosten
    const gesamtkosten = zwischensumme + puffer;
    
    // Kosten pro Gast
    const kostenProGast = gaeste > 0 ? gesamtkosten / gaeste : 0;
    
    // Aufschlüsselung nach Hauptkategorien
    const hauptkategorien = [
      { name: 'Location & Räumlichkeiten', kosten: kategorieKosten.find(k => k.id === 'location')?.kosten || 0, icon: '🏰' },
      { name: 'Catering', kosten: cateringKosten, icon: '🍽️' },
      { name: 'Getränke', kosten: getraenkeKosten, icon: '🥂' },
      { name: 'Foto & Video', kosten: (kategorieKosten.find(k => k.id === 'fotograf')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'videograf')?.kosten || 0), icon: '📸' },
      { name: 'Musik & Unterhaltung', kosten: (kategorieKosten.find(k => k.id === 'dj')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'band')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'fotobox')?.kosten || 0), icon: '🎵' },
      { name: 'Kleidung & Styling', kosten: (kategorieKosten.find(k => k.id === 'brautkleid')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'anzug')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'makeup')?.kosten || 0), icon: '👰' },
      { name: 'Blumen & Deko', kosten: (kategorieKosten.find(k => k.id === 'blumen')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'torte')?.kosten || 0), icon: '💐' },
      { name: 'Zeremonie', kosten: (kategorieKosten.find(k => k.id === 'standesamt')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'kirche')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'freiertrauredner')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'ringe')?.kosten || 0), icon: '💍' },
      { name: 'Sonstiges', kosten: (kategorieKosten.find(k => k.id === 'papeterie')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'auto')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'gaeste_geschenke')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'feuerwerk')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'kinderbetreuung')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'uebernachtung')?.kosten || 0) + (kategorieKosten.find(k => k.id === 'shuttle')?.kosten || 0), icon: '📋' },
    ].filter(k => k.kosten > 0);
    
    // Vergleich mit deutschen Durchschnittswerten
    const deutscherDurchschnitt = 15000; // Durchschnittliche Hochzeitskosten in Deutschland
    const vergleich = {
      durchschnitt: deutscherDurchschnitt,
      differenz: gesamtkosten - deutscherDurchschnitt,
      prozent: ((gesamtkosten / deutscherDurchschnitt) - 1) * 100,
    };
    
    return {
      kategorieKosten,
      cateringKosten,
      getraenkeKosten,
      kategorienSumme,
      zwischensumme,
      puffer,
      gesamtkosten,
      kostenProGast,
      hauptkategorien,
      vergleich,
      locationInfo,
      cateringInfo,
      getraenkeInfo,
    };
  }, [gaeste, locationType, catering, getraenke, ausgewaehlteKategorien, kostenOverrides, pufferProzent]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  const toggleKategorie = (id: string) => {
    setAusgewaehlteKategorien(prev => 
      prev.includes(id) 
        ? prev.filter(k => k !== id)
        : [...prev, id]
    );
  };

  const setKostenOverride = (id: string, value: number | null) => {
    if (value === null) {
      const newOverrides = { ...kostenOverrides };
      delete newOverrides[id];
      setKostenOverrides(newOverrides);
    } else {
      setKostenOverrides(prev => ({ ...prev, [id]: value }));
    }
  };

  // Berechne maximale Kosten für Balken-Visualisierung
  const maxKosten = Math.max(...ergebnis.hauptkategorien.map(k => k.kosten));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hauptergebnis */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
        <div className="text-center mb-4">
          <div className="text-lg opacity-90">Geschätzte Gesamtkosten</div>
          <div className="text-5xl font-bold my-2">{formatEuro(ergebnis.gesamtkosten)}</div>
          <div className="text-sm opacity-80">
            für {gaeste} Gäste • {formatEuro(ergebnis.kostenProGast)} pro Gast
          </div>
        </div>
        
        {/* Schnell-Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl">👥</div>
            <div className="text-xl font-bold">{gaeste}</div>
            <div className="text-xs opacity-80">Gäste</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl">🍽️</div>
            <div className="text-xl font-bold">{formatEuro(ergebnis.cateringKosten + ergebnis.getraenkeKosten)}</div>
            <div className="text-xs opacity-80">Catering & Getränke</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl">📊</div>
            <div className="text-xl font-bold">{formatEuro(ergebnis.puffer)}</div>
            <div className="text-xs opacity-80">Puffer ({pufferProzent}%)</div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>👥</span> Grundeinstellungen
        </h3>
        
        {/* Gästeanzahl */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahl Gäste</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={gaeste}
              onChange={(e) => setGaeste(Math.max(1, Math.min(500, Number(e.target.value))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
              min="1"
              max="500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">Personen</span>
          </div>
          <input
            type="range"
            value={gaeste}
            onChange={(e) => setGaeste(Number(e.target.value))}
            className="w-full mt-3 accent-pink-500"
            min="10"
            max="200"
            step="5"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
          </div>
        </div>

        {/* Location-Typ */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Location-Typ</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {locationTypen.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setLocationType(loc.id)}
                className={`py-3 px-4 rounded-xl transition-all text-sm ${
                  locationType === loc.id
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {loc.name}
                {loc.faktor !== 1.0 && (
                  <span className="block text-xs opacity-70">
                    {loc.faktor > 1 ? '+' : ''}{Math.round((loc.faktor - 1) * 100)}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Catering-Level */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Catering</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {cateringLevel.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatering(cat.id)}
                className={`py-3 px-3 rounded-xl transition-all text-sm ${
                  catering === cat.id
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium">{cat.name}</div>
                <div className="text-xs opacity-70">{cat.proGast}€/Gast</div>
              </button>
            ))}
          </div>
        </div>

        {/* Getränke-Level */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Getränke</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {getraenkeLevel.map((gtr) => (
              <button
                key={gtr.id}
                onClick={() => setGetraenke(gtr.id)}
                className={`py-3 px-3 rounded-xl transition-all text-sm ${
                  getraenke === gtr.id
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium">{gtr.name}</div>
                <div className="text-xs opacity-70">{gtr.proGast}€/Gast</div>
              </button>
            ))}
          </div>
        </div>

        {/* Puffer */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Puffer für Unvorhergesehenes</span>
            <span className="text-sm text-gray-500 ml-2">(Empfehlung: 10-15%)</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={pufferProzent}
              onChange={(e) => setPufferProzent(Number(e.target.value))}
              className="flex-1 accent-pink-500"
              min="0"
              max="20"
              step="1"
            />
            <span className="font-bold text-lg w-16 text-right">{pufferProzent}%</span>
          </div>
        </div>
      </div>

      {/* Kostenaufschlüsselung nach Hauptkategorien */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📊</span> Kostenverteilung
        </h3>
        
        <div className="space-y-3">
          {ergebnis.hauptkategorien.map((kat) => (
            <div key={kat.name} className="flex items-center gap-3">
              <span className="text-2xl w-10">{kat.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">{kat.name}</span>
                  <span className="text-sm font-semibold">{formatEuro(kat.kosten)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${(kat.kosten / maxKosten) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Puffer */}
          {ergebnis.puffer > 0 && (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <span className="text-2xl w-10">🛡️</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Puffer ({pufferProzent}%)</span>
                  <span className="text-sm font-semibold">{formatEuro(ergebnis.puffer)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${(ergebnis.puffer / maxKosten) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optionale Leistungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>✨</span> Leistungen auswählen
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {kategorien.map((kat) => {
            const istAusgewaehlt = ausgewaehlteKategorien.includes(kat.id);
            const katErgebnis = ergebnis.kategorieKosten.find(k => k.id === kat.id);
            
            return (
              <button
                key={kat.id}
                onClick={() => toggleKategorie(kat.id)}
                className={`p-3 rounded-xl transition-all text-left ${
                  istAusgewaehlt
                    ? 'bg-pink-50 border-2 border-pink-500'
                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{kat.icon}</span>
                  <span className={`text-sm font-medium ${istAusgewaehlt ? 'text-pink-700' : 'text-gray-700'}`}>
                    {kat.name}
                  </span>
                </div>
                <div className={`text-xs ${istAusgewaehlt ? 'text-pink-600' : 'text-gray-500'}`}>
                  {istAusgewaehlt && katErgebnis ? formatEuro(katErgebnis.kosten) : kat.beschreibung}
                </div>
                {kat.optional && (
                  <span className="inline-block mt-1 text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                    Optional
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail-Tabelle (optional) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <button
          onClick={() => setZeigeDetails(!zeigeDetails)}
          className="w-full flex items-center justify-between text-lg font-semibold"
        >
          <span className="flex items-center gap-2">
            <span>📋</span> Detaillierte Aufstellung
          </span>
          <span className={`transform transition-transform ${zeigeDetails ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {zeigeDetails && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2">Position</th>
                  <th className="text-right py-2 px-2">Basis</th>
                  <th className="text-right py-2 px-2">Pro Gast</th>
                  <th className="text-right py-2 px-2 font-bold">Gesamt</th>
                </tr>
              </thead>
              <tbody>
                {/* Catering */}
                <tr className="border-b border-gray-100 bg-pink-50">
                  <td className="py-2 px-2 font-medium">🍽️ Catering ({ergebnis.cateringInfo?.name})</td>
                  <td className="text-right py-2 px-2 text-gray-500">-</td>
                  <td className="text-right py-2 px-2">{ergebnis.cateringInfo?.proGast}€ × {gaeste}</td>
                  <td className="text-right py-2 px-2 font-bold">{formatEuro(ergebnis.cateringKosten)}</td>
                </tr>
                
                {/* Getränke */}
                <tr className="border-b border-gray-100 bg-pink-50">
                  <td className="py-2 px-2 font-medium">🥂 Getränke ({ergebnis.getraenkeInfo?.name})</td>
                  <td className="text-right py-2 px-2 text-gray-500">-</td>
                  <td className="text-right py-2 px-2">{ergebnis.getraenkeInfo?.proGast}€ × {gaeste}</td>
                  <td className="text-right py-2 px-2 font-bold">{formatEuro(ergebnis.getraenkeKosten)}</td>
                </tr>
                
                {/* Alle Kategorien */}
                {ergebnis.kategorieKosten
                  .filter(k => k.istAusgewaehlt && k.kosten > 0)
                  .map((kat) => (
                    <tr key={kat.id} className="border-b border-gray-100">
                      <td className="py-2 px-2">
                        <span className="mr-2">{kat.icon}</span>
                        {kat.name}
                      </td>
                      <td className="text-right py-2 px-2 text-gray-500">
                        {kat.basisKosten > 0 ? formatEuro(kat.basisKosten * (kat.id === 'location' ? (ergebnis.locationInfo?.faktor || 1) : 1)) : '-'}
                      </td>
                      <td className="text-right py-2 px-2 text-gray-500">
                        {kat.proGast > 0 ? `${kat.proGast}€ × ${gaeste}` : '-'}
                      </td>
                      <td className="text-right py-2 px-2 font-medium">{formatEuro(kat.kosten)}</td>
                    </tr>
                  ))}
                
                {/* Zwischensumme */}
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <td className="py-2 px-2 font-semibold" colSpan={3}>Zwischensumme</td>
                  <td className="text-right py-2 px-2 font-bold">{formatEuro(ergebnis.zwischensumme)}</td>
                </tr>
                
                {/* Puffer */}
                {ergebnis.puffer > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2">🛡️ Puffer ({pufferProzent}%)</td>
                    <td className="text-right py-2 px-2 text-gray-500" colSpan={2}></td>
                    <td className="text-right py-2 px-2 font-medium">{formatEuro(ergebnis.puffer)}</td>
                  </tr>
                )}
                
                {/* Gesamt */}
                <tr className="bg-pink-500 text-white">
                  <td className="py-3 px-2 font-bold text-lg" colSpan={3}>GESAMTKOSTEN</td>
                  <td className="text-right py-3 px-2 font-bold text-lg">{formatEuro(ergebnis.gesamtkosten)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vergleich mit Durchschnitt */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📈</span> Vergleich mit deutschem Durchschnitt
        </h3>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Durchschnittliche Hochzeit in Deutschland</div>
            <div className="text-2xl font-bold text-gray-700">{formatEuro(ergebnis.vergleich.durchschnitt)}</div>
          </div>
          <div className="text-4xl">→</div>
          <div className="flex-1 text-right">
            <div className="text-sm text-gray-600 mb-1">Deine geplanten Kosten</div>
            <div className="text-2xl font-bold text-pink-600">{formatEuro(ergebnis.gesamtkosten)}</div>
          </div>
        </div>
        
        <div className={`text-center p-4 rounded-xl ${
          ergebnis.vergleich.differenz > 0 
            ? 'bg-amber-50 text-amber-800' 
            : 'bg-green-50 text-green-800'
        }`}>
          {ergebnis.vergleich.differenz > 0 ? (
            <>
              <span className="text-2xl">📈</span>
              <div className="font-semibold">
                {formatEuro(Math.abs(ergebnis.vergleich.differenz))} über dem Durchschnitt
              </div>
              <div className="text-sm opacity-80">
                ({Math.abs(ergebnis.vergleich.prozent).toFixed(0)}% mehr)
              </div>
            </>
          ) : (
            <>
              <span className="text-2xl">💚</span>
              <div className="font-semibold">
                {formatEuro(Math.abs(ergebnis.vergleich.differenz))} unter dem Durchschnitt
              </div>
              <div className="text-sm opacity-80">
                ({Math.abs(ergebnis.vergleich.prozent).toFixed(0)}% weniger)
              </div>
            </>
          )}
        </div>
      </div>

      {/* Spar-Tipps */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800">
          <span>💡</span> Spar-Tipps für eure Hochzeit
        </h3>
        
        <div className="space-y-3 text-green-900">
          <div className="flex gap-3 items-start">
            <span className="text-xl">📅</span>
            <div>
              <div className="font-medium">Nebensaison wählen</div>
              <div className="text-sm opacity-80">November bis März sind oft 20-30% günstiger</div>
            </div>
          </div>
          
          <div className="flex gap-3 items-start">
            <span className="text-xl">🗓️</span>
            <div>
              <div className="font-medium">Wochentag statt Samstag</div>
              <div className="text-sm opacity-80">Freitag oder Sonntag spart bei Location & Dienstleistern</div>
            </div>
          </div>
          
          <div className="flex gap-3 items-start">
            <span className="text-xl">🍰</span>
            <div>
              <div className="font-medium">Torte von Konditorei statt Hochzeitstorten-Anbieter</div>
              <div className="text-sm opacity-80">Oft 50% günstiger bei gleicher Qualität</div>
            </div>
          </div>
          
          <div className="flex gap-3 items-start">
            <span className="text-xl">💐</span>
            <div>
              <div className="font-medium">Saisonale Blumen wählen</div>
              <div className="text-sm opacity-80">Pfingstrosen im Juni, Dahlien im Herbst</div>
            </div>
          </div>
          
          <div className="flex gap-3 items-start">
            <span className="text-xl">👥</span>
            <div>
              <div className="font-medium">Gästeliste clever planen</div>
              <div className="text-sm opacity-80">Jeder Gast kostet {formatEuro((ergebnis.cateringKosten + ergebnis.getraenkeKosten) / gaeste + 20)} für Essen, Getränke & Extras</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info-Box */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-900">
        <div className="flex items-start gap-2">
          <span className="text-xl">ℹ️</span>
          <div>
            <div className="font-semibold mb-1">Hinweis zu den Kostenschätzungen</div>
            <p className="opacity-80">
              Die angezeigten Preise basieren auf deutschen Durchschnittswerten 2024/2025. 
              Regionale Unterschiede können erheblich sein: In München oder Hamburg liegen die Kosten 
              oft 30-50% über dem Durchschnitt, in ländlichen Regionen entsprechend darunter.
              Die tatsächlichen Kosten hängen stark von euren individuellen Wünschen ab.
            </p>
          </div>
        </div>
      <RechnerFeedback rechnerName="Hochzeitskosten-Rechner" rechnerSlug="hochzeit-rechner" />
      </div>
    </div>
  );
}
