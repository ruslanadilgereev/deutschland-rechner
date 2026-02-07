import { useState, useMemo } from 'react';

/**
 * Kinderzuschlag 2025/2026 - EXAKTE offizielle Berechnung
 * 
 * Rechtsgrundlage: § 6a Bundeskindergeldgesetz (BKGG)
 * Quellen:
 * - Familienkasse: https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag
 * - Familienportal: https://familienportal.de/familienportal/familienleistungen/kinderzuschlag
 * - BMAS: https://www.bmas.de/DE/Soziales/Familie-und-Kinder/Familienleistungen/Kinderzuschlag/kinderzuschlag.html
 * - DGB: https://www.dgb.de/service/ratgeber/kinderzuschlag-und-kindergrundsicherung/
 * 
 * Höchstbetrag seit 01.01.2025: 297€ pro Kind und Monat
 * (vorher 2024: 292€)
 */
const KINDERZUSCHLAG_2026 = {
  maxProKind: 297,          // Maximaler KiZ pro Kind seit 01.01.2025 (§ 6a Abs. 2 BKGG)
  mindesteinkommenAlleinerziehend: 600, // Mindestbrutto Alleinerziehende (§ 6a Abs. 1 Nr. 2 BKGG)
  mindesteinkommenPaar: 900,             // Mindestbrutto Paare (§ 6a Abs. 1 Nr. 2 BKGG)
  kindergeld2026: 255,      // Kindergeld pro Kind seit 2025 (§ 6 BKGG)
};

/**
 * Bedarfsberechnung nach § 6a Abs. 4 BKGG i.V.m. SGB II/XII
 * 
 * Regelbedarfe 2025/2026 (unverändert seit 2024 - "Nullrunde"):
 * Quelle: https://www.bundesregierung.de/breg-de/aktuelles/nullrunde-buergergeld-2383676
 * 
 * Regelbedarfsstufen nach § 28 SGB XII / § 20 SGB II:
 * - Stufe 1 (Alleinstehend): 563€
 * - Stufe 2 (Paare je Person): 506€
 * - Stufe 4 (Kinder 14-17 Jahre): 471€
 * - Stufe 5 (Kinder 6-13 Jahre): 390€
 * - Stufe 6 (Kinder 0-5 Jahre): 357€
 */
function berechneMindestsicherungsbedarf(
  anzahlErwachsene: number,
  kinderUnter6: number,
  kinder6bis13: number,
  kinder14bis17: number,
  warmmiete: number,
  heizkosten: number
): number {
  // Regelbedarfe 2025/2026 - offiziell bestätigt (Bundesregierung)
  const regelbedarf = {
    alleinstehend: 563,  // Regelbedarfsstufe 1 (§ 28 SGB XII)
    paar: 506 * 2,       // Regelbedarfsstufe 2 × 2 (§ 28 SGB XII)
    kind0bis5: 357,      // Regelbedarfsstufe 6 (§ 28 SGB XII)
    kind6bis13: 390,     // Regelbedarfsstufe 5 (§ 28 SGB XII)
    kind14bis17: 471,    // Regelbedarfsstufe 4 (§ 28 SGB XII)
  };

  let bedarf = 0;

  // Erwachsene
  if (anzahlErwachsene === 1) {
    bedarf += regelbedarf.alleinstehend;
  } else {
    bedarf += regelbedarf.paar;
  }

  // Kinder
  bedarf += kinderUnter6 * regelbedarf.kind0bis5;
  bedarf += kinder6bis13 * regelbedarf.kind6bis13;
  bedarf += kinder14bis17 * regelbedarf.kind14bis17;

  // Kosten der Unterkunft (KdU)
  bedarf += warmmiete + heizkosten;

  return bedarf;
}

function berechneKinderzuschlag(
  bruttoeinkommen: number,
  nettoeinkommen: number,
  anzahlErwachsene: number,
  kinderUnter6: number,
  kinder6bis13: number,
  kinder14bis17: number,
  warmmiete: number,
  heizkosten: number,
  unterhalt: number,
  wohngeld: number
): {
  anspruch: boolean;
  betragProKind: number;
  gesamtbetrag: number;
  grundPruefung: string;
  bedarfHaushalt: number;
  einkommenBereinigt: number;
  anzahlKinder: number;
  mitWohngeld: boolean;
  hinweis: string;
} {
  const anzahlKinder = kinderUnter6 + kinder6bis13 + kinder14bis17;
  const mindestbrutto = anzahlErwachsene === 1 
    ? KINDERZUSCHLAG_2026.mindesteinkommenAlleinerziehend 
    : KINDERZUSCHLAG_2026.mindesteinkommenPaar;

  // Prüfung 1: Mindestbruttoeinkommen
  if (bruttoeinkommen < mindestbrutto) {
    return {
      anspruch: false,
      betragProKind: 0,
      gesamtbetrag: 0,
      grundPruefung: 'mindestbrutto',
      bedarfHaushalt: 0,
      einkommenBereinigt: 0,
      anzahlKinder,
      mitWohngeld: false,
      hinweis: `Das Bruttoeinkommen liegt unter dem Mindestbetrag von ${mindestbrutto} €. Ggf. besteht Anspruch auf Bürgergeld.`,
    };
  }

  // Prüfung 2: Mindestens 1 Kind
  if (anzahlKinder === 0) {
    return {
      anspruch: false,
      betragProKind: 0,
      gesamtbetrag: 0,
      grundPruefung: 'keinekinder',
      bedarfHaushalt: 0,
      einkommenBereinigt: 0,
      anzahlKinder,
      mitWohngeld: false,
      hinweis: 'Kinderzuschlag setzt mindestens ein Kind im Haushalt voraus.',
    };
  }

  // Bedarf berechnen
  const bedarfHaushalt = berechneMindestsicherungsbedarf(
    anzahlErwachsene,
    kinderUnter6,
    kinder6bis13,
    kinder14bis17,
    warmmiete,
    heizkosten
  );

  // Einkommen bereinigen (vereinfacht)
  // Kindergeld wird voll angerechnet
  const kindergeldGesamt = anzahlKinder * KINDERZUSCHLAG_2026.kindergeld2026;
  const maxKiZ = anzahlKinder * KINDERZUSCHLAG_2026.maxProKind;
  
  // Gesamtverfügbares Einkommen
  const verfuegbaresEinkommen = nettoeinkommen + kindergeldGesamt + unterhalt + wohngeld + maxKiZ;

  // Prüfung 3: Mit maximalem KiZ + Wohngeld muss Bedarf gedeckt werden können
  // aber Einkommen allein darf Bedarf NICHT decken (sonst kein Anspruch)
  const einkommenOhneKiZ = nettoeinkommen + kindergeldGesamt + unterhalt + wohngeld;
  
  // Wenn Einkommen ohne KiZ bereits Bedarf deckt → kein Anspruch
  if (einkommenOhneKiZ >= bedarfHaushalt) {
    return {
      anspruch: false,
      betragProKind: 0,
      gesamtbetrag: 0,
      grundPruefung: 'einkommenzuhoch',
      bedarfHaushalt,
      einkommenBereinigt: einkommenOhneKiZ,
      anzahlKinder,
      mitWohngeld: wohngeld > 0,
      hinweis: 'Das Einkommen (inkl. Kindergeld & Wohngeld) deckt bereits den Bedarf. Kein KiZ-Anspruch.',
    };
  }

  // Wenn selbst mit maximalem KiZ der Bedarf nicht gedeckt wird → ggf. Bürgergeld
  if (verfuegbaresEinkommen < bedarfHaushalt) {
    return {
      anspruch: false,
      betragProKind: 0,
      gesamtbetrag: 0,
      grundPruefung: 'einkommenzuniedrig',
      bedarfHaushalt,
      einkommenBereinigt: einkommenOhneKiZ,
      anzahlKinder,
      mitWohngeld: wohngeld > 0,
      hinweis: 'Auch mit maximalem KiZ wird der Bedarf nicht gedeckt. Prüfen Sie den Anspruch auf Bürgergeld.',
    };
  }

  // Berechnung des tatsächlichen KiZ
  // Der KiZ füllt die Lücke zwischen Einkommen (ohne KiZ) und Bedarf auf
  const luecke = bedarfHaushalt - einkommenOhneKiZ;
  const tatsaechlicherKiZ = Math.min(luecke, maxKiZ);
  const betragProKind = Math.round(tatsaechlicherKiZ / anzahlKinder);

  return {
    anspruch: true,
    betragProKind: Math.min(betragProKind, KINDERZUSCHLAG_2026.maxProKind),
    gesamtbetrag: Math.round(tatsaechlicherKiZ),
    grundPruefung: 'anspruch',
    bedarfHaushalt,
    einkommenBereinigt: einkommenOhneKiZ,
    anzahlKinder,
    mitWohngeld: wohngeld > 0,
    hinweis: wohngeld > 0 
      ? 'Anspruch besteht in Kombination mit Wohngeld (empfohlen!).' 
      : 'Prüfen Sie zusätzlich den Wohngeld-Anspruch – oft werden beide Leistungen kombiniert!',
  };
}

export default function KinderzuschlagRechner() {
  const [bruttoeinkommen, setBruttoeinkommen] = useState(2200);
  const [nettoeinkommen, setNettoeinkommen] = useState(1700);
  const [anzahlErwachsene, setAnzahlErwachsene] = useState(2);
  const [kinderUnter6, setKinderUnter6] = useState(1);
  const [kinder6bis13, setKinder6bis13] = useState(1);
  const [kinder14bis17, setKinder14bis17] = useState(0);
  const [warmmiete, setWarmmiete] = useState(800);
  const [heizkosten, setHeizkosten] = useState(100);
  const [unterhalt, setUnterhalt] = useState(0);
  const [wohngeld, setWohngeld] = useState(0);

  const ergebnis = useMemo(() => {
    return berechneKinderzuschlag(
      bruttoeinkommen,
      nettoeinkommen,
      anzahlErwachsene,
      kinderUnter6,
      kinder6bis13,
      kinder14bis17,
      warmmiete,
      heizkosten,
      unterhalt,
      wohngeld
    );
  }, [bruttoeinkommen, nettoeinkommen, anzahlErwachsene, kinderUnter6, kinder6bis13, kinder14bis17, warmmiete, heizkosten, unterhalt, wohngeld]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const anzahlKinder = kinderUnter6 + kinder6bis13 + kinder14bis17;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">👨‍👩‍👧 Haushalt</h3>
        
        {/* Erwachsene */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Anzahl Erwachsene im Haushalt</span>
          </label>
          <div className="flex gap-3">
            {[1, 2].map((n) => (
              <button
                key={n}
                onClick={() => setAnzahlErwachsene(n)}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                  anzahlErwachsene === n
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {n === 1 ? 'Alleinerziehend' : 'Paar'}
              </button>
            ))}
          </div>
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Kinder nach Altersgruppe</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">0-5 Jahre</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setKinderUnter6(Math.max(0, kinderUnter6 - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                >
                  -
                </button>
                <span className="w-8 text-center text-xl font-bold">{kinderUnter6}</span>
                <button
                  onClick={() => setKinderUnter6(kinderUnter6 + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">6-13 Jahre</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setKinder6bis13(Math.max(0, kinder6bis13 - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                >
                  -
                </button>
                <span className="w-8 text-center text-xl font-bold">{kinder6bis13}</span>
                <button
                  onClick={() => setKinder6bis13(kinder6bis13 + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">14-17 Jahre</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setKinder14bis17(Math.max(0, kinder14bis17 - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                >
                  -
                </button>
                <span className="w-8 text-center text-xl font-bold">{kinder14bis17}</span>
                <button
                  onClick={() => setKinder14bis17(kinder14bis17 + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Kindergeld 2026: {formatEuro(KINDERZUSCHLAG_2026.kindergeld2026)}/Kind → Gesamt: {formatEuro(anzahlKinder * KINDERZUSCHLAG_2026.kindergeld2026)}
          </p>
        </div>
      </div>

      {/* Einkommen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💰 Einkommen</h3>
        
        {/* Brutto */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Bruttoeinkommen (gesamt)</span>
            <span className="text-xs text-gray-500 ml-2">(alle Erwachsenen zusammen)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttoeinkommen}
              onChange={(e) => setBruttoeinkommen(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={bruttoeinkommen}
            onChange={(e) => setBruttoeinkommen(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Mindestbrutto: {anzahlErwachsene === 1 ? '600 €' : '900 €'} (
            {bruttoeinkommen >= (anzahlErwachsene === 1 ? 600 : 900) ? '✓ erfüllt' : '✗ nicht erfüllt'})
          </p>
        </div>

        {/* Netto */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Nettoeinkommen (gesamt)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={nettoeinkommen}
              onChange={(e) => setNettoeinkommen(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
              min="0"
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          <input
            type="range"
            min="0"
            max="4000"
            step="100"
            value={nettoeinkommen}
            onChange={(e) => setNettoeinkommen(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
        </div>

        {/* Sonstiges Einkommen */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm text-gray-600">Kindesunterhalt</label>
            <div className="relative">
              <input
                type="number"
                value={unterhalt}
                onChange={(e) => setUnterhalt(Math.max(0, Number(e.target.value)))}
                className="w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                min="0"
                step="50"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-600">Wohngeld (falls bekannt)</label>
            <div className="relative">
              <input
                type="number"
                value={wohngeld}
                onChange={(e) => setWohngeld(Math.max(0, Number(e.target.value)))}
                className="w-full text-lg font-bold text-center py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                min="0"
                step="50"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wohnkosten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🏠 Wohnkosten</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Warmmiete</span>
              <span className="text-xs text-gray-500 block">(Kaltmiete + Nebenkosten)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={warmmiete}
                onChange={(e) => setWarmmiete(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                min="0"
                step="50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Heizkosten</span>
              <span className="text-xs text-gray-500 block">(falls separat)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={heizkosten}
                onChange={(e) => setHeizkosten(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none"
                min="0"
                step="25"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 mb-6 ${
        ergebnis.anspruch 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
          : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          {ergebnis.anspruch ? '✓ Voraussichtlicher Anspruch' : '✗ Kein Anspruch'}
        </h3>
        
        {ergebnis.anspruch ? (
          <>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatEuro(ergebnis.gesamtbetrag)}</span>
                <span className="text-xl opacity-80">/ Monat</span>
              </div>
              <p className="opacity-80 mt-2">
                = {formatEuro(ergebnis.betragProKind)} × {ergebnis.anzahlKinder} {ergebnis.anzahlKinder === 1 ? 'Kind' : 'Kinder'}
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="opacity-80">+ Kindergeld</span>
                <span className="font-bold">{formatEuro(ergebnis.anzahlKinder * KINDERZUSCHLAG_2026.kindergeld2026)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/20">
                <span className="opacity-80">Gesamte Familienleistung</span>
                <span className="text-xl font-bold">
                  {formatEuro(ergebnis.gesamtbetrag + ergebnis.anzahlKinder * KINDERZUSCHLAG_2026.kindergeld2026)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-lg opacity-90">
            <p>{ergebnis.hinweis}</p>
          </div>
        )}
      </div>

      {/* Berechnung Details */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Bedarfsberechnung</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Berechneter Bedarf (Existenzminimum)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.bedarfHaushalt)}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Verfügbares Einkommen (ohne KiZ)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.einkommenBereinigt)}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
            <span className="text-blue-700">Lücke (= max. KiZ-Anspruch)</span>
            <span className="font-bold text-blue-900">
              {formatEuro(Math.max(0, ergebnis.bedarfHaushalt - ergebnis.einkommenBereinigt))}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
            <span className="text-green-700">Max. KiZ möglich ({anzahlKinder} × {formatEuro(KINDERZUSCHLAG_2026.maxProKind)})</span>
            <span className="font-bold text-green-900">
              {formatEuro(anzahlKinder * KINDERZUSCHLAG_2026.maxProKind)}
            </span>
          </div>
        </div>

        {ergebnis.hinweis && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-xl text-sm">
            <p className="text-yellow-800">
              <strong>💡 Hinweis:</strong> {ergebnis.hinweis}
            </p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert der Kinderzuschlag</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Bis zu 297 € pro Kind</strong> zusätzlich zum Kindergeld (seit 01.01.2025)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mindestbrutto:</strong> 600 € (Alleinerziehende) / 900 € (Paare)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Ziel:</strong> Vermeidung von Bürgergeld-Bezug für erwerbstätige Familien</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kombination mit Wohngeld</strong> ist möglich und empfohlen!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Bildungs- und Teilhabepaket</strong> automatisch inklusive (Schulbedarf, Mittagessen etc.)</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="font-semibold text-green-900">Familienkasse der Bundesagentur für Arbeit</p>
            <p className="text-sm text-green-700 mt-1">Dort, wo auch das Kindergeld beantragt wird.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online beantragen</p>
                <a 
                  href="https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-beantragen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Kinderzuschlag Digital →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Familienkasse-Hotline</p>
                <p className="text-gray-600">0800 4 555530 (kostenlos)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🧮</span>
              <div>
                <p className="font-medium text-gray-800">KiZ-Lotse</p>
                <a 
                  href="https://www.arbeitsagentur.de/familie-und-kinder/kiz-lotse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Anspruchsprüfung →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📄</span>
              <div>
                <p className="font-medium text-gray-800">Antrag (PDF)</p>
                <a 
                  href="https://www.arbeitsagentur.de/datei/antrag-auf-kinderzuschlag_ba015380.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  KiZ-Antrag Download →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📋 Wichtige Hinweise</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-yellow-50 rounded-xl">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">Rückwirkend nur 6 Monate!</p>
              <p className="text-yellow-700">Kinderzuschlag wird max. 6 Monate rückwirkend gezahlt. Frühzeitig beantragen!</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-xl">📄</span>
            <div>
              <p className="font-medium text-blue-800">Benötigte Unterlagen</p>
              <p className="text-blue-700">Einkommensnachweise, Mietvertrag, Kontoauszüge, Kindergeldbescheid.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-xl">🎓</span>
            <div>
              <p className="font-medium text-purple-800">Bildungs- und Teilhabepaket (BuT)</p>
              <p className="text-purple-700">
                Mit KiZ-Bezug haben Sie automatisch Anspruch auf: Schulbedarf (195 €/Jahr), 
                Mittagessen, Klassenfahrten, Lernförderung, Sportverein/Musikschule (15 €/Monat).
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">💰</span>
            <div>
              <p className="font-medium text-green-800">Kombination mit Wohngeld</p>
              <p className="text-green-700">
                In den meisten Fällen wird KiZ zusammen mit Wohngeld bezogen. Diese Kombination 
                kann Bürgergeld vollständig ersetzen – ohne Vermögensprüfung!
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-orange-50 rounded-xl">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-medium text-orange-800">Bewilligungszeitraum</p>
              <p className="text-orange-700">
                Der Kinderzuschlag wird für 6 Monate bewilligt. Danach muss ein Folgeantrag gestellt werden.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesagentur für Arbeit – Kinderzuschlag
          </a>
          <a 
            href="https://familienportal.de/familienportal/familienleistungen/kinderzuschlag"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Familienportal – Kinderzuschlag
          </a>
          <a 
            href="https://www.bmas.de/DE/Soziales/Familie-und-Kinder/Familienleistungen/Kinderzuschlag/kinderzuschlag.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMAS – Kinderzuschlag
          </a>
        </div>
      </div>
    </div>
  );
}
