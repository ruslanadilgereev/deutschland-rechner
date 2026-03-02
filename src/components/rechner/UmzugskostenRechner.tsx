import { useState, useMemo } from 'react';

// PLZ zu ungefähre Koordinaten (Mittelpunkte der PLZ-Regionen)
const plzKoordinaten: Record<string, { lat: number; lon: number; name: string }> = {
  '0': { lat: 51.05, lon: 13.74, name: 'Dresden/Leipzig' },
  '1': { lat: 52.52, lon: 13.40, name: 'Berlin' },
  '2': { lat: 53.55, lon: 10.00, name: 'Hamburg' },
  '3': { lat: 52.37, lon: 9.74, name: 'Hannover' },
  '4': { lat: 51.45, lon: 7.01, name: 'Ruhrgebiet' },
  '5': { lat: 50.94, lon: 6.96, name: 'Köln/Bonn' },
  '6': { lat: 50.11, lon: 8.68, name: 'Frankfurt' },
  '7': { lat: 48.78, lon: 9.18, name: 'Stuttgart' },
  '8': { lat: 48.14, lon: 11.58, name: 'München' },
  '9': { lat: 49.45, lon: 11.08, name: 'Nürnberg' },
};

// Entfernung zwischen zwei PLZ-Regionen berechnen (Luftlinie * 1.3 für Straße)
function berechneEntfernung(plzAlt: string, plzNeu: string): number {
  const regionAlt = plzAlt.charAt(0);
  const regionNeu = plzNeu.charAt(0);
  
  if (regionAlt === regionNeu) {
    // Innerhalb derselben Region: ca. 20-50km
    return 30;
  }
  
  const koordinatenAlt = plzKoordinaten[regionAlt] || plzKoordinaten['5'];
  const koordinatenNeu = plzKoordinaten[regionNeu] || plzKoordinaten['5'];
  
  // Haversine-Formel vereinfacht
  const R = 6371; // Erdradius in km
  const dLat = (koordinatenNeu.lat - koordinatenAlt.lat) * Math.PI / 180;
  const dLon = (koordinatenNeu.lon - koordinatenAlt.lon) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(koordinatenAlt.lat * Math.PI / 180) * Math.cos(koordinatenNeu.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const luftlinie = R * c;
  
  // Straßenentfernung ca. 1.3x Luftlinie
  return Math.round(luftlinie * 1.3);
}

// Umzugsvolumen basierend auf Wohnfläche schätzen (m³)
function schaetzeVolumen(qm: number): number {
  // Faustregel: ca. 10-15 m³ pro 10 m² Wohnfläche
  return Math.round(qm * 0.4);
}

export default function UmzugskostenRechner() {
  // Eingabewerte
  const [plzAlt, setPlzAlt] = useState('10115');
  const [plzNeu, setPlzNeu] = useState('80331');
  const [wohnflaeche, setWohnflaeche] = useState(60);
  const [etageAlt, setEtageAlt] = useState(2);
  const [etageNeu, setEtageNeu] = useState(1);
  const [aufzugAlt, setAufzugAlt] = useState(false);
  const [aufzugNeu, setAufzugNeu] = useState(true);
  const [mitFirma, setMitFirma] = useState(true);
  const [packservice, setPackservice] = useState(false);
  const [moebelmontage, setMoebelmontage] = useState(true);
  const [halteverbot, setHalteverbot] = useState(false);
  const [beruflichBedingt, setBeruflichBedingt] = useState(false);
  const [anzahlPersonen, setAnzahlPersonen] = useState(1);

  const ergebnis = useMemo(() => {
    const entfernung = berechneEntfernung(plzAlt, plzNeu);
    const volumen = schaetzeVolumen(wohnflaeche);
    const istFernumzug = entfernung > 100;
    
    let kostenFirma = 0;
    let kostenSelbst = 0;
    const kostenDetails: { kategorie: string; betrag: number; beschreibung: string }[] = [];
    
    // === UMZUGSUNTERNEHMEN ===
    if (mitFirma) {
      // Basispreis abhängig von Volumen
      // ca. 25-40€ pro m³ bei Nahumzug, 35-55€ bei Fernumzug
      const preisProM3 = istFernumzug ? 45 : 30;
      const basispreis = volumen * preisProM3;
      kostenDetails.push({
        kategorie: 'Transport & Arbeit',
        betrag: basispreis,
        beschreibung: `${volumen} m³ × ${preisProM3} €/m³`
      });
      kostenFirma += basispreis;
      
      // Entfernungszuschlag
      if (entfernung > 50) {
        const kmZuschlag = Math.round((entfernung - 50) * 1.5);
        kostenDetails.push({
          kategorie: 'Kilometerzuschlag',
          betrag: kmZuschlag,
          beschreibung: `${entfernung - 50} km × 1,50 €`
        });
        kostenFirma += kmZuschlag;
      }
      
      // Etagenzuschlag (ohne Aufzug)
      const etagenAufwand = (!aufzugAlt ? etageAlt * 50 : 0) + (!aufzugNeu ? etageNeu * 50 : 0);
      if (etagenAufwand > 0) {
        kostenDetails.push({
          kategorie: 'Etagenzuschlag',
          betrag: etagenAufwand,
          beschreibung: 'Ohne Aufzug: 50 € pro Etage'
        });
        kostenFirma += etagenAufwand;
      }
      
      // Packservice
      if (packservice) {
        const packkosten = Math.round(volumen * 15);
        kostenDetails.push({
          kategorie: 'Packservice',
          betrag: packkosten,
          beschreibung: `${volumen} m³ × 15 €/m³`
        });
        kostenFirma += packkosten;
      }
      
      // Möbelmontage
      if (moebelmontage) {
        const montagekosten = Math.round(wohnflaeche * 2);
        kostenDetails.push({
          kategorie: 'Möbelmontage',
          betrag: montagekosten,
          beschreibung: 'Ab- und Aufbau von Möbeln'
        });
        kostenFirma += montagekosten;
      }
      
      // Halteverbot
      if (halteverbot) {
        const halteverbotskosten = istFernumzug ? 300 : 150;
        kostenDetails.push({
          kategorie: 'Halteverbotszone',
          betrag: halteverbotskosten,
          beschreibung: istFernumzug ? 'Zwei Zonen (alt + neu)' : 'Eine Zone'
        });
        kostenFirma += halteverbotskosten;
      }
    }
    
    // === SELBSTUMZUG ===
    // Transporter mieten
    let transporterGroesse = '';
    let transporterPreis = 0;
    let anzahlFahrten = 1;
    
    if (volumen <= 15) {
      transporterGroesse = 'Sprinter (3,5t)';
      transporterPreis = 80;
    } else if (volumen <= 35) {
      transporterGroesse = 'LKW 7,5t';
      transporterPreis = 150;
    } else {
      transporterGroesse = 'LKW 12t';
      transporterPreis = 200;
      if (volumen > 50) anzahlFahrten = 2;
    }
    
    // Mietdauer abhängig von Entfernung
    const mietTage = istFernumzug ? 2 : 1;
    const transporterGesamt = transporterPreis * mietTage * anzahlFahrten;
    
    // Spritkosten
    const verbrauch = volumen <= 15 ? 12 : volumen <= 35 ? 18 : 25; // L/100km
    const spritpreis = 1.65; // €/L Diesel
    const spritkosten = Math.round((entfernung * 2 * anzahlFahrten) / 100 * verbrauch * spritpreis);
    
    // Private Helfer
    const anzahlHelfer = Math.ceil(volumen / 20) + 1;
    const stundenProHelfer = istFernumzug ? 10 : 6;
    const helferLohn = 15; // €/Stunde
    const helferkosten = anzahlHelfer * stundenProHelfer * helferLohn;
    
    // Umzugsmaterial
    const kartonAnzahl = Math.round(wohnflaeche * 0.6);
    const materialkosten = kartonAnzahl * 3 + 50; // Kartons + Klebeband etc.
    
    kostenSelbst = transporterGesamt + spritkosten + helferkosten + materialkosten;
    
    // === NEBENKOSTEN (für beide) ===
    const nebenkosten: { name: string; betrag: number; optional: boolean }[] = [
      { name: 'Renovierung alte Wohnung', betrag: Math.round(wohnflaeche * 8), optional: true },
      { name: 'Doppelmiete (1 Monat)', betrag: Math.round(wohnflaeche * 12), optional: true },
      { name: 'Ummeldung & Behörden', betrag: 50, optional: false },
      { name: 'Nachsendeauftrag Post', betrag: 35, optional: false },
      { name: 'Einrichtung (Gardinen etc.)', betrag: 300, optional: true },
    ];
    
    const nebenkostenGesamt = nebenkosten.reduce((sum, n) => sum + n.betrag, 0);
    
    // === STEUERERSPARNIS ===
    // Umzugskostenpauschale ab 1. März 2024 (BMF-Schreiben)
    // 964€ für Berechtigte, 643€ pro weitere Person
    const umzugspauschale2024 = 964; // Single, ab März 2024
    const zuschlagProPerson = 643;
    const steuerlichePauschale = beruflichBedingt
      ? umzugspauschale2024 + Math.max(0, anzahlPersonen - 1) * zuschlagProPerson
      : 0;
    
    // Angenommener Grenzsteuersatz 35%
    const steuerersparnis = Math.round(steuerlichePauschale * 0.35);
    
    return {
      entfernung,
      volumen,
      istFernumzug,
      kostenFirma,
      kostenDetails,
      kostenSelbst,
      selbstumzugDetails: {
        transporter: { groesse: transporterGroesse, preis: transporterGesamt, tage: mietTage },
        sprit: spritkosten,
        helfer: { anzahl: anzahlHelfer, stunden: stundenProHelfer, kosten: helferkosten },
        material: materialkosten,
        kartons: kartonAnzahl,
      },
      nebenkosten,
      nebenkostenGesamt,
      ersparnisSelbst: kostenFirma - kostenSelbst,
      steuerlichePauschale,
      steuerersparnis,
      gesamtMitFirma: kostenFirma + nebenkostenGesamt - steuerersparnis,
      gesamtSelbst: kostenSelbst + nebenkostenGesamt - steuerersparnis,
    };
  }, [plzAlt, plzNeu, wohnflaeche, etageAlt, etageNeu, aufzugAlt, aufzugNeu, 
      mitFirma, packservice, moebelmontage, halteverbot, beruflichBedingt, anzahlPersonen]);

  const formatEuro = (n: number) =>
    n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

  const regionAlt = plzKoordinaten[plzAlt.charAt(0)]?.name || '';
  const regionNeu = plzKoordinaten[plzNeu.charAt(0)]?.name || '';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        
        {/* PLZ Eingabe */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">PLZ alte Wohnung</span>
            </label>
            <input
              type="text"
              value={plzAlt}
              onChange={(e) => setPlzAlt(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              placeholder="10115"
              maxLength={5}
            />
            {regionAlt && <p className="text-xs text-gray-500 mt-1 text-center">{regionAlt}</p>}
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium">PLZ neue Wohnung</span>
            </label>
            <input
              type="text"
              value={plzNeu}
              onChange={(e) => setPlzNeu(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="w-full text-xl font-bold text-center py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              placeholder="80331"
              maxLength={5}
            />
            {regionNeu && <p className="text-xs text-gray-500 mt-1 text-center">{regionNeu}</p>}
          </div>
        </div>

        {/* Entfernung Anzeige */}
        <div className="bg-orange-50 rounded-xl p-3 mb-6 text-center">
          <span className="text-gray-600">Geschätzte Entfernung: </span>
          <span className="font-bold text-orange-600">{ergebnis.entfernung} km</span>
          {ergebnis.istFernumzug && (
            <span className="ml-2 text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">Fernumzug</span>
          )}
        </div>

        {/* Wohnfläche */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Wohnfläche</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={wohnflaeche}
              onChange={(e) => setWohnflaeche(Math.max(10, Math.min(300, Number(e.target.value))))}
              className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0 outline-none"
              min="10"
              max="300"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">m²</span>
          </div>
          <input
            type="range"
            value={wohnflaeche}
            onChange={(e) => setWohnflaeche(Number(e.target.value))}
            min="10"
            max="200"
            step="5"
            className="w-full mt-2 accent-orange-500"
          />
          <p className="text-sm text-gray-500 mt-1 text-center">
            Geschätztes Umzugsvolumen: <strong>{ergebnis.volumen} m³</strong>
          </p>
        </div>

        {/* Etagen */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Etage alt</span>
            </label>
            <select
              value={etageAlt}
              onChange={(e) => setEtageAlt(Number(e.target.value))}
              className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
            >
              <option value={0}>Erdgeschoss</option>
              <option value={1}>1. Stock</option>
              <option value={2}>2. Stock</option>
              <option value={3}>3. Stock</option>
              <option value={4}>4. Stock</option>
              <option value={5}>5.+ Stock</option>
            </select>
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={aufzugAlt}
                onChange={(e) => setAufzugAlt(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              Aufzug vorhanden
            </label>
          </div>
          <div>
            <label className="block mb-2">
              <span className="text-gray-700 font-medium text-sm">Etage neu</span>
            </label>
            <select
              value={etageNeu}
              onChange={(e) => setEtageNeu(Number(e.target.value))}
              className="w-full py-2 px-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
            >
              <option value={0}>Erdgeschoss</option>
              <option value={1}>1. Stock</option>
              <option value={2}>2. Stock</option>
              <option value={3}>3. Stock</option>
              <option value={4}>4. Stock</option>
              <option value={5}>5.+ Stock</option>
            </select>
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={aufzugNeu}
                onChange={(e) => setAufzugNeu(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              Aufzug vorhanden
            </label>
          </div>
        </div>

        {/* Umzugsart */}
        <div className="mb-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium">Umzugsart</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMitFirma(true)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                mitFirma
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">🚚</span>
              <span className="font-medium">Mit Firma</span>
              <span className="text-xs block text-gray-500">Professioneller Umzug</span>
            </button>
            <button
              onClick={() => setMitFirma(false)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                !mitFirma
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">💪</span>
              <span className="font-medium">Selbstumzug</span>
              <span className="text-xs block text-gray-500">Mit Helfern & Miet-LKW</span>
            </button>
          </div>
        </div>

        {/* Zusatzleistungen für Firma */}
        {mitFirma && (
          <div className="mb-6 bg-gray-50 rounded-xl p-4">
            <p className="font-medium text-gray-700 mb-3">Zusatzleistungen</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-gray-600">
                <input
                  type="checkbox"
                  checked={moebelmontage}
                  onChange={(e) => setMoebelmontage(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
                <span>Möbelmontage (Ab- und Aufbau)</span>
              </label>
              <label className="flex items-center gap-3 text-gray-600">
                <input
                  type="checkbox"
                  checked={packservice}
                  onChange={(e) => setPackservice(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
                <span>Packservice (Kartons packen)</span>
              </label>
              <label className="flex items-center gap-3 text-gray-600">
                <input
                  type="checkbox"
                  checked={halteverbot}
                  onChange={(e) => setHalteverbot(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
                <span>Halteverbotszone einrichten</span>
              </label>
            </div>
          </div>
        )}

        {/* Steuerliche Absetzbarkeit */}
        <div className="mb-6 bg-blue-50 rounded-xl p-4">
          <label className="flex items-center gap-3 text-blue-700 font-medium mb-3">
            <input
              type="checkbox"
              checked={beruflichBedingt}
              onChange={(e) => setBeruflichBedingt(e.target.checked)}
              className="w-5 h-5 accent-blue-500"
            />
            <span>Beruflich bedingter Umzug</span>
          </label>
          {beruflichBedingt && (
            <div>
              <label className="block mb-2 text-sm text-blue-600">
                Anzahl umziehender Personen
              </label>
              <select
                value={anzahlPersonen}
                onChange={(e) => setAnzahlPersonen(Number(e.target.value))}
                className="w-full py-2 px-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 outline-none"
              >
                <option value={1}>1 Person</option>
                <option value={2}>2 Personen</option>
                <option value={3}>3 Personen</option>
                <option value={4}>4 Personen</option>
                <option value={5}>5+ Personen</option>
              </select>
              <p className="text-xs text-blue-600 mt-2">
                💡 Ein Umzug gilt als beruflich bedingt, wenn Sie dadurch mind. 1 Stunde Arbeitsweg pro Tag sparen.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white mb-6">
        <h3 className="text-lg font-medium opacity-90 mb-4">
          {mitFirma ? 'Geschätzte Kosten mit Umzugsfirma' : 'Geschätzte Kosten Selbstumzug'}
        </h3>
        
        <div className="text-5xl font-bold mb-2">
          {formatEuro(mitFirma ? ergebnis.kostenFirma : ergebnis.kostenSelbst)}
        </div>
        <p className="opacity-80 text-sm mb-4">reine Umzugskosten (ohne Nebenkosten)</p>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span>+ Typische Nebenkosten</span>
            <span className="font-semibold">{formatEuro(ergebnis.nebenkostenGesamt)}</span>
          </div>
          {beruflichBedingt && (
            <div className="flex justify-between items-center mt-2 text-green-200">
              <span>− Steuerersparnis (ca.)</span>
              <span className="font-semibold">−{formatEuro(ergebnis.steuerersparnis)}</span>
            </div>
          )}
          <div className="border-t border-white/20 mt-3 pt-3 flex justify-between items-center text-xl font-bold">
            <span>Gesamtkosten</span>
            <span>{formatEuro(mitFirma ? ergebnis.gesamtMitFirma : ergebnis.gesamtSelbst)}</span>
          </div>
        </div>
      </div>

      {/* Vergleich */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Kostenvergleich</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`p-4 rounded-xl ${mitFirma ? 'bg-orange-100 border-2 border-orange-500' : 'bg-gray-50'}`}>
            <p className="text-sm text-gray-600">Mit Umzugsfirma</p>
            <p className="text-2xl font-bold text-gray-800">{formatEuro(ergebnis.kostenFirma)}</p>
          </div>
          <div className={`p-4 rounded-xl ${!mitFirma ? 'bg-orange-100 border-2 border-orange-500' : 'bg-gray-50'}`}>
            <p className="text-sm text-gray-600">Selbstumzug</p>
            <p className="text-2xl font-bold text-gray-800">{formatEuro(ergebnis.kostenSelbst)}</p>
          </div>
        </div>
        
        {ergebnis.ersparnisSelbst > 0 && (
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-green-700">
              <span className="font-bold">{formatEuro(ergebnis.ersparnisSelbst)}</span> Ersparnis beim Selbstumzug
            </p>
          </div>
        )}
      </div>

      {/* Kostenaufstellung */}
      {mitFirma ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Aufschlüsselung Umzugsfirma</h3>
          <div className="space-y-3">
            {ergebnis.kostenDetails.map((detail, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-700">{detail.kategorie}</p>
                  <p className="text-xs text-gray-500">{detail.beschreibung}</p>
                </div>
                <p className="font-semibold text-gray-800">{formatEuro(detail.betrag)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Aufschlüsselung Selbstumzug</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-700">Transporter mieten</p>
                <p className="text-xs text-gray-500">{ergebnis.selbstumzugDetails.transporter.groesse}, {ergebnis.selbstumzugDetails.transporter.tage} Tag(e)</p>
              </div>
              <p className="font-semibold text-gray-800">{formatEuro(ergebnis.selbstumzugDetails.transporter.preis)}</p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-700">Spritkosten</p>
                <p className="text-xs text-gray-500">{ergebnis.entfernung * 2} km Fahrstrecke</p>
              </div>
              <p className="font-semibold text-gray-800">{formatEuro(ergebnis.selbstumzugDetails.sprit)}</p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-700">Umzugshelfer</p>
                <p className="text-xs text-gray-500">{ergebnis.selbstumzugDetails.helfer.anzahl} Personen × {ergebnis.selbstumzugDetails.helfer.stunden}h × 15 €</p>
              </div>
              <p className="font-semibold text-gray-800">{formatEuro(ergebnis.selbstumzugDetails.helfer.kosten)}</p>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-700">Umzugsmaterial</p>
                <p className="text-xs text-gray-500">ca. {ergebnis.selbstumzugDetails.kartons} Kartons + Zubehör</p>
              </div>
              <p className="font-semibold text-gray-800">{formatEuro(ergebnis.selbstumzugDetails.material)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nebenkosten Checkliste */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">✅ Nebenkosten-Checkliste</h3>
        <div className="space-y-3">
          {ergebnis.nebenkosten.map((kosten, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className={kosten.optional ? 'text-yellow-500' : 'text-green-500'}>
                  {kosten.optional ? '○' : '●'}
                </span>
                <span className="text-gray-700">{kosten.name}</span>
                {kosten.optional && <span className="text-xs text-gray-400">(optional)</span>}
              </div>
              <span className="font-semibold text-gray-800">{formatEuro(kosten.betrag)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 font-bold">
            <span>Gesamt Nebenkosten</span>
            <span className="text-orange-600">{formatEuro(ergebnis.nebenkostenGesamt)}</span>
          </div>
        </div>
      </div>

      {/* Steuerliche Absetzbarkeit */}
      {beruflichBedingt && (
        <div className="bg-blue-50 rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">💰 Steuerliche Absetzbarkeit</h3>
          <div className="space-y-3 text-blue-700">
            <div className="flex justify-between items-center py-2">
              <span>Umzugskostenpauschale (ab März 2024)</span>
              <span className="font-semibold">964 €</span>
            </div>
            {anzahlPersonen > 1 && (
              <div className="flex justify-between items-center py-2">
                <span>+ {anzahlPersonen - 1} weitere Person(en) × 643 €</span>
                <span className="font-semibold">{formatEuro((anzahlPersonen - 1) * 643)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-t border-blue-200 font-bold">
              <span>Absetzbare Pauschale</span>
              <span>{formatEuro(ergebnis.steuerlichePauschale)}</span>
            </div>
            <div className="flex justify-between items-center py-2 bg-blue-100 rounded-lg px-3">
              <span>Geschätzte Steuerersparnis (35% Grenzsteuersatz)</span>
              <span className="font-bold text-green-600">{formatEuro(ergebnis.steuerersparnis)}</span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-4">
            Zusätzlich zur Pauschale können Sie nachgewiesene Einzelkosten (Umzugsfirma, Makler, doppelte Miete) absetzen!
          </p>
        </div>
      )}

      {/* Hinweis */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <p className="font-medium mb-1">⚠️ Hinweis zu den Berechnungen</p>
        <p>
          Die angezeigten Kosten sind Richtwerte basierend auf Durchschnittspreisen 2024/2025. 
          Tatsächliche Preise können je nach Region, Saison und individuellen Anforderungen abweichen. 
          Holen Sie immer mehrere Angebote ein!
        </p>
      </div>
    </div>
  );
}
