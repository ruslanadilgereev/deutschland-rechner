import { useState, useMemo } from 'react';

// ALG I Berechnungsgrundlagen 2025/2026
// Quelle: https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld

// Beitragsbemessungsgrenzen 2025/2026 (monatlich)
const BEITRAGSBEMESSUNGSGRENZE = {
  west: 7550, // 2025: 7.550€, 2026 geschätzt ähnlich
  ost: 7450,  // 2025: 7.450€
};

// Lohnsteuerklassen
const STEUERKLASSEN = [1, 2, 3, 4, 5, 6] as const;
type Steuerklasse = typeof STEUERKLASSEN[number];

// Anspruchsdauer-Tabelle (Monate Beschäftigung → Monate ALG I)
// Nach Alter gestaffelt (§ 147 SGB III)
const ANSPRUCHSDAUER_TABELLE: { beschaeftigung: number; alter50: number; alter55: number; alter58: number; standard: number }[] = [
  { beschaeftigung: 12, standard: 6, alter50: 6, alter55: 6, alter58: 6 },
  { beschaeftigung: 16, standard: 8, alter50: 8, alter55: 8, alter58: 8 },
  { beschaeftigung: 20, standard: 10, alter50: 10, alter55: 10, alter58: 10 },
  { beschaeftigung: 24, standard: 12, alter50: 12, alter55: 12, alter58: 12 },
  { beschaeftigung: 30, standard: 12, alter50: 15, alter55: 15, alter58: 15 },
  { beschaeftigung: 36, standard: 12, alter50: 18, alter55: 18, alter58: 18 },
  { beschaeftigung: 48, standard: 12, alter50: 18, alter55: 22, alter58: 24 },
];

// Sozialabgaben für pauschale Nettoberechnung (2025/2026)
const SOZIALABGABEN = {
  rentenversicherung: 0.093, // 9,3% AN-Anteil
  krankenversicherung: 0.073, // 7,3% + Zusatzbeitrag
  zusatzbeitrag_kv: 0.017, // Durchschnitt 1,7%
  pflegeversicherung: 0.017, // 1,7% (mit Kindern) / 2,3% (ohne Kinder)
  pflegeversicherung_kinderlos: 0.023, // Kinderlosenzuschlag ab 23 Jahre
  arbeitslosenversicherung: 0.013, // 1,3% AN-Anteil
};

// Vereinfachte Lohnsteuer-Näherung nach Steuerklasse (monatlich, 2025)
// Echte Berechnung ist komplexer, dies ist eine Näherung
function berechneUngefaehreLohnsteuer(brutto: number, steuerklasse: Steuerklasse, kirchensteuer: boolean): number {
  // Grundfreibetrag 2025: 11.784€/Jahr = 982€/Monat
  const grundfreibetrag = 982;
  
  // Vereinfachte Steuerberechnung
  let steuerpflichtig = brutto - grundfreibetrag;
  if (steuerpflichtig < 0) return 0;
  
  // Steuerklassen-Faktoren (sehr vereinfacht)
  const faktoren: Record<Steuerklasse, number> = {
    1: 0.20, // Ledig
    2: 0.18, // Alleinerziehend
    3: 0.12, // Verheiratet, Alleinverdiener
    4: 0.20, // Verheiratet, beide verdienen ähnlich
    5: 0.30, // Verheiratet, Zweitverdiener
    6: 0.35, // Nebenjob
  };
  
  let steuer = steuerpflichtig * faktoren[steuerklasse];
  
  // Kirchensteuer (8-9%)
  if (kirchensteuer) {
    steuer *= 1.085; // 8,5% Durchschnitt
  }
  
  // Soli (nur für hohe Einkommen, vereinfacht)
  if (brutto > 4500) {
    steuer *= 1.055;
  }
  
  return Math.max(0, Math.round(steuer));
}

// Netto-Berechnung für ALG I Bemessung
function berechneNetto(
  brutto: number,
  steuerklasse: Steuerklasse,
  kirchensteuer: boolean,
  hatKinder: boolean,
  region: 'west' | 'ost'
): { netto: number; details: any } {
  // Beitragsbemessungsgrenze anwenden
  const bemessungsbrutto = Math.min(brutto, BEITRAGSBEMESSUNGSGRENZE[region]);
  
  // Sozialabgaben berechnen
  const rv = bemessungsbrutto * SOZIALABGABEN.rentenversicherung;
  const kv = bemessungsbrutto * (SOZIALABGABEN.krankenversicherung + SOZIALABGABEN.zusatzbeitrag_kv);
  const pv = bemessungsbrutto * (hatKinder ? SOZIALABGABEN.pflegeversicherung : SOZIALABGABEN.pflegeversicherung_kinderlos);
  const av = bemessungsbrutto * SOZIALABGABEN.arbeitslosenversicherung;
  
  const sozialabgaben = rv + kv + pv + av;
  
  // Lohnsteuer berechnen
  const lohnsteuer = berechneUngefaehreLohnsteuer(brutto, steuerklasse, kirchensteuer);
  
  const netto = brutto - sozialabgaben - lohnsteuer;
  
  return {
    netto: Math.max(0, Math.round(netto)),
    details: {
      brutto,
      bemessungsbrutto,
      rentenversicherung: Math.round(rv),
      krankenversicherung: Math.round(kv),
      pflegeversicherung: Math.round(pv),
      arbeitslosenversicherung: Math.round(av),
      sozialabgabenGesamt: Math.round(sozialabgaben),
      lohnsteuer,
    },
  };
}

// Anspruchsdauer ermitteln
function berechneAnspruchsdauer(beschaeftigungMonate: number, alter: number): number {
  // Sortiert absteigend nach Beschäftigungsmonate
  const tabelle = [...ANSPRUCHSDAUER_TABELLE].reverse();
  
  for (const zeile of tabelle) {
    if (beschaeftigungMonate >= zeile.beschaeftigung) {
      if (alter >= 58) return zeile.alter58;
      if (alter >= 55) return zeile.alter55;
      if (alter >= 50) return zeile.alter50;
      return zeile.standard;
    }
  }
  
  return 0; // Kein Anspruch
}

export default function ArbeitslosengeldRechner() {
  // Eingabewerte
  const [bruttogehalt, setBruttogehalt] = useState(3000);
  const [steuerklasse, setSteuerklasse] = useState<Steuerklasse>(1);
  const [kirchensteuer, setKirchensteuer] = useState(false);
  const [hatKinder, setHatKinder] = useState(false);
  const [alter, setAlter] = useState(35);
  const [beschaeftigungMonate, setBeschaeftigungMonate] = useState(24);
  const [region, setRegion] = useState<'west' | 'ost'>('west');

  const ergebnis = useMemo(() => {
    // 1. Netto berechnen (Bemessungsentgelt)
    const { netto, details } = berechneNetto(bruttogehalt, steuerklasse, kirchensteuer, hatKinder, region);
    
    // 2. ALG I berechnen (60% ohne Kinder, 67% mit Kinder)
    const alg1Prozent = hatKinder ? 0.67 : 0.60;
    const alg1Monatlich = Math.round(netto * alg1Prozent);
    const alg1Taeglich = Math.round(alg1Monatlich / 30 * 100) / 100;
    
    // 3. Anspruchsdauer berechnen
    const anspruchsdauer = berechneAnspruchsdauer(beschaeftigungMonate, alter);
    const hatAnspruch = beschaeftigungMonate >= 12 && anspruchsdauer > 0;
    
    // 4. Gesamtsumme ALG I
    const alg1Gesamt = alg1Monatlich * anspruchsdauer;
    
    // 5. Differenz zum vorherigen Netto
    const differenzZuNetto = netto - alg1Monatlich;
    const differenzProzent = Math.round((differenzZuNetto / netto) * 100);
    
    return {
      // Bemessungsentgelt
      bruttogehalt,
      bemessungsbrutto: details.bemessungsbrutto,
      netto,
      nettoDetails: details,
      
      // ALG I
      alg1Prozent,
      alg1Monatlich,
      alg1Taeglich,
      alg1Gesamt,
      
      // Anspruch
      hatAnspruch,
      anspruchsdauer,
      beschaeftigungMonate,
      
      // Differenz
      differenzZuNetto,
      differenzProzent,
      
      // Sonstiges
      region,
      beitragsbemessungsgrenze: BEITRAGSBEMESSUNGSGRENZE[region],
    };
  }, [bruttogehalt, steuerklasse, kirchensteuer, hatKinder, alter, beschaeftigungMonate, region]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Bruttogehalt */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Monatliches Bruttogehalt</span>
            <span className="text-xs text-gray-500 block mt-1">Durchschnitt der letzten 12 Monate</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={bruttogehalt}
              onChange={(e) => setBruttogehalt(Math.max(0, Number(e.target.value)))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none"
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
            className="w-full mt-3 accent-blue-500"
            min="500"
            max="8000"
            step="50"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>500 €</span>
            <span>4.000 €</span>
            <span>8.000 €</span>
          </div>
        </div>

        {/* Steuerklasse */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Steuerklasse</span>
            <span className="text-xs text-gray-500 block mt-1">Ihre aktuelle Lohnsteuerklasse</span>
          </label>
          <div className="grid grid-cols-6 gap-2">
            {STEUERKLASSEN.map((sk) => (
              <button
                key={sk}
                onClick={() => setSteuerklasse(sk)}
                className={`py-3 px-2 rounded-xl text-center transition-all ${
                  steuerklasse === sk
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-bold">{sk}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {steuerklasse === 1 && '👤 Ledig, geschieden oder verwitwet'}
            {steuerklasse === 2 && '👨‍👧 Alleinerziehend mit Kind'}
            {steuerklasse === 3 && '💑 Verheiratet, Partner hat Steuerklasse 5'}
            {steuerklasse === 4 && '💑 Verheiratet, beide verdienen ähnlich'}
            {steuerklasse === 5 && '💑 Verheiratet, Partner hat Steuerklasse 3'}
            {steuerklasse === 6 && '📋 Zweit- oder Nebenjob'}
          </p>
        </div>

        {/* Kinder */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Kindergeld-Anspruch?</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setHatKinder(false)}
              className={`py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                !hatKinder
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">👤</span>
              <span>Ohne Kinder (60%)</span>
            </button>
            <button
              onClick={() => setHatKinder(true)}
              className={`py-4 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                hatKinder
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">👨‍👧</span>
              <span>Mit Kindern (67%)</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Mit Kindern erhalten Sie 67% statt 60% des Nettoentgelts
          </p>
        </div>

        {/* Alter */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Ihr Alter</span>
            <span className="text-xs text-gray-500 block mt-1">Für die Berechnung der Anspruchsdauer</span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAlter(Math.max(18, alter - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center px-6">
              <div className="text-4xl font-bold text-gray-800">{alter}</div>
              <div className="text-sm text-gray-500">Jahre</div>
            </div>
            <button
              onClick={() => setAlter(Math.min(67, alter + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
          {alter >= 50 && (
            <p className="text-sm text-blue-600 mt-2 text-center">
              ℹ️ Ab 50 Jahren: Verlängerte Anspruchsdauer möglich
            </p>
          )}
        </div>

        {/* Beschäftigungsdauer */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Versicherungspflichtige Beschäftigung</span>
            <span className="text-xs text-gray-500 block mt-1">In den letzten 30 Monaten (2,5 Jahre)</span>
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBeschaeftigungMonate(Math.max(0, beschaeftigungMonate - 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              −
            </button>
            <div className="text-center px-4">
              <div className="text-4xl font-bold text-gray-800">{beschaeftigungMonate}</div>
              <div className="text-sm text-gray-500">Monate</div>
            </div>
            <button
              onClick={() => setBeschaeftigungMonate(Math.min(48, beschaeftigungMonate + 1))}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
          {beschaeftigungMonate < 12 && (
            <p className="text-sm text-amber-600 mt-2 text-center">
              ⚠️ Mindestens 12 Monate erforderlich für ALG I
            </p>
          )}
        </div>

        {/* Region */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Region</span>
            <span className="text-xs text-gray-500 block mt-1">Für Beitragsbemessungsgrenze</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRegion('west')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                region === 'west'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇩🇪 West
            </button>
            <button
              onClick={() => setRegion('ost')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                region === 'ost'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🇩🇪 Ost
            </button>
          </div>
        </div>

        {/* Kirchensteuer */}
        <div className="mb-4">
          <button
            onClick={() => setKirchensteuer(!kirchensteuer)}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-between ${
              kirchensteuer
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>⛪ Kirchensteuer</span>
            <span>{kirchensteuer ? '✓ Ja' : '✗ Nein'}</span>
          </button>
        </div>
      </div>

      {/* Result Section */}
      <div className={`rounded-2xl shadow-lg p-6 text-white mb-6 ${
        ergebnis.hatAnspruch 
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
          : 'bg-gradient-to-br from-gray-400 to-gray-500'
      }`}>
        <h3 className="text-sm font-medium opacity-80 mb-1">
          {ergebnis.hatAnspruch ? '📋 Ihr voraussichtliches Arbeitslosengeld I' : '❌ Kein ALG I Anspruch'}
        </h3>
        
        {ergebnis.hatAnspruch ? (
          <>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{formatEuro(ergebnis.alg1Monatlich)}</span>
                <span className="text-xl opacity-80">/ Monat</span>
              </div>
              <p className="text-blue-100 mt-2 text-sm">
                Das sind <strong>{Math.round(ergebnis.alg1Prozent * 100)}%</strong> Ihres Nettoentgelts 
                ({formatEuro(ergebnis.netto)})
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Pro Tag</span>
                <div className="text-xl font-bold">{ergebnis.alg1Taeglich.toFixed(2)} €</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Anspruchsdauer</span>
                <div className="text-xl font-bold">{ergebnis.anspruchsdauer} Mon.</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <span className="text-sm opacity-80">Gesamt max.</span>
                <div className="text-xl font-bold">{formatEuro(ergebnis.alg1Gesamt)}</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-sm">
                <strong>Differenz zum bisherigen Netto:</strong> -{formatEuro(ergebnis.differenzZuNetto)} 
                ({ergebnis.differenzProzent}% weniger)
              </p>
            </div>
          </>
        ) : (
          <div className="py-4">
            <p className="text-white/90">
              Mit <strong>{beschaeftigungMonate} Monaten</strong> versicherungspflichtiger Beschäftigung 
              haben Sie keinen Anspruch auf ALG I.
            </p>
            <p className="mt-3 text-sm text-white/70">
              Für ALG I sind mindestens <strong>12 Monate</strong> versicherungspflichtige Beschäftigung 
              in den letzten 30 Monaten (Rahmenfrist) erforderlich.
            </p>
            <p className="mt-2 text-sm text-white/70">
              Alternativ können Sie <a href="/buergergeld-rechner" className="underline">Bürgergeld</a> beantragen.
            </p>
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📊 Berechnungsdetails</h3>
        
        <div className="space-y-3 text-sm">
          {/* Einkommen */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide">
            Bemessungsentgelt (pauschalisiertes Netto)
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Bruttogehalt (monatlich)</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.bruttogehalt)}</span>
          </div>
          
          {ergebnis.bruttogehalt > ergebnis.beitragsbemessungsgrenze && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-amber-600">
              <span>⚠️ Beitragsbemessungsgrenze ({region === 'west' ? 'West' : 'Ost'})</span>
              <span>{formatEuro(ergebnis.beitragsbemessungsgrenze)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Sozialabgaben (pauschal)</span>
            <span>{formatEuro(ergebnis.nettoDetails.sozialabgabenGesamt)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 text-red-600">
            <span>− Lohnsteuer (Steuerklasse {steuerklasse})</span>
            <span>{formatEuro(ergebnis.nettoDetails.lohnsteuer)}</span>
          </div>
          
          <div className="flex justify-between py-2 bg-gray-50 -mx-6 px-6">
            <span className="font-medium text-gray-700">= Pauschalisiertes Nettoentgelt</span>
            <span className="font-bold text-gray-900">{formatEuro(ergebnis.netto)}</span>
          </div>
          
          {/* ALG I Berechnung */}
          <div className="font-medium text-gray-500 text-xs uppercase tracking-wide pt-4">
            Arbeitslosengeld I
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Nettoentgelt</span>
            <span className="text-gray-900">{formatEuro(ergebnis.netto)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">× Leistungssatz ({hatKinder ? 'mit Kind' : 'ohne Kind'})</span>
            <span className="text-gray-900">{Math.round(ergebnis.alg1Prozent * 100)}%</span>
          </div>
          
          <div className="flex justify-between py-3 bg-blue-100 -mx-6 px-6 rounded-b-xl">
            <span className="font-bold text-blue-800">= ALG I pro Monat</span>
            <span className="font-bold text-2xl text-blue-900">{formatEuro(ergebnis.alg1Monatlich)}</span>
          </div>
        </div>
      </div>

      {/* Anspruchsdauer-Tabelle */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">📅 Anspruchsdauer ALG I</h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Die Bezugsdauer hängt von Ihrem Alter und der Dauer Ihrer versicherungspflichtigen 
          Beschäftigung in den letzten 5 Jahren ab:
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-600">Beschäftigung</th>
                <th className="text-center py-2 px-2 font-medium text-gray-600">&lt;50</th>
                <th className="text-center py-2 px-2 font-medium text-gray-600">ab 50</th>
                <th className="text-center py-2 px-2 font-medium text-gray-600">ab 55</th>
                <th className="text-center py-2 px-2 font-medium text-gray-600">ab 58</th>
              </tr>
            </thead>
            <tbody>
              {ANSPRUCHSDAUER_TABELLE.map((zeile, i) => {
                const istAktuelleZeile = beschaeftigungMonate >= zeile.beschaeftigung &&
                  (i === ANSPRUCHSDAUER_TABELLE.length - 1 || beschaeftigungMonate < ANSPRUCHSDAUER_TABELLE[i + 1].beschaeftigung);
                const aktuelleAnspruchsdauer = alter >= 58 ? zeile.alter58 : alter >= 55 ? zeile.alter55 : alter >= 50 ? zeile.alter50 : zeile.standard;
                
                return (
                  <tr 
                    key={zeile.beschaeftigung}
                    className={istAktuelleZeile ? 'bg-blue-100' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="py-2 px-3 font-medium">{zeile.beschaeftigung} Monate</td>
                    <td className={`text-center py-2 px-2 ${alter < 50 && istAktuelleZeile ? 'font-bold text-blue-700' : ''}`}>
                      {zeile.standard} Mon.
                    </td>
                    <td className={`text-center py-2 px-2 ${alter >= 50 && alter < 55 && istAktuelleZeile ? 'font-bold text-blue-700' : ''}`}>
                      {zeile.alter50} Mon.
                    </td>
                    <td className={`text-center py-2 px-2 ${alter >= 55 && alter < 58 && istAktuelleZeile ? 'font-bold text-blue-700' : ''}`}>
                      {zeile.alter55} Mon.
                    </td>
                    <td className={`text-center py-2 px-2 ${alter >= 58 && istAktuelleZeile ? 'font-bold text-blue-700' : ''}`}>
                      {zeile.alter58} Mon.
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Ihre Situation:</strong> Mit {beschaeftigungMonate} Monaten Beschäftigung und 
            Alter {alter} haben Sie Anspruch auf <strong>{ergebnis.anspruchsdauer} Monate</strong> ALG I.
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ℹ️ So funktioniert Arbeitslosengeld I</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Leistungssatz:</strong> 60% des pauschalierten Nettoentgelts (67% mit Kind)</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Bemessungszeitraum:</strong> Durchschnittsverdienst der letzten 12 Monate</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Anwartschaftszeit:</strong> Mindestens 12 Monate versicherungspflichtig in 30 Monaten</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Bezugsdauer:</strong> 6-24 Monate je nach Alter und Beschäftigungsdauer</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Steuerfrei:</strong> ALG I ist steuerfrei, unterliegt aber dem Progressionsvorbehalt</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span><strong>Sozialversicherung:</strong> Kranken- und Pflegeversicherung werden übernommen</span>
          </li>
        </ul>
      </div>

      {/* Wichtige Hinweise */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3">⚠️ Wichtige Hinweise</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Sperrzeit:</strong> Bei Eigenkündigung oder verhaltensbedingt: 12 Wochen Sperre!</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Meldepflicht:</strong> Sie müssen sich am 1. Tag der Arbeitslosigkeit persönlich arbeitslos melden</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Früh melden:</strong> Arbeitssuchend melden Sie sich bereits 3 Monate vor Ende des Arbeitsverhältnisses</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Verfügbarkeit:</strong> Sie müssen dem Arbeitsmarkt zur Verfügung stehen (15h+/Woche)</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Zuverdienst:</strong> Bis 165€/Monat anrechnungsfrei, darüber wird gekürzt</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span><strong>Schätzung:</strong> Dieser Rechner liefert eine Orientierung – die exakte Berechnung erfolgt durch die Agentur für Arbeit</span>
          </li>
        </ul>
      </div>

      {/* Nach ALG I */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">❓ Was kommt nach ALG I?</h3>
        <div className="space-y-3 text-sm text-blue-700">
          <p>
            Wenn Ihr ALG I ausläuft und Sie noch keine neue Arbeit gefunden haben:
          </p>
          <ul className="space-y-1 pl-4">
            <li>• <strong>Bürgergeld:</strong> Grundsicherung für Arbeitssuchende (früher Hartz IV)</li>
            <li>• <strong>Wohngeld:</strong> Wenn Sie geringe Einkünfte haben</li>
            <li>• <strong>Kinderzuschlag:</strong> Wenn Sie Kinder haben</li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a 
              href="/buergergeld-rechner"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Bürgergeld berechnen →
            </a>
            <a 
              href="/wohngeld-rechner"
              className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              Wohngeld prüfen →
            </a>
          </div>
        </div>
      </div>

      {/* Zuständige Behörde */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-3">🏛️ Zuständige Behörde</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-semibold text-blue-900">Agentur für Arbeit</p>
            <p className="text-sm text-blue-700 mt-1">
              Die Bundesagentur für Arbeit ist zuständig für ALG I. Melden Sie sich bei der 
              Agentur an Ihrem Wohnort.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">📞</span>
              <div>
                <p className="font-medium text-gray-800">Service-Hotline</p>
                <a 
                  href="tel:08004555500"
                  className="text-blue-600 hover:underline font-bold"
                >
                  0800 4 555500
                </a>
                <p className="text-gray-500 text-xs mt-1">Kostenfrei, Mo-Fr 8-18 Uhr</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">🌐</span>
              <div>
                <p className="font-medium text-gray-800">Online-Antrag</p>
                <a 
                  href="https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  arbeitsagentur.de →
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-sm">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-medium text-gray-800">Benötigte Unterlagen</p>
              <ul className="text-gray-600 mt-1 space-y-1">
                <li>• Personalausweis oder Reisepass</li>
                <li>• Arbeitsbescheinigung vom Arbeitgeber</li>
                <li>• Sozialversicherungsausweis</li>
                <li>• Lebenslauf und Zeugnisse</li>
                <li>• Bankverbindung (IBAN)</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl text-sm">
            <span className="text-xl">⏰</span>
            <div>
              <p className="font-medium text-amber-800">Wichtige Fristen</p>
              <ul className="text-amber-700 mt-1 space-y-1">
                <li>• <strong>3 Monate vorher:</strong> Arbeitssuchend melden</li>
                <li>• <strong>Spätestens 3 Tage nach Kenntnis:</strong> Bei kurzfristigem Ende</li>
                <li>• <strong>Tag 1 der Arbeitslosigkeit:</strong> Persönlich arbeitslos melden</li>
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
            href="https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            Bundesagentur für Arbeit – Arbeitslosengeld
          </a>
          <a 
            href="https://www.gesetze-im-internet.de/sgb_3/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            SGB III – Arbeitsförderungsgesetz
          </a>
          <a 
            href="https://www.bmas.de/DE/Arbeit/Arbeitsfoerderung/arbeitsfoerderung.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            BMAS – Arbeitsförderung
          </a>
          <a 
            href="https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2024/beitragssaetze-beitragsbemessungsgrenzen-2025.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline"
          >
            DRV – Beitragsbemessungsgrenzen 2025
          </a>
        </div>
      </div>
    </div>
  );
}
