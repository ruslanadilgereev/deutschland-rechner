import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Fahrzeugkategorien mit typischen Wertverlustraten (degressiv, pro Jahr)
type FahrzeugKategorie = 'kleinwagen' | 'kompakt' | 'mittelklasse' | 'oberklasse' | 'suv' | 'sportwagen' | 'transporter' | 'elektro';

interface WertverlustProfil {
  name: string;
  emoji: string;
  jahresRaten: number[]; // Wertverlust pro Jahr (Jahr 1, 2, 3, 4, 5+)
  kmFaktorProJahr: number; // Durchschnittliche jährliche km
  beschreibung: string;
}

const FAHRZEUG_PROFILE: Record<FahrzeugKategorie, WertverlustProfil> = {
  kleinwagen: {
    name: 'Kleinwagen',
    emoji: '🚗',
    jahresRaten: [0.24, 0.12, 0.10, 0.08, 0.06], // Höherer Wertverlust im 1. Jahr
    kmFaktorProJahr: 12000,
    beschreibung: 'VW Polo, Opel Corsa, Ford Fiesta, Renault Clio',
  },
  kompakt: {
    name: 'Kompaktklasse',
    emoji: '🚙',
    jahresRaten: [0.22, 0.11, 0.09, 0.07, 0.06],
    kmFaktorProJahr: 15000,
    beschreibung: 'VW Golf, Ford Focus, Opel Astra, Audi A3',
  },
  mittelklasse: {
    name: 'Mittelklasse',
    emoji: '🚘',
    jahresRaten: [0.20, 0.10, 0.08, 0.07, 0.05],
    kmFaktorProJahr: 18000,
    beschreibung: 'VW Passat, BMW 3er, Mercedes C-Klasse, Audi A4',
  },
  oberklasse: {
    name: 'Oberklasse',
    emoji: '🏎️',
    jahresRaten: [0.25, 0.13, 0.10, 0.08, 0.06], // Höherer anfänglicher Wertverlust
    kmFaktorProJahr: 20000,
    beschreibung: 'BMW 5er/7er, Mercedes E/S-Klasse, Audi A6/A8',
  },
  suv: {
    name: 'SUV / Geländewagen',
    emoji: '🚐',
    jahresRaten: [0.18, 0.10, 0.08, 0.06, 0.05], // Bessere Wertstabilität
    kmFaktorProJahr: 16000,
    beschreibung: 'VW Tiguan, BMW X3/X5, Mercedes GLC, Audi Q5',
  },
  sportwagen: {
    name: 'Sportwagen',
    emoji: '🏎️',
    jahresRaten: [0.15, 0.08, 0.07, 0.06, 0.05], // Gute Wertstabilität
    kmFaktorProJahr: 8000,
    beschreibung: 'Porsche 911, BMW M-Serie, Mercedes AMG',
  },
  transporter: {
    name: 'Transporter / Van',
    emoji: '🚐',
    jahresRaten: [0.16, 0.09, 0.08, 0.07, 0.06],
    kmFaktorProJahr: 25000,
    beschreibung: 'VW Transporter, Mercedes Sprinter, Ford Transit',
  },
  elektro: {
    name: 'Elektroauto',
    emoji: '🔋',
    jahresRaten: [0.28, 0.14, 0.10, 0.08, 0.06], // Aktuell höherer Wertverlust
    kmFaktorProJahr: 14000,
    beschreibung: 'Tesla, VW ID, BMW i-Serie, Mercedes EQ',
  },
};

// Zustand mit Bewertung
const ZUSTAND_FAKTOREN = [
  { id: 'sehr_gut', name: 'Sehr gut', faktor: 1.05, emoji: '⭐', beschreibung: 'Neuwertig, keine Mängel, Scheckheft gepflegt' },
  { id: 'gut', name: 'Gut', faktor: 1.0, emoji: '✓', beschreibung: 'Normale Gebrauchsspuren, gepflegt' },
  { id: 'befriedigend', name: 'Befriedigend', faktor: 0.92, emoji: '~', beschreibung: 'Deutliche Gebrauchsspuren, kleinere Mängel' },
  { id: 'maessig', name: 'Mäßig', faktor: 0.82, emoji: '⚠️', beschreibung: 'Größere Mängel, Reparaturbedarf' },
];

// Ausstattung
const AUSSTATTUNG_FAKTOREN = [
  { id: 'basis', name: 'Basis', faktor: 0.95, emoji: '📦' },
  { id: 'standard', name: 'Standard', faktor: 1.0, emoji: '🎯' },
  { id: 'komfort', name: 'Komfort', faktor: 1.05, emoji: '✨' },
  { id: 'premium', name: 'Premium/Vollausstattung', faktor: 1.12, emoji: '💎' },
];

export default function RestwertRechner() {
  const [neupreis, setNeupreis] = useState(35000);
  const [alterJahre, setAlterJahre] = useState(3);
  const [alterMonate, setAlterMonate] = useState(0);
  const [kmStand, setKmStand] = useState(45000);
  const [kategorie, setKategorie] = useState<FahrzeugKategorie>('kompakt');
  const [zustand, setZustand] = useState('gut');
  const [ausstattung, setAusstattung] = useState('standard');

  const profil = FAHRZEUG_PROFILE[kategorie];

  const ergebnis = useMemo(() => {
    // Gesamtalter in Jahren (mit Monaten)
    const alterGesamt = alterJahre + alterMonate / 12;
    
    // 1. Wertverlust durch Alter (degressive Methode)
    let restwertNachAlter = neupreis;
    let wertverlustJahreSumme = 0;
    
    // Für jedes volle Jahr den entsprechenden Wertverlust anwenden
    for (let jahr = 0; jahr < Math.floor(alterGesamt); jahr++) {
      const rate = jahr < profil.jahresRaten.length 
        ? profil.jahresRaten[jahr] 
        : profil.jahresRaten[profil.jahresRaten.length - 1];
      const verlust = restwertNachAlter * rate;
      wertverlustJahreSumme += verlust;
      restwertNachAlter -= verlust;
    }
    
    // Anteiliger Monat
    const restMonate = alterGesamt - Math.floor(alterGesamt);
    if (restMonate > 0) {
      const aktuellesJahr = Math.floor(alterGesamt);
      const rate = aktuellesJahr < profil.jahresRaten.length 
        ? profil.jahresRaten[aktuellesJahr] 
        : profil.jahresRaten[profil.jahresRaten.length - 1];
      const monatsverlust = (restwertNachAlter * rate) * restMonate;
      wertverlustJahreSumme += monatsverlust;
      restwertNachAlter -= monatsverlust;
    }
    
    // 2. Kilometerkorrektur
    const durchschnittsKm = profil.kmFaktorProJahr * alterGesamt;
    const kmDifferenz = kmStand - durchschnittsKm;
    // Ca. 1 Cent pro km Abweichung vom Durchschnitt (vereinfacht)
    // Bei teureren Autos mehr, bei günstigeren weniger
    const kmWertProKm = neupreis / 1000000; // ~3.5 Cent bei 35k€ Auto
    const kmKorrektur = -kmDifferenz * kmWertProKm;
    
    // Begrenze km-Korrektur auf max. ±15% des Restwerts
    const maxKmKorrektur = restwertNachAlter * 0.15;
    const kmKorrekturBegrenzt = Math.max(-maxKmKorrektur, Math.min(maxKmKorrektur, kmKorrektur));
    
    let restwertNachKm = restwertNachAlter + kmKorrekturBegrenzt;
    
    // 3. Zustandsfaktor
    const zustandFaktor = ZUSTAND_FAKTOREN.find(z => z.id === zustand)?.faktor || 1.0;
    const restwertNachZustand = restwertNachKm * zustandFaktor;
    
    // 4. Ausstattungsfaktor
    const ausstattungFaktor = AUSSTATTUNG_FAKTOREN.find(a => a.id === ausstattung)?.faktor || 1.0;
    const restwertFinal = restwertNachZustand * ausstattungFaktor;
    
    // Statistiken
    const gesamtWertverlust = neupreis - restwertFinal;
    const wertverlustProzent = (gesamtWertverlust / neupreis) * 100;
    const restwertProzent = 100 - wertverlustProzent;
    const wertverlustProJahr = alterGesamt > 0 ? gesamtWertverlust / alterGesamt : 0;
    const wertverlustProMonat = wertverlustProJahr / 12;
    const wertverlustProKm = kmStand > 0 ? gesamtWertverlust / kmStand : 0;
    
    // Wertverlust-Prognose für nächstes Jahr
    const rateNaechstesJahr = Math.floor(alterGesamt) < profil.jahresRaten.length 
      ? profil.jahresRaten[Math.floor(alterGesamt)] 
      : profil.jahresRaten[profil.jahresRaten.length - 1];
    const wertverlustNaechstesJahr = restwertFinal * rateNaechstesJahr;
    const restwertIn1Jahr = restwertFinal - wertverlustNaechstesJahr;
    
    // Spanne (Händler-Einkauf bis Privatverkauf)
    const haendlerEinkauf = restwertFinal * 0.85;
    const privatverkauf = restwertFinal * 1.08;
    
    return {
      restwertFinal: Math.max(0, restwertFinal),
      haendlerEinkauf: Math.max(0, haendlerEinkauf),
      privatverkauf: Math.max(0, privatverkauf),
      gesamtWertverlust,
      wertverlustProzent,
      restwertProzent,
      wertverlustProJahr,
      wertverlustProMonat,
      wertverlustProKm,
      durchschnittsKm,
      kmDifferenz,
      kmKorrekturBegrenzt,
      zustandFaktor,
      ausstattungFaktor,
      wertverlustNaechstesJahr,
      restwertIn1Jahr,
      alterGesamt,
    };
  }, [neupreis, alterJahre, alterMonate, kmStand, kategorie, zustand, ausstattung, profil]);

  const formatEuro = (n: number) => Math.round(n).toLocaleString('de-DE') + ' €';
  const formatNumber = (n: number, decimals = 0) => n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Restwert-Rechner" rechnerSlug="restwert-rechner" />

{/* Eingabe-Bereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Neupreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Neupreis (Listenpreis)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Ursprünglicher Kaufpreis inkl. Ausstattung
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={neupreis}
              onChange={(e) => setNeupreis(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-lg"
              min="1000"
              max="500000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
          </div>
          <input
            type="range"
            value={neupreis}
            onChange={(e) => setNeupreis(Number(e.target.value))}
            className="w-full mt-2 accent-orange-500"
            min="5000"
            max="150000"
            step="1000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5.000 €</span>
            <span>150.000 €</span>
          </div>
        </div>

        {/* Fahrzeugalter */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugalter</span>
            <span className="text-xs text-gray-500 block mt-1">
              Alter seit Erstzulassung
            </span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Jahre</label>
              <div className="flex items-center bg-gray-100 rounded-xl">
                <button
                  onClick={() => setAlterJahre(Math.max(0, alterJahre - 1))}
                  className="px-4 py-3 text-xl font-bold text-gray-600 hover:bg-gray-200 rounded-l-xl transition-all"
                >
                  −
                </button>
                <span className="px-4 py-3 text-xl font-bold text-gray-800 flex-1 text-center">{alterJahre}</span>
                <button
                  onClick={() => setAlterJahre(Math.min(25, alterJahre + 1))}
                  className="px-4 py-3 text-xl font-bold text-gray-600 hover:bg-gray-200 rounded-r-xl transition-all"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Monate</label>
              <div className="flex items-center bg-gray-100 rounded-xl">
                <button
                  onClick={() => setAlterMonate(Math.max(0, alterMonate - 1))}
                  className="px-4 py-3 text-xl font-bold text-gray-600 hover:bg-gray-200 rounded-l-xl transition-all"
                >
                  −
                </button>
                <span className="px-4 py-3 text-xl font-bold text-gray-800 flex-1 text-center">{alterMonate}</span>
                <button
                  onClick={() => setAlterMonate(Math.min(11, alterMonate + 1))}
                  className="px-4 py-3 text-xl font-bold text-gray-600 hover:bg-gray-200 rounded-r-xl transition-all"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kilometerstand */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kilometerstand</span>
            <span className="text-xs text-gray-500 block mt-1">
              Aktueller Tachostand
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kmStand}
              onChange={(e) => setKmStand(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-lg"
              min="0"
              max="500000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">km</span>
          </div>
          <input
            type="range"
            value={kmStand}
            onChange={(e) => setKmStand(Number(e.target.value))}
            className="w-full mt-2 accent-orange-500"
            min="0"
            max="300000"
            step="5000"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">0 km</span>
            {ergebnis.alterGesamt > 0 && (
              <span className={`text-xs ${Math.abs(ergebnis.kmDifferenz) > 10000 ? 'text-orange-600' : 'text-gray-500'}`}>
                Ø für {formatNumber(ergebnis.alterGesamt, 1)} Jahre: {formatNumber(ergebnis.durchschnittsKm)} km
                {ergebnis.kmDifferenz > 0 ? ` (+${formatNumber(ergebnis.kmDifferenz)} km)` : ergebnis.kmDifferenz < 0 ? ` (${formatNumber(ergebnis.kmDifferenz)} km)` : ''}
              </span>
            )}
            <span className="text-xs text-gray-400">300.000 km</span>
          </div>
        </div>

        {/* Fahrzeugkategorie */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugkategorie</span>
            <span className="text-xs text-gray-500 block mt-1">
              Wählen Sie die passende Kategorie für typische Wertverlust-Kurve
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.entries(FAHRZEUG_PROFILE) as [FahrzeugKategorie, WertverlustProfil][]).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setKategorie(key)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-xs ${
                  kategorie === key
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{value.emoji}</span>
                <span className="block mt-1">{value.name}</span>
              </button>
            ))}
          </div>
          {kategorie && (
            <p className="text-xs text-gray-500 mt-2 italic">
              z.B. {profil.beschreibung}
            </p>
          )}
        </div>

        {/* Zustand */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugzustand</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ZUSTAND_FAKTOREN.map((z) => (
              <button
                key={z.id}
                onClick={() => setZustand(z.id)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-xs ${
                  zustand === z.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{z.emoji}</span>
                <span className="block mt-1">{z.name}</span>
                <span className="block text-xs opacity-70">
                  {z.faktor > 1 ? `+${Math.round((z.faktor - 1) * 100)}%` : z.faktor < 1 ? `${Math.round((z.faktor - 1) * 100)}%` : '±0%'}
                </span>
              </button>
            ))}
          </div>
          {zustand && (
            <p className="text-xs text-gray-500 mt-2 italic">
              {ZUSTAND_FAKTOREN.find(z => z.id === zustand)?.beschreibung}
            </p>
          )}
        </div>

        {/* Ausstattung */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ausstattungsniveau</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AUSSTATTUNG_FAKTOREN.map((a) => (
              <button
                key={a.id}
                onClick={() => setAusstattung(a.id)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-xs ${
                  ausstattung === a.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{a.emoji}</span>
                <span className="block mt-1">{a.name}</span>
                <span className="block text-xs opacity-70">
                  {a.faktor > 1 ? `+${Math.round((a.faktor - 1) * 100)}%` : a.faktor < 1 ? `${Math.round((a.faktor - 1) * 100)}%` : '±0%'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ergebnis-Bereich */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🚗 Geschätzter Restwert</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.restwertFinal)}</span>
          </div>
          <p className="text-orange-100 mt-2 text-sm">
            {formatNumber(ergebnis.restwertProzent, 1)}% des Neupreises nach {formatNumber(ergebnis.alterGesamt, 1)} Jahren
          </p>
        </div>

        {/* Preisspanne */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm mb-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <span className="text-xs opacity-80">Händler-Einkauf</span>
              <p className="font-bold text-lg">{formatEuro(ergebnis.haendlerEinkauf)}</p>
            </div>
            <div className="text-center px-4">
              <span className="text-xs opacity-80">Marktpreis</span>
              <p className="font-bold text-xl">{formatEuro(ergebnis.restwertFinal)}</p>
            </div>
            <div className="text-center">
              <span className="text-xs opacity-80">Privatverkauf</span>
              <p className="font-bold text-lg">{formatEuro(ergebnis.privatverkauf)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-xs opacity-80">Wertverlust gesamt</span>
            <div className="text-xl font-bold text-red-200">−{formatEuro(ergebnis.gesamtWertverlust)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-xs opacity-80">Wertverlust %</span>
            <div className="text-xl font-bold text-red-200">−{formatNumber(ergebnis.wertverlustProzent, 1)}%</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm col-span-2 sm:col-span-1">
            <span className="text-xs opacity-80">Pro Monat</span>
            <div className="text-xl font-bold">~{formatEuro(ergebnis.wertverlustProMonat)}</div>
          </div>
        </div>
      </div>
{/* Wertverlust-Balken */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Wertentwicklung</h3>
        
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
            style={{ width: `${ergebnis.restwertProzent}%` }}
          />
          <div 
            className="absolute right-0 top-0 h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
            style={{ width: `${ergebnis.wertverlustProzent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-4 text-sm font-bold">
            <span className="text-white drop-shadow">{formatNumber(ergebnis.restwertProzent, 0)}% Restwert</span>
            <span className="text-white drop-shadow">{formatNumber(ergebnis.wertverlustProzent, 0)}% Verlust</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-green-50 rounded-xl">
            <span className="text-sm text-green-600">Aktueller Wert</span>
            <p className="font-bold text-2xl text-green-700">{formatEuro(ergebnis.restwertFinal)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <span className="text-sm text-red-600">Wertverlust</span>
            <p className="font-bold text-2xl text-red-700">−{formatEuro(ergebnis.gesamtWertverlust)}</p>
          </div>
        </div>
      </div>

      {/* Prognose */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔮 Prognose nächstes Jahr</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50 rounded-xl">
            <span className="text-sm text-amber-700">Erwarteter Wertverlust</span>
            <p className="font-bold text-xl text-amber-900">−{formatEuro(ergebnis.wertverlustNaechstesJahr)}</p>
            <p className="text-xs text-amber-600 mt-1">ca. −{formatNumber((ergebnis.wertverlustNaechstesJahr / ergebnis.restwertFinal) * 100, 1)}%</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <span className="text-sm text-blue-700">Restwert in 1 Jahr</span>
            <p className="font-bold text-xl text-blue-900">{formatEuro(ergebnis.restwertIn1Jahr)}</p>
            <p className="text-xs text-blue-600 mt-1">bei {formatNumber(kmStand + profil.kmFaktorProJahr)} km</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600">
            <strong>Tipp:</strong> Der Wertverlust verlangsamt sich mit zunehmendem Alter. 
            {ergebnis.alterGesamt < 3 && ' In den ersten 3 Jahren verliert ein Fahrzeug typischerweise 40-50% seines Wertes.'}
            {ergebnis.alterGesamt >= 3 && ergebnis.alterGesamt < 6 && ' Ab Jahr 3-6 stabilisiert sich der Wertverlust bei ca. 6-10% pro Jahr.'}
            {ergebnis.alterGesamt >= 6 && ' Ab 6+ Jahren ist der prozentuale Wertverlust deutlich geringer.'}
          </p>
        </div>
      </div>

      {/* Detailberechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Neupreis</span>
            <span className="font-bold text-gray-900">{formatEuro(neupreis)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Fahrzeugalter</span>
            <span className="text-gray-900">{alterJahre} Jahre, {alterMonate} Monate</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Kategorie: {profil.name}</span>
            <span className="text-gray-500 text-xs">1. Jahr: −{formatNumber(profil.jahresRaten[0] * 100, 0)}%</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Kilometerkorrektur</span>
            <span className={`${ergebnis.kmKorrekturBegrenzt >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {ergebnis.kmKorrekturBegrenzt >= 0 ? '+' : ''}{formatEuro(ergebnis.kmKorrekturBegrenzt)}
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Zustandsfaktor</span>
            <span className={ergebnis.zustandFaktor >= 1 ? 'text-green-600' : 'text-red-600'}>
              ×{formatNumber(ergebnis.zustandFaktor, 2)}
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Ausstattungsfaktor</span>
            <span className={ergebnis.ausstattungFaktor >= 1 ? 'text-green-600' : 'text-red-600'}>
              ×{formatNumber(ergebnis.ausstattungFaktor, 2)}
            </span>
          </div>
          
          <div className="flex justify-between py-3 bg-orange-50 -mx-6 px-6 mt-4">
            <span className="font-bold text-orange-800">Geschätzter Restwert</span>
            <span className="font-bold text-2xl text-orange-900">{formatEuro(ergebnis.restwertFinal)}</span>
          </div>
        </div>
      </div>

      {/* Statistiken */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 Kosten-Statistik</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <span className="text-xs text-gray-500">Pro Jahr</span>
            <p className="font-bold text-lg text-gray-800">{formatEuro(ergebnis.wertverlustProJahr)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <span className="text-xs text-gray-500">Pro Monat</span>
            <p className="font-bold text-lg text-gray-800">{formatEuro(ergebnis.wertverlustProMonat)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-gray-500">Pro Kilometer</span>
            <p className="font-bold text-lg text-gray-800">{formatNumber(ergebnis.wertverlustProKm * 100, 1)} Cent</p>
          </div>
        </div>
      </div>

      {/* Typische Wertverlust-Kurve */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📉 Typischer Wertverlust {profil.name}</h3>
        
        <div className="space-y-2">
          {profil.jahresRaten.map((rate, index) => {
            const jahr = index + 1;
            let kumuliert = 1;
            for (let i = 0; i <= index; i++) {
              kumuliert *= (1 - profil.jahresRaten[i]);
            }
            const restwertProzent = kumuliert * 100;
            
            return (
              <div key={index} className="flex items-center gap-3">
                <span className="w-16 text-sm text-gray-500">Jahr {jahr}{index === 4 ? '+' : ''}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      ergebnis.alterGesamt >= jahr - 0.5 && ergebnis.alterGesamt < jahr + 0.5 
                        ? 'bg-orange-500' 
                        : 'bg-gray-300'
                    }`}
                    style={{ width: `${restwertProzent}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {formatNumber(restwertProzent, 0)}% (−{formatNumber(rate * 100, 0)}% p.a.)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Degressive Abschreibung: Der Wertverlust ist im ersten Jahr am höchsten und nimmt dann ab.
        </p>
      </div>

      {/* Tipps */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">💡 Tipps für den Fahrzeugwert</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>📔</span>
            <span><strong>Scheckheft:</strong> Lückenlose Wartungshistorie erhöht den Wert um 5-10%</span>
          </li>
          <li className="flex gap-2">
            <span>🧹</span>
            <span><strong>Pflege:</strong> Professionelle Aufbereitung vor Verkauf lohnt sich meist</span>
          </li>
          <li className="flex gap-2">
            <span>📷</span>
            <span><strong>Dokumentation:</strong> Rechnungen für Reparaturen und Extras aufbewahren</span>
          </li>
          <li className="flex gap-2">
            <span>🚗</span>
            <span><strong>Kilometerstand:</strong> Wenigfahrer-Fahrzeuge erzielen bessere Preise</span>
          </li>
          <li className="flex gap-2">
            <span>📅</span>
            <span><strong>Timing:</strong> Cabrios im Frühling, Allrad im Herbst verkaufen</span>
          </li>
          <li className="flex gap-2">
            <span>🔍</span>
            <span><strong>Marktvergleich:</strong> Mobile.de und Autoscout24 für aktuelle Preise prüfen</span>
          </li>
        </ul>
      </div>

      {/* Info-Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wie wird der Restwert berechnet?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>1️⃣</span>
            <span><strong>Degressive Abschreibung:</strong> Höchster Wertverlust im ersten Jahr (15-25%), dann abnehmend</span>
          </li>
          <li className="flex gap-2">
            <span>2️⃣</span>
            <span><strong>Kilometerkorrektur:</strong> Mehr/weniger km als Durchschnitt beeinflusst den Wert</span>
          </li>
          <li className="flex gap-2">
            <span>3️⃣</span>
            <span><strong>Zustand & Ausstattung:</strong> Korrekturfaktoren für individuellen Zustand</span>
          </li>
          <li className="flex gap-2">
            <span>4️⃣</span>
            <span><strong>Fahrzeugkategorie:</strong> SUVs und Sportwagen halten Wert besser als Kleinwagen</span>
          </li>
        </ul>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
          <strong>Hinweis:</strong> Dies ist eine Schätzung basierend auf Durchschnittswerten. 
          Der tatsächliche Marktwert hängt von vielen weiteren Faktoren ab (Marke, Modell, Farbe, 
          regionale Nachfrage, Sonderausstattung, etc.). Für eine genaue Bewertung empfehlen wir 
          professionelle Bewertungsdienste wie DAT oder Schwacke.
        </div>
      </div>
{/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Weiterführende Links</h4>
        <div className="space-y-1">
          <a 
            href="https://www.dat.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DAT – Deutsche Automobil Treuhand
          </a>
          <a 
            href="https://www.schwacke.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Schwacke – Fahrzeugbewertung
          </a>
          <a 
            href="https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Auto kaufen & verkaufen
          </a>
          <a 
            href="https://www.mobile.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Mobile.de – Fahrzeugmarkt
          </a>
        </div>
      </div>
    </div>
  );
}
