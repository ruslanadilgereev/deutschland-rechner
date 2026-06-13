import { useState, useMemo } from 'react';

// Längen-Einheiten (Faktor auf Meter) – identisch zur Referenz EinheitenRechner
const EINHEITEN = [
  { id: 'mm', name: 'Millimeter', kurz: 'mm', faktor: 0.001 },
  { id: 'cm', name: 'Zentimeter', kurz: 'cm', faktor: 0.01 },
  { id: 'm', name: 'Meter', kurz: 'm', faktor: 1 },
  { id: 'km', name: 'Kilometer', kurz: 'km', faktor: 1000 },
];

// Modellbau-Nenngrößen nach MOROP NEM 010 (Ausgabe 2011), Tabelle 1
const MODELL_PRESETS = [
  { label: 'Spur Z', n: 220 },
  { label: 'Spur N', n: 160 },
  { label: 'Spur TT', n: 120 },
  { label: 'Spur H0', n: 87 },
  { label: 'Spur 0', n: 45 },
  { label: 'Spur 1', n: 32 },
];

// Amtliche deutsche topografische Kartenwerke (BKG / Landesvermessung)
const KARTEN_PRESETS = [
  { label: 'TK10 (1:10.000)', n: 10000 },
  { label: 'TK25 (1:25.000)', n: 25000 },
  { label: 'TK50 (1:50.000)', n: 50000 },
  { label: 'TK100 (1:100.000)', n: 100000 },
  { label: 'Stadtplan (1:20.000)', n: 20000 },
];

// Technische/Bau-Maßstäbe nach DIN ISO 5455 (nur Info, keine Berechnung)
const DIN_VERGROESSERUNG = ['50:1', '20:1', '10:1', '5:1', '2:1'];
const DIN_VERKLEINERUNG = [
  '1:2', '1:5', '1:10', '1:20', '1:50', '1:100',
  '1:200', '1:500', '1:1000', '1:2000', '1:5000', '1:10000',
];

type Modus = 'planReal' | 'realPlan' | 'ermitteln';

export default function MassstabRechner() {
  const [modus, setModus] = useState<Modus>('planReal');

  // Maßstabszahl n (für planReal / realPlan)
  const [massstab, setMassstab] = useState(87);

  // Plan-Länge (Eingabe)
  const [planWert, setPlanWert] = useState(8);
  const [planEinheit, setPlanEinheit] = useState('cm');

  // Reale Länge (Eingabe)
  const [realWert, setRealWert] = useState(18);
  const [realEinheit, setRealEinheit] = useState('m');

  // Zieleinheit für das berechnete Ergebnis
  const [zielEinheit, setZielEinheit] = useState('m');

  const formatNumber = (n: number) => {
    if (Math.abs(n) >= 1000000 || (Math.abs(n) < 0.0001 && n !== 0)) {
      return n.toExponential(4);
    }
    return n.toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  const faktor = (id: string) => EINHEITEN.find((e) => e.id === id)?.faktor ?? 1;
  const kurz = (id: string) => EINHEITEN.find((e) => e.id === id)?.kurz ?? '';

  const ergebnis = useMemo(() => {
    if (modus === 'planReal') {
      // realeLänge = planLänge × n
      const planMeter = planWert * faktor(planEinheit);
      const realMeter = planMeter * massstab;
      return realMeter / faktor(zielEinheit);
    }
    if (modus === 'realPlan') {
      // planLänge = realeLänge ÷ n
      if (massstab === 0) return 0;
      const realMeter = realWert * faktor(realEinheit);
      const planMeter = realMeter / massstab;
      return planMeter / faktor(zielEinheit);
    }
    // ermitteln: n = realeLänge ÷ planLänge (beide in Meter)
    const realMeter = realWert * faktor(realEinheit);
    const planMeter = planWert * faktor(planEinheit);
    if (planMeter === 0) return 0;
    return realMeter / planMeter;
  }, [modus, massstab, planWert, planEinheit, realWert, realEinheit, zielEinheit]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Modus-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-gray-700 font-medium mb-3">Was möchtest du berechnen?</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setModus('planReal')}
            className={`p-3 rounded-xl border-2 transition-all text-center ${
              modus === 'planReal'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">🗺️</div>
            <div className="text-xs font-medium">Plan → Real</div>
          </button>
          <button
            onClick={() => setModus('realPlan')}
            className={`p-3 rounded-xl border-2 transition-all text-center ${
              modus === 'realPlan'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">📐</div>
            <div className="text-xs font-medium">Real → Plan</div>
          </button>
          <button
            onClick={() => setModus('ermitteln')}
            className={`p-3 rounded-xl border-2 transition-all text-center ${
              modus === 'ermitteln'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">🔍</div>
            <div className="text-xs font-medium">Maßstab ermitteln</div>
          </button>
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Maßstab-Eingabe (nur planReal / realPlan) */}
        {modus !== 'ermitteln' && (
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Maßstab</label>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-700">1 :</span>
              <input
                type="number"
                value={massstab}
                onChange={(e) => setMassstab(parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                step="any"
                min="0"
              />
            </div>

            {/* Modellbau-Presets */}
            <div className="mt-4">
              <div className="text-xs font-bold text-gray-500 uppercase mb-2">Modellbau (NEM 010)</div>
              <div className="flex flex-wrap gap-2">
                {MODELL_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setMassstab(p.n)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      massstab === p.n
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {p.label} <span className="text-gray-400">1:{p.n}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Karten-Presets */}
            <div className="mt-4">
              <div className="text-xs font-bold text-gray-500 uppercase mb-2">Karten (TK / Stadtplan)</div>
              <div className="flex flex-wrap gap-2">
                {KARTEN_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setMassstab(p.n)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                      massstab === p.n
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Plan-Länge (planReal + ermitteln) */}
        {(modus === 'planReal' || modus === 'ermitteln') && (
          <label className="block mb-5">
            <span className="text-gray-700 font-medium">Länge auf dem Plan / der Karte</span>
            <div className="mt-2 flex gap-3">
              <input
                type="number"
                value={planWert}
                onChange={(e) => setPlanWert(parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                step="any"
                min="0"
              />
              <select
                value={planEinheit}
                onChange={(e) => setPlanEinheit(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium bg-white"
              >
                {EINHEITEN.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.kurz})
                  </option>
                ))}
              </select>
            </div>
          </label>
        )}

        {/* Reale Länge (realPlan + ermitteln) */}
        {(modus === 'realPlan' || modus === 'ermitteln') && (
          <label className="block mb-5">
            <span className="text-gray-700 font-medium">Reale Länge (Wirklichkeit)</span>
            <div className="mt-2 flex gap-3">
              <input
                type="number"
                value={realWert}
                onChange={(e) => setRealWert(parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-3 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                step="any"
                min="0"
              />
              <select
                value={realEinheit}
                onChange={(e) => setRealEinheit(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium bg-white"
              >
                {EINHEITEN.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.kurz})
                  </option>
                ))}
              </select>
            </div>
          </label>
        )}

        {/* Zieleinheit (planReal + realPlan) */}
        {modus !== 'ermitteln' && (
          <label className="block">
            <span className="text-sm text-gray-500">Ergebnis anzeigen in</span>
            <select
              value={zielEinheit}
              onChange={(e) => setZielEinheit(e.target.value)}
              className="mt-1 w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium bg-white"
            >
              {EINHEITEN.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.kurz})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-white/80 mb-2">Ergebnis</h3>

        {modus === 'ermitteln' ? (
          <>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl sm:text-5xl font-bold">
                1 : {formatNumber(Math.round(ergebnis))}
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-sm text-white/80 mb-1">Berechnung</div>
              <div className="font-medium">
                {formatNumber(realWert)} {kurz(realEinheit)} ÷ {formatNumber(planWert)}{' '}
                {kurz(planEinheit)} → Maßstab 1 : {formatNumber(Math.round(ergebnis))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl sm:text-5xl font-bold">{formatNumber(ergebnis)}</span>
              <span className="text-xl text-white/90">{kurz(zielEinheit)}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-sm text-white/80 mb-1">Berechnung</div>
              <div className="font-medium">
                {modus === 'planReal' ? (
                  <>
                    {formatNumber(planWert)} {kurz(planEinheit)} × {formatNumber(massstab)} ={' '}
                    {formatNumber(ergebnis)} {kurz(zielEinheit)}
                  </>
                ) : (
                  <>
                    {formatNumber(realWert)} {kurz(realEinheit)} ÷ {formatNumber(massstab)} ={' '}
                    {formatNumber(ergebnis)} {kurz(zielEinheit)}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Technische Maßstäbe (Info, DIN ISO 5455) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Genormte Maßstäbe (DIN ISO 5455)</h3>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-orange-50 rounded-xl">
            <p className="font-semibold text-orange-800 mb-2">Vergrößerung</p>
            <p className="text-orange-700">{DIN_VERGROESSERUNG.join(' · ')}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Natürlicher Maßstab</p>
            <p className="text-gray-600">1:1</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="font-semibold text-blue-800 mb-2">Verkleinerung</p>
            <p className="text-blue-700">{DIN_VERKLEINERUNG.join(' · ')}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          In Bauzeichnungen üblich (DIN 1356-1): 1:50 Ausführungszeichnung, 1:100 Entwurf,
          1:200/1:500 Lageplan, 1:1000 Übersichtsplan.
        </p>
      </div>

      {/* Formel-Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📐 Maßstab-Formeln</h3>
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-700 mb-2">Bei Maßstab 1:n gilt:</p>
            <code className="block bg-gray-100 p-3 rounded text-gray-800 font-mono text-xs space-y-1">
              <span className="block">reale Länge = Plan-Länge × n</span>
              <span className="block">Plan-Länge = reale Länge ÷ n</span>
              <span className="block">n = reale Länge ÷ Plan-Länge (gleiche Einheit)</span>
            </code>
          </div>
          <p className="text-gray-600">
            Wichtig: Vor dem Rechnen beide Längen in dieselbe Einheit bringen. Der Längenmaßstab
            gilt nur für Strecken – Flächen skalieren mit n², Volumen mit n³.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <p>
          <strong>Hinweis:</strong> Schätzung / Hilfsrechner – keine Steuer- oder Rechtsberatung.
          Der Maßstab-Rechner basiert auf reiner Verhältnisrechnung (1:n). Normmaßstäbe (DIN ISO
          5455 für technische Zeichnungen, MOROP NEM 010 für Modelleisenbahn-Nenngrößen) dienen
          nur der Orientierung. Der Längenmaßstab gilt ausschließlich für Strecken – Flächen
          skalieren mit n², Volumen mit n³. Karten können projektionsbedingt geringfügig verzerrt
          sein; Druck-/Bildschirmskalierung kann gemessene Plan-Längen verfälschen.
        </p>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.morop.org/downloads/nem/de/nem010_d.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            MOROP NEM 010 – Maßstäbe, Nenngrößen, Spurweiten (Ausgabe 2011)
          </a>
          <a
            href="https://www.dinmedia.de/de/norm/din-iso-5455/790721"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DIN ISO 5455:1979-12 – Technische Zeichnungen; Maßstäbe
          </a>
        </div>
      </div>
    </div>
  );
}
