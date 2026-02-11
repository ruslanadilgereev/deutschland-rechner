import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// GKV-Krankenkassenbeitrag-Rechner 2026 - Offizielle Berechnungsformeln
// ═══════════════════════════════════════════════════════════════════════════════
// 
// RECHTSGRUNDLAGE: SGB V §§ 220-242, §§ 241-245
// QUELLEN:
// - Bundesgesundheitsministerium: https://www.bundesgesundheitsministerium.de/beitraege.html
// - Sozialversicherungs-Rechengrößenverordnung 2026
// - GKV-Spitzenverband: https://www.gkv-spitzenverband.de
//
// OFFIZIELLE WERTE 2026:
// - Allgemeiner Beitragssatz: 14,6% (§ 241 SGB V)
// - Ermäßigter Beitragssatz: 14,0% (§ 243 SGB V)
// - Durchschnittlicher Zusatzbeitrag: 2,9% (BMG Bekanntmachung)
// - Beitragsbemessungsgrenze: 5.812,50 €/Monat (69.750 €/Jahr)
// - Mindestbemessungsgrundlage (Selbstständige): 1.318,33 €
// - Versicherungspflichtgrenze: 6.450 €/Monat (77.400 €/Jahr)
//
// PFLEGEVERSICHERUNG 2026 (SGB XI §§ 54-55):
// - Grundbeitragssatz: 3,6%
// - Kinderlose ab 23 Jahre: +0,6% = 4,2%
// - Abschlag bei 2-5 Kindern unter 25: -0,25% pro Kind
// - Minimum (5+ Kinder): 2,4%
// - Arbeitgeberanteil: immer 1,7% (seit 01.07.2023)
// ═══════════════════════════════════════════════════════════════════════════════

const GKV_2026 = {
  // Beitragssätze 2026
  allgemeinerBeitragssatz: 14.6,        // § 241 SGB V
  ermaessigterBeitragssatz: 14.0,       // § 243 SGB V (ohne Krankengeldanspruch)
  durchschnittlicherZusatzbeitrag: 2.9, // BMG Bekanntmachung November 2025
  
  // Beitragsbemessungsgrenzen 2026
  beitragsbemessungsgrenze: {
    monat: 5812.50,
    jahr: 69750,
  },
  
  // Versicherungspflichtgrenze 2026
  versicherungspflichtgrenze: {
    monat: 6450,
    jahr: 77400,
  },
  
  // Mindestbemessungsgrundlage für Selbstständige 2026
  // Formel: (Bezugsgröße / 90) × 30 = (3955 / 90) × 30 = 1.318,33 €
  mindestbemessungsgrundlage: 1318.33,
  
  // Pflegeversicherung 2026
  pflegeversicherung: {
    beitragssatz: 3.6,                  // Grundbeitragssatz
    zuschlagKinderlose: 0.6,            // Ab 23 Jahre ohne Kinder
    abschlagProKind: 0.25,              // Für Kinder 2-5 unter 25 Jahren
    minimumBeitragssatz: 2.4,           // Bei 5+ Kindern
    arbeitgeberanteil: 1.7,             // Fester AG-Anteil seit 01.07.2023
  },
  
  // Arbeitgeber-Zuschüsse zur PKV (max. 50% der BBG-Beiträge)
  maxAGZuschussPKV: {
    krankenversicherung: 508.59,        // 8,15% × 5.812,50 €
    pflegeversicherung: 98.81,          // 1,7% × 5.812,50 €
  },
};

// Beliebte Krankenkassen mit Zusatzbeiträgen 2026
const KRANKENKASSEN_LISTE = [
  { name: 'Durchschnitt (alle Kassen)', zusatzbeitrag: 2.9 },
  { name: 'AOK Baden-Württemberg', zusatzbeitrag: 2.24 },
  { name: 'AOK Bayern', zusatzbeitrag: 1.98 },
  { name: 'AOK Niedersachsen', zusatzbeitrag: 2.25 },
  { name: 'AOK Nordwest', zusatzbeitrag: 2.90 },
  { name: 'AOK Plus (Sachsen/Thüringen)', zusatzbeitrag: 2.20 },
  { name: 'AOK Rheinland/Hamburg', zusatzbeitrag: 2.65 },
  { name: 'Barmer', zusatzbeitrag: 2.99 },
  { name: 'DAK-Gesundheit', zusatzbeitrag: 2.80 },
  { name: 'HEK', zusatzbeitrag: 1.80 },
  { name: 'hkk', zusatzbeitrag: 1.68 },
  { name: 'IKK classic', zusatzbeitrag: 2.50 },
  { name: 'KKH', zusatzbeitrag: 2.78 },
  { name: 'Knappschaft', zusatzbeitrag: 2.40 },
  { name: 'SBK', zusatzbeitrag: 2.55 },
  { name: 'Techniker Krankenkasse (TK)', zusatzbeitrag: 2.45 },
  { name: 'VIACTIV', zusatzbeitrag: 2.00 },
  { name: 'Eigener Wert', zusatzbeitrag: -1 }, // Platzhalter für manuelle Eingabe
];

type Versichertenart = 'arbeitnehmer' | 'rentner' | 'selbstaendig' | 'freiwillig' | 'student';
type Bundesland = 'BY' | 'BW' | 'sonstige'; // Für Pflegeversicherung (Sachsen hatte früher Sonderregel)

export default function KrankenkassenbeitragRechner() {
  const [bruttoeinkommen, setBruttoeinkommen] = useState(4000);
  const [versichertenart, setVersichertenart] = useState<Versichertenart>('arbeitnehmer');
  const [krankenkasse, setKrankenkasse] = useState('Durchschnitt (alle Kassen)');
  const [zusatzbeitragManuell, setZusatzbeitragManuell] = useState(2.9);
  const [hatKrankengeldanspruch, setHatKrankengeldanspruch] = useState(true);
  const [kinderlos, setKinderlos] = useState(false);
  const [alter, setAlter] = useState(35);
  const [kinderanzahl, setKinderanzahl] = useState(0);
  const [bundesland, setBundesland] = useState<Bundesland>('sonstige');
  const [istVerheiratet, setIstVerheiratet] = useState(false);
  const [partnerEinkommen, setPartnerEinkommen] = useState(0);
  const [partnerIstPKV, setPartnerIstPKV] = useState(false);

  const ergebnis = useMemo(() => {
    // ═══════════════════════════════════════════════════════════════
    // SCHRITT 1: Beitragspflichtiges Einkommen ermitteln
    // ═══════════════════════════════════════════════════════════════
    
    let beitragspflichtigesEinkommen = bruttoeinkommen;
    
    // Bei Selbstständigen: Mindestbemessungsgrundlage
    if (versichertenart === 'selbstaendig') {
      beitragspflichtigesEinkommen = Math.max(bruttoeinkommen, GKV_2026.mindestbemessungsgrundlage);
    }
    
    // Beitragsbemessungsgrenze beachten
    beitragspflichtigesEinkommen = Math.min(beitragspflichtigesEinkommen, GKV_2026.beitragsbemessungsgrenze.monat);
    
    // Bei freiwillig Versicherten mit PKV-Partner: halbe BBG als Höchstgrenze für Partner-Einkommen
    let angerechnetePartnerEinkommen = 0;
    if (versichertenart === 'freiwillig' && istVerheiratet && partnerIstPKV) {
      angerechnetePartnerEinkommen = Math.min(partnerEinkommen, GKV_2026.beitragsbemessungsgrenze.monat / 2);
      // Gesamteinkommen darf BBG nicht überschreiten
      const gesamtEinkommen = bruttoeinkommen + angerechnetePartnerEinkommen;
      beitragspflichtigesEinkommen = Math.min(gesamtEinkommen, GKV_2026.beitragsbemessungsgrenze.monat);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // SCHRITT 2: Zusatzbeitrag ermitteln
    // ═══════════════════════════════════════════════════════════════
    
    const gewaehlteKasse = KRANKENKASSEN_LISTE.find(k => k.name === krankenkasse);
    const zusatzbeitrag = gewaehlteKasse && gewaehlteKasse.zusatzbeitrag >= 0 
      ? gewaehlteKasse.zusatzbeitrag 
      : zusatzbeitragManuell;
    
    // ═══════════════════════════════════════════════════════════════
    // SCHRITT 3: Krankenversicherungsbeitrag berechnen
    // ═══════════════════════════════════════════════════════════════
    
    const kvBasisBeitragssatz = hatKrankengeldanspruch 
      ? GKV_2026.allgemeinerBeitragssatz 
      : GKV_2026.ermaessigterBeitragssatz;
    
    const kvGesamtBeitragssatz = kvBasisBeitragssatz + zusatzbeitrag;
    
    // Beitragsaufteilung
    let kvArbeitnehmeranteil: number;
    let kvArbeitgeberanteil: number;
    
    if (versichertenart === 'arbeitnehmer') {
      // Arbeitnehmer: 50/50 Aufteilung
      kvArbeitnehmeranteil = beitragspflichtigesEinkommen * (kvGesamtBeitragssatz / 2 / 100);
      kvArbeitgeberanteil = kvArbeitnehmeranteil;
    } else if (versichertenart === 'rentner') {
      // Rentner: 50/50 mit Rentenversicherungsträger (seit 2019)
      kvArbeitnehmeranteil = beitragspflichtigesEinkommen * (kvGesamtBeitragssatz / 2 / 100);
      kvArbeitgeberanteil = kvArbeitnehmeranteil; // RV-Träger übernimmt Hälfte
    } else {
      // Selbstständige, freiwillig Versicherte, Studenten: voller Beitrag
      kvArbeitnehmeranteil = beitragspflichtigesEinkommen * (kvGesamtBeitragssatz / 100);
      kvArbeitgeberanteil = 0;
    }
    
    const kvGesamtbeitrag = kvArbeitnehmeranteil + kvArbeitgeberanteil;
    
    // ═══════════════════════════════════════════════════════════════
    // SCHRITT 4: Pflegeversicherungsbeitrag berechnen
    // ═══════════════════════════════════════════════════════════════
    
    let pvBeitragssatz = GKV_2026.pflegeversicherung.beitragssatz;
    
    // Zuschlag für Kinderlose ab 23
    if (kinderlos && alter >= 23) {
      pvBeitragssatz += GKV_2026.pflegeversicherung.zuschlagKinderlose;
    }
    
    // Abschlag für Eltern mit 2+ Kindern unter 25
    if (!kinderlos && kinderanzahl >= 2) {
      const anzahlAbschlaege = Math.min(kinderanzahl - 1, 4); // Max 4 Abschläge (Kind 2-5)
      pvBeitragssatz -= anzahlAbschlaege * GKV_2026.pflegeversicherung.abschlagProKind;
    }
    
    // Minimum sicherstellen
    pvBeitragssatz = Math.max(pvBeitragssatz, GKV_2026.pflegeversicherung.minimumBeitragssatz);
    
    let pvArbeitnehmeranteil: number;
    let pvArbeitgeberanteil: number;
    
    if (versichertenart === 'arbeitnehmer') {
      // AG zahlt festen Anteil von 1,7%
      pvArbeitgeberanteil = beitragspflichtigesEinkommen * (GKV_2026.pflegeversicherung.arbeitgeberanteil / 100);
      // AN zahlt Rest
      pvArbeitnehmeranteil = beitragspflichtigesEinkommen * (pvBeitragssatz / 100) - pvArbeitgeberanteil;
      // Bei Kinderlosen ab 23: Zuschlag wird NUR vom AN getragen
      if (kinderlos && alter >= 23) {
        // Der Zuschlag ist bereits im pvBeitragssatz enthalten
        // AN trägt: (Beitragssatz - AG-Anteil)
      }
    } else if (versichertenart === 'rentner') {
      // Rentner: RV-Träger zahlt Hälfte des regulären Satzes (ohne Kinderlosenzuschlag)
      const basisSatz = GKV_2026.pflegeversicherung.beitragssatz;
      pvArbeitgeberanteil = beitragspflichtigesEinkommen * (basisSatz / 2 / 100);
      pvArbeitnehmeranteil = beitragspflichtigesEinkommen * (pvBeitragssatz / 100) - pvArbeitgeberanteil;
    } else {
      // Selbstständige: voller Beitrag selbst
      pvArbeitnehmeranteil = beitragspflichtigesEinkommen * (pvBeitragssatz / 100);
      pvArbeitgeberanteil = 0;
    }
    
    const pvGesamtbeitrag = pvArbeitnehmeranteil + pvArbeitgeberanteil;
    
    // ═══════════════════════════════════════════════════════════════
    // SCHRITT 5: Gesamtergebnisse
    // ═══════════════════════════════════════════════════════════════
    
    const gesamtbeitragAN = kvArbeitnehmeranteil + pvArbeitnehmeranteil;
    const gesamtbeitragAG = kvArbeitgeberanteil + pvArbeitgeberanteil;
    const gesamtbeitrag = gesamtbeitragAN + gesamtbeitragAG;
    
    const jahresbeitragAN = gesamtbeitragAN * 12;
    const jahresbeitragAG = gesamtbeitragAG * 12;
    const jahresbeitrag = gesamtbeitrag * 12;
    
    // Prozentuale Belastung vom Brutto
    const belastungProzent = (gesamtbeitragAN / bruttoeinkommen) * 100;
    
    // Höchstbeiträge (bei Erreichen der BBG)
    const maxKVBeitrag = GKV_2026.beitragsbemessungsgrenze.monat * (kvGesamtBeitragssatz / 100);
    const maxPVBeitrag = GKV_2026.beitragsbemessungsgrenze.monat * (pvBeitragssatz / 100);
    
    // Vergleich: Ersparnis gegenüber teuerstem/günstigstem Zusatzbeitrag
    const guenstigsterZusatzbeitrag = Math.min(...KRANKENKASSEN_LISTE.filter(k => k.zusatzbeitrag >= 0).map(k => k.zusatzbeitrag));
    const teuersterZusatzbeitrag = Math.max(...KRANKENKASSEN_LISTE.filter(k => k.zusatzbeitrag >= 0).map(k => k.zusatzbeitrag));
    
    const beitragMitGuenstigster = beitragspflichtigesEinkommen * ((kvBasisBeitragssatz + guenstigsterZusatzbeitrag) / 2 / 100);
    const beitragMitTeuerster = beitragspflichtigesEinkommen * ((kvBasisBeitragssatz + teuersterZusatzbeitrag) / 2 / 100);
    
    const monatlicheErsparnis = beitragMitTeuerster - beitragMitGuenstigster;
    const jaehrlicheErsparnis = monatlicheErsparnis * 12;
    
    return {
      // Eingangswerte
      beitragspflichtigesEinkommen,
      zusatzbeitrag,
      kvBasisBeitragssatz,
      kvGesamtBeitragssatz,
      pvBeitragssatz,
      
      // Krankenversicherung
      kvArbeitnehmeranteil,
      kvArbeitgeberanteil,
      kvGesamtbeitrag,
      
      // Pflegeversicherung
      pvArbeitnehmeranteil,
      pvArbeitgeberanteil,
      pvGesamtbeitrag,
      
      // Gesamt
      gesamtbeitragAN,
      gesamtbeitragAG,
      gesamtbeitrag,
      jahresbeitragAN,
      jahresbeitragAG,
      jahresbeitrag,
      
      // Analysen
      belastungProzent,
      maxKVBeitrag,
      maxPVBeitrag,
      guenstigsterZusatzbeitrag,
      teuersterZusatzbeitrag,
      monatlicheErsparnis,
      jaehrlicheErsparnis,
      
      // Status
      erreichtBBG: bruttoeinkommen >= GKV_2026.beitragsbemessungsgrenze.monat,
      ueberVersicherungspflichtgrenze: bruttoeinkommen > GKV_2026.versicherungspflichtgrenze.monat,
    };
  }, [bruttoeinkommen, versichertenart, krankenkasse, zusatzbeitragManuell, hatKrankengeldanspruch, kinderlos, alter, kinderanzahl, bundesland, istVerheiratet, partnerEinkommen, partnerIstPKV]);

  const formatEuro = (betrag: number) => {
    return betrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const formatProzent = (prozent: number) => {
    return prozent.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  };

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ihre Angaben</h2>
        
        {/* Versichertenart */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Versichertenstatus
          </label>
          <select
            value={versichertenart}
            onChange={(e) => setVersichertenart(e.target.value as Versichertenart)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="arbeitnehmer">Arbeitnehmer (pflichtversichert)</option>
            <option value="rentner">Rentner</option>
            <option value="selbstaendig">Selbstständig (freiwillig versichert)</option>
            <option value="freiwillig">Freiwillig versichert (über Versicherungspflichtgrenze)</option>
            <option value="student">Student (freiwillig versichert)</option>
          </select>
        </div>
        
        {/* Bruttoeinkommen */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monatliches Bruttoeinkommen
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttoeinkommen}
              onChange={(e) => setBruttoeinkommen(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              min="0"
              step="100"
            />
            <span className="absolute right-3 top-3 text-gray-500">€</span>
          </div>
          <input
            type="range"
            value={bruttoeinkommen}
            onChange={(e) => setBruttoeinkommen(Number(e.target.value))}
            className="w-full mt-2"
            min="0"
            max="10000"
            step="100"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 €</span>
            <span className="text-green-600">BBG: {formatEuro(GKV_2026.beitragsbemessungsgrenze.monat)}</span>
            <span>10.000 €</span>
          </div>
        </div>
        
        {/* Krankenkasse */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Krankenkasse
          </label>
          <select
            value={krankenkasse}
            onChange={(e) => setKrankenkasse(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {KRANKENKASSEN_LISTE.map((kasse) => (
              <option key={kasse.name} value={kasse.name}>
                {kasse.name} {kasse.zusatzbeitrag >= 0 ? `(${formatProzent(kasse.zusatzbeitrag)})` : ''}
              </option>
            ))}
          </select>
        </div>
        
        {/* Manueller Zusatzbeitrag */}
        {krankenkasse === 'Eigener Wert' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zusatzbeitrag Ihrer Kasse
            </label>
            <div className="relative">
              <input
                type="number"
                value={zusatzbeitragManuell}
                onChange={(e) => setZusatzbeitragManuell(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min="0"
                max="5"
                step="0.01"
              />
              <span className="absolute right-3 top-3 text-gray-500">%</span>
            </div>
          </div>
        )}
        
        {/* Krankengeldanspruch (nur für bestimmte Versichertenarten) */}
        {(versichertenart === 'selbstaendig' || versichertenart === 'freiwillig') && (
          <div className="mb-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hatKrankengeldanspruch}
                onChange={(e) => setHatKrankengeldanspruch(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Mit Krankengeldanspruch (14,6% statt 14,0%)
              </span>
            </label>
          </div>
        )}
        
        {/* Alter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alter
          </label>
          <input
            type="number"
            value={alter}
            onChange={(e) => setAlter(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            min="16"
            max="99"
          />
        </div>
        
        {/* Kinder / Kinderlos */}
        <div className="mb-4">
          <label className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={kinderlos}
              onChange={(e) => {
                setKinderlos(e.target.checked);
                if (e.target.checked) setKinderanzahl(0);
              }}
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              Kinderlos {alter >= 23 && <span className="text-amber-600 font-medium">(+0,6% Pflegeversicherung)</span>}
            </span>
          </label>
          
          {!kinderlos && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anzahl Kinder unter 25 Jahren
              </label>
              <select
                value={kinderanzahl}
                onChange={(e) => setKinderanzahl(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="0">Keine Kinder unter 25</option>
                <option value="1">1 Kind unter 25</option>
                <option value="2">2 Kinder unter 25 (-0,25% PV)</option>
                <option value="3">3 Kinder unter 25 (-0,50% PV)</option>
                <option value="4">4 Kinder unter 25 (-0,75% PV)</option>
                <option value="5">5+ Kinder unter 25 (-1,00% PV)</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Ihre Krankenkassenbeiträge 2026</h2>
        
        {/* Hauptergebnis */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-green-100 text-sm">Ihr Beitrag (monatlich)</p>
            <p className="text-3xl font-bold">{formatEuro(ergebnis.gesamtbeitragAN)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-green-100 text-sm">Ihr Beitrag (jährlich)</p>
            <p className="text-3xl font-bold">{formatEuro(ergebnis.jahresbeitragAN)}</p>
          </div>
        </div>
        
        {/* Status-Hinweise */}
        {ergebnis.erreichtBBG && (
          <div className="bg-amber-500/20 border border-amber-300/30 rounded-lg p-3 mb-4">
            <p className="text-sm">
              <span className="font-semibold">⚡ Beitragsbemessungsgrenze erreicht:</span> Ihr Einkommen 
              übersteigt die BBG von {formatEuro(GKV_2026.beitragsbemessungsgrenze.monat)}. Beiträge werden 
              nur bis zu diesem Betrag berechnet.
            </p>
          </div>
        )}
        
        {ergebnis.ueberVersicherungspflichtgrenze && versichertenart === 'arbeitnehmer' && (
          <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-3 mb-4">
            <p className="text-sm">
              <span className="font-semibold">ℹ️ Über Versicherungspflichtgrenze:</span> Mit diesem Einkommen 
              könnten Sie auch in die private Krankenversicherung (PKV) wechseln.
            </p>
          </div>
        )}
      </div>
      
      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Detaillierte Aufschlüsselung</h3>
        
        {/* Beitragspflichtiges Einkommen */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Beitragspflichtiges Einkommen</span>
            <span className="font-semibold text-gray-800">{formatEuro(ergebnis.beitragspflichtigesEinkommen)}</span>
          </div>
          {bruttoeinkommen !== ergebnis.beitragspflichtigesEinkommen && (
            <p className="text-xs text-gray-500 mt-1">
              (Begrenzt auf Beitragsbemessungsgrenze bzw. Mindestbemessungsgrundlage)
            </p>
          )}
        </div>
        
        {/* Krankenversicherung */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🏥</span> Krankenversicherung
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Beitragssatz (Basis)</span>
              <span>{formatProzent(ergebnis.kvBasisBeitragssatz)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">+ Zusatzbeitrag ({krankenkasse.split(' ')[0]})</span>
              <span>{formatProzent(ergebnis.zusatzbeitrag)}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-2">
              <span className="text-gray-700">= Gesamtbeitragssatz</span>
              <span className="text-green-600">{formatProzent(ergebnis.kvGesamtBeitragssatz)}</span>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex justify-between">
              <span className="text-gray-600">Ihr Anteil (Arbeitnehmer)</span>
              <span className="font-medium">{formatEuro(ergebnis.kvArbeitnehmeranteil)}</span>
            </div>
            {ergebnis.kvArbeitgeberanteil > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Arbeitgeber-/RV-Anteil</span>
                <span>{formatEuro(ergebnis.kvArbeitgeberanteil)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Pflegeversicherung */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🩺</span> Pflegeversicherung
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Beitragssatz</span>
              <span>{formatProzent(ergebnis.pvBeitragssatz)}</span>
            </div>
            {kinderlos && alter >= 23 && (
              <div className="text-xs text-amber-600">
                inkl. +0,6% Zuschlag für Kinderlose ab 23
              </div>
            )}
            {!kinderlos && kinderanzahl >= 2 && (
              <div className="text-xs text-green-600">
                inkl. -{formatProzent(Math.min(kinderanzahl - 1, 4) * 0.25)} Abschlag für {kinderanzahl} Kinder
              </div>
            )}
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex justify-between">
              <span className="text-gray-600">Ihr Anteil (Arbeitnehmer)</span>
              <span className="font-medium">{formatEuro(ergebnis.pvArbeitnehmeranteil)}</span>
            </div>
            {ergebnis.pvArbeitgeberanteil > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Arbeitgeberanteil (fest 1,7%)</span>
                <span>{formatEuro(ergebnis.pvArbeitgeberanteil)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Gesamtübersicht */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-3">Zusammenfassung</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Krankenversicherung (Ihr Anteil)</span>
              <span>{formatEuro(ergebnis.kvArbeitnehmeranteil)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pflegeversicherung (Ihr Anteil)</span>
              <span>{formatEuro(ergebnis.pvArbeitnehmeranteil)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span className="text-gray-800">Monatlicher Gesamtbeitrag</span>
              <span className="text-green-600">{formatEuro(ergebnis.gesamtbeitragAN)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Belastung vom Brutto</span>
              <span>{formatProzent(ergebnis.belastungProzent)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sparvergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Sparpotential durch Kassenwechsel</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Günstigste Kasse ({formatProzent(ergebnis.guenstigsterZusatzbeitrag)})</p>
            <p className="text-xl font-bold text-green-600">hkk</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Teuerste Kasse ({formatProzent(ergebnis.teuersterZusatzbeitrag)})</p>
            <p className="text-xl font-bold text-red-600">Barmer</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Mögliche Ersparnis pro Monat</span>
            <span className="text-xl font-bold text-green-600">{formatEuro(ergebnis.monatlicheErsparnis)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-700">Mögliche Ersparnis pro Jahr</span>
            <span className="text-2xl font-bold text-green-600">{formatEuro(ergebnis.jaehrlicheErsparnis)}</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          * Vergleich zwischen günstigster und teuerster Krankenkasse bei gleichem Leistungsumfang 
          (gesetzlich vorgeschriebene Leistungen sind bei allen Kassen gleich).
        </p>
      </div>
      
      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>
              <strong>Beitragsbemessungsgrenze 2026:</strong> Einkommen über {formatEuro(GKV_2026.beitragsbemessungsgrenze.monat)} 
              /Monat wird nicht beitragspflichtig. Der Höchstbeitrag ist gedeckelt.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>
              <strong>Versicherungspflichtgrenze:</strong> Ab {formatEuro(GKV_2026.versicherungspflichtgrenze.monat)}/Monat 
              können Arbeitnehmer in die PKV wechseln.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>
              <strong>Zusatzbeiträge:</strong> Die kassenindividuellen Zusatzbeiträge können sich jährlich ändern. 
              Bei Erhöhung haben Sie ein Sonderkündigungsrecht.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>
              <strong>Familienversicherung:</strong> Ehepartner und Kinder können beitragsfrei mitversichert werden, 
              sofern ihr Einkommen unter 565 €/Monat liegt.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>
              <strong>Pflegeversicherung Kinder:</strong> Der Abschlag gilt nur für Kinder unter 25 Jahren, 
              die im gemeinsamen Haushalt leben oder wirtschaftlich abhängig sind.
            </span>
          </li>
        </ul>
      </div>
      
      {/* Zuständige Behörde */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">🏛️ Zuständige Behörden & Kontakt</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-blue-900">Ihre Krankenkasse</p>
            <p className="text-blue-700">Für alle Fragen zu Beiträgen, Leistungen und Mitgliedschaft</p>
          </div>
          <div>
            <p className="font-medium text-blue-900">GKV-Spitzenverband</p>
            <p className="text-blue-700">Übersicht aller Krankenkassen und Zusatzbeiträge</p>
            <a 
              href="https://www.gkv-spitzenverband.de/service/krankenkassenliste/krankenkassen.jsp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              → Krankenkassenliste mit allen Zusatzbeiträgen
            </a>
          </div>
          <div>
            <p className="font-medium text-blue-900">Bundesgesundheitsministerium</p>
            <p className="text-blue-700">Informationen zur gesetzlichen Krankenversicherung</p>
            <a 
              href="https://www.bundesgesundheitsministerium.de/beitraege.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              → Offizielle Informationen zu GKV-Beiträgen
            </a>
          </div>
          <div>
            <p className="font-medium text-blue-900">Unabhängige Patientenberatung Deutschland</p>
            <p className="text-blue-700">Kostenlose Beratung für Versicherte</p>
            <p className="text-blue-600">📞 0800 011 77 22 (kostenfrei)</p>
          </div>
        </div>
      </div>
      
      {/* Quellen */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📚 Quellen & Rechtsgrundlagen</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>
            <a 
              href="https://www.gesetze-im-internet.de/sgb_5/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              SGB V – Gesetzliche Krankenversicherung
            </a>
            <span className="text-gray-400"> (§§ 220-245 Finanzierung)</span>
          </li>
          <li>
            <a 
              href="https://www.gesetze-im-internet.de/sgb_11/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              SGB XI – Soziale Pflegeversicherung
            </a>
            <span className="text-gray-400"> (§§ 54-60 Beiträge)</span>
          </li>
          <li>
            <a 
              href="https://www.bundesgesundheitsministerium.de/beitraege.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Bundesgesundheitsministerium – Beiträge der GKV
            </a>
          </li>
          <li>
            <a 
              href="https://www.gkv-spitzenverband.de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              GKV-Spitzenverband – Offizielle Krankenkassenübersicht
            </a>
          </li>
          <li>
            <a 
              href="https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Bundesregierung – Sozialversicherungs-Rechengrößen 2026
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-400 mt-4">
          Stand: Februar 2026 · Alle Angaben ohne Gewähr · Zusatzbeiträge können sich jährlich ändern
        </p>
      </div>
    </div>
  );
}
