import { useState, useMemo } from 'react';

// BMI-Kategorien nach WHO
const BMI_KATEGORIEN = [
  { min: 0, max: 16, kategorie: 'Starkes Untergewicht', farbe: 'bg-red-500', textFarbe: 'text-red-700', hinweis: 'Bitte suchen Sie ärztliche Hilfe auf.' },
  { min: 16, max: 17, kategorie: 'Mäßiges Untergewicht', farbe: 'bg-orange-400', textFarbe: 'text-orange-700', hinweis: 'Eine ärztliche Abklärung wird empfohlen.' },
  { min: 17, max: 18.5, kategorie: 'Leichtes Untergewicht', farbe: 'bg-yellow-400', textFarbe: 'text-yellow-700', hinweis: 'Leicht untergewichtig – behalten Sie Ihr Gewicht im Auge.' },
  { min: 18.5, max: 25, kategorie: 'Normalgewicht', farbe: 'bg-green-500', textFarbe: 'text-green-700', hinweis: 'Ihr Gewicht liegt im optimalen Bereich. Weiter so!' },
  { min: 25, max: 30, kategorie: 'Übergewicht (Präadipositas)', farbe: 'bg-yellow-500', textFarbe: 'text-yellow-700', hinweis: 'Leicht erhöhtes Gesundheitsrisiko. Achten Sie auf Ernährung und Bewegung.' },
  { min: 30, max: 35, kategorie: 'Adipositas Grad I', farbe: 'bg-orange-500', textFarbe: 'text-orange-700', hinweis: 'Erhöhtes Gesundheitsrisiko. Eine Gewichtsreduktion wird empfohlen.' },
  { min: 35, max: 40, kategorie: 'Adipositas Grad II', farbe: 'bg-red-400', textFarbe: 'text-red-700', hinweis: 'Hohes Gesundheitsrisiko. Bitte suchen Sie ärztliche Beratung.' },
  { min: 40, max: 100, kategorie: 'Adipositas Grad III', farbe: 'bg-red-600', textFarbe: 'text-red-700', hinweis: 'Sehr hohes Gesundheitsrisiko. Ärztliche Behandlung dringend empfohlen.' },
];

// Altersangepasste BMI-Empfehlungen (nach NRC)
const ALTERS_BMI = [
  { minAlter: 19, maxAlter: 24, optimalMin: 19, optimalMax: 24 },
  { minAlter: 25, maxAlter: 34, optimalMin: 20, optimalMax: 25 },
  { minAlter: 35, maxAlter: 44, optimalMin: 21, optimalMax: 26 },
  { minAlter: 45, maxAlter: 54, optimalMin: 22, optimalMax: 27 },
  { minAlter: 55, maxAlter: 64, optimalMin: 23, optimalMax: 28 },
  { minAlter: 65, maxAlter: 120, optimalMin: 24, optimalMax: 29 },
];

export default function BMIRechner() {
  const [gewicht, setGewicht] = useState<number>(75);
  const [groesse, setGroesse] = useState<number>(175);
  const [alter, setAlter] = useState<number>(35);
  const [geschlecht, setGeschlecht] = useState<'mann' | 'frau'>('mann');
  const [berechnet, setBerechnet] = useState(false);

  const ergebnis = useMemo(() => {
    if (!gewicht || !groesse || groesse < 100 || groesse > 250 || gewicht < 30 || gewicht > 300) {
      return null;
    }

    const groesseM = groesse / 100;
    const bmi = gewicht / (groesseM * groesseM);
    
    // Kategorie finden
    const kategorie = BMI_KATEGORIEN.find(k => bmi >= k.min && bmi < k.max) || BMI_KATEGORIEN[BMI_KATEGORIEN.length - 1];
    
    // Altersangepasster Optimalbereich
    const altersBereich = ALTERS_BMI.find(a => alter >= a.minAlter && alter <= a.maxAlter) || ALTERS_BMI[0];
    
    // Idealgewicht berechnen (Mitte des Normalbereichs)
    const idealgewichtMin = 18.5 * groesseM * groesseM;
    const idealgewichtMax = 25 * groesseM * groesseM;
    const idealgewichtMitte = (idealgewichtMin + idealgewichtMax) / 2;
    
    // Altersangepasstes Idealgewicht
    const altersIdealMin = altersBereich.optimalMin * groesseM * groesseM;
    const altersIdealMax = altersBereich.optimalMax * groesseM * groesseM;
    const altersIdealMitte = (altersIdealMin + altersIdealMax) / 2;
    
    // Differenz zum Idealgewicht
    const differenz = gewicht - idealgewichtMitte;
    const differenzAltersangepasst = gewicht - altersIdealMitte;
    
    // Grundumsatz nach Mifflin-St Jeor
    let grundumsatz: number;
    if (geschlecht === 'mann') {
      grundumsatz = 10 * gewicht + 6.25 * groesse - 5 * alter + 5;
    } else {
      grundumsatz = 10 * gewicht + 6.25 * groesse - 5 * alter - 161;
    }
    
    // Täglicher Kalorienbedarf (Grundumsatz * PAL-Faktor für leichte Aktivität)
    const kalorienbedarfSitzend = grundumsatz * 1.2;
    const kalorienbedarfLeicht = grundumsatz * 1.4;
    const kalorienbedarfMittel = grundumsatz * 1.6;
    const kalorienbedarfAktiv = grundumsatz * 1.8;
    
    // BMI-Werte für Grenzen
    const bmiUntergewicht = 18.5;
    const bmiNormalgewicht = 25;
    const bmiUebergewicht = 30;
    
    // Gewicht bei verschiedenen BMI-Werten
    const gewichtBei18_5 = 18.5 * groesseM * groesseM;
    const gewichtBei25 = 25 * groesseM * groesseM;
    const gewichtBei30 = 30 * groesseM * groesseM;
    
    // Ist im Normalbereich?
    const istNormal = bmi >= 18.5 && bmi < 25;
    const istAltersNormal = bmi >= altersBereich.optimalMin && bmi <= altersBereich.optimalMax;
    
    return {
      bmi,
      kategorie: kategorie.kategorie,
      farbe: kategorie.farbe,
      textFarbe: kategorie.textFarbe,
      hinweis: kategorie.hinweis,
      
      // Idealgewicht
      idealgewichtMin,
      idealgewichtMax,
      idealgewichtMitte,
      differenz,
      
      // Altersangepasst
      altersBereich,
      altersIdealMin,
      altersIdealMax,
      altersIdealMitte,
      differenzAltersangepasst,
      istAltersNormal,
      
      // Grundumsatz & Kalorien
      grundumsatz,
      kalorienbedarfSitzend,
      kalorienbedarfLeicht,
      kalorienbedarfMittel,
      kalorienbedarfAktiv,
      
      // Grenzen
      gewichtBei18_5,
      gewichtBei25,
      gewichtBei30,
      
      istNormal,
    };
  }, [gewicht, groesse, alter, geschlecht]);

  const formatNumber = (n: number, decimals = 1) => n.toFixed(decimals).replace('.', ',');

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  // BMI-Skala für visuelle Anzeige
  const getBMIPosition = (bmi: number) => {
    // Skala von 15 bis 40
    const min = 15;
    const max = 40;
    const position = ((bmi - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, position));
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

          {/* Gewicht */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gewicht (kg)
            </label>
            <input
              type="number"
              value={gewicht}
              onChange={(e) => setGewicht(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              placeholder="z.B. 75"
              min={30}
              max={300}
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              placeholder="z.B. 175"
              min={100}
              max={250}
            />
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              placeholder="z.B. 35"
              min={18}
              max={120}
            />
          </div>

          <button
            onClick={handleBerechnen}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
          >
            BMI berechnen
          </button>
        </div>
      </div>

      {/* Ergebnis */}
      {berechnet && ergebnis && (
        <>
          {/* Haupt-Ergebnis */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Ihr BMI-Ergebnis
            </h2>

            {/* BMI-Wert groß anzeigen */}
            <div className="text-center mb-6">
              <div className={`inline-block px-8 py-4 rounded-2xl ${ergebnis.farbe} text-white`}>
                <div className="text-5xl font-bold">{formatNumber(ergebnis.bmi)}</div>
                <div className="text-sm opacity-90">kg/m²</div>
              </div>
              <div className={`mt-3 text-lg font-semibold ${ergebnis.textFarbe}`}>
                {ergebnis.kategorie}
              </div>
            </div>

            {/* BMI-Skala */}
            <div className="mb-6">
              <div className="relative h-8 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-red-400" title="Untergewicht"></div>
                <div className="flex-1 bg-yellow-400" title="Leichtes Untergewicht"></div>
                <div className="flex-[1.3] bg-green-500" title="Normalgewicht"></div>
                <div className="flex-1 bg-yellow-500" title="Übergewicht"></div>
                <div className="flex-1 bg-orange-500" title="Adipositas I"></div>
                <div className="flex-1 bg-red-500" title="Adipositas II/III"></div>
              </div>
              {/* Marker */}
              <div className="relative h-4">
                <div 
                  className="absolute -top-1 w-4 h-4 bg-gray-800 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2"
                  style={{ left: `${getBMIPosition(ergebnis.bmi)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>15</span>
                <span>18,5</span>
                <span>25</span>
                <span>30</span>
                <span>35</span>
                <span>40</span>
              </div>
            </div>

            {/* Bewertung */}
            <div className={`p-4 rounded-lg ${ergebnis.istNormal ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={ergebnis.istNormal ? 'text-green-800' : 'text-amber-800'}>
                {ergebnis.hinweis}
              </p>
            </div>
          </div>

          {/* Detaillierte Auswertung */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              Gewichtsanalyse
            </h2>

            <div className="space-y-4">
              {/* Aktuelles Gewicht */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Ihr aktuelles Gewicht</span>
                <span className="font-bold text-gray-800">{formatNumber(gewicht, 0)} kg</span>
              </div>

              {/* Normalgewicht-Bereich */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Normalgewicht (BMI 18,5-25)</span>
                <span className="font-semibold text-green-600">
                  {formatNumber(ergebnis.idealgewichtMin, 0)} – {formatNumber(ergebnis.idealgewichtMax, 0)} kg
                </span>
              </div>

              {/* Altersangepasst */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Optimal für Alter {ergebnis.altersBereich.minAlter}-{ergebnis.altersBereich.maxAlter}
                  <span className="text-xs text-gray-400 ml-1">(BMI {ergebnis.altersBereich.optimalMin}-{ergebnis.altersBereich.optimalMax})</span>
                </span>
                <span className="font-semibold text-blue-600">
                  {formatNumber(ergebnis.altersIdealMin, 0)} – {formatNumber(ergebnis.altersIdealMax, 0)} kg
                </span>
              </div>

              {/* Differenz */}
              {!ergebnis.istNormal && (
                <div className={`p-4 rounded-lg ${ergebnis.differenz > 0 ? 'bg-amber-50' : 'bg-blue-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className={ergebnis.differenz > 0 ? 'text-amber-700' : 'text-blue-700'}>
                      {ergebnis.differenz > 0 ? 'Über Normalgewicht' : 'Unter Normalgewicht'}
                    </span>
                    <span className={`font-bold ${ergebnis.differenz > 0 ? 'text-amber-700' : 'text-blue-700'}`}>
                      {ergebnis.differenz > 0 ? '+' : ''}{formatNumber(ergebnis.differenz, 1)} kg
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kalorien & Grundumsatz */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              Kalorienbedarf (Richtwerte)
            </h2>

            <div className="space-y-4">
              {/* Grundumsatz */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-700">Grundumsatz</span>
                    <p className="text-xs text-gray-500">Kalorienbedarf in Ruhe</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{formatNumber(ergebnis.grundumsatz, 0)} kcal</span>
                </div>
              </div>

              {/* Aktivitätsniveaus */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-xs text-blue-600 mb-1">Sitzend (Büro)</div>
                  <div className="font-bold text-blue-800">{formatNumber(ergebnis.kalorienbedarfSitzend, 0)} kcal</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-xs text-green-600 mb-1">Leicht aktiv</div>
                  <div className="font-bold text-green-800">{formatNumber(ergebnis.kalorienbedarfLeicht, 0)} kcal</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg text-center">
                  <div className="text-xs text-yellow-600 mb-1">Mäßig aktiv</div>
                  <div className="font-bold text-yellow-800">{formatNumber(ergebnis.kalorienbedarfMittel, 0)} kcal</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <div className="text-xs text-orange-600 mb-1">Sehr aktiv</div>
                  <div className="font-bold text-orange-800">{formatNumber(ergebnis.kalorienbedarfAktiv, 0)} kcal</div>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Berechnung nach Mifflin-St Jeor-Formel. Der tatsächliche Bedarf kann individuell variieren.
              </p>
            </div>
          </div>

          {/* BMI-Tabelle */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              BMI-Klassifikation (WHO)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Kategorie</th>
                    <th className="text-center py-2 px-2">BMI</th>
                    <th className="text-right py-2 px-2">Ihr Gewicht wäre</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b border-gray-100 ${ergebnis.bmi < 18.5 ? 'bg-yellow-50' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                      Untergewicht
                    </td>
                    <td className="text-center py-2 px-2">&lt; 18,5</td>
                    <td className="text-right py-2 px-2">&lt; {formatNumber(ergebnis.gewichtBei18_5, 0)} kg</td>
                  </tr>
                  <tr className={`border-b border-gray-100 ${ergebnis.bmi >= 18.5 && ergebnis.bmi < 25 ? 'bg-green-50' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      Normalgewicht
                    </td>
                    <td className="text-center py-2 px-2">18,5 – 24,9</td>
                    <td className="text-right py-2 px-2">{formatNumber(ergebnis.gewichtBei18_5, 0)} – {formatNumber(ergebnis.gewichtBei25, 0)} kg</td>
                  </tr>
                  <tr className={`border-b border-gray-100 ${ergebnis.bmi >= 25 && ergebnis.bmi < 30 ? 'bg-yellow-50' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                      Übergewicht
                    </td>
                    <td className="text-center py-2 px-2">25 – 29,9</td>
                    <td className="text-right py-2 px-2">{formatNumber(ergebnis.gewichtBei25, 0)} – {formatNumber(ergebnis.gewichtBei30, 0)} kg</td>
                  </tr>
                  <tr className={`border-b border-gray-100 ${ergebnis.bmi >= 30 && ergebnis.bmi < 35 ? 'bg-orange-50' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                      Adipositas I
                    </td>
                    <td className="text-center py-2 px-2">30 – 34,9</td>
                    <td className="text-right py-2 px-2">{formatNumber(ergebnis.gewichtBei30, 0)} – {formatNumber(35 * (groesse/100) * (groesse/100), 0)} kg</td>
                  </tr>
                  <tr className={`border-b border-gray-100 ${ergebnis.bmi >= 35 && ergebnis.bmi < 40 ? 'bg-red-50' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-2"></span>
                      Adipositas II
                    </td>
                    <td className="text-center py-2 px-2">35 – 39,9</td>
                    <td className="text-right py-2 px-2">{formatNumber(35 * (groesse/100) * (groesse/100), 0)} – {formatNumber(40 * (groesse/100) * (groesse/100), 0)} kg</td>
                  </tr>
                  <tr className={`${ergebnis.bmi >= 40 ? 'bg-red-50' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                      Adipositas III
                    </td>
                    <td className="text-center py-2 px-2">≥ 40</td>
                    <td className="text-right py-2 px-2">≥ {formatNumber(40 * (groesse/100) * (groesse/100), 0)} kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Info-Box */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">ℹ️</span>
              Gut zu wissen
            </h2>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Was misst der BMI?</h3>
                <p className="text-blue-700">
                  Der Body-Mass-Index (BMI) ist ein Richtwert für das Verhältnis von Körpergewicht zu Körpergröße. 
                  Er wird berechnet als: <strong>Gewicht (kg) ÷ Größe² (m)</strong>
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-2">⚠️ Grenzen des BMI</h3>
                <ul className="text-amber-700 space-y-1 list-disc list-inside">
                  <li>Unterscheidet nicht zwischen Muskelmasse und Fettmasse</li>
                  <li>Sportler mit viel Muskelmasse haben oft einen hohen BMI trotz geringem Körperfett</li>
                  <li>Die Fettverteilung (z.B. Bauchfett) wird nicht berücksichtigt</li>
                  <li>Für Kinder, Schwangere und Senioren gelten andere Richtwerte</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-semibold text-green-800 mb-2">💡 Altersangepasster BMI</h3>
                <p className="text-green-700">
                  Mit zunehmendem Alter ist ein etwas höherer BMI oft unbedenklich. 
                  Für Menschen ab 65 Jahren gilt ein BMI zwischen 24-29 als optimal, 
                  da leichte Reserven bei Krankheit schützend wirken können.
                </p>
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
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">🩺</span>
                <p className="text-gray-600">
                  Der BMI ist nur ein <strong>Orientierungswert</strong>. Für eine umfassende Beurteilung 
                  Ihrer Gesundheit konsultieren Sie bitte Ihren Arzt.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">🏋️</span>
                <p className="text-gray-600">
                  Bei regelmäßigem Kraftsport kann Ihr BMI erhöht sein, ohne dass Übergewicht vorliegt. 
                  Der <strong>Körperfettanteil</strong> ist hier aussagekräftiger.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">📏</span>
                <p className="text-gray-600">
                  Der <strong>Taillenumfang</strong> ist ein wichtiger zusätzlicher Indikator: Bei Frauen sollte er 
                  unter 88 cm, bei Männern unter 102 cm liegen (Risiko für metabolische Erkrankungen).
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
                  href="https://www.who.int/europe/news-room/fact-sheets/item/a-healthy-lifestyle---who-recommendations" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  WHO – Klassifikation des BMI
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.dge.de/gesunde-ernaehrung/gut-essen-und-trinken/dge-empfehlungen/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Deutsche Gesellschaft für Ernährung (DGE)
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.rki.de/DE/Content/Gesundheitsmonitoring/Themen/Uebergewicht_Adipositas/Uebergewicht_Adipositas_node.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Robert Koch-Institut – Übergewicht und Adipositas
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.bzfe.de/ernaehrung/ernaehrungswissen/gesundheit/bmi-rechner/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Bundeszentrum für Ernährung (BZfE)
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
