import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

/**
 * Maklerkosten-Rechner für Immobilien in Deutschland
 * 
 * Rechtliche Grundlage:
 * - § 656a-d BGB (Maklervertrag bei Wohnungsvermittlung)
 * - Gesetz über die Verteilung der Maklerkosten (23.12.2020)
 * 
 * Seit Dezember 2020:
 * - Bei Wohnungen/Einfamilienhäusern: Käufer zahlt max. 50% der Provision
 * - Provision muss zwischen Käufer und Verkäufer geteilt werden
 * - Beauftragt nur der Verkäufer den Makler, zahlt er die volle Provision
 */

// Übliche Maklerprovisionen nach Bundesland (inkl. 19% MwSt.)
// Stand: 2024/2025 - marktübliche Gesamtprovisionen
interface BundeslandMakler {
  id: string;
  name: string;
  kurzname: string;
  provisionGesamt: number; // übliche Gesamtprovision in %
  provisionKaeufer: number; // üblicher Käuferanteil nach Halbteilung
  provisionVerkaufer: number; // üblicher Verkäuferanteil
  bemerkung?: string;
}

const BUNDESLAENDER: BundeslandMakler[] = [
  { id: 'bw', name: 'Baden-Württemberg', kurzname: 'BW', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
  { id: 'by', name: 'Bayern', kurzname: 'BY', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
  { id: 'be', name: 'Berlin', kurzname: 'BE', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
  { id: 'bb', name: 'Brandenburg', kurzname: 'BB', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
  { id: 'hb', name: 'Bremen', kurzname: 'HB', provisionGesamt: 5.95, provisionKaeufer: 2.975, provisionVerkaufer: 2.975, bemerkung: 'Niedrigere Provision üblich' },
  { id: 'hh', name: 'Hamburg', kurzname: 'HH', provisionGesamt: 6.25, provisionKaeufer: 3.125, provisionVerkaufer: 3.125 },
  { id: 'he', name: 'Hessen', kurzname: 'HE', provisionGesamt: 5.95, provisionKaeufer: 2.975, provisionVerkaufer: 2.975, bemerkung: 'Niedrigere Provision üblich' },
  { id: 'mv', name: 'Mecklenburg-Vorpommern', kurzname: 'MV', provisionGesamt: 5.95, provisionKaeufer: 2.975, provisionVerkaufer: 2.975 },
  { id: 'ni', name: 'Niedersachsen', kurzname: 'NI', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
  { id: 'nw', name: 'Nordrhein-Westfalen', kurzname: 'NRW', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
  { id: 'rp', name: 'Rheinland-Pfalz', kurzname: 'RP', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
  { id: 'sl', name: 'Saarland', kurzname: 'SL', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
  { id: 'sn', name: 'Sachsen', kurzname: 'SN', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
  { id: 'st', name: 'Sachsen-Anhalt', kurzname: 'ST', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
  { id: 'sh', name: 'Schleswig-Holstein', kurzname: 'SH', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
  { id: 'th', name: 'Thüringen', kurzname: 'TH', provisionGesamt: 7.14, provisionKaeufer: 3.57, provisionVerkaufer: 3.57 },
];

// Auftraggeber-Szenarien seit Gesetz 12/2020
type Auftraggeber = 'beide' | 'verkaufer' | 'individuell';

export default function MaklerkostenRechner() {
  // Eingabewerte
  const [kaufpreis, setKaufpreis] = useState(400000);
  const [bundeslandId, setBundeslandId] = useState('by');
  const [auftraggeber, setAuftraggeber] = useState<Auftraggeber>('beide');
  const [individuelleProvision, setIndividuelleProvision] = useState(false);
  const [provisionGesamt, setProvisionGesamt] = useState(7.14);
  const [kaeuferAnteil, setKaeuferAnteil] = useState(50); // Prozent der Gesamtprovision
  const [istKaeufer, setIstKaeufer] = useState(true); // Bin ich Käufer oder Verkäufer?
  const [immobilienTyp, setImmobilienTyp] = useState<'wohnung' | 'gewerbe'>('wohnung');

  const bundesland = BUNDESLAENDER.find(b => b.id === bundeslandId)!;

  const ergebnis = useMemo(() => {
    // Verwendete Provision
    let provGesamt: number;
    let provKaeufer: number;
    let provVerkaufer: number;

    if (individuelleProvision) {
      provGesamt = provisionGesamt;
      provKaeufer = (provGesamt * kaeuferAnteil) / 100;
      provVerkaufer = provGesamt - provKaeufer;
    } else if (auftraggeber === 'verkaufer') {
      // Verkäufer beauftragt allein → zahlt alles (seit 2020)
      provGesamt = bundesland.provisionGesamt;
      provKaeufer = 0;
      provVerkaufer = provGesamt;
    } else {
      // Standard: 50/50 Aufteilung
      provGesamt = bundesland.provisionGesamt;
      provKaeufer = bundesland.provisionKaeufer;
      provVerkaufer = bundesland.provisionVerkaufer;
    }

    // Bei Gewerbeimmobilien gilt das 2020er-Gesetz nicht
    // Hier kann Käufer auch 100% zahlen
    if (immobilienTyp === 'gewerbe') {
      // Keine Einschränkung - volle Flexibilität
    }

    // Beträge berechnen
    const provisionKaeuferBetrag = Math.round(kaufpreis * (provKaeufer / 100));
    const provisionVerkauferBetrag = Math.round(kaufpreis * (provVerkaufer / 100));
    const provisionGesamtBetrag = provisionKaeuferBetrag + provisionVerkauferBetrag;

    // Netto-Beträge (ohne 19% MwSt.)
    const mwstSatz = 0.19;
    const provisionKaeuferNetto = Math.round(provisionKaeuferBetrag / (1 + mwstSatz));
    const provisionVerkauferNetto = Math.round(provisionVerkauferBetrag / (1 + mwstSatz));
    const provisionGesamtNetto = Math.round(provisionGesamtBetrag / (1 + mwstSatz));
    
    const mwstKaeufer = provisionKaeuferBetrag - provisionKaeuferNetto;
    const mwstVerkaufer = provisionVerkauferBetrag - provisionVerkauferNetto;
    const mwstGesamt = provisionGesamtBetrag - provisionGesamtNetto;

    // Mein Anteil (je nachdem ob ich Käufer oder Verkäufer bin)
    const meinAnteilBetrag = istKaeufer ? provisionKaeuferBetrag : provisionVerkauferBetrag;
    const meinAnteilProzent = istKaeufer ? provKaeufer : provVerkaufer;

    // Sparpotenzial berechnen (Vergleich mit vollem Satz)
    const maxProvisionGesamt = 7.14;
    const maxMeinAnteil = istKaeufer 
      ? Math.round(kaufpreis * (maxProvisionGesamt / 2 / 100))
      : Math.round(kaufpreis * (maxProvisionGesamt / 2 / 100));
    const ersparnis = maxMeinAnteil - meinAnteilBetrag;

    return {
      // Provisionen in %
      provGesamt,
      provKaeufer,
      provVerkaufer,
      
      // Beträge brutto
      provisionGesamtBetrag,
      provisionKaeuferBetrag,
      provisionVerkauferBetrag,
      
      // Beträge netto
      provisionGesamtNetto,
      provisionKaeuferNetto,
      provisionVerkauferNetto,
      
      // MwSt
      mwstGesamt,
      mwstKaeufer,
      mwstVerkaufer,
      
      // Mein Anteil
      meinAnteilBetrag,
      meinAnteilProzent,
      
      // Ersparnis
      ersparnis,
      hatErsparnis: ersparnis > 0,
    };
  }, [kaufpreis, bundesland, auftraggeber, individuelleProvision, provisionGesamt, kaeuferAnteil, istKaeufer, immobilienTyp]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Maklerkosten-Rechner" rechnerSlug="maklerkosten-rechner" />

{/* Einleitung */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🤵</span>
          <div>
            <h3 className="font-bold text-purple-900 mb-2">Maklerkosten-Rechner 2026</h3>
            <p className="text-sm text-purple-700">
              Seit <strong>Dezember 2020</strong> gilt das neue Maklerrecht: Bei Wohnungen und Einfamilienhäusern 
              zahlt der Käufer <strong>maximal 50%</strong> der Maklerprovision. Berechnen Sie hier Ihre Kosten 
              nach Bundesland.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bin ich Käufer oder Verkäufer? */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Ich bin...</span>
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setIstKaeufer(true)}
              className={`flex-1 py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
                istKaeufer
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">🏠</span>
              <div className="text-left">
                <span className="font-bold block">Käufer</span>
                <span className={`text-xs ${istKaeufer ? 'text-blue-100' : 'text-gray-500'}`}>Ich kaufe eine Immobilie</span>
              </div>
            </button>
            <button
              onClick={() => setIstKaeufer(false)}
              className={`flex-1 py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
                !istKaeufer
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">💰</span>
              <div className="text-left">
                <span className="font-bold block">Verkäufer</span>
                <span className={`text-xs ${!istKaeufer ? 'text-green-100' : 'text-gray-500'}`}>Ich verkaufe eine Immobilie</span>
              </div>
            </button>
          </div>
        </div>

        {/* Immobilientyp */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Art der Immobilie</span>
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setImmobilienTyp('wohnung')}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                immobilienTyp === 'wohnung'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">🏢</span>
              <span className="font-medium">Wohnung / Haus</span>
            </button>
            <button
              onClick={() => setImmobilienTyp('gewerbe')}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                immobilienTyp === 'gewerbe'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">🏭</span>
              <span className="font-medium">Gewerbe</span>
            </button>
          </div>
          {immobilienTyp === 'gewerbe' && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <span>⚠️</span>
              Das 2020er Maklergesetz gilt nicht für Gewerbeimmobilien. Hier ist die Provisionsteilung frei verhandelbar.
            </p>
          )}
        </div>

        {/* Kaufpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kaufpreis der Immobilie</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kaufpreis}
              onChange={(e) => setKaufpreis(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(kaufpreis, 1500000)}
            onChange={(e) => setKaufpreis(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="50000"
            max="1500000"
            step="10000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50.000 €</span>
            <span>750.000 €</span>
            <span>1,5 Mio €</span>
          </div>
        </div>

        {/* Bundesland */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Bundesland</span>
            <span className="text-xs text-gray-500 block mt-1">Bestimmt die übliche Maklerprovision</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BUNDESLAENDER.map((bl) => (
              <button
                key={bl.id}
                onClick={() => setBundeslandId(bl.id)}
                className={`py-2 px-3 rounded-lg text-sm transition-all ${
                  bundeslandId === bl.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-medium block truncate">{bl.name}</span>
                <span className={`text-xs ${bundeslandId === bl.id ? 'text-purple-100' : 'text-gray-400'}`}>
                  {formatProzent(bl.provisionGesamt)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Auftraggeber (nur bei Wohnung/Haus relevant) */}
        {immobilienTyp === 'wohnung' && (
          <div className="mb-6">
            <label className="block mb-3">
              <span className="text-gray-700 font-medium">Wer hat den Makler beauftragt?</span>
              <span className="text-xs text-gray-500 block mt-1">
                Seit 12/2020: Beauftragt nur der Verkäufer, zahlt er die volle Provision
              </span>
            </label>
            <div className="space-y-2">
              <button
                onClick={() => { setAuftraggeber('beide'); setIndividuelleProvision(false); }}
                className={`w-full py-3 px-4 rounded-xl text-left transition-all ${
                  auftraggeber === 'beide' && !individuelleProvision
                    ? 'bg-purple-100 border-2 border-purple-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">👥</span>
                  <div>
                    <span className="font-medium text-gray-800">Beide Parteien (50:50)</span>
                    <span className="text-xs text-gray-500 block">
                      Standard: Käufer und Verkäufer teilen sich die Provision
                    </span>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => { setAuftraggeber('verkaufer'); setIndividuelleProvision(false); }}
                className={`w-full py-3 px-4 rounded-xl text-left transition-all ${
                  auftraggeber === 'verkaufer' && !individuelleProvision
                    ? 'bg-green-100 border-2 border-green-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎉</span>
                  <div>
                    <span className="font-medium text-gray-800">Nur Verkäufer (provisionsfrei für Käufer)</span>
                    <span className="text-xs text-gray-500 block">
                      Verkäufer trägt 100% der Maklerkosten
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { setIndividuelleProvision(true); setAuftraggeber('individuell'); }}
                className={`w-full py-3 px-4 rounded-xl text-left transition-all ${
                  individuelleProvision
                    ? 'bg-amber-100 border-2 border-amber-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚙️</span>
                  <div>
                    <span className="font-medium text-gray-800">Individuell eingeben</span>
                    <span className="text-xs text-gray-500 block">
                      Andere Provision oder Aufteilung verhandelt
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Individuelle Eingabe */}
        {(individuelleProvision || immobilienTyp === 'gewerbe') && (
          <div className="p-4 bg-gray-50 rounded-xl mb-4">
            <div className="mb-4">
              <label className="text-sm text-gray-700 font-medium block mb-2">
                Gesamtprovision (%)
              </label>
              <input
                type="number"
                value={immobilienTyp === 'gewerbe' && !individuelleProvision ? bundesland.provisionGesamt : provisionGesamt}
                onChange={(e) => setProvisionGesamt(Math.max(0, Math.min(10, Number(e.target.value))))}
                className="w-full py-2 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                min="0"
                max="10"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium block mb-2">
                Käuferanteil: <span className="text-purple-600 font-bold">{kaeuferAnteil}%</span> der Provision
                {immobilienTyp === 'wohnung' && kaeuferAnteil > 50 && (
                  <span className="text-red-500 text-xs ml-2">⚠️ Max. 50% laut Gesetz!</span>
                )}
              </label>
              <input
                type="range"
                value={kaeuferAnteil}
                onChange={(e) => setKaeuferAnteil(Number(e.target.value))}
                className="w-full accent-purple-500"
                min="0"
                max={immobilienTyp === 'wohnung' ? 50 : 100}
                step="5"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0% (Käufer zahlt nichts)</span>
                <span>{immobilienTyp === 'wohnung' ? '50% (Maximum)' : '100%'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br ${
        istKaeufer ? 'from-blue-500 to-indigo-600' : 'from-green-500 to-emerald-600'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          {istKaeufer ? '🏠 Ihre Maklerkosten als Käufer' : '💰 Ihre Maklerkosten als Verkäufer'}
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.meinAnteilBetrag)}</span>
          </div>
          <p className="text-white/80 mt-2 text-sm">
            Das sind <strong>{formatProzent(ergebnis.meinAnteilProzent)}</strong> des Kaufpreises
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Kaufpreis</span>
            <div className="text-xl font-bold">{formatEuro(kaufpreis)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamte Provision</span>
            <div className="text-xl font-bold">{formatEuro(ergebnis.provisionGesamtBetrag)}</div>
          </div>
        </div>

        {ergebnis.hatErsparnis && (
          <div className="mt-4 bg-white/20 rounded-xl p-3 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <span className="text-sm font-medium">Ihre Ersparnis gegenüber 7,14% / 50:50</span>
              <span className="text-lg font-bold block">{formatEuro(ergebnis.ersparnis)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Detailaufstellung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Aufteilung der Maklerkosten</h3>
        
        <div className="space-y-4">
          {/* Käufer */}
          <div className={`p-4 rounded-xl ${istKaeufer ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏠</span>
                <div>
                  <span className="font-medium text-gray-800">Käuferanteil</span>
                  {istKaeufer && <span className="text-xs text-blue-600 ml-2">(Das zahlen Sie)</span>}
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-xl">{formatEuro(ergebnis.provisionKaeuferBetrag)}</span>
                <span className="text-sm text-gray-500 block">{formatProzent(ergebnis.provKaeufer)}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 flex justify-between">
              <span>Netto: {formatEuro(ergebnis.provisionKaeuferNetto)}</span>
              <span>MwSt: {formatEuro(ergebnis.mwstKaeufer)}</span>
            </div>
          </div>

          {/* Verkäufer */}
          <div className={`p-4 rounded-xl ${!istKaeufer ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <div>
                  <span className="font-medium text-gray-800">Verkäuferanteil</span>
                  {!istKaeufer && <span className="text-xs text-green-600 ml-2">(Das zahlen Sie)</span>}
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-xl">{formatEuro(ergebnis.provisionVerkauferBetrag)}</span>
                <span className="text-sm text-gray-500 block">{formatProzent(ergebnis.provVerkaufer)}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 flex justify-between">
              <span>Netto: {formatEuro(ergebnis.provisionVerkauferNetto)}</span>
              <span>MwSt: {formatEuro(ergebnis.mwstVerkaufer)}</span>
            </div>
          </div>

          {/* Makler (Gesamt) */}
          <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤵</span>
                <span className="font-medium text-gray-800">Makler erhält insgesamt</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-xl text-purple-700">{formatEuro(ergebnis.provisionGesamtBetrag)}</span>
                <span className="text-sm text-purple-500 block">{formatProzent(ergebnis.provGesamt)}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 flex justify-between">
              <span>Netto: {formatEuro(ergebnis.provisionGesamtNetto)}</span>
              <span>MwSt (19%): {formatEuro(ergebnis.mwstGesamt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bundesland-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Maklerprovisionen nach Bundesland 2026</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-600">Bundesland</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Gesamt</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Käufer</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Verkäufer</th>
              </tr>
            </thead>
            <tbody>
              {BUNDESLAENDER.map((bl, idx) => (
                <tr 
                  key={bl.id} 
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${bl.id === bundeslandId ? 'bg-purple-50' : ''}`}
                >
                  <td className={`py-2 px-3 ${bl.id === bundeslandId ? 'font-bold text-purple-700' : 'text-gray-700'}`}>
                    {bl.name}
                    {bl.id === bundeslandId && <span className="ml-1">✓</span>}
                  </td>
                  <td className={`py-2 px-3 text-right ${bl.id === bundeslandId ? 'font-bold text-purple-700' : ''}`}>
                    {formatProzent(bl.provisionGesamt)}
                  </td>
                  <td className={`py-2 px-3 text-right ${bl.id === bundeslandId ? 'font-bold text-purple-700' : 'text-gray-600'}`}>
                    {formatProzent(bl.provisionKaeufer)}
                  </td>
                  <td className={`py-2 px-3 text-right ${bl.id === bundeslandId ? 'font-bold text-purple-700' : 'text-gray-600'}`}>
                    {formatProzent(bl.provisionVerkaufer)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          <strong>Hinweis:</strong> Die angegebenen Provisionen sind marktübliche Richtwerte inklusive 19% MwSt. 
          Die tatsächliche Provision ist frei verhandelbar.
        </div>
      </div>

      {/* Vergleichstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💰 Was zahle ich bei verschiedenen Kaufpreisen?</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-600">Kaufpreis</th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">
                  Ihr Anteil ({formatProzent(ergebnis.meinAnteilProzent)})
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-600">Gesamte Provision</th>
              </tr>
            </thead>
            <tbody>
              {[200000, 300000, 400000, 500000, 750000, 1000000].map((preis, idx) => {
                const meinAnteil = Math.round(preis * (ergebnis.meinAnteilProzent / 100));
                const gesamtProvision = Math.round(preis * (ergebnis.provGesamt / 100));
                const istAktuellerPreis = preis === kaufpreis;
                
                return (
                  <tr 
                    key={preis} 
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${istAktuellerPreis ? 'bg-purple-50' : ''}`}
                  >
                    <td className={`py-2 px-3 ${istAktuellerPreis ? 'font-bold text-purple-700' : 'text-gray-700'}`}>
                      {formatEuro(preis)}
                      {istAktuellerPreis && <span className="ml-1">✓</span>}
                    </td>
                    <td className={`py-2 px-3 text-right font-medium ${istAktuellerPreis ? 'text-purple-700' : 'text-gray-700'}`}>
                      {formatEuro(meinAnteil)}
                    </td>
                    <td className={`py-2 px-3 text-right ${istAktuellerPreis ? 'text-purple-600' : 'text-gray-500'}`}>
                      {formatEuro(gesamtProvision)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gesetz Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚖️ Das Maklergesetz seit Dezember 2020</h3>
        <div className="space-y-3 text-sm text-amber-700">
          <p>
            Das <strong>Gesetz über die Verteilung der Maklerkosten</strong> (§§ 656a-d BGB) gilt seit 
            dem <strong>23. Dezember 2020</strong> und schützt Käufer vor überhöhten Maklerkosten:
          </p>
          
          <div className="bg-white/50 rounded-xl p-4 space-y-2">
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <div>
                <strong>50:50-Regelung:</strong> Bei Wohnungen und Einfamilienhäusern zahlt der Käufer 
                maximal die Hälfte der vereinbarten Provision.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <div>
                <strong>Verkäufer-Prinzip:</strong> Beauftragt nur der Verkäufer den Makler, muss er 
                die komplette Provision allein tragen.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <div>
                <strong>Textform erforderlich:</strong> Der Maklervertrag muss in Textform 
                (z.B. E-Mail) geschlossen werden.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">✓</span>
              <div>
                <strong>Fälligkeit:</strong> Die Provision des Käufers wird erst fällig, wenn der 
                Verkäufer seinen Anteil nachweislich gezahlt hat.
              </div>
            </div>
          </div>

          <p className="text-xs">
            <strong>Nicht betroffen:</strong> Mehrfamilienhäuser, Gewerbeimmobilien, unbebaute Grundstücke 
            und Mietobjekte (hier gilt das Bestellerprinzip).
          </p>
        </div>
      </div>

      {/* Spar-Tipps */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-3">💡 Tipps zum Sparen bei Maklerkosten</h3>
        <ul className="space-y-2 text-sm text-emerald-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Provision verhandeln:</strong> Die Maklerprovision ist nicht festgeschrieben – viele Makler geben Rabatt!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Provisionsfrei suchen:</strong> Auf ImmoScout24, Immowelt & Co. nach "provisionsfrei" filtern.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Direktkauf vom Bauträger:</strong> Bei Neubauten ist oft keine Maklerprovision fällig.</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Fragen Sie den Verkäufer:</strong> Bitten Sie um eine Verkäufer-Alleinbeauftragung – dann zahlen Sie nichts!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Maklervertrag prüfen:</strong> Achten Sie auf die genaue Provisionsvereinbarung und mögliche Klauseln.</span>
          </li>
        </ul>
      </div>

      {/* Hinweise */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-red-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-red-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Fälligkeit:</strong> Die Maklerprovision wird mit Unterzeichnung des Kaufvertrags beim Notar fällig.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>MwSt. inklusive:</strong> Alle angegebenen Provisionen verstehen sich inklusive 19% Mehrwertsteuer.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Regionale Unterschiede:</strong> In manchen Regionen sind niedrigere Provisionen üblich – informieren Sie sich lokal.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Steuerlich absetzbar:</strong> Für Vermieter sind Maklerkosten als Werbungskosten absetzbar.</span>
          </li>
        </ul>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Was macht der Makler eigentlich?</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            <strong>Immobilienmakler</strong> vermitteln zwischen Käufern und Verkäufern. Ihre Leistung 
            umfasst typischerweise:
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-800 mb-2">Für Verkäufer:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Wertermittlung der Immobilie</li>
                <li>• Erstellung von Exposé & Fotos</li>
                <li>• Vermarktung auf Portalen</li>
                <li>• Durchführung von Besichtigungen</li>
                <li>• Kaufpreisverhandlung</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-800 mb-2">Für Käufer:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Suche passender Objekte</li>
                <li>• Besichtigungstermine</li>
                <li>• Unterlagenbeschaffung</li>
                <li>• Finanzierungsberatung</li>
                <li>• Begleitung zum Notar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
{/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/bgb/__656a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 656a BGB – Textform des Maklervertrags
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/bgb/__656c.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 656c BGB – Lohnanspruch bei Tätigkeit für beide Parteien
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/bgb/__656d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 656d BGB – Vereinbarungen über die Maklerkosten
          </a>
          <a 
            href="https://www.bmj.de/DE/themen/immobilien_baurecht/maklerrecht/maklerrecht_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMJ – Neues Maklerrecht für faire Verteilung der Maklerkosten
          </a>
          <a 
            href="https://www.bundesregierung.de/breg-de/aktuelles/neue-regeln-fuer-maklerkosten-1806718"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – Neue Regeln für Maklerkosten
          </a>
        </div>
      </div>
    </div>
  );
}
