import { useState, useMemo } from 'react';

// Erbschaftsteuer-Klassen basierend auf Verwandtschaftsverhältnis
// Quelle: § 15 ErbStG
type Steuerklasse = 'I' | 'II' | 'III';

interface Verwandtschaftsgrad {
  id: string;
  name: string;
  beschreibung: string;
  steuerklasse: Steuerklasse;
  freibetrag: number;
  icon: string;
}

// Verwandtschaftsgrade mit Freibeträgen nach § 16 ErbStG (Stand 2025/2026)
const VERWANDTSCHAFTSGRADE: Verwandtschaftsgrad[] = [
  { id: 'ehepartner', name: 'Ehepartner/Lebenspartner', beschreibung: 'Eingetragene Lebenspartnerschaft', steuerklasse: 'I', freibetrag: 500000, icon: '💑' },
  { id: 'kind', name: 'Kind', beschreibung: 'Leibliches Kind, Adoptivkind, Stiefkind', steuerklasse: 'I', freibetrag: 400000, icon: '👶' },
  { id: 'enkel_eltern_verstorben', name: 'Enkel (Eltern verstorben)', beschreibung: 'Wenn das Elternteil bereits verstorben ist', steuerklasse: 'I', freibetrag: 400000, icon: '👧' },
  { id: 'enkel', name: 'Enkel', beschreibung: 'Enkelkinder bei lebenden Eltern', steuerklasse: 'I', freibetrag: 200000, icon: '👧' },
  { id: 'urenkel', name: 'Urenkel / Eltern', beschreibung: 'Urenkel, Eltern des Erblassers', steuerklasse: 'I', freibetrag: 100000, icon: '👴' },
  { id: 'geschwister', name: 'Geschwister', beschreibung: 'Bruder, Schwester', steuerklasse: 'II', freibetrag: 20000, icon: '👫' },
  { id: 'nichten_neffen', name: 'Nichten/Neffen', beschreibung: 'Kinder von Geschwistern', steuerklasse: 'II', freibetrag: 20000, icon: '🧒' },
  { id: 'stiefeltern', name: 'Stiefeltern', beschreibung: 'Stiefmutter, Stiefvater', steuerklasse: 'II', freibetrag: 20000, icon: '👨‍👩‍👦' },
  { id: 'schwiegereltern', name: 'Schwiegereltern', beschreibung: 'Schwiegermutter, Schwiegervater', steuerklasse: 'II', freibetrag: 20000, icon: '👵' },
  { id: 'schwiegerkinder', name: 'Schwiegerkinder', beschreibung: 'Schwiegersohn, Schwiegertochter', steuerklasse: 'II', freibetrag: 20000, icon: '👨‍👩‍👧' },
  { id: 'geschiedener', name: 'Geschiedener Ehepartner', beschreibung: 'Ex-Ehepartner', steuerklasse: 'II', freibetrag: 20000, icon: '💔' },
  { id: 'sonstige', name: 'Sonstige Personen', beschreibung: 'Freunde, entfernte Verwandte, Lebensgefährte (nicht eingetragen)', steuerklasse: 'III', freibetrag: 20000, icon: '👤' },
];

// Steuersätze nach § 19 ErbStG (Stand 2025/2026)
// Steuersatz in % je nach steuerpflichtigem Erwerb und Steuerklasse
const STEUERSAETZE: Record<Steuerklasse, { bis: number; satz: number }[]> = {
  'I': [
    { bis: 75000, satz: 7 },
    { bis: 300000, satz: 11 },
    { bis: 600000, satz: 15 },
    { bis: 6000000, satz: 19 },
    { bis: 13000000, satz: 23 },
    { bis: 26000000, satz: 27 },
    { bis: Infinity, satz: 30 },
  ],
  'II': [
    { bis: 75000, satz: 15 },
    { bis: 300000, satz: 20 },
    { bis: 600000, satz: 25 },
    { bis: 6000000, satz: 30 },
    { bis: 13000000, satz: 35 },
    { bis: 26000000, satz: 40 },
    { bis: Infinity, satz: 43 },
  ],
  'III': [
    { bis: 75000, satz: 30 },
    { bis: 300000, satz: 30 },
    { bis: 600000, satz: 30 },
    { bis: 6000000, satz: 30 },
    { bis: 13000000, satz: 50 },
    { bis: 26000000, satz: 50 },
    { bis: Infinity, satz: 50 },
  ],
};

// Versorgungsfreibeträge nach § 17 ErbStG (nur für Steuerklasse I)
const VERSORGUNGSFREIBETRAEGE: Record<string, number> = {
  'ehepartner': 256000,
  'kind_bis_5': 52000,
  'kind_6_10': 41000,
  'kind_11_15': 30700,
  'kind_16_20': 20500,
  'kind_21_27': 10300,
};

// Zusätzlicher Hausratfreibetrag nach § 13 Abs. 1 Nr. 1 ErbStG
const HAUSRATFREIBETRAG_I = 41000; // Steuerklasse I
const HAUSRATFREIBETRAG_II_III = 12000; // Steuerklasse II und III

// Freibetrag für andere bewegliche Gegenstände § 13 Abs. 1 Nr. 1 ErbStG
const BEWEGLICHE_GEGENSTAENDE_FREIBETRAG = 12000; // Alle Steuerklassen

export default function ErbschaftsteuerRechner() {
  // Eingabewerte
  const [erbschaftswert, setErbschaftswert] = useState(250000);
  const [verwandtschaftsgrad, setVerwandtschaftsgrad] = useState<string>('kind');
  const [hatHausrat, setHatHausrat] = useState(false);
  const [hausratWert, setHausratWert] = useState(20000);
  const [hatBeweglicheGegenstaende, setHatBeweglicheGegenstaende] = useState(false);
  const [beweglicheWert, setBeweglicheWert] = useState(10000);
  const [istKind, setIstKind] = useState(false);
  const [kindesalter, setKindesalter] = useState(10);
  const [hatVorherigeBelastungen, setHatVorherigeBelastungen] = useState(false);
  const [belastungen, setBelastungen] = useState(0);
  const [hatVorschenkungen, setHatVorschenkungen] = useState(false);
  const [vorschenkungen, setVorschenkungen] = useState(0);

  const ergebnis = useMemo(() => {
    const verwandter = VERWANDTSCHAFTSGRADE.find(v => v.id === verwandtschaftsgrad)!;
    const steuerklasse = verwandter.steuerklasse;
    const persoenlichFreibetrag = verwandter.freibetrag;

    // Bruttowert der Erbschaft
    let bruttoErbschaft = erbschaftswert;

    // Hausratfreibetrag berechnen
    let hausratFreibetrag = 0;
    let hausratSteuerpflichtig = 0;
    if (hatHausrat) {
      const maxHausrat = steuerklasse === 'I' ? HAUSRATFREIBETRAG_I : HAUSRATFREIBETRAG_II_III;
      hausratFreibetrag = Math.min(hausratWert, maxHausrat);
      hausratSteuerpflichtig = Math.max(0, hausratWert - maxHausrat);
      bruttoErbschaft += hausratWert;
    }

    // Bewegliche Gegenstände Freibetrag
    let beweglicheFreibetrag = 0;
    let beweglicheSteuerpflichtig = 0;
    if (hatBeweglicheGegenstaende) {
      beweglicheFreibetrag = Math.min(beweglicheWert, BEWEGLICHE_GEGENSTAENDE_FREIBETRAG);
      beweglicheSteuerpflichtig = Math.max(0, beweglicheWert - BEWEGLICHE_GEGENSTAENDE_FREIBETRAG);
      bruttoErbschaft += beweglicheWert;
    }

    // Belastungen abziehen (Schulden, Bestattungskosten etc.)
    const abzugsfaehigeBelastungen = hatVorherigeBelastungen ? belastungen : 0;
    // Pauschale für Bestattungskosten: 10.300€ ohne Nachweis
    const bestattungspauschale = 10300;
    const gesamtBelastungen = Math.max(abzugsfaehigeBelastungen, bestattungspauschale);

    // Nettoerbschaft nach Belastungen
    const nettoErbschaft = Math.max(0, bruttoErbschaft - gesamtBelastungen);

    // Vorschenkungen der letzten 10 Jahre hinzurechnen
    const vorschenkungswert = hatVorschenkungen ? vorschenkungen : 0;
    const gesamtErwerb = nettoErbschaft + vorschenkungswert;

    // Versorgungsfreibetrag (nur Steuerklasse I)
    let versorgungsfreibetrag = 0;
    if (steuerklasse === 'I') {
      if (verwandtschaftsgrad === 'ehepartner') {
        versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.ehepartner;
      } else if (istKind && (verwandtschaftsgrad === 'kind' || verwandtschaftsgrad === 'enkel_eltern_verstorben')) {
        if (kindesalter <= 5) versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.kind_bis_5;
        else if (kindesalter <= 10) versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.kind_6_10;
        else if (kindesalter <= 15) versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.kind_11_15;
        else if (kindesalter <= 20) versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.kind_16_20;
        else if (kindesalter <= 27) versorgungsfreibetrag = VERSORGUNGSFREIBETRAEGE.kind_21_27;
      }
    }

    // Gesamte Freibeträge
    const gesamtSachfreibetraege = hausratFreibetrag + beweglicheFreibetrag;
    const gesamteFreibetraege = persoenlichFreibetrag + versorgungsfreibetrag + gesamtSachfreibetraege;

    // Steuerpflichtiger Erwerb
    const steuerpflichtigerErwerb = Math.max(0, gesamtErwerb - gesamteFreibetraege);

    // Steuersatz ermitteln
    const steuersaetze = STEUERSAETZE[steuerklasse];
    let anwendbarerSteuersatz = 0;
    for (const stufe of steuersaetze) {
      if (steuerpflichtigerErwerb <= stufe.bis) {
        anwendbarerSteuersatz = stufe.satz;
        break;
      }
    }

    // Erbschaftsteuer berechnen
    const erbschaftsteuer = Math.round(steuerpflichtigerErwerb * (anwendbarerSteuersatz / 100));

    // Effektiver Steuersatz bezogen auf Gesamterbschaft
    const effektiverSteuersatz = bruttoErbschaft > 0 
      ? ((erbschaftsteuer / bruttoErbschaft) * 100).toFixed(1)
      : '0.0';

    // Netto verbleibendes Erbe
    const nettoErbe = bruttoErbschaft - erbschaftsteuer;

    return {
      // Erbschaftswerte
      bruttoErbschaft,
      nettoErbschaft,
      gesamtErwerb,
      
      // Belastungen
      gesamtBelastungen,
      bestattungspauschale,
      abzugsfaehigeBelastungen,
      
      // Vorschenkungen
      vorschenkungswert,
      
      // Freibeträge
      persoenlichFreibetrag,
      versorgungsfreibetrag,
      hausratFreibetrag,
      beweglicheFreibetrag,
      gesamtSachfreibetraege,
      gesamteFreibetraege,
      
      // Steuerberechnung
      steuerpflichtigerErwerb,
      steuerklasse,
      anwendbarerSteuersatz,
      erbschaftsteuer,
      effektiverSteuersatz,
      
      // Ergebnis
      nettoErbe,
      
      // Zusatzinfo
      verwandter,
    };
  }, [
    erbschaftswert, verwandtschaftsgrad, hatHausrat, hausratWert,
    hatBeweglicheGegenstaende, beweglicheWert, istKind, kindesalter,
    hatVorherigeBelastungen, belastungen, hatVorschenkungen, vorschenkungen
  ]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  const steuerklasseInfo = {
    'I': { name: 'Steuerklasse I', beschreibung: 'Ehepartner, Kinder, Enkel', color: 'green' },
    'II': { name: 'Steuerklasse II', beschreibung: 'Geschwister, Nichten/Neffen, Schwiegereltern', color: 'yellow' },
    'III': { name: 'Steuerklasse III', beschreibung: 'Alle anderen Personen', color: 'red' },
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Erbschaftswert */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wert der Erbschaft</span>
            <span className="text-xs text-gray-500 block mt-1">Immobilien, Geldvermögen, Wertpapiere, Firmenbeteiligungen</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={erbschaftswert}
              onChange={(e) => setErbschaftswert(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(erbschaftswert, 2000000)}
            onChange={(e) => setErbschaftswert(Number(e.target.value))}
            className="w-full mt-3 accent-emerald-500"
            min="0"
            max="2000000"
            step="10000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>1 Mio €</span>
            <span>2 Mio €</span>
          </div>
        </div>

        {/* Verwandtschaftsgrad */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Verwandtschaftsverhältnis zum Erblasser</span>
            <span className="text-xs text-gray-500 block mt-1">Bestimmt Steuerklasse und Freibetrag</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VERWANDTSCHAFTSGRADE.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setVerwandtschaftsgrad(v.id);
                  // Reset Kind-spezifische Einstellungen wenn kein Kind
                  if (v.id !== 'kind' && v.id !== 'enkel_eltern_verstorben') {
                    setIstKind(false);
                  }
                }}
                className={`py-3 px-4 rounded-xl text-left transition-all ${
                  verwandtschaftsgrad === v.id
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{v.icon}</span>
                  <div>
                    <span className="font-medium text-sm block">{v.name}</span>
                    <span className={`text-xs ${verwandtschaftsgrad === v.id ? 'text-emerald-100' : 'text-gray-400'}`}>
                      Freibetrag: {formatEuro(v.freibetrag)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Steuerklasse Info */}
        <div className={`mb-6 p-4 rounded-xl ${
          ergebnis.steuerklasse === 'I' ? 'bg-green-50 border border-green-200' :
          ergebnis.steuerklasse === 'II' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-xl font-bold px-3 py-1 rounded-lg ${
              ergebnis.steuerklasse === 'I' ? 'bg-green-500 text-white' :
              ergebnis.steuerklasse === 'II' ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {ergebnis.steuerklasse}
            </span>
            <div>
              <p className={`font-medium ${
                ergebnis.steuerklasse === 'I' ? 'text-green-800' :
                ergebnis.steuerklasse === 'II' ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                {steuerklasseInfo[ergebnis.steuerklasse].name}
              </p>
              <p className={`text-xs ${
                ergebnis.steuerklasse === 'I' ? 'text-green-600' :
                ergebnis.steuerklasse === 'II' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                Steuersätze: {ergebnis.steuerklasse === 'I' ? '7% - 30%' : ergebnis.steuerklasse === 'II' ? '15% - 43%' : '30% - 50%'}
              </p>
            </div>
          </div>
        </div>

        {/* Versorgungsfreibetrag für Kinder */}
        {(verwandtschaftsgrad === 'kind' || verwandtschaftsgrad === 'enkel_eltern_verstorben') && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={istKind}
                onChange={(e) => setIstKind(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-blue-800 font-medium">Minderjähriges Kind (Versorgungsfreibetrag)</span>
            </label>
            {istKind && (
              <div className="mt-4">
                <label className="text-sm text-blue-700 block mb-2">Alter des Kindes</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    value={kindesalter}
                    onChange={(e) => setKindesalter(Number(e.target.value))}
                    className="flex-1 accent-blue-500"
                    min="0"
                    max="27"
                    step="1"
                  />
                  <span className="text-lg font-bold text-blue-800 w-16 text-center">{kindesalter} Jahre</span>
                </div>
                {kindesalter <= 27 && (
                  <p className="text-sm text-blue-600 mt-2">
                    → Versorgungsfreibetrag: <strong>{formatEuro(ergebnis.versorgungsfreibetrag)}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Ehepartner Versorgungsfreibetrag */}
        {verwandtschaftsgrad === 'ehepartner' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800">
              <strong>Versorgungsfreibetrag:</strong> Als Ehepartner erhalten Sie automatisch einen 
              zusätzlichen Versorgungsfreibetrag von <strong>{formatEuro(256000)}</strong>.
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Dieser wird um den Kapitalwert eventuell bezogener Versorgungsbezüge (z.B. Witwenrente) gekürzt.
            </p>
          </div>
        )}

        {/* Optionale Zusatz-Eingaben */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Weitere Vermögenswerte & Abzüge</span>
          </label>

          {/* Hausrat */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={hatHausrat}
                onChange={(e) => setHatHausrat(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <span className="text-gray-800 font-medium">🏠 Hausrat</span>
                <span className="text-xs text-gray-500 block">Möbel, Wäsche, Haushaltsgeräte (Freibetrag bis {formatEuro(ergebnis.steuerklasse === 'I' ? 41000 : 12000)})</span>
              </div>
            </label>
            {hatHausrat && (
              <div className="mt-2 pl-8">
                <input
                  type="number"
                  value={hausratWert}
                  onChange={(e) => setHausratWert(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                  placeholder="Wert des Hausrats"
                />
              </div>
            )}
          </div>

          {/* Bewegliche Gegenstände */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={hatBeweglicheGegenstaende}
                onChange={(e) => setHatBeweglicheGegenstaende(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <span className="text-gray-800 font-medium">💎 Andere bewegliche Gegenstände</span>
                <span className="text-xs text-gray-500 block">Schmuck, Kunstwerke, Sammlungen (Freibetrag bis {formatEuro(12000)})</span>
              </div>
            </label>
            {hatBeweglicheGegenstaende && (
              <div className="mt-2 pl-8">
                <input
                  type="number"
                  value={beweglicheWert}
                  onChange={(e) => setBeweglicheWert(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                  placeholder="Wert der Gegenstände"
                />
              </div>
            )}
          </div>

          {/* Belastungen/Schulden */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={hatVorherigeBelastungen}
                onChange={(e) => setHatVorherigeBelastungen(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <span className="text-gray-800 font-medium">📉 Nachlassverbindlichkeiten</span>
                <span className="text-xs text-gray-500 block">Schulden des Erblassers, Bestattungskosten über 10.300€</span>
              </div>
            </label>
            {hatVorherigeBelastungen && (
              <div className="mt-2 pl-8">
                <input
                  type="number"
                  value={belastungen}
                  onChange={(e) => setBelastungen(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                  placeholder="Summe der Verbindlichkeiten"
                />
              </div>
            )}
          </div>

          {/* Vorschenkungen */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={hatVorschenkungen}
                onChange={(e) => setHatVorschenkungen(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <span className="text-gray-800 font-medium">🎁 Vorschenkungen</span>
                <span className="text-xs text-gray-500 block">Schenkungen der letzten 10 Jahre werden hinzugerechnet</span>
              </div>
            </label>
            {hatVorschenkungen && (
              <div className="mt-2 pl-8">
                <input
                  type="number"
                  value={vorschenkungen}
                  onChange={(e) => setVorschenkungen(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none"
                  placeholder="Summe der Vorschenkungen"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Schenkungen innerhalb von 10 Jahren vor dem Erbfall zehren den Freibetrag auf.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.erbschaftsteuer === 0 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
          : 'bg-gradient-to-br from-emerald-500 to-teal-600'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          {ergebnis.erbschaftsteuer === 0 ? '✓ Keine Erbschaftsteuer fällig!' : '📜 Ihre voraussichtliche Erbschaftsteuer'}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.erbschaftsteuer)}</span>
          </div>
          {ergebnis.erbschaftsteuer > 0 && (
            <p className="text-emerald-100 mt-2 text-sm">
              Effektiver Steuersatz: <strong>{ergebnis.effektiverSteuersatz}%</strong> der Gesamterbschaft
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Netto-Erbe</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.nettoErbe)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Steuersatz</span>
            <div className="text-xl font-bold">{ergebnis.anwendbarerSteuersatz}%</div>
          </div>
        </div>

        {ergebnis.erbschaftsteuer === 0 && (
          <div className="mt-4 p-3 bg-white/10 rounded-xl">
            <p className="text-sm">
              <strong>Glückwunsch!</strong> Der gesamte Erwerb liegt unter dem Freibetrag von {formatEuro(ergebnis.gesamteFreibetraege)} – 
              es fällt keine Erbschaftsteuer an.
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          {/* Erbschaftswert */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Wert der Erbschaft
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Haupterbschaft (Immobilien, Geld, Wertpapiere)</span>
            <span className="font-bold text-gray-900">{formatEuro(erbschaftswert)}</span>
          </div>
          
          {hatHausrat && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">+ Hausrat</span>
              <span className="text-gray-900">{formatEuro(hausratWert)}</span>
            </div>
          )}
          
          {hatBeweglicheGegenstaende && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">+ Bewegliche Gegenstände</span>
              <span className="text-gray-900">{formatEuro(beweglicheWert)}</span>
            </div>
          )}

          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= Brutto-Erbschaft</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.bruttoErbschaft)}</span>
          </div>

          {/* Belastungen */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Abzüge
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Nachlassverbindlichkeiten / Bestattungspauschale</span>
            <span>{formatEuro(ergebnis.gesamtBelastungen)}</span>
          </div>

          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= Netto-Erbschaft</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.nettoErbschaft)}</span>
          </div>

          {/* Vorschenkungen */}
          {ergebnis.vorschenkungswert > 0 && (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
                <span>+ Vorschenkungen (letzte 10 Jahre)</span>
                <span>{formatEuro(ergebnis.vorschenkungswert)}</span>
              </div>
              <div className="flex justify-between py-2 bg-orange-50 -mx-6 px-6">
                <span className="font-medium text-orange-700">= Gesamterwerb</span>
                <span className="font-bold text-orange-900">{formatEuro(ergebnis.gesamtErwerb)}</span>
              </div>
            </>
          )}

          {/* Freibeträge */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Freibeträge (§ 16, 17 ErbStG)
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>Persönlicher Freibetrag ({ergebnis.verwandter.name})</span>
            <span>{formatEuro(ergebnis.persoenlichFreibetrag)}</span>
          </div>
          
          {ergebnis.versorgungsfreibetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>Versorgungsfreibetrag</span>
              <span>{formatEuro(ergebnis.versorgungsfreibetrag)}</span>
            </div>
          )}
          
          {ergebnis.hausratFreibetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>Hausratfreibetrag</span>
              <span>{formatEuro(ergebnis.hausratFreibetrag)}</span>
            </div>
          )}
          
          {ergebnis.beweglicheFreibetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>Freibetrag bewegliche Gegenstände</span>
              <span>{formatEuro(ergebnis.beweglicheFreibetrag)}</span>
            </div>
          )}

          <div className="flex justify-between py-2 bg-green-50 -mx-6 px-6">
            <span className="font-medium text-green-700">= Gesamte Freibeträge</span>
            <span className="font-bold text-green-900">{formatEuro(ergebnis.gesamteFreibetraege)}</span>
          </div>

          {/* Steuerberechnung */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Steuerberechnung
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Steuerpflichtiger Erwerb</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.steuerpflichtigerErwerb)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Steuerklasse {ergebnis.steuerklasse}</span>
            <span className="text-gray-900">{ergebnis.anwendbarerSteuersatz}% Steuersatz</span>
          </div>
          
          <div className="flex justify-between py-3 bg-emerald-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-emerald-800">Erbschaftsteuer</span>
            <span className="font-bold text-2xl text-emerald-900">{formatEuro(ergebnis.erbschaftsteuer)}</span>
          </div>
        </div>
      </div>

      {/* Steuertabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Erbschaftsteuer-Tabelle 2025/2026</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-600">Steuerpfl. Erwerb bis</th>
                <th className="text-center py-2 px-3 font-medium text-green-600">Kl. I</th>
                <th className="text-center py-2 px-3 font-medium text-yellow-600">Kl. II</th>
                <th className="text-center py-2 px-3 font-medium text-red-600">Kl. III</th>
              </tr>
            </thead>
            <tbody>
              {[
                { bis: '75.000 €', i: 7, ii: 15, iii: 30 },
                { bis: '300.000 €', i: 11, ii: 20, iii: 30 },
                { bis: '600.000 €', i: 15, ii: 25, iii: 30 },
                { bis: '6.000.000 €', i: 19, ii: 30, iii: 30 },
                { bis: '13.000.000 €', i: 23, ii: 35, iii: 50 },
                { bis: '26.000.000 €', i: 27, ii: 40, iii: 50 },
                { bis: 'darüber', i: 30, ii: 43, iii: 50 },
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-3 text-gray-700">{row.bis}</td>
                  <td className="py-2 px-3 text-center text-green-700">{row.i}%</td>
                  <td className="py-2 px-3 text-center text-yellow-700">{row.ii}%</td>
                  <td className="py-2 px-3 text-center text-red-700">{row.iii}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Quelle: § 19 ErbStG – Die Steuer wird auf den gesamten steuerpflichtigen Erwerb mit dem jeweiligen Steuersatz berechnet.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Erbschaftsteuer</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Steuerklassen:</strong> Je näher verwandt, desto niedriger die Steuerklasse und höher der Freibetrag</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Freibeträge:</strong> Bis zu 500.000€ für Ehepartner, 400.000€ für Kinder – alle 10 Jahre nutzbar</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>10-Jahres-Regel:</strong> Schenkungen und Erbschaften werden innerhalb von 10 Jahren zusammengerechnet</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Immobilienbewertung:</strong> Immobilien werden zum Verkehrswert (Marktwert) bewertet</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Familienheim-Befreiung:</strong> Selbstgenutzte Immobilien können steuerfrei auf Ehepartner/Kinder übergehen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Stundung:</strong> Bei Liquiditätsproblemen kann die Steuer über 10 Jahre gestundet werden</span>
          </li>
        </ul>
      </div>

      {/* Freibeträge Übersicht */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💰 Freibeträge bei Erbschaft 2025/2026</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded-xl p-3">
            <span className="text-emerald-600 font-medium">Ehepartner/Lebenspartner</span>
            <div className="text-xl font-bold text-emerald-800">500.000 €</div>
            <span className="text-xs text-gray-500">+ 256.000€ Versorgungsfreibetrag</span>
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="text-emerald-600 font-medium">Kinder</span>
            <div className="text-xl font-bold text-emerald-800">400.000 €</div>
            <span className="text-xs text-gray-500">+ Versorgungsfreibetrag je Alter</span>
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="text-emerald-600 font-medium">Enkel</span>
            <div className="text-xl font-bold text-emerald-800">200.000 €</div>
            <span className="text-xs text-gray-500">400.000€ wenn Eltern verstorben</span>
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="text-emerald-600 font-medium">Eltern / Urenkel</span>
            <div className="text-xl font-bold text-emerald-800">100.000 €</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="text-yellow-600 font-medium">Geschwister / Nichten / Neffen</span>
            <div className="text-xl font-bold text-yellow-800">20.000 €</div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="text-red-600 font-medium">Sonstige Personen</span>
            <div className="text-xl font-bold text-red-800">20.000 €</div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Schätzung:</strong> Dieser Rechner liefert eine Orientierung – die tatsächliche Steuer kann abweichen</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Immobilienbewertung:</strong> Die Bewertung von Immobilien ist komplex und erfolgt nach dem Bewertungsgesetz</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Betriebsvermögen:</strong> Für Unternehmen gelten besondere Verschonungsregeln (bis zu 100% Befreiung)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Anzeigepflicht:</strong> Eine Erbschaft muss innerhalb von 3 Monaten dem Finanzamt angezeigt werden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Steuerberater:</strong> Bei größeren Erbschaften empfiehlt sich professionelle Beratung zur Steueroptimierung</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="font-semibold text-emerald-900">Erbschaftsteuerfinanzamt</p>
            <p className="text-sm text-emerald-700 mt-1">
              Zuständig ist das Finanzamt am letzten Wohnsitz des Erblassers. In den meisten Bundesländern 
              gibt es zentrale Erbschaftsteuer-Finanzämter.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📱</span>
              <div>
                <p className="font-medium text-gray-800">ELSTER Portal</p>
                <a 
                  href="https://www.elster.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Erbschaftsteuererklärung online →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📋</span>
              <div>
                <p className="font-medium text-gray-800">Fristen</p>
                <p className="text-gray-600">Anzeige: 3 Monate nach Erbfall</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Finanzamt-Hotlines (Beispiele)</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Bayern: 089 9991-0 (Zentrales Finanzamt München)</li>
                <li>• NRW: 0211 4972-0 (FA Düsseldorf-Süd)</li>
                <li>• Hessen: 069 2545-0 (FA Frankfurt am Main)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/erbstg_1974/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Erbschaftsteuer- und Schenkungsteuergesetz (ErbStG)
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/bewg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bewertungsgesetz (BewG) – Immobilienbewertung
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Erbschaft_Schenkungsteuer/erbschaft_schenkungsteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Erbschaft- und Schenkungsteuer
          </a>
          <a 
            href="https://www.steuertipps.de/erbschaft-schenkung"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Steuertipps.de – Ratgeber Erbschaft
          </a>
        </div>
      </div>
    </div>
  );
}
