import { useState } from 'react';

// Wandpaneele-/Akustikpaneele-Bedarf:
//  Wandfläche brutto = Wandbreite × Wandhöhe
//  Wandfläche netto  = brutto − Abzugsflächen (Fenster/Türen)
//  Belegte Fläche    = netto × Bedeckungsgrad
//  Materialbedarf    = belegte Fläche × (1 + Verschnitt)
//  Stückzahl         = ceil(Materialbedarf / Fläche je Paneel)
//  Lattenmeter (UK)  = (Wandbreite / Achsabstand + 1) × Wandhöhe
//  Kosten            = Stückzahl × Preis je Paneel (+ Latten × Preis/lfm)
// Standardformate 60 cm breit; Höhen 240/260/300 cm (Quellen: HORNBACH-
// Sortiment, Holzprofi24-Magazin, Sanier.de-Methodik Netto-Wandfläche).

type PaneelFormat = {
  name: string;
  icon: string;
  breite: number; // m
  hoehe: number; // m
};

const FORMATE: PaneelFormat[] = [
  { name: '60 × 240 cm', icon: '📏', breite: 0.6, hoehe: 2.4 },
  { name: '60 × 260 cm', icon: '📐', breite: 0.6, hoehe: 2.6 },
  { name: '60 × 300 cm', icon: '🪵', breite: 0.6, hoehe: 3.0 },
  { name: 'Eigenes Maß', icon: '🔧', breite: 0.6, hoehe: 2.7 },
];

export function WandverkleidungPaneeleRechner() {
  const [formatIndex, setFormatIndex] = useState(1); // 60 × 260 cm
  const [wandbreite, setWandbreite] = useState(6);
  const [wandhoehe, setWandhoehe] = useState(2.6);
  const [abzug, setAbzug] = useState(0); // m² Fenster/Türen
  const [bedeckung, setBedeckung] = useState(100); // %
  const [verschnitt, setVerschnitt] = useState(10); // %
  const [paneelBreite, setPaneelBreite] = useState(FORMATE[1].breite);
  const [paneelHoehe, setPaneelHoehe] = useState(FORMATE[1].hoehe);
  const [mitUk, setMitUk] = useState(false);
  const [achsabstand, setAchsabstand] = useState(0.5); // m
  const [mitKosten, setMitKosten] = useState(false);
  const [preisProPaneel, setPreisProPaneel] = useState(30); // €
  const [preisProLfm, setPreisProLfm] = useState(1.5); // € je lfm Latte

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleFormatWechsel = (index: number) => {
    setFormatIndex(index);
    setPaneelBreite(FORMATE[index].breite);
    setPaneelHoehe(FORMATE[index].hoehe);
  };

  const flaecheBrutto = wandbreite * wandhoehe;
  const flaecheNetto = Math.max(0, flaecheBrutto - abzug);
  const belegteFlaeche = flaecheNetto * (bedeckung / 100);
  const materialbedarf = belegteFlaeche * (1 + verschnitt / 100);
  const flaecheJePaneel = paneelBreite * paneelHoehe;
  const stueckzahl = flaecheJePaneel > 0 ? Math.ceil(materialbedarf / flaecheJePaneel) : 0;

  // Unterkonstruktion: vertikale Latten im gewählten Achsabstand + 1 Randlatte,
  // jeweils über die volle Wandhöhe.
  const anzahlLatten = achsabstand > 0 ? Math.ceil(wandbreite / achsabstand) + 1 : 0;
  const lattenLfm = mitUk ? anzahlLatten * wandhoehe : 0;

  // Kosten
  const paneelKosten = mitKosten ? stueckzahl * preisProPaneel : 0;
  const lattenKosten = mitKosten && mitUk ? lattenLfm * preisProLfm : 0;
  const gesamtKosten = paneelKosten + lattenKosten;

  const formatNum = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const formatEuro = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Paneelformat */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Paneelformat (Breite × Höhe)</span>
        <div className="grid grid-cols-2 gap-2">
          {FORMATE.map((f, i) => (
            <button
              key={f.name}
              onClick={() => handleFormatWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                formatIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-center leading-tight">{f.name}</span>
              <span className="text-[10px] text-gray-400">
                {formatNum(f.breite * f.hoehe)} m²
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Wandbreite</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={wandbreite}
                onChange={(e) => setWandbreite(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">Mehrere Wände? Breiten addieren.</span>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Wand-/Raumhöhe</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.1}
                value={wandhoehe}
                onChange={(e) => setWandhoehe(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
        </div>

        <label className="block">
          <span className="text-gray-700 font-medium">Abzug Fenster/Türen</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={abzug}
              onChange={(e) => setAbzug(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m²</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Standardfenster ca. 1,5–2,5 m², Standardtür ca. 1,8–2 m².
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Bedeckungsgrad</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step={5}
                value={bedeckung}
                onChange={(e) => setBedeckung(Math.min(100, toNumber(e.target.value)))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Vollverkleidung 100 %, Akustik-Teilbelegung 20–30 %.
            </span>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Verschnitt/Reserve</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={verschnitt}
                onChange={(e) => setVerschnitt(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">
              Standard 10 %, mit Zuschnitt (Akustik) 20 %.
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-gray-700 font-medium">Paneelbreite</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={paneelBreite}
                onChange={(e) => setPaneelBreite(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Paneelhöhe</span>
            <div className="mt-2 relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.01}
                value={paneelHoehe}
                onChange={(e) => setPaneelHoehe(toNumber(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
          </label>
        </div>

        {/* Unterkonstruktion */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitUk}
              onChange={(e) => setMitUk(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Unterkonstruktion (Latten) berechnen</span>
          </label>
          {mitUk && (
            <label className="block">
              <span className="text-sm text-gray-600">Achsabstand der Latten</span>
              <div className="mt-1 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0.05}
                  step={0.05}
                  value={achsabstand}
                  onChange={(e) => setAchsabstand(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Üblich 0,40–0,60 m. Bei reiner Klebemontage entfällt die Unterkonstruktion.
              </span>
            </label>
          )}
        </div>

        {/* Kosten */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mitKosten}
              onChange={(e) => setMitKosten(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Materialkosten schätzen</span>
          </label>
          {mitKosten && (
            <>
              <label className="block">
                <span className="text-sm text-gray-600">Preis je Paneel</span>
                <div className="mt-1 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={1}
                    value={preisProPaneel}
                    onChange={(e) => setPreisProPaneel(toNumber(e.target.value))}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                </div>
                <span className="text-xs text-gray-400 mt-1 block">
                  Akustikpaneele 60 × 240 cm oft 20–45 € je Stück.
                </span>
              </label>
              {mitUk && (
                <label className="block">
                  <span className="text-sm text-gray-600">Preis je lfm Latte</span>
                  <div className="mt-1 relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step={0.1}
                      value={preisProLfm}
                      onChange={(e) => setPreisProLfm(toNumber(e.target.value))}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                  </div>
                </label>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">Benötigte Paneele</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatNum(stueckzahl)}</span>
            <span className="text-xl text-blue-200">{stueckzahl === 1 ? 'Paneel' : 'Paneele'}</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            für {formatNum(flaecheNetto)} m² Netto-Wandfläche · Materialbedarf {formatNum(materialbedarf)} m²
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Fläche je Paneel</span>
              <span className="text-xl font-bold">{formatNum(flaecheJePaneel)} m²</span>
            </div>
          </div>
          {mitUk && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Unterkonstruktion (Latten)</span>
                <span className="font-bold">
                  {formatNum(anzahlLatten)} Latten · {formatNum(lattenLfm)} lfm
                </span>
              </div>
            </div>
          )}
          {mitKosten && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Geschätzte Materialkosten</span>
                <span className="font-bold">{formatEuro(gesamtKosten)} €</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Netto-Wandfläche</strong> = {formatNum(wandbreite)} m × {formatNum(wandhoehe)} m −{' '}
            {formatNum(abzug)} m² = <strong>{formatNum(flaecheNetto)} m²</strong>
          </p>
          <p>
            <strong>Materialbedarf</strong> = {formatNum(flaecheNetto)} × {formatNum(bedeckung)} %
            (Bedeckung) × (1 + {formatNum(verschnitt)} % Verschnitt) = {formatNum(materialbedarf)} m²
          </p>
          <p>
            <strong>Paneele</strong> = aufrunden({formatNum(materialbedarf)} ÷ {formatNum(flaecheJePaneel)}{' '}
            m²/Paneel) = <strong>{formatNum(stueckzahl)}</strong>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Hinweis:</strong> Das Ergebnis ist eine Bedarfsschätzung. Reale Paneelmaße und
          Verschnitt unterscheiden sich je Hersteller – prüfen Sie die Produktangaben und bestellen Sie
          mindestens 10 % (bei Akustikpaneelen 20 %) Reserve aus <strong>derselben Charge</strong>, um
          Farb- und Maserungsabweichungen zu vermeiden. Bei brandschutz- oder baurechtsrelevanter
          Anwendung (z. B. B1-Zertifizierung, Fluchtwege) gelten die Hersteller- und Bauvorschriften.
          Angaben ohne Gewähr – ersetzt keine Fachplanung.
        </p>
      </div>
    </div>
  );
}

export default WandverkleidungPaneeleRechner;
