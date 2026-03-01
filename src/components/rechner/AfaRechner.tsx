import { useState, useMemo } from 'react';

// AfA-Sätze nach Baujahr gemäß §7 Abs. 4 EStG
// Quelle: https://www.gesetze-im-internet.de/estg/__7.html
interface AfaSatz {
  id: string;
  label: string;
  baujahreVon: number | null;
  baujahreBis: number | null;
  satz: number; // in Prozent
  nutzungsdauer: number; // in Jahren
  rechtsgrundlage: string;
}

const AFA_SAETZE: AfaSatz[] = [
  {
    id: 'vor1925',
    label: 'Vor 1925',
    baujahreVon: null,
    baujahreBis: 1924,
    satz: 2.5,
    nutzungsdauer: 40,
    rechtsgrundlage: '§7 Abs. 4 Satz 1 Nr. 2a EStG',
  },
  {
    id: '1925bis2022',
    label: '1925 – 2022',
    baujahreVon: 1925,
    baujahreBis: 2022,
    satz: 2,
    nutzungsdauer: 50,
    rechtsgrundlage: '§7 Abs. 4 Satz 1 Nr. 2a EStG',
  },
  {
    id: 'ab2023',
    label: 'Ab 2023',
    baujahreVon: 2023,
    baujahreBis: null,
    satz: 3,
    nutzungsdauer: 33,
    rechtsgrundlage: '§7 Abs. 4 Satz 1 Nr. 2b EStG (JStG 2022)',
  },
];

function getAfaSatzByBaujahr(baujahr: number): AfaSatz {
  if (baujahr < 1925) return AFA_SAETZE[0];
  if (baujahr >= 2023) return AFA_SAETZE[2];
  return AFA_SAETZE[1];
}

export default function AfaRechner() {
  // Eingabewerte
  const [kaufpreis, setKaufpreis] = useState(400000);
  const [grundstueckswert, setGrundstueckswert] = useState(100000);
  const [baujahr, setBaujahr] = useState(2010);
  const [anteilGrundstueck, setAnteilGrundstueck] = useState(25); // Prozent
  const [eingabeModus, setEingabeModus] = useState<'betrag' | 'prozent'>('prozent');
  const [vermietungAnteil, setVermietungAnteil] = useState(100); // Prozent der Vermietung/Nutzung

  const ergebnis = useMemo(() => {
    // AfA-Satz basierend auf Baujahr ermitteln
    const afaSatz = getAfaSatzByBaujahr(baujahr);
    
    // Gebäudewert berechnen (Kaufpreis ohne Grundstück)
    let gebaeudeAnteil: number;
    let grundstuecksAnteilBerechnet: number;
    
    if (eingabeModus === 'prozent') {
      grundstuecksAnteilBerechnet = kaufpreis * (anteilGrundstueck / 100);
      gebaeudeAnteil = kaufpreis - grundstuecksAnteilBerechnet;
    } else {
      grundstuecksAnteilBerechnet = grundstueckswert;
      gebaeudeAnteil = kaufpreis - grundstueckswert;
    }
    
    // Sicherstellen, dass Gebäudewert nicht negativ ist
    gebaeudeAnteil = Math.max(0, gebaeudeAnteil);
    
    // Bemessungsgrundlage für AfA (bei Teilvermietung anteilig)
    const bemessungsgrundlage = gebaeudeAnteil * (vermietungAnteil / 100);
    
    // Jährliche AfA berechnen
    const jaehrlicheAfa = Math.round(bemessungsgrundlage * (afaSatz.satz / 100));
    
    // Monatliche AfA
    const monatlicheAfa = jaehrlicheAfa / 12;
    
    // Dauer der Abschreibung
    const abschreibungsDauer = afaSatz.nutzungsdauer;
    const verbleibendeJahre = abschreibungsDauer; // Bei Neukauf volle Dauer
    
    // Steuerersparnis (Annahme: Grenzsteuersatz 42%)
    const angenommenerSteuersatz = 42;
    const jaehrlicheSteuerersparnis = Math.round(jaehrlicheAfa * (angenommenerSteuersatz / 100));
    const gesamtSteuerersparnis = jaehrlicheSteuerersparnis * abschreibungsDauer;
    
    // Gesamt-AfA über die Nutzungsdauer
    const gesamtAfa = jaehrlicheAfa * abschreibungsDauer;
    
    return {
      afaSatz,
      kaufpreis,
      grundstuecksAnteil: grundstuecksAnteilBerechnet,
      gebaeudeAnteil,
      bemessungsgrundlage,
      jaehrlicheAfa,
      monatlicheAfa,
      abschreibungsDauer,
      verbleibendeJahre,
      jaehrlicheSteuerersparnis,
      gesamtSteuerersparnis,
      gesamtAfa,
      angenommenerSteuersatz,
      vermietungAnteil,
    };
  }, [kaufpreis, grundstueckswert, baujahr, anteilGrundstueck, eingabeModus, vermietungAnteil]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuroExakt = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' %';

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Kaufpreis */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kaufpreis der Immobilie (inkl. Grundstück)</span>
            <span className="text-xs text-gray-500 block mt-1">Gesamtkaufpreis wie im Kaufvertrag</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kaufpreis}
              onChange={(e) => setKaufpreis(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(kaufpreis, 2000000)}
            onChange={(e) => setKaufpreis(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
            min="50000"
            max="2000000"
            step="10000"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50.000 €</span>
            <span>1 Mio €</span>
            <span>2 Mio €</span>
          </div>
        </div>

        {/* Baujahr */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Baujahr des Gebäudes</span>
            <span className="text-xs text-gray-500 block mt-1">Bestimmt den AfA-Satz (2%, 2,5% oder 3%)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={baujahr}
              onChange={(e) => setBaujahr(Math.max(1800, Math.min(currentYear + 5, Number(e.target.value))))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="1800"
              max={currentYear + 5}
            />
          </div>
          <input
            type="range"
            value={baujahr}
            onChange={(e) => setBaujahr(Number(e.target.value))}
            className="w-full mt-3 accent-blue-500"
            min="1900"
            max={currentYear + 2}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1900</span>
            <span>1960</span>
            <span>2000</span>
            <span>{currentYear}</span>
          </div>
          
          {/* AfA-Satz Info */}
          <div className={`mt-4 p-4 rounded-xl border ${
            ergebnis.afaSatz.satz === 3 ? 'bg-green-50 border-green-200' :
            ergebnis.afaSatz.satz === 2.5 ? 'bg-amber-50 border-amber-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <p className={`font-medium ${
                  ergebnis.afaSatz.satz === 3 ? 'text-green-800' :
                  ergebnis.afaSatz.satz === 2.5 ? 'text-amber-800' :
                  'text-blue-800'
                }`}>
                  AfA-Satz: {formatProzent(ergebnis.afaSatz.satz)}
                </p>
                <p className={`text-sm ${
                  ergebnis.afaSatz.satz === 3 ? 'text-green-600' :
                  ergebnis.afaSatz.satz === 2.5 ? 'text-amber-600' :
                  'text-blue-600'
                }`}>
                  Baujahr {ergebnis.afaSatz.label} • Nutzungsdauer {ergebnis.afaSatz.nutzungsdauer} Jahre
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grundstücksanteil */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-gray-700 font-medium">Grundstücksanteil (nicht abschreibbar)</label>
            <div className="flex gap-2">
              <button
                onClick={() => setEingabeModus('prozent')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  eingabeModus === 'prozent'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Prozent
              </button>
              <button
                onClick={() => setEingabeModus('betrag')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  eingabeModus === 'betrag'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Betrag
              </button>
            </div>
          </div>
          
          {eingabeModus === 'prozent' ? (
            <>
              <div className="relative">
                <input
                  type="number"
                  value={anteilGrundstueck}
                  onChange={(e) => setAnteilGrundstueck(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                  max="100"
                  step="1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">%</span>
              </div>
              <input
                type="range"
                value={anteilGrundstueck}
                onChange={(e) => setAnteilGrundstueck(Number(e.target.value))}
                className="w-full mt-3 accent-blue-500"
                min="0"
                max="50"
                step="1"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>15%</span>
                <span>25%</span>
                <span>40%</span>
                <span>50%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Üblich: 15-30% bei Einfamilienhäusern, 5-15% bei Eigentumswohnungen
              </p>
            </>
          ) : (
            <>
              <div className="relative">
                <input
                  type="number"
                  value={grundstueckswert}
                  onChange={(e) => setGrundstueckswert(Math.max(0, Math.min(kaufpreis, Number(e.target.value))))}
                  className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                  max={kaufpreis}
                  step="5000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tipp: Bodenrichtwert × Grundstücksgröße = Grundstückswert
              </p>
            </>
          )}
        </div>

        {/* Vermietungsanteil */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Vermietungs- / Nutzungsanteil</span>
            <span className="text-xs text-gray-500 block mt-1">AfA gilt nur für den vermieteten Teil</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {[100, 50, 33, 25].map(prozent => (
              <button
                key={prozent}
                onClick={() => setVermietungAnteil(prozent)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  vermietungAnteil === prozent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {prozent}%
              </button>
            ))}
            <input
              type="number"
              value={vermietungAnteil}
              onChange={(e) => setVermietungAnteil(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-20 py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none text-center"
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="rounded-2xl shadow-lg p-6 text-white mb-6 bg-gradient-to-br from-indigo-500 to-purple-600">
        <h3 className="text-sm font-medium opacity-80 mb-1">📉 Jährliche AfA</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.jaehrlicheAfa)}</span>
          </div>
          <p className="text-white/80 mt-2 text-sm">
            Das sind <strong>{formatEuroExakt(ergebnis.monatlicheAfa)}</strong> monatlich
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">AfA-Satz</span>
            <div className="text-xl font-bold">{formatProzent(ergebnis.afaSatz.satz)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Abschreibungsdauer</span>
            <div className="text-xl font-bold">{ergebnis.abschreibungsDauer} Jahre</div>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Kaufpreis gesamt</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.kaufpreis)}</span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <div>
              <span className="text-gray-600">– Grundstücksanteil</span>
              <span className="text-xs text-gray-400 block">nicht abschreibbar</span>
            </div>
            <span className="font-bold text-red-600">– {formatEuro(ergebnis.grundstuecksAnteil)}</span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <div>
              <span className="text-gray-800 font-medium">= Gebäudewert</span>
              <span className="text-xs text-gray-400 block">Basis für AfA</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">{formatEuro(ergebnis.gebaeudeAnteil)}</span>
          </div>
          
          {ergebnis.vermietungAnteil < 100 && (
            <div className="flex justify-between py-3 border-b border-gray-100">
              <div>
                <span className="text-gray-600">× Vermietungsanteil</span>
                <span className="text-xs text-gray-400 block">{ergebnis.vermietungAnteil}% werden vermietet</span>
              </div>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.bemessungsgrundlage)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-3 border-b border-gray-100">
            <div>
              <span className="text-gray-600">× AfA-Satz</span>
              <span className="text-xs text-gray-400 block">{ergebnis.afaSatz.rechtsgrundlage}</span>
            </div>
            <span className="font-bold text-gray-900">{formatProzent(ergebnis.afaSatz.satz)}</span>
          </div>
          
          <div className="flex justify-between py-4 bg-indigo-50 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-indigo-800 text-lg">= Jährliche AfA</span>
            <span className="font-bold text-2xl text-indigo-900">{formatEuro(ergebnis.jaehrlicheAfa)}</span>
          </div>
        </div>
      </div>

      {/* Steuerersparnis */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-green-800 mb-4">💰 Steuerersparnis durch AfA</h3>
        
        <div className="space-y-3 text-sm">
          <p className="text-green-700 mb-4">
            Die AfA mindert Ihre zu versteuernden Einkünfte aus Vermietung und Verpachtung.
            Bei einem angenommenen Grenzsteuersatz von <strong>{ergebnis.angenommenerSteuersatz}%</strong>:
          </p>
          
          <div className="bg-white rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Jährliche Steuerersparnis</span>
              <span className="font-bold text-green-700">{formatEuro(ergebnis.jaehrlicheSteuerersparnis)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gesamt über {ergebnis.abschreibungsDauer} Jahre</span>
              <span className="font-bold text-green-700">{formatEuro(ergebnis.gesamtSteuerersparnis)}</span>
            </div>
          </div>
          
          <p className="text-xs text-green-600 mt-3">
            Hinweis: Die tatsächliche Steuerersparnis hängt von Ihrem persönlichen Steuersatz ab.
          </p>
        </div>
      </div>

      {/* AfA-Sätze Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 AfA-Sätze für Gebäude im Überblick</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Baujahr</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">AfA-Satz</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Nutzungsdauer</th>
              </tr>
            </thead>
            <tbody>
              {AFA_SAETZE.map((satz, idx) => (
                <tr 
                  key={satz.id}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                    satz.id === ergebnis.afaSatz.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <td className={`py-3 px-4 ${satz.id === ergebnis.afaSatz.id ? 'font-bold text-indigo-700' : 'text-gray-700'}`}>
                    {satz.label}
                    {satz.id === ergebnis.afaSatz.id && <span className="ml-2">✓</span>}
                  </td>
                  <td className={`py-3 px-4 text-center ${satz.id === ergebnis.afaSatz.id ? 'font-bold text-indigo-700' : ''}`}>
                    {formatProzent(satz.satz)}
                  </td>
                  <td className={`py-3 px-4 text-center ${satz.id === ergebnis.afaSatz.id ? 'font-bold text-indigo-700' : 'text-gray-600'}`}>
                    {satz.nutzungsdauer} Jahre
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          <strong>Neu seit 2023:</strong> Für Gebäude mit Bauantrag ab 01.01.2023 gilt der erhöhte AfA-Satz von 3% 
          (Jahressteuergesetz 2022).
        </p>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Was ist die Gebäude-AfA?</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            <strong>AfA</strong> steht für <strong>Absetzung für Abnutzung</strong> und bezeichnet die 
            steuerliche Abschreibung von Wirtschaftsgütern. Bei vermieteten Immobilien können Sie 
            den Gebäudewert über die Nutzungsdauer abschreiben.
          </p>
          
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">⚠️ Wichtig: Nur der Gebäudewert!</h4>
            <p className="text-amber-700">
              Der <strong>Grundstückswert</strong> ist <strong>nicht</strong> abschreibbar, da Grund und Boden 
              keinem Wertverzehr unterliegen. Nur der reine Gebäudewert (Kaufpreis minus Grundstücksanteil) 
              ist AfA-fähig.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-800 mb-2">Voraussetzungen für die Gebäude-AfA:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Vermietung zur Erzielung von Einkünften</li>
              <li>• Eigentum am Gebäude (bei Mietwohnungen: nur Vermieter)</li>
              <li>• Gebäude muss betriebsbereit sein</li>
              <li>• Keine Selbstnutzung (anteilig bei Teilvermietung)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grundstücksanteil ermitteln */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🔍 So ermitteln Sie den Grundstücksanteil</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            Das Finanzamt akzeptiert verschiedene Methoden zur Aufteilung des Kaufpreises:
          </p>
          
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-1">1. Kaufvertrag</h4>
              <p className="text-blue-700 text-sm">
                Wenn im Kaufvertrag eine Aufteilung vorgenommen wurde, ist diese maßgeblich.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-1">2. Bodenrichtwert-Methode</h4>
              <p className="text-blue-700 text-sm">
                Grundstückswert = Bodenrichtwert × Grundstücksfläche. 
                <a href="https://www.bodenrichtwerte-boris.de" target="_blank" rel="noopener noreferrer" className="underline"> Bodenrichtwerte abrufen</a>
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-1">3. Sachwertverfahren</h4>
              <p className="text-blue-700 text-sm">
                Gebäudewert aus Normalherstellungskosten + Alterswertminderung ermitteln.
              </p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            <strong>Tipp:</strong> Bei Eigentumswohnungen liegt der Grundstücksanteil oft nur bei 5-15%, 
            bei Einfamilienhäusern typischerweise bei 15-30%.
          </p>
        </div>
      </div>

      {/* Sonder-AfA */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-green-800 mb-3">✨ Sonderabschreibungen (Bonus-AfA)</h3>
        <div className="space-y-3 text-sm text-green-700">
          <p>
            Neben der linearen AfA gibt es Sonder-Abschreibungsmöglichkeiten:
          </p>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <span>
                <strong>§7b EStG – Mietwohnungsneubau:</strong> 5% Sonder-AfA für 4 Jahre bei 
                Bauantrag zwischen 2023-2027 und Baukosten max. 5.200 €/m² (Deckel: 4.000 €/m²)
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                <strong>Denkmalschutz-AfA (§7i EStG):</strong> Erhöhte AfA für denkmalgeschützte Gebäude 
                (8 Jahre je 9%, dann 4 Jahre je 7%)
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                <strong>Sanierungsgebiet-AfA (§7h EStG):</strong> Erhöhte AfA für Modernisierung 
                in Sanierungsgebieten
              </span>
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
            <span>Die AfA beginnt mit der Anschaffung oder Fertigstellung des Gebäudes</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Im Jahr der Anschaffung nur anteilige AfA (ab dem Monat des Kaufs)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Bei Verkauf endet die AfA im Monat des Eigentumsübergangs</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Selbstgenutzte Immobilien: Keine AfA möglich!</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Die AfA muss zwingend in Anspruch genommen werden (keine Wahlfreiheit)</span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__7.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §7 EStG – Absetzung für Abnutzung
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__7b.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §7b EStG – Sonderabschreibung Mietwohnungsneubau
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesfinanzministerium – AfA-Tabellen
          </a>
          <a 
            href="https://www.bodenrichtwerte-boris.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BORIS – Bodenrichtwerte
          </a>
        </div>
      </div>
    </div>
  );
}
