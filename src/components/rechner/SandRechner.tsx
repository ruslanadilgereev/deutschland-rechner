import { useState } from 'react';

// Anwendungs-Presets setzen Schichtdicke und passenden Sandtyp/Schüttdichte.
type Preset = {
  id: string;
  name: string;
  icon: string;
  dickeCm: number;
  rho: number; // t/m³
};
const PRESETS: Preset[] = [
  { id: 'pflaster', name: 'Pflasterbett', icon: '🧱', dickeCm: 4, rho: 1.5 },
  { id: 'sandkasten', name: 'Sandkasten', icon: '🏖️', dickeCm: 30, rho: 1.3 },
  { id: 'moertel', name: 'Mörtel-/Estrichbett', icon: '🪣', dickeCm: 5, rho: 1.5 },
];

export function SandRechner() {
  const [presetId, setPresetId] = useState('pflaster');
  const [eingabe, setEingabe] = useState<'masse' | 'flaeche'>('masse');
  const [flaeche, setFlaeche] = useState(10);
  const [laenge, setLaenge] = useState(5);
  const [breite, setBreite] = useState(2);
  const [dickeCm, setDickeCm] = useState(4);
  const [rho, setRho] = useState(1.5);
  const [zuschlag, setZuschlag] = useState(5);
  const [sackKg, setSackKg] = useState(25);

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handlePreset = (id: string) => {
    setPresetId(id);
    const p = PRESETS.find((x) => x.id === id)!;
    setDickeCm(p.dickeCm);
    setRho(p.rho);
  };

  const flaecheM2 = eingabe === 'flaeche' ? flaeche : laenge * breite;
  const volumen = flaecheM2 * (dickeCm / 100) * (1 + zuschlag / 100);
  const masseT = volumen * rho;
  const masseKg = masseT * 1000;
  const saecke = sackKg > 0 ? Math.ceil(masseKg / sackKg) : 0;
  const bigBags = Math.ceil(masseT / 1.0); // 1-t-BigBag

  const fmt = (v: number, max = 2) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });

  return (
    <div className="max-w-lg mx-auto">

      {/* Anwendung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Anwendung</span>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePreset(p.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                presetId === p.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-center leading-tight">{p.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Setzt typische Dicke und Schüttdichte – beides unten frei anpassbar.
        </p>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div>
          <span className="text-gray-700 font-medium block mb-2">Fläche angeben als</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setEingabe('masse')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                eingabe === 'masse'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Länge × Breite
            </button>
            <button
              onClick={() => setEingabe('flaeche')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                eingabe === 'flaeche'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Fläche in m²
            </button>
          </div>
        </div>

        {eingabe === 'flaeche' ? (
          <label className="block">
            <span className="text-gray-700 font-medium">Fläche</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={flaeche}
                onChange={(e) => setFlaeche(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
            </div>
          </label>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-gray-700 font-medium">Länge</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={laenge}
                  onChange={(e) => setLaenge(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Breite</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={breite}
                  onChange={(e) => setBreite(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </label>
          </div>
        )}

        <label className="block">
          <span className="text-gray-700 font-medium">Schichtdicke / Füllhöhe</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={dickeCm}
              onChange={(e) => setDickeCm(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Pflasterbett 3–5 cm (DIN 18318), Sandkasten 20–40 cm, Mörtelbett nach Bedarf.
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Schüttdichte</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.05}
                value={rho}
                onChange={(e) => setRho(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">t/m³</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Zuschlag</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={30}
                step={1}
                value={zuschlag}
                onChange={(e) => setZuschlag(Math.min(30, toNumber(e.target.value)))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </label>
        </div>
        <span className="text-xs text-gray-400 block">
          Bausand/Pflastersand ~1,5 t/m³, Spielsand ~1,3 t/m³ (Werte editierbar).
        </span>

        <label className="block">
          <span className="text-gray-700 font-medium">Sackgröße</span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[25, 40, 1000].map((sk) => (
              <button
                key={sk}
                onClick={() => setSackKg(sk)}
                className={`py-2 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                  sackKg === sk
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {sk === 1000 ? 'BigBag 1 t' : `${sk} kg`}
              </button>
            ))}
          </div>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigter Sand</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(masseT)}</span>
            <span className="text-xl text-blue-200">Tonnen</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            = {fmt(masseKg, 0)} kg · {fmt(volumen)} m³ (inkl. {fmt(zuschlag, 0)} % Zuschlag)
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">{sackKg === 1000 ? 'BigBags à 1 t' : `Säcke à ${fmt(sackKg, 0)} kg`}</span>
              <span className="text-xl font-bold">{fmt(saecke, 0)} Stück</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">alternativ BigBags (1 t)</span>
              <span className="font-bold">{fmt(bigBags, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Volumen</strong> = {fmt(flaecheM2)} m² × {fmt(dickeCm / 100, 2)} m × {fmt(1 + zuschlag / 100, 2)} ={' '}
            <strong>{fmt(volumen)} m³</strong>
          </p>
          <p>
            <strong>Masse</strong> = {fmt(volumen)} m³ × {fmt(rho, 2)} t/m³ = <strong>{fmt(masseT)} t</strong> ={' '}
            {fmt(masseKg, 0)} kg
          </p>
          <p>
            <strong>{sackKg === 1000 ? 'BigBags' : 'Säcke'}</strong> = {fmt(masseKg, 0)} kg ÷ {fmt(sackKg, 0)} kg ={' '}
            <strong>{fmt(saecke, 0)}</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Ergebnis ist eine unverbindliche Mengenschätzung. Der reale
          Bedarf hängt von Verdichtung, Feuchte, Körnung und Untergrund ab; Schüttdichten variieren je
          Sandtyp und Lieferant (Lieferschein prüfen). Für ein normgerechtes Pflasterbett gelten
          DIN 18318/VOB C; für Spielsand auf zertifizierte Ware (Fallschutz DIN EN 1177) achten. Angaben
          ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default SandRechner;
