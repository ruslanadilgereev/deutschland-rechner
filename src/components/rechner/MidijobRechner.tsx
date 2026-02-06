import { useState, useMemo } from 'react';

// Midijob / Übergangsbereich Konstanten 2026
// Quelle: § 20 SGB IV, BMF, DRV
const MIDIJOB = {
  untergrenze: 603.01,                  // Ab 603,01€ beginnt der Midijob (Minijob-Grenze + 1 Cent)
  obergrenze: 2000.00,                  // Obergrenze seit 01.01.2023 (erhöht von 1.600€)
  // Beitragssätze 2026
  krankenversicherung: 14.6,            // Allgemeiner Beitragssatz
  zusatzbeitragKV: 2.5,                 // Durchschnittlicher Zusatzbeitrag 2026 (erhöht von 1,7%)
  rentenversicherung: 18.6,             // RV-Beitrag
  arbeitslosenversicherung: 2.6,        // AV-Beitrag
  pflegeversicherung: 3.4,              // PV ohne Kinder
  pflegeversicherungMitKind: 3.4,       // Basis-PV-Satz
  pvZuschlagKinderlos: 0.6,             // Zuschlag ab 23 ohne Kinder
  pvAbschlagKinder: [0, 0.25, 0.25, 0.25, 0.25], // Abschläge pro Kind (2-5+)
  // Faktor F für Gleitzonenformel 2026
  faktorF: 0.6846,                      // Formel: 28% ÷ Gesamtbeitragssatz (ca. 40.9%)
};

// Gesamtbeitragssatz für Berechnung des Faktors F
const GESAMTBEITRAG = 
  MIDIJOB.krankenversicherung + 
  MIDIJOB.zusatzbeitragKV + 
  MIDIJOB.rentenversicherung + 
  MIDIJOB.arbeitslosenversicherung + 
  MIDIJOB.pflegeversicherung;
// F = 28% / Gesamtbeitragssatz ≈ 28 / 40.9 ≈ 0.6846

type Familienstand = 'ledig' | 'verheiratet';

export default function MidijobRechner() {
  const [bruttolohn, setBruttolohn] = useState(1000);
  const [kinderlos, setKinderlos] = useState(false);
  const [alter, setAlter] = useState(30);
  const [kinderanzahl, setKinderanzahl] = useState(0);
  const [zusatzbeitragKV, setZusatzbeitragKV] = useState(2.5);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState<'west' | 'ost'>('west');

  const ergebnis = useMemo(() => {
    // Prüfe ob im Übergangsbereich
    const istMidijob = bruttolohn >= MIDIJOB.untergrenze && bruttolohn <= MIDIJOB.obergrenze;
    const istMinijob = bruttolohn <= 603;
    const istVolljob = bruttolohn > MIDIJOB.obergrenze;

    // ═══════════════════════════════════════════════════════════════
    // BERECHNUNG DER BEITRAGSBEMESSUNGSGRUNDLAGE (BBG) IM ÜBERGANGSBEREICH
    // Formel nach § 20 Abs. 2a SGB IV (seit 01.10.2022)
    // ═══════════════════════════════════════════════════════════════
    
    // Faktor F (2026): F = 28% / Gesamtbeitragssatz
    // Mit durchschnittlichem Zusatzbeitrag 2,5%:
    // Gesamtbeitrag = 14,6 + 2,5 + 18,6 + 2,6 + 3,4 = 41,7%
    // F = 28 / 41,7 = 0,6715 (gerundet für 2026)
    const gesamtBeitragssatz = 
      MIDIJOB.krankenversicherung + 
      zusatzbeitragKV + 
      MIDIJOB.rentenversicherung + 
      MIDIJOB.arbeitslosenversicherung + 
      MIDIJOB.pflegeversicherung;
    
    const F = 28 / gesamtBeitragssatz;
    
    // Formel für beitragspflichtige Einnahme (BE) im Übergangsbereich:
    // BE = F × Untergrenze + ([Obergrenze / (Obergrenze - Untergrenze)] - [Untergrenze × F / (Obergrenze - Untergrenze)]) × (Brutto - Untergrenze)
    // Vereinfacht: BE = F × 603,01 + Faktor2 × (Brutto - 603,01)
    
    const untergrenze = MIDIJOB.untergrenze;
    const obergrenze = MIDIJOB.obergrenze;
    const spanne = obergrenze - untergrenze; // 1396,99
    
    const faktor2 = (obergrenze / spanne) - (untergrenze * F / spanne);
    
    let beitragspflichtigeEinnahme = bruttolohn;
    if (istMidijob) {
      beitragspflichtigeEinnahme = F * untergrenze + faktor2 * (bruttolohn - untergrenze);
    }

    // ═══════════════════════════════════════════════════════════════
    // ARBEITNEHMER-ANTEILE
    // ═══════════════════════════════════════════════════════════════
    
    // Gesamtbeitrag auf Basis der reduzierten BBG
    const gesamtBeitragAufBBG = beitragspflichtigeEinnahme * (gesamtBeitragssatz / 100);
    
    // AG-Anteil wird auf VOLLEN Bruttolohn berechnet (halber Beitragssatz)
    const agAnteilKV = bruttolohn * ((MIDIJOB.krankenversicherung + zusatzbeitragKV) / 2 / 100);
    const agAnteilRV = bruttolohn * (MIDIJOB.rentenversicherung / 2 / 100);
    const agAnteilAV = bruttolohn * (MIDIJOB.arbeitslosenversicherung / 2 / 100);
    const agAnteilPV = bruttolohn * (MIDIJOB.pflegeversicherung / 2 / 100);
    const agGesamtAnteil = agAnteilKV + agAnteilRV + agAnteilAV + agAnteilPV;
    
    // AN-Anteil = Gesamtbeitrag auf BBG - AG-Anteil auf vollem Brutto
    let anGesamtAnteil = istMidijob ? gesamtBeitragAufBBG - agGesamtAnteil : 0;
    
    // Bei vollem Job: normale 50/50 Teilung
    if (istVolljob) {
      anGesamtAnteil = bruttolohn * (gesamtBeitragssatz / 2 / 100);
    }

    // Aufschlüsselung AN-Anteile (proportional zum Beitragssatz)
    const kvSatz = (MIDIJOB.krankenversicherung + zusatzbeitragKV) / gesamtBeitragssatz;
    const rvSatz = MIDIJOB.rentenversicherung / gesamtBeitragssatz;
    const avSatz = MIDIJOB.arbeitslosenversicherung / gesamtBeitragssatz;
    const pvSatz = MIDIJOB.pflegeversicherung / gesamtBeitragssatz;

    let anKV = anGesamtAnteil * kvSatz;
    let anRV = anGesamtAnteil * rvSatz;
    let anAV = anGesamtAnteil * avSatz;
    let anPV = anGesamtAnteil * pvSatz;

    // Pflegeversicherung: Zuschlag für Kinderlose ab 23
    let pvZuschlag = 0;
    if (kinderlos && alter >= 23) {
      pvZuschlag = bruttolohn * (MIDIJOB.pvZuschlagKinderlos / 100);
    }
    
    // Abschlag für Eltern mit 2+ Kindern unter 25
    let pvAbschlag = 0;
    if (!kinderlos && kinderanzahl >= 2) {
      const abschlaege = Math.min(kinderanzahl - 1, 4); // Max 4 Abschläge (für Kind 2-5)
      pvAbschlag = bruttolohn * (abschlaege * 0.25 / 100);
    }
    
    anPV = anPV + pvZuschlag - pvAbschlag;
    if (anPV < 0) anPV = 0;

    const anSozialversicherung = anKV + anRV + anAV + anPV;

    // ═══════════════════════════════════════════════════════════════
    // VERGLEICH: Normal vs. Übergangsbereich
    // ═══════════════════════════════════════════════════════════════
    
    const normalerANAnteil = bruttolohn * (gesamtBeitragssatz / 2 / 100);
    const ersparnis = normalerANAnteil - anSozialversicherung;
    const ersparnisProzent = normalerANAnteil > 0 ? (ersparnis / normalerANAnteil) * 100 : 0;

    // ═══════════════════════════════════════════════════════════════
    // ARBEITGEBER-ABGABEN (immer auf vollen Bruttolohn!)
    // ═══════════════════════════════════════════════════════════════
    
    // AG zahlt IMMER den vollen AG-Anteil auf das tatsächliche Bruttogehalt
    // Keine Reduzierung im Übergangsbereich für AG!
    const agKV = bruttolohn * ((MIDIJOB.krankenversicherung + zusatzbeitragKV) / 2 / 100);
    const agRV = bruttolohn * (MIDIJOB.rentenversicherung / 2 / 100);
    const agAV = bruttolohn * (MIDIJOB.arbeitslosenversicherung / 2 / 100);
    const agPV = bruttolohn * (MIDIJOB.pflegeversicherung / 2 / 100);
    
    // Umlagen nur AG
    const agUmlageU1 = bruttolohn * 0.016;   // ca. 1,6% U1 (variiert nach Krankenkasse)
    const agUmlageU2 = bruttolohn * 0.006;   // ca. 0,6% U2
    const agInsolvenz = bruttolohn * 0.0015; // 0,15% Insolvenzumlage 2026
    const agUnfall = bruttolohn * 0.016;     // ca. 1,6% UV (Branchendurchschnitt)
    
    const agSozialversicherung = agKV + agRV + agAV + agPV;
    const agUmlagen = agUmlageU1 + agUmlageU2 + agInsolvenz + agUnfall;
    const agGesamtAbgaben = agSozialversicherung + agUmlagen;
    const agGesamtkosten = bruttolohn + agGesamtAbgaben;

    // ═══════════════════════════════════════════════════════════════
    // NETTOLOHN (vereinfacht, ohne Steuer)
    // ═══════════════════════════════════════════════════════════════
    
    const nettoVorSteuer = bruttolohn - anSozialversicherung;
    
    // Hinweis: Lohnsteuer ist abhängig von Steuerklasse und wird hier nicht berechnet
    // Im Übergangsbereich ist meist Steuerklasse 5 oder 6 relevant
    
    // Grobe Steuer-Schätzung (Steuerklasse 1, ledig, vereinfacht)
    let geschaetzteSteuerlast = 0;
    if (bruttolohn > 1200) {
      // Sehr vereinfacht: Ab ca. 1.200€ greifen Steuern (je nach Steuerklasse)
      geschaetzteSteuerlast = Math.max(0, (bruttolohn - 1200) * 0.14); // ~14% Grenzsteuersatz
    }

    const nettolohn = nettoVorSteuer - geschaetzteSteuerlast;

    // ═══════════════════════════════════════════════════════════════
    // RENTENPUNKTE
    // ═══════════════════════════════════════════════════════════════
    
    // Rentenpunkte werden auf BASIS der beitragspflichtigen Einnahme berechnet
    // ABER: Mindestregel - AN erwirbt Punkte auf vollem Brutto (seit 2022)
    const durchschnittsentgelt2026 = 48314; // Vorläufiges Durchschnittsentgelt 2026
    const rentenpunkteJahr = (bruttolohn * 12) / durchschnittsentgelt2026;
    const rentenwert2026 = 40.79; // Aktueller Rentenwert (einheitlich seit Juli 2025)
    const renteProMonat = rentenpunkteJahr * rentenwert2026;

    return {
      // Status
      istMidijob,
      istMinijob,
      istVolljob,
      // Berechnungsgrundlage
      bruttolohn,
      beitragspflichtigeEinnahme: Math.round(beitragspflichtigeEinnahme * 100) / 100,
      faktorF: Math.round(F * 10000) / 10000,
      gesamtBeitragssatz: Math.round(gesamtBeitragssatz * 100) / 100,
      // AN-Anteile
      anKV: Math.round(anKV * 100) / 100,
      anRV: Math.round(anRV * 100) / 100,
      anAV: Math.round(anAV * 100) / 100,
      anPV: Math.round(anPV * 100) / 100,
      pvZuschlag: Math.round(pvZuschlag * 100) / 100,
      pvAbschlag: Math.round(pvAbschlag * 100) / 100,
      anSozialversicherung: Math.round(anSozialversicherung * 100) / 100,
      // AG-Anteile
      agKV: Math.round(agKV * 100) / 100,
      agRV: Math.round(agRV * 100) / 100,
      agAV: Math.round(agAV * 100) / 100,
      agPV: Math.round(agPV * 100) / 100,
      agSozialversicherung: Math.round(agSozialversicherung * 100) / 100,
      agUmlagen: Math.round(agUmlagen * 100) / 100,
      agGesamtAbgaben: Math.round(agGesamtAbgaben * 100) / 100,
      agGesamtkosten: Math.round(agGesamtkosten * 100) / 100,
      // Ersparnis
      normalerANAnteil: Math.round(normalerANAnteil * 100) / 100,
      ersparnis: Math.round(ersparnis * 100) / 100,
      ersparnisProzent: Math.round(ersparnisProzent * 10) / 10,
      // Netto
      nettoVorSteuer: Math.round(nettoVorSteuer * 100) / 100,
      geschaetzteSteuerlast: Math.round(geschaetzteSteuerlast * 100) / 100,
      nettolohn: Math.round(nettolohn * 100) / 100,
      // Rente
      rentenpunkteJahr: Math.round(rentenpunkteJahr * 1000) / 1000,
      renteProMonat: Math.round(renteProMonat * 100) / 100,
    };
  }, [bruttolohn, kinderlos, alter, kinderanzahl, zusatzbeitragKV]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bruttolohn */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatlicher Bruttolohn</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttolohn}
              onChange={(e) => setBruttolohn(Math.max(0, Math.min(3000, Number(e.target.value))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
              min="0"
              max="3000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={bruttolohn}
            onChange={(e) => setBruttolohn(Number(e.target.value))}
            className="w-full mt-3 accent-purple-500"
            min="500"
            max="2500"
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>500 €</span>
            <span className={bruttolohn >= 603.01 && bruttolohn <= 2000 ? 'text-purple-500 font-bold' : 'text-gray-500'}>
              Übergangsbereich: 603,01 € – 2.000 €
            </span>
            <span>2.500 €</span>
          </div>
        </div>

        {/* Status-Badge */}
        <div className="mb-6">
          {ergebnis.istMinijob && (
            <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center">
              <span className="text-2xl">⏰</span>
              <p className="font-bold text-green-800 mt-1">Das ist ein Minijob</p>
              <p className="text-sm text-green-600">Bis 603 € – nutze den Minijob-Rechner!</p>
            </div>
          )}
          {ergebnis.istMidijob && (
            <div className="bg-purple-100 border border-purple-300 rounded-xl p-4 text-center">
              <span className="text-2xl">📊</span>
              <p className="font-bold text-purple-800 mt-1">Übergangsbereich (Midijob)</p>
              <p className="text-sm text-purple-600">603,01 € – 2.000 € → Reduzierte AN-Beiträge!</p>
            </div>
          )}
          {ergebnis.istVolljob && (
            <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 text-center">
              <span className="text-2xl">💼</span>
              <p className="font-bold text-blue-800 mt-1">Reguläre Beschäftigung</p>
              <p className="text-sm text-blue-600">Über 2.000 € – volle Sozialversicherungspflicht</p>
            </div>
          )}
        </div>

        {/* Alter */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Alter</span>
            <span className="text-gray-400 text-sm ml-2">(für PV-Zuschlag ab 23)</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAlter(Math.max(16, alter - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-gray-800">{alter}</span>
              <span className="text-gray-500 ml-2">Jahre</span>
            </div>
            <button
              onClick={() => setAlter(Math.min(67, alter + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Kinder</span>
            <span className="text-gray-400 text-sm ml-2">(unter 25 Jahren)</span>
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => { setKinderlos(true); setKinderanzahl(0); }}
              className={`p-4 rounded-xl text-center transition-all ${
                kinderlos
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">🚫</span>
              <div className="font-bold mt-1">Kinderlos</div>
              <div className="text-xs mt-1 opacity-80">+0,6% PV ab 23</div>
            </button>
            <button
              onClick={() => setKinderlos(false)}
              className={`p-4 rounded-xl text-center transition-all ${
                !kinderlos
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">👨‍👩‍👧</span>
              <div className="font-bold mt-1">Mit Kindern</div>
              <div className="text-xs mt-1 opacity-80">Abschlag ab 2. Kind</div>
            </button>
          </div>
          
          {!kinderlos && (
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              <span className="text-gray-600">Anzahl Kinder:</span>
              <button
                onClick={() => setKinderanzahl(Math.max(1, kinderanzahl - 1))}
                className="w-10 h-10 rounded-lg bg-white border hover:bg-gray-100 text-lg font-bold"
              >
                −
              </button>
              <span className="text-2xl font-bold w-8 text-center">{kinderanzahl || 1}</span>
              <button
                onClick={() => setKinderanzahl(Math.min(6, (kinderanzahl || 1) + 1))}
                className="w-10 h-10 rounded-lg bg-white border hover:bg-gray-100 text-lg font-bold"
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Zusatzbeitrag KV */}
        <div>
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Zusatzbeitrag Krankenkasse</span>
            <span className="text-gray-400 text-sm ml-2">(Durchschnitt: 2,5%)</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={zusatzbeitragKV}
              onChange={(e) => setZusatzbeitragKV(Number(e.target.value))}
              className="flex-1 accent-purple-500"
              min="0.5"
              max="3.5"
              step="0.1"
            />
            <span className="font-bold text-purple-600 w-16 text-right">{zusatzbeitragKV.toFixed(1)} %</span>
          </div>
        </div>
      </div>

      {/* Result Section - Ersparnis */}
      {ergebnis.istMidijob && (
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <h3 className="text-sm font-medium opacity-80 mb-1">💰 Deine monatliche Ersparnis im Übergangsbereich</h3>
          
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{formatEuro(ergebnis.ersparnis)}</span>
              <span className="text-xl opacity-80">weniger Abzüge</span>
            </div>
            <p className="text-purple-200 text-sm mt-1">
              Das sind {formatProzent(ergebnis.ersparnisProzent)} weniger als bei normaler Berechnung
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Normal wären</span>
              <div className="text-xl font-bold line-through opacity-60">{formatEuro(ergebnis.normalerANAnteil)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-sm opacity-80">Du zahlst nur</span>
              <div className="text-xl font-bold">{formatEuro(ergebnis.anSozialversicherung)}</div>
            </div>
          </div>
          
          <p className="text-sm text-purple-200 mt-4">
            Jahresersparnis: <strong>{formatEuro(ergebnis.ersparnis * 12)}</strong>
          </p>
        </div>
      )}

      {/* Result Section - Netto */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.istMidijob 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
          : ergebnis.istMinijob
          ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
          : 'bg-gradient-to-br from-gray-600 to-gray-700'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">👤 Dein geschätztes Netto</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">~{formatEuro(ergebnis.nettolohn)}</span>
            <span className="text-xl opacity-80">/ Monat</span>
          </div>
          <p className="text-sm opacity-80 mt-1">
            (ohne Steuer: {formatEuro(ergebnis.nettoVorSteuer)})
          </p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between text-sm mb-2">
            <span>Bruttolohn</span>
            <span>{formatEuro(bruttolohn)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2 text-red-200">
            <span>− Sozialversicherung</span>
            <span>−{formatEuro(ergebnis.anSozialversicherung)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2 text-red-200">
            <span>− Geschätzte Steuern*</span>
            <span>−{formatEuro(ergebnis.geschaetzteSteuerlast)}</span>
          </div>
          <div className="border-t border-white/20 pt-2 flex justify-between font-bold">
            <span>≈ Netto</span>
            <span>{formatEuro(ergebnis.nettolohn)}</span>
          </div>
        </div>
        
        <p className="text-xs opacity-60 mt-3">
          * Steuer stark vereinfacht (Steuerklasse 1). Für genaue Berechnung nutze unseren Brutto-Netto-Rechner.
        </p>
      </div>

      {/* Detailaufstellung AN */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📋 Deine Sozialversicherungsbeiträge (AN)</h3>
        
        <div className="space-y-3 text-sm">
          {ergebnis.istMidijob && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4">
              <p className="text-purple-800 text-xs">
                <strong>Beitragsbemessungsgrundlage:</strong> {formatEuro(ergebnis.beitragspflichtigeEinnahme)} 
                <span className="opacity-70"> (statt {formatEuro(bruttolohn)})</span>
              </p>
              <p className="text-purple-600 text-xs mt-1">
                Faktor F = {ergebnis.faktorF.toFixed(4)} | Gesamtbeitragssatz = {ergebnis.gesamtBeitragssatz}%
              </p>
            </div>
          )}
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Krankenversicherung ({MIDIJOB.krankenversicherung + zusatzbeitragKV}%)</span>
            <span className="font-bold text-red-600">−{formatEuro(ergebnis.anKV)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Rentenversicherung ({MIDIJOB.rentenversicherung}%)</span>
            <span className="font-bold text-red-600">−{formatEuro(ergebnis.anRV)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Arbeitslosenversicherung ({MIDIJOB.arbeitslosenversicherung}%)</span>
            <span className="font-bold text-red-600">−{formatEuro(ergebnis.anAV)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600 flex items-center gap-1">
              Pflegeversicherung ({MIDIJOB.pflegeversicherung}%)
              {ergebnis.pvZuschlag > 0 && <span className="text-xs bg-orange-100 px-1 rounded">+{MIDIJOB.pvZuschlagKinderlos}%</span>}
              {ergebnis.pvAbschlag > 0 && <span className="text-xs bg-green-100 px-1 rounded">−{((kinderanzahl-1)*0.25).toFixed(2)}%</span>}
            </span>
            <span className="font-bold text-red-600">−{formatEuro(ergebnis.anPV)}</span>
          </div>
          
          <div className="flex justify-between py-3 bg-red-50 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-red-800">Summe Sozialversicherung</span>
            <span className="font-bold text-xl text-red-800">−{formatEuro(ergebnis.anSozialversicherung)}</span>
          </div>
        </div>
      </div>

      {/* Arbeitgeber-Kosten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🏢 Arbeitgeber-Kosten</h3>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <p className="text-amber-800 text-sm">
            <strong>Wichtig:</strong> Der AG zahlt im Übergangsbereich den <strong>vollen</strong> AG-Anteil 
            auf das tatsächliche Bruttogehalt – keine Ermäßigung wie beim AN!
          </p>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Bruttolohn</span>
            <span className="font-bold text-gray-900">{formatEuro(bruttolohn)}</span>
          </div>
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-2">Sozialversicherung (AG-Anteil)</div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
            <span>+ Krankenversicherung</span>
            <span>{formatEuro(ergebnis.agKV)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
            <span>+ Rentenversicherung</span>
            <span>{formatEuro(ergebnis.agRV)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
            <span>+ Arbeitslosenversicherung</span>
            <span>{formatEuro(ergebnis.agAV)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
            <span>+ Pflegeversicherung</span>
            <span>{formatEuro(ergebnis.agPV)}</span>
          </div>
          
          <div className="flex justify-between py-2 bg-orange-50 -mx-6 px-6">
            <span className="font-medium text-orange-700">= Sozialversicherung AG</span>
            <span className="font-bold text-orange-800">{formatEuro(ergebnis.agSozialversicherung)}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-orange-600">
            <span>+ Umlagen (U1, U2, Insolvenz, UV)</span>
            <span>{formatEuro(ergebnis.agUmlagen)}</span>
          </div>
          
          <div className="flex justify-between py-3 bg-gray-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-gray-800">Gesamtkosten AG</span>
            <span className="font-bold text-xl text-gray-900">{formatEuro(ergebnis.agGesamtkosten)}</span>
          </div>
        </div>
      </div>

      {/* Rentenanspruch */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">🏦 Rentenanspruch im Übergangsbereich</h3>
        <div className="space-y-3 text-sm text-blue-700">
          <p>
            <strong>Gute Nachricht:</strong> Im Übergangsbereich erwirbst du <strong>volle Rentenanwartschaften</strong> 
            auf Basis deines tatsächlichen Bruttogehalts – obwohl du weniger Beiträge zahlst!
          </p>
          <div className="bg-white/50 rounded-xl p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-600 uppercase">Rentenpunkte/Jahr</p>
              <p className="text-2xl font-bold text-blue-900">{ergebnis.rentenpunkteJahr.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase">Monatsrente (pro Jahr)</p>
              <p className="text-2xl font-bold text-blue-900">+{formatEuro(ergebnis.renteProMonat)}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600">
            Berechnung: ({formatEuro(bruttolohn)} × 12) ÷ 48.314€ = {ergebnis.rentenpunkteJahr.toFixed(3)} Punkte × 40,79€ Rentenwert
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert der Übergangsbereich</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Wer profitiert:</strong> Arbeitnehmer mit Bruttolohn zwischen 603,01€ und 2.000€</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>AN-Beiträge:</strong> Auf reduzierter Bemessungsgrundlage – du sparst jeden Monat!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>AG-Beiträge:</strong> Immer auf vollem Bruttolohn – keine Ermäßigung für Arbeitgeber</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Rentenansprüche:</strong> Volle Punkte auf tatsächliches Brutto – kein Nachteil!</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Gleitender Übergang:</strong> Je höher das Gehalt, desto weniger Ersparnis</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Früher "Gleitzone":</strong> Bis 2019 hieß es "Gleitzone" (450-850€)</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise 2026</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Obergrenze 2.000€:</strong> Seit 01.01.2023 (vorher 1.600€, davor 1.300€)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Untergrenze dynamisch:</strong> Gekoppelt an Mindestlohn → 603,01€ ab 2026</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>PV-Zuschlag:</strong> Kinderlose ab 23 Jahren zahlen 0,6% mehr</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Mehrere Jobs:</strong> Werden zusammengerechnet für die Beitragsberechnung</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Midijob + Minijob:</strong> Ein Minijob bleibt abgabenfrei (für AN)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kurzfristige Beschäftigung:</strong> Fällt NICHT unter Übergangsbereich</span>
          </li>
        </ul>
      </div>

      {/* Vergleichstabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 overflow-x-auto">
        <h3 className="font-bold text-gray-800 mb-4">📊 Vergleich: Minijob vs. Midijob vs. Volljob</h3>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-semibold text-gray-600">Merkmal</th>
              <th className="text-center py-3 px-2 font-semibold text-green-600">Minijob</th>
              <th className="text-center py-3 px-2 font-semibold text-purple-600">Midijob</th>
              <th className="text-center py-3 px-2 font-semibold text-blue-600">Volljob</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-2 text-gray-700">Verdienstgrenze</td>
              <td className="py-3 px-2 text-center">≤ 603 €</td>
              <td className="py-3 px-2 text-center">603,01 – 2.000 €</td>
              <td className="py-3 px-2 text-center">&gt; 2.000 €</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-2 text-gray-700">AN-Beiträge</td>
              <td className="py-3 px-2 text-center text-green-600">Keine*</td>
              <td className="py-3 px-2 text-center text-purple-600">Reduziert</td>
              <td className="py-3 px-2 text-center text-blue-600">Volle 50%</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-2 text-gray-700">AG-Beiträge</td>
              <td className="py-3 px-2 text-center">Pauschalen</td>
              <td className="py-3 px-2 text-center">Volle 50%</td>
              <td className="py-3 px-2 text-center">Volle 50%</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-2 text-gray-700">Krankenversichert</td>
              <td className="py-3 px-2 text-center text-orange-500">Fremd</td>
              <td className="py-3 px-2 text-center text-green-600">Ja ✓</td>
              <td className="py-3 px-2 text-center text-green-600">Ja ✓</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-2 text-gray-700">Rentenanspruch</td>
              <td className="py-3 px-2 text-center">Minimal*</td>
              <td className="py-3 px-2 text-center text-green-600">Voll ✓</td>
              <td className="py-3 px-2 text-center text-green-600">Voll ✓</td>
            </tr>
            <tr>
              <td className="py-3 px-2 text-gray-700">Arbeitslosengeld</td>
              <td className="py-3 px-2 text-center text-orange-500">Nein</td>
              <td className="py-3 px-2 text-center text-green-600">Ja ✓</td>
              <td className="py-3 px-2 text-center text-green-600">Ja ✓</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-3">
          * Minijobber zahlen optional 3,6% RV-Eigenanteil für volle Rentenansprüche
        </p>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Stellen</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Für Arbeitnehmer:</p>
            <p className="text-sm text-purple-700 mt-1">Deine Krankenkasse – hier laufen alle Meldungen zusammen</p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Für Arbeitgeber:</p>
            <p className="text-sm text-blue-700 mt-1">Einzugsstelle ist die Krankenkasse des Arbeitnehmers</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Informationen</p>
                <a 
                  href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Arbeitnehmer-und-Selbststaendige/01-uebergangsbereich/uebergangsbereich_node.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  deutsche-rentenversicherung.de →
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">DRV Service-Telefon</p>
                <a href="tel:08001000480700" className="text-blue-600 hover:underline font-mono">0800 1000 4800</a>
                <p className="text-xs text-gray-500">Kostenfrei, Mo-Do 7:30-19:30, Fr 7:30-15:30</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/sgb_4/__20.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 20 SGB IV – Übergangsbereich (Gesetze im Internet)
          </a>
          <a 
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Arbeitnehmer-und-Selbststaendige/01-uebergangsbereich/uebergangsbereich_node.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Übergangsbereich
          </a>
          <a 
            href="https://www.bundesregierung.de/breg-de/aktuelles/mindestlohn-2024-2132292"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesregierung – Mindestlohn
          </a>
          <a 
            href="https://www.lohn-info.de/uebergangsbereich.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Lohn-Info – Übergangsbereich Rechner & Formel
          </a>
        </div>
      </div>
    </div>
  );
}
