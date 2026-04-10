import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Beitragsbemessungsgrenze (BBG) Krankenversicherung 2026
const BBG_KV_2026 = 69750; // Jahres-BBG
const BBG_KV_MONAT = 5812.50; // Monats-BBG
const BBG_KV_TAG = 193.75; // Tages-BBG (5812.50 / 30)

// Sozialversicherungsbeiträge (Arbeitnehmeranteil) auf Krankengeld 2026
const BEITRAGSSAETZE = {
  rentenversicherung: 0.093, // 9,3% (halber Satz)
  arbeitslosenversicherung: 0.013, // 1,3% (halber Satz)
  pflegeversicherung: 0.018, // 1,8% Basis (3,6% / 2 = 1,8% AN-Anteil ab 2026)
  pflegeversicherungKinderlos: 0.006, // +0,6% Zuschlag für Kinderlose ab 23
  pflegeversicherungMehrKinder: [-0.0025, -0.005, -0.0075, -0.01], // Abschläge für 2-5 Kinder
};

// Max. Krankengeld-Dauer
const MAX_KRANKENGELD_WOCHEN = 78;
const MAX_KRANKENGELD_TAGE = 546; // 78 Wochen à 7 Tage (genau 78*7=546)

export default function KrankengeldRechner() {
  // Eingabewerte
  const [bruttogehalt, setBruttogehalt] = useState(3500);
  const [nettogehalt, setNettogehalt] = useState(2400);
  const [hatKinder, setHatKinder] = useState(false);
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const [alter, setAlter] = useState(35);
  const [berechnungsart, setBerechnungsart] = useState<'monat' | 'woche'>('monat');
  const [krankheitsdauer, setKrankheitsdauer] = useState(90); // Tage nach Lohnfortzahlung

  const ergebnis = useMemo(() => {
    // === 1. Regelentgelt berechnen (max. BBG) ===
    const regelentgeltBrutto = Math.min(bruttogehalt, BBG_KV_MONAT);
    const tagesbrutto = regelentgeltBrutto / 30; // SGB V: 30 Tage pro Monat
    const tagesNetto = nettogehalt / 30;
    
    // === 2. Krankengeld-Brutto berechnen ===
    // 70% vom Brutto, aber max. 90% vom Netto
    const krankengeld70Brutto = tagesbrutto * 0.70;
    const krankengeld90Netto = tagesNetto * 0.90;
    const krankengeldBruttoTag = Math.min(krankengeld70Brutto, krankengeld90Netto);
    
    // Welche Grenze greift?
    const nettoGrenzeGreift = krankengeld70Brutto > krankengeld90Netto;
    
    // === 3. Sozialversicherungsbeiträge auf Krankengeld ===
    // Arbeitnehmer zahlt halben Satz bei RV und AV, vollen Satz bei PV
    const beitragRV = krankengeldBruttoTag * BEITRAGSSAETZE.rentenversicherung;
    const beitragAV = krankengeldBruttoTag * BEITRAGSSAETZE.arbeitslosenversicherung;
    
    // Pflegeversicherung: Zuschlag für Kinderlose ab 23, Abschläge für 2-5 Kinder
    let pflegeSatz = BEITRAGSSAETZE.pflegeversicherung;
    if (!hatKinder && alter >= 23) {
      pflegeSatz += BEITRAGSSAETZE.pflegeversicherungKinderlos;
    }
    if (hatKinder && anzahlKinder >= 2) {
      const abschlagIndex = Math.min(anzahlKinder - 2, 3);
      pflegeSatz += BEITRAGSSAETZE.pflegeversicherungMehrKinder[abschlagIndex];
    }
    const beitragPV = krankengeldBruttoTag * Math.max(0, pflegeSatz);
    
    const svBeitraegeTag = beitragRV + beitragAV + beitragPV;
    
    // === 4. Krankengeld Netto ===
    const krankengeldNettoTag = krankengeldBruttoTag - svBeitraegeTag;
    
    // === 5. Umrechnung auf Monat/Woche ===
    const krankengeldBruttoMonat = krankengeldBruttoTag * 30;
    const krankengeldNettoMonat = krankengeldNettoTag * 30;
    const krankengeldBruttoWoche = krankengeldBruttoTag * 7;
    const krankengeldNettoWoche = krankengeldNettoTag * 7;
    
    // === 6. Einkommensverlust berechnen ===
    const einkommensverlust = nettogehalt - krankengeldNettoMonat;
    const verlustProzent = (einkommensverlust / nettogehalt) * 100;
    
    // === 7. Gesamtleistung für Krankheitsdauer ===
    const gesamtTage = Math.min(krankheitsdauer, MAX_KRANKENGELD_TAGE - 42); // nach 6 Wochen Lohnfortzahlung
    const gesamtKrankengeldBrutto = krankengeldBruttoTag * gesamtTage;
    const gesamtKrankengeldNetto = krankengeldNettoTag * gesamtTage;
    
    // === 8. Maximale Bezugsdauer ===
    const maxBezugWochen = MAX_KRANKENGELD_WOCHEN - 6; // minus 6 Wochen Lohnfortzahlung
    const maxBezugTage = maxBezugWochen * 7;
    
    return {
      // Eingangswerte
      bruttogehalt,
      nettogehalt,
      regelentgeltBrutto,
      
      // Berechnung
      tagesbrutto,
      tagesNetto,
      krankengeld70Brutto,
      krankengeld90Netto,
      nettoGrenzeGreift,
      
      // Brutto-Krankengeld
      krankengeldBruttoTag,
      krankengeldBruttoWoche,
      krankengeldBruttoMonat,
      
      // SV-Beiträge
      beitragRV,
      beitragAV,
      beitragPV,
      svBeitraegeTag,
      svBeitraegeMonat: svBeitraegeTag * 30,
      pflegeSatz,
      
      // Netto-Krankengeld
      krankengeldNettoTag,
      krankengeldNettoWoche,
      krankengeldNettoMonat,
      
      // Verlust
      einkommensverlust,
      verlustProzent,
      
      // Gesamtleistung
      gesamtTage,
      gesamtKrankengeldBrutto,
      gesamtKrankengeldNetto,
      
      // Bezugsdauer
      maxBezugWochen,
      maxBezugTage,
    };
  }, [bruttogehalt, nettogehalt, hatKinder, anzahlKinder, alter, krankheitsdauer]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      <RechnerFeedback rechnerName="Krankengeld-Rechner 2025 & 2026" rechnerSlug="krankengeld-rechner" />

{/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bruttogehalt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliches Bruttogehalt</span>
            <span className="text-xs text-gray-500 block mt-1">
              Regelmäßiges Arbeitsentgelt vor Steuern und Abgaben
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttogehalt}
              onChange={(e) => setBruttogehalt(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              max="15000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
          </div>
          <input
            type="range"
            value={bruttogehalt}
            onChange={(e) => setBruttogehalt(Number(e.target.value))}
            className="w-full mt-3 accent-teal-500"
            min="1000"
            max="8000"
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1.000 €</span>
            <span>4.500 €</span>
            <span>8.000 €</span>
          </div>
          {bruttogehalt > BBG_KV_MONAT && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Beitragsbemessungsgrenze erreicht: max. {formatEuro(BBG_KV_MONAT)} werden berücksichtigt
            </p>
          )}
        </div>

        {/* Nettogehalt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliches Nettogehalt</span>
            <span className="text-xs text-gray-500 block mt-1">
              Auszahlungsbetrag nach Steuern und Sozialabgaben
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={nettogehalt}
              onChange={(e) => setNettogehalt(Math.max(0, Number(e.target.value)))}
              className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-0 outline-none"
              min="0"
              max="10000"
              step="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>
          <input
            type="range"
            value={nettogehalt}
            onChange={(e) => setNettogehalt(Number(e.target.value))}
            className="w-full mt-3 accent-teal-500"
            min="500"
            max="5000"
            step="50"
          />
        </div>

        {/* Alter */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ihr Alter</span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAlter(Math.max(16, alter - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">{alter}</span>
              <span className="text-gray-500 ml-1">Jahre</span>
            </div>
            <button
              onClick={() => setAlter(Math.min(67, alter + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Haben Sie Kinder?</span>
            <span className="text-xs text-gray-500 block mt-1">
              Relevant für den Pflegeversicherungs-Beitrag
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => { setHatKinder(false); setAnzahlKinder(0); }}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !hatKinder
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Keine Kinder
            </button>
            <button
              onClick={() => { setHatKinder(true); setAnzahlKinder(Math.max(1, anzahlKinder)); }}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                hatKinder
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mit Kindern
            </button>
          </div>
          
          {hatKinder && (
            <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl">
              <span className="text-sm text-teal-700">Anzahl Kinder:</span>
              <button
                onClick={() => setAnzahlKinder(Math.max(1, anzahlKinder - 1))}
                className="w-10 h-10 rounded-xl bg-white hover:bg-teal-100 text-lg font-bold transition-colors"
              >
                −
              </button>
              <span className="text-xl font-bold text-teal-800 w-8 text-center">{anzahlKinder}</span>
              <button
                onClick={() => setAnzahlKinder(Math.min(6, anzahlKinder + 1))}
                className="w-10 h-10 rounded-xl bg-white hover:bg-teal-100 text-lg font-bold transition-colors"
              >
                +
              </button>
            </div>
          )}
          
          {!hatKinder && alter >= 23 && (
            <p className="text-xs text-amber-600 mt-2">
              ℹ️ Kinderlose ab 23 Jahren zahlen 0,6% mehr Pflegeversicherung
            </p>
          )}
        </div>

        {/* Krankheitsdauer */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Geplante Krankheitsdauer</span>
            <span className="text-xs text-gray-500 block mt-1">
              Nach den 6 Wochen Lohnfortzahlung durch den Arbeitgeber
            </span>
          </label>
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className="text-3xl font-bold text-gray-800">{krankheitsdauer}</span>
            <span className="text-gray-500">Tage</span>
          </div>
          <input
            type="range"
            value={krankheitsdauer}
            onChange={(e) => setKrankheitsdauer(Number(e.target.value))}
            className="w-full accent-teal-500"
            min="1"
            max="504"
            step="1"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 Tag</span>
            <span>3 Monate</span>
            <span>72 Wochen max.</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            = {Math.floor(krankheitsdauer / 30)} Monate und {krankheitsdauer % 30} Tage 
            ({Math.floor(krankheitsdauer / 7)} Wochen)
          </p>
        </div>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">💊 Ihr voraussichtliches Krankengeld</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.krankengeldNettoMonat)}</span>
            <span className="text-xl opacity-80">netto / Monat</span>
          </div>
          <p className="text-teal-100 mt-2 text-sm">
            Das sind <strong>{formatEuro(ergebnis.krankengeldNettoTag)}</strong> pro Tag 
            ({formatEuro(ergebnis.krankengeldBruttoTag)} brutto)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Brutto / Monat</span>
            <div className="text-xl font-bold">{formatEuroRound(ergebnis.krankengeldBruttoMonat)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Einkommensverlust</span>
            <div className="text-xl font-bold text-red-200">−{formatEuroRound(ergebnis.einkommensverlust)}</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Bei {krankheitsdauer} Tagen Krankheit</span>
            <span className="text-lg font-bold">{formatEuroRound(ergebnis.gesamtKrankengeldNetto)}</span>
          </div>
          <p className="text-xs text-teal-100 mt-1">
            Gesamtes Netto-Krankengeld nach Sozialabgaben
          </p>
        </div>
      </div>
{/* Zeitlicher Ablauf */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📅 Zeitlicher Ablauf bei Krankheit</h3>
        
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-4">
            {/* Phase 1: Lohnfortzahlung */}
            <div className="relative pl-10">
              <div className="absolute left-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">1</span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-semibold text-green-800">Woche 1-6: Lohnfortzahlung</h4>
                <p className="text-sm text-green-700 mt-1">
                  Der Arbeitgeber zahlt <strong>100% Ihres Gehalts</strong> weiter.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Basis: § 3 Entgeltfortzahlungsgesetz (EFZG)
                </p>
              </div>
            </div>
            
            {/* Phase 2: Krankengeld */}
            <div className="relative pl-10">
              <div className="absolute left-2 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                <span className="text-white text-xs">2</span>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <h4 className="font-semibold text-teal-800">Ab Woche 7: Krankengeld</h4>
                <p className="text-sm text-teal-700 mt-1">
                  Die Krankenkasse zahlt <strong>{formatEuroRound(ergebnis.krankengeldNettoMonat)}/Monat</strong> 
                  (ca. {formatProzent(100 - ergebnis.verlustProzent)} Ihres Nettos).
                </p>
                <p className="text-xs text-teal-600 mt-2">
                  Basis: § 44 SGB V – Krankengeld
                </p>
              </div>
            </div>
            
            {/* Phase 3: Ende */}
            <div className="relative pl-10">
              <div className="absolute left-2 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                <span className="text-white text-xs">3</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800">Max. Woche 78: Ende Krankengeld</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Nach 78 Wochen (72 + 6) endet der Anspruch. Danach ggf. 
                  Arbeitslosengeld oder Erwerbsminderungsrente.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Sperrfrist: 3 Jahre für dieselbe Krankheit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          {/* Grundlage */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Berechnungsgrundlage
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Bruttogehalt (monatlich)</span>
            <span className="font-bold text-gray-900">{formatEuro(bruttogehalt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Regelentgelt (max. BBG)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.regelentgeltBrutto)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Tagesbrutto (÷ 30 Tage)</span>
            <span className="text-gray-900">{formatEuro(ergebnis.tagesbrutto)}</span>
          </div>
          
          {/* Krankengeld-Berechnung */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Krankengeld-Brutto
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">70% vom Tagesbrutto</span>
            <span className={`${!ergebnis.nettoGrenzeGreift ? 'font-bold text-teal-600' : 'text-gray-400'}`}>
              {formatEuro(ergebnis.krankengeld70Brutto)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">90% vom Tagesnetto</span>
            <span className={`${ergebnis.nettoGrenzeGreift ? 'font-bold text-teal-600' : 'text-gray-400'}`}>
              {formatEuro(ergebnis.krankengeld90Netto)}
            </span>
          </div>
          <div className="flex justify-between py-2 bg-teal-50 -mx-6 px-6">
            <span className="font-medium text-teal-700">
              = Krankengeld brutto / Tag 
              <span className="text-xs font-normal ml-1">
                ({ergebnis.nettoGrenzeGreift ? 'Netto-Grenze' : '70%-Regel'})
              </span>
            </span>
            <span className="font-bold text-teal-900">{formatEuro(ergebnis.krankengeldBruttoTag)}</span>
          </div>
          
          {/* SV-Beiträge */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Abzüge (Sozialversicherung)
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Rentenversicherung (9,3%)</span>
            <span>{formatEuro(ergebnis.beitragRV)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Arbeitslosenversicherung (1,3%)</span>
            <span>{formatEuro(ergebnis.beitragAV)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Pflegeversicherung ({formatProzent(ergebnis.pflegeSatz * 100)})</span>
            <span>{formatEuro(ergebnis.beitragPV)}</span>
          </div>
          <div className="flex justify-between py-2 bg-red-50 -mx-6 px-6">
            <span className="font-medium text-red-700">= Summe Abzüge / Tag</span>
            <span className="font-bold text-red-900">{formatEuro(ergebnis.svBeitraegeTag)}</span>
          </div>
          
          {/* Ergebnis */}
          <div className="flex justify-between py-3 bg-teal-100 -mx-6 px-6 rounded-b-xl mt-4">
            <span className="font-bold text-teal-800">Krankengeld netto / Tag</span>
            <span className="font-bold text-2xl text-teal-900">{formatEuro(ergebnis.krankengeldNettoTag)}</span>
          </div>
          <div className="flex justify-between py-2 -mx-6 px-6">
            <span className="text-gray-600">Krankengeld netto / Monat (×30)</span>
            <span className="font-bold text-teal-700">{formatEuro(ergebnis.krankengeldNettoMonat)}</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert Krankengeld</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>70% vom Brutto:</strong> Krankengeld beträgt 70% des regelmäßigen Bruttoentgelts</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Max. 90% vom Netto:</strong> Das Krankengeld darf 90% des Nettoentgelts nicht übersteigen</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>BBG-Deckel:</strong> Nur Einkommen bis zur Beitragsbemessungsgrenze ({formatEuro(BBG_KV_MONAT)}/Monat) wird berücksichtigt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Ab Tag 43:</strong> Krankengeld wird erst nach 6 Wochen Lohnfortzahlung gezahlt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Max. 78 Wochen:</strong> Bezugsdauer für dieselbe Krankheit innerhalb von 3 Jahren</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Mit Abzügen:</strong> Auf Krankengeld werden RV, AV und PV abgezogen (Arbeitnehmeranteil)</span>
          </li>
        </ul>
      </div>

      {/* Wer hat Anspruch */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-teal-800 mb-3">👥 Wer hat Anspruch auf Krankengeld?</h3>
        <div className="space-y-3 text-sm text-teal-700">
          <p>
            <strong>Anspruchsberechtigt</strong> sind gesetzlich Krankenversicherte mit Krankengeldanspruch:
          </p>
          <ul className="space-y-1 pl-4">
            <li>• Arbeitnehmer in der gesetzlichen Krankenversicherung</li>
            <li>• Arbeitslose mit ALG I</li>
            <li>• Bezieher von Kurzarbeitergeld</li>
            <li>• Freiwillig Versicherte (mit Wahltarif Krankengeld)</li>
          </ul>
          <div className="bg-white/50 rounded-xl p-4 mt-3">
            <h4 className="font-semibold text-teal-800 mb-2">⚠️ Kein Krankengeld erhalten:</h4>
            <ul className="space-y-1">
              <li>• Familienversicherte (kein eigenes Einkommen)</li>
              <li>• Privatversicherte (separate Krankentagegeld-Versicherung)</li>
              <li>• Rentner</li>
              <li>• Minijobber ohne Krankengeld-Wahltarif</li>
              <li>• Selbstständige ohne Wahltarif</li>
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
            <span><strong>AU-Bescheinigung:</strong> Krankschreibung muss lückenlos vorliegen – Folgebescheinigung vor Ablauf holen!</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Krankmeldung:</strong> Arbeitgeber und Krankenkasse müssen unverzüglich informiert werden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Blockfrist:</strong> Nach 78 Wochen Krankengeld muss 3 Jahre gewartet werden, bevor für dieselbe Krankheit erneut Anspruch besteht</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Aussteuerung:</strong> Nach Ende des Krankengeldes droht Kündigung – frühzeitig um ALG oder Reha kümmern</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Nebenverdienst:</strong> Während Krankengeldbezug ist Arbeit grundsätzlich untersagt (Ausnahmen möglich)</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-teal-50 rounded-xl p-4">
            <p className="font-semibold text-teal-900">Ihre gesetzliche Krankenkasse</p>
            <p className="text-sm text-teal-700 mt-1">
              Krankengeld wird von Ihrer Krankenkasse gezahlt. Diese wird automatisch 
              vom Arbeitgeber nach 6 Wochen informiert.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Krankenkassen-Hotline</p>
                <p className="text-gray-600">Kontaktdaten auf Ihrer Versichertenkarte</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Services</p>
                <a 
                  href="https://www.gkv-spitzenverband.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  GKV-Spitzenverband →
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Benötigte Unterlagen</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Arbeitsunfähigkeitsbescheinigung (AU)</li>
                <li>• Entgeltbescheinigung vom Arbeitgeber</li>
                <li>• Ggf. Antrag auf Krankengeld (bei einigen Kassen)</li>
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
            href="https://www.gesetze-im-internet.de/sgb_5/__44.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 44 SGB V – Krankengeld – Gesetze im Internet
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_5/__47.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 47 SGB V – Höhe und Berechnung des Krankengeldes
          </a>
          <a 
            href="https://www.bundesgesundheitsministerium.de/krankengeld"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium für Gesundheit – Krankengeld
          </a>
          <a 
            href="https://www.gkv-spitzenverband.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            GKV-Spitzenverband – Gesetzliche Krankenversicherung
          </a>
          <a 
            href="https://www.deutsche-rentenversicherung.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Deutsche Rentenversicherung – Beitragssätze 2026
          </a>
        </div>
      </div>
    </div>
  );
}
