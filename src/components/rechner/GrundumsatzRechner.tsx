import { useState, useMemo } from 'react';

// PAL-Faktoren (Physical Activity Level) nach DGE
const PAL_FAKTOREN = [
  { id: 'sedentary', name: 'Sitzend / kaum aktiv', pal: 1.2, beschreibung: 'Büroarbeit, wenig Bewegung', emoji: '🪑' },
  { id: 'light', name: 'Leicht aktiv', pal: 1.4, beschreibung: 'Überwiegend sitzend, etwas Gehen', emoji: '🚶' },
  { id: 'moderate', name: 'Mäßig aktiv', pal: 1.6, beschreibung: 'Viel Stehen/Gehen, leichte Aktivität', emoji: '🏃' },
  { id: 'active', name: 'Aktiv', pal: 1.8, beschreibung: 'Körperliche Arbeit oder regelmäßiger Sport', emoji: '💪' },
  { id: 'very-active', name: 'Sehr aktiv', pal: 2.0, beschreibung: 'Schwere körperliche Arbeit oder Leistungssport', emoji: '🏋️' },
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

// WHO/FAO/UNU Formel für Vergleich
const berechneWHO = (gewicht: number, alter: number, geschlecht: 'mann' | 'frau'): number => {
  if (geschlecht === 'mann') {
    if (alter < 30) return 15.3 * gewicht + 679;
    if (alter < 60) return 11.6 * gewicht + 879;
    return 13.5 * gewicht + 487;
  }
  if (alter < 30) return 14.7 * gewicht + 496;
  if (alter < 60) return 8.7 * gewicht + 829;
  return 10.5 * gewicht + 596;
};

export default function GrundumsatzRechner() {
  const [gewicht, setGewicht] = useState<number>(70);
  const [groesse, setGroesse] = useState<number>(170);
  const [alter, setAlter] = useState<number>(35);
  const [geschlecht, setGeschlecht] = useState<'mann' | 'frau'>('mann');
  const [aktivitaet, setAktivitaet] = useState<string>('light');
  const [berechnet, setBerechnet] = useState(false);

  const ergebnis = useMemo(() => {
    if (!gewicht || !groesse || !alter || gewicht < 30 || gewicht > 300 || groesse < 100 || groesse > 250 || alter < 18 || alter > 120) {
      return null;
    }

    // Grundumsatz nach verschiedenen Formeln
    const grundumsatzMifflin = berechneMifflinStJeor(gewicht, groesse, alter, geschlecht);
    const grundumsatzHarris = berechneHarrisBenedict(gewicht, groesse, alter, geschlecht);
    const grundumsatzWHO = berechneWHO(gewicht, alter, geschlecht);

    // Mittelwert als Orientierung
    const grundumsatzDurchschnitt = (grundumsatzMifflin + grundumsatzHarris) / 2;

    // Ausgewählter PAL-Faktor
    const selectedPal = PAL_FAKTOREN.find(p => p.id === aktivitaet)?.pal || 1.4;

    // Gesamtumsatz berechnen
    const leistungsumsatzMifflin = grundumsatzMifflin * selectedPal;
    const leistungsumsatzHarris = grundumsatzHarris * selectedPal;

    // Verschiedene Aktivitätsniveaus für Tabelle
    const aktivitaetsTabelle = PAL_FAKTOREN.map(p => ({
      ...p,
      gesamtMifflin: Math.round(grundumsatzMifflin * p.pal),
      gesamtHarris: Math.round(grundumsatzHarris * p.pal),
    }));

    // Umrechnung in kJ
    const grundumsatzKJ = grundumsatzMifflin * 4.184;
    const leistungsumsatzKJ = leistungsumsatzMifflin * 4.184;

    // Makronährstoff-Empfehlungen (grobe Richtwerte)
    const proteinBedarf = {
      min: gewicht * 0.8, // 0.8g pro kg (Minimum)
      optimal: gewicht * 1.2, // 1.2g pro kg (aktive Person)
      max: gewicht * 2.0, // 2.0g pro kg (Sportler)
    };

    // Wasserbedarf (ca. 30-35ml pro kg)
    const wasserBedarf = {
      min: (gewicht * 30) / 1000, // Liter
      optimal: (gewicht * 35) / 1000,
    };

    return {
      grundumsatzMifflin: Math.round(grundumsatzMifflin),
      grundumsatzHarris: Math.round(grundumsatzHarris),
      grundumsatzWHO: Math.round(grundumsatzWHO),
      grundumsatzDurchschnitt: Math.round(grundumsatzDurchschnitt),
      grundumsatzKJ: Math.round(grundumsatzKJ),
      leistungsumsatzMifflin: Math.round(leistungsumsatzMifflin),
      leistungsumsatzHarris: Math.round(leistungsumsatzHarris),
      leistungsumsatzKJ: Math.round(leistungsumsatzKJ),
      selectedPal,
      aktivitaetsTabelle,
      proteinBedarf,
      wasserBedarf,
    };
  }, [gewicht, groesse, alter, geschlecht, aktivitaet]);

  const formatNumber = (n: number, decimals = 0) => n.toLocaleString('de-DE', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });

  const handleBerechnen = () => {
    setBerechnet(true);
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

          {/* Alter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alter (Jahre)
            </label>
            <input
              type="number"
              value={alter}
              onChange={(e) => setAlter(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
              placeholder="z.B. 35"
              min={18}
              max={120}
            />
          </div>

          {/* Gewicht */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gewicht (kg)
            </label>
            <input
              type="number"
              value={gewicht}
              onChange={(e) => setGewicht(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
              placeholder="z.B. 70"
              min={30}
              max={300}
              step="0.1"
            />
          </div>

          {/* Größe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Körpergröße (cm)
            </label>
            <input
              type="number"
              value={groesse}
              onChange={(e) => setGroesse(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
              placeholder="z.B. 170"
              min={100}
              max={250}
            />
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
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pal.emoji}</span>
                    <div className="flex-1">
                      <div className={`font-medium ${aktivitaet === pal.id ? 'text-orange-700' : 'text-gray-700'}`}>
                        {pal.name}
                      </div>
                      <div className="text-xs text-gray-500">{pal.beschreibung}</div>
                    </div>
                    <div className={`text-sm font-mono ${aktivitaet === pal.id ? 'text-orange-600' : 'text-gray-400'}`}>
                      PAL {pal.pal}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleBerechnen}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
          >
            Grundumsatz berechnen
          </button>
        </div>
      </div>

      {/* Ergebnis */}
      {berechnet && ergebnis && (
        <>
          {/* Haupt-Ergebnis */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              Ihr Energiebedarf
            </h2>

            {/* Grundumsatz groß anzeigen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-5 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl border border-orange-200">
                <div className="text-sm text-orange-600 font-medium mb-1">Grundumsatz (BMR)</div>
                <div className="text-3xl font-bold text-orange-700">
                  {formatNumber(ergebnis.grundumsatzMifflin)} <span className="text-lg font-normal">kcal/Tag</span>
                </div>
                <div className="text-xs text-orange-500 mt-1">
                  = {formatNumber(ergebnis.grundumsatzKJ)} kJ
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Kalorienverbrauch in völliger Ruhe
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-red-100 to-red-50 rounded-xl border border-red-200">
                <div className="text-sm text-red-600 font-medium mb-1">Gesamtumsatz (TDEE)</div>
                <div className="text-3xl font-bold text-red-700">
                  {formatNumber(ergebnis.leistungsumsatzMifflin)} <span className="text-lg font-normal">kcal/Tag</span>
                </div>
                <div className="text-xs text-red-500 mt-1">
                  = {formatNumber(ergebnis.leistungsumsatzKJ)} kJ
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  inkl. Aktivität (PAL {ergebnis.selectedPal})
                </div>
              </div>
            </div>

            {/* Erklärung */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-800 text-sm">
                <strong>💡 Grundumsatz</strong> = Energie, die Ihr Körper in völliger Ruhe für lebenswichtige Funktionen (Atmung, Herzschlag, Gehirn, Stoffwechsel) benötigt.
                <br /><br />
                <strong>💡 Gesamtumsatz</strong> = Grundumsatz × PAL-Faktor. Das ist die Kalorienmenge, die Sie täglich verbrauchen.
              </p>
            </div>
          </div>

          {/* Berechnungsdetails */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Berechnungsdetails
            </h2>

            <div className="space-y-4">
              {/* Formelvergleich */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 px-2">Formel</th>
                      <th className="text-right py-2 px-2">Grundumsatz</th>
                      <th className="text-right py-2 px-2">Gesamtumsatz</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 bg-orange-50">
                      <td className="py-2 px-2">
                        <span className="font-medium">Mifflin-St Jeor (1990)</span>
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Empfohlen</span>
                      </td>
                      <td className="text-right py-2 px-2 font-mono">{formatNumber(ergebnis.grundumsatzMifflin)} kcal</td>
                      <td className="text-right py-2 px-2 font-mono font-bold text-orange-600">{formatNumber(ergebnis.leistungsumsatzMifflin)} kcal</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-2">
                        <span className="font-medium">Harris-Benedict (1984)</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Klassisch</span>
                      </td>
                      <td className="text-right py-2 px-2 font-mono">{formatNumber(ergebnis.grundumsatzHarris)} kcal</td>
                      <td className="text-right py-2 px-2 font-mono">{formatNumber(ergebnis.leistungsumsatzHarris)} kcal</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-2">
                        <span className="font-medium">WHO/FAO/UNU</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Vereinfacht</span>
                      </td>
                      <td className="text-right py-2 px-2 font-mono">{formatNumber(ergebnis.grundumsatzWHO)} kcal</td>
                      <td className="text-right py-2 px-2 font-mono">{formatNumber(Math.round(ergebnis.grundumsatzWHO * ergebnis.selectedPal))} kcal</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Formel anzeigen */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Verwendete Formel (Mifflin-St Jeor 1990):</h3>
                <div className="font-mono text-sm bg-white p-3 rounded border border-gray-200">
                  {geschlecht === 'mann' ? (
                    <>
                      <div className="text-gray-600">Grundumsatz (Mann) =</div>
                      <div className="text-orange-600 mt-1">
                        10 × {gewicht} kg + 6,25 × {groesse} cm − 5 × {alter} Jahre + 5
                      </div>
                      <div className="text-orange-600 mt-1">
                        = {10 * gewicht} + {6.25 * groesse} − {5 * alter} + 5
                      </div>
                      <div className="font-bold text-orange-700 mt-1">
                        = {formatNumber(ergebnis.grundumsatzMifflin)} kcal/Tag
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-600">Grundumsatz (Frau) =</div>
                      <div className="text-orange-600 mt-1">
                        10 × {gewicht} kg + 6,25 × {groesse} cm − 5 × {alter} Jahre − 161
                      </div>
                      <div className="text-orange-600 mt-1">
                        = {10 * gewicht} + {6.25 * groesse} − {5 * alter} − 161
                      </div>
                      <div className="font-bold text-orange-700 mt-1">
                        = {formatNumber(ergebnis.grundumsatzMifflin)} kcal/Tag
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Aktivitätsniveau-Tabelle */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Gesamtumsatz nach Aktivitätsniveau
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Aktivität</th>
                    <th className="text-center py-2 px-2">PAL</th>
                    <th className="text-right py-2 px-2">kcal/Tag</th>
                  </tr>
                </thead>
                <tbody>
                  {ergebnis.aktivitaetsTabelle.map((pal) => (
                    <tr 
                      key={pal.id} 
                      className={`border-b border-gray-100 ${pal.id === aktivitaet ? 'bg-orange-50' : ''}`}
                    >
                      <td className="py-2 px-2">
                        <span className="mr-2">{pal.emoji}</span>
                        <span className={pal.id === aktivitaet ? 'font-medium text-orange-700' : ''}>{pal.name}</span>
                      </td>
                      <td className="text-center py-2 px-2 font-mono">{pal.pal}</td>
                      <td className={`text-right py-2 px-2 font-mono ${pal.id === aktivitaet ? 'font-bold text-orange-700' : ''}`}>
                        {formatNumber(pal.gesamtMifflin)} kcal
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              PAL = Physical Activity Level (Maß für körperliche Aktivität) nach DGE/WHO
            </p>
          </div>

          {/* Empfehlungen */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Richtwerte für Ihre Ernährung
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kalorien-Ziele */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">🎯 Kalorien-Ziele</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Gewicht halten:</span>
                    <span className="font-mono font-medium">{formatNumber(ergebnis.leistungsumsatzMifflin)} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Abnehmen (~0,5 kg/Woche):</span>
                    <span className="font-mono font-medium">{formatNumber(ergebnis.leistungsumsatzMifflin - 500)} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Zunehmen (~0,5 kg/Woche):</span>
                    <span className="font-mono font-medium">{formatNumber(ergebnis.leistungsumsatzMifflin + 500)} kcal</span>
                  </div>
                </div>
              </div>

              {/* Protein-Bedarf */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">🥩 Protein-Bedarf</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Minimum (0,8 g/kg):</span>
                    <span className="font-mono font-medium">{formatNumber(ergebnis.proteinBedarf.min)} g/Tag</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Optimal aktiv (1,2 g/kg):</span>
                    <span className="font-mono font-medium">{formatNumber(ergebnis.proteinBedarf.optimal)} g/Tag</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Sportler (2,0 g/kg):</span>
                    <span className="font-mono font-medium">{formatNumber(ergebnis.proteinBedarf.max)} g/Tag</span>
                  </div>
                </div>
              </div>

              {/* Wasserbedarf */}
              <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                <h3 className="font-semibold text-cyan-800 mb-3">💧 Flüssigkeitsbedarf</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-cyan-700">Minimum (30 ml/kg):</span>
                    <span className="font-mono font-medium">{ergebnis.wasserBedarf.min.toFixed(1)} L/Tag</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-700">Empfohlen (35 ml/kg):</span>
                    <span className="font-mono font-medium">{ergebnis.wasserBedarf.optimal.toFixed(1)} L/Tag</span>
                  </div>
                </div>
                <p className="text-xs text-cyan-600 mt-2">Bei Sport, Hitze oder Krankheit mehr trinken!</p>
              </div>

              {/* Richtwerte DGE */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-3">📊 DGE-Referenzwerte</h3>
                <div className="text-sm text-purple-700">
                  <p className="mb-2">Die DGE empfiehlt für {geschlecht === 'mann' ? 'Männer' : 'Frauen'} im Alter {alter < 25 ? '19-24' : alter < 51 ? '25-50' : alter < 65 ? '51-64' : '65+'} Jahre:</p>
                  <div className="font-mono font-medium">
                    {geschlecht === 'mann' 
                      ? (alter < 25 ? '2.400-3.100' : alter < 51 ? '2.300-3.000' : alter < 65 ? '2.200-2.800' : '2.100-2.800')
                      : (alter < 25 ? '1.900-2.500' : alter < 51 ? '1.800-2.400' : alter < 65 ? '1.700-2.200' : '1.700-2.100')
                    } kcal/Tag
                  </div>
                  <p className="text-xs mt-1">(je nach PAL 1,4-1,8)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wichtige Hinweise */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Wichtige Hinweise
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-xl">📏</span>
                <p className="text-amber-800">
                  <strong>Individueller Stoffwechsel:</strong> Die Formeln liefern Schätzwerte. Der tatsächliche Grundumsatz 
                  kann je nach Muskelmasse, Hormonstatus und genetischen Faktoren um ±10-15% abweichen.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-xl">🏋️</span>
                <p className="text-blue-800">
                  <strong>Muskelmasse:</strong> Mehr Muskeln = höherer Grundumsatz. Krafttraining erhöht langfristig 
                  Ihren Kalorienverbrauch, auch in Ruhe.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-xl">⬇️</span>
                <p className="text-green-800">
                  <strong>Beim Abnehmen:</strong> Essen Sie nie weniger als Ihren Grundumsatz! Das kann den 
                  Stoffwechsel verlangsamen und ist ungesund. Ein Defizit von 300-500 kcal unter dem Gesamtumsatz ist nachhaltig.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-xl">🩺</span>
                <p className="text-purple-800">
                  <strong>Medizinische Messung:</strong> Für exakte Werte kann der Grundumsatz mittels 
                  indirekter Kalorimetrie (Atemgasanalyse) beim Arzt oder im Fitnessstudio gemessen werden.
                </p>
              </div>
            </div>
          </div>

          {/* Quellen */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Quellen
            </h2>

            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.dge.de/wissenschaft/referenzwerte/energie/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline flex items-center gap-1"
                >
                  Deutsche Gesellschaft für Ernährung (DGE) – Referenzwerte Energie
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://pubmed.ncbi.nlm.nih.gov/2305711/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline flex items-center gap-1"
                >
                  Mifflin MD et al. (1990): A new predictive equation for resting energy expenditure
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.verbraucherzentrale.de/wissen/lebensmittel/gesund-ernaehren/ernaehrung-umsatz-kalorien-wie-viel-energie-benoetigt-der-koerper-102519" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline flex items-center gap-1"
                >
                  Verbraucherzentrale – Energiebedarf des Körpers
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
                  className="text-orange-600 hover:underline flex items-center gap-1"
                >
                  WHO/FAO/UNU – Human Energy Requirements (2004)
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
