import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Bundesländer mit Mietpreisbremse-Verordnungen (Stand Januar 2026)
interface Bundesland {
  id: string;
  name: string;
  hatMietpreisbremse: boolean;
  gueltigBis: string;
  beispielStaedte: string[];
  anzahlGebiete: number;
  link?: string;
}

const BUNDESLAENDER: Bundesland[] = [
  { id: 'bw', name: 'Baden-Württemberg', hatMietpreisbremse: true, gueltigBis: '31.12.2026', beispielStaedte: ['Stuttgart', 'Freiburg', 'Heidelberg', 'Tübingen', 'Ulm'], anzahlGebiete: 130 },
  { id: 'by', name: 'Bayern', hatMietpreisbremse: true, gueltigBis: '31.12.2029', beispielStaedte: ['München', 'Regensburg', 'Ingolstadt', 'Augsburg', 'Würzburg'], anzahlGebiete: 285 },
  { id: 'be', name: 'Berlin', hatMietpreisbremse: true, gueltigBis: '31.12.2029', beispielStaedte: ['Berlin (gesamt)'], anzahlGebiete: 1 },
  { id: 'bb', name: 'Brandenburg', hatMietpreisbremse: true, gueltigBis: '31.12.2029', beispielStaedte: ['Potsdam', 'Cottbus', 'Oranienburg'], anzahlGebiete: 36 },
  { id: 'hb', name: 'Bremen', hatMietpreisbremse: true, gueltigBis: '31.12.2029', beispielStaedte: ['Bremen (ohne Bremerhaven)'], anzahlGebiete: 1 },
  { id: 'hh', name: 'Hamburg', hatMietpreisbremse: true, gueltigBis: '31.12.2029', beispielStaedte: ['Hamburg (gesamt)'], anzahlGebiete: 1 },
  { id: 'he', name: 'Hessen', hatMietpreisbremse: true, gueltigBis: '25.11.2026', beispielStaedte: ['Frankfurt', 'Darmstadt', 'Wiesbaden', 'Kassel'], anzahlGebiete: 49 },
  { id: 'mv', name: 'Mecklenburg-Vorpommern', hatMietpreisbremse: true, gueltigBis: '30.09.2028', beispielStaedte: ['Rostock', 'Greifswald'], anzahlGebiete: 2 },
  { id: 'ni', name: 'Niedersachsen', hatMietpreisbremse: true, gueltigBis: '31.12.2029', beispielStaedte: ['Hannover', 'Braunschweig', 'Göttingen', 'Oldenburg'], anzahlGebiete: 57 },
  { id: 'nw', name: 'Nordrhein-Westfalen', hatMietpreisbremse: true, gueltigBis: '31.12.2029', beispielStaedte: ['Köln', 'Düsseldorf', 'Münster', 'Bonn', 'Aachen'], anzahlGebiete: 57 },
  { id: 'rp', name: 'Rheinland-Pfalz', hatMietpreisbremse: true, gueltigBis: '31.12.2029', beispielStaedte: ['Mainz', 'Landau', 'Speyer', 'Worms', 'Ludwigshafen'], anzahlGebiete: 7 },
  { id: 'sl', name: 'Saarland', hatMietpreisbremse: false, gueltigBis: '-', beispielStaedte: [], anzahlGebiete: 0 },
  { id: 'sn', name: 'Sachsen', hatMietpreisbremse: true, gueltigBis: '30.06.2027', beispielStaedte: ['Dresden', 'Leipzig'], anzahlGebiete: 2 },
  { id: 'st', name: 'Sachsen-Anhalt', hatMietpreisbremse: false, gueltigBis: '-', beispielStaedte: [], anzahlGebiete: 0 },
  { id: 'sh', name: 'Schleswig-Holstein', hatMietpreisbremse: false, gueltigBis: '-', beispielStaedte: [], anzahlGebiete: 0 },
  { id: 'th', name: 'Thüringen', hatMietpreisbremse: true, gueltigBis: '31.12.2027', beispielStaedte: ['Erfurt', 'Jena'], anzahlGebiete: 2 },
];

// Ausnahmen von der Mietpreisbremse
interface Ausnahme {
  id: string;
  titel: string;
  beschreibung: string;
  icon: string;
}

const AUSNAHMEN: Ausnahme[] = [
  {
    id: 'neubau',
    titel: 'Neubauwohnung',
    beschreibung: 'Wohnungen, die nach dem 01.10.2014 erstmals genutzt und vermietet wurden',
    icon: '🏗️',
  },
  {
    id: 'modernisierung',
    titel: 'Umfassende Modernisierung',
    beschreibung: 'Nach umfassender Modernisierung (ca. 1/3 der Neubaukosten) – nur erste Vermietung',
    icon: '🔧',
  },
  {
    id: 'vormiete',
    titel: 'Höhere Vormiete',
    beschreibung: 'Wenn der Vormieter bereits eine höhere Miete gezahlt hat (Auskunftspflicht)',
    icon: '📋',
  },
  {
    id: 'sozialwohnung',
    titel: 'Sozialwohnungen',
    beschreibung: 'Öffentlich geförderte Wohnungen unterliegen anderen Regelungen',
    icon: '🏘️',
  },
];

export default function MietpreisbremseRechner() {
  // Eingaben
  const [vergleichsmiete, setVergleichsmiete] = useState<number>(10); // €/m² ortsübliche Vergleichsmiete
  const [aktuelleKaltmiete, setAktuelleKaltmiete] = useState<number>(12); // €/m² aktuelle Kaltmiete
  const [wohnflaeche, setWohnflaeche] = useState<number>(65); // m²
  const [bundeslandId, setBundeslandId] = useState<string>('by');
  const [istNeubau, setIstNeubau] = useState<boolean>(false);
  const [istModernisiert, setIstModernisiert] = useState<boolean>(false);
  const [hatHoheVormiete, setHatHoheVormiete] = useState<boolean>(false);
  const [vormieteProQm, setVormieteProQm] = useState<number>(0);
  const [wurdeInformiert, setWurdeInformiert] = useState<boolean>(false);

  const ergebnis = useMemo(() => {
    const bundesland = BUNDESLAENDER.find((bl) => bl.id === bundeslandId)!;
    
    // Maximale zulässige Miete = Vergleichsmiete + 10%
    const maxMieteProQm = vergleichsmiete * 1.1;
    const maxMieteGesamt = maxMieteProQm * wohnflaeche;
    
    // Aktuelle Miete
    const aktuelleMieteGesamt = aktuelleKaltmiete * wohnflaeche;
    
    // Differenz berechnen
    const differenzProQm = aktuelleKaltmiete - maxMieteProQm;
    const differenzGesamt = differenzProQm * wohnflaeche;
    
    // Prüfen ob Ausnahme zutrifft
    const ausnahmeZutrifft = istNeubau || istModernisiert;
    
    // Bei Vormiete-Ausnahme: Maximal die Vormiete (wenn höher als Mietpreisbremse)
    let effektiveMaxMieteProQm = maxMieteProQm;
    let vormieteAusnahme = false;
    if (hatHoheVormiete && vormieteProQm > maxMieteProQm) {
      if (wurdeInformiert) {
        // Vermieter hat vor Vertragsschluss informiert → Vormiete gilt
        effektiveMaxMieteProQm = vormieteProQm;
        vormieteAusnahme = true;
      } else {
        // Nicht informiert → 2 Jahre Schutz, dann Vormiete
        effektiveMaxMieteProQm = maxMieteProQm; // erstmal normale Grenze
      }
    }
    
    const effektiveMaxMieteGesamt = effektiveMaxMieteProQm * wohnflaeche;
    const effektiveDifferenz = aktuelleKaltmiete - effektiveMaxMieteProQm;
    const effektiveDifferenzGesamt = effektiveDifferenz * wohnflaeche;
    
    // Jährliche Ersparnis bei Rüge
    const jaehrlicheErsparnis = effektiveDifferenzGesamt > 0 ? effektiveDifferenzGesamt * 12 : 0;
    
    // Ist die Miete zu hoch?
    const mieteZuHoch = !ausnahmeZutrifft && aktuelleKaltmiete > effektiveMaxMieteProQm;
    
    // Prozentuale Überschreitung
    const ueberschreitungProzent = ((aktuelleKaltmiete / vergleichsmiete - 1) * 100);
    
    return {
      bundesland,
      vergleichsmiete,
      maxMieteProQm,
      maxMieteGesamt,
      aktuelleKaltmiete,
      aktuelleMieteGesamt,
      differenzProQm,
      differenzGesamt,
      effektiveMaxMieteProQm,
      effektiveMaxMieteGesamt,
      effektiveDifferenz,
      effektiveDifferenzGesamt,
      jaehrlicheErsparnis,
      mieteZuHoch,
      ausnahmeZutrifft,
      vormieteAusnahme,
      ueberschreitungProzent,
      hatMietpreisbremse: bundesland.hatMietpreisbremse,
    };
  }, [
    vergleichsmiete,
    aktuelleKaltmiete,
    wohnflaeche,
    bundeslandId,
    istNeubau,
    istModernisiert,
    hatHoheVormiete,
    vormieteProQm,
    wurdeInformiert,
  ]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  
  const formatEuroProQm = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €/m²';

  const getStatusColor = () => {
    if (!ergebnis.hatMietpreisbremse) return 'from-gray-400 to-gray-500';
    if (ergebnis.ausnahmeZutrifft) return 'from-amber-500 to-orange-600';
    if (ergebnis.mieteZuHoch) return 'from-red-500 to-rose-600';
    return 'from-green-500 to-emerald-600';
  };

  const getStatusText = () => {
    if (!ergebnis.hatMietpreisbremse) return 'Keine Mietpreisbremse in Ihrem Bundesland';
    if (ergebnis.ausnahmeZutrifft) return 'Ausnahme trifft zu – Mietpreisbremse gilt nicht';
    if (ergebnis.mieteZuHoch) return 'Miete überschreitet die zulässige Grenze!';
    return 'Miete liegt im zulässigen Rahmen';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bundesland */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Bundesland</span>
            <span className="text-xs text-gray-500 block mt-1">
              Nicht alle Bundesländer haben eine Mietpreisbremse
            </span>
          </label>
          <select
            value={bundeslandId}
            onChange={(e) => setBundeslandId(e.target.value)}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none bg-white"
          >
            {BUNDESLAENDER.map((bl) => (
              <option key={bl.id} value={bl.id}>
                {bl.name} {bl.hatMietpreisbremse ? `✓ (${bl.anzahlGebiete} Gebiete)` : '✗ keine Bremse'}
              </option>
            ))}
          </select>
          
          {/* Info zum gewählten Bundesland */}
          {ergebnis.bundesland && ergebnis.bundesland.hatMietpreisbremse && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>{ergebnis.bundesland.name}:</strong> Mietpreisbremse gilt bis{' '}
                <strong>{ergebnis.bundesland.gueltigBis}</strong> in {ergebnis.bundesland.anzahlGebiete} Städten/Gemeinden
              </p>
              {ergebnis.bundesland.beispielStaedte.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  z.B. {ergebnis.bundesland.beispielStaedte.join(', ')}
                </p>
              )}
            </div>
          )}
          
          {ergebnis.bundesland && !ergebnis.bundesland.hatMietpreisbremse && (
            <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>{ergebnis.bundesland.name}</strong> hat derzeit keine Mietpreisbremsen-Verordnung.
                Vermieter können die Miete bei Neuvermietung frei festsetzen.
              </p>
            </div>
          )}
        </div>

        {/* Ortsübliche Vergleichsmiete */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ortsübliche Vergleichsmiete (Mietspiegel)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Kaltmiete pro m² laut Mietspiegel Ihrer Stadt
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={vergleichsmiete}
              onChange={(e) => setVergleichsmiete(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m²</span>
          </div>
          <input
            type="range"
            value={vergleichsmiete}
            onChange={(e) => setVergleichsmiete(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
            min="4"
            max="25"
            step="0.1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>4 €/m²</span>
            <span>15 €/m²</span>
            <span>25 €/m²</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tipp: Die ortsübliche Vergleichsmiete finden Sie im Mietspiegel Ihrer Stadt oder online.
          </p>
        </div>

        {/* Aktuelle Kaltmiete */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ihre aktuelle Kaltmiete</span>
            <span className="text-xs text-gray-500 block mt-1">
              Nettokaltmiete pro m² (ohne Nebenkosten)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={aktuelleKaltmiete}
              onChange={(e) => setAktuelleKaltmiete(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/m²</span>
          </div>
          <input
            type="range"
            value={aktuelleKaltmiete}
            onChange={(e) => setAktuelleKaltmiete(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
            min="4"
            max="30"
            step="0.1"
          />
        </div>

        {/* Wohnfläche */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wohnfläche</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={wohnflaeche}
              onChange={(e) => setWohnflaeche(Math.max(1, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="1"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {[30, 50, 65, 80, 100, 120].map((qm) => (
              <button
                key={qm}
                onClick={() => setWohnflaeche(qm)}
                className={`py-1.5 px-3 text-sm rounded-lg transition-colors ${
                  wohnflaeche === qm
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {qm} m²
              </button>
            ))}
          </div>
        </div>

        {/* Ausnahmen-Check */}
        <div className="mb-4">
          <h3 className="text-gray-700 font-medium mb-3">Ausnahmen prüfen</h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={istNeubau}
                onChange={(e) => setIstNeubau(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-gray-800 font-medium">🏗️ Neubauwohnung</span>
                <span className="text-xs text-gray-500 block">
                  Erstbezug nach dem 01.10.2014 – Mietpreisbremse gilt nicht
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={istModernisiert}
                onChange={(e) => setIstModernisiert(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-gray-800 font-medium">🔧 Umfassende Modernisierung</span>
                <span className="text-xs text-gray-500 block">
                  Erste Vermietung nach umfassender Modernisierung (ca. 1/3 der Neubaukosten)
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={hatHoheVormiete}
                onChange={(e) => {
                  setHatHoheVormiete(e.target.checked);
                  if (!e.target.checked) {
                    setVormieteProQm(0);
                    setWurdeInformiert(false);
                  }
                }}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-gray-800 font-medium">📋 Höhere Vormiete</span>
                <span className="text-xs text-gray-500 block">
                  Der Vormieter hat bereits eine höhere Miete gezahlt
                </span>
              </div>
            </label>

            {hatHoheVormiete && (
              <div className="ml-8 p-4 bg-gray-50 rounded-xl space-y-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Vormiete pro m²</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={vormieteProQm}
                      onChange={(e) => setVormieteProQm(Math.max(0, Number(e.target.value)))}
                      className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                      min="0"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/m²</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wurdeInformiert}
                    onChange={(e) => setWurdeInformiert(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Vermieter hat mich <strong>vor Vertragsschluss</strong> über die Vormiete informiert
                  </span>
                </label>
                {!wurdeInformiert && vormieteProQm > ergebnis.maxMieteProQm && (
                  <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                    ✓ Ohne vorherige Information haben Sie <strong>2 Jahre Schutz</strong> und müssen nur die normale Grenze (10% über Mietspiegel) zahlen.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br ${getStatusColor()}`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">🛑 Mietpreisbremse-Prüfung</h3>
        
        <div className="text-xl font-bold mb-4">{getStatusText()}</div>

        {ergebnis.hatMietpreisbremse && !ergebnis.ausnahmeZutrifft && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Maximal zulässig</span>
                <div className="text-2xl font-bold">{formatEuroProQm(ergebnis.effektiveMaxMieteProQm)}</div>
                <div className="text-sm opacity-80">{formatEuro(ergebnis.effektiveMaxMieteGesamt)}/Monat</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Ihre Miete</span>
                <div className="text-2xl font-bold">{formatEuroProQm(ergebnis.aktuelleKaltmiete)}</div>
                <div className="text-sm opacity-80">{formatEuro(ergebnis.aktuelleMieteGesamt)}/Monat</div>
              </div>
            </div>

            {ergebnis.mieteZuHoch && (
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-sm opacity-80 mb-1">💰 Mögliche Ersparnis bei Rüge</div>
                <div className="text-3xl font-bold">{formatEuro(ergebnis.effektiveDifferenzGesamt)}/Monat</div>
                <div className="text-lg mt-1">{formatEuro(ergebnis.jaehrlicheErsparnis)}/Jahr</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detaillierte Berechnung */}
      {ergebnis.hatMietpreisbremse && !ergebnis.ausnahmeZutrifft && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Ortsübliche Vergleichsmiete (Mietspiegel)</span>
              <span className="font-medium">{formatEuroProQm(ergebnis.vergleichsmiete)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">+ 10% Aufschlag (Mietpreisbremse)</span>
              <span className="font-medium">+ {formatEuroProQm(ergebnis.vergleichsmiete * 0.1)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-200 bg-blue-50 -mx-6 px-6">
              <span className="font-bold text-blue-800">= Maximal zulässige Miete</span>
              <span className="font-bold text-blue-800">{formatEuroProQm(ergebnis.maxMieteProQm)}</span>
            </div>

            {ergebnis.vormieteAusnahme && (
              <div className="flex justify-between py-2 border-b border-gray-100 text-amber-700 bg-amber-50 -mx-6 px-6">
                <span className="font-medium">Vormiete-Ausnahme greift</span>
                <span className="font-medium">{formatEuroProQm(vormieteProQm)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Ihre aktuelle Kaltmiete</span>
              <span className="font-medium">{formatEuroProQm(ergebnis.aktuelleKaltmiete)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Überschreitung über Mietspiegel</span>
              <span className={`font-medium ${ergebnis.ueberschreitungProzent > 10 ? 'text-red-600' : 'text-green-600'}`}>
                {ergebnis.ueberschreitungProzent > 0 ? '+' : ''}{ergebnis.ueberschreitungProzent.toFixed(1)}%
              </span>
            </div>

            {ergebnis.mieteZuHoch && (
              <>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Differenz (zu viel pro m²)</span>
                  <span className="font-medium text-red-600">+{formatEuroProQm(ergebnis.effektiveDifferenz)}</span>
                </div>
                
                <div className="flex justify-between py-3 bg-red-50 -mx-6 px-6 rounded-b-xl">
                  <span className="font-bold text-red-800">Zu viel gezahlte Miete (monatlich)</span>
                  <span className="font-bold text-2xl text-red-800">{formatEuro(ergebnis.effektiveDifferenzGesamt)}</span>
                </div>
              </>
            )}
            
            {!ergebnis.mieteZuHoch && (
              <div className="flex justify-between py-3 bg-green-50 -mx-6 px-6 rounded-b-xl">
                <span className="font-bold text-green-800">✓ Miete liegt im zulässigen Rahmen</span>
                <span className="font-bold text-green-800">OK</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visualisierung */}
      {ergebnis.hatMietpreisbremse && !ergebnis.ausnahmeZutrifft && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📈 Visuelle Darstellung</h3>
          
          <div className="space-y-4">
            {/* Balkendiagramm */}
            <div className="relative h-12 bg-gray-100 rounded-xl overflow-hidden">
              {/* Vergleichsmiete (100%) */}
              <div 
                className="absolute h-full bg-blue-200"
                style={{ width: `${(ergebnis.vergleichsmiete / Math.max(ergebnis.aktuelleKaltmiete, ergebnis.maxMieteProQm) * 100)}%` }}
              />
              {/* Maximal zulässig (+10%) */}
              <div 
                className="absolute h-full bg-green-400"
                style={{ 
                  left: `${(ergebnis.vergleichsmiete / Math.max(ergebnis.aktuelleKaltmiete, ergebnis.maxMieteProQm) * 100)}%`,
                  width: `${((ergebnis.maxMieteProQm - ergebnis.vergleichsmiete) / Math.max(ergebnis.aktuelleKaltmiete, ergebnis.maxMieteProQm) * 100)}%`
                }}
              />
              {/* Überschreitung */}
              {ergebnis.mieteZuHoch && (
                <div 
                  className="absolute h-full bg-red-400"
                  style={{ 
                    left: `${(ergebnis.maxMieteProQm / Math.max(ergebnis.aktuelleKaltmiete, ergebnis.maxMieteProQm) * 100)}%`,
                    width: `${((ergebnis.aktuelleKaltmiete - ergebnis.maxMieteProQm) / Math.max(ergebnis.aktuelleKaltmiete, ergebnis.maxMieteProQm) * 100)}%`
                  }}
                />
              )}
              {/* Marker für aktuelle Miete */}
              <div 
                className="absolute h-full w-1 bg-gray-800"
                style={{ left: `${(ergebnis.aktuelleKaltmiete / Math.max(ergebnis.aktuelleKaltmiete, ergebnis.maxMieteProQm) * 100)}%` }}
              />
            </div>
            
            {/* Legende */}
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-200" />
                <span>Mietspiegel ({formatEuroProQm(ergebnis.vergleichsmiete)})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-400" />
                <span>+10% zulässig</span>
              </div>
              {ergebnis.mieteZuHoch && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-400" />
                  <span>Überschreitung</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 rounded bg-gray-800" />
                <span>Ihre Miete</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Handlungsempfehlungen */}
      {ergebnis.hatMietpreisbremse && ergebnis.mieteZuHoch && !ergebnis.ausnahmeZutrifft && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-green-800 mb-3">✅ Was können Sie tun?</h3>
          <ol className="space-y-3 text-sm text-green-700">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>
                <strong>Rüge schreiben:</strong> Schriftlich gegenüber dem Vermieter die zu hohe Miete beanstanden 
                (per E-Mail oder Brief ausreichend)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>
                <strong>Differenz einbehalten:</strong> Ab dem Zeitpunkt der Rüge können Sie die Miete kürzen 
                (nur den über der Grenze liegenden Teil)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>
                <strong>Rückzahlung fordern:</strong> Zu viel gezahlte Miete kann ab der Rüge zurückgefordert werden
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>
                <strong>Bei Ablehnung:</strong> Mieterverein oder Rechtsanwalt einschalten, ggf. Dienstleister wie Conny nutzen
              </span>
            </li>
          </ol>
        </div>
      )}

      {/* Ausnahmen Info */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">⚠️ Ausnahmen von der Mietpreisbremse</h3>
        
        <div className="grid gap-4">
          {AUSNAHMEN.map((ausnahme) => (
            <div key={ausnahme.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">{ausnahme.icon}</span>
              <div>
                <h4 className="font-medium text-gray-800">{ausnahme.titel}</h4>
                <p className="text-sm text-gray-600">{ausnahme.beschreibung}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <strong>Wichtig:</strong> Der Vermieter muss Sie <strong>vor Vertragsschluss</strong> über Ausnahmen informieren 
            (z.B. Neubau, Modernisierung, Vormiete). Ohne diese Information gelten die Ausnahmen erst 2 Jahre nach 
            nachträglicher Mitteilung!
          </p>
        </div>
      </div>

      {/* Bundesland-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Mietpreisbremse nach Bundesland</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-600">Bundesland</th>
                <th className="text-center py-2 px-3 font-medium text-gray-600">Status</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Gültig bis</th>
              </tr>
            </thead>
            <tbody>
              {BUNDESLAENDER.map((bl, idx) => (
                <tr 
                  key={bl.id}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${bl.id === bundeslandId ? 'bg-blue-50' : ''}`}
                >
                  <td className={`py-2 px-3 ${bl.id === bundeslandId ? 'font-bold text-blue-700' : 'text-gray-700'}`}>
                    {bl.name}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {bl.hatMietpreisbremse ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        {bl.anzahlGebiete} Gebiete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400">
                        <span className="w-2 h-2 bg-gray-300 rounded-full" />
                        Keine
                      </span>
                    )}
                  </td>
                  <td className={`py-2 px-3 text-right ${bl.hatMietpreisbremse ? 'text-gray-600' : 'text-gray-400'}`}>
                    {bl.gueltigBis}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Stand: Januar 2026. Die Mietpreisbremse gilt in <strong>627 Städten und Gemeinden</strong> – etwa ein Drittel der Bevölkerung lebt in einem Gebiet mit angespanntem Wohnungsmarkt.
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Was ist die Mietpreisbremse?</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            Die <strong>Mietpreisbremse</strong> (§§ 556d ff. BGB) begrenzt die Miete bei Neuvermietung in Gebieten mit 
            angespanntem Wohnungsmarkt. Sie wurde 2015 eingeführt und gilt bis <strong>Ende 2029</strong>.
          </p>
          
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-medium text-blue-800 mb-2">Die Grundregel:</h4>
            <p className="text-blue-700">
              Die Miete darf bei Neuvermietung <strong>maximal 10% über der ortsüblichen Vergleichsmiete</strong> liegen.
            </p>
          </div>
          
          <h4 className="font-medium text-gray-800 mt-4">Was ist die ortsübliche Vergleichsmiete?</h4>
          <p>
            Die ortsübliche Vergleichsmiete ist der Durchschnittswert für vergleichbare Wohnungen am gleichen Standort. 
            Sie können sie ermitteln über:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Mietspiegel:</strong> Viele Städte veröffentlichen offizielle Mietspiegel</li>
            <li><strong>Mietdatenbank:</strong> Z.B. beim Mieterverein</li>
            <li><strong>Sachverständigengutachten:</strong> Bei Streitfällen</li>
          </ul>
          
          <h4 className="font-medium text-gray-800 mt-4">Wie kann ich die Mietpreisbremse durchsetzen?</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Mietspiegel Ihrer Stadt prüfen</li>
            <li>Vergleichsmiete für Ihre Wohnung ermitteln</li>
            <li>Prüfen, ob Ihre Miete mehr als 10% darüber liegt</li>
            <li>Schriftliche Rüge an den Vermieter senden</li>
            <li>Ab Zugang der Rüge können Sie die Miete kürzen</li>
          </ol>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-red-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-red-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Nur Neuvermietung:</strong> Die Mietpreisbremse gilt nur bei neuen Mietverträgen, nicht für bestehende Mietverhältnisse</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Rüge erforderlich:</strong> Ohne schriftliche Rüge können Sie zu viel gezahlte Miete nicht zurückfordern</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Keine Rückwirkung:</strong> Rückforderung erst ab dem Zeitpunkt der Rüge möglich</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Gebiet prüfen:</strong> Nicht alle Städte eines Bundeslandes haben die Mietpreisbremse – prüfen Sie die genaue Liste</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Keine Behörde:</strong> Es gibt keine Aufsichtsbehörde – Sie müssen selbst aktiv werden</span>
          </li>
        </ul>
      </div>

            <RechnerFeedback rechnerName="Mietpreisbremse-Rechner" rechnerSlug="mietpreisbremse-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/bgb/__556d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 556d BGB – Mietpreisbremse
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/bgb/__556e.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 556e BGB – Höhere Vormiete
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/bgb/__556f.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 556f BGB – Ausnahmen (Neubau, Modernisierung)
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/bgb/__556g.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 556g BGB – Rechtsfolgen und Auskunftspflicht
          </a>
          <a 
            href="https://www.finanztip.de/mietpreisbremse/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Finanztip – Mietpreisbremse Ratgeber
          </a>
        </div>
      </div>
    </div>
  );
}
