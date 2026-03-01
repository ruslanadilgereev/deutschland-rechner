import { useState, useMemo } from 'react';

// BLZ → BIC Mapping (wichtigste deutsche Banken)
const BLZ_BIC_MAP: Record<string, { bic: string; bank: string }> = {
  '10010010': { bic: 'PBNKDEFF', bank: 'Postbank' },
  '10020500': { bic: 'BFSWDE33BER', bank: 'Bank für Sozialwirtschaft' },
  '10050000': { bic: 'BELADEBEXXX', bank: 'Landesbank Berlin' },
  '10070000': { bic: 'DEUTDEBBXXX', bank: 'Deutsche Bank Berlin' },
  '10070024': { bic: 'DEUTDEDBBER', bank: 'Deutsche Bank PGK' },
  '10090000': { bic: 'GENODEF1P01', bank: 'Berliner Volksbank' },
  '12030000': { bic: 'BYLADEM1001', bank: 'Deutsche Kreditbank (DKB)' },
  '20010020': { bic: 'PBNKDEFFXXX', bank: 'Postbank Hamburg' },
  '20030000': { bic: 'HYVEDEMM300', bank: 'HypoVereinsbank Hamburg' },
  '20050550': { bic: 'HASPDEHHXXX', bank: 'Hamburger Sparkasse' },
  '20070000': { bic: 'DEUTDEHHXXX', bank: 'Deutsche Bank Hamburg' },
  '20070024': { bic: 'DEUTDEDBHAM', bank: 'Deutsche Bank PGK Hamburg' },
  '20090500': { bic: 'GENODEF1S05', bank: 'Sparda-Bank Hamburg' },
  '25010030': { bic: 'PBNKDEFFXXX', bank: 'Postbank Hannover' },
  '25050000': { bic: 'NOLADEHHXXX', bank: 'Nord/LB Hannover' },
  '25050180': { bic: 'SPKHDE2HXXX', bank: 'Sparkasse Hannover' },
  '25070024': { bic: 'DEUTDEDBHAN', bank: 'Deutsche Bank PGK Hannover' },
  '30010400': { bic: 'PBNKDEFFXXX', bank: 'Postbank Köln' },
  '30020900': { bic: 'CMCIDEDD', bank: 'Targobank' },
  '30050000': { bic: 'WELADEDDXXX', bank: 'Landesbank Hessen-Thüringen' },
  '30050110': { bic: 'DUSSDEDDXXX', bank: 'Stadtsparkasse Düsseldorf' },
  '30060010': { bic: 'DAAEDEDDXXX', bank: 'apoBank' },
  '30060601': { bic: 'DAAEDEDDXXX', bank: 'Deutsche Apotheker- und Ärztebank' },
  '30070010': { bic: 'DEUTDEDDXXX', bank: 'Deutsche Bank Düsseldorf' },
  '30070024': { bic: 'DEUTDEDBDUE', bank: 'Deutsche Bank PGK Düsseldorf' },
  '37010050': { bic: 'PBNKDEFFXXX', bank: 'Postbank Köln' },
  '37020500': { bic: 'BFSWDE33XXX', bank: 'Bank für Sozialwirtschaft Köln' },
  '37040044': { bic: 'COBADEFFXXX', bank: 'Commerzbank Köln' },
  '37050198': { bic: 'COLSDE33XXX', bank: 'Sparkasse KölnBonn' },
  '37050299': { bic: 'COLSDE33XXX', bank: 'Kreissparkasse Köln' },
  '37060120': { bic: 'GENODED1CGN', bank: 'Volksbank Köln Bonn' },
  '37060590': { bic: 'GENODED1SPK', bank: 'Sparda-Bank West' },
  '37070024': { bic: 'DEUTDEDBKOE', bank: 'Deutsche Bank PGK Köln' },
  '40010111': { bic: 'PBNKDEFFXXX', bank: 'Postbank Münster' },
  '43050001': { bic: 'WELADED1BOC', bank: 'Sparkasse Bochum' },
  '44010046': { bic: 'PBNKDEFFXXX', bank: 'Postbank Dortmund' },
  '44050199': { bic: 'DORTDE33XXX', bank: 'Sparkasse Dortmund' },
  '50010060': { bic: 'PBNKDEFFXXX', bank: 'Postbank Frankfurt' },
  '50010517': { bic: 'INGDDEFFXXX', bank: 'ING-DiBa' },
  '50020200': { bic: 'BHFBDEFF500', bank: 'BHF-BANK' },
  '50040000': { bic: 'COBADEFFXXX', bank: 'Commerzbank Frankfurt' },
  '50050000': { bic: 'HELADEF1822', bank: 'Landesbank Hessen-Thüringen' },
  '50050201': { bic: 'HELADEF1822', bank: 'Frankfurter Sparkasse' },
  '50070010': { bic: 'DEUTDEFFXXX', bank: 'Deutsche Bank Frankfurt' },
  '50070024': { bic: 'DEUTDEDBFRA', bank: 'Deutsche Bank PGK Frankfurt' },
  '50090500': { bic: 'GENODEF1S12', bank: 'Sparda-Bank Hessen' },
  '50310400': { bic: 'FTSBDEFAXXX', bank: 'flatex Bank' },
  '51010800': { bic: 'PBNKDEFFXXX', bank: 'Postbank Gießen' },
  '55010400': { bic: 'PBNKDEFFXXX', bank: 'Postbank Mainz' },
  '55050000': { bic: 'MAABORERXXX', bank: 'Mainzer Volksbank' },
  '60010070': { bic: 'PBNKDEFFXXX', bank: 'Postbank Stuttgart' },
  '60020030': { bic: 'BFSWDE33STG', bank: 'Bank für Sozialwirtschaft' },
  '60030000': { bic: 'BSHYEM1XXX', bank: 'Mercedes-Benz Bank' },
  '60050101': { bic: 'SOLADEST600', bank: 'Landesbank Baden-Württemberg' },
  '60050570': { bic: 'OASPDE6AXXX', bank: 'Sparkasse Offenburg/Ortenau' },
  '60070024': { bic: 'DEUTDEDBSTG', bank: 'Deutsche Bank PGK Stuttgart' },
  '60070070': { bic: 'DEUTDESSXXX', bank: 'Deutsche Bank Stuttgart' },
  '60090100': { bic: 'VOBADESSXXX', bank: 'Volksbank Stuttgart' },
  '66010075': { bic: 'PBNKDEFFXXX', bank: 'Postbank Karlsruhe' },
  '66020020': { bic: 'BFSWDE33KRL', bank: 'Bank für Sozialwirtschaft' },
  '66050101': { bic: 'KARSDE66XXX', bank: 'Sparkasse Karlsruhe' },
  '70010080': { bic: 'PBNKDEFFXXX', bank: 'Postbank München' },
  '70020270': { bic: 'HYVEDEMMXXX', bank: 'HypoVereinsbank München' },
  '70050000': { bic: 'BYLADEMMXXX', bank: 'Bayerische Landesbank' },
  '70070010': { bic: 'DEUTDEMM', bank: 'Deutsche Bank München' },
  '70070024': { bic: 'DEUTDEDBMUC', bank: 'Deutsche Bank PGK München' },
  '70090100': { bic: 'GENODEF1M01', bank: 'Volksbank Raiffeisenbank München' },
  '70090500': { bic: 'GENODEF1S04', bank: 'Sparda-Bank München' },
  '70150000': { bic: 'SSKMDEMMXXX', bank: 'Stadtsparkasse München' },
  '71050000': { bic: 'BYLADEM1ROS', bank: 'Sparkasse Rosenheim-Bad Aibling' },
  '75050000': { bic: 'BYLADEM1NUE', bank: 'Sparkasse Nürnberg' },
  '76010085': { bic: 'PBNKDEFFXXX', bank: 'Postbank Nürnberg' },
  '76050101': { bic: 'SSKNDE77XXX', bank: 'Sparkasse Nürnberg' },
  '76070024': { bic: 'DEUTDEDBNUM', bank: 'Deutsche Bank PGK Nürnberg' },
  '79020076': { bic: 'HYVEDEMM455', bank: 'HypoVereinsbank' },
  '79050000': { bic: 'BYLADEM1SWU', bank: 'Sparkasse Mainfranken Würzburg' },
  '86010090': { bic: 'PBNKDEFFXXX', bank: 'Postbank Leipzig' },
  '86050200': { bic: 'SOLADES1LPZ', bank: 'Sparkasse Leipzig' },
  // N26, Revolut, etc.
  '10011001': { bic: 'NTSBDEB1XXX', bank: 'N26 Bank' },
  '11010100': { bic: 'SOBKDEB2XXX', bank: 'Solarisbank' },
  '11010101': { bic: 'SOBKDEB2XXX', bank: 'Solarisbank' },
  '10000000': { bic: 'MARKDEF1100', bank: 'Bundesbank' },
  '50000000': { bic: 'MARKDEF1500', bank: 'Bundesbank Frankfurt' },
};

// IBAN-Prüfziffer berechnen (ISO 7064, Modulo 97)
function berechneIbanPruefziffer(blz: string, kontonummer: string): string {
  // Kontonummer auf 10 Stellen auffüllen
  const konto = kontonummer.padStart(10, '0');
  
  // BBAN = BLZ + Kontonummer
  const bban = blz + konto;
  
  // Ländercode DE = 13 14 (D=13, E=14 im Alphabet ab A=10)
  // Wir hängen "131400" an für die Prüfziffernberechnung
  const nummerString = bban + '131400';
  
  // Modulo 97 berechnen (für große Zahlen in Blöcken)
  let rest = 0;
  for (let i = 0; i < nummerString.length; i++) {
    rest = (rest * 10 + parseInt(nummerString[i])) % 97;
  }
  
  // Prüfziffer = 98 - Rest
  const pruefziffer = (98 - rest).toString().padStart(2, '0');
  
  return pruefziffer;
}

// IBAN validieren
function validiereIban(iban: string): { gueltig: boolean; fehler?: string; details?: any } {
  // Leerzeichen entfernen und in Großbuchstaben
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // Längenprüfung für DE
  if (!cleanIban.startsWith('DE')) {
    if (cleanIban.length === 22 && /^[A-Z]{2}/.test(cleanIban)) {
      return { gueltig: false, fehler: 'Nur deutsche IBANs (DE) werden unterstützt.' };
    }
    return { gueltig: false, fehler: 'Deutsche IBANs beginnen mit "DE".' };
  }
  
  if (cleanIban.length !== 22) {
    return { gueltig: false, fehler: `Deutsche IBANs haben 22 Zeichen (eingegeben: ${cleanIban.length}).` };
  }
  
  // Prüfziffer extrahieren
  const pruefziffer = cleanIban.substring(2, 4);
  const bban = cleanIban.substring(4);
  
  // Nur Ziffern im BBAN?
  if (!/^\d+$/.test(bban)) {
    return { gueltig: false, fehler: 'Die IBAN enthält ungültige Zeichen.' };
  }
  
  // BLZ und Kontonummer extrahieren
  const blz = bban.substring(0, 8);
  const kontonummer = bban.substring(8);
  
  // Prüfziffer validieren
  const berechnete = berechneIbanPruefziffer(blz, kontonummer);
  
  if (pruefziffer !== berechnete) {
    return { 
      gueltig: false, 
      fehler: `Ungültige Prüfziffer. Erwartet: ${berechnete}, gefunden: ${pruefziffer}.` 
    };
  }
  
  // Bank finden
  const bankInfo = BLZ_BIC_MAP[blz];
  
  return {
    gueltig: true,
    details: {
      iban: cleanIban,
      ibanFormatiert: formatIban(cleanIban),
      pruefziffer,
      blz,
      kontonummer,
      bic: bankInfo?.bic || 'Unbekannt',
      bank: bankInfo?.bank || 'Unbekannte Bank',
    }
  };
}

// IBAN generieren
function generiereIban(blz: string, kontonummer: string): { erfolg: boolean; iban?: string; fehler?: string; details?: any } {
  // Eingaben bereinigen
  const cleanBlz = blz.replace(/\s/g, '');
  const cleanKonto = kontonummer.replace(/\s/g, '');
  
  // BLZ prüfen
  if (!/^\d{8}$/.test(cleanBlz)) {
    return { erfolg: false, fehler: 'Die BLZ muss genau 8 Ziffern haben.' };
  }
  
  // Kontonummer prüfen
  if (!/^\d{1,10}$/.test(cleanKonto)) {
    return { erfolg: false, fehler: 'Die Kontonummer muss 1-10 Ziffern haben.' };
  }
  
  // Prüfziffer berechnen
  const pruefziffer = berechneIbanPruefziffer(cleanBlz, cleanKonto);
  
  // IBAN zusammensetzen
  const iban = 'DE' + pruefziffer + cleanBlz + cleanKonto.padStart(10, '0');
  
  // Bank finden
  const bankInfo = BLZ_BIC_MAP[cleanBlz];
  
  return {
    erfolg: true,
    iban,
    details: {
      iban,
      ibanFormatiert: formatIban(iban),
      pruefziffer,
      blz: cleanBlz,
      kontonummer: cleanKonto.padStart(10, '0'),
      bic: bankInfo?.bic || 'Nicht in Datenbank',
      bank: bankInfo?.bank || 'Nicht in Datenbank (BLZ gültig)',
    }
  };
}

// IBAN formatieren (4er-Gruppen)
function formatIban(iban: string): string {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}

// IBAN zerlegen
function zerlegeIban(iban: string): { erfolg: boolean; details?: any; fehler?: string } {
  const validierung = validiereIban(iban);
  
  if (!validierung.gueltig) {
    return { erfolg: false, fehler: validierung.fehler };
  }
  
  return { erfolg: true, details: validierung.details };
}

type Modus = 'generieren' | 'validieren' | 'zerlegen';

export default function IbanRechner() {
  const [modus, setModus] = useState<Modus>('generieren');
  const [blz, setBlz] = useState('');
  const [kontonummer, setKontonummer] = useState('');
  const [iban, setIban] = useState('');
  const [berechnet, setBerechnet] = useState(false);
  const [kopiert, setKopiert] = useState(false);

  const ergebnis = useMemo(() => {
    if (!berechnet) return null;
    
    switch (modus) {
      case 'generieren':
        return generiereIban(blz, kontonummer);
      case 'validieren':
      case 'zerlegen':
        return zerlegeIban(iban);
      default:
        return null;
    }
  }, [modus, blz, kontonummer, iban, berechnet]);

  const handleBerechnen = () => {
    setBerechnet(true);
    setKopiert(false);
  };

  const handleKopieren = async () => {
    if (ergebnis?.details?.iban) {
      try {
        await navigator.clipboard.writeText(ergebnis.details.iban);
        setKopiert(true);
        setTimeout(() => setKopiert(false), 2000);
      } catch (err) {
        console.error('Kopieren fehlgeschlagen:', err);
      }
    }
  };

  const handleReset = () => {
    setBlz('');
    setKontonummer('');
    setIban('');
    setBerechnet(false);
    setKopiert(false);
  };

  const handleModusWechsel = (neuerModus: Modus) => {
    setModus(neuerModus);
    setBerechnet(false);
    setKopiert(false);
  };

  return (
    <div className="space-y-6">
      {/* Modus-Auswahl */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleModusWechsel('generieren')}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              modus === 'generieren'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="block text-lg">🔧</span>
            <span className="text-sm">Generieren</span>
          </button>
          <button
            onClick={() => handleModusWechsel('validieren')}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              modus === 'validieren'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="block text-lg">✓</span>
            <span className="text-sm">Prüfen</span>
          </button>
          <button
            onClick={() => handleModusWechsel('zerlegen')}
            className={`py-3 px-4 rounded-xl font-medium transition-all ${
              modus === 'zerlegen'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="block text-lg">🔍</span>
            <span className="text-sm">Zerlegen</span>
          </button>
        </div>
      </div>

      {/* Eingabefelder */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {modus === 'generieren' && '💳 IBAN aus Kontodaten generieren'}
          {modus === 'validieren' && '✓ IBAN auf Gültigkeit prüfen'}
          {modus === 'zerlegen' && '🔍 IBAN in Bestandteile zerlegen'}
        </h2>

        {modus === 'generieren' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bankleitzahl (BLZ)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={blz}
                onChange={(e) => {
                  setBlz(e.target.value.replace(/\D/g, '').slice(0, 8));
                  setBerechnet(false);
                }}
                placeholder="z.B. 37050198"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
              />
              {blz.length === 8 && BLZ_BIC_MAP[blz] && (
                <p className="mt-1 text-sm text-green-600">
                  ✓ {BLZ_BIC_MAP[blz].bank}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kontonummer
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={kontonummer}
                onChange={(e) => {
                  setKontonummer(e.target.value.replace(/\D/g, '').slice(0, 10));
                  setBerechnet(false);
                }}
                placeholder="z.B. 1234567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
              />
              <p className="mt-1 text-xs text-gray-500">
                Kontonummern unter 10 Stellen werden automatisch mit führenden Nullen aufgefüllt.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IBAN eingeben
            </label>
            <input
              type="text"
              value={iban}
              onChange={(e) => {
                // Formatierung beim Tippen
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                setIban(value.slice(0, 22));
                setBerechnet(false);
              }}
              placeholder="z.B. DE89370501980004099076"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono tracking-wider"
            />
            <p className="mt-1 text-xs text-gray-500">
              Deutsche IBANs haben 22 Zeichen (DE + 2 Prüfziffern + 8 BLZ + 10 Kontonummer)
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleBerechnen}
            disabled={modus === 'generieren' ? (!blz || !kontonummer) : !iban}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {modus === 'generieren' ? 'IBAN generieren' : modus === 'validieren' ? 'IBAN prüfen' : 'IBAN zerlegen'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Ergebnis */}
      {berechnet && ergebnis && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Erfolg/Fehler Header */}
          {(ergebnis.erfolg || ergebnis.gueltig) ? (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
              <div className="text-center">
                <span className="text-4xl mb-2 block">✓</span>
                <h3 className="text-xl font-bold">
                  {modus === 'generieren' && 'IBAN generiert!'}
                  {modus === 'validieren' && 'IBAN ist gültig!'}
                  {modus === 'zerlegen' && 'IBAN zerlegt!'}
                </h3>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white p-6">
              <div className="text-center">
                <span className="text-4xl mb-2 block">✗</span>
                <h3 className="text-xl font-bold">
                  {modus === 'validieren' ? 'IBAN ist ungültig!' : 'Fehler!'}
                </h3>
                <p className="mt-2 text-red-100">{ergebnis.fehler}</p>
              </div>
            </div>
          )}

          {/* Details */}
          {ergebnis.details && (
            <div className="p-6 space-y-4">
              {/* IBAN mit Kopier-Button */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">IBAN</span>
                  <button
                    onClick={handleKopieren}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      kopiert 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {kopiert ? '✓ Kopiert!' : '📋 Kopieren'}
                  </button>
                </div>
                <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                  {ergebnis.details.ibanFormatiert}
                </p>
              </div>

              {/* Aufschlüsselung */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <span className="text-xs text-blue-600 font-medium block mb-1">Ländercode</span>
                  <span className="text-xl font-mono font-bold text-blue-900">DE</span>
                  <span className="text-xs text-blue-600 block mt-1">Deutschland</span>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <span className="text-xs text-purple-600 font-medium block mb-1">Prüfziffer</span>
                  <span className="text-xl font-mono font-bold text-purple-900">{ergebnis.details.pruefziffer}</span>
                  <span className="text-xs text-purple-600 block mt-1">ISO 7064 / Mod 97</span>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <span className="text-xs text-amber-600 font-medium block mb-1">Bankleitzahl</span>
                  <span className="text-xl font-mono font-bold text-amber-900">{ergebnis.details.blz}</span>
                  <span className="text-xs text-amber-600 block mt-1">8 Stellen</span>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <span className="text-xs text-emerald-600 font-medium block mb-1">Kontonummer</span>
                  <span className="text-xl font-mono font-bold text-emerald-900">{ergebnis.details.kontonummer}</span>
                  <span className="text-xs text-emerald-600 block mt-1">10 Stellen</span>
                </div>
              </div>

              {/* BIC & Bank */}
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-600 font-medium block mb-1">BIC / SWIFT</span>
                    <span className="text-lg font-mono font-bold text-gray-900">{ergebnis.details.bic}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-600 font-medium block mb-1">Bank</span>
                    <span className="text-sm font-medium text-gray-900">{ergebnis.details.bank}</span>
                  </div>
                </div>
              </div>

              {/* IBAN-Struktur Visualisierung */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <span className="text-sm font-medium text-gray-700 block mb-3">IBAN-Struktur (Deutschland)</span>
                <div className="flex text-center text-xs">
                  <div className="bg-blue-200 border-r border-white px-2 py-2 flex-shrink-0" style={{width: '9%'}}>
                    <span className="font-bold">DE</span>
                    <span className="block text-blue-700 mt-1">Land</span>
                  </div>
                  <div className="bg-purple-200 border-r border-white px-2 py-2 flex-shrink-0" style={{width: '9%'}}>
                    <span className="font-bold">{ergebnis.details.pruefziffer}</span>
                    <span className="block text-purple-700 mt-1">Prüf</span>
                  </div>
                  <div className="bg-amber-200 border-r border-white px-2 py-2" style={{width: '37%'}}>
                    <span className="font-bold font-mono">{ergebnis.details.blz}</span>
                    <span className="block text-amber-700 mt-1">Bankleitzahl</span>
                  </div>
                  <div className="bg-emerald-200 px-2 py-2" style={{width: '45%'}}>
                    <span className="font-bold font-mono">{ergebnis.details.kontonummer}</span>
                    <span className="block text-emerald-700 mt-1">Kontonummer</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info-Box */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <h4 className="font-semibold mb-2">💡 Gut zu wissen</h4>
        <ul className="space-y-1 text-blue-700">
          <li>• Deutsche IBANs haben immer 22 Zeichen</li>
          <li>• Die Prüfziffer wird nach ISO 7064 (Modulo 97) berechnet</li>
          <li>• Der BIC wird für SEPA-Überweisungen innerhalb der EU nicht mehr benötigt</li>
          <li>• Alte Kontonummern können durch Zusammenlegung ungültig werden</li>
        </ul>
      </div>
    </div>
  );
}
