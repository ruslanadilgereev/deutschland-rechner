import { useState, useMemo } from 'react';

// SF-Klassen mit Beitragssätzen (in % des Grundbeitrags)
// SF0 = 230%, SF1 = 145%, ... SF35 = 20%
const SF_KLASSEN: { klasse: string; faktor: number; beschreibung: string }[] = [
  { klasse: 'SF0', faktor: 2.30, beschreibung: '0 Jahre schadensfrei' },
  { klasse: 'SF½', faktor: 1.00, beschreibung: '½ Jahr schadensfrei' },
  { klasse: 'SF1', faktor: 1.45, beschreibung: '1 Jahr schadensfrei' },
  { klasse: 'SF2', faktor: 0.85, beschreibung: '2 Jahre schadensfrei' },
  { klasse: 'SF3', faktor: 0.70, beschreibung: '3 Jahre schadensfrei' },
  { klasse: 'SF4', faktor: 0.60, beschreibung: '4 Jahre schadensfrei' },
  { klasse: 'SF5', faktor: 0.55, beschreibung: '5 Jahre schadensfrei' },
  { klasse: 'SF6', faktor: 0.50, beschreibung: '6 Jahre schadensfrei' },
  { klasse: 'SF7', faktor: 0.47, beschreibung: '7 Jahre schadensfrei' },
  { klasse: 'SF8', faktor: 0.44, beschreibung: '8 Jahre schadensfrei' },
  { klasse: 'SF9', faktor: 0.41, beschreibung: '9 Jahre schadensfrei' },
  { klasse: 'SF10', faktor: 0.38, beschreibung: '10 Jahre schadensfrei' },
  { klasse: 'SF15', faktor: 0.32, beschreibung: '15 Jahre schadensfrei' },
  { klasse: 'SF20', faktor: 0.27, beschreibung: '20 Jahre schadensfrei' },
  { klasse: 'SF25', faktor: 0.24, beschreibung: '25 Jahre schadensfrei' },
  { klasse: 'SF30', faktor: 0.22, beschreibung: '30 Jahre schadensfrei' },
  { klasse: 'SF35', faktor: 0.20, beschreibung: '35 Jahre schadensfrei' },
];

// Sonderklassen
const SONDER_KLASSEN = [
  { klasse: 'M', faktor: 2.40, beschreibung: 'Malus (nach Schäden)' },
  { klasse: 'S', faktor: 1.50, beschreibung: 'Anfänger ohne Vorerfahrung' },
];

// Typklassen - beeinflusst den Grundbeitrag
// Niedrige Typklasse = günstiger, Hohe = teurer
const TYPKLASSEN = {
  haftpflicht: { min: 10, max: 25, basis: 14 },
  teilkasko: { min: 10, max: 33, basis: 18 },
  vollkasko: { min: 10, max: 34, basis: 20 },
};

// Regionalklassen (1-12 für Haftpflicht, 1-16 für Kasko)
// Niedrige Regionalklasse = günstig, Hohe = teuer
const REGIONALKLASSEN = {
  haftpflicht: { min: 1, max: 12, mittel: 6 },
  teilkasko: { min: 1, max: 16, mittel: 5 },
  vollkasko: { min: 1, max: 9, mittel: 4 },
};

// Beispiel-Regionen mit typischen Klassen
const REGIONEN = [
  { name: 'Ländliche Region (z.B. Schleswig-Holstein)', haftpflicht: 3, teilkasko: 4, vollkasko: 2 },
  { name: 'Kleinstadt (z.B. Münsterland)', haftpflicht: 5, teilkasko: 6, vollkasko: 3 },
  { name: 'Mittelstadt (z.B. Hannover)', haftpflicht: 7, teilkasko: 8, vollkasko: 5 },
  { name: 'Großstadt (z.B. Hamburg, München)', haftpflicht: 10, teilkasko: 12, vollkasko: 7 },
  { name: 'Problemregion (z.B. Berlin-Mitte)', haftpflicht: 12, teilkasko: 16, vollkasko: 9 },
  { name: 'Eigene Angabe', haftpflicht: 6, teilkasko: 5, vollkasko: 4 },
];

// Fahrzeugtypen mit typischen Typklassen
const FAHRZEUGTYPEN = [
  { name: 'Kleinwagen (z.B. VW Polo, Opel Corsa)', emoji: '🚗', haftpflicht: 12, teilkasko: 15, vollkasko: 14 },
  { name: 'Kompaktklasse (z.B. VW Golf, Opel Astra)', emoji: '🚙', haftpflicht: 14, teilkasko: 18, vollkasko: 18 },
  { name: 'Mittelklasse (z.B. VW Passat, BMW 3er)', emoji: '🚘', haftpflicht: 16, teilkasko: 21, vollkasko: 22 },
  { name: 'SUV (z.B. VW Tiguan, BMW X3)', emoji: '🚐', haftpflicht: 17, teilkasko: 22, vollkasko: 23 },
  { name: 'Oberklasse (z.B. Mercedes E-Klasse)', emoji: '🏎️', haftpflicht: 19, teilkasko: 25, vollkasko: 27 },
  { name: 'Sportwagen', emoji: '🏁', haftpflicht: 22, teilkasko: 30, vollkasko: 32 },
  { name: 'Eigene Typklassen', emoji: '⚙️', haftpflicht: 14, teilkasko: 18, vollkasko: 20 },
];

// Versicherungsarten
type VersicherungsArt = 'haftpflicht' | 'teilkasko' | 'vollkasko';

// Durchschnittliche Grundbeiträge 2025/2026 (geschätzt)
const GRUNDBEITRAG: Record<VersicherungsArt, number> = {
  haftpflicht: 280, // € pro Jahr (Typklasse 14, Regionalklasse 6)
  teilkasko: 120,   // € pro Jahr
  vollkasko: 380,   // € pro Jahr (inkl. Teilkasko)
};

export default function KfzVersicherungRechner() {
  const [sfKlasseIndex, setSfKlasseIndex] = useState(4); // SF3
  const [fahrzeugTypIndex, setFahrzeugTypIndex] = useState(1); // Kompaktklasse
  const [regionIndex, setRegionIndex] = useState(2); // Mittelstadt
  const [versicherungsArt, setVersicherungsArt] = useState<VersicherungsArt>('haftpflicht');
  const [eigeneTypklassen, setEigeneTypklassen] = useState(false);
  const [typklasseHaftpflicht, setTypklasseHaftpflicht] = useState(14);
  const [typklasseTeilkasko, setTypklasseTeilkasko] = useState(18);
  const [typklasseVollkasko, setTypklasseVollkasko] = useState(20);
  const [eigeneRegionalklassen, setEigeneRegionalklassen] = useState(false);
  const [regionalklasseHaftpflicht, setRegionalklasseHaftpflicht] = useState(6);
  const [regionalklasseTeilkasko, setRegionalklasseTeilkasko] = useState(5);
  const [regionalklasseVollkasko, setRegionalklasseVollkasko] = useState(4);
  const [selbstbeteiligung, setSelbstbeteiligung] = useState(150); // TK: 150€, VK: 300€ üblich
  const [jahresmitZusatzoptionen, setJahreskilometer] = useState(12000);

  const alleKlassen = [...SONDER_KLASSEN, ...SF_KLASSEN];
  const sfKlasse = alleKlassen[sfKlasseIndex];
  const fahrzeugTyp = FAHRZEUGTYPEN[fahrzeugTypIndex];
  const region = REGIONEN[regionIndex];

  // Berechnung
  const ergebnis = useMemo(() => {
    // Typklassen ermitteln
    const tkH = eigeneTypklassen ? typklasseHaftpflicht : fahrzeugTyp.haftpflicht;
    const tkT = eigeneTypklassen ? typklasseTeilkasko : fahrzeugTyp.teilkasko;
    const tkV = eigeneTypklassen ? typklasseVollkasko : fahrzeugTyp.vollkasko;

    // Regionalklassen ermitteln
    const rkH = eigeneRegionalklassen ? regionalklasseHaftpflicht : region.haftpflicht;
    const rkT = eigeneRegionalklassen ? regionalklasseTeilkasko : region.teilkasko;
    const rkV = eigeneRegionalklassen ? regionalklasseVollkasko : region.vollkasko;

    // Typklassen-Faktor: Abweichung von der Basis
    const typFaktorH = 1 + (tkH - TYPKLASSEN.haftpflicht.basis) * 0.04;
    const typFaktorT = 1 + (tkT - TYPKLASSEN.teilkasko.basis) * 0.035;
    const typFaktorV = 1 + (tkV - TYPKLASSEN.vollkasko.basis) * 0.04;

    // Regionalklassen-Faktor: Abweichung von der Mitte
    const regFaktorH = 1 + (rkH - REGIONALKLASSEN.haftpflicht.mittel) * 0.08;
    const regFaktorT = 1 + (rkT - REGIONALKLASSEN.teilkasko.mittel) * 0.06;
    const regFaktorV = 1 + (rkV - REGIONALKLASSEN.vollkasko.mittel) * 0.10;

    // SF-Klassen-Faktor
    const sfFaktor = sfKlasse.faktor;

    // Jahreskilometer-Faktor
    let kmFaktor = 1.0;
    if (jahresmitZusatzoptionen <= 6000) kmFaktor = 0.85;
    else if (jahresmitZusatzoptionen <= 9000) kmFaktor = 0.90;
    else if (jahresmitZusatzoptionen <= 12000) kmFaktor = 1.00;
    else if (jahresmitZusatzoptionen <= 15000) kmFaktor = 1.05;
    else if (jahresmitZusatzoptionen <= 20000) kmFaktor = 1.12;
    else if (jahresmitZusatzoptionen <= 25000) kmFaktor = 1.20;
    else kmFaktor = 1.30;

    // Selbstbeteiligung-Rabatt
    let sbRabattTK = 0;
    let sbRabattVK = 0;
    if (selbstbeteiligung >= 150) sbRabattTK = 0.10;
    if (selbstbeteiligung >= 300) sbRabattTK = 0.15;
    if (selbstbeteiligung >= 500) sbRabattVK = 0.15;
    if (selbstbeteiligung >= 1000) sbRabattVK = 0.25;

    // Berechnung der einzelnen Beiträge
    const haftpflicht = GRUNDBEITRAG.haftpflicht * typFaktorH * regFaktorH * sfFaktor * kmFaktor;
    const teilkasko = GRUNDBEITRAG.teilkasko * typFaktorT * regFaktorT * (1 - sbRabattTK) * kmFaktor;
    const vollkaskoZusatz = GRUNDBEITRAG.vollkasko * typFaktorV * regFaktorV * sfFaktor * (1 - sbRabattVK) * kmFaktor;

    // Je nach gewählter Versicherungsart
    let gesamt = haftpflicht;
    if (versicherungsArt === 'teilkasko') {
      gesamt = haftpflicht + teilkasko;
    } else if (versicherungsArt === 'vollkasko') {
      gesamt = haftpflicht + teilkasko + vollkaskoZusatz;
    }

    // Monatlich
    const monatlich = gesamt / 12;

    // Spanne (± 20%)
    const minBeitrag = gesamt * 0.75;
    const maxBeitrag = gesamt * 1.35;

    return {
      haftpflicht: Math.round(haftpflicht),
      teilkasko: Math.round(teilkasko),
      vollkaskoZusatz: Math.round(vollkaskoZusatz),
      gesamt: Math.round(gesamt),
      monatlich: Math.round(monatlich * 100) / 100,
      minBeitrag: Math.round(minBeitrag),
      maxBeitrag: Math.round(maxBeitrag),
      typklassen: { haftpflicht: tkH, teilkasko: tkT, vollkasko: tkV },
      regionalklassen: { haftpflicht: rkH, teilkasko: rkT, vollkasko: rkV },
      sfFaktor: Math.round(sfFaktor * 100),
    };
  }, [sfKlasseIndex, fahrzeugTypIndex, regionIndex, versicherungsArt, 
      eigeneTypklassen, typklasseHaftpflicht, typklasseTeilkasko, typklasseVollkasko,
      eigeneRegionalklassen, regionalklasseHaftpflicht, regionalklasseTeilkasko, regionalklasseVollkasko,
      selbstbeteiligung, jahresmitZusatzoptionen, sfKlasse, fahrzeugTyp, region]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Wichtiger Hinweis */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <div className="flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-amber-800 mb-1">Vereinfachte Schätzung</h3>
            <p className="text-sm text-amber-700">
              Dieser Rechner liefert eine <strong>grobe Orientierung</strong>. Der tatsächliche Beitrag 
              hängt von vielen weiteren Faktoren ab (Alter, Garage, Nutzung, Vorschäden, etc.). 
              Für ein verbindliches Angebot nutzen Sie bitte Vergleichsportale oder fragen Sie direkt 
              bei Versicherern an.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* SF-Klasse */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Schadenfreiheitsklasse (SF-Klasse)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Je mehr Jahre unfallfrei, desto günstiger
            </span>
          </label>
          <select
            value={sfKlasseIndex}
            onChange={(e) => setSfKlasseIndex(Number(e.target.value))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-lg"
          >
            {alleKlassen.map((klasse, index) => (
              <option key={index} value={index}>
                {klasse.klasse} – {klasse.beschreibung} ({Math.round(klasse.faktor * 100)}%)
              </option>
            ))}
          </select>
          <div className="mt-2 text-sm text-gray-500">
            <strong>Ihr SF-Beitragssatz:</strong> {ergebnis.sfFaktor}% des Grundbeitrags
          </div>
        </div>

        {/* Versicherungsart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Versicherungsart</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'haftpflicht', name: 'Haftpflicht', emoji: '🛡️', beschreibung: 'Pflicht' },
              { id: 'teilkasko', name: 'Teilkasko', emoji: '🔒', beschreibung: '+ TK' },
              { id: 'vollkasko', name: 'Vollkasko', emoji: '💎', beschreibung: '+ VK' },
            ].map((art) => (
              <button
                key={art.id}
                onClick={() => setVersicherungsArt(art.id as VersicherungsArt)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  versicherungsArt === art.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{art.emoji}</span>
                <span className="block text-sm mt-1">{art.name}</span>
                <span className="block text-xs opacity-70">{art.beschreibung}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fahrzeugtyp */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Fahrzeugtyp / Typklasse</span>
            <span className="text-xs text-gray-500 block mt-1">
              Bestimmt die Schadensstatistik des Fahrzeugmodells
            </span>
          </label>
          <select
            value={fahrzeugTypIndex}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setFahrzeugTypIndex(idx);
              if (idx === FAHRZEUGTYPEN.length - 1) {
                setEigeneTypklassen(true);
              } else {
                setEigeneTypklassen(false);
              }
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 text-lg"
          >
            {FAHRZEUGTYPEN.map((typ, index) => (
              <option key={index} value={index}>
                {typ.emoji} {typ.name}
              </option>
            ))}
          </select>
          
          {eigeneTypklassen && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
              <p className="text-sm text-gray-600 mb-2">
                Typklassen finden Sie in Ihrem Fahrzeugschein oder auf{' '}
                <a href="https://www.gdv.de/gdv/service/typklassenabfrage" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  gdv.de
                </a>
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500">TK Haftpflicht (10-25)</label>
                  <input
                    type="number"
                    value={typklasseHaftpflicht}
                    onChange={(e) => setTypklasseHaftpflicht(Math.min(25, Math.max(10, Number(e.target.value))))}
                    className="w-full p-2 border rounded-lg text-center"
                    min="10"
                    max="25"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">TK Teilkasko (10-33)</label>
                  <input
                    type="number"
                    value={typklasseTeilkasko}
                    onChange={(e) => setTypklasseTeilkasko(Math.min(33, Math.max(10, Number(e.target.value))))}
                    className="w-full p-2 border rounded-lg text-center"
                    min="10"
                    max="33"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">TK Vollkasko (10-34)</label>
                  <input
                    type="number"
                    value={typklasseVollkasko}
                    onChange={(e) => setTypklasseVollkasko(Math.min(34, Math.max(10, Number(e.target.value))))}
                    className="w-full p-2 border rounded-lg text-center"
                    min="10"
                    max="34"
                  />
                </div>
              </div>
            </div>
          )}
          
          {!eigeneTypklassen && (
            <div className="mt-2 text-sm text-gray-500">
              Typklassen: HP {ergebnis.typklassen.haftpflicht} | TK {ergebnis.typklassen.teilkasko} | VK {ergebnis.typklassen.vollkasko}
            </div>
          )}
        </div>

        {/* Region */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Region / Regionalklasse</span>
            <span className="text-xs text-gray-500 block mt-1">
              Basiert auf der Schadenshäufigkeit in Ihrem Zulassungsbezirk
            </span>
          </label>
          <select
            value={regionIndex}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setRegionIndex(idx);
              if (idx === REGIONEN.length - 1) {
                setEigeneRegionalklassen(true);
              } else {
                setEigeneRegionalklassen(false);
              }
            }}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 text-lg"
          >
            {REGIONEN.map((reg, index) => (
              <option key={index} value={index}>
                {reg.name}
              </option>
            ))}
          </select>
          
          {eigeneRegionalklassen && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
              <p className="text-sm text-gray-600 mb-2">
                Regionalklassen finden Sie auf{' '}
                <a href="https://www.gdv.de/gdv/service/regionalklassenabfrage" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  gdv.de
                </a>
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500">RK Haftpflicht (1-12)</label>
                  <input
                    type="number"
                    value={regionalklasseHaftpflicht}
                    onChange={(e) => setRegionalklasseHaftpflicht(Math.min(12, Math.max(1, Number(e.target.value))))}
                    className="w-full p-2 border rounded-lg text-center"
                    min="1"
                    max="12"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">RK Teilkasko (1-16)</label>
                  <input
                    type="number"
                    value={regionalklasseTeilkasko}
                    onChange={(e) => setRegionalklasseTeilkasko(Math.min(16, Math.max(1, Number(e.target.value))))}
                    className="w-full p-2 border rounded-lg text-center"
                    min="1"
                    max="16"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">RK Vollkasko (1-9)</label>
                  <input
                    type="number"
                    value={regionalklasseVollkasko}
                    onChange={(e) => setRegionalklasseVollkasko(Math.min(9, Math.max(1, Number(e.target.value))))}
                    className="w-full p-2 border rounded-lg text-center"
                    min="1"
                    max="9"
                  />
                </div>
              </div>
            </div>
          )}
          
          {!eigeneRegionalklassen && (
            <div className="mt-2 text-sm text-gray-500">
              Regionalklassen: HP {ergebnis.regionalklassen.haftpflicht} | TK {ergebnis.regionalklassen.teilkasko} | VK {ergebnis.regionalklassen.vollkasko}
            </div>
          )}
        </div>

        {/* Jahreskilometer */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jährliche Fahrleistung</span>
          </label>
          <select
            value={jahresmitZusatzoptionen}
            onChange={(e) => setJahreskilometer(Number(e.target.value))}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 text-lg"
          >
            <option value={6000}>bis 6.000 km/Jahr</option>
            <option value={9000}>bis 9.000 km/Jahr</option>
            <option value={12000}>bis 12.000 km/Jahr</option>
            <option value={15000}>bis 15.000 km/Jahr</option>
            <option value={20000}>bis 20.000 km/Jahr</option>
            <option value={25000}>bis 25.000 km/Jahr</option>
            <option value={30000}>über 25.000 km/Jahr</option>
          </select>
        </div>

        {/* Selbstbeteiligung (nur bei Kasko) */}
        {versicherungsArt !== 'haftpflicht' && (
          <div className="mb-4">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Selbstbeteiligung (SB)</span>
              <span className="text-xs text-gray-500 block mt-1">
                Höhere SB = niedrigerer Beitrag
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 150, 300, 500, 1000].map((sb) => (
                <button
                  key={sb}
                  onClick={() => setSelbstbeteiligung(sb)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    selbstbeteiligung === sb
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sb === 0 ? 'Keine' : formatEuro(sb)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Üblich: Teilkasko 150 €, Vollkasko 300 € oder 500 €
            </p>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🛡️ Geschätzte Kfz-Versicherung</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">ca. {formatEuro(ergebnis.gesamt)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          <p className="text-orange-100 mt-2 text-sm">
            entspricht ca. {formatEuro(ergebnis.monatlich)} / Monat
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Haftpflicht</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.haftpflicht)}</div>
          </div>
          {versicherungsArt !== 'haftpflicht' && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">+ Teilkasko</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.teilkasko)}</div>
            </div>
          )}
          {versicherungsArt === 'vollkasko' && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm col-span-2">
              <span className="text-sm opacity-80">+ Vollkasko-Zusatz</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.vollkaskoZusatz)}</div>
            </div>
          )}
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <span className="text-sm opacity-80">Realistische Preisspanne</span>
          <div className="text-lg font-bold">
            {formatEuro(ergebnis.minBeitrag)} – {formatEuro(ergebnis.maxBeitrag)}
          </div>
          <p className="text-xs opacity-70 mt-1">
            Je nach Versicherer und weiteren Faktoren
          </p>
        </div>
      </div>

      {/* Vergleichsportale Empfehlung */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <div className="flex gap-3">
          <span className="text-3xl">💡</span>
          <div>
            <h3 className="font-bold text-blue-800 mb-2">Für verbindliche Angebote: Vergleichsportale nutzen</h3>
            <p className="text-sm text-blue-700 mb-4">
              Unser Rechner liefert nur eine Schätzung. Für echte Preise mit allen Ihren persönlichen 
              Daten empfehlen wir einen Vergleich über:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="https://www.check24.de/kfz-versicherung/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-xl">✓</span>
                <span className="font-medium text-gray-800">Check24</span>
              </a>
              <a 
                href="https://www.verivox.de/kfz-versicherung/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-xl">✓</span>
                <span className="font-medium text-gray-800">Verivox</span>
              </a>
              <a 
                href="https://www.huk24.de/kfz-versicherung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-xl">✓</span>
                <span className="font-medium text-gray-800">HUK24</span>
              </a>
              <a 
                href="https://www.cosmosdirekt.de/kfz-versicherung/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-xl">✓</span>
                <span className="font-medium text-gray-800">CosmosDirekt</span>
              </a>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              💸 Durch Vergleichen können Sie oft <strong>100-300 € pro Jahr sparen!</strong>
            </p>
          </div>
        </div>
      </div>

      {/* SF-Klassen Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 SF-Klassen & Beitragssätze</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">SF-Klasse</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Beitragssatz</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Bedeutung</th>
              </tr>
            </thead>
            <tbody>
              {[
                { klasse: 'M', faktor: '240%', beschreibung: 'Nach mehreren Schäden' },
                { klasse: 'SF0', faktor: '230%', beschreibung: 'Anfänger mit Vorfahrung' },
                { klasse: 'SF½', faktor: '100%', beschreibung: '6 Monate schadensfrei' },
                { klasse: 'SF1', faktor: '145%', beschreibung: '1 Jahr schadensfrei' },
                { klasse: 'SF3', faktor: '70%', beschreibung: '3 Jahre schadensfrei' },
                { klasse: 'SF5', faktor: '55%', beschreibung: '5 Jahre schadensfrei' },
                { klasse: 'SF10', faktor: '38%', beschreibung: '10 Jahre schadensfrei' },
                { klasse: 'SF20', faktor: '27%', beschreibung: '20 Jahre schadensfrei' },
                { klasse: 'SF35', faktor: '20%', beschreibung: '35+ Jahre schadensfrei' },
              ].map((row, i) => (
                <tr key={i} className={`border-b border-gray-100 ${sfKlasse.klasse === row.klasse ? 'bg-orange-50' : ''}`}>
                  <td className="py-2 px-3 font-medium">{row.klasse}</td>
                  <td className="py-2 px-3 text-center font-bold">{row.faktor}</td>
                  <td className="py-2 px-3 text-gray-600">{row.beschreibung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Die SF-Klasse gilt nur für die Haftpflicht und Vollkasko, nicht für die Teilkasko.
          Nach einem Schaden werden Sie typischerweise zurückgestuft.
        </p>
      </div>

      {/* Was beeinflusst den Beitrag? */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🎯 Was beeinflusst den Kfz-Versicherungsbeitrag?</h3>
        
        <div className="space-y-4 text-sm">
          <div className="flex gap-3">
            <span className="text-xl">📅</span>
            <div>
              <span className="font-semibold text-gray-800">SF-Klasse</span>
              <p className="text-gray-600">Wichtigster Faktor! Je mehr Jahre unfallfrei, desto günstiger (SF35 zahlt nur 20% von SF0)</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-xl">🚗</span>
            <div>
              <span className="font-semibold text-gray-800">Typklasse</span>
              <p className="text-gray-600">Basiert auf Schadensstatistik des Fahrzeugmodells. Sportwagen teurer als Kleinwagen.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-xl">📍</span>
            <div>
              <span className="font-semibold text-gray-800">Regionalklasse</span>
              <p className="text-gray-600">Abhängig vom Zulassungsbezirk. Großstädte teurer als ländliche Regionen.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-xl">🧑</span>
            <div>
              <span className="font-semibold text-gray-800">Alter des Fahrers</span>
              <p className="text-gray-600">Unter 25 Jahre deutlich teurer. Ab 25-65 günstigste Tarife.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-xl">🛣️</span>
            <div>
              <span className="font-semibold text-gray-800">Jährliche Fahrleistung</span>
              <p className="text-gray-600">Weniger km/Jahr = günstiger. 6.000 km günstiger als 20.000 km.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-xl">🏠</span>
            <div>
              <span className="font-semibold text-gray-800">Stellplatz</span>
              <p className="text-gray-600">Garage oder Carport günstiger als Straßenparkplatz.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="text-xl">💼</span>
            <div>
              <span className="font-semibold text-gray-800">Beruf & Nutzung</span>
              <p className="text-gray-600">Nur Privatnutzung günstiger als dienstliche Nutzung.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spartipps */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💰 Spartipps für die Kfz-Versicherung</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Jährliche Zahlung:</strong> Spart bis zu 10% gegenüber Monatszahlung</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Werkstattbindung:</strong> Spart 10-20% (Reparatur nur in Partnerwerkstätten)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Telematik-Tarif:</strong> Bis 30% Rabatt für vorausschauendes Fahren</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Fahrerkreis einschränken:</strong> Nur Fahrer über 25 spart deutlich</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>SF-Klasse übertragen:</strong> Von Eltern oder Partner übernehmen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>November wechseln:</strong> Stichtag 30.11. – dann kündigen & vergleichen!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Rabatte nutzen:</strong> ADAC, Berufsgruppen, Zweitwagenrabatt</span>
          </li>
        </ul>
      </div>

      {/* Haftpflicht vs. Kasko */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔒 Haftpflicht, Teilkasko oder Vollkasko?</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🛡️</span>
              <span className="font-bold text-gray-800">Kfz-Haftpflicht (Pflicht!)</span>
            </div>
            <p className="text-sm text-gray-600">
              Zahlt Schäden, die Sie anderen zufügen. <strong>Gesetzlich vorgeschrieben!</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Deckungssumme: mind. 7,5 Mio € Personenschäden, 1,22 Mio € Sachschäden
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔒</span>
              <span className="font-bold text-blue-800">Teilkasko</span>
            </div>
            <p className="text-sm text-blue-700">
              Zahlt zusätzlich: Diebstahl, Brand, Glasbruch, Wildunfall, Sturm, Hagel, Marderbiss
            </p>
            <p className="text-xs text-blue-600 mt-1">
              <strong>Empfohlen für:</strong> Fahrzeuge bis ca. 10 Jahre
            </p>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💎</span>
              <span className="font-bold text-amber-800">Vollkasko</span>
            </div>
            <p className="text-sm text-amber-700">
              Alles aus Teilkasko + selbstverschuldete Unfälle + Vandalismus
            </p>
            <p className="text-xs text-amber-600 mt-1">
              <strong>Empfohlen für:</strong> Neuwagen, Leasing, wertvolle Fahrzeuge (bis ca. 5 Jahre)
            </p>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Links</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gdv.de/gdv/service/typklassenabfrage"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GDV – Typklassenabfrage
          </a>
          <a 
            href="https://www.gdv.de/gdv/service/regionalklassenabfrage"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GDV – Regionalklassenabfrage
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/pflvg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Pflichtversicherungsgesetz (PflVG)
          </a>
          <a 
            href="https://www.bafin.de/DE/Verbraucher/Versicherung/versicherung_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BaFin – Verbraucherinformationen Versicherung
          </a>
        </div>
      </div>
    </div>
  );
}
