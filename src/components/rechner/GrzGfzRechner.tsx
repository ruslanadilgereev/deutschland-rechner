import { useState } from 'react';

// Wohnflaechen-Faktor: Umrechnung Geschossflaeche -> Wohnflaeche.
// Geschossflaeche wird nach Aussenmassen aller Vollgeschosse gemessen (BauNVO § 20),
// die Wohnflaeche liegt durch Aussen-/Innenwaende, Treppenhaeuser und Verkehrsflaechen
// niedriger. Ueblicher Erfahrungswert: 75-85 %. Default konservativ 80 %.
const WOHNFLAECHE_FAKTOR_DEFAULT = 0.8;

// Absolute Obergrenze der GRZ-Summe (Grundflaeche I + II) nach BauNVO § 19 Abs. 4 Satz 2:
// Die durch Garagen, Stellplaetze, Zufahrten und Nebenanlagen ueberschrittene
// Grundflaeche darf zusammen mit der zulaessigen GR den Wert 0,8 nicht ueberschreiten.
const GRZ_OBERGRENZE = 0.8;

// Typische Bebauungsplan-Festsetzungen als Voreinstellung (GRZ + GFZ).
// Quellen: BauNVO § 17 (Orientierungswerte fuer Obergrenzen), kommunale
// Bebauungsplaene. Werte sind Richtwerte - massgeblich ist der konkrete B-Plan.
type GebietVoreinstellung = {
  name: string;
  icon: string;
  grz: number;
  gfz: number;
};

const GEBIETE: GebietVoreinstellung[] = [
  { name: 'Reines/Allg. Wohngebiet', icon: '🏡', grz: 0.4, gfz: 0.8 },
  { name: 'Lockere Wohnbebauung', icon: '🌳', grz: 0.3, gfz: 0.6 },
  { name: 'Dorf-/Mischgebiet', icon: '🏘️', grz: 0.6, gfz: 1.2 },
  { name: 'Kerngebiet (Stadt)', icon: '🏢', grz: 1.0, gfz: 3.0 },
  { name: 'Gewerbegebiet', icon: '🏭', grz: 0.8, gfz: 2.4 },
  { name: 'Eigene Eingabe', icon: '🔧', grz: 0.35, gfz: 0.7 },
];

export function GrzGfzRechner() {
  const [gebietIndex, setGebietIndex] = useState(0);
  const [grundstuecksflaeche, setGrundstuecksflaeche] = useState(600);
  const [grz, setGrz] = useState(GEBIETE[0].grz);
  const [gfz, setGfz] = useState(GEBIETE[0].gfz);
  const [wohnflaecheFaktor, setWohnflaecheFaktor] = useState(WOHNFLAECHE_FAKTOR_DEFAULT);
  const [garagenPruefen, setGaragenPruefen] = useState(false);
  const [garagenflaeche, setGaragenflaeche] = useState(50);

  // Wandelt eine Eingabe robust in eine Zahl >= 0 um (leeres Feld oder
  // ungueltige Eingabe ergibt 0 statt NaN).
  const toNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleGebietWechsel = (index: number) => {
    setGebietIndex(index);
    const g = GEBIETE[index];
    setGrz(g.grz);
    setGfz(g.gfz);
  };

  // (1) Zulaessige Grundflaeche (Gebaeude-Grundflaeche) = GRZ x Grundstuecksflaeche
  const zulaessigeGr = grz * grundstuecksflaeche;

  // (2) Zulaessige Geschossflaeche = GFZ x Grundstuecksflaeche
  const zulaessigeGf = gfz * grundstuecksflaeche;

  // (3) GRZ-Ueberschreitung fuer Garagen/Stellplaetze/Nebenanlagen (BauNVO § 19 Abs. 4):
  // zulaessige GR darf um bis zu 50 % ueberschritten werden, ABER absolute Obergrenze
  // der GRZ-Summe = 0,8 -> max. anrechenbare versiegelte Flaeche.
  const maxVersiegelungFaktor = zulaessigeGr * 1.5;
  const maxVersiegelungKappung = GRZ_OBERGRENZE * grundstuecksflaeche;
  const maxVersiegelung = Math.min(maxVersiegelungFaktor, maxVersiegelungKappung);
  // Greift die 0,8-Kappung (statt der 50-%-Regel)?
  const kappungGreift = maxVersiegelungKappung < maxVersiegelungFaktor;
  // Zusaetzliche Flaeche fuer Garagen & Co. ueber die reine Gebaeude-GR hinaus
  const zusaetzlicheVersiegelung = Math.max(0, maxVersiegelung - zulaessigeGr);
  // Bewertung der geplanten Garagenflaeche
  const garagenPasst = garagenflaeche <= zusaetzlicheVersiegelung;

  // (4) Ueberschlaegige Wohnflaeche aus Geschossflaeche
  const wohnflaeche = zulaessigeGf * wohnflaecheFaktor;

  // (5) Anzahl Vollgeschosse (Richtwert), wenn voll auf der bebaubaren Grundflaeche gestapelt
  const vollgeschosse = zulaessigeGr > 0 ? Math.ceil(zulaessigeGf / zulaessigeGr) : 0;

  const formatQm = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const formatZahl = (v: number) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">

      {/* Gebiets-Voreinstellungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <span className="text-gray-700 font-medium block mb-3">Typische Bebauung (setzt GRZ &amp; GFZ)</span>
        <div className="grid grid-cols-3 gap-2">
          {GEBIETE.map((g, i) => (
            <button
              key={g.name}
              onClick={() => handleGebietWechsel(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                gebietIndex === i
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{g.icon}</span>
              <span className="text-center leading-tight">{g.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Maßgeblich sind immer die Festsetzungen Ihres Bebauungsplans – diese Werte sind nur Startwerte.
        </p>
      </div>

      {/* Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Grundstücksfläche</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={grundstuecksflaeche}
              onChange={(e) => setGrundstuecksflaeche(toNumber(e.target.value))}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">GRZ – Grundflächenzahl</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={1}
              step={0.05}
              value={grz}
              onChange={(e) => setGrz(toNumber(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Anteil der überbaubaren Grundstücksfläche (z. B. 0,4 = 40 %). Steht im Bebauungsplan.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">GFZ – Geschossflächenzahl</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={gfz}
              onChange={(e) => setGfz(toNumber(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Verhältnis Geschossfläche zur Grundstücksfläche (z. B. 0,8). Steht im Bebauungsplan.
          </span>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Wohnflächen-Faktor</span>
          <div className="mt-2 relative">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={1}
              step={0.01}
              value={wohnflaecheFaktor}
              onChange={(e) => setWohnflaecheFaktor(Math.min(1, toNumber(e.target.value)))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Anteil der Geschossfläche, der als Wohnfläche nutzbar ist (üblich 0,75–0,85; Default 0,80).
          </span>
        </label>

        {/* Garagen-/Stellplatzpruefung */}
        <div className="border-t border-gray-100 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={garagenPruefen}
              onChange={(e) => setGaragenPruefen(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Garagen / Stellplätze / Zufahrt prüfen</span>
          </label>
          {garagenPruefen && (
            <label className="block mt-3">
              <span className="text-sm text-gray-600">
                Geplante Fläche für Garagen, Stellplätze, Zufahrten &amp; Nebenanlagen
              </span>
              <div className="mt-2 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={garagenflaeche}
                  onChange={(e) => setGaragenflaeche(toNumber(e.target.value))}
                  className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                Diese Flächen dürfen die zulässige Grundfläche um bis zu 50 % erhöhen – gedeckelt bei einer GRZ-Summe von 0,8 (BauNVO § 19 Abs. 4).
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-sm font-medium text-blue-100 mb-1">So viel dürfen Sie bauen</h3>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatQm(zulaessigeGf)}</span>
            <span className="text-xl text-blue-200">m² Geschossfläche</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            ≈ {formatQm(wohnflaeche)} m² Wohnfläche (Faktor {formatZahl(wohnflaecheFaktor)})
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Bebaubare Grundfläche (GR)</span>
              <span className="text-xl font-bold">{formatQm(zulaessigeGr)} m²</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-100">Vollgeschosse (Richtwert)</span>
              <span className="font-bold">{vollgeschosse} Geschoss(e)</span>
            </div>
          </div>

          {garagenPruefen && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Spielraum für Garagen &amp; Co.</span>
                <span className="font-bold">+ {formatQm(zusaetzlicheVersiegelung)} m²</span>
              </div>
              <p className={`text-xs mt-2 ${garagenPasst ? 'text-green-200' : 'text-yellow-200'}`}>
                {garagenPasst
                  ? `✓ Geplante ${formatQm(garagenflaeche)} m² liegen im Rahmen.`
                  : `⚠ Geplante ${formatQm(garagenflaeche)} m² überschreiten den Spielraum von ${formatQm(zusaetzlicheVersiegelung)} m².`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rechenweg */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">🧮 So wird gerechnet</h3>
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
          <p>
            <strong>Grundfläche (GR)</strong> = GRZ × Grundstücksfläche
          </p>
          <p>
            = {formatZahl(grz)} × {formatQm(grundstuecksflaeche)} m² ={' '}
            <strong>{formatQm(zulaessigeGr)} m²</strong>
          </p>
          <p>
            <strong>Geschossfläche (GF)</strong> = GFZ × Grundstücksfläche
          </p>
          <p>
            = {formatZahl(gfz)} × {formatQm(grundstuecksflaeche)} m² ={' '}
            <strong>{formatQm(zulaessigeGf)} m²</strong>
          </p>
          <p>
            <strong>Wohnfläche</strong> ≈ GF × Faktor = {formatQm(zulaessigeGf)} m² × {formatZahl(wohnflaecheFaktor)} ={' '}
            <strong>{formatQm(wohnflaeche)} m²</strong>
          </p>
          {garagenPruefen && (
            <p>
              <strong>Max. versiegelt</strong> = min(GR × 1,5; 0,8 × Grundstück) = min({formatQm(maxVersiegelungFaktor)}; {formatQm(maxVersiegelungKappung)}) ={' '}
              <strong>{formatQm(maxVersiegelung)} m²</strong>
              {kappungGreift && ' (0,8-Kappung greift)'}
            </p>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <p>
          <strong>Wichtiger Hinweis:</strong> Die Ergebnisse sind unverbindliche Richtwerte auf Basis der
          BauNVO §§ 19/20 und ersetzen <strong>keine rechtsverbindliche Prüfung</strong>. Maßgeblich sind
          die konkreten Festsetzungen des rechtskräftigen Bebauungsplans Ihrer Gemeinde (eigene
          GRZ-Überschreitungsregeln, Höchstgrenzen, Vollgeschoss-Definition nach Landesbauordnung können
          abweichen) sowie die Auskunft des zuständigen Bauamts oder Ihres Architekten. Die
          Vollgeschoss-Zahl ist nur eine Näherung, da die Definition Ländersache ist. Keine Gewähr für die
          Genehmigungsfähigkeit. Angaben ohne Gewähr – keine Rechts- oder Bauberatung.
        </p>
      </div>
    </div>
  );
}

export default GrzGfzRechner;
