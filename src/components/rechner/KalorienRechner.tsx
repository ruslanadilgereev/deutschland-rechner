import { useState, useMemo } from 'react';

// PAL-Faktoren (Physical Activity Level) nach DGE
const PAL_FAKTOREN = [
  { id: 'sedentary', name: 'Sitzend / kaum aktiv', pal: 1.2, beschreibung: 'Büroarbeit, wenig Bewegung', emoji: '🪑' },
  { id: 'light', name: 'Leicht aktiv', pal: 1.375, beschreibung: 'Leichte Bewegung 1-3x/Woche', emoji: '🚶' },
  { id: 'moderate', name: 'Mäßig aktiv', pal: 1.55, beschreibung: 'Sport 3-5x/Woche', emoji: '🏃' },
  { id: 'active', name: 'Aktiv', pal: 1.725, beschreibung: 'Intensiver Sport 6-7x/Woche', emoji: '💪' },
  { id: 'very-active', name: 'Sehr aktiv', pal: 1.9, beschreibung: 'Sehr intensives Training / körperliche Arbeit', emoji: '🏋️' },
];

// Mifflin-St Jeor Formel (1990) - wissenschaftlich empfohlen
const berechneMifflinStJeor = (gewicht: number, groesse: number, alter: number, geschlecht: 'mann' | 'frau'): number => {
  if (geschlecht === 'mann') {
    return 10 * gewicht + 6.25 * groesse - 5 * alter + 5;
  }
  return 10 * gewicht + 6.25 * groesse - 5 * alter - 161;
};

// Harris-Benedict Formel (Revised 1984) - klassische Formel
const berechneHarrisBenedict = (gewicht: number, groesse: number, alter: number, geschlecht: 'mann' | 'frau'): number => {
  if (geschlecht === 'mann') {
    return 88.362 + 13.397 * gewicht + 4.799 * groesse - 5.677 * alter;
  }
  return 447.593 + 9.247 * gewicht + 3.098 * groesse - 4.330 * alter;
};

// Katch-McArdle Formel (mit Körperfettanteil) - Bonus
const berechneKatchMcArdle = (gewicht: number, koerperfett: number): number => {
  const magermasse = gewicht * (1 - koerperfett / 100);
  return 370 + 21.6 * magermasse;
};

export default function KalorienRechner() {
  const [gewicht, setGewicht] = useState<number>(70);
  const [groesse, setGroesse] = useState<number>(170);
  const [alter, setAlter] = useState<number>(35);
  const [geschlecht, setGeschlecht] = useState<'mann' | 'frau'>('mann');
  const [aktivitaet, setAktivitaet] = useState<string>('light');
  const [ziel, setZiel] = useState<'abnehmen' | 'halten' | 'zunehmen'>('halten');
  const [koerperfett, setKoerperfett] = useState<number | null>(null);
  const [berechnet, setBerechnet] = useState(false);

  const ergebnis = useMemo(() => {
    if (!gewicht || !groesse || !alter || gewicht < 30 || gewicht > 300 || groesse < 100 || groesse > 250 || alter < 15 || alter > 100) {
      return null;
    }

    // Grundumsatz nach verschiedenen Formeln
    const bmrMifflin = berechneMifflinStJeor(gewicht, groesse, alter, geschlecht);
    const bmrHarris = berechneHarrisBenedict(gewicht, groesse, alter, geschlecht);
    const bmrKatchMcArdle = koerperfett && koerperfett > 0 && koerperfett < 60 
      ? berechneKatchMcArdle(gewicht, koerperfett)
      : null;

    // Durchschnitt als Hauptwert
    const bmrDurchschnitt = bmrKatchMcArdle 
      ? (bmrMifflin + bmrHarris + bmrKatchMcArdle) / 3
      : (bmrMifflin + bmrHarris) / 2;

    // PAL-Faktor
    const selectedPal = PAL_FAKTOREN.find(p => p.id === aktivitaet)?.pal || 1.375;

    // Gesamtumsatz (TDEE)
    const tdee = bmrDurchschnitt * selectedPal;
    const tdeeMifflin = bmrMifflin * selectedPal;
    const tdeeHarris = bmrHarris * selectedPal;
    const tdeeKatchMcArdle = bmrKatchMcArdle ? bmrKatchMcArdle * selectedPal : null;

    // Kaloriendefizit/-überschuss Empfehlungen
    const kalorienZiele = {
      starkAbnehmen: Math.max(bmrDurchschnitt, tdee - 750), // Max 750 kcal Defizit, nie unter BMR
      abnehmen: Math.max(bmrDurchschnitt, tdee - 500), // 500 kcal Defizit = ~0.5kg/Woche
      leichtAbnehmen: Math.max(bmrDurchschnitt, tdee - 250), // 250 kcal Defizit
      halten: tdee,
      leichtZunehmen: tdee + 250, // 250 kcal Überschuss
      zunehmen: tdee + 500, // 500 kcal Überschuss = ~0.5kg/Woche
    };

    // Makronährstoff-Empfehlungen basierend auf Ziel
    const makroEmpfehlungen = {
      abnehmen: {
        protein: { min: gewicht * 1.6, max: gewicht * 2.2 }, // Mehr Protein beim Abnehmen
        fett: { min: gewicht * 0.8, max: gewicht * 1.2 },
        kohlenhydrate: 'Restliche Kalorien',
      },
      halten: {
        protein: { min: gewicht * 1.2, max: gewicht * 1.6 },
        fett: { min: gewicht * 0.8, max: gewicht * 1.2 },
        kohlenhydrate: 'Restliche Kalorien',
      },
      zunehmen: {
        protein: { min: gewicht * 1.4, max: gewicht * 2.0 },
        fett: { min: gewicht * 0.8, max: gewicht * 1.2 },
        kohlenhydrate: 'Restliche Kalorien',
      },
    };

    // Aktivitätsniveau-Tabelle
    const aktivitaetsTabelle = PAL_FAKTOREN.map(p => ({
      ...p,
      tdee: Math.round(bmrDurchschnitt * p.pal),
    }));

    // Gewichtsprognose
    const wochenPrognose = {
      defizit500: -0.5, // kg pro Woche bei 500kcal Defizit
      defizit250: -0.25,
      ueberschuss500: 0.5,
      ueberschuss250: 0.25,
    };

    // Umrechnung in kJ
    const bmrKJ = bmrDurchschnitt * 4.184;
    const tdeeKJ = tdee * 4.184;

    return {
      bmrMifflin: Math.round(bmrMifflin),
      bmrHarris: Math.round(bmrHarris),
      bmrKatchMcArdle: bmrKatchMcArdle ? Math.round(bmrKatchMcArdle) : null,
      bmrDurchschnitt: Math.round(bmrDurchschnitt),
      bmrKJ: Math.round(bmrKJ),
      tdee: Math.round(tdee),
      tdeeMifflin: Math.round(tdeeMifflin),
      tdeeHarris: Math.round(tdeeHarris),
      tdeeKatchMcArdle: tdeeKatchMcArdle ? Math.round(tdeeKatchMcArdle) : null,
      tdeeKJ: Math.round(tdeeKJ),
      selectedPal,
      kalorienZiele: {
        starkAbnehmen: Math.round(kalorienZiele.starkAbnehmen),
        abnehmen: Math.round(kalorienZiele.abnehmen),
        leichtAbnehmen: Math.round(kalorienZiele.leichtAbnehmen),
        halten: Math.round(kalorienZiele.halten),
        leichtZunehmen: Math.round(kalorienZiele.leichtZunehmen),
        zunehmen: Math.round(kalorienZiele.zunehmen),
      },
      makroEmpfehlungen: makroEmpfehlungen[ziel],
      aktivitaetsTabelle,
      wochenPrognose,
    };
  }, [gewicht, groesse, alter, geschlecht, aktivitaet, ziel, koerperfett]);

  const formatNumber = (n: number, decimals = 0) => n.toLocaleString('de-DE', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  const getZielKalorien = () => {
    if (!ergebnis) return 0;
    switch (ziel) {
      case 'abnehmen': return ergebnis.kalorienZiele.abnehmen;
      case 'zunehmen': return ergebnis.kalorienZiele.zunehmen;
      default: return ergebnis.kalorienZiele.halten;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Ihre Daten eingeben
        </h2>

        <div className="space-y-6">
          {/* Geschlecht */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geschlecht
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setGeschlecht('mann')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  geschlecht === 'mann'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mr-2">👨</span>
                Mann
              </button>
              <button
                onClick={() => setGeschlecht('frau')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  geschlecht === 'frau'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mr-2">👩</span>
                Frau
              </button>
            </div>
          </div>

          {/* Alter, Gewicht, Größe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alter (Jahre)
              </label>
              <input
                type="number"
                value={alter}
                onChange={(e) => setAlter(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="z.B. 35"
                min={15}
                max={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gewicht (kg)
              </label>
              <input
                type="number"
                value={gewicht}
                onChange={(e) => setGewicht(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="z.B. 70"
                min={30}
                max={300}
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Größe (cm)
              </label>
              <input
                type="number"
                value={groesse}
                onChange={(e) => setGroesse(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="z.B. 170"
                min={100}
                max={250}
              />
            </div>
          </div>

          {/* Körperfettanteil (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Körperfettanteil (optional, für genauere Berechnung)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={koerperfett || ''}
                onChange={(e) => setKoerperfett(e.target.value ? Number(e.target.value) : null)}
                className="w-32 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="z.B. 20"
                min={3}
                max={60}
                step="0.1"
              />
              <span className="text-gray-600">%</span>
              <span className="text-xs text-gray-500">(ermöglicht Katch-McArdle Formel)</span>
            </div>
          </div>

          {/* Aktivitätsniveau */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aktivitätsniveau
            </label>
            <div className="space-y-2">
              {PAL_FAKTOREN.map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => setAktivitaet(pal.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    aktivitaet === pal.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pal.emoji}</span>
                    <div className="flex-1">
                      <div className={`font-medium ${aktivitaet === pal.id ? 'text-green-700' : 'text-gray-700'}`}>
                        {pal.name}
                      </div>
                      <div className="text-xs text-gray-500">{pal.beschreibung}</div>
                    </div>
                    <div className={`text-sm font-mono ${aktivitaet === pal.id ? 'text-green-600' : 'text-gray-400'}`}>
                      ×{pal.pal}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ziel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ihr Ziel
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setZiel('abnehmen')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  ziel === 'abnehmen'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">📉</span>
                <span className="font-medium">Abnehmen</span>
              </button>
              <button
                onClick={() => setZiel('halten')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  ziel === 'halten'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">⚖️</span>
                <span className="font-medium">Halten</span>
              </button>
              <button
                onClick={() => setZiel('zunehmen')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  ziel === 'zunehmen'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl block mb-1">📈</span>
                <span className="font-medium">Zunehmen</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleBerechnen}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
          >
            🔥 Kalorienbedarf berechnen
          </button>
        </div>
      </div>

      {/* Ergebnis */}
      {berechnet && ergebnis && (
        <>
          {/* Haupt-Ergebnis */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Ihr täglicher Kalorienbedarf
            </h2>

            {/* Ziel-Kalorien groß anzeigen */}
            <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-50 rounded-xl border border-green-200 mb-6 text-center">
              <div className="text-sm text-green-600 font-medium mb-1">
                Empfohlene Kalorien für Ihr Ziel ({ziel === 'abnehmen' ? 'Abnehmen' : ziel === 'zunehmen' ? 'Zunehmen' : 'Gewicht halten'})
              </div>
              <div className="text-5xl font-bold text-green-700 mb-2">
                {formatNumber(getZielKalorien())}
                <span className="text-2xl font-normal ml-2">kcal/Tag</span>
              </div>
              <div className="text-sm text-green-600">
                = {formatNumber(getZielKalorien() * 4.184)} kJ
              </div>
              {ziel === 'abnehmen' && (
                <div className="mt-3 text-sm text-green-700 bg-green-200/50 rounded-lg py-2 px-4 inline-block">
                  ➜ Erwartete Gewichtsabnahme: ~0,5 kg/Woche
                </div>
              )}
              {ziel === 'zunehmen' && (
                <div className="mt-3 text-sm text-green-700 bg-green-200/50 rounded-lg py-2 px-4 inline-block">
                  ➜ Erwartete Gewichtszunahme: ~0,5 kg/Woche
                </div>
              )}
            </div>

            {/* BMR & TDEE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="text-sm text-orange-600 font-medium mb-1">Grundumsatz (BMR)</div>
                <div className="text-2xl font-bold text-orange-700">
                  {formatNumber(ergebnis.bmrDurchschnitt)} <span className="text-sm font-normal">kcal/Tag</span>
                </div>
                <div className="text-xs text-orange-500 mt-1">
                  Kalorienverbrauch in völliger Ruhe
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="text-sm text-red-600 font-medium mb-1">Gesamtumsatz (TDEE)</div>
                <div className="text-2xl font-bold text-red-700">
                  {formatNumber(ergebnis.tdee)} <span className="text-sm font-normal">kcal/Tag</span>
                </div>
                <div className="text-xs text-red-500 mt-1">
                  inkl. Aktivität (PAL ×{ergebnis.selectedPal})
                </div>
              </div>
            </div>

            {/* Kalorien-Ziele Übersicht */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3">📊 Alle Kalorien-Ziele im Überblick</h3>
              <div className="space-y-2">
                <div className={`flex justify-between items-center p-2 rounded ${ziel === 'abnehmen' ? 'bg-red-100' : ''}`}>
                  <span className="text-gray-700">Stark abnehmen (~0,75 kg/Woche)</span>
                  <span className="font-mono font-bold text-red-600">{formatNumber(ergebnis.kalorienZiele.starkAbnehmen)} kcal</span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded ${ziel === 'abnehmen' ? 'bg-red-100' : ''}`}>
                  <span className="text-gray-700">Abnehmen (~0,5 kg/Woche)</span>
                  <span className="font-mono font-bold text-red-600">{formatNumber(ergebnis.kalorienZiele.abnehmen)} kcal</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded">
                  <span className="text-gray-700">Leicht abnehmen (~0,25 kg/Woche)</span>
                  <span className="font-mono font-medium text-orange-600">{formatNumber(ergebnis.kalorienZiele.leichtAbnehmen)} kcal</span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded ${ziel === 'halten' ? 'bg-blue-100' : ''}`}>
                  <span className="text-gray-700">Gewicht halten</span>
                  <span className="font-mono font-bold text-blue-600">{formatNumber(ergebnis.kalorienZiele.halten)} kcal</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded">
                  <span className="text-gray-700">Leicht zunehmen (~0,25 kg/Woche)</span>
                  <span className="font-mono font-medium text-green-600">{formatNumber(ergebnis.kalorienZiele.leichtZunehmen)} kcal</span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded ${ziel === 'zunehmen' ? 'bg-green-100' : ''}`}>
                  <span className="text-gray-700">Zunehmen (~0,5 kg/Woche)</span>
                  <span className="font-mono font-bold text-green-600">{formatNumber(ergebnis.kalorienZiele.zunehmen)} kcal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Makronährstoff-Empfehlungen */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🥗</span>
              Makronährstoff-Empfehlungen
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🥩</span>
                  <span className="font-semibold text-red-800">Protein</span>
                </div>
                <div className="text-xl font-bold text-red-700">
                  {formatNumber(ergebnis.makroEmpfehlungen.protein.min)} - {formatNumber(ergebnis.makroEmpfehlungen.protein.max)} g
                </div>
                <div className="text-xs text-red-600 mt-1">
                  {formatNumber(ergebnis.makroEmpfehlungen.protein.min * 4)} - {formatNumber(ergebnis.makroEmpfehlungen.protein.max * 4)} kcal
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {(ergebnis.makroEmpfehlungen.protein.min / gewicht).toFixed(1)} - {(ergebnis.makroEmpfehlungen.protein.max / gewicht).toFixed(1)} g/kg Körpergewicht
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🥑</span>
                  <span className="font-semibold text-yellow-800">Fett</span>
                </div>
                <div className="text-xl font-bold text-yellow-700">
                  {formatNumber(ergebnis.makroEmpfehlungen.fett.min)} - {formatNumber(ergebnis.makroEmpfehlungen.fett.max)} g
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  {formatNumber(ergebnis.makroEmpfehlungen.fett.min * 9)} - {formatNumber(ergebnis.makroEmpfehlungen.fett.max * 9)} kcal
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {(ergebnis.makroEmpfehlungen.fett.min / gewicht).toFixed(1)} - {(ergebnis.makroEmpfehlungen.fett.max / gewicht).toFixed(1)} g/kg Körpergewicht
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🍞</span>
                  <span className="font-semibold text-blue-800">Kohlenhydrate</span>
                </div>
                <div className="text-xl font-bold text-blue-700">
                  Flexibel
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Restliche Kalorien
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Nach Protein & Fett aufteilen
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <strong>💡 Hinweis:</strong> Protein ist besonders wichtig beim {ziel === 'abnehmen' ? 'Abnehmen, um Muskelmasse zu erhalten' : ziel === 'zunehmen' ? 'Muskelaufbau' : 'Erhalt der Körperzusammensetzung'}. Die genaue Kohlenhydrat-Menge hängt von Ihren persönlichen Vorlieben und Ihrer Aktivität ab.
            </div>
          </div>

          {/* Formelvergleich */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Berechnungsdetails
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Formel</th>
                    <th className="text-right py-2 px-2">BMR (Grundumsatz)</th>
                    <th className="text-right py-2 px-2">TDEE (Gesamtumsatz)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-green-50">
                    <td className="py-2 px-2">
                      <span className="font-medium">Mifflin-St Jeor (1990)</span>
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Empfohlen</span>
                    </td>
                    <td className="text-right py-2 px-2 font-mono">{formatNumber(ergebnis.bmrMifflin)} kcal</td>
                    <td className="text-right py-2 px-2 font-mono font-bold text-green-600">{formatNumber(ergebnis.tdeeMifflin)} kcal</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2">
                      <span className="font-medium">Harris-Benedict (1984)</span>
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Klassisch</span>
                    </td>
                    <td className="text-right py-2 px-2 font-mono">{formatNumber(ergebnis.bmrHarris)} kcal</td>
                    <td className="text-right py-2 px-2 font-mono">{formatNumber(ergebnis.tdeeHarris)} kcal</td>
                  </tr>
                  {ergebnis.bmrKatchMcArdle && (
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-2">
                        <span className="font-medium">Katch-McArdle</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Mit KFA</span>
                      </td>
                      <td className="text-right py-2 px-2 font-mono">{formatNumber(ergebnis.bmrKatchMcArdle)} kcal</td>
                      <td className="text-right py-2 px-2 font-mono">{formatNumber(ergebnis.tdeeKatchMcArdle!)} kcal</td>
                    </tr>
                  )}
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-2 px-2">Durchschnitt (verwendet)</td>
                    <td className="text-right py-2 px-2 font-mono text-orange-600">{formatNumber(ergebnis.bmrDurchschnitt)} kcal</td>
                    <td className="text-right py-2 px-2 font-mono text-red-600">{formatNumber(ergebnis.tdee)} kcal</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Formel anzeigen */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Verwendete Formeln:</h3>
              <div className="space-y-3 font-mono text-xs bg-white p-3 rounded border border-gray-200">
                <div>
                  <div className="text-gray-600 font-sans font-medium">Mifflin-St Jeor ({geschlecht === 'mann' ? 'Mann' : 'Frau'}):</div>
                  <div className="text-green-600">
                    {geschlecht === 'mann' 
                      ? `BMR = 10 × ${gewicht} + 6.25 × ${groesse} - 5 × ${alter} + 5 = ${ergebnis.bmrMifflin} kcal`
                      : `BMR = 10 × ${gewicht} + 6.25 × ${groesse} - 5 × ${alter} - 161 = ${ergebnis.bmrMifflin} kcal`
                    }
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 font-sans font-medium">Harris-Benedict ({geschlecht === 'mann' ? 'Mann' : 'Frau'}):</div>
                  <div className="text-blue-600">
                    {geschlecht === 'mann'
                      ? `BMR = 88.362 + 13.397 × ${gewicht} + 4.799 × ${groesse} - 5.677 × ${alter} = ${ergebnis.bmrHarris} kcal`
                      : `BMR = 447.593 + 9.247 × ${gewicht} + 3.098 × ${groesse} - 4.330 × ${alter} = ${ergebnis.bmrHarris} kcal`
                    }
                  </div>
                </div>
                {ergebnis.bmrKatchMcArdle && koerperfett && (
                  <div>
                    <div className="text-gray-600 font-sans font-medium">Katch-McArdle (mit KFA {koerperfett}%):</div>
                    <div className="text-purple-600">
                      BMR = 370 + 21.6 × {formatNumber(gewicht * (1 - koerperfett/100), 1)} (Magermasse) = {ergebnis.bmrKatchMcArdle} kcal
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-gray-600 font-sans font-medium">TDEE-Berechnung:</div>
                  <div className="text-red-600">
                    TDEE = BMR × PAL = {ergebnis.bmrDurchschnitt} × {ergebnis.selectedPal} = {ergebnis.tdee} kcal
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aktivitätsniveau-Tabelle */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏃</span>
              TDEE nach Aktivitätsniveau
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Aktivität</th>
                    <th className="text-center py-2 px-2">Faktor</th>
                    <th className="text-right py-2 px-2">TDEE</th>
                  </tr>
                </thead>
                <tbody>
                  {ergebnis.aktivitaetsTabelle.map((pal) => (
                    <tr 
                      key={pal.id} 
                      className={`border-b border-gray-100 ${pal.id === aktivitaet ? 'bg-green-50' : ''}`}
                    >
                      <td className="py-2 px-2">
                        <span className="mr-2">{pal.emoji}</span>
                        <span className={pal.id === aktivitaet ? 'font-medium text-green-700' : ''}>{pal.name}</span>
                      </td>
                      <td className="text-center py-2 px-2 font-mono">×{pal.pal}</td>
                      <td className={`text-right py-2 px-2 font-mono ${pal.id === aktivitaet ? 'font-bold text-green-700' : ''}`}>
                        {formatNumber(pal.tdee)} kcal
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gewichtsprognose */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📆</span>
              Gewichtsprognose
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="text-xs text-gray-500 mb-1">In 4 Wochen</div>
                <div className="text-lg font-bold text-gray-800">
                  {ziel === 'abnehmen' ? (gewicht - 2).toFixed(1) : ziel === 'zunehmen' ? (gewicht + 2).toFixed(1) : gewicht.toFixed(1)} kg
                </div>
                <div className={`text-xs ${ziel === 'abnehmen' ? 'text-red-500' : ziel === 'zunehmen' ? 'text-green-500' : 'text-gray-400'}`}>
                  {ziel === 'abnehmen' ? '-2 kg' : ziel === 'zunehmen' ? '+2 kg' : '±0 kg'}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="text-xs text-gray-500 mb-1">In 8 Wochen</div>
                <div className="text-lg font-bold text-gray-800">
                  {ziel === 'abnehmen' ? (gewicht - 4).toFixed(1) : ziel === 'zunehmen' ? (gewicht + 4).toFixed(1) : gewicht.toFixed(1)} kg
                </div>
                <div className={`text-xs ${ziel === 'abnehmen' ? 'text-red-500' : ziel === 'zunehmen' ? 'text-green-500' : 'text-gray-400'}`}>
                  {ziel === 'abnehmen' ? '-4 kg' : ziel === 'zunehmen' ? '+4 kg' : '±0 kg'}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="text-xs text-gray-500 mb-1">In 12 Wochen</div>
                <div className="text-lg font-bold text-gray-800">
                  {ziel === 'abnehmen' ? (gewicht - 6).toFixed(1) : ziel === 'zunehmen' ? (gewicht + 6).toFixed(1) : gewicht.toFixed(1)} kg
                </div>
                <div className={`text-xs ${ziel === 'abnehmen' ? 'text-red-500' : ziel === 'zunehmen' ? 'text-green-500' : 'text-gray-400'}`}>
                  {ziel === 'abnehmen' ? '-6 kg' : ziel === 'zunehmen' ? '+6 kg' : '±0 kg'}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="text-xs text-gray-500 mb-1">In 6 Monaten</div>
                <div className="text-lg font-bold text-gray-800">
                  {ziel === 'abnehmen' ? (gewicht - 13).toFixed(1) : ziel === 'zunehmen' ? (gewicht + 13).toFixed(1) : gewicht.toFixed(1)} kg
                </div>
                <div className={`text-xs ${ziel === 'abnehmen' ? 'text-red-500' : ziel === 'zunehmen' ? 'text-green-500' : 'text-gray-400'}`}>
                  {ziel === 'abnehmen' ? '-13 kg' : ziel === 'zunehmen' ? '+13 kg' : '±0 kg'}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Basierend auf ~0,5 kg/Woche bei {ziel === 'abnehmen' ? '500 kcal Defizit' : ziel === 'zunehmen' ? '500 kcal Überschuss' : 'ausgeglichener Kalorienbilanz'}. Individuelle Ergebnisse können variieren.
            </p>
          </div>

          {/* Wichtige Hinweise */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Wichtige Hinweise
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-xl">🚫</span>
                <p className="text-red-800">
                  <strong>Nie unter Grundumsatz essen!</strong> Unter {formatNumber(ergebnis.bmrDurchschnitt)} kcal riskieren Sie 
                  Nährstoffmangel, Muskelabbau und Stoffwechselanpassung. Nachhaltig sind 300-500 kcal unter TDEE.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-xl">📏</span>
                <p className="text-blue-800">
                  <strong>Individuelle Unterschiede:</strong> Der tatsächliche Kalorienbedarf kann um ±10-15% abweichen. 
                  Beobachten Sie Ihr Gewicht über 2-4 Wochen und passen Sie entsprechend an.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-xl">🏋️</span>
                <p className="text-green-800">
                  <strong>Krafttraining ist wichtig:</strong> Besonders beim Abnehmen sollten Sie Krafttraining betreiben, 
                  um Muskelmasse zu erhalten. Muskeln verbrennen auch in Ruhe mehr Kalorien.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-xl">🥩</span>
                <p className="text-yellow-800">
                  <strong>Protein priorisieren:</strong> Ausreichend Protein (1,6-2,2g/kg beim Abnehmen) hilft, 
                  Muskelmasse zu erhalten und sättigt besser als Kohlenhydrate oder Fett.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-xl">📊</span>
                <p className="text-purple-800">
                  <strong>Tracking empfohlen:</strong> Führen Sie anfangs ein Ernährungstagebuch, um ein Gefühl für 
                  Portionsgrößen zu entwickeln. Apps wie MyFitnessPal oder Yazio können helfen.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">❓</span>
              Häufige Fragen
            </h2>

            <div className="space-y-4">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="font-medium text-gray-800">Was ist der Unterschied zwischen BMR und TDEE?</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 p-3 text-gray-600 text-sm">
                  <strong>BMR (Basal Metabolic Rate)</strong> ist der Grundumsatz – die Kalorien, die Ihr Körper in völliger Ruhe verbrennt 
                  (Atmung, Herzschlag, Gehirnfunktion). <strong>TDEE (Total Daily Energy Expenditure)</strong> ist der Gesamtumsatz, 
                  der zusätzlich Ihre tägliche Aktivität berücksichtigt. TDEE = BMR × Aktivitätsfaktor.
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="font-medium text-gray-800">Welche Formel ist am genauesten?</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 p-3 text-gray-600 text-sm">
                  Die <strong>Mifflin-St Jeor</strong> Formel gilt als die genaueste für die meisten Menschen (±10% Genauigkeit). 
                  Wenn Sie Ihren Körperfettanteil kennen, ist die <strong>Katch-McArdle</strong> Formel noch präziser, 
                  da sie die fettfreie Masse berücksichtigt.
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="font-medium text-gray-800">Wie schnell sollte ich abnehmen?</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 p-3 text-gray-600 text-sm">
                  0,5-1% des Körpergewichts pro Woche ist gesund und nachhaltig. Bei 70 kg wären das 350-700g pro Woche. 
                  Schnelleres Abnehmen führt oft zu Muskelabbau und Jojo-Effekt. Ein Kaloriendefizit von 300-500 kcal 
                  pro Tag ist für die meisten Menschen ideal.
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="font-medium text-gray-800">Muss ich jeden Tag exakt diese Kalorien essen?</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 p-3 text-gray-600 text-sm">
                  Nein! Was zählt ist der Wochendurchschnitt. An trainingsintensiven Tagen können Sie mehr essen, 
                  an Ruhetagen weniger. Wichtig ist die Gesamtbilanz über 7 Tage. Flexibilität macht eine Ernährungsumstellung 
                  nachhaltiger.
                </div>
              </details>
            </div>
          </div>

          {/* Quellen */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Wissenschaftliche Quellen
            </h2>

            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://pubmed.ncbi.nlm.nih.gov/2305711/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline flex items-center gap-1"
                >
                  Mifflin MD et al. (1990): A new predictive equation for resting energy expenditure
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://pubmed.ncbi.nlm.nih.gov/6741850/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline flex items-center gap-1"
                >
                  Roza AM, Shizgal HM (1984): The Harris Benedict equation reevaluated
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.dge.de/wissenschaft/referenzwerte/energie/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline flex items-center gap-1"
                >
                  Deutsche Gesellschaft für Ernährung (DGE) – Referenzwerte Energie
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.who.int/publications/i/item/9789241210232" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline flex items-center gap-1"
                >
                  WHO/FAO/UNU – Human Energy Requirements (2004)
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://examine.com/guides/protein-intake/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline flex items-center gap-1"
                >
                  Examine.com – How much protein do you need per day?
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
