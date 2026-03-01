import { useState, useMemo } from 'react';

// Hundesteuer-Sätze deutscher Großstädte (Stand 2024/2025)
// Quellen: Offizielle Satzungen der jeweiligen Städte
const STAEDTE_HUNDESTEUER = [
  { 
    stadt: 'Berlin', 
    bundesland: 'BE',
    ersterHund: 120, 
    weitererHund: 180, 
    listenhund: 600,
    quelle: 'https://www.berlin.de/sen/finanzen/steuern/informationen-fuer-steuerzahler-/faq-steuern/hundesteuer/'
  },
  { 
    stadt: 'Hamburg', 
    bundesland: 'HH',
    ersterHund: 90, 
    weitererHund: 90, 
    listenhund: 600,
    quelle: 'https://www.hamburg.de/hundesteuer/'
  },
  { 
    stadt: 'München', 
    bundesland: 'BY',
    ersterHund: 100, 
    weitererHund: 100, 
    listenhund: 800,
    quelle: 'https://stadt.muenchen.de/service/info/hundesteuer/1063527/'
  },
  { 
    stadt: 'Köln', 
    bundesland: 'NW',
    ersterHund: 156, 
    weitererHund: 156, 
    listenhund: 672,
    quelle: 'https://www.stadt-koeln.de/service/produkt/hundesteuer-1'
  },
  { 
    stadt: 'Frankfurt am Main', 
    bundesland: 'HE',
    ersterHund: 102, 
    weitererHund: 180, 
    listenhund: 900,
    quelle: 'https://frankfurt.de/service-und-rathaus/verwaltung/aemter-und-institutionen/stadtkasse/hundesteuer'
  },
  { 
    stadt: 'Stuttgart', 
    bundesland: 'BW',
    ersterHund: 108, 
    weitererHund: 216, 
    listenhund: 612,
    quelle: 'https://www.stuttgart.de/vv/leistungen/hundesteuer.php'
  },
  { 
    stadt: 'Düsseldorf', 
    bundesland: 'NW',
    ersterHund: 96, 
    weitererHund: 150, 
    listenhund: 600,
    quelle: 'https://www.duesseldorf.de/steueramt/steuern/hundesteuer'
  },
  { 
    stadt: 'Leipzig', 
    bundesland: 'SN',
    ersterHund: 96, 
    weitererHund: 144, 
    listenhund: 696,
    quelle: 'https://www.leipzig.de/buergerservice-und-verwaltung/steuern-und-finanzen/hundesteuer'
  },
  { 
    stadt: 'Dortmund', 
    bundesland: 'NW',
    ersterHund: 156, 
    weitererHund: 180, 
    listenhund: 624,
    quelle: 'https://www.dortmund.de/de/leben_in_dortmund/planen_bauen_wohnen/stadterneuerung_1/hundesteuer.html'
  },
  { 
    stadt: 'Essen', 
    bundesland: 'NW',
    ersterHund: 160, 
    weitererHund: 208, 
    listenhund: 852,
    quelle: 'https://www.essen.de/rathaus/aemter/ordner_24/hundesteuer.de.html'
  },
  { 
    stadt: 'Bremen', 
    bundesland: 'HB',
    ersterHund: 150, 
    weitererHund: 150, 
    listenhund: 600,
    quelle: 'https://www.finanzen.bremen.de/steuern/hundesteuer-7693'
  },
  { 
    stadt: 'Dresden', 
    bundesland: 'SN',
    ersterHund: 108, 
    weitererHund: 144, 
    listenhund: 504,
    quelle: 'https://www.dresden.de/de/rathaus/dienstleistungen/hundesteuer.php'
  },
  { 
    stadt: 'Hannover', 
    bundesland: 'NI',
    ersterHund: 132, 
    weitererHund: 192, 
    listenhund: 660,
    quelle: 'https://www.hannover.de/Leben-in-der-Region-Hannover/Verwaltungen-Kommunen/Die-Verwaltung-der-Landeshauptstadt-Hannover/Dezernate-und-Fachbereiche-der-LHH/Finanzen,-Personal-und-Ordnung/Fachbereich-Steuerangelegenheiten/Hundesteuer'
  },
  { 
    stadt: 'Nürnberg', 
    bundesland: 'BY',
    ersterHund: 120, 
    weitererHund: 120, 
    listenhund: 800,
    quelle: 'https://www.nuernberg.de/internet/steueramt/hundesteuer.html'
  },
  { 
    stadt: 'Duisburg', 
    bundesland: 'NW',
    ersterHund: 156, 
    weitererHund: 204, 
    listenhund: 852,
    quelle: 'https://www.duisburg.de/vv/produkte/pro_du/dez_ii/32/hundesteuer.php'
  },
  { 
    stadt: 'Bochum', 
    bundesland: 'NW',
    ersterHund: 160, 
    weitererHund: 200, 
    listenhund: 700,
    quelle: 'https://www.bochum.de/Kaemmerei/Hundesteuer'
  },
  { 
    stadt: 'Wuppertal', 
    bundesland: 'NW',
    ersterHund: 160, 
    weitererHund: 200, 
    listenhund: 700,
    quelle: 'https://www.wuppertal.de/vv/produkte/203/hundesteuer.php'
  },
  { 
    stadt: 'Bielefeld', 
    bundesland: 'NW',
    ersterHund: 132, 
    weitererHund: 168, 
    listenhund: 600,
    quelle: 'https://www.bielefeld.de/node/7851'
  },
  { 
    stadt: 'Bonn', 
    bundesland: 'NW',
    ersterHund: 180, 
    weitererHund: 252, 
    listenhund: 912,
    quelle: 'https://www.bonn.de/vv/produkte/Hundesteuer.php'
  },
  { 
    stadt: 'Münster', 
    bundesland: 'NW',
    ersterHund: 144, 
    weitererHund: 168, 
    listenhund: 576,
    quelle: 'https://www.stadt-muenster.de/finanzen/steuern/hundesteuer'
  },
  { 
    stadt: 'Mannheim', 
    bundesland: 'BW',
    ersterHund: 120, 
    weitererHund: 216, 
    listenhund: 720,
    quelle: 'https://www.mannheim.de/de/service-bieten/steuern/hundesteuer'
  },
  { 
    stadt: 'Karlsruhe', 
    bundesland: 'BW',
    ersterHund: 120, 
    weitererHund: 192, 
    listenhund: 600,
    quelle: 'https://www.karlsruhe.de/b4/steuern_finanzen/stadtkasse/hundesteuer'
  },
  { 
    stadt: 'Augsburg', 
    bundesland: 'BY',
    ersterHund: 100, 
    weitererHund: 100, 
    listenhund: 600,
    quelle: 'https://www.augsburg.de/buergerservice/finanzen/hundesteuer'
  },
  { 
    stadt: 'Wiesbaden', 
    bundesland: 'HE',
    ersterHund: 110, 
    weitererHund: 165, 
    listenhund: 880,
    quelle: 'https://www.wiesbaden.de/leben-in-wiesbaden/finanzen/steuern/hundesteuer.php'
  },
  { 
    stadt: 'Mainz', 
    bundesland: 'RP',
    ersterHund: 186, 
    weitererHund: 222, 
    listenhund: 930,
    quelle: 'https://www.mainz.de/vv/produkte/hundesteuer.php'
  },
].sort((a, b) => a.stadt.localeCompare(b.stadt));

// Listenhunde / Kampfhunde (je nach Bundesland unterschiedlich definiert)
const LISTENHUND_INFO = {
  titel: 'Was sind Listenhunde?',
  beschreibung: 'Als "Listenhunde" oder "Kampfhunde" gelten Hunderassen, die in den Hundeverordnungen der Bundesländer als potenziell gefährlich eingestuft werden.',
  rassen: [
    'American Staffordshire Terrier',
    'Bullterrier',
    'Pitbull Terrier',
    'Staffordshire Bullterrier',
    'Tosa Inu',
    'Dogo Argentino',
    'Fila Brasileiro',
    'Mastín Español',
    'Mastiff',
    'Rottweiler (in einigen Bundesländern)',
  ],
  hinweis: 'Die genaue Definition variiert je nach Bundesland. Bei Mischlingen zählt ggf. ein sichtbarer Rasseanteil.',
};

export default function HundesteuerRechner() {
  const [ausgewaehlteStadt, setAusgewaehlteStadt] = useState('Berlin');
  const [anzahlHunde, setAnzahlHunde] = useState(1);
  const [anzahlListenhunde, setAnzahlListenhunde] = useState(0);

  const stadtDaten = useMemo(() => {
    return STAEDTE_HUNDESTEUER.find(s => s.stadt === ausgewaehlteStadt);
  }, [ausgewaehlteStadt]);

  const berechnung = useMemo(() => {
    if (!stadtDaten) return null;

    const normalHunde = Math.max(0, anzahlHunde - anzahlListenhunde);
    const listenhunde = Math.min(anzahlListenhunde, anzahlHunde);

    let steuerNormal = 0;
    let details: { beschreibung: string; betrag: number }[] = [];

    // Berechnung für normale Hunde
    if (normalHunde >= 1) {
      steuerNormal += stadtDaten.ersterHund;
      details.push({
        beschreibung: '1. Hund (normal)',
        betrag: stadtDaten.ersterHund,
      });
    }
    if (normalHunde >= 2) {
      const weitereNormal = normalHunde - 1;
      const weitereKosten = weitereNormal * stadtDaten.weitererHund;
      steuerNormal += weitereKosten;
      details.push({
        beschreibung: `${weitereNormal}× weiterer Hund (normal)`,
        betrag: weitereKosten,
      });
    }

    // Berechnung für Listenhunde
    let steuerListen = 0;
    if (listenhunde > 0) {
      steuerListen = listenhunde * stadtDaten.listenhund;
      details.push({
        beschreibung: `${listenhunde}× Listenhund`,
        betrag: steuerListen,
      });
    }

    const gesamtSteuer = steuerNormal + steuerListen;
    const monatlich = gesamtSteuer / 12;

    return {
      gesamt: gesamtSteuer,
      monatlich,
      details,
      normalHunde,
      listenhunde,
    };
  }, [stadtDaten, anzahlHunde, anzahlListenhunde]);

  const formatEuro = (n: number) => 
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  // Städte mit günstigster und teuerster Hundesteuer
  const statistik = useMemo(() => {
    const sortiert = [...STAEDTE_HUNDESTEUER].sort((a, b) => a.ersterHund - b.ersterHund);
    return {
      guenstigste: sortiert.slice(0, 3),
      teuerste: sortiert.slice(-3).reverse(),
      durchschnitt: Math.round(
        STAEDTE_HUNDESTEUER.reduce((sum, s) => sum + s.ersterHund, 0) / STAEDTE_HUNDESTEUER.length
      ),
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Stadt-Auswahl */}
        <label className="block mb-6">
          <span className="text-gray-700 font-medium">🏙️ Stadt auswählen</span>
          <select
            value={ausgewaehlteStadt}
            onChange={(e) => setAusgewaehlteStadt(e.target.value)}
            className="mt-2 w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-white"
          >
            {STAEDTE_HUNDESTEUER.map((stadt) => (
              <option key={stadt.stadt} value={stadt.stadt}>
                {stadt.stadt} ({stadt.bundesland})
              </option>
            ))}
          </select>
          {stadtDaten && (
            <div className="mt-2 text-sm text-gray-500">
              1. Hund: {formatEuro(stadtDaten.ersterHund)} | Weiterer: {formatEuro(stadtDaten.weitererHund)} | Listenhund: {formatEuro(stadtDaten.listenhund)}
            </div>
          )}
        </label>

        {/* Anzahl Hunde */}
        <label className="block mb-6">
          <span className="text-gray-700 font-medium">🐕 Anzahl Hunde gesamt</span>
          <div className="mt-2 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                const neueAnzahl = Math.max(1, anzahlHunde - 1);
                setAnzahlHunde(neueAnzahl);
                if (anzahlListenhunde > neueAnzahl) {
                  setAnzahlListenhunde(neueAnzahl);
                }
              }}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-2xl font-bold text-gray-600 transition-colors"
            >
              −
            </button>
            <span className="text-4xl font-bold text-gray-800 w-16 text-center">
              {anzahlHunde}
            </span>
            <button
              onClick={() => setAnzahlHunde(anzahlHunde + 1)}
              className="w-12 h-12 rounded-full bg-indigo-100 hover:bg-indigo-200 text-2xl font-bold text-indigo-600 transition-colors"
            >
              +
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setAnzahlHunde(n);
                  if (anzahlListenhunde > n) {
                    setAnzahlListenhunde(n);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  anzahlHunde === n
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {n} {n === 1 ? 'Hund' : 'Hunde'}
              </button>
            ))}
          </div>
        </label>

        {/* Listenhunde */}
        <div className="mb-4">
          <span className="text-gray-700 font-medium flex items-center gap-2">
            ⚠️ Davon Listenhunde (Kampfhunde)
          </span>
          <div className="mt-2 flex items-center justify-center gap-4">
            <button
              onClick={() => setAnzahlListenhunde(Math.max(0, anzahlListenhunde - 1))}
              disabled={anzahlListenhunde === 0}
              className={`w-12 h-12 rounded-full text-2xl font-bold transition-colors ${
                anzahlListenhunde === 0
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              −
            </button>
            <span className="text-4xl font-bold text-gray-800 w-16 text-center">
              {anzahlListenhunde}
            </span>
            <button
              onClick={() => setAnzahlListenhunde(Math.min(anzahlHunde, anzahlListenhunde + 1))}
              disabled={anzahlListenhunde >= anzahlHunde}
              className={`w-12 h-12 rounded-full text-2xl font-bold transition-colors ${
                anzahlListenhunde >= anzahlHunde
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-orange-100 hover:bg-orange-200 text-orange-600'
              }`}
            >
              +
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            {anzahlListenhunde === 0 
              ? 'Keine Listenhunde' 
              : `${anzahlListenhunde} von ${anzahlHunde} ${anzahlHunde === 1 ? 'ist ein' : 'sind'} Listenhund${anzahlListenhunde > 1 ? 'e' : ''}`
            }
          </p>
        </div>
      </div>

      {/* Ergebnis */}
      {berechnung && stadtDaten && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-indigo-100">
              🐕 Jährliche Hundesteuer in {ausgewaehlteStadt}
            </h3>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {anzahlHunde} {anzahlHunde === 1 ? 'Hund' : 'Hunde'}
            </span>
          </div>

          <div className="mb-4">
            <div className="text-indigo-100 text-sm mb-1">Jährliche Steuer</div>
            <span className="text-5xl font-bold">{formatEuro(berechnung.gesamt)}</span>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            {berechnung.details.map((detail, index) => (
              <div key={index} className="flex justify-between items-center mb-2">
                <span className="text-indigo-100">{detail.beschreibung}</span>
                <span className="font-semibold">{formatEuro(detail.betrag)}</span>
              </div>
            ))}
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-indigo-100">= Gesamt pro Jahr</span>
                <span className="text-2xl font-bold">{formatEuro(berechnung.gesamt)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-indigo-200 text-sm">≈ Pro Monat</span>
                <span className="text-indigo-100">{formatEuro(berechnung.monatlich)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vergleich: Günstigste & Teuerste Städte */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Hundesteuer-Vergleich</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-medium text-green-800 mb-2">💰 Günstigste Städte</h4>
            <div className="space-y-2">
              {statistik.guenstigste.map((stadt, i) => (
                <div key={stadt.stadt} className="flex justify-between text-sm">
                  <span className="text-green-700">{i + 1}. {stadt.stadt}</span>
                  <span className="font-semibold text-green-800">{stadt.ersterHund} €</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <h4 className="font-medium text-red-800 mb-2">💸 Teuerste Städte</h4>
            <div className="space-y-2">
              {statistik.teuerste.map((stadt, i) => (
                <div key={stadt.stadt} className="flex justify-between text-sm">
                  <span className="text-red-700">{i + 1}. {stadt.stadt}</span>
                  <span className="font-semibold text-red-800">{stadt.ersterHund} €</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <span className="text-gray-600">Durchschnitt Großstädte:</span>
          <span className="ml-2 font-bold text-gray-800">{statistik.durchschnitt} € / Jahr</span>
        </div>
      </div>

      {/* Übersichtstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🏙️ Alle Städte im Überblick</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Stadt</th>
                <th className="text-right py-2 text-gray-600">1. Hund</th>
                <th className="text-right py-2 text-gray-600">Weiterer</th>
                <th className="text-right py-2 text-gray-600">Listenhund</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {STAEDTE_HUNDESTEUER.map((stadt) => (
                <tr 
                  key={stadt.stadt} 
                  className={`hover:bg-gray-50 cursor-pointer ${
                    stadt.stadt === ausgewaehlteStadt ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => setAusgewaehlteStadt(stadt.stadt)}
                >
                  <td className={`py-2 font-medium ${stadt.stadt === ausgewaehlteStadt ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {stadt.stadt}
                  </td>
                  <td className="py-2 text-right text-gray-600">{stadt.ersterHund} €</td>
                  <td className="py-2 text-right text-gray-600">{stadt.weitererHund} €</td>
                  <td className="py-2 text-right text-orange-600 font-semibold">{stadt.listenhund} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Listenhunde Info */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚠️ {LISTENHUND_INFO.titel}</h3>
        <p className="text-gray-600 text-sm mb-4">{LISTENHUND_INFO.beschreibung}</p>
        
        <div className="p-4 bg-orange-50 rounded-xl mb-4">
          <h4 className="font-medium text-orange-800 mb-2">Typische Listenhund-Rassen:</h4>
          <div className="grid grid-cols-2 gap-1">
            {LISTENHUND_INFO.rassen.map((rasse) => (
              <div key={rasse} className="text-sm text-orange-700">• {rasse}</div>
            ))}
          </div>
        </div>
        
        <div className="p-3 bg-yellow-50 rounded-xl">
          <p className="text-sm text-yellow-800">
            <strong>💡 Hinweis:</strong> {LISTENHUND_INFO.hinweis}
          </p>
        </div>
      </div>

      {/* Allgemeine Infos */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wissenswertes zur Hundesteuer</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="font-semibold text-blue-800 mb-2">📋 Was ist Hundesteuer?</p>
            <p className="text-blue-700">
              Die Hundesteuer ist eine Gemeindesteuer, die für das Halten von Hunden erhoben wird. 
              Sie dient nicht der Finanzierung bestimmter Leistungen, sondern fließt in den 
              allgemeinen Haushalt der Kommune.
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-xl">
            <p className="font-semibold text-green-800 mb-2">✅ Anmeldepflicht</p>
            <p className="text-green-700">
              Jeder Hund muss innerhalb von 1-2 Wochen nach Anschaffung bei der Gemeinde 
              angemeldet werden. Bei Umzug ist eine Ummeldung erforderlich. Verspätete 
              Anmeldung kann zu Bußgeldern führen.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="font-semibold text-purple-800 mb-2">💳 Hundesteuermarke</p>
            <p className="text-purple-700">
              Nach der Anmeldung erhält man eine Hundesteuermarke, die der Hund 
              (meist am Halsband) tragen muss. Diese dient als Nachweis der 
              ordnungsgemäßen Anmeldung.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl">
            <p className="font-semibold text-yellow-800 mb-2">🏥 Befreiungen möglich</p>
            <ul className="text-yellow-700 space-y-1">
              <li>• <strong>Blindenhunde</strong> – meist steuerfrei</li>
              <li>• <strong>Rettungshunde</strong> – oft ermäßigt/befreit</li>
              <li>• <strong>Therapiehunde</strong> – je nach Kommune</li>
              <li>• <strong>Hunde aus dem Tierheim</strong> – teilweise 1 Jahr befreit</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Steuer-Spar-Tipps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">💡 Tipps zur Hundesteuer</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🏠</span>
            <div>
              <p className="font-medium text-gray-800">Wohnort prüfen</p>
              <p className="text-gray-600">Die Hundesteuer variiert stark. In manchen Gemeinden zahlt man nur 30-40 € pro Jahr.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🐾</span>
            <div>
              <p className="font-medium text-gray-800">Tierheim-Hunde</p>
              <p className="text-gray-600">Viele Städte befreien Hunde aus dem Tierheim für 6-12 Monate von der Steuer.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📝</span>
            <div>
              <p className="font-medium text-gray-800">Wesenstest für Listenhunde</p>
              <p className="text-gray-600">In manchen Bundesländern kann durch einen bestandenen Wesenstest der normale Steuersatz gelten.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🎓</span>
            <div>
              <p className="font-medium text-gray-800">Hundeführerschein</p>
              <p className="text-gray-600">Einige Kommunen gewähren Ermäßigungen bei Nachweis einer Hundeschule oder Prüfung.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rechtliche Grundlagen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">⚖️ Rechtliche Grundlagen</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Die Hundesteuer ist eine <strong>örtliche Aufwandsteuer</strong> nach Art. 105 Abs. 2a GG. 
            Jede Kommune kann die Höhe selbst festlegen (kommunale Satzung).
          </p>
          <p>
            Die <strong>Landeshundegesetze</strong> regeln zusätzlich Haltungsvoraussetzungen, 
            Versicherungspflichten und die Definition von Listenhunden.
          </p>
          <div className="p-3 bg-red-50 rounded-xl">
            <p className="text-red-700">
              <strong>⚠️ Bußgelder:</strong> Nicht angemeldete Hunde können zu Bußgeldern von 
              mehreren hundert Euro führen. Die Steuer wird rückwirkend nachgefordert.
            </p>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1 text-sm">
          {stadtDaten && (
            <a 
              href={stadtDaten.quelle}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:underline"
            >
              {ausgewaehlteStadt} – Offizielle Hundesteuer-Informationen
            </a>
          )}
          <a 
            href="https://www.destatis.de/DE/Themen/Staat/Steuern/Steuern-Gemeinden/_inhalt.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 hover:underline"
          >
            Statistisches Bundesamt – Kommunale Steuern
          </a>
          <p className="text-gray-500 text-xs mt-2">
            Stand: 2024/2025. Alle Angaben ohne Gewähr. Die tatsächlichen Steuersätze 
            können sich durch neue Satzungen ändern.
          </p>
        </div>
      </div>
    </div>
  );
}
