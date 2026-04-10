import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// SF-Klassen mit Beitragssätzen (prozentual zum Grundbeitrag)
// Durchschnittswerte basierend auf GDV-Empfehlungen
const SF_KLASSEN: Record<string, { name: string; beitragssatz: number; beschreibung: string }> = {
  'SF0': { name: 'SF 0', beitragssatz: 230, beschreibung: 'Fahranfänger (0 Jahre)' },
  'SF½': { name: 'SF ½', beitragssatz: 140, beschreibung: 'Nach 6 Monaten unfallfrei' },
  'SF1': { name: 'SF 1', beitragssatz: 100, beschreibung: '1 Jahr unfallfrei' },
  'SF2': { name: 'SF 2', beitragssatz: 85, beschreibung: '2 Jahre unfallfrei' },
  'SF3': { name: 'SF 3', beitragssatz: 70, beschreibung: '3 Jahre unfallfrei' },
  'SF4': { name: 'SF 4', beitragssatz: 60, beschreibung: '4 Jahre unfallfrei' },
  'SF5': { name: 'SF 5', beitragssatz: 55, beschreibung: '5 Jahre unfallfrei' },
  'SF6': { name: 'SF 6', beitragssatz: 50, beschreibung: '6 Jahre unfallfrei' },
  'SF7': { name: 'SF 7', beitragssatz: 45, beschreibung: '7 Jahre unfallfrei' },
  'SF8': { name: 'SF 8', beitragssatz: 40, beschreibung: '8 Jahre unfallfrei' },
  'SF9': { name: 'SF 9', beitragssatz: 37, beschreibung: '9 Jahre unfallfrei' },
  'SF10': { name: 'SF 10', beitragssatz: 35, beschreibung: '10 Jahre unfallfrei' },
  'SF11': { name: 'SF 11', beitragssatz: 33, beschreibung: '11 Jahre unfallfrei' },
  'SF12': { name: 'SF 12', beitragssatz: 32, beschreibung: '12 Jahre unfallfrei' },
  'SF13': { name: 'SF 13', beitragssatz: 31, beschreibung: '13 Jahre unfallfrei' },
  'SF14': { name: 'SF 14', beitragssatz: 30, beschreibung: '14 Jahre unfallfrei' },
  'SF15': { name: 'SF 15', beitragssatz: 29, beschreibung: '15 Jahre unfallfrei' },
  'SF16': { name: 'SF 16', beitragssatz: 28, beschreibung: '16 Jahre unfallfrei' },
  'SF17': { name: 'SF 17', beitragssatz: 27, beschreibung: '17 Jahre unfallfrei' },
  'SF18': { name: 'SF 18', beitragssatz: 27, beschreibung: '18 Jahre unfallfrei' },
  'SF19': { name: 'SF 19', beitragssatz: 26, beschreibung: '19 Jahre unfallfrei' },
  'SF20': { name: 'SF 20', beitragssatz: 26, beschreibung: '20 Jahre unfallfrei' },
  'SF21': { name: 'SF 21', beitragssatz: 25, beschreibung: '21 Jahre unfallfrei' },
  'SF22': { name: 'SF 22', beitragssatz: 25, beschreibung: '22 Jahre unfallfrei' },
  'SF23': { name: 'SF 23', beitragssatz: 24, beschreibung: '23 Jahre unfallfrei' },
  'SF24': { name: 'SF 24', beitragssatz: 24, beschreibung: '24 Jahre unfallfrei' },
  'SF25': { name: 'SF 25', beitragssatz: 23, beschreibung: '25 Jahre unfallfrei' },
  'SF26': { name: 'SF 26', beitragssatz: 23, beschreibung: '26 Jahre unfallfrei' },
  'SF27': { name: 'SF 27', beitragssatz: 23, beschreibung: '27 Jahre unfallfrei' },
  'SF28': { name: 'SF 28', beitragssatz: 23, beschreibung: '28 Jahre unfallfrei' },
  'SF29': { name: 'SF 29', beitragssatz: 22, beschreibung: '29 Jahre unfallfrei' },
  'SF30': { name: 'SF 30', beitragssatz: 22, beschreibung: '30 Jahre unfallfrei' },
  'SF31': { name: 'SF 31', beitragssatz: 22, beschreibung: '31 Jahre unfallfrei' },
  'SF32': { name: 'SF 32', beitragssatz: 22, beschreibung: '32 Jahre unfallfrei' },
  'SF33': { name: 'SF 33', beitragssatz: 21, beschreibung: '33 Jahre unfallfrei' },
  'SF34': { name: 'SF 34', beitragssatz: 21, beschreibung: '34 Jahre unfallfrei' },
  'SF35': { name: 'SF 35', beitragssatz: 20, beschreibung: '35+ Jahre unfallfrei' },
  'M': { name: 'M (Malusklasse)', beitragssatz: 260, beschreibung: 'Nach Schaden/Unfall' },
  'S': { name: 'S (Sonderklasse)', beitragssatz: 200, beschreibung: 'Sonderklasse' },
};

// Durchschnittliche Typklassenzuschläge (10 = Durchschnitt = 100%)
// Haftpflicht: 10-25, Teilkasko: 10-33, Vollkasko: 10-34
const TYPKLASSE_FAKTOR = {
  haftpflicht: (tk: number) => 0.7 + (tk - 10) * 0.03, // 10 = 100%, jede Klasse ±3%
  teilkasko: (tk: number) => 0.6 + (tk - 10) * 0.04,
  vollkasko: (tk: number) => 0.65 + (tk - 10) * 0.035,
};

// Regionalklassen-Faktor (Durchschnitt 6-8 für verschiedene Versicherungsarten)
const REGIONALKLASSE_FAKTOR = {
  haftpflicht: (rk: number) => 0.85 + (rk - 1) * 0.025, // 1-12, RK1 günstig, RK12 teuer
  teilkasko: (rk: number) => 0.8 + (rk - 1) * 0.03,     // 1-16
  vollkasko: (rk: number) => 0.85 + (rk - 1) * 0.02,    // 1-9
};

// Durchschnittliche Grundbeiträge (Basis für Schätzung)
const GRUNDBEITRAG = {
  haftpflicht: 450,  // Durchschnitt für Mittelklasse
  teilkasko: 120,
  vollkasko: 380,
};

type Versicherungsart = 'haftpflicht' | 'teilkasko' | 'vollkasko';

export default function KfzVersicherungRechner() {
  const [sfKlasse, setSfKlasse] = useState('SF10');
  const [typklasseHP, setTypklasseHP] = useState(15);
  const [typklasseTK, setTypklasseTK] = useState(18);
  const [typklasseVK, setTypklasseVK] = useState(18);
  const [regionalklasseHP, setRegionalklasseHP] = useState(6);
  const [regionalklasseTK, setRegionalklasseTK] = useState(6);
  const [regionalklasseVK, setRegionalklasseVK] = useState(4);
  const [selbstbeteiligungTK, setSelbstbeteiligungTK] = useState(150);
  const [selbstbeteiligungVK, setSelbstbeteiligungVK] = useState(500);
  const [versicherungsart, setVersicherungsart] = useState<'haftpflicht' | 'teilkasko' | 'vollkasko'>('vollkasko');

  const ergebnis = useMemo(() => {
    const sfData = SF_KLASSEN[sfKlasse];
    const sfFaktor = sfData.beitragssatz / 100;

    // Haftpflicht berechnen
    const hpTypFaktor = TYPKLASSE_FAKTOR.haftpflicht(typklasseHP);
    const hpRegFaktor = REGIONALKLASSE_FAKTOR.haftpflicht(regionalklasseHP);
    const haftpflicht = Math.round(GRUNDBEITRAG.haftpflicht * sfFaktor * hpTypFaktor * hpRegFaktor);

    // Teilkasko berechnen (SF-Klasse hat keinen Einfluss!)
    const tkTypFaktor = TYPKLASSE_FAKTOR.teilkasko(typklasseTK);
    const tkRegFaktor = REGIONALKLASSE_FAKTOR.teilkasko(regionalklasseTK);
    const sbFaktorTK = selbstbeteiligungTK === 0 ? 1.15 : selbstbeteiligungTK === 150 ? 1.0 : 0.9;
    const teilkasko = Math.round(GRUNDBEITRAG.teilkasko * tkTypFaktor * tkRegFaktor * sbFaktorTK);

    // Vollkasko berechnen
    const vkTypFaktor = TYPKLASSE_FAKTOR.vollkasko(typklasseVK);
    const vkRegFaktor = REGIONALKLASSE_FAKTOR.vollkasko(regionalklasseVK);
    const sbFaktorVK = selbstbeteiligungVK === 150 ? 1.2 : selbstbeteiligungVK === 300 ? 1.1 : selbstbeteiligungVK === 500 ? 1.0 : 0.85;
    const vollkasko = Math.round(GRUNDBEITRAG.vollkasko * sfFaktor * vkTypFaktor * vkRegFaktor * sbFaktorVK);

    let gesamt = haftpflicht;
    if (versicherungsart === 'teilkasko') {
      gesamt = haftpflicht + teilkasko;
    } else if (versicherungsart === 'vollkasko') {
      gesamt = haftpflicht + vollkasko; // Vollkasko enthält bereits Teilkasko
    }

    return {
      haftpflicht,
      teilkasko,
      vollkasko,
      gesamt,
      monatlich: Math.round(gesamt / 12),
      sfFaktor: sfData.beitragssatz,
      sfBeschreibung: sfData.beschreibung,
    };
  }, [sfKlasse, typklasseHP, typklasseTK, typklasseVK, regionalklasseHP, regionalklasseTK, regionalklasseVK, selbstbeteiligungTK, selbstbeteiligungVK, versicherungsart]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Kfz-Versicherung-Rechner" rechnerSlug="versicherung-auto-rechner" />

{/* Wichtiger Hinweis */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <div className="flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800">Hinweis: Vereinfachte Schätzung</p>
            <p className="text-sm text-amber-700 mt-1">
              Diese Berechnung dient zur <strong>Orientierung</strong>. Der tatsächliche Beitrag hängt von vielen 
              weiteren Faktoren ab (Alter, Fahrerkreis, Stellplatz, Kilometerleistung, Zahlweise etc.). 
              Für <strong>verbindliche Angebote</strong> nutzen Sie bitte Vergleichsportale wie Check24, Verivox oder HUK24.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Versicherungsart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Versicherungsart</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'haftpflicht', label: 'Haftpflicht', icon: '📋' },
              { value: 'teilkasko', label: 'Teilkasko', icon: '🛡️' },
              { value: 'vollkasko', label: 'Vollkasko', icon: '🛡️🛡️' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setVersicherungsart(opt.value as typeof versicherungsart)}
                className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                  versicherungsart === opt.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {versicherungsart === 'haftpflicht' && '✓ Nur Haftpflicht (gesetzlich vorgeschrieben)'}
            {versicherungsart === 'teilkasko' && '✓ Haftpflicht + Teilkasko (Diebstahl, Glasbruch, Wildunfall...)'}
            {versicherungsart === 'vollkasko' && '✓ Haftpflicht + Vollkasko inkl. Teilkasko (auch selbstverschuldete Schäden)'}
          </p>
        </div>

        {/* SF-Klasse */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Schadenfreiheitsklasse (SF-Klasse)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jahre ohne selbstverschuldeten Unfall
            </span>
          </label>
          <select
            value={sfKlasse}
            onChange={(e) => setSfKlasse(e.target.value)}
            className="w-full text-lg font-medium py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
          >
            <optgroup label="Schadenfreiheitsklassen">
              {Object.entries(SF_KLASSEN).filter(([key]) => key.startsWith('SF')).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.name} ({data.beitragssatz}%) – {data.beschreibung}
                </option>
              ))}
            </optgroup>
            <optgroup label="Sonderklassen">
              <option value="M">M (260%) – Nach Schaden/Unfall</option>
              <option value="S">S (200%) – Sonderklasse</option>
            </optgroup>
          </select>
          <div className="mt-2 bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <strong>Ihr Beitragssatz:</strong> {ergebnis.sfFaktor}% vom Grundbeitrag
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${ergebnis.sfFaktor <= 50 ? 'bg-green-500' : ergebnis.sfFaktor <= 100 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(ergebnis.sfFaktor / 2.6 * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              20% (SF35 beste) ← → 260% (M schlechteste)
            </p>
          </div>
        </div>

        {/* Typklassen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Typklasse Haftpflicht</span>
            <span className="text-xs text-gray-500 block mt-1">
              Abhängig vom Fahrzeugmodell (10-25)
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={typklasseHP}
              onChange={(e) => setTypklasseHP(Number(e.target.value))}
              className="flex-1 accent-orange-500"
              min="10"
              max="25"
              step="1"
            />
            <span className="text-xl font-bold text-orange-600 w-12 text-center">{typklasseHP}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10 (günstig)</span>
            <span>18 (Ø)</span>
            <span>25 (teuer)</span>
          </div>
        </div>

        {versicherungsart !== 'haftpflicht' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">
                Typklasse {versicherungsart === 'teilkasko' ? 'Teilkasko' : 'Vollkasko'}
              </span>
              <span className="text-xs text-gray-500 block mt-1">
                Abhängig vom Fahrzeugmodell ({versicherungsart === 'teilkasko' ? '10-33' : '10-34'})
              </span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={versicherungsart === 'teilkasko' ? typklasseTK : typklasseVK}
                onChange={(e) => versicherungsart === 'teilkasko' 
                  ? setTypklasseTK(Number(e.target.value)) 
                  : setTypklasseVK(Number(e.target.value))
                }
                className="flex-1 accent-orange-500"
                min="10"
                max={versicherungsart === 'teilkasko' ? 33 : 34}
                step="1"
              />
              <span className="text-xl font-bold text-orange-600 w-12 text-center">
                {versicherungsart === 'teilkasko' ? typklasseTK : typklasseVK}
              </span>
            </div>
          </div>
        )}

        {/* Regionalklassen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Regionalklasse Haftpflicht</span>
            <span className="text-xs text-gray-500 block mt-1">
              Abhängig von Ihrem Zulassungsbezirk (1-12)
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={regionalklasseHP}
              onChange={(e) => setRegionalklasseHP(Number(e.target.value))}
              className="flex-1 accent-orange-500"
              min="1"
              max="12"
              step="1"
            />
            <span className="text-xl font-bold text-orange-600 w-12 text-center">{regionalklasseHP}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 (günstig)</span>
            <span>6 (Ø)</span>
            <span>12 (teuer)</span>
          </div>
        </div>

        {versicherungsart !== 'haftpflicht' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">
                Regionalklasse {versicherungsart === 'teilkasko' ? 'Teilkasko' : 'Vollkasko'}
              </span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={versicherungsart === 'teilkasko' ? regionalklasseTK : regionalklasseVK}
                onChange={(e) => versicherungsart === 'teilkasko' 
                  ? setRegionalklasseTK(Number(e.target.value)) 
                  : setRegionalklasseVK(Number(e.target.value))
                }
                className="flex-1 accent-orange-500"
                min="1"
                max={versicherungsart === 'teilkasko' ? 16 : 9}
                step="1"
              />
              <span className="text-xl font-bold text-orange-600 w-12 text-center">
                {versicherungsart === 'teilkasko' ? regionalklasseTK : regionalklasseVK}
              </span>
            </div>
          </div>
        )}

        {/* Selbstbeteiligung */}
        {versicherungsart !== 'haftpflicht' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">
                Selbstbeteiligung {versicherungsart === 'teilkasko' ? 'Teilkasko' : 'Vollkasko'}
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(versicherungsart === 'teilkasko' 
                ? [0, 150, 300] 
                : [150, 300, 500, 1000]
              ).map((sb) => (
                <button
                  key={sb}
                  onClick={() => versicherungsart === 'teilkasko' 
                    ? setSelbstbeteiligungTK(sb) 
                    : setSelbstbeteiligungVK(sb)
                  }
                  className={`py-2 px-2 rounded-xl text-sm font-medium transition-all ${
                    (versicherungsart === 'teilkasko' ? selbstbeteiligungTK : selbstbeteiligungVK) === sb
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sb === 0 ? 'Keine' : `${sb} €`}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Höhere Selbstbeteiligung = niedrigerer Beitrag
            </p>
          </div>
        )}

        {/* Beispielfahrzeuge */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Typische Fahrzeuge (Schnellauswahl)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setTypklasseHP(12); setTypklasseTK(14); setTypklasseVK(14); }}
              className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
              🚗 Kleinwagen (VW Polo, Ford Fiesta)
            </button>
            <button
              onClick={() => { setTypklasseHP(15); setTypklasseTK(17); setTypklasseVK(17); }}
              className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
              🚙 Kompakt (VW Golf, Audi A3)
            </button>
            <button
              onClick={() => { setTypklasseHP(17); setTypklasseTK(19); setTypklasseVK(20); }}
              className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
              🚐 Mittelklasse (BMW 3er, Mercedes C)
            </button>
            <button
              onClick={() => { setTypklasseHP(20); setTypklasseTK(24); setTypklasseVK(25); }}
              className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
              🏎️ SUV/Oberklasse (BMW X3, Audi Q5)
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">🛡️ Geschätzter Jahresbeitrag</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">~{formatEuro(ergebnis.gesamt)}</span>
            <span className="text-xl opacity-80">pro Jahr</span>
          </div>
          <p className="text-orange-100 mt-2 text-sm">
            Das sind ca. <strong>{formatEuro(ergebnis.monatlich)}</strong> pro Monat
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Haftpflicht</span>
            <div className="text-xl font-bold">~{formatEuro(ergebnis.haftpflicht)}</div>
          </div>
          {versicherungsart === 'teilkasko' && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">+ Teilkasko</span>
              <div className="text-xl font-bold">~{formatEuro(ergebnis.teilkasko)}</div>
            </div>
          )}
          {versicherungsart === 'vollkasko' && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">+ Vollkasko</span>
              <div className="text-xl font-bold">~{formatEuro(ergebnis.vollkasko)}</div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/20 text-sm text-orange-100">
          <p className="flex items-center gap-2">
            <span>📊</span>
            <span>SF-Klasse {sfKlasse}: {ergebnis.sfFaktor}% Beitragssatz</span>
          </p>
        </div>
      </div>
{/* Vergleichsportale */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">🔍 Für exakte Tarife: Vergleichen Sie!</h3>
        <p className="text-sm text-blue-700 mb-4">
          Unser Rechner gibt eine <strong>grobe Schätzung</strong>. Die tatsächlichen Preise variieren stark 
          je nach Versicherer, Alter, Beruf, Stellplatz und weiteren Faktoren. Nutzen Sie Vergleichsportale:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a 
            href="https://www.check24.de/kfz-versicherung/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="py-3 px-4 bg-white rounded-xl text-center hover:shadow-md transition-shadow"
          >
            <span className="block text-lg mb-1">✓</span>
            <span className="text-sm font-medium text-gray-800">Check24</span>
          </a>
          <a 
            href="https://www.verivox.de/kfz-versicherung/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="py-3 px-4 bg-white rounded-xl text-center hover:shadow-md transition-shadow"
          >
            <span className="block text-lg mb-1">✓</span>
            <span className="text-sm font-medium text-gray-800">Verivox</span>
          </a>
          <a 
            href="https://www.huk24.de/kfz-versicherung" 
            target="_blank" 
            rel="noopener noreferrer"
            className="py-3 px-4 bg-white rounded-xl text-center hover:shadow-md transition-shadow"
          >
            <span className="block text-lg mb-1">✓</span>
            <span className="text-sm font-medium text-gray-800">HUK24</span>
          </a>
          <a 
            href="https://www.financescout24.de/kfz-versicherung" 
            target="_blank" 
            rel="noopener noreferrer"
            className="py-3 px-4 bg-white rounded-xl text-center hover:shadow-md transition-shadow"
          >
            <span className="block text-lg mb-1">✓</span>
            <span className="text-sm font-medium text-gray-800">FinanceScout</span>
          </a>
        </div>
      </div>

      {/* SF-Klassen Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📊 SF-Klassen-Tabelle (Auszug)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Die SF-Klasse (Schadenfreiheitsklasse) bestimmt maßgeblich Ihren Beitrag:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 rounded-tl-lg">SF-Klasse</th>
                <th className="text-right py-2 px-3">Jahre unfallfrei</th>
                <th className="text-right py-2 px-3 rounded-tr-lg">Beitragssatz</th>
              </tr>
            </thead>
            <tbody>
              {['M', 'SF0', 'SF1', 'SF3', 'SF5', 'SF10', 'SF15', 'SF20', 'SF25', 'SF35'].map((key, idx, arr) => (
                <tr key={key} className={`border-b border-gray-100 ${key === sfKlasse ? 'bg-orange-50' : ''}`}>
                  <td className={`py-2 px-3 ${idx === arr.length - 1 ? 'rounded-bl-lg' : ''}`}>
                    {SF_KLASSEN[key].name}
                    {key === sfKlasse && <span className="ml-2 text-orange-500">← Sie</span>}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-600">
                    {key === 'M' ? 'Nach Unfall' : key === 'SF0' ? '0' : key.replace('SF', '')}
                  </td>
                  <td className={`py-2 px-3 text-right font-medium ${idx === arr.length - 1 ? 'rounded-br-lg' : ''} ${
                    SF_KLASSEN[key].beitragssatz <= 30 ? 'text-green-600' : 
                    SF_KLASSEN[key].beitragssatz <= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {SF_KLASSEN[key].beitragssatz}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          💡 Pro Jahr ohne Schaden steigen Sie eine SF-Klasse auf. Nach einem Unfall werden Sie zurückgestuft.
        </p>
      </div>

      {/* Typklasse erklärt */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🚗 Was ist die Typklasse?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Die <strong>Typklasse</strong> wird jährlich vom GDV (Gesamtverband der Deutschen 
            Versicherungswirtschaft) anhand der Schadenstatistik jedes Fahrzeugmodells berechnet.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Haftpflicht:</strong> Klasse 10-25 (basiert auf verursachten Schäden)</li>
            <li><strong>Teilkasko:</strong> Klasse 10-33 (Diebstahl, Glasbruch, etc.)</li>
            <li><strong>Vollkasko:</strong> Klasse 10-34 (inkl. selbstverschuldete Schäden)</li>
          </ul>
          <p>
            <strong>Beispiele 2024:</strong> VW Golf (HP 14, TK 18, VK 17), Tesla Model 3 (HP 18, TK 24, VK 23), 
            Porsche 911 (HP 24, TK 29, VK 31)
          </p>
        </div>
        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-700">
            📋 <strong>Typklasse Ihres Autos finden:</strong>{' '}
            <a 
              href="https://www.gdv.de/gdv/themen/versichern/typklassen" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-orange-900"
            >
              GDV Typklassenverzeichnis →
            </a>
          </p>
        </div>
      </div>

      {/* Regionalklasse erklärt */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📍 Was ist die Regionalklasse?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Die <strong>Regionalklasse</strong> richtet sich nach dem Zulassungsbezirk (Landkreis/Stadt). 
            Sie basiert auf der Schadenstatistik der Region:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Haftpflicht:</strong> 12 Klassen – hohe Unfallzahlen = hohe Klasse</li>
            <li><strong>Teilkasko:</strong> 16 Klassen – viele Wildunfälle/Diebstähle = teuer</li>
            <li><strong>Vollkasko:</strong> 9 Klassen – Vandalismus, Unfälle etc.</li>
          </ul>
          <p>
            <strong>Günstige Regionen:</strong> Ländliche Gebiete (z.B. Emsland, Elbe-Elster)<br />
            <strong>Teure Regionen:</strong> Großstädte (z.B. Berlin, Offenbach, Duisburg)
          </p>
        </div>
        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-700">
            📋 <strong>Regionalklasse Ihres Wohnorts:</strong>{' '}
            <a 
              href="https://www.gdv.de/gdv/themen/versichern/regionalklassen" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-orange-900"
            >
              GDV Regionalklassen-Abfrage →
            </a>
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Weitere Einflussfaktoren</h3>
        <p className="text-sm text-gray-600 mb-4">
          Neben SF-, Typ- und Regionalklasse beeinflussen viele weitere Faktoren Ihren Beitrag:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '👤', title: 'Alter & Führerschein', text: 'Junge Fahrer (unter 25) zahlen mehr' },
            { icon: '👨‍👩‍👧', title: 'Fahrerkreis', text: 'Nur Sie oder auch Familie/alle?' },
            { icon: '📍', title: 'Stellplatz', text: 'Garage günstiger als Straße' },
            { icon: '🛣️', title: 'Jahresfahrleistung', text: 'Wenig km = weniger Risiko' },
            { icon: '💳', title: 'Zahlweise', text: 'Jährlich zahlen spart ~5%' },
            { icon: '💼', title: 'Beruf', text: 'Beamte/Öff. Dienst oft günstiger' },
            { icon: '🚘', title: 'Zweitwagen', text: 'SF-Klasse vom Erstwagen übernehmen' },
            { icon: '🏢', title: 'Werkstattbindung', text: 'Partnerwerkstatt = günstiger' },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                <p className="text-xs text-gray-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spartipps */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-green-800 mb-3">💡 Spartipps für die Kfz-Versicherung</h3>
        <ul className="space-y-2 text-sm text-green-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Jährliche Zahlung:</strong> Spart bis zu 5-10% gegenüber monatlicher Zahlung</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Fahrerkreis einschränken:</strong> „Nur Versicherungsnehmer" ist am günstigsten</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Höhere Selbstbeteiligung:</strong> 500€ statt 150€ senkt den Beitrag spürbar</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Werkstattbindung:</strong> Reparatur in Partnerwerkstatt = günstigerer Tarif</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Telematik-Tarif:</strong> Für vorsichtige Fahrer bis 30% Ersparnis möglich</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Stichtag 30. November:</strong> Beste Zeit zum Wechseln (Kündigungsfrist)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>SF-Klasse übertragen:</strong> Von Eltern oder Partner übernehmen</span>
          </li>
        </ul>
      </div>
{/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & weiterführende Links</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gdv.de/gdv/themen/versichern/typklassen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GDV – Typklassenverzeichnis
          </a>
          <a 
            href="https://www.gdv.de/gdv/themen/versichern/regionalklassen"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GDV – Regionalklassen-Abfrage
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
            href="https://www.bafin.de/DE/Verbraucher/Versicherungen/versicherungen_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BaFin – Versicherungsaufsicht
          </a>
        </div>
      </div>
    </div>
  );
}
