import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Kalorienverbrauch pro Stunde beim Radfahren (nach Körpergewicht)
const KALORIEN_PRO_KM = {
  entspannt: 22, // ~15 km/h, entspanntes Radfahren
  moderat: 30, // ~20 km/h, zügiges Radfahren
  sportlich: 40, // ~25 km/h, sportliches Radfahren
  eBike: 12, // E-Bike mit Unterstützung
};

// Autokosten pro Kilometer (ADAC Vollkosten 2024/2025)
const AUTO_KOSTEN = {
  kleinwagen: { name: 'Kleinwagen', kostenProKm: 0.35, verbrauch: 5.5, co2ProKm: 130 },
  kompakt: { name: 'Kompaktklasse', kostenProKm: 0.42, verbrauch: 6.5, co2ProKm: 150 },
  mittel: { name: 'Mittelklasse', kostenProKm: 0.52, verbrauch: 7.5, co2ProKm: 175 },
  suv: { name: 'SUV', kostenProKm: 0.65, verbrauch: 9.0, co2ProKm: 210 },
};

// MET-Werte (Metabolic Equivalent of Task)
const MET_RADFAHREN = {
  entspannt: 4.0, // 15 km/h
  moderat: 6.8, // 20 km/h
  sportlich: 10.0, // 25 km/h
  eBike: 3.0, // E-Bike
};

// Durchschnittsgeschwindigkeiten
const GESCHWINDIGKEIT = {
  entspannt: 15,
  moderat: 20,
  sportlich: 25,
  eBike: 22,
};

type Fahrstil = 'entspannt' | 'moderat' | 'sportlich' | 'eBike';
type AutoTyp = 'kleinwagen' | 'kompakt' | 'mittel' | 'suv';

export default function FahrradPendelnRechner() {
  const [entfernungEinfach, setEntfernungEinfach] = useState(10);
  const [tageProWoche, setTageProWoche] = useState(5);
  const [koerpergewicht, setKoerpergewicht] = useState(75);
  const [fahrstil, setFahrstil] = useState<Fahrstil>('moderat');
  const [autoTyp, setAutoTyp] = useState<AutoTyp>('kompakt');
  const [parkkosten, setParkkosten] = useState(0);
  const [hinUndZurueck, setHinUndZurueck] = useState(true);

  const ergebnis = useMemo(() => {
    // Berechnung der Strecken
    const streckeProTag = hinUndZurueck ? entfernungEinfach * 2 : entfernungEinfach;
    const streckeProWoche = streckeProTag * tageProWoche;
    const streckeProMonat = streckeProWoche * 4.33; // Durchschnitt 4.33 Wochen/Monat
    const streckeProJahr = streckeProWoche * 52;
    const arbeitstageProJahr = tageProWoche * 52;

    // Fahrzeit Fahrrad
    const geschwindigkeit = GESCHWINDIGKEIT[fahrstil];
    const fahrzeitProTagMinuten = (streckeProTag / geschwindigkeit) * 60;
    const fahrzeitProTagStunden = streckeProTag / geschwindigkeit;

    // === KALORIENVERBRAUCH ===
    const metWert = MET_RADFAHREN[fahrstil];
    // Formel: Kalorien = MET × Körpergewicht (kg) × Zeit (Stunden)
    const kalorienProTag = metWert * koerpergewicht * fahrzeitProTagStunden;
    const kalorienProWoche = kalorienProTag * tageProWoche;
    const kalorienProMonat = kalorienProTag * tageProWoche * 4.33;
    const kalorienProJahr = kalorienProTag * arbeitstageProJahr;

    // Umrechnung: 7700 kcal ≈ 1 kg Körperfett
    const fettabbauProMonat = kalorienProMonat / 7700;
    const fettabbauProJahr = kalorienProJahr / 7700;

    // Vergleich: Äquivalente Aktivitäten
    const schokoladenTafeln = kalorienProTag / 530; // 100g Schokolade ≈ 530 kcal
    const bierGlaeser = kalorienProTag / 200; // 0.5l Bier ≈ 200 kcal
    const pizzaScheiben = kalorienProTag / 270; // Eine Scheibe Pizza ≈ 270 kcal

    // === AUTOKOSTEN ===
    const auto = AUTO_KOSTEN[autoTyp];
    const autoKostenProTag = streckeProTag * auto.kostenProKm + parkkosten;
    const autoKostenProWoche = autoKostenProTag * tageProWoche;
    const autoKostenProMonat = autoKostenProWoche * 4.33;
    const autoKostenProJahr = autoKostenProWoche * 52;

    // Nur Spritkosten (für Vergleich)
    const spritpreis = 1.70; // Durchschnitt Benzin 2025
    const spritkostenProTag = (streckeProTag / 100) * auto.verbrauch * spritpreis;
    const spritkostenProMonat = spritkostenProTag * tageProWoche * 4.33;
    const spritkostenProJahr = spritkostenProTag * arbeitstageProJahr;

    // === FAHRRADKOSTEN ===
    const fahrradAnschaffung = fahrstil === 'eBike' ? 3000 : 800; // E-Bike vs normales Fahrrad
    const fahrradWartungProJahr = fahrstil === 'eBike' ? 200 : 100;
    const fahrradAbschreibungProJahr = fahrradAnschaffung / 5; // 5 Jahre Lebensdauer
    const fahrradKostenProJahr = fahrradAbschreibungProJahr + fahrradWartungProJahr;
    const fahrradKostenProMonat = fahrradKostenProJahr / 12;
    const fahrradKostenProKm = fahrradKostenProJahr / streckeProJahr;

    // === ERSPARNIS ===
    const ersparnisProTag = autoKostenProTag; // Fahrradkosten vernachlässigbar pro Tag
    const ersparnisProMonat = autoKostenProMonat - fahrradKostenProMonat;
    const ersparnisProJahr = autoKostenProJahr - fahrradKostenProJahr;
    const ersparnis5Jahre = ersparnisProJahr * 5;

    // === CO2-EINSPARUNG ===
    const co2ProTagAuto = (streckeProTag * auto.co2ProKm) / 1000; // in kg
    const co2ProMonatAuto = co2ProTagAuto * tageProWoche * 4.33;
    const co2ProJahrAuto = co2ProTagAuto * arbeitstageProJahr;

    // CO2-Produktion Fahrrad (nur Herstellung, Essen)
    const co2ProKmFahrrad = fahrstil === 'eBike' ? 0.015 : 0.008; // kg CO2/km
    const co2ProTagFahrrad = streckeProTag * co2ProKmFahrrad;
    const co2ProJahrFahrrad = co2ProTagFahrrad * arbeitstageProJahr;

    const co2EinsparungProTag = co2ProTagAuto - co2ProTagFahrrad;
    const co2EinsparungProMonat = co2ProMonatAuto - (co2ProTagFahrrad * tageProWoche * 4.33);
    const co2EinsparungProJahr = co2ProJahrAuto - co2ProJahrFahrrad;

    // Vergleichswerte CO2
    const baeumeBinden = co2EinsparungProJahr / 22; // Ein Baum bindet ca. 22 kg CO2/Jahr
    const fluegeFrankfurtMallorca = co2EinsparungProJahr / 280; // Hin+Rück ca. 280 kg CO2

    // === GESUNDHEITSEFFEKTE ===
    const bewegungsminutenProTag = fahrzeitProTagMinuten;
    const bewegungsminutenProWoche = bewegungsminutenProTag * tageProWoche;
    const whoEmpfehlung = 150; // WHO: 150 min moderate Bewegung pro Woche
    const whoErfuellt = (bewegungsminutenProWoche / whoEmpfehlung) * 100;

    // Statistische Lebenserwartungsverbesserung (vereinfacht)
    // Studien zeigen: 150 min/Woche moderate Bewegung = +3-5 Jahre Lebenserwartung
    const lebenszeitGewinn = Math.min(bewegungsminutenProWoche / whoEmpfehlung, 2) * 2.5; // bis zu 5 Jahre

    // Herzfrequenz-Training
    const fatburningZone = bewegungsminutenProTag; // Bei moderatem Radfahren im Fatburning-Bereich

    return {
      // Strecken
      streckeProTag,
      streckeProWoche,
      streckeProMonat,
      streckeProJahr,

      // Fahrzeit
      fahrzeitProTagMinuten,
      geschwindigkeit,

      // Kalorien
      kalorienProTag,
      kalorienProWoche,
      kalorienProMonat,
      kalorienProJahr,
      fettabbauProMonat,
      fettabbauProJahr,
      schokoladenTafeln,
      bierGlaeser,
      pizzaScheiben,

      // Autokosten
      autoKostenProTag,
      autoKostenProWoche,
      autoKostenProMonat,
      autoKostenProJahr,
      spritkostenProJahr,

      // Fahrradkosten
      fahrradKostenProMonat,
      fahrradKostenProJahr,
      fahrradKostenProKm,

      // Ersparnis
      ersparnisProTag,
      ersparnisProMonat,
      ersparnisProJahr,
      ersparnis5Jahre,

      // CO2
      co2ProTagAuto,
      co2ProJahrAuto,
      co2EinsparungProTag,
      co2EinsparungProMonat,
      co2EinsparungProJahr,
      baeumeBinden,
      fluegeFrankfurtMallorca,

      // Gesundheit
      bewegungsminutenProTag,
      bewegungsminutenProWoche,
      whoErfuellt,
      lebenszeitGewinn,
      fatburningZone,
    };
  }, [entfernungEinfach, tageProWoche, koerpergewicht, fahrstil, autoTyp, parkkosten, hinUndZurueck]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatNumber = (n: number, decimals = 1) => n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const formatKg = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Fahrrad-Pendler-Rechner" rechnerSlug="fahrrad-pendeln-rechner" />

{/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">🚴</span>
          Ihre Pendler-Daten
        </h2>

        {/* Entfernung */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Entfernung zur Arbeit</span>
            <span className="text-xs text-gray-500 block mt-1">
              Einfache Strecke in Kilometern
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={entfernungEinfach}
              onChange={(e) => setEntfernungEinfach(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-lg"
              min="1"
              max="100"
              step="0.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">km</span>
          </div>
          <input
            type="range"
            value={entfernungEinfach}
            onChange={(e) => setEntfernungEinfach(Number(e.target.value))}
            className="w-full mt-2 accent-green-500"
            min="1"
            max="50"
            step="0.5"
          />
          
          {/* Hin und Zurück Toggle */}
          <div className="mt-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hinUndZurueck}
                onChange={(e) => setHinUndZurueck(e.target.checked)}
                className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
              />
              <span className="text-gray-700">Hin- und Rückfahrt berechnen</span>
            </label>
            {hinUndZurueck && (
              <p className="text-sm text-green-600 mt-1 ml-8">
                Gesamtstrecke pro Tag: {formatNumber(entfernungEinfach * 2, 1)} km
              </p>
            )}
          </div>
        </div>

        {/* Arbeitstage */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Arbeitstage pro Woche</span>
          </label>
          <div className="flex items-center bg-gray-100 rounded-xl inline-flex">
            {[1, 2, 3, 4, 5, 6].map((tag) => (
              <button
                key={tag}
                onClick={() => setTageProWoche(tag)}
                className={`px-5 py-3 font-medium transition-all ${
                  tageProWoche === tag
                    ? 'bg-green-500 text-white rounded-xl shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Körpergewicht */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Körpergewicht</span>
            <span className="text-xs text-gray-500 block mt-1">
              Für Kalorienberechnung
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={koerpergewicht}
              onChange={(e) => setKoerpergewicht(Number(e.target.value))}
              className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-lg"
              min="40"
              max="200"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kg</span>
          </div>
        </div>

        {/* Fahrstil */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrstil / Fahrradtyp</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'entspannt', name: 'Entspannt', emoji: '🚲', speed: '~15 km/h', desc: 'Gemütlich' },
              { id: 'moderat', name: 'Moderat', emoji: '🚴', speed: '~20 km/h', desc: 'Zügig' },
              { id: 'sportlich', name: 'Sportlich', emoji: '🚴‍♂️', speed: '~25 km/h', desc: 'Schnell' },
              { id: 'eBike', name: 'E-Bike', emoji: '⚡', speed: '~22 km/h', desc: 'Mit Unterstützung' },
            ].map((stil) => (
              <button
                key={stil.id}
                onClick={() => setFahrstil(stil.id as Fahrstil)}
                className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                  fahrstil === stil.id
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-2xl">{stil.emoji}</span>
                <span className="block font-medium mt-1">{stil.name}</span>
                <span className={`block text-xs ${fahrstil === stil.id ? 'text-green-100' : 'text-gray-500'}`}>
                  {stil.speed} • {stil.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Vergleich: Autotyp */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Vergleich mit Auto</span>
            <span className="text-xs text-gray-500 block mt-1">
              Vollkosten inkl. Wertverlust, Versicherung, Wartung (ADAC)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(AUTO_KOSTEN).map(([key, auto]) => (
              <button
                key={key}
                onClick={() => setAutoTyp(key as AutoTyp)}
                className={`py-3 px-4 rounded-xl font-medium transition-all text-left ${
                  autoTyp === key
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">🚗</span>
                <span className="block font-medium">{auto.name}</span>
                <span className={`block text-xs ${autoTyp === key ? 'text-orange-100' : 'text-gray-500'}`}>
                  {formatNumber(auto.kostenProKm * 100, 0)} Cent/km
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Parkkosten */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Parkkosten pro Tag (optional)</span>
          </label>
          <div className="relative w-40">
            <input
              type="number"
              value={parkkosten}
              onChange={(e) => setParkkosten(Number(e.target.value))}
              className="w-full p-3 pr-8 border-2 border-gray-200 rounded-xl focus:border-green-500 text-lg"
              min="0"
              max="50"
              step="0.5"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
          </div>
        </div>
      </div>

      {/* Haupt-Ergebnis: Ersparnis */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">💰 Ihre jährliche Ersparnis</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.ersparnisProJahr)}</span>
          </div>
          <p className="text-green-100 mt-2 text-sm">
            = {formatEuro(ergebnis.ersparnisProMonat)} pro Monat
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center">
            <span className="text-2xl">🔥</span>
            <div className="text-xl font-bold">{formatNumber(ergebnis.kalorienProJahr / 1000, 0)}k</div>
            <span className="text-xs opacity-80">kcal/Jahr</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center">
            <span className="text-2xl">🌱</span>
            <div className="text-xl font-bold">{formatNumber(ergebnis.co2EinsparungProJahr / 1000, 1)}t</div>
            <span className="text-xs opacity-80">CO₂ gespart</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm text-center">
            <span className="text-2xl">📏</span>
            <div className="text-xl font-bold">{formatNumber(ergebnis.streckeProJahr, 0)}</div>
            <span className="text-xs opacity-80">km/Jahr</span>
          </div>
        </div>
      </div>
{/* Kalorienverbrauch */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          Kalorienverbrauch
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
            <span className="text-sm text-orange-600">Pro Tag</span>
            <p className="text-2xl font-bold text-orange-700">{formatNumber(ergebnis.kalorienProTag, 0)} kcal</p>
            <p className="text-xs text-orange-500 mt-1">
              {formatNumber(ergebnis.fahrzeitProTagMinuten, 0)} Min. Radfahren
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <span className="text-sm text-red-600">Pro Monat</span>
            <p className="text-2xl font-bold text-red-700">{formatNumber(ergebnis.kalorienProMonat, 0)} kcal</p>
            <p className="text-xs text-red-500 mt-1">
              ≈ {formatNumber(ergebnis.fettabbauProMonat, 1)} kg Fettabbau möglich
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📊</span>
            <span className="font-medium text-gray-800">Potentieller Gewichtsverlust pro Jahr</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{formatNumber(ergebnis.fettabbauProJahr, 1)} kg</p>
          <p className="text-xs text-gray-600 mt-1">
            Bei gleichbleibender Ernährung (7.700 kcal ≈ 1 kg Körperfett)
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Das entspricht täglich:</strong>
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
              🍫 {formatNumber(ergebnis.schokoladenTafeln, 1)} Tafeln Schokolade
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
              🍺 {formatNumber(ergebnis.bierGlaeser, 1)} Gläser Bier
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
              🍕 {formatNumber(ergebnis.pizzaScheiben, 1)} Stück Pizza
            </span>
          </div>
        </div>
      </div>

      {/* CO2-Einsparung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          CO₂-Einsparung
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-sm text-emerald-600">Pro Tag vermieden</span>
            <p className="text-2xl font-bold text-emerald-700">{formatNumber(ergebnis.co2EinsparungProTag, 2)} kg</p>
            <p className="text-xs text-emerald-500 mt-1">
              Auto: {formatNumber(ergebnis.co2ProTagAuto, 2)} kg CO₂
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <span className="text-sm text-green-600">Pro Jahr vermieden</span>
            <p className="text-2xl font-bold text-green-700">{formatKg(ergebnis.co2EinsparungProJahr)}</p>
            <p className="text-xs text-green-500 mt-1">
              = {formatNumber(ergebnis.co2EinsparungProJahr / 1000, 2)} Tonnen
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-100 rounded-xl text-center">
            <span className="text-3xl mb-2 block">🌳</span>
            <p className="text-2xl font-bold text-green-700">{formatNumber(ergebnis.baeumeBinden, 1)}</p>
            <p className="text-sm text-green-600">Bäume binden so viel CO₂/Jahr</p>
          </div>
          <div className="p-4 bg-blue-100 rounded-xl text-center">
            <span className="text-3xl mb-2 block">✈️</span>
            <p className="text-2xl font-bold text-blue-700">{formatNumber(ergebnis.fluegeFrankfurtMallorca, 2)}</p>
            <p className="text-sm text-blue-600">Flüge Frankfurt–Mallorca eingespart</p>
          </div>
        </div>
      </div>

      {/* Kostenvergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">💸</span>
          Kostenvergleich: Auto vs. Fahrrad
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Zeitraum</th>
                <th className="text-center py-3 px-4 font-semibold text-orange-600">🚗 Auto</th>
                <th className="text-center py-3 px-4 font-semibold text-green-600">🚴 Fahrrad</th>
                <th className="text-center py-3 px-4 font-semibold text-emerald-600">💰 Ersparnis</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">Pro Tag</td>
                <td className="py-3 px-4 text-center font-mono text-orange-600">{formatEuro(ergebnis.autoKostenProTag)}</td>
                <td className="py-3 px-4 text-center font-mono text-green-600">~0 €</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">{formatEuro(ergebnis.ersparnisProTag)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-600">Pro Monat</td>
                <td className="py-3 px-4 text-center font-mono text-orange-600">{formatEuro(ergebnis.autoKostenProMonat)}</td>
                <td className="py-3 px-4 text-center font-mono text-green-600">{formatEuro(ergebnis.fahrradKostenProMonat)}</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">{formatEuro(ergebnis.ersparnisProMonat)}</td>
              </tr>
              <tr className="border-b border-gray-100 bg-emerald-50">
                <td className="py-3 px-4 text-gray-700 font-medium">Pro Jahr</td>
                <td className="py-3 px-4 text-center font-mono text-orange-700 font-bold">{formatEuro(ergebnis.autoKostenProJahr)}</td>
                <td className="py-3 px-4 text-center font-mono text-green-700 font-bold">{formatEuro(ergebnis.fahrradKostenProJahr)}</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700 text-lg">{formatEuro(ergebnis.ersparnisProJahr)}</td>
              </tr>
              <tr className="bg-gradient-to-r from-emerald-100 to-green-100">
                <td className="py-3 px-4 text-gray-700 font-medium">In 5 Jahren</td>
                <td className="py-3 px-4 text-center font-mono text-orange-700">{formatEuro(ergebnis.autoKostenProJahr * 5)}</td>
                <td className="py-3 px-4 text-center font-mono text-green-700">{formatEuro(ergebnis.fahrradKostenProJahr * 5)}</td>
                <td className="py-3 px-4 text-center font-mono font-bold text-emerald-800 text-xl">{formatEuro(ergebnis.ersparnis5Jahre)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <strong>💡 Hinweis:</strong> Autokosten nach ADAC Vollkostenrechnung (inkl. Wertverlust, Versicherung, Wartung, Kraftstoff). 
          Fahrradkosten: Anschaffung über 5 Jahre abgeschrieben + Wartung.
        </div>
      </div>

      {/* Gesundheitseffekte */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">❤️</span>
          Gesundheitseffekte
        </h3>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">WHO-Bewegungsempfehlung (150 Min./Woche)</span>
            <span className={`text-sm font-bold ${ergebnis.whoErfuellt >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {formatNumber(ergebnis.whoErfuellt, 0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all ${ergebnis.whoErfuellt >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
              style={{ width: `${Math.min(ergebnis.whoErfuellt, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sie erreichen {formatNumber(ergebnis.bewegungsminutenProWoche, 0)} Min. Bewegung pro Woche
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
            <span className="text-2xl mb-2 block">💓</span>
            <span className="text-sm text-pink-600">Herz-Kreislauf-Training</span>
            <p className="text-lg font-bold text-pink-700">{formatNumber(ergebnis.bewegungsminutenProTag, 0)} Min./Tag</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <span className="text-2xl mb-2 block">⏳</span>
            <span className="text-sm text-purple-600">Statistisch mehr Lebenszeit</span>
            <p className="text-lg font-bold text-purple-700">+{formatNumber(ergebnis.lebenszeitGewinn, 1)} Jahre</p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl">
          <h4 className="font-semibold text-gray-800 mb-2">✨ Positive Effekte von regelmäßigem Radfahren:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Reduziertes Risiko für Herz-Kreislauf-Erkrankungen
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Stärkung des Immunsystems
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Verbesserung der mentalen Gesundheit (weniger Stress)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Gelenkschonendes Training
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Frische Luft & Tageslicht (Vitamin D)
            </li>
          </ul>
        </div>
      </div>

      {/* Fahrzeit */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          Fahrzeiten
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-sm text-blue-600">Fahrrad pro Tag</span>
            <p className="text-2xl font-bold text-blue-700">{formatNumber(ergebnis.fahrzeitProTagMinuten, 0)} Min.</p>
            <p className="text-xs text-blue-500 mt-1">
              Bei ~{ergebnis.geschwindigkeit} km/h
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-sm text-gray-600">Auto (geschätzt)</span>
            <p className="text-2xl font-bold text-gray-700">{formatNumber(ergebnis.streckeProTag / 35 * 60, 0)} Min.</p>
            <p className="text-xs text-gray-500 mt-1">
              Bei ~35 km/h (Stadt)
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-100 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>💡 Bedenken Sie:</strong> Die Fahrtzeit mit dem Fahrrad ist oft ähnlich wie mit dem Auto – 
            Sie sparen sich Stau, Parkplatzsuche und sind flexibler. Plus: Die Bewegung ersetzt das Fitnessstudio!
          </p>
        </div>
      </div>

      {/* Was Sie mit der Ersparnis machen können */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          Was Sie mit {formatEuro(ergebnis.ersparnisProJahr)} machen können
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { emoji: '🏖️', name: 'Urlaub', preis: 1500 },
            { emoji: '📱', name: 'Neues iPhone', preis: 1200 },
            { emoji: '🎸', name: 'E-Gitarre', preis: 800 },
            { emoji: '☕', name: 'Coffee to go', preis: 4 },
            { emoji: '🍿', name: 'Kino-Besuche', preis: 15 },
            { emoji: '💎', name: 'ETF-Sparplan', preis: 100 },
          ].map((item, i) => {
            const anzahl = item.preis < 100 
              ? Math.floor(ergebnis.ersparnisProJahr / item.preis)
              : (ergebnis.ersparnisProJahr / item.preis);
            return (
              <div key={i} className="p-3 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl">{item.emoji}</span>
                <p className="text-sm font-medium text-gray-800 mt-1">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.preis < 100 
                    ? `${formatNumber(anzahl, 0)}× pro Jahr`
                    : formatNumber(anzahl, 1) >= 1 
                      ? `${formatNumber(anzahl, 1)}× leisten`
                      : `In ${formatNumber(1/anzahl, 1)} Jahren`
                  }
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tipps */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💡 Tipps fürs Fahrrad-Pendeln</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>🎒</span>
            <span><strong>Wasserdichte Packtaschen:</strong> Laptop & Kleidung bleiben trocken</span>
          </li>
          <li className="flex gap-2">
            <span>🧥</span>
            <span><strong>Wechselkleidung:</strong> Frisches Hemd/T-Shirt im Büro deponieren</span>
          </li>
          <li className="flex gap-2">
            <span>🔦</span>
            <span><strong>Gute Beleuchtung:</strong> Für dunkle Wintermonate unverzichtbar</span>
          </li>
          <li className="flex gap-2">
            <span>📱</span>
            <span><strong>Wetter-App:</strong> Morgens checken – bei Starkregen ist ÖPNV ok</span>
          </li>
          <li className="flex gap-2">
            <span>🔧</span>
            <span><strong>Regelmäßige Wartung:</strong> Bremsen, Kette, Reifendruck = sicher</span>
          </li>
          <li className="flex gap-2">
            <span>⚡</span>
            <span><strong>E-Bike überlegen:</strong> Bei längeren Strecken oder Hügeln ideal</span>
          </li>
        </ul>
      </div>
{/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Berechnungsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/autokosten/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Autokosten-Vollkostenrechnung
          </a>
          <a 
            href="https://www.who.int/news-room/fact-sheets/detail/physical-activity"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            WHO – Empfehlungen für körperliche Aktivität
          </a>
          <a 
            href="https://www.umweltbundesamt.de/themen/verkehr-laerm/emissionsdaten"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Umweltbundesamt – CO₂-Emissionen Verkehr
          </a>
          <p className="text-xs text-gray-500 mt-2">
            Kalorienberechnung basiert auf MET-Werten (Compendium of Physical Activities).
          </p>
        </div>
      </div>
    </div>
  );
}
