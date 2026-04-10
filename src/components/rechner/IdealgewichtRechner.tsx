import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Körperbau-Optionen für Creff-Formel
const KOERPERBAU_OPTIONEN = [
  { id: 'schlank', name: 'Schlank (schmal gebaut)', faktor: 0.9, icon: '🧍' },
  { id: 'normal', name: 'Normal (durchschnittlich)', faktor: 1.0, icon: '🧍‍♂️' },
  { id: 'kraeftig', name: 'Kräftig (breit gebaut)', faktor: 1.1, icon: '🏋️' },
];

export default function IdealgewichtRechner() {
  const [groesse, setGroesse] = useState<number>(175);
  const [alter, setAlter] = useState<number>(35);
  const [geschlecht, setGeschlecht] = useState<'mann' | 'frau'>('mann');
  const [koerperbau, setKoerperbau] = useState<'schlank' | 'normal' | 'kraeftig'>('normal');
  const [berechnet, setBerechnet] = useState(false);

  const ergebnis = useMemo(() => {
    if (!groesse || groesse < 100 || groesse > 250 || !alter || alter < 18 || alter > 120) {
      return null;
    }

    // 1. Broca-Formel (klassisch)
    // Idealgewicht = Größe (cm) - 100
    // Männer: -10%, Frauen: -15%
    const brocaBasis = groesse - 100;
    const brocaIdeal = geschlecht === 'mann' 
      ? brocaBasis * 0.9 
      : brocaBasis * 0.85;
    const brocaMin = brocaIdeal * 0.9;
    const brocaMax = brocaIdeal * 1.1;

    // 2. Creff-Formel (berücksichtigt Alter & Körperbau)
    // Idealgewicht = (Größe - 100 + (Alter / 10)) × 0.9 × Körperbau-Faktor
    const koerperbauFaktor = KOERPERBAU_OPTIONEN.find(k => k.id === koerperbau)?.faktor || 1.0;
    const creffIdeal = (groesse - 100 + (alter / 10)) * 0.9 * koerperbauFaktor;
    const creffMin = creffIdeal * 0.95;
    const creffMax = creffIdeal * 1.05;

    // 3. Lorentz-Formel
    // Männer: Idealgewicht = (Größe - 100) - ((Größe - 150) / 4)
    // Frauen: Idealgewicht = (Größe - 100) - ((Größe - 150) / 2)
    const lorentzIdeal = geschlecht === 'mann'
      ? (groesse - 100) - ((groesse - 150) / 4)
      : (groesse - 100) - ((groesse - 150) / 2);
    const lorentzMin = lorentzIdeal * 0.9;
    const lorentzMax = lorentzIdeal * 1.1;

    // Gesamt-Bereich aus allen Formeln (Durchschnitt)
    const gesamtMin = Math.min(brocaMin, creffMin, lorentzMin);
    const gesamtMax = Math.max(brocaMax, creffMax, lorentzMax);
    const gesamtIdeal = (brocaIdeal + creffIdeal + lorentzIdeal) / 3;

    // BMI-basierter Normalbereich zum Vergleich (BMI 18.5-25)
    const groesseM = groesse / 100;
    const bmiNormalMin = 18.5 * groesseM * groesseM;
    const bmiNormalMax = 25 * groesseM * groesseM;

    return {
      broca: {
        ideal: brocaIdeal,
        min: brocaMin,
        max: brocaMax,
      },
      creff: {
        ideal: creffIdeal,
        min: creffMin,
        max: creffMax,
      },
      lorentz: {
        ideal: lorentzIdeal,
        min: lorentzMin,
        max: lorentzMax,
      },
      gesamt: {
        ideal: gesamtIdeal,
        min: gesamtMin,
        max: gesamtMax,
      },
      bmiNormal: {
        min: bmiNormalMin,
        max: bmiNormalMax,
      },
    };
  }, [groesse, alter, geschlecht, koerperbau]);

  const formatNumber = (n: number, decimals = 1) => n.toFixed(decimals).replace('.', ',');

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Idealgewicht-Rechner" rechnerSlug="idealgewicht-rechner" />

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

          {/* Körperbau */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Körperbau <span className="text-gray-400 text-xs">(für Creff-Formel)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {KOERPERBAU_OPTIONEN.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setKoerperbau(option.id as typeof koerperbau)}
                  className={`py-3 px-2 rounded-lg border-2 transition-all text-center ${
                    koerperbau === option.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl block mb-1">{option.icon}</span>
                  <span className="text-xs">{option.id.charAt(0).toUpperCase() + option.id.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleBerechnen}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
          >
            Idealgewicht berechnen
          </button>
        </div>
      </div>

      {/* Ergebnis */}
      {berechnet && ergebnis && (
        <>
          {/* Haupt-Ergebnis */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              Ihr Idealgewicht-Bereich
            </h2>

            {/* Hauptergebnis groß anzeigen */}
            <div className="text-center mb-6">
              <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <div className="text-4xl font-bold">
                  {formatNumber(ergebnis.gesamt.min, 0)} – {formatNumber(ergebnis.gesamt.max, 0)} kg
                </div>
                <div className="text-sm opacity-90 mt-1">Idealgewicht-Bereich (alle Formeln)</div>
              </div>
              <div className="mt-4 text-lg text-gray-600">
                Durchschnitt: <span className="font-bold text-emerald-600">{formatNumber(ergebnis.gesamt.ideal, 1)} kg</span>
              </div>
            </div>

            {/* Visuelle Skala */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2 text-center">Ihr Idealgewicht-Bereich</div>
              <div className="relative h-8 bg-gradient-to-r from-yellow-200 via-green-400 to-yellow-200 rounded-full overflow-hidden">
                {/* Markierungen für die Formeln */}
                <div 
                  className="absolute top-0 h-full bg-green-600 opacity-30"
                  style={{ 
                    left: `${((ergebnis.gesamt.min - 40) / 80) * 100}%`,
                    width: `${((ergebnis.gesamt.max - ergebnis.gesamt.min) / 80) * 100}%`
                  }}
                />
                {/* Marker für Durchschnitt */}
                <div 
                  className="absolute top-0 w-1 h-full bg-emerald-700"
                  style={{ left: `${((ergebnis.gesamt.ideal - 40) / 80) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>40 kg</span>
                <span>60 kg</span>
                <span>80 kg</span>
                <span>100 kg</span>
                <span>120 kg</span>
              </div>
            </div>

            {/* BMI-Vergleich */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">
                  <span className="font-semibold">Zum Vergleich:</span> BMI-Normalbereich (18,5-25)
                </span>
                <span className="font-bold text-blue-800">
                  {formatNumber(ergebnis.bmiNormal.min, 0)} – {formatNumber(ergebnis.bmiNormal.max, 0)} kg
                </span>
              </div>
            </div>
          </div>

          {/* Einzelne Formeln */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📐</span>
              Berechnung nach Formel
            </h2>

            <div className="space-y-4">
              {/* Broca */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-purple-800">Broca-Formel</h3>
                    <p className="text-xs text-purple-600">Klassische Formel, einfach</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-800">{formatNumber(ergebnis.broca.ideal, 1)} kg</div>
                    <div className="text-xs text-purple-600">
                      Bereich: {formatNumber(ergebnis.broca.min, 0)} – {formatNumber(ergebnis.broca.max, 0)} kg
                    </div>
                  </div>
                </div>
                <div className="text-xs text-purple-700 bg-purple-100 rounded px-2 py-1">
                  Formel: (Größe - 100) × {geschlecht === 'mann' ? '0,9' : '0,85'} = ({groesse} - 100) × {geschlecht === 'mann' ? '0,9' : '0,85'}
                </div>
              </div>

              {/* Creff */}
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-emerald-800">Creff-Formel</h3>
                    <p className="text-xs text-emerald-600">Berücksichtigt Alter & Körperbau</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-800">{formatNumber(ergebnis.creff.ideal, 1)} kg</div>
                    <div className="text-xs text-emerald-600">
                      Bereich: {formatNumber(ergebnis.creff.min, 0)} – {formatNumber(ergebnis.creff.max, 0)} kg
                    </div>
                  </div>
                </div>
                <div className="text-xs text-emerald-700 bg-emerald-100 rounded px-2 py-1">
                  Formel: (Größe - 100 + Alter/10) × 0,9 × Körperbau-Faktor = ({groesse} - 100 + {alter}/10) × 0,9 × {KOERPERBAU_OPTIONEN.find(k => k.id === koerperbau)?.faktor}
                </div>
              </div>

              {/* Lorentz */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-blue-800">Lorentz-Formel</h3>
                    <p className="text-xs text-blue-600">Geschlechtsspezifisch</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-800">{formatNumber(ergebnis.lorentz.ideal, 1)} kg</div>
                    <div className="text-xs text-blue-600">
                      Bereich: {formatNumber(ergebnis.lorentz.min, 0)} – {formatNumber(ergebnis.lorentz.max, 0)} kg
                    </div>
                  </div>
                </div>
                <div className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
                  Formel: (Größe - 100) - ((Größe - 150) / {geschlecht === 'mann' ? '4' : '2'}) = ({groesse} - 100) - (({groesse} - 150) / {geschlecht === 'mann' ? '4' : '2'})
                </div>
              </div>
            </div>
          </div>

          {/* Übersichtstabelle */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Zusammenfassung
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Formel</th>
                    <th className="text-center py-2 px-2">Minimum</th>
                    <th className="text-center py-2 px-2">Ideal</th>
                    <th className="text-center py-2 px-2">Maximum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                      Broca
                    </td>
                    <td className="text-center py-2 px-2">{formatNumber(ergebnis.broca.min, 1)} kg</td>
                    <td className="text-center py-2 px-2 font-semibold">{formatNumber(ergebnis.broca.ideal, 1)} kg</td>
                    <td className="text-center py-2 px-2">{formatNumber(ergebnis.broca.max, 1)} kg</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                      Creff
                    </td>
                    <td className="text-center py-2 px-2">{formatNumber(ergebnis.creff.min, 1)} kg</td>
                    <td className="text-center py-2 px-2 font-semibold">{formatNumber(ergebnis.creff.ideal, 1)} kg</td>
                    <td className="text-center py-2 px-2">{formatNumber(ergebnis.creff.max, 1)} kg</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      Lorentz
                    </td>
                    <td className="text-center py-2 px-2">{formatNumber(ergebnis.lorentz.min, 1)} kg</td>
                    <td className="text-center py-2 px-2 font-semibold">{formatNumber(ergebnis.lorentz.ideal, 1)} kg</td>
                    <td className="text-center py-2 px-2">{formatNumber(ergebnis.lorentz.max, 1)} kg</td>
                  </tr>
                  <tr className="bg-emerald-50">
                    <td className="py-2 px-2 font-semibold">
                      <span className="inline-block w-3 h-3 bg-emerald-600 rounded-full mr-2"></span>
                      Durchschnitt
                    </td>
                    <td className="text-center py-2 px-2">{formatNumber(ergebnis.gesamt.min, 1)} kg</td>
                    <td className="text-center py-2 px-2 font-bold text-emerald-700">{formatNumber(ergebnis.gesamt.ideal, 1)} kg</td>
                    <td className="text-center py-2 px-2">{formatNumber(ergebnis.gesamt.max, 1)} kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Formeln erklärt */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">ℹ️</span>
              Die Formeln erklärt
            </h2>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="font-semibold text-purple-800 mb-2">📏 Broca-Formel (1871)</h3>
                <p className="text-purple-700 mb-2">
                  Die älteste und einfachste Formel, entwickelt vom französischen Chirurgen Paul Broca.
                </p>
                <ul className="text-purple-700 space-y-1 list-disc list-inside">
                  <li><strong>Männer:</strong> Idealgewicht = (Körpergröße - 100) × 0,9</li>
                  <li><strong>Frauen:</strong> Idealgewicht = (Körpergröße - 100) × 0,85</li>
                </ul>
                <p className="text-purple-600 mt-2 text-xs">
                  ⚠️ Einfach, aber ungenau bei sehr kleinen oder großen Menschen.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <h3 className="font-semibold text-emerald-800 mb-2">🧬 Creff-Formel</h3>
                <p className="text-emerald-700 mb-2">
                  Modernere Formel, die zusätzlich Alter und Körperbau berücksichtigt.
                </p>
                <ul className="text-emerald-700 space-y-1 list-disc list-inside">
                  <li><strong>Formel:</strong> (Größe - 100 + Alter/10) × 0,9 × Körperbau-Faktor</li>
                  <li><strong>Körperbau:</strong> Schlank (0,9), Normal (1,0), Kräftig (1,1)</li>
                </ul>
                <p className="text-emerald-600 mt-2 text-xs">
                  ✅ Berücksichtigt, dass ältere Menschen oft etwas mehr wiegen dürfen.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">⚖️ Lorentz-Formel</h3>
                <p className="text-blue-700 mb-2">
                  Geschlechtsspezifische Formel mit unterschiedlicher Berechnung für Männer und Frauen.
                </p>
                <ul className="text-blue-700 space-y-1 list-disc list-inside">
                  <li><strong>Männer:</strong> (Größe - 100) - ((Größe - 150) / 4)</li>
                  <li><strong>Frauen:</strong> (Größe - 100) - ((Größe - 150) / 2)</li>
                </ul>
                <p className="text-blue-600 mt-2 text-xs">
                  ✅ Gut für mittlere Körpergrößen, weniger genau bei Extremen.
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
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-xl">⚖️</span>
                <p className="text-amber-800">
                  Das <strong>Idealgewicht</strong> ist ein statistischer Richtwert. Ihr tatsächliches gesundes Gewicht 
                  hängt von vielen Faktoren ab: Muskelmasse, Knochenstruktur, Fitness und genetische Veranlagung.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-xl">🏋️</span>
                <p className="text-blue-800">
                  <strong>Sportler</strong> mit viel Muskelmasse können über dem Idealgewicht liegen, 
                  ohne übergewichtig zu sein. Muskeln wiegen mehr als Fett!
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-xl">👴</span>
                <p className="text-green-800">
                  Im <strong>Alter</strong> sind etwas höhere Gewichte oft unbedenklich. 
                  Die Creff-Formel berücksichtigt dies automatisch.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-xl">🩺</span>
                <p className="text-purple-800">
                  Diese Berechnungen ersetzen keine <strong>ärztliche Beratung</strong>. 
                  Bei Fragen zu Ihrem Gewicht konsultieren Sie Ihren Hausarzt.
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

            <div className="space-y-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Welche Formel ist am genauesten?</h3>
                <p className="text-gray-600">
                  Keine Formel ist perfekt. Die <strong>Creff-Formel</strong> gilt als am modernsten, 
                  da sie Alter und Körperbau einbezieht. Der <strong>BMI-Normalbereich</strong> (18,5-25) 
                  wird von der WHO empfohlen und ist medizinisch am relevantesten.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Warum gibt es einen Bereich und nicht ein exaktes Gewicht?</h3>
                <p className="text-gray-600">
                  Menschen sind individuell verschieden. Ein <strong>Bereich von ±10%</strong> um das berechnete 
                  Idealgewicht ist realistischer als ein einzelner Wert. Innerhalb dieses Bereichs sind Sie im grünen Bereich.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Was ist der Unterschied zum BMI?</h3>
                <p className="text-gray-600">
                  Der <strong>BMI</strong> (Body-Mass-Index) ist eine andere Berechnungsmethode: Gewicht ÷ Größe². 
                  Er klassifiziert vorhandenes Gewicht, während <strong>Idealgewicht-Formeln</strong> ein Zielgewicht berechnen. 
                  Beide Ansätze ergänzen sich.
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
                  WHO – Gesundes Körpergewicht
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
                  href="https://www.bzfe.de/ernaehrung/ernaehrungswissen/gesundheit/" 
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
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
