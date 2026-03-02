import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// PKV-GKV-Vergleich-Rechner 2026 - Private vs. Gesetzliche Krankenversicherung
// ═══════════════════════════════════════════════════════════════════════════════
// 
// RECHTSGRUNDLAGE: SGB V (GKV), VAG (PKV)
// QUELLEN:
// - Bundesgesundheitsministerium: https://www.bundesgesundheitsministerium.de
// - GKV-Spitzenverband: https://www.gkv-spitzenverband.de
// - PKV-Verband: https://www.pkv.de
// - Verband der Privaten Krankenversicherung
//
// OFFIZIELLE WERTE 2026:
// - Beitragsbemessungsgrenze KV: 5.812,50 €/Monat (69.750 €/Jahr)
// - Versicherungspflichtgrenze: 6.450 €/Monat (77.400 €/Jahr)
// - GKV-Beitragssatz: 14,6% + Zusatzbeitrag (⌀ 2,9%)
// - GKV-Pflegeversicherung: 3,6% (Kinderlose ab 23: 4,2%)
// - PKV-Standardtarif: Altersabhängig, ca. 350-800 €/Monat
// ═══════════════════════════════════════════════════════════════════════════════

const SOZIALVERSICHERUNG_2026 = {
  // Beitragsbemessungsgrenze Kranken-/Pflegeversicherung
  beitragsbemessungsgrenze: {
    monat: 5812.50,
    jahr: 69750,
  },
  
  // Versicherungspflichtgrenze (JAEG)
  versicherungspflichtgrenze: {
    monat: 6450,
    jahr: 77400,
  },
  
  // GKV-Beitragssätze
  gkv: {
    beitragssatz: 14.6,                   // Allgemeiner Beitragssatz
    durchschnittlicherZusatzbeitrag: 2.9, // BMG Bekanntmachung 2026
    arbeitgeberanteilKV: 7.3 + 1.45,      // Halber allgemeiner Satz + halber Zusatzbeitrag (Durchschnitt)
  },
  
  // Pflegeversicherung
  pflegeversicherung: {
    beitragssatz: 3.6,
    zuschlagKinderlose: 0.6,              // Ab 23 Jahre
    abschlagProKind: 0.25,                // Ab 2. Kind unter 25
    minimum: 2.4,                          // Bei 5+ Kindern
    arbeitgeberanteil: 1.8,               // Fester AG-Anteil (paritätisch = 3,6% / 2)
  },
  
  // PKV-Arbeitgeberzuschuss (max 50% der Höchstbeiträge)
  pkvArbeitgeberzuschussMax: {
    krankenversicherung: 508.59,          // 8,75% × 5.812,50 €
    pflegeversicherung: 104.63,           // 1,8% × 5.812,50 €
  },
};

// Typische PKV-Beiträge nach Eintrittsalter (Durchschnittswerte guter Tarife)
// Diese sind Richtwerte - tatsächliche Beiträge variieren stark je nach Anbieter/Tarif
const PKV_RICHTWERTE = {
  eintrittsalter: {
    25: { basisBeitrag: 350, mittlererBeitrag: 450, premiumBeitrag: 580 },
    30: { basisBeitrag: 380, mittlererBeitrag: 500, premiumBeitrag: 650 },
    35: { basisBeitrag: 420, mittlererBeitrag: 560, premiumBeitrag: 720 },
    40: { basisBeitrag: 480, mittlererBeitrag: 640, premiumBeitrag: 820 },
    45: { basisBeitrag: 550, mittlererBeitrag: 730, premiumBeitrag: 950 },
    50: { basisBeitrag: 650, mittlererBeitrag: 860, premiumBeitrag: 1120 },
    55: { basisBeitrag: 780, mittlererBeitrag: 1020, premiumBeitrag: 1350 },
  },
  // Jährliche Steigerung der PKV-Beiträge (Durchschnitt)
  jaehrlicheSteigerung: 3.5, // ca. 3-4% pro Jahr
};

type Versichertengruppe = 'angestellt' | 'selbstaendig' | 'beamter';
type PKVTarifniveau = 'basis' | 'mittel' | 'premium';

export default function PkvGkvRechner() {
  // Eingaben
  const [bruttoeinkommen, setBruttoeinkommen] = useState(6500);
  const [alter, setAlter] = useState(35);
  const [versichertengruppe, setVersichertengruppe] = useState<Versichertengruppe>('angestellt');
  const [kinderlos, setKinderlos] = useState(false);
  const [kinderanzahl, setKinderanzahl] = useState(0);
  const [zusatzbeitragGKV, setZusatzbeitragGKV] = useState(2.9);
  const [pkvTarifniveau, setPkvTarifniveau] = useState<PKVTarifniveau>('mittel');
  const [pkvBeitragManuell, setPkvBeitragManuell] = useState<number | null>(null);
  const [partnerMitversichern, setPartnerMitversichern] = useState(false);
  const [partnerEinkommenUnter565, setPartnerEinkommenUnter565] = useState(true);
  const [kinderMitversichern, setKinderMitversichern] = useState(false);
  const [betrachtungszeitraum, setBetrachtungszeitraum] = useState(20); // Jahre

  const ergebnis = useMemo(() => {
    // ═══════════════════════════════════════════════════════════════
    // GKV-BEITRAG BERECHNEN
    // ═══════════════════════════════════════════════════════════════
    
    // Beitragspflichtiges Einkommen (max. BBG)
    const beitragspflichtigesEinkommen = Math.min(
      bruttoeinkommen,
      SOZIALVERSICHERUNG_2026.beitragsbemessungsgrenze.monat
    );
    
    // GKV-Beitragssatz
    const gkvGesamtBeitragssatz = SOZIALVERSICHERUNG_2026.gkv.beitragssatz + zusatzbeitragGKV;
    
    // Pflegeversicherung-Beitragssatz
    let pvBeitragssatz = SOZIALVERSICHERUNG_2026.pflegeversicherung.beitragssatz;
    if (kinderlos && alter >= 23) {
      pvBeitragssatz += SOZIALVERSICHERUNG_2026.pflegeversicherung.zuschlagKinderlose;
    }
    if (!kinderlos && kinderanzahl >= 2) {
      const abschlaege = Math.min(kinderanzahl - 1, 4) * SOZIALVERSICHERUNG_2026.pflegeversicherung.abschlagProKind;
      pvBeitragssatz = Math.max(pvBeitragssatz - abschlaege, SOZIALVERSICHERUNG_2026.pflegeversicherung.minimum);
    }
    
    // GKV-Beiträge berechnen
    let gkvANAnteilKV: number;
    let gkvAGAnteilKV: number;
    let gkvANAnteilPV: number;
    let gkvAGAnteilPV: number;
    
    if (versichertengruppe === 'angestellt') {
      // Arbeitnehmer: 50/50 Aufteilung
      gkvANAnteilKV = beitragspflichtigesEinkommen * (gkvGesamtBeitragssatz / 2 / 100);
      gkvAGAnteilKV = gkvANAnteilKV;
      gkvAGAnteilPV = beitragspflichtigesEinkommen * (SOZIALVERSICHERUNG_2026.pflegeversicherung.arbeitgeberanteil / 100);
      gkvANAnteilPV = beitragspflichtigesEinkommen * (pvBeitragssatz / 100) - gkvAGAnteilPV;
    } else if (versichertengruppe === 'beamter') {
      // Beamte: Beihilfe (50-80%) + PKV für Rest (GKV hier nur als Vergleich)
      // Beamte sind normalerweise nicht GKV-versichert, aber für Vergleich:
      gkvANAnteilKV = beitragspflichtigesEinkommen * (gkvGesamtBeitragssatz / 100);
      gkvAGAnteilKV = 0;
      gkvANAnteilPV = beitragspflichtigesEinkommen * (pvBeitragssatz / 100);
      gkvAGAnteilPV = 0;
    } else {
      // Selbstständig: voller Beitrag
      gkvANAnteilKV = beitragspflichtigesEinkommen * (gkvGesamtBeitragssatz / 100);
      gkvAGAnteilKV = 0;
      gkvANAnteilPV = beitragspflichtigesEinkommen * (pvBeitragssatz / 100);
      gkvAGAnteilPV = 0;
    }
    
    const gkvGesamtAN = gkvANAnteilKV + gkvANAnteilPV;
    const gkvGesamtAG = gkvAGAnteilKV + gkvAGAnteilPV;
    
    // ═══════════════════════════════════════════════════════════════
    // PKV-BEITRAG BERECHNEN
    // ═══════════════════════════════════════════════════════════════
    
    // PKV-Beitrag ermitteln (nach Eintrittsalter)
    const altersgruppen = Object.keys(PKV_RICHTWERTE.eintrittsalter).map(Number).sort((a, b) => a - b);
    let relevantesAlter = altersgruppen[0];
    for (const grenze of altersgruppen) {
      if (alter >= grenze) relevantesAlter = grenze;
    }
    
    const pkvRichtwerte = PKV_RICHTWERTE.eintrittsalter[relevantesAlter as keyof typeof PKV_RICHTWERTE.eintrittsalter];
    let pkvBasisBeitrag: number;
    
    if (pkvBeitragManuell !== null && pkvBeitragManuell > 0) {
      pkvBasisBeitrag = pkvBeitragManuell;
    } else {
      switch (pkvTarifniveau) {
        case 'basis':
          pkvBasisBeitrag = pkvRichtwerte.basisBeitrag;
          break;
        case 'premium':
          pkvBasisBeitrag = pkvRichtwerte.premiumBeitrag;
          break;
        default:
          pkvBasisBeitrag = pkvRichtwerte.mittlererBeitrag;
      }
    }
    
    // Private Pflegeversicherung (ca. 50-80 € für Arbeitnehmer)
    const pkvPflegeversicherung = kinderlos && alter >= 23 ? 70 : 55;
    
    // PKV-Gesamtbeitrag (Versicherter)
    let pkvBruttoBeitrag = pkvBasisBeitrag + pkvPflegeversicherung;
    
    // Arbeitgeberzuschuss bei Angestellten
    let pkvArbeitgeberzuschuss = 0;
    if (versichertengruppe === 'angestellt') {
      const maxZuschussKV = SOZIALVERSICHERUNG_2026.pkvArbeitgeberzuschussMax.krankenversicherung;
      const maxZuschussPV = SOZIALVERSICHERUNG_2026.pkvArbeitgeberzuschussMax.pflegeversicherung;
      const zuschussKV = Math.min(pkvBasisBeitrag / 2, maxZuschussKV);
      const zuschussPV = Math.min(pkvPflegeversicherung / 2, maxZuschussPV);
      pkvArbeitgeberzuschuss = zuschussKV + zuschussPV;
    }
    
    // Beamtenbeihilfe (50-80% je nach Status)
    let beihilfeErstattung = 0;
    if (versichertengruppe === 'beamter') {
      // Beihilfe erstattet 50-80%, PKV nur Restkostenversicherung
      // Beitrag ist daher deutlich niedriger (ca. 30-50% des normalen Beitrags)
      beihilfeErstattung = pkvBruttoBeitrag * 0.5; // Vereinfacht: 50% Beihilfe
      pkvBruttoBeitrag = pkvBruttoBeitrag * 0.5; // Nur Restkostenversicherung
    }
    
    const pkvNettoBeitrag = pkvBruttoBeitrag - pkvArbeitgeberzuschuss;
    
    // ═══════════════════════════════════════════════════════════════
    // FAMILIENVERSICHERUNG
    // ═══════════════════════════════════════════════════════════════
    
    let familienversicherungVorteilGKV = 0;
    let pkvFamilienMehrkosten = 0;
    
    // Partner-Mitversicherung
    if (partnerMitversichern) {
      if (partnerEinkommenUnter565) {
        // GKV: kostenlos mitversichert
        familienversicherungVorteilGKV += 0;
      } else {
        // GKV: eigener Beitrag erforderlich (Mindestbemessung)
        familienversicherungVorteilGKV += 0; // Kein Vorteil
      }
      
      // PKV: eigener Beitrag
      pkvFamilienMehrkosten += pkvBasisBeitrag * 0.9; // Partner-Tarife meist günstiger
    }
    
    // Kinder-Mitversicherung
    if (kinderMitversichern && kinderanzahl > 0) {
      // GKV: Kinder kostenlos mitversichert
      familienversicherungVorteilGKV += 0;
      
      // PKV: Pro Kind ca. 100-200 €/Monat
      pkvFamilienMehrkosten += kinderanzahl * 150;
    }
    
    const pkvGesamtMitFamilie = pkvNettoBeitrag + pkvFamilienMehrkosten;
    
    // ═══════════════════════════════════════════════════════════════
    // LANGFRISTVERGLEICH
    // ═══════════════════════════════════════════════════════════════
    
    // Jährliche Beiträge
    const gkvJahresbeitragAN = gkvGesamtAN * 12;
    const pkvJahresbeitragNetto = pkvGesamtMitFamilie * 12;
    
    // Langfrist-Projektion
    const langfristVergleich: Array<{
      jahr: number;
      alter: number;
      gkvJahresbeitrag: number;
      pkvJahresbeitrag: number;
      differenz: number;
      kumulierteDifferenz: number;
    }> = [];
    
    let kumulierteDifferenz = 0;
    
    for (let i = 0; i <= betrachtungszeitraum; i++) {
      const aktuellesAlter = alter + i;
      
      // GKV: Beitrag bleibt prozentual gleich (steigt mit Einkommen)
      // Vereinfacht: 2% jährliche Gehaltssteigerung
      const einkommenInJahr = Math.min(
        bruttoeinkommen * Math.pow(1.02, i),
        SOZIALVERSICHERUNG_2026.beitragsbemessungsgrenze.monat * Math.pow(1.03, i) // BBG steigt auch
      );
      const gkvInJahr = einkommenInJahr * ((gkvGesamtBeitragssatz / 2 + pvBeitragssatz / 2) / 100) * 12;
      
      // PKV: Beitrag steigt ca. 3-4% pro Jahr
      const pkvBasisInJahr = pkvGesamtMitFamilie * Math.pow(1 + PKV_RICHTWERTE.jaehrlicheSteigerung / 100, i) * 12;
      
      // Im Rentenalter (ab 67): PKV-Beitrag kann durch Altersrückstellungen stabilisiert sein
      // GKV-Beitrag sinkt mit niedrigerem Renteneinkommen
      let gkvBeitragBereinigt = gkvInJahr;
      let pkvBeitragBereinigt = pkvBasisInJahr;
      
      if (aktuellesAlter >= 67) {
        // Rente ist ca. 48% des letzten Einkommens
        gkvBeitragBereinigt = gkvInJahr * 0.48;
        // PKV: Altersrückstellungen stabilisieren, aber keine drastische Senkung
        pkvBeitragBereinigt = pkvBasisInJahr * 0.9;
      }
      
      const differenz = pkvBeitragBereinigt - gkvBeitragBereinigt;
      kumulierteDifferenz += differenz;
      
      langfristVergleich.push({
        jahr: i,
        alter: aktuellesAlter,
        gkvJahresbeitrag: gkvBeitragBereinigt,
        pkvJahresbeitrag: pkvBeitragBereinigt,
        differenz,
        kumulierteDifferenz,
      });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // BREAK-EVEN & EMPFEHLUNG
    // ═══════════════════════════════════════════════════════════════
    
    // Monatliche Differenz aktuell
    const monatlicheDifferenz = pkvGesamtMitFamilie - gkvGesamtAN;
    const jaehrlicheDifferenz = monatlicheDifferenz * 12;
    
    // Empfehlung basierend auf Faktoren
    let empfehlung: 'gkv' | 'pkv' | 'neutral' = 'neutral';
    let empfehlungGruende: string[] = [];
    
    // Pro GKV
    if (kinderanzahl > 0 && kinderMitversichern) {
      empfehlungGruende.push('Kostenlose Familienversicherung für Kinder in der GKV');
      empfehlung = 'gkv';
    }
    if (partnerMitversichern && partnerEinkommenUnter565) {
      empfehlungGruende.push('Kostenlose Familienversicherung für Partner in der GKV');
      empfehlung = 'gkv';
    }
    if (alter >= 45) {
      empfehlungGruende.push('Höheres Eintrittsalter → höhere PKV-Beiträge und Gesundheitsprüfung');
      if (empfehlung !== 'gkv') empfehlung = 'gkv';
    }
    if (bruttoeinkommen < SOZIALVERSICHERUNG_2026.versicherungspflichtgrenze.monat) {
      empfehlungGruende.push('Einkommen unter Versicherungspflichtgrenze – PKV nur für Selbstständige/Beamte');
    }
    
    // Pro PKV
    if (versichertengruppe === 'beamter') {
      empfehlungGruende.push('Beihilfeanspruch macht PKV sehr attraktiv für Beamte');
      empfehlung = 'pkv';
    }
    if (alter <= 30 && kinderanzahl === 0 && bruttoeinkommen >= SOZIALVERSICHERUNG_2026.versicherungspflichtgrenze.monat) {
      empfehlungGruende.push('Jung, kinderlos, gut verdienend → PKV kann langfristig günstiger sein');
      if (empfehlung !== 'gkv') empfehlung = 'pkv';
    }
    if (monatlicheDifferenz < -100) {
      empfehlungGruende.push(`PKV aktuell ${Math.abs(monatlicheDifferenz).toFixed(0)} € günstiger pro Monat`);
    }
    
    // Neutral
    if (empfehlungGruende.length === 0) {
      empfehlungGruende.push('Individuelle Beratung empfohlen – beide Systeme haben Vor- und Nachteile');
    }
    
    return {
      // GKV
      gkvGesamtAN,
      gkvGesamtAG,
      gkvANAnteilKV,
      gkvANAnteilPV,
      gkvGesamtBeitragssatz,
      pvBeitragssatz,
      beitragspflichtigesEinkommen,
      
      // PKV
      pkvBasisBeitrag,
      pkvPflegeversicherung,
      pkvBruttoBeitrag: pkvBasisBeitrag + pkvPflegeversicherung,
      pkvArbeitgeberzuschuss,
      pkvNettoBeitrag,
      pkvFamilienMehrkosten,
      pkvGesamtMitFamilie,
      beihilfeErstattung,
      
      // Vergleich
      monatlicheDifferenz,
      jaehrlicheDifferenz,
      langfristVergleich,
      
      // Status
      kannInPKV: bruttoeinkommen > SOZIALVERSICHERUNG_2026.versicherungspflichtgrenze.monat || 
                 versichertengruppe === 'selbstaendig' || 
                 versichertengruppe === 'beamter',
      erreichtBBG: bruttoeinkommen >= SOZIALVERSICHERUNG_2026.beitragsbemessungsgrenze.monat,
      
      // Empfehlung
      empfehlung,
      empfehlungGruende,
      
      // Jahreswerte
      gkvJahresbeitragAN,
      pkvJahresbeitragNetto,
    };
  }, [
    bruttoeinkommen, alter, versichertengruppe, kinderlos, kinderanzahl,
    zusatzbeitragGKV, pkvTarifniveau, pkvBeitragManuell, partnerMitversichern,
    partnerEinkommenUnter565, kinderMitversichern, betrachtungszeitraum
  ]);

  const formatEuro = (betrag: number) => {
    return betrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const formatProzent = (prozent: number) => {
    return prozent.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%';
  };

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ihre Angaben</h2>
        
        {/* Berufsstatus */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Berufsstatus
          </label>
          <select
            value={versichertengruppe}
            onChange={(e) => setVersichertengruppe(e.target.value as Versichertengruppe)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="angestellt">Angestellt</option>
            <option value="selbstaendig">Selbstständig</option>
            <option value="beamter">Beamter</option>
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            min="3000"
            max="15000"
            step="100"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>3.000 €</span>
            <span className="text-blue-600">Pflichtgrenze: {formatEuro(SOZIALVERSICHERUNG_2026.versicherungspflichtgrenze.monat)}</span>
            <span>15.000 €</span>
          </div>
          {bruttoeinkommen < SOZIALVERSICHERUNG_2026.versicherungspflichtgrenze.monat && versichertengruppe === 'angestellt' && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ Unter der Versicherungspflichtgrenze – PKV als Angestellter nicht möglich
            </p>
          )}
        </div>
        
        {/* Alter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alter
          </label>
          <input
            type="number"
            value={alter}
            onChange={(e) => setAlter(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="20"
            max="65"
          />
          <input
            type="range"
            value={alter}
            onChange={(e) => setAlter(Number(e.target.value))}
            className="w-full mt-2"
            min="20"
            max="65"
          />
        </div>
        
        {/* Kinder */}
        <div className="mb-4">
          <label className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={kinderlos}
              onChange={(e) => {
                setKinderlos(e.target.checked);
                if (e.target.checked) {
                  setKinderanzahl(0);
                  setKinderMitversichern(false);
                }
              }}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Kinderlos {alter >= 23 && <span className="text-amber-600">(+0,6% Pflegeversicherung)</span>}
            </span>
          </label>
          
          {!kinderlos && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anzahl Kinder unter 25
                </label>
                <select
                  value={kinderanzahl}
                  onChange={(e) => setKinderanzahl(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">1 Kind</option>
                  <option value="2">2 Kinder</option>
                  <option value="3">3 Kinder</option>
                  <option value="4">4 Kinder</option>
                  <option value="5">5+ Kinder</option>
                </select>
              </div>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={kinderMitversichern}
                  onChange={(e) => setKinderMitversichern(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Kinder mitversichern (in GKV kostenlos!)
                </span>
              </label>
            </>
          )}
        </div>
        
        {/* Partner */}
        <div className="mb-4">
          <label className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={partnerMitversichern}
              onChange={(e) => setPartnerMitversichern(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Partner/Ehepartner mitversichern
            </span>
          </label>
          
          {partnerMitversichern && (
            <label className="flex items-center gap-3 ml-8">
              <input
                type="checkbox"
                checked={partnerEinkommenUnter565}
                onChange={(e) => setPartnerEinkommenUnter565(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Partner verdient unter 565 €/Monat (GKV-Familienversicherung möglich)
              </span>
            </label>
          )}
        </div>
        
        {/* GKV-Zusatzbeitrag */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GKV-Zusatzbeitrag
          </label>
          <div className="relative">
            <input
              type="number"
              value={zusatzbeitragGKV}
              onChange={(e) => setZusatzbeitragGKV(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="5"
              step="0.1"
            />
            <span className="absolute right-3 top-3 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Durchschnitt 2026: 2,9% (günstigste: 1,68%, teuerste: 2,99%)
          </p>
        </div>
        
        {/* PKV-Tarifniveau */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PKV-Tarifniveau (geschätzt)
          </label>
          <select
            value={pkvTarifniveau}
            onChange={(e) => {
              setPkvTarifniveau(e.target.value as PKVTarifniveau);
              setPkvBeitragManuell(null);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="basis">Basis-Tarif (günstig, Grundleistungen)</option>
            <option value="mittel">Mittlerer Tarif (Standard)</option>
            <option value="premium">Premium-Tarif (Chefarzt, Einzelzimmer)</option>
          </select>
        </div>
        
        {/* PKV-Beitrag manuell */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PKV-Beitrag manuell eingeben (optional)
          </label>
          <div className="relative">
            <input
              type="number"
              value={pkvBeitragManuell ?? ''}
              onChange={(e) => setPkvBeitragManuell(e.target.value ? Number(e.target.value) : null)}
              placeholder="Eigenen PKV-Beitrag eingeben"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="10"
            />
            <span className="absolute right-3 top-3 text-gray-500">€</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Falls Sie bereits ein konkretes PKV-Angebot haben
          </p>
        </div>
        
        {/* Betrachtungszeitraum */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Betrachtungszeitraum für Langfristvergleich
          </label>
          <select
            value={betrachtungszeitraum}
            onChange={(e) => setBetrachtungszeitraum(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="10">10 Jahre</option>
            <option value="20">20 Jahre</option>
            <option value="30">30 Jahre (bis zur Rente)</option>
          </select>
        </div>
      </div>
      
      {/* Hauptergebnis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GKV */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏥</span>
            <h2 className="text-lg font-semibold">GKV (Gesetzliche)</h2>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
            <p className="text-green-100 text-sm">Ihr Beitrag monatlich</p>
            <p className="text-3xl font-bold">{formatEuro(ergebnis.gkvGesamtAN)}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-100">KV ({formatProzent(ergebnis.gkvGesamtBeitragssatz / 2)})</span>
              <span>{formatEuro(ergebnis.gkvANAnteilKV)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-100">PV ({formatProzent(ergebnis.pvBeitragssatz / 2)})</span>
              <span>{formatEuro(ergebnis.gkvANAnteilPV)}</span>
            </div>
            {ergebnis.gkvGesamtAG > 0 && (
              <div className="flex justify-between text-green-200 pt-2 border-t border-green-400/30">
                <span>Arbeitgeber zahlt</span>
                <span>{formatEuro(ergebnis.gkvGesamtAG)}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-green-400/30">
            <p className="text-green-100 text-sm">Jährlich</p>
            <p className="text-xl font-bold">{formatEuro(ergebnis.gkvJahresbeitragAN)}</p>
          </div>
        </div>
        
        {/* PKV */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏛️</span>
            <h2 className="text-lg font-semibold">PKV (Private)</h2>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
            <p className="text-blue-100 text-sm">Ihr Beitrag monatlich</p>
            <p className="text-3xl font-bold">{formatEuro(ergebnis.pkvGesamtMitFamilie)}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-100">KV-Tarif ({pkvTarifniveau})</span>
              <span>{formatEuro(ergebnis.pkvBasisBeitrag)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-100">Pflegepflichtvers.</span>
              <span>{formatEuro(ergebnis.pkvPflegeversicherung)}</span>
            </div>
            {ergebnis.pkvFamilienMehrkosten > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-100">Familie</span>
                <span>+{formatEuro(ergebnis.pkvFamilienMehrkosten)}</span>
              </div>
            )}
            {ergebnis.pkvArbeitgeberzuschuss > 0 && (
              <div className="flex justify-between text-blue-200 pt-2 border-t border-blue-400/30">
                <span>AG-Zuschuss</span>
                <span>-{formatEuro(ergebnis.pkvArbeitgeberzuschuss)}</span>
              </div>
            )}
            {ergebnis.beihilfeErstattung > 0 && (
              <div className="flex justify-between text-blue-200">
                <span>Beihilfe (50%)</span>
                <span>-{formatEuro(ergebnis.beihilfeErstattung)}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-400/30">
            <p className="text-blue-100 text-sm">Jährlich</p>
            <p className="text-xl font-bold">{formatEuro(ergebnis.pkvJahresbeitragNetto)}</p>
          </div>
        </div>
      </div>
      
      {/* Differenz */}
      <div className={`rounded-2xl shadow-lg p-6 ${
        ergebnis.monatlicheDifferenz > 0 
          ? 'bg-green-50 border-2 border-green-200' 
          : ergebnis.monatlicheDifferenz < 0 
            ? 'bg-blue-50 border-2 border-blue-200'
            : 'bg-gray-50 border-2 border-gray-200'
      }`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {ergebnis.monatlicheDifferenz > 0 ? '✅ GKV ist günstiger' : 
           ergebnis.monatlicheDifferenz < 0 ? '✅ PKV ist günstiger' : 
           '➡️ Etwa gleich'}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Monatliche Differenz</p>
            <p className={`text-2xl font-bold ${
              ergebnis.monatlicheDifferenz > 0 ? 'text-green-600' : 
              ergebnis.monatlicheDifferenz < 0 ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {ergebnis.monatlicheDifferenz > 0 ? '+' : ''}{formatEuro(Math.abs(ergebnis.monatlicheDifferenz))}
            </p>
            <p className="text-xs text-gray-500">
              {ergebnis.monatlicheDifferenz > 0 ? 'PKV teurer' : 
               ergebnis.monatlicheDifferenz < 0 ? 'GKV teurer' : ''}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Jährliche Differenz</p>
            <p className={`text-2xl font-bold ${
              ergebnis.jaehrlicheDifferenz > 0 ? 'text-green-600' : 
              ergebnis.jaehrlicheDifferenz < 0 ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {ergebnis.jaehrlicheDifferenz > 0 ? '+' : ''}{formatEuro(Math.abs(ergebnis.jaehrlicheDifferenz))}
            </p>
            <p className="text-xs text-gray-500">pro Jahr</p>
          </div>
        </div>
      </div>
      
      {/* Empfehlung */}
      <div className={`rounded-2xl shadow-lg p-6 ${
        ergebnis.empfehlung === 'gkv' ? 'bg-green-100 border-2 border-green-300' :
        ergebnis.empfehlung === 'pkv' ? 'bg-blue-100 border-2 border-blue-300' :
        'bg-yellow-100 border-2 border-yellow-300'
      }`}>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-2xl">
            {ergebnis.empfehlung === 'gkv' ? '🏥' : 
             ergebnis.empfehlung === 'pkv' ? '🏛️' : '⚖️'}
          </span>
          Tendenz: {ergebnis.empfehlung === 'gkv' ? 'GKV empfohlen' : 
                    ergebnis.empfehlung === 'pkv' ? 'PKV kann interessant sein' : 
                    'Individuelle Abwägung nötig'}
        </h3>
        
        <ul className="space-y-2">
          {ergebnis.empfehlungGruende.map((grund, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-lg">•</span>
              <span>{grund}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Langfristvergleich Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📊 Langfristvergleich ({betrachtungszeitraum} Jahre)
        </h3>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Jahr</th>
              <th className="p-2 text-left">Alter</th>
              <th className="p-2 text-right text-green-700">GKV/Jahr</th>
              <th className="p-2 text-right text-blue-700">PKV/Jahr</th>
              <th className="p-2 text-right">Differenz</th>
              <th className="p-2 text-right">Kumuliert</th>
            </tr>
          </thead>
          <tbody>
            {ergebnis.langfristVergleich
              .filter((_, idx) => idx === 0 || idx % 5 === 0 || idx === betrachtungszeitraum)
              .map((row) => (
                <tr key={row.jahr} className={row.alter >= 67 ? 'bg-amber-50' : ''}>
                  <td className="p-2 border-t">{row.jahr}</td>
                  <td className="p-2 border-t">
                    {row.alter}
                    {row.alter >= 67 && <span className="text-xs text-amber-600 ml-1">(Rente)</span>}
                  </td>
                  <td className="p-2 border-t text-right text-green-700">{formatEuro(row.gkvJahresbeitrag)}</td>
                  <td className="p-2 border-t text-right text-blue-700">{formatEuro(row.pkvJahresbeitrag)}</td>
                  <td className={`p-2 border-t text-right font-medium ${
                    row.differenz > 0 ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {row.differenz > 0 ? '+' : ''}{formatEuro(row.differenz)}
                  </td>
                  <td className={`p-2 border-t text-right ${
                    row.kumulierteDifferenz > 0 ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {row.kumulierteDifferenz > 0 ? '+' : ''}{formatEuro(row.kumulierteDifferenz)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Gesamtdifferenz über {betrachtungszeitraum} Jahre:</strong>{' '}
            <span className={`font-bold ${
              ergebnis.langfristVergleich[betrachtungszeitraum]?.kumulierteDifferenz > 0 
                ? 'text-green-600' : 'text-blue-600'
            }`}>
              {formatEuro(Math.abs(ergebnis.langfristVergleich[betrachtungszeitraum]?.kumulierteDifferenz || 0))}
            </span>
            {' '}
            {ergebnis.langfristVergleich[betrachtungszeitraum]?.kumulierteDifferenz > 0 
              ? 'mehr für PKV' : 'mehr für GKV'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            * Annahmen: 2% jährl. Gehaltssteigerung, {PKV_RICHTWERTE.jaehrlicheSteigerung}% PKV-Beitragssteigerung, 
            Rente ab 67 mit 48% des letzten Einkommens
          </p>
        </div>
      </div>
      
      {/* Vor- und Nachteile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GKV Vorteile */}
        <div className="bg-green-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">✅ Vorteile GKV</h3>
          <ul className="space-y-2 text-sm text-green-900">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Familienversicherung:</strong> Partner & Kinder kostenlos mitversichert</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Einkommensabhängig:</strong> Beitrag sinkt bei weniger Einkommen (z.B. Rente)</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Keine Gesundheitsprüfung:</strong> Aufnahme ohne Risikozuschläge</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Einfacher Kassenwechsel:</strong> Jederzeit möglich</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Solidarprinzip:</strong> Alle zahlen nach Leistungsfähigkeit</span>
            </li>
          </ul>
        </div>
        
        {/* PKV Vorteile */}
        <div className="bg-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">✅ Vorteile PKV</h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Bessere Leistungen:</strong> Chefarzt, Einzelzimmer, schnellere Termine</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Individuelle Tarife:</strong> Leistungen selbst wählen</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Altersrückstellungen:</strong> Beiträge im Alter stabilisiert</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Beitragsrückerstattung:</strong> Bei Nichtinanspruchnahme</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Für Beamte:</strong> Mit Beihilfe sehr günstig</span>
            </li>
          </ul>
        </div>
        
        {/* GKV Nachteile */}
        <div className="bg-red-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">❌ Nachteile GKV</h3>
          <ul className="space-y-2 text-sm text-red-900">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Einheitstarif:</strong> Keine individuellen Leistungspakete</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Wartezeiten:</strong> Längere Wartezeit auf Facharzttermine</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Beitrag steigt mit Einkommen:</strong> Bis zur BBG</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Zuzahlungen:</strong> Bei Medikamenten und Hilfsmitteln</span>
            </li>
          </ul>
        </div>
        
        {/* PKV Nachteile */}
        <div className="bg-red-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">❌ Nachteile PKV</h3>
          <ul className="space-y-2 text-sm text-red-900">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Keine Familienversicherung:</strong> Jedes Familienmitglied zahlt</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Gesundheitsprüfung:</strong> Vorerkrankungen führen zu Zuschlägen</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Rückkehr schwer:</strong> Ab 55 kaum möglich zurück in GKV</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Beitrag im Alter:</strong> Kann trotz Rückstellungen steigen</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span><strong>Vorleistung:</strong> Rechnungen selbst bezahlen, dann einreichen</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Zugangsvoraussetzungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔑 Wer kann in die PKV?</h3>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${ergebnis.kannInPKV ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <h4 className="font-semibold mb-2">Angestellte</h4>
            <p className="text-sm text-gray-700">
              Einkommen über der <strong>Versicherungspflichtgrenze</strong> von {formatEuro(SOZIALVERSICHERUNG_2026.versicherungspflichtgrenze.monat)}/Monat 
              ({formatEuro(SOZIALVERSICHERUNG_2026.versicherungspflichtgrenze.jahr)}/Jahr)
            </p>
            {versichertengruppe === 'angestellt' && (
              <p className={`text-sm font-medium mt-2 ${ergebnis.kannInPKV ? 'text-green-600' : 'text-red-600'}`}>
                {ergebnis.kannInPKV 
                  ? '✓ Sie erfüllen diese Voraussetzung' 
                  : '✗ Ihr Einkommen liegt unter der Grenze'}
              </p>
            )}
          </div>
          
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h4 className="font-semibold mb-2">Selbstständige</h4>
            <p className="text-sm text-gray-700">
              Können <strong>unabhängig vom Einkommen</strong> frei zwischen GKV und PKV wählen.
              Bei Existenzgründung aus Anstellung: 3 Monate Zeit für Entscheidung.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <h4 className="font-semibold mb-2">Beamte</h4>
            <p className="text-sm text-gray-700">
              Erhalten <strong>Beihilfe</strong> (50-80% Kostenerstattung) vom Dienstherrn.
              PKV nur für den Restanteil → sehr günstige Beiträge.
            </p>
          </div>
        </div>
      </div>
      
      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>
              <strong>Entscheidung sorgfältig treffen:</strong> Ein Wechsel zurück in die GKV ist ab 55 Jahren 
              praktisch nicht mehr möglich.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>
              <strong>PKV-Beiträge sind Schätzwerte:</strong> Die tatsächlichen Beiträge hängen von 
              Gesundheitszustand, gewähltem Tarif und Anbieter ab.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>
              <strong>Beitragsentwicklung:</strong> PKV-Beiträge steigen durchschnittlich 3-4% pro Jahr. 
              Die Altersrückstellungen federn dies nur teilweise ab.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>
              <strong>Familiengründung bedenken:</strong> In der PKV muss jedes Familienmitglied 
              einzeln versichert werden – erhebliche Mehrkosten!
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>
              <strong>Individuelle Beratung:</strong> Lassen Sie sich vor dem Wechsel unabhängig beraten 
              (Verbraucherzentrale, Versicherungsberater).
            </span>
          </li>
        </ul>
      </div>
      
      {/* Behörden & Links */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">🏛️ Weiterführende Informationen</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-blue-900">Bundesgesundheitsministerium</p>
            <a 
              href="https://www.bundesgesundheitsministerium.de/krankenversicherung.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              → Informationen zur Krankenversicherung
            </a>
          </div>
          <div>
            <p className="font-medium text-blue-900">Verbraucherzentrale</p>
            <a 
              href="https://www.verbraucherzentrale.de/wissen/geld-versicherungen/krankenversicherung" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              → Unabhängige Beratung zu Krankenversicherungen
            </a>
          </div>
          <div>
            <p className="font-medium text-blue-900">PKV-Verband</p>
            <a 
              href="https://www.pkv.de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              → Informationen zur privaten Krankenversicherung
            </a>
          </div>
          <div>
            <p className="font-medium text-blue-900">GKV-Spitzenverband</p>
            <a 
              href="https://www.gkv-spitzenverband.de" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              → Übersicht aller gesetzlichen Krankenkassen
            </a>
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
          </li>
          <li>
            <a 
              href="https://www.gesetze-im-internet.de/vag/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              VAG – Versicherungsaufsichtsgesetz (PKV)
            </a>
          </li>
          <li>
            <a 
              href="https://www.bundesgesundheitsministerium.de/beitraege.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              BMG – Beitragssätze und Rechengrößen 2026
            </a>
          </li>
          <li>
            <a 
              href="https://www.pkv.de/verband/zahlen-und-fakten/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              PKV-Verband – Zahlen und Fakten
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-400 mt-4">
          Stand: Februar 2026 · Alle Angaben ohne Gewähr · PKV-Beiträge sind Richtwerte
        </p>
      </div>
    </div>
  );
}
