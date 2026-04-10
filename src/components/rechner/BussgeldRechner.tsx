import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ═══════════════════════════════════════════════════════════════
// BUSSELDKATALOG 2024 - Aktuelle Werte
// ═══════════════════════════════════════════════════════════════

type VerstossKategorie = 'geschwindigkeit' | 'rotlicht' | 'abstand' | 'handy';
type OrtTyp = 'innerorts' | 'ausserorts' | 'autobahn';

interface BussgeldErgebnis {
  bussgeld: number;
  punkte: number;
  fahrverbot: number; // Monate, 0 = kein Fahrverbot
  beschreibung: string;
  hinweis?: string;
}

// Geschwindigkeitsüberschreitungen nach StVO/BKatV 2024
// Bußgelder wurden 2021 angehoben (StVO-Novelle)
// Bußgeldkatalog PKW innerorts nach BKatV (Stand 2024/2025/2026)
// Quelle: https://www.bussgeldkatalog.org/geschwindigkeitsueberschreitung/
// WICHTIG: 26-30 km/h = 180€, 1 Punkt, Fahrverbot NUR bei Wiederholung
//          Fahrverbot ab 31 km/h innerorts
const GESCHWINDIGKEIT_INNERORTS: { bis: number; bussgeld: number; punkte: number; fahrverbot: number }[] = [
  { bis: 10, bussgeld: 30, punkte: 0, fahrverbot: 0 },
  { bis: 15, bussgeld: 50, punkte: 0, fahrverbot: 0 },
  { bis: 20, bussgeld: 70, punkte: 0, fahrverbot: 0 },
  { bis: 25, bussgeld: 115, punkte: 1, fahrverbot: 0 }, // 21-25 km/h: 115€, 1 Punkt
  { bis: 30, bussgeld: 180, punkte: 1, fahrverbot: 0 }, // 26-30 km/h: 180€, 1 Punkt (Fahrverbot nur bei Wiederholung)
  { bis: 40, bussgeld: 260, punkte: 2, fahrverbot: 1 }, // 31-40 km/h: 260€, 2 Punkte, 1 Monat
  { bis: 50, bussgeld: 400, punkte: 2, fahrverbot: 1 }, // 41-50 km/h: 400€, 2 Punkte, 1 Monat
  { bis: 60, bussgeld: 560, punkte: 2, fahrverbot: 2 }, // 51-60 km/h: 560€, 2 Punkte, 2 Monate
  { bis: 70, bussgeld: 700, punkte: 2, fahrverbot: 3 }, // 61-70 km/h: 700€, 2 Punkte, 3 Monate
  { bis: Infinity, bussgeld: 800, punkte: 2, fahrverbot: 3 }, // über 70 km/h: 800€
];

// Bußgeldkatalog PKW außerorts nach BKatV (Stand 2024/2025/2026)
// Quelle: https://www.bussgeldkatalog.org/geschwindigkeitsueberschreitung/
// WICHTIG: 26-30 km/h = 150€, 1 Punkt, Fahrverbot NUR bei Wiederholung
//          31-40 km/h = 200€, 1 Punkt, Fahrverbot NUR bei Wiederholung
//          Fahrverbot ab 41 km/h außerorts
const GESCHWINDIGKEIT_AUSSERORTS: { bis: number; bussgeld: number; punkte: number; fahrverbot: number }[] = [
  { bis: 10, bussgeld: 20, punkte: 0, fahrverbot: 0 },
  { bis: 15, bussgeld: 40, punkte: 0, fahrverbot: 0 },
  { bis: 20, bussgeld: 60, punkte: 0, fahrverbot: 0 },
  { bis: 25, bussgeld: 100, punkte: 1, fahrverbot: 0 }, // 21-25 km/h: 100€, 1 Punkt
  { bis: 30, bussgeld: 150, punkte: 1, fahrverbot: 0 }, // 26-30 km/h: 150€, 1 Punkt (Fahrverbot nur bei Wiederholung)
  { bis: 40, bussgeld: 200, punkte: 1, fahrverbot: 0 }, // 31-40 km/h: 200€, 1 Punkt (Fahrverbot nur bei Wiederholung)
  { bis: 50, bussgeld: 320, punkte: 2, fahrverbot: 1 }, // 41-50 km/h: 320€, 2 Punkte, 1 Monat
  { bis: 60, bussgeld: 480, punkte: 2, fahrverbot: 1 }, // 51-60 km/h: 480€, 2 Punkte, 1 Monat
  { bis: 70, bussgeld: 600, punkte: 2, fahrverbot: 2 }, // 61-70 km/h: 600€, 2 Punkte, 2 Monate
  { bis: Infinity, bussgeld: 700, punkte: 2, fahrverbot: 3 }, // über 70 km/h: 700€, 3 Monate
];

// Rotlichtverstöße nach BKatV
const ROTLICHT_VERGEHN = {
  unter1Sek: { bussgeld: 90, punkte: 1, fahrverbot: 0, beschreibung: 'Rotlichtverstoß unter 1 Sekunde' },
  uber1Sek: { bussgeld: 200, punkte: 2, fahrverbot: 1, beschreibung: 'Qualifizierter Rotlichtverstoß (über 1 Sek.)' },
  unter1SekGefaehrdung: { bussgeld: 200, punkte: 2, fahrverbot: 1, beschreibung: 'Rotlichtverstoß mit Gefährdung' },
  uber1SekGefaehrdung: { bussgeld: 320, punkte: 2, fahrverbot: 1, beschreibung: 'Qualifizierter Rotlichtverstoß mit Gefährdung' },
  unter1SekSachschaden: { bussgeld: 240, punkte: 2, fahrverbot: 1, beschreibung: 'Rotlichtverstoß mit Sachschaden' },
  uber1SekSachschaden: { bussgeld: 360, punkte: 2, fahrverbot: 1, beschreibung: 'Qualifizierter Rotlichtverstoß mit Sachschaden' },
};

// Abstandsverstöße nach BKatV (bei mehr als 80 km/h)
const ABSTAND_VERSTOESSE: { anteil: string; von: number; bis: number; bussgeld: number; punkte: number; fahrverbot: number }[] = [
  { anteil: '5/10 bis 4/10', von: 0.4, bis: 0.5, bussgeld: 75, punkte: 1, fahrverbot: 0 },
  { anteil: '4/10 bis 3/10', von: 0.3, bis: 0.4, bussgeld: 100, punkte: 1, fahrverbot: 0 },
  { anteil: '3/10 bis 2/10', von: 0.2, bis: 0.3, bussgeld: 160, punkte: 1, fahrverbot: 0 },
  { anteil: '2/10 bis 1/10', von: 0.1, bis: 0.2, bussgeld: 240, punkte: 1, fahrverbot: 0 },
  { anteil: 'weniger als 1/10', von: 0, bis: 0.1, bussgeld: 320, punkte: 1, fahrverbot: 0 },
];

// Abstandsverstöße bei mehr als 100 km/h
const ABSTAND_VERSTOESSE_100: { anteil: string; von: number; bis: number; bussgeld: number; punkte: number; fahrverbot: number }[] = [
  { anteil: '5/10 bis 4/10', von: 0.4, bis: 0.5, bussgeld: 75, punkte: 1, fahrverbot: 0 },
  { anteil: '4/10 bis 3/10', von: 0.3, bis: 0.4, bussgeld: 160, punkte: 2, fahrverbot: 0 },
  { anteil: '3/10 bis 2/10', von: 0.2, bis: 0.3, bussgeld: 240, punkte: 2, fahrverbot: 1 },
  { anteil: '2/10 bis 1/10', von: 0.1, bis: 0.2, bussgeld: 320, punkte: 2, fahrverbot: 2 },
  { anteil: 'weniger als 1/10', von: 0, bis: 0.1, bussgeld: 400, punkte: 2, fahrverbot: 3 },
];

// Abstandsverstöße bei mehr als 130 km/h
const ABSTAND_VERSTOESSE_130: { anteil: string; von: number; bis: number; bussgeld: number; punkte: number; fahrverbot: number }[] = [
  { anteil: '5/10 bis 4/10', von: 0.4, bis: 0.5, bussgeld: 100, punkte: 1, fahrverbot: 0 },
  { anteil: '4/10 bis 3/10', von: 0.3, bis: 0.4, bussgeld: 180, punkte: 2, fahrverbot: 1 },
  { anteil: '3/10 bis 2/10', von: 0.2, bis: 0.3, bussgeld: 280, punkte: 2, fahrverbot: 2 },
  { anteil: '2/10 bis 1/10', von: 0.1, bis: 0.2, bussgeld: 400, punkte: 2, fahrverbot: 3 },
  { anteil: 'weniger als 1/10', von: 0, bis: 0.1, bussgeld: 400, punkte: 2, fahrverbot: 3 },
];

// Handy am Steuer nach StVO §23
const HANDY_VERSTOESSE = {
  fahrer: { bussgeld: 100, punkte: 1, fahrverbot: 0, beschreibung: 'Handy am Steuer (als Fahrer)' },
  fahrerGefaehrdung: { bussgeld: 150, punkte: 2, fahrverbot: 1, beschreibung: 'Handy am Steuer mit Gefährdung' },
  fahrerSachschaden: { bussgeld: 200, punkte: 2, fahrverbot: 1, beschreibung: 'Handy am Steuer mit Sachschaden' },
  radfahrer: { bussgeld: 55, punkte: 0, fahrverbot: 0, beschreibung: 'Handy als Radfahrer' },
};

export default function BussgeldRechner() {
  const [kategorie, setKategorie] = useState<VerstossKategorie>('geschwindigkeit');
  
  // Geschwindigkeit
  const [ortTyp, setOrtTyp] = useState<OrtTyp>('innerorts');
  const [ueberschreitung, setUeberschreitung] = useState(15);
  
  // Rotlicht
  const [rotlichtDauer, setRotlichtDauer] = useState<'unter1Sek' | 'uber1Sek'>('unter1Sek');
  const [rotlichtFolgen, setRotlichtFolgen] = useState<'keine' | 'gefaehrdung' | 'sachschaden'>('keine');
  
  // Abstand
  const [geschwindigkeit, setGeschwindigkeit] = useState(100);
  const [abstandAnteil, setAbstandAnteil] = useState(0.35); // 35% = 3,5/10
  
  // Handy
  const [handyTyp, setHandyTyp] = useState<'fahrer' | 'fahrerGefaehrdung' | 'fahrerSachschaden' | 'radfahrer'>('fahrer');

  const ergebnis = useMemo((): BussgeldErgebnis => {
    switch (kategorie) {
      case 'geschwindigkeit': {
        const tabelle = ortTyp === 'innerorts' ? GESCHWINDIGKEIT_INNERORTS : GESCHWINDIGKEIT_AUSSERORTS;
        const eintrag = tabelle.find(e => ueberschreitung <= e.bis) || tabelle[tabelle.length - 1];
        
        let beschreibung = `${ueberschreitung} km/h zu schnell `;
        if (ortTyp === 'innerorts') {
          beschreibung += 'innerorts';
        } else if (ortTyp === 'ausserorts') {
          beschreibung += 'außerorts';
        } else {
          beschreibung += 'auf der Autobahn';
        }
        
        return {
          bussgeld: eintrag.bussgeld,
          punkte: eintrag.punkte,
          fahrverbot: eintrag.fahrverbot,
          beschreibung,
          hinweis: ueberschreitung >= 31 && ortTyp === 'innerorts' 
            ? 'Ab 31 km/h innerorts droht ein Fahrverbot!'
            : ueberschreitung >= 26 && ueberschreitung <= 30 && ortTyp === 'innerorts'
            ? 'Bei Wiederholung innerhalb eines Jahres droht auch hier ein Fahrverbot!'
            : ueberschreitung >= 41 && ortTyp !== 'innerorts'
            ? 'Ab 41 km/h außerorts droht ein Fahrverbot!'
            : ueberschreitung >= 26 && ueberschreitung <= 40 && ortTyp !== 'innerorts'
            ? 'Bei Wiederholung innerhalb eines Jahres droht auch hier ein Fahrverbot!'
            : undefined,
        };
      }
      
      case 'rotlicht': {
        let key: keyof typeof ROTLICHT_VERGEHN;
        if (rotlichtFolgen === 'keine') {
          key = rotlichtDauer;
        } else if (rotlichtFolgen === 'gefaehrdung') {
          key = rotlichtDauer === 'unter1Sek' ? 'unter1SekGefaehrdung' : 'uber1SekGefaehrdung';
        } else {
          key = rotlichtDauer === 'unter1Sek' ? 'unter1SekSachschaden' : 'uber1SekSachschaden';
        }
        const eintrag = ROTLICHT_VERGEHN[key];
        return {
          bussgeld: eintrag.bussgeld,
          punkte: eintrag.punkte,
          fahrverbot: eintrag.fahrverbot,
          beschreibung: eintrag.beschreibung,
          hinweis: rotlichtDauer === 'uber1Sek' 
            ? 'Ein qualifizierter Rotlichtverstoß (über 1 Sek.) führt immer zu 2 Punkten und Fahrverbot!'
            : undefined,
        };
      }
      
      case 'abstand': {
        let tabelle: typeof ABSTAND_VERSTOESSE;
        if (geschwindigkeit >= 130) {
          tabelle = ABSTAND_VERSTOESSE_130;
        } else if (geschwindigkeit >= 100) {
          tabelle = ABSTAND_VERSTOESSE_100;
        } else {
          tabelle = ABSTAND_VERSTOESSE;
        }
        
        const eintrag = tabelle.find(e => abstandAnteil > e.von && abstandAnteil <= e.bis) 
          || tabelle[tabelle.length - 1];
        
        // Bei unter 80 km/h nur Verwarngeld
        if (geschwindigkeit < 80) {
          return {
            bussgeld: 25,
            punkte: 0,
            fahrverbot: 0,
            beschreibung: `Abstandsverstoß bei ${geschwindigkeit} km/h`,
            hinweis: 'Bei unter 80 km/h: Nur Verwarngeld, keine Punkte.',
          };
        }
        
        const halberTacho = Math.round(geschwindigkeit / 2);
        const abstandMeter = Math.round(halberTacho * abstandAnteil);
        
        return {
          bussgeld: eintrag.bussgeld,
          punkte: eintrag.punkte,
          fahrverbot: eintrag.fahrverbot,
          beschreibung: `Abstand ${eintrag.anteil} des halben Tachos (≈${abstandMeter}m bei ${geschwindigkeit} km/h)`,
          hinweis: geschwindigkeit >= 130 && abstandAnteil < 0.3
            ? 'Bei hoher Geschwindigkeit und geringem Abstand drohen bis zu 3 Monate Fahrverbot!'
            : undefined,
        };
      }
      
      case 'handy': {
        const eintrag = HANDY_VERSTOESSE[handyTyp];
        return {
          bussgeld: eintrag.bussgeld,
          punkte: eintrag.punkte,
          fahrverbot: eintrag.fahrverbot,
          beschreibung: eintrag.beschreibung,
          hinweis: handyTyp !== 'radfahrer' 
            ? 'Auch das Halten/Bedienen von Tablets, Navis etc. ist verboten!'
            : undefined,
        };
      }
    }
  }, [kategorie, ortTyp, ueberschreitung, rotlichtDauer, rotlichtFolgen, geschwindigkeit, abstandAnteil, handyTyp]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';

  const kategorieOptionen: { value: VerstossKategorie; label: string; icon: string }[] = [
    { value: 'geschwindigkeit', label: 'Geschwindigkeit', icon: '🚗' },
    { value: 'rotlicht', label: 'Rotlicht', icon: '🚦' },
    { value: 'abstand', label: 'Abstand', icon: '📏' },
    { value: 'handy', label: 'Handy', icon: '📱' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Kategorie-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-2">
          <span className="text-gray-700 font-medium">Art des Verstoßes</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {kategorieOptionen.map((option) => (
            <button
              key={option.value}
              onClick={() => setKategorie(option.value)}
              className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                kategorie === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Eingabefelder je nach Kategorie */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {kategorie === 'geschwindigkeit' && (
          <>
            {/* Ort */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Wo war der Verstoß?</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'innerorts' as OrtTyp, label: 'Innerorts', icon: '🏘️' },
                  { value: 'ausserorts' as OrtTyp, label: 'Außerorts', icon: '🛣️' },
                  { value: 'autobahn' as OrtTyp, label: 'Autobahn', icon: '🛤️' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setOrtTyp(option.value)}
                    className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                      ortTyp === option.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Überschreitung */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Überschreitung (nach Toleranzabzug)</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Die Toleranz beträgt meist 3 km/h (oder 3% bei über 100 km/h)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={ueberschreitung}
                  onChange={(e) => setUeberschreitung(Math.max(1, Math.min(100, Number(e.target.value))))}
                  className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  min="1"
                  max="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">km/h</span>
              </div>
              <input
                type="range"
                value={ueberschreitung}
                onChange={(e) => setUeberschreitung(Number(e.target.value))}
                className="w-full mt-3 accent-orange-500"
                min="1"
                max="70"
                step="1"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 km/h</span>
                <span>35 km/h</span>
                <span>70 km/h</span>
              </div>
            </div>

            {/* Schnellauswahl */}
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Schnellauswahl</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[10, 15, 21, 26, 31, 41, 51, 61, 70].map((km) => (
                  <button
                    key={km}
                    onClick={() => setUeberschreitung(km)}
                    className={`py-2 px-3 rounded-xl text-sm transition-all ${
                      ueberschreitung === km
                        ? 'bg-orange-100 text-orange-700 font-medium'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    +{km} km/h
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {kategorie === 'rotlicht' && (
          <>
            {/* Rotphase */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Wie lange war die Ampel rot?</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRotlichtDauer('unter1Sek')}
                  className={`py-4 px-4 rounded-xl font-medium transition-all ${
                    rotlichtDauer === 'unter1Sek'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">⏱️</div>
                  <div>Unter 1 Sekunde</div>
                  <div className="text-xs mt-1 opacity-75">Einfacher Rotlichtverstoß</div>
                </button>
                <button
                  onClick={() => setRotlichtDauer('uber1Sek')}
                  className={`py-4 px-4 rounded-xl font-medium transition-all ${
                    rotlichtDauer === 'uber1Sek'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">⚠️</div>
                  <div>Über 1 Sekunde</div>
                  <div className="text-xs mt-1 opacity-75">Qualifizierter Verstoß!</div>
                </button>
              </div>
            </div>

            {/* Folgen */}
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Kam es zu Folgen?</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'keine' as const, label: 'Keine', icon: '✓' },
                  { value: 'gefaehrdung' as const, label: 'Gefährdung', icon: '⚡' },
                  { value: 'sachschaden' as const, label: 'Sachschaden', icon: '💥' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRotlichtFolgen(option.value)}
                    className={`py-3 px-3 rounded-xl font-medium transition-all text-sm ${
                      rotlichtFolgen === option.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {kategorie === 'abstand' && (
          <>
            {/* Geschwindigkeit */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Ihre Geschwindigkeit</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={geschwindigkeit}
                  onChange={(e) => setGeschwindigkeit(Math.max(30, Math.min(200, Number(e.target.value))))}
                  className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
                  min="30"
                  max="200"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">km/h</span>
              </div>
              <input
                type="range"
                value={geschwindigkeit}
                onChange={(e) => setGeschwindigkeit(Number(e.target.value))}
                className="w-full mt-3 accent-orange-500"
                min="30"
                max="200"
                step="5"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>30 km/h</span>
                <span>100 km/h</span>
                <span>200 km/h</span>
              </div>
            </div>

            {/* Abstand */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Eingehaltener Abstand (Anteil des halben Tachos)</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Faustformel: Halber Tacho in Metern = Mindestabstand
                  (z.B. 50 m bei 100 km/h)
                </span>
              </label>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <span className="text-4xl font-bold text-orange-600">
                    {Math.round(abstandAnteil * 100)}%
                  </span>
                  <span className="text-gray-500 ml-2">
                    = {Math.round((geschwindigkeit / 2) * abstandAnteil)} m
                  </span>
                </div>
                <div className="text-sm text-gray-500 text-center mt-2">
                  Mindestabstand (½ Tacho): {Math.round(geschwindigkeit / 2)} m
                </div>
              </div>
              <input
                type="range"
                value={abstandAnteil * 100}
                onChange={(e) => setAbstandAnteil(Number(e.target.value) / 100)}
                className="w-full accent-orange-500"
                min="5"
                max="50"
                step="5"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5% (zu nah!)</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Schnellauswahl Abstand */}
            <div>
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Typische Szenarien</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setGeschwindigkeit(80); setAbstandAnteil(0.35); }}
                  className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
                >
                  🚗 Landstraße (80 km/h, 35%)
                </button>
                <button
                  onClick={() => { setGeschwindigkeit(120); setAbstandAnteil(0.25); }}
                  className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
                >
                  🛣️ Autobahn (120 km/h, 25%)
                </button>
                <button
                  onClick={() => { setGeschwindigkeit(150); setAbstandAnteil(0.15); }}
                  className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
                >
                  🏎️ Schnell (150 km/h, 15%)
                </button>
                <button
                  onClick={() => { setGeschwindigkeit(100); setAbstandAnteil(0.1); }}
                  className="py-2 px-3 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition-colors text-left"
                >
                  ⚠️ Drängler (100 km/h, 10%)
                </button>
              </div>
            </div>
          </>
        )}

        {kategorie === 'handy' && (
          <>
            <div className="mb-4">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Situation</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setHandyTyp('fahrer')}
                  className={`py-4 px-4 rounded-xl font-medium transition-all ${
                    handyTyp === 'fahrer'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">📱</div>
                  <div>Handy am Steuer</div>
                  <div className="text-xs mt-1 opacity-75">Standard-Verstoß</div>
                </button>
                <button
                  onClick={() => setHandyTyp('fahrerGefaehrdung')}
                  className={`py-4 px-4 rounded-xl font-medium transition-all ${
                    handyTyp === 'fahrerGefaehrdung'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">⚠️</div>
                  <div>Mit Gefährdung</div>
                  <div className="text-xs mt-1 opacity-75">Beinahe-Unfall etc.</div>
                </button>
                <button
                  onClick={() => setHandyTyp('fahrerSachschaden')}
                  className={`py-4 px-4 rounded-xl font-medium transition-all ${
                    handyTyp === 'fahrerSachschaden'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">💥</div>
                  <div>Mit Sachschaden</div>
                  <div className="text-xs mt-1 opacity-75">Unfall verursacht</div>
                </button>
                <button
                  onClick={() => setHandyTyp('radfahrer')}
                  className={`py-4 px-4 rounded-xl font-medium transition-all ${
                    handyTyp === 'radfahrer'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">🚴</div>
                  <div>Als Radfahrer</div>
                  <div className="text-xs mt-1 opacity-75">Geringeres Bußgeld</div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Ergebnis */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.fahrverbot > 0 
          ? 'bg-gradient-to-br from-red-500 to-red-700'
          : ergebnis.punkte > 0
          ? 'bg-gradient-to-br from-orange-500 to-red-600'
          : 'bg-gradient-to-br from-yellow-500 to-orange-500'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">🚨 Ihre Strafe</h3>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.bussgeld)}</span>
            <span className="text-xl opacity-80">Bußgeld</span>
          </div>
          <p className="mt-2 opacity-90">{ergebnis.beschreibung}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Punkte in Flensburg</span>
            <div className="text-3xl font-bold">{ergebnis.punkte}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Fahrverbot</span>
            <div className="text-3xl font-bold">
              {ergebnis.fahrverbot > 0 ? `${ergebnis.fahrverbot} Mon.` : 'Nein'}
            </div>
          </div>
        </div>

        {ergebnis.hinweis && (
          <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm">💡 {ergebnis.hinweis}</p>
          </div>
        )}
      </div>

      {/* Punkte-System Erklärung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Punktesystem in Flensburg</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-2xl">0</span>
            <div>
              <p className="font-medium text-green-800">Keine Punkte</p>
              <p className="text-sm text-green-600">Verwarngeld / leichte Ordnungswidrigkeit</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-2xl">1</span>
            <div>
              <p className="font-medium text-yellow-800">1 Punkt</p>
              <p className="text-sm text-yellow-600">Verjährt nach 2,5 Jahren</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-2xl">2</span>
            <div>
              <p className="font-medium text-orange-800">2 Punkte</p>
              <p className="text-sm text-orange-600">Grobe Verstöße, verjährt nach 5 Jahren</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
            <span className="text-2xl">8</span>
            <div>
              <p className="font-medium text-red-800">8 Punkte = Führerscheinentzug!</p>
              <p className="text-sm text-red-600">Mindestens 6 Monate Sperre</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>💡 Tipp:</strong> Ab 4 Punkten Ermahnung, ab 6 Punkten Verwarnung mit freiwilligem Seminar.
          </p>
        </div>
      </div>

      {/* Bußgeldkatalog Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Bußgeldkatalog 2024 – Überblick</h3>
        
        {/* Geschwindigkeit Tabelle */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">🚗 Geschwindigkeitsüberschreitung (innerorts)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-3">Überschreitung</th>
                  <th className="text-right py-2 px-3">Bußgeld</th>
                  <th className="text-right py-2 px-3">Punkte</th>
                  <th className="text-right py-2 px-3">Fahrverbot</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { km: 'bis 10', b: 30, p: 0, f: '-' },
                  { km: '11-15', b: 50, p: 0, f: '-' },
                  { km: '16-20', b: 70, p: 0, f: '-' },
                  { km: '21-25', b: 115, p: 1, f: '-' },
                  { km: '26-30', b: 180, p: 1, f: '(Wdh.)*' },
                  { km: '31-40', b: 260, p: 2, f: '1 Mon.' },
                  { km: '41-50', b: 400, p: 2, f: '1 Mon.' },
                  { km: '51-60', b: 560, p: 2, f: '2 Mon.' },
                  { km: '61-70', b: 700, p: 2, f: '3 Mon.' },
                  { km: 'über 70', b: 800, p: 2, f: '3 Mon.' },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-600">{row.km} km/h</td>
                    <td className="py-2 px-3 text-right font-medium">{row.b} €</td>
                    <td className="py-2 px-3 text-right">{row.p}</td>
                    <td className="py-2 px-3 text-right text-red-600">{row.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Andere Verstöße */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">🚦 Andere häufige Verstöße</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Rotlichtverstoß (unter 1 Sek.)</span>
              <span className="font-medium">90 € / 1 Punkt</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Rotlichtverstoß (über 1 Sek.)</span>
              <span className="font-medium text-red-600">200 € / 2 Punkte / 1 Mon.</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Handy am Steuer</span>
              <span className="font-medium">100 € / 1 Punkt</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Abstand (unter 3/10 bei 130+ km/h)</span>
              <span className="font-medium text-red-600">280 € / 2 Punkte / 2 Mon.</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Parkverstoß (ohne Parkschein)</span>
              <span className="font-medium">20-40 €</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Nicht angeschnallt</span>
              <span className="font-medium">30 €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Toleranzabzug:</strong> Bei Geschwindigkeitsmessungen werden 3 km/h (oder 3% ab 100 km/h) abgezogen</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Probezeit:</strong> Bei A-Verstößen (2 Punkte) droht Probezeitverlängerung + Aufbauseminar</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Wiederholungstäter:</strong> Bei 2x Verstoß mit Fahrverbot innerhalb eines Jahres droht längeres Fahrverbot</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Einspruch:</strong> Gegen Bußgeldbescheide kann innerhalb von 2 Wochen Einspruch eingelegt werden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Fahrtenbuch:</strong> Bei unbekanntem Fahrer kann Fahrtenbuchauflage drohen</span>
          </li>
        </ul>
      </div>

      {/* Fahrverbot Infos */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🚫 Fahrverbot – Was Sie wissen müssen</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-medium text-gray-800">Beginn des Fahrverbots</p>
              <p>Das Fahrverbot beginnt mit Abgabe des Führerscheins. Bei Ersttätern kann der Beginn innerhalb von 4 Monaten gewählt werden.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">⏰</span>
            <div>
              <p className="font-medium text-gray-800">Dauer</p>
              <p>1, 2 oder 3 Monate – je nach Schwere des Verstoßes. Keine vorzeitige Rückgabe möglich.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">💼</span>
            <div>
              <p className="font-medium text-gray-800">Berufliche Härte?</p>
              <p>Nur in Ausnahmefällen kann ein Fahrverbot in ein höheres Bußgeld umgewandelt werden (Ermessensentscheidung).</p>
            </div>
          </div>
        </div>
      </div>

            <RechnerFeedback rechnerName="Bußgeldrechner 2025 & 2026" rechnerSlug="bussgeld-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/stvo_2013/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Straßenverkehrs-Ordnung (StVO) – Gesetze im Internet
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/bkatv_2013/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bußgeldkatalog-Verordnung (BKatV) – Gesetze im Internet
          </a>
          <a 
            href="https://www.kba.de/DE/Themen/ZentraleRegister/FAER/faer_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Kraftfahrt-Bundesamt – Fahreignungsregister
          </a>
          <a 
            href="https://www.adac.de/verkehr/recht/bussgeld-punkte/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            ADAC – Bußgeldkatalog
          </a>
        </div>
      </div>
    </div>
  );
}
