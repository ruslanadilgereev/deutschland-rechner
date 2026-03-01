import { useState, useMemo } from 'react';

// Kategorien mit ihren Einheiten
const KATEGORIEN = {
  laenge: {
    name: 'Länge',
    icon: '📏',
    color: 'blue',
    einheiten: [
      // Metrisch
      { id: 'mm', name: 'Millimeter', kurz: 'mm', system: 'metrisch', faktor: 0.001 },
      { id: 'cm', name: 'Zentimeter', kurz: 'cm', system: 'metrisch', faktor: 0.01 },
      { id: 'm', name: 'Meter', kurz: 'm', system: 'metrisch', faktor: 1 },
      { id: 'km', name: 'Kilometer', kurz: 'km', system: 'metrisch', faktor: 1000 },
      // Imperial
      { id: 'in', name: 'Zoll (inch)', kurz: 'in', system: 'imperial', faktor: 0.0254 },
      { id: 'ft', name: 'Fuß (feet)', kurz: 'ft', system: 'imperial', faktor: 0.3048 },
      { id: 'yd', name: 'Yard', kurz: 'yd', system: 'imperial', faktor: 0.9144 },
      { id: 'mi', name: 'Meile (mile)', kurz: 'mi', system: 'imperial', faktor: 1609.344 },
      // Sonstige
      { id: 'nm', name: 'Seemeile', kurz: 'nm', system: 'sonstige', faktor: 1852 },
    ],
  },
  gewicht: {
    name: 'Gewicht',
    icon: '⚖️',
    color: 'green',
    einheiten: [
      // Metrisch
      { id: 'mg', name: 'Milligramm', kurz: 'mg', system: 'metrisch', faktor: 0.000001 },
      { id: 'g', name: 'Gramm', kurz: 'g', system: 'metrisch', faktor: 0.001 },
      { id: 'kg', name: 'Kilogramm', kurz: 'kg', system: 'metrisch', faktor: 1 },
      { id: 't', name: 'Tonne', kurz: 't', system: 'metrisch', faktor: 1000 },
      // Imperial
      { id: 'oz', name: 'Unze (ounce)', kurz: 'oz', system: 'imperial', faktor: 0.0283495 },
      { id: 'lb', name: 'Pfund (pound)', kurz: 'lb', system: 'imperial', faktor: 0.453592 },
      { id: 'st', name: 'Stone', kurz: 'st', system: 'imperial', faktor: 6.35029 },
    ],
  },
  volumen: {
    name: 'Volumen',
    icon: '🧪',
    color: 'purple',
    einheiten: [
      // Metrisch
      { id: 'ml', name: 'Milliliter', kurz: 'ml', system: 'metrisch', faktor: 0.001 },
      { id: 'cl', name: 'Zentiliter', kurz: 'cl', system: 'metrisch', faktor: 0.01 },
      { id: 'dl', name: 'Deziliter', kurz: 'dl', system: 'metrisch', faktor: 0.1 },
      { id: 'l', name: 'Liter', kurz: 'l', system: 'metrisch', faktor: 1 },
      { id: 'm3', name: 'Kubikmeter', kurz: 'm³', system: 'metrisch', faktor: 1000 },
      // Imperial
      { id: 'floz', name: 'Fluid Ounce (US)', kurz: 'fl oz', system: 'imperial', faktor: 0.0295735 },
      { id: 'cup', name: 'Cup (US)', kurz: 'cup', system: 'imperial', faktor: 0.236588 },
      { id: 'pt', name: 'Pint (US)', kurz: 'pt', system: 'imperial', faktor: 0.473176 },
      { id: 'qt', name: 'Quart (US)', kurz: 'qt', system: 'imperial', faktor: 0.946353 },
      { id: 'gal', name: 'Gallon (US)', kurz: 'gal', system: 'imperial', faktor: 3.78541 },
    ],
  },
  temperatur: {
    name: 'Temperatur',
    icon: '🌡️',
    color: 'red',
    einheiten: [
      { id: 'c', name: 'Celsius', kurz: '°C', system: 'metrisch', faktor: 1 },
      { id: 'f', name: 'Fahrenheit', kurz: '°F', system: 'imperial', faktor: 1 },
      { id: 'k', name: 'Kelvin', kurz: 'K', system: 'wissenschaft', faktor: 1 },
    ],
  },
  flaeche: {
    name: 'Fläche',
    icon: '📐',
    color: 'yellow',
    einheiten: [
      // Metrisch
      { id: 'mm2', name: 'Quadratmillimeter', kurz: 'mm²', system: 'metrisch', faktor: 0.000001 },
      { id: 'cm2', name: 'Quadratzentimeter', kurz: 'cm²', system: 'metrisch', faktor: 0.0001 },
      { id: 'm2', name: 'Quadratmeter', kurz: 'm²', system: 'metrisch', faktor: 1 },
      { id: 'ar', name: 'Ar', kurz: 'a', system: 'metrisch', faktor: 100 },
      { id: 'ha', name: 'Hektar', kurz: 'ha', system: 'metrisch', faktor: 10000 },
      { id: 'km2', name: 'Quadratkilometer', kurz: 'km²', system: 'metrisch', faktor: 1000000 },
      // Imperial
      { id: 'sqin', name: 'Quadratzoll', kurz: 'sq in', system: 'imperial', faktor: 0.00064516 },
      { id: 'sqft', name: 'Quadratfuß', kurz: 'sq ft', system: 'imperial', faktor: 0.092903 },
      { id: 'sqyd', name: 'Quadratyard', kurz: 'sq yd', system: 'imperial', faktor: 0.836127 },
      { id: 'ac', name: 'Acre', kurz: 'ac', system: 'imperial', faktor: 4046.86 },
      { id: 'sqmi', name: 'Quadratmeile', kurz: 'sq mi', system: 'imperial', faktor: 2589988.11 },
    ],
  },
};

type KategorieKey = keyof typeof KATEGORIEN;

// Temperatur-Konvertierungsfunktionen
const convertTemperature = (value: number, from: string, to: string): number => {
  // Erst in Celsius konvertieren
  let celsius: number;
  switch (from) {
    case 'c':
      celsius = value;
      break;
    case 'f':
      celsius = (value - 32) * (5 / 9);
      break;
    case 'k':
      celsius = value - 273.15;
      break;
    default:
      celsius = value;
  }

  // Von Celsius in Zieleinheit
  switch (to) {
    case 'c':
      return celsius;
    case 'f':
      return celsius * (9 / 5) + 32;
    case 'k':
      return celsius + 273.15;
    default:
      return celsius;
  }
};

export default function EinheitenRechner() {
  const [kategorie, setKategorie] = useState<KategorieKey>('laenge');
  const [wert, setWert] = useState(1);
  const [vonEinheit, setVonEinheit] = useState('m');
  const [zuEinheit, setZuEinheit] = useState('km');

  const aktuelleKategorie = KATEGORIEN[kategorie];

  // Reset Einheiten bei Kategoriewechsel
  const handleKategorieChange = (newKat: KategorieKey) => {
    setKategorie(newKat);
    const einheiten = KATEGORIEN[newKat].einheiten;
    setVonEinheit(einheiten[0].id);
    setZuEinheit(einheiten[1]?.id || einheiten[0].id);
    setWert(1);
  };

  // Einheiten tauschen
  const tauscheEinheiten = () => {
    setVonEinheit(zuEinheit);
    setZuEinheit(vonEinheit);
  };

  // Berechnung
  const ergebnis = useMemo(() => {
    const vonEinheitObj = aktuelleKategorie.einheiten.find((e) => e.id === vonEinheit);
    const zuEinheitObj = aktuelleKategorie.einheiten.find((e) => e.id === zuEinheit);

    if (!vonEinheitObj || !zuEinheitObj) return 0;

    // Spezialfall Temperatur
    if (kategorie === 'temperatur') {
      return convertTemperature(wert, vonEinheit, zuEinheit);
    }

    // Standard-Umrechnung über Basiseinheit
    const basisWert = wert * vonEinheitObj.faktor;
    return basisWert / zuEinheitObj.faktor;
  }, [wert, vonEinheit, zuEinheit, kategorie, aktuelleKategorie]);

  // Alle Umrechnungen für die Übersicht
  const alleUmrechnungen = useMemo(() => {
    return aktuelleKategorie.einheiten.map((einheit) => {
      if (kategorie === 'temperatur') {
        return {
          ...einheit,
          wert: convertTemperature(wert, vonEinheit, einheit.id),
        };
      }
      const vonEinheitObj = aktuelleKategorie.einheiten.find((e) => e.id === vonEinheit);
      if (!vonEinheitObj) return { ...einheit, wert: 0 };
      const basisWert = wert * vonEinheitObj.faktor;
      return {
        ...einheit,
        wert: basisWert / einheit.faktor,
      };
    });
  }, [wert, vonEinheit, kategorie, aktuelleKategorie]);

  const formatNumber = (n: number) => {
    if (Math.abs(n) >= 1000000 || (Math.abs(n) < 0.0001 && n !== 0)) {
      return n.toExponential(4);
    }
    return n.toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
      blue: {
        gradient: 'from-blue-500 to-indigo-500',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-500',
      },
      green: {
        gradient: 'from-green-500 to-emerald-500',
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-500',
      },
      purple: {
        gradient: 'from-purple-500 to-fuchsia-500',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-500',
      },
      red: {
        gradient: 'from-red-500 to-orange-500',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-500',
      },
      yellow: {
        gradient: 'from-yellow-500 to-amber-500',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-500',
      },
    };
    return colors[color] || colors.blue;
  };

  const colors = getColorClasses(aktuelleKategorie.color);
  const vonEinheitObj = aktuelleKategorie.einheiten.find((e) => e.id === vonEinheit);
  const zuEinheitObj = aktuelleKategorie.einheiten.find((e) => e.id === zuEinheit);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Kategorie-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-gray-700 font-medium mb-3">Kategorie wählen</label>
        <div className="grid grid-cols-5 gap-2">
          {(Object.entries(KATEGORIEN) as [KategorieKey, (typeof KATEGORIEN)[KategorieKey]][]).map(
            ([key, kat]) => (
              <button
                key={key}
                onClick={() => handleKategorieChange(key)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  kategorie === key
                    ? `${getColorClasses(kat.color).border} ${getColorClasses(kat.color).bg} ${getColorClasses(kat.color).text}`
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{kat.icon}</div>
                <div className="text-xs font-medium truncate">{kat.name}</div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Umrechner */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Wert eingeben */}
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Wert eingeben</span>
          <div className="mt-2 flex gap-3">
            <input
              type="number"
              value={wert}
              onChange={(e) => setWert(parseFloat(e.target.value) || 0)}
              className={`flex-1 px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:${colors.border} focus:outline-none`}
              step="any"
            />
          </div>
        </label>

        {/* Von/Zu Einheiten */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
          {/* Von Einheit */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Von</label>
            <select
              value={vonEinheit}
              onChange={(e) => setVonEinheit(e.target.value)}
              className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:${colors.border} focus:outline-none font-medium bg-white`}
            >
              <optgroup label="Metrisch">
                {aktuelleKategorie.einheiten
                  .filter((e) => e.system === 'metrisch')
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.kurz})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Imperial">
                {aktuelleKategorie.einheiten
                  .filter((e) => e.system === 'imperial')
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.kurz})
                    </option>
                  ))}
              </optgroup>
              {aktuelleKategorie.einheiten.some(
                (e) => e.system !== 'metrisch' && e.system !== 'imperial'
              ) && (
                <optgroup label="Sonstige">
                  {aktuelleKategorie.einheiten
                    .filter((e) => e.system !== 'metrisch' && e.system !== 'imperial')
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.kurz})
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Tausch-Button */}
          <button
            onClick={tauscheEinheiten}
            className={`p-3 rounded-full ${colors.bg} ${colors.text} hover:scale-110 transition-transform mt-5`}
            title="Einheiten tauschen"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>

          {/* Zu Einheit */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nach</label>
            <select
              value={zuEinheit}
              onChange={(e) => setZuEinheit(e.target.value)}
              className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:${colors.border} focus:outline-none font-medium bg-white`}
            >
              <optgroup label="Metrisch">
                {aktuelleKategorie.einheiten
                  .filter((e) => e.system === 'metrisch')
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.kurz})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Imperial">
                {aktuelleKategorie.einheiten
                  .filter((e) => e.system === 'imperial')
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.kurz})
                    </option>
                  ))}
              </optgroup>
              {aktuelleKategorie.einheiten.some(
                (e) => e.system !== 'metrisch' && e.system !== 'imperial'
              ) && (
                <optgroup label="Sonstige">
                  {aktuelleKategorie.einheiten
                    .filter((e) => e.system !== 'metrisch' && e.system !== 'imperial')
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.kurz})
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div
        className={`bg-gradient-to-br ${colors.gradient} rounded-2xl shadow-lg p-6 text-white mb-6`}
      >
        <h3 className="text-sm font-medium text-white/80 mb-2">Ergebnis</h3>

        {/* Hauptergebnis */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl sm:text-5xl font-bold">{formatNumber(ergebnis)}</span>
          <span className="text-xl text-white/90">{zuEinheitObj?.kurz}</span>
        </div>

        {/* Umrechnungsformel */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-sm text-white/80 mb-1">Umrechnung</div>
          <div className="font-medium">
            {formatNumber(wert)} {vonEinheitObj?.kurz} = {formatNumber(ergebnis)}{' '}
            {zuEinheitObj?.kurz}
          </div>
        </div>
      </div>

      {/* Alle Umrechnungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">
          📊 Alle {aktuelleKategorie.name}-Einheiten
        </h3>
        <div className="space-y-2">
          {/* Metrisch */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Metrisch</h4>
            <div className="space-y-1">
              {alleUmrechnungen
                .filter((e) => e.system === 'metrisch')
                .map((einheit) => (
                  <div
                    key={einheit.id}
                    className={`flex justify-between items-center p-3 rounded-xl ${
                      einheit.id === zuEinheit ? colors.bg : 'bg-gray-50'
                    }`}
                  >
                    <span
                      className={`font-medium ${einheit.id === zuEinheit ? colors.text : 'text-gray-700'}`}
                    >
                      {einheit.name}
                    </span>
                    <span
                      className={`font-bold ${einheit.id === zuEinheit ? colors.text : 'text-gray-900'}`}
                    >
                      {formatNumber(einheit.wert)} {einheit.kurz}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Imperial */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Imperial</h4>
            <div className="space-y-1">
              {alleUmrechnungen
                .filter((e) => e.system === 'imperial')
                .map((einheit) => (
                  <div
                    key={einheit.id}
                    className={`flex justify-between items-center p-3 rounded-xl ${
                      einheit.id === zuEinheit ? colors.bg : 'bg-gray-50'
                    }`}
                  >
                    <span
                      className={`font-medium ${einheit.id === zuEinheit ? colors.text : 'text-gray-700'}`}
                    >
                      {einheit.name}
                    </span>
                    <span
                      className={`font-bold ${einheit.id === zuEinheit ? colors.text : 'text-gray-900'}`}
                    >
                      {formatNumber(einheit.wert)} {einheit.kurz}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Sonstige (falls vorhanden) */}
          {alleUmrechnungen.some(
            (e) => e.system !== 'metrisch' && e.system !== 'imperial'
          ) && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Sonstige</h4>
              <div className="space-y-1">
                {alleUmrechnungen
                  .filter((e) => e.system !== 'metrisch' && e.system !== 'imperial')
                  .map((einheit) => (
                    <div
                      key={einheit.id}
                      className={`flex justify-between items-center p-3 rounded-xl ${
                        einheit.id === zuEinheit ? colors.bg : 'bg-gray-50'
                      }`}
                    >
                      <span
                        className={`font-medium ${einheit.id === zuEinheit ? colors.text : 'text-gray-700'}`}
                      >
                        {einheit.name}
                      </span>
                      <span
                        className={`font-bold ${einheit.id === zuEinheit ? colors.text : 'text-gray-900'}`}
                      >
                        {formatNumber(einheit.wert)} {einheit.kurz}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Beliebte Umrechnungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">⚡ Beliebte Umrechnungen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {/* Länge */}
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">📏 Länge</h4>
            <ul className="space-y-1 text-blue-700">
              <li>1 Zoll = 2,54 cm</li>
              <li>1 Fuß = 30,48 cm</li>
              <li>1 Meile = 1,609 km</li>
              <li>1 Yard = 0,914 m</li>
            </ul>
          </div>

          {/* Gewicht */}
          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-2">⚖️ Gewicht</h4>
            <ul className="space-y-1 text-green-700">
              <li>1 Pfund (lb) = 453,6 g</li>
              <li>1 Unze (oz) = 28,35 g</li>
              <li>1 Stone = 6,35 kg</li>
              <li>1 kg = 2,205 lb</li>
            </ul>
          </div>

          {/* Volumen */}
          <div className="p-4 bg-purple-50 rounded-xl">
            <h4 className="font-semibold text-purple-800 mb-2">🧪 Volumen</h4>
            <ul className="space-y-1 text-purple-700">
              <li>1 Gallone (US) = 3,785 l</li>
              <li>1 Pint (US) = 0,473 l</li>
              <li>1 Cup (US) = 237 ml</li>
              <li>1 fl oz (US) = 29,6 ml</li>
            </ul>
          </div>

          {/* Temperatur */}
          <div className="p-4 bg-red-50 rounded-xl">
            <h4 className="font-semibold text-red-800 mb-2">🌡️ Temperatur</h4>
            <ul className="space-y-1 text-red-700">
              <li>0°C = 32°F = 273,15 K</li>
              <li>100°C = 212°F</li>
              <li>°F = °C × 1,8 + 32</li>
              <li>K = °C + 273,15</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Info-Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Metrisch vs. Imperial</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="font-semibold text-blue-800 mb-2">🇪🇺 Metrisches System (SI)</p>
            <p className="text-blue-700">
              Das metrische System wird in Deutschland und fast allen Ländern der Welt verwendet.
              Es basiert auf Dezimaleinheiten (10er-Potenzen) und ist daher besonders einfach
              umzurechnen.
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="font-semibold text-orange-800 mb-2">🇺🇸 Imperiales System</p>
            <p className="text-orange-700">
              Das imperiale System wird hauptsächlich in den USA, UK und wenigen anderen Ländern
              verwendet. Es basiert auf historischen Maßeinheiten wie Zoll, Fuß, Meilen, Pfund
              und Gallonen.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="font-semibold text-green-800 mb-2">💡 Wann brauche ich das?</p>
            <ul className="text-green-700 space-y-1">
              <li>• Reisen in die USA oder UK</li>
              <li>• Online-Shopping aus dem Ausland</li>
              <li>• Amerikanische Rezepte nachkochen</li>
              <li>• Technische Datenblätter (z.B. Bildschirmgrößen in Zoll)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formeln */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Umrechnungsformeln</h3>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Temperatur-Umrechnung:</p>
            <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-xs space-y-1">
              <span className="block">°F = °C × 1,8 + 32</span>
              <span className="block">°C = (°F - 32) ÷ 1,8</span>
              <span className="block">K = °C + 273,15</span>
            </code>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Allgemeine Umrechnung:</p>
            <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-xs">
              Zielwert = Ausgangswert × (Faktor_Quelle ÷ Faktor_Ziel)
            </code>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.nist.gov/pml/owm/metric-si/si-units"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            NIST – Internationales Einheitensystem (SI)
          </a>
          <a
            href="https://www.bipm.org/en/measurement-units"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BIPM – Bureau International des Poids et Mesures
          </a>
          <a
            href="https://de.wikipedia.org/wiki/Angloamerikanisches_Ma%C3%9Fsystem"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Wikipedia – Angloamerikanisches Maßsystem
          </a>
        </div>
      </div>
    </div>
  );
}
