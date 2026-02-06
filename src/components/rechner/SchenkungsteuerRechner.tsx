import { useState, useMemo } from 'react';

// Schenkungsteuer-Klassen basierend auf Verwandtschaftsverhältnis
// Quelle: § 15 ErbStG (gilt für Schenkung und Erbschaft)
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
// Bei Schenkung: Eltern/Großeltern haben Steuerklasse II (anders als bei Erbschaft!)
const VERWANDTSCHAFTSGRADE: Verwandtschaftsgrad[] = [
  { id: 'ehepartner', name: 'Ehepartner/Lebenspartner', beschreibung: 'Eingetragene Lebenspartnerschaft', steuerklasse: 'I', freibetrag: 500000, icon: '💑' },
  { id: 'kind', name: 'Kind', beschreibung: 'Leibliches Kind, Adoptivkind, Stiefkind', steuerklasse: 'I', freibetrag: 400000, icon: '👶' },
  { id: 'enkel', name: 'Enkel', beschreibung: 'Enkelkinder', steuerklasse: 'I', freibetrag: 200000, icon: '👧' },
  { id: 'urenkel', name: 'Urenkel', beschreibung: 'Urenkelin, Urenkel', steuerklasse: 'I', freibetrag: 100000, icon: '👶' },
  { id: 'eltern', name: 'Eltern', beschreibung: 'Mutter, Vater (bei Schenkung: Steuerklasse II!)', steuerklasse: 'II', freibetrag: 20000, icon: '👴' },
  { id: 'grosseltern', name: 'Großeltern', beschreibung: 'Oma, Opa (bei Schenkung: Steuerklasse II!)', steuerklasse: 'II', freibetrag: 20000, icon: '👵' },
  { id: 'geschwister', name: 'Geschwister', beschreibung: 'Bruder, Schwester', steuerklasse: 'II', freibetrag: 20000, icon: '👫' },
  { id: 'nichten_neffen', name: 'Nichten/Neffen', beschreibung: 'Kinder von Geschwistern', steuerklasse: 'II', freibetrag: 20000, icon: '🧒' },
  { id: 'stiefeltern', name: 'Stiefeltern', beschreibung: 'Stiefmutter, Stiefvater', steuerklasse: 'II', freibetrag: 20000, icon: '👨‍👩‍👦' },
  { id: 'schwiegereltern', name: 'Schwiegereltern', beschreibung: 'Schwiegermutter, Schwiegervater', steuerklasse: 'II', freibetrag: 20000, icon: '👵' },
  { id: 'schwiegerkinder', name: 'Schwiegerkinder', beschreibung: 'Schwiegersohn, Schwiegertochter', steuerklasse: 'II', freibetrag: 20000, icon: '👨‍👩‍👧' },
  { id: 'geschiedener', name: 'Geschiedener Ehepartner', beschreibung: 'Ex-Ehepartner', steuerklasse: 'II', freibetrag: 20000, icon: '💔' },
  { id: 'lebensgefaehrte', name: 'Lebensgefährte (nicht eingetragen)', beschreibung: 'Unverheiratet zusammenlebend', steuerklasse: 'III', freibetrag: 20000, icon: '❤️' },
  { id: 'sonstige', name: 'Sonstige Personen', beschreibung: 'Freunde, Bekannte, entfernte Verwandte', steuerklasse: 'III', freibetrag: 20000, icon: '👤' },
];

// Steuersätze nach § 19 ErbStG (Stand 2025/2026)
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

export default function SchenkungsteuerRechner() {
  // Eingabewerte
  const [schenkungswert, setSchenkungswert] = useState(150000);
  const [verwandtschaftsgrad, setVerwandtschaftsgrad] = useState<string>('kind');
  const [hatNiessbrauch, setHatNiessbrauch] = useState(false);
  const [niessbrauchWert, setNiessbrauchWert] = useState(30000);
  const [hatGegenleistung, setHatGegenleistung] = useState(false);
  const [gegenleistung, setGegenleistung] = useState(0);
  const [hatVorschenkungen, setHatVorschenkungen] = useState(false);
  const [vorschenkungen, setVorschenkungen] = useState(0);
  const [zehnJahresFreibetragGenutzt, setZehnJahresFreibetragGenutzt] = useState(0);

  const ergebnis = useMemo(() => {
    const verwandter = VERWANDTSCHAFTSGRADE.find(v => v.id === verwandtschaftsgrad)!;
    const steuerklasse = verwandter.steuerklasse;
    const persoenlichFreibetrag = verwandter.freibetrag;

    // Bruttowert der Schenkung
    let bruttoSchenkung = schenkungswert;

    // Nießbrauch mindert den steuerpflichtigen Wert
    const niessbrauchAbzug = hatNiessbrauch ? niessbrauchWert : 0;

    // Gegenleistung (z.B. Übernahme von Schulden) mindert den Wert
    const gegenleistungAbzug = hatGegenleistung ? gegenleistung : 0;

    // Bereinigte Schenkung
    const bereinigteSchenkung = Math.max(0, bruttoSchenkung - niessbrauchAbzug - gegenleistungAbzug);

    // Vorschenkungen der letzten 10 Jahre hinzurechnen
    const vorschenkungswert = hatVorschenkungen ? vorschenkungen : 0;
    const gesamtErwerb = bereinigteSchenkung + vorschenkungswert;

    // Bereits genutzter Freibetrag aus Vorschenkungen
    const verbrauchterFreibetrag = hatVorschenkungen ? zehnJahresFreibetragGenutzt : 0;
    const verfuegbarerFreibetrag = Math.max(0, persoenlichFreibetrag - verbrauchterFreibetrag);

    // Steuerpflichtiger Erwerb
    const steuerpflichtigerErwerb = Math.max(0, gesamtErwerb - verfuegbarerFreibetrag);

    // Steuersatz ermitteln
    const steuersaetze = STEUERSAETZE[steuerklasse];
    let anwendbarerSteuersatz = 0;
    for (const stufe of steuersaetze) {
      if (steuerpflichtigerErwerb <= stufe.bis) {
        anwendbarerSteuersatz = stufe.satz;
        break;
      }
    }

    // Schenkungsteuer berechnen
    const schenkungsteuer = Math.round(steuerpflichtigerErwerb * (anwendbarerSteuersatz / 100));

    // Effektiver Steuersatz bezogen auf Gesamtschenkung
    const effektiverSteuersatz = bruttoSchenkung > 0 
      ? ((schenkungsteuer / bruttoSchenkung) * 100).toFixed(1)
      : '0.0';

    // Netto verbleibendes Geschenk
    const nettoGeschenk = bereinigteSchenkung - schenkungsteuer;

    // Wer zahlt die Steuer?
    // Standardmäßig der Beschenkte, aber oft übernimmt der Schenker
    const steuerBeiSchenkerUebernahme = Math.round(schenkungsteuer / (1 - anwendbarerSteuersatz / 100));

    // Nächste Schenkung nach 10 Jahren
    const naechsterFreibetrag = new Date();
    naechsterFreibetrag.setFullYear(naechsterFreibetrag.getFullYear() + 10);

    // Restfreibetrag
    const restfreibetrag = Math.max(0, verfuegbarerFreibetrag - bereinigteSchenkung);

    return {
      // Schenkungswerte
      bruttoSchenkung,
      bereinigteSchenkung,
      gesamtErwerb,
      
      // Abzüge
      niessbrauchAbzug,
      gegenleistungAbzug,
      
      // Vorschenkungen
      vorschenkungswert,
      
      // Freibeträge
      persoenlichFreibetrag,
      verbrauchterFreibetrag,
      verfuegbarerFreibetrag,
      restfreibetrag,
      
      // Steuerberechnung
      steuerpflichtigerErwerb,
      steuerklasse,
      anwendbarerSteuersatz,
      schenkungsteuer,
      effektiverSteuersatz,
      steuerBeiSchenkerUebernahme,
      
      // Ergebnis
      nettoGeschenk,
      naechsterFreibetrag,
      
      // Zusatzinfo
      verwandter,
    };
  }, [
    schenkungswert, verwandtschaftsgrad, hatNiessbrauch, niessbrauchWert,
    hatGegenleistung, gegenleistung, hatVorschenkungen, vorschenkungen,
    zehnJahresFreibetragGenutzt
  ]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  const steuerklasseInfo = {
    'I': { name: 'Steuerklasse I', beschreibung: 'Ehepartner, Kinder, Enkel', color: 'green' },
    'II': { name: 'Steuerklasse II', beschreibung: 'Eltern, Geschwister, Nichten/Neffen', color: 'yellow' },
    'III': { name: 'Steuerklasse III', beschreibung: 'Lebensgefährte, Freunde, Sonstige', color: 'red' },
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Schenkungswert */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wert der Schenkung</span>
            <span className="text-xs text-gray-500 block mt-1">Immobilien, Geldbeträge, Wertpapiere, Firmenbeteiligungen</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={schenkungswert}
              onChange={(e) => setSchenkungswert(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(schenkungswert, 1000000)}
            onChange={(e) => setSchenkungswert(Number(e.target.value))}
            className="w-full mt-3 accent-pink-500"
            min="0"
            max="1000000"
            step="10000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>500.000 €</span>
            <span>1 Mio €</span>
          </div>
        </div>

        {/* Verwandtschaftsgrad */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Verwandtschaftsverhältnis zum Schenker</span>
            <span className="text-xs text-gray-500 block mt-1">Bestimmt Steuerklasse und Freibetrag</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VERWANDTSCHAFTSGRADE.map((v) => (
              <button
                key={v.id}
                onClick={() => setVerwandtschaftsgrad(v.id)}
                className={`py-3 px-4 rounded-xl text-left transition-all ${
                  verwandtschaftsgrad === v.id
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{v.icon}</span>
                  <div>
                    <span className="font-medium text-sm block">{v.name}</span>
                    <span className={`text-xs ${verwandtschaftsgrad === v.id ? 'text-pink-100' : 'text-gray-400'}`}>
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

        {/* Wichtiger Hinweis für Eltern/Großeltern */}
        {(verwandtschaftsgrad === 'eltern' || verwandtschaftsgrad === 'grosseltern') && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-sm">
              <strong>⚠️ Achtung:</strong> Bei Schenkungen an Eltern oder Großeltern gilt Steuerklasse II 
              (Freibetrag nur 20.000€). Bei <em>Erbschaft</em> hingegen wäre Steuerklasse I mit 100.000€ 
              Freibetrag anwendbar!
            </p>
          </div>
        )}

        {/* Hinweis für Lebensgefährte */}
        {verwandtschaftsgrad === 'lebensgefaehrte' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800 text-sm">
              <strong>💡 Tipp:</strong> Unverheiratete Lebensgefährten haben nur 20.000€ Freibetrag und 
              zahlen bis zu 50% Steuer. Eine <strong>Heirat</strong> oder <strong>eingetragene Lebenspartnerschaft</strong> 
              würde den Freibetrag auf 500.000€ erhöhen und die Steuersätze auf 7-30% senken!
            </p>
          </div>
        )}

        {/* Optionale Zusatz-Eingaben */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Optionale Angaben</span>
          </label>

          {/* Nießbrauch */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={hatNiessbrauch}
                onChange={(e) => setHatNiessbrauch(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              />
              <div className="flex-1">
                <span className="text-gray-800 font-medium">🏠 Nießbrauch / Wohnrecht vorbehalten</span>
                <span className="text-xs text-gray-500 block">Schenker behält Nutzungsrecht (mindert steuerpflichtigen Wert)</span>
              </div>
            </label>
            {hatNiessbrauch && (
              <div className="mt-2 pl-8">
                <label className="text-sm text-gray-600 block mb-1">Kapitalwert des Nießbrauchs</label>
                <input
                  type="number"
                  value={niessbrauchWert}
                  onChange={(e) => setNiessbrauchWert(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
                  placeholder="Kapitalwert des Nießbrauchs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Berechnung: Jahreswert × Vervielfältiger (abhängig vom Alter des Berechtigten)
                </p>
              </div>
            )}
          </div>

          {/* Gegenleistung */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={hatGegenleistung}
                onChange={(e) => setHatGegenleistung(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              />
              <div className="flex-1">
                <span className="text-gray-800 font-medium">💰 Gegenleistung / Schuldübernahme</span>
                <span className="text-xs text-gray-500 block">z.B. Übernahme von Hypotheken, Pflegeverpflichtung</span>
              </div>
            </label>
            {hatGegenleistung && (
              <div className="mt-2 pl-8">
                <input
                  type="number"
                  value={gegenleistung}
                  onChange={(e) => setGegenleistung(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
                  placeholder="Wert der Gegenleistung"
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
                className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              />
              <div className="flex-1">
                <span className="text-gray-800 font-medium">🎁 Vorschenkungen (letzte 10 Jahre)</span>
                <span className="text-xs text-gray-500 block">Frühere Schenkungen vom selben Schenker werden addiert</span>
              </div>
            </label>
            {hatVorschenkungen && (
              <div className="mt-2 pl-8 space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Summe der Vorschenkungen</label>
                  <input
                    type="number"
                    value={vorschenkungen}
                    onChange={(e) => setVorschenkungen(Math.max(0, Number(e.target.value)))}
                    className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
                    placeholder="Summe der Vorschenkungen"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Davon bereits genutzter Freibetrag</label>
                  <input
                    type="number"
                    value={zehnJahresFreibetragGenutzt}
                    onChange={(e) => setZehnJahresFreibetragGenutzt(Math.max(0, Math.min(Number(e.target.value), ergebnis.persoenlichFreibetrag)))}
                    className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-0 outline-none"
                    placeholder="Bereits genutzter Freibetrag"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Freibeträge werden innerhalb von 10 Jahren zusammengerechnet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.schenkungsteuer === 0 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
          : 'bg-gradient-to-br from-pink-500 to-rose-600'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          {ergebnis.schenkungsteuer === 0 ? '✓ Keine Schenkungsteuer fällig!' : '🎁 Ihre voraussichtliche Schenkungsteuer'}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.schenkungsteuer)}</span>
          </div>
          {ergebnis.schenkungsteuer > 0 && (
            <p className="text-pink-100 mt-2 text-sm">
              Effektiver Steuersatz: <strong>{ergebnis.effektiverSteuersatz}%</strong> der Bruttoschenkung
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Netto-Geschenk</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.nettoGeschenk)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Steuersatz</span>
            <div className="text-xl font-bold">{ergebnis.anwendbarerSteuersatz}%</div>
          </div>
        </div>

        {ergebnis.schenkungsteuer === 0 && (
          <div className="mt-4 p-3 bg-white/10 rounded-xl">
            <p className="text-sm">
              <strong>Glückwunsch!</strong> Die Schenkung liegt unter dem verfügbaren Freibetrag von {formatEuro(ergebnis.verfuegbarerFreibetrag)} – 
              es fällt keine Schenkungsteuer an.
            </p>
          </div>
        )}

        {ergebnis.restfreibetrag > 0 && ergebnis.schenkungsteuer === 0 && (
          <div className="mt-3 p-3 bg-white/10 rounded-xl">
            <p className="text-sm">
              <strong>💡 Restfreibetrag:</strong> Sie haben noch {formatEuro(ergebnis.restfreibetrag)} Freibetrag 
              für weitere Schenkungen in den nächsten 10 Jahren übrig.
            </p>
          </div>
        )}
      </div>

      {/* Wer zahlt die Steuer? */}
      {ergebnis.schenkungsteuer > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">💳 Wer zahlt die Schenkungsteuer?</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-700">Beschenkter zahlt</p>
              <p className="text-2xl font-bold text-gray-900">{formatEuro(ergebnis.schenkungsteuer)}</p>
              <p className="text-xs text-gray-500 mt-1">Gesetzlicher Regelfall</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
              <p className="font-medium text-pink-700">Schenker übernimmt Steuer</p>
              <p className="text-2xl font-bold text-pink-900">{formatEuro(ergebnis.steuerBeiSchenkerUebernahme)}</p>
              <p className="text-xs text-pink-600 mt-1">Steuerübernahme = weitere Schenkung!</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-3">
            <strong>Hinweis:</strong> Übernimmt der Schenker die Steuer, gilt dies als zusätzliche Schenkung 
            und erhöht den steuerpflichtigen Wert!
          </p>
        </div>
      )}

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          {/* Schenkungswert */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Wert der Schenkung
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Brutto-Schenkungswert</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.bruttoSchenkung)}</span>
          </div>
          
          {ergebnis.niessbrauchAbzug > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
              <span>− Nießbrauch/Wohnrecht (Kapitalwert)</span>
              <span>{formatEuro(ergebnis.niessbrauchAbzug)}</span>
            </div>
          )}
          
          {ergebnis.gegenleistungAbzug > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
              <span>− Gegenleistung/Schuldübernahme</span>
              <span>{formatEuro(ergebnis.gegenleistungAbzug)}</span>
            </div>
          )}

          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= Bereinigte Schenkung</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.bereinigteSchenkung)}</span>
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
            Freibeträge (§ 16 ErbStG)
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Persönlicher Freibetrag ({ergebnis.verwandter.name})</span>
            <span className="text-gray-900">{formatEuro(ergebnis.persoenlichFreibetrag)}</span>
          </div>
          
          {ergebnis.verbrauchterFreibetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
              <span>− Bereits genutzter Freibetrag</span>
              <span>{formatEuro(ergebnis.verbrauchterFreibetrag)}</span>
            </div>
          )}

          <div className="flex justify-between py-2 bg-green-50 -mx-6 px-6">
            <span className="font-medium text-green-700">= Verfügbarer Freibetrag</span>
            <span className="font-bold text-green-900">{formatEuro(ergebnis.verfuegbarerFreibetrag)}</span>
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
          
          <div className="flex justify-between py-3 bg-pink-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-pink-800">Schenkungsteuer</span>
            <span className="font-bold text-2xl text-pink-900">{formatEuro(ergebnis.schenkungsteuer)}</span>
          </div>
        </div>
      </div>

      {/* 10-Jahres-Regel Info */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="font-bold mb-3">🔄 Die 10-Jahres-Regel – So planen Sie clever</h3>
        
        <div className="space-y-3 text-sm">
          <p>
            Schenkungen werden innerhalb von <strong>10 Jahren zusammengerechnet</strong>. 
            Nach 10 Jahren steht der volle Freibetrag erneut zur Verfügung!
          </p>
          
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-indigo-100 text-xs mb-2">Beispiel bei Kind (400.000€ Freibetrag):</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Jahr 1: 400.000€</div><div>→ steuerfrei ✓</div>
              <div>Jahr 11: 400.000€</div><div>→ steuerfrei ✓</div>
              <div>Jahr 21: 400.000€</div><div>→ steuerfrei ✓</div>
            </div>
            <p className="text-white font-medium mt-2">= 1,2 Mio € steuerfrei über 21 Jahre!</p>
          </div>
          
          <p className="text-indigo-100">
            <strong>Tipp:</strong> Beginnen Sie früh mit regelmäßigen Schenkungen, um Vermögen 
            steuerfrei auf die nächste Generation zu übertragen.
          </p>
        </div>
      </div>

      {/* Steuertabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Schenkungsteuer-Tabelle 2025/2026</h3>
        
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
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Schenkungsteuer</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Gleiches Gesetz:</strong> Schenkung- und Erbschaftsteuer sind im selben Gesetz (ErbStG) geregelt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Freibeträge:</strong> Identisch zur Erbschaftsteuer – 500.000€ für Ehepartner, 400.000€ für Kinder</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>10-Jahres-Rhythmus:</strong> Freibeträge können alle 10 Jahre neu genutzt werden</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Wichtiger Unterschied:</strong> Bei Schenkung an Eltern gilt Steuerklasse II (nicht I wie bei Erbschaft!)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Nießbrauch:</strong> Vorbehalt von Nutzungsrechten mindert den steuerpflichtigen Wert</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Steuerschuldner:</strong> Grundsätzlich der Beschenkte, aber oft übernimmt der Schenker</span>
          </li>
        </ul>
      </div>

      {/* Freibeträge Übersicht */}
      <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-pink-800 mb-3">💰 Freibeträge bei Schenkung 2025/2026</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded-xl p-3">
            <span className="text-green-600 font-medium">Ehepartner/Lebenspartner</span>
            <div className="text-xl font-bold text-green-800">500.000 €</div>
            <span className="text-xs text-gray-500">Steuerklasse I</span>
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="text-green-600 font-medium">Kinder</span>
            <div className="text-xl font-bold text-green-800">400.000 €</div>
            <span className="text-xs text-gray-500">Steuerklasse I</span>
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="text-green-600 font-medium">Enkel</span>
            <div className="text-xl font-bold text-green-800">200.000 €</div>
            <span className="text-xs text-gray-500">Steuerklasse I</span>
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="text-green-600 font-medium">Urenkel</span>
            <div className="text-xl font-bold text-green-800">100.000 €</div>
            <span className="text-xs text-gray-500">Steuerklasse I</span>
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="text-yellow-600 font-medium">Eltern / Großeltern</span>
            <div className="text-xl font-bold text-yellow-800">20.000 €</div>
            <span className="text-xs text-gray-500">Steuerklasse II (bei Schenkung!)</span>
          </div>
          <div className="bg-white rounded-xl p-3">
            <span className="text-yellow-600 font-medium">Geschwister / Nichten / Neffen</span>
            <div className="text-xl font-bold text-yellow-800">20.000 €</div>
            <span className="text-xs text-gray-500">Steuerklasse II</span>
          </div>
          <div className="bg-white rounded-xl p-3 sm:col-span-2">
            <span className="text-red-600 font-medium">Lebensgefährte / Freunde / Sonstige</span>
            <div className="text-xl font-bold text-red-800">20.000 €</div>
            <span className="text-xs text-gray-500">Steuerklasse III – bis 50% Steuer!</span>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Anzeigepflicht:</strong> Schenkungen müssen innerhalb von 3 Monaten dem Finanzamt gemeldet werden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Formvorschrift:</strong> Schenkung von Immobilien erfordert notarielle Beurkundung</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Rückforderung:</strong> Der Schenker kann bei Verarmung die Schenkung zurückfordern (§ 528 BGB)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Pflichtteil:</strong> Schenkungen können den Pflichtteil der Erben ergänzen (10-Jahres-Frist)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Sozialamt:</strong> Bei Pflegebedürftigkeit können Schenkungen der letzten 10 Jahre zurückgefordert werden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Steuerberater:</strong> Bei größeren Schenkungen unbedingt professionelle Beratung einholen!</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-pink-50 rounded-xl p-4">
            <p className="font-semibold text-pink-900">Schenkungsteuer-Finanzamt</p>
            <p className="text-sm text-pink-700 mt-1">
              Zuständig ist das Finanzamt am Wohnsitz des Schenkers. In den meisten Bundesländern 
              gibt es zentrale Erbschaft-/Schenkungsteuer-Finanzämter.
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
                  Schenkungsteuererklärung online →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📋</span>
              <div>
                <p className="font-medium text-gray-800">Anzeigefrist</p>
                <p className="text-gray-600">3 Monate nach Schenkung</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📝</span>
            <div>
              <p className="font-medium text-gray-800">Wichtige Formulare</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Anzeige einer Schenkung (formlos oder Vordruck)</li>
                <li>• Schenkungsteuererklärung (wenn vom FA angefordert)</li>
                <li>• Anlage Steuerbefreiung Familienheim (falls zutreffend)</li>
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
            Bewertungsgesetz (BewG) – Vermögensbewertung
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
            Steuertipps.de – Ratgeber Schenkung
          </a>
        </div>
      </div>
    </div>
  );
}
