import { useState, useMemo } from 'react';

type BerechnungsArt = 'roi' | 'gewinn' | 'investition';

export default function RentabilitaetRechner() {
  // Eingabewerte
  const [investition, setInvestition] = useState(10000);
  const [gewinn, setGewinn] = useState(2500);
  const [zeitraum, setZeitraum] = useState(1);
  const [zeitraumEinheit, setZeitraumEinheit] = useState<'jahre' | 'monate'>('jahre');
  const [berechnungsArt, setBerechnungsArt] = useState<BerechnungsArt>('roi');
  const [zielRoi, setZielRoi] = useState(10);
  const [zeigeDetails, setZeigeDetails] = useState(false);

  const ergebnis = useMemo(() => {
    // Zeitraum in Jahren normalisieren
    const zeitraumInJahren = zeitraumEinheit === 'monate' ? zeitraum / 12 : zeitraum;
    
    let berechneterGewinn = gewinn;
    let berechneteInvestition = investition;
    let berechneterRoi = 0;
    
    if (berechnungsArt === 'roi') {
      // ROI berechnen: (Gewinn / Investition) * 100
      berechneterRoi = investition > 0 ? (gewinn / investition) * 100 : 0;
    } else if (berechnungsArt === 'gewinn') {
      // Gewinn berechnen: (Ziel-ROI / 100) * Investition
      berechneterGewinn = (zielRoi / 100) * investition;
      berechneterRoi = zielRoi;
    } else if (berechnungsArt === 'investition') {
      // Investition berechnen: Gewinn / (Ziel-ROI / 100)
      berechneteInvestition = zielRoi > 0 ? gewinn / (zielRoi / 100) : 0;
      berechneterRoi = zielRoi;
    }
    
    // Rendite p.a. (annualisiert)
    // Formel: ((Endwert / Anfangswert) ^ (1/Jahre)) - 1
    // Vereinfacht für ROI: ROI / Zeitraum (linear) oder komplexer für Compound
    const endwert = berechneteInvestition + berechneterGewinn;
    const renditePA = zeitraumInJahren > 0 
      ? berechneteInvestition > 0 
        ? (Math.pow(endwert / berechneteInvestition, 1 / zeitraumInJahren) - 1) * 100
        : 0
      : berechneterRoi;
    
    // Einfache lineare Rendite p.a.
    const linearRenditePA = zeitraumInJahren > 0 ? berechneterRoi / zeitraumInJahren : berechneterRoi;
    
    // Kapitalumschlag
    const kapitalumschlag = berechneteInvestition > 0 
      ? berechneterGewinn / berechneteInvestition 
      : 0;
    
    // Amortisationszeit (Break-Even)
    const jahresgewinn = zeitraumInJahren > 0 ? berechneterGewinn / zeitraumInJahren : berechneterGewinn;
    const amortisationszeit = jahresgewinn > 0 ? berechneteInvestition / jahresgewinn : Infinity;
    
    // Gewinnmarge
    const umsatz = berechneteInvestition + berechneterGewinn; // Vereinfacht
    const gewinnmarge = umsatz > 0 ? (berechneterGewinn / umsatz) * 100 : 0;
    
    // ROI-Bewertung
    let bewertung: { text: string; farbe: string; emoji: string };
    if (renditePA >= 15) {
      bewertung = { text: 'Exzellent', farbe: 'text-green-600', emoji: '🚀' };
    } else if (renditePA >= 10) {
      bewertung = { text: 'Sehr gut', farbe: 'text-green-500', emoji: '✨' };
    } else if (renditePA >= 5) {
      bewertung = { text: 'Gut', farbe: 'text-blue-500', emoji: '👍' };
    } else if (renditePA >= 2) {
      bewertung = { text: 'Moderat', farbe: 'text-yellow-500', emoji: '📊' };
    } else if (renditePA >= 0) {
      bewertung = { text: 'Niedrig', farbe: 'text-orange-500', emoji: '⚠️' };
    } else {
      bewertung = { text: 'Verlust', farbe: 'text-red-500', emoji: '❌' };
    }
    
    return {
      investition: berechneteInvestition,
      gewinn: berechneterGewinn,
      zeitraumInJahren,
      roi: berechneterRoi,
      renditePA,
      linearRenditePA,
      kapitalumschlag,
      amortisationszeit,
      gewinnmarge,
      endwert,
      bewertung,
    };
  }, [investition, gewinn, zeitraum, zeitraumEinheit, berechnungsArt, zielRoi]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuroExact = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  const formatZahl = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Visualisierung: Investition vs Gewinn
  const investitionAnteil = ergebnis.endwert > 0 ? (ergebnis.investition / ergebnis.endwert) * 100 : 50;
  const gewinnAnteil = 100 - investitionAnteil;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        
        {/* Berechnungsart */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Was möchtest du berechnen?</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setBerechnungsArt('roi')}
              className={`py-3 px-3 rounded-xl transition-all text-sm ${
                berechnungsArt === 'roi'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">📈 ROI</span>
              <span className="text-xs opacity-80">Rendite ermitteln</span>
            </button>
            <button
              onClick={() => setBerechnungsArt('gewinn')}
              className={`py-3 px-3 rounded-xl transition-all text-sm ${
                berechnungsArt === 'gewinn'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">💰 Gewinn</span>
              <span className="text-xs opacity-80">Nötiger Gewinn</span>
            </button>
            <button
              onClick={() => setBerechnungsArt('investition')}
              className={`py-3 px-3 rounded-xl transition-all text-sm ${
                berechnungsArt === 'investition'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold block">🎯 Investition</span>
              <span className="text-xs opacity-80">Nötiges Kapital</span>
            </button>
          </div>
        </div>

        {/* Investition */}
        {berechnungsArt !== 'investition' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Investitionssumme</span>
              <span className="text-xs text-gray-500 block mt-1">Eingesetztes Kapital</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={investition}
                onChange={(e) => setInvestition(Math.max(0, Number(e.target.value)))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                min="0"
                step="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
            </div>
            <input
              type="range"
              value={investition}
              onChange={(e) => setInvestition(Number(e.target.value))}
              className="w-full mt-3 accent-emerald-500"
              min="0"
              max="100000"
              step="1000"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 €</span>
              <span>50.000 €</span>
              <span>100.000 €</span>
            </div>
          </div>
        )}

        {/* Gewinn */}
        {berechnungsArt !== 'gewinn' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Gewinn / Ertrag</span>
              <span className="text-xs text-gray-500 block mt-1">Nettogewinn aus der Investition</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={gewinn}
                onChange={(e) => setGewinn(Number(e.target.value))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
            </div>
            <input
              type="range"
              value={gewinn}
              onChange={(e) => setGewinn(Number(e.target.value))}
              className="w-full mt-3 accent-emerald-500"
              min="-10000"
              max="50000"
              step="500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span className="text-red-400">-10.000 €</span>
              <span>20.000 €</span>
              <span className="text-green-500">50.000 €</span>
            </div>
          </div>
        )}

        {/* Ziel-ROI für Rückwärtsrechnung */}
        {(berechnungsArt === 'gewinn' || berechnungsArt === 'investition') && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Ziel-ROI</span>
              <span className="text-xs text-gray-500 block mt-1">Gewünschte Rendite</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={zielRoi}
                onChange={(e) => setZielRoi(Math.max(-100, Number(e.target.value)))}
                className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                min="-100"
                max="500"
                step="1"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
            </div>
            <input
              type="range"
              value={zielRoi}
              onChange={(e) => setZielRoi(Number(e.target.value))}
              className="w-full mt-3 accent-emerald-500"
              min="0"
              max="100"
              step="1"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Zeitraum */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Zeitraum der Investition</span>
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="number"
                value={zeitraum}
                onChange={(e) => setZeitraum(Math.max(0.1, Number(e.target.value)))}
                className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                min="0.1"
                max="50"
                step="0.5"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setZeitraumEinheit('jahre')}
                className={`py-3 px-4 rounded-xl transition-all ${
                  zeitraumEinheit === 'jahre'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Jahre
              </button>
              <button
                onClick={() => setZeitraumEinheit('monate')}
                className={`py-3 px-4 rounded-xl transition-all ${
                  zeitraumEinheit === 'monate'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Monate
              </button>
            </div>
          </div>
          <input
            type="range"
            value={zeitraum}
            onChange={(e) => setZeitraum(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min={zeitraumEinheit === 'monate' ? 1 : 0.5}
            max={zeitraumEinheit === 'monate' ? 60 : 10}
            step={zeitraumEinheit === 'monate' ? 1 : 0.5}
          />
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.roi >= 0 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
          : 'bg-gradient-to-br from-red-500 to-orange-600'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium opacity-80">
            {berechnungsArt === 'roi' && '📈 Return on Investment (ROI)'}
            {berechnungsArt === 'gewinn' && '💰 Benötigter Gewinn'}
            {berechnungsArt === 'investition' && '🎯 Benötigte Investition'}
          </h3>
          <span className={`text-sm px-3 py-1 rounded-full bg-white/20 ${ergebnis.bewertung.farbe}`}>
            {ergebnis.bewertung.emoji} {ergebnis.bewertung.text}
          </span>
        </div>

        <div className="mb-4">
          {berechnungsArt === 'roi' && (
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatProzent(ergebnis.roi)}</span>
            </div>
          )}
          {berechnungsArt === 'gewinn' && (
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuro(ergebnis.gewinn)}</span>
            </div>
          )}
          {berechnungsArt === 'investition' && (
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuro(ergebnis.investition)}</span>
            </div>
          )}
          <p className="text-emerald-100 mt-2 text-sm">
            📅 Rendite p.a.: <strong>{formatProzent(ergebnis.renditePA)}</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Investition</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.investition)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gewinn</span>
            <div className={`text-xl font-bold ${ergebnis.gewinn < 0 ? 'text-red-200' : ''}`}>
              {ergebnis.gewinn >= 0 ? '+' : ''}{formatEuro(ergebnis.gewinn)}
            </div>
          </div>
        </div>

        {/* Balkendiagramm Investition vs. Gewinn */}
        {ergebnis.gewinn >= 0 && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between text-sm mb-2">
              <span>Investition: {formatEuro(ergebnis.investition)}</span>
              <span>Gewinn: {formatEuro(ergebnis.gewinn)}</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden bg-white/20 flex">
              <div
                className="bg-white h-full transition-all duration-500"
                style={{ width: `${investitionAnteil}%` }}
              ></div>
              <div
                className="bg-green-300 h-full transition-all duration-500"
                style={{ width: `${gewinnAnteil}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1 opacity-70">
              <span>{investitionAnteil.toFixed(1)}% Kapital</span>
              <span>{gewinnAnteil.toFixed(1)}% Rendite</span>
            </div>
          </div>
        )}
      </div>

      {/* Kennzahlen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">📊 Wichtige Kennzahlen</h3>
          <button
            onClick={() => setZeigeDetails(!zeigeDetails)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              zeigeDetails
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {zeigeDetails ? '▲ Weniger' : '▼ Mehr Details'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-xl p-4">
            <span className="text-sm text-emerald-600">ROI (Gesamt)</span>
            <div className={`text-2xl font-bold ${ergebnis.roi >= 0 ? 'text-emerald-900' : 'text-red-600'}`}>
              {formatProzent(ergebnis.roi)}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <span className="text-sm text-blue-600">Rendite p.a.</span>
            <div className={`text-2xl font-bold ${ergebnis.renditePA >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
              {formatProzent(ergebnis.renditePA)}
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <span className="text-sm text-purple-600">Endkapital</span>
            <div className="text-2xl font-bold text-purple-900">
              {formatEuro(ergebnis.endwert)}
            </div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <span className="text-sm text-orange-600">Amortisation</span>
            <div className="text-2xl font-bold text-orange-900">
              {ergebnis.amortisationszeit === Infinity 
                ? '∞' 
                : `${formatZahl(ergebnis.amortisationszeit)} J.`}
            </div>
          </div>
        </div>

        {zeigeDetails && (
          <div className="mt-4 space-y-3 text-sm border-t pt-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Investitionssumme</span>
              <span className="font-bold text-gray-900">{formatEuroExact(ergebnis.investition)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Gewinn (netto)</span>
              <span className={`font-bold ${ergebnis.gewinn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ergebnis.gewinn >= 0 ? '+' : ''}{formatEuroExact(ergebnis.gewinn)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Zeitraum</span>
              <span className="text-gray-900">
                {ergebnis.zeitraumInJahren.toFixed(2)} Jahre ({(ergebnis.zeitraumInJahren * 12).toFixed(0)} Monate)
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Kapitalumschlag</span>
              <span className="text-gray-900">{formatZahl(ergebnis.kapitalumschlag)}x</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Lineare Rendite p.a.</span>
              <span className="text-gray-900">{formatProzent(ergebnis.linearRenditePA)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Gewinnmarge</span>
              <span className="text-gray-900">{formatProzent(ergebnis.gewinnmarge)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ROI-Formel */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧮 Die ROI-Formel</h3>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-4 font-mono text-center">
          <div className="text-lg">
            ROI = <span className="text-green-600">(Gewinn / Investition)</span> × 100
          </div>
          <div className="text-sm text-gray-500 mt-2">
            = ({formatEuro(ergebnis.gewinn)} / {formatEuro(ergebnis.investition)}) × 100 = <strong>{formatProzent(ergebnis.roi)}</strong>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 font-mono text-center">
          <div className="text-lg">
            Rendite p.a. = <span className="text-blue-600">((Endwert / Anfangswert)^(1/Jahre) - 1)</span> × 100
          </div>
          <div className="text-sm text-gray-500 mt-2">
            = (({formatEuro(ergebnis.endwert)} / {formatEuro(ergebnis.investition)})^(1/{formatZahl(ergebnis.zeitraumInJahren)}) - 1) × 100 = <strong>{formatProzent(ergebnis.renditePA)}</strong>
          </div>
        </div>
      </div>

      {/* Vergleichstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 ROI-Vergleich: Typische Renditen</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-gray-600">Anlageform</th>
                <th className="text-right py-2 text-gray-600">Typ. ROI p.a.</th>
                <th className="text-right py-2 text-gray-600">Risiko</th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b border-gray-100 ${ergebnis.renditePA >= 1 && ergebnis.renditePA < 3 ? 'bg-yellow-50' : ''}`}>
                <td className="py-2">💰 Tagesgeld</td>
                <td className="text-right py-2">1-3%</td>
                <td className="text-right py-2 text-green-600">Niedrig</td>
              </tr>
              <tr className={`border-b border-gray-100 ${ergebnis.renditePA >= 3 && ergebnis.renditePA < 5 ? 'bg-yellow-50' : ''}`}>
                <td className="py-2">📜 Staatsanleihen</td>
                <td className="text-right py-2">3-5%</td>
                <td className="text-right py-2 text-green-600">Niedrig</td>
              </tr>
              <tr className={`border-b border-gray-100 ${ergebnis.renditePA >= 5 && ergebnis.renditePA < 8 ? 'bg-yellow-50' : ''}`}>
                <td className="py-2">📈 ETF (Welt-Index)</td>
                <td className="text-right py-2">5-8%</td>
                <td className="text-right py-2 text-yellow-600">Mittel</td>
              </tr>
              <tr className={`border-b border-gray-100 ${ergebnis.renditePA >= 4 && ergebnis.renditePA < 7 ? 'bg-yellow-50' : ''}`}>
                <td className="py-2">🏠 Immobilien</td>
                <td className="text-right py-2">4-7%</td>
                <td className="text-right py-2 text-yellow-600">Mittel</td>
              </tr>
              <tr className={`border-b border-gray-100 ${ergebnis.renditePA >= 7 && ergebnis.renditePA < 12 ? 'bg-yellow-50' : ''}`}>
                <td className="py-2">📊 Aktien (Einzelwerte)</td>
                <td className="text-right py-2">7-12%</td>
                <td className="text-right py-2 text-orange-600">Hoch</td>
              </tr>
              <tr className={`border-b border-gray-100 ${ergebnis.renditePA >= 15 ? 'bg-yellow-50' : ''}`}>
                <td className="py-2">🚀 Startups / VC</td>
                <td className="text-right py-2">15-30%+</td>
                <td className="text-right py-2 text-red-600">Sehr hoch</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          * Durchschnittswerte, tatsächliche Renditen können stark abweichen. Vergangene Performance ist keine Garantie für zukünftige Ergebnisse.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Was ist der ROI?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>📈</span>
            <span>
              <strong>Return on Investment (ROI):</strong> Eine Kennzahl, die das Verhältnis zwischen Gewinn 
              und eingesetztem Kapital misst. Sie zeigt, wie profitabel eine Investition ist.
            </span>
          </li>
          <li className="flex gap-2">
            <span>📅</span>
            <span>
              <strong>Rendite p.a.:</strong> Die annualisierte Rendite berücksichtigt den Zeitraum und macht 
              unterschiedlich lange Investitionen vergleichbar.
            </span>
          </li>
          <li className="flex gap-2">
            <span>⏱️</span>
            <span>
              <strong>Amortisationszeit:</strong> Die Zeit, bis die Investition durch die Gewinne wieder 
              eingespielt ist (Break-Even-Point).
            </span>
          </li>
          <li className="flex gap-2">
            <span>💡</span>
            <span>
              <strong>Kapitalumschlag:</strong> Zeigt, wie oft das eingesetzte Kapital durch den Gewinn 
              „umgeschlagen" wird.
            </span>
          </li>
        </ul>
      </div>

      {/* Anwendungsbeispiele */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💡 Anwendungsbeispiele</h3>
        <ul className="space-y-3 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>🏪</span>
            <span>
              <strong>Geschäftsinvestition:</strong> Ein Café investiert 50.000€ in eine neue Espressomaschine 
              und erzielt dadurch 8.000€ mehr Gewinn pro Jahr → ROI p.a. = 16%
            </span>
          </li>
          <li className="flex gap-2">
            <span>📱</span>
            <span>
              <strong>Marketing-Kampagne:</strong> 5.000€ Werbebudget bringt 12.000€ zusätzlichen Umsatz 
              (7.000€ Gewinn nach Kosten) → ROI = 140%
            </span>
          </li>
          <li className="flex gap-2">
            <span>🎓</span>
            <span>
              <strong>Weiterbildung:</strong> 3.000€ Kursgebühren führen zu 500€ höherem Monatsgehalt 
              → Amortisation nach 6 Monaten, dann ROI steigt unbegrenzt
            </span>
          </li>
          <li className="flex gap-2">
            <span>🏠</span>
            <span>
              <strong>Immobilien:</strong> 200.000€ Kaufpreis, 12.000€ Jahresmiete (nach Kosten) 
              → ROI = 6% p.a. (ohne Wertsteigerung)
            </span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Steuern beachten:</strong> Der ROI zeigt die Bruttorendite. Nach Abzug von 
              Kapitalertragsteuer (25% + Soli) ist die Nettorendite geringer.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Inflation:</strong> Bei 2% Inflation ist eine 2%-Rendite real ein Nullsummenspiel. 
              Real-ROI = Nominal-ROI - Inflation.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Risiko vs. Rendite:</strong> Höhere erwartete Renditen gehen meist mit höherem 
              Risiko einher. Diversifikation reduziert Risiken.
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Opportunitätskosten:</strong> Vergleiche den ROI mit alternativen Anlagemöglichkeiten. 
              Was bringt das Geld anderswo?
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Nicht-monetäre Faktoren:</strong> Manche Investitionen (Gesundheit, Bildung, Zeit) 
              haben Werte, die sich nicht in ROI messen lassen.
            </span>
          </li>
        </ul>
      </div>

      {/* Erweiterte Kennzahlen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📚 Verwandte Kennzahlen</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📊</span>
            <div>
              <p className="font-medium text-gray-800">ROCE (Return on Capital Employed)</p>
              <p className="text-sm text-gray-600">
                EBIT geteilt durch das eingesetzte Kapital – zeigt die operative Rentabilität.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">💵</span>
            <div>
              <p className="font-medium text-gray-800">ROE (Return on Equity)</p>
              <p className="text-sm text-gray-600">
                Eigenkapitalrendite – Gewinn geteilt durch Eigenkapital. Wichtig für Aktionäre.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🏦</span>
            <div>
              <p className="font-medium text-gray-800">ROA (Return on Assets)</p>
              <p className="text-sm text-gray-600">
                Gesamtkapitalrendite – Gewinn geteilt durch Gesamtvermögen.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📈</span>
            <div>
              <p className="font-medium text-gray-800">IRR (Internal Rate of Return)</p>
              <p className="text-sm text-gray-600">
                Interner Zinsfuß – berücksichtigt Zeitpunkt von Cashflows. Komplexer, aber präziser.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & weiterführende Informationen</h4>
        <div className="space-y-1">
          <a
            href="https://www.investopedia.com/terms/r/returnoninvestment.asp"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Investopedia – Return on Investment (ROI)
          </a>
          <a
            href="https://www.ihk.de/blueprint/servlet/resource/blob/5434424/fa1e169e5e0b3b9d3d07c5c48a9a5d18/kennzahlen-im-unternehmen-data.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            IHK – Kennzahlen im Unternehmen
          </a>
          <a
            href="https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesbank – Aktuelle Zinssätze und Renditen
          </a>
          <a
            href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/geldanlage"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Verbraucherzentrale – Geldanlage
          </a>
        </div>
      </div>
    </div>
  );
}
