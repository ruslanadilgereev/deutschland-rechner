import { useState, useMemo } from 'react';

// 2025 Einkommensteuer-Tarif (§32a EStG)
const GRUNDFREIBETRAG_2025 = 12096;

// Einkommensteuer nach Tarif 2025 berechnen
function berechneEinkommensteuer(zvE: number): number {
  if (zvE <= GRUNDFREIBETRAG_2025) return 0;
  
  if (zvE <= 17005) {
    const y = (zvE - GRUNDFREIBETRAG_2025) / 10000;
    return Math.floor((932.30 * y + 1400) * y);
  }
  
  if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000;
    return Math.floor((176.64 * z + 2397) * z + 1025.38);
  }
  
  if (zvE <= 277825) {
    return Math.floor(0.42 * zvE - 10636.31);
  }
  
  return Math.floor(0.45 * zvE - 18971.94);
}

// Solidaritätszuschlag berechnen (mit Freigrenzen)
function berechneSoli(einkommensteuer: number): number {
  const freigrenze = 18130; // 2025 Freigrenze
  if (einkommensteuer <= freigrenze) return 0;
  
  // Milderungszone bis ca. 33.000€ Steuer
  const vollSoli = einkommensteuer * 0.055;
  const milderung = (einkommensteuer - freigrenze) * 0.119;
  return Math.min(vollSoli, milderung);
}

// Bundesländer mit Kirchensteuer-Sätzen
const BUNDESLAENDER = [
  { id: 'bw', name: 'Baden-Württemberg', kirchensteuerSatz: 8 },
  { id: 'by', name: 'Bayern', kirchensteuerSatz: 8 },
  { id: 'be', name: 'Berlin', kirchensteuerSatz: 9 },
  { id: 'bb', name: 'Brandenburg', kirchensteuerSatz: 9 },
  { id: 'hb', name: 'Bremen', kirchensteuerSatz: 9 },
  { id: 'hh', name: 'Hamburg', kirchensteuerSatz: 9 },
  { id: 'he', name: 'Hessen', kirchensteuerSatz: 9 },
  { id: 'mv', name: 'Mecklenburg-Vorpommern', kirchensteuerSatz: 9 },
  { id: 'ni', name: 'Niedersachsen', kirchensteuerSatz: 9 },
  { id: 'nw', name: 'Nordrhein-Westfalen', kirchensteuerSatz: 9 },
  { id: 'rp', name: 'Rheinland-Pfalz', kirchensteuerSatz: 9 },
  { id: 'sl', name: 'Saarland', kirchensteuerSatz: 9 },
  { id: 'sn', name: 'Sachsen', kirchensteuerSatz: 9 },
  { id: 'st', name: 'Sachsen-Anhalt', kirchensteuerSatz: 9 },
  { id: 'sh', name: 'Schleswig-Holstein', kirchensteuerSatz: 9 },
  { id: 'th', name: 'Thüringen', kirchensteuerSatz: 9 },
];

export default function AbfindungsRechner() {
  // Eingabewerte
  const [bruttoMonatsgehalt, setBruttoMonatsgehalt] = useState(4000);
  const [beschaeftigungsjahre, setBeschaeftigungsjahre] = useState(10);
  const [alterBeiAustritt, setAlterBeiAustritt] = useState(45);
  const [abfindungsBerechnungsart, setAbfindungsBerechnungsart] = useState<'faktor' | 'betrag'>('faktor');
  const [abfindungsFaktor, setAbfindungsFaktor] = useState(0.5);
  const [abfindungsBetrag, setAbfindungsBetrag] = useState(20000);
  
  // Steuerberechnung
  const [jahresbrutto, setJahresbrutto] = useState(48000);
  const [steuerklasse, setSteuerklasse] = useState(1);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [bundesland, setBundesland] = useState('nw');
  const [kinderfreibetraege, setKinderfreibetraege] = useState(0);
  
  // Berechnungsergebnis
  const ergebnis = useMemo(() => {
    // === Abfindungshöhe berechnen ===
    const regelabfindung = bruttoMonatsgehalt * beschaeftigungsjahre * 0.5; // Standard: 0,5 Gehälter pro Jahr
    
    let abfindung: number;
    if (abfindungsBerechnungsart === 'faktor') {
      abfindung = bruttoMonatsgehalt * beschaeftigungsjahre * abfindungsFaktor;
    } else {
      abfindung = abfindungsBetrag;
    }
    
    // Erhöhte Abfindung bei älteren Arbeitnehmern (§ 1a KSchG)
    const erhoehterAnspruch = alterBeiAustritt >= 50 && beschaeftigungsjahre >= 15;
    const maxRegelabfindung = erhoehterAnspruch 
      ? bruttoMonatsgehalt * 18 // Max 18 Monatsgehälter bei 50+ und 15+ Jahre
      : bruttoMonatsgehalt * 12; // Standard max 12 Monatsgehälter
    
    // === Fünftelregelung berechnen (§ 34 EStG) ===
    // zvE = zu versteuerndes Einkommen (vereinfacht: Jahresbrutto - Werbungskosten)
    const werbungskostenpauschale = 1230; // 2025
    const zvE = jahresbrutto - werbungskostenpauschale;
    
    // Kinderfreibeträge pro Kind: 6.612€ (Kind) + 2.928€ (Betreuung) = 9.540€ für 2025
    const kinderfreibetragGesamt = kinderfreibetraege * 9540 / 2; // Hälfte für einen Elternteil
    const zvENachKinderfreibetrag = Math.max(0, zvE - kinderfreibetragGesamt);
    
    // 1. Steuer OHNE Abfindung
    const steuerOhneAbfindung = berechneEinkommensteuer(zvENachKinderfreibetrag);
    
    // 2. Steuer MIT 1/5 der Abfindung
    const zvEMitEinFuenftel = zvENachKinderfreibetrag + (abfindung / 5);
    const steuerMitEinFuenftel = berechneEinkommensteuer(zvEMitEinFuenftel);
    
    // 3. Differenz × 5 = Steuer auf Abfindung (Fünftelregelung)
    const mehrsteuerProFuenftel = steuerMitEinFuenftel - steuerOhneAbfindung;
    const steuerAufAbfindungFuenftel = mehrsteuerProFuenftel * 5;
    
    // 4. Normale Besteuerung (zum Vergleich)
    const zvEMitVollerAbfindung = zvENachKinderfreibetrag + abfindung;
    const steuerMitVollerAbfindung = berechneEinkommensteuer(zvEMitVollerAbfindung);
    const steuerAufAbfindungNormal = steuerMitVollerAbfindung - steuerOhneAbfindung;
    
    // 5. Ersparnis durch Fünftelregelung
    const ersparnisFuenftelregelung = steuerAufAbfindungNormal - steuerAufAbfindungFuenftel;
    const fuenftelregelungLohntSich = ersparnisFuenftelregelung > 0;
    
    // 6. Soli auf Abfindung
    const soliOhneAbfindung = berechneSoli(steuerOhneAbfindung);
    const soliMitAbfindungFuenftel = berechneSoli(steuerOhneAbfindung + steuerAufAbfindungFuenftel);
    const soliAufAbfindung = soliMitAbfindungFuenftel - soliOhneAbfindung;
    
    // 7. Kirchensteuer auf Abfindung
    const kirchensteuerSatz = BUNDESLAENDER.find(b => b.id === bundesland)?.kirchensteuerSatz || 9;
    const kirchensteuerAufAbfindung = kirchensteuer ? steuerAufAbfindungFuenftel * (kirchensteuerSatz / 100) : 0;
    
    // 8. Gesamtabzüge
    const gesamtAbzuege = steuerAufAbfindungFuenftel + soliAufAbfindung + kirchensteuerAufAbfindung;
    
    // 9. Netto-Abfindung
    const nettoAbfindung = abfindung - gesamtAbzuege;
    
    // 10. Effektiver Steuersatz
    const effektiverSteuersatz = (gesamtAbzuege / abfindung) * 100;
    const ersparterSteuersatz = ((ersparnisFuenftelregelung > 0 ? ersparnisFuenftelregelung : 0) / abfindung) * 100;
    
    // 11. Grenzsteuersatz
    const grenzsteuersatzOhne = zvENachKinderfreibetrag > 277825 ? 45 
      : zvENachKinderfreibetrag > 66760 ? 42 
      : zvENachKinderfreibetrag > 17005 ? (176.64 * 2 * ((zvENachKinderfreibetrag - 17005) / 10000) + 2397) / 100 + 24 
      : zvENachKinderfreibetrag > GRUNDFREIBETRAG_2025 ? 14 + (932.30 * 2 * ((zvENachKinderfreibetrag - GRUNDFREIBETRAG_2025) / 10000) + 1400) / 100
      : 0;
    
    return {
      // Abfindung
      abfindungBrutto: abfindung,
      regelabfindung,
      maxRegelabfindung,
      erhoehterAnspruch,
      
      // zvE
      zvE,
      zvENachKinderfreibetrag,
      zvEMitEinFuenftel,
      zvEMitVollerAbfindung,
      
      // Steuer-Berechnungen
      steuerOhneAbfindung,
      steuerMitEinFuenftel,
      mehrsteuerProFuenftel,
      steuerAufAbfindungFuenftel,
      steuerAufAbfindungNormal,
      ersparnisFuenftelregelung,
      fuenftelregelungLohntSich,
      
      // Soli & Kirchensteuer
      soliAufAbfindung,
      kirchensteuerAufAbfindung,
      kirchensteuerSatz,
      
      // Ergebnis
      gesamtAbzuege,
      nettoAbfindung,
      effektiverSteuersatz,
      ersparterSteuersatz,
      grenzsteuersatz: grenzsteuersatzOhne,
    };
  }, [bruttoMonatsgehalt, beschaeftigungsjahre, alterBeiAustritt, abfindungsBerechnungsart, abfindungsFaktor, abfindungsBetrag, jahresbrutto, steuerklasse, kirchensteuer, bundesland, kinderfreibetraege]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const formatEuroRund = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
  const formatProzent = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Abfindungs-Eingabe */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">💰 Abfindungshöhe berechnen</h3>
        
        {/* Berechnungsart wählen */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setAbfindungsBerechnungsart('faktor')}
            className={`p-4 rounded-xl border-2 transition-all ${
              abfindungsBerechnungsart === 'faktor'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">📊</div>
            <div className="font-semibold text-gray-800 text-sm">Nach Formel</div>
            <div className="text-xs text-gray-500">Gehalt × Jahre × Faktor</div>
          </button>
          <button
            onClick={() => setAbfindungsBerechnungsart('betrag')}
            className={`p-4 rounded-xl border-2 transition-all ${
              abfindungsBerechnungsart === 'betrag'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">💶</div>
            <div className="font-semibold text-gray-800 text-sm">Fester Betrag</div>
            <div className="text-xs text-gray-500">Abfindung eingeben</div>
          </button>
        </div>

        {abfindungsBerechnungsart === 'faktor' ? (
          <>
            {/* Bruttogehalt */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Bruttomonatsgehalt</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bruttoMonatsgehalt}
                  onChange={(e) => setBruttoMonatsgehalt(Math.max(0, Number(e.target.value)))}
                  className="w-full text-2xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="1000"
                  max="20000"
                  step="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              </div>
              <input
                type="range"
                value={bruttoMonatsgehalt}
                onChange={(e) => setBruttoMonatsgehalt(Number(e.target.value))}
                className="w-full mt-2 accent-blue-500"
                min="1500"
                max="15000"
                step="100"
              />
            </div>

            {/* Beschäftigungsjahre */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Betriebszugehörigkeit</span>
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setBeschaeftigungsjahre(Math.max(1, beschaeftigungsjahre - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                >
                  −
                </button>
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-800">{beschaeftigungsjahre}</span>
                  <span className="text-gray-500 ml-2">Jahre</span>
                </div>
                <button
                  onClick={() => setBeschaeftigungsjahre(Math.min(40, beschaeftigungsjahre + 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Abfindungsfaktor */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Abfindungsfaktor</span>
                <span className="text-gray-500 text-sm ml-2">(Standard: 0,5 = halbes Bruttomonatsgehalt pro Jahr)</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={abfindungsFaktor}
                  onChange={(e) => setAbfindungsFaktor(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                  min="0.25"
                  max="1.5"
                  step="0.05"
                />
                <span className="text-xl font-bold w-16 text-center">{abfindungsFaktor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0,25 (niedrig)</span>
                <span>0,5 (Regel)</span>
                <span>1,0+ (hoch)</span>
              </div>
            </div>

            {/* Berechnete Abfindung anzeigen */}
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <span className="text-sm text-blue-600">Berechnete Abfindung</span>
              <div className="text-3xl font-bold text-blue-900">
                {formatEuroRund(ergebnis.abfindungBrutto)}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {formatEuroRund(bruttoMonatsgehalt)} × {beschaeftigungsjahre} Jahre × {abfindungsFaktor}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Direkter Abfindungsbetrag */}
            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-medium">Abfindungsbetrag (brutto)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={abfindungsBetrag}
                  onChange={(e) => setAbfindungsBetrag(Math.max(0, Number(e.target.value)))}
                  className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
                  min="1000"
                  max="500000"
                  step="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">€</span>
              </div>
              <input
                type="range"
                value={abfindungsBetrag}
                onChange={(e) => setAbfindungsBetrag(Number(e.target.value))}
                className="w-full mt-2 accent-blue-500"
                min="5000"
                max="200000"
                step="5000"
              />
            </div>
          </>
        )}
      </div>

      {/* Steuer-Eingaben */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🧾 Für Steuerberechnung (Fünftelregelung)</h3>
        
        {/* Alter bei Austritt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Alter bei Austritt</span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAlterBeiAustritt(Math.max(18, alterBeiAustritt - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold"
            >
              −
            </button>
            <span className="text-3xl font-bold text-gray-800">{alterBeiAustritt}</span>
            <button
              onClick={() => setAlterBeiAustritt(Math.min(67, alterBeiAustritt + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold"
            >
              +
            </button>
          </div>
          {ergebnis.erhoehterAnspruch && (
            <p className="text-xs text-green-600 text-center mt-2">
              ✓ Erhöhter Abfindungsanspruch möglich (50+ Jahre, 15+ Jahre Betriebszugehörigkeit)
            </p>
          )}
        </div>

        {/* Jahresbrutto */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Jahresbruttoeinkommen (ohne Abfindung)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={jahresbrutto}
              onChange={(e) => setJahresbrutto(Math.max(0, Number(e.target.value)))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
              min="12000"
              max="300000"
              step="1000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€/Jahr</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tipp: Niedriges Einkommen im Austrittsjahr = weniger Steuern auf Abfindung
          </p>
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Kinderfreibeträge</span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setKinderfreibetraege(Math.max(0, kinderfreibetraege - 0.5))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold"
            >
              −
            </button>
            <span className="text-2xl font-bold text-gray-800">{kinderfreibetraege}</span>
            <button
              onClick={() => setKinderfreibetraege(Math.min(10, kinderfreibetraege + 0.5))}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-lg font-bold"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">0,5 = halber Freibetrag (getrennte Eltern)</p>
        </div>

        {/* Kirchensteuer */}
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={kirchensteuer}
              onChange={(e) => setKirchensteuer(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">Kirchensteuerpflichtig</span>
          </label>
        </div>

        {kirchensteuer && (
          <div className="mb-4">
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Bundesland</span>
            </label>
            <select
              value={bundesland}
              onChange={(e) => setBundesland(e.target.value)}
              className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
            >
              {BUNDESLAENDER.map((bl) => (
                <option key={bl.id} value={bl.id}>
                  {bl.name} ({bl.kirchensteuerSatz}% Kirchensteuer)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-sm font-medium opacity-80 mb-1">💵 Ihre Netto-Abfindung</h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-5xl font-bold">{formatEuroRund(ergebnis.nettoAbfindung)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Brutto-Abfindung</span>
            <div className="text-xl font-bold">{formatEuroRund(ergebnis.abfindungBrutto)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <span className="text-sm opacity-80">Gesamtabzüge</span>
            <div className="text-xl font-bold">−{formatEuroRund(ergebnis.gesamtAbzuege)}</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span className="opacity-80">Effektiver Steuersatz auf Abfindung</span>
            <span className="text-2xl font-bold">{formatProzent(ergebnis.effektiverSteuersatz)}</span>
          </div>
        </div>
      </div>

      {/* Fünftelregelung Erklärung */}
      {ergebnis.fuenftelregelungLohntSich && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-green-800 mb-3">✅ Fünftelregelung spart Steuern!</h3>
          <div className="space-y-2 text-sm text-green-700">
            <p>
              Durch die <strong>Fünftelregelung (§ 34 EStG)</strong> sparen Sie:
            </p>
            <div className="bg-green-100 rounded-xl p-4 text-center">
              <span className="text-3xl font-bold text-green-800">{formatEuroRund(ergebnis.ersparnisFuenftelregelung)}</span>
              <p className="text-sm mt-1">weniger Steuern als bei Normalbesteuerung</p>
            </div>
            <p className="text-xs">
              Ohne Fünftelregelung wäre die Steuer auf die Abfindung {formatEuroRund(ergebnis.steuerAufAbfindungNormal)} statt {formatEuroRund(ergebnis.steuerAufAbfindungFuenftel)}.
            </p>
          </div>
        </div>
      )}

      {/* Steuer-Aufschlüsselung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Steuerberechnung im Detail</h3>
        
        <div className="space-y-3 text-sm">
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Abzüge von der Abfindung
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Brutto-Abfindung</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.abfindungBrutto)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Einkommensteuer (Fünftelregelung)</span>
            <span className="text-red-600">−{formatEuro(ergebnis.steuerAufAbfindungFuenftel)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Solidaritätszuschlag</span>
            <span className="text-red-600">−{formatEuro(ergebnis.soliAufAbfindung)}</span>
          </div>
          {kirchensteuer && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Kirchensteuer ({ergebnis.kirchensteuerSatz}%)</span>
              <span className="text-red-600">−{formatEuro(ergebnis.kirchensteuerAufAbfindung)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-3 bg-green-50 -mx-6 px-6 rounded-xl mt-4">
            <span className="font-bold text-green-800">Netto-Abfindung</span>
            <span className="font-bold text-2xl text-green-900">{formatEuro(ergebnis.nettoAbfindung)}</span>
          </div>
        </div>
      </div>

      {/* Fünftelregelung erklärt */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">🔢 So funktioniert die Fünftelregelung</h3>
        
        <div className="space-y-4 text-sm">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-medium text-blue-800 mb-2">Berechnungsschritte:</p>
            <ol className="space-y-2 text-blue-700 list-decimal list-inside">
              <li>Zu versteuerndes Einkommen (zvE) ohne Abfindung: <strong>{formatEuroRund(ergebnis.zvENachKinderfreibetrag)}</strong></li>
              <li>Steuer auf zvE ohne Abfindung: <strong>{formatEuro(ergebnis.steuerOhneAbfindung)}</strong></li>
              <li>zvE + 1/5 der Abfindung: <strong>{formatEuroRund(ergebnis.zvEMitEinFuenftel)}</strong></li>
              <li>Steuer auf zvE + 1/5: <strong>{formatEuro(ergebnis.steuerMitEinFuenftel)}</strong></li>
              <li>Mehrsteuer pro Fünftel: <strong>{formatEuro(ergebnis.mehrsteuerProFuenftel)}</strong></li>
              <li>Steuer auf Abfindung = Mehrsteuer × 5: <strong>{formatEuro(ergebnis.steuerAufAbfindungFuenftel)}</strong></li>
            </ol>
          </div>
          
          <p className="text-gray-600">
            Die Fünftelregelung verteilt die Abfindung fiktiv auf 5 Jahre. Dadurch steigt der Steuersatz 
            nur für 1/5 der Summe. Das Ergebnis wird dann mit 5 multipliziert – Sie zahlen weniger als 
            bei voller Besteuerung in einem Jahr.
          </p>
        </div>
      </div>

      {/* Regelabfindung Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚖️ Wie hoch sollte eine Abfindung sein?</h3>
        <div className="space-y-3 text-sm text-amber-700">
          <p>
            Es gibt <strong>keinen gesetzlichen Anspruch</strong> auf eine Abfindung. Die sogenannte 
            "Regelabfindung" ist ein Richtwert aus der Praxis:
          </p>
          <div className="bg-amber-100 rounded-xl p-4">
            <p className="text-center font-mono text-lg">
              <strong>0,5 × Bruttomonatsgehalt × Beschäftigungsjahre</strong>
            </p>
            <p className="text-center text-sm mt-2">
              Bei Ihnen: 0,5 × {formatEuroRund(bruttoMonatsgehalt)} × {beschaeftigungsjahre} = <strong>{formatEuroRund(ergebnis.regelabfindung)}</strong>
            </p>
          </div>
          <ul className="space-y-1 pl-4 list-disc">
            <li><strong>Minimum:</strong> 0,25 Gehälter pro Jahr (schwache Verhandlungsposition)</li>
            <li><strong>Standard:</strong> 0,5 Gehälter pro Jahr (Regelabfindung)</li>
            <li><strong>Gut:</strong> 0,75–1,0 Gehälter pro Jahr (starke Position, lange Zugehörigkeit)</li>
            <li><strong>Sehr gut:</strong> 1,0+ Gehälter pro Jahr (Führungskräfte, Sonderfälle)</li>
          </ul>
          {ergebnis.erhoehterAnspruch && (
            <p className="font-medium mt-2">
              ⚠️ Bei 50+ Jahren Alter und 15+ Jahren Betriebszugehörigkeit kann die Abfindung 
              bis zu <strong>18 Monatsgehälter</strong> betragen (§ 1a KSchG).
            </p>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ Wissenswertes zur Abfindung</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Kein Rechtsanspruch:</strong> Eine Abfindung ist Verhandlungssache, nicht gesetzlich vorgeschrieben</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Fünftelregelung ab 2025:</strong> Muss in der Steuererklärung beantragt werden (nicht mehr automatisch beim Lohnsteuerabzug)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Keine Sozialversicherung:</strong> Auf Abfindungen werden keine SV-Beiträge fällig</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Sperrzeit ALG:</strong> Bei Aufhebungsvertrag droht 12 Wochen Sperrzeit beim Arbeitslosengeld</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Ruhen des ALG:</strong> Abfindung kann ALG-Anspruch bis zu 1 Jahr ruhen lassen (§ 158 SGB III)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Timing:</strong> Abfindung im Jahr mit niedrigem Einkommen = weniger Steuern</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-red-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-red-700">
          <li>• <strong>NEU ab 2025:</strong> Die Fünftelregelung wird NICHT mehr automatisch vom Arbeitgeber beim Lohnsteuerabzug berücksichtigt – Sie müssen sie in der Steuererklärung beantragen!</li>
          <li>• <strong>Aufhebungsvertrag:</strong> Kann zu Sperrzeit (12 Wochen) beim Arbeitslosengeld führen</li>
          <li>• <strong>Kündigungsschutzklage:</strong> Oft bessere Verhandlungsposition für höhere Abfindung</li>
          <li>• <strong>Anwalt:</strong> Bei größeren Summen lohnt sich eine arbeitsrechtliche Beratung</li>
          <li>• <strong>Steuerberater:</strong> Für optimales Timing der Abfindungszahlung</li>
          <li>• Diese Berechnung ist eine Schätzung – die tatsächliche Steuer kann abweichen</li>
        </ul>
      </div>

      {/* Zuständige Stellen */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Beratung & Information</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Arbeitsrechtliche Beratung</p>
            <p className="text-sm text-blue-700 mt-1">
              Bei Fragen zu Kündigung und Abfindung:
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Fachanwalt für Arbeitsrecht</li>
              <li>• Gewerkschaft (für Mitglieder kostenlos)</li>
              <li>• Arbeitnehmerkammer (Bremen, Saarland)</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Arbeitsagentur Hotline</p>
                <p className="text-lg font-bold">0800 4 555500</p>
                <p className="text-xs text-gray-500">Kostenfrei, Mo-Fr 8-18 Uhr</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">BMAS Info</p>
                <a 
                  href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/arbeitsrecht.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Arbeitsrecht-Info →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tipps zur Optimierung */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">💡 Tipps zur Steueroptimierung</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-medium text-gray-800">Auszahlung im Folgejahr</p>
              <p>Wenn möglich, Abfindung im Januar auszahlen lassen – dann ist das Jahreseinkommen niedriger.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">📉</span>
            <div>
              <p className="font-medium text-gray-800">Einkommen reduzieren</p>
              <p>Unbezahlter Urlaub oder Freistellung vor Austritt senkt das zu versteuernde Einkommen.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">💰</span>
            <div>
              <p className="font-medium text-gray-800">Direktversicherung</p>
              <p>Teil der Abfindung in betriebliche Altersvorsorge einzahlen (steuerfrei bis 4% BBG).</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-xl">📊</span>
            <div>
              <p className="font-medium text-gray-800">Werbungskosten maximieren</p>
              <p>Fortbildungen, Bewerbungskosten, Umzug – im Jahr der Abfindung besonders wertvoll.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Quellen & Rechtsgrundlagen</h4>
        <div className="space-y-1">
          <a 
            href="https://www.gesetze-im-internet.de/estg/__34.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 34 EStG – Außerordentliche Einkünfte (Fünftelregelung)
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/kschg/__1a.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 1a KSchG – Abfindungsanspruch bei betriebsbedingter Kündigung
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_3/__159.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            § 159 SGB III – Sperrzeit bei Arbeitslosengeld
          </a>
          <a 
            href="https://www.bmas.de/DE/Arbeit/Arbeitsrecht/Kuendigung-und-Aufhebungsvertrag/kuendigung-aufhebungsvertrag.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMAS – Kündigung und Aufhebungsvertrag
          </a>
          <a 
            href="https://www.bmf-steuerrechner.de"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMF Steuerrechner – Offizielle Steuerberechnung
          </a>
        </div>
      </div>
    </div>
  );
}
