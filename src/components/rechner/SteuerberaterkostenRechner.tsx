import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// ============================================================================
// StBVV-Konstanten (Steuerberatervergütungsverordnung), Fassung ab 01.07.2025
// (5. ÄnderungsVO, BGBl. 2025 I Nr. 105). Quelle: gesetze-im-internet.de
// ============================================================================

const UST_SATZ = 0.19; // 19 % Umsatzsteuer auf das Honorar (§ 15 StBVV)
const AUSLAGEN_PAUSCHALE = 20; // Post-/Telekommunikationspauschale § 16 StBVV (20 % der Gebühr, max. 20 €)

// --- Tabelle A (Beratungstabelle, Anlage 1) – VOLLE Gebühr 10/10 ------------
const STBVV_TABELLE_A: [number, number][] = [
  [300, 31], [600, 56], [900, 81], [1200, 106], [1500, 130], [2000, 166], [2500, 200], [3000, 235],
  [3500, 270], [4000, 305], [4500, 340], [5000, 375], [6000, 422], [7000, 467], [8000, 514], [9000, 560],
  [10000, 605], [13000, 655], [16000, 705], [19000, 755], [22000, 805], [25000, 854], [30000, 946],
  [35000, 1036], [40000, 1125], [45000, 1215], [50000, 1304], [65000, 1399], [80000, 1496], [95000, 1592],
  [110000, 1689], [125000, 1784], [140000, 1879], [155000, 1976], [170000, 2071], [185000, 2168],
  [200000, 2264], [230000, 2412], [260000, 2559], [290000, 2705], [320000, 2859], [350000, 2926],
  [380000, 2990], [410000, 3055], [440000, 3115], [470000, 3175], [500000, 3234], [550000, 3320], [600000, 3404],
];

function volleGebuehrA(ggw: number): number {
  for (const [bis, geb] of STBVV_TABELLE_A) if (ggw <= bis) return geb;
  let geb = 3404;
  let rest = ggw - 600000;
  const s1 = Math.min(rest, 4400000); geb += Math.ceil(s1 / 50000) * 149; rest -= 4400000;
  if (rest <= 0) return geb;
  const s2 = Math.min(rest, 20000000); geb += Math.ceil(s2 / 50000) * 112; rest -= 20000000;
  if (rest <= 0) return geb;
  geb += Math.ceil(rest / 50000) * 88; return geb;
}

// --- Tabelle B (Abschlusstabelle, Anlage 2) – VOLLE Gebühr 10/10 ------------
// Selbst-verifiziert gegen Anker: 3.000→49, 17.500→166, 50.000→263, 100.000→369,
// 250.000→613, 500.000→832, 1.000.000→1.126, 2.000.000→1.542, 5.000.000→2.328.
const STBVV_TABELLE_B: [number, number][] = [
  [3000, 49], [3500, 57], [4000, 68], [4500, 76], [5000, 86], [6000, 96], [7000, 105], [8000, 116],
  [9000, 121], [10000, 127], [12500, 134], [15000, 151], [17500, 166], [20000, 178], [22500, 191],
  [25000, 201], [37500, 215], [50000, 263], [62500, 303], [75000, 338], [87500, 353], [100000, 369],
  [125000, 423], [150000, 471], [175000, 512], [200000, 548], [225000, 582], [250000, 613], [300000, 641],
  [350000, 696], [400000, 746], [450000, 791], [500000, 832], [625000, 871], [750000, 968], [875000, 1050],
  [1000000, 1126], [1250000, 1194], [1500000, 1324], [1750000, 1438], [2000000, 1542], [2250000, 1635],
  [2500000, 1718], [3000000, 1797], [3500000, 1951], [4000000, 2089], [4500000, 2214], [5000000, 2328],
  [7500000, 2720], [10000000, 3162], [12500000, 3520], [15000000, 3819], [17500000, 4074], [20000000, 4293],
  [22500000, 4573], [25000000, 4831], [30000000, 5315], [35000000, 5759], [40000000, 6172], [45000000, 6558],
  [50000000, 6923],
];

function volleGebuehrB(ggw: number): number {
  for (const [bis, geb] of STBVV_TABELLE_B) if (ggw <= bis) return geb;
  let geb = 6923;
  let rest = ggw - 50000000;
  const s1 = Math.min(rest, 75000000); geb += Math.ceil(s1 / 5000000) * 273; rest -= 75000000;
  if (rest <= 0) return geb;
  const s2 = Math.min(rest, 125000000); geb += Math.ceil(s2 / 12500000) * 477; rest -= 125000000;
  if (rest <= 0) return geb;
  geb += Math.ceil(rest / 25000000) * 681; return geb;
}

// --- Tabelle C (Buchführungstabelle, Anlage 3) – VOLLE Gebühr 10/10 --------
// Selbst-verifiziert gegen Anker: 15.000→72, 25.000→101, 50.000→138, 100.000→188,
// 250.000→317, 500.000→512, über 500.000: +36 je angefangene 50.000.
const STBVV_TABELLE_C: [number, number][] = [
  [15000, 72], [17500, 80], [20000, 88], [22500, 93], [25000, 101], [30000, 108], [35000, 117],
  [40000, 122], [45000, 129], [50000, 138], [62500, 145], [75000, 158], [87500, 174], [100000, 188],
  [125000, 209], [150000, 230], [200000, 275], [250000, 317], [300000, 359], [350000, 404], [400000, 441],
  [450000, 475], [500000, 512],
];

function volleGebuehrC(ggw: number): number {
  for (const [bis, geb] of STBVV_TABELLE_C) if (ggw <= bis) return geb;
  const rest = ggw - 500000;
  return 512 + Math.ceil(rest / 50000) * 36;
}

// ============================================================================
// Leistungs-Katalog: Tabelle, Satz-Rahmen, Default-Mittelgebühr, Mindest-GGW
// ============================================================================

type TabellenTyp = 'A' | 'B' | 'C';

interface Leistung {
  id: string;
  name: string;
  kurz: string;
  paragraph: string;
  tabelle: TabellenTyp;
  satzMin: number; // in Zehnteln
  satzMax: number; // in Zehnteln
  satzDefault: number; // Mittelgebühr in Zehnteln
  mindestGgw: number;
  ggwLabel: string;
  ggwHinweis: string;
  ggwDefault: number;
  proMonat?: boolean; // laufende Buchführung: Gebühr ist eine Monatsgebühr
}

const LEISTUNGEN: Leistung[] = [
  {
    id: 'einkommensteuer',
    name: 'Einkommensteuererklärung',
    kurz: 'ESt-Erklärung',
    paragraph: '§ 24 Abs. 1 Nr. 1 StBVV',
    tabelle: 'A',
    satzMin: 1, satzMax: 6, satzDefault: 3.5,
    mindestGgw: 8000,
    ggwLabel: 'Summe der positiven Einkünfte',
    ggwHinweis: 'Gegenstandswert = Summe der positiven Einkünfte (ohne Verrechnung mit Verlusten), mindestens 8.000 €.',
    ggwDefault: 40000,
  },
  {
    id: 'umsatzsteuer',
    name: 'Umsatzsteuer-Jahreserklärung',
    kurz: 'USt-Jahreserklärung',
    paragraph: '§ 24 Abs. 1 Nr. 8 StBVV',
    tabelle: 'A',
    satzMin: 1, satzMax: 8, satzDefault: 4.5,
    mindestGgw: 8000,
    ggwLabel: 'Summe der steuerpflichtigen Entgelte',
    ggwHinweis: 'Gegenstandswert = Summe der Entgelte (Umsätze) zuzüglich unentgeltlicher Wertabgaben, mindestens 8.000 €.',
    ggwDefault: 200000,
  },
  {
    id: 'gewerbesteuer',
    name: 'Gewerbesteuererklärung',
    kurz: 'GewSt-Erklärung',
    paragraph: '§ 24 Abs. 1 Nr. 5 StBVV',
    tabelle: 'A',
    satzMin: 1, satzMax: 6, satzDefault: 3.5,
    mindestGgw: 8000,
    ggwLabel: 'Gewerbeertrag (vor Verlustabzug)',
    ggwHinweis: 'Gegenstandswert = Gewerbeertrag vor Verlustabzug, mindestens 8.000 €.',
    ggwDefault: 50000,
  },
  {
    id: 'euer',
    name: 'Einnahmenüberschussrechnung (EÜR)',
    kurz: 'EÜR',
    paragraph: '§ 25 Abs. 1 StBVV',
    tabelle: 'B',
    satzMin: 5, satzMax: 30, satzDefault: 17.5,
    mindestGgw: 17500,
    ggwLabel: 'Betriebseinnahmen bzw. -ausgaben (der höhere Wert)',
    ggwHinweis: 'Gegenstandswert = der höhere Betrag aus Betriebseinnahmen oder Betriebsausgaben, mindestens 17.500 €.',
    ggwDefault: 80000,
  },
  {
    id: 'jahresabschluss',
    name: 'Jahresabschluss / Bilanz',
    kurz: 'Jahresabschluss',
    paragraph: '§ 35 Abs. 1 Nr. 1a StBVV',
    tabelle: 'B',
    satzMin: 10, satzMax: 40, satzDefault: 25,
    mindestGgw: 0,
    ggwLabel: 'Mittel aus Bilanzsumme und betrieblicher Jahresleistung',
    ggwHinweis: 'Gegenstandswert = Mittelwert aus (berichtigter) Bilanzsumme und betrieblicher Jahresleistung (Umsatz). Beide Felder unten eingeben.',
    ggwDefault: 250000,
  },
  {
    id: 'buchfuehrung',
    name: 'Laufende Buchführung (monatlich)',
    kurz: 'Laufende Buchführung',
    paragraph: '§ 33 Abs. 1 StBVV',
    tabelle: 'C',
    satzMin: 2, satzMax: 12, satzDefault: 7,
    mindestGgw: 0,
    ggwLabel: 'Jahresumsatz bzw. Jahresaufwand (der höhere Wert)',
    ggwHinweis: 'Gegenstandswert = der höhere Betrag aus Jahresumsatz oder Jahresaufwand. Die Gebühr ist eine Monatsgebühr – der Jahreswert ergibt sich aus × 12.',
    ggwDefault: 300000,
    proMonat: true,
  },
];

function volleGebuehrFuer(tabelle: TabellenTyp, ggw: number): number {
  if (tabelle === 'A') return volleGebuehrA(ggw);
  if (tabelle === 'B') return volleGebuehrB(ggw);
  return volleGebuehrC(ggw);
}

export function SteuerberaterkostenRechner() {
  const [leistungId, setLeistungId] = useState('einkommensteuer');
  const leistung = LEISTUNGEN.find((l) => l.id === leistungId) ?? LEISTUNGEN[0];

  // Eingaben
  const [gegenstandswert, setGegenstandswert] = useState(40000);
  // Felder nur für Jahresabschluss (Mittelwert-Berechnung)
  const [bilanzsumme, setBilanzsumme] = useState(200000);
  const [jahresleistung, setJahresleistung] = useState(300000);
  // Satz in Zehnteln
  const [satz, setSatz] = useState(3.5);
  const [mitAuslagen, setMitAuslagen] = useState(true);

  // Beim Leistungswechsel sinnvolle Defaults setzen
  const handleLeistungsWechsel = (id: string) => {
    const l = LEISTUNGEN.find((x) => x.id === id) ?? LEISTUNGEN[0];
    setLeistungId(id);
    setSatz(l.satzDefault);
    setGegenstandswert(l.ggwDefault);
  };

  const ergebnis = useMemo(() => {
    // Roh-Gegenstandswert je nach Leistung ermitteln
    let rohGgw: number;
    if (leistung.id === 'jahresabschluss') {
      const b = Math.max(0, bilanzsumme);
      const j = Math.max(0, jahresleistung);
      rohGgw = (b + j) / 2;
    } else {
      rohGgw = Math.max(0, gegenstandswert);
    }

    // Mindestwert anwenden
    const ggw = Math.max(rohGgw, leistung.mindestGgw);
    const unterMindest = rohGgw > 0 && rohGgw < leistung.mindestGgw;

    // Volle Gebühr aus der passenden Tabelle
    const volleGebuehr = volleGebuehrFuer(leistung.tabelle, ggw);

    // Honorar = volle Gebühr × Satz/10
    const netto = volleGebuehr * (satz / 10);

    // Auslagenpauschale § 16: 20 % der Gebühr, höchstens 20 €
    const auslagen = mitAuslagen ? Math.min(netto * 0.2, AUSLAGEN_PAUSCHALE) : 0;

    const nettoMitAuslagen = netto + auslagen;
    const ust = nettoMitAuslagen * UST_SATZ;
    const brutto = nettoMitAuslagen + ust;

    // Bei laufender Buchführung: Monatswert + Jahreswert
    const jahresNetto = leistung.proMonat ? netto * 12 : netto;
    const jahresBrutto = leistung.proMonat ? brutto * 12 : brutto;

    return {
      rohGgw, ggw, unterMindest, volleGebuehr,
      netto, auslagen, nettoMitAuslagen, ust, brutto,
      jahresNetto, jahresBrutto,
    };
  }, [leistung, gegenstandswert, bilanzsumme, jahresleistung, satz, mitAuslagen]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatZehntel = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '/10';

  const sliderMax = leistung.id === 'jahresabschluss' ? 1000000 : leistung.tabelle === 'C' ? 1000000 : 500000;

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Steuerberaterkosten-Rechner" rechnerSlug="steuerberaterkosten-rechner" />

      {/* Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Leistungs-Auswahl */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Welche Leistung soll der Steuerberater erbringen?</span>
            <span className="text-xs text-gray-500 block mt-1">
              Jede Leistung hat einen eigenen Gebührenrahmen nach der StBVV.
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {LEISTUNGEN.map((l) => (
              <button
                key={l.id}
                onClick={() => handleLeistungsWechsel(l.id)}
                className={`px-3 py-2 text-sm rounded-xl text-left transition-all ${
                  leistungId === l.id
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {l.kurz}
                <span className={`block text-xs ${leistungId === l.id ? 'text-indigo-100' : 'text-gray-400'}`}>
                  Tabelle {l.tabelle}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Gegenstandswert-Eingabe */}
        {leistung.id === 'jahresabschluss' ? (
          <>
            <div className="mb-4">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Berichtigte Bilanzsumme</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bilanzsumme}
                  onChange={(e) => setBilanzsumme(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
                  min="0"
                  step="10000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
              </div>
            </div>
            <div className="mb-2">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Betriebliche Jahresleistung (Umsatz)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={jahresleistung}
                  onChange={(e) => setJahresleistung(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
                  min="0"
                  step="10000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              {leistung.ggwHinweis} Daraus ergibt sich ein Gegenstandswert von{' '}
              <strong>{formatEuroRound(ergebnis.ggw)}</strong>.
            </p>
          </>
        ) : (
          <div className="mb-2">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">{leistung.ggwLabel}</span>
              <span className="text-xs text-gray-500 block mt-1">{leistung.ggwHinweis}</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={gegenstandswert}
                onChange={(e) => setGegenstandswert(Math.max(0, Number(e.target.value) || 0))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none"
                min="0"
                step="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
            </div>
            <input
              type="range"
              value={Math.min(gegenstandswert, sliderMax)}
              onChange={(e) => setGegenstandswert(Number(e.target.value) || 0)}
              className="w-full mt-3 accent-indigo-500"
              min="0"
              max={sliderMax}
              step={Math.round(sliderMax / 100)}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 €</span>
              <span>{formatEuroRound(sliderMax / 2)}</span>
              <span>{formatEuroRound(sliderMax)}</span>
            </div>
            {leistung.mindestGgw > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Mindest-Gegenstandswert: <strong>{formatEuroRound(leistung.mindestGgw)}</strong>
                {ergebnis.unterMindest && (
                  <span className="text-amber-600">
                    {' '}– Ihre Eingabe liegt darunter, gerechnet wird mit {formatEuroRound(leistung.mindestGgw)}.
                  </span>
                )}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Satz-Slider */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-2">
          <span className="text-gray-700 font-medium">Gebührensatz (Zehntelsatz)</span>
          <span className="text-xs text-gray-500 block mt-1">
            Rahmen {formatZehntel(leistung.satzMin)} bis {formatZehntel(leistung.satzMax)} ({leistung.paragraph}).
            Voreingestellt ist die übliche Mittelgebühr von {formatZehntel(leistung.satzDefault)}.
          </span>
        </label>
        <div className="text-center my-3">
          <span className="text-3xl font-bold text-indigo-700">{formatZehntel(satz)}</span>
        </div>
        <input
          type="range"
          value={satz}
          onChange={(e) => setSatz(Number(e.target.value) || leistung.satzMin)}
          className="w-full accent-indigo-500"
          min={leistung.satzMin}
          max={leistung.satzMax}
          step={0.5}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatZehntel(leistung.satzMin)} (Minimum)</span>
          <span className="text-indigo-600">{formatZehntel(leistung.satzDefault)} (Mittel)</span>
          <span>{formatZehntel(leistung.satzMax)} (Maximum)</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setSatz(leistung.satzMin)}
            className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            Mindestgebühr {formatZehntel(leistung.satzMin)}
          </button>
          <button
            onClick={() => setSatz(leistung.satzDefault)}
            className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            Mittelgebühr {formatZehntel(leistung.satzDefault)}
          </button>
          <button
            onClick={() => setSatz(leistung.satzMax)}
            className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            Höchstgebühr {formatZehntel(leistung.satzMax)}
          </button>
        </div>

        {/* Auslagen-Toggle */}
        <label className="flex items-center gap-3 mt-5 cursor-pointer">
          <input
            type="checkbox"
            checked={mitAuslagen}
            onChange={(e) => setMitAuslagen(e.target.checked)}
            className="w-5 h-5 accent-indigo-500"
          />
          <span className="text-sm text-gray-700">
            Auslagenpauschale (§ 16 StBVV) einrechnen – 20 % der Gebühr, höchstens 20 €
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          💼 {leistung.name} – {leistung.proMonat ? 'Honorar pro Monat' : 'Honorar'} (brutto)
        </h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.brutto)}</span>
            {leistung.proMonat && <span className="text-xl opacity-80">/ Monat</span>}
          </div>
          <p className="text-indigo-100 mt-2 text-sm">
            {formatZehntel(satz)}-Gebühr aus Tabelle {leistung.tabelle} bei{' '}
            {formatEuroRound(ergebnis.ggw)} Gegenstandswert · inkl. 19 % USt
            {ergebnis.auslagen > 0 ? ' und Auslagen' : ''}
          </p>
          {leistung.proMonat && (
            <p className="text-indigo-100 mt-1 text-sm">
              Hochgerechnet auf das Jahr: <strong>{formatEuro(ergebnis.jahresBrutto)} / Jahr</strong> (× 12)
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Nettohonorar</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.netto)}</div>
            <span className="text-xs opacity-70">{formatZehntel(satz)} × Tab. {leistung.tabelle}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Auslagen § 16</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.auslagen)}</div>
            <span className="text-xs opacity-70">max. 20 €</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">19 % USt</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.ust)}</div>
            <span className="text-xs opacity-70">§ 15 StBVV</span>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 So wird das Honorar berechnet</h3>

        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            1. Gegenstandswert &amp; volle Gebühr (Tabelle {leistung.tabelle})
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Maßgeblicher Gegenstandswert</span>
            <span className="text-gray-900">{formatEuroRound(ergebnis.ggw)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Volle Gebühr (10/10) laut Tabelle {leistung.tabelle}</span>
            <span className="text-gray-900">{formatEuro(ergebnis.volleGebuehr)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            2. Nettohonorar ({leistung.paragraph})
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Volle Gebühr × {formatZehntel(satz)}</span>
            <span className="text-gray-900">{formatEuro(ergebnis.volleGebuehr)} × {(satz / 10).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-50 -mx-6 px-6">
            <span className="font-medium text-indigo-700">= Nettohonorar{leistung.proMonat ? ' / Monat' : ''}</span>
            <span className="font-bold text-indigo-900">{formatEuro(ergebnis.netto)}</span>
          </div>

          {ergebnis.auslagen > 0 && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                3. Auslagenpauschale (§ 16 StBVV)
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">20 % der Gebühr, höchstens 20 €</span>
                <span className="text-gray-900">{formatEuro(ergebnis.auslagen)}</span>
              </div>
            </>
          )}

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            {ergebnis.auslagen > 0 ? '4.' : '3.'} Umsatzsteuer &amp; Bruttohonorar (§ 15 StBVV)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Zwischensumme netto</span>
            <span className="text-gray-900">{formatEuro(ergebnis.nettoMitAuslagen)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">zzgl. 19 % Umsatzsteuer</span>
            <span className="text-gray-900">{formatEuro(ergebnis.ust)}</span>
          </div>
          <div className="flex justify-between py-2 bg-indigo-100 -mx-6 px-6">
            <span className="font-bold text-indigo-800">= Bruttohonorar{leistung.proMonat ? ' / Monat' : ''}</span>
            <span className="font-bold text-2xl text-indigo-900">{formatEuro(ergebnis.brutto)}</span>
          </div>

          {leistung.proMonat && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Hochgerechnet auf das Jahr (× 12)</span>
              <span className="font-bold text-gray-900">{formatEuro(ergebnis.jahresBrutto)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-indigo-50 rounded-xl text-sm text-indigo-800">
          💡 Die StBVV legt einen <strong>Gebührenrahmen</strong> fest – kein Festpreis. Der Steuerberater
          bestimmt den konkreten Satz innerhalb des Rahmens nach Bedeutung, Umfang und Schwierigkeit
          (§ 11 StBVV). Hinzu kommen stets Auslagen (§ 16) und die Umsatzsteuer (§ 15).
        </div>
      </div>

      {/* Rahmen-Übersicht: Minimum / Mittel / Maximum */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📍 Spannweite des Gebührenrahmens (brutto inkl. USt &amp; Auslagen)</h3>
        <p className="text-sm text-gray-500 mb-4">
          So viel darf der Steuerberater für diese Leistung mindestens und höchstens berechnen – beim
          gleichen Gegenstandswert von {formatEuroRound(ergebnis.ggw)}:
        </p>
        <div className="space-y-3">
          {[
            { label: 'Mindestgebühr', s: leistung.satzMin },
            { label: 'Mittelgebühr', s: leistung.satzDefault },
            { label: 'Höchstgebühr', s: leistung.satzMax },
          ].map((row) => {
            const n = ergebnis.volleGebuehr * (row.s / 10);
            const a = mitAuslagen ? Math.min(n * 0.2, AUSLAGEN_PAUSCHALE) : 0;
            const b = (n + a) * (1 + UST_SATZ);
            const isAktuell = Math.abs(row.s - satz) < 0.001;
            return (
              <div
                key={row.label}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isAktuell ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isAktuell ? 'text-indigo-800' : 'text-gray-600'}`}>
                    {row.label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isAktuell ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {formatZehntel(row.s)}
                  </span>
                </div>
                <div className={`font-bold ${isAktuell ? 'text-indigo-900' : 'text-gray-800'}`}>
                  {formatEuro(b)}{leistung.proMonat ? ' / Monat' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-2">⚠️ Wichtiger Hinweis</h3>
        <p className="text-sm text-amber-700">
          Dieser Rechner liefert eine <strong>Schätzung ohne Gewähr</strong> auf Basis der gesetzlichen
          Gebührentabellen der StBVV (Fassung ab 01.07.2025) und <strong>ersetzt keine Steuerberatung</strong>.
          Der Steuerberater wählt den konkreten Zehntelsatz innerhalb des Rahmens selbst, kann eine
          Pauschalvergütung (§ 14 StBVV) oder bei außergerichtlicher Beratung eine Vergütungsvereinbarung
          treffen. Tatsächliche Honorare können daher abweichen. Für ein verbindliches Angebot wenden Sie
          sich an einen Steuerberater.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/stbgebv/anlage_1.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Anlage 1 StBVV – Tabelle A (Beratungstabelle) – Gesetze im Internet
          </a>
          <a
            href="https://www.gesetze-im-internet.de/stbgebv/anlage_2.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Anlage 2 StBVV – Tabelle B (Abschlusstabelle) – Gesetze im Internet
          </a>
          <a
            href="https://www.gesetze-im-internet.de/stbgebv/anlage_3.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Anlage 3 StBVV – Tabelle C (Buchführungstabelle) – Gesetze im Internet
          </a>
          <a
            href="https://www.gesetze-im-internet.de/stbgebv/__24.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 24 StBVV – Steuererklärungen (Sätze) – Gesetze im Internet
          </a>
          <a
            href="https://www.gesetze-im-internet.de/stbgebv/__16.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 16 StBVV – Entgelte für Post- und Telekommunikationsdienstleistungen – Gesetze im Internet
          </a>
        </div>
      </div>
    </div>
  );
}

export default SteuerberaterkostenRechner;
