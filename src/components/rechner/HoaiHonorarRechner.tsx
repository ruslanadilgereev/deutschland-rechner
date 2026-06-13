import { useState, useMemo } from 'react';

// ============================================================================
// HOAI 2021 (Honorarordnung für Architekten und Ingenieure i.d.F. v. 02.12.2020,
// gültig seit 01.01.2021). Honorartafel § 35 (Gebäude und Innenräume),
// § 13 lineare Interpolation, § 34 Leistungsphasen Gebäude.
// Quelle: gesetze-im-internet.de
// ============================================================================

const UST_SATZ = 0.19; // 19 % Umsatzsteuer auf das (Netto-)Honorar
const K_MIN = 25000; // unterste Tafelstufe § 35 HOAI
const K_MAX = 25000000; // oberste Tafelstufe § 35 HOAI

// --- § 35 HOAI – Honorartafel Gebäude und Innenräume (Nettohonorare in €) ---
// Spalten: anrechenbareKosten | I_von | I_bis | II_von | II_bis | III_von | III_bis | IV_von | IV_bis | V_von | V_bis
const HONORARTAFEL: number[][] = [
  [25000, 3120, 3657, 3657, 4339, 4339, 5412, 5412, 6094, 6094, 6631],
  [35000, 4217, 4942, 4942, 5865, 5865, 7315, 7315, 8237, 8237, 8962],
  [50000, 5804, 6801, 6801, 8071, 8071, 10066, 10066, 11336, 11336, 12333],
  [75000, 8342, 9776, 9776, 11601, 11601, 14469, 14469, 16293, 16293, 17727],
  [100000, 10790, 12644, 12644, 15005, 15005, 18713, 18713, 21074, 21074, 22928],
  [150000, 15500, 18164, 18164, 21555, 21555, 26883, 26883, 30274, 30274, 32938],
  [200000, 20037, 23480, 23480, 27863, 27863, 34751, 34751, 39134, 39134, 42578],
  [300000, 28750, 33692, 33692, 39981, 39981, 49864, 49864, 56153, 56153, 61095],
  [500000, 45232, 53006, 53006, 62900, 62900, 78449, 78449, 88343, 88343, 96118],
  [750000, 64666, 75781, 75781, 89927, 89927, 112156, 112156, 126301, 126301, 137416],
  [1000000, 83182, 97479, 97479, 115675, 115675, 144268, 144268, 162464, 162464, 176761],
  [1500000, 119307, 139813, 139813, 165911, 165911, 206923, 206923, 233022, 233022, 253527],
  [2000000, 153965, 180428, 180428, 214108, 214108, 267034, 267034, 300714, 300714, 327177],
  [3000000, 220161, 258002, 258002, 306162, 306162, 381843, 381843, 430003, 430003, 467843],
  [5000000, 343879, 402984, 402984, 478207, 478207, 596416, 596416, 671640, 671640, 730744],
  [7500000, 493923, 578816, 578816, 686862, 686862, 856648, 856648, 964694, 964694, 1049587],
  [10000000, 638277, 747981, 747981, 887604, 887604, 1107012, 1107012, 1246635, 1246635, 1356339],
  [15000000, 915129, 1072416, 1072416, 1272601, 1272601, 1587176, 1587176, 1787360, 1787360, 1944648],
  [20000000, 1180414, 1383298, 1383298, 1641513, 1641513, 2047281, 2047281, 2305496, 2305496, 2508380],
  [25000000, 1436874, 1683837, 1683837, 1998153, 1998153, 2492079, 2492079, 2806395, 2806395, 3053358],
];

// Honorarzonen § 35 Abs. 6 HOAI
const ZONEN = [
  { id: 1, label: 'I', kurz: 'sehr gering', vonIdx: 1, bisIdx: 2 },
  { id: 2, label: 'II', kurz: 'gering', vonIdx: 3, bisIdx: 4 },
  { id: 3, label: 'III', kurz: 'durchschnittlich', vonIdx: 5, bisIdx: 6 },
  { id: 4, label: 'IV', kurz: 'hoch', vonIdx: 7, bisIdx: 8 },
  { id: 5, label: 'V', kurz: 'sehr hoch', vonIdx: 9, bisIdx: 10 },
] as const;

// § 34 HOAI – Leistungsphasen Gebäude (Prozentsätze, Summe = 100 %)
const LEISTUNGSPHASEN = [
  { nr: 1, name: 'Grundlagenermittlung', proz: 2 },
  { nr: 2, name: 'Vorplanung', proz: 7 },
  { nr: 3, name: 'Entwurfsplanung', proz: 15 },
  { nr: 4, name: 'Genehmigungsplanung', proz: 3 },
  { nr: 5, name: 'Ausführungsplanung', proz: 25 },
  { nr: 6, name: 'Vorbereitung der Vergabe', proz: 10 },
  { nr: 7, name: 'Mitwirkung bei der Vergabe', proz: 4 },
  { nr: 8, name: 'Objektüberwachung (Bauüberwachung)', proz: 32 },
  { nr: 9, name: 'Objektbetreuung', proz: 2 },
];

type SatzTyp = 'basis' | 'mitte' | 'oben';

// § 13 HOAI – lineare Interpolation des Spalten-Tafelwerts (von oder bis) für K
function interpoliere(spalte: number, k: number): number {
  const erste = HONORARTAFEL[0];
  const letzte = HONORARTAFEL[HONORARTAFEL.length - 1];
  if (k <= erste[0]) return erste[spalte];
  if (k >= letzte[0]) return letzte[spalte];
  for (let i = 0; i < HONORARTAFEL.length - 1; i++) {
    const k1 = HONORARTAFEL[i][0];
    const k2 = HONORARTAFEL[i + 1][0];
    if (k >= k1 && k <= k2) {
      const h1 = HONORARTAFEL[i][spalte];
      const h2 = HONORARTAFEL[i + 1][spalte];
      return h1 + ((k - k1) / (k2 - k1)) * (h2 - h1);
    }
  }
  return letzte[spalte];
}

export function HoaiHonorarRechner() {
  // Eingaben
  const [kosten, setKosten] = useState(350000); // anrechenbare Kosten in €
  const [zoneId, setZoneId] = useState(3); // Honorarzone (Default III)
  const [satzTyp, setSatzTyp] = useState<SatzTyp>('mitte'); // Default Mittelsatz
  const [lphAnteil, setLphAnteil] = useState(100); // gewählter Leistungsphasen-Anteil in %
  const [mitUst, setMitUst] = useState(true); // 19 % USt ausweisen

  const zone = ZONEN.find((z) => z.id === zoneId) ?? ZONEN[2];

  const ergebnis = useMemo(() => {
    const rohK = Math.max(0, kosten);
    const unterMindest = rohK > 0 && rohK < K_MIN;
    const ueberMax = rohK > K_MAX;
    // Frei vereinbar außerhalb der Tafel – zur Schätzung mit den Tafelgrenzen rechnen
    const k = Math.min(Math.max(rohK, K_MIN), K_MAX);

    // von-/bis-Wert der gewählten Zone bei K (§ 13 interpoliert)
    const vonWert = interpoliere(zone.vonIdx, k);
    const bisWert = interpoliere(zone.bisIdx, k);
    const mitteWert = (vonWert + bisWert) / 2;

    const vollesHonorar =
      satzTyp === 'basis' ? vonWert : satzTyp === 'oben' ? bisWert : mitteWert;

    // Leistungsphasen-Anteil (§ 34) anwenden
    const anteilFaktor = Math.min(Math.max(lphAnteil, 0), 100) / 100;
    const netto = vollesHonorar * anteilFaktor;

    const ust = mitUst ? netto * UST_SATZ : 0;
    const brutto = netto + ust;

    return {
      rohK,
      k,
      unterMindest,
      ueberMax,
      vonWert,
      bisWert,
      mitteWert,
      vollesHonorar,
      anteilFaktor,
      netto,
      ust,
      brutto,
    };
  }, [kosten, zone, satzTyp, lphAnteil, mitUst]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  const satzLabel = satzTyp === 'basis' ? 'Basissatz (von)' : satzTyp === 'oben' ? 'Oberer Satz (bis)' : 'Mittelsatz';

  const lphSumme = LEISTUNGSPHASEN.reduce((s, p) => s + p.proz, 0);

  return (
    <div className="max-w-2xl mx-auto">

      {/* Eingabe: anrechenbare Kosten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="mb-2">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anrechenbare Kosten (nach DIN 276)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Maßgebend sind die anrechenbaren Herstellungskosten des Gebäudes (i. d. R. Kostengruppen
              300 + 400 nach DIN 276), aus denen sich das Honorar nach der Tafel des § 35 HOAI ergibt.
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={kosten}
              onChange={(e) => setKosten(Math.max(0, Number(e.target.value) || 0))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="0"
              step="10000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={Math.min(kosten, 2000000)}
            onChange={(e) => setKosten(Number(e.target.value) || 0)}
            className="w-full mt-3 accent-orange-500"
            min="0"
            max={2000000}
            step={5000}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 €</span>
            <span>1.000.000 €</span>
            <span>2.000.000 €</span>
          </div>
          {ergebnis.unterMindest && (
            <p className="text-xs text-amber-600 mt-2">
              Unter 25.000 € anrechenbaren Kosten enthält die HOAI-Tafel keine Werte – das Honorar ist
              dann frei vereinbar (§ 7 HOAI). Gerechnet wird mit der Mindeststufe von 25.000 €.
            </p>
          )}
          {ergebnis.ueberMax && (
            <p className="text-xs text-amber-600 mt-2">
              Über 25.000.000 € anrechenbaren Kosten endet die HOAI-Tafel – das Honorar ist dann frei
              vereinbar. Gerechnet wird mit dem obersten Tafelwert (25.000.000 €).
            </p>
          )}
        </div>
      </div>

      {/* Eingabe: Honorarzone */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-2">
          <span className="text-gray-700 font-medium">Honorarzone (§ 35 Abs. 6 HOAI)</span>
          <span className="text-xs text-gray-500 block mt-1">
            Die Honorarzone richtet sich nach den Planungsanforderungen. Zone III (durchschnittliche
            Anforderungen) ist der häufigste Fall – etwa ein normales Wohnhaus.
          </span>
        </label>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {ZONEN.map((z) => (
            <button
              key={z.id}
              onClick={() => setZoneId(z.id)}
              className={`px-2 py-3 text-sm rounded-xl text-center transition-all ${
                zoneId === z.id
                  ? 'bg-orange-600 text-white font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="block text-base font-bold">{z.label}</span>
              <span className={`block text-[10px] mt-0.5 ${zoneId === z.id ? 'text-orange-100' : 'text-gray-400'}`}>
                {z.kurz}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Eingabe: Honorarsatz */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block mb-2">
          <span className="text-gray-700 font-medium">Honorarsatz innerhalb der Zone</span>
          <span className="text-xs text-gray-500 block mt-1">
            Jede Tafelzelle hat einen unteren (von) und einen oberen (bis) Wert. Voreingestellt ist der
            Mittelsatz – der häufig vereinbarte mittlere Wert.
          </span>
        </label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { id: 'basis' as SatzTyp, label: 'Basissatz', sub: 'von-Wert', wert: ergebnis.vonWert },
            { id: 'mitte' as SatzTyp, label: 'Mittelsatz', sub: '(von + bis)/2', wert: ergebnis.mitteWert },
            { id: 'oben' as SatzTyp, label: 'Oberer Satz', sub: 'bis-Wert', wert: ergebnis.bisWert },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSatzTyp(opt.id)}
              className={`px-2 py-3 text-sm rounded-xl text-center transition-all ${
                satzTyp === opt.id
                  ? 'bg-orange-600 text-white font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="block font-semibold">{opt.label}</span>
              <span className={`block text-[10px] mt-0.5 ${satzTyp === opt.id ? 'text-orange-100' : 'text-gray-400'}`}>
                {opt.sub}
              </span>
              <span className={`block text-xs mt-1 ${satzTyp === opt.id ? 'text-white' : 'text-gray-500'}`}>
                {formatEuroRound(opt.wert)}
              </span>
            </button>
          ))}
        </div>

        {/* Leistungsphasen-Anteil */}
        <div className="mt-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Leistungsphasen-Anteil (§ 34 HOAI)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Volle Beauftragung = 100 % (alle 9 Leistungsphasen). Bei Teilbeauftragung den Prozentsatz
              der gewählten Leistungsphasen eintragen.
            </span>
          </label>
          <div className="text-center my-3">
            <span className="text-3xl font-bold text-orange-700">{lphAnteil} %</span>
          </div>
          <input
            type="range"
            value={lphAnteil}
            onChange={(e) => setLphAnteil(Number(e.target.value) || 0)}
            className="w-full accent-orange-500"
            min={0}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 %</span>
            <span className="text-orange-600">100 % (volle Leistung)</span>
          </div>
        </div>

        {/* USt-Toggle */}
        <label className="flex items-center gap-3 mt-5 cursor-pointer">
          <input
            type="checkbox"
            checked={mitUst}
            onChange={(e) => setMitUst(e.target.checked)}
            className="w-5 h-5 accent-orange-500"
          />
          <span className="text-sm text-gray-700">
            19 % Umsatzsteuer einrechnen – HOAI-Tafelwerte sind Nettohonorare
          </span>
        </label>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          📐 Architektenhonorar nach HOAI § 35 ({mitUst ? 'brutto' : 'netto'})
        </h3>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.brutto)}</span>
          </div>
          <p className="text-orange-100 mt-2 text-sm">
            {satzLabel} der Honorarzone {zone.label} bei {formatEuroRound(ergebnis.k)} anrechenbaren
            Kosten · {ergebnis.anteilFaktor === 1 ? 'volle Leistung (100 %)' : `${lphAnteil} % der Leistungsphasen`}
            {mitUst ? ' · inkl. 19 % USt' : ' · netto'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Nettohonorar</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.netto)}</div>
            <span className="text-xs opacity-70">{satzLabel}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">19 % USt</span>
            <div className="text-lg font-bold">{formatEuroRound(ergebnis.ust)}</div>
            <span className="text-xs opacity-70">{mitUst ? 'aufgeschlagen' : 'nicht gerechnet'}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-xs opacity-80">Honorarzone</span>
            <div className="text-lg font-bold">{zone.label}</div>
            <span className="text-xs opacity-70">{zone.kurz}</span>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 So wird das Honorar berechnet</h3>

        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            1. Anrechenbare Kosten &amp; Tafelwerte (§ 35, § 13 Interpolation)
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Maßgebliche anrechenbare Kosten</span>
            <span className="text-gray-900">{formatEuroRound(ergebnis.k)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Zone {zone.label} – unterer Wert (von)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.vonWert)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Zone {zone.label} – oberer Wert (bis)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.bisWert)}</span>
          </div>

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            2. Volles Honorar ({satzLabel})
          </div>
          <div className="flex justify-between py-2 bg-orange-50 -mx-6 px-6">
            <span className="font-medium text-orange-700">= Honorar für alle 9 Leistungsphasen (100 %)</span>
            <span className="font-bold text-orange-900">{formatEuro(ergebnis.vollesHonorar)}</span>
          </div>

          {ergebnis.anteilFaktor !== 1 && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                3. Leistungsphasen-Anteil (§ 34 HOAI)
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Volles Honorar × {lphAnteil} %</span>
                <span className="text-gray-900">
                  {formatEuro(ergebnis.vollesHonorar)} × {(ergebnis.anteilFaktor).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </>
          )}

          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            {ergebnis.anteilFaktor !== 1 ? '4.' : '3.'} Umsatzsteuer &amp; Bruttohonorar
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Nettohonorar</span>
            <span className="text-gray-900">{formatEuro(ergebnis.netto)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">zzgl. {mitUst ? '19 % Umsatzsteuer' : 'Umsatzsteuer (nicht gerechnet)'}</span>
            <span className="text-gray-900">{formatEuro(ergebnis.ust)}</span>
          </div>
          <div className="flex justify-between py-2 bg-orange-100 -mx-6 px-6">
            <span className="font-bold text-orange-800">= Honorar gesamt</span>
            <span className="font-bold text-2xl text-orange-900">{formatEuro(ergebnis.brutto)}</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-orange-50 rounded-xl text-sm text-orange-800">
          💡 Die HOAI-Honorartafel (§ 35) liefert für jede anrechenbare Kostenstufe einen unteren und
          oberen Wert je Honorarzone. Zwischenwerte werden nach § 13 HOAI <strong>linear interpoliert</strong>.
          Seit der HOAI-Novelle 2021 sind diese Werte nur noch eine unverbindliche Orientierung.
        </div>
      </div>

      {/* Spannweite: Basis / Mitte / Oben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📍 Spannweite der Honorarzone {zone.label} ({mitUst ? 'brutto inkl. USt' : 'netto'})</h3>
        <p className="text-sm text-gray-500 mb-4">
          So viel umfasst die HOAI-Tafel für diese Zone bei {formatEuroRound(ergebnis.k)} anrechenbaren
          Kosten und {lphAnteil} % der Leistungsphasen – vom Basissatz bis zum oberen Satz:
        </p>
        <div className="space-y-3">
          {[
            { label: 'Basissatz (von)', typ: 'basis' as SatzTyp, wert: ergebnis.vonWert },
            { label: 'Mittelsatz', typ: 'mitte' as SatzTyp, wert: ergebnis.mitteWert },
            { label: 'Oberer Satz (bis)', typ: 'oben' as SatzTyp, wert: ergebnis.bisWert },
          ].map((row) => {
            const netto = row.wert * ergebnis.anteilFaktor;
            const b = netto * (mitUst ? 1 + UST_SATZ : 1);
            const isAktuell = row.typ === satzTyp;
            return (
              <div
                key={row.label}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isAktuell ? 'bg-orange-100 border-2 border-orange-300' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isAktuell ? 'text-orange-800' : 'text-gray-600'}`}>
                    {row.label}
                  </span>
                </div>
                <div className={`font-bold ${isAktuell ? 'text-orange-900' : 'text-gray-800'}`}>
                  {formatEuro(b)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leistungsphasen-Übersicht */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🗂️ Leistungsphasen Gebäude (§ 34 HOAI)</h3>
        <p className="text-sm text-gray-500 mb-4">
          Das volle Honorar verteilt sich auf 9 Leistungsphasen. Wird nur ein Teil beauftragt, gilt nur
          der entsprechende Prozentsatz:
        </p>
        <div className="space-y-1">
          {LEISTUNGSPHASEN.map((p) => (
            <div key={p.nr} className="flex items-center justify-between py-1.5 border-b border-gray-100 text-sm">
              <span className="text-gray-600">
                <strong className="text-gray-800">LPH {p.nr}</strong> {p.name}
              </span>
              <span className="font-medium text-gray-800">{p.proz} %</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="font-bold text-gray-800">Summe (volle Leistung)</span>
            <span className="font-bold text-orange-700">{lphSumme} %</span>
          </div>
        </div>
      </div>

      {/* Disclaimer HOAI 2021 / EuGH */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-2">⚠️ Wichtiger Hinweis</h3>
        <p className="text-sm text-amber-700">
          Die HOAI-Honorartafeln sind seit dem EuGH-Urteil vom 04.07.2019 (Rechtssache C-377/17) und der
          HOAI-Novelle 2021 nur noch eine <strong>unverbindliche Orientierung</strong>. Die früheren
          Mindest- und Höchstsätze sind <strong>nicht mehr verbindlich</strong> – Architekten- und
          Ingenieurhonorare können seither frei vereinbart werden. Dieser Rechner liefert eine
          <strong> Schätzung ohne Gewähr</strong> auf Basis der HOAI-2021-Honorartafel (§ 35) und ersetzt
          keine Steuer-, Rechts- oder Honorarberatung. Das tatsächliche Honorar ergibt sich aus dem
          individuellen Architektenvertrag. Für ein verbindliches Angebot wenden Sie sich an einen
          Architekten oder Ingenieur.
        </p>
      </div>

      {/* Standard-Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-2">ℹ️ Schätzung – keine Steuer-/Rechtsberatung</h3>
        <p className="text-sm text-amber-700">
          Alle Ergebnisse sind unverbindliche Orientierungswerte ohne Gewähr und stellen keine Steuer-,
          Rechts- oder Honorarberatung dar. Maßgeblich sind die HOAI im jeweils gültigen Wortlaut und der
          konkrete Architekten- bzw. Ingenieurvertrag.
        </p>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a
            href="https://www.gesetze-im-internet.de/hoai_2013/__13.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 13 HOAI – Interpolation der Honorartafelwerte – Gesetze im Internet
          </a>
          <a
            href="https://www.gesetze-im-internet.de/hoai_2013/__34.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 34 HOAI – Leistungsbild Gebäude und Innenräume (Leistungsphasen) – Gesetze im Internet
          </a>
          <a
            href="https://www.gesetze-im-internet.de/hoai_2013/__35.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 35 HOAI – Honorare für Grundleistungen (Honorartafel Gebäude/Innenräume) – Gesetze im Internet
          </a>
        </div>
      </div>
    </div>
  );
}

export default HoaiHonorarRechner;
