import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Grunderwerbsteuer nach Bundesland (Stand 2026)
// Quelle: §11 GrEStG, Ländersteuersätze
interface Bundesland {
  id: string;
  name: string;
  grunderwerbsteuer: number; // in Prozent
  maklerKaeuferAnteil: number; // üblicher Käuferanteil in Prozent (nach Gesetz max. 50% seit Dez 2020)
  maklerGesamt: number; // übliche Gesamtprovision in Prozent
}

const BUNDESLAENDER: Bundesland[] = [
  { id: 'bw', name: 'Baden-Württemberg', grunderwerbsteuer: 5.0, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
  { id: 'by', name: 'Bayern', grunderwerbsteuer: 3.5, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
  { id: 'be', name: 'Berlin', grunderwerbsteuer: 6.0, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
  { id: 'bb', name: 'Brandenburg', grunderwerbsteuer: 6.5, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
  { id: 'hb', name: 'Bremen', grunderwerbsteuer: 5.5, maklerKaeuferAnteil: 2.975, maklerGesamt: 5.95 },
  { id: 'hh', name: 'Hamburg', grunderwerbsteuer: 5.5, maklerKaeuferAnteil: 3.125, maklerGesamt: 6.25 },
  { id: 'he', name: 'Hessen', grunderwerbsteuer: 6.0, maklerKaeuferAnteil: 2.975, maklerGesamt: 5.95 },
  { id: 'mv', name: 'Mecklenburg-Vorpommern', grunderwerbsteuer: 6.0, maklerKaeuferAnteil: 2.975, maklerGesamt: 5.95 },
  { id: 'ni', name: 'Niedersachsen', grunderwerbsteuer: 5.0, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
  { id: 'nw', name: 'Nordrhein-Westfalen', grunderwerbsteuer: 6.5, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
  { id: 'rp', name: 'Rheinland-Pfalz', grunderwerbsteuer: 5.0, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
  { id: 'sl', name: 'Saarland', grunderwerbsteuer: 6.5, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
  { id: 'sn', name: 'Sachsen', grunderwerbsteuer: 5.5, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
  { id: 'st', name: 'Sachsen-Anhalt', grunderwerbsteuer: 5.0, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
  { id: 'sh', name: 'Schleswig-Holstein', grunderwerbsteuer: 6.5, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
  { id: 'th', name: 'Thüringen', grunderwerbsteuer: 5.0, maklerKaeuferAnteil: 3.57, maklerGesamt: 7.14 },
];

// Notarkosten nach GNotKG (Gerichts- und Notarkostengesetz)
// Vereinfachte Staffelung für Immobilienkäufe
function berechneNotarkosten(kaufpreis: number): number {
  // Typischerweise ca. 1,0% - 1,5% des Kaufpreises
  // Enthält: Beurkundung Kaufvertrag, Grundschuldbestellung, Vollzug
  // Vereinfachte Berechnung: ca. 1,5% des Kaufpreises (inkl. MwSt.)
  return Math.round(kaufpreis * 0.015);
}

// Grundbuchkosten nach GNotKG
// Eintragung des Eigentümers + Grundschuld
function berechneGrundbuchkosten(kaufpreis: number): number {
  // Typischerweise ca. 0,5% des Kaufpreises
  // Enthält: Eigentumsumschreibung + Grundschuldeintragung
  return Math.round(kaufpreis * 0.005);
}

export default function KaufnebenkostenRechner() {
  // Eingabewerte
  const [kaufpreis, setKaufpreis] = useState(300000);
  const [bundeslandId, setBundeslandId] = useState('by'); // Default: Bayern
  const [mitMakler, setMitMakler] = useState(true);
  const [eigenerMakleranteil, setEigenerMakleranteil] = useState(false);
  const [maklerKaeuferProzent, setMaklerKaeuferProzent] = useState(3.57);
  const [mitGrundschuld, setMitGrundschuld] = useState(true);
  const [grundschuldHoehe, setGrundschuldHoehe] = useState(240000); // 80% Finanzierung

  const ergebnis = useMemo(() => {
    const bundesland = BUNDESLAENDER.find(b => b.id === bundeslandId)!;
    
    // Grunderwerbsteuer
    const grunderwerbsteuer = Math.round(kaufpreis * (bundesland.grunderwerbsteuer / 100));
    
    // Notarkosten (ca. 1,5% des Kaufpreises)
    const notarkosten = berechneNotarkosten(kaufpreis);
    
    // Grundbuchkosten (ca. 0,5% des Kaufpreises)
    const grundbuchkosten = berechneGrundbuchkosten(kaufpreis);
    
    // Zusätzliche Kosten bei Grundschuld (Finanzierung)
    let grundschuldNotarkosten = 0;
    let grundschuldEintragung = 0;
    if (mitGrundschuld && grundschuldHoehe > 0) {
      // Grundschuldbestellung beim Notar (ca. 0,4% der Grundschuld)
      grundschuldNotarkosten = Math.round(grundschuldHoehe * 0.004);
      // Grundschuldeintragung im Grundbuch (ca. 0,3% der Grundschuld)
      grundschuldEintragung = Math.round(grundschuldHoehe * 0.003);
    }
    
    // Maklerkosten (nur Käuferanteil)
    let maklerkosten = 0;
    let maklerProzent = 0;
    if (mitMakler) {
      maklerProzent = eigenerMakleranteil ? maklerKaeuferProzent : bundesland.maklerKaeuferAnteil;
      maklerkosten = Math.round(kaufpreis * (maklerProzent / 100));
    }
    
    // Gesamtkosten
    const notarUndGrundbuch = notarkosten + grundbuchkosten + grundschuldNotarkosten + grundschuldEintragung;
    const gesamtNebenkosten = grunderwerbsteuer + notarUndGrundbuch + maklerkosten;
    const gesamtKaufpreis = kaufpreis + gesamtNebenkosten;
    
    // Prozentuale Aufteilung
    const nebenkostenProzent = ((gesamtNebenkosten / kaufpreis) * 100).toFixed(1);
    
    return {
      kaufpreis,
      bundesland,
      
      // Einzelposten
      grunderwerbsteuer,
      grunderwerbsteuerProzent: bundesland.grunderwerbsteuer,
      
      notarkosten,
      grundbuchkosten,
      grundschuldNotarkosten,
      grundschuldEintragung,
      notarUndGrundbuch,
      
      maklerkosten,
      maklerProzent,
      
      // Summen
      gesamtNebenkosten,
      gesamtKaufpreis,
      nebenkostenProzent,
    };
  }, [kaufpreis, bundeslandId, mitMakler, eigenerMakleranteil, maklerKaeuferProzent, mitGrundschuld, grundschuldHoehe]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' %';

  // Farbgebung nach Nebenkosten-Höhe
  const getNebenkostenColor = () => {
    const prozent = parseFloat(ergebnis.nebenkostenProzent);
    if (prozent <= 8) return 'from-green-500 to-emerald-600';
    if (prozent <= 12) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Kaufnebenkosten-Rechner 2025 & 2026" rechnerSlug="kaufnebenkosten-rechner" />

{/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kaufpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kaufpreis der Immobilie</span>
            <span className="text-xs text-gray-500 block mt-1">Haus, Wohnung oder Grundstück</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kaufpreis}
              onChange={(e) => {
                const wert = Math.max(0, Number(e.target.value));
                setKaufpreis(wert);
                // Grundschuld automatisch auf 80% setzen wenn nicht manuell angepasst
                if (!eigenerMakleranteil) {
                  setGrundschuldHoehe(Math.round(wert * 0.8));
                }
              }}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(kaufpreis, 1000000)}
            onChange={(e) => {
              const wert = Number(e.target.value);
              setKaufpreis(wert);
              setGrundschuldHoehe(Math.round(wert * 0.8));
            }}
            className="w-full mt-3 accent-blue-500"
            min="50000"
            max="1000000"
            step="10000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50.000 €</span>
            <span>500.000 €</span>
            <span>1 Mio €</span>
          </div>
        </div>

        {/* Bundesland */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Bundesland</span>
            <span className="text-xs text-gray-500 block mt-1">Bestimmt die Grunderwerbsteuer</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BUNDESLAENDER.map((bl) => (
              <button
                key={bl.id}
                onClick={() => setBundeslandId(bl.id)}
                className={`py-2 px-3 rounded-lg text-sm transition-all ${
                  bundeslandId === bl.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-medium block truncate">{bl.name}</span>
                <span className={`text-xs ${bundeslandId === bl.id ? 'text-blue-100' : 'text-gray-400'}`}>
                  {formatProzent(bl.grunderwerbsteuer)} GrESt
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Grunderwerbsteuer Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏠</span>
            <div>
              <p className="font-medium text-blue-800">
                Grunderwerbsteuer in {ergebnis.bundesland.name}
              </p>
              <p className="text-sm text-blue-600">
                <strong>{formatProzent(ergebnis.grunderwerbsteuerProzent)}</strong> des Kaufpreises = <strong>{formatEuro(ergebnis.grunderwerbsteuer)}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Makler */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={mitMakler}
              onChange={(e) => setMitMakler(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-gray-800 font-medium">🤝 Immobilie über Makler gekauft</span>
              <span className="text-xs text-gray-500 block">
                Seit Dez. 2020: Max. 50% der Provision trägt der Käufer
              </span>
            </div>
          </label>
          
          {mitMakler && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={eigenerMakleranteil}
                  onChange={(e) => {
                    setEigenerMakleranteil(e.target.checked);
                    if (!e.target.checked) {
                      setMaklerKaeuferProzent(ergebnis.bundesland.maklerKaeuferAnteil);
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Andere Maklerprovision eingeben</span>
              </label>
              
              {eigenerMakleranteil ? (
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Ihr Anteil an der Maklerprovision (%)</label>
                  <input
                    type="number"
                    value={maklerKaeuferProzent}
                    onChange={(e) => setMaklerKaeuferProzent(Math.max(0, Math.min(7.14, Number(e.target.value))))}
                    className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                    min="0"
                    max="7.14"
                    step="0.01"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Üblicher Käuferanteil in {ergebnis.bundesland.name}: <strong>{formatProzent(ergebnis.bundesland.maklerKaeuferAnteil)}</strong>
                  <br />
                  <span className="text-xs text-gray-500">(Gesamtprovision: {formatProzent(ergebnis.bundesland.maklerGesamt)}, 50:50 geteilt)</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Finanzierung / Grundschuld */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={mitGrundschuld}
              onChange={(e) => setMitGrundschuld(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-gray-800 font-medium">🏦 Bankfinanzierung (Grundschuld)</span>
              <span className="text-xs text-gray-500 block">
                Zusätzliche Notar- und Grundbuchkosten für Grundschuldeintragung
              </span>
            </div>
          </label>
          
          {mitGrundschuld && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl">
              <label className="text-sm text-gray-600 block mb-2">Höhe der Grundschuld (Darlehenssumme)</label>
              <div className="relative">
                <input
                  type="number"
                  value={grundschuldHoehe}
                  onChange={(e) => setGrundschuldHoehe(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                  step="10000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[60, 70, 80, 90].map(prozent => (
                  <button
                    key={prozent}
                    onClick={() => setGrundschuldHoehe(Math.round(kaufpreis * (prozent / 100)))}
                    className={`flex-1 py-1 px-2 text-xs rounded-lg transition-colors ${
                      Math.round(grundschuldHoehe / kaufpreis * 100) === prozent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {prozent}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br ${getNebenkostenColor()}`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">🏠 Kaufnebenkosten gesamt</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamtNebenkosten)}</span>
          </div>
          <p className="text-white/80 mt-2 text-sm">
            Das sind <strong>{ergebnis.nebenkostenProzent}%</strong> des Kaufpreises
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Kaufpreis</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.kaufpreis)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamtkosten</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.gesamtKaufpreis)}</div>
          </div>
        </div>
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Aufschlüsselung der Nebenkosten</h3>
        
        <div className="space-y-3 text-sm">
          {/* Grunderwerbsteuer */}
          <div className="flex justify-between py-3 border-b border-gray-100">
            <div>
              <span className="text-gray-800 font-medium">Grunderwerbsteuer</span>
              <span className="text-xs text-gray-500 block">{formatProzent(ergebnis.grunderwerbsteuerProzent)} in {ergebnis.bundesland.name}</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">{formatEuro(ergebnis.grunderwerbsteuer)}</span>
          </div>
          
          {/* Notar & Grundbuch */}
          <div className="py-3 border-b border-gray-100">
            <div className="flex justify-between mb-2">
              <div>
                <span className="text-gray-800 font-medium">Notarkosten</span>
                <span className="text-xs text-gray-500 block">Kaufvertrag & Beurkundung (ca. 1,5%)</span>
              </div>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.notarkosten)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <div>
                <span className="text-gray-800 font-medium">Grundbuchkosten</span>
                <span className="text-xs text-gray-500 block">Eigentumsumschreibung (ca. 0,5%)</span>
              </div>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.grundbuchkosten)}</span>
            </div>
            
            {mitGrundschuld && grundschuldHoehe > 0 && (
              <>
                <div className="flex justify-between mb-2 text-gray-600">
                  <div>
                    <span className="font-medium">+ Grundschuld Notar</span>
                    <span className="text-xs text-gray-500 block">Grundschuldbestellung</span>
                  </div>
                  <span>{formatEuro(ergebnis.grundschuldNotarkosten)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div>
                    <span className="font-medium">+ Grundschuld Grundbuch</span>
                    <span className="text-xs text-gray-500 block">Eintragung der Grundschuld</span>
                  </div>
                  <span>{formatEuro(ergebnis.grundschuldEintragung)}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-200">
              <span className="font-medium text-gray-700">Notar + Grundbuch gesamt</span>
              <span className="font-bold text-gray-900 text-lg">{formatEuro(ergebnis.notarUndGrundbuch)}</span>
            </div>
          </div>
          
          {/* Makler */}
          {mitMakler && (
            <div className="flex justify-between py-3 border-b border-gray-100">
              <div>
                <span className="text-gray-800 font-medium">Maklerprovision (Käuferanteil)</span>
                <span className="text-xs text-gray-500 block">{formatProzent(ergebnis.maklerProzent)} vom Kaufpreis</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">{formatEuro(ergebnis.maklerkosten)}</span>
            </div>
          )}
          
          {!mitMakler && (
            <div className="flex justify-between py-3 border-b border-gray-100 text-gray-400">
              <div>
                <span className="font-medium">Maklerprovision</span>
                <span className="text-xs block">Kein Makler involviert</span>
              </div>
              <span className="font-bold">0 €</span>
            </div>
          )}
          
          {/* Summe */}
          <div className="flex justify-between py-4 bg-blue-50 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-blue-800 text-lg">Gesamte Kaufnebenkosten</span>
            <span className="font-bold text-2xl text-blue-900">{formatEuro(ergebnis.gesamtNebenkosten)}</span>
          </div>
        </div>
      </div>

      {/* Visualisierung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📈 Kostenverteilung</h3>
        
        <div className="space-y-4">
          {/* Balkendiagramm */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Grunderwerbsteuer</span>
                <span className="font-medium">{formatEuro(ergebnis.grunderwerbsteuer)}</span>
              </div>
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${(ergebnis.grunderwerbsteuer / ergebnis.gesamtNebenkosten * 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Notar + Grundbuch</span>
                <span className="font-medium">{formatEuro(ergebnis.notarUndGrundbuch)}</span>
              </div>
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(ergebnis.notarUndGrundbuch / ergebnis.gesamtNebenkosten * 100)}%` }}
                />
              </div>
            </div>
            
            {mitMakler && ergebnis.maklerkosten > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Makler</span>
                  <span className="font-medium">{formatEuro(ergebnis.maklerkosten)}</span>
                </div>
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(ergebnis.maklerkosten / ergebnis.gesamtNebenkosten * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Legende */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Grunderwerbsteuer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Notar + Grundbuch</span>
            </div>
            {mitMakler && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Makler</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grunderwerbsteuer-Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Grunderwerbsteuer nach Bundesland 2026</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-600">Bundesland</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Steuersatz</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Bei {formatEuro(kaufpreis)}</th>
              </tr>
            </thead>
            <tbody>
              {BUNDESLAENDER.sort((a, b) => a.grunderwerbsteuer - b.grunderwerbsteuer).map((bl, idx) => (
                <tr 
                  key={bl.id} 
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${bl.id === bundeslandId ? 'bg-blue-50' : ''}`}
                >
                  <td className={`py-2 px-3 ${bl.id === bundeslandId ? 'font-bold text-blue-700' : 'text-gray-700'}`}>
                    {bl.name}
                    {bl.id === bundeslandId && <span className="ml-1">✓</span>}
                  </td>
                  <td className={`py-2 px-3 text-right ${bl.id === bundeslandId ? 'font-bold text-blue-700' : ''}`}>
                    {formatProzent(bl.grunderwerbsteuer)}
                  </td>
                  <td className={`py-2 px-3 text-right ${bl.id === bundeslandId ? 'font-bold text-blue-700' : 'text-gray-600'}`}>
                    {formatEuro(Math.round(kaufpreis * (bl.grunderwerbsteuer / 100)))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Günstigste Grunderwerbsteuer: <strong>Bayern</strong> (3,5%). 
          Teuerste: <strong>Brandenburg, NRW, Saarland, Schleswig-Holstein</strong> (6,5%).
        </p>
      </div>

      {/* Spar-Tipps */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💡 Tipps zum Sparen bei Kaufnebenkosten</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Maklerkosten verhandeln:</strong> Die Provision ist nicht festgeschrieben – verhandeln Sie!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Privatkauf prüfen:</strong> Bei Immoscout24 & Co. auf "provisionsfrei" filtern spart bis zu 3,57%</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Inventar separat kaufen:</strong> Einbauküche, Möbel etc. im Kaufvertrag separat ausweisen – keine Grunderwerbsteuer darauf!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Grundstück vom Bau trennen:</strong> Bei Neubauten ggf. Grundstück und Bauleistung in separaten Verträgen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Reparaturrücklagen:</strong> Anteilige Rücklagen bei Eigentumswohnungen mindern den steuerpflichtigen Kaufpreis</span>
          </li>
        </ul>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Was sind Kaufnebenkosten?</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            <strong>Kaufnebenkosten</strong> sind alle Kosten, die zusätzlich zum eigentlichen Kaufpreis einer 
            Immobilie anfallen. Sie machen typischerweise <strong>5,5% bis 12,5%</strong> des Kaufpreises aus 
            und müssen in der Regel aus Eigenkapital bezahlt werden.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-800 mb-2">Obligatorische Nebenkosten:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• <strong>Grunderwerbsteuer</strong> – Landessteuer beim Immobilienkauf (3,5% - 6,5%)</li>
              <li>• <strong>Notarkosten</strong> – Beurkundung des Kaufvertrags (ca. 1,5%)</li>
              <li>• <strong>Grundbuchkosten</strong> – Eintragung als Eigentümer (ca. 0,5%)</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-800 mb-2">Variable Nebenkosten:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• <strong>Maklerprovision</strong> – Bei Kauf über Makler (0% - 3,57% Käuferanteil)</li>
              <li>• <strong>Grundschuld</strong> – Zusätzliche Notar-/Grundbuchkosten bei Finanzierung</li>
              <li>• <strong>Gutachter</strong> – Optional für Wertermittlung</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Maklergesetz Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚖️ Neues Maklerrecht seit Dezember 2020</h3>
        <div className="space-y-3 text-sm text-amber-700">
          <p>
            Das <strong>Gesetz über die Verteilung der Maklerkosten</strong> regelt seit 23.12.2020:
          </p>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <span>Bei Wohnungen und Einfamilienhäusern muss der Käufer <strong>maximal 50%</strong> der Maklerprovision zahlen</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Beauftragt nur der Verkäufer den Makler, zahlt er die <strong>volle Provision</strong></span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Die Regelung gilt <strong>nicht</strong> für Mehrfamilienhäuser, Gewerbe oder Grundstücke</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-red-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-red-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Eigenkapital:</strong> Kaufnebenkosten sollten aus Eigenkapital gezahlt werden – Banken finanzieren sie ungern</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Fälligkeit:</strong> Die Grunderwerbsteuer ist meist innerhalb von 4 Wochen nach Steuerbescheid fällig</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Unbedenklichkeitsbescheinigung:</strong> Erst nach Zahlung der Grunderwerbsteuer erfolgt die Grundbucheintragung</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Schätzwerte:</strong> Die tatsächlichen Notar- und Grundbuchkosten können je nach Einzelfall abweichen</span>
          </li>
        </ul>
      </div>
{/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/grestg_1983/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Grunderwerbsteuergesetz (GrEStG)
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/gnotkg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Gerichts- und Notarkostengesetz (GNotKG)
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/bgb/__656c.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 656c BGB – Lohnanspruch bei Maklertätigkeit für beide Parteien
          </a>
          <a 
            href="https://www.bmj.de/DE/themen/immobilien_baurecht/maklerrecht/maklerrecht_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMJ – Neues Maklerrecht
          </a>
        </div>
      </div>
    </div>
  );
}
