import { useState, useMemo } from 'react';

// WHO Expert Consultation 2008 — Cut-off "substantially increased risk of metabolic complications"
const WHR_CUTOFF = { mann: 0.90, frau: 0.85 };

// Taillenumfang als zweites WHO-Maß (WHO 2008, Europide) — nur Info-Box
const TAILLE_CUTOFF = {
  mann: { erhoeht: 94, deutlich: 102 },
  frau: { erhoeht: 80, deutlich: 88 },
};

export default function WhrRechner() {
  const [geschlecht, setGeschlecht] = useState<'mann' | 'frau'>('mann');
  const [taille, setTaille] = useState<number>(85);
  const [huefte, setHuefte] = useState<number>(100);
  const [berechnet, setBerechnet] = useState(false);

  const ergebnis = useMemo(() => {
    // Validierung
    if (!taille || taille < 40 || taille > 200) return null;
    if (!huefte || huefte < 50 || huefte > 200) return null;
    if (huefte <= 0) return null;

    const whr = taille / huefte;

    // Unrealistische Werte abfangen
    if (whr < 0.5 || whr > 1.5 || isNaN(whr)) return null;

    const cutoff = WHR_CUTOFF[geschlecht];
    const erhoeht = whr >= cutoff;

    const kategorie = erhoeht ? 'Erhöhtes Risiko' : 'Niedriges Risiko';
    const farbe = erhoeht ? 'bg-red-600' : 'bg-green-500';
    const textFarbe = erhoeht ? 'text-red-700' : 'text-green-700';
    const hinweis = erhoeht
      ? 'Ab/über dem WHO-Schwellenwert – substanziell erhöhtes Risiko für metabolische Komplikationen (z.B. Typ-2-Diabetes, Herz-Kreislauf-Erkrankungen).'
      : 'Unter dem WHO-Schwellenwert – relativ niedriges viszerales (Bauch-)Fett.';

    // Apfel-/Birnentyp (Erklärtext, allgemein anerkannt)
    const koerperform = erhoeht ? 'Apfeltyp (androide Fettverteilung)' : 'Birnentyp (gynoide Fettverteilung)';

    // Taillenumfang als zweites WHO-Maß
    const t = TAILLE_CUTOFF[geschlecht];
    let tailleKategorie: string;
    let tailleFarbe: string;
    if (taille >= t.deutlich) {
      tailleKategorie = 'Deutlich erhöht';
      tailleFarbe = 'text-red-700';
    } else if (taille >= t.erhoeht) {
      tailleKategorie = 'Erhöht';
      tailleFarbe = 'text-orange-700';
    } else {
      tailleKategorie = 'Unauffällig';
      tailleFarbe = 'text-green-700';
    }

    return {
      whr,
      cutoff,
      erhoeht,
      kategorie,
      farbe,
      textFarbe,
      hinweis,
      koerperform,
      tailleKategorie,
      tailleFarbe,
      tailleErhoeht: t.erhoeht,
      tailleDeutlich: t.deutlich,
    };
  }, [geschlecht, taille, huefte]);

  const formatNumber = (n: number, decimals = 2) => n.toFixed(decimals).replace('.', ',');

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  // WHR-Skala Position (Skala 0,60–1,10)
  const getWHRPosition = (whr: number) => {
    const min = 0.6;
    const max = 1.1;
    const position = ((whr - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  // Position des Geschlechts-Cut-offs auf derselben Skala
  const getCutoffPosition = (cutoff: number) => {
    const min = 0.6;
    const max = 1.1;
    const position = ((cutoff - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📏</span>
          Ihre Maße eingeben
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

          {/* Taillenumfang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taillenumfang (cm)
              <span className="text-gray-400 text-xs ml-2">In der Mitte zwischen unterer Rippe und Beckenkamm messen</span>
            </label>
            <input
              type="number"
              value={taille}
              onChange={(e) => setTaille(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
              placeholder="z.B. 85"
              min={40}
              max={200}
              step={0.5}
            />
          </div>

          {/* Hüftumfang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hüftumfang (cm)
              <span className="text-gray-400 text-xs ml-2">An der breitesten Stelle des Gesäßes messen</span>
            </label>
            <input
              type="number"
              value={huefte}
              onChange={(e) => setHuefte(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
              placeholder="z.B. 100"
              min={50}
              max={200}
              step={0.5}
            />
          </div>

          <button
            onClick={handleBerechnen}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
          >
            Taille-Hüft-Verhältnis berechnen
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
              Ihr Taille-Hüft-Verhältnis (WHR)
            </h2>

            {/* WHR-Wert groß anzeigen */}
            <div className="text-center mb-6">
              <div className={`inline-block px-8 py-4 rounded-2xl ${ergebnis.farbe} text-white`}>
                <div className="text-5xl font-bold">{formatNumber(ergebnis.whr)}</div>
                <div className="text-sm opacity-90">WHR (Taille ÷ Hüfte)</div>
              </div>
              <div className={`mt-3 text-lg font-semibold ${ergebnis.textFarbe}`}>
                {ergebnis.kategorie}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {ergebnis.koerperform}
              </div>
            </div>

            {/* WHR-Skala */}
            <div className="mb-6">
              <div className="relative h-8 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-green-500" title="Niedriges Risiko"></div>
                <div className="flex-1 bg-red-600" title="Erhöhtes Risiko"></div>
              </div>
              {/* Marker für eigenen Wert + Cut-off */}
              <div className="relative h-4">
                {/* Cut-off-Linie */}
                <div
                  className="absolute -top-9 w-0.5 h-8 bg-gray-700"
                  style={{ left: `${getCutoffPosition(ergebnis.cutoff)}%` }}
                  title={`WHO-Schwelle ${formatNumber(ergebnis.cutoff)}`}
                />
                {/* eigener Wert */}
                <div
                  className="absolute -top-1 w-4 h-4 bg-gray-900 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2"
                  style={{ left: `${getWHRPosition(ergebnis.whr)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0,60</span>
                <span>0,70</span>
                <span>0,80</span>
                <span>0,90</span>
                <span>1,00</span>
                <span>1,10</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                WHO-Schwellenwert für {geschlecht === 'mann' ? 'Männer' : 'Frauen'}:{' '}
                <strong>{formatNumber(ergebnis.cutoff)}</strong> (graue Linie)
              </p>
            </div>

            {/* Bewertung */}
            <div className={`p-4 rounded-lg ${ergebnis.erhoeht ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
              <p className={ergebnis.erhoeht ? 'text-amber-800' : 'text-green-800'}>
                {ergebnis.hinweis}
              </p>
            </div>
          </div>

          {/* WHO-Schwellenwerte WHR */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              WHO-Schwellenwerte (WHR)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2">Geschlecht</th>
                    <th className="text-center py-2 px-2">Substanziell erhöhtes Risiko ab</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b border-gray-100 ${geschlecht === 'mann' ? 'bg-orange-50' : ''}`}>
                    <td className="py-2 px-2 font-medium">Mann</td>
                    <td className="text-center py-2 px-2">WHR ≥ 0,90</td>
                  </tr>
                  <tr className={`border-b border-gray-100 ${geschlecht === 'frau' ? 'bg-orange-50' : ''}`}>
                    <td className="py-2 px-2 font-medium">Frau</td>
                    <td className="text-center py-2 px-2">WHR ≥ 0,85</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Quelle: WHO Expert Consultation „Waist Circumference and Waist–Hip Ratio" (2008,
              Bericht 2011). Unterhalb des Cut-offs gilt das viszerale Fett als relativ niedrig,
              ab dem Cut-off als substanziell erhöht.
            </p>
          </div>

          {/* Taillenumfang als zweites WHO-Maß */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📐</span>
              Ihr Taillenumfang als zweites WHO-Maß
            </h2>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Ihr Taillenumfang</span>
                <span className="font-bold text-gray-800">{formatNumber(taille, 1)} cm</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Einstufung</span>
                <span className={`font-semibold ${ergebnis.tailleFarbe}`}>{ergebnis.tailleKategorie}</span>
              </div>
              <p className="text-gray-600">
                Die WHO nennt für den reinen Taillenumfang ({geschlecht === 'mann' ? 'Männer' : 'Frauen'}, Europide)
                zwei Schwellen: erhöhtes Risiko ab <strong>{ergebnis.tailleErhoeht} cm</strong>,
                deutlich/substanziell erhöht ab <strong>{ergebnis.tailleDeutlich} cm</strong>. Dieser Wert ist
                ergänzend zur WHR und fließt nicht in die WHR-Berechnung ein.
              </p>
            </div>
          </div>

          {/* Mess-Anleitung */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📐</span>
              Richtig messen
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-xl">🎯</span>
                <div>
                  <strong className="text-green-800">Taillenumfang</strong>
                  <p className="text-green-700">In der Mitte zwischen der unteren Rippenbogenkante und der Oberkante des Beckenkamms (alternativ auf Höhe des Bauchnabels). Nicht einziehen, entspannt nach dem normalen Ausatmen messen.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
                <span className="text-xl">🎯</span>
                <div>
                  <strong className="text-pink-800">Hüftumfang</strong>
                  <p className="text-pink-700">An der breitesten Stelle des Gesäßes messen. Beine zusammen, entspannt stehen, Maßband waagerecht halten.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="text-xl">💡</span>
                <div>
                  <strong className="text-amber-800">Tipp für genaue Messung</strong>
                  <p className="text-amber-700">
                    Maßband straff, aber ohne einzudrücken. Idealerweise morgens nüchtern und immer
                    zur gleichen Tageszeit messen – so sind die Werte über die Zeit vergleichbar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info-Box Apfel/Birne */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🍎</span>
              Apfeltyp oder Birnentyp?
            </h2>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <h3 className="font-semibold text-red-800 mb-2">🍎 Apfeltyp (hohe WHR)</h3>
                <p className="text-red-700">
                  Viel Bauchumfang relativ zur Hüfte = androide/abdominale Fettverteilung. Das
                  viszerale Bauchfett gilt als metabolisch ungünstiger und ist mit einem höheren
                  Risiko für Typ-2-Diabetes und Herz-Kreislauf-Erkrankungen verbunden.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-semibold text-green-800 mb-2">🍐 Birnentyp (niedrige WHR)</h3>
                <p className="text-green-700">
                  Betonung von Hüfte und Gesäß = gynoide Fettverteilung. Diese Fettverteilung gilt
                  als metabolisch günstiger als die abdominale.
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
                  Der WHR ist ein <strong>Screening-Maß</strong>, kein klinischer Diagnose-Score.
                  Er liefert eine Orientierung und ersetzt keine ärztliche Diagnose.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">🌍</span>
                <p className="text-gray-600">
                  Die WHO-Cut-offs sind <strong>populationsabhängig</strong> und berücksichtigen
                  weder Alter noch ethnische Herkunft. Sie wurden überwiegend an europiden Populationen abgeleitet.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">📈</span>
                <p className="text-gray-600">
                  Der WHR sagt etwas über die <strong>Fettverteilung</strong> aus, nicht über die
                  Gesamt-Fettmenge. Für den Körperfettanteil eignet sich z.B. die Navy-Methode.
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
                  href="https://iris.who.int/handle/10665/44583"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline flex items-center gap-1"
                >
                  WHO – Waist Circumference and Waist–Hip Ratio (Report of a WHO Expert Consultation, 2008/2011)
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://wkc.who.int/resources/publications/i/item/9789241501491"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline flex items-center gap-1"
                >
                  WHO – Publikation ISBN 9789241501491
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
                  className="text-orange-600 hover:underline flex items-center gap-1"
                >
                  WHO – Obesity and Overweight
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>

            <p className="text-xs text-gray-400 mt-4">
              Schätzung – keine Steuer-/Rechtsberatung und keine ärztliche Diagnose. Bei
              gesundheitlichen Fragen wenden Sie sich an Ihren Arzt oder Ihre Ärztin.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
