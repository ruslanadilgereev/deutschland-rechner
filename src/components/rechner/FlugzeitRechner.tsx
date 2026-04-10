import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Typen
interface Flughafen {
  code: string;
  name: string;
  stadt: string;
  land: string;
  region: 'europa' | 'nordamerika' | 'suedamerika' | 'asien' | 'afrika' | 'ozeanien' | 'nahost';
  zeitzone: number; // UTC-Offset in Stunden
  emoji: string;
}

interface Flugroute {
  von: string; // Flughafen-Code
  nach: string; // Flughafen-Code
  flugzeitMin: number; // Flugzeit in Minuten
  direktflug: boolean;
  entfernungKm: number;
}

// Deutsche Abflughäfen
const DEUTSCHE_FLUGHAEFEN: Flughafen[] = [
  { code: 'FRA', name: 'Frankfurt Airport', stadt: 'Frankfurt', land: 'Deutschland', region: 'europa', zeitzone: 1, emoji: '🇩🇪' },
  { code: 'MUC', name: 'München Airport', stadt: 'München', land: 'Deutschland', region: 'europa', zeitzone: 1, emoji: '🇩🇪' },
  { code: 'BER', name: 'Berlin Brandenburg', stadt: 'Berlin', land: 'Deutschland', region: 'europa', zeitzone: 1, emoji: '🇩🇪' },
  { code: 'DUS', name: 'Düsseldorf Airport', stadt: 'Düsseldorf', land: 'Deutschland', region: 'europa', zeitzone: 1, emoji: '🇩🇪' },
  { code: 'HAM', name: 'Hamburg Airport', stadt: 'Hamburg', land: 'Deutschland', region: 'europa', zeitzone: 1, emoji: '🇩🇪' },
];

// Weltweite Zielflughäfen
const ZIEL_FLUGHAEFEN: Flughafen[] = [
  // Europa
  { code: 'LHR', name: 'London Heathrow', stadt: 'London', land: 'Großbritannien', region: 'europa', zeitzone: 0, emoji: '🇬🇧' },
  { code: 'CDG', name: 'Paris Charles de Gaulle', stadt: 'Paris', land: 'Frankreich', region: 'europa', zeitzone: 1, emoji: '🇫🇷' },
  { code: 'AMS', name: 'Amsterdam Schiphol', stadt: 'Amsterdam', land: 'Niederlande', region: 'europa', zeitzone: 1, emoji: '🇳🇱' },
  { code: 'BCN', name: 'Barcelona El Prat', stadt: 'Barcelona', land: 'Spanien', region: 'europa', zeitzone: 1, emoji: '🇪🇸' },
  { code: 'MAD', name: 'Madrid Barajas', stadt: 'Madrid', land: 'Spanien', region: 'europa', zeitzone: 1, emoji: '🇪🇸' },
  { code: 'FCO', name: 'Rom Fiumicino', stadt: 'Rom', land: 'Italien', region: 'europa', zeitzone: 1, emoji: '🇮🇹' },
  { code: 'VIE', name: 'Wien Schwechat', stadt: 'Wien', land: 'Österreich', region: 'europa', zeitzone: 1, emoji: '🇦🇹' },
  { code: 'ZRH', name: 'Zürich Airport', stadt: 'Zürich', land: 'Schweiz', region: 'europa', zeitzone: 1, emoji: '🇨🇭' },
  { code: 'ATH', name: 'Athen Eleftherios Venizelos', stadt: 'Athen', land: 'Griechenland', region: 'europa', zeitzone: 2, emoji: '🇬🇷' },
  { code: 'IST', name: 'Istanbul Airport', stadt: 'Istanbul', land: 'Türkei', region: 'europa', zeitzone: 3, emoji: '🇹🇷' },
  { code: 'LIS', name: 'Lissabon Portela', stadt: 'Lissabon', land: 'Portugal', region: 'europa', zeitzone: 0, emoji: '🇵🇹' },
  { code: 'PMI', name: 'Palma de Mallorca', stadt: 'Palma', land: 'Spanien', region: 'europa', zeitzone: 1, emoji: '🇪🇸' },
  
  // Nordamerika
  { code: 'JFK', name: 'New York JFK', stadt: 'New York', land: 'USA', region: 'nordamerika', zeitzone: -5, emoji: '🇺🇸' },
  { code: 'LAX', name: 'Los Angeles International', stadt: 'Los Angeles', land: 'USA', region: 'nordamerika', zeitzone: -8, emoji: '🇺🇸' },
  { code: 'ORD', name: 'Chicago O\'Hare', stadt: 'Chicago', land: 'USA', region: 'nordamerika', zeitzone: -6, emoji: '🇺🇸' },
  { code: 'MIA', name: 'Miami International', stadt: 'Miami', land: 'USA', region: 'nordamerika', zeitzone: -5, emoji: '🇺🇸' },
  { code: 'SFO', name: 'San Francisco International', stadt: 'San Francisco', land: 'USA', region: 'nordamerika', zeitzone: -8, emoji: '🇺🇸' },
  { code: 'YYZ', name: 'Toronto Pearson', stadt: 'Toronto', land: 'Kanada', region: 'nordamerika', zeitzone: -5, emoji: '🇨🇦' },
  { code: 'YVR', name: 'Vancouver International', stadt: 'Vancouver', land: 'Kanada', region: 'nordamerika', zeitzone: -8, emoji: '🇨🇦' },
  { code: 'CUN', name: 'Cancún International', stadt: 'Cancún', land: 'Mexiko', region: 'nordamerika', zeitzone: -5, emoji: '🇲🇽' },
  
  // Südamerika
  { code: 'GRU', name: 'São Paulo Guarulhos', stadt: 'São Paulo', land: 'Brasilien', region: 'suedamerika', zeitzone: -3, emoji: '🇧🇷' },
  { code: 'EZE', name: 'Buenos Aires Ezeiza', stadt: 'Buenos Aires', land: 'Argentinien', region: 'suedamerika', zeitzone: -3, emoji: '🇦🇷' },
  { code: 'BOG', name: 'Bogotá El Dorado', stadt: 'Bogotá', land: 'Kolumbien', region: 'suedamerika', zeitzone: -5, emoji: '🇨🇴' },
  { code: 'LIM', name: 'Lima Jorge Chávez', stadt: 'Lima', land: 'Peru', region: 'suedamerika', zeitzone: -5, emoji: '🇵🇪' },
  
  // Asien
  { code: 'DXB', name: 'Dubai International', stadt: 'Dubai', land: 'VAE', region: 'nahost', zeitzone: 4, emoji: '🇦🇪' },
  { code: 'DOH', name: 'Doha Hamad', stadt: 'Doha', land: 'Katar', region: 'nahost', zeitzone: 3, emoji: '🇶🇦' },
  { code: 'AUH', name: 'Abu Dhabi International', stadt: 'Abu Dhabi', land: 'VAE', region: 'nahost', zeitzone: 4, emoji: '🇦🇪' },
  { code: 'TLV', name: 'Tel Aviv Ben Gurion', stadt: 'Tel Aviv', land: 'Israel', region: 'nahost', zeitzone: 2, emoji: '🇮🇱' },
  { code: 'BKK', name: 'Bangkok Suvarnabhumi', stadt: 'Bangkok', land: 'Thailand', region: 'asien', zeitzone: 7, emoji: '🇹🇭' },
  { code: 'SIN', name: 'Singapore Changi', stadt: 'Singapur', land: 'Singapur', region: 'asien', zeitzone: 8, emoji: '🇸🇬' },
  { code: 'HKG', name: 'Hong Kong International', stadt: 'Hong Kong', land: 'China', region: 'asien', zeitzone: 8, emoji: '🇭🇰' },
  { code: 'PEK', name: 'Beijing Capital', stadt: 'Peking', land: 'China', region: 'asien', zeitzone: 8, emoji: '🇨🇳' },
  { code: 'PVG', name: 'Shanghai Pudong', stadt: 'Shanghai', land: 'China', region: 'asien', zeitzone: 8, emoji: '🇨🇳' },
  { code: 'NRT', name: 'Tokyo Narita', stadt: 'Tokio', land: 'Japan', region: 'asien', zeitzone: 9, emoji: '🇯🇵' },
  { code: 'HND', name: 'Tokyo Haneda', stadt: 'Tokio', land: 'Japan', region: 'asien', zeitzone: 9, emoji: '🇯🇵' },
  { code: 'ICN', name: 'Seoul Incheon', stadt: 'Seoul', land: 'Südkorea', region: 'asien', zeitzone: 9, emoji: '🇰🇷' },
  { code: 'DEL', name: 'Delhi Indira Gandhi', stadt: 'Delhi', land: 'Indien', region: 'asien', zeitzone: 5.5, emoji: '🇮🇳' },
  { code: 'BOM', name: 'Mumbai Chhatrapati Shivaji', stadt: 'Mumbai', land: 'Indien', region: 'asien', zeitzone: 5.5, emoji: '🇮🇳' },
  { code: 'KUL', name: 'Kuala Lumpur International', stadt: 'Kuala Lumpur', land: 'Malaysia', region: 'asien', zeitzone: 8, emoji: '🇲🇾' },
  { code: 'CGK', name: 'Jakarta Soekarno-Hatta', stadt: 'Jakarta', land: 'Indonesien', region: 'asien', zeitzone: 7, emoji: '🇮🇩' },
  { code: 'DPS', name: 'Bali Ngurah Rai', stadt: 'Bali', land: 'Indonesien', region: 'asien', zeitzone: 8, emoji: '🇮🇩' },
  { code: 'HAN', name: 'Hanoi Noi Bai', stadt: 'Hanoi', land: 'Vietnam', region: 'asien', zeitzone: 7, emoji: '🇻🇳' },
  { code: 'MLE', name: 'Malé Velana', stadt: 'Malé', land: 'Malediven', region: 'asien', zeitzone: 5, emoji: '🇲🇻' },
  
  // Afrika
  { code: 'CAI', name: 'Kairo International', stadt: 'Kairo', land: 'Ägypten', region: 'afrika', zeitzone: 2, emoji: '🇪🇬' },
  { code: 'HRG', name: 'Hurghada International', stadt: 'Hurghada', land: 'Ägypten', region: 'afrika', zeitzone: 2, emoji: '🇪🇬' },
  { code: 'JNB', name: 'Johannesburg O.R. Tambo', stadt: 'Johannesburg', land: 'Südafrika', region: 'afrika', zeitzone: 2, emoji: '🇿🇦' },
  { code: 'CPT', name: 'Kapstadt International', stadt: 'Kapstadt', land: 'Südafrika', region: 'afrika', zeitzone: 2, emoji: '🇿🇦' },
  { code: 'CMN', name: 'Casablanca Mohammed V', stadt: 'Casablanca', land: 'Marokko', region: 'afrika', zeitzone: 1, emoji: '🇲🇦' },
  { code: 'NBO', name: 'Nairobi Jomo Kenyatta', stadt: 'Nairobi', land: 'Kenia', region: 'afrika', zeitzone: 3, emoji: '🇰🇪' },
  { code: 'MRU', name: 'Mauritius SSR', stadt: 'Port Louis', land: 'Mauritius', region: 'afrika', zeitzone: 4, emoji: '🇲🇺' },
  
  // Ozeanien
  { code: 'SYD', name: 'Sydney Kingsford Smith', stadt: 'Sydney', land: 'Australien', region: 'ozeanien', zeitzone: 10, emoji: '🇦🇺' },
  { code: 'MEL', name: 'Melbourne Tullamarine', stadt: 'Melbourne', land: 'Australien', region: 'ozeanien', zeitzone: 10, emoji: '🇦🇺' },
  { code: 'AKL', name: 'Auckland Airport', stadt: 'Auckland', land: 'Neuseeland', region: 'ozeanien', zeitzone: 12, emoji: '🇳🇿' },
];

// Flugrouten mit Flugzeiten (von Frankfurt - andere Abflughäfen haben ähnliche Zeiten +/- 30 min)
const FLUGROUTEN: Flugroute[] = [
  // Europa ab Frankfurt
  { von: 'FRA', nach: 'LHR', flugzeitMin: 95, direktflug: true, entfernungKm: 654 },
  { von: 'FRA', nach: 'CDG', flugzeitMin: 75, direktflug: true, entfernungKm: 479 },
  { von: 'FRA', nach: 'AMS', flugzeitMin: 70, direktflug: true, entfernungKm: 365 },
  { von: 'FRA', nach: 'BCN', flugzeitMin: 115, direktflug: true, entfernungKm: 1093 },
  { von: 'FRA', nach: 'MAD', flugzeitMin: 150, direktflug: true, entfernungKm: 1428 },
  { von: 'FRA', nach: 'FCO', flugzeitMin: 105, direktflug: true, entfernungKm: 959 },
  { von: 'FRA', nach: 'VIE', flugzeitMin: 75, direktflug: true, entfernungKm: 596 },
  { von: 'FRA', nach: 'ZRH', flugzeitMin: 55, direktflug: true, entfernungKm: 287 },
  { von: 'FRA', nach: 'ATH', flugzeitMin: 165, direktflug: true, entfernungKm: 1803 },
  { von: 'FRA', nach: 'IST', flugzeitMin: 180, direktflug: true, entfernungKm: 1862 },
  { von: 'FRA', nach: 'LIS', flugzeitMin: 170, direktflug: true, entfernungKm: 1877 },
  { von: 'FRA', nach: 'PMI', flugzeitMin: 120, direktflug: true, entfernungKm: 1175 },
  
  // Nordamerika ab Frankfurt
  { von: 'FRA', nach: 'JFK', flugzeitMin: 510, direktflug: true, entfernungKm: 6196 },
  { von: 'FRA', nach: 'LAX', flugzeitMin: 690, direktflug: true, entfernungKm: 9311 },
  { von: 'FRA', nach: 'ORD', flugzeitMin: 570, direktflug: true, entfernungKm: 6971 },
  { von: 'FRA', nach: 'MIA', flugzeitMin: 600, direktflug: true, entfernungKm: 7835 },
  { von: 'FRA', nach: 'SFO', flugzeitMin: 660, direktflug: true, entfernungKm: 9145 },
  { von: 'FRA', nach: 'YYZ', flugzeitMin: 510, direktflug: true, entfernungKm: 6338 },
  { von: 'FRA', nach: 'YVR', flugzeitMin: 600, direktflug: true, entfernungKm: 8097 },
  { von: 'FRA', nach: 'CUN', flugzeitMin: 660, direktflug: true, entfernungKm: 8871 },
  
  // Südamerika ab Frankfurt
  { von: 'FRA', nach: 'GRU', flugzeitMin: 720, direktflug: true, entfernungKm: 9522 },
  { von: 'FRA', nach: 'EZE', flugzeitMin: 780, direktflug: true, entfernungKm: 11466 },
  { von: 'FRA', nach: 'BOG', flugzeitMin: 660, direktflug: true, entfernungKm: 9039 },
  { von: 'FRA', nach: 'LIM', flugzeitMin: 720, direktflug: true, entfernungKm: 10379 },
  
  // Nahost ab Frankfurt
  { von: 'FRA', nach: 'DXB', flugzeitMin: 360, direktflug: true, entfernungKm: 4832 },
  { von: 'FRA', nach: 'DOH', flugzeitMin: 360, direktflug: true, entfernungKm: 4693 },
  { von: 'FRA', nach: 'AUH', flugzeitMin: 370, direktflug: true, entfernungKm: 4895 },
  { von: 'FRA', nach: 'TLV', flugzeitMin: 240, direktflug: true, entfernungKm: 2920 },
  
  // Asien ab Frankfurt
  { von: 'FRA', nach: 'BKK', flugzeitMin: 630, direktflug: true, entfernungKm: 8975 },
  { von: 'FRA', nach: 'SIN', flugzeitMin: 720, direktflug: true, entfernungKm: 10263 },
  { von: 'FRA', nach: 'HKG', flugzeitMin: 660, direktflug: true, entfernungKm: 9170 },
  { von: 'FRA', nach: 'PEK', flugzeitMin: 570, direktflug: true, entfernungKm: 7794 },
  { von: 'FRA', nach: 'PVG', flugzeitMin: 630, direktflug: true, entfernungKm: 8839 },
  { von: 'FRA', nach: 'NRT', flugzeitMin: 690, direktflug: true, entfernungKm: 9378 },
  { von: 'FRA', nach: 'HND', flugzeitMin: 690, direktflug: true, entfernungKm: 9378 },
  { von: 'FRA', nach: 'ICN', flugzeitMin: 630, direktflug: true, entfernungKm: 8577 },
  { von: 'FRA', nach: 'DEL', flugzeitMin: 450, direktflug: true, entfernungKm: 5772 },
  { von: 'FRA', nach: 'BOM', flugzeitMin: 510, direktflug: true, entfernungKm: 6340 },
  { von: 'FRA', nach: 'KUL', flugzeitMin: 660, direktflug: true, entfernungKm: 9957 },
  { von: 'FRA', nach: 'CGK', flugzeitMin: 780, direktflug: false, entfernungKm: 10962 },
  { von: 'FRA', nach: 'DPS', flugzeitMin: 840, direktflug: false, entfernungKm: 11665 },
  { von: 'FRA', nach: 'HAN', flugzeitMin: 630, direktflug: true, entfernungKm: 8597 },
  { von: 'FRA', nach: 'MLE', flugzeitMin: 570, direktflug: true, entfernungKm: 7442 },
  
  // Afrika ab Frankfurt
  { von: 'FRA', nach: 'CAI', flugzeitMin: 240, direktflug: true, entfernungKm: 2914 },
  { von: 'FRA', nach: 'HRG', flugzeitMin: 270, direktflug: true, entfernungKm: 3350 },
  { von: 'FRA', nach: 'JNB', flugzeitMin: 630, direktflug: true, entfernungKm: 8669 },
  { von: 'FRA', nach: 'CPT', flugzeitMin: 660, direktflug: true, entfernungKm: 9406 },
  { von: 'FRA', nach: 'CMN', flugzeitMin: 195, direktflug: true, entfernungKm: 2096 },
  { von: 'FRA', nach: 'NBO', flugzeitMin: 480, direktflug: true, entfernungKm: 6028 },
  { von: 'FRA', nach: 'MRU', flugzeitMin: 660, direktflug: true, entfernungKm: 9010 },
  
  // Ozeanien ab Frankfurt
  { von: 'FRA', nach: 'SYD', flugzeitMin: 1320, direktflug: false, entfernungKm: 16478 },
  { von: 'FRA', nach: 'MEL', flugzeitMin: 1350, direktflug: false, entfernungKm: 16098 },
  { von: 'FRA', nach: 'AKL', flugzeitMin: 1440, direktflug: false, entfernungKm: 18393 },
  
  // München Routen (ausgewählte)
  { von: 'MUC', nach: 'LHR', flugzeitMin: 105, direktflug: true, entfernungKm: 922 },
  { von: 'MUC', nach: 'JFK', flugzeitMin: 530, direktflug: true, entfernungKm: 6555 },
  { von: 'MUC', nach: 'DXB', flugzeitMin: 350, direktflug: true, entfernungKm: 4688 },
  { von: 'MUC', nach: 'BKK', flugzeitMin: 620, direktflug: true, entfernungKm: 8747 },
  { von: 'MUC', nach: 'SIN', flugzeitMin: 700, direktflug: true, entfernungKm: 10113 },
  { von: 'MUC', nach: 'NRT', flugzeitMin: 670, direktflug: true, entfernungKm: 9326 },
];

// Regionen für Filterung
const REGIONEN = {
  europa: { name: 'Europa', emoji: '🇪🇺' },
  nordamerika: { name: 'Nordamerika', emoji: '🌎' },
  suedamerika: { name: 'Südamerika', emoji: '🌎' },
  asien: { name: 'Asien', emoji: '🌏' },
  nahost: { name: 'Nahost', emoji: '🕌' },
  afrika: { name: 'Afrika', emoji: '🌍' },
  ozeanien: { name: 'Ozeanien', emoji: '🦘' },
};

// Beliebte Routen für Schnellauswahl
const BELIEBTE_ROUTEN = [
  { von: 'FRA', nach: 'PMI', label: 'Mallorca' },
  { von: 'FRA', nach: 'BCN', label: 'Barcelona' },
  { von: 'FRA', nach: 'JFK', label: 'New York' },
  { von: 'FRA', nach: 'DXB', label: 'Dubai' },
  { von: 'FRA', nach: 'BKK', label: 'Bangkok' },
  { von: 'FRA', nach: 'NRT', label: 'Tokio' },
  { von: 'MUC', nach: 'LHR', label: 'London' },
  { von: 'FRA', nach: 'SYD', label: 'Sydney' },
];

export default function FlugzeitRechner() {
  const [abflughafen, setAbflughafen] = useState('FRA');
  const [zielflughafen, setZielflughafen] = useState('JFK');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [abflugzeit, setAbflugzeit] = useState('10:00');

  // Alle Flughäfen zusammen
  const alleFlughaefen = [...DEUTSCHE_FLUGHAEFEN, ...ZIEL_FLUGHAEFEN];

  // Flughafen-Infos abrufen
  const getFlughafen = (code: string): Flughafen | undefined => {
    return alleFlughaefen.find(f => f.code === code);
  };

  // Flugroute finden oder schätzen
  const getRoute = (von: string, nach: string): Flugroute | null => {
    // Direkter Treffer
    let route = FLUGROUTEN.find(r => r.von === von && r.nach === nach);
    if (route) return route;

    // Umgekehrt (Rückflug)
    route = FLUGROUTEN.find(r => r.von === nach && r.nach === von);
    if (route) return route;

    // Von anderem deutschen Flughafen interpolieren
    const frankfurtRoute = FLUGROUTEN.find(r => r.von === 'FRA' && r.nach === nach);
    if (frankfurtRoute) {
      // Leichte Anpassung für andere deutsche Flughäfen
      const adjustment = von === 'BER' ? 15 : von === 'HAM' ? 10 : von === 'DUS' ? 5 : 0;
      return {
        ...frankfurtRoute,
        von,
        flugzeitMin: frankfurtRoute.flugzeitMin + adjustment,
      };
    }

    return null;
  };

  // Gefilterte Zielflughäfen
  const gefilterteZiele = useMemo(() => {
    if (!regionFilter) return ZIEL_FLUGHAEFEN;
    return ZIEL_FLUGHAEFEN.filter(f => f.region === regionFilter);
  }, [regionFilter]);

  // Berechnung
  const ergebnis = useMemo(() => {
    const vonFlughafen = getFlughafen(abflughafen);
    const nachFlughafen = getFlughafen(zielflughafen);
    const route = getRoute(abflughafen, zielflughafen);

    if (!vonFlughafen || !nachFlughafen || !route) {
      return null;
    }

    const flugzeitStunden = Math.floor(route.flugzeitMin / 60);
    const flugzeitMinuten = route.flugzeitMin % 60;

    // Zeitverschiebung berechnen (berücksichtigt MEZ/MESZ vereinfacht)
    const zeitverschiebung = nachFlughafen.zeitzone - vonFlughafen.zeitzone;

    // Ankunftszeit berechnen
    const [abflugStunde, abflugMinute] = abflugzeit.split(':').map(Number);
    let ankunftMinuten = abflugStunde * 60 + abflugMinute + route.flugzeitMin + (zeitverschiebung * 60);
    
    // Tagesüberlauf handhaben
    let tageDifferenz = 0;
    while (ankunftMinuten >= 24 * 60) {
      ankunftMinuten -= 24 * 60;
      tageDifferenz++;
    }
    while (ankunftMinuten < 0) {
      ankunftMinuten += 24 * 60;
      tageDifferenz--;
    }

    const ankunftStunde = Math.floor(ankunftMinuten / 60);
    const ankunftMinute = ankunftMinuten % 60;
    const ankunftzeit = `${ankunftStunde.toString().padStart(2, '0')}:${ankunftMinute.toString().padStart(2, '0')}`;

    // Durchschnittsgeschwindigkeit
    const geschwindigkeitKmh = route.entfernungKm / (route.flugzeitMin / 60);

    return {
      vonFlughafen,
      nachFlughafen,
      route,
      flugzeitStunden,
      flugzeitMinuten,
      zeitverschiebung,
      ankunftzeit,
      tageDifferenz,
      geschwindigkeitKmh,
    };
  }, [abflughafen, zielflughafen, abflugzeit]);

  const formatZeitverschiebung = (stunden: number): string => {
    if (stunden === 0) return 'keine Zeitverschiebung';
    const prefix = stunden > 0 ? '+' : '';
    const suffix = Math.abs(stunden) === 1 ? 'Stunde' : 'Stunden';
    // Halbe Stunden handhaben (z.B. Indien)
    if (stunden % 1 !== 0) {
      const ganze = Math.floor(Math.abs(stunden));
      return `${prefix}${ganze}:30 ${suffix}`;
    }
    return `${prefix}${stunden} ${suffix}`;
  };

  const formatNumber = (n: number, decimals = 0) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Flugzeit-Rechner" rechnerSlug="flugzeit-rechner" />

{/* Schnellauswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">✈️ Beliebte Routen ab Deutschland</h3>
        <div className="grid grid-cols-4 gap-2">
          {BELIEBTE_ROUTEN.map((route, i) => (
            <button
              key={i}
              onClick={() => {
                setAbflughafen(route.von);
                setZielflughafen(route.nach);
              }}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                abflughafen === route.von && zielflughafen === route.nach
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {route.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Abflughafen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Abflughafen</span>
            <span className="text-xs text-gray-500 block mt-1">
              Deutscher Flughafen
            </span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {DEUTSCHE_FLUGHAEFEN.map(flughafen => (
              <button
                key={flughafen.code}
                onClick={() => setAbflughafen(flughafen.code)}
                className={`py-3 px-2 rounded-xl font-medium transition-all text-sm ${
                  abflughafen === flughafen.code
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">🛫</span>
                <span className="block mt-1">{flughafen.stadt}</span>
                <span className="block text-xs opacity-70">{flughafen.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Regionen-Filter */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Region filtern</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRegionFilter(null)}
              className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                regionFilter === null
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Alle
            </button>
            {Object.entries(REGIONEN).map(([key, region]) => (
              <button
                key={key}
                onClick={() => setRegionFilter(key)}
                className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                  regionFilter === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {region.emoji} {region.name}
              </button>
            ))}
          </div>
        </div>

        {/* Zielflughafen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Zielflughafen</span>
            <span className="text-xs text-gray-500 block mt-1">
              {gefilterteZiele.length} Ziele verfügbar
            </span>
          </label>
          <select
            value={zielflughafen}
            onChange={(e) => setZielflughafen(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
          >
            {gefilterteZiele.map(flughafen => (
              <option key={flughafen.code} value={flughafen.code}>
                {flughafen.emoji} {flughafen.stadt}, {flughafen.land} ({flughafen.code})
              </option>
            ))}
          </select>
        </div>

        {/* Abflugzeit */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Abflugzeit (optional)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Für Ankunftszeit-Berechnung
            </span>
          </label>
          <input
            type="time"
            value={abflugzeit}
            onChange={(e) => setAbflugzeit(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
          />
        </div>
      </div>

      {/* Ergebnis */}
      {ergebnis && (
        <>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <span className="text-3xl">{ergebnis.vonFlughafen.emoji}</span>
                <p className="font-bold text-lg">{ergebnis.vonFlughafen.stadt}</p>
                <p className="text-sm opacity-80">{ergebnis.vonFlughafen.code}</p>
              </div>
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="border-t-2 border-dashed border-white/50 flex-1"></div>
                <span className="px-3 text-2xl">✈️</span>
                <div className="border-t-2 border-dashed border-white/50 flex-1"></div>
              </div>
              <div className="text-center">
                <span className="text-3xl">{ergebnis.nachFlughafen.emoji}</span>
                <p className="font-bold text-lg">{ergebnis.nachFlughafen.stadt}</p>
                <p className="text-sm opacity-80">{ergebnis.nachFlughafen.code}</p>
              </div>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm opacity-80">Flugzeit</p>
              <p className="text-4xl font-bold">
                {ergebnis.flugzeitStunden}h {ergebnis.flugzeitMinuten > 0 ? `${ergebnis.flugzeitMinuten}min` : ''}
              </p>
              {!ergebnis.route.direktflug && (
                <p className="text-yellow-200 text-sm mt-1">⚠️ Kein Direktflug – mit Umstieg</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">🌍 Zeitverschiebung</span>
                <div className="text-xl font-bold">
                  {formatZeitverschiebung(ergebnis.zeitverschiebung)}
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">📏 Entfernung</span>
                <div className="text-xl font-bold">
                  {formatNumber(ergebnis.route.entfernungKm)} km
                </div>
              </div>
            </div>
          </div>
{/* Detaillierte Infos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">⏰ Ankunftszeit-Berechnung</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <span className="text-sm text-blue-600">Abflug</span>
                <p className="text-2xl font-bold text-blue-800">{abflugzeit}</p>
                <p className="text-xs text-blue-600">{ergebnis.vonFlughafen.stadt}</p>
              </div>
              <div className="text-center p-4 bg-gray-100 rounded-xl flex items-center justify-center">
                <div>
                  <span className="text-2xl">✈️</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {ergebnis.flugzeitStunden}h {ergebnis.flugzeitMinuten}min
                  </p>
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <span className="text-sm text-green-600">Ankunft</span>
                <p className="text-2xl font-bold text-green-800">{ergebnis.ankunftzeit}</p>
                <p className="text-xs text-green-600">
                  {ergebnis.nachFlughafen.stadt}
                  {ergebnis.tageDifferenz !== 0 && (
                    <span className="ml-1 font-bold">
                      ({ergebnis.tageDifferenz > 0 ? '+' : ''}{ergebnis.tageDifferenz} Tag{Math.abs(ergebnis.tageDifferenz) !== 1 ? 'e' : ''})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl text-sm text-amber-800">
              <strong>💡 Hinweis:</strong> Ankunftszeit ist in Ortszeit am Zielort angegeben. 
              {ergebnis.zeitverschiebung !== 0 && (
                <> Es gibt eine Zeitverschiebung von {formatZeitverschiebung(ergebnis.zeitverschiebung)} gegenüber Deutschland.</>
              )}
            </div>
          </div>

          {/* Fluginformationen */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-4">📊 Flugdaten im Detail</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Flugstrecke</span>
                <span className="font-bold text-gray-900">{formatNumber(ergebnis.route.entfernungKm)} km</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Flugzeit</span>
                <span className="font-bold text-gray-900">
                  {ergebnis.flugzeitStunden}h {ergebnis.flugzeitMinuten}min ({ergebnis.route.flugzeitMin} Minuten)
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Ø Geschwindigkeit</span>
                <span className="text-gray-900">{formatNumber(ergebnis.geschwindigkeitKmh)} km/h</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Flugtyp</span>
                <span className="text-gray-900">
                  {ergebnis.route.direktflug ? '✅ Direktflug verfügbar' : '🔄 Mit Umstieg'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Zeitzone Ziel</span>
                <span className="text-gray-900">UTC{ergebnis.nachFlughafen.zeitzone >= 0 ? '+' : ''}{ergebnis.nachFlughafen.zeitzone}</span>
              </div>
            </div>
          </div>

          {/* Jetlag-Tipps */}
          {Math.abs(ergebnis.zeitverschiebung) >= 3 && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-purple-800 mb-3">😴 Jetlag-Tipps für {Math.abs(ergebnis.zeitverschiebung)} Stunden Zeitverschiebung</h3>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="flex gap-2">
                  <span>💤</span>
                  <span><strong>Schlafrhythmus anpassen:</strong> Beginnen Sie 2-3 Tage vor Abflug, Ihre Schlafzeit anzupassen</span>
                </li>
                <li className="flex gap-2">
                  <span>💧</span>
                  <span><strong>Viel trinken:</strong> Dehydrierung verstärkt Jetlag-Symptome</span>
                </li>
                <li className="flex gap-2">
                  <span>☀️</span>
                  <span><strong>Tageslicht nutzen:</strong> {ergebnis.zeitverschiebung > 0 ? 'Morgens Licht vermeiden, abends suchen' : 'Morgens Licht suchen, abends vermeiden'}</span>
                </li>
                <li className="flex gap-2">
                  <span>🚫</span>
                  <span><strong>Koffein & Alkohol:</strong> In den ersten Tagen einschränken</span>
                </li>
                <li className="flex gap-2">
                  <span>🏃</span>
                  <span><strong>Bewegung:</strong> Leichte Bewegung am Ankunftstag hilft bei der Anpassung</span>
                </li>
              </ul>
            </div>
          )}
        </>
      )}

      {/* Flugzeiten-Tabelle nach Regionen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🌍 Typische Flugzeiten ab Deutschland</h3>
        
        <div className="space-y-4">
          {Object.entries(REGIONEN).map(([regionKey, region]) => {
            const regionZiele = ZIEL_FLUGHAEFEN.filter(f => f.region === regionKey);
            if (regionZiele.length === 0) return null;

            // Beispielrouten für diese Region
            const beispielRouten = regionZiele.slice(0, 4).map(ziel => {
              const route = getRoute('FRA', ziel.code);
              return { ziel, route };
            }).filter(r => r.route);

            return (
              <div key={regionKey} className="border-b border-gray-100 pb-4 last:border-0">
                <h4 className="font-medium text-gray-700 mb-2">
                  {region.emoji} {region.name}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {beispielRouten.map(({ ziel, route }) => (
                    <div 
                      key={ziel.code} 
                      className="flex justify-between bg-gray-50 rounded-lg p-2 cursor-pointer hover:bg-gray-100 transition-all"
                      onClick={() => setZielflughafen(ziel.code)}
                    >
                      <span>{ziel.emoji} {ziel.stadt}</span>
                      <span className="font-medium text-blue-600">
                        {route && `${Math.floor(route.flugzeitMin / 60)}h ${route.flugzeitMin % 60}min`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info-Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Über den Flugzeit-Rechner</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Flugzeiten:</strong> Durchschnittliche Direktflugzeiten, tatsächliche Zeiten können je nach Flugroute und Wetterbedingungen variieren</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Zeitverschiebung:</strong> Basiert auf Standard-Winterzeit (MEZ). Im Sommer kann sich die Differenz ändern</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Umsteigen:</strong> Bei Flügen ohne Direktverbindung verlängert sich die Reisezeit um 1-4 Stunden</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Boarding:</strong> Planen Sie zusätzlich 2-3 Stunden am Flughafen für Check-in und Sicherheitskontrolle ein</span>
          </li>
        </ul>
      </div>

      {/* Spartipps */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">💡 Tipps für günstige Flüge</h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex gap-2">
            <span>📅</span>
            <span><strong>Flexible Daten:</strong> Dienstag und Mittwoch sind oft die günstigsten Flugtage</span>
          </li>
          <li className="flex gap-2">
            <span>⏰</span>
            <span><strong>Früh buchen:</strong> 6-8 Wochen vor Abflug sind Preise oft am niedrigsten</span>
          </li>
          <li className="flex gap-2">
            <span>🔔</span>
            <span><strong>Preisalarme:</strong> Nutzen Sie Vergleichsportale mit Preisbenachrichtigung</span>
          </li>
          <li className="flex gap-2">
            <span>🛫</span>
            <span><strong>Alternative Flughäfen:</strong> Oft günstiger ab Düsseldorf, Hamburg oder Berlin</span>
          </li>
          <li className="flex gap-2">
            <span>🧳</span>
            <span><strong>Nur Handgepäck:</strong> Bei Kurzstrecken bis zu 50% sparen</span>
          </li>
        </ul>
      </div>
{/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Hinweise</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p>
            Flugzeiten basieren auf Durchschnittswerten der großen Fluggesellschaften (Lufthansa, Eurowings, Condor). 
            Zeitverschiebungen beziehen sich auf die Standardzeit (Winterzeit/MEZ).
          </p>
          <p className="mt-2">
            <strong>Stand:</strong> 2025/2026 – Flugzeiten können sich durch Flugroutenänderungen oder Wetterbedingungen ändern.
          </p>
        </div>
        <div className="mt-3 space-y-1">
          <a 
            href="https://www.lufthansa.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Lufthansa – Flugbuchung
          </a>
          <a 
            href="https://www.google.com/flights"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Google Flights – Preisvergleich
          </a>
          <a 
            href="https://www.flightaware.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            FlightAware – Echtzeit-Flugverfolgung
          </a>
        </div>
      </div>
    </div>
  );
}
