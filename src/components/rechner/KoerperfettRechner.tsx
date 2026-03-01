import { useState, useMemo } from 'react';

// KFA-Kategorien nach Geschlecht
const KFA_KATEGORIEN_MANN = [
  { min: 0, max: 6, kategorie: 'Essentielles Fett', farbe: 'bg-red-500', textFarbe: 'text-red-700', hinweis: 'Lebensnotwendiges Minimum – nur bei Wettkampf-Bodybuildern zu finden. Gesundheitlich bedenklich.' },
  { min: 6, max: 14, kategorie: 'Athletisch', farbe: 'bg-blue-500', textFarbe: 'text-blue-700', hinweis: 'Sehr niedriger Körperfettanteil, typisch für Leistungssportler. Sixpack sichtbar.' },
  { min: 14, max: 18, kategorie: 'Fit', farbe: 'bg-green-500', textFarbe: 'text-green-700', hinweis: 'Sportlicher Körperfettanteil. Gute Muskeldefinition sichtbar.' },
  { min: 18, max: 25, kategorie: 'Durchschnittlich', farbe: 'bg-yellow-500', textFarbe: 'text-yellow-700', hinweis: 'Normaler, gesunder Bereich für die meisten Männer.' },
  { min: 25, max: 30, kategorie: 'Erhöht', farbe: 'bg-orange-500', textFarbe: 'text-orange-700', hinweis: 'Leicht erhöhter Körperfettanteil. Mehr Bewegung und ausgewogene Ernährung empfohlen.' },
  { min: 30, max: 100, kategorie: 'Adipositas', farbe: 'bg-red-600', textFarbe: 'text-red-700', hinweis: 'Stark erhöht. Gesundheitsrisiken möglich. Ärztliche Beratung empfohlen.' },
];

const KFA_KATEGORIEN_FRAU = [
  { min: 0, max: 14, kategorie: 'Essentielles Fett', farbe: 'bg-red-500', textFarbe: 'text-red-700', hinweis: 'Unter dem lebensnotwendigen Minimum für Frauen. Gesundheitlich bedenklich.' },
  { min: 14, max: 21, kategorie: 'Athletisch', farbe: 'bg-blue-500', textFarbe: 'text-blue-700', hinweis: 'Sehr niedriger Körperfettanteil, typisch für Leistungssportlerinnen.' },
  { min: 21, max: 25, kategorie: 'Fit', farbe: 'bg-green-500', textFarbe: 'text-green-700', hinweis: 'Sportlicher Körperfettanteil. Gute Muskeldefinition sichtbar.' },
  { min: 25, max: 32, kategorie: 'Durchschnittlich', farbe: 'bg-yellow-500', textFarbe: 'text-yellow-700', hinweis: 'Normaler, gesunder Bereich für die meisten Frauen.' },
  { min: 32, max: 38, kategorie: 'Erhöht', farbe: 'bg-orange-500', textFarbe: 'text-orange-700', hinweis: 'Leicht erhöhter Körperfettanteil. Mehr Bewegung und ausgewogene Ernährung empfohlen.' },
  { min: 38, max: 100, kategorie: 'Adipositas', farbe: 'bg-red-600', textFarbe: 'text-red-700', hinweis: 'Stark erhöht. Gesundheitsrisiken möglich. Ärztliche Beratung empfohlen.' },
];

// Referenzbereiche für Tabelle
const REFERENZ_MANN = [
  { kategorie: 'Essentielles Fett', bereich: '2–5%', beschreibung: 'Lebensnotwendiges Minimum' },
  { kategorie: 'Athletisch', bereich: '6–13%', beschreibung: 'Wettkampf- & Leistungssportler' },
  { kategorie: 'Fit', bereich: '14–17%', beschreibung: 'Sportlich aktiv, gute Definition' },
  { kategorie: 'Durchschnittlich', bereich: '18–24%', beschreibung: 'Normaler gesunder Bereich' },
  { kategorie: 'Erhöht', bereich: '25–29%', beschreibung: 'Leicht über Durchschnitt' },
  { kategorie: 'Adipositas', bereich: '≥30%', beschreibung: 'Stark erhöht' },
];

const REFERENZ_FRAU = [
  { kategorie: 'Essentielles Fett', bereich: '10–13%', beschreibung: 'Lebensnotwendiges Minimum' },
  { kategorie: 'Athletisch', bereich: '14–20%', beschreibung: 'Wettkampf- & Leistungssportlerinnen' },
  { kategorie: 'Fit', bereich: '21–24%', beschreibung: 'Sportlich aktiv, gute Definition' },
  { kategorie: 'Durchschnittlich', bereich: '25–31%', beschreibung: 'Normaler gesunder Bereich' },
  { kategorie: 'Erhöht', bereich: '32–37%', beschreibung: 'Leicht über Durchschnitt' },
  { kategorie: 'Adipositas', bereich: '≥38%', beschreibung: 'Stark erhöht' },
];

export default function KoerperfettRechner() {
  const [geschlecht, setGeschlecht] = useState<'mann' | 'frau'>('mann');
  const [groesse, setGroesse] = useState<number>(175);
  const [hals, setHals] = useState<number>(38);
  const [taille, setTaille] = useState<number>(85);
  const [huefte, setHuefte] = useState<number>(100);
  const [gewicht, setGewicht] = useState<number>(80);
  const [berechnet, setBerechnet] = useState(false);

  const ergebnis = useMemo(() => {
    // Validierung
    if (!groesse || groesse < 100 || groesse > 250) return null;
    if (!hals || hals < 20 || hals > 60) return null;
    if (!taille || taille < 40 || taille > 200) return null;
    if (geschlecht === 'frau' && (!huefte || huefte < 50 || huefte > 200)) return null;

    // Navy-Methode Formel
    let kfa: number;
    
    if (geschlecht === 'mann') {
      // Männer: 495 / (1.0324 - 0.19077 × log10(Taille - Hals) + 0.15456 × log10(Größe)) - 450
      const diff = taille - hals;
      if (diff <= 0) return null;
      kfa = 495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(groesse)) - 450;
    } else {
      // Frauen: 495 / (1.29579 - 0.35004 × log10(Taille + Hüfte - Hals) + 0.22100 × log10(Größe)) - 450
      const sum = taille + huefte - hals;
      if (sum <= 0) return null;
      kfa = 495 / (1.29579 - 0.35004 * Math.log10(sum) + 0.22100 * Math.log10(groesse)) - 450;
    }

    // Unrealistische Werte abfangen
    if (kfa < 0 || kfa > 60 || isNaN(kfa)) return null;

    // Kategorie finden
    const kategorien = geschlecht === 'mann' ? KFA_KATEGORIEN_MANN : KFA_KATEGORIEN_FRAU;
    const kategorie = kategorien.find(k => kfa >= k.min && kfa < k.max) || kategorien[kategorien.length - 1];

    // Fettmasse & Magermasse berechnen (wenn Gewicht angegeben)
    let fettmasse: number | null = null;
    let magermasse: number | null = null;
    if (gewicht && gewicht >= 30 && gewicht <= 300) {
      fettmasse = (gewicht * kfa) / 100;
      magermasse = gewicht - fettmasse;
    }

    // Optimaler Bereich
    const optimalMin = geschlecht === 'mann' ? 14 : 21;
    const optimalMax = geschlecht === 'mann' ? 18 : 25;
    const istOptimal = kfa >= optimalMin && kfa <= optimalMax;

    // Differenz zum optimalen Bereich
    let differenzOptimal: number | null = null;
    let zielgewicht: number | null = null;
    if (gewicht && fettmasse !== null) {
      if (kfa > optimalMax) {
        // Zu viel Fett - berechne, wie viel kg Fett weg müsste
        const zielKfa = (optimalMin + optimalMax) / 2;
        const zielFettmasse = (magermasse! / (1 - zielKfa / 100)) * (zielKfa / 100);
        differenzOptimal = fettmasse - zielFettmasse;
        zielgewicht = magermasse! + zielFettmasse;
      } else if (kfa < optimalMin) {
        differenzOptimal = null; // Unter optimal ist auch nicht ideal anzuzeigen
      }
    }

    return {
      kfa,
      kategorie: kategorie.kategorie,
      farbe: kategorie.farbe,
      textFarbe: kategorie.textFarbe,
      hinweis: kategorie.hinweis,
      fettmasse,
      magermasse,
      istOptimal,
      differenzOptimal,
      zielgewicht,
      optimalMin,
      optimalMax,
    };
  }, [geschlecht, groesse, hals, taille, huefte, gewicht]);

  const formatNumber = (n: number, decimals = 1) => n.toFixed(decimals).replace('.', ',');

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  // KFA-Skala Position
  const getKFAPosition = (kfa: number) => {
    // Skala von 5 bis 45 für bessere Visualisierung
    const min = 5;
    const max = 45;
    const position = ((kfa - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const referenzTabelle = geschlecht === 'mann' ? REFERENZ_MANN : REFERENZ_FRAU;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📏</span>
          Ihre Körpermaße eingeben
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

          {/* Körpergröße */}
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

          {/* Halsumfang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Halsumfang (cm)
              <span className="text-gray-400 text-xs ml-2">An der schmalsten Stelle messen</span>
            </label>
            <input
              type="number"
              value={hals}
              onChange={(e) => setHals(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              placeholder="z.B. 38"
              min={20}
              max={60}
              step={0.5}
            />
          </div>

          {/* Taillenumfang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taillenumfang (cm)
              <span className="text-gray-400 text-xs ml-2">Am Bauchnabel messen</span>
            </label>
            <input
              type="number"
              value={taille}
              onChange={(e) => setTaille(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              placeholder="z.B. 85"
              min={40}
              max={200}
              step={0.5}
            />
          </div>

          {/* Hüftumfang - nur bei Frauen */}
          {geschlecht === 'frau' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hüftumfang (cm)
                <span className="text-gray-400 text-xs ml-2">An der breitesten Stelle messen</span>
              </label>
              <input
                type="number"
                value={huefte}
                onChange={(e) => setHuefte(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                placeholder="z.B. 100"
                min={50}
                max={200}
                step={0.5}
              />
            </div>
          )}

          {/* Gewicht (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Körpergewicht (kg)
              <span className="text-gray-400 text-xs ml-2">Optional – für Fett-/Magermasse</span>
            </label>
            <input
              type="number"
              value={gewicht}
              onChange={(e) => setGewicht(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
              placeholder="z.B. 80"
              min={30}
              max={300}
            />
          </div>

          <button
            onClick={handleBerechnen}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
          >
            Körperfettanteil berechnen
          </button>
        </div>
      </div>

      {/* Ergebnis */}
      {berechnet && ergebnis && (
        <>
          {/* Haupt-Ergebnis */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Ihr Körperfettanteil
            </h2>

            {/* KFA-Wert groß anzeigen */}
            <div className="text-center mb-6">
              <div className={`inline-block px-8 py-4 rounded-2xl ${ergebnis.farbe} text-white`}>
                <div className="text-5xl font-bold">{formatNumber(ergebnis.kfa)}</div>
                <div className="text-sm opacity-90">% Körperfett</div>
              </div>
              <div className={`mt-3 text-lg font-semibold ${ergebnis.textFarbe}`}>
                {ergebnis.kategorie}
              </div>
            </div>

            {/* KFA-Skala */}
            <div className="mb-6">
              <div className="relative h-8 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-red-400" title="Essentiell"></div>
                <div className="flex-[1.5] bg-blue-500" title="Athletisch"></div>
                <div className="flex-1 bg-green-500" title="Fit"></div>
                <div className="flex-[1.5] bg-yellow-500" title="Durchschnittlich"></div>
                <div className="flex-1 bg-orange-500" title="Erhöht"></div>
                <div className="flex-1 bg-red-600" title="Adipositas"></div>
              </div>
              {/* Marker */}
              <div className="relative h-4">
                <div 
                  className="absolute -top-1 w-4 h-4 bg-gray-800 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2"
                  style={{ left: `${getKFAPosition(ergebnis.kfa)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5%</span>
                <span>15%</span>
                <span>25%</span>
                <span>35%</span>
                <span>45%</span>
              </div>
            </div>

            {/* Bewertung */}
            <div className={`p-4 rounded-lg ${ergebnis.istOptimal ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={ergebnis.istOptimal ? 'text-green-800' : 'text-amber-800'}>
                {ergebnis.hinweis}
              </p>
            </div>
          </div>

          {/* Detaillierte Auswertung */}
          {ergebnis.fettmasse !== null && ergebnis.magermasse !== null && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚖️</span>
                Körperzusammensetzung
              </h2>

              <div className="space-y-4">
                {/* Gesamtgewicht */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Ihr Körpergewicht</span>
                  <span className="font-bold text-gray-800">{formatNumber(gewicht, 1)} kg</span>
                </div>

                {/* Fettmasse */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Fettmasse</span>
                  <span className="font-semibold text-orange-600">
                    {formatNumber(ergebnis.fettmasse, 1)} kg
                  </span>
                </div>

                {/* Magermasse */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Fettfreie Masse (Muskeln, Organe, Knochen)</span>
                  <span className="font-semibold text-blue-600">
                    {formatNumber(ergebnis.magermasse, 1)} kg
                  </span>
                </div>

                {/* Visuelle Darstellung */}
                <div className="mt-4">
                  <div className="h-8 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-blue-500 transition-all duration-500"
                      style={{ width: `${(ergebnis.magermasse / gewicht) * 100}%` }}
                      title="Fettfreie Masse"
                    />
                    <div 
                      className="bg-orange-400 transition-all duration-500"
                      style={{ width: `${(ergebnis.fettmasse / gewicht) * 100}%` }}
                      title="Fettmasse"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      Fettfrei: {formatNumber((ergebnis.magermasse / gewicht) * 100)}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 bg-orange-400 rounded-full"></span>
                      Fett: {formatNumber(ergebnis.kfa)}%
                    </span>
                  </div>
                </div>

                {/* Empfehlung bei erhöhtem KFA */}
                {ergebnis.differenzOptimal !== null && ergebnis.zielgewicht !== null && (
                  <div className="p-4 bg-amber-50 rounded-lg mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">💡</span>
                      <span className="font-semibold text-amber-800">Empfehlung</span>
                    </div>
                    <p className="text-amber-700 text-sm">
                      Um in den optimalen Bereich ({ergebnis.optimalMin}–{ergebnis.optimalMax}%) zu gelangen, 
                      wäre eine Reduzierung der Fettmasse um ca. <strong>{formatNumber(ergebnis.differenzOptimal, 1)} kg</strong> empfehlenswert.
                      Das entspricht einem Zielgewicht von etwa <strong>{formatNumber(ergebnis.zielgewicht, 0)} kg</strong> (bei gleichbleibender Muskelmasse).
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Referenztabelle */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              KFA-Referenzwerte ({geschlecht === 'mann' ? 'Männer' : 'Frauen'})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Kategorie</th>
                    <th className="text-center py-2 px-2">KFA-Bereich</th>
                    <th className="text-left py-2 px-2">Beschreibung</th>
                  </tr>
                </thead>
                <tbody>
                  {referenzTabelle.map((ref, idx) => (
                    <tr 
                      key={idx}
                      className={`border-b border-gray-100 ${
                        ergebnis.kategorie === ref.kategorie ? 'bg-emerald-50' : ''
                      }`}
                    >
                      <td className="py-2 px-2 font-medium">{ref.kategorie}</td>
                      <td className="text-center py-2 px-2">{ref.bereich}</td>
                      <td className="py-2 px-2 text-gray-600">{ref.beschreibung}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mess-Anleitung */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📐</span>
              Richtig messen
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">🎯</span>
                <div>
                  <strong className="text-blue-800">Halsumfang</strong>
                  <p className="text-blue-700">An der schmalsten Stelle des Halses, unterhalb des Kehlkopfes. Maßband waagerecht halten.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-xl">🎯</span>
                <div>
                  <strong className="text-green-800">Taillenumfang</strong>
                  <p className="text-green-700">Auf Höhe des Bauchnabels messen. Nicht einziehen, entspannt stehen. Morgens nüchtern für konsistente Werte.</p>
                </div>
              </div>

              {geschlecht === 'frau' && (
                <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
                  <span className="text-xl">🎯</span>
                  <div>
                    <strong className="text-pink-800">Hüftumfang</strong>
                    <p className="text-pink-700">An der breitesten Stelle des Gesäßes/der Hüfte messen. Beine zusammen, entspannt stehen.</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="text-xl">💡</span>
                <div>
                  <strong className="text-amber-800">Tipp für genaue Messung</strong>
                  <p className="text-amber-700">
                    Immer zur gleichen Tageszeit messen (idealerweise morgens). 
                    Maßband straff, aber ohne einzudrücken. Bei Unsicherheit mehrfach messen und Durchschnitt nehmen.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info-Box */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">ℹ️</span>
              Über die Navy-Methode
            </h2>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Was ist die Navy-Methode?</h3>
                <p className="text-blue-700">
                  Die Navy-Methode wurde von der US-Marine entwickelt, um den Körperfettanteil ohne spezielle Geräte 
                  zu bestimmen. Sie basiert auf der Erkenntnis, dass das Verhältnis von Hals- und Taillenumfang 
                  (bei Frauen zusätzlich Hüftumfang) zur Körpergröße den Körperfettanteil gut abschätzen kann.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-semibold text-green-800 mb-2">✅ Vorteile</h3>
                <ul className="text-green-700 space-y-1 list-disc list-inside">
                  <li>Einfach und kostenlos durchführbar</li>
                  <li>Nur ein Maßband nötig</li>
                  <li>Gute Korrelation mit DEXA-Scans (Goldstandard)</li>
                  <li>Ideal zur Fortschrittskontrolle</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-2">⚠️ Einschränkungen</h3>
                <ul className="text-amber-700 space-y-1 list-disc list-inside">
                  <li>Genauigkeit ca. ±3-4% im Vergleich zu DEXA</li>
                  <li>Bei sehr muskulösen Personen kann der Wert zu hoch sein</li>
                  <li>Fettverteilung (z.B. mehr Arm-/Beinfett) wird nicht erfasst</li>
                  <li>Tagesform und Wassereinlagerung beeinflussen das Ergebnis</li>
                </ul>
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
                  Der errechnete Wert ist eine <strong>Schätzung</strong>. Für eine genaue Bestimmung 
                  können Methoden wie DEXA-Scan, Caliper-Messung oder bioelektrische Impedanzanalyse (BIA) genutzt werden.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">📈</span>
                <p className="text-gray-600">
                  Nutzen Sie den Rechner regelmäßig (z.B. wöchentlich), um <strong>Trends</strong> zu erkennen. 
                  Der Vergleich über Zeit ist aussagekräftiger als ein einzelner Wert.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">🏋️</span>
                <p className="text-gray-600">
                  Ein niedriger Körperfettanteil ist nicht automatisch "besser". 
                  Zu wenig Körperfett kann <strong>gesundheitsschädlich</strong> sein, besonders für Frauen.
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
                  href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3830579/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Hodgdon & Beckett (1984) – Navy Body Fat Formula
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
                  href="https://www.acsm.org/all-blog-posts/acsm-blog/acsm-blog/2019/12/11/body-fat-percentage-fat-free-mass-endurance-athletes" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  American College of Sports Medicine (ACSM)
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  WHO – Obesity and Overweight
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
