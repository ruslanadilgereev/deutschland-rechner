import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════
// OFFIZIELLE WERTE 2026 nach §62 SGB V
// ═══════════════════════════════════════════════════════════════

// Belastungsgrenzen
const BELASTUNGSGRENZE_STANDARD = 0.02; // 2% für Nicht-Chroniker
const BELASTUNGSGRENZE_CHRONIKER = 0.01; // 1% für chronisch Kranke

// Freibeträge 2026 (§62 Abs. 2 SGB V)
const BEZUGSGROESSE_2026 = 47460; // Jährliche Bezugsgröße 2026
const PARTNER_FREIBETRAG = BEZUGSGROESSE_2026 * 0.15; // 15% = 7.119€
const WEITERER_ANGEHOERIGER_FREIBETRAG = BEZUGSGROESSE_2026 * 0.10; // 10% = 4.746€
const KINDERFREIBETRAG_2026 = 9756; // §32 Abs. 6 EStG (3.414€ x 2 + 2.928€ BEA)

// Regelsatz für ALG II/Sozialhilfe-Empfänger (identisch 2024-2026)
const REGELSATZ_JAEHRLICH = 6756; // 563€ × 12 Monate

// Typische Zuzahlungen nach §61 SGB V
const ZUZAHLUNGEN = {
  krankenhaus: 10, // €/Tag (max 28 Tage/Jahr)
  reha: 10, // €/Tag
  arzneimittel_min: 5,
  arzneimittel_max: 10,
  heilmittel_rezept: 10, // Pro Rezept
  heilmittel_prozent: 0.10, // 10% der Kosten
  hilfsmittel_min: 5,
  hilfsmittel_max: 10,
  hilfsmittel_prozent: 0.10,
  fahrtkosten_min: 5,
  fahrtkosten_max: 10,
  fahrtkosten_prozent: 0.10,
};

type EinkommensArt = 'normal' | 'sozialleistung';

export default function ZuzahlungRechner() {
  // Eingabewerte
  const [bruttoEinkommen, setBruttoEinkommen] = useState(36000);
  const [einkommensArt, setEinkommensArt] = useState<EinkommensArt>('normal');
  const [hatPartner, setHatPartner] = useState(false);
  const [partnerEinkommen, setPartnerEinkommen] = useState(0);
  const [anzahlKinder, setAnzahlKinder] = useState(0);
  const [istChroniker, setIstChroniker] = useState(false);
  
  // Bereits gezahlte Zuzahlungen
  const [gezahlteZuzahlungen, setGezahlteZuzahlungen] = useState(0);
  
  // Detaillierte Zuzahlungen (optional)
  const [showDetails, setShowDetails] = useState(false);
  const [krankenhaustage, setKrankenhaustage] = useState(0);
  const [rehatage, setRehatage] = useState(0);
  const [medikamentenkosten, setMedikamentenkosten] = useState(0);
  const [heilmittelRezepte, setHeilmittelRezepte] = useState(0);
  const [heilmittelKosten, setHeilmittelKosten] = useState(0);

  const ergebnis = useMemo(() => {
    // ═══════════════════════════════════════════════════════════════
    // 1. BEMESSUNGSGRUNDLAGE BERECHNEN
    // ═══════════════════════════════════════════════════════════════
    
    let familieneinkommen: number;
    let verwendetRegelsatz = false;
    
    if (einkommensArt === 'sozialleistung') {
      // Bei ALG II / Sozialhilfe: Regelsatz für gesamte Bedarfsgemeinschaft
      familieneinkommen = REGELSATZ_JAEHRLICH;
      verwendetRegelsatz = true;
    } else {
      // Normales Einkommen: Summe aller Haushaltseinkommen
      familieneinkommen = bruttoEinkommen + (hatPartner ? partnerEinkommen : 0);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // 2. FREIBETRÄGE ABZIEHEN (nur bei normalem Einkommen)
    // ═══════════════════════════════════════════════════════════════
    
    let freibetraegeGesamt = 0;
    let partnerAbzug = 0;
    let kinderAbzug = 0;
    
    if (!verwendetRegelsatz) {
      // Partner/Ehegatte: 15% der Bezugsgröße
      if (hatPartner) {
        partnerAbzug = PARTNER_FREIBETRAG;
        freibetraegeGesamt += partnerAbzug;
      }
      
      // Kinder: Kinderfreibetrag nach §32 Abs. 6 EStG
      kinderAbzug = anzahlKinder * KINDERFREIBETRAG_2026;
      freibetraegeGesamt += kinderAbzug;
    }
    
    // Bemessungsgrundlage = Familieneinkommen - Freibeträge (min. 0)
    const bemessungsgrundlage = Math.max(0, familieneinkommen - freibetraegeGesamt);
    
    // ═══════════════════════════════════════════════════════════════
    // 3. BELASTUNGSGRENZE BERECHNEN
    // ═══════════════════════════════════════════════════════════════
    
    const prozentsatz = istChroniker ? BELASTUNGSGRENZE_CHRONIKER : BELASTUNGSGRENZE_STANDARD;
    const belastungsgrenze = bemessungsgrundlage * prozentsatz;
    
    // ═══════════════════════════════════════════════════════════════
    // 4. ZUZAHLUNGEN BERECHNEN (wenn Details aktiviert)
    // ═══════════════════════════════════════════════════════════════
    
    // Krankenhaus: 10€/Tag, max 28 Tage
    const krankenhausZuzahlung = Math.min(krankenhaustage, 28) * ZUZAHLUNGEN.krankenhaus;
    
    // Reha: 10€/Tag
    const rehaZuzahlung = rehatage * ZUZAHLUNGEN.reha;
    
    // Medikamente: 10% des Preises, min 5€, max 10€
    // Vereinfachung: Wir nehmen an, jedes Medikament kostet im Schnitt 50€
    const anzahlMedikamente = Math.ceil(medikamentenkosten / 50);
    const medikamentenZuzahlung = anzahlMedikamente * Math.min(
      ZUZAHLUNGEN.arzneimittel_max,
      Math.max(ZUZAHLUNGEN.arzneimittel_min, medikamentenkosten * 0.1 / Math.max(1, anzahlMedikamente))
    );
    
    // Heilmittel (Physio, etc.): 10€ pro Rezept + 10% der Kosten
    const heilmittelZuzahlung = (heilmittelRezepte * ZUZAHLUNGEN.heilmittel_rezept) + 
                                (heilmittelKosten * ZUZAHLUNGEN.heilmittel_prozent);
    
    // Summe der detaillierten Zuzahlungen
    const detailZuzahlungen = krankenhausZuzahlung + rehaZuzahlung + medikamentenZuzahlung + heilmittelZuzahlung;
    
    // Gesamte Zuzahlungen (manuell eingegeben oder aus Details)
    const gesamtZuzahlungen = showDetails ? detailZuzahlungen : gezahlteZuzahlungen;
    
    // ═══════════════════════════════════════════════════════════════
    // 5. BEFREIUNGSSTATUS ERMITTELN
    // ═══════════════════════════════════════════════════════════════
    
    const istBefreit = gesamtZuzahlungen >= belastungsgrenze;
    const restbetrag = Math.max(0, belastungsgrenze - gesamtZuzahlungen);
    const ueberzahlung = Math.max(0, gesamtZuzahlungen - belastungsgrenze);
    const fortschrittProzent = belastungsgrenze > 0 
      ? Math.min(100, (gesamtZuzahlungen / belastungsgrenze) * 100) 
      : 0;
    
    // ═══════════════════════════════════════════════════════════════
    // 6. MONATSBETRÄGE
    // ═══════════════════════════════════════════════════════════════
    
    const belastungsgrenzeMonat = belastungsgrenze / 12;
    const restbetragMonat = restbetrag / 12;
    
    return {
      // Eingangswerte
      familieneinkommen,
      verwendetRegelsatz,
      
      // Freibeträge
      partnerAbzug,
      kinderAbzug,
      freibetraegeGesamt,
      
      // Berechnung
      bemessungsgrundlage,
      prozentsatz,
      belastungsgrenze,
      belastungsgrenzeMonat,
      
      // Zuzahlungen
      gesamtZuzahlungen,
      krankenhausZuzahlung,
      rehaZuzahlung,
      medikamentenZuzahlung,
      heilmittelZuzahlung,
      
      // Status
      istBefreit,
      restbetrag,
      restbetragMonat,
      ueberzahlung,
      fortschrittProzent,
    };
  }, [bruttoEinkommen, einkommensArt, hatPartner, partnerEinkommen, anzahlKinder, 
      istChroniker, gezahlteZuzahlungen, showDetails, krankenhaustage, rehatage,
      medikamentenkosten, heilmittelRezepte, heilmittelKosten]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRound = (n: number) => Math.round(n).toLocaleString('de-DE') + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        
        {/* Einkommensart */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Art des Einkommens</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setEinkommensArt('normal')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                einkommensArt === 'normal'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💼 Erwerbseinkommen
            </button>
            <button
              onClick={() => setEinkommensArt('sozialleistung')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                einkommensArt === 'sozialleistung'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🏛️ Bürgergeld/Sozialhilfe
            </button>
          </div>
          {einkommensArt === 'sozialleistung' && (
            <p className="text-sm text-purple-600 mt-2">
              ℹ️ Bei Bürgergeld/Sozialhilfe gilt der Regelsatz von {formatEuroRound(REGELSATZ_JAEHRLICH)}/Jahr
            </p>
          )}
        </div>

        {/* Bruttoeinkommen (nur bei normalem Einkommen) */}
        {einkommensArt === 'normal' && (
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">Jährliches Bruttoeinkommen</span>
              <span className="text-xs text-gray-500 block mt-1">
                Alle Bruttoeinnahmen zum Lebensunterhalt (Gehalt, Rente, etc.)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={bruttoEinkommen}
                onChange={(e) => setBruttoEinkommen(Math.max(0, Number(e.target.value)))}
                className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                min="0"
                max="200000"
                step="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€/Jahr</span>
            </div>
            <input
              type="range"
              value={bruttoEinkommen}
              onChange={(e) => setBruttoEinkommen(Number(e.target.value))}
              className="w-full mt-3 accent-purple-500"
              min="0"
              max="100000"
              step="1000"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 €</span>
              <span>50.000 €</span>
              <span>100.000 €</span>
            </div>
          </div>
        )}

        {/* Partner */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Leben Sie mit Partner/Ehegatte im Haushalt?</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setHatPartner(false); setPartnerEinkommen(0); }}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !hatPartner
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Alleinstehend
            </button>
            <button
              onClick={() => setHatPartner(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                hatPartner
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mit Partner/Ehegatte
            </button>
          </div>
          
          {hatPartner && einkommensArt === 'normal' && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl">
              <label className="block mb-2 text-sm text-purple-700">
                Bruttoeinkommen des Partners (jährlich)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={partnerEinkommen}
                  onChange={(e) => setPartnerEinkommen(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                  min="0"
                  step="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
            </div>
          )}
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Anzahl der Kinder im Haushalt</span>
            <span className="text-xs text-gray-500 block mt-1">
              Minderjährige oder familienversicherte Kinder
            </span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAnzahlKinder(Math.max(0, anzahlKinder - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-4xl font-bold text-gray-800">{anzahlKinder}</span>
              <span className="text-gray-500 ml-2">Kind{anzahlKinder !== 1 ? 'er' : ''}</span>
            </div>
            <button
              onClick={() => setAnzahlKinder(Math.min(10, anzahlKinder + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Chroniker-Status */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Chronisch krank?</span>
            <span className="text-xs text-gray-500 block mt-1">
              Schwerwiegende chronische Erkrankung in Dauerbehandlung (ärztlich bestätigt)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIstChroniker(false)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                !istChroniker
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nein (2% Grenze)
            </button>
            <button
              onClick={() => setIstChroniker(true)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                istChroniker
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ja (1% Grenze)
            </button>
          </div>
        </div>

        {/* Gezahlte Zuzahlungen */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-gray-700 font-medium">
              {showDetails ? '📋 Detaillierte Zuzahlungen' : '💰 Bereits gezahlte Zuzahlungen (2026)'}
            </label>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              {showDetails ? 'Einfache Eingabe' : 'Details eingeben'}
            </button>
          </div>
          
          {!showDetails ? (
            <div className="relative">
              <input
                type="number"
                value={gezahlteZuzahlungen}
                onChange={(e) => setGezahlteZuzahlungen(Math.max(0, Number(e.target.value)))}
                className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none"
                min="0"
                step="10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              {/* Krankenhaus */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700">🏥 Krankenhaus</span>
                  <span className="text-xs text-gray-500 block">10€/Tag, max 28 Tage</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={krankenhaustage}
                    onChange={(e) => setKrankenhaustage(Math.max(0, Math.min(365, Number(e.target.value))))}
                    className="w-20 text-center py-1 px-2 border rounded-lg"
                    min="0"
                    max="365"
                  />
                  <span className="text-gray-500 text-sm">Tage</span>
                </div>
              </div>
              
              {/* Reha */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700">🏨 Rehabilitation</span>
                  <span className="text-xs text-gray-500 block">10€/Tag</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rehatage}
                    onChange={(e) => setRehatage(Math.max(0, Number(e.target.value)))}
                    className="w-20 text-center py-1 px-2 border rounded-lg"
                    min="0"
                  />
                  <span className="text-gray-500 text-sm">Tage</span>
                </div>
              </div>
              
              {/* Medikamente */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700">💊 Medikamente</span>
                  <span className="text-xs text-gray-500 block">10% (min 5€, max 10€)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={medikamentenkosten}
                    onChange={(e) => setMedikamentenkosten(Math.max(0, Number(e.target.value)))}
                    className="w-24 text-center py-1 px-2 border rounded-lg"
                    min="0"
                    step="10"
                  />
                  <span className="text-gray-500 text-sm">€ Kosten</span>
                </div>
              </div>
              
              {/* Heilmittel */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700">💆 Heilmittel (Physio, etc.)</span>
                  <span className="text-xs text-gray-500 block">10€/Rezept + 10%</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={heilmittelRezepte}
                      onChange={(e) => setHeilmittelRezepte(Math.max(0, Number(e.target.value)))}
                      className="w-16 text-center py-1 px-2 border rounded-lg"
                      min="0"
                    />
                    <span className="text-gray-500 text-sm">Rezepte</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={heilmittelKosten}
                      onChange={(e) => setHeilmittelKosten(Math.max(0, Number(e.target.value)))}
                      className="w-16 text-center py-1 px-2 border rounded-lg"
                      min="0"
                      step="10"
                    />
                    <span className="text-gray-500 text-sm">€ Kosten</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.istBefreit 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
          : 'bg-gradient-to-br from-purple-500 to-indigo-600'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          💊 Ihre Belastungsgrenze 2026
        </h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuroRound(ergebnis.belastungsgrenze)}</span>
            <span className="text-xl opacity-80">/ Jahr</span>
          </div>
          <p className="opacity-80 mt-2 text-sm">
            Das sind <strong>{formatEuro(ergebnis.belastungsgrenzeMonat)}</strong> pro Monat
            ({formatProzent(ergebnis.prozentsatz * 100)} von {formatEuroRound(ergebnis.bemessungsgrundlage)})
          </p>
        </div>

        {/* Fortschrittsbalken */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Gezahlt: {formatEuro(ergebnis.gesamtZuzahlungen)}</span>
            <span>{formatProzent(ergebnis.fortschrittProzent)}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all ${
                ergebnis.istBefreit ? 'bg-white' : 'bg-white/80'
              }`}
              style={{ width: `${Math.min(100, ergebnis.fortschrittProzent)}%` }}
            />
          </div>
        </div>

        <div className={`rounded-xl p-4 ${
          ergebnis.istBefreit ? 'bg-white/20' : 'bg-white/10'
        }`}>
          {ergebnis.istBefreit ? (
            <div className="text-center">
              <span className="text-3xl">🎉</span>
              <p className="font-bold text-lg mt-2">Belastungsgrenze erreicht!</p>
              <p className="text-sm opacity-90">
                Sie können eine <strong>Befreiung</strong> bei Ihrer Krankenkasse beantragen.
                {ergebnis.ueberzahlung > 0 && (
                  <> Rückerstattung: <strong>{formatEuro(ergebnis.ueberzahlung)}</strong></>
                )}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-medium">
                Noch <strong>{formatEuro(ergebnis.restbetrag)}</strong> bis zur Befreiung
              </p>
              <p className="text-sm opacity-90 mt-1">
                Tipp: Quittungen sammeln und bei Erreichen der Grenze Befreiung beantragen!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Einnahmen zum Lebensunterhalt
          </div>
          
          {ergebnis.verwendetRegelsatz ? (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Regelsatz (Bedarfsgemeinschaft)</span>
              <span className="font-bold text-gray-900">{formatEuroRound(REGELSATZ_JAEHRLICH)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Ihr Bruttoeinkommen (jährlich)</span>
                <span className="text-gray-900">{formatEuroRound(bruttoEinkommen)}</span>
              </div>
              {hatPartner && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">+ Partner-Einkommen</span>
                  <span className="text-gray-900">{formatEuroRound(partnerEinkommen)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
                <span className="font-medium text-gray-700">= Familieneinkommen</span>
                <span className="font-bold text-gray-900">{formatEuroRound(ergebnis.familieneinkommen)}</span>
              </div>
            </>
          )}
          
          {!ergebnis.verwendetRegelsatz && ergebnis.freibetraegeGesamt > 0 && (
            <>
              <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
                Freibeträge (§62 Abs. 2 SGB V)
              </div>
              
              {ergebnis.partnerAbzug > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                  <span>− Partner-Freibetrag (15% Bezugsgröße)</span>
                  <span>{formatEuroRound(ergebnis.partnerAbzug)}</span>
                </div>
              )}
              {ergebnis.kinderAbzug > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                  <span>− Kinderfreibetrag ({anzahlKinder} × {formatEuroRound(KINDERFREIBETRAG_2026)})</span>
                  <span>{formatEuroRound(ergebnis.kinderAbzug)}</span>
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-between py-3 bg-purple-50 -mx-6 px-6">
            <span className="font-medium text-purple-700">= Bemessungsgrundlage</span>
            <span className="font-bold text-purple-900">{formatEuroRound(ergebnis.bemessungsgrundlage)}</span>
          </div>
          
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Belastungsgrenze
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">
              {istChroniker ? '1% (chronisch krank)' : '2% (Standard)'}
            </span>
            <span className="text-gray-900">× {formatEuroRound(ergebnis.bemessungsgrundlage)}</span>
          </div>
          
          <div className="flex justify-between py-3 bg-purple-100 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-purple-800">= Ihre Belastungsgrenze</span>
            <span className="font-bold text-2xl text-purple-900">{formatEuro(ergebnis.belastungsgrenze)}</span>
          </div>
        </div>
      </div>

      {/* Was zählt als Zuzahlung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">✅ Diese Zuzahlungen zählen (§61 SGB V)</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-purple-50 rounded-xl">
            <span className="font-semibold text-purple-800">💊 Arzneimittel</span>
            <p className="text-xs text-purple-600 mt-1">10% des Preises (5€–10€)</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl">
            <span className="font-semibold text-purple-800">🏥 Krankenhaus</span>
            <p className="text-xs text-purple-600 mt-1">10€/Tag (max 28 Tage)</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl">
            <span className="font-semibold text-purple-800">🏨 Rehabilitation</span>
            <p className="text-xs text-purple-600 mt-1">10€/Tag</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl">
            <span className="font-semibold text-purple-800">💆 Heilmittel</span>
            <p className="text-xs text-purple-600 mt-1">10€/Rezept + 10%</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl">
            <span className="font-semibold text-purple-800">🦽 Hilfsmittel</span>
            <p className="text-xs text-purple-600 mt-1">10% (5€–10€)</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl">
            <span className="font-semibold text-purple-800">🚑 Fahrkosten</span>
            <p className="text-xs text-purple-600 mt-1">10% (5€–10€)</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-red-50 rounded-xl">
          <span className="font-semibold text-red-800">❌ Das zählt NICHT:</span>
          <p className="text-xs text-red-600 mt-1">
            Zahnersatz-Eigenanteile, Aufzahlungen über Festbetrag, IGeL-Leistungen, 
            nicht verordnungsfähige OTC-Präparate, Wahlleistungen
          </p>
        </div>
      </div>

      {/* Chroniker-Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">🩺 Wann gilt die 1%-Grenze?</h3>
        <p className="text-sm text-amber-700 mb-3">
          Als <strong>schwerwiegend chronisch krank</strong> gelten Sie, wenn Sie wegen derselben 
          Krankheit mindestens 1 Jahr in Dauerbehandlung sind UND einer dieser Punkte zutrifft:
        </p>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Grad der Behinderung (GdB) von mindestens 60%</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Pflegegrad 3, 4 oder 5</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Ohne Behandlung: lebensbedrohliche Verschlimmerung oder Verminderung der Lebenserwartung</span>
          </li>
        </ul>
        <p className="text-xs text-amber-600 mt-3">
          ⚠️ Sie benötigen eine <strong>ärztliche Bescheinigung</strong> (Chroniker-Bescheinigung) 
          für Ihre Krankenkasse. Diese ist alle 2 Jahre zu erneuern.
        </p>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Antrag & Zuständigkeit</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="font-semibold text-purple-900">Ihre gesetzliche Krankenkasse</p>
            <p className="text-sm text-purple-700 mt-1">
              Beantragen Sie die Befreiung direkt bei Ihrer Krankenkasse. 
              Sie können auch eine <strong>Vorauszahlung</strong> der Belastungsgrenze leisten 
              und sofort für das ganze Jahr befreit werden.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📋</span>
              <div>
                <p className="font-medium text-gray-800">Benötigte Unterlagen</p>
                <ul className="text-gray-600 mt-1 text-xs">
                  <li>• Alle Zuzahlungsquittungen</li>
                  <li>• Einkommensnachweis(e)</li>
                  <li>• Ggf. Chroniker-Bescheinigung</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">💡</span>
              <div>
                <p className="font-medium text-gray-800">Tipp</p>
                <p className="text-gray-600 text-xs">
                  Sammeln Sie alle Quittungen! Eine Erstattung ist 
                  bis zu 4 Jahre rückwirkend möglich.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">🌐</span>
            <div>
              <p className="font-medium text-gray-800">Online-Services</p>
              <a 
                href="https://www.gkv-spitzenverband.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline text-xs block"
              >
                GKV-Spitzenverband – Zuzahlung & Befreiung →
              </a>
              <a 
                href="https://www.bundesgesundheitsministerium.de/themen/krankenversicherung/arzneimittelversorgung/zuzahlung"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline text-xs block"
              >
                Bundesministerium für Gesundheit – Zuzahlungen →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Kalenderjahr:</strong> Die Befreiung gilt immer nur für das laufende Jahr</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Quittungen:</strong> Heben Sie alle Zuzahlungsbelege auf!</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Haushaltsprinzip:</strong> Alle Einkommen im Haushalt werden zusammengerechnet</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Vorsorge:</strong> Wer nach 01.04.1972 geboren ist und Vorsorgeuntersuchungen 
            nicht wahrnimmt, kann die 1%-Grenze verlieren</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Vorauszahlung:</strong> Sie können die Belastungsgrenze vorab zahlen und 
            sind sofort für das ganze Jahr befreit</span>
          </li>
        </ul>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/sgb_5/__61.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 61 SGB V – Zuzahlungen – Gesetze im Internet
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_5/__62.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 62 SGB V – Belastungsgrenze – Gesetze im Internet
          </a>
          <a 
            href="https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/3_Downloads/A/Arzneimittelversorgung/Zuzahlungsregelungen_GKV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesgesundheitsministerium – Zuzahlungsregelungen der GKV (PDF)
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
            href="https://www.g-ba.de/richtlinien/11/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Gemeinsamer Bundesausschuss – Chroniker-Richtlinie
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Stand: Januar 2026 | Bezugsgröße: {formatEuroRound(BEZUGSGROESSE_2026)}/Jahr | 
          Kinderfreibetrag: {formatEuroRound(KINDERFREIBETRAG_2026)}/Kind
        </p>
      </div>
    </div>
  );
}
