import { useState } from 'react';

// Rohdichte Normalbeton (frisch verdichtet): ~2.400 kg/m³.
// Quelle: VDZ / DIN EN 206. Wir nutzen diesen Standardwert für die Gewichtsschätzung.
const ROHDICHTE_KG_PRO_M3 = 2400;

// Ergiebigkeit eines 40-kg-Sacks Fertigbeton: ~18 L Frischbeton ≈ 0,018 m³
// (Herstellerangaben Sakret/quick-mix: 40 kg ≈ 18–19 L). Daraus folgt: ~56 Säcke
// à 40 kg pro 1 m³ (leicht konservativ). Wir skalieren linear mit dem Sackgewicht.
const FRISCHBETON_LITER_PRO_KG = 0.018 / 40; // m³ pro kg Sackware ≈ 0,00045 m³/kg

// Selbstmischen C20/25 pro 1 m³ Frischbeton (Richtwerte, w/z ≈ 0,5):
const ZEMENT_KG_PRO_M3 = 300;
const SAND_KIES_KG_PRO_M3 = 1900;
const WASSER_L_PRO_M3 = 170;

type Form = 'platte' | 'fundament' | 'saeule';
type Modus = 'fertig' | 'mischen';

const FORMEN: { id: Form; name: string; icon: string }[] = [
  { id: 'platte', name: 'Bodenplatte', icon: '🟦' },
  { id: 'fundament', name: 'Streifenfundament', icon: '🧱' },
  { id: 'saeule', name: 'Rundsäule / Punkt', icon: '🛢️' },
];

export function BetonRechner() {
  const [form, setForm] = useState<Form>('platte');
  // Quader-Maße (Platte / Fundament) in Metern
  const [laenge, setLaenge] = useState(4);
  const [breite, setBreite] = useState(3);
  const [hoehe, setHoehe] = useState(0.15);
  // Rundsäule
  const [durchmesser, setDurchmesser] = useState(0.3);
  const [saeulenHoehe, setSaeulenHoehe] = useState(2);

  const [verschnitt, setVerschnitt] = useState(8);
  const [modus, setModus] = useState<Modus>('fertig');
  const [sackGewicht, setSackGewicht] = useState(40);
  const [preisAktiv, setPreisAktiv] = useState(false);
  const [preisProSack, setPreisProSack] = useState(5);

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Netto-Volumen je nach Form
  const volumenNetto =
    form === 'saeule'
      ? Math.PI * Math.pow(durchmesser / 2, 2) * saeulenHoehe
      : laenge * breite * hoehe;

  const volumenBrutto = volumenNetto * (1 + verschnitt / 100);
  const gewichtKg = volumenBrutto * ROHDICHTE_KG_PRO_M3;

  // Fertigbeton-Säcke: Volumen / (Ergiebigkeit pro Sack)
  const m3ProSack = sackGewicht * FRISCHBETON_LITER_PRO_KG;
  const saecke = m3ProSack > 0 ? Math.ceil(volumenBrutto / m3ProSack) : 0;

  // Selbstmischen
  const zementKg = volumenBrutto * ZEMENT_KG_PRO_M3;
  const sandKiesKg = volumenBrutto * SAND_KIES_KG_PRO_M3;
  const wasserL = volumenBrutto * WASSER_L_PRO_M3;
  const zementSaecke = Math.ceil(zementKg / 25); // 25-kg-Zementsack

  const kosten = saecke * preisProSack;

  const fmt = (v: number, max = 2) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });
  const fmtEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Form-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Bauteil-Form</span>
        <div className="grid grid-cols-3 gap-2">
          {FORMEN.map((f) => (
            <button
              key={f.id}
              onClick={() => setForm(f.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                form === f.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-center leading-tight">{f.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {form === 'saeule' ? (
          <>
            <label className="block">
              <span className="text-gray-700 font-medium">Durchmesser</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.05}
                  value={durchmesser}
                  onChange={(e) => setDurchmesser(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Höhe</span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.1}
                  value={saeulenHoehe}
                  onChange={(e) => setSaeulenHoehe(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </label>
          </>
        ) : (
          <>
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">
                {form === 'platte' ? 'Dicke / Höhe' : 'Höhe (Tiefe)'}
              </span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  value={hoehe}
                  onChange={(e) => setHoehe(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </label>
          </>
        )}

        <label className="block">
          <span className="text-gray-700 font-medium">Verschnitt / Reserve</span>
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
          <span className="text-xs text-gray-400 mt-1 block">Empfehlung 5–10 % für Reste und Unebenheiten.</span>
        </label>

        {/* Modus-Umschalter */}
        <div className="border-t border-gray-100 pt-4">
          <span className="text-gray-700 font-medium block mb-2">Wie wird der Beton hergestellt?</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setModus('fertig')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                modus === 'fertig'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              🛍️ Fertigbeton (Sackware)
            </button>
            <button
              onClick={() => setModus('mischen')}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                modus === 'mischen'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⚒️ Selbst mischen
            </button>
          </div>
        </div>

        {modus === 'fertig' && (
          <label className="block">
            <span className="text-gray-700 font-medium">Sackgröße</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[25, 30, 40].map((sg) => (
                <button
                  key={sg}
                  onClick={() => setSackGewicht(sg)}
                  className={`py-2 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                    sackGewicht === sg
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {sg} kg
                </button>
              ))}
            </div>
          </label>
        )}

        {/* Optionaler Preis */}
        {modus === 'fertig' && (
          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preisAktiv}
                onChange={(e) => setPreisAktiv(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Materialkosten berechnen</span>
            </label>
            {preisAktiv && (
              <label className="block mt-3">
                <span className="text-sm text-gray-600">Preis pro Sack ({sackGewicht} kg)</span>
                <div className="mt-2 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.1}
                    value={preisProSack}
                    onChange={(e) => setPreisProSack(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                </div>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigter Beton</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(volumenBrutto)}</span>
            <span className="text-xl text-blue-200">m³</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            entspricht ca. {fmt(gewichtKg, 0)} kg Beton ({fmt(gewichtKg / 1000)} t)
          </p>
        </div>

        <div className="space-y-3">
          {modus === 'fertig' ? (
            <>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Fertigbeton-Säcke ({sackGewicht} kg)</span>
                  <span className="text-xl font-bold">{fmt(saecke, 0)} Stück</span>
                </div>
              </div>
              {preisAktiv && (
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Materialkosten</span>
                    <span className="text-xl font-bold">{fmtEuro(kosten)} €</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Zement</span>
                  <span className="font-bold">{fmt(zementKg, 0)} kg · ca. {fmt(zementSaecke, 0)} Sack (25 kg)</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Sand / Kies</span>
                  <span className="font-bold">{fmt(sandKiesKg, 0)} kg</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Wasser</span>
                  <span className="font-bold">ca. {fmt(wasserL, 0)} Liter</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          {form === 'saeule' ? (
            <p>
              <strong>Volumen</strong> = π × (Ø ÷ 2)² × Höhe = π × ({fmt(durchmesser)} ÷ 2)² ×{' '}
              {fmt(saeulenHoehe)} = <strong>{fmt(volumenNetto)} m³</strong>
            </p>
          ) : (
            <p>
              <strong>Volumen</strong> = L × B × H = {fmt(laenge)} × {fmt(breite)} × {fmt(hoehe)} ={' '}
              <strong>{fmt(volumenNetto)} m³</strong>
            </p>
          )}
          <p>
            <strong>+ {fmt(verschnitt, 0)} % Verschnitt</strong> = {fmt(volumenNetto)} × {fmt(1 + verschnitt / 100)} ={' '}
            <strong>{fmt(volumenBrutto)} m³</strong>
          </p>
          {modus === 'fertig' ? (
            <p>
              <strong>Säcke</strong> = {fmt(volumenBrutto)} m³ ÷ {fmt(m3ProSack, 4)} m³/Sack ={' '}
              <strong>{fmt(saecke, 0)} Säcke à {sackGewicht} kg</strong>
            </p>
          ) : (
            <p>
              <strong>Zement</strong> = {fmt(volumenBrutto)} m³ × 300 kg/m³ ={' '}
              <strong>{fmt(zementKg, 0)} kg</strong>; Sand/Kies × 1.900 kg/m³, Wasser × 170 L/m³.
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Die Werte sind Richtwerte für die Materialbestellung. Tragende
          Bauteile wie Fundamente oder Decken müssen statisch bemessen werden – maßgeblich sind
          DIN EN 206 / DIN 1045-2 sowie die Herstellerangaben. Alle Angaben ohne Gewähr, keine
          Bau- oder Statikberatung.
        </p>
      </div>
    </div>
  );
}

export default BetonRechner;
