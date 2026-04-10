import { useState, useMemo } from 'react';
import RechnerFeedback from './RechnerFeedback';

// Grundrente-Rechner 2026 - Quellen: Deutsche Rentenversicherung, BMAS
// Stand: Werte ab 01.01.2026
const GRUNDRENTE_2026 = {
  rentenwert: 40.79,           // € pro Entgeltpunkt (ab 01.07.2025)
  maxEntgeltpunkte: 0.8,       // Maximale Aufwertung auf 0,8 EP
  abzug: 0.125,                // 12,5% Abzug von der Aufwertung
  minGrundrentenzeiten: 33,    // Mindestens 33 Jahre
  maxGrundrentenzeiten: 35,    // Maximum 35 Jahre zählen
  
  // Einkommensgrenzen für Grundrentenzeiten (2026)
  minVerdienst: 1299,          // € brutto/Monat (30% des Durchschnitts)
  maxVerdienst: 3463,          // € brutto/Monat (80% des Durchschnitts)
  
  // Freibeträge für Einkommensprüfung (2026)
  freibetragAlleinstehend: 1492,  // € zu versteuerndes Einkommen/Monat (DRV 2026)
  freibetragPaar: 2327,           // € zu versteuerndes Einkommen/Monat (DRV 2026)
  
  // Anrechnungsstufen
  anrechnungsstufe1: 0.60,        // 60% werden angerechnet bis zur 2. Grenze
  stufe1Grenze: 417,              // € über Freibetrag (Alleinstehend): 1.909 - 1.492 = 417
  stufe1GrenzePaar: 417,          // € über Freibetrag (Paare): 2.744 - 2.327 = 417
};

interface GrundrenteErgebnis {
  hatAnspruch: boolean;
  grundrentenzeiten: number;
  durchschnittEP: number;
  aufwertungEP: number;
  zuschlagEPProJahr: number;
  zuschlagEPGesamt: number;
  bruttoZuschlag: number;
  freibetrag: number;
  einkommenUeberFreibetrag: number;
  anrechnung: number;
  nettoZuschlag: number;
  hinweise: string[];
}

function berechneHoechstwert(grundrentenzeiten: number): number {
  // Der Höchstwert steigt linear von 0,4 (bei 33 Jahren) auf 0,8 (bei 35 Jahren)
  if (grundrentenzeiten < 33) return 0;
  if (grundrentenzeiten >= 35) return 0.8;
  // Lineare Interpolation zwischen 33 und 35 Jahren
  const anteil = (grundrentenzeiten - 33) / 2;
  return 0.4 + (anteil * 0.4);
}

function berechneGrundrente(
  grundrentenzeiten: number,
  durchschnittEP: number,
  zvEinkommen: number,
  istVerheiratet: boolean
): GrundrenteErgebnis {
  const hinweise: string[] = [];
  
  // Voraussetzungen prüfen
  if (grundrentenzeiten < 33) {
    hinweise.push(`Sie benötigen mindestens 33 Grundrentenzeiten (Sie haben ${grundrentenzeiten}).`);
    return {
      hatAnspruch: false,
      grundrentenzeiten,
      durchschnittEP,
      aufwertungEP: 0,
      zuschlagEPProJahr: 0,
      zuschlagEPGesamt: 0,
      bruttoZuschlag: 0,
      freibetrag: istVerheiratet ? GRUNDRENTE_2026.freibetragPaar : GRUNDRENTE_2026.freibetragAlleinstehend,
      einkommenUeberFreibetrag: 0,
      anrechnung: 0,
      nettoZuschlag: 0,
      hinweise,
    };
  }
  
  // Höchstwert basierend auf Grundrentenzeiten
  const hoechstwert = berechneHoechstwert(grundrentenzeiten);
  
  // Prüfen ob EP im zulässigen Bereich (0,3 - 0,8)
  if (durchschnittEP >= hoechstwert) {
    hinweise.push(`Ihre durchschnittlichen Entgeltpunkte (${durchschnittEP.toFixed(2)}) liegen bereits über oder auf dem Höchstwert (${hoechstwert.toFixed(2)} EP). Kein Zuschlag möglich.`);
    return {
      hatAnspruch: false,
      grundrentenzeiten,
      durchschnittEP,
      aufwertungEP: 0,
      zuschlagEPProJahr: 0,
      zuschlagEPGesamt: 0,
      bruttoZuschlag: 0,
      freibetrag: istVerheiratet ? GRUNDRENTE_2026.freibetragPaar : GRUNDRENTE_2026.freibetragAlleinstehend,
      einkommenUeberFreibetrag: 0,
      anrechnung: 0,
      nettoZuschlag: 0,
      hinweise,
    };
  }
  
  if (durchschnittEP < 0.3) {
    hinweise.push(`Ihre durchschnittlichen Entgeltpunkte (${durchschnittEP.toFixed(2)}) liegen unter dem Mindestwert von 0,3 EP. Prüfen Sie Ihre Grundrentenzeiten.`);
  }
  
  // Berechnung der Aufwertung
  // Schritt 1: Verdopplung der durchschnittlichen EP
  const verdoppelt = durchschnittEP * 2;
  
  // Schritt 2: Begrenzen auf Höchstwert
  const begrenzt = Math.min(verdoppelt, hoechstwert);
  
  // Schritt 3: Differenz zum eigenen Durchschnitt = Aufwertung
  const aufwertungEP = Math.max(0, begrenzt - durchschnittEP);
  
  // Schritt 4: 12,5% Abzug
  const zuschlagEPProJahr = aufwertungEP * (1 - GRUNDRENTE_2026.abzug);
  
  // Schritt 5: Mit Grundrentenzeiten multiplizieren (max. 35)
  const relevanteJahre = Math.min(grundrentenzeiten, GRUNDRENTE_2026.maxGrundrentenzeiten);
  const zuschlagEPGesamt = zuschlagEPProJahr * relevanteJahre;
  
  // Schritt 6: In Euro umrechnen
  const bruttoZuschlag = zuschlagEPGesamt * GRUNDRENTE_2026.rentenwert;
  
  // Einkommensprüfung
  const freibetrag = istVerheiratet ? GRUNDRENTE_2026.freibetragPaar : GRUNDRENTE_2026.freibetragAlleinstehend;
  const stufe1Grenze = istVerheiratet ? GRUNDRENTE_2026.stufe1GrenzePaar : GRUNDRENTE_2026.stufe1Grenze;
  
  let anrechnung = 0;
  const einkommenUeberFreibetrag = Math.max(0, zvEinkommen - freibetrag);
  
  if (einkommenUeberFreibetrag > 0) {
    // Stufe 1: 60% Anrechnung bis zur Grenze
    const stufe1Betrag = Math.min(einkommenUeberFreibetrag, stufe1Grenze);
    anrechnung += stufe1Betrag * GRUNDRENTE_2026.anrechnungsstufe1;
    
    // Stufe 2: 100% Anrechnung darüber
    const stufe2Betrag = Math.max(0, einkommenUeberFreibetrag - stufe1Grenze);
    anrechnung += stufe2Betrag;
    
    if (einkommenUeberFreibetrag > 0) {
      hinweise.push(`Ihr Einkommen liegt ${einkommenUeberFreibetrag.toFixed(0)}€ über dem Freibetrag.`);
    }
  }
  
  const nettoZuschlag = Math.max(0, bruttoZuschlag - anrechnung);
  
  if (nettoZuschlag > 0) {
    hinweise.push(`Sie haben Anspruch auf Grundrente!`);
  } else if (bruttoZuschlag > 0 && nettoZuschlag === 0) {
    hinweise.push(`Durch die Einkommensprüfung wird der Zuschlag vollständig angerechnet.`);
  }
  
  if (grundrentenzeiten > 35) {
    hinweise.push(`Für den Zuschlag werden maximal 35 Jahre berücksichtigt.`);
  }
  
  return {
    hatAnspruch: nettoZuschlag > 0,
    grundrentenzeiten,
    durchschnittEP,
    aufwertungEP,
    zuschlagEPProJahr,
    zuschlagEPGesamt,
    bruttoZuschlag,
    freibetrag,
    einkommenUeberFreibetrag,
    anrechnung,
    nettoZuschlag,
    hinweise,
  };
}

export default function GrundrenteRechner() {
  const [grundrentenzeiten, setGrundrentenzeiten] = useState(35);
  const [durchschnittEP, setDurchschnittEP] = useState(0.4);
  const [zvEinkommen, setZvEinkommen] = useState(1200);
  const [istVerheiratet, setIstVerheiratet] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const ergebnis = useMemo(() => {
    return berechneGrundrente(grundrentenzeiten, durchschnittEP, zvEinkommen, istVerheiratet);
  }, [grundrentenzeiten, durchschnittEP, zvEinkommen, istVerheiratet]);

  const formatEuro = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Grundrentenzeiten */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Grundrentenzeiten (Jahre)</span>
            <span className="text-gray-500 text-sm block">
              Pflichtbeitragszeiten mit 30-80% des Durchschnittsverdienstes, Kindererziehung, Pflege
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={50}
              value={grundrentenzeiten}
              onChange={(e) => setGrundrentenzeiten(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <input
              type="number"
              value={grundrentenzeiten}
              onChange={(e) => setGrundrentenzeiten(Math.max(0, Math.min(50, Number(e.target.value))))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 Jahre</span>
            <span className={grundrentenzeiten >= 33 ? 'text-green-600 font-medium' : 'text-red-500'}>
              Min. 33 Jahre
            </span>
            <span className="text-purple-600 font-medium">Max. 35 zählen</span>
          </div>
        </div>

        {/* Durchschnittliche Entgeltpunkte */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Durchschnittliche Entgeltpunkte pro Jahr</span>
            <span className="text-gray-500 text-sm block">
              Aus der Renteninformation oder eigene Schätzung (0,3 = 30%, 0,8 = 80% des Durchschnitts)
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.01}
              value={durchschnittEP}
              onChange={(e) => setDurchschnittEP(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <input
              type="number"
              step={0.01}
              value={durchschnittEP}
              onChange={(e) => setDurchschnittEP(Math.max(0.1, Math.min(1.0, Number(e.target.value))))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0,1 EP</span>
            <span className={durchschnittEP >= 0.3 && durchschnittEP <= 0.8 ? 'text-green-600 font-medium' : 'text-orange-500'}>
              Optimal: 0,3 - 0,8 EP
            </span>
            <span>1,0 EP</span>
          </div>
        </div>

        {/* Familienstand */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Familienstand</span>
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setIstVerheiratet(false)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                !istVerheiratet
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="block text-lg mb-1">👤</span>
              <span className="font-medium">Alleinstehend</span>
              <span className="block text-xs text-gray-500">Freibetrag: {GRUNDRENTE_2026.freibetragAlleinstehend}€</span>
            </button>
            <button
              onClick={() => setIstVerheiratet(true)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                istVerheiratet
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="block text-lg mb-1">👫</span>
              <span className="font-medium">Verheiratet / Partner</span>
              <span className="block text-xs text-gray-500">Freibetrag: {GRUNDRENTE_2026.freibetragPaar}€</span>
            </button>
          </div>
        </div>

        {/* Zu versteuerndes Einkommen */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Zu versteuerndes Einkommen (€/Monat)</span>
            <span className="text-gray-500 text-sm block">
              Inkl. Rente, Betriebsrente, Mieteinnahmen etc. (aus dem Steuerbescheid)
            </span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={3000}
              step={50}
              value={zvEinkommen}
              onChange={(e) => setZvEinkommen(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="relative">
              <input
                type="number"
                value={zvEinkommen}
                onChange={(e) => setZvEinkommen(Math.max(0, Number(e.target.value)))}
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <span className={zvEinkommen <= ergebnis.freibetrag ? 'text-green-600 font-medium' : 'text-orange-500'}>
              Freibetrag: {formatEuro(ergebnis.freibetrag)}
            </span>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className={`rounded-2xl shadow-lg p-6 mb-6 ${
        ergebnis.hatAnspruch 
          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' 
          : ergebnis.bruttoZuschlag > 0 
            ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white'
            : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
      }`}>
        <div className="text-center mb-4">
          <p className="text-sm opacity-90 mb-1">Ihr monatlicher Grundrentenzuschlag</p>
          <p className="text-5xl font-bold">{formatEuro(ergebnis.nettoZuschlag)}</p>
          {ergebnis.bruttoZuschlag > ergebnis.nettoZuschlag && ergebnis.bruttoZuschlag > 0 && (
            <p className="text-sm opacity-75 mt-2">
              (vor Einkommensanrechnung: {formatEuro(ergebnis.bruttoZuschlag)})
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/20 rounded-lg p-3">
            <p className="opacity-75">Zuschlag-EP (gesamt)</p>
            <p className="text-xl font-bold">{ergebnis.zuschlagEPGesamt.toFixed(4)}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="opacity-75">Jährlich mehr</p>
            <p className="text-xl font-bold">{formatEuro(ergebnis.nettoZuschlag * 12)}</p>
          </div>
        </div>
        
        {ergebnis.hinweise.length > 0 && (
          <div className="mt-4 bg-white/10 rounded-lg p-3">
            {ergebnis.hinweise.map((hinweis, i) => (
              <p key={i} className="text-sm flex items-start gap-2">
                <span>{ergebnis.hatAnspruch ? '✅' : ergebnis.bruttoZuschlag > 0 ? '⚠️' : 'ℹ️'}</span>
                <span>{hinweis}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Berechnungsdetails */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="font-semibold text-gray-800">📊 Berechnungsdetails</span>
          <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {showDetails && (
          <div className="mt-4 space-y-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Schritt 1: Aufwertung berechnen</h4>
              <div className="space-y-1 text-gray-600">
                <p>Durchschnittliche EP: <strong>{ergebnis.durchschnittEP.toFixed(2)}</strong></p>
                <p>× 2 (Verdopplung) = <strong>{(ergebnis.durchschnittEP * 2).toFixed(2)}</strong></p>
                <p>Begrenzt auf Höchstwert ({berechneHoechstwert(grundrentenzeiten).toFixed(2)} EP)</p>
                <p>Aufwertung: <strong>{ergebnis.aufwertungEP.toFixed(4)} EP</strong></p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Schritt 2: Zuschlag-EP berechnen</h4>
              <div className="space-y-1 text-gray-600">
                <p>Aufwertung: {ergebnis.aufwertungEP.toFixed(4)} EP</p>
                <p>− 12,5% Abzug = <strong>{ergebnis.zuschlagEPProJahr.toFixed(4)} EP/Jahr</strong></p>
                <p>× {Math.min(grundrentenzeiten, 35)} Jahre = <strong>{ergebnis.zuschlagEPGesamt.toFixed(4)} EP</strong></p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Schritt 3: In Euro umrechnen</h4>
              <div className="space-y-1 text-gray-600">
                <p>{ergebnis.zuschlagEPGesamt.toFixed(4)} EP × {GRUNDRENTE_2026.rentenwert}€</p>
                <p>= <strong>{formatEuro(ergebnis.bruttoZuschlag)}</strong> brutto/Monat</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Schritt 4: Einkommensprüfung</h4>
              <div className="space-y-1 text-gray-600">
                <p>Zu versteuerndes Einkommen: {formatEuro(zvEinkommen)}</p>
                <p>Freibetrag ({istVerheiratet ? 'Paar' : 'Alleinstehend'}): {formatEuro(ergebnis.freibetrag)}</p>
                <p>Überschreitung: {formatEuro(ergebnis.einkommenUeberFreibetrag)}</p>
                <p>Anrechnung: <strong>{formatEuro(ergebnis.anrechnung)}</strong></p>
                <p className="pt-2 border-t border-gray-200 font-semibold">
                  Netto-Zuschlag: {formatEuro(ergebnis.nettoZuschlag)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info-Box */}
      <div className="bg-purple-50 rounded-2xl p-6 mt-6">
        <h3 className="font-semibold text-purple-800 mb-3">ℹ️ Was sind Grundrentenzeiten?</h3>
        <ul className="text-sm text-purple-700 space-y-2">
          <li>• <strong>Pflichtbeitragszeiten</strong> mit 30-80% des Durchschnittslohns (2026: {GRUNDRENTE_2026.minVerdienst}€ - {GRUNDRENTE_2026.maxVerdienst}€ brutto/Monat)</li>
          <li>• <strong>Kindererziehungszeiten</strong> (bis zum 10. Lebensjahr des Kindes)</li>
          <li>• <strong>Pflegezeiten</strong> (nicht erwerbsmäßige Pflege)</li>
          <li>• <strong>Zeiten mit Leistungsbezug</strong> bei Krankheit oder Rehabilitation</li>
        </ul>
        <p className="text-sm text-purple-600 mt-3">
          💡 Die Grundrente wird automatisch geprüft und ausgezahlt – kein Antrag nötig!
        </p>
      <RechnerFeedback rechnerName="Grundrente-Rechner 2025 & 2026" rechnerSlug="grundrente-rechner" />
      </div>
    </div>
  );
}
