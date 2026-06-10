import { useState } from 'react';

// Ziel-U-Werte: GEG-Höchstwerte (Anlage 7, Sanierung) und strengere BEG-Förderwerte.
type ZielPreset = { id: string; name: string; u: number };
const ZIELE: ZielPreset[] = [
  { id: 'geg-wand', name: 'GEG Außenwand (0,24)', u: 0.24 },
  { id: 'geg-dach', name: 'GEG Dach / Decke (0,24)', u: 0.24 },
  { id: 'geg-keller', name: 'GEG Kellerdecke (0,30)', u: 0.30 },
  { id: 'beg-wand', name: 'BEG-Förderung Wand (0,20)', u: 0.20 },
  { id: 'frei', name: 'Freier Ziel-U-Wert', u: 0.24 },
];

// Dämmstoffe mit typischer Wärmeleitfähigkeit λ in W/(m·K).
const DAEMMSTOFFE: { id: string; name: string; icon: string; lambda: number }[] = [
  { id: 'mineralwolle', name: 'Mineralwolle 035', icon: '🧶', lambda: 0.035 },
  { id: 'eps', name: 'EPS 035', icon: '⬜', lambda: 0.035 },
  { id: 'pur', name: 'PUR/PIR 024', icon: '🟨', lambda: 0.024 },
  { id: 'holzfaser', name: 'Holzfaser 040', icon: '🪵', lambda: 0.040 },
];

export function DaemmungRechner() {
  const [zielId, setZielId] = useState('geg-wand');
  const [freierU, setFreierU] = useState(0.24);
  const [bestandU, setBestandU] = useState(1.0);
  const [daemmId, setDaemmId] = useState('mineralwolle');
  const [lambda, setLambda] = useState(0.035);
  const [flaeche, setFlaeche] = useState(100);
  const [verschnitt, setVerschnitt] = useState(7);

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const ziel = ZIELE.find((z) => z.id === zielId)!;
  const uZiel = zielId === 'frei' ? freierU : ziel.u;

  const handleDaemm = (id: string) => {
    setDaemmId(id);
    const d = DAEMMSTOFFE.find((x) => x.id === id)!;
    setLambda(d.lambda);
  };

  // R_soll = 1/U_ziel ; R_vorh = 1/U_bestand (inkl. Übergangswiderstände)
  const rSoll = uZiel > 0 ? 1 / uZiel : 0;
  const rVorh = bestandU > 0 ? 1 / bestandU : 0;
  const deltaR = Math.max(0, rSoll - rVorh);
  const dDaemmM = lambda * deltaR; // in Metern
  const dDaemmCm = dDaemmM * 100;

  // Mengen
  const plattenFlaeche = flaeche * (1 + verschnitt / 100);
  const volumenM3 = flaeche * dDaemmM;

  // erreichbarer U-Wert mit gerundeter, marktüblicher Dicke (auf nächste 20 mm aufgerundet)
  const dRundCm = Math.ceil(dDaemmCm / 2) * 2;
  const rNeu = rVorh + (dRundCm / 100) / (lambda > 0 ? lambda : 1);
  const uNeu = rNeu > 0 ? 1 / rNeu : 0;

  const fmt = (v: number, max = 1) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });
  const fmt3 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 3 });

  const erreichbar = deltaR > 0;

  return (
    <div className="max-w-lg mx-auto">

      {/* Ziel-U-Wert */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Ziel-U-Wert</span>
        <div className="grid grid-cols-1 gap-2">
          {ZIELE.map((z) => (
            <button
              key={z.id}
              onClick={() => setZielId(z.id)}
              className={`p-3 rounded-xl border text-sm font-medium text-left transition-all active:scale-95 ${
                zielId === z.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {z.name}
            </button>
          ))}
        </div>
        {zielId === 'frei' && (
          <label className="block mt-3">
            <span className="text-sm text-gray-600">Ziel-U-Wert in W/(m²K)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={freierU}
              onChange={(e) => setFreierU(toNumber(e.target.value))}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        )}
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">U-Wert der Bestandskonstruktion</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.05}
              value={bestandU}
              onChange={(e) => setBestandU(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">W/(m²K)</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Vorhandener U-Wert ohne neue Dämmung. Richtwerte: ungedämmte Wand ~1,0–1,5; Altbau mit dünner Dämmung ~0,5.
            Den genauen Wert liefert der <a href="/u-wert-rechner" className="text-blue-600 underline">U-Wert-Rechner</a>.
          </span>
        </label>

        {/* Dämmstoff */}
        <div>
          <span className="text-gray-700 font-medium block mb-2">Dämmstoff</span>
          <div className="grid grid-cols-2 gap-2">
            {DAEMMSTOFFE.map((d) => (
              <button
                key={d.id}
                onClick={() => handleDaemm(d.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                  daemmId === d.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{d.icon}</span>
                <span className="text-left leading-tight">{d.name}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Wärmeleitfähigkeit λ</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.001}
              value={lambda}
              onChange={(e) => setLambda(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">W/m·K</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Zu dämmende Fläche</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={flaeche}
              onChange={(e) => setFlaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Verschnitt</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={30}
              step={1}
              value={verschnitt}
              onChange={(e) => setVerschnitt(Math.min(30, toNumber(e.target.value)))}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Dämmstärke</h3>

        {erreichbar ? (
          <>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{fmt(dDaemmCm)}</span>
                <span className="text-xl text-blue-200">cm</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">
                marktüblich aufgerundet: {fmt(dRundCm, 0)} cm → U ≈ {fmt3(uNeu)} W/(m²K)
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Dämmplatten / -matten</span>
                  <span className="font-bold">{fmt(plattenFlaeche)} m² (inkl. {fmt(verschnitt, 0)} %)</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Dämmvolumen</span>
                  <span className="font-bold">{fmt(volumenM3, 2)} m³</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-blue-50">
            Der Bestand erreicht den Ziel-U-Wert bereits – es ist rechnerisch keine zusätzliche
            Dämmung nötig. Prüfen Sie den eingegebenen Bestands-U-Wert.
          </p>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>R-Bedarf</strong> = 1/U_ziel − 1/U_bestand = 1/{fmt(uZiel, 2)} − 1/{fmt(bestandU, 2)} ={' '}
            <strong>{fmt3(deltaR)} m²K/W</strong>
          </p>
          <p>
            <strong>Dämmstärke</strong> = λ × R-Bedarf = {fmt3(lambda)} × {fmt3(deltaR)} ={' '}
            <strong>{fmt3(dDaemmM)} m = {fmt(dDaemmCm)} cm</strong>
          </p>
          <p>
            <strong>Volumen</strong> = {fmt(flaeche)} m² × {fmt3(dDaemmM)} m = <strong>{fmt(volumenM3, 2)} m³</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Der Rechner liefert eine vereinfachte Orientierung nach
          DIN EN ISO 6946. Wärmebrücken, Feuchteschutz (Tauwasser/Glaser), exakte Schichtaufbauten und
          die rechtssichere GEG- bzw. Förderfähigkeits-Prüfung erfordern einen Energieberater oder
          Fachplaner. Keine Gewähr für Förderfähigkeit oder GEG-Konformität.
        </p>
      </div>
    </div>
  );
}

export default DaemmungRechner;
