import { useState, useMemo } from 'react';

// Wohngeld-Tabellen 2025/2026 (Wohngeld-Plus-Gesetz)
// Mietstufen I-VII nach Gemeinde
const MIETSTUFEN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;
type Mietstufe = typeof MIETSTUFEN[number];

// Höchstbeträge für die zu berücksichtigende Miete (in €/Monat) - Stand 2025/2026
// Nach § 12 WoGG inkl. Heizkostenzuschlag + Klimakomponente (Wohngeld-Plus)
// Quelle: https://www.wohngeld.org/wohnkosten/
const HOECHSTBETRAEGE: Record<Mietstufe, number[]> = {
  'I':   [491, 604, 721, 840, 959, 1073, 1188, 1302],   // 1-8 Personen (gerundet)
  'II':  [538, 660, 787, 918, 1047, 1174, 1300, 1427],
  'III': [586, 718, 857, 998, 1140, 1278, 1417, 1555],
  'IV':  [641, 786, 937, 1090, 1247, 1398, 1550, 1701],
  'V':   [692, 847, 1009, 1178, 1345, 1506, 1668, 1829],
  'VI':  [745, 912, 1087, 1267, 1448, 1628, 1809, 1991],
  'VII': [807, 987, 1175, 1371, 1567, 1762, 1958, 2153],
};

// Koeffizienten für die Wohngeld-Formel nach § 19 WoGG (Anlage 1)
// Wohngeld = 1,15 × (M − (a + b×M + c×Y) × Y) × 12
// Diese Koeffizienten sind stark vereinfacht - echte Berechnung ist komplexer
const KOEFFIZIENTEN: Record<number, { a: number; b: number; c: number }> = {
  1: { a: 4.000e-2, b: 5.300e-5, c: 2.540e-4 },
  2: { a: 3.000e-2, b: 3.300e-5, c: 2.070e-4 },
  3: { a: 2.000e-2, b: 2.300e-5, c: 1.750e-4 },
  4: { a: 1.000e-2, b: 1.500e-5, c: 1.520e-4 },
  5: { a: 0.000e-2, b: 1.000e-5, c: 1.350e-4 },
  6: { a: -1.000e-2, b: 0.700e-5, c: 1.200e-4 },
};

// Freibeträge 2025/2026
// Quelle: https://www.wohngeld.org/einkommen/
const FREIBETRAEGE = {
  grundfreibetrag: 1800,           // Monatl. Mindesteinkommen (etwa)
  schwerbehindert_50_80: 1800,     // GdB 50-80 (jährlich)
  schwerbehindert_80_100: 2100,    // GdB 80-100 (jährlich)
  pflegebedürftig: 2100,           // Pflegegrad 1-3 (jährlich)
  alleinerziehend: 1320,           // Pro Kind (jährlich)
  kind_unter_25_ausbildung: 100,   // Kind in Ausbildung (monatlich)
  erwerbstaetig_pauschal: 0.10,    // 10% vom Bruttoeinkommen
  werbungskosten_pauschal: 1230,   // Jährlich (102.50€/Monat)
};

// Einkommensgrenzen für Wohngeld 2025/2026 (monatlich)
// Quelle: https://www.wohngeld.org/einkommen/
const EINKOMMENSGRENZEN: Record<Mietstufe, number[]> = {
  'I':   [1443, 1953, 2453, 3324, 3822, 4319, 4761, 5001],
  'II':  [1530, 2074, 2610, 3542, 4077, 4611, 5086, 5341],
  'III': [1620, 2199, 2773, 3769, 4341, 4912, 5423, 5695],
  'IV':  [1713, 2327, 2942, 4004, 4617, 5228, 5776, 6068],
  'V':   [1803, 2451, 3104, 4229, 4880, 5528, 6111, 6420],
  'VI':  [1896, 2580, 3273, 4465, 5158, 5849, 6469, 6799],
  'VII': [1992, 2715, 3451, 4714, 5451, 6185, 6845, 7198],
};

// Beispielstädte nach Mietstufen
const BEISPIELSTAEDTE: Record<Mietstufe, string[]> = {
  'I':   ['Chemnitz', 'Halle (Saale)', 'Magdeburg', 'Gera'],
  'II':  ['Leipzig', 'Dresden', 'Erfurt', 'Rostock'],
  'III': ['Hannover', 'Bremen', 'Dortmund', 'Essen'],
  'IV':  ['Köln', 'Düsseldorf', 'Hamburg', 'Nürnberg'],
  'V':   ['Berlin', 'Frankfurt (Oder)', 'Potsdam'],
  'VI':  ['Frankfurt a.M.', 'Stuttgart', 'Freiburg'],
  'VII': ['München', 'Starnberg', 'Miesbach'],
};

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
    // === 1. Anrechenbares Einkommen berechnen ===
    const jahresbrutto = bruttoeinkommen * 12;
    
    // Werbungskostenpauschale
    const werbungskosten = FREIBETRAEGE.werbungskosten_pauschal;
    
    // Erwerbstätigenfreibetrag (10% vom Brutto)
    const erwerbstaetigenfreibetrag = istErwerbstaetig 
      ? Math.min(jahresbrutto * FREIBETRAEGE.erwerbstaetig_pauschal, 1200) // Max. 100€/Monat
      : 0;
    
    // Freibeträge für Schwerbehinderte
    let schwerbehindertenfreibetrag = 0;
    if (schwerbehindert === '50-80') {
      schwerbehindertenfreibetrag = FREIBETRAEGE.schwerbehindert_50_80;
    } else if (schwerbehindert === '80-100') {
      schwerbehindertenfreibetrag = FREIBETRAEGE.schwerbehindert_80_100;
    }
    
    // Alleinerziehenden-Freibetrag
    const alleinerziehendenfreibetrag = alleinerziehend 
      ? FREIBETRAEGE.alleinerziehend * Math.max(1, anzahlKinder)
      : 0;
    
    const gesamtfreibetraege = werbungskosten + erwerbstaetigenfreibetrag + 
                               schwerbehindertenfreibetrag + alleinerziehendenfreibetrag;
    
    // Anrechenbares Jahreseinkommen
    const anrechenbaresEinkommenJahr = Math.max(0, jahresbrutto - gesamtfreibetraege);
    const anrechenbaresEinkommenMonat = anrechenbaresEinkommenJahr / 12;
    
    // === 2. Berücksichtigte Miete (max. Höchstbetrag) ===
    const personenIndex = Math.min(haushaltsgroesse - 1, 7);
    const hoechstbetrag = HOECHSTBETRAEGE[mietstufe][personenIndex];
    
    // Heizkosten werden pauschal abgezogen (ca. 1,20€/qm für Wohngeld)
    // Vereinfachung: Warmmiete direkt verwenden, da Heizkosten berücksichtigt
    const beruecksichtigteMiete = Math.min(warmmiete, hoechstbetrag);
    
    // === 3. Wohngeld-Formel nach § 19 WoGG ===
    // Wohngeld = 1,15 × (M − (a + b×M + c×Y) × Y) × 12 (für Jahresberechnung)
    // M = monatliche zu berücksichtigende Miete
    // Y = monatliches zu berücksichtigendes Einkommen
    
    const koeff = KOEFFIZIENTEN[Math.min(haushaltsgroesse, 6)];
    const M = beruecksichtigteMiete;
    const Y = anrechenbaresEinkommenMonat;
    
    // Formel anwenden
    const faktor = koeff.a + koeff.b * M + koeff.c * Y;
    const wohngeldBrutto = 1.15 * (M - faktor * Y);
    
    // Wohngeld muss mindestens 0 sein, und es gibt eine Untergrenze von 10€
    const wohngeldMonatlich = wohngeldBrutto >= 10 ? Math.round(wohngeldBrutto) : 0;
    
    // === 4. Einkommensgrenze prüfen ===
    const einkommensgrenze = EINKOMMENSGRENZEN[mietstufe][personenIndex];
    const hatAnspruch = anrechenbaresEinkommenMonat <= einkommensgrenze && wohngeldMonatlich > 0;
    
    // === 5. Jahreswohngeld ===
    const wohngeldJaehrlich = wohngeldMonatlich * 12;
    
    return {
      // Einkommen
      bruttoMonat: bruttoeinkommen,
      bruttoJahr: jahresbrutto,
      werbungskosten,
      erwerbstaetigenfreibetrag,
      schwerbehindertenfreibetrag,
      alleinerziehendenfreibetrag,
      gesamtfreibetraege,
      anrechenbaresEinkommenJahr,
      anrechenbaresEinkommenMonat,
      
      // Miete
      warmmiete,
      hoechstbetrag,
      beruecksichtigteMiete,
      mieteGekappt: warmmiete > hoechstbetrag,
      
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
  const formatEuroExact = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

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
              onClick={() => setHaushaltsgroesse(Math.min(8, haushaltsgroesse + 1))}
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
              ⚠️ Höchstbetrag für Mietstufe {mietstufe}: {formatEuro(ergebnis.hoechstbetrag)}
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
              {' '}liegt Ihr Haushalt über der Einkommensgrenze von{' '}
              <strong>{formatEuro(ergebnis.einkommensgrenze)}</strong> für Mietstufe {mietstufe}.
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
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          {/* Einkommen */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Einkommensberechnung
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
            <span>− Werbungskostenpauschale</span>
            <span>{formatEuro(ergebnis.werbungskosten)}</span>
          </div>
          {ergebnis.erwerbstaetigenfreibetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− Erwerbstätigenfreibetrag (10%)</span>
              <span>{formatEuro(ergebnis.erwerbstaetigenfreibetrag)}</span>
            </div>
          )}
          {ergebnis.schwerbehindertenfreibetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− Schwerbehindertenfreibetrag</span>
              <span>{formatEuro(ergebnis.schwerbehindertenfreibetrag)}</span>
            </div>
          )}
          {ergebnis.alleinerziehendenfreibetrag > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
              <span>− Alleinerziehenden-Freibetrag</span>
              <span>{formatEuro(ergebnis.alleinerziehendenfreibetrag)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= Anrechenbares Einkommen (Jahr)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.anrechenbaresEinkommenJahr)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">= Anrechenbares Einkommen (Monat)</span>
            <span className="font-bold text-purple-700">{formatEuro(ergebnis.anrechenbaresEinkommenMonat)}</span>
          </div>
          
          {/* Miete */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Mietberechnung
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Ihre Warmmiete</span>
            <span className="text-gray-900">{formatEuro(ergebnis.warmmiete)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Höchstbetrag (Mietstufe {mietstufe}, {haushaltsgroesse} Pers.)
            </span>
            <span className="text-gray-900">{formatEuro(ergebnis.hoechstbetrag)}</span>
          </div>
          <div className="flex justify-between py-2 bg-purple-50 -mx-6 px-6">
            <span className="font-medium text-purple-700">= Berücksichtigte Miete</span>
            <span className="font-bold text-purple-900">{formatEuro(ergebnis.beruecksichtigteMiete)}</span>
          </div>
          
          {/* Ergebnis */}
          <div className="flex justify-between py-3 bg-purple-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-purple-800">Wohngeld pro Monat</span>
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
            <span><strong>Schätzung:</strong> Dieser Rechner liefert eine Orientierung – die tatsächliche Berechnung durch die Wohngeldstelle kann abweichen</span>
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

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
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
            href="https://www.bmwsb.bund.de/DE/wohnen/wohngeld/wohngeld_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMWSB – Wohngeld Informationen
          </a>
          <a 
            href="https://www.wohngeld.org"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Wohngeld.org – Ratgeber und Rechner
          </a>
          <a 
            href="https://www.wohngeld.org/wohnkosten/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Wohngeld Höchstbeträge 2026 – Tabellen
          </a>
          <a 
            href="https://www.wohngeld.org/mietstufe/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Mietstufen-Verzeichnis nach Bundesländern
          </a>
        </div>
      </div>
    </div>
  );
}
