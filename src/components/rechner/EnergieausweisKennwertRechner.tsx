import { useState } from 'react';

// Energieträger mit Umrechnungsfaktor auf kWh (Endenergie, Brennwert-Richtwerte).
// Eingabe in der jeweiligen Einheit × Faktor = kWh.
type Traeger = { id: string; name: string; einheit: string; faktor: number };
const TRAEGER: Traeger[] = [
  { id: 'kwh', name: 'Direkt in kWh', einheit: 'kWh', faktor: 1 },
  { id: 'gas', name: 'Erdgas (m³)', einheit: 'm³', faktor: 10 },
  { id: 'oel', name: 'Heizöl (Liter)', einheit: 'l', faktor: 10 },
  { id: 'pellets', name: 'Holzpellets (kg)', einheit: 'kg', faktor: 4.8 },
];

// GEG §86 / Anlage 10 – Effizienzklassen Wohngebäude (Endenergie kWh/(m²·a)).
const KLASSEN: { klasse: string; max: number; farbe: string }[] = [
  { klasse: 'A+', max: 30, farbe: 'bg-green-600' },
  { klasse: 'A', max: 50, farbe: 'bg-green-500' },
  { klasse: 'B', max: 75, farbe: 'bg-lime-500' },
  { klasse: 'C', max: 100, farbe: 'bg-yellow-500' },
  { klasse: 'D', max: 130, farbe: 'bg-amber-500' },
  { klasse: 'E', max: 160, farbe: 'bg-orange-500' },
  { klasse: 'F', max: 200, farbe: 'bg-orange-600' },
  { klasse: 'G', max: 250, farbe: 'bg-red-500' },
  { klasse: 'H', max: Infinity, farbe: 'bg-red-700' },
];

export function EnergieausweisKennwertRechner() {
  const [traegerId, setTraegerId] = useState('kwh');
  const [v1, setV1] = useState(18000);
  const [v2, setV2] = useState(19500);
  const [v3, setV3] = useState(16500);
  const [einheitKwh, setEinheitKwh] = useState(true); // true = Verbrauch ist bereits kWh
  const [wohnflaeche, setWohnflaeche] = useState(140);
  const [anDirekt, setAnDirekt] = useState(false);
  const [an, setAn] = useState(189);
  const [klimafaktor, setKlimafaktor] = useState(1.0);

  // Robuste Zahleneingabe: leeres/ungültiges Feld ergibt 0 statt NaN.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const traeger = TRAEGER.find((t) => t.id === traegerId)!;
  const faktor = einheitKwh ? 1 : traeger.faktor;

  // 3-Jahres-Mittel in kWh
  const mittelKwh = ((v1 + v2 + v3) / 3) * faktor;
  // Klimabereinigung (vereinfacht auf Gesamtverbrauch)
  const bereinigt = mittelKwh * klimafaktor;
  // Gebäudenutzfläche
  const anWert = anDirekt ? an : wohnflaeche * 1.35;
  // Endenergiekennwert
  const kennwert = anWert > 0 ? bereinigt / anWert : 0;

  const klasse = KLASSEN.find((k) => kennwert <= k.max)!;

  const fmt = (v: number, max = 0) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: max });

  return (
    <div className="max-w-lg mx-auto">

      {/* Energieträger */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Energieträger der Heizung</span>
        <div className="grid grid-cols-2 gap-2">
          {TRAEGER.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTraegerId(t.id);
                setEinheitKwh(t.id === 'kwh');
              }}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                traegerId === t.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Umrechnung: {einheitKwh ? 'Verbrauch bereits in kWh' : `1 ${traeger.einheit} ≈ ${fmt(traeger.faktor, 1)} kWh`}
        </p>
      </div>

      {/* Verbrauch 3 Jahre */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <span className="text-gray-700 font-medium block">
          Verbrauch der letzten 3 Jahre (Heizung + Warmwasser), in {einheitKwh ? 'kWh' : traeger.einheit}
        </span>
        {[
          { label: 'Jahr 1', value: v1, set: setV1 },
          { label: 'Jahr 2', value: v2, set: setV2 },
          { label: 'Jahr 3', value: v3, set: setV3 },
        ].map((row) => (
          <label className="block" key={row.label}>
            <span className="text-sm text-gray-600">{row.label}</span>
            <div className="mt-1 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={100}
                value={row.value}
                onChange={(e) => row.set(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                {einheitKwh ? 'kWh' : traeger.einheit}
              </span>
            </div>
          </label>
        ))}

        <label className="block">
          <span className="text-gray-700 font-medium">Klimafaktor (Standort)</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={klimafaktor}
              onChange={(e) => setKlimafaktor(toNumber(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            DWD-Witterungsfaktor je PLZ; Default 1,0 (keine Korrektur). Werte typ. 0,9–1,1.
          </span>
        </label>
      </div>

      {/* Fläche */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div>
          <span className="text-gray-700 font-medium block mb-2">Bezugsfläche</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAnDirekt(false)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                !anDirekt
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Wohnfläche (× 1,35)
            </button>
            <button
              onClick={() => setAnDirekt(true)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                anDirekt
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Nutzfläche AN direkt
            </button>
          </div>
        </div>

        {anDirekt ? (
          <label className="block">
            <span className="text-gray-700 font-medium">Gebäudenutzfläche AN</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={an}
                onChange={(e) => setAn(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
            </div>
          </label>
        ) : (
          <label className="block">
            <span className="text-gray-700 font-medium">Wohnfläche</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={wohnflaeche}
                onChange={(e) => setWohnflaeche(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Gebäudenutzfläche AN ≈ Wohnfläche × 1,35 (Wohngebäude) = {fmt(wohnflaeche * 1.35, 0)} m²
            </span>
          </label>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Endenergiekennwert</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{fmt(kennwert, 1)}</span>
            <span className="text-xl text-blue-200">kWh/(m²·a)</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            3-Jahres-Mittel {fmt(mittelKwh)} kWh ÷ AN {fmt(anWert, 0)} m²
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-blue-100">Effizienzklasse (GEG)</span>
            <span className={`text-2xl font-bold px-4 py-1 rounded-lg ${klasse.farbe}`}>{klasse.klasse}</span>
          </div>
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>3-Jahres-Mittel</strong> = ({fmt(v1)} + {fmt(v2)} + {fmt(v3)}) ÷ 3{' '}
            {!einheitKwh && `× ${fmt(faktor, 1)} kWh`} = <strong>{fmt(mittelKwh)} kWh</strong>
          </p>
          <p>
            <strong>Kennwert</strong> = (Mittel × Klimafaktor) ÷ AN = ({fmt(mittelKwh)} × {fmt(klimafaktor, 2)}) ÷{' '}
            {fmt(anWert, 0)} = <strong>{fmt(kennwert, 1)} kWh/(m²·a)</strong>
          </p>
          <p>→ Effizienzklasse <strong>{klasse.klasse}</strong> nach GEG Anlage 10.</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Der Rechner liefert eine unverbindliche Schätzung des
          Verbrauchskennwerts und der Effizienzklasse. Ein rechtsgültiger Energieausweis darf
          ausschließlich von berechtigten Ausstellern (z. B. Energieberater nach § 88 GEG) erstellt
          werden und ist für Verkauf/Vermietung Pflicht. Die vereinfachte Klimabereinigung weicht vom
          amtlichen DWD-Witterungsfaktor-Verfahren ab. Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default EnergieausweisKennwertRechner;
