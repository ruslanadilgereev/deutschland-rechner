import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ============================================================================
// Wohngeld-Berechnung 2025/2026 nach Wohngeldgesetz (WoGG)
// ============================================================================
// Rechtsgrundlage: Wohngeldgesetz (WoGG) in der Fassung ab 01.01.2023 (Wohngeld-Plus)
// - § 12 WoGG: Höchstbeträge für Miete und Belastung
// - § 19 WoGG: Wohngeldformel
// - Anlage 1 zu § 12: Höchstbeträge nach Mietstufen
// - Anlage 2 zu § 19: Koeffizienten a, b, c
// - Anlage 3 zu § 19: Rechenschritte und Rundungen
//
// Quellen:
// - https://www.gesetze-im-internet.de/wogg/
// - https://www.wohngeld.org/wohngeldgesetz-wogg/paragraph19/
// - https://www.wohngeld.org/wohngeldgesetz-wogg/anlage2/
// - https://www.wohngeld.org/wohnkosten/ (Höchstbeträge 2025/2026)
// ============================================================================

// Mietstufen I-VII nach Gemeinde
const MIETSTUFEN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;
type Mietstufe = typeof MIETSTUFEN[number];

// ============================================================================
// HÖCHSTBETRÄGE 2025/2026 nach § 12 WoGG (Grundbetrag + Heizkosten + Klima)
// Stand: 01.01.2025, gültig auch für 2026
// Quelle: https://www.wohngeld.org/wohnkosten/
// ============================================================================
// Format: [1 Person, 2 Personen, 3 Personen, 4 Personen, 5 Personen]
// Für weitere Personen: +MEHRBETRAG pro Person
const HOECHSTBETRAEGE: Record<Mietstufe, number[]> = {
  'I':   [490.60, 604.40, 720.80, 840.20, 958.60],
  'II':  [537.60, 660.40, 786.80, 918.20, 1046.60],
  'III': [585.60, 718.40, 856.80, 998.20, 1139.60],
  'IV':  [640.60, 786.40, 936.80, 1090.20, 1246.60],
  'V':   [691.60, 847.40, 1008.80, 1178.20, 1344.60],
  'VI':  [744.60, 912.40, 1086.80, 1267.20, 1447.60],
  'VII': [806.60, 987.40, 1174.80, 1371.20, 1566.60],
};

// Mehrbetrag pro weiteres Haushaltsmitglied ab 6. Person
const MEHRBETRAG_PRO_PERSON: Record<Mietstufe, number> = {
  'I': 114.40,
  'II': 126.40,
  'III': 138.40,
  'IV': 151.40,
  'V': 161.40,
  'VI': 181.40,
  'VII': 195.40,
};

// ============================================================================
// KOEFFIZIENTEN a, b, c nach Anlage 2 zu § 19 Abs. 1 WoGG
// EXAKTE WERTE aus dem Gesetzestext!
// Quelle: https://www.wohngeld.org/wohngeldgesetz-wogg/anlage2/
// ============================================================================
// E-1 = geteilt durch 10
// E-2 = geteilt durch 100
// E-4 = geteilt durch 10.000
// E-5 = geteilt durch 100.000
const KOEFFIZIENTEN: Record<number, { a: number; b: number; c: number }> = {
  1:  { a: 4.000e-2,   b: 4.991e-4,  c: 4.620e-5 },  // 0.04, 0.0004991, 0.0000462
  2:  { a: 3.000e-2,   b: 3.716e-4,  c: 3.450e-5 },  // 0.03, 0.0003716, 0.0000345
  3:  { a: 2.000e-2,   b: 3.035e-4,  c: 2.780e-5 },  // 0.02, 0.0003035, 0.0000278
  4:  { a: 1.000e-2,   b: 2.251e-4,  c: 2.000e-5 },  // 0.01, 0.0002251, 0.00002
  5:  { a: 0,          b: 1.985e-4,  c: 1.950e-5 },  // 0, 0.0001985, 0.0000195
  6:  { a: -1.000e-2,  b: 1.792e-4,  c: 1.880e-5 },  // -0.01, 0.0001792, 0.0000188
  7:  { a: -2.000e-2,  b: 1.657e-4,  c: 1.870e-5 },  // -0.02, 0.0001657, 0.0000187
  8:  { a: -3.000e-2,  b: 1.648e-4,  c: 1.870e-5 },  // -0.03, 0.0001648, 0.0000187
  9:  { a: -4.000e-2,  b: 1.432e-4,  c: 1.880e-5 },  // -0.04, 0.0001432, 0.0000188
  10: { a: -6.000e-2,  b: 1.300e-4,  c: 1.880e-5 },  // -0.06, 0.00013, 0.0000188
  11: { a: -9.000e-2,  b: 1.188e-4,  c: 2.220e-5 },  // -0.09, 0.0001188, 0.0000222
  12: { a: -1.200e-1,  b: 1.152e-4,  c: 2.510e-5 },  // -0.12, 0.0001152, 0.0000251
};

// Zusatzbetrag für jedes weitere Haushaltsmitglied ab 13. Person (§ 19 Abs. 3 WoGG)
const ZUSATZ_AB_13_PERSON = 57; // Euro pro Person

// ============================================================================
// FREIBETRÄGE vom Einkommen nach § 17 WoGG
// ============================================================================
const FREIBETRAEGE = {
  // Werbungskostenpauschale (jährlich, § 16 Abs. 1 Nr. 2 WoGG)
  werbungskosten_pauschal: 1230, // 102.50€/Monat
  
  // Erwerbstätigenfreibetrag (§ 17 Nr. 3 WoGG): 10% vom Brutto, max. 100€/Monat = 1200€/Jahr
  erwerbstaetig_prozent: 0.10,
  erwerbstaetig_max_jahr: 1200,
  
  // Schwerbehinderten-Pauschbetrag (§ 17 Nr. 4 WoGG, jährlich)
  schwerbehindert_50_80: 1800,   // GdB 50-80
  schwerbehindert_80_100: 2100,  // GdB 80-100 oder häusliche Pflege
  
  // Alleinerziehenden-Freibetrag (§ 17 Nr. 5 WoGG, jährlich pro Kind)
  alleinerziehend: 1320,
};

// Beispielstädte nach Mietstufen (zur Orientierung)
const BEISPIELSTAEDTE: Record<Mietstufe, string[]> = {
  'I':   ['Chemnitz', 'Halle (Saale)', 'Magdeburg', 'Gera', 'Cottbus'],
  'II':  ['Leipzig', 'Dresden', 'Erfurt', 'Rostock', 'Kiel'],
  'III': ['Hannover', 'Bremen', 'Dortmund', 'Essen', 'Duisburg'],
  'IV':  ['Köln', 'Düsseldorf', 'Hamburg', 'Nürnberg', 'Bonn'],
  'V':   ['Berlin', 'Potsdam', 'Mainz', 'Wiesbaden'],
  'VI':  ['Frankfurt a.M.', 'Stuttgart', 'Freiburg', 'Heidelberg'],
  'VII': ['München', 'Starnberg', 'Miesbach', 'Garmisch-Partenkirchen'],
};

// Einkommensgrenzen für Wohngeld 2025/2026 (monatlich, ca. Richtwerte)
// Quelle: https://www.wohngeld.org/einkommen/
const EINKOMMENSGRENZEN: Record<Mietstufe, number[]> = {
  'I':   [1443, 1953, 2453, 3324, 3822],
  'II':  [1530, 2074, 2610, 3542, 4077],
  'III': [1620, 2199, 2773, 3769, 4341],
  'IV':  [1713, 2327, 2942, 4004, 4617],
  'V':   [1803, 2451, 3104, 4229, 4880],
  'VI':  [1896, 2580, 3273, 4465, 5158],
  'VII': [1992, 2715, 3451, 4714, 5451],
};

// Höchstbetrag berechnen (für Haushaltsgrößen > 5)
function getHoechstbetrag(mietstufe: Mietstufe, personen: number): number {
  if (personen <= 5) {
    return HOECHSTBETRAEGE[mietstufe][personen - 1];
  }
  // Ab 6 Personen: Höchstbetrag für 5 + Mehrbetrag pro weitere Person
  const basis = HOECHSTBETRAEGE[mietstufe][4]; // 5-Personen-Haushalt
  const mehrbetrag = MEHRBETRAG_PRO_PERSON[mietstufe] * (personen - 5);
  return basis + mehrbetrag;
}

// Einkommensgrenze berechnen (für Haushaltsgrößen > 5)
function getEinkommensgrenze(mietstufe: Mietstufe, personen: number): number {
  if (personen <= 5) {
    return EINKOMMENSGRENZEN[mietstufe][personen - 1];
  }
  // Näherung: +500€ pro weitere Person
  return EINKOMMENSGRENZEN[mietstufe][4] + (personen - 5) * 500;
}

export default function WohngeldRechner() {
  // Eingabewerte
  const [bruttoeinkommen, setBruttoeinkommen] = useState(1800);
  const [warmmiete, setWarmmiete] = useState(650);
  const [haushaltsgroesse, setHaushaltsgroesse] = useState(2);
  const [mietstufe, setMietstufe] = useState<Mietstufe>('III');
  const [schwerbehindert, setSchwerbehindert] = useState<'none' | '50-80' | '80-100'>('none');
  const [alleinerziehend, setAlleinerziehend] = useState(false);
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const [istErwerbstaetig, setIstErwerbstaetig] = useState(true);

  const ergebnis = useMemo(() => {
    // ========================================================================
    // 1. Anrechenbares Einkommen berechnen (§§ 14-17 WoGG)
    // ========================================================================
    const jahresbrutto = bruttoeinkommen * 12;
    
    // Werbungskostenpauschale (§ 16 Abs. 1 Nr. 2 WoGG)
    const werbungskosten = FREIBETRAEGE.werbungskosten_pauschal;
    
    // Erwerbstätigenfreibetrag: 10% vom Brutto, max. 1200€/Jahr (§ 17 Nr. 3 WoGG)
    const erwerbstaetigenfreibetrag = istErwerbstaetig 
      ? Math.min(jahresbrutto * FREIBETRAEGE.erwerbstaetig_prozent, FREIBETRAEGE.erwerbstaetig_max_jahr)
      : 0;
    
    // Freibeträge für Schwerbehinderte (§ 17 Nr. 4 WoGG)
    let schwerbehindertenfreibetrag = 0;
    if (schwerbehindert === '50-80') {
      schwerbehindertenfreibetrag = FREIBETRAEGE.schwerbehindert_50_80;
    } else if (schwerbehindert === '80-100') {
      schwerbehindertenfreibetrag = FREIBETRAEGE.schwerbehindert_80_100;
    }
    
    // Alleinerziehenden-Freibetrag (§ 17 Nr. 5 WoGG)
    const alleinerziehendenfreibetrag = alleinerziehend 
      ? FREIBETRAEGE.alleinerziehend * Math.max(1, anzahlKinder)
      : 0;
    
    const gesamtfreibetraege = werbungskosten + erwerbstaetigenfreibetrag + 
                               schwerbehindertenfreibetrag + alleinerziehendenfreibetrag;
    
    // Anrechenbares Jahreseinkommen
    const anrechenbaresEinkommenJahr = Math.max(0, jahresbrutto - gesamtfreibetraege);
    const anrechenbaresEinkommenMonat = anrechenbaresEinkommenJahr / 12;
    
    // ========================================================================
    // 2. Berücksichtigte Miete (M) - max. Höchstbetrag nach § 12 WoGG
    // ========================================================================
    const hoechstbetrag = getHoechstbetrag(mietstufe, haushaltsgroesse);
    
    // M = min(tatsächliche Miete, Höchstbetrag)
    // Die Höchstbeträge enthalten bereits Heizkosten- und Klimakomponente!
    const beruecksichtigteMiete = Math.min(warmmiete, hoechstbetrag);
    
    // ========================================================================
    // 3. Wohngeld-Berechnung nach § 19 Abs. 1 WoGG
    // ========================================================================
    // Formel: Wohngeld = 1,15 × (M − (a + b×M + c×Y) × Y) Euro
    // M = berücksichtigte monatliche Miete
    // Y = monatliches Gesamteinkommen
    
    const anzahlPersonen = Math.min(haushaltsgroesse, 12);
    const koeff = KOEFFIZIENTEN[anzahlPersonen];
    
    const M = beruecksichtigteMiete;
    const Y = anrechenbaresEinkommenMonat;
    
    // Rechenschritte nach Anlage 3 zu § 19 WoGG
    // z1 = a + b × M + c × Y
    const z1 = koeff.a + koeff.b * M + koeff.c * Y;
    
    // z2 = z1 × Y
    const z2 = z1 * Y;
    
    // z3 = M − z2
    const z3 = M - z2;
    
    // z4 = 1,15 × z3 (ungerundetes Wohngeld)
    const z4 = 1.15 * z3;
    
    // Zusatz für Haushalte > 12 Personen (§ 19 Abs. 3 WoGG)
    let zusatzAbPerson13 = 0;
    if (haushaltsgroesse > 12) {
      zusatzAbPerson13 = (haushaltsgroesse - 12) * ZUSATZ_AB_13_PERSON;
    }
    
    // Aufrunden auf vollen Euro (Anlage 3, Nr. 3)
    // Mindest-Wohngeld: 10€, Maximum: berücksichtigte Miete
    let wohngeldMonatlich = Math.ceil(z4) + zusatzAbPerson13;
    
    // Wohngeld darf nicht höher als die berücksichtigte Miete sein
    wohngeldMonatlich = Math.min(wohngeldMonatlich, M);
    
    // Mindest-Wohngeld: 10€, sonst kein Anspruch
    if (wohngeldMonatlich < 10) {
      wohngeldMonatlich = 0;
    }
    
    // ========================================================================
    // 4. Anspruchsprüfung
    // ========================================================================
    const einkommensgrenze = getEinkommensgrenze(mietstufe, haushaltsgroesse);
    const hatAnspruch = wohngeldMonatlich >= 10;
    
    // Jahreswohngeld
    const wohngeldJaehrlich = wohngeldMonatlich * 12;
    
    return {
      // Einkommen
      bruttoMonat: bruttoeinkommen,
      bruttoJahr: jahresbrutto,
      werbungskosten,
      erwerbstaetigenfreibetrag: Math.round(erwerbstaetigenfreibetrag),
      schwerbehindertenfreibetrag,
      alleinerziehendenfreibetrag,
      gesamtfreibetraege: Math.round(gesamtfreibetraege),
      anrechenbaresEinkommenJahr: Math.round(anrechenbaresEinkommenJahr),
      anrechenbaresEinkommenMonat: Math.round(anrechenbaresEinkommenMonat),
      
      // Miete
      warmmiete,
      hoechstbetrag,
      beruecksichtigteMiete,
      mieteGekappt: warmmiete > hoechstbetrag,
      
      // Formel-Zwischenwerte (für Nachvollziehbarkeit)
      koeffizienten: koeff,
      z1: z1.toFixed(10),
      z2: z2.toFixed(2),
      z3: z3.toFixed(2),
      z4Ungerundet: z4.toFixed(2),
      
      // Ergebnis
      wohngeldMonatlich,
      wohngeldJaehrlich,
      hatAnspruch,
      einkommensgrenze,
      
      // Zusatzinfo
      mietstufe,
      haushaltsgroesse,
    };
  }, [bruttoeinkommen, warmmiete, haushaltsgroesse, mietstufe, schwerbehindert, alleinerziehend, anzahlKinder, istErwerbstaetig]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatEuro2 = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Haushaltsgröße */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Haushaltsgröße</span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setHaushaltsgroesse(Math.max(1, haushaltsgroesse - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-gray-800">{haushaltsgroesse}</div>
              <div className="text-sm text-gray-500">
                {haushaltsgroesse === 1 ? 'Person' : 'Personen'}
              </div>
            </div>
            <button
              onClick={() => setHaushaltsgroesse(Math.min(12, haushaltsgroesse + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Bruttoeinkommen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliches Bruttoeinkommen (Haushalt gesamt)</span>
            <span className="text-xs text-gray-500 block mt-1">Alle Einkünfte vor Steuern</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttoeinkommen}
              onChange={(e) => setBruttoeinkommen(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="10000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={bruttoeinkommen}
            onChange={(e) => setBruttoeinkommen(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="0"
            max="5000"
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>2.500 €</span>
            <span>5.000 €</span>
          </div>
        </div>

        {/* Warmmiete */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliche Warmmiete</span>
            <span className="text-xs text-gray-500 block mt-1">Kaltmiete + Nebenkosten + Heizung</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={warmmiete}
              onChange={(e) => setWarmmiete(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="3000"
              step="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
          <input
            type="range"
            value={warmmiete}
            onChange={(e) => setWarmmiete(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="200"
            max="2000"
            step="10"
          />
          {ergebnis.mieteGekappt && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Höchstbetrag für Mietstufe {mietstufe}: {formatEuro2(ergebnis.hoechstbetrag)}
            </p>
          )}
        </div>

        {/* Mietstufe */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Mietstufe Ihres Wohnorts</span>
            <span className="text-xs text-gray-500 block mt-1">Nach § 12 WoGG – je höher, desto teurer die Region</span>
          </label>
          <div className="grid grid-cols-7 gap-2">
            {MIETSTUFEN.map((stufe) => (
              <button
                key={stufe}
                onClick={() => setMietstufe(stufe)}
                className={`py-3 px-2 rounded-xl text-center transition-all ${
                  mietstufe === stufe
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-bold">{stufe}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-purple-50 rounded-xl">
            <p className="text-xs text-purple-700">
              <strong>Beispiele für Mietstufe {mietstufe}:</strong>{' '}
              {BEISPIELSTAEDTE[mietstufe].join(', ')}
            </p>
            <a
              href="https://www.wohngeld.org/mietstufe/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:underline mt-1 inline-block"
            >
              → Alle Mietstufen nachschlagen
            </a>
          </div>
        </div>

        {/* Erwerbstätigkeit */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Erwerbstätigkeit</span>
          </label>
          <button
            onClick={() => setIstErwerbstaetig(!istErwerbstaetig)}
            className={`w-full py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-between ${
              istErwerbstaetig
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>
              {istErwerbstaetig 
                ? '✓ Mindestens ein Haushaltsmitglied ist erwerbstätig' 
                : '✗ Keine Erwerbstätigkeit im Haushalt'}
            </span>
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Erwerbstätige erhalten einen Freibetrag von 10% (max. 100€/Monat)
          </p>
        </div>

        {/* Freibeträge */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Zusätzliche Freibeträge</span>
          </label>
          
          {/* Schwerbehinderung */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 block mb-2">Schwerbehinderung (GdB)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSchwerbehindert('none')}
                className={`py-3 px-4 rounded-xl text-sm transition-all ${
                  schwerbehindert === 'none'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Keine
              </button>
              <button
                onClick={() => setSchwerbehindert('50-80')}
                className={`py-3 px-4 rounded-xl text-sm transition-all ${
                  schwerbehindert === '50-80'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                GdB 50-80
              </button>
              <button
                onClick={() => setSchwerbehindert('80-100')}
                className={`py-3 px-4 rounded-xl text-sm transition-all ${
                  schwerbehindert === '80-100'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                GdB 80-100
              </button>
            </div>
          </div>

          {/* Alleinerziehend */}
          <div className="mb-4">
            <button
              onClick={() => setAlleinerziehend(!alleinerziehend)}
              className={`w-full py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-between ${
                alleinerziehend
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>👨‍👧 Alleinerziehend</span>
              <span className={alleinerziehend ? 'opacity-80' : ''}>
                {alleinerziehend ? '+110€/Monat pro Kind' : ''}
              </span>
            </button>
          </div>

          {/* Anzahl Kinder (nur wenn alleinerziehend) */}
          {alleinerziehend && (
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
              <span className="text-sm text-purple-700">Anzahl Kinder:</span>
              <button
                onClick={() => setAnzahlKinder(Math.max(1, anzahlKinder - 1))}
                className="w-10 h-10 rounded-xl bg-white hover:bg-purple-100 text-lg font-bold transition-colors"
              >
                −
              </button>
              <span className="text-xl font-bold text-purple-800 w-8 text-center">{anzahlKinder || 1}</span>
              <button
                onClick={() => setAnzahlKinder(Math.min(6, anzahlKinder + 1))}
                className="w-10 h-10 rounded-xl bg-white hover:bg-purple-100 text-lg font-bold transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.hatAnspruch 
          ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
          : 'bg-gradient-to-br from-gray-400 to-gray-500'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          {ergebnis.hatAnspruch ? '🏠 Ihr voraussichtliches Wohngeld' : '❌ Kein Wohngeld-Anspruch'}
        </h3>
        
        {ergebnis.hatAnspruch ? (
          <>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatEuro(ergebnis.wohngeldMonatlich)}</span>
                <span className="text-xl opacity-80">/ Monat</span>
              </div>
              <p className="text-purple-100 mt-2 text-sm">
                Das sind <strong>{formatEuro(ergebnis.wohngeldJaehrlich)}</strong> pro Jahr Mietzuschuss vom Staat!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Pro Jahr</span>
                <div className="text-xl font-bold">{formatEuro(ergebnis.wohngeldJaehrlich)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Mietentlastung</span>
                <div className="text-xl font-bold">
                  {Math.round((ergebnis.wohngeldMonatlich / warmmiete) * 100)}%
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-4">
            <p className="text-white/90">
              Mit einem anrechenbaren Einkommen von <strong>{formatEuro(ergebnis.anrechenbaresEinkommenMonat)}/Monat</strong> 
              {' '}ergibt die Wohngeldformel keinen Anspruch (Ergebnis unter 10€).
            </p>
            <p className="mt-3 text-sm text-white/70">
              Prüfen Sie, ob weitere Freibeträge anwendbar sind, oder schauen Sie sich 
              alternative Leistungen wie Bürgergeld oder Kinderzuschlag an.
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails nach § 19 WoGG</h3>
        
        <div className="space-y-3 text-sm">
          {/* Einkommen */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            1. Einkommensberechnung (§§ 14-17 WoGG)
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Bruttoeinkommen (monatlich)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.bruttoMonat)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Bruttoeinkommen (jährlich)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.bruttoJahr)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
            <span>− Werbungskostenpauschale (§ 16)</span>
            <span>{formatEuro(ergebnis.werbungskosten)}</span>
          </div>
          {ergebnis.erwerbstaetigenfreibetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− Erwerbstätigenfreibetrag 10% (§ 17 Nr. 3)</span>
              <span>{formatEuro(ergebnis.erwerbstaetigenfreibetrag)}</span>
            </div>
          )}
          {ergebnis.schwerbehindertenfreibetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− Schwerbehindertenfreibetrag (§ 17 Nr. 4)</span>
              <span>{formatEuro(ergebnis.schwerbehindertenfreibetrag)}</span>
            </div>
          )}
          {ergebnis.alleinerziehendenfreibetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− Alleinerziehenden-Freibetrag (§ 17 Nr. 5)</span>
              <span>{formatEuro(ergebnis.alleinerziehendenfreibetrag)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= Anrechenbares Einkommen (Jahr)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.anrechenbaresEinkommenJahr)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">= Y (monatliches Gesamteinkommen)</span>
            <span className="font-bold text-purple-700">{formatEuro(ergebnis.anrechenbaresEinkommenMonat)}</span>
          </div>
          
          {/* Miete */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            2. Berücksichtigte Miete (§ 12 WoGG)
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Ihre Warmmiete</span>
            <span className="text-gray-900">{formatEuro(ergebnis.warmmiete)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Höchstbetrag (Mietstufe {mietstufe}, {haushaltsgroesse} Pers.)
            </span>
            <span className="text-gray-900">{formatEuro2(ergebnis.hoechstbetrag)}</span>
          </div>
          <div className="flex justify-between py-2 bg-purple-50 -mx-6 px-6">
            <span className="font-medium text-purple-700">= M (berücksichtigte Miete)</span>
            <span className="font-bold text-purple-900">{formatEuro2(ergebnis.beruecksichtigteMiete)}</span>
          </div>
          
          {/* Wohngeld-Formel */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            3. Wohngeldformel nach § 19 Abs. 1 WoGG
          </div>
          
          <div className="p-4 bg-blue-50 rounded-xl text-blue-800 text-sm font-mono">
            <p className="mb-2"><strong>Formel:</strong> Wohngeld = 1,15 × (M − (a + b×M + c×Y) × Y)</p>
            <p className="text-xs text-blue-600">
              Koeffizienten für {haushaltsgroesse} Pers.: a={ergebnis.koeffizienten.a}, b={ergebnis.koeffizienten.b}, c={ergebnis.koeffizienten.c}
            </p>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-gray-500 text-xs">
            <span>z1 = a + b×M + c×Y</span>
            <span>{ergebnis.z1}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-gray-500 text-xs">
            <span>z2 = z1 × Y</span>
            <span>{ergebnis.z2} €</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-gray-500 text-xs">
            <span>z3 = M − z2</span>
            <span>{ergebnis.z3} €</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-gray-500 text-xs">
            <span>z4 = 1,15 × z3 (ungerundet)</span>
            <span>{ergebnis.z4Ungerundet} €</span>
          </div>
          
          {/* Ergebnis */}
          <div className="flex justify-between py-3 bg-purple-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-purple-800">Wohngeld pro Monat (aufgerundet)</span>
            <span className="font-bold text-2xl text-purple-900">{formatEuro(ergebnis.wohngeldMonatlich)}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert Wohngeld</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mietzuschuss:</strong> Wohngeld ist ein staatlicher Zuschuss zur Miete für einkommensschwache Haushalte</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Keine Rückzahlung:</strong> Im Gegensatz zu BAföG muss Wohngeld nicht zurückgezahlt werden</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Wohngeld-Plus:</strong> Seit 2023 deutlich höhere Leistungen mit Heizkosten- und Klimakomponente</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mieter & Eigentümer:</strong> Mieter erhalten Mietzuschuss, Eigentümer Lastenzuschuss</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Bewilligungszeitraum:</strong> In der Regel 12 Monate, dann Neuantrag erforderlich</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kombinierbar:</strong> Mit Kindergeld, Kinderzuschlag, aber nicht mit Bürgergeld oder BAföG</span>
          </li>
        </ul>
      </div>

      {/* Wer hat Anspruch */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-purple-800 mb-3">👥 Wer hat Anspruch auf Wohngeld?</h3>
        <div className="space-y-3 text-sm text-purple-700">
          <p>
            <strong>Grundsätzlich anspruchsberechtigt</strong> sind Mieter, die zur Miete wohnen 
            und deren Einkommen innerhalb bestimmter Grenzen liegt:
          </p>
          <ul className="space-y-1 pl-4">
            <li>• Arbeitnehmer mit geringem Einkommen</li>
            <li>• Rentner mit niedriger Rente</li>
            <li>• Studenten, die kein BAföG erhalten (können)</li>
            <li>• Empfänger von Arbeitslosengeld I</li>
            <li>• Bezieher von Krankengeld, Übergangsgeld</li>
          </ul>
          <div className="bg-white/50 rounded-xl p-4 mt-3">
            <h4 className="font-semibold text-purple-800 mb-2">⚠️ Kein Wohngeld erhalten:</h4>
            <ul className="space-y-1">
              <li>• Empfänger von Bürgergeld (Kosten der Unterkunft enthalten)</li>
              <li>• BAföG-Empfänger (Wohnkostenanteil enthalten)</li>
              <li>• Personen in Bedarfsgemeinschaften mit Bürgergeld</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Exakte Berechnung:</strong> Dieser Rechner verwendet die offizielle Formel nach § 19 WoGG mit den Koeffizienten aus Anlage 2</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Mietstufe prüfen:</strong> Die Mietstufe richtet sich nach dem Wohnort und kann jährlich angepasst werden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Einkommensnachweis:</strong> Für den Antrag benötigen Sie Einkommensnachweise der letzten 12 Monate</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Rechtzeitig beantragen:</strong> Wohngeld wird erst ab Antragsmonat gezahlt – rückwirkend gibt es nichts</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Änderungen melden:</strong> Einkommensänderungen über 15% müssen gemeldet werden</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Wohngeldstelle Ihrer Gemeinde/Stadt</p>
            <p className="text-sm text-purple-700 mt-1">
              Zuständig ist die Wohngeldstelle am Ort Ihrer Wohnung – meist beim Rathaus, 
              Landratsamt oder Bezirksamt angesiedelt.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Bundesportal</p>
                <a 
                  href="https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeld_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  BMWSB Wohngeld-Info →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📱</span>
              <div>
                <p className="font-medium text-gray-800">Online-Antrag</p>
                <a 
                  href="https://www.wohngeld.org/antrag"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Wohngeld online beantragen →
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Benötigte Unterlagen</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Mietvertrag und Mietbescheinigung</li>
                <li>• Einkommensnachweise (Gehaltsabrechnungen, Rentenbescheid)</li>
                <li>• Personalausweis</li>
                <li>• Ggf. Schwerbehindertenausweis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

            <RechnerFeedback rechnerName="Wohngeld-Rechner 2026" rechnerSlug="wohngeld-rechner" />

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/wogg/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Wohngeldgesetz (WoGG) – Gesetze im Internet
          </a>
          <a 
            href="https://www.wohngeld.org/wohngeldgesetz-wogg/paragraph19/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 19 WoGG – Wohngeldformel mit Berechnungsbeispielen
          </a>
          <a 
            href="https://www.wohngeld.org/wohngeldgesetz-wogg/anlage2/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Anlage 2 zu § 19 WoGG – Koeffizienten a, b, c
          </a>
          <a 
            href="https://www.wohngeld.org/wohnkosten/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Wohngeld Höchstbeträge 2025/2026 – Tabellen
          </a>
          <a 
            href="https://www.wohngeld.org/mietstufe/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Mietstufen-Verzeichnis nach Bundesländern
          </a>
          <a 
            href="https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeld_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMWSB – Wohngeld Informationen
          </a>
        </div>
      </div>
    </div>
  );
}
