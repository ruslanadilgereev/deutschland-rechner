import { useState, useMemo } from 'react';

// Einkommensteuer 2026 – nach §32a EStG
// Grundfreibetrag: 12.348 € (kalte Progression angepasst)
const GRUNDFREIBETRAG_2026 = 12348;

// Steuertarif 2026 Zonen
const TARIFZONEN_2026 = {
  zone1Ende: 17799,   // Ende Zone 1 (14-24%)
  zone2Ende: 69878,   // Ende Zone 2 (24-42%)
  zone3Ende: 277825,  // Ende Zone 3 (42%)
  // darüber: 45% Reichensteuer
};

// Pauschbeträge und Freibeträge 2026
const PAUSCHBETRAEGE = {
  werbungskosten: 1230,           // Arbeitnehmer-Pauschbetrag
  sonderausgaben: 36,             // Sonderausgaben-Pauschbetrag
  sparer: 1000,                   // Sparerpauschbetrag (single)
  sparerVerheiratet: 2000,        // Sparerpauschbetrag (verheiratet)
  behinderung: {
    20: 384, 30: 620, 40: 860, 50: 1140, 60: 1440, 70: 1780, 
    80: 2120, 90: 2460, 100: 2840,
    hilflos: 7400, // GdB 100 + Merkzeichen H, Bl, TBl
  },
  entfernungspauschale: {
    bis20km: 0.30,
    ab21km: 0.38,
  },
  homeoffice: 6,                  // pro Tag, max 1260 €/Jahr (210 Tage)
  homeofficeMax: 1260,
};

// Veranlagungsarten
const VERANLAGUNGSARTEN = [
  { wert: 'single', label: 'Einzelveranlagung', faktor: 1 },
  { wert: 'zusammen', label: 'Zusammenveranlagung (verheiratet)', faktor: 2 },
];

// Berechnung Einkommensteuer nach §32a EStG 2026
function berechneEinkommensteuer(zvE: number, verheiratet: boolean): number {
  // Splittingverfahren: zvE halbieren, Steuer berechnen, verdoppeln
  const faktor = verheiratet ? 2 : 1;
  const zvEHalb = zvE / faktor;
  
  if (zvEHalb <= 0) return 0;
  
  let steuer = 0;
  
  if (zvEHalb <= GRUNDFREIBETRAG_2026) {
    steuer = 0;
  } else if (zvEHalb <= TARIFZONEN_2026.zone1Ende) {
    // Zone 1: 14-24% progressiv
    const y = (zvEHalb - GRUNDFREIBETRAG_2026) / 10000;
    steuer = (933.52 * y + 1400) * y;
  } else if (zvEHalb <= TARIFZONEN_2026.zone2Ende) {
    // Zone 2: 24-42% progressiv
    const z = (zvEHalb - TARIFZONEN_2026.zone1Ende) / 10000;
    steuer = (176.64 * z + 2397) * z + 1015.13;
  } else if (zvEHalb <= TARIFZONEN_2026.zone3Ende) {
    // Zone 3: 42% Spitzensteuersatz
    steuer = 0.42 * zvEHalb - 10911.92;
  } else {
    // Zone 4: 45% Reichensteuer
    steuer = 0.45 * zvEHalb - 18918.79;
  }
  
  return Math.round(steuer * faktor);
}

// Durchschnittssteuersatz
function berechneDurchschnittssteuersatz(steuer: number, zvE: number): number {
  if (zvE <= 0) return 0;
  return (steuer / zvE) * 100;
}

// Grenzsteuersatz ermitteln
function berechneGrenzsteuersatz(zvE: number, verheiratet: boolean): number {
  const faktor = verheiratet ? 2 : 1;
  const zvEHalb = zvE / faktor;
  
  if (zvEHalb <= GRUNDFREIBETRAG_2026) return 0;
  if (zvEHalb <= TARIFZONEN_2026.zone1Ende) {
    const y = (zvEHalb - GRUNDFREIBETRAG_2026) / 10000;
    return Math.min(24, 14 + (2 * 933.52 * y + 1400) / 100);
  }
  if (zvEHalb <= TARIFZONEN_2026.zone2Ende) {
    const z = (zvEHalb - TARIFZONEN_2026.zone1Ende) / 10000;
    return Math.min(42, 24 + (2 * 176.64 * z + 2397) / 100);
  }
  if (zvEHalb <= TARIFZONEN_2026.zone3Ende) return 42;
  return 45;
}

// Solidaritätszuschlag (stark reduziert seit 2021)
function berechneSoli(einkommensteuer: number, verheiratet: boolean): number {
  const freigrenze = verheiratet ? 36260 : 18130;
  const milderungszone = verheiratet ? 66126 : 33063;
  
  if (einkommensteuer <= freigrenze) return 0;
  if (einkommensteuer <= milderungszone) {
    return Math.round(Math.min(0.055 * einkommensteuer, 0.119 * (einkommensteuer - freigrenze)));
  }
  return Math.round(einkommensteuer * 0.055);
}

// Kirchensteuer
function berechneKirchensteuer(einkommensteuer: number, satz: number): number {
  return Math.round(einkommensteuer * satz);
}

export default function EinkommensteuerRechner() {
  // Einkünfte
  const [bruttoArbeit, setBruttoArbeit] = useState(55000);
  const [kapitalertraege, setKapitalertraege] = useState(0);
  const [vermietung, setVermietung] = useState(0);
  const [selbststaendig, setSelbststaendig] = useState(0);
  const [sonstige, setSonstige] = useState(0);
  
  // Abzüge
  const [werbungskosten, setWerbungskosten] = useState(0);
  const [pendlerKm, setPendlerKm] = useState(0);
  const [pendlerTage, setPendlerTage] = useState(220);
  const [homeofficeTage, setHomeofficeTage] = useState(0);
  const [sonderausgaben, setSonderausgaben] = useState(0);
  const [vorsorge, setVorsorge] = useState(0);
  const [spenden, setSpenden] = useState(0);
  const [aussergewoehnlich, setAussergewoehnlich] = useState(0);
  
  // Persönliche Situation
  const [veranlagung, setVeranlagung] = useState<'single' | 'zusammen'>('single');
  const [kirchensteuerSatz, setKirchensteuerSatz] = useState(0);
  const [kinderfreibetraege, setKinderfreibetraege] = useState(0);
  const [behinderungsgrad, setBehinderungsgrad] = useState(0);

  const ergebnis = useMemo(() => {
    const verheiratet = veranlagung === 'zusammen';
    
    // 1. Summe der Einkünfte
    const einkuenfteGesamt = bruttoArbeit + kapitalertraege + vermietung + selbststaendig + sonstige;
    
    // 2. Werbungskosten berechnen
    // Pendlerpauschale
    let pendlerpauschale = 0;
    if (pendlerKm > 0 && pendlerTage > 0) {
      const km20 = Math.min(pendlerKm, 20);
      const kmUeber20 = Math.max(0, pendlerKm - 20);
      pendlerpauschale = ((km20 * PAUSCHBETRAEGE.entfernungspauschale.bis20km) + 
                         (kmUeber20 * PAUSCHBETRAEGE.entfernungspauschale.ab21km)) * pendlerTage;
    }
    
    // Homeoffice-Pauschale
    const homeoffice = Math.min(homeofficeTage * PAUSCHBETRAEGE.homeoffice, PAUSCHBETRAEGE.homeofficeMax);
    
    // Werbungskosten: größer aus Pauschale oder tatsächlich
    const werbungskostenEffektiv = Math.max(
      PAUSCHBETRAEGE.werbungskosten,
      werbungskosten + pendlerpauschale + homeoffice
    );
    
    // 3. Sonderausgaben
    const sonderausgabenEffektiv = Math.max(
      PAUSCHBETRAEGE.sonderausgaben,
      sonderausgaben + vorsorge + spenden
    );
    
    // 4. Behinderten-Pauschbetrag
    let behinderungsPauschbetrag = 0;
    if (behinderungsgrad >= 20) {
      behinderungsPauschbetrag = PAUSCHBETRAEGE.behinderung[behinderungsgrad as keyof typeof PAUSCHBETRAEGE.behinderung] || 0;
    }
    
    // 5. Kinderfreibeträge (nur relevant für Vergleichsrechnung)
    // 2026: 6.672 € Kinderfreibetrag + 2.928 € BEA = 9.600 € pro Kind
    const kinderfreibetragWert = kinderfreibetraege * 9600;
    
    // 6. Zu versteuerndes Einkommen (zvE)
    const abzuegeGesamt = werbungskostenEffektiv + sonderausgabenEffektiv + 
                          aussergewoehnlich + behinderungsPauschbetrag;
    
    // Ohne Kinderfreibetrag (für Günstigerprüfung)
    const zvEOhneKinder = Math.max(0, einkuenfteGesamt - abzuegeGesamt);
    
    // Mit Kinderfreibetrag
    const zvE = Math.max(0, einkuenfteGesamt - abzuegeGesamt - kinderfreibetragWert);
    
    // 7. Einkommensteuer berechnen
    const einkommensteuerOhneKinder = berechneEinkommensteuer(zvEOhneKinder, verheiratet);
    const einkommensteuerMitKinder = berechneEinkommensteuer(zvE, verheiratet);
    
    // Günstigerprüfung: Kindergeld vs. Kinderfreibetrag
    // Kindergeld 2026: 255 € pro Kind pro Monat = 3.060 € pro Jahr
    const kindergeldJahr = kinderfreibetraege * 3060;
    const steuerersparnisKinderfreibetrag = einkommensteuerOhneKinder - einkommensteuerMitKinder;
    const kinderfreibetragGuenstiger = steuerersparnisKinderfreibetrag > kindergeldJahr;
    
    // Finale Steuer (Günstigerprüfung berücksichtigt)
    const einkommensteuer = kinderfreibetragGuenstiger ? einkommensteuerMitKinder : einkommensteuerOhneKinder;
    const finalZvE = kinderfreibetragGuenstiger ? zvE : zvEOhneKinder;
    
    // 8. Soli und Kirchensteuer
    const soli = berechneSoli(einkommensteuer, verheiratet);
    const kirchensteuer = berechneKirchensteuer(einkommensteuer, kirchensteuerSatz);
    
    // 9. Gesamtsteuer
    const steuerGesamt = einkommensteuer + soli + kirchensteuer;
    
    // 10. Steuersätze
    const durchschnittssteuersatz = berechneDurchschnittssteuersatz(einkommensteuer, finalZvE);
    const grenzsteuersatz = berechneGrenzsteuersatz(finalZvE, verheiratet);
    
    // Effektiver Steuersatz (auf Gesamteinkünfte)
    const effektiverSteuersatz = einkuenfteGesamt > 0 ? (steuerGesamt / einkuenfteGesamt) * 100 : 0;
    
    return {
      // Einkünfte
      einkuenfteGesamt,
      
      // Abzüge
      werbungskostenEffektiv,
      pendlerpauschale: Math.round(pendlerpauschale),
      homeoffice,
      sonderausgabenEffektiv,
      behinderungsPauschbetrag,
      abzuegeGesamt,
      
      // Kinderfreibetrag
      kinderfreibetragWert,
      kindergeldJahr,
      steuerersparnisKinderfreibetrag,
      kinderfreibetragGuenstiger,
      
      // zvE
      zvE: finalZvE,
      
      // Steuern
      einkommensteuer,
      soli,
      kirchensteuer,
      steuerGesamt,
      
      // Steuersätze
      durchschnittssteuersatz,
      grenzsteuersatz,
      effektiverSteuersatz,
      
      // Netto
      nachSteuern: einkuenfteGesamt - steuerGesamt,
      monatlichNachSteuern: Math.round((einkuenfteGesamt - steuerGesamt) / 12),
    };
  }, [
    bruttoArbeit, kapitalertraege, vermietung, selbststaendig, sonstige,
    werbungskosten, pendlerKm, pendlerTage, homeofficeTage,
    sonderausgaben, vorsorge, spenden, aussergewoehnlich,
    veranlagung, kirchensteuerSatz, kinderfreibetraege, behinderungsgrad
  ]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const formatProzent = (n: number) => n.toFixed(1).replace('.', ',') + ' %';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Einkünfte */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💰</span> Einkünfte (Jahresbetrag)
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bruttoarbeitslohn (vor SV-Abzügen)
            </label>
            <div className="relative">
              <input
                type="number"
                value={bruttoArbeit}
                onChange={(e) => setBruttoArbeit(Math.max(0, Number(e.target.value)))}
                className="w-full text-xl font-bold py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                min="0"
                step="1000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="1000"
              value={bruttoArbeit}
              onChange={(e) => setBruttoArbeit(Number(e.target.value))}
              className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kapitalerträge
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={kapitalertraege}
                  onChange={(e) => setKapitalertraege(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vermietung & Verpachtung
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={vermietung}
                  onChange={(e) => setVermietung(Number(e.target.value))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Negative Werte = Verlust</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selbstständige Tätigkeit
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={selbststaendig}
                  onChange={(e) => setSelbststaendig(Number(e.target.value))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sonstige Einkünfte
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={sonstige}
                  onChange={(e) => setSonstige(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persönliche Situation */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">👤</span> Persönliche Situation
        </h3>
        
        <div className="space-y-4">
          {/* Veranlagung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Veranlagungsart</label>
            <div className="grid grid-cols-2 gap-3">
              {VERANLAGUNGSARTEN.map((v) => (
                <button
                  key={v.wert}
                  onClick={() => setVeranlagung(v.wert as 'single' | 'zusammen')}
                  className={`py-3 px-4 rounded-xl font-medium transition-all ${
                    veranlagung === v.wert
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kinder (für Günstigerprüfung)
              </label>
              <select
                value={kinderfreibetraege}
                onChange={(e) => setKinderfreibetraege(Number(e.target.value))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              >
                {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Kind' : 'Kinder'}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kirchensteuer
              </label>
              <select
                value={kirchensteuerSatz}
                onChange={(e) => setKirchensteuerSatz(Number(e.target.value))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              >
                <option value={0}>Keine</option>
                <option value={0.08}>8% (BY, BW)</option>
                <option value={0.09}>9% (restliche Bundesländer)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grad der Behinderung (GdB)
              </label>
              <select
                value={behinderungsgrad}
                onChange={(e) => setBehinderungsgrad(Number(e.target.value))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              >
                <option value={0}>Keine</option>
                {[20, 30, 40, 50, 60, 70, 80, 90, 100].map(n => (
                  <option key={n} value={n}>{n}%</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Werbungskosten */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span> Werbungskosten
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Pauschbetrag: {formatEuro(PAUSCHBETRAEGE.werbungskosten)} – wird automatisch angesetzt wenn günstiger
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entfernung Wohnung-Arbeit
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={pendlerKm}
                  onChange={(e) => setPendlerKm(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">km</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arbeitstage/Jahr
              </label>
              <input
                type="number"
                value={pendlerTage}
                onChange={(e) => setPendlerTage(Math.min(365, Math.max(0, Number(e.target.value))))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                min="0"
                max="365"
              />
            </div>
          </div>
          
          {pendlerKm > 0 && (
            <p className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
              📍 Pendlerpauschale: {formatEuro(ergebnis.pendlerpauschale)}
              {pendlerKm > 20 && <span className="block text-xs mt-1">Ab 21 km: 0,38 €/km (erhöht)</span>}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Homeoffice-Tage/Jahr
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={homeofficeTage}
                  onChange={(e) => setHomeofficeTage(Math.min(210, Math.max(0, Number(e.target.value))))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                  max="210"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Max. 210 Tage à 6 €</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weitere Werbungskosten
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={werbungskosten}
                  onChange={(e) => setWerbungskosten(Math.max(0, Number(e.target.value)))}
                  className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sonderausgaben & Außergewöhnliche Belastungen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🧾</span> Sonderausgaben & Abzüge
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vorsorgeaufwendungen
            </label>
            <div className="relative">
              <input
                type="number"
                value={vorsorge}
                onChange={(e) => setVorsorge(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Riester, Rürup, etc.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spenden
            </label>
            <div className="relative">
              <input
                type="number"
                value={spenden}
                onChange={(e) => setSpenden(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sonstige Sonderausgaben
            </label>
            <div className="relative">
              <input
                type="number"
                value={sonderausgaben}
                onChange={(e) => setSonderausgaben(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Außergewöhnliche Belastungen
            </label>
            <div className="relative">
              <input
                type="number"
                value={aussergewoehnlich}
                onChange={(e) => setAussergewoehnlich(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Krankheitskosten, Pflege, etc.</p>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium text-blue-200 mb-1">Einkommensteuer 2026</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{formatEuro(ergebnis.steuerGesamt)}</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">Gesamtsteuerlast inkl. Soli & Kirchensteuer</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-blue-200 text-xs block">Grenzsteuersatz</span>
            <span className="text-xl font-bold">{formatProzent(ergebnis.grenzsteuersatz)}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-blue-200 text-xs block">Durchschnitt</span>
            <span className="text-xl font-bold">{formatProzent(ergebnis.durchschnittssteuersatz)}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-blue-200 text-xs block">Effektiv</span>
            <span className="text-xl font-bold">{formatProzent(ergebnis.effektiverSteuersatz)}</span>
          </div>
        </div>
      </div>

      {/* Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnung im Detail</h3>
        
        <div className="space-y-4">
          {/* Einkünfte */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">Summe der Einkünfte</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.einkuenfteGesamt)}</span>
          </div>

          {/* Abzüge */}
          <div>
            <div className="flex justify-between items-center text-orange-600 font-medium mb-2">
              <span>Abzüge gesamt</span>
              <span>− {formatEuro(ergebnis.abzuegeGesamt)}</span>
            </div>
            <div className="pl-4 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Werbungskosten</span>
                <span>− {formatEuro(ergebnis.werbungskostenEffektiv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sonderausgaben</span>
                <span>− {formatEuro(ergebnis.sonderausgabenEffektiv)}</span>
              </div>
              {aussergewoehnlich > 0 && (
                <div className="flex justify-between">
                  <span>Außergewöhnliche Belastungen</span>
                  <span>− {formatEuro(aussergewoehnlich)}</span>
                </div>
              )}
              {ergebnis.behinderungsPauschbetrag > 0 && (
                <div className="flex justify-between">
                  <span>Behinderten-Pauschbetrag</span>
                  <span>− {formatEuro(ergebnis.behinderungsPauschbetrag)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Kinderfreibetrag */}
          {kinderfreibetraege > 0 && (
            <div className={`p-3 rounded-xl ${ergebnis.kinderfreibetragGuenstiger ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="text-sm">
                <p className="font-medium text-gray-700 mb-1">👶 Günstigerprüfung Kinder:</p>
                <div className="flex justify-between">
                  <span>Kindergeld (wird ausgezahlt)</span>
                  <span>{formatEuro(ergebnis.kindergeldJahr)}/Jahr</span>
                </div>
                <div className="flex justify-between">
                  <span>Steuerersparnis Kinderfreibetrag</span>
                  <span>{formatEuro(ergebnis.steuerersparnisKinderfreibetrag)}</span>
                </div>
                <p className="mt-2 font-medium text-green-700">
                  {ergebnis.kinderfreibetragGuenstiger 
                    ? '✓ Kinderfreibetrag ist günstiger – wird angerechnet'
                    : '✓ Kindergeld ist günstiger – keine Verrechnung'}
                </p>
              </div>
            </div>
          )}

          {/* zvE */}
          <div className="flex justify-between items-center py-2 border-b border-gray-200 bg-gray-50 -mx-6 px-6">
            <span className="font-bold text-gray-800">Zu versteuerndes Einkommen (zvE)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.zvE)}</span>
          </div>

          {/* Steuern */}
          <div>
            <div className="flex justify-between items-center text-red-600 font-medium mb-2">
              <span>Steuern</span>
              <span>{formatEuro(ergebnis.steuerGesamt)}</span>
            </div>
            <div className="pl-4 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Einkommensteuer</span>
                <span>{formatEuro(ergebnis.einkommensteuer)}</span>
              </div>
              {ergebnis.soli > 0 && (
                <div className="flex justify-between">
                  <span>Solidaritätszuschlag</span>
                  <span>{formatEuro(ergebnis.soli)}</span>
                </div>
              )}
              {ergebnis.kirchensteuer > 0 && (
                <div className="flex justify-between">
                  <span>Kirchensteuer</span>
                  <span>{formatEuro(ergebnis.kirchensteuer)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ergebnis */}
          <div className="flex justify-between items-center py-3 border-t-2 border-green-200 bg-green-50 -mx-6 px-6 rounded-b-2xl">
            <div>
              <span className="font-bold text-green-800 text-lg">Nach Steuern</span>
              <span className="text-green-600 text-sm block">(vor Sozialversicherung)</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-green-600 text-xl block">{formatEuro(ergebnis.nachSteuern)}</span>
              <span className="text-green-500 text-sm">{formatEuro(ergebnis.monatlichNachSteuern)}/Monat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Grundfreibetrag 2026: {formatEuro(GRUNDFREIBETRAG_2026)}</strong> (steuerfrei)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Splittingtarif</strong> bei Zusammenveranlagung (Ehegattensplitting)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Günstigerprüfung</strong>: Kindergeld vs. Kinderfreibetrag automatisch</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Kinderfreibetrag 2026: <strong>9.600 €/Kind</strong> (6.672 € + 2.928 € BEA)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Soli</strong> nur noch bei hohen Einkommen (Freigrenze: {formatEuro(veranlagung === 'zusammen' ? 36260 : 18130)})</span>
          </li>
          <li className="flex gap-2">
            <span>⚠️</span>
            <span>Diese Berechnung dient der <strong>Orientierung</strong> – für die Steuererklärung nutzen Sie ELSTER</span>
          </li>
        </ul>
      </div>

      {/* Zuständige Behörden */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörden & Hotlines</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Finanzamt</p>
              <p className="text-gray-500">Einkommensteuererklärung</p>
              <a 
                href="https://www.elster.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ELSTER Online →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">📞</span>
            <div>
              <p className="font-medium text-gray-800">Bürgertelefon BMF</p>
              <p className="text-gray-500">Allgemeine Steuerfragen</p>
              <a 
                href="tel:03018-333-0"
                className="text-blue-600 hover:underline"
              >
                030 18 333-0 →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">⚖️</span>
            <div>
              <p className="font-medium text-gray-800">Lohnsteuerhilfeverein</p>
              <p className="text-gray-500">Beratung für Arbeitnehmer</p>
              <a 
                href="https://www.lohnsteuerhilfe.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                lohnsteuerhilfe.net →
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-xl">🧮</span>
            <div>
              <p className="font-medium text-gray-800">Steuerberater</p>
              <p className="text-gray-500">Komplexe Sachverhalte</p>
              <a 
                href="https://www.bstbk.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Steuerberaterkammer →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen (Stand: 2026)</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__32a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §32a EStG – Einkommensteuertarif
          </a>
          <a 
            href="https://www.bmf-steuerrechner.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF – Offizieller Steuerrechner
          </a>
          <a 
            href="https://www.bundesfinanzministerium.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesministerium der Finanzen – Steuern
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/estg/__33.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            §33 EStG – Außergewöhnliche Belastungen
          </a>
        </div>
      </div>
    </div>
  );
}
