import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// GRUNDSTEUER 2025 - Bundesmodell und Ländermodelle
// ═══════════════════════════════════════════════════════════════════════════

// Grundsteuer-Modelle nach Bundesland
const GRUNDSTEUER_MODELLE = {
  // Bundesmodell (Scholz-Modell) - wertabhängig
  bundesmodell: {
    name: 'Bundesmodell',
    beschreibung: 'Wertabhängiges Modell (Bodenrichtwert + Gebäudewert)',
    laender: ['BE', 'BB', 'HB', 'MV', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH'],
    // Steuermesszahl für Wohngrundstücke: 0,31 Promille (§15 GrStG)
    steuermesszahl: {
      wohnen: 0.00031,
      nichtwohnen: 0.00034,
    },
    // Abschläge für Sozialwohnungen: 25%
  },
  // Baden-Württemberg: Bodenwertmodell (nur Grundstückswert)
  badenwuerttemberg: {
    name: 'Bodenwertmodell BW',
    beschreibung: 'Nur Bodenwert zählt (Bodenrichtwert × Fläche)',
    laender: ['BW'],
    steuermesszahl: 0.0013, // 1,3 Promille
  },
  // Bayern: Flächenmodell (wertunabhängig)
  bayern: {
    name: 'Flächenmodell BY',
    beschreibung: 'Nur Flächen zählen (wertunabhängig)',
    laender: ['BY'],
    aequivalenzzahlen: {
      grund: 0.04,     // 4 Cent/m² Grundstück
      wohnen: 0.50,    // 50 Cent/m² Wohnfläche
      nichtwohnen: 0.50, // 50 Cent/m² Nutzfläche
    },
    steuermesszahl: 1.0, // Äquivalenzbeträge direkt
  },
  // Hamburg: Wohnlagemodell
  hamburg: {
    name: 'Wohnlagemodell HH',
    beschreibung: 'Fläche + Wohnlage',
    laender: ['HH'],
    aequivalenzzahlen: {
      grund: 0.04,
      wohnen: 0.70,
      nichtwohnen: 0.70,
    },
    wohnlagenfaktor: {
      normal: 1.0,
      gut: 1.25,
    },
    steuermesszahl: 1.0,
  },
  // Hessen: Flächen-Faktor-Modell
  hessen: {
    name: 'Flächen-Faktor-Modell HE',
    beschreibung: 'Fläche × Lage-Faktor',
    laender: ['HE'],
    aequivalenzzahlen: {
      grund: 0.04,
      wohnen: 0.50,
      nichtwohnen: 0.50,
    },
    steuermesszahl: 1.0,
  },
  // Niedersachsen: Flächen-Lage-Modell  
  niedersachsen: {
    name: 'Flächen-Lage-Modell NI',
    beschreibung: 'Fläche × Lage-Faktor',
    laender: ['NI'],
    aequivalenzzahlen: {
      grund: 0.04,
      wohnen: 0.50,
      nichtwohnen: 0.50,
    },
    steuermesszahl: 1.0,
  },
  // Sachsen: Bundesmodell mit angepasster Steuermesszahl
  sachsen: {
    name: 'Bundesmodell SN (angepasst)',
    beschreibung: 'Bundesmodell mit geänderter Messzahl',
    laender: ['SN'],
    steuermesszahl: {
      wohnen: 0.00036,
      nichtwohnen: 0.00072,
    },
  },
};

// Bundesländer mit typischen Hebesätzen (2025)
const BUNDESLAENDER = [
  { kuerzel: 'BW', name: 'Baden-Württemberg', hebesatzTypisch: 450, modell: 'bodenwertmodell' },
  { kuerzel: 'BY', name: 'Bayern', hebesatzTypisch: 400, modell: 'flaechenmodell' },
  { kuerzel: 'BE', name: 'Berlin', hebesatzTypisch: 470, modell: 'bundesmodell' },
  { kuerzel: 'BB', name: 'Brandenburg', hebesatzTypisch: 400, modell: 'bundesmodell' },
  { kuerzel: 'HB', name: 'Bremen', hebesatzTypisch: 695, modell: 'bundesmodell' },
  { kuerzel: 'HH', name: 'Hamburg', hebesatzTypisch: 540, modell: 'wohnlagemodell' },
  { kuerzel: 'HE', name: 'Hessen', hebesatzTypisch: 500, modell: 'flaechenfaktor' },
  { kuerzel: 'MV', name: 'Mecklenburg-Vorpommern', hebesatzTypisch: 400, modell: 'bundesmodell' },
  { kuerzel: 'NI', name: 'Niedersachsen', hebesatzTypisch: 450, modell: 'flaechenlage' },
  { kuerzel: 'NW', name: 'Nordrhein-Westfalen', hebesatzTypisch: 550, modell: 'bundesmodell' },
  { kuerzel: 'RP', name: 'Rheinland-Pfalz', hebesatzTypisch: 465, modell: 'bundesmodell' },
  { kuerzel: 'SL', name: 'Saarland', hebesatzTypisch: 450, modell: 'bundesmodell' },
  { kuerzel: 'SN', name: 'Sachsen', hebesatzTypisch: 530, modell: 'bundesmodell' },
  { kuerzel: 'ST', name: 'Sachsen-Anhalt', hebesatzTypisch: 400, modell: 'bundesmodell' },
  { kuerzel: 'SH', name: 'Schleswig-Holstein', hebesatzTypisch: 380, modell: 'bundesmodell' },
  { kuerzel: 'TH', name: 'Thüringen', hebesatzTypisch: 450, modell: 'bundesmodell' },
];

// Grundstücksarten
const GRUNDSTUECKSARTEN = [
  { id: 'efh', name: 'Einfamilienhaus', kategorie: 'wohnen' },
  { id: 'zfh', name: 'Zweifamilienhaus', kategorie: 'wohnen' },
  { id: 'mfh', name: 'Mehrfamilienhaus (Mietwohngrundstück)', kategorie: 'wohnen' },
  { id: 'etw', name: 'Eigentumswohnung', kategorie: 'wohnen' },
  { id: 'gemischt', name: 'Gemischt genutztes Grundstück', kategorie: 'gemischt' },
  { id: 'gewerbe', name: 'Geschäftsgrundstück', kategorie: 'nichtwohnen' },
  { id: 'unbebaut', name: 'Unbebautes Grundstück', kategorie: 'nichtwohnen' },
];

// Baujahrsklassen für Bundesmodell
const BAUJAHRSGRUPPEN = [
  { id: 'vor1949', name: 'Vor 1949', alterswertminderung: 0.60 },
  { id: '1949-1969', name: '1949-1969', alterswertminderung: 0.55 },
  { id: '1970-1984', name: '1970-1984', alterswertminderung: 0.50 },
  { id: '1985-1999', name: '1985-1999', alterswertminderung: 0.45 },
  { id: '2000-2015', name: '2000-2015', alterswertminderung: 0.35 },
  { id: 'ab2016', name: 'Ab 2016', alterswertminderung: 0.25 },
];

// Mietpreismultiplikatoren (vereinfacht) für Bundesmodell
const MIETNIVEAUSTUFEN = [
  { stufe: 1, name: 'Stufe 1 (ländlich)', faktor: 0.80 },
  { stufe: 2, name: 'Stufe 2', faktor: 0.90 },
  { stufe: 3, name: 'Stufe 3', faktor: 1.00 },
  { stufe: 4, name: 'Stufe 4', faktor: 1.10 },
  { stufe: 5, name: 'Stufe 5', faktor: 1.20 },
  { stufe: 6, name: 'Stufe 6 (Großstadt)', faktor: 1.35 },
  { stufe: 7, name: 'Stufe 7 (Top-Lage)', faktor: 1.50 },
];

// Rohertragsmultiplikatoren (Vervielfältiger) nach Restnutzungsdauer
const VERVIELFAELTIGER = {
  20: 14.88,
  30: 18.93,
  40: 21.36,
  50: 22.80,
  60: 23.69,
  70: 24.24,
  80: 24.60,
};

export default function GrundsteuerRechner() {
  // Standort
  const [bundesland, setBundesland] = useState('NW');
  const [hebesatz, setHebesatz] = useState(550);
  
  // Grundstück
  const [grundstuecksart, setGrundstuecksart] = useState('efh');
  const [grundstuecksflaeche, setGrundstuecksflaeche] = useState(500);
  const [bodenrichtwert, setBodenrichtwert] = useState(200);
  
  // Gebäude
  const [wohnflaeche, setWohnflaeche] = useState(140);
  const [nutzflaeche, setNutzflaeche] = useState(0);
  const [baujahr, setBaujahr] = useState('2000-2015');
  const [mietniveaustufe, setMietniveaustufe] = useState(3);
  
  // Spezielle Optionen
  const [wohnlageFaktor, setWohnlageFaktor] = useState('normal');
  const [denkmalschutz, setDenkmalschutz] = useState(false);
  const [sozialwohnung, setSozialwohnung] = useState(false);

  const selectedBundesland = BUNDESLAENDER.find(b => b.kuerzel === bundesland);
  const selectedArt = GRUNDSTUECKSARTEN.find(a => a.id === grundstuecksart);
  const istWohngrundstuck = selectedArt?.kategorie === 'wohnen';

  const ergebnis = useMemo(() => {
    const land = BUNDESLAENDER.find(b => b.kuerzel === bundesland);
    if (!land) return null;

    let grundsteuermessbetrag = 0;
    let berechnungsweg: string[] = [];
    let zwischenergebnisse: { [key: string]: number } = {};

    // ═══════════════════════════════════════════════════════════════
    // BERECHNUNG JE NACH MODELL
    // ═══════════════════════════════════════════════════════════════

    if (land.modell === 'flaechenmodell') {
      // ─── BAYERN: Flächenmodell (wertunabhängig) ───
      const grundAequivalent = grundstuecksflaeche * 0.04;
      const wohnAequivalent = wohnflaeche * 0.50;
      const nutzAequivalent = nutzflaeche * 0.50;
      
      grundsteuermessbetrag = grundAequivalent + wohnAequivalent + nutzAequivalent;
      
      zwischenergebnisse = {
        grundAequivalent: Math.round(grundAequivalent * 100) / 100,
        wohnAequivalent: Math.round(wohnAequivalent * 100) / 100,
        nutzAequivalent: Math.round(nutzAequivalent * 100) / 100,
      };
      
      berechnungsweg = [
        `Grundstücksfläche: ${grundstuecksflaeche} m² × 0,04 €/m² = ${zwischenergebnisse.grundAequivalent.toFixed(2)} €`,
        `Wohnfläche: ${wohnflaeche} m² × 0,50 €/m² = ${zwischenergebnisse.wohnAequivalent.toFixed(2)} €`,
        nutzflaeche > 0 ? `Nutzfläche: ${nutzflaeche} m² × 0,50 €/m² = ${zwischenergebnisse.nutzAequivalent.toFixed(2)} €` : '',
        `Äquivalenzbetrag (Messbetrag): ${grundsteuermessbetrag.toFixed(2)} €`,
      ].filter(Boolean);
      
    } else if (land.modell === 'bodenwertmodell') {
      // ─── BADEN-WÜRTTEMBERG: Bodenwertmodell ───
      const bodenwert = grundstuecksflaeche * bodenrichtwert;
      grundsteuermessbetrag = bodenwert * 0.0013; // 1,3 Promille
      
      zwischenergebnisse = {
        bodenwert,
        steuermesszahl: 0.13,
      };
      
      berechnungsweg = [
        `Bodenwert: ${grundstuecksflaeche} m² × ${bodenrichtwert} €/m² = ${bodenwert.toLocaleString('de-DE')} €`,
        `Steuermesszahl: 1,3 ‰ (0,13%)`,
        `Grundsteuermessbetrag: ${bodenwert.toLocaleString('de-DE')} € × 0,0013 = ${grundsteuermessbetrag.toFixed(2)} €`,
      ];
      
    } else if (land.modell === 'wohnlagemodell') {
      // ─── HAMBURG: Wohnlagemodell ───
      const wohnlageMult = wohnlageFaktor === 'gut' ? 1.25 : 1.00;
      const grundAequivalent = grundstuecksflaeche * 0.04;
      const wohnAequivalent = wohnflaeche * 0.70 * wohnlageMult;
      const nutzAequivalent = nutzflaeche * 0.70;
      
      grundsteuermessbetrag = grundAequivalent + wohnAequivalent + nutzAequivalent;
      
      zwischenergebnisse = {
        grundAequivalent: Math.round(grundAequivalent * 100) / 100,
        wohnAequivalent: Math.round(wohnAequivalent * 100) / 100,
        wohnlageMult,
      };
      
      berechnungsweg = [
        `Grundstücksfläche: ${grundstuecksflaeche} m² × 0,04 €/m² = ${zwischenergebnisse.grundAequivalent.toFixed(2)} €`,
        `Wohnfläche: ${wohnflaeche} m² × 0,70 €/m² × ${wohnlageMult} (Wohnlage) = ${zwischenergebnisse.wohnAequivalent.toFixed(2)} €`,
        `Äquivalenzbetrag (Messbetrag): ${grundsteuermessbetrag.toFixed(2)} €`,
      ];
      
    } else if (land.modell === 'flaechenfaktor' || land.modell === 'flaechenlage') {
      // ─── HESSEN / NIEDERSACHSEN: Flächen-Faktor-Modell ───
      // Vereinfacht: Lage-Faktor basiert auf Bodenrichtwert
      const lageFaktor = Math.max(0.5, Math.min(2.0, bodenrichtwert / 150));
      const grundAequivalent = grundstuecksflaeche * 0.04 * lageFaktor;
      const wohnAequivalent = wohnflaeche * 0.50;
      const nutzAequivalent = nutzflaeche * 0.50;
      
      grundsteuermessbetrag = grundAequivalent + wohnAequivalent + nutzAequivalent;
      
      zwischenergebnisse = {
        lageFaktor: Math.round(lageFaktor * 100) / 100,
        grundAequivalent: Math.round(grundAequivalent * 100) / 100,
        wohnAequivalent: Math.round(wohnAequivalent * 100) / 100,
      };
      
      berechnungsweg = [
        `Lage-Faktor (aus Bodenrichtwert): ${zwischenergebnisse.lageFaktor.toFixed(2)}`,
        `Grundstücksfläche: ${grundstuecksflaeche} m² × 0,04 €/m² × ${zwischenergebnisse.lageFaktor.toFixed(2)} = ${zwischenergebnisse.grundAequivalent.toFixed(2)} €`,
        `Wohnfläche: ${wohnflaeche} m² × 0,50 €/m² = ${zwischenergebnisse.wohnAequivalent.toFixed(2)} €`,
        `Äquivalenzbetrag (Messbetrag): ${grundsteuermessbetrag.toFixed(2)} €`,
      ];
      
    } else {
      // ─── BUNDESMODELL (Standard) ───
      // Vereinfachte Berechnung nach Ertragswertverfahren
      
      // 1. Bodenwert
      const bodenwert = grundstuecksflaeche * bodenrichtwert;
      
      // 2. Gebäudeertragswert (vereinfacht)
      const mietniveau = MIETNIVEAUSTUFEN.find(m => m.stufe === mietniveaustufe)?.faktor || 1;
      const baujahrsgruppe = BAUJAHRSGRUPPEN.find(b => b.id === baujahr);
      const alterswertminderung = baujahrsgruppe?.alterswertminderung || 0.40;
      
      // Nettokaltmiete (Rohertrag) - Pauschale pro m² nach Mietniveau
      const basismiete = istWohngrundstuck ? 6.50 : 8.00; // €/m²/Monat (vereinfacht)
      const monatlicheMiete = (wohnflaeche + nutzflaeche) * basismiete * mietniveau;
      const jahresrohertrag = monatlicheMiete * 12;
      
      // Bewirtschaftungskosten pauschal (vereinfacht)
      const bewirtschaftungskosten = jahresrohertrag * 0.20;
      const reinertrag = jahresrohertrag - bewirtschaftungskosten;
      
      // Vervielfältiger (vereinfacht: 50 Jahre Restnutzungsdauer)
      const vervielfaeltiger = VERVIELFAELTIGER[50];
      const rohertragswert = reinertrag * vervielfaeltiger;
      
      // Bodenwertanteil abziehen (vereinfacht: 5% des Bodenwerts)
      const bodenwertVerzinsung = bodenwert * 0.05;
      const gebaeudewert = Math.max(0, rohertragswert - bodenwertVerzinsung * vervielfaeltiger);
      
      // Alterswertminderung
      const gebaeudewertNachAlter = gebaeudewert * (1 - alterswertminderung);
      
      // Gesamtgrundsteuerwert
      const grundsteuerwert = bodenwert + gebaeudewertNachAlter;
      
      // Steuermesszahl
      let steuermesszahl = istWohngrundstuck ? 0.00031 : 0.00034;
      
      // Sachsen hat eigene Messzahlen
      if (bundesland === 'SN') {
        steuermesszahl = istWohngrundstuck ? 0.00036 : 0.00072;
      }
      
      // Abschläge
      let abschlag = 1.0;
      if (sozialwohnung && istWohngrundstuck) {
        abschlag = 0.75; // 25% Abschlag
      }
      if (denkmalschutz) {
        abschlag *= 0.90; // 10% Abschlag
      }
      
      grundsteuermessbetrag = grundsteuerwert * steuermesszahl * abschlag;
      
      zwischenergebnisse = {
        bodenwert,
        jahresrohertrag: Math.round(jahresrohertrag),
        reinertrag: Math.round(reinertrag),
        vervielfaeltiger,
        gebaeudewert: Math.round(gebaeudewertNachAlter),
        grundsteuerwert: Math.round(grundsteuerwert),
        steuermesszahl: steuermesszahl * 1000,
      };
      
      berechnungsweg = [
        `Bodenwert: ${grundstuecksflaeche} m² × ${bodenrichtwert} €/m² = ${bodenwert.toLocaleString('de-DE')} €`,
        `Jahresrohertrag (Miete): ${jahresrohertrag.toLocaleString('de-DE')} €`,
        `Reinertrag (nach Bewirtschaftungskosten): ${reinertrag.toLocaleString('de-DE')} €`,
        `Vervielfältiger (50 J.): ${vervielfaeltiger}`,
        `Gebäudeertragswert (nach Alter): ${gebaeudewertNachAlter.toLocaleString('de-DE')} €`,
        `Grundsteuerwert: ${grundsteuerwert.toLocaleString('de-DE')} €`,
        `Steuermesszahl: ${(steuermesszahl * 1000).toFixed(2)} ‰ ${istWohngrundstuck ? '(Wohngrundstück)' : '(Nichtwohngrundstück)'}`,
        abschlag < 1 ? `Abschlag: ${((1 - abschlag) * 100).toFixed(0)}%` : '',
        `Grundsteuermessbetrag: ${grundsteuermessbetrag.toFixed(2)} €`,
      ].filter(Boolean);
    }

    // ═══════════════════════════════════════════════════════════════
    // FINALE BERECHNUNG
    // ═══════════════════════════════════════════════════════════════
    
    const grundsteuerJahr = grundsteuermessbetrag * (hebesatz / 100);
    const grundsteuerQuartal = grundsteuerJahr / 4;
    const grundsteuerMonat = grundsteuerJahr / 12;

    return {
      modell: land.modell,
      modellName: getModellName(land.modell),
      grundsteuermessbetrag: Math.round(grundsteuermessbetrag * 100) / 100,
      hebesatz,
      grundsteuerJahr: Math.round(grundsteuerJahr * 100) / 100,
      grundsteuerQuartal: Math.round(grundsteuerQuartal * 100) / 100,
      grundsteuerMonat: Math.round(grundsteuerMonat * 100) / 100,
      berechnungsweg,
      zwischenergebnisse,
    };
  }, [
    bundesland, hebesatz, grundstuecksart, grundstuecksflaeche, bodenrichtwert,
    wohnflaeche, nutzflaeche, baujahr, mietniveaustufe, wohnlageFaktor,
    denkmalschutz, sozialwohnung, istWohngrundstuck
  ]);

  function getModellName(modell: string): string {
    switch (modell) {
      case 'flaechenmodell': return 'Flächenmodell (Bayern)';
      case 'bodenwertmodell': return 'Bodenwertmodell (Baden-Württemberg)';
      case 'wohnlagemodell': return 'Wohnlagemodell (Hamburg)';
      case 'flaechenfaktor': return 'Flächen-Faktor-Modell (Hessen)';
      case 'flaechenlage': return 'Flächen-Lage-Modell (Niedersachsen)';
      default: return 'Bundesmodell';
    }
  }

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Standort */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📍</span> Standort & Hebesatz
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bundesland
            </label>
            <select
              value={bundesland}
              onChange={(e) => {
                setBundesland(e.target.value);
                const land = BUNDESLAENDER.find(b => b.kuerzel === e.target.value);
                if (land) setHebesatz(land.hebesatzTypisch);
              }}
              className="w-full py-3 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
            >
              {BUNDESLAENDER.map(b => (
                <option key={b.kuerzel} value={b.kuerzel}>{b.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hebesatz Ihrer Gemeinde (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={hebesatz}
                onChange={(e) => setHebesatz(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                min="0"
                step="10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="10"
              value={hebesatz}
              onChange={(e) => setHebesatz(Number(e.target.value))}
              className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Typischer Hebesatz in {selectedBundesland?.name}: {selectedBundesland?.hebesatzTypisch}%
            </p>
          </div>
          
          {/* Modell-Info */}
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm font-medium text-blue-800">
              📋 Berechnungsmodell: {ergebnis?.modellName}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {selectedBundesland?.modell === 'flaechenmodell' 
                ? 'Nur Flächen zählen – der Grundstückswert spielt keine Rolle'
                : selectedBundesland?.modell === 'bodenwertmodell'
                ? 'Nur der Bodenwert zählt – Gebäude werden nicht bewertet'
                : 'Bodenwert + Gebäudeertragswert fließen in die Berechnung ein'}
            </p>
          </div>
        </div>
      </div>

      {/* Grundstück */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🏠</span> Grundstück & Gebäude
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grundstücksart
            </label>
            <select
              value={grundstuecksart}
              onChange={(e) => setGrundstuecksart(e.target.value)}
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
            >
              {GRUNDSTUECKSARTEN.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grundstücksfläche
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={grundstuecksflaeche}
                  onChange={(e) => setGrundstuecksflaeche(Math.max(0, Number(e.target.value)))}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bodenrichtwert
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bodenrichtwert}
                  onChange={(e) => setBodenrichtwert(Math.max(0, Number(e.target.value)))}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€/m²</span>
              </div>
              <a 
                href="https://www.boris.nrw.de" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Bodenrichtwert nachschlagen →
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wohnfläche
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={wohnflaeche}
                  onChange={(e) => setWohnflaeche(Math.max(0, Number(e.target.value)))}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nutzfläche (Gewerbe)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={nutzflaeche}
                  onChange={(e) => setNutzflaeche(Math.max(0, Number(e.target.value)))}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m²</span>
              </div>
            </div>
          </div>
          
          {/* Nur für Bundesmodell relevant */}
          {selectedBundesland?.modell === 'bundesmodell' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Baujahr
                  </label>
                  <select
                    value={baujahr}
                    onChange={(e) => setBaujahr(e.target.value)}
                    className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  >
                    {BAUJAHRSGRUPPEN.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mietniveau-Stufe
                  </label>
                  <select
                    value={mietniveaustufe}
                    onChange={(e) => setMietniveaustufe(Number(e.target.value))}
                    className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  >
                    {MIETNIVEAUSTUFEN.map(m => (
                      <option key={m.stufe} value={m.stufe}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sozialwohnung}
                    onChange={(e) => setSozialwohnung(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Sozialwohnung (25% Abschlag)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={denkmalschutz}
                    onChange={(e) => setDenkmalschutz(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Denkmalschutz (10% Abschlag)</span>
                </label>
              </div>
            </>
          )}
          
          {/* Nur für Hamburg */}
          {bundesland === 'HH' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wohnlage</label>
              <div className="grid grid-cols-2 gap-3">
                {['normal', 'gut'].map((lage) => (
                  <button
                    key={lage}
                    onClick={() => setWohnlageFaktor(lage)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      wohnlageFaktor === lage
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {lage === 'normal' ? 'Normale Lage' : 'Gute Lage (+25%)'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      {ergebnis && (
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium text-yellow-200 mb-1">Neue Grundsteuer ab 2025</h3>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuro(ergebnis.grundsteuerJahr)}</span>
              <span className="text-yellow-200">/Jahr</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-yellow-200 text-xs block">Quartal</span>
              <span className="text-xl font-bold">{formatEuro(ergebnis.grundsteuerQuartal)}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-yellow-200 text-xs block">Monat</span>
              <span className="text-xl font-bold">{formatEuro(ergebnis.grundsteuerMonat)}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <span className="text-yellow-200 text-xs block">Messbetrag</span>
              <span className="text-xl font-bold">{formatEuro(ergebnis.grundsteuermessbetrag)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Berechnungsweg */}
      {ergebnis && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsweg ({ergebnis.modellName})</h3>
          
          <div className="space-y-2">
            {ergebnis.berechnungsweg.map((schritt, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-600">
                <span className="text-blue-500 font-bold">{i + 1}.</span>
                <span>{schritt}</span>
              </div>
            ))}
            
            <div className="pt-3 border-t border-gray-200 mt-3">
              <div className="flex justify-between items-center font-medium">
                <span>× Hebesatz</span>
                <span>{hebesatz}%</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-orange-600 mt-2">
                <span>= Grundsteuer/Jahr</span>
                <span>{formatEuro(ergebnis.grundsteuerJahr)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
            <strong>Formel:</strong> Grundsteuermessbetrag × Hebesatz = Grundsteuer
          </div>
        </div>
      )}

      {/* Modell-Erklärung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">ℹ️ Die Grundsteuer-Modelle 2025</h3>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div className="p-3 bg-blue-50 rounded-xl">
            <p className="font-medium text-blue-800">🏛️ Bundesmodell (11 Länder)</p>
            <p className="text-blue-700 mt-1">
              Kombiniert Bodenwert + Gebäudeertragswert. Berücksichtigt Mietniveau, Baujahr und Lage.
              <br /><span className="text-xs">Berlin, Brandenburg, Bremen, MV, NRW, RP, Saarland, Sachsen, Sachsen-Anhalt, SH, Thüringen</span>
            </p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-xl">
            <p className="font-medium text-green-800">🏔️ Flächenmodell (Bayern)</p>
            <p className="text-green-700 mt-1">
              Nur Flächen zählen – völlig wertunabhängig! 4 Cent/m² Grundstück, 50 Cent/m² Wohnfläche.
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-xl">
            <p className="font-medium text-purple-800">🍇 Bodenwertmodell (Baden-Württemberg)</p>
            <p className="text-purple-700 mt-1">
              Nur der Bodenwert zählt – Gebäude werden nicht bewertet. 1,3 ‰ Steuermesszahl.
            </p>
          </div>
          
          <div className="p-3 bg-orange-50 rounded-xl">
            <p className="font-medium text-orange-800">⚓ Wohnlagemodell (Hamburg)</p>
            <p className="text-orange-700 mt-1">
              Flächenmodell mit Wohnlagenfaktor – gute Lagen zahlen 25% mehr.
            </p>
          </div>
          
          <div className="p-3 bg-teal-50 rounded-xl">
            <p className="font-medium text-teal-800">🏛️ Flächen-Faktor (Hessen, Niedersachsen)</p>
            <p className="text-teal-700 mt-1">
              Flächenmodell mit Lage-Faktor basierend auf Bodenrichtwert.
            </p>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span>Die <strong>neue Grundsteuer</strong> gilt seit dem 1. Januar 2025 – alle Grundstücke wurden neu bewertet</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Der <strong>Hebesatz</strong> wird von Ihrer Gemeinde festgelegt und kann stark variieren</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Viele Gemeinden haben die Hebesätze <strong>angepasst</strong> – prüfen Sie den aktuellen Satz!</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Diese Berechnung ist eine <strong>Schätzung</strong> – den exakten Betrag entnehmen Sie dem Grundsteuerbescheid</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Bodenrichtwert</strong> finden Sie im BORIS-Portal Ihres Bundeslandes (meist kostenlos)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Grundsteuer B (bebaute Grundstücke) – für Land- und Forstwirtschaft gilt Grundsteuer A</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörden */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden & Informationen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Finanzamt</p>
              <p className="text-gray-500">Feststellung des Grundsteuerwerts</p>
              <a 
                href="https://www.elster.de/eportal/formulare-leistungen/alleformulare/grundsteuer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ELSTER Grundsteuer →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🏘️</span>
            <div>
              <p className="font-medium text-gray-800">Gemeinde/Stadt</p>
              <p className="text-gray-500">Hebesatz & Grundsteuerbescheid</p>
              <p className="text-xs text-gray-400 mt-1">Kontakt: Steueramt Ihrer Gemeinde</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🗺️</span>
            <div>
              <p className="font-medium text-gray-800">Bodenrichtwert (BORIS)</p>
              <p className="text-gray-500">Offizielle Bodenrichtwerte</p>
              <a 
                href="https://www.bodenrichtwerte-boris.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                boris.de Portal →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Grundsteuer-Hotline</p>
              <p className="text-gray-500">Fragen zur Grundsteuererklärung</p>
              <p className="text-xs text-gray-400 mt-1">Hotline Ihres Bundeslandes nutzen</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">❓ Häufige Fragen</h3>
        
        <div className="space-y-4">
          <details className="group">
            <summary className="font-medium text-gray-700 cursor-pointer hover:text-blue-600">
              Wann muss ich die neue Grundsteuer zahlen?
            </summary>
            <p className="mt-2 text-sm text-gray-600 pl-4">
              Die neue Grundsteuer wird seit dem 1. Januar 2025 erhoben. Fälligkeitstermine sind 
              üblicherweise: 15.2., 15.5., 15.8. und 15.11. (Quartalsweise) oder auf Antrag in 
              einem Jahresbetrag zum 1. Juli.
            </p>
          </details>
          
          <details className="group">
            <summary className="font-medium text-gray-700 cursor-pointer hover:text-blue-600">
              Steigt meine Grundsteuer durch die Reform?
            </summary>
            <p className="mt-2 text-sm text-gray-600 pl-4">
              Das hängt vom Bundesland, der Lage und dem Hebesatz ab. In teuren Lagen mit hohem 
              Bodenrichtwert kann die Grundsteuer steigen. Viele Gemeinden haben die Hebesätze 
              angepasst, um Aufkommensneutralität zu erreichen.
            </p>
          </details>
          
          <details className="group">
            <summary className="font-medium text-gray-700 cursor-pointer hover:text-blue-600">
              Wo finde ich meinen Bodenrichtwert?
            </summary>
            <p className="mt-2 text-sm text-gray-600 pl-4">
              Im BORIS-Portal Ihres Bundeslandes (z.B. boris.nrw.de für NRW). Die Werte sind 
              meist kostenlos einsehbar. Alternativ beim Gutachterausschuss Ihrer Gemeinde.
            </p>
          </details>
          
          <details className="group">
            <summary className="font-medium text-gray-700 cursor-pointer hover:text-blue-600">
              Kann ich Einspruch gegen den Grundsteuerbescheid einlegen?
            </summary>
            <p className="mt-2 text-sm text-gray-600 pl-4">
              Ja, innerhalb eines Monats nach Bekanntgabe. Einspruch beim Finanzamt gegen den 
              Grundsteuerwertbescheid, beim Gemeinde-Steueramt gegen den Grundsteuerbescheid.
            </p>
          </details>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/grstg_1973/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Grundsteuergesetz (GrStG)
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Grundsteuer/grundsteuer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Grundsteuer-Reform
          </a>
          <a 
            href="https://www.grundsteuer.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            grundsteuer.de – Offizielles Portal
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/bewg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bewertungsgesetz (BewG)
          </a>
        </div>
      </div>
    </div>
  );
}
