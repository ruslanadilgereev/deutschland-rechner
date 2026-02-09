import { useState, useMemo } from 'react';

// === OFFIZIELLE WERTE 2026 (Stand: 1. Juli 2025 - 30. Juni 2026) ===
// Quelle: Deutsche Rentenversicherung, § 46 SGB VI, § 97 SGB VI

// Aktueller Rentenwert (bundeseinheitlich ab 01.07.2025)
const RENTENWERT_2025 = 40.79; // Euro pro Entgeltpunkt

// Freibeträge für Einkommensanrechnung (§ 97 SGB VI)
const FREIBETRAG_FAKTOR = 26.4; // 26,4-faches des Rentenwerts
const FREIBETRAG_KIND_FAKTOR = 5.6; // 5,6-faches pro Kind

// Berechnete Freibeträge
const FREIBETRAG_BASIS = RENTENWERT_2025 * FREIBETRAG_FAKTOR; // 1.076,86 €
const FREIBETRAG_PRO_KIND = RENTENWERT_2025 * FREIBETRAG_KIND_FAKTOR; // 228,42 €

// Rentenartfaktoren (§ 67 SGB VI, § 255 SGB VI)
const RENTENARTFAKTOR_GROSS_NEU = 0.55; // 55% (neues Recht ab 2002)
const RENTENARTFAKTOR_GROSS_ALT = 0.60; // 60% (altes Recht)
const RENTENARTFAKTOR_KLEIN = 0.25; // 25%

// Pauschalabzüge für Netto-Ermittlung (§ 18b SGB IV)
const PAUSCHALABZUG_ARBEITSEINKOMMEN = 0.40; // 40%
const PAUSCHALABZUG_RENTE_NEU = 0.14; // 14% (Rentenbezug ab 2011)
const PAUSCHALABZUG_RENTE_ALT = 0.13; // 13% (Rentenbezug vor 2011)

// Anrechnungssatz
const ANRECHNUNGSSATZ = 0.40; // 40% des übersteigenden Einkommens

// Altersgrenze für große Witwenrente 2026 (§ 242a Abs. 4 SGB VI)
const ALTERSGRENZE_2026 = { jahre: 46, monate: 6 }; // 46 Jahre 6 Monate

// KV/PV-Beiträge auf Renten (ca.)
const KV_BEITRAG = 0.073; // 7,3% + Zusatzbeitrag
const KV_ZUSATZBEITRAG = 0.019; // ca. 1,9% durchschnittlich
const PV_BEITRAG = 0.018; // 1,8% (AN-Anteil ab 2024)
const PV_ZUSCHLAG_KINDERLOS = 0.006; // +0,6% für Kinderlose ab 23

export default function WitwenrenteRechner() {
  // Eingabewerte
  const [renteVerstorbener, setRenteVerstorbener] = useState(1800);
  const [alterHinterbliebener, setAlterHinterbliebener] = useState(55);
  const [hatKinder, setHatKinder] = useState(false);
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const [kinderUnter18, setKinderUnter18] = useState(0);
  const [istErwerbsgemindert, setIstErwerbsgemindert] = useState(false);
  
  // Einkommen des Hinterbliebenen
  const [eigeneRente, setEigeneRente] = useState(0);
  const [arbeitseinkommen, setArbeitseinkommen] = useState(0);
  const [rentenbezugAb2011, setRentenbezugAb2011] = useState(true);
  
  // Altes vs. neues Recht
  const [altesRecht, setAltesRecht] = useState(false);
  
  // Sterbevierteljahr
  const [sterbevierteljahr, setSterbevierteljahr] = useState(false);

  const ergebnis = useMemo(() => {
    // === 1. Bestimme Art der Witwenrente ===
    const alterInMonaten = alterHinterbliebener * 12;
    const altersgrenzeInMonaten = ALTERSGRENZE_2026.jahre * 12 + ALTERSGRENZE_2026.monate;
    
    const erfuelltAltersgrenze = alterInMonaten >= altersgrenzeInMonaten;
    const erfuelltKindererziehung = kinderUnter18 > 0;
    const erfuelltErwerbsminderung = istErwerbsgemindert;
    
    const anspruchGrosseWitwenrente = erfuelltAltersgrenze || erfuelltKindererziehung || erfuelltErwerbsminderung;
    
    // Grund für große Witwenrente
    let grundGrosseRente = '';
    if (erfuelltKindererziehung) grundGrosseRente = 'Kindererziehung (Kind unter 18)';
    else if (erfuelltAltersgrenze) grundGrosseRente = `Altersgrenze erreicht (≥ ${ALTERSGRENZE_2026.jahre} Jahre ${ALTERSGRENZE_2026.monate} Monate)`;
    else if (erfuelltErwerbsminderung) grundGrosseRente = 'Erwerbsminderung';
    
    // === 2. Rentenartfaktor bestimmen ===
    const rentenartfaktor = anspruchGrosseWitwenrente
      ? (altesRecht ? RENTENARTFAKTOR_GROSS_ALT : RENTENARTFAKTOR_GROSS_NEU)
      : RENTENARTFAKTOR_KLEIN;
    
    const prozentVonRente = rentenartfaktor * 100;
    
    // === 3. Brutto-Witwenrente berechnen ===
    let bruttoWitwenrente = renteVerstorbener * rentenartfaktor;
    
    // Bei Sterbevierteljahr: volle Rente
    const bruttoSterbevierteljahr = renteVerstorbener;
    
    // === 4. Einkommensanrechnung (§ 97 SGB VI) ===
    // 4a. Freibetrag berechnen
    const waisenrentenberechtigteKinder = anzahlKinder; // Vereinfachung
    const freibetrag = FREIBETRAG_BASIS + (waisenrentenberechtigteKinder * FREIBETRAG_PRO_KIND);
    
    // 4b. Anrechenbares Netto-Einkommen ermitteln
    // Eigene Rente
    const pauschalabzugRente = rentenbezugAb2011 ? PAUSCHALABZUG_RENTE_NEU : PAUSCHALABZUG_RENTE_ALT;
    const nettoEigeneRente = eigeneRente * (1 - pauschalabzugRente);
    
    // Arbeitseinkommen
    const nettoArbeitseinkommen = arbeitseinkommen * (1 - PAUSCHALABZUG_ARBEITSEINKOMMEN);
    
    // Gesamtes anrechenbares Netto
    const anrechenbaresNetto = nettoEigeneRente + nettoArbeitseinkommen;
    
    // 4c. Einkommensanrechnung
    const uebersteigenderBetrag = Math.max(0, anrechenbaresNetto - freibetrag);
    const anrechnungsbetrag = uebersteigenderBetrag * ANRECHNUNGSSATZ;
    
    // === 5. Witwenrente nach Einkommensanrechnung ===
    const witwenrenteNachAnrechnung = Math.max(0, bruttoWitwenrente - anrechnungsbetrag);
    
    // Im Sterbevierteljahr: keine Einkommensanrechnung
    const witwenrenteSterbevierteljahr = bruttoSterbevierteljahr;
    
    // === 6. Sozialversicherungsbeiträge auf Witwenrente ===
    const kvBeitrag = witwenrenteNachAnrechnung * (KV_BEITRAG + KV_ZUSATZBEITRAG);
    let pvBeitrag = witwenrenteNachAnrechnung * PV_BEITRAG;
    if (!hatKinder && alterHinterbliebener >= 23) {
      pvBeitrag += witwenrenteNachAnrechnung * PV_ZUSCHLAG_KINDERLOS;
    }
    const svBeitraege = kvBeitrag + pvBeitrag;
    
    // === 7. Auszahlungsbetrag ===
    const auszahlungsbetrag = witwenrenteNachAnrechnung - svBeitraege;
    const auszahlungSterbevierteljahr = witwenrenteSterbevierteljahr - (witwenrenteSterbevierteljahr * (KV_BEITRAG + KV_ZUSATZBEITRAG + PV_BEITRAG));
    
    // === 8. Gesamteinkommen ===
    const gesamtBrutto = witwenrenteNachAnrechnung + eigeneRente + arbeitseinkommen;
    const gesamtNetto = auszahlungsbetrag + (eigeneRente * 0.88) + (arbeitseinkommen * 0.6); // Grobe Schätzung
    
    return {
      // Rentenart
      anspruchGrosseWitwenrente,
      grundGrosseRente,
      rentenartfaktor,
      prozentVonRente,
      altesRecht,
      
      // Voraussetzungen
      erfuelltAltersgrenze,
      erfuelltKindererziehung,
      erfuelltErwerbsminderung,
      
      // Berechnung
      renteVerstorbener,
      bruttoWitwenrente,
      bruttoSterbevierteljahr,
      
      // Einkommensanrechnung
      freibetrag,
      nettoEigeneRente,
      nettoArbeitseinkommen,
      anrechenbaresNetto,
      uebersteigenderBetrag,
      anrechnungsbetrag,
      
      // Ergebnis
      witwenrenteNachAnrechnung,
      witwenrenteSterbevierteljahr,
      
      // Abzüge
      kvBeitrag,
      pvBeitrag,
      svBeitraege,
      
      // Auszahlung
      auszahlungsbetrag,
      auszahlungSterbevierteljahr,
      
      // Gesamt
      gesamtBrutto,
      gesamtNetto,
      
      // Konstanten
      freibetragBasis: FREIBETRAG_BASIS,
      freibetragProKind: FREIBETRAG_PRO_KIND,
      rentenwert: RENTENWERT_2025,
    };
  }, [renteVerstorbener, alterHinterbliebener, hatKinder, anzahlKinder, kinderUnter18, 
      istErwerbsgemindert, eigeneRente, arbeitseinkommen, rentenbezugAb2011, altesRecht, sterbevierteljahr]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Rente des Verstorbenen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Rente des Verstorbenen (brutto)</span>
            <span className="text-xs text-gray-500 block mt-1">
              Die Altersrente oder der Rentenanspruch des verstorbenen Partners
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={renteVerstorbener}
              onChange={(e) => setRenteVerstorbener(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="5000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Monat</span>
          </div>
          <input
            type="range"
            value={renteVerstorbener}
            onChange={(e) => setRenteVerstorbener(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="500"
            max="4000"
            step="50"
          />
        </div>

        {/* Alter des Hinterbliebenen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ihr Alter</span>
            <span className="text-xs text-gray-500 block mt-1">
              Ab {ALTERSGRENZE_2026.jahre} Jahren {ALTERSGRENZE_2026.monate} Monaten besteht Anspruch auf die große Witwenrente
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAlterHinterbliebener(Math.max(18, alterHinterbliebener - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{alterHinterbliebener}</span>
              <span className="text-gray-500 ml-1">Jahre</span>
            </div>
            <button
              onClick={() => setAlterHinterbliebener(Math.min(90, alterHinterbliebener + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
          {alterHinterbliebener >= ALTERSGRENZE_2026.jahre && alterHinterbliebener < ALTERSGRENZE_2026.jahre + 1 && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              ⚠️ Bei genau {ALTERSGRENZE_2026.jahre} Jahren müssen auch {ALTERSGRENZE_2026.monate} Monate erreicht sein
            </p>
          )}
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Haben Sie Kinder?</span>
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => { setHatKinder(false); setAnzahlKinder(0); setKinderUnter18(0); }}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !hatKinder
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Keine Kinder
            </button>
            <button
              onClick={() => { setHatKinder(true); setAnzahlKinder(Math.max(1, anzahlKinder)); }}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                hatKinder
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mit Kindern
            </button>
          </div>
          
          {hatKinder && (
            <div className="space-y-3 p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">Anzahl Kinder gesamt:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newVal = Math.max(1, anzahlKinder - 1);
                      setAnzahlKinder(newVal);
                      setKinderUnter18(Math.min(kinderUnter18, newVal));
                    }}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-purple-100 text-lg font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold text-purple-800 w-8 text-center">{anzahlKinder}</span>
                  <button
                    onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-purple-100 text-lg font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">Davon unter 18 Jahren:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setKinderUnter18(Math.max(0, kinderUnter18 - 1))}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-purple-100 text-lg font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold text-purple-800 w-8 text-center">{kinderUnter18}</span>
                  <button
                    onClick={() => setKinderUnter18(Math.min(anzahlKinder, kinderUnter18 + 1))}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-purple-100 text-lg font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              {kinderUnter18 > 0 && (
                <p className="text-xs text-purple-600 mt-2">
                  ✓ Anspruch auf große Witwenrente durch Kindererziehung
                </p>
              )}
            </div>
          )}
        </div>

        {/* Erwerbsminderung */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={istErwerbsgemindert}
              onChange={(e) => setIstErwerbsgemindert(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Erwerbsgemindert</span>
              <span className="text-xs text-gray-500 block">
                Voll oder teilweise erwerbsgemindert (§ 43 SGB VI)
              </span>
            </div>
          </label>
        </div>

        {/* Altes Recht */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={altesRecht}
              onChange={(e) => setAltesRecht(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Altes Recht (60% statt 55%)</span>
              <span className="text-xs text-gray-500 block">
                Tod vor 01.01.2002 ODER Ehe vor 2002 + ein Partner vor 02.01.1962 geboren
              </span>
            </div>
          </label>
        </div>

        {/* Sterbevierteljahr */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sterbevierteljahr}
              onChange={(e) => setSterbevierteljahr(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
            />
            <div>
              <span className="text-gray-700 font-medium">Sterbevierteljahr berechnen</span>
              <span className="text-xs text-gray-500 block">
                In den ersten 3 Monaten nach dem Tod: volle Rente ohne Einkommensanrechnung
              </span>
            </div>
          </label>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Eigenes Einkommen */}
        <h3 className="font-bold text-gray-800 mb-4">💰 Ihr eigenes Einkommen</h3>
        
        {/* Eigene Rente */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Eigene Altersrente (brutto)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={eigeneRente}
              onChange={(e) => setEigeneRente(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="4000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          <input
            type="range"
            value={eigeneRente}
            onChange={(e) => setEigeneRente(Number(e.target.value))}
            className="w-full mt-2 accent-purple-500"
            min="0"
            max="3000"
            step="50"
          />
          {eigeneRente > 0 && (
            <div className="mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rentenbezugAb2011}
                  onChange={(e) => setRentenbezugAb2011(e.target.checked)}
                  className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                />
                Rentenbezug ab 2011 (14% Pauschalabzug, sonst 13%)
              </label>
            </div>
          )}
        </div>

        {/* Arbeitseinkommen */}
        <div className="mb-4">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Arbeitseinkommen (brutto)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={arbeitseinkommen}
              onChange={(e) => setArbeitseinkommen(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="8000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Monat</span>
          </div>
          <input
            type="range"
            value={arbeitseinkommen}
            onChange={(e) => setArbeitseinkommen(Number(e.target.value))}
            className="w-full mt-2 accent-purple-500"
            min="0"
            max="5000"
            step="50"
          />
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">
          {sterbevierteljahr ? '🕊️ Sterbevierteljahr' : '🕊️ Ihre Witwenrente'}
        </h3>
        
        {sterbevierteljahr ? (
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuroRound(ergebnis.auszahlungSterbevierteljahr)}</span>
              <span className="text-xl opacity-80">netto / Monat</span>
            </div>
            <p className="text-purple-100 mt-2 text-sm">
              100% der Versichertenrente für 3 Monate (ohne Einkommensanrechnung)
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuroRound(ergebnis.auszahlungsbetrag)}</span>
              <span className="text-xl opacity-80">netto / Monat</span>
            </div>
            <p className="text-purple-100 mt-2 text-sm">
              {ergebnis.anspruchGrosseWitwenrente ? (
                <>
                  <strong>Große Witwenrente</strong> ({ergebnis.altesRecht ? '60%' : '55%'}) – 
                  {ergebnis.grundGrosseRente}
                </>
              ) : (
                <>
                  <strong>Kleine Witwenrente</strong> (25%) – befristet auf 24 Monate
                </>
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Brutto-Witwenrente</span>
            <div className="text-xl font-bold">
              {formatEuroRound(sterbevierteljahr ? ergebnis.bruttoSterbevierteljahr : ergebnis.bruttoWitwenrente)}
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">
              {ergebnis.anrechnungsbetrag > 0 ? 'Nach Anrechnung' : 'Keine Anrechnung'}
            </span>
            <div className="text-xl font-bold">
              {ergebnis.anrechnungsbetrag > 0 
                ? formatEuroRound(ergebnis.witwenrenteNachAnrechnung)
                : '✓'}
            </div>
          </div>
        </div>

        {ergebnis.anrechnungsbetrag > 0 && !sterbevierteljahr && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Kürzung durch Einkommensanrechnung</span>
              <span className="text-lg font-bold text-red-200">−{formatEuroRound(ergebnis.anrechnungsbetrag)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          {/* Rentenart */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Rentenart & Höhe
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Rente des Verstorbenen</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.renteVerstorbener)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              Rentenart: {ergebnis.anspruchGrosseWitwenrente ? 'Große' : 'Kleine'} Witwenrente
            </span>
            <span className="font-bold text-purple-600">{ergebnis.prozentVonRente}%</span>
          </div>
          <div className="flex justify-between py-2 bg-purple-50 -mx-6 px-6">
            <span className="font-medium text-purple-700">= Brutto-Witwenrente</span>
            <span className="font-bold text-purple-900">{formatEuro(ergebnis.bruttoWitwenrente)}</span>
          </div>
          
          {/* Einkommensanrechnung */}
          {(eigeneRente > 0 || arbeitseinkommen > 0) && !sterbevierteljahr && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                Einkommensanrechnung (§ 97 SGB VI)
              </div>
              
              {eigeneRente > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Eigene Rente (nach {rentenbezugAb2011 ? '14%' : '13%'} Abzug)</span>
                  <span className="text-gray-900">{formatEuro(ergebnis.nettoEigeneRente)}</span>
                </div>
              )}
              {arbeitseinkommen > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Arbeitseinkommen (nach 40% Abzug)</span>
                  <span className="text-gray-900">{formatEuro(ergebnis.nettoArbeitseinkommen)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">= Anrechenbares Netto</span>
                <span className="font-bold text-gray-900">{formatEuro(ergebnis.anrechenbaresNetto)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">
                  Freibetrag (26,4 × {formatEuro(ergebnis.rentenwert)})
                  {anzahlKinder > 0 && ` + ${anzahlKinder} × ${formatEuro(ergebnis.freibetragProKind)}`}
                </span>
                <span className="text-green-600 font-bold">−{formatEuro(ergebnis.freibetrag)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">= Übersteigender Betrag</span>
                <span className={ergebnis.uebersteigenderBetrag > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                  {formatEuro(ergebnis.uebersteigenderBetrag)}
                </span>
              </div>
              {ergebnis.uebersteigenderBetrag > 0 && (
                <div className="flex justify-between py-2 bg-red-50 -mx-6 px-6">
                  <span className="font-medium text-red-700">Anrechnung (40%)</span>
                  <span className="font-bold text-red-900">−{formatEuro(ergebnis.anrechnungsbetrag)}</span>
                </div>
              )}
            </>
          )}
          
          {/* Abzüge */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Sozialversicherung auf Witwenrente
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Krankenversicherung (ca. 9,2%)</span>
            <span>{formatEuro(ergebnis.kvBeitrag)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Pflegeversicherung ({!hatKinder && alterHinterbliebener >= 23 ? '2,4%' : '1,8%'})</span>
            <span>{formatEuro(ergebnis.pvBeitrag)}</span>
          </div>
          
          {/* Ergebnis */}
          <div className="flex justify-between py-3 bg-purple-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-purple-800">Auszahlung Witwenrente</span>
            <span className="font-bold text-2xl text-purple-900">{formatEuro(ergebnis.auszahlungsbetrag)}</span>
          </div>
        </div>
      </div>

      {/* Voraussetzungen Check */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">✅ Anspruchsprüfung: Große vs. Kleine Witwenrente</h3>
        
        <div className="space-y-3">
          <div className={`flex items-center gap-3 p-3 rounded-xl ${ergebnis.erfuelltAltersgrenze ? 'bg-green-50' : 'bg-gray-50'}`}>
            <span className={`text-2xl ${ergebnis.erfuelltAltersgrenze ? '' : 'opacity-30'}`}>
              {ergebnis.erfuelltAltersgrenze ? '✅' : '❌'}
            </span>
            <div>
              <p className={`font-medium ${ergebnis.erfuelltAltersgrenze ? 'text-green-800' : 'text-gray-500'}`}>
                Altersgrenze erreicht
              </p>
              <p className="text-xs text-gray-500">
                Mindestens {ALTERSGRENZE_2026.jahre} Jahre {ALTERSGRENZE_2026.monate} Monate (2026)
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 p-3 rounded-xl ${ergebnis.erfuelltKindererziehung ? 'bg-green-50' : 'bg-gray-50'}`}>
            <span className={`text-2xl ${ergebnis.erfuelltKindererziehung ? '' : 'opacity-30'}`}>
              {ergebnis.erfuelltKindererziehung ? '✅' : '❌'}
            </span>
            <div>
              <p className={`font-medium ${ergebnis.erfuelltKindererziehung ? 'text-green-800' : 'text-gray-500'}`}>
                Kindererziehung
              </p>
              <p className="text-xs text-gray-500">
                Erziehung eines Kindes unter 18 Jahren
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 p-3 rounded-xl ${ergebnis.erfuelltErwerbsminderung ? 'bg-green-50' : 'bg-gray-50'}`}>
            <span className={`text-2xl ${ergebnis.erfuelltErwerbsminderung ? '' : 'opacity-30'}`}>
              {ergebnis.erfuelltErwerbsminderung ? '✅' : '❌'}
            </span>
            <div>
              <p className={`font-medium ${ergebnis.erfuelltErwerbsminderung ? 'text-green-800' : 'text-gray-500'}`}>
                Erwerbsminderung
              </p>
              <p className="text-xs text-gray-500">
                Voll oder teilweise erwerbsgemindert (§ 43 SGB VI)
              </p>
            </div>
          </div>
        </div>
        
        <div className={`mt-4 p-4 rounded-xl ${ergebnis.anspruchGrosseWitwenrente ? 'bg-green-100' : 'bg-amber-100'}`}>
          {ergebnis.anspruchGrosseWitwenrente ? (
            <p className="text-green-800 font-medium">
              ✓ Anspruch auf <strong>große Witwenrente</strong> ({ergebnis.altesRecht ? '60%' : '55%'})
              <br />
              <span className="text-sm font-normal">Grund: {ergebnis.grundGrosseRente}</span>
            </p>
          ) : (
            <p className="text-amber-800 font-medium">
              ⚠️ Nur Anspruch auf <strong>kleine Witwenrente</strong> (25%)
              <br />
              <span className="text-sm font-normal">Befristet auf max. 24 Monate nach dem Tod</span>
            </p>
          )}
        </div>
      </div>

      {/* Info: Einkommensanrechnung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert die Einkommensanrechnung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Freibetrag:</strong> 26,4 × aktueller Rentenwert = {formatEuro(FREIBETRAG_BASIS)} (ab Juli 2025)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>+ Kinderzuschlag:</strong> {formatEuro(FREIBETRAG_PRO_KIND)} je waisenrentenberechtigtem Kind</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Netto-Ermittlung:</strong> Vom Brutto werden pauschal 40% (Arbeit) bzw. 14% (Rente) abgezogen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Anrechnung:</strong> 40% des Betrags über dem Freibetrag werden abgezogen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Sterbevierteljahr:</strong> Erste 3 Monate = volle Versichertenrente ohne Anrechnung</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Antragspflicht:</strong> Witwenrente muss bei der Deutschen Rentenversicherung beantragt werden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Wiederheirat:</strong> Bei erneuter Heirat erlischt der Anspruch (einmalige Abfindung möglich)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Mindest-Ehedauer:</strong> Bei Ehe kürzer als 1 Jahr wird eine „Versorgungsehe" vermutet</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kleine Witwenrente:</strong> Nur 24 Monate Bezugsdauer, dann endet der Anspruch</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Wartezeit:</strong> Der Verstorbene muss mindestens 5 Jahre in die Rentenversicherung eingezahlt haben</span>
          </li>
        </ul>
      </div>

      {/* Altersgrenze Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">📅 Altersgrenzen für große Witwenrente</h3>
        <p className="text-sm text-gray-600 mb-4">
          Die Altersgrenze wird schrittweise von 45 auf 47 Jahre angehoben:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Todesjahr</th>
                <th className="px-3 py-2 text-left">Altersgrenze</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-3 py-2">2024</td><td className="px-3 py-2">46 Jahre 2 Monate</td></tr>
              <tr><td className="px-3 py-2">2025</td><td className="px-3 py-2">46 Jahre 4 Monate</td></tr>
              <tr className="bg-purple-50"><td className="px-3 py-2 font-bold">2026</td><td className="px-3 py-2 font-bold">46 Jahre 6 Monate</td></tr>
              <tr><td className="px-3 py-2">2027</td><td className="px-3 py-2">46 Jahre 8 Monate</td></tr>
              <tr><td className="px-3 py-2">2028</td><td className="px-3 py-2">46 Jahre 10 Monate</td></tr>
              <tr><td className="px-3 py-2">ab 2029</td><td className="px-3 py-2">47 Jahre</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Deutsche Rentenversicherung</p>
            <p className="text-sm text-purple-700 mt-1">
              Die Hinterbliebenenrente wird bei der Deutschen Rentenversicherung beantragt.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Hotline</p>
                <p className="text-gray-600">0800 1000 4800 (kostenlos)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Antrag</p>
                <a 
                  href="https://www.deutsche-rentenversicherung.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  deutsche-rentenversicherung.de →
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Benötigte Unterlagen</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Sterbeurkunde mit Heiratsvermerk</li>
                <li>• Heiratsurkunde</li>
                <li>• Rentenversicherungsnummer des Verstorbenen</li>
                <li>• Personalausweis</li>
                <li>• Ggf. Geburtsurkunden der Kinder</li>
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
            href="https://www.gesetze-im-internet.de/sgb_6/__46.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 46 SGB VI – Witwenrente und Witwerrente
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_6/__97.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 97 SGB VI – Einkommensanrechnung
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_6/__242a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 242a SGB VI – Anhebung der Altersgrenzen
          </a>
          <a 
            href="https://www.deutsche-rentenversicherung.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Hinterbliebenenrente
          </a>
        </div>
      </div>
    </div>
  );
}
