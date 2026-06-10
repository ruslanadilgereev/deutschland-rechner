import { useState } from 'react';

// Anrechnung der Wohnfläche nach Wohnflächenverordnung (WoFlV §4):
//  - Raumteile mit lichter Höhe >= 2,00 m -> 100 %
//  - Raumteile mit lichter Höhe 1,00 m bis < 2,00 m -> 50 %
//  - Raumteile mit lichter Höhe < 1,00 m -> 0 %
//  - Balkone, Loggien, Dachgärten und Terrassen -> i. d. R. 25 %, höchstens 50 %
// DIN 277 dagegen rechnet die Grundfläche grundsätzlich voll an (ohne
// Höhen-Abschlag), liefert also einen höheren Wert als die WoFlV.

type RaumTyp = 'voll' | 'schraege' | 'balkon';

type Raum = {
  id: number;
  name: string;
  typ: RaumTyp;
  laenge: number; // m
  breite: number; // m
  flaecheHoch: number; // m2 mit lichter Höhe >= 2 m (nur bei Dachschräge)
  flaecheNiedrig: number; // m2 mit lichter Höhe 1-2 m (nur bei Dachschräge)
  balkonFaktor: number; // 25 oder 50 (nur bei Balkon)
};

let nextId = 5;

const STANDARD_RAEUME: Raum[] = [
  { id: 1, name: 'Wohnzimmer', typ: 'voll', laenge: 5, breite: 4, flaecheHoch: 0, flaecheNiedrig: 0, balkonFaktor: 25 },
  { id: 2, name: 'Schlafzimmer', typ: 'voll', laenge: 4, breite: 3.5, flaecheHoch: 0, flaecheNiedrig: 0, balkonFaktor: 25 },
  { id: 3, name: 'Dachzimmer', typ: 'schraege', laenge: 0, breite: 0, flaecheHoch: 12, flaecheNiedrig: 8, balkonFaktor: 25 },
  { id: 4, name: 'Balkon', typ: 'balkon', laenge: 4, breite: 1.5, flaecheHoch: 0, flaecheNiedrig: 0, balkonFaktor: 25 },
];

export function WohnflaecheRechner() {
  const [raeume, setRaeume] = useState<Raum[]>(STANDARD_RAEUME);
  const [norm, setNorm] = useState<'woflv' | 'din277'>('woflv');

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const updateRaum = (id: number, patch: Partial<Raum>) => {
    setRaeume((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRaum = () => {
    setRaeume((prev) => [
      ...prev,
      { id: nextId++, name: 'Raum', typ: 'voll', laenge: 3, breite: 3, flaecheHoch: 0, flaecheNiedrig: 0, balkonFaktor: 25 },
    ]);
  };

  const removeRaum = (id: number) => {
    setRaeume((prev) => prev.filter((r) => r.id !== id));
  };

  // Anrechenbare Fläche eines einzelnen Raums je nach Norm.
  const flaecheRaum = (r: Raum): number => {
    if (r.typ === 'voll') {
      return r.laenge * r.breite;
    }
    if (r.typ === 'schraege') {
      if (norm === 'din277') return r.flaecheHoch + r.flaecheNiedrig;
      // WoFlV: hoher Teil voll, niedriger Teil halb, <1 m bereits ausgeschlossen
      return r.flaecheHoch + r.flaecheNiedrig * 0.5;
    }
    // Balkon/Loggia/Terrasse
    const grund = r.laenge * r.breite;
    if (norm === 'din277') return grund; // DIN 277 rechnet separat – hier als Vollfläche dargestellt
    return grund * (r.balkonFaktor / 100);
  };

  const summe = raeume.reduce((acc, r) => acc + flaecheRaum(r), 0);

  const formatM2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Norm-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Berechnungsgrundlage</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setNorm('woflv')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              norm === 'woflv'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">📐</span>
            <span className="text-center leading-tight">WoFlV (Miete/Verkauf)</span>
          </button>
          <button
            onClick={() => setNorm('din277')}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
              norm === 'din277'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">📏</span>
            <span className="text-center leading-tight">DIN 277 (Grundfläche)</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {norm === 'woflv'
            ? 'WoFlV: Dachschrägen und Balkone werden nur anteilig angerechnet – maßgeblich für Mietverträge und den Wohnungsverkauf.'
            : 'DIN 277: rechnet die Grundfläche grundsätzlich voll an (kein Höhen-Abschlag) und liefert daher einen höheren Wert.'}
        </p>
      </div>

      {/* Räume */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        {raeume.map((r) => (
          <div key={r.id} className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={r.name}
                onChange={(e) => updateRaum(r.id, { name: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => removeRaum(r.id)}
                className="text-gray-400 hover:text-red-500 px-2 text-lg"
                aria-label="Raum entfernen"
              >
                ✕
              </button>
            </div>

            {/* Raumtyp */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['voll', 'schraege', 'balkon'] as RaumTyp[]).map((t) => (
                <button
                  key={t}
                  onClick={() => updateRaum(r.id, { typ: t })}
                  className={`p-2 rounded-lg border text-xs font-medium transition-all active:scale-95 ${
                    r.typ === t
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t === 'voll' ? 'Normaler Raum' : t === 'schraege' ? 'Dachschräge' : 'Balkon/Terrasse'}
                </button>
              ))}
            </div>

            {(r.typ === 'voll' || r.typ === 'balkon') && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm text-gray-600">Länge</span>
                  <div className="mt-1 relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.1}
                      value={r.laenge}
                      onChange={(e) => updateRaum(r.id, { laenge: toNumber(e.target.value) })}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m</span>
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm text-gray-600">Breite</span>
                  <div className="mt-1 relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.1}
                      value={r.breite}
                      onChange={(e) => updateRaum(r.id, { breite: toNumber(e.target.value) })}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m</span>
                  </div>
                </label>
              </div>
            )}

            {r.typ === 'balkon' && (
              <label className="block mt-3">
                <span className="text-sm text-gray-600">Anrechnungsfaktor</span>
                <select
                  value={r.balkonFaktor}
                  onChange={(e) => updateRaum(r.id, { balkonFaktor: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-base bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={25}>25 % (Regelfall)</option>
                  <option value={50}>50 % (hochwertig, max. zulässig)</option>
                </select>
              </label>
            )}

            {r.typ === 'schraege' && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm text-gray-600">Fläche ≥ 2,00 m hoch</span>
                  <div className="mt-1 relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.1}
                      value={r.flaecheHoch}
                      onChange={(e) => updateRaum(r.id, { flaecheHoch: toNumber(e.target.value) })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²</span>
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm text-gray-600">Fläche 1,00–2,00 m</span>
                  <div className="mt-1 relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.1}
                      value={r.flaecheNiedrig}
                      onChange={(e) => updateRaum(r.id, { flaecheNiedrig: toNumber(e.target.value) })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²</span>
                  </div>
                </label>
                <p className="col-span-2 text-xs text-gray-400">
                  Flächen unter 1,00 m lichter Höhe nicht eintragen – sie zählen nach WoFlV gar nicht.
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-3">
              Anrechenbar: <strong>{formatM2(flaecheRaum(r))} m²</strong>
            </p>
          </div>
        ))}

        <button
          onClick={addRaum}
          className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Raum hinzufügen
        </button>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">
          Anrechenbare Wohnfläche ({norm === 'woflv' ? 'WoFlV' : 'DIN 277'})
        </h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatM2(summe)}</span>
            <span className="text-xl text-blue-200">m²</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            aus {raeume.length} {raeume.length === 1 ? 'Raum' : 'Räumen'}
          </p>
        </div>

        <div className="space-y-3">
          {raeume.map((r) => (
            <div key={r.id} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">{r.name || 'Raum'}</span>
                <span className="font-bold">{formatM2(flaecheRaum(r))} m²</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Normaler Raum</strong> = Länge × Breite (volle Anrechnung)
          </p>
          <p>
            <strong>Dachschräge (WoFlV)</strong> = Fläche ≥ 2 m × 100 % + Fläche 1–2 m × 50 %
          </p>
          <p>
            <strong>Balkon/Terrasse</strong> = Grundfläche × {norm === 'woflv' ? '25 % (bzw. 50 %)' : '100 % (DIN 277)'}
          </p>
          <p>
            <strong>Gesamtwohnfläche</strong> = Summe aller Räume = <strong>{formatM2(summe)} m²</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Dieser Rechner liefert eine <strong>unverbindliche
          Orientierung</strong> und <strong>keine rechtsgültige Wohnflächenberechnung</strong> und kein
          Gutachten. Grundlage ist die Wohnflächenverordnung (WoFlV 2004); DIN 277 und die II.
          Berechnungsverordnung liefern abweichende Werte. Bei einer Flächenabweichung von mehr als 10 %
          kann eine Mietminderung in Betracht kommen. Für Mietvertrag, Bank oder Grundsteuer ist eine
          qualifizierte Ermittlung durch Fachleute nötig. Alle Angaben ohne Gewähr – keine Rechtsberatung.
        </p>
      </div>
    </div>
  );
}

export default WohnflaecheRechner;
