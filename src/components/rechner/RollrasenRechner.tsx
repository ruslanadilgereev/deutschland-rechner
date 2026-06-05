import { useState } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Modus: fertigen Rollrasen verlegen oder die Saat-Alternative berechnen.
type Modus = 'rollrasen' | 'saat';

// Eine Teilfläche eines verwinkelten Grundstücks (Länge × Breite in Metern).
type Teilflaeche = {
  id: number;
  laenge: number;
  breite: number;
};

export function RollrasenRechner() {
  const [modus, setModus] = useState<Modus>('rollrasen');
  const [teilflaechen, setTeilflaechen] = useState<Teilflaeche[]>([
    { id: 1, laenge: 8, breite: 5 },
  ]);
  const [verschnitt, setVerschnitt] = useState(5); // Prozent
  const [preisProM2, setPreisProM2] = useState(3); // €/m² Material
  const [aussaatstaerke, setAussaatstaerke] = useState(25); // g/m² Neuanlage

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um.
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const updateTeilflaeche = (id: number, feld: 'laenge' | 'breite', wert: number) => {
    setTeilflaechen((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [feld]: wert } : t))
    );
  };

  const addTeilflaeche = () => {
    setTeilflaechen((prev) => [
      ...prev,
      { id: (prev[prev.length - 1]?.id ?? 0) + 1, laenge: 0, breite: 0 },
    ]);
  };

  const removeTeilflaeche = (id: number) => {
    setTeilflaechen((prev) => (prev.length > 1 ? prev.filter((t) => t.id !== id) : prev));
  };

  // Nettofläche = Summe aller Teilflächen.
  const nettoFlaeche = teilflaechen.reduce((sum, t) => sum + t.laenge * t.breite, 0);

  // Bruttofläche mit Verschnittzuschlag.
  const bruttoFlaeche = nettoFlaeche * (1 + verschnitt / 100);

  // Rollen aufrunden (Standardrolle = 1 m²).
  const rollen = Math.ceil(bruttoFlaeche);

  // Kosten für Rollrasen (Material).
  const kostenRollrasen = bruttoFlaeche * preisProM2;

  // Saatgutmenge in Gramm und Kilogramm (auf Nettofläche, etwas Reserve über Verschnitt).
  const saatgutG = nettoFlaeche * aussaatstaerke;
  const saatgutKg = saatgutG / 1000;

  const fmt0 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmt1 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const fmt2 = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const fmtEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <RechnerFeedback rechnerName="Rollrasen-Rechner" rechnerSlug="rollrasen-rechner" />

      {/* Modus-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Was möchten Sie berechnen?</span>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'rollrasen', label: '🌱 Rollrasen' },
            { key: 'saat', label: '🌾 Rasensaat' },
          ] as { key: Modus; label: string }[]).map((m) => (
            <button
              key={m.key}
              onClick={() => setModus(m.key)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                modus === m.key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Teilflächen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-4">
        <span className="text-gray-700 font-medium block">Fläche eingeben (verwinkelt = aufteilen)</span>
        {teilflaechen.map((t, i) => (
          <div key={t.id} className="flex items-end gap-2">
            <label className="flex-1">
              <span className="text-xs text-gray-500">Länge {i + 1} (m)</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={t.laenge}
                onChange={(e) => updateTeilflaeche(t.id, 'laenge', toNumber(e.target.value))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            <span className="pb-2 text-gray-400">×</span>
            <label className="flex-1">
              <span className="text-xs text-gray-500">Breite {i + 1} (m)</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={t.breite}
                onChange={(e) => updateTeilflaeche(t.id, 'breite', toNumber(e.target.value))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
            {teilflaechen.length > 1 && (
              <button
                onClick={() => removeTeilflaeche(t.id)}
                className="pb-2 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Teilfläche entfernen"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTeilflaeche}
          className="text-sm text-blue-600 font-medium hover:text-blue-800"
        >
          + Weitere Teilfläche hinzufügen
        </button>
        <p className="text-xs text-gray-400">
          Nettofläche gesamt: <strong>{fmt2(nettoFlaeche)} m²</strong>
        </p>
      </div>

      {/* Parameter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Verschnitt-Zuschlag</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={30}
              step={1}
              value={verschnitt}
              onChange={(e) => setVerschnitt(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Richtwert: rechteckige Flächen +3 %, verwinkelte Flächen +5 bis +10 %.
          </span>
        </label>

        {modus === 'rollrasen' && (
          <label className="block">
            <span className="text-gray-700 font-medium">Preis pro m² (Material)</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={preisProM2}
                onChange={(e) => setPreisProM2(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m²</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Material rund 2–3,50 €/m². Mit Lieferung und Verlegung steigt der Preis auf ca. 4–9 €/m².
            </span>
          </label>
        )}

        {modus === 'saat' && (
          <label className="block">
            <span className="text-gray-700 font-medium">Aussaatstärke</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={aussaatstaerke}
                onChange={(e) => setAussaatstaerke(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">g/m²</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Richtwert: Neuanlage 20–25 g/m², Nachsaat 10–15 g/m².
            </span>
          </label>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        {modus === 'rollrasen' ? (
          <>
            <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigter Rollrasen</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{fmt0(rollen)}</span>
                <span className="text-xl text-blue-200">m² / Rollen</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">
                inkl. {fmt0(verschnitt)} % Verschnitt ({fmt1(bruttoFlaeche)} m² brutto)
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Materialkosten</span>
                  <span className="text-xl font-bold">{fmtEuro(kostenRollrasen)} €</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Nettofläche</span>
                  <span className="font-bold">{fmt2(nettoFlaeche)} m²</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigtes Saatgut</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{fmt2(saatgutKg)}</span>
                <span className="text-xl text-blue-200">kg</span>
              </div>
              <p className="text-blue-200 text-sm mt-1">
                = {fmt0(saatgutG)} g bei {fmt0(aussaatstaerke)} g/m²
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Nettofläche</span>
                  <span className="font-bold">{fmt2(nettoFlaeche)} m²</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Nettofläche</strong> = Summe aller Länge × Breite = <strong>{fmt2(nettoFlaeche)} m²</strong>
          </p>
          {modus === 'rollrasen' ? (
            <>
              <p>
                <strong>Bruttofläche</strong> = {fmt2(nettoFlaeche)} m² × (1 + {fmt0(verschnitt)} %) ={' '}
                <strong>{fmt1(bruttoFlaeche)} m²</strong> → aufgerundet {fmt0(rollen)} Rollen
              </p>
              <p>
                <strong>Kosten</strong> = {fmt1(bruttoFlaeche)} m² × {fmtEuro(preisProM2)} € ={' '}
                <strong>{fmtEuro(kostenRollrasen)} €</strong>
              </p>
            </>
          ) : (
            <p>
              <strong>Saatgut</strong> = {fmt2(nettoFlaeche)} m² × {fmt0(aussaatstaerke)} g/m² ={' '}
              <strong>{fmt0(saatgutG)} g</strong> ({fmt2(saatgutKg)} kg)
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Preise für Rollrasen schwanken regional und saisonal stark – die
          Voreinstellung ist ein unverbindlicher Richtwert. Verschnitt und Reserve sind branchenübliche
          Erfahrungswerte, keine Garantie. Planen Sie zusätzlich mindestens 1–2 m² Reserve ein und
          verlegen Sie Rollrasen innerhalb von 24 Stunden nach Lieferung. Alle Angaben ohne Gewähr.
        </p>
      </div>
    </div>
  );
}

export default RollrasenRechner;
