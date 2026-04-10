import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Blutdruck-Kategorien nach WHO/ESH (European Society of Hypertension)
const BLUTDRUCK_KATEGORIEN = [
  { 
    id: 'optimal',
    name: 'Optimal', 
    systolischMax: 120, 
    diastolischMax: 80,
    farbe: 'bg-green-500', 
    textFarbe: 'text-green-700',
    hintergrund: 'bg-green-50',
    border: 'border-green-200',
    hinweis: 'Ihre Blutdruckwerte sind optimal. Weiter so! Achten Sie weiterhin auf einen gesunden Lebensstil.',
    emoji: '✅'
  },
  { 
    id: 'normal',
    name: 'Normal', 
    systolischMax: 130, 
    diastolischMax: 85,
    farbe: 'bg-emerald-400', 
    textFarbe: 'text-emerald-700',
    hintergrund: 'bg-emerald-50',
    border: 'border-emerald-200',
    hinweis: 'Ihre Blutdruckwerte liegen im normalen Bereich. Behalten Sie Ihren gesunden Lebensstil bei.',
    emoji: '👍'
  },
  { 
    id: 'hochnormal',
    name: 'Hochnormal', 
    systolischMax: 140, 
    diastolischMax: 90,
    farbe: 'bg-yellow-500', 
    textFarbe: 'text-yellow-700',
    hintergrund: 'bg-yellow-50',
    border: 'border-yellow-200',
    hinweis: 'Ihre Werte liegen im hochnormalen Bereich. Regelmäßige Kontrollen und Lebensstiländerungen werden empfohlen.',
    emoji: '⚠️'
  },
  { 
    id: 'hypertonie1',
    name: 'Hypertonie Grad 1 (leicht)', 
    systolischMax: 160, 
    diastolischMax: 100,
    farbe: 'bg-orange-500', 
    textFarbe: 'text-orange-700',
    hintergrund: 'bg-orange-50',
    border: 'border-orange-200',
    hinweis: 'Leichter Bluthochdruck. Eine ärztliche Abklärung wird empfohlen. Lebensstiländerungen können helfen.',
    emoji: '🩺'
  },
  { 
    id: 'hypertonie2',
    name: 'Hypertonie Grad 2 (mittelschwer)', 
    systolischMax: 180, 
    diastolischMax: 110,
    farbe: 'bg-red-500', 
    textFarbe: 'text-red-700',
    hintergrund: 'bg-red-50',
    border: 'border-red-200',
    hinweis: 'Mittelschwerer Bluthochdruck. Bitte suchen Sie zeitnah einen Arzt auf. Eine medikamentöse Behandlung ist oft notwendig.',
    emoji: '⚕️'
  },
  { 
    id: 'hypertonie3',
    name: 'Hypertonie Grad 3 (schwer)', 
    systolischMax: 999, 
    diastolischMax: 999,
    farbe: 'bg-red-700', 
    textFarbe: 'text-red-800',
    hintergrund: 'bg-red-100',
    border: 'border-red-300',
    hinweis: 'Schwerer Bluthochdruck. Suchen Sie bitte umgehend einen Arzt auf! Bei sehr hohen Werten (>200/120) sollten Sie den Notruf wählen.',
    emoji: '🚨'
  },
];

// Funktion zur Bestimmung der Kategorie
function getKategorie(systolisch: number, diastolisch: number) {
  // Bei Blutdruck gilt: Die höhere Kategorie zählt
  // Wenn systolisch und diastolisch in verschiedene Kategorien fallen,
  // wird die schlechtere (höhere) Kategorie genommen
  
  if (systolisch >= 180 || diastolisch >= 110) {
    return BLUTDRUCK_KATEGORIEN[5]; // Hypertonie Grad 3
  }
  if (systolisch >= 160 || diastolisch >= 100) {
    return BLUTDRUCK_KATEGORIEN[4]; // Hypertonie Grad 2
  }
  if (systolisch >= 140 || diastolisch >= 90) {
    return BLUTDRUCK_KATEGORIEN[3]; // Hypertonie Grad 1
  }
  if (systolisch >= 130 || diastolisch >= 85) {
    return BLUTDRUCK_KATEGORIEN[2]; // Hochnormal
  }
  if (systolisch >= 120 || diastolisch >= 80) {
    return BLUTDRUCK_KATEGORIEN[1]; // Normal
  }
  return BLUTDRUCK_KATEGORIEN[0]; // Optimal
}

// Hypotonie prüfen
function isHypotonie(systolisch: number, diastolisch: number) {
  return systolisch < 100 || diastolisch < 60;
}

export default function BlutdruckRechner() {
  const [systolisch, setSystolisch] = useState<number>(120);
  const [diastolisch, setDiastolisch] = useState<number>(80);
  const [puls, setPuls] = useState<number | undefined>();
  const [berechnet, setBerechnet] = useState(false);

  const ergebnis = useMemo(() => {
    if (!systolisch || !diastolisch || 
        systolisch < 60 || systolisch > 300 || 
        diastolisch < 30 || diastolisch > 200) {
      return null;
    }

    const kategorie = getKategorie(systolisch, diastolisch);
    const hypotonie = isHypotonie(systolisch, diastolisch);
    
    // Pulsdruck berechnen (Differenz zwischen systolisch und diastolisch)
    const pulsdruck = systolisch - diastolisch;
    const pulsdruckNormal = pulsdruck >= 30 && pulsdruck <= 50;
    
    // Mittlerer arterieller Druck (MAP)
    const map = diastolisch + (pulsdruck / 3);
    
    return {
      systolisch,
      diastolisch,
      kategorie,
      hypotonie,
      pulsdruck,
      pulsdruckNormal,
      map,
    };
  }, [systolisch, diastolisch]);

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  // Position auf der Skala berechnen (für visuelle Anzeige)
  const getSystolischPosition = (wert: number) => {
    // Skala von 90 bis 200
    const min = 90;
    const max = 200;
    const position = ((wert - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Blutdruck-Rechner" rechnerSlug="blutdruck-rechner" />

{/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Blutdruckwerte eingeben
        </h2>

        <div className="space-y-6">
          {/* Systolisch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Systolischer Wert (oberer Wert) in mmHg
            </label>
            <input
              type="number"
              value={systolisch}
              onChange={(e) => setSystolisch(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
              placeholder="z.B. 120"
              min={60}
              max={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              Der systolische Wert misst den Druck beim Herzschlag (Kontraktion)
            </p>
          </div>

          {/* Diastolisch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diastolischer Wert (unterer Wert) in mmHg
            </label>
            <input
              type="number"
              value={diastolisch}
              onChange={(e) => setDiastolisch(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
              placeholder="z.B. 80"
              min={30}
              max={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              Der diastolische Wert misst den Druck zwischen den Herzschlägen (Erschlaffung)
            </p>
          </div>

          {/* Puls (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puls (optional) in Schläge/Minute
            </label>
            <input
              type="number"
              value={puls || ''}
              onChange={(e) => setPuls(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
              placeholder="z.B. 70"
              min={30}
              max={220}
            />
          </div>

          <button
            onClick={handleBerechnen}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
          >
            Blutdruck einordnen
          </button>
        </div>
      </div>

      {/* Ergebnis */}
      {berechnet && ergebnis && (
        <>
          {/* Haupt-Ergebnis */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">❤️</span>
              Ihre Blutdruck-Kategorie
            </h2>

            {/* Hypotonie-Warnung */}
            {ergebnis.hypotonie && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💙</span>
                  <span className="font-semibold text-blue-800">Niedriger Blutdruck (Hypotonie)</span>
                </div>
                <p className="text-blue-700 text-sm mt-2">
                  Ihre Werte deuten auf niedrigen Blutdruck hin. Dies ist meist harmlos, kann aber 
                  Schwindel oder Müdigkeit verursachen. Bei Beschwerden sprechen Sie mit Ihrem Arzt.
                </p>
              </div>
            )}

            {/* Kategorie-Anzeige */}
            <div className="text-center mb-6">
              <div className={`inline-block px-8 py-4 rounded-2xl ${ergebnis.kategorie.farbe} text-white`}>
                <div className="text-4xl mb-2">{ergebnis.kategorie.emoji}</div>
                <div className="text-3xl font-bold">{ergebnis.systolisch}/{ergebnis.diastolisch}</div>
                <div className="text-sm opacity-90">mmHg</div>
              </div>
              <div className={`mt-3 text-lg font-semibold ${ergebnis.kategorie.textFarbe}`}>
                {ergebnis.kategorie.name}
              </div>
            </div>

            {/* Visuelle Skala */}
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">Systolischer Wert auf der Skala:</div>
              <div className="relative h-8 rounded-full overflow-hidden flex">
                <div className="flex-[1.5] bg-green-500" title="Optimal"></div>
                <div className="flex-1 bg-emerald-400" title="Normal"></div>
                <div className="flex-1 bg-yellow-500" title="Hochnormal"></div>
                <div className="flex-[1.5] bg-orange-500" title="Hypertonie 1"></div>
                <div className="flex-[1.5] bg-red-500" title="Hypertonie 2"></div>
                <div className="flex-1 bg-red-700" title="Hypertonie 3"></div>
              </div>
              {/* Marker */}
              <div className="relative h-4">
                <div 
                  className="absolute -top-1 w-4 h-4 bg-gray-800 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2"
                  style={{ left: `${getSystolischPosition(ergebnis.systolisch)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>90</span>
                <span>120</span>
                <span>130</span>
                <span>140</span>
                <span>160</span>
                <span>180</span>
                <span>200+</span>
              </div>
            </div>

            {/* Bewertung */}
            <div className={`p-4 rounded-lg ${ergebnis.kategorie.hintergrund} border ${ergebnis.kategorie.border}`}>
              <p className={ergebnis.kategorie.textFarbe}>
                {ergebnis.kategorie.hinweis}
              </p>
            </div>
          </div>

          {/* Zusätzliche Werte */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Weitere Werte
            </h2>

            <div className="space-y-4">
              {/* Pulsdruck */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <span className="text-gray-700 font-medium">Pulsdruck (Blutdruckamplitude)</span>
                  <p className="text-xs text-gray-500">Differenz zwischen systolisch und diastolisch</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-800">{ergebnis.pulsdruck} mmHg</span>
                  <p className={`text-xs ${ergebnis.pulsdruckNormal ? 'text-green-600' : 'text-amber-600'}`}>
                    {ergebnis.pulsdruckNormal ? 'Normal (30-50 mmHg)' : 'Außerhalb 30-50 mmHg'}
                  </p>
                </div>
              </div>

              {/* MAP */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <span className="text-gray-700 font-medium">Mittlerer arterieller Druck (MAP)</span>
                  <p className="text-xs text-gray-500">Durchschnittlicher Druck im Kreislauf</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-800">{ergebnis.map.toFixed(0)} mmHg</span>
                  <p className={`text-xs ${ergebnis.map >= 70 && ergebnis.map <= 100 ? 'text-green-600' : 'text-amber-600'}`}>
                    {ergebnis.map >= 70 && ergebnis.map <= 100 ? 'Normal (70-100 mmHg)' : 'Außerhalb 70-100 mmHg'}
                  </p>
                </div>
              </div>

              {/* Puls wenn eingegeben */}
              {puls && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="text-gray-700 font-medium">Ruhepuls</span>
                    <p className="text-xs text-gray-500">Normal: 60-100 Schläge/Min</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-800">{puls} /min</span>
                    <p className={`text-xs ${puls >= 60 && puls <= 100 ? 'text-green-600' : 'text-amber-600'}`}>
                      {puls < 60 ? 'Bradykardie (langsam)' : puls > 100 ? 'Tachykardie (schnell)' : 'Normal'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* WHO/ESH Klassifikation Tabelle */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Blutdruck-Klassifikation (WHO/ESH)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Kategorie</th>
                    <th className="text-center py-2 px-2">Systolisch</th>
                    <th className="text-center py-2 px-2"></th>
                    <th className="text-center py-2 px-2">Diastolisch</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b border-gray-100 ${ergebnis.kategorie.id === 'optimal' ? 'bg-green-50' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      Optimal
                    </td>
                    <td className="text-center py-2 px-2">&lt; 120</td>
                    <td className="text-center py-2 px-2 text-gray-400">und</td>
                    <td className="text-center py-2 px-2">&lt; 80</td>
                  </tr>
                  <tr className={`border-b border-gray-100 ${ergebnis.kategorie.id === 'normal' ? 'bg-emerald-50' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-emerald-400 rounded-full mr-2"></span>
                      Normal
                    </td>
                    <td className="text-center py-2 px-2">120 – 129</td>
                    <td className="text-center py-2 px-2 text-gray-400">und/oder</td>
                    <td className="text-center py-2 px-2">80 – 84</td>
                  </tr>
                  <tr className={`border-b border-gray-100 ${ergebnis.kategorie.id === 'hochnormal' ? 'bg-yellow-50' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                      Hochnormal
                    </td>
                    <td className="text-center py-2 px-2">130 – 139</td>
                    <td className="text-center py-2 px-2 text-gray-400">und/oder</td>
                    <td className="text-center py-2 px-2">85 – 89</td>
                  </tr>
                  <tr className={`border-b border-gray-100 ${ergebnis.kategorie.id === 'hypertonie1' ? 'bg-orange-50' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                      Hypertonie Grad 1
                    </td>
                    <td className="text-center py-2 px-2">140 – 159</td>
                    <td className="text-center py-2 px-2 text-gray-400">und/oder</td>
                    <td className="text-center py-2 px-2">90 – 99</td>
                  </tr>
                  <tr className={`border-b border-gray-100 ${ergebnis.kategorie.id === 'hypertonie2' ? 'bg-red-50' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      Hypertonie Grad 2
                    </td>
                    <td className="text-center py-2 px-2">160 – 179</td>
                    <td className="text-center py-2 px-2 text-gray-400">und/oder</td>
                    <td className="text-center py-2 px-2">100 – 109</td>
                  </tr>
                  <tr className={`${ergebnis.kategorie.id === 'hypertonie3' ? 'bg-red-100' : ''}`}>
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-red-700 rounded-full mr-2"></span>
                      Hypertonie Grad 3
                    </td>
                    <td className="text-center py-2 px-2">≥ 180</td>
                    <td className="text-center py-2 px-2 text-gray-400">und/oder</td>
                    <td className="text-center py-2 px-2">≥ 110</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Hinweis: Bei unterschiedlichen Kategorien für systolisch und diastolisch gilt die höhere (schlechtere) Kategorie.
            </p>
          </div>

          {/* Tipps für gesunden Blutdruck */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💪</span>
              Tipps für gesunde Blutdruckwerte
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">🏃</span>
                <div>
                  <h3 className="font-medium text-gray-800">Regelmäßige Bewegung</h3>
                  <p className="text-sm text-gray-600">Mind. 150 Min. moderate Aktivität pro Woche</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">🥗</span>
                <div>
                  <h3 className="font-medium text-gray-800">Gesunde Ernährung</h3>
                  <p className="text-sm text-gray-600">Wenig Salz, viel Gemüse und Obst</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">⚖️</span>
                <div>
                  <h3 className="font-medium text-gray-800">Normalgewicht</h3>
                  <p className="text-sm text-gray-600">BMI zwischen 18,5 und 25 anstreben</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">🚭</span>
                <div>
                  <h3 className="font-medium text-gray-800">Nicht rauchen</h3>
                  <p className="text-sm text-gray-600">Rauchen schädigt die Gefäße</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">🍷</span>
                <div>
                  <h3 className="font-medium text-gray-800">Wenig Alkohol</h3>
                  <p className="text-sm text-gray-600">Maximal 1-2 Gläser am Tag</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">😴</span>
                <div>
                  <h3 className="font-medium text-gray-800">Stressabbau & Schlaf</h3>
                  <p className="text-sm text-gray-600">Ausreichend schlafen, Stress reduzieren</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wichtiger Disclaimer */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Wichtiger Hinweis
            </h2>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 font-medium mb-2">
                Dieser Rechner ersetzt keine ärztliche Beratung!
              </p>
              <ul className="text-amber-700 text-sm space-y-1 list-disc list-inside">
                <li>Die Einordnung dient nur zur <strong>Orientierung</strong></li>
                <li>Eine einzelne Messung ist nicht aussagekräftig – messen Sie mehrmals</li>
                <li>Bei erhöhten Werten sollten Sie einen <strong>Arzt aufsuchen</strong></li>
                <li>Nur ein Arzt kann eine Diagnose stellen und Behandlung empfehlen</li>
                <li>Bei sehr hohen Werten (&gt;200/120 mmHg) oder Beschwerden: <strong>Notruf 112</strong></li>
              </ul>
            </div>
          </div>

          {/* Info zu korrekter Messung */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📏</span>
              So messen Sie richtig
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">🪑</span>
                <p className="text-gray-600">
                  <strong>Sitzen Sie entspannt</strong> mit Rückenlehne, Füße flach auf dem Boden
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">⏰</span>
                <p className="text-gray-600">
                  <strong>5 Minuten Ruhe</strong> vor der Messung einhalten
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">💪</span>
                <p className="text-gray-600">
                  <strong>Arm auf Herzhöhe</strong> ablegen, Manschette auf nackter Haut
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">☕</span>
                <p className="text-gray-600">
                  <strong>Kein Kaffee, Alkohol oder Sport</strong> 30 Minuten vor der Messung
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">🔁</span>
                <p className="text-gray-600">
                  <strong>2-3 Messungen</strong> im Abstand von 1-2 Minuten, Durchschnitt nehmen
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
                  href="https://www.hochdruckliga.de/betroffene/blutdruck-werte" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline flex items-center gap-1"
                >
                  Deutsche Hochdruckliga – Blutdruckwerte
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.who.int/news-room/fact-sheets/detail/hypertension" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline flex items-center gap-1"
                >
                  WHO – Hypertension Fact Sheet
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.herzstiftung.de/infos-zu-herzerkrankungen/bluthochdruck" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline flex items-center gap-1"
                >
                  Deutsche Herzstiftung – Bluthochdruck
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Arterial-Hypertension-Management-of" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline flex items-center gap-1"
                >
                  ESC/ESH Guidelines – Arterielle Hypertonie
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
